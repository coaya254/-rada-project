const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixUserProgressTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rada_ke'
  });

  try {
    console.log('Dropping old user_learning_progress table...');
    await connection.query('DROP TABLE IF EXISTS user_learning_progress');

    console.log('Creating new user_learning_progress table with correct schema...');
    await connection.query(`
      CREATE TABLE user_learning_progress (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL UNIQUE,
        total_xp INT DEFAULT 0,
        level INT DEFAULT 1,
        current_streak INT DEFAULT 0,
        longest_streak INT DEFAULT 0,
        last_activity TIMESTAMP NULL,
        modules_completed INT DEFAULT 0,
        lessons_completed INT DEFAULT 0,
        quizzes_passed INT DEFAULT 0,
        hours_spent DECIMAL(10,2) DEFAULT 0,
        achievements_earned INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_xp (total_xp),
        INDEX idx_level (level)
      )
    `);

    console.log('Dropping old user_xp_transactions table...');
    await connection.query('DROP TABLE IF EXISTS user_xp_transactions');

    console.log('Creating new user_xp_transactions table...');
    await connection.query(`
      CREATE TABLE user_xp_transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        amount INT NOT NULL,
        source_type ENUM('lesson', 'quiz', 'achievement', 'challenge', 'bonus') NOT NULL,
        source_id INT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_source (source_type, source_id)
      )
    `);

    console.log('✅ Tables fixed successfully!');

  } catch (error) {
    console.error('Error fixing tables:', error);
  } finally {
    await connection.end();
  }
}

fixUserProgressTable();
