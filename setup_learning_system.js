const mysql = require('mysql2');
require('dotenv').config();

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_db',
  multipleStatements: true
});

// Learning system tables creation
const createLearningTables = `
-- Learning Modules Table
CREATE TABLE IF NOT EXISTS learning_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '📚',
  xp_reward INT DEFAULT 100,
  estimated_duration INT DEFAULT 30, -- in minutes
  difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  category VARCHAR(100) DEFAULT 'general',
  is_featured BOOLEAN DEFAULT FALSE,
  status ENUM('draft', 'published', 'archived') DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Learning Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  video_url VARCHAR(500),
  estimated_time VARCHAR(20) DEFAULT '5 min',
  order_index INT DEFAULT 0,
  has_quiz BOOLEAN DEFAULT FALSE,
  resources JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE
);

-- Learning Quizzes Table
CREATE TABLE IF NOT EXISTS learning_quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  questions JSON NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  time_limit INT DEFAULT 30, -- in minutes
  passing_score INT DEFAULT 70, -- percentage
  xp_reward INT DEFAULT 50,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Learning Challenges Table
CREATE TABLE IF NOT EXISTS learning_challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  xp_reward INT DEFAULT 100,
  duration VARCHAR(50) DEFAULT '7 days',
  participants INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  end_date DATE,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Learning Badges Table
CREATE TABLE IF NOT EXISTS learning_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '🏆',
  required_xp INT DEFAULT 1000,
  category VARCHAR(100) DEFAULT 'general',
  rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Learning Progress Table
CREATE TABLE IF NOT EXISTS user_learning_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_uuid VARCHAR(255) NOT NULL,
  module_id INT,
  lesson_id INT,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- User Learning Stats Table
CREATE TABLE IF NOT EXISTS user_learning_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_uuid VARCHAR(255) NOT NULL UNIQUE,
  total_xp INT DEFAULT 0,
  level INT DEFAULT 1,
  learning_streak INT DEFAULT 0,
  modules_completed INT DEFAULT 0,
  lessons_completed INT DEFAULT 0,
  quizzes_completed INT DEFAULT 0,
  badges_earned INT DEFAULT 0,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_uuid VARCHAR(255) NOT NULL,
  badge_id INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (badge_id) REFERENCES learning_badges(id) ON DELETE CASCADE
);
`;

