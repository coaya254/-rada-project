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

  // Add missing career-related columns to politicians table
  const alterQueries = [
    // Stats fields
    `ALTER TABLE politicians ADD COLUMN years_in_office INT DEFAULT 0 AFTER party_color`,
    `ALTER TABLE politicians ADD COLUMN age INT DEFAULT NULL AFTER years_in_office`,

    // Contact information fields
    `ALTER TABLE politicians ADD COLUMN email VARCHAR(255) DEFAULT NULL AFTER age`,
    `ALTER TABLE politicians ADD COLUMN phone VARCHAR(50) DEFAULT NULL AFTER email`,
    `ALTER TABLE politicians ADD COLUMN website VARCHAR(500) DEFAULT NULL AFTER phone`,
    `ALTER TABLE politicians ADD COLUMN social_media_twitter VARCHAR(255) DEFAULT NULL AFTER website`,

    // Source verification fields (JSON)
    `ALTER TABLE politicians ADD COLUMN education_sources JSON DEFAULT NULL AFTER social_media_twitter`,
    `ALTER TABLE politicians ADD COLUMN achievements_sources JSON DEFAULT NULL AFTER education_sources`,
    `ALTER TABLE politicians ADD COLUMN position_sources JSON DEFAULT NULL AFTER achievements_sources`
  ];

  let completed = 0;
  let errors = 0;

  alterQueries.forEach((query, index) => {
    db.query(query, (err) => {
      completed++;

      if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  Column already exists (query ${index + 1})`);
        } else {
          console.error(`❌ Error executing query ${index + 1}:`, err.message);
          errors++;
        }
      } else {
        console.log(`✅ Successfully executed query ${index + 1}`);
      }

      // Check if all queries are complete
      if (completed === alterQueries.length) {
        console.log('\n📋 Showing updated politicians table structure:');
        db.query('DESCRIBE politicians', (err, results) => {
          if (err) {
            console.error('❌ Error describing table:', err.message);
          } else {
            console.table(results);
          }

          db.end();

          if (errors > 0) {
            console.log(`\n⚠️  Migration completed with ${errors} error(s)`);
            process.exit(1);
          } else {
            console.log('\n✅ Migration complete - all columns added successfully');
            process.exit(0);
          }
        });
      }
    });
  });
});
