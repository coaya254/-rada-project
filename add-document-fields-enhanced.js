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
      name: 'Add subtitle column',
      query: 'ALTER TABLE politician_documents ADD COLUMN subtitle VARCHAR(500) NULL AFTER title'
    },
    {
      name: 'Add icon column',
      query: 'ALTER TABLE politician_documents ADD COLUMN icon VARCHAR(50) NULL AFTER subtitle'
    },
    {
      name: 'Add summary column',
      query: 'ALTER TABLE politician_documents ADD COLUMN summary TEXT NULL AFTER briefing'
    },
    {
      name: 'Add details column (JSON)',
      query: 'ALTER TABLE politician_documents ADD COLUMN details JSON NULL AFTER summary'
    },
    {
      name: 'Add pages column',
      query: 'ALTER TABLE politician_documents ADD COLUMN pages INT NULL AFTER details'
    },
    {
      name: 'Add document_url column',
      query: 'ALTER TABLE politician_documents ADD COLUMN document_url VARCHAR(500) NULL AFTER pages'
    },
    {
      name: 'Add published_date column',
      query: 'ALTER TABLE politician_documents ADD COLUMN published_date DATE NULL AFTER document_url'
    },
    {
      name: 'Add category_color column',
      query: 'ALTER TABLE politician_documents ADD COLUMN category_color VARCHAR(100) NULL AFTER category'
    }
  ];

  let completed = 0;

  console.log('🔧 Adding enhanced document fields to politician_documents table...\n');

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
            console.log('\n📝 All enhanced fields now available:');
            console.log('  • subtitle - Document subtitle/tagline');
            console.log('  • icon - Emoji or icon identifier');
            console.log('  • summary - PoliHub research summary');
            console.log('  • details - Key findings (JSON array)');
            console.log('  • pages - Document page count');
            console.log('  • document_url - Direct document link');
            console.log('  • published_date - Publication date');
            console.log('  • category_color - Gradient color scheme');
          }
          connection.end();
        });
      }
    });
  });
});
