// Add missing constituency columns to politicians table
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

const alterQueries = [
  {
    name: 'constituency_representation',
    sql: 'ALTER TABLE politicians ADD COLUMN constituency_representation TEXT AFTER constituency'
  },
  {
    name: 'constituency_focus_areas',
    sql: 'ALTER TABLE politicians ADD COLUMN constituency_focus_areas TEXT AFTER constituency_representation'
  }
];

async function addColumns() {
  for (const query of alterQueries) {
    await new Promise((resolve) => {
      db.query(query.sql, (error) => {
        if (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log(`✅ ${query.name} column already exists`);
          } else {
            console.error(`❌ Error adding ${query.name}:`, error.message);
          }
        } else {
          console.log(`✅ Added ${query.name} column successfully`);
        }
        resolve();
      });
    });
  }

  console.log('\n✅ All constituency columns added!');
  db.end();
}

addColumns();
