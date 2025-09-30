import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#3B82F6',
  message = 'Loading...',
  overlay = false,
}) => {
  const containerStyle = overlay ? [styles.container, styles.overlay] : styles.container;

  return (
    <View style={containerStyle}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color={color} />
        {message && (
          <Text style={[styles.message, { color }]}>{message}</Text>
        )}
      </View>
    </View>
  );
};

interface LoadingCardProps {
  message?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  message = 'Loading content...',
}) => {
  return (
    <View style={styles.loadingCard}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.loadingCardText}>{message}</Text>
    </View>
  );
};

interface LoadingListItemProps {
  count?: number;
}

export const LoadingListItem: React.FC<LoadingListItemProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
            <View style={[styles.skeletonLine, styles.skeletonLineVeryShort]} />
          </View>
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 16,
  },
  loadingCardText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  skeletonAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e9ecef',
    marginRight: 12,
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
  },
  skeletonLineShort: {
    width: '70%',
  },
  skeletonLineVeryShort: {
    width: '40%',
  },
});