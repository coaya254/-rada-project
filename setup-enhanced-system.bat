@echo off
echo ========================================
echo Enhanced User Role System Setup
echo ========================================
echo.

echo Installing required dependencies...
npm install bcrypt jsonwebtoken express-rate-limit uuid

echo.
echo ========================================
echo Database Setup Instructions
echo ========================================
echo.
echo 1. Run the enhanced database schema:
echo    mysql -u your_username -p your_database ^< enhanced_user_role_system.sql
echo.
echo 2. Verify tables were created:
echo    SHOW TABLES LIKE '%%staff%%';
echo    SHOW TABLES LIKE '%%trust%%';
echo    SHOW TABLES LIKE '%%moderation%%';
echo.

echo ========================================
echo Environment Variables
echo ========================================
echo.
echo Add these to your .env file:
echo.
echo # JWT Secret for staff authentication
echo JWT_SECRET=your-super-secret-jwt-key-here
echo.
echo # Rate limiting settings
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=100
echo.
echo # Trust score settings
echo MIN_TRUST_SCORE=0.1
echo MAX_TRUST_SCORE=5.0
echo AUTO_APPROVAL_THRESHOLD=2.5
echo.

echo ========================================
echo Integration Steps
echo ========================================
echo.
echo 1. Update your server.js to include enhanced middleware
echo 2. Replace UserContext with EnhancedUserContext in your React app
echo 3. Add EnhancedNavigation component to your layout
echo 4. Add EnhancedModerationQueue to your admin dashboard
echo.

echo ========================================
echo Testing the System
echo ========================================
echo.
echo 1. Start your server: npm start
echo 2. Test anonymous user creation
echo 3. Test staff login with admin credentials
echo 4. Test content submission with auto-moderation
echo.

echo ========================================
echo Files Created
echo ========================================
echo.
echo - enhanced_user_role_system.sql (Database schema)
echo - enhanced_auth_middleware.js (Authentication middleware)
echo - enhanced_api_routes.js (API routes)
echo - client/src/contexts/EnhancedUserContext.js (React context)
echo - client/src/components/EnhancedNavigation.js (Navigation)
echo - client/src/components/admin/EnhancedModerationQueue.js (Admin component)
echo - ENHANCED_USER_ROLE_IMPLEMENTATION_GUIDE.md (Implementation guide)
echo.

echo ========================================
echo Next Steps
echo ========================================
echo.
echo 1. Follow the implementation guide for detailed steps
echo 2. Implement database helper functions in your server
echo 3. Test all features thoroughly
echo 4. Monitor system performance and adjust as needed
echo.

echo Setup complete! Check ENHANCED_USER_ROLE_IMPLEMENTATION_GUIDE.md for detailed instructions.
pause
