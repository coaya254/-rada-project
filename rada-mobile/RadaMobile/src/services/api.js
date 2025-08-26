import axios from 'axios';

const API_BASE_URL = 'http://192.168.100.41:5001';

const apiService = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global variable to store current user data
let currentUser = null;

// Function to set current user data for the interceptor
const setCurrentUser = (user) => {
  console.log('🔍 setCurrentUser called with:', user);
  currentUser = user;
  console.log('🔍 currentUser updated to:', currentUser);
};

// Request interceptor to add auth headers
apiService.interceptors.request.use(
  (config) => {
    console.log('🔍 API Request Interceptor - Current User:', currentUser);
    console.log('🔍 API Request Interceptor - Base URL:', config.baseURL);
    console.log('🔍 API Request Interceptor - URL:', config.url);
    console.log('🔍 API Request Interceptor - Full URL:', `${config.baseURL}${config.url}`);
    
    // Add authentication headers if user data is available
    if (currentUser && currentUser.uuid && currentUser.role) {
      config.headers['x-user-uuid'] = currentUser.uuid;
      config.headers['x-user-role'] = currentUser.role;
      console.log('🔍 API Request Interceptor - Headers added:', {
        'x-user-uuid': currentUser.uuid,
        'x-user-role': currentUser.role
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

// Response interceptor for error handling
apiService.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
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
const getLessons = (moduleId) => apiService.get(`/api/learning/lessons/${moduleId}`);
const getUserProgress = (userId) => apiService.get(`/api/learning/user-progress/${userId}`);

// Admin API methods
const adminLogin = (email, password) => apiService.post('/api/admin/login', { email, password });
const getAdminDashboard = () => apiService.get('/api/admin/dashboard');
const getAdminUsers = () => apiService.get('/api/admin/users');
const getAdminContent = () => apiService.get('/api/admin/content');

// Admin Content Management API methods
const getAdminContentModules = () => apiService.get('/api/admin/content/modules');
const getAdminContentLessons = () => apiService.get('/api/admin/content/lessons');
const getAdminContentQuizzes = () => apiService.get('/api/admin/content/quizzes');
const getAdminContentChallenges = () => apiService.get('/api/admin/content/challenges');
const getAdminContentBadges = () => apiService.get('/api/admin/content/badges');

// Publishing Workflow API methods
const submitForReview = (type, id, reviewNotes) => apiService.post(`/api/admin/content/${type}/${id}/submit-for-review`, { review_notes: reviewNotes });
const approveContent = (type, id, reviewNotes) => apiService.post(`/api/admin/content/${type}/${id}/approve`, { review_notes: reviewNotes });
const rejectContent = (type, id, reviewNotes) => apiService.post(`/api/admin/content/${type}/${id}/reject`, { review_notes: reviewNotes });
const publishContent = (type, id) => apiService.post(`/api/admin/content/${type}/${id}/publish`);
const getModerationQueue = (status = 'review', type = null) => {
  const params = type ? { status, type } : { status };
  return apiService.get('/api/admin/moderation/queue', { params });
};
const getModerationStats = () => apiService.get('/api/admin/moderation/stats');

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

const getContentFeed = (page = 1, limit = 20, category = null, location = null) => {
  const params = { page, limit };
  if (category) params.category = category;
  if (location) params.location = location;
  return apiService.get('/api/content/feed', { params });
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
const userLogin = (credentials) => apiService.post('/api/auth/login', credentials);
const userRegister = (userData) => apiService.post('/api/auth/register', userData);

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
  getUserProgress,
  
  // Admin methods
  adminLogin,
  getAdminDashboard,
  getAdminUsers,
  getAdminContent,
  
  // Admin Content Management methods
  getAdminContentModules,
  getAdminContentLessons,
  getAdminContentQuizzes,
  getAdminContentChallenges,
  getAdminContentBadges,
  
  // Publishing Workflow methods
  submitForReview,
  approveContent,
  rejectContent,
  publishContent,
  getModerationQueue,
  getModerationStats,
  
  // Content Creation methods
  createContent,
  getUserContent,
  getContentFeed,
  
  // Reddit-style voting methods
  voteContent,
  upvoteContent,
  downvoteContent,
  removeVote,
  
  commentOnContent,
  
  // Auth methods
  userLogin,
  userRegister,
  
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
  
  // Raw axios instance for custom requests
  axios: apiService,
  setCurrentUser
};
