import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import { AnalyticsOverview, UserAnalytics, ContentAnalytics } from '../types/AnalyticsTypes';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const AnalyticsDashboardScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics[]>([]);
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedView, setSelectedView] = useState('overview');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const periods = [
    { key: '1d', label: 'Today', icon: 'calendar' },
    { key: '7d', label: '7 Days', icon: 'calendar-week' },
    { key: '30d', label: '30 Days', icon: 'calendar-alt' },
    { key: '90d', label: '90 Days', icon: 'calendar-check' },
    { key: '1y', label: '1 Year', icon: 'calendar-plus' },
  ];

  const views = [
    { key: 'overview', label: 'Overview', icon: 'tachometer' },
    { key: 'users', label: 'Users', icon: 'users' },
    { key: 'content', label: 'Content', icon: 'file-text' },
    { key: 'engagement', label: 'Engagement', icon: 'heart' },
    { key: 'revenue', label: 'Revenue', icon: 'dollar-sign' },
  ];

  useEffect(() => {
    loadAnalytics();
    animateIn();
  }, [selectedPeriod, selectedView]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with API calls
      const mockOverview: AnalyticsOverview = {
        totalUsers: 1250,
        activeUsers: 890,
        totalModules: 15,
        totalLessons: 120,
        totalQuizzes: 45,
        totalCompletions: 3400,
        averageCompletionRate: 78.5,
        totalXP: 125000,
        averageSessionDuration: 24,
        retentionRate: {
          day1: 85.2,
          day7: 62.1,
          day30: 45.8,
        },
        engagementScore: 7.8,
        period: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
      };

      const mockUserAnalytics: UserAnalytics[] = [
        {
          userId: 'user1',
          username: 'LegalEagle',
          joinDate: '2024-01-15',
          lastActive: '2024-01-20',
          totalSessions: 45,
          totalTimeSpent: 1200,
          modulesCompleted: 8,
          lessonsCompleted: 35,
          quizzesCompleted: 12,
          totalXP: 1250,
          currentLevel: 8,
          streak: 15,
          badges: ['Constitution Scholar', 'Quiz Master'],
          learningPath: [],
          performance: {
            averageQuizScore: 85.2,
            averageTimePerLesson: 18.5,
            completionRate: 92.3,
            engagementScore: 8.5,
          },
          preferences: {
            favoriteCategories: ['Law', 'Civics'],
            preferredLearningTime: 'evening',
            deviceType: 'mobile',
            notificationSettings: {},
          },
          socialActivity: {
            groupsJoined: 3,
            postsCreated: 12,
            commentsMade: 45,
            likesReceived: 89,
          },
        },
      ];

      const mockContentAnalytics: ContentAnalytics[] = [
        {
          contentId: 1,
          contentType: 'module',
          title: 'Constitution Basics',
          views: 450,
          completions: 320,
          averageTimeSpent: 45,
          completionRate: 71.1,
          averageRating: 4.5,
          dropOffPoints: [],
          userFeedback: [],
          performance: {
            engagement: 8.2,
            difficulty: 6.5,
            effectiveness: 7.8,
          },
          trends: {
            daily: [],
            weekly: [],
            monthly: [],
          },
          demographics: {
            ageGroups: { '18-25': 45, '26-35': 35, '36-45': 20 },
            locations: { 'US': 60, 'CA': 25, 'UK': 15 },
            devices: { 'mobile': 70, 'desktop': 30 },
          },
        },
      ];

      setOverview(mockOverview);
      setUserAnalytics(mockUserAnalytics);
      setContentAnalytics(mockContentAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const renderOverviewMetrics = () => (
    <Animated.View
      style={[styles.metricsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="users" size={24} color="#3b82f6" />
            <Text style={styles.metricTitle}>Total Users</Text>
          </View>
          <Text style={styles.metricValue}>{overview?.totalUsers.toLocaleString()}</Text>
          <Text style={styles.metricChange}>+12.5% from last month</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="user-check" size={24} color="#10b981" />
            <Text style={styles.metricTitle}>Active Users</Text>
          </View>
          <Text style={styles.metricValue}>{overview?.activeUsers.toLocaleString()}</Text>
          <Text style={styles.metricChange}>+8.3% from last month</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="book" size={24} color="#f59e0b" />
            <Text style={styles.metricTitle}>Modules</Text>
          </View>
          <Text style={styles.metricValue}>{overview?.totalModules}</Text>
          <Text style={styles.metricChange}>+2 new this month</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="file-text" size={24} color="#8b5cf6" />
            <Text style={styles.metricTitle}>Lessons</Text>
          </View>
          <Text style={styles.metricValue}>{overview?.totalLessons}</Text>
          <Text style={styles.metricChange}>+15 new this month</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="trophy" size={24} color="#ef4444" />
            <Text style={styles.metricTitle}>Completions</Text>
          </View>
          <Text style={styles.metricValue}>{overview?.totalCompletions.toLocaleString()}</Text>
          <Text style={styles.metricChange}>+25.7% from last month</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="percent" size={24} color="#06b6d4" />
            <Text style={styles.metricTitle}>Completion Rate</Text>
          </View>
          <Text style={styles.metricValue}>{overview?.averageCompletionRate}%</Text>
          <Text style={styles.metricChange}>+3.2% from last month</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderRetentionChart = () => (
    <Animated.View
      style={[styles.chartContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.chartTitle}>User Retention</Text>
      <View style={styles.retentionChart}>
        <View style={styles.retentionBar}>
          <View style={[styles.retentionFill, { width: '85%', backgroundColor: '#10b981' }]} />
          <Text style={styles.retentionLabel}>Day 1: {overview?.retentionRate.day1}%</Text>
        </View>
        <View style={styles.retentionBar}>
          <View style={[styles.retentionFill, { width: '62%', backgroundColor: '#3b82f6' }]} />
          <Text style={styles.retentionLabel}>Day 7: {overview?.retentionRate.day7}%</Text>
        </View>
        <View style={styles.retentionBar}>
          <View style={[styles.retentionFill, { width: '46%', backgroundColor: '#f59e0b' }]} />
          <Text style={styles.retentionLabel}>Day 30: {overview?.retentionRate.day30}%</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderEngagementMetrics = () => (
    <Animated.View
      style={[styles.engagementContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.sectionTitle}>Engagement Metrics</Text>
      <View style={styles.engagementGrid}>
        <View style={styles.engagementCard}>
          <Icon name="clock" size={20} color="#3b82f6" />
          <Text style={styles.engagementValue}>{overview?.averageSessionDuration} min</Text>
          <Text style={styles.engagementLabel}>Avg Session</Text>
        </View>
        <View style={styles.engagementCard}>
          <Icon name="star" size={20} color="#f59e0b" />
          <Text style={styles.engagementValue}>{overview?.engagementScore}/10</Text>
          <Text style={styles.engagementLabel}>Engagement</Text>
        </View>
        <View style={styles.engagementCard}>
          <Icon name="fire" size={20} color="#ef4444" />
          <Text style={styles.engagementValue}>5.2 days</Text>
          <Text style={styles.engagementLabel}>Avg Streak</Text>
        </View>
        <View style={styles.engagementCard}>
          <Icon name="heart" size={20} color="#ec4899" />
          <Text style={styles.engagementValue}>89%</Text>
          <Text style={styles.engagementLabel}>Satisfaction</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderTopUsers = () => (
    <Animated.View
      style={[styles.topUsersContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.sectionTitle}>Top Performers</Text>
      {userAnalytics.slice(0, 5).map((user, index) => (
        <View key={user.userId} style={styles.userCard}>
          <View style={styles.userRank}>
            <Text style={styles.rankNumber}>#{index + 1}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.username}</Text>
            <Text style={styles.userStats}>
              {user.totalXP} XP • Level {user.currentLevel} • {user.streak} day streak
            </Text>
          </View>
          <View style={styles.userScore}>
            <Text style={styles.scoreValue}>{user.performance.engagementScore}</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>
        </View>
      ))}
    </Animated.View>
  );

  const renderTopContent = () => (
    <Animated.View
      style={[styles.topContentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.sectionTitle}>Top Content</Text>
      {contentAnalytics.slice(0, 5).map((content, index) => (
        <View key={content.contentId} style={styles.contentCard}>
          <View style={styles.contentRank}>
            <Text style={styles.rankNumber}>#{index + 1}</Text>
          </View>
          <View style={styles.contentInfo}>
            <Text style={styles.contentTitle}>{content.title}</Text>
            <Text style={styles.contentStats}>
              {content.views} views • {content.completionRate}% completion • {content.averageRating}★
            </Text>
          </View>
          <View style={styles.contentScore}>
            <Text style={styles.scoreValue}>{content.performance.engagement}</Text>
            <Text style={styles.scoreLabel}>Engagement</Text>
          </View>
        </View>
      ))}
    </Animated.View>
  );

  const renderOverview = () => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
      }
    >
      {renderOverviewMetrics()}
      {renderRetentionChart()}
      {renderEngagementMetrics()}
      {renderTopUsers()}
      {renderTopContent()}
    </ScrollView>
  );

  const renderUsers = () => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
      }
    >
      <Text style={styles.sectionTitle}>User Analytics</Text>
      {userAnalytics.map((user) => (
        <Animated.View
          key={user.userId}
          style={[styles.detailedUserCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.userHeader}>
            <Text style={styles.userName}>{user.username}</Text>
            <Text style={styles.userLevel}>Level {user.currentLevel}</Text>
          </View>
          <View style={styles.userMetrics}>
            <View style={styles.userMetric}>
              <Text style={styles.userMetricValue}>{user.totalXP}</Text>
              <Text style={styles.userMetricLabel}>Total XP</Text>
            </View>
            <View style={styles.userMetric}>
              <Text style={styles.userMetricValue}>{user.modulesCompleted}</Text>
              <Text style={styles.userMetricLabel}>Modules</Text>
            </View>
            <View style={styles.userMetric}>
              <Text style={styles.userMetricValue}>{user.lessonsCompleted}</Text>
              <Text style={styles.userMetricLabel}>Lessons</Text>
            </View>
            <View style={styles.userMetric}>
              <Text style={styles.userMetricValue}>{user.streak}</Text>
              <Text style={styles.userMetricLabel}>Streak</Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </ScrollView>
  );

  const renderContent = () => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
      }
    >
      <Text style={styles.sectionTitle}>Content Analytics</Text>
      {contentAnalytics.map((content) => (
        <Animated.View
          key={content.contentId}
          style={[styles.detailedContentCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.contentHeader}>
            <Text style={styles.contentTitle}>{content.title}</Text>
            <Text style={styles.contentType}>{content.contentType}</Text>
          </View>
          <View style={styles.contentMetrics}>
            <View style={styles.contentMetric}>
              <Text style={styles.contentMetricValue}>{content.views}</Text>
              <Text style={styles.contentMetricLabel}>Views</Text>
            </View>
            <View style={styles.contentMetric}>
              <Text style={styles.contentMetricValue}>{content.completions}</Text>
              <Text style={styles.contentMetricLabel}>Completions</Text>
            </View>
            <View style={styles.contentMetric}>
              <Text style={styles.contentMetricValue}>{content.completionRate}%</Text>
              <Text style={styles.contentMetricLabel}>Rate</Text>
            </View>
            <View style={styles.contentMetric}>
              <Text style={styles.contentMetricValue}>{content.averageRating}★</Text>
              <Text style={styles.contentMetricLabel}>Rating</Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </ScrollView>
  );

  const renderCurrentView = () => {
    switch (selectedView) {
      case 'overview': return renderOverview();
      case 'users': return renderUsers();
      case 'content': return renderContent();
      case 'engagement': return renderOverview();
      case 'revenue': return renderOverview();
      default: return renderOverview();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Icon name="download" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Period Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodContainer}
        contentContainerStyle={styles.periodContent}
      >
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodTab,
              selectedPeriod === period.key && styles.activePeriodTab,
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Icon
              name={period.icon as any}
              size={16}
              color={selectedPeriod === period.key ? '#667eea' : '#64748b'}
            />
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period.key && styles.activePeriodText,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* View Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.viewContainer}
        contentContainerStyle={styles.viewContent}
      >
        {views.map((view) => (
          <TouchableOpacity
            key={view.key}
            style={[
              styles.viewTab,
              selectedView === view.key && styles.activeViewTab,
            ]}
            onPress={() => setSelectedView(view.key)}
          >
            <Icon
              name={view.icon as any}
              size={16}
              color={selectedView === view.key ? '#667eea' : '#64748b'}
            />
            <Text
              style={[
                styles.viewText,
                selectedView === view.key && styles.activeViewText,
              ]}
            >
              {view.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {renderCurrentView()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  exportButton: {
    padding: 8,
  },
  periodContainer: {
    marginBottom: 8,
  },
  periodContent: {
    paddingHorizontal: 20,
  },
  periodTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activePeriodTab: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
  },
  periodText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activePeriodText: {
    color: '#667eea',
  },
  viewContainer: {
    marginBottom: 16,
  },
  viewContent: {
    paddingHorizontal: 20,
  },
  viewTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeViewTab: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
  },
  viewText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeViewText: {
    color: '#667eea',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  metricsContainer: {
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  retentionChart: {
    gap: 12,
  },
  retentionBar: {
    position: 'relative',
  },
  retentionFill: {
    height: 24,
    borderRadius: 12,
    marginBottom: 4,
  },
  retentionLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  engagementContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  engagementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  engagementCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  engagementValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  engagementLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  topUsersContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  userRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  userStats: {
    fontSize: 12,
    color: '#64748b',
  },
  userScore: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  topContentContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  contentRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  contentStats: {
    fontSize: 12,
    color: '#64748b',
  },
  contentScore: {
    alignItems: 'center',
  },
  detailedUserCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userLevel: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  userMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userMetric: {
    alignItems: 'center',
  },
  userMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  userMetricLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  detailedContentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contentType: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contentMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contentMetric: {
    alignItems: 'center',
  },
  contentMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  contentMetricLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
});

export default AnalyticsDashboardScreen;

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import { AnalyticsOverview, UserAnalytics, ContentAnalytics } from '../types/AnalyticsTypes';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const AnalyticsDashboardScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics[]>([]);
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedView, setSelectedView] = useState('overview');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const periods = [
    { key: '1d', label: 'Today', icon: 'calendar' },
    { key: '7d', label: '7 Days', icon: 'calendar-week' },
    { key: '30d', label: '30 Days', icon: 'calendar-alt' },
    { key: '90d', label: '90 Days', icon: 'calendar-check' },
    { key: '1y', label: '1 Year', icon: 'calendar-plus' },
  ];

  const views = [
    { key: 'overview', label: 'Overview', icon: 'tachometer' },
    { key: 'users', label: 'Users', icon: 'users' },
    { key: 'content', label: 'Content', icon: 'file-text' },
    { key: 'engagement', label: 'Engagement', icon: 'heart' },
    { key: 'revenue', label: 'Revenue', icon: 'dollar-sign' },
  ];

  useEffect(() => {
    loadAnalytics();
    animateIn();
  }, [selectedPeriod, selectedView]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with API calls
      const mockOverview: AnalyticsOverview = {
        totalUsers: 1250,
        activeUsers: 890,
        totalModules: 15,
        totalLessons: 120,
        totalQuizzes: 45,
        totalCompletions: 3400,
        averageCompletionRate: 78.5,
        totalXP: 125000,
        averageSessionDuration: 24,
        retentionRate: {
          day1: 85.2,
          day7: 62.1,
          day30: 45.8,
        },
        engagementScore: 7.8,
        period: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
      };

      const mockUserAnalytics: UserAnalytics[] = [
        {
          userId: 'user1',
          username: 'LegalEagle',
          joinDate: '2024-01-15',
          lastActive: '2024-01-20',
          totalSessions: 45,
          totalTimeSpent: 1200,
          modulesCompleted: 8,
          lessonsCompleted: 35,
          quizzesCompleted: 12,
          totalXP: 1250,
          currentLevel: 8,
          streak: 15,
          badges: ['Constitution Scholar', 'Quiz Master'],
          learningPath: [],
          performance: {
            averageQuizScore: 85.2,
            averageTimePerLesson: 18.5,
            completionRate: 92.3,
            engagementScore: 8.5,
          },
          preferences: {
            favoriteCategories: ['Law', 'Civics'],
            preferredLearningTime: 'evening',
            deviceType: 'mobile',
            notificationSettings: {},
          },
          socialActivity: {
            groupsJoined: 3,
            postsCreated: 12,
            commentsMade: 45,
            likesReceived: 89,
          },
        },
      ];

      const mockContentAnalytics: ContentAnalytics[] = [
        {
          contentId: 1,
          contentType: 'module',
          title: 'Constitution Basics',
          views: 450,
          completions: 320,
          averageTimeSpent: 45,
          completionRate: 71.1,
          averageRating: 4.5,
          dropOffPoints: [],
          userFeedback: [],
          performance: {
            engagement: 8.2,
            difficulty: 6.5,
            effectiveness: 7.8,
          },
          trends: {
            daily: [],
            weekly: [],
            monthly: [],
          },
          demographics: {
            ageGroups: { '18-25': 45, '26-35': 35, '36-45': 20 },
            locations: { 'US': 60, 'CA': 25, 'UK': 15 },
            devices: { 'mobile': 70, 'desktop': 30 },
          },
        },
      ];

      setOverview(mockOverview);
      setUserAnalytics(mockUserAnalytics);
      setContentAnalytics(mockContentAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const renderOverviewMetrics = () => (
    <Animated.View
      style={[styles.metricsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="users" size={24} color="#3b82f6" />
            <Text style={styles.metricTitle}>Total Users</Text>
          </View>
          <Text style={styles.metricValue}>{overview?.totalUsers.toLocaleString()}</Text>
          <Text style={styles.metricChange}>+12.5% from last month</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="user-check" size={24} color="#10b981" />
            <Text style={styles.metricTitle}>Active Users</Text>
          </View>
          <Text style={styles.metricValue}>{overview?.activeUsers.toLocaleString()}</Text>
          <Text style={styles.metricChange}>+8.3% from last month</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="book" size={24} color="#f59e0b" />
            <Text style={styles.metricTitle}>Modules</Text>
          </View>
          <Text style={styles.metricValue}>{overview?.totalModules}</Text>
          <Text style={styles.metricChange}>+2 new this month</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="file-text" size={24} color="#8b5cf6" />
            <Text style={styles.metricTitle}>Lessons</Text>
          </View>
          <Text style={styles.metricValue}>{overview?.totalLessons}</Text>
          <Text style={styles.metricChange}>+15 new this month</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="trophy" size={24} color="#ef4444" />
            <Text style={styles.metricTitle}>Completions</Text>
          </View>
          <Text style={styles.metricValue}>{overview?.totalCompletions.toLocaleString()}</Text>
          <Text style={styles.metricChange}>+25.7% from last month</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="percent" size={24} color="#06b6d4" />
            <Text style={styles.metricTitle}>Completion Rate</Text>
          </View>
          <Text style={styles.metricValue}>{overview?.averageCompletionRate}%</Text>
          <Text style={styles.metricChange}>+3.2% from last month</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderRetentionChart = () => (
    <Animated.View
      style={[styles.chartContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.chartTitle}>User Retention</Text>
      <View style={styles.retentionChart}>
        <View style={styles.retentionBar}>
          <View style={[styles.retentionFill, { width: '85%', backgroundColor: '#10b981' }]} />
          <Text style={styles.retentionLabel}>Day 1: {overview?.retentionRate.day1}%</Text>
        </View>
        <View style={styles.retentionBar}>
          <View style={[styles.retentionFill, { width: '62%', backgroundColor: '#3b82f6' }]} />
          <Text style={styles.retentionLabel}>Day 7: {overview?.retentionRate.day7}%</Text>
        </View>
        <View style={styles.retentionBar}>
          <View style={[styles.retentionFill, { width: '46%', backgroundColor: '#f59e0b' }]} />
          <Text style={styles.retentionLabel}>Day 30: {overview?.retentionRate.day30}%</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderEngagementMetrics = () => (
    <Animated.View
      style={[styles.engagementContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.sectionTitle}>Engagement Metrics</Text>
      <View style={styles.engagementGrid}>
        <View style={styles.engagementCard}>
          <Icon name="clock" size={20} color="#3b82f6" />
          <Text style={styles.engagementValue}>{overview?.averageSessionDuration} min</Text>
          <Text style={styles.engagementLabel}>Avg Session</Text>
        </View>
        <View style={styles.engagementCard}>
          <Icon name="star" size={20} color="#f59e0b" />
          <Text style={styles.engagementValue}>{overview?.engagementScore}/10</Text>
          <Text style={styles.engagementLabel}>Engagement</Text>
        </View>
        <View style={styles.engagementCard}>
          <Icon name="fire" size={20} color="#ef4444" />
          <Text style={styles.engagementValue}>5.2 days</Text>
          <Text style={styles.engagementLabel}>Avg Streak</Text>
        </View>
        <View style={styles.engagementCard}>
          <Icon name="heart" size={20} color="#ec4899" />
          <Text style={styles.engagementValue}>89%</Text>
          <Text style={styles.engagementLabel}>Satisfaction</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderTopUsers = () => (
    <Animated.View
      style={[styles.topUsersContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.sectionTitle}>Top Performers</Text>
      {userAnalytics.slice(0, 5).map((user, index) => (
        <View key={user.userId} style={styles.userCard}>
          <View style={styles.userRank}>
            <Text style={styles.rankNumber}>#{index + 1}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.username}</Text>
            <Text style={styles.userStats}>
              {user.totalXP} XP • Level {user.currentLevel} • {user.streak} day streak
            </Text>
          </View>
          <View style={styles.userScore}>
            <Text style={styles.scoreValue}>{user.performance.engagementScore}</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>
        </View>
      ))}
    </Animated.View>
  );

  const renderTopContent = () => (
    <Animated.View
      style={[styles.topContentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.sectionTitle}>Top Content</Text>
      {contentAnalytics.slice(0, 5).map((content, index) => (
        <View key={content.contentId} style={styles.contentCard}>
          <View style={styles.contentRank}>
            <Text style={styles.rankNumber}>#{index + 1}</Text>
          </View>
          <View style={styles.contentInfo}>
            <Text style={styles.contentTitle}>{content.title}</Text>
            <Text style={styles.contentStats}>
              {content.views} views • {content.completionRate}% completion • {content.averageRating}★
            </Text>
          </View>
          <View style={styles.contentScore}>
            <Text style={styles.scoreValue}>{content.performance.engagement}</Text>
            <Text style={styles.scoreLabel}>Engagement</Text>
          </View>
        </View>
      ))}
    </Animated.View>
  );

  const renderOverview = () => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
      }
    >
      {renderOverviewMetrics()}
      {renderRetentionChart()}
      {renderEngagementMetrics()}
      {renderTopUsers()}
      {renderTopContent()}
    </ScrollView>
  );

  const renderUsers = () => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
      }
    >
      <Text style={styles.sectionTitle}>User Analytics</Text>
      {userAnalytics.map((user) => (
        <Animated.View
          key={user.userId}
          style={[styles.detailedUserCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.userHeader}>
            <Text style={styles.userName}>{user.username}</Text>
            <Text style={styles.userLevel}>Level {user.currentLevel}</Text>
          </View>
          <View style={styles.userMetrics}>
            <View style={styles.userMetric}>
              <Text style={styles.userMetricValue}>{user.totalXP}</Text>
              <Text style={styles.userMetricLabel}>Total XP</Text>
            </View>
            <View style={styles.userMetric}>
              <Text style={styles.userMetricValue}>{user.modulesCompleted}</Text>
              <Text style={styles.userMetricLabel}>Modules</Text>
            </View>
            <View style={styles.userMetric}>
              <Text style={styles.userMetricValue}>{user.lessonsCompleted}</Text>
              <Text style={styles.userMetricLabel}>Lessons</Text>
            </View>
            <View style={styles.userMetric}>
              <Text style={styles.userMetricValue}>{user.streak}</Text>
              <Text style={styles.userMetricLabel}>Streak</Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </ScrollView>
  );

  const renderContent = () => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
      }
    >
      <Text style={styles.sectionTitle}>Content Analytics</Text>
      {contentAnalytics.map((content) => (
        <Animated.View
          key={content.contentId}
          style={[styles.detailedContentCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.contentHeader}>
            <Text style={styles.contentTitle}>{content.title}</Text>
            <Text style={styles.contentType}>{content.contentType}</Text>
          </View>
          <View style={styles.contentMetrics}>
            <View style={styles.contentMetric}>
              <Text style={styles.contentMetricValue}>{content.views}</Text>
              <Text style={styles.contentMetricLabel}>Views</Text>
            </View>
            <View style={styles.contentMetric}>
              <Text style={styles.contentMetricValue}>{content.completions}</Text>
              <Text style={styles.contentMetricLabel}>Completions</Text>
            </View>
            <View style={styles.contentMetric}>
              <Text style={styles.contentMetricValue}>{content.completionRate}%</Text>
              <Text style={styles.contentMetricLabel}>Rate</Text>
            </View>
            <View style={styles.contentMetric}>
              <Text style={styles.contentMetricValue}>{content.averageRating}★</Text>
              <Text style={styles.contentMetricLabel}>Rating</Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </ScrollView>
  );

  const renderCurrentView = () => {
    switch (selectedView) {
      case 'overview': return renderOverview();
      case 'users': return renderUsers();
      case 'content': return renderContent();
      case 'engagement': return renderOverview();
      case 'revenue': return renderOverview();
      default: return renderOverview();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Icon name="download" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Period Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodContainer}
        contentContainerStyle={styles.periodContent}
      >
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodTab,
              selectedPeriod === period.key && styles.activePeriodTab,
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Icon
              name={period.icon as any}
              size={16}
              color={selectedPeriod === period.key ? '#667eea' : '#64748b'}
            />
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period.key && styles.activePeriodText,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* View Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.viewContainer}
        contentContainerStyle={styles.viewContent}
      >
        {views.map((view) => (
          <TouchableOpacity
            key={view.key}
            style={[
              styles.viewTab,
              selectedView === view.key && styles.activeViewTab,
            ]}
            onPress={() => setSelectedView(view.key)}
          >
            <Icon
              name={view.icon as any}
              size={16}
              color={selectedView === view.key ? '#667eea' : '#64748b'}
            />
            <Text
              style={[
                styles.viewText,
                selectedView === view.key && styles.activeViewText,
              ]}
            >
              {view.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {renderCurrentView()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  exportButton: {
    padding: 8,
  },
  periodContainer: {
    marginBottom: 8,
  },
  periodContent: {
    paddingHorizontal: 20,
  },
  periodTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activePeriodTab: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
  },
  periodText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activePeriodText: {
    color: '#667eea',
  },
  viewContainer: {
    marginBottom: 16,
  },
  viewContent: {
    paddingHorizontal: 20,
  },
  viewTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeViewTab: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
  },
  viewText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeViewText: {
    color: '#667eea',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  metricsContainer: {
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  retentionChart: {
    gap: 12,
  },
  retentionBar: {
    position: 'relative',
  },
  retentionFill: {
    height: 24,
    borderRadius: 12,
    marginBottom: 4,
  },
  retentionLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  engagementContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  engagementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  engagementCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  engagementValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  engagementLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  topUsersContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  userRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  userStats: {
    fontSize: 12,
    color: '#64748b',
  },
  userScore: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  topContentContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  contentRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  contentStats: {
    fontSize: 12,
    color: '#64748b',
  },
  contentScore: {
    alignItems: 'center',
  },
  detailedUserCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userLevel: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  userMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userMetric: {
    alignItems: 'center',
  },
  userMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  userMetricLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  detailedContentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contentType: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contentMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contentMetric: {
    alignItems: 'center',
  },
  contentMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  contentMetricLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
});

export default AnalyticsDashboardScreen;
