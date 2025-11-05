// Add custom_category column to politician_achievements table
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
  console.log('✅ Connected to database');
});

const addCustomCategoryColumn = `
  ALTER TABLE politician_achievements
  ADD COLUMN custom_category VARCHAR(255) DEFAULT NULL AFTER category
`;

db.query(addCustomCategoryColumn, (error, result) => {
  if (error) {
    // Check if column already exists
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ custom_category column already exists');
    } else {
      console.error('❌ Error adding custom_category column:', error.message);
    }
  } else {
    console.log('✅ custom_category column added successfully to politician_achievements table');
  }

  db.end();
});
