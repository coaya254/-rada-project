# 🚀 START HERE - PoliHub Deployment to cPanel

**Domain:** www.radamtaani.co.ke
**Database:** coayaorg_rada (username AND database name)
**Status:** ✅ Ready for deployment
**Date:** 2025-11-03

---

## ⚡ FASTEST PATH TO DEPLOYMENT

### 🎯 3-Minute Overview

1. **Add your database password** to `.env.cpanel`
2. **Upload files** to cPanel (see file list below)
3. **Setup Node.js app** in cPanel
4. **Start the app** and test!

**That's it!** Full details in the guides below.

---

## 📚 Which Guide Should You Use?

| If you want... | Read this file |
|----------------|----------------|
| **Quick deployment** (15 min) | `QUICK_DEPLOYMENT_STEPS.md` ⭐ |
| **Complete detailed guide** | `CPANEL_DEPLOYMENT_GUIDE.md` |
| **Step-by-step checklist** | `DEPLOYMENT_CHECKLIST.md` |
| **File upload reference** | `FILES_TO_UPLOAD.txt` |
| **Summary & overview** | `DEPLOYMENT_SUMMARY.md` |

**👉 RECOMMENDED: Start with `QUICK_DEPLOYMENT_STEPS.md`**

---

## ⚠️ CRITICAL: Do This FIRST!

### Add Your Database Password

1. Open file: **`.env.cpanel`**
2. Find this line:
   ```
   DB_PASSWORD=YOUR_CPANEL_MYSQL_PASSWORD_HERE
   ```
3. Replace with your actual MySQL password
4. Save the file

**✅ Done? Continue below!**

---

## 📦 What Files Were Created For You?

