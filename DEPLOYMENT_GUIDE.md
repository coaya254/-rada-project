# 🚀 RadaMtaani Deployment Guide

## 📦 What You Have Built

✅ Full-stack Kenyan politics platform  
✅ Admin dashboard (Ctrl+Shift+A to access)  
✅ 6 Politicians + 18 Learning Modules ready  
✅ Blog system with featured authors  
✅ Kenyan orange/red branding applied  

---

## 🎯 DEPLOYMENT OPTIONS

### Option 1: Free Hosting (Vercel + Railway) ⭐ RECOMMENDED

**Cost:** FREE  
**Time:** 15 minutes  
**Best For:** Getting live quickly

**Step 1: Deploy Frontend to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
cd polihub
vercel --prod
```

Follow prompts:
- Project name: radamtaani
- Framework preset: Create React App  
- Deploy? Yes

You'll get: `https://radamtaani.vercel.app`

**Step 2: Deploy Backend to Railway**

1. Go to https://railway.app
2. Click "Start a New Project"
3. Connect your GitHub
4. Select your radamtaani repository
5. Add Environment Variables:
   ```
   DB_HOST=containers-us-west-XXX.railway.app
   DB_USER=root
   DB_PASSWORD=(Railway will generate)
   DB_NAME=rada_ke
   PORT=5000
   ```
6. Railway will auto-deploy!

You'll get: `https://radamtaani-production.up.railway.app`

**Step 3: Update Frontend API URL**

Edit `polihub/src/services/api.js`:
```javascript
const API_BASE_URL = 'https://radamtaani-production.up.railway.app/api/polihub';
```

Redeploy frontend:
```bash
cd polihub
vercel --prod
```

---

### Option 2: Shared Hosting (cPanel)

**Cost:** ~$3-5/month  
**Providers:** Hostinger, Namecheap, Bluehost

**Steps:**

1. **Upload Files:**
   - Upload `polihub/build/*` to `public_html/`
   - Upload `server.js` and `package.json` to `~/radamtaani/`

2. **Setup Node.js App:**
   - cPanel → "Setup Node.js App"
   - Application Root: `/home/username/radamtaani`
   - Application URL: yourdomain.com
   - Entry Point: `server.js`

3. **Database:**
   - cPanel → MySQL Databases
   - Create database: `radamtaani_db`
   - Create user and assign permissions
   - Import your database SQL file

4. **Environment Variables:**
   Add in Node.js App settings:
   ```
   DB_HOST=localhost
   DB_USER=radamtaani_user
   DB_PASSWORD=your_password
   DB_NAME=radamtaani_db
   ```

---

### Option 3: VPS (DigitalOcean/Linode)

**Cost:** ~$6/month  
**Full Control:** Yes

**Quick Setup:**

```bash
# 1. Create $6/month droplet (Ubuntu 22.04)

# 2. SSH into server
ssh root@your_server_ip

# 3. Install dependencies
apt update
apt install -y nodejs npm mysql-server nginx
npm install -g pm2

# 4. Clone your code
git clone https://github.com/youruser/radamtaani.git
cd radamtaani

# 5. Install packages
npm install
cd polihub && npm install && npm run build
cd ..

# 6. Start with PM2
pm2 start server.js --name radamtaani
pm2 save
pm2 startup

# 7. Configure Nginx
nano /etc/nginx/sites-available/radamtaani

# Add:
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /root/radamtaani/polihub/build;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}

# Enable site
ln -s /etc/nginx/sites-available/radamtaani /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 8. Add HTTPS
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

---

## 🔒 PRODUCTION CHECKLIST

Before going live:

### Security
- [ ] Change admin password from `admin123`
- [ ] Add rate limiting to API
- [ ] Enable HTTPS/SSL
- [ ] Set up environment variables (don't commit passwords)
- [ ] Add CORS restrictions

### Performance
- [ ] Enable Gzip compression
- [ ] Add database indexes
- [ ] Set up CDN for images
- [ ] Implement caching

### Content
- [ ] Review all politician data for accuracy
- [ ] Verify learning module content
- [ ] Proofread blog posts
- [ ] Test all forms

### Testing
- [ ] Test on mobile devices (iPhone, Android)
- [ ] Test admin dashboard
- [ ] Test Ctrl+Shift+A shortcut
- [ ] Verify all API endpoints work

---

## 📊 MONITORING AFTER LAUNCH

**Free Tools:**

1. **Google Analytics**
   - Track user behavior
   - See popular pages

2. **UptimeRobot**
   - Monitor if site goes down
   - Get alerts via email/SMS

3. **PM2 Monitoring** (if using VPS)
   ```bash
   pm2 monit
   ```

---

## 🔧 MAINTENANCE

**Weekly:**
- Check error logs
- Backup database
- Review user activity

**Monthly:**
- Update politician information
- Add new learning modules
- Publish blog posts
- Update dependencies:
  ```bash
  npm update
  cd polihub && npm update
  ```

---

## 🆘 TROUBLESHOOTING

**Problem:** Site shows old content  
**Solution:** Clear browser cache (Ctrl+Shift+Delete)

**Problem:** API not connecting  
**Solution:** Check backend URL in `api.js` file

**Problem:** Database connection error  
**Solution:** Verify DB credentials in environment variables

**Problem:** Can't access admin  
**Solution:** Try direct login at `/admin-login` or press Ctrl+Shift+A

---

## 📈 SCALING PLAN

**0-1K users:** Current setup is fine

**1K-10K users:**
- Add Redis caching
- Use CDN (Cloudflare)
- Optimize database queries

**10K+ users:**
- Upgrade to dedicated server
- Implement load balancing
- Consider microservices

---

## 🎓 NEXT STEPS

1. Deploy to one of the options above
2. Add your domain name
3. Test thoroughly  
4. Launch to users!
5. Monitor and iterate

---

**Your website is READY to launch!** 🚀🇰🇪

