// Add source association tables for documents, news, timeline, etc.
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_mtaani',
  multipleStatements: true
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

const migrations = [
  {
    name: 'document_sources',
    sql: `CREATE TABLE IF NOT EXISTS politician_document_sources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      document_id INT NOT NULL,
      source_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (document_id) REFERENCES politician_documents(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
      UNIQUE KEY unique_document_source (document_id, source_id)
    )`
  },
  {
    name: 'news_sources',
    sql: `CREATE TABLE IF NOT EXISTS politician_news_sources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      news_id INT NOT NULL,
      source_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (news_id) REFERENCES politician_news(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
      UNIQUE KEY unique_news_source (news_id, source_id)
    )`
  },
  {
    name: 'timeline_sources',
    sql: `CREATE TABLE IF NOT EXISTS politician_timeline_sources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      timeline_id INT NOT NULL,
      source_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (timeline_id) REFERENCES politician_timeline(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
      UNIQUE KEY unique_timeline_source (timeline_id, source_id)
    )`
  },
  {
    name: 'achievements_sources',
    sql: `CREATE TABLE IF NOT EXISTS politician_achievements_sources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      achievement_id INT NOT NULL,
      source_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (achievement_id) REFERENCES politician_achievements(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
      UNIQUE KEY unique_achievement_source (achievement_id, source_id)
    )`
  },
  {
    name: 'parties_sources',
    sql: `CREATE TABLE IF NOT EXISTS politician_parties_sources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      party_id INT NOT NULL,
      source_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (party_id) REFERENCES politician_parties(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
      UNIQUE KEY unique_party_source (party_id, source_id)
    )`
  },
  {
    name: 'commitments_sources',
    sql: `CREATE TABLE IF NOT EXISTS politician_commitments_sources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      commitment_id INT NOT NULL,
      source_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (commitment_id) REFERENCES politician_commitments(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
      UNIQUE KEY unique_commitment_source (commitment_id, source_id)
    )`
  },
  {
    name: 'voting_records_sources',
    sql: `CREATE TABLE IF NOT EXISTS politician_voting_records_sources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      voting_record_id INT NOT NULL,
      source_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (voting_record_id) REFERENCES politician_voting_records(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
      UNIQUE KEY unique_voting_record_source (voting_record_id, source_id)
    )`
  }
];

async function runMigrations() {
  for (const migration of migrations) {
    try {
      await new Promise((resolve, reject) => {
        db.query(migration.sql, (error, results) => {
          if (error) {
            reject(error);
          } else {
            console.log(`✅ Created table for ${migration.name}`);
            resolve(results);
          }
        });
      });
    } catch (error) {
      console.error(`❌ Error creating ${migration.name}:`, error.message);
    }
  }

  console.log('\n✅ All source association tables created successfully!');
  db.end();
}

runMigrations();
