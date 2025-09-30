import { useState, useEffect } from 'react';
import NetworkService from '../services/NetworkService';

interface NetworkStatus {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean | null;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    type: 'unknown',
    isInternetReachable: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const networkService = NetworkService.getInstance();

    // Get initial network status
    const checkInitialStatus = async () => {
      try {
        const connectionInfo = await networkService.getConnectionInfo();
        if (connectionInfo) {
          setNetworkStatus({
            isConnected: connectionInfo.isConnected ?? false,
            type: connectionInfo.type || 'unknown',
            isInternetReachable: connectionInfo.isInternetReachable,
          });
        }
      } catch (error) {
        console.error('Error getting initial network status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Network change listener
    const handleNetworkChange = (isConnected: boolean) => {
      setNetworkStatus(prev => ({
        ...prev,
        isConnected,
      }));
    };

    // Add listener
    networkService.addNetworkListener(handleNetworkChange);
    checkInitialStatus();

    // Cleanup
    return () => {
      networkService.removeNetworkListener(handleNetworkChange);
    };
  }, []);

  const refreshNetworkStatus = async () => {
    const networkService = NetworkService.getInstance();
    try {
      const connectionInfo = await networkService.getConnectionInfo();
      if (connectionInfo) {
        setNetworkStatus({
          isConnected: connectionInfo.isConnected ?? false,
          type: connectionInfo.type || 'unknown',
          isInternetReachable: connectionInfo.isInternetReachable,
        });
      }
    } catch (error) {
      console.error('Error refreshing network status:', error);
    }
  };

  return {
    isConnected: networkStatus.isConnected,
    networkType: networkStatus.type,
    isInternetReachable: networkStatus.isInternetReachable,
    isLoading,
    refreshNetworkStatus,
  };
};