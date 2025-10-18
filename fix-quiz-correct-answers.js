const mysql = require('mysql2/promise');

async function fixQuizAnswers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!1754Swm.',
    database: 'rada_ke'
  });

  try {
    console.log('Checking quiz questions...\n');

    const [questions] = await connection.query(`
      SELECT id, question_text, options, correct_answer_index
      FROM learning_quiz_questions
      ORDER BY id
    `);

    console.log(`Found ${questions.length} questions\n`);

    for (const q of questions) {
      console.log(`Question ID: ${q.id}`);
      console.log(`Question: ${q.question_text}`);
      console.log(`Options (raw): ${q.options}`);
      console.log(`Correct answer index: ${q.correct_answer_index} (type: ${typeof q.correct_answer_index})`);

      // If correct_answer_index is null, set it to 0 as default
      if (q.correct_answer_index === null || q.correct_answer_index === undefined) {
        console.log('  ⚠️  FIXING: Setting correct_answer_index to 0');
        await connection.query(
          'UPDATE learning_quiz_questions SET correct_answer_index = 0 WHERE id = ?',
          [q.id]
        );
      }
      console.log('---\n');
    }

    console.log('✅ All quiz questions checked and fixed!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

fixQuizAnswers();
