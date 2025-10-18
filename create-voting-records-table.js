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

  // Disable foreign key checks, drop the old table, then re-enable
  db.query('SET FOREIGN_KEY_CHECKS = 0', (err) => {
    if (err) {
      console.error('❌ Failed to disable foreign key checks:', err.message);
      db.end();
      process.exit(1);
    }

    db.query('DROP TABLE IF EXISTS voting_records', (err) => {
      if (err) {
        console.error('❌ Failed to drop old table:', err.message);
        db.end();
        process.exit(1);
      }
      console.log('🗑️  Dropped old voting_records table');

      db.query('SET FOREIGN_KEY_CHECKS = 1', (err) => {
        if (err) {
          console.error('❌ Failed to re-enable foreign key checks:', err.message);
        }
        createTable();
      });
    });
  });

  function createTable() {

  const createTableQuery = `
    CREATE TABLE voting_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      politician_id INT NOT NULL,
      bill_title VARCHAR(500) NOT NULL,
      bill_number VARCHAR(100) NOT NULL,
      bill_description TEXT,
      vote_date DATE NOT NULL,
      category VARCHAR(50) NOT NULL,
      vote_value ENUM('for', 'against', 'abstain', 'absent') NOT NULL,
      reasoning TEXT,
      bill_status ENUM('Proposed', 'Under Review', 'Passed', 'Rejected', 'Withdrawn') DEFAULT 'Proposed',
      vote_count_for INT DEFAULT 0,
      vote_count_against INT DEFAULT 0,
      vote_count_abstain INT DEFAULT 0,
      total_votes INT DEFAULT 0,
      session_name VARCHAR(200),
      source_links JSON,
      hansard_reference VARCHAR(200),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE,
      INDEX idx_politician (politician_id),
      INDEX idx_vote_date (vote_date),
      INDEX idx_category (category),
      INDEX idx_vote_value (vote_value)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error('❌ Failed to create table:', err.message);
      db.end();
      process.exit(1);
    }

    console.log('✅ voting_records table created successfully');

    db.end();
    console.log('\n✅ Database setup complete!');
  });
  }
});
