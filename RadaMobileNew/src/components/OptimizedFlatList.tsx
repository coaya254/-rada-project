import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import performanceService from '../services/performanceService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OptimizedFlatListProps {
  data: any[];
  renderItem: ({ item, index }: { item: any; index: number }) => React.ReactElement;
  keyExtractor: (item: any, index: number) => string;
  onEndReached?: () => void;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  loading?: boolean;
  emptyComponent?: React.ReactElement;
  headerComponent?: React.ReactElement;
  footerComponent?: React.ReactElement;
  itemHeight?: number;
  estimatedItemSize?: number;
  horizontal?: boolean;
  numColumns?: number;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  contentContainerStyle?: any;
  style?: any;
  onScroll?: (event: any) => void;
  scrollEventThrottle?: number;
  removeClippedSubviews?: boolean;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  initialNumToRender?: number;
  updateCellsBatchingPeriod?: number;
  getItemLayout?: (data: any, index: number) => { length: number; offset: number; index: number };
  performanceTracking?: boolean;
  performanceName?: string;
}

const OptimizedFlatList: React.FC<OptimizedFlatListProps> = ({
  data = [],
  renderItem,
  keyExtractor,
  onEndReached,
  onRefresh,
  refreshing = false,
  loading = false,
  emptyComponent,
  headerComponent,
  footerComponent,
  itemHeight,
  estimatedItemSize = 100,
  horizontal = false,
  numColumns = 1,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = false,
  contentContainerStyle,
  style,
  onScroll,
  scrollEventThrottle = 16,
  removeClippedSubviews = true,
  maxToRenderPerBatch = 10,
  windowSize = 10,
  initialNumToRender = 5,
  updateCellsBatchingPeriod = 50,
  getItemLayout,
  performanceTracking = true,
  performanceName = 'list',
}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const lastScrollTime = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Performance tracking
  useEffect(() => {
    if (performanceTracking) {
      performanceService.startTiming(`list-${performanceName}-render`);
    }
  }, [data, performanceTracking, performanceName]);

  // Memoized render item to prevent unnecessary re-renders
  const memoizedRenderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (performanceTracking) {
        performanceService.startTiming(`list-${performanceName}-item-${index}`);
      }

      const element = renderItem({ item, index });

      if (performanceTracking) {
        performanceService.endTiming(`list-${performanceName}-item-${index}`);
      }

      return element;
    },
    [renderItem, performanceTracking, performanceName]
  );

  // Memoized key extractor
  const memoizedKeyExtractor = useCallback(
    (item: any, index: number) => {
      return keyExtractor(item, index);
    },
    [keyExtractor]
  );

  // Memoized get item layout for better performance
  const memoizedGetItemLayout = useCallback(
    (data: any, index: number) => {
      if (getItemLayout) {
        return getItemLayout(data, index);
      }

      if (itemHeight) {
        return {
          length: itemHeight,
          offset: itemHeight * index,
          index,
        };
      }

      return {
        length: estimatedItemSize,
        offset: estimatedItemSize * index,
        index,
      };
    },
    [getItemLayout, itemHeight, estimatedItemSize]
  );

  // Handle scroll events with performance tracking
  const handleScroll = useCallback(
    (event: any) => {
      const now = Date.now();
      const timeDelta = now - lastScrollTime.current;
      lastScrollTime.current = now;

      if (timeDelta > 0) {
        const velocity = Math.abs(event.nativeEvent.contentOffset.y) / timeDelta;
        setScrollVelocity(velocity);
      }

      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Set timeout to detect when scrolling stops
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
        setScrollVelocity(0);
      }, 150);

      onScroll?.(event);
    },
    [onScroll]
  );

  // Handle end reached with throttling
  const handleEndReached = useCallback(() => {
    if (onEndReached && !loading && !refreshing) {
      onEndReached();
    }
  }, [onEndReached, loading, refreshing]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh && !refreshing) {
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh error:', error);
      }
    }
  }, [onRefresh, refreshing]);

  // Memoized empty component
  const memoizedEmptyComponent = useMemo(() => {
    if (emptyComponent) {
      return emptyComponent;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No items to display</Text>
      </View>
    );
  }, [emptyComponent]);

  // Memoized footer component
  const memoizedFooterComponent = useMemo(() => {
    if (loading && data.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="small" color="#667eea" />
          <Text style={styles.footerText}>Loading more...</Text>
        </View>
      );
    }

    return footerComponent;
  }, [loading, data.length, footerComponent]);

  // Memoized refresh control
  const memoizedRefreshControl = useMemo(() => {
    if (!onRefresh) return undefined;

    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor="#667eea"
        colors={['#667eea']}
        progressBackgroundColor="#ffffff"
      />
    );
  }, [refreshing, handleRefresh, onRefresh]);

  // Performance optimizations based on data size
  const performanceConfig = useMemo(() => {
    const dataSize = data.length;
    
    if (dataSize < 50) {
      return {
        removeClippedSubviews: false,
        maxToRenderPerBatch: 20,
        windowSize: 20,
        initialNumToRender: 10,
        updateCellsBatchingPeriod: 100,
      };
    } else if (dataSize < 200) {
      return {
        removeClippedSubviews: true,
        maxToRenderPerBatch: 15,
        windowSize: 15,
        initialNumToRender: 8,
        updateCellsBatchingPeriod: 75,
      };
    } else {
      return {
        removeClippedSubviews: true,
        maxToRenderPerBatch: 10,
        windowSize: 10,
        initialNumToRender: 5,
        updateCellsBatchingPeriod: 50,
      };
    }
  }, [data.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Track performance when data changes
  useEffect(() => {
    if (performanceTracking) {
      performanceService.endTiming(`list-${performanceName}-render`);
    }
  }, [data, performanceTracking, performanceName]);

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      getItemLayout={memoizedGetItemLayout}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      onScroll={handleScroll}
      scrollEventThrottle={scrollEventThrottle}
      refreshControl={memoizedRefreshControl}
      ListEmptyComponent={memoizedEmptyComponent}
      ListHeaderComponent={headerComponent}
      ListFooterComponent={memoizedFooterComponent}
      horizontal={horizontal}
      numColumns={numColumns}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      contentContainerStyle={[
        styles.contentContainer,
        contentContainerStyle,
      ]}
      style={[styles.container, style]}
      removeClippedSubviews={performanceConfig.removeClippedSubviews}
      maxToRenderPerBatch={performanceConfig.maxToRenderPerBatch}
      windowSize={performanceConfig.windowSize}
      initialNumToRender={performanceConfig.initialNumToRender}
      updateCellsBatchingPeriod={performanceConfig.updateCellsBatchingPeriod}
      // Performance optimizations
      disableVirtualization={false}
      legacyImplementation={false}
      // Memory optimizations
      onScrollToIndexFailed={(info) => {
        console.warn('Scroll to index failed:', info);
      }}
      // Accessibility
      accessibilityRole="list"
      accessibilityLabel="Optimized list"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
});

