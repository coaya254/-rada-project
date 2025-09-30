import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';

interface OptimizedFlatListProps {
  data: any[];
  renderItem: ({ item, index }: { item: any; index: number }) => React.ReactElement;
  keyExtractor: (item: any, index: number) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
  emptyMessage?: string;
  showLoadingIndicator?: boolean;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  removeClippedSubviews?: boolean;
  getItemLayout?: (data: any[] | null | undefined, index: number) => { length: number; offset: number; index: number };
  horizontal?: boolean;
  numColumns?: number;
  style?: any;
  contentContainerStyle?: any;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  onScroll?: (event: any) => void;
  scrollEventThrottle?: number;
  performanceOptimizations?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const OptimizedFlatList: React.FC<OptimizedFlatListProps> = memo(({
  data = [],
  renderItem,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing = false,
  onRefresh,
  loading = false,
  emptyMessage = 'No items to display',
  showLoadingIndicator = true,
  initialNumToRender = 10,
  maxToRenderPerBatch = 5,
  windowSize = 10,
  removeClippedSubviews = true,
  getItemLayout,
  horizontal = false,
  numColumns = 1,
  style,
  contentContainerStyle,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  onScroll,
  scrollEventThrottle = 16,
  performanceOptimizations = true
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Memoize render item to prevent unnecessary re-renders
  const memoizedRenderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    return renderItem({ item, index });
  }, [renderItem]);

  // Memoize key extractor
  const memoizedKeyExtractor = useCallback((item: any, index: number) => {
    return keyExtractor(item, index);
  }, [keyExtractor]);

  // Handle end reached with loading state
  const handleEndReached = useCallback(() => {
    if (onEndReached && !isLoadingMore && !loading) {
      setIsLoadingMore(true);
      onEndReached();
      // Reset loading state after a delay
      setTimeout(() => setIsLoadingMore(false), 1000);
    }
  }, [onEndReached, isLoadingMore, loading]);

  // Memoize list footer component
  const ListFooter = useMemo(() => {
    if (loading && showLoadingIndicator) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color="#667eea" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }
    return ListFooterComponent;
  }, [loading, showLoadingIndicator, ListFooterComponent]);

  // Memoize empty component
  const EmptyComponent = useMemo(() => {
    if (ListEmptyComponent) return ListEmptyComponent;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }, [ListEmptyComponent, emptyMessage]);

  // Performance optimizations
  const performanceProps = useMemo(() => {
    if (!performanceOptimizations) return {};
    
    return {
      initialNumToRender,
      maxToRenderPerBatch,
      windowSize,
      removeClippedSubviews,
      getItemLayout,
      updateCellsBatchingPeriod: 50,
      disableVirtualization: false,
      legacyImplementation: false,
    };
  }, [performanceOptimizations, initialNumToRender, maxToRenderPerBatch, windowSize, removeClippedSubviews, getItemLayout]);

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      onEndReached={handleEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshing={refreshing}
      onRefresh={onRefresh}
      horizontal={horizontal}
      numColumns={numColumns}
      style={[styles.container, style]}
      contentContainerStyle={[
        data.length === 0 && styles.emptyContentContainer,
        contentContainerStyle
      ]}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooter}
      ListEmptyComponent={EmptyComponent}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      // Performance optimizations
      {...performanceProps}
      // Additional optimizations
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10
      }}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#667eea',
  },
});

OptimizedFlatList.displayName = 'OptimizedFlatList';

export default OptimizedFlatList;
