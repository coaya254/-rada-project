const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkQuizData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rada_ke'
  });

  try {
    console.log('Checking learning data in database...\n');

    // Check modules
    const [modules] = await connection.query('SELECT id, title FROM learning_modules');
    console.log(`✓ Modules: ${modules.length}`);
    modules.forEach(m => console.log(`  - ${m.id}: ${m.title}`));

    // Check lessons
    const [lessons] = await connection.query('SELECT id, title, module_id FROM learning_lessons');
    console.log(`\n✓ Lessons: ${lessons.length}`);
    lessons.forEach(l => console.log(`  - ${l.id}: ${l.title} (Module ${l.module_id})`));

    // Check quizzes
    const [quizzes] = await connection.query('SELECT id, title, module_id FROM learning_quizzes');
    console.log(`\n✓ Quizzes: ${quizzes.length}`);
    if (quizzes.length === 0) {
      console.log('  ⚠️ No quizzes found - need to add quiz data');
    } else {
      quizzes.forEach(q => console.log(`  - ${q.id}: ${q.title} (Module ${q.module_id})`));
    }

    // Check quiz questions
    const [questions] = await connection.query('SELECT COUNT(*) as count FROM learning_quiz_questions');
    console.log(`\n✓ Quiz Questions: ${questions[0].count}`);

    // Check learning paths
    const [paths] = await connection.query('SELECT id, title FROM learning_paths');
    console.log(`\n✓ Learning Paths: ${paths.length}`);
    if (paths.length === 0) {
      console.log('  ⚠️ No learning paths found - need to add path data');
    } else {
      paths.forEach(p => console.log(`  - ${p.id}: ${p.title}`));
    }

    // Check achievements
    const [achievements] = await connection.query('SELECT id, title FROM learning_achievements');
    console.log(`\n✓ Achievements: ${achievements.length}`);
    if (achievements.length === 0) {
      console.log('  ⚠️ No achievements found - need to add achievement data');
    } else {
      achievements.forEach(a => console.log(`  - ${a.id}: ${a.title}`));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

checkQuizData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
