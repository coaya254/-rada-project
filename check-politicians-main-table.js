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

  connection.query('SHOW COLUMNS FROM politicians', (error, columns) => {
    if (error) {
      console.error('❌ Error checking politicians table:', error.message);
    } else {
      console.log('📊 Table: politicians');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
      console.log('');
    }
    connection.end();
  });
});
