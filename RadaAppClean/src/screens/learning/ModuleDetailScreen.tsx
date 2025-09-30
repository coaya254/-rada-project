import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';

interface ModuleDetailScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'ModuleDetail'>;
  route: RouteProp<LearningStackParamList, 'ModuleDetail'>;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  locked: boolean;
  xpReward: number;
  type: 'video' | 'reading' | 'quiz' | 'interactive';
}

export const ModuleDetailScreen: React.FC<ModuleDetailScreenProps> = ({ navigation, route }) => {
  const { module } = route.params;

  const [lessons, setLessons] = useState<Lesson[]>([
    {
      id: 1,
      title: 'Introduction to the Constitution',
      description: 'Overview of the Constitution and its importance',
      duration: '15 min',
      completed: true,
      locked: false,
      xpReward: 25,
      type: 'video',
    },
    {
      id: 2,
      title: 'Bill of Rights Explained',
      description: 'Understanding the first 10 amendments',
      duration: '20 min',
      completed: true,
      locked: false,
      xpReward: 30,
      type: 'reading',
    },
    {
      id: 3,
      title: 'Separation of Powers',
      description: 'How government branches work together',
      duration: '18 min',
      completed: false,
      locked: false,
      xpReward: 35,
      type: 'interactive',
    },
    {
      id: 4,
      title: 'Checks and Balances Quiz',
      description: 'Test your knowledge of government structure',
      duration: '10 min',
      completed: false,
      locked: false,
      xpReward: 40,
      type: 'quiz',
    },
    {
      id: 5,
      title: 'Constitutional Amendments',
      description: 'How the Constitution can be changed',
      duration: '22 min',
      completed: false,
      locked: true,
      xpReward: 45,
      type: 'video',
    },
  ]);

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
      case 'reading': return 'menu-book';
      case 'quiz': return 'quiz';
      case 'interactive': return 'touch-app';
      default: return 'school';
    }
  };

  const renderLesson = ({ item }: { item: Lesson }) => (
    <TouchableOpacity
      style={[styles.lessonCard, item.locked && styles.lessonCardLocked]}
      disabled={item.locked}
      onPress={() => {
        if (item.type === 'quiz') {
          navigation.navigate('Quiz', { quizId: item.id, moduleId: module.id, title: item.title });
        } else {
          navigation.navigate('Lesson', {
            lesson: {
              id: item.id,
              title: item.title,
              moduleId: module.id,
              content: item.description
            }
          });
        }
      }}
    >
      <View style={styles.lessonContent}>
        <View style={styles.lessonHeader}>
          <View style={[styles.lessonIcon, item.completed && styles.lessonIconCompleted]}>
            <MaterialIcons
              name={item.completed ? 'check-circle' : getTypeIcon(item.type) as any}
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
                ⏱️ {item.duration}
              </Text>
              <Text style={[styles.lessonXP, item.locked && styles.lessonXPLocked]}>
                🏆 {item.xpReward} XP
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
          <FlatList
            data={lessons}
            renderItem={renderLesson}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
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