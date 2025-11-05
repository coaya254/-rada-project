const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_mtaani'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  console.log('✅ Connected to database');

  const migrations = [
    {
      name: 'Add constituency fields to politicians',
      sql: `ALTER TABLE politicians
            ADD COLUMN IF NOT EXISTS constituency_representation TEXT,
            ADD COLUMN IF NOT EXISTS constituency_focus_areas TEXT`
    },
    {
      name: 'Create politician_parties table',
      sql: `CREATE TABLE IF NOT EXISTS politician_parties (
        id INT PRIMARY KEY AUTO_INCREMENT,
        politician_id INT NOT NULL,
        party_name VARCHAR(200) NOT NULL,
        start_date DATE,
        end_date DATE NULL,
        analysis TEXT,
        is_current BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE
      )`
    },
    {
      name: 'Create politician_achievements table',
      sql: `CREATE TABLE IF NOT EXISTS politician_achievements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        politician_id INT NOT NULL,
        title VARCHAR(300) NOT NULL,
        description TEXT,
        achievement_date DATE,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE
      )`
    },
    {
      name: 'Create sources table',
      sql: `CREATE TABLE IF NOT EXISTS sources (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        default_url VARCHAR(500),
        color VARCHAR(50) DEFAULT 'blue',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    }
  ];

  let completed = 0;
  let errors = [];

  migrations.forEach((migration, index) => {
    db.query(migration.sql, (error) => {
      completed++;

      if (error && !error.message.includes('Duplicate column') && !error.message.includes('already exists')) {
        console.error(`❌ ${migration.name}:`, error.message);
        errors.push(error);
      } else if (error) {
        console.log(`ℹ️  ${migration.name}: Already exists`);
      } else {
        console.log(`✅ ${migration.name}: Success`);
      }

      if (completed === migrations.length) {
        // Insert default sources
        const sourcesData = [
          ['KBC', 'https://www.kbc.co.ke', 'red'],
          ['NTV', 'https://www.ntv.co.ke', 'blue'],
          ['CNN', 'https://www.cnn.com', 'red'],
          ['BBC', 'https://www.bbc.com', 'black'],
          ['Citizen TV', 'https://www.citizen.digital', 'orange'],
          ['Nation', 'https://nation.africa', 'blue'],
          ['Standard', 'https://www.standardmedia.co.ke', 'maroon'],
          ['Hansard', 'https://www.parliament.go.ke', 'green'],
          ['Parliament', 'https://www.parliament.go.ke', 'green']
        ];

        sourcesData.forEach((source, i) => {
          db.query(
            'INSERT IGNORE INTO sources (name, default_url, color) VALUES (?, ?, ?)',
            source,
            (err) => {
              if (i === sourcesData.length - 1) {
                db.end();
                if (errors.length === 0) {
                  console.log('\n✅ All migrations completed successfully!');
                  console.log('✅ Default sources added!');
                } else {
                  console.log(`\n⚠️  Completed with ${errors.length} errors`);
                }
                process.exit(0);
              }
            }
          );
        });
      }
    });
  });
});
