import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const ModuleDetailScreen = ({ navigation, route }) => {
  const { moduleId, module } = route.params;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // API Data States
  const [moduleData, setModuleData] = useState(module || null);
  const [lessons, setLessons] = useState([]);
  const [userProgress, setUserProgress] = useState(null);

  // Load data from API
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load module details and lessons in parallel
      const [moduleResponse, lessonsResponse, progressResponse] = await Promise.all([
        apiService.getModule(moduleId),
        apiService.getLessons(moduleId),
        user ? apiService.getUserProgress(user.id) : Promise.resolve(null)
      ]);

      // Extract data from responses
      const moduleDetails = moduleResponse.data || moduleResponse;
      const lessonsData = lessonsResponse.data || lessonsResponse;
      const progressData = progressResponse?.data || progressResponse;

      setModuleData(moduleDetails);
      setLessons(lessonsData);

      // Find user progress for this module
      if (progressData && progressData.modules) {
        const moduleProgress = progressData.modules.find(p => p.module_id === moduleId);
        setUserProgress(moduleProgress);
      }

    } catch (err) {
      console.error('Error loading Module Detail data:', err);
      setError('Failed to load module details. Please check your connection.');
      
      // Fallback to passed module data
      if (module) {
        setModuleData(module);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [moduleId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Module...</Text>
      </View>
    );
  }

  if (!moduleData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Module not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Module Details</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Module Header */}
        <View style={styles.moduleHeader}>
          <LinearGradient
            colors={['#FF6B6B', '#4ECDC4']}
            style={styles.moduleGradient}
          >
            <View style={styles.moduleHeaderContent}>
              <Text style={styles.moduleIcon}>{moduleData.icon || '📚'}</Text>
              <View style={styles.moduleHeaderInfo}>
                <Text style={styles.moduleTitle}>{moduleData.title}</Text>
                <Text style={styles.moduleDescription}>{moduleData.description}</Text>
                <View style={styles.moduleMeta}>
                  <Text style={styles.moduleMetaText}>
                    ⭐ {moduleData.xp_reward} XP • {moduleData.estimated_duration} min • {moduleData.difficulty}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Module Content */}
        <View style={styles.moduleContent}>
          <Text style={styles.contentTitle}>About This Module</Text>
          <Text style={styles.contentText}>{moduleData.content}</Text>
        </View>

        {/* Progress Section */}
        {userProgress && (
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${userProgress.progress_percentage || 0}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {userProgress.progress_percentage || 0}% Complete
            </Text>
          </View>
        )}

        {/* Lessons Section */}
        <View style={styles.lessonsSection}>
          <Text style={styles.lessonsTitle}>Lessons ({lessons.length})</Text>
          
          {lessons.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No lessons available yet</Text>
            </View>
          ) : (
            lessons.map((lesson, index) => (
              <TouchableOpacity key={lesson.id} style={styles.lessonCard}>
                <View style={styles.lessonHeader}>
                  <Text style={styles.lessonNumber}>Lesson {index + 1}</Text>
                  <Text style={styles.lessonXp}>+{lesson.xp_reward} XP</Text>
                </View>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonContent}>{lesson.content}</Text>
                <TouchableOpacity style={styles.lessonButton}>
                  <Text style={styles.lessonButtonText}>Start Lesson</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Start Module Button */}
        <TouchableOpacity style={styles.startModuleButton}>
          <LinearGradient
            colors={['#FF6B6B', '#4ECDC4']}
            style={styles.startModuleGradient}
          >
            <Text style={styles.startModuleText}>Start Learning Module</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF6B6B',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  moduleHeader: {
    marginBottom: 20,
  },
  moduleGradient: {
    borderRadius: 16,
    padding: 20,
  },
  moduleHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIcon: {
    fontSize: 48,
    marginRight: 15,
  },
  moduleHeaderInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
  },
  moduleDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
    lineHeight: 20,
  },
  moduleMeta: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  moduleMetaText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  moduleContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  progressSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  lessonsSection: {
    marginBottom: 20,
  },
  lessonsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 14,
  },
  lessonCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonNumber: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  lessonXp: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  lessonContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  lessonButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  lessonButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  startModuleButton: {
    marginBottom: 20,
  },
  startModuleGradient: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startModuleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ModuleDetailScreen;
