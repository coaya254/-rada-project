import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BentoCard, Button, Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

const { width } = Dimensions.get('window');

export const CommunityHome: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Community</Text>
            <Text style={styles.headerSubtitle}>Connect, discuss, and engage with others</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialIcons name="notifications" size={24} color={colors.neutral[700]} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Card */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.statsCard}>
            <LinearGradient
              colors={colors.gradients.success}
              style={styles.statsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statsContent}>
                <Text style={styles.statsTitle}>Your Community Impact</Text>
                <Text style={styles.statsSubtitle}>Active member since joining</Text>

                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>156</Text>
                    <Text style={styles.statLabel}>POSTS</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>89</Text>
                    <Text style={styles.statLabel}>REPLIES</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>324</Text>
                    <Text style={styles.statLabel}>LIKES</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Community Features - Bento Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Features</Text>

          <View style={styles.bentoGrid}>
            <BentoCard
              title="Discussions"
              subtitle="Join ongoing conversations"
              icon="forum"
              gradientColors={colors.gradients.primary}
              stats={{ main: "42", sub: "active" }}
              onPress={() => console.log('Discussions pressed')}
              size="large"
            />

            <BentoCard
              title="Events"
              subtitle="Town halls & meetups"
              icon="event"
              gradientColors={colors.gradients.warning}
              stats={{ main: "8", sub: "upcoming" }}
              onPress={() => console.log('Events pressed')}
            />

            <BentoCard
              title="Groups"
              subtitle="Interest-based communities"
              icon="group"
              gradientColors={colors.gradients.purple}
              stats={{ main: "15", sub: "joined" }}
              onPress={() => console.log('Groups pressed')}
            />

            <BentoCard
              title="Polls"
              subtitle="Voice your opinion"
              icon="poll"
              gradientColors={colors.gradients.error}
              stats={{ main: "6", sub: "active" }}
              onPress={() => console.log('Polls pressed')}
            />

            <BentoCard
              title="News Feed"
              subtitle="Latest community updates"
              icon="rss-feed"
              gradientColors={[colors.success[600], colors.success[700]]}
              stats={{ main: "24", sub: "new" }}
              onPress={() => console.log('News Feed pressed')}
            />
          </View>
        </View>

        {/* Trending Discussions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Discussions</Text>

          <Card style={styles.discussionCard}>
            <View style={styles.discussionHeader}>
              <View style={styles.discussionIcon}>
                <MaterialIcons name="trending-up" size={20} color={colors.error[600]} />
              </View>
              <View style={styles.discussionInfo}>
                <Text style={styles.discussionTitle}>Electoral Reform Proposals</Text>
                <Text style={styles.discussionMeta}>89 replies • 2.3k views • Active now</Text>
              </View>
              <View style={styles.discussionStats}>
                <MaterialIcons name="favorite" size={16} color={colors.error[500]} />
                <Text style={styles.discussionLikes}>156</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.discussionCard}>
            <View style={styles.discussionHeader}>
              <View style={styles.discussionIcon}>
                <MaterialIcons name="local-fire-department" size={20} color={colors.warning[600]} />
              </View>
              <View style={styles.discussionInfo}>
                <Text style={styles.discussionTitle}>Local Government Transparency</Text>
                <Text style={styles.discussionMeta}>67 replies • 1.8k views • 2 hours ago</Text>
              </View>
              <View style={styles.discussionStats}>
                <MaterialIcons name="favorite" size={16} color={colors.error[500]} />
                <Text style={styles.discussionLikes}>98</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.discussionCard}>
            <View style={styles.discussionHeader}>
              <View style={styles.discussionIcon}>
                <MaterialIcons name="star" size={20} color={colors.primary[600]} />
              </View>
              <View style={styles.discussionInfo}>
                <Text style={styles.discussionTitle}>Youth Voter Engagement Strategies</Text>
                <Text style={styles.discussionMeta}>34 replies • 892 views • 5 hours ago</Text>
              </View>
              <View style={styles.discussionStats}>
                <MaterialIcons name="favorite" size={16} color={colors.error[500]} />
                <Text style={styles.discussionLikes}>72</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Button
            title="Start New Discussion"
            icon="add-circle"
            onPress={() => console.log('New Discussion pressed')}
            variant="primary"
            size="large"
            style={styles.actionButton}
          />

          <Card style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <View style={styles.tipIcon}>
                <MaterialIcons name="tips-and-updates" size={20} color={colors.success[600]} />
              </View>
              <Text style={styles.tipTitle}>Community Guidelines</Text>
            </View>
            <Text style={styles.tipText}>
              Keep discussions respectful and fact-based. Share sources when making claims
              and engage constructively with different viewpoints.
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
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error[500],
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold as any,
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.styles.h4,
    marginBottom: spacing.lg,
  },

  // Stats Card
  statsCard: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.lg,
  },
  statsGradient: {
    padding: spacing['2xl'],
  },
  statsContent: {
    gap: spacing.lg,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: typography.fontWeights.black as any,
    color: '#FFFFFF',
  },
  statsSubtitle: {
    fontSize: 16,
    fontWeight: typography.fontWeights.semibold as any,
    color: 'rgba(255,255,255,0.9)',
  },
  statsGrid: {
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

  // Discussions
  discussionCard: {
    marginBottom: spacing.md,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discussionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  discussionInfo: {
    flex: 1,
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral[900],
    marginBottom: 4,
  },
  discussionMeta: {
    fontSize: 14,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.neutral[500],
  },
  discussionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discussionLikes: {
    fontSize: 14,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.error[500],
  },

  // Actions
  actionButton: {
    marginBottom: spacing.lg,
  },
  tipCard: {
    backgroundColor: colors.success[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.success[500],
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
    backgroundColor: colors.success[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeights.black as any,
    color: colors.success[900],
  },
  tipText: {
    ...typography.styles.body,
    color: colors.success[800],
    lineHeight: 22,
  },
});