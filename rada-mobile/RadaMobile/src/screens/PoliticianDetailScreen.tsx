import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Image,
  Alert,
  Modal,
  Linking,
  FlatList,
  RefreshControl} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFavorites } from '../contexts/FavoritesContext';
import ShareButton from '../components/ShareButton';

const { width } = Dimensions.get('window');

interface Politician {
  id: number;
  name: string;
  current_position: string;
  party_history: string[];
  constituency: string;
  wikipedia_summary: string;
  key_achievements: string[];
  education: string;
  image_url?: string;
  slug: string;
}

interface NewsItem {
  id: number;
  headline: string;
  source_publication_date: string; // When the source published it
  system_addition_date: string;    // When we added it to our system
  source: string;
  credibility: 'maximum' | 'high' | 'medium' | 'single';
  link: string;
  summary: string;
}

interface Document {
  id: number;
  title: string;
  date: string;
  type: 'speech' | 'policy' | 'parliamentary';
  source: string;
  key_quotes?: string[];
  summary: string;
}

interface TimelineEvent {
  id: number;
  year: number;
  event: string;
  significance: string;
  sources: string[];
  context: string;
}

interface Commitment {
  id: number;
  promise: string;
  context: string;
  date_made: string;
  sources: string[];
  status: 'completed' | 'in_progress' | 'pending' | 'broken';
  related_actions?: {
    action: string;
    date: string;
    source: string;
    connection: string;
  }[];
}

const PoliticianDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { politician } = route.params as { politician: Politician };
  const { toggleFavorite, isFavorite } = useFavorites();
  
  // Main view state for full-screen navigation (matching interface design)
  const [activeView, setActiveView] = useState<'dashboard' | 'voting' | 'promises' | 'timeline' | 'career' | 'documents'>('dashboard');
  const [documentsSubTab, setDocumentsSubTab] = useState<'official' | 'speeches'>('official');
  const [refreshing, setRefreshing] = useState(false);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [documentsData, setDocumentsData] = useState<Document[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineEvent[]>([]);
  const [commitmentsData, setCommitmentsData] = useState<Commitment[]>([]);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);

  useEffect(() => {
    loadPoliticianData();
  }, [politician.id]);

  const loadPoliticianData = () => {
    // Load data based on politician ID
    loadNewsData();
    loadDocumentsData();
    loadTimelineData();
    loadCommitmentsData();
  };

  const loadNewsData = () => {
    // Sample news data - replace with API call
    const sampleNews: NewsItem[] = [
      {
        id: 1,
        headline: `${politician.name} Announces New Policy Initiative`,
        source_publication_date: '2024-08-20',
        system_addition_date: '2024-08-21',
        source: 'BBC Africa',
        credibility: 'maximum',
        link: 'https://bbc.com/africa',
        summary: `${politician.name} launched a comprehensive new policy program targeting key development areas.`
      },
      {
        id: 2,
        headline: `${politician.name} Addresses National Assembly`,
        source_publication_date: '2024-07-15',
        system_addition_date: '2024-07-16',
        source: 'Reuters',
        credibility: 'maximum',
        link: 'https://reuters.com',
        summary: `${politician.name} delivered a major speech to parliament outlining the government's agenda.`
      },
      {
        id: 3,
        headline: `${politician.name} Meets with International Leaders`,
        source_publication_date: '2024-06-10',
        system_addition_date: '2024-06-11',
        source: 'The Standard',
        credibility: 'high',
        link: 'https://standardmedia.co.ke',
        summary: `${politician.name} held bilateral talks with visiting international leaders to strengthen diplomatic relations.`
      }
    ];
    setNewsData(sampleNews);
  };

  const loadDocumentsData = () => {
    const sampleDocuments: Document[] = [
      {
        id: 1,
        title: `${politician.name} - Official Inauguration Address`,
        date: '2022-09-13',
        type: 'speech',
        source: 'Kenya Presidency/Hansard',
        key_quotes: ['Unity and inclusivity', 'Economic transformation'],
        summary: 'Official inauguration speech outlining the new administration\'s priorities.'
      },
      {
        id: 2,
        title: `${politician.name} - Policy Framework Document`,
        date: '2022-10-01',
        type: 'policy',
        source: 'Office of the President',
        summary: 'Comprehensive policy blueprint focusing on national development.'
      },
      {
        id: 3,
        title: `${politician.name} - Parliamentary Address on Budget`,
        date: '2023-06-15',
        type: 'speech',
        source: 'Kenya National Assembly',
        key_quotes: ['Fiscal responsibility', 'Economic growth'],
        summary: 'Address to parliament on the national budget and economic priorities.'
      },
      {
        id: 4,
        title: `${politician.name} - Constitutional Amendment Bill`,
        date: '2023-03-20',
        type: 'parliamentary',
        source: 'Kenya Gazette',
        summary: 'Official document proposing constitutional amendments for governance reforms.'
      }
    ];
    setDocumentsData(sampleDocuments);
  };

  const loadTimelineData = () => {
    const sampleTimeline: TimelineEvent[] = [
      {
        id: 1,
        year: 2002,
        event: `${politician.name} enters national politics`,
        significance: 'Entry into national politics',
        sources: ['IEBC records', 'Wikipedia'],
        context: 'Part of major political wave'
      },
      {
        id: 2,
        year: 2005,
        event: `${politician.name} campaigns for constitutional reforms`,
        significance: 'Established as reform voice',
        sources: ['Hansard records', 'Nation archive'],
        context: 'Key role in constitutional process'
      },
      {
        id: 3,
        year: 2013,
        event: `${politician.name} elected to major position`,
        significance: 'Major political achievement',
        sources: ['IEBC results', 'International observers'],
        context: 'Significant electoral victory'
      },
      {
        id: 4,
        year: 2022,
        event: `${politician.name} current position`,
        significance: 'Current political role',
        sources: ['IEBC official', 'BBC', 'Reuters'],
        context: 'Latest political development'
      }
    ];
    setTimelineData(sampleTimeline);
  };

  const loadCommitmentsData = () => {
    const sampleCommitments: Commitment[] = [
      {
        id: 1,
        promise: 'Create jobs and economic opportunities',
        context: '2022 Campaign',
        date_made: '2022-06-15',
        sources: ['Campaign manifesto', 'BBC interview'],
        status: 'in_progress',
        related_actions: [
          {
            action: 'Employment Program Launch',
            date: '2024-06-01',
            source: 'The Standard',
            connection: 'Direct implementation attempt'
          }
        ]
      },
      {
        id: 2,
        promise: 'Improve infrastructure and development',
        context: 'Presidential inauguration',
        date_made: '2022-09-13',
        sources: ['Official inauguration speech'],
        status: 'in_progress',
        related_actions: [
          {
            action: 'Infrastructure Bill signed',
            date: '2023-12-15',
            source: 'Kenya Gazette',
            connection: 'Legislative foundation established'
          }
        ]
      }
    ];
    setCommitmentsData(sampleCommitments);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      loadPoliticianData();
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'completed': '#10b981',
      'in_progress': '#3b82f6',
      'pending': '#f59e0b',
      'broken': '#ef4444'
    };
    return colors[status] || '#666';
  };

  const getSourceColor = (source: string) => {
    const sourceColors: { [key: string]: string } = {
      'BBC': '#FF6B6B', // Red
      'Reuters': '#4ECDC4', // Teal
      'CNN': '#45B7D1', // Blue
      'Al Jazeera': '#96CEB4', // Green
      'The Economist': '#FFEAA7', // Yellow
      'The Standard': '#DDA0DD', // Plum
      'Daily Nation': '#98D8C8', // Mint
      'The Star': '#F7DC6F', // Gold
      'KBC': '#BB8FCE', // Purple
      'NTV': '#85C1E9', // Light Blue
    };
    
    // Find matching source
    for (const [key, color] of Object.entries(sourceColors)) {
      if (source.includes(key)) {
        return color;
      }
    }
    
    return '#6b7280'; // Default gray
  };

  const getSourceBadgeTextColor = (source: string) => {
    const lightColors = ['#FFEAA7', '#F7DC6F']; // Colors that need dark text
    const color = getSourceColor(source);
    return lightColors.includes(color) ? '#333' : 'white';
  };

  const handleNewsCardPress = (item: NewsItem) => {
    setSelectedNewsItem(item);
    setShowNewsModal(true);
  };

  const handleReadMore = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Could not open the link');
    }
  };

  const handleDocumentCardPress = (item: Document) => {
    setSelectedDocument(item);
    setShowDocumentModal(true);
  };

  const handleCommitmentCardPress = (item: Commitment) => {
    setSelectedCommitment(item);
    setShowCommitmentModal(true);
  };

  // Enhanced bento card for React Native
  const BentoCard = ({ title, subtitle, iconName, colors, stats, onPress, size = "normal" }) => (
    <TouchableOpacity
      style={[
        styles.bentoCard,
        size === "large" && styles.bentoCardLarge,
        size === "tall" && styles.bentoCardTall
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={colors}
        style={styles.bentoGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <View style={styles.bentoContent}>
          <View style={styles.bentoHeader}>
            <View style={styles.bentoIconContainer}>
              <MaterialIcons name={iconName} size={28} color="#FFFFFF" />
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

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Dashboard Header */}
      <View style={styles.dashboardHeader}>
        <View style={styles.dashboardHeaderButtons}>
          <TouchableOpacity style={styles.dashboardHeaderButton}>
            <MaterialIcons name="chevron-left" size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.dashboardHeaderRightButtons}>
            <TouchableOpacity style={styles.dashboardHeaderButton}>
              <MaterialIcons name="share" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dashboardHeaderButton, isFollowed && styles.dashboardFollowedButton]}
              onPress={() => setIsFollowed(!isFollowed)}
            >
              <MaterialIcons
                name={isFollowed ? "favorite" : "favorite-border"}
                size={20}
                color={isFollowed ? "#FFFFFF" : "#374151"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Enhanced Profile Section */}
      <View style={styles.profileSection}>
        <LinearGradient
          colors={['#2563EB', '#1D4ED8', '#1E40AF']}
          style={styles.profileBackground}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <View style={styles.profileContent}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                {politician.image_url ? (
                  <Image source={{ uri: politician.image_url }} style={styles.profileImageActual} />
                ) : (
                  <Text style={styles.profileImageText}>{politician.name.split(' ').map(n => n[0]).join('')}</Text>
                )}
              </View>
              <View style={styles.activeIndicator}>
                <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.profileName}>{politician.name}</Text>
            <View style={styles.profileTitle}>
              <Ionicons name="star" size={16} color="#FFFFFF" />
              <Text style={styles.profileTitleText}>{politician.current_position}</Text>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.profileDetailItem}>
                <Ionicons name="location" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.profileDetailText}>{politician.constituency}</Text>
              </View>
              <View style={styles.profileDetailItem}>
                <Ionicons name="school" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.profileDetailText}>{politician.education ? 'Educated' : 'Self-taught'}</Text>
              </View>
            </View>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>17</Text>
                <Text style={styles.statLabel}>YEARS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>95%</Text>
                <Text style={styles.statLabel}>ATTENDANCE</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{politician.key_achievements.length}</Text>
                <Text style={styles.statLabel}>ACHIEVEMENTS</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Bento Grid Research Dashboard */}
      <View style={styles.bentoSection}>
        <Text style={styles.sectionTitle}>Research Dashboard</Text>

        <View style={styles.bentoGrid}>
          <BentoCard
            title="Performance"
            subtitle="Voting record & attendance tracking"
            iconName="bar-chart"
            colors={['#10B981', '#059669']}
            stats={{ main: quickStats.attendance, sub: "attendance" }}
            onPress={() => setActiveView('voting')}
            size="large"
          />

          <BentoCard
            title="Promises"
            subtitle="Track campaign commitments"
            iconName="track-changes"
            colors={['#EF4444', '#DC2626']}
            stats={{ main: commitmentsData.length.toString(), sub: "active" }}
            onPress={() => setActiveView('promises')}
          />

          <BentoCard
            title="Recent"
            subtitle="Latest news & activities"
            iconName="flash-on"
            colors={['#8B5CF6', '#7C3AED']}
            stats={{ main: newsData.length.toString(), sub: "this week" }}
            onPress={() => setActiveView('timeline')}
          />

          <BentoCard
            title="Career"
            subtitle="Political journey timeline"
            iconName="business-center"
            colors={['#F59E0B', '#D97706']}
            stats={{ main: timelineData.length.toString(), sub: "milestones" }}
            onPress={() => setActiveView('career')}
          />

          <BentoCard
            title="Documents"
            subtitle="Policy papers & speeches"
            iconName="description"
            colors={['#3B82F6', '#2563EB']}
            stats={{ main: documentsData.length.toString(), sub: "documents" }}
            onPress={() => setActiveView('documents')}
          />
        </View>

        {/* Dashboard Action Section */}
        <View style={styles.dashboardActionSection}>
          <TouchableOpacity style={styles.dashboardPrimaryButton} activeOpacity={0.8}>
            <Text style={styles.dashboardPrimaryButtonText}>Compare with Other Politicians</Text>
          </TouchableOpacity>

          <View style={styles.dashboardTipCard}>
            <View style={styles.dashboardTipIconContainer}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
            </View>
            <View style={styles.dashboardTipContent}>
              <Text style={styles.dashboardTipTitle}>Make Informed Decisions</Text>
              <Text style={styles.dashboardTipText}>
                Cross-reference campaign promises with actual voting records. Check multiple sources and compare with other politicians to form your own opinion.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Traditional Info Sections (condensed) */}
      <View style={styles.overviewContent}>

        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>📚</Text>
            <Text style={styles.infoLabel}>Biography</Text>
          </View>
          <Text style={styles.infoValue}>{politician.wikipedia_summary}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>🎓</Text>
            <Text style={styles.infoLabel}>Education</Text>
          </View>
          <Text style={styles.infoValue}>{politician.education}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>🏛️</Text>
            <Text style={styles.infoLabel}>Party History</Text>
          </View>
          {politician.party_history.map((party, index) => (
            <Text key={index} style={styles.infoValue}>• {party}</Text>
          ))}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>🏆</Text>
            <Text style={styles.infoLabel}>Key Achievements</Text>
          </View>
          {politician.key_achievements.map((achievement, index) => (
            <Text key={index} style={styles.infoValue}>• {achievement}</Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderNewsTab = () => (
    <FlatList
      data={newsData}
      renderItem={({ item }: { item: NewsItem }) => (
        <TouchableOpacity
          style={styles.modernNewsCard}
          onPress={() => handleNewsCardPress(item)}
          activeOpacity={0.8}
        >
          {/* News Card Header */}
          <View style={styles.modernNewsHeader}>
            <View style={styles.modernNewsMeta}>
              <View style={[styles.modernSourceBadge, { backgroundColor: getSourceColor(item.source) + '20' }]}>
                <Text style={[styles.modernSourceBadgeText, { color: getSourceColor(item.source) }]}>
                  {item.source}
                </Text>
              </View>
              <View style={styles.modernNewsDate}>
                <Ionicons name="time" size={14} color="#6B7280" />
                <Text style={styles.modernNewsDateText}>{item.source_publication_date}</Text>
              </View>
            </View>
            <View style={styles.modernCredibilityBadge}>
              <View style={[styles.modernCredibilityDot, {
                backgroundColor: item.credibility === 'maximum' ? '#10B981' :
                              item.credibility === 'high' ? '#3B82F6' :
                              item.credibility === 'medium' ? '#F59E0B' : '#EF4444'
              }]} />
              <Text style={styles.modernCredibilityText}>{item.credibility.toUpperCase()}</Text>
            </View>
          </View>

          {/* News Content */}
          <View style={styles.modernNewsContent}>
            <Text style={styles.modernNewsHeadline}>{item.headline}</Text>
            <Text style={styles.modernNewsSummary} numberOfLines={3}>{item.summary}</Text>
          </View>

          {/* News Footer */}
          <View style={styles.modernNewsFooter}>
            <View style={styles.modernNewsActions}>
              <View style={styles.modernActionButton}>
                <Ionicons name="eye" size={16} color="#6B7280" />
                <Text style={styles.modernActionText}>Read</Text>
              </View>
              <View style={styles.modernActionButton}>
                <Ionicons name="share" size={16} color="#6B7280" />
                <Text style={styles.modernActionText}>Share</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item: NewsItem) => item.id.toString()}
      contentContainerStyle={styles.modernNewsList}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.modernEmptyState}>
          <View style={styles.modernEmptyIcon}>
            <Ionicons name="newspaper" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.modernEmptyTitle}>No news available</Text>
          <Text style={styles.modernEmptySubtitle}>Check back later for the latest updates</Text>
        </View>
      }
    />
  );

  const renderNewsModal = () => (
    <Modal
      visible={showNewsModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowNewsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modernModalContent}>
          {/* Modern Header */}
          <View style={styles.modernModalHeader}>
            <View>
              <Text style={styles.modernModalTitle}>Article Preview</Text>
              <Text style={styles.modernModalSubtitle}>Latest news coverage</Text>
            </View>
            <TouchableOpacity
              style={styles.modernCloseButton}
              onPress={() => setShowNewsModal(false)}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {selectedNewsItem && (
            <ScrollView style={styles.modernModalBody} showsVerticalScrollIndicator={false}>
              {/* Source Badge */}
              <View style={styles.modernSourceBadge}>
                <Text style={styles.modernSourceBadgeText}>
                  {selectedNewsItem.source}
                </Text>
                <View style={styles.breakingDot} />
                <Text style={styles.breakingText}>BREAKING</Text>
              </View>

              {/* Headline */}
              <Text style={styles.modernHeadline}>{selectedNewsItem.headline}</Text>

              {/* Meta info */}
              <View style={styles.modernMetaRow}>
                <View style={styles.modernMetaItem}>
                  <Ionicons name="time" size={16} color="#6B7280" />
                  <Text style={styles.modernMetaText}>{selectedNewsItem.source_publication_date}</Text>
                </View>
              </View>

              {/* Content */}
              <View style={styles.modernContentSection}>
                <Text style={styles.modernSummary}>
                  {selectedNewsItem.summary}
                  {'\n\n'}
                  This is a brief preview of the article. For the complete story and full context,
                  please visit the original source using the links below.
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.modernActionsSection}>
                <TouchableOpacity
                  style={styles.modernPrimaryButton}
                  onPress={() => handleReadMore(selectedNewsItem.link)}
                >
                  <Ionicons name="document-text" size={20} color="#FFFFFF" />
                  <Text style={styles.modernPrimaryButtonText}>Read Full Article</Text>
                </TouchableOpacity>

                <View style={styles.modernOtherSources}>
                  <Text style={styles.modernSectionLabel}>Other Sources</Text>
                  <View style={styles.modernSourcesGrid}>
                    <TouchableOpacity style={[styles.modernSourceButton, { backgroundColor: '#10B981' }]}>
                      <Text style={styles.modernSourceButtonText}>KBC</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modernSourceButton, { backgroundColor: '#3B82F6' }]}>
                      <Text style={styles.modernSourceButtonText}>NTV</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modernSourceButton, { backgroundColor: '#8B5CF6' }]}>
                      <Text style={styles.modernSourceButtonText}>Standard</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderDocumentsTab = () => {
    const officialDocs = documentsData.filter((doc: Document) => doc.type === 'policy' || doc.type === 'parliamentary');
    const speeches = documentsData.filter((doc: Document) => doc.type === 'speech');

    return (
      <View style={styles.documentsContainer}>
        {/* Documents Sub-tabs */}
        <View style={styles.documentsSubTabs}>
          <TouchableOpacity
            style={[styles.documentsSubTab, documentsSubTab === 'official' && styles.activeDocumentsSubTab]}
            onPress={() => setDocumentsSubTab('official')}
          >
            <Text style={[styles.documentsSubTabText, documentsSubTab === 'official' && styles.activeDocumentsSubTabText]}>
              📄 Official Documents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.documentsSubTab, documentsSubTab === 'speeches' && styles.activeDocumentsSubTab]}
            onPress={() => setDocumentsSubTab('speeches')}
          >
            <Text style={[styles.documentsSubTabText, documentsSubTab === 'speeches' && styles.activeDocumentsSubTabText]}>
              🎤 Speeches
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={documentsSubTab === 'official' ? officialDocs : speeches}
          renderItem={({ item }: { item: Document }) => (
            <TouchableOpacity
              style={styles.modernDocumentCard}
              onPress={() => handleDocumentCardPress(item)}
              activeOpacity={0.8}
            >
              {/* Document Header */}
              <View style={styles.modernDocumentHeader}>
                <View style={styles.modernDocumentTypeContainer}>
                  <View style={[styles.modernDocumentTypeBadge, {
                    backgroundColor: item.type === 'speech' ? '#8B5CF620' :
                                   item.type === 'policy' ? '#3B82F620' : '#10B98120'
                  }]}>
                    <Ionicons
                      name={item.type === 'speech' ? 'mic' :
                           item.type === 'policy' ? 'document-text' : 'library'}
                      size={16}
                      color={item.type === 'speech' ? '#8B5CF6' :
                             item.type === 'policy' ? '#3B82F6' : '#10B981'}
                    />
                    <Text style={[styles.modernDocumentTypeText, {
                      color: item.type === 'speech' ? '#8B5CF6' :
                             item.type === 'policy' ? '#3B82F6' : '#10B981'
                    }]}>
                      {item.type.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.modernDocumentDate}>
                  <Ionicons name="calendar" size={14} color="#6B7280" />
                  <Text style={styles.modernDocumentDateText}>{item.date}</Text>
                </View>
              </View>

              {/* Document Content */}
              <View style={styles.modernDocumentContent}>
                <Text style={styles.modernDocumentTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.modernDocumentSummary} numberOfLines={3}>{item.summary}</Text>
              </View>

              {/* Key Quotes Preview */}
              {item.key_quotes && item.key_quotes.length > 0 && (
                <View style={styles.modernQuotesPreview}>
                  <View style={styles.modernQuotePreviewCard}>
                    <Ionicons name="chatbox-ellipses" size={16} color="#8B5CF6" />
                    <Text style={styles.modernQuotePreviewText} numberOfLines={2}>
                      "{item.key_quotes[0]}"
                    </Text>
                  </View>
                  {item.key_quotes.length > 1 && (
                    <Text style={styles.modernMoreQuotes}>+{item.key_quotes.length - 1} more quotes</Text>
                  )}
                </View>
              )}

              {/* Document Footer */}
              <View style={styles.modernDocumentFooter}>
                <View style={styles.modernDocumentSource}>
                  <Ionicons name="business" size={14} color="#6B7280" />
                  <Text style={styles.modernDocumentSourceText}>{item.source}</Text>
                </View>
                <View style={styles.modernDocumentActions}>
                  <View style={styles.modernActionButton}>
                    <Ionicons name="eye" size={16} color="#6B7280" />
                    <Text style={styles.modernActionText}>View</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item: Document) => item.id.toString()}
          contentContainerStyle={styles.modernDocumentsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.modernEmptyState}>
              <View style={styles.modernEmptyIcon}>
                <Ionicons
                  name={documentsSubTab === 'official' ? 'document-text' : 'mic'}
                  size={48}
                  color="#9CA3AF"
                />
              </View>
              <Text style={styles.modernEmptyTitle}>
                No {documentsSubTab === 'official' ? 'official documents' : 'speeches'} available
              </Text>
              <Text style={styles.modernEmptySubtitle}>Check back later for updates</Text>
            </View>
          }
        />
      </View>
    );
  };

  const renderTimelineTab = () => (
    <FlatList
      data={timelineData}
      renderItem={({ item, index }: { item: TimelineEvent; index: number }) => (
        <View style={styles.modernTimelineItem}>
          {/* Timeline Connector */}
          <View style={styles.modernTimelineConnector}>
            <View style={styles.modernTimelineYear}>
              <Text style={styles.modernYearText}>{item.year}</Text>
            </View>
            {index < timelineData.length - 1 && (
              <View style={styles.modernTimelineLine} />
            )}
          </View>

          {/* Timeline Card */}
          <View style={styles.modernTimelineCard}>
            {/* Timeline Header */}
            <View style={styles.modernTimelineHeader}>
              <View style={styles.modernTimelineIconContainer}>
                <Ionicons name="star" size={20} color="#F59E0B" />
              </View>
              <View style={styles.modernTimelineHeaderText}>
                <Text style={styles.modernTimelineSignificance}>{item.significance}</Text>
                <View style={styles.modernTimelineYearBadge}>
                  <Ionicons name="calendar" size={12} color="#6B7280" />
                  <Text style={styles.modernTimelineYearBadgeText}>{item.year}</Text>
                </View>
              </View>
            </View>

            {/* Timeline Content */}
            <View style={styles.modernTimelineContent}>
              <Text style={styles.modernTimelineEvent}>{item.event}</Text>
              <Text style={styles.modernTimelineContext}>{item.context}</Text>
            </View>

            {/* Timeline Sources */}
            <View style={styles.modernTimelineSources}>
              <Text style={styles.modernTimelineSourcesLabel}>Verified Sources</Text>
              <View style={styles.modernTimelineSourcesList}>
                {item.sources.map((source: string, sourceIndex: number) => (
                  <View key={sourceIndex} style={styles.modernTimelineSource}>
                    <Ionicons name="link" size={12} color="#8B5CF6" />
                    <Text style={styles.modernTimelineSourceText}>{source}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Timeline Actions */}
            <View style={styles.modernTimelineActions}>
              <TouchableOpacity style={styles.modernTimelineActionButton}>
                <Ionicons name="information-circle" size={16} color="#3B82F6" />
                <Text style={styles.modernTimelineActionText}>Learn More</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modernTimelineActionButton}>
                <Ionicons name="share" size={16} color="#6B7280" />
                <Text style={styles.modernTimelineActionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      keyExtractor={(item: TimelineEvent) => item.id.toString()}
      contentContainerStyle={styles.modernTimelineList}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.modernEmptyState}>
          <View style={styles.modernEmptyIcon}>
            <Ionicons name="time" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.modernEmptyTitle}>No timeline available</Text>
          <Text style={styles.modernEmptySubtitle}>Check back later for career milestones</Text>
        </View>
      }
    />
  );

  const renderVotingTab = () => {
    const quickStats = {
      totalVotes: 15,
      attendance: '95%',
      partyLoyalty: '80%',
      controversial: 3
    };

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.subHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setActiveView('dashboard')}
          >
            <MaterialIcons name="chevron-left" size={24} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text style={styles.subHeaderTitle}>Voting Record</Text>
            <Text style={styles.subHeaderSubtitle}>Performance & attendance data</Text>
          </View>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.statsGrid}>
            {[
              { value: quickStats.attendance, label: 'Attendance', color: '#10B981', change: '+2% improvement', context: 'vs previous term' },
              { value: quickStats.partyLoyalty, label: 'Party Loyalty', color: '#8B5CF6', change: '-5% change', context: 'more independent' },
              { value: quickStats.totalVotes, label: 'Total Votes', color: '#3B82F6', change: '100% participation', context: 'Current term' },
              { value: quickStats.controversial, label: 'Controversial', color: '#F59E0B', change: '20% of total', context: 'Difficult votes' }
            ].map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={[styles.statCardValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statCardLabel}>{stat.label}</Text>
                <Text style={styles.statCardChange}>{stat.change}</Text>
                <Text style={styles.statCardContext}>{stat.context}</Text>
              </View>
            ))}
          </View>

          <View style={styles.votingBreakdown}>
            <Text style={styles.cardTitle}>Recent Voting Pattern</Text>
            {[
              { label: 'Government Bills', percentage: 80, color: '#10B981' },
              { label: 'Opposition Bills', percentage: 25, color: '#EF4444' },
              { label: 'Cross-party Bills', percentage: 95, color: '#3B82F6' }
            ].map((item, index) => (
              <View key={index} style={styles.votingItem}>
                <Text style={styles.votingLabel}>{item.label}</Text>
                <View style={styles.votingRight}>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
                  </View>
                  <Text style={styles.votingPercentage}>{item.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => (navigation as any).navigate('VotingRecords', {
              politicianId: politician.id,
              politicianName: politician.name
            })}
          >
            <View>
              <Text style={styles.actionCardTitle}>View Complete Voting History</Text>
              <Text style={styles.actionCardSubtitle}>Detailed breakdown by bill, date & topic</Text>
            </View>
            <Ionicons name="open-in-new" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const [expandedCommitment, setExpandedCommitment] = useState<number | null>(null);
  const [isFollowed, setIsFollowed] = useState(false);

  // Quick stats from interface design
  const quickStats = {
    totalVotes: 15,
    attendance: '95%',
    partyLoyalty: '80%',
    controversial: 3
  };

  const renderCommitmentsTab = () => (
    <ScrollView style={styles.modernPromisesContainer} showsVerticalScrollIndicator={false}>
      {/* Promise Tracker Header */}
      <View style={styles.modernPromisesSubHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setActiveView('dashboard')}
        >
          <MaterialIcons name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        <View>
          <Text style={styles.modernPromisesSubHeaderTitle}>Promise Tracker</Text>
          <Text style={styles.modernPromisesSubHeaderSubtitle}>Campaign commitments vs reality</Text>
        </View>
      </View>

      <View style={styles.modernPromisesContent}>
        {/* Accountability Dashboard Header */}
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          style={styles.modernPromiseHeader}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <View style={styles.modernPromiseHeaderIcon}>
            <Ionicons name="analytics" size={28} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.modernPromiseHeaderTitle}>Accountability Dashboard</Text>
            <Text style={styles.modernPromiseHeaderSubtitle}>Track promises from campaign to delivery</Text>
          </View>
        </LinearGradient>

        {/* Promises List */}
        <View style={styles.modernPromisesList}>
          {commitmentsData.map((commitment: Commitment) => {
            const progress = commitment.status === 'completed' ? 100 :
                           commitment.status === 'in_progress' ? 65 :
                           commitment.status === 'pending' ? 25 : 10;

            return (
              <View key={commitment.id} style={styles.modernPromiseCard}>
                {/* Promise Card Header */}
                <View style={styles.modernPromiseCardHeader}>
                  <Text style={styles.modernPromiseTitle}>{commitment.promise}</Text>
                  <View style={[styles.modernPromiseStatus, {
                    backgroundColor: getStatusColor(commitment.status) + '20'
                  }]}>
                    <Text style={[styles.modernPromiseStatusText, {
                      color: getStatusColor(commitment.status)
                    }]}>
                      {commitment.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Progress Section */}
                <View style={styles.modernProgressSection}>
                  <View style={styles.modernProgressHeader}>
                    <Text style={styles.modernProgressLabel}>Progress</Text>
                    <Text style={styles.modernProgressValue}>{progress}%</Text>
                  </View>
                  <View style={styles.modernProgressContainer}>
                    <View style={[styles.modernProgressFill, {
                      width: `${progress}%`,
                      backgroundColor: getStatusColor(commitment.status)
                    }]} />
                  </View>
                </View>

                {/* Promise Footer */}
                <View style={styles.modernPromiseFooter}>
                  <Text style={styles.modernPromiseDate}>Made: {commitment.date_made}</Text>
                  <TouchableOpacity
                    style={styles.modernDetailsButton}
                    onPress={() => setExpandedCommitment(
                      expandedCommitment === commitment.id ? null : commitment.id
                    )}
                  >
                    <Text style={styles.modernDetailsButtonText}>
                      {expandedCommitment === commitment.id ? 'Hide' : 'Details'}
                    </Text>
                    <Ionicons
                      name={expandedCommitment === commitment.id ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#3B82F6"
                    />
                  </TouchableOpacity>
                </View>

                {/* Expanded Details */}
                {expandedCommitment === commitment.id && (
                  <View style={styles.modernExpandedDetails}>
                    <View style={styles.modernDetailSection}>
                      <Text style={styles.modernDetailSectionTitle}>SOURCES</Text>
                      <Text style={styles.modernDetailSectionText}>
                        {commitment.sources.join(', ')}
                      </Text>
                    </View>
                    {commitment.related_actions && (
                      <View style={styles.modernDetailSection}>
                        <Text style={styles.modernDetailSectionTitle}>RECENT ACTIONS</Text>
                        <Text style={styles.modernDetailSectionText}>
                          {commitment.related_actions.map(action => action.action).join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

  const renderDocumentModal = () => (
    <Modal
      visible={showDocumentModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDocumentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modernModalContent}>
          {/* Modern Header */}
          <View style={styles.modernModalHeader}>
            <View>
              <Text style={styles.modernModalTitle}>Document Details</Text>
              <Text style={styles.modernModalSubtitle}>Official government document</Text>
            </View>
            <TouchableOpacity
              style={styles.modernCloseButton}
              onPress={() => setShowDocumentModal(false)}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {selectedDocument && (
            <ScrollView style={styles.modernModalBody} showsVerticalScrollIndicator={false}>
              {/* Document Type Badge */}
              <View style={[styles.modernTypeBadge, { backgroundColor: '#3B82F620' }]}>
                <Ionicons name="document-text" size={16} color="#3B82F6" />
                <Text style={[styles.modernTypeBadgeText, { color: '#3B82F6' }]}>
                  {selectedDocument.type.toUpperCase()}
                </Text>
              </View>

              {/* Title */}
              <Text style={styles.modernHeadline}>{selectedDocument.title}</Text>

              {/* Meta info */}
              <View style={styles.modernMetaGrid}>
                <View style={styles.modernMetaCard}>
                  <Ionicons name="calendar" size={20} color="#6B7280" />
                  <Text style={styles.modernMetaCardLabel}>Date</Text>
                  <Text style={styles.modernMetaCardValue}>{selectedDocument.date}</Text>
                </View>
                <View style={styles.modernMetaCard}>
                  <Ionicons name="business" size={20} color="#6B7280" />
                  <Text style={styles.modernMetaCardLabel}>Source</Text>
                  <Text style={styles.modernMetaCardValue}>{selectedDocument.source}</Text>
                </View>
              </View>

              {/* Content */}
              <View style={styles.modernContentSection}>
                <Text style={styles.modernSectionLabel}>Summary</Text>
                <Text style={styles.modernSummary}>{selectedDocument.summary}</Text>
              </View>

              {/* Key Quotes */}
              {selectedDocument.key_quotes && (
                <View style={styles.modernContentSection}>
                  <Text style={styles.modernSectionLabel}>Key Quotes</Text>
                  <View style={styles.modernQuotesContainer}>
                    {selectedDocument.key_quotes.map((quote: string, index: number) => (
                      <View key={index} style={styles.modernQuoteCard}>
                        <Ionicons name="chatbox-ellipses" size={20} color="#8B5CF6" />
                        <Text style={styles.modernQuoteText}>"{quote}"</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Actions */}
              <View style={styles.modernActionsSection}>
                <TouchableOpacity style={styles.modernPrimaryButton}>
                  <Ionicons name="eye" size={20} color="#FFFFFF" />
                  <Text style={styles.modernPrimaryButtonText}>View Full Document</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderCommitmentModal = () => (
    <Modal
      visible={showCommitmentModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCommitmentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modernModalContent}>
          {/* Modern Header with Gradient */}
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.modernModalHeaderGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <View>
              <Text style={styles.modernModalTitleWhite}>Promise Tracker</Text>
              <Text style={styles.modernModalSubtitleWhite}>Campaign commitment details</Text>
            </View>
            <TouchableOpacity
              style={styles.modernCloseButtonWhite}
              onPress={() => setShowCommitmentModal(false)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>

          {selectedCommitment && (
            <ScrollView style={styles.modernModalBody} showsVerticalScrollIndicator={false}>
              {/* Status Badge */}
              <View style={[styles.modernStatusBadge, {
                backgroundColor: getStatusColor(selectedCommitment.status) + '20'
              }]}>
                <View style={[styles.modernStatusDot, {
                  backgroundColor: getStatusColor(selectedCommitment.status)
                }]} />
                <Text style={[styles.modernStatusText, {
                  color: getStatusColor(selectedCommitment.status)
                }]}>
                  {selectedCommitment.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>

              {/* Promise */}
              <Text style={styles.modernHeadline}>{selectedCommitment.promise}</Text>

              {/* Meta Grid */}
              <View style={styles.modernMetaGrid}>
                <View style={styles.modernMetaCard}>
                  <Ionicons name="calendar" size={20} color="#6B7280" />
                  <Text style={styles.modernMetaCardLabel}>Made</Text>
                  <Text style={styles.modernMetaCardValue}>{selectedCommitment.date_made}</Text>
                </View>
                <View style={styles.modernMetaCard}>
                  <Ionicons name="location" size={20} color="#6B7280" />
                  <Text style={styles.modernMetaCardLabel}>Context</Text>
                  <Text style={styles.modernMetaCardValue}>{selectedCommitment.context}</Text>
                </View>
              </View>

              {/* Status Description */}
              <View style={styles.modernContentSection}>
                <Text style={styles.modernSectionLabel}>Status Update</Text>
                <Text style={styles.modernSummary}>
                  This commitment was made during {selectedCommitment.context} and is currently
                  {selectedCommitment.status === 'completed' ? ' completed' :
                   selectedCommitment.status === 'in_progress' ? ' in progress' :
                   selectedCommitment.status === 'pending' ? ' pending' : ' broken'}.
                </Text>
              </View>

              {/* Related Actions */}
              {selectedCommitment.related_actions && (
                <View style={styles.modernContentSection}>
                  <Text style={styles.modernSectionLabel}>Related Actions</Text>
                  <View style={styles.modernActionsContainer}>
                    {selectedCommitment.related_actions.map((action: any, index: number) => (
                      <View key={index} style={styles.modernActionCard}>
                        <View style={styles.modernActionHeader}>
                          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                          <Text style={styles.modernActionTitle}>{action.action}</Text>
                        </View>
                        <Text style={styles.modernActionDate}>{action.date}</Text>
                        <Text style={styles.modernActionConnection}>{action.connection}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Sources */}
              <View style={styles.modernContentSection}>
                <Text style={styles.modernSectionLabel}>Sources</Text>
                <View style={styles.modernSourcesContainer}>
                  {selectedCommitment.sources.map((source: string, index: number) => (
                    <View key={index} style={styles.modernSourceItem}>
                      <Ionicons name="link" size={16} color="#8B5CF6" />
                      <Text style={styles.modernSourceItemText}>{source}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderDashboard = () => renderOverviewTab();

  const renderVotingView = () => (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setActiveView('dashboard')}
        >
          <MaterialIcons name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        <View>
          <Text style={styles.subHeaderTitle}>Voting Record</Text>
          <Text style={styles.subHeaderSubtitle}>Performance & attendance data</Text>
        </View>
      </View>
      {renderVotingTab()}
    </View>
  );

  const renderPromisesView = () => (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setActiveView('dashboard')}
        >
          <MaterialIcons name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        <View>
          <Text style={styles.subHeaderTitle}>Campaign Promises</Text>
          <Text style={styles.subHeaderSubtitle}>Track commitments & progress</Text>
        </View>
      </View>
      {renderCommitmentsTab()}
    </View>
  );

  const renderTimelineView = () => (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setActiveView('dashboard')}
        >
          <MaterialIcons name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        <View>
          <Text style={styles.subHeaderTitle}>Recent News</Text>
          <Text style={styles.subHeaderSubtitle}>Latest activities & updates</Text>
        </View>
      </View>
      {renderNewsTab()}
    </View>
  );

  const renderCareerView = () => (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setActiveView('dashboard')}
        >
          <MaterialIcons name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        <View>
          <Text style={styles.subHeaderTitle}>Political Career</Text>
          <Text style={styles.subHeaderSubtitle}>Timeline & milestones</Text>
        </View>
      </View>
      {renderTimelineTab()}
    </View>
  );

  const renderDocumentsView = () => (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setActiveView('dashboard')}
        >
          <MaterialIcons name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        <View>
          <Text style={styles.subHeaderTitle}>Documents</Text>
          <Text style={styles.subHeaderSubtitle}>Policy papers & speeches</Text>
        </View>
      </View>
      {renderDocumentsTab()}
    </View>
  );

  const renderView = () => {
    switch(activeView) {
      case 'voting': return renderVotingView();
      case 'promises': return renderPromisesView();
      case 'timeline': return renderTimelineView();
      case 'career': return renderCareerView();
      case 'documents': return renderDocumentsView();
      default: return renderDashboard();
    }
  };

  return (
    <View style={styles.container}>
      {activeView === 'dashboard' && (
        <LinearGradient
          colors={['#FF6B6B', '#4ECDC4']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={() => (navigation as any).goBack()}
            >
              <MaterialIcons name="chevron-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politician.name}</Text>
            <View style={styles.headerActions}>
              <ShareButton
                data={{
                  name: politician.name,
                  position: politician.current_position,
                  party: politician.party_history[politician.party_history.length - 1] || 'Independent',
                  achievements: politician.key_achievements,
                  summary: politician.wikipedia_summary,
                  imageUrl: politician.image_url}}
                type="politician"
                variant="minimal"
                iconSize={20}
                showText={false}
                style={styles.headerShareButton}
              />
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(politician)}
              >
                <MaterialIcons
                  name={isFavorite(politician.id) ? "favorite" : "favorite-border"}
                  size={24}
                  color={isFavorite(politician.id) ? "#ff4757" : "white"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      )}
      {renderView()}
      {renderNewsModal()}
      {renderDocumentModal()}
      {renderCommitmentModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'},
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20},
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center'},
  headerBackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)'},
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16},
  headerSpacer: {
    width: 40},
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8},
  headerShareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)'},
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)'},
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'},
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12},
  activeTabButton: {
    backgroundColor: '#4ECDC4'},
  tabIcon: {
    fontSize: 16,
    marginBottom: 4},
  tabLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500'},
  activeTabLabel: {
    color: 'white'},
  content: {
    flex: 1},
  tabContent: {
    flex: 1},
  commitmentsContainer: {
    flex: 1},
  overviewContent: {
    padding: 20},
  politicianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2},
  politicianImageContainer: {
    marginRight: 16},
  politicianImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#4ECDC4'},
  politicianImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#4ECDC4'},
  politicianInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white'},
  politicianInfo: {
    flex: 1},
  politicianName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4},
  politicianPosition: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
    marginBottom: 4},
  politicianConstituency: {
    fontSize: 14,
    color: '#666'},
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2},
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12},
  infoIcon: {
    fontSize: 20,
    marginRight: 8},
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a'},
  infoValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4},
  newsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 2},
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12},
  newsHeadline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8},
  newsSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12},
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between'},
  newsDate: {
    fontSize: 12,
    color: '#999'},
  documentsContainer: {
    flex: 1},
  documentsSubTabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'},
  documentsSubTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 4},
  activeDocumentsSubTab: {
    backgroundColor: '#4ECDC4'},
  documentsSubTabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'},
  activeDocumentsSubTabText: {
    color: 'white',
    fontWeight: '600'},
  documentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 2},
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12},
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8},
  documentTypeBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12},
  documentTypeText: {
    fontSize: 10,
    color: '#0284c7',
    fontWeight: '600',
    textTransform: 'uppercase'},
  documentSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12},
  quotesSection: {
    marginBottom: 12},
  quotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4},
  quote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4},
  documentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between'},
  documentDate: {
    fontSize: 12,
    color: '#999'},
  documentSource: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500'},
  timelineCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 2},
  timelineYear: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16},
  yearText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white'},
  timelineContent: {
    flex: 1},
  timelineEvent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4},
  timelineSignificance: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
    marginBottom: 4},
  timelineContext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8},
  sourcesSection: {
    marginTop: 8},
  sourcesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4},
  sourceText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2},
  commitmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 2},
  commitmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12},
  commitmentPromise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8},
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12},
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase'},
  commitmentContext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4},
  commitmentDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12},
  actionsSection: {
    marginBottom: 12},
  actionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4},
  actionItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4},
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2},
  actionDate: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2},
  actionConnection: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic'},
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40},
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16},
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center'},
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20},
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#6b7280', // Gray for regular sources
  },
  sourceBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase'},
  sourceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8},
  sourceButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8},
  sourceButtonText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center'},
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden'},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'},
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a'},
  closeButton: {
    padding: 5},
  modalBody: {
    padding: 15},
  modalSourceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 10},
  modalSourceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase'},
  modalHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8},
  modalDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10},
  modalSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15},
  modalActions: {
    marginTop: 10},
  readMoreButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10},
  readMoreButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600'},
  otherSourcesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8},
  otherSourcesButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap'},
  otherSourceButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8},
  otherSourceButtonText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase'},
  dateContainer: {
    flexDirection: 'column',
    marginBottom: 8},
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 8},
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4},
  modalQuotesSection: {
    marginBottom: 12},
  modalQuotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4},
  modalQuote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4},
  modalActionsSection: {
    marginBottom: 12},
  modalActionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4},
  modalActionItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4},
  modalActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2},
  modalActionDate: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2},
  modalActionConnection: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic'},
  modalSourcesSection: {
    marginTop: 8},
  modalSourcesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4},
  modalSourceText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2},
  
  // Voting Tab Styles
  votingTabContainer: {
    padding: 20},
  votingTabHeader: {
    marginBottom: 20},
  votingTabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8},
  votingTabSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20},
  votingTabButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2},
  votingTabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'},
  votingTabButtonInfo: {
    flex: 1},
  votingTabButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4},
  votingTabButtonSubtitle: {
    fontSize: 14,
    color: '#6b7280'},
  votingTabStats: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2},
  votingTabStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12},
  votingTabStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12},
  votingTabStatItem: {
    width: (width - 80) / 2,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8},
  votingTabStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4},
  votingTabStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center'},
  
  // Enhanced Commitments Button Styles
  enhancedCommitmentsButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#059669',
    elevation: 2},
  enhancedCommitmentsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'},
  enhancedCommitmentsButtonInfo: {
    flex: 1},
  enhancedCommitmentsButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4},
  enhancedCommitmentsButtonSubtitle: {
    fontSize: 14,
    color: '#6b7280'},

  // Sub Header Styles
  subHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subHeaderTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  subHeaderSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },

  // New Bento Grid Styles from Interface
  profileSection: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  profileBackground: {
    padding: 24,
  },
  profileContent: {
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileImageActual: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  profileTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  profileDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  profileDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileDetailText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 32,
  },

  // Bento Section Styles
  bentoSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 24,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  bentoCard: {
    width: (width - 64) / 2,
    height: 144,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  bentoCardLarge: {
    width: width - 48,
    height: 160,
  },
  bentoCardTall: {
    height: 320,
  },
  bentoGradient: {
    flex: 1,
    padding: 20,
  },
  bentoContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bentoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoStatsContainer: {
    alignItems: 'flex-end',
  },
  bentoStatsMain: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  bentoStatsSub: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  bentoTextContainer: {
    marginTop: 12,
  },
  bentoTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 4,
  },
  bentoSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },

  // Action Section Styles
  actionSection: {
    gap: 24,
  },
  primaryButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    gap: 16,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4ED8',
    lineHeight: 22,
  },

  // Enhanced Voting Styles
  subHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subHeaderTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  subHeaderSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },

  // Content Section Styles
  contentSection: {
    padding: 24,
    gap: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: (width - 64) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardValue: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  statCardLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  statCardChange: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  statCardContext: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Voting Breakdown Styles
  votingBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 16,
  },
  votingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  votingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  votingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarContainer: {
    width: 96,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  votingPercentage: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
    minWidth: 40,
    textAlign: 'right',
  },

  // Action Card Styles
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3B82F6',
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#60A5FA',
  },

  // ========== MODERN MODAL STYLES ==========
  // Base Modal Styles
  modernModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },

  // Header Styles
  modernModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modernModalHeaderGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modernModalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  modernModalTitleWhite: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modernModalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modernModalSubtitleWhite: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  modernCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernCloseButtonWhite: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Body Styles
  modernModalBody: {
    padding: 24,
  },

  // Badge Styles
  modernSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  modernSourceBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#8B5CF6',
    marginRight: 12,
  },
  breakingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  breakingText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EF4444',
  },
  modernTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    alignSelf: 'flex-start',
    gap: 8,
  },
  modernTypeBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  modernStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
  },
  modernStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modernStatusText: {
    fontSize: 14,
    fontWeight: '900',
  },

  // Content Styles
  modernHeadline: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 28,
    marginBottom: 20,
  },
  modernMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modernMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modernMetaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modernMetaGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modernMetaCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  modernMetaCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
  },
  modernMetaCardValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
    marginTop: 4,
    textAlign: 'center',
  },

  // Section Styles
  modernContentSection: {
    marginBottom: 24,
  },
  modernSectionLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  modernSummary: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 24,
  },

  // Quotes Styles
  modernQuotesContainer: {
    gap: 12,
  },
  modernQuoteCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    gap: 12,
  },
  modernQuoteText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Actions Styles
  modernActionsContainer: {
    gap: 12,
  },
  modernActionCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  modernActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  modernActionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  modernActionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  modernActionConnection: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },

  // Sources Styles
  modernSourcesContainer: {
    gap: 8,
  },
  modernSourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  modernSourceItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  // Button Styles
  modernActionsSection: {
    gap: 20,
  },
  modernPrimaryButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  modernPrimaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modernOtherSources: {
    gap: 12,
  },
  modernSourcesGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  modernSourceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  modernSourceButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ========== MODERN CONTENT CARD STYLES ==========
  // Modern News Card Styles
  modernNewsList: {
    padding: 20,
    gap: 16,
  },
  modernNewsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  modernNewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modernNewsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modernSourceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernSourceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modernNewsDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modernNewsDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  modernCredibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modernCredibilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modernCredibilityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
  modernNewsContent: {
    marginBottom: 16,
  },
  modernNewsHeadline: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 24,
    marginBottom: 12,
  },
  modernNewsSummary: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 22,
  },
  modernNewsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernNewsActions: {
    flexDirection: 'row',
    gap: 16,
  },
  modernActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modernActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Modern Document Card Styles
  modernDocumentsList: {
    padding: 20,
    gap: 16,
  },
  modernDocumentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  modernDocumentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modernDocumentTypeContainer: {
    flex: 1,
  },
  modernDocumentTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  modernDocumentTypeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modernDocumentDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modernDocumentDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  modernDocumentContent: {
    marginBottom: 16,
  },
  modernDocumentTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 23,
    marginBottom: 10,
  },
  modernDocumentSummary: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 22,
  },
  modernQuotesPreview: {
    marginBottom: 16,
  },
  modernQuotePreviewCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
    gap: 10,
    marginBottom: 8,
  },
  modernQuotePreviewText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  modernMoreQuotes: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    textAlign: 'right',
  },
  modernDocumentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernDocumentSource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  modernDocumentSourceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  modernDocumentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Modern Empty State Styles
  modernEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  modernEmptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  modernEmptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modernEmptySubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Modern Timeline Card Styles
  modernTimelineList: {
    padding: 20,
  },
  modernTimelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  modernTimelineConnector: {
    alignItems: 'center',
    marginRight: 20,
  },
  modernTimelineYear: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modernYearText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modernTimelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginTop: 16,
  },
  modernTimelineCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  modernTimelineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modernTimelineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modernTimelineHeaderText: {
    flex: 1,
  },
  modernTimelineSignificance: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  modernTimelineYearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  modernTimelineYearBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  modernTimelineContent: {
    marginBottom: 16,
  },
  modernTimelineEvent: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 8,
  },
  modernTimelineContext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 20,
  },
  modernTimelineSources: {
    marginBottom: 16,
  },
  modernTimelineSourcesLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  modernTimelineSourcesList: {
    gap: 6,
  },
  modernTimelineSource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modernTimelineSourceText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  modernTimelineActions: {
    flexDirection: 'row',
    gap: 16,
  },
  modernTimelineActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modernTimelineActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Modern Promises/Commitments Styles
  modernPromisesContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modernPromisesSubHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modernPromisesSubHeaderTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  modernPromisesSubHeaderSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  modernPromisesContent: {
    padding: 24,
  },
  modernPromiseHeader: {
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modernPromiseHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modernPromiseHeaderTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modernPromiseHeaderSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  modernPromisesList: {
    gap: 20,
  },
  modernPromiseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  modernPromiseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modernPromiseTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  modernPromiseStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modernPromiseStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modernProgressSection: {
    marginBottom: 16,
  },
  modernProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modernProgressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  modernProgressValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  modernProgressContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  modernProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  modernPromiseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernPromiseDate: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  modernDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
  },
  modernDetailsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  modernExpandedDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modernDetailSection: {
    marginBottom: 12,
  },
  modernDetailSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modernDetailSectionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 20,
  },

  // Dashboard Header Styles (Missing from Interface)
  dashboardHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  dashboardHeaderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashboardHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dashboardHeaderRightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dashboardFollowedButton: {
    backgroundColor: '#EF4444',
  },

  // Dashboard Action Section Styles (Missing from Interface)
  dashboardActionSection: {
    gap: 24,
    marginTop: 32,
  },
  dashboardPrimaryButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dashboardPrimaryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dashboardTipCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    gap: 16,
  },
  dashboardTipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardTipContent: {
    flex: 1,
  },
  dashboardTipTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  dashboardTipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4ED8',
    lineHeight: 22,
  },});

export default PoliticianDetailScreen;
