import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import PoliticianAPIService from './PoliticianAPIService';
import { PoliticianAPIResponse, PoliticianListResponse } from './PoliticianAPIService';

interface SyncStatus {
  lastSync: string;
  isOnline: boolean;
  pendingChanges: number;
  syncInProgress: boolean;
}

interface CachedData {
  politicians: PoliticianAPIResponse[];
  lastUpdated: string;
  version: string;
  total: number;
  page: number;
  limit: number;
}

class DataSyncService {
  private static readonly CACHE_KEY = 'politicians_cache';
  private static readonly SYNC_STATUS_KEY = 'sync_status';
  private static readonly CACHE_VERSION = '1.0.0';
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private static syncStatus: SyncStatus = {
    lastSync: '',
    isOnline: false,
    pendingChanges: 0,
    syncInProgress: false,
  };

  /**
   * Initialize the data sync service
   */
  static async initialize(): Promise<void> {
    try {
      // Load sync status from storage
      await this.loadSyncStatus();
      
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      this.syncStatus.isOnline = netInfo.isConnected || false;
      
      // Set up network listener
      NetInfo.addEventListener(state => {
        this.syncStatus.isOnline = state.isConnected || false;
        this.saveSyncStatus();
        
        // Auto-sync when coming back online
        if (state.isConnected && !this.syncStatus.syncInProgress) {
          this.syncData();
        }
      });
      
      console.log('DataSyncService initialized. Online:', this.syncStatus.isOnline);
    } catch (error) {
      console.error('Error initializing DataSyncService:', error);
    }
  }

  /**
   * Get politicians data (from cache or API)
   */
  static async getPoliticians(filters: any = {}): Promise<PoliticianListResponse> {
    try {
      // Check if we have cached data and it's not expired
      const cachedData = await this.getCachedData();
      const isCacheValid = cachedData && this.isCacheValid(cachedData);
      
      if (this.syncStatus.isOnline) {
        // Online: Try to fetch from API first
        try {
          const apiData = await PoliticianAPIService.getPoliticians(filters);
          
          // Cache the fresh data
          await this.cacheData(apiData);
          
          // Update sync status
          this.syncStatus.lastSync = new Date().toISOString();
          this.syncStatus.pendingChanges = 0;
          await this.saveSyncStatus();
          
          return apiData;
        } catch (apiError) {
          console.warn('API fetch failed, falling back to cache:', apiError);
          
          // Fallback to cache if available
          if (isCacheValid) {
            return this.formatCachedData(cachedData);
          }
          
          throw apiError;
        }
      } else {
        // Offline: Use cached data
        if (isCacheValid) {
          console.log('Using cached data (offline mode)');
          return this.formatCachedData(cachedData);
        } else {
          throw new Error('No cached data available and offline');
        }
      }
    } catch (error) {
      console.error('Error getting politicians data:', error);
      throw error;
    }
  }

  /**
   * Get politician by ID (from cache or API)
   */
  static async getPoliticianById(id: number): Promise<PoliticianAPIResponse> {
    try {
      if (this.syncStatus.isOnline) {
        try {
          const politician = await PoliticianAPIService.getPoliticianById(id);
          
          // Update cache with fresh data
          await this.updateCachedPolitician(politician);
          
          return politician;
        } catch (apiError) {
          console.warn('API fetch failed, falling back to cache:', apiError);
          
          // Fallback to cache
          const cachedData = await this.getCachedData();
          if (cachedData) {
            const politician = cachedData.politicians.find(p => p.id === id);
            if (politician) {
              return politician;
            }
          }
          
          throw apiError;
        }
      } else {
        // Offline: Use cached data
        const cachedData = await this.getCachedData();
        if (cachedData) {
          const politician = cachedData.politicians.find(p => p.id === id);
          if (politician) {
            return politician;
          }
        }
        
        throw new Error('Politician not found in cache and offline');
      }
    } catch (error) {
      console.error(`Error getting politician ${id}:`, error);
      throw error;
    }
  }

