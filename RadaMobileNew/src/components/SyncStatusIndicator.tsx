import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import offlineStorage from '../services/offlineStorage';

interface SyncStatusIndicatorProps {
  onPress?: () => void;
  showDetails?: boolean;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ 
  onPress, 
  showDetails = false 
}) => {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: true,
    syncInProgress: false,
    unsyncedItems: 0,
    breakdown: { progress: 0, notes: 0, quiz: 0, queue: 0 }
  });
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadSyncStatus();
    const interval = setInterval(loadSyncStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (syncStatus.syncInProgress) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [syncStatus.syncInProgress]);

  const loadSyncStatus = async () => {
    try {
      const status = await offlineStorage.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSyncPress = async () => {
    if (syncStatus.syncInProgress) {
      Alert.alert('Sync in Progress', 'Please wait for the current sync to complete.');
      return;
    }

    if (!syncStatus.isOnline) {
      Alert.alert('Offline', 'You are currently offline. Sync will happen automatically when you go back online.');
      return;
    }

    try {
      const success = await offlineStorage.forceSync();
      if (success) {
        Alert.alert('Sync Complete', 'Your offline data has been synced successfully!');
        loadSyncStatus();
      } else {
        Alert.alert('Sync Failed', 'There was an error syncing your data. Please try again.');
      }
    } catch (error) {
      Alert.alert('Sync Error', 'An unexpected error occurred during sync.');
    }
  };

  const getStatusColor = () => {
    if (syncStatus.syncInProgress) return '#f59e0b';
    if (!syncStatus.isOnline) return '#ef4444';
    if (syncStatus.unsyncedItems > 0) return '#f59e0b';
    return '#10b981';
  };

  const getStatusIcon = () => {
    if (syncStatus.syncInProgress) return 'refresh';
    if (!syncStatus.isOnline) return 'wifi';
    if (syncStatus.unsyncedItems > 0) return 'exclamation-triangle';
    return 'check-circle';
  };

  const getStatusText = () => {
    if (syncStatus.syncInProgress) return 'Syncing...';
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.unsyncedItems > 0) return `${syncStatus.unsyncedItems} pending`;
    return 'Synced';
  };

  if (!showDetails && syncStatus.unsyncedItems === 0 && syncStatus.isOnline) {
    return null; // Don't show indicator when everything is synced
  }

  return (
    <TouchableOpacity 
      style={[styles.container, { borderLeftColor: getStatusColor() }]}
      onPress={onPress || handleSyncPress}
      disabled={syncStatus.syncInProgress}
    >
      <Animated.View style={[styles.iconContainer, { opacity: pulseAnim }]}>
        <Icon 
          name={getStatusIcon()} 
          size={16} 
          color={getStatusColor()}
          style={syncStatus.syncInProgress ? styles.rotatingIcon : {}}
        />
      </Animated.View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        
        {showDetails && syncStatus.unsyncedItems > 0 && (
          <Text style={styles.detailsText}>
            {syncStatus.breakdown.progress > 0 && `${syncStatus.breakdown.progress} progress`}
            {syncStatus.breakdown.notes > 0 && ` • ${syncStatus.breakdown.notes} notes`}
            {syncStatus.breakdown.quiz > 0 && ` • ${syncStatus.breakdown.quiz} quizzes`}
            {syncStatus.breakdown.queue > 0 && ` • ${syncStatus.breakdown.queue} queued`}
          </Text>
        )}
      </View>

      {syncStatus.syncInProgress && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
          <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 8,
  },
  rotatingIcon: {
    transform: [{ rotate: '360deg' }],
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f59e0b',
    marginHorizontal: 1,
  },
  loadingDotDelay1: {
    animationDelay: '0.2s',
  },
  loadingDotDelay2: {
    animationDelay: '0.4s',
  },
});

export default SyncStatusIndicator;

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import offlineStorage from '../services/offlineStorage';

interface SyncStatusIndicatorProps {
  onPress?: () => void;
  showDetails?: boolean;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ 
  onPress, 
  showDetails = false 
}) => {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: true,
    syncInProgress: false,
    unsyncedItems: 0,
    breakdown: { progress: 0, notes: 0, quiz: 0, queue: 0 }
  });
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadSyncStatus();
    const interval = setInterval(loadSyncStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (syncStatus.syncInProgress) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [syncStatus.syncInProgress]);

  const loadSyncStatus = async () => {
    try {
      const status = await offlineStorage.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSyncPress = async () => {
    if (syncStatus.syncInProgress) {
      Alert.alert('Sync in Progress', 'Please wait for the current sync to complete.');
      return;
    }

    if (!syncStatus.isOnline) {
      Alert.alert('Offline', 'You are currently offline. Sync will happen automatically when you go back online.');
      return;
    }

    try {
      const success = await offlineStorage.forceSync();
      if (success) {
        Alert.alert('Sync Complete', 'Your offline data has been synced successfully!');
        loadSyncStatus();
      } else {
        Alert.alert('Sync Failed', 'There was an error syncing your data. Please try again.');
      }
    } catch (error) {
      Alert.alert('Sync Error', 'An unexpected error occurred during sync.');
    }
  };

  const getStatusColor = () => {
    if (syncStatus.syncInProgress) return '#f59e0b';
    if (!syncStatus.isOnline) return '#ef4444';
    if (syncStatus.unsyncedItems > 0) return '#f59e0b';
    return '#10b981';
  };

  const getStatusIcon = () => {
    if (syncStatus.syncInProgress) return 'refresh';
    if (!syncStatus.isOnline) return 'wifi';
    if (syncStatus.unsyncedItems > 0) return 'exclamation-triangle';
    return 'check-circle';
  };

  const getStatusText = () => {
    if (syncStatus.syncInProgress) return 'Syncing...';
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.unsyncedItems > 0) return `${syncStatus.unsyncedItems} pending`;
    return 'Synced';
  };

  if (!showDetails && syncStatus.unsyncedItems === 0 && syncStatus.isOnline) {
    return null; // Don't show indicator when everything is synced
  }

  return (
    <TouchableOpacity 
      style={[styles.container, { borderLeftColor: getStatusColor() }]}
      onPress={onPress || handleSyncPress}
      disabled={syncStatus.syncInProgress}
    >
      <Animated.View style={[styles.iconContainer, { opacity: pulseAnim }]}>
        <Icon 
          name={getStatusIcon()} 
          size={16} 
          color={getStatusColor()}
          style={syncStatus.syncInProgress ? styles.rotatingIcon : {}}
        />
      </Animated.View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        
        {showDetails && syncStatus.unsyncedItems > 0 && (
          <Text style={styles.detailsText}>
            {syncStatus.breakdown.progress > 0 && `${syncStatus.breakdown.progress} progress`}
            {syncStatus.breakdown.notes > 0 && ` • ${syncStatus.breakdown.notes} notes`}
            {syncStatus.breakdown.quiz > 0 && ` • ${syncStatus.breakdown.quiz} quizzes`}
            {syncStatus.breakdown.queue > 0 && ` • ${syncStatus.breakdown.queue} queued`}
          </Text>
        )}
      </View>

      {syncStatus.syncInProgress && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
          <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 8,
  },
  rotatingIcon: {
    transform: [{ rotate: '360deg' }],
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f59e0b',
    marginHorizontal: 1,
  },
  loadingDotDelay1: {
    animationDelay: '0.2s',
  },
  loadingDotDelay2: {
    animationDelay: '0.4s',
  },
});

export default SyncStatusIndicator;
