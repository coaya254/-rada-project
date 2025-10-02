import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Modal,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { NewsCard, LoadingSpinner, ErrorDisplay } from '../../components/ui';
import { NewsItem } from '../../types';
import { colors, shadows } from '../../theme';
import ApiService from '../../services/api';

interface PoliticianNewsScreenProps {
  politicianId: number;
  politicianName: string;
  onBack: () => void;
}

export const PoliticianNewsScreen: React.FC<PoliticianNewsScreenProps> = ({
  politicianId,
  politicianName,
  onBack,
}) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    sources: [] as string[],
    credibility: [] as string[],
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month',
  });


  const fetchNews = async (refresh = false) => {
    if (!refresh) setLoading(true);
    setError(null);

    try {
      // Fetch news from API
      const response = await ApiService.getPoliticianNews(politicianId);
      const data = response.success ? response.data : response;

      setNews(data || []);

      /* Mock news data - replaced with actual API call
      const sampleNews: NewsItem[] = [
        {
          id: 1,
          headline: `${politicianName} Addresses Senate on Budget Allocation`,
          source_publication_date: '2024-01-15',
          system_addition_date: '2024-01-15',
          source: 'Standard Digital',
          credibility: 'maximum',
          link: 'https://example.com/news1',
          summary: 'Senator discusses key budget provisions affecting coastal development projects and infrastructure improvements.',
        },
        {
          id: 2,
          headline: `Parliamentary Session: ${politicianName} Presents Motion`,
          source_publication_date: '2024-01-12',
          system_addition_date: '2024-01-12',
          source: 'Daily Nation',
          credibility: 'high',
          link: 'https://example.com/news2',
          summary: 'Key motion presented regarding healthcare access and funding for rural areas, receiving bipartisan support.',
        },
        {
          id: 3,
          headline: `Community Outreach: ${politicianName} Visits Local Schools`,
          source_publication_date: '2024-01-10',
          system_addition_date: '2024-01-10',
          source: 'The Star',
          credibility: 'medium',
          link: 'https://example.com/news3',
          summary: 'Educational initiative launched to improve learning resources and infrastructure in constituency schools.',
        },
      ];
      */
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to load news');
      setNews([]);
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [politicianId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews(true);
  };

  const handleNewsPress = (item: NewsItem) => {
    setSelectedNewsItem(item);
    setShowNewsModal(true);
  };

  const getFilteredNews = () => {
    return news.filter(item => {
      // Source filter
      if (filters.sources.length > 0 && !filters.sources.includes(item.source)) {
        return false;
      }

      // Credibility filter
      if (filters.credibility.length > 0 && !filters.credibility.includes(item.credibility)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const itemDate = new Date(item.source_publication_date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - itemDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case 'today':
            if (diffDays > 1) return false;
            break;
          case 'week':
            if (diffDays > 7) return false;
            break;
          case 'month':
            if (diffDays > 30) return false;
            break;
        }
      }

      return true;
    });
  };

  const toggleSourceFilter = (source: string) => {
    setFilters(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source]
    }));
  };

  const toggleCredibilityFilter = (credibility: string) => {
    setFilters(prev => ({
      ...prev,
      credibility: prev.credibility.includes(credibility)
        ? prev.credibility.filter(c => c !== credibility)
        : [...prev.credibility, credibility]
    }));
  };

  const clearFilters = () => {
    setFilters({
      sources: [],
      credibility: [],
      dateRange: 'all',
    });
  };

  const getUniqueS = () => {
    return [...new Set(news.map(item => item.source))];
  };

  const filteredNews = getFilteredNews();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politicianName}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Latest News & Activities</Text>
        </LinearGradient>
        <View style={styles.content}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politicianName}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Latest News & Activities</Text>
        </LinearGradient>
        <View style={styles.content}>
          <ErrorDisplay
            message={error}
            onRetry={() => fetchNews()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{politicianName}</Text>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
            <MaterialIcons name="filter-list" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Latest News & Coverage</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{news.length}</Text>
            <Text style={styles.statLabel}>Articles</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {news.filter(n => n.credibility === 'maximum' || n.credibility === 'high').length}
            </Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {new Set(news.map(n => n.source)).size}
            </Text>
            <Text style={styles.statLabel}>Sources</Text>
          </View>
        </View>
      </LinearGradient>


      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredNews.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="article" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No News Found</Text>
            <Text style={styles.emptySubtitle}>
              There are no recent news articles about {politicianName}.
            </Text>
          </View>
        ) : (
          <View style={styles.newsGrid}>
            {filteredNews.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                onPress={handleNewsPress}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFilterModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter News</Text>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* News Sources Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>News Sources</Text>
              <View style={styles.filterOptionsContainer}>
                {getUniqueS().map((source) => (
                  <TouchableOpacity
                    key={source}
                    style={[
                      styles.filterOption,
                      filters.sources.includes(source) && styles.filterOptionSelected
                    ]}
                    onPress={() => toggleSourceFilter(source)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.sources.includes(source) && styles.filterOptionTextSelected
                    ]}>
                      {source}
                    </Text>
                    {filters.sources.includes(source) && (
                      <MaterialIcons name="check" size={16} color="#FFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Credibility Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Credibility Level</Text>
              <View style={styles.filterOptionsContainer}>
                {['maximum', 'high', 'medium', 'single'].map((credibility) => (
                  <TouchableOpacity
                    key={credibility}
                    style={[
                      styles.filterOption,
                      filters.credibility.includes(credibility) && styles.filterOptionSelected
                    ]}
                    onPress={() => toggleCredibilityFilter(credibility)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.credibility.includes(credibility) && styles.filterOptionTextSelected
                    ]}>
                      {credibility.charAt(0).toUpperCase() + credibility.slice(1)}
                    </Text>
                    {filters.credibility.includes(credibility) && (
                      <MaterialIcons name="check" size={16} color="#FFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <View style={styles.filterOptionsContainer}>
                {[
                  { key: 'all', label: 'All Time' },
                  { key: 'today', label: 'Today' },
                  { key: 'week', label: 'This Week' },
                  { key: 'month', label: 'This Month' }
                ].map((dateOption) => (
                  <TouchableOpacity
                    key={dateOption.key}
                    style={[
                      styles.filterOption,
                      filters.dateRange === dateOption.key && styles.filterOptionSelected
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, dateRange: dateOption.key as any }))}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.dateRange === dateOption.key && styles.filterOptionTextSelected
                    ]}>
                      {dateOption.label}
                    </Text>
                    {filters.dateRange === dateOption.key && (
                      <MaterialIcons name="check" size={16} color="#FFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Filter Results Summary */}
            <View style={styles.filterSummary}>
              <Text style={styles.filterSummaryTitle}>Filter Results</Text>
              <Text style={styles.filterSummaryText}>
                Showing {filteredNews.length} of {news.length} articles
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* News Detail Modal */}
      <Modal
        visible={showNewsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowNewsModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>News Article</Text>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => selectedNewsItem?.link && Linking.openURL(selectedNewsItem.link)}
            >
              <MaterialIcons name="open-in-new" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedNewsItem && (
              <>
                <View style={styles.credibilityBadge}>
                  <MaterialIcons
                    name={selectedNewsItem.credibility === 'maximum' ? 'verified' : 'info'}
                    size={16}
                    color="#10B981"
                  />
                  <Text style={styles.credibilityText}>
                    {selectedNewsItem.credibility.toUpperCase()} CREDIBILITY
                  </Text>
                </View>

                <Text style={styles.newsModalHeadline}>{selectedNewsItem.headline}</Text>

                <View style={styles.newsModalMeta}>
                  <Text style={styles.newsModalSource}>{selectedNewsItem.source}</Text>
                  <Text style={styles.newsModalDate}>
                    {new Date(selectedNewsItem.source_publication_date).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.newsModalSummary}>{selectedNewsItem.summary}</Text>

                <TouchableOpacity
                  style={styles.readFullArticleButton}
                  onPress={() => selectedNewsItem.link && Linking.openURL(selectedNewsItem.link)}
                >
                  <Text style={styles.readFullArticleText}>Read Full Article</Text>
                  <MaterialIcons name="arrow-forward" size={16} color="#FFF" />
                </TouchableOpacity>

                {/* Additional Sources Section */}
                <View style={styles.additionalSourcesContainer}>
                  <Text style={styles.additionalSourcesTitle}>Read from Other Sources</Text>

                  <View style={styles.externalSourcesRow}>
                    <TouchableOpacity
                      style={[styles.externalSourceButton, { backgroundColor: '#DC2626' }]}
                      onPress={() => Linking.openURL('https://standardmedia.co.ke/politics')}
                    >
                      <MaterialIcons name="language" size={14} color="#FFF" />
                      <Text style={styles.externalSourceText}>The Standard</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.externalSourceButton, { backgroundColor: '#059669' }]}
                      onPress={() => Linking.openURL('https://citizen.digital/news')}
                    >
                      <MaterialIcons name="tv" size={14} color="#FFF" />
                      <Text style={styles.externalSourceText}>Citizen TV</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.externalSourceButton, { backgroundColor: '#7C3AED' }]}
                      onPress={() => Linking.openURL('https://nation.africa/kenya')}
                    >
                      <MaterialIcons name="article" size={14} color="#FFF" />
                      <Text style={styles.externalSourceText}>Daily Nation</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.relatedInfo}>
                  <Text style={styles.relatedInfoTitle}>About {politicianName}</Text>
                  <Text style={styles.relatedInfoText}>
                    This article mentions {politicianName} in the context of political developments
                    and policy discussions relevant to their constituency and national responsibilities.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Additional Sources Modal Styles
  additionalSourcesContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  additionalSourcesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 12,
  },
  externalSourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  externalSourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  externalSourceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  newsGrid: {
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[700],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalActionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  credibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  credibilityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#065F46',
    marginLeft: 6,
  },
  newsModalHeadline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 16,
  },
  newsModalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  newsModalSource: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  newsModalDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  newsModalSummary: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  readFullArticleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  readFullArticleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  relatedInfo: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  relatedInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  relatedInfoText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },

  // Filter Modal Styles
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
  },
  filterSummary: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    marginTop: 16,
  },
  filterSummaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  filterSummaryText: {
    fontSize: 14,
    color: '#4B5563',
  },
});