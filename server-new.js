const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Safe JSON parsing helper function
function safeJSONParse(jsonString, fallback = []) {
  try {
    if (typeof jsonString === 'object') {
      return jsonString || fallback;
    }
    if (typeof jsonString === 'string' && jsonString.trim()) {
      return JSON.parse(jsonString);
    }
    return fallback;
  } catch (e) {
    console.warn('Invalid JSON:', jsonString);
    // Handle comma-separated strings
    if (typeof jsonString === 'string' && jsonString.includes(',')) {
      return jsonString.split(',').map(item => item.trim());
    }
    return fallback;
  }
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection with proper pooling
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_ke',
  charset: 'utf8mb4'
});

// Environment validation
function validateEnvironment() {
  const required = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    console.log('Using default values for development...');
  }
}

// Call before starting server
validateEnvironment();

// Input sanitization helper
function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  return input.trim().substring(0, maxLength);
}

// Improved database query execution
function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        console.error('Query:', query);
        console.error('Params:', params);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
    console.log('Starting server without database connection for development...');
  } else {
    console.log('✅ Connected to MySQL Database');
    connection.release();
    // Initialize database if connection successful
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  const tables = [
    // Users table with anonymous UUID system
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) UNIQUE NOT NULL,
      nickname VARCHAR(50) DEFAULT 'Anonymous',
      emoji VARCHAR(10) DEFAULT '🧑',
      xp INT DEFAULT 0,
      badges JSON,
      streak INT DEFAULT 0,
      last_active DATE DEFAULT (CURRENT_DATE),
      county VARCHAR(50),
      persona ENUM('keeper', 'tracker', 'amplifier', 'educator') DEFAULT 'keeper',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Posts table for civic content
    `CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL,
      type ENUM('story', 'report', 'poem', 'audio', 'image') NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT,
      media_url VARCHAR(500),
      county VARCHAR(50),
      tags JSON,
      verified BOOLEAN DEFAULT FALSE,
      featured BOOLEAN DEFAULT FALSE,
      flags INT DEFAULT 0,
      likes INT DEFAULT 0,
      shares INT DEFAULT 0,
      comments INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE
    )`,

    // Civic Memory Archive
    `CREATE TABLE IF NOT EXISTS memory_archive (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      age INT,
      county VARCHAR(50),
      cause VARCHAR(200),
      context TEXT,
      date_of_death DATE,
      image_url VARCHAR(500),
      candles_lit INT DEFAULT 0,
      tags JSON,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // XP Transactions for tracking
    `CREATE TABLE IF NOT EXISTS xp_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL,
      action VARCHAR(50) NOT NULL,
      xp_earned INT NOT NULL,
      reference_id INT NULL,
      reference_type VARCHAR(50) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE
    )`
  ];

  tables.forEach((table, index) => {
    db.query(table, (err) => {
      if (err) {
        console.error(`Error creating table ${index + 1}:`, err);
      }
    });
  });

  console.log('✅ Database tables initialized');
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|m4a|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and audio files are allowed'));
    }
  }
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Image upload endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Rada.ke server is running',
    timestamp: new Date().toISOString()
  });
});

// User Management
app.post('/api/users/create', (req, res) => {
  const { nickname = 'Anonymous', emoji = '🧑', county = '' } = req.body;
  const userUuid = uuidv4();

  // For development, create user without database if connection fails
  const userData = {
    uuid: userUuid,
    nickname,
    emoji,
    county,
    xp: 0,
    badges: ['civic_newbie'],
    streak: 0
  };

  // Try to save to database if available
  db.query('INSERT INTO users (uuid, nickname, emoji, county) VALUES (?, ?, ?, ?)',
    [userUuid, nickname, emoji, county],
    (err, result) => {
      if (err) {
        console.error('Error creating user in database:', err);
        // Return user data anyway for development
        res.json(userData);
      } else {
        res.json(userData);
      }
    }
  );
});

// Get user profile
app.get('/api/users/:uuid', (req, res) => {
  const { uuid } = req.params;

  db.query('SELECT * FROM users WHERE uuid = ?', [uuid], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = results[0];
    user.badges = safeJSONParse(user.badges, []);
    res.json(user);
  });
});

// Update XP
app.post('/api/users/:uuid/xp', (req, res) => {
  const { uuid } = req.params;
  const { action, xp, referenceId, referenceType } = req.body;

  // First, record the XP transaction
  db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, ?, ?, ?, ?)',
    [uuid, action, xp, referenceId, referenceType],
    (err) => {
      if (err) {
        console.error('Error recording XP transaction:', err);
      }
    }
  );

  // Update user XP
  db.query('UPDATE users SET xp = xp + ?, last_active = CURRENT_DATE WHERE uuid = ?',
    [xp, uuid],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update XP' });
      }

      // Get updated user data
      db.query('SELECT xp, badges FROM users WHERE uuid = ?', [uuid], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        const user = results[0];
        res.json({
          xp: user.xp,
          badges: safeJSONParse(user.badges, [])
        });
      });
    }
  );
});

// Posts API
app.get('/api/posts', (req, res) => {
  const { type, county, featured, limit = 20, offset = 0 } = req.query;

  let query = `
    SELECT p.*, u.nickname, u.emoji
    FROM posts p
    JOIN users u ON p.uuid = u.uuid
    WHERE p.verified = TRUE
  `;
  let params = [];

  if (type) {
    query += ' AND p.type = ?';
    params.push(type);
  }

  if (county) {
    query += ' AND p.county = ?';
    params.push(county);
  }

  if (featured === 'true') {
    query += ' AND p.featured = TRUE';
  }

  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const posts = results.map(post => ({
      ...post,
      tags: safeJSONParse(post.tags, [])
    }));

    res.json(posts);
  });
});

app.post('/api/posts', upload.single('media'), (req, res) => {
  const { uuid, type, title, content, county, tags } = req.body;
  const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // Validate required fields
  if (!uuid || !type || !title) {
    return res.status(400).json({ error: 'Missing required fields: uuid, type, and title are required' });
  }

  // Validate post type
  const validTypes = ['story', 'report', 'poem', 'audio', 'image'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid post type. Must be one of: ' + validTypes.join(', ') });
  }

  db.query('INSERT INTO posts (uuid, type, title, content, media_url, county, tags) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [uuid, type, title, content, mediaUrl, county, tags],
    (err, result) => {
      if (err) {
        console.error('Error creating post:', err);
        return res.status(500).json({ error: 'Failed to create post' });
      }

      res.json({
        id: result.insertId,
        message: 'Post submitted for review'
      });
    }
  );
});

// Memory archive API
app.get('/api/memory', (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  db.query('SELECT * FROM memory_archive WHERE verified = TRUE ORDER BY candles_lit DESC, created_at DESC LIMIT ? OFFSET ?',
    [parseInt(limit), parseInt(offset)],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const memories = results.map(memory => ({
        ...memory,
        tags: safeJSONParse(memory.tags, [])
      }));

      res.json(memories);
    }
  );
});

// Light a candle for memory
app.post('/api/memory/:id/candle', (req, res) => {
  const { id } = req.params;
  const { uuid } = req.body;

  db.query('UPDATE memory_archive SET candles_lit = candles_lit + 1 WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to light candle' });
    }

    // Award XP to user
    if (uuid) {
      db.query('UPDATE users SET xp = xp + 3 WHERE uuid = ?', [uuid]);
    }

    res.json({ message: 'Candle lit successfully' });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  db.end(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  db.end(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Rada.ke server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`API base: http://localhost:${PORT}/api`);
});
