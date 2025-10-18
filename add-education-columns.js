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

  // First check which columns already exist
  db.query('DESCRIBE politicians', (err, results) => {
    if (err) {
      console.error('❌ Failed to describe table:', err.message);
      db.end();
      process.exit(1);
    }

    const existingColumns = results.map(row => row.Field);
    const hasEducation = existingColumns.includes('education');
    const hasKeyAchievements = existingColumns.includes('key_achievements');

    console.log(`Checking existing columns...`);
    console.log(`  education: ${hasEducation ? '✓ exists' : '✗ missing'}`);
    console.log(`  key_achievements: ${hasKeyAchievements ? '✓ exists' : '✗ missing'}`);

    if (hasEducation && hasKeyAchievements) {
      console.log('\n✅ All columns already exist, no changes needed!');
      db.end();
      return;
    }

    // Build ALTER TABLE query for missing columns only
    const alterStatements = [];
    if (!hasEducation) {
      alterStatements.push('ADD COLUMN education TEXT DEFAULT NULL AFTER constituency');
    }
    if (!hasKeyAchievements) {
      const afterColumn = hasEducation ? 'education' : 'constituency';
      alterStatements.push(`ADD COLUMN key_achievements JSON DEFAULT NULL AFTER ${afterColumn}`);
    }

    const alterQuery = `ALTER TABLE politicians ${alterStatements.join(', ')}`;
    console.log(`\nExecuting: ${alterQuery}`);

    db.query(alterQuery, (err, result) => {
      if (err) {
        console.error('❌ Failed to add columns:', err.message);
        db.end();
        process.exit(1);
      }

      console.log('✅ Successfully added missing columns to politicians table');

      // Verify the columns were added
      db.query('DESCRIBE politicians', (err, results) => {
        if (err) {
          console.error('❌ Failed to describe table:', err.message);
        } else {
          console.log('\n📋 Updated politicians table structure:');
          results.forEach(row => {
            if (row.Field === 'education' || row.Field === 'key_achievements') {
              console.log(`  ✓ ${row.Field}: ${row.Type} ${row.Null === 'YES' ? '(nullable)' : '(not null)'}`);
            }
          });
        }

        db.end();
        console.log('\n✅ Database update complete!');
      });
    });
  });
});
