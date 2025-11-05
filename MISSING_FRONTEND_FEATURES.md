# Missing Frontend Features in PoliHub

## Overview
After comparing the database schema with the current frontend implementation, here are all the features that exist in the database but are NOT displayed on the website.

---

## 🏛️ POLITICIAN-RELATED FEATURES (Missing from PoliticianDetailModal)

### ✅ Currently Shown:
- Basic info (name, title, party, chamber)
- Biography
- Key Issues (as tags)
- Committees
- Stats (views, comments)
- Contact/Social Media
- State/District

### ❌ MISSING from Frontend:

1. **📄 Documents** (`politician_documents` table)
   - Title, type, date, description, file_url
   - Examples: Bills authored, press releases, policy papers, speeches
   - **UI Suggestion:** Add a "Documents" tab showing downloadable PDFs

2. **📰 News Articles** (`politician_news` + `news_articles` tables)
   - Recent news mentioning the politician
   - Article headline, source, date, relevance score
   - Links to original articles
   - **UI Suggestion:** "Recent News" section with article cards

3. **📅 Timeline Events** (`politician_timeline` table)
   - Career milestones, major events, key dates
   - Type: election, appointment, legislation, scandal, achievement
   - **UI Suggestion:** Visual timeline component showing career path

4. **✅ Commitments/Promises** (`politician_commitments` table)
   - Campaign promises and their progress
   - Status: pending, in-progress, completed, broken
   - Deadline dates and progress percentage
   - **UI Suggestion:** Promise tracker with progress bars

5. **🗳️ Voting Records** (`politician_voting_records` + `votes` tables)
   - Individual votes on bills
   - Vote type: yea, nay, present, not_voting
   - Bill name, date, category
   - **UI Suggestion:** Voting history table with filters

6. **📊 Career Background** (`politician_career` table)
   - Education details
   - Previous positions
   - Achievements
   - Controversies
   - **UI Suggestion:** Expandable "Career" section

7. **📚 Wikipedia Data** (`politician_wikipedia` table)
   - Biography summary from Wikipedia
   - Family info
   - Career background
   - **UI Suggestion:** "About" tab with Wikipedia attribution

8. **💼 Committee Details** (Enhanced from `politician_committees`)
   - Currently shows: Committee names only
   - **Missing:** Role (chair, member, ranking), start/end dates
   - **UI Suggestion:** Show role badges (e.g., "Chair" in gold)

9. **🎯 Key Issues Details** (Enhanced from `politician_key_issues`)
   - Currently shows: Issue names as tags
   - **Missing:** Description, priority level
   - **UI Suggestion:** Expandable cards with detailed stance

10. **📧 Full Contact Info**
    - Currently shows: Twitter, Instagram, Website
    - **Missing:** Phone, Email, Office Address
    - **UI Suggestion:** "Contact" section with all details

---

## 📜 BILLS & LEGISLATION (Completely Missing)

### New Page/Section Needed: "Bills & Legislation"

**Tables:** `bills`, `votes`, `bill_cosponsors`

**Features to Display:**

1. **Bills List View**
   - Bill number, title, status
   - Sponsor name/photo
   - Introduced date, last action
   - Category tags
   - Vote tallies (if voted on)

2. **Bill Detail View** (Modal or Page)
   - Full title and short title
   - Description and summary
   - Full text link
   - Status tracker (introduced → committee → floor → passed/failed)
   - Sponsor and cosponsors
   - Vote breakdown by party
   - Timeline of actions

3. **Voting Records Integration**
   - On politician profile: Show their votes
   - On bill detail: Show all votes with politician names
   - Filter by vote type, party

---

## 📰 NEWS SYSTEM (Completely Missing)

### New Section Needed: "Latest News"

**Tables:** `news_sources`, `news_articles`, `politician_news`

**Features to Display:**

1. **News Feed**
   - Article headlines
   - Source (with tier badges: International, Kenyan, Regional)
   - Published date
   - Summary
   - Link to original article

2. **News Filtering**
   - By politician
   - By date range
   - By source tier
   - By relevance score

3. **News Cards**
   - Featured image
   - Headline
   - Source badge
   - Related politicians (as tags)
   - Read more link

---

## 📅 EVENTS SYSTEM (Completely Missing)

### New Section Needed: "Upcoming Events"

**Table:** `events`

**Features to Display:**

1. **Events Calendar/List**
   - Event title and type (town hall, debate, rally, etc.)
   - Date and time
   - Location (physical + virtual)
   - Organizer
   - Related politician

2. **Event Detail View**
   - Full description
   - Address/Map
   - Virtual link (if applicable)
   - RSVP/Add to Calendar buttons

3. **Event Filters**
   - By type
   - By date range
   - By politician
   - By state/location

---

## 💬 COMMENTS SYSTEM (Partially Missing)

### Currently: Blog posts have comment structure in database
### Missing: Comment submission and display UI

**Table:** `comments`, `comment_flags`

**Features to Display:**

