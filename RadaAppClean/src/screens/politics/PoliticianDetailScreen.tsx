import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  Alert,
  Modal,
  Linking,
  FlatList,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, NewsCard } from '../../components/ui';
import { NewsItem, Politician, Document, TimelineEvent, Commitment, VotingRecord } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

// Import individual screens
import { PoliticianNewsScreen } from './PoliticianNewsScreen';
import { PoliticianPromisesScreen } from './PoliticianPromisesScreen';
import { PoliticianVotingScreen } from './PoliticianVotingScreen';
import { PoliticianTimelineScreen } from './PoliticianTimelineScreen';
import { PoliticianDocumentsScreen } from './PoliticianDocumentsScreen';
import { PoliticianCareerScreen } from './PoliticianCareerScreen';

const { width } = Dimensions.get('window');

interface PoliticianDetailProps {
  route: {
    params: {
      politician?: Politician;
    };
  };
  navigation: any;
}

export const PoliticianDetailScreen: React.FC<PoliticianDetailProps> = ({
  route,
  navigation,
}) => {
  // Get politician data
  const politician = route.params?.politician || {
    id: 1,
    name: 'Amason Jeffah Kingi',
    title: 'Speaker of the Senate',
    current_position: 'Speaker of the Senate',
    party: 'PAA',
    constituency: 'Kilifi County',
    party_color: '#1e40af',
    key_achievements: ['Speaker of Senate 2022-present', 'Governor Kilifi 2013-2022', 'MP Kilifi North 2007-2013'],
    education: 'University of Nairobi (LLB)',
    party_history: ['ODM (2007-2012)', 'UDF (2012-2016)', 'Jubilee (2016-2022)', 'UDA (2022-present)'],
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Amason_Kingi_2022.jpg/400px-Amason_Kingi_2022.jpg',
    slug: 'amason-kingi'
  };

  // Main view state for full-screen navigation
  const [activeView, setActiveView] = useState<'dashboard' | 'voting' | 'promises' | 'timeline' | 'career' | 'documents' | 'news'>('dashboard');
  const [documentsSubTab, setDocumentsSubTab] = useState<'official' | 'speeches'>('official');
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  // Data states
  const [documentsData, setDocumentsData] = useState<Document[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineEvent[]>([]);
  const [commitmentsData, setCommitmentsData] = useState<Commitment[]>([]);
  const [votingData, setVotingData] = useState<VotingRecord[]>([]);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);

  // Modal states
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [selectedVotingRecord, setSelectedVotingRecord] = useState<VotingRecord | null>(null);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<TimelineEvent | null>(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showPartyHistoryModal, setShowPartyHistoryModal] = useState(false);
  const [showConstituencyModal, setShowConstituencyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showAdvancedFiltersModal, setShowAdvancedFiltersModal] = useState(false);
  const [comparisonPolitician, setComparisonPolitician] = useState<Politician | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    loadDocumentsData();
    loadTimelineData();
    loadCommitmentsData();
    loadVotingData();
    loadNewsData();
  };

  const loadDocumentsData = () => {
    const sampleDocuments: Document[] = [
      {
        id: 1,
        politician_id: politician.id,
        title: `${politician.name} - Healthcare Reform Bill`,
        summary: 'Comprehensive policy document outlining strategic initiatives for healthcare development.',
        type: 'bill',
        date: '2023-09-15',
        source: 'Parliament of Kenya',
        tags: ['healthcare', 'policy', 'legislation'],
        url: 'https://example.com/documents/healthcare-bill.pdf',
      },
      {
        id: 2,
        politician_id: politician.id,
        title: 'Parliamentary Speech on Education',
        summary: 'Key speech delivered on education reform and funding allocation.',
        type: 'speech',
        date: '2023-10-20',
        source: 'Parliamentary Hansard',
        tags: ['education', 'speech', 'reform'],
        url: 'https://example.com/documents/education-speech.pdf',
      }
    ];
    setDocumentsData(sampleDocuments);
  };

  const loadTimelineData = () => {
    const sampleTimeline: TimelineEvent[] = [
      {
        id: 1,
        politician_id: politician.id,
        title: `${politician.name} Elected to Parliament`,
        description: 'Won constituency seat with significant margin, representing progressive policies.',
        date: '2022-08-09',
        type: 'position',
      },
      {
        id: 2,
        politician_id: politician.id,
        title: 'Healthcare Reform Achievement',
        description: 'Successfully passed landmark healthcare legislation expanding coverage.',
        date: '2023-06-15',
        type: 'achievement',
      }
    ];
    setTimelineData(sampleTimeline);
  };

  const loadCommitmentsData = () => {
    const sampleCommitments: Commitment[] = [
      {
        id: 1,
        politician_id: politician.id,
        promise: `${politician.name} pledged to improve healthcare access`,
        description: 'Committed to building 3 new health centers and increasing medical staff coverage.',
        category: 'Healthcare',
        date_made: '2022-03-15',
        status: 'in_progress',
        evidence: 'Construction begun on 1 health center, 10 medical staff hired.',
      },
      {
        id: 2,
        politician_id: politician.id,
        promise: 'Education reform initiative',
        description: 'Promised to digitize primary schools and provide learning resources.',
        category: 'Education',
        date_made: '2022-10-20',
        status: 'kept',
        evidence: 'All 5 primary schools digitized, 1,000 tablets distributed.',
      }
    ];
    setCommitmentsData(sampleCommitments);
  };

  const loadVotingData = () => {
    const sampleVoting: VotingRecord[] = [
      {
        id: 1,
        politician_id: politician.id,
        bill_number: 'HB-2023-001',
        bill_title: 'Healthcare Access Act',
        bill_summary: 'Comprehensive healthcare reform to expand access and reduce costs.',
        vote: 'yes',
        date: '2023-06-15',
        session: '2023 Legislative Session',
        category: 'Healthcare',
        bill_passed: true,
        notes: `${politician.name} strongly supported this landmark healthcare legislation.`,
      },
      {
        id: 2,
        politician_id: politician.id,
        bill_number: 'SB-2023-045',
        bill_title: 'Education Funding Bill',
        bill_summary: 'Increased budget allocation for primary and secondary education.',
        vote: 'yes',
        date: '2023-09-10',
        session: '2023 Legislative Session',
        category: 'Education',
        bill_passed: true,
        notes: 'Advocated for rural school development provisions.',
      }
    ];
    setVotingData(sampleVoting);
  };

  const loadNewsData = () => {
    const sampleNews: NewsItem[] = [
      {
        id: 1,
        headline: `${politician.name} Announces New Policy Initiative`,
        source_publication_date: '2024-08-20',
        system_addition_date: '2024-08-21',
        source: 'Daily Nation',
        credibility: 'high',
        link: 'https://example.com/news/1',
        summary: `${politician.name} has announced a comprehensive new policy initiative aimed at improving governance in ${politician.constituency}.`
      }
    ];
    setNewsData(sampleNews);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    loadAllData();
    setRefreshing(false);
  };

  const handleDocumentPress = (doc: Document) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  const handleNewsPress = (item: NewsItem) => {
    setSelectedNewsItem(item);
    setShowNewsModal(true);
  };

  const handleCommitmentPress = (commitment: Commitment) => {
    setSelectedCommitment(commitment);
    setShowCommitmentModal(true);
  };

  const handleVotingRecordPress = (record: VotingRecord) => {
    setSelectedVotingRecord(record);
    setShowVotingModal(true);
  };

  const handleTimelineEventPress = (event: TimelineEvent) => {
    setSelectedTimelineEvent(event);
    setShowTimelineModal(true);
  };

  const handleAchievementPress = (achievement: string) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'kept':
      case 'completed':
        return '#10B981';
      case 'in_progress':
        return '#F59E0B';
      case 'pending':
        return '#6B7280';
      case 'broken':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };


  // Render Bento Cards for Dashboard
  const renderBentoCard = (
    title: string,
    subtitle: string,
    icon: string,
    colors: string[],
    stats?: { main: string; sub: string },
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={[styles.bentoCard, { flex: 1 }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient colors={colors} style={styles.bentoGradient}>
        <View style={styles.bentoContent}>
          <View style={styles.bentoHeader}>
            <View style={styles.bentoIconContainer}>
              <MaterialIcons name={icon as any} size={28} color="#FFFFFF" />
            </View>
            {stats && (
              <View style={styles.bentoStatsContainer}>
                <Text style={styles.bentoStatsMain}>{stats.main}</Text>
                <Text style={styles.bentoStatsSub}>{stats.sub}</Text>
              </View>
            )}
          </View>
          <View style={styles.bentoTextContainer}>
            <Text style={styles.bentoTitle}>{title}</Text>
            <Text style={styles.bentoSubtitle}>{subtitle}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderDashboard = () => (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Enhanced Profile Section */}
      <View style={styles.profileSection}>
        <LinearGradient
          colors={['#2563EB', '#1D4ED8', '#1E40AF']}
          style={styles.profileBackground}
        >
          {/* Header Controls */}
          <View style={styles.profileHeader}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerRightButtons}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowEditModal(true)}
              >
                <MaterialIcons name="edit" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowShareModal(true)}
              >
                <MaterialIcons name="share" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerButton, isFollowed && styles.followedButton]}
                onPress={() => setIsFollowed(!isFollowed)}
              >
                <MaterialIcons
                  name={isFollowed ? "favorite" : "favorite-border"}
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <View style={styles.profileImageContainer}>
              {politician.image_url ? (
                <Image source={{ uri: politician.image_url }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileInitial}>{politician.name.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.onlineIndicator} />
            </View>
            <Text style={styles.profileName}>{politician.name}</Text>
            <Text style={styles.profileTitle}>{politician.title}</Text>
            <View style={styles.profileLocationContainer}>
              <TouchableOpacity
                onPress={() => setShowConstituencyModal(true)}
                style={styles.profileLocationItem}
              >
                <Text style={styles.profileLocation}>📍 {politician.constituency}</Text>
                <MaterialIcons name="info-outline" size={16} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
              <Text style={styles.profileLocationSeparator}>•</Text>
              <TouchableOpacity
                onPress={() => setShowPartyHistoryModal(true)}
                style={styles.profileLocationItem}
              >
                <Text style={styles.profileLocation}>{politician.party}</Text>
                <MaterialIcons name="history" size={16} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Key Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>95%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{politician.party_history?.length || 0}</Text>
              <Text style={styles.statLabel}>Parties</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{politician.key_achievements?.length || 0}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Navigation Grid */}
      <View style={styles.bentoGrid}>
        <View style={styles.bentoRow}>
          {renderBentoCard(
            'Latest News',
            'Recent coverage',
            'newspaper',
            ['#F59E0B', '#D97706'],
            { main: newsData.length.toString(), sub: 'articles' },
            () => setActiveView('news')
          )}
          {renderBentoCard(
            'Promises',
            'Campaign commitments',
            'assignment-turned-in',
            ['#10B981', '#059669'],
            { main: commitmentsData.length.toString(), sub: 'promises' },
            () => setActiveView('promises')
          )}
        </View>

        <View style={styles.bentoRow}>
          {renderBentoCard(
            'Voting Records',
            'Parliamentary votes',
            'how-to-vote',
            ['#8B5CF6', '#7C3AED'],
            { main: votingData.length.toString(), sub: 'votes' },
            () => setActiveView('voting')
          )}
          {renderBentoCard(
            'Timeline',
            'Political journey',
            'timeline',
            ['#EF4444', '#DC2626'],
            { main: timelineData.length.toString(), sub: 'events' },
            () => setActiveView('timeline')
          )}
        </View>

        <View style={styles.bentoRow}>
          {renderBentoCard(
            'Documents',
            'Speeches & policies',
            'description',
            ['#6366F1', '#4F46E5'],
            { main: documentsData.length.toString(), sub: 'docs' },
            () => setActiveView('documents')
          )}
          {renderBentoCard(
            'Career',
            'Professional background',
            'work',
            ['#06B6D4', '#0891B2'],
            { main: '15', sub: 'years' },
            () => setActiveView('career')
          )}
          {renderBentoCard(
            'Compare',
            'Compare with others',
            'compare-arrows',
            ['#8B5CF6', '#7C3AED'],
            { main: 'VS', sub: 'mode' },
            () => setShowComparisonModal(true)
          )}
        </View>
      </View>

      {/* Quick Info Cards */}
      <View style={styles.quickInfoSection}>
        <Text style={styles.sectionTitle}>Quick Overview</Text>

        {/* Education Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="school" size={24} color="#3B82F6" />
            <Text style={styles.infoTitle}>Education</Text>
          </View>
          <Text style={styles.infoText}>{politician.education}</Text>
        </View>

        {/* Key Achievements */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="emoji-events" size={24} color="#F59E0B" />
            <Text style={styles.infoTitle}>Key Achievements</Text>
          </View>
          {politician.key_achievements?.slice(0, 3).map((achievement, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleAchievementPress(achievement)}
              style={styles.achievementItemTouchable}
            >
              <Text style={styles.achievementItem}>• {achievement}</Text>
              <MaterialIcons name="chevron-right" size={16} color="#3B82F6" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderNews = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.backToOverview}
        onPress={() => setActiveView('dashboard')}
      >
        <MaterialIcons name="arrow-back" size={20} color="#3B82F6" />
        <Text style={styles.backText}>Back to Overview</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Latest News</Text>
      {newsData.map(item => (
        <NewsCard
          key={item.id}
          item={item}
          onPress={handleNewsPress}
        />
      ))}
    </ScrollView>
  );

  const renderPromises = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.backToOverview}
        onPress={() => setActiveView('dashboard')}
      >
        <MaterialIcons name="arrow-back" size={20} color="#3B82F6" />
        <Text style={styles.backText}>Back to Overview</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Campaign Promises</Text>
      {commitmentsData.map(commitment => (
        <TouchableOpacity
          key={commitment.id}
          onPress={() => handleCommitmentPress(commitment)}
          activeOpacity={0.7}
        >
          <Card variant="outlined" style={styles.promiseCard}>
            <View style={styles.promiseHeader}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(commitment.status) }]}>
                <Text style={styles.statusText}>{commitment.status.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <Text style={styles.promiseDate}>{commitment.date_made}</Text>
            </View>
            <Text style={styles.promiseText}>{commitment.promise}</Text>
            <Text style={styles.promiseContext}>{commitment.context}</Text>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'news':
        return (
          <PoliticianNewsScreen
            politicianId={politician.id}
            politicianName={politician.name}
            onBack={() => setActiveView('dashboard')}
          />
        );
      case 'promises':
        return (
          <PoliticianPromisesScreen
            politicianId={politician.id}
            politicianName={politician.name}
            onBack={() => setActiveView('dashboard')}
          />
        );
      case 'voting':
        return (
          <PoliticianVotingScreen
            politicianId={politician.id}
            politicianName={politician.name}
            onBack={() => setActiveView('dashboard')}
          />
        );
      case 'timeline':
        return (
          <PoliticianTimelineScreen
            politicianId={politician.id}
            politicianName={politician.name}
            onBack={() => setActiveView('dashboard')}
          />
        );
      case 'documents':
        return (
          <PoliticianDocumentsScreen
            politicianId={politician.id}
            politicianName={politician.name}
            onBack={() => setActiveView('dashboard')}
          />
        );
      case 'career':
        return (
          <PoliticianCareerScreen
            politicianId={politician.id}
            politicianName={politician.name}
            onBack={() => setActiveView('dashboard')}
          />
        );
      case 'dashboard':
      default:
        return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
      {renderContent()}

      {/* News Article Detail Modal */}
      <Modal
        visible={showNewsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowNewsModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>News Article</Text>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => selectedNewsItem?.link && Linking.openURL(selectedNewsItem.link)}
            >
              <MaterialIcons name="open-in-new" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedNewsItem && (
              <>
                <View style={styles.credibilityBadge}>
                  <MaterialIcons
                    name={selectedNewsItem.credibility === 'high' ? 'verified' : 'info'}
                    size={16}
                    color="#10B981"
                  />
                  <Text style={styles.credibilityText}>
                    {selectedNewsItem.credibility.toUpperCase()} CREDIBILITY
                  </Text>
                </View>

                <Text style={styles.newsModalHeadline}>{selectedNewsItem.headline}</Text>

                <View style={styles.newsModalMeta}>
                  <Text style={styles.newsModalSource}>{selectedNewsItem.source}</Text>
                  <Text style={styles.newsModalDate}>
                    {new Date(selectedNewsItem.source_publication_date).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.newsModalSummary}>{selectedNewsItem.summary}</Text>

                <TouchableOpacity
                  style={styles.readFullArticleButton}
                  onPress={() => selectedNewsItem.link && Linking.openURL(selectedNewsItem.link)}
                >
                  <Text style={styles.readFullArticleText}>Read Full Article</Text>
                  <MaterialIcons name="arrow-forward" size={16} color="#FFF" />
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Document Viewer Modal */}
      <Modal
        visible={showDocumentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDocumentModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDocumentModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Document</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="download" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedDocument && (
              <>
                <View style={styles.documentTypeBadge}>
                  <MaterialIcons name="description" size={16} color="#8B5CF6" />
                  <Text style={styles.documentTypeText}>
                    {selectedDocument.type.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.documentModalTitle}>{selectedDocument.title}</Text>

                <View style={styles.documentModalMeta}>
                  <Text style={styles.documentModalSource}>{selectedDocument.source}</Text>
                  <Text style={styles.documentModalDate}>
                    {new Date(selectedDocument.date).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.documentModalSummary}>{selectedDocument.summary}</Text>

                {selectedDocument.tags && (
                  <View style={styles.documentTags}>
                    {selectedDocument.tags.map((tag, index) => (
                      <View key={index} style={styles.documentTag}>
                        <Text style={styles.documentTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.viewDocumentButton}
                  onPress={() => selectedDocument.url && Linking.openURL(selectedDocument.url)}
                >
                  <Text style={styles.viewDocumentText}>View Full Document</Text>
                  <MaterialIcons name="open-in-new" size={16} color="#FFF" />
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Commitment/Promise Detail Modal */}
      <Modal
        visible={showCommitmentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCommitmentModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCommitmentModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Promise Details</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="share" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedCommitment && (
              <>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedCommitment.status) }]}>
                  <MaterialIcons
                    name={selectedCommitment.status === 'kept' ? 'check-circle' : 'schedule'}
                    size={16}
                    color="#FFF"
                  />
                  <Text style={styles.statusBadgeText}>
                    {selectedCommitment.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.commitmentModalPromise}>{selectedCommitment.promise}</Text>

                <View style={styles.commitmentModalMeta}>
                  <Text style={styles.commitmentModalCategory}>{selectedCommitment.category}</Text>
                  <Text style={styles.commitmentModalDate}>
                    Made: {new Date(selectedCommitment.date_made).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.commitmentModalDescription}>{selectedCommitment.description}</Text>

                {selectedCommitment.evidence && (
                  <View style={styles.evidenceSection}>
                    <Text style={styles.evidenceSectionTitle}>Evidence</Text>
                    <Text style={styles.evidenceText}>{selectedCommitment.evidence}</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Achievement Detail Modal */}
      <Modal
        visible={showAchievementModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAchievementModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAchievementModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Achievement Details</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="fact-check" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedAchievement && (
              <>
                <View style={styles.verificationBadge}>
                  <MaterialIcons name="verified" size={16} color="#10B981" />
                  <Text style={styles.verificationText}>VERIFIED ACHIEVEMENT</Text>
                </View>

                <Text style={styles.achievementModalTitle}>{selectedAchievement}</Text>

                <View style={styles.achievementDetails}>
                  <Text style={styles.achievementDetailLabel}>Verification Sources:</Text>
                  <Text style={styles.achievementDetailText}>
                    • Parliamentary records{'\n'}
                    • Official gazette notices{'\n'}
                    • Media coverage verification
                  </Text>
                </View>

                <View style={styles.achievementDetails}>
                  <Text style={styles.achievementDetailLabel}>Impact Assessment:</Text>
                  <Text style={styles.achievementDetailText}>
                    Significant contribution to {politician.constituency} development and governance.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Party History Modal */}
      <Modal
        visible={showPartyHistoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPartyHistoryModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPartyHistoryModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Political Party History</Text>
            <View style={styles.modalActionButton} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.partyHistoryTitle}>Party Affiliations Timeline</Text>

            {politician.party_history?.map((party, index) => (
              <View key={index} style={styles.partyHistoryItem}>
                <View style={styles.partyHistoryBadge}>
                  <Text style={styles.partyHistoryText}>{party}</Text>
                </View>
                <View style={styles.partyHistoryDetails}>
                  <Text style={styles.partyHistoryReason}>
                    {index === 0 ? 'Initial political affiliation' :
                     index === politician.party_history.length - 1 ? 'Current party' :
                     'Strategic political realignment'}
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.partyAnalysis}>
              <Text style={styles.partyAnalysisTitle}>Analysis</Text>
              <Text style={styles.partyAnalysisText}>
                {politician.name} has been affiliated with {politician.party_history?.length || 0} political parties,
                showing adaptability to Kenya's evolving political landscape.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Constituency Information Modal */}
      <Modal
        visible={showConstituencyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowConstituencyModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowConstituencyModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Constituency Info</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="map" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.constituencyName}>{politician.constituency}</Text>

            <View style={styles.constituencyStats}>
              <View style={styles.constituencyStat}>
                <Text style={styles.constituencyStatNumber}>~245,000</Text>
                <Text style={styles.constituencyStatLabel}>Population</Text>
              </View>
              <View style={styles.constituencyStat}>
                <Text style={styles.constituencyStatNumber}>156</Text>
                <Text style={styles.constituencyStatLabel}>Wards</Text>
              </View>
              <View style={styles.constituencyStat}>
                <Text style={styles.constituencyStatNumber}>3</Text>
                <Text style={styles.constituencyStatLabel}>Sub-counties</Text>
              </View>
            </View>

            <View style={styles.constituencyInfo}>
              <Text style={styles.constituencyInfoTitle}>Key Development Projects</Text>
              <Text style={styles.constituencyInfoText}>
                • Healthcare center expansion{'\n'}
                • Road infrastructure improvement{'\n'}
                • Education facility modernization{'\n'}
                • Water supply projects
              </Text>
            </View>

            <View style={styles.constituencyInfo}>
              <Text style={styles.constituencyInfoTitle}>Economic Focus</Text>
              <Text style={styles.constituencyInfoText}>
                Agriculture, tourism, and coastal trade form the backbone of the local economy.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Share/Export Options Modal */}
      <Modal
        visible={showShareModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowShareModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowShareModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Share Profile</Text>
            <View style={styles.modalActionButton} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.shareModalTitle}>Share {politician.name}'s Profile</Text>

            <View style={styles.shareOptions}>
              <TouchableOpacity style={styles.shareOption}>
                <MaterialIcons name="link" size={24} color="#3B82F6" />
                <Text style={styles.shareOptionText}>Copy Profile Link</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption}>
                <MaterialIcons name="picture-as-pdf" size={24} color="#EF4444" />
                <Text style={styles.shareOptionText}>Generate PDF Fact Sheet</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption}>
                <MaterialIcons name="image" size={24} color="#10B981" />
                <Text style={styles.shareOptionText}>Create Summary Image</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption}>
                <MaterialIcons name="share" size={24} color="#8B5CF6" />
                <Text style={styles.shareOptionText}>Share via Social Media</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption}>
                <MaterialIcons name="email" size={24} color="#F59E0B" />
                <Text style={styles.shareOptionText}>Email Profile Summary</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Voting Record Detail Modal */}
      <Modal
        visible={showVotingModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVotingModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowVotingModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Voting Record</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="how-to-vote" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedVotingRecord && (
              <>
                <View style={[styles.votingBadge, { backgroundColor: selectedVotingRecord.vote === 'yes' ? '#10B981' : '#EF4444' }]}>
                  <MaterialIcons
                    name={selectedVotingRecord.vote === 'yes' ? 'thumb-up' : 'thumb-down'}
                    size={16}
                    color="#FFF"
                  />
                  <Text style={styles.votingBadgeText}>
                    VOTED {selectedVotingRecord.vote.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.votingModalTitle}>{selectedVotingRecord.bill_title}</Text>

                <View style={styles.votingModalMeta}>
                  <Text style={styles.votingModalBillNumber}>Bill #{selectedVotingRecord.bill_number}</Text>
                  <Text style={styles.votingModalDate}>
                    {new Date(selectedVotingRecord.date).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.votingModalSummary}>{selectedVotingRecord.bill_summary}</Text>

                <View style={styles.votingModalSession}>
                  <Text style={styles.votingModalSessionTitle}>Legislative Session</Text>
                  <Text style={styles.votingModalSessionText}>{selectedVotingRecord.session}</Text>
                </View>

                <View style={styles.votingModalCategory}>
                  <Text style={styles.votingModalCategoryTitle}>Category</Text>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{selectedVotingRecord.category}</Text>
                  </View>
                </View>

                {selectedVotingRecord.notes && (
                  <View style={styles.votingNotesSection}>
                    <Text style={styles.votingNotesSectionTitle}>Notes</Text>
                    <Text style={styles.votingNotesText}>{selectedVotingRecord.notes}</Text>
                  </View>
                )}

                <View style={styles.billStatusSection}>
                  <Text style={styles.billStatusTitle}>Bill Status</Text>
                  <View style={[styles.billStatusBadge, { backgroundColor: selectedVotingRecord.bill_passed ? '#10B981' : '#EF4444' }]}>
                    <MaterialIcons
                      name={selectedVotingRecord.bill_passed ? 'check' : 'close'}
                      size={16}
                      color="#FFF"
                    />
                    <Text style={styles.billStatusText}>
                      {selectedVotingRecord.bill_passed ? 'PASSED' : 'FAILED'}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Timeline Event Detail Modal */}
      <Modal
        visible={showTimelineModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTimelineModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTimelineModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Timeline Event</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="timeline" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedTimelineEvent && (
              <>
                <View style={styles.timelineEventHeader}>
                  <View style={styles.timelineEventDate}>
                    <MaterialIcons name="event" size={20} color="#3B82F6" />
                    <Text style={styles.timelineEventDateText}>
                      {new Date(selectedTimelineEvent.date).getFullYear()}
                    </Text>
                  </View>
                  <View style={styles.timelineEventType}>
                    <Text style={styles.timelineEventTypeText}>
                      {selectedTimelineEvent.type.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.timelineEventTitle}>{selectedTimelineEvent.title}</Text>

                <Text style={styles.timelineEventDescription}>
                  {selectedTimelineEvent.description}
                </Text>

                <View style={styles.timelineEventDetails}>
                  <Text style={styles.timelineEventDetailsTitle}>Event Details</Text>
                  <Text style={styles.timelineEventDetailsText}>
                    This milestone represents a significant moment in {politician.name}'s political career,
                    contributing to their overall trajectory in Kenyan politics.
                  </Text>
                </View>

                <View style={styles.timelineEventImpact}>
                  <Text style={styles.timelineEventImpactTitle}>Political Impact</Text>
                  <Text style={styles.timelineEventImpactText}>
                    This event has had lasting implications for both {politician.name}'s career
                    and the broader political landscape in {politician.constituency}.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Enhanced Politician Edit Form Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEditModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Politician</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="save" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.editFormSection}>
              <Text style={styles.editFormSectionTitle}>Basic Information</Text>

              <View style={styles.editFormField}>
                <Text style={styles.editFormLabel}>Full Name</Text>
                <View style={styles.editFormInput}>
                  <Text style={styles.editFormInputText}>{politician.name}</Text>
                </View>
              </View>

              <View style={styles.editFormField}>
                <Text style={styles.editFormLabel}>Current Position</Text>
                <View style={styles.editFormInput}>
                  <Text style={styles.editFormInputText}>{politician.title}</Text>
                </View>
              </View>

              <View style={styles.editFormField}>
                <Text style={styles.editFormLabel}>Constituency</Text>
                <View style={styles.editFormInput}>
                  <Text style={styles.editFormInputText}>{politician.constituency}</Text>
                </View>
              </View>

              <View style={styles.editFormField}>
                <Text style={styles.editFormLabel}>Current Party</Text>
                <View style={styles.editFormInput}>
                  <Text style={styles.editFormInputText}>{politician.party}</Text>
                </View>
              </View>
            </View>

            <View style={styles.editFormSection}>
              <Text style={styles.editFormSectionTitle}>Education & Background</Text>

              <View style={styles.editFormField}>
                <Text style={styles.editFormLabel}>Education</Text>
                <View style={[styles.editFormInput, styles.editFormTextArea]}>
                  <Text style={styles.editFormInputText}>{politician.education}</Text>
                </View>
              </View>
            </View>

            <View style={styles.editFormSection}>
              <Text style={styles.editFormSectionTitle}>Political Career</Text>

              <View style={styles.editFormField}>
                <Text style={styles.editFormLabel}>Key Achievements</Text>
                {politician.key_achievements?.map((achievement, index) => (
                  <View key={index} style={styles.achievementEditItem}>
                    <Text style={styles.achievementEditText}>• {achievement}</Text>
                    <TouchableOpacity style={styles.achievementEditButton}>
                      <MaterialIcons name="edit" size={16} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addAchievementButton}>
                  <MaterialIcons name="add" size={16} color="#10B981" />
                  <Text style={styles.addAchievementText}>Add Achievement</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.editFormField}>
                <Text style={styles.editFormLabel}>Party History</Text>
                {politician.party_history?.map((party, index) => (
                  <View key={index} style={styles.partyEditItem}>
                    <Text style={styles.partyEditText}>{party}</Text>
                    <TouchableOpacity style={styles.partyEditButton}>
                      <MaterialIcons name="edit" size={16} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addPartyButton}>
                  <MaterialIcons name="add" size={16} color="#10B981" />
                  <Text style={styles.addPartyText}>Add Party Affiliation</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.editFormActions}>
              <TouchableOpacity style={styles.saveChangesButton}>
                <MaterialIcons name="save" size={20} color="#FFF" />
                <Text style={styles.saveChangesText}>Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resetFormButton}>
                <MaterialIcons name="refresh" size={20} color="#EF4444" />
                <Text style={styles.resetFormText}>Reset Form</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Politician Comparison Modal */}
      <Modal
        visible={showComparisonModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowComparisonModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowComparisonModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Compare Politicians</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="compare" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.comparisonTitle}>Compare with {politician.name}</Text>

            {/* Comparison Grid */}
            <View style={styles.comparisonGrid}>
              <View style={styles.comparisonColumn}>
                <View style={styles.comparisonPoliticianCard}>
                  <View style={styles.comparisonPoliticianImage}>
                    <Text style={styles.comparisonPoliticianInitial}>
                      {politician.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.comparisonPoliticianName}>{politician.name}</Text>
                  <Text style={styles.comparisonPoliticianTitle}>{politician.title}</Text>
                </View>

                <View style={styles.comparisonData}>
                  <View style={styles.comparisonDataItem}>
                    <Text style={styles.comparisonDataLabel}>Experience</Text>
                    <Text style={styles.comparisonDataValue}>15 years</Text>
                  </View>
                  <View style={styles.comparisonDataItem}>
                    <Text style={styles.comparisonDataLabel}>Achievements</Text>
                    <Text style={styles.comparisonDataValue}>{politician.key_achievements?.length || 0}</Text>
                  </View>
                  <View style={styles.comparisonDataItem}>
                    <Text style={styles.comparisonDataLabel}>Party Changes</Text>
                    <Text style={styles.comparisonDataValue}>{politician.party_history?.length || 0}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.comparisonVs}>
                <Text style={styles.comparisonVsText}>VS</Text>
              </View>

              <View style={styles.comparisonColumn}>
                <TouchableOpacity
                  style={styles.selectPoliticianCard}
                  onPress={() => {
                    // Handle politician selection for comparison
                  }}
                >
                  <MaterialIcons name="add" size={48} color="#3B82F6" />
                  <Text style={styles.selectPoliticianText}>Select Politician to Compare</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.comparisonSuggestions}>
              <Text style={styles.suggestionTitle}>Suggested Comparisons</Text>

              <TouchableOpacity style={styles.suggestionItem}>
                <View style={styles.suggestionImage}>
                  <Text style={styles.suggestionInitial}>W</Text>
                </View>
                <View style={styles.suggestionDetails}>
                  <Text style={styles.suggestionName}>William Ruto</Text>
                  <Text style={styles.suggestionReason}>Same region, different party</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#3B82F6" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.suggestionItem}>
                <View style={styles.suggestionImage}>
                  <Text style={styles.suggestionInitial}>R</Text>
                </View>
                <View style={styles.suggestionDetails}>
                  <Text style={styles.suggestionName}>Raila Odinga</Text>
                  <Text style={styles.suggestionReason}>Similar experience level</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
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
  profileSection: {
    marginBottom: 24,
  },
  profileBackground: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  followedButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  profileInitial: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  profileTitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  profileLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  profileLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  profileLocation: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  profileLocationSeparator: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginTop: 4,
  },
  bentoGrid: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  bentoRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  bentoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  bentoGradient: {
    padding: 20,
    minHeight: 140,
  },
  bentoContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bentoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoStatsContainer: {
    alignItems: 'flex-end',
  },
  bentoStatsMain: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bentoStatsSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  bentoTextContainer: {},
  bentoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bentoSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  quickInfoSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  achievementItemTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    marginBottom: 4,
  },
  achievementItem: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backToOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 8,
  },
  promiseCard: {
    marginBottom: 16,
  },
  promiseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  promiseDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  promiseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  promiseContext: {
    fontSize: 14,
    color: '#6B7280',
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
  modalActionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  // News Modal Styles
  credibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  credibilityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#065F46',
    marginLeft: 6,
  },
  newsModalHeadline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 16,
  },
  newsModalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  newsModalSource: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  newsModalDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  newsModalSummary: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  readFullArticleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  readFullArticleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Document Modal Styles
  documentTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  documentTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B46C1',
    marginLeft: 6,
  },
  documentModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 28,
    marginBottom: 16,
  },
  documentModalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  documentModalSource: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  documentModalDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  documentModalSummary: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 20,
  },
  documentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  documentTag: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  documentTagText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  viewDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  viewDocumentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Commitment Modal Styles
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  commitmentModalPromise: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 28,
    marginBottom: 16,
  },
  commitmentModalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  commitmentModalCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  commitmentModalDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  commitmentModalDescription: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 20,
  },
  evidenceSection: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  evidenceSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  evidenceText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },

  // Achievement Modal Styles
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#065F46',
    marginLeft: 6,
  },
  achievementModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 28,
    marginBottom: 20,
  },
  achievementDetails: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  achievementDetailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  achievementDetailText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Party History Modal Styles
  partyHistoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  partyHistoryItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  partyHistoryBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  partyHistoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  partyHistoryDetails: {
    marginTop: 4,
  },
  partyHistoryReason: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  partyAnalysis: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  partyAnalysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  partyAnalysisText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },

  // Constituency Modal Styles
  constituencyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  constituencyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  constituencyStat: {
    alignItems: 'center',
  },
  constituencyStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  constituencyStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  constituencyInfo: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  constituencyInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  constituencyInfoText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },

  // Share Modal Styles
  shareModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  shareOptions: {
    gap: 12,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shareOptionText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    marginLeft: 12,
  },

  // Voting Record Modal Styles
  votingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  votingBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  votingModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 28,
    marginBottom: 16,
  },
  votingModalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  votingModalBillNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  votingModalDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  votingModalSummary: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 20,
  },
  votingModalSession: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  votingModalSessionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  votingModalSessionText: {
    fontSize: 14,
    color: '#4B5563',
  },
  votingModalCategory: {
    marginBottom: 16,
  },
  votingModalCategoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryTagText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  votingNotesSection: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  votingNotesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  votingNotesText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  billStatusSection: {
    marginTop: 8,
  },
  billStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  billStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  billStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },

  // Timeline Event Modal Styles
  timelineEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineEventDate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timelineEventDateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginLeft: 6,
  },
  timelineEventType: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timelineEventTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  timelineEventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 28,
    marginBottom: 16,
  },
  timelineEventDescription: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 20,
  },
  timelineEventDetails: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  timelineEventDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  timelineEventDetailsText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  timelineEventImpact: {
    backgroundColor: '#FEF7FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  timelineEventImpactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  timelineEventImpactText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },

  // Enhanced Edit Form Modal Styles
  editFormSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  editFormSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },
  editFormField: {
    marginBottom: 16,
  },
  editFormLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  editFormInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  editFormTextArea: {
    minHeight: 80,
  },
  editFormInputText: {
    fontSize: 16,
    color: '#1F2937',
  },
  achievementEditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  achievementEditText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  achievementEditButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#EBF4FF',
  },
  addAchievementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    justifyContent: 'center',
  },
  addAchievementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 8,
  },
  partyEditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  partyEditText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  partyEditButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#EBF4FF',
  },
  addPartyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    justifyContent: 'center',
  },
  addPartyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 8,
  },
  editFormActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  saveChangesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveChangesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resetFormButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  resetFormText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },

  // Comparison Modal Styles
  comparisonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  comparisonGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  comparisonColumn: {
    flex: 1,
  },
  comparisonPoliticianCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  comparisonPoliticianImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  comparisonPoliticianInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  comparisonPoliticianName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  comparisonPoliticianTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  comparisonData: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  comparisonDataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  comparisonDataLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  comparisonDataValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  comparisonVs: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  comparisonVsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectPoliticianCard: {
    backgroundColor: '#F8FAFC',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    minHeight: 200,
    justifyContent: 'center',
  },
  selectPoliticianText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  comparisonSuggestions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  suggestionImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  suggestionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  suggestionReason: {
    fontSize: 14,
    color: '#6B7280',
  },
});