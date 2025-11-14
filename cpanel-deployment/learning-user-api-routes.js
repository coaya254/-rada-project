const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

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

// Helper function to award XP
async function awardXP(userId, amount, source_type, source_id, description, connection = null) {
  const conn = connection || await pool.getConnection();
  try {
    // Record transaction
    await conn.query(`
      INSERT INTO user_xp_transactions (user_id, amount, source_type, source_id, description)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, amount, source_type, source_id, description]);

    // Update user progress
    await conn.query(`
      INSERT INTO user_learning_progress (user_id, total_xp, last_activity)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        total_xp = total_xp + ?,
        level = FLOOR(total_xp / 100) + 1,
        last_activity = NOW()
    `, [userId, amount, amount]);

    if (!connection) conn.release();
    return true;
  } catch (error) {
    if (!connection) conn.release();
    throw error;
  }
}

// Helper function to update streak
async function updateStreak(userId, connection = null) {
  const conn = connection || await pool.getConnection();
  try {
    const [streaks] = await conn.query(`
      SELECT * FROM user_learning_streaks WHERE user_id = ?
    `, [userId]);

    const today = new Date().toISOString().split('T')[0];

    if (streaks.length === 0) {
      // Create new streak
      await conn.query(`
        INSERT INTO user_learning_streaks (user_id, current_streak, longest_streak, last_activity_date)
        VALUES (?, 1, 1, ?)
      `, [userId, today]);
    } else {
      const streak = streaks[0];
      const lastActivity = new Date(streak.last_activity_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastActivity) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day, no change
      } else if (diffDays === 1) {
        // Continue streak
        const newStreak = streak.current_streak + 1;
        const newLongest = Math.max(newStreak, streak.longest_streak);
        await conn.query(`
          UPDATE user_learning_streaks
          SET current_streak = ?, longest_streak = ?, last_activity_date = ?
          WHERE user_id = ?
        `, [newStreak, newLongest, today, userId]);
      } else {
        // Break streak
        await conn.query(`
          UPDATE user_learning_streaks
          SET current_streak = 1, last_activity_date = ?
          WHERE user_id = ?
        `, [today, userId]);
      }
    }

    if (!connection) conn.release();
  } catch (error) {
    if (!connection) conn.release();
    throw error;
  }
}

// ============================================
// MODULES - User Facing
// ============================================

// Get all modules (with user progress)
router.get('/modules', async (req, res) => {
  try {
    // For development: use Jay's user ID (34) if no auth
    const userId = req.user?.id || 34;
    const { category, difficulty, search } = req.query;

    let query = `
      SELECT
        m.*,
        COUNT(DISTINCT l.id) as total_lessons
        ${userId ? ', um.progress_percentage, um.enrolled_at, um.completed_at' : ''}
      FROM learning_modules m
      LEFT JOIN learning_lessons l ON m.id = l.module_id
      ${userId ? 'LEFT JOIN user_learning_modules um ON m.id = um.module_id AND um.user_id = ?' : ''}
      WHERE m.is_published = true
    `;

    const params = userId ? [userId] : [];

    if (category) {
      query += ' AND m.category = ?';
      params.push(category);
    }

    if (difficulty) {
      query += ' AND m.difficulty = ?';
      params.push(difficulty);
    }

    if (search) {
      query += ' AND (m.title LIKE ? OR m.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY m.id ORDER BY m.display_order, m.created_at DESC';

    const [modules] = await pool.query(query, params);

    res.json({ success: true, modules });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch modules', error: error.message });
  }
});

// Get module details with lessons
router.get('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // For development: use Jay's user ID (34) if no auth
    const userId = req.user?.id || 34;

    const [[module]] = await pool.query(`
      SELECT
        m.*
        ${userId ? ', um.progress_percentage, um.enrolled_at, um.completed_at' : ''}
      FROM learning_modules m
      ${userId ? 'LEFT JOIN user_learning_modules um ON m.id = um.module_id AND um.user_id = ?' : ''}
      WHERE m.id = ? AND m.is_published = true
    `, userId ? [userId, id] : [id]);

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Get lessons (only published ones for users)
    const [lessons] = await pool.query(`
      SELECT
        l.*
        ${userId ? ', ul.completed_at, ul.time_spent_minutes' : ''}
      FROM learning_lessons l
      ${userId ? 'LEFT JOIN user_learning_lessons ul ON l.id = ul.lesson_id AND ul.user_id = ?' : ''}
      WHERE l.module_id = ? AND l.is_published = 1
      ORDER BY l.display_order, l.id
    `, userId ? [userId, id] : [id]);

    // Get module quiz (quiz_type = 'module')
    const [moduleQuizzes] = await pool.query(`
      SELECT
        q.*,
        COUNT(qq.id) as question_count
        ${userId ? ', MAX(uq.score) as score, MAX(uq.submitted_at) as submitted_at' : ''}
      FROM learning_quizzes q
      LEFT JOIN learning_quiz_questions qq ON q.id = qq.quiz_id
      ${userId ? 'LEFT JOIN user_quiz_attempts uq ON q.id = uq.quiz_id AND uq.user_id = ?' : ''}
      WHERE q.module_id = ? AND q.quiz_type = 'module'
      GROUP BY q.id
      ORDER BY q.created_at
    `, userId ? [userId, id] : [id]);

    res.json({
      success: true,
      module: {
        ...module,
        lessons: lessons,
        moduleQuiz: moduleQuizzes[0] || null
      }
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch module', error: error.message });
  }
});

// Enroll in module
router.post('/modules/:id/enroll', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    await pool.query(`
      INSERT INTO user_learning_modules (user_id, module_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE enrolled_at = enrolled_at
    `, [userId, id]);

    res.json({ success: true, message: 'Enrolled successfully' });
  } catch (error) {
    console.error('Error enrolling in module:', error);
    res.status(500).json({ success: false, message: 'Failed to enroll', error: error.message });
  }
});

// ============================================
// LESSONS - User Facing
// ============================================

// Get lesson details
router.get('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const [[lesson]] = await pool.query(`
      SELECT
        l.*
        ${userId ? ', ul.completed_at, ul.started_at, ul.time_spent_minutes' : ''}
      FROM learning_lessons l
      ${userId ? 'LEFT JOIN user_learning_lessons ul ON l.id = ul.lesson_id AND ul.user_id = ?' : ''}
      WHERE l.id = ?
    `, userId ? [userId, id] : [id]);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Get next and previous lessons
    const [siblings] = await pool.query(`
      SELECT id, title, display_order
      FROM learning_lessons
      WHERE module_id = ?
      ORDER BY display_order, id
    `, [lesson.module_id]);

    const currentIndex = siblings.findIndex(s => s.id === parseInt(id));
    const nextLesson = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;
    const previousLesson = currentIndex > 0 ? siblings[currentIndex - 1] : null;

    res.json({
      success: true,
      lesson: {
        ...lesson,
        nextLesson,
        previousLesson
      }
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lesson', error: error.message });
  }
});

// Mark lesson complete
router.post('/lessons/:id/complete', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    // For development: use Jay's user ID (34) if no auth
    const userId = req.user?.id || 34;

    // Temporarily disabled for development
    // if (!userId) {
    //   return res.status(401).json({ success: false, message: 'Authentication required' });
    // }

    await connection.beginTransaction();

    // Get lesson details
    const [[lesson]] = await connection.query('SELECT * FROM learning_lessons WHERE id = ?', [id]);

    if (!lesson) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Mark lesson complete
    await connection.query(`
      INSERT INTO user_learning_lessons (user_id, lesson_id, completed_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE completed_at = NOW()
    `, [userId, id]);

    // Award XP
    await awardXP(userId, lesson.xp_reward, 'lesson', id, `Completed lesson: ${lesson.title}`, connection);

    // Update streak
    await updateStreak(userId, connection);

    // Update module progress
    const [[modulProgress]] = await connection.query(`
      SELECT
        COUNT(*) as total_lessons,
        SUM(CASE WHEN ul.completed_at IS NOT NULL THEN 1 ELSE 0 END) as completed_lessons
      FROM learning_lessons l
      LEFT JOIN user_learning_lessons ul ON l.id = ul.lesson_id AND ul.user_id = ?
      WHERE l.module_id = ?
    `, [userId, lesson.module_id]);

    const progressPercentage = Math.round((modulProgress.completed_lessons / modulProgress.total_lessons) * 100);

    await connection.query(`
      INSERT INTO user_learning_modules (user_id, module_id, progress_percentage, started_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        progress_percentage = ?,
        started_at = COALESCE(started_at, NOW()),
        completed_at = IF(? = 100, NOW(), NULL)
    `, [userId, lesson.module_id, progressPercentage, progressPercentage, progressPercentage]);

    // Update user stats
    await connection.query(`
      UPDATE user_learning_progress
      SET lessons_completed = lessons_completed + 1,
          hours_spent = hours_spent + (? / 60)
      WHERE user_id = ?
    `, [lesson.duration_minutes, userId]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Lesson completed',
      xpEarned: lesson.xp_reward,
      progressPercentage
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error completing lesson:', error);
    res.status(500).json({ success: false, message: 'Failed to complete lesson', error: error.message });
  } finally {
    connection.release();
  }
});

// ============================================
// QUIZZES - User Facing
// ============================================

// Get quiz details (without correct answers)
router.get('/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [[quiz]] = await pool.query('SELECT * FROM learning_quizzes WHERE id = ?', [id]);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Get questions with correct answers and explanations for immediate feedback
    const [questions] = await pool.query(`
      SELECT id, question_text, options, correct_answer_index, explanation, points, display_order
      FROM learning_quiz_questions
      WHERE quiz_id = ?
      ORDER BY display_order, id
    `, [id]);

    // Parse options from comma-separated string to array
    const parsedQuestions = questions.map(q => {
      const parsed = {
        ...q,
        options: typeof q.options === 'string' ? q.options.split(',').map(o => o.trim()) : q.options
      };
      console.log('Question:', q.id);
      console.log('  Question text:', q.question_text);
      console.log('  Options (raw):', q.options);
      console.log('  Options (parsed):', parsed.options);
      console.log('  Correct answer index:', q.correct_answer_index);
      console.log('  Correct answer index type:', typeof q.correct_answer_index);
      return parsed;
    });

    res.json({ success: true, quiz: { ...quiz, questions: parsedQuestions } });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz', error: error.message });
  }
});

// Submit quiz
router.post('/quizzes/:id/complete', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    // For development: use Jay's user ID (34) if no auth
    const userId = req.user?.id || 34;
    const { answers, timeSpent } = req.body; // answers: [{questionId, selectedAnswer}]

    // Temporarily disabled for development
    // if (!userId) {
    //   return res.status(401).json({ success: false, message: 'Authentication required' });
    // }

    await connection.beginTransaction();

    // Get quiz and questions
    const [[quiz]] = await connection.query('SELECT * FROM learning_quizzes WHERE id = ?', [id]);
    const [questions] = await connection.query(`
      SELECT * FROM learning_quiz_questions WHERE quiz_id = ? ORDER BY id
    `, [id]);

    // Calculate score
    let score = 0;
    const results = [];

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (question) {
        const isCorrect = answer.selectedAnswer === question.correct_answer_index;
        if (isCorrect) {
          score += question.points;
        }
        results.push({
          questionId: question.id,
          isCorrect,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: question.correct_answer_index,
          explanation: question.explanation
        });
      }
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = (score / totalPoints) * 100;
    const passed = percentage >= quiz.passing_score_percentage;

    // Save attempt
    await connection.query(`
      INSERT INTO user_quiz_attempts (user_id, quiz_id, score, percentage, passed, time_spent_seconds, answers)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, id, score, percentage, passed, timeSpent, JSON.stringify(results)]);

    // Award XP if passed
    if (passed) {
      await awardXP(userId, quiz.xp_reward, 'quiz', id, `Passed quiz: ${quiz.title}`, connection);

      // Update stats
      await connection.query(`
        UPDATE user_learning_progress
        SET quizzes_passed = quizzes_passed + 1
        WHERE user_id = ?
      `, [userId]);
    }

    await connection.commit();

    res.json({
      success: true,
      score,
      percentage: Math.round(percentage),
      passed,
      xpEarned: passed ? quiz.xp_reward : 0,
      results
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to submit quiz', error: error.message });
  } finally {
    connection.release();
  }
});

// ============================================
// BOOKMARKS
// ============================================

// Get user bookmarks
router.get('/bookmarks', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { type } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let query = `
      SELECT
        b.*,
        CASE
          WHEN b.item_type = 'lesson' THEN l.title
          WHEN b.item_type = 'module' THEN m.title
          WHEN b.item_type = 'quiz' THEN q.title
        END as title,
        CASE
          WHEN b.item_type = 'lesson' THEN l.description
          WHEN b.item_type = 'module' THEN m.description
          WHEN b.item_type = 'quiz' THEN q.description
        END as description,
        CASE
          WHEN b.item_type = 'module' THEN m.icon
          ELSE NULL
        END as icon
      FROM learning_bookmarks b
      LEFT JOIN learning_lessons l ON b.item_type = 'lesson' AND b.item_id = l.id
      LEFT JOIN learning_modules m ON b.item_type = 'module' AND b.item_id = m.id
      LEFT JOIN learning_quizzes q ON b.item_type = 'quiz' AND b.item_id = q.id
      WHERE b.user_id = ?
    `;

    const params = [userId];

    if (type) {
      query += ' AND b.item_type = ?';
      params.push(type);
    }

    query += ' ORDER BY b.created_at DESC';

    const [bookmarks] = await pool.query(query, params);

    res.json({ success: true, bookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookmarks', error: error.message });
  }
});

// Add bookmark
router.post('/bookmarks', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { itemId, itemType } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    await pool.query(`
      INSERT INTO learning_bookmarks (user_id, item_id, item_type)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE created_at = created_at
    `, [userId, itemId, itemType]);

    res.json({ success: true, message: 'Bookmark added' });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    res.status(500).json({ success: false, message: 'Failed to add bookmark', error: error.message });
  }
});

// Remove bookmark
router.delete('/bookmarks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    await pool.query('DELETE FROM learning_bookmarks WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({ success: true, message: 'Bookmark removed' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ success: false, message: 'Failed to remove bookmark', error: error.message });
  }
});

