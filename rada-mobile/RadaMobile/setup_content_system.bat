@echo off
echo ========================================
echo 🎨 Setting up User Content Creator Tool
echo ========================================
echo.

echo 📁 Creating upload directories...
if not exist "uploads" mkdir uploads
if not exist "uploads\content" mkdir uploads\content
echo ✅ Upload directories created!

echo.
echo 📦 Installing required packages...
npm install multer
echo ✅ Packages installed!

echo.
echo 🗄️ Setting up database tables...
echo Please run the following SQL command in your MySQL database:
echo.
echo mysql -u your_username -p your_database ^< setup_content_tables.sql
echo.
echo Or copy and paste the contents of setup_content_tables.sql into your MySQL client
echo.

echo.
echo 🚀 Starting server...
echo The content creation endpoints are now integrated into your server.js
echo.
echo 📱 Your mobile app now has:
echo    - Floating pencil button (✏️) with speed dial
echo    - Content creation modal with 4 types
echo    - Media upload support
echo    - XP reward system
echo    - Content moderation workflow
echo.
echo 🎉 Setup complete! Your users can now create content!
echo.
pause

