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

// Simple submission storage - no external email services

// Database connection with proper pooling
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_ke',
  charset: 'utf8mb4',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Environment validation
function validateEnvironment() {
  const required = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }
}

// Call before starting server
validateEnvironment();

// Input sanitization helper
function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  return input.trim().substring(0, maxLength);
}

// Improved safeJSONParse with better error handling
function safeJSONParse(jsonString, fallback = []) {
  try {
    if (typeof jsonString === 'object') {
      return jsonString || fallback;
    }
    if (typeof jsonString === 'string' && jsonString.trim()) {
      const parsed = JSON.parse(jsonString);
      return parsed !== null ? parsed : fallback;
    }
    return fallback;
  } catch (e) {
    console.warn('JSON parse error:', e.message, 'Input:', jsonString);
    // Handle comma-separated strings as fallback
    if (typeof jsonString === 'string' && jsonString.includes(',')) {
      return jsonString.split(',').map(item => item.trim()).filter(item => item);
    }
    return fallback;
  }
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

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL Database');
  initializeDatabase();
});

// Handle database connection errors
db.on('error', (err) => {
  console.error('Database connection error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Attempting to reconnect to database...');
    db.connect((err) => {
      if (err) {
        console.error('Reconnection failed:', err);
      } else {
        console.log('✅ Reconnected to MySQL Database');
      }
    });
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

    // Protest Archive
    `CREATE TABLE IF NOT EXISTS protests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      date DATE NOT NULL,
      location VARCHAR(100),
      county VARCHAR(50),
      purpose_tags JSON,
      turnout_estimate INT,
      outcome ENUM('peaceful', 'dispersed', 'arrests', 'ongoing') DEFAULT 'peaceful',
      media_gallery JSON,
      description TEXT,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Promise Tracker
    `CREATE TABLE IF NOT EXISTS promises (
      id INT AUTO_INCREMENT PRIMARY KEY,
      official_name VARCHAR(100) NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status ENUM('not_started', 'ongoing', 'completed', 'broken') DEFAULT 'not_started',
      progress_percentage INT DEFAULT 0,
      county VARCHAR(50),
      ministry VARCHAR(100),
      deadline DATE,
      evidence JSON,
      tags JSON,
      tracking_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Civic Learning Modules
    `CREATE TABLE IF NOT EXISTS learning_modules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      content LONGTEXT,
      difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
      xp_reward INT DEFAULT 20,
      prerequisites JSON,
      tags JSON,
      icon VARCHAR(10) DEFAULT '📚',
      category VARCHAR(100) DEFAULT 'General',
      estimated_duration INT DEFAULT 30,
      status ENUM('draft', 'review', 'published', 'archived') DEFAULT 'draft',
      is_featured BOOLEAN DEFAULT FALSE,
      completion_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Lessons
    `CREATE TABLE IF NOT EXISTS lessons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      content LONGTEXT,
      order_index INT DEFAULT 0,
      estimated_duration INT DEFAULT 15,
      media_urls JSON,
      quiz_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL
    )`,

    // Quizzes
    `CREATE TABLE IF NOT EXISTS quizzes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id INT,
      title VARCHAR(200) NOT NULL,
      questions JSON NOT NULL,
      passing_score INT DEFAULT 70,
      xp_reward INT DEFAULT 10,
      attempts_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE
    )`,

    // User Progress
    `CREATE TABLE IF NOT EXISTS user_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL,
      module_id INT,
      quiz_id INT,
      completed BOOLEAN DEFAULT FALSE,
      score INT DEFAULT 0,
      attempts INT DEFAULT 0,
      progress_percentage INT DEFAULT 0,
      completed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE,
      FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    )`,

    // Challenges table
    `CREATE TABLE IF NOT EXISTS challenges (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      type ENUM('daily', 'weekly', 'monthly') DEFAULT 'weekly',
      xp_reward INT DEFAULT 50,
      badge_reward VARCHAR(100),
      requirements JSON,
      start_date DATE,
      end_date DATE,
      active BOOLEAN DEFAULT TRUE,
      completion_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // User Challenge Progress
    `CREATE TABLE IF NOT EXISTS user_challenges (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL,
      challenge_id INT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP NULL,
      evidence JSON,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_challenge (uuid, challenge_id)
    )`,

    // Badges table
    `CREATE TABLE IF NOT EXISTS badges (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      icon VARCHAR(50),
      category VARCHAR(50),
      xp_required INT DEFAULT 0,
      criteria JSON,
      rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // User Badges (many-to-many relationship)
    `CREATE TABLE IF NOT EXISTS user_badges (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL,
      badge_id INT NOT NULL,
      earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE,
      FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_badge (uuid, badge_id)
    )`,

    // Civic Mood Polls
    `CREATE TABLE IF NOT EXISTS polls (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question VARCHAR(200) NOT NULL,
      emoji_options JSON NOT NULL,
      results JSON,
      total_votes INT DEFAULT 0,
      active BOOLEAN DEFAULT TRUE,
      expires_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Poll Votes
    `CREATE TABLE IF NOT EXISTS poll_votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      poll_id INT NOT NULL,
      uuid VARCHAR(36) NOT NULL,
      vote_option VARCHAR(20) NOT NULL,
      county VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE,
      UNIQUE KEY unique_vote (poll_id, uuid)
    )`,

    // Youth Groups Directory
    `CREATE TABLE IF NOT EXISTS youth_groups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      county VARCHAR(50),
      focus_area VARCHAR(100),
      contact_info JSON,
      verified BOOLEAN DEFAULT FALSE,
      member_count INT DEFAULT 0,
      website VARCHAR(200),
      social_media JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Civic Assignments
    `CREATE TABLE IF NOT EXISTS assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      group_id INT,
      difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
      xp_reward INT DEFAULT 50,
      deadline DATE,
      status ENUM('open', 'in_progress', 'completed', 'expired') DEFAULT 'open',
      requirements JSON,
      submissions_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES youth_groups(id) ON DELETE SET NULL
    )`,

    // Comments system
    `CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT,
      uuid VARCHAR(36) NOT NULL,
      content TEXT NOT NULL,
      parent_comment_id INT NULL,
      likes INT DEFAULT 0,
      flags INT DEFAULT 0,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE,
      FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
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
    )`,

    // Post Likes - tracks who liked what to prevent duplicates
    `CREATE TABLE IF NOT EXISTS post_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      uuid VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE,
      UNIQUE KEY unique_post_like (post_id, uuid)
    )`,

    // Comment Likes - tracks who liked what to prevent duplicates
    `CREATE TABLE IF NOT EXISTS comment_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      comment_id INT NOT NULL,
      uuid VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE,
      UNIQUE KEY unique_comment_like (comment_id, uuid)
    )`,

    // Saved Items - for users to save heroes and protests
    `CREATE TABLE IF NOT EXISTS saved_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL,
      item_id INT NOT NULL,
      item_type ENUM('hero', 'protest') NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE,
      UNIQUE KEY unique_saved_item (uuid, item_id, item_type)
    )`,
    
    // Submit Requests - for users to submit new heroes/protests
    `CREATE TABLE IF NOT EXISTS submit_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL,
      type ENUM('hero', 'protest') NOT NULL,
      name VARCHAR(200) NOT NULL,
      title VARCHAR(200),
      description TEXT NOT NULL,
      category VARCHAR(100),
      county VARCHAR(100),
      year INT,
      source VARCHAR(500),
      contact VARCHAR(200),
      image_url VARCHAR(500),
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('pending', 'approved', 'rejected', 'in_review') DEFAULT 'pending',
      reviewed_by VARCHAR(36),
      reviewed_at TIMESTAMP NULL,
      review_notes TEXT,
      user_email VARCHAR(200),
      user_nickname VARCHAR(100),
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE
    )`,

    // Admin Modules Table
    `CREATE TABLE IF NOT EXISTS admin_modules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      icon VARCHAR(10) DEFAULT '📚',
      difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
      xp_reward INT DEFAULT 50,
      estimated_duration INT DEFAULT 120,
      status ENUM('draft', 'review', 'ready', 'published') DEFAULT 'draft',
      featured BOOLEAN DEFAULT FALSE,
      category VARCHAR(100),
      tags JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      published_at TIMESTAMP NULL,
      created_by VARCHAR(36),
      review_notes TEXT,
      quality_score INT DEFAULT 0,
      mobile_preview_completed BOOLEAN DEFAULT FALSE,
      kenyan_examples_included BOOLEAN DEFAULT FALSE,
      media_content_included BOOLEAN DEFAULT FALSE,
      quiz_tested BOOLEAN DEFAULT FALSE
    )`,

    // Admin Lessons Table
    `CREATE TABLE IF NOT EXISTS admin_lessons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      order_index INT NOT NULL,
      hook TEXT,
      why_matters TEXT,
      main_content LONGTEXT,
      key_takeaways TEXT,
      mini_quiz TEXT,
      estimated_duration INT DEFAULT 15,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES admin_modules(id) ON DELETE CASCADE
    )`,

    // Admin Media Table
    `CREATE TABLE IF NOT EXISTS admin_media (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lesson_id INT NOT NULL,
      content_section ENUM('hook', 'why_matters', 'main_content', 'key_takeaways') NOT NULL,
      media_type ENUM('youtube', 'tiktok', 'vimeo', 'facebook', 'image', 'document') NOT NULL,
      media_url VARCHAR(500),
      embed_code TEXT,
      thumbnail_url VARCHAR(500),
      duration INT,
      title VARCHAR(200),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lesson_id) REFERENCES admin_lessons(id) ON DELETE CASCADE
    )`,

    // Admin Module Quizzes Table
    `CREATE TABLE IF NOT EXISTS admin_module_quizzes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      passing_score INT DEFAULT 70,
      time_limit INT DEFAULT 30,
      total_questions INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES admin_modules(id) ON DELETE CASCADE
    )`,

    // Admin Quiz Questions Table
    `CREATE TABLE IF NOT EXISTS admin_quiz_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quiz_id INT NOT NULL,
      question_text TEXT NOT NULL,
      question_type ENUM('multiple_choice', 'true_false', 'short_answer') DEFAULT 'multiple_choice',
      options JSON,
      correct_answer VARCHAR(500),
      explanation TEXT,
      difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
      points INT DEFAULT 1,
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quiz_id) REFERENCES admin_module_quizzes(id) ON DELETE CASCADE
    )`,

    // Admin Publishing Workflow Table
    `CREATE TABLE IF NOT EXISTS admin_publishing_workflow (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id INT NOT NULL,
      current_status ENUM('draft', 'review', 'ready', 'published') DEFAULT 'draft',
      quality_checks JSON,
      review_notes TEXT,
      reviewer_id VARCHAR(36),
      review_date TIMESTAMP NULL,
      publish_date TIMESTAMP NULL,
      scheduled_publish_date TIMESTAMP NULL,
      workflow_history JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES admin_modules(id) ON DELETE CASCADE
    )`,

    // Admin Content Templates Table
    `CREATE TABLE IF NOT EXISTS admin_content_templates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      template_type ENUM('module', 'lesson', 'quiz') NOT NULL,
      template_data JSON,
      is_default BOOLEAN DEFAULT FALSE,
      created_by VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Admin Users Table
    `CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) UNIQUE NOT NULL,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(200) UNIQUE NOT NULL,
      role ENUM('admin', 'editor', 'reviewer', 'creator') DEFAULT 'creator',
      permissions JSON,
      is_active BOOLEAN DEFAULT TRUE,
      last_login TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE
    )`,

    // Admin Content Analytics Table
    `CREATE TABLE IF NOT EXISTS admin_content_analytics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id INT NOT NULL,
      views INT DEFAULT 0,
      completions INT DEFAULT 0,
      average_score DECIMAL(5,2) DEFAULT 0.00,
      average_completion_time INT DEFAULT 0,
      user_feedback JSON,
      engagement_metrics JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES admin_modules(id) ON DELETE CASCADE
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
  seedInitialData();
}

// Seed initial data
function seedInitialData() {
  // Add some sample civic learning modules
  const sampleModules = [
    {
      title: "Understanding County Government",
      description: "Learn how county governments work in Kenya",
      content: "County governments are responsible for various services including healthcare, agriculture, and local infrastructure...",
      difficulty: "beginner",
      xp_reward: 20,
      tags: JSON.stringify(["government", "counties", "devolution"])
    },
    {
      title: "Budget Basics: How Public Money Works",
      description: "Understanding government budgets and public finance",
      content: "Government budgets show how public money is collected and spent. Every citizen has the right to know...",
      difficulty: "intermediate",
      xp_reward: 30,
      tags: JSON.stringify(["budget", "finance", "transparency"])
    },
    {
      title: "Your Constitutional Rights",
      description: "Know your rights as a Kenyan citizen",
      content: "The Constitution of Kenya 2010 guarantees every citizen fundamental rights and freedoms...",
      difficulty: "beginner",
      xp_reward: 25,
      tags: JSON.stringify(["constitution", "rights", "law"])
    }
  ];

  sampleModules.forEach(module => {
    db.query('INSERT IGNORE INTO learning_modules (title, description, content, difficulty, xp_reward, tags) VALUES (?, ?, ?, ?, ?, ?)',
      [module.title, module.description, module.content, module.difficulty, module.xp_reward, module.tags],
      (err) => {
        if (err && err.code !== 'ER_DUP_ENTRY') {
          console.error('Error inserting sample module:', err);
        }
      }
    );
  });

  // Add sample civic mood poll
  const samplePoll = {
    question: "How do you feel about Kenya's direction today?",
    emoji_options: JSON.stringify([
      {emoji: "😠", label: "Frustrated"},
      {emoji: "😐", label: "Concerned"},
      {emoji: "😊", label: "Hopeful"},
      {emoji: "🙂", label: "Optimistic"}
    ]),
    results: JSON.stringify({})
  };

  db.query('INSERT IGNORE INTO polls (id, question, emoji_options, results) VALUES (1, ?, ?, ?)',
    [samplePoll.question, samplePoll.emoji_options, samplePoll.results],
    (err) => {
      if (err && err.code !== 'ER_DUP_ENTRY') {
        console.error('Error inserting sample poll:', err);
      }
    }
  );

  // Add sample memory archive data with diverse variety for testing filters
  const sampleMemoryData = [
    {
      name: 'Wangari Maathai',
      age: 71,
      county: 'Nyeri',
      cause: 'Environmental activist and Nobel Peace Prize laureate',
      context: 'Founder of the Green Belt Movement, fought for environmental conservation and women\'s rights',
      date_of_death: '2011-09-25',
      image_url: null,
      candles_lit: 2458,
      tags: JSON.stringify(['environmental']),
      verified: true
    },
    {
      name: 'Dedan Kimathi',
      age: 36,
      county: 'Nyeri',
      cause: 'Mau Mau freedom fighter and independence hero',
      context: 'Led the Mau Mau rebellion against British colonial rule',
      date_of_death: '1957-02-18',
      image_url: null,
      candles_lit: 2987,
      tags: JSON.stringify(['independence-heroes', 'modern-martyrs']),
      verified: true
    },
    {
      name: 'Eliud Kipchoge',
      age: 39,
      county: 'Nandi',
      cause: 'Marathon world record holder and sports icon',
      context: 'Olympic marathon champion and first person to run marathon under 2 hours',
      date_of_death: null,
      image_url: null,
      candles_lit: 1892,
      tags: JSON.stringify(['sports']),
      verified: true
    },
    {
      name: 'Mary Wambui',
      age: 75,
      county: 'Murang\'a',
      cause: 'Community health worker and women\'s advocate',
      context: 'Dedicated community health worker who improved healthcare access for rural women',
      date_of_death: '2019-08-22',
      image_url: null,
      candles_lit: 234,
      tags: JSON.stringify(['women-leaders', 'healthcare', 'community']),
      verified: true
    },
    {
      name: 'James Kipkorir',
      age: 68,
      county: 'Kericho',
      cause: 'Environmental conservationist and community leader',
      context: 'Led community-based forest conservation efforts in the Rift Valley',
      date_of_death: '2018-03-10',
      image_url: null,
      candles_lit: 156,
      tags: JSON.stringify(['champions', 'environment', 'community']),
      verified: true
    },
    {
      name: 'Sarah Nkatha',
      age: 62,
      county: 'Meru',
      cause: 'Women\'s cooperative leader and entrepreneur',
      context: 'Founded successful women\'s coffee cooperative empowering rural women',
      date_of_death: '2020-11-05',
      image_url: null,
      candles_lit: 289,
      tags: JSON.stringify(['women-leaders', 'business', 'community']),
      verified: true
    },
    {
      name: 'Peter Kiprotich',
      age: 45,
      county: 'Baringo',
      cause: 'Youth mentor and sports coach',
      context: 'Dedicated youth mentor who trained hundreds of young athletes from rural areas',
      date_of_death: '2022-07-18',
      image_url: null,
      candles_lit: 178,
      tags: JSON.stringify(['champions', 'sports', 'youth-mentorship']),
      verified: true
    },
    {
      name: 'Tom Mboya',
      age: 39,
      county: 'Nairobi',
      cause: 'Trade unionist and independence leader',
      context: 'Key figure in Kenya\'s independence movement and labor rights',
      date_of_death: '1969-07-05',
      image_url: null,
      candles_lit: 1892,
      tags: JSON.stringify(['freedom-fighters', 'independence', 'labor-rights']),
      verified: true
    },
    {
      name: 'Robert Ouko',
      age: 58,
      county: 'Kisumu',
      cause: 'Foreign Minister and anti-corruption advocate',
      context: 'Known for his anti-corruption stance and diplomatic service',
      date_of_death: '1990-02-13',
      image_url: null,
      candles_lit: 1563,
      tags: JSON.stringify(['modern-martyrs', 'anti-corruption', 'foreign-policy']),
      verified: true
    },
    {
      name: 'Pio Gama Pinto',
      age: 38,
      county: 'Nairobi',
      cause: 'Journalist, politician, and freedom fighter',
      context: 'Fought for independence and was assassinated for his political activism',
      date_of_death: '1965-02-24',
      image_url: null,
      candles_lit: 1342,
      tags: JSON.stringify(['freedom-fighters', 'journalism', 'independence']),
      verified: true
    },
    {
      name: 'Me Katilili wa Menza',
      age: 65,
      county: 'Kilifi',
      cause: 'Giriama resistance leader against colonial rule',
      context: 'Led the Giriama resistance movement against British colonial policies',
      date_of_death: '1924-11-08',
      image_url: null,
      candles_lit: 987,
      tags: JSON.stringify(['women-leaders', 'freedom-fighters', 'resistance']),
      verified: true
    },
    {
      name: 'Jaramogi Oginga Odinga',
      age: 83,
      county: 'Siaya',
      cause: 'Vice President and opposition leader',
      context: 'First Vice President of Kenya and prominent opposition leader',
      date_of_death: '1994-01-20',
      image_url: null,
      candles_lit: 1123,
      tags: JSON.stringify(['champions', 'democracy', 'opposition']),
      verified: true
    },
    {
      name: 'Wambui Otieno',
      age: 85,
      county: 'Nairobi',
      cause: 'Women\'s rights activist and politician',
      context: 'Pioneering women\'s rights activist and former Member of Parliament',
      date_of_death: '2011-08-30',
      image_url: null,
      candles_lit: 876,
      tags: JSON.stringify(['women-leaders', 'women-rights', 'politics']),
      verified: true
    },
    {
      name: 'Koinange wa Mbiyu',
      age: 75,
      county: 'Kiambu',
      cause: 'Senior Chief and independence leader',
      context: 'Senior Chief who supported the independence movement',
      date_of_death: '1960-03-27',
      image_url: null,
      candles_lit: 654,
      tags: JSON.stringify(['freedom-fighters', 'chiefs', 'independence']),
      verified: true
    },
    {
      name: 'Grace Onyango',
      age: 98,
      county: 'Kisumu',
      cause: 'First female Member of Parliament',
      context: 'First woman to be elected as Member of Parliament in independent Kenya',
      date_of_death: '2023-03-08',
      image_url: null,
      candles_lit: 543,
      tags: JSON.stringify(['women-leaders', 'politics', 'pioneers']),
      verified: true
    },
    {
      name: 'Makhan Singh',
      age: 82,
      county: 'Nairobi',
      cause: 'Trade unionist and independence activist',
      context: 'Pioneering trade unionist who fought for workers\' rights and independence',
      date_of_death: '1973-05-18',
      image_url: null,
      candles_lit: 432,
      tags: JSON.stringify(['freedom-fighters', 'labor-rights', 'trade-unions']),
      verified: true
    },
    {
      name: 'Muthoni wa Kirima',
      age: 88,
      county: 'Nyeri',
      cause: 'Mau Mau freedom fighter',
      context: 'One of the few surviving Mau Mau freedom fighters, fought for independence',
      date_of_death: '2023-11-04',
      image_url: null,
      candles_lit: 765,
      tags: JSON.stringify(['freedom-fighters', 'mau-mau', 'women-leaders']),
      verified: true
    },
    {
      name: 'Harry Thuku',
      age: 85,
      county: 'Kiambu',
      cause: 'Early nationalist and political activist',
      context: 'Early nationalist who fought against colonial policies and taxation',
      date_of_death: '1970-06-14',
      image_url: null,
      candles_lit: 398,
      tags: JSON.stringify(['freedom-fighters', 'nationalism', 'early-activism']),
      verified: true
    },
    {
      name: 'Mekatilili Wa Menza',
      age: 70,
      county: 'Kilifi',
      cause: 'Giriama resistance leader and women\'s rights advocate',
      context: 'Led the Giriama resistance against colonial rule and championed women\'s rights',
      date_of_death: '1924-11-08',
      image_url: null,
      candles_lit: 892,
      tags: JSON.stringify(['women-leaders', 'freedom-fighters', 'resistance']),
      verified: true
    },
    {
      name: 'Kipchoge Keino',
      age: 83,
      county: 'Nandi',
      cause: 'Olympic champion and sports ambassador',
      context: 'First Kenyan Olympic gold medalist who inspired generations of athletes',
      date_of_death: null,
      image_url: null,
      candles_lit: 1234,
      tags: JSON.stringify(['champions', 'sports', 'olympics']),
      verified: true
    },
    {
      name: 'Njenga Karume',
      age: 82,
      county: 'Kiambu',
      cause: 'Businessman and political leader',
      context: 'Successful businessman who supported independence and community development',
      date_of_death: '2012-02-24',
      image_url: null,
      candles_lit: 567,
      tags: JSON.stringify(['champions', 'business', 'community']),
      verified: true
    },
    {
      name: 'Margaret Kenyatta',
      age: 89,
      county: 'Nairobi',
      cause: 'First Lady and women\'s rights advocate',
      context: 'First Lady of Kenya who championed women\'s education and health',
      date_of_death: '2017-04-05',
      image_url: null,
      candles_lit: 445,
      tags: JSON.stringify(['women-leaders', 'first-lady', 'education']),
      verified: true
    },
    {
      name: 'Eliud Mathu',
      age: 75,
      county: 'Nyeri',
      cause: 'First African member of Legislative Council',
      context: 'Pioneering politician who broke barriers in colonial legislature',
      date_of_death: '1973-08-15',
      image_url: null,
      candles_lit: 321,
      tags: JSON.stringify(['freedom-fighters', 'politics', 'pioneers']),
      verified: true
    },
    {
      name: 'Wangu wa Makeri',
      age: 45,
      county: 'Murang\'a',
      cause: 'First female chief in colonial Kenya',
      context: 'Broke gender barriers as the first female chief during colonial rule',
      date_of_death: '1936-03-12',
      image_url: null,
      candles_lit: 678,
      tags: JSON.stringify(['women-leaders', 'pioneers', 'chiefs']),
      verified: true
    },
    {
      name: 'James Beauttah',
      age: 68,
      county: 'Nyeri',
      cause: 'Trade unionist and independence activist',
      context: 'Key figure in the trade union movement and independence struggle',
      date_of_death: '1973-12-08',
      image_url: null,
      candles_lit: 234,
      tags: JSON.stringify(['freedom-fighters', 'labor-rights', 'trade-unions']),
      verified: true
    },
    {
      name: 'Mary Nyanjiru',
      age: 35,
      county: 'Nairobi',
      cause: 'Women\'s rights activist and protest leader',
      context: 'Led women\'s protests against colonial policies and taxation',
      date_of_death: '1922-03-16',
      image_url: null,
      candles_lit: 543,
      tags: JSON.stringify(['women-leaders', 'protest-leader', 'early-activism']),
      verified: true
    },
    {
      name: 'Kenyatta wa Ngenyi',
      age: 78,
      county: 'Kiambu',
      cause: 'Cultural leader and independence supporter',
      context: 'Traditional leader who supported the independence movement',
      date_of_death: '1965-09-22',
      image_url: null,
      candles_lit: 189,
      tags: JSON.stringify(['champions', 'cultural-leader', 'independence']),
      verified: true
    },
    {
      name: 'Lilian Masediba Ngoyi',
      age: 68,
      county: 'Nairobi',
      cause: 'Women\'s rights activist and anti-apartheid campaigner',
      context: 'Fought for women\'s rights and against apartheid in South Africa',
      date_of_death: '1980-03-13',
      image_url: null,
      candles_lit: 456,
      tags: JSON.stringify(['women-leaders', 'anti-apartheid', 'women-rights']),
      verified: true
    },
    {
      name: 'Johnstone Kamau Ngengi',
      age: 81,
      county: 'Kiambu',
      cause: 'First President of Kenya',
      context: 'Led Kenya to independence and served as the first President',
      date_of_death: '1978-08-22',
      image_url: null,
      candles_lit: 3456,
      tags: JSON.stringify(['champions', 'president', 'independence']),
      verified: true
    },
    {
      name: 'Grace Imathiu',
      age: 72,
      county: 'Meru',
      cause: 'Women\'s rights activist and educator',
      context: 'Pioneering educator who championed girls\' education',
      date_of_death: '2008-11-30',
      image_url: null,
      candles_lit: 234,
      tags: JSON.stringify(['women-leaders', 'education', 'women-rights']),
      verified: true
    },
    {
      name: 'Kiprop arap Kirui',
      age: 65,
      county: 'Kericho',
      cause: 'Environmental activist and community leader',
      context: 'Fought for environmental conservation and community rights',
      date_of_death: '2015-07-18',
      image_url: null,
      candles_lit: 345,
      tags: JSON.stringify(['champions', 'environment', 'community']),
      verified: true
    },
    {
      name: 'Wanjiku wa Kihoro',
      age: 58,
      county: 'Nairobi',
      cause: 'Women\'s rights lawyer and activist',
      context: 'Pioneering lawyer who fought for women\'s legal rights',
      date_of_death: '2016-04-12',
      image_url: null,
      candles_lit: 567,
      tags: JSON.stringify(['women-leaders', 'law', 'women-rights']),
      verified: true
    },
    {
      name: 'Muthoni Likimani',
      age: 95,
      county: 'Nairobi',
      cause: 'Author, educator, and women\'s rights advocate',
      context: 'Pioneering author and educator who documented women\'s struggles',
      date_of_death: '2022-09-09',
      image_url: null,
      candles_lit: 234,
      tags: JSON.stringify(['women-leaders', 'education', 'literature']),
      verified: true
    },
    {
      name: 'Kipchoge Keino',
      age: 83,
      county: 'Nandi',
      cause: 'Olympic champion and sports ambassador',
      context: 'First Kenyan Olympic gold medalist who inspired generations of athletes',
      date_of_death: null,
      image_url: null,
      candles_lit: 1234,
      tags: JSON.stringify(['champions', 'sports', 'olympics']),
      verified: true
    },
    {
      name: 'Njenga Karume',
      age: 82,
      county: 'Kiambu',
      cause: 'Businessman and political leader',
      context: 'Successful businessman who supported independence and community development',
      date_of_death: '2012-02-24',
      image_url: null,
      candles_lit: 567,
      tags: JSON.stringify(['champions', 'business', 'community']),
      verified: true
    },
    {
      name: 'Margaret Kenyatta',
      age: 89,
      county: 'Nairobi',
      cause: 'First Lady and women\'s rights advocate',
      context: 'First Lady of Kenya who championed women\'s education and health',
      date_of_death: '2017-04-05',
      image_url: null,
      candles_lit: 445,
      tags: JSON.stringify(['women-leaders', 'first-lady', 'education']),
      verified: true
    },
    {
      name: 'Eliud Mathu',
      age: 75,
      county: 'Nyeri',
      cause: 'First African member of Legislative Council',
      context: 'Pioneering politician who broke barriers in colonial legislature',
      date_of_death: '1973-08-15',
      image_url: null,
      candles_lit: 321,
      tags: JSON.stringify(['freedom-fighters', 'politics', 'pioneers']),
      verified: true
    },
    {
      name: 'Wangu wa Makeri',
      age: 45,
      county: 'Murang\'a',
      cause: 'First female chief in colonial Kenya',
      context: 'Broke gender barriers as the first female chief during colonial rule',
      date_of_death: '1936-03-12',
      image_url: null,
      candles_lit: 678,
      tags: JSON.stringify(['women-leaders', 'pioneers', 'chiefs']),
      verified: true
    },
    {
      name: 'James Beauttah',
      age: 68,
      county: 'Nyeri',
      cause: 'Trade unionist and independence activist',
      context: 'Key figure in the trade union movement and independence struggle',
      date_of_death: '1973-12-08',
      image_url: null,
      candles_lit: 234,
      tags: JSON.stringify(['freedom-fighters', 'labor-rights', 'trade-unions']),
      verified: true
    },
    {
      name: 'Mary Nyanjiru',
      age: 35,
      county: 'Nairobi',
      cause: 'Women\'s rights activist and protest leader',
      context: 'Led women\'s protests against colonial policies and taxation',
      date_of_death: '1922-03-16',
      image_url: null,
      candles_lit: 543,
      tags: JSON.stringify(['women-leaders', 'protest-leader', 'early-activism']),
      verified: true
    },
    {
      name: 'Kenyatta wa Ngenyi',
      age: 78,
      county: 'Kiambu',
      cause: 'Cultural leader and independence supporter',
      context: 'Traditional leader who supported the independence movement',
      date_of_death: '1965-09-22',
      image_url: null,
      candles_lit: 189,
      tags: JSON.stringify(['champions', 'cultural-leader', 'independence']),
      verified: true
    },
    {
      name: 'Lilian Masediba Ngoyi',
      age: 68,
      county: 'Nairobi',
      cause: 'Women\'s rights activist and anti-apartheid campaigner',
      context: 'Fought for women\'s rights and against apartheid in South Africa',
      date_of_death: '1980-03-13',
      image_url: null,
      candles_lit: 456,
      tags: JSON.stringify(['women-leaders', 'anti-apartheid', 'women-rights']),
      verified: true
    },
    {
      name: 'Johnstone Kamau Ngengi',
      age: 81,
      county: 'Kiambu',
      cause: 'First President of Kenya',
      context: 'Led Kenya to independence and served as the first President',
      date_of_death: '1978-08-22',
      image_url: null,
      candles_lit: 3456,
      tags: JSON.stringify(['champions', 'president', 'independence']),
      verified: true
    },
    {
      name: 'Grace Imathiu',
      age: 72,
      county: 'Meru',
      cause: 'Women\'s rights activist and educator',
      context: 'Pioneering educator who championed girls\' education',
      date_of_death: '2008-11-30',
      image_url: null,
      candles_lit: 234,
      tags: JSON.stringify(['women-leaders', 'education', 'women-rights']),
      verified: true
    },
    {
      name: 'Kiprop arap Kirui',
      age: 65,
      county: 'Kericho',
      cause: 'Environmental activist and community leader',
      context: 'Fought for environmental conservation and community rights',
      date_of_death: '2015-07-18',
      image_url: null,
      candles_lit: 345,
      tags: JSON.stringify(['champions', 'environment', 'community']),
      verified: true
    },
    {
      name: 'Wanjiku wa Kihoro',
      age: 58,
      county: 'Nairobi',
      cause: 'Women\'s rights lawyer and activist',
      context: 'Pioneering lawyer who fought for women\'s legal rights',
      date_of_death: '2016-04-12',
      image_url: null,
      candles_lit: 567,
      tags: JSON.stringify(['women-leaders', 'law', 'women-rights']),
      verified: true
    },
    {
      name: 'Muthoni Likimani',
      age: 95,
      county: 'Nairobi',
      cause: 'Author, educator, and women\'s rights advocate',
      context: 'Pioneering author and educator who documented women\'s struggles',
      date_of_death: '2022-09-09',
      image_url: null,
      candles_lit: 234,
      tags: JSON.stringify(['women-leaders', 'education', 'literature']),
      verified: true
    },
    {
      name: 'Harry Thuku',
      age: 85,
      county: 'Kiambu',
      cause: 'Early nationalist and political activist',
      context: 'Early nationalist who fought against colonial policies and taxation',
      date_of_death: '1970-06-14',
      image_url: null,
      candles_lit: 321,
      tags: JSON.stringify(['freedom-fighters', 'nationalism', 'early-activism']),
      verified: true
    },
    {
      name: 'Mekatilili wa Menza',
      age: 65,
      county: 'Kilifi',
      cause: 'Giriama resistance leader',
      context: 'Led the Giriama resistance against British colonial rule',
      date_of_death: '1924-11-08',
      image_url: null,
      candles_lit: 234,
      tags: JSON.stringify(['women-leaders', 'resistance', 'colonial-opposition']),
      verified: true
    },
    {
      name: 'Jomo Kenyatta',
      age: 83,
      county: 'Kiambu',
      cause: 'First President of Kenya',
      context: 'First President of independent Kenya and founding father of the nation',
      date_of_death: '1978-08-22',
      image_url: null,
      candles_lit: 2987,
      tags: JSON.stringify(['champions', 'independence', 'presidency']),
      verified: true
    },
    {
      name: 'Charity Ngilu',
      age: 70,
      county: 'Kitui',
      cause: 'Women\'s rights activist and politician',
      context: 'First woman to run for President of Kenya and advocate for women\'s rights',
      date_of_death: null,
      image_url: null,
      candles_lit: 456,
      tags: JSON.stringify(['women-leaders', 'politics', 'women-rights']),
      verified: true
    }
  ];

  // Insert memory archive data
  sampleMemoryData.forEach(memory => {
    db.query('INSERT IGNORE INTO memory_archive (name, age, county, cause, context, date_of_death, image_url, candles_lit, tags, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [memory.name, memory.age, memory.county, memory.cause, memory.context, memory.date_of_death, memory.image_url, memory.candles_lit, memory.tags, memory.verified],
      (err) => {
        if (err && err.code !== 'ER_DUP_ENTRY') {
          console.error('Error inserting memory:', err);
        }
      }
    );
  });

  // Database already populated - skipping sample data insertion
  console.log('Database already contains sample data - skipping insertion');

  // Add sample protest archive data
  const sampleProtestData = [
    {
      title: 'Finance Bill Protests',
      date: '2024-06-20',
      location: 'Nairobi CBD',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['economic-justice', 'political-reform']),
      turnout_estimate: 15000,
      outcome: 'arrests',
      description: 'Massive protests against the Finance Bill 2024, with youth leading the demonstrations across the country.',
      verified: true
    },
    {
      title: 'Climate Justice March',
      date: '2024-06-15',
      location: 'Nairobi CBD → Parliament Road',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['climate-justice', 'environment']),
      turnout_estimate: 3500,
      outcome: 'peaceful',
      description: 'Youth-led climate action march demanding stronger environmental policies and climate justice for Kenya.',
      verified: true
    },
    {
      title: 'Student Rights March',
      date: '2024-05-10',
      location: 'University of Nairobi',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['student-rights', 'education']),
      turnout_estimate: 800,
      outcome: 'peaceful',
      description: 'Students marching for better education policies and student welfare reforms.',
      verified: true
    },
    {
      title: 'Gender Rights Rally',
      date: '2024-03-08',
      location: 'Uhuru Park',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['gbv', 'women-rights']),
      turnout_estimate: 1200,
      outcome: 'peaceful',
      description: 'International Women\'s Day rally advocating for gender equality and ending gender-based violence.',
      verified: true
    },
    {
      title: 'Land Rights Protest',
      date: '2024-04-22',
      location: 'Mombasa County',
      county: 'Mombasa',
      purpose_tags: JSON.stringify(['land-rights', 'community']),
      turnout_estimate: 500,
      outcome: 'dispersed',
      description: 'Community protest against land grabbing and advocating for indigenous land rights.',
      verified: true
    },
    {
      title: 'Youth Employment March',
      date: '2024-03-15',
      location: 'Kisumu CBD',
      county: 'Kisumu',
      purpose_tags: JSON.stringify(['youth-rights', 'employment']),
      turnout_estimate: 800,
      outcome: 'peaceful',
      description: 'Youth-led march demanding better employment opportunities and youth-friendly policies.',
      verified: true
    },
    {
      title: 'Healthcare Access Rally',
      date: '2024-02-28',
      location: 'Nakuru County Hospital',
      county: 'Nakuru',
      purpose_tags: JSON.stringify(['healthcare', 'community']),
      turnout_estimate: 400,
      outcome: 'peaceful',
      description: 'Community rally demanding better healthcare access and improved medical facilities.',
      verified: true
    },
    {
      title: 'Environmental Conservation March',
      date: '2024-01-20',
      location: 'Kericho Tea Estates',
      county: 'Kericho',
      purpose_tags: JSON.stringify(['environment', 'conservation']),
      turnout_estimate: 300,
      outcome: 'peaceful',
      description: 'Local community march against deforestation and for environmental conservation.',
      verified: true
    },
    {
      title: 'Women Farmers Rights',
      date: '2024-05-05',
      location: 'Meru County',
      county: 'Meru',
      purpose_tags: JSON.stringify(['women-rights', 'agriculture']),
      turnout_estimate: 600,
      outcome: 'peaceful',
      description: 'Women farmers protesting for better access to agricultural resources and markets.',
      verified: true
    },
    {
      title: 'Digital Rights Protest',
      date: '2024-04-10',
      location: 'Nairobi Tech Hub',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['digital-rights', 'technology']),
      turnout_estimate: 200,
      outcome: 'peaceful',
      description: 'Tech community protest against internet censorship and for digital rights protection.',
      verified: true
    },
    {
      title: 'Artists Rights March',
      date: '2024-03-25',
      location: 'Nairobi Cultural Center',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['arts-rights', 'cultural-preservation']),
      turnout_estimate: 150,
      outcome: 'peaceful',
      description: 'Artists marching for better copyright protection and support for local arts.',
      verified: true
    },
    {
      title: 'Rural Development Rally',
      date: '2024-02-10',
      location: 'Baringo County',
      county: 'Baringo',
      purpose_tags: JSON.stringify(['rural-development', 'infrastructure']),
      turnout_estimate: 250,
      outcome: 'peaceful',
      description: 'Rural community rally demanding better infrastructure and development projects.',
      verified: true
    },
    {
      title: 'Youth Mental Health Awareness',
      date: '2024-06-08',
      location: 'Nairobi University',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['mental-health', 'youth-rights']),
      turnout_estimate: 350,
      outcome: 'peaceful',
      description: 'Youth-led awareness march for better mental health support and services.',
      verified: true
    },
    {
      title: 'Indigenous Rights Protest',
      date: '2024-05-18',
      location: 'Samburu County',
      county: 'Samburu',
      purpose_tags: JSON.stringify(['indigenous-rights', 'cultural-preservation']),
      turnout_estimate: 180,
      outcome: 'peaceful',
      description: 'Indigenous community protest for cultural preservation and land rights.',
      verified: true
    },
    {
      title: 'Healthcare Workers Strike',
      date: '2024-02-15',
      location: 'Kenyatta National Hospital',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['healthcare', 'workers-rights']),
      turnout_estimate: 2500,
      outcome: 'peaceful',
      description: 'Healthcare workers protesting for better working conditions and improved healthcare infrastructure.',
      verified: true
    },
    {
      title: 'Teachers Union March',
      date: '2024-01-20',
      location: 'Teachers Service Commission',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['education', 'workers-rights']),
      turnout_estimate: 1800,
      outcome: 'peaceful',
      description: 'Teachers marching for better salaries and improved education policies.',
      verified: true
    },
    {
      title: 'Transport Workers Strike',
      date: '2024-03-25',
      location: 'Nairobi Bus Station',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['transport', 'workers-rights']),
      turnout_estimate: 1200,
      outcome: 'dispersed',
      description: 'Transport workers protesting against new regulations and demanding better working conditions.',
      verified: true
    },
    {
      title: 'Youth Unemployment Rally',
      date: '2024-05-30',
      location: 'Central Park',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['youth-rights', 'employment']),
      turnout_estimate: 3000,
      outcome: 'peaceful',
      description: 'Youth-led rally demanding government action on unemployment and job creation.',
      verified: true
    },
    {
      title: 'Anti-Corruption March',
      date: '2024-04-15',
      location: 'Nairobi CBD',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['anti-corruption', 'governance']),
      turnout_estimate: 4500,
      outcome: 'peaceful',
      description: 'Citizens marching against corruption and demanding transparency in government.',
      verified: true
    },
    {
      title: 'Police Brutality Protest',
      date: '2024-03-12',
      location: 'Kibera Slums',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['police-reform', 'human-rights']),
      turnout_estimate: 800,
      outcome: 'arrests',
      description: 'Community protest against police brutality and demanding police reforms.',
      verified: true
    },
    {
      title: 'Housing Rights March',
      date: '2024-06-08',
      location: 'Mathare Slums',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['housing-rights', 'urban-poor']),
      turnout_estimate: 1200,
      outcome: 'peaceful',
      description: 'Residents protesting for better housing conditions and against forced evictions.',
      verified: true
    },
    {
      title: 'Water Rights Protest',
      date: '2024-05-18',
      location: 'Kajiado County',
      county: 'Kajiado',
      purpose_tags: JSON.stringify(['water-rights', 'environment']),
      turnout_estimate: 600,
      outcome: 'peaceful',
      description: 'Community protest against water privatization and demanding access to clean water.',
      verified: true
    },
    {
      title: 'Digital Rights Rally',
      date: '2024-04-30',
      location: 'Nairobi Tech Hub',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['digital-rights', 'internet-freedom']),
      turnout_estimate: 400,
      outcome: 'peaceful',
      description: 'Tech community rallying for internet freedom and digital rights protection.',
      verified: true
    },
    {
      title: 'Artists Rights March',
      date: '2024-03-28',
      location: 'National Theatre',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['arts-rights', 'cultural-rights']),
      turnout_estimate: 300,
      outcome: 'peaceful',
      description: 'Artists protesting for better support and protection of creative industries.',
      verified: true
    },
    {
      title: 'Small Business Protest',
      date: '2024-06-12',
      location: 'Eastleigh',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['business-rights', 'economic-justice']),
      turnout_estimate: 1500,
      outcome: 'peaceful',
      description: 'Small business owners protesting against unfair regulations and high taxes.',
      verified: true
    },
    {
      title: 'Mental Health Awareness March',
      date: '2024-05-25',
      location: 'Uhuru Park',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['mental-health', 'healthcare']),
      turnout_estimate: 700,
      outcome: 'peaceful',
      description: 'Mental health advocates marching for better mental health services and awareness.',
      verified: true
    },
    {
      title: 'LGBTQ+ Rights Rally',
      date: '2024-06-28',
      location: 'Nairobi CBD',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['lgbtq-rights', 'human-rights']),
      turnout_estimate: 200,
      outcome: 'dispersed',
      description: 'LGBTQ+ community and allies rallying for equal rights and protection.',
      verified: true
    },
    {
      title: 'Elderly Rights March',
      date: '2024-04-20',
      location: 'City Hall',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['elderly-rights', 'social-welfare']),
      turnout_estimate: 400,
      outcome: 'peaceful',
      description: 'Elderly citizens marching for better social welfare and healthcare services.',
      verified: true
    },
    {
      title: 'Disability Rights Protest',
      date: '2024-05-15',
      location: 'Parliament Road',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['disability-rights', 'accessibility']),
      turnout_estimate: 350,
      outcome: 'peaceful',
      description: 'Persons with disabilities protesting for better accessibility and inclusion.',
      verified: true
    },
    {
      title: 'Farmers Rights March',
      date: '2024-06-05',
      location: 'Nakuru County',
      county: 'Nakuru',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 2500,
      outcome: 'peaceful',
      description: 'Farmers protesting for better agricultural policies and market access.',
      verified: true
    },
    {
      title: 'Fishermen Rights Protest',
      date: '2024-04-10',
      location: 'Mombasa Beach',
      county: 'Mombasa',
      purpose_tags: JSON.stringify(['fishermen-rights', 'marine-conservation']),
      turnout_estimate: 800,
      outcome: 'peaceful',
      description: 'Fishermen protesting against overfishing and demanding sustainable fishing policies.',
      verified: true
    },
    {
      title: 'Mining Community Protest',
      date: '2024-05-22',
      location: 'Kakamega County',
      county: 'Kakamega',
      purpose_tags: JSON.stringify(['mining-rights', 'environment']),
      turnout_estimate: 600,
      outcome: 'dispersed',
      description: 'Mining communities protesting against environmental degradation and demanding fair compensation.',
      verified: true
    },
    {
      title: 'Pastoralists Rights March',
      date: '2024-06-18',
      location: 'Isiolo County',
      county: 'Isiolo',
      purpose_tags: JSON.stringify(['pastoralists-rights', 'land-rights']),
      turnout_estimate: 1200,
      outcome: 'peaceful',
      description: 'Pastoralist communities marching for grazing rights and land protection.',
      verified: true
    },
    {
      title: 'Refugee Rights Rally',
      date: '2024-04-25',
      location: 'Dadaab Refugee Camp',
      county: 'Garissa',
      purpose_tags: JSON.stringify(['refugee-rights', 'humanitarian']),
      turnout_estimate: 1500,
      outcome: 'peaceful',
      description: 'Refugees and supporters rallying for better living conditions and rights protection.',
      verified: true
    },
    {
      title: 'Street Children Rights March',
      date: '2024-05-08',
      location: 'Nairobi CBD',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['children-rights', 'social-welfare']),
      turnout_estimate: 300,
      outcome: 'peaceful',
      description: 'Advocates marching for the rights and welfare of street children.',
      verified: true
    },
    {
      title: 'Sex Workers Rights Rally',
      date: '2024-06-22',
      location: 'Nairobi CBD',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['sex-workers-rights', 'decriminalization']),
      turnout_estimate: 150,
      outcome: 'dispersed',
      description: 'Sex workers and allies rallying for decriminalization and better working conditions.',
      verified: true
    },
    {
      title: 'Religious Freedom Protest',
      date: '2024-04-18',
      location: 'Nairobi CBD',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['religious-freedom', 'human-rights']),
      turnout_estimate: 800,
      outcome: 'peaceful',
      description: 'Religious communities protesting for freedom of worship and against discrimination.',
      verified: true
    },
    {
      title: 'Academic Freedom March',
      date: '2024-05-12',
      location: 'University of Nairobi',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['academic-freedom', 'education']),
      turnout_estimate: 600,
      outcome: 'peaceful',
      description: 'Academics and students marching for academic freedom and research independence.',
      verified: true
    },
    {
      title: 'Press Freedom Rally',
      date: '2024-06-25',
      location: 'Nation Media Group',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['press-freedom', 'media-rights']),
      turnout_estimate: 400,
      outcome: 'peaceful',
      description: 'Journalists and media workers rallying for press freedom and protection.',
      verified: true
    },
    {
      title: 'Consumer Rights Protest',
      date: '2024-04-28',
      location: 'Nairobi CBD',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['consumer-rights', 'economic-justice']),
      turnout_estimate: 900,
      outcome: 'peaceful',
      description: 'Consumers protesting against high prices and poor service quality.',
      verified: true
    },
    {
      title: 'Taxi Drivers Strike',
      date: '2024-05-20',
      location: 'Nairobi CBD',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['transport', 'workers-rights']),
      turnout_estimate: 2000,
      outcome: 'dispersed',
      description: 'Taxi drivers protesting against ride-sharing regulations and demanding fair competition.',
      verified: true
    },
    {
      title: 'Construction Workers March',
      date: '2024-06-10',
      location: 'Nairobi CBD',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['workers-rights', 'safety']),
      turnout_estimate: 1500,
      outcome: 'peaceful',
      description: 'Construction workers marching for better safety standards and working conditions.',
      verified: true
    },
    {
      title: 'Domestic Workers Rights Rally',
      date: '2024-04-30',
      location: 'Nairobi CBD',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['workers-rights', 'domestic-workers']),
      turnout_estimate: 800,
      outcome: 'peaceful',
      description: 'Domestic workers rallying for better wages and working conditions.',
      verified: true
    },
    {
      title: 'Street Vendors Protest',
      date: '2024-05-28',
      location: 'Nairobi CBD',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['street-vendors', 'economic-rights']),
      turnout_estimate: 1200,
      outcome: 'dispersed',
      description: 'Street vendors protesting against harassment and demanding designated vending areas.',
      verified: true
    },
    {
      title: 'Boda Boda Operators March',
      date: '2024-06-15',
      location: 'Nairobi CBD',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['transport', 'workers-rights']),
      turnout_estimate: 3000,
      outcome: 'peaceful',
      description: 'Motorcycle taxi operators marching for better regulations and safety standards.',
      verified: true
    },
    {
      title: 'Market Traders Protest',
      date: '2024-04-22',
      location: 'Gikomba Market',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['market-traders', 'economic-rights']),
      turnout_estimate: 1800,
      outcome: 'peaceful',
      description: 'Market traders protesting against market closures and demanding better facilities.',
      verified: true
    },
    {
      title: 'Beach Operators Rally',
      date: '2024-05-30',
      location: 'Diani Beach',
      county: 'Kwale',
      purpose_tags: JSON.stringify(['tourism', 'workers-rights']),
      turnout_estimate: 400,
      outcome: 'peaceful',
      description: 'Beach operators rallying for better tourism policies and infrastructure.',
      verified: true
    },
    {
      title: 'Hotel Workers Strike',
      date: '2024-06-08',
      location: 'Mombasa Beach Hotels',
      county: 'Mombasa',
      purpose_tags: JSON.stringify(['tourism', 'workers-rights']),
      turnout_estimate: 800,
      outcome: 'peaceful',
      description: 'Hotel workers striking for better wages and working conditions.',
      verified: true
    },
    {
      title: 'Safari Guides Protest',
      date: '2024-04-15',
      location: 'Maasai Mara',
      county: 'Narok',
      purpose_tags: JSON.stringify(['tourism', 'workers-rights']),
      turnout_estimate: 300,
      outcome: 'peaceful',
      description: 'Safari guides protesting for better compensation and wildlife protection policies.',
      verified: true
    },
    {
      title: 'Coffee Farmers March',
      date: '2024-05-25',
      location: 'Nyeri County',
      county: 'Nyeri',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 2000,
      outcome: 'peaceful',
      description: 'Coffee farmers marching for better prices and market access.',
      verified: true
    },
    {
      title: 'Tea Workers Strike',
      date: '2024-06-12',
      location: 'Kericho County',
      county: 'Kericho',
      purpose_tags: JSON.stringify(['workers-rights', 'agriculture']),
      turnout_estimate: 5000,
      outcome: 'peaceful',
      description: 'Tea plantation workers striking for better wages and working conditions.',
      verified: true
    },
    {
      title: 'Sugarcane Farmers Protest',
      date: '2024-04-28',
      location: 'Kisumu County',
      county: 'Kisumu',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 1500,
      outcome: 'peaceful',
      description: 'Sugarcane farmers protesting for better prices and factory access.',
      verified: true
    },
    {
      title: 'Maize Farmers Rally',
      date: '2024-05-18',
      location: 'Uasin Gishu County',
      county: 'Uasin Gishu',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 3000,
      outcome: 'peaceful',
      description: 'Maize farmers rallying for better prices and government support.',
      verified: true
    },
    {
      title: 'Dairy Farmers March',
      date: '2024-06-20',
      location: 'Nakuru County',
      county: 'Nakuru',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 1200,
      outcome: 'peaceful',
      description: 'Dairy farmers marching for better milk prices and market access.',
      verified: true
    },
    {
      title: 'Poultry Farmers Protest',
      date: '2024-04-25',
      location: 'Kiambu County',
      county: 'Kiambu',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 800,
      outcome: 'peaceful',
      description: 'Poultry farmers protesting for better prices and disease control support.',
      verified: true
    },
    {
      title: 'Horticulture Farmers Rally',
      date: '2024-05-22',
      location: 'Murang\'a County',
      county: 'Murang\'a',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 1000,
      outcome: 'peaceful',
      description: 'Horticulture farmers rallying for better export policies and market access.',
      verified: true
    },
    {
      title: 'Livestock Farmers March',
      date: '2024-06-18',
      location: 'Kajiado County',
      county: 'Kajiado',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 1500,
      outcome: 'peaceful',
      description: 'Livestock farmers marching for better grazing rights and market access.',
      verified: true
    },
    {
      title: 'Fish Farmers Protest',
      date: '2024-04-30',
      location: 'Kisumu County',
      county: 'Kisumu',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 600,
      outcome: 'peaceful',
      description: 'Fish farmers protesting for better policies and market access.',
      verified: true
    },
    {
      title: 'Beekeepers Rally',
      date: '2024-05-28',
      location: 'Baringo County',
      county: 'Baringo',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 400,
      outcome: 'peaceful',
      description: 'Beekeepers rallying for better honey prices and forest protection.',
      verified: true
    },
    {
      title: 'Aloe Vera Farmers March',
      date: '2024-06-25',
      location: 'Kitui County',
      county: 'Kitui',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 300,
      outcome: 'peaceful',
      description: 'Aloe vera farmers marching for better prices and processing facilities.',
      verified: true
    },
    {
      title: 'Miraa Traders Protest',
      date: '2024-04-20',
      location: 'Meru County',
      county: 'Meru',
      purpose_tags: JSON.stringify(['farmers-rights', 'trade']),
      turnout_estimate: 2000,
      outcome: 'peaceful',
      description: 'Miraa traders protesting for better transport and market access.',
      verified: true
    },
    {
      title: 'Cashew Nut Farmers Rally',
      date: '2024-05-15',
      location: 'Kwale County',
      county: 'Kwale',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 800,
      outcome: 'peaceful',
      description: 'Cashew nut farmers rallying for better prices and processing facilities.',
      verified: true
    },
    {
      title: 'Macadamia Farmers March',
      date: '2024-06-22',
      location: 'Embu County',
      county: 'Embu',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 600,
      outcome: 'peaceful',
      description: 'Macadamia farmers marching for better prices and market access.',
      verified: true
    },
    {
      title: 'Avocado Farmers Protest',
      date: '2024-04-18',
      location: 'Murang\'a County',
      county: 'Murang\'a',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 1200,
      outcome: 'peaceful',
      description: 'Avocado farmers protesting for better export policies and prices.',
      verified: true
    },
    {
      title: 'Mango Farmers Rally',
      date: '2024-05-30',
      location: 'Machakos County',
      county: 'Machakos',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 900,
      outcome: 'peaceful',
      description: 'Mango farmers rallying for better prices and processing facilities.',
      verified: true
    },
    {
      title: 'Pineapple Farmers March',
      date: '2024-06-28',
      location: 'Thika County',
      county: 'Kiambu',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 700,
      outcome: 'peaceful',
      description: 'Pineapple farmers marching for better prices and market access.',
      verified: true
    },
    {
      title: 'Banana Farmers Protest',
      date: '2024-04-25',
      location: 'Kisii County',
      county: 'Kisii',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 1500,
      outcome: 'peaceful',
      description: 'Banana farmers protesting for better prices and disease control support.',
      verified: true
    },
    {
      title: 'Potato Farmers Rally',
      date: '2024-05-20',
      location: 'Nyandarua County',
      county: 'Nyandarua',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 2000,
      outcome: 'peaceful',
      description: 'Potato farmers rallying for better prices and storage facilities.',
      verified: true
    },
    {
      title: 'Tomato Farmers March',
      date: '2024-06-15',
      location: 'Kirinyaga County',
      county: 'Kirinyaga',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 1000,
      outcome: 'peaceful',
      description: 'Tomato farmers marching for better prices and market access.',
      verified: true
    },
    {
      title: 'Onion Farmers Protest',
      date: '2024-04-30',
      location: 'Kajiado County',
      county: 'Kajiado',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 800,
      outcome: 'peaceful',
      description: 'Onion farmers protesting for better prices and irrigation support.',
      verified: true
    },
    {
      title: 'Carrot Farmers Rally',
      date: '2024-05-25',
      location: 'Nakuru County',
      county: 'Nakuru',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 600,
      outcome: 'peaceful',
      description: 'Carrot farmers rallying for better prices and market access.',
      verified: true
    },
    {
      title: 'Cabbage Farmers March',
      date: '2024-06-20',
      location: 'Kiambu County',
      county: 'Kiambu',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 500,
      outcome: 'peaceful',
      description: 'Cabbage farmers marching for better prices and pest control support.',
      verified: true
    },
    {
      title: 'Spinach Farmers Protest',
      date: '2024-04-28',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 400,
      outcome: 'peaceful',
      description: 'Spinach farmers protesting for better prices and market access.',
      verified: true
    },
    {
      title: 'Kale Farmers Rally',
      date: '2024-05-18',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 300,
      outcome: 'peaceful',
      description: 'Kale farmers rallying for better prices and market access.',
      verified: true
    },
    {
      title: 'Cucumber Farmers March',
      date: '2024-06-25',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 250,
      outcome: 'peaceful',
      description: 'Cucumber farmers marching for better prices and market access.',
      verified: true
    },
    {
      title: 'Pepper Farmers Protest',
      date: '2024-04-22',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 200,
      outcome: 'peaceful',
      description: 'Pepper farmers protesting for better prices and market access.',
      verified: true
    },
    {
      title: 'Garlic Farmers Rally',
      date: '2024-05-30',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 150,
      outcome: 'peaceful',
      description: 'Garlic farmers rallying for better prices and market access.',
      verified: true
    },
    {
      title: 'Ginger Farmers March',
      date: '2024-06-28',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 100,
      outcome: 'peaceful',
      description: 'Ginger farmers marching for better prices and market access.',
      verified: true
    },
    {
      title: 'Turmeric Farmers Protest',
      date: '2024-04-25',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 80,
      outcome: 'peaceful',
      description: 'Turmeric farmers protesting for better prices and market access.',
      verified: true
    },
    {
      title: 'Cinnamon Farmers Rally',
      date: '2024-05-22',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 60,
      outcome: 'peaceful',
      description: 'Cinnamon farmers rallying for better prices and market access.',
      verified: true
    },
    {
      title: 'Cardamom Farmers March',
      date: '2024-06-18',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 40,
      outcome: 'peaceful',
      description: 'Cardamom farmers marching for better prices and market access.',
      verified: true
    },
    {
      title: 'Vanilla Farmers Protest',
      date: '2024-04-30',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 30,
      outcome: 'peaceful',
      description: 'Vanilla farmers protesting for better prices and market access.',
      verified: true
    },
    {
      title: 'Saffron Farmers Rally',
      date: '2024-05-28',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 20,
      outcome: 'peaceful',
      description: 'Saffron farmers rallying for better prices and market access.',
      verified: true
    },
    {
      title: 'Nutmeg Farmers March',
      date: '2024-06-22',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 15,
      outcome: 'peaceful',
      description: 'Nutmeg farmers marching for better prices and market access.',
      verified: true
    },
    {
      title: 'Clove Farmers Protest',
      date: '2024-04-18',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 10,
      outcome: 'peaceful',
      description: 'Clove farmers protesting for better prices and market access.',
      verified: true
    },
    {
      title: 'Allspice Farmers Rally',
      date: '2024-05-15',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 8,
      outcome: 'peaceful',
      description: 'Allspice farmers rallying for better prices and market access.',
      verified: true
    },
    {
      title: 'Bay Leaf Farmers March',
      date: '2024-06-25',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 5,
      outcome: 'peaceful',
      description: 'Bay leaf farmers marching for better prices and market access.',
      verified: true
    },
    {
      title: 'Oregano Farmers Protest',
      date: '2024-04-28',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 3,
      outcome: 'peaceful',
      description: 'Oregano farmers protesting for better prices and market access.',
      verified: true
    },
    {
      title: 'Thyme Farmers Rally',
      date: '2024-05-20',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 2,
      outcome: 'peaceful',
      description: 'Thyme farmers rallying for better prices and market access.',
      verified: true
    },
    {
      title: 'Rosemary Farmers March',
      date: '2024-06-15',
      location: 'Nairobi County',
      county: 'Nairobi',
      purpose_tags: JSON.stringify(['farmers-rights', 'agriculture']),
      turnout_estimate: 1,
      outcome: 'peaceful',
      description: 'Rosemary farmers marching for better prices and market access.',
      verified: true
    }
  ];

  // Clear existing protest data and insert fresh diverse content
  db.query('DELETE FROM protests WHERE verified = true', (err) => {
    if (err) {
      console.error('Error clearing protests:', err);
    } else {
      console.log('Cleared existing protest data');
      
      // Insert new diverse protest data
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
    }
  });
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

// Serve static files (uploads only - remove React app serving for development)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use(express.static(path.join(__dirname, 'client/build'))); // Commented out for development

// Image upload endpoint for Civic Memory Archive
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Return the file path that can be used in the database
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

// Add comprehensive learning system seed data
// seedLearningSystemData(); // Commented out to prevent duplicate data on every server restart

// Seed Learning System Data
function seedLearningSystemData() {
  // Enhanced learning modules that match the frontend
  const learningModules = [
    {
      title: "Kenyan Constitution Basics",
      description: "Learn about the fundamental principles, structure, and key provisions of Kenya's 2010 Constitution.",
      content: "The Constitution of Kenya 2010 is the supreme law of the land. It establishes the structure of government, defines the relationship between different branches of government, and guarantees fundamental rights and freedoms to all Kenyans...",
      difficulty: "beginner",
      xp_reward: 50,
      tags: JSON.stringify(["constitution", "law", "rights", "government"]),
      prerequisites: JSON.stringify([]),
      icon: "📜",
      category: "Constitutional Law",
      estimated_duration: 45,
      status: "published",
      is_featured: true
    },
    {
      title: "Civic Participation & Democracy",
      description: "Understanding your rights and responsibilities as a Kenyan citizen in a democratic society.",
      content: "Democracy is not just about voting every five years. It's about active participation in civic life, understanding your rights, and holding leaders accountable...",
      difficulty: "beginner",
      xp_reward: 75,
      tags: JSON.stringify(["democracy", "participation", "citizenship", "voting"]),
      prerequisites: JSON.stringify([]),
      icon: "🗳️",
      category: "Civic Education",
      estimated_duration: 60,
      status: "published",
      is_featured: false
    },
    {
      title: "County Government & Devolution",
      description: "How devolution works, county functions, and your role in local governance.",
      content: "Devolution is the transfer of power from the national government to county governments. This system ensures that decisions are made closer to the people...",
      difficulty: "intermediate",
      xp_reward: 100,
      tags: JSON.stringify(["devolution", "counties", "local-government", "governance"]),
      prerequisites: JSON.stringify(["constitution"]),
      icon: "🏛️",
      category: "Local Government",
      estimated_duration: 75,
      status: "published",
      is_featured: false
    },
    {
      title: "Human Rights & Justice",
      description: "Understanding fundamental human rights and the justice system in Kenya.",
      content: "Human rights are the basic rights and freedoms that belong to every person. In Kenya, these rights are protected by the Constitution and various laws...",
      difficulty: "intermediate",
      xp_reward: 90,
      tags: JSON.stringify(["human-rights", "justice", "law", "equality"]),
      prerequisites: JSON.stringify(["constitution"]),
      icon: "⚖️",
      category: "Human Rights",
      estimated_duration: 60,
      status: "published",
      is_featured: false
    },
    {
      title: "Anti-Corruption & Integrity",
      description: "Fighting corruption through awareness, reporting, and promoting integrity.",
      content: "Corruption undermines democracy, economic development, and social justice. Understanding how to identify, report, and prevent corruption is crucial...",
      difficulty: "advanced",
      xp_reward: 120,
      tags: JSON.stringify(["anti-corruption", "integrity", "transparency", "accountability"]),
      prerequisites: JSON.stringify(["constitution", "human-rights"]),
      icon: "🛡️",
      category: "Anti-Corruption",
      estimated_duration: 90,
      status: "published",
      is_featured: false
    },
    {
      title: "Youth Leadership & Empowerment",
      description: "Developing leadership skills and engaging effectively in civic activities.",
      content: "Youth are not just the leaders of tomorrow, they are leaders today. This module focuses on developing leadership skills, understanding civic engagement...",
      difficulty: "intermediate",
      xp_reward: 85,
      tags: JSON.stringify(["youth", "leadership", "empowerment", "civic-engagement"]),
      prerequisites: JSON.stringify(["civic-participation"]),
      icon: "🌟",
      category: "Youth Development",
      estimated_duration: 75,
      status: "published",
      is_featured: false
    }
  ];

  // Insert learning modules
  learningModules.forEach(module => {
    db.query('INSERT IGNORE INTO learning_modules (title, description, content, difficulty, xp_reward, tags, prerequisites, icon, category, estimated_duration, status, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [module.title, module.description, module.content, module.difficulty, module.xp_reward, module.tags, module.prerequisites, module.icon, module.category, module.estimated_duration, module.status, module.is_featured],
      (err) => {
        if (err && err.code !== 'ER_DUP_ENTRY') {
          console.error('Error inserting learning module:', err);
        }
      }
    );
  });

  // Create a complete module with lessons and quizzes
  const completeModule = {
    title: "Civic Rights & Responsibilities",
    description: "A comprehensive guide to understanding your rights and responsibilities as a Kenyan citizen.",
    content: "This module covers the fundamental rights and responsibilities that every Kenyan citizen should know. From voting rights to civic duties, you'll learn how to be an active and informed citizen.",
    difficulty: "beginner",
    xp_reward: 150,
    tags: JSON.stringify(["civic-rights", "responsibilities", "citizenship", "democracy"]),
    prerequisites: JSON.stringify([]),
    icon: "🇰🇪",
    category: "Civic Education",
    estimated_duration: 120,
    status: "published",
    is_featured: true
  };

  // Insert the complete module first
  db.query('INSERT IGNORE INTO learning_modules (title, description, content, difficulty, xp_reward, tags, prerequisites, icon, category, estimated_duration, status, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [completeModule.title, completeModule.description, completeModule.content, completeModule.difficulty, completeModule.xp_reward, completeModule.tags, completeModule.prerequisites, completeModule.icon, completeModule.category, completeModule.estimated_duration, completeModule.status, completeModule.is_featured],
    (err, result) => {
      if (err && err.code !== 'ER_DUP_ENTRY') {
        console.error('Error inserting complete module:', err);
      } else {
        // Get the module ID to create lessons and quizzes
        db.query('SELECT id FROM learning_modules WHERE title = ?', [completeModule.title], (err, results) => {
          if (err || results.length === 0) return;
          
          const moduleId = results[0].id;
          
          // Create lessons for this module
          const lessons = [
            {
              title: "Understanding Your Rights",
              content: "Every Kenyan citizen has fundamental rights guaranteed by the Constitution. These include the right to life, liberty, and security of person; freedom of expression; freedom of assembly; and the right to participate in government. Understanding these rights is the first step to protecting them.",
              order_index: 1,
              estimated_duration: 20,
              media_urls: JSON.stringify([])
            },
            {
              title: "Your Civic Responsibilities",
              content: "With rights come responsibilities. As a Kenyan citizen, you have the responsibility to obey the law, pay taxes, serve on juries when called, and participate in the democratic process. These responsibilities ensure that our democracy functions properly.",
              order_index: 2,
              estimated_duration: 25,
              media_urls: JSON.stringify([])
            },
            {
              title: "Participating in Democracy",
              content: "Democracy is not a spectator sport. Active participation includes voting in elections, staying informed about current issues, contacting your representatives, and participating in community organizations. Your voice matters in shaping the future of Kenya.",
              order_index: 3,
              estimated_duration: 30,
              media_urls: JSON.stringify([])
            },
            {
              title: "Holding Leaders Accountable",
              content: "Accountability is a cornerstone of democracy. Citizens have the right and responsibility to question government actions, demand transparency, and hold leaders accountable for their decisions. This includes participating in oversight mechanisms and reporting corruption.",
              order_index: 4,
              estimated_duration: 25,
              media_urls: JSON.stringify([])
            },
            {
              title: "Building Community",
              content: "Strong communities are built on active citizenship. This includes volunteering, supporting local initiatives, and working with others to solve community problems. Together, we can build a better Kenya for everyone.",
              order_index: 5,
              estimated_duration: 20,
              media_urls: JSON.stringify([])
            }
          ];

          // Insert lessons
          lessons.forEach(lesson => {
            db.query('INSERT IGNORE INTO lessons (module_id, title, content, order_index, estimated_duration, media_urls) VALUES (?, ?, ?, ?, ?, ?)',
              [moduleId, lesson.title, lesson.content, lesson.order_index, lesson.estimated_duration, lesson.media_urls],
              (err) => {
                if (err && err.code !== 'ER_DUP_ENTRY') {
                  console.error('Error inserting lesson:', err);
                }
              }
            );
          });

          // Create a comprehensive quiz for this module
          const moduleQuiz = {
            title: "Civic Rights & Responsibilities Quiz",
            questions: JSON.stringify([
              {
                question: "What is the primary responsibility of every Kenyan citizen?",
                options: ["To vote in every election", "To obey the law", "To join a political party", "To attend government meetings"],
                correct_answer: "To obey the law"
              },
              {
                question: "Which of the following is NOT a fundamental right guaranteed by the Constitution?",
                options: ["Right to life", "Freedom of expression", "Right to free housing", "Freedom of assembly"],
                correct_answer: "Right to free housing"
              },
              {
                question: "What is the best way to participate in democracy beyond voting?",
                options: ["Staying silent on issues", "Staying informed and engaged", "Avoiding political discussions", "Only focusing on personal matters"],
                correct_answer: "Staying informed and engaged"
              },
              {
                question: "Why is accountability important in democracy?",
                options: ["It makes leaders popular", "It ensures government serves the people", "It reduces taxes", "It increases government size"],
                correct_answer: "It ensures government serves the people"
              },
              {
                question: "What builds strong communities?",
                options: ["Passive citizenship", "Active citizenship and participation", "Avoiding community issues", "Focusing only on personal gain"],
                correct_answer: "Active citizenship and participation"
              }
            ]),
            passing_score: 80,
            xp_reward: 75
          };

          // Insert the quiz
          db.query('INSERT IGNORE INTO quizzes (module_id, title, questions, passing_score, xp_reward) VALUES (?, ?, ?, ?, ?)',
            [moduleId, moduleQuiz.title, moduleQuiz.questions, moduleQuiz.passing_score, moduleQuiz.xp_reward],
            (err) => {
              if (err && err.code !== 'ER_DUP_ENTRY') {
                console.error('Error inserting module quiz:', err);
              }
            }
          );
        });
      }
    }
  );

  // Sample quizzes
  const quizzes = [
    {
      title: "📊 Daily Civic Knowledge Quiz",
      questions: JSON.stringify([
        {
          question: "What year was Kenya's current Constitution adopted?",
          options: ["2007", "2010", "2013", "2015"],
          correct_answer: "2010"
        },
        {
          question: "How many counties does Kenya have?",
          options: ["45", "47", "50", "52"],
          correct_answer: "47"
        },
        {
          question: "Which branch of government makes laws in Kenya?",
          options: ["Executive", "Legislative", "Judiciary", "All of the above"],
          correct_answer: "Legislative"
        }
      ]),
      passing_score: 70,
      xp_reward: 50
    },
    {
      title: "📜 Constitution Master",
      questions: JSON.stringify([
        {
          question: "What is the supreme law of Kenya?",
          options: ["The Penal Code", "The Constitution", "Parliamentary Acts", "Presidential Decrees"],
          correct_answer: "The Constitution"
        },
        {
          question: "Which chapter of the Constitution deals with the Bill of Rights?",
          options: ["Chapter 1", "Chapter 4", "Chapter 6", "Chapter 8"],
          correct_answer: "Chapter 4"
        }
      ]),
      passing_score: 80,
      xp_reward: 100
    }
  ];

  // Insert quizzes
  quizzes.forEach(quiz => {
    db.query('INSERT IGNORE INTO quizzes (title, questions, passing_score, xp_reward) VALUES (?, ?, ?, ?)',
      [quiz.title, quiz.questions, quiz.passing_score, quiz.xp_reward],
      (err) => {
        if (err && err.code !== 'ER_DUP_ENTRY') {
          console.error('Error inserting quiz:', err);
        }
      }
    );
  });

  // Sample challenges
  const challenges = [
    {
      title: "Debunk a Rumor",
      description: "Find and fact-check 3 viral claims about Kenyan politics or policies",
      type: "weekly",
      xp_reward: 200,
      badge_reward: "Truth Defender",
      requirements: JSON.stringify(["fact-check", "verification", "reporting"]),
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      title: "Community Survey",
      description: "Conduct a survey on civic engagement in your community",
      type: "monthly",
      xp_reward: 150,
      badge_reward: "Community Researcher",
      requirements: JSON.stringify(["survey", "community", "research"]),
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  ];

  // Insert challenges
  challenges.forEach(challenge => {
    db.query('INSERT IGNORE INTO challenges (title, description, type, xp_reward, badge_reward, requirements, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [challenge.title, challenge.description, challenge.type, challenge.xp_reward, challenge.badge_reward, challenge.requirements, challenge.start_date, challenge.end_date],
      (err) => {
        if (err && err.code !== 'ER_DUP_ENTRY') {
          console.error('Error inserting challenge:', err);
        }
      }
    );
  });

  // Sample badges
  const badges = [
    {
      name: "Truth Defender",
      description: "Master of fact-checking and debunking misinformation",
      icon: "🔍",
      category: "Verification",
      xp_required: 500,
      criteria: JSON.stringify(["complete_verification_challenge", "earn_verification_xp"]),
      rarity: "rare"
    },
    {
      name: "Constitution Expert",
      description: "Deep understanding of Kenya's constitutional framework",
      icon: "📜",
      category: "Knowledge",
      xp_required: 500,
      criteria: JSON.stringify(["complete_constitution_modules", "pass_constitution_quizzes"]),
      rarity: "epic"
    },
    {
      name: "Community Researcher",
      description: "Skilled in community engagement and research",
      icon: "📋",
      category: "Research",
      xp_required: 300,
      criteria: JSON.stringify(["complete_survey_challenge", "community_engagement"]),
      rarity: "common"
    }
  ];

  // Insert badges
  badges.forEach(badge => {
    db.query('INSERT IGNORE INTO badges (name, description, icon, category, xp_required, criteria, rarity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [badge.name, badge.description, badge.icon, badge.category, badge.xp_required, badge.criteria, badge.rarity],
      (err) => {
        if (err && err.code !== 'ER_DUP_ENTRY') {
          console.error('Error inserting badge:', err);
        }
      }
    );
  });

  console.log('✅ Learning system data seeded');
}

// Learning System Additional Routes

// Get all challenges
app.get('/api/learning/challenges', (req, res) => {
  db.query('SELECT * FROM challenges WHERE active = TRUE ORDER BY type, created_at', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const challenges = results.map(challenge => ({
      ...challenge,
      requirements: safeJSONParse(challenge.requirements, [])
    }));

    res.json(challenges);
  });
});

// Get challenge by ID
app.get('/api/learning/challenges/:id', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid challenge ID' });
  }

  db.query('SELECT * FROM challenges WHERE id = ? AND active = TRUE', [id], (err, results) => {
    if (err) {
      console.error('Error fetching challenge:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const challenge = results[0];
    challenge.requirements = safeJSONParse(challenge.requirements, []);

    res.json(challenge);
  });
});

// Submit challenge completion
app.post('/api/learning/challenges/:id/complete', (req, res) => {
  const { id } = req.params;
  const { uuid, evidence } = req.body;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid challenge ID' });
  }

  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
  }

  // Get challenge details
  db.query('SELECT * FROM challenges WHERE id = ? AND active = TRUE', [id], (err, results) => {
    if (err) {
      console.error('Error fetching challenge:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const challenge = results[0];

    // Check if user has already completed this challenge
    db.query('SELECT * FROM user_challenges WHERE uuid = ? AND challenge_id = ?', [uuid, id], (err, results) => {
      if (err) {
        console.error('Error checking challenge completion:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0 && results[0].completed) {
        return res.status(400).json({ error: 'Challenge already completed' });
      }

      // Record challenge completion
      const evidenceData = evidence ? JSON.stringify(evidence) : null;
      
      if (results.length > 0) {
        // Update existing record
        db.query('UPDATE user_challenges SET completed = TRUE, completed_at = NOW(), evidence = ? WHERE uuid = ? AND challenge_id = ?',
          [evidenceData, uuid, id], (err) => {
            if (err) {
              console.error('Error updating challenge completion:', err);
              return res.status(500).json({ error: 'Failed to record completion' });
            }
            awardChallengeRewards(uuid, challenge);
            res.json({
              message: 'Challenge completed successfully!',
              xpEarned: challenge.xp_reward,
              badgeEarned: challenge.badge_reward
            });
          }
        );
      } else {
        // Insert new record
        db.query('INSERT INTO user_challenges (uuid, challenge_id, completed, completed_at, evidence) VALUES (?, ?, TRUE, NOW(), ?)',
          [uuid, id, evidenceData], (err) => {
            if (err) {
              console.error('Error recording challenge completion:', err);
              return res.status(500).json({ error: 'Failed to record completion' });
            }
            awardChallengeRewards(uuid, challenge);
            res.json({
              message: 'Challenge completed successfully!',
              xpEarned: challenge.xp_reward,
              badgeEarned: challenge.badge_reward
            });
          }
        );
      }
    });
  });
});

// Get all badges
app.get('/api/learning/badges', (req, res) => {
  db.query('SELECT * FROM badges ORDER BY rarity, xp_required', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const badges = results.map(badge => ({
      ...badge,
      criteria: safeJSONParse(badge.criteria, [])
    }));

    res.json(badges);
  });
});

// Get user badges
app.get('/api/learning/badges/:uuid', (req, res) => {
  const { uuid } = req.params;

  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
  }

  db.query(`
    SELECT b.*, ub.earned_at
    FROM badges b
    INNER JOIN user_badges ub ON b.id = ub.badge_id
    WHERE ub.uuid = ?
    ORDER BY ub.earned_at DESC
  `, [uuid], (err, results) => {
    if (err) {
      console.error('Error fetching user badges:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const badges = results.map(badge => ({
      ...badge,
      criteria: safeJSONParse(badge.criteria, [])
    }));

    res.json(badges);
  });
});

// Get user learning statistics
app.get('/api/learning/stats/:uuid', (req, res) => {
  const { uuid } = req.params;

  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
  }

  // Get comprehensive learning stats
  db.query(`
    SELECT 
      (SELECT COUNT(*) FROM user_progress WHERE uuid = ? AND module_id IS NOT NULL AND completed = TRUE) as completed_modules,
      (SELECT COUNT(*) FROM user_progress WHERE uuid = ? AND quiz_id IS NOT NULL AND completed = TRUE) as passed_quizzes,
      (SELECT COUNT(*) FROM user_challenges WHERE uuid = ? AND completed = TRUE) as completed_challenges,
      (SELECT COUNT(*) FROM user_badges WHERE uuid = ?) as earned_badges,
      (SELECT SUM(xp_reward) FROM user_progress up 
       JOIN learning_modules lm ON up.module_id = lm.id 
       WHERE up.uuid = ? AND up.completed = TRUE) as module_xp,
      (SELECT SUM(xp_reward) FROM user_progress up 
       JOIN quizzes q ON up.quiz_id = q.id 
       WHERE up.uuid = ? AND up.completed = TRUE) as quiz_xp,
      (SELECT SUM(xp_reward) FROM user_challenges uc 
       JOIN challenges c ON uc.challenge_id = c.id 
       WHERE uc.uuid = ? AND uc.completed = TRUE) as challenge_xp
  `, [uuid, uuid, uuid, uuid, uuid, uuid, uuid], (err, results) => {
    if (err) {
      console.error('Error fetching learning stats:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const stats = results[0];
    const totalXP = (stats.module_xp || 0) + (stats.quiz_xp || 0) + (stats.challenge_xp || 0);

    res.json({
      completed_modules: stats.completed_modules || 0,
      passed_quizzes: stats.passed_quizzes || 0,
      completed_challenges: stats.completed_challenges || 0,
      earned_badges: stats.earned_badges || 0,
      total_xp: totalXP,
      module_xp: stats.module_xp || 0,
      quiz_xp: stats.quiz_xp || 0,
      challenge_xp: stats.challenge_xp || 0
    });
  });
});

// Helper function to award challenge rewards
function awardChallengeRewards(uuid, challenge) {
  // Award XP
  db.query('UPDATE users SET xp = xp + ? WHERE uuid = ?', [challenge.xp_reward, uuid]);
  
  // Record XP transaction
  db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "challenge_completed", ?, ?, "challenge")',
    [uuid, challenge.xp_reward, challenge.id]);
  
  // Update challenge completion count
  db.query('UPDATE challenges SET completion_count = completion_count + 1 WHERE id = ?', [challenge.id]);
  
  // If there's a badge reward, check if user qualifies and award it
  if (challenge.badge_reward) {
    db.query('SELECT id FROM badges WHERE name = ?', [challenge.badge_reward], (err, results) => {
      if (err || results.length === 0) return;
      
      const badgeId = results[0].id;
      
      // Check if user already has this badge
      db.query('SELECT id FROM user_badges WHERE uuid = ? AND badge_id = ?', [uuid, badgeId], (err, results) => {
        if (err || results.length > 0) return;
        
        // Award the badge
        db.query('INSERT INTO user_badges (uuid, badge_id) VALUES (?, ?)', [uuid, badgeId]);
      });
    });
  }
}

// Additional Learning System API Endpoints

// Get all quizzes
app.get('/api/learning/quizzes', (req, res) => {
  db.query('SELECT * FROM quizzes ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching quizzes:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const quizzes = results.map(quiz => ({
      ...quiz,
      questions: safeJSONParse(quiz.questions, [])
    }));

    res.json(quizzes);
  });
});

// Get user progress summary
app.get('/api/learning/user-progress/:userId', (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Get comprehensive user progress
  db.query(`
    SELECT 
      up.*,
      CASE 
        WHEN up.module_id IS NOT NULL THEN 'module'
        WHEN up.quiz_id IS NOT NULL THEN 'quiz'
        ELSE 'unknown'
      END as progress_type,
      COALESCE(lm.title, q.title) as title,
      COALESCE(lm.xp_reward, q.xp_reward) as xp_reward,
      up.completed_at,
      up.progress_percentage
    FROM user_progress up
    LEFT JOIN learning_modules lm ON up.module_id = lm.id
    LEFT JOIN quizzes q ON up.quiz_id = q.id
    WHERE up.uuid = ?
    ORDER BY up.completed_at DESC
  `, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user progress:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const progress = results.map(item => ({
      ...item,
      requirements: safeJSONParse(item.requirements, [])
    }));

    res.json(progress);
  });
});

// Update user progress for a specific module
app.put('/api/learning/progress/:userId/:moduleId', (req, res) => {
  const { userId, moduleId } = req.params;
  const { completed, progress_percentage, completed_at } = req.body;

  if (!userId || !moduleId) {
    return res.status(400).json({ error: 'User ID and Module ID are required' });
  }

  // Check if progress record exists
  db.query('SELECT * FROM user_progress WHERE uuid = ? AND module_id = ?', [userId, moduleId], (err, results) => {
    if (err) {
      console.error('Error checking existing progress:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      // Update existing progress
      const updateQuery = `
        UPDATE user_progress SET 
          completed = ?, 
          progress_percentage = ?, 
          completed_at = ?,
          updated_at = NOW()
        WHERE uuid = ? AND module_id = ?
      `;
      
      db.query(updateQuery, [completed, progress_percentage, completed_at, userId, moduleId], (err) => {
        if (err) {
          console.error('Error updating progress:', err);
          return res.status(500).json({ error: 'Failed to update progress' });
        }

        // If completed, award XP and create transaction
        if (completed) {
          db.query('SELECT xp_reward FROM learning_modules WHERE id = ?', [moduleId], (err, results) => {
            if (err || results.length === 0) {
              console.error('Error fetching module XP reward:', err);
              return;
            }

            const xpReward = results[0].xp_reward || 0;
            
            // Award XP to user
            db.query('UPDATE users SET xp = xp + ? WHERE uuid = ?', [xpReward, userId]);
            
            // Record XP transaction
            db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "module_completion", ?, ?, "module")',
              [userId, xpReward, moduleId]);
          });
        }

        res.json({ message: 'Progress updated successfully' });
      });
    } else {
      // Create new progress record
      const insertQuery = `
        INSERT INTO user_progress (
          uuid, module_id, completed, progress_percentage, completed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `;
      
      db.query(insertQuery, [userId, moduleId, completed, progress_percentage, completed_at], (err) => {
        if (err) {
          console.error('Error creating progress record:', err);
          return res.status(500).json({ error: 'Failed to create progress record' });
        }

        // If completed, award XP and create transaction
        if (completed) {
          db.query('SELECT xp_reward FROM learning_modules WHERE id = ?', [moduleId], (err, results) => {
            if (err || results.length === 0) {
              console.error('Error fetching module XP reward:', err);
              return;
            }

            const xpReward = results[0].xp_reward || 0;
            
            // Award XP to user
            db.query('UPDATE users SET xp = xp + ? WHERE uuid = ?', [xpReward, userId]);
            
            // Record XP transaction
            db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "module_completion", ?, ?, "module")',
              [userId, xpReward, moduleId]);
          });
        }

        res.json({ message: 'Progress record created successfully' });
      });
    }
  });
});

// Submit quiz attempt
app.post('/api/learning/quiz-attempt', (req, res) => {
  const { userId, quizId, answers, score, time_taken } = req.body;

  if (!userId || !quizId || !answers) {
    return res.status(400).json({ error: 'User ID, Quiz ID, and answers are required' });
  }

  // Get quiz details for XP calculation
  db.query('SELECT * FROM quizzes WHERE id = ?', [quizId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = results[0];
    const questions = safeJSONParse(quiz.questions, []);
    const passingScore = quiz.passing_score || 70;
    const passed = score >= passingScore;
    const xpReward = passed ? (quiz.xp_reward || 50) : 0;

    // Check if user has already attempted this quiz
    db.query('SELECT * FROM user_progress WHERE uuid = ? AND quiz_id = ?', [userId, quizId], (err, results) => {
      if (err) {
        console.error('Error checking quiz progress:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        // Update existing attempt
        const updateQuery = `
          UPDATE user_progress SET 
            completed = ?, 
            progress_percentage = ?, 
            completed_at = NOW(),
            updated_at = NOW()
          WHERE uuid = ? AND quiz_id = ?
        `;
        
        db.query(updateQuery, [passed, score, userId, quizId], (err) => {
          if (err) {
            console.error('Error updating quiz progress:', err);
            return res.status(500).json({ error: 'Failed to update quiz progress' });
          }

          // Award XP if passed
          if (passed && xpReward > 0) {
            db.query('UPDATE users SET xp = xp + ? WHERE uuid = ?', [xpReward, userId]);
            
            // Record XP transaction
            db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "quiz_completion", ?, ?, "quiz")',
              [userId, xpReward, quizId]);
          }

          res.json({
            message: 'Quiz attempt recorded successfully',
            passed,
            score,
            xpEarned: xpReward,
            passingScore: passingScore
          });
        });
      } else {
        // Create new quiz attempt record
        const insertQuery = `
          INSERT INTO user_progress (
            uuid, quiz_id, completed, progress_percentage, completed_at, created_at
          ) VALUES (?, ?, ?, ?, NOW(), NOW())
        `;
        
        db.query(insertQuery, [userId, quizId, passed, score], (err) => {
          if (err) {
            console.error('Error creating quiz progress record:', err);
            return res.status(500).json({ error: 'Failed to create quiz progress record' });
          }

          // Award XP if passed
          if (passed && xpReward > 0) {
            db.query('UPDATE users SET xp = xp + ? WHERE uuid = ?', [xpReward, userId]);
            
            // Record XP transaction
            db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "quiz_completion", ?, ?, "quiz")',
              [userId, xpReward, quizId]);
          }

          res.json({
            message: 'Quiz attempt recorded successfully',
            passed,
            score,
            xpEarned: xpReward,
            passingScore: passingScore
          });
        });
      }
    });
  });
});

// API Routes

// User Management
app.post('/api/users/create', (req, res) => {
  const { nickname = 'Anonymous', emoji = '🧑', county = '' } = req.body;
  const userUuid = uuidv4();

  db.query('INSERT INTO users (uuid, nickname, emoji, county) VALUES (?, ?, ?, ?)',
    [userUuid, nickname, emoji, county],
    (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      res.json({
        uuid: userUuid,
        nickname,
        emoji,
        county,
        xp: 0,
        badges: [],
        streak: 0
      });
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

// Get comprehensive user and platform statistics
app.get('/api/users/stats', (req, res) => {
  const stats = {
    platform: {
      totalUsers: 0,
      totalPosts: 0,
      totalModules: 0,
      totalPromises: 0,
      totalYouthGroups: 0,
      avgXP: 0,
      totalXP: 0
    },
    engagement: {
      totalLikes: 0,
      totalComments: 0,
      totalVotes: 0,
      totalCandles: 0,
      activePolls: 0
    },
    content: {
      postsByType: {},
      recentActivity: [],
      topContributors: []
    },
    learning: {
      completedModules: 0,
      passedQuizzes: 0,
      totalQuizAttempts: 0
    }
  };

  // Get basic platform stats
  db.query('SELECT COUNT(*) as count, AVG(xp) as avgXp, SUM(xp) as totalXp FROM users', (err, results) => {
    if (err) {
      console.error('Error getting user stats:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      stats.platform.totalUsers = results[0].count;
      stats.platform.avgXP = Math.round(results[0].avgXp || 0);
      stats.platform.totalXP = results[0].totalXp || 0;
    }

    // Get post statistics
    db.query(`
      SELECT
        COUNT(*) as total,
        SUM(likes) as totalLikes,
        SUM(comments) as totalComments,
        SUM(CASE WHEN verified = TRUE THEN 1 ELSE 0 END) as verifiedPosts,
        SUM(CASE WHEN verified = FALSE THEN 1 ELSE 0 END) as pendingPosts
      FROM posts
    `, (err, results) => {
      if (err) {
        console.error('Error getting post stats:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        stats.platform.totalPosts = results[0].total;
        stats.engagement.totalLikes = results[0].totalLikes || 0;
        stats.engagement.totalComments = results[0].totalComments || 0;
      }

      // Get posts by type
      db.query(`
        SELECT type, COUNT(*) as count
        FROM posts
        WHERE verified = TRUE
        GROUP BY type
      `, (err, results) => {
        if (!err) {
          results.forEach(row => {
            stats.content.postsByType[row.type] = row.count;
          });
        }

        // Get module and learning stats
        db.query('SELECT COUNT(*) as count FROM learning_modules', (err, results) => {
          if (!err && results.length > 0) {
            stats.platform.totalModules = results[0].count;
          }

          // Get learning progress stats
          db.query(`
            SELECT
              COUNT(CASE WHEN completed = TRUE THEN 1 END) as completed,
              COUNT(CASE WHEN completed = FALSE THEN 1 END) as inProgress,
              SUM(attempts) as totalAttempts
            FROM user_progress
          `, (err, results) => {
            if (!err && results.length > 0) {
              stats.learning.completedModules = results[0].completed || 0;
              stats.learning.totalQuizAttempts = results[0].totalAttempts || 0;
            }

            // Get promise stats
            db.query('SELECT COUNT(*) as count FROM promises', (err, results) => {
              if (!err && results.length > 0) {
                stats.platform.totalPromises = results[0].count;
              }

              // Get youth group stats
              db.query('SELECT COUNT(*) as count FROM youth_groups WHERE verified = TRUE', (err, results) => {
                if (!err && results.length > 0) {
                  stats.platform.totalYouthGroups = results[0].count;
                }

                // Get poll stats
                db.query(`
                  SELECT
                    COUNT(CASE WHEN active = TRUE THEN 1 END) as active,
                    SUM(total_votes) as totalVotes
                  FROM polls
                `, (err, results) => {
                  if (!err && results.length > 0) {
                    stats.engagement.activePolls = results[0].active || 0;
                    stats.engagement.totalVotes = results[0].totalVotes || 0;
                  }

                  // Get memory archive stats
                  db.query('SELECT SUM(candles_lit) as totalCandles FROM memory_archive', (err, results) => {
                    if (!err && results.length > 0) {
                      stats.engagement.totalCandles = results[0].totalCandles || 0;
                    }

                    // Get top contributors (users with highest XP)
                    db.query(`
                      SELECT uuid, nickname, emoji, xp, county
                      FROM users
                      ORDER BY xp DESC
                      LIMIT 10
                    `, (err, results) => {
                      if (!err) {
                        stats.content.topContributors = results.map(user => ({
                          uuid: user.uuid,
                          nickname: user.nickname,
                          emoji: user.emoji,
                          xp: user.xp,
                          county: user.county
                        }));
                      }

                      // Get recent activity (last 10 verified posts)
                      db.query(`
                        SELECT p.id, p.title, p.type, p.created_at, u.nickname, u.emoji, u.county
                        FROM posts p
                        JOIN users u ON p.uuid = u.uuid
                        WHERE p.verified = TRUE
                        ORDER BY p.created_at DESC
                        LIMIT 10
                      `, (err, results) => {
                        if (!err) {
                          stats.content.recentActivity = results.map(post => ({
                            id: post.id,
                            title: post.title,
                            type: post.type,
                            created_at: post.created_at,
                            author: {
                              nickname: post.nickname,
                              emoji: post.emoji,
                              county: post.county
                            }
                          }));
                        }

                        // Return comprehensive stats
                        res.json({
                          success: true,
                          timestamp: new Date().toISOString(),
                          stats
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
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

// Like a post
app.post('/api/posts/:id/like', (req, res) => {
  const { id } = req.params;
  const { uuid } = req.body;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
  }

  // Check if post exists and is verified
  db.query('SELECT id, uuid FROM posts WHERE id = ? AND verified = TRUE', [id], (err, results) => {
    if (err) {
      console.error('Error checking post:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Post not found or not verified' });
    }

    const post = results[0];

    // Check if user is trying to like their own post
    if (post.uuid === uuid) {
      return res.status(400).json({ error: 'Cannot like your own post' });
    }

    // Check if user already liked the post
    db.query('SELECT id FROM post_likes WHERE post_id = ? AND uuid = ?', [id, uuid], (err, existing) => {
      if (err) {
        console.error('Error checking post like:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (existing.length > 0) {
        return res.status(400).json({ error: 'You have already liked this post' });
      }

      // Update like count
      db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [id], (err) => {
        if (err) {
          console.error('Error updating likes:', err);
          return res.status(500).json({ error: 'Failed to update likes' });
        }

        // Award XP to post creator
        db.query('UPDATE users SET xp = xp + 2 WHERE uuid = ?', [post.uuid]);
        db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "post_liked", 2, ?, "post")',
          [post.uuid, id]
        );

        // Record the like
        db.query('INSERT INTO post_likes (post_id, uuid) VALUES (?, ?)', [id, uuid], (err) => {
          if (err) {
            console.error('Error recording post like:', err);
            return res.status(500).json({ error: 'Failed to record like' });
          }
          res.json({ message: 'Post liked successfully', likes: 'incremented' });
        });
      });
    });
  });
});

// Unlike a post
app.delete('/api/posts/:id/like', (req, res) => {
  const { id } = req.params;
  const { uuid } = req.body;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }
  
  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
  }
  
  // Check if like exists
  db.query('SELECT id FROM post_likes WHERE post_id = ? AND uuid = ?', [id, uuid], (err, results) => {
    if (err) {
      console.error('Error checking post like:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(400).json({ error: 'You have not liked this post' });
    }
    
    // Remove the like
    db.query('DELETE FROM post_likes WHERE post_id = ? AND uuid = ?', [id, uuid], (err) => {
      if (err) {
        console.error('Error removing post like:', err);
        return res.status(500).json({ error: 'Failed to remove like' });
      }
      
      // Update like count on post
      db.query('UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = ?', [id], (err) => {
        if (err) {
          console.error('Error updating likes:', err);
          return res.status(500).json({ error: 'Failed to update likes' });
        }
        
        res.json({ 
          message: 'Post unliked successfully', 
          likes: 'decremented'
        });
      });
    });
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
  
  db.query('SELECT id FROM post_likes WHERE post_id = ? AND uuid = ?', [id, uuid], (err, results) => {
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

// Delete a comment
app.delete('/api/comments/:commentId', (req, res) => {
  const { commentId } = req.params;
  const { uuid } = req.body;

  if (!commentId || isNaN(parseInt(commentId))) {
    return res.status(400).json({ error: 'Invalid comment ID' });
  }

  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
  }

  // Check if comment exists and user owns it
  db.query('SELECT id, post_id, uuid FROM comments WHERE id = ?', [commentId], (err, results) => {
    if (err) {
      console.error('Error checking comment:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = results[0];
    if (comment.uuid !== uuid) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    // Delete the comment
    db.query('DELETE FROM comments WHERE id = ?', [commentId], (err) => {
      if (err) {
        console.error('Error deleting comment:', err);
        return res.status(500).json({ error: 'Failed to delete comment' });
      }

      // Update comment count on post
      db.query('UPDATE posts SET comments = GREATEST(comments - 1, 0) WHERE id = ?', [comment.post_id]);

      res.json({ message: 'Comment deleted successfully' });
    });
  });
});

// Like a comment
app.post('/api/comments/:commentId/like', (req, res) => {
  const { commentId } = req.params;
  const { uuid } = req.body;

  if (!commentId || isNaN(parseInt(commentId))) {
    return res.status(400).json({ error: 'Invalid comment ID' });
  }

  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
  }

  // Check if comment exists
  db.query('SELECT id, uuid FROM comments WHERE id = ?', [commentId], (err, results) => {
    if (err) {
      console.error('Error checking comment:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = results[0];
    if (comment.uuid === uuid) {
      return res.status(400).json({ error: 'You cannot like your own comment' });
    }

    // Check if user already liked this comment
    db.query('SELECT id FROM comment_likes WHERE comment_id = ? AND uuid = ?', [commentId, uuid], (err, existing) => {
      if (err) {
        console.error('Error checking comment like:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (existing.length > 0) {
        return res.status(400).json({ error: 'You have already liked this comment' });
      }

      // Add like to comment_likes table
      db.query('INSERT INTO comment_likes (comment_id, uuid) VALUES (?, ?)', [commentId, uuid], (err) => {
        if (err) {
          console.error('Error recording comment like:', err);
          return res.status(500).json({ error: 'Failed to record like' });
        }

        // Award XP to comment creator
        db.query('UPDATE users SET xp = xp + 1 WHERE uuid = ?', [comment.uuid]);
        db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "comment_liked", 1, ?, "comment")',
          [comment.uuid, commentId]
        );

        res.json({ message: 'Comment liked successfully' });
      });
    });
  });
});

// Unlike a comment
app.delete('/api/comments/:commentId/like', (req, res) => {
  const { commentId } = req.params;
  const { uuid } = req.body;

  if (!commentId || isNaN(parseInt(commentId))) {
    return res.status(400).json({ error: 'Invalid comment ID' });
  }

  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
  }

  // Check if like exists
  db.query('SELECT id FROM comment_likes WHERE comment_id = ? AND uuid = ?', [commentId, uuid], (err, results) => {
    if (err) {
      console.error('Error checking comment like:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'You have not liked this comment' });
    }

    // Remove the like
    db.query('DELETE FROM comment_likes WHERE comment_id = ? AND uuid = ?', [commentId, uuid], (err) => {
      if (err) {
        console.error('Error removing comment like:', err);
        return res.status(500).json({ error: 'Failed to remove like' });
      }

      res.json({ message: 'Comment unliked successfully' });
    });
  });
});

// Check if user has liked a comment
app.get('/api/comments/:commentId/liked/:uuid', (req, res) => {
  const { commentId, uuid } = req.params;

  if (!commentId || isNaN(parseInt(commentId))) {
    return res.status(400).json({ error: 'Invalid comment ID' });
  }

  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
  }

  db.query('SELECT id FROM comment_likes WHERE comment_id = ? AND uuid = ?', [commentId, uuid], (err, results) => {
    if (err) {
      console.error('Error checking comment like status:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      comment_id: commentId,
      user_uuid: uuid,
      has_liked: results.length > 0
    });
  });
});



// Submit quiz answers
app.post('/api/learning/quiz/:id/submit', (req, res) => {
  const { id } = req.params;
  const { uuid, answers } = req.body;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid quiz ID' });
  }

  if (!uuid || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'User UUID and answers array are required' });
  }

  // Get quiz details
  db.query('SELECT * FROM quizzes WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching quiz:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = results[0];
    const questions = safeJSONParse(quiz.questions, []);

    // Calculate score
    let correctAnswers = 0;
    let totalQuestions = questions.length;

    answers.forEach((answer, index) => {
      if (index < questions.length && questions[index].correct_answer === answer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passing_score;

    // Record progress
    db.query('INSERT INTO user_progress (uuid, quiz_id, completed, score, attempts) VALUES (?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE attempts = attempts + 1, score = GREATEST(score, ?), completed = ?',
      [uuid, id, passed, score, score, passed], (err) => {
        if (err) {
          console.error('Error recording quiz progress:', err);
          return res.status(500).json({ error: 'Failed to record progress' });
        }

        // Award XP if passed
        if (passed) {
          db.query('UPDATE users SET xp = xp + ? WHERE uuid = ?', [quiz.xp_reward, uuid]);
          db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "quiz_passed", ?, ?, "quiz")',
            [quiz.xp_reward, uuid, id]
          );
        }

        res.json({
          score,
          passed,
          correctAnswers,
          totalQuestions,
          xpEarned: passed ? quiz.xp_reward : 0,
          message: passed ? 'Quiz passed! XP awarded.' : 'Quiz failed. Try again!'
        });
      }
    );
  });
});

// Civic Memory Archive API
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

// Add new hero (editorial)
app.post('/api/memory', (req, res) => {
  const { name, achievement, date_of_death, age, county, category, tags, image_url } = req.body;

  if (!name || !achievement) {
    return res.status(400).json({ error: 'Name and achievement are required' });
  }

  const insertQuery = `
    INSERT INTO memory_archive (
      name, achievement, date_of_death, age, county,
      category, tags, image_url, verified, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
  `;

  const insertData = [
    name, achievement, date_of_death, age, county,
    category, tags || JSON.stringify([category]), image_url
  ];

  db.query(insertQuery, insertData, (err, result) => {
    if (err) {
      console.error('Error adding hero:', err);
      return res.status(500).json({ error: 'Failed to add hero' });
    }

    res.json({
      message: 'Hero added successfully',
      id: result.insertId
    });
  });
});

// Update hero (editorial)
app.put('/api/memory/:id', (req, res) => {
  const { id } = req.params;
  const { name, achievement, date_of_death, age, county, category, tags, image_url } = req.body;

  if (!name || !achievement) {
    return res.status(400).json({ error: 'Name and achievement are required' });
  }

  const updateQuery = `
    UPDATE memory_archive SET 
      name = ?, achievement = ?, date_of_death = ?, age = ?, 
      county = ?, category = ?, tags = ?, image_url = ?, updated_at = NOW()
    WHERE id = ?
  `;

  const updateData = [
    name, achievement, date_of_death, age, county,
    category, tags || JSON.stringify([category]), image_url, id
  ];

  db.query(updateQuery, updateData, (err, result) => {
    if (err) {
      console.error('Error updating hero:', err);
      return res.status(500).json({ error: 'Failed to update hero' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hero not found' });
    }

    res.json({
      message: 'Hero updated successfully'
    });
  });
});

// Delete hero (editorial)
app.delete('/api/memory/:id', (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM memory_archive WHERE id = ?';

  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error('Error deleting hero:', err);
      return res.status(500).json({ error: 'Failed to delete hero' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hero not found' });
    }

    res.json({
      message: 'Hero deleted successfully'
    });
  });
});

app.post('/api/memory/:id/candle', (req, res) => {
  const { id } = req.params;
  const { uuid } = req.body;

  if (!uuid) {
    return res.status(400).json({ error: 'UUID is required' });
  }

  // Check if user has already lit a candle for this memory today
  const today = new Date().toISOString().split('T')[0];
  db.query('SELECT * FROM xp_transactions WHERE uuid = ? AND reference_id = ? AND reference_type = "memory" AND action = "light_candle" AND DATE(created_at) = ?',
    [uuid, id, today],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'You have already lit a candle for this hero today' });
      }

      // Update candle count
      db.query('UPDATE memory_archive SET candles_lit = candles_lit + 1 WHERE id = ?', [id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to light candle' });
        }

        // Record XP transaction
        db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, ?, ?, ?, ?)',
          [uuid, 'light_candle', 5, id, 'memory'],
          (err) => {
            if (err) {
              console.error('Error recording XP transaction:', err);
            }
          }
        );

        // Award XP for lighting candle
        db.query('UPDATE users SET xp = xp + 5, last_active = CURRENT_DATE WHERE uuid = ?', [uuid], (err) => {
          if (err) {
            console.error('Error awarding XP:', err);
          }
        });

        res.json({ message: 'Candle lit successfully', xp_awarded: 5 });
      });
    }
  );
});

// Protest Archive API
app.get('/api/protests', (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  db.query('SELECT * FROM protests WHERE verified = TRUE ORDER BY date DESC, turnout_estimate DESC LIMIT ? OFFSET ?',
    [parseInt(limit), parseInt(offset)],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const protests = results.map(protest => ({
        ...protest,
        purpose_tags: safeJSONParse(protest.purpose_tags, [])
      }));

      res.json(protests);
    }
  );
});

// Add new protest (editorial)
app.post('/api/protests', (req, res) => {
  const { title, description, date, location, county, category, tags, image_url } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const insertQuery = `
    INSERT INTO protests (
      title, description, date, location, county,
      category, tags, image_url, verified, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
  `;

  const insertData = [
    title, description, date, location, county,
    category, tags || JSON.stringify([category]), image_url
  ];

  db.query(insertQuery, insertData, (err, result) => {
    if (err) {
      console.error('Error adding protest:', err);
      return res.status(500).json({ error: 'Failed to add protest' });
    }

    res.json({
      message: 'Protest added successfully',
      id: result.insertId
    });
  });
});

// Update protest (editorial)
app.put('/api/protests/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, date, location, county, category, tags, image_url } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const updateQuery = `
    UPDATE protests SET 
      title = ?, description = ?, date = ?, location = ?, 
      county = ?, category = ?, tags = ?, image_url = ?, updated_at = NOW()
    WHERE id = ?
  `;

  const updateData = [
    title, description, date, location, county,
    category, tags || JSON.stringify([category]), image_url, id
  ];

  db.query(updateQuery, updateData, (err, result) => {
    if (err) {
      console.error('Error updating protest:', err);
      return res.status(500).json({ error: 'Failed to update protest' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Protest not found' });
    }

    res.json({
      message: 'Protest updated successfully'
    });
  });
});

// Delete protest (editorial)
app.delete('/api/protests/:id', (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM protests WHERE id = ?';

  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error('Error deleting protest:', err);
      return res.status(500).json({ error: 'Failed to delete protest' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Protest not found' });
    }

    res.json({
      message: 'Protest deleted successfully'
    });
  });
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

    // Update promise evidence (assuming evidence is stored as JSON)
    db.query('SELECT evidence FROM promises WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error fetching promise evidence:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const currentEvidence = safeJSONParse(results[0].evidence, []);
      currentEvidence.push(evidenceData);

      db.query('UPDATE promises SET evidence = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [JSON.stringify(currentEvidence), id], (err) => {
          if (err) {
            console.error('Error updating promise evidence:', err);
            return res.status(500).json({ error: 'Failed to add evidence' });
          }

          // Award XP for providing evidence
          db.query('UPDATE users SET xp = xp + 10 WHERE uuid = ?', [uuid]);
          db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "provide_evidence", 10, ?, "promise")',
            [uuid, id]
          );

          res.json({
            message: 'Evidence added successfully',
            evidence: evidenceData
          });
        }
      );
    });
  });
});

// Track a promise (increment tracking count)
app.post('/api/promises/:id/track', (req, res) => {
  const { id } = req.params;
  const { uuid } = req.body;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid promise ID' });
  }

  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
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

    // Increment tracking count
    db.query('UPDATE promises SET tracking_count = tracking_count + 1 WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Error updating tracking count:', err);
        return res.status(500).json({ error: 'Failed to update tracking count' });
      }

      // Award XP for tracking
      db.query('UPDATE users SET xp = xp + 3 WHERE uuid = ?', [uuid]);
      db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "track_promise", 3, ?, "promise")',
        [uuid, id]
      );

      res.json({ message: 'Promise tracking updated successfully' });
    });
  });
});

// Polls API
app.get('/api/polls/active', (req, res) => {
  db.query('SELECT * FROM polls WHERE active = TRUE ORDER BY created_at DESC LIMIT 1', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No active polls' });
    }

    const poll = results[0];
    poll.emoji_options = safeJSONParse(poll.emoji_options, []);
    poll.results = safeJSONParse(poll.results, {});

    res.json(poll);
  });
});

app.post('/api/polls/:id/vote', (req, res) => {
  const { id } = req.params;
  const { uuid, vote_option, county } = req.body;

  // Check if user already voted
  db.query('SELECT * FROM poll_votes WHERE poll_id = ? AND uuid = ?', [id, uuid], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already voted in this poll' });
    }

    // Record vote
    db.query('INSERT INTO poll_votes (poll_id, uuid, vote_option, county) VALUES (?, ?, ?, ?)',
      [id, uuid, vote_option, county],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to record vote' });
        }

        // Update poll totals
        db.query('UPDATE polls SET total_votes = total_votes + 1 WHERE id = ?', [id]);

        // Award XP
        db.query('UPDATE users SET xp = xp + 5 WHERE uuid = ?', [uuid]);
        db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "vote_poll", 5, ?, "poll")',
          [uuid, id]
        );

        res.json({ message: 'Vote recorded successfully' });
      }
    );
  });
});

// Get poll results
app.get('/api/polls/:id/results', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid poll ID' });
  }

  // Get poll details
  db.query('SELECT * FROM polls WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching poll:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const poll = results[0];
    poll.emoji_options = safeJSONParse(poll.emoji_options, []);

    // Get vote counts by option
    db.query('SELECT vote_option, COUNT(*) as count FROM poll_votes WHERE poll_id = ? GROUP BY vote_option',
      [id], (err, voteResults) => {
        if (err) {
          console.error('Error fetching poll votes:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Calculate results
        const totalVotes = poll.total_votes || 0;
        const results = {};

        poll.emoji_options.forEach(option => {
          const voteCount = voteResults.find(v => v.vote_option === option.emoji)?.count || 0;
          results[option.emoji] = {
            label: option.label,
            count: voteCount,
            percentage: totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
          };
        });

        res.json({
          poll_id: id,
          question: poll.question,
          total_votes: totalVotes,
          results,
          active: poll.active,
          expires_at: poll.expires_at
        });
      }
    );
  });
});

// Youth Groups API
app.get('/api/youth-groups', (req, res) => {
  const { county, focus_area, limit = 20, offset = 0 } = req.query;

  let query = 'SELECT * FROM youth_groups WHERE verified = TRUE';
  let params = [];

  if (county) {
    query += ' AND county = ?';
    params.push(county);
  }

  if (focus_area) {
    query += ' AND focus_area = ?';
    params.push(focus_area);
  }

  query += ' ORDER BY member_count DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const groups = results.map(group => ({
      ...group,
      contact_info: safeJSONParse(group.contact_info, {}),
      social_media: safeJSONParse(group.social_media, {})
    }));

      res.json(groups);
});

// Create new youth group
app.post('/api/youth-groups', (req, res) => {
  const { name, description, county, focus_area, contact_info, website, social_media } = req.body;

  if (!name || !description || !county) {
    return res.status(400).json({ error: 'Name, description, and county are required' });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({ error: 'Group name too long. Maximum 100 characters allowed.' });
  }

  if (description.trim().length > 1000) {
    return res.status(400).json({ error: 'Description too long. Maximum 1000 characters allowed.' });
  }

  const groupData = {
    name: name.trim(),
    description: description.trim(),
    county: county.trim(),
    focus_area: focus_area || null,
    contact_info: contact_info ? JSON.stringify(contact_info) : '{}',
    website: website || null,
    social_media: social_media ? JSON.stringify(social_media) : '{}',
    verified: false, // New groups need verification
    member_count: 0
  };

  db.query('INSERT INTO youth_groups SET ?', [groupData], (err, result) => {
    if (err) {
      console.error('Error creating youth group:', err);
      return res.status(500).json({ error: 'Failed to create youth group' });
    }

    res.json({
      id: result.insertId,
      message: 'Youth group created successfully and submitted for verification'
    });
  });
});

// Get single youth group by ID
app.get('/api/youth-groups/:id', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid youth group ID' });
  }

  db.query('SELECT * FROM youth_groups WHERE id = ? AND verified = TRUE', [id], (err, results) => {
    if (err) {
      console.error('Error fetching youth group:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Youth group not found or not verified' });
    }

    const group = results[0];
    group.contact_info = safeJSONParse(group.contact_info, {});
    group.social_media = safeJSONParse(group.social_media, {});

    res.json(group);
  });
});

// Admin Routes (safe JSON parsing implementation)
app.get('/api/admin/pending-posts', (req, res) => {
  db.query('SELECT p.*, u.nickname, u.emoji FROM posts p JOIN users u ON p.uuid = u.uuid WHERE p.verified = FALSE ORDER BY p.created_at DESC',
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const posts = results.map(post => ({
        ...post,
        tags: safeJSONParse(post.tags, [])
      }));

      res.json(posts);
    }
  );
});

app.post('/api/admin/posts/:id/verify', (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  const verified = action === 'approve';

  db.query('UPDATE posts SET verified = ? WHERE id = ?', [verified, id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update post' });
    }

    // If approved, award XP to user
    if (verified) {
      db.query('SELECT uuid, type FROM posts WHERE id = ?', [id], (err, results) => {
        if (!err && results.length > 0) {
          const { uuid, type } = results[0];
          let xpReward = 20;

          // Different XP for different content types
          switch (type) {
            case 'poem': xpReward = 25; break;
            case 'audio': xpReward = 30; break;
            case 'story': xpReward = 35; break;
            default: xpReward = 20;
          }

          db.query('UPDATE users SET xp = xp + ? WHERE uuid = ?', [xpReward, uuid]);
          db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "post_approved", ?, ?, "post")',
            [uuid, xpReward, id]
          );
        }
      });
    }

    res.json({ message: `Post ${action}d successfully` });
  });
});

// Admin dashboard stats
app.get('/api/admin/dashboard', (req, res) => {
  const stats = {
    totalUsers: 0,
    totalPosts: 0,
    pendingPosts: 0,
    totalModules: 0,
    totalPromises: 0,
    totalYouthGroups: 0,
    avgXP: 0,
    recentActivity: []
  };

  // Get user stats
  db.query('SELECT COUNT(*) as count, AVG(xp) as avgXp FROM users', (err, results) => {
    if (err) {
      console.error('Error getting user stats:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      stats.totalUsers = results[0].count;
      stats.avgXP = Math.round(results[0].avgXp || 0);
    }

    // Get post stats
    db.query('SELECT COUNT(*) as total, SUM(CASE WHEN verified = FALSE THEN 1 ELSE 0 END) as pending FROM posts', (err, results) => {
      if (err) {
        console.error('Error getting post stats:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        stats.totalPosts = results[0].total;
        stats.pendingPosts = results[0].pending;
      }

      // Get module stats
      db.query('SELECT COUNT(*) as count FROM learning_modules', (err, results) => {
        if (err) {
          console.error('Error getting module stats:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
          stats.totalModules = results[0].count;
        }

        // Get promise stats
        db.query('SELECT COUNT(*) as count FROM promises', (err, results) => {
          if (err) {
            console.error('Error getting promise stats:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          if (results.length > 0) {
            stats.totalPromises = results[0].count;
          }

          // Get youth group stats
          db.query('SELECT COUNT(*) as count FROM youth_groups WHERE verified = TRUE', (err, results) => {
            if (err) {
              console.error('Error getting youth group stats:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            if (results.length > 0) {
              stats.totalYouthGroups = results[0].count;
            }

            // Get recent activity (last 10 posts)
            db.query(`
              SELECT p.id, p.title, p.type, p.created_at, u.nickname, u.emoji
              FROM posts p
              JOIN users u ON p.uuid = u.uuid
              WHERE p.verified = TRUE
              ORDER BY p.created_at DESC
              LIMIT 10
            `, (err, results) => {
              if (err) {
                console.error('Error getting recent activity:', err);
                // Don't fail the entire request for this
                stats.recentActivity = [];
              } else {
                stats.recentActivity = results;
              }

              res.json(stats);
            });
          });
        });
      });
    });
  });
});

// File upload endpoint
app.post('/api/upload', upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.json({
    message: 'File uploaded successfully',
    fileUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// Expressions API (for Express.js page)
app.get('/api/expressions', (req, res) => {
  const { type, county, limit = 20, offset = 0 } = req.query;

  let query = 'SELECT * FROM posts WHERE verified = TRUE AND type IN ("poem", "story", "audio")';
  let params = [];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  if (county) {
    query += ' AND county = ?';
    params.push(county);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching expressions:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const expressions = results.map(expression => ({
      ...expression,
      tags: safeJSONParse(expression.tags, [])
    }));

    res.json(expressions);
  });
});

app.post('/api/expressions/:id/like', (req, res) => {
  const { id } = req.params;
  const { uuid } = req.body;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid expression ID' });
  }

  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
  }

  // Check if expression exists and is verified
  db.query('SELECT id, uuid, type FROM posts WHERE id = ? AND verified = TRUE AND type IN ("poem", "story", "audio")', [id], (err, results) => {
    if (err) {
      console.error('Error checking expression:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Expression not found or not verified' });
    }

    const expression = results[0];

    // Check if user is trying to like their own expression
    if (expression.uuid === uuid) {
      return res.status(400).json({ error: 'Cannot like your own expression' });
    }

    // Update like count
    db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Error updating likes:', err);
        return res.status(500).json({ error: 'Failed to update likes' });
      }

      // Award XP to expression creator
      db.query('UPDATE users SET xp = xp + 3 WHERE uuid = ?', [expression.uuid]);
      db.query('INSERT INTO xp_transactions (uuid, action, xp_earned, reference_id, reference_type) VALUES (?, "expression_liked", 3, ?, "post")',
        [expression.uuid, id]
      );

      res.json({ message: 'Expression liked successfully', likes: 'incremented' });
    });
  });
});

// Search functionality
app.get('/api/search', (req, res) => {
  const { q: query, type = 'all', limit = 20, offset = 0 } = req.query;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const searchTerm = `%${query.trim()}%`;
  const results = {
    posts: [],
    modules: [],
    promises: [],
    youthGroups: [],
    memoryArchive: [],
    protests: []
  };

  // Search posts
  if (type === 'all' || type === 'posts') {
    db.query(`
      SELECT p.*, u.nickname, u.emoji
      FROM posts p
      JOIN users u ON p.uuid = u.uuid
      WHERE p.verified = TRUE AND (p.title LIKE ? OR p.content LIKE ?)
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [searchTerm, searchTerm, parseInt(limit), parseInt(offset)], (err, postResults) => {
      if (!err) {
        results.posts = postResults.map(post => ({
          ...post,
          tags: safeJSONParse(post.tags, [])
        }));
      }

      // Search learning modules
      if (type === 'all' || type === 'modules') {
        db.query(`
          SELECT * FROM learning_modules
          WHERE title LIKE ? OR description LIKE ? OR content LIKE ?
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?
        `, [searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)], (err, moduleResults) => {
          if (!err) {
            results.modules = moduleResults.map(module => ({
              ...module,
              tags: safeJSONParse(module.tags, [])
            }));
          }

          // Search promises
          if (type === 'all' || type === 'promises') {
            db.query(`
              SELECT * FROM promises
              WHERE title LIKE ? OR description LIKE ?
              ORDER BY created_at DESC
              LIMIT ? OFFSET ?
            `, [searchTerm, searchTerm, parseInt(limit), parseInt(offset)], (err, promiseResults) => {
              if (!err) {
                results.promises = promiseResults.map(promise => ({
                  ...promise,
                  tags: safeJSONParse(promise.tags, [])
                }));
              }

              // Search memory archive
              if (type === 'all' || type === 'memory') {
                db.query(`
                  SELECT * FROM memory_archive
                  WHERE verified = TRUE AND (name LIKE ? OR cause LIKE ? OR context LIKE ? OR county LIKE ?)
                  ORDER BY candles_lit DESC
                  LIMIT ? OFFSET ?
                `, [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)], (err, memoryResults) => {
                  if (!err) {
                    results.memoryArchive = memoryResults.map(memory => ({
                      ...memory,
                      tags: safeJSONParse(memory.tags, [])
                    }));
                  }

                  // Search protests
                  if (type === 'all' || type === 'protests') {
                    db.query(`
                      SELECT * FROM protests
                      WHERE verified = TRUE AND (title LIKE ? OR description LIKE ? OR location LIKE ? OR county LIKE ?)
                      ORDER BY date DESC
                      LIMIT ? OFFSET ?
                    `, [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)], (err, protestResults) => {
                      if (!err) {
                        results.protests = protestResults.map(protest => ({
                          ...protest,
                          purpose_tags: safeJSONParse(protest.purpose_tags, [])
                        }));
                      }

                      // Search youth groups
                      if (type === 'all' || type === 'youth-groups') {
                        db.query(`
                          SELECT * FROM youth_groups
                          WHERE verified = TRUE AND (name LIKE ? OR description LIKE ? OR focus_area LIKE ?)
                          ORDER BY created_at DESC
                          LIMIT ? OFFSET ?
                        `, [searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)], (err, groupResults) => {
                          if (!err) {
                            results.youthGroups = groupResults.map(group => ({
                              ...group,
                              contact_info: safeJSONParse(group.contact_info, {}),
                              social_media: safeJSONParse(group.social_media, {})
                            }));
                          }

                          res.json({
                            query: query.trim(),
                            type,
                            totalResults: results.posts.length + results.modules.length + results.promises.length + results.youthGroups.length + results.memoryArchive.length + results.protests.length,
                            results
                          });
                        });
                      } else {
                        res.json({
                          query: query.trim(),
                          type,
                          totalResults: results.posts.length + results.modules.length + results.promises.length + results.memoryArchive.length + results.protests.length,
                          results
                        });
                      }
                    });
                  } else {
                    res.json({
                      query: query.trim(),
                      type,
                      totalResults: results.posts.length + results.modules.length + results.promises.length + results.memoryArchive.length,
                      results
                    });
                  }
                });
              } else {
                res.json({
                  query: query.trim(),
                  type,
                  totalResults: results.posts.length + results.modules.length + results.promises.length,
                  results
                });
              }
            });
          } else {
            res.json({
              query: query.trim(),
              type,
              totalResults: results.posts.length + results.modules.length,
              results
            });
          }
        });
      } else {
        res.json({
          query: query.trim(),
          type,
          totalResults: results.posts.length,
          results
        });
      }
    });
  } else {
    // Handle specific type searches
    res.json({
      query: query.trim(),
      type,
      totalResults: 0,
      results
    });
  }
});

