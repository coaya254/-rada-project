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

  // Get all tables
  connection.query('SHOW TABLES', (err, tables) => {
    if (err) {
      console.error('Error fetching tables:', err);
      connection.end();
      return;
    }

    console.log('=== DATABASE TABLES ===\n');

    const tableNames = tables.map(t => Object.values(t)[0]);

    // Look for profile/user related tables
    const profileTables = tableNames.filter(t =>
      t.includes('user') || t.includes('profile') || t.includes('account')
    );

    if (profileTables.length === 0) {
      console.log('No profile-related tables found.');
      console.log('\nAll tables:', tableNames.join(', '));
      connection.end();
      return;
    }

    let completed = 0;
    profileTables.forEach(tableName => {
      connection.query(`DESCRIBE ${tableName}`, (err, columns) => {
        if (err) {
          console.error(`Error describing ${tableName}:`, err);
        } else {
          console.log(`\n📊 TABLE: ${tableName}`);
          console.log('─'.repeat(80));
          columns.forEach(col => {
            const nullable = col.Null === 'YES' ? '(optional)' : '(required)';
            const key = col.Key ? `[${col.Key}]` : '';
            console.log(`  • ${col.Field.padEnd(30)} ${col.Type.padEnd(20)} ${nullable.padEnd(12)} ${key}`);
          });
        }

        completed++;
        if (completed === profileTables.length) {
          connection.end();
        }
      });
    });
  });
});
