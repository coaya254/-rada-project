const mysql = require('mysql2/promise');

async function migrateToUUID() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!1754Swm.',
    database: 'rada_ke',
    multipleStatements: true
  });

  try {
    console.log('🚀 Starting UUID Standardization Migration\n');
    console.log('=' .repeat(80));

    // ==========================================
    // STEP 1: Add user_uuid columns to all tables
    // ==========================================
    console.log('\n📋 STEP 1: Adding user_uuid columns...\n');

    const tablesToUpdate = [
      { table: 'user_learning_progress', oldColumn: 'user_id' },
      { table: 'user_xp_transactions', oldColumn: 'user_id' },
      { table: 'learning_bookmarks', oldColumn: 'user_id' },
      { table: 'user_quiz_attempts', oldColumn: 'user_id' },
      { table: 'user_learning_modules', oldColumn: 'user_id' },
      { table: 'user_learning_lessons', oldColumn: 'user_id' },
      { table: 'user_learning_achievements', oldColumn: 'user_id' },
      { table: 'user_learning_streaks', oldColumn: 'user_id' },
      { table: 'post_bookmarks', oldColumn: 'user_id' },
      { table: 'post_comments', oldColumn: 'author_id', newColumn: 'author_uuid' },
      { table: 'community_posts', oldColumn: 'author_id', newColumn: 'author_uuid' }
    ];

    for (const { table, oldColumn, newColumn } of tablesToUpdate) {
      const columnName = newColumn || 'user_uuid';

      try {
        // Check if column already exists
        const [columns] = await connection.query(
          `SHOW COLUMNS FROM ${table} LIKE '${columnName}'`
        );

        if (columns.length === 0) {
          await connection.query(
            `ALTER TABLE ${table} ADD COLUMN ${columnName} VARCHAR(36) AFTER ${oldColumn}`
          );
          console.log(`  ✅ Added ${columnName} to ${table}`);
        } else {
          console.log(`  ⏭️  ${columnName} already exists in ${table}`);
        }
      } catch (error) {
        console.log(`  ⚠️  Table ${table} might not exist: ${error.message}`);
      }
    }

    // ==========================================
    // STEP 2: Populate user_uuid columns from users table
    // ==========================================
    console.log('\n📋 STEP 2: Populating UUID columns...\n');

    const updateQueries = [
      {
        table: 'user_learning_progress',
        query: `UPDATE user_learning_progress ulp
                INNER JOIN users u ON ulp.user_id = u.id
                SET ulp.user_uuid = u.uuid
                WHERE ulp.user_uuid IS NULL`
      },
      {
        table: 'user_xp_transactions',
        query: `UPDATE user_xp_transactions uxt
                INNER JOIN users u ON uxt.user_id = u.id
                SET uxt.user_uuid = u.uuid
                WHERE uxt.user_uuid IS NULL`
      },
      {
        table: 'learning_bookmarks',
        query: `UPDATE learning_bookmarks lb
                INNER JOIN users u ON lb.user_id = u.id
                SET lb.user_uuid = u.uuid
                WHERE lb.user_uuid IS NULL`
      },
      {
        table: 'user_quiz_attempts',
        query: `UPDATE user_quiz_attempts uqa
                INNER JOIN users u ON uqa.user_id = u.id
                SET uqa.user_uuid = u.uuid
                WHERE uqa.user_uuid IS NULL`
      },
      {
        table: 'user_learning_modules',
        query: `UPDATE user_learning_modules ulm
                INNER JOIN users u ON ulm.user_id = u.id
                SET ulm.user_uuid = u.uuid
                WHERE ulm.user_uuid IS NULL`
      },
      {
        table: 'user_learning_lessons',
        query: `UPDATE user_learning_lessons ull
                INNER JOIN users u ON ull.user_id = u.id
                SET ull.user_uuid = u.uuid
                WHERE ull.user_uuid IS NULL`
      },
      {
        table: 'user_learning_achievements',
        query: `UPDATE user_learning_achievements ula
                INNER JOIN users u ON ula.user_id = u.id
                SET ula.user_uuid = u.uuid
                WHERE ula.user_uuid IS NULL`
      },
      {
        table: 'user_learning_streaks',
        query: `UPDATE user_learning_streaks uls
                INNER JOIN users u ON uls.user_id = u.id
                SET uls.user_uuid = u.uuid
                WHERE uls.user_uuid IS NULL`
      },
      {
        table: 'post_bookmarks',
        query: `UPDATE post_bookmarks pb
                INNER JOIN users u ON pb.user_id = u.id
                SET pb.user_uuid = u.uuid
                WHERE pb.user_uuid IS NULL`
      },
      {
        table: 'post_comments',
        query: `UPDATE post_comments pc
                INNER JOIN users u ON pc.author_id = u.id
                SET pc.author_uuid = u.uuid
                WHERE pc.author_uuid IS NULL`
      },
      {
        table: 'community_posts',
        query: `UPDATE community_posts cp
                INNER JOIN users u ON cp.author_id = u.id
                SET cp.author_uuid = u.uuid
                WHERE cp.author_uuid IS NULL`
      }
    ];

    for (const { table, query } of updateQueries) {
      try {
        const [result] = await connection.query(query);
        console.log(`  ✅ Updated ${result.affectedRows} rows in ${table}`);
      } catch (error) {
        console.log(`  ⚠️  Error updating ${table}: ${error.message}`);
      }
    }

    // ==========================================
    // STEP 3: Add indexes for performance
    // ==========================================
    console.log('\n📋 STEP 3: Adding indexes for performance...\n');

    const indexQueries = [
      { table: 'user_learning_progress', column: 'user_uuid' },
      { table: 'user_xp_transactions', column: 'user_uuid' },
      { table: 'learning_bookmarks', column: 'user_uuid' },
      { table: 'user_quiz_attempts', column: 'user_uuid' },
      { table: 'user_learning_modules', column: 'user_uuid' },
      { table: 'user_learning_lessons', column: 'user_uuid' },
      { table: 'user_learning_achievements', column: 'user_uuid' },
      { table: 'user_learning_streaks', column: 'user_uuid' },
      { table: 'post_bookmarks', column: 'user_uuid' },
      { table: 'post_comments', column: 'author_uuid' },
      { table: 'community_posts', column: 'author_uuid' }
    ];

    for (const { table, column } of indexQueries) {
      try {
        await connection.query(
          `ALTER TABLE ${table} ADD INDEX idx_${column} (${column})`
        );
        console.log(`  ✅ Added index on ${table}.${column}`);
      } catch (error) {
        if (error.message.includes('Duplicate key name')) {
          console.log(`  ⏭️  Index already exists on ${table}.${column}`);
        } else {
          console.log(`  ⚠️  Error adding index to ${table}: ${error.message}`);
        }
      }
    }

    // ==========================================
    // STEP 4: Verification
    // ==========================================
    console.log('\n📋 STEP 4: Verification...\n');

    for (const { table, oldColumn, newColumn } of tablesToUpdate) {
      const columnName = newColumn || 'user_uuid';

      try {
        const [result] = await connection.query(
          `SELECT COUNT(*) as total,
                  COUNT(${columnName}) as with_uuid,
                  COUNT(${oldColumn}) as with_id
           FROM ${table}`
        );

        const row = result[0];
        console.log(`  ${table}:`);
        console.log(`    Total rows: ${row.total}`);
        console.log(`    With UUID: ${row.with_uuid}`);
        console.log(`    With ID: ${row.with_id}`);

        if (row.with_uuid !== row.with_id) {
          console.log(`    ⚠️  WARNING: UUID count doesn't match ID count!`);
        } else if (row.total > 0) {
          console.log(`    ✅ All rows have UUID`);
        }
      } catch (error) {
        console.log(`  ⏭️  Skipping ${table}: ${error.message}`);
      }
      console.log('');
    }

    // ==========================================
    // Summary
    // ==========================================
    console.log('\n' + '='.repeat(80));
    console.log('✅ Migration Complete!\n');
    console.log('📝 Next Steps:');
    console.log('   1. Update API routes to use UUID instead of ID');
    console.log('   2. Test all functionality');
    console.log('   3. Once verified, you can optionally drop the old ID columns');
    console.log('   4. Update foreign key constraints if needed\n');
    console.log('⚠️  NOTE: Old ID columns are kept for now for safety.');
    console.log('   You can drop them later once everything is tested.\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run migration
migrateToUUID()
  .then(() => {
    console.log('🎉 Migration script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