1. **Comment Threads**
   - Nested replies (parent-child structure)
   - Pseudonym + timestamp
   - Flag/Report button
   - Reply button

2. **Comment Form**
   - Pseudonym input (required)
   - Email input (optional, not displayed)
   - Content textarea
   - Submit for moderation message

3. **Moderation Indicators**
   - "Awaiting approval" status
   - Comment count on posts

---

## 📊 ANALYTICS & TRENDING (Missing Public View)

**Tables:** `trending_content`, `popular_searches`, `daily_stats`

**Features to Display:**

1. **Trending Section** (Homepage)
   - Top politicians
   - Trending topics
   - Hot bills
   - Popular posts
   - Engagement scores

2. **Popular Searches Widget**
   - Recent popular search terms
   - Quick search shortcuts

3. **Stats Dashboard** (Public metrics)
   - Total page views
   - Most viewed politicians
   - Most read topics

---

## 🔍 SEARCH ENHANCEMENTS (Basic search exists, missing features)

**Tables:** `search_queries`, `popular_searches`

**Missing Features:**

1. **Search Results Page**
   - Currently: No search functionality visible
   - Need: Unified search across politicians, topics, bills, posts

2. **Search Suggestions**
   - Auto-complete
   - Popular searches
   - Recent searches

3. **Advanced Filters**
   - Search by type
   - Date range
   - Category/party filters

---

## 📧 NEWSLETTER (Form exists, missing confirmation flow)

**Table:** `newsletter_subscribers`

**Missing:**

1. Email confirmation flow
2. Unsubscribe link
3. Subscriber count display
4. "Thank you for subscribing" message

---

## ℹ️ ABOUT PAGE FEATURES (Completely Missing)

**Tables:** `team_members`, `awards`, `faqs`, `about_sections`

**Features to Display:**

1. **Team Section**
   - Team member cards
   - Names, roles, bios
   - Avatar emojis

2. **Awards/Recognition**
   - Award names
   - Organizations
   - Year received

3. **FAQs**
   - Categorized questions
   - Expandable answers

4. **About Sections**
   - Mission statement
   - Values
   - Our story
   - Impact metrics

---

## 🎨 SITE CUSTOMIZATION (Admin-controlled, not visible)

**Tables:** `site_settings`, `trending_topics`, `quick_searches`, `quotes_of_day`

**Missing from Homepage:**

1. **Quote of the Day** widget
2. **Trending Topics** tags
3. **Quick Search** shortcuts
4. **Dynamic site settings** (colors, featured content)

---

## PRIORITY IMPLEMENTATION ORDER

### 🔴 HIGH PRIORITY (Core Features)

1. **Politician Documents** - Add documents tab
2. **Voting Records** - Show how politicians voted
3. **News Articles** - Recent news about politicians
4. **Bills & Legislation** - New section for bills
5. **Timeline** - Career timeline on profile

### 🟡 MEDIUM PRIORITY (Engagement Features)

6. **Commitments/Promises** - Promise tracker
7. **Events System** - Upcoming events calendar
8. **Comments Display** - Show existing comments
9. **Search Results Page** - Functional search
10. **Career Background** - Education, achievements

### 🟢 LOW PRIORITY (Nice-to-Have)

11. **About Page** - Team, FAQs, awards
12. **Trending Widget** - Homepage trending content
13. **Quote of Day** - Homepage widget
14. **Analytics Dashboard** - Public stats
15. **Newsletter Confirmation** - Email flow

---

## SUMMARY TABLE

| Feature | Database Table | Frontend Status | Priority |
|---------|---------------|----------------|----------|
| Documents | `politician_documents` | ❌ Missing | 🔴 High |
| News Articles | `news_articles`, `politician_news` | ❌ Missing | 🔴 High |
| Timeline | `politician_timeline` | ❌ Missing | 🔴 High |
| Voting Records | `votes`, `politician_voting_records` | ❌ Missing | 🔴 High |
| Bills | `bills`, `bill_cosponsors` | ❌ Missing | 🔴 High |
| Commitments | `politician_commitments` | ❌ Missing | 🟡 Medium |
| Career Details | `politician_career` | ❌ Missing | 🟡 Medium |
| Wikipedia Data | `politician_wikipedia` | ❌ Missing | 🟡 Medium |
| Events | `events` | ❌ Missing | 🟡 Medium |
| Comments UI | `comments` | ❌ Missing | 🟡 Medium |
| Search Results | `search_queries` | ❌ Missing | 🟡 Medium |
| About Page | `team_members`, `awards`, `faqs` | ❌ Missing | 🟢 Low |
| Trending | `trending_content` | ❌ Missing | 🟢 Low |
| Committee Details | `politician_committees` | ⚠️ Partial | 🟡 Medium |
| Issue Details | `politician_key_issues` | ⚠️ Partial | 🟡 Medium |
| Contact Info | `politicians` (phone, email) | ⚠️ Partial | 🟡 Medium |

---

**Total Missing Features: 15+ major sections**
**Estimated Development Time: 40-60 hours**

Next step: Would you like me to create components for these missing features?
