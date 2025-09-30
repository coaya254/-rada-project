import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import performanceService from '../services/performanceService';

const { width: screenWidth } = Dimensions.get('window');

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  placeholder?: string;
  showPlaceholder?: boolean;
  lazy?: boolean;
  cache?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  onPress?: () => void;
  children?: React.ReactNode;
  blurRadius?: number;
  fadeIn?: boolean;
  aspectRatio?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  placeholder,
  showPlaceholder = true,
  lazy = true,
  cache = true,
  quality = 0.8,
  onLoad,
  onError,
  onPress,
  children,
  blurRadius = 0,
  fadeIn = true,
  aspectRatio,
  maxWidth = screenWidth,
  maxHeight = screenWidth,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const isMounted = useRef(true);

  // Calculate optimized dimensions
  const calculateDimensions = useCallback(() => {
    if (typeof source === 'number') {
      return { width: maxWidth, height: maxHeight };
    }

    const uri = source.uri;
    if (!uri) return { width: maxWidth, height: maxHeight };

    // Extract dimensions from URL if available
    const urlParams = new URLSearchParams(uri.split('?')[1]);
    const width = urlParams.get('w') ? parseInt(urlParams.get('w')!) : maxWidth;
    const height = urlParams.get('h') ? parseInt(urlParams.get('h')!) : maxHeight;

    // Apply aspect ratio if provided
    if (aspectRatio) {
      const calculatedHeight = width / aspectRatio;
      return { width, height: calculatedHeight };
    }

    return { width, height };
  }, [source, maxWidth, maxHeight, aspectRatio]);

  const dimensions = calculateDimensions();

  // Load image with performance tracking
  const loadImage = useCallback(async () => {
    if (typeof source === 'number') {
      setImageUri(null);
      setLoading(false);
      setImageLoaded(true);
      return;
    }

    const uri = source.uri;
    if (!uri) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      performanceService.startTiming(`image-load-${uri}`);
      
      // Check cache first
      if (cache) {
        const cachedUri = await getCachedImage(uri);
        if (cachedUri) {
          setImageUri(cachedUri);
          setLoading(false);
          setImageLoaded(true);
          performanceService.endTiming(`image-load-${uri}`);
          return;
        }
      }

      // Load image
      const imageSource = { uri };
      setImageUri(uri);
      
      // Simulate loading time for performance tracking
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setLoading(false);
      setImageLoaded(true);
      performanceService.endTiming(`image-load-${uri}`);
      
    } catch (err) {
      console.error('Image load error:', err);
      setError(true);
      setLoading(false);
      performanceService.endTiming(`image-load-${uri}`);
    }
  }, [source, cache]);

  // Get cached image
  const getCachedImage = async (uri: string): Promise<string | null> => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const cacheKey = `image_cache_${uri}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached) {
        const { uri: cachedUri, timestamp } = JSON.parse(cached);
        const now = Date.now();
        const cacheAge = now - timestamp;
        
        // Cache valid for 24 hours
        if (cacheAge < 24 * 60 * 60 * 1000) {
          return cachedUri;
        }
      }
    } catch (error) {
      console.error('Cache retrieval error:', error);
    }
    return null;
  };

  // Cache image
  const cacheImage = async (uri: string) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const cacheKey = `image_cache_${uri}`;
      const cacheData = {
        uri,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  };

  // Handle image load
  const handleLoad = useCallback(() => {
    if (!isMounted.current) return;
    
    setImageLoaded(true);
    setLoading(false);
    
    if (fadeIn) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    onLoad?.();
  }, [fadeAnim, scaleAnim, fadeIn, onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    if (!isMounted.current) return;
    
    setError(true);
    setLoading(false);
    onError?.();
  }, [onError]);

  // Load image on mount
  useEffect(() => {
    if (lazy) {
      // Lazy load with intersection observer simulation
      const timer = setTimeout(() => {
        if (isMounted.current) {
          loadImage();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      loadImage();
    }
  }, [loadImage, lazy]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Cache image when loaded
  useEffect(() => {
    if (imageLoaded && typeof source === 'object' && source.uri && cache) {
      cacheImage(source.uri);
    }
  }, [imageLoaded, source, cache]);

  const renderContent = () => {
    if (loading && showPlaceholder) {
      return (
        <View style={[styles.placeholder, dimensions]}>
          <ActivityIndicator size="small" color="#667eea" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.errorContainer, dimensions]}>
          <View style={styles.errorIcon}>
            {/* Error icon */}
          </View>
        </View>
      );
    }

    const imageStyle = [
      styles.image,
      dimensions,
      { opacity: fadeIn ? fadeAnim : 1 },
      { transform: [{ scale: fadeIn ? scaleAnim : 1 }] },
      style,
    ];

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
          <Animated.View style={imageStyle}>
            <Image
              source={typeof source === 'number' ? source : { uri: imageUri || '' }}
              style={[styles.image, dimensions]}
              resizeMode={resizeMode}
              onLoad={handleLoad}
              onError={handleError}
            />
            {children}
          </Animated.View>
        </TouchableOpacity>
      );
    }

    return (
      <Animated.View style={imageStyle}>
        <Image
          source={typeof source === 'number' ? source : { uri: imageUri || '' }}
          style={[styles.image, dimensions]}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
        />
        {children}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, dimensions]}>
      {renderContent()}
      {blurRadius > 0 && imageLoaded && (
        <BlurView
          intensity={blurRadius}
          style={[styles.blurOverlay, dimensions]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#ef4444',
    borderRadius: 12,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default OptimizedImage;

import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import performanceService from '../services/performanceService';

const { width: screenWidth } = Dimensions.get('window');

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  placeholder?: string;
  showPlaceholder?: boolean;
  lazy?: boolean;
  cache?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  onPress?: () => void;
  children?: React.ReactNode;
  blurRadius?: number;
  fadeIn?: boolean;
  aspectRatio?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  placeholder,
  showPlaceholder = true,
  lazy = true,
  cache = true,
  quality = 0.8,
  onLoad,
  onError,
  onPress,
  children,
  blurRadius = 0,
  fadeIn = true,
  aspectRatio,
  maxWidth = screenWidth,
  maxHeight = screenWidth,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const isMounted = useRef(true);

  // Calculate optimized dimensions
  const calculateDimensions = useCallback(() => {
    if (typeof source === 'number') {
      return { width: maxWidth, height: maxHeight };
    }

    const uri = source.uri;
    if (!uri) return { width: maxWidth, height: maxHeight };

    // Extract dimensions from URL if available
    const urlParams = new URLSearchParams(uri.split('?')[1]);
    const width = urlParams.get('w') ? parseInt(urlParams.get('w')!) : maxWidth;
    const height = urlParams.get('h') ? parseInt(urlParams.get('h')!) : maxHeight;

    // Apply aspect ratio if provided
    if (aspectRatio) {
      const calculatedHeight = width / aspectRatio;
      return { width, height: calculatedHeight };
    }

    return { width, height };
  }, [source, maxWidth, maxHeight, aspectRatio]);

  const dimensions = calculateDimensions();

  // Load image with performance tracking
  const loadImage = useCallback(async () => {
    if (typeof source === 'number') {
      setImageUri(null);
      setLoading(false);
      setImageLoaded(true);
      return;
    }

    const uri = source.uri;
    if (!uri) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      performanceService.startTiming(`image-load-${uri}`);
      
      // Check cache first
      if (cache) {
        const cachedUri = await getCachedImage(uri);
        if (cachedUri) {
          setImageUri(cachedUri);
          setLoading(false);
          setImageLoaded(true);
          performanceService.endTiming(`image-load-${uri}`);
          return;
        }
      }

      // Load image
      const imageSource = { uri };
      setImageUri(uri);
      
      // Simulate loading time for performance tracking
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setLoading(false);
      setImageLoaded(true);
      performanceService.endTiming(`image-load-${uri}`);
      
    } catch (err) {
      console.error('Image load error:', err);
      setError(true);
      setLoading(false);
      performanceService.endTiming(`image-load-${uri}`);
    }
  }, [source, cache]);

  // Get cached image
  const getCachedImage = async (uri: string): Promise<string | null> => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const cacheKey = `image_cache_${uri}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached) {
        const { uri: cachedUri, timestamp } = JSON.parse(cached);
        const now = Date.now();
        const cacheAge = now - timestamp;
        
        // Cache valid for 24 hours
        if (cacheAge < 24 * 60 * 60 * 1000) {
          return cachedUri;
        }
      }
    } catch (error) {
      console.error('Cache retrieval error:', error);
    }
    return null;
  };

  // Cache image
  const cacheImage = async (uri: string) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const cacheKey = `image_cache_${uri}`;
      const cacheData = {
        uri,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  };

  // Handle image load
  const handleLoad = useCallback(() => {
    if (!isMounted.current) return;
    
    setImageLoaded(true);
    setLoading(false);
    
    if (fadeIn) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    onLoad?.();
  }, [fadeAnim, scaleAnim, fadeIn, onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    if (!isMounted.current) return;
    
    setError(true);
    setLoading(false);
    onError?.();
  }, [onError]);

  // Load image on mount
  useEffect(() => {
    if (lazy) {
      // Lazy load with intersection observer simulation
      const timer = setTimeout(() => {
        if (isMounted.current) {
          loadImage();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      loadImage();
    }
  }, [loadImage, lazy]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Cache image when loaded
  useEffect(() => {
    if (imageLoaded && typeof source === 'object' && source.uri && cache) {
      cacheImage(source.uri);
    }
  }, [imageLoaded, source, cache]);

  const renderContent = () => {
    if (loading && showPlaceholder) {
      return (
        <View style={[styles.placeholder, dimensions]}>
          <ActivityIndicator size="small" color="#667eea" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.errorContainer, dimensions]}>
          <View style={styles.errorIcon}>
            {/* Error icon */}
          </View>
        </View>
      );
    }

    const imageStyle = [
      styles.image,
      dimensions,
      { opacity: fadeIn ? fadeAnim : 1 },
      { transform: [{ scale: fadeIn ? scaleAnim : 1 }] },
      style,
    ];

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
          <Animated.View style={imageStyle}>
            <Image
              source={typeof source === 'number' ? source : { uri: imageUri || '' }}
              style={[styles.image, dimensions]}
              resizeMode={resizeMode}
              onLoad={handleLoad}
              onError={handleError}
            />
            {children}
          </Animated.View>
        </TouchableOpacity>
      );
    }

    return (
      <Animated.View style={imageStyle}>
        <Image
          source={typeof source === 'number' ? source : { uri: imageUri || '' }}
          style={[styles.image, dimensions]}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
        />
        {children}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, dimensions]}>
      {renderContent()}
      {blurRadius > 0 && imageLoaded && (
        <BlurView
          intensity={blurRadius}
          style={[styles.blurOverlay, dimensions]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#ef4444',
    borderRadius: 12,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default OptimizedImage;
