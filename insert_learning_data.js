const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Insert sample learning modules
const insertModules = `
INSERT INTO learning_modules (title, description, icon, xp_reward, estimated_duration, difficulty, category, is_featured, status) VALUES
('Kenya Government Structure', 'Learn about the three arms of Kenyan government and how they work together to maintain democracy.', '🏛️', 120, 45, 'beginner', 'government', TRUE, 'published'),
('Understanding County Governments', 'Learn how devolution works in Kenya and your role in county governance', '🏛️', 150, 60, 'intermediate', 'government', TRUE, 'published'),
('Civic Rights and Responsibilities', 'Understand your constitutional rights and civic duties as a Kenyan citizen', '⚖️', 100, 30, 'beginner', 'rights', FALSE, 'published'),
('Budget Literacy', 'Learn how to read and understand government budgets and spending', '💰', 200, 90, 'intermediate', 'economics', FALSE, 'published'),
('Digital Citizenship', 'Navigate the digital world responsibly and safely', '💻', 80, 40, 'beginner', 'technology', FALSE, 'published');
`;

// Insert sample lessons
const insertLessons = `
INSERT INTO lessons (module_id, title, content, estimated_time, order_index, has_quiz, resources) VALUES
(1, 'Introduction to Kenya Constitution', 'The Constitution of Kenya 2010 is the supreme law of the land. It establishes the structure of government, defines the rights and freedoms of citizens, and sets out the principles of governance. This lesson covers the key features of the Constitution and its importance in Kenyan society.', '5 min', 1, TRUE, '["Constitution of Kenya 2010", "Bill of Rights Guide"]'),
(1, 'The Executive Branch', 'The Executive branch is headed by the President and includes the Deputy President, Cabinet Secretaries, and other executive officers. Learn about their roles, powers, and how they are held accountable.', '8 min', 2, TRUE, '["Executive Powers Guide", "Cabinet Structure"]'),
(1, 'The Legislature', 'The Legislature consists of the National Assembly and the Senate. Discover how laws are made, the role of MPs and Senators, and how they represent your interests.', '10 min', 3, TRUE, '["Parliament Guide", "Law Making Process"]'),
(1, 'The Judiciary', 'The Judiciary interprets the law and ensures justice is served. Learn about the court system, judicial independence, and how to access justice.', '7 min', 4, TRUE, '["Court System Guide", "Access to Justice"]'),
(2, 'Devolution in Kenya', 'Devolution transfers power from the national government to county governments. Understand how this system works and its benefits for local development.', '6 min', 1, TRUE, '["Devolution Guide", "County Powers"]'),
(2, 'County Government Structure', 'County governments have their own executive, legislative, and administrative structures. Learn about governors, MCAs, and county staff.', '8 min', 2, TRUE, '["County Structure", "MCA Guide"]');
`;

// Insert sample quizzes
const insertQuizzes = `
INSERT INTO learning_quizzes (title, description, questions, difficulty, time_limit, passing_score, xp_reward) VALUES
('Civics Basics Quiz', 'Test your knowledge on basic Kenyan civics.', '[{"question": "Who is the head of the Executive?", "options": ["President", "Chief Justice", "Speaker"], "correctAnswer": "President"}, {"question": "How many counties are in Kenya?", "options": ["47", "290", "50"], "correctAnswer": "47"}]', 'easy', 15, 70, 50),
('Advanced Budget Quiz', 'Challenge your understanding of Kenya national budget.', '[{"question": "What is the main source of government revenue?", "options": ["Taxes", "Loans", "Donations"], "correctAnswer": "Taxes"}, {"question": "What is fiscal policy?", "options": ["Government spending and taxation", "Monetary policy", "Trade agreements"], "correctAnswer": "Government spending and taxation"}]', 'medium', 20, 75, 80);
`;

// Insert sample challenges
const insertChallenges = `
INSERT INTO learning_challenges (title, description, category, xp_reward, duration, participants, active, end_date, image_url) VALUES
('Debunk a Rumor', 'Find and fact-check 3 viral claims about Kenyan politics or policies.', 'weekly', 200, '48 hours', 1247, TRUE, '2025-09-18', 'https://example.com/rumor.jpg'),
('Constitution Knowledge', 'Test your knowledge of Kenya 2010 Constitution.', 'education', 150, '7 days', 892, TRUE, '2025-09-18', 'https://example.com/constitution.jpg'),
('Civic Engagement', 'Attend a local government meeting and share your perspective.', 'engagement', 100, '7 days', 456, TRUE, '2025-09-18', 'https://example.com/engagement.jpg');
`;

// Insert sample badges
const insertBadges = `
INSERT INTO learning_badges (name, description, icon, required_xp, category, rarity) VALUES
('Civics Master', 'Completed all civics modules', '🏆', 1500, 'civics', 'rare'),
('Fact-Checker', 'Successfully debunked 5 rumors', '🔍', 750, 'moderation', 'common'),
('Budget Expert', 'Mastered budget literacy skills', '💰', 800, 'economics', 'rare'),
('Digital Citizen', 'Completed digital citizenship course', '💻', 300, 'technology', 'common'),
('Learning Streak Master', 'Maintained 30-day learning streak', '🔥', 2000, 'general', 'legendary');
`;

async function insertLearningData() {
  try {
    console.log('🚀 Inserting learning data...');
    
    console.log('📚 Inserting modules...');
    await db.promise().execute(insertModules);
    console.log('✅ Modules inserted successfully');
    
    console.log('📝 Inserting lessons...');
    await db.promise().execute(insertLessons);
    console.log('✅ Lessons inserted successfully');
    
    console.log('🧠 Inserting quizzes...');
    await db.promise().execute(insertQuizzes);
    console.log('✅ Quizzes inserted successfully');
    
    console.log('🎯 Inserting challenges...');
    await db.promise().execute(insertChallenges);
    console.log('✅ Challenges inserted successfully');
    
    console.log('🏆 Inserting badges...');
    await db.promise().execute(insertBadges);
    console.log('✅ Badges inserted successfully');
    
    console.log('🎉 Learning data insertion complete!');
    console.log('\n📊 Summary:');
    console.log('- Learning modules: 5');
    console.log('- Lessons: 6');
    console.log('- Quizzes: 2');
    console.log('- Challenges: 3');
    console.log('- Badges: 5');
    
  } catch (error) {
    console.error('❌ Error inserting learning data:', error);
  } finally {
    db.end();
  }
}

insertLearningData();