// ============================================
// PROGRESS & STATS
// ============================================

// Get user progress dashboard
router.get('/progress', async (req, res) => {
  try {
    // For development: use Jay's user ID (34) if no auth
    const userId = req.user?.id || 34;

    // Get or create progress record
    await pool.query(`
      INSERT IGNORE INTO user_learning_progress (user_id)
      VALUES (?)
    `, [userId]);

    const [[progress]] = await pool.query(`
      SELECT * FROM user_learning_progress WHERE user_id = ?
    `, [userId]);

    const [[streak]] = await pool.query(`
      SELECT * FROM user_learning_streaks WHERE user_id = ?
    `, [userId]);

    // Get completed modules count
    const [[moduleStats]] = await pool.query(`
      SELECT
        COUNT(DISTINCT CASE WHEN um.progress_percentage = 100 THEN um.module_id END) as completed_modules,
        (SELECT COUNT(*) FROM learning_modules WHERE is_published = true) as total_modules
      FROM user_learning_modules um
      WHERE um.user_id = ?
    `, [userId]);

    res.json({
      success: true,
      progress: {
        totalXP: progress?.total_xp || 0,
        level: progress?.level || 1,
        streak: streak?.current_streak || 0,
        longestStreak: streak?.longest_streak || 0,
        completedModules: moduleStats?.completed_modules || 0,
        totalModules: moduleStats?.total_modules || 0,
        lessonsCompleted: progress?.lessons_completed || 0,
        quizzesPassed: progress?.quizzes_passed || 0,
        hoursSpent: progress?.hours_spent || 0,
        lastActivity: progress?.last_activity
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch progress', error: error.message });
  }
});

// Get weekly activity
router.get('/progress/weekly-activity', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const [activity] = await pool.query(`
      SELECT
        DATE(created_at) as date,
        SUM(amount) as xp_earned
      FROM user_xp_transactions
      WHERE user_id = ?
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [userId]);

    res.json({ success: true, activity });
  } catch (error) {
    console.error('Error fetching weekly activity:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity', error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all-time', limit = 100 } = req.query;
    const userId = req.user?.id;

    let dateFilter = '';
    if (period === 'weekly') {
      dateFilter = 'AND ulp.last_activity >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (period === 'monthly') {
      dateFilter = 'AND ulp.last_activity >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }

    const [leaderboard] = await pool.query(`
      SELECT
        ulp.user_id,
        u.uuid,
        u.nickname as username,
        u.emoji as avatar,
        ulp.total_xp,
        ulp.level,
        ulp.modules_completed as completedModules,
        uls.current_streak,
        @user_rank := @user_rank + 1 as \`rank\`
      FROM user_learning_progress ulp
      LEFT JOIN users u ON ulp.user_id = u.id
      LEFT JOIN user_learning_streaks uls ON ulp.user_id = uls.user_id
      CROSS JOIN (SELECT @user_rank := 0) r
      WHERE ulp.total_xp > 0 ${dateFilter}
      ORDER BY ulp.total_xp DESC
      LIMIT ?
    `, [parseInt(limit)]);

    // Get user's rank if logged in
    let userRank = null;
    if (userId) {
      const [[rank]] = await pool.query(`
        SELECT COUNT(*) + 1 as rank
        FROM user_learning_progress
        WHERE total_xp > (SELECT total_xp FROM user_learning_progress WHERE user_id = ?)
      `, [userId]);
      userRank = rank?.rank;
    }

    res.json({ success: true, leaderboard, userRank });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard', error: error.message });
  }
});

module.exports = router;
