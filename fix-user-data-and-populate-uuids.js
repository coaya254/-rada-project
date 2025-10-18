const mysql = require('mysql2/promise');

async function fixAndPopulate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!1754Swm.',
    database: 'rada_ke'
  });

  try {
    console.log('🔧 Fixing orphaned data and populating UUIDs\n');
    console.log('='.repeat(80));

    // Get the real user (Jay)
    const [users] = await connection.query(
      'SELECT id, uuid, nickname FROM users WHERE nickname = "Jay"'
    );

    if (users.length === 0) {
      console.log('❌ User Jay not found!');
      return;
    }

    const jay = users[0];
    console.log(`\n✅ Found user: ${jay.nickname} (ID: ${jay.id}, UUID: ${jay.uuid})\n`);

    // ==========================================
    // STEP 1: Reassign orphaned data to Jay
    // ==========================================
    console.log('📋 STEP 1: Reassigning orphaned data to Jay...\n');

    const reassignQueries = [
      'UPDATE user_learning_progress SET user_id = ? WHERE user_id = 1',
      'UPDATE user_xp_transactions SET user_id = ? WHERE user_id = 1',
      'UPDATE user_quiz_attempts SET user_id = ? WHERE user_id = 1',
      'UPDATE user_learning_modules SET user_id = ? WHERE user_id = 1',
      'UPDATE user_learning_lessons SET user_id = ? WHERE user_id = 1',
      'UPDATE user_learning_streaks SET user_id = ? WHERE user_id = 1'
    ];

    for (const query of reassignQueries) {
      try {
        const [result] = await connection.query(query, [jay.id]);
        const tableName = query.match(/UPDATE (\w+)/)[1];
        console.log(`  ✅ ${tableName}: ${result.affectedRows} rows reassigned`);
      } catch (error) {
        console.log(`  ⚠️  Error: ${error.message}`);
      }
    }

    // ==========================================
    // STEP 2: Populate UUID columns
    // ==========================================
    console.log('\n📋 STEP 2: Populating UUID columns...\n');

    const populateQueries = [
      {
        name: 'user_learning_progress',
        query: `UPDATE user_learning_progress ulp
                INNER JOIN users u ON ulp.user_id = u.id
                SET ulp.user_uuid = u.uuid`
      },
      {
        name: 'user_xp_transactions',
        query: `UPDATE user_xp_transactions uxt
                INNER JOIN users u ON uxt.user_id = u.id
                SET uxt.user_uuid = u.uuid`
      },
      {
        name: 'learning_bookmarks',
        query: `UPDATE learning_bookmarks lb
                INNER JOIN users u ON lb.user_id = u.id
                SET lb.user_uuid = u.uuid`
      },
      {
        name: 'user_quiz_attempts',
        query: `UPDATE user_quiz_attempts uqa
                INNER JOIN users u ON uqa.user_id = u.id
                SET uqa.user_uuid = u.uuid`
      },
      {
        name: 'user_learning_modules',
        query: `UPDATE user_learning_modules ulm
                INNER JOIN users u ON ulm.user_id = u.id
                SET ulm.user_uuid = u.uuid`
      },
      {
        name: 'user_learning_lessons',
        query: `UPDATE user_learning_lessons ull
                INNER JOIN users u ON ull.user_id = u.id
                SET ull.user_uuid = u.uuid`
      },
      {
        name: 'user_learning_achievements',
        query: `UPDATE user_learning_achievements ula
                INNER JOIN users u ON ula.user_id = u.id
                SET ula.user_uuid = u.uuid`
      },
      {
        name: 'user_learning_streaks',
        query: `UPDATE user_learning_streaks uls
                INNER JOIN users u ON uls.user_id = u.id
                SET uls.user_uuid = u.uuid`
      },
      {
        name: 'post_bookmarks',
        query: `UPDATE post_bookmarks pb
                INNER JOIN users u ON pb.user_id = u.id
                SET pb.user_uuid = u.uuid`
      },
      {
        name: 'post_comments',
        query: `UPDATE post_comments pc
                INNER JOIN users u ON pc.author_id = u.id
                SET pc.author_uuid = u.uuid`
      },
      {
        name: 'community_posts',
        query: `UPDATE community_posts cp
                INNER JOIN users u ON cp.author_id = u.id
                SET cp.author_uuid = u.uuid`
      }
    ];

    for (const { name, query } of populateQueries) {
      try {
        const [result] = await connection.query(query);
        console.log(`  ✅ ${name}: ${result.affectedRows} rows populated`);
      } catch (error) {
        console.log(`  ⚠️  ${name}: ${error.message}`);
      }
    }

    // ==========================================
    // STEP 3: Verification
    // ==========================================
    console.log('\n📋 STEP 3: Final Verification...\n');

    const verifyTables = [
      'user_learning_progress',
      'user_xp_transactions',
      'user_quiz_attempts',
      'user_learning_modules',
      'user_learning_lessons',
      'user_learning_streaks'
    ];

    for (const table of verifyTables) {
      try {
        const [result] = await connection.query(
          `SELECT COUNT(*) as total,
                  COUNT(user_uuid) as with_uuid
           FROM ${table}`
        );

        const { total, with_uuid } = result[0];
        const status = total === with_uuid ? '✅' : '⚠️ ';
        console.log(`  ${status} ${table}: ${with_uuid}/${total} rows have UUID`);
      } catch (error) {
        console.log(`  ⏭️  ${table}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Data fix complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

fixAndPopulate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
