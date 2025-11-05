const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'rada_ke',
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Check if about_page table exists
connection.query('SHOW TABLES LIKE "about_page"', (error, results) => {
  if (error) {
    console.error('❌ Error checking table:', error);
    connection.end();
    process.exit(1);
  }

  if (results.length > 0) {
    console.log('✅ about_page table EXISTS!');

    // Show table structure
    connection.query('DESCRIBE about_page', (err, columns) => {
      if (err) {
        console.error('❌ Error describing table:', err);
      } else {
        console.log('\n📋 Table structure:');
        console.table(columns);
      }

      // Check if there's any data
      connection.query('SELECT COUNT(*) as count FROM about_page', (err, countResults) => {
        if (err) {
          console.error('❌ Error checking data:', err);
        } else {
          console.log(`\n📊 Rows in table: ${countResults[0].count}`);
        }
        connection.end();
      });
    });
  } else {
    console.log('❌ about_page table DOES NOT EXIST');
    connection.end();
  }
});
