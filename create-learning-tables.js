const mysql = require('mysql2/promise');
require('dotenv').config();

async function createLearningTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rada_ke'
  });

  try {
    console.log('Creating learning system tables...\n');

    // 1. Modules table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_modules (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
        icon VARCHAR(100),
        total_xp INT DEFAULT 0,
        estimated_hours DECIMAL(5,2),
        display_order INT DEFAULT 0,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_difficulty (difficulty),
        INDEX idx_published (is_published)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created learning_modules table');

    // 2. Lessons table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_lessons (
        id INT PRIMARY KEY AUTO_INCREMENT,
        module_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content LONGTEXT,
        lesson_type ENUM('text', 'video', 'interactive', 'quiz') DEFAULT 'text',
        duration_minutes INT DEFAULT 0,
        xp_reward INT DEFAULT 25,
        display_order INT DEFAULT 0,
        is_locked BOOLEAN DEFAULT false,
        prerequisites JSON,
        video_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE,
        INDEX idx_module (module_id),
        INDEX idx_type (lesson_type),
        INDEX idx_order (display_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created learning_lessons table');

    // 3. Quizzes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_quizzes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        module_id INT,
        lesson_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        time_limit_minutes INT DEFAULT 10,
        passing_score_percentage INT DEFAULT 70,
        xp_reward INT DEFAULT 50,
        quiz_type ENUM('module', 'lesson', 'daily_challenge', 'standalone') DEFAULT 'module',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES learning_lessons(id) ON DELETE CASCADE,
        INDEX idx_module (module_id),
        INDEX idx_lesson (lesson_id),
        INDEX idx_type (quiz_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created learning_quizzes table');

    // 4. Quiz Questions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_quiz_questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        quiz_id INT NOT NULL,
        question_text TEXT NOT NULL,
        options JSON NOT NULL,
        correct_answer_index INT NOT NULL,
        explanation TEXT,
        points INT DEFAULT 10,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES learning_quizzes(id) ON DELETE CASCADE,
        INDEX idx_quiz (quiz_id),
        INDEX idx_order (display_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created learning_quiz_questions table');

    // 5. User Modules (Enrollment & Progress)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_learning_modules (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        module_id INT NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        progress_percentage INT DEFAULT 0,
        UNIQUE KEY unique_enrollment (user_id, module_id),
        FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_module (module_id),
        INDEX idx_completed (completed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created user_learning_modules table');

    // 6. User Lessons Progress
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_learning_lessons (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        lesson_id INT NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        time_spent_minutes INT DEFAULT 0,
        UNIQUE KEY unique_lesson_progress (user_id, lesson_id),
        FOREIGN KEY (lesson_id) REFERENCES learning_lessons(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_lesson (lesson_id),
        INDEX idx_completed (completed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created user_learning_lessons table');

    // 7. User Quiz Attempts
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_quiz_attempts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        quiz_id INT NOT NULL,
        score INT DEFAULT 0,
        percentage DECIMAL(5,2) DEFAULT 0,
        passed BOOLEAN DEFAULT false,
        time_spent_seconds INT DEFAULT 0,
        answers JSON,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES learning_quizzes(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_quiz (quiz_id),
        INDEX idx_submitted (submitted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created user_quiz_attempts table');

    // 8. Learning Paths
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_paths (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
        estimated_hours DECIMAL(5,2),
        icon VARCHAR(100),
        color VARCHAR(50),
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_difficulty (difficulty)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created learning_paths table');

    // 9. Learning Path Modules (Join table)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_path_modules (
        id INT PRIMARY KEY AUTO_INCREMENT,
        path_id INT NOT NULL,
        module_id INT NOT NULL,
        display_order INT DEFAULT 0,
        prerequisites JSON,
        UNIQUE KEY unique_path_module (path_id, module_id),
        FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
        FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE,
        INDEX idx_path (path_id),
        INDEX idx_module (module_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created learning_path_modules table');

    // 10. User Learning Paths
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_learning_paths (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        path_id INT NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        progress_percentage INT DEFAULT 0,
        UNIQUE KEY unique_path_enrollment (user_id, path_id),
        FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_path (path_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created user_learning_paths table');

    // 11. Daily Challenges
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_daily_challenges (
        id INT PRIMARY KEY AUTO_INCREMENT,
        challenge_date DATE NOT NULL UNIQUE,
        quiz_id INT NOT NULL,
        xp_reward INT DEFAULT 100,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES learning_quizzes(id) ON DELETE CASCADE,
        INDEX idx_date (challenge_date),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created learning_daily_challenges table');

    // 12. User Challenge Attempts
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_challenge_attempts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        challenge_id INT NOT NULL,
        score INT DEFAULT 0,
        time_completed_seconds INT DEFAULT 0,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_challenge_attempt (user_id, challenge_id),
        FOREIGN KEY (challenge_id) REFERENCES learning_daily_challenges(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_challenge (challenge_id),
        INDEX idx_submitted (submitted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created user_challenge_attempts table');

    // 13. User Streaks
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_learning_streaks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL UNIQUE,
        current_streak INT DEFAULT 0,
        longest_streak INT DEFAULT 0,
        last_activity_date DATE,
        INDEX idx_user (user_id),
        INDEX idx_streak (current_streak)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created user_learning_streaks table');

    // 14. Certificates
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_certificates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        module_id INT,
        path_id INT,
        credential_id VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        skills JSON,
        is_revoked BOOLEAN DEFAULT false,
        FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE SET NULL,
        FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE SET NULL,
        INDEX idx_user (user_id),
        INDEX idx_credential (credential_id),
        INDEX idx_issued (issued_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created learning_certificates table');

    // 15. Achievements
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_achievements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        rarity ENUM('Common', 'Rare', 'Epic', 'Legendary') DEFAULT 'Common',
        criteria_type VARCHAR(50),
        criteria_value INT,
        xp_reward INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_rarity (rarity),
        INDEX idx_criteria (criteria_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created learning_achievements table');

    // 16. User Achievements
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_learning_achievements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        achievement_id INT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        progress_value INT DEFAULT 0,
        UNIQUE KEY unique_user_achievement (user_id, achievement_id),
        FOREIGN KEY (achievement_id) REFERENCES learning_achievements(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_achievement (achievement_id),
        INDEX idx_earned (earned_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created user_learning_achievements table');

    // 17. Bookmarks
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_bookmarks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        item_id INT NOT NULL,
        item_type ENUM('lesson', 'module', 'quiz') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_bookmark (user_id, item_id, item_type),
        INDEX idx_user (user_id),
        INDEX idx_item (item_id, item_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created learning_bookmarks table');

    // 18. XP Transactions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_xp_transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        amount INT NOT NULL,
        source_type VARCHAR(50),
        source_id INT,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_created (created_at),
        INDEX idx_source (source_type, source_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created user_xp_transactions table');

    // 19. User Progress Summary
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_learning_progress (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL UNIQUE,
        total_xp INT DEFAULT 0,
        level INT DEFAULT 1,
        current_streak INT DEFAULT 0,
        longest_streak INT DEFAULT 0,
        last_activity TIMESTAMP NULL,
        modules_completed INT DEFAULT 0,
        lessons_completed INT DEFAULT 0,
        quizzes_passed INT DEFAULT 0,
        hours_spent DECIMAL(10,2) DEFAULT 0,
        achievements_earned INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_xp (total_xp),
        INDEX idx_level (level)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created user_learning_progress table');

    // 20. Learning Media
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_media (
        id INT PRIMARY KEY AUTO_INCREMENT,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_type VARCHAR(100),
        file_size BIGINT,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_type (file_type),
        INDEX idx_uploaded (uploaded_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created learning_media table');

    console.log('\n✅ All learning system tables created successfully!\n');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the migration
createLearningTables()
  .then(() => {
    console.log('Migration completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
