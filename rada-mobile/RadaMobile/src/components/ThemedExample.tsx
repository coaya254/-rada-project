import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, StatusBadge, TabNavigation } from './ui';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

// Example screen showing the unified politician-inspired aesthetic
const ThemedExample: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Ionicons name="home" size={16} color={activeTab === 'overview' ? 'white' : theme.colors.text.secondary} /> },
    { id: 'progress', label: 'Progress', icon: <Ionicons name="trending-up" size={16} color={activeTab === 'progress' ? 'white' : theme.colors.text.secondary} /> },
    { id: 'achievements', label: 'Achievements', icon: <Ionicons name="trophy" size={16} color={activeTab === 'achievements' ? 'white' : theme.colors.text.secondary} /> },
  ];

  return (
    <View style={styles.container}>
      {/* Header with teal gradient (politician screen style) */}
      <LinearGradient
        colors={[theme.colors.primary.main, theme.colors.primary.light]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Rada Mobile</Text>
          <Text style={styles.headerSubtitle}>Unified Design System</Text>
        </View>
      </LinearGradient>

      {/* Tab Navigation (politician screen style) */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Cards */}
        <Card style={styles.firstCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Government Promise Tracking</Text>
            <StatusBadge status="completed" />
          </View>
          <Text style={styles.cardDescription}>
            Track and monitor government promises with evidence submission and community verification.
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>Last updated: Today</Text>
            <Button title="View Details" variant="small" onPress={() => {}} />
          </View>
        </Card>

        {/* Learning Module Card */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Civic Education Hub</Text>
            <StatusBadge status="in_progress" text="ACTIVE" />
          </View>
          <Text style={styles.cardDescription}>
            Interactive learning modules with XP rewards, badges, and community engagement features.
          </Text>
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Progress: 67%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '67%' }]} />
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <Card>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.buttonContainer}>
            <Button title="Primary Action" variant="primary" onPress={() => {}} />
            <Button title="Secondary Action" variant="secondary" onPress={() => {}} style={styles.buttonSpacing} />
            <Button title="Outline Action" variant="outline" onPress={() => {}} style={styles.buttonSpacing} />
          </View>
        </Card>

        {/* Stats Section */}
        <Card>
          <Text style={styles.cardTitle}>Community Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2,847</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Promises Tracked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>89%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>
          </View>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            🎨 This demonstrates the unified design system inspired by the politician detail screens
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    ...theme.components.header,
    paddingBottom: theme.spacing.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.white,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  firstCard: {
    marginTop: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  cardDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeights.normal,
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.muted,
  },
  progressSection: {
    marginTop: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.main,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
  },
  buttonSpacing: {
    marginTop: theme.spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border.light,
    marginHorizontal: theme.spacing.md,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing['2xl'],
    alignItems: 'center',
  },
  footerNote: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ThemedExample;