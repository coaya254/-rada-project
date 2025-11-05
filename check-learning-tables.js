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

  connection.query("SHOW TABLES LIKE 'learning%'", (error, results) => {
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('📊 Learning tables:');
      results.forEach(row => {
        console.log('  -', Object.values(row)[0]);
      });
    }
    connection.end();
  });
});
