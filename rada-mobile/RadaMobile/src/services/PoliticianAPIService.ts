import api from './api';

// Types for API responses
export interface PoliticianAPIResponse {
  id: number;
  name: string;
  current_position: string;
  party_history: string[];
  constituency: string;
  wikipedia_summary: string;
  key_achievements: string[];
  education: string;
  image_url?: string;
  party_color?: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface PoliticianListResponse {
  politicians: PoliticianAPIResponse[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface PoliticianDetailResponse extends PoliticianAPIResponse {
  voting_records: VotingRecordAPI[];
  commitments: CommitmentAPI[];
  news_mentions: NewsMentionAPI[];
  social_media: SocialMediaAPI[];
  analytics: PoliticianAnalyticsAPI;
}

export interface VotingRecordAPI {
  id: string;
  bill_title: string;
  bill_number: string;
  vote: 'yes' | 'no' | 'abstain' | 'absent';
  date: string;
  house: 'national_assembly' | 'senate' | 'county_assembly';
  category: string;
  bill_status: 'passed' | 'failed' | 'pending';
}

export interface CommitmentAPI {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  progress: number;
  start_date: string;
  target_date: string;
  completion_date?: string;
  source: string;
  verified: boolean;
}

export interface NewsMentionAPI {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  published_at: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  credibility_score: number;
}

export interface SocialMediaAPI {
  platform: 'twitter' | 'facebook' | 'instagram' | 'youtube';
  handle: string;
  followers: number;
  verified: boolean;
  last_post: string;
}

export interface PoliticianAnalyticsAPI {
  total_votes: number;
  attendance_rate: number;
  party_loyalty: number;
  completion_rate: number;
  public_approval: number;
  media_mentions: number;
  social_engagement: number;
}

export interface SearchFilters {
  name?: string;
  position?: string;
  party?: string;
  constituency?: string;
  county?: string;
  gender?: 'male' | 'female';
  age_min?: number;
  age_max?: number;
  years_in_office_min?: number;
  years_in_office_max?: number;
  sort_by?: 'name' | 'position' | 'party' | 'constituency' | 'created_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

class PoliticianAPIService {
  private static baseUrl = '/api/politicians';

  /**
   * Get all politicians with optional filtering and pagination
   */
  static async getPoliticians(filters: SearchFilters = {}): Promise<PoliticianListResponse> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      // Backend returns: { politicians, pagination: { page, limit, total, pages } }
      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      const { politicians, pagination } = response || {};
      const page = (pagination?.page ?? Number(params.get('page'))) || 1;
      const limit = (pagination?.limit ?? Number(params.get('limit'))) || (politicians?.length ?? 0);
      const total = pagination?.total ?? (politicians?.length ?? 0);
      const pages = pagination?.pages ?? (limit ? Math.ceil(total / limit) : 1);
      const has_more = page < pages;

      return { politicians: politicians || [], total, page, limit, has_more };
    } catch (error) {
      console.error('Error fetching politicians:', error);
      throw error;
    }
  }

  /**
   * Get politician by ID with full details
   */
  static async getPoliticianById(id: number): Promise<PoliticianDetailResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching politician ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get politician by slug
   */
  static async getPoliticianBySlug(slug: string): Promise<PoliticianDetailResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/slug/${slug}`);
      return response;
    } catch (error) {
      console.error(`Error fetching politician by slug ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Search politicians by name or other criteria
   */
  static async searchPoliticians(query: string, filters: Omit<SearchFilters, 'name'> = {}): Promise<PoliticianListResponse> {
    try {
      const searchFilters = { ...filters, name: query };
      return await this.getPoliticians(searchFilters);
    } catch (error) {
      console.error('Error searching politicians:', error);
      throw error;
    }
  }

  /**
   * Get politicians by party
   */
  static async getPoliticiansByParty(party: string, filters: Omit<SearchFilters, 'party'> = {}): Promise<PoliticianListResponse> {
    try {
      const partyFilters = { ...filters, party };
      return await this.getPoliticians(partyFilters);
    } catch (error) {
      console.error(`Error fetching politicians by party ${party}:`, error);
      throw error;
    }
  }

  /**
   * Get politicians by position
   */
  static async getPoliticiansByPosition(position: string, filters: Omit<SearchFilters, 'position'> = {}): Promise<PoliticianListResponse> {
    try {
      const positionFilters = { ...filters, position };
      return await this.getPoliticians(positionFilters);
    } catch (error) {
      console.error(`Error fetching politicians by position ${position}:`, error);
      throw error;
    }
  }

  /**
   * Get politicians by constituency
   */
  static async getPoliticiansByConstituency(constituency: string, filters: Omit<SearchFilters, 'constituency'> = {}): Promise<PoliticianListResponse> {
    try {
      const constituencyFilters = { ...filters, constituency };
      return await this.getPoliticians(constituencyFilters);
    } catch (error) {
      console.error(`Error fetching politicians by constituency ${constituency}:`, error);
      throw error;
    }
  }

  /**
   * Get voting records for a politician
   */
  static async getVotingRecords(politicianId: number, filters: {
    category?: string;
    vote?: string;
    date_from?: string;
    date_to?: string;
    house?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ records: VotingRecordAPI[]; total: number; page: number; limit: number }> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      // Backend path is `/voting` and returns an array (no pagination envelope)
      const records: VotingRecordAPI[] = await api.get(`${this.baseUrl}/${politicianId}/voting?${params.toString()}`);
      const page = Number(params.get('page')) || 1;
      const limit = Number(params.get('limit')) || records.length || 0;
      const total = records.length;
      return { records, total, page, limit };
    } catch (error) {
      console.error(`Error fetching voting records for politician ${politicianId}:`, error);
      throw error;
    }
  }

  /**
   * Get commitments for a politician
   */
  static async getCommitments(politicianId: number, filters: {
    category?: string;
    status?: string;
    priority?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ commitments: CommitmentAPI[]; total: number; page: number; limit: number }> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      // Backend returns an array at `/commitments`
      const commitments: CommitmentAPI[] = await api.get(`${this.baseUrl}/${politicianId}/commitments?${params.toString()}`);
      const page = Number(params.get('page')) || 1;
      const limit = Number(params.get('limit')) || commitments.length || 0;
      const total = commitments.length;
      return { commitments, total, page, limit };
    } catch (error) {
      console.error(`Error fetching commitments for politician ${politicianId}:`, error);
      throw error;
    }
  }

