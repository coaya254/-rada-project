// Script to create missing politics/politician related tables
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '!1754Swm',
  database: process.env.DB_NAME || 'radamtani'
};

const createTableQueries = {
  // Politician Analytics Table
  politician_analytics: `
    CREATE TABLE IF NOT EXISTS politician_analytics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      politician_id INT NOT NULL,
      metric_name VARCHAR(100) NOT NULL COMMENT 'Name of the metric (e.g., profile_views, search_impressions)',
      metric_value INT DEFAULT 0 COMMENT 'Value of the metric',
      metric_date DATE NOT NULL COMMENT 'Date of the metric',
      period VARCHAR(20) DEFAULT 'daily' COMMENT 'Period type: daily, weekly, monthly',
      metadata JSON COMMENT 'Additional metadata about the metric',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_politician_id (politician_id),
      INDEX idx_metric_name (metric_name),
      INDEX idx_metric_date (metric_date),
      INDEX idx_period (period),
      UNIQUE KEY unique_metric (politician_id, metric_name, metric_date, period),
      FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Analytics and metrics data for politician profiles';
  `,

  // Admin Audit Log Table
  admin_audit_log: `
    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_user_id INT NULL COMMENT 'ID of the admin user who performed the action',
      admin_username VARCHAR(255) NULL COMMENT 'Username of the admin (stored for reference even if user is deleted)',
      action VARCHAR(100) NOT NULL COMMENT 'Action performed (CREATE, UPDATE, DELETE, PUBLISH, etc.)',
      entity_type VARCHAR(100) NOT NULL COMMENT 'Type of entity affected (politician, timeline_event, etc.)',
      entity_id INT NULL COMMENT 'ID of the affected entity',
      entity_name VARCHAR(255) NULL COMMENT 'Name/title of the affected entity',
      old_value JSON COMMENT 'Previous value before change',
      new_value JSON COMMENT 'New value after change',
      ip_address VARCHAR(45) NULL COMMENT 'IP address of the admin',
      user_agent TEXT NULL COMMENT 'User agent string',
      metadata JSON COMMENT 'Additional metadata about the action',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_admin_user_id (admin_user_id),
      INDEX idx_action (action),
      INDEX idx_entity_type (entity_type),
      INDEX idx_entity_id (entity_id),
      INDEX idx_created_at (created_at),
      FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Audit log for all admin actions and changes';
  `,

  // Admin Permissions Table
  admin_permissions: `
    CREATE TABLE IF NOT EXISTS admin_permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_user_id INT NOT NULL COMMENT 'ID of the admin user',
      permission_key VARCHAR(100) NOT NULL COMMENT 'Permission key (e.g., politicians.create, politicians.edit)',
      permission_name VARCHAR(255) NOT NULL COMMENT 'Human-readable permission name',
      permission_category VARCHAR(100) DEFAULT 'general' COMMENT 'Category of permission (politicians, content, system)',
      granted TINYINT(1) DEFAULT 1 COMMENT 'Whether permission is granted or revoked',
      granted_by INT NULL COMMENT 'Admin user ID who granted this permission',
      granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NULL COMMENT 'Optional expiration date for the permission',
      metadata JSON COMMENT 'Additional metadata about the permission',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_admin_user_id (admin_user_id),
      INDEX idx_permission_key (permission_key),
      INDEX idx_permission_category (permission_category),
      INDEX idx_granted (granted),
      UNIQUE KEY unique_user_permission (admin_user_id, permission_key),
      FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
      FOREIGN KEY (granted_by) REFERENCES admin_users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Granular permissions for admin users';
  `
};

async function createTables() {
  let connection;

  try {
    console.log('🔍 Connecting to database...\n');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    console.log('📊 Creating missing tables:\n');
    console.log('='.repeat(80));

    for (const [tableName, query] of Object.entries(createTableQueries)) {
      try {
        console.log(`🔨 Creating table: ${tableName}...`);
        await connection.query(query);
        console.log(`✅ Table ${tableName} created successfully\n`);
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERR') {
          console.log(`ℹ️  Table ${tableName} already exists\n`);
        } else {
          console.error(`❌ Error creating table ${tableName}:`, error.message, '\n');
        }
      }
    }

    console.log('='.repeat(80));

    // Verify tables were created
    console.log('\n📋 Verifying created tables:\n');
    for (const tableName of Object.keys(createTableQueries)) {
      const [tables] = await connection.query(
        "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
        [dbConfig.database, tableName]
      );

      if (tables.length > 0) {
        const [columns] = await connection.query(`DESCRIBE ${tableName}`);
        console.log(`✅ ${tableName.padEnd(30)} - ${columns.length} columns`);
      } else {
        console.log(`❌ ${tableName.padEnd(30)} - NOT FOUND`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ All missing tables have been created!\n');

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

// Run the creation
createTables();
