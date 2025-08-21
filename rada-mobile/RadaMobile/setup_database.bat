@echo off
echo ========================================
echo Setting up Rada Mobile Database
echo ========================================
echo.

echo This script will help you set up the learning database tables and seed data.
echo.
echo Please make sure your MySQL server is running and you have the correct credentials.
echo.

set /p DB_HOST="Enter database host (default: localhost): "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_USER="Enter database user (default: root): "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_NAME="Enter database name (default: rada_ke): "
if "%DB_NAME%"=="" set DB_NAME=rada_ke

echo.
echo Creating learning tables...
mysql -h %DB_HOST% -u %DB_USER% -p %DB_NAME% < database/create_learning_tables.sql

echo.
echo Seeding learning data...
mysql -h %DB_HOST% -u %DB_USER% -p %DB_NAME% < database/seed_learning_data.sql

echo.
echo ========================================
echo Database setup complete!
echo ========================================
echo.
echo Your Rada Mobile app now has:
echo - 8 Learning Modules
echo - 3 Interactive Quizzes  
echo - 5 Community Challenges
echo - 10 Achievement Badges
echo - Sample user progress data
echo.
echo You can now test the app with real data!
pause
