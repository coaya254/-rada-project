# Learning System - Admin Panel & Backend API Checklist

This document maps all frontend learning features to required backend APIs and admin panel functionality.

---

## 1. MODULES MANAGEMENT

### Frontend Features:
- Browse modules with filters (category, difficulty)
- Module cards showing: title, description, icon, progress, lessons count, XP reward, difficulty
- Module detail page with lessons list
- Track module completion progress

### Required Backend APIs:

#### Admin Panel:
- [ ] **Create Module**
  - POST `/api/admin/learning/modules`
  - Fields: title, description, category, difficulty (Beginner/Intermediate/Advanced), icon, total_xp, estimated_hours

- [ ] **Edit Module**
  - PUT `/api/admin/learning/modules/:moduleId`
  - Update all module fields

- [ ] **Delete Module**
  - DELETE `/api/admin/learning/modules/:moduleId`
  - Soft delete or cascade delete lessons

- [ ] **List All Modules (Admin)**
  - GET `/api/admin/learning/modules`
  - Include: stats, enrollment count, completion rate

- [ ] **Reorder Modules**
  - PUT `/api/admin/learning/modules/reorder`
  - Body: `{ moduleIds: [id1, id2, id3] }`

#### User-Facing APIs:
- [ ] **Get All Modules**
  - GET `/api/learning/modules`
  - Query params: `?category=&difficulty=&search=`
  - Include user progress for authenticated users

- [ ] **Get Module Details**
  - GET `/api/learning/modules/:moduleId`
  - Include: lessons list, user progress, completion status

- [ ] **Enroll in Module**
  - POST `/api/learning/modules/:moduleId/enroll`
  - Create user_modules record

---

## 2. LESSONS MANAGEMENT

### Frontend Features:
- Lesson types: text, video, interactive, quiz
- Lesson content with rich formatting (bold, bullets, numbered lists)
- Mark lessons as complete
- Track lesson progress
- Bookmark lessons
- Locked/unlocked lessons (sequential)

### Required Backend APIs:

#### Admin Panel:
- [ ] **Create Lesson**
  - POST `/api/admin/learning/lessons`
  - Fields: module_id, title, description, content (rich text/markdown), type (text/video/interactive/quiz), duration_minutes, xp_reward, order, is_locked, prerequisites

- [ ] **Edit Lesson**
  - PUT `/api/admin/learning/lessons/:lessonId`
  - Update content, type, duration, etc.

- [ ] **Delete Lesson**
  - DELETE `/api/admin/learning/lessons/:lessonId`

- [ ] **Reorder Lessons in Module**
  - PUT `/api/admin/learning/lessons/reorder`
  - Body: `{ moduleId, lessonIds: [id1, id2, id3] }`

- [ ] **Upload Video for Lesson**
  - POST `/api/admin/learning/lessons/:lessonId/video`
  - File upload with video URL storage

#### User-Facing APIs:
- [ ] **Get Lesson Details**
  - GET `/api/learning/lessons/:lessonId`
  - Include: content, type, completion status, next/previous lesson

- [ ] **Mark Lesson Complete**
  - POST `/api/learning/lessons/:lessonId/complete`
  - Update user_lesson_progress
  - Award XP

- [ ] **Bookmark Lesson**
  - POST `/api/learning/bookmarks`
  - Body: `{ lessonId, type: 'lesson' }`

- [ ] **Remove Bookmark**
  - DELETE `/api/learning/bookmarks/:bookmarkId`

---

## 3. QUIZZES MANAGEMENT

### Frontend Features:
- Multiple-choice questions
- Instant feedback with explanations
- Timer for quizzes
- Score calculation
- Completion screen with performance stats
- Mini quizzes after lessons

### Required Backend APIs:

#### Admin Panel:
- [ ] **Create Quiz**
  - POST `/api/admin/learning/quizzes`
  - Fields: module_id, title, description, time_limit_minutes, passing_score_percentage, xp_reward

- [ ] **Edit Quiz**
  - PUT `/api/admin/learning/quizzes/:quizId`

