import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';
import { LoadingSpinner, ErrorDisplay, LoadingCard, ErrorCard } from '../../components/ui';

interface Module {
  id: number;
  title: string;
  description: string;
  icon: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  xpReward: number;
  difficulty: string;
  category: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  xpReward: number;
  participants: number;
  timeLeft: string;
  category: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  rarity: string;
}

interface LearningHomeProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'LearningHome'>;
}

export const LearningHome: React.FC<LearningHomeProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState({
    totalXP: 1250,
    level: 8,
    streak: 12,
    completedModules: 15,
    totalModules: 24,
  });

  const [featuredModules, setFeaturedModules] = useState<Module[]>([
    {
      id: 1,
      title: 'Constitutional Basics',
      description: 'Learn fundamental rights and government structure',
      icon: 'gavel',
      progress: 75,
      totalLessons: 8,
      completedLessons: 6,
      xpReward: 200,
      difficulty: 'Beginner',
      category: 'Government',
    },
    {
      id: 2,
      title: 'Electoral Process',
      description: 'Understanding elections and voting systems',
      icon: 'how-to-vote',
      progress: 30,
      totalLessons: 12,
      completedLessons: 4,
      xpReward: 300,
      difficulty: 'Intermediate',
      category: 'Elections',
    },
    {
      id: 3,
      title: 'Civil Rights History',
      description: 'Key movements and landmark cases',
      icon: 'people',
      progress: 0,
      totalLessons: 10,
      completedLessons: 0,
      xpReward: 250,
      difficulty: 'Advanced',
      category: 'Rights',
    },
  ]);

  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([
    {
      id: 1,
      title: 'Democracy Week Challenge',
      description: 'Complete 5 lessons about democratic processes',
      xpReward: 500,
      participants: 1247,
      timeLeft: '3 days',
      category: 'Democracy',
    },
    {
      id: 2,
      title: 'Constitution Quiz Master',
      description: 'Score 90%+ on 3 constitutional quizzes',
      xpReward: 300,
      participants: 892,
      timeLeft: '1 week',
      category: 'Constitution',
    },
  ]);

  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([
    {
      id: 1,
      title: 'Knowledge Seeker',
      description: 'Completed first 10 lessons',
      icon: 'school',
      earned: true,
      rarity: 'Common',
    },
    {
      id: 2,
      title: 'Quiz Champion',
      description: 'Score perfect on 5 quizzes',
      icon: 'stars',
      earned: false,
      rarity: 'Rare',
    },
  ]);

  useEffect(() => {
    // Simulate initial data loading
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load learning data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      setRefreshing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderModuleCard = ({ item }: { item: Module }) => (
    <TouchableOpacity
      style={styles.moduleCard}
      onPress={() => navigation.navigate('ModuleDetail', { module: item })}
    >
      <View style={styles.moduleHeader}>
        <View style={[styles.moduleIcon, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
          <MaterialIcons name={item.icon as any} size={24} color={getDifficultyColor(item.difficulty)} />
        </View>
        <View style={styles.moduleInfo}>
          <Text style={styles.moduleTitle}>{item.title}</Text>
          <Text style={styles.moduleDescription}>{item.description}</Text>
          <Text style={styles.moduleStats}>
            {item.completedLessons}/{item.totalLessons} lessons • {item.xpReward} XP
          </Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{item.progress}%</Text>
      </View>
      <View style={styles.moduleFooter}>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
          <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
            {item.difficulty}
          </Text>
        </View>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderChallengeCard = ({ item }: { item: Challenge }) => (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <MaterialIcons name="emoji-events" size={24} color="#F59E0B" />
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{item.title}</Text>
          <Text style={styles.challengeDescription}>{item.description}</Text>
        </View>
        <Text style={styles.challengeTimeLeft}>{item.timeLeft}</Text>
      </View>
      <View style={styles.challengeFooter}>
        <Text style={styles.challengeReward}>🏆 {item.xpReward} XP</Text>
        <Text style={styles.challengeParticipants}>👥 {item.participants} joined</Text>
      </View>
    </View>
  );

  const renderAchievementCard = ({ item }: { item: Achievement }) => (
    <View style={[styles.achievementCard, { opacity: item.earned ? 1 : 0.6 }]}>
      <View style={[styles.achievementIcon, { backgroundColor: item.earned ? '#10B981' : '#9CA3AF' }]}>
        <MaterialIcons name={item.icon as any} size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.achievementTitle}>{item.title}</Text>
      <Text style={styles.achievementDescription}>{item.description}</Text>
      <Text style={[styles.achievementRarity, {
        color: item.rarity === 'Rare' ? '#8B5CF6' : '#6B7280'
      }]}>
        {item.rarity}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Learning Hub</Text>
            <Text style={styles.headerSubtitle}>Master civic engagement & democracy</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <MaterialIcons name="notifications" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Progress Overview Card */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.progressCard}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.progressGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.progressContent}>
                <View style={styles.progressHeader}>
                  <View style={styles.progressStats}>
                    <Text style={styles.levelText}>Level {userProgress.level}</Text>
                    <Text style={styles.xpText}>{userProgress.totalXP} XP</Text>
                  </View>
                  <View style={styles.streakBadge}>
                    <MaterialIcons name="local-fire-department" size={20} color="#FF6B35" />
                    <Text style={styles.streakText}>{userProgress.streak} day streak</Text>
                  </View>
                </View>

                <Text style={styles.progressTitle}>Your Learning Journey</Text>
                <Text style={styles.progressSubtitle}>
                  {userProgress.completedModules} of {userProgress.totalModules} modules completed
                </Text>

                <View style={styles.progressBarContainer}>
                  <View style={styles.mainProgressBar}>
                    <View style={[styles.mainProgressFill, {
                      width: `${(userProgress.completedModules / userProgress.totalModules) * 100}%`
                    }]} />
                  </View>
                  <Text style={styles.progressPercentage}>
                    {Math.round((userProgress.completedModules / userProgress.totalModules) * 100)}%
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Quiz', { quizId: 1, title: 'Quick Quiz' })}
            >
              <MaterialIcons name="quiz" size={32} color="#3B82F6" />
              <Text style={styles.actionTitle}>Take Quiz</Text>
              <Text style={styles.actionSubtitle}>Test knowledge</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ModuleDetail', { module: featuredModules[0] })}
            >
              <MaterialIcons name="school" size={32} color="#10B981" />
              <Text style={styles.actionTitle}>Continue</Text>
              <Text style={styles.actionSubtitle}>Last lesson</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('StudyGroups')}
            >
              <MaterialIcons name="people" size={32} color="#8B5CF6" />
              <Text style={styles.actionTitle}>Study Groups</Text>
              <Text style={styles.actionSubtitle}>Join others</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <MaterialIcons name="emoji-events" size={32} color="#F59E0B" />
              <Text style={styles.actionTitle}>Challenges</Text>
              <Text style={styles.actionSubtitle}>Earn rewards</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Modules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <FlatList
            data={featuredModules}
            renderItem={renderModuleCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Active Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Challenges</Text>
          <FlatList
            data={activeChallenges}
            renderItem={renderChallengeCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Recent Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <FlatList
            data={recentAchievements}
            renderItem={renderAchievementCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
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
  progressCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressGradient: {
    padding: 24,
  },
  progressContent: {
    gap: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStats: {
    alignItems: 'flex-start',
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  xpText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  mainProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moduleCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  moduleHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  moduleStats: {
    fontSize: 12,
    color: '#888',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  moduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  challengeCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#B45309',
  },
  challengeTimeLeft: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  challengeReward: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  challengeParticipants: {
    fontSize: 12,
    color: '#B45309',
  },
  achievementCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    width: 120,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementRarity: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});