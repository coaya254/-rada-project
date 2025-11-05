const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_mtaani'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database');

  // Check if source column already exists
  const checkColumn = `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'politician_documents'
    AND COLUMN_NAME = 'source'
  `;

  db.query(checkColumn, (error, results) => {
    if (error) {
      console.error('❌ Error checking column:', error);
      db.end();
      process.exit(1);
    }

    if (results.length > 0) {
      console.log('ℹ️  Source column already exists');
      db.end();
      console.log('\n✅ Migration complete! You can use the source field for documents.');
      process.exit(0);
    } else {
      // Add source column to politician_documents table
      const addSourceColumn = `
        ALTER TABLE politician_documents
        ADD COLUMN source VARCHAR(255) NULL AFTER category_color
      `;

      db.query(addSourceColumn, (error) => {
        if (error) {
          console.error('❌ Error adding source column:', error);
        } else {
          console.log('✅ Source column added to politician_documents table');
        }

        db.end();
        console.log('\n✅ Migration complete! You can now use the source field for documents.');
        process.exit(0);
      });
    }
  });
});
