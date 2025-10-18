const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test user UUID (you can use a real one from your database)
const TEST_UUID = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';

async function testCommunityAPIs() {
  console.log('🧪 Testing Community APIs...\n');

  try {
    // Test 1: Create a discussion
    console.log('1️⃣ Testing CREATE DISCUSSION...');
    const createResponse = await axios.post(`${BASE_URL}/api/community/discussions`, {
      uuid: TEST_UUID,
      title: 'Test Discussion - What do you think about education reform?',
      content: 'This is a test discussion to see if our Community API is working properly. We need at least 20 characters here for validation.',
      category: 'Education',
      is_anonymous: false
    });
    console.log('✅ Discussion created:', createResponse.data);
    const discussionId = createResponse.data.discussionId;
    console.log('');

    // Test 2: Get all discussions
    console.log('2️⃣ Testing GET ALL DISCUSSIONS...');
    const getAllResponse = await axios.get(`${BASE_URL}/api/community/discussions`);
    console.log('✅ Found', getAllResponse.data.length, 'discussions');
    console.log('First discussion:', getAllResponse.data[0]?.title);
    console.log('');

    // Test 3: Get single discussion
    console.log('3️⃣ Testing GET SINGLE DISCUSSION...');
    const getOneResponse = await axios.get(`${BASE_URL}/api/community/discussions/${discussionId}`);
    console.log('✅ Discussion retrieved:', getOneResponse.data.title);
    console.log('');

    // Test 4: Add a reply
    console.log('4️⃣ Testing ADD REPLY...');
    const replyResponse = await axios.post(`${BASE_URL}/api/community/discussions/${discussionId}/replies`, {
      uuid: TEST_UUID,
      content: 'This is a test reply to the discussion. Great topic!'
    });
    console.log('✅ Reply added:', replyResponse.data);
    console.log('');

    // Test 5: Get replies
    console.log('5️⃣ Testing GET REPLIES...');
    const getRepliesResponse = await axios.get(`${BASE_URL}/api/community/discussions/${discussionId}/replies`);
    console.log('✅ Found', getRepliesResponse.data.length, 'replies');
    console.log('');

    // Test 6: Like discussion
    console.log('6️⃣ Testing LIKE DISCUSSION...');
    const likeResponse = await axios.post(`${BASE_URL}/api/community/discussions/${discussionId}/like`, {
      uuid: TEST_UUID
    });
    console.log('✅ Like result:', likeResponse.data);
    console.log('');

    // Test 7: Filter by category
    console.log('7️⃣ Testing FILTER BY CATEGORY...');
    const filterResponse = await axios.get(`${BASE_URL}/api/community/discussions?category=Education`);
    console.log('✅ Found', filterResponse.data.length, 'Education discussions');
    console.log('');

    // Test 8: Search discussions
    console.log('8️⃣ Testing SEARCH...');
    const searchResponse = await axios.get(`${BASE_URL}/api/community/discussions?search=education`);
    console.log('✅ Found', searchResponse.data.length, 'discussions matching "education"');
    console.log('');

    console.log('🎉 ALL TESTS PASSED! Community API is working!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCommunityAPIs();