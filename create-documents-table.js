const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'rada_ke'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Connected to database');

  // Drop existing table first
  db.query('SET FOREIGN_KEY_CHECKS = 0', (err) => {
    if (err) {
      console.error('❌ Failed to disable foreign key checks:', err.message);
      db.end();
      process.exit(1);
    }

    db.query('DROP TABLE IF EXISTS documents', (err) => {
      if (err) {
        console.error('❌ Failed to drop existing table:', err.message);
        db.end();
        process.exit(1);
      }

      console.log('✅ Dropped existing documents table');

      db.query('SET FOREIGN_KEY_CHECKS = 1', (err) => {
        if (err) {
          console.error('❌ Failed to enable foreign key checks:', err.message);
          db.end();
          process.exit(1);
        }

        createTable();
      });
    });
  });
});

function createTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      politician_id INT NOT NULL,
      title VARCHAR(500) NOT NULL,
      type ENUM('speech', 'policy', 'bill', 'press_release', 'interview', 'manifesto', 'report', 'letter', 'other') NOT NULL,
      description TEXT,
      content TEXT,
      date_published DATE NOT NULL,
      source_url VARCHAR(1000),
      file_url VARCHAR(1000),
      status ENUM('draft', 'published', 'archived', 'under_review') DEFAULT 'draft',
      tags JSON,
      language ENUM('en', 'sw', 'other') DEFAULT 'en',
      is_featured BOOLEAN DEFAULT FALSE,
      transcript_available BOOLEAN DEFAULT FALSE,
      summary TEXT,
      key_points JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE,
      INDEX idx_politician (politician_id),
      INDEX idx_type (type),
      INDEX idx_status (status),
      INDEX idx_date (date_published)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error('❌ Failed to create table:', err.message);
      db.end();
      process.exit(1);
    }

    console.log('✅ documents table created successfully');

    db.end();
    console.log('\n✅ Database setup complete!');
  });
}
