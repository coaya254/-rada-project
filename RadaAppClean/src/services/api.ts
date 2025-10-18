import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PoliticianData {
  id: number;
  name: string;
  title: string;
  party?: string;
  constituency?: string;
  image_url?: string;
  bio?: string;
  voting_record?: any;
}

export interface LearningModule {
  id: number;
  title: string;
  description: string;
  progress?: number;
  completed?: boolean;
  xp_reward?: number;
  estimated_duration?: number;
}

export interface CommunityPost {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  likes: number;
  comments: number;
}

// API Configuration
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000'  // Development
  : 'https://your-production-api.com'; // Production

const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  validateStatus: (status: number) => status >= 200 && status < 500,
};

// Create axios instance
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  // Add auth token if available
  const token = getCurrentAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('API Error:', error);
    // Handle common errors here
    return Promise.reject(error);
  }
);

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getCurrentAuthToken = (): string | null => {
  return authToken;
};

// API Services
export class ApiService {
  // Politics API
  static async getPoliticians(): Promise<ApiResponse<PoliticianData[]>> {
    const response = await apiClient.get('/api/politicians');
    return response.data;
  }

  static async getPolitician(id: number): Promise<ApiResponse<PoliticianData>> {
    const response = await apiClient.get(`/api/politicians/${id}`);
    return response.data;
  }

  static async getVotingRecords(politicianId: number): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/api/politicians/${politicianId}/voting`);
    return response.data;
  }

  static async getDocuments(politicianId: number): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/api/politicians/${politicianId}/documents`);
    return response.data;
  }

  static async getTimeline(politicianId: number): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/api/politicians/${politicianId}/timeline`);
    return response.data;
  }

  static async getCommitments(politicianId: number): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/api/politicians/${politicianId}/commitments`);
    return response.data;
  }

  static async getPoliticianNews(politicianId: number): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/api/politicians/${politicianId}/news`);
    return response.data;
  }

  static async getCareer(politicianId: number): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/api/politicians/${politicianId}/career`);
    return response.data;
  }

  static async getLatestNews(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get('/api/news/latest');
    return response.data;
  }

  static async getExternalNews(source: string): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/api/news/external/${source}`);
    return response.data;
  }

  // Learning API
  static async getLearningModules(): Promise<ApiResponse<LearningModule[]>> {
    const response = await apiClient.get('/api/learning/modules');
    return response.data;
  }

  static async getModule(id: number): Promise<ApiResponse<LearningModule>> {
    const response = await apiClient.get(`/api/learning/modules/${id}`);
    return response.data;
  }

  static async updateProgress(moduleId: number, progress: number): Promise<ApiResponse> {
    const response = await apiClient.post(`/api/learning/modules/${moduleId}/progress`, {
      progress
    });
    return response.data;
  }

  static async getUserStats(): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/api/user/stats');
    return response.data;
  }

  // Community API
  static async getCommunityPosts(): Promise<ApiResponse<CommunityPost[]>> {
    const response = await apiClient.get('/api/community/posts');
    return response.data;
  }

  static async createPost(title: string, content: string): Promise<ApiResponse<CommunityPost>> {
    const response = await apiClient.post('/api/community/posts', {
      title,
      content
    });
    return response.data;
  }

  static async likePost(postId: number, isLiked: boolean): Promise<ApiResponse> {
    const response = await apiClient.post(`/api/community/posts/${postId}/like`, {
      isLiked
    });
    return response.data;
  }

  static async commentOnPost(postId: number, comment: string): Promise<ApiResponse> {
    const response = await apiClient.post(`/api/community/posts/${postId}/comments`, {
      comment
    });
    return response.data;
  }

  // User Profile API
  static async getUserProfile(): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/api/user/profile');
    return response.data;
  }

  static async updateUserProfile(profileData: any): Promise<ApiResponse> {
    const response = await apiClient.put('/api/user/profile', profileData);
    return response.data;
  }

  // Politician Comparison API
  static async comparePoliticians(politicianIds: number[]): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/api/politicians/compare', {
      politicianIds
    });
    return response.data;
  }

  // Generic API method for custom endpoints
  static async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await apiClient.get(endpoint);
    return response.data;
  }

  static async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  }

  static async put<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const response = await apiClient.put(endpoint, data);
    return response.data;
  }

  static async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await apiClient.delete(endpoint);
    return response.data;
  }
}

export default ApiService;