const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'module-icons');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'module-icon-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// ============================================
// MODULES MANAGEMENT
// ============================================

// Upload module icon image
router.post('/upload-module-icon', upload.single('icon'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Return the URL path to the uploaded file
    const fileUrl = `/uploads/module-icons/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image', error: error.message });
  }
});

// Get all modules (Admin)
router.get('/modules', async (req, res) => {
  try {
    const [modules] = await pool.query(`
      SELECT
        m.*,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT um.user_id) as enrollment_count,
        AVG(um.progress_percentage) as avg_completion,
        COALESCE(SUM(l.xp_reward), 0) as calculated_xp_from_lessons
      FROM learning_modules m
      LEFT JOIN learning_lessons l ON m.id = l.module_id
      LEFT JOIN user_learning_modules um ON m.id = um.module_id
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `);

    res.json({ success: true, modules });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch modules', error: error.message });
  }
});

// Get single module (Admin)
router.get('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [modules] = await pool.query(`
      SELECT
        m.*,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT um.user_id) as enrollment_count
      FROM learning_modules m
      LEFT JOIN learning_lessons l ON m.id = l.module_id
      LEFT JOIN user_learning_modules um ON m.id = um.module_id
      WHERE m.id = ?
      GROUP BY m.id
    `, [id]);

    if (modules.length === 0) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Get lessons for this module
    const [lessons] = await pool.query(`
      SELECT * FROM learning_lessons
      WHERE module_id = ?
      ORDER BY id
    `, [id]);

    res.json({ success: true, module: { ...modules[0], lessons } });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch module', error: error.message });
  }
});

// Create module
router.post('/modules', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty = 'beginner',
      icon = '📚',
      xp_reward = 100,
      estimated_duration = 30,
      status = 'draft',
      is_featured = false
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    // Auto-sync is_published with status
    const is_published = status === 'published' ? 1 : 0;

    const [result] = await pool.query(`
      INSERT INTO learning_modules
      (title, description, category, difficulty, icon, xp_reward, estimated_duration, status, is_published, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, category, difficulty, icon, xp_reward, estimated_duration, status, is_published, is_featured]);

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      moduleId: result.insertId
    });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ success: false, message: 'Failed to create module', error: error.message });
  }
});

// Update module
router.put('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      difficulty,
      icon,
      xp_reward,
      estimated_duration,
      status,
      is_published,
      is_featured
    } = req.body;

    // Auto-sync is_published with status if only status is provided
    let finalIsPublished = is_published;
    if (status !== undefined && is_published === undefined) {
      finalIsPublished = status === 'published' ? 1 : 0;
    }

    const [result] = await pool.query(`
      UPDATE learning_modules
      SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        difficulty = COALESCE(?, difficulty),
        icon = COALESCE(?, icon),
        xp_reward = COALESCE(?, xp_reward),
        estimated_duration = COALESCE(?, estimated_duration),
        status = COALESCE(?, status),
        is_published = COALESCE(?, is_published),
        is_featured = COALESCE(?, is_featured)
      WHERE id = ?
    `, [title, description, category, difficulty, icon, xp_reward, estimated_duration, status, finalIsPublished, is_featured, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    res.json({ success: true, message: 'Module updated successfully' });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ success: false, message: 'Failed to update module', error: error.message });
  }
});

// Delete module
router.delete('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM learning_modules WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    res.json({ success: true, message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ success: false, message: 'Failed to delete module', error: error.message });
  }
});

// Reorder modules
router.put('/modules/reorder', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { moduleIds } = req.body;

    if (!Array.isArray(moduleIds)) {
      return res.status(400).json({ success: false, message: 'moduleIds must be an array' });
    }

    await connection.beginTransaction();

    for (let i = 0; i < moduleIds.length; i++) {
      await connection.query(
        'UPDATE learning_modules SET display_order = ? WHERE id = ?',
        [i, moduleIds[i]]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Modules reordered successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error reordering modules:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder modules', error: error.message });
  } finally {
    connection.release();
  }
});

// ============================================
// LESSONS MANAGEMENT
// ============================================

