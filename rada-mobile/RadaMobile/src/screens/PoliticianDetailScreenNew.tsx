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

import { Ionicons } from '@expo/vector-icons';

import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';

import { useFavorites } from '../contexts/FavoritesContext';

import ShareButton from '../components/ShareButton';



const { width, height } = Dimensions.get('window');



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

  source_publication_date: string;

  system_addition_date: string;

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



const PoliticianDetailScreen = () => {

  const navigation = useNavigation<NavigationProp<any>>();

  const route = useRoute();

  const { politician } = route.params as { politician: Politician };

  const { toggleFavorite, isFavorite } = useFavorites();

  const [isFollowed, setIsFollowed] = useState(false);

  const [expandedCommitment, setExpandedCommitment] = useState<number | null>(null);

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

  const [activeView, setActiveView] = useState('dashboard');



  // Load data on component mount

  useEffect(() => {

    loadPoliticianData();

  }, []);



  const loadPoliticianData = async () => {

    try {

      // Load news data

      const newsResponse = await fetch(`http://localhost:5001/api/politicians/${politician.id}/news`);

      const newsData = await newsResponse.json();

      setNewsData(newsData);



      // Load documents data

      const documentsResponse = await fetch(`http://localhost:5001/api/politicians/${politician.id}/documents`);

      const documentsData = await documentsResponse.json();

      setDocumentsData(documentsData);



      // Load timeline data

      const timelineResponse = await fetch(`http://localhost:5001/api/politicians/${politician.id}/timeline`);

      const timelineData = await timelineResponse.json();

      setTimelineData(timelineData);



      // Load commitments data

      const commitmentsResponse = await fetch(`http://localhost:5001/api/politicians/${politician.id}/commitments`);

      const commitmentsData = await commitmentsResponse.json();

      setCommitmentsData(commitmentsData);

    } catch (error) {

      console.error('Error loading politician data:', error);

    }

  };



  const onRefresh = async () => {

    setRefreshing(true);

    await loadPoliticianData();

    setRefreshing(false);

  };



  // Your original data

  const quickStats = {

    totalVotes: 15,

    attendance: '95%',

    partyLoyalty: '80%',

    controversial: 3

  };



  const commitments = [

    {

      id: 1,

      title: 'Create jobs and economic opportunities',

      status: 'IN PROGRESS',

      progress: 65,

      date: '2022-06-15',

      relatedActions: ['Employment Program Launch'],

      sources: ['Campaign manifesto', 'BBC interview']

    },

    {

      id: 2,

      title: 'Improve infrastructure and development',

      status: 'IN PROGRESS', 

      progress: 78,

      date: '2022-09-13',

      relatedActions: ['Infrastructure Bill signed'],

      sources: ['Official inauguration speech']

    }

  ];



  const recentNews = [

    {

      title: 'Announces New Policy Initiative',

      date: '2024-08-20',

      category: 'BBC AFRICA',

      preview: 'Comprehensive new policy program targeting key development areas.'

    },

    {

      title: 'Addresses National Assembly',

      date: '2024-07-15', 

      category: 'REUTERS',

      preview: 'Major speech outlining government agenda and priorities.'

    }

  ];



  // Enhanced bento card for React Native

  const BentoCard = ({ title, subtitle, iconName, colors, stats, onPress, size = "normal" }: {

    title: string;

    subtitle: string;

    iconName: any;

    colors: string[];

    stats?: { main: string; sub: string };

    onPress: () => void;

    size?: "normal" | "large" | "tall";

  }) => (

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

              <Ionicons name={iconName} size={28} color="#FFFFFF" />

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



  const Dashboard = () => (

    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}

      <View style={styles.header}>

        <View style={styles.headerButtons}>

          <TouchableOpacity 

            style={styles.headerButton}

            onPress={() => navigation.goBack()}

          >

            <Ionicons name="chevron-back" size={24} color="#374151" />

          </TouchableOpacity>

          <View style={styles.headerRightButtons}>

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

              style={styles.headerButton}

            />

            <TouchableOpacity 

              style={[styles.headerButton, isFollowed && styles.followedButton]}

              onPress={() => {

                setIsFollowed(!isFollowed);

                toggleFavorite(politician);

              }}

            >

              <Ionicons 

                name={isFollowed ? "heart" : "heart-outline"} 

                size={20} 

                color={isFollowed ? "#FFFFFF" : "#374151"} 

              />

            </TouchableOpacity>

          </View>

        </View>

      </View>



      {/* Profile Section with Background */}

      <View style={styles.profileSection}>

        <LinearGradient

          colors={['#2563EB', '#1D4ED8', '#1E40AF']}

          style={styles.profileBackground}

          start={{x: 0, y: 0}}

          end={{x: 1, y: 1}}

        >

          <View style={styles.profileContent}>

            <View style={styles.profileImageContainer}>

              {politician.image_url ? (

                <Image source={{ uri: politician.image_url }} style={styles.profileImage} />

              ) : (

              <View style={styles.profileImage}>

                  <Text style={styles.profileImageText}>{politician.name.charAt(0)}</Text>

              </View>

              )}

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

                <Text style={styles.profileDetailText}>{politician.education}</Text>

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

                <Text style={styles.statValue}>3</Text>

                <Text style={styles.statLabel}>OFFICES</Text>

              </View>

            </View>

          </View>

        </LinearGradient>

      </View>



      {/* Bento Grid */}

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

            iconName="flag"

            colors={['#EF4444', '#DC2626']}

            stats={{ main: (commitmentsData?.length || 0).toString(), sub: "active" }}

            onPress={() => setActiveView('promises')}

          />

          

          <BentoCard

            title="Recent"

            subtitle="Latest news & activities"

            iconName="flash"

            colors={['#8B5CF6', '#7C3AED']}

            stats={{ main: (newsData?.length || 0).toString(), sub: "articles" }}

            onPress={() => setActiveView('timeline')}

          />

          

          <BentoCard

            title="Career"

            subtitle="17-year political journey"

            iconName="briefcase"

            colors={['#F59E0B', '#D97706']}

            stats={{ main: "3", sub: "roles" }}

            onPress={() => setActiveView('career')}

          />

          

          <BentoCard

            title="Documents"

            subtitle="Policy papers & speeches"

            iconName="document-text"

            colors={['#3B82F6', '#2563EB']}

            stats={{ main: (documentsData?.length || 0).toString(), sub: "documents" }}

            onPress={() => setActiveView('documents')}

          />

        </View>



        {/* Action Buttons */}

        <View style={styles.actionSection}>

          <TouchableOpacity 

            style={styles.primaryButton} 

            activeOpacity={0.8}

            onPress={() => navigation.navigate('PoliticianComparison')}

          >

            <Text style={styles.primaryButtonText}>Compare with Other Politicians</Text>

          </TouchableOpacity>

          

          <View style={styles.tipCard}>

            <View style={styles.tipIconContainer}>

              <Ionicons name="information-circle" size={20} color="#3B82F6" />

            </View>

            <View style={styles.tipContent}>

              <Text style={styles.tipTitle}>Make Informed Decisions</Text>

              <Text style={styles.tipText}>

                Cross-reference campaign promises with actual voting records. Check multiple sources and compare with other politicians to form your own opinion.

              </Text>

            </View>

          </View>

        </View>

      </View>

    </ScrollView>

  );



  const VotingView = () => (

    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.subHeader}>

        <TouchableOpacity 

          style={styles.backButton}

          onPress={() => setActiveView('dashboard')}

        >

          <Ionicons name="chevron-back" size={24} color="#374151" />

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

          onPress={() => {

            // TODO: Navigate to detailed voting history screen

            Alert.alert('Coming Soon', 'Detailed voting history will be available soon!');

          }}

        >

          <View>

            <Text style={styles.actionCardTitle}>View Complete Voting History</Text>

            <Text style={styles.actionCardSubtitle}>Detailed breakdown by bill, date & topic</Text>

          </View>

            <Ionicons name="open-outline" size={24} color="#3B82F6" />

        </TouchableOpacity>

      </View>

    </ScrollView>

  );



  const PromisesView = () => (

    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.subHeader}>

        <TouchableOpacity 

          style={styles.backButton}

          onPress={() => setActiveView('dashboard')}

        >

          <Ionicons name="chevron-back" size={24} color="#374151" />

        </TouchableOpacity>

        <View>

          <Text style={styles.subHeaderTitle}>Promise Tracker</Text>

          <Text style={styles.subHeaderSubtitle}>Campaign commitments vs reality</Text>

        </View>

      </View>



      <View style={styles.contentSection}>

        <LinearGradient

          colors={['#EF4444', '#DC2626']}

          style={styles.promiseHeader}

          start={{x: 0, y: 0}}

          end={{x: 1, y: 1}}

        >

          <View style={styles.promiseHeaderIcon}>

            <Ionicons name="flag" size={28} color="#FFFFFF" />

          </View>

          <View>

            <Text style={styles.promiseHeaderTitle}>Accountability Dashboard</Text>

            <Text style={styles.promiseHeaderSubtitle}>Track promises from campaign to delivery</Text>

          </View>

        </LinearGradient>



        <View style={styles.promisesList}>

          {commitments.map(commitment => (

            <TouchableOpacity 

              key={commitment.id} 

              style={styles.promiseCard}

              activeOpacity={0.8}

              onPress={() => {

                // Convert the commitment data to match the Commitment interface

                const commitmentData: Commitment = {

                  id: commitment.id,

                  promise: commitment.title,

                  context: 'Campaign promise',

                  date_made: commitment.date,

                  sources: commitment.sources,

                  status: commitment.status.toLowerCase().replace(' ', '_') as 'completed' | 'in_progress' | 'pending' | 'broken',

                  related_actions: commitment.relatedActions?.map(action => ({

                    action: action,

                    date: commitment.date,

                    source: 'Campaign materials',

                    connection: 'Direct promise'

                  }))

                };

                setSelectedCommitment(commitmentData);

                setShowCommitmentModal(true);

              }}

            >

              <View style={styles.promiseCard}>

              <View style={styles.promiseCardHeader}>

                <Text style={styles.promiseTitle}>{commitment.title}</Text>

                <View style={styles.promiseStatus}>

                  <Text style={styles.promiseStatusText}>{commitment.status}</Text>

                </View>

              </View>

              

              <View style={styles.progressSection}>

                <View style={styles.progressHeader}>

                  <Text style={styles.progressLabel}>Progress</Text>

                  <Text style={styles.progressValue}>{commitment.progress}%</Text>

                </View>

                <View style={styles.progressContainer}>

                  <View style={[styles.progressFill, { width: `${commitment.progress}%` }]} />

                </View>

              </View>



              <View style={styles.promiseFooter}>

                <Text style={styles.promiseDate}>Made: {commitment.date}</Text>

                <TouchableOpacity 

                  style={styles.detailsButton}

                  onPress={() => setExpandedCommitment(

                    expandedCommitment === commitment.id ? null : commitment.id

                  )}

                >

                  <Text style={styles.detailsButtonText}>

                    {expandedCommitment === commitment.id ? 'Hide' : 'Details'}

                  </Text>

                </TouchableOpacity>

              </View>



              {expandedCommitment === commitment.id && (

                <View style={styles.expandedDetails}>

                  <View style={styles.detailSection}>

                    <Text style={styles.detailSectionTitle}>SOURCES</Text>

                    <Text style={styles.detailSectionText}>

                      {commitment.sources.join(', ')}

                    </Text>

                  </View>

                  <View style={styles.detailSection}>

                    <Text style={styles.detailSectionTitle}>RECENT ACTIONS</Text>

                    <Text style={styles.detailSectionText}>

                      {commitment.relatedActions?.join(', ')}

                    </Text>

                  </View>

                </View>

              )}

            </View>

            </TouchableOpacity>

          ))}

        </View>

      </View>

    </ScrollView>

  );



  const TimelineView = () => (

    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.subHeader}>

        <TouchableOpacity 

          style={styles.backButton}

          onPress={() => setActiveView('dashboard')}

        >

          <Ionicons name="chevron-back" size={24} color="#374151" />

        </TouchableOpacity>

        <View>

          <Text style={styles.subHeaderTitle}>Recent Activity</Text>

          <Text style={styles.subHeaderSubtitle}>Latest news & updates</Text>

        </View>

      </View>



      <View style={styles.contentSection}>

        {recentNews.map((news, idx) => (

          <TouchableOpacity 

            key={idx} 

            style={styles.newsCard} 

            activeOpacity={0.8}

            onPress={() => {

              // Convert the news data to match the NewsItem interface

              const newsItem: NewsItem = {

                id: idx + 1,

                headline: news.title,

                source_publication_date: news.date,

                system_addition_date: news.date,

                source: news.category,

                credibility: 'high' as const,

                link: 'https://example.com',

                summary: news.preview

              };

              setSelectedNewsItem(newsItem);

              setShowNewsModal(true);

            }}

          >

            <View style={styles.newsCardHeader}>

              <View style={styles.newsCardLeft}>

                <View style={styles.newsCardMeta}>

                  <View style={styles.newsCategoryBadge}>

                    <Text style={styles.newsCategoryText}>{news.category}</Text>

                  </View>

                  <Text style={styles.newsDate}>{news.date}</Text>

                </View>

                <Text style={styles.newsTitle}>{news.title}</Text>

                <Text style={styles.newsPreview}>{news.preview}</Text>

              </View>

              <View style={styles.newsIconContainer}>

                <Ionicons name="calendar" size={20} color="#8B5CF6" />

              </View>

            </View>

            <View style={styles.newsCardFooter}>

              <View style={styles.breakingNewsIndicator}>

                <View style={styles.pulsingDot} />

                <Text style={styles.breakingNewsText}>Breaking news</Text>

              </View>

              <View style={styles.readMoreContainer}>

                <Text style={styles.readMoreText}>Read more</Text>

                <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />

              </View>

            </View>

          </TouchableOpacity>

        ))}

        

        <TouchableOpacity 

          style={styles.timelineActionCard} 

          activeOpacity={0.8}

          onPress={() => {

            // TODO: Navigate to detailed timeline screen

            Alert.alert('Coming Soon', 'Complete activity timeline will be available soon!');

          }}

        >

          <Ionicons name="time" size={20} color="#6B7280" />

          <Text style={styles.timelineActionText}>View Complete Activity Timeline</Text>

        </TouchableOpacity>

      </View>

    </ScrollView>

  );



  const CareerView = () => (

    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.subHeader}>

        <TouchableOpacity 

          style={styles.backButton}

          onPress={() => setActiveView('dashboard')}

        >

          <Ionicons name="chevron-back" size={24} color="#374151" />

        </TouchableOpacity>

        <View>

          <Text style={styles.subHeaderTitle}>Political Career</Text>

          <Text style={styles.subHeaderSubtitle}>17 years of public service</Text>

        </View>

      </View>



      <View style={styles.contentSection}>

        {[

          {

            title: 'Speaker of Senate',

            period: '2022 - Present',

            description: 'Currently serving as Speaker, leading legislative sessions and parliamentary procedures',

            color: '#3B82F6',

            iconName: 'star' as any,

            isActive: true

          },

          {

            title: 'Governor of Kilifi',

            period: '2013 - 2022',

            description: '9 years of county leadership, focusing on infrastructure development and economic growth',

            color: '#10B981',

            iconName: 'people' as any,

            isActive: false

          },

          {

            title: 'MP Kilifi North',

            period: '2007 - 2013',

            description: 'First elected position representing Kilifi North constituency in the National Assembly',

            color: '#8B5CF6',

            iconName: 'briefcase' as any,

            isActive: false

          }

        ].map((position, idx) => (

          <View key={idx} style={styles.careerCard}>

            <View style={styles.careerCardHeader}>

              <View style={[styles.careerIconContainer, { backgroundColor: position.color + '20' }]}>

                <Ionicons name={position.iconName} size={24} color={position.color} />

              </View>

              <View style={styles.careerCardContent}>

                <Text style={styles.careerTitle}>{position.title}</Text>

                <Text style={styles.careerPeriod}>{position.period}</Text>

                {position.isActive && (

                  <View style={styles.activeStatus}>

                    <View style={styles.activeDot} />

                    <Text style={styles.activeText}>Currently Active</Text>

                  </View>

                )}

              </View>

            </View>

            <Text style={styles.careerDescription}>{position.description}</Text>

          </View>

        ))}



        {/* Career Timeline Summary */}

        <View style={styles.careerSummaryCard}>

          <Text style={styles.careerSummaryTitle}>Career Progression</Text>

          <View style={styles.careerStats}>

            <View style={styles.careerStatItem}>

              <Text style={styles.careerStatValue}>17</Text>

              <Text style={styles.careerStatLabel}>Years in Politics</Text>

            </View>

            <View style={styles.careerStatDivider} />

            <View style={styles.careerStatItem}>

              <Text style={styles.careerStatValue}>3</Text>

              <Text style={styles.careerStatLabel}>Major Positions</Text>

            </View>

            <View style={styles.careerStatDivider} />

            <View style={styles.careerStatItem}>

              <Text style={styles.careerStatValue}>2</Text>

              <Text style={styles.careerStatLabel}>Counties Served</Text>

            </View>

          </View>

        </View>

      </View>

    </ScrollView>

  );



  const DocumentsView = () => {

    const [activeFilter, setActiveFilter] = useState('all');

    

    const documents = [

      {

        title: 'Policy Framework Document',

        type: 'POLICY',

        date: '2022-10-01',

        source: 'Office of the President',

        preview: 'Comprehensive policy blueprint focusing on national development, economic growth strategies, and infrastructure priorities for Kenya\'s future.',

        pages: '12 pages',

        status: 'Available',

        iconName: 'document-text' as any,

        color: '#3B82F6'

      },

      {

        title: 'Constitutional Amendment Bill',

        type: 'BILL',

        date: '2023-03-20',

        source: 'Kenya Gazette',

        preview: 'Official document proposing constitutional amendments for improved governance, democratic reforms, and enhanced public participation in government.',

        pages: '28 pages',

        status: 'Available',

        iconName: 'hammer' as any,

        color: '#10B981'

      },

      {

        title: 'National Assembly Address',

        type: 'SPEECH',

        date: '2024-07-15',

        source: 'Parliament of Kenya',

        preview: 'Major parliamentary speech outlining government agenda, legislative priorities, and vision for national development over the next fiscal year.',

        pages: '45 min',

        status: 'Video',

        iconName: 'mic' as any,

        color: '#8B5CF6'

      },

      {

        title: 'Speaker Inauguration Speech',

        type: 'SPEECH',

        date: '2022-09-13',

        source: 'Senate of Kenya',

        preview: 'Inaugural address upon taking office as Speaker of the Senate, outlining vision for legislative leadership and commitment to democratic governance.',

        pages: '32 min',

        status: 'Transcript',

        iconName: 'megaphone' as any,

        color: '#F59E0B'

      }

    ];



    const filters = [

      { id: 'all', label: 'All Documents' },

      { id: 'policy', label: 'Policies' },

      { id: 'speech', label: 'Speeches' },

      { id: 'bill', label: 'Bills' }

    ];



    return (

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.subHeader}>

          <TouchableOpacity 

            style={styles.backButton}

            onPress={() => setActiveView('dashboard')}

          >

            <Ionicons name="chevron-back" size={24} color="#374151" />

          </TouchableOpacity>

          <View>

            <Text style={styles.subHeaderTitle}>Documents & Speeches</Text>

            <Text style={styles.subHeaderSubtitle}>Official papers, policy docs & public speeches</Text>

          </View>

        </View>



        <View style={styles.contentSection}>

          {/* Filter Tabs */}

          <ScrollView 

            horizontal 

            showsHorizontalScrollIndicator={false} 

            style={styles.filterContainer}

            contentContainerStyle={styles.filterContent}

          >

            {filters.map(filter => (

              <TouchableOpacity

                key={filter.id}

                style={[

                  styles.filterTab,

                  activeFilter === filter.id && styles.filterTabActive

                ]}

                onPress={() => setActiveFilter(filter.id)}

                activeOpacity={0.8}

              >

                <Text style={[

                  styles.filterTabText,

                  activeFilter === filter.id && styles.filterTabTextActive

                ]}>

                  {filter.label}

                </Text>

              </TouchableOpacity>

            ))}

          </ScrollView>



          {/* Documents List */}

          <View style={styles.documentsList}>

            {documents.map((doc, idx) => (

              <TouchableOpacity 

                key={idx} 

                style={styles.documentCard} 

                activeOpacity={0.8}

                onPress={() => {

                  // Convert the document data to match the Document interface

                  const documentData: Document = {

                    id: idx + 1,

                    title: doc.title,

                    date: doc.date,

                    type: doc.type.toLowerCase() as 'speech' | 'policy' | 'parliamentary',

                    source: doc.source,

                    key_quotes: ['Key quote from document'],

                    summary: doc.preview

                  };

                  setSelectedDocument(documentData);

                  setShowDocumentModal(true);

                }}

              >

                <View style={styles.documentCardHeader}>

                  <View style={styles.documentCardLeft}>

                    <View style={styles.documentMeta}>

                      <View style={[styles.documentTypeBadge, { backgroundColor: doc.color + '20' }]}>

                        <Text style={[styles.documentTypeText, { color: doc.color }]}>{doc.type}</Text>

                      </View>

                      <Text style={styles.documentDate}>{doc.date}</Text>

                    </View>

                    <Text style={styles.documentTitle}>{doc.title}</Text>

                    <Text style={styles.documentPreview}>{doc.preview}</Text>

                  </View>

                  <View style={styles.documentIconSection}>

                    <View style={[styles.documentIconContainer, { backgroundColor: doc.color + '20' }]}>

                      <Ionicons name={doc.iconName} size={20} color={doc.color} />

                    </View>

                    <Text style={styles.documentPages}>{doc.pages}</Text>

                  </View>

                </View>

                <View style={styles.documentCardFooter}>

                  <Text style={styles.documentSource}>{doc.source}</Text>

                  <View style={styles.documentStatusContainer}>

                    <View style={[

                      styles.documentStatusBadge,

                      doc.status === 'Available' && styles.documentStatusAvailable,

                      doc.status === 'Video' && styles.documentStatusVideo,

                      doc.status === 'Transcript' && styles.documentStatusTranscript

                    ]}>

                      <Text style={[

                        styles.documentStatusText,

                        doc.status === 'Available' && styles.documentStatusTextAvailable,

                        doc.status === 'Video' && styles.documentStatusTextVideo,

                        doc.status === 'Transcript' && styles.documentStatusTextTranscript

                      ]}>

                        {doc.status}

                      </Text>

                    </View>

                    <Ionicons name="open-outline" size={14} color="#9CA3AF" />

                  </View>

                </View>

              </TouchableOpacity>

            ))}

          </View>



          {/* Load More Button */}

          <TouchableOpacity 

            style={styles.loadMoreButton} 

            activeOpacity={0.8}

            onPress={() => {

              // TODO: Load more documents

              Alert.alert('Loading...', 'Loading more documents...');

            }}

          >

            <Ionicons name="refresh" size={20} color="#6B7280" />

            <Text style={styles.loadMoreText}>Load More Documents</Text>

          </TouchableOpacity>

        </View>

      </ScrollView>

    );

  };



  // Helper function for status colors

  const getStatusColor = (status: string) => {

    switch(status) {

      case 'completed': return '#10B981';

      case 'in_progress': return '#3B82F6';

      case 'pending': return '#F59E0B';

      case 'broken': return '#EF4444';

      default: return '#6B7280';

    }

  };



  // Helper function for source colors

  const getSourceColor = (source: string) => {

    switch(source.toLowerCase()) {

      case 'bbc': return '#FF6B6B';

      case 'reuters': return '#4ECDC4';

      case 'kbc': return '#45B7D1';

      case 'ntv': return '#96CEB4';

      case 'the standard': return '#FECA57';

      default: return '#6C5CE7';

    }

  };



  const handleReadMore = async (url: string) => {

    try {

      const supported = await Linking.canOpenURL(url);

      if (supported) {

        await Linking.openURL(url);

      } else {

        Alert.alert('Error', 'Cannot open this link');

      }

    } catch (error) {

      Alert.alert('Error', 'Failed to open link');

    }

  };



  // ========== REDESIGNED MODALS TO MATCH YOUR SOPHISTICATED DESIGN ==========



  // 1. NEWS MODAL - Redesigned

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



  // 2. DOCUMENT MODAL - Redesigned

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

                    {selectedDocument.key_quotes.map((quote, index) => (

                      <View key={index} style={styles.modernQuoteCard}>

                        <Ionicons name="chatbubble" size={20} color="#8B5CF6" />

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



  // 3. COMMITMENT MODAL - Redesigned

  const renderCommitmentModal = () => (

    <Modal

      visible={showCommitmentModal}

      transparent={true}

      animationType="slide"

      onRequestClose={() => setShowCommitmentModal(false)}

    >

      <View style={styles.modalOverlay}>

        <View style={styles.modernModalContent}>

          {/* Modern Header */}

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

                    {selectedCommitment.related_actions.map((action, index) => (

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

                  {selectedCommitment.sources.map((source, index) => (

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



  // Update the renderView function

  const renderView = () => {

    switch(activeView) {

      case 'voting': return <VotingView />;

      case 'promises': return <PromisesView />;

      case 'timeline': return <TimelineView />;

      case 'career': return <CareerView />;

      case 'documents': return <DocumentsView />;

      default: return <Dashboard />;

    }

  };



  return (

    <View style={styles.app}>

      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {renderView()}

      

      {/* Modals */}

      {renderNewsModal()}

      {renderDocumentModal()}

      {renderCommitmentModal()}

    </View>

  );

};



const styles = StyleSheet.create({

  app: {

    flex: 1,

    backgroundColor: '#F9FAFB'},

  container: {

    flex: 1},

  

  // Header Styles

  header: {

    paddingTop: 50,

    paddingBottom: 20,

    paddingHorizontal: 24},

  headerButtons: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 32},

  headerButton: {

    width: 44,

    height: 44,

    borderRadius: 12,

    backgroundColor: 'rgba(255,255,255,0.8)',

    justifyContent: 'center',

    alignItems: 'center',

    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',

    elevation: 3},

  headerRightButtons: {

    flexDirection: 'row',

    gap: 12},

  followedButton: {

    backgroundColor: '#EF4444'},



  // Profile Section Styles

  profileSection: {

    marginHorizontal: 24,

    marginBottom: 24,

    borderRadius: 24,

    overflow: 'hidden'},

  profileBackground: {

    padding: 24},

  profileContent: {

    alignItems: 'center'},

  profileImageContainer: {

    position: 'relative',

    marginBottom: 24},

  profileImage: {

    width: 96,

    height: 96,

    borderRadius: 16,

    backgroundColor: 'rgba(255,255,255,0.2)',

    justifyContent: 'center',

    alignItems: 'center',

    borderWidth: 4,

    borderColor: 'rgba(255,255,255,0.3)'},

  profileImageText: {

    fontSize: 32,

    fontWeight: '900',

    color: '#FFFFFF'},

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

    borderColor: '#FFFFFF'},

  profileName: {

    fontSize: 28,

    fontWeight: '900',

    color: '#FFFFFF',

    marginBottom: 8,

    textAlign: 'center'},

  profileTitle: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: 'rgba(255,255,255,0.2)',

    paddingHorizontal: 16,

    paddingVertical: 8,

    borderRadius: 20,

    marginBottom: 16,

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,0.3)'},

  profileTitleText: {

    fontSize: 16,

    fontWeight: '700',

    color: '#FFFFFF',

    marginLeft: 8},

  profileDetails: {

    flexDirection: 'row',

    justifyContent: 'center',

    gap: 24,

    marginBottom: 24},

  profileDetailItem: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 8},

  profileDetailText: {

    fontSize: 14,

    fontWeight: '600',

    color: 'rgba(255,255,255,0.9)'},

  statsBar: {

    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: 'rgba(255,255,255,0.1)',

    borderRadius: 16,

    paddingVertical: 16,

    paddingHorizontal: 24,

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,0.2)'},

  statItem: {

    alignItems: 'center'},

  statValue: {

    fontSize: 20,

    fontWeight: '900',

    color: '#FFFFFF'},

  statLabel: {

    fontSize: 10,

    fontWeight: '700',

    color: 'rgba(255,255,255,0.8)',

    marginTop: 4},

  statDivider: {

    width: 1,

    height: 32,

    backgroundColor: 'rgba(255,255,255,0.3)',

    marginHorizontal: 32},



  // Bento Section Styles

  bentoSection: {

    paddingHorizontal: 24,

    paddingBottom: 32},

  sectionTitle: {

    fontSize: 24,

    fontWeight: '900',

    color: '#111827',

    marginBottom: 24},

  bentoGrid: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 16,

    marginBottom: 32},

  bentoCard: {

    width: (width - 64) / 2,

    height: 144,

    borderRadius: 24,

    overflow: 'hidden',

    elevation: 2,

    elevation: 8},

  bentoCardLarge: {

    width: width - 48,

    height: 160},

  bentoCardTall: {

    height: 320},

  bentoGradient: {

    flex: 1,

    padding: 20},

  bentoContent: {

    flex: 1,

    justifyContent: 'space-between'},

  bentoHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'flex-start'},

  bentoIconContainer: {

    width: 56,

    height: 56,

    borderRadius: 16,

    backgroundColor: 'rgba(255,255,255,0.2)',

    justifyContent: 'center',

    alignItems: 'center'},

  bentoStatsContainer: {

    alignItems: 'flex-end'},

  bentoStatsMain: {

    fontSize: 28,

    fontWeight: '900',

    color: '#FFFFFF',

    lineHeight: 32},

  bentoStatsSub: {

    fontSize: 12,

    fontWeight: '600',

    color: 'rgba(255,255,255,0.9)',

    marginTop: 4},

  bentoTextContainer: {

    marginTop: 12},

  bentoTitle: {

    fontSize: 20,

    fontWeight: '900',

    color: '#FFFFFF',

    lineHeight: 24,

    marginBottom: 4},

  bentoSubtitle: {

    fontSize: 14,

    fontWeight: '600',

    color: 'rgba(255,255,255,0.9)',

    lineHeight: 18},



  // Action Section Styles

  actionSection: {

    gap: 24},

  primaryButton: {

    backgroundColor: '#111827',

    borderRadius: 16,

    paddingVertical: 16,

    paddingHorizontal: 24,

    elevation: 2,

    elevation: 8},

  primaryButtonText: {

    fontSize: 18,

    fontWeight: '900',

    color: '#FFFFFF',

    textAlign: 'center'},

  tipCard: {

    backgroundColor: '#DBEAFE',

    borderRadius: 16,

    padding: 24,

    flexDirection: 'row',

    gap: 16},

  tipIconContainer: {

    width: 48,

    height: 48,

    borderRadius: 16,

    backgroundColor: '#3B82F6',

    justifyContent: 'center',

    alignItems: 'center'},

  tipContent: {

    flex: 1},

  tipTitle: {

    fontSize: 18,

    fontWeight: '900',

    color: '#1E3A8A',

    marginBottom: 8},

  tipText: {

    fontSize: 16,

    fontWeight: '600',

    color: '#1D4ED8',

    lineHeight: 22},



  // Sub Header Styles

  subHeader: {

    paddingTop: 50,

    paddingBottom: 20,

    paddingHorizontal: 24,

    backgroundColor: '#FFFFFF',

    elevation: 2,

    elevation: 2,

    flexDirection: 'row',

    alignItems: 'center',

    gap: 16},

  backButton: {

    width: 40,

    height: 40,

    borderRadius: 12,

    backgroundColor: '#F3F4F6',

    justifyContent: 'center',

    alignItems: 'center'},

  subHeaderTitle: {

    fontSize: 24,

    fontWeight: '900',

    color: '#111827'},

  subHeaderSubtitle: {

    fontSize: 16,

    fontWeight: '600',

    color: '#6B7280',

    marginTop: 4},



  // Content Section Styles

  contentSection: {

    padding: 24,

    gap: 24},

  statsGrid: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 16},

  statCard: {

    width: (width - 64) / 2,

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    padding: 24,

    alignItems: 'center',

    elevation: 2,

    elevation: 4},

  statCardValue: {

    fontSize: 32,

    fontWeight: '900',

    marginBottom: 8},

  statCardLabel: {

    fontSize: 16,

    fontWeight: '700',

    color: '#374151',

    marginBottom: 8},

  statCardChange: {

    fontSize: 12,

    fontWeight: '700',

    color: '#10B981',

    backgroundColor: '#D1FAE5',

    paddingHorizontal: 12,

    paddingVertical: 4,

    borderRadius: 20,

    marginBottom: 8},

  statCardContext: {

    fontSize: 12,

    fontWeight: '600',

    color: '#6B7280'},



  // Voting Breakdown Styles

  votingBreakdown: {

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    padding: 24,

    elevation: 2,

    elevation: 4},

  cardTitle: {

    fontSize: 18,

    fontWeight: '900',

    color: '#111827',

    marginBottom: 16},

  votingItem: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 12},

  votingLabel: {

    fontSize: 14,

    fontWeight: '600',

    color: '#374151',

    flex: 1},

  votingRight: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 12},

  progressBarContainer: {

    width: 96,

    height: 8,

    backgroundColor: '#E5E7EB',

    borderRadius: 4,

    overflow: 'hidden'},

  progressBar: {

    height: '100%',

    borderRadius: 4},

  votingPercentage: {

    fontSize: 14,

    fontWeight: '900',

    color: '#111827',

    minWidth: 40,

    textAlign: 'right'},



  // Action Card Styles

  actionCard: {

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    padding: 24,

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    elevation: 2,

    elevation: 4},

  actionCardTitle: {

    fontSize: 18,

    fontWeight: '900',

    color: '#3B82F6',

    marginBottom: 4},

  actionCardSubtitle: {

    fontSize: 14,

    fontWeight: '600',

    color: '#60A5FA'},



  // Promise Styles

  promiseHeader: {

    flexDirection: 'row',

    alignItems: 'center',

    padding: 24,

    borderRadius: 24,

    gap: 16,

    elevation: 2,

    elevation: 8},

  promiseHeaderIcon: {

    width: 64,

    height: 64,

    borderRadius: 16,

    backgroundColor: 'rgba(255,255,255,0.2)',

    justifyContent: 'center',

    alignItems: 'center'},

  promiseHeaderTitle: {

    fontSize: 20,

    fontWeight: '900',

    color: '#FFFFFF',

    marginBottom: 4},

  promiseHeaderSubtitle: {

    fontSize: 16,

    fontWeight: '600',

    color: 'rgba(255,255,255,0.9)'},

  promisesList: {

    gap: 24},

  promiseCard: {

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    padding: 24,

    elevation: 2,

    elevation: 4},

  promiseCardHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'flex-start',

    marginBottom: 16},

  promiseTitle: {

    fontSize: 18,

    fontWeight: '900',

    color: '#111827',

    flex: 1,

    marginRight: 16,

    lineHeight: 24},

  promiseStatus: {

    backgroundColor: '#DBEAFE',

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 20},

  promiseStatusText: {

    fontSize: 12,

    fontWeight: '900',

    color: '#1D4ED8'},

  progressSection: {

    marginBottom: 16},

  progressHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 12},

  progressLabel: {

    fontSize: 14,

    fontWeight: '600',

    color: '#6B7280'},

  progressValue: {

    fontSize: 20,

    fontWeight: '900',

    color: '#111827'},

  progressContainer: {

    height: 16,

    backgroundColor: '#E5E7EB',

    borderRadius: 8,

    overflow: 'hidden'},

  progressFill: {

    height: '100%',

    backgroundColor: '#10B981',

    borderRadius: 8,

    position: 'relative'},

  promiseFooter: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center'},

  promiseDate: {

    fontSize: 14,

    fontWeight: '600',

    color: '#6B7280'},

  detailsButton: {

    backgroundColor: '#DBEAFE',

    paddingHorizontal: 16,

    paddingVertical: 8,

    borderRadius: 12},

  detailsButtonText: {

    fontSize: 14,

    fontWeight: '900',

    color: '#1D4ED8'},

  expandedDetails: {

    marginTop: 24,

    paddingTop: 24,

    borderTopWidth: 1,

    borderTopColor: '#E5E7EB',

    gap: 16},

  detailSection: {

    backgroundColor: '#F9FAFB',

    borderRadius: 16,

    padding: 16},

  detailSectionTitle: {

    fontSize: 12,

    fontWeight: '900',

    color: '#374151',

    letterSpacing: 1,

    marginBottom: 8},

  detailSectionText: {

    fontSize: 14,

    fontWeight: '600',

    color: '#6B7280',

    lineHeight: 20},



  // Timeline View Styles

  newsCard: {

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    padding: 24,

    elevation: 2,

    elevation: 4,

    marginBottom: 16},

  newsCardHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    marginBottom: 16},

  newsCardLeft: {

    flex: 1},

  newsCardMeta: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 12,

    marginBottom: 8},

  newsCategoryBadge: {

    backgroundColor: '#F3E8FF',

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 20},

  newsCategoryText: {

    fontSize: 12,

    fontWeight: '900',

    color: '#8B5CF6'},

  newsDate: {

    fontSize: 12,

    fontWeight: '600',

    color: '#6B7280'},

  newsTitle: {

    fontSize: 18,

    fontWeight: '900',

    color: '#111827',

    lineHeight: 24,

    marginBottom: 8},

  newsPreview: {

    fontSize: 14,

    fontWeight: '600',

    color: '#6B7280',

    lineHeight: 20},

  newsIconContainer: {

    width: 48,

    height: 48,

    borderRadius: 12,

    backgroundColor: '#F3E8FF',

    justifyContent: 'center',

    alignItems: 'center',

    marginLeft: 16},

  newsCardFooter: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    paddingTop: 12,

    borderTopWidth: 1,

    borderTopColor: '#F3F4F6'},

  breakingNewsIndicator: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 8},

  pulsingDot: {

    width: 8,

    height: 8,

    borderRadius: 4,

    backgroundColor: '#10B981'},

  breakingNewsText: {

    fontSize: 14,

    fontWeight: '700',

    color: '#6B7280'},

  readMoreContainer: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 4},

  readMoreText: {

    fontSize: 14,

    fontWeight: '700',

    color: '#8B5CF6'},

  timelineActionCard: {

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    padding: 24,

    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    gap: 12,

    elevation: 2,

    elevation: 4},

  timelineActionText: {

    fontSize: 16,

    fontWeight: '900',

    color: '#6B7280'},



  // Career View Styles

  careerCard: {

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    padding: 24,

    marginBottom: 16,

    elevation: 2,

    elevation: 4},

  careerCardHeader: {

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 16},

  careerIconContainer: {

    width: 56,

    height: 56,

    borderRadius: 16,

    justifyContent: 'center',

    alignItems: 'center',

    marginRight: 16},

  careerCardContent: {

    flex: 1},

  careerTitle: {

    fontSize: 20,

    fontWeight: '900',

    color: '#111827',

    marginBottom: 4},

  careerPeriod: {

    fontSize: 16,

    fontWeight: '600',

    color: '#6B7280',

    marginBottom: 8},

  activeStatus: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 8},

  activeDot: {

    width: 8,

    height: 8,

    borderRadius: 4,

    backgroundColor: '#10B981'},

  activeText: {

    fontSize: 14,

    fontWeight: '700',

    color: '#10B981'},

  careerDescription: {

    fontSize: 14,

    fontWeight: '600',

    color: '#6B7280',

    lineHeight: 20},

  careerSummaryCard: {

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    padding: 24,

    elevation: 2,

    elevation: 4},

  careerSummaryTitle: {

    fontSize: 18,

    fontWeight: '900',

    color: '#111827',

    marginBottom: 16,

    textAlign: 'center'},

  careerStats: {

    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center'},

  careerStatItem: {

    alignItems: 'center'},

  careerStatValue: {

    fontSize: 24,

    fontWeight: '900',

    color: '#111827'},

  careerStatLabel: {

    fontSize: 12,

    fontWeight: '600',

    color: '#6B7280',

    marginTop: 4,

    textAlign: 'center'},

  careerStatDivider: {

    width: 1,

    height: 40,

    backgroundColor: '#E5E7EB',

    marginHorizontal: 24},



  // Documents View Styles

  filterContainer: {

    marginBottom: 24},

  filterContent: {

    paddingRight: 24,

    gap: 8},

  filterTab: {

    backgroundColor: '#F3F4F6',

    paddingHorizontal: 16,

    paddingVertical: 8,

    borderRadius: 20},

  filterTabActive: {

    backgroundColor: '#3B82F6'},

  filterTabText: {

    fontSize: 14,

    fontWeight: '700',

    color: '#374151'},

  filterTabTextActive: {

    color: '#FFFFFF'},

  documentsList: {

    gap: 16},

  documentCard: {

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    padding: 24,

    elevation: 2,

    elevation: 4},

  documentCardHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    marginBottom: 16},

  documentCardLeft: {

    flex: 1},

  documentMeta: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 12,

    marginBottom: 8},

  documentTypeBadge: {

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 20},

  documentTypeText: {

    fontSize: 12,

    fontWeight: '900'},

  documentDate: {

    fontSize: 12,

    fontWeight: '600',

    color: '#6B7280'},

  documentTitle: {

    fontSize: 18,

    fontWeight: '900',

    color: '#111827',

    lineHeight: 24,

    marginBottom: 8},

  documentPreview: {

    fontSize: 14,

    fontWeight: '600',

    color: '#6B7280',

    lineHeight: 20},

  documentIconSection: {

    alignItems: 'center',

    marginLeft: 16},

  documentIconContainer: {

    width: 48,

    height: 48,

    borderRadius: 12,

    justifyContent: 'center',

    alignItems: 'center',

    marginBottom: 8},

  documentPages: {

    fontSize: 12,

    fontWeight: '600',

    color: '#6B7280',

    textAlign: 'center'},

  documentCardFooter: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    paddingTop: 12,

    borderTopWidth: 1,

    borderTopColor: '#F3F4F6'},

  documentSource: {

    fontSize: 14,

    fontWeight: '700',

    color: '#6B7280'},

  documentStatusContainer: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 8},

  documentStatusBadge: {

    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 20},

  documentStatusAvailable: {

    backgroundColor: '#D1FAE5'},

  documentStatusVideo: {

    backgroundColor: '#FEE2E2'},

  documentStatusTranscript: {

    backgroundColor: '#DBEAFE'},

  documentStatusText: {

    fontSize: 12,

    fontWeight: '700'},

  documentStatusTextAvailable: {

    color: '#065F46'},

  documentStatusTextVideo: {

    color: '#991B1B'},

  documentStatusTextTranscript: {

    color: '#1E40AF'},

  loadMoreButton: {

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    padding: 24,

    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    gap: 12,

    elevation: 2,

    elevation: 4,

    marginTop: 8},

  loadMoreText: {

    fontSize: 16,

    fontWeight: '900',

    color: '#6B7280'},



  // ========== MODERN MODAL STYLES ==========

  // Base Modal Styles

  modalOverlay: {

    flex: 1,

    backgroundColor: 'rgba(0,0,0,0.7)',

    justifyContent: 'center',

    alignItems: 'center',

    paddingHorizontal: 20},

  modernModalContent: {

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    width: '100%',

    maxHeight: '85%',

    elevation: 2,

    elevation: 25},

  

  // Header Styles

  modernModalHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    padding: 24,

    borderBottomWidth: 1,

    borderBottomColor: '#F3F4F6'},

  modernModalHeaderGradient: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    padding: 24,

    borderTopLeftRadius: 24,

    borderTopRightRadius: 24},

  modernModalTitle: {

    fontSize: 24,

    fontWeight: '900',

    color: '#111827',

    marginBottom: 4},

  modernModalTitleWhite: {

    fontSize: 24,

    fontWeight: '900',

    color: '#FFFFFF',

    marginBottom: 4},

  modernModalSubtitle: {

    fontSize: 14,

    fontWeight: '600',

    color: '#6B7280'},

  modernModalSubtitleWhite: {

    fontSize: 14,

    fontWeight: '600',

    color: 'rgba(255,255,255,0.9)'},

  modernCloseButton: {

    width: 44,

    height: 44,

    borderRadius: 12,

    backgroundColor: '#F3F4F6',

    justifyContent: 'center',

    alignItems: 'center'},

  modernCloseButtonWhite: {

    width: 44,

    height: 44,

    borderRadius: 12,

    backgroundColor: 'rgba(255,255,255,0.2)',

    justifyContent: 'center',

    alignItems: 'center'},

  

  // Body Styles

  modernModalBody: {

    padding: 24},

  

  // Badge Styles

  modernSourceBadge: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#F3E8FF',

    paddingHorizontal: 16,

    paddingVertical: 8,

    borderRadius: 20,

    marginBottom: 16,

    alignSelf: 'flex-start'},

  modernSourceBadgeText: {

    fontSize: 12,

    fontWeight: '900',

    color: '#8B5CF6',

    marginRight: 12},

  breakingDot: {

    width: 6,

    height: 6,

    borderRadius: 3,

    backgroundColor: '#EF4444',

    marginRight: 6},

  breakingText: {

    fontSize: 10,

    fontWeight: '900',

    color: '#EF4444'},

  modernTypeBadge: {

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 16,

    paddingVertical: 8,

    borderRadius: 20,

    marginBottom: 16,

    alignSelf: 'flex-start',

    gap: 8},

  modernTypeBadgeText: {

    fontSize: 12,

    fontWeight: '900'},

  modernStatusBadge: {

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 16,

    paddingVertical: 12,

    borderRadius: 16,

    marginBottom: 16,

    gap: 12},

  modernStatusDot: {

    width: 8,

    height: 8,

    borderRadius: 4},

  modernStatusText: {

    fontSize: 14,

    fontWeight: '900'},

  

  // Content Styles

  modernHeadline: {

    fontSize: 22,

    fontWeight: '900',

    color: '#111827',

    lineHeight: 28,

    marginBottom: 20},

  modernMetaRow: {

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 20},

  modernMetaItem: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 8},

  modernMetaText: {

    fontSize: 14,

    fontWeight: '600',

    color: '#6B7280'},

  modernMetaGrid: {

    flexDirection: 'row',

    gap: 12,

    marginBottom: 20},

  modernMetaCard: {

    flex: 1,

    backgroundColor: '#F9FAFB',

    borderRadius: 16,

    padding: 16,

    alignItems: 'center'},

  modernMetaCardLabel: {

    fontSize: 12,

    fontWeight: '600',

    color: '#6B7280',

    marginTop: 8},

  modernMetaCardValue: {

    fontSize: 14,

    fontWeight: '900',

    color: '#111827',

    marginTop: 4,

    textAlign: 'center'},

  

  // Section Styles

  modernContentSection: {

    marginBottom: 24},

  modernSectionLabel: {

    fontSize: 16,

    fontWeight: '900',

    color: '#111827',

    marginBottom: 12},

  modernSummary: {

    fontSize: 16,

    fontWeight: '500',

    color: '#374151',

    lineHeight: 24},

  

  // Quotes Styles

  modernQuotesContainer: {

    gap: 12},

  modernQuoteCard: {

    flexDirection: 'row',

    backgroundColor: '#F8FAFC',

    borderRadius: 16,

    padding: 16,

    borderLeftWidth: 4,

    borderLeftColor: '#8B5CF6',

    gap: 12},

  modernQuoteText: {

    flex: 1,

    fontSize: 15,

    fontWeight: '500',

    color: '#374151',

    fontStyle: 'italic',

    lineHeight: 22},

  

  // Actions Styles

  modernActionsContainer: {

    gap: 12},

  modernActionCard: {

    backgroundColor: '#F0FDF4',

    borderRadius: 16,

    padding: 16,

    borderLeftWidth: 4,

    borderLeftColor: '#10B981'},

  modernActionHeader: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 12,

    marginBottom: 8},

  modernActionTitle: {

    flex: 1,

    fontSize: 16,

    fontWeight: '700',

    color: '#111827'},

  modernActionDate: {

    fontSize: 14,

    fontWeight: '600',

    color: '#059669',

    marginBottom: 4},

  modernActionConnection: {

    fontSize: 14,

    fontWeight: '500',

    color: '#6B7280'},

  

  // Sources Styles

  modernSourcesContainer: {

    gap: 8},

  modernSourceItem: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 12,

    paddingVertical: 8},

  modernSourceItemText: {

    flex: 1,

    fontSize: 14,

    fontWeight: '600',

    color: '#374151'},

  

  // Button Styles

  modernActionsSection: {

    gap: 20},

  modernPrimaryButton: {

    backgroundColor: '#111827',

    borderRadius: 16,

    paddingVertical: 16,

    paddingHorizontal: 24,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 12,

    elevation: 2,

    elevation: 4},

  modernPrimaryButtonText: {

    fontSize: 16,

    fontWeight: '900',

    color: '#FFFFFF'},

  modernOtherSources: {

    gap: 12},

  modernSourcesGrid: {

    flexDirection: 'row',

    gap: 8},

  modernSourceButton: {

    paddingHorizontal: 16,

    paddingVertical: 8,

    borderRadius: 20,

    flex: 1,

    alignItems: 'center'},

  modernSourceButtonText: {

    fontSize: 14,

    fontWeight: '700',

    color: '#FFFFFF'}});



export default PoliticianDetailScreen;