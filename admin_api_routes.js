// Admin Dashboard API Routes
// Complete backend system for module creation, lesson management, and content publishing

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/admin/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|pdf|doc|docx|mp3|wav/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, video, audio, and document files are allowed!'));
    }
  }
});

// Helper function to parse JSON fields safely
const safeJSONParse = (jsonString, defaultValue = null) => {
  try {
    return jsonString ? JSON.parse(jsonString) : defaultValue;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
};

// Helper function to calculate module duration from lessons
const calculateModuleDuration = (lessons) => {
  if (!lessons || !Array.isArray(lessons)) return 0;
  return lessons.reduce((total, lesson) => {
    const duration = lesson.estimated_duration || 15;
    return total + duration;
  }, 0);
};

// Helper function to generate embed codes for different platforms
const generateEmbedCode = (url, platform) => {
  try {
    switch (platform) {
      case 'youtube':
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        if (videoId) {
          return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
        }
        break;
      
      case 'tiktok':
        const tiktokId = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/)?.[1];
        if (tiktokId) {
          return `<blockquote class="tiktok-embed" cite="${url}" data-video-id="${tiktokId}"></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`;
        }
        break;
      
      case 'vimeo':
        const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
        if (vimeoId) {
          return `<iframe src="https://player.vimeo.com/video/${vimeoId}" width="100%" height="315" frameborder="0" allowfullscreen></iframe>`;
        }
        break;
      
      case 'facebook':
        const fbId = url.match(/facebook\.com\/watch\/\?v=(\d+)/)?.[1];
        if (fbId) {
          return `<iframe src="https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/watch/?v=${fbId}" width="100%" height="315" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen></iframe>`;
        }
        break;
    }
    return null;
  } catch (error) {
    console.error('Error generating embed code:', error);
    return null;
  }
};