// Get all lessons (optionally filtered by moduleId)
router.get('/lessons', async (req, res) => {
  try {
    const { moduleId } = req.query;

    let query = `
      SELECT
        l.*,
        COUNT(DISTINCT ul.user_id) as completion_count
      FROM learning_lessons l
      LEFT JOIN user_learning_lessons ul ON l.id = ul.lesson_id AND ul.completed_at IS NOT NULL
    `;

    const params = [];

    if (moduleId) {
      query += ' WHERE l.module_id = ?';
      params.push(moduleId);
    }

    query += ' GROUP BY l.id ORDER BY l.display_order, l.id';

    const [lessons] = await pool.query(query, params);

    res.json({ success: true, lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lessons', error: error.message });
  }
});

// Get all lessons for a module
router.get('/modules/:moduleId/lessons', async (req, res) => {
  try {
    const { moduleId } = req.params;

    const [lessons] = await pool.query(`
      SELECT
        l.*,
        COUNT(DISTINCT ul.user_id) as completion_count
      FROM learning_lessons l
      LEFT JOIN user_learning_lessons ul ON l.id = ul.lesson_id AND ul.completed_at IS NOT NULL
      WHERE l.module_id = ?
      GROUP BY l.id
      ORDER BY l.display_order, l.id
    `, [moduleId]);

    res.json({ success: true, lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lessons', error: error.message });
  }
});

// Get single lesson
router.get('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [lessons] = await pool.query('SELECT * FROM learning_lessons WHERE id = ?', [id]);

    if (lessons.length === 0) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.json({ success: true, lesson: lessons[0] });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lesson', error: error.message });
  }
});

// Create lesson
router.post('/lessons', async (req, res) => {
  try {
    const {
      module_id,
      title,
      description,
      content,
      lesson_type = 'text',
      duration_minutes = 0,
      xp_reward = 25,
      display_order = 0,
      is_locked = false,
      is_published = 0,
      prerequisites,
      video_url
    } = req.body;

    if (!module_id || !title) {
      return res.status(400).json({ success: false, message: 'module_id and title are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO learning_lessons
      (module_id, title, description, content, lesson_type, duration_minutes, xp_reward, display_order, is_locked, is_published, prerequisites, video_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [module_id, title, description, content, lesson_type, duration_minutes, xp_reward, display_order, is_locked, is_published,
        JSON.stringify(prerequisites), video_url]);

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      lessonId: result.insertId
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ success: false, message: 'Failed to create lesson', error: error.message });
  }
});

// Update lesson
router.put('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      content,
      lesson_type,
      duration_minutes,
      xp_reward,
      display_order,
      is_locked,
      is_published,
      prerequisites,
      video_url
    } = req.body;

    const [result] = await pool.query(`
      UPDATE learning_lessons
      SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        content = COALESCE(?, content),
        lesson_type = COALESCE(?, lesson_type),
        duration_minutes = COALESCE(?, duration_minutes),
        xp_reward = COALESCE(?, xp_reward),
        display_order = COALESCE(?, display_order),
        is_locked = COALESCE(?, is_locked),
        is_published = COALESCE(?, is_published),
        prerequisites = COALESCE(?, prerequisites),
        video_url = COALESCE(?, video_url)
      WHERE id = ?
    `, [title, description, content, lesson_type, duration_minutes, xp_reward, display_order, is_locked, is_published,
        prerequisites ? JSON.stringify(prerequisites) : undefined, video_url, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.json({ success: true, message: 'Lesson updated successfully' });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ success: false, message: 'Failed to update lesson', error: error.message });
  }
});

// Delete lesson
router.delete('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM learning_lessons WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ success: false, message: 'Failed to delete lesson', error: error.message });
  }
});

// Reorder lessons
router.put('/lessons/reorder', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { moduleId, lessonIds } = req.body;

    if (!Array.isArray(lessonIds)) {
      return res.status(400).json({ success: false, message: 'lessonIds must be an array' });
    }

    await connection.beginTransaction();

    for (let i = 0; i < lessonIds.length; i++) {
      await connection.query(
        'UPDATE learning_lessons SET display_order = ? WHERE id = ? AND module_id = ?',
        [i, lessonIds[i], moduleId]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Lessons reordered successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error reordering lessons:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder lessons', error: error.message });
  } finally {
    connection.release();
  }
});

// ============================================
// QUIZZES MANAGEMENT
// ============================================

