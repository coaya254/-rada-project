import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001'; // Using localhost for development

// Enhanced API configuration with better error handling
const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for mobile
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Don't reject if status is not 2xx
  }
};

const apiService = axios.create(API_CONFIG);

// Content API methods
const getPosts = () => apiService.get('/api/content/feed');
const createPost = (postData) => apiService.post('/api/content/posts', postData);
const likePost = (postId, isLiked) => apiService.post(`/api/content/posts/${postId}/like`, { isLiked });
const commentOnPost = (postId, comment) => apiService.post(`/api/content/posts/${postId}/comments`, { comment });
const bookmarkPost = (postId, isBookmarked) => apiService.post(`/api/content/posts/${postId}/bookmark`, { isBookmarked });
const sharePost = (postId) => apiService.post(`/api/content/posts/${postId}/share`);

// Comment interaction methods
const likeComment = (commentId, isLiked) => apiService.post(`/api/comments/${commentId}/like`, { isLiked });
const replyToComment = (postId, comment, parentCommentId) => apiService.post(`/api/content/posts/${postId}/comments`, { 
  comment: comment, 
  parent_comment_id: parentCommentId 
});

// Global variable to store current user data
let currentUser = null;
let authToken = null;

// Function to set current user data for the interceptor
const setCurrentUser = (user) => {
  console.log('🔍 setCurrentUser called with:', user);
  currentUser = user;
  console.log('🔍 currentUser updated to:', currentUser);
};

// Function to set auth token
const setToken = (token) => {
  console.log('🔍 setToken called with:', token ? 'Token provided' : 'No token');
  authToken = token;
  if (token) {
    apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiService.defaults.headers.common['Authorization'];
  }
};

// Request interceptor to add auth headers
apiService.interceptors.request.use(
  (config) => {
    console.log('🔍 API Request Interceptor - Current User:', currentUser);
    console.log('🔍 API Request Interceptor - Auth Token:', authToken ? 'Present' : 'Not present');
    console.log('🔍 API Request Interceptor - Base URL:', config.baseURL);
    console.log('🔍 API Request Interceptor - URL:', config.url);
    console.log('🔍 API Request Interceptor - Full URL:', `${config.baseURL}${config.url}`);
    
    // Add JWT token if available
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
      console.log('🔍 API Request Interceptor - JWT token added');
    }
    
    // Add user headers if user data is available
    if (currentUser && currentUser.uuid) {
      config.headers['x-user-uuid'] = currentUser.uuid;
      if (currentUser.role) {
        config.headers['x-user-role'] = currentUser.role;
      }
      console.log('🔍 API Request Interceptor - User headers added:', {
        'x-user-uuid': currentUser.uuid,
        'x-user-role': currentUser.role || 'user'
      });
    } else {
      console.log('🔍 API Request Interceptor - No user data available for headers');
    }
    
    console.log('🔍 API Request Interceptor - Final headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor for better error handling
apiService.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      data: error.response?.data
    });
    
    // Enhanced error handling for different scenarios
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data
      console.log('🔐 Unauthorized access - clearing auth data');
      setToken(null);
      setCurrentUser(null);
    } else if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      console.log('🚫 Forbidden - insufficient permissions');
    } else if (error.response?.status >= 500) {
      // Server error
      console.log('🔥 Server error - backend issue');
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      // Network error
      console.log('🌐 Network error - check connection');
    }
    
    return Promise.reject(error);
  }
);

// Learning API methods
const getModules = () => apiService.get('/api/learning/modules');
const getModule = (moduleId) => apiService.get(`/api/learning/modules/${moduleId}`);
const getChallenges = () => apiService.get('/api/learning/challenges');
const getBadges = () => apiService.get('/api/learning/badges');
const getUserStats = (userId) => apiService.get(`/api/learning/stats/${userId}`);
const getUserLearningStats = () => apiService.get('/api/learning/user-stats');
const getLessons = (moduleId) => apiService.get(`/api/learning/modules/${moduleId}/lessons`);
const getLesson = (lessonId) => apiService.get(`/api/learning/lessons/${lessonId}`);

const updateLessonProgress = (progressData) => apiService.post('/api/learning/progress', progressData);
const getUserProgress = (userId) => apiService.get(`/api/learning/user-progress/${userId}`);

// Profile API methods
const getUserProfile = (uuid) => apiService.get(`/api/users/${uuid}/profile`);
const getUserActivity = (uuid, limit = 10) => apiService.get(`/api/users/${uuid}/activity?limit=${limit}`);
const getUserSavedItems = (uuid) => apiService.get(`/api/users/${uuid}/saved`);
const updateUserProfile = (uuid, profileData) => apiService.put(`/api/users/${uuid}/profile`, profileData);

