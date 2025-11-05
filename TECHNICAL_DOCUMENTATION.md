# 🇰🇪 RadaMtaani - Complete Technical Documentation

**Version:** 1.0.0
**Last Updated:** 2025-11-03
**Platform:** Full-stack Kenyan Politics & Civic Engagement Application

---

## 📑 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Design](#architecture-design)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Frontend Structure](#frontend-structure)
7. [Backend Structure](#backend-structure)
8. [Authentication & Security](#authentication--security)
9. [Customization Guide](#customization-guide)
10. [Scaling Strategies](#scaling-strategies)
11. [Performance Optimization](#performance-optimization)
12. [Troubleshooting](#troubleshooting)

---

## SYSTEM OVERVIEW

### What is RadaMtaani?

RadaMtaani is a full-stack web application designed to empower young Kenyans through accessible political education, politician transparency, and civic engagement.

**Core Features:**
- Politician directory with detailed profiles
- Civic education modules with interactive lessons
- Political discourse blog platform
- Voting records tracking
- Political news aggregation
- Admin dashboard for content management

**Target Users:**
- Primary: Young Kenyan citizens (18-35 years)
- Secondary: Political analysts, educators, journalists
- Admin: Content managers, political researchers

---

## TECHNOLOGY STACK

### Frontend
```
React 18.2.0          - UI framework with hooks
Tailwind CSS 3.x      - Utility-first styling
Lucide Icons          - Icon library
Create React App      - Build tooling
```

### Backend
```
Node.js 18+           - JavaScript runtime
Express.js 4.18.2     - Web framework
MySQL2 3.6.0          - Database driver
CORS                  - Cross-origin support
Body Parser           - Request parsing
```

### Database
```
MySQL 8.0+            - Relational database
InnoDB Engine         - ACID compliance
UTF8MB4 Charset       - Full Unicode support
```

### Development Tools
```
NPM                   - Package management
Git                   - Version control
VS Code               - IDE (recommended)
Postman               - API testing
```

---

## ARCHITECTURE DESIGN

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React SPA (Port 3000)                        │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────┐  │   │
│  │  │  Home  │  │ Politi-│  │ Civic  │  │  Blog    │  │   │
│  │  │  Page  │  │  cians │  │  Ed    │  │  Page    │  │   │
│  │  └────────┘  └────────┘  └────────┘  └──────────┘  │   │
│  │                                                       │   │
│  │              ┌──────────────────┐                    │   │
│  │              │ Admin Dashboard  │                    │   │
│  │              │ (Ctrl+Shift+A)   │                    │   │
│  │              └──────────────────┘                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                        API LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Express.js REST API (Port 5000)                 │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │   │
│  │  │ Politicians│  │  Learning  │  │    Blog      │  │   │
│  │  │  Routes    │  │   Routes   │  │   Routes     │  │   │
│  │  └────────────┘  └────────────┘  └──────────────┘  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │   │
│  │  │   Voting   │  │    News    │  │    Admin     │  │   │
│  │  │  Routes    │  │   Routes   │  │   Routes     │  │   │
│  │  └────────────┘  └────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ MySQL2
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MySQL 8.0 (Port 3306)                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │   │
│  │  │politicians │  │  learning  │  │  blog_posts  │  │   │
│  │  │   Table    │  │  _modules  │  │    Table     │  │   │
│  │  └────────────┘  └────────────┘  └──────────────┘  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │   │
│  │  │   voting   │  │politician  │  │  learning    │  │   │
│  │  │  _records  │  │   _news    │  │  _lessons    │  │   │
│  │  └────────────┘  └────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

**Example: Viewing a Politician Profile**

```
1. User clicks politician card
   ↓
2. React Router updates URL to /politicians/:id
   ↓
3. PoliticiansPage component mounts
   ↓
4. useEffect triggers API call:
   fetch('http://localhost:5000/api/polihub/politicians/:id')
   ↓
5. Express server receives request
   ↓
6. Politics API Routes handler processes request
   ↓
7. MySQL query executed:
   SELECT * FROM politicians WHERE id = ?
   ↓
8. Database returns politician data
   ↓
9. Express sends JSON response:
   { success: true, data: {...} }
   ↓
10. React component updates state with data
    ↓
11. Component re-renders with politician details
    ↓
12. User sees politician profile
```

---

## DATABASE SCHEMA

### Complete Database: `rada_ke`

#### Table: `politicians`
```sql
CREATE TABLE politicians (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  party VARCHAR(100),
  position VARCHAR(100),
  constituency VARCHAR(255),
  county VARCHAR(100),
  region VARCHAR(100),
  age INT,
  education TEXT,
  profile_image_url TEXT,
  bio TEXT,
  achievements TEXT,
  contact_info TEXT,
  social_media JSON,
  political_history TEXT,
  committee_memberships TEXT,
  manifesto TEXT,
  chamber VARCHAR(50),
  party_role VARCHAR(100),
  gender VARCHAR(20),
  years_in_office INT,
  approval_rating DECIMAL(3,1),
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  office_address TEXT,
  status VARCHAR(50) DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_party (party),
  INDEX idx_constituency (constituency),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Sample Data:**
```json
{
  "id": 1,
  "name": "William Ruto",
  "party": "UDA",
  "position": "President",
  "constituency": "N/A",
  "county": "National",
  "bio": "5th President of Kenya...",
  "status": "published"
}
```

#### Table: `learning_modules`
```sql
CREATE TABLE learning_modules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  difficulty VARCHAR(50),
  duration VARCHAR(50),
  status VARCHAR(50) DEFAULT 'published',
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Sample Data:**
```json
{
  "id": 1,
  "title": "Understanding the Constitution",
  "description": "Learn about Kenya's 2010 Constitution",
  "icon": "Book",
  "difficulty": "Beginner",
  "duration": "30 mins",
  "status": "published",
  "order_index": 1
}
```

#### Table: `learning_lessons`
```sql
CREATE TABLE learning_lessons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  module_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  video_url VARCHAR(500),
  order_index INT DEFAULT 0,
  duration VARCHAR(50),
  quiz_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE,
  INDEX idx_module (module_id),
  INDEX idx_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Sample Data:**
```json
{
  "id": 1,
  "module_id": 1,
  "title": "Introduction to the Constitution",
  "content": "The 2010 Constitution of Kenya...",
  "quiz_data": {
    "questions": [
      {
        "question": "When was the current constitution adopted?",
        "options": ["2008", "2010", "2013", "2017"],
        "correct": 1
      }
    ]
  }
}
```

#### Table: `blog_posts`
```sql
CREATE TABLE blog_posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content LONGTEXT,
  author VARCHAR(255),
  author_bio TEXT,
  author_image VARCHAR(500),
  image_url VARCHAR(500),
  category VARCHAR(100),
  tags JSON,
  status VARCHAR(50) DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  views INT DEFAULT 0,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_featured (featured),
  INDEX idx_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### Table: `voting_records`
```sql
CREATE TABLE voting_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  politician_id INT NOT NULL,
  bill_title VARCHAR(255) NOT NULL,
  bill_number VARCHAR(100),
  vote VARCHAR(50) NOT NULL,
  vote_date DATE,
  bill_category VARCHAR(100),
  bill_description TEXT,
  outcome VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE,
  INDEX idx_politician (politician_id),
  INDEX idx_date (vote_date),
  INDEX idx_category (bill_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### Table: `politician_news`
```sql
CREATE TABLE politician_news (
  id INT PRIMARY KEY AUTO_INCREMENT,
  politician_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content LONGTEXT,
  source VARCHAR(255),
  source_url VARCHAR(500),
  image_url VARCHAR(500),
  published_date TIMESTAMP,
  category VARCHAR(100),
  sentiment VARCHAR(50),
  credibility_score DECIMAL(3,1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE,
  INDEX idx_politician (politician_id),
  INDEX idx_published (published_date),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Database Relationships

```
politicians (1) ──< (N) voting_records
politicians (1) ──< (N) politician_news
learning_modules (1) ──< (N) learning_lessons
```

---

## API DOCUMENTATION

### Base URL
```
Development: http://localhost:5000/api/polihub
Production: https://yourdomain.com/api/polihub
```

### Politicians Endpoints

#### GET /politicians
**Description:** List all politicians with optional filtering

**Query Parameters:**
```
?status=published        - Filter by status (published/draft)
?party=UDA              - Filter by party
?constituency=Nairobi   - Filter by constituency
?limit=10               - Limit results
?offset=0               - Pagination offset
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "William Ruto",
      "party": "UDA",
      "position": "President",
      "profile_image_url": "...",
      "constituency": "N/A",
      "county": "National"
    }
  ],
  "total": 6
}
```

#### GET /politicians/:id
**Description:** Get single politician details with voting records and news

**Response:**
```json
{
  "success": true,
  "data": {
    "politician": {
      "id": 1,
      "name": "William Ruto",
      "bio": "...",
      "achievements": "..."
    },
    "voting_records": [
      {
        "id": 1,
        "bill_title": "Finance Bill 2024",
        "vote": "Yes",
        "vote_date": "2024-06-20"
      }
    ],
    "news": [
      {
        "id": 1,
        "title": "President Opens New Hospital",
        "published_date": "2024-10-15"
      }
    ]
  }
}
```

#### POST /politicians/enhanced
**Description:** Create or update politician (Admin only)

**Request Body:**
```json
{
  "name": "Jane Doe",
  "party": "ODM",
  "position": "Member of Parliament",
  "constituency": "Nairobi Central",
  "county": "Nairobi",
  "bio": "Full biography...",
  "status": "published"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Politician created successfully",
  "data": {
    "id": 7,
    "name": "Jane Doe"
  }
}
```

### Learning Endpoints

#### GET /civic-modules
**Description:** List all learning modules with lessons

**Query Parameters:**
```
?status=published   - Filter by status (default: published)
?status=all         - Get all modules including drafts
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Understanding the Constitution",
      "description": "...",
      "icon": "Book",
      "difficulty": "Beginner",
      "duration": "30 mins",
      "lessons": [
        {
          "id": 1,
          "title": "Introduction",
          "duration": "10 mins",
          "order_index": 1
        }
      ]
    }
  ]
}
```

#### GET /civic-modules/:id
**Description:** Get single module with all lessons

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Understanding the Constitution",
    "lessons": [
      {
        "id": 1,
        "title": "Introduction",
        "content": "Full lesson content...",
        "video_url": "https://youtube.com/...",
        "quiz_data": {
          "questions": [...]
        }
      }
    ]
  }
}
```

#### POST /civic-modules
**Description:** Create new learning module (Admin only)

**Request Body:**
```json
{
  "title": "Electoral Process",
  "description": "Learn how elections work in Kenya",
  "icon": "Vote",
  "difficulty": "Intermediate",
  "duration": "45 mins",
  "status": "published"
}
```

#### POST /civic-modules/:moduleId/lessons
**Description:** Add lesson to module (Admin only)

**Request Body:**
```json
{
  "title": "Voter Registration",
  "content": "Full lesson content here...",
  "video_url": "https://youtube.com/...",
  "duration": "15 mins",
  "quiz_data": {
    "questions": [
      {
        "question": "Who can register to vote?",
        "options": ["Citizens 18+", "All residents", "Citizens 21+"],
        "correct": 0
      }
    ]
  }
}
```

### Blog Endpoints

#### GET /blog
**Description:** List all blog posts

**Query Parameters:**
```
?status=published   - Filter by status
?category=politics  - Filter by category
?featured=true      - Get featured posts only
?limit=10          - Limit results
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Understanding Kenya's Political Landscape",
      "slug": "understanding-kenya-political-landscape",
      "excerpt": "...",
      "author": "John Kamau",
      "image_url": "...",
      "published_at": "2024-10-15",
      "category": "Analysis"
    }
  ]
}
```

#### GET /blog/:slug
**Description:** Get single blog post by slug

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Understanding Kenya's Political Landscape",
    "content": "Full article content...",
    "author": "John Kamau",
    "author_bio": "Political analyst...",
    "tags": ["politics", "kenya", "analysis"],
    "views": 1250
  }
}
```

#### POST /blog
**Description:** Create blog post (Admin only)

**Request Body:**
```json
{
  "title": "New Political Developments",
  "slug": "new-political-developments",
  "excerpt": "Brief summary...",
  "content": "Full article content...",
  "author": "Jane Doe",
  "author_bio": "Senior political reporter",
  "category": "News",
  "tags": ["politics", "news"],
  "status": "published",
  "featured": false
}
```

---

## FRONTEND STRUCTURE

### Folder Organization

```
polihub/
├── public/
│   ├── index.html              # HTML template with Kenyan branding
│   ├── manifest.json           # PWA manifest
│   └── favicon.ico             # Site icon
│
├── src/
│   ├── index.js                # React entry point
│   ├── index.css               # Global styles + Kenyan color scheme
│   ├── App.jsx                 # Main application component
│   │
│   ├── pages/                  # Main page components
│   │   ├── HomePage.jsx        # Landing page
│   │   ├── PoliticiansPage.jsx    # Politicians directory
│   │   ├── CivicEducationPage.jsx # Learning modules
│   │   ├── BlogPage.jsx        # Blog/discourse
│   │   ├── AdminDashboard.jsx  # Admin panel
│   │   └── AdminLogin.jsx      # Admin login
│   │
│   ├── components/             # Reusable components
│   │   ├── Header.jsx          # Site navigation
│   │   ├── Footer.jsx          # Site footer
│   │   └── admin/              # Admin-specific components
│   │       ├── PoliticianForm.jsx
│   │       ├── ModuleForm.jsx
│   │       ├── LessonForm.jsx
│   │       └── BlogForm.jsx
│   │
│   └── services/               # API integration
│       └── api.js              # API client functions
│
├── package.json                # Dependencies
└── tailwind.config.js          # Tailwind configuration
```

### Key Frontend Files

#### `App.jsx` - Main Application
```javascript
// Purpose: Root component managing routing and page state
// Key Features:
// - Page routing based on currentPage state
// - Admin access via keyboard shortcut
// - Loading states
// - Error boundaries

export default function RadaMtaani() {
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
      {currentPage === 'politicians' && <PoliticiansPage />}
      {currentPage === 'education' && <CivicEducationPage />}
      {currentPage === 'blog' && <BlogPage />}
      {currentPage === 'admin' && <AdminDashboard />}

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
```

#### `Header.jsx` - Navigation Component
```javascript
// Purpose: Site navigation + admin access shortcut
// Location: polihub/src/components/Header.jsx

// Admin Access Keyboard Shortcut
useEffect(() => {
  const handleKeyPress = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      setCurrentPage('admin-login');
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [setCurrentPage]);
```

#### `AdminDashboard.jsx` - Admin Panel
```javascript
// Purpose: Content management interface
// Location: polihub/src/pages/AdminDashboard.jsx
// Key Features:
// - Manage Politicians (CRUD)
// - Manage Learning Modules (CRUD)
// - Manage Lessons (CRUD)
// - Manage Blog Posts (CRUD)
// - Statistics dashboard

// Data Fetching Pattern
useEffect(() => {
  const fetchData = async () => {
    // Fetch politicians
    try {
      const response = await fetch('http://localhost:5000/api/polihub/politicians?status=all');
      const data = await response.json();
      if (data.success) {
        setPoliticians(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching politicians:', error);
    }

    // Fetch modules (includes lessons)
    try {
      const response = await fetch('http://localhost:5000/api/polihub/civic-modules?status=all');
      const data = await response.json();
      if (data.success) {
        setLearningModules(data.data || []);

        // Extract lessons from modules
        const allLessons = [];
        (data.data || []).forEach(module => {
          if (module.lessons && module.lessons.length > 0) {
            module.lessons.forEach(lesson => {
              allLessons.push({
                ...lesson,
                module_id: module.id,
                module_title: module.title
              });
            });
          }
        });
        setLessons(allLessons);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  fetchData();
}, []);
```

### Kenyan Color Scheme Implementation

#### `index.css` - Theme Variables
```css
/* Location: polihub/src/index.css */

:root {
  /* Kenyan color scheme */
  --passion-gradient: linear-gradient(135deg, #FB923C, #F43F5E, #DC2626);
  --accent-cyan: #22D3EE;
  --bg-main: #F8FAFC;
  --bg-card: #FFFFFF;
  --bg-dark: #0F172A;
  --text-primary: #0F172A;
  --text-secondary: #334155;
  --text-muted: #475569;
}

/* Utility Classes */
.passion-gradient {
  background: var(--passion-gradient);
}

.btn-primary {
  background: var(--passion-gradient);
  color: #FFFFFF;
}

.accent-cyan {
  color: var(--accent-cyan);
}
```

**Usage in Components:**
```jsx
// Orange-red gradient button
<button className="px-6 py-3 bg-gradient-to-r from-orange-400 via-red-500 to-red-600 text-white rounded-lg">
  Click Me
</button>

// Cyan accent text
<h2 className="text-2xl font-bold text-cyan-400">
  Featured Content
</h2>
```

---

## BACKEND STRUCTURE

### Server Organization

```
radamtaani/
├── server.js                        # Main server file
├── polihub-integrated-api-routes.js # API routes handler
├── package.json                     # Backend dependencies
└── node_modules/                    # Dependencies
```

### `server.js` - Main Server File
```javascript
// Purpose: Express server initialization
// Port: 5000

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rada_ke',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Mount API routes
const polihubRoutes = require('./polihub-integrated-api-routes');
app.use('/api/polihub', polihubRoutes(pool));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ RadaMtaani server running on port ${PORT}`);
});
```

### API Routes File Structure
```javascript
// polihub-integrated-api-routes.js