// Get all quizzes
router.get('/quizzes', async (req, res) => {
  try {
    const { module_id, quiz_type } = req.query;

    let query = `
      SELECT
        q.*,
        m.title as module_title,
        l.title as lesson_title,
        COUNT(DISTINCT qq.id) as question_count,
        COUNT(DISTINCT uqa.user_id) as attempt_count,
        AVG(uqa.percentage) as avg_score
      FROM learning_quizzes q
      LEFT JOIN learning_modules m ON q.module_id = m.id
      LEFT JOIN learning_lessons l ON q.lesson_id = l.id
      LEFT JOIN learning_quiz_questions qq ON q.id = qq.quiz_id
      LEFT JOIN user_quiz_attempts uqa ON q.id = uqa.quiz_id
    `;

    const params = [];
    const conditions = [];

    if (module_id) {
      conditions.push('q.module_id = ?');
      params.push(module_id);
    }

    if (quiz_type) {
      conditions.push('q.quiz_type = ?');
      params.push(quiz_type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY q.id ORDER BY q.created_at DESC';

    const [quizzes] = await pool.query(query, params);

    res.json({ success: true, quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes', error: error.message });
  }
});

// Get quizzes available for challenges (with questions) - MUST be before /:id route
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

// Get single quiz with questions
router.get('/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [quizzes] = await pool.query('SELECT * FROM learning_quizzes WHERE id = ?', [id]);

    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const [questions] = await pool.query(`
      SELECT * FROM learning_quiz_questions
      WHERE quiz_id = ?
      ORDER BY display_order, id
    `, [id]);

    res.json({ success: true, quiz: { ...quizzes[0], questions } });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz', error: error.message });
  }
});

// Create quiz
router.post('/quizzes', async (req, res) => {
  try {
    const {
      module_id,
      lesson_id,
      title,
      description,
      time_limit = 10,
      passing_score = 70,
      xp_reward = 50,
      difficulty = 'beginner',
      category = 'Government',
      active = true,
      quiz_type = 'trivia',
      is_published = false
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    // Convert 0 or empty IDs to NULL for foreign key constraints
    const finalModuleId = module_id && module_id !== 0 ? module_id : null;
    const finalLessonId = lesson_id && lesson_id !== 0 ? lesson_id : null;

    const [result] = await pool.query(`
      INSERT INTO learning_quizzes
      (module_id, lesson_id, title, description, time_limit, passing_score, xp_reward, difficulty, category, active, quiz_type, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [finalModuleId, finalLessonId, title, description, time_limit, passing_score, xp_reward, difficulty, category, active, quiz_type, is_published]);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quizId: result.insertId
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to create quiz', error: error.message });
  }
});

// Update quiz
router.put('/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      module_id,
      lesson_id,
      title,
      description,
      time_limit,
      passing_score,
      xp_reward,
      difficulty,
      category,
      active,
      quiz_type,
      is_published
    } = req.body;

    // Convert 0 or empty IDs to NULL for foreign key constraints
    const finalModuleId = module_id !== undefined ? (module_id && module_id !== 0 ? module_id : null) : undefined;
    const finalLessonId = lesson_id !== undefined ? (lesson_id && lesson_id !== 0 ? lesson_id : null) : undefined;

    const [result] = await pool.query(`
      UPDATE learning_quizzes
      SET
        module_id = COALESCE(?, module_id),
        lesson_id = COALESCE(?, lesson_id),
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        time_limit = COALESCE(?, time_limit),
        passing_score = COALESCE(?, passing_score),
        xp_reward = COALESCE(?, xp_reward),
        difficulty = COALESCE(?, difficulty),
        category = COALESCE(?, category),
        active = COALESCE(?, active),
        quiz_type = COALESCE(?, quiz_type),
        is_published = COALESCE(?, is_published)
      WHERE id = ?
    `, [finalModuleId, finalLessonId, title, description, time_limit, passing_score, xp_reward, difficulty, category, active, quiz_type, is_published, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.json({ success: true, message: 'Quiz updated successfully' });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to update quiz', error: error.message });
  }
});

// Delete quiz
router.delete('/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM learning_quizzes WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quiz', error: error.message });
  }
});

// Create quiz question
router.post('/quizzes/:quizId/questions', async (req, res) => {
  try {
    const { quizId } = req.params;
    const {
      question_text,
      options,
      correct_answer_index,
      explanation,
      points = 10,
      display_order = 0
    } = req.body;

    if (!question_text || !options || correct_answer_index === undefined) {
      return res.status(400).json({ success: false, message: 'question_text, options, and correct_answer_index are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO learning_quiz_questions
      (quiz_id, question_text, options, correct_answer_index, explanation, points, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [quizId, question_text, JSON.stringify(options), correct_answer_index, explanation, points, display_order]);

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      questionId: result.insertId
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ success: false, message: 'Failed to create question', error: error.message });
  }
});

// Update quiz question
router.put('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      question_text,
      options,
      correct_answer_index,
      explanation,
      points,
      display_order
    } = req.body;

    const [result] = await pool.query(`
      UPDATE learning_quiz_questions
      SET
        question_text = COALESCE(?, question_text),
        options = COALESCE(?, options),
        correct_answer_index = COALESCE(?, correct_answer_index),
        explanation = COALESCE(?, explanation),
        points = COALESCE(?, points),
        display_order = COALESCE(?, display_order)
      WHERE id = ?
    `, [question_text, options ? JSON.stringify(options) : undefined, correct_answer_index, explanation, points, display_order, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({ success: true, message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ success: false, message: 'Failed to update question', error: error.message });
  }
});

// Delete quiz question
router.delete('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM learning_quiz_questions WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ success: false, message: 'Failed to delete question', error: error.message });
  }
});

// Reorder questions
router.put('/quizzes/:quizId/questions/reorder', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { quizId } = req.params;
    const { questionIds } = req.body;

    if (!Array.isArray(questionIds)) {
      return res.status(400).json({ success: false, message: 'questionIds must be an array' });
    }

    await connection.beginTransaction();

    for (let i = 0; i < questionIds.length; i++) {
      await connection.query(
        'UPDATE learning_quiz_questions SET display_order = ? WHERE id = ? AND quiz_id = ?',
        [i, questionIds[i], quizId]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Questions reordered successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error reordering questions:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder questions', error: error.message });
  } finally {
    connection.release();
  }
});

// ============================================
// LEARNING PATHS MANAGEMENT
// ============================================

// Get all learning paths (Admin)
router.get('/paths', async (req, res) => {
  try {
    const [paths] = await pool.query(`
      SELECT
        p.*,
        COUNT(DISTINCT pm.module_id) as total_modules,
        COUNT(DISTINCT up.user_id) as enrollment_count
      FROM learning_paths p
      LEFT JOIN learning_path_modules pm ON p.id = pm.path_id
      LEFT JOIN user_learning_paths up ON p.id = up.path_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    res.json({ success: true, paths });
  } catch (error) {
    console.error('Error fetching paths:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch paths', error: error.message });
  }
});

// Get single learning path (Admin)
router.get('/paths/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [paths] = await pool.query(`
      SELECT * FROM learning_paths WHERE id = ?
    `, [id]);

    if (paths.length === 0) {
      return res.status(404).json({ success: false, message: 'Path not found' });
    }

    const [modules] = await pool.query(`
      SELECT m.*, pm.display_order
      FROM learning_path_modules pm
      JOIN learning_modules m ON pm.module_id = m.id
      WHERE pm.path_id = ?
      ORDER BY pm.display_order
    `, [id]);

    res.json({ success: true, path: { ...paths[0], modules } });
  } catch (error) {
    console.error('Error fetching path:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch path', error: error.message });
  }
});

// Create learning path (Admin)
router.post('/paths', async (req, res) => {
  try {
    const { title, description, category, difficulty, estimated_hours, icon, color, is_published } = req.body;

    const [result] = await pool.query(`
      INSERT INTO learning_paths (title, description, category, difficulty, estimated_hours, icon, color, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, category, difficulty, estimated_hours, icon, color, is_published !== false]);

    res.json({ success: true, message: 'Path created successfully', pathId: result.insertId });
  } catch (error) {
    console.error('Error creating path:', error);
    res.status(500).json({ success: false, message: 'Failed to create path', error: error.message });
  }
});

