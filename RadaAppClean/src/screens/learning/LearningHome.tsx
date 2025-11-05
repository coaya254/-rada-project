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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';
import { LoadingSpinner, ErrorDisplay, LoadingCard, ErrorCard } from '../../components/ui';
import LearningAPIService from '../../services/LearningAPIService';

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

  const [inProgressModules, setInProgressModules] = useState<Module[]>([]);
  const [featuredModules, setFeaturedModules] = useState<Module[]>([]);
  const [completedModules, setCompletedModules] = useState<Module[]>([]);

  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);

  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadData();
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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user progress
      try {
        const progressResponse = await LearningAPIService.getUserProgress();
        if (progressResponse.success && progressResponse.progress) {
          setUserProgress({
            totalXP: progressResponse.progress.totalXP || 0,
            level: progressResponse.progress.level || 1,
            streak: progressResponse.progress.streak || 0,
            completedModules: progressResponse.progress.completedModules || 0,
            totalModules: progressResponse.progress.totalModules || 0,
          });
        }
      } catch (err) {
        console.log('Could not load user progress:', err);
        // Keep hardcoded fallback values if API fails
      }

      // Fetch modules with user progress - use user-facing API
      const modulesResponse = await LearningAPIService.getModules();

      if (modulesResponse.data || modulesResponse.modules) {
        // API returns data in either "data" or "modules" field
        const modules = modulesResponse.data || modulesResponse.modules;

        // Get in-progress modules
        const inProgress = modules
          .filter((m: any) => {
            const progress = m.progress_percentage || 0;
            const isPublished = m.is_published === 1 || m.is_published === true;
            return isPublished && progress > 0 && progress < 100;
          })
          .slice(0, 4) // Show 4 most recent in-progress modules
          .map((m: any) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            icon: m.icon || 'school',
            progress: m.progress_percentage || 0,
            totalLessons: m.total_lessons || 0,
            completedLessons: Math.round((m.total_lessons || 0) * ((m.progress_percentage || 0) / 100)),
            xpReward: m.xp_reward || 0,
            difficulty: m.difficulty?.charAt(0).toUpperCase() + m.difficulty?.slice(1) || 'Beginner',
            category: m.category || 'General',
          }));

        setInProgressModules(inProgress);

        // Get featured modules
        const featured = modules
          .filter((m: any) => {
            const isPublished = m.is_published === 1 || m.is_published === true;
            const isFeatured = m.is_featured === 1 || m.is_featured === true;
            return isPublished && isFeatured;
          })
          .slice(0, 3) // Show top 3 featured modules
          .map((m: any) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            icon: m.icon || 'school',
            progress: m.progress_percentage || 0,
            totalLessons: m.total_lessons || 0,
            completedLessons: Math.round((m.total_lessons || 0) * ((m.progress_percentage || 0) / 100)),
            xpReward: m.xp_reward || 0,
            difficulty: m.difficulty?.charAt(0).toUpperCase() + m.difficulty?.slice(1) || 'Beginner',
            category: m.category || 'General',
          }));

        setFeaturedModules(featured);

        // Also fetch completed modules (100% progress)
        const completedTransformed = modules
          .filter((m: any) => {
            const isCompleted = (m.progress_percentage || 0) === 100;
            const isPublished = m.is_published === 1 || m.is_published === true;
            return isCompleted && isPublished;
          })
          .slice(0, 4) // Show 4 most recent completed modules
          .map((m: any) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            icon: m.icon || 'school',
            progress: 100,
            totalLessons: m.total_lessons || 0,
            completedLessons: m.total_lessons || 0,
            xpReward: m.xp_reward || 0,
            difficulty: m.difficulty?.charAt(0).toUpperCase() + m.difficulty?.slice(1) || 'Beginner',
            category: m.category || 'General',
          }));

        setCompletedModules(completedTransformed);
      }

      // Fetch active challenges
      try {
        const challengesResponse = await fetch('http://localhost:5000/api/admin/learning/challenges?active=true');
        const challengesData = await challengesResponse.json();

        if (challengesData.success && challengesData.challenges) {
          const transformedChallenges = challengesData.challenges
            .filter((c: any) => c.task_count > 0) // Only show challenges with tasks
            .slice(0, 3) // Show top 3 challenges
            .map((c: any) => {
              const timeLeft = calculateTimeLeft(c.end_date);
              console.log('Challenge:', c.title, 'End Date:', c.end_date, 'Time Left:', timeLeft);
              return {
                id: c.id,
                title: c.title,
                description: c.description,
                xpReward: c.xp_reward || 0,
                participants: c.enrollment_count || 0,
                timeLeft: timeLeft,
                category: c.category || 'General',
              };
            });
          setActiveChallenges(transformedChallenges);
        }
      } catch (err) {
        console.log('Could not load challenges:', err);
      }

      // Fetch achievements
      try {
        const achievementsResponse = await LearningAPIService.getAchievements();

        if (achievementsResponse.success && achievementsResponse.achievements) {
          const transformedAchievements = achievementsResponse.achievements
            .slice(0, 4) // Show top 4 achievements
            .map((a: any) => ({
              id: a.id,
              title: a.title,
              description: a.description,
              icon: a.icon || 'emoji-events',
              earned: false, // TODO: Get from user data
              rarity: a.rarity || 'Common',
            }));
          setRecentAchievements(transformedAchievements);
        }
      } catch (err) {
        console.log('Could not load achievements:', err);
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load learning data');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await loadData();
      setRefreshing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    loadData();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderModuleCard = ({ item }: { item: Module }) => {
    const isImageUrl = item.icon.startsWith('http://') || item.icon.startsWith('https://');

    return (
      <TouchableOpacity
        style={styles.moduleCard}
        onPress={() => navigation.navigate('ModuleDetail', { module: item })}
      >
        <View style={styles.moduleHeader}>
          <View style={[styles.moduleIcon, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
            {isImageUrl ? (
              <Image source={{ uri: item.icon }} style={styles.moduleIconImage} />
            ) : (
              <Text style={styles.moduleIconEmoji}>{item.icon}</Text>
            )}
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
  };

  const renderChallengeCard = ({ item }: { item: Challenge }) => (
    <TouchableOpacity
      style={styles.challengeCard}
      onPress={() => navigation.navigate('ChallengeDetail', { challenge: item })}
    >
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
      </View>
    </TouchableOpacity>
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
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => navigation.navigate('LearningAdminDashboard')}
            >
              <MaterialIcons name="admin-panel-settings" size={24} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('ProgressDashboard')}
            >
              <MaterialIcons name="insights" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Overview Card */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.progressCard}
            onPress={() => navigation.navigate('ProgressDashboard')}
          >
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
              onPress={() => navigation.navigate('LearningPath')}
            >
              <MaterialIcons name="route" size={32} color="#3B82F6" />
              <Text style={styles.actionTitle}>Learning Paths</Text>
              <Text style={styles.actionSubtitle}>Guided courses</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <MaterialIcons name="leaderboard" size={32} color="#10B981" />
              <Text style={styles.actionTitle}>Leaderboard</Text>
              <Text style={styles.actionSubtitle}>View rankings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('BrowseModules')}
            >
              <MaterialIcons name="explore" size={32} color="#8B5CF6" />
              <Text style={styles.actionTitle}>Browse Modules</Text>
              <Text style={styles.actionSubtitle}>Explore content</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Modules */}
        {featuredModules.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcons name="star" size={24} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Featured Modules</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {featuredModules.map((module) => {
                const isImageUrl = module.icon.startsWith('http://') || module.icon.startsWith('https://');
                return (
                  <TouchableOpacity
                    key={module.id}
                    style={styles.featuredCard}
                    onPress={() => navigation.navigate('ModuleDetail', { module })}
                  >
                    <LinearGradient
                      colors={['#F59E0B', '#D97706']}
                      style={styles.featuredGradient}
                    >
                      <View style={styles.featuredBadge}>
                        <MaterialIcons name="star" size={16} color="#FFD700" />
                        <Text style={styles.featuredBadgeText}>Featured</Text>
                      </View>
                      {isImageUrl ? (
                        <Image
                          source={{ uri: module.icon }}
                          style={styles.featuredIcon}
                        />
                      ) : (
                        <View style={styles.featuredIcon}>
                          <Text style={styles.featuredIconEmoji}>{module.icon}</Text>
                        </View>
                      )}
                      <Text style={styles.featuredTitle}>{module.title}</Text>
                      <Text style={styles.featuredDescription} numberOfLines={2}>
                        {module.description}
                      </Text>
                      <View style={styles.featuredStats}>
                        <View style={styles.featuredStat}>
                          <MaterialIcons name="menu-book" size={14} color="rgba(255,255,255,0.9)" />
                          <Text style={styles.featuredStatText}>{module.totalLessons} lessons</Text>
                        </View>
                        <View style={styles.featuredStat}>
                          <MaterialIcons name="stars" size={14} color="rgba(255,255,255,0.9)" />
                          <Text style={styles.featuredStatText}>{module.xpReward} XP</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Continue Learning (In-Progress Modules) */}
        {inProgressModules.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Learning</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BrowseModules')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={inProgressModules}
              renderItem={renderModuleCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Completed Modules */}
        {completedModules.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Completed Modules</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BrowseModules')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={completedModules}
              renderItem={renderModuleCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  adminButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
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
  moduleIconImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  moduleIconEmoji: {
    fontSize: 24,
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  horizontalScroll: {
    paddingRight: 24,
  },
  featuredCard: {
    width: 260,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  featuredGradient: {
    padding: 20,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 16,
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  featuredIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  featuredIconEmoji: {
    fontSize: 48,
    textAlign: 'center',
    lineHeight: 80,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    lineHeight: 26,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    lineHeight: 20,
  },
  featuredStats: {
    flexDirection: 'row',
    gap: 16,
  },
  featuredStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredStatText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
});