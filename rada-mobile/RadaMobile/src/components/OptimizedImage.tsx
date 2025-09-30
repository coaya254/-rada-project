import React, { useState, useCallback, memo } from 'react';
import { Image, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: any;
  placeholder?: string;
  fallback?: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoad?: () => void;
  onError?: () => void;
  showLoadingIndicator?: boolean;
  blurRadius?: number;
  cachePolicy?: 'memory' | 'disk' | 'memory-disk';
  quality?: 'low' | 'medium' | 'high';
  lazy?: boolean;
  threshold?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  source,
  style,
  placeholder = 'https://via.placeholder.com/300x200?text=Loading...',
  fallback = 'https://via.placeholder.com/300x200?text=Error',
  resizeMode = 'cover',
  onLoad,
  onError,
  showLoadingIndicator = true,
  blurRadius = 0,
  cachePolicy = 'memory-disk',
  quality = 'medium',
  lazy = false,
  threshold = 0.1
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(!lazy);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
    onError?.();
  }, [onError]);

  const getOptimizedSource = useCallback(() => {
    if (typeof source === 'number') return source;
    
    const uri = source.uri;
    if (!uri) return { uri: fallback };

    // Add quality parameters for optimization
    const qualityParams = {
      low: '?q=60&w=300',
      medium: '?q=80&w=600',
      high: '?q=95&w=1200'
    };

    const optimizedUri = uri.includes('?') 
      ? `${uri}&${qualityParams[quality].substring(1)}`
      : `${uri}${qualityParams[quality]}`;

    return { uri: optimizedUri };
  }, [source, quality, fallback]);

  const renderImage = () => {
    if (error) {
      return (
        <View style={[styles.errorContainer, style]}>
          <Text style={styles.errorText}>Failed to load image</Text>
        </View>
      );
    }

    if (loading && showLoadingIndicator) {
      return (
        <View style={[styles.loadingContainer, style]}>
          <ActivityIndicator size="large" color="#667eea" />
          {blurRadius > 0 && (
            <BlurView intensity={blurRadius} style={StyleSheet.absoluteFillObject} />
          )}
        </View>
      );
    }

    return (
      <Image
        source={getOptimizedSource()}
        style={style}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
        // Performance optimizations
        fadeDuration={200}
        progressiveRenderingEnabled={true}
        removeClippedSubviews={true}
        // Caching
        cache={cachePolicy}
      />
    );
  };

  if (!inView && lazy) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderText}>Loading...</Text>
      </View>
    );
  }

  return renderImage();
});

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    color: '#666',
    fontSize: 14,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
