const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '!1754Swm.',
  database: 'rada_ke'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }

  console.log('Connected to database...');

  connection.query('UPDATE learning_lessons SET is_published = 1 WHERE is_published = 0', (error, results) => {
    if (error) {
      console.error('Error updating lessons:', error);
      connection.end();
      process.exit(1);
    }

    console.log(`✅ Successfully published ${results.affectedRows} lessons`);

    // Verify the update
    connection.query('SELECT COUNT(*) as total_published FROM learning_lessons WHERE is_published = 1', (err, rows) => {
      if (err) {
        console.error('Error verifying update:', err);
      } else {
        console.log(`📚 Total published lessons: ${rows[0].total_published}`);
      }

      connection.end();
      console.log('Done!');
    });
  });
});
