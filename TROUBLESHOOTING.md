# Troubleshooting Guide

## Common Issues and Solutions

### 1. Port Already in Use Error
**Error**: `EADDRINUSE: address already in use :::5001`

**Solution**:
```bash
# Kill all Node processes
taskkill /f /im node.exe

# Or find specific process and kill it
netstat -ano | findstr :5001
taskkill /f /pid <PID>
```

### 2. Frontend Won't Load
**Error**: `ERR_CONNECTION_REFUSED` on localhost:3004

**Solution**:
1. Make sure server is running first: `npm start`
2. In a new terminal, start client: `cd client && npm start`
3. Check if port 3004 is available: `netstat -ano | findstr :3004`

### 3. Database Connection Issues
**Error**: Database connection failed

**Solution**:
1. Ensure MySQL is running
2. Check database credentials in server.js
3. Create database if it doesn't exist: `CREATE DATABASE rada_ke;`

### 4. API Endpoints Not Working
**Error**: 404 or 500 errors on API calls

**Solution**:
1. Check if server is running on port 5001
2. Verify API routes in server.js
3. Check browser console for CORS errors

## Quick Start Commands

### Development Mode
```bash
# Option 1: Use the batch file
start-dev.bat

# Option 2: Manual start
npm run dev

# Option 3: Separate terminals
# Terminal 1: npm start (server)
# Terminal 2: cd client && npm start (client)
```

### Production Build
```bash
npm run build
npm start
```

## Port Configuration

- **Server**: Port 5001 (http://localhost:5001)
- **Client**: Port 3004 (http://localhost:3004)
- **API Proxy**: Client proxies to http://localhost:5001/api

## Environment Variables

Create a `.env` file in the root directory:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rada_ke
PORT=5001
NODE_ENV=development
```

## Useful Commands

```bash
# Check what's running on ports
netstat -ano | findstr :5001
netstat -ano | findstr :3004

# Kill all Node processes
taskkill /f /im node.exe

# Check Node version
node --version
npm --version

# Clear npm cache if needed
npm cache clean --force
```

## Browser Issues

If the app loads but doesn't work properly:
1. Clear browser cache
2. Open Developer Tools (F12)
3. Check Console for JavaScript errors
4. Check Network tab for failed API calls
