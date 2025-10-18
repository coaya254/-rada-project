const mysql = require('mysql2/promise');

async function checkDailyChallengesTables() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!1754Swm.',
    database: 'rada_ke'
  });

  try {
    console.log('\n=== CHECKING DAILY CHALLENGES TABLES ===\n');

    // Check for the actual table name used in backend
    const tablesToCheck = [
      'learning_daily_challenges',
      'daily_challenge_attempts',
      'user_daily_challenge_attempts'
    ];

    for (const tableName of tablesToCheck) {
      const [rows] = await conn.query(
        `SELECT COUNT(*) as count FROM information_schema.tables
         WHERE table_schema = 'rada_ke' AND table_name = ?`,
        [tableName]
      );

      const exists = rows[0].count > 0;

      if (exists) {
        const [countRows] = await conn.query(`SELECT COUNT(*) as total FROM ${tableName}`);
        const total = countRows[0].total;
        console.log(`✓ ${tableName.padEnd(40)} EXISTS (${total} rows)`);

        // Show structure
        const [cols] = await conn.query(`
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
          FROM information_schema.COLUMNS
          WHERE TABLE_SCHEMA = 'rada_ke' AND TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION
        `, [tableName]);

        console.log(`  Columns:`);
        cols.forEach(col => {
          console.log(`    - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
        });
        console.log('');
      } else {
        console.log(`✗ ${tableName.padEnd(40)} MISSING`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await conn.end();
  }
}

checkDailyChallengesTables();
