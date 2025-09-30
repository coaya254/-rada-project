import NetInfo from '@react-native-community/netinfo';
import OfflineStorage from './OfflineStorage';

type NetworkChangeCallback = (isConnected: boolean) => void;

class NetworkService {
  private static instance: NetworkService;
  private isConnected: boolean = true;
  private listeners: NetworkChangeCallback[] = [];
  private offlineStorage = OfflineStorage.getInstance();

  static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
      NetworkService.instance.initialize();
    }
    return NetworkService.instance;
  }

  private initialize() {
    // Listen for network changes
    NetInfo.addEventListener(state => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected ?? false;

      // Notify listeners of network change
      this.listeners.forEach(callback => {
        callback(this.isConnected);
      });

      // Sync offline actions when coming back online
      if (!wasConnected && this.isConnected) {
        this.syncOfflineActions();
      }
    });
  }

  // Get current network status
  getNetworkStatus(): boolean {
    return this.isConnected;
  }

  // Add network change listener
  addNetworkListener(callback: NetworkChangeCallback): void {
    this.listeners.push(callback);
  }

  // Remove network change listener
  removeNetworkListener(callback: NetworkChangeCallback): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Check network connectivity
  async checkConnectivity(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      this.isConnected = state.isConnected ?? false;
      return this.isConnected;
    } catch (error) {
      console.error('Error checking connectivity:', error);
      return false;
    }
  }

  // Execute request with offline support
  async executeWithOfflineSupport<T>(
    key: string,
    apiCall: () => Promise<T>,
    useCache = true,
    cacheHours = 24
  ): Promise<T> {
    try {
      if (this.isConnected) {
        // Online: Make API call and cache result
        const result = await apiCall();
        await this.offlineStorage.set(key, result, cacheHours);
        return result;
      } else {
        // Offline: Try to get from cache
        if (useCache) {
          const cachedData = await this.offlineStorage.get<T>(key);
          if (cachedData) {
            return cachedData;
          }
        }
        throw new Error('No internet connection and no cached data available');
      }
    } catch (error) {
      // If API call fails, try cache as fallback
      if (useCache) {
        const cachedData = await this.offlineStorage.get<T>(key);
        if (cachedData) {
          return cachedData;
        }
      }
      throw error;
    }
  }

  // Queue action for later execution when online
  async queueOfflineAction(action: {
    type: string;
    endpoint: string;
    method: string;
    data?: any;
  }): Promise<void> {
    await this.offlineStorage.addOfflineAction(action);
  }

  // Sync all offline actions
  private async syncOfflineActions(): Promise<void> {
    try {
      const actions = await this.offlineStorage.getOfflineActions();

      if (actions.length === 0) {
        return;
      }

      console.log(`Syncing ${actions.length} offline actions...`);

      // Process each action
      for (const action of actions) {
        try {
          await this.executeOfflineAction(action);
        } catch (error) {
          console.error('Error syncing action:', action, error);
          // Keep failed actions for retry
          continue;
        }
      }

      // Clear successfully synced actions
      await this.offlineStorage.clearOfflineActions();
      console.log('Offline actions synced successfully');
    } catch (error) {
      console.error('Error syncing offline actions:', error);
    }
  }

  // Execute a single offline action
  private async executeOfflineAction(action: any): Promise<void> {
    // This would integrate with your API service
    // For now, we'll just simulate the execution
    console.log('Executing offline action:', action);

    // Example implementation:
    // switch (action.type) {
    //   case 'CREATE_POST':
    //     await apiService.createPost(action.data);
    //     break;
    //   case 'LIKE_POST':
    //     await apiService.likePost(action.data.postId);
    //     break;
    //   case 'UPDATE_PROFILE':
    //     await apiService.updateProfile(action.data);
    //     break;
    //   default:
    //     console.warn('Unknown offline action type:', action.type);
    // }
  }

  // Get network type information
  async getNetworkType(): Promise<string> {
    try {
      const state = await NetInfo.fetch();
      return state.type || 'unknown';
    } catch (error) {
      console.error('Error getting network type:', error);
      return 'unknown';
    }
  }

  // Check if using cellular data
  async isUsingCellular(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.type === 'cellular';
    } catch (error) {
      console.error('Error checking cellular:', error);
      return false;
    }
  }

  // Get detailed connection info
  async getConnectionInfo(): Promise<any> {
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
        details: state.details,
      };
    } catch (error) {
      console.error('Error getting connection info:', error);
      return null;
    }
  }
}

export default NetworkService;