// Update learning path (Admin)
router.put('/paths/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, difficulty, estimated_hours, icon, color, is_published } = req.body;

    await pool.query(`
      UPDATE learning_paths
      SET title = ?, description = ?, category = ?, difficulty = ?, estimated_hours = ?, icon = ?, color = ?, is_published = ?
      WHERE id = ?
    `, [title, description, category, difficulty, estimated_hours, icon, color, is_published, id]);

    res.json({ success: true, message: 'Path updated successfully' });
  } catch (error) {
    console.error('Error updating path:', error);
    res.status(500).json({ success: false, message: 'Failed to update path', error: error.message });
  }
});

// Delete learning path (Admin)
router.delete('/paths/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM learning_paths WHERE id = ?', [id]);
    res.json({ success: true, message: 'Path deleted successfully' });
  } catch (error) {
    console.error('Error deleting path:', error);
    res.status(500).json({ success: false, message: 'Failed to delete path', error: error.message });
  }
});

// Add module to path (Admin)
router.post('/paths/:pathId/modules', async (req, res) => {
  try {
    const { pathId } = req.params;
    const { module_id } = req.body;

    // Get next display order
    const [maxOrder] = await pool.query(
      'SELECT MAX(display_order) as max_order FROM learning_path_modules WHERE path_id = ?',
      [pathId]
    );
    const nextOrder = (maxOrder[0].max_order || -1) + 1;

    await pool.query(`
      INSERT INTO learning_path_modules (path_id, module_id, display_order)
      VALUES (?, ?, ?)
    `, [pathId, module_id, nextOrder]);

    res.json({ success: true, message: 'Module added to path' });
  } catch (error) {
    console.error('Error adding module to path:', error);
    res.status(500).json({ success: false, message: 'Failed to add module', error: error.message });
  }
});

