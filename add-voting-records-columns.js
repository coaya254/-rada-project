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

  // Check which columns already exist
  db.query('DESCRIBE voting_records', (err, results) => {
    if (err) {
      console.error('❌ Failed to describe table:', err.message);
      db.end();
      process.exit(1);
    }

    const existingColumns = results.map(row => row.Field);
    const hasSignificance = existingColumns.includes('significance');
    const hasVerificationLinks = existingColumns.includes('verification_links');

    console.log(`\nChecking existing columns...`);
    console.log(`  significance: ${hasSignificance ? '✓ exists' : '✗ missing'}`);
    console.log(`  verification_links: ${hasVerificationLinks ? '✓ exists' : '✗ missing'}`);

    if (hasSignificance && hasVerificationLinks) {
      console.log('\n✅ All columns already exist, no changes needed!');
      db.end();
      return;
    }

    // Build ALTER TABLE query for missing columns only
    const alterStatements = [];
    if (!hasSignificance) {
      alterStatements.push('ADD COLUMN significance TEXT DEFAULT NULL AFTER bill_description');
    }
    if (!hasVerificationLinks) {
      alterStatements.push('ADD COLUMN verification_links JSON DEFAULT NULL AFTER source_links');
    }

    const alterQuery = `ALTER TABLE voting_records ${alterStatements.join(', ')}`;
    console.log(`\n🔧 Executing:\n${alterQuery}\n`);

    db.query(alterQuery, (err, result) => {
      if (err) {
        console.error('❌ Failed to add columns:', err.message);
        db.end();
        process.exit(1);
      }

      console.log('✅ Successfully added missing columns to voting_records table');

      // Verify the columns were added
      db.query('DESCRIBE voting_records', (err, results) => {
        if (err) {
          console.error('❌ Failed to verify:', err.message);
        } else {
          console.log('\n📋 Updated voting_records table structure:');
          results.forEach(row => {
            const marker = (row.Field === 'significance' || row.Field === 'verification_links') ? '✨' : '  ';
            console.log(`${marker} ${row.Field}: ${row.Type}`);
          });
        }

        db.end();
        console.log('\n✅ Database update complete!');
      });
    });
  });
});