- [ ] **Delete Quiz**
  - DELETE `/api/admin/learning/quizzes/:quizId`

- [ ] **Create Question**
  - POST `/api/admin/learning/quizzes/:quizId/questions`
  - Fields: question_text, options (JSON array), correct_answer_index, explanation, points, order

- [ ] **Edit Question**
  - PUT `/api/admin/learning/questions/:questionId`

- [ ] **Delete Question**
  - DELETE `/api/admin/learning/questions/:questionId`

- [ ] **Reorder Questions**
  - PUT `/api/admin/learning/quizzes/:quizId/questions/reorder`

#### User-Facing APIs:
- [ ] **Get Quiz Details**
  - GET `/api/learning/quizzes/:quizId`
  - Include: questions (without correct answers initially), time limit, passing score

- [ ] **Submit Quiz Answer**
  - POST `/api/learning/quizzes/:quizId/submit`
  - Body: `{ questionId, selectedAnswer }`
  - Return: is_correct, explanation, current_score

- [ ] **Complete Quiz**
  - POST `/api/learning/quizzes/:quizId/complete`
  - Body: `{ answers: [{questionId, selectedAnswer}], timeSpent }`
  - Return: score, percentage, passed, xp_earned

---

## 4. DAILY CHALLENGES

### Frontend Features:
- Daily rotating civic knowledge challenge
- Streak tracking
- Leaderboard for daily participants
- Special rewards for completion
- Time-limited (resets daily)

### Required Backend APIs:

#### Admin Panel:
- [ ] **Create Challenge Template**
  - POST `/api/admin/learning/challenges/templates`
  - Fields: title, description, questions (reusable quiz), xp_reward, difficulty

- [ ] **Schedule Daily Challenge**
  - POST `/api/admin/learning/challenges/schedule`
  - Body: `{ templateId, date, active: true }`

- [ ] **View Challenge Stats**
  - GET `/api/admin/learning/challenges/stats`
  - Include: participation rate, completion rate, average score

#### User-Facing APIs:
- [ ] **Get Today's Challenge**
  - GET `/api/learning/challenges/today`
  - Return: challenge details, questions, user status (completed/pending)

- [ ] **Submit Challenge**
  - POST `/api/learning/challenges/:challengeId/submit`
  - Body: `{ answers, timeCompleted }`
  - Update streak, award XP, return score

- [ ] **Get Challenge Leaderboard**
  - GET `/api/learning/challenges/:challengeId/leaderboard`
  - Return: top participants, scores, completion times

- [ ] **Get User Streak**
  - GET `/api/learning/challenges/streak`
  - Return: current_streak, longest_streak, last_completed

---

## 5. LEARNING PATHS

### Frontend Features:
- Curated learning journeys with multiple modules
- Sequential module progression
- Path completion tracking
- Difficulty levels
- Estimated completion time

### Required Backend APIs:

#### Admin Panel:
- [ ] **Create Learning Path**
  - POST `/api/admin/learning/paths`
  - Fields: title, description, category, difficulty, estimated_hours, icon, color

- [ ] **Edit Learning Path**
  - PUT `/api/admin/learning/paths/:pathId`

- [ ] **Add Module to Path**
  - POST `/api/admin/learning/paths/:pathId/modules`
  - Body: `{ moduleId, order, prerequisites: [moduleId1, moduleId2] }`

- [ ] **Remove Module from Path**
  - DELETE `/api/admin/learning/paths/:pathId/modules/:moduleId`

- [ ] **Reorder Path Modules**
  - PUT `/api/admin/learning/paths/:pathId/modules/reorder`

#### User-Facing APIs:
- [ ] **Get All Learning Paths**
  - GET `/api/learning/paths`
  - Include user progress

- [ ] **Get Path Details**
  - GET `/api/learning/paths/:pathId`
  - Include: modules with lock status, progress, next module

- [ ] **Enroll in Path**
  - POST `/api/learning/paths/:pathId/enroll`

