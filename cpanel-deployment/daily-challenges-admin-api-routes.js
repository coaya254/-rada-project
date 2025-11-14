const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '!1754Swm.',
  database: process.env.DB_NAME || 'rada_ke',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ============================================
// ADMIN - DAILY CHALLENGES MANAGEMENT
// ============================================

// Get all daily challenges (with pagination and filters)
router.get('/daily-challenges', async (req, res) => {
  try {
    const { limit = 50, offset = 0, date_from, date_to, is_active } = req.query;

    let query = `
      SELECT
        dc.*,
        q.title as quiz_title,
        q.quiz_type,
        (SELECT COUNT(*) FROM learning_quiz_questions WHERE quiz_id = dc.quiz_id) as question_count,
        (SELECT COUNT(*) FROM user_daily_challenge_attempts WHERE challenge_id = dc.id) as attempt_count
      FROM learning_daily_challenges dc
      LEFT JOIN learning_quizzes q ON dc.quiz_id = q.id
      WHERE 1=1
    `;

    const params = [];

    if (date_from) {
      query += ' AND dc.challenge_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND dc.challenge_date <= ?';
      params.push(date_to);
    }

    if (is_active !== undefined) {
      query += ' AND dc.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY dc.challenge_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [challenges] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM learning_daily_challenges WHERE 1=1';
    const countParams = [];

    if (date_from) {
      countQuery += ' AND challenge_date >= ?';
      countParams.push(date_from);
    }

    if (date_to) {
      countQuery += ' AND challenge_date <= ?';
      countParams.push(date_to);
    }

    if (is_active !== undefined) {
      countQuery += ' AND is_active = ?';
      countParams.push(is_active === 'true' ? 1 : 0);
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      challenges,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + challenges.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch challenges', error: error.message });
  }
});

// Get analytics for daily challenges (MUST be before /:id route)
router.get('/daily-challenges/analytics', async (req, res) => {
  try {
    // Total challenges
    const [[{ total_challenges }]] = await pool.query(`
      SELECT COUNT(*) as total_challenges FROM learning_daily_challenges
    `);

    // Total attempts
    const [[{ total_attempts }]] = await pool.query(`
      SELECT COUNT(*) as total_attempts FROM user_daily_challenge_attempts
    `);

    // Average score
    const [[{ average_score }]] = await pool.query(`
      SELECT COALESCE(AVG(percentage), 0) as average_score FROM user_daily_challenge_attempts
    `);

    // Active streaks (users with streak > 0)
    const [[{ active_streaks }]] = await pool.query(`
      SELECT COUNT(*) as active_streaks FROM user_learning_streaks WHERE current_streak > 0
    `);

    // Participation rate (unique users who attempted vs total users)
    const [[{ total_users }]] = await pool.query(`
      SELECT COUNT(*) as total_users FROM users
    `);

    const [[{ unique_participants }]] = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as unique_participants FROM user_daily_challenge_attempts
    `);

    const participation_rate = total_users > 0 ? Math.round((unique_participants / total_users) * 100) : 0;

    // Recent performance (last 7 days)
    const [recent_performance] = await pool.query(`
      SELECT
        DATE(dc.challenge_date) as date,
        COUNT(DISTINCT uca.user_id) as participants,
        AVG(uca.percentage) as avg_score,
        COUNT(uca.id) as attempts
      FROM learning_daily_challenges dc
      LEFT JOIN user_daily_challenge_attempts uca ON dc.id = uca.challenge_id
      WHERE dc.challenge_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(dc.challenge_date)
      ORDER BY date DESC
    `);

    // Most popular challenges
    const [popular_challenges] = await pool.query(`
      SELECT
        dc.id,
        dc.challenge_date,
        q.title as quiz_title,
        COUNT(uca.id) as attempt_count,
        AVG(uca.percentage) as avg_score
      FROM learning_daily_challenges dc
      LEFT JOIN learning_quizzes q ON dc.quiz_id = q.id
      LEFT JOIN user_daily_challenge_attempts uca ON dc.id = uca.challenge_id
      GROUP BY dc.id
      ORDER BY attempt_count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        total_challenges,
        total_attempts,
        average_score: Math.round(average_score),
        active_streaks,
        participation_rate,
        total_users,
        unique_participants
      },
      recent_performance,
      popular_challenges
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

// Get quizzes available for challenges (quizzes with questions)
router.get('/quizzes/available-for-challenges', async (req, res) => {
  try {
    const [quizzes] = await pool.query(`
      SELECT
        q.id,
        q.title,
        q.description,
        q.quiz_type,
        COUNT(qq.id) as question_count
      FROM learning_quizzes q
      LEFT JOIN learning_quiz_questions qq ON q.id = qq.quiz_id
      WHERE q.is_published = true
      GROUP BY q.id
      HAVING question_count > 0
      ORDER BY q.created_at DESC
    `);

    res.json({
      success: true,
      quizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes', error: error.message });
  }
});

// Get single daily challenge
router.get('/daily-challenges/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [[challenge]] = await pool.query(`
      SELECT
        dc.*,
        q.title as quiz_title,
        q.description as quiz_description,
        q.quiz_type,
        (SELECT COUNT(*) FROM learning_quiz_questions WHERE quiz_id = dc.quiz_id) as question_count,
        (SELECT COUNT(*) FROM user_daily_challenge_attempts WHERE challenge_id = dc.id) as attempt_count,
        (SELECT AVG(percentage) FROM user_daily_challenge_attempts WHERE challenge_id = dc.id) as average_score
      FROM learning_daily_challenges dc
      LEFT JOIN learning_quizzes q ON dc.quiz_id = q.id
      WHERE dc.id = ?
    `, [id]);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Get questions for this challenge
    const [questions] = await pool.query(`
      SELECT id, question_text, options, correct_answer_index, points, explanation
      FROM learning_quiz_questions
      WHERE quiz_id = ?
      ORDER BY display_order, id
    `, [challenge.quiz_id]);

    res.json({
      success: true,
      challenge: {
        ...challenge,
        questions
      }
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch challenge', error: error.message });
  }
});

// Create new daily challenge
router.post('/daily-challenges', async (req, res) => {
  try {
    const { challenge_date, quiz_id, xp_reward = 100, is_active = true } = req.body;

    if (!challenge_date || !quiz_id) {
      return res.status(400).json({ success: false, message: 'challenge_date and quiz_id are required' });
    }

    // Check if quiz exists and has questions
    const [[quiz]] = await pool.query(`
      SELECT q.*, COUNT(qq.id) as question_count
      FROM learning_quizzes q
      LEFT JOIN learning_quiz_questions qq ON q.id = qq.quiz_id
      WHERE q.id = ?
      GROUP BY q.id
    `, [quiz_id]);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.question_count === 0) {
      return res.status(400).json({ success: false, message: 'Quiz has no questions' });
    }

    // Check if challenge already exists for this date
    const [[existing]] = await pool.query(`
      SELECT id FROM learning_daily_challenges WHERE challenge_date = ?
    `, [challenge_date]);

    if (existing) {
      return res.status(400).json({ success: false, message: 'Challenge already exists for this date' });
    }

    // Create challenge
    const [result] = await pool.query(`
      INSERT INTO learning_daily_challenges (challenge_date, quiz_id, xp_reward, is_active)
      VALUES (?, ?, ?, ?)
    `, [challenge_date, quiz_id, xp_reward, is_active]);

    res.json({
      success: true,
      message: 'Daily challenge created successfully',
      challenge: {
        id: result.insertId,
        challenge_date,
        quiz_id,
        xp_reward,
        is_active,
        quiz_title: quiz.title,
        question_count: quiz.question_count
      }
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ success: false, message: 'Failed to create challenge', error: error.message });
  }
});

// Update daily challenge
router.put('/daily-challenges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { challenge_date, quiz_id, xp_reward, is_active } = req.body;

    // Check if challenge exists
    const [[challenge]] = await pool.query(`
      SELECT * FROM learning_daily_challenges WHERE id = ?
    `, [id]);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Build update query
    const updates = [];
    const params = [];

    if (challenge_date !== undefined) {
      updates.push('challenge_date = ?');
      params.push(challenge_date);
    }

    if (quiz_id !== undefined) {
      // Verify quiz has questions
      const [[quiz]] = await pool.query(`
        SELECT COUNT(qq.id) as question_count
        FROM learning_quizzes q
        LEFT JOIN learning_quiz_questions qq ON q.id = qq.quiz_id
        WHERE q.id = ?
        GROUP BY q.id
      `, [quiz_id]);

      if (!quiz || quiz.question_count === 0) {
        return res.status(400).json({ success: false, message: 'Quiz not found or has no questions' });
      }

      updates.push('quiz_id = ?');
      params.push(quiz_id);
    }

    if (xp_reward !== undefined) {
      updates.push('xp_reward = ?');
      params.push(xp_reward);
    }

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(id);

    await pool.query(`
      UPDATE learning_daily_challenges
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);

    res.json({
      success: true,
      message: 'Challenge updated successfully'
    });
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({ success: false, message: 'Failed to update challenge', error: error.message });
  }
});

// Delete daily challenge
router.delete('/daily-challenges/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if challenge exists
    const [[challenge]] = await pool.query(`
      SELECT * FROM learning_daily_challenges WHERE id = ?
    `, [id]);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Check if there are any attempts
    const [[{ attempt_count }]] = await pool.query(`
      SELECT COUNT(*) as attempt_count FROM user_daily_challenge_attempts WHERE challenge_id = ?
    `, [id]);

    if (attempt_count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete challenge with ${attempt_count} user attempts. Consider deactivating instead.`
      });
    }

    // Delete challenge
    await pool.query('DELETE FROM learning_daily_challenges WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Challenge deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({ success: false, message: 'Failed to delete challenge', error: error.message });
  }
});

// Bulk create challenges (for scheduling multiple days at once)
router.post('/daily-challenges/bulk', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { challenges } = req.body;

    if (!Array.isArray(challenges) || challenges.length === 0) {
      return res.status(400).json({ success: false, message: 'challenges array is required' });
    }

    await connection.beginTransaction();

    const created = [];
    const errors = [];

    for (const challenge of challenges) {
      try {
        const { challenge_date, quiz_id, xp_reward = 100 } = challenge;

        // Check if challenge already exists
        const [[existing]] = await connection.query(
          'SELECT id FROM learning_daily_challenges WHERE challenge_date = ?',
          [challenge_date]
        );

        if (existing) {
          errors.push({ challenge_date, error: 'Already exists' });
          continue;
        }

        // Create challenge
        const [result] = await connection.query(`
          INSERT INTO learning_daily_challenges (challenge_date, quiz_id, xp_reward, is_active)
          VALUES (?, ?, ?, true)
        `, [challenge_date, quiz_id, xp_reward]);

        created.push({
          id: result.insertId,
          challenge_date,
          quiz_id,
          xp_reward
        });
      } catch (error) {
        errors.push({ challenge_date: challenge.challenge_date, error: error.message });
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Created ${created.length} challenges`,
      created,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error bulk creating challenges:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk create challenges', error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
