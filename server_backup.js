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

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_ke',
  charset: 'utf8mb4'
});

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
      completion_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      completed_at TIMESTAMP NULL,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE,
      FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
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
    }
  ];
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

// Learning Modules API
app.get('/api/learning/modules', (req, res) => {
  db.query('SELECT * FROM learning_modules ORDER BY difficulty, created_at', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const modules = results.map(module => ({
      ...module,
      tags: safeJSONParse(module.tags, []),
      prerequisites: safeJSONParse(module.prerequisites, [])
    }));

    res.json(modules);
  });
});

app.get('/api/learning/modules/:id', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid module ID' });
  }

  db.query('SELECT * FROM learning_modules WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching module:', err);
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

// Get user learning progress
app.get('/api/learning/progress/:uuid', (req, res) => {
  const { uuid } = req.params;

  if (!uuid) {
    return res.status(400).json({ error: 'User UUID is required' });
  }

  db.query(`
    SELECT up.*, lm.title as module_title, lm.difficulty, lm.xp_reward,
           q.title as quiz_title, q.xp_reward as quiz_xp
    FROM user_progress up
    LEFT JOIN learning_modules lm ON up.module_id = lm.id
    LEFT JOIN quizzes q ON up.quiz_id = q.id
    WHERE up.uuid = ?
    ORDER BY up.completed_at DESC
  `, [uuid], (err, results) => {
    if (err) {
      console.error('Error fetching learning progress:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const progress = results.map(item => ({
      ...item,
      completed: Boolean(item.completed),
      completed_at: item.completed_at || null
    }));

    res.json(progress);
  });
});

// Get quiz by ID
app.get('/api/learning/quiz/:id', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid quiz ID' });
  }

  db.query('SELECT * FROM quizzes WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching quiz:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = results[0];
    quiz.questions = safeJSONParse(quiz.questions, []);

    res.json(quiz);
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

// Catch all handler: send back React's index.html file (commented out for development)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client/build/index.html'));
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// SINGLE app.listen() call - ONLY ONE!
app.listen(PORT, () => {
  console.log(`🚀 Rada.ke server running on port ${PORT}`);
});