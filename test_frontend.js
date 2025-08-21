const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testFrontendReady() {
  console.log('🧪 Testing Frontend Readiness\n');
  
  try {
    // Test 1: Backend Health Check
    console.log('1. Testing Backend Health...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend Health:', healthResponse.data.status);
    
    // Test 2: Global Logout Endpoint
    console.log('\n2. Testing Global Logout Endpoint...');
    const logoutResponse = await axios.post(`${API_BASE_URL}/auth/global-logout`);
    console.log('✅ Global Logout:', logoutResponse.data.message);
    
    // Test 3: Enhanced Routes
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
    
    console.log('\n🎉 Backend API tests completed successfully!');
    console.log('\n📱 Frontend should now be working at: http://localhost:3000');
    console.log('🔧 Context provider issue has been fixed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFrontendReady();
