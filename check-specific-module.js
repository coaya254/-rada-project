const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkModule42() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'rada_ke'
  });

  console.log('=== MODULE 42 DETAILS ===');
  const [module] = await connection.query(`
    SELECT * FROM learning_modules WHERE id = 42
  `);
  console.table(module);

  console.log('\n=== LESSONS FOR MODULE 42 ===');
  const [lessons] = await connection.query(`
    SELECT id, title, module_id, is_published, display_order
    FROM learning_lessons
    WHERE module_id = 42
    ORDER BY display_order
  `);
  console.table(lessons);

  console.log('\n=== API QUERY RESULT (simulating what API returns) ===');
  const [apiResult] = await connection.query(`
    SELECT
      m.*,
      COUNT(DISTINCT l.id) as total_lessons
    FROM learning_modules m
    LEFT JOIN learning_lessons l ON m.id = l.module_id
    WHERE m.id = 42 AND m.is_published = true
    GROUP BY m.id
  `);
  console.table(apiResult);

  await connection.end();
}

checkModule42().catch(console.error);
