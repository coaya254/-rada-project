const mysql = require('mysql2/promise');
require('dotenv').config();

async function addModuleToChallengeTasks() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rada_ke'
  });

  try {
    console.log('Adding "module" to learning_challenge_tasks.task_type enum...\n');

    // Modify the enum to include 'module'
    await connection.query(`
      ALTER TABLE learning_challenge_tasks
      MODIFY COLUMN task_type ENUM('lesson', 'quiz', 'module') NOT NULL
    `);

    console.log('✅ Successfully added "module" to task_type enum!');

    // Verify the change
    const [columns] = await connection.query(`
      SELECT COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'learning_challenge_tasks'
      AND COLUMN_NAME = 'task_type'
    `, [process.env.DB_NAME || 'rada_ke']);

    console.log('\nUpdated task_type column:');
    console.log(columns[0].COLUMN_TYPE);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

addModuleToChallengeTasks()
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
