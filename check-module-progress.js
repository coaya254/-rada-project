const mysql = require('mysql2/promise');

async function checkProgress() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!1754Swm.',
    database: 'rada_ke'
  });

  try {
    // Check module progress
    const [progress] = await conn.query(`
      SELECT
        um.module_id,
        um.progress_percentage,
        COUNT(l.id) as total_lessons,
        SUM(CASE WHEN ul.completed_at IS NOT NULL THEN 1 ELSE 0 END) as completed_lessons,
        ROUND((SUM(CASE WHEN ul.completed_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(l.id)) * 100) as calculated_progress
      FROM user_learning_modules um
      LEFT JOIN learning_lessons l ON um.module_id = l.module_id
      LEFT JOIN user_learning_lessons ul ON l.id = ul.lesson_id AND ul.user_id = um.user_id
      WHERE um.user_id = 1
      GROUP BY um.module_id, um.progress_percentage
    `);

    console.log('\nModule Progress for User 1:');
    console.log('============================');
    progress.forEach(p => {
      console.log(`Module ${p.module_id}:`);
      console.log(`  Completed: ${p.completed_lessons}/${p.total_lessons} lessons`);
      console.log(`  Stored: ${p.progress_percentage}%`);
      console.log(`  Calculated: ${p.calculated_progress}%`);
      console.log(`  Match: ${p.progress_percentage === p.calculated_progress ? '✓' : '✗ MISMATCH'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await conn.end();
  }
}

checkProgress();
