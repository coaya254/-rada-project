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
    // Fix image_url size issue - increase from 500 to 1000
    {
      name: 'Increase image_url size for politicians',
      query: 'ALTER TABLE politicians MODIFY COLUMN image_url VARCHAR(1000) NULL'
    },
    // Add image_source field for copyright attribution
    {
      name: 'Add image_source for copyright',
      query: 'ALTER TABLE politicians ADD COLUMN image_source VARCHAR(500) NULL AFTER image_url'
    },
    // Update chamber enum to Kenya-specific values
    {
      name: 'Update chamber enum to Kenya parliament structure',
      query: `ALTER TABLE politicians MODIFY COLUMN chamber ENUM('National Assembly','Senate','Governor','Cabinet','Executive','County Assembly','County') NULL`
    },
    // Add county field (Kenya equivalent of state)
    {
      name: 'Add county field',
      query: 'ALTER TABLE politicians ADD COLUMN county VARCHAR(100) NULL AFTER district'
    }
  ];

  let completed = 0;
  const results = [];

  console.log('🔧 Updating politicians table for Kenya-specific fields...\n');

  updates.forEach(update => {
    connection.query(update.query, (error) => {
      if (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  ${update.name}: Already exists (skipped)`);
          results.push({ name: update.name, status: 'exists' });
        } else {
          console.error(`❌ ${update.name}: ${error.message}`);
          results.push({ name: update.name, status: 'error', error: error.message });
        }
      } else {
        console.log(`✅ ${update.name}`);
        results.push({ name: update.name, status: 'success' });
      }

      completed++;
      if (completed === updates.length) {
        console.log('\n📊 Verifying politicians table schema...\n');

        connection.query('SHOW COLUMNS FROM politicians WHERE Field IN ("image_url", "image_source", "chamber", "county")', (error, columns) => {
          if (error) {
            console.error('❌ Error checking schema:', error.message);
          } else {
            console.log('Updated fields:');
            columns.forEach(col => {
              console.log(`  - ${col.Field} (${col.Type})`);
            });
            console.log('');
          }

          console.log('\n✨ Politicians table updated successfully!');
          console.log('\n📝 Summary:');
          const success = results.filter(r => r.status === 'success').length;
          const exists = results.filter(r => r.status === 'exists').length;
          const errors = results.filter(r => r.status === 'error').length;
          console.log(`  ✅ Success: ${success} updates`);
          console.log(`  ⚠️  Existed: ${exists} updates`);
          if (errors > 0) console.log(`  ❌ Errors: ${errors} updates`);

          connection.end();
        });
      }
    });
  });
});
