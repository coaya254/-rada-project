const mysql = require('mysql2/promise');
require('dotenv').config();

async function addQuizzesAndAchievements() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rada_ke'
  });

  try {
    console.log('Adding quizzes, achievements, and learning paths...\n');

    // 1. Add Quizzes
    const [quiz1] = await connection.query(`
      INSERT INTO learning_quizzes (title, description, passing_score, time_limit, xp_reward, difficulty, category, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Constitutional Basics Quiz',
      'Test your knowledge of the Constitution of Kenya',
      70,
      10,
      50,
      'beginner',
      'Government',
      true
    ]);

    // Add questions for quiz 1
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

    console.log('✓ Created Constitutional Basics Quiz with 5 questions');

    // 2. Add Electoral Process Quiz
    const [quiz2] = await connection.query(`
      INSERT INTO learning_quizzes (title, description, passing_score, time_limit, xp_reward, difficulty, category, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Electoral Process Quiz',
      'Test your understanding of Kenya\'s electoral system',
      70,
      15,
      75,
      'intermediate',
      'Elections',
      true
    ]);

    await connection.query(`
      INSERT INTO learning_quiz_questions (quiz_id, question_text, options, correct_answer_index, explanation, points, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      quiz2.insertId,
      'Which body conducts elections in Kenya?',
      JSON.stringify(['Parliament', 'IEBC', 'Judiciary', 'Executive']),
      1,
      'The Independent Electoral and Boundaries Commission (IEBC) is responsible for conducting elections in Kenya.',
      15,
      0
    ]);

    await connection.query(`
      INSERT INTO learning_quiz_questions (quiz_id, question_text, options, correct_answer_index, explanation, points, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      quiz2.insertId,
      'What is the minimum age to vote in Kenya?',
      JSON.stringify(['16 years', '18 years', '21 years', '25 years']),
      1,
      'Any Kenyan citizen aged 18 and above has the right to vote.',
      15,
      1
    ]);

    await connection.query(`
      INSERT INTO learning_quiz_questions (quiz_id, question_text, options, correct_answer_index, explanation, points, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      quiz2.insertId,
      'How often are general elections held in Kenya?',
      JSON.stringify(['Every 3 years', 'Every 4 years', 'Every 5 years', 'Every 6 years']),
      2,
      'General elections in Kenya are held every five years to elect the President, Members of Parliament, Governors, and Members of County Assemblies.',
      15,
      2
    ]);

    console.log('✓ Created Electoral Process Quiz with 3 questions');

    // 3. Add Civil Rights Quiz
    const [quiz3] = await connection.query(`
      INSERT INTO learning_quizzes (title, description, passing_score, time_limit, xp_reward, difficulty, category, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Civil Rights and Freedoms',
      'Test your knowledge of fundamental rights and freedoms',
      75,
      12,
      60,
      'advanced',
      'Rights',
      true
    ]);

    await connection.query(`
      INSERT INTO learning_quiz_questions (quiz_id, question_text, options, correct_answer_index, explanation, points, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      quiz3.insertId,
      'Which chapter of the Constitution contains the Bill of Rights?',
      JSON.stringify(['Chapter Two', 'Chapter Three', 'Chapter Four', 'Chapter Five']),
      2,
      'Chapter Four of the Constitution of Kenya contains the Bill of Rights.',
      12,
      0
    ]);

    await connection.query(`
      INSERT INTO learning_quiz_questions (quiz_id, question_text, options, correct_answer_index, explanation, points, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      quiz3.insertId,
      'Can fundamental rights and freedoms be limited?',
      JSON.stringify(['Never', 'Yes, under specific circumstances', 'Only during elections', 'Only by the President']),
      1,
      'Rights can be limited only to the extent necessary and proportionate, as provided by law.',
      12,
      1
    ]);

    console.log('✓ Created Civil Rights Quiz with 2 questions');

    // 4. Add Learning Paths
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

    console.log('✓ Created Foundations of Democracy learning path');

    const [path2] = await connection.query(`
      INSERT INTO learning_paths (title, description, category, difficulty, estimated_hours, icon, color, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Active Citizenship',
      'Learn how to participate effectively in democratic processes and civic life',
      'Civic Engagement',
      'Intermediate',
      15.0,
      'how-to-vote',
      '#10B981',
      true
    ]);

    console.log('✓ Created Active Citizenship learning path');

    // 5. Add Achievements
    await connection.query(`
      INSERT INTO learning_achievements (title, description, icon, rarity, criteria_type, criteria_value, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'First Steps',
      'Complete your first lesson',
      'school',
      'Common',
      'lessons_completed',
      1,
      25
    ]);

    await connection.query(`
      INSERT INTO learning_achievements (title, description, icon, rarity, criteria_type, criteria_value, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Knowledge Seeker',
      'Complete 10 lessons',
      'book',
      'Common',
      'lessons_completed',
      10,
      100
    ]);

    await connection.query(`
      INSERT INTO learning_achievements (title, description, icon, rarity, criteria_type, criteria_value, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Quiz Master',
      'Pass 5 quizzes',
      'stars',
      'Rare',
      'quizzes_passed',
      5,
      150
    ]);

    await connection.query(`
      INSERT INTO learning_achievements (title, description, icon, rarity, criteria_type, criteria_value, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Perfect Score',
      'Get 100% on any quiz',
      'emoji-events',
      'Rare',
      'quizzes_perfect',
      1,
      200
    ]);

    await connection.query(`
      INSERT INTO learning_achievements (title, description, icon, rarity, criteria_type, criteria_value, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Dedicated Learner',
      'Maintain a 7-day learning streak',
      'local-fire-department',
      'Epic',
      'streak_days',
      7,
      300
    ]);

    await connection.query(`
      INSERT INTO learning_achievements (title, description, icon, rarity, criteria_type, criteria_value, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Streak Master',
      'Maintain a 30-day learning streak',
      'whatshot',
      'Epic',
      'streak_days',
      30,
      500
    ]);

    await connection.query(`
      INSERT INTO learning_achievements (title, description, icon, rarity, criteria_type, criteria_value, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Module Champion',
      'Complete 5 modules',
      'military-tech',
      'Epic',
      'modules_completed',
      5,
      400
    ]);

    await connection.query(`
      INSERT INTO learning_achievements (title, description, icon, rarity, criteria_type, criteria_value, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'XP Legend',
      'Earn 10,000 total XP',
      'workspace-premium',
      'Legendary',
      'total_xp',
      10000,
      1000
    ]);

    await connection.query(`
      INSERT INTO learning_achievements (title, description, icon, rarity, criteria_type, criteria_value, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Civic Scholar',
      'Complete all beginner modules',
      'school-outline',
      'Legendary',
      'modules_completed',
      20,
      1500
    ]);

    console.log('✓ Created 9 achievements');

    console.log('\n✅ All data added successfully!\n');
    console.log('Summary:');
    console.log('- 3 Quizzes with 10 total questions');
    console.log('- 2 Learning Paths');
    console.log('- 9 Achievements\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

addQuizzesAndAchievements()
  .then(() => {
    console.log('Script completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
