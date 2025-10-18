import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminAPIService from '../../services/AdminAPIService';

interface DashboardStats {
  totalModules: number;
  publishedModules: number;
  totalLessons: number;
  totalQuizzes: number;
  totalUsers: number;
  activeUsers: number;
  totalXPAwarded: number;
  avgCompletionRate: number;
}

export default function LearningAdminDashboard({ navigation }: any) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // TODO: Create dedicated stats endpoint
      const [modulesRes, lessonsRes, quizzesRes] = await Promise.all([
        AdminAPIService.getLearningModules(),
        AdminAPIService.get('/admin/learning/lessons'),
        AdminAPIService.get('/admin/learning/quizzes'),
      ]);

      const modules = modulesRes.modules || [];
      const lessons = lessonsRes.lessons || [];
      const quizzes = quizzesRes.quizzes || [];

      setStats({
        totalModules: modules.length,
        publishedModules: modules.filter((m: any) => m.status === 'published').length,
        totalLessons: lessons.length,
        totalQuizzes: quizzes.length,
        totalUsers: 0, // TODO: Get from API
        activeUsers: 0,
        totalXPAwarded: 0,
        avgCompletionRate: 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  const adminTools = [
    {
      id: 'modules',
      title: 'Manage Modules',
      icon: 'book',
      color: '#3B82F6',
      screen: 'ModulesManagement',
      description: 'Create and edit learning modules',
    },
    {
      id: 'lessons',
      title: 'Manage Lessons',
      icon: 'document-text',
      color: '#10B981',
      screen: 'LessonsManagement',
      description: 'Add lessons to modules',
    },
    {
      id: 'quizzes',
      title: 'Manage Quizzes',
      icon: 'help-circle',
      color: '#F59E0B',
      screen: 'QuizzesManagement',
      description: 'Create quizzes and questions',
    },
    {
      id: 'paths',
      title: 'Learning Paths',
      icon: 'git-branch',
      color: '#8B5CF6',
      screen: 'PathsManagement',
      description: 'Curate learning journeys',
    },
    {
      id: 'achievements',
      title: 'Achievements',
      icon: 'trophy',
      color: '#EF4444',
      screen: 'AchievementsManagement',
      description: 'Manage gamification',
    },
    {
      id: 'daily-challenges',
      title: 'Daily Challenges',
      icon: 'calendar',
      color: '#EC4899',
      screen: 'DailyChallengesManagement',
      description: 'Schedule daily challenges',
    },
    {
      id: 'challenges',
      title: 'Challenges',
      icon: 'flag',
      color: '#06B6D4',
      screen: 'ChallengesManagement',
      description: 'Multi-task learning challenges',
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Management</Text>
        <Text style={styles.headerSubtitle}>Content & Analytics Dashboard</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#3B82F6' }]}>
            <Ionicons name="book" size={24} color="#FFF" />
            <Text style={styles.statValue}>{stats?.totalModules || 0}</Text>
            <Text style={styles.statLabel}>Modules</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
            <Ionicons name="document-text" size={24} color="#FFF" />
            <Text style={styles.statValue}>{stats?.totalLessons || 0}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#F59E0B' }]}>
            <Ionicons name="help-circle" size={24} color="#FFF" />
            <Text style={styles.statValue}>{stats?.totalQuizzes || 0}</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#8B5CF6' }]}>
            <Ionicons name="checkmark-done" size={24} color="#FFF" />
            <Text style={styles.statValue}>{stats?.publishedModules || 0}</Text>
            <Text style={styles.statLabel}>Published</Text>
          </View>
        </View>
      </View>

      {/* Admin Tools */}
      <View style={styles.toolsSection}>
        <Text style={styles.sectionTitle}>Management Tools</Text>
        <View style={styles.toolsGrid}>
          {adminTools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() => navigation.navigate(tool.screen)}
            >
              <View style={[styles.toolIcon, { backgroundColor: tool.color }]}>
                <Ionicons name={tool.icon as any} size={28} color="#FFF" />
              </View>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolDescription}>{tool.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 24,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0F2FE',
  },
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 4,
  },
  toolsSection: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  toolDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});