module.exports = function(pool) {
  const router = express.Router();

  // Politicians endpoints
  router.get('/politicians', async (req, res) => { ... });
  router.get('/politicians/:id', async (req, res) => { ... });
  router.post('/politicians/enhanced', async (req, res) => { ... });

  // Learning endpoints
  router.get('/civic-modules', async (req, res) => { ... });
  router.get('/civic-modules/:id', async (req, res) => { ... });
  router.post('/civic-modules', async (req, res) => { ... });
  router.post('/civic-modules/:moduleId/lessons', async (req, res) => { ... });

  // Blog endpoints
  router.get('/blog', async (req, res) => { ... });
  router.get('/blog/:slug', async (req, res) => { ... });
  router.post('/blog', async (req, res) => { ... });

  return router;
};
```

### Database Connection Pattern

**Connection Pool Benefits:**
- Reuses connections (better performance)
- Handles concurrent requests
- Automatic reconnection on failure

**Query Pattern:**
```javascript
router.get('/politicians', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM politicians WHERE status = ? ORDER BY name',
      ['published']
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error'
    });
  }
});
```

---

## AUTHENTICATION & SECURITY

### Current Authentication System

**Admin Access Method:**
- Keyboard shortcut: `Ctrl + Shift + A` (Windows/Linux) or `Cmd + Shift + A` (Mac)
- Direct navigation to admin login page
- No visible UI button (stealth access)

**Default Credentials:**
```
Email: admin@radamtaani.ke
Password: admin123
```

⚠️ **CRITICAL:** Change these credentials before production deployment!

### Security Improvements Needed (Production)

#### 1. Add JWT Authentication
```javascript
// Install: npm install jsonwebtoken bcrypt

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Login endpoint
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Verify credentials (check against database)
  const [users] = await pool.query('SELECT * FROM admin_users WHERE email = ?', [email]);

  if (users.length === 0) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const user = users[0];
  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ success: true, token });
});

