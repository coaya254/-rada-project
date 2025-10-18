// Test script to see actual API response structure
const axios = require('axios');

async function testAPI() {
  try {
    // Test modules endpoint
    console.log('📊 Testing GET /api/admin/learning/modules\n');
    const modulesResponse = await axios.get('http://localhost:3000/api/admin/learning/modules');

    if (modulesResponse.data.modules && modulesResponse.data.modules.length > 0) {
      const firstModule = modulesResponse.data.modules[0];
      console.log('✅ Sample Module from API:');
      console.log(JSON.stringify(firstModule, null, 2));
      console.log('\n📋 Available fields:');
      console.log(Object.keys(firstModule).join(', '));
    }

    // Test user progress endpoint (might not exist yet)
    console.log('\n\n📊 Testing GET /api/learning/progress\n');
    try {
      const progressResponse = await axios.get('http://localhost:3000/api/learning/progress');
      console.log('✅ Progress Response:');
      console.log(JSON.stringify(progressResponse.data, null, 2));
    } catch (err) {
      console.log('⚠️  Progress endpoint error:', err.response?.status, err.response?.data || err.message);
    }

    // Test challenges
    console.log('\n\n📊 Testing GET /api/learning/challenges\n');
    try {
      const challengesResponse = await axios.get('http://localhost:3000/api/learning/challenges');
      console.log('✅ Challenges Response:');
      console.log(JSON.stringify(challengesResponse.data, null, 2));
    } catch (err) {
      console.log('⚠️  Challenges endpoint not found or error:', err.response?.status);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