// Sample data insertion
const insertSampleData = `
-- Insert sample learning modules
INSERT INTO learning_modules (title, description, icon, xp_reward, estimated_duration, difficulty, category, is_featured, status) VALUES
('Kenya Government Structure', 'Learn about the three arms of Kenyan government and how they work together to maintain democracy.', '🏛️', 120, 45, 'beginner', 'government', TRUE, 'published'),
('Understanding County Governments', 'Learn how devolution works in Kenya and your role in county governance', '🏛️', 150, 60, 'intermediate', 'government', TRUE, 'published'),
('Civic Rights and Responsibilities', 'Understand your constitutional rights and civic duties as a Kenyan citizen', '⚖️', 100, 30, 'beginner', 'rights', FALSE, 'published'),
('Budget Literacy', 'Learn how to read and understand government budgets and spending', '💰', 200, 90, 'intermediate', 'economics', FALSE, 'published'),
('Digital Citizenship', 'Navigate the digital world responsibly and safely', '💻', 80, 40, 'beginner', 'technology', FALSE, 'published');

-- Insert sample lessons
INSERT INTO lessons (module_id, title, content, video_url, estimated_time, order_index, has_quiz, resources) VALUES
(1, 'Introduction to Kenya Constitution', 'The Constitution of Kenya 2010 is the supreme law of the land. It establishes the structure of government, defines the rights and freedoms of citizens, and sets out the principles of governance. This lesson covers the key features of the Constitution and its importance in Kenyan society.', 'https://www.youtube.com/embed/sample1', '5 min', 1, TRUE, '["Constitution of Kenya 2010", "Bill of Rights Guide"]'),
(1, 'The Executive Branch', 'The Executive branch is headed by the President and includes the Deputy President, Cabinet Secretaries, and other executive officers. Learn about their roles, powers, and how they are held accountable.', 'https://www.youtube.com/embed/sample2', '8 min', 2, TRUE, '["Executive Powers Guide", "Cabinet Structure"]'),
(1, 'The Legislature', 'The Legislature consists of the National Assembly and the Senate. Discover how laws are made, the role of MPs and Senators, and how they represent your interests.', 'https://www.youtube.com/embed/sample3', '10 min', 3, TRUE, '["Parliament Guide", "Law Making Process"]'),
(1, 'The Judiciary', 'The Judiciary interprets the law and ensures justice is served. Learn about the court system, judicial independence, and how to access justice.', 'https://www.youtube.com/embed/sample4', '7 min', 4, TRUE, '["Court System Guide", "Access to Justice"]'),
(2, 'Devolution in Kenya', 'Devolution transfers power from the national government to county governments. Understand how this system works and its benefits for local development.', 'https://www.youtube.com/embed/sample5', '6 min', 1, TRUE, '["Devolution Guide", "County Powers"]'),
(2, 'County Government Structure', 'County governments have their own executive, legislative, and administrative structures. Learn about governors, MCAs, and county staff.', 'https://www.youtube.com/embed/sample6', '8 min', 2, TRUE, '["County Structure", "MCA Guide"]');

-- Insert sample quizzes
INSERT INTO learning_quizzes (title, description, questions, difficulty, time_limit, passing_score, xp_reward, active) VALUES
('Constitution Basics Quiz', 'Test your knowledge of Kenya\'s Constitution', '[
  {
    "question": "When was the Constitution of Kenya 2010 promulgated?",
    "options": ["2008", "2010", "2012", "2015"],
    "correct": 1,
    "explanation": "The Constitution was promulgated on August 27, 2010."
  },
  {
    "question": "How many chapters does the Constitution have?",
    "options": ["15", "18", "20", "22"],
    "correct": 1,
    "explanation": "The Constitution has 18 chapters covering different aspects of governance."
  },
  {
    "question": "What is the supreme law of Kenya?",
    "options": ["Acts of Parliament", "The Constitution", "Presidential Decrees", "Court Rulings"],
    "correct": 1,
    "explanation": "The Constitution is the supreme law of Kenya as stated in Article 2."
  }
]', 'easy', 15, 70, 50, TRUE),
('Government Structure Quiz', 'Test your understanding of Kenya\'s government structure', '[
  {
    "question": "How many arms of government does Kenya have?",
    "options": ["Two", "Three", "Four", "Five"],
    "correct": 1,
    "explanation": "Kenya has three arms: Executive, Legislature, and Judiciary."
  },
  {
    "question": "Who heads the Executive branch?",
    "options": ["Chief Justice", "Speaker", "President", "Governor"],
    "correct": 2,
    "explanation": "The President heads the Executive branch of government."
  }
]', 'medium', 20, 75, 75, TRUE);

-- Insert sample challenges
INSERT INTO learning_challenges (title, description, category, xp_reward, duration, participants, active, end_date, image_url) VALUES
('Constitution Knowledge Challenge', 'Test your knowledge of Kenya\'s Constitution and win rewards', 'education', 200, '7 days', 0, TRUE, '2025-02-15', 'https://example.com/challenge1.jpg'),
('Civic Engagement Challenge', 'Participate in local government meetings and share your experience', 'engagement', 150, '14 days', 0, TRUE, '2025-02-20', 'https://example.com/challenge2.jpg'),
('Budget Analysis Challenge', 'Analyze your county\'s budget and provide insights', 'economics', 300, '10 days', 0, TRUE, '2025-02-18', 'https://example.com/challenge3.jpg');

-- Insert sample badges
INSERT INTO learning_badges (name, description, icon, required_xp, category, rarity) VALUES
('Constitution Scholar', 'Completed all Constitution-related modules', '📜', 500, 'government', 'rare'),
('Civic Champion', 'Active participant in civic engagement', '🏆', 1000, 'engagement', 'epic'),
('Budget Expert', 'Mastered budget literacy skills', '💰', 800, 'economics', 'rare'),
('Digital Citizen', 'Completed digital citizenship course', '💻', 300, 'technology', 'common'),
('Learning Streak Master', 'Maintained 30-day learning streak', '🔥', 2000, 'general', 'legendary');
`;

async function setupLearningSystem() {
  try {
    console.log('🚀 Setting up learning system...');
    
    // Split the table creation into individual statements
    const tableStatements = createLearningTables.split(';').filter(stmt => stmt.trim());
    
    console.log('📚 Creating learning tables...');
    for (const statement of tableStatements) {
      if (statement.trim()) {
        await db.promise().execute(statement.trim());
      }
    }
    console.log('✅ Learning tables created successfully');
    
    // Split the data insertion into individual statements
    const dataStatements = insertSampleData.split(';').filter(stmt => stmt.trim());
    
    console.log('📝 Inserting sample data...');
    for (const statement of dataStatements) {
      if (statement.trim()) {
        await db.promise().execute(statement.trim());
      }
    }
    console.log('✅ Sample data inserted successfully');
    
    console.log('🎉 Learning system setup complete!');
    console.log('\n📊 Summary:');
    console.log('- Learning modules: 5');
    console.log('- Lessons: 6');
    console.log('- Quizzes: 2');
    console.log('- Challenges: 3');
    console.log('- Badges: 5');
    
  } catch (error) {
    console.error('❌ Error setting up learning system:', error);
  } finally {
    db.end();
  }
}

setupLearningSystem();
