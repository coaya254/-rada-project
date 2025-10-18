# DAILY CHALLENGE SYSTEM - STATUS & TODO

## Current Status

### ✓ FRONTEND (User End)
**Location:** `RadaAppClean/src/screens/learning/DailyChallengeScreen.tsx`

**Status:** Complete UI with mock data
- ✓ Challenge start screen with streak display
- ✓ Question-by-question quiz interface
- ✓ Timer countdown (2 minutes)
- ✓ Answer selection and validation
- ✓ Explanations for correct/wrong answers
- ✓ Completion screen with score
- ✓ Leaderboard display
- ✓ Animations and smooth transitions

**Issue:** Using hardcoded mock data, not connected to backend API

### ✓ BACKEND API
**Location:** `learning-advanced-features.js`

**Status:** Partially implemented
- ✓ GET `/api/learning/challenges/today` - Working (returns quiz data)
- ✓ POST `/api/learning/challenges/:id/attempt` - Implemented
- ✓ GET `/api/learning/challenges/:id/leaderboard` - Implemented
- ✓ Auto-creates daily challenge from quiz pool

**Current Behavior:**
- Queries `learning_daily_challenges` table
- Falls back to creating challenge from `learning_quizzes` if none exists
- Returns quiz with questions

### ⚠️ DATABASE
**Status:** Partially created

**Existing Tables:**
1. ✓ `learning_daily_challenges` (1 row)
   - id, challenge_date, quiz_id, xp_reward, is_active, created_at

**Missing Tables:**
1. ✗ `daily_challenge_attempts` or `user_daily_challenge_attempts`
   - To track user attempts
   - Store: user_id, challenge_id, score, time_taken, submitted_at

2. ✗ `daily_challenge_leaderboard` (optional)
   - Or use attempts table for leaderboard queries

### ✓ API SERVICE
**Location:** `RadaAppClean/src/services/LearningAPIService.ts`

**Status:** Methods exist
- ✓ `getTodayChallenge()`
- ✓ `submitChallengeAttempt(challengeId, answers, timeSpent)`
- ✓ `getChallengeLeaderboard(challengeId, limit)`

### ✗ ADMIN PANEL
**Status:** Not created

**Missing:**
- No admin screen to:
  - Create/schedule daily challenges
  - Select quiz for specific date
  - Set XP rewards
  - View challenge analytics
  - Manage active/inactive challenges

---

## What Needs to Be Done

### 1. DATABASE - Create Attempts Table ✗

```sql
CREATE TABLE IF NOT EXISTS user_daily_challenge_attempts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  challenge_id INT NOT NULL,
  score INT NOT NULL,
  max_score INT NOT NULL,
  time_taken INT NOT NULL, -- in seconds
  answers JSON, -- store user answers
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (challenge_id) REFERENCES learning_daily_challenges(id),

  UNIQUE KEY unique_user_challenge (user_id, challenge_id)
);
```

### 2. BACKEND - Update Attempts Endpoint ⚠️

Currently implemented but needs to:
- Store attempts in database (not just return success)
- Award XP for successful attempts
- Update user streak
- Return leaderboard position

**File:** `learning-advanced-features.js` line ~170

### 3. BACKEND - Fix Leaderboard Query ⚠️

Currently implemented but needs:
- Query actual attempts table
- Calculate rankings
- Include user streaks
- Handle same-day multiple attempts

**File:** `learning-advanced-features.js` line ~200

### 4. FRONTEND - Connect to Real API ✗

**File:** `RadaAppClean/src/screens/learning/DailyChallengeScreen.tsx`

Replace mock data with API calls:
```typescript
// On component mount:
const fetchChallenge = async () => {
  const response = await LearningAPIService.getTodayChallenge();
  // Set: questions, challenge ID, streak info
};

// On submit:
const handleSubmit = async () => {
  const response = await LearningAPIService.submitChallengeAttempt(
    challengeId,
    userAnswers,
    timeSpent
  );
  // Show results, update streak
};

// On completion:
const fetchLeaderboard = async () => {
  const response = await LearningAPIService.getChallengeLeaderboard(
    challengeId,
    10
  );
  // Display top 10 users
};
```

### 5. ADMIN PANEL - Create Management Screen ✗

**New File:** `RadaAppClean/src/screens/admin/DailyChallengesManagementScreen.tsx`

Features needed:
- Calendar view to schedule challenges
- Quiz selector for each date
- XP reward configuration
- Preview today's challenge
- Analytics dashboard:
  - Participation rate
  - Average score
  - Completion time
  - Popular question types

### 6. ADMIN BACKEND - Create Admin Routes ✗

**New File or Addition to:** `learning-admin-api-routes.js`

```javascript
// POST /api/admin/learning/daily-challenges
// Create/schedule daily challenge

// PUT /api/admin/learning/daily-challenges/:id
// Update challenge (quiz, XP reward, date)

// DELETE /api/admin/learning/daily-challenges/:id
// Remove challenge

// GET /api/admin/learning/daily-challenges/analytics
// Get participation stats
```

### 7. INTEGRATION - Connect Streaks ⚠️

**Current:** Frontend shows mock streak (7 days)
**Needed:**
- Fetch from `user_learning_streaks` table
- Update streak on successful challenge (67%+ accuracy)
- Award bonus XP for maintaining streak

---

## Priority Order

### HIGH PRIORITY (Core Functionality)
1. ✗ Create `user_daily_challenge_attempts` table
2. ✗ Update frontend to use real API data
3. ⚠️ Fix backend to store attempts properly
4. ⚠️ Fix leaderboard to query real data
5. ⚠️ Integrate with streak system

### MEDIUM PRIORITY (Admin)
6. ✗ Create admin panel screen
7. ✗ Create admin API routes
8. ✗ Add challenge scheduling UI

### LOW PRIORITY (Enhancements)
9. Add notifications for daily challenges
10. Add challenge history view
11. Add difficulty levels
12. Add themed challenges (weekly topics)

---

## Quick Start Commands

### 1. Create Attempts Table
```bash
node create-daily-challenge-attempts-table.js
```

### 2. Test Full Flow
```bash
node test-daily-challenge-flow.js
```

### 3. Verify Integration
```bash
node check-daily-challenge-integration.js
```

---

## Summary

**What's Working:**
- ✓ Beautiful frontend UI with all features
- ✓ Backend API endpoints exist
- ✓ API service methods exist
- ✓ Basic database table (learning_daily_challenges)

**What's Broken:**
- ✗ Frontend uses mock data (not connected to API)
- ✗ No attempts tracking (missing table)
- ✗ Leaderboard returns empty/mock data
- ✗ Streaks not integrated
- ✗ No admin management interface

**Time to Fix:**
- Database table: 5 minutes
- Backend fixes: 30 minutes
- Frontend integration: 1 hour
- Admin panel: 2-3 hours
- **Total: ~4-5 hours**
