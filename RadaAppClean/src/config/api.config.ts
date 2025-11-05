// config/api.config.ts

import { Platform } from 'react-native';

// Environment detection
const __DEV__ = process.env.NODE_ENV === 'development';

// API Configuration
export const API_CONFIG = {
  // Base URLs
  baseURL: __DEV__
    ? 'http://localhost:5000'
    : 'https://your-production-api.com',
  
  // API version
  version: 'v1',
  
  // Timeouts (in milliseconds)
  timeout: 30000, // 30 seconds
  uploadTimeout: 120000, // 2 minutes for file uploads
  
  // Request configuration
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // File upload configuration
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4'],
  },
  
  // Cache configuration
  cache: {
    enabled: true,
    ttl: 300, // 5 minutes default
  },
  
  // Retry configuration
  retry: {
    enabled: true,
    maxAttempts: 3,
    initialDelay: 1000, // 1 second
  },
  
  // Helper methods
  getFullURL: (path: string): string => {
    // If path already has full URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    return `${API_CONFIG.baseURL}/${cleanPath}`;
  },
  
  getAPIURL: (endpoint: string): string => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/${cleanEndpoint}`;
  },
  
  getUploadURL: (): string => {
    return `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/upload`;
  },
  
  // Platform-specific adjustments
  getLocalURL: (): string => {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000'; // Android emulator
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:5000'; // iOS simulator
    } else {
      return 'http://localhost:5000'; // Web/Desktop
    }
  },
};

// Environment-specific overrides
if (__DEV__) {
  API_CONFIG.baseURL = API_CONFIG.getLocalURL();
  console.log('[API Config] Development mode - Using:', API_CONFIG.baseURL);
}

// Endpoints registry
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Learning
  LEARNING: {
    MODULES: '/learning/modules',
    MODULE_BY_ID: (id: number) => `/learning/modules/${id}`,
    LESSONS: '/learning/lessons',
    LESSON_BY_ID: (id: number) => `/learning/lessons/${id}`,
    COMPLETE_LESSON: (id: number) => `/learning/lessons/${id}/complete`,
    QUIZZES: '/learning/quizzes',
    QUIZ_BY_ID: (id: number) => `/learning/quizzes/${id}`,
    SUBMIT_QUIZ: (id: number) => `/learning/quizzes/${id}/submit`,
    USER_PROGRESS: '/learning/user/progress',
    ENROLLMENTS: '/learning/user/enrollments',
    ENROLL: (moduleId: number) => `/learning/modules/${moduleId}/enroll`,
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: '/admin/learning/dashboard/stats',
    ACTIVITY: '/admin/learning/dashboard/activity',
    MODULES: '/admin/learning/modules',
    MODULE_BY_ID: (id: number) => `/admin/learning/modules/${id}`,
    LESSONS: '/admin/learning/lessons',
    LESSON_BY_ID: (id: number) => `/admin/learning/lessons/${id}`,
    QUIZZES: '/admin/learning/quizzes',
    QUIZ_BY_ID: (id: number) => `/admin/learning/quizzes/${id}`,
    QUESTIONS: (quizId: number) => `/admin/learning/quizzes/${quizId}/questions`,
    QUESTION_BY_ID: (quizId: number, questionId: number) => 
      `/admin/learning/quizzes/${quizId}/questions/${questionId}`,
  },
  
  // Gamification
  GAMIFICATION: {
    LEADERBOARD: '/gamification/leaderboard',
    ACHIEVEMENTS: '/gamification/achievements',
    USER_ACHIEVEMENTS: '/gamification/user/achievements',
  },
  
  // File Upload
  UPLOAD: {
    IMAGE: '/upload/image',
    VIDEO: '/upload/video',
    DOCUMENT: '/upload/document',
  },
};

// Request helper
export const buildURL = (endpoint: string, params?: Record<string, any>): string => {
  const url = API_CONFIG.getAPIURL(endpoint);
  
  if (!params || Object.keys(params).length === 0) {
    return url;
  }
  
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  
  return `${url}?${queryString}`;
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

export default API_CONFIG;