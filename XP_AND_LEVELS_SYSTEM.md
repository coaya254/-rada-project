# XP and Levels System - RadaMobile Learning Platform

## Overview
The RadaMobile learning platform uses an Experience Points (XP) and Levels system to gamify the learning experience and track user progress.

## How XP Works

### Earning XP
Users earn XP by completing various learning activities:

1. **Completing Lessons**
   - Each lesson has an `xp_reward` value (stored in `learning_lessons.xp_reward`)
   - Default XP per lesson: Varies by lesson complexity
   - XP is awarded when a user marks a lesson as complete

2. **Passing Quizzes**
   - Each quiz has an `xp_reward` value (stored in `learning_quizzes.xp_reward`)
   - XP is only awarded when the user passes the quiz (score >= passing_score_percentage)
   - Failing a quiz does not award XP

3. **Completing Modules**
   - Modules themselves don't directly award XP
   - XP is earned from completing the individual lessons and quizzes within the module

4. **Daily Challenges**
   - Special daily challenges award bonus XP for completion

## How Levels Work

### Level Calculation Formula
```
Level = FLOOR(total_xp / 100) + 1
```

### Level Examples
- **Level 1**: 0 - 99 XP
- **Level 2**: 100 - 199 XP
- **Level 3**: 200 - 299 XP
- **Level 10**: 900 - 999 XP
- **Level 13**: 1200 - 1299 XP
- **Level 100**: 9900 - 9999 XP

### XP Required Per Level
Each level requires **100 XP** to advance to the next level.

### Progress to Next Level
```
Current Level XP = total_xp - ((current_level - 1) * 100)
XP to Next Level = (current_level * 100) - total_xp
Progress Percentage = (Current Level XP / 100) * 100
```

**Example:**
- User has 1250 XP
- Current Level = FLOOR(1250 / 100) + 1 = 13
- Current Level XP = 1250 - (12 * 100) = 50 XP
- XP to Next Level = (13 * 100) - 1250 = 50 XP
- Progress = (50 / 100) * 100 = 50%

## Database Schema

### Tables Involved

1. **user_learning_progress**
   - `user_id`: User identifier
   - `total_xp`: Total XP earned across all activities
   - `level`: Auto-calculated level based on total_xp
   - `lessons_completed`: Count of completed lessons
   - `quizzes_passed`: Count of passed quizzes
   - `hours_spent`: Total time spent learning
   - `last_activity`: Last activity timestamp

2. **user_xp_transactions**
   - `user_id`: User identifier
   - `amount`: XP amount (positive for earnings)
   - `source_type`: Type of activity ('lesson', 'quiz', 'achievement', etc.)
   - `source_id`: ID of the specific lesson/quiz/etc.
   - `description`: Human-readable description
   - `created_at`: When XP was earned

3. **user_learning_streaks**
   - `user_id`: User identifier
   - `current_streak`: Current consecutive days of activity
   - `longest_streak`: Longest streak ever achieved
   - `last_activity_date`: Last day user was active

## XP Rewards Guidelines

### Recommended XP Values

**Lessons:**
- Short lesson (5-10 min): 10-20 XP
- Medium lesson (10-20 min): 20-50 XP
- Long lesson (20+ min): 50-100 XP

**Quizzes:**
- Module quiz (5-10 questions): 50-100 XP
- Lesson quiz (2-5 questions): 20-40 XP
- Daily challenge: 30-50 XP

**Achievements:**
- Bronze achievement: 25 XP
- Silver achievement: 50 XP
- Gold achievement: 100 XP

## User Progress Tracking

### What Gets Tracked
1. **Total XP**: Sum of all XP earned
2. **Level**: Calculated from total XP
3. **Lessons Completed**: Count increments on lesson completion
4. **Quizzes Passed**: Count increments only when quiz is passed
5. **Modules Completed**: A module is 100% complete when all lessons are done
6. **Current Streak**: Consecutive days with at least one activity
7. **Longest Streak**: Best streak ever achieved

### Streak System
- **Increments**: When user completes any learning activity on a new day
- **Continues**: If user is active on consecutive days
- **Resets**: If user misses a day (no activity for 48+ hours)
- Streak updates happen automatically via the `updateStreak()` function

## API Endpoints

### Get User Progress
```
GET /api/learning/progress
```

**Response:**
```json
{
  "success": true,
  "progress": {
    "totalXP": 1200,
    "level": 13,
    "streak": 5,
    "longestStreak": 12,
    "completedModules": 3,
    "totalModules": 20,
    "lessonsCompleted": 54,
    "quizzesPassed": 8,
    "hoursSpent": 12.5,
    "lastActivity": "2025-10-16T05:58:45.000Z"
  }
}
```

### Get XP Transactions History
```
GET /api/learning/progress/weekly-activity
```

**Response:**
```json
{
  "success": true,
  "activity": [
    {
      "date": "2025-10-15",
      "xp_earned": 150
    },
    {
      "date": "2025-10-16",
      "xp_earned": 200
    }
  ]
}
```

## Frontend Display

### Progress Dashboard
Shows:
- Current level badge
- Total XP
- Current streak (fire icon)
- Modules completed
- Leaderboard rank

### Level Progress Bar
- Shows progress within current level
- Displays: "X / 100 XP"
- Shows: "Y XP to Level Z"
- Visual progress bar

### XP Notifications
When user earns XP:
- Show "+X XP" notification
- Animate XP counter
- Show level up animation when crossing level threshold

## Leaderboard System

### Ranking
Users are ranked by total XP:
```sql
SELECT user_id, total_xp, level
FROM user_learning_progress
WHERE total_xp > 0
ORDER BY total_xp DESC
```

### Periods
- **Weekly**: XP earned in last 7 days
- **Monthly**: XP earned in last 30 days
- **All-Time**: Total XP ever earned

## Notes

- XP cannot be negative (no penalties)
- XP is immutable once earned (no takebacks)
- Levels can only increase, never decrease
- Old quiz attempts don't award additional XP (only first pass counts)
- Redoing lessons doesn't award additional XP

## Future Enhancements

Potential features to consider:
- Bonus XP for streaks (e.g., 2x XP on day 7 of streak)
- Achievement-based XP bonuses
- Daily login rewards
- Referral bonuses
- Seasonal events with bonus XP
- XP decay for inactivity (controversial)
