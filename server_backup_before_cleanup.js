const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'profile-pictures');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: user-uuid-timestamp.extension
    const userUuid = req.headers['x-user-uuid'] || 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${userUuid}-${timestamp}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Audit logging function
const auditLog = (event, details, req) => {
  const timestamp = new Date().toISOString();
  const ip = req?.ip || req?.connection?.remoteAddress || 'unknown';
  const userAgent = req?.get('User-Agent') || 'unknown';
  
  console.log(`🔍 AUDIT [${timestamp}] ${event}:`, {
    ip,
    userAgent,
    ...details
  });
  
  // In production, you would save this to a dedicated audit log table
  // db.query('INSERT INTO audit_logs (event, details, ip, user_agent, timestamp) VALUES (?, ?, ?, ?, ?)', 
  //   [event, JSON.stringify(details), ip, userAgent, timestamp]);
};

// Enhanced user role system imports
const enhancedAuthMiddleware = require('./enhanced_auth_middleware');
const enhancedApiRoutes = require('./enhanced_api_routes');
const contentApiRoutes = require('./content_api_routes_new');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Enhanced rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req) => {
    // Use IP + User-Agent for more precise rate limiting
    return `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
  },
});

// Stricter rate limiting for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Configure CORS
app.use(cors({
  origin: '*', // In production, replace with your specific domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-uuid', 'x-user-role']
}));

// Middleware

// Apply general API rate limiting to all routes
app.use(apiLimiter);
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// Database connection - using createPool instead of createConnection

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

// Enhanced rate limiting
app.use(enhancedAuthMiddleware.generalLimiter);
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

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    console.log('🔍 Attempting to create database...');
    
    // Try to create database if it doesn't exist
    const createDbConnection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    createDbConnection.query('CREATE DATABASE IF NOT EXISTS rada_ke', (createErr) => {
      if (createErr) {
        console.error('❌ Failed to create database:', createErr);
      } else {
        console.log('✅ Database "rada_ke" created successfully');
      }
      createDbConnection.end();
    });
  } else {
    console.log('✅ Connected to MySQL Database');
    connection.release();
  }
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

// Initialize database after connection is established
setTimeout(() => {
  initializeDatabase();
}, 2000); // Wait 2 seconds for database to be ready

// Handle database connection errors
db.on('error', (err) => {
  console.error('Database connection error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Attempting to reconnect to database...');
    db.getConnection((err, connection) => {
      if (err) {
        console.error('Reconnection failed:', err);
      } else {
        console.log('✅ Reconnected to MySQL Database');
        connection.release();
      }
    });
  }
});

// Initialize database tables
function initializeDatabase() {
  console.log('🔍 Checking database tables...');
  
  // Check if ALL required tables exist
  const requiredTables = [
    'users', 'posts', 'memory_archive', 'protests', 'learning_modules', 
    'quizzes', 'lessons', 'user_progress', 'xp_transactions', 'submit_requests',
    'learning_challenges', 'learning_badges', 'user_learning_stats', 
    'user_learning_progress', 'learning_quizzes', 'polls', 'user_badges', 'post_likes',
    'comments', 'bookmarks', 'post_shares', 'user_interactions'
  ];
  
  let existingTables = 0;
  let totalTables = requiredTables.length;
  
  requiredTables.forEach(tableName => {
    db.query(`SHOW TABLES LIKE "${tableName}"`, (err, results) => {
      if (err) {
        console.error(`Error checking table ${tableName}:`, err);
      } else if (results.length > 0) {
        existingTables++;
      }
      
      // If we've checked all tables
      if (existingTables + (totalTables - requiredTables.length) >= totalTables) {
        if (existingTables === totalTables) {
          console.log('✅ All database tables already exist, skipping table creation');
          seedInitialData();
        } else {
          console.log(`🔍 Found ${existingTables}/${totalTables} tables, creating missing tables...`);
          createTables();
        }
      }
    });
  });
  
  function createTables() {
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

    // Posts table for civic content - matching SocialMediaCard structure
    `CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL,
      type ENUM('story', 'report', 'poem', 'audio', 'image') NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT,
      full_content TEXT,
      media_url VARCHAR(500),
      county VARCHAR(50),
      tags JSON,
      verified BOOLEAN DEFAULT FALSE,
      featured BOOLEAN DEFAULT FALSE,
      flags INT DEFAULT 0,
      likes INT DEFAULT 0,
      comments INT DEFAULT 0,
      shares INT DEFAULT 0,
      read_time VARCHAR(20),
      has_voice_note BOOLEAN DEFAULT FALSE,
      voice_duration VARCHAR(10),
      is_anonymous BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Memory archive for civic heroes
    `CREATE TABLE IF NOT EXISTS memory_archive (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      achievement TEXT,
      date_of_death DATE,
      age INT,
      county VARCHAR(50),
      category VARCHAR(100),
      tags JSON,
      image_url VARCHAR(500),
      verified BOOLEAN DEFAULT FALSE,
      candles_lit INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Protests table
    `CREATE TABLE IF NOT EXISTS protests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      date DATE,
      location VARCHAR(200),
      county VARCHAR(50),
      purpose_tags JSON,
      turnout_estimate INT,
      outcome LONGTEXT,
      description LONGTEXT,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Learning modules table
    `CREATE TABLE IF NOT EXISTS learning_modules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      content TEXT,
      difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
      xp_reward INT DEFAULT 50,
      tags JSON,
      prerequisites JSON,
      icon VARCHAR(10),
      category VARCHAR(100),
      estimated_duration INT DEFAULT 30,
      status ENUM('draft', 'review', 'published') DEFAULT 'draft',
      is_featured BOOLEAN DEFAULT FALSE,
      completion_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Quizzes table
    `CREATE TABLE IF NOT EXISTS quizzes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      questions JSON,
      passing_score INT DEFAULT 70,
      time_limit INT DEFAULT 30,
      xp_reward INT DEFAULT 50,
      difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
      category VARCHAR(100),
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Lessons table
    `CREATE TABLE IF NOT EXISTS lessons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id INT,
      title VARCHAR(200) NOT NULL,
      content TEXT,
      order_index INT DEFAULT 0,
      xp_reward INT DEFAULT 25,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE
    )`,

    // User progress tracking
    `CREATE TABLE IF NOT EXISTS user_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL,
      module_id INT,
      quiz_id INT,
      completed BOOLEAN DEFAULT FALSE,
      progress_percentage INT DEFAULT 0,
      completed_at TIMESTAMP NULL,
      attempts INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    )`,

    // XP transactions for tracking
    `CREATE TABLE IF NOT EXISTS xp_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL,
      action VARCHAR(100) NOT NULL,
      xp_earned INT NOT NULL,
      reference_id INT,
      reference_type VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Submit requests for community content
    `CREATE TABLE IF NOT EXISTS submit_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL,
      type ENUM('hero', 'protest', 'story', 'other') NOT NULL,
      title VARCHAR(200),
      name VARCHAR(200),
      description TEXT,
      year INT,
      county VARCHAR(50),
      category VARCHAR(100),
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      review_notes TEXT,
      reviewed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Learning challenges table
    `CREATE TABLE IF NOT EXISTS learning_challenges (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      xp_reward INT DEFAULT 100,
      difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
      category VARCHAR(100),
      active BOOLEAN DEFAULT TRUE,
      start_date DATE,
      end_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Learning badges table
    `CREATE TABLE IF NOT EXISTS learning_badges (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      icon VARCHAR(10),
      required_xp INT DEFAULT 0,
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // User learning stats table
    `CREATE TABLE IF NOT EXISTS user_learning_stats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_uuid VARCHAR(36) NOT NULL,
      total_xp INT DEFAULT 0,
      badges_earned INT DEFAULT 0,
      modules_completed INT DEFAULT 0,
      challenges_completed INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // User learning progress table
    `CREATE TABLE IF NOT EXISTS user_learning_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_uuid VARCHAR(36) NOT NULL,
      module_id INT,
      progress_percentage INT DEFAULT 0,
      completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE
    )`,

    // Learning quizzes table (enhanced version)
    `CREATE TABLE IF NOT EXISTS learning_quizzes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      questions JSON,
      passing_score INT DEFAULT 70,
      time_limit INT DEFAULT 30,
      xp_reward INT DEFAULT 50,
      difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
      category VARCHAR(100),
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Polls table
    `CREATE TABLE IF NOT EXISTS polls (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      options JSON,
      active BOOLEAN DEFAULT TRUE,
      start_date DATE,
      end_date DATE,
      created_by VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // User badges table
    `CREATE TABLE IF NOT EXISTS user_badges (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_uuid VARCHAR(36) NOT NULL,
      badge_id INT,
      earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (badge_id) REFERENCES learning_badges(id) ON DELETE CASCADE
    )`,

    // Post likes table
    `CREATE TABLE IF NOT EXISTS post_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_uuid VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )`,

    // Comments table
    `CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      uuid VARCHAR(36) NOT NULL,
      content TEXT NOT NULL,
      parent_comment_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
    )`,

    // Comment likes table
    `CREATE TABLE IF NOT EXISTS comment_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      comment_id INT NOT NULL,
      uuid VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
    )`,

    // Bookmarks table
    `CREATE TABLE IF NOT EXISTS bookmarks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      uuid VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )`,

    // Post shares table
    `CREATE TABLE IF NOT EXISTS post_shares (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      uuid VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )`,

    // Promises table
    `CREATE TABLE IF NOT EXISTS promises (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      made_by VARCHAR(200),
      date_made DATE,
      deadline DATE,
      status ENUM('pending', 'in_progress', 'completed', 'broken') DEFAULT 'pending',
      county VARCHAR(50),
      tags JSON,
      evidence JSON,
      tracking_count INT DEFAULT 0,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Promise evidence table
    `CREATE TABLE IF NOT EXISTS promise_evidence (
      id INT AUTO_INCREMENT PRIMARY KEY,
      promise_id INT NOT NULL,
      uuid VARCHAR(36) NOT NULL,
      evidence_type VARCHAR(100) NOT NULL,
      description TEXT,
      url VARCHAR(500),
      county VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (promise_id) REFERENCES promises(id) ON DELETE CASCADE
    )`,

    // Poll votes table
    `CREATE TABLE IF NOT EXISTS poll_votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      poll_id INT NOT NULL,
      uuid VARCHAR(36) NOT NULL,
      option_index INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
    )`,

    // Youth groups table
    `CREATE TABLE IF NOT EXISTS youth_groups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      county VARCHAR(50),
      contact_info TEXT,
      tags JSON,
      member_count INT DEFAULT 0,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // User interactions table for tracking likes, bookmarks, comments
    `CREATE TABLE IF NOT EXISTS user_interactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_uuid VARCHAR(36) NOT NULL,
      post_id INT NOT NULL,
      interaction_type ENUM('like', 'bookmark', 'comment') NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_post_interaction (user_uuid, post_id, interaction_type),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )`,

    // Comments table for post comments
    `CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_uuid VARCHAR(36) NOT NULL,
      content TEXT NOT NULL,
      parent_comment_id INT NULL,
      likes INT DEFAULT 0,
      is_anonymous BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
    )`
  ];

  // Create tables sequentially
  let tableIndex = 0;
  
  function createNextTable() {
    if (tableIndex >= tables.length) {
      console.log('✅ Database tables initialized');
      seedInitialData();
      return;
    }
    
    db.query(tables[tableIndex], (err) => {
      if (err) {
        console.error('Error creating table:', err);
      }
      tableIndex++;
      createNextTable();
    });
  }
  
  createNextTable();
  }
}

// Seed initial data
function seedInitialData() {
  console.log('🔍 Checking for existing data...');
  
  // Check if data already exists
  db.query('SELECT COUNT(*) as count FROM memory_archive', (err, results) => {
    if (err) {
      console.error('Error checking existing data:', err);
      return;
    }
    
    if (results[0].count > 0) {
      console.log('✅ Database already contains sample data - skipping insertion');
      return;
    }
    
    // Insert sample memory archive data
    const sampleMemories = [
      {
        name: 'Dedan Kimathi',
        achievement: 'Mau Mau freedom fighter and independence leader',
        date_of_death: '1957-02-18',
        age: 35,
        county: 'Nyeri',
        category: 'freedom-fighters',
        tags: JSON.stringify(['mau-mau', 'independence', 'freedom-fighter']),
        verified: true
      },
      {
        name: 'Wangari Maathai',
        achievement: 'Environmental activist and Nobel Peace Prize winner',
        date_of_death: '2011-09-25',
        age: 71,
        county: 'Nyeri',
        category: 'environmental-activists',
        tags: JSON.stringify(['environment', 'nobel-prize', 'women-leaders']),
        verified: true
      }
    ];
    
    sampleMemories.forEach(memory => {
      db.query('INSERT INTO memory_archive (name, achievement, date_of_death, age, county, category, tags, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [memory.name, memory.achievement, memory.date_of_death, memory.age, memory.county, memory.category, memory.tags, memory.verified],
        (err) => {
          if (err) {
            console.error('Error inserting sample memory:', err);
          }
        }
      );
    });
    
      // Insert sample posts for the feed
  const samplePosts = [
    {
      uuid: 'sample-user-1',
      type: 'story',
      title: 'My First Civic Engagement',
      content: 'Today I attended my first community meeting and learned so much about local governance. It\'s amazing how much power we have as citizens when we come together!',
      county: 'Nairobi',
      tags: JSON.stringify(['community', 'governance', 'first-time']),
      verified: true,
      featured: true
    },
    {
      uuid: 'sample-user-2',
      type: 'report',
      title: 'Youth Climate Action in Mombasa',
      content: 'Young people in Mombasa are leading the way in environmental activism. We organized a beach cleanup and educated locals about plastic pollution.',
      county: 'Mombasa',
      tags: JSON.stringify(['climate', 'youth', 'environment', 'activism']),
      verified: true,
      featured: false
    },
    {
      uuid: 'sample-user-3',
      type: 'poem',
      title: 'Voice of the People',
      content: 'In every vote, a voice is heard\nIn every voice, a dream is shared\nTogether we build our nation\nWith hope and determination',
      county: 'Kisumu',
      tags: JSON.stringify(['poetry', 'democracy', 'hope', 'unity']),
      verified: false,
      featured: false
    }
  ];
  
  samplePosts.forEach(post => {
    db.query('INSERT INTO posts (uuid, type, title, content, county, tags, verified, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [post.uuid, post.type, post.title, post.content, post.county, post.tags, post.verified, post.featured],
      (err) => {
        if (err) {
          console.error('Error inserting sample post:', err);
        }
      }
    );
  });
  
  console.log('✅ Sample posts inserted');
  console.log('✅ Sample memory data inserted');
  
  // Add new columns to existing posts table if they don't exist
  const addNewColumns = [
    'ALTER TABLE posts ADD COLUMN IF NOT EXISTS full_content TEXT',
    'ALTER TABLE posts ADD COLUMN IF NOT EXISTS read_time VARCHAR(20)',
    'ALTER TABLE posts ADD COLUMN IF NOT EXISTS has_voice_note BOOLEAN DEFAULT FALSE',
    'ALTER TABLE posts ADD COLUMN IF NOT EXISTS voice_duration VARCHAR(10)',
    'ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE'
  ];
  
  addNewColumns.forEach((query, index) => {
    db.query(query, (err) => {
      if (err && !err.message.includes('Duplicate column name')) {
        console.error(`Error adding column ${index + 1}:`, err);
      }
    });
  });
  
  console.log('✅ Database schema updated for SocialMediaCard compatibility');
  
  // Insert sample promises
  const samplePromises = [
    {
      title: 'Youth Employment Initiative',
      description: 'Promise to create 100,000 new jobs for young people in the next 2 years',
      made_by: 'County Government',
      date_made: '2025-01-15',
      deadline: '2027-01-15',
      status: 'in_progress',
      county: 'Nairobi',
      tags: JSON.stringify(['employment', 'youth', 'development']),
      evidence: JSON.stringify([]),
      verified: true
    },
    {
      title: 'Road Infrastructure Development',
      description: 'Promise to complete 50km of new roads in rural areas',
      made_by: 'National Government',
      date_made: '2024-06-01',
      deadline: '2026-06-01',
      status: 'pending',
      county: 'Kisumu',
      tags: JSON.stringify(['infrastructure', 'roads', 'rural-development']),
      evidence: JSON.stringify([]),
      verified: true
    }
  ];
  
  samplePromises.forEach(promise => {
    db.query('INSERT INTO promises (title, description, made_by, date_made, deadline, status, county, tags, evidence, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [promise.title, promise.description, promise.made_by, promise.date_made, promise.deadline, promise.status, promise.county, promise.tags, promise.evidence, promise.verified],
      (err) => {
        if (err) {
          console.error('Error inserting sample promise:', err);
        }
      }
    );
  });
  
  console.log('✅ Sample promises inserted');
  clearProtestData();
  });
}

// Clear and seed protest data
function clearProtestData() {
  console.log('🔍 Clearing existing protest data...');
  
  db.query('DELETE FROM protests', (err) => {
    if (err) {
      console.error('Error clearing protests:', err);
    } else {
      console.log('Cleared existing protest data');
      
      // Insert new diverse protest data
      const sampleProtestData = [
        {
          title: 'Saba Saba March 1990',
          date: '1990-07-07',
          location: 'Nairobi',
          county: 'Nairobi',
          purpose_tags: JSON.stringify(['democracy', 'multi-party', 'freedom']),
          turnout_estimate: 50000,
          outcome: 'Led to multi-party democracy reforms',
          description: 'Historic march demanding multi-party democracy in Kenya',
          verified: true
        },
        {
          title: 'Youth Climate Strike 2019',
          date: '2019-09-20',
          location: 'Nairobi',
          county: 'Nairobi',
          purpose_tags: JSON.stringify(['climate-change', 'environment', 'youth-activism']),
          turnout_estimate: 2000,
          outcome: 'Increased climate awareness and policy discussions',
          description: 'Youth-led climate strike demanding climate action',
          verified: true
        }
      ];
      
      sampleProtestData.forEach(protest => {
        db.query('INSERT INTO protests (title, date, location, county, purpose_tags, turnout_estimate, outcome, description, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [protest.title, protest.date, protest.location, protest.county, protest.purpose_tags, protest.turnout_estimate, protest.outcome, protest.description, protest.verified],
          (err) => {
            if (err) {
              console.error('Error inserting sample protest:', err);
            }
          }
        );
      });
      
      console.log('🔍 Finished inserting sample protest data...');
      insertLearningSampleData();
    }
  });
}

// Insert learning system sample data
function insertLearningSampleData() {
  console.log('🔍 Inserting learning system sample data...');
  
  // Insert sample learning badges
  const sampleBadges = [
    {
      name: 'Constitution Scholar',
      description: 'Complete the Constitution basics module',
      icon: '🏛️',
      required_xp: 100,
      category: 'civics'
    },
    {
      name: 'Democracy Defender',
      description: 'Master civic participation concepts',
      icon: '🗳️',
      required_xp: 250,
      category: 'democracy'
    },
    {
      name: 'Devolution Expert',
      description: 'Understand county governance',
      icon: '🏢',
      required_xp: 300,
      category: 'governance'
    },
    {
      name: 'Rights Champion',
      description: 'Learn about human rights',
      icon: '⚖️',
      required_xp: 400,
      category: 'human-rights'
    }
  ];
  
  sampleBadges.forEach(badge => {
    db.query('INSERT INTO learning_badges (name, description, icon, required_xp, category) VALUES (?, ?, ?, ?, ?)',
      [badge.name, badge.description, badge.icon, badge.required_xp, badge.category],
      (err) => {
        if (err) {
          console.error('Error inserting sample badge:', err);
        }
      }
    );
  });
  
  // Insert sample learning challenges
  const sampleChallenges = [
    {
      title: 'Civic Engagement Challenge',
      description: 'Complete 5 civic activities in one week',
      xp_reward: 150,
      difficulty: 'medium',
      category: 'engagement',
      active: true,
      start_date: '2025-01-01',
      end_date: '2025-12-31'
    },
    {
      title: 'Constitution Master',
      description: 'Score 90%+ on Constitution quiz',
      xp_reward: 200,
      difficulty: 'hard',
      category: 'education',
      active: true,
      start_date: '2025-01-01',
      end_date: '2025-12-31'
    }
  ];
  
  sampleChallenges.forEach(challenge => {
    db.query('INSERT INTO learning_challenges (title, description, xp_reward, difficulty, category, active, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [challenge.title, challenge.description, challenge.xp_reward, challenge.difficulty, challenge.category, challenge.active, challenge.start_date, challenge.end_date],
      (err) => {
        if (err) {
          console.error('Error inserting sample challenge:', err);
        }
      }
    );
  });
  
  // Insert sample polls
  const samplePolls = [
    {
      title: 'Youth Civic Engagement Survey',
      description: 'How do you prefer to engage in civic activities?',
      options: JSON.stringify(['Social Media', 'Community Meetings', 'Online Platforms', 'Direct Action']),
      active: true,
      start_date: '2025-01-01',
      end_date: '2025-12-31'
    },
    {
      title: 'Most Important Civic Issue',
      description: 'What civic issue concerns you most?',
      options: JSON.stringify(['Education', 'Environment', 'Corruption', 'Youth Employment', 'Healthcare']),
      active: true,
      start_date: '2025-01-01',
      end_date: '2025-12-31'
    }
  ];
  
  samplePolls.forEach(poll => {
    db.query('INSERT INTO polls (title, description, options, active, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
      [poll.title, poll.description, poll.options, poll.active, poll.start_date, poll.end_date],
      (err) => {
        if (err) {
          console.error('Error inserting sample poll:', err);
        }
      }
    );
  });
  
  // Insert sample learning modules
  const sampleModules = [
    {
      title: 'Constitution Basics',
      description: 'Learn the fundamentals of Kenya\'s Constitution',
      content: 'This module covers the basic principles, rights, and structure of Kenya\'s Constitution.',
      difficulty: 'beginner',
      xp_reward: 100,
      tags: JSON.stringify(['constitution', 'basics', 'civics']),
      icon: '📜',
      category: 'civics',
      estimated_duration: 45,
      status: 'published',
      is_featured: true
    },
    {
      title: 'Civic Participation',
      description: 'How to actively participate in civic life',
      content: 'Learn about voting, community engagement, and making your voice heard.',
      difficulty: 'intermediate',
      xp_reward: 150,
      tags: JSON.stringify(['participation', 'voting', 'community']),
      icon: '🗳️',
      category: 'democracy',
      estimated_duration: 60,
      status: 'published',
      is_featured: true
    },
    {
      title: 'County Governance',
      description: 'Understanding devolution and county government',
      content: 'Explore how county governments work and your role in local governance.',
      difficulty: 'intermediate',
      xp_reward: 200,
      tags: JSON.stringify(['devolution', 'county', 'governance']),
      icon: '🏢',
      category: 'governance',
      estimated_duration: 75,
      status: 'published',
      is_featured: false
    }
  ];
  
  sampleModules.forEach(module => {
    db.query('INSERT INTO learning_modules (title, description, content, difficulty, xp_reward, tags, icon, category, estimated_duration, status, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [module.title, module.description, module.content, module.difficulty, module.xp_reward, module.tags, module.icon, module.category, module.estimated_duration, module.status, module.is_featured],
      (err) => {
        if (err) {
          console.error('Error inserting sample module:', err);
        }
      }
    );
  });
  
  // Insert sample lessons
  const sampleLessons = [
    {
      title: 'What is a Constitution?',
      content: 'A constitution is the supreme law of a country that defines the fundamental principles, rights, and structure of government.',
      order_index: 1,
      xp_reward: 25
    },
    {
      title: 'Your Rights as a Citizen',
      content: 'Every Kenyan citizen has fundamental rights and freedoms guaranteed by the Constitution.',
      order_index: 2,
      xp_reward: 25
    },
    {
      title: 'How to Vote',
      content: 'Voting is your fundamental right and responsibility as a citizen.',
      order_index: 1,
      xp_reward: 30
    }
  ];
  
  sampleLessons.forEach((lesson, index) => {
    // Assign lessons to modules (lesson 1-2 to module 1, lesson 3 to module 2)
    const moduleId = index < 2 ? 1 : 2;
    db.query('INSERT INTO lessons (module_id, title, content, order_index, xp_reward) VALUES (?, ?, ?, ?, ?)',
      [moduleId, lesson.title, lesson.content, lesson.order_index, lesson.xp_reward],
      (err) => {
        if (err) {
          console.error('Error inserting sample lesson:', err);
        }
      }
    );
  });
  
  console.log('✅ Learning system sample data inserted');
  console.log('✅ Database initialization complete');
}

// File upload configuration (using the storage defined above)

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Root route - serve React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Image upload endpoint
app.post('/api/upload-image', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    }

    try {
      console.log('📤 Image upload request received:', {
        hasFile: !!req.file,
        fileInfo: req.file ? {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: req.file.path
        } : null,
        headers: req.headers
      });

      if (!req.file) {
        console.log('❌ No file uploaded');
        return res.status(400).json({ error: 'No image file uploaded' });
      }

      const imageUrl = `/uploads/profile-pictures/${req.file.filename}`;
      
      console.log('✅ Image uploaded successfully:', imageUrl);
      console.log('📁 File saved to:', req.file.path);
      
      res.json({
        success: true,
        imageUrl: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('❌ Error processing upload:', error);
      res.status(500).json({ error: 'Failed to process upload: ' + error.message });
    }
  });
});

// API Routes

// Content/Feed endpoints
app.get('/api/content/feed', (req, res) => {
  const userUuid = req.headers['x-user-uuid'];
  const { limit = 20, offset = 0 } = req.query;
  
  // First, try to create the missing tables if they don't exist
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS user_interactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_uuid VARCHAR(36) NOT NULL,
      post_id INT NOT NULL,
      interaction_type ENUM('like', 'bookmark', 'comment') NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_post_interaction (user_uuid, post_id, interaction_type)
    );
    
    CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_uuid VARCHAR(36) NOT NULL,
      content TEXT NOT NULL,
      parent_comment_id INT NULL,
      likes INT DEFAULT 0,
      is_anonymous BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  
  // Create tables first
  db.query(createTablesQuery, (err) => {
    if (err) {
      console.error('Error creating tables:', err);
    }
    
    // Now try the feed query with fallback
    let query = `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.type,
        p.likes,
        p.comments,
        p.shares,
        p.created_at as timestamp,
        p.media_url as image,
        p.is_anonymous,
        u.nickname as author,
        u.emoji as author_avatar,
        CASE WHEN ui_like.is_active = 1 THEN TRUE ELSE FALSE END as isLiked,
        CASE WHEN ui_bookmark.is_active = 1 THEN TRUE ELSE FALSE END as isBookmarked
      FROM posts p
      LEFT JOIN users u ON p.uuid = u.uuid
      LEFT JOIN user_interactions ui_like ON p.id = ui_like.post_id AND ui_like.user_uuid = ? AND ui_like.interaction_type = 'like'
      LEFT JOIN user_interactions ui_bookmark ON p.id = ui_bookmark.post_id AND ui_bookmark.user_uuid = ? AND ui_bookmark.interaction_type = 'bookmark'
      WHERE p.verified = TRUE
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const params = userUuid ? [userUuid, userUuid, parseInt(limit), parseInt(offset)] : [null, null, parseInt(limit), parseInt(offset)];
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching feed with interactions:', err);
        
        // Fallback to simple query without interactions
        const fallbackQuery = `
          SELECT 
            p.id,
            p.title,
            p.content,
            p.type,
            p.likes,
            p.comments,
            p.shares,
            p.created_at as timestamp,
            p.media_url as image,
            p.is_anonymous,
            u.nickname as author,
            u.emoji as author_avatar
          FROM posts p
          LEFT JOIN users u ON p.uuid = u.uuid
          WHERE p.verified = TRUE
          ORDER BY p.created_at DESC
          LIMIT ? OFFSET ?
        `;
        
        db.query(fallbackQuery, [parseInt(limit), parseInt(offset)], (fallbackErr, fallbackResults) => {
          if (fallbackErr) {
            console.error('Error fetching fallback feed:', fallbackErr);
            return res.status(500).json({ error: 'Failed to fetch feed' });
          }
          
          // Transform results to match expected format
          const posts = fallbackResults.map(post => ({
            id: post.id.toString(),
            author: post.is_anonymous ? 'Anonymous' : post.author,
            content: post.content,
            title: post.title,
            timestamp: post.timestamp,
            likes: post.likes || 0,
            comments: post.comments || 0,
            shares: post.shares || 0,
            isLiked: false,
            isBookmarked: false,
            image: post.image,
            author_avatar: post.is_anonymous ? '👤' : post.author_avatar
          }));
          
          res.json(posts);
        });
        return;
      }
      
      // Transform results to match expected format
      const posts = results.map(post => ({
        id: post.id.toString(),
        author: post.is_anonymous ? 'Anonymous' : post.author,
        content: post.content,
        title: post.title,
        timestamp: post.timestamp,
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
        isLiked: post.isLiked || false,
        isBookmarked: post.isBookmarked || false,
        image: post.image,
        author_avatar: post.is_anonymous ? '👤' : post.author_avatar
      }));
      
      res.json(posts);
    });
  });
});

