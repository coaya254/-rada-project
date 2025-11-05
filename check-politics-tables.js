// Script to check all politics/politician related tables in the database
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '!1754Swm',
  database: process.env.DB_NAME || 'radamtani'
};

// All tables that should exist for politicians/politics features
const expectedTables = [
  'politicians',                    // Base politician table
  'politician_timeline',           // Timeline events
  'politician_commitments',        // Promises/commitments
  'politician_voting_records',     // Voting records
  'politician_documents',          // Documents (speeches, policies, etc.)
  'politician_news',               // News articles
  'politician_career',             // Career information
  'politician_analytics',          // Analytics data
  'admin_audit_log',              // Audit log for admin actions
  'admin_users',                  // Admin users table
  'admin_permissions',            // Admin permissions
];

async function checkTables() {
  let connection;

  try {
    console.log('🔍 Connecting to database...\n');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    console.log('📊 Checking politics/politician related tables:\n');
    console.log('='.repeat(80));

    const results = {
      existing: [],
      missing: [],
      tableDetails: {}
    };

    for (const tableName of expectedTables) {
      try {
        // Check if table exists
        const [tables] = await connection.query(
          "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
          [dbConfig.database, tableName]
        );

        if (tables.length > 0) {
          results.existing.push(tableName);

          // Get table structure
          const [columns] = await connection.query(`DESCRIBE ${tableName}`);
          results.tableDetails[tableName] = columns;

          // Get row count
          const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          const rowCount = count[0].count;

          console.log(`✅ ${tableName.padEnd(35)} - ${columns.length} columns, ${rowCount} rows`);
        } else {
          results.missing.push(tableName);
          console.log(`❌ ${tableName.padEnd(35)} - MISSING`);
        }
      } catch (error) {
        results.missing.push(tableName);
        console.log(`❌ ${tableName.padEnd(35)} - ERROR: ${error.message}`);
      }
    }

    console.log('='.repeat(80));
    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Existing tables: ${results.existing.length}/${expectedTables.length}`);
    console.log(`   ❌ Missing tables:  ${results.missing.length}/${expectedTables.length}\n`);

    if (results.missing.length > 0) {
      console.log('⚠️  Missing tables:');
      results.missing.forEach(table => console.log(`   - ${table}`));
      console.log('');
    }

    // Show detailed structure for key tables
    console.log('\n📋 Detailed Table Structures:\n');
    console.log('='.repeat(80));

    const keyTables = ['politicians', 'politician_timeline', 'politician_commitments',
                       'politician_voting_records', 'politician_documents'];

    for (const tableName of keyTables) {
      if (results.tableDetails[tableName]) {
        console.log(`\n🔹 ${tableName}:`);
        console.log('-'.repeat(80));
        results.tableDetails[tableName].forEach(col => {
          const nullable = col.Null === 'YES' ? 'NULL' : 'NOT NULL';
          const key = col.Key ? ` [${col.Key}]` : '';
          const defaultVal = col.Default ? ` (default: ${col.Default})` : '';
          console.log(`   ${col.Field.padEnd(30)} ${col.Type.padEnd(20)} ${nullable}${key}${defaultVal}`);
        });
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Database check complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the check
checkTables();
