@echo off
echo Starting Rada.ke Development Environment...

REM Kill any existing Node processes
echo Killing existing Node processes...
taskkill /f /im node.exe >nul 2>&1

REM Wait a moment for processes to fully terminate
timeout /t 2 /nobreak >nul

REM Start the server in the background
echo Starting server on port 5001...
start "Rada Server" cmd /k "npm start"

REM Wait for server to start
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

REM Start the client
echo Starting client on port 3004...
cd client
start "Rada Client" cmd /k "npm start"

echo.
echo Development environment starting...
echo Server: http://localhost:5001
echo Client: http://localhost:3004
echo.
echo Press any key to exit this script (servers will continue running)
pause >nul