### ✅ Ready to Deploy
- ✅ **polihub/build/** - React app built and optimized
- ✅ **.env.cpanel** - Environment config (ADD PASSWORD!)
- ✅ **.htaccess** - Web server routing
- ✅ **package.cpanel.json** - Node.js dependencies for v10

### 📖 Deployment Guides (Choose ONE)
- **QUICK_DEPLOYMENT_STEPS.md** - 15-minute fast track ⭐
- **CPANEL_DEPLOYMENT_GUIDE.md** - Complete detailed guide
- **DEPLOYMENT_CHECKLIST.md** - Interactive checklist
- **FILES_TO_UPLOAD.txt** - File upload reference
- **DEPLOYMENT_SUMMARY.md** - Overview & summary

### 🔧 Optional Helpers
- **deploy-cpanel.sh** - Auto-deployment script (if you have SSH)

---

## 🗂️ Quick File Upload Reference

### → Upload to: `/home/username/radamtaani/` (App Root)

**Essential Files:**
```
✅ .env (renamed from .env.cpanel with password added)
✅ server.js
✅ package.json (rename from package.cpanel.json)
✅ package-lock.json
✅ polihub-integrated-api-routes.js
✅ All other *-api-routes.js files (22 total)
✅ polihub/ folder (complete directory)
```

### → Upload to: `/home/username/public_html/` (Web Root)

**From polihub/build/:**
```
✅ index.html
✅ manifest.json
✅ asset-manifest.json
✅ service-worker.js
✅ static/ folder (complete with all contents)
✅ .htaccess (from root directory, not polihub/build)
```

---

## 🎯 The 5-Step Deployment Process

### Step 1: Prepare .env File
```bash
1. Edit .env.cpanel
2. Add your database password
3. Save file
```

### Step 2: Upload Files
```bash
1. Login to cPanel File Manager (or use FTP)
2. Upload to /home/username/radamtaani/ (app files)
3. Upload to /home/username/public_html/ (build files)
4. Rename .env.cpanel to .env
5. Rename package.cpanel.json to package.json
```

### Step 3: Setup Node.js App in cPanel
```bash
1. cPanel → "Setup Node.js App"
2. Click "Create Application"
3. Configure:
   - App root: /home/username/radamtaani
   - Startup file: server.js
   - Port: 3000
4. Click "Create"
```

### Step 4: Install Dependencies
```bash
1. Copy the command shown by cPanel
2. Run in Terminal:
   source /path/to/activate
   npm install
3. Wait for installation to complete
```

### Step 5: Start & Test
```bash
1. Click "Start App" in cPanel
2. Visit: https://www.radamtaani.co.ke
3. Test APIs:
   /api/polihub/politicians
   /api/polihub/civic-topics
   /api/polihub/blog-posts
```

**✅ If it loads, you're LIVE! 🎉**

---

## 🗄️ Database Setup

### Before Deployment - Ensure Tables Exist

Login to **phpMyAdmin** and verify these tables in `coayaorg_rada` database:

**Required for PoliHub:**
- politicians
- civic_topics
- blog_posts
- blog_authors
- politician_news
- voting_records
- sources
- quick_links
- about_page

**If tables don't exist:**
1. Run your SQL migration scripts
2. Or manually create tables using phpMyAdmin
3. Add sample data (optional but recommended)

---

## ✅ Quick Test Checklist

After deployment, verify:

- [ ] https://www.radamtaani.co.ke loads
- [ ] No errors in browser console (F12)
- [ ] Politicians page shows data
- [ ] Civic Education page works
- [ ] Blog page displays posts
- [ ] Navigation works
- [ ] API endpoints return JSON:
  - [ ] `/api/polihub/politicians`
  - [ ] `/api/polihub/civic-topics`
  - [ ] `/api/polihub/blog-posts`

**All checked?** You're successfully deployed! 🚀

---

## 🆘 Quick Troubleshooting

### Problem: App Won't Start
**Solution:**
- Check .env file has database password
- Run `npm install` in app directory
- Check cPanel logs for errors

### Problem: Database Connection Failed
**Solution:**
- Verify password in .env
- Test: `mysql -u coayaorg_rada -p`
- Ensure database name is exactly `coayaorg_rada`

### Problem: Blank Page / 404 Errors
**Solution:**
- Ensure .htaccess in public_html/
- Check build files uploaded correctly
- Clear browser cache
- Try incognito mode

### Problem: API Returns Empty Arrays
**Solution:**
- Check database tables exist
- Verify tables have data
- Test queries in phpMyAdmin
- Check API routes are loaded

**Need more help?** See `CPANEL_DEPLOYMENT_GUIDE.md` Section 7

---

## 📊 Your Deployment Architecture

```
🌐 www.radamtaani.co.ke
    │
    ├─── 👁️ Frontend (React)
    │    └─ public_html/
    │       ├─ index.html
    │       ├─ static/ (CSS, JS)
    │       └─ .htaccess
    │
    ├─── ⚙️ Backend (Node.js)
    │    └─ radamtaani/
    │       ├─ server.js
    │       ├─ .env
    │       ├─ API routes (22 files)
    │       └─ polihub/
    │
    └─── 💾 Database (MySQL)
         └─ coayaorg_rada
            ├─ politicians
            ├─ civic_topics
            ├─ blog_posts
            └─ ... more tables
```

---

## 🎓 What PoliHub Includes

**Frontend Features:**
- 🏛️ Politicians Directory (searchable/filterable)
- 📚 Civic Education Modules
- 📝 Political Blog
- ℹ️ About Page
- 📱 Fully Responsive Design

**Backend APIs:**
- Politicians CRUD
- Civic Topics Management
- Blog Posts Management
- Voting Records
- News Integration
- Admin Functions
- Community Features

---

## 🔐 Security Checklist

After deployment:

- [ ] .env file has permissions 600 (secure)
- [ ] HTTPS is enabled (SSL certificate)
- [ ] Database password is strong
- [ ] JWT_SECRET is unique
- [ ] No credentials in browser console
- [ ] CORS properly configured

---

## 📱 Post-Deployment

### Must Do:
1. ✅ Test all pages and features
2. ✅ Check application logs in cPanel
3. ✅ Monitor resource usage
4. ✅ Set up automatic backups

### Nice to Have:
- Configure Google Analytics
- Set up error monitoring (Sentry)
- Add uptime monitoring
- Optimize images
- Configure CDN (optional)

---

## 💡 Pro Tips

1. **Keep .env secure** - Never commit to git
2. **Monitor logs daily** - First week especially
3. **Backup before updates** - Save database and files
4. **Test in incognito** - Avoids cache issues
5. **Document changes** - Keep deployment notes

---

## 📞 Getting Help

### Your Deployment Guides
1. **Quick Guide** → `QUICK_DEPLOYMENT_STEPS.md`
2. **Full Guide** → `CPANEL_DEPLOYMENT_GUIDE.md`
3. **Checklist** → `DEPLOYMENT_CHECKLIST.md`
4. **Files** → `FILES_TO_UPLOAD.txt`
5. **Summary** → `DEPLOYMENT_SUMMARY.md`

### External Resources
- [cPanel Node.js Docs](https://docs.cpanel.net/cpanel/software/setup-nodejs-app/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
- Your hosting provider support

---

## ✨ Final Reminders

**Before you start:**
1. ✅ Database password ready
2. ✅ cPanel login credentials ready
3. ✅ All files downloaded/accessible
4. ✅ 30 minutes of focused time

**Which guide to follow:**
- **Speed** → `QUICK_DEPLOYMENT_STEPS.md` (15 min)
- **Detail** → `CPANEL_DEPLOYMENT_GUIDE.md` (30 min)
- **Checklist** → `DEPLOYMENT_CHECKLIST.md` (step-by-step)

**After deployment:**
- Test thoroughly
- Monitor for 24-48 hours
- Set up backups
- Document any issues

---

## 🎉 Ready to Deploy?

**Your website will be live at:**
### https://www.radamtaani.co.ke

**Choose your guide and start deploying!**

👉 **Recommended:** Open `QUICK_DEPLOYMENT_STEPS.md` now

---

## 📋 Quick Command Reference

```bash
# Activate Node.js environment
source /path/to/nodevenv/activate

# Install dependencies
cd /home/username/radamtaani
npm install

# Test database connection
mysql -u coayaorg_rada -p coayaorg_rada

# Check Node.js version
node --version

# View app logs (if using pm2)
pm2 logs polihub
```

---

**Everything is ready. Good luck! 🚀**

---

*Generated: 2025-11-03*
*Platform: cPanel with Node.js 10.24.1*
*Database: MySQL (coayaorg_rada)*
*Status: READY FOR DEPLOYMENT ✅*

**Need help?** Read `QUICK_DEPLOYMENT_STEPS.md` first!
