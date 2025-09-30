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
import { UserAnalytics, LearningPathStep } from '../types/AnalyticsTypes';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const UserInsightsScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [showLearningPath, setShowLearningPath] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const periods = [
    { key: '7d', label: '7 Days', icon: 'calendar-week' },
    { key: '30d', label: '30 Days', icon: 'calendar-alt' },
    { key: '90d', label: '90 Days', icon: 'calendar-check' },
    { key: 'all', label: 'All Time', icon: 'calendar-plus' },
  ];

  useEffect(() => {
    loadUserAnalytics();
    animateIn();
  }, [selectedPeriod]);

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

  const loadUserAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with API call
      const mockUserAnalytics: UserAnalytics = {
        userId: user?.uuid || 'current_user',
        username: user?.username || 'Current User',
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
        badges: ['Constitution Scholar', 'Quiz Master', 'Study Streak', 'Social Learner'],
        learningPath: [
          {
            id: '1',
            type: 'module',
            title: 'Constitution Basics',
            completedAt: '2024-01-16T10:30:00Z',
            timeSpent: 45,
            xpEarned: 100,
            order: 1,
          },
          {
            id: '2',
            type: 'lesson',
            title: 'Introduction to Constitution',
            completedAt: '2024-01-16T11:15:00Z',
            timeSpent: 15,
            xpEarned: 25,
            order: 2,
          },
          {
            id: '3',
            type: 'quiz',
            title: 'Constitution Basics Quiz',
            completedAt: '2024-01-16T11:30:00Z',
            score: 85,
            timeSpent: 10,
            xpEarned: 50,
            order: 3,
          },
          {
            id: '4',
            type: 'achievement',
            title: 'Constitution Scholar Badge',
            completedAt: '2024-01-16T11:35:00Z',
            timeSpent: 0,
            xpEarned: 0,
            order: 4,
          },
        ],
        performance: {
          averageQuizScore: 85.2,
          averageTimePerLesson: 18.5,
          completionRate: 92.3,
          engagementScore: 8.5,
        },
        preferences: {
          favoriteCategories: ['Law', 'Civics', 'History'],
          preferredLearningTime: 'evening',
          deviceType: 'mobile',
          notificationSettings: {
            learning: true,
            social: true,
            achievement: true,
          },
        },
        socialActivity: {
          groupsJoined: 3,
          postsCreated: 12,
          commentsMade: 45,
          likesReceived: 89,
        },
      };

      setUserAnalytics(mockUserAnalytics);
    } catch (error) {
      console.error('Error loading user analytics:', error);
      Alert.alert('Error', 'Failed to load user analytics');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserAnalytics();
    setRefreshing(false);
  };

  const renderOverviewStats = () => (
    <Animated.View
      style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Icon name="trophy" size={24} color="#f59e0b" />
          <Text style={styles.statValue}>{userAnalytics?.totalXP}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="star" size={24} color="#3b82f6" />
          <Text style={styles.statValue}>{userAnalytics?.currentLevel}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="fire" size={24} color="#ef4444" />
          <Text style={styles.statValue}>{userAnalytics?.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="book" size={24} color="#10b981" />
          <Text style={styles.statValue}>{userAnalytics?.modulesCompleted}</Text>
          <Text style={styles.statLabel}>Modules</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderPerformanceMetrics = () => (
    <Animated.View
      style={[styles.performanceContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.sectionTitle}>Performance Metrics</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Quiz Average</Text>
          <Text style={styles.metricValue}>{userAnalytics?.performance.averageQuizScore}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${userAnalytics?.performance.averageQuizScore}%` }]} />
          </View>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Completion Rate</Text>
          <Text style={styles.metricValue}>{userAnalytics?.performance.completionRate}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${userAnalytics?.performance.completionRate}%` }]} />
          </View>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Engagement Score</Text>
          <Text style={styles.metricValue}>{userAnalytics?.performance.engagementScore}/10</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${userAnalytics?.performance.engagementScore * 10}%` }]} />
          </View>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Avg Time/Lesson</Text>
          <Text style={styles.metricValue}>{userAnalytics?.performance.averageTimePerLesson} min</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderBadges = () => (
    <Animated.View
      style={[styles.badgesContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.sectionTitle}>Earned Badges</Text>
      <View style={styles.badgesGrid}>
        {userAnalytics?.badges.map((badge, index) => (
          <View key={index} style={styles.badgeCard}>
            <Icon name="medal" size={24} color="#f59e0b" />
            <Text style={styles.badgeName}>{badge}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderLearningPath = () => (
    <Animated.View
      style={[styles.learningPathContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.learningPathHeader}>
        <Text style={styles.sectionTitle}>Learning Path</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => setShowLearningPath(true)}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Icon name="chevron-right" size={12} color="#667eea" />
        </TouchableOpacity>
      </View>
      <View style={styles.learningPath}>
        {userAnalytics?.learningPath.slice(0, 3).map((step, index) => (
          <View key={step.id} style={styles.learningStep}>
            <View style={styles.stepIndicator}>
              <Icon
                name={
                  step.type === 'module' ? 'book' :
                  step.type === 'lesson' ? 'file-text' :
                  step.type === 'quiz' ? 'question-circle' :
                  'trophy'
                }
                size={16}
                color="white"
              />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepMeta}>
                {step.timeSpent} min • {step.xpEarned} XP
                {step.score && ` • ${step.score}%`}
              </Text>
            </View>
            {index < 2 && <View style={styles.stepConnector} />}
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderSocialActivity = () => (
    <Animated.View
      style={[styles.socialContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.sectionTitle}>Social Activity</Text>
      <View style={styles.socialGrid}>
        <View style={styles.socialItem}>
          <Icon name="users" size={20} color="#3b82f6" />
          <Text style={styles.socialValue}>{userAnalytics?.socialActivity.groupsJoined}</Text>
          <Text style={styles.socialLabel}>Groups</Text>
        </View>
        <View style={styles.socialItem}>
          <Icon name="edit" size={20} color="#10b981" />
          <Text style={styles.socialValue}>{userAnalytics?.socialActivity.postsCreated}</Text>
          <Text style={styles.socialLabel}>Posts</Text>
        </View>
        <View style={styles.socialItem}>
          <Icon name="comment" size={20} color="#f59e0b" />
          <Text style={styles.socialValue}>{userAnalytics?.socialActivity.commentsMade}</Text>
          <Text style={styles.socialLabel}>Comments</Text>
        </View>
        <View style={styles.socialItem}>
          <Icon name="heart" size={20} color="#ef4444" />
          <Text style={styles.socialValue}>{userAnalytics?.socialActivity.likesReceived}</Text>
          <Text style={styles.socialLabel}>Likes</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderPreferences = () => (
    <Animated.View
      style={[styles.preferencesContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.sectionTitle}>Learning Preferences</Text>
      <View style={styles.preferencesList}>
        <View style={styles.preferenceItem}>
          <Icon name="tags" size={16} color="#64748b" />
          <Text style={styles.preferenceLabel}>Favorite Categories:</Text>
          <Text style={styles.preferenceValue}>
            {userAnalytics?.preferences.favoriteCategories.join(', ')}
          </Text>
        </View>
        <View style={styles.preferenceItem}>
          <Icon name="clock" size={16} color="#64748b" />
          <Text style={styles.preferenceLabel}>Preferred Time:</Text>
          <Text style={styles.preferenceValue}>
            {userAnalytics?.preferences.preferredLearningTime}
          </Text>
        </View>
        <View style={styles.preferenceItem}>
          <Icon name="mobile" size={16} color="#64748b" />
          <Text style={styles.preferenceLabel}>Device:</Text>
          <Text style={styles.preferenceValue}>
            {userAnalytics?.preferences.deviceType}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderLearningPathModal = () => (
    <Modal
      visible={showLearningPath}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowLearningPath(false)}>
            <Text style={styles.modalCancelText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Complete Learning Path</Text>
          <View style={styles.modalSpacer} />
        </View>
        
        <ScrollView style={styles.modalContent}>
          {userAnalytics?.learningPath.map((step, index) => (
            <View key={step.id} style={styles.fullLearningStep}>
              <View style={styles.stepIndicator}>
                <Icon
                  name={
                    step.type === 'module' ? 'book' :
                    step.type === 'lesson' ? 'file-text' :
                    step.type === 'quiz' ? 'question-circle' :
                    'trophy'
                  }
                  size={16}
                  color="white"
                />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepMeta}>
                  {step.timeSpent} min • {step.xpEarned} XP
                  {step.score && ` • ${step.score}%`}
                </Text>
                <Text style={styles.stepDate}>
                  {new Date(step.completedAt).toLocaleDateString()}
                </Text>
              </View>
              {index < (userAnalytics?.learningPath.length || 0) - 1 && (
                <View style={styles.stepConnector} />
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading your insights...</Text>
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
        <Text style={styles.headerTitle}>Your Learning Insights</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share" size={20} color="white" />
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

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        {renderOverviewStats()}
        {renderPerformanceMetrics()}
        {renderBadges()}
        {renderLearningPath()}
        {renderSocialActivity()}
        {renderPreferences()}
      </ScrollView>

      {renderLearningPathModal()}
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
  shareButton: {
    padding: 8,
  },
  periodContainer: {
    marginBottom: 16,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  performanceContainer: {
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
  metricsGrid: {
    gap: 16,
  },
  metricItem: {
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  badgesContainer: {
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
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    flex: 1,
    minWidth: (width - 80) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
  },
  badgeName: {
    marginLeft: 8,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  learningPathContainer: {
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
  learningPathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
    marginRight: 4,
  },
  learningPath: {
    gap: 8,
  },
  learningStep: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  stepMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  stepConnector: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: 20,
    backgroundColor: '#e2e8f0',
  },
  socialContainer: {
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
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialItem: {
    flex: 1,
    minWidth: (width - 80) / 2,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  socialValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  socialLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  preferencesContainer: {
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
  preferencesList: {
    gap: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  preferenceValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalSpacer: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  fullLearningStep: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  stepDate: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
});

export default UserInsightsScreen;

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
import { UserAnalytics, LearningPathStep } from '../types/AnalyticsTypes';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const UserInsightsScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [showLearningPath, setShowLearningPath] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const periods = [
    { key: '7d', label: '7 Days', icon: 'calendar-week' },
    { key: '30d', label: '30 Days', icon: 'calendar-alt' },
    { key: '90d', label: '90 Days', icon: 'calendar-check' },
    { key: 'all', label: 'All Time', icon: 'calendar-plus' },
  ];

  useEffect(() => {
    loadUserAnalytics();
    animateIn();
  }, [selectedPeriod]);

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

  const loadUserAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with API call
      const mockUserAnalytics: UserAnalytics = {
        userId: user?.uuid || 'current_user',
        username: user?.username || 'Current User',
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
        badges: ['Constitution Scholar', 'Quiz Master', 'Study Streak', 'Social Learner'],
        learningPath: [
          {
            id: '1',
            type: 'module',
            title: 'Constitution Basics',
            completedAt: '2024-01-16T10:30:00Z',
            timeSpent: 45,
            xpEarned: 100,
            order: 1,
          },
          {
            id: '2',
            type: 'lesson',
            title: 'Introduction to Constitution',
            completedAt: '2024-01-16T11:15:00Z',
            timeSpent: 15,
            xpEarned: 25,
            order: 2,
          },
          {
            id: '3',
            type: 'quiz',
            title: 'Constitution Basics Quiz',
            completedAt: '2024-01-16T11:30:00Z',
            score: 85,
            timeSpent: 10,
            xpEarned: 50,
            order: 3,
          },
          {
            id: '4',
            type: 'achievement',
            title: 'Constitution Scholar Badge',
            completedAt: '2024-01-16T11:35:00Z',
            timeSpent: 0,
            xpEarned: 0,
            order: 4,
          },
        ],
        performance: {
          averageQuizScore: 85.2,
          averageTimePerLesson: 18.5,
          completionRate: 92.3,
          engagementScore: 8.5,
        },
        preferences: {
          favoriteCategories: ['Law', 'Civics', 'History'],
          preferredLearningTime: 'evening',
          deviceType: 'mobile',
          notificationSettings: {
            learning: true,
            social: true,
            achievement: true,
          },
        },
        socialActivity: {
          groupsJoined: 3,
          postsCreated: 12,
          commentsMade: 45,
          likesReceived: 89,
        },
      };

      setUserAnalytics(mockUserAnalytics);
    } catch (error) {
      console.error('Error loading user analytics:', error);
      Alert.alert('Error', 'Failed to load user analytics');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserAnalytics();
    setRefreshing(false);
  };

  const renderOverviewStats = () => (
    <Animated.View
      style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Icon name="trophy" size={24} color="#f59e0b" />
          <Text style={styles.statValue}>{userAnalytics?.totalXP}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="star" size={24} color="#3b82f6" />
          <Text style={styles.statValue}>{userAnalytics?.currentLevel}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="fire" size={24} color="#ef4444" />
          <Text style={styles.statValue}>{userAnalytics?.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="book" size={24} color="#10b981" />
          <Text style={styles.statValue}>{userAnalytics?.modulesCompleted}</Text>
          <Text style={styles.statLabel}>Modules</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderPerformanceMetrics = () => (
    <Animated.View
      style={[styles.performanceContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.sectionTitle}>Performance Metrics</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Quiz Average</Text>
          <Text style={styles.metricValue}>{userAnalytics?.performance.averageQuizScore}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${userAnalytics?.performance.averageQuizScore}%` }]} />
          </View>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Completion Rate</Text>
          <Text style={styles.metricValue}>{userAnalytics?.performance.completionRate}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${userAnalytics?.performance.completionRate}%` }]} />
          </View>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Engagement Score</Text>
          <Text style={styles.metricValue}>{userAnalytics?.performance.engagementScore}/10</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${userAnalytics?.performance.engagementScore * 10}%` }]} />
          </View>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Avg Time/Lesson</Text>
          <Text style={styles.metricValue}>{userAnalytics?.performance.averageTimePerLesson} min</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderBadges = () => (
    <Animated.View
      style={[styles.badgesContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.sectionTitle}>Earned Badges</Text>
      <View style={styles.badgesGrid}>
        {userAnalytics?.badges.map((badge, index) => (
          <View key={index} style={styles.badgeCard}>
            <Icon name="medal" size={24} color="#f59e0b" />
            <Text style={styles.badgeName}>{badge}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderLearningPath = () => (
    <Animated.View
      style={[styles.learningPathContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.learningPathHeader}>
        <Text style={styles.sectionTitle}>Learning Path</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => setShowLearningPath(true)}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Icon name="chevron-right" size={12} color="#667eea" />
        </TouchableOpacity>
      </View>
      <View style={styles.learningPath}>
        {userAnalytics?.learningPath.slice(0, 3).map((step, index) => (
          <View key={step.id} style={styles.learningStep}>
            <View style={styles.stepIndicator}>
              <Icon
                name={
                  step.type === 'module' ? 'book' :
                  step.type === 'lesson' ? 'file-text' :
                  step.type === 'quiz' ? 'question-circle' :
                  'trophy'
                }
                size={16}
                color="white"
              />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepMeta}>
                {step.timeSpent} min • {step.xpEarned} XP
                {step.score && ` • ${step.score}%`}
              </Text>
            </View>
            {index < 2 && <View style={styles.stepConnector} />}
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderSocialActivity = () => (
    <Animated.View
      style={[styles.socialContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.sectionTitle}>Social Activity</Text>
      <View style={styles.socialGrid}>
        <View style={styles.socialItem}>
          <Icon name="users" size={20} color="#3b82f6" />
          <Text style={styles.socialValue}>{userAnalytics?.socialActivity.groupsJoined}</Text>
          <Text style={styles.socialLabel}>Groups</Text>
        </View>
        <View style={styles.socialItem}>
          <Icon name="edit" size={20} color="#10b981" />
          <Text style={styles.socialValue}>{userAnalytics?.socialActivity.postsCreated}</Text>
          <Text style={styles.socialLabel}>Posts</Text>
        </View>
        <View style={styles.socialItem}>
          <Icon name="comment" size={20} color="#f59e0b" />
          <Text style={styles.socialValue}>{userAnalytics?.socialActivity.commentsMade}</Text>
          <Text style={styles.socialLabel}>Comments</Text>
        </View>
        <View style={styles.socialItem}>
          <Icon name="heart" size={20} color="#ef4444" />
          <Text style={styles.socialValue}>{userAnalytics?.socialActivity.likesReceived}</Text>
          <Text style={styles.socialLabel}>Likes</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderPreferences = () => (
    <Animated.View
      style={[styles.preferencesContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.sectionTitle}>Learning Preferences</Text>
      <View style={styles.preferencesList}>
        <View style={styles.preferenceItem}>
          <Icon name="tags" size={16} color="#64748b" />
          <Text style={styles.preferenceLabel}>Favorite Categories:</Text>
          <Text style={styles.preferenceValue}>
            {userAnalytics?.preferences.favoriteCategories.join(', ')}
          </Text>
        </View>
        <View style={styles.preferenceItem}>
          <Icon name="clock" size={16} color="#64748b" />
          <Text style={styles.preferenceLabel}>Preferred Time:</Text>
          <Text style={styles.preferenceValue}>
            {userAnalytics?.preferences.preferredLearningTime}
          </Text>
        </View>
        <View style={styles.preferenceItem}>
          <Icon name="mobile" size={16} color="#64748b" />
          <Text style={styles.preferenceLabel}>Device:</Text>
          <Text style={styles.preferenceValue}>
            {userAnalytics?.preferences.deviceType}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderLearningPathModal = () => (
    <Modal
      visible={showLearningPath}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowLearningPath(false)}>
            <Text style={styles.modalCancelText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Complete Learning Path</Text>
          <View style={styles.modalSpacer} />
        </View>
        
        <ScrollView style={styles.modalContent}>
          {userAnalytics?.learningPath.map((step, index) => (
            <View key={step.id} style={styles.fullLearningStep}>
              <View style={styles.stepIndicator}>
                <Icon
                  name={
                    step.type === 'module' ? 'book' :
                    step.type === 'lesson' ? 'file-text' :
                    step.type === 'quiz' ? 'question-circle' :
                    'trophy'
                  }
                  size={16}
                  color="white"
                />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepMeta}>
                  {step.timeSpent} min • {step.xpEarned} XP
                  {step.score && ` • ${step.score}%`}
                </Text>
                <Text style={styles.stepDate}>
                  {new Date(step.completedAt).toLocaleDateString()}
                </Text>
              </View>
              {index < (userAnalytics?.learningPath.length || 0) - 1 && (
                <View style={styles.stepConnector} />
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading your insights...</Text>
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
        <Text style={styles.headerTitle}>Your Learning Insights</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share" size={20} color="white" />
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

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        {renderOverviewStats()}
        {renderPerformanceMetrics()}
        {renderBadges()}
        {renderLearningPath()}
        {renderSocialActivity()}
        {renderPreferences()}
      </ScrollView>

      {renderLearningPathModal()}
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
  shareButton: {
    padding: 8,
  },
  periodContainer: {
    marginBottom: 16,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  performanceContainer: {
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
  metricsGrid: {
    gap: 16,
  },
  metricItem: {
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  badgesContainer: {
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
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    flex: 1,
    minWidth: (width - 80) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
  },
  badgeName: {
    marginLeft: 8,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  learningPathContainer: {
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
  learningPathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
    marginRight: 4,
  },
  learningPath: {
    gap: 8,
  },
  learningStep: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  stepMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  stepConnector: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: 20,
    backgroundColor: '#e2e8f0',
  },
  socialContainer: {
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
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialItem: {
    flex: 1,
    minWidth: (width - 80) / 2,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  socialValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  socialLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  preferencesContainer: {
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
  preferencesList: {
    gap: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  preferenceValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalSpacer: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  fullLearningStep: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  stepDate: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
});

export default UserInsightsScreen;
