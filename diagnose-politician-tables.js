// Diagnose all politician tables for issues
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_mtaani'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');
});

const tables = [
  'politician_voting_records',
  'politician_parties',
  'politician_achievements',
  'politicians',
  'politician_news_sources',
  'politician_timeline_sources',
  'politician_commitments_sources',
  'politician_voting_records_sources',
  'politician_parties_sources',
  'politician_achievements_sources',
  'sources'
];

async function checkTable(tableName) {
  return new Promise((resolve) => {
    db.query(`DESCRIBE ${tableName}`, (err, columns) => {
      if (err) {
        console.log(`❌ ${tableName}: Table does NOT exist`);
        console.log(`   Error: ${err.message}\n`);
        resolve({ exists: false, columns: [] });
      } else {
        console.log(`✅ ${tableName}: Table exists`);
        console.log(`   Columns: ${columns.map(c => c.Field).join(', ')}\n`);
        resolve({ exists: true, columns: columns.map(c => c.Field) });
      }
    });
  });
}

async function checkDataCounts() {
  console.log('\n========== DATA COUNTS ==========\n');

  const dataQueries = [
    'SELECT COUNT(*) as count FROM politician_voting_records',
    'SELECT COUNT(*) as count FROM politician_parties',
    'SELECT COUNT(*) as count FROM politician_achievements',
    'SELECT COUNT(*) as count FROM sources',
    'SELECT COUNT(*) as count FROM politicians WHERE constituency_representation IS NOT NULL',
  ];

  for (const query of dataQueries) {
    await new Promise((resolve) => {
      db.query(query, (err, results) => {
        if (err) {
          console.log(`❌ ${query.split('FROM')[1]}: Error - ${err.message}`);
        } else {
          console.log(`📊 ${query.split('FROM')[1]}: ${results[0].count} records`);
        }
        resolve();
      });
    });
  }
}

async function diagnose() {
  console.log('========== TABLE EXISTENCE CHECK ==========\n');

  for (const table of tables) {
    await checkTable(table);
  }

  await checkDataCounts();

  console.log('\n========== SPECIFIC ISSUES CHECK ==========\n');

  // Check if politicians table has constituency fields
  db.query('DESCRIBE politicians', (err, columns) => {
    if (!err) {
      const hasConstituencyRep = columns.some(c => c.Field === 'constituency_representation');
      const hasConstituencyFocus = columns.some(c => c.Field === 'constituency_focus_areas');

      console.log(`Politicians table constituency fields:`);
      console.log(`  constituency_representation: ${hasConstituencyRep ? '✅ EXISTS' : '❌ MISSING'}`);
      console.log(`  constituency_focus_areas: ${hasConstituencyFocus ? '✅ EXISTS' : '❌ MISSING'}\n`);
    }

    // Check sources table data
    db.query('SELECT id, name FROM sources LIMIT 5', (err, sources) => {
      if (!err && sources.length > 0) {
        console.log(`Sample sources (${sources.length} shown):`);
        sources.forEach(s => console.log(`  - ${s.name} (ID: ${s.id})`));
      } else if (!err) {
        console.log('⚠️  Sources table is EMPTY - this is why source selectors are empty!\n');
      }

      db.end();
      console.log('\n========== DIAGNOSIS COMPLETE ==========');
    });
  });
}

diagnose();
