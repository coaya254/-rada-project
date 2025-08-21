const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to run tests
const runTest = async (testName, testFunction) => {
  try {
    console.log(`🧪 Testing: ${testName}`);
    await testFunction();
    console.log(`✅ PASSED: ${testName}`);
    testResults.passed++;
    testResults.tests.push({ name: testName, status: 'PASSED' });
  } catch (error) {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name: testName, status: 'FAILED', error: error.message });
  }
};

// Test 1: Health Check
const testHealthCheck = async () => {
  const response = await axios.get(`${API_BASE_URL}/health`);
  if (response.data.status !== 'OK') {
    throw new Error('Health check failed');
  }
};

// Test 2: Global Logout
const testGlobalLogout = async () => {
  const response = await axios.post(`${API_BASE_URL}/auth/global-logout`);
  if (!response.data.message || !response.data.timestamp) {
    throw new Error('Global logout response invalid');
  }
};

// Test 3: Staff Login (Admin)
const testStaffLogin = async () => {
  const response = await axios.post(`${API_BASE_URL}/auth/staff/login`, {
    email: 'admin@rada.ke',
    password: 'admin123'
  });
  
  if (!response.data.token || !response.data.user) {
    throw new Error('Staff login failed');
  }
  
  // Test authenticated endpoint
  const authResponse = await axios.get(`${API_BASE_URL}/auth/staff/me`, {
    headers: { Authorization: `Bearer ${response.data.token}` }
  });
  
  if (!authResponse.data.user) {
    throw new Error('Authenticated endpoint failed');
  }
  
  return response.data.token;
};

// Test 4: Staff Login (Educator)
const testEducatorLogin = async () => {
  const response = await axios.post(`${API_BASE_URL}/auth/staff/login`, {
    email: 'educator@rada.ke',
    password: 'educator123'
  });
  
  if (!response.data.token || !response.data.user) {
    throw new Error('Educator login failed');
  }
  
  if (response.data.user.role !== 'educator') {
    throw new Error('Wrong role assigned');
  }
  
  return response.data.token;
};

// Test 5: Staff Login (Moderator)
const testModeratorLogin = async () => {
  const response = await axios.post(`${API_BASE_URL}/auth/staff/login`, {
    email: 'moderator@rada.ke',
    password: 'moderator123'
  });
  
  if (!response.data.token || !response.data.user) {
    throw new Error('Moderator login failed');
  }
  
  if (response.data.user.role !== 'moderator') {
    throw new Error('Wrong role assigned');
  }
  
  return response.data.token;
};

// Test 6: Rate Limiting
const testRateLimiting = async () => {
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      axios.post(`${API_BASE_URL}/auth/staff/login`, {
        email: 'test@test.com',
        password: 'wrongpassword'
      }).catch(err => err.response)
    );
  }
  
  const responses = await Promise.all(promises);
  const rateLimited = responses.some(res => res.status === 429);
  
  if (!rateLimited) {
    throw new Error('Rate limiting not working');
  }
};

// Test 7: Database Tables Check
const testDatabaseTables = async () => {
  // This would require a database connection
  // For now, we'll test by checking if the API responds correctly
  const response = await axios.get(`${API_BASE_URL}/health`);
  if (response.data.database !== 'connected') {
    throw new Error('Database not connected');
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Enhanced User Role System Tests\n');
  
  await runTest('Health Check', testHealthCheck);
  await runTest('Global Logout', testGlobalLogout);
  await runTest('Staff Login (Admin)', testStaffLogin);
  await runTest('Staff Login (Educator)', testEducatorLogin);
  await runTest('Staff Login (Moderator)', testModeratorLogin);
  await runTest('Rate Limiting', testRateLimiting);
  await runTest('Database Connection', testDatabaseTables);
  
  // Print results
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Detailed Results:');
  testResults.tests.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${test.name}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Your enhanced user role system is working perfectly!');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
};

// Run the tests
runAllTests().catch(console.error);
