const mysql = require('mysql2/promise');

async function addIsPublishedColumn() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '!1754Swm.',
      database: 'rada_ke'
    });

    console.log('Connected to database. Checking learning_modules table schema...');

    // Check if is_published column exists
    const [existingCols] = await connection.execute('SHOW COLUMNS FROM learning_modules');
    const colNames = existingCols.map(c => c.Field);

    if (!colNames.includes('is_published')) {
      console.log('Adding is_published column to learning_modules table...');

      // Add is_published column (defaults to true if status = 'published')
      await connection.execute(`
        ALTER TABLE learning_modules
        ADD COLUMN is_published TINYINT(1) DEFAULT 0 AFTER status
      `);

      console.log('✅ is_published column added successfully');

      // Update existing records: set is_published = 1 where status = 'published'
      console.log('Updating existing records based on status...');
      const [updateResult] = await connection.execute(`
        UPDATE learning_modules
        SET is_published = 1
        WHERE status = 'published'
      `);

      console.log(`✅ Updated ${updateResult.affectedRows} records to is_published = 1`);
    } else {
      console.log('✅ is_published column already exists. No changes needed.');
    }

    console.log('\n✅ Migration complete!');

  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// Run the migration
addIsPublishedColumn()
  .then(() => {
    console.log('Migration script finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