// Saved Items Management
app.post('/api/saved-items', (req, res) => {
  const { uuid, item_id, item_type, title, description } = req.body;

  if (!uuid || !item_id || !item_type || !title) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if already saved
  db.query('SELECT * FROM saved_items WHERE uuid = ? AND item_id = ? AND item_type = ?',
    [uuid, item_id, item_type],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'Item already saved' });
      }

      // Save the item
      db.query('INSERT INTO saved_items (uuid, item_id, item_type, title, description) VALUES (?, ?, ?, ?, ?)',
        [uuid, item_id, item_type, title, description || ''],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to save item' });
          }

          res.json({ message: 'Item saved successfully' });
        }
      );
    }
  );
});

app.get('/api/saved-items/:uuid', (req, res) => {
  const { uuid } = req.params;

  db.query('SELECT * FROM saved_items WHERE uuid = ? ORDER BY created_at DESC', [uuid], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});

app.delete('/api/saved-items/:itemId', (req, res) => {
  const { itemId } = req.params;
  const { uuid, item_type } = req.body;

  if (!uuid || !item_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.query('DELETE FROM saved_items WHERE uuid = ? AND item_id = ? AND item_type = ?',
    [uuid, itemId, item_type],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Saved item not found' });
      }

      res.json({ message: 'Item removed successfully' });
    }
  );
});

