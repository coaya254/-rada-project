import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import { useAnonMode } from '../contexts/AnonModeContext';
import apiService from '../services/api';
import performanceService from '../services/performanceService';
import SyncStatusIndicator from '../components/SyncStatusIndicator';
import OptimizedImage from '../components/OptimizedImage';
import OptimizedFlatList from '../components/OptimizedFlatList';
import PerformanceMonitor from '../components/PerformanceMonitor';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Type definitions (unchanged)
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
  illustration?: string;
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
  image_url?: string;
}

interface UserStats {
  totalXP: number;
  level: number;
  streak: number;
  modules_completed: number;
  quizzes_completed: number;
  badges_earned: number;
  modulesCompleted?: number;
  badgesEarned?: number;
}

interface Feature {
  key: string;
  label: string;
  icon: string;
  screen: string;
  description: string;
  color: string[];
  iconColor: string;
  size: string;
  illustration: string;
}

interface LearningHubProps {
  navigation: any;
}

const LearningHub: React.FC<LearningHubProps> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadStates, setImageLoadStates] = useState<{[key: string]: boolean}>({});
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // API Data States (unchanged)
  const [featuredModule, setFeaturedModule] = useState<Module | null>(null);
  const [weeklyChallenge, setWeeklyChallenge] = useState<Challenge | null>(null);
  const [themedChallenges, setThemedChallenges] = useState<Challenge[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [weeklyFeatured, setWeeklyFeatured] = useState<Module | null>(null);

  // Modern illustrations from unDraw and similar sources
  const modernIllustrations = {
    learning: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80',
    challenges: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&q=80',
    achievements: 'https://images.unsplash.com/phone-1559827260-dc66d52bef19?w=800&q=80',
    analytics: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    government: 'https://images.unsplash.com/phone-1541872703-74c5e44368f9?w=800&q=80',
    weekly: 'https://images.unsplash.com/phone-1507003211169-0a1dd7228f2d?w=800&q=80',
    groups: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
    buddies: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    discussions: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'
  };

  // Responsive calculations
  const isSmallScreen = screenWidth < 375;
  const cardWidth = screenWidth - 40;
  const smallCardWidth = (cardWidth - 12) / 2;

  // Load data from API with better error handling
  const loadData = async () => {
    try {
      performanceService.startTiming('LearningHub-loadData');
      setIsLoading(true);
      setError(null);

      console.log('LearningHub - Loading data for user:', user?.uuid);

      // Load data from real API endpoints
      const [modulesResponse, challengesResponse, statsResponse] = await Promise.all([
        apiService.getModules(),
        apiService.getChallenges(),
        user ? apiService.getUserStats(user.uuid) : Promise.resolve({ data: null })
      ]);

      console.log('LearningHub - API responses:', {
        modules: modulesResponse,
        challenges: challengesResponse,
        stats: statsResponse
      });

      // Process modules data - handle both direct array and wrapped responses
      let modules = [];
      if (Array.isArray(modulesResponse)) {
        modules = modulesResponse;
      } else if (modulesResponse?.data && Array.isArray(modulesResponse.data)) {
        modules = modulesResponse.data;
      } else if (modulesResponse?.modules && Array.isArray(modulesResponse.modules)) {
        modules = modulesResponse.modules;
      }

      console.log('LearningHub - Processed modules:', modules);

      const featuredModule = modules.find((module: Module) => module.is_featured) || modules[0];
      setFeaturedModule(featuredModule);

      // Process weekly featured module (use first module as weekly featured)
      setWeeklyFeatured(featuredModule);

      // Process challenges data - handle both direct array and wrapped responses
      let challenges = [];
      if (Array.isArray(challengesResponse)) {
        challenges = challengesResponse;
      } else if (challengesResponse?.data && Array.isArray(challengesResponse.data)) {
        challenges = challengesResponse.data;
      } else if (challengesResponse?.challenges && Array.isArray(challengesResponse.challenges)) {
        challenges = challengesResponse.challenges;
      }

      console.log('LearningHub - Processed challenges:', challenges);

      const weeklyChallenge = challenges.find((challenge: Challenge) => 
        challenge.category === 'weekly' || challenge.title.toLowerCase().includes('weekly')
      ) || challenges[0];
      setWeeklyChallenge(weeklyChallenge);

      // Get themed challenges (exclude weekly)
      const themedChallenges = challenges.filter((challenge: Challenge) => 
        challenge.id !== weeklyChallenge?.id
      ).slice(0, 2);
      setThemedChallenges(themedChallenges);

      // Process user stats
      let stats = null;
      if (statsResponse?.data) {
        stats = statsResponse.data;
      } else if (statsResponse && typeof statsResponse === 'object') {
        stats = statsResponse;
      }

      console.log('LearningHub - Processed stats:', stats);
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
        // Fallback stats for new users
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
      
      // Don't set fallback data - show empty state instead
      setFeaturedModule(null);
      setWeeklyFeatured(null);
      setWeeklyChallenge(null);
      setThemedChallenges([]);
      setUserStats(null);
      setModules([]);
    } finally {
      performanceService.endTiming('LearningHub-loadData');
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    // Start performance monitoring
    performanceService.startMonitoring();
    
    loadData();
    
    // Cleanup on unmount
    return () => {
      performanceService.stopMonitoring();
    };
  }, []);

  // Handle navigation to different screens
  const handleFeaturePress = (feature: Feature) => {
    navigation.navigate(feature.screen);
  };

  // Handle image loading
  const handleImageLoad = (imageId: string) => {
    setImageLoadStates(prev => ({ ...prev, [imageId]: true }));
  };

  const renderMainActionCard = (feature: Feature) => {
    return (
      <TouchableOpacity
        key={feature.key}
        style={[styles.mainActionCard, { width: cardWidth }]}
        onPress={() => handleFeaturePress(feature)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: feature.illustration }}
            style={styles.cardImage}
            onLoad={() => handleImageLoad(feature.key)}
          />
        <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
            style={styles.imageOverlay}
          />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: feature.iconColor }]}>
              <Text style={styles.cardIconText}>{feature.icon}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </View>
          <Text style={[styles.cardTitle, isSmallScreen && styles.smallCardTitle]}>{feature.label}</Text>
          <Text style={[styles.cardDescription, isSmallScreen && styles.smallCardDescription]}>{feature.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSmallActionCard = (feature: Feature) => {
    return (
      <TouchableOpacity
        key={feature.key}
        style={[styles.smallActionCard, { width: smallCardWidth }]}
        onPress={() => handleFeaturePress(feature)}
        activeOpacity={0.9}
      >
        <View style={styles.smallImageContainer}>
          <Image
            source={{ uri: feature.illustration }}
            style={styles.smallCardImage}
            onLoad={() => handleImageLoad(feature.key)}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
            style={styles.smallImageOverlay}
          />
          </View>
        <View style={styles.smallCardContent}>
          <View style={styles.smallCardHeader}>
            <Text style={styles.smallCardIcon}>{feature.icon}</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </View>
          <Text style={[styles.smallCardTitle, isSmallScreen && styles.smallestCardTitle]}>{feature.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const features: Feature[] = [
    { 
      key: 'learn-flow', 
      label: 'Interactive Learning', 
      icon: '🎓', 
      screen: 'ModulesScreen', 
      description: 'Step-by-step courses with engaging lessons and interactive quizzes', 
      color: ['#667eea', '#764ba2'],
      iconColor: 'rgba(255,255,255,0.2)',
      size: 'large',
      illustration: modernIllustrations.learning
    },
    { 
      key: 'challenges', 
      label: 'Challenges', 
      icon: '🎯', 
      screen: 'ChallengesScreen', 
      description: 'Take on themed challenges', 
      color: ['#ffecd2', '#fcb69f'],
      iconColor: 'rgba(252,182,159,0.3)',
      size: 'small',
      illustration: modernIllustrations.challenges
    },
    { 
      key: 'badges', 
      label: 'Achievements', 
      icon: '🏆', 
      screen: 'BadgesScreen', 
      description: 'Earn badges and rewards', 
      color: ['#a8edea', '#fed6e3'],
      iconColor: 'rgba(168,237,234,0.3)',
      size: 'small',
      illustration: modernIllustrations.achievements
    },
    { 
      key: 'analytics', 
      label: 'Progress Analytics', 
      icon: '📊', 
      screen: 'ProgressAnalytics', 
      description: 'Track your learning journey', 
      color: ['#667eea', '#764ba2'],
      iconColor: 'rgba(102,126,234,0.3)',
      size: 'small',
      illustration: modernIllustrations.analytics
    },
    { 
      key: 'groups', 
      label: 'Study Groups', 
      icon: '👥', 
      screen: 'StudyGroups', 
      description: 'Join study groups and collaborate', 
      color: ['#ff9a9e', '#fecfef'],
      iconColor: 'rgba(255,154,158,0.3)',
      size: 'small',
      illustration: modernIllustrations.groups
    },
    { 
      key: 'buddies', 
      label: 'Learning Buddies', 
      icon: '🤝', 
      screen: 'LearningBuddies', 
      description: 'Find study partners and mentors', 
      color: ['#a8edea', '#fed6e3'],
      iconColor: 'rgba(168,237,234,0.3)',
      size: 'small',
      illustration: modernIllustrations.buddies
    },
    { 
      key: 'notifications', 
      label: 'Notifications', 
      icon: '🔔', 
      screen: 'NotificationCenter', 
      description: 'Manage your notifications and alerts', 
      color: ['#fef3c7', '#fde68a'],
      iconColor: 'rgba(254,243,199,0.3)',
      size: 'small',
      illustration: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
    },
    { 
      key: 'insights', 
      label: 'Your Insights', 
      icon: '📈', 
      screen: 'UserInsights', 
      description: 'Track your personal learning analytics', 
      color: ['#e0f2fe', '#bae6fd'],
      iconColor: 'rgba(224,242,254,0.3)',
      size: 'small',
      illustration: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80'
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading Learning Hub...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sync Status Indicator */}
      <SyncStatusIndicator showDetails={true} />
      
      {/* Performance Monitor Button - Development Only */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.performanceButton}
          onPress={() => setShowPerformanceMonitor(true)}
        >
          <Ionicons name="speedometer" size={16} color="#667eea" />
          <Text style={styles.performanceButtonText}>Performance</Text>
        </TouchableOpacity>
      )}
      
      {/* Header - Not sticky anymore */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={[styles.header, isSmallScreen && styles.smallHeader]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.greeting}>
            <View style={styles.avatar}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>✨</Text>
              </LinearGradient>
            </View>
            <View style={styles.greetingText}>
              <Text style={[styles.welcomeTitle, isSmallScreen && styles.smallWelcomeTitle]}>Hello, {user?.nickname || 'Learner'}!</Text>
              <Text style={[styles.welcomeSubtitle, isSmallScreen && styles.smallWelcomeSubtitle]}>Ready to explore democracy?</Text>
            </View>
      </View>

          <TouchableOpacity style={styles.searchContainer} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.1)']}
              style={styles.searchGradient}
            >
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.searchPlaceholder}>What would you like to learn?</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* User Stats Section - Not sticky */}
      {userStats && (
        <View style={styles.statsSection}>
          <View style={[styles.statsCard, { width: cardWidth }]}>
            <LinearGradient
              colors={['#ffffff', '#f8faff']}
              style={styles.statsGradient}
            >
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <LinearGradient colors={['#667eea', '#764ba2']} style={styles.statIconGradient}>
                    <Text style={styles.statIcon}>⚡</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.statValue}>{userStats.totalXP}</Text>
                <Text style={styles.statLabel}>Total XP</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <LinearGradient colors={['#ffecd2', '#fcb69f']} style={styles.statIconGradient}>
                    <Text style={styles.statIcon}>🎯</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.statValue}>Level {userStats.level}</Text>
                <Text style={styles.statLabel}>Current Level</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <LinearGradient colors={['#a8edea', '#fed6e3']} style={styles.statIconGradient}>
                    <Text style={styles.statIcon}>🔥</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.statValue}>{userStats.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      )}

      {/* Main Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Learning Paths Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isSmallScreen && styles.smallSectionTitle]}>Learning Paths</Text>
          
          {/* Main Interactive Learning Card */}
          {renderMainActionCard(features[0])}
          
          {/* Grid of smaller cards */}
          <View style={styles.smallCardsGrid}>
            {features.slice(1).map((feature) => renderSmallActionCard(feature))}
          </View>
          </View>

        {/* Continue Learning */}
        {featuredModule && featuredModule.progress > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isSmallScreen && styles.smallSectionTitle]}>Continue Learning</Text>
            <TouchableOpacity 
              style={[styles.continueCard, { width: cardWidth }]}
              onPress={() => navigation.navigate('ModuleDetailScreen', { 
                moduleId: featuredModule.id, 
                module: featuredModule 
              })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ffecd2', '#fcb69f']}
                style={styles.continueGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.continueContent}>
                  <View style={styles.continueHeader}>
                    <Text style={styles.continueIcon}>{featuredModule.icon || '🏛️'}</Text>
                    <View style={styles.progressBadge}>
                      <Text style={styles.progressBadgeText}>{featuredModule.progress}%</Text>
                    </View>
                  </View>
                  <Text style={[styles.continueTitle, isSmallScreen && styles.smallContinueTitle]}>{featuredModule.title}</Text>
                  <Text style={[styles.continueDescription, isSmallScreen && styles.smallContinueDescription]}>{featuredModule.description}</Text>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={[styles.progressFill, { width: `${featuredModule.progress}%` }]}
                      />
                    </View>
                    <Text style={styles.progressText}>Continue where you left off</Text>
                  </View>
                </View>
              </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

        {/* Featured This Week */}
        {weeklyFeatured && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isSmallScreen && styles.smallSectionTitle]}>Featured This Week</Text>
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeText}>NEW</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.featuredCard, { width: cardWidth }]}
              onPress={() => navigation.navigate('ModuleDetailScreen', { 
                moduleId: weeklyFeatured.id, 
                module: weeklyFeatured 
              })}
              activeOpacity={0.9}
            >
                <LinearGradient
                colors={['#667eea', '#764ba2']}
                  style={styles.featuredGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                >
                  <View style={styles.featuredContent}>
                  <View style={styles.featuredTextContainer}>
                    <Text style={[styles.featuredTitle, isSmallScreen && styles.smallFeaturedTitle]}>{weeklyFeatured.title}</Text>
                    <Text style={[styles.featuredDescription, isSmallScreen && styles.smallFeaturedDescription]}>{weeklyFeatured.description}</Text>
                    
                      <View style={styles.featuredMeta}>
                      <View style={styles.metaItem}>
                        <Text style={styles.metaText}>⭐ {weeklyFeatured.xp_reward} XP</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Text style={styles.metaText}>⏱️ {weeklyFeatured.estimated_duration} min</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Text style={styles.metaText}>📊 {weeklyFeatured.difficulty}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.featuredIconContainer}>
                    <View style={styles.featuredIcon}>
                      <Text style={styles.featuredIconText}>{weeklyFeatured.icon || '🏛️'}</Text>
                    </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Weekly Challenge */}
          {weeklyChallenge && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isSmallScreen && styles.smallSectionTitle]}>Weekly Challenge</Text>
              <View style={styles.participantsBadge}>
                <Text style={styles.participantsBadgeText}>{weeklyChallenge.participants || 0} joined</Text>
              </View>
            </View>
            
            <TouchableOpacity style={[styles.challengeCard, { width: cardWidth }]} activeOpacity={0.8}>
                <LinearGradient
                colors={['#ff9a9e', '#fad0c4']}
                style={styles.challengeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.challengeContent}>
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeIconContainer}>
                      <Text style={styles.challengeIcon}>🎯</Text>
                      </View>
                    <Text style={styles.challengeReward}>+{weeklyChallenge.xp_reward} XP</Text>
                    </View>
                  
                  <Text style={[styles.challengeTitle, isSmallScreen && styles.smallChallengeTitle]}>{weeklyChallenge.title}</Text>
                  <Text style={[styles.challengeDescription, isSmallScreen && styles.smallChallengeDescription]}>{weeklyChallenge.description}</Text>
                  
                  <View style={styles.challengeFooter}>
                    <Text style={styles.challengeDuration}>⏰ {weeklyChallenge.duration || '7 days left'}</Text>
                    <TouchableOpacity style={styles.joinButton}>
                      <Text style={styles.joinButtonText}>Join Challenge</Text>
                    </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

        {/* Error Message */}
        {error && (
          <View style={[styles.errorContainer, { width: cardWidth }]}>
            <LinearGradient
              colors={['#ff9a9e', '#fad0c4']}
              style={styles.errorGradient}
            >
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
            </LinearGradient>
            </View>
          )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
      
      {/* Performance Monitor Modal */}
      <PerformanceMonitor
        visible={showPerformanceMonitor}
        onClose={() => setShowPerformanceMonitor(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faff',
  },
  performanceButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  performanceButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  smallHeader: {
    paddingTop: Platform.OS === 'ios' ? 40 : 25,
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    marginRight: 15,
  },
  avatarGradient: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  greetingText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  smallWelcomeTitle: {
    fontSize: 22,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  smallWelcomeSubtitle: {
    fontSize: 14,
  },
  searchContainer: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  searchPlaceholder: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 10,
    zIndex: 1,
    alignItems: 'center',
  },
  statsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  statsGradient: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 15,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -0.5,
  },
  smallSectionTitle: {
    fontSize: 20,
  },
  featureBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  participantsBadge: {
    backgroundColor: 'rgba(255, 154, 158, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantsBadgeText: {
    color: '#ff9a9e',
    fontSize: 12,
    fontWeight: '700',
  },
  // Main Action Card (Interactive Learning - Large)
  mainActionCard: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  imageContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,    left: 0,
    right: 0,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconText: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  smallCardTitle: {
    fontSize: 20,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  smallCardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  // Small Action Cards Grid
  smallCardsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  smallActionCard: {
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  smallImageContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  smallCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  smallImageOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  smallCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  smallCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  smallCardIcon: {
    fontSize: 18,
  },
  smallCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.3,
  },
  smallestCardTitle: {
    fontSize: 14,
  },
  featuredCard: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  featuredGradient: {
    padding: 24,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredTextContainer: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  smallFeaturedTitle: {
    fontSize: 18,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 18,
    lineHeight: 20,
  },
  smallFeaturedDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  featuredMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  featuredIconContainer: {
    marginLeft: 20,
  },
  featuredIcon: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredIconText: {
    fontSize: 40,
  },
  continueCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#ffecd2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  continueGradient: {
    padding: 20,
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
    fontSize: 36,
  },
  progressBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  progressBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  continueTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  smallContinueTitle: {
    fontSize: 16,
  },
  continueDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 20,
  },
  smallContinueDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  challengeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#ff9a9e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  challengeGradient: {
    padding: 20,
  },
  challengeContent: {
    flex: 1,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeIcon: {
    fontSize: 24,
  },
  challengeReward: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  smallChallengeTitle: {
    fontSize: 16,
  },
  challengeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 20,
  },
  smallChallengeDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeDuration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#ff9a9e',
    fontSize: 14,
    fontWeight: '700',
  },
  errorContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#ff9a9e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignSelf: 'center',
  },
  errorGradient: {
    padding: 20,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#ff9a9e',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8faff',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LearningHub;
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  smallChallengeTitle: {
    fontSize: 16,
  },
  challengeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 20,
  },
  smallChallengeDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeDuration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#ff9a9e',
    fontSize: 14,
    fontWeight: '700',
  },
  errorContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#ff9a9e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignSelf: 'center',
  },
  errorGradient: {
    padding: 20,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#ff9a9e',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8faff',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LearningHub;
