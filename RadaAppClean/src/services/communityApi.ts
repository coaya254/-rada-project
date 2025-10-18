import axios from 'axios';

// Change this to your computer's IP address if testing on physical device
// Find it by running: ipconfig (Windows) and look for IPv4 Address
const API_BASE_URL = 'http://localhost:3000/api/community';

export interface Discussion {
  id: number;
  uuid: string;
  title: string;
  content: string;
  category: string;
  is_anonymous: boolean;
  replies_count: number;
  likes_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  nickname: string;
  emoji: string;
}

export interface Reply {
  id: number;
  discussion_id: number;
  uuid: string;
  content: string;
  likes_count: number;
  created_at: string;
  nickname: string;
  emoji: string;
}

export const communityApi = {
  // Get all discussions
  async getDiscussions(params?: { 
    category?: string; 
    search?: string; 
    limit?: number; 
    offset?: number 
  }) {
    const response = await axios.get<Discussion[]>(`${API_BASE_URL}/discussions`, { params });
    return response.data;
  },

  // Get single discussion
  async getDiscussion(id: number) {
    const response = await axios.get<Discussion>(`${API_BASE_URL}/discussions/${id}`);
    return response.data;
  },

  // Create new discussion
  async createDiscussion(data: {
    uuid: string;
    title: string;
    content: string;
    category: string;
    is_anonymous?: boolean;
  }) {
    const response = await axios.post(`${API_BASE_URL}/discussions`, data);
    return response.data;
  },

  // Get replies for a discussion
  async getReplies(discussionId: number) {
    const response = await axios.get<Reply[]>(`${API_BASE_URL}/discussions/${discussionId}/replies`);
    return response.data;
  },

  // Add reply to discussion
  async addReply(discussionId: number, data: { uuid: string; content: string }) {
    const response = await axios.post(`${API_BASE_URL}/discussions/${discussionId}/replies`, data);
    return response.data;
  },

  // Like/unlike discussion
  async likeDiscussion(discussionId: number, uuid: string) {
    const response = await axios.post(`${API_BASE_URL}/discussions/${discussionId}/like`, { uuid });
    return response.data;
  },

  // Like/unlike reply
  async likeReply(replyId: number, uuid: string) {
    const response = await axios.post(`${API_BASE_URL}/replies/${replyId}/like`, { uuid });
    return response.data;
  },

  // Delete discussion
  async deleteDiscussion(discussionId: number, uuid: string) {
    const response = await axios.delete(`${API_BASE_URL}/discussions/${discussionId}`, { data: { uuid } });
    return response.data;
  },

  // Delete reply
  async deleteReply(replyId: number, uuid: string) {
    const response = await axios.delete(`${API_BASE_URL}/replies/${replyId}`, { data: { uuid } });
    return response.data;
  },
};