  /**
   * Get news mentions for a politician
   */
  static async getNewsMentions(politicianId: number, filters: {
    sentiment?: string;
    source?: string;
    date_from?: string;
    date_to?: string;
    credibility_min?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<{ mentions: NewsMentionAPI[]; total: number; page: number; limit: number }> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      // Backend path is `/news` and returns an array
      const mentions: NewsMentionAPI[] = await api.get(`${this.baseUrl}/${politicianId}/news?${params.toString()}`);
      const page = Number(params.get('page')) || 1;
      const limit = Number(params.get('limit')) || mentions.length || 0;
      const total = mentions.length;
      return { mentions, total, page, limit };
    } catch (error) {
      console.error(`Error fetching news mentions for politician ${politicianId}:`, error);
      throw error;
    }
  }

  /**
   * Get analytics for a politician
   */
  static async getPoliticianAnalytics(politicianId: number): Promise<PoliticianAnalyticsAPI> {
    try {
      const response = await api.get(`${this.baseUrl}/${politicianId}/analytics`);
      return response;
    } catch (error) {
      console.error(`Error fetching analytics for politician ${politicianId}:`, error);
      throw error;
    }
  }

  /**
   * Get comparison data for multiple politicians
   */
  static async comparePoliticians(politicianIds: number[]): Promise<{
    politicians: PoliticianAPIResponse[];
    comparison_data: {
      voting_records: { [politicianId: number]: VotingRecordAPI[] };
      commitments: { [politicianId: number]: CommitmentAPI[] };
      analytics: { [politicianId: number]: PoliticianAnalyticsAPI };
    };
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/compare`, { politician_ids: politicianIds });
      return response;
    } catch (error) {
      console.error('Error comparing politicians:', error);
      throw error;
    }
  }

  /**
   * Get trending politicians
   */
  static async getTrendingPoliticians(period: 'day' | 'week' | 'month' = 'week', limit: number = 10): Promise<PoliticianAPIResponse[]> {
    try {
      const response = await api.get(`${this.baseUrl}/trending?period=${period}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Error fetching trending politicians:', error);
      throw error;
    }
  }

  /**
   * Get politician statistics
   */
  static async getPoliticianStats(): Promise<{
    total_politicians: number;
    by_party: { [party: string]: number };
    by_position: { [position: string]: number };
    by_gender: { male: number; female: number };
    by_county: { [county: string]: number };
    average_age: number;
    average_years_in_office: number;
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return response;
    } catch (error) {
      console.error('Error fetching politician statistics:', error);
      throw error;
    }
  }

  /**
   * Update politician data (admin only)
   */
  static async updatePolitician(id: number, data: Partial<PoliticianAPIResponse>): Promise<PoliticianAPIResponse> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating politician ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new politician (admin only)
   */
  static async createPolitician(data: Omit<PoliticianAPIResponse, 'id' | 'created_at' | 'updated_at'>): Promise<PoliticianAPIResponse> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response;
    } catch (error) {
      console.error('Error creating politician:', error);
      throw error;
    }
  }

  /**
   * Delete politician (admin only)
   */
  static async deletePolitician(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting politician ${id}:`, error);
      throw error;
    }
  }

  /**
   * Upload politician image (admin only)
   */
  static async uploadPoliticianImage(id: number, imageFile: File): Promise<{ image_url: string }> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post(`${this.baseUrl}/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error(`Error uploading image for politician ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get politician favorites for current user
   */
  static async getFavorites(): Promise<PoliticianAPIResponse[]> {
    try {
      const response = await api.get(`${this.baseUrl}/favorites`);
      return response;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  /**
   * Add politician to favorites
   */
  static async addToFavorites(politicianId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/${politicianId}/favorite`);
      return response;
    } catch (error) {
      console.error(`Error adding politician ${politicianId} to favorites:`, error);
      throw error;
    }
  }

  /**
   * Remove politician from favorites
   */
  static async removeFromFavorites(politicianId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`${this.baseUrl}/${politicianId}/favorite`);
      return response;
    } catch (error) {
      console.error(`Error removing politician ${politicianId} from favorites:`, error);
      throw error;
    }
  }

  /**
   * Toggle politician favorite status
   */
  static async toggleFavorite(politicianId: number): Promise<{ is_favorite: boolean; message: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/${politicianId}/toggle-favorite`);
      return response;
    } catch (error) {
      console.error(`Error toggling favorite for politician ${politicianId}:`, error);
      throw error;
    }
  }

  /**
   * Get politician search suggestions
   */
  static async getSearchSuggestions(query: string, limit: number = 10): Promise<{
    politicians: { id: number; name: string; position: string; party: string }[];
    suggestions: string[];
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/search-suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      throw error;
    }
  }

  /**
   * Get politician export data
   */
  static async exportPoliticianData(politicianId: number, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/${politicianId}/export?format=${format}`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      console.error(`Error exporting data for politician ${politicianId}:`, error);
      throw error;
    }
  }

  /**
   * Get politician social media data
   */
  static async getSocialMediaData(politicianId: number): Promise<SocialMediaAPI[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${politicianId}/social-media`);
      return response;
    } catch (error) {
      console.error(`Error fetching social media data for politician ${politicianId}:`, error);
      throw error;
    }
  }

  /**
   * Update politician social media data (admin only)
   */
  static async updateSocialMediaData(politicianId: number, socialMediaData: SocialMediaAPI[]): Promise<SocialMediaAPI[]> {
    try {
      const response = await api.put(`${this.baseUrl}/${politicianId}/social-media`, { social_media: socialMediaData });
      return response;
    } catch (error) {
      console.error(`Error updating social media data for politician ${politicianId}:`, error);
      throw error;
    }
  }
}

export default PoliticianAPIService;
