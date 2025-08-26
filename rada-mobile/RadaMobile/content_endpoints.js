// Content Creation API Endpoints
// Add these to your server.js file

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/content';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files per submission
  },
  fileFilter: function (req, file, cb) {
    // Allow images, audio, and documents
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Content creation endpoint
app.post('/api/content/create', upload.array('media_files', 5), async (req, res) => {
  try {
    const {
      title,
      content,
      content_type,
      category,
      tags,
      location,
      is_anonymous,
      allow_comments,
      allow_sharing,
      user_id
    } = req.body;

    // Validate required fields
    if (!title || !content || !content_type || !category || !location || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate content type
    const validContentTypes = ['story', 'poem', 'evidence', 'report'];
    if (!validContentTypes.includes(content_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type'
      });
    }

    // Check if evidence requires media files
    if (content_type === 'evidence' && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Evidence submissions require media files'
      });
    }

    // Process media files
    const mediaFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        mediaFiles.push({
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        });
      }
    }

    // Calculate XP reward
    let xpReward = getBaseXPReward(content_type);
    if (mediaFiles.length > 0) xpReward += 10; // Bonus for media
    if (location) xpReward += 5; // Bonus for location
    if (tags) {
      const tagCount = tags.split(',').filter(tag => tag.trim()).length;
      xpReward += tagCount * 2; // Bonus for tags
    }

    // Create content record
    const contentData = {
      title: title.trim(),
      content: content.trim(),
      content_type,
      category,
      tags: tags ? tags.trim() : '',
      location,
      is_anonymous: is_anonymous === 'true',
      allow_comments: allow_comments !== 'false',
      allow_sharing: allow_sharing !== 'false',
      user_id,
      media_files: JSON.stringify(mediaFiles),
      xp_reward: xpReward,
      status: 'pending_review',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Insert into database
    const query = `
      INSERT INTO user_content 
      (title, content, content_type, category, tags, location, is_anonymous, 
       allow_comments, allow_sharing, user_id, media_files, xp_reward, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      contentData.title, contentData.content, contentData.content_type,
      contentData.category, contentData.tags, contentData.location,
      contentData.is_anonymous, contentData.allow_comments, contentData.allow_sharing,
      contentData.user_id, contentData.media_files, contentData.xp_reward,
      contentData.status, contentData.created_at, contentData.updated_at
    ];

    const [result] = await db.execute(query, values);
    const contentId = result.insertId;

    // Award XP to user
    await awardXPToUser(user_id, xpReward);

    // Log content creation
    console.log(`New ${content_type} created by user ${user_id}: ${title}`);

    res.json({
      success: true,
      message: 'Content created successfully',
      content_id: contentId,
      xp_earned: xpReward
    });

  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create content',
      error: error.message
    });
  }
});

// Get user's content
app.get('/api/content/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, u.username, u.nickname, u.emoji
      FROM user_content c
      JOIN users u ON c.user_id = u.uuid
      WHERE c.user_id = ?
    `;
    
    const queryParams = [userId];
    
    if (status) {
      query += ' AND c.status = ?';
      queryParams.push(status);
    }
    
    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [rows] = await db.execute(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM user_content WHERE user_id = ?';
    if (status) {
      countQuery += ' AND status = ?';
    }
    const [countResult] = await db.execute(countQuery, status ? [userId, status] : [userId]);
    const total = countResult[0].total;

    res.json({
      success: true,
      content: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content'
    });
  }
});

