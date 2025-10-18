const mysql = require('mysql2/promise');

async function createDailyChallengeAttemptsTable() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!1754Swm.',
    database: 'rada_ke'
  });

  try {
    console.log('\n=== CREATING DAILY CHALLENGE ATTEMPTS TABLE ===\n');

    // Create user_daily_challenge_attempts table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_daily_challenge_attempts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        challenge_id INT NOT NULL,
        score INT NOT NULL DEFAULT 0,
        max_score INT NOT NULL,
        percentage INT GENERATED ALWAYS AS (ROUND((score / max_score) * 100)) STORED,
        time_taken INT NOT NULL COMMENT 'Time in seconds',
        answers JSON COMMENT 'User answers array',
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (challenge_id) REFERENCES learning_daily_challenges(id) ON DELETE CASCADE,

        UNIQUE KEY unique_user_challenge (user_id, challenge_id),
        INDEX idx_challenge_score (challenge_id, score DESC),
        INDEX idx_user_completed (user_id, completed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Created table: user_daily_challenge_attempts');

    // Check if table was created successfully
    const [rows] = await conn.query(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = 'rada_ke' AND table_name = 'user_daily_challenge_attempts'
    `);

    if (rows[0].count > 0) {
      console.log('✓ Table verified successfully\n');

      // Show table structure
      const [cols] = await conn.query(`
        SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = 'rada_ke' AND TABLE_NAME = 'user_daily_challenge_attempts'
        ORDER BY ORDINAL_POSITION
      `);

      console.log('Table Structure:');
      console.log('================');
      cols.forEach(col => {
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        const key = col.COLUMN_KEY ? ` [${col.COLUMN_KEY}]` : '';
        const extra = col.EXTRA ? ` ${col.EXTRA}` : '';
        console.log(`  ${col.COLUMN_NAME.padEnd(20)} ${col.COLUMN_TYPE.padEnd(20)} ${nullable}${key}${extra}`);
      });

      console.log('\n✓ Daily Challenge Attempts table created successfully!\n');
    } else {
      console.log('✗ Table creation failed\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await conn.end();
  }
}

createDailyChallengeAttemptsTable();
