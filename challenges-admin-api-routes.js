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

// ============================================
// ADMIN - REGULAR CHALLENGES MANAGEMENT
// ============================================

// Get all challenges (with pagination and filters)
router.get('/challenges', async (req, res) => {
  try {
    const { limit = 50, offset = 0, active, category, difficulty } = req.query;

    let query = `
      SELECT
        c.*,
        (SELECT COUNT(*) FROM learning_challenge_tasks WHERE challenge_id = c.id) as task_count,
        (SELECT COUNT(*) FROM user_learning_challenge_progress WHERE challenge_id = c.id) as enrollment_count
      FROM learning_challenges c
      WHERE 1=1
    `;

    const params = [];

    if (active !== undefined) {
      query += ' AND c.active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    if (category) {
      query += ' AND c.category = ?';
      params.push(category);
    }

    if (difficulty) {
      query += ' AND c.difficulty = ?';
      params.push(difficulty);
    }

    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [challenges] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM learning_challenges WHERE 1=1';
    const countParams = [];

    if (active !== undefined) {
      countQuery += ' AND active = ?';
      countParams.push(active === 'true' ? 1 : 0);
    }

    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (difficulty) {
      countQuery += ' AND difficulty = ?';
      countParams.push(difficulty);
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

// Get single challenge with tasks
router.get('/challenges/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [[challenge]] = await pool.query(`
      SELECT * FROM learning_challenges WHERE id = ?
    `, [id]);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Get tasks for this challenge
    const [tasks] = await pool.query(`
      SELECT
        ct.*,
        CASE
          WHEN ct.task_type = 'lesson' THEN l.title
          WHEN ct.task_type = 'quiz' THEN q.title
          WHEN ct.task_type = 'module' THEN m.title
          ELSE NULL
        END as task_title
      FROM learning_challenge_tasks ct
      LEFT JOIN learning_lessons l ON ct.task_type = 'lesson' AND ct.task_id = l.id
      LEFT JOIN learning_quizzes q ON ct.task_type = 'quiz' AND ct.task_id = q.id
      LEFT JOIN learning_modules m ON ct.task_type = 'module' AND ct.task_id = m.id
      WHERE ct.challenge_id = ?
      ORDER BY ct.display_order, ct.id
    `, [id]);

    res.json({
      success: true,
      challenge: {
        ...challenge,
        tasks
      }
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch challenge', error: error.message });
  }
});

// Create new challenge
router.post('/challenges', async (req, res) => {
  try {
    const {
      title,
      description,
      xp_reward = 500,
      difficulty = 'medium',
      category = 'Civic Education',
      active = true,
      start_date,
      end_date
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const [result] = await pool.query(`
      INSERT INTO learning_challenges
      (title, description, xp_reward, difficulty, category, active, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, xp_reward, difficulty, category, active, start_date, end_date]);

    res.json({
      success: true,
      message: 'Challenge created successfully',
      challengeId: result.insertId
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ success: false, message: 'Failed to create challenge', error: error.message });
  }
});

// Update challenge
router.put('/challenges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      xp_reward,
      difficulty,
      category,
      active,
      start_date,
      end_date
    } = req.body;

    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (xp_reward !== undefined) {
      updates.push('xp_reward = ?');
      params.push(xp_reward);
    }

    if (difficulty !== undefined) {
      updates.push('difficulty = ?');
      params.push(difficulty);
    }

    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }

    if (active !== undefined) {
      updates.push('active = ?');
      params.push(active);
    }

    if (start_date !== undefined) {
      updates.push('start_date = ?');
      params.push(start_date);
    }

    if (end_date !== undefined) {
      updates.push('end_date = ?');
      params.push(end_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(id);

    const [result] = await pool.query(`
      UPDATE learning_challenges
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    res.json({
      success: true,
      message: 'Challenge updated successfully'
    });
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({ success: false, message: 'Failed to update challenge', error: error.message });
  }
});

// Delete challenge
router.delete('/challenges/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if challenge has enrollments
    const [[{ enrollment_count }]] = await pool.query(`
      SELECT COUNT(*) as enrollment_count FROM user_learning_challenge_progress WHERE challenge_id = ?
    `, [id]);

    if (enrollment_count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete challenge with ${enrollment_count} enrollments. Consider deactivating instead.`
      });
    }

    // Delete tasks first
    await pool.query('DELETE FROM learning_challenge_tasks WHERE challenge_id = ?', [id]);

    // Delete challenge
    const [result] = await pool.query('DELETE FROM learning_challenges WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    res.json({
      success: true,
      message: 'Challenge deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({ success: false, message: 'Failed to delete challenge', error: error.message });
  }
});

// ============================================
// CHALLENGE TASKS MANAGEMENT
// ============================================

