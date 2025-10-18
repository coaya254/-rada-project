import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/profile';

export interface UserProfile {
  uuid: string;
  nickname: string;
  emoji: string;
  email?: string;
  bio?: string;
  county?: string;
  persona?: 'keeper' | 'tracker' | 'amplifier' | 'educator';
  xp: number;
  level: number;
  streak: number;
  last_streak?: string;
  badges?: any[];
  trust_score?: number;
  preferences?: any;
  created_at: string;
  last_active?: string;
  // From user_learning_progress
  total_xp?: number;
  current_streak?: number;
  longest_streak?: number;
  modules_completed?: number;
  lessons_completed?: number;
  quizzes_passed?: number;
  achievements_earned?: number;
}

export interface UserStats {
  modules_completed: number;
  lessons_completed: number;
  quizzes_passed: number;
  achievements_count: number;
  total_xp_earned: number;
  current_streak: number;
  longest_streak: number;
}

export interface UserPost {
  id: number;
  uuid: string;
  title: string;
  content: string;
  category: string;
  replies_count: number;
  likes_count: number;
  views_count: number;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedItem {
  type: string;
  id: number;
  title: string;
  content?: string;
  category?: string;
  saved_at: string;
}

export interface UserActivity {
  activity_type: string;
  action_name: string;
  points: number;
  content_type?: string;
  content_id?: number;
  created_at: string;
}

export const ProfileAPIService = {
  async getUserProfile(uuid: string): Promise<{ success: boolean; profile: UserProfile }> {
    const response = await axios.get(`${API_BASE_URL}/${uuid}`);
    return response.data;
  },

  async updateUserProfile(uuid: string, updates: {
    nickname?: string;
    bio?: string;
    county?: string;
    emoji?: string;
    preferences?: any;
  }): Promise<{ success: boolean; message: string }> {
    const response = await axios.put(`${API_BASE_URL}/${uuid}`, updates);
    return response.data;
  },

  async getUserStats(uuid: string): Promise<{ success: boolean; stats: UserStats }> {
    const response = await axios.get(`${API_BASE_URL}/${uuid}/stats`);
    return response.data;
  },

  async getUserPosts(uuid: string): Promise<{ success: boolean; posts: UserPost[]; count: number }> {
    const response = await axios.get(`${API_BASE_URL}/${uuid}/posts`);
    return response.data;
  },

  async getUserSaved(uuid: string): Promise<{ success: boolean; saved: SavedItem[]; count: number }> {
    const response = await axios.get(`${API_BASE_URL}/${uuid}/saved`);
    return response.data;
  },

  async getUserActivities(uuid: string): Promise<{ success: boolean; activities: UserActivity[]; count: number }> {
    const response = await axios.get(`${API_BASE_URL}/${uuid}/activities`);
    return response.data;
  },
};