  /**
   * Sync data with the server
   */
  static async syncData(): Promise<void> {
    if (this.syncStatus.syncInProgress || !this.syncStatus.isOnline) {
      return;
    }

    try {
      this.syncStatus.syncInProgress = true;
      await this.saveSyncStatus();
      
      console.log('Starting data sync...');
      
      // Fetch fresh data from API
      const apiData = await PoliticianAPIService.getPoliticians();
      
      // Update cache
      await this.cacheData(apiData);
      
      // Update sync status
      this.syncStatus.lastSync = new Date().toISOString();
      this.syncStatus.pendingChanges = 0;
      this.syncStatus.syncInProgress = false;
      
      await this.saveSyncStatus();
      
      console.log('Data sync completed successfully');
    } catch (error) {
      console.error('Error syncing data:', error);
      this.syncStatus.syncInProgress = false;
      await this.saveSyncStatus();
      throw error;
    }
  }

  /**
   * Force refresh data from API
   */
  static async forceRefresh(): Promise<PoliticianListResponse> {
    try {
      console.log('Force refreshing data...');
      
      const apiData = await PoliticianAPIService.getPoliticians();
      
      // Update cache
      await this.cacheData(apiData);
      
      // Update sync status
      this.syncStatus.lastSync = new Date().toISOString();
      this.syncStatus.pendingChanges = 0;
      await this.saveSyncStatus();
      
      console.log('Force refresh completed');
      return apiData;
    } catch (error) {
      console.error('Error force refreshing data:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  static getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Check if data is stale and needs refresh
   */
  static isDataStale(): boolean {
    if (!this.syncStatus.lastSync) return true;
    
    const lastSyncTime = new Date(this.syncStatus.lastSync).getTime();
    const now = new Date().getTime();
    const timeSinceSync = now - lastSyncTime;
    
    return timeSinceSync > this.CACHE_EXPIRY;
  }

  /**
   * Clear all cached data
   */
  static async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      await AsyncStorage.removeItem(this.SYNC_STATUS_KEY);
      
      this.syncStatus = {
        lastSync: '',
        isOnline: false,
        pendingChanges: 0,
        syncInProgress: false,
      };
      
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  // Private helper methods

  private static async loadSyncStatus(): Promise<void> {
    try {
      const statusData = await AsyncStorage.getItem(this.SYNC_STATUS_KEY);
      if (statusData) {
        this.syncStatus = { ...this.syncStatus, ...JSON.parse(statusData) };
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  }

  private static async saveSyncStatus(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(this.syncStatus));
    } catch (error) {
      console.error('Error saving sync status:', error);
    }
  }

  private static async getCachedData(): Promise<CachedData | null> {
    try {
      const cachedData = await AsyncStorage.getItem(this.CACHE_KEY);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  private static async cacheData(data: PoliticianListResponse): Promise<void> {
    try {
      const cacheData: CachedData = {
        politicians: data.politicians,
        lastUpdated: new Date().toISOString(),
        version: this.CACHE_VERSION,
        total: data.total,
        page: data.page,
        limit: data.limit,
      };
      
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  private static async updateCachedPolitician(politician: PoliticianAPIResponse): Promise<void> {
    try {
      const cachedData = await this.getCachedData();
      if (cachedData) {
        const index = cachedData.politicians.findIndex(p => p.id === politician.id);
        if (index !== -1) {
          cachedData.politicians[index] = politician;
        } else {
          cachedData.politicians.push(politician);
        }
        
        cachedData.lastUpdated = new Date().toISOString();
        await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cachedData));
      }
    } catch (error) {
      console.error('Error updating cached politician:', error);
    }
  }

  private static isCacheValid(cachedData: CachedData): boolean {
    if (!cachedData || cachedData.version !== this.CACHE_VERSION) {
      return false;
    }
    
    const lastUpdated = new Date(cachedData.lastUpdated).getTime();
    const now = new Date().getTime();
    const timeSinceUpdate = now - lastUpdated;
    
    return timeSinceUpdate < this.CACHE_EXPIRY;
  }

  private static formatCachedData(cachedData: CachedData): PoliticianListResponse {
    return {
      politicians: cachedData.politicians,
      total: cachedData.total,
      page: cachedData.page,
      limit: cachedData.limit,
      has_more: cachedData.politicians.length < cachedData.total,
    };
  }
}

export default DataSyncService;
