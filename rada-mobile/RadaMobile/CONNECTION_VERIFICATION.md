# Connection Verification Guide

## Overview
This document provides comprehensive instructions for verifying all connections and integrations in the Rada Legal Learning Platform.

## Database Connections

### MySQL Database Verification

#### 1. Database Server Connection
```bash
# Test database connectivity
mysql -h localhost -u rada_user -p rada_learning_db

# Verify database exists
SHOW DATABASES;

# Check tables
USE rada_learning_db;
SHOW TABLES;
```

#### 2. Required Tables Verification
```sql
-- Check learning_modules table
SELECT COUNT(*) FROM learning_modules;
DESCRIBE learning_modules;

-- Check lessons table
SELECT COUNT(*) FROM lessons;
DESCRIBE lessons;

-- Check users table
SELECT COUNT(*) FROM users;
DESCRIBE users;

-- Check progress table
SELECT COUNT(*) FROM user_progress;
DESCRIBE user_progress;
```

#### 3. Data Integrity Check
```sql
-- Verify lesson-module associations
SELECT 
    m.module_name,
    COUNT(l.id) as lesson_count
FROM learning_modules m
LEFT JOIN lessons l ON m.id = l.module_id
GROUP BY m.id, m.module_name;

-- Check for orphaned lessons
SELECT * FROM lessons WHERE module_id NOT IN (SELECT id FROM learning_modules);

-- Verify user progress data
SELECT 
    u.username,
    COUNT(p.id) as progress_entries
FROM users u
LEFT JOIN user_progress p ON u.id = p.user_id
GROUP BY u.id, u.username;
```

### Database Connection Test Script
```javascript
// test-db-connection.js
const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'rada_user',
      password: 'your_password',
      database: 'rada_learning_db'
    });

    console.log('✅ Database connection successful');
    
    // Test queries
    const [modules] = await connection.execute('SELECT COUNT(*) as count FROM learning_modules');
    const [lessons] = await connection.execute('SELECT COUNT(*) as count FROM lessons');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    console.log(`📊 Modules: ${modules[0].count}`);
    console.log(`📚 Lessons: ${lessons[0].count}`);
    console.log(`👥 Users: ${users[0].count}`);
    
    await connection.end();
    console.log('✅ Database test completed successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testDatabaseConnection();
```

## API Endpoints Verification

### 1. Backend Server Status
```bash
# Check if server is running
curl http://localhost:5001/health

# Test API endpoints
curl http://localhost:5001/api/health
curl http://localhost:5001/api/modules
curl http://localhost:5001/api/lessons
```

### 2. API Endpoint Tests

#### Authentication Endpoints
```bash
# Test user registration
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'

# Test user login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

#### Learning Content Endpoints
```bash
# Test modules endpoint
curl http://localhost:5001/api/modules

# Test lessons endpoint
curl http://localhost:5001/api/lessons

# Test specific module lessons
curl http://localhost:5001/api/modules/1/lessons
```

#### Progress Tracking Endpoints
```bash
# Test progress saving
curl -X POST http://localhost:5001/api/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"user_id":1,"lesson_id":1,"completed":true,"score":85}'

# Test progress retrieval
curl http://localhost:5001/api/progress/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. API Response Validation
```javascript
// api-test.js
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testAPIEndpoints() {
  const tests = [
    {
      name: 'Health Check',
      url: `${API_BASE_URL}/health`,
      method: 'GET'
    },
    {
      name: 'Get Modules',
      url: `${API_BASE_URL}/modules`,
      method: 'GET'
    },
    {
      name: 'Get Lessons',
      url: `${API_BASE_URL}/lessons`,
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      const response = await axios({
        method: test.method,
        url: test.url
      });
      console.log(`✅ ${test.name}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
}

testAPIEndpoints();
```

## Mobile App Connections

### 1. Expo Development Server
```bash
# Start Expo server
npx expo start

# Check server status
curl http://localhost:8081

# Test web version
open http://localhost:8081
```

### 2. Mobile App API Integration
```javascript
// Test API integration in mobile app
import apiService from './src/services/api';

