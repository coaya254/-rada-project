# Daily Challenge Frontend Integration Summary

## What Needs to Change

The `DailyChallengeScreen.tsx` currently uses hardcoded mock data. We need to replace it with real API calls.

### Current Mock Data (Lines to Replace):

1. **Lines 56-78**: Mock questions array
2. **Lines 80-126**: Mock leaderboard array
3. **Lines 49-50**: Hardcoded streak values (7, 15)

### API Integration Points:

#### 1. On Component Mount - Fetch Challenge Data
```typescript
useEffect(() => {
  const fetchChallenge = async () => {
    try {
      const response = await LearningAPIService.getTodayChallenge();
      if (response.success) {
        // Map API data to component state
        const questions = response.challenge.questions.map((q: any) => ({
          id: q.id,
          question: q.question_text,
          options: JSON.parse(q.options), // Backend stores as JSON string
          correctAnswer: q.correct_answer_index,
          points: q.points,
          explanation: q.explanation || 'No explanation available'
        }));

        setTodayChallenge(questions);
        setChallengeId(response.challenge.id);
        setMaxXP(response.challenge.xp_reward || 300);

        // Check if already completed
        if (response.challenge.userStatus?.completed) {
          setAlreadyCompleted(true);
        }
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchChallenge();
}, []);
```

#### 2. Fetch User Streak
```typescript
useEffect(() => {
  const fetchStreak = async () => {
    try {
      const response = await LearningAPIService.getStreak();
      if (response.success) {
        setCurrentStreak(response.streak.current_streak || 0);
        setLongestStreak(response.streak.longest_streak || 0);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  fetchStreak();
}, []);
```

#### 3. On Challenge Complete - Submit to Backend
```typescript
const handleChallengeComplete = async () => {
  try {
    // Calculate score from user answers
    const userAnswers = answersArray.map(answer => ({
      questionId: answer.questionId,
      selectedAnswer: answer.selectedIndex
    }));

    const timeUsed = 120 - timeLeft;

    const response = await LearningAPIService.submitChallengeAttempt(
      challengeId,
      userAnswers,
      timeUsed
    );

    if (response.success) {
      setServerScore(response.score);
      setServerPercentage(response.percentage);
      setXpEarned(response.xpEarned);
      setNewStreak(response.currentStreak);

      // Fetch leaderboard
      await fetchLeaderboard();
    }
  } catch (error) {
    console.error('Error submitting challenge:', error);
  } finally {
    setCompleted(true);
  }
};
```

#### 4. Fetch Leaderboard
```typescript
const fetchLeaderboard = async () => {
  try {
    const response = await LearningAPIService.getChallengeLeaderboard(challengeId, 10);
    if (response.success) {
      const formattedLeaderboard = response.leaderboard.map((entry: any) => ({
        rank: entry.rank,
        userId: entry.user_id.toString(),
        username: entry.username || `User ${entry.user_id}`,
        avatar: '👤',
        score: entry.score,
        timeCompleted: formatSeconds(entry.time_taken),
        streak: entry.current_streak || 0
      }));

      setLeaderboard(formattedLeaderboard);
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
};
```

### New State Variables Needed:

```typescript
const [todayChallenge, setTodayChallenge] = useState<ChallengeQuestion[]>([]);
const [challengeId, setChallengeId] = useState<number | null>(null);
const [loading, setLoading] = useState(true);
const [alreadyCompleted, setAlreadyCompleted] = useState(false);
const [maxXP, setMaxXP] = useState(300);
const [answersArray, setAnswersArray] = useState<any[]>([]);
const [serverScore, setServerScore] = useState(0);
const [xpEarned, setXpEarned] = useState(0);
const [newStreak, setNewStreak] = useState(0);
```

### Helper Functions Needed:

```typescript
const formatSeconds = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const trackAnswer = (questionId: number, selectedIndex: number) => {
  setAnswersArray(prev => {
    const existing = prev.findIndex(a => a.questionId === questionId);
    if (existing >= 0) {
      const newArr = [...prev];
      newArr[existing] = { questionId, selectedIndex };
      return newArr;
    }
    return [...prev, { questionId, selectedIndex }];
  });
};
```

## Implementation Steps:

1. ✅ Import LearningAPIService
2. Add new state variables
3. Replace mock data with API fetch on mount
4. Track user answers during quiz
5. Submit answers on completion
6. Fetch and display real leaderboard
7. Handle loading and error states
8. Add "Already Completed" state UI

## Files to Modify:
- `RadaAppClean/src/screens/learning/DailyChallengeScreen.tsx`

## Time Estimate:
- 30-45 minutes for complete integration
