// Create blog_featured_author table
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'rada_ke'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  console.log('✅ Connected to database');

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS blog_featured_author (
      id INT PRIMARY KEY DEFAULT 1,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255),
      bio TEXT,
      profile_image VARCHAR(500),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT chk_single_row CHECK (id = 1)
    )
  `;

  db.query(createTableQuery, (error) => {
    if (error) {
      console.error('❌ Error creating table:', error);
      db.end();
      process.exit(1);
    }

    console.log('✅ blog_featured_author table created successfully');

    // Insert default featured author
    const insertDefault = `
      INSERT INTO blog_featured_author (id, name, title, bio)
      VALUES (1, 'Sarah Chen', 'Policy Analyst', 'Expert in infrastructure policy with 10+ years covering federal legislation and local impact.')
      ON DUPLICATE KEY UPDATE id = id
    `;

    db.query(insertDefault, (err) => {
      if (err) {
        console.error('❌ Error inserting default:', err);
      } else {
        console.log('✅ Default featured author set to Sarah Chen');
      }

      db.end();
      console.log('✅ Done! Backend server will now have featured author endpoints.');
    });
  });
});
