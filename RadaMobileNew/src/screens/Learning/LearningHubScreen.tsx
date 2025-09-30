import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import ModuleCard from '../../components/Learning/ModuleCard';
import QuizCard from '../../components/Learning/QuizCard';
import useLearningData from '../../hooks/useLearningData';

const LearningHubScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'modules' | 'quizzes' | 'progress'>('modules');
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock user ID - replace with actual user ID from context
  const userId = 'user-123';
  
  const {
    modules,
    quizzes,
    userProgress,
    loading,
    error,
    refresh
  } = useLearningData(userId);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleModulePress = (moduleId: string) => {
    // Navigate to module detail screen
    Alert.alert('Module', `Opening module: ${moduleId}`);
  };

  const handleQuizPress = (quizId: string) => {
    // Navigate to quiz screen
    Alert.alert('Quiz', `Starting quiz: ${quizId}`);
  };

  const renderTabButton = (tab: 'modules' | 'quizzes' | 'progress', label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={activeTab === tab ? '#FFFFFF' : '#6B7280'} 
      />
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderProgressStats = () => (
    <View style={styles.progressContainer}>
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.progressCard}
      >
        <Text style={styles.progressTitle}>Your Learning Progress</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userProgress?.modulesCompleted || 0}
            </Text>
            <Text style={styles.statLabel}>Modules Completed</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userProgress?.quizzesCompleted || 0}
            </Text>
            <Text style={styles.statLabel}>Quizzes Completed</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userProgress?.totalScore || 0}%
            </Text>
            <Text style={styles.statLabel}>Average Score</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userProgress?.badges?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Badges Earned</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading learning content...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (activeTab) {
      case 'modules':
        return (
          <View style={styles.contentContainer}>
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onPress={() => handleModulePress(module.id)}
              />
            ))}
            {modules.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={48} color="#6B7280" />
                <Text style={styles.emptyText}>No modules available</Text>
              </View>
            )}
          </View>
        );

      case 'quizzes':
        return (
          <View style={styles.contentContainer}>
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onPress={() => handleQuizPress(quiz.id)}
              />
            ))}
            {quizzes.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="help-circle-outline" size={48} color="#6B7280" />
                <Text style={styles.emptyText}>No quizzes available</Text>
              </View>
            )}
          </View>
        );

      case 'progress':
        return renderProgressStats();

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Learning Hub</Text>
        <Text style={styles.headerSubtitle}>Master civic engagement</Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        {renderTabButton('modules', 'Modules', 'book-outline')}
        {renderTabButton('quizzes', 'Quizzes', 'help-circle-outline')}
        {renderTabButton('progress', 'Progress', 'stats-chart-outline')}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  progressContainer: {
    padding: 16,
  },
  progressCard: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#E5E7EB',
    textAlign: 'center',
  },
});

export default LearningHubScreen;


