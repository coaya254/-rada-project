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
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Connected to MySQL Database');

  const createAuditLogTable = `
    CREATE TABLE IF NOT EXISTS audit_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      user_email VARCHAR(255) NULL,
      action VARCHAR(50) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INT NULL,
      entity_name VARCHAR(255) NULL,
      details TEXT NULL,
      ip_address VARCHAR(45) NULL,
      user_agent TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      INDEX idx_action (action),
      INDEX idx_entity (entity_type, entity_id),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  db.query(createAuditLogTable, (err) => {
    if (err) {
      console.error('❌ Error creating audit_log table:', err);
      db.end();
      process.exit(1);
    }

    console.log('✅ Audit log table created successfully');

    // Verify table structure
    db.query('DESCRIBE audit_log', (err, results) => {
      if (err) {
        console.error('❌ Error describing table:', err);
      } else {
        console.log('\n📋 Audit log table structure:');
        console.table(results);
      }

      db.end();
      console.log('\n✅ Audit log system ready!');
    });
  });
});
