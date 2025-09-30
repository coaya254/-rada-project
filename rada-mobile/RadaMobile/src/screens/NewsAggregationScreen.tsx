import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Dimensions,
  TextInput,
  Modal,
  Image} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import NewsService from '../services/NewsService';
import { NewsArticle, NewsSource, NewsFilter, NewsSearch } from '../types/NewsIntegration';
import ShareButton from '../components/ShareButton';

const { width } = Dimensions.get('window');

const NewsAggregationScreen: React.FC = () => {
  const navigation = useNavigation();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'breaking' | 'trending' | 'politics' | 'economy'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [filters, setFilters] = useState<NewsFilter>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    NewsService.initializeSampleData();
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const newsArticles = NewsService.getArticles(filters, page, 20);
      const newsSources = NewsService.getSources();
      
      if (page === 1) {
        setArticles(newsArticles);
      } else {
        setArticles(prev => [...prev, ...newsArticles]);
      }
      
      setSources(newsSources);
      setHasMore(newsArticles.length === 20);
    } catch (error) {
      console.error('Error loading news:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadNews();
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (hasMore && !refreshing) {
      setPage(prev => prev + 1);
      await loadNews();
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const searchParams: NewsSearch = {
        query: searchQuery,
        filters,
        sortBy: 'relevance',
        sortOrder: 'desc',
        page: 1,
        limit: 20};
      
      const searchResults = NewsService.searchArticles(searchParams);
      setArticles(searchResults);
      setPage(1);
    } else {
      await loadNews();
    }
  };

  const getFilteredArticles = () => {
    switch (activeTab) {
      case 'breaking':
        return NewsService.getBreakingNews(20);
      case 'trending':
        return NewsService.getTrendingArticles(20);
      case 'politics':
        return articles.filter(article => article.category === 'politics');
      case 'economy':
        return articles.filter(article => article.category === 'economy');
      default:
        return articles;
    }
  };

  const getCredibilityColor = (credibility: number) => {
    if (credibility >= 80) return '#10b981';
    if (credibility >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getCredibilityLabel = (credibility: number) => {
    if (credibility >= 80) return 'High';
    if (credibility >= 60) return 'Medium';
    return 'Low';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      case 'neutral': return '#6b7280';
      case 'mixed': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'trending-up';
      case 'negative': return 'trending-down';
      case 'neutral': return 'remove';
      case 'mixed': return 'swap-horizontal';
      default: return 'help';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'politics': return 'flag';
      case 'economy': return 'trending-up';
      case 'society': return 'people';
      case 'international': return 'globe';
      case 'sports': return 'football';
      case 'technology': return 'laptop';
      case 'health': return 'medical';
      case 'education': return 'school';
      case 'environment': return 'leaf';
      case 'security': return 'shield';
      default: return 'newspaper';
    }
  };

  const renderArticleCard = ({ item }: { item: NewsArticle }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => setSelectedArticle(item)}
      activeOpacity={0.8}
    >
      {item.featuredImage && (
        <Image source={{ uri: item.featuredImage }} style={styles.articleImage} />
      )}
      
      <View style={styles.articleContent}>
        <View style={styles.articleHeader}>
          <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
          {item.isBreaking && (
            <View style={styles.breakingBadge}>
              <Text style={styles.breakingText}>BREAKING</Text>
            </View>
          )}
        </View>

        <Text style={styles.articleSummary} numberOfLines={3}>
          {item.summary}
        </Text>

        <View style={styles.articleMeta}>
          <View style={styles.metaItem}>
            <Ionicons name={getCategoryIcon(item.category)} size={14} color="#6b7280" />
            <Text style={styles.metaText}>{item.category.toUpperCase()}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={14} color="#6b7280" />
            <Text style={styles.metaText}>
              {new Date(item.publishedAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="person" size={14} color="#6b7280" />
            <Text style={styles.metaText}>{item.author}</Text>
          </View>
        </View>

        <View style={styles.articleFooter}>
          <View style={styles.sourceContainer}>
            <Text style={styles.sourceName}>{item.source.name}</Text>
            <View style={[
              styles.credibilityBadge,
              { backgroundColor: getCredibilityColor(item.credibility.overall) }
            ]}>
              <Text style={styles.credibilityText}>
                {getCredibilityLabel(item.credibility.overall)}
              </Text>
            </View>
          </View>

          <View style={styles.engagementContainer}>
            <View style={styles.engagementItem}>
              <Ionicons name="eye" size={12} color="#6b7280" />
              <Text style={styles.engagementText}>{item.engagement.views}</Text>
            </View>
            <View style={styles.engagementItem}>
              <Ionicons name="share" size={12} color="#6b7280" />
              <Text style={styles.engagementText}>{item.engagement.shares}</Text>
            </View>
            <View style={styles.engagementItem}>
              <Ionicons name={getSentimentIcon(item.sentiment)} size={12} color={getSentimentColor(item.sentiment)} />
              <Text style={[styles.engagementText, { color: getSentimentColor(item.sentiment) }]}>
                {item.sentiment.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {item.factCheckStatus && (
          <View style={styles.factCheckContainer}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={styles.factCheckText}>
              Fact-checked by {item.factCheckStatus.factChecker}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderArticleModal = () => (
    <Modal
      visible={selectedArticle !== null}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setSelectedArticle(null)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Article Details</Text>
          <View style={styles.modalSpacer} />
        </View>

        {selectedArticle && (
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalArticleTitle}>{selectedArticle.title}</Text>
            
            <View style={styles.modalArticleMeta}>
              <Text style={styles.modalSource}>{selectedArticle.source.name}</Text>
              <Text style={styles.modalDate}>
                {new Date(selectedArticle.publishedAt).toLocaleString()}
              </Text>
            </View>

            <Text style={styles.modalArticleContent}>{selectedArticle.content}</Text>

            <View style={styles.modalActions}>
              <ShareButton
                data={{
                  name: selectedArticle.title,
                  position: 'News Article',
                  party: selectedArticle.source.name,
                  achievements: [selectedArticle.summary],
                  summary: selectedArticle.summary}}
                type="news"
                variant="primary"
                iconSize={16}
                showText={true}
                style={styles.modalShareButton}
              />
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  const renderFilters = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setShowFilters(false)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filter News</Text>
          <TouchableOpacity
            onPress={() => {
              setFilters({});
              setShowFilters(false);
              loadNews();
            }}
            style={styles.modalClearButton}
          >
            <Text style={styles.modalClearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Category</Text>
            {['politics', 'economy', 'society', 'international', 'sports', 'technology', 'health', 'education', 'environment', 'security'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterOption,
                  filters.category === category && styles.activeFilterOption
                ]}
                onPress={() => setFilters(prev => ({ ...prev, category: prev.category === category ? undefined : category }))}
              >
                <Text style={[
                  styles.filterOptionText,
                  filters.category === category && styles.activeFilterOptionText
                ]}>
                  {category.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Source</Text>
            {sources.map((source) => (
              <TouchableOpacity
                key={source.id}
                style={[
                  styles.filterOption,
                  filters.source === source.name && styles.activeFilterOption
                ]}
                onPress={() => setFilters(prev => ({ ...prev, source: prev.source === source.name ? undefined : source.name }))}
              >
                <Text style={[
                  styles.filterOptionText,
                  filters.source === source.name && styles.activeFilterOptionText
                ]}>
                  {source.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Credibility</Text>
            <View style={styles.credibilityFilter}>
              <Text style={styles.credibilityLabel}>Minimum: {filters.credibilityMin || 0}%</Text>
              <TouchableOpacity
                style={styles.credibilityButton}
                onPress={() => setFilters(prev => ({ 
                  ...prev, 
                  credibilityMin: prev.credibilityMin === 80 ? undefined : 80 
                }))}
              >
                <Text style={styles.credibilityButtonText}>High (80%+)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📰 News Center</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowSearch(!showSearch)}
              style={styles.headerActionButton}
            >
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              style={styles.headerActionButton}
            >
              <Ionicons name="filter" size={20} color="white" />
            </TouchableOpacity>
            <ShareButton
              data={{
                name: 'News Center',
                position: 'Real-time News Aggregation',
                party: 'Rada Mobile',
                achievements: ['Real-time Updates', 'Credibility Scoring', 'Fact-checking'],
                summary: 'Comprehensive news aggregation with credibility scoring and fact-checking'}}
              type="app"
              variant="minimal"
              iconSize={20}
              showText={false}
              style={styles.headerShareButton}
            />
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Real-time news with credibility scoring and fact-checking
        </Text>
      </LinearGradient>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search news articles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { id: 'all', label: 'All News', icon: 'newspaper' },
          { id: 'breaking', label: 'Breaking', icon: 'flash' },
          { id: 'trending', label: 'Trending', icon: 'trending-up' },
          { id: 'politics', label: 'Politics', icon: 'flag' },
          { id: 'economy', label: 'Economy', icon: 'trending-up' }].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.activeTabButton
            ]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={16} 
              color={activeTab === tab.id ? '#667eea' : '#6b7280'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <FlatList
        data={getFilteredArticles()}
        renderItem={renderArticleCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📰</Text>
            <Text style={styles.emptyTitle}>No News Found</Text>
            <Text style={styles.emptySubtitle}>
              No articles match your current filters
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {renderArticleModal()}
      {renderFilters()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'},
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20},
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10},
  backButton: {
    padding: 8},
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
    flex: 1},
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'},
  headerActionButton: {
    padding: 8,
    marginLeft: 8},
  headerShareButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)'},
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center'},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 25,
    paddingHorizontal: 15,
    elevation: 2},
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16},
  searchButton: {
    padding: 8},
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'},
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8},
  activeTabButton: {
    backgroundColor: '#f0f4ff'},
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 4},
  activeTabText: {
    color: '#667eea'},
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100},
  articleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2},
  articleImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover'},
  articleContent: {
    padding: 16},
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8},
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8},
  breakingBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4},
  breakingText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'},
  articleSummary: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12},
  articleMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12},
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4},
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4},
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'},
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center'},
  sourceName: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8},
  credibilityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4},
  credibilityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'},
  engagementContainer: {
    flexDirection: 'row',
    gap: 12},
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center'},
  engagementText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4},
  factCheckContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 6},
  factCheckText: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 4,
    fontWeight: '500'},
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa'},
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'},
  modalCloseButton: {
    padding: 8},
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20},
  modalSpacer: {
    width: 40},
  modalClearButton: {
    padding: 8},
  modalClearText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600'},
  modalContent: {
    flex: 1,
    padding: 20},
  modalArticleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12},
  modalArticleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20},
  modalSource: {
    fontSize: 14,
    color: '#6b7280'},
  modalDate: {
    fontSize: 14,
    color: '#6b7280'},
  modalArticleContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20},
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center'},
  modalShareButton: {
    paddingHorizontal: 20,
    paddingVertical: 12},
  filterSection: {
    marginBottom: 24},
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12},
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8},
  activeFilterOption: {
    backgroundColor: '#667eea'},
  filterOptionText: {
    fontSize: 14,
    color: '#374151'},
  activeFilterOptionText: {
    color: 'white'},
  credibilityFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'},
  credibilityLabel: {
    fontSize: 14,
    color: '#374151'},
  credibilityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f4ff',
    borderRadius: 6},
  credibilityButtonText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500'},
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60},
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16},
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8},
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'}});

export default NewsAggregationScreen;