- [ ] **Get Path Progress**
  - GET `/api/learning/paths/:pathId/progress`
  - Return: completed modules, total modules, percentage, xp earned

---

## 6. CERTIFICATES

### Frontend Features:
- Certificate issuance on module/path completion
- Certificate details: issuer, date, credential ID, skills
- Filter certificates (active/expired)
- Share certificates
- Download certificates (PDF)
- Expiration dates

### Required Backend APIs:

#### Admin Panel:
- [ ] **Configure Certificate Template**
  - POST `/api/admin/learning/certificates/templates`
  - Fields: name, description, validity_months, required_score_percentage

- [ ] **View Issued Certificates**
  - GET `/api/admin/learning/certificates`
  - Query params: `?userId=&status=&dateFrom=`

- [ ] **Revoke Certificate**
  - PUT `/api/admin/learning/certificates/:certificateId/revoke`

#### User-Facing APIs:
- [ ] **Get User Certificates**
  - GET `/api/learning/certificates`
  - Include: all certificates with status (active/expired)

- [ ] **Get Certificate Details**
  - GET `/api/learning/certificates/:certificateId`
  - Include: credential ID, issue date, expiry date, skills, verification URL

- [ ] **Download Certificate PDF**
  - GET `/api/learning/certificates/:certificateId/download`
  - Generate and return PDF

- [ ] **Verify Certificate**
  - GET `/api/learning/certificates/verify/:credentialId`
  - Public endpoint for verification

#### Auto-Issuance:
- [ ] **Auto-issue on Module Completion**
  - Triggered when module completion >= threshold
  - Generate unique credential ID
  - Store certificate record

- [ ] **Auto-issue on Path Completion**
  - Triggered when all path modules completed
  - Include skills from all modules

---

## 7. ACHIEVEMENTS & GAMIFICATION

### Frontend Features:
- Achievement badges with rarity levels
- Category filters (all/earned/locked)
- Progress tracking for achievements
- Achievement details modal

### Required Backend APIs:

#### Admin Panel:
- [ ] **Create Achievement**
  - POST `/api/admin/learning/achievements`
  - Fields: title, description, icon, rarity (Common/Rare/Epic/Legendary), criteria_type (lessons_completed/quizzes_passed/streak_days/xp_earned), criteria_value, xp_reward

- [ ] **Edit Achievement**
  - PUT `/api/admin/learning/achievements/:achievementId`

- [ ] **Delete Achievement**
  - DELETE `/api/admin/learning/achievements/:achievementId`

- [ ] **View Achievement Stats**
  - GET `/api/admin/learning/achievements/stats`
  - Include: earn rate per achievement

#### User-Facing APIs:
- [ ] **Get All Achievements**
  - GET `/api/learning/achievements`
  - Include: user's earned status, progress percentage

- [ ] **Get Achievement Progress**
  - GET `/api/learning/achievements/:achievementId/progress`
  - Return: current_value, required_value, percentage

#### Auto-Award Logic:
- [ ] **Check Achievement Criteria on Actions**
  - Triggered on: lesson complete, quiz pass, daily login, XP gain
  - Award achievement if criteria met
  - Send notification

---

## 8. LEADERBOARD

### Frontend Features:
- Weekly/monthly/all-time rankings
- User's current position
- Top performers with stats
- XP-based ranking
- Streak information

### Required Backend APIs:

#### Admin Panel:
- [ ] **View Leaderboard Stats**
  - GET `/api/admin/learning/leaderboard/stats`
  - Include: most active users, XP distribution

- [ ] **Reset Leaderboard Period**
  - POST `/api/admin/learning/leaderboard/reset`
  - Body: `{ period: 'weekly' | 'monthly' }`

#### User-Facing APIs:
- [ ] **Get Leaderboard**
  - GET `/api/learning/leaderboard`
  - Query params: `?period=weekly|monthly|all-time&limit=100`
  - Return: ranked users with XP, level, streak

- [ ] **Get User Rank**
  - GET `/api/learning/leaderboard/me`
  - Return: user's current rank, XP, position change

