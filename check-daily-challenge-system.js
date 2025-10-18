const mysql = require('mysql2/promise');
const axios = require('axios');

async function checkDailyChallengeSystem() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!1754Swm.',
    database: 'rada_ke'
  });

  try {
    console.log('\n=== DAILY CHALLENGE SYSTEM ANALYSIS ===\n');

    // 1. Check database tables
    console.log('1. DATABASE TABLES:\n');

    const challengeTables = [
      'daily_challenges',
      'daily_challenge_questions',
      'daily_challenge_attempts',
      'user_daily_challenges'
    ];

    for (const tableName of challengeTables) {
      const [rows] = await conn.query(
        `SELECT COUNT(*) as count FROM information_schema.tables
         WHERE table_schema = 'rada_ke' AND table_name = ?`,
        [tableName]
      );

      const exists = rows[0].count > 0;

      if (exists) {
        const [countRows] = await conn.query(`SELECT COUNT(*) as total FROM ${tableName}`);
        const total = countRows[0].total;
        console.log(`   ✓ ${tableName.padEnd(35)} EXISTS (${total} rows)`);

        // Show structure
        const [cols] = await conn.query(`
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
          FROM information_schema.COLUMNS
          WHERE TABLE_SCHEMA = 'rada_ke' AND TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION
        `, [tableName]);

        console.log(`     Columns:`);
        cols.forEach(col => {
          const key = col.COLUMN_KEY ? ` [${col.COLUMN_KEY}]` : '';
          console.log(`       - ${col.COLUMN_NAME} (${col.DATA_TYPE})${key}`);
        });
        console.log('');
      } else {
        console.log(`   ✗ ${tableName.padEnd(35)} MISSING!`);
      }
    }

    // 2. Check backend API routes
    console.log('\n2. BACKEND API ROUTES:\n');

    const apiTests = [
      { name: 'Get Today Challenge', endpoint: '/api/learning/challenges/today' },
      { name: 'Submit Challenge Attempt', endpoint: '/api/learning/challenges/:id/attempt', method: 'POST' },
      { name: 'Get Challenge Leaderboard', endpoint: '/api/learning/challenges/:id/leaderboard' }
    ];

    console.log('   Expected API endpoints:');
    apiTests.forEach(api => {
      console.log(`   - ${api.method || 'GET'} ${api.endpoint}`);
    });

    // Try to fetch today's challenge
    console.log('\n   Testing API:');
    try {
      const response = await axios.get('http://localhost:3000/api/learning/challenges/today');
      console.log(`   ✓ GET /api/learning/challenges/today - ${response.status}`);
      console.log(`     Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (error) {
      if (error.response) {
        console.log(`   ✗ GET /api/learning/challenges/today - ${error.response.status}`);
        console.log(`     Error: ${error.response.data?.message || error.message}`);
      } else {
        console.log(`   ✗ GET /api/learning/challenges/today - No response`);
        console.log(`     Error: ${error.message}`);
      }
    }

    // 3. Check API Service methods
    console.log('\n3. FRONTEND API SERVICE:\n');

    const apiServiceMethods = [
      'getTodayChallenge()',
      'submitChallengeAttempt(challengeId, answers, timeSpent)',
      'getChallengeLeaderboard(challengeId, limit)'
    ];

    console.log('   Expected methods in LearningAPIService:');
    apiServiceMethods.forEach(method => {
      console.log(`   - ${method}`);
    });

    // 4. Check if admin panel exists
    console.log('\n4. ADMIN PANEL:\n');

    // Check if there's a challenges management screen
    const fs = require('fs');
    const path = require('path');

    const adminScreensPath = path.join(__dirname, 'RadaAppClean', 'src', 'screens', 'admin');

    if (fs.existsSync(adminScreensPath)) {
      const adminFiles = fs.readdirSync(adminScreensPath);
      const challengeAdminFiles = adminFiles.filter(f =>
        f.toLowerCase().includes('challenge') || f.toLowerCase().includes('daily')
      );

      if (challengeAdminFiles.length > 0) {
        console.log('   ✓ Admin screens found:');
        challengeAdminFiles.forEach(file => {
          console.log(`     - ${file}`);
        });
      } else {
        console.log('   ✗ No challenge admin screens found');
        console.log('   Available admin screens:');
        adminFiles.forEach(file => {
          console.log(`     - ${file}`);
        });
      }
    }

    // 5. Summary and recommendations
    console.log('\n5. SYSTEM STATUS & RECOMMENDATIONS:\n');

    // Check what's missing
    const missingComponents = [];

    const [dailyChallengesExists] = await conn.query(
      `SELECT COUNT(*) as count FROM information_schema.tables
       WHERE table_schema = 'rada_ke' AND table_name = 'daily_challenges'`
    );

    if (dailyChallengesExists[0].count === 0) {
      missingComponents.push('Database tables (daily_challenges, daily_challenge_questions, etc.)');
    }

    console.log('   Missing Components:');
    if (missingComponents.length > 0) {
      missingComponents.forEach(comp => {
        console.log(`   ✗ ${comp}`);
      });
    } else {
      console.log('   All components present!');
    }

    console.log('\n=== END ANALYSIS ===\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await conn.end();
  }
}

checkDailyChallengeSystem();
