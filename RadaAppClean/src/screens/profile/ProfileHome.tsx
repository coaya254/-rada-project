import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  RefreshControl,
  Modal,
  Share,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';

import { BentoCard, Button, Card, LoadingSpinner, ErrorDisplay } from '../../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { ProfileAPIService, UserProfile, UserPost, UserActivity } from '../../services/ProfileAPIService';

const { width } = Dimensions.get('window');

interface ProfileHomeProps {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;
}

const USER_UUID = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d'; // Hardcoded for now

type ProfileTab = 'posts' | 'badges' | 'activities' | 'about';

export const ProfileHome: React.FC<ProfileHomeProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await ProfileAPIService.getUserProfile(USER_UUID);
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
        message: 'Check out my Rada.ke profile! Join me in civic engagement.\n\nDownload Rada.ke: https://rada.ke',
        title: 'Share Profile',
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const loadPosts = async () => {
    if (posts.length > 0) return; // Already loaded
    setPostsLoading(true);
    try {
      const response = await ProfileAPIService.getUserPosts(USER_UUID);
      if (response.success) {
        setPosts(response.posts);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const loadActivities = async () => {
    if (activities.length > 0) return; // Already loaded
    setActivitiesLoading(true);
    try {
      const response = await ProfileAPIService.getUserActivities(USER_UUID);
      if (response.success) {
        setActivities(response.activities);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    if (tab === 'posts') {
      loadPosts();
    } else if (tab === 'activities') {
      loadActivities();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  };

  const menuItems = [
    { icon: 'security', title: 'Privacy', subtitle: 'Data & security settings', onPress: () => console.log('Privacy') },
    { icon: 'tune', title: 'Preferences', subtitle: 'App customization', onPress: () => console.log('Preferences') },
    { icon: 'timeline', title: 'Activity', subtitle: 'Your engagement history', onPress: () => console.log('Activity') },
    { icon: 'help-outline', title: 'Help & Support', subtitle: '24/7 assistance', onPress: () => console.log('Help') },
    { icon: 'settings', title: 'Settings', subtitle: 'General settings', onPress: () => navigation.navigate('Settings') },
  ];

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <LoadingSpinner message="Loading your profile..." />
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
        {/* Header with hamburger menu */}
        <View style={styles.header}>
          <Text style={styles.username}>{profile?.nickname || 'User'}</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <MaterialIcons name="menu" size={28} color={colors.neutral[700]} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.profileCard}>
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

                {/* Action Buttons inside gradient card */}
                <View style={styles.profileActions}>
                  <TouchableOpacity
                    style={styles.profileActionButton}
                    onPress={() => navigation.navigate('EditProfile', {
                      currentProfile: {
                        name: profile?.nickname || '',
                        bio: profile?.bio || '',
                      }
                    })}
                  >
                    <MaterialIcons name="edit" size={18} color="#FFFFFF" />
                    <Text style={styles.profileActionText}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.profileActionButton}
                    onPress={handleShareProfile}
                  >
                    <MaterialIcons name="share" size={18} color="#FFFFFF" />
                    <Text style={styles.profileActionText}>Share Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Profile Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollView}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
              onPress={() => handleTabChange('posts')}
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
              onPress={() => handleTabChange('badges')}
            >
              <MaterialIcons
                name="emoji-events"
                size={20}
                color={activeTab === 'badges' ? colors.primary[600] : colors.neutral[600]}
              />
              <Text style={[styles.tabText, activeTab === 'badges' && styles.activeTabText]}>Badges</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'activities' && styles.activeTab]}
              onPress={() => handleTabChange('activities')}
            >
              <MaterialIcons
                name="timeline"
                size={20}
                color={activeTab === 'activities' ? colors.primary[600] : colors.neutral[600]}
              />
              <Text style={[styles.tabText, activeTab === 'activities' && styles.activeTabText]}>Activities</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'about' && styles.activeTab]}
              onPress={() => handleTabChange('about')}
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
            <Text style={styles.sectionTitle}>My Posts</Text>
            {postsLoading ? (
              <Card style={styles.emptyStateCard}>
                <LoadingSpinner message="Loading posts..." />
              </Card>
            ) : posts.length === 0 ? (
              <Card style={styles.emptyStateCard}>
                <MaterialIcons name="article" size={48} color={colors.neutral[400]} />
                <Text style={styles.emptyStateTitle}>No posts yet</Text>
                <Text style={styles.emptyStateText}>
                  Share your thoughts with the community
                </Text>
              </Card>
            ) : (
              posts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  onPress={() => {
                    // Navigate to Community tab and then to DiscussionDetail
                    const parent = navigation.getParent();
                    if (parent) {
                      parent.navigate('Community', {
                        screen: 'DiscussionDetail',
                        params: {
                          discussionId: post.id,
                          title: post.title,
                          author: post.nickname || 'User',
                          timestamp: formatTimeAgo(post.created_at),
                          replies: post.replies_count,
                          category: post.category,
                        },
                      });
                    }
                  }}
                >
                  <Card style={styles.postCard}>
                    <View style={styles.postHeader}>
                      <View style={styles.postCategory}>
                        <Text style={styles.postCategoryText}>{post.category}</Text>
                      </View>
                      <Text style={styles.postTime}>{formatTimeAgo(post.created_at)}</Text>
                    </View>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>
                    <View style={styles.postStats}>
                      <View style={styles.postStat}>
                        <MaterialIcons name="favorite" size={16} color={colors.neutral[500]} />
                        <Text style={styles.postStatText}>{post.likes_count}</Text>
                      </View>
                      <View style={styles.postStat}>
                        <MaterialIcons name="comment" size={16} color={colors.neutral[500]} />
                        <Text style={styles.postStatText}>{post.replies_count}</Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'badges' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Badges & Achievements</Text>
            {profile?.achievements_earned && profile.achievements_earned > 0 ? (
              <TouchableOpacity
                style={styles.achievementsCard}
                onPress={() => navigation.navigate('Achievements')}
              >
                <View style={styles.achievementsHeader}>
                  <View style={styles.achievementsIcon}>
                    <MaterialIcons name="emoji-events" size={24} color={colors.warning[500]} />
                  </View>
                  <View style={styles.achievementsInfo}>
                    <Text style={styles.achievementsTitle}>View All Achievements</Text>
                    <Text style={styles.achievementsMeta}>
                      {profile.achievements_earned} achievements earned
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colors.neutral[400]} />
                </View>
              </TouchableOpacity>
            ) : (
              <Card style={styles.emptyStateCard}>
                <MaterialIcons name="emoji-events" size={48} color={colors.neutral[400]} />
                <Text style={styles.emptyStateTitle}>No badges yet</Text>
                <Text style={styles.emptyStateText}>
                  Complete lessons and quizzes to earn badges
                </Text>
              </Card>
            )}
          </View>
        )}

        {activeTab === 'activities' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            {activitiesLoading ? (
              <Card style={styles.emptyStateCard}>
                <LoadingSpinner message="Loading activities..." />
              </Card>
            ) : activities.length === 0 ? (
              <Card style={styles.emptyStateCard}>
                <MaterialIcons name="timeline" size={48} color={colors.neutral[400]} />
                <Text style={styles.emptyStateTitle}>No activities yet</Text>
                <Text style={styles.emptyStateText}>
                  Start engaging with the community
                </Text>
              </Card>
            ) : (
              activities.map((activity, index) => {
                const getActivityIcon = (type: string) => {
                  if (type.includes('quiz')) return 'quiz';
                  if (type.includes('discussion')) return 'forum';
                  if (type.includes('reply')) return 'comment';
                  if (type.includes('xp')) return 'star';
                  return 'timeline';
                };
                const getActivityColor = (type: string) => {
                  if (type.includes('quiz')) return colors.success[600];
                  if (type.includes('discussion')) return colors.primary[600];
                  if (type.includes('reply')) return colors.purple[600];
                  return colors.warning[600];
                };

                return (
                  <Card key={`${activity.activity_type}-${index}`} style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <View style={[styles.activityIcon, { backgroundColor: colors.neutral[100] }]}>
                        <MaterialIcons name={getActivityIcon(activity.activity_type)} size={20} color={getActivityColor(activity.activity_type)} />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityTitle}>{activity.action_name}</Text>
                        <Text style={styles.activityMeta}>
                          {activity.points > 0 && `Earned ${activity.points} points • `}
                          {formatTimeAgo(activity.created_at)}
                        </Text>
                      </View>
                      {activity.points > 0 && (
                        <View style={styles.activityBadge}>
                          <Text style={styles.activityBadgeText}>+{activity.points}</Text>
                        </View>
                      )}
                    </View>
                  </Card>
                );
              })
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

      {/* Hamburger Menu Modal */}
      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuModal}>
            <View style={styles.menuHandle} />

            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Settings & More</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.neutral[700]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuContent}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    item.onPress();
                  }}
                >
                  <View style={styles.menuItemIcon}>
                    <MaterialIcons name={item.icon as any} size={24} color={colors.neutral[700]} />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={colors.neutral[400]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  username: {
    fontSize: 22,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral[900],
  },
  menuButton: {
    padding: 4,
  },
  section: {
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.styles.h4,
    marginBottom: spacing.lg,
  },

  // Profile Card (Original Styling)
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
  profileActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  profileActionButton: {
    flex: 1,
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
  profileActionText: {
    fontSize: 14,
    fontWeight: typography.fontWeights.bold as any,
    color: '#FFFFFF',
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

  // Activity
  activityCard: {
    marginBottom: spacing.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral[900],
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 14,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.neutral[500],
  },
  activityBadge: {
    backgroundColor: colors.success[100],
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  activityBadgeText: {
    fontSize: 12,
    fontWeight: typography.fontWeights.black as any,
    color: colors.success[700],
  },

  // Tip Card
  tipCard: {
    backgroundColor: colors.primary[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeights.black as any,
    color: colors.primary[900],
  },
  tipText: {
    ...typography.styles.body,
    color: colors.primary[800],
    lineHeight: 22,
  },

  // Menu Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuModal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    paddingBottom: spacing['2xl'],
    maxHeight: '80%',
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.neutral[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral[900],
  },
  menuContent: {
    paddingTop: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: colors.neutral[600],
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

  // Post Card
  postCard: {
    marginBottom: spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  postCategory: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  postCategoryText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary[700],
    textTransform: 'uppercase',
  },
  postTime: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  postTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  postContent: {
    fontSize: 14,
    color: colors.neutral[700],
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  postStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    fontSize: 13,
    color: colors.neutral[600],
  },

  // Saved Card
  savedCard: {
    marginBottom: spacing.md,
  },
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  savedType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savedTypeText: {
    fontSize: 12,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.primary[600],
    textTransform: 'capitalize',
  },
  savedTime: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  savedContent: {
    fontSize: 14,
    color: colors.neutral[700],
    lineHeight: 20,
  },
});