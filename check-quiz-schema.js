const mysql = require('mysql2/promise');

async function checkQuizSchema() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '!1754Swm.',
      database: 'rada_ke'
    });

    console.log('✅ Connected to database\n');

    // Check learning_quizzes schema
    const [quizColumns] = await connection.execute(`
      SHOW COLUMNS FROM learning_quizzes
    `);

    console.log('📋 learning_quizzes columns:');
    quizColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check learning_quiz_questions schema
    const [questionColumns] = await connection.execute(`
      SHOW COLUMNS FROM learning_quiz_questions
    `);

    console.log('\n📋 learning_quiz_questions columns:');
    questionColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Get sample quiz data
    const [quizzes] = await connection.execute(`
      SELECT * FROM learning_quizzes LIMIT 3
    `);

    console.log('\n🎯 Sample quizzes:');
    quizzes.forEach(q => {
      console.log(`  ID ${q.id}: ${q.title}`);
      console.log(`    Fields:`, Object.keys(q).join(', '));
    });

    // Get sample questions
    const [questions] = await connection.execute(`
      SELECT * FROM learning_quiz_questions WHERE quiz_id = ? LIMIT 2
    `, [quizzes[0]?.id || 1]);

    console.log(`\n❓ Sample questions for quiz ${quizzes[0]?.id}:`);
    questions.forEach(q => {
      console.log(`  ID ${q.id}: ${q.question_text?.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkQuizSchema();
