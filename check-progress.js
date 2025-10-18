const mysql = require('mysql2/promise');

async function checkProgress() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!1754Swm.',
    database: 'rada_ke'
  });

  try {
    console.log('=== Checking All Modules ===\n');
    const [modules] = await conn.query('SELECT id, title, description FROM learning_modules ORDER BY id');
    console.log('Available Modules:');
    modules.forEach(m => console.log(`  ID ${m.id}: ${m.title}`));

    console.log('\n=== User Progress for ALL Modules ===\n');
    const [progress] = await conn.query('SELECT * FROM user_learning_modules WHERE user_id = 1');
    console.log('Modules with progress:', JSON.stringify(progress, null, 2));

    console.log('\n=== All Recent Lesson Completions ===\n');
    const [lessons] = await conn.query(`
      SELECT ul.*, l.title, l.module_id
      FROM user_learning_lessons ul
      JOIN learning_lessons l ON ul.lesson_id = l.id
      WHERE ul.user_id = 1
      ORDER BY ul.completed_at DESC
      LIMIT 10
    `);
    console.log('Recent lesson completions:', JSON.stringify(lessons, null, 2));

    console.log('\n=== Quiz Attempts ===\n');
    const [quizzes] = await conn.query(`
      SELECT uqa.*, q.title, q.module_id
      FROM user_quiz_attempts uqa
      JOIN learning_quizzes q ON uqa.quiz_id = q.id
      WHERE uqa.user_id = 1
      ORDER BY uqa.created_at DESC
      LIMIT 5
    `);
    console.log('Recent quiz attempts:', JSON.stringify(quizzes, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await conn.end();
  }
}

checkProgress();
