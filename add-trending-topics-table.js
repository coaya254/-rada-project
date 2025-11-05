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

  // Create trending_topics table
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS trending_topics (
      id INT PRIMARY KEY AUTO_INCREMENT,
      emoji VARCHAR(10) NOT NULL,
      text VARCHAR(255) NOT NULL,
      display_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  connection.query(createTableQuery, (error) => {
    if (error) {
      console.error('❌ Error creating table:', error);
      connection.end();
      process.exit(1);
    }

    console.log('✅ trending_topics table created successfully');

    // Insert default trending topics
    const insertQuery = `
      INSERT INTO trending_topics (emoji, text, display_order, is_active) VALUES
      ('🔥', 'Infrastructure Updates', 0, 1),
      ('⚡', 'Live Hearings', 1, 1),
      ('🌱', 'Climate Policy', 2, 1),
      ('🔒', 'Digital Privacy', 3, 1)
    `;

    connection.query(insertQuery, (error, results) => {
      if (error) {
        console.error('❌ Error inserting default data:', error);
      } else {
        console.log(`✅ Inserted ${results.affectedRows} default trending topics`);
      }

      connection.end();
      console.log('✅ Done!');
    });
  });
});
