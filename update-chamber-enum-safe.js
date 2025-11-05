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

  // Step 1: Check existing chamber values
  connection.query('SELECT DISTINCT chamber FROM politicians', (error, results) => {
    if (error) {
      console.error('❌ Error checking chamber values:', error);
      connection.end();
      return;
    }

    console.log('📊 Current chamber values:');
    results.forEach(row => {
      console.log(`  - ${row.chamber}`);
    });
    console.log('');

    // Step 2: Update 'House' to 'National Assembly' if it exists
    const hasHouse = results.some(row => row.chamber === 'House');

    if (hasHouse) {
      console.log('🔄 Updating "House" → "National Assembly"...');
      connection.query('UPDATE politicians SET chamber = "Parliament" WHERE chamber = "House"', (err) => {
        if (err) {
          console.error('❌ Error updating chamber values:', err);
          connection.end();
          return;
        }
        console.log('✅ Updated House → Parliament (temp)\n');

        // Step 3: Modify enum (add National Assembly while keeping Parliament)
        modifyEnum();
      });
    } else {
      modifyEnum();
    }
  });
});

function modifyEnum() {
  console.log('🔧 Modifying chamber enum to Kenya structure...');

  // Add National Assembly to existing enum values
  const query = `ALTER TABLE politicians MODIFY COLUMN chamber ENUM('National Assembly','Senate','Governor','Cabinet','Executive','County Assembly','County','Parliament') NULL`;

  connection.query(query, (error) => {
    if (error) {
      console.error('❌ Error modifying enum:', error.message);
      connection.end();
      return;
    }

    console.log('✅ Chamber enum updated!\n');

    // Step 4: Update Parliament → National Assembly
    connection.query('UPDATE politicians SET chamber = "National Assembly" WHERE chamber = "Parliament"', (err) => {
      if (err) {
        console.error('❌ Error updating Parliament:', err);
      } else {
        console.log('✅ Updated Parliament → National Assembly\n');
      }

      // Step 5: Remove Parliament from enum
      const finalQuery = `ALTER TABLE politicians MODIFY COLUMN chamber ENUM('National Assembly','Senate','Governor','Cabinet','Executive','County Assembly','County') NULL`;

      connection.query(finalQuery, (error2) => {
        if (error2) {
          console.error('❌ Error removing Parliament from enum:', error2.message);
        } else {
          console.log('✅ Removed Parliament from enum\n');
        }

        // Verify final state
        connection.query('SHOW COLUMNS FROM politicians LIKE "chamber"', (err3, cols) => {
          if (!err3 && cols.length > 0) {
            console.log('📊 Final chamber field:');
            console.log(`  Type: ${cols[0].Type}`);
            console.log('');
          }

          connection.query('SELECT DISTINCT chamber FROM politicians', (err4, results) => {
            if (!err4) {
              console.log('📊 Current chamber values after update:');
              results.forEach(row => {
                console.log(`  - ${row.chamber}`);
              });
            }

            console.log('\n✨ Chamber enum update complete!');
            connection.end();
          });
        });
      });
    });
  });
}