// Auth middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Protect admin routes
router.post('/politicians/enhanced', authenticateToken, async (req, res) => {
  // Only authenticated admins can access
});
```

#### 2. Add Rate Limiting
```javascript
// Install: npm install express-rate-limit

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

#### 3. Input Validation
```javascript
// Install: npm install express-validator

const { body, validationResult } = require('express-validator');

router.post('/politicians/enhanced',
  [
    body('name').trim().isLength({ min: 2, max: 255 }),
    body('email').optional().isEmail(),
    body('party').trim().isLength({ min: 2, max: 100 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Process valid data
  }
);
```

#### 4. SQL Injection Prevention
```javascript
// ✅ GOOD: Use parameterized queries
const [rows] = await pool.query(
  'SELECT * FROM politicians WHERE id = ?',
  [userId]
);

// ❌ BAD: Never concatenate user input
const [rows] = await pool.query(
  `SELECT * FROM politicians WHERE id = ${userId}` // Vulnerable!
);
```

#### 5. CORS Configuration
```javascript
// Production CORS setup
const corsOptions = {
  origin: 'https://radamtaani.ke', // Your production domain
  optionsSuccessStatus: 200,
  credentials: true
};

app.use(cors(corsOptions));
```

#### 6. Environment Variables
```javascript
// Create .env file (NEVER commit to git!)
DB_HOST=localhost
DB_USER=rada_admin
DB_PASSWORD=secure_random_password_here
DB_NAME=rada_ke
JWT_SECRET=another_secure_random_string
PORT=5000

// Load in server.js
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};
```

