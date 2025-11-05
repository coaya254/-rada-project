# 🚀 PoliHub cPanel Deployment Guide

## Domain: www.radamtaani.co.ke
## Database: coayaorg_rada
## Generated: 2025-11-03

---

## 📋 Pre-Deployment Checklist

✅ cPanel access with Node.js support
✅ MySQL database created: `coayaorg_rada`
✅ Database user created: `coayaorg_rada`
✅ Node.js version: 10.24.1 (verify compatibility)
✅ Domain pointed to cPanel hosting
✅ SSL certificate installed (for HTTPS)

---

## 🗄️ STEP 1: Database Setup

### 1.1 Create Database Tables

Login to **phpMyAdmin** in cPanel and run the SQL scripts to create all necessary tables:

```bash
# You'll need to run your existing database migration scripts
# These should be in your project as .sql files or migration scripts
```

**Important Tables Needed:**
- `politicians`
- `politician_documents`
- `politician_news`
- `voting_records`
- `civic_topics`
- `blog_posts`
- `blog_authors`
- `news_articles`
- `sources`
- `quick_links`
- `about_page`
- `users`
- And all other tables referenced in your API routes

### 1.2 Update Database Password

Edit `.env.cpanel` file and add your database password:

```env
DB_PASSWORD=YOUR_ACTUAL_CPANEL_MYSQL_PASSWORD
```

---

## 📦 STEP 2: File Upload to cPanel

### 2.1 Files to Upload

Using **cPanel File Manager** or **FTP** (FileZilla recommended), upload these files:

#### Root Directory (`/home/username/radamtaani/` or similar):

**Backend Files:**
- `server.js` ⭐
- `package.json` ⭐
- `package-lock.json`
- `.env.cpanel` ⭐ (rename to `.env` after upload)
- All API route files:
  - `polihub-integrated-api-routes.js` ⭐
  - `politics-api-routes.js`
  - `admin-api-routes.js`
  - `auth-api-routes.js`
  - `commitment-api-routes.js`
  - `timeline-api-routes.js`
  - `voting-api-routes.js`
  - `document-api-routes.js`
  - `news-api-routes.js`
  - `analytics-api-routes.js`
  - `reports-api-routes.js`
  - `admin-users-api-routes.js`
  - `system-api-routes.js`
  - `integrity-api-routes.js`
  - `audit-log-api-routes.js`
  - `learning-admin-api-routes.js`
  - `learning-user-api-routes.js`
  - `quick-links-api-routes.js`
  - `learning-advanced-features.js`
  - `daily-challenges-admin-api-routes.js`
  - `challenges-admin-api-routes.js`
  - `community-api-routes.js`
  - `content_api_routes_new.js`
  - `enhanced_auth_middleware.js`
  - `enhanced_api_routes.js`

**Frontend Files (PoliHub Build):**
- Upload entire `polihub/build/` directory contents

#### Public HTML Directory (`/home/username/public_html/`):

Upload ALL contents from `polihub/build/` to `public_html/`:
- `index.html` ⭐
- `favicon.ico`
- `manifest.json`
- `robots.txt`
- `/static/` folder (contains all CSS and JS)
- Any other build artifacts

### 2.2 Upload .htaccess

Upload `.htaccess` file to `/home/username/public_html/`

---

## ⚙️ STEP 3: Configure Node.js Application in cPanel

### 3.1 Setup Node.js App

1. Login to **cPanel**
2. Go to **"Setup Node.js App"** or **"Application Manager"**
3. Click **"Create Application"**

**Configuration:**
- **Node.js version:** 10.24.1 (or highest available)
- **Application mode:** Production
- **Application root:** `/home/username/radamtaani` (or your actual path)
- **Application URL:** https://www.radamtaani.co.ke
- **Application startup file:** `server.js`
- **Port:** 3000 (or as specified in .env)

4. Click **"Create"**

### 3.2 Install Dependencies

After creating the app, cPanel will show a command to enter the virtual environment:

```bash
source /home/username/nodevenv/radamtaani/10.24.1/bin/activate && cd /home/username/radamtaani
```

Then install dependencies:

```bash
npm install
```