// Submit Request Management
app.post('/api/submit-request', (req, res) => {
  const { 
    uuid, 
    type, 
    name, 
    title, 
    description, 
    category, 
    county, 
    year, 
    source, 
    contact,
    image_url,
    submitted_at,
    user_email,
    user_nickname
  } = req.body;

  if (!uuid || !type || !name || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Insert the submission request
  const query = `
    INSERT INTO submit_requests (
      uuid, type, name, title, description, category, county, year, source, contact, image_url, submitted_at, status, user_email, user_nickname
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `;

  // Check if database is connected
  if (!db.threadId) {
    console.error('Database not connected');
    return res.status(500).json({ error: 'Database connection lost. Please try again.' });
  }

  db.query(query, [
    uuid, type, name, title || name, description, category || '', county || '', 
    year || null, source || '', contact || '', image_url || '', submitted_at, user_email || '', user_nickname || ''
  ], (err, result) => {
    if (err) {
      console.error('Error submitting request:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        return res.status(500).json({ error: 'Database connection lost. Please try again.' });
      }
      return res.status(500).json({ error: 'Failed to submit request: ' + err.message });
    }

    res.json({ 
      message: 'Request submitted successfully',
      requestId: result.insertId 
    });
  });
});

// Submission notification endpoint (logs to console for now)
app.post('/api/send-submission-email', (req, res) => {
  const { to, subject, content } = req.body;

  // Log submission details to console (for editorial team to see)
  console.log('📧 NEW SUBMISSION RECEIVED:');
  console.log('=====================================');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Content:', content);
  console.log('=====================================');
  console.log('💡 Check admin panel for full details');
  console.log('');

  // In the future, you can add:
  // - Database notifications table
  // - Webhook to Slack/Discord
  // - SMS notifications
  // - Your own email server

  res.json({ 
    message: 'Submission logged successfully. Editorial team will review.',
    note: 'Check server console and admin panel for details'
  });
});

// Get all submission requests for admin panel
app.get('/api/submit-requests', (req, res) => {
  const query = `
    SELECT * FROM submit_requests 
    ORDER BY submitted_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching submissions:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

// Update submission status (approve/reject)
app.put('/api/submit-requests/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, review_notes } = req.body;
  
  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  // First, get the submission details
  const getSubmissionQuery = 'SELECT * FROM submit_requests WHERE id = ?';
  
  db.query(getSubmissionQuery, [id], (err, submissionResult) => {
    if (err) {
      console.error('Error fetching submission:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (submissionResult.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const submission = submissionResult[0];
    
    // Update the submission status
    const updateQuery = `
      UPDATE submit_requests 
      SET status = ?, review_notes = ?, reviewed_at = NOW() 
      WHERE id = ?
    `;
    
    db.query(updateQuery, [status, review_notes || '', id], (err, result) => {
      if (err) {
        console.error('Error updating submission status:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // If approved, add to the appropriate archive
      if (status === 'approved') {
        if (submission.type === 'hero') {
          // Add to memory_archive
          const insertHeroQuery = `
            INSERT INTO memory_archive (
              name, achievement, date_of_death, age, county, 
              category, tags, image_url, verified, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
          `;
          
          const heroData = [
            submission.name,
            submission.description,
            submission.year ? `${submission.year}-01-01` : null,
            null, // age
            submission.county,
            submission.category,
            JSON.stringify([submission.category]),
            null // image_url
          ];
          
          db.query(insertHeroQuery, heroData, (err, heroResult) => {
            if (err) {
              console.error('Error adding hero to archive:', err);
              // Don't fail the request, just log the error
            } else {
              console.log('✅ Hero added to memory archive:', submission.name);
            }
          });
        } else if (submission.type === 'protest') {
          // Add to protests
          const insertProtestQuery = `
            INSERT INTO protests (
              title, description, date, location, county, 
              category, tags, image_url, verified, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
          `;
          
          const protestData = [
            submission.title,
            submission.description,
            submission.year ? `${submission.year}-01-01` : null,
            submission.county,
            submission.county,
            submission.category,
            JSON.stringify([submission.category]),
            null // image_url
          ];
          
          db.query(insertProtestQuery, protestData, (err, protestResult) => {
            if (err) {
              console.error('Error adding protest to archive:', err);
              // Don't fail the request, just log the error
            } else {
              console.log('✅ Protest added to archive:', submission.title);
            }
          });
        }
      }
      
      res.json({ message: 'Status updated successfully' });
    });
  });
});

// ========================================
// ADMIN DASHBOARD API ROUTES
// ========================================

// Helper function to safely parse JSON
function safeJSONParse(str, defaultValue = null) {
  try {
    return str ? JSON.parse(str) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

// Helper function to generate embed code for different platforms
function generateEmbedCode(platform, url) {
  switch (platform) {
    case 'youtube':
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      return videoId ? `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>` : null;
    case 'tiktok':
      const tiktokId = url.match(/video\/(\d+)/)?.[1];
      return tiktokId ? `<blockquote class="tiktok-embed" cite="${url}" data-video-id="${tiktokId}"><section></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>` : null;
    case 'vimeo':
      const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return vimeoId ? `<iframe src="https://player.vimeo.com/video/${vimeoId}" width="560" height="315" frameborder="0" allowfullscreen></iframe>` : null;
    case 'facebook':
      return `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false" width="560" height="315" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true"></iframe>`;
    default:
      return null;
  }
}

// Helper function to calculate content duration
function calculateDuration(content) {
  // Rough estimate: 1 minute per 150 words + media time
  const wordCount = content.split(/\s+/).length;
  const baseMinutes = Math.ceil(wordCount / 150);
  return Math.max(baseMinutes, 1); // Minimum 1 minute
}

// Get admin dashboard overview
app.get('/api/admin/dashboard/overview', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total FROM learning_modules',
    'SELECT COUNT(*) as total FROM learning_modules WHERE status = "published"',
    'SELECT COUNT(*) as total FROM learning_modules WHERE status = "draft"',
    'SELECT COUNT(*) as total FROM learning_modules WHERE status = "review"',
    'SELECT COUNT(*) as total FROM lessons',
    'SELECT COUNT(*) as total FROM quizzes'
  ];

  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results[0].total);
      });
    })
  ))
  .then(([total, published, draft, review, lessons, quizzes]) => {
    res.json({
      total_modules: total,
      published_modules: published,
      draft_modules: draft,
      review_modules: review,
      total_lessons: lessons,
      total_quizzes: quizzes,
      recent_activity: [] // TODO: Add recent activity tracking
    });
  })
  .catch(err => {
    console.error('Error fetching admin dashboard data:', err);
    res.status(500).json({ error: 'Database error' });
  });
});

// Get all admin modules (with pagination and filtering)
app.get('/api/admin/modules', (req, res) => {
  const { page = 1, limit = 20, status, category, difficulty } = req.query;
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
  if (difficulty) {
    whereClause += ' AND difficulty = ?';
    params.push(difficulty);
  }
  
  const query = `
    SELECT 
      id, title, description, content, difficulty, xp_reward, 
      tags, prerequisites, icon, category, estimated_duration, 
      status, is_featured, completion_count, created_at, updated_at
    FROM learning_modules 
    ${whereClause}
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  
  db.query(query, [...params, parseInt(limit), offset], (err, results) => {
    if (err) {
      console.error('Error fetching admin modules:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Parse JSON fields
    results.forEach(module => {
      module.tags = safeJSONParse(module.tags, []);
      module.prerequisites = safeJSONParse(module.prerequisites, []);
    });
    
    res.json(results);
  });
});

// Get admin module by ID
app.get('/api/admin/modules/:id', (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid module ID' });
  }
  
  const moduleQuery = 'SELECT * FROM admin_modules WHERE id = ?';
  const lessonsQuery = 'SELECT * FROM admin_lessons WHERE module_id = ? ORDER BY order_index';
  const quizQuery = 'SELECT * FROM admin_module_quizzes WHERE module_id = ?';
  
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(moduleQuery, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0] || null);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(lessonsQuery, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(quizQuery, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0] || null);
      });
    })
  ])
  .then(([module, lessons, quiz]) => {
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    // Parse JSON fields
    module.tags = safeJSONParse(module.tags, []);
    
    // Get media for each lesson
    const mediaPromises = lessons.map(lesson => 
      new Promise((resolve, reject) => {
        db.query('SELECT * FROM admin_media WHERE lesson_id = ?', [lesson.id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      })
    );
    
    return Promise.all(mediaPromises).then(mediaResults => {
      lessons.forEach((lesson, index) => {
        lesson.media = mediaResults[index] || [];
      });
      
      return { module, lessons, quiz };
    });
  })
  .then(data => {
    res.json(data);
  })
  .catch(err => {
    console.error('Error fetching admin module:', err);
    res.status(500).json({ error: 'Database error' });
  });
});

