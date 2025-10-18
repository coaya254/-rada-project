import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';
import LearningAPIService from '../../services/LearningAPIService';

const { width } = Dimensions.get('window');

interface ProgressDashboardScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'ProgressDashboard'>;
}

interface DailyActivity {
  date: string;
  xpEarned: number;
  lessonsCompleted: number;
  quizzesTaken: number;
}

interface CategoryProgress {
  category: string;
  progress: number;
  modulesCompleted: number;
  totalModules: number;
  color: string;
}

export const ProgressDashboardScreen: React.FC<ProgressDashboardScreenProps> = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState({
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    modulesCompleted: 0,
    totalModules: 0,
    lessonsCompleted: 0,
    totalLessons: 0,
    quizzesTaken: 0,
    averageScore: 0,
    totalTimeSpent: '0h 0m',
    rank: 0,
    totalUsers: 0,
  });

  const [weeklyActivity, setWeeklyActivity] = useState<DailyActivity[]>([]);
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>([]);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);

      // Fetch user progress
      const progressResponse = await LearningAPIService.getUserProgress();
      if (progressResponse.success && progressResponse.progress) {
        const hours = Math.floor(progressResponse.progress.hoursSpent || 0);
        const minutes = Math.round(((progressResponse.progress.hoursSpent || 0) % 1) * 60);

        setUserStats({
          totalXP: progressResponse.progress.totalXP || 0,
          level: progressResponse.progress.level || 1,
          currentStreak: progressResponse.progress.streak || 0,
          longestStreak: progressResponse.progress.longestStreak || 0,
          modulesCompleted: progressResponse.progress.completedModules || 0,
          totalModules: progressResponse.progress.totalModules || 0,
          lessonsCompleted: progressResponse.progress.lessonsCompleted || 0,
          totalLessons: 0, // TODO: Calculate from modules
          quizzesTaken: progressResponse.progress.quizzesPassed || 0,
          averageScore: 0, // TODO: Calculate from quiz attempts
          totalTimeSpent: `${hours}h ${minutes}m`,
          rank: 0, // TODO: Get from leaderboard
          totalUsers: 0,
        });
      }

      // Fetch weekly activity
      try {
        const activityResponse = await LearningAPIService.getWeeklyActivity();
        if (activityResponse.success && activityResponse.activity) {
          // Convert activity data to weekly format
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const today = new Date();
          const weekData: DailyActivity[] = [];

          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayActivity = activityResponse.activity.find((a: any) => a.date === dateStr);

            weekData.push({
              date: dayNames[date.getDay()],
              xpEarned: dayActivity?.xp_earned || 0,
              lessonsCompleted: 0, // TODO: Track separately
              quizzesTaken: 0, // TODO: Track separately
            });
          }

          setWeeklyActivity(weekData);
        }
      } catch (err) {
        console.log('Could not load weekly activity:', err);
        // Keep empty array if API fails
      }

      // Fetch modules by category for category progress
      try {
        const modulesResponse = await LearningAPIService.getModules();
        const modules = modulesResponse.data || modulesResponse.modules || [];

        // Group modules by category
        const categoriesMap = new Map<string, { completed: number; total: number }>();
        const categoryColors: { [key: string]: string } = {
          'Civic Education': '#3B82F6',
          'Government': '#10B981',
          'Elections': '#8B5CF6',
          'Rights': '#F59E0B',
          'Law': '#EF4444',
          'Policy': '#06B6D4',
        };

        modules.forEach((mod: any) => {
          const category = mod.category || 'General';
          const current = categoriesMap.get(category) || { completed: 0, total: 0 };

          current.total += 1;
          if (mod.progress_percentage === 100 || mod.completed_at) {
            current.completed += 1;
          }

          categoriesMap.set(category, current);
        });

        const categoryData: CategoryProgress[] = Array.from(categoriesMap.entries())
          .map(([category, stats]) => ({
            category,
            progress: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
            modulesCompleted: stats.completed,
            totalModules: stats.total,
            color: categoryColors[category] || '#6B7280',
          }))
          .sort((a, b) => b.progress - a.progress);

        setCategoryProgress(categoryData);
      } catch (err) {
        console.log('Could not load category progress:', err);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading progress data:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  };

  const maxXP = weeklyActivity.length > 0 ? Math.max(...weeklyActivity.map(d => d.xpEarned), 1) : 1;

  const renderActivityBar = (activity: DailyActivity) => {
    const heightPercentage = maxXP > 0 ? (activity.xpEarned / maxXP) * 100 : 0;
    const barHeight = Math.max((heightPercentage / 100) * 120, 20);

    return (
      <View key={activity.date} style={styles.activityBarContainer}>
        <View style={styles.activityBarWrapper}>
          <View style={[styles.activityBar, { height: barHeight }]}>
            <LinearGradient
              colors={['#3B82F6', '#1E40AF']}
              style={styles.activityBarGradient}
            />
          </View>
        </View>
        <Text style={styles.activityDate}>{activity.date}</Text>
        <Text style={styles.activityXP}>{activity.xpEarned}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#1E40AF']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.headerSubtitle}>Track your learning journey</Text>
        </View>

        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>Lvl {userStats.level}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading your progress...</Text>
          </View>
        )}

        {!loading && (
          <>
        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <MaterialIcons name="stars" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{userStats.totalXP}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
              <MaterialIcons name="local-fire-department" size={24} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{userStats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <MaterialIcons name="school" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{userStats.modulesCompleted}</Text>
            <Text style={styles.statLabel}>Modules Done</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
              <MaterialIcons name="emoji-events" size={24} color="#10B981" />
            </View>
            <Text style={styles.statValue}>#{userStats.rank}</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
        </View>

        {/* XP Progress to Next Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Level Progress</Text>
          <View style={styles.levelProgressCard}>
            <View style={styles.levelProgressHeader}>
              <View style={styles.currentLevelBadge}>
                <Text style={styles.currentLevelText}>{userStats.level}</Text>
              </View>
              <View style={styles.levelProgressInfo}>
                {(() => {
                  const currentLevelXP = (userStats.level - 1) * 100;
                  const nextLevelXP = userStats.level * 100;
                  const currentProgress = userStats.totalXP - currentLevelXP;
                  const xpToNext = nextLevelXP - userStats.totalXP;
                  const progressPercentage = ((currentProgress / 100) * 100);

                  return (
                    <>
                      <Text style={styles.levelProgressText}>
                        {currentProgress} / 100 XP
                      </Text>
                      <Text style={styles.levelProgressSubtext}>
                        {xpToNext} XP to Level {userStats.level + 1}
                      </Text>
                      <View style={styles.levelProgressBar}>
                        <View style={[styles.levelProgressFill, { width: `${progressPercentage}%` }]} />
                      </View>
                    </>
                  );
                })()}
              </View>
              <View style={styles.nextLevelBadge}>
                <Text style={styles.nextLevelText}>{userStats.level + 1}</Text>
              </View>
            </View>
          </View>
        </View>


        {/* Category Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress by Category</Text>
          {categoryProgress.map((category) => (
            <View key={category.category} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.category}</Text>
                <Text style={styles.categoryProgress}>
                  {category.modulesCompleted}/{category.totalModules} modules
                </Text>
              </View>
              <View style={styles.categoryProgressBar}>
                <View style={[styles.categoryProgressFill, {
                  width: `${category.progress}%`,
                  backgroundColor: category.color,
                }]} />
              </View>
              <Text style={styles.categoryPercentage}>{category.progress}%</Text>
            </View>
          ))}
        </View>

        {/* Additional Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Statistics</Text>
          <View style={styles.additionalStatsCard}>
            <View style={styles.additionalStatItem}>
              <View style={styles.additionalStatLeft}>
                <MaterialIcons name="quiz" size={20} color="#F59E0B" />
                <Text style={styles.additionalStatLabel}>Quizzes Passed</Text>
              </View>
              <Text style={styles.additionalStatValue}>{userStats.quizzesTaken}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.additionalStatItem}>
              <View style={styles.additionalStatLeft}>
                <MaterialIcons name="menu-book" size={20} color="#3B82F6" />
                <Text style={styles.additionalStatLabel}>Lessons Completed</Text>
              </View>
              <Text style={styles.additionalStatValue}>{userStats.lessonsCompleted}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.additionalStatItem}>
              <View style={styles.additionalStatLeft}>
                <MaterialIcons name="whatshot" size={20} color="#EF4444" />
                <Text style={styles.additionalStatLabel}>Longest Streak</Text>
              </View>
              <Text style={styles.additionalStatValue}>{userStats.longestStreak} days</Text>
            </View>
          </View>
        </View>

        {/* Completion Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Completion</Text>
          <View style={styles.completionCard}>
            <View style={styles.completionItem}>
              <View style={styles.completionHeader}>
                <Text style={styles.completionLabel}>Modules</Text>
                <Text style={styles.completionValue}>
                  {userStats.modulesCompleted}/{userStats.totalModules}
                </Text>
              </View>
              <View style={styles.completionBar}>
                <View style={[styles.completionFill, {
                  width: `${(userStats.modulesCompleted / userStats.totalModules) * 100}%`,
                  backgroundColor: '#3B82F6',
                }]} />
              </View>
            </View>

            <View style={styles.completionItem}>
              <View style={styles.completionHeader}>
                <Text style={styles.completionLabel}>Lessons</Text>
                <Text style={styles.completionValue}>
                  {userStats.lessonsCompleted}/{userStats.totalLessons}
                </Text>
              </View>
              <View style={styles.completionBar}>
                <View style={[styles.completionFill, {
                  width: `${(userStats.lessonsCompleted / userStats.totalLessons) * 100}%`,
                  backgroundColor: '#10B981',
                }]} />
              </View>
            </View>
          </View>
        </View>
        </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  levelProgressCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  levelProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  currentLevelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLevelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  levelProgressInfo: {
    flex: 1,
  },
  levelProgressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  levelProgressSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  nextLevelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextLevelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activePeriodButton: {
    backgroundColor: '#3B82F6',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activePeriodButtonText: {
    color: '#FFFFFF',
  },
  activityChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingVertical: 16,
    marginBottom: 16,
  },
  activityBarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  activityBarWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  activityBar: {
    width: 32,
    borderRadius: 4,
    overflow: 'hidden',
  },
  activityBarGradient: {
    flex: 1,
  },
  activityDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  activityXP: {
    fontSize: 10,
    color: '#999',
  },
  activitySummary: {
    gap: 8,
  },
  activitySummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activitySummaryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryProgress: {
    fontSize: 12,
    color: '#666',
  },
  categoryProgressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  additionalStatsCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  additionalStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  additionalStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  additionalStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  additionalStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 16,
  },
  completionCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 20,
  },
  completionItem: {
    gap: 8,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  completionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  completionBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    borderRadius: 4,
  },
});
