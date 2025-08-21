# 🚀 Quick Start Guide - See rada.ke in Action!

Follow these simple steps to get rada.ke running on your computer:

## Prerequisites
Before starting, make sure you have:
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (version 5.7 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)

## Step 1: Setup Dependencies

### Option A: Use the Setup Script (Windows)
```bash
# Double-click setup.bat or run in command prompt
setup.bat
```

### Option B: Manual Setup
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

## Step 2: Configure Database

1. **Start MySQL** service on your computer
2. **Create database:**
   ```sql
   CREATE DATABASE rada_ke CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. **Set up environment file:**
   ```bash
   # Copy the example file
   copy .env.example .env
   
   # Edit .env with your MySQL details:
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=rada_ke
   PORT=5000
   ```

## Step 3: Start the Application

### Option A: Use Start Script (Windows)
```bash
# Double-click start-dev.bat or run in command prompt
start-dev.bat
```

### Option B: Manual Start
```bash
npm run dev
```

## Step 4: View the Application

Open your browser and navigate to:
- **🌐 Main App:** http://localhost:3003
- **⚙️ API Server:** "proxy": "http://localhost5001/api"

## 📱 What You'll See

### 1. **Splash Screen**
- Beautiful rada.ke branding with loading animation
- "Your Civic Engagement Platform" tagline

### 2. **Onboarding Flow**
- 3 interactive screens explaining the platform
- Smooth animations and civic-focused messaging
- Mobile-optimized touch interactions

### 3. **Main Dashboard**
- Anonymous user profile with emoji avatar
- XP tracking and streak indicators
- Featured civic content cards
- Quick action buttons for daily civic engagement
- Real-time civic mood polling

### 4. **Core Features**
- **📰 Civic Feed** - Browse stories, poems, and user content
- **🏛️ Honor Wall** - Memorial for civic heroes with candle lighting
- **📚 Learn Hub** - Interactive civic education modules
- **👤 Profile** - Badge collection and progress tracking

## 🎮 Test the Features

### Anonymous User Experience
1. **No signup required** - App creates anonymous UUID automatically
2. **Privacy indicators** - See "100% Anonymous" at top of app
3. **Content creation** - Use floating + button to create posts
4. **XP system** - Click daily actions to earn points and badges

### Interactive Elements
- **Light candles** for civic heroes (🕯️)
- **Vote in mood polls** (😊😐😠🙂)
- **Create content** - stories, poems, images, audio
- **Earn badges** - Watch your civic engagement grow

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
# Verify credentials in .env file
# Make sure database 'rada_ke' exists
```

### Port Issues
```bash
# If ports 3000 or 5000 are in use, check:
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```

### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s node_modules
rmdir /s client\node_modules
npm install
cd client && npm install
```

## 📱 Mobile Testing

To test on mobile:
1. **Find your computer's IP address**
2. **Make sure your phone is on same WiFi network**
3. **Visit:** http://YOUR_IP_ADDRESS:3003
4. **Add to home screen** for full mobile app experience

## 🎨 Customization

Once running, you can:
- Replace placeholder images with real content
- Add your own civic heroes to the Honor Wall
- Create custom learning modules
- Modify the color scheme and branding

## 🆘 Need Help?

If you encounter any issues:
1. Check the console output for error messages
2. Verify all prerequisites are installed
3. Ensure MySQL is running and accessible
4. Check that all environment variables are set correctly

---

**🎉 Congratulations!** You now have a fully functional civic engagement platform running locally. The app showcases modern web development practices with React, Node.js, and MySQL, specifically designed for Kenyan youth civic participation.

**Ready to empower Kenya's youth? Let's get rada.ke running!** 🇰🇪