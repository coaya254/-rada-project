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

  db.query('DESCRIBE politician_news', (error, results) => {
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('\n📋 politician_news table schema:');
      console.log(results);
    }

    db.end();
    process.exit(0);
  });
});
