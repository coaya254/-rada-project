# ✅ PoliHub Deployment Checklist

## Pre-Deployment Requirements

### Access & Credentials
- [ ] cPanel login credentials available
- [ ] FTP/File Manager access confirmed
- [ ] MySQL database password for `coayaorg_rada` user **obtained**
- [ ] Domain `www.radamtaani.co.ke` points to hosting
- [ ] SSL certificate installed (or AutoSSL enabled)

### Local Preparation
- [ ] PoliHub built successfully (`polihub/build/` exists)
- [ ] All API route files present in root directory
- [ ] `.env.cpanel` edited with correct DB password
- [ ] Reviewed `FILES_TO_UPLOAD.txt`

---

## Phase 1: Database Setup

### In phpMyAdmin (cPanel)
- [ ] Logged into phpMyAdmin
- [ ] Selected database: `coayaorg_rada`
- [ ] Created/verified all required tables exist:
  - [ ] `politicians`
  - [ ] `politician_documents`
  - [ ] `politician_news`
  - [ ] `voting_records`
  - [ ] `civic_topics`
  - [ ] `blog_posts`
  - [ ] `blog_authors`
  - [ ] `news_articles`
  - [ ] `sources`
  - [ ] `quick_links`
  - [ ] `about_page`
  - [ ] `users` (if needed)
  - [ ] Other tables as required
- [ ] Sample data loaded (optional but recommended)
- [ ] Database connection tested

---

## Phase 2: File Upload

### Application Root: `/home/username/radamtaani/`

**Core Files:**
- [ ] `.env` (renamed from `.env.cpanel` with password added)
- [ ] `server.js`
- [ ] `package.json` (use `package.cpanel.json` renamed)
- [ ] `package-lock.json`

**API Route Files (22 files):**
- [ ] `polihub-integrated-api-routes.js` ⭐
- [ ] `politics-api-routes.js`
- [ ] `admin-api-routes.js`
- [ ] `auth-api-routes.js`
- [ ] `commitment-api-routes.js`
- [ ] `timeline-api-routes.js`
- [ ] `voting-api-routes.js`
- [ ] `document-api-routes.js`
- [ ] `news-api-routes.js`
- [ ] `analytics-api-routes.js`
- [ ] `reports-api-routes.js`
- [ ] `admin-users-api-routes.js`
- [ ] `system-api-routes.js`
- [ ] `integrity-api-routes.js`
- [ ] `audit-log-api-routes.js`
- [ ] `learning-admin-api-routes.js`
- [ ] `learning-user-api-routes.js`
- [ ] `quick-links-api-routes.js`
- [ ] `learning-advanced-features.js`
- [ ] `daily-challenges-admin-api-routes.js`
- [ ] `challenges-admin-api-routes.js`
- [ ] `community-api-routes.js`
- [ ] `content_api_routes_new.js`
- [ ] `enhanced_auth_middleware.js`
- [ ] `enhanced_api_routes.js`

**PoliHub Files:**
- [ ] `polihub/package.json`
- [ ] `polihub/package-lock.json`
- [ ] `polihub/build/` (entire directory with subdirectories)

**Optional:**
- [ ] Create `uploads/` directory
- [ ] Create `uploads/profile-pictures/` directory

### Public HTML: `/home/username/public_html/`

**From polihub/build/:**
- [ ] `index.html` ⭐
- [ ] `favicon.ico`
- [ ] `manifest.json`
- [ ] `robots.txt`
- [ ] `asset-manifest.json`
- [ ] `static/` folder (complete with all contents)
  - [ ] `static/css/` folder
  - [ ] `static/js/` folder
  - [ ] `static/media/` folder (if exists)

**Configuration:**
- [ ] `.htaccess` file uploaded to public_html root

---

## Phase 3: cPanel Configuration

### Setup Node.js Application
- [ ] Opened cPanel → "Setup Node.js App"
- [ ] Clicked "Create Application"
- [ ] Configured application:
  - [ ] Node.js version: `10.24.1` (or highest available)
  - [ ] Application mode: `Production`
  - [ ] Application root: `/home/username/radamtaani`
  - [ ] Application URL: `https://www.radamtaani.co.ke`
  - [ ] Application startup file: `server.js`
  - [ ] Port: `3000`
- [ ] Clicked "Create"
- [ ] Application created successfully

### Environment Variables (Optional Method)
If not using .env file, add these in Node.js App Manager:
- [ ] `DB_HOST=localhost`
- [ ] `DB_USER=coayaorg_rada`
- [ ] `DB_PASSWORD=[your_password]`
- [ ] `DB_NAME=coayaorg_rada`
- [ ] `DB_PORT=3306`
- [ ] `PORT=3000`
- [ ] `NODE_ENV=production`
- [ ] `CLIENT_URL=https://www.radamtaani.co.ke`
- [ ] `JWT_SECRET=rada_ke_cpanel_secret_2024_secure_xyz789`

---

## Phase 4: Install Dependencies

