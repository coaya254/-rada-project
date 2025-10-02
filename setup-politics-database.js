const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');

const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '', // Update with your MySQL password
  charset: 'utf8mb4',
  timezone: 'Z'
};

const DATABASE_NAME = 'rada_politics';

async function setupDatabase() {
  let connection;

  try {
    console.log('🔍 Connecting to MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);

    console.log('📝 Creating database...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);
    await connection.execute(`USE ${DATABASE_NAME}`);

    console.log('📋 Reading schema file...');
    const schemaSQL = await fs.readFile('politics-database-schema.sql', 'utf8');

    console.log('🏗️ Executing schema...');
    // Split by semicolon and execute each statement
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.error('Error executing statement:', statement.substring(0, 100) + '...');
            console.error('Error:', error.message);
          }
        }
      }
    }

    console.log('🔐 Setting up admin users with proper passwords...');

    // Hash the passwords
    const superAdminHash = await bcrypt.hash('Admin@2024!', 10);
    const contentAdminHash = await bcrypt.hash('Content@2024!', 10);
    const moderatorHash = await bcrypt.hash('Mod@2024!', 10);

    // Update admin users with proper password hashes
    await connection.execute(`
      UPDATE admin_users SET password_hash = ? WHERE username = 'superadmin'
    `, [superAdminHash]);

    await connection.execute(`
      UPDATE admin_users SET password_hash = ? WHERE username = 'contentadmin'
    `, [contentAdminHash]);

    await connection.execute(`
      UPDATE admin_users SET password_hash = ? WHERE username = 'moderator'
    `, [moderatorHash]);

    console.log('✅ Database setup completed successfully!');
    console.log('');
    console.log('📋 Admin Users Created:');
    console.log('  Super Admin: username: superadmin, password: Admin@2024!');
    console.log('  Content Admin: username: contentadmin, password: Content@2024!');
    console.log('  Moderator: username: moderator, password: Mod@2024!');
    console.log('');
    console.log('🚀 You can now start the backend server: node politics-backend-clean.js');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();