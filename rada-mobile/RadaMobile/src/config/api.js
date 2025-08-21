// API Configuration
const API_CONFIG = {
  // Development settings
  development: {
    baseURL: 'http://localhost:5001',
    timeout: 10000,
    retryAttempts: 3,
  },
  
  // Production settings (update with your production server URL)
  production: {
    baseURL: 'https://your-production-server.com',
    timeout: 15000,
    retryAttempts: 2,
  },
  
  // Test settings
  test: {
    baseURL: 'http://localhost:5001',
    timeout: 5000,
    retryAttempts: 1,
  }
};

// Get current environment
const getEnvironment = () => {
  if (__DEV__) {
    return 'development';
  }
  // You can add logic here to detect production vs test
  return 'development';
};

// Export current config
export const currentConfig = API_CONFIG[getEnvironment()];

// Export all configs for testing
export default API_CONFIG;
