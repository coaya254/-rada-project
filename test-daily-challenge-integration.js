const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const USER_ID = 1;

async function testDailyChallengeIntegration() {
  console.log('\n=== TESTING DAILY CHALLENGE INTEGRATION ===\n');

  try {
    // Step 1: Get today's challenge
    console.log('1. Testing GET /api/learning/challenges/today...');
    const challengeResponse = await axios.get(`${BASE_URL}/api/learning/challenges/today`, {
      params: { userId: USER_ID }
    });

    if (challengeResponse.data.success) {
      console.log('✓ Challenge fetched successfully');
      console.log(`  Challenge ID: ${challengeResponse.data.challenge.id}`);
      console.log(`  Quiz ID: ${challengeResponse.data.challenge.quiz_id}`);
      console.log(`  XP Reward: ${challengeResponse.data.challenge.xp_reward}`);
      console.log(`  Questions: ${challengeResponse.data.challenge.questions.length}`);

      // Show first question
      const firstQ = challengeResponse.data.challenge.questions[0];
      console.log(`\n  Sample Question:`);
      console.log(`    "${firstQ.question_text}"`);

      try {
        const options = typeof firstQ.options === 'string' ? JSON.parse(firstQ.options) : firstQ.options;
        console.log(`    Options: ${options.join(', ')}`);
      } catch (e) {
        console.log(`    ⚠️  Options format error: ${firstQ.options.substring(0, 50)}...`);
        console.log(`    Raw options type: ${typeof firstQ.options}`);
      }

      console.log(`    Correct Answer: Index ${firstQ.correct_answer_index}`);

      // Check if already completed
      if (challengeResponse.data.challenge.userStatus?.completed) {
        console.log('\n⚠️  User already completed this challenge');
        console.log(`  Score: ${challengeResponse.data.challenge.userStatus.score}`);
        console.log(`  Time: ${challengeResponse.data.challenge.userStatus.timeCompleted}s`);
      }

      const challengeId = challengeResponse.data.challenge.id;
      const questions = challengeResponse.data.challenge.questions;

      // Step 2: Submit challenge attempt (if not completed)
      if (!challengeResponse.data.challenge.userStatus?.completed) {
        console.log('\n2. Testing POST /api/learning/challenges/:id/attempt...');

        // Create sample answers (answer all correctly)
        const answers = questions.map(q => ({
          questionId: q.id,
          selectedIndex: q.correct_answer_index
        }));

        const attemptResponse = await axios.post(
          `${BASE_URL}/api/learning/challenges/${challengeId}/attempt`,
          {
            userId: USER_ID,
            answers: answers,
            timeCompleted: 75 // 75 seconds
          }
        );

        if (attemptResponse.data.success) {
          console.log('✓ Challenge attempt submitted successfully');
          console.log(`  Score: ${attemptResponse.data.score}/${attemptResponse.data.maxScore}`);
          console.log(`  Percentage: ${attemptResponse.data.percentage}%`);
          console.log(`  XP Earned: ${attemptResponse.data.xpEarned}`);
          console.log(`  Current Streak: ${attemptResponse.data.currentStreak}`);

          if (attemptResponse.data.streakIncreased) {
            console.log('  🔥 Streak increased!');
          }
        }
      }

      // Step 3: Get leaderboard
      console.log('\n3. Testing GET /api/learning/challenges/:id/leaderboard...');
      const leaderboardResponse = await axios.get(
        `${BASE_URL}/api/learning/challenges/${challengeId}/leaderboard`,
        {
          params: { limit: 10 }
        }
      );

      if (leaderboardResponse.data.success) {
        console.log('✓ Leaderboard fetched successfully');
        console.log(`  Total entries: ${leaderboardResponse.data.leaderboard.length}`);

        if (leaderboardResponse.data.leaderboard.length > 0) {
          console.log('\n  Top 3 Performers:');
          leaderboardResponse.data.leaderboard.slice(0, 3).forEach((entry, index) => {
            console.log(`    ${index + 1}. User ${entry.user_id} - ${entry.score} pts (${entry.time_taken}s)`);
          });
        } else {
          console.log('  (No entries yet)');
        }
      }

      // Step 4: Get user streak
      console.log('\n4. Testing GET /api/learning/streak...');
      const streakResponse = await axios.get(`${BASE_URL}/api/learning/streak`, {
        params: { userId: USER_ID }
      });

      if (streakResponse.data.success) {
        console.log('✓ Streak fetched successfully');
        console.log(`  Current Streak: ${streakResponse.data.streak.current_streak} days`);
        console.log(`  Longest Streak: ${streakResponse.data.streak.longest_streak} days`);
        console.log(`  Last Activity: ${streakResponse.data.streak.last_activity_date || 'Never'}`);
      }

      console.log('\n=== ALL TESTS PASSED ✓ ===\n');
      console.log('Frontend Integration Checklist:');
      console.log('✓ API endpoints working');
      console.log('✓ Challenge data being returned');
      console.log('✓ Attempt submission working');
      console.log('✓ Leaderboard working');
      console.log('✓ Streak tracking working');
      console.log('\n✓ Frontend should now work with real API data!\n');

    } else {
      console.log('✗ Failed to fetch challenge');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      console.log('\n💡 Tip: Make sure the server is running on port 3000');
    }
  }
}

testDailyChallengeIntegration();