// Add task to challenge
router.post('/challenges/:challengeId/tasks', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { task_type, task_id, description, display_order } = req.body;

    if (!task_type || !task_id) {
      return res.status(400).json({ success: false, message: 'task_type and task_id are required' });
    }

    if (!['lesson', 'quiz', 'module'].includes(task_type)) {
      return res.status(400).json({ success: false, message: 'task_type must be "lesson", "quiz", or "module"' });
    }

    // Verify task exists
    let table;
    if (task_type === 'lesson') table = 'learning_lessons';
    else if (task_type === 'quiz') table = 'learning_quizzes';
    else if (task_type === 'module') table = 'learning_modules';

    const [[taskExists]] = await pool.query(`SELECT id FROM ${table} WHERE id = ?`, [task_id]);

    if (!taskExists) {
      return res.status(404).json({ success: false, message: `${task_type} not found` });
    }

    // Get next display order if not provided
    let finalDisplayOrder = display_order;
    if (finalDisplayOrder === undefined) {
      const [[{ max_order }]] = await pool.query(
        'SELECT COALESCE(MAX(display_order), -1) as max_order FROM learning_challenge_tasks WHERE challenge_id = ?',
        [challengeId]
      );
      finalDisplayOrder = max_order + 1;
    }

    const [result] = await pool.query(`
      INSERT INTO learning_challenge_tasks (challenge_id, task_type, task_id, description, display_order)
      VALUES (?, ?, ?, ?, ?)
    `, [challengeId, task_type, task_id, description, finalDisplayOrder]);

    res.json({
      success: true,
      message: 'Task added to challenge',
      taskId: result.insertId
    });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ success: false, message: 'Failed to add task', error: error.message });
  }
});

// Update challenge task
router.put('/challenges/:challengeId/tasks/:taskId', async (req, res) => {
  try {
    const { challengeId, taskId } = req.params;
    const { description, display_order } = req.body;

    const updates = [];
    const params = [];

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (display_order !== undefined) {
      updates.push('display_order = ?');
      params.push(display_order);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(taskId, challengeId);

    const [result] = await pool.query(`
      UPDATE learning_challenge_tasks
      SET ${updates.join(', ')}
      WHERE id = ? AND challenge_id = ?
    `, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, message: 'Failed to update task', error: error.message });
  }
});

// Delete challenge task
router.delete('/challenges/:challengeId/tasks/:taskId', async (req, res) => {
  try {
    const { challengeId, taskId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM learning_challenge_tasks WHERE id = ? AND challenge_id = ?',
      [taskId, challengeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, message: 'Failed to delete task', error: error.message });
  }
});

// Reorder challenge tasks
router.put('/challenges/:challengeId/tasks/reorder', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { challengeId } = req.params;
    const { taskIds } = req.body;

    if (!Array.isArray(taskIds)) {
      return res.status(400).json({ success: false, message: 'taskIds must be an array' });
    }

    await connection.beginTransaction();

    for (let i = 0; i < taskIds.length; i++) {
      await connection.query(
        'UPDATE learning_challenge_tasks SET display_order = ? WHERE id = ? AND challenge_id = ?',
        [i, taskIds[i], challengeId]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Tasks reordered successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error reordering tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder tasks', error: error.message });
  } finally {
    connection.release();
  }
});

// Get available lessons for challenges
router.get('/lessons/available', async (req, res) => {
  try {
    const [lessons] = await pool.query(`
      SELECT
        l.id,
        l.title,
        l.description,
        l.lesson_type,
        l.xp_reward,
        m.title as module_title
      FROM learning_lessons l
      LEFT JOIN learning_modules m ON l.module_id = m.id
      WHERE l.is_published = 1
      ORDER BY m.title, l.display_order, l.id
    `);

    res.json({ success: true, lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lessons', error: error.message });
  }
});

// Get available quizzes for challenges
router.get('/quizzes/available', async (req, res) => {
  try {
    const [quizzes] = await pool.query(`
      SELECT
        q.id,
        q.title,
        q.description,
        q.quiz_type,
        q.xp_reward,
        COUNT(qq.id) as question_count
      FROM learning_quizzes q
      LEFT JOIN learning_quiz_questions qq ON q.id = qq.quiz_id
      WHERE q.is_published = 1
      GROUP BY q.id
      HAVING question_count > 0
      ORDER BY q.created_at DESC
    `);

    res.json({ success: true, quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes', error: error.message });
  }
});

// Get available modules for challenges
router.get('/modules/available', async (req, res) => {
  try {
    const [modules] = await pool.query(`
      SELECT
        m.id,
        m.title,
        m.description,
        m.difficulty,
        m.category,
        m.xp_reward,
        COUNT(l.id) as lesson_count
      FROM learning_modules m
      LEFT JOIN learning_lessons l ON m.id = l.module_id
      WHERE m.is_published = 1
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `);

    res.json({ success: true, modules });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch modules', error: error.message });
  }
});

module.exports = router;
