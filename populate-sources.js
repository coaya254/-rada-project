// Populate sources table with initial sources
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

const sources = [
  { name: 'Parliament Records', default_url: 'https://parliament.go.ke', color: '#3B82F6' },
  { name: 'Official Website', default_url: 'https://gov.ke', color: '#10B981' },
  { name: 'Daily Nation', default_url: 'https://nation.africa', color: '#EF4444' },
  { name: 'The Standard', default_url: 'https://standardmedia.co.ke', color: '#F59E0B' },
  { name: 'Citizen TV', default_url: 'https://citizentv.co.ke', color: '#8B5CF6' },
  { name: 'KTN News', default_url: 'https://ktnnews.co.ke', color: '#EC4899' },
  { name: 'Twitter/X', default_url: 'https://twitter.com', color: '#06B6D4' },
  { name: 'Facebook', default_url: 'https://facebook.com', color: '#3B82F6' },
  { name: 'Government Gazette', default_url: 'https://gazette.go.ke', color: '#6366F1' },
  { name: 'Court Documents', default_url: 'https://judiciary.go.ke', color: '#DC2626' }
];

const insertPromises = sources.map(source => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO sources (name, default_url, color) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE default_url = ?, color = ?',
      [source.name, source.default_url, source.color, source.default_url, source.color],
      (error, result) => {
        if (error) {
          console.error(`❌ Error inserting ${source.name}:`, error.message);
          reject(error);
        } else {
          console.log(`✅ Added/Updated source: ${source.name}`);
          resolve(result);
        }
      }
    );
  });
});

Promise.all(insertPromises)
  .then(() => {
    console.log('\n✅ All sources populated successfully!');
    db.end();
  })
  .catch((error) => {
    console.error('❌ Error populating sources:', error);
    db.end();
  });
