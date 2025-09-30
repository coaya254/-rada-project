import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Image,
  Dimensions,
  useWindowDimensions,
  Animated,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAnonMode } from '../contexts/AnonModeContext';
import apiService from '../services/api';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// Type definitions
interface Module {
  id: number;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  estimated_duration: number;
  difficulty: string;
  is_featured: boolean;
  progress: number;
  image_url?: string;
  category?: string;
  lessons_count?: number;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  duration: string;
  participants: number;
  category: string;
  active: boolean;
  end_date?: string;
  difficulty?: string;
}

interface UserStats {
  totalXP: number;
  level: number;
  streak: number;
  modules_completed: number;
  quizzes_completed: number;
  badges_earned: number;
}

interface LearningHubProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

const LearningHub: React.FC<LearningHubProps> = ({ navigation }) => {
  const { user } = useAnonMode();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // API Data States
  const [featuredModule, setFeaturedModule] = useState<Module | null>(null);
  const [weeklyChallenge, setWeeklyChallenge] = useState<Challenge | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Responsive calculations
  const padding = 20;
  const cardWidth = screenWidth - (padding * 2);
  const bentoSmall = (cardWidth - 12) / 2;
  const bentoLarge = cardWidth;

  // Subtle & Professional color palette
  const modernColors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#10b981',
    pink: '#ec4899',
    orange: '#f59e0b',
    yellow: '#f59e0b',
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    gradients: {
      primary: ['#6366f1', '#8b5cf6'],
      sunset: ['#f59e0b', '#f97316'],
      ocean: ['#10b981', '#3b82f6'],
      fire: ['#ef4444', '#f59e0b'],
      cosmic: ['#8b5cf6', '#a855f7'],
      emerald: ['#10b981', '#059669'],
      neon: ['#f59e0b', '#f97316'],
    }
  };

  // Modern image URLs for each category
  const modernImages = {
    government: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400&q=80',
    democracy: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&q=80',
    constitution: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    rights: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    politics: 'https://images.unsplash.com/photo-1555848962-6e79363ec3f9?w=400&q=80',
    challenge: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&q=80',
  };

  // Load data from API
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [modulesResponse, challengesResponse, statsResponse] = await Promise.all([
        apiService.getModules(),
        apiService.getChallenges(),
        user ? apiService.getUserStats(user.uuid) : Promise.resolve({ data: null })
      ]);

      // Process modules
      let modules = [];
      if (Array.isArray(modulesResponse)) {
        modules = modulesResponse;
      } else if (modulesResponse?.data && Array.isArray(modulesResponse.data)) {
        modules = modulesResponse.data;
      } else if ((modulesResponse as any)?.modules && Array.isArray((modulesResponse as any).modules)) {
        modules = (modulesResponse as any).modules;
      }

      setModules(modules);
      const featuredModule = modules.find((module: Module) => module.is_featured) || modules[0];
      setFeaturedModule(featuredModule);

      // Process challenges
      let challenges = [];
      if (Array.isArray(challengesResponse)) {
        challenges = challengesResponse;
      } else if (challengesResponse?.data && Array.isArray(challengesResponse.data)) {
        challenges = challengesResponse.data;
      } else if ((challengesResponse as any)?.challenges && Array.isArray((challengesResponse as any).challenges)) {
        challenges = (challengesResponse as any).challenges;
      }

      setChallenges(challenges);
      const weeklyChallenge = challenges.find((challenge: Challenge) =>
        challenge.category === 'weekly' || challenge.title.toLowerCase().includes('weekly')
      ) || challenges[0];
      setWeeklyChallenge(weeklyChallenge);

      // Process user stats
      let stats = null;
      if (statsResponse?.data) {
        stats = statsResponse.data;
      } else if (statsResponse && typeof statsResponse === 'object') {
        stats = statsResponse;
      }

      if (stats) {
        setUserStats({
          totalXP: stats.total_xp || user?.xp || 0,
          level: stats.level || user?.level || 1,
          streak: stats.learning_streak || user?.streak || 0,
          modules_completed: stats.completed_modules || 0,
          quizzes_completed: stats.quizzes_completed || 0,
          badges_earned: stats.badges_earned || 0
        });
      } else {
        setUserStats({
          totalXP: user?.xp || 0,
          level: user?.level || 1,
          streak: user?.streak || 0,
          modules_completed: 0,
          quizzes_completed: 0,
          badges_earned: 0
        });
      }

    } catch (err) {
      console.error('Error loading Learning Hub data:', err);
      setError('Failed to load content. Please check your connection.');
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

    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.1)),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.1)),
      }),
    ]).start();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={modernColors.gradients.cosmic}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading your learning universe...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Vibrant Animated Header */}
      <Animated.View
        style={[{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}
      >
        <LinearGradient
          colors={modernColors.gradients.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <BlurView intensity={20} tint="dark" style={styles.headerBlur}>
            <View style={styles.headerContent}>
              {/* Greeting Section */}
              <View style={styles.greetingSection}>
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={modernColors.gradients.sunset}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarEmoji}>🚀</Text>
                  </LinearGradient>
                </View>
                <View style={styles.greetingText}>
                  <Text style={styles.welcomeText}>Hey {user?.nickname || 'Legend'}! 👋</Text>
                  <Text style={styles.motivationText}>Ready to level up your civic game?</Text>
                </View>
                <TouchableOpacity style={styles.notificationBtn}>
                  <LinearGradient
                    colors={modernColors.gradients.fire}
                    style={styles.notificationGradient}
                  >
                    <Ionicons name="notifications" size={20} color="white" />
                    <View style={styles.notificationBadge} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
                <BlurView intensity={15} tint="light" style={styles.searchBlur}>
                  <Ionicons name="search" size={20} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.searchPlaceholder}>Search for epic content...</Text>
                  <Ionicons name="mic" size={18} color="rgba(255,255,255,0.6)" />
                </BlurView>
              </TouchableOpacity>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>

      {/* Stats Cards */}
      {userStats && (
        <Animated.View
          style={[styles.statsContainer, {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }]}
        >
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { width: bentoSmall }]}>
              <LinearGradient colors={modernColors.gradients.emerald} style={styles.statGradient}>
                <Ionicons name="flash" size={20} color="white" />
                <Text style={styles.statValue}>{userStats.totalXP}</Text>
                <Text style={styles.statLabel}>XP Points</Text>
              </LinearGradient>
            </View>

            <View style={[styles.statCard, { width: bentoSmall }]}>
              <LinearGradient colors={modernColors.gradients.sunset} style={styles.statGradient}>
                <Ionicons name="trophy" size={20} color="white" />
                <Text style={styles.statValue}>Level {userStats.level}</Text>
                <Text style={styles.statLabel}>Your Level</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { width: bentoSmall }]}>
              <LinearGradient colors={modernColors.gradients.fire} style={styles.statGradient}>
                <Ionicons name="flame" size={20} color="white" />
                <Text style={styles.statValue}>{userStats.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </LinearGradient>
            </View>

            <View style={[styles.statCard, { width: bentoSmall }]}>
              <LinearGradient colors={modernColors.gradients.cosmic} style={styles.statGradient}>
                <Ionicons name="ribbon" size={20} color="white" />
                <Text style={styles.statValue}>{userStats.badges_earned}</Text>
                <Text style={styles.statLabel}>Badges</Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Featured Course - Hero Bento */}
        {featuredModule && (
          <Animated.View
            style={[styles.heroSection, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }]}
          >
            <TouchableOpacity
              style={[styles.heroCard, { width: bentoLarge }]}
              onPress={() => navigation.navigate('ModuleDetailScreen', {
                moduleId: featuredModule.id,
                module: featuredModule
              })}
              activeOpacity={0.95}
            >
              <LinearGradient
                colors={modernColors.gradients.ocean}
                style={styles.heroGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image
                  source={{
                    uri: featuredModule.image_url || modernImages.government
                  }}
                  style={styles.heroImage}
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
                  style={styles.heroOverlay}
                />

                <View style={styles.heroContent}>
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>🔥 TRENDING NOW</Text>
                  </View>

                  <Text style={styles.heroTitle}>{featuredModule.title}</Text>
                  <Text style={styles.heroDescription}>{featuredModule.description}</Text>

                  <View style={styles.heroMeta}>
                    <View style={styles.metaChip}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.metaText}>{featuredModule.xp_reward} XP</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Ionicons name="time" size={14} color="white" />
                      <Text style={styles.metaText}>{featuredModule.estimated_duration} min</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Ionicons name="trending-up" size={14} color="white" />
                      <Text style={styles.metaText}>{featuredModule.difficulty}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.startButton}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
                      style={styles.startButtonGradient}
                    >
                      <Text style={styles.startButtonText}>Start Learning 🚀</Text>
                      <Ionicons name="arrow-forward" size={18} color={modernColors.primary} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Quick Actions Bento Grid */}
        <Animated.View
          style={[styles.quickActionsSection, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }]}
        >
          <Text style={styles.sectionTitle}>🎯 Quick Actions</Text>
          <View style={styles.bentoGrid}>
            <TouchableOpacity
              style={[styles.bentoCard, { width: bentoSmall }]}
              onPress={() => navigation.navigate('ModulesScreen')}
              activeOpacity={0.9}
            >
              <LinearGradient colors={modernColors.gradients.primary} style={styles.bentoGradient}>
                <Ionicons name="library" size={32} color="white" />
                <Text style={styles.bentoTitle}>All Modules</Text>
                <Text style={styles.bentoSubtitle}>{modules.length} courses</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bentoCard, { width: bentoSmall }]}
              onPress={() => navigation.navigate('ChallengesScreen')}
              activeOpacity={0.9}
            >
              <LinearGradient colors={modernColors.gradients.emerald} style={styles.bentoGradient}>
                <Ionicons name="trophy" size={32} color="white" />
                <Text style={styles.bentoTitle}>Challenges</Text>
                <Text style={styles.bentoSubtitle}>Level up!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.bentoGrid}>
            <TouchableOpacity
              style={[styles.bentoCard, { width: bentoSmall }]}
              onPress={() => navigation.navigate('BadgesScreen')}
              activeOpacity={0.9}
            >
              <LinearGradient colors={modernColors.gradients.sunset} style={styles.bentoGradient}>
                <Ionicons name="ribbon" size={32} color="white" />
                <Text style={styles.bentoTitle}>Achievements</Text>
                <Text style={styles.bentoSubtitle}>Earn badges</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bentoCard, { width: bentoSmall }]}
              onPress={() => navigation.navigate('ProgressScreen')}
              activeOpacity={0.9}
            >
              <LinearGradient colors={modernColors.gradients.fire} style={styles.bentoGradient}>
                <Ionicons name="analytics" size={32} color="white" />
                <Text style={styles.bentoTitle}>Progress</Text>
                <Text style={styles.bentoSubtitle}>Track stats</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Weekly Challenge */}
        {weeklyChallenge && (
          <Animated.View
            style={[styles.challengeSection, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }]}
          >
            <Text style={styles.sectionTitle}>💥 Weekly Challenge</Text>
            <TouchableOpacity
              style={[styles.challengeCard, { width: bentoLarge }]}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={modernColors.gradients.cosmic}
                style={styles.challengeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image
                  source={{ uri: modernImages.challenge }}
                  style={styles.challengeImage}
                />
                <LinearGradient
                  colors={['rgba(139,92,246,0.3)', 'rgba(139,92,246,0.8)']}
                  style={styles.challengeOverlay}
                />

                <View style={styles.challengeContent}>
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeIconContainer}>
                      <Text style={styles.challengeIcon}>🏆</Text>
                    </View>
                    <View style={styles.challengeRewardBadge}>
                      <Text style={styles.challengeRewardText}>+{weeklyChallenge.xp_reward} XP</Text>
                    </View>
                  </View>

                  <Text style={styles.challengeTitle}>{weeklyChallenge.title}</Text>
                  <Text style={styles.challengeDescription}>{weeklyChallenge.description}</Text>

                  <View style={styles.challengeStats}>
                    <View style={styles.challengeStat}>
                      <Ionicons name="people" size={16} color="white" />
                      <Text style={styles.challengeStatText}>{weeklyChallenge.participants || 0} joined</Text>
                    </View>
                    <View style={styles.challengeStat}>
                      <Ionicons name="time" size={16} color="white" />
                      <Text style={styles.challengeStatText}>{weeklyChallenge.duration || '5 days left'}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.joinChallengeButton}>
                    <BlurView intensity={20} tint="light" style={styles.joinButtonBlur}>
                      <Text style={styles.joinButtonText}>Join Challenge 🔥</Text>
                    </BlurView>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Continue Learning */}
        {featuredModule && featuredModule.progress > 0 && (
          <Animated.View
            style={[styles.continueSection, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }]}
          >
            <Text style={styles.sectionTitle}>📚 Continue Learning</Text>
            <TouchableOpacity
              style={[styles.continueCard, { width: bentoLarge }]}
              onPress={() => navigation.navigate('ModuleDetailScreen', {
                moduleId: featuredModule.id,
                module: featuredModule
              })}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={modernColors.gradients.neon}
                style={styles.continueGradient}
              >
                <View style={styles.continueContent}>
                  <View style={styles.continueHeader}>
                    <Text style={styles.continueIcon}>{featuredModule.icon || '📖'}</Text>
                    <View style={styles.progressBadge}>
                      <Text style={styles.progressBadgeText}>{featuredModule.progress}%</Text>
                    </View>
                  </View>

                  <Text style={styles.continueTitle}>{featuredModule.title}</Text>
                  <Text style={styles.continueSubtitle}>Pick up where you left off</Text>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={['#ffffff', '#f3f4f6']}
                        style={[styles.progressFill, { width: `${featuredModule.progress}%` }]}
                      />
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 55 : 35,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerBlur: {
    paddingBottom: 30,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  greetingText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  motivationText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  notificationBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  notificationGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
  },
  searchBar: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
    zIndex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 10,
  },
  statCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginVertical: 4,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: 20,
    letterSpacing: -0.8,
  },
  heroSection: {
    marginBottom: 32,
  },
  heroCard: {
    height: 280,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
  },
  heroGradient: {
    flex: 1,
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heroContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-end',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  heroBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -0.8,
  },
  heroDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '500',
  },
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  metaText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    color: '#6366f1',
    fontSize: 18,
    fontWeight: '800',
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  bentoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  bentoCard: {
    height: 140,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
  },
  bentoGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  bentoSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  challengeSection: {
    marginBottom: 32,
  },
  challengeCard: {
    height: 220,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
  },
  challengeGradient: {
    flex: 1,
    position: 'relative',
  },
  challengeImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  challengeOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  challengeContent: {
    flex: 1,
    padding: 24,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeIcon: {
    fontSize: 24,
  },
  challengeRewardBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  challengeRewardText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  challengeDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: '500',
  },
  challengeStats: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  challengeStatText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  joinChallengeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  joinButtonBlur: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  continueSection: {
    marginBottom: 32,
  },
  continueCard: {
    height: 120,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#eab308',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
  },
  continueGradient: {
    flex: 1,
    padding: 24,
  },
  continueContent: {
    flex: 1,
  },
  continueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  continueIcon: {
    fontSize: 32,
  },
  progressBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  progressBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
  continueTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  continueSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default LearningHub;