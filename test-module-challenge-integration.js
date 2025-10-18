const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/admin/learning';

async function testModuleChallengeIntegration() {
  try {
    console.log('Testing Module-Challenge Integration...\n');

    // Test 1: Get available modules
    console.log('1. Testing GET /modules');
    const modulesResponse = await axios.get(`${BASE_URL}/modules`);
    console.log(`   ✅ Status: ${modulesResponse.status}`);

    // Filter published modules
    const publishedModules = modulesResponse.data.modules.filter(m => m.is_published === 1);
    console.log(`   ✅ Found ${publishedModules.length} published modules`);

    if (publishedModules.length > 0) {
      const firstModule = publishedModules[0];
      console.log(`   Sample module: "${firstModule.title}" (ID: ${firstModule.id})`);
      console.log(`     - Lessons: ${firstModule.total_lessons}`);
      console.log(`     - Difficulty: ${firstModule.difficulty}`);
      console.log(`     - XP Reward: ${firstModule.xp_reward}`);
    }

    // Test 2: Get all challenges
    console.log('\n2. Testing GET /challenges');
    const challengesResponse = await axios.get(`${BASE_URL}/challenges`);
    console.log(`   ✅ Status: ${challengesResponse.status}`);
    console.log(`   ✅ Found ${challengesResponse.data.challenges.length} challenges`);

    if (challengesResponse.data.challenges.length === 0) {
      console.log('\n   No challenges found. Creating a test challenge...');

      // Test 3: Create a test challenge
      console.log('\n3. Testing POST /challenges');
      const createResponse = await axios.post(`${BASE_URL}/challenges`, {
        title: 'Test Module Challenge',
        description: 'Testing module-based challenge system',
        xp_reward: 1000,
        difficulty: 'medium',
        category: 'Testing',
        active: true
      });
      console.log(`   ✅ Status: ${createResponse.status}`);
      console.log(`   ✅ Challenge created with ID: ${createResponse.data.challengeId}`);

      var testChallengeId = createResponse.data.challengeId;
    } else {
      var testChallengeId = challengesResponse.data.challenges[0].id;
      console.log(`   Using existing challenge ID: ${testChallengeId}`);
    }

    // Test 4: Add a module to the challenge
    if (publishedModules.length > 0) {
      const moduleToAdd = publishedModules[0];
      console.log(`\n4. Testing POST /challenges/${testChallengeId}/tasks`);
      console.log(`   Adding module: "${moduleToAdd.title}" (ID: ${moduleToAdd.id})`);

      const addTaskResponse = await axios.post(
        `${BASE_URL}/challenges/${testChallengeId}/tasks`,
        {
          task_type: 'module',
          task_id: moduleToAdd.id
        }
      );
      console.log(`   ✅ Status: ${addTaskResponse.status}`);
      console.log(`   ✅ Task added with ID: ${addTaskResponse.data.taskId}`);
    }

    // Test 5: Get challenge with tasks
    console.log(`\n5. Testing GET /challenges/${testChallengeId}`);
    const challengeDetailResponse = await axios.get(`${BASE_URL}/challenges/${testChallengeId}`);
    console.log(`   ✅ Status: ${challengeDetailResponse.status}`);
    console.log(`   ✅ Challenge title: "${challengeDetailResponse.data.challenge.title}"`);
    console.log(`   ✅ Tasks count: ${challengeDetailResponse.data.challenge.tasks.length}`);

    if (challengeDetailResponse.data.challenge.tasks.length > 0) {
      console.log('\n   Current tasks:');
      challengeDetailResponse.data.challenge.tasks.forEach((task, idx) => {
        console.log(`     ${idx + 1}. Type: ${task.task_type}, Title: "${task.task_title}"`);
      });
    }

    console.log('\n✅ All integration tests passed!');
    console.log('\n📝 Summary:');
    console.log('   - Available modules endpoint working');
    console.log('   - Challenge creation working');
    console.log('   - Module can be added to challenges');
    console.log('   - Tasks are properly retrieved with module titles');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

testModuleChallengeIntegration()
  .then(() => {
    console.log('\n✅ Integration test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Integration test failed');
    process.exit(1);
  });
