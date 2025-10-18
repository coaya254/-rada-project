const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkLessons() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'rada_ke'
  });

  console.log('=== MODULES WITH LESSON COUNTS ===');
  const [modules] = await connection.query(`
    SELECT
      m.id,
      m.title,
      COUNT(l.id) as lesson_count,
      m.is_published
    FROM learning_modules m
    LEFT JOIN learning_lessons l ON m.id = l.module_id
    GROUP BY m.id
    ORDER BY m.id
  `);

  console.table(modules);

  console.log('\n=== KENYA/ADHD MODULE DETAILS ===');
  const [kenyaModule] = await connection.query(`
    SELECT * FROM learning_modules WHERE title LIKE '%kenya%' OR title LIKE '%adhd%'
  `);

  if (kenyaModule.length > 0) {
    console.log('Found module:', kenyaModule[0].title, '(ID:', kenyaModule[0].id + ')');

    const [lessons] = await connection.query(`
      SELECT id, title, module_id, is_published FROM learning_lessons WHERE module_id = ?
    `, [kenyaModule[0].id]);

    console.log('\nLessons for this module:');
    console.table(lessons);
  } else {
    console.log('No Kenya/ADHD module found');
  }

  await connection.end();
}

checkLessons().catch(console.error);
