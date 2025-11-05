// Fix voting records table - add bill_title column
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
  console.log('✅ Connected to database');
});

// Check current structure
db.query('DESCRIBE politician_voting_records', (err, results) => {
  if (err) {
    console.error('❌ Table may not exist:', err.message);
    db.end();
    return;
  }

  console.log('\n📋 Current politician_voting_records columns:');
  results.forEach(col => {
    console.log(`  - ${col.Field} (${col.Type})`);
  });

  // Check if bill_title exists
  const hasBillTitle = results.some(col => col.Field === 'bill_title');
  const hasBillName = results.some(col => col.Field === 'bill_name');

  console.log(`\n✓ Has bill_name: ${hasBillName}`);
  console.log(`✓ Has bill_title: ${hasBillTitle}`);

  if (!hasBillTitle && hasBillName) {
    // Add bill_title as alias or copy bill_name to bill_title
    db.query('ALTER TABLE politician_voting_records ADD COLUMN bill_title VARCHAR(255) AFTER bill_name', (error) => {
      if (error && error.code !== 'ER_DUP_FIELDNAME') {
        console.error('❌ Error adding bill_title column:', error.message);
      } else {
        console.log('✅ bill_title column added');

        // Copy bill_name to bill_title for existing records
        db.query('UPDATE politician_voting_records SET bill_title = bill_name WHERE bill_title IS NULL', (updateErr) => {
          if (updateErr) {
            console.error('❌ Error copying data:', updateErr.message);
          } else {
            console.log('✅ Copied bill_name to bill_title for existing records');
          }
          db.end();
        });
      }
    });
  } else if (hasBillTitle && !hasBillName) {
    // Add bill_name as alias or copy bill_title to bill_name
    db.query('ALTER TABLE politician_voting_records ADD COLUMN bill_name VARCHAR(255) AFTER politician_id', (error) => {
      if (error && error.code !== 'ER_DUP_FIELDNAME') {
        console.error('❌ Error adding bill_name column:', error.message);
      } else {
        console.log('✅ bill_name column added');

        // Copy bill_title to bill_name for existing records
        db.query('UPDATE politician_voting_records SET bill_name = bill_title WHERE bill_name IS NULL', (updateErr) => {
          if (updateErr) {
            console.error('❌ Error copying data:', updateErr.message);
          } else {
            console.log('✅ Copied bill_title to bill_name for existing records');
          }
          db.end();
        });
      }
    });
  } else {
    console.log('\n✅ Both columns exist, no changes needed');
    db.end();
  }
});
