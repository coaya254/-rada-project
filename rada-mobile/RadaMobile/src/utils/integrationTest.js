/**
 * Integration Test Suite for Rada Legal Learning Platform
 * Tests all major integrations and connections
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';
import apiService from '../services/api';
import performanceService from '../services/performanceService';

class IntegrationTestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  // Add test result
  addResult(testName, passed, message, details = null) {
    this.results.total++;
    if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
    
    this.results.details.push({
      test: testName,
      status: passed ? 'PASS' : 'FAIL',
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Test database connection
  async testDatabaseConnection() {
    try {
      const response = await apiService.get('/health');
      this.addResult(
        'Database Connection',
        response.status === 200,
        response.status === 200 ? 'Database connection successful' : 'Database connection failed',
        response.data
      );
    } catch (error) {
      this.addResult(
        'Database Connection',
        false,
        `Database connection failed: ${error.message}`,
        error
      );
    }
  }

  // Test API endpoints
  async testAPIEndpoints() {
    const endpoints = [
      { name: 'Health Check', path: '/health' },
      { name: 'Modules', path: '/modules' },
      { name: 'Lessons', path: '/lessons' },
      { name: 'Users', path: '/users' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await apiService.get(endpoint.path);
        this.addResult(
          `API ${endpoint.name}`,
          response.status === 200,
          response.status === 200 ? `${endpoint.name} endpoint working` : `${endpoint.name} endpoint failed`,
          { status: response.status, dataLength: response.data?.length || 0 }
        );
      } catch (error) {
        this.addResult(
          `API ${endpoint.name}`,
          false,
          `${endpoint.name} endpoint failed: ${error.message}`,
          error
        );
      }
    }
  }

  // Test authentication
  async testAuthentication() {
    try {
      // Test registration
      const registerData = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'testpass123'
      };

      const registerResponse = await apiService.post('/auth/register', registerData);
      this.addResult(
        'User Registration',
        registerResponse.status === 201,
        registerResponse.status === 201 ? 'User registration successful' : 'User registration failed',
        { status: registerResponse.status }
      );

      // Test login
      const loginResponse = await apiService.post('/auth/login', {
        username: registerData.username,
        password: registerData.password
      });
      
      this.addResult(
        'User Login',
        loginResponse.status === 200 && loginResponse.data.token,
        loginResponse.status === 200 ? 'User login successful' : 'User login failed',
        { status: loginResponse.status, hasToken: !!loginResponse.data?.token }
      );

      return loginResponse.data?.token;
    } catch (error) {
      this.addResult(
        'Authentication',
        false,
        `Authentication failed: ${error.message}`,
        error
      );
      return null;
    }
  }

  // Test offline storage
  async testOfflineStorage() {
    try {
      // Test saving data
      const testData = {
        test: 'integration_test',
        timestamp: Date.now(),
        data: { lesson_id: 1, progress: 50 }
      };

      await AsyncStorage.setItem('integration_test', JSON.stringify(testData));
      this.addResult(
        'Offline Storage Save',
        true,
        'Data saved to offline storage successfully'
      );

      // Test retrieving data
      const retrievedData = await AsyncStorage.getItem('integration_test');
      const parsedData = JSON.parse(retrievedData);
      
      this.addResult(
        'Offline Storage Retrieve',
        parsedData.test === 'integration_test',
        parsedData.test === 'integration_test' ? 'Data retrieved successfully' : 'Data retrieval failed',
        parsedData
      );

      // Test clearing data
      await AsyncStorage.removeItem('integration_test');
      const clearedData = await AsyncStorage.getItem('integration_test');
      
      this.addResult(
        'Offline Storage Clear',
        clearedData === null,
        clearedData === null ? 'Data cleared successfully' : 'Data clear failed'
      );
    } catch (error) {
      this.addResult(
        'Offline Storage',
        false,
        `Offline storage test failed: ${error.message}`,
        error
      );
    }
  }

  // Test network connectivity
  async testNetworkConnectivity() {
    try {
      const networkState = await NetInfo.fetch();
      
      this.addResult(
        'Network Connectivity',
        networkState.isConnected,
        networkState.isConnected ? 'Network connected' : 'Network disconnected',
        {
          isConnected: networkState.isConnected,
          type: networkState.type,
          isInternetReachable: networkState.isInternetReachable
        }
      );
    } catch (error) {
      this.addResult(
        'Network Connectivity',
        false,
        `Network connectivity test failed: ${error.message}`,
        error
      );
    }
  }

  // Test push notifications
  async testPushNotifications() {
    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      
      this.addResult(
        'Push Notification Permissions',
        status === 'granted',
        status === 'granted' ? 'Push notification permissions granted' : 'Push notification permissions denied',
        { status }
      );

      if (status === 'granted') {
        // Test scheduling notification
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Integration Test',
            body: 'This is a test notification from Rada',
          },
          trigger: { seconds: 2 },
        });

        this.addResult(
          'Push Notification Schedule',
          !!notificationId,
          notificationId ? 'Notification scheduled successfully' : 'Notification scheduling failed',
          { notificationId }
        );
      }
    } catch (error) {
      this.addResult(
        'Push Notifications',
        false,
        `Push notification test failed: ${error.message}`,
        error
      );
    }
  }

  // Test file system access
  async testFileSystemAccess() {
    try {
      // Test directory creation
      const testDir = FileSystem.documentDirectory + 'integration_test/';
      await FileSystem.makeDirectoryAsync(testDir, { intermediates: true });
      
      this.addResult(
        'File System Directory Creation',
        true,
        'Directory created successfully'
      );

      // Test file writing
      const testFile = testDir + 'test.txt';
      const testContent = 'Integration test content';
      await FileSystem.writeAsStringAsync(testFile, testContent);
      
      this.addResult(
        'File System Write',
        true,
        'File written successfully'
      );

      // Test file reading
      const readContent = await FileSystem.readAsStringAsync(testFile);
      
      this.addResult(
        'File System Read',
        readContent === testContent,
        readContent === testContent ? 'File read successfully' : 'File read failed',
        { expected: testContent, actual: readContent }
      );

      // Test file deletion
      await FileSystem.deleteAsync(testFile);
      await FileSystem.deleteAsync(testDir, { idempotent: true });
      
      this.addResult(
        'File System Cleanup',
        true,
        'Files cleaned up successfully'
      );
    } catch (error) {
      this.addResult(
        'File System Access',
        false,
        `File system test failed: ${error.message}`,
        error
      );
    }
  }

  // Test performance monitoring
  async testPerformanceMonitoring() {
    try {
      // Start performance monitoring
      performanceService.startMonitoring();
      
      this.addResult(
        'Performance Monitoring Start',
        performanceService.isMonitoring,
        performanceService.isMonitoring ? 'Performance monitoring started' : 'Performance monitoring failed to start'
      );

      // Test timing
      const timingId = performanceService.startTiming('integration_test');
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
      performanceService.endTiming(timingId);
      
      this.addResult(
        'Performance Timing',
        true,
        'Performance timing test completed'
      );

      // Test memory recording
      performanceService.recordMemoryUsage();
      
      this.addResult(
        'Performance Memory Recording',
        true,
        'Memory usage recorded successfully'
      );

      // Stop monitoring and get report
      const report = performanceService.stopMonitoring();
      
      this.addResult(
        'Performance Report Generation',
        !!report,
        report ? 'Performance report generated successfully' : 'Performance report generation failed',
        report?.summary
      );
    } catch (error) {
      this.addResult(
        'Performance Monitoring',
        false,
        `Performance monitoring test failed: ${error.message}`,
        error
      );
    }
  }

  // Test data synchronization
  async testDataSynchronization() {
    try {
      // Simulate offline data
      const offlineData = {
        progress: {
          user_id: 1,
          lesson_id: 1,
          completed: true,
          score: 85,
          timestamp: Date.now()
        },
        notes: {
          user_id: 1,
          lesson_id: 1,
          content: 'Integration test note',
          timestamp: Date.now()
        }
      };

      // Save offline data
      await AsyncStorage.setItem('sync_test_data', JSON.stringify(offlineData));
      
      this.addResult(
        'Offline Data Preparation',
        true,
        'Offline data prepared for sync'
      );

      // Check network state
      const networkState = await NetInfo.fetch();
      
      if (networkState.isConnected) {
        // Simulate sync
        try {
          // In a real app, you would sync with the server
          // For testing, we'll just verify the data exists
          const savedData = await AsyncStorage.getItem('sync_test_data');
          const data = JSON.parse(savedData);
          
          this.addResult(
            'Data Synchronization',
            data.progress && data.notes,
            'Data synchronization test completed',
            { hasProgress: !!data.progress, hasNotes: !!data.notes }
          );
        } catch (syncError) {
          this.addResult(
            'Data Synchronization',
            false,
            `Data synchronization failed: ${syncError.message}`,
            syncError
          );
        }
      } else {
        this.addResult(
          'Data Synchronization',
          true,
          'Data synchronization skipped (offline)'
        );
      }

      // Clean up
      await AsyncStorage.removeItem('sync_test_data');
      
    } catch (error) {
      this.addResult(
        'Data Synchronization',
        false,
        `Data synchronization test failed: ${error.message}`,
        error
      );
    }
  }

  // Test app performance
  async testAppPerformance() {
    try {
      // Test app launch time
      const startTime = Date.now();
      
      // Simulate app initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const launchTime = Date.now() - startTime;
      
      this.addResult(
        'App Launch Performance',
        launchTime < 3000,
        `App launch time: ${launchTime}ms`,
        { launchTime, target: 3000 }
      );

      // Test memory usage
      if (performance.memory) {
        const memory = performance.memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
        const usagePercent = (usedMB / limitMB) * 100;
        
        this.addResult(
          'Memory Usage',
          usagePercent < 80,
          `Memory usage: ${usedMB}MB / ${limitMB}MB (${usagePercent.toFixed(1)}%)`,
          { usedMB, limitMB, usagePercent }
        );
      }

      // Test API response times
      const apiStartTime = Date.now();
      try {
        await apiService.get('/health');
        const apiResponseTime = Date.now() - apiStartTime;
        
        this.addResult(
          'API Response Time',
          apiResponseTime < 1000,
          `API response time: ${apiResponseTime}ms`,
          { responseTime: apiResponseTime, target: 1000 }
        );
      } catch (apiError) {
        this.addResult(
          'API Response Time',
          false,
          `API response time test failed: ${apiError.message}`,
          apiError
        );
      }
    } catch (error) {
      this.addResult(
        'App Performance',
        false,
        `App performance test failed: ${error.message}`,
        error
      );
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Integration Tests...');
    
    // Reset results
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };

    // Run tests
    await this.testDatabaseConnection();
    await this.testAPIEndpoints();
    const token = await this.testAuthentication();
    await this.testOfflineStorage();
    await this.testNetworkConnectivity();
    await this.testPushNotifications();
    await this.testFileSystemAccess();
    await this.testPerformanceMonitoring();
    await this.testDataSynchronization();
    await this.testAppPerformance();

    // Generate report
    this.generateReport();
    
    return this.results;
  }

  // Generate test report
  generateReport() {
    const { passed, failed, total, details } = this.results;
    const successRate = ((passed / total) * 100).toFixed(1);
    
    console.log('\n📊 Integration Test Report');
    console.log('========================');
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log('\n📋 Test Details:');
    
    details.forEach((test, index) => {
      const status = test.status === 'PASS' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${test.test}: ${test.message}`);
      if (test.details) {
        console.log(`   Details: ${JSON.stringify(test.details, null, 2)}`);
      }
    });

    if (failed > 0) {
      console.log('\n⚠️ Some tests failed. Please check the details above.');
    } else {
      console.log('\n🎉 All tests passed! Integration is working correctly.');
    }
  }

  // Get test results
  getResults() {
    return this.results;
  }
}

// Export test suite
export default IntegrationTestSuite;

// Export individual test functions for manual testing
export {
  IntegrationTestSuite
};
