import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  showIcon?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again.',
  onRetry,
  retryText = 'Try Again',
  showIcon = true,
}) => {
  return (
    <View style={styles.container}>
      {showIcon && (
        <View style={styles.iconContainer}>
          <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <MaterialIcons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  title = 'Failed to load',
  message = 'Something went wrong',
  onRetry,
  compact = false,
}) => {
  return (
    <View style={[styles.errorCard, compact && styles.errorCardCompact]}>
      <View style={styles.errorHeader}>
        <MaterialIcons name="warning" size={compact ? 20 : 24} color="#EF4444" />
        <Text style={[styles.errorTitle, compact && styles.errorTitleCompact]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.errorMessage, compact && styles.errorMessageCompact]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.errorRetryButton, compact && styles.errorRetryButtonCompact]}
          onPress={onRetry}
        >
          <Text style={styles.errorRetryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface NetworkErrorProps {
  onRetry?: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry }) => {
  return (
    <ErrorDisplay
      title="No Internet Connection"
      message="Please check your internet connection and try again."
      onRetry={onRetry}
      retryText="Retry"
    />
  );
};

interface NotFoundErrorProps {
  message?: string;
  onGoBack?: () => void;
}

export const NotFoundError: React.FC<NotFoundErrorProps> = ({
  message = "The content you're looking for could not be found.",
  onGoBack,
}) => {
  return (
    <ErrorDisplay
      title="Not Found"
      message={message}
      onRetry={onGoBack}
      retryText="Go Back"
      showIcon={true}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  errorCardCompact: {
    padding: 12,
    margin: 8,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  errorTitleCompact: {
    fontSize: 14,
  },
  errorMessage: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
    marginBottom: 12,
  },
  errorMessageCompact: {
    fontSize: 12,
    marginBottom: 8,
  },
  errorRetryButton: {
    backgroundColor: '#dc2626',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  errorRetryButtonCompact: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  errorRetryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});