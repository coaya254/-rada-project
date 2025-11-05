const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'radamtaani'
});

console.log('Checking Source System Tables...\n');

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }

  // Check for source-related tables
  db.query("SHOW TABLES LIKE '%source%'", (err, tables) => {
    if (err) {
      console.error('Error:', err);
      db.end();
      return;
    }

    console.log('📊 Source-Related Tables:');
    console.log('========================');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  ✓ ${tableName}`);
    });

    // Check sources table structure
    console.log('\n📋 Sources Table Structure:');
    console.log('===========================');
    db.query('DESCRIBE sources', (err, columns) => {
      if (err) {
        console.error('Error:', err);
      } else {
        columns.forEach(col => {
          console.log(`  ${col.Field}: ${col.Type}${col.Null === 'NO' ? ' NOT NULL' : ''}`);
        });
      }

      // Check sample sources
      console.log('\n📌 Sample Sources:');
      console.log('==================');
      db.query('SELECT id, name, default_url, button_color FROM sources LIMIT 10', (err, sources) => {
        if (err) {
          console.error('Error:', err);
        } else {
          sources.forEach(src => {
            console.log(`  ${src.id}. ${src.name}`);
            console.log(`     URL: ${src.default_url || 'N/A'}`);
            console.log(`     Color: ${src.button_color || 'N/A'}`);
          });
        }

        // Check association tables
        console.log('\n🔗 Checking Association Tables:');
        console.log('===============================');

        const associationTables = [
          'document_sources',
          'news_sources',
          'politician_timeline_sources',
          'voting_records_sources',
          'politician_promises_sources',
          'politician_achievements_sources',
          'politician_parties_sources'
        ];

        let checked = 0;
        associationTables.forEach(tableName => {
          db.query(`SHOW TABLES LIKE '${tableName}'`, (err, result) => {
            if (result && result.length > 0) {
              db.query(`DESCRIBE ${tableName}`, (err, cols) => {
                if (!err) {
                  console.log(`\n  ✓ ${tableName}:`);
                  cols.forEach(col => {
                    console.log(`    - ${col.Field}: ${col.Type}`);
                  });
                }
              });
            } else {
              console.log(`  ✗ ${tableName} (does not exist)`);
            }

            checked++;
            if (checked === associationTables.length) {
              db.end();
            }
          });
        });
      });
    });
  });
});
