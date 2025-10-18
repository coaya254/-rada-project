const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'rada_ke'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL Database');

  // First, check current ENUM values
  const checkQuery = `
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'rada_ke'
    AND TABLE_NAME = 'voting_records'
    AND COLUMN_NAME = 'vote_value'
  `;

  db.query(checkQuery, (err, results) => {
    if (err) {
      console.error('❌ Error checking ENUM:', err);
      db.end();
      process.exit(1);
    }

    if (results.length > 0) {
      console.log('📋 Current vote_value type:', results[0].COLUMN_TYPE);
    }

    // Update existing 'yes' to 'for' and 'no' to 'against'
    console.log('🔄 Updating existing vote values...');

    const updateQueries = [
      "UPDATE voting_records SET vote_value = 'for' WHERE vote_value = 'yes'",
      "UPDATE voting_records SET vote_value = 'against' WHERE vote_value = 'no'"
    ];

    let completed = 0;
    updateQueries.forEach((query) => {
      db.query(query, (err, result) => {
        if (err) {
          console.error('❌ Error updating values:', err);
        } else {
          console.log(`✅ Updated ${result.affectedRows} records`);
        }
        completed++;

        if (completed === updateQueries.length) {
          // Now alter the ENUM
          console.log('🔧 Altering ENUM to accept new values...');

          const alterQuery = `
            ALTER TABLE voting_records
            MODIFY COLUMN vote_value ENUM('for', 'against', 'abstain', 'absent') NOT NULL
          `;

          db.query(alterQuery, (err, result) => {
            if (err) {
              console.error('❌ Error altering ENUM:', err);
              db.end();
              process.exit(1);
            }

            console.log('✅ Successfully updated vote_value ENUM');
            console.log('📋 New values: for, against, abstain, absent');

            // Verify the change
            db.query(checkQuery, (err, results) => {
              if (err) {
                console.error('❌ Error verifying change:', err);
              } else if (results.length > 0) {
                console.log('✅ Verified new type:', results[0].COLUMN_TYPE);
              }

              db.end();
              console.log('✅ Migration complete!');
            });
          });
        }
      });
    });
  });
});
