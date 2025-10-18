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

  // Add bill_passed column
  const addColumnQuery = `
    ALTER TABLE voting_records
    ADD COLUMN bill_passed BOOLEAN DEFAULT NULL AFTER bill_status
  `;

  db.query(addColumnQuery, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Column bill_passed already exists');
      } else {
        console.error('❌ Error adding column:', err.message);
        db.end();
        process.exit(1);
      }
    } else {
      console.log('✅ Successfully added bill_passed column');
    }

    // Show updated table structure
    db.query('DESCRIBE voting_records', (err, results) => {
      if (err) {
        console.error('❌ Error describing table:', err.message);
        db.end();
        process.exit(1);
      }

      console.log('\n📋 Updated voting_records table structure:');
      console.table(results);

      db.end();
      console.log('\n✅ Migration complete');
    });
  });
});
