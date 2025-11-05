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

  // Add all missing columns to politician_news table
  const alterQueries = [
    'ALTER TABLE politician_news ADD COLUMN title VARCHAR(500)',
    'ALTER TABLE politician_news ADD COLUMN content TEXT',
    'ALTER TABLE politician_news ADD COLUMN icon VARCHAR(50)',
    'ALTER TABLE politician_news ADD COLUMN image_url VARCHAR(500)',
    'ALTER TABLE politician_news ADD COLUMN source VARCHAR(255)',
    'ALTER TABLE politician_news ADD COLUMN source_url VARCHAR(500)',
    'ALTER TABLE politician_news ADD COLUMN date DATE',
    'ALTER TABLE politician_news ADD COLUMN url VARCHAR(500)',
    'ALTER TABLE politician_news ADD COLUMN status VARCHAR(50) DEFAULT "published"'
  ];

  let completed = 0;
  let errors = [];

  alterQueries.forEach((query, index) => {
    db.query(query, (error) => {
      completed++;

      if (error && !error.message.includes('Duplicate column')) {
        console.error(`❌ Error on query ${index + 1}:`, error.message);
        errors.push(error);
      } else if (error && error.message.includes('Duplicate column')) {
        console.log(`ℹ️  Column already exists (query ${index + 1})`);
      } else {
        console.log(`✅ Query ${index + 1} completed successfully`);
      }

      if (completed === alterQueries.length) {
        db.end();
        if (errors.length === 0) {
          console.log('\n✅ All columns added successfully!');
        } else {
          console.log(`\n⚠️  Completed with ${errors.length} errors`);
        }
        process.exit(0);
      }
    });
  });
});
