import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Share,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { Card, LoadingSpinner, ErrorDisplay } from '../../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { ProfileAPIService, UserProfile } from '../../services/ProfileAPIService';

type RootStackParamList = {
  UserProfile: {
    userId: string;
    userName?: string;
  };
};

interface UserProfileScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserProfile'>;
  route: RouteProp<RootStackParamList, 'UserProfile'>;
}

type ProfileTab = 'posts' | 'badges' | 'about';

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ navigation, route }) => {
  const { userId, userName } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await ProfileAPIService.getUserProfile(userId);
      if (response.success) {
        setProfile(response.profile);
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProfileData();
      setRefreshing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
      setRefreshing(false);
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out ${profile?.nickname || userName || 'this user'}'s profile on Rada.ke!\n\nJoin the civic engagement community: https://rada.ke`,
        title: `Share ${profile?.nickname || userName}'s Profile`,
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <LoadingSpinner message="Loading profile..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ErrorDisplay
          title="Profile Unavailable"
          message={error}
          onRetry={loadProfileData}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.neutral[700]} />
          </TouchableOpacity>
          <Text style={styles.username}>{profile?.nickname || userName || 'User'}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Card */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <LinearGradient
              colors={colors.gradients.purple}
              style={styles.profileGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.profileContent}>
                <View style={styles.profileHeader}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      {profile?.emoji && (profile.emoji.startsWith('http://') || profile.emoji.startsWith('https://')) ? (
                        <Image
                          source={{ uri: profile.emoji }}
                          style={styles.avatarImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={styles.avatarText}>{profile?.emoji || profile?.nickname?.substring(0, 2).toUpperCase() || 'U'}</Text>
                      )}
                    </View>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>LVL {profile?.level || 1}</Text>
                    </View>
                  </View>

                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{profile?.nickname || 'User'}</Text>
                    <View style={styles.profileBadge}>
                      <MaterialIcons name="verified" size={16} color="#FFFFFF" />
                      <Text style={styles.profileBadgeText}>
                        {profile?.persona ? `${profile.persona.charAt(0).toUpperCase() + profile.persona.slice(1)}` : 'Verified Citizen'}
                      </Text>
                    </View>
                    {profile?.county && (
                      <Text style={styles.profileLocation}>📍 {profile.county}</Text>
                    )}
                    {profile?.bio && (
                      <Text style={styles.profileBio}>{profile.bio}</Text>
                    )}
                  </View>
                </View>

                {/* Engagement Stats */}
                <View style={styles.engagementStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile?.total_xp || profile?.xp || 0}</Text>
                    <Text style={styles.statLabel}>CIVIC POINTS</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile?.trust_score ? `${(profile.trust_score * 100).toFixed(0)}%` : 'N/A'}</Text>
                    <Text style={styles.statLabel}>TRUST SCORE</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile?.current_streak || profile?.streak || 0}</Text>
                    <Text style={styles.statLabel}>STREAK DAYS</Text>
                  </View>
                </View>

                {/* Share Button (no edit for other users) */}
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleShareProfile}
                >
                  <MaterialIcons name="share" size={18} color="#FFFFFF" />
                  <Text style={styles.shareButtonText}>Share Profile</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Profile Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollView}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
              onPress={() => setActiveTab('posts')}
            >
              <MaterialIcons
                name="grid-on"
                size={20}
                color={activeTab === 'posts' ? colors.primary[600] : colors.neutral[600]}
              />
              <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'badges' && styles.activeTab]}
              onPress={() => setActiveTab('badges')}
            >
              <MaterialIcons
                name="emoji-events"
                size={20}
                color={activeTab === 'badges' ? colors.primary[600] : colors.neutral[600]}
              />
              <Text style={[styles.tabText, activeTab === 'badges' && styles.activeTabText]}>Badges</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'about' && styles.activeTab]}
              onPress={() => setActiveTab('about')}
            >
              <MaterialIcons
                name="info"
                size={20}
                color={activeTab === 'about' ? colors.primary[600] : colors.neutral[600]}
              />
              <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>About</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{profile?.nickname}'s Posts</Text>
            <Card style={styles.emptyStateCard}>
              <MaterialIcons name="article" size={48} color={colors.neutral[400]} />
              <Text style={styles.emptyStateTitle}>No posts yet</Text>
              <Text style={styles.emptyStateText}>
                This user hasn't shared any posts
              </Text>
            </Card>
          </View>
        )}

        {activeTab === 'badges' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Badges & Achievements</Text>
            {profile?.achievements_earned && profile.achievements_earned > 0 ? (
              <Card style={styles.achievementsCard}>
                <View style={styles.achievementsHeader}>
                  <View style={styles.achievementsIcon}>
                    <MaterialIcons name="emoji-events" size={24} color={colors.warning[500]} />
                  </View>
                  <View style={styles.achievementsInfo}>
                    <Text style={styles.achievementsTitle}>Achievements</Text>
                    <Text style={styles.achievementsMeta}>
                      {profile.achievements_earned} achievements earned
                    </Text>
                  </View>
                </View>
              </Card>
            ) : (
              <Card style={styles.emptyStateCard}>
                <MaterialIcons name="emoji-events" size={48} color={colors.neutral[400]} />
                <Text style={styles.emptyStateTitle}>No badges yet</Text>
                <Text style={styles.emptyStateText}>
                  This user hasn't earned any badges
                </Text>
              </Card>
            )}
          </View>
        )}

        {activeTab === 'about' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Card style={styles.aboutCard}>
              <View style={styles.aboutRow}>
                <MaterialIcons name="person" size={20} color={colors.neutral[600]} />
                <Text style={styles.aboutLabel}>Name</Text>
                <Text style={styles.aboutValue}>{profile?.nickname || 'Not set'}</Text>
              </View>
              <View style={styles.aboutRow}>
                <MaterialIcons name="location-on" size={20} color={colors.neutral[600]} />
                <Text style={styles.aboutLabel}>County</Text>
                <Text style={styles.aboutValue}>{profile?.county || 'Not set'}</Text>
              </View>
              <View style={styles.aboutRow}>
                <MaterialIcons name="badge" size={20} color={colors.neutral[600]} />
                <Text style={styles.aboutLabel}>Persona</Text>
                <Text style={styles.aboutValue}>
                  {profile?.persona ? `${profile.persona.charAt(0).toUpperCase() + profile.persona.slice(1)}` : 'Not set'}
                </Text>
              </View>
              <View style={styles.aboutRow}>
                <MaterialIcons name="calendar-today" size={20} color={colors.neutral[600]} />
                <Text style={styles.aboutLabel}>Joined</Text>
                <Text style={styles.aboutValue}>
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </Text>
              </View>
              {profile?.bio && (
                <View style={styles.aboutBioRow}>
                  <MaterialIcons name="info" size={20} color={colors.neutral[600]} />
                  <Text style={styles.aboutLabel}>Bio</Text>
                  <Text style={styles.aboutBioValue}>{profile.bio}</Text>
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Learning Stats */}
        {profile && (profile.modules_completed || profile.lessons_completed) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning Progress</Text>
            <View style={styles.learningStatsGrid}>
              <View style={styles.learningStatCard}>
                <MaterialIcons name="school" size={32} color={colors.primary[500]} />
                <Text style={styles.learningStatValue}>{profile.modules_completed || 0}</Text>
                <Text style={styles.learningStatLabel}>Modules</Text>
              </View>
              <View style={styles.learningStatCard}>
                <MaterialIcons name="book" size={32} color={colors.success[500]} />
                <Text style={styles.learningStatValue}>{profile.lessons_completed || 0}</Text>
                <Text style={styles.learningStatLabel}>Lessons</Text>
              </View>
              <View style={styles.learningStatCard}>
                <MaterialIcons name="quiz" size={32} color={colors.warning[500]} />
                <Text style={styles.learningStatValue}>{profile.quizzes_passed || 0}</Text>
                <Text style={styles.learningStatLabel}>Quizzes</Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    padding: 4,
  },
  username: {
    fontSize: 22,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral[900],
  },
  headerSpacer: {
    width: 32,
  },
  section: {
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.styles.h4,
    marginBottom: spacing.lg,
  },

  // Profile Card
  profileCard: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.lg,
  },
  profileGradient: {
    padding: spacing['2xl'],
  },
  profileContent: {
    gap: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: typography.fontWeights.black as any,
    color: '#FFFFFF',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.warning[500],
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  levelText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.black as any,
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: typography.fontWeights.black as any,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    gap: 4,
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: typography.fontWeights.bold as any,
    color: '#FFFFFF',
  },
  profileLocation: {
    fontSize: 14,
    fontWeight: typography.fontWeights.semibold as any,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  profileBio: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    lineHeight: 18,
  },
  engagementStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: typography.fontWeights.black as any,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold as any,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing['2xl'],
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: typography.fontWeights.bold as any,
    color: '#FFFFFF',
  },

  // Profile Tabs
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    marginBottom: spacing.xl,
  },
  tabsScrollView: {
    paddingHorizontal: spacing['2xl'],
    gap: spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary[600],
  },
  tabText: {
    fontSize: 14,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.neutral[600],
  },
  activeTabText: {
    color: colors.primary[600],
    fontWeight: typography.fontWeights.bold as any,
  },

  // Empty State
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral[900],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center',
  },

  // Achievements Card
  achievementsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementsIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.warning[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  achievementsInfo: {
    flex: 1,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  achievementsMeta: {
    fontSize: 14,
    color: colors.neutral[600],
  },

  // About Card
  aboutCard: {
    gap: spacing.md,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    gap: spacing.md,
  },
  aboutBioRow: {
    flexDirection: 'column',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  aboutLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.neutral[700],
  },
  aboutValue: {
    fontSize: 14,
    color: colors.neutral[900],
  },
  aboutBioValue: {
    fontSize: 14,
    color: colors.neutral[900],
    lineHeight: 20,
    marginLeft: 36,
  },

  // Learning Stats Grid
  learningStatsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  learningStatCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  learningStatValue: {
    fontSize: 24,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral[900],
    marginTop: spacing.sm,
  },
  learningStatLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    marginTop: 4,
  },
});
