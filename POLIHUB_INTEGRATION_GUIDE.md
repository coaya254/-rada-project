# PoliHub + Learning Integration Guide

## Overview
This guide explains how to integrate the PoliHub political education platform with the existing RadaAppClean learning system using a shared database.

## Database Structure

### Shared Database: `rada_ke`

The integration uses a single database (`rada_ke`) that contains:
- **Learning modules** (from RadaAppClean) - `admin_modules`, `admin_lessons`, `admin_quizzes`
- **Political data** (new) - `politicians`, `bills`, `votes`, `civic_topics`
- **Blog/Discourse** (new) - `blog_posts`, `comments`
- **Analytics** (shared) - `page_views`, `daily_stats`, `content_analytics`

## Files Created

### 1. Database Schema
**File:** `database/integrated_polihub_learning_schema.sql`

This file contains all necessary tables for the integration:
- Politicians and committees
- Bills and voting records
- Civic education topics
- Blog posts and comments
- Newsletter subscriptions
- Analytics and trending content
- Events system
- Moderation queue

### 2. API Routes
**File:** `polihub-integrated-api-routes.js`

Complete API endpoints for:
- Politicians CRUD operations
- Civic topics management
- Blog posts and comments
- Bills and voting records
- Newsletter subscriptions
- Search functionality
- Trending content

## Setup Instructions

### Step 1: Run Database Migration

```bash
# Connect to MySQL
mysql -u root -p

# Use the rada_ke database
USE rada_ke;

# Run the migration script
SOURCE C:/Users/muthe/OneDrive/Desktop/radamtaani/database/integrated_polihub_learning_schema.sql;
```

### Step 2: Update server.js

Add the new routes to your `server.js`:

```javascript
// Add at the top with other imports
const polihubIntegratedRoutes = require('./polihub-integrated-api-routes');

// Add with other route registrations
app.use('/', polihubIntegratedRoutes(db));
```

### Step 3: Restart the Server

```bash
# Kill existing processes on port 3000
taskkill //F //PID <process_id>

# Start the server
node server.js
```

## API Endpoints Reference

### Politicians

```javascript
// Get all politicians with filters
GET /api/polihub/politicians?party=Democrat&chamber=Senate&state=CA

// Get single politician with details
GET /api/polihub/politicians/:id

// Track politician profile view
POST /api/polihub/politicians/:id/view
```

### Civic Education

```javascript
// Get all civic topics
GET /api/polihub/civic-topics?category=Constitution&difficulty=beginner

// Get topic details
GET /api/polihub/civic-topics/:slug
```

### Blog & Discourse

```javascript
// Get blog posts
GET /api/polihub/blog?category=Policy%20Analysis&limit=10

// Get single post
GET /api/polihub/blog/:slug

// Get post comments
GET /api/polihub/blog/:postId/comments

// Post a comment
POST /api/polihub/blog/:postId/comments
{
  "pseudonym": "Anonymous Reader",
  "email": "optional@email.com",
  "content": "Great article!",
  "parent_comment_id": null
}
```

### Bills & Voting

```javascript
// Get bills
GET /api/polihub/bills?status=passed&chamber=senate

// Get bill details with votes
GET /api/polihub/bills/:id
```

### Search

```javascript
// Universal search
GET /api/polihub/search?q=healthcare&type=all

// Type-specific search (politicians, topics, posts, bills)
GET /api/polihub/search?q=biden&type=politicians
```

### Newsletter

```javascript
// Subscribe to newsletter
POST /api/polihub/newsletter/subscribe
{
  "email": "user@example.com"
}
```

### Trending

```javascript
// Get trending content
GET /api/polihub/trending
```

## Frontend Integration

### Update PoliHub Components

1. **Update polihub/src/data/ files** to fetch from API instead of static data:

```javascript
// Before (static data)
import { politicians } from './data/politicians';

// After (API call)
const [politicians, setPoliticians] = useState([]);

useEffect(() => {
  fetch('http://localhost:3000/api/polihub/politicians')
    .then(res => res.json())
    .then(data => setPoliticians(data.data));
}, []);
```

2. **Create API service file** for cleaner code:

