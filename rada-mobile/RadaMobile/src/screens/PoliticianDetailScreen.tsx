import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
  Dimensions,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

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
  
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'documents' | 'timeline' | 'commitments'>('overview');
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

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.overviewContent}>
        <View style={styles.politicianHeader}>
          <View style={styles.politicianImageContainer}>
            {politician.image_url ? (
              <Image source={{ uri: politician.image_url }} style={styles.politicianImage} />
            ) : (
              <View style={styles.politicianImagePlaceholder}>
                <Text style={styles.politicianInitial}>{politician.name.charAt(0)}</Text>
              </View>
            )}
          </View>
          <View style={styles.politicianInfo}>
            <Text style={styles.politicianName}>{politician.name}</Text>
            <Text style={styles.politicianPosition}>{politician.current_position}</Text>
            <Text style={styles.politicianConstituency}>{politician.constituency}</Text>
          </View>
        </View>

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
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.newsCard}
          onPress={() => handleNewsCardPress(item)}
          activeOpacity={0.8}
        >
          <View style={styles.newsHeader}>
            <Text style={styles.newsHeadline}>{item.headline}</Text>
            <View style={[
              styles.sourceBadge, 
              { backgroundColor: getSourceColor(item.source) }
            ]}>
              <Text style={[
                styles.sourceBadgeText,
                { color: getSourceBadgeTextColor(item.source) }
              ]}>
                {item.source}
              </Text>
            </View>
          </View>
          
          <Text style={styles.newsSummary}>{item.summary}</Text>
          
          <View style={styles.newsMeta}>
            <Text style={styles.newsDate}>📅 {item.source_publication_date}</Text>
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📰</Text>
          <Text style={styles.emptyTitle}>No news available</Text>
          <Text style={styles.emptySubtitle}>Check back later for updates</Text>
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
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Article Preview</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowNewsModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {selectedNewsItem && (
            <ScrollView style={styles.modalBody}>
              <View style={[styles.modalSourceBadge, { backgroundColor: getSourceColor(selectedNewsItem.source) }]}>
                <Text style={[
                  styles.modalSourceBadgeText,
                  { color: getSourceBadgeTextColor(selectedNewsItem.source) }
                ]}>
                  {selectedNewsItem.source}
                </Text>
              </View>
              
              <Text style={styles.modalHeadline}>{selectedNewsItem.headline}</Text>
              <Text style={styles.modalDate}>📅 Published: {selectedNewsItem.source_publication_date}</Text>
              
              <Text style={styles.modalSummary}>
                {selectedNewsItem.summary}
                {'\n\n'}
                This is a brief preview of the article. For the complete story and full context, 
                please visit the original source using the links below.
              </Text>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.readMoreButton}
                  onPress={() => handleReadMore(selectedNewsItem.link)}
                >
                  <Text style={styles.readMoreButtonText}>📖 Read Full Article</Text>
                </TouchableOpacity>
                
                <Text style={styles.otherSourcesLabel}>Other Sources:</Text>
                <View style={styles.otherSourcesButtons}>
                  <TouchableOpacity style={[styles.otherSourceButton, { backgroundColor: '#4ECDC4' }]}>
                    <Text style={styles.otherSourceButtonText}>KBC Coverage</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.otherSourceButton, { backgroundColor: '#85C1E9' }]}>
                    <Text style={styles.otherSourceButtonText}>NTV Report</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.otherSourceButton, { backgroundColor: '#DDA0DD' }]}>
                    <Text style={styles.otherSourceButtonText}>The Standard</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderDocumentsTab = () => {
    const officialDocs = documentsData.filter(doc => doc.type === 'policy' || doc.type === 'parliamentary');
    const speeches = documentsData.filter(doc => doc.type === 'speech');

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
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.documentCard}
              onPress={() => handleDocumentCardPress(item)}
              activeOpacity={0.8}
            >
              <View style={styles.documentHeader}>
                <Text style={styles.documentTitle}>{item.title}</Text>
                <View style={styles.documentTypeBadge}>
                  <Text style={styles.documentTypeText}>{item.type}</Text>
                </View>
              </View>
              
              <Text style={styles.documentSummary}>{item.summary}</Text>
              
              {item.key_quotes && (
                <View style={styles.quotesSection}>
                  <Text style={styles.quotesLabel}>Key Quotes:</Text>
                  {item.key_quotes.map((quote, index) => (
                    <Text key={index} style={styles.quote}>"{quote}"</Text>
                  ))}
                </View>
              )}
              
              <View style={styles.documentMeta}>
                <Text style={styles.documentDate}>{item.date}</Text>
                <Text style={styles.documentSource}>{item.source}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>
                {documentsSubTab === 'official' ? '📄' : '🎤'}
              </Text>
              <Text style={styles.emptyTitle}>
                No {documentsSubTab === 'official' ? 'official documents' : 'speeches'} available
              </Text>
              <Text style={styles.emptySubtitle}>Check back later for updates</Text>
            </View>
          }
        />
      </View>
    );
  };

  const renderTimelineTab = () => (
    <FlatList
      data={timelineData}
      renderItem={({ item }) => (
        <View style={styles.timelineCard}>
          <View style={styles.timelineYear}>
            <Text style={styles.yearText}>{item.year}</Text>
          </View>
          
          <View style={styles.timelineContent}>
            <Text style={styles.timelineEvent}>{item.event}</Text>
            <Text style={styles.timelineSignificance}>{item.significance}</Text>
            <Text style={styles.timelineContext}>{item.context}</Text>
            
            <View style={styles.sourcesSection}>
              <Text style={styles.sourcesLabel}>Sources:</Text>
              {item.sources.map((source, index) => (
                <Text key={index} style={styles.sourceText}>• {source}</Text>
              ))}
            </View>
          </View>
        </View>
      )}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No timeline available</Text>
          <Text style={styles.emptySubtitle}>Check back later for updates</Text>
        </View>
      }
    />
  );

  const renderCommitmentsTab = () => (
    <FlatList
      data={commitmentsData}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.commitmentCard}
          onPress={() => handleCommitmentCardPress(item)}
          activeOpacity={0.8}
        >
          <View style={styles.commitmentHeader}>
            <Text style={styles.commitmentPromise}>{item.promise}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
            </View>
          </View>
          
          <Text style={styles.commitmentContext}>{item.context}</Text>
          <Text style={styles.commitmentDate}>Made: {item.date_made}</Text>
          
          {item.related_actions && (
            <View style={styles.actionsSection}>
              <Text style={styles.actionsLabel}>Related Actions:</Text>
              {item.related_actions.map((action, index) => (
                <View key={index} style={styles.actionItem}>
                  <Text style={styles.actionText}>{action.action}</Text>
                  <Text style={styles.actionDate}>{action.date}</Text>
                  <Text style={styles.actionConnection}>{action.connection}</Text>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.sourcesSection}>
            <Text style={styles.sourcesLabel}>Sources:</Text>
            {item.sources.map((source, index) => (
              <Text key={index} style={styles.sourceText}>• {source}</Text>
            ))}
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤝</Text>
          <Text style={styles.emptyTitle}>No commitments available</Text>
          <Text style={styles.emptySubtitle}>Check back later for updates</Text>
        </View>
      }
    />
  );

  const renderDocumentModal = () => (
    <Modal
      visible={showDocumentModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDocumentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Document Details</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDocumentModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {selectedDocument && (
            <ScrollView style={styles.modalBody}>
              <View style={[styles.modalSourceBadge, { backgroundColor: '#e0f2fe' }]}>
                <Text style={[styles.modalSourceBadgeText, { color: '#0284c7' }]}>
                  {selectedDocument.type.toUpperCase()}
                </Text>
              </View>
              
              <Text style={styles.modalHeadline}>{selectedDocument.title}</Text>
              <Text style={styles.modalDate}>📅 Date: {selectedDocument.date}</Text>
              <Text style={styles.modalDate}>📄 Source: {selectedDocument.source}</Text>
              
              <Text style={styles.modalSummary}>
                {selectedDocument.summary}
              </Text>
              
              {selectedDocument.key_quotes && (
                <View style={styles.modalQuotesSection}>
                  <Text style={styles.modalQuotesLabel}>Key Quotes:</Text>
                  {selectedDocument.key_quotes.map((quote, index) => (
                    <Text key={index} style={styles.modalQuote}>"{quote}"</Text>
                  ))}
                </View>
              )}
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.readMoreButton}>
                  <Text style={styles.readMoreButtonText}>📖 View Full Document</Text>
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
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Commitment Details</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowCommitmentModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {selectedCommitment && (
            <ScrollView style={styles.modalBody}>
              <View style={[styles.modalSourceBadge, { backgroundColor: getStatusColor(selectedCommitment.status) }]}>
                <Text style={[styles.modalSourceBadgeText, { color: 'white' }]}>
                  {selectedCommitment.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              
              <Text style={styles.modalHeadline}>{selectedCommitment.promise}</Text>
              <Text style={styles.modalDate}>📅 Made: {selectedCommitment.date_made}</Text>
              <Text style={styles.modalDate}>📋 Context: {selectedCommitment.context}</Text>
              
              <Text style={styles.modalSummary}>
                This commitment was made during {selectedCommitment.context} and is currently 
                {selectedCommitment.status === 'completed' ? ' completed' : 
                 selectedCommitment.status === 'in_progress' ? ' in progress' :
                 selectedCommitment.status === 'pending' ? ' pending' : ' broken'}.
              </Text>
              
              {selectedCommitment.related_actions && (
                <View style={styles.modalActionsSection}>
                  <Text style={styles.modalActionsLabel}>Related Actions:</Text>
                  {selectedCommitment.related_actions.map((action, index) => (
                    <View key={index} style={styles.modalActionItem}>
                      <Text style={styles.modalActionText}>🎯 {action.action}</Text>
                      <Text style={styles.modalActionDate}>📅 {action.date}</Text>
                      <Text style={styles.modalActionConnection}>🔗 {action.connection}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.modalSourcesSection}>
                <Text style={styles.modalSourcesLabel}>Sources:</Text>
                {selectedCommitment.sources.map((source, index) => (
                  <Text key={index} style={styles.modalSourceText}>• {source}</Text>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{politician.name}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { id: 'overview', label: 'Overview', icon: '📚' },
          { id: 'news', label: 'News', icon: '📰' },
          { id: 'documents', label: 'Documents', icon: '📄' },
          { id: 'timeline', label: 'Timeline', icon: '📅' },
          { id: 'commitments', label: 'Commitments', icon: '🤝' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.activeTabButton]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'news' && renderNewsTab()}
        {activeTab === 'documents' && renderDocumentsTab()}
        {activeTab === 'timeline' && renderTimelineTab()}
        {activeTab === 'commitments' && renderCommitmentsTab()}
      </View>
      {renderNewsModal()}
      {renderDocumentModal()}
      {renderCommitmentModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: '#4ECDC4',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  overviewContent: {
    padding: 20,
  },
  politicianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  politicianImageContainer: {
    marginRight: 16,
  },
  politicianImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  politicianImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  politicianInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  politicianInfo: {
    flex: 1,
  },
  politicianName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  politicianPosition: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
    marginBottom: 4,
  },
  politicianConstituency: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  newsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  newsHeadline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  newsSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  newsDate: {
    fontSize: 12,
    color: '#999',
  },
  documentsContainer: {
    flex: 1,
  },
  documentsSubTabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  documentsSubTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeDocumentsSubTab: {
    backgroundColor: '#4ECDC4',
  },
  documentsSubTabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeDocumentsSubTabText: {
    color: 'white',
    fontWeight: '600',
  },
  documentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  documentTypeBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  documentTypeText: {
    fontSize: 10,
    color: '#0284c7',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  documentSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  quotesSection: {
    marginBottom: 12,
  },
  quotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  quote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  documentDate: {
    fontSize: 12,
    color: '#999',
  },
  documentSource: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  timelineCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timelineYear: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  yearText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  timelineContent: {
    flex: 1,
  },
  timelineEvent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  timelineSignificance: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
    marginBottom: 4,
  },
  timelineContext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  sourcesSection: {
    marginTop: 8,
  },
  sourcesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  commitmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  commitmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  commitmentPromise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  commitmentContext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  commitmentDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  actionsSection: {
    marginBottom: 12,
  },
  actionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  actionItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  actionDate: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  actionConnection: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
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
    textTransform: 'uppercase',
  },
  sourceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  sourceButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  sourceButtonText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 15,
  },
  modalSourceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  modalSourceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  modalSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  modalActions: {
    marginTop: 10,
  },
  readMoreButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  readMoreButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  otherSourcesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  otherSourcesButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  otherSourceButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  otherSourceButtonText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateContainer: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalQuotesSection: {
    marginBottom: 12,
  },
  modalQuotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  modalQuote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  modalActionsSection: {
    marginBottom: 12,
  },
  modalActionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  modalActionItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  modalActionDate: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  modalActionConnection: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  modalSourcesSection: {
    marginTop: 8,
  },
  modalSourcesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  modalSourceText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
});

export default PoliticianDetailScreen;
