const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Insert just modules and basic lessons
const insertModules = `INSERT INTO learning_modules (title, description, icon, xp_reward, estimated_duration, difficulty, category, is_featured, status) VALUES 
('Kenya Government Structure', 'Learn about the three arms of Kenyan government', '🏛️', 120, 45, 'beginner', 'government', TRUE, 'published'), 
('Understanding County Governments', 'Learn how devolution works in Kenya', '🏛️', 150, 60, 'intermediate', 'government', TRUE, 'published'), 
('Civic Rights and Responsibilities', 'Understand your constitutional rights', '⚖️', 100, 30, 'beginner', 'rights', FALSE, 'published')`;

const insertLessons = `INSERT INTO lessons (module_id, title, content, order_index) VALUES 
(1, 'Introduction to Kenya Constitution', 'The Constitution of Kenya 2010 is the supreme law of the land.', 1), 
(1, 'The Executive Branch', 'The Executive branch is headed by the President.', 2), 
(2, 'Devolution in Kenya', 'Devolution transfers power from national to county governments.', 1)`;

async function insertData() {
  try {
    console.log('📚 Inserting modules...');
    await db.promise().execute(insertModules);
    console.log('✅ Modules inserted');
    
    console.log('📝 Inserting lessons...');
    await db.promise().execute(insertLessons);
    console.log('✅ Lessons inserted');
    
    console.log('🎉 Data insertion complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    db.end();
  }
}

insertData();
