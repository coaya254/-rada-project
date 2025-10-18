const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '!1754Swm.',
  database: 'rada_ke'
});

connection.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }

  const uuid = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';

  // Check what columns exist in users table related to avatar/image
  connection.query('DESCRIBE users', (err, columns) => {
    if (err) {
      console.error('Error describing users table:', err);
      connection.end();
      return;
    }

    console.log('=== USERS TABLE COLUMNS ===\n');
    const imageColumns = columns.filter(col =>
      col.Field.includes('avatar') ||
      col.Field.includes('image') ||
      col.Field.includes('photo') ||
      col.Field.includes('picture') ||
      col.Field.includes('emoji')
    );

    if (imageColumns.length > 0) {
      console.log('Image-related columns found:');
      imageColumns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    } else {
      console.log('No image-related columns found in users table');
    }

    console.log('\n=== CURRENT USER DATA ===\n');

    // Get current user's data
    connection.query(`SELECT nickname, emoji FROM users WHERE uuid = ?`, [uuid], (err, results) => {
      if (err) {
        console.error('Error fetching user:', err);
      } else if (results.length > 0) {
        console.log('User data:');
        console.log(`  Nickname: ${results[0].nickname}`);
        console.log(`  Emoji: ${results[0].emoji}`);
      } else {
        console.log('User not found');
      }

      connection.end();
    });
  });
});