---

## CUSTOMIZATION GUIDE

### Changing Colors

**1. Update CSS Variables** (`polihub/src/index.css`)
```css
:root {
  /* Change main gradient */
  --passion-gradient: linear-gradient(135deg, #YOUR_COLOR1, #YOUR_COLOR2, #YOUR_COLOR3);

  /* Change accent color */
  --accent-cyan: #YOUR_ACCENT_COLOR;

  /* Change backgrounds */
  --bg-main: #YOUR_BG_COLOR;
  --bg-card: #YOUR_CARD_COLOR;

  /* Change text colors */
  --text-primary: #YOUR_TEXT_COLOR;
}
```

**2. Update Tailwind Config** (`polihub/tailwind.config.js`)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-orange': '#FB923C',
        'brand-red': '#F43F5E',
        'brand-cyan': '#22D3EE',
      }
    }
  }
}
```

**3. Update Meta Tags** (`polihub/public/index.html`)
```html
<meta name="theme-color" content="#YOUR_PRIMARY_COLOR" />
```

### Adding a New Page

**Step 1:** Create page component
```javascript
// polihub/src/pages/ContactPage.jsx
import React from 'react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      {/* Your content */}
    </div>
  );
}
```

**Step 2:** Import in App.jsx
```javascript
import ContactPage from './pages/ContactPage';
```

**Step 3:** Add route condition
```javascript
export default function RadaMtaani() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div>
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {currentPage === 'home' && <HomePage />}
      {currentPage === 'contact' && <ContactPage />}  {/* New page */}

      <Footer />
    </div>
  );
}
```

**Step 4:** Add to navigation (Header.jsx)
```javascript
const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'contact', label: 'Contact', icon: Mail },  // New item
];
```

### Adding a New API Endpoint

**Step 1:** Add route in `polihub-integrated-api-routes.js`
```javascript
router.get('/your-endpoint', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM your_table');

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error'
    });
  }
});
```

**Step 2:** Call from frontend
```javascript
// In your React component
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/polihub/your-endpoint');
      const data = await response.json();

      if (data.success) {
        setYourState(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  fetchData();
}, []);
```

### Customizing Admin Dashboard

**Add New Admin Form:**
```javascript
// polihub/src/components/admin/YourForm.jsx
import React, { useState } from 'react';

