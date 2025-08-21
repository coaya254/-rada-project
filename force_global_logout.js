const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5001/api';

async function forceGlobalLogout() {
  try {
    console.log('🔐 Initiating global logout...');
    
    // Call the global logout endpoint
    const response = await axios.post(`${API_BASE_URL}/auth/global-logout`);
    
    if (response.data.message) {
      console.log('✅ Success:', response.data.message);
      console.log('⏰ Timestamp:', response.data.timestamp);
      console.log('\n🎉 All users have been successfully logged out!');
      console.log('📱 Users will need to re-authenticate on their next visit.');
    }
    
  } catch (error) {
    console.error('❌ Error during global logout:', error.message);
    if (error.response) {
      console.error('Server response:', error.response.data);
    }
  }
}

// Execute the global logout
forceGlobalLogout();
