# Profile Table Connections - Complete Map

## ✅ WORKING CONNECTIONS

### 1. Profile Tab → Community Posts (DISCUSSIONS)
**Database Flow:**
```
users.uuid → discussions.uuid
```
- **Table:** `discussions`
- **Join:** `users.uuid = discussions.uuid`
- **Shows:** All community posts created by the user
- **Status:** ✅ CONNECTED - Profile "Posts" tab shows discussions from Community tab

**What appears in profile:**
- Discussion title, content, category
- Likes, replies, views counts
- Created date

---

### 2. Profile Tab → User Learning Progress
**Database Flow:**
```
users.id → user_learning_progress.user_id
```
- **Table:** `user_learning_progress`
- **Join:** `users.id = user_learning_progress.user_id`
- **Shows:** Modules completed, lessons completed, quizzes passed
- **Status:** ✅ CONNECTED - Shows in profile card and Learning Progress section

**What appears in profile:**
- Total XP, current streak, longest streak
- Modules completed count
- Lessons completed count
- Quizzes passed count
- Achievements earned count

---

### 3. Profile Tab → XP & Activities
**Database Flow:**
```
users.uuid → xp_transactions.uuid
users.id → user_xp_transactions.user_id
```
- **Tables:** `xp_transactions`, `user_xp_transactions`
- **Status:** ✅ CONNECTED - Shows in Activities tab

**What appears in profile:**
- XP earned from various actions
- Quiz completions
- Discussion posts
- Reply activities

---

### 4. Profile Tab → Saved Items
**Database Flow:**
```
users.uuid → bookmarks.uuid (for discussions)
users.id → learning_bookmarks.user_id (for lessons/modules)
users.uuid → saved_items.uuid (for heroes/protests)
```
- **Tables:** `bookmarks`, `learning_bookmarks`, `saved_items`
- **Status:** ✅ CONNECTED - Shows in Saved tab

**What appears in profile:**
- Saved discussions
- Bookmarked learning content
- Saved heroes/protests

---

## 📊 TABLE STRUCTURE SUMMARY

### User Identification
- **Primary Key:** `users.id` (INT) - Internal database ID
- **Public Key:** `users.uuid` (VARCHAR) - Used for API calls and public references

### Which Tables Use What?
1. **UUID-based tables** (use `users.uuid`):
   - `discussions` - Community posts
   - `discussion_replies` - Comments on posts
   - `xp_transactions` - XP tracking
   - `bookmarks` - Saved discussions
   - `saved_items` - Saved heroes/protests
   - `posts` - News/content posts

2. **ID-based tables** (use `users.id`):
   - `user_learning_progress` - Learning stats
   - `user_xp_transactions` - Learning XP
   - `learning_bookmarks` - Saved learning content
   - `user_quiz_attempts` - Quiz history
   - `user_learning_modules` - Module progress
   - `user_learning_lessons` - Lesson progress
   - `community_posts` - (Empty, not used yet - uses author_id)

---

## 🔄 DATA FLOW

### When User Posts in Community:
```
1. User creates post → discussions table (stores uuid)
2. Post appears in Community tab ✅
3. Post appears in Profile "Posts" tab ✅
4. XP transaction recorded → xp_transactions (stores uuid) ✅
```

### When User Completes Learning:
```
1. User completes lesson → user_learning_lessons (stores user_id)
2. XP awarded → user_xp_transactions (stores user_id)
3. Progress updated → user_learning_progress (stores user_id)
4. All stats appear in Profile ✅
```

### When User Saves Content:
```
1. Save discussion → bookmarks (stores uuid)
2. Save lesson → learning_bookmarks (stores user_id)
3. All appear in Profile "Saved" tab ✅
```

---

## ⚠️ POTENTIAL IMPROVEMENTS

### 1. Standardize ID Usage
**Current Issue:** Mix of UUID and ID usage
**Recommendation:**
- Keep UUID for public-facing operations (API, shares, URLs)
- Keep ID for internal foreign keys (more efficient)
- Current approach is actually fine!

### 2. Community Posts Table
**Current Issue:** `community_posts` table exists but is empty (0 records)
**Status:** `discussions` table is being used instead (6 records)
**Recommendation:**
- Option A: Migrate discussions → community_posts
- Option B: Drop community_posts, keep using discussions ✅ (Currently working)

### 3. Posts Table
**Current Issue:** `posts` table has 29 records but uses sample UUIDs, not connected to real users
**Recommendation:**
- Clarify if this is for news/admin posts vs user discussions
- Keep separate if it's for curated content

---

## 🎯 WHAT'S ACTUALLY CONNECTED (Summary)

### Profile Tab Shows:
1. ✅ **Posts** → User's community discussions
2. ✅ **Saved** → Bookmarked content from Community & Learning
3. ✅ **Badges** → Link to achievements (data needs to be populated)
4. ✅ **Activities** → Recent XP gains, posts, replies, quizzes
5. ✅ **About** → User info, join date, persona
6. ✅ **Learning Progress** → Modules, lessons, quizzes completed
7. ✅ **Stats** → XP, Trust Score, Streak Days

### Community Tab Connects To Profile:
- ✅ Discussions authored by user appear in Profile "Posts"
- ✅ Discussion replies by user tracked in Activities
- ✅ XP from community engagement tracked

### Learning Tab Connects To Profile:
- ✅ Completed modules count shows in profile
- ✅ Completed lessons count shows in profile
- ✅ Passed quizzes count shows in profile
- ✅ XP from learning shows in profile
- ✅ Streak tracking connected
- ⚠️ Leaderboard needs avatar/profile link (pending)

---

## 🚀 NEXT STEPS

1. **Add clickable usernames** in Community → navigate to UserProfile screen
2. **Add profile links** in Learning leaderboards
3. **Populate achievements** data so badges tab shows real achievements
4. **Consider consolidating** posts/discussions/community_posts tables

---

## 📝 CODE REFERENCES

- **Profile API:** `profile-content-api-routes.js`
- **Profile Service:** `RadaAppClean/src/services/ProfileAPIService.ts`
- **Profile Screen:** `RadaAppClean/src/screens/profile/ProfileHome.tsx`
- **User Profile Screen:** `RadaAppClean/src/screens/profile/UserProfileScreen.tsx`
- **Community API:** `RadaAppClean/src/services/communityApi.ts`
