const axios = require('axios');

async function testLeaderboard() {
  try {
    console.log('\n=== TESTING LEADERBOARD API ===\n');

    const response = await axios.get('http://localhost:3000/api/learning/leaderboard', {
      params: {
        limit: 10,
        period: 'all'
      }
    });

    console.log('✓ Leaderboard API working!');
    console.log('\nTop Learners:');
    console.log('=============');

    if (response.data.leaderboard && response.data.leaderboard.length > 0) {
      response.data.leaderboard.forEach(user => {
        console.log(`#${user.rank} - User ${user.user_id}: ${user.total_xp} XP (Level ${user.level}, ${user.current_streak || 0} day streak)`);
      });
    } else {
      console.log('No leaderboard data found');
    }

    console.log('\nMy Rank:');
    if (response.data.myRank) {
      console.log(`  Position: #${response.data.myRank.rank}`);
      console.log(`  XP: ${response.data.myRank.total_xp}`);
      console.log(`  Level: ${response.data.myRank.level}`);
    } else {
      console.log('  Not ranked');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testLeaderboard();