// Create new admin module
app.post('/api/admin/modules', (req, res) => {
  const { title, description, icon, difficulty, xp_reward, estimated_duration, category, tags } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const query = `
    INSERT INTO admin_modules (
      title, description, icon, difficulty, xp_reward, 
      estimated_duration, category, tags, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    title, description || '', icon || '📚', difficulty || 'beginner',
    xp_reward || 50, estimated_duration || 120, category || '',
    tags ? JSON.stringify(tags) : '[]', req.body.created_by || null
  ];
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error creating admin module:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({
      message: 'Module created successfully',
      moduleId: result.insertId
    });
  });
});

// Update admin module
app.put('/api/admin/modules/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, icon, difficulty, xp_reward, estimated_duration, category, tags, status } = req.body;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid module ID' });
  }
  
  const query = `
    UPDATE admin_modules SET 
      title = ?, description = ?, icon = ?, difficulty = ?, 
      xp_reward = ?, estimated_duration = ?, category = ?, 
      tags = ?, status = ?, updated_at = NOW()
    WHERE id = ?
  `;
  
  const params = [
    title, description, icon, difficulty, xp_reward,
    estimated_duration, category, tags ? JSON.stringify(tags) : '[]',
    status, id
  ];
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating admin module:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    res.json({ message: 'Module updated successfully' });
  });
});

// Delete admin module
app.delete('/api/admin/modules/:id', (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid module ID' });
  }
  
  db.query('DELETE FROM admin_modules WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting admin module:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    res.json({ message: 'Module deleted successfully' });
  });
});

// Create/Update admin lesson
app.post('/api/admin/lessons', (req, res) => {
  const { module_id, title, order_index, hook, why_matters, main_content, key_takeaways, mini_quiz } = req.body;
  
  if (!module_id || !title || !order_index) {
    return res.status(400).json({ error: 'Module ID, title, and order index are required' });
  }
  
  const query = `
    INSERT INTO admin_lessons (
      module_id, title, order_index, hook, why_matters, 
      main_content, key_takeaways, mini_quiz, estimated_duration
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title), hook = VALUES(hook), why_matters = VALUES(why_matters),
      main_content = VALUES(main_content), key_takeaways = VALUES(key_takeaways),
      mini_quiz = VALUES(mini_quiz), updated_at = NOW()
  `;
  
  const estimated_duration = calculateDuration(main_content || '');
  const params = [
    module_id, title, order_index, hook || '', why_matters || '',
    main_content || '', key_takeaways || '', mini_quiz || '', estimated_duration
  ];
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error creating/updating admin lesson:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({
      message: 'Lesson saved successfully',
      lessonId: result.insertId || result.insertId
    });
  });
});

// Delete admin lesson
app.delete('/api/admin/lessons/:id', (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid lesson ID' });
  }
  
  db.query('DELETE FROM admin_lessons WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting admin lesson:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    res.json({ message: 'Lesson deleted successfully' });
  });
});

// Add external media (YouTube, TikTok, etc.)
app.post('/api/admin/media/external', (req, res) => {
  const { lesson_id, content_section, media_type, media_url, title, description } = req.body;
  
  if (!lesson_id || !content_section || !media_type || !media_url) {
    return res.status(400).json({ error: 'Lesson ID, content section, media type, and URL are required' });
  }
  
  const embed_code = generateEmbedCode(media_type, media_url);
  if (!embed_code) {
    return res.status(400).json({ error: 'Invalid media URL or unsupported platform' });
  }
  
  const query = `
    INSERT INTO admin_media (
      lesson_id, content_section, media_type, media_url, 
      embed_code, title, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [lesson_id, content_section, media_type, media_url, embed_code, title || '', description || ''];
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error adding external media:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({
      message: 'Media added successfully',
      mediaId: result.insertId,
      embed_code
    });
  });
});

