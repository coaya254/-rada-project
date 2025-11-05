# ⚡ Quick Deployment Steps - PoliHub to cPanel

## 🎯 Fast Track Guide (15 Minutes)

### BEFORE YOU START
1. **Get your MySQL password** for user: `coayaorg_rada`
2. **Edit `.env.cpanel`** and add the password
3. **Have FTP/cPanel File Manager ready**

---

## Step 1️⃣: Database Setup (5 mins)
1. Login to **cPanel → phpMyAdmin**
2. Select database: `coayaorg_rada`
3. Import your database tables or run migration scripts
4. Verify tables exist

## Step 2️⃣: Upload Files (5 mins)

### Upload to Application Root: `/home/username/radamtaani/`
```
✅ server.js
✅ package.json
✅ .env (renamed from .env.cpanel - ADD YOUR PASSWORD!)
✅ All *-api-routes.js files
✅ polihub/ folder (entire directory)
```

### Upload to Public HTML: `/home/username/public_html/`
```
✅ All contents from polihub/build/
   - index.html
   - static/ folder
   - favicon.ico
   - etc.
✅ .htaccess
```

## Step 3️⃣: Setup Node.js App (3 mins)
1. **cPanel → Setup Node.js App**
2. Click **Create Application**
   - App root: `/home/username/radamtaani`
   - App URL: `https://www.radamtaani.co.ke`
   - Startup file: `server.js`
   - Port: `3000`
3. Click **Create**

## Step 4️⃣: Install & Start (2 mins)
1. In Node.js App Manager, copy the command shown
2. Run in **Terminal**:
   ```bash
   source /path/to/activate
   npm install
   ```
3. Click **Start App** in cPanel

## Step 5️⃣: Test! ✅
Visit: **https://www.radamtaani.co.ke**

Test APIs:
- `/api/polihub/politicians`
- `/api/polihub/civic-topics`
- `/api/polihub/blog-posts`

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **App won't start** | Check .env has DB password, run `npm install` |
| **Database error** | Verify password in .env, check tables exist |
| **404 on pages** | Ensure .htaccess in public_html/ |
| **Blank page** | Check build files in public_html/, clear cache |
| **API errors** | Restart app in cPanel, check logs |

---

## 📋 Critical Files Checklist

**Must Have in App Root:**
- [x] .env (with DB_PASSWORD filled in!)
- [x] server.js
- [x] package.json
- [x] polihub-integrated-api-routes.js

**Must Have in public_html:**
- [x] index.html (from polihub/build/)
- [x] .htaccess
- [x] static/ folder

---

## 🔥 One-Command Deploy Script

If you have SSH access:

```bash
cd /home/username/radamtaani
source /path/to/nodevenv/activate
npm install
pm2 restart server.js --name polihub
```

---

**Need detailed help?** See `CPANEL_DEPLOYMENT_GUIDE.md`

**Database password:** Update in `.env.cpanel` then rename to `.env`

**Built:** 2025-11-03
