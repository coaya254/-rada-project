// src/utils/adminAuth.js

/**
 * Authenticate admin user with backend API
 * @param {string} username - Admin username/email
 * @param {string} password - Admin password
 * @returns {Object} Authentication result
 */
export const authenticateAdmin = async (username, password) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('adminToken', data.token);
        sessionStorage.setItem('adminUser', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Check if admin is currently authenticated
   * @returns {boolean} Authentication status
   */
  export const isAdminAuthenticated = () => {
    const token = sessionStorage.getItem('adminToken');
    // In production, verify token with backend
    return !!token;
  };
  
  /**
   * Get current admin user info
   * @returns {Object|null} User object or null
   */
  export const getCurrentAdmin = () => {
    const userJson = sessionStorage.getItem('adminUser');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        return null;
      }
    }
    return null;
  };
  
  /**
   * Log out admin user
   */
  export const logoutAdmin = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
  };
  
  /**
   * Refresh admin token
   * @returns {Object} Refresh result
   */
  export const refreshAdminToken = async () => {
    try {
      const currentToken = sessionStorage.getItem('adminToken');
      
      const response = await fetch('/api/admin/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('adminToken', data.token);
        return { success: true };
      }
      
      return { success: false, error: 'Token refresh failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Setup auto-logout on inactivity
   * @param {number} timeoutMinutes - Minutes of inactivity before logout
   * @param {function} onLogout - Callback function when logged out
   */
  export const setupInactivityTimeout = (timeoutMinutes = 30, onLogout) => {
    let inactivityTimeout;
  
    const resetTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        logoutAdmin();
        if (onLogout) onLogout();
      }, timeoutMinutes * 60 * 1000);
    };
  
    // Reset timer on user activity
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('keypress', resetTimer);
    document.addEventListener('click', resetTimer);
    document.addEventListener('scroll', resetTimer);
  
    // Initial timer
    resetTimer();
  
    // Return cleanup function
    return () => {
      clearTimeout(inactivityTimeout);
      document.removeEventListener('mousemove', resetTimer);
      document.removeEventListener('keypress', resetTimer);
      document.removeEventListener('click', resetTimer);
      document.removeEventListener('scroll', resetTimer);
    };
  };
  
  /**
   * Sanitize user input to prevent XSS
   * @param {string} input - User input string
   * @returns {string} Sanitized string
   */
  export const sanitizeInput = (input) => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  };
  
  /**
   * Validate admin permissions
   * @param {string} requiredRole - Required role for action
   * @returns {boolean} Permission status
   */
  export const hasPermission = (requiredRole) => {
    const user = getCurrentAdmin();
    if (!user) return false;
    
    // Add your role hierarchy logic here
    const roleHierarchy = {
      'superadmin': 3,
      'admin': 2,
      'moderator': 1,
      'editor': 0
    };
    
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  };