// Public-facing Politics API Service (no auth required)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.41:5000/api';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

class PoliticsAPIService {
  private baseURL: string;
  private defaultTimeout: number = 30000;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<APIResponse<T>> {
    try {
      const { method = 'GET', body, timeout = this.defaultTimeout } = config;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data; // Backend already returns { success, data } format
    } catch (error: any) {
      console.error(`Politics API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error.message || 'Network request failed',
      };
    }
  }

  // Get all politicians (public only)
  async getPoliticians(): Promise<APIResponse<any[]>> {
    return this.makeRequest('/politicians');
  }

  // Get single politician by ID
  async getPolitician(id: number): Promise<APIResponse<any>> {
    return this.makeRequest(`/politicians/${id}`);
  }

  // Get politician documents
  async getDocuments(politicianId: number): Promise<APIResponse<any[]>> {
    return this.makeRequest(`/politicians/${politicianId}/documents`);
  }

  // Get politician timeline
  async getTimeline(politicianId: number): Promise<APIResponse<any[]>> {
    return this.makeRequest(`/politicians/${politicianId}/timeline`);
  }

  // Get politician commitments
  async getCommitments(politicianId: number): Promise<APIResponse<any[]>> {
    return this.makeRequest(`/politicians/${politicianId}/commitments`);
  }

  // Get politician voting records
  async getVotingRecords(politicianId: number): Promise<APIResponse<any[]>> {
    return this.makeRequest(`/politicians/${politicianId}/voting-records`);
  }

  // Get politician career information
  async getCareer(politicianId: number): Promise<APIResponse<any>> {
    return this.makeRequest(`/politicians/${politicianId}/career`);
  }

  // Get politician news
  async getNews(politicianId: number): Promise<APIResponse<any[]>> {
    return this.makeRequest(`/politicians/${politicianId}/news`);
  }

  // Get latest news (all politicians)
  async getLatestNews(limit: number = 10): Promise<APIResponse<any[]>> {
    return this.makeRequest(`/news/latest?limit=${limit}`);
  }

  // Get external news by source
  async getExternalNews(source?: string, limit: number = 10): Promise<APIResponse<any[]>> {
    const endpoint = source
      ? `/news/external/${source}?limit=${limit}`
      : `/news/external?limit=${limit}`;
    return this.makeRequest(endpoint);
  }
}

export const politicsAPI = new PoliticsAPIService();
export default politicsAPI;
