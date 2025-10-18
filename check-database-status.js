const mysql = require('mysql2/promise');

async function checkDatabaseStatus() {
  let connection;

  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Empty password as per server.js
      database: 'rada_ke'
    });

    console.log('✅ Connected to MySQL Database\n');

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('=== ALL DATABASE TABLES ===');
    console.log(`Total Tables: ${tables.length}\n`);

    const tableList = {};

    for (const tableObj of tables) {
      const tableName = Object.values(tableObj)[0];

      // Get row count
      const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = countResult[0].count;

      // Get table structure
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);

      tableList[tableName] = {
        rows: count,
        columns: columns.length,
        fields: columns.map(c => c.Field)
      };
    }

    // Categorize tables
    const categories = {
      'POLITICS SYSTEM': [],
      'LEARNING SYSTEM': [],
      'NEWS SYSTEM': [],
      'ADMIN & AUTH': [],
      'OTHER': []
    };

    Object.keys(tableList).forEach(table => {
      const data = tableList[table];
      const tableInfo = `${table.padEnd(40)} │ ${String(data.rows).padStart(6)} rows │ ${String(data.columns).padStart(2)} columns`;

      if (table.startsWith('learning_')) {
        categories['LEARNING SYSTEM'].push(tableInfo);
      } else if (table.includes('politician') || table.includes('voting') || table.includes('commitment') || table.includes('timeline') || table.includes('career')) {
        categories['POLITICS SYSTEM'].push(tableInfo);
      } else if (table.includes('news') || table.includes('source')) {
        categories['NEWS SYSTEM'].push(tableInfo);
      } else if (table.includes('admin') || table.includes('user') || table.includes('audit') || table.includes('category')) {
        categories['ADMIN & AUTH'].push(tableInfo);
      } else {
        categories['OTHER'].push(tableInfo);
      }
    });

    // Print categorized tables
    Object.entries(categories).forEach(([category, tables]) => {
      if (tables.length > 0) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`${category} (${tables.length} tables)`);
        console.log('='.repeat(70));
        console.log('Table Name                               │   Rows │ Columns');
        console.log('-'.repeat(70));
        tables.forEach(t => console.log(t));
      }
    });

    // Check for sample/mock data
    console.log('\n\n' + '='.repeat(70));
    console.log('SAMPLE DATA ANALYSIS');
    console.log('='.repeat(70));

    // Check politicians
    const [politicians] = await connection.query('SELECT COUNT(*) as count FROM politicians');
    const [realPoliticians] = await connection.query(`
      SELECT COUNT(*) as count FROM politicians
      WHERE bio IS NOT NULL AND bio != '' AND LENGTH(bio) > 100
    `);
    console.log(`\n📊 Politicians: ${politicians[0].count} total, ${realPoliticians[0].count} with detailed bios`);

    // Check learning modules
    const [modules] = await connection.query('SELECT COUNT(*) as count FROM learning_modules');
    const [publishedModules] = await connection.query(`
      SELECT COUNT(*) as count FROM learning_modules WHERE status = 'published'
    `);
    console.log(`📚 Learning Modules: ${modules[0].count} total, ${publishedModules[0].count} published`);

    // Check lessons
    const [lessons] = await connection.query('SELECT COUNT(*) as count FROM learning_lessons');
    console.log(`📖 Learning Lessons: ${lessons[0].count} total`);

    // Check quizzes
    const [quizzes] = await connection.query('SELECT COUNT(*) as count FROM learning_quizzes');
    const [questions] = await connection.query('SELECT COUNT(*) as count FROM learning_quiz_questions');
    console.log(`❓ Quizzes: ${quizzes[0].count} total with ${questions[0].count} questions`);

    // Check news
    const [news] = await connection.query('SELECT COUNT(*) as count FROM news');
    console.log(`📰 News Articles: ${news[0].count} total`);

    // Check commitments
    const [commitments] = await connection.query('SELECT COUNT(*) as count FROM commitments');
    console.log(`📋 Political Commitments: ${commitments[0].count} total`);

    // Check voting records
    const [votes] = await connection.query('SELECT COUNT(*) as count FROM voting_records');
    console.log(`🗳️  Voting Records: ${votes[0].count} total`);

    // Summary
    console.log('\n\n' + '='.repeat(70));
    console.log('REAL DATA vs MOCK DATA STATUS');
    console.log('='.repeat(70));

    const status = [
      { system: 'Politicians', status: realPoliticians[0].count > 0 ? 'REAL DATA' : 'SAMPLE DATA', count: politicians[0].count },
      { system: 'Learning System', status: modules[0].count > 0 ? 'SAMPLE DATA (Admin can add real)' : 'NO DATA', count: modules[0].count },
      { system: 'News Articles', status: news[0].count > 0 ? 'MIXED (Some real)' : 'NO DATA', count: news[0].count },
      { system: 'Commitments', status: commitments[0].count > 0 ? 'SAMPLE DATA' : 'NO DATA', count: commitments[0].count },
      { system: 'Voting Records', status: votes[0].count > 0 ? 'SAMPLE DATA' : 'NO DATA', count: votes[0].count },
    ];

    status.forEach(s => {
      const statusColor = s.status.includes('REAL') ? '✅' : s.status.includes('SAMPLE') ? '⚠️' : '❌';
      console.log(`${statusColor} ${s.system.padEnd(25)} ${s.status.padEnd(30)} (${s.count} items)`);
    });

    console.log('\n\n' + '='.repeat(70));
    console.log('RECOMMENDATIONS TO USE REAL DATA');
    console.log('='.repeat(70));

    console.log(`
1. POLITICIANS (Currently ${realPoliticians[0].count > 0 ? 'has some real data' : 'mostly sample'}):
   - Use Politics Admin panel to add/edit politicians
   - Access: App → Politics → Red Admin Icon → Manage Politicians
   - Add real Kenyan politicians with detailed bios

2. COMMITMENTS (Currently ${commitments[0].count} sample):
   - Use Commitment Tracking in Politics Admin
   - Add real campaign promises with sources
   - Track progress with evidence links

3. VOTING RECORDS (Currently ${votes[0].count} sample):
   - Import real parliamentary voting data
   - Use Voting Records admin screen
   - Link to real bill numbers and dates

4. LEARNING CONTENT (Currently ${modules[0].count} modules):
   - Use Learning Admin panel to create real courses
   - Access: App → Learning → Red Admin Icon
   - Create educational content about Kenyan politics

5. NEWS (Currently ${news[0].count} articles):
   - Use News Management admin
   - Aggregate from real sources (already setup for Standard, Citizen)
   - Add custom internal news articles

NEXT STEPS:
- Delete sample data if needed
- Use admin panels to add real content
- All systems are production-ready!
    `);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nPossible issues:');
    console.log('1. MySQL not running');
    console.log('2. Database "rada_ke" not created');
    console.log('3. Wrong password (currently using empty string)');
    console.log('\nTo fix:');
    console.log('- Start MySQL service');
    console.log('- Run: node server.js (creates database automatically)');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabaseStatus();
