import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000/api';

class LearningAPIService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ==================== MODULES ====================

  async getModules(filters?: {
    category?: string;
    difficulty?: string;
    search?: string;
    featured?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.featured !== undefined) params.append('featured', String(filters.featured));

    // Add cache-busting timestamp
    params.append('_t', Date.now().toString());

    const response = await this.api.get(`/learning/modules?${params}`);
    return response.data;
  }

  async getModuleById(id: number) {
    const response = await this.api.get(`/learning/modules/${id}`);
    return response.data;
  }

  async enrollInModule(moduleId: number) {
    const response = await this.api.post(`/learning/modules/${moduleId}/enroll`);
    return response.data;
  }

  // ==================== LESSONS ====================

  async getLessonById(id: number) {
    const response = await this.api.get(`/learning/lessons/${id}`);
    return response.data;
  }

  async completeLesson(lessonId: number, data?: { timeSpent?: number; notes?: string }) {
    const response = await this.api.post(`/learning/lessons/${lessonId}/complete`, data);
    return response.data;
  }

  // ==================== QUIZZES ====================

  async getQuizById(id: number) {
    const response = await this.api.get(`/learning/quizzes/${id}`);
    return response.data;
  }

  async submitQuiz(quizId: number, answers: Array<{ questionId: number; selectedAnswer: number }>, timeSpent: number) {
    const response = await this.api.post(`/learning/quizzes/${quizId}/complete`, {
      answers,
      timeSpent,
    });
    return response.data;
  }

  // ==================== PROGRESS ====================

  async getUserProgress() {
    const response = await this.api.get('/learning/progress');
    return response.data;
  }

  async getWeeklyActivity() {
    const response = await this.api.get('/learning/progress/weekly-activity');
    return response.data;
  }

  async getLeaderboard(period: 'weekly' | 'monthly' | 'all-time' = 'weekly', limit: number = 50) {
    const response = await this.api.get(`/learning/leaderboard?period=${period}&limit=${limit}`);
    return response.data;
  }

  // ==================== BOOKMARKS ====================

  async getBookmarks(type?: 'module' | 'lesson') {
    const params = type ? `?type=${type}` : '';
    const response = await this.api.get(`/learning/bookmarks${params}`);
    return response.data;
  }

  async addBookmark(contentType: 'module' | 'lesson', contentId: number) {
    const response = await this.api.post('/learning/bookmarks', {
      content_type: contentType,
      content_id: contentId,
    });
    return response.data;
  }

  async removeBookmark(bookmarkId: number) {
    const response = await this.api.delete(`/learning/bookmarks/${bookmarkId}`);
    return response.data;
  }

  // ==================== DAILY CHALLENGES ====================

  async getTodayChallenge() {
    const response = await this.api.get('/learning/challenges/today');
    return response.data;
  }

  async submitChallengeAttempt(
    challengeId: number,
    answers: Array<{ questionId: number; selectedAnswer: number }>,
    timeSpent: number
  ) {
    const response = await this.api.post(`/learning/challenges/${challengeId}/attempt`, {
      answers,
      timeSpent,
    });
    return response.data;
  }

  async getChallengeLeaderboard(challengeId: number, limit: number = 50) {
    const response = await this.api.get(`/learning/challenges/${challengeId}/leaderboard?limit=${limit}`);
    return response.data;
  }

  async getStreak() {
    const response = await this.api.get('/learning/challenges/streak');
    return response.data;
  }

  // ==================== LEARNING PATHS ====================

  async getLearningPaths(filters?: { category?: string; difficulty?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);

    const response = await this.api.get(`/learning/paths?${params}`);
    return response.data;
  }

  async getLearningPathById(id: number) {
    const response = await this.api.get(`/learning/paths/${id}`);
    return response.data;
  }

  async enrollInPath(pathId: number) {
    const response = await this.api.post(`/learning/paths/${pathId}/enroll`);
    return response.data;
  }

  async getPathProgress(pathId: number) {
    const response = await this.api.get(`/learning/paths/${pathId}/progress`);
    return response.data;
  }


  // ==================== ACHIEVEMENTS ====================

  async getAchievements() {
    const response = await this.api.get('/learning/achievements');
    return response.data;
  }

  async getAchievementProgress(id: number) {
    const response = await this.api.get(`/learning/achievements/${id}`);
    return response.data;
  }

  // ==================== ADMIN - MODULES ====================

  async uploadModuleIcon(imageUri: string) {
    const formData = new FormData();

    // Extract filename and type from URI
    const filename = imageUri.split('/').pop() || 'module-icon.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Append the image file to formData
    formData.append('icon', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    const response = await this.api.post('/admin/learning/upload-module-icon', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async adminGetModules() {
    const response = await this.api.get('/admin/learning/modules');
    return response.data;
  }

  async adminGetModuleById(id: number) {
    const response = await this.api.get(`/admin/learning/modules/${id}`);
    return response.data;
  }

  async adminCreateModule(data: any) {
    const response = await this.api.post('/admin/learning/modules', data);
    return response.data;
  }

  async adminUpdateModule(id: number, data: any) {
    const response = await this.api.put(`/admin/learning/modules/${id}`, data);
    return response.data;
  }

  async adminDeleteModule(id: number) {
    const response = await this.api.delete(`/admin/learning/modules/${id}`);
    return response.data;
  }

  async adminReorderModules(moduleIds: number[]) {
    const response = await this.api.put('/admin/learning/modules/reorder', { moduleIds });
    return response.data;
  }

  // ==================== ADMIN - LESSONS ====================

  async adminGetLessons(moduleId?: number) {
    const params = moduleId ? `?moduleId=${moduleId}` : '';
    const response = await this.api.get(`/admin/learning/lessons${params}`);
    return response.data;
  }

  async adminGetLessonById(id: number) {
    const response = await this.api.get(`/admin/learning/lessons/${id}`);
    return response.data;
  }

  async adminCreateLesson(data: any) {
    const response = await this.api.post('/admin/learning/lessons', data);
    return response.data;
  }

  async adminUpdateLesson(id: number, data: any) {
    const response = await this.api.put(`/admin/learning/lessons/${id}`, data);
    return response.data;
  }

  async adminDeleteLesson(id: number) {
    const response = await this.api.delete(`/admin/learning/lessons/${id}`);
    return response.data;
  }

  async adminReorderLessons(lessonIds: number[]) {
    const response = await this.api.put('/admin/learning/lessons/reorder', { lessonIds });
    return response.data;
  }

  // ==================== ADMIN - QUIZZES ====================

  async adminGetQuizzes(filters?: { moduleId?: number; type?: string }) {
    const params = new URLSearchParams();
    if (filters?.moduleId) params.append('moduleId', String(filters.moduleId));
    if (filters?.type) params.append('type', filters.type);

    const response = await this.api.get(`/admin/learning/quizzes?${params}`);
    return response.data;
  }

  async adminGetQuizById(id: number) {
    const response = await this.api.get(`/admin/learning/quizzes/${id}`);
    return response.data;
  }

  async adminCreateQuiz(data: any) {
    const response = await this.api.post('/admin/learning/quizzes', data);
    return response.data;
  }

  async adminUpdateQuiz(id: number, data: any) {
    const response = await this.api.put(`/admin/learning/quizzes/${id}`, data);
    return response.data;
  }

  async adminDeleteQuiz(id: number) {
    const response = await this.api.delete(`/admin/learning/quizzes/${id}`);
    return response.data;
  }

  async adminAddQuestion(quizId: number, question: any) {
    const response = await this.api.post(`/admin/learning/quizzes/${quizId}/questions`, question);
    return response.data;
  }

  async adminUpdateQuestion(questionId: number, data: any) {
    const response = await this.api.put(`/admin/learning/questions/${questionId}`, data);
    return response.data;
  }

  async adminDeleteQuestion(questionId: number) {
    const response = await this.api.delete(`/admin/learning/questions/${questionId}`);
    return response.data;
  }

  // ==================== ADMIN - LEARNING PATHS ====================

  async adminGetPaths() {
    const response = await this.api.get('/admin/learning/paths');
    return response.data;
  }

  async adminGetPathById(id: number) {
    const response = await this.api.get(`/admin/learning/paths/${id}`);
    return response.data;
  }

  async adminCreatePath(data: any) {
    const response = await this.api.post('/admin/learning/paths', data);
    return response.data;
  }

  async adminUpdatePath(id: number, data: any) {
    const response = await this.api.put(`/admin/learning/paths/${id}`, data);
    return response.data;
  }

  async adminDeletePath(id: number) {
    const response = await this.api.delete(`/admin/learning/paths/${id}`);
    return response.data;
  }

  async adminAddModuleToPath(pathId: number, moduleId: number) {
    const response = await this.api.post(`/admin/learning/paths/${pathId}/modules`, { module_id: moduleId });
    return response.data;
  }

  async adminRemoveModuleFromPath(pathId: number, moduleId: number) {
    const response = await this.api.delete(`/admin/learning/paths/${pathId}/modules/${moduleId}`);
    return response.data;
  }

  // ==================== ADMIN - ACHIEVEMENTS ====================

  async adminGetAchievements() {
    const response = await this.api.get('/admin/learning/achievements');
    return response.data;
  }

  async adminCreateAchievement(data: any) {
    const response = await this.api.post('/admin/learning/achievements', data);
    return response.data;
  }

  async adminUpdateAchievement(id: number, data: any) {
    const response = await this.api.put(`/admin/learning/achievements/${id}`, data);
    return response.data;
  }

  async adminDeleteAchievement(id: number) {
    const response = await this.api.delete(`/admin/learning/achievements/${id}`);
    return response.data;
  }
}

export default new LearningAPIService();
