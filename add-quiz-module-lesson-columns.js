const mysql = require('mysql2/promise');

async function addColumns() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '!1754Swm.',
      database: 'rada_ke'
    });

    console.log('✅ Connected to database\n');

    // Add module_id column to learning_quizzes
    console.log('Adding columns to learning_quizzes...');

    // Check if columns exist first
    const [existingCols] = await connection.execute('SHOW COLUMNS FROM learning_quizzes');
    const colNames = existingCols.map(c => c.Field);

    if (!colNames.includes('module_id')) {
      await connection.execute('ALTER TABLE learning_quizzes ADD COLUMN module_id INT NULL AFTER id');
      console.log('✅ module_id column added');
    } else {
      console.log('⚠️  module_id already exists');
    }

    if (!colNames.includes('lesson_id')) {
      await connection.execute('ALTER TABLE learning_quizzes ADD COLUMN lesson_id INT NULL AFTER module_id');
      console.log('✅ lesson_id column added');
    } else {
      console.log('⚠️  lesson_id already exists');
    }

    if (!colNames.includes('quiz_type')) {
      await connection.execute("ALTER TABLE learning_quizzes ADD COLUMN quiz_type ENUM('module', 'lesson', 'trivia') DEFAULT 'module' AFTER lesson_id");
      console.log('✅ quiz_type column added');
    } else {
      console.log('⚠️  quiz_type already exists');
    }

    // Add foreign keys
    console.log('Adding foreign key constraints...');
    try {
      await connection.execute(`
        ALTER TABLE learning_quizzes
        ADD CONSTRAINT fk_quiz_module
        FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE SET NULL
      `);
      console.log('✅ Module foreign key added');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') {
        console.log('⚠️  Module FK:', err.message);
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE learning_quizzes
        ADD CONSTRAINT fk_quiz_lesson
        FOREIGN KEY (lesson_id) REFERENCES learning_lessons(id) ON DELETE SET NULL
      `);
      console.log('✅ Lesson foreign key added');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') {
        console.log('⚠️  Lesson FK:', err.message);
      }
    }

    // Show updated schema
    console.log('\n📋 Updated learning_quizzes schema:');
    const [columns] = await connection.execute('SHOW COLUMNS FROM learning_quizzes');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    console.log('\n✅ Migration complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

addColumns();
