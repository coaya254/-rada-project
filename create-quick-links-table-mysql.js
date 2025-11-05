const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'radamtaani'
});

console.log('Creating quick_links table...\n');

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }

  // Create quick_links table
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS quick_links (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      icon VARCHAR(50),
      order_index INT DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating quick_links table:', err);
      connection.end();
      process.exit(1);
    }

    console.log('✓ quick_links table created');

    // Insert default quick links
    const defaultLinks = [
      ['Parliament Website', 'https://www.parliament.go.ke', '🏛️', 1],
      ['County Governments', 'https://cog.go.ke', '🏘️', 2],
      ['IEBC Portal', 'https://www.iebc.or.ke', '🗳️', 3],
      ['Constitution of Kenya', 'http://www.kenyalaw.org/constitution/', '📜', 4],
      ['Kenya Law', 'http://www.kenyalaw.org', '⚖️', 5]
    ];

    const insertQuery = `
      INSERT INTO quick_links (title, url, icon, order_index)
      VALUES ?
      ON DUPLICATE KEY UPDATE title = title
    `;

    connection.query(insertQuery, [defaultLinks], (err) => {
      if (err) {
        console.error('Error inserting default links:', err);
      } else {
        console.log('✓ Default quick links inserted');
      }

      // Verify
      connection.query('SELECT * FROM quick_links ORDER BY order_index', (err, rows) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('\nQuick Links:');
          rows.forEach(row => {
            console.log(`  ${row.icon} ${row.title} - ${row.url}`);
          });
        }
        connection.end();
      });
    });
  });
});
