import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

interface LearningStats {
  totalModules: number;
  completedModules: number;
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  completedQuizzes: number;
  totalXP: number;
  currentLevel: number;
  streak: number;
  longestStreak: number;
  averageQuizScore: number;
  timeSpent: number; // in minutes
  badgesEarned: number;
  weeklyProgress: Array<{
    day: string;
    lessonsCompleted: number;
    xpEarned: number;
  }>;
  moduleProgress: Array<{
    moduleId: string;
    title: string;
    progress: number;
    lessonsCompleted: number;
    totalLessons: number;
    xpEarned: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'lesson' | 'quiz' | 'module';
    title: string;
    timestamp: string;
    xpEarned: number;
  }>;
}

const ProgressAnalyticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        setStats(null);
        return;
      }

      // Fetch comprehensive analytics from backend
      const [userStats, userProgress, modules] = await Promise.all([
        apiService.getUserLearningStats(),
        apiService.getUserProgress(user.uuid),
        apiService.getModules()
      ]);

      // Process and combine the data
      const processedStats: LearningStats = {
        totalModules: modules?.length || 0,
        completedModules: userProgress?.completedModules || 0,
        totalLessons: userProgress?.totalLessons || 0,
        completedLessons: userProgress?.completedLessons || 0,
        totalQuizzes: userProgress?.totalQuizzes || 0,
        completedQuizzes: userProgress?.completedQuizzes || 0,
        totalXP: userStats?.totalXP || user?.xp || 0,
        currentLevel: userStats?.level || 1,
        streak: userStats?.streak || 0,
        longestStreak: userStats?.longestStreak || 0,
        averageQuizScore: userStats?.averageQuizScore || 0,
        timeSpent: userStats?.timeSpent || 0,
        badgesEarned: userStats?.badgesEarned || 0,
        weeklyProgress: userStats?.weeklyProgress || generateMockWeeklyProgress(),
        moduleProgress: userStats?.moduleProgress || generateMockModuleProgress(modules),
        recentActivity: userStats?.recentActivity || generateMockRecentActivity(),
      };

      setStats(processedStats);

      // Animate progress bars
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();

    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set mock data for demonstration
      setStats(generateMockStats());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockStats = (): LearningStats => ({
    totalModules: 8,
    completedModules: 3,
    totalLessons: 45,
    completedLessons: 18,
    totalQuizzes: 12,
    completedQuizzes: 8,
    totalXP: 1250,
    currentLevel: 4,
    streak: 5,
    longestStreak: 12,
    averageQuizScore: 78,
    timeSpent: 420, // 7 hours
    badgesEarned: 6,
    weeklyProgress: generateMockWeeklyProgress(),
    moduleProgress: generateMockModuleProgress([]),
    recentActivity: generateMockRecentActivity(),
  });

  const generateMockWeeklyProgress = () => [
    { day: 'Mon', lessonsCompleted: 2, xpEarned: 150 },
    { day: 'Tue', lessonsCompleted: 3, xpEarned: 200 },
    { day: 'Wed', lessonsCompleted: 1, xpEarned: 100 },
    { day: 'Thu', lessonsCompleted: 4, xpEarned: 300 },
    { day: 'Fri', lessonsCompleted: 2, xpEarned: 150 },
    { day: 'Sat', lessonsCompleted: 0, xpEarned: 0 },
    { day: 'Sun', lessonsCompleted: 1, xpEarned: 75 },
  ];

  const generateMockModuleProgress = (modules: any[]) => [
    { moduleId: '1', title: 'Constitutional Rights', progress: 100, lessonsCompleted: 5, totalLessons: 5, xpEarned: 300 },
    { moduleId: '2', title: 'Voting Process', progress: 80, lessonsCompleted: 4, totalLessons: 5, xpEarned: 240 },
    { moduleId: '3', title: 'Government Structure', progress: 60, lessonsCompleted: 3, totalLessons: 5, xpEarned: 180 },
    { moduleId: '4', title: 'Civic Responsibilities', progress: 40, lessonsCompleted: 2, totalLessons: 5, xpEarned: 120 },
    { moduleId: '5', title: 'Economic Rights', progress: 20, lessonsCompleted: 1, totalLessons: 5, xpEarned: 60 },
  ];

  const generateMockRecentActivity = () => [
    { id: '1', type: 'lesson', title: 'Understanding Article 26', timestamp: '2 hours ago', xpEarned: 50 },
    { id: '2', type: 'quiz', title: 'Constitutional Rights Quiz', timestamp: '1 day ago', xpEarned: 75 },
    { id: '3', type: 'module', title: 'Voting Process Module', timestamp: '2 days ago', xpEarned: 200 },
    { id: '4', type: 'lesson', title: 'Government Structure Basics', timestamp: '3 days ago', xpEarned: 50 },
    { id: '5', type: 'quiz', title: 'Civic Responsibilities Quiz', timestamp: '4 days ago', xpEarned: 60 },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getLevelProgress = () => {
    if (!stats) return 0;
    const currentLevelXP = stats.currentLevel * 500;
    const nextLevelXP = (stats.currentLevel + 1) * 500;
    const progress = ((stats.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6cfa" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="exclamation-triangle" size={60} color="#ef4444" />
          <Text style={styles.errorTitle}>Unable to load analytics</Text>
          <Text style={styles.errorText}>Please check your connection and try again</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAnalytics}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4a6cfa', '#667eea']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Learning Analytics</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Icon name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={[styles.analyticsContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* Overview Cards */}
          <View style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <Icon name="book" size={24} color="#4a6cfa" />
                <Text style={styles.overviewNumber}>{stats.completedLessons}/{stats.totalLessons}</Text>
                <Text style={styles.overviewLabel}>Lessons</Text>
              </View>
              <View style={styles.overviewCard}>
                <Icon name="trophy" size={24} color="#f59e0b" />
                <Text style={styles.overviewNumber}>{stats.totalXP}</Text>
                <Text style={styles.overviewLabel}>Total XP</Text>
              </View>
              <View style={styles.overviewCard}>
                <Icon name="fire" size={24} color="#ef4444" />
                <Text style={styles.overviewNumber}>{stats.streak}</Text>
                <Text style={styles.overviewLabel}>Day Streak</Text>
              </View>
              <View style={styles.overviewCard}>
                <Icon name="clock-o" size={24} color="#10b981" />
                <Text style={styles.overviewNumber}>{formatTime(stats.timeSpent)}</Text>
                <Text style={styles.overviewLabel}>Time Spent</Text>
              </View>
            </View>
          </View>

          {/* Level Progress */}
          <View style={styles.levelSection}>
            <Text style={styles.sectionTitle}>Level Progress</Text>
            <View style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelText}>Level {stats.currentLevel}</Text>
                <Text style={styles.xpText}>{stats.totalXP} XP</Text>
              </View>
              <View style={styles.levelProgressBar}>
                <Animated.View 
                  style={[
                    styles.levelProgressFill,
                    { 
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', `${getLevelProgress()}%`],
                      })
                    }
                  ]} 
                />
              </View>
              <Text style={styles.nextLevelText}>
                {(stats.currentLevel + 1) * 500 - stats.totalXP} XP to Level {stats.currentLevel + 1}
              </Text>
            </View>
          </View>

          {/* Weekly Progress Chart */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Weekly Activity</Text>
            <View style={styles.chartCard}>
              <View style={styles.chartContainer}>
                {stats.weeklyProgress.map((day, index) => (
                  <View key={day.day} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <Animated.View 
                        style={[
                          styles.bar,
                          { 
                            height: progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, (day.lessonsCompleted / 4) * 100],
                            })
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.barLabel}>{day.day}</Text>
                    <Text style={styles.barValue}>{day.lessonsCompleted}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Module Progress */}
          <View style={styles.modulesSection}>
            <Text style={styles.sectionTitle}>Module Progress</Text>
            {stats.moduleProgress.map((module, index) => (
              <View key={module.moduleId} style={styles.moduleCard}>
                <View style={styles.moduleHeader}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleProgress}>{module.progress}%</Text>
                </View>
                <View style={styles.moduleProgressBar}>
                  <Animated.View 
                    style={[
                      styles.moduleProgressFill,
                      { 
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${module.progress}%`],
                        })
                      }
                    ]} 
                  />
                </View>
                <View style={styles.moduleStats}>
                  <Text style={styles.moduleStat}>
                    {module.lessonsCompleted}/{module.totalLessons} lessons
                  </Text>
                  <Text style={styles.moduleStat}>
                    {module.xpEarned} XP earned
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Recent Activity */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              {stats.recentActivity.map((activity, index) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Icon 
                      name={activity.type === 'lesson' ? 'book' : activity.type === 'quiz' ? 'question-circle' : 'graduation-cap'} 
                      size={16} 
                      color="#4a6cfa" 
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.timestamp}</Text>
                  </View>
                  <Text style={styles.activityXP}>+{activity.xpEarned} XP</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Achievements Preview */}
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsCard}>
              <View style={styles.achievementItem}>
                <Icon name="trophy" size={24} color="#f59e0b" />
                <Text style={styles.achievementText}>{stats.badgesEarned} Badges Earned</Text>
              </View>
              <View style={styles.achievementItem}>
                <Icon name="fire" size={24} color="#ef4444" />
                <Text style={styles.achievementText}>Best Streak: {stats.longestStreak} days</Text>
              </View>
              <View style={styles.achievementItem}>
                <Icon name="star" size={24} color="#10b981" />
                <Text style={styles.achievementText}>Avg Quiz Score: {stats.averageQuizScore}%</Text>
              </View>
            </View>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  analyticsContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4a6cfa',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  overviewSection: {
    marginBottom: 24,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  levelSection: {
    marginBottom: 24,
  },
  levelCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  xpText: {
    fontSize: 16,
    color: '#4a6cfa',
    fontWeight: '600',
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#4a6cfa',
    borderRadius: 4,
  },
  nextLevelText: {
    fontSize: 14,
    color: '#64748b',
  },
  chartSection: {
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    backgroundColor: '#4a6cfa',
    borderRadius: 4,
    width: 20,
  },
  barLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  barValue: {
    fontSize: 10,
    color: '#4a6cfa',
    fontWeight: '600',
    marginTop: 2,
  },
  modulesSection: {
    marginBottom: 24,
  },
  moduleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  moduleProgress: {
    fontSize: 14,
    color: '#4a6cfa',
    fontWeight: '600',
  },
  moduleProgressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 8,
  },
  moduleProgressFill: {
    height: '100%',
    backgroundColor: '#4a6cfa',
    borderRadius: 3,
  },
  moduleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moduleStat: {
    fontSize: 12,
    color: '#64748b',
  },
  activitySection: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#64748b',
  },
  activityXP: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  achievementText: {
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default ProgressAnalyticsScreen;

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

interface LearningStats {
  totalModules: number;
  completedModules: number;
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  completedQuizzes: number;
  totalXP: number;
  currentLevel: number;
  streak: number;
  longestStreak: number;
  averageQuizScore: number;
  timeSpent: number; // in minutes
  badgesEarned: number;
  weeklyProgress: Array<{
    day: string;
    lessonsCompleted: number;
    xpEarned: number;
  }>;
  moduleProgress: Array<{
    moduleId: string;
    title: string;
    progress: number;
    lessonsCompleted: number;
    totalLessons: number;
    xpEarned: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'lesson' | 'quiz' | 'module';
    title: string;
    timestamp: string;
    xpEarned: number;
  }>;
}

const ProgressAnalyticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        setStats(null);
        return;
      }

      // Fetch comprehensive analytics from backend
      const [userStats, userProgress, modules] = await Promise.all([
        apiService.getUserLearningStats(),
        apiService.getUserProgress(user.uuid),
        apiService.getModules()
      ]);

      // Process and combine the data
      const processedStats: LearningStats = {
        totalModules: modules?.length || 0,
        completedModules: userProgress?.completedModules || 0,
        totalLessons: userProgress?.totalLessons || 0,
        completedLessons: userProgress?.completedLessons || 0,
        totalQuizzes: userProgress?.totalQuizzes || 0,
        completedQuizzes: userProgress?.completedQuizzes || 0,
        totalXP: userStats?.totalXP || user?.xp || 0,
        currentLevel: userStats?.level || 1,
        streak: userStats?.streak || 0,
        longestStreak: userStats?.longestStreak || 0,
        averageQuizScore: userStats?.averageQuizScore || 0,
        timeSpent: userStats?.timeSpent || 0,
        badgesEarned: userStats?.badgesEarned || 0,
        weeklyProgress: userStats?.weeklyProgress || generateMockWeeklyProgress(),
        moduleProgress: userStats?.moduleProgress || generateMockModuleProgress(modules),
        recentActivity: userStats?.recentActivity || generateMockRecentActivity(),
      };

      setStats(processedStats);

      // Animate progress bars
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();

    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set mock data for demonstration
      setStats(generateMockStats());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockStats = (): LearningStats => ({
    totalModules: 8,
    completedModules: 3,
    totalLessons: 45,
    completedLessons: 18,
    totalQuizzes: 12,
    completedQuizzes: 8,
    totalXP: 1250,
    currentLevel: 4,
    streak: 5,
    longestStreak: 12,
    averageQuizScore: 78,
    timeSpent: 420, // 7 hours
    badgesEarned: 6,
    weeklyProgress: generateMockWeeklyProgress(),
    moduleProgress: generateMockModuleProgress([]),
    recentActivity: generateMockRecentActivity(),
  });

  const generateMockWeeklyProgress = () => [
    { day: 'Mon', lessonsCompleted: 2, xpEarned: 150 },
    { day: 'Tue', lessonsCompleted: 3, xpEarned: 200 },
    { day: 'Wed', lessonsCompleted: 1, xpEarned: 100 },
    { day: 'Thu', lessonsCompleted: 4, xpEarned: 300 },
    { day: 'Fri', lessonsCompleted: 2, xpEarned: 150 },
    { day: 'Sat', lessonsCompleted: 0, xpEarned: 0 },
    { day: 'Sun', lessonsCompleted: 1, xpEarned: 75 },
  ];

  const generateMockModuleProgress = (modules: any[]) => [
    { moduleId: '1', title: 'Constitutional Rights', progress: 100, lessonsCompleted: 5, totalLessons: 5, xpEarned: 300 },
    { moduleId: '2', title: 'Voting Process', progress: 80, lessonsCompleted: 4, totalLessons: 5, xpEarned: 240 },
    { moduleId: '3', title: 'Government Structure', progress: 60, lessonsCompleted: 3, totalLessons: 5, xpEarned: 180 },
    { moduleId: '4', title: 'Civic Responsibilities', progress: 40, lessonsCompleted: 2, totalLessons: 5, xpEarned: 120 },
    { moduleId: '5', title: 'Economic Rights', progress: 20, lessonsCompleted: 1, totalLessons: 5, xpEarned: 60 },
  ];

  const generateMockRecentActivity = () => [
    { id: '1', type: 'lesson', title: 'Understanding Article 26', timestamp: '2 hours ago', xpEarned: 50 },
    { id: '2', type: 'quiz', title: 'Constitutional Rights Quiz', timestamp: '1 day ago', xpEarned: 75 },
    { id: '3', type: 'module', title: 'Voting Process Module', timestamp: '2 days ago', xpEarned: 200 },
    { id: '4', type: 'lesson', title: 'Government Structure Basics', timestamp: '3 days ago', xpEarned: 50 },
    { id: '5', type: 'quiz', title: 'Civic Responsibilities Quiz', timestamp: '4 days ago', xpEarned: 60 },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getLevelProgress = () => {
    if (!stats) return 0;
    const currentLevelXP = stats.currentLevel * 500;
    const nextLevelXP = (stats.currentLevel + 1) * 500;
    const progress = ((stats.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6cfa" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="exclamation-triangle" size={60} color="#ef4444" />
          <Text style={styles.errorTitle}>Unable to load analytics</Text>
          <Text style={styles.errorText}>Please check your connection and try again</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAnalytics}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4a6cfa', '#667eea']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Learning Analytics</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Icon name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={[styles.analyticsContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* Overview Cards */}
          <View style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <Icon name="book" size={24} color="#4a6cfa" />
                <Text style={styles.overviewNumber}>{stats.completedLessons}/{stats.totalLessons}</Text>
                <Text style={styles.overviewLabel}>Lessons</Text>
              </View>
              <View style={styles.overviewCard}>
                <Icon name="trophy" size={24} color="#f59e0b" />
                <Text style={styles.overviewNumber}>{stats.totalXP}</Text>
                <Text style={styles.overviewLabel}>Total XP</Text>
              </View>
              <View style={styles.overviewCard}>
                <Icon name="fire" size={24} color="#ef4444" />
                <Text style={styles.overviewNumber}>{stats.streak}</Text>
                <Text style={styles.overviewLabel}>Day Streak</Text>
              </View>
              <View style={styles.overviewCard}>
                <Icon name="clock-o" size={24} color="#10b981" />
                <Text style={styles.overviewNumber}>{formatTime(stats.timeSpent)}</Text>
                <Text style={styles.overviewLabel}>Time Spent</Text>
              </View>
            </View>
          </View>

          {/* Level Progress */}
          <View style={styles.levelSection}>
            <Text style={styles.sectionTitle}>Level Progress</Text>
            <View style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelText}>Level {stats.currentLevel}</Text>
                <Text style={styles.xpText}>{stats.totalXP} XP</Text>
              </View>
              <View style={styles.levelProgressBar}>
                <Animated.View 
                  style={[
                    styles.levelProgressFill,
                    { 
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', `${getLevelProgress()}%`],
                      })
                    }
                  ]} 
                />
              </View>
              <Text style={styles.nextLevelText}>
                {(stats.currentLevel + 1) * 500 - stats.totalXP} XP to Level {stats.currentLevel + 1}
              </Text>
            </View>
          </View>

          {/* Weekly Progress Chart */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Weekly Activity</Text>
            <View style={styles.chartCard}>
              <View style={styles.chartContainer}>
                {stats.weeklyProgress.map((day, index) => (
                  <View key={day.day} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <Animated.View 
                        style={[
                          styles.bar,
                          { 
                            height: progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, (day.lessonsCompleted / 4) * 100],
                            })
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.barLabel}>{day.day}</Text>
                    <Text style={styles.barValue}>{day.lessonsCompleted}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Module Progress */}
          <View style={styles.modulesSection}>
            <Text style={styles.sectionTitle}>Module Progress</Text>
            {stats.moduleProgress.map((module, index) => (
              <View key={module.moduleId} style={styles.moduleCard}>
                <View style={styles.moduleHeader}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleProgress}>{module.progress}%</Text>
                </View>
                <View style={styles.moduleProgressBar}>
                  <Animated.View 
                    style={[
                      styles.moduleProgressFill,
                      { 
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${module.progress}%`],
                        })
                      }
                    ]} 
                  />
                </View>
                <View style={styles.moduleStats}>
                  <Text style={styles.moduleStat}>
                    {module.lessonsCompleted}/{module.totalLessons} lessons
                  </Text>
                  <Text style={styles.moduleStat}>
                    {module.xpEarned} XP earned
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Recent Activity */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              {stats.recentActivity.map((activity, index) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Icon 
                      name={activity.type === 'lesson' ? 'book' : activity.type === 'quiz' ? 'question-circle' : 'graduation-cap'} 
                      size={16} 
                      color="#4a6cfa" 
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.timestamp}</Text>
                  </View>
                  <Text style={styles.activityXP}>+{activity.xpEarned} XP</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Achievements Preview */}
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsCard}>
              <View style={styles.achievementItem}>
                <Icon name="trophy" size={24} color="#f59e0b" />
                <Text style={styles.achievementText}>{stats.badgesEarned} Badges Earned</Text>
              </View>
              <View style={styles.achievementItem}>
                <Icon name="fire" size={24} color="#ef4444" />
                <Text style={styles.achievementText}>Best Streak: {stats.longestStreak} days</Text>
              </View>
              <View style={styles.achievementItem}>
                <Icon name="star" size={24} color="#10b981" />
                <Text style={styles.achievementText}>Avg Quiz Score: {stats.averageQuizScore}%</Text>
              </View>
            </View>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  analyticsContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4a6cfa',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  overviewSection: {
    marginBottom: 24,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  levelSection: {
    marginBottom: 24,
  },
  levelCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  xpText: {
    fontSize: 16,
    color: '#4a6cfa',
    fontWeight: '600',
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#4a6cfa',
    borderRadius: 4,
  },
  nextLevelText: {
    fontSize: 14,
    color: '#64748b',
  },
  chartSection: {
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    backgroundColor: '#4a6cfa',
    borderRadius: 4,
    width: 20,
  },
  barLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  barValue: {
    fontSize: 10,
    color: '#4a6cfa',
    fontWeight: '600',
    marginTop: 2,
  },
  modulesSection: {
    marginBottom: 24,
  },
  moduleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  moduleProgress: {
    fontSize: 14,
    color: '#4a6cfa',
    fontWeight: '600',
  },
  moduleProgressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 8,
  },
  moduleProgressFill: {
    height: '100%',
    backgroundColor: '#4a6cfa',
    borderRadius: 3,
  },
  moduleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moduleStat: {
    fontSize: 12,
    color: '#64748b',
  },
  activitySection: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#64748b',
  },
  activityXP: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  achievementText: {
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default ProgressAnalyticsScreen;