export default function YourForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    field1: '',
    field2: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/polihub/your-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onSubmit(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={formData.field1}
        onChange={(e) => setFormData({...formData, field1: e.target.value})}
        className="w-full px-4 py-2 border rounded-lg"
        placeholder="Field 1"
      />

      <div className="flex gap-2">
        <button type="submit" className="btn-primary px-6 py-2 rounded-lg">
          Save
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-lg">
          Cancel
        </button>
      </div>
    </form>
  );
}
```

---

## SCALING STRATEGIES

### Phase 1: 0-1,000 Users

**Current Setup is Sufficient**

**Optimizations:**
```sql
-- Add database indexes
CREATE INDEX idx_politicians_name ON politicians(name);
CREATE INDEX idx_blog_slug ON blog_posts(slug);
CREATE INDEX idx_modules_status ON learning_modules(status);
```

```javascript
// Enable Gzip compression in server.js
const compression = require('compression');
app.use(compression());
```

### Phase 2: 1,000-10,000 Users

#### Implement Redis Caching

**Install Redis:**
```bash
npm install redis
```

**Setup Redis Client:**
```javascript
// server.js
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Cache middleware
async function cacheMiddleware(req, res, next) {
  const key = `cache:${req.originalUrl}`;

  try {
    const cachedData = await client.get(key);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to cache response
    res.json = (data) => {
      client.setex(key, 300, JSON.stringify(data)); // Cache for 5 minutes
      originalJson(data);
    };

    next();
  } catch (error) {
    next();
  }
}

