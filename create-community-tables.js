const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'radake'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database');
  createTables();
});

function createTables() {
  const tables = [
    // Discussions Table (main posts)
    `CREATE TABLE IF NOT EXISTS discussions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(255) NOT NULL,
      title VARCHAR(500) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      is_anonymous BOOLEAN DEFAULT FALSE,
      replies_count INT DEFAULT 0,
      likes_count INT DEFAULT 0,
      views_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_created (created_at),
      INDEX idx_uuid (uuid),
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE
    )`,

    // Discussion Replies Table
    `CREATE TABLE IF NOT EXISTS discussion_replies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      discussion_id INT NOT NULL,
      uuid VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      likes_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_discussion (discussion_id),
      INDEX idx_uuid (uuid),
      INDEX idx_created (created_at),
      FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE
    )`,

    // Discussion Likes Table
    `CREATE TABLE IF NOT EXISTS discussion_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      discussion_id INT NOT NULL,
      uuid VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_discussion_like (discussion_id, uuid),
      INDEX idx_discussion (discussion_id),
      INDEX idx_uuid (uuid),
      FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE
    )`,

    // Reply Likes Table
    `CREATE TABLE IF NOT EXISTS reply_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      reply_id INT NOT NULL,
      uuid VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_reply_like (reply_id, uuid),
      INDEX idx_reply (reply_id),
      INDEX idx_uuid (uuid),
      FOREIGN KEY (reply_id) REFERENCES discussion_replies(id) ON DELETE CASCADE,
      FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE
    )`
  ];

  let completed = 0;
  
  tables.forEach((sql, index) => {
    db.query(sql, (err) => {
      if (err) {
        console.error(`❌ Error creating table ${index + 1}:`, err.message);
      } else {
        const tableName = sql.match(/TABLE IF NOT EXISTS (\w+)/)[1];
        console.log(`✅ Table '${tableName}' created successfully`);
      }
      
      completed++;
      if (completed === tables.length) {
        console.log('\n🎉 All Community tables created successfully!');
        console.log('\nNew tables:');
        console.log('  1. discussions');
        console.log('  2. discussion_replies');
        console.log('  3. discussion_likes');
        console.log('  4. reply_likes');
        db.end();
        process.exit(0);
      }
    });
  });
}