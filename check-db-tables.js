// Quick script to check database tables
const mysql = require('mysql2/promise');

async function checkDatabase() {
  let connection;
  try {
    // Connect with provided password
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '!1754Swm.',
      database: 'rada_ke'
    });

    console.log('✅ Connected to database successfully\n');

    // Get all learning tables
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'learning_%'
    `);

    console.log('📊 LEARNING TABLES FOUND:', tables.length);
    console.log('─────────────────────────────────');
    tables.forEach((row, i) => {
      console.log(`${i + 1}. ${Object.values(row)[0]}`);
    });

    // Check each table's row count
    console.log('\n📈 TABLE ROW COUNTS:');
    console.log('─────────────────────────────────');
    for (const row of tables) {
      const tableName = Object.values(row)[0];
      const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`${tableName.padEnd(35)} ${countResult[0].count} rows`);
    }

    // Get modules details
    console.log('\n🎓 LEARNING MODULES:');
    console.log('─────────────────────────────────');
    const [modules] = await connection.execute(`
      SELECT id, title, category, status, is_featured, created_at
      FROM learning_modules
      ORDER BY created_at DESC
      LIMIT 20
    `);
    modules.forEach(m => {
      console.log(`ID ${m.id}: ${m.title} [${m.category}] - ${m.status} ${m.is_featured ? '⭐' : ''}`);
    });

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n⚠️  Access denied. Please provide the correct MySQL password.');
      console.log('💡 You can set it in server.js or provide it here.');
    }
  } finally {
    if (connection) await connection.end();
  }
}

checkDatabase();
