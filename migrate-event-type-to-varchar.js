const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'rada_ke'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Connected to database');

  // Alter the column from ENUM to VARCHAR to support custom event types
  const alterQuery = `
    ALTER TABLE timeline_events
    MODIFY event_type VARCHAR(50) NOT NULL DEFAULT 'event'
  `;

  db.query(alterQuery, (err, result) => {
    if (err) {
      console.error('❌ Migration failed:', err.message);
      db.end();
      process.exit(1);
    }

    console.log('✅ Successfully migrated event_type column from ENUM to VARCHAR(50)');
    console.log('✅ Custom event types are now supported');

    db.end();
    console.log('\n✅ Migration complete!');
  });
});
