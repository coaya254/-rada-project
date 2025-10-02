import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const ADMIN_API_PREFIX = '/admin';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

class AdminAPIService {
  private baseURL: string;
  private defaultTimeout: number = 30000;

  constructor() {
    this.baseURL = `${API_BASE_URL}${ADMIN_API_PREFIX}`;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('adminToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<APIResponse<T>> {
    try {
      const { method = 'GET', body, timeout = this.defaultTimeout } = config;
      const headers = await this.getAuthHeaders();

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
      return { success: true, data };
    } catch (error: any) {
      console.error(`Admin API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error.message || 'Network request failed',
      };
    }
  }

  // Authentication APIs
  async login(credentials: { username: string; password: string }): Promise<APIResponse<{
    user: any;
    token: string;
    permissions: any[];
  }>> {
    const response = await this.makeRequest<any>('/auth/login', {
      method: 'POST',
      body: credentials,
    });

    if (response.success && response.data?.token) {
      await AsyncStorage.setItem('adminToken', response.data.token);
      await AsyncStorage.setItem('adminUser', JSON.stringify(response.data.user));
      await AsyncStorage.setItem('adminPermissions', JSON.stringify(response.data.permissions));
    }

    return response;
  }

  async logout(): Promise<APIResponse<void>> {
    await AsyncStorage.multiRemove(['adminToken', 'adminUser', 'adminPermissions']);
    return this.makeRequest('/auth/logout', { method: 'POST' });
  }

  async verifyToken(): Promise<APIResponse<{ user: any; permissions: any[] }>> {
    return this.makeRequest('/auth/verify');
  }

  // Politician Management APIs
  async createPolitician(politicianData: any): Promise<APIResponse<any>> {
    return this.makeRequest('/politicians', {
      method: 'POST',
      body: politicianData,
    });
  }

  async updatePolitician(id: number, updates: any): Promise<APIResponse<any>> {
    return this.makeRequest(`/politicians/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deletePolitician(id: number): Promise<APIResponse<void>> {
    return this.makeRequest(`/politicians/${id}`, {
      method: 'DELETE',
    });
  }

  async publishPolitician(id: number): Promise<APIResponse<any>> {
    return this.makeRequest(`/politicians/${id}/publish`, {
      method: 'POST',
    });
  }

  async getPolitician(id: number): Promise<APIResponse<any>> {
    return this.makeRequest(`/politicians/${id}`);
  }

  async bulkDeletePoliticians(ids: number[]): Promise<APIResponse<{ deleted: number }>> {
    return this.makeRequest('/politicians/bulk-delete', {
      method: 'POST',
      body: { ids },
    });
  }

  async bulkUpdatePoliticians(updates: Array<{ id: number; data: any }>): Promise<APIResponse<{ updated: number }>> {
    return this.makeRequest('/politicians/bulk-update', {
      method: 'POST',
      body: { updates },
    });
  }

  async searchPoliticians(query: string, filters?: any): Promise<APIResponse<any[]>> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    return this.makeRequest(`/politicians/search?${params}`);
  }

  // Timeline Events APIs
  async createTimelineEvent(eventData: any): Promise<APIResponse<any>> {
    return this.makeRequest('/timeline-events', {
      method: 'POST',
      body: eventData,
    });
  }

  async updateTimelineEvent(id: number, updates: any): Promise<APIResponse<any>> {
    return this.makeRequest(`/timeline-events/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteTimelineEvent(id: number): Promise<APIResponse<void>> {
    return this.makeRequest(`/timeline-events/${id}`, {
      method: 'DELETE',
    });
  }

  async getTimelineEvents(politicianId?: number): Promise<APIResponse<any[]>> {
    const endpoint = politicianId ? `/timeline-events?politicianId=${politicianId}` : '/timeline-events';
    return this.makeRequest(endpoint);
  }

  // Commitment Tracking APIs
  async createCommitment(commitmentData: any): Promise<APIResponse<any>> {
    return this.makeRequest('/commitments', {
      method: 'POST',
      body: commitmentData,
    });
  }

  async updateCommitment(id: number, updates: any): Promise<APIResponse<any>> {
    return this.makeRequest(`/commitments/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async updateCommitmentProgress(id: number, progress: {
    status: string;
    percentage: number;
    notes?: string;
    evidence_links?: string[];
  }): Promise<APIResponse<any>> {
    return this.makeRequest(`/commitments/${id}/progress`, {
      method: 'PATCH',
      body: progress,
    });
  }

  async deleteCommitment(id: number): Promise<APIResponse<void>> {
    return this.makeRequest(`/commitments/${id}`, {
      method: 'DELETE',
    });
  }

  async getCommitments(filters?: {
    politicianId?: number;
    status?: string;
    dateRange?: { start: string; end: string };
  }): Promise<APIResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'dateRange' && typeof value === 'object' && 'start' in value && 'end' in value) {
            params.append('startDate', value.start);
            params.append('endDate', value.end);
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    return this.makeRequest(`/commitments?${params}`);
  }

  // Voting Records APIs
  async bulkImportVotingRecords(records: any[]): Promise<APIResponse<{ imported: number; errors: any[] }>> {
    return this.makeRequest('/voting-records/bulk-import', {
      method: 'POST',
      body: { records },
      timeout: 60000, // Longer timeout for bulk operations
    });
  }

  async createVotingRecord(recordData: any): Promise<APIResponse<any>> {
    return this.makeRequest('/voting-records', {
      method: 'POST',
      body: recordData,
    });
  }

  async updateVotingRecord(id: number, updates: any): Promise<APIResponse<any>> {
    return this.makeRequest(`/voting-records/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteVotingRecord(id: number): Promise<APIResponse<void>> {
    return this.makeRequest(`/voting-records/${id}`, {
      method: 'DELETE',
    });
  }

  async getVotingRecords(filters?: {
    politicianId?: number;
    billNumber?: string;
    dateRange?: { start: string; end: string };
  }): Promise<APIResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'dateRange' && typeof value === 'object' && 'start' in value && 'end' in value) {
            params.append('startDate', value.start);
            params.append('endDate', value.end);
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    return this.makeRequest(`/voting-records?${params}`);
  }

  // Document Management APIs
  async uploadDocument(documentData: FormData): Promise<APIResponse<any>> {
    const token = await AsyncStorage.getItem('adminToken');

    try {
      const response = await fetch(`${this.baseURL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: documentData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createDocument(documentData: any): Promise<APIResponse<any>> {
    return this.makeRequest('/documents', {
      method: 'POST',
      body: documentData,
    });
  }

  async updateDocument(id: number, updates: any): Promise<APIResponse<any>> {
    return this.makeRequest(`/documents/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteDocument(id: number): Promise<APIResponse<void>> {
    return this.makeRequest(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async getDocuments(filters?: {
    politicianId?: number;
    type?: string;
    dateRange?: { start: string; end: string };
  }): Promise<APIResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'dateRange' && typeof value === 'object' && 'start' in value && 'end' in value) {
            params.append('startDate', value.start);
            params.append('endDate', value.end);
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    return this.makeRequest(`/documents?${params}`);
  }

  // Analytics APIs
  async getAnalytics(period: '7d' | '30d' | '90d' = '30d'): Promise<APIResponse<any>> {
    return this.makeRequest(`/analytics?period=${period}`);
  }

  async getEngagementMetrics(period: string): Promise<APIResponse<any>> {
    return this.makeRequest(`/analytics/engagement?period=${period}`);
  }

  async getContentMetrics(): Promise<APIResponse<any>> {
    return this.makeRequest('/analytics/content');
  }

  async getPerformanceMetrics(): Promise<APIResponse<any>> {
    return this.makeRequest('/analytics/performance');
  }

  // Reports APIs
  async generateReport(templateId: string, format: string, options?: any): Promise<APIResponse<{
    reportId: string;
    downloadUrl: string;
    status: string;
  }>> {
    return this.makeRequest('/reports/generate', {
      method: 'POST',
      body: { templateId, format, options },
      timeout: 120000, // 2 minutes for report generation
    });
  }

  async getReportStatus(reportId: string): Promise<APIResponse<{
    status: 'pending' | 'completed' | 'failed';
    progress?: number;
    downloadUrl?: string;
    error?: string;
  }>> {
    return this.makeRequest(`/reports/${reportId}/status`);
  }

  async scheduleReport(scheduleData: {
    name: string;
    templateId: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    options?: any;
  }): Promise<APIResponse<any>> {
    return this.makeRequest('/reports/schedule', {
      method: 'POST',
      body: scheduleData,
    });
  }

  async getScheduledReports(): Promise<APIResponse<any[]>> {
    return this.makeRequest('/reports/scheduled');
  }

  async updateScheduledReport(id: string, updates: any): Promise<APIResponse<any>> {
    return this.makeRequest(`/reports/scheduled/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteScheduledReport(id: string): Promise<APIResponse<void>> {
    return this.makeRequest(`/reports/scheduled/${id}`, {
      method: 'DELETE',
    });
  }

  // Data Integrity APIs
  async runIntegrityCheck(checkType?: string): Promise<APIResponse<any>> {
    const params = checkType ? `?type=${checkType}` : '';
    return this.makeRequest(`/integrity/check${params}`, {
      method: 'POST',
      timeout: 60000,
    });
  }

  async getIntegrityReport(): Promise<APIResponse<any>> {
    return this.makeRequest('/integrity/report');
  }

  async autoFixIssues(issueIds: string[]): Promise<APIResponse<{ fixed: number; failed: string[] }>> {
    return this.makeRequest('/integrity/auto-fix', {
      method: 'POST',
      body: { issueIds },
    });
  }

  // System Management APIs
  async getSystemHealth(): Promise<APIResponse<any>> {
    return this.makeRequest('/system/health');
  }

  async clearCache(cacheType?: string): Promise<APIResponse<void>> {
    const params = cacheType ? `?type=${cacheType}` : '';
    return this.makeRequest(`/system/cache/clear${params}`, {
      method: 'POST',
    });
  }

  async getAuditLogs(filters?: {
    action?: string;
    userId?: number;
    dateRange?: { start: string; end: string };
    limit?: number;
  }): Promise<APIResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'dateRange' && typeof value === 'object' && 'start' in value && 'end' in value) {
            params.append('startDate', value.start);
            params.append('endDate', value.end);
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    return this.makeRequest(`/system/audit-logs?${params}`);
  }

  // User Management APIs (for super admins)
  async createAdminUser(userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    permissions: any[];
  }): Promise<APIResponse<any>> {
    return this.makeRequest('/users', {
      method: 'POST',
      body: userData,
    });
  }

  async updateAdminUser(id: number, updates: any): Promise<APIResponse<any>> {
    return this.makeRequest(`/users/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteAdminUser(id: number): Promise<APIResponse<void>> {
    return this.makeRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminUsers(): Promise<APIResponse<any[]>> {
    return this.makeRequest('/users');
  }

  // Bulk Operations with Progress Tracking
  async bulkOperation<T>(
    operation: string,
    data: any[],
    onProgress?: (progress: number, completed: number, total: number) => void
  ): Promise<APIResponse<T>> {
    const batchSize = 50; // Process in batches
    const batches = [];

    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    const results: any[] = [];
    let completed = 0;

    for (const batch of batches) {
      const response = await this.makeRequest(`/bulk/${operation}`, {
        method: 'POST',
        body: { items: batch },
        timeout: 120000,
      });

      if (response.success && response.data) {
        results.push(...(Array.isArray(response.data) ? response.data : [response.data]));
      }

      completed += batch.length;
      const progress = Math.round((completed / data.length) * 100);

      if (onProgress) {
        onProgress(progress, completed, data.length);
      }
    }

    return { success: true, data: results as T };
  }

  // Connection testing
  async testConnection(): Promise<APIResponse<{ status: string; timestamp: string }>> {
    return this.makeRequest('/health');
  }
}

export const adminAPI = new AdminAPIService();
export default adminAPI;