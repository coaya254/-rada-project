// src/screens/learning/admin/EnhancedAdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LearningAPIService from '../../services/LearningAPIService';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalModules: number;
  publishedModules: number;
  totalLessons: number;
  totalQuizzes: number;
  totalUsers: number;
  activeUsers: number;
  totalEnrollments: number;
  averageProgress: number;
  totalXPAwarded: number;
  completionRate: number;
}

interface RecentActivity {
  id: number;
  type: 'enrollment' | 'completion' | 'quiz' | 'achievement';
  user: string;
  module?: string;
  timestamp: string;
  icon: string;
  color: string;
}

interface EnhancedAdminDashboardProps {
  navigation: any;
}

export default function EnhancedAdminDashboard({ navigation }: EnhancedAdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalModules: 0,
    publishedModules: 0,
    totalLessons: 0,
    totalQuizzes: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalEnrollments: 0,
    averageProgress: 0,
    totalXPAwarded: 0,
    completionRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [modulesRes, lessonsRes, quizzesRes] = await Promise.all([
        LearningAPIService.adminGetModules(),
        LearningAPIService.adminGetLessons(),
        LearningAPIService.adminGetQuizzes(),
      ]);

      // Calculate stats from API responses
      const modules = modulesRes.modules || [];
      const lessons = lessonsRes.lessons || [];
      const quizzes = quizzesRes.quizzes || [];

      const publishedCount = modules.filter((m: any) => 
        m.is_published === 1 || m.is_published === true
      ).length;

      setStats({
        totalModules: modules.length,
        publishedModules: publishedCount,
        totalLessons: lessons.length,
        totalQuizzes: quizzes.length,
        totalUsers: 1250, // Replace with actual API call: await LearningAPIService.getTotalUsers()
        activeUsers: 342, // Replace with actual API call: await LearningAPIService.getActiveUsers()
        totalEnrollments: 3456, // Replace with actual API call: await LearningAPIService.getTotalEnrollments()
        averageProgress: 67, // Replace with actual API call: await LearningAPIService.getAverageProgress()
        totalXPAwarded: 125000, // Replace with actual API call: await LearningAPIService.getTotalXP()
        completionRate: 78, // Replace with actual API call: await LearningAPIService.getCompletionRate()
      });

      // Mock recent activity - replace with actual API call
      // const activityRes = await LearningAPIService.getRecentActivity();
      setRecentActivity([
        {
          id: 1,
          type: 'enrollment',
          user: 'John Doe',
          module: 'Constitutional Basics',
          timestamp: '2 minutes ago',
          icon: 'person-add',
          color: '#3B82F6',
        },
        {
          id: 2,
          type: 'completion',
          user: 'Jane Smith',
          module: 'Electoral Process',
          timestamp: '15 minutes ago',
          icon: 'check-circle',
          color: '#10B981',
        },
        {
          id: 3,
          type: 'quiz',
          user: 'Mike Johnson',
          module: 'Civil Rights History',
          timestamp: '1 hour ago',
          icon: 'help-circle',
          color: '#F59E0B',
        },
        {
          id: 4,
          type: 'achievement',
          user: 'Sarah Williams',
          module: 'Government Structure',
          timestamp: '2 hours ago',
          icon: 'trophy',
          color: '#8B5CF6',
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }: any) => (
    <View style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trend.up ? '#10B98120' : '#EF444420' }]}>
            <Ionicons 
              name={trend.up ? 'trending-up' : 'trending-down'} 
              size={12} 
              color={trend.up ? '#10B981' : '#EF4444'} 
            />
            <Text style={[styles.trendText, { color: trend.up ? '#10B981' : '#EF4444' }]}>
              {trend.value}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const QuickActionCard = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <LinearGradient
        colors={[color, color + 'CC']}
        style={styles.quickActionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon} size={32} color="#FFF" />
        <Text style={styles.quickActionTitle}>{title}</Text>
        <View style={styles.quickActionArrow}>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Learning Platform Management</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="#1F2937" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Overview Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Modules"
              value={stats.totalModules}
              subtitle={`${stats.publishedModules} published`}
              icon="folder"
              color="#3B82F6"
              trend={{ up: true, value: 12 }}
            />
            <StatCard
              title="Total Lessons"
              value={stats.totalLessons}
              subtitle="Active content"
              icon="book"
              color="#10B981"
              trend={{ up: true, value: 8 }}
            />
            <StatCard
              title="Total Quizzes"
              value={stats.totalQuizzes}
              subtitle="Assessment items"
              icon="help-circle"
              color="#F59E0B"
            />
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              subtitle={`${stats.activeUsers} active`}
              icon="people"
              color="#8B5CF6"
              trend={{ up: true, value: 15 }}
            />
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.metricsCard}>
            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Average Progress</Text>
                <Text style={styles.metricValue}>{stats.averageProgress}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${stats.averageProgress}%` }]} />
              </View>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Completion Rate</Text>
                <Text style={styles.metricValue}>{stats.completionRate}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${stats.completionRate}%`, backgroundColor: '#10B981' }
                  ]} 
                />
              </View>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Total XP Awarded</Text>
                <Text style={styles.metricValue}>{stats.totalXPAwarded.toLocaleString()}</Text>
              </View>
              <View style={styles.xpBadge}>
                <MaterialIcons name="stars" size={20} color="#F59E0B" />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Modules"
              icon="folder-outline"
              color="#3B82F6"
              onPress={() => navigation.navigate('ModulesManagement')}
            />
            <QuickActionCard
              title="Lessons"
              icon="book-outline"
              color="#10B981"
              onPress={() => navigation.navigate('LessonsManagement')}
            />
            <QuickActionCard
              title="Quizzes"
              icon="help-circle-outline"
              color="#F59E0B"
              onPress={() => navigation.navigate('QuizzesManagement')}
            />
            <QuickActionCard
              title="Analytics"
              icon="stats-chart"
              color="#8B5CF6"
              onPress={() => {
                // Navigate to analytics screen when implemented
                console.log('Analytics pressed');
              }}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                  <Ionicons name={activity.icon as any} size={20} color={activity.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    <Text style={styles.activityUser}>{activity.user}</Text>
                    {activity.type === 'enrollment' && ' enrolled in '}
                    {activity.type === 'completion' && ' completed '}
                    {activity.type === 'quiz' && ' took quiz in '}
                    {activity.type === 'achievement' && ' earned achievement in '}
                    {activity.module && <Text style={styles.activityModule}>{activity.module}</Text>}
                  </Text>
                  <Text style={styles.activityTime}>{activity.timestamp}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    paddingHorizontal: 20,
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
    color: '#1F2937',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 2,
  },
  trendText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  metricsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressBarContainer: {
    width: 120,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  xpBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 52) / 2,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  quickActionArrow: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityList: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  activityUser: {
    fontWeight: '600',
    color: '#1F2937',
  },
  activityModule: {
    fontWeight: '600',
    color: '#3B82F6',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});