app.post('/api/content/posts', (req, res) => {
  const { title, content, image, type } = req.body;
  const userUuid = req.headers['x-user-uuid'];
  
  if (!userUuid) {
    return res.status(401).json({ error: 'User authentication required' });
  }
  
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Post content is required' });
  }
  
  // Create post in database
  const postData = {
    uuid: userUuid,
    type: type || 'story', // Use provided type or default to 'story'
    title: title || content.substring(0, 100) + (content.length > 100 ? '...' : ''),
    content: content.trim(),
    county: '', // Will be updated from user profile
    tags: JSON.stringify([]),
    verified: true, // Auto-verify community posts
    featured: false
  };
  
  db.query(`
    INSERT INTO posts (uuid, type, title, content, county, tags, verified, featured, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `, [
    postData.uuid,
    postData.type,
    postData.title,
    postData.content,
    postData.county,
    postData.tags,
    postData.verified,
    postData.featured
  ], (err, result) => {
    if (err) {
      console.error('Error creating post:', err);
      return res.status(500).json({ error: 'Failed to create post' });
    }
    
    // Get user info for response
    db.query('SELECT nickname, emoji FROM users WHERE uuid = ?', [userUuid], (userErr, userResults) => {
      if (userErr) {
        console.error('Error fetching user info:', userErr);
      }
      
      const user = userResults[0] || { nickname: 'Anonymous', emoji: '👤' };
      
      const newPost = {
        id: result.insertId,
        title: postData.title,
        content: postData.content,
        author: user.nickname,
        author_avatar: user.emoji,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false,
        image: image || null,
        verified: true
      };
      
      console.log('✅ Post created successfully:', { id: result.insertId, author: user.nickname, title: postData.title });
      res.json(newPost);
    });
  });
});

