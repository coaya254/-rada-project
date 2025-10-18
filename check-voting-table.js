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

  db.query('DESCRIBE voting_records', (err, results) => {
    if (err) {
      console.error('❌ Error describing table:', err.message);
      db.end();
      process.exit(1);
    }

    console.log('\n📋 voting_records table structure:');
    console.table(results);

    db.end();
  });
});
