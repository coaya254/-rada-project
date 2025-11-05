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
  console.log('✅ Connected to MySQL Database');

  // First check what tables we have
  connection.query("SHOW TABLES LIKE '%news%'", (error, tables) => {
    if (error) {
      console.error('❌ Error:', error);
      connection.end();
      return;
    }

    console.log('\n📋 News-related tables found:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Check if 'news' table exists, otherwise use politician_news
    const tableName = tables.some(t => Object.values(t)[0] === 'news') ? 'news' : 'politician_news';

    console.log(`\n🔧 Working with table: ${tableName}`);

    // Check current structure
    connection.query(`SHOW COLUMNS FROM ${tableName}`, (error, columns) => {
      if (error) {
        console.error('❌ Error checking columns:', error);
        connection.end();
        return;
      }

      console.log('\n📊 Current table structure:');
      const existingColumns = [];
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
        existingColumns.push(col.Field);
      });

      // Prepare ALTER TABLE statements
      const updates = [];

      if (!existingColumns.includes('category')) {
        updates.push({
          name: 'category',
          sql: `ALTER TABLE ${tableName} ADD COLUMN category VARCHAR(100) NULL`
        });
      }

      if (!existingColumns.includes('source_links')) {
        updates.push({
          name: 'source_links',
          sql: `ALTER TABLE ${tableName} ADD COLUMN source_links JSON NULL`
        });
      }

      if (!existingColumns.includes('credibility')) {
        updates.push({
          name: 'credibility',
          sql: `ALTER TABLE ${tableName} ADD COLUMN credibility ENUM('high', 'medium', 'low') DEFAULT 'medium'`
        });
      }

      if (updates.length === 0) {
        console.log('\n✅ All columns already exist!');
        connection.end();
        return;
      }

      console.log(`\n🔄 Adding ${updates.length} missing columns...\n`);

      let completed = 0;
      updates.forEach((update) => {
        connection.query(update.sql, (error) => {
          if (error) {
            console.error(`❌ Error adding ${update.name}:`, error.message);
          } else {
            console.log(`✅ Added column: ${update.name}`);
          }

          completed++;
          if (completed === updates.length) {
            console.log('\n📝 Example of how to use multiple sources:');
            console.log(`
UPDATE ${tableName} SET
  category = 'Infrastructure',
  credibility = 'high',
  source_links = JSON_OBJECT(
    'KTN', 'https://ktn.co.ke/article1',
    'NTV', 'https://ntv.co.ke/article1',
    'KBC', 'https://kbc.co.ke/article1'
  )
WHERE id = 1;
            `);
            connection.end();
          }
        });
      });
    });
  });
});
