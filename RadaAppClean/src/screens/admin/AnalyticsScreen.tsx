import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  overview: {
    totalPoliticians: number;
    totalCommitments: number;
    totalVotingRecords: number;
    totalDocuments: number;
    totalTimelineEvents: number;
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    mostViewedPoliticians: Array<{
      name: string;
      views: number;
      percentage: number;
    }>;
  };
  content: {
    recentlyAdded: {
      politicians: number;
      commitments: number;
      documents: number;
      timeline: number;
    };
    qualityMetrics: {
      completedProfiles: number;
      profilesWithImages: number;
      sourcedCommitments: number;
      verifiedDocuments: number;
    };
  };
  performance: {
    apiResponseTime: number;
    uptime: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

const initialAnalytics: AnalyticsData = {
  overview: {
    totalPoliticians: 245,
    totalCommitments: 1423,
    totalVotingRecords: 3567,
    totalDocuments: 892,
    totalTimelineEvents: 2156,
  },
  engagement: {
    dailyActiveUsers: 2847,
    weeklyActiveUsers: 12456,
    monthlyActiveUsers: 45623,
    averageSessionDuration: 8.5,
    mostViewedPoliticians: [
      { name: 'William Ruto', views: 15420, percentage: 18.2 },
      { name: 'Raila Odinga', views: 12890, percentage: 15.3 },
      { name: 'Uhuru Kenyatta', views: 11234, percentage: 13.4 },
      { name: 'Martha Karua', views: 9876, percentage: 11.7 },
      { name: 'Kalonzo Musyoka', views: 8543, percentage: 10.1 },
    ],
  },
  content: {
    recentlyAdded: {
      politicians: 12,
      commitments: 45,
      documents: 23,
      timeline: 67,
    },
    qualityMetrics: {
      completedProfiles: 89,
      profilesWithImages: 76,
      sourcedCommitments: 92,
      verifiedDocuments: 88,
    },
  },
  performance: {
    apiResponseTime: 245,
    uptime: 99.8,
    errorRate: 0.12,
    cacheHitRate: 94.5,
  },
};

export const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { hasPermission } = useAdminAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>(initialAnalytics);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const adminAPI = (await import('../../services/AdminAPIService')).default;
      const response = await adminAPI.getAnalytics(selectedPeriod);

      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        Alert.alert('Error', response.error || 'Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
    icon: string;
    trend?: { value: number; isPositive: boolean };
  }> = ({ title, value, subtitle, color, icon, trend }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={styles.statValue}>{value}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
      </View>
      {trend && (
        <View style={styles.trendContainer}>
          <Ionicons
            name={trend.isPositive ? 'trending-up' : 'trending-down'}
            size={16}
            color={trend.isPositive ? '#22C55E' : '#EF4444'}
          />
          <Text
            style={[
              styles.trendText,
              { color: trend.isPositive ? '#22C55E' : '#EF4444' },
            ]}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </Text>
        </View>
      )}
    </View>
  );

  const ProgressBar: React.FC<{
    label: string;
    value: number;
    total: number;
    color: string;
  }> = ({ label, value, total, color }) => {
    const percentage = Math.round((value / total) * 100);

    return (
      <View style={styles.progressItem}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressValue}>{percentage}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${percentage}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  const exportReport = async () => {
    if (!hasPermission('analytics', 'export')) {
      Alert.alert('Permission Denied', 'You do not have permission to export reports');
      return;
    }

    Alert.alert(
      'Export Report',
      'This would generate a detailed analytics report for the selected period.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export PDF', onPress: () => console.log('Exporting PDF...') },
        { text: 'Export CSV', onPress: () => console.log('Exporting CSV...') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Analytics Dashboard</Text>
            <Text style={styles.headerSubtitle}>Comprehensive platform insights</Text>
          </View>
          <TouchableOpacity onPress={exportReport} style={styles.exportButton}>
            <Ionicons name="download-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.periodSelector}>
          {(['7d', '30d', '90d'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadAnalytics}
            colors={['#667eea']}
          />
        }
      >
        {/* Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Politicians"
              value={analytics.overview.totalPoliticians}
              color="#3B82F6"
              icon="people"
              trend={{ value: 8.2, isPositive: true }}
            />
            <StatCard
              title="Commitments"
              value={analytics.overview.totalCommitments}
              color="#10B981"
              icon="checkmark-circle"
              trend={{ value: 12.5, isPositive: true }}
            />
            <StatCard
              title="Voting Records"
              value={analytics.overview.totalVotingRecords}
              color="#F59E0B"
              icon="ballot"
              trend={{ value: 5.3, isPositive: true }}
            />
            <StatCard
              title="Documents"
              value={analytics.overview.totalDocuments}
              color="#8B5CF6"
              icon="document-text"
              trend={{ value: 15.7, isPositive: true }}
            />
          </View>
        </View>

        {/* User Engagement Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Engagement</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Daily Active Users"
              value={analytics.engagement.dailyActiveUsers.toLocaleString()}
              color="#EF4444"
              icon="person"
              trend={{ value: 3.2, isPositive: true }}
            />
            <StatCard
              title="Weekly Active Users"
              value={analytics.engagement.weeklyActiveUsers.toLocaleString()}
              color="#06B6D4"
              icon="people"
              trend={{ value: 7.8, isPositive: true }}
            />
            <StatCard
              title="Monthly Active Users"
              value={analytics.engagement.monthlyActiveUsers.toLocaleString()}
              color="#84CC16"
              icon="globe"
              trend={{ value: 11.4, isPositive: true }}
            />
            <StatCard
              title="Avg Session Time"
              value={`${analytics.engagement.averageSessionDuration} min`}
              color="#F97316"
              icon="time"
              trend={{ value: 4.6, isPositive: true }}
            />
          </View>
        </View>

        {/* Most Viewed Politicians */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Viewed Politicians</Text>
          <View style={styles.viewsContainer}>
            {analytics.engagement.mostViewedPoliticians.map((politician, index) => (
              <View key={politician.name} style={styles.viewsItem}>
                <View style={styles.viewsRank}>
                  <Text style={styles.viewsRankText}>{index + 1}</Text>
                </View>
                <View style={styles.viewsInfo}>
                  <Text style={styles.viewsName}>{politician.name}</Text>
                  <Text style={styles.viewsCount}>{politician.views.toLocaleString()} views</Text>
                </View>
                <View style={styles.viewsPercentage}>
                  <Text style={styles.viewsPercentageText}>{politician.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Content Quality Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Quality Metrics</Text>
          <View style={styles.qualityContainer}>
            <ProgressBar
              label="Completed Profiles"
              value={analytics.content.qualityMetrics.completedProfiles}
              total={100}
              color="#22C55E"
            />
            <ProgressBar
              label="Profiles with Images"
              value={analytics.content.qualityMetrics.profilesWithImages}
              total={100}
              color="#3B82F6"
            />
            <ProgressBar
              label="Sourced Commitments"
              value={analytics.content.qualityMetrics.sourcedCommitments}
              total={100}
              color="#F59E0B"
            />
            <ProgressBar
              label="Verified Documents"
              value={analytics.content.qualityMetrics.verifiedDocuments}
              total={100}
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity (Last {selectedPeriod})</Text>
          <View style={styles.activityContainer}>
            <View style={styles.activityItem}>
              <Ionicons name="person-add" size={20} color="#3B82F6" />
              <Text style={styles.activityText}>
                {analytics.content.recentlyAdded.politicians} new politicians added
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="bookmark" size={20} color="#10B981" />
              <Text style={styles.activityText}>
                {analytics.content.recentlyAdded.commitments} commitments tracked
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="document" size={20} color="#8B5CF6" />
              <Text style={styles.activityText}>
                {analytics.content.recentlyAdded.documents} documents archived
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="time" size={20} color="#F59E0B" />
              <Text style={styles.activityText}>
                {analytics.content.recentlyAdded.timeline} timeline events recorded
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Performance</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceValue}>{analytics.performance.apiResponseTime}ms</Text>
              <Text style={styles.performanceLabel}>API Response Time</Text>
              <View style={[styles.performanceIndicator, { backgroundColor: '#22C55E' }]} />
            </View>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceValue}>{analytics.performance.uptime}%</Text>
              <Text style={styles.performanceLabel}>System Uptime</Text>
              <View style={[styles.performanceIndicator, { backgroundColor: '#22C55E' }]} />
            </View>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceValue}>{analytics.performance.errorRate}%</Text>
              <Text style={styles.performanceLabel}>Error Rate</Text>
              <View style={[styles.performanceIndicator, { backgroundColor: '#F59E0B' }]} />
            </View>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceValue}>{analytics.performance.cacheHitRate}%</Text>
              <Text style={styles.performanceLabel}>Cache Hit Rate</Text>
              <View style={[styles.performanceIndicator, { backgroundColor: '#22C55E' }]} />
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  exportButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: 'white',
  },
  periodButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    width: (width - 56) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  viewsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  viewsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  viewsRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  viewsRankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  viewsInfo: {
    flex: 1,
  },
  viewsName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewsCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  viewsPercentage: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  viewsPercentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  qualityContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  activityContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  performanceCard: {
    width: (width - 56) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  performanceIndicator: {
    width: 20,
    height: 4,
    borderRadius: 2,
  },
  bottomPadding: {
    height: 40,
  },
});