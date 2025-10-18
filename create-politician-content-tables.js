const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_ke'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  console.log('✅ Connected to MySQL Database');

  // Create commitments table
  const commitmentsTable = `
    CREATE TABLE IF NOT EXISTS commitments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      politician_id INT NOT NULL,
      promise TEXT NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      context TEXT,
      date_made DATE NOT NULL,
      status ENUM('no_evidence', 'early_progress', 'significant_progress', 'completed', 'stalled') DEFAULT 'no_evidence',
      progress_percentage INT DEFAULT 0,
      evidence TEXT,
      last_activity_date DATE,
      source_links JSON,
      verification_links JSON,
      related_actions JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE,
      INDEX idx_politician (politician_id),
      INDEX idx_status (status),
      INDEX idx_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  // Create timeline_events table
  const timelineTable = `
    CREATE TABLE IF NOT EXISTS timeline_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      politician_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      event_date DATE NOT NULL,
      event_type ENUM('position', 'achievement', 'controversy', 'legislation', 'event') NOT NULL,
      source_links JSON,
      verification_links JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE,
      INDEX idx_politician (politician_id),
      INDEX idx_date (event_date),
      INDEX idx_type (event_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  // Create voting_records table
  const votingTable = `
    CREATE TABLE IF NOT EXISTS voting_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      politician_id INT NOT NULL,
      bill_name VARCHAR(255) NOT NULL,
      bill_description TEXT,
      vote ENUM('yes', 'no', 'abstain', 'absent') NOT NULL,
      vote_date DATE NOT NULL,
      category VARCHAR(100),
      significance TEXT,
      source_links JSON,
      verification_links JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE,
      INDEX idx_politician (politician_id),
      INDEX idx_date (vote_date),
      INDEX idx_vote (vote)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  // Create documents table
  const documentsTable = `
    CREATE TABLE IF NOT EXISTS documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      politician_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      document_date DATE NOT NULL,
      document_type ENUM('speech', 'policy', 'parliamentary') NOT NULL,
      source VARCHAR(255),
      key_quotes JSON,
      summary TEXT,
      source_links JSON,
      verification_links JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE,
      INDEX idx_politician (politician_id),
      INDEX idx_date (document_date),
      INDEX idx_type (document_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  // Execute table creation in sequence
  console.log('\n📊 Creating database tables...\n');

  db.query(commitmentsTable, (err) => {
    if (err) {
      console.error('❌ Error creating commitments table:', err);
    } else {
      console.log('✅ Commitments table created/verified');
    }

    db.query(timelineTable, (err) => {
      if (err) {
        console.error('❌ Error creating timeline_events table:', err);
      } else {
        console.log('✅ Timeline events table created/verified');
      }

      db.query(votingTable, (err) => {
        if (err) {
          console.error('❌ Error creating voting_records table:', err);
        } else {
          console.log('✅ Voting records table created/verified');
        }

        db.query(documentsTable, (err) => {
          if (err) {
            console.error('❌ Error creating documents table:', err);
          } else {
            console.log('✅ Documents table created/verified');
          }

          // Verify tables were created
          db.query('SHOW TABLES', (err, results) => {
            if (err) {
              console.error('❌ Error listing tables:', err);
            } else {
              console.log('\n📋 Database tables:');
              console.table(results);
            }

            db.end();
            console.log('\n✅ Database migration complete!\n');
          });
        });
      });
    });
  });
});
