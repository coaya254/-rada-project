const mysql = require('mysql2');
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '!1754Swm.',
  database: 'rada_ke'
});

conn.connect();

conn.query('ALTER TABLE news ADD COLUMN icon VARCHAR(50) NULL DEFAULT "📰" AFTER description', (e1) => {
  if (e1 && e1.code !== 'ER_DUP_FIELDNAME') console.log('❌ Icon error:', e1.message);
  else console.log('✅ Icon added to news');

  conn.query('ALTER TABLE news ADD COLUMN source_url VARCHAR(1000) NULL AFTER source', (e2) => {
    if (e2 && e2.code !== 'ER_DUP_FIELDNAME') console.log('❌ Source URL error:', e2.message);
    else console.log('✅ Source URL added to news');

    console.log('\n✨ News table updated!');
    conn.end();
  });
});
