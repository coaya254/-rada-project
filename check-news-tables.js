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
  console.log('📋 Searching for news-related tables...\n');

  connection.query('SHOW TABLES', (error, results) => {
    if (error) {
      console.error('❌ Error:', error.message);
      connection.end();
      return;
    }

    const tables = results.map(r => Object.values(r)[0]);
    const newsTables = tables.filter(t => t.toLowerCase().includes('news'));

    console.log('Tables containing "news":');
    newsTables.forEach(table => {
      console.log(`  📌 ${table}`);
    });

    console.log('\n🔍 Checking structure of each news table...\n');

    let checked = 0;
    newsTables.forEach(table => {
      connection.query(`SHOW COLUMNS FROM ${table}`, (err, columns) => {
        if (!err) {
          console.log(`\n📋 ${table} structure:`);
          columns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type})`);
          });
        }

        checked++;
        if (checked === newsTables.length) {
          connection.end();
        }
      });
    });
  });
});
