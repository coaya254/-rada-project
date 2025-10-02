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

  // Add is_draft column to politicians table
  const query = `
    ALTER TABLE politicians
    ADD COLUMN is_draft TINYINT(1) DEFAULT 0 AFTER image_url
  `;

  db.query(query, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Column is_draft already exists');
      } else {
        console.error('❌ Error adding column:', err);
        db.end();
        process.exit(1);
      }
    } else {
      console.log('✅ Successfully added is_draft column to politicians table');
    }

    // Verify the column was added
    db.query('DESCRIBE politicians', (err, results) => {
      if (err) {
        console.error('❌ Error describing table:', err);
      } else {
        console.log('\n📋 Politicians table structure:');
        console.table(results);
      }

      db.end();
      console.log('\n✅ Database migration complete');
    });
  });
});