**Note:** If npm install fails due to Node.js 10.24.1 compatibility issues, you may need to:
- Request hosting provider to upgrade Node.js to v14+ or v16+
- Or modify package.json to use compatible versions

### 3.3 Start the Application

In cPanel Node.js App Manager:
1. Click **"Stop App"** (if running)
2. Click **"Start App"**
3. Check status - should show "Running"

---

## 🔧 STEP 4: Configure Environment Variables

### Option A: Using cPanel Interface

In Node.js App Manager:
1. Click **"Edit"** on your application
2. Scroll to **"Environment Variables"**
3. Add these variables:

```
DB_HOST=localhost
DB_USER=coayaorg_rada
DB_PASSWORD=[your_mysql_password]
DB_NAME=coayaorg_rada
DB_PORT=3306
PORT=3000
NODE_ENV=production
CLIENT_URL=https://www.radamtaani.co.ke
JWT_SECRET=rada_ke_cpanel_secret_2024_secure_xyz789
MAX_FILE_SIZE=10485760
```

### Option B: Using .env file

Ensure `.env` file is in the application root with correct permissions:

```bash
chmod 600 .env
```

---

## 🌐 STEP 5: Configure Domain & SSL

### 5.1 Point Domain

In cPanel:
1. Go to **"Domains"**
2. Ensure `www.radamtaani.co.ke` points to `public_html`
3. Ensure root domain `radamtaani.co.ke` also points correctly

### 5.2 Install SSL Certificate

1. Go to **"SSL/TLS Status"**
2. Enable AutoSSL or install Let's Encrypt certificate
3. Verify HTTPS works: https://www.radamtaani.co.ke

---

## ✅ STEP 6: Verification & Testing

### 6.1 Test Frontend

Visit: https://www.radamtaani.co.ke

Should load the PoliHub React application.

### 6.2 Test API Endpoints

Test these URLs:

```bash
# PoliHub Politicians API
https://www.radamtaani.co.ke/api/polihub/politicians

# PoliHub Civic Education API
https://www.radamtaani.co.ke/api/polihub/civic-topics

# PoliHub Blog API
https://www.radamtaani.co.ke/api/polihub/blog-posts

# System Health Check
https://www.radamtaani.co.ke/api/system/health
```

### 6.3 Check Logs

In cPanel:
1. Go to Node.js App Manager
2. Click on your app
3. View **"Application Logs"**
4. Check for errors

### 6.4 Common Test Checklist

- [ ] Homepage loads without errors
- [ ] Politicians page displays data
- [ ] Civic education content loads
- [ ] Blog posts are visible
- [ ] API endpoints respond correctly
- [ ] Images load properly
- [ ] No console errors in browser
- [ ] Mobile responsive design works
- [ ] HTTPS certificate is valid

---

## 🐛 STEP 7: Troubleshooting

### Issue: Node.js App Won't Start

**Solution:**
```bash
# SSH into server or use Terminal in cPanel
cd /home/username/radamtaani
node server.js
# Check error messages
```

Common fixes:
- Ensure all dependencies are installed: `npm install`
- Check `.env` file exists and has correct permissions
- Verify database credentials are correct
- Check port 3000 is not already in use

### Issue: Database Connection Failed

**Solution:**
1. Test database connection in phpMyAdmin
2. Verify credentials in `.env` file
3. Check if database user has proper permissions
4. Ensure database name is exactly `coayaorg_rada`

```bash
# Test connection
mysql -u coayaorg_rada -p -h localhost coayaorg_rada
```

### Issue: 404 Errors on Routes

**Solution:**
1. Verify `.htaccess` is in `public_html/`
2. Check if mod_rewrite is enabled
3. Ensure React build files are in `public_html/`
4. Clear browser cache

### Issue: API Returns Empty Data

**Solution:**
1. Check if database tables exist and have data
2. Verify API routes are properly loaded in server.js
3. Check CORS settings in server.js
4. Test database queries directly in phpMyAdmin

### Issue: Static Files Not Loading

**Solution:**
1. Verify build files are in correct location
2. Check file permissions: `chmod 644` for files, `chmod 755` for directories
3. Clear cPanel cache
4. Check browser console for 404 errors

