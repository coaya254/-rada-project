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
import ApiService from '../../services/api';

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
  // Get politician data from navigation params
  const politician = route.params?.politician;

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

  const loadDocumentsData = async () => {
    if (!politician) return;
    try {
      const response = await ApiService.getDocuments(politician.id);
      const documents = response.success ? response.data : response;
      setDocumentsData(documents);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocumentsData([]);
    }
  };

  const loadTimelineData = async () => {
    if (!politician) return;
    try {
      const response = await ApiService.getTimeline(politician.id);
      const timeline = response.success ? response.data : response;
      setTimelineData(timeline);
    } catch (error) {
      console.error('Error loading timeline:', error);
      setTimelineData([]);
    }
  };

  const loadCommitmentsData = async () => {
    if (!politician) return;
    try {
      const response = await ApiService.getCommitments(politician.id);
      const commitments = response.success ? response.data : response;
      setCommitmentsData(commitments);
    } catch (error) {
      console.error('Error loading commitments:', error);
      setCommitmentsData([]);
    }
  };

  const loadVotingData = async () => {
    if (!politician) return;
    try {
      const response = await ApiService.getVotingRecords(politician.id);
      const voting = response.success ? response.data : response;
      setVotingData(voting);
    } catch (error) {
      console.error('Error loading voting records:', error);
      setVotingData([]);
    }
  };

  const loadNewsData = async () => {
    if (!politician) return;
    try {
      const response = await ApiService.getPoliticianNews(politician.id);
      const news = response.success ? response.data : response;
      setNewsData(news);
    } catch (error) {
      console.error('Error loading news:', error);
      setNewsData([]);
    }
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
              {politician.imageUrl ? (
                <Image source={{ uri: politician.imageUrl }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileInitial}>{politician.name.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.onlineIndicator} />
            </View>
            <Text style={styles.profileName}>{politician.name}</Text>
            <Text style={styles.profileTitle}>{politician.position || politician.current_position}</Text>
            <View style={styles.profileLocationContainer}>
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
              <Text style={styles.statValue}>
                {votingData.length > 0
                  ? `${Math.round((votingData.filter(v => v.vote !== 'absent').length / votingData.length) * 100)}%`
                  : 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{politician.rating || 'N/A'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{politician.years_in_office || 0}</Text>
              <Text style={styles.statLabel}>Years</Text>
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
            { main: politician.years_in_office?.toString() || '0', sub: 'years' },
            () => setActiveView('career')
          )}
          {renderBentoCard(
            'Compare',
            'Compare with others',
            'compare-arrows',
            ['#8B5CF6', '#7C3AED'],
            { main: 'VS', sub: 'mode' },
            () => navigation.navigate('PoliticianComparison')
          )}
        </View>
      </View>

      {/* Quick Info Cards */}
      <View style={styles.quickInfoSection}>
        <Text style={styles.sectionTitle}>Quick Overview</Text>

        {/* Biography */}
        {politician.bio && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="person" size={24} color="#3B82F6" />
              <Text style={styles.infoTitle}>Biography</Text>
            </View>
            <Text style={styles.infoText}>{politician.bio}</Text>
          </View>
        )}
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
                    Significant contribution to political development and governance.
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
            <Text style={styles.partyHistoryTitle}>Party Affiliation</Text>

            <View style={styles.partyHistoryItem}>
              <View style={styles.partyHistoryBadge}>
                <Text style={styles.partyHistoryText}>{politician.party}</Text>
              </View>
              <View style={styles.partyHistoryDetails}>
                <Text style={styles.partyHistoryReason}>Current political party</Text>
              </View>
            </View>

            <View style={styles.partyAnalysis}>
              <Text style={styles.partyAnalysisTitle}>Analysis</Text>
              <Text style={styles.partyAnalysisText}>
                {politician.name} is currently affiliated with {politician.party}.
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
            <Text style={styles.constituencyName}>{politician.party} Party</Text>

            <View style={styles.constituencyInfo}>
              <Text style={styles.constituencyInfoTitle}>Political Party</Text>
              <Text style={styles.constituencyInfoText}>
                {politician.name} represents the {politician.party} political party in Kenya.
              </Text>
            </View>

            <View style={styles.constituencyInfo}>
              <Text style={styles.constituencyInfoTitle}>Focus Areas</Text>
              <Text style={styles.constituencyInfoText}>
                Working to advance party policies and serve constituents across various sectors.
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
                    This event has had lasting implications for {politician.name}'s political career
                    and Kenya's broader political landscape.
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
                  <Text style={styles.editFormInputText}>{politician.position || politician.current_position}</Text>
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
              <Text style={styles.editFormSectionTitle}>Biography</Text>

              <View style={styles.editFormField}>
                <Text style={styles.editFormLabel}>Biography</Text>
                <View style={[styles.editFormInput, styles.editFormTextArea]}>
                  <Text style={styles.editFormInputText}>{politician.bio || 'No biography available'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.editFormSection}>
              <Text style={styles.editFormSectionTitle}>Political Information</Text>

              <View style={styles.editFormField}>
                <Text style={styles.editFormLabel}>Rating</Text>
                <View style={styles.editFormInput}>
                  <Text style={styles.editFormInputText}>{politician.rating || 'Not rated'}</Text>
                </View>
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