// Get public content feed
app.get('/api/content/feed', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, location } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, u.username, u.nickname, u.emoji,
             (SELECT COUNT(*) FROM content_likes cl WHERE cl.content_id = c.id) as likes_count,
             (SELECT COUNT(*) FROM content_comments cc WHERE cc.content_id = c.id) as comments_count
      FROM user_content c
      JOIN users u ON c.user_id = u.uuid
      WHERE c.status = 'approved' AND c.allow_sharing = 1
    `;
    
    const queryParams = [];
    
    if (category) {
      query += ' AND c.category = ?';
      queryParams.push(category);
    }
    
    if (location) {
      query += ' AND c.location = ?';
      queryParams.push(location);
    }
    
    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [rows] = await db.execute(query, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM user_content c 
      WHERE status = 'approved' AND allow_sharing = 1
    `;
    
    if (category) countQuery += ' AND category = ?';
    if (location) countQuery += ' AND location = ?';
    
    const [countResult] = await db.execute(countQuery, 
      [category, location].filter(Boolean)
    );
    const total = countResult[0].total;

    res.json({
      success: true,
      content: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching content feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content feed'
    });
  }
});

// Like/unlike content
app.post('/api/content/:contentId/like', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }

    // Check if already liked
    const [existing] = await db.execute(
      'SELECT * FROM content_likes WHERE content_id = ? AND user_id = ?',
      [contentId, userId]
    );

    if (existing.length > 0) {
      // Unlike
      await db.execute(
        'DELETE FROM content_likes WHERE content_id = ? AND user_id = ?',
        [contentId, userId]
      );
      
      res.json({
        success: true,
        message: 'Content unliked',
        liked: false
      });
    } else {
      // Like
      await db.execute(
        'INSERT INTO content_likes (content_id, user_id, created_at) VALUES (?, ?, ?)',
        [contentId, userId, new Date()]
      );
      
      res.json({
        success: true,
        message: 'Content liked',
        liked: true
      });
    }

  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
});

// Add comment to content
app.post('/api/content/:contentId/comment', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { userId, comment, is_anonymous = false } = req.body;

    if (!userId || !comment) {
      return res.status(400).json({
        success: false,
        message: 'User ID and comment required'
      });
    }

    const query = `
      INSERT INTO content_comments 
      (content_id, user_id, comment, is_anonymous, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.execute(query, [
      contentId, userId, comment.trim(), is_anonymous === 'true', new Date()
    ]);

    res.json({
      success: true,
      message: 'Comment added successfully'
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

// Helper function to get base XP reward
function getBaseXPReward(contentType) {
  const rewards = {
    story: 25,
    poem: 25,
    evidence: 35,
    report: 30
  };
  return rewards[contentType] || 20;
}

// Helper function to award XP to user
async function awardXPToUser(userId, xpAmount) {
  try {
    await db.execute(
      'UPDATE users SET xp_points = xp_points + ? WHERE uuid = ?',
      [xpAmount, userId]
    );
    
    // Log XP award
    console.log(`Awarded ${xpAmount} XP to user ${userId}`);
  } catch (error) {
    console.error('Error awarding XP:', error);
  }
}

// Database schema for content tables (run this in your database)
const contentTablesSchema = `
-- User content table
CREATE TABLE IF NOT EXISTS user_content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_type ENUM('story', 'poem', 'evidence', 'report') NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags TEXT,
  location VARCHAR(100) NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  allow_comments BOOLEAN DEFAULT TRUE,
  allow_sharing BOOLEAN DEFAULT TRUE,
  user_id VARCHAR(255) NOT NULL,
  media_files JSON,
  xp_reward INT DEFAULT 0,
  status ENUM('pending_review', 'approved', 'rejected', 'featured') DEFAULT 'pending_review',
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_content_type (content_type),
  INDEX idx_category (category),
  INDEX idx_location (location),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Content likes table
CREATE TABLE IF NOT EXISTS content_likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content_id INT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (content_id, user_id),
  FOREIGN KEY (content_id) REFERENCES user_content(id) ON DELETE CASCADE,
  INDEX idx_content_id (content_id),
  INDEX idx_user_id (user_id)
);

-- Content comments table
CREATE TABLE IF NOT EXISTS content_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content_id INT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES user_content(id) ON DELETE CASCADE,
  INDEX idx_content_id (content_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
`;

module.exports = {
  contentTablesSchema,
  getBaseXPReward,
  awardXPToUser
};