export default OptimizedFlatList;

import {
  FlatList,
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import performanceService from '../services/performanceService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OptimizedFlatListProps {
  data: any[];
  renderItem: ({ item, index }: { item: any; index: number }) => React.ReactElement;
  keyExtractor: (item: any, index: number) => string;
  onEndReached?: () => void;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  loading?: boolean;
  emptyComponent?: React.ReactElement;
  headerComponent?: React.ReactElement;
  footerComponent?: React.ReactElement;
  itemHeight?: number;
  estimatedItemSize?: number;
  horizontal?: boolean;
  numColumns?: number;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  contentContainerStyle?: any;
  style?: any;
  onScroll?: (event: any) => void;
  scrollEventThrottle?: number;
  removeClippedSubviews?: boolean;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  initialNumToRender?: number;
  updateCellsBatchingPeriod?: number;
  getItemLayout?: (data: any, index: number) => { length: number; offset: number; index: number };
  performanceTracking?: boolean;
  performanceName?: string;
}

const OptimizedFlatList: React.FC<OptimizedFlatListProps> = ({
  data = [],
  renderItem,
  keyExtractor,
  onEndReached,
  onRefresh,
  refreshing = false,
  loading = false,
  emptyComponent,
  headerComponent,
  footerComponent,
  itemHeight,
  estimatedItemSize = 100,
  horizontal = false,
  numColumns = 1,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = false,
  contentContainerStyle,
  style,
  onScroll,
  scrollEventThrottle = 16,
  removeClippedSubviews = true,
  maxToRenderPerBatch = 10,
  windowSize = 10,
  initialNumToRender = 5,
  updateCellsBatchingPeriod = 50,
  getItemLayout,
  performanceTracking = true,
  performanceName = 'list',
}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const lastScrollTime = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Performance tracking
  useEffect(() => {
    if (performanceTracking) {
      performanceService.startTiming(`list-${performanceName}-render`);
    }
  }, [data, performanceTracking, performanceName]);

  // Memoized render item to prevent unnecessary re-renders
  const memoizedRenderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (performanceTracking) {
        performanceService.startTiming(`list-${performanceName}-item-${index}`);
      }

      const element = renderItem({ item, index });

      if (performanceTracking) {
        performanceService.endTiming(`list-${performanceName}-item-${index}`);
      }

      return element;
    },
    [renderItem, performanceTracking, performanceName]
  );

  // Memoized key extractor
  const memoizedKeyExtractor = useCallback(
    (item: any, index: number) => {
      return keyExtractor(item, index);
    },
    [keyExtractor]
  );

  // Memoized get item layout for better performance
  const memoizedGetItemLayout = useCallback(
    (data: any, index: number) => {
      if (getItemLayout) {
        return getItemLayout(data, index);
      }

      if (itemHeight) {
        return {
          length: itemHeight,
          offset: itemHeight * index,
          index,
        };
      }

      return {
        length: estimatedItemSize,
        offset: estimatedItemSize * index,
        index,
      };
    },
    [getItemLayout, itemHeight, estimatedItemSize]
  );

  // Handle scroll events with performance tracking
  const handleScroll = useCallback(
    (event: any) => {
      const now = Date.now();
      const timeDelta = now - lastScrollTime.current;
      lastScrollTime.current = now;

      if (timeDelta > 0) {
        const velocity = Math.abs(event.nativeEvent.contentOffset.y) / timeDelta;
        setScrollVelocity(velocity);
      }

      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Set timeout to detect when scrolling stops
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
        setScrollVelocity(0);
      }, 150);

      onScroll?.(event);
    },
    [onScroll]
  );

  // Handle end reached with throttling
  const handleEndReached = useCallback(() => {
    if (onEndReached && !loading && !refreshing) {
      onEndReached();
    }
  }, [onEndReached, loading, refreshing]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh && !refreshing) {
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh error:', error);
      }
    }
  }, [onRefresh, refreshing]);

  // Memoized empty component
  const memoizedEmptyComponent = useMemo(() => {
    if (emptyComponent) {
      return emptyComponent;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No items to display</Text>
      </View>
    );
  }, [emptyComponent]);

  // Memoized footer component
  const memoizedFooterComponent = useMemo(() => {
    if (loading && data.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="small" color="#667eea" />
          <Text style={styles.footerText}>Loading more...</Text>
        </View>
      );
    }

    return footerComponent;
  }, [loading, data.length, footerComponent]);

  // Memoized refresh control
  const memoizedRefreshControl = useMemo(() => {
    if (!onRefresh) return undefined;

    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor="#667eea"
        colors={['#667eea']}
        progressBackgroundColor="#ffffff"
      />
    );
  }, [refreshing, handleRefresh, onRefresh]);

  // Performance optimizations based on data size
  const performanceConfig = useMemo(() => {
    const dataSize = data.length;
    
    if (dataSize < 50) {
      return {
        removeClippedSubviews: false,
        maxToRenderPerBatch: 20,
        windowSize: 20,
        initialNumToRender: 10,
        updateCellsBatchingPeriod: 100,
      };
    } else if (dataSize < 200) {
      return {
        removeClippedSubviews: true,
        maxToRenderPerBatch: 15,
        windowSize: 15,
        initialNumToRender: 8,
        updateCellsBatchingPeriod: 75,
      };
    } else {
      return {
        removeClippedSubviews: true,
        maxToRenderPerBatch: 10,
        windowSize: 10,
        initialNumToRender: 5,
        updateCellsBatchingPeriod: 50,
      };
    }
  }, [data.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Track performance when data changes
  useEffect(() => {
    if (performanceTracking) {
      performanceService.endTiming(`list-${performanceName}-render`);
    }
  }, [data, performanceTracking, performanceName]);

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      getItemLayout={memoizedGetItemLayout}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      onScroll={handleScroll}
      scrollEventThrottle={scrollEventThrottle}
      refreshControl={memoizedRefreshControl}
      ListEmptyComponent={memoizedEmptyComponent}
      ListHeaderComponent={headerComponent}
      ListFooterComponent={memoizedFooterComponent}
      horizontal={horizontal}
      numColumns={numColumns}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      contentContainerStyle={[
        styles.contentContainer,
        contentContainerStyle,
      ]}
      style={[styles.container, style]}
      removeClippedSubviews={performanceConfig.removeClippedSubviews}
      maxToRenderPerBatch={performanceConfig.maxToRenderPerBatch}
      windowSize={performanceConfig.windowSize}
      initialNumToRender={performanceConfig.initialNumToRender}
      updateCellsBatchingPeriod={performanceConfig.updateCellsBatchingPeriod}
      // Performance optimizations
      disableVirtualization={false}
      legacyImplementation={false}
      // Memory optimizations
      onScrollToIndexFailed={(info) => {
        console.warn('Scroll to index failed:', info);
      }}
      // Accessibility
      accessibilityRole="list"
      accessibilityLabel="Optimized list"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
});

export default OptimizedFlatList;
