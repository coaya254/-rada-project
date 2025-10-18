const mysql = require('mysql2/promise');
require('dotenv').config();

async function addSampleLearningData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rada_ke'
  });

  try {
    console.log('Adding sample learning data...\n');

    // 1. Add Modules
    const [module1] = await connection.query(`
      INSERT INTO learning_modules (title, description, category, difficulty, icon, xp_reward, estimated_duration, status, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['Constitutional Basics', 'Learn fundamental rights and government structure', 'Government', 'beginner', '⚖️', 200, 150, 'published', true]);

    const [module2] = await connection.query(`
      INSERT INTO learning_modules (title, description, category, difficulty, icon, xp_reward, estimated_duration, status, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['Electoral Process', 'Understanding elections and voting systems', 'Elections', 'intermediate', '🗳️', 300, 210, 'published', true]);

    const [module3] = await connection.query(`
      INSERT INTO learning_modules (title, description, category, difficulty, icon, xp_reward, estimated_duration, status, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['Civil Rights History', 'Key movements and landmark cases', 'Rights', 'advanced', '👥', 250, 180, 'published', false]);

    console.log('✓ Created 3 modules');

    // 2. Add Lessons for Module 1 (Constitutional Basics)
    await connection.query(`
      INSERT INTO learning_lessons (module_id, title, description, content, lesson_type, duration_minutes, xp_reward, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      module1.insertId,
      'Introduction to the Constitution',
      'Overview of the Constitution and its importance',
      `The Constitution of Kenya is the supreme law of our country. It was promulgated on August 27, 2010, replacing the old constitution from 1963.

The Constitution establishes the framework for governance and defines the fundamental rights and freedoms of all Kenyan citizens. It creates three arms of government:

• **Executive**: Led by the President, implements and enforces laws
• **Legislature**: Parliament makes laws for the country
• **Judiciary**: Courts interpret laws and settle disputes

The Constitution also establishes devolved government through 47 counties, bringing government closer to the people and ensuring local participation in governance.`,
      'text',
      15,
      25,
      0
    ]);

    await connection.query(`
      INSERT INTO learning_lessons (module_id, title, description, content, lesson_type, duration_minutes, xp_reward, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      module1.insertId,
      'Key Constitutional Principles',
      'Understanding the core principles that guide governance',
      `The Constitution is built on several key principles that guide how our country is governed:

**1. Rule of Law**: All people, including leaders, are subject to the law. No one is above the law.

**2. Separation of Powers**: The three arms of government have distinct roles and check each other's power.

**3. Public Participation**: Citizens have the right to participate in governance and decision-making.

**4. Transparency and Accountability**: Government must be open about its actions and answer to the people.

**5. Protection of Human Rights**: The Constitution guarantees fundamental rights and freedoms for all.`,
      'text',
      18,
      30,
      1
    ]);

    await connection.query(`
      INSERT INTO learning_lessons (module_id, title, description, content, lesson_type, duration_minutes, xp_reward, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      module1.insertId,
      'Bill of Rights',
      'Your fundamental rights and freedoms',
      `The Bill of Rights is contained in Chapter Four of the Constitution and guarantees fundamental rights to every person in Kenya.

Key rights include:

• **Right to Life**: Every person has the right to life.
• **Freedom of Expression**: You can express your views freely.
• **Freedom of Movement**: You can move and live anywhere in Kenya.
• **Right to Education**: Every person has the right to education.
• **Right to Health**: Access to the highest attainable standard of health.

These rights come with responsibilities to respect the rights and freedoms of others.`,
      'text',
      20,
      35,
      2
    ]);

    console.log('✓ Created 3 lessons for Constitutional Basics');

    // 3. Add Lessons for Module 2 (Electoral Process)
    await connection.query(`
      INSERT INTO learning_lessons (module_id, title, description, content, lesson_type, duration_minutes, xp_reward, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      module2.insertId,
      'Understanding Elections in Kenya',
      'How elections work and why they matter',
      `Elections are the cornerstone of democracy, allowing citizens to choose their leaders.

**Types of Elections in Kenya:**

1. **Presidential Elections**: Choosing the Head of State
2. **Parliamentary Elections**: Electing National Assembly and Senate members
3. **Gubernatorial Elections**: Electing County Governors
4. **County Assembly Elections**: Electing local representatives

Elections in Kenya are held every five years, with the next general election scheduled for 2027.`,
      'text',
      15,
      30,
      0
    ]);

    await connection.query(`
      INSERT INTO learning_lessons (module_id, title, description, content, lesson_type, duration_minutes, xp_reward, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      module2.insertId,
      'Voter Registration Process',
      'How to register and participate in elections',
      `Every Kenyan citizen aged 18 and above has the right to vote. Here's how to register:

**1. Check Eligibility**: Kenyan citizen, 18+ years, of sound mind
**2. Visit Registration Center**: IEBC office or mobile registration
**3. Provide Documents**: National ID or Passport
**4. Biometric Capture**: Fingerprints and photograph taken
**5. Receive Confirmation**: Get your voter's card

Remember to verify your details on the IEBC website before election day!`,
      'interactive',
      12,
      25,
      1
    ]);

    console.log('✓ Created 2 lessons for Electoral Process');

    // 4. Add a Quiz for Module 1
    const [quiz1] = await connection.query(`
      INSERT INTO learning_quizzes (module_id, title, description, time_limit_minutes, passing_score_percentage, xp_reward, quiz_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [module1.insertId, 'Constitutional Basics Quiz', 'Test your knowledge of the Constitution', 10, 70, 50, 'module']);

    // Add questions to the quiz
    await connection.query(`
      INSERT INTO learning_quiz_questions (quiz_id, question_text, options, correct_answer_index, explanation, points, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      quiz1.insertId,
      'When was the current Constitution of Kenya promulgated?',
      JSON.stringify(['August 27, 2008', 'August 27, 2010', 'December 12, 2010', 'June 1, 2010']),
      1,
      'The Constitution of Kenya was promulgated on August 27, 2010, after a successful referendum.',
      10,
      0
    ]);

    await connection.query(`
      INSERT INTO learning_quiz_questions (quiz_id, question_text, options, correct_answer_index, explanation, points, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      quiz1.insertId,
      'How many counties does Kenya have under the current Constitution?',
      JSON.stringify(['45', '46', '47', '48']),
      2,
      'Kenya has 47 counties as established by the Constitution for devolved governance.',
      10,
      1
    ]);

    await connection.query(`
      INSERT INTO learning_quiz_questions (quiz_id, question_text, options, correct_answer_index, explanation, points, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      quiz1.insertId,
      'Which principle ensures that no one, including leaders, is above the law?',
      JSON.stringify(['Separation of Powers', 'Rule of Law', 'Public Participation', 'Transparency']),
      1,
      'The Rule of Law principle ensures that all people, including government officials, are subject to the law.',
      10,
      2
    ]);

    await connection.query(`
      INSERT INTO learning_quiz_questions (quiz_id, question_text, options, correct_answer_index, explanation, points, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      quiz1.insertId,
      'How many arms of government does Kenya have?',
      JSON.stringify(['Two', 'Three', 'Four', 'Five']),
      1,
      'Kenya has three arms of government: Executive, Legislature, and Judiciary.',
      10,
      3
    ]);

    await connection.query(`
      INSERT INTO learning_quiz_questions (quiz_id, question_text, options, correct_answer_index, explanation, points, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      quiz1.insertId,
      'What is the supreme law of Kenya?',
      JSON.stringify(['Acts of Parliament', 'The Constitution', 'Presidential Decrees', 'Court Judgments']),
      1,
      'The Constitution is the supreme law of Kenya, and all other laws must comply with it.',
      10,
      4
    ]);

    console.log('✓ Created quiz with 5 questions');

    // 5. Add Learning Path
    const [path1] = await connection.query(`
      INSERT INTO learning_paths (title, description, category, difficulty, estimated_hours, icon, color, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Foundations of Democracy',
      'Master the fundamental principles of democratic governance from basic concepts to advanced topics',
      'Government',
      'Beginner',
      12.0,
      'account-balance',
      '#3B82F6',
      true
    ]);

    // Add modules to path
    await connection.query(`
      INSERT INTO learning_path_modules (path_id, module_id, display_order)
      VALUES (?, ?, ?)
    `, [path1.insertId, module1.insertId, 0]);

    await connection.query(`
      INSERT INTO learning_path_modules (path_id, module_id, display_order)
      VALUES (?, ?, ?)
    `, [path1.insertId, module2.insertId, 1]);

    console.log('✓ Created learning path with 2 modules');

    // 6. Add Achievements
    await connection.query(`
      INSERT INTO learning_achievements (title, description, icon, rarity, criteria_type, criteria_value, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['Knowledge Seeker', 'Completed first 10 lessons', 'school', 'Common', 'lessons_completed', 10, 100]);

    await connection.query(`
      INSERT INTO learning_achievements (title, description, icon, rarity, criteria_type, criteria_value, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['Quiz Champion', 'Score perfect on 5 quizzes', 'stars', 'Rare', 'quizzes_perfect', 5, 200]);

    await connection.query(`
      INSERT INTO learning_achievements (title, description, icon, rarity, criteria_type, criteria_value, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['Streak Master', 'Maintain a 30-day streak', 'local-fire-department', 'Epic', 'streak_days', 30, 500]);

    await connection.query(`
      INSERT INTO learning_achievements (title, description, icon, rarity, criteria_type, criteria_value, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['XP Legend', 'Earn 10,000 total XP', 'emoji-events', 'Legendary', 'total_xp', 10000, 1000]);

    console.log('✓ Created 4 achievements');

    console.log('\n✅ Sample learning data added successfully!\n');
    console.log('Summary:');
    console.log('- 3 Modules');
    console.log('- 5 Lessons');
    console.log('- 1 Quiz with 5 Questions');
    console.log('- 1 Learning Path');
    console.log('- 4 Achievements\n');

  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the script
addSampleLearningData()
  .then(() => {
    console.log('Script completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
