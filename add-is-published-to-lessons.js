const mysql = require('mysql2/promise');

async function addIsPublishedToLessons() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '!1754Swm.',
      database: 'rada_ke'
    });

    console.log('Connected to database. Checking learning_lessons table schema...');

    // Check if column already exists
    const [existingCols] = await connection.execute('SHOW COLUMNS FROM learning_lessons');
    const colNames = existingCols.map(c => c.Field);

    if (!colNames.includes('is_published')) {
      console.log('Adding is_published column to learning_lessons table...');

      await connection.execute(`
        ALTER TABLE learning_lessons
        ADD COLUMN is_published TINYINT(1) DEFAULT 0 AFTER is_locked
      `);

      console.log('✅ is_published column added successfully');

      // Set existing lessons to published (0) by default - admin can publish them later
      const [updateResult] = await connection.execute(`
        UPDATE learning_lessons
        SET is_published = 0
      `);

      console.log(`✅ Set ${updateResult.affectedRows} lessons to is_published = 0 (draft)`);
      console.log('Note: All existing lessons are now in DRAFT mode. Use admin panel to publish them.');
    } else {
      console.log('ℹ️  is_published column already exists');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

addIsPublishedToLessons();
