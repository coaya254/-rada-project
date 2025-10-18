import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { PoliticsStackParamList } from '../../navigation/PoliticsStackNavigator';
import politicsAPI from '../../services/PoliticsAPIService';

interface VotingRecordsScreenProps {
  navigation: NativeStackNavigationProp<PoliticsStackParamList, 'VotingRecords'>;
  route: RouteProp<PoliticsStackParamList, 'VotingRecords'>;
}

interface VotingRecord {
  id: number;
  bill_name: string;
  vote: string;
  date: string;
  bill_description?: string;
  category?: string;
  significance?: string;
  notes?: string;
}

export const VotingRecordsScreen: React.FC<VotingRecordsScreenProps> = ({ navigation, route }) => {
  const { politicianName, politicianId } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [votingRecords, setVotingRecords] = useState<VotingRecord[]>([]);

  useEffect(() => {
    loadVotingRecords();
  }, [politicianId]);

  const loadVotingRecords = async () => {
    try {
      setLoading(true);
      const response = await politicsAPI.getVotingRecords(politicianId);

      if (response.success && response.data) {
        setVotingRecords(response.data);
      }
    } catch (error) {
      console.error('Error loading voting records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: 'all', label: 'All Votes' },
    { id: 'for', label: 'Voted For' },
    { id: 'against', label: 'Voted Against' },
    { id: 'abstain', label: 'Abstained' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVotingRecords();
    setRefreshing(false);
  };

  const getFilteredRecords = () => {
    if (selectedFilter === 'all') return votingRecords;
    return votingRecords.filter(record =>
      record.vote.toLowerCase() === selectedFilter
    );
  };

  const filteredRecords = getFilteredRecords();

  const getVoteColor = (vote: string) => {
    switch (vote) {
      case 'For': return '#10B981';
      case 'Against': return '#EF4444';
      case 'Abstain': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const voteStats = {
    total: votingRecords.length,
    for: votingRecords.filter(r => r.vote === 'For').length,
    against: votingRecords.filter(r => r.vote === 'Against').length,
    abstain: votingRecords.filter(r => r.vote === 'Abstain').length,
  };

  const getVoteIcon = (vote: string) => {
    switch (vote.toLowerCase()) {
      case 'for': return 'thumbs-up';
      case 'against': return 'thumbs-down';
      case 'abstain': return 'hand-left';
      default: return 'help-circle';
    }
  };

  const renderVotingRecord = ({ item }: { item: VotingRecord }) => (
    <View style={styles.recordCard}>
      <Text style={styles.billTitle}>{item.bill_name}</Text>

      <View style={styles.recordDetails}>
        <View style={styles.voteContainer}>
          <MaterialIcons
            name={getVoteIcon(item.vote)}
            size={18}
            color={getVoteColor(item.vote)}
          />
          <Text style={[styles.voteText, { color: getVoteColor(item.vote) }]}>
            {item.vote.toUpperCase()}
          </Text>
        </View>

        {item.category && (
          <View style={[styles.categoryBadge, { borderColor: '#3B82F6' + '40' }]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}

        {item.significance && (
          <View style={[styles.significanceBadge, { borderColor: getImportanceColor(item.significance) }]}>
            <Text style={[styles.significanceText, { color: getImportanceColor(item.significance) }]}>
              {item.significance}
            </Text>
          </View>
        )}
      </View>

      {item.bill_description && (
        <Text style={styles.billDescription} numberOfLines={2}>
          {item.bill_description}
        </Text>
      )}

      <View style={styles.recordFooter}>
        <Text style={styles.recordDate}>
          <MaterialIcons name="event" size={14} color="#9CA3AF" /> {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </View>
  );

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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Voting Records</Text>
          <Text style={styles.headerSubtitle}>{politicianName}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            style={styles.statsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statsTitle}>Voting Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{voteStats.total}</Text>
                <Text style={styles.statLabel}>TOTAL VOTES</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{voteStats.for}</Text>
                <Text style={styles.statLabel}>VOTED FOR</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{voteStats.against}</Text>
                <Text style={styles.statLabel}>VOTED AGAINST</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                selectedFilter === filter.id && styles.activeFilterTab
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter.id && styles.activeFilterTabText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Voting Records List */}
        <View style={styles.recordsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Voting History</Text>
            <Text style={styles.recordCount}>
              {filteredRecords.length} records
            </Text>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading voting records...</Text>
            </View>
          ) : filteredRecords.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="how-to-vote" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>No voting records found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredRecords}
              renderItem={renderVotingRecord}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
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
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
    margin: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGradient: {
    padding: 24,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterContainer: {
    paddingBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  activeFilterTab: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  recordsSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  recordCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  recordCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  billTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 24,
  },
  recordDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voteText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  significanceBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  significanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  billDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  recordFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  recordDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});