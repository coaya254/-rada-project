import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { PoliticsStackParamList } from '../../navigation/PoliticsStackNavigator';

interface VotingRecordsScreenProps {
  navigation: NativeStackNavigationProp<PoliticsStackParamList, 'VotingRecords'>;
  route: RouteProp<PoliticsStackParamList, 'VotingRecords'>;
}

interface VotingRecord {
  id: number;
  bill: string;
  vote: 'For' | 'Against' | 'Abstain';
  date: string;
  description: string;
  category: string;
  importance: 'High' | 'Medium' | 'Low';
}

export const VotingRecordsScreen: React.FC<VotingRecordsScreenProps> = ({ navigation, route }) => {
  const { politicianName } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [votingRecords] = useState<VotingRecord[]>([
    {
      id: 1,
      bill: 'Healthcare Reform Act 2024',
      vote: 'For',
      date: '2024-03-15',
      description: 'Comprehensive healthcare reform to improve accessibility and reduce costs',
      category: 'Healthcare',
      importance: 'High',
    },
    {
      id: 2,
      bill: 'Education Funding Bill',
      vote: 'For',
      date: '2024-03-10',
      description: 'Increase funding for primary and secondary education nationwide',
      category: 'Education',
      importance: 'High',
    },
    {
      id: 3,
      bill: 'Climate Action Initiative',
      vote: 'Against',
      date: '2024-03-05',
      description: 'New regulations on carbon emissions for industrial sectors',
      category: 'Environment',
      importance: 'High',
    },
    {
      id: 4,
      bill: 'Infrastructure Development Act',
      vote: 'For',
      date: '2024-02-28',
      description: 'Investment in roads, bridges, and digital infrastructure',
      category: 'Infrastructure',
      importance: 'Medium',
    },
    {
      id: 5,
      bill: 'Tax Reform Amendment',
      vote: 'Abstain',
      date: '2024-02-20',
      description: 'Modifications to corporate tax structure',
      category: 'Economy',
      importance: 'Medium',
    },
    {
      id: 6,
      bill: 'Agricultural Support Package',
      vote: 'For',
      date: '2024-02-15',
      description: 'Financial assistance for small-scale farmers',
      category: 'Agriculture',
      importance: 'Low',
    },
  ]);

  const filters = [
    { id: 'all', label: 'All Votes' },
    { id: 'for', label: 'Voted For' },
    { id: 'against', label: 'Voted Against' },
    { id: 'abstain', label: 'Abstained' },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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

  const renderVotingRecord = ({ item }: { item: VotingRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordMeta}>
          <View style={[styles.voteBadge, { backgroundColor: getVoteColor(item.vote) }]}>
            <Text style={styles.voteText}>{item.vote}</Text>
          </View>
          <View style={[styles.importanceBadge, { borderColor: getImportanceColor(item.importance) }]}>
            <Text style={[styles.importanceText, { color: getImportanceColor(item.importance) }]}>
              {item.importance}
            </Text>
          </View>
        </View>
        <Text style={styles.recordDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>

      <Text style={styles.billTitle}>{item.bill}</Text>
      <Text style={styles.billDescription}>{item.description}</Text>

      <View style={styles.recordFooter}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>View Details</Text>
          <MaterialIcons name="chevron-right" size={16} color="#3B82F6" />
        </TouchableOpacity>
      </View>
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
          <FlatList
            data={filteredRecords}
            renderItem={renderVotingRecord}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
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
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  voteBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  voteText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  importanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  importanceText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  recordDate: {
    fontSize: 12,
    color: '#666',
  },
  billTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  billDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});