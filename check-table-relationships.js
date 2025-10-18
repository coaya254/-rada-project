const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '!1754Swm.',
  database: 'rada_ke'
});

connection.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }

  console.log('=== CHECKING TABLE RELATIONSHIPS ===\n');

  // Check how community_posts relates to users
  connection.query('DESCRIBE community_posts', (err, columns) => {
    if (err) {
      console.error('Error describing community_posts:', err);
      connection.end();
      return;
    }

    console.log('📊 COMMUNITY_POSTS TABLE:');
    console.log('─'.repeat(80));

    const userColumns = columns.filter(col =>
      col.Field.includes('author') ||
      col.Field.includes('user') ||
      col.Field.includes('uuid')
    );

    userColumns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type}) - ${col.Key ? `[${col.Key}]` : ''}`);
    });

    // Check discussions table
    connection.query('DESCRIBE discussions', (err, columns) => {
      if (err) {
        console.error('Error describing discussions:', err);
        connection.end();
        return;
      }

      console.log('\n📊 DISCUSSIONS TABLE:');
      console.log('─'.repeat(80));

      const userColumns = columns.filter(col =>
        col.Field.includes('author') ||
        col.Field.includes('user') ||
        col.Field.includes('uuid')
      );

      userColumns.forEach(col => {
        console.log(`  ${col.Field} (${col.Type}) - ${col.Key ? `[${col.Key}]` : ''}`);
      });

      // Check posts table
      connection.query('DESCRIBE posts', (err, columns) => {
        if (err) {
          console.error('Error describing posts:', err);
          connection.end();
          return;
        }

        console.log('\n📊 POSTS TABLE:');
        console.log('─'.repeat(80));

        const userColumns = columns.filter(col =>
          col.Field.includes('author') ||
          col.Field.includes('user') ||
          col.Field.includes('uuid')
        );

        userColumns.forEach(col => {
          console.log(`  ${col.Field} (${col.Type}) - ${col.Key ? `[${col.Key}]` : ''}`);
        });

        // Now check which tables have actual data and their user connections
        console.log('\n\n=== DATA CHECK ===\n');

        connection.query('SELECT COUNT(*) as count FROM community_posts', (err, result) => {
          console.log(`Community Posts: ${result[0].count} records`);

          if (result[0].count > 0) {
            connection.query('SELECT id, author_id, title FROM community_posts LIMIT 3', (err, posts) => {
              console.log('Sample community_posts:');
              posts.forEach(p => console.log(`  - ID: ${p.id}, Author ID: ${p.author_id}, Title: ${p.title}`));
            });
          }
        });

        connection.query('SELECT COUNT(*) as count FROM discussions', (err, result) => {
          console.log(`Discussions: ${result[0].count} records`);

          if (result[0].count > 0) {
            connection.query('SELECT id, uuid, title FROM discussions LIMIT 3', (err, discussions) => {
              console.log('Sample discussions:');
              discussions.forEach(d => console.log(`  - ID: ${d.id}, UUID: ${d.uuid}, Title: ${d.title}`));
            });
          }
        });

        connection.query('SELECT COUNT(*) as count FROM posts', (err, result) => {
          console.log(`Posts: ${result[0].count} records`);

          if (result[0].count > 0) {
            connection.query('SELECT id, uuid, title FROM posts LIMIT 3', (err, posts) => {
              console.log('Sample posts:');
              posts.forEach(p => console.log(`  - ID: ${p.id}, UUID: ${p.uuid}, Title: ${p.title}`));
            });
          }

          setTimeout(() => {
            console.log('\n\n=== CHECKING USER ID vs UUID ===\n');

            // Check what the user table uses
            connection.query('SELECT id, uuid, nickname FROM users WHERE uuid = "bdcc72dc-d14a-461b-bbe8-c1407a06f14d"', (err, user) => {
              if (user && user.length > 0) {
                console.log(`Test User (Jay):`);
                console.log(`  - Internal ID: ${user[0].id}`);
                console.log(`  - UUID: ${user[0].uuid}`);
                console.log(`  - Nickname: ${user[0].nickname}`);

                // Check if community_posts uses user_id or uuid
                connection.query(`SELECT COUNT(*) as count FROM community_posts WHERE author_id = ${user[0].id}`, (err, result) => {
                  console.log(`\n  Community posts by user ID (${user[0].id}): ${result[0].count}`);
                });

                // Check if discussions uses uuid
                connection.query(`SELECT COUNT(*) as count FROM discussions WHERE uuid = "${user[0].uuid}"`, (err, result) => {
                  console.log(`  Discussions by UUID: ${result[0].count}`);

                  setTimeout(() => connection.end(), 500);
                });
              } else {
                connection.end();
              }
            });
          }, 500);
        });
      });
    });
  });
});