// Enhanced Admin API methods
const adminLogin = (email, password) => apiService.post('/api/auth/login', { email, password });
const adminLogout = () => apiService.post('/api/auth/logout');
const getAdminDashboard = () => apiService.get('/api/admin/dashboard/overview');
const getAdminUsers = () => apiService.get('/api/admin/users');
const getAdminContent = () => apiService.get('/api/admin/content');

// Enhanced Admin Features
const getModerationQueue = (status = 'pending', priority = null, page = 1, limit = 20) => {
  const params = { status, page, limit };
  if (priority) params.priority = priority;
  return apiService.get('/api/moderation/queue', { params });
};

const approveContent = (contentId, reviewNotes = '') => 
  apiService.put(`/api/moderation/approve/${contentId}`, { reviewNotes });

const rejectContent = (contentId, reviewNotes = '', reason = '') => 
  apiService.put(`/api/moderation/reject/${contentId}`, { reviewNotes, reason });

const escalateContent = (contentId, reason = '') => 
  apiService.post(`/api/moderation/escalate/${contentId}`, { reason });

const getModerationStats = () => apiService.get('/api/moderation/stats');

// Trust Score Management
const getTrustLeaderboard = () => apiService.get('/api/trust/leaderboard');
const updateTrustScore = (userUuid, eventType, trustChange, reason) => 
  apiService.post('/api/trust/event', { userUuid, eventType, trustChange, reason });

// User Management
const getUserProfileStats = (uuid) => apiService.get(`/api/users/stats/${uuid}`);
const syncUser = (userData) => apiService.post('/api/users/sync', { user });
const getUsers = (page = 1, limit = 20, role = null) => {
  const params = { page, limit };
  if (role) params.role = role;
  return apiService.get('/api/admin/users', { params });
};

// Content Management
const getContentFeed = (page = 1, limit = 20, category = null, location = null) => {
  const params = { page, limit };
  if (category) params.category = category;
  if (location) params.location = location;
  return apiService.get('/api/posts', { params });
};

const flagContent = (contentId, reason) => apiService.post(`/api/posts/${contentId}/flag`, { reason });

// Learning System
const getLearningModules = () => apiService.get('/api/learning/modules');
const getLearningLessons = (moduleId) => apiService.get(`/api/learning/modules/${moduleId}/lessons`);
const getLearningQuizzes = () => apiService.get('/api/learning/quizzes');
const getLearningChallenges = () => apiService.get('/api/learning/challenges');
const getLearningBadges = () => apiService.get('/api/learning/badges');

// Analytics
const getPlatformAnalytics = () => apiService.get('/api/analytics/platform');
const getUserAnalytics = (uuid) => apiService.get(`/api/analytics/user/${uuid}`);

// Polls System
const getActivePolls = () => apiService.get('/api/polls/active');
const votePoll = (pollId, voteOption, county) => 
  apiService.post(`/api/polls/${pollId}/vote`, { vote_option: voteOption, county });

// Memory Archive
const getMemoryArchive = (limit = 10) => apiService.get(`/api/memory?limit=${limit}`);
const lightCandle = (memoryId) => apiService.post(`/api/memory/${memoryId}/candle`);

// Admin Content Management API methods
const getAdminContentModules = () => apiService.get('/api/admin/content/modules');
const getAdminContentLessons = () => apiService.get('/api/admin/content/lessons');
const getAdminContentQuizzes = () => apiService.get('/api/admin/content/quizzes');
const getAdminContentChallenges = () => apiService.get('/api/admin/content/challenges');
const getAdminContentBadges = () => apiService.get('/api/admin/content/badges');

// Publishing Workflow API methods
const submitForReview = (type, id, reviewNotes) => apiService.post(`/api/admin/content/${type}/${id}/submit-for-review`, { review_notes: reviewNotes });
const publishContent = (type, id) => apiService.post(`/api/admin/content/${type}/${id}/publish`);

