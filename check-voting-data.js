// Check what voting records actually contain
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
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');
});

// Check voting records
db.query('SELECT id, politician_id, bill_name, vote, vote_date FROM politician_voting_records LIMIT 5', (err, records) => {
  if (err) {
    console.error('❌ Error fetching voting records:', err.message);
  } else {
    console.log('📊 Sample Voting Records:\n');
    if (records.length === 0) {
      console.log('  No voting records found');
    } else {
      records.forEach(r => {
        console.log(`  ID: ${r.id}`);
        console.log(`  Politician ID: ${r.politician_id}`);
        console.log(`  Bill Name: ${r.bill_name || 'NULL'}`);
        console.log(`  Vote: ${r.vote}`);
        console.log(`  Date: ${r.vote_date}`);
        console.log('  ---');
      });
    }
  }

  // Check if bill_title column exists
  db.query('DESCRIBE politician_voting_records', (err, columns) => {
    if (!err) {
      const hasBillTitle = columns.some(c => c.Field === 'bill_title');
      const hasBillName = columns.some(c => c.Field === 'bill_name');

      console.log(`\n📋 Voting Records Columns Check:`);
      console.log(`  bill_name: ${hasBillName ? '✅ EXISTS' : '❌ MISSING'}`);
      console.log(`  bill_title: ${hasBillTitle ? '✅ EXISTS' : '❌ MISSING'}`);

      if (!hasBillTitle && hasBillName) {
        console.log(`\n⚠️  ISSUE: Frontend expects 'bill_title' but only 'bill_name' exists`);
        console.log(`   Solution: Run 'node fix-voting-records-column.js'`);
      }
    }

    db.end();
  });
});
