const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const crypto = require('crypto');

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_ke',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper: Award XP with achievement check
async function awardXPWithAchievements(userId, amount, source_type, source_id, description, connection = null) {
  const conn = connection || await pool.getConnection();

  try {
    // Record XP transaction
    await conn.query(`
      INSERT INTO user_xp_transactions (user_id, amount, source_type, source_id, description)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, amount, source_type, source_id, description]);

    // Update user progress
    const [result] = await conn.query(`
      INSERT INTO user_learning_progress (user_id, total_xp, last_activity)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        total_xp = total_xp + ?,
        level = FLOOR((total_xp + ?) / 100) + 1,
        last_activity = NOW()
    `, [userId, amount, amount, amount]);

    // Get updated progress
    const [[progress]] = await conn.query(`
      SELECT * FROM user_learning_progress WHERE user_id = ?
    `, [userId]);

    // Check for achievements
    await checkAndAwardAchievements(userId, progress, conn);

    if (!connection) conn.release();
    return progress;
  } catch (error) {
    if (!connection) conn.release();
    throw error;
  }
}

// Helper: Check and award achievements
async function checkAndAwardAchievements(userId, progress, connection = null) {
  const conn = connection || await pool.getConnection();

  try {
    // Get all achievements user hasn't earned
    const [pendingAchievements] = await conn.query(`
      SELECT a.* FROM learning_achievements a
      LEFT JOIN user_learning_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
      WHERE ua.id IS NULL
    `, [userId]);

    const earnedAchievements = [];

    for (const achievement of pendingAchievements) {
      let earned = false;

      switch (achievement.criteria_type) {
        case 'lessons_completed':
          earned = progress.lessons_completed >= achievement.criteria_value;
          break;
        case 'quizzes_passed':
          earned = progress.quizzes_passed >= achievement.criteria_value;
          break;
        case 'total_xp':
          earned = progress.total_xp >= achievement.criteria_value;
          break;
        case 'streak_days':
          const [[streak]] = await conn.query(`
            SELECT current_streak FROM user_learning_streaks WHERE user_id = ?
          `, [userId]);
          earned = streak && streak.current_streak >= achievement.criteria_value;
          break;
        case 'modules_completed':
          earned = progress.modules_completed >= achievement.criteria_value;
          break;
      }

      if (earned) {
        // Award achievement
        await conn.query(`
          INSERT INTO user_learning_achievements (user_id, achievement_id, progress_value)
          VALUES (?, ?, ?)
        `, [userId, achievement.id, achievement.criteria_value]);

        // Award bonus XP
        if (achievement.xp_reward > 0) {
          await conn.query(`
            INSERT INTO user_xp_transactions (user_id, amount, source_type, source_id, description)
            VALUES (?, ?, ?, ?, ?)
          `, [userId, achievement.xp_reward, 'achievement', achievement.id, `Earned achievement: ${achievement.title}`]);

          await conn.query(`
            UPDATE user_learning_progress
            SET total_xp = total_xp + ?,
                level = FLOOR((total_xp + ?) / 100) + 1,
                achievements_earned = achievements_earned + 1
            WHERE user_id = ?
          `, [achievement.xp_reward, achievement.xp_reward, userId]);
        }

        earnedAchievements.push(achievement);
      }
    }

    if (!connection) conn.release();
    return earnedAchievements;
  } catch (error) {
    if (!connection) conn.release();
    throw error;
  }
}

// ============================================
// DAILY CHALLENGES
// ============================================

// Get today's challenge
router.get('/challenges/today', async (req, res) => {
  try {
    const userId = req.user?.id;
    const today = new Date().toISOString().split('T')[0];

    // Get or create today's challenge
    let [[challenge]] = await pool.query(`
      SELECT dc.*, q.title as quiz_title, q.description as quiz_description
      FROM learning_daily_challenges dc
      JOIN learning_quizzes q ON dc.quiz_id = q.id
      WHERE dc.challenge_date = ? AND dc.is_active = true
    `, [today]);

    if (!challenge) {
      // No challenge today - create one from available quizzes
      const [[randomQuiz]] = await pool.query(`
        SELECT id FROM learning_quizzes
        WHERE quiz_type = 'daily_challenge' OR quiz_type = 'module'
        ORDER BY RAND()
        LIMIT 1
      `);

      if (randomQuiz) {
        await pool.query(`
          INSERT INTO learning_daily_challenges (challenge_date, quiz_id, xp_reward, is_active)
          VALUES (?, ?, 100, true)
        `, [today, randomQuiz.id]);

        [[challenge]] = await pool.query(`
          SELECT dc.*, q.title as quiz_title, q.description as quiz_description
          FROM learning_daily_challenges dc
          JOIN learning_quizzes q ON dc.quiz_id = q.id
          WHERE dc.challenge_date = ? AND dc.is_active = true
        `, [today]);
      }
    }

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'No challenge available today' });
    }

    // Check if user has completed today's challenge
    let userStatus = { completed: false, score: null };
    if (userId) {
      const [[attempt]] = await pool.query(`
        SELECT * FROM user_daily_challenge_attempts
        WHERE user_id = ? AND challenge_id = ?
      `, [userId, challenge.id]);

      if (attempt) {
        userStatus = {
          completed: true,
          score: attempt.score,
          timeCompleted: attempt.time_taken,
          percentage: attempt.percentage
        };
      }
    }

    // Get questions (without answers)
    const [questions] = await pool.query(`
      SELECT id, question_text, options, points, display_order
      FROM learning_quiz_questions
      WHERE quiz_id = ?
      ORDER BY display_order, id
    `, [challenge.quiz_id]);

    res.json({
      success: true,
      challenge: {
        ...challenge,
        questions,
        userStatus
      }
    });
  } catch (error) {
    console.error('Error fetching daily challenge:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch challenge', error: error.message });
  }
});

// Submit daily challenge
router.post('/challenges/:challengeId/attempt', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { challengeId } = req.params;
    const userId = req.user?.id;
    const { answers, timeCompleted } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    await connection.beginTransaction();

    // Check if already completed
    const [[existing]] = await connection.query(`
      SELECT id FROM user_daily_challenge_attempts WHERE user_id = ? AND challenge_id = ?
    `, [userId, challengeId]);

    if (existing) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Challenge already completed today' });
    }

    // Get challenge and questions
    const [[challenge]] = await connection.query(`
      SELECT * FROM learning_daily_challenges WHERE id = ?
    `, [challengeId]);

    const [questions] = await connection.query(`
      SELECT * FROM learning_quiz_questions WHERE quiz_id = ?
    `, [challenge.quiz_id]);

    // Calculate score
    let score = 0;
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (question && answer.selectedAnswer === question.correct_answer_index) {
        score += question.points;
      }
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score / totalPoints) * 100);

    // Save attempt
    await connection.query(`
      INSERT INTO user_daily_challenge_attempts (user_id, challenge_id, score, max_score, time_taken, answers)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, challengeId, score, totalPoints, timeCompleted, JSON.stringify(answers)]);

    // Award XP and check achievements
    const progress = await awardXPWithAchievements(
      userId,
      challenge.xp_reward,
      'daily_challenge',
      challengeId,
      'Completed daily challenge',
      connection
    );

    // Update streak
    const [[streak]] = await connection.query(`
      SELECT * FROM user_learning_streaks WHERE user_id = ?
    `, [userId]);

    const today = new Date().toISOString().split('T')[0];
    let newStreak = 1;

    if (streak) {
      const lastActivity = new Date(streak.last_activity_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastActivity) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = streak.current_streak + 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      } else {
        newStreak = streak.current_streak;
      }

      await connection.query(`
        UPDATE user_learning_streaks
        SET current_streak = ?,
            longest_streak = GREATEST(longest_streak, ?),
            last_activity_date = ?
        WHERE user_id = ?
      `, [newStreak, newStreak, today, userId]);
    } else {
      await connection.query(`
        INSERT INTO user_learning_streaks (user_id, current_streak, longest_streak, last_activity_date)
        VALUES (?, 1, 1, ?)
      `, [userId, today]);
    }

    await connection.commit();

    res.json({
      success: true,
      score,
      percentage: Math.round(percentage),
      xpEarned: challenge.xp_reward,
      currentStreak: newStreak
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting challenge:', error);
    res.status(500).json({ success: false, message: 'Failed to submit challenge', error: error.message });
  } finally {
    connection.release();
  }
});