```javascript
// polihub/src/services/api.js
const API_BASE = 'http://localhost:3000/api/polihub';

export const api = {
  politicians: {
    getAll: (filters) => fetch(`${API_BASE}/politicians?${new URLSearchParams(filters)}`).then(r => r.json()),
    getOne: (id) => fetch(`${API_BASE}/politicians/${id}`).then(r => r.json()),
  },
  civicTopics: {
    getAll: (filters) => fetch(`${API_BASE}/civic-topics?${new URLSearchParams(filters)}`).then(r => r.json()),
    getOne: (slug) => fetch(`${API_BASE}/civic-topics/${slug}`).then(r => r.json()),
  },
  blog: {
    getPosts: (filters) => fetch(`${API_BASE}/blog?${new URLSearchParams(filters)}`).then(r => r.json()),
    getPost: (slug) => fetch(`${API_BASE}/blog/${slug}`).then(r => r.json()),
    getComments: (postId) => fetch(`${API_BASE}/blog/${postId}/comments`).then(r => r.json()),
    postComment: (postId, comment) => fetch(`${API_BASE}/blog/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    }).then(r => r.json()),
  },
  search: (query, type = 'all') => fetch(`${API_BASE}/search?q=${query}&type=${type}`).then(r => r.json()),
};
```

## Data Migration from Static to Database

### Politicians Data

```sql
-- Example: Inserting politician data
INSERT INTO politicians (
  full_name, nickname, title, party, chamber, state,
  image_url, biography, status
) VALUES (
  'Joseph Biden', 'Joe Biden', 'President', 'Democrat', 'Executive', 'Delaware',
  '/images/biden.jpg', 'Biography text...', 'active'
);
```

### Civic Topics Data

```sql
-- Example: Inserting civic topic
INSERT INTO civic_topics (
  title, slug, subtitle, category, icon_emoji,
  difficulty_level, read_time_minutes, intro_text, published
) VALUES (
  'Checks and Balances', 'checks-and-balances',
  'How the three branches of government keep each other in check',
  'Constitution', '⚖️', 'beginner', 10,
  'Understanding the system of checks and balances...', TRUE
);
```

### Blog Posts Data

```sql
-- Example: Inserting blog post
INSERT INTO blog_posts (
  title, slug, excerpt, category, author_name, author_role,
  read_time_minutes, status, published_at
) VALUES (
  'Understanding the Infrastructure Bill', 'infrastructure-bill-explained',
  'A deep dive into the infrastructure legislation...', 'Policy Analysis',
  'Sarah Chen', 'Policy Analyst', 8, 'published', NOW()
);
```

## Connecting Learning and Politics

### Cross-Module Learning Paths

You can create learning paths that combine:
1. **Civic Education Topics** (read-only learning)
2. **Learning Modules** (interactive quizzes from RadaAppClean)
3. **Political Profiles** (real-world examples)
4. **Blog Discussions** (community engagement)

Example query to create a learning path:

```sql
-- Create a table to link learning modules with civic topics
CREATE TABLE IF NOT EXISTS learning_civic_paths (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_items JSON, -- [{type: 'civic_topic', id: 1}, {type: 'module', id: 5}]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Analytics Integration

Track user progress across both systems:

```sql
-- User engagement view
CREATE OR REPLACE VIEW v_user_engagement AS
SELECT
  session_id,
  SUM(CASE WHEN page_type = 'topic' THEN 1 ELSE 0 END) as civic_topics_viewed,
  SUM(CASE WHEN page_type = 'politician' THEN 1 ELSE 0 END) as politicians_viewed,
  SUM(CASE WHEN page_type = 'post' THEN 1 ELSE 0 END) as blog_posts_viewed,
  COUNT(*) as total_page_views
FROM page_views
GROUP BY session_id;
```

## Environment Variables

Add these to your `.env` file:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=!1754Swm.
DB_NAME=rada_ke

# Server
PORT=3000
JWT_SECRET=your-super-secret-jwt-key

# Email (for newsletter)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Testing the Integration

### 1. Test Database Connection

```bash
node -e "const mysql = require('mysql2'); const conn = mysql.createConnection({host:'localhost',user:'root',password:'!1754Swm.',database:'rada_ke'}); conn.connect(err => {if(err) console.error(err); else console.log('Connected!'); conn.end();});"
```

### 2. Test API Endpoints

```bash
# Test politicians endpoint
curl http://localhost:3000/api/polihub/politicians

# Test civic topics
curl http://localhost:3000/api/polihub/civic-topics

# Test search
curl "http://localhost:3000/api/polihub/search?q=healthcare&type=all"
```

### 3. Test Frontend Integration

1. Update PoliHub to use API
2. Verify data loads correctly
3. Test search and filtering
4. Test comment submission
5. Test newsletter subscription

## Next Steps

1. **Populate Database** - Add sample politicians, topics, and blog posts
2. **Update Frontend** - Switch from static data to API calls
3. **Add Authentication** - Implement admin login for content management
4. **Create Admin Panel** - Build UI for managing politicians, topics, and blog posts
5. **Deploy** - Set up production database and server

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env` file
- Ensure database exists: `CREATE DATABASE IF NOT EXISTS rada_ke;`

### API Not Responding
- Check server is running on correct port
- Verify routes are registered in `server.js`
- Check for CORS issues in browser console

### Data Not Showing
- Verify database has data: `SELECT COUNT(*) FROM politicians;`
- Check API response in Network tab
- Verify frontend is calling correct endpoint

## Support

For issues or questions:
1. Check server logs: `node server.js`
2. Review MySQL error logs
3. Inspect browser console for frontend errors
4. Verify API responses with Postman/curl

---

**Created:** 2025-10-19
**Database:** rada_ke (shared with RadaAppClean)
**Server:** Node.js + Express + MySQL
