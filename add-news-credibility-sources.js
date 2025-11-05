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

  // Add credibility and sources columns to politician_news table
  const alterQueries = [
    {
      sql: "ALTER TABLE politician_news ADD COLUMN credibility VARCHAR(20) DEFAULT 'medium'",
      desc: "Adding credibility column"
    },
    {
      sql: "ALTER TABLE politician_news ADD COLUMN sources JSON NULL",
      desc: "Adding sources column (JSON array)"
    }
  ];

  let completed = 0;
  let errors = [];

  alterQueries.forEach((query, index) => {
    db.query(query.sql, (error) => {
      completed++;

      if (error && !error.message.includes('Duplicate column')) {
        console.error(`❌ Error on ${query.desc}:`, error.message);
        errors.push(error);
      } else if (error && error.message.includes('Duplicate column')) {
        console.log(`ℹ️  Column already exists (${query.desc})`);
      } else {
        console.log(`✅ ${query.desc} completed successfully`);
      }

      if (completed === alterQueries.length) {
        db.end();
        if (errors.length === 0) {
          console.log('\n✅ All columns added successfully!');
          console.log('\n📝 Next step: Update backend API to save credibility and sources fields');
        } else {
          console.log(`\n⚠️  Completed with ${errors.length} errors`);
        }
        process.exit(0);
      }
    });
  });
});