---

## 9. PROGRESS TRACKING

### Frontend Features:
- User dashboard with overall stats
- Level system based on XP
- Weekly activity chart
- Category-wise progress
- Streak tracking
- Hours completed

### Required Backend APIs:

#### User-Facing APIs:
- [ ] **Get User Progress Dashboard**
  - GET `/api/learning/progress`
  - Return: total_xp, level, current_streak, longest_streak, modules_completed, lessons_completed, quizzes_passed, hours_spent, achievements_earned

- [ ] **Get Weekly Activity**
  - GET `/api/learning/progress/weekly-activity`
  - Return: array of 7 days with XP earned each day

- [ ] **Get Category Progress**
  - GET `/api/learning/progress/categories`
  - Return: progress per category (Government, Elections, Rights, etc.)

- [ ] **Get Recent Activity**
  - GET `/api/learning/progress/recent-activity`
  - Return: last 10 completed lessons/quizzes with timestamps

---

## 10. BOOKMARKS

### Frontend Features:
- Bookmark lessons, modules, quizzes
- Filter by type
- Quick access to saved content
- Remove bookmarks

### Required Backend APIs:

#### User-Facing APIs:
- [ ] **Get User Bookmarks**
  - GET `/api/learning/bookmarks`
  - Query params: `?type=lesson|module|quiz`
  - Return: bookmarked items with metadata

- [ ] **Add Bookmark**
  - POST `/api/learning/bookmarks`
  - Body: `{ itemId, itemType }`

- [ ] **Remove Bookmark**
  - DELETE `/api/learning/bookmarks/:bookmarkId`

---

## 11. XP & LEVELING SYSTEM

### Frontend Features:
- XP display everywhere
- Level progression
- XP rewards for actions
- Level badges

### Required Backend APIs:

#### Admin Panel:
- [ ] **Configure XP Rewards**
  - PUT `/api/admin/learning/xp-config`
  - Body: `{ lesson_completion: 25, quiz_pass: 50, daily_challenge: 100, streak_bonus: 10 }`

- [ ] **Configure Level Thresholds**
  - PUT `/api/admin/learning/level-config`
  - Body: `{ levels: [{level: 1, xp_required: 0}, {level: 2, xp_required: 100}, ...] }`

#### User-Facing APIs:
- [ ] **Award XP**
  - POST `/api/learning/xp/award`
  - Body: `{ action_type, amount, metadata }`
  - Return: new_total_xp, level_up (boolean), new_level

- [ ] **Get XP History**
  - GET `/api/learning/xp/history`
  - Return: XP transactions with timestamps and sources

---

## 12. CONTENT MANAGEMENT

### Frontend Features:
- Rich text content in lessons
- Video embedding
- Interactive elements
- Images and media

### Required Backend APIs:

#### Admin Panel:
- [ ] **Upload Media**
  - POST `/api/admin/learning/media`
  - Support: images (PNG, JPG), videos (MP4), documents (PDF)
  - Return: media URL

- [ ] **Delete Media**
  - DELETE `/api/admin/learning/media/:mediaId`

- [ ] **List All Media**
  - GET `/api/admin/learning/media`
  - Include: usage count, file size, upload date

---

## 13. ANALYTICS & REPORTING

### Frontend Features:
- Admin dashboard with learning analytics

### Required Backend APIs:

#### Admin Panel:
- [ ] **Overall Learning Stats**
  - GET `/api/admin/learning/analytics/overview`
  - Return: total_users, active_users, modules_created, lessons_created, avg_completion_rate, total_xp_awarded

- [ ] **Module Performance**
  - GET `/api/admin/learning/analytics/modules`
  - Return: enrollment count, completion rate, avg time to complete, dropout rate per module

- [ ] **Quiz Performance**
  - GET `/api/admin/learning/analytics/quizzes`
  - Return: avg score, pass rate, most difficult questions per quiz

- [ ] **User Engagement**
  - GET `/api/admin/learning/analytics/engagement`
  - Query params: `?dateFrom=&dateTo=`
  - Return: daily active users, avg session time, content consumed

