const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'radamtaani'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }

  console.log('Connected to database\n');
  console.log('CHECKING POLITICIAN-RELATED TABLES:\n');

  const tables = [
    'politicians',
    'politician_documents',
    'politician_news',
    'politician_timeline',
    'politician_commitments',
    'politician_voting_records',
    'voting_records',
    'politician_parties',
    'politician_achievements'
  ];

  let checked = 0;

  tables.forEach(tableName => {
    db.query(`SHOW TABLES LIKE '${tableName}'`, (err, results) => {
      if (err) {
        console.error(`Error checking ${tableName}:`, err.message);
      } else if (results.length > 0) {
        console.log(`✅ ${tableName} - EXISTS`);
      } else {
        console.log(`❌ ${tableName} - MISSING`);
      }

      checked++;
      if (checked === tables.length) {
        console.log('\nDone checking tables.');
        db.end();
      }
    });
  });
});
