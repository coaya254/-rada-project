const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'radamtaani'
});

console.log('🔄 Migrating Source System to JSON Format...\n');

const tables = [
  { name: 'politician_documents', junctionTable: 'politician_document_sources', foreignKey: 'document_id' },
  { name: 'politician_news', junctionTable: 'politician_news_sources', foreignKey: 'news_id' },
  { name: 'politician_timeline', junctionTable: 'politician_timeline_sources', foreignKey: 'timeline_id' },
  { name: 'politician_commitments', junctionTable: 'politician_commitments_sources', foreignKey: 'commitment_id' },
  { name: 'voting_records', junctionTable: 'voting_records_sources', foreignKey: 'voting_record_id' },
  { name: 'politician_achievements', junctionTable: 'politician_achievements_sources', foreignKey: 'achievement_id' },
  { name: 'politician_parties', junctionTable: 'politician_parties_sources', foreignKey: 'party_id' }
];

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  console.log('✅ Connected to database\n');

  let processed = 0;

  tables.forEach(table => {
    // Step 1: Add sources_json column if it doesn't exist
    db.query(
      `SHOW COLUMNS FROM ${table.name} LIKE 'sources_json'`,
      (err, columns) => {
        if (err) {
          console.error(`❌ Error checking ${table.name}:`, err.message);
          checkComplete();
          return;
        }

        if (columns.length === 0) {
          // Column doesn't exist, add it
          console.log(`📝 Adding sources_json column to ${table.name}...`);
          db.query(
            `ALTER TABLE ${table.name} ADD COLUMN sources_json TEXT`,
            (err) => {
              if (err) {
                console.error(`   ❌ Error adding column:`, err.message);
                checkComplete();
                return;
              }
              console.log(`   ✅ Column added successfully`);
              migrateSources(table);
            }
          );
        } else {
          console.log(`ℹ️  sources_json column already exists in ${table.name}`);
          migrateSources(table);
        }
      }
    );
  });

  function migrateSources(table) {
    // Step 2: Migrate existing sources from junction table to JSON
    console.log(`🔄 Migrating sources for ${table.name}...`);

    const query = `
      SELECT
        t.id,
        GROUP_CONCAT(
          CONCAT('{"name":"', s.name, '","url":"', IFNULL(s.default_url, ''), '","color":"', IFNULL(s.button_color, '#3B82F6'), '"}')
          SEPARATOR ','
        ) as sources_data
      FROM ${table.name} t
      LEFT JOIN ${table.junctionTable} jt ON t.id = jt.${table.foreignKey}
      LEFT JOIN sources s ON jt.source_id = s.id
      WHERE s.id IS NOT NULL
      GROUP BY t.id
    `;

    db.query(query, (err, results) => {
      if (err) {
        // Junction table might not exist, that's okay
        console.log(`   ℹ️  No existing sources to migrate (${err.code})`);
        checkComplete();
        return;
      }

      if (results.length === 0) {
        console.log(`   ℹ️  No sources to migrate`);
        checkComplete();
        return;
      }

      console.log(`   📊 Found ${results.length} records with sources`);

      let migratedCount = 0;
      results.forEach((row) => {
        const sourcesJson = `[${row.sources_data}]`;

        db.query(
          `UPDATE ${table.name} SET sources_json = ? WHERE id = ?`,
          [sourcesJson, row.id],
          (err) => {
            if (err) {
              console.error(`   ❌ Error migrating record ${row.id}:`, err.message);
            } else {
              migratedCount++;
            }

            if (migratedCount + (results.length - migratedCount) === results.length) {
              console.log(`   ✅ Migrated ${migratedCount} records`);
              checkComplete();
            }
          }
        );
      });
    });
  }

  function checkComplete() {
    processed++;
    if (processed === tables.length) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ Migration Complete!');
      console.log('='.repeat(60));
      console.log('\n📋 Summary:');
      console.log(`   • Added sources_json column to ${tables.length} tables`);
      console.log(`   • Migrated existing sources from junction tables`);
      console.log('\n💡 Next Steps:');
      console.log('   1. Update admin forms to use SourceButtonManager component');
      console.log('   2. Update backend APIs to save/load sources_json');
      console.log('   3. Update user UI to display SourceButtons');
      console.log('   4. (Optional) Drop old junction tables once verified working\n');
      db.end();
    }
  }
});
