# Backend Integration Guide

## Overview

The React Native app has been successfully integrated with your existing backend server. This integration allows the app to:

- ✅ Connect to your existing MySQL database
- ✅ Use real user authentication and anonymous user creation
- ✅ Fetch learning modules, quizzes, and challenges from the database
- ✅ Track user progress and achievements
- ✅ Submit quiz attempts and module completions
- ✅ Handle offline mode with fallback data

## Architecture

### 1. API Service (`src/services/api.js`)
- Centralized API client for all backend communication
- Handles authentication tokens
- Provides fallback data for offline mode
- Supports all CRUD operations

### 2. Authentication Context (`src/contexts/AuthContext.js`)
- Manages user authentication state
- Handles anonymous user creation
- Stores authentication tokens securely
- Provides login/logout functionality

### 3. Configuration (`src/config/api.js`)
- Environment-specific API settings
- Easy switching between development/production
- Configurable timeouts and retry attempts

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/users/create` - Anonymous user creation
- `GET /api/auth/me` - Get current user

### Learning
- `GET /api/learning/modules` - Get all learning modules
- `GET /api/learning/quizzes` - Get all quizzes
- `GET /api/learning/challenges` - Get all challenges
- `GET /api/learning/badges` - Get all badges
- `GET /api/learning/stats/{userId}` - Get user learning stats
- `GET /api/learning/user-progress/{userId}` - Get user progress
- `PUT /api/learning/progress/{userId}/{moduleId}` - Update module progress
- `POST /api/learning/quiz-attempt` - Submit quiz attempt
- `POST /api/learning/challenges/{challengeId}/join` - Join challenge

### User Profile
- `GET /api/users/{userId}` - Get user profile
- `PUT /api/users/{userId}/profile` - Update user profile
- `GET /api/users/{userId}/achievements` - Get user achievements
- `GET /api/users/{userId}/badges` - Get user badges

### Community
- `GET /api/posts` - Get community posts
- `POST /api/posts` - Create community post
- `GET /api/promises` - Get promise tracker items

## Setup Instructions

### 1. Start the Backend Server
```bash
# From the project root directory
node server.js
```

The server should start on `http://localhost:5001`

### 2. Start the React Native App
```bash
# From the rada-mobile/RadaMobile directory
npm start
```

### 3. Test the Integration
- Open the app on your device/emulator
- Navigate to the Learning Hub
- The app will automatically attempt to connect to the backend
- If successful, you'll see real data from your database
- If the server is unavailable, the app will use fallback data

## Features

### ✅ Real-time Data
- All learning content is fetched from your database
- User progress is saved and synchronized
- Quiz attempts are recorded and analyzed

### ✅ Offline Support
- App works even when server is unavailable
- Fallback data ensures smooth user experience
- Data syncs when connection is restored

### ✅ User Authentication
- Anonymous users can use the app immediately
- Registered users can log in with their credentials
- Secure token-based authentication

### ✅ Progress Tracking
- Module completion progress
- Quiz scores and attempts
- Learning streaks and achievements
- XP points and level progression

## Configuration

### Development
- Server URL: `http://localhost:5001`
- Timeout: 10 seconds
- Retry attempts: 3

### Production
- Update `src/config/api.js` with your production server URL
- Adjust timeouts and retry settings as needed

## Troubleshooting

### Server Connection Issues
1. Ensure the backend server is running on port 5001
2. Check that the database is accessible
3. Verify CORS settings allow mobile app connections

### Authentication Issues
1. Check that the JWT secret is properly configured
2. Verify user creation endpoints are working
3. Ensure token storage is working correctly

### Data Loading Issues
1. Check database connectivity
2. Verify API endpoints are responding
3. Review server logs for errors

## Next Steps

1. **Add More Endpoints**: Extend the API to support additional features
2. **Real-time Updates**: Implement WebSocket connections for live updates
3. **Push Notifications**: Add notification system for achievements and challenges
4. **Data Caching**: Implement local caching for better offline experience
5. **Analytics**: Add user behavior tracking and analytics

## Support

If you encounter any issues with the integration:

1. Check the server logs for backend errors
2. Review the React Native console for client-side errors
3. Verify network connectivity between app and server
4. Test API endpoints directly using tools like Postman

The integration is now complete and your React Native app is fully connected to your existing backend! 🚀