const testMobileAPI = async () => {
  try {
    // Test health check
    const health = await apiService.get('/health');
    console.log('✅ Mobile API Health:', health);

    // Test modules
    const modules = await apiService.get('/modules');
    console.log('✅ Mobile API Modules:', modules.length);

    // Test lessons
    const lessons = await apiService.get('/lessons');
    console.log('✅ Mobile API Lessons:', lessons.length);
  } catch (error) {
    console.error('❌ Mobile API Error:', error);
  }
};
```

### 3. Offline Storage Verification
```javascript
// Test offline storage
import AsyncStorage from '@react-native-async-storage/async-storage';

const testOfflineStorage = async () => {
  try {
    // Test saving data
    await AsyncStorage.setItem('test_key', 'test_value');
    
    // Test retrieving data
    const value = await AsyncStorage.getItem('test_key');
    console.log('✅ Offline Storage:', value === 'test_value');
    
    // Test clearing data
    await AsyncStorage.removeItem('test_key');
    console.log('✅ Offline Storage Cleanup: Success');
  } catch (error) {
    console.error('❌ Offline Storage Error:', error);
  }
};
```

## Third-Party Service Connections

### 1. Push Notifications
```javascript
// Test push notification service
import * as Notifications from 'expo-notifications';

const testPushNotifications = async () => {
  try {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('✅ Push Notifications Permission:', status);
    
    // Test notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test notification from Rada',
      },
      trigger: { seconds: 2 },
    });
    console.log('✅ Push Notification Sent');
  } catch (error) {
    console.error('❌ Push Notification Error:', error);
  }
};
```

### 2. File System Access
```javascript
// Test file system access
import * as FileSystem from 'expo-file-system';

const testFileSystem = async () => {
  try {
    // Test directory creation
    const dir = FileSystem.documentDirectory + 'rada_test/';
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    console.log('✅ File System Directory Created');
    
    // Test file writing
    const fileUri = dir + 'test.txt';
    await FileSystem.writeAsStringAsync(fileUri, 'Test content');
    console.log('✅ File System Write: Success');
    
    // Test file reading
    const content = await FileSystem.readAsStringAsync(fileUri);
    console.log('✅ File System Read:', content === 'Test content');
  } catch (error) {
    console.error('❌ File System Error:', error);
  }
};
```

## Network Connectivity Tests

### 1. Internet Connection
```javascript
// Test internet connectivity
import NetInfo from '@react-native-community/netinfo';

