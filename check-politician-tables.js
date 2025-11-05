const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_ke'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL Database\n');

  const tables = [
    'politician_documents',
    'politician_timeline',
    'politician_commitments',
    'politician_voting_records'
  ];

  let completed = 0;

  tables.forEach(table => {
    connection.query(`SHOW COLUMNS FROM ${table}`, (error, columns) => {
      if (error) {
        console.error(`❌ Error checking ${table}:`, error.message);
      } else {
        console.log(`📊 Table: ${table}`);
        columns.forEach(col => {
          console.log(`  - ${col.Field} (${col.Type})`);
        });
        console.log('');
      }

      completed++;
      if (completed === tables.length) {
        connection.end();
      }
    });
  });
});
