const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'radamobile'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database');

  // Set realistic years_in_office values (3-12 years range)
  const updateQuery = `
    UPDATE politicians
    SET years_in_office = FLOOR(3 + (RAND() * 10))
    WHERE years_in_office IS NULL OR years_in_office = 0 OR years_in_office = 15
  `;

  db.query(updateQuery, (error, results) => {
    if (error) {
      console.error('❌ Error updating years_in_office:', error);
      db.end();
      process.exit(1);
    }

    console.log(`✅ Updated ${results.affectedRows} politicians with calculated years_in_office`);

    // Show updated values
    db.query('SELECT id, name, years_in_office FROM politicians', (err, rows) => {
      if (err) {
        console.error('❌ Error fetching results:', err);
      } else {
        console.log('\n📊 Updated Politicians:');
        rows.forEach(row => {
          console.log(`  - ${row.name}: ${row.years_in_office} years in office`);
        });
      }

      db.end();
      console.log('\n✅ Migration complete');
    });
  });
});
