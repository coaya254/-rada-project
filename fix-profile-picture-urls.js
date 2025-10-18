const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '!1754Swm.',
  database: 'rada_ke'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');

  console.log('🔍 Checking for profile pictures with wrong port...\n');

  // Find all users with port 5001 in their emoji field
  const checkQuery = `
    SELECT uuid, nickname, emoji
    FROM users
    WHERE emoji LIKE '%5001%'
  `;

  db.query(checkQuery, (err, users) => {
    if (err) {
      console.error('❌ Error:', err.message);
      db.end();
      process.exit(1);
    }

    if (users.length === 0) {
      console.log('✅ No users with port 5001 URLs found.');
      db.end();
      process.exit(0);
    }

    console.log(`Found ${users.length} users with incorrect URLs:\n`);
    users.forEach(user => {
      console.log(`  - ${user.nickname} (${user.uuid})`);
      console.log(`    Current: ${user.emoji}`);
      console.log(`    Should be: ${user.emoji.replace(':5001', ':3000')}\n`);
    });

    // Update the URLs
    const updateQuery = `
      UPDATE users
      SET emoji = REPLACE(emoji, ':5001', ':3000')
      WHERE emoji LIKE '%5001%'
    `;

    console.log('🔧 Updating URLs to use port 3000...\n');

    db.query(updateQuery, (err, result) => {
      if (err) {
        console.error('❌ Error updating:', err.message);
        db.end();
        process.exit(1);
      }

      console.log(`✅ Updated ${result.affectedRows} users`);
      console.log('✅ Profile picture URLs fixed!\n');

      // Verify the changes
      db.query('SELECT uuid, nickname, emoji FROM users WHERE emoji LIKE "%uploads%"', (err, updated) => {
        if (err) {
          console.error('❌ Error verifying:', err.message);
        } else {
          console.log('📋 Verified URLs:\n');
          updated.forEach(user => {
            console.log(`  ✅ ${user.nickname}: ${user.emoji}\n`);
          });
        }

        db.end();
        process.exit(0);
      });
    });
  });
});
