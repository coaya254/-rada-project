const axios = require('axios');

const TEST_UUID = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';
const API_URL = `http://localhost:3000/api/profile/${TEST_UUID}/posts`;

console.log('🧪 Testing Profile Posts API');
console.log('='.repeat(60));
console.log(`API URL: ${API_URL}\n`);

axios.get(API_URL)
  .then(response => {
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Success:', response.data.success);
    console.log('✅ Posts Count:', response.data.count);
    console.log('\n📋 Posts returned:\n');

    if (response.data.posts && response.data.posts.length > 0) {
      response.data.posts.forEach((post, idx) => {
        console.log(`${idx + 1}. ${post.title}`);
        console.log(`   ID: ${post.id} | UUID: ${post.uuid}`);
        console.log(`   Replies: ${post.replies_count} | Likes: ${post.likes_count}`);
        console.log('');
      });
    } else {
      console.log('❌ NO POSTS RETURNED!');
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    }
  })
  .catch(error => {
    console.error('❌ API Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
    process.exit(1);
  });
