import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://rada.ke/api' 
  : 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed in the future
    const token = localStorage.getItem('rada_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle different error statuses
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear local storage
          localStorage.removeItem('rada_auth_token');
          localStorage.removeItem('rada_user_uuid');
          break;
        case 429:
          // Rate limited
          console.warn('Rate limited. Please slow down your requests.');
          break;
        case 500:
          console.error('Server error. Please try again later.');
          break;
        default:
          console.error(`API Error ${status}:`, data?.message || error.message);
      }
    } else if (error.request) {
      console.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // User endpoints
  users: {
    create: () => '/users/create',
    get: (uuid) => `/users/${uuid}`,
    updateXP: (uuid) => `/users/${uuid}/xp`
  },
  
  // Posts endpoints
  posts: {
    list: () => '/posts',
    create: () => '/posts',
    get: (id) => `/posts/${id}`,
    like: (id) => `/posts/${id}/like`,
    unlike: (id) => `/posts/${id}/like`,
    comment: (id) => `/posts/${id}/comments`,
    checkLike: (id, uuid) => `/posts/${id}/liked/${uuid}`
  },
  
  // Learning endpoints
  learning: {
    modules: () => '/learning/modules',
    module: (id) => `/learning/modules/${id}`,
    progress: (uuid) => `/learning/progress/${uuid}`,
    quiz: (id) => `/learning/quiz/${id}`,
    submitQuiz: (id) => `/learning/quiz/${id}/submit`
  },
  
  // Memory archive endpoints
  memory: {
    list: () => '/memory',
    create: () => '/memory',
    candle: (id) => `/memory/${id}/candle`
  },
  
  // Promise tracker endpoints
  promises: {
    list: () => '/promises',
    create: () => '/promises',
    get: (id) => `/promises/${id}`,
    evidence: (id) => `/promises/${id}/evidence`
  },
  
  // Polls endpoints
  polls: {
    active: () => '/polls/active',
    vote: (id) => `/polls/${id}/vote`,
    results: (id) => `/polls/${id}/results`
  },
  
  // Youth groups endpoints
  youthGroups: {
    list: () => '/youth-groups',
    create: () => '/youth-groups',
    get: (id) => `/youth-groups/${id}`
  },
  
  // Admin endpoints
  admin: {
    pendingPosts: () => '/admin/pending-posts',
    verifyPost: (id) => `/admin/posts/${id}/verify`,
    dashboard: () => '/admin/dashboard'
  }
};

// Utility functions for common API operations
export const apiUtils = {
  // Upload file with progress
  uploadFile: async (file, onProgress = null) => {
    const formData = new FormData();
    formData.append('media', file);
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }
    
    return api.post('/upload', formData, config);
  },
  
  // Get paginated results
  getPaginated: async (endpoint, page = 1, limit = 20, filters = {}) => {
    const params = {
      offset: (page - 1) * limit,
      limit,
      ...filters
    };
    
    return api.get(endpoint, { params });
  },
  
  // Search functionality
  search: async (query, type = 'all', filters = {}) => {
    const params = {
      q: query,
      type,
      ...filters
    };
    
    return api.get('/search', { params });
  }
};

// Export default api instance
export default api;