### Issue: Port Already in Use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 [PID]
# Or change PORT in .env file
```

---

## 🔄 STEP 8: Updates & Maintenance

### Updating Frontend

1. Make changes to PoliHub React code locally
2. Run `npm run build` in polihub directory
3. Upload new build files to `public_html/`
4. Clear browser cache
5. Test changes

### Updating Backend

1. Make changes to server.js or API routes
2. Upload modified files via FTP/File Manager
3. In cPanel Node.js App Manager:
   - Click "Restart App"
4. Verify changes in logs
5. Test API endpoints

### Database Migrations

1. Create SQL migration script
2. Run in phpMyAdmin
3. Restart Node.js app if schema changes affect API

---

## 📊 STEP 9: Performance Optimization

### Enable Compression

Already configured in `.htaccess`:
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

### Enable Caching

Configure in server.js:
```javascript
app.use(express.static('polihub/build', {
  maxAge: '1d',
  etag: true
}));
```

### Database Optimization

1. Add indexes to frequently queried columns
2. Use connection pooling (already configured in server.js)
3. Enable MySQL query cache in cPanel

### Monitor Performance

1. Use cPanel Resource Usage monitor
2. Check Node.js App logs regularly
3. Monitor database slow query log
4. Use browser DevTools Network tab

---

## 🔐 STEP 10: Security Checklist

- [ ] SSL certificate installed and working
- [ ] Database password is strong and secure
- [ ] JWT_SECRET is unique and complex
- [ ] File permissions are correct (644 for files, 755 for directories)
- [ ] .env file has restricted permissions (600)
- [ ] Rate limiting is enabled in server.js
- [ ] CORS is properly configured
- [ ] SQL injection protection via prepared statements
- [ ] XSS protection headers enabled
- [ ] Regular backups configured in cPanel

---

## 📝 STEP 11: Backup Strategy

### Automated Backups (cPanel)

1. Go to **"Backup Wizard"**
2. Enable **"Full Account Backup"**
3. Set schedule (daily/weekly recommended)
4. Store backups off-site

### Manual Backups

**Database:**
```bash
# In phpMyAdmin
Export > SQL > Download
```

**Files:**
```bash
# In File Manager
Compress > Download
```

**Node.js App Config:**
- Save copy of .env file
- Save copy of server.js and package.json

---

## 🆘 Support & Resources

### Documentation
- [cPanel Node.js Documentation](https://docs.cpanel.net/cpanel/software/setup-nodejs-app/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Express.js in Production](https://expressjs.com/en/advanced/best-practice-performance.html)

### Quick Commands

```bash
# SSH/Terminal Access
cd /home/username/radamtaani

# Check app status
pm2 status

# View logs
pm2 logs

# Restart app
pm2 restart server

# Install dependencies
npm install

# Check Node version
node --version

# Check npm version
npm --version

# Test database connection
mysql -u coayaorg_rada -p coayaorg_rada
```

### Contact Information

**Hosting Support:** Contact your cPanel hosting provider
**Application Issues:** Check application logs
**Database Issues:** Use phpMyAdmin error logs

---

## ✨ Post-Deployment Success Checklist

After successful deployment:

- [ ] Test all pages on desktop
- [ ] Test all pages on mobile
- [ ] Test all API endpoints
- [ ] Verify database connections
- [ ] Check SSL certificate
- [ ] Test form submissions
- [ ] Verify image uploads work
- [ ] Test user authentication (if applicable)
- [ ] Check error handling
- [ ] Monitor server resources
- [ ] Set up monitoring/alerting
- [ ] Document any custom configurations
- [ ] Train team on update procedures
- [ ] Create backup restore procedures

---

## 🎉 You're Live!

Your PoliHub application should now be running at:
**https://www.radamtaani.co.ke**

**Next Steps:**
1. Monitor logs for first 24-48 hours
2. Test all functionality thoroughly
3. Set up Google Analytics (optional)
4. Configure error monitoring (Sentry, etc.)
5. Plan regular maintenance schedule

---

**Deployment Date:** 2025-11-03
**Version:** 1.0.0
**Platform:** cPanel with Node.js 10.24.1
**Database:** MySQL (coayaorg_rada)

Good luck with your deployment! 🚀
