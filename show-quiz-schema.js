const mysql = require('mysql2/promise');
require('dotenv').config();

async function showSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rada_ke'
  });

  try {
    console.log('=== QUIZZES TABLE SCHEMA ===\n');
    const [quizColumns] = await connection.query('SHOW COLUMNS FROM learning_quizzes');
    quizColumns.forEach(col => {
      console.log(`${col.Field} - ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key}`);
    });

    console.log('\n=== QUIZ QUESTIONS TABLE SCHEMA ===\n');
    const [questionColumns] = await connection.query('SHOW COLUMNS FROM learning_quiz_questions');
    questionColumns.forEach(col => {
      console.log(`${col.Field} - ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key}`);
    });

    console.log('\n=== LEARNING PATHS TABLE SCHEMA ===\n');
    const [pathColumns] = await connection.query('SHOW COLUMNS FROM learning_paths');
    pathColumns.forEach(col => {
      console.log(`${col.Field} - ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key}`);
    });

    console.log('\n=== ACHIEVEMENTS TABLE SCHEMA ===\n');
    const [achieveColumns] = await connection.query('SHOW COLUMNS FROM learning_achievements');
    achieveColumns.forEach(col => {
      console.log(`${col.Field} - ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

showSchema()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
