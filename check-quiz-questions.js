const mysql = require('mysql2/promise');

async function checkQuizQuestions() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!1754Swm.',
    database: 'rada_ke'
  });

  try {
    console.log('\n=== CHECKING QUIZ QUESTIONS ===\n');

    // Check daily challenge
    console.log('1. Checking daily challenge...');
    const [challenges] = await conn.query(`
      SELECT * FROM learning_daily_challenges ORDER BY id DESC LIMIT 5
    `);

    console.log(`   Found ${challenges.length} challenges`);
    challenges.forEach(c => {
      console.log(`   - Challenge ID ${c.id}: Quiz ${c.quiz_id}, Date: ${c.challenge_date}`);
    });

    if (challenges.length > 0) {
      const quizId = challenges[0].quiz_id;
      console.log(`\n2. Checking questions for Quiz ID ${quizId}...`);

      const [questions] = await conn.query(`
        SELECT * FROM learning_quiz_questions WHERE quiz_id = ?
      `, [quizId]);

      console.log(`   Found ${questions.length} questions`);

      if (questions.length === 0) {
        console.log('   ⚠️  Quiz has NO questions!');
        console.log('\n3. Checking all quizzes with questions...');

        const [quizzesWithQuestions] = await conn.query(`
          SELECT q.id, q.title, q.quiz_type, COUNT(qq.id) as question_count
          FROM learning_quizzes q
          LEFT JOIN learning_quiz_questions qq ON q.id = qq.quiz_id
          GROUP BY q.id
          HAVING question_count > 0
          ORDER BY question_count DESC
        `);

        console.log(`\n   Quizzes with questions:`);
        quizzesWithQuestions.forEach(q => {
          console.log(`   - Quiz ${q.id}: "${q.title}" (${q.quiz_type}) - ${q.question_count} questions`);
        });

        if (quizzesWithQuestions.length > 0) {
          console.log(`\n4. Solution: Update daily challenge to use Quiz ${quizzesWithQuestions[0].id}...`);

          const today = new Date().toISOString().split('T')[0];

          // Update existing challenge
          await conn.query(`
            UPDATE learning_daily_challenges
            SET quiz_id = ?
            WHERE challenge_date = ?
          `, [quizzesWithQuestions[0].id, today]);

          console.log(`   ✓ Updated today's challenge to use Quiz ${quizzesWithQuestions[0].id}`);
        }
      } else {
        console.log('\n   Questions in this quiz:');
        questions.forEach((q, i) => {
          console.log(`   ${i + 1}. ${q.question_text.substring(0, 60)}...`);
        });
      }
    }

    console.log('\n=== CHECK COMPLETE ===\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await conn.end();
  }
}

checkQuizQuestions();
