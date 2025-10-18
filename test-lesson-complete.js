const axios = require('axios');

async function testLessonComplete() {
  try {
    // First, get module 41 lessons
    const moduleResponse = await axios.get('http://localhost:3000/api/learning/modules/41');
    console.log('\n=== MODULE 41 BEFORE ===');
    console.log('Progress:', moduleResponse.data.module.progress_percentage || 0, '%');
    console.log('Lessons:');
    moduleResponse.data.module.lessons.forEach(l => {
      console.log(`  - ${l.id}: ${l.title} - ${l.completed_at ? 'COMPLETED' : 'NOT COMPLETED'}`);
    });

    // Find a lesson that's not completed
    const incompletelesson = moduleResponse.data.module.lessons.find(l => !l.completed_at);

    if (!incompletelesson) {
      console.log('\n✓ All lessons already completed!');
      return;
    }

    console.log(`\n=== COMPLETING LESSON ${incompletelesson.id}: ${incompletelesson.title} ===`);

    // Complete the lesson
    const completeResponse = await axios.post(
      `http://localhost:3000/api/learning/lessons/${incompletelesson.id}/complete`,
      { timeSpent: 300, notes: 'Test completion' }
    );

    console.log('Response:', completeResponse.data);

    // Check module progress again
    const afterResponse = await axios.get('http://localhost:3000/api/learning/modules/41');
    console.log('\n=== MODULE 41 AFTER ===');
    console.log('Progress:', afterResponse.data.module.progress_percentage || 0, '%');
    console.log('Lessons:');
    afterResponse.data.module.lessons.forEach(l => {
      console.log(`  - ${l.id}: ${l.title} - ${l.completed_at ? 'COMPLETED ✓' : 'NOT COMPLETED'}`);
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testLessonComplete();
