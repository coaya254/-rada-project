import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class OfflineStorage {
  private static instance: OfflineStorage;
  private readonly CACHE_PREFIX = 'rada_cache_';
  private readonly DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in ms

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  // Store data with expiry
  async set<T>(key: string, data: T, expiryHours = 24): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: expiryHours * 60 * 60 * 1000,
      };

      const cacheKey = this.CACHE_PREFIX + key;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  }

  // Get data if not expired
  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) {
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if data has expired
      if (now - cacheItem.timestamp > cacheItem.expiry) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  // Remove specific item
  async remove(key: string): Promise<void> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  }

  // Clear all cached data
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  // Get cache size
  async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      return cacheKeys.length;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }

  // Get all cached keys
  async getAllCacheKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys
        .filter(key => key.startsWith(this.CACHE_PREFIX))
        .map(key => key.replace(this.CACHE_PREFIX, ''));
    } catch (error) {
      console.error('Error getting cache keys:', error);
      return [];
    }
  }

  // Check if data exists and is valid
  async isValid(key: string): Promise<boolean> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) {
        return false;
      }

      const cacheItem: CacheItem<any> = JSON.parse(cached);
      const now = Date.now();

      return now - cacheItem.timestamp <= cacheItem.expiry;
    } catch (error) {
      console.error('Error checking validity:', error);
      return false;
    }
  }

  // Cleanup expired items
  async cleanup(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));

      for (const cacheKey of cacheKeys) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const cacheItem: CacheItem<any> = JSON.parse(cached);
          const now = Date.now();

          if (now - cacheItem.timestamp > cacheItem.expiry) {
            await AsyncStorage.removeItem(cacheKey);
          }
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Store user preferences
  async setUserPreference(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`user_pref_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Error storing user preference:', error);
      throw error;
    }
  }

  // Get user preferences
  async getUserPreference(key: string, defaultValue?: any): Promise<any> {
    try {
      const value = await AsyncStorage.getItem(`user_pref_${key}`);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('Error retrieving user preference:', error);
      return defaultValue;
    }
  }

  // Store offline actions for later sync
  async addOfflineAction(action: any): Promise<void> {
    try {
      const actions = await this.getOfflineActions();
      actions.push({
        ...action,
        timestamp: Date.now(),
        id: Date.now().toString(),
      });

      await AsyncStorage.setItem('offline_actions', JSON.stringify(actions));
    } catch (error) {
      console.error('Error storing offline action:', error);
      throw error;
    }
  }

  // Get all offline actions
  async getOfflineActions(): Promise<any[]> {
    try {
      const actions = await AsyncStorage.getItem('offline_actions');
      return actions ? JSON.parse(actions) : [];
    } catch (error) {
      console.error('Error retrieving offline actions:', error);
      return [];
    }
  }

  // Clear offline actions after sync
  async clearOfflineActions(): Promise<void> {
    try {
      await AsyncStorage.removeItem('offline_actions');
    } catch (error) {
      console.error('Error clearing offline actions:', error);
      throw error;
    }
  }
}

export default OfflineStorage;