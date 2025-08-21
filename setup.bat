@echo off
echo ========================================
echo         rada.ke Setup Script
echo ========================================
echo.

echo Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

cd ..
echo.
echo Setup complete!
echo.
echo To start the application:
echo 1. Make sure MySQL is running
echo 2. Create a database called 'rada_ke'
echo 3. Copy .env.example to .env and update database credentials
echo 4. Run: npm run dev
echo.
echo The app will be available at:
echo - Frontend: http://localhost:3003
echo - Backend API: "proxy": "http://localhost:5001/api"
echo.
pause