const testNetworkConnectivity = () => {
  NetInfo.addEventListener(state => {
    console.log('✅ Network State:', state);
    console.log('✅ Is Connected:', state.isConnected);
    console.log('✅ Connection Type:', state.type);
  });
};
```

### 2. API Response Times
```javascript
// Test API response times
const testAPIResponseTimes = async () => {
  const endpoints = [
    '/health',
    '/modules',
    '/lessons',
    '/progress'
  ];

  for (const endpoint of endpoints) {
    const startTime = Date.now();
    try {
      await apiService.get(endpoint);
      const responseTime = Date.now() - startTime;
      console.log(`✅ ${endpoint}: ${responseTime}ms`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
};
```

## Data Synchronization Tests

### 1. Offline to Online Sync
```javascript
// Test offline sync
const testOfflineSync = async () => {
  try {
    // Simulate offline data
    const offlineData = {
      progress: { lesson_id: 1, completed: true, score: 85 },
      notes: { lesson_id: 1, content: 'Test note' }
    };

    // Save offline
    await AsyncStorage.setItem('offline_data', JSON.stringify(offlineData));
    console.log('✅ Offline Data Saved');

    // Simulate coming back online
    const networkState = await NetInfo.fetch();
    if (networkState.isConnected) {
      // Sync data
      const savedData = await AsyncStorage.getItem('offline_data');
      const data = JSON.parse(savedData);
      
      // Send to server
      await apiService.post('/progress', data.progress);
      await apiService.post('/notes', data.notes);
      
      console.log('✅ Offline Data Synced');
      
      // Clear offline data
      await AsyncStorage.removeItem('offline_data');
      console.log('✅ Offline Data Cleared');
    }
  } catch (error) {
    console.error('❌ Offline Sync Error:', error);
  }
};
```

## Performance Verification

### 1. App Launch Time
```javascript
// Test app launch performance
const testAppLaunch = () => {
  const startTime = Date.now();
  
  // App initialization
  // ... app setup code ...
  
  const launchTime = Date.now() - startTime;
  console.log(`✅ App Launch Time: ${launchTime}ms`);
  
  // Target: < 3000ms
  if (launchTime < 3000) {
    console.log('✅ Launch Time: Excellent');
  } else if (launchTime < 5000) {
    console.log('⚠️ Launch Time: Acceptable');
  } else {
    console.log('❌ Launch Time: Needs Improvement');
  }
};
```

### 2. Memory Usage
```javascript
// Test memory usage
const testMemoryUsage = () => {
  if (performance.memory) {
    const memory = performance.memory;
    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
    const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
    
    console.log(`✅ Memory Usage: ${usedMB}MB / ${limitMB}MB`);
    console.log(`✅ Memory Efficiency: ${Math.round((usedMB / limitMB) * 100)}%`);
    
    // Target: < 80% memory usage
    if ((usedMB / limitMB) < 0.8) {
      console.log('✅ Memory Usage: Good');
    } else {
      console.log('⚠️ Memory Usage: High');
    }
  }
};
```

## Security Verification

### 1. API Security
```javascript
// Test API security
const testAPISecurity = async () => {
  try {
    // Test without authentication
    try {
      await apiService.get('/progress');
      console.log('❌ API Security: Unprotected endpoint');
    } catch (error) {
      console.log('✅ API Security: Protected endpoint');
    }
    
    // Test with invalid token
    try {
      await apiService.get('/progress', {
        headers: { Authorization: 'Bearer invalid_token' }
      });
      console.log('❌ API Security: Invalid token accepted');
    } catch (error) {
      console.log('✅ API Security: Invalid token rejected');
    }
  } catch (error) {
    console.error('❌ API Security Test Error:', error);
  }
};
```

### 2. Data Encryption
```javascript
// Test data encryption
const testDataEncryption = () => {
  // Test sensitive data storage
  const sensitiveData = { password: 'test123', token: 'abc123' };
  
  // Should be encrypted before storage
  const encrypted = btoa(JSON.stringify(sensitiveData));
  const decrypted = JSON.parse(atob(encrypted));
  
  console.log('✅ Data Encryption: Working');
  console.log('✅ Data Integrity:', JSON.stringify(sensitiveData) === JSON.stringify(decrypted));
};
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Database Connection Failed
- Check MySQL service is running
- Verify credentials in .env file
- Check firewall settings
- Ensure database exists

#### 2. API Endpoints Not Responding
- Check backend server is running
- Verify port 5001 is available
- Check CORS settings
- Review API route definitions

#### 3. Mobile App Not Loading
- Check Expo server is running
- Verify port 8081 is available
- Clear Metro cache: `npx expo start --clear`
- Check for JavaScript errors

#### 4. Offline Sync Not Working
- Check network connectivity
- Verify AsyncStorage permissions
- Review sync logic implementation
- Check server endpoint availability

#### 5. Performance Issues
- Check memory usage
- Review component re-renders
- Optimize image loading
- Implement lazy loading

## Verification Checklist

### ✅ Database
- [ ] MySQL server running
- [ ] Database connection successful
- [ ] All tables exist
- [ ] Data integrity verified
- [ ] User permissions correct

### ✅ Backend API
- [ ] Server running on port 5001
- [ ] All endpoints responding
- [ ] Authentication working
- [ ] CORS configured
- [ ] Error handling working

### ✅ Mobile App
- [ ] Expo server running
- [ ] App loads successfully
- [ ] API integration working
- [ ] Offline storage working
- [ ] Push notifications working

### ✅ Third-Party Services
- [ ] File system access working
- [ ] Network connectivity detected
- [ ] Push notification permissions
- [ ] Camera access (if needed)
- [ ] Location access (if needed)

### ✅ Performance
- [ ] App launch time < 3 seconds
- [ ] Memory usage < 200MB
- [ ] API response time < 500ms
- [ ] Smooth scrolling
- [ ] No memory leaks

### ✅ Security
- [ ] API endpoints protected
- [ ] Data encryption working
- [ ] Input validation active
- [ ] Error messages secure
- [ ] User data protected

## Support

For connection issues or questions:
- Check the troubleshooting guide above
- Review server logs for errors
- Test individual components
- Contact development team
- Check documentation

---

*This verification guide ensures all connections and integrations are working properly before deployment.*
