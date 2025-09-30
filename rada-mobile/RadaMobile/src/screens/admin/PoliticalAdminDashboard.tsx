import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface AdminFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string[];
  screen: string;
  stats: {
    total: number;
    recent: number;
    pending: number;
  };
}

interface PoliticalAdminDashboardProps {
  onClose?: () => void;
}

const PoliticalAdminDashboard: React.FC<PoliticalAdminDashboardProps> = ({ onClose }) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  // Political Content Management Features
  const adminFeatures: AdminFeature[] = [
    {
      id: 'politicians',
      title: 'Politician Management',
      description: 'Manage politician profiles, information, and data',
      icon: 'people',
      color: ['#667eea', '#764ba2'],
      screen: 'PoliticianManagementForm',
      stats: { total: 15, recent: 3, pending: 1 },
    },
    {
      id: 'voting_records',
      title: 'Voting Records',
      description: 'Track and manage parliamentary voting records',
      icon: 'checkmark-circle',
      color: ['#f093fb', '#f5576c'],
      screen: 'VotingRecordsManagementForm',
      stats: { total: 245, recent: 12, pending: 5 },
    },
    {
      id: 'commitments',
      title: 'Government Commitments',
      description: 'Monitor and track government promises and commitments',
      icon: 'document-text',
      color: ['#4facfe', '#00f2fe'],
      screen: 'CommitmentsManagementForm',
      stats: { total: 89, recent: 8, pending: 15 },
    },
    {
      id: 'news',
      title: 'News Management',
      description: 'Curate and manage political news articles',
      icon: 'newspaper',
      color: ['#43e97b', '#38f9d7'],
      screen: 'NewsManagementForm',
      stats: { total: 156, recent: 24, pending: 7 },
    },
    {
      id: 'analytics',
      title: 'Analytics Data',
      description: 'Manage performance metrics and analytics data',
      icon: 'analytics',
      color: ['#fa709a', '#fee140'],
      screen: 'AnalyticsManagementForm',
      stats: { total: 78, recent: 6, pending: 2 },
    },
    {
      id: 'comparisons',
      title: 'Comparison Tools',
      description: 'Create and manage politician comparison data',
      icon: 'git-compare',
      color: ['#a8edea', '#fed6e3'],
      screen: 'ComparisonManagementForm',
      stats: { total: 12, recent: 2, pending: 0 },
    },
    {
      id: 'documents',
      title: 'Documents Management',
      description: 'Manage political documents, policies, and speeches',
      icon: 'folder',
      color: ['#ffecd2', '#fcb69f'],
      screen: 'DocumentsManagementForm',
      stats: { total: 67, recent: 5, pending: 3 },
    },
    {
      id: 'timeline',
      title: 'Timeline Management',
      description: 'Create and manage politician timeline events',
      icon: 'time',
      color: ['#a8c0ff', '#3f2b96'],
      screen: 'TimelineManagementForm',
      stats: { total: 134, recent: 8, pending: 4 },
    },
  ];

  const handleFeaturePress = (feature: AdminFeature) => {
    Alert.alert(
      'Feature Coming Soon',
      `${feature.title} management form will be available soon.`,
      [{ text: 'OK' }]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Dashboard data refreshed');
    }, 1000);
  };

  const renderFeatureCard = (feature: AdminFeature) => (
    <TouchableOpacity
      key={feature.id}
      style={styles.featureCard}
      onPress={() => handleFeaturePress(feature)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={feature.color}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name={feature.icon as any} size={24} color="#fff" />
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>Total: {feature.stats.total}</Text>
              <Text style={styles.statsText}>Recent: {feature.stats.recent}</Text>
              {feature.stats.pending > 0 && (
                <Text style={styles.pendingText}>Pending: {feature.stats.pending}</Text>
              )}
            </View>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardDescription}>{feature.description}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.actionText}>Tap to manage</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <Text style={styles.sectionTitle}>Quick Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>15</Text>
          <Text style={styles.statLabel}>Politicians</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>245</Text>
          <Text style={styles.statLabel}>Voting Records</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>89</Text>
          <Text style={styles.statLabel}>Commitments</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>156</Text>
          <Text style={styles.statLabel}>News Articles</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Political Content Management</Text>
            <Text style={styles.headerSubtitle}>Manage all content for the Politics tab</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
            {onClose && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <TouchableOpacity onPress={handleRefresh}>
            <Text style={styles.refreshText}>Pull to refresh</Text>
          </TouchableOpacity>
        }
      >
        {renderQuickStats()}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Content Management</Text>
          <View style={styles.featuresGrid}>
            {adminFeatures.map(renderFeatureCard)}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  refreshButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  refreshText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 10,
  },
  quickStatsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    borderRadius: 16,
    elevation: 4,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  pendingText: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default PoliticalAdminDashboard;