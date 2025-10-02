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
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, LoadingSpinner, ErrorDisplay } from '../../components/ui';
import { VotingRecord } from '../../types';
import { colors, shadows } from '../../theme';
import ApiService from '../../services/api';

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
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const fetchVotingRecords = async (refresh = false) => {
    if (!refresh) setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getVotingRecords(politicianId);
      const votingData = response.success ? response.data : response;
      setVotingRecords(votingData);
    } catch (err) {
      console.error('Error loading voting records:', err);
      setError(err instanceof Error ? err.message : 'Failed to load voting records');
      setVotingRecords([]);
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
  };

  // Keep mock data below for reference (to be removed once backend is fully integrated)
  /*
  const fetchVotingRecords_OLD = async (refresh = false) => {
    if (!refresh) setLoading(true);
    setError(null);

    try {
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
          source_links: [
            {
              type: 'hansard',
              url: 'https://hansard.parliament.go.ke/nationalsitting/2024/january/15',
              title: 'National Assembly Hansard - Healthcare Bill Second Reading',
              source: 'Parliament of Kenya',
              date: '2024-01-15'
            },
            {
              type: 'bill_document',
              url: 'https://parliament.go.ke/bills/universal-healthcare-access-2024',
              title: 'Universal Healthcare Access Act 2024 - Full Text',
              source: 'Parliament of Kenya',
              date: '2024-01-01'
            }
          ],
          verification_links: [
            {
              type: 'official_record',
              url: 'https://kenyalaw.org/kl/official-gazette/2024-healthcare-access-act',
              title: 'Official Vote Record - Healthcare Access Act 2024',
              source: 'Kenya Law Reports',
              date: '2024-01-15',
              content_summary: 'Confirmed individual voting record: YES vote by ' + politicianName + '. Bill passed with 234 votes in favor.'
            },
            {
              type: 'news_verification',
              url: 'https://nation.africa/kenya/news/politics/healthcare-access-bill-passes',
              title: 'Parliament Passes Universal Healthcare Bill',
              source: 'Daily Nation',
              date: '2024-01-15',
              content_summary: 'Comprehensive coverage including ' + politicianName + '\'s support statement and voting breakdown.'
            }
          ]
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
          source_links: [
            {
              type: 'hansard',
              url: 'https://hansard.parliament.go.ke/senatesitting/2023/november/22',
              title: 'Senate Hansard - Climate Mitigation Fund Bill',
              source: 'Parliament of Kenya',
              date: '2023-11-22'
            },
            {
              type: 'government_doc',
              url: 'https://environment.go.ke/climate-mitigation-fund-framework',
              title: 'National Climate Mitigation Fund Framework',
              source: 'Ministry of Environment',
              date: '2023-11-01'
            }
          ],
          verification_links: [
            {
              type: 'fact_check',
              url: 'https://citizen.digital/news/climate-fund-bill-senate-vote',
              title: 'Senate Climate Fund Vote Verification',
              source: 'Citizen Digital',
              date: '2023-11-22',
              content_summary: 'Independent verification of senate vote including ' + politicianName + '\'s YES vote and coastal protection amendment.'
            }
          ]
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
          source_links: [
            {
              type: 'hansard',
              url: 'https://hansard.parliament.go.ke/nationalsitting/2023/september/10',
              title: 'National Assembly Hansard - Tax Reform Bill Debate',
              source: 'Parliament of Kenya',
              date: '2023-09-10'
            },
            {
              type: 'committee_report',
              url: 'https://parliament.go.ke/committees/finance/tax-reform-analysis-2023',
              title: 'Finance Committee Report on Tax Reform Bill',
              source: 'Parliamentary Finance Committee',
              date: '2023-09-01'
            }
          ],
          verification_links: [
            {
              type: 'vote_tally',
              url: 'https://standardmedia.co.ke/politics/tax-reform-bill-fails-parliament',
              title: 'Tax Reform Bill Fails in Parliament Vote',
              source: 'The Standard',
              date: '2023-09-10',
              content_summary: 'Bill failed with ' + politicianName + ' voting NO. Opposition cited concerns about social program impact.'
            },
            {
              type: 'news_verification',
              url: 'https://nation.africa/kenya/news/politics/tax-reform-vote-breakdown',
              title: 'Tax Reform Vote: Complete Parliamentary Breakdown',
              source: 'Daily Nation',
              date: '2023-09-10',
              content_summary: 'Detailed voting analysis including ' + politicianName + '\'s opposition statement and reasoning.'
            }
          ]
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
          source_links: [
            {
              type: 'hansard',
              url: 'https://hansard.parliament.go.ke/senatesitting/2024/february/28',
              title: 'Senate Hansard - Education Technology Bill',
              source: 'Parliament of Kenya',
              date: '2024-02-28'
            }
          ],
          verification_links: [
            {
              type: 'official_record',
              url: 'https://kenyalaw.org/kl/vote-records/education-tech-2024',
              title: 'Education Technology Bill - Official Vote Record',
              source: 'Kenya Law Reports',
              date: '2024-02-28',
              content_summary: 'Confirmed YES vote by ' + politicianName + ' with rural amendments.'
            }
          ]
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
          source_links: [
            {
              type: 'hansard',
              url: 'https://hansard.parliament.go.ke/nationalsitting/2023/december/05',
              title: 'National Assembly Hansard - Infrastructure Bill Debate',
              source: 'Parliament of Kenya',
              date: '2023-12-05'
            }
          ],
          verification_links: [
            {
              type: 'independent_report',
              url: 'https://citizen.digital/news/infrastructure-bill-vote-analysis',
              title: 'Infrastructure Bill Vote Analysis',
              source: 'Citizen Digital',
              date: '2023-12-05',
              content_summary: 'Detailed analysis of abstention votes including ' + politicianName + '\'s environmental concerns.'
            }
          ]
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
          source_links: [
            {
              type: 'hansard',
              url: 'https://hansard.parliament.go.ke/senatesitting/2024/march/12',
              title: 'Senate Hansard - Small Business Support Bill',
              source: 'Parliament of Kenya',
              date: '2024-03-12'
            },
            {
              type: 'government_doc',
              url: 'https://treasury.go.ke/small-business-support-framework',
              title: 'Small Business Support Framework 2024',
              source: 'National Treasury',
              date: '2024-03-01'
            }
          ],
          verification_links: [
            {
              type: 'news_verification',
              url: 'https://standardmedia.co.ke/business/small-business-bill-passes',
              title: 'Small Business Support Bill Passes Senate',
              source: 'The Standard',
              date: '2024-03-12',
              content_summary: 'Bill passed with strong support including from ' + politicianName + ' who emphasized local entrepreneurship.'
            }
          ]
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
  */

  useEffect(() => {
    fetchVotingRecords();
  }, [politicianId]);

  const handleRecordPress = (record: any) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
    setShowSources(false);
    setShowVerification(false);
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

      {/* Source Buttons */}
      {((record.source_links && record.source_links.length > 0) || (record.verification_links && record.verification_links.length > 0)) && (
        <View style={styles.actionButtons}>
          {record.source_links && record.source_links.length > 0 && (
            <TouchableOpacity
              style={styles.sourceButton}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedRecord(record);
                setShowDetailModal(true);
                setShowSources(true);
                setShowVerification(false);
              }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="link" size={14} color="#3B82F6" />
              <Text style={styles.sourceButtonText}>
                Sources ({record.source_links.length})
              </Text>
            </TouchableOpacity>
          )}
          {record.verification_links && record.verification_links.length > 0 && (
            <TouchableOpacity
              style={styles.verificationButton}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedRecord(record);
                setShowDetailModal(true);
                setShowSources(false);
                setShowVerification(true);
              }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="verified" size={14} color="#10B981" />
              <Text style={styles.verificationButtonText}>
                Verification ({record.verification_links.length})
              </Text>
            </TouchableOpacity>
          )}
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

                <Text style={styles.modalBillTitle}>{selectedRecord.bill_title}</Text>

                <View style={styles.modalBillInfo}>
                  <Text style={styles.modalBillNumber}>Bill: {selectedRecord.bill_number}</Text>
                  <Text style={styles.modalDate}>
                    {new Date(selectedRecord.date).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.modalSummary}>{selectedRecord.bill_summary}</Text>

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
                  <Text style={styles.modalResultText}>
                    Result: {selectedRecord.bill_passed ? 'PASSED' : 'FAILED'}
                  </Text>
                  {selectedRecord.notes && (
                    <Text style={styles.modalNotesText}>
                      {selectedRecord.notes}
                    </Text>
                  )}
                </View>

                {/* Original Sources Section */}
                {selectedRecord.source_links && selectedRecord.source_links.length > 0 && (
                  <View style={styles.modalSourceSection}>
                    <TouchableOpacity
                      style={styles.collapsibleHeader}
                      onPress={() => setShowSources(!showSources)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalSectionTitle}>
                        🔗 Original Sources ({selectedRecord.source_links.length})
                      </Text>
                      <MaterialIcons
                        name={showSources ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                        size={24}
                        color="#3B82F6"
                      />
                    </TouchableOpacity>

                    {showSources && (
                      <View style={styles.collapsibleContent}>
                        {selectedRecord.source_links.map((link: any, index: number) => (
                          <View key={index} style={styles.sourceCard}>
                            <View style={styles.sourceCardHeader}>
                              <View style={styles.sourceTypeContainer}>
                                <MaterialIcons
                                  name={
                                    link.type === 'hansard' ? 'gavel' :
                                    link.type === 'bill_document' ? 'description' :
                                    link.type === 'committee_report' ? 'group' :
                                    link.type === 'government_doc' ? 'account_balance' :
                                    'link'
                                  }
                                  size={16}
                                  color="#3B82F6"
                                />
                                <Text style={styles.sourceType}>{link.type.replace('_', ' ').toUpperCase()}</Text>
                              </View>
                              <Text style={styles.sourceDate}>{link.date}</Text>
                            </View>
                            <Text style={styles.sourceTitle}>{link.title}</Text>
                            <Text style={styles.sourceProvider}>Source: {link.source}</Text>
                            <TouchableOpacity
                              style={styles.modalSourceButton}
                              onPress={() => Linking.openURL(link.url)}
                              activeOpacity={0.8}
                            >
                              <MaterialIcons name="open-in-new" size={16} color="#FFFFFF" />
                              <Text style={styles.modalSourceButtonText}>View Source</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Verification Section */}
                {selectedRecord.verification_links && selectedRecord.verification_links.length > 0 && (
                  <View style={styles.modalSourceSection}>
                    <TouchableOpacity
                      style={styles.collapsibleHeader}
                      onPress={() => setShowVerification(!showVerification)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalSectionTitle}>
                        ✅ Vote Verification ({selectedRecord.verification_links.length})
                      </Text>
                      <MaterialIcons
                        name={showVerification ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                        size={24}
                        color="#10B981"
                      />
                    </TouchableOpacity>

                    {showVerification && (
                      <View style={styles.collapsibleContent}>
                        {selectedRecord.verification_links.map((link: any, index: number) => (
                          <View key={index} style={styles.verificationCard}>
                            <View style={styles.sourceCardHeader}>
                              <View style={styles.sourceTypeContainer}>
                                <MaterialIcons
                                  name={
                                    link.type === 'official_record' ? 'verified' :
                                    link.type === 'news_verification' ? 'article' :
                                    link.type === 'fact_check' ? 'fact_check' :
                                    link.type === 'vote_tally' ? 'poll' :
                                    link.type === 'independent_report' ? 'assessment' :
                                    'check_circle'
                                  }
                                  size={16}
                                  color="#10B981"
                                />
                                <Text style={styles.verificationType}>{link.type.replace('_', ' ').toUpperCase()}</Text>
                              </View>
                              <Text style={styles.sourceDate}>{link.date}</Text>
                            </View>
                            <Text style={styles.sourceTitle}>{link.title}</Text>
                            <Text style={styles.sourceProvider}>Source: {link.source}</Text>
                            <Text style={styles.verificationSummary}>{link.content_summary}</Text>
                            <TouchableOpacity
                              style={styles.modalSourceButton}
                              onPress={() => Linking.openURL(link.url)}
                              activeOpacity={0.8}
                            >
                              <MaterialIcons name="open-in-new" size={16} color="#FFFFFF" />
                              <Text style={styles.modalSourceButtonText}>View Verification</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
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

  // New styles for source/verification sections
  modalResultText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 8,
    fontWeight: '600',
  },
  modalNotesText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  modalSourceSection: {
    marginTop: 24,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  collapsibleContent: {
    marginTop: 12,
    gap: 12,
  },
  sourceCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  verificationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  sourceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  verificationType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  sourceDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  sourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  sourceProvider: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  verificationSummary: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 18,
  },
  modalSourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  modalSourceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Card source button styles
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    gap: 4,
  },
  sourceButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  verificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    gap: 4,
  },
  verificationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
});