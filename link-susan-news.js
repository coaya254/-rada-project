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

  // Get the latest 2 news articles
  connection.query("SELECT id, title FROM news ORDER BY id DESC LIMIT 2", (error, news) => {
    if (error) {
      console.error('❌ Error fetching news:', error);
      connection.end();
      return;
    }

    console.log('\n📰 Found news articles:');
    news.forEach(item => console.log(`  - ${item.title} (ID: ${item.id})`));

    let linked = 0;
    news.forEach(item => {
      connection.query(
        'INSERT IGNORE INTO politician_news (politician_id, news_id) VALUES (20, ?)',
        [item.id],
        (linkError) => {
          if (linkError) {
            console.error(`❌ Error linking news ${item.id}:`, linkError.message);
          } else {
            console.log(`✅ Linked news ID ${item.id} to Susan Siili`);
          }

          linked++;
          if (linked === news.length) {
            console.log('\n✨ All news articles linked successfully!');
            connection.end();
          }
        }
      );
    });
  });
});
