const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'radamtaani'
});

console.log('Creating New Source Buttons System...\n');

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }

  // Check if sources table already has color column
  db.query("SHOW COLUMNS FROM sources LIKE 'button_color'", (err, results) => {
    if (err) {
      console.error('Error checking sources table:', err);
      db.end();
      return;
    }

    if (results.length === 0) {
      // Add button_color column to sources table
      console.log('Adding button_color column to sources table...');
      db.query(
        "ALTER TABLE sources ADD COLUMN button_color VARCHAR(20) DEFAULT '#3B82F6' AFTER color",
        (err) => {
          if (err) {
            console.error('Error adding button_color column:', err);
          } else {
            console.log('✅ Added button_color column to sources table');
          }

          // Continue with the rest of the setup
          setupSourceButtons();
        }
      );
    } else {
      console.log('ℹ️  button_color column already exists');
      setupSourceButtons();
    }
  });
});

function setupSourceButtons() {
  // Update existing sources with default button colors
  const updateQuery = `
    UPDATE sources
    SET button_color = CASE
      WHEN name LIKE '%Parliament%' THEN '#8B5CF6'
      WHEN name LIKE '%IEBC%' THEN '#F59E0B'
      WHEN name LIKE '%Standard%' THEN '#EF4444'
      WHEN name LIKE '%Nation%' THEN '#3B82F6'
      WHEN name LIKE '%Citizen%' THEN '#10B981'
      WHEN name LIKE '%Star%' THEN '#F59E0B'
      WHEN name LIKE '%Twitter%' OR name LIKE '%X.com%' THEN '#1DA1F2'
      WHEN name LIKE '%Facebook%' THEN '#4267B2'
      ELSE '#6B7280'
    END
    WHERE button_color IS NULL OR button_color = '#3B82F6'
  `;

  db.query(updateQuery, (err, result) => {
    if (err) {
      console.error('Error updating source colors:', err);
    } else {
      console.log(`✅ Updated ${result.affectedRows} sources with button colors`);
    }

    // Show current sources with their colors
    db.query('SELECT id, name, default_url, button_color FROM sources LIMIT 20', (err, sources) => {
      if (err) {
        console.error('Error fetching sources:', err);
      } else {
        console.log('\n📊 Current Sources with Button Colors:');
        console.log('=====================================');
        sources.forEach(source => {
          console.log(`  ${source.id}. ${source.name}`);
          console.log(`     URL: ${source.default_url || 'N/A'}`);
          console.log(`     Color: ${source.button_color}`);
          console.log('');
        });
      }

      console.log('\n✅ Source buttons system ready!');
      console.log('\nNext steps:');
      console.log('1. Admin forms will now show color picker for each source');
      console.log('2. User end will display sources as colored buttons');
      console.log('3. Each section (docs, news, timeline, etc.) will have source buttons');

      db.end();
    });
  });
}
