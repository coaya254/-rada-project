const mysql = require('mysql2/promise');

async function createChallengeTasksTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!1754Swm.',
    database: 'rada_ke'
  });

  try {
    console.log('Creating learning_challenge_tasks table...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_challenge_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        challenge_id INT NOT NULL,
        task_type ENUM('lesson', 'quiz') NOT NULL,
        task_id INT NOT NULL,
        description TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (challenge_id) REFERENCES learning_challenges(id) ON DELETE CASCADE,
        INDEX idx_challenge_id (challenge_id),
        INDEX idx_task_type_id (task_type, task_id),
        INDEX idx_display_order (display_order)
      )
    `);

    console.log('✓ learning_challenge_tasks table created successfully');

    // Also create user progress table for challenges
    console.log('Creating user_learning_challenge_progress table...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_learning_challenge_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        challenge_id INT NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        progress_percentage INT DEFAULT 0,
        tasks_completed INT DEFAULT 0,
        total_tasks INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (challenge_id) REFERENCES learning_challenges(id) ON DELETE CASCADE,
        INDEX idx_user_challenge (user_id, challenge_id),
        INDEX idx_user_id (user_id),
        INDEX idx_challenge_id (challenge_id),
        UNIQUE KEY unique_user_challenge (user_id, challenge_id)
      )
    `);

    console.log('✓ user_learning_challenge_progress table created successfully');

    console.log('\n✅ All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createChallengeTasksTable();
