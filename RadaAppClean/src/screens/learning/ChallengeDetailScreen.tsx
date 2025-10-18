import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';

interface ChallengeDetailScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'ChallengeDetail'>;
  route: RouteProp<LearningStackParamList, 'ChallengeDetail'>;
}

interface ChallengeTask {
  id: number;
  task_id: number;
  title: string;
  description: string;
  completed: boolean;
  xpReward: number;
  icon: string;
  task_type: string;
}

interface ChallengeData {
  id: number;
  title: string;
  description: string;
  xpReward: number;
  timeLeft: string;
  category: string;
  difficulty: string;
  start_date: string | null;
  end_date: string | null;
}

export const ChallengeDetailScreen: React.FC<ChallengeDetailScreenProps> = ({ navigation, route }) => {
  const { challenge: initialChallenge } = route.params;
  const [challenge, setChallenge] = useState<ChallengeData>(initialChallenge);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [challengeTasks, setChallengeTasks] = useState<ChallengeTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallengeDetails();
  }, []);

  const calculateTimeLeft = (endDate: string | null) => {
    if (!endDate) return 'No deadline';

    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  };

  const calculateDuration = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return 'No duration set';

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return `${days} day${days > 1 ? 's' : ''}`;
  };

  const loadChallengeDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/admin/learning/challenges/${initialChallenge.id}`);
      const data = await response.json();

      if (data.success && data.challenge) {
        // Update challenge data with fresh data from API
        setChallenge({
          id: data.challenge.id,
          title: data.challenge.title,
          description: data.challenge.description,
          xpReward: data.challenge.xp_reward || 0,
          timeLeft: calculateTimeLeft(data.challenge.end_date),
          category: data.challenge.category || 'General',
          difficulty: data.challenge.difficulty || 'medium',
          start_date: data.challenge.start_date,
          end_date: data.challenge.end_date,
        });

        // Update tasks
        if (data.challenge.tasks) {
          const transformedTasks = data.challenge.tasks.map((task: any) => ({
            id: task.id,
            task_id: task.task_id,
            title: task.task_title || 'Untitled',
            description: task.description || 'Complete this module',
            completed: false, // TODO: Get from user progress
            xpReward: 100, // TODO: Get from module
            icon: 'folder',
            task_type: task.task_type,
          }));
          setChallengeTasks(transformedTasks);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading challenge details:', error);
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    setIsEnrolled(true);
    Alert.alert(
      'Challenge Joined!',
      `You've successfully joined the ${challenge.title}. Complete all tasks before the deadline to earn rewards!`,
      [{ text: 'Start Now', onPress: () => {} }]
    );
  };

  const handleTaskPress = async (task: ChallengeTask) => {
    if (!isEnrolled) {
      Alert.alert('Join Challenge', 'Please join the challenge first to start tasks.');
      return;
    }

    // For module tasks, fetch the module details and navigate to ModuleDetail screen
    if (task.task_type === 'module') {
      try {
        const response = await fetch(`http://localhost:3000/api/admin/learning/modules/${task.task_id}`);
        const data = await response.json();

        if (data.success && data.module) {
          const module = data.module;
          navigation.navigate('ModuleDetail', {
            module: {
              id: module.id,
              title: module.title,
              description: module.description || '',
              icon: module.icon || 'school',
              progress: 0, // TODO: Get from user progress
              totalLessons: module.total_lessons || 0,
              completedLessons: 0, // TODO: Get from user progress
              xpReward: module.xp_reward || 0,
              difficulty: module.difficulty || 'beginner',
              category: module.category || 'General',
            },
          });
        } else {
          Alert.alert('Error', 'Could not load module details');
        }
      } catch (error) {
        console.error('Error loading module:', error);
        Alert.alert('Error', 'Failed to load module');
      }
    }
  };

  const renderTask = ({ item, index }: { item: ChallengeTask; index: number }) => (
    <TouchableOpacity
      style={[styles.taskCard, item.completed && styles.completedTask]}
      onPress={() => handleTaskPress(item)}
    >
      <View style={styles.taskNumber}>
        <Text style={styles.taskNumberText}>{index + 1}</Text>
      </View>

      <View style={[styles.taskIcon, item.completed && styles.completedTaskIcon]}>
        <MaterialIcons
          name={item.completed ? 'check-circle' : (item.icon as any)}
          size={24}
          color={item.completed ? '#10B981' : '#3B82F6'}
        />
      </View>

      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, item.completed && styles.completedText]}>
          {item.title}
        </Text>
        <Text style={[styles.taskDescription, item.completed && styles.completedText]}>
          {item.description}
        </Text>
        <View style={styles.taskFooter}>
          <View style={styles.xpBadge}>
            <MaterialIcons name="stars" size={14} color="#F59E0B" />
            <Text style={styles.xpText}>+{item.xpReward} XP</Text>
          </View>
          {item.completed && (
            <Text style={styles.completedLabel}>Completed</Text>
          )}
        </View>
      </View>

      <MaterialIcons
        name="chevron-right"
        size={24}
        color={item.completed ? '#10B981' : '#666'}
      />
    </TouchableOpacity>
  );

  const completedTasks = challengeTasks.filter(t => t.completed).length;
  const totalTasks = challengeTasks.length;
  const progress = (completedTasks / totalTasks) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F59E0B" />

      {/* Header */}
      <LinearGradient
        colors={['#F59E0B', '#D97706']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.challengeIconContainer}>
            <MaterialIcons name="emoji-events" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>

          <View style={styles.challengeStats}>
            <View style={styles.challengeStat}>
              <MaterialIcons name="timer" size={20} color="#FFFFFF" />
              <Text style={styles.challengeStatText}>{challenge.timeLeft} left</Text>
            </View>
          </View>

          <View style={styles.rewardBanner}>
            <MaterialIcons name="stars" size={24} color="#F59E0B" />
            <Text style={styles.rewardText}>Win {challenge.xpReward} XP!</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={styles.loadingText}>Loading challenge details...</Text>
          </View>
        )}

        {/* Progress Section */}
        {!loading && isEnrolled && (
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  {completedTasks} of {totalTasks} tasks completed
                </Text>
                <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          </View>
        )}

        {/* Enroll Button */}
        {!loading && !isEnrolled && (
          <View style={styles.enrollSection}>
            <TouchableOpacity style={styles.enrollButton} onPress={handleEnroll}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.enrollGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons name="add-circle" size={24} color="#FFFFFF" />
                <Text style={styles.enrollButtonText}>Join Challenge</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Tasks Section */}
        {!loading && (
          <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>Challenge Tasks</Text>
            {challengeTasks.length === 0 ? (
              <Text style={styles.emptyText}>No tasks added to this challenge yet.</Text>
            ) : (
              <FlatList
                data={challengeTasks}
                renderItem={renderTask}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {/* Challenge Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Challenge Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <MaterialIcons name="calendar-today" size={20} color="#3B82F6" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{calculateDuration(challenge.start_date, challenge.end_date)}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <MaterialIcons name="assignment" size={20} color="#8B5CF6" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Total Tasks</Text>
                <Text style={styles.infoValue}>{totalTasks} tasks</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <MaterialIcons name="emoji-events" size={20} color="#F59E0B" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Reward</Text>
                <Text style={styles.infoValue}>{challenge.xpReward} XP</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <MaterialIcons name="category" size={20} color="#10B981" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={styles.infoValue}>{challenge.category}</Text>
              </View>
            </View>
          </View>
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
    paddingTop: 16,
    paddingBottom: 32,
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
    marginLeft: 24,
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  challengeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  challengeStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  challengeStatText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D97706',
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
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  progressSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  enrollSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  enrollButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enrollGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  enrollButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tasksSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  completedTask: {
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
  },
  taskNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  completedTaskIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  taskDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  completedText: {
    color: '#10B981',
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  completedLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 16,
  },
});
