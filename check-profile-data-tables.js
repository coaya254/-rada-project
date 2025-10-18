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

  console.log('=== CHECKING PROFILE DATA TABLES ===\n');

  // Get all tables
  connection.query('SHOW TABLES', (err, tables) => {
    if (err) {
      console.error('Error fetching tables:', err);
      connection.end();
      return;
    }

    const tableNames = tables.map(t => Object.values(t)[0]);

    // Look for discussion/post/bookmark/activity/xp related tables
    const relevantTables = tableNames.filter(t =>
      t.includes('discussion') ||
      t.includes('post') ||
      t.includes('bookmark') ||
      t.includes('saved') ||
      t.includes('activity') ||
      t.includes('xp') ||
      t.includes('transaction') ||
      t.includes('community')
    );

    console.log('Relevant tables found:', relevantTables.length);
    console.log('─'.repeat(80), '\n');

    if (relevantTables.length === 0) {
      console.log('No relevant tables found.');
      console.log('\nAll tables:', tableNames.join(', '));
      connection.end();
      return;
    }

    let completed = 0;
    relevantTables.forEach(tableName => {
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

          // Get sample count
          connection.query(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
            if (!err) {
              console.log(`\n  📈 Total Records: ${result[0].count}`);
            }

            completed++;
            if (completed === relevantTables.length) {
              connection.end();
            }
          });
        }
      });
    });
  });
});
