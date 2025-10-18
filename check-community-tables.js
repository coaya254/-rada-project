const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'radake'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database');
  checkTables();
});

function checkTables() {
  // Get all tables
  db.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('❌ Error fetching tables:', err);
      db.end();
      process.exit(1);
    }

    console.log('\n📊 ALL TABLES IN DATABASE:');
    console.log('================================');
    results.forEach((row, index) => {
      const tableName = Object.values(row)[0];
      console.log(`${index + 1}. ${tableName}`);
    });

    // Check specifically for community tables
    const allTables = results.map(row => Object.values(row)[0]);
    const communityTables = allTables.filter(table => 
      table.toLowerCase().includes('community') || 
      table.toLowerCase().includes('discussion')
    );

    console.log('\n🔍 COMMUNITY-RELATED TABLES:');
    console.log('================================');
    if (communityTables.length > 0) {
      communityTables.forEach((table, index) => {
        console.log(`${index + 1}. ${table} ⚠️ (Already exists!)`);
      });
      
      // Show structure of each community table
      let checked = 0;
      communityTables.forEach(table => {
        db.query(`DESCRIBE ${table}`, (err, columns) => {
          if (!err) {
            console.log(`\n📋 Structure of ${table}:`);
            columns.forEach(col => {
              console.log(`   - ${col.Field}: ${col.Type}`);
            });
          }
          checked++;
          if (checked === communityTables.length) {
            db.end();
            process.exit(0);
          }
        });
      });
    } else {
      console.log('No community tables found. Safe to create new ones! ✅');
      db.end();
      process.exit(0);
    }
  });
}