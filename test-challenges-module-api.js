const mysql = require('mysql2/promise');
require('dotenv').config();

async function testChallengesModuleAPI() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rada_ke',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Testing Challenges Module API...\n');

    // Test 1: Check if learning_modules table exists and has data
    console.log('1. Checking learning_modules table...');
    const [modules] = await pool.query(`
      SELECT
        m.id,
        m.title,
        m.description,
        m.difficulty,
        m.category,
        m.xp_reward,
        m.is_published,
        COUNT(l.id) as lesson_count
      FROM learning_modules m
      LEFT JOIN learning_lessons l ON m.id = l.module_id
      GROUP BY m.id
      LIMIT 5
    `);
    console.log(`Found ${modules.length} modules in database`);
    if (modules.length > 0) {
      console.log('Sample module:', {
        id: modules[0].id,
        title: modules[0].title,
        lesson_count: modules[0].lesson_count,
        is_published: modules[0].is_published
      });
    }

    // Test 2: Check available published modules
    console.log('\n2. Checking available published modules...');
    const [availableModules] = await pool.query(`
      SELECT
        m.id,
        m.title,
        m.description,
        m.difficulty,
        m.category,
        m.xp_reward,
        COUNT(l.id) as lesson_count
      FROM learning_modules m
      LEFT JOIN learning_lessons l ON m.id = l.module_id
      WHERE m.is_published = 1
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `);
    console.log(`Found ${availableModules.length} published modules`);
    availableModules.forEach((mod, idx) => {
      console.log(`  ${idx + 1}. ${mod.title} (${mod.lesson_count} lessons, ${mod.difficulty})`);
    });

    // Test 3: Check if challenges exist
    console.log('\n3. Checking existing challenges...');
    const [challenges] = await pool.query('SELECT * FROM learning_challenges LIMIT 5');
    console.log(`Found ${challenges.length} challenges`);

    // Test 4: Check challenge_tasks table structure
    console.log('\n4. Checking learning_challenge_tasks table...');
    const [taskSchema] = await pool.query('DESCRIBE learning_challenge_tasks');
    console.log('Table schema:');
    taskSchema.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    // Test 5: Check existing tasks
    console.log('\n5. Checking existing challenge tasks...');
    const [tasks] = await pool.query(`
      SELECT
        ct.*,
        CASE
          WHEN ct.task_type = 'lesson' THEN l.title
          WHEN ct.task_type = 'quiz' THEN q.title
          WHEN ct.task_type = 'module' THEN m.title
          ELSE NULL
        END as task_title
      FROM learning_challenge_tasks ct
      LEFT JOIN learning_lessons l ON ct.task_type = 'lesson' AND ct.task_id = l.id
      LEFT JOIN learning_quizzes q ON ct.task_type = 'quiz' AND ct.task_id = q.id
      LEFT JOIN learning_modules m ON ct.task_type = 'module' AND ct.task_id = m.id
      LIMIT 10
    `);
    console.log(`Found ${tasks.length} existing tasks`);
    tasks.forEach((task, idx) => {
      console.log(`  ${idx + 1}. ${task.task_type}: ${task.task_title || 'N/A'}`);
    });

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testChallengesModuleAPI();
