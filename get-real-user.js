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
  console.log('✅ Connected to MySQL database\n');
  getUser();
});

function getUser() {
  db.query('SELECT uuid, nickname, email FROM users LIMIT 1', (err, results) => {
    if (err) {
      console.error('❌ Error fetching user:', err);
      db.end();
      process.exit(1);
    }

    if (results.length === 0) {
      console.log('❌ No users found in database!');
      console.log('You need to create a user first.');
      db.end();
      process.exit(1);
    }

    console.log('📋 Found user:');
    console.log('UUID:', results[0].uuid);
    console.log('Nickname:', results[0].nickname);
    console.log('Email:', results[0].email);
    console.log('\n✅ Use this UUID in your test!');
    
    db.end();
    process.exit(0);
  });
}