module.exports = (app, db) => {
  // ========================================
  // MODULE MANAGEMENT ROUTES
  // ========================================

  // Get all modules (with pagination and filtering)
  app.get('/api/admin/modules', (req, res) => {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }
    
    if (search) {
      whereClause += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    const countQuery = `SELECT COUNT(*) as total FROM admin_modules ${whereClause}`;
    const dataQuery = `
      SELECT 
        m.*,
        COUNT(l.id) as lesson_count,
        COALESCE(SUM(l.estimated_duration), 0) as total_duration
      FROM admin_modules m
      LEFT JOIN admin_lessons l ON m.id = l.module_id
      ${whereClause}
      GROUP BY m.id
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    db.query(countQuery, params, (err, countResult) => {
      if (err) {
        console.error('Error counting modules:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const total = countResult[0].total;
      
      db.query(dataQuery, [...params, parseInt(limit), offset], (err, modules) => {
        if (err) {
          console.error('Error fetching modules:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Format modules to match frontend expectations
        const formattedModules = modules.map(module => ({
          id: module.id,
          title: module.title,
          description: module.description,
          icon: module.icon,
          difficulty: module.difficulty,
          xp_reward: module.xp_reward,
          lessons: module.lesson_count || 0,
          duration: `${Math.round(module.total_duration / 60)} hours`,
          progress: 0, // Will be populated from user_progress table
          status: module.status,
          category: module.category,
          featured: module.featured,
          created_at: module.created_at,
          updated_at: module.updated_at
        }));
        
        res.json({
          modules: formattedModules,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      });
    });
  });

  // Get single module with full details
  app.get('/api/admin/modules/:id', (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid module ID' });
    }
    
    const moduleQuery = `
      SELECT 
        m.*,
        COUNT(l.id) as lesson_count,
        COALESCE(SUM(l.estimated_duration), 0) as total_duration
      FROM admin_modules m
      LEFT JOIN admin_lessons l ON m.id = l.module_id
      WHERE m.id = ?
      GROUP BY m.id
    `;
    
    const lessonsQuery = `
      SELECT 
        l.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', m.id,
            'type', m.media_type,
            'url', m.url,
            'embed_code', m.embed_code,
            'thumbnail_url', m.thumbnail_url,
            'title', m.title,
            'duration', m.duration
          )
        ) as media
      FROM admin_lessons l
      LEFT JOIN admin_media m ON l.id = m.lesson_id
      WHERE l.module_id = ?
      GROUP BY l.id
      ORDER BY l.lesson_number
    `;
    
    const quizQuery = `
      SELECT * FROM admin_module_quizzes 
      WHERE module_id = ?
    `;
    
    db.query(moduleQuery, [id], (err, moduleResult) => {
      if (err) {
        console.error('Error fetching module:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (moduleResult.length === 0) {
        return res.status(404).json({ error: 'Module not found' });
      }
      
      const module = moduleResult[0];
      
      // Fetch lessons and media
      db.query(lessonsQuery, [id], (err, lessonsResult) => {
        if (err) {
          console.error('Error fetching lessons:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Fetch module quiz
        db.query(quizQuery, [id], (err, quizResult) => {
          if (err) {
            console.error('Error fetching quiz:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          const formattedModule = {
            ...module,
            tags: safeJSONParse(module.tags, []),
            lessons: lessonsResult.map(lesson => ({
              ...lesson,
              content_sections: safeJSONParse(lesson.content_sections, {}),
              mini_quiz: safeJSONParse(lesson.mini_quiz, []),
              media: safeJSONParse(lesson.media, [])
            })),
            quiz: quizResult[0] ? {
              ...quizResult[0],
              questions: safeJSONParse(quizResult[0].questions, [])
            } : null,
            lesson_count: module.lesson_count || 0,
            estimated_duration: Math.round(module.total_duration / 60)
          };
          
          res.json(formattedModule);
        });
      });
    });
  });

  // Create new module
  app.post('/api/admin/modules', (req, res) => {
    const {
      title,
      description,
      icon,
      difficulty,
      xp_reward,
      category,
      tags,
      featured
    } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    const moduleData = {
      title,
      description,
      icon: icon || '📚',
      difficulty: difficulty || 'beginner',
      xp_reward: xp_reward || 50,
      category,
      tags: tags ? JSON.stringify(tags) : null,
      featured: featured || false,
      status: 'draft',
      created_by: req.user?.uuid || 'system'
    };
    
    db.query('INSERT INTO admin_modules SET ?', moduleData, (err, result) => {
      if (err) {
        console.error('Error creating module:', err);
        return res.status(500).json({ error: 'Failed to create module' });
      }
      
      const moduleId = result.insertId;
      
      // Create initial lesson
      const initialLesson = {
        module_id: moduleId,
        lesson_number: 1,
        title: 'Introduction',
        estimated_duration: 15,
        content_sections: JSON.stringify({
          hook: { content: '<p>Welcome to this module!</p>', media_id: null },
          why_matters: { content: '<p>This lesson will help you understand...</p>', media_id: null },
          main_content: { content: '<p>Let\'s begin learning...</p>', media_id: null },
          key_takeaways: ['Key point 1', 'Key point 2', 'Key point 3']
        }),
        mini_quiz: JSON.stringify([])
      };
      
      db.query('INSERT INTO admin_lessons SET ?', initialLesson, (err) => {
        if (err) {
          console.error('Error creating initial lesson:', err);
        }
        
        res.json({
          message: 'Module created successfully',
          module_id: moduleId,
          lesson_id: result.insertId
        });
      });
    });
  });

  // Update module
  app.put('/api/admin/modules/:id', (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid module ID' });
    }
    
    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.created_by;
    
    // Handle JSON fields
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }
    
    updateData.updated_at = new Date();
    
    db.query('UPDATE admin_modules SET ? WHERE id = ?', [updateData, id], (err, result) => {
      if (err) {
        console.error('Error updating module:', err);
        return res.status(500).json({ error: 'Failed to update module' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Module not found' });
      }
      
      res.json({ message: 'Module updated successfully' });
    });
  });

  // Delete module
  app.delete('/api/admin/modules/:id', (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid module ID' });
    }
    
    db.query('DELETE FROM admin_modules WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error deleting module:', err);
        return res.status(500).json({ error: 'Failed to delete module' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Module not found' });
      }
      
      res.json({ message: 'Module deleted successfully' });
    });
  });

  // ========================================
  // LESSON MANAGEMENT ROUTES
  // ========================================

  // Create new lesson
  app.post('/api/admin/modules/:moduleId/lessons', (req, res) => {
    const { moduleId } = req.params;
    const {
      title,
      estimated_duration,
      content_sections,
      mini_quiz
    } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Lesson title is required' });
    }
    
    // Get next lesson number
    db.query('SELECT MAX(lesson_number) as max_number FROM admin_lessons WHERE module_id = ?', [moduleId], (err, result) => {
      if (err) {
        console.error('Error getting lesson number:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const nextNumber = (result[0].max_number || 0) + 1;
      
      const lessonData = {
        module_id: moduleId,
        lesson_number: nextNumber,
        title,
        estimated_duration: estimated_duration || 15,
        content_sections: content_sections ? JSON.stringify(content_sections) : JSON.stringify({
          hook: { content: '<p>Lesson hook...</p>', media_id: null },
          why_matters: { content: '<p>Why this matters...</p>', media_id: null },
          main_content: { content: '<p>Main content...</p>', media_id: null },
          key_takeaways: ['Takeaway 1', 'Takeaway 2', 'Takeaway 3']
        }),
        mini_quiz: mini_quiz ? JSON.stringify(mini_quiz) : JSON.stringify([])
      };
      
      db.query('INSERT INTO admin_lessons SET ?', lessonData, (err, result) => {
        if (err) {
          console.error('Error creating lesson:', err);
          return res.status(500).json({ error: 'Failed to create lesson' });
        }
        
        res.json({
          message: 'Lesson created successfully',
          lesson_id: result.insertId,
          lesson_number: nextNumber
        });
      });
    });
  });

  // Update lesson
  app.put('/api/admin/lessons/:lessonId', (req, res) => {
    const { lessonId } = req.params;
    const updateData = { ...req.body };
    
    if (!lessonId || isNaN(parseInt(lessonId))) {
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }
    
    // Handle JSON fields
    if (updateData.content_sections) {
      updateData.content_sections = JSON.stringify(updateData.content_sections);
    }
    
    if (updateData.mini_quiz) {
      updateData.mini_quiz = JSON.stringify(updateData.mini_quiz);
    }
    
    updateData.updated_at = new Date();
    
    db.query('UPDATE admin_lessons SET ? WHERE id = ?', [updateData, lessonId], (err, result) => {
      if (err) {
        console.error('Error updating lesson:', err);
        return res.status(500).json({ error: 'Failed to update lesson' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Lesson not found' });
      }
      
      res.json({ message: 'Lesson updated successfully' });
    });
  });

  // Delete lesson
  app.delete('/api/admin/lessons/:lessonId', (req, res) => {
    const { lessonId } = req.params;
    
    if (!lessonId || isNaN(parseInt(lessonId))) {
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }
    
    db.query('DELETE FROM admin_lessons WHERE id = ?', [lessonId], (err, result) => {
      if (err) {
        console.error('Error deleting lesson:', err);
        return res.status(500).json({ error: 'Failed to delete lesson' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Lesson not found' });
      }
      
      res.json({ message: 'Lesson deleted successfully' });
    });
  });

  // ========================================
  // MEDIA MANAGEMENT ROUTES
  // ========================================

  // Upload media file
  app.post('/api/admin/media/upload', upload.single('media'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const mediaData = {
      lesson_id: req.body.lesson_id,
      content_section: req.body.content_section,
      media_type: req.body.media_type || 'image',
      file_path: req.file.path,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      title: req.body.title || req.file.originalname
    };
    
    db.query('INSERT INTO admin_media SET ?', mediaData, (err, result) => {
      if (err) {
        console.error('Error saving media:', err);
        return res.status(500).json({ error: 'Failed to save media' });
      }
      
      res.json({
        message: 'Media uploaded successfully',
        media_id: result.insertId,
        file_path: req.file.path
      });
    });
  });

  // Add external media (YouTube, TikTok, etc.)
  app.post('/api/admin/media/external', (req, res) => {
    const {
      lesson_id,
      content_section,
      media_type,
      url,
      title
    } = req.body;
    
    if (!lesson_id || !content_section || !media_type || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const embedCode = generateEmbedCode(url, media_type);
    
    if (!embedCode) {
      return res.status(400).json({ error: 'Invalid media URL or unsupported platform' });
    }
    
    const mediaData = {
      lesson_id,
      content_section,
      media_type,
      url,
      embed_code: embedCode,
      title: title || 'External Media'
    };
    
    db.query('INSERT INTO admin_media SET ?', mediaData, (err, result) => {
      if (err) {
        console.error('Error saving external media:', err);
        return res.status(500).json({ error: 'Failed to save media' });
      }
      
      res.json({
        message: 'External media added successfully',
        media_id: result.insertId,
        embed_code: embedCode
      });
    });
  });

  // Delete media
  app.delete('/api/admin/media/:mediaId', (req, res) => {
    const { mediaId } = req.params;
    
    if (!mediaId || isNaN(parseInt(mediaId))) {
      return res.status(400).json({ error: 'Invalid media ID' });
    }
    
    // Get file path before deleting
    db.query('SELECT file_path FROM admin_media WHERE id = ?', [mediaId], (err, result) => {
      if (err) {
        console.error('Error fetching media:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Media not found' });
      }
      
      const filePath = result[0].file_path;
      
      // Delete from database
      db.query('DELETE FROM admin_media WHERE id = ?', [mediaId], (err, result) => {
        if (err) {
          console.error('Error deleting media:', err);
          return res.status(500).json({ error: 'Failed to delete media' });
        }
        
        // Delete physical file if it exists
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        
        res.json({ message: 'Media deleted successfully' });
      });
    });
  });

  // ========================================
  // QUIZ MANAGEMENT ROUTES
  // ========================================

  // Create module quiz
  app.post('/api/admin/modules/:moduleId/quiz', (req, res) => {
    const { moduleId } = req.params;
    const {
      title,
      description,
      questions,
      passing_score,
      time_limit,
      xp_reward,
      difficulty
    } = req.body;
    
    if (!title || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Title and questions array are required' });
    }
    
    const quizData = {
      module_id: moduleId,
      title: title || `📊 ${req.body.module_title || 'Module'} Quiz`,
      description: description || 'Test your understanding of this module',
      questions: JSON.stringify(questions),
      passing_score: passing_score || 70,
      time_limit: time_limit || 25,
      xp_reward: xp_reward || 100,
      difficulty: difficulty || 'intermediate'
    };
    
    db.query('INSERT INTO admin_module_quizzes SET ?', quizData, (err, result) => {
      if (err) {
        console.error('Error creating quiz:', err);
        return res.status(500).json({ error: 'Failed to create quiz' });
      }
      
      res.json({
        message: 'Quiz created successfully',
        quiz_id: result.insertId
      });
    });
  });

  // Update module quiz
  app.put('/api/admin/quizzes/:quizId', (req, res) => {
    const { quizId } = req.params;
    const updateData = { ...req.body };
    
    if (!quizId || isNaN(parseInt(quizId))) {
      return res.status(400).json({ error: 'Invalid quiz ID' });
    }
    
    // Handle JSON fields
    if (updateData.questions) {
      updateData.questions = JSON.stringify(updateData.questions);
    }
    
    updateData.updated_at = new Date();
    
    db.query('UPDATE admin_module_quizzes SET ? WHERE id = ?', [updateData, quizId], (err, result) => {
      if (err) {
        console.error('Error updating quiz:', err);
        return res.status(500).json({ error: 'Failed to update quiz' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      
      res.json({ message: 'Quiz updated successfully' });
    });
  });

  // ========================================
  // PUBLISHING WORKFLOW ROUTES
  // ========================================

  // Update module status
  app.put('/api/admin/modules/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, notes, quality_checks } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({ error: 'Module ID and status are required' });
    }
    
    const validStatuses = ['draft', 'review', 'ready', 'published'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Update module status
    const updateData = {
      status,
      updated_at: new Date()
    };
    
    if (status === 'published') {
      updateData.published_at = new Date();
    }
    
    db.query('UPDATE admin_modules SET ? WHERE id = ?', [updateData, id], (err, result) => {
      if (err) {
        console.error('Error updating module status:', err);
        return res.status(500).json({ error: 'Failed to update status' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Module not found' });
      }
      
      // Record workflow change
      const workflowData = {
        module_id: id,
        from_status: req.body.current_status || 'draft',
        to_status: status,
        changed_by: req.user?.uuid || 'system',
        notes: notes || null,
        quality_checks: quality_checks ? JSON.stringify(quality_checks) : null
      };
      
      db.query('INSERT INTO admin_publishing_workflow SET ?', workflowData, (err) => {
        if (err) {
          console.error('Error recording workflow change:', err);
        }
        
        res.json({ 
          message: 'Module status updated successfully',
          new_status: status
        });
      });
    });
  });

  // Get publishing workflow history
  app.get('/api/admin/modules/:id/workflow', (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid module ID' });
    }
    
    db.query(`
      SELECT * FROM admin_publishing_workflow 
      WHERE module_id = ? 
      ORDER BY created_at DESC
    `, [id], (err, result) => {
      if (err) {
        console.error('Error fetching workflow history:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const workflow = result.map(item => ({
        ...item,
        quality_checks: safeJSONParse(item.quality_checks, {})
      }));
      
      res.json(workflow);
    });
  });

  // ========================================
  // ANALYTICS AND REPORTING ROUTES
  // ========================================

  // Get module analytics
  app.get('/api/admin/modules/:id/analytics', (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid module ID' });
    }
    
    db.query(`
      SELECT * FROM admin_content_analytics 
      WHERE module_id = ?
    `, [id], (err, result) => {
      if (err) {
        console.error('Error fetching analytics:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const analytics = result[0] || {
        views: 0,
        completions: 0,
        average_score: 0.00,
        average_completion_time: 0,
        user_feedback: []
      };
      
      analytics.user_feedback = safeJSONParse(analytics.user_feedback, []);
      
      res.json(analytics);
    });
  });

  // Get dashboard overview
  app.get('/api/admin/dashboard/overview', (req, res) => {
    const queries = {
      totalModules: 'SELECT COUNT(*) as count FROM admin_modules',
      publishedModules: 'SELECT COUNT(*) as count FROM admin_modules WHERE status = "published"',
      draftModules: 'SELECT COUNT(*) as count FROM admin_modules WHERE status = "draft"',
      reviewModules: 'SELECT COUNT(*) as count FROM admin_modules WHERE status = "review"',
      totalLessons: 'SELECT COUNT(*) as count FROM admin_lessons',
      totalQuizzes: 'SELECT COUNT(*) as count FROM admin_module_quizzes'
    };
    
    const results = {};
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;
    
    Object.entries(queries).forEach(([key, query]) => {
      db.query(query, (err, result) => {
        if (err) {
          console.error(`Error in ${key} query:`, err);
          results[key] = 0;
        } else {
          results[key] = result[0].count;
        }
        
        completedQueries++;
        
        if (completedQueries === totalQueries) {
          res.json(results);
        }
      });
    });
  });

  // ========================================
  // CONTENT TEMPLATES ROUTES
  // ========================================

  // Get content templates
  app.get('/api/admin/templates', (req, res) => {
    db.query('SELECT * FROM admin_content_templates ORDER BY created_at DESC', (err, result) => {
      if (err) {
        console.error('Error fetching templates:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const templates = result.map(template => ({
        ...template,
        template_structure: safeJSONParse(template.template_structure, {}),
        tags: safeJSONParse(template.tags, [])
      }));
      
      res.json(templates);
    });
  });

  // Create content template
  app.post('/api/admin/templates', (req, res) => {
    const {
      name,
      description,
      template_structure,
      category,
      tags
    } = req.body;
    
    if (!name || !template_structure) {
      return res.status(400).json({ error: 'Name and template structure are required' });
    }
    
    const templateData = {
      name,
      description,
      template_structure: JSON.stringify(template_structure),
      category,
      tags: tags ? JSON.stringify(tags) : null
    };
    
    db.query('INSERT INTO admin_content_templates SET ?', templateData, (err, result) => {
      if (err) {
        console.error('Error creating template:', err);
        return res.status(500).json({ error: 'Failed to create template' });
      }
      
      res.json({
        message: 'Template created successfully',
        template_id: result.insertId
      });
    });
  });

  // ========================================
  // UTILITY ROUTES
  // ========================================

  // Get module categories
  app.get('/api/admin/categories', (req, res) => {
    db.query(`
      SELECT DISTINCT category, COUNT(*) as count 
      FROM admin_modules 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC
    `, (err, result) => {
      if (err) {
        console.error('Error fetching categories:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(result);
    });
  });

  // Get difficulty levels
  app.get('/api/admin/difficulties', (req, res) => {
    db.query(`
      SELECT difficulty, COUNT(*) as count 
      FROM admin_modules 
      GROUP BY difficulty 
      ORDER BY FIELD(difficulty, 'beginner', 'intermediate', 'advanced')
    `, (err, result) => {
      if (err) {
        console.error('Error fetching difficulties:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(result);
    });
  });

  // Health check
  app.get('/api/admin/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  });
};
