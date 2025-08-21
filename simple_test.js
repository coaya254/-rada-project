const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function simpleTest() {
  console.log('🧪 Running Simple API Tests\n');
  
  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.status);
    
    // Test 2: Global Logout
    console.log('\n2. Testing Global Logout...');
    const logoutResponse = await axios.post(`${API_BASE_URL}/auth/global-logout`);
    console.log('✅ Global Logout:', logoutResponse.data.message);
    
    // Test 3: Check if enhanced routes are loaded
    console.log('\n3. Testing Enhanced Routes...');
    try {
      const enhancedResponse = await axios.get(`${API_BASE_URL}/auth/staff/me`);
      console.log('❌ Should have failed with 401, but got:', enhancedResponse.status);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Enhanced routes working (401 Unauthorized expected)');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    console.log('\n🎉 Basic tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

simpleTest();
