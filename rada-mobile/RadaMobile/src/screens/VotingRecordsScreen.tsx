import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Dimensions,
  Alert} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import VotingRecordsService from '../services/VotingRecordsService';
import { VotingRecord, VotingStats, VotingTrend } from '../types/VotingRecords';
import ShareButton from '../components/ShareButton';

const { width } = Dimensions.get('window');

interface VotingRecordsScreenProps {
  politicianId?: number;
  politicianName?: string;
}

const VotingRecordsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { politicianId, politicianName } = route.params as VotingRecordsScreenProps;
  
  const [votingRecords, setVotingRecords] = useState<VotingRecord[]>([]);
  const [votingStats, setVotingStats] = useState<VotingStats | null>(null);
  const [votingTrends, setVotingTrends] = useState<VotingTrend[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [activeTab, setActiveTab] = useState<'records' | 'stats' | 'trends'>('records');

  useEffect(() => {
    VotingRecordsService.initializeSampleData();
    loadVotingData();
  }, [politicianId]);

  const loadVotingData = async () => {
    if (!politicianId) return;
    
    try {
      const records = VotingRecordsService.getVotingRecords(politicianId);
      const stats = VotingRecordsService.getVotingStats(politicianId);
      const trends = VotingRecordsService.getVotingTrends(politicianId, selectedPeriod);
      
      setVotingRecords(records);
      setVotingStats(stats);
      setVotingTrends(trends);
    } catch (error) {
      console.error('Error loading voting data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVotingData();
    setRefreshing(false);
  };

  const getFilteredRecords = () => {
    if (selectedFilter === 'all') return votingRecords;
    return votingRecords.filter(record => record.category === selectedFilter);
  };

  const getVoteColor = (vote: string) => {
    switch (vote) {
      case 'yes': return '#10b981';
      case 'no': return '#ef4444';
      case 'abstain': return '#f59e0b';
      case 'absent': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getVoteIcon = (vote: string) => {
    switch (vote) {
      case 'yes': return 'checkmark-circle';
      case 'no': return 'close-circle';
      case 'abstain': return 'remove-circle';
      case 'absent': return 'ellipse-outline';
      default: return 'help-circle';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'constitutional': return 'document-text';
      case 'economic': return 'trending-up';
      case 'social': return 'people';
      case 'environmental': return 'leaf';
      case 'security': return 'shield';
      case 'governance': return 'build';
      case 'health': return 'medical';
      case 'education': return 'school';
      default: return 'document';
    }
  };

  const renderVotingRecord = ({ item }: { item: VotingRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleContainer}>
          <Text style={styles.recordTitle} numberOfLines={2}>{item.billTitle}</Text>
          <Text style={styles.billNumber}>{item.billNumber}</Text>
        </View>
        <View style={[styles.voteBadge, { backgroundColor: getVoteColor(item.vote) }]}>
          <Ionicons name={getVoteIcon(item.vote)} size={16} color="white" />
          <Text style={styles.voteText}>{item.vote.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.recordDescription} numberOfLines={3}>
        {item.billDescription}
      </Text>
      
      <View style={styles.recordMeta}>
        <View style={styles.metaItem}>
          <Ionicons name={getCategoryIcon(item.category)} size={14} color="#6b7280" />
          <Text style={styles.metaText}>{item.category.replace('_', ' ').toUpperCase()}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar" size={14} color="#6b7280" />
          <Text style={styles.metaText}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="business" size={14} color="#6b7280" />
          <Text style={styles.metaText}>{item.house.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.recordFooter}>
        <View style={styles.impactContainer}>
          <View style={[styles.impactBadge, { 
            backgroundColor: item.publicImpact === 'high' ? '#fef3c7' : 
                           item.publicImpact === 'medium' ? '#dbeafe' : '#f3f4f6'
          }]}>
            <Text style={[styles.impactText, { 
              color: item.publicImpact === 'high' ? '#d97706' : 
                     item.publicImpact === 'medium' ? '#2563eb' : '#6b7280'
            }]}>
              {item.publicImpact.toUpperCase()} IMPACT
            </Text>
          </View>
          {item.controversyLevel === 'high' && (
            <View style={[styles.controversyBadge, { backgroundColor: '#fee2e2' }]}>
              <Text style={[styles.controversyText, { color: '#dc2626' }]}>CONTROVERSIAL</Text>
            </View>
          )}
        </View>
        
        <ShareButton
          data={{
            name: politicianName || 'Politician',
            position: 'Legislator',
            party: 'Parliament',
            achievements: [item.billTitle],
            summary: `${item.vote.toUpperCase()} vote on ${item.billTitle}`}}
          type="politician"
          variant="minimal"
          iconSize={16}
          showText={false}
          style={styles.recordShareButton}
        />
      </View>
    </View>
  );

  const renderStatsCard = (title: string, value: string | number, subtitle: string, color: string, icon: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderVotingStats = () => {
    if (!votingStats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Voting Statistics</Text>
        
        <View style={styles.statsGrid}>
          {renderStatsCard(
            'Total Votes',
            votingStats.totalVotes,
            'All recorded votes',
            '#667eea',
            'checkmark-circle'
          )}
          {renderStatsCard(
            'Attendance Rate',
            `${votingStats.attendanceRate.toFixed(1)}%`,
            'Vote participation',
            '#10b981',
            'people'
          )}
          {renderStatsCard(
            'Party Loyalty',
            `${votingStats.partyLoyalty.toFixed(1)}%`,
            'Votes with party',
            '#f59e0b',
            'flag'
          )}
          {renderStatsCard(
            'Independence Score',
            `${votingStats.independenceScore.toFixed(1)}%`,
            'Independent voting',
            '#8b5cf6',
            'star'
          )}
        </View>

        <View style={styles.detailedStats}>
          <Text style={styles.subsectionTitle}>Vote Breakdown</Text>
          <View style={styles.voteBreakdown}>
            <View style={styles.voteItem}>
              <View style={[styles.voteIndicator, { backgroundColor: '#10b981' }]} />
              <Text style={styles.voteLabel}>Yes: {votingStats.yesVotes}</Text>
            </View>
            <View style={styles.voteItem}>
              <View style={[styles.voteIndicator, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.voteLabel}>No: {votingStats.noVotes}</Text>
            </View>
            <View style={styles.voteItem}>
              <View style={[styles.voteIndicator, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.voteLabel}>Abstain: {votingStats.abstentions}</Text>
            </View>
            <View style={styles.voteItem}>
              <View style={[styles.voteIndicator, { backgroundColor: '#6b7280' }]} />
              <Text style={styles.voteLabel}>Absent: {votingStats.absences}</Text>
            </View>
          </View>
        </View>

        <View style={styles.patternContainer}>
          <Text style={styles.subsectionTitle}>Voting Pattern</Text>
          <View style={styles.patternBadge}>
            <Text style={styles.patternText}>
              {votingStats.votingPattern.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTrends = () => (
    <View style={styles.trendsContainer}>
      <Text style={styles.sectionTitle}>Voting Trends</Text>
      
      <View style={styles.periodSelector}>
        {[
          { id: 'month', label: 'Monthly' },
          { id: 'quarter', label: 'Quarterly' },
          { id: 'year', label: 'Yearly' }].map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod === period.id && styles.activePeriodButton
            ]}
            onPress={() => {
              setSelectedPeriod(period.id as any);
              loadVotingData();
            }}
          >
            <Text style={[
              styles.periodText,
              selectedPeriod === period.id && styles.activePeriodText
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {votingTrends.map((trend, index) => (
        <View key={index} style={styles.trendCard}>
          <Text style={styles.trendPeriod}>{trend.period}</Text>
          <View style={styles.trendStats}>
            <View style={styles.trendItem}>
              <Text style={styles.trendValue}>{trend.totalVotes}</Text>
              <Text style={styles.trendLabel}>Votes</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendValue}>{trend.attendanceRate.toFixed(1)}%</Text>
              <Text style={styles.trendLabel}>Attendance</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendValue}>{trend.partyLoyalty.toFixed(1)}%</Text>
              <Text style={styles.trendLabel}>Loyalty</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'records':
        return (
          <FlatList
            data={getFilteredRecords()}
            renderItem={renderVotingRecord}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyTitle}>No Voting Records</Text>
                <Text style={styles.emptySubtitle}>
                  No voting records found for this politician
                </Text>
              </View>
            }
          />
        );
      case 'stats':
        return renderVotingStats();
      case 'trends':
        return renderTrends();
      default:
        return null;
    }
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
          <Text style={styles.headerTitle}>🗳️ Voting Records</Text>
          <ShareButton
            data={{
              name: politicianName || 'Politician',
              position: 'Legislator',
              party: 'Parliament',
              achievements: [`${votingStats?.totalVotes || 0} voting records`],
              summary: `Complete voting history and statistics for ${politicianName || 'this politician'}`}}
            type="politician"
            variant="minimal"
            iconSize={20}
            showText={false}
            style={styles.headerShareButton}
          />
        </View>
        <Text style={styles.headerSubtitle}>
          {politicianName ? `${politicianName}'s voting history` : 'Legislative voting records'}
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { id: 'records', label: 'Records', icon: 'list' },
          { id: 'stats', label: 'Statistics', icon: 'stats-chart' },
          { id: 'trends', label: 'Trends', icon: 'trending-up' }].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.activeTabButton
            ]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={16} 
              color={activeTab === tab.id ? '#667eea' : '#6b7280'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Options */}
      {activeTab === 'records' && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { id: 'all', label: 'All' },
              { id: 'constitutional', label: 'Constitutional' },
              { id: 'economic', label: 'Economic' },
              { id: 'social', label: 'Social' },
              { id: 'environmental', label: 'Environmental' },
              { id: 'security', label: 'Security' },
              { id: 'governance', label: 'Governance' },
              { id: 'health', label: 'Health' },
              { id: 'education', label: 'Education' }].map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.id && styles.activeFilterChip
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedFilter === filter.id && styles.activeFilterChipText
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'},
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20},
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10},
  backButton: {
    padding: 8},
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
    flex: 1},
  headerShareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)'},
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center'},
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'},
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8},
  activeTabButton: {
    backgroundColor: '#f0f4ff'},
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 6},
  activeTabText: {
    color: '#667eea'},
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'},
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    marginLeft: 8},
  activeFilterChip: {
    backgroundColor: '#667eea'},
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280'},
  activeFilterChipText: {
    color: 'white'},
  content: {
    flex: 1,
    paddingHorizontal: 20},
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'},
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8},
  recordTitleContainer: {
    flex: 1,
    marginRight: 12},
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4},
  billNumber: {
    fontSize: 12,
    color: '#6b7280'},
  voteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12},
  voteText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 4},
  recordDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12},
  recordMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12},
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4},
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4},
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'},
  impactContainer: {
    flexDirection: 'row',
    gap: 8},
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8},
  impactText: {
    fontSize: 10,
    fontWeight: 'bold'},
  controversyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8},
  controversyText: {
    fontSize: 10,
    fontWeight: 'bold'},
  recordShareButton: {
    padding: 4},
  statsContainer: {
    paddingVertical: 20},
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16},
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20},
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    borderLeftWidth: 4,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'},
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8},
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginLeft: 8},
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4},
  statSubtitle: {
    fontSize: 11,
    color: '#9ca3af'},
  detailedStats: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'},
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12},
  voteBreakdown: {
    gap: 8},
  voteItem: {
    flexDirection: 'row',
    alignItems: 'center'},
  voteIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8},
  voteLabel: {
    fontSize: 14,
    color: '#374151'},
  patternContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'},
  patternBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start'},
  patternText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white'},
  trendsContainer: {
    paddingVertical: 20},
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'},
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8},
  activePeriodButton: {
    backgroundColor: '#667eea'},
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280'},
  activePeriodText: {
    color: 'white'},
  trendCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'},
  trendPeriod: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12},
  trendStats: {
    flexDirection: 'row',
    justifyContent: 'space-around'},
  trendItem: {
    alignItems: 'center'},
  trendValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea'},
  trendLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4},
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60},
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16},
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8},
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'}});

export default VotingRecordsScreen;
