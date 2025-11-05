// ===================================================================
// MySQL Hosting Credentials Checker
// Run this to find your hosting MySQL details
// ===================================================================

const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║     MySQL Hosting Credentials Checker                     ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Test different common hosting MySQL configurations
const testConfigs = [
  {
    name: 'Local MySQL (Current)',
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD || '!1754Swm.',
    database: process.env.DB_NAME || 'rada_ke'
  },
  {
    name: 'Hosting MySQL - Format 1 (username_dbname)',
    host: 'localhost',
    user: 'coayaorg_polihub',
    password: process.env.DB_PASSWORD || '!1754Swm.',
    database: 'coayaorg_polihub_db'
  },
  {
    name: 'Hosting MySQL - Format 2 (root access)',
    host: 'localhost',
    user: 'coayaorg',
    password: process.env.DB_PASSWORD || '!1754Swm.',
    database: 'coayaorg_rada_ke'
  },
  {
    name: 'Remote MySQL (radamtaani.co.ke)',
    host: 'radamtaani.co.ke',
    user: 'coayaorg_root',
    password: process.env.DB_PASSWORD || '!1754Swm.',
    database: 'coayaorg_rada_ke'
  }
];

async function testConnection(config) {
  try {
    console.log(`\n🔍 Testing: ${config.name}`);
    console.log(`   Host: ${config.host}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Database: ${config.database}`);
    
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      connectTimeout: 5000
    });

    console.log('   ✅ CONNECTION SUCCESSFUL!\n');
    
    // Get database info
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('   📊 Available Databases:');
    databases.forEach(db => {
      console.log(`      - ${db.Database}`);
    });

    // Get tables in current database
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n   📋 Tables in ${config.database}:`);
    if (tables.length === 0) {
      console.log('      (No tables found - database is empty)');
    } else {
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`      - ${tableName}`);
      });
    }

    // Get MySQL version
    const [version] = await connection.query('SELECT VERSION() as version');
    console.log(`\n   💾 MySQL Version: ${version[0].version}`);

    // Get current user
    const [user] = await connection.query('SELECT USER() as user');
    console.log(`   👤 Connected as: ${user[0].user}`);

    await connection.end();

    // Save working config
    saveWorkingConfig(config);
    
    return true;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    return false;
  }
}

function saveWorkingConfig(config) {
  const envContent = `# Production MySQL Configuration (VERIFIED WORKING)
# Generated: ${new Date().toISOString()}

DB_HOST=${config.host}
DB_USER=${config.user}
DB_PASSWORD=${config.password}
DB_NAME=${config.database}
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL
CLIENT_URL=https://radamtaani.co.ke

# Security
JWT_SECRET=${process.env.JWT_SECRET || 'rada_ke_secret_2024_xyz789'}

# File Upload
MAX_FILE_SIZE=10485760
`;

  fs.writeFileSync('.env.production', envContent);
  console.log('\n✅ Saved working configuration to .env.production');
}

async function checkAllDatabases(config) {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      connectTimeout: 5000
    });

    console.log('\n📊 Scanning all databases for your data...\n');
    
    const [databases] = await connection.query('SHOW DATABASES');
    
    for (const db of databases) {
      const dbName = db.Database;
      
      // Skip system databases
      if (['information_schema', 'mysql', 'performance_schema', 'sys'].includes(dbName)) {
        continue;
      }

      try {
        await connection.query(`USE ${dbName}`);
        const [tables] = await connection.query('SHOW TABLES');
        
        if (tables.length > 0) {
          console.log(`\n   Database: ${dbName}`);
          console.log(`   Tables (${tables.length}):`);
          tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`      - ${tableName}`);
          });
        }
      } catch (err) {
        // Skip databases we can't access
      }
    }

    await connection.end();
  } catch (error) {
    console.log(`   Error scanning databases: ${error.message}`);
  }
}

async function showCurrentEnv() {
  console.log('\n📝 Current .env Configuration:\n');
  console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   DB_USER: ${process.env.DB_USER || 'root'}`);
  console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-4) : 'Not set'}`);
  console.log(`   DB_NAME: ${process.env.DB_NAME || 'rada_ke'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
}

async function manualTest() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     Manual MySQL Connection Test                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const host = await new Promise(resolve => {
    rl.question('MySQL Host (default: localhost): ', answer => {
      resolve(answer || 'localhost');
    });
  });

  const user = await new Promise(resolve => {
    rl.question('MySQL User (default: coayaorg): ', answer => {
      resolve(answer || 'coayaorg');
    });
  });

  const password = await new Promise(resolve => {
    rl.question('MySQL Password (press Enter to use current): ', answer => {
      resolve(answer || process.env.DB_PASSWORD);
    });
  });

  const database = await new Promise(resolve => {
    rl.question('Database Name (default: coayaorg_rada_ke): ', answer => {
      resolve(answer || 'coayaorg_rada_ke');
    });
  });

  rl.close();

  await testConnection({
    name: 'Manual Configuration',
    host,
    user,
    password,
    database
  });
}

// Main execution
async function main() {
  showCurrentEnv();

  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Testing common MySQL configurations...\n');

  let successCount = 0;

  for (const config of testConfigs) {
    const success = await testConnection(config);
    if (success) {
      successCount++;
      
      // If successful, check all databases
      await checkAllDatabases(config);
      break; // Stop after first successful connection
    }
  }

  if (successCount === 0) {
    console.log('\n❌ None of the automatic tests succeeded.\n');
    console.log('Let\'s try a manual test with your hosting credentials...\n');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Would you like to test with custom credentials? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        rl.close();
        await manualTest();
      } else {
        rl.close();
        console.log('\n📖 Next Steps:\n');
        console.log('1. Login to your cPanel at: https://radamtaani.co.ke/cpanel');
        console.log('2. Go to "MySQL® Databases"');
        console.log('3. Look for your database name (format: coayaorg_databasename)');
        console.log('4. Look for your database user (format: coayaorg_username)');
        console.log('5. Run this script again with the correct credentials');
        console.log('\nOr create a new database:');
        console.log('1. In cPanel → MySQL Databases');
        console.log('2. Create New Database: polihub_db');
        console.log('3. Create New User: polihub_user');
        console.log('4. Add User to Database with ALL PRIVILEGES\n');
      }
    });
  } else {
    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log('✅ SUCCESS! Your MySQL credentials have been verified.');
    console.log('\n📄 Production configuration saved to: .env.production');
    console.log('\n🚀 Next Steps for Deployment:');
    console.log('   1. Build your React app: cd polihub && npm run build');
    console.log('   2. Use .env.production when deploying to server');
    console.log('   3. Upload files to your hosting');
    console.log('   4. Setup Node.js app in cPanel\n');
  }
}

main().catch(err => {
  console.error('\n❌ Script Error:', err.message);
  console.log('\nMake sure mysql2 is installed:');
  console.log('   npm install mysql2');
});
