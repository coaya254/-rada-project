const mysql = require('mysql2/promise');

async function addIsFeaturedColumn() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rada_ke'
  });

  try {
    console.log('Adding is_featured column to modules table...');

    // Check if column already exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'rada_ke'
        AND TABLE_NAME = 'modules'
        AND COLUMN_NAME = 'is_featured'
    `);

    if (columns.length > 0) {
      console.log('✓ is_featured column already exists');
    } else {
      // Add is_featured column
      await connection.query(`
        ALTER TABLE modules
        ADD COLUMN is_featured BOOLEAN DEFAULT FALSE
      `);
      console.log('✓ Added is_featured column');

      // Feature some modules
      await connection.query(`
        UPDATE modules
        SET is_featured = TRUE
        WHERE id IN (1, 2, 3)
      `);
      console.log('✓ Marked modules 1, 2, 3 as featured');
    }

    console.log('\n✓ Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await connection.end();
  }
}

addIsFeaturedColumn();
