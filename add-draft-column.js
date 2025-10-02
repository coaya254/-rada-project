const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'rada_db'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    process.exit(1);
  }

  console.log('✅ Connected to database');

  // Check if is_draft column exists
  db.query(
    "SHOW COLUMNS FROM politicians LIKE 'is_draft'",
    (err, results) => {
      if (err) {
        console.error('❌ Error checking column:', err);
        db.end();
        process.exit(1);
      }

      if (results.length > 0) {
        console.log('✅ is_draft column already exists');
        db.end();
        process.exit(0);
      }

      // Add is_draft column
      db.query(
        'ALTER TABLE politicians ADD COLUMN is_draft TINYINT(1) DEFAULT 0',
        (err) => {
          if (err) {
            console.error('❌ Error adding column:', err);
            db.end();
            process.exit(1);
          }

          console.log('✅ Successfully added is_draft column to politicians table');
          db.end();
          process.exit(0);
        }
      );
    }
  );
});
