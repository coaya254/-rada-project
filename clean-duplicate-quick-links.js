const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'radamtaani'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }

  console.log('Connected to database\n');

  // Keep only the oldest entry for each unique title
  const query = `
    DELETE t1 FROM quick_links t1
    INNER JOIN quick_links t2
    WHERE t1.id > t2.id
    AND t1.title = t2.title
    AND t1.url = t2.url
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error cleaning duplicates:', err);
      db.end();
      process.exit(1);
    }

    console.log(`✓ Removed ${result.affectedRows} duplicate entries\n`);

    // Show remaining quick links
    db.query('SELECT * FROM quick_links ORDER BY order_index ASC', (err, rows) => {
      if (err) {
        console.error('Error fetching quick links:', err);
      } else {
        console.log('Current Quick Links:');
        rows.forEach(link => {
          console.log(`  ${link.icon} ${link.title} - ${link.url}`);
        });
      }

      db.end();
    });
  });
});