// Content Creation API methods
const createContent = (formData) => {
  const data = new FormData();
  
  // Add text fields
  Object.keys(formData).forEach(key => {
    if (key !== 'media_files' && formData[key] !== undefined && formData[key] !== null) {
      data.append(key, formData[key]);
    }
  });
  
  // Add media files if any
  if (formData.media_files && formData.media_files.length > 0) {
    formData.media_files.forEach((file, index) => {
      data.append('media_files', file);
    });
  }
  
  return apiService.post('/api/content/create', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const getUserContent = (userId, page = 1, limit = 10, status = null) => {
  const params = { page, limit };
  if (status) params.status = status;
  return apiService.get(`/api/content/user/${userId}`, { params });
};

// Reddit-style voting system
const voteContent = (contentId, userId, voteType) => apiService.post(`/api/content/${contentId}/vote`, { userId, voteType });
const upvoteContent = (contentId, userId) => voteContent(contentId, userId, 'upvote');
const downvoteContent = (contentId, userId) => voteContent(contentId, userId, 'downvote');
const removeVote = (contentId, userId) => voteContent(contentId, userId, 'remove');

const commentOnContent = (contentId, userId, comment, isAnonymous = false) => 
  apiService.post(`/api/content/${contentId}/comment`, { userId, comment, is_anonymous: isAnonymous });

// Generic HTTP methods
const post = (url, data) => apiService.post(url, data);
const get = (url) => apiService.get(url);
const put = (url, data) => apiService.put(url, data);
const del = (url) => apiService.delete(url);

// Auth API methods
const userLogin = (credentials) => apiService.post('/api/users/login', credentials);
const userRegister = (userData) => apiService.post('/api/users/create', userData);
const checkUsername = (username) => apiService.post('/api/users/check-username', { username });

// Content Management API methods
const createModule = (moduleData) => apiService.post('/api/admin/modules', moduleData);
const updateModule = (moduleId, moduleData) => apiService.put(`/api/admin/modules/${moduleId}`, moduleData);
const deleteModule = (moduleId) => apiService.delete(`/api/admin/modules/${moduleId}`);

const createLesson = (lessonData) => apiService.post('/api/admin/lessons', lessonData);
const updateLesson = (lessonId, lessonData) => apiService.put(`/api/admin/lessons/${lessonId}`, lessonData);
const deleteLesson = (lessonId) => apiService.delete(`/api/admin/lessons/${lessonId}`);

const createQuiz = (quizData) => apiService.post('/api/admin/quizzes', quizData);
const updateQuiz = (quizId, quizData) => apiService.put(`/api/admin/quizzes/${quizId}`, quizData);
const deleteQuiz = (quizId) => apiService.delete(`/api/admin/quizzes/${quizId}`);

const createChallenge = (challengeData) => apiService.post('/api/admin/challenges', challengeData);
const updateChallenge = (challengeId, challengeData) => apiService.put(`/api/admin/challenges/${challengeId}`, challengeData);
const deleteChallenge = (challengeId) => apiService.delete(`/api/admin/challenges/${challengeId}`);

const createBadge = (badgeData) => apiService.post('/api/admin/badges', badgeData);
const updateBadge = (badgeId, badgeData) => apiService.put(`/api/admin/badges/${badgeId}`, badgeData);
const deleteBadge = (badgeId) => apiService.delete(`/api/admin/badges/${badgeId}`);

// Export all methods
export default {
  // Learning methods
  getModules,
  getModule,
  getChallenges,
  getBadges,
  getUserStats,
  getUserLearningStats,
  getLessons,
  getLesson,
  updateLessonProgress,
  getUserProgress,
  
  // Enhanced Learning methods
  getLearningModules,
  getLearningLessons,
  getLearningQuizzes,
  getLearningChallenges,
  getLearningBadges,
  
  // Profile methods
  getUserProfile,
  getUserActivity,
  getUserSavedItems,
  updateUserProfile,
  
  // Enhanced Admin methods
  adminLogin,
  adminLogout,
  getAdminDashboard,
  getAdminUsers,
  getAdminContent,
  
  // Enhanced Admin Features
  getModerationQueue,
  approveContent,
  rejectContent,
  escalateContent,
  getModerationStats,
  
  // Trust Score Management
  getTrustLeaderboard,
  updateTrustScore,
  
  // User Management
  getUsers,
  syncUser,
  getUserProfileStats,
  
  // Content Management
  getContentFeed,
  flagContent,
  
  // Analytics
  getPlatformAnalytics,
  getUserAnalytics,
  
  // Polls System
  getActivePolls,
  votePoll,
  
  // Memory Archive
  getMemoryArchive,
  lightCandle,
  
  // Admin Content Management methods
  getAdminContentModules,
  getAdminContentLessons,
  getAdminContentQuizzes,
  getAdminContentChallenges,
  getAdminContentBadges,
  
  // Publishing Workflow methods
  submitForReview,
  publishContent,
  
  // Content Creation methods
  createContent,
  getUserContent,
  
  // Reddit-style voting methods
  voteContent,
  upvoteContent,
  downvoteContent,
  removeVote,
  
  commentOnContent,
  
  // Auth methods
  userLogin,
  userRegister,
  checkUsername,
  
  // Generic HTTP methods
  post,
  get,
  put,
  delete: del,
  
  // Content Management methods
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  createBadge,
  updateBadge,
  deleteBadge,
  
  // Content methods
  getPosts,
  likePost,
  commentOnPost,
  bookmarkPost,
  sharePost,
  
  // Comment interaction methods
  likeComment,
  replyToComment,
  
  // Raw axios instance for custom requests
  axios: apiService,
  setCurrentUser,
  setToken
};
