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
    // ========== POLITICIAN_TIMELINE ENHANCEMENTS ==========
    {
      table: 'politician_timeline',
      name: 'Add category column to timeline',
      query: 'ALTER TABLE politician_timeline ADD COLUMN category VARCHAR(100) NULL AFTER type'
    },
    {
      table: 'politician_timeline',
      name: 'Add summary column to timeline',
      query: 'ALTER TABLE politician_timeline ADD COLUMN summary TEXT NULL AFTER category'
    },
    {
      table: 'politician_timeline',
      name: 'Add source column to timeline',
      query: 'ALTER TABLE politician_timeline ADD COLUMN source VARCHAR(255) NULL AFTER summary'
    },
    {
      table: 'politician_timeline',
      name: 'Add source_url column to timeline',
      query: 'ALTER TABLE politician_timeline ADD COLUMN source_url VARCHAR(500) NULL AFTER source'
    },
    {
      table: 'politician_timeline',
      name: 'Add source_links JSON to timeline',
      query: 'ALTER TABLE politician_timeline ADD COLUMN source_links JSON NULL AFTER source_url'
    },
    {
      table: 'politician_timeline',
      name: 'Add tags JSON to timeline',
      query: 'ALTER TABLE politician_timeline ADD COLUMN tags JSON NULL AFTER source_links'
    },
    {
      table: 'politician_timeline',
      name: 'Add icon to timeline',
      query: 'ALTER TABLE politician_timeline ADD COLUMN icon VARCHAR(50) NULL AFTER tags'
    },

    // ========== POLITICIAN_COMMITMENTS ENHANCEMENTS ==========
    {
      table: 'politician_commitments',
      name: 'Add summary column to commitments',
      query: 'ALTER TABLE politician_commitments ADD COLUMN summary TEXT NULL AFTER description'
    },
    {
      table: 'politician_commitments',
      name: 'Add evidence_text to commitments',
      query: 'ALTER TABLE politician_commitments ADD COLUMN evidence_text TEXT NULL AFTER progress'
    },
    {
      table: 'politician_commitments',
      name: 'Add evidence_url to commitments',
      query: 'ALTER TABLE politician_commitments ADD COLUMN evidence_url VARCHAR(500) NULL AFTER evidence_text'
    },
    {
      table: 'politician_commitments',
      name: 'Add source_links JSON to commitments',
      query: 'ALTER TABLE politician_commitments ADD COLUMN source_links JSON NULL AFTER evidence_url'
    },
    {
      table: 'politician_commitments',
      name: 'Add tags JSON to commitments',
      query: 'ALTER TABLE politician_commitments ADD COLUMN tags JSON NULL AFTER source_links'
    },
    {
      table: 'politician_commitments',
      name: 'Add progress_percentage to commitments',
      query: 'ALTER TABLE politician_commitments ADD COLUMN progress_percentage INT NULL AFTER progress'
    },

    // ========== POLITICIAN_VOTING_RECORDS ENHANCEMENTS ==========
    {
      table: 'politician_voting_records',
      name: 'Add bill_number to voting records',
      query: 'ALTER TABLE politician_voting_records ADD COLUMN bill_number VARCHAR(100) NULL AFTER bill_name'
    },
    {
      table: 'politician_voting_records',
      name: 'Add legislative_session to voting records',
      query: 'ALTER TABLE politician_voting_records ADD COLUMN legislative_session VARCHAR(100) NULL AFTER bill_number'
    },
    {
      table: 'politician_voting_records',
      name: 'Add bill_status to voting records',
      query: 'ALTER TABLE politician_voting_records ADD COLUMN bill_status VARCHAR(50) NULL AFTER legislative_session'
    },
    {
      table: 'politician_voting_records',
      name: 'Add vote_result to voting records',
      query: 'ALTER TABLE politician_voting_records ADD COLUMN vote_result VARCHAR(255) NULL AFTER bill_status'
    },
    {
      table: 'politician_voting_records',
      name: 'Add notes to voting records',
      query: 'ALTER TABLE politician_voting_records ADD COLUMN notes TEXT NULL AFTER vote_result'
    },
    {
      table: 'politician_voting_records',
      name: 'Add bill_url to voting records',
      query: 'ALTER TABLE politician_voting_records ADD COLUMN bill_url VARCHAR(500) NULL AFTER notes'
    },
    {
      table: 'politician_voting_records',
      name: 'Add source_url to voting records',
      query: 'ALTER TABLE politician_voting_records ADD COLUMN source_url VARCHAR(500) NULL AFTER bill_url'
    },
    {
      table: 'politician_voting_records',
      name: 'Add source_links JSON to voting records',
      query: 'ALTER TABLE politician_voting_records ADD COLUMN source_links JSON NULL AFTER source_url'
    },
    {
      table: 'politician_voting_records',
      name: 'Add tags JSON to voting records',
      query: 'ALTER TABLE politician_voting_records ADD COLUMN tags JSON NULL AFTER source_links'
    },
    {
      table: 'politician_voting_records',
      name: 'Rename date to vote_date in voting records',
      query: 'ALTER TABLE politician_voting_records CHANGE COLUMN date vote_date DATE'
    }
  ];

  let completed = 0;
  const results = {
    'politician_timeline': [],
    'politician_commitments': [],
    'politician_voting_records': []
  };

  console.log('🔧 Enhancing all politician tables with new fields...\n');

  updates.forEach(update => {
    connection.query(update.query, (error) => {
      if (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  ${update.name}: Already exists (skipped)`);
          results[update.table].push({ name: update.name, status: 'exists' });
        } else if (error.code === 'ER_BAD_FIELD_ERROR') {
          console.log(`⚠️  ${update.name}: Field doesn't exist for rename (skipped)`);
          results[update.table].push({ name: update.name, status: 'skipped' });
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

        const tables = ['politician_timeline', 'politician_commitments', 'politician_voting_records'];
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
                console.log(`\n${table}:`);
                console.log(`  ✅ Added: ${added} fields`);
                console.log(`  ⚠️  Existed: ${exists} fields`);
                if (errors > 0) console.log(`  ❌ Errors: ${errors} fields`);
              });
              connection.end();
            }
          });
        });
      }
    });
  });
});