// Get challenge leaderboard
router.get('/challenges/:challengeId/leaderboard', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { limit = 100 } = req.query;

    const [leaderboard] = await pool.query(`
      SELECT
        uca.user_id,
        uca.score,
        uca.time_taken,
        uca.percentage,
        uls.current_streak,
        @user_rank := @user_rank + 1 as \`rank\`
      FROM user_daily_challenge_attempts uca
      LEFT JOIN user_learning_streaks uls ON uca.user_id = uls.user_id
      CROSS JOIN (SELECT @user_rank := 0) r
      WHERE uca.challenge_id = ?
      ORDER BY uca.score DESC, uca.time_taken ASC
      LIMIT ?
    `, [challengeId, parseInt(limit)]);

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error fetching challenge leaderboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard', error: error.message });
  }
});

// Get user streak info
router.get('/challenges/streak', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const [[streak]] = await pool.query(`
      SELECT * FROM user_learning_streaks WHERE user_id = ?
    `, [userId]);

    res.json({
      success: true,
      streak: streak || {
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null
      }
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch streak', error: error.message });
  }
});

// ============================================
// LEARNING PATHS
// ============================================

// Get all learning paths
router.get('/paths', async (req, res) => {
  try {
    const userId = req.user?.id;

    const query = `
      SELECT
        p.*,
        COUNT(DISTINCT lpm.module_id) as total_modules
        ${userId ? ', ulp.progress_percentage, ulp.enrolled_at, ulp.completed_at' : ''}
      FROM learning_paths p
      LEFT JOIN learning_path_modules lpm ON p.id = lpm.path_id
      ${userId ? 'LEFT JOIN user_learning_paths ulp ON p.id = ulp.path_id AND ulp.user_id = ?' : ''}
      WHERE p.is_published = true
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    const [paths] = await pool.query(query, userId ? [userId] : []);

    res.json({ success: true, paths });
  } catch (error) {
    console.error('Error fetching paths:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch paths', error: error.message });
  }
});

// Get learning path details
router.get('/paths/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const [[path]] = await pool.query(`
      SELECT
        p.*
        ${userId ? ', ulp.progress_percentage, ulp.enrolled_at, ulp.completed_at' : ''}
      FROM learning_paths p
      ${userId ? 'LEFT JOIN user_learning_paths ulp ON p.id = ulp.path_id AND ulp.user_id = ?' : ''}
      WHERE p.id = ? AND p.is_published = true
    `, userId ? [userId, id] : [id]);

    if (!path) {
      return res.status(404).json({ success: false, message: 'Learning path not found' });
    }

    // Get modules in path
    const [modules] = await pool.query(`
      SELECT
        m.*,
        lpm.display_order,
        lpm.prerequisites
        ${userId ? ', ulm.progress_percentage, ulm.completed_at' : ''}
      FROM learning_path_modules lpm
      JOIN learning_modules m ON lpm.module_id = m.id
      ${userId ? 'LEFT JOIN user_learning_modules ulm ON m.id = ulm.module_id AND ulm.user_id = ?' : ''}
      WHERE lpm.path_id = ?
      ORDER BY lpm.display_order
    `, userId ? [userId, id] : [id]);

    res.json({ success: true, path: { ...path, modules } });
  } catch (error) {
    console.error('Error fetching path:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch path', error: error.message });
  }
});

// Enroll in learning path
router.post('/paths/:id/enroll', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    await pool.query(`
      INSERT INTO user_learning_paths (user_id, path_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE enrolled_at = enrolled_at
    `, [userId, id]);

    res.json({ success: true, message: 'Enrolled in learning path' });
  } catch (error) {
    console.error('Error enrolling in path:', error);
    res.status(500).json({ success: false, message: 'Failed to enroll', error: error.message });
  }
});

// Get path progress
router.get('/paths/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Get total modules in path
    const [[pathInfo]] = await pool.query(`
      SELECT COUNT(*) as total_modules FROM learning_path_modules WHERE path_id = ?
    `, [id]);

    // Get completed modules
    const [[completedInfo]] = await pool.query(`
      SELECT COUNT(*) as completed_modules
      FROM learning_path_modules lpm
      JOIN user_learning_modules ulm ON lpm.module_id = ulm.module_id
      WHERE lpm.path_id = ? AND ulm.user_id = ? AND ulm.completed_at IS NOT NULL
    `, [id, userId]);

    const percentage = Math.round((completedInfo.completed_modules / pathInfo.total_modules) * 100);

    // Update path progress
    await pool.query(`
      INSERT INTO user_learning_paths (user_id, path_id, progress_percentage)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        progress_percentage = ?,
        completed_at = IF(? = 100, NOW(), NULL)
    `, [userId, id, percentage, percentage, percentage]);

    res.json({
      success: true,
      progress: {
        total_modules: pathInfo.total_modules,
        completed_modules: completedInfo.completed_modules,
        percentage
      }
    });
  } catch (error) {
    console.error('Error fetching path progress:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch progress', error: error.message });
  }
});

// ============================================
// CERTIFICATES
// ============================================

// Get user certificates
router.get('/certificates', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const [certificates] = await pool.query(`
      SELECT
        c.*,
        m.title as module_title,
        p.title as path_title
      FROM learning_certificates c
      LEFT JOIN learning_modules m ON c.module_id = m.id
      LEFT JOIN learning_paths p ON c.path_id = p.id
      WHERE c.user_id = ? AND c.is_revoked = false
      ORDER BY c.issued_at DESC
    `, [userId]);

    res.json({ success: true, certificates });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certificates', error: error.message });
  }
});

// Get single certificate
router.get('/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const [[certificate]] = await pool.query(`
      SELECT
        c.*,
        m.title as module_title,
        m.description as module_description,
        p.title as path_title,
        p.description as path_description
      FROM learning_certificates c
      LEFT JOIN learning_modules m ON c.module_id = m.id
      LEFT JOIN learning_paths p ON c.path_id = p.id
      WHERE c.id = ? AND c.user_id = ? AND c.is_revoked = false
    `, [id, userId]);

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.json({ success: true, certificate });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certificate', error: error.message });
  }
});

// Verify certificate (public endpoint)
router.get('/certificates/verify/:credentialId', async (req, res) => {
  try {
    const { credentialId } = req.params;

    const [[certificate]] = await pool.query(`
      SELECT
        c.id,
        c.title,
        c.issued_at,
        c.expires_at,
        c.is_revoked,
        m.title as module_title,
        p.title as path_title
      FROM learning_certificates c
      LEFT JOIN learning_modules m ON c.module_id = m.id
      LEFT JOIN learning_paths p ON c.path_id = p.id
      WHERE c.credential_id = ?
    `, [credentialId]);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
        valid: false
      });
    }

    const isExpired = certificate.expires_at && new Date(certificate.expires_at) < new Date();
    const isValid = !certificate.is_revoked && !isExpired;

    res.json({
      success: true,
      valid: isValid,
      certificate: {
        ...certificate,
        expired: isExpired
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ success: false, message: 'Failed to verify certificate', error: error.message });
  }
});

// Auto-issue certificate on module completion (internal function)
async function issueCertificate(userId, moduleId = null, pathId = null, connection = null) {
  const conn = connection || await pool.getConnection();

  try {
    let title, skills = [];

    if (moduleId) {
      const [[module]] = await conn.query('SELECT * FROM learning_modules WHERE id = ?', [moduleId]);
      title = `Certificate of Completion: ${module.title}`;
      skills = [module.category];
    } else if (pathId) {
      const [[path]] = await conn.query('SELECT * FROM learning_paths WHERE id = ?', [pathId]);
      title = `Certificate of Completion: ${path.title}`;

      // Get all module categories in path
      const [modules] = await conn.query(`
        SELECT DISTINCT m.category
        FROM learning_path_modules lpm
        JOIN learning_modules m ON lpm.module_id = m.id
        WHERE lpm.path_id = ?
      `, [pathId]);

      skills = modules.map(m => m.category);
    }

    // Generate unique credential ID
    const credentialId = `CERT-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    // Issue certificate (valid for 2 years)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2);

    await conn.query(`
      INSERT INTO learning_certificates
      (user_id, module_id, path_id, credential_id, title, expires_at, skills)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, moduleId, pathId, credentialId, title, expiresAt, JSON.stringify(skills)]);

    if (!connection) conn.release();
    return credentialId;
  } catch (error) {
    if (!connection) conn.release();
    throw error;
  }
}

// ============================================
// ACHIEVEMENTS
// ============================================

// Get all achievements
router.get('/achievements', async (req, res) => {
  try {
    const userId = req.user?.id;

    const query = `
      SELECT
        a.*
        ${userId ? ', ua.earned_at, ua.progress_value, CASE WHEN ua.id IS NOT NULL THEN true ELSE false END as earned' : ', false as earned'}
      FROM learning_achievements a
      ${userId ? 'LEFT JOIN user_learning_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?' : ''}
      ORDER BY a.rarity DESC, a.criteria_value ASC
    `;

    const [achievements] = await pool.query(query, userId ? [userId] : []);

    // Calculate progress for unearned achievements
    if (userId) {
      const [[progress]] = await pool.query(`
        SELECT * FROM user_learning_progress WHERE user_id = ?
      `, [userId]);

      const [[streak]] = await pool.query(`
        SELECT current_streak FROM user_learning_streaks WHERE user_id = ?
      `, [userId]);

      for (const achievement of achievements) {
        if (!achievement.earned) {
          let currentValue = 0;

          switch (achievement.criteria_type) {
            case 'lessons_completed':
              currentValue = progress?.lessons_completed || 0;
              break;
            case 'quizzes_passed':
              currentValue = progress?.quizzes_passed || 0;
              break;
            case 'total_xp':
              currentValue = progress?.total_xp || 0;
              break;
            case 'streak_days':
              currentValue = streak?.current_streak || 0;
              break;
            case 'modules_completed':
              currentValue = progress?.modules_completed || 0;
              break;
          }

          achievement.progress_percentage = Math.min(100, Math.round((currentValue / achievement.criteria_value) * 100));
          achievement.current_value = currentValue;
        }
      }
    }

    res.json({ success: true, achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch achievements', error: error.message });
  }
});

// Get achievement progress
router.get('/achievements/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const [[achievement]] = await pool.query(`
      SELECT * FROM learning_achievements WHERE id = ?
    `, [id]);

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    const [[progress]] = await pool.query(`
      SELECT * FROM user_learning_progress WHERE user_id = ?
    `, [userId]);

    const [[streak]] = await pool.query(`
      SELECT current_streak FROM user_learning_streaks WHERE user_id = ?
    `, [userId]);

    let currentValue = 0;

    switch (achievement.criteria_type) {
      case 'lessons_completed':
        currentValue = progress?.lessons_completed || 0;
        break;
      case 'quizzes_passed':
        currentValue = progress?.quizzes_passed || 0;
        break;
      case 'total_xp':
        currentValue = progress?.total_xp || 0;
        break;
      case 'streak_days':
        currentValue = streak?.current_streak || 0;
        break;
      case 'modules_completed':
        currentValue = progress?.modules_completed || 0;
        break;
    }

    const percentage = Math.min(100, Math.round((currentValue / achievement.criteria_value) * 100));

    res.json({
      success: true,
      progress: {
        current_value: currentValue,
        required_value: achievement.criteria_value,
        percentage
      }
    });
  } catch (error) {
    console.error('Error fetching achievement progress:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch progress', error: error.message });
  }
});

module.exports = router;
module.exports.issueCertificate = issueCertificate;
module.exports.awardXPWithAchievements = awardXPWithAchievements;
module.exports.checkAndAwardAchievements = checkAndAwardAchievements;
