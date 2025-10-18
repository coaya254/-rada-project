const mysql = require('mysql2/promise');

async function checkModules() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!1754Swm.',
    database: 'rada_ke'
  });

  try {
    const [modules] = await conn.query('SELECT id, title, is_featured, is_published, status FROM learning_modules ORDER BY id');
    console.log('Total modules:', modules.length);
    console.log('\nModules:');
    modules.forEach(m => {
      console.log(`  ID ${m.id}: ${m.title}`);
      console.log(`    Featured: ${m.is_featured}, Published: ${m.is_published}, Status: ${m.status}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await conn.end();
  }
}

checkModules();