// Remove media
app.delete('/api/admin/media/:id', (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid media ID' });
  }
  
  db.query('DELETE FROM admin_media WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error removing media:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    res.json({ message: 'Media removed successfully' });
  });
});

// Get admin module quiz
app.get('/api/admin/modules/:moduleId/quiz', (req, res) => {
  const { moduleId } = req.params;
  
  if (!moduleId || isNaN(parseInt(moduleId))) {
    return res.status(400).json({ error: 'Invalid module ID' });
  }
  
  // Get quiz metadata
  db.query('SELECT * FROM admin_module_quizzes WHERE module_id = ?', [moduleId], (err, quizResults) => {
    if (err) {
      console.error('Error fetching quiz:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (quizResults.length === 0) {
      return res.json(null); // No quiz exists for this module
    }
    
    const quiz = quizResults[0];
    
    // Get quiz questions
    db.query('SELECT * FROM admin_quiz_questions WHERE quiz_id = ? ORDER BY order_index', [quiz.id], (err, questionResults) => {
      if (err) {
        console.error('Error fetching quiz questions:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const questions = questionResults.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: safeJSONParse(q.options, []),
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        points: q.points,
        order_index: q.order_index
      }));
      
      res.json({
        ...quiz,
        questions
      });
    });
  });
});

