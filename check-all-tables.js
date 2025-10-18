const mysql = require('mysql2/promise');

async function checkAllTables() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!1754Swm.',
    database: 'rada_ke'
  });

  try {
    console.log('\n=== CHECKING ALL REQUIRED TABLES ===\n');

    // List of required tables for XP, Streak, and Leaderboard systems
    const requiredTables = [
      'user_learning_progress',
      'user_xp_transactions',
      'user_learning_streaks',
      'user_learning_modules',
      'user_learning_lessons',
      'user_quiz_attempts',
      'learning_modules',
      'learning_lessons',
      'learning_quizzes',
      'learning_quiz_questions'
    ];

    console.log('1. Checking Table Existence:\n');

    for (const tableName of requiredTables) {
      const [rows] = await conn.query(
        `SELECT COUNT(*) as count FROM information_schema.tables
         WHERE table_schema = 'rada_ke' AND table_name = ?`,
        [tableName]
      );

      const exists = rows[0].count > 0;

      if (exists) {
        // Get row count
        const [countRows] = await conn.query(`SELECT COUNT(*) as total FROM ${tableName}`);
        const total = countRows[0].total;
        console.log(`   ✓ ${tableName.padEnd(30)} (${total} rows)`);
      } else {
        console.log(`   ✗ ${tableName.padEnd(30)} MISSING!`);
      }
    }

    console.log('\n2. Checking Table Structures:\n');

    // Check user_learning_progress structure
    const [progressCols] = await conn.query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = 'rada_ke' AND TABLE_NAME = 'user_learning_progress'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('   user_learning_progress columns:');
    progressCols.forEach(col => {
      console.log(`     - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    console.log('\n   user_xp_transactions columns:');
    const [xpCols] = await conn.query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = 'rada_ke' AND TABLE_NAME = 'user_xp_transactions'
      ORDER BY ORDINAL_POSITION
    `);
    xpCols.forEach(col => {
      console.log(`     - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    console.log('\n   user_learning_streaks columns:');
    const [streakCols] = await conn.query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = 'rada_ke' AND TABLE_NAME = 'user_learning_streaks'
      ORDER BY ORDINAL_POSITION
    `);
    streakCols.forEach(col => {
      console.log(`     - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    console.log('\n3. Sample Data Check:\n');

    // Check if we have sample data
    const [progressData] = await conn.query(`
      SELECT user_id, total_xp, level, lessons_completed, quizzes_passed
      FROM user_learning_progress
      LIMIT 3
    `);

    console.log('   user_learning_progress (sample):');
    if (progressData.length > 0) {
      progressData.forEach(row => {
        console.log(`     User ${row.user_id}: ${row.total_xp} XP, Level ${row.level}, ${row.lessons_completed} lessons, ${row.quizzes_passed} quizzes`);
      });
    } else {
      console.log('     No data');
    }

    const [streakData] = await conn.query(`
      SELECT user_id, current_streak, longest_streak, last_activity_date
      FROM user_learning_streaks
      LIMIT 3
    `);

    console.log('\n   user_learning_streaks (sample):');
    if (streakData.length > 0) {
      streakData.forEach(row => {
        console.log(`     User ${row.user_id}: ${row.current_streak} day streak (longest: ${row.longest_streak}), last active: ${row.last_activity_date}`);
      });
    } else {
      console.log('     No data');
    }

    const [xpData] = await conn.query(`
      SELECT user_id, source_type, amount, description, created_at
      FROM user_xp_transactions
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('\n   user_xp_transactions (recent):');
    if (xpData.length > 0) {
      xpData.forEach(row => {
        const date = row.created_at.toISOString().split('T')[0];
        console.log(`     User ${row.user_id}: +${row.amount} XP from ${row.source_type} (${row.description}) - ${date}`);
      });
    } else {
      console.log('     No data');
    }

    console.log('\n=== TABLE CHECK COMPLETE ===\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await conn.end();
  }
}

checkAllTables();