app.post('/api/content/posts/:id/like', (req, res) => {
  const { id } = req.params;
  const { isLiked } = req.body;
  const userUuid = req.headers['x-user-uuid'];
  
  if (!userUuid) {
    return res.status(401).json({ error: 'User authentication required' });
  }
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }
  
  const postId = parseInt(id);
  
  // First ensure the user_interactions table exists
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_interactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_uuid VARCHAR(36) NOT NULL,
      post_id INT NOT NULL,
      interaction_type ENUM('like', 'bookmark', 'comment') NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_post_interaction (user_uuid, post_id, interaction_type)
    );
  `;
  
  db.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating user_interactions table:', err);
    }
    
    // Check if post exists
    db.query('SELECT id FROM posts WHERE id = ?', [postId], (err, results) => {
      if (err) {
        console.error('Error checking post:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      if (isLiked) {
        // Add like
        db.query(`
          INSERT INTO user_interactions (user_uuid, post_id, interaction_type, is_active) 
          VALUES (?, ?, 'like', TRUE)
          ON DUPLICATE KEY UPDATE is_active = TRUE, updated_at = CURRENT_TIMESTAMP
        `, [userUuid, postId], (err, result) => {
          if (err) {
            console.error('Error adding like:', err);
            return res.status(500).json({ error: 'Failed to like post' });
          }
          
          // Update post likes count
          db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
          
          res.json({ 
            success: true, 
            postId: id,
            isLiked: true,
            message: 'Post liked!'
          });
        });
      } else {
        // Remove like
        db.query(`
          UPDATE user_interactions 
          SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
          WHERE user_uuid = ? AND post_id = ? AND interaction_type = 'like'
        `, [userUuid, postId], (err, result) => {
          if (err) {
            console.error('Error removing like:', err);
            return res.status(500).json({ error: 'Failed to unlike post' });
          }
          
          // Update post likes count
          db.query('UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = ?', [postId]);
          
          res.json({ 
            success: true, 
            postId: id,
            isLiked: false,
            message: 'Post unliked!'
          });
        });
      }
    });
  });
});

app.post('/api/content/posts/:id/comments', (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const userUuid = req.headers['x-user-uuid'];
  
  if (!userUuid) {
    return res.status(401).json({ error: 'User authentication required' });
  }
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }
  
  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: 'Comment content is required' });
  }
  
  const postId = parseInt(id);
  
  // Check if post exists
  db.query('SELECT id FROM posts WHERE id = ?', [postId], (err, results) => {
    if (err) {
      console.error('Error checking post:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Add comment
    db.query(`
      INSERT INTO comments (post_id, user_uuid, content, is_anonymous) 
      VALUES (?, ?, ?, FALSE)
    `, [postId, userUuid, comment.trim()], (err, result) => {
      if (err) {
        console.error('Error adding comment:', err);
        return res.status(500).json({ error: 'Failed to add comment' });
      }
      
      // Update post comments count
      db.query('UPDATE posts SET comments = comments + 1 WHERE id = ?', [postId]);
      
      res.json({ 
        success: true, 
        postId: id,
        commentId: result.insertId,
        comment: comment.trim(),
        message: 'Comment added successfully'
      });
    });
  });
});

app.post('/api/content/posts/:id/bookmark', (req, res) => {
  const { id } = req.params;
  const { isBookmarked } = req.body;
  const userUuid = req.headers['x-user-uuid'];
  
  if (!userUuid) {
    return res.status(401).json({ error: 'User authentication required' });
  }
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }
  
  const postId = parseInt(id);
  
  // Check if post exists
  db.query('SELECT id FROM posts WHERE id = ?', [postId], (err, results) => {
    if (err) {
      console.error('Error checking post:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (isBookmarked) {
      // Add bookmark
      db.query(`
        INSERT INTO user_interactions (user_uuid, post_id, interaction_type, is_active) 
        VALUES (?, ?, 'bookmark', TRUE)
        ON DUPLICATE KEY UPDATE is_active = TRUE, updated_at = CURRENT_TIMESTAMP
      `, [userUuid, postId], (err, result) => {
        if (err) {
          console.error('Error adding bookmark:', err);
          return res.status(500).json({ error: 'Failed to bookmark post' });
        }
        
        res.json({ 
          success: true, 
          postId: id,
          isBookmarked: true,
          message: 'Post bookmarked!'
        });
      });
    } else {
      // Remove bookmark
      db.query(`
        UPDATE user_interactions 
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
        WHERE user_uuid = ? AND post_id = ? AND interaction_type = 'bookmark'
      `, [userUuid, postId], (err, result) => {
        if (err) {
          console.error('Error removing bookmark:', err);
          return res.status(500).json({ error: 'Failed to unbookmark post' });
        }
        
        res.json({ 
          success: true, 
          postId: id,
          isBookmarked: false,
          message: 'Post unbookmarked!'
        });
      });
    }
  });
});

// Check username availability
app.post('/api/users/check-username', (req, res) => {
  const { username } = req.body;
  
  if (!username || !username.trim()) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const trimmedUsername = username.trim();
  
  // Username validation
  if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
    return res.status(400).json({ 
      available: false, 
      error: 'Username must be 3-20 characters long' 
    });
  }

  if (!/^[a-zA-Z0-9._]+$/.test(trimmedUsername)) {
    return res.status(400).json({ 
      available: false, 
      error: 'Username can only contain letters, numbers, dots, and underscores' 
    });
  }

  // Check if username exists
  db.query('SELECT nickname FROM users WHERE nickname = ?', [trimmedUsername], (err, results) => {
    if (err) {
      console.error('Database error during username check:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const isAvailable = results.length === 0;
    
    res.json({ 
      available: isAvailable,
      username: trimmedUsername,
      message: isAvailable ? 'Username is available!' : `Username '${trimmedUsername}' is already taken`
    });
  });
});

// Get security question for user
app.post('/api/users/security-question', authLimiter, (req, res) => {
  const { username } = req.body;
  
  // Clear validation
  if (!username || !username.trim()) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const trimmedUsername = username.trim();
  
  // Username validation
  if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
    return res.status(400).json({ error: 'Username must be 3-20 characters long' });
  }

  if (!/^[a-zA-Z0-9._]+$/.test(trimmedUsername)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, dots, and underscores' });
  }

  console.log('🔍 Security Question Request for:', trimmedUsername);

  db.query('SELECT security_question FROM users WHERE nickname = ?', [trimmedUsername], (err, results) => {
    if (err) {
      console.error('Database error during security question lookup:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      console.log('❌ User not found:', trimmedUsername);
      return res.status(404).json({ error: `User '${trimmedUsername}' not found` });
    }

    const user = results[0];
    if (!user.security_question) {
      console.log('❌ No security question set for:', trimmedUsername);
      return res.status(400).json({ error: 'No security question set for this account' });
    }

    console.log('✅ Security question found for:', trimmedUsername);
    res.json({ 
      securityQuestion: user.security_question
    });
  });
});

// Verify security answer
app.post('/api/users/verify-security-answer', authLimiter, (req, res) => {
  const { username, securityAnswer } = req.body;
  
  if (!username || !securityAnswer) {
    return res.status(400).json({ error: 'Username and security answer are required' });
  }

  db.query('SELECT security_answer FROM users WHERE nickname = ?', [username.trim()], (err, results) => {
    if (err) {
      console.error('Database error during security answer verification:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = results[0];
    
    // Verify security answer (in a real app, this would be hashed)
    console.log('🔍 Security Answer Debug:', {
      username: username.trim(),
      stored: user.security_answer,
      received: securityAnswer.trim(),
      storedLength: user.security_answer?.length,
      receivedLength: securityAnswer.trim().length,
      areEqual: user.security_answer === securityAnswer.trim(),
      storedType: typeof user.security_answer,
      receivedType: typeof securityAnswer.trim()
    });
    
    if (user.security_answer !== securityAnswer.trim()) {
      console.log('❌ Security answer mismatch:', {
        stored: `"${user.security_answer}"`,
        received: `"${securityAnswer.trim()}"`,
        exactMatch: user.security_answer === securityAnswer.trim()
      });
      return res.status(401).json({ error: 'Invalid security answer' });
    }

    res.json({ message: 'Security answer verified successfully' });
  });
});

// Password reset endpoint
app.post('/api/users/reset-password', passwordResetLimiter, (req, res) => {
  const { username, securityAnswer, newPassword } = req.body;
  
  if (!username || !securityAnswer || !newPassword) {
    return res.status(400).json({ error: 'Username, security answer, and new password are required' });
  }

  // Strong password policy
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return res.status(400).json({ 
      error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    });
  }

  // Check if user exists and verify security answer
  db.query('SELECT * FROM users WHERE nickname = ?', [username.trim()], (err, results) => {
    if (err) {
      console.error('Database error during password reset:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = results[0];
    
    // Verify security answer (in a real app, this would be hashed)
    if (user.security_answer !== securityAnswer.trim()) {
      auditLog('PASSWORD_RESET_FAILED', { username: username.trim(), reason: 'Invalid security answer' }, req);
      return res.status(401).json({ error: 'Invalid security answer' });
    }

    // Hash new password
    bcrypt.hash(newPassword, 12, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error('Error hashing password:', hashErr);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Update password and reset login attempts
      db.query(
        'UPDATE users SET password = ?, login_attempts = 0, locked_until = NULL WHERE nickname = ?',
        [hashedPassword, username.trim()],
        (updateErr) => {
          if (updateErr) {
            console.error('Error updating password:', updateErr);
            return res.status(500).json({ error: 'Internal server error' });
          }

          auditLog('PASSWORD_RESET_SUCCESS', { username: username.trim() }, req);
          res.json({ message: 'Password reset successfully' });
        }
      );
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Rada.ke server is running',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});


// User Management
app.post('/api/users/create', authLimiter, (req, res) => {
  const { nickname = 'Anonymous', emoji = '🧑', county = '', password = null, securityQuestion = '', securityAnswer = '' } = req.body;
  const userUuid = uuidv4();

  auditLog('USER_REGISTRATION_ATTEMPT', { nickname, county, hasPassword: !!password }, req);
  console.log('🔍 Backend: Creating user with data:', { 
    nickname, 
    emoji, 
    county, 
    hasPassword: !!password,
    passwordLength: password ? password.length : 0,
    hasSecurityQuestion: !!securityQuestion,
    hasSecurityAnswer: !!securityAnswer,
    fullBody: req.body
  });

  // Input validation
  if (!nickname || nickname.trim().length < 3) {
    console.log('❌ Backend: Username validation failed:', { nickname, length: nickname ? nickname.length : 0 });
    return res.status(400).json({ error: 'Username must be at least 3 characters long' });
  }

  const trimmedNickname = nickname.trim();
  
  // Username format validation
  if (!/^[a-zA-Z0-9._]+$/.test(trimmedNickname)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, dots, and underscores' });
  }

  if (trimmedNickname.length > 20) {
    return res.status(400).json({ error: 'Username must be 20 characters or less' });
  }
  
  // Strong password policy
  if (!password || password.length < 8) {
    console.log('❌ Backend: Password length validation failed:', { passwordLength: password ? password.length : 0 });
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }
  
  // Check password strength
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    console.log('❌ Backend: Password strength validation failed:', { 
      hasUpperCase, 
      hasLowerCase, 
      hasNumbers, 
      hasSpecialChar,
      password: password.substring(0, 3) + '...' // Only show first 3 chars for security
    });
    return res.status(400).json({ 
      error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    });
  }

  // Check if username already exists
  db.query('SELECT uuid FROM users WHERE nickname = ?', [nickname.trim()], (err, results) => {
    if (err) {
      console.error('Error checking username:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const saltRounds = 12;
    bcrypt.hash(password, saltRounds, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error('Error hashing password:', hashErr);
        return res.status(500).json({ error: 'Failed to process password' });
      }

      // Check if username already exists
      db.query('SELECT nickname FROM users WHERE nickname = ?', [trimmedNickname], (checkErr, checkResults) => {
        if (checkErr) {
          console.error('❌ Backend: Error checking username uniqueness:', checkErr);
          return res.status(500).json({ error: 'Failed to check username availability' });
        }

        if (checkResults.length > 0) {
          console.log('❌ Backend: Username already exists:', trimmedNickname);
          return res.status(409).json({ error: `Username '${trimmedNickname}' is already taken` });
        }

        // Create user with hashed password and security question
        console.log('🔍 Backend: Inserting user into database with:', { userUuid, nickname: trimmedNickname, emoji, county, hasPassword: !!hashedPassword, hasSecurityQuestion: !!securityQuestion });
        db.query('INSERT INTO users (uuid, nickname, emoji, county, password, security_question, security_answer) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userUuid, trimmedNickname, emoji, county, hashedPassword, securityQuestion, securityAnswer],
    (err, result) => {
      if (err) {
          console.error('❌ Backend: Error creating user:', err);
        return res.status(500).json({ error: 'Failed to create user' });
      }

        console.log('✅ Backend: User created successfully in database');
        auditLog('USER_REGISTRATION_SUCCESS', { uuid: userUuid, nickname }, req);

        const responseData = {
        uuid: userUuid,
        nickname,
        emoji,
        county,
        xp: 0,
        badges: [],
          streak: 0,
          hasPassword: !!password
        };
        
        console.log('🔍 Backend: Sending response:', responseData);
        res.json(responseData);
      }
    );
  }); // <- THIS WAS MISSING: closing brace and parenthesis for username check callback
}); // <- closing brace and parenthesis for bcrypt.hash callback
}); // <- closing brace and parenthesis for first username check callback
});

// User login endpoint
app.post('/api/users/login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  
  auditLog('LOGIN_ATTEMPT', { username, hasPassword: !!password }, req);
  console.log('🔍 Backend: Login attempt with:', { username, hasPassword: !!password, passwordLength: password ? password.length : 0 });

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  if (username.trim().length < 3) {
    return res.status(400).json({ error: 'Invalid username format' });
  }

  // Find user by username
  db.query('SELECT * FROM users WHERE nickname = ?', [username.trim()], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    console.log('🔍 Backend: Database query results:', { 
      foundUsers: results.length, 
      username: username.trim(),
      hasResults: results.length > 0 
    });

    if (results.length === 0) {
      console.log('🔍 Backend: User does not exist in database');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = results[0];
    
    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      const lockTimeRemaining = Math.ceil((new Date(user.locked_until) - new Date()) / 1000 / 60);
      console.log('🔒 Backend: Account locked for user:', username.trim(), 'Minutes remaining:', lockTimeRemaining);
      return res.status(423).json({ 
        error: 'Account temporarily locked due to too many failed attempts',
        lockTimeRemaining: lockTimeRemaining
      });
    }
    
    // Verify password using bcrypt
    bcrypt.compare(password, user.password, (compareErr, isMatch) => {
      if (compareErr) {
        console.error('Error comparing passwords:', compareErr);
        return res.status(500).json({ error: 'Authentication error' });
      }

      if (!isMatch) {
        console.log('🔍 Backend: Password mismatch for user:', username.trim());
        
        // Increment failed login attempts
        const newAttempts = (user.login_attempts || 0) + 1;
        const maxAttempts = 5;
        const lockDuration = 15; // minutes
        
        if (newAttempts >= maxAttempts) {
          // Lock account for 15 minutes
          const lockUntil = new Date(Date.now() + lockDuration * 60 * 1000);
          db.query('UPDATE users SET login_attempts = ?, locked_until = ? WHERE uuid = ?', 
            [newAttempts, lockUntil, user.uuid], (lockErr) => {
              if (lockErr) console.error('Error locking account:', lockErr);
            });
          
          console.log('🔒 Backend: Account locked for user:', username.trim(), 'until:', lockUntil);
          return res.status(423).json({ 
            error: 'Account locked due to too many failed attempts. Try again in 15 minutes.',
            lockTimeRemaining: lockDuration
          });
        } else {
          // Update failed attempts
          db.query('UPDATE users SET login_attempts = ? WHERE uuid = ?', 
            [newAttempts, user.uuid], (updateErr) => {
              if (updateErr) console.error('Error updating login attempts:', updateErr);
            });
          
          return res.status(401).json({ 
            error: 'Invalid username or password',
            attemptsRemaining: maxAttempts - newAttempts
          });
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          uuid: user.uuid, 
          nickname: user.nickname,
          role: user.role || 'user'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Reset failed attempts and update last active timestamp
      db.query('UPDATE users SET login_attempts = 0, locked_until = NULL, last_active = CURRENT_TIMESTAMP WHERE uuid = ?', [user.uuid], (err) => {
        if (err) {
          console.error('Error updating user status:', err);
        }
      });

      console.log('✅ Backend: User logged in successfully:', { username: user.nickname, uuid: user.uuid });
      auditLog('LOGIN_SUCCESS', { uuid: user.uuid, nickname: user.nickname }, req);

      res.json({
        token,
        user: {
          uuid: user.uuid,
          nickname: user.nickname,
          emoji: user.emoji,
          county: user.county,
          xp: user.xp || 0,
          badges: user.badges || [],
          streak: user.streak || 0,
          hasPassword: !!user.password
        }
      });
    });
  });
});

// Admin login endpoint
app.post('/api/admin/login', authLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  console.log('🔍 Admin login attempt with:', { email, hasPassword: !!password });

  // Check if user exists and has admin role
  db.query('SELECT * FROM users WHERE email = ? AND role = "admin"', [email], (err, results) => {
    if (err) {
      console.error('❌ Admin login database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      console.log('❌ Admin login: No admin user found with email:', email);
      auditLog('ADMIN_LOGIN_FAILED', { email, reason: 'User not found or not admin' }, req);
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const admin = results[0];

    // Check if account is locked
    if (admin.locked_until && new Date() < new Date(admin.locked_until)) {
      console.log('❌ Admin login: Account locked until:', admin.locked_until);
      auditLog('ADMIN_LOGIN_FAILED', { email, reason: 'Account locked' }, req);
      return res.status(423).json({ error: 'Account temporarily locked due to too many failed attempts' });
    }

    // Verify password
    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err) {
        console.error('❌ Admin password verification error:', err);
        return res.status(500).json({ error: 'Authentication error' });
      }

      if (!isMatch) {
        console.log('❌ Admin login: Invalid password for:', email);
        
        // Increment failed attempts
        const failedAttempts = (admin.login_attempts || 0) + 1;
        const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
        
        db.query('UPDATE users SET login_attempts = ?, locked_until = ? WHERE uuid = ?', 
          [failedAttempts, lockUntil, admin.uuid], (err) => {
            if (err) console.error('Error updating failed attempts:', err);
          });

        auditLog('ADMIN_LOGIN_FAILED', { email, reason: 'Invalid password' }, req);
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }

      // Generate JWT token for admin
      const token = jwt.sign(
        { 
          uuid: admin.uuid, 
          nickname: admin.nickname,
          email: admin.email,
          role: admin.role || 'admin',
          permissions: admin.permissions ? JSON.parse(admin.permissions) : []
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Reset failed attempts and update last active timestamp
      db.query('UPDATE users SET login_attempts = 0, locked_until = NULL, last_active = CURRENT_TIMESTAMP WHERE uuid = ?', [admin.uuid], (err) => {
        if (err) {
          console.error('Error updating admin status:', err);
        }
      });

      console.log('✅ Admin logged in successfully:', { email, uuid: admin.uuid });
      auditLog('ADMIN_LOGIN_SUCCESS', { uuid: admin.uuid, email, nickname: admin.nickname }, req);

      res.json({
        token,
        user: {
          uuid: admin.uuid,
          nickname: admin.nickname,
          email: admin.email,
          emoji: admin.emoji,
          county: admin.county,
          role: admin.role || 'admin',
          permissions: admin.permissions ? JSON.parse(admin.permissions) : [],
          xp: admin.xp || 0,
          badges: admin.badges || [],
          streak: admin.streak || 0
        }
      });
    });
  });
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

// Get user profile data for profile screen
app.get('/api/users/:uuid/profile', (req, res) => {
  const { uuid } = req.params;

  db.query(`
    SELECT 
      uuid, nickname, emoji, county, bio, xp, level, trust_score, badges, streak,
      created_at, last_active
    FROM users 
    WHERE uuid = ?
  `, [uuid], (err, results) => {
    if (err) {
      console.error('Error fetching user profile:', err);
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

// Get user activity history
app.get('/api/users/:uuid/activity', (req, res) => {
  const { uuid } = req.params;
  const { limit = 10 } = req.query;

  // For now, return mock data - you can implement real activity tracking later
  const mockActivity = [
    {
      id: 1,
      type: 'module_completion',
      title: 'Completed "Civic Rights" module',
      description: 'Finished learning about civic rights and responsibilities',
      xp: 25,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      icon: '📚'
    },
    {
      id: 2,
      type: 'badge_earned',
      title: 'Earned "Trust Builder" badge',
      description: 'Built trust through consistent civic engagement',
      xp: 50,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      icon: '🏆'
    },
    {
      id: 3,
      type: 'evidence_submission',
      title: 'Submitted promise evidence',
      description: 'Provided evidence for political promise verification',
      xp: 15,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      icon: '📊'
    }
  ];

  res.json(mockActivity.slice(0, parseInt(limit)));
});

// Get user saved items
app.get('/api/users/:uuid/saved', (req, res) => {
  const { uuid } = req.params;

  // For now, return mock data - you can implement real saved items later
  const mockSavedItems = [
    {
      id: 1,
      type: 'post',
      title: 'Great insights on civic engagement',
      description: 'Community discussion about local governance',
      savedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      icon: '💬'
    },
    {
      id: 2,
      type: 'article',
      title: 'Understanding Civic Rights',
      description: 'Comprehensive guide to civic rights and responsibilities',
      savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      icon: '📄'
    },
    {
      id: 3,
      type: 'promise',
      title: 'Infrastructure Development Plan',
      description: 'Political promise about local infrastructure improvements',
      savedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      icon: '🎯'
    }
  ];

  res.json(mockSavedItems);
});

// Update user profile
app.put('/api/users/:uuid/profile', (req, res) => {
  const { uuid } = req.params;
  const { bio, county, emoji } = req.body;

  const updateFields = [];
  const updateValues = [];

  if (bio !== undefined) {
    updateFields.push('bio = ?');
    updateValues.push(bio);
  }
  if (county !== undefined) {
    updateFields.push('county = ?');
    updateValues.push(county);
  }
  if (emoji !== undefined) {
    updateFields.push('emoji = ?');
    updateValues.push(emoji);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updateValues.push(uuid);

  db.query(`
    UPDATE users 
    SET ${updateFields.join(', ')}
    WHERE uuid = ?
  `, updateValues, (err, result) => {
    if (err) {
      console.error('Error updating user profile:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  });
});

// Learning System API
app.get('/api/learning/modules', (req, res) => {
  db.query('SELECT * FROM learning_modules WHERE status = "published" ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching learning modules:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const modules = results.map(module => ({
      ...module,
      tags: safeJSONParse(module.tags, []),
      prerequisites: safeJSONParse(module.prerequisites, [])
    }));

    res.json({ data: modules });
  });
});

// Get lessons for a module
app.get('/api/learning/modules/:moduleId/lessons', (req, res) => {
  const { moduleId } = req.params;
  
  db.query('SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index ASC', [moduleId], (err, results) => {
    if (err) {
      console.error('Error fetching lessons:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ data: results || [] });
  });
});

// Get learning quizzes
app.get('/api/learning/quizzes', (req, res) => {
  // Use the correct column name: 'active' instead of 'status'
  db.query('SELECT * FROM learning_quizzes WHERE active = 1 ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching quizzes:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Transform the data to match what the app expects
    const quizzes = results.map(quiz => {
      let parsedQuestions = [];
      let questionCount = 0;
      
      try {
        if (quiz.questions && typeof quiz.questions === 'string') {
          parsedQuestions = JSON.parse(quiz.questions);
          questionCount = Array.isArray(parsedQuestions) ? parsedQuestions.length : 0;
        }
      } catch (parseError) {
        console.error('Error parsing quiz questions for quiz ID:', quiz.id, parseError);
        parsedQuestions = [];
        questionCount = 0;
      }
      
      return {
        ...quiz,
        status: quiz.active ? 'active' : 'inactive',
        timeLimit: quiz.time_limit,
        passingScore: quiz.passing_score,
        question_count: questionCount,
        questions: parsedQuestions
      };
    });

    res.json({ data: quizzes });
  });
});

// Get learning challenges
app.get('/api/learning/challenges', (req, res) => {
  // Check what columns exist in your challenges table
  db.query('SELECT * FROM learning_challenges ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching challenges:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Transform the data to match what the app expects
    const challenges = results.map(challenge => {
      try {
        return {
          ...challenge,
          status: challenge.status || 'active',
          duration: challenge.duration || '7 days',
          participants: challenge.participants || 0,
          deadline: challenge.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          image: challenge.icon || '🎯'
        };
      } catch (error) {
        console.error('Error processing challenge:', challenge.id, error);
        return {
          id: challenge.id,
          title: challenge.title || 'Unknown Challenge',
          description: challenge.description || 'Challenge description not available',
          status: 'active',
          duration: '7 days',
          participants: 0,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          image: '🎯'
        };
      }
    });

    res.json({ data: challenges });
  });
});

// Get learning badges
app.get('/api/learning/badges', (req, res) => {
  // Check what columns exist in your badges table
  db.query('SELECT * FROM learning_badges ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching badges:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Transform the data to match what the app expects
    const badges = results.map(badge => ({
      ...badge,
      title: badge.name, // Map 'name' to 'title' for the app
      status: 'active',
      xp_requirement: badge.required_xp || 0,
      is_earned: false, // Will be determined by user progress
      earned_date: null
    }));

    res.json({ data: badges });
  });
});

// Get user learning stats
app.get('/api/learning/stats/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.query(`
    SELECT 
      COUNT(DISTINCT up.module_id) as completed_modules,
      COUNT(DISTINCT qa.quiz_id) as quizzes_completed,
      COUNT(DISTINCT cc.challenge_id) as challenges_participated,
      COALESCE(SUM(up.xp_earned), 0) as total_xp,
      u.learning_streak
    FROM users u
    LEFT JOIN user_progress up ON u.uuid = up.user_id AND up.is_completed = 1
    LEFT JOIN quiz_attempts qa ON u.uuid = qa.user_id
    LEFT JOIN challenge_participants cc ON u.uuid = cc.user_id
    WHERE u.uuid = ?
    GROUP BY u.uuid
  `, [userId], (err, results) => {
    if (err) {
      console.log('User stats table not found, returning fallback data');
      // Return fallback user stats
      const fallbackStats = {
        completed_modules: 2,
        quizzes_completed: 1,
        challenges_participated: 2,
        total_xp: 150,
        learning_streak: 5,
        weekly_xp: 45,
        monthly_xp: 180,
        posts_count: 3,
        comments_count: 12,
        likes_received: 25,
        shares_count: 5,
        completion_rate: 75,
        learning_hours: 8,
        community_rank: 156,
        county_rank: 23,
        weekly_streak: 3,
        longest_streak: 12
      };
      return res.json({ data: fallbackStats });
    }

    const stats = results[0] || {
      completed_modules: 0,
      quizzes_completed: 0,
      challenges_participated: 0,
      total_xp: 0,
      learning_streak: 0
    };

    res.json({ data: stats });
  });
});

// Get user progress
app.get('/api/learning/user-progress/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.query(`
    SELECT 
      up.module_id,
      up.progress_percentage,
      up.is_completed,
      up.last_accessed
    FROM user_progress up
    WHERE up.user_id = ?
  `, [userId], (err, results) => {
    if (err) {
      console.log('User progress table not found, returning fallback data');
      // Return fallback user progress data
      const fallbackProgress = [
        {
          module_id: 1,
          progress_percentage: 60,
          is_completed: false,
          last_accessed: new Date().toISOString()
        },
        {
          module_id: 2,
          progress_percentage: 100,
          is_completed: true,
          last_accessed: new Date().toISOString()
        },
        {
          module_id: 3,
          progress_percentage: 25,
          is_completed: false,
          last_accessed: new Date().toISOString()
        }
      ];
      return res.json({ data: { modules: fallbackProgress } });
    }

    res.json({ data: { modules: results } });
  });
});

// Update module progress
app.put('/api/learning/progress/:userId/:moduleId', (req, res) => {
  const { userId, moduleId } = req.params;
  const { progress_percentage, completed_lessons, is_completed } = req.body;
  
  db.query(`
    INSERT INTO user_progress (user_id, module_id, progress_percentage, completed_lessons, is_completed, last_accessed)
    VALUES (?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
    progress_percentage = VALUES(progress_percentage),
    completed_lessons = VALUES(completed_lessons),
    is_completed = VALUES(is_completed),
    last_accessed = NOW()
  `, [userId, moduleId, progress_percentage, completed_lessons, is_completed], (err) => {
    if (err) {
      console.error('Error updating progress:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ success: true, message: 'Progress updated' });
  });
});

// Submit quiz attempt
app.post('/api/learning/quiz-attempt', (req, res) => {
  const { userId, quizId, score, totalQuestions, percentage, passed, timeTaken, answers, xpEarned } = req.body;
  
  db.query(`
    INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, percentage, passed, time_taken, answers, xp_earned, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `, [userId, quizId, score, totalQuestions, percentage, passed, timeTaken, JSON.stringify(answers), xpEarned], (err) => {
    if (err) {
      console.error('Error submitting quiz attempt:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Award XP to user
    if (xpEarned > 0) {
      db.query('UPDATE users SET xp = xp + ? WHERE uuid = ?', [xpEarned, userId]);
    }

    res.json({ success: true, message: 'Quiz attempt recorded' });
  });
});

// Join challenge
app.post('/api/learning/challenges/:challengeId/join', (req, res) => {
  const { challengeId } = req.params;
  const { userId } = req.body;
  
  db.query(`
    INSERT INTO challenge_participants (user_id, challenge_id, joined_at)
    VALUES (?, ?, NOW())
    ON DUPLICATE KEY UPDATE joined_at = NOW()
  `, [userId, challengeId], (err) => {
    if (err) {
      console.error('Error joining challenge:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ success: true, message: 'Joined challenge successfully' });
  });
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

// Posts API
app.get('/api/posts', (req, res) => {
  const { type, county, featured, limit = 20, offset = 0 } = req.query;

  let query = `
    SELECT p.*, u.nickname, u.emoji
    FROM posts p
    JOIN users u ON p.uuid = u.uuid
    WHERE 1=1
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

// Create new post
app.post('/api/posts', upload.single('media'), (req, res) => {
  const { 
    uuid, 
    type, 
    title, 
    content, 
    fullContent,
    county, 
    tags,
    hasVoiceNote,
    voiceDuration,
    isAnonymous
  } = req.body;
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

  // Calculate read time
  const calculateReadTime = (text) => {
    const wordsPerMinute = 200;
    const wordCount = text.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const readTime = calculateReadTime(content || '');
  const fullContentText = fullContent || content;

  // Check if new columns exist, if not use old schema
  db.query('DESCRIBE posts', (err, columns) => {
    if (err) {
      console.error('Error checking table structure:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const hasNewColumns = columns.some(col => col.Field === 'full_content');
    
    if (hasNewColumns) {
      // Use new schema with all columns
      db.query(`INSERT INTO posts (
        uuid, type, title, content, full_content, media_url, county, tags, 
        read_time, has_voice_note, voice_duration, is_anonymous
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid, type, title, content, fullContentText, mediaUrl, county, tags,
          readTime, hasVoiceNote === 'true', voiceDuration, isAnonymous === 'true'
        ],
        (err, result) => {
          if (err) {
            console.error('Error creating post:', err);
            return res.status(500).json({ error: 'Failed to create post' });
          }

          // Award XP for creating a post
          db.query('UPDATE users SET xp = xp + 10 WHERE uuid = ?', [uuid]);
          db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "create_post", 10, ?, "post")',
            [uuid, result.insertId]);

          res.json({
            message: 'Post created successfully and is pending review',
            postId: result.insertId
          });
        }
      );
    } else {
      // Use old schema without new columns
      db.query('INSERT INTO posts (uuid, type, title, content, media_url, county, tags) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuid, type, title, content, mediaUrl, county, tags],
        (err, result) => {
          if (err) {
            console.error('Error creating post:', err);
            return res.status(500).json({ error: 'Failed to create post' });
          }

          // Award XP for creating a post
          db.query('UPDATE users SET xp = xp + 10 WHERE uuid = ?', [uuid]);
          db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "create_post", 10, ?, "post")',
            [uuid, result.insertId]);

          res.json({
            message: 'Post created successfully and is pending review',
            postId: result.insertId
          });
        }
      );
    }
  });
});

// Protests API
app.get('/api/protests', (req, res) => {
  const { county, limit = 20, offset = 0 } = req.query;

  let query = 'SELECT * FROM protests WHERE verified = TRUE';
  let params = [];

  if (county) {
    query += ' AND county = ?';
    params.push(county);
  }

  query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const protests = results.map(protest => ({
      ...protest,
      purpose_tags: safeJSONParse(protest.purpose_tags, [])
    }));

    res.json(protests);
  });
});

// Submit request API
app.post('/api/submit-request', (req, res) => {
  const { 
    uuid, 
    type, 
    title, 
    name, 
    description, 
    year, 
    county, 
    category 
  } = req.body;

  if (!uuid || !type) {
    return res.status(400).json({ error: 'UUID and type are required' });
  }

  db.query('INSERT INTO submit_requests (uuid, type, title, name, description, year, county, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [uuid, type, title, name, description, year, county, category],
    (err, result) => {
      if (err) {
        console.error('Error creating submit request:', err);
        return res.status(500).json({ error: 'Failed to create submit request' });
      }

      res.json({
        message: 'Submit request created successfully',
        requestId: result.insertId
      });
    }
  );
});

// =====================================================
// MISSING API ROUTES (Restored from working backup)
// =====================================================

// Get single post by ID
app.get('/api/posts/:id', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  db.query(`
    SELECT p.*, u.nickname, u.emoji, u.county as user_county
    FROM posts p
    JOIN users u ON p.uuid = u.uuid
    WHERE p.id = ? AND p.verified = TRUE
  `, [id], (err, results) => {
    if (err) {
      console.error('Error fetching post:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Post not found or not verified' });
    }

    const post = results[0];
    post.tags = safeJSONParse(post.tags, []);

    res.json(post);
  });
});

// Check if user has liked a post
app.get('/api/posts/:id/liked/:uuid', (req, res) => {
  const { id, uuid } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }
  
  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
  }
  
  db.query('SELECT id FROM post_likes WHERE post_id = ? AND user_uuid = ?', [id, uuid], (err, results) => {
    if (err) {
      console.error('Error checking post like status:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({
      post_id: id,
      user_uuid: uuid,
      has_liked: results.length > 0
    });
  });
});

// Add comment to post
app.post('/api/posts/:id/comments', (req, res) => {
  const { id } = req.params;
  const { uuid, content, parent_comment_id = null } = req.body;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  if (!uuid || !content || content.trim().length === 0) {
    return res.status(400).json({ error: 'User UUID and comment content are required' });
  }

  if (content.trim().length > 1000) {
    return res.status(400).json({ error: 'Comment too long. Maximum 1000 characters allowed.' });
  }

  // Check if post exists and is verified
  db.query('SELECT id FROM posts WHERE id = ? AND verified = TRUE', [id], (err, results) => {
    if (err) {
      console.error('Error checking post:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Post not found or not verified' });
    }

    // Insert comment
    db.query('INSERT INTO comments (post_id, uuid, content, parent_comment_id) VALUES (?, ?, ?, ?)',
      [id, uuid, content.trim(), parent_comment_id], (err, result) => {
        if (err) {
          console.error('Error creating comment:', err);
          return res.status(500).json({ error: 'Failed to create comment' });
        }

        // Update comment count on post
        db.query('UPDATE posts SET comments = comments + 1 WHERE id = ?', [id]);

        // Award XP for commenting
        db.query('UPDATE users SET xp = xp + 5 WHERE uuid = ?', [uuid]);
        db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "comment_post", 5, ?, "post")',
          [uuid, id]
        );

        res.json({
          id: result.insertId,
          message: 'Comment added successfully'
        });
      }
    );
  });
});

// Get comments for a post
app.get('/api/posts/:id/comments', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  db.query(`
    SELECT 
      c.*,
      COALESCE(u.nickname, 'Anonymous') as nickname,
      COALESCE(u.emoji, '👤') as emoji,
      FALSE as user_verified,
      COALESCE(u.xp, 0) as user_xp,
      1 as user_level
    FROM comments c
    LEFT JOIN users u ON c.uuid = u.uuid
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `, [id], (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});

// Like/Unlike a comment
app.post('/api/comments/:commentId/liked/:uuid', (req, res) => {
  const { commentId, uuid } = req.params;
  const { action } = req.body; // 'like' or 'unlike'

  if (!commentId || isNaN(parseInt(commentId))) {
    return res.status(400).json({ error: 'Invalid comment ID' });
  }

  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
  }

  if (!action || !['like', 'unlike'].includes(action)) {
    return res.status(400).json({ error: 'Action must be "like" or "unlike"' });
  }

  if (action === 'like') {
    // Check if already liked
    db.query('SELECT id FROM comment_likes WHERE comment_id = ? AND uuid = ?', [commentId, uuid], (err, results) => {
      if (err) {
        console.error('Error checking comment like:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'Comment already liked by this user' });
      }

      // Add like
      db.query('INSERT INTO comment_likes (comment_id, uuid) VALUES (?, ?)', [commentId, uuid], (err) => {
        if (err) {
          console.error('Error adding comment like:', err);
          return res.status(500).json({ error: 'Failed to like comment' });
        }

        // Award XP for liking
        db.query('UPDATE users SET xp = xp + 1 WHERE uuid = ?', [uuid]);
        db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "like_comment", 1, ?, "comment")',
          [uuid, commentId]
        );

        res.json({ message: 'Comment liked successfully' });
      });
    });
  } else {
    // Unlike
    db.query('DELETE FROM comment_likes WHERE comment_id = ? AND uuid = ?', [commentId, uuid], (err) => {
      if (err) {
        console.error('Error removing comment like:', err);
        return res.status(500).json({ error: 'Failed to unlike comment' });
      }

      res.json({ message: 'Comment unliked successfully' });
    });
  }
});

// Promise Tracker API
app.get('/api/promises', (req, res) => {
  const { county, status, limit = 20, offset = 0 } = req.query;

  let query = 'SELECT * FROM promises WHERE 1=1';
  let params = [];

  if (county) {
    query += ' AND county = ?';
    params.push(county);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY tracking_count DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching promises:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const promises = results.map(promise => ({
      ...promise,
      tags: safeJSONParse(promise.tags, []),
      evidence: safeJSONParse(promise.evidence, [])
    }));

    res.json(promises);
  });
});

// Get single promise by ID
app.get('/api/promises/:id', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid promise ID' });
  }

  db.query('SELECT * FROM promises WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching promise:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Promise not found' });
    }

    const promise = results[0];
    promise.tags = safeJSONParse(promise.tags, []);
    promise.evidence = safeJSONParse(promise.evidence, []);

    res.json(promise);
  });
});

// Add evidence to promise
app.post('/api/promises/:id/evidence', (req, res) => {
  const { id } = req.params;
  const { uuid, evidence_type, description, url, county } = req.body;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid promise ID' });
  }

  if (!uuid || !evidence_type || !description) {
    return res.status(400).json({ error: 'User UUID, evidence type, and description are required' });
  }

  if (description.trim().length > 500) {
    return res.status(400).json({ error: 'Description too long. Maximum 500 characters allowed.' });
  }

  // Check if promise exists
  db.query('SELECT id FROM promises WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error checking promise:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Promise not found' });
    }

    // Create evidence record
    const evidenceData = {
      uuid,
      evidence_type,
      description: description.trim(),
      url: url || null,
      county: county || null,
      created_at: new Date().toISOString()
    };

    // Insert evidence (you'll need to create this table)
    db.query('INSERT INTO promise_evidence (promise_id, uuid, evidence_type, description, url, county, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, evidenceData.uuid, evidenceData.evidence_type, evidenceData.description, evidenceData.url, evidenceData.county, evidenceData.created_at],
      (err, result) => {
        if (err) {
          console.error('Error creating evidence:', err);
          return res.status(500).json({ error: 'Failed to create evidence' });
        }

        // Update tracking count on promise
        db.query('UPDATE promises SET tracking_count = tracking_count + 1 WHERE id = ?', [id]);

        // Award XP for tracking
        db.query('UPDATE users SET xp = xp + 10 WHERE uuid = ?', [uuid]);
        db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "track_promise", 10, ?, "promise")',
          [uuid, id]
        );

        res.json({
          id: result.insertId,
          message: 'Evidence added successfully'
        });
      }
    );
  });
});

// Get active polls
app.get('/api/polls/active', (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  db.query('SELECT * FROM polls WHERE active = TRUE ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [parseInt(limit), parseInt(offset)], (err, results) => {
      if (err) {
        console.error('Error fetching active polls:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const polls = results.map(poll => ({
        ...poll,
        options: safeJSONParse(poll.options, [])
      }));

      res.json(polls);
    }
  );
});

// Get poll results
app.get('/api/polls/:id/results', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid poll ID' });
  }

  db.query('SELECT * FROM polls WHERE id = ? AND active = TRUE', [id], (err, results) => {
    if (err) {
      console.error('Error fetching poll:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Poll not found or not active' });
    }

    const poll = results[0];
    poll.options = safeJSONParse(poll.options, []);

    // Get vote counts for each option
    db.query('SELECT option_index, COUNT(*) as votes FROM poll_votes WHERE poll_id = ? GROUP BY option_index',
      [id], (err, voteResults) => {
        if (err) {
          console.error('Error fetching poll votes:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Create results object
        const results = {};
        poll.options.forEach((option, index) => {
          const voteData = voteResults.find(v => v.option_index === index);
          results[index] = {
            option,
            votes: voteData ? voteData.votes : 0
          };
        });

        res.json({
          poll,
          results,
          total_votes: voteResults.reduce((sum, v) => sum + v.votes, 0)
        });
      }
    );
  });
});

// Vote on poll
app.post('/api/polls/:id/vote', (req, res) => {
  const { id } = req.params;
  const { uuid, option_index } = req.body;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid poll ID' });
  }

  if (!uuid || option_index === undefined || option_index < 0) {
    return res.status(400).json({ error: 'User UUID and valid option index are required' });
  }

  // Check if poll exists and is active
  db.query('SELECT * FROM polls WHERE id = ? AND active = TRUE', [id], (err, results) => {
    if (err) {
      console.error('Error checking poll:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Poll not found or not active' });
    }

    const poll = results[0];
    poll.options = safeJSONParse(poll.options, []);
    
    if (option_index >= poll.options.length) {
      return res.status(400).json({ error: 'Invalid option index' });
    }

    // Check if user already voted
    db.query('SELECT id FROM poll_votes WHERE poll_id = ? AND uuid = ?', [id, uuid], (err, voteResults) => {
      if (err) {
        console.error('Error checking existing vote:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (voteResults.length > 0) {
        return res.status(400).json({ error: 'User has already voted on this poll' });
      }

      // Record vote
      db.query('INSERT INTO poll_votes (poll_id, uuid, option_index) VALUES (?, ?, ?)',
        [id, uuid, option_index], (err) => {
          if (err) {
            console.error('Error recording vote:', err);
            return res.status(500).json({ error: 'Failed to record vote' });
          }

          // Award XP for voting
          db.query('UPDATE users SET xp = xp + 5 WHERE uuid = ?', [uuid]);
          db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "vote_poll", 5, ?, "poll")',
            [uuid, id]
          );

          res.json({ message: 'Vote recorded successfully' });
        }
      );
    });
  });
});

// Get youth groups
app.get('/api/youth-groups', (req, res) => {
  const { county, limit = 20, offset = 0 } = req.query;

  let query = 'SELECT * FROM youth_groups WHERE active = TRUE';
  let params = [];

  if (county) {
    query += ' AND county = ?';
    params.push(county);
  }

  query += ' ORDER BY member_count DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching youth groups:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const groups = results.map(group => ({
      ...group,
      tags: safeJSONParse(group.tags, [])
    }));

    res.json(groups);
  });
});

// Get single youth group
app.get('/api/youth-groups/:id', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid group ID' });
  }

  db.query('SELECT * FROM youth_groups WHERE id = ? AND active = TRUE', [id], (err, results) => {
    if (err) {
      console.error('Error fetching youth group:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Youth group not found or not active' });
    }

    const group = results[0];
    group.tags = safeJSONParse(group.tags, []);

    res.json(group);
  });
});

// Search functionality
app.get('/api/search', (req, res) => {
  const { q, type = 'all', county, limit = 20, offset = 0 } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const searchTerm = `%${q.trim()}%`;
  let results = [];

  // Search in posts
  if (type === 'all' || type === 'posts') {
    db.query(`
      SELECT 'post' as type, p.id, p.title, p.content, p.county, p.created_at, u.nickname, u.emoji
      FROM posts p
      JOIN users u ON p.uuid = u.uuid
      WHERE p.verified = TRUE AND (p.title LIKE ? OR p.content LIKE ?)
      ORDER BY p.created_at DESC
      LIMIT ?
    `, [searchTerm, searchTerm, parseInt(limit)], (err, postResults) => {
      if (err) {
        console.error('Error searching posts:', err);
      } else {
        results = results.concat(postResults.map(post => ({
          ...post,
          tags: safeJSONParse(post.tags, [])
        })));
      }

      // Search in memory archive
      if (type === 'all' || type === 'memory') {
        db.query(`
          SELECT 'memory' as type, id, name as title, achievement as content, county, created_at
          FROM memory_archive
          WHERE verified = TRUE AND (name LIKE ? OR achievement LIKE ?)
          ORDER BY created_at DESC
          LIMIT ?
        `, [searchTerm, searchTerm, parseInt(limit)], (err, memoryResults) => {
          if (err) {
            console.error('Error searching memory archive:', err);
          } else {
            results = results.concat(memoryResults.map(memory => ({
              ...memory,
              tags: safeJSONParse(memory.tags, [])
            })));
          }

          // Search in protests
          if (type === 'all' || type === 'protests') {
            db.query(`
              SELECT 'protest' as type, id, title, description as content, county, date as created_at
              FROM protests
              WHERE verified = TRUE AND (title LIKE ? OR description LIKE ?)
              ORDER BY date DESC
              LIMIT ?
            `, [searchTerm, searchTerm, parseInt(limit)], (err, protestResults) => {
              if (err) {
                console.error('Error searching protests:', err);
                return res.status(500).json({ error: 'Search failed' });
              }

              results = results.concat(protestResults.map(protest => ({
                ...protest,
                purpose_tags: safeJSONParse(protest.purpose_tags, [])
              })));

              // Sort all results by creation date
              results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

              res.json({
                query: q,
                type,
                results: results.slice(0, parseInt(limit)),
                total: results.length
              });
            });
          } else {
            // Sort and return results
            results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            res.json({
              query: q,
              type,
              results: results.slice(0, parseInt(limit)),
              total: results.length
            });
          }
        });
      } else {
        // Sort and return results
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json({
          query: q,
          type,
          results: results.slice(0, parseInt(limit)),
          total: results.length
        });
      }
    });
  } else {
    // Handle single type searches
    // ... (implement specific type searches as needed)
    res.json({
      query: q,
      type,
      results: [],
      total: 0
    });
  }
});

// Get user stats
app.get('/api/users/stats', (req, res) => {
  const { uuid } = req.query;

  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
  }

  db.query(`
    SELECT 
      u.uuid,
      u.nickname,
      u.emoji,
      u.xp,
      u.streak,
      u.county,
      COUNT(DISTINCT p.id) as posts_count,
      COUNT(DISTINCT c.id) as comments_count,
      COUNT(DISTINCT pl.post_id) as likes_received
    FROM users u
    LEFT JOIN posts p ON u.uuid = p.uuid
    LEFT JOIN comments c ON u.uuid = c.uuid
    LEFT JOIN post_likes pl ON p.id = pl.post_id
    WHERE u.uuid = ?
    GROUP BY u.uuid
  `, [uuid], (err, results) => {
    if (err) {
      console.error('Error fetching user stats:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = results[0];
    res.json(user);
  });
});

// ========== POLITICAL API ROUTES ==========

// Get all politicians
app.get('/api/politicians', (req, res) => {
  const query = `
    SELECT p.*, 
           COUNT(DISTINCT pn.article_id) as news_count,
           COUNT(DISTINCT pw.id) as wikipedia_entries
    FROM politicians p
    LEFT JOIN politician_news pn ON p.id = pn.politician_id
    LEFT JOIN politician_wikipedia pw ON p.id = pw.politician_id
    WHERE p.is_active = 1
    GROUP BY p.id
    ORDER BY p.name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching politicians:', err);
      return res.status(500).json({ error: 'Failed to fetch politicians' });
    }
    
    // Transform results to match mobile app expectations
    const politicians = results.map(politician => ({
      id: politician.id,
      name: politician.name,
      position: politician.position,
      party: politician.party,
      party_color: getPartyColor(politician.party),
      constituency: politician.constituency,
      county: politician.county,
      bio: politician.wikipedia_url ? 'Wikipedia profile available' : 'No bio available',
      education: 'Education details not available',
      career_summary: `Serving as ${politician.position}`,
      image_url: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&sig=${politician.id}`,
      social_media: {
        twitter: `@${politician.name.replace(/\s+/g, '').toLowerCase()}`,
        facebook: `${politician.name.replace(/\s+/g, '')}Official`,
        instagram: politician.name.replace(/\s+/g, '').toLowerCase()
      },
      contact_info: {
        email: `${politician.name.replace(/\s+/g, '').toLowerCase()}@government.go.ke`,
        phone: '+254-20-2227411'
      },
      news_count: politician.news_count || 0,
      wikipedia_entries: politician.wikipedia_entries || 0
    }));
    
    res.json(politicians);
  });
});

// Get single politician details
app.get('/api/politicians/:id', (req, res) => {
  const politicianId = req.params.id;
  
  const query = `
    SELECT p.*, 
           COUNT(DISTINCT pn.article_id) as news_count,
           COUNT(DISTINCT pw.id) as wikipedia_entries
    FROM politicians p
    LEFT JOIN politician_news pn ON p.id = pn.politician_id
    LEFT JOIN politician_wikipedia pw ON p.id = pw.politician_id
    WHERE p.id = ? AND p.is_active = 1
    GROUP BY p.id
  `;
  
  db.query(query, [politicianId], (err, results) => {
    if (err) {
      console.error('Error fetching politician:', err);
      return res.status(500).json({ error: 'Failed to fetch politician' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Politician not found' });
    }
    
    const politician = results[0];
    const politicianData = {
      id: politician.id,
      name: politician.name,
      position: politician.position,
      party: politician.party,
      party_color: getPartyColor(politician.party),
      constituency: politician.constituency,
      county: politician.county,
      bio: politician.wikipedia_url ? 'Wikipedia profile available' : 'No bio available',
      education: 'Education details not available',
      career_summary: `Serving as ${politician.position}`,
      image_url: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&sig=${politician.id}`,
      social_media: {
        twitter: `@${politician.name.replace(/\s+/g, '').toLowerCase()}`,
        facebook: `${politician.name.replace(/\s+/g, '')}Official`,
        instagram: politician.name.replace(/\s+/g, '').toLowerCase()
      },
      contact_info: {
        email: `${politician.name.replace(/\s+/g, '').toLowerCase()}@government.go.ke`,
        phone: '+254-20-2227411'
      },
      news_count: politician.news_count || 0,
      wikipedia_entries: politician.wikipedia_entries || 0
    };
    
    res.json(politicianData);
  });
});

// Get politician news
app.get('/api/politicians/:id/news', (req, res) => {
  const politicianId = req.params.id;
  
  const query = `
    SELECT na.*, pn.relevance_score, pn.mention_type
    FROM news_articles na
    JOIN politician_news pn ON na.id = pn.article_id
    WHERE pn.politician_id = ?
    ORDER BY na.published_date DESC
    LIMIT 20
  `;
  
  db.query(query, [politicianId], (err, results) => {
    if (err) {
      console.error('Error fetching politician news:', err);
      return res.status(500).json({ error: 'Failed to fetch news' });
    }
    
    const news = results.map(article => ({
      id: article.id,
      headline: article.headline,
      summary: article.summary || 'No summary available',
      source: article.source_name || 'Unknown Source',
      source_publication_date: article.published_date,
      link: article.url || '#',
      category: 'Politics',
      tags: ['politics', 'kenya'],
      is_breaking: false,
      content: article.content || article.summary || 'Content not available'
    }));
    
    res.json(news);
  });
});

// Get politician documents (using news articles as documents for now)
app.get('/api/politicians/:id/documents', (req, res) => {
  const politicianId = req.params.id;
  
  const query = `
    SELECT na.*, pn.relevance_score
    FROM news_articles na
    JOIN politician_news pn ON na.id = pn.article_id
    WHERE pn.politician_id = ? AND na.content_summary IS NOT NULL
    ORDER BY na.published_date DESC
    LIMIT 10
  `;
  
  db.query(query, [politicianId], (err, results) => {
    if (err) {
      console.error('Error fetching politician documents:', err);
      return res.status(500).json({ error: 'Failed to fetch documents' });
    }
    
    const documents = results.map(article => ({
      id: article.id,
      title: article.headline,
      type: 'News Article',
      summary: article.summary || 'No summary available',
      date: article.published_date,
      source: article.source_name || 'Unknown Source',
      file_url: article.url || '#',
      key_quotes: [article.summary || 'No quotes available'],
      metadata: {
        pages: 1,
        language: 'English',
        version: '1.0'
      }
    }));
    
    res.json(documents);
  });
});

// Get politician timeline (using news articles as timeline events)
app.get('/api/politicians/:id/timeline', (req, res) => {
  const politicianId = req.params.id;
  
  const query = `
    SELECT na.*, pn.relevance_score
    FROM news_articles na
    JOIN politician_news pn ON na.id = pn.article_id
    WHERE pn.politician_id = ?
    ORDER BY na.published_date DESC
    LIMIT 15
  `;
  
  db.query(query, [politicianId], (err, results) => {
    if (err) {
      console.error('Error fetching politician timeline:', err);
      return res.status(500).json({ error: 'Failed to fetch timeline' });
    }
    
    const timeline = results.map(article => ({
      id: article.id,
      event_type: 'News',
      title: article.headline,
      description: article.summary || 'No description available',
      date: article.published_date,
      source: article.source_name || 'Unknown Source',
      metadata: {
        relevance_score: article.relevance_score,
        url: article.url
      }
    }));
    
    res.json(timeline);
  });
});

// Get politician commitments (mock data for now)
app.get('/api/politicians/:id/commitments', (req, res) => {
  const politicianId = req.params.id;
  
  // Mock commitments data - in a real app, you'd have a commitments table
  const mockCommitments = [
    {
      id: 1,
      promise: 'Improve healthcare services',
      context: 'Campaign speech',
      date_made: '2022-08-15',
      status: 'in_progress',
      related_actions: [
        {
          action: 'Launched health insurance program',
          date: '2023-01-15',
          connection: 'Direct implementation of healthcare promise'
        }
      ],
      sources: ['https://example.com/campaign-speech'],
      notes: 'Progress being made through various government programs'
    },
    {
      id: 2,
      promise: 'Create more jobs',
      context: 'Parliamentary address',
      date_made: '2022-09-01',
      status: 'pending',
      related_actions: [],
      sources: ['https://example.com/parliamentary-address'],
      notes: 'Promise made during parliamentary session'
    }
  ];
  
  res.json(mockCommitments);
});

// Helper function to get party colors
function getPartyColor(party) {
  const partyColors = {
    'UDA': '#FF6B35',
    'ODM': '#FF0000',
    'ANC': '#8B0000',
    'NARC-Kenya': '#8B0000',
    'Jubilee': '#FFD700',
    'Wiper': '#0000FF',
    'Ford Kenya': '#008000'
  };
  return partyColors[party] || '#6B7280';
}

// Catch all handler - send back React's index.html file for client-side routing
// This MUST be placed AFTER all API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start server
console.log('🔍 About to start server listening...');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Rada.ke server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`API base: http://localhost:${PORT}/api`);
  console.log(`Mobile access: http://192.168.100.41:${PORT}/api`);
});