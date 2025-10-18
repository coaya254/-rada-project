const mysql = require('mysql2/promise');

async function checkXPSystem() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!1754Swm.',
    database: 'rada_ke'
  });

  try {
    console.log('\n=== XP & PROGRESS SYSTEM CHECK ===\n');

    // Check user progress table
    const [progress] = await conn.query('SELECT * FROM user_learning_progress WHERE user_id = 1');
    console.log('User Progress:');
    if (progress.length > 0) {
      console.log(`  Total XP: ${progress[0].total_xp}`);
      console.log(`  Level: ${progress[0].level}`);
      console.log(`  Lessons Completed: ${progress[0].lessons_completed}`);
      console.log(`  Quizzes Passed: ${progress[0].quizzes_passed}`);
      console.log(`  Hours Spent: ${progress[0].hours_spent}`);
    } else {
      console.log('  ❌ No progress record found for user 1');
    }

    // Check XP transactions
    const [transactions] = await conn.query(`
      SELECT * FROM user_xp_transactions
      WHERE user_id = 1
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.log('\nRecent XP Transactions:');
    if (transactions.length > 0) {
      transactions.forEach(t => {
        console.log(`  ${t.created_at.toISOString().split('T')[0]} - ${t.amount} XP from ${t.source_type} (${t.description})`);
      });
    } else {
      console.log('  ❌ No XP transactions found');
    }

    // Check streak
    const [streak] = await conn.query('SELECT * FROM user_learning_streaks WHERE user_id = 1');
    console.log('\nStreak:');
    if (streak.length > 0) {
      console.log(`  Current Streak: ${streak[0].current_streak} days`);
      console.log(`  Longest Streak: ${streak[0].longest_streak} days`);
      console.log(`  Last Activity: ${streak[0].last_activity_date}`);
    } else {
      console.log('  ❌ No streak record found');
    }

    // Check leaderboard
    const [leaderboard] = await conn.query(`
      SELECT
        ulp.user_id,
        ulp.total_xp,
        ulp.level,
        uls.current_streak,
        @rank := @rank + 1 as rank
      FROM user_learning_progress ulp
      LEFT JOIN user_learning_streaks uls ON ulp.user_id = uls.user_id
      CROSS JOIN (SELECT @rank := 0) r
      WHERE ulp.total_xp > 0
      ORDER BY ulp.total_xp DESC
      LIMIT 10
    `);
    console.log('\nLeaderboard (Top 10):');
    if (leaderboard.length > 0) {
      leaderboard.forEach(u => {
        console.log(`  #${u.rank} - User ${u.user_id}: ${u.total_xp} XP (Level ${u.level}, ${u.current_streak || 0} day streak)`);
      });
    } else {
      console.log('  ❌ No leaderboard data');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await conn.end();
  }
}

checkXPSystem();
