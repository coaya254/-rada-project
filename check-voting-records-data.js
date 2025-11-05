const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'radamtaani'
});

console.log('Checking Voting Records Data...\n');

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }

  // Check voting_records table
  db.query('SELECT politician_id, COUNT(*) as count FROM voting_records GROUP BY politician_id', (err, results) => {
    if (err) {
      console.error('Error:', err);
      db.end();
      return;
    }

    console.log('Voting Records by Politician:');
    console.log('==============================');
    results.forEach(row => {
      console.log(`Politician ID ${row.politician_id}: ${row.count} voting records`);
    });

    // Get detailed records for politician 1 (likely the test politician)
    console.log('\n\nDetailed Voting Records for Politician ID 1:');
    console.log('=============================================');
    db.query('SELECT id, bill_title, vote_value, vote_date FROM voting_records WHERE politician_id = 1', (err, votes) => {
      if (err) {
        console.error('Error:', err);
      } else if (votes.length === 0) {
        console.log('No voting records found for politician 1');
      } else {
        votes.forEach(vote => {
          console.log(`  ID: ${vote.id}`);
          console.log(`  Bill: ${vote.bill_title}`);
          console.log(`  Vote: ${vote.vote_value}`);
          console.log(`  Date: ${vote.vote_date}`);
          console.log('');
        });
      }

      db.end();
    });
  });
});
