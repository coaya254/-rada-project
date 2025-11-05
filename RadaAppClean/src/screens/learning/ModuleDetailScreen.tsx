import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';
import LearningAPIService from '../../services/LearningAPIService';

interface ModuleDetailScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'ModuleDetail'>;
  route: RouteProp<LearningStackParamList, 'ModuleDetail'>;
}

interface Lesson {
  id: number;
  module_id: number;
  title: string;
  description: string;
  content: string;
  video_url?: string;
  lesson_type: 'text' | 'video' | 'interactive';
  duration_minutes: number;
  xp_reward: number;
  display_order: number;
  is_published: boolean;
  completed?: boolean;
  locked?: boolean;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  quiz_type: 'module' | 'lesson' | 'trivia';
  time_limit: number;
  passing_score: number;
  xp_reward: number;
  question_count: number;
  completed_at?: string;
  score?: number;
}

export const ModuleDetailScreen: React.FC<ModuleDetailScreenProps> = ({ navigation, route }) => {
  const { module: initialModule } = route.params;

  const [module, setModule] = useState(initialModule);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [moduleQuiz, setModuleQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModuleLessons();
  }, [initialModule.id]);

  // Add a focus listener to refresh when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchModuleLessons();
    });
    return unsubscribe;
  }, [navigation, initialModule.id]);

  // Handle route params for forced refresh
  useEffect(() => {
    if (route.params?.refresh) {
      fetchModuleLessons();
      // Clear the refresh param
      navigation.setParams({ refresh: undefined } as any);
    }
  }, [route.params?.refresh]);

  const fetchModuleLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await LearningAPIService.getModuleById(initialModule.id);
      console.log('Module API response:', response);

      if (response.success && response.module) {
        console.log('Lessons with quizzes:', response.module.lessons);

        // Update module with fresh progress data
        const updatedModule = {
          ...initialModule,
          progress: response.module.progress_percentage || 0,
          completedLessons: response.module.lessons.filter((l: any) => l.completed_at).length,
          totalLessons: response.module.lessons.length,
        };
        setModule(updatedModule);

        setLessons(response.module.lessons || []);
        setModuleQuiz(response.module.moduleQuiz || null);
      } else {
        throw new Error('Failed to load module lessons');
      }
    } catch (err) {
      console.error('Error fetching module lessons:', err);
      setError(err instanceof Error ? err.message : 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return 'play-circle-outline';
      case 'text': return 'menu-book';
      case 'interactive': return 'touch-app';
      default: return 'school';
    }
  };

  const renderLesson = ({ item, index }: { item: Lesson, index: number }) => {
    // Determine if this is the last lesson
    const isLastLesson = index === lessons.length - 1;
    // Get next lesson ID
    const nextLessonId = index < lessons.length - 1 ? lessons[index + 1].id : null;

    return (
      <TouchableOpacity
        style={[styles.lessonCard, item.locked && styles.lessonCardLocked]}
        disabled={item.locked}
        onPress={() => {
          console.log('=== Navigating to Lesson ===');
          console.log('Lesson:', item.id, '-', item.title);
          console.log('Is Last Lesson:', isLastLesson);
          console.log('Next Lesson ID:', nextLessonId);
          navigation.navigate('Lesson', {
            lesson: {
              id: item.id,
              title: item.title,
              moduleId: module.id,
              content: item.content || item.description,
              description: item.description,
              duration: item.duration_minutes,
              xp: item.xp_reward,
              videoUrl: item.video_url,
              isLastLesson: isLastLesson,
              nextLessonId: nextLessonId
            }
          });
        }}
      >
        <View style={styles.lessonContent}>
          <View style={styles.lessonHeader}>
            <View style={[styles.lessonIcon, item.completed && styles.lessonIconCompleted]}>
              <MaterialIcons
                name={item.completed ? 'check-circle' : getTypeIcon(item.lesson_type) as any}
                size={24}
                color={item.completed ? '#FFFFFF' : (item.locked ? '#9CA3AF' : '#3B82F6')}
              />
            </View>
            <View style={styles.lessonInfo}>
              <Text style={[styles.lessonTitle, item.locked && styles.lessonTitleLocked]}>
                {item.title}
              </Text>
              <Text style={[styles.lessonDescription, item.locked && styles.lessonDescriptionLocked]}>
                {item.description}
              </Text>
              <View style={styles.lessonMeta}>
                <Text style={[styles.lessonDuration, item.locked && styles.lessonDurationLocked]}>
                  ⏱️ {item.duration_minutes} min
                </Text>
                <Text style={[styles.lessonXP, item.locked && styles.lessonXPLocked]}>
                  🏆 {item.xp_reward} XP
                </Text>
              </View>
            </View>
          </View>
          {!item.locked && (
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          )}
          {item.locked && (
            <MaterialIcons name="lock" size={24} color="#9CA3AF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 16, color: '#666', fontSize: 16 }}>Loading lessons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <MaterialIcons name="error-outline" size={64} color="#EF4444" />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: 'bold', color: '#333' }}>Error Loading Lessons</Text>
          <Text style={{ marginTop: 8, color: '#666', textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity
            style={{ marginTop: 24, backgroundColor: '#3B82F6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
            onPress={fetchModuleLessons}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{module.title}</Text>
          <Text style={styles.headerSubtitle}>{module.category} • {module.difficulty}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Module Overview Card */}
        <View style={styles.section}>
          <View style={styles.moduleCard}>
            <LinearGradient
              colors={[getDifficultyColor(module.difficulty), getDifficultyColor(module.difficulty) + 'CC']}
              style={styles.moduleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.moduleContent}>
                <View style={styles.moduleHeader}>
                  <View style={styles.moduleIconContainer}>
                    <MaterialIcons name={module.icon as any} size={40} color="#FFFFFF" />
                  </View>
                  <View style={styles.moduleStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{module.completedLessons}</Text>
                      <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{module.totalLessons}</Text>
                      <Text style={styles.statLabel}>Total Lessons</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{module.xpReward}</Text>
                      <Text style={styles.statLabel}>Total XP</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.moduleDescription}>{module.description}</Text>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>Progress</Text>
                    <Text style={styles.progressPercentage}>{module.progress}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${module.progress}%` }]} />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Lessons List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lessons ({lessons.length})</Text>
          {lessons.map((lesson, index) => (
            <React.Fragment key={lesson.id}>
              {renderLesson({ item: lesson, index })}
            </React.Fragment>
          ))}

          {/* Module Quiz */}
          {moduleQuiz && (
            <TouchableOpacity
              style={[styles.lessonCard, styles.quizCard]}
              onPress={() => {
                navigation.navigate('Quiz', { quizId: moduleQuiz.id, moduleId: module.id, title: moduleQuiz.title });
              }}
            >
              <View style={styles.lessonContent}>
                <View style={styles.lessonHeader}>
                  <View style={[styles.lessonIcon, styles.quizIcon]}>
                    <MaterialIcons name="quiz" size={24} color="#8B5CF6" />
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{moduleQuiz.title}</Text>
                    <Text style={styles.lessonDescription}>{moduleQuiz.description || 'Complete this quiz to test your knowledge'}</Text>
                    <View style={styles.lessonMeta}>
                      <Text style={styles.lessonDuration}>
                        🎯 {moduleQuiz.question_count} questions
                      </Text>
                      <Text style={styles.lessonXP}>
                        🏆 {moduleQuiz.xp_reward} XP
                      </Text>
                      {moduleQuiz.completed_at && (
                        <Text style={styles.quizCompleted}>
                          ✓ Score: {moduleQuiz.score}%
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#8B5CF6" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Continue Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.continueButton}>
            <LinearGradient
              colors={['#3B82F6', '#1E40AF']}
              style={styles.continueGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
              <Text style={styles.continueButtonText}>Continue Learning</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  moduleCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  moduleGradient: {
    padding: 24,
  },
  moduleContent: {
    gap: 20,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  moduleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleStats: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  moduleDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  lessonCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  lessonCardLocked: {
    opacity: 0.6,
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonIconCompleted: {
    backgroundColor: '#10B981',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lessonTitleLocked: {
    color: '#9CA3AF',
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  lessonDescriptionLocked: {
    color: '#9CA3AF',
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  lessonDuration: {
    fontSize: 12,
    color: '#888',
  },
  lessonDurationLocked: {
    color: '#9CA3AF',
  },
  lessonXP: {
    fontSize: 12,
    color: '#888',
  },
  lessonXPLocked: {
    color: '#9CA3AF',
  },
  quizCard: {
    backgroundColor: '#F9F5FF',
    borderColor: '#E9D5FF',
    borderWidth: 2,
    marginTop: 16,
  },
  quizIcon: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  quizCompleted: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
