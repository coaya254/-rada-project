import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ShareButton from '../components/ShareButton';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  totalPoliticians: number;
  partyDistribution: {
    party: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  positionDistribution: {
    position: string;
    count: number;
    percentage: number;
  }[];
  genderDistribution: {
    gender: string;
    count: number;
    percentage: number;
  }[];
  educationLevels: {
    level: string;
    count: number;
    percentage: number;
  }[];
  experienceRanges: {
    range: string;
    count: number;
    percentage: number;
  }[];
  topPerformers: {
    name: string;
    achievements: number;
    position: string;
    party: string;
  }[];
  recentActivity: {
    politician: string;
    action: string;
    date: string;
    type: 'election' | 'appointment' | 'policy' | 'speech';
  }[];
}

const PoliticalAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe]);

  const loadAnalyticsData = () => {
    // Sample analytics data - replace with API call
    const sampleData: AnalyticsData = {
      totalPoliticians: 15,
      partyDistribution: [
        { party: 'UDA', count: 6, percentage: 40, color: '#1e40af' },
        { party: 'ODM', count: 4, percentage: 27, color: '#f97316' },
        { party: 'Jubilee', count: 2, percentage: 13, color: '#059669' },
        { party: 'Wiper', count: 2, percentage: 13, color: '#7c3aed' },
        { party: 'Independent', count: 1, percentage: 7, color: '#dc2626' },
      ],
      positionDistribution: [
        { position: 'President', count: 2, percentage: 13 },
        { position: 'Governor', count: 4, percentage: 27 },
        { position: 'MP', count: 3, percentage: 20 },
        { position: 'Senator', count: 2, percentage: 13 },
        { position: 'Other', count: 4, percentage: 27 },
      ],
      genderDistribution: [
        { gender: 'Male', count: 12, percentage: 80 },
        { gender: 'Female', count: 3, percentage: 20 },
      ],
      educationLevels: [
        { level: 'University', count: 12, percentage: 80 },
        { level: 'Postgraduate', count: 8, percentage: 53 },
        { level: 'Self-educated', count: 1, percentage: 7 },
      ],
      experienceRanges: [
        { range: '20+ years', count: 8, percentage: 53 },
        { range: '10-19 years', count: 5, percentage: 33 },
        { range: '5-9 years', count: 2, percentage: 13 },
      ],
      topPerformers: [
        { name: 'William Ruto', achievements: 15, position: 'President', party: 'UDA' },
        { name: 'Raila Odinga', achievements: 12, position: 'Former PM', party: 'ODM' },
        { name: 'Anne Waiguru', achievements: 10, position: 'Governor', party: 'UDA' },
        { name: 'Kivutha Kibwana', achievements: 9, position: 'Former Governor', party: 'Independent' },
      ],
      recentActivity: [
        { politician: 'William Ruto', action: 'Bottom-up Economic Transformation', date: '2024-01-15', type: 'policy' },
        { politician: 'Anne Waiguru', action: 'Anti-Corruption Initiative', date: '2024-01-10', type: 'policy' },
        { politician: 'Raila Odinga', action: 'AU High Representative Speech', date: '2024-01-08', type: 'speech' },
        { politician: 'Musalia Mudavadi', action: 'Prime Cabinet Secretary Appointment', date: '2024-01-05', type: 'appointment' },
      ],
    };

    setAnalyticsData(sampleData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      loadAnalyticsData();
      setRefreshing(false);
    }, 1000);
  };

  const renderStatCard = (title: string, value: string | number, subtitle: string, icon: string, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderDistributionChart = (title: string, data: any[], type: 'party' | 'position' | 'gender') => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.chartContent}>
        {data.map((item, index) => (
          <View key={index} style={styles.chartItem}>
            <View style={styles.chartItemHeader}>
              <View style={[
                styles.chartColorIndicator,
                { backgroundColor: type === 'party' ? item.color : '#6b7280' }
              ]} />
              <Text style={styles.chartItemLabel}>{item.party || item.position || item.gender}</Text>
              <Text style={styles.chartItemValue}>{item.percentage}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${item.percentage}%`,
                    backgroundColor: type === 'party' ? item.color : '#6b7280'
                  }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTopPerformers = () => (
    <View style={styles.performersContainer}>
      <Text style={styles.sectionTitle}>🏆 Top Performers</Text>
      <View style={styles.performersList}>
        {analyticsData?.topPerformers.map((performer, index) => (
          <View key={index} style={styles.performerCard}>
            <View style={styles.performerRank}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            <View style={styles.performerInfo}>
              <Text style={styles.performerName}>{performer.name}</Text>
              <Text style={styles.performerDetails}>
                {performer.position} • {performer.party}
              </Text>
              <Text style={styles.performerAchievements}>
                {performer.achievements} achievements
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRecentActivity = () => (
    <View style={styles.activityContainer}>
      <Text style={styles.sectionTitle}>📈 Recent Activity</Text>
      <View style={styles.activityList}>
        {analyticsData?.recentActivity.map((activity, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>
                {activity.type === 'policy' ? '📋' : 
                 activity.type === 'speech' ? '🎤' : 
                 activity.type === 'appointment' ? '👔' : '🗳️'}
              </Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityPolitician}>{activity.politician}</Text>
              <Text style={styles.activityAction}>{activity.action}</Text>
              <Text style={styles.activityDate}>{activity.date}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  if (!analyticsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>📊 Political Analytics</Text>
          <ShareButton
            data={{
              title: 'Political Analytics Dashboard',
              data: analyticsData,
              insights: [
                `${analyticsData?.totalPoliticians} politicians tracked`,
                `${analyticsData?.partyDistribution[0]?.party} leads with ${analyticsData?.partyDistribution[0]?.percentage}%`,
                `${analyticsData?.genderDistribution[1]?.percentage}% women representation`,
                `${analyticsData?.educationLevels[0]?.percentage}% university educated`,
              ],
            }}
            type="analytics"
            variant="minimal"
            iconSize={20}
            showText={false}
            style={styles.headerShareButton}
          />
        </View>
        <Text style={styles.headerSubtitle}>Comprehensive political insights and statistics</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Timeframe Selector */}
        <View style={styles.timeframeSelector}>
          {[
            { id: 'week', label: 'Week' },
            { id: 'month', label: 'Month' },
            { id: 'quarter', label: 'Quarter' },
            { id: 'year', label: 'Year' },
          ].map((timeframe) => (
            <TouchableOpacity
              key={timeframe.id}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe.id && styles.activeTimeframeButton
              ]}
              onPress={() => setSelectedTimeframe(timeframe.id as any)}
            >
              <Text style={[
                styles.timeframeText,
                selectedTimeframe === timeframe.id && styles.activeTimeframeText
              ]}>
                {timeframe.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Stats */}
        <View style={styles.statsGrid}>
          {renderStatCard(
            'Total Politicians',
            analyticsData.totalPoliticians,
            'Active political figures',
            '👥',
            '#667eea'
          )}
          {renderStatCard(
            'Top Party',
            'UDA',
            '40% of politicians',
            '🔵',
            '#1e40af'
          )}
          {renderStatCard(
            'Women Leaders',
            '3',
            '20% representation',
            '👩',
            '#ec4899'
          )}
          {renderStatCard(
            'University Educated',
            '12',
            '80% have degrees',
            '🎓',
            '#059669'
          )}
        </View>

        {/* Distribution Charts */}
        {renderDistributionChart('Party Distribution', analyticsData.partyDistribution, 'party')}
        {renderDistributionChart('Position Distribution', analyticsData.positionDistribution, 'position')}
        {renderDistributionChart('Gender Distribution', analyticsData.genderDistribution, 'gender')}

        {/* Top Performers */}
        {renderTopPerformers()}

        {/* Recent Activity */}
        {renderRecentActivity()}
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  headerSpacer: {
    flex: 1,
  },
  headerShareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  timeframeSelector: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTimeframeButton: {
    backgroundColor: '#667eea',
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTimeframeText: {
    color: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 50) / 2,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 11,
    color: '#999',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartContent: {
    gap: 12,
  },
  chartItem: {
    marginBottom: 8,
  },
  chartItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  chartItemLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  chartItemValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  performersContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  performersList: {
    gap: 12,
  },
  performerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  performerDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  performerAchievements: {
    fontSize: 11,
    color: '#999',
  },
  activityContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityPolitician: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  activityAction: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 11,
    color: '#999',
  },
});

export default PoliticalAnalyticsScreen;
