// Real API service for connecting to the existing backend
import { currentConfig } from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = currentConfig.baseURL;
    this.timeout = currentConfig.timeout;
    this.retryAttempts = currentConfig.retryAttempts;
    this.token = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
  }

  // Get auth headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options,
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // =====================================================
  // AUTHENTICATION ENDPOINTS
  // =====================================================

  // User login
  async login(email, password) {
    return this.post('/api/auth/login', { email, password });
  }

  // User registration
  async register(userData) {
    return this.post('/api/auth/register', userData);
  }

  // Anonymous user creation
  async createAnonymousUser(userData) {
    return this.post('/api/users/create', userData);
  }

  // Get current user
  async getCurrentUser() {
    return this.get('/api/auth/me');
  }

  // =====================================================
  // LEARNING ENDPOINTS
  // =====================================================

  // Get all learning modules
  async getModules() {
    return this.get('/api/learning/modules');
  }

  // Get specific module
  async getModule(moduleId) {
    return this.get(`/api/learning/modules/${moduleId}`);
  }

  // Get module lessons
  async getModuleLessons(moduleId) {
    return this.get(`/api/learning/modules/${moduleId}/lessons`);
  }

  // Get all quizzes
  async getQuizzes() {
    return this.get('/api/learning/quizzes');
  }

  // Get specific quiz
  async getQuiz(quizId) {
    return this.get(`/api/learning/quizzes/${quizId}`);
  }

  // Get challenges
  async getChallenges() {
    return this.get('/api/learning/challenges');
  }

  // Get badges
  async getBadges() {
    return this.get('/api/learning/badges');
  }

  // Get user learning stats
  async getUserLearningStats(userId) {
    return this.get(`/api/learning/stats/${userId}`);
  }

  // Get user progress
  async getUserProgress(userId) {
    return this.get(`/api/learning/user-progress/${userId}`);
  }

  // Update module progress
  async updateModuleProgress(userId, moduleId, progressData) {
    return this.put(`/api/learning/progress/${userId}/${moduleId}`, progressData);
  }

  // Submit quiz attempt
  async submitQuizAttempt(attemptData) {
    return this.post('/api/learning/quiz-attempt', attemptData);
  }

  // Join challenge
  async joinChallenge(challengeId, userId) {
    return this.post(`/api/learning/challenges/${challengeId}/join`, { userId });
  }

  // =====================================================
  // USER PROFILE ENDPOINTS
  // =====================================================

  // Get user profile
  async getUserProfile(userId) {
    return this.get(`/api/users/${userId}`);
  }

  // Update user profile
  async updateUserProfile(userId, profileData) {
    return this.put(`/api/users/${userId}/profile`, profileData);
  }

  // Get user achievements
  async getUserAchievements(userId) {
    return this.get(`/api/users/${userId}/achievements`);
  }

  // Get user badges
  async getUserBadges(userId) {
    return this.get(`/api/users/${userId}/badges`);
  }

  // =====================================================
  // COMMUNITY ENDPOINTS
  // =====================================================

  // Get community posts
  async getCommunityPosts() {
    return this.get('/api/posts');
  }

  // Create community post
  async createCommunityPost(postData) {
    return this.post('/api/posts', postData);
  }

  // Get honor wall items
  async getHonorWallItems() {
    return this.get('/api/posts');
  }

  // Get promise tracker items
  async getPromiseTrackerItems() {
    return this.get('/api/promises');
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  // Check if server is available
  async checkServerHealth() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  }

  // Handle offline mode
  async handleOfflineMode() {
    // Return cached data or fallback data
    return {
      modules: [
        {
          id: 1,
          title: 'Kenyan Government 101',
          category: 'government',
          description: 'Learn about the structure and functions of the Kenyan government.',
          estimated_duration: 15,
          difficulty: 'Beginner',
          xp_reward: 50,
          lesson_count: 5,
          is_featured: true,
          image: '🏛️',
        },
        {
          id: 2,
          title: 'Citizen Rights & Responsibilities',
          category: 'rights',
          description: 'Understand your rights as a Kenyan citizen and your civic responsibilities.',
          estimated_duration: 20,
          difficulty: 'Intermediate',
          xp_reward: 75,
          lesson_count: 7,
          is_featured: false,
          image: '⚖️',
        }
      ],
      quizzes: [
        {
          id: 1,
          title: 'Government Structure Quiz',
          description: 'Test your knowledge of Kenya\'s government structure',
          difficulty: 'Beginner',
          xp_reward: 25,
          timeLimit: 300,
          passingScore: 80,
          question_count: 3,
          image: '🧠',
        }
      ],
      challenges: [
        {
          id: 1,
          title: 'Community Hero',
          description: 'Complete 5 learning modules in one week',
          duration: '7 days',
          difficulty: 'Intermediate',
          xp_reward: 100,
          participants: 45,
          deadline: '2024-01-15',
          image: '🎯',
        }
      ],
      badges: [
        {
          id: 1,
          title: 'First Steps',
          description: 'Complete your first learning module',
          icon: '🌟',
          xp_reward: 10,
          is_earned: true,
          earned_date: '2024-01-10',
        }
      ],
      userStats: {
        completed_modules: 2,
        quizzes_completed: 1,
        challenges_participated: 1,
        total_xp: 150,
        learning_streak: 5,
      },
      userProgress: {
        modules: [
          {
            module_id: 1,
            progress_percentage: 60,
            completed_lessons: 3,
            is_completed: false,
          }
        ]
      },
    };
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