### Via cPanel Terminal
- [ ] Copied virtual environment command from Node.js App Manager
- [ ] Executed: `source /path/to/nodevenv/activate`
- [ ] Changed to app directory: `cd /home/username/radamtaani`
- [ ] Ran: `npm install`
- [ ] No errors during installation
- [ ] node_modules folder created
- [ ] PoliHub dependencies installed (auto via postinstall)

---

## Phase 5: Start Application

### In Node.js App Manager
- [ ] Clicked "Start App"
- [ ] Status shows "Running"
- [ ] No errors in application log
- [ ] App is listening on port 3000

---

## Phase 6: Testing & Verification

### Frontend Tests
- [ ] Visit: `https://www.radamtaani.co.ke`
- [ ] Page loads without errors
- [ ] PoliHub homepage displays correctly
- [ ] Navigation works (Politicians, Civic Education, Blog, About)
- [ ] Images load properly
- [ ] Styling is correct
- [ ] No console errors in browser DevTools
- [ ] Mobile view is responsive

### Backend API Tests
Test these endpoints in browser or Postman:

- [ ] `https://www.radamtaani.co.ke/api/polihub/politicians`
  - Returns JSON array of politicians
- [ ] `https://www.radamtaani.co.ke/api/polihub/civic-topics`
  - Returns JSON array of civic topics
- [ ] `https://www.radamtaani.co.ke/api/polihub/blog-posts`
  - Returns JSON array of blog posts
- [ ] `https://www.radamtaani.co.ke/api/system/health`
  - Returns health check status

### Database Tests
- [ ] API endpoints return data (not empty arrays)
- [ ] Politicians page shows politician cards
- [ ] Civic education topics display
- [ ] Blog posts are visible
- [ ] Data matches what's in database

### Security Tests
- [ ] HTTPS works (green padlock)
- [ ] HTTP redirects to HTTPS
- [ ] No sensitive data in console logs
- [ ] .env file is not publicly accessible
- [ ] Database credentials work

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Images optimized and load quickly
- [ ] No memory leaks (check cPanel Resource Usage)

---

## Phase 7: Post-Deployment

### Monitoring
- [ ] Bookmark cPanel Node.js App Manager
- [ ] Check application logs for errors
- [ ] Monitor Resource Usage in cPanel
- [ ] Set up uptime monitoring (optional)

### Documentation
- [ ] Save cPanel credentials securely
- [ ] Document any custom configurations
- [ ] Note any issues encountered and solutions
- [ ] Share access with team if needed

### Backups
- [ ] Configure cPanel automatic backups
- [ ] Download manual backup of database
- [ ] Save copy of .env file (securely)
- [ ] Download backup of uploaded files

### Optimization
- [ ] Enable cPanel mod_deflate (compression)
- [ ] Configure MySQL query cache
- [ ] Set up error logging
- [ ] Add Google Analytics (optional)

---

## Troubleshooting Checks

If something doesn't work, verify:

### App Won't Start
- [ ] .env file exists in app root
- [ ] Database password is correct in .env
- [ ] All dependencies installed (npm install completed)
- [ ] server.js file exists and is not corrupted
- [ ] Port 3000 is not already in use
- [ ] Check application logs in cPanel

### Database Errors
- [ ] Database name is exactly `coayaorg_rada`
- [ ] Username is exactly `coayaorg_rada`
- [ ] Password is correct
- [ ] User has permissions on database
- [ ] Tables exist in database
- [ ] MySQL service is running

### Frontend Not Loading
- [ ] All build files uploaded to public_html/
- [ ] index.html exists in public_html/
- [ ] .htaccess exists in public_html/
- [ ] File permissions correct (644 files, 755 folders)
- [ ] Clear browser cache
- [ ] Try incognito/private browsing

### API Not Working
- [ ] Node.js app is running in cPanel
- [ ] API route files uploaded correctly
- [ ] CORS configured in server.js
- [ ] Database connection successful
- [ ] Check API endpoint URLs are correct

### Routing Issues
- [ ] .htaccess uploaded correctly
- [ ] mod_rewrite enabled in cPanel
- [ ] React routes configured properly
- [ ] No typos in route paths

---

## Success Criteria

**Deployment is successful when:**

✅ All items in this checklist are completed
✅ Website loads at https://www.radamtaani.co.ke
✅ All pages are accessible and functional
✅ API endpoints return correct data
✅ No console errors in browser
✅ No errors in application logs
✅ Mobile view works correctly
✅ HTTPS is enabled and working
✅ Database connection is stable

---

## Maintenance Schedule

### Daily
- [ ] Check application is running
- [ ] Review error logs

### Weekly
- [ ] Review resource usage
- [ ] Check for security updates
- [ ] Verify backups are working

### Monthly
- [ ] Update dependencies (test first!)
- [ ] Review performance metrics
- [ ] Clean up old logs
- [ ] Database optimization

---

## Team Sign-Off

**Deployment Completed By:** _________________
**Date:** _________________
**Verified By:** _________________
**Date:** _________________

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________

---

**🎉 Congratulations on your deployment!**

Website: https://www.radamtaani.co.ke
Admin: [Your admin URL if applicable]
Status: LIVE ✅

---

*Last Updated: 2025-11-03*
*Version: 1.0.0*
*Platform: cPanel with Node.js 10.24.1*
