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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';

import { BentoCard, Button, Card, LoadingSpinner, ErrorDisplay } from '../../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

const { width } = Dimensions.get('window');

interface ProfileHomeProps {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;
}

export const ProfileHome: React.FC<ProfileHomeProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Simulate API call for profile data
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Simulate random error (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('Failed to load profile data. Please try again.');
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 800));
      setRefreshing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
      setRefreshing(false);
    }
  };

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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Your civic engagement dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <MaterialIcons name="settings" size={24} color={colors.neutral[700]} />
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
                      <Text style={styles.avatarText}>JD</Text>
                    </View>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>LVL 12</Text>
                    </View>
                  </View>

                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>John Doe</Text>
                    <View style={styles.profileBadge}>
                      <MaterialIcons name="verified" size={16} color="#FFFFFF" />
                      <Text style={styles.profileBadgeText}>Verified Citizen</Text>
                    </View>
                    <Text style={styles.profileLocation}>📍 Nairobi, Kenya</Text>
                  </View>
                </View>

                {/* Engagement Stats */}
                <View style={styles.engagementStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>2.4K</Text>
                    <Text style={styles.statLabel}>CIVIC POINTS</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>89%</Text>
                    <Text style={styles.statLabel}>ENGAGEMENT</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>156</Text>
                    <Text style={styles.statLabel}>STREAK DAYS</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Profile Features - Bento Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>

          <View style={styles.bentoGrid}>
            <BentoCard
              title="Achievements"
              subtitle="Badges & milestones earned"
              icon="emoji-events"
              gradientColors={colors.gradients.warning}
              stats={{ main: "23", sub: "badges" }}
              onPress={() => navigation.navigate('Achievements')}
              size="large"
            />

            <BentoCard
              title="Privacy"
              subtitle="Data & security settings"
              icon="security"
              gradientColors={colors.gradients.primary}
              stats={{ main: "✓", sub: "secure" }}
              onPress={() => console.log('Privacy pressed')}
            />

            <BentoCard
              title="Preferences"
              subtitle="App customization"
              icon="tune"
              gradientColors={colors.gradients.success}
              stats={{ main: "5", sub: "set" }}
              onPress={() => console.log('Preferences pressed')}
            />

            <BentoCard
              title="Activity"
              subtitle="Your engagement history"
              icon="timeline"
              gradientColors={colors.gradients.error}
              stats={{ main: "342", sub: "actions" }}
              onPress={() => console.log('Activity pressed')}
            />

            <BentoCard
              title="Help"
              subtitle="Support & feedback"
              icon="help-outline"
              gradientColors={[colors.neutral[600], colors.neutral[700]]}
              stats={{ main: "24/7", sub: "support" }}
              onPress={() => console.log('Help pressed')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          <Card style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={styles.activityIcon}>
                <MaterialIcons name="quiz" size={20} color={colors.success[600]} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Completed Constitutional Law Quiz</Text>
                <Text style={styles.activityMeta}>Earned 150 points • 2 hours ago</Text>
              </View>
              <View style={styles.activityBadge}>
                <Text style={styles.activityBadgeText}>+150</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={styles.activityIcon}>
                <MaterialIcons name="forum" size={20} color={colors.primary[600]} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Posted in Electoral Reform Discussion</Text>
                <Text style={styles.activityMeta}>12 replies received • Yesterday</Text>
              </View>
              <View style={styles.activityBadge}>
                <Text style={styles.activityBadgeText}>+50</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={styles.activityIcon}>
                <MaterialIcons name="how-to-vote" size={20} color={colors.purple[600]} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Participated in Community Poll</Text>
                <Text style={styles.activityMeta}>Voice heard on local issues • 2 days ago</Text>
              </View>
              <View style={styles.activityBadge}>
                <Text style={styles.activityBadgeText}>+25</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Button
            title="Edit Profile"
            icon="edit"
            onPress={() => console.log('Edit Profile pressed')}
            variant="primary"
            size="large"
            style={styles.actionButton}
          />

          <Button
            title="Share Profile"
            icon="share"
            onPress={() => console.log('Share pressed')}
            variant="secondary"
            size="large"
            style={styles.actionButton}
          />

          <Card style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <View style={styles.tipIcon}>
                <MaterialIcons name="trending-up" size={20} color={colors.primary[600]} />
              </View>
              <Text style={styles.tipTitle}>Level Up</Text>
            </View>
            <Text style={styles.tipText}>
              You're 340 points away from Level 13! Complete learning modules and
              participate in discussions to earn more civic engagement points.
            </Text>
          </Card>
        </View>
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
    paddingVertical: spacing.xl,
  },
  headerTitle: {
    ...typography.styles.h2,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...typography.styles.bodySmall,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
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

  // Bento Grid
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
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

  // Actions
  actionButton: {
    marginBottom: spacing.md,
  },
  tipCard: {
    backgroundColor: colors.primary[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
    marginTop: spacing.lg,
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
});