// Remove module from path (Admin)
router.delete('/paths/:pathId/modules/:moduleId', async (req, res) => {
  try {
    const { pathId, moduleId } = req.params;
    await pool.query('DELETE FROM learning_path_modules WHERE path_id = ? AND module_id = ?', [pathId, moduleId]);
    res.json({ success: true, message: 'Module removed from path' });
  } catch (error) {
    console.error('Error removing module from path:', error);
    res.status(500).json({ success: false, message: 'Failed to remove module', error: error.message });
  }
});

// ============================================
// ACHIEVEMENTS MANAGEMENT
// ============================================

// Get all achievements (Admin)
router.get('/achievements', async (req, res) => {
  try {
    const [achievements] = await pool.query(`
      SELECT
        a.*,
        COUNT(DISTINCT ua.user_id) as users_earned
      FROM learning_achievements a
      LEFT JOIN user_learning_achievements ua ON a.id = ua.achievement_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);

    res.json({ success: true, achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch achievements', error: error.message });
  }
});

// Create achievement (Admin)
router.post('/achievements', async (req, res) => {
  try {
    const { title, description, icon, rarity, criteria_type, criteria_value, xp_reward } = req.body;

    const [result] = await pool.query(`
      INSERT INTO learning_achievements (title, description, icon, rarity, criteria_type, criteria_value, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description, icon, rarity, criteria_type, criteria_value, xp_reward]);

    res.json({ success: true, message: 'Achievement created successfully', achievementId: result.insertId });
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ success: false, message: 'Failed to create achievement', error: error.message });
  }
});

// Update achievement (Admin)
router.put('/achievements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, rarity, criteria_type, criteria_value, xp_reward } = req.body;

    await pool.query(`
      UPDATE learning_achievements
      SET title = ?, description = ?, icon = ?, rarity = ?, criteria_type = ?, criteria_value = ?, xp_reward = ?
      WHERE id = ?
    `, [title, description, icon, rarity, criteria_type, criteria_value, xp_reward, id]);

    res.json({ success: true, message: 'Achievement updated successfully' });
  } catch (error) {
    console.error('Error updating achievement:', error);
    res.status(500).json({ success: false, message: 'Failed to update achievement', error: error.message });
  }
});

// Delete achievement (Admin)
router.delete('/achievements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM learning_achievements WHERE id = ?', [id]);
    res.json({ success: true, message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({ success: false, message: 'Failed to delete achievement', error: error.message });
  }
});

module.exports = router;
