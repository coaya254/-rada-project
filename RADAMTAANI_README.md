# 🇰🇪 RadaMtaani - Kenyan Politics & Civic Engagement Platform

**RadaMtaani** is a comprehensive full-stack web application empowering young Kenyans through accessible political education, politician transparency, and civic engagement.

---

## 📋 QUICK START

**Running Locally:**
```bash
# 1. Start Backend (Terminal 1)
node server.js

# 2. Start Frontend (Terminal 2)
cd polihub && npm start
```

**Access:**
- Website: http://localhost:3000
- Admin: Press `Ctrl + Shift + A` anywhere on site
- API: http://localhost:5000/api/polihub

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│              RADAMTAANI PLATFORM                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Frontend (React)   →   Backend (Node.js)  →  MySQL │
│    Port: 3000           Port: 5000          Port: 3306│
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend:** React 18, Tailwind CSS, Lucide Icons  
**Backend:** Node.js, Express.js, MySQL2  
**Database:** MySQL 8.x  

---

## 📁 FOLDER STRUCTURE

```
radamtaani/
├── polihub/                    # Frontend (React App)
│   ├── src/
│   │   ├── pages/             # Main pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── Politicians Page.jsx
│   │   │   ├── CivicEducationPage.jsx
│   │   │   ├── BlogPage.jsx
│   │   │   └── AdminDashboard.jsx  # Admin Panel
│   │   ├── components/        # Reusable components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── admin/         # Admin forms
│   │   ├── services/          # API client
│   │   └── index.css          # Kenyan color scheme
│   └── package.json
│
├── server.js                   # Backend server
├── polihub-integrated-api-routes.js  # API routes
└── package.json               # Backend dependencies
```

---

## 🗄️ DATABASE TABLES

**Core Tables:**
- `politicians` - Kenyan politicians directory
- `learning_modules` - Civic education modules  
- `learning_lessons` - Module lessons
- `blog_posts` - Political discourse articles
- `voting_records` - Parliamentary votes
- `politician_news` - Political news articles

---

## 🔌 API ENDPOINTS

**Base:** `http://localhost:5000/api/polihub`

**Politicians:**
- `GET /politicians` - List politicians
- `GET /politicians/:id` - Get details
- `POST /politicians/enhanced` - Create/Update (Admin)

**Learning:**
- `GET /civic-modules` - List modules
- `GET /civic-modules/:id` - Get module + lessons

**Blog:**
- `GET /blog` - List posts
- `GET /blog/:slug` - Get single post
- `POST /blog` - Create post (Admin)

---

## 🎨 KENYAN COLOR SCHEME

```css
/* Orange-Red Gradient */
background: linear-gradient(135deg, #FB923C, #F43F5E, #DC2626);

/* Accent */
color: #22D3EE;
```

---

## 🔐 ADMIN ACCESS

**Method 1: Keyboard Shortcut**  
Press `Ctrl + Shift + A` anywhere on website

**Method 2: Direct Login**  
Navigate to admin login page

**Default Credentials:**  
Email: `admin@radamtaani.ke`  
Password: `admin123`  
⚠️ CHANGE IN PRODUCTION!

---

## 🚀 DEPLOYMENT

### Quick Deploy to Production

**1. Build Frontend:**
```bash
cd polihub
npm run build
```

**2. Deploy Options:**

**Option A: Vercel + Railway**
- Frontend → Vercel (Free)
- Backend → Railway (Free tier available)

**Option B: Single VPS**
- Use PM2 for process management
- Nginx for reverse proxy
- Let's Encrypt for HTTPS

**3. Environment Variables:**
```
DB_HOST=your-mysql-host
DB_USER=your-db-user
DB_PASSWORD=your-password
DB_NAME=rada_ke
```

---

## 📊 SCALING ROADMAP

**Phase 1 (0-1K users):**
- Add database indexes
- Enable Gzip compression

**Phase 2 (1K-10K users):**
- Implement Redis caching
- Use CDN for static assets

**Phase 3 (10K+ users):**
- Load balancing
- Database sharding
- Microservices architecture

---

## ✏️ CUSTOMIZATION GUIDE

**Change Colors:**
Edit `polihub/src/index.css`:
```css
:root {
  --passion-gradient: your-gradient-here;
}
```

**Add New Page:**
1. Create `polihub/src/pages/NewPage.jsx`
2. Import in `App.jsx`
3. Add route condition
4. Add to Header navigation

**Add API Endpoint:**
Edit `polihub-integrated-api-routes.js`:
```javascript
router.get('/api/polihub/your-endpoint', (req, res) => {
  // Your logic
  res.json({ success: true, data: [] });
});
```

---

## 📞 SUPPORT

Website: https://radamtaani.ke  
Email: support@radamtaani.ke

---

**Built with ❤️ for Kenya** 🇰🇪

