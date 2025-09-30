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
  Alert,
  Modal} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import EnhancedCommitmentService from '../services/EnhancedCommitmentService';
import { EnhancedCommitment, CommitmentAnalytics, CommitmentTrend } from '../types/CommitmentTracking';
import ShareButton from '../components/ShareButton';

const { width } = Dimensions.get('window');

const EnhancedCommitmentDashboard: React.FC = () => {
  const navigation = useNavigation();
  const [commitments, setCommitments] = useState<EnhancedCommitment[]>([]);
  const [analytics, setAnalytics] = useState<CommitmentAnalytics | null>(null);
  const [trends, setTrends] = useState<CommitmentTrend[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'commitments' | 'analytics' | 'trends'>('overview');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPolitician, setSelectedPolitician] = useState<number | null>(null);

  useEffect(() => {
    EnhancedCommitmentService.initializeSampleData();
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allCommitments = EnhancedCommitmentService.getCommitments();
      setCommitments(allCommitments);
      
      if (selectedPolitician) {
        const politicianAnalytics = EnhancedCommitmentService.getCommitmentAnalytics(selectedPolitician);
        const politicianTrends = EnhancedCommitmentService.getCommitmentTrends(selectedPolitician);
        setAnalytics(politicianAnalytics);
        setTrends(politicianTrends);
      }
    } catch (error) {
      console.error('Error loading commitment data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getFilteredCommitments = () => {
    if (selectedFilter === 'all') return commitments;
    return commitments.filter(commitment => commitment.status === selectedFilter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#3b82f6';
      case 'delayed': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      case 'on_hold': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in_progress': return 'play-circle';
      case 'delayed': return 'time';
      case 'cancelled': return 'close-circle';
      case 'on_hold': return 'pause-circle';
      default: return 'help-circle';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'economic': return 'trending-up';
      case 'social': return 'people';
      case 'infrastructure': return 'construct';
      case 'governance': return 'build';
      case 'environment': return 'leaf';
      case 'health': return 'medical';
      case 'education': return 'school';
      case 'security': return 'shield';
      case 'agriculture': return 'leaf';
      case 'technology': return 'laptop';
      default: return 'document';
    }
  };

  const renderCommitmentCard = ({ item }: { item: EnhancedCommitment }) => (
    <TouchableOpacity
      style={styles.commitmentCard}
      onPress={() => {/* Navigate to commitment detail */}}
      activeOpacity={0.8}
    >
      <View style={styles.commitmentHeader}>
        <View style={styles.commitmentTitleContainer}>
          <Text style={styles.commitmentTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.commitmentPolitician}>{item.politicianName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={16} color="white" />
          <Text style={styles.statusText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.commitmentDescription} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.commitmentMeta}>
        <View style={styles.metaItem}>
          <Ionicons name={getCategoryIcon(item.category)} size={14} color="#6b7280" />
          <Text style={styles.metaText}>{item.category.replace('_', ' ').toUpperCase()}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="flag" size={14} color={getPriorityColor(item.priority)} />
          <Text style={[styles.metaText, { color: getPriorityColor(item.priority) }]}>
            {item.priority.toUpperCase()}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar" size={14} color="#6b7280" />
          <Text style={styles.metaText}>{new Date(item.startDate).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>{item.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${item.progress}%`,
                backgroundColor: getStatusColor(item.status)
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.commitmentFooter}>
        <View style={styles.commitmentStats}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark" size={12} color="#10b981" />
            <Text style={styles.statText}>{item.milestones.filter(m => m.status === 'completed').length}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="document" size={12} color="#3b82f6" />
            <Text style={styles.statText}>{item.evidence.length}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people" size={12} color="#8b5cf6" />
            <Text style={styles.statText}>{item.stakeholders.length}</Text>
          </View>
        </View>
        
        <ShareButton
          data={{
            name: item.politicianName,
            position: 'Politician',
            party: 'Government',
            achievements: [item.title],
            summary: `${item.status.replace('_', ' ')} commitment: ${item.title}`}}
          type="politician"
          variant="minimal"
          iconSize={16}
          showText={false}
          style={styles.shareButton}
        />
      </View>
    </TouchableOpacity>
  );

  const renderOverviewTab = () => (
    <View style={styles.overviewContainer}>
      <Text style={styles.sectionTitle}>Commitment Overview</Text>
      
      <View style={styles.quickStats}>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatValue}>{commitments.length}</Text>
          <Text style={styles.quickStatLabel}>Total Commitments</Text>
        </View>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatValue}>
            {commitments.filter(c => c.status === 'completed').length}
          </Text>
          <Text style={styles.quickStatLabel}>Completed</Text>
        </View>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatValue}>
            {commitments.filter(c => c.status === 'in_progress').length}
          </Text>
          <Text style={styles.quickStatLabel}>In Progress</Text>
        </View>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatValue}>
            {Math.round(commitments.reduce((sum, c) => sum + c.progress, 0) / commitments.length || 0)}%
          </Text>
          <Text style={styles.quickStatLabel}>Avg Progress</Text>
        </View>
      </View>

      <View style={styles.recentCommitments}>
        <Text style={styles.subsectionTitle}>Recent Commitments</Text>
        <FlatList
          data={commitments.slice(0, 5)}
          renderItem={renderCommitmentCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );

  const renderCommitmentsTab = () => (
    <View style={styles.commitmentsContainer}>
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color="#667eea" />
          <Text style={styles.filterText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { id: 'all', label: 'All' },
              { id: 'completed', label: 'Completed' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'delayed', label: 'Delayed' },
              { id: 'cancelled', label: 'Cancelled' },
              { id: 'on_hold', label: 'On Hold' }].map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.id && styles.activeFilterChip
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedFilter === filter.id && styles.activeFilterChipText
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={getFilteredCommitments()}
        renderItem={renderCommitmentCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Commitments Found</Text>
            <Text style={styles.emptySubtitle}>
              No commitments match your current filters
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderAnalyticsTab = () => {
    if (!analytics) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>Select a Politician</Text>
          <Text style={styles.emptySubtitle}>
            Choose a politician to view their commitment analytics
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.analyticsContainer}>
        <Text style={styles.sectionTitle}>Commitment Analytics</Text>
        
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>{analytics.completionRate.toFixed(1)}%</Text>
            <Text style={styles.analyticsLabel}>Completion Rate</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>{analytics.averageProgress.toFixed(1)}%</Text>
            <Text style={styles.analyticsLabel}>Average Progress</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>{analytics.onTimeRate.toFixed(1)}%</Text>
            <Text style={styles.analyticsLabel}>On-Time Rate</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>{analytics.publicSatisfaction.toFixed(1)}%</Text>
            <Text style={styles.analyticsLabel}>Public Satisfaction</Text>
          </View>
        </View>

        <View style={styles.categoryBreakdown}>
          <Text style={styles.subsectionTitle}>Category Breakdown</Text>
          {Object.entries(analytics.categoryBreakdown).map(([category, count]) => (
            <View key={category} style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>{category.replace('_', ' ').toUpperCase()}</Text>
              <Text style={styles.categoryValue}>{count}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTrendsTab = () => (
    <View style={styles.trendsContainer}>
      <Text style={styles.sectionTitle}>Commitment Trends</Text>
      
      {trends.map((trend, index) => (
        <View key={index} style={styles.trendCard}>
          <Text style={styles.trendPeriod}>{trend.period}</Text>
          <View style={styles.trendStats}>
            <View style={styles.trendItem}>
              <Text style={styles.trendValue}>{trend.commitments}</Text>
              <Text style={styles.trendLabel}>Commitments</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendValue}>{trend.completions}</Text>
              <Text style={styles.trendLabel}>Completed</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendValue}>{trend.progress.toFixed(1)}%</Text>
              <Text style={styles.trendLabel}>Progress</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'commitments':
        return renderCommitmentsTab();
      case 'analytics':
        return renderAnalyticsTab();
      case 'trends':
        return renderTrendsTab();
      default:
        return null;
    }
  };

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
          <Text style={styles.headerTitle}>🤝 Enhanced Commitments</Text>
          <ShareButton
            data={{
              name: 'Enhanced Commitment Tracking',
              position: 'Political Accountability System',
              party: 'Rada Mobile',
              achievements: [`${commitments.length} commitments tracked`],
              summary: 'Comprehensive commitment tracking and accountability system for political promises'}}
            type="app"
            variant="minimal"
            iconSize={20}
            showText={false}
            style={styles.headerShareButton}
          />
        </View>
        <Text style={styles.headerSubtitle}>
          Advanced commitment tracking with analytics and accountability
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { id: 'overview', label: 'Overview', icon: 'grid' },
          { id: 'commitments', label: 'Commitments', icon: 'list' },
          { id: 'analytics', label: 'Analytics', icon: 'stats-chart' },
          { id: 'trends', label: 'Trends', icon: 'trending-up' }].map((tab) => (
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
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTabContent()}
      </ScrollView>
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
  headerShareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)'},
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center'},
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
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 6},
  activeTabText: {
    color: '#667eea'},
  content: {
    flex: 1,
    paddingHorizontal: 20},
  overviewContainer: {
    paddingVertical: 20},
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16},
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24},
  quickStatCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    alignItems: 'center',
    elevation: 2},
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4},
  quickStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center'},
  recentCommitments: {
    marginBottom: 20},
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12},
  commitmentsContainer: {
    paddingVertical: 20},
  filterSection: {
    marginBottom: 16},
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    elevation: 2},
  filterText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6},
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2},
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    marginLeft: 8},
  activeFilterChip: {
    backgroundColor: '#667eea'},
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280'},
  activeFilterChipText: {
    color: 'white'},
  commitmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2},
  commitmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8},
  commitmentTitleContainer: {
    flex: 1,
    marginRight: 12},
  commitmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4},
  commitmentPolitician: {
    fontSize: 12,
    color: '#6b7280'},
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12},
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 4},
  commitmentDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12},
  commitmentMeta: {
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
  progressContainer: {
    marginBottom: 12},
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4},
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151'},
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#667eea'},
  progressBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden'},
  progressFill: {
    height: '100%',
    borderRadius: 3},
  commitmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'},
  commitmentStats: {
    flexDirection: 'row',
    gap: 16},
  statItem: {
    flexDirection: 'row',
    alignItems: 'center'},
  statText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4},
  shareButton: {
    padding: 4},
  analyticsContainer: {
    paddingVertical: 20},
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24},
  analyticsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    alignItems: 'center',
    elevation: 2},
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4},
  analyticsLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center'},
  categoryBreakdown: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2},
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'},
  categoryLabel: {
    fontSize: 14,
    color: '#374151'},
  categoryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea'},
  trendsContainer: {
    paddingVertical: 20},
  trendCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2},
  trendPeriod: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12},
  trendStats: {
    flexDirection: 'row',
    justifyContent: 'space-around'},
  trendItem: {
    alignItems: 'center'},
  trendValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea'},
  trendLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4},
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

export default EnhancedCommitmentDashboard;
