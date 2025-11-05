const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_ke'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL Database\n');

  const updates = [
    // ========== POLITICIAN_NEWS ENHANCEMENTS ==========
    {
      table: 'politician_news',
      name: 'Add icon to news',
      query: 'ALTER TABLE politician_news ADD COLUMN icon VARCHAR(50) NULL DEFAULT "📰" AFTER content'
    },
    {
      table: 'politician_news',
      name: 'Add image_url to news',
      query: 'ALTER TABLE politician_news ADD COLUMN image_url VARCHAR(1000) NULL AFTER icon'
    },
    {
      table: 'politician_news',
      name: 'Add source_url to news',
      query: 'ALTER TABLE politician_news ADD COLUMN source_url VARCHAR(1000) NULL AFTER source'
    },

    // ========== POLITICIAN_TIMELINE ENHANCEMENTS ==========
    {
      table: 'politician_timeline',
      name: 'Add icon to timeline',
      query: 'ALTER TABLE politician_timeline ADD COLUMN icon VARCHAR(50) NULL DEFAULT "📅"'
    },
    {
      table: 'politician_timeline',
      name: 'Add image_url to timeline',
      query: 'ALTER TABLE politician_timeline ADD COLUMN image_url VARCHAR(1000) NULL'
    },
    // category, source, source_url already added in previous migration

    // ========== POLITICIAN_COMMITMENTS ENHANCEMENTS ==========
    {
      table: 'politician_commitments',
      name: 'Add custom_category to commitments',
      query: 'ALTER TABLE politician_commitments ADD COLUMN custom_category VARCHAR(255) NULL'
    },
    {
      table: 'politician_commitments',
      name: 'Add type to commitments',
      query: 'ALTER TABLE politician_commitments ADD COLUMN type VARCHAR(100) NULL'
    },
    {
      table: 'politician_commitments',
      name: 'Add custom_type to commitments',
      query: 'ALTER TABLE politician_commitments ADD COLUMN custom_type VARCHAR(255) NULL'
    },
    {
      table: 'politician_commitments',
      name: 'Add icon to commitments',
      query: 'ALTER TABLE politician_commitments ADD COLUMN icon VARCHAR(50) NULL DEFAULT "🤝"'
    },
    {
      table: 'politician_commitments',
      name: 'Add image_url to commitments',
      query: 'ALTER TABLE politician_commitments ADD COLUMN image_url VARCHAR(1000) NULL'
    },
    {
      table: 'politician_commitments',
      name: 'Add source to commitments',
      query: 'ALTER TABLE politician_commitments ADD COLUMN source VARCHAR(255) NULL'
    },
    {
      table: 'politician_commitments',
      name: 'Add source_url to commitments',
      query: 'ALTER TABLE politician_commitments ADD COLUMN source_url VARCHAR(1000) NULL'
    },
    // progress_percentage, summary, evidence_text, evidence_url, source_links, tags already added

    // ========== POLITICIAN_VOTING_RECORDS ENHANCEMENTS ==========
    {
      table: 'politician_voting_records',
      name: 'Add custom_category to voting records',
      query: 'ALTER TABLE politician_voting_records ADD COLUMN custom_category VARCHAR(255) NULL'
    },
    {
      table: 'politician_voting_records',
      name: 'Add icon to voting records',
      query: 'ALTER TABLE politician_voting_records ADD COLUMN icon VARCHAR(50) NULL DEFAULT "🗳️"'
    },
    {
      table: 'politician_voting_records',
      name: 'Add image_url to voting records',
      query: 'ALTER TABLE politician_voting_records ADD COLUMN image_url VARCHAR(1000) NULL'
    },
    {
      table: 'politician_voting_records',
      name: 'Add source to voting records',
      query: 'ALTER TABLE politician_voting_records ADD COLUMN source VARCHAR(255) NULL'
    },
    {
      table: 'politician_voting_records',
      name: 'Add source_url to voting records',
      query: 'ALTER TABLE politician_voting_records ADD COLUMN source_url VARCHAR(1000) NULL'
    }
    // bill_number, legislative_session, bill_status, vote_result, notes, bill_url, source_links, tags already added
  ];

  let completed = 0;
  const results = {
    'politician_news': [],
    'politician_timeline': [],
    'politician_commitments': [],
    'politician_voting_records': []
  };

  console.log('🔧 Enhancing admin form tables with new fields...\n');

  updates.forEach(update => {
    connection.query(update.query, (error) => {
      if (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  ${update.name}: Already exists (skipped)`);
          results[update.table].push({ name: update.name, status: 'exists' });
        } else {
          console.error(`❌ ${update.name}: ${error.message}`);
          results[update.table].push({ name: update.name, status: 'error', error: error.message });
        }
      } else {
        console.log(`✅ ${update.name}`);
        results[update.table].push({ name: update.name, status: 'added' });
      }

      completed++;
      if (completed === updates.length) {
        console.log('\n📊 Verifying all table schemas...\n');

        const tables = ['politician_news', 'politician_timeline', 'politician_commitments', 'politician_voting_records'];
        let tablesChecked = 0;

        tables.forEach(table => {
          connection.query(`SHOW COLUMNS FROM ${table}`, (error, columns) => {
            if (error) {
              console.error(`❌ Error checking ${table}:`, error.message);
            } else {
              console.log(`📋 ${table} structure:`);
              columns.forEach(col => {
                console.log(`  - ${col.Field} (${col.Type})`);
              });
              console.log('');
            }

            tablesChecked++;
            if (tablesChecked === tables.length) {
              console.log('\n✨ All tables enhanced successfully!');
              console.log('\n📝 Summary:');
              Object.keys(results).forEach(table => {
                const added = results[table].filter(r => r.status === 'added').length;
                const exists = results[table].filter(r => r.status === 'exists').length;
                const errors = results[table].filter(r => r.status === 'error').length;
                if (added > 0 || exists > 0 || errors > 0) {
                  console.log(`\n${table}:`);
                  console.log(`  ✅ Added: ${added} fields`);
                  console.log(`  ⚠️  Existed: ${exists} fields`);
                  if (errors > 0) console.log(`  ❌ Errors: ${errors} fields`);
                }
              });
              connection.end();
            }
          });
        });
      }
    });
  });
});
