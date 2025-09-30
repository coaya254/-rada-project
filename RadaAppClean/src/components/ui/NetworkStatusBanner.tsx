import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface NetworkStatusBannerProps {
  onRetry?: () => void;
}

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({
  onRetry,
}) => {
  const { isConnected, networkType } = useNetworkStatus();
  const [visible, setVisible] = React.useState(!isConnected);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!isConnected && !visible) {
      // Show banner when going offline
      setVisible(true);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (isConnected && visible) {
      // Hide banner when coming back online
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
      });
    }
  }, [isConnected, visible, animatedValue]);

  if (!visible) {
    return null;
  }

  const getNetworkIcon = () => {
    switch (networkType) {
      case 'wifi':
        return 'wifi-off';
      case 'cellular':
        return 'signal-cellular-off';
      default:
        return 'cloud-off';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
          opacity: animatedValue,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={getNetworkIcon()}
            size={20}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isConnected ? 'Back Online' : 'No Internet Connection'}
          </Text>
          <Text style={styles.subtitle}>
            {isConnected
              ? 'Your connection has been restored'
              : 'Check your internet connection and try again'
            }
          </Text>
        </View>

        {!isConnected && onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EF4444',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default NetworkStatusBanner;