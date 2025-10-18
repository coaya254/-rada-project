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

  // First get current table structure
  db.query('DESCRIBE politicians', (err, results) => {
    if (err) {
      console.error('❌ Failed to describe table:', err.message);
      db.end();
      process.exit(1);
    }

    const existingColumns = results.map(row => row.Field);
    console.log('\n📋 Current columns in politicians table:');
    existingColumns.forEach(col => console.log(`  - ${col}`));

    // Define all columns that should exist based on the API route
    const requiredColumns = {
      'constituency': 'VARCHAR(255) DEFAULT NULL',
      'education': 'TEXT DEFAULT NULL',
      'party_history': 'JSON DEFAULT NULL',
      'key_achievements': 'JSON DEFAULT NULL',
      'wikipedia_summary': 'TEXT DEFAULT NULL',
      'current_position': 'VARCHAR(255) DEFAULT NULL',
      'title': 'VARCHAR(255) DEFAULT NULL',
      'slug': 'VARCHAR(255) DEFAULT NULL',
      'party_color': 'VARCHAR(50) DEFAULT NULL'
    };

    // Find missing columns
    const missingColumns = [];
    for (const [columnName, columnDef] of Object.entries(requiredColumns)) {
      if (!existingColumns.includes(columnName)) {
        missingColumns.push({ name: columnName, def: columnDef });
      }
    }

    if (missingColumns.length === 0) {
      console.log('\n✅ All required columns already exist!');
      db.end();
      return;
    }

    console.log('\n❌ Missing columns:');
    missingColumns.forEach(col => console.log(`  - ${col.name} (${col.def})`));

    // Build ALTER TABLE statement
    const alterStatements = missingColumns.map(col => `ADD COLUMN ${col.name} ${col.def}`);
    const alterQuery = `ALTER TABLE politicians ${alterStatements.join(', ')}`;

    console.log(`\n🔧 Executing:\n${alterQuery}\n`);

    db.query(alterQuery, (err, result) => {
      if (err) {
        console.error('❌ Failed to add columns:', err.message);
        db.end();
        process.exit(1);
      }

      console.log('✅ Successfully added all missing columns!');

      // Verify the columns were added
      db.query('DESCRIBE politicians', (err, results) => {
        if (err) {
          console.error('❌ Failed to verify:', err.message);
        } else {
          console.log('\n📋 Updated politicians table structure:');
          results.forEach(row => {
            const marker = missingColumns.some(c => c.name === row.Field) ? '✨' : '  ';
            console.log(`${marker} ${row.Field}: ${row.Type}`);
          });
        }

        db.end();
        console.log('\n✅ Database update complete!');
      });
    });
  });
});