// Apply to routes
router.get('/politicians', cacheMiddleware, async (req, res) => {
  // Your handler
});
```

#### Use CDN for Static Assets

**Cloudflare Setup:**
1. Sign up for Cloudflare (free tier available)
2. Add your domain
3. Enable caching for static assets
4. Enable automatic minification

**Result:** 50-70% reduction in server load

#### Database Connection Pooling

```javascript
// Increase pool size
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 50,  // Increased from 10
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});
```

### Phase 3: 10,000+ Users

#### Load Balancing with PM2

```bash
# Install PM2
npm install -g pm2

# Start in cluster mode (uses all CPU cores)
pm2 start server.js -i max --name radamtaani

# Save configuration
pm2 save

# Auto-start on reboot
pm2 startup
```

**PM2 Ecosystem File:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'radamtaani',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};

// Start with: pm2 start ecosystem.config.js
```

#### Database Replication (Read/Write Splitting)

**Setup:**
```javascript
// Create read pool (for SELECT queries)
const readPool = mysql.createPool({
  host: process.env.DB_READ_HOST,  // Read replica
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 50
});

// Create write pool (for INSERT/UPDATE/DELETE)
const writePool = mysql.createPool({
  host: process.env.DB_WRITE_HOST,  // Master database
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 20
});

// Use appropriate pool
router.get('/politicians', async (req, res) => {
  const [rows] = await readPool.query('SELECT * FROM politicians');  // Read replica
  res.json({ success: true, data: rows });
});

router.post('/politicians/enhanced', async (req, res) => {
  const [result] = await writePool.query('INSERT INTO politicians ...', [...]);  // Master
  res.json({ success: true, data: result });
});
```

#### Horizontal Scaling with Nginx

**Nginx Load Balancer Config:**
```nginx
upstream radamtaani_backend {
    least_conn;
    server 127.0.0.1:5000 weight=1;
    server 127.0.0.1:5001 weight=1;
    server 127.0.0.1:5002 weight=1;
}

server {
    listen 80;
    server_name radamtaani.ke www.radamtaani.ke;

    location /api {
        proxy_pass http://radamtaani_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /var/www/radamtaani/build;
        try_files $uri /index.html;
    }
}
```

**Start Multiple Node Instances:**
```bash
PORT=5000 node server.js &
PORT=5001 node server.js &
PORT=5002 node server.js &
```

#### Microservices Architecture

**Split by Domain:**
```
radamtaani/
├── services/
│   ├── politicians-service/    # Port 5001
│   │   ├── server.js
│   │   └── routes/
│   ├── learning-service/       # Port 5002
│   │   ├── server.js
│   │   └── routes/
│   ├── blog-service/           # Port 5003
│   │   ├── server.js
│   │   └── routes/
│   └── gateway/                # Port 5000 (API Gateway)
│       └── server.js
```

**API Gateway:**
```javascript
// gateway/server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Route to appropriate service
app.use('/api/polihub/politicians', createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true
}));

app.use('/api/polihub/civic-modules', createProxyMiddleware({
  target: 'http://localhost:5002',
  changeOrigin: true
}));

app.use('/api/polihub/blog', createProxyMiddleware({
  target: 'http://localhost:5003',
  changeOrigin: true
}));

app.listen(5000);
```

---

## PERFORMANCE OPTIMIZATION

### Frontend Optimizations

#### 1. Code Splitting
```javascript
// App.jsx
import React, { lazy, Suspense } from 'react';

// Lazy load pages
const PoliticiansPage = lazy(() => import('./pages/PoliticiansPage'));
const CivicEducationPage = lazy(() => import('./pages/CivicEducationPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));

export default function RadaMtaani() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {currentPage === 'politicians' && <PoliticiansPage />}
      {currentPage === 'education' && <CivicEducationPage />}
      {currentPage === 'blog' && <BlogPage />}
    </Suspense>
  );
}
```

#### 2. Image Optimization
```javascript
// Lazy load images
<img
  src={politician.profile_image_url}
  loading="lazy"
  alt={politician.name}
/>

// Use WebP format with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="Description" />
</picture>
```

#### 3. React Memoization
```javascript
import React, { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
const PoliticianCard = memo(({ politician }) => {
  return (
    <div className="card">
      <h3>{politician.name}</h3>
      <p>{politician.party}</p>
    </div>
  );
});

// Memoize expensive calculations
const sortedPoliticians = useMemo(() => {
  return politicians.sort((a, b) => a.name.localeCompare(b.name));
}, [politicians]);

// Memoize callbacks
const handleClick = useCallback(() => {
  setCurrentPage('politicians');
}, []);
```

#### 4. Virtual Scrolling for Long Lists
```bash
npm install react-window
```

```javascript
import { FixedSizeList } from 'react-window';

function PoliticiansList({ politicians }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <PoliticianCard politician={politicians[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={politicians.length}
      itemSize={150}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### Backend Optimizations

#### 1. Database Query Optimization
```sql
-- Add compound indexes for common queries
CREATE INDEX idx_politician_party_status ON politicians(party, status);
CREATE INDEX idx_blog_category_published ON blog_posts(category, published_at);

-- Analyze slow queries
EXPLAIN SELECT * FROM politicians WHERE party = 'UDA' AND status = 'published';

