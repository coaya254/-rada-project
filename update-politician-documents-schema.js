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

  const updates = [
    {
      name: 'Add image_url column',
      query: 'ALTER TABLE politician_documents ADD COLUMN image_url VARCHAR(500) NULL AFTER description'
    },
    {
      name: 'Add thumbnail_url column',
      query: 'ALTER TABLE politician_documents ADD COLUMN thumbnail_url VARCHAR(500) NULL AFTER image_url'
    },
    {
      name: 'Add briefing column',
      query: 'ALTER TABLE politician_documents ADD COLUMN briefing TEXT NULL AFTER thumbnail_url'
    },
    {
      name: 'Add category column',
      query: 'ALTER TABLE politician_documents ADD COLUMN category VARCHAR(100) NULL AFTER briefing'
    },
    {
      name: 'Add tags column (JSON)',
      query: 'ALTER TABLE politician_documents ADD COLUMN tags JSON NULL AFTER category'
    },
    {
      name: 'Add source_links column (JSON)',
      query: 'ALTER TABLE politician_documents ADD COLUMN source_links JSON NULL AFTER tags'
    }
  ];

  let completed = 0;

  console.log('🔧 Updating politician_documents table schema...\n');

  updates.forEach(update => {
    connection.query(update.query, (error) => {
      if (error) {
        // Column already exists - that's fine
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  ${update.name}: Already exists (skipped)`);
        } else {
          console.error(`❌ ${update.name}: ${error.message}`);
        }
      } else {
        console.log(`✅ ${update.name}`);
      }

      completed++;
      if (completed === updates.length) {
        console.log('\n📊 Verifying final schema...\n');

        connection.query('SHOW COLUMNS FROM politician_documents', (error, columns) => {
          if (error) {
            console.error('❌ Error fetching schema:', error.message);
          } else {
            console.log('📋 Current politician_documents table structure:');
            columns.forEach(col => {
              console.log(`  - ${col.Field} (${col.Type})`);
            });
            console.log('\n✨ Schema update completed successfully!');
            console.log('\n📝 New research-focused fields available:');
            console.log('  • image_url/thumbnail_url - Document image/thumbnail');
            console.log('  • briefing - Quick overview (PoliHub summary)');
            console.log('  • category - Document category (Healthcare, Education, etc.)');
            console.log('  • tags - Research topics (JSON array)');
            console.log('  • source_links - Multiple sources (JSON object)');
          }
          connection.end();
        });
      }
    });
  });
});