- [ ] **Certificate Issuance Report**
  - GET `/api/admin/learning/analytics/certificates`
  - Return: certificates issued over time, most popular certificates

- [ ] **Export Analytics**
  - GET `/api/admin/learning/analytics/export`
  - Query params: `?type=modules|users|quizzes&format=csv|xlsx`

---

## DATABASE SCHEMA REQUIRED

### Tables Needed:

1. **modules**
   - id, title, description, category, difficulty, icon, total_xp, estimated_hours, order, created_at, updated_at

2. **lessons**
   - id, module_id, title, description, content, type, duration_minutes, xp_reward, order, is_locked, prerequisites, created_at, updated_at

3. **quizzes**
   - id, module_id, title, description, time_limit_minutes, passing_score, xp_reward, created_at, updated_at

4. **quiz_questions**
   - id, quiz_id, question_text, options (JSON), correct_answer_index, explanation, points, order

5. **user_modules**
   - id, user_id, module_id, enrolled_at, started_at, completed_at, progress_percentage

6. **user_lessons**
   - id, user_id, lesson_id, started_at, completed_at, time_spent_minutes

7. **user_quiz_attempts**
   - id, user_id, quiz_id, score, percentage, passed, time_spent_seconds, submitted_at, answers (JSON)

8. **learning_paths**
   - id, title, description, category, difficulty, estimated_hours, icon, color, created_at

9. **learning_path_modules**
   - id, path_id, module_id, order, prerequisites (JSON)

10. **user_learning_paths**
    - id, user_id, path_id, enrolled_at, completed_at, progress_percentage

11. **daily_challenges**
    - id, challenge_date, quiz_id, xp_reward, active, created_at

12. **user_challenge_attempts**
    - id, user_id, challenge_id, score, time_completed_seconds, submitted_at

13. **user_streaks**
    - id, user_id, current_streak, longest_streak, last_activity_date

14. **certificates**
    - id, user_id, module_id, path_id, credential_id, title, issued_at, expires_at, skills (JSON), is_revoked

15. **achievements**
    - id, title, description, icon, rarity, criteria_type, criteria_value, xp_reward, created_at

16. **user_achievements**
    - id, user_id, achievement_id, earned_at, progress_value

17. **bookmarks**
    - id, user_id, item_id, item_type (lesson/module/quiz), created_at

18. **user_xp_transactions**
    - id, user_id, amount, source_type, source_id, description, created_at

19. **user_progress**
    - id, user_id, total_xp, level, current_streak, longest_streak, last_activity, modules_completed, lessons_completed, quizzes_passed, hours_spent

20. **learning_media**
    - id, filename, file_path, file_type, file_size, uploaded_by, created_at

---

## PRIORITY IMPLEMENTATION ORDER

### Phase 1 - Core Foundation (Week 1-2):
1. ✅ Modules CRUD (Admin + User APIs)
2. ✅ Lessons CRUD (Admin + User APIs)
3. ✅ User progress tracking (modules, lessons)
4. ✅ XP system basics

### Phase 2 - Quizzes & Assessment (Week 3):
5. ✅ Quizzes CRUD (Admin)
6. ✅ Quiz questions management
7. ✅ Quiz submission and scoring

### Phase 3 - Engagement Features (Week 4):
8. ✅ Bookmarks
9. ✅ Achievements system
10. ✅ Leaderboard

### Phase 4 - Advanced Features (Week 5):
11. ✅ Daily challenges
12. ✅ Learning paths
13. ✅ Streak tracking

### Phase 5 - Credentials & Polish (Week 6):
14. ✅ Certificates generation
15. ✅ Analytics dashboard
16. ✅ Media management

---

## SUMMARY

**Total Admin API Endpoints Needed:** ~60
**Total User-Facing API Endpoints Needed:** ~40
**Total Database Tables:** 20

This checklist ensures that every feature visible in the frontend has corresponding backend support for data management, user tracking, and admin control.