-- Add covering indexes
CREATE INDEX idx_politician_list ON politicians(id, name, party, position, profile_image_url, status);
```

#### 2. Response Compression
```javascript
// server.js
const compression = require('compression');

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6  // Compression level (1-9)
}));
```

#### 3. Database Connection Optimization
```javascript
// Prepare statements for repeated queries
const getPoliticianStmt = await pool.prepare(
  'SELECT * FROM politicians WHERE id = ?'
);

router.get('/politicians/:id', async (req, res) => {
  const [rows] = await getPoliticianStmt.execute([req.params.id]);
  res.json({ success: true, data: rows[0] });
});
```

#### 4. Pagination
```javascript
router.get('/politicians', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    'SELECT * FROM politicians LIMIT ? OFFSET ?',
    [limit, offset]
  );

  const [countResult] = await pool.query(
    'SELECT COUNT(*) as total FROM politicians'
  );

  res.json({
    success: true,
    data: rows,
    pagination: {
      page,
      limit,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    }
  });
});
```

#### 5. API Response Caching Headers
```javascript
router.get('/politicians', async (req, res) => {
  // Cache for 5 minutes
  res.set('Cache-Control', 'public, max-age=300');

  const [rows] = await pool.query('SELECT * FROM politicians');
  res.json({ success: true, data: rows });
});

// Dynamic content - no cache
router.get('/politicians/:id', async (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  // ...
});
```

### Build Optimizations

#### Production Build
```json
// package.json
{
  "scripts": {
    "build": "react-scripts build",
    "build:analyze": "npm run build && source-map-explorer 'build/static/js/*.js'"
  }
}
```

```bash
# Analyze bundle size
npm install -g source-map-explorer
npm run build:analyze
```

#### Webpack Configuration
```javascript
// craco.config.js (if using CRACO)
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Enable minification
      webpackConfig.optimization.minimize = true;

      // Split vendor chunks
      webpackConfig.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10
          }
        }
      };

      return webpackConfig;
    }
  }
};
```

---

## TROUBLESHOOTING

### Common Issues

#### Issue 1: "Cannot connect to database"

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions:**
1. Check MySQL is running:
   ```bash
   # Windows
   net start MySQL80

   # Linux/Mac
   sudo systemctl start mysql
   ```

2. Verify credentials in server.js:
   ```javascript
   const pool = mysql.createPool({
     host: 'localhost',
     user: 'root',
     password: 'your_password',  // Check this
     database: 'rada_ke'  // Check database name
   });
   ```

3. Test connection:
   ```bash
   mysql -u root -p
   USE rada_ke;
   SHOW TABLES;
   ```

#### Issue 2: "Politicians not showing in admin dashboard"

**Symptoms:**
- Console shows: `Politicians API Response: {success: true, data: Array(6)}`
- But display shows: `rendering politicians: []`

**Solution:**
Check AdminDashboard.jsx state management:
```javascript
// Ensure state is set correctly
const [politicians, setPoliticians] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/polihub/politicians?status=all');
      const data = await response.json();

      console.log('API Response:', data);

      if (data.success && Array.isArray(data.data)) {
        setPoliticians(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  fetchData();
}, []);
```

#### Issue 3: "CORS Error"

**Symptoms:**
```
Access to fetch at 'http://localhost:5000/api/polihub/politicians' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
Add CORS middleware in server.js:
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000',  // Frontend URL
  credentials: true
}));
```

#### Issue 4: "Port already in use"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
1. Find and kill process using port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <process_id> /F

   # Linux/Mac
   lsof -i :5000
   kill -9 <process_id>
   ```

2. Use different port:
   ```javascript
   const PORT = process.env.PORT || 5001;
   ```

#### Issue 5: "Cannot access admin (Ctrl+Shift+A not working)"

**Solutions:**
1. Check keyboard shortcut in Header.jsx:
   ```javascript
   useEffect(() => {
     const handleKeyPress = (e) => {
       if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
         e.preventDefault();
         setCurrentPage('admin-login');
       }
     };
     window.addEventListener('keydown', handleKeyPress);
     return () => window.removeEventListener('keydown', handleKeyPress);
   }, [setCurrentPage]);
   ```

2. Direct navigation alternative:
   ```javascript
   // Manually set currentPage
   setCurrentPage('admin-login');
   ```

#### Issue 6: "Changes not visible after deployment"

**Symptoms:**
- Made changes but website shows old version

**Solutions:**
1. Hard refresh browser:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. Clear React build cache:
   ```bash
   # Delete cache
   rm -rf node_modules/.cache

   # Rebuild
   npm run build
   ```

3. Clear service worker (if using PWA):
   ```javascript
   // In browser console
   navigator.serviceWorker.getRegistrations()
     .then(registrations => {
       for(let registration of registrations) {
         registration.unregister();
       }
     });
   ```

#### Issue 7: "Slow API responses"

