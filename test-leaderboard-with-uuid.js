const axios = require('axios');

const API_URL = 'http://localhost:3000/api/learning/leaderboard';
const JAY_UUID = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';

console.log('🧪 Testing Leaderboard API with UUID');
console.log('='.repeat(60));
console.log(`API URL: ${API_URL}`);
console.log(`Jay's UUID: ${JAY_UUID}\n`);

axios.get(API_URL, {
  params: {
    timeFrame: 'all-time',
    limit: 10
  }
})
  .then(response => {
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Success:', response.data.success);
    console.log('✅ Leaderboard Count:', response.data.leaderboard.length);
    console.log('\n📋 Leaderboard Entries:\n');

    if (response.data.leaderboard && response.data.leaderboard.length > 0) {
      response.data.leaderboard.forEach((entry, idx) => {
        console.log(`${idx + 1}. Rank #${entry.rank} - ${entry.username || `User ${entry.user_id}`}`);
        console.log(`   UUID: ${entry.uuid || 'NOT PROVIDED'}`);
        console.log(`   Level: ${entry.level} | XP: ${entry.total_xp}`);
        console.log(`   Streak: ${entry.current_streak || 0} | Completed: ${entry.completedModules || 0} modules`);

        // Check if this is Jay
        if (entry.uuid === JAY_UUID) {
          console.log(`   🎯 THIS IS JAY (Current User)`);
        }
        console.log('');
      });

      // Check if Jay is in the leaderboard
      const jayEntry = response.data.leaderboard.find(e => e.uuid === JAY_UUID);
      if (jayEntry) {
        console.log('✅ Jay found in leaderboard!');
        console.log(`   Rank: #${jayEntry.rank}`);
        console.log(`   XP: ${jayEntry.total_xp}`);
        console.log(`   Level: ${jayEntry.level}`);
      } else {
        console.log('❌ Jay NOT found in leaderboard!');
      }
    } else {
      console.log('❌ NO ENTRIES RETURNED!');
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
