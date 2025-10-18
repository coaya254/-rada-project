import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import adminAPI from '../../services/AdminAPIService';

interface PoliticsAdminScreenProps {
  navigation: NativeStackNavigationProp<any, 'PoliticsAdmin'>;
}

export const PoliticsAdminScreen: React.FC<PoliticsAdminScreenProps> = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalPoliticians: 0,
    pendingReviews: 0,
    draftEntries: 0,
    totalTimelineEvents: 0,
    totalCommitments: 0,
    totalVotingRecords: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadStatistics();
    loadRecentActivity();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStatistics();

      if (response.success && response.data) {
        setStats(response.data);
      } else if (response.error) {
        console.error('Error loading statistics:', response.error);
        Alert.alert('Error', 'Failed to load statistics. Using default values.');
      }
    } catch (error) {
      console.error('Exception loading statistics:', error);
      Alert.alert('Error', 'An error occurred while loading statistics.');
    } finally {
      setLoading(false);
    }
  };

  const adminTools = [
    {
      id: 'add_politician',
      title: 'Add Politician',
      description: 'Create new politician profile',
      icon: 'person-add' as keyof typeof MaterialIcons.glyphMap,
      colors: ['#3B82F6', '#1E40AF'],
      action: () => navigation.navigate('CreatePolitician'),
    },
    {
      id: 'manage_politicians',
      title: 'Manage Politicians',
      description: 'Edit existing profiles',
      icon: 'people' as keyof typeof MaterialIcons.glyphMap,
      colors: ['#10B981', '#059669'],
      action: () => navigation.navigate('ManagePoliticians'),
    },
    {
      id: 'timeline_events',
      title: 'Timeline Events',
      description: 'Add career milestones',
      icon: 'timeline' as keyof typeof MaterialIcons.glyphMap,
      colors: ['#8B5CF6', '#7C3AED'],
      action: () => navigation.navigate('PoliticianSelector', {
        targetScreen: 'TimelineEvents',
        title: 'Timeline Events',
        allowViewAll: true,
      }),
    },
    {
      id: 'commitments',
      title: 'Track Commitments',
      description: 'Manage promise tracking',
      icon: 'assignment-turned-in' as keyof typeof MaterialIcons.glyphMap,
      colors: ['#F59E0B', '#D97706'],
      action: () => navigation.navigate('PoliticianSelector', {
        targetScreen: 'CommitmentTracking',
        title: 'Commitment Tracking',
        allowViewAll: true,
      }),
    },
    {
      id: 'voting_records',
      title: 'Voting Records',
      description: 'Import parliamentary votes',
      icon: 'how-to-vote' as keyof typeof MaterialIcons.glyphMap,
      colors: ['#EF4444', '#DC2626'],
      action: () => navigation.navigate('PoliticianSelector', {
        targetScreen: 'VotingRecordsAdmin',
        title: 'Voting Records',
        allowViewAll: true,
      }),
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Manage speeches & policies',
      icon: 'description' as keyof typeof MaterialIcons.glyphMap,
      colors: ['#6366F1', '#4F46E5'],
      action: () => navigation.navigate('PoliticianSelector', {
        targetScreen: 'DocumentManagement',
        title: 'Document Management',
        allowViewAll: true,
      }),
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Platform insights & metrics',
      icon: 'analytics' as keyof typeof MaterialIcons.glyphMap,
      colors: ['#06B6D4', '#0891B2'],
      action: () => navigation.navigate('Analytics'),
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generate detailed reports',
      icon: 'assessment' as keyof typeof MaterialIcons.glyphMap,
      colors: ['#84CC16', '#65A30D'],
      action: () => navigation.navigate('Reports'),
    },
    {
      id: 'news',
      title: 'News Management',
      description: 'Manage news articles & updates',
      icon: 'article' as keyof typeof MaterialIcons.glyphMap,
      colors: ['#F59E0B', '#D97706'],
      action: () => navigation.navigate('NewsManagement'),
    },
    {
      id: 'career',
      title: 'Career Management',
      description: 'Manage education & achievements',
      icon: 'school' as keyof typeof MaterialIcons.glyphMap,
      colors: ['#EC4899', '#DB2777'],
      action: () => navigation.navigate('PoliticianSelector', {
        targetScreen: 'CareerManagement',
        title: 'Career Management',
        allowViewAll: false,
      }),
    },
  ];

  const loadRecentActivity = async () => {
    try {
      const response = await adminAPI.getRecentActivity(10);
      if (response.success && response.data) {
        setRecentActivity(response.data);
      }
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const formatActivityAction = (activity: any) => {
    const entityTypeMap: Record<string, string> = {
      'politician': 'politician',
      'timeline_event': 'timeline event',
      'commitment': 'commitment',
      'voting_record': 'voting record',
      'document': 'document'
    };

    const actionMap: Record<string, string> = {
      'CREATE': 'Added',
      'UPDATE': 'Updated',
      'DELETE': 'Deleted',
      'PUBLISH': 'Published',
      'UNPUBLISH': 'Unpublished',
      'BULK_IMPORT': 'Imported'
    };

    const action = actionMap[activity.action] || activity.action;
    const entityType = entityTypeMap[activity.entity_type] || activity.entity_type;
    const entityName = activity.entity_name || `#${activity.entity_id}`;

    return `${action} ${entityType}: ${entityName}`;
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const renderStatCard = (title: string, value: number, icon: string, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={24} color={color} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderToolCard = (tool: typeof adminTools[0]) => (
    <TouchableOpacity
      key={tool.id}
      style={styles.toolCard}
      onPress={tool.action}
    >
      <LinearGradient
        colors={tool.colors}
        style={styles.toolGradient}
      >
        <MaterialIcons name={tool.icon} size={32} color="#FFFFFF" />
        <Text style={styles.toolTitle}>{tool.title}</Text>
        <Text style={styles.toolDescription}>{tool.description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'timeline':
      case 'timeline_event': return 'timeline';
      case 'commitment': return 'assignment-turned-in';
      case 'voting':
      case 'voting_record': return 'how-to-vote';
      case 'politician': return 'person-add';
      case 'document': return 'description';
      default: return 'info';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'timeline':
      case 'timeline_event': return '#8B5CF6';
      case 'commitment': return '#F59E0B';
      case 'voting':
      case 'voting_record': return '#EF4444';
      case 'politician': return '#3B82F6';
      case 'document': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Politics Admin</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <MaterialIcons name="settings" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Overview Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading statistics...</Text>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              {renderStatCard('Politicians', stats.totalPoliticians, 'people', '#3B82F6')}
              {renderStatCard('Pending Reviews', stats.pendingReviews, 'pending', '#F59E0B')}
              {renderStatCard('Draft Entries', stats.draftEntries, 'drafts', '#6B7280')}
              {renderStatCard('Timeline Events', stats.totalTimelineEvents, 'timeline', '#8B5CF6')}
              {renderStatCard('Commitments', stats.totalCommitments, 'assignment-turned-in', '#10B981')}
              {renderStatCard('Voting Records', stats.totalVotingRecords, 'how-to-vote', '#EF4444')}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.toolsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.toolsGrid}>
            {adminTools.map(renderToolCard)}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.entity_type) + '20' }]}>
                  <MaterialIcons
                    name={getActivityIcon(activity.entity_type) as keyof typeof MaterialIcons.glyphMap}
                    size={16}
                    color={getActivityColor(activity.entity_type)}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityAction}>{formatActivityAction(activity)}</Text>
                  <Text style={styles.activityTime}>{formatRelativeTime(activity.created_at)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Data Integrity Check */}
        <View style={styles.integritySection}>
          <Text style={styles.sectionTitle}>Data Integrity</Text>
          <TouchableOpacity
            style={styles.integrityCard}
            onPress={() => navigation.navigate('DataIntegrity')}
          >
            <View style={styles.integrityHeader}>
              <MaterialIcons name="verified" size={24} color="#10B981" />
              <Text style={styles.integrityTitle}>System Health: Good</Text>
            </View>
            <Text style={styles.integrityDescription}>
              All politician profiles have verified sources. 3 pending fact-checks.
            </Text>
            <TouchableOpacity style={styles.integrityButton}>
              <Text style={styles.integrityButtonText}>View Full Report</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  toolsSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  toolCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toolGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  toolDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  activitySection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  integritySection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  integrityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  integrityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  integrityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  integrityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  integrityButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  integrityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});