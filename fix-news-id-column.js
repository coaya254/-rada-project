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

  // Make news_id nullable since we're storing news data directly in this table
  const alterQuery = 'ALTER TABLE politician_news MODIFY COLUMN news_id INT NULL';

  db.query(alterQuery, (error) => {
    if (error) {
      console.error('❌ Error modifying news_id column:', error);
    } else {
      console.log('✅ news_id column is now nullable');
    }

    db.end();
    console.log('\n✅ Migration complete!');
    process.exit(0);
  });
});