**Diagnostics:**
```javascript
// Add timing to API routes
router.get('/politicians', async (req, res) => {
  const startTime = Date.now();

  const [rows] = await pool.query('SELECT * FROM politicians');

  const duration = Date.now() - startTime;
  console.log(`Query took ${duration}ms`);

  res.json({ success: true, data: rows, _queryTime: duration });
});
```

**Solutions:**
1. Add database indexes (see Performance Optimization)
2. Implement caching
3. Reduce data payload:
   ```javascript
   // Don't send unnecessary fields
   SELECT id, name, party, position FROM politicians
   // Instead of SELECT *
   ```

#### Issue 8: "Memory leaks in React"

**Symptoms:**
- Browser becomes slow over time
- High memory usage

**Solutions:**
1. Clean up event listeners:
   ```javascript
   useEffect(() => {
     const handleResize = () => { /* ... */ };
     window.addEventListener('resize', handleResize);

     return () => {
       window.removeEventListener('resize', handleResize);
     };
   }, []);
   ```

2. Cancel ongoing fetch requests:
   ```javascript
   useEffect(() => {
     const abortController = new AbortController();

     fetch('http://localhost:5000/api/polihub/politicians', {
       signal: abortController.signal
     }).then(/* ... */);

     return () => {
       abortController.abort();
     };
   }, []);
   ```

### Debugging Tools

#### Backend Debugging
```javascript
// Add detailed logging
const morgan = require('morgan');

// Custom logging format
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});
```

#### Frontend Debugging
```javascript
// React DevTools
// Install: https://chrome.google.com/webstore/detail/react-developer-tools

// Log component renders
useEffect(() => {
  console.log('PoliticiansPage rendered');
  console.log('Politicians data:', politicians);
});

// Performance monitoring
console.time('Politicians Fetch');
fetch('http://localhost:5000/api/polihub/politicians')
  .then(/* ... */)
  .finally(() => {
    console.timeEnd('Politicians Fetch');
  });
```

---

## PRODUCTION DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] Change admin password from `admin123`
- [ ] Set up environment variables (`.env` file)
- [ ] Add database indexes
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Add rate limiting
- [ ] Implement JWT authentication
- [ ] Add input validation
- [ ] Remove console.log statements
- [ ] Test all API endpoints
- [ ] Test all admin forms
- [ ] Verify mobile responsiveness
- [ ] Test Ctrl+Shift+A admin access
- [ ] Backup database
- [ ] Create database migration scripts
- [ ] Set up error logging (Sentry, etc.)
- [ ] Configure monitoring (UptimeRobot)
- [ ] Add Google Analytics
- [ ] Test email notifications (if applicable)
- [ ] Review and update README
- [ ] Document API for future developers

### Build Process

```bash
# 1. Update API URL for production
# Edit polihub/src/services/api.js
const API_BASE_URL = 'https://api.radamtaani.ke/api/polihub';

# 2. Build frontend
cd polihub
npm run build

# 3. Test production build locally
npx serve -s build

# 4. Deploy frontend to Vercel/Netlify
vercel --prod

# 5. Deploy backend to Railway/Heroku
git push heroku master

# 6. Run database migrations on production
mysql -h production-host -u user -p rada_ke < migrations.sql

# 7. Verify deployment
curl https://api.radamtaani.ke/api/polihub/politicians

# 8. Monitor logs
pm2 logs radamtaani
```

### Post-Deployment

- [ ] Test website on multiple devices
- [ ] Test admin dashboard
- [ ] Verify all API endpoints
- [ ] Check SSL certificate
- [ ] Verify database backups are running
- [ ] Set up automated backups
- [ ] Configure CDN caching
- [ ] Test performance (Google PageSpeed)
- [ ] Monitor error logs
- [ ] Set up alerts for downtime
- [ ] Create maintenance documentation
- [ ] Train content administrators
- [ ] Announce launch

---

## MAINTENANCE & UPDATES

### Daily Tasks
- Check error logs for issues
- Monitor server uptime
- Verify database backups completed

### Weekly Tasks
- Review user activity
- Check for security updates
- Update politician information
- Publish new blog posts

### Monthly Tasks
- Update dependencies:
  ```bash
  npm update
  cd polihub && npm update
  ```
- Review performance metrics
- Optimize slow database queries
- Add new learning modules
- Database maintenance:
  ```sql
  OPTIMIZE TABLE politicians;
  OPTIMIZE TABLE blog_posts;
  ANALYZE TABLE politicians;
  ```

### Quarterly Tasks
- Security audit
- Performance audit
- User feedback review
- Feature planning
- Backup testing (restore from backup)
- Review and update documentation

---

## SUPPORT & RESOURCES

### Documentation
- React: https://react.dev/
- Express.js: https://expressjs.com/
- MySQL: https://dev.mysql.com/doc/
- Tailwind CSS: https://tailwindcss.com/docs

### Tools
- PM2: https://pm2.keymetrics.io/
- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app/

### Contact
- Website: https://radamtaani.ke
- Email: support@radamtaani.ke
- GitHub: [Your repository URL]

---

**Built with ❤️ for Kenya** 🇰🇪

**RadaMtaani v1.0.0** - Empowering young Kenyans through accessible political education and civic engagement.
