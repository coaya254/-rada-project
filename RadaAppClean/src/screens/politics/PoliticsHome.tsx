import React, { useState, useEffect } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PoliticsStackParamList } from '../../navigation/PoliticsStackNavigator';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  FlatList,
  RefreshControl,
  Image,
  Modal,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner, ErrorDisplay, LoadingCard, LoadingListItem } from '../../components/ui';

interface PoliticsHomeProps {
  navigation: NativeStackNavigationProp<PoliticsStackParamList, 'PoliticsHome'>;
}

interface Politician {
  id: number;
  name: string;
  title: string;
  party: string;
  constituency: string;
  image_url?: string;
  party_color?: string;
  key_achievements: string[];
  education?: string;
  party_history: string[];
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  timestamp: string;
  politician?: string;
  source?: string;
  url?: string;
}

export const PoliticsHome: React.FC<PoliticsHomeProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);
  const [filteredPoliticians, setFilteredPoliticians] = useState<Politician[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState({
    experience: { min: 0, max: 30 },
    achievements: { min: 0, max: 10 },
    partyChanges: { min: 0, max: 5 },
    regions: [] as string[],
    positions: [] as string[],
    parties: [] as string[],
    education: [] as string[],
    ageRange: { min: 25, max: 80 },
    verificationStatus: 'all' as 'all' | 'verified' | 'unverified'
  });
  const [notificationSettings, setNotificationSettings] = useState({
    newPoliticians: true,
    profileUpdates: false,
    partyChanges: true,
    achievementUpdates: true,
    newsAlerts: false,
    votingRecords: true,
    constituency: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    frequency: 'daily' as 'immediate' | 'daily' | 'weekly' | 'monthly',
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '07:00'
    }
  });

  // Modal states
  const [selectedPolitician, setSelectedPolitician] = useState<Politician | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQuickInfoModal, setShowQuickInfoModal] = useState(false);
  const [showAdvancedFiltersModal, setShowAdvancedFiltersModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [showAdvancedSearchModal, setShowAdvancedSearchModal] = useState(false);
  const [selectedPoliticians, setSelectedPoliticians] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsActiveTab, setNewsActiveTab] = useState<'main' | 'external1' | 'external2'>('main');
  const [showPromisesModal, setShowPromisesModal] = useState(false);
  const [showVotingRecordsModal, setShowVotingRecordsModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [politicians, setPoliticians] = useState<Politician[]>([
    {
      id: 1,
      name: 'Amason Jeffah Kingi',
      title: 'Speaker of the Senate',
      party: 'PAA',
      constituency: 'Kilifi County',
      party_color: '#1e40af',
      key_achievements: ['Speaker of Senate 2022-present', 'Governor Kilifi 2013-2022', 'MP Kilifi North 2007-2013'],
      education: 'University of Nairobi (LLB)',
      party_history: ['ODM (2007-2012)', 'UDF (2012-2016)', 'Jubilee (2016-2022)', 'UDA (2022-present)'],
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Amason_Kingi_2022.jpg/400px-Amason_Kingi_2022.jpg',
    },
    {
      id: 2,
      name: 'William Ruto',
      title: 'President of Kenya',
      party: 'UDA',
      constituency: 'Kenya',
      party_color: '#1e40af',
      key_achievements: ['President 2022-present', 'Deputy President 2013-2022', 'Bottom-up Economic Transformation'],
      education: 'University of Nairobi (BSc), University of Queensland (PhD)',
      party_history: ['KANU (2002-2007)', 'ODM (2007-2012)', 'URP/Jubilee (2013-2021)', 'UDA (2022-present)'],
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/William_Ruto_2022.jpg/400px-William_Ruto_2022.jpg',
    },
    {
      id: 3,
      name: 'Raila Odinga',
      title: 'Opposition Leader',
      party: 'ODM',
      constituency: 'Nairobi',
      party_color: '#f97316',
      key_achievements: ['Prime Minister 2008-2013', 'Opposition Leader', 'AU High Representative'],
      education: 'University of Leipzig (MSc)',
      party_history: ['KANU (1990s)', 'NARC (2002-2005)', 'ODM (2005-present)'],
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Raila_Odinga_2017.jpg/400px-Raila_Odinga_2017.jpg',
    },
  ]);

  const [latestNews, setLatestNews] = useState<NewsItem[]>([
    {
      id: 1,
      title: 'New Infrastructure Bill Passed',
      summary: 'Senate approves major infrastructure development bill',
      timestamp: '2h ago',
      politician: 'Amason Kingi',
    },
    {
      id: 2,
      title: 'Education Reform Debate',
      summary: 'Parliamentary discussion on education system changes',
      timestamp: '4h ago',
    },
  ]);

  const [externalNews1, setExternalNews1] = useState<NewsItem[]>([
    {
      id: 101,
      title: 'Parliamentary Budget Session Update',
      summary: 'Comprehensive coverage of the budget debate and key allocations for infrastructure and social programs',
      timestamp: '1h ago',
      politician: 'Rachel Ruto',
      source: 'The Standard',
      url: 'https://standardmedia.co.ke/politics',
    },
    {
      id: 102,
      title: 'County Government Performance Review',
      summary: 'Analysis of county performance in service delivery and development projects across the nation',
      timestamp: '3h ago',
      source: 'The Standard',
      url: 'https://standardmedia.co.ke/counties',
    },
    {
      id: 103,
      title: 'Opposition Alliance Strategy Meeting',
      summary: 'Key opposition leaders meet to discuss upcoming political strategies and policy positions',
      timestamp: '5h ago',
      politician: 'Raila Odinga',
      source: 'The Standard',
      url: 'https://standardmedia.co.ke/politics',
    },
  ]);

  const [externalNews2, setExternalNews2] = useState<NewsItem[]>([
    {
      id: 201,
      title: 'Healthcare System Reforms Announced',
      summary: 'Government announces major healthcare reforms including universal health coverage expansion and medical facility upgrades',
      timestamp: '2h ago',
      politician: 'Susan Nakhumicha',
      source: 'Citizen TV',
      url: 'https://citizen.digital/news',
    },
    {
      id: 202,
      title: 'Education Sector Budget Allocation',
      summary: 'Ministry of Education receives increased budget allocation for infrastructure development and teacher training programs',
      timestamp: '4h ago',
      politician: 'Ezekiel Machogu',
      source: 'Citizen TV',
      url: 'https://citizen.digital/news',
    },
    {
      id: 203,
      title: 'Anti-Corruption Campaign Progress',
      summary: 'Latest updates on the government\'s anti-corruption initiatives and prosecution of high-profile cases',
      timestamp: '6h ago',
      source: 'Citizen TV',
      url: 'https://citizen.digital/news',
    },
  ]);

  useEffect(() => {
    // Filter and search logic
    const filtered = politicians.filter(politician => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        politician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        politician.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        politician.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
        politician.constituency.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesFilter = selectedFilter === 'all' ||
        (selectedFilter === 'president' && politician.title.toLowerCase().includes('president')) ||
        (selectedFilter === 'uda' && politician.party.includes('UDA')) ||
        (selectedFilter === 'odm' && politician.party.includes('ODM')) ||
        (selectedFilter === 'speaker' && politician.title.toLowerCase().includes('speaker'));

      return matchesSearch && matchesFilter;
    });

    setFilteredPoliticians(filtered);
  }, [searchQuery, selectedFilter, politicians]);

  useEffect(() => {
    // Simulate initial data loading
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate potential error (uncomment to test error state)
        // if (Math.random() > 0.7) {
        //   throw new Error('Failed to load political data');
        // }

        setFilteredPoliticians(politicians);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate potential error during refresh
      if (Math.random() > 0.8) {
        throw new Error('Failed to refresh data');
      }

      setRefreshing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Simulate retry
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handlePoliticianShare = (politician: Politician) => {
    setSelectedPolitician(politician);
    setShowShareModal(true);
  };

  const handleQuickInfo = (politician: Politician) => {
    setSelectedPolitician(politician);
    setShowQuickInfoModal(true);
  };

  const handleAdvancedFilters = () => {
    setShowAdvancedFiltersModal(true);
  };

  const applyAdvancedFilters = () => {
    // Apply advanced filtering logic
    let filtered = [...politicians];

    // Experience filter
    filtered = filtered.filter(p => {
      const exp = 15; // Mock experience calculation
      return exp >= advancedFilters.experience.min && exp <= advancedFilters.experience.max;
    });

    // Achievements filter
    filtered = filtered.filter(p => {
      const achCount = p.key_achievements?.length || 0;
      return achCount >= advancedFilters.achievements.min && achCount <= advancedFilters.achievements.max;
    });

    setFilteredPoliticians(filtered);
    setShowAdvancedFiltersModal(false);
  };

  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      experience: { min: 0, max: 30 },
      achievements: { min: 0, max: 10 },
      partyChanges: { min: 0, max: 5 },
      regions: [],
      positions: [],
      parties: [],
      education: [],
      ageRange: { min: 25, max: 80 },
      verificationStatus: 'all'
    });
  };

  const featuredPolitician = politicians[0];

  const renderPoliticianCard = ({ item }: { item: Politician }) => {
    const isSelected = selectedPoliticians.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.enhancedPoliticianCard,
          isSelectionMode && isSelected && styles.selectedCard
        ]}
        onPress={() => {
          if (isSelectionMode) {
            togglePoliticianSelection(item.id);
          } else {
            navigation.navigate('PoliticianDetail', { politician: item });
          }
        }}
        activeOpacity={0.8}
      >
        {/* Selection Checkbox */}
        {isSelectionMode && (
          <View style={styles.selectionOverlay}>
            <TouchableOpacity
              style={[
                styles.selectionCheckbox,
                isSelected && styles.selectionCheckboxSelected
              ]}
              onPress={() => togglePoliticianSelection(item.id)}
            >
              {isSelected && (
                <MaterialIcons name="check" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Card Header with Image and Basic Info */}
        <View style={styles.cardHeader}>
          <View style={styles.politicianImageContainer}>
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.politicianImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[
                styles.politicianImagePlaceholder,
                { backgroundColor: item.party_color || '#6b7280' }
              ]}>
                <Text style={styles.politicianInitial}>{item.name.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.onlineIndicator} />
          </View>

          <View style={styles.cardHeaderInfo}>
            <Text style={styles.enhancedPoliticianName}>{item.name}</Text>
            <Text style={styles.enhancedPoliticianTitle}>{item.title}</Text>
            <Text style={styles.enhancedPoliticianConstituency}>{item.constituency}</Text>
          </View>

          {!isSelectionMode && (
            <View style={styles.cardHeaderActions}>
              <TouchableOpacity
                style={styles.cardActionButton}
                onPress={() => {
                  // Handle favorite toggle
                  console.log('Toggle favorite for', item.name);
                }}
              >
                <MaterialIcons name="favorite-border" size={18} color="#667eea" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cardActionButton}
                onPress={() => handlePoliticianShare(item)}
              >
                <MaterialIcons name="share" size={18} color="#667eea" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cardActionButton}
                onPress={() => handleQuickInfo(item)}
              >
                <MaterialIcons name="info-outline" size={18} color="#667eea" />
              </TouchableOpacity>
              <MaterialIcons name="chevron-right" size={20} color="#667eea" />
            </View>
          )}
        </View>

        {/* Party Badge and Key Info */}
        <View style={styles.cardBody}>
          <View style={styles.partyInfo}>
            <View style={[
              styles.partyBadge,
              { backgroundColor: item.party_color || '#6b7280' }
            ]}>
              <Text style={styles.partyText}>
                {item.party}
              </Text>
            </View>
            <Text style={styles.partyHistory}>
              {item.party_history.length} party{item.party_history.length !== 1 ? 'ies' : ''}
            </Text>
          </View>

          {/* Key Achievements */}
          <View style={styles.achievementsContainer}>
            {item.key_achievements.slice(0, 2).map((achievement, index) => (
              <View key={index} style={styles.achievementTag}>
                <Text style={styles.achievementText}>{achievement}</Text>
              </View>
            ))}
            {item.key_achievements.length > 2 && (
              <TouchableOpacity style={styles.moreAchievements}>
                <Text style={styles.moreAchievementsText}>
                  +{item.key_achievements.length - 2} more
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Card Footer with Education and Navigation */}
        <View style={styles.cardFooter}>
          <View style={styles.cardFooterLeft}>
            <MaterialIcons name="school" size={14} color="#666" />
            <Text style={styles.cardFooterText}>
              {item.education ? 'Educated' : 'Self-taught'}
            </Text>
          </View>
          {!isSelectionMode && (
            <View style={styles.cardFooterRight}>
              <Text style={styles.viewProfileText}>View Profile</Text>
              <MaterialIcons name="chevron-right" size={14} color="#667eea" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <View style={styles.newsCard}>
      <View style={styles.newsHeader}>
        <MaterialIcons name="article" size={20} color="#3B82F6" />
        <Text style={styles.newsTimestamp}>{item.timestamp}</Text>
      </View>
      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.newsSummary}>{item.summary}</Text>
      {item.politician && (
        <Text style={styles.newsPolitician}>Related to: {item.politician}</Text>
      )}
    </View>
  );

  // Bulk Actions Handlers
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedPoliticians([]);
    }
  };

  const togglePoliticianSelection = (politicianId: number) => {
    setSelectedPoliticians(prev =>
      prev.includes(politicianId)
        ? prev.filter(id => id !== politicianId)
        : [...prev, politicianId]
    );
  };

  const selectAllPoliticians = () => {
    setSelectedPoliticians(politicians.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedPoliticians([]);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on politicians:`, selectedPoliticians);
    setShowBulkActionsModal(false);
    setIsSelectionMode(false);
    setSelectedPoliticians([]);
    // Add actual bulk action logic here
  };

  // Show loading state on initial load
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Politics</Text>
            <Text style={styles.headerSubtitle}>Track politicians & their commitments</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <MaterialIcons name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Search Bar Skeleton */}
          <View style={styles.section}>
            <View style={[styles.searchContainer, { backgroundColor: '#e9ecef' }]} />
          </View>

          {/* Featured Card Loading */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Politician</Text>
            <LoadingCard message="Loading featured politician..." />
          </View>

          {/* Quick Actions Loading */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Research Tools</Text>
            <View style={styles.toolsGrid}>
              {Array.from({ length: 4 }, (_, index) => (
                <View key={index} style={[styles.toolCard, { backgroundColor: '#e9ecef' }]}>
                  <View style={{ width: 32, height: 32, backgroundColor: '#d1d5db', borderRadius: 16 }} />
                  <View style={{ width: 60, height: 12, backgroundColor: '#d1d5db', borderRadius: 6, marginTop: 8 }} />
                  <View style={{ width: 40, height: 10, backgroundColor: '#d1d5db', borderRadius: 5, marginTop: 2 }} />
                </View>
              ))}
            </View>
          </View>

          {/* Politicians List Loading */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Politicians</Text>
            <LoadingListItem count={3} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ErrorDisplay
          title="Failed to Load Politics"
          message={error}
          onRetry={handleRetry}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Enhanced Gradient Header */}
        <View style={styles.gradientHeaderContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientHeader}
          >
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.headerEmoji}>🏛️</Text>
                </View>
                <View>
                  <Text style={styles.enhancedHeaderTitle}>Political Archive</Text>
                  <Text style={styles.enhancedHeaderSubtitle}>Kenya's Political Database</Text>
                </View>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.headerActionButton}
                  onPress={() => setShowAdvancedSearchModal(true)}
                >
                  <MaterialIcons name="search" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.headerActionButton}
                  onPress={() => setShowNotificationsModal(true)}
                >
                  <MaterialIcons name="notifications" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerActionButton}
                  onPress={() => setShowFilters(!showFilters)}
                >
                  <MaterialIcons name="tune" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerActionButton}
                  onPress={() => {
                    // Handle sort/order toggle
                    console.log('Toggle sort order');
                  }}
                >
                  <MaterialIcons name="sort" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerActionButton}>
                  <MaterialIcons name="notifications" size={20} color="#fff" />
                  <View style={styles.notificationBadge} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats Overview */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <LinearGradient colors={['#667eea', '#764ba2']} style={styles.statIconGradient}>
                    <MaterialIcons name="people" size={16} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={styles.statNumber}>{politicians.length}</Text>
                <Text style={styles.statLabel}>Politicians</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <LinearGradient colors={['#ffecd2', '#fcb69f']} style={styles.statIconGradient}>
                    <MaterialIcons name="schedule" size={16} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={styles.statNumber}>25</Text>
                <Text style={styles.statLabel}>Years</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <LinearGradient colors={['#a8edea', '#fed6e3']} style={styles.statIconGradient}>
                    <MaterialIcons name="verified" size={16} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={styles.statNumber}>100+</Text>
                <Text style={styles.statLabel}>Sources</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Enhanced Search Bar */}
        <View style={styles.section}>
          <View style={styles.enhancedSearchContainer}>
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={20} color="#667eea" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search politicians, parties, or issues..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <MaterialIcons name="close" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.filterButton, showFilters && styles.filterButtonActive]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <MaterialIcons name="filter-list" size={20} color={showFilters ? "#fff" : "#667eea"} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.advancedFilterButton}
              onPress={handleAdvancedFilters}
            >
              <MaterialIcons name="tune" size={20} color="#667eea" />
            </TouchableOpacity>
          </View>

          {/* Animated Filter Chips */}
          {showFilters && (
            <View style={styles.filterChipsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChipsContent}
              >
                {[
                  { id: 'all', label: 'All', icon: '👥', color: '#667eea' },
                  { id: 'president', label: 'Presidents', icon: '👑', color: '#f59e0b' },
                  { id: 'speaker', label: 'Speakers', icon: '🏛️', color: '#10b981' },
                  { id: 'uda', label: 'UDA', icon: '🔵', color: '#3b82f6' },
                  { id: 'odm', label: 'ODM', icon: '🟠', color: '#f97316' }
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterChip,
                      selectedFilter === filter.id && {
                        ...styles.activeFilterChip,
                        backgroundColor: filter.color,
                        borderColor: filter.color
                      }
                    ]}
                    onPress={() => setSelectedFilter(filter.id)}
                  >
                    <Text style={styles.filterChipIcon}>{filter.icon}</Text>
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
        </View>

        {/* Featured Politician Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Politician</Text>
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => navigation.navigate('PoliticianDetail', { politician: featuredPolitician })}
          >
            <LinearGradient
              colors={['#3B82F6', '#1E40AF']}
              style={styles.featuredGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featuredContent}>
                <View style={styles.featuredProfile}>
                  <View style={styles.featuredAvatar}>
                    <Text style={styles.featuredAvatarText}>AK</Text>
                  </View>
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredName}>{featuredPolitician.name}</Text>
                    <Text style={styles.featuredTitle}>{featuredPolitician.title}</Text>
                    <Text style={styles.featuredLocation}>
                      📍 {featuredPolitician.constituency} • {featuredPolitician.party}
                    </Text>
                  </View>
                </View>
                <View style={styles.featuredStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>95%</Text>
                    <Text style={styles.statLabel}>Attendance</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>17</Text>
                    <Text style={styles.statLabel}>Years</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>89</Text>
                    <Text style={styles.statLabel}>Promises</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Access Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Research Tools</Text>
          <View style={styles.toolsGrid}>
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => setShowNewsModal(true)}
            >
              <MaterialIcons name="article" size={32} color="#3B82F6" />
              <Text style={styles.toolTitle}>Political News</Text>
              <Text style={styles.toolCount}>156 articles</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => setShowVotingRecordsModal(true)}
            >
              <MaterialIcons name="bar-chart" size={32} color="#10B981" />
              <Text style={styles.toolTitle}>Voting Records</Text>
              <Text style={styles.toolCount}>1.2K votes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => setShowPromisesModal(true)}
            >
              <MaterialIcons name="track-changes" size={32} color="#EF4444" />
              <Text style={styles.toolTitle}>Promises</Text>
              <Text style={styles.toolCount}>89 tracked</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => setShowComparisonModal(true)}
            >
              <MaterialIcons name="compare" size={32} color="#8B5CF6" />
              <Text style={styles.toolTitle}>Compare</Text>
              <Text style={styles.toolCount}>Side by side</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Politicians List */}
        <View style={styles.section}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>
              {filteredPoliticians.length} Politician{filteredPoliticians.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
            </Text>
            <View style={styles.listHeaderActions}>
              <TouchableOpacity
                style={[
                  styles.selectionModeButton,
                  isSelectionMode && styles.selectionModeButtonActive
                ]}
                onPress={toggleSelectionMode}
              >
                <MaterialIcons
                  name={isSelectionMode ? "check-circle" : "radio-button-unchecked"}
                  size={20}
                  color={isSelectionMode ? "#FFFFFF" : "#667eea"}
                />
                <Text style={[
                  styles.selectionModeText,
                  isSelectionMode && styles.selectionModeTextActive
                ]}>
                  {isSelectionMode ? 'Done' : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bulk Actions Bar */}
          {isSelectionMode && (
            <View style={styles.bulkActionsBar}>
              <View style={styles.bulkActionsLeft}>
                <Text style={styles.selectedCount}>
                  {selectedPoliticians.length} selected
                </Text>
                <TouchableOpacity
                  style={styles.bulkSelectAll}
                  onPress={selectedPoliticians.length === filteredPoliticians.length ? clearSelection : selectAllPoliticians}
                >
                  <Text style={styles.bulkSelectAllText}>
                    {selectedPoliticians.length === filteredPoliticians.length ? 'Clear All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.bulkActionsButton,
                  selectedPoliticians.length === 0 && styles.bulkActionsButtonDisabled
                ]}
                onPress={() => setShowBulkActionsModal(true)}
                disabled={selectedPoliticians.length === 0}
              >
                <MaterialIcons name="more-horiz" size={20} color="#FFFFFF" />
                <Text style={styles.bulkActionsButtonText}>Actions</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={filteredPoliticians}
            renderItem={renderPoliticianCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="search-off" size={48} color="#ccc" />
                <Text style={styles.emptyTitle}>No politicians found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search or filters
                </Text>
              </View>
            }
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickAction, styles.analyticsAction]}
              onPress={() => setShowAnalyticsModal(true)}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.quickActionGradient}
              >
                <MaterialIcons name="analytics" size={24} color="#fff" />
                <Text style={styles.quickActionText}>Analytics</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, styles.comparisonAction]}
              onPress={() => navigation.navigate('PoliticianComparison' as never)}
            >
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.quickActionGradient}
              >
                <MaterialIcons name="compare" size={24} color="#fff" />
                <Text style={styles.quickActionText}>Compare</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, styles.comparisonAction]}
              onPress={() => setShowExportModal(true)}
            >
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.quickActionGradient}
              >
                <MaterialIcons name="file-download" size={24} color="#fff" />
                <Text style={styles.quickActionText}>Export</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, styles.favoritesAction]}
              onPress={() => setShowPerformanceModal(true)}
            >
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.quickActionGradient}
              >
                <MaterialIcons name="trending-up" size={24} color="#fff" />
                <Text style={styles.quickActionText}>Performance</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Latest News */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Political News</Text>
          <FlatList
            data={latestNews}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Share Modal */}
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
            <Text style={styles.modalTitle}>Share Politician</Text>
            <View style={styles.modalActionButton} />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedPolitician && (
              <>
                <View style={styles.shareModalProfile}>
                  <View style={styles.shareProfileImage}>
                    <Text style={styles.shareProfileInitial}>
                      {selectedPolitician.name.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.shareProfileName}>{selectedPolitician.name}</Text>
                    <Text style={styles.shareProfileTitle}>{selectedPolitician.title}</Text>
                  </View>
                </View>

                <Text style={styles.shareModalTitle}>Share {selectedPolitician.name}'s Profile</Text>

                <View style={styles.shareOptions}>
                  <TouchableOpacity style={styles.shareOption}>
                    <MaterialIcons name="link" size={24} color="#3B82F6" />
                    <Text style={styles.shareOptionText}>Copy Profile Link</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.shareOption}>
                    <MaterialIcons name="picture-as-pdf" size={24} color="#EF4444" />
                    <Text style={styles.shareOptionText}>Generate PDF Summary</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.shareOption}>
                    <MaterialIcons name="share" size={24} color="#8B5CF6" />
                    <Text style={styles.shareOptionText}>Share via Social Media</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Quick Info Modal */}
      <Modal
        visible={showQuickInfoModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQuickInfoModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowQuickInfoModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Quick Info</Text>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => {
                setShowQuickInfoModal(false);
                selectedPolitician && navigation.navigate('PoliticianDetail', { politician: selectedPolitician });
              }}
            >
              <MaterialIcons name="arrow-forward" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedPolitician && (
              <>
                <View style={styles.quickInfoProfile}>
                  <View style={styles.quickInfoImage}>
                    <Text style={styles.quickInfoInitial}>
                      {selectedPolitician.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.quickInfoDetails}>
                    <Text style={styles.quickInfoName}>{selectedPolitician.name}</Text>
                    <Text style={styles.quickInfoTitle}>{selectedPolitician.title}</Text>
                    <Text style={styles.quickInfoLocation}>
                      📍 {selectedPolitician.constituency} • {selectedPolitician.party}
                    </Text>
                  </View>
                </View>

                <View style={styles.quickInfoSection}>
                  <Text style={styles.quickInfoSectionTitle}>Education</Text>
                  <Text style={styles.quickInfoSectionText}>{selectedPolitician.education}</Text>
                </View>

                <View style={styles.quickInfoSection}>
                  <Text style={styles.quickInfoSectionTitle}>Key Achievements</Text>
                  {selectedPolitician.key_achievements.slice(0, 3).map((achievement, index) => (
                    <Text key={index} style={styles.quickInfoAchievement}>• {achievement}</Text>
                  ))}
                </View>

                <View style={styles.quickInfoSection}>
                  <Text style={styles.quickInfoSectionTitle}>Party History</Text>
                  <Text style={styles.quickInfoSectionText}>
                    {selectedPolitician.party_history.length} party affiliations
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.viewFullProfileButton}
                  onPress={() => {
                    setShowQuickInfoModal(false);
                    navigation.navigate('PoliticianDetail', { politician: selectedPolitician });
                  }}
                >
                  <Text style={styles.viewFullProfileText}>View Full Profile</Text>
                  <MaterialIcons name="arrow-forward" size={16} color="#FFF" />
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Advanced Filters Modal */}
      <Modal
        visible={showAdvancedFiltersModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowAdvancedFiltersModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAdvancedFiltersModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Advanced Filters</Text>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={applyAdvancedFilters}
            >
              <MaterialIcons name="check" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Experience Range</Text>
              <View style={styles.rangeContainer}>
                <Text style={styles.rangeLabel}>
                  {advancedFilters.experience.min} - {advancedFilters.experience.max} years
                </Text>
                <View style={styles.rangeSliders}>
                  <Text style={styles.rangeValue}>{advancedFilters.experience.min}</Text>
                  <View style={styles.rangeTrack}>
                    <View style={[styles.rangeThumb, { left: `${(advancedFilters.experience.min / 30) * 100}%` }]} />
                  </View>
                  <Text style={styles.rangeValue}>{advancedFilters.experience.max}</Text>
                </View>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Achievements Count</Text>
              <View style={styles.rangeContainer}>
                <Text style={styles.rangeLabel}>
                  {advancedFilters.achievements.min} - {advancedFilters.achievements.max} achievements
                </Text>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Political Parties</Text>
              <View style={styles.checkboxContainer}>
                {['UDA', 'ODM', 'Jubilee', 'PAA', 'ANC', 'Ford Kenya'].map((party) => (
                  <TouchableOpacity
                    key={party}
                    style={[
                      styles.checkboxItem,
                      advancedFilters.parties.includes(party) && styles.checkboxItemSelected
                    ]}
                    onPress={() => {
                      const newParties = advancedFilters.parties.includes(party)
                        ? advancedFilters.parties.filter(p => p !== party)
                        : [...advancedFilters.parties, party];
                      setAdvancedFilters({ ...advancedFilters, parties: newParties });
                    }}
                  >
                    <MaterialIcons
                      name={advancedFilters.parties.includes(party) ? 'check-box' : 'check-box-outline-blank'}
                      size={20}
                      color={advancedFilters.parties.includes(party) ? '#3B82F6' : '#6B7280'}
                    />
                    <Text style={styles.checkboxLabel}>{party}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Positions</Text>
              <View style={styles.checkboxContainer}>
                {['President', 'Speaker', 'Governor', 'Senator', 'MP', 'Cabinet Secretary'].map((position) => (
                  <TouchableOpacity
                    key={position}
                    style={[
                      styles.checkboxItem,
                      advancedFilters.positions.includes(position) && styles.checkboxItemSelected
                    ]}
                    onPress={() => {
                      const newPositions = advancedFilters.positions.includes(position)
                        ? advancedFilters.positions.filter(p => p !== position)
                        : [...advancedFilters.positions, position];
                      setAdvancedFilters({ ...advancedFilters, positions: newPositions });
                    }}
                  >
                    <MaterialIcons
                      name={advancedFilters.positions.includes(position) ? 'check-box' : 'check-box-outline-blank'}
                      size={20}
                      color={advancedFilters.positions.includes(position) ? '#3B82F6' : '#6B7280'}
                    />
                    <Text style={styles.checkboxLabel}>{position}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Regions</Text>
              <View style={styles.checkboxContainer}>
                {['Coast', 'Western', 'Central', 'Eastern', 'Nyanza', 'Rift Valley', 'North Eastern', 'Nairobi'].map((region) => (
                  <TouchableOpacity
                    key={region}
                    style={[
                      styles.checkboxItem,
                      advancedFilters.regions.includes(region) && styles.checkboxItemSelected
                    ]}
                    onPress={() => {
                      const newRegions = advancedFilters.regions.includes(region)
                        ? advancedFilters.regions.filter(r => r !== region)
                        : [...advancedFilters.regions, region];
                      setAdvancedFilters({ ...advancedFilters, regions: newRegions });
                    }}
                  >
                    <MaterialIcons
                      name={advancedFilters.regions.includes(region) ? 'check-box' : 'check-box-outline-blank'}
                      size={20}
                      color={advancedFilters.regions.includes(region) ? '#3B82F6' : '#6B7280'}
                    />
                    <Text style={styles.checkboxLabel}>{region}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.resetFiltersButton}
                onPress={resetAdvancedFilters}
              >
                <MaterialIcons name="refresh" size={20} color="#EF4444" />
                <Text style={styles.resetFiltersText}>Reset All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={applyAdvancedFilters}
              >
                <MaterialIcons name="check" size={20} color="#FFF" />
                <Text style={styles.applyFiltersText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Analytics Modal */}
      <Modal
        visible={showAnalyticsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAnalyticsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAnalyticsModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Political Analytics</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="share" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCard}>
                <MaterialIcons name="group" size={32} color="#3B82F6" />
                <Text style={styles.analyticsNumber}>{politicians.length}</Text>
                <Text style={styles.analyticsLabel}>Total Politicians</Text>
              </View>

              <View style={styles.analyticsCard}>
                <MaterialIcons name="verified" size={32} color="#10B981" />
                <Text style={styles.analyticsNumber}>
                  {politicians.filter(p => p.key_achievements.length > 2).length}
                </Text>
                <Text style={styles.analyticsLabel}>High Achievers</Text>
              </View>

              <View style={styles.analyticsCard}>
                <MaterialIcons name="trending-up" size={32} color="#F59E0B" />
                <Text style={styles.analyticsNumber}>
                  {new Set(politicians.map(p => p.party)).size}
                </Text>
                <Text style={styles.analyticsLabel}>Active Parties</Text>
              </View>

              <View style={styles.analyticsCard}>
                <MaterialIcons name="location-on" size={32} color="#8B5CF6" />
                <Text style={styles.analyticsNumber}>
                  {new Set(politicians.map(p => p.constituency)).size}
                </Text>
                <Text style={styles.analyticsLabel}>Constituencies</Text>
              </View>
            </View>

            <View style={styles.analyticsSection}>
              <Text style={styles.analyticsSectionTitle}>Party Distribution</Text>
              <View style={styles.partyChart}>
                {Object.entries(
                  politicians.reduce((acc, p) => {
                    acc[p.party] = (acc[p.party] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([party, count]) => (
                  <View key={party} style={styles.partyChartItem}>
                    <View style={styles.partyChartBar}>
                      <View
                        style={[
                          styles.partyChartFill,
                          { width: `${(count / politicians.length) * 100}%`, backgroundColor: '#3B82F6' }
                        ]}
                      />
                    </View>
                    <Text style={styles.partyChartLabel}>{party} ({count})</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.analyticsSection}>
              <Text style={styles.analyticsSectionTitle}>Recent Activity</Text>
              <Text style={styles.analyticsActivity}>
                • 3 new politicians added this week{'\n'}
                • 12 profile updates in the last month{'\n'}
                • 45 new achievements verified{'\n'}
                • 8 party changes recorded
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal
        visible={showNotificationsModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowNotificationsModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Notification Settings</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="save" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.notificationSection}>
              <Text style={styles.notificationSectionTitle}>Content Notifications</Text>

              <View style={styles.notificationItem}>
                <View style={styles.notificationItemLeft}>
                  <MaterialIcons name="person-add" size={24} color="#3B82F6" />
                  <View style={styles.notificationItemText}>
                    <Text style={styles.notificationItemTitle}>New Politicians</Text>
                    <Text style={styles.notificationItemDescription}>Get notified when new politicians are added</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.notificationToggle, notificationSettings.newPoliticians && styles.notificationToggleOn]}
                  onPress={() => setNotificationSettings(prev => ({ ...prev, newPoliticians: !prev.newPoliticians }))}
                >
                  <View style={[styles.notificationToggleThumb, notificationSettings.newPoliticians && styles.notificationToggleThumbOn]} />
                </TouchableOpacity>
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationItemLeft}>
                  <MaterialIcons name="update" size={24} color="#F59E0B" />
                  <View style={styles.notificationItemText}>
                    <Text style={styles.notificationItemTitle}>Profile Updates</Text>
                    <Text style={styles.notificationItemDescription}>Updates to politician profiles you follow</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.notificationToggle, notificationSettings.profileUpdates && styles.notificationToggleOn]}
                  onPress={() => setNotificationSettings(prev => ({ ...prev, profileUpdates: !prev.profileUpdates }))}
                >
                  <View style={[styles.notificationToggleThumb, notificationSettings.profileUpdates && styles.notificationToggleThumbOn]} />
                </TouchableOpacity>
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationItemLeft}>
                  <MaterialIcons name="swap-horiz" size={24} color="#8B5CF6" />
                  <View style={styles.notificationItemText}>
                    <Text style={styles.notificationItemTitle}>Party Changes</Text>
                    <Text style={styles.notificationItemDescription}>When politicians change party affiliations</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.notificationToggle, notificationSettings.partyChanges && styles.notificationToggleOn]}
                  onPress={() => setNotificationSettings(prev => ({ ...prev, partyChanges: !prev.partyChanges }))}
                >
                  <View style={[styles.notificationToggleThumb, notificationSettings.partyChanges && styles.notificationToggleThumbOn]} />
                </TouchableOpacity>
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationItemLeft}>
                  <MaterialIcons name="stars" size={24} color="#10B981" />
                  <View style={styles.notificationItemText}>
                    <Text style={styles.notificationItemTitle}>New Achievements</Text>
                    <Text style={styles.notificationItemDescription}>New verified achievements added</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.notificationToggle, notificationSettings.achievementUpdates && styles.notificationToggleOn]}
                  onPress={() => setNotificationSettings(prev => ({ ...prev, achievementUpdates: !prev.achievementUpdates }))}
                >
                  <View style={[styles.notificationToggleThumb, notificationSettings.achievementUpdates && styles.notificationToggleThumbOn]} />
                </TouchableOpacity>
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationItemLeft}>
                  <MaterialIcons name="how-to-vote" size={24} color="#EF4444" />
                  <View style={styles.notificationItemText}>
                    <Text style={styles.notificationItemTitle}>Voting Records</Text>
                    <Text style={styles.notificationItemDescription}>New parliamentary voting records</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.notificationToggle, notificationSettings.votingRecords && styles.notificationToggleOn]}
                  onPress={() => setNotificationSettings(prev => ({ ...prev, votingRecords: !prev.votingRecords }))}
                >
                  <View style={[styles.notificationToggleThumb, notificationSettings.votingRecords && styles.notificationToggleThumbOn]} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.notificationSection}>
              <Text style={styles.notificationSectionTitle}>Delivery Methods</Text>

              <View style={styles.notificationItem}>
                <View style={styles.notificationItemLeft}>
                  <MaterialIcons name="email" size={24} color="#3B82F6" />
                  <View style={styles.notificationItemText}>
                    <Text style={styles.notificationItemTitle}>Email Notifications</Text>
                    <Text style={styles.notificationItemDescription}>Receive notifications via email</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.notificationToggle, notificationSettings.emailNotifications && styles.notificationToggleOn]}
                  onPress={() => setNotificationSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                >
                  <View style={[styles.notificationToggleThumb, notificationSettings.emailNotifications && styles.notificationToggleThumbOn]} />
                </TouchableOpacity>
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationItemLeft}>
                  <MaterialIcons name="phone-android" size={24} color="#10B981" />
                  <View style={styles.notificationItemText}>
                    <Text style={styles.notificationItemTitle}>Push Notifications</Text>
                    <Text style={styles.notificationItemDescription}>Mobile push notifications</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.notificationToggle, notificationSettings.pushNotifications && styles.notificationToggleOn]}
                  onPress={() => setNotificationSettings(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                >
                  <View style={[styles.notificationToggleThumb, notificationSettings.pushNotifications && styles.notificationToggleThumbOn]} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.notificationSection}>
              <Text style={styles.notificationSectionTitle}>Frequency & Timing</Text>

              <View style={styles.frequencySelector}>
                <Text style={styles.frequencySelectorTitle}>Notification Frequency</Text>
                <View style={styles.frequencyOptions}>
                  {(['immediate', 'daily', 'weekly', 'monthly'] as const).map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.frequencyOption,
                        notificationSettings.frequency === freq && styles.frequencyOptionSelected
                      ]}
                      onPress={() => setNotificationSettings(prev => ({ ...prev, frequency: freq }))}
                    >
                      <Text style={[
                        styles.frequencyOptionText,
                        notificationSettings.frequency === freq && styles.frequencyOptionTextSelected
                      ]}>
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.quietHoursSection}>
                <View style={styles.quietHoursHeader}>
                  <Text style={styles.quietHoursTitle}>Quiet Hours</Text>
                  <TouchableOpacity
                    style={[styles.notificationToggle, notificationSettings.quietHours.enabled && styles.notificationToggleOn]}
                    onPress={() => setNotificationSettings(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, enabled: !prev.quietHours.enabled }
                    }))}
                  >
                    <View style={[styles.notificationToggleThumb, notificationSettings.quietHours.enabled && styles.notificationToggleThumbOn]} />
                  </TouchableOpacity>
                </View>
                {notificationSettings.quietHours.enabled && (
                  <View style={styles.quietHoursTime}>
                    <Text style={styles.quietHoursTimeText}>
                      {notificationSettings.quietHours.start} - {notificationSettings.quietHours.end}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Advanced Search Modal */}
      <Modal
        visible={showAdvancedSearchModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAdvancedSearchModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAdvancedSearchModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Advanced Search</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="search" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.searchSection}>
              <Text style={styles.searchSectionTitle}>AI-Powered Search</Text>
              <View style={styles.aiSearchContainer}>
                <MaterialIcons name="psychology" size={24} color="#8B5CF6" />
                <Text style={styles.aiSearchText}>
                  Ask questions like "Show me governors from Coast region with 5+ years experience"
                </Text>
              </View>
            </View>

            <View style={styles.searchSection}>
              <Text style={styles.searchSectionTitle}>Recent Searches</Text>
              <View style={styles.recentSearches}>
                <TouchableOpacity style={styles.recentSearchItem}>
                  <MaterialIcons name="history" size={16} color="#6B7280" />
                  <Text style={styles.recentSearchText}>UDA politicians in Nairobi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.recentSearchItem}>
                  <MaterialIcons name="history" size={16} color="#6B7280" />
                  <Text style={styles.recentSearchText}>Senators with law education</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.recentSearchItem}>
                  <MaterialIcons name="history" size={16} color="#6B7280" />
                  <Text style={styles.recentSearchText}>Female MPs Western region</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchSection}>
              <Text style={styles.searchSectionTitle}>Trending Searches</Text>
              <View style={styles.trendingSearches}>
                <TouchableOpacity style={styles.trendingSearchItem}>
                  <MaterialIcons name="trending-up" size={16} color="#F59E0B" />
                  <Text style={styles.trendingSearchText}>Cabinet reshuffle 2024</Text>
                  <Text style={styles.trendingSearchCount}>234 searches</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.trendingSearchItem}>
                  <MaterialIcons name="trending-up" size={16} color="#F59E0B" />
                  <Text style={styles.trendingSearchText}>New governors sworn in</Text>
                  <Text style={styles.trendingSearchCount}>156 searches</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchSection}>
              <Text style={styles.searchSectionTitle}>Smart Suggestions</Text>
              <View style={styles.smartSuggestions}>
                <TouchableOpacity style={styles.smartSuggestionItem}>
                  <MaterialIcons name="lightbulb" size={20} color="#3B82F6" />
                  <Text style={styles.smartSuggestionText}>Find politicians similar to your interests</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smartSuggestionItem}>
                  <MaterialIcons name="lightbulb" size={20} color="#3B82F6" />
                  <Text style={styles.smartSuggestionText}>Discover rising political stars</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smartSuggestionItem}>
                  <MaterialIcons name="lightbulb" size={20} color="#3B82F6" />
                  <Text style={styles.smartSuggestionText}>Politicians active in your area</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Watchlist Management Modal */}
      <Modal
        visible={showWatchlistModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWatchlistModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowWatchlistModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>My Watchlist</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="edit" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.watchlistStats}>
              <View style={styles.watchlistStat}>
                <MaterialIcons name="visibility" size={24} color="#3B82F6" />
                <Text style={styles.watchlistStatNumber}>12</Text>
                <Text style={styles.watchlistStatLabel}>Following</Text>
              </View>
              <View style={styles.watchlistStat}>
                <MaterialIcons name="notifications-active" size={24} color="#10B981" />
                <Text style={styles.watchlistStatNumber}>5</Text>
                <Text style={styles.watchlistStatLabel}>Active Alerts</Text>
              </View>
              <View style={styles.watchlistStat}>
                <MaterialIcons name="update" size={24} color="#F59E0B" />
                <Text style={styles.watchlistStatNumber}>3</Text>
                <Text style={styles.watchlistStatLabel}>Recent Updates</Text>
              </View>
            </View>

            <View style={styles.watchlistSection}>
              <Text style={styles.watchlistSectionTitle}>Recently Active</Text>
              <View style={styles.watchlistItems}>
                {politicians.slice(0, 3).map((politician) => (
                  <View key={politician.id} style={styles.watchlistItem}>
                    <View style={styles.watchlistItemProfile}>
                      <View style={styles.watchlistItemAvatar}>
                        <Text style={styles.watchlistItemAvatarText}>
                          {politician.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.watchlistItemInfo}>
                        <Text style={styles.watchlistItemName}>{politician.name}</Text>
                        <Text style={styles.watchlistItemTitle}>{politician.title}</Text>
                        <Text style={styles.watchlistItemUpdate}>Updated 2 hours ago</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.watchlistItemAction}>
                      <MaterialIcons name="more-vert" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal
        visible={showBulkActionsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBulkActionsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowBulkActionsModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Bulk Actions</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.bulkModalHeader}>
              <MaterialIcons name="group" size={48} color="#3B82F6" />
              <Text style={styles.bulkModalTitle}>
                {selectedPoliticians.length} Politician{selectedPoliticians.length !== 1 ? 's' : ''} Selected
              </Text>
              <Text style={styles.bulkModalSubtitle}>
                Choose an action to perform on the selected politicians
              </Text>
            </View>

            <View style={styles.bulkActionsGrid}>
              <TouchableOpacity
                style={styles.bulkActionCard}
                onPress={() => handleBulkAction('addToWatchlist')}
              >
                <View style={[styles.bulkActionIcon, { backgroundColor: '#10B981' }]}>
                  <MaterialIcons name="visibility" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.bulkActionTitle}>Add to Watchlist</Text>
                <Text style={styles.bulkActionDescription}>
                  Monitor these politicians for updates
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bulkActionCard}
                onPress={() => handleBulkAction('compare')}
              >
                <View style={[styles.bulkActionIcon, { backgroundColor: '#8B5CF6' }]}>
                  <MaterialIcons name="compare" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.bulkActionTitle}>Compare</Text>
                <Text style={styles.bulkActionDescription}>
                  Side-by-side comparison analysis
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bulkActionCard}
                onPress={() => handleBulkAction('export')}
              >
                <View style={[styles.bulkActionIcon, { backgroundColor: '#F59E0B' }]}>
                  <MaterialIcons name="file-download" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.bulkActionTitle}>Export Data</Text>
                <Text style={styles.bulkActionDescription}>
                  Download politician information
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bulkActionCard}
                onPress={() => handleBulkAction('createReport')}
              >
                <View style={[styles.bulkActionIcon, { backgroundColor: '#3B82F6' }]}>
                  <MaterialIcons name="description" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.bulkActionTitle}>Generate Report</Text>
                <Text style={styles.bulkActionDescription}>
                  Create comprehensive analysis
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bulkActionCard}
                onPress={() => handleBulkAction('share')}
              >
                <View style={[styles.bulkActionIcon, { backgroundColor: '#06B6D4' }]}>
                  <MaterialIcons name="share" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.bulkActionTitle}>Share</Text>
                <Text style={styles.bulkActionDescription}>
                  Share politician profiles
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bulkActionCard}
                onPress={() => handleBulkAction('addToGroup')}
              >
                <View style={[styles.bulkActionIcon, { backgroundColor: '#EC4899' }]}>
                  <MaterialIcons name="group-add" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.bulkActionTitle}>Create Group</Text>
                <Text style={styles.bulkActionDescription}>
                  Group politicians for tracking
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bulkActionsWarning}>
              <MaterialIcons name="info" size={20} color="#F59E0B" />
              <Text style={styles.bulkActionsWarningText}>
                Bulk actions will be applied to all selected politicians. This action cannot be undone.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* News Modal */}
      <Modal
        visible={showNewsModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => {
          setShowNewsModal(false);
          setNewsActiveTab('main');
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowNewsModal(false);
                setNewsActiveTab('main');
              }}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Political News</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="filter-list" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* News Tabs */}
          <View style={styles.newsTabsContainer}>
            <TouchableOpacity
              style={[styles.newsTab, newsActiveTab === 'main' && styles.activeNewsTab]}
              onPress={() => setNewsActiveTab('main')}
            >
              <Text style={[styles.newsTabText, newsActiveTab === 'main' && styles.activeNewsTabText]}>
                Main News
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.newsTab, newsActiveTab === 'external1' && styles.activeNewsTab]}
              onPress={() => setNewsActiveTab('external1')}
            >
              <Text style={[styles.newsTabText, newsActiveTab === 'external1' && styles.activeNewsTabText]}>
                The Standard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.newsTab, newsActiveTab === 'external2' && styles.activeNewsTab]}
              onPress={() => setNewsActiveTab('external2')}
            >
              <Text style={[styles.newsTabText, newsActiveTab === 'external2' && styles.activeNewsTabText]}>
                Citizen TV
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {newsActiveTab === 'main' && (
              <>
                <View style={styles.newsHeader}>
                  <MaterialIcons name="newspaper" size={48} color="#3B82F6" />
                  <Text style={styles.newsHeaderTitle}>Latest Political News</Text>
                  <Text style={styles.newsHeaderSubtitle}>
                    Stay updated with the latest political developments and news
                  </Text>
                </View>

                <View style={styles.newsFilters}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['All', 'Breaking', 'Parliament', 'Elections', 'Policy', 'Scandals'].map((filter) => (
                      <TouchableOpacity key={filter} style={styles.newsFilterChip}>
                        <Text style={styles.newsFilterText}>{filter}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.newsList}>
                  {latestNews.map((item, index) => (
                <TouchableOpacity key={item.id} style={styles.newsArticleCard}>
                  <View style={styles.newsArticleHeader}>
                    <View style={[styles.newsCategoryBadge, { backgroundColor: '#3B82F6' }]}>
                      <Text style={styles.newsCategoryText}>Breaking</Text>
                    </View>
                    <Text style={styles.newsArticleTime}>2 hours ago</Text>
                  </View>
                  <Text style={styles.newsArticleTitle}>{item.title}</Text>
                  <Text style={styles.newsArticleSummary} numberOfLines={3}>
                    {item.summary}
                  </Text>
                  {item.politician && (
                    <View style={styles.newsArticlePolitician}>
                      <MaterialIcons name="person" size={16} color="#3B82F6" />
                      <Text style={styles.newsArticlePoliticianName}>
                        Related to: {item.politician}
                      </Text>
                    </View>
                  )}
                  <View style={styles.newsArticleFooter}>
                    <View style={styles.newsArticleSource}>
                      <MaterialIcons name="link" size={14} color="#6B7280" />
                      <Text style={styles.newsArticleSourceText}>Daily Nation</Text>
                    </View>
                    <View style={styles.newsArticleActions}>
                      <TouchableOpacity style={styles.newsActionButton}>
                        <MaterialIcons name="bookmark-border" size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.newsActionButton}>
                        <MaterialIcons name="share" size={16} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {newsActiveTab === 'external1' && (
              <>
                <View style={styles.newsHeader}>
                  <MaterialIcons name="language" size={48} color="#3B82F6" />
                  <Text style={styles.newsHeaderTitle}>The Standard News</Text>
                  <Text style={styles.newsHeaderSubtitle}>
                    Political coverage from The Standard Media Group
                  </Text>
                </View>

                <View style={styles.newsList}>
                  {externalNews1.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.newsArticleCard}
                      onPress={() => item.url && Linking.openURL(item.url)}
                    >
                      <View style={styles.newsArticleHeader}>
                        <View style={[styles.newsCategoryBadge, { backgroundColor: '#DC2626' }]}>
                          <Text style={styles.newsCategoryText}>The Standard</Text>
                        </View>
                        <Text style={styles.newsArticleTime}>{item.timestamp}</Text>
                      </View>
                      <Text style={styles.newsArticleTitle}>{item.title}</Text>
                      <Text style={styles.newsArticleSummary} numberOfLines={3}>
                        {item.summary}
                      </Text>
                      {item.politician && (
                        <View style={styles.newsArticlePolitician}>
                          <MaterialIcons name="person" size={16} color="#3B82F6" />
                          <Text style={styles.newsArticlePoliticianName}>
                            Related to: {item.politician}
                          </Text>
                        </View>
                      )}
                      <View style={styles.newsArticleFooter}>
                        <View style={styles.newsArticleSource}>
                          <MaterialIcons name="link" size={14} color="#6B7280" />
                          <Text style={styles.newsArticleSourceText}>{item.source}</Text>
                        </View>
                        <View style={styles.newsArticleActions}>
                          <TouchableOpacity style={styles.newsActionButton}>
                            <MaterialIcons name="open-in-new" size={16} color="#6B7280" />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.newsActionButton}>
                            <MaterialIcons name="share" size={16} color="#6B7280" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {newsActiveTab === 'external2' && (
              <>
                <View style={styles.newsHeader}>
                  <MaterialIcons name="tv" size={48} color="#3B82F6" />
                  <Text style={styles.newsHeaderTitle}>Citizen TV News</Text>
                  <Text style={styles.newsHeaderSubtitle}>
                    Political coverage from Citizen Television
                  </Text>
                </View>

                <View style={styles.newsList}>
                  {externalNews2.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.newsArticleCard}
                      onPress={() => item.url && Linking.openURL(item.url)}
                    >
                      <View style={styles.newsArticleHeader}>
                        <View style={[styles.newsCategoryBadge, { backgroundColor: '#059669' }]}>
                          <Text style={styles.newsCategoryText}>Citizen TV</Text>
                        </View>
                        <Text style={styles.newsArticleTime}>{item.timestamp}</Text>
                      </View>
                      <Text style={styles.newsArticleTitle}>{item.title}</Text>
                      <Text style={styles.newsArticleSummary} numberOfLines={3}>
                        {item.summary}
                      </Text>
                      {item.politician && (
                        <View style={styles.newsArticlePolitician}>
                          <MaterialIcons name="person" size={16} color="#3B82F6" />
                          <Text style={styles.newsArticlePoliticianName}>
                            Related to: {item.politician}
                          </Text>
                        </View>
                      )}
                      <View style={styles.newsArticleFooter}>
                        <View style={styles.newsArticleSource}>
                          <MaterialIcons name="link" size={14} color="#6B7280" />
                          <Text style={styles.newsArticleSourceText}>{item.source}</Text>
                        </View>
                        <View style={styles.newsArticleActions}>
                          <TouchableOpacity style={styles.newsActionButton}>
                            <MaterialIcons name="open-in-new" size={16} color="#6B7280" />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.newsActionButton}>
                            <MaterialIcons name="share" size={16} color="#6B7280" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Promises Modal */}
      <Modal
        visible={showPromisesModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowPromisesModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPromisesModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Promise Tracker</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="sort" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.promisesHeader}>
              <MaterialIcons name="track-changes" size={48} color="#EF4444" />
              <Text style={styles.promisesHeaderTitle}>Political Promises</Text>
              <Text style={styles.promisesHeaderSubtitle}>
                Track campaign promises and their fulfillment status
              </Text>
            </View>

            <View style={styles.promisesStats}>
              <View style={styles.promiseStatCard}>
                <Text style={styles.promiseStatNumber}>89</Text>
                <Text style={styles.promiseStatLabel}>Total Promises</Text>
                <View style={styles.promiseStatIcon}>
                  <MaterialIcons name="list" size={20} color="#3B82F6" />
                </View>
              </View>
              <View style={styles.promiseStatCard}>
                <Text style={[styles.promiseStatNumber, { color: '#10B981' }]}>34</Text>
                <Text style={styles.promiseStatLabel}>Fulfilled</Text>
                <View style={[styles.promiseStatIcon, { backgroundColor: '#D1FAE5' }]}>
                  <MaterialIcons name="check" size={20} color="#10B981" />
                </View>
              </View>
              <View style={styles.promiseStatCard}>
                <Text style={[styles.promiseStatNumber, { color: '#F59E0B' }]}>28</Text>
                <Text style={styles.promiseStatLabel}>In Progress</Text>
                <View style={[styles.promiseStatIcon, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialIcons name="schedule" size={20} color="#F59E0B" />
                </View>
              </View>
              <View style={styles.promiseStatCard}>
                <Text style={[styles.promiseStatNumber, { color: '#EF4444' }]}>27</Text>
                <Text style={styles.promiseStatLabel}>Broken</Text>
                <View style={[styles.promiseStatIcon, { backgroundColor: '#FEE2E2' }]}>
                  <MaterialIcons name="close" size={20} color="#EF4444" />
                </View>
              </View>
            </View>

            <View style={styles.promisesFilters}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['All', 'Fulfilled', 'In Progress', 'Broken', 'Economy', 'Healthcare', 'Education'].map((filter) => (
                  <TouchableOpacity key={filter} style={styles.promiseFilterChip}>
                    <Text style={styles.promiseFilterText}>{filter}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.promisesList}>
              {[
                {
                  id: 1,
                  title: "Build 1,000 new affordable housing units",
                  politician: "Amason Kingi",
                  status: "in_progress",
                  progress: 65,
                  category: "Housing",
                  deadline: "2025-12-31",
                  description: "Constructing affordable housing units in Kilifi County to address housing shortage."
                },
                {
                  id: 2,
                  title: "Establish free healthcare for children under 12",
                  politician: "William Ruto",
                  status: "fulfilled",
                  progress: 100,
                  category: "Healthcare",
                  deadline: "2024-06-30",
                  description: "Free healthcare program for children launched nationwide."
                },
                {
                  id: 3,
                  title: "Reduce unemployment to 5% by 2025",
                  politician: "Raila Odinga",
                  status: "broken",
                  progress: 20,
                  category: "Economy",
                  deadline: "2025-12-31",
                  description: "Job creation initiative has not met expected targets."
                }
              ].map((promise) => (
                <TouchableOpacity key={promise.id} style={styles.promiseCard}>
                  <View style={styles.promiseCardHeader}>
                    <View style={[
                      styles.promiseStatusBadge,
                      {
                        backgroundColor: promise.status === 'fulfilled' ? '#D1FAE5' :
                                       promise.status === 'in_progress' ? '#FEF3C7' : '#FEE2E2'
                      }
                    ]}>
                      <MaterialIcons
                        name={promise.status === 'fulfilled' ? 'check' :
                              promise.status === 'in_progress' ? 'schedule' : 'close'}
                        size={12}
                        color={promise.status === 'fulfilled' ? '#10B981' :
                               promise.status === 'in_progress' ? '#F59E0B' : '#EF4444'}
                      />
                      <Text style={[
                        styles.promiseStatusText,
                        {
                          color: promise.status === 'fulfilled' ? '#065F46' :
                                promise.status === 'in_progress' ? '#92400E' : '#991B1B'
                        }
                      ]}>
                        {promise.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.promiseCategory}>{promise.category}</Text>
                  </View>
                  <Text style={styles.promiseTitle}>{promise.title}</Text>
                  <Text style={styles.promiseDescription} numberOfLines={2}>
                    {promise.description}
                  </Text>
                  <View style={styles.promiseProgress}>
                    <View style={styles.promiseProgressBar}>
                      <View
                        style={[
                          styles.promiseProgressFill,
                          {
                            width: `${promise.progress}%`,
                            backgroundColor: promise.status === 'fulfilled' ? '#10B981' :
                                           promise.status === 'in_progress' ? '#F59E0B' : '#EF4444'
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.promiseProgressText}>{promise.progress}%</Text>
                  </View>
                  <View style={styles.promiseFooter}>
                    <View style={styles.promisePolitician}>
                      <MaterialIcons name="person" size={14} color="#6B7280" />
                      <Text style={styles.promisePoliticianName}>{promise.politician}</Text>
                    </View>
                    <Text style={styles.promiseDeadline}>Due: {promise.deadline}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Voting Records Modal */}
      <Modal
        visible={showVotingRecordsModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowVotingRecordsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowVotingRecordsModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Voting Records</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="tune" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.votingHeader}>
              <MaterialIcons name="bar-chart" size={48} color="#10B981" />
              <Text style={styles.votingHeaderTitle}>Parliamentary Voting Records</Text>
              <Text style={styles.votingHeaderSubtitle}>
                Track voting patterns and legislative participation
              </Text>
            </View>

            <View style={styles.votingStats}>
              <View style={styles.votingStatCard}>
                <Text style={styles.votingStatNumber}>1,247</Text>
                <Text style={styles.votingStatLabel}>Total Votes</Text>
                <View style={styles.votingStatIcon}>
                  <MaterialIcons name="how-to-vote" size={20} color="#3B82F6" />
                </View>
              </View>
              <View style={styles.votingStatCard}>
                <Text style={[styles.votingStatNumber, { color: '#10B981' }]}>89%</Text>
                <Text style={styles.votingStatLabel}>Attendance</Text>
                <View style={[styles.votingStatIcon, { backgroundColor: '#D1FAE5' }]}>
                  <MaterialIcons name="check-circle" size={20} color="#10B981" />
                </View>
              </View>
              <View style={styles.votingStatCard}>
                <Text style={[styles.votingStatNumber, { color: '#3B82F6' }]}>856</Text>
                <Text style={styles.votingStatLabel}>Yes Votes</Text>
                <View style={[styles.votingStatIcon, { backgroundColor: '#DBEAFE' }]}>
                  <MaterialIcons name="thumb-up" size={20} color="#3B82F6" />
                </View>
              </View>
              <View style={styles.votingStatCard}>
                <Text style={[styles.votingStatNumber, { color: '#EF4444' }]}>234</Text>
                <Text style={styles.votingStatLabel}>No Votes</Text>
                <View style={[styles.votingStatIcon, { backgroundColor: '#FEE2E2' }]}>
                  <MaterialIcons name="thumb-down" size={20} color="#EF4444" />
                </View>
              </View>
            </View>

            <View style={styles.votingFilters}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['All Bills', 'Budget', 'Healthcare', 'Education', 'Infrastructure', 'Security'].map((filter) => (
                  <TouchableOpacity key={filter} style={styles.votingFilterChip}>
                    <Text style={styles.votingFilterText}>{filter}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.votingRecordsList}>
              {[
                {
                  id: 1,
                  billTitle: "Kenya Healthcare Universal Coverage Act 2024",
                  date: "2024-03-15",
                  vote: "yes",
                  category: "Healthcare",
                  description: "Legislation to provide universal healthcare coverage for all Kenyan citizens",
                  votingResult: "Passed",
                  yesVotes: 234,
                  noVotes: 89,
                  abstains: 12
                },
                {
                  id: 2,
                  billTitle: "Education Infrastructure Development Bill",
                  date: "2024-02-28",
                  vote: "no",
                  category: "Education",
                  description: "Funding allocation for school infrastructure improvements nationwide",
                  votingResult: "Failed",
                  yesVotes: 145,
                  noVotes: 187,
                  abstains: 3
                },
                {
                  id: 3,
                  billTitle: "Digital Economy Advancement Act",
                  date: "2024-01-20",
                  vote: "abstain",
                  category: "Technology",
                  description: "Framework for digital transformation and technology adoption",
                  votingResult: "Passed",
                  yesVotes: 198,
                  noVotes: 87,
                  abstains: 50
                }
              ].map((record) => (
                <TouchableOpacity key={record.id} style={styles.votingRecordCard}>
                  <View style={styles.votingRecordHeader}>
                    <View style={[
                      styles.voteStatusBadge,
                      {
                        backgroundColor: record.vote === 'yes' ? '#D1FAE5' :
                                       record.vote === 'no' ? '#FEE2E2' : '#F3F4F6'
                      }
                    ]}>
                      <MaterialIcons
                        name={record.vote === 'yes' ? 'thumb-up' :
                              record.vote === 'no' ? 'thumb-down' : 'remove'}
                        size={12}
                        color={record.vote === 'yes' ? '#10B981' :
                               record.vote === 'no' ? '#EF4444' : '#6B7280'}
                      />
                      <Text style={[
                        styles.voteStatusText,
                        {
                          color: record.vote === 'yes' ? '#065F46' :
                                record.vote === 'no' ? '#991B1B' : '#374151'
                        }
                      ]}>
                        {record.vote.toUpperCase()}
                      </Text>
                    </View>
                    <View style={[
                      styles.billResultBadge,
                      {
                        backgroundColor: record.votingResult === 'Passed' ? '#D1FAE5' : '#FEE2E2'
                      }
                    ]}>
                      <Text style={[
                        styles.billResultText,
                        {
                          color: record.votingResult === 'Passed' ? '#065F46' : '#991B1B'
                        }
                      ]}>
                        {record.votingResult}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.billTitle}>{record.billTitle}</Text>
                  <Text style={styles.billDescription} numberOfLines={2}>
                    {record.description}
                  </Text>
                  <View style={styles.votingBreakdown}>
                    <Text style={styles.votingBreakdownTitle}>Voting Breakdown:</Text>
                    <View style={styles.votingBreakdownStats}>
                      <View style={styles.votingBreakdownItem}>
                        <MaterialIcons name="thumb-up" size={14} color="#10B981" />
                        <Text style={styles.votingBreakdownNumber}>{record.yesVotes}</Text>
                      </View>
                      <View style={styles.votingBreakdownItem}>
                        <MaterialIcons name="thumb-down" size={14} color="#EF4444" />
                        <Text style={styles.votingBreakdownNumber}>{record.noVotes}</Text>
                      </View>
                      <View style={styles.votingBreakdownItem}>
                        <MaterialIcons name="remove" size={14} color="#6B7280" />
                        <Text style={styles.votingBreakdownNumber}>{record.abstains}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.votingRecordFooter}>
                    <View style={styles.billCategory}>
                      <MaterialIcons name="category" size={14} color="#6B7280" />
                      <Text style={styles.billCategoryText}>{record.category}</Text>
                    </View>
                    <Text style={styles.votingDate}>{record.date}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Comparison Modal */}
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
              <MaterialIcons name="add" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.comparisonHeader}>
              <MaterialIcons name="compare" size={48} color="#8B5CF6" />
              <Text style={styles.comparisonHeaderTitle}>Side-by-Side Comparison</Text>
              <Text style={styles.comparisonHeaderSubtitle}>
                Compare politicians' profiles, voting records, and achievements
              </Text>
            </View>

            <View style={styles.comparisonGrid}>
              <View style={styles.comparisonColumn}>
                <View style={styles.politicianComparisonCard}>
                  <View style={styles.comparisonPoliticianHeader}>
                    <View style={styles.comparisonAvatar}>
                      <Text style={styles.comparisonAvatarText}>AK</Text>
                    </View>
                    <Text style={styles.comparisonPoliticianName}>Amason Kingi</Text>
                    <Text style={styles.comparisonPoliticianTitle}>Speaker of Senate</Text>
                    <View style={styles.comparisonPartyBadge}>
                      <Text style={styles.comparisonPartyText}>PAA</Text>
                    </View>
                  </View>

                  <View style={styles.comparisonMetrics}>
                    <View style={styles.comparisonMetric}>
                      <Text style={styles.comparisonMetricLabel}>Experience</Text>
                      <Text style={styles.comparisonMetricValue}>17 years</Text>
                    </View>
                    <View style={styles.comparisonMetric}>
                      <Text style={styles.comparisonMetricLabel}>Attendance</Text>
                      <Text style={styles.comparisonMetricValue}>95%</Text>
                    </View>
                    <View style={styles.comparisonMetric}>
                      <Text style={styles.comparisonMetricLabel}>Bills Passed</Text>
                      <Text style={styles.comparisonMetricValue}>23</Text>
                    </View>
                    <View style={styles.comparisonMetric}>
                      <Text style={styles.comparisonMetricLabel}>Promises Kept</Text>
                      <Text style={styles.comparisonMetricValue}>78%</Text>
                    </View>
                  </View>

                  <View style={styles.comparisonAchievements}>
                    <Text style={styles.comparisonSectionTitle}>Key Achievements</Text>
                    <Text style={styles.comparisonAchievementItem}>• Speaker of Senate 2022-present</Text>
                    <Text style={styles.comparisonAchievementItem}>• Governor Kilifi 2013-2022</Text>
                    <Text style={styles.comparisonAchievementItem}>• MP Kilifi North 2007-2013</Text>
                  </View>
                </View>
              </View>

              <View style={styles.comparisonDivider}>
                <Text style={styles.comparisonVsText}>VS</Text>
              </View>

              <View style={styles.comparisonColumn}>
                <TouchableOpacity style={styles.selectPoliticianCard}>
                  <MaterialIcons name="add-circle" size={48} color="#6B7280" />
                  <Text style={styles.selectPoliticianText}>Select Politician</Text>
                  <Text style={styles.selectPoliticianSubtext}>
                    Choose a politician to compare
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.comparisonTools}>
              <TouchableOpacity style={styles.comparisonToolButton}>
                <MaterialIcons name="analytics" size={24} color="#3B82F6" />
                <Text style={styles.comparisonToolText}>Detailed Analysis</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.comparisonToolButton}>
                <MaterialIcons name="share" size={24} color="#10B981" />
                <Text style={styles.comparisonToolText}>Share Comparison</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.comparisonToolButton}>
                <MaterialIcons name="file-download" size={24} color="#F59E0B" />
                <Text style={styles.comparisonToolText}>Export Report</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.comparisonCategories}>
              <Text style={styles.comparisonSectionTitle}>Comparison Categories</Text>
              <View style={styles.categoryGrid}>
                {[
                  { icon: 'how-to-vote', label: 'Voting Record', color: '#3B82F6' },
                  { icon: 'trending-up', label: 'Performance', color: '#10B981' },
                  { icon: 'school', label: 'Education', color: '#F59E0B' },
                  { icon: 'work', label: 'Experience', color: '#8B5CF6' },
                  { icon: 'favorite', label: 'Public Opinion', color: '#EF4444' },
                  { icon: 'money', label: 'Budget Votes', color: '#06B6D4' }
                ].map((category, index) => (
                  <TouchableOpacity key={index} style={styles.categoryCard}>
                    <MaterialIcons name={category.icon as any} size={24} color={category.color} />
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Export Data Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExportModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowExportModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Export Data</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.exportHeader}>
              <MaterialIcons name="file-download" size={48} color="#F59E0B" />
              <Text style={styles.exportHeaderTitle}>Export Politician Data</Text>
              <Text style={styles.exportHeaderSubtitle}>
                Download comprehensive data in your preferred format
              </Text>
            </View>

            <View style={styles.exportFormats}>
              <Text style={styles.exportSectionTitle}>Choose Format</Text>
              <View style={styles.formatGrid}>
                <TouchableOpacity style={styles.formatCard}>
                  <MaterialIcons name="description" size={32} color="#3B82F6" />
                  <Text style={styles.formatTitle}>PDF Report</Text>
                  <Text style={styles.formatDescription}>Formatted document with charts</Text>
                  <View style={styles.formatBadge}>
                    <Text style={styles.formatBadgeText}>Premium</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.formatCard}>
                  <MaterialIcons name="table-chart" size={32} color="#10B981" />
                  <Text style={styles.formatTitle}>Excel/CSV</Text>
                  <Text style={styles.formatDescription}>Spreadsheet format for analysis</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.formatCard}>
                  <MaterialIcons name="code" size={32} color="#8B5CF6" />
                  <Text style={styles.formatTitle}>JSON Data</Text>
                  <Text style={styles.formatDescription}>Machine-readable format</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.formatCard}>
                  <MaterialIcons name="image" size={32} color="#EF4444" />
                  <Text style={styles.formatTitle}>Image Summary</Text>
                  <Text style={styles.formatDescription}>Visual infographic format</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.exportOptions}>
              <Text style={styles.exportSectionTitle}>Export Options</Text>
              <View style={styles.optionsList}>
                <View style={styles.exportOption}>
                  <MaterialIcons name="check-box" size={20} color="#3B82F6" />
                  <Text style={styles.exportOptionText}>Basic Information</Text>
                  <Text style={styles.exportOptionSubtext}>Name, title, party, constituency</Text>
                </View>
                <View style={styles.exportOption}>
                  <MaterialIcons name="check-box" size={20} color="#3B82F6" />
                  <Text style={styles.exportOptionText}>Voting Records</Text>
                  <Text style={styles.exportOptionSubtext}>Complete parliamentary voting history</Text>
                </View>
                <View style={styles.exportOption}>
                  <MaterialIcons name="check-box" size={20} color="#3B82F6" />
                  <Text style={styles.exportOptionText}>Promise Tracking</Text>
                  <Text style={styles.exportOptionSubtext}>Campaign promises and fulfillment status</Text>
                </View>
                <View style={styles.exportOption}>
                  <MaterialIcons name="check-box" size={20} color="#3B82F6" />
                  <Text style={styles.exportOptionText}>Achievement History</Text>
                  <Text style={styles.exportOptionSubtext}>Career milestones and accomplishments</Text>
                </View>
                <View style={styles.exportOption}>
                  <MaterialIcons name="check-box-outline-blank" size={20} color="#9CA3AF" />
                  <Text style={[styles.exportOptionText, { color: '#9CA3AF' }]}>News & Media Coverage</Text>
                  <Text style={[styles.exportOptionSubtext, { color: '#9CA3AF' }]}>Press coverage and articles (Premium)</Text>
                </View>
              </View>
            </View>

            <View style={styles.exportSettings}>
              <Text style={styles.exportSectionTitle}>Export Settings</Text>
              <View style={styles.settingsList}>
                <View style={styles.exportSetting}>
                  <Text style={styles.settingLabel}>Date Range</Text>
                  <TouchableOpacity style={styles.settingControl}>
                    <Text style={styles.settingValue}>Last 12 months</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <View style={styles.exportSetting}>
                  <Text style={styles.settingLabel}>Include Images</Text>
                  <TouchableOpacity style={styles.settingControl}>
                    <Text style={styles.settingValue}>Yes</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <View style={styles.exportSetting}>
                  <Text style={styles.settingLabel}>Data Privacy</Text>
                  <TouchableOpacity style={styles.settingControl}>
                    <Text style={styles.settingValue}>Public only</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.exportActions}>
              <TouchableOpacity style={styles.previewButton}>
                <MaterialIcons name="preview" size={20} color="#6B7280" />
                <Text style={styles.previewButtonText}>Preview Export</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exportButton}>
                <MaterialIcons name="file-download" size={20} color="#FFFFFF" />
                <Text style={styles.exportButtonText}>Generate Export</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.exportInfo}>
              <MaterialIcons name="info" size={20} color="#3B82F6" />
              <Text style={styles.exportInfoText}>
                Exports include data for {filteredPoliticians.length} politician{filteredPoliticians.length !== 1 ? 's' : ''}.
                Large exports may take a few minutes to generate.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Performance Metrics Modal */}
      <Modal
        visible={showPerformanceModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowPerformanceModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPerformanceModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Performance Metrics</Text>
            <TouchableOpacity style={styles.modalActionButton}>
              <MaterialIcons name="refresh" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.performanceHeader}>
              <MaterialIcons name="analytics" size={48} color="#3B82F6" />
              <Text style={styles.performanceHeaderTitle}>Political Performance Analytics</Text>
              <Text style={styles.performanceHeaderSubtitle}>
                Comprehensive metrics and performance indicators
              </Text>
            </View>

            <View style={styles.metricsOverview}>
              <Text style={styles.metricsSectionTitle}>Overall Performance</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <MaterialIcons name="trending-up" size={32} color="#10B981" />
                  <Text style={styles.metricValue}>87%</Text>
                  <Text style={styles.metricLabel}>Avg Performance</Text>
                  <Text style={styles.metricChange}>+5% this month</Text>
                </View>
                <View style={styles.metricCard}>
                  <MaterialIcons name="people" size={32} color="#3B82F6" />
                  <Text style={styles.metricValue}>156</Text>
                  <Text style={styles.metricLabel}>Active Politicians</Text>
                  <Text style={styles.metricChange}>+12 this quarter</Text>
                </View>
                <View style={styles.metricCard}>
                  <MaterialIcons name="how-to-vote" size={32} color="#8B5CF6" />
                  <Text style={styles.metricValue}>1,247</Text>
                  <Text style={styles.metricLabel}>Total Votes</Text>
                  <Text style={styles.metricChange}>+89 this week</Text>
                </View>
                <View style={styles.metricCard}>
                  <MaterialIcons name="check-circle" size={32} color="#F59E0B" />
                  <Text style={styles.metricValue}>68%</Text>
                  <Text style={styles.metricLabel}>Promise Rate</Text>
                  <Text style={styles.metricChange}>+3% this month</Text>
                </View>
              </View>
            </View>

            <View style={styles.performanceCategories}>
              <Text style={styles.metricsSectionTitle}>Performance by Category</Text>
              <View style={styles.categoryMetrics}>
                <View style={styles.categoryMetric}>
                  <View style={styles.categoryHeader}>
                    <MaterialIcons name="account-balance" size={24} color="#3B82F6" />
                    <Text style={styles.categoryTitle}>Parliamentary Attendance</Text>
                  </View>
                  <View style={styles.categoryProgress}>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBarFill, { width: '89%', backgroundColor: '#10B981' }]} />
                    </View>
                    <Text style={styles.categoryPercentage}>89%</Text>
                  </View>
                  <Text style={styles.categorySubtext}>Above national average (82%)</Text>
                </View>

                <View style={styles.categoryMetric}>
                  <View style={styles.categoryHeader}>
                    <MaterialIcons name="assignment-turned-in" size={24} color="#10B981" />
                    <Text style={styles.categoryTitle}>Bill Success Rate</Text>
                  </View>
                  <View style={styles.categoryProgress}>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBarFill, { width: '76%', backgroundColor: '#3B82F6' }]} />
                    </View>
                    <Text style={styles.categoryPercentage}>76%</Text>
                  </View>
                  <Text style={styles.categorySubtext}>Strong legislative effectiveness</Text>
                </View>

                <View style={styles.categoryMetric}>
                  <View style={styles.categoryHeader}>
                    <MaterialIcons name="groups" size={24} color="#8B5CF6" />
                    <Text style={styles.categoryTitle}>Public Approval</Text>
                  </View>
                  <View style={styles.categoryProgress}>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBarFill, { width: '64%', backgroundColor: '#F59E0B' }]} />
                    </View>
                    <Text style={styles.categoryPercentage}>64%</Text>
                  </View>
                  <Text style={styles.categorySubtext}>Based on recent polling data</Text>
                </View>

                <View style={styles.categoryMetric}>
                  <View style={styles.categoryHeader}>
                    <MaterialIcons name="campaign" size={24} color="#EF4444" />
                    <Text style={styles.categoryTitle}>Promise Fulfillment</Text>
                  </View>
                  <View style={styles.categoryProgress}>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBarFill, { width: '68%', backgroundColor: '#8B5CF6' }]} />
                    </View>
                    <Text style={styles.categoryPercentage}>68%</Text>
                  </View>
                  <Text style={styles.categorySubtext}>Campaign promise delivery rate</Text>
                </View>
              </View>
            </View>

            <View style={styles.topPerformers}>
              <Text style={styles.metricsSectionTitle}>Top Performers</Text>
              <View style={styles.performersList}>
                {[
                  { name: 'Amason Kingi', score: 95, party: 'PAA', change: '+5' },
                  { name: 'William Ruto', score: 92, party: 'UDA', change: '+3' },
                  { name: 'Raila Odinga', score: 89, party: 'ODM', change: '-1' },
                  { name: 'Martha Karua', score: 87, party: 'NARC-K', change: '+7' }
                ].map((performer, index) => (
                  <View key={index} style={styles.performerCard}>
                    <View style={styles.performerRank}>
                      <Text style={styles.performerRankText}>{index + 1}</Text>
                    </View>
                    <View style={styles.performerInfo}>
                      <Text style={styles.performerName}>{performer.name}</Text>
                      <Text style={styles.performerParty}>{performer.party}</Text>
                    </View>
                    <View style={styles.performerMetrics}>
                      <Text style={styles.performerScore}>{performer.score}</Text>
                      <Text style={[
                        styles.performerChange,
                        { color: performer.change.startsWith('+') ? '#10B981' : '#EF4444' }
                      ]}>
                        {performer.change}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.metricsActions}>
              <TouchableOpacity style={styles.metricsActionButton}>
                <MaterialIcons name="download" size={20} color="#3B82F6" />
                <Text style={styles.metricsActionText}>Download Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.metricsActionButton}>
                <MaterialIcons name="share" size={20} color="#10B981" />
                <Text style={styles.metricsActionText}>Share Insights</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.metricsActionButton}>
                <MaterialIcons name="settings" size={20} color="#8B5CF6" />
                <Text style={styles.metricsActionText}>Customize</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  gradientHeaderContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  gradientHeader: {
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 160,
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerEmoji: {
    fontSize: 24,
  },
  enhancedHeaderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  enhancedHeaderSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff4757',
    borderWidth: 2,
    borderColor: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 12,
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  statIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  enhancedSearchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 48,
  },
  clearButton: {
    padding: 8,
    borderRadius: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterChipsContainer: {
    marginBottom: 20,
  },
  filterChipsContent: {
    gap: 12,
    paddingHorizontal: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    minHeight: 48,
  },
  activeFilterChip: {
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterChipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredGradient: {
    padding: 24,
  },
  featuredContent: {
    gap: 20,
  },
  featuredProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featuredAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featuredAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  featuredInfo: {
    flex: 1,
  },
  featuredName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  featuredLocation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  featuredStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  toolCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  politicianCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  enhancedPoliticianCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
    minHeight: 100,
  },
  politicianImageContainer: {
    position: 'relative',
    marginRight: 16,
    width: 80,
    height: '100%',
    minHeight: 100,
  },
  politicianImage: {
    width: 80,
    height: '100%',
    borderRadius: 12,
    elevation: 2,
  },
  politicianImagePlaceholder: {
    width: 80,
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  politicianInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  enhancedPoliticianName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a202c',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  enhancedPoliticianTitle: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '700',
    marginBottom: 2,
  },
  enhancedPoliticianConstituency: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  cardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardBody: {
    marginBottom: 12,
    marginLeft: 96,
  },
  partyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  partyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  partyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  partyHistory: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  achievementTag: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  achievementText: {
    fontSize: 11,
    color: '#0284c7',
    fontWeight: '600',
  },
  moreAchievements: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  moreAchievementsText: {
    fontSize: 10,
    color: '#718096',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginLeft: 96,
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardFooterText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  cardFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewProfileText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '600',
  },
  politicianAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  politicianInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  politicianInfo: {
    flex: 1,
  },
  politicianName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  politicianTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  politicianParty: {
    fontSize: 12,
    color: '#888',
  },
  newsCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  newsSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  newsPolitician: {
    fontSize: 12,
    color: '#3B82F6',
  },

  // Quick Actions Styles
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    aspectRatio: 2.5,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  quickActionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  analyticsAction: {},
  comparisonAction: {},
  favoritesAction: {},
  newsAction: {},

  // Card Action Button Styles
  cardActionButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginRight: 4,
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

  // Share Modal Styles
  shareModalProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 16,
  },
  shareProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareProfileInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  shareProfileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  shareProfileTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
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

  // Quick Info Modal Styles
  quickInfoProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    gap: 16,
  },
  quickInfoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickInfoInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickInfoDetails: {
    flex: 1,
  },
  quickInfoName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  quickInfoTitle: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 4,
  },
  quickInfoLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickInfoSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  quickInfoSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  quickInfoSectionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  quickInfoAchievement: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 4,
  },
  viewFullProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  viewFullProfileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Advanced Filter Button Style
  advancedFilterButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginLeft: 8,
  },

  // Advanced Filter Modal Styles
  filterSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  rangeContainer: {
    marginBottom: 16,
  },
  rangeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  rangeSliders: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rangeValue: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  rangeTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    position: 'relative',
  },
  rangeThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkboxItemSelected: {
    backgroundColor: '#EBF4FF',
    borderColor: '#3B82F6',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  resetFiltersButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  resetFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  applyFiltersButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  applyFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Analytics Modal Styles
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  analyticsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  analyticsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  analyticsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  partyChart: {
    gap: 12,
  },
  partyChartItem: {
    marginBottom: 8,
  },
  partyChartBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  partyChartFill: {
    height: '100%',
    borderRadius: 4,
  },
  partyChartLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  analyticsActivity: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },

  // Notification Settings Modal Styles
  notificationSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  notificationSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notificationItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationItemText: {
    marginLeft: 12,
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  notificationItemDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  notificationToggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    padding: 2,
    justifyContent: 'center',
  },
  notificationToggleOn: {
    backgroundColor: '#3B82F6',
  },
  notificationToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationToggleThumbOn: {
    transform: [{ translateX: 20 }],
  },
  frequencySelector: {
    marginBottom: 20,
  },
  frequencySelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  frequencyOptionSelected: {
    backgroundColor: '#EBF4FF',
    borderColor: '#3B82F6',
  },
  frequencyOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  frequencyOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  quietHoursSection: {
    marginTop: 16,
  },
  quietHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quietHoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  quietHoursTime: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
  },
  quietHoursTimeText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
  },

  // Advanced Search Modal Styles
  searchSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  searchSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  aiSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  aiSearchText: {
    fontSize: 14,
    color: '#6B46C1',
    flex: 1,
    lineHeight: 20,
  },
  recentSearches: {
    gap: 8,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    gap: 8,
  },
  recentSearchText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  trendingSearches: {
    gap: 8,
  },
  trendingSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    gap: 8,
  },
  trendingSearchText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
  },
  trendingSearchCount: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '500',
  },
  smartSuggestions: {
    gap: 8,
  },
  smartSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#EBF4FF',
    borderRadius: 8,
    gap: 12,
  },
  smartSuggestionText: {
    fontSize: 14,
    color: '#1E40AF',
    flex: 1,
  },

  // Watchlist Modal Styles
  watchlistStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  watchlistStat: {
    alignItems: 'center',
    flex: 1,
  },
  watchlistStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  watchlistStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  watchlistSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  watchlistSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  watchlistItems: {
    gap: 12,
  },
  watchlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  watchlistItemProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  watchlistItemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchlistItemAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  watchlistItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  watchlistItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  watchlistItemTitle: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 2,
  },
  watchlistItemUpdate: {
    fontSize: 12,
    color: '#6B7280',
  },
  watchlistItemAction: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },

  // Bulk Actions Styles
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listHeaderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  selectionModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#667eea',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  selectionModeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  selectionModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  selectionModeTextActive: {
    color: '#FFFFFF',
  },
  bulkActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  bulkActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  selectedCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  bulkSelectAll: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  bulkSelectAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  bulkActionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    gap: 6,
  },
  bulkActionsButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  bulkActionsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: '#EBF4FF',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  selectionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCheckboxSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },

  // Bulk Actions Modal Styles
  bulkModalHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
  },
  bulkModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  bulkModalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  bulkActionsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  bulkActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  bulkActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulkActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    flex: 1,
  },
  bulkActionDescription: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  bulkActionsWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    gap: 12,
  },
  bulkActionsWarningText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    flex: 1,
  },

  // News Modal Styles (duplicate newsHeader removed)
  newsTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 4,
    margin: 16,
    borderRadius: 12,
  },
  newsTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeNewsTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeNewsTabText: {
    color: '#3B82F6',
  },
  newsHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  newsHeaderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  newsFilters: {
    marginBottom: 20,
  },
  newsFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 12,
  },
  newsFilterText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  newsList: {
    gap: 16,
  },
  newsArticleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  newsArticleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  newsCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newsCategoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  newsArticleTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  newsArticleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  newsArticleSummary: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  newsArticlePolitician: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  newsArticlePoliticianName: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },
  newsArticleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsArticleSource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newsArticleSourceText: {
    fontSize: 12,
    color: '#6B7280',
  },
  newsArticleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  newsActionButton: {
    padding: 4,
  },

  // Promises Modal Styles
  promisesHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
  },
  promisesHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  promisesHeaderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  promisesStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  promiseStatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    position: 'relative',
  },
  promiseStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  promiseStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  promiseStatIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promisesFilters: {
    marginBottom: 20,
  },
  promiseFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 12,
  },
  promiseFilterText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  promisesList: {
    gap: 16,
  },
  promiseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  promiseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promiseStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  promiseStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  promiseCategory: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  promiseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  promiseDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  promiseProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  promiseProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  promiseProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  promiseProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    minWidth: 35,
  },
  promiseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promisePolitician: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promisePoliticianName: {
    fontSize: 12,
    color: '#6B7280',
  },
  promiseDeadline: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Voting Records Modal Styles
  votingHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
  },
  votingHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  votingHeaderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  votingStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  votingStatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    position: 'relative',
  },
  votingStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  votingStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  votingStatIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  votingFilters: {
    marginBottom: 20,
  },
  votingFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 12,
  },
  votingFilterText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  votingRecordsList: {
    gap: 16,
  },
  votingRecordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  votingRecordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  voteStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  voteStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  billResultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  billResultText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  billDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  votingBreakdown: {
    marginBottom: 16,
  },
  votingBreakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  votingBreakdownStats: {
    flexDirection: 'row',
    gap: 16,
  },
  votingBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  votingBreakdownNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  votingRecordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  billCategoryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  votingDate: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Comparison Modal Styles
  comparisonHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
  },
  comparisonHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  comparisonHeaderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  comparisonGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  comparisonColumn: {
    flex: 1,
  },
  comparisonDivider: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonVsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  politicianComparisonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 400,
  },
  comparisonPoliticianHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  comparisonAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  comparisonAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  comparisonPoliticianName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  comparisonPoliticianTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  comparisonPartyBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comparisonPartyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  comparisonMetrics: {
    gap: 12,
    marginBottom: 20,
  },
  comparisonMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  comparisonMetricLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  comparisonMetricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  comparisonAchievements: {
    gap: 8,
  },
  comparisonSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  comparisonAchievementItem: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  selectPoliticianCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  selectPoliticianText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  selectPoliticianSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  comparisonTools: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  comparisonToolButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  comparisonToolText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  comparisonCategories: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Export Modal Styles
  exportHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
  },
  exportHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  exportHeaderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  exportSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  exportFormats: {
    marginBottom: 24,
  },
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    position: 'relative',
  },
  formatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  formatDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  formatBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  formatBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exportOptions: {
    marginBottom: 24,
  },
  optionsList: {
    gap: 16,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  exportOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  exportOptionSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    flex: 1,
  },
  exportSettings: {
    marginBottom: 24,
  },
  settingsList: {
    gap: 16,
  },
  exportSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  exportActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    gap: 8,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exportInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#EBF4FF',
    borderRadius: 12,
    gap: 12,
  },
  exportInfoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    flex: 1,
  },

  // Performance Modal Styles
  performanceHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
  },
  performanceHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  performanceHeaderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  metricsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  metricsOverview: {
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  performanceCategories: {
    marginBottom: 24,
  },
  categoryMetrics: {
    gap: 20,
  },
  categoryMetric: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    minWidth: 40,
  },
  categorySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  topPerformers: {
    marginBottom: 24,
  },
  performersList: {
    gap: 12,
  },
  performerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  performerRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  performerParty: {
    fontSize: 14,
    color: '#6B7280',
  },
  performerMetrics: {
    alignItems: 'flex-end',
  },
  performerScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  performerChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  metricsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  metricsActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  metricsActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },

  // Placeholder style for modal headers
  placeholder: {
    width: 40,
  },
});