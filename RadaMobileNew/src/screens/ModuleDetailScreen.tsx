import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAnonMode } from '../contexts/AnonModeContext';
import apiService from '../services/api';

const { width: screenWidth } = Dimensions.get('window');

interface ModuleDetailScreenProps {
  route: {
    params: {
      module: {
        id: number;
        title: string;
        description: string;
        image: string;
        estimated_duration: number;
        difficulty: string;
        xp_reward: number;
        lesson_count: number;
        category: string;
        progress: number;
      };
    };
  };
  navigation: any;
}

const ModuleDetailScreen: React.FC<ModuleDetailScreenProps> = ({ route, navigation }) => {
  const { user } = useAnonMode();
  const { module } = route.params;
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});

  // Load lessons from API
  const loadLessons = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('ModuleDetailScreen - Loading lessons for module:', module.id);
      
      const lessonsResponse = await apiService.getLessons(module.id);
      
      console.log('ModuleDetailScreen - Lessons response:', lessonsResponse);

      // Process lessons data
      let lessonsData: any[] = [];
      const response = lessonsResponse as any;
      if (Array.isArray(response)) {
        lessonsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        lessonsData = response.data;
      } else if (response?.lessons && Array.isArray(response.lessons)) {
        lessonsData = response.lessons;
      }

      // Transform to frontend format
      const transformedLessons = lessonsData.map((lesson: any, index: number) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || 'Learn about this topic',
        duration: lesson.estimated_time || 15,
        isCompleted: userProgress[lesson.id]?.completed || false,
        isLocked: index > 0 && !userProgress[lessonsData[index - 1]?.id]?.completed,
        order: lesson.order_index || index + 1,
        content: lesson.content
      }));

      console.log('ModuleDetailScreen - Processed lessons:', transformedLessons);
      setLessons(transformedLessons);

    } catch (err) {
      console.error('Error loading lessons:', err);
      setError('Failed to load lessons. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLessons();
    setRefreshing(false);
  };

  useEffect(() => {
    loadLessons();
  }, [module.id]);

  const handleStartLesson = (lesson: any) => {
    if (lesson.isLocked) {
      alert('Complete previous lessons to unlock this one');
      return;
    }
    navigation.navigate('Lesson', { lesson, module });
  };

  const getLessonIcon = (lesson: any) => {
    if (lesson.isCompleted) return '✅';
    if (lesson.isLocked) return '🔒';
    
    // Different icons based on lesson content/type
    const title = lesson.title?.toLowerCase() || '';
    if (title.includes('constitution') || title.includes('government')) return '🏛️';
    if (title.includes('rights') || title.includes('human')) return '⚖️';
    if (title.includes('election') || title.includes('vote')) return '🗳️';
    if (title.includes('county') || title.includes('local')) return '🏘️';
    if (title.includes('budget') || title.includes('tax')) return '💰';
    if (title.includes('leadership') || title.includes('youth')) return '👥';
    if (title.includes('digital') || title.includes('technology')) return '💻';
    if (title.includes('quiz') || title.includes('test')) return '📝';
    
    return '📚'; // Default book icon
  };

  const getLessonStatus = (lesson: any) => {
    if (lesson.isCompleted) return 'Completed';
    if (lesson.isLocked) return 'Locked';
    return 'Ready';
  };

  const getLessonXP = (lesson: any) => {
    // Calculate XP based on duration (similar to admin)
    const duration = lesson.duration || 15;
    return Math.floor(duration * 1.5); // 1.5 XP per minute
  };

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
        <View style={styles.headerSpacer} />
          </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Module Header */}
        <View style={styles.moduleHeader}>
          <View style={styles.moduleIconContainer}>
            <Text style={styles.moduleIcon}>{module.image}</Text>
                    </View>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleTitle}>{module.title}</Text>
            <Text style={styles.moduleDescription}>{module.description}</Text>
            <View style={styles.moduleMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>⏱️</Text>
                <Text style={styles.metaText}>{module.estimated_duration} min</Text>
                  </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📊</Text>
                <Text style={styles.metaText}>{module.difficulty}</Text>
                </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>⭐</Text>
                <Text style={styles.metaText}>+{module.xp_reward} XP</Text>
              </View>
            </View>
        </View>
        </View>

        {/* Progress Section */}
          <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {module.progress > 0 ? `${module.progress}% completed` : 'Not started'}
              </Text>
              <Text style={styles.progressPercentage}>{module.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${module.progress}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Loading Lessons...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadLessons}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lessons Section */}
        {!isLoading && !error && (
        <View style={styles.lessonsSection}>
            <Text style={styles.sectionTitle}>Lessons ({lessons.length})</Text>
            {lessons.map((lesson, index) => (
              <TouchableOpacity 
                key={lesson.id} 
                style={[
                  styles.lessonCard,
                lesson.isLocked && styles.lockedLessonCard
              ]}
              onPress={() => handleStartLesson(lesson)}
              disabled={lesson.isLocked}
              >
                <View style={styles.lessonHeader}>
                <View style={styles.lessonIconContainer}>
                  <Text style={styles.lessonIcon}>{getLessonIcon(lesson)}</Text>
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={[
                    styles.lessonTitle,
                    lesson.isLocked && styles.lockedText
                  ]}>
                    {lesson.title}
                  </Text>
                  <Text style={[
                    styles.lessonDescription,
                    lesson.isLocked && styles.lockedText
                  ]}>
                    {lesson.description}
                  </Text>
                  <View style={styles.lessonMeta}>
                    <View style={styles.lessonMetaLeft}>
                      <Text style={[
                        styles.lessonDuration,
                        lesson.isLocked && styles.lockedText
                      ]}>
                        ⏱️ {lesson.duration} min
                      </Text>
                    </View>
                    <View style={styles.lessonMetaRight}>
                      <Text style={[
                        styles.lessonXP,
                        lesson.isLocked && styles.lockedText
                      ]}>
                        +{getLessonXP(lesson)} XP
                      </Text>
                      <Text style={[
                        styles.lessonStatus,
                        lesson.isCompleted && styles.completedText,
                        lesson.isLocked && styles.lockedText
                      ]}>
                        {getLessonStatus(lesson)}
                      </Text>
                    </View>
                  </View>
                </View>
                </View>
              </TouchableOpacity>
          ))}
          </View>
        )}

        {/* Start Learning Button */}
        {!isLoading && !error && lessons.length > 0 && (
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => handleStartLesson(lessons[0])}
          >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>
              {module.progress > 0 ? 'Continue Learning' : 'Start Learning'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  backButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#1e293b',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  moduleHeader: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  moduleIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  moduleIcon: {
    fontSize: 72,
  },
  moduleInfo: {
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  moduleDescription: {
    fontSize: 17,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 20,
  },
  moduleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  progressSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  progressContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  lessonsSection: {
    marginBottom: 20,
  },
  lessonCard: {
    backgroundColor: 'white',
    borderRadius: 12, // Match admin border radius
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb', // Match admin border color
  },
  lockedLessonCard: {
    backgroundColor: '#f8f9fa',
    opacity: 0.6,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonIconContainer: {
    width: 48, // Match admin icon size
    height: 48,
    backgroundColor: '#fbbf24', // Yellow background like admin
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonIcon: {
    fontSize: 24,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lessonDuration: {
    fontSize: 12,
    color: '#666',
  },
  lessonXP: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b', // Amber color like admin
  },
  lessonStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  completedText: {
    color: '#4CAF50',
  },
  lockedText: {
    color: '#999',
  },
  startButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  startButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ModuleDetailScreen;