// Get all admin quizzes
app.get('/api/admin/quizzes', (req, res) => {
  const query = `
    SELECT 
      q.id, q.module_id, q.title, q.description, q.passing_score, 
      q.time_limit, q.total_questions, q.created_at, q.updated_at,
      m.title as module_title
    FROM admin_module_quizzes q
    LEFT JOIN admin_modules m ON q.module_id = m.id
    ORDER BY q.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching quizzes:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

// Get specific admin quiz by ID
app.get('/api/admin/quizzes/:quizId', (req, res) => {
  const { quizId } = req.params;
  
  if (!quizId || isNaN(parseInt(quizId))) {
    return res.status(400).json({ error: 'Invalid quiz ID' });
  }
  
  // Get quiz metadata
  db.query('SELECT * FROM admin_module_quizzes WHERE id = ?', [quizId], (err, quizResults) => {
    if (err) {
      console.error('Error fetching quiz:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (quizResults.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const quiz = quizResults[0];
    
    // Get quiz questions
    db.query('SELECT * FROM admin_quiz_questions WHERE quiz_id = ? ORDER BY order_index', [quizId], (err, questionResults) => {
      if (err) {
        console.error('Error fetching quiz questions:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Parse options JSON for each question
      const questions = questionResults.map(q => ({
        ...q,
        options: JSON.parse(q.options || '[]')
      }));
      
      res.json({
        ...quiz,
        questions
      });
    });
  });
});

// Save admin module quiz
app.post('/api/admin/quizzes', (req, res) => {
  const { module_id, title, description, passing_score, time_limit, questions } = req.body;
  
  console.log('=== Quiz Creation Request ===');
  console.log('Request body:', req.body);
  
  if (!module_id || !title || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Module ID, title, and questions array are required' });
  }
  
  // Start transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error('Transaction start error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Insert quiz
    const quizQuery = `
      INSERT INTO admin_module_quizzes (
        module_id, title, description, passing_score, time_limit, total_questions
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const quizParams = [
      module_id, title, description || '', passing_score || 70,
      time_limit || 30, questions.length
    ];
    
    console.log('Quiz query:', quizQuery);
    console.log('Quiz params:', quizParams);
    
    db.query(quizQuery, quizParams, (err, quizResult) => {
      if (err) {
        console.error('Quiz insert error:', err);
        return db.rollback(() => {
          res.status(500).json({ error: 'Database error: ' + err.message });
        });
      }
      
      const quizId = quizResult.insertId;
      console.log('Quiz created with ID:', quizId);
      
      // Delete existing questions
      db.query('DELETE FROM admin_quiz_questions WHERE quiz_id = ?', [quizId], (err) => {
        if (err) {
          console.error('Delete questions error:', err);
          return db.rollback(() => {
            res.status(500).json({ error: 'Database error: ' + err.message });
          });
        }
        
        // Insert new questions
        const questionPromises = questions.map((question, index) => 
          new Promise((resolve, reject) => {
            const questionQuery = `
              INSERT INTO admin_quiz_questions (
                quiz_id, question_text, question_type, options, correct_answer,
                explanation, difficulty, points, order_index
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const questionParams = [
              quizId, question.question_text, question.question_type || 'multiple_choice',
              JSON.stringify(question.options || []), question.correct_answer,
              question.explanation || '', question.difficulty || 'medium',
              question.points || 1, index
            ];
            
            console.log(`Question ${index + 1} params:`, questionParams);
            
            db.query(questionQuery, questionParams, (err) => {
              if (err) {
                console.error(`Question ${index + 1} insert error:`, err);
                reject(err);
              } else {
                resolve();
              }
            });
          })
        );
        
        Promise.all(questionPromises)
          .then(() => {
            db.commit((err) => {
              if (err) {
                console.error('Commit error:', err);
                return db.rollback(() => {
                  res.status(500).json({ error: 'Database error: ' + err.message });
                });
              }
              
              console.log('Quiz saved successfully with ID:', quizId);
              res.json({
                message: 'Quiz saved successfully',
                quizId
              });
            });
          })
          .catch(err => {
            console.error('Question insertion error:', err);
            db.rollback(() => {
              res.status(500).json({ error: 'Database error: ' + err.message });
            });
          });
      });
    });
  });
});

// Update admin module quiz
app.put('/api/admin/quizzes/:quizId', (req, res) => {
  const { quizId } = req.params;
  const { module_id, title, description, passing_score, time_limit, questions } = req.body;
  
  if (!quizId || isNaN(parseInt(quizId))) {
    return res.status(400).json({ error: 'Invalid quiz ID' });
  }
  
  if (!title || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Title and questions array are required' });
  }
  
  // Start transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Update quiz metadata
    const quizQuery = `
      UPDATE admin_module_quizzes SET
        title = ?, description = ?, passing_score = ?, time_limit = ?, 
        total_questions = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const quizParams = [
      title, description || '', passing_score || 70,
      time_limit || 30, questions.length, quizId
    ];
    
    db.query(quizQuery, quizParams, (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: 'Database error' });
        });
      }
      
      if (result.affectedRows === 0) {
        return db.rollback(() => {
          res.status(404).json({ error: 'Quiz not found' });
        });
      }
      
      // Delete existing questions
      db.query('DELETE FROM admin_quiz_questions WHERE quiz_id = ?', [quizId], (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: 'Database error' });
          });
        }
        
        // Insert new questions
        const questionPromises = questions.map((question, index) => 
          new Promise((resolve, reject) => {
            const questionQuery = `
              INSERT INTO admin_quiz_questions (
                quiz_id, question_text, question_type, options, correct_answer,
                explanation, difficulty, points, order_index
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const questionParams = [
              quizId, question.question_text, question.question_type || 'multiple_choice',
              JSON.stringify(question.options || []), question.correct_answer,
              question.explanation || '', question.difficulty || 'medium',
              question.points || 1, index
            ];
            
            db.query(questionQuery, questionParams, (err) => {
              if (err) reject(err);
              else resolve();
            });
          })
        );
        
        Promise.all(questionPromises)
          .then(() => {
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ error: 'Database error' });
                });
              }
              
              res.json({
                message: 'Quiz updated successfully',
                quizId
              });
            });
          })
          .catch(err => {
            db.rollback(() => {
              console.error('Error updating quiz questions:', err);
              res.status(500).json({ error: 'Database error' });
            });
          });
      });
    });
  });
});

// Get admin module workflow
app.get('/api/admin/modules/:id/workflow', (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid module ID' });
  }
  
  const query = 'SELECT * FROM admin_publishing_workflow WHERE module_id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching workflow:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      // Create default workflow if none exists
      const defaultWorkflow = {
        module_id: id,
        current_status: 'draft',
        quality_checks: JSON.stringify({
          content_reviewed: false,
          media_embedded: false,
          quiz_tested: false,
          mobile_preview: false,
          kenyan_examples: false
        }),
        workflow_history: JSON.stringify([])
      };
      
      db.query('INSERT INTO admin_publishing_workflow SET ?', defaultWorkflow, (err, result) => {
        if (err) {
          console.error('Error creating default workflow:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        defaultWorkflow.id = result.insertId;
        defaultWorkflow.quality_checks = JSON.parse(defaultWorkflow.quality_checks);
        defaultWorkflow.workflow_history = JSON.parse(defaultWorkflow.workflow_history);
        
        res.json(defaultWorkflow);
      });
    } else {
      const workflow = results[0];
      workflow.quality_checks = safeJSONParse(workflow.quality_checks, {});
      workflow.workflow_history = safeJSONParse(workflow.workflow_history, []);
      res.json(workflow);
    }
  });
});

// Update admin module workflow status
app.put('/api/admin/modules/:id/workflow', (req, res) => {
  const { id } = req.params;
  const { current_status, quality_checks, review_notes, reviewer_id } = req.body;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid module ID' });
  }
  
  if (!current_status || !['draft', 'review', 'ready', 'published'].includes(current_status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const query = `
    INSERT INTO admin_publishing_workflow (
      module_id, current_status, quality_checks, review_notes, 
      reviewer_id, review_date, updated_at
    ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      current_status = VALUES(current_status),
      quality_checks = VALUES(quality_checks),
      review_notes = VALUES(review_notes),
      reviewer_id = VALUES(reviewer_id),
      review_date = VALUES(review_date),
      updated_at = NOW()
  `;
  
  const params = [
    id, current_status, 
    quality_checks ? JSON.stringify(quality_checks) : '{}',
    review_notes || '', reviewer_id || null
  ];
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating workflow:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Update module status
    db.query('UPDATE admin_modules SET status = ? WHERE id = ?', [current_status, id], (err) => {
      if (err) {
        console.error('Error updating module status:', err);
      }
    });
    
    res.json({ message: 'Workflow updated successfully' });
  });
});

// Get admin categories
app.get('/api/admin/categories', (req, res) => {
  const query = 'SELECT DISTINCT category FROM learning_modules WHERE category IS NOT NULL AND category != ""';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results.map(r => r.category));
  });
});

// Get admin difficulties
app.get('/api/admin/difficulties', (req, res) => {
  const difficulties = ['beginner', 'intermediate', 'advanced'];
  res.json(difficulties);
});

// Admin health check
app.get('/api/admin/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected',
    admin_tables: 'ready'
  });
});

// ========================================
// CONNECT EXISTING LEARNING MODULES TO ADMIN SYSTEM
// ========================================

// Get all existing learning modules for admin editing
app.get('/api/admin/learning-modules', (req, res) => {
  const query = `
    SELECT 
      id, title, description, content, difficulty, xp_reward, 
      tags, prerequisites, icon, category, estimated_duration, 
      status, is_featured, completion_count, created_at, updated_at
    FROM learning_modules 
    ORDER BY created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching learning modules:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Parse JSON fields
    const modules = results.map(module => ({
      ...module,
      tags: safeJSONParse(module.tags, []),
      prerequisites: safeJSONParse(module.prerequisites, [])
    }));
    
    res.json(modules);
  });
});

// Get a specific learning module by ID for admin editing
app.get('/api/admin/learning-modules/:id', (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid module ID' });
  }
  
  const query = `
    SELECT 
      id, title, description, content, difficulty, xp_reward, 
      tags, prerequisites, icon, category, estimated_duration, 
      status, is_featured, completion_count, created_at, updated_at
    FROM learning_modules 
    WHERE id = ?
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching learning module:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    const module = results[0];
    module.tags = safeJSONParse(module.tags, []);
    module.prerequisites = safeJSONParse(module.prerequisites, []);
    
    res.json(module);
  });
});

// Update an existing learning module
app.put('/api/admin/learning-modules/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid module ID' });
  }
  
  // Prepare update data
  const allowedFields = [
    'title', 'description', 'content', 'difficulty', 'xp_reward',
    'tags', 'prerequisites', 'icon', 'category', 'estimated_duration',
    'status', 'is_featured'
  ];
  
  const filteredData = {};
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      if (field === 'tags' || field === 'prerequisites') {
        filteredData[field] = JSON.stringify(updateData[field]);
      } else {
        filteredData[field] = updateData[field];
      }
    }
  });
  
  filteredData.updated_at = new Date();
  
  const query = 'UPDATE learning_modules SET ? WHERE id = ?';
  
  db.query(query, [filteredData, id], (err, result) => {
    if (err) {
      console.error('Error updating learning module:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ message: 'Module updated successfully', moduleId: id });
  });
});

// Get lessons for a specific module
app.get('/api/admin/learning-modules/:id/lessons', (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid module ID' });
  }
  
  const query = `
    SELECT 
      id, module_id, title, order_index, 
      hook, why_matters, main_content, key_takeaways,
      estimated_duration, created_at, updated_at
    FROM admin_lessons 
    WHERE module_id = ? 
    ORDER BY order_index ASC
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching lessons:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Format lessons to match frontend expectations
    const lessons = results.map(lesson => {
      // Reconstruct content_sections object
      const content_sections = {
        hook: { content: lesson.hook || '', media_id: null },
        why_matters: { content: lesson.why_matters || '', media_id: null },
        main_content: { content: lesson.main_content || '', media_id: null },
        key_takeaways: lesson.key_takeaways ? lesson.key_takeaways.split('\n').filter(t => t.trim()) : []
      };
      
      return {
        ...lesson,
        content_sections,
        content: JSON.stringify(content_sections) // For backward compatibility
      };
    });
    
    res.json(lessons);
  });
});

// Create a new learning module
app.post('/api/admin/learning-modules', (req, res) => {
  const moduleData = req.body;
  
  const requiredFields = ['title', 'description'];
  for (const field of requiredFields) {
    if (!moduleData[field]) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }
  
  const module = {
    title: moduleData.title,
    description: moduleData.description,
    content: moduleData.content || '',
    icon: moduleData.icon || '📚',
    difficulty: moduleData.difficulty || 'beginner',
    xp_reward: moduleData.xp_reward || 50,
    category: moduleData.category || '',
    tags: JSON.stringify(moduleData.tags || []),
    estimated_duration: moduleData.estimated_duration || 120,
    status: moduleData.status || 'draft',
    is_featured: moduleData.featured || false,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  const query = 'INSERT INTO learning_modules SET ?';
  
  db.query(query, [module], (err, result) => {
    if (err) {
      console.error('Error creating module:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ 
      message: 'Module created successfully', 
      moduleId: result.insertId 
    });
  });
});

// Create a new lesson for a module
app.post('/api/admin/learning-modules/:id/lessons', (req, res) => {
  const { id } = req.params;
  const lessonData = req.body;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid module ID' });
  }
  
  const requiredFields = ['title', 'content'];
  for (const field of requiredFields) {
    if (!lessonData[field]) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }
  
  // Parse content sections from the lesson data
  let contentSections = {};
  try {
    if (typeof lessonData.content === 'string') {
      contentSections = JSON.parse(lessonData.content);
    } else if (typeof lessonData.content === 'object') {
      contentSections = lessonData.content;
    }
  } catch (error) {
    console.error('Error parsing content sections:', error);
    contentSections = {};
  }

  const lesson = {
    module_id: parseInt(id),
    title: lessonData.title,
    hook: contentSections.hook?.content || '',
    why_matters: contentSections.why_matters?.content || '',
    main_content: contentSections.main_content?.content || '',
    key_takeaways: Array.isArray(contentSections.key_takeaways) ? 
      contentSections.key_takeaways.join('\n') : '',
    order_index: lessonData.order_index || 0,
    estimated_duration: lessonData.estimated_duration || 15
  };
  
  const query = 'INSERT INTO admin_lessons SET ?';
  
  db.query(query, [lesson], (err, result) => {
    if (err) {
      console.error('Error creating lesson:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ 
      message: 'Lesson created successfully', 
      lessonId: result.insertId 
    });
  });
});

// Update a lesson
app.put('/api/admin/learning-modules/:moduleId/lessons/:lessonId', (req, res) => {
  const { moduleId, lessonId } = req.params;
  const updateData = req.body;
  
  if (!moduleId || !lessonId || isNaN(parseInt(moduleId)) || isNaN(parseInt(lessonId))) {
    return res.status(400).json({ error: 'Invalid module or lesson ID' });
  }
  
  // Parse content sections from the update data
  let contentSections = {};
  try {
    if (typeof updateData.content === 'string') {
      contentSections = JSON.parse(updateData.content);
    } else if (typeof updateData.content === 'object') {
      contentSections = updateData.content;
    }
  } catch (error) {
    console.error('Error parsing content sections:', error);
    contentSections = {};
  }

  // Prepare update data
  const allowedFields = [
    'title', 'order_index', 'estimated_duration'
  ];
  
  const filteredData = {};
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  // Add content section fields
  if (contentSections.hook?.content !== undefined) {
    filteredData.hook = contentSections.hook.content;
  }
  if (contentSections.why_matters?.content !== undefined) {
    filteredData.why_matters = contentSections.why_matters.content;
  }
  if (contentSections.main_content?.content !== undefined) {
    filteredData.main_content = contentSections.main_content.content;
  }
  if (contentSections.key_takeaways !== undefined) {
    filteredData.key_takeaways = Array.isArray(contentSections.key_takeaways) ? 
      contentSections.key_takeaways.join('\n') : '';
  }
  
  filteredData.updated_at = new Date();
  
  const query = 'UPDATE admin_lessons SET ? WHERE id = ? AND module_id = ?';
  
  db.query(query, [filteredData, lessonId, moduleId], (err, result) => {
    if (err) {
      console.error('Error updating lesson:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    res.json({ message: 'Lesson updated successfully' });
  });
});

// Delete a lesson
app.delete('/api/admin/learning-modules/:moduleId/lessons/:lessonId', (req, res) => {
  const { moduleId, lessonId } = req.params;
  
  if (!moduleId || !lessonId || isNaN(parseInt(moduleId)) || isNaN(parseInt(lessonId))) {
    return res.status(400).json({ error: 'Invalid module or lesson ID' });
  }
  
  const query = 'DELETE FROM admin_lessons WHERE id = ? AND module_id = ?';
  
  db.query(query, [lessonId, moduleId], (err, result) => {
    if (err) {
      console.error('Error deleting lesson:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    res.json({ message: 'Lesson deleted successfully' });
  });
});

// Delete a learning module
app.delete('/api/admin/learning-modules/:id', (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid module ID' });
  }
  
  // First delete all lessons associated with this module
  db.query('DELETE FROM lessons WHERE module_id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting lessons:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Then delete the module
    db.query('DELETE FROM learning_modules WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error deleting module:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Module not found' });
      }
      
      res.json({ message: 'Module and all associated lessons deleted successfully' });
    });
  });
});

// ========================================
// END ADMIN DASHBOARD API ROUTES
// ========================================

// Catch all handler: send back React's index.html file (commented out for development)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client/build/index.html'));
// });

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
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

// SINGLE app.listen() call - ONLY ONE!
app.listen(PORT, () => {
  console.log(`🚀 Rada.ke server running on port ${PORT}`);
});