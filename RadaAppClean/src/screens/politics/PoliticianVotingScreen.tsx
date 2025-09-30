import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, LoadingSpinner, ErrorDisplay } from '../../components/ui';
import { VotingRecord } from '../../types';
import { colors, shadows } from '../../theme';

interface PoliticianVotingScreenProps {
  politicianId: number;
  politicianName: string;
  onBack: () => void;
}

export const PoliticianVotingScreen: React.FC<PoliticianVotingScreenProps> = ({
  politicianId,
  politicianName,
  onBack,
}) => {
  const [votingRecords, setVotingRecords] = useState<VotingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterVote, setFilterVote] = useState<'all' | 'yes' | 'no' | 'abstain'>('all');
  const [selectedRecord, setSelectedRecord] = useState<VotingRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchVotingRecords = async (refresh = false) => {
    if (!refresh) setLoading(true);
    setError(null);

    try {
      // Mock voting records data - replace with actual API call when backend is ready
      const mockVotingRecords: VotingRecord[] = [
        {
          id: 1,
          politician_id: politicianId,
          bill_number: 'HB-2024-001',
          bill_title: 'Universal Healthcare Access Act',
          bill_summary: 'A comprehensive bill to expand healthcare coverage to all citizens, establishing community health centers and subsidizing medical insurance for low-income families.',
          vote: 'yes',
          date: '2024-01-15',
          session: '2024 Legislative Session',
          category: 'Healthcare',
          bill_passed: true,
          notes: `${politicianName} strongly supported this bill, citing the need for accessible healthcare in rural areas.`,
        },
        {
          id: 2,
          politician_id: politicianId,
          bill_number: 'SB-2023-045',
          bill_title: 'Climate Change Mitigation Fund',
          bill_summary: 'Establishes a national fund for climate adaptation projects, including renewable energy infrastructure and carbon offset programs.',
          vote: 'yes',
          date: '2023-11-22',
          session: '2023 Legislative Session',
          category: 'Environment',
          bill_passed: true,
          notes: 'Advocated for increased funding allocation to coastal protection projects.',
        },
        {
          id: 3,
          politician_id: politicianId,
          bill_number: 'HB-2023-078',
          bill_title: 'Tax Reform and Simplification Act',
          bill_summary: 'Comprehensive tax reform aimed at simplifying the tax code and reducing corporate tax rates while closing loopholes.',
          vote: 'no',
          date: '2023-09-10',
          session: '2023 Legislative Session',
          category: 'Finance',
          bill_passed: false,
          notes: `${politicianName} opposed the bill due to concerns about reduced social program funding.`,
        },
        {
          id: 4,
          politician_id: politicianId,
          bill_number: 'SB-2024-012',
          bill_title: 'Education Technology Enhancement Program',
          bill_summary: 'Provides funding for digital infrastructure in schools, teacher training on technology, and devices for students.',
          vote: 'yes',
          date: '2024-02-28',
          session: '2024 Legislative Session',
          category: 'Education',
          bill_passed: true,
          notes: 'Championed this bill and proposed amendments to include rural school priorities.',
        },
        {
          id: 5,
          politician_id: politicianId,
          bill_number: 'HB-2023-134',
          bill_title: 'Infrastructure Investment and Jobs Creation',
          bill_summary: 'Large-scale infrastructure development program focusing on roads, bridges, and public transportation systems.',
          vote: 'abstain',
          date: '2023-12-05',
          session: '2023 Legislative Session',
          category: 'Infrastructure',
          bill_passed: true,
          notes: 'Abstained due to concerns about environmental impact assessments being incomplete.',
        },
        {
          id: 6,
          politician_id: politicianId,
          bill_number: 'SB-2024-023',
          bill_title: 'Small Business Support and Recovery Act',
          bill_summary: 'Provides tax incentives, grants, and low-interest loans to support small businesses and startups.',
          vote: 'yes',
          date: '2024-03-12',
          session: '2024 Legislative Session',
          category: 'Economy',
          bill_passed: true,
          notes: `${politicianName} highlighted the importance of supporting local entrepreneurs and job creation.`,
        },
      ];

      setVotingRecords(mockVotingRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load voting records');
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVotingRecords();
  }, [politicianId]);

  const handleRecordPress = (record: VotingRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVotingRecords(true);
  };

  const getVoteColor = (vote: VotingRecord['vote']) => {
    switch (vote) {
      case 'yes': return colors.success[500];
      case 'no': return colors.error[500];
      case 'abstain': return colors.warning[500];
      default: return colors.neutral[400];
    }
  };

  const getVoteIcon = (vote: VotingRecord['vote']) => {
    switch (vote) {
      case 'yes': return 'thumb-up';
      case 'no': return 'thumb-down';
      case 'abstain': return 'remove';
      default: return 'help';
    }
  };

  const getVoteLabel = (vote: VotingRecord['vote']) => {
    switch (vote) {
      case 'yes': return 'YES';
      case 'no': return 'NO';
      case 'abstain': return 'ABSTAIN';
      default: return 'ABSENT';
    }
  };

  const filteredRecords = votingRecords.filter(record =>
    filterVote === 'all' || record.vote === filterVote
  );

  const stats = {
    total: votingRecords.length,
    yes: votingRecords.filter(r => r.vote === 'yes').length,
    no: votingRecords.filter(r => r.vote === 'no').length,
    abstain: votingRecords.filter(r => r.vote === 'abstain').length,
  };

  const renderVotingCard = (record: VotingRecord) => (
    <TouchableOpacity
      key={record.id}
      onPress={() => handleRecordPress(record)}
      activeOpacity={0.7}
    >
      <Card variant="elevated" style={styles.votingCard}>
      <View style={styles.votingHeader}>
        <View style={styles.billInfo}>
          <Text style={styles.billNumber}>{record.bill_number}</Text>
          <Text style={styles.sessionInfo}>
            {record.session} • {new Date(record.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.voteBadge, { backgroundColor: getVoteColor(record.vote) }]}>
          <MaterialIcons
            name={getVoteIcon(record.vote) as any}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.voteText}>{getVoteLabel(record.vote)}</Text>
        </View>
      </View>

      <Text style={styles.billTitle} numberOfLines={2}>
        {record.bill_title}
      </Text>

      <Text style={styles.billSummary} numberOfLines={3}>
        {record.bill_summary}
      </Text>

      <View style={styles.votingFooter}>
        <View style={styles.categoryRow}>
          <MaterialIcons name="category" size={16} color={colors.neutral[500]} />
          <Text style={styles.categoryText}>{record.category}</Text>
        </View>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Result:</Text>
          <Text style={[
            styles.resultText,
            { color: record.bill_passed ? colors.success[600] : colors.error[600] }
          ]}>
            {record.bill_passed ? 'PASSED' : 'FAILED'}
          </Text>
        </View>
      </View>

      {record.notes && (
        <View style={styles.notesSection}>
          <MaterialIcons name="note" size={16} color={colors.neutral[500]} />
          <Text style={styles.notesText}>{record.notes}</Text>
        </View>
      )}
    </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politicianName}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Voting Records & Positions</Text>
        </LinearGradient>
        <View style={styles.content}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politicianName}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Voting Records & Positions</Text>
        </LinearGradient>
        <View style={styles.content}>
          <ErrorDisplay
            message={error}
            onRetry={() => fetchVotingRecords()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{politicianName}</Text>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Voting Records & Positions</Text>
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statItem, filterVote === 'all' && styles.activeStatItem]}
            onPress={() => setFilterVote('all')}
          >
            <Text style={[styles.statNumber, filterVote === 'all' && styles.activeStatNumber]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, filterVote === 'all' && styles.activeStatLabel]}>
              Total
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, filterVote === 'yes' && styles.activeStatItem]}
            onPress={() => setFilterVote('yes')}
          >
            <Text style={[styles.statNumber, filterVote === 'yes' && styles.activeStatNumber]}>
              {stats.yes}
            </Text>
            <Text style={[styles.statLabel, filterVote === 'yes' && styles.activeStatLabel]}>
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, filterVote === 'no' && styles.activeStatItem]}
            onPress={() => setFilterVote('no')}
          >
            <Text style={[styles.statNumber, filterVote === 'no' && styles.activeStatNumber]}>
              {stats.no}
            </Text>
            <Text style={[styles.statLabel, filterVote === 'no' && styles.activeStatLabel]}>
              No
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, filterVote === 'abstain' && styles.activeStatItem]}
            onPress={() => setFilterVote('abstain')}
          >
            <Text style={[styles.statNumber, filterVote === 'abstain' && styles.activeStatNumber]}>
              {stats.abstain}
            </Text>
            <Text style={[styles.statLabel, filterVote === 'abstain' && styles.activeStatLabel]}>
              Abstain
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="how-to-vote" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No Voting Records Found</Text>
            <Text style={styles.emptySubtitle}>
              {filterVote === 'all'
                ? `No recorded votes for ${politicianName}.`
                : `No ${filterVote} votes found.`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.votingGrid}>
            {filteredRecords.map(renderVotingCard)}
          </View>
        )}
      </ScrollView>

      {/* Voting Record Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDetailModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Voting Record Details</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedRecord && (
              <>
                <View style={[styles.modalVoteBadge, { backgroundColor: getVoteColor(selectedRecord.vote) }]}>
                  <MaterialIcons
                    name={getVoteIcon(selectedRecord.vote) as any}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.modalVoteText}>
                    VOTED {getVoteLabel(selectedRecord.vote)}
                  </Text>
                </View>

                <Text style={styles.modalBillTitle}>{selectedRecord.bill_name}</Text>

                <View style={styles.modalBillInfo}>
                  <Text style={styles.modalBillNumber}>Bill: {selectedRecord.bill_name}</Text>
                  <Text style={styles.modalDate}>
                    {new Date(selectedRecord.date).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.modalSummary}>{selectedRecord.significance}</Text>

                <View style={styles.modalCategorySection}>
                  <Text style={styles.modalSectionTitle}>Category</Text>
                  <View style={styles.modalCategoryBadge}>
                    <Text style={styles.modalCategoryText}>{selectedRecord.category}</Text>
                  </View>
                </View>

                <View style={styles.modalVoteSection}>
                  <Text style={styles.modalSectionTitle}>Vote Details</Text>
                  <Text style={styles.modalVoteDetails}>
                    Voted {getVoteLabel(selectedRecord.vote).toLowerCase()} on this {selectedRecord.category.toLowerCase()} bill.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeStatItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeStatNumber: {
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  activeStatLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  votingGrid: {
    paddingBottom: 40,
  },
  votingCard: {
    marginBottom: 16,
    padding: 16,
  },
  votingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  billInfo: {
    flex: 1,
  },
  billNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary[600],
    marginBottom: 2,
  },
  sessionInfo: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  voteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  voteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    lineHeight: 22,
    marginBottom: 8,
  },
  billSummary: {
    fontSize: 14,
    color: colors.neutral[600],
    lineHeight: 20,
    marginBottom: 16,
  },
  votingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultLabel: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  resultText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notesSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.neutral[50],
    padding: 12,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 12,
    color: colors.neutral[600],
    flex: 1,
    lineHeight: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[700],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalVoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  modalVoteText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  modalBillTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 16,
  },
  modalBillInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalBillNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  modalDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalSummary: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalCategorySection: {
    marginBottom: 24,
  },
  modalCategoryBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  modalCategoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  modalResultSection: {
    marginBottom: 24,
  },
  modalResultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  modalResultText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  modalNotesSection: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  modalNotesText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  modalVoteSection: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalVoteDetails: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});