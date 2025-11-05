const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'polihub.db');
const db = new sqlite3.Database(dbPath);

console.log('Creating quick_links table...\n');

db.serialize(() => {
  // Create quick_links table
  db.run(`
    CREATE TABLE IF NOT EXISTS quick_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT,
      order_index INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating quick_links table:', err);
    } else {
      console.log('✓ quick_links table created');
    }
  });

  // Insert default quick links
  const defaultLinks = [
    { title: 'Parliament Website', url: 'https://www.parliament.go.ke', icon: '🏛️', order_index: 1 },
    { title: 'County Governments', url: 'https://cog.go.ke', icon: '🏘️', order_index: 2 },
    { title: 'IEBC Portal', url: 'https://www.iebc.or.ke', icon: '🗳️', order_index: 3 },
    { title: 'Constitution of Kenya', url: 'http://www.kenyalaw.org/constitution/', icon: '📜', order_index: 4 }
  ];

  const stmt = db.prepare(`
    INSERT INTO quick_links (title, url, icon, order_index)
    VALUES (?, ?, ?, ?)
  `);

  defaultLinks.forEach(link => {
    stmt.run(link.title, link.url, link.icon, link.order_index);
  });

  stmt.finalize((err) => {
    if (err) {
      console.error('Error inserting default links:', err);
    } else {
      console.log('✓ Default quick links inserted');
    }
  });

  // Verify
  db.all('SELECT * FROM quick_links', (err, rows) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('\nQuick Links:');
      rows.forEach(row => {
        console.log(`  ${row.icon} ${row.title} - ${row.url}`);
      });
    }
    db.close();
  });
});
