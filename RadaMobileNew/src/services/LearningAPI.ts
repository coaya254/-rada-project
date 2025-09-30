import axios from 'axios';

// Clean API configuration
const API_CONFIG = {
  baseURL: 'http://localhost:3001/api', // Use localhost for development
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Create axios instance
const apiClient = axios.create(API_CONFIG);

// Request interceptor for logging and auth
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response.data;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Learning API Service
export class LearningAPI {
  // Modules
  static async getModules() {
    return apiClient.get('/learning/modules');
  }

  static async getModule(id: string) {
    return apiClient.get(`/learning/modules/${id}`);
  }

  // Quizzes
  static async getQuizzes() {
    return apiClient.get('/learning/quizzes');
  }

  static async getQuiz(id: string) {
    return apiClient.get(`/learning/quizzes/${id}`);
  }

  static async submitQuizAttempt(quizId: string, answers: any) {
    return apiClient.post('/learning/quiz-attempt', {
      quiz_id: quizId,
      answers
    });
  }

  // Challenges
  static async getChallenges() {
    return apiClient.get('/learning/challenges');
  }

  static async joinChallenge(challengeId: string) {
    return apiClient.post(`/learning/challenges/${challengeId}/join`);
  }

  // Badges
  static async getBadges() {
    return apiClient.get('/learning/badges');
  }

  // User Progress
  static async getUserProgress(userId: string) {
    return apiClient.get(`/learning/user-progress/${userId}`);
  }

  static async updateProgress(userId: string, moduleId: string, progress: any) {
    return apiClient.put(`/learning/progress/${userId}/${moduleId}`, progress);
  }

  static async getUserStats(userId: string) {
    return apiClient.get(`/learning/stats/${userId}`);
  }
}

export default LearningAPI;
