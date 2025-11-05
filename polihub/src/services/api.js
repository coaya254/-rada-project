// PoliHub API Service
// Connects to backend server at localhost:5000

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class PoliHubAPI {
  // ============================================
  // POLITICIANS
  // ============================================

  async getPoliticians(filters = {}) {
    const params = new URLSearchParams();
    if (filters.party) params.append('party', filters.party);
    if (filters.chamber) params.append('chamber', filters.chamber);
    if (filters.state) params.append('state', filters.state);
    if (filters.search) params.append('search', filters.search);

    const response = await fetch(`${API_BASE_URL}/api/polihub/politicians?${params}`);
    const data = await response.json();
    return data.success ? data.data : [];
  }

  async getPolitician(id) {
    const response = await fetch(`${API_BASE_URL}/api/polihub/politicians/${id}`);
    const data = await response.json();
    return data.success ? data.data : null;
  }

  async trackPoliticianView(id) {
    await fetch(`${API_BASE_URL}/api/polihub/politicians/${id}/view`, {
      method: 'POST'
    });
  }

  // ============================================
  // CIVIC TOPICS
  // ============================================

  async getCivicTopics(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    params.append('status', 'published'); // Only get published modules

    const response = await fetch(`${API_BASE_URL}/api/polihub/civic-modules?${params}`);
    const data = await response.json();
    return data.success ? data.data : [];
  }

  async getCivicTopic(slug) {
    const response = await fetch(`${API_BASE_URL}/api/polihub/civic-topics/${slug}`);
    const data = await response.json();
    return data.success ? data.data : null;
  }

  // ============================================
  // BLOG POSTS
  // ============================================

  async getBlogPosts(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const response = await fetch(`${API_BASE_URL}/api/polihub/blog?${params}`);
    const data = await response.json();
    return data.success ? data.data : [];
  }

  async getBlogPost(slug) {
    const response = await fetch(`${API_BASE_URL}/api/polihub/blog/${slug}`);
    const data = await response.json();
    return data.success ? data.data : null;
  }

  async getComments(postId) {
    const response = await fetch(`${API_BASE_URL}/api/polihub/blog/${postId}/comments`);
    const data = await response.json();
    return data.success ? data.data : [];
  }

  async postComment(postId, commentData) {
    const response = await fetch(`${API_BASE_URL}/api/polihub/blog/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData)
    });
    const data = await response.json();
    return data;
  }

  // ============================================
  // BILLS & VOTING
  // ============================================

  async getBills(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.chamber) params.append('chamber', filters.chamber);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await fetch(`${API_BASE_URL}/api/polihub/bills?${params}`);
    const data = await response.json();
    return data.success ? data.data : [];
  }

  async getBill(id) {
    const response = await fetch(`${API_BASE_URL}/api/polihub/bills/${id}`);
    const data = await response.json();
    return data.success ? data.data : null;
  }

  // ============================================
  // NEWSLETTER
  // ============================================

  async subscribeNewsletter(email) {
    const response = await fetch(`${API_BASE_URL}/api/polihub/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return data;
  }

  // ============================================
// CIVIC TOPICS
// ============================================

async getCivicTopics(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.difficulty) params.append('difficulty', filters.difficulty);
  params.append('status', 'published');

  const response = await fetch(`${API_BASE_URL}/api/polihub/civic-modules?${params}`);
  const data = await response.json();
  return data.success ? data.data : [];
}

async getCivicTopic(slug) {
  const response = await fetch(`${API_BASE_URL}/api/polihub/civic-topics/${slug}`);
  const data = await response.json();
  return data.success ? data.data : null;
}

// ADD THESE NEW METHODS HERE:
async getCivicModule(moduleId) {
  const response = await fetch(`${API_BASE_URL}/api/polihub/civic-modules/${moduleId}`);
  const data = await response.json();
  return data.success ? data.data : null;
}

async getLesson(lessonId) {
  const response = await fetch(`${API_BASE_URL}/api/polihub/lessons/${lessonId}`);
  const data = await response.json();
  return data.success ? data.data : null;
}

async getModuleQuizzes(moduleId) {
  const response = await fetch(`${API_BASE_URL}/api/polihub/civic-modules/${moduleId}/quizzes`);
  const data = await response.json();
  return data.success ? data.data : [];
}

async getQuiz(quizId) {
  const response = await fetch(`${API_BASE_URL}/api/polihub/quizzes/${quizId}`);
  const data = await response.json();
  return data.success ? data.data : null;
}

  // ============================================
  // SEARCH & TRENDING
  // ============================================

  async search(query, type = 'all') {
    const params = new URLSearchParams({ q: query, type });
    const response = await fetch(`${API_BASE_URL}/api/polihub/search?${params}`);
    const data = await response.json();
    return data.success ? data.data : {};
  }

  async getTrending() {
    const response = await fetch(`${API_BASE_URL}/api/polihub/trending`);
    const data = await response.json();
    return data.success ? data.data : [];
  }

  async getAllTrending() {
    const response = await fetch(`${API_BASE_URL}/api/polihub/trending/all`);
    const data = await response.json();
    return data.success ? data.data : [];
  }

  async createTrending(trendingData) {
    const response = await fetch(`${API_BASE_URL}/api/polihub/trending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trendingData)
    });
    const data = await response.json();
    return data;
  }

  async updateTrending(id, trendingData) {
    const response = await fetch(`${API_BASE_URL}/api/polihub/trending/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trendingData)
    });
    const data = await response.json();
    return data;
  }

  async deleteTrending(id) {
    const response = await fetch(`${API_BASE_URL}/api/polihub/trending/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return data;
  }
}


export default new PoliHubAPI();


