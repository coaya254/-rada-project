import React, { useState, useEffect, useRef } from 'react';
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
  TextInput,
  Modal,
  Vibration,
  Animated} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import ShareButton from '../components/ShareButton';
import DataSyncService from '../services/DataSyncService';
import PoliticianAPIService from '../services/PoliticianAPIService';

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
        party_color?: string;
  slug: string;
}

const PoliticalArchiveScreen: React.FC = () => {
  const navigation = useNavigation();
  const { favoritePoliticians, toggleFavorite, isFavorite } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [filteredPoliticians, setFilteredPoliticians] = useState<Politician[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState({ lastSync: '', pendingChanges: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    initializeDataSync();
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true}),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true}),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true})]).start();
  }, []);

  useEffect(() => {
    loadPoliticiansData();
  }, [currentPage, selectedFilter, sortBy]);

  useEffect(() => {
    filterAndSortPoliticians();
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedFilter, sortBy, politicians]);

  const filterAndSortPoliticians = () => {
    if (!politicians || !Array.isArray(politicians)) {
      setFilteredPoliticians([]);
      return;
    }
    let filtered = [...politicians];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(politician => 
        politician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        politician.current_position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        politician.constituency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        politician.party_history.some((party: string) => party.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(politician => {
        switch (selectedFilter) {
          case 'president':
            return politician.current_position.toLowerCase().includes('president');
          case 'deputy':
            return politician.current_position.toLowerCase().includes('deputy') || 
                   politician.current_position.toLowerCase().includes('vice');
          case 'mp':
            return politician.current_position.toLowerCase().includes('mp') ||
                   politician.constituency !== 'N/A';
          case 'governor':
            return politician.current_position.toLowerCase().includes('governor');
          case 'senator':
            return politician.current_position.toLowerCase().includes('senator') ||
                   politician.current_position.toLowerCase().includes('speaker');
          case 'uda':
            return politician.party_history.some((party: string) => party.includes('UDA'));
          case 'odm':
            return politician.party_history.some((party: string) => party.includes('ODM'));
          case 'female':
            return ['Martha Karua', 'Charity Ngilu', 'Anne Waiguru'].includes(politician.name);
          case 'high_performance':
            return politician.key_achievements.length >= 3;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'party':
          const aParty = a.party_history[a.party_history.length - 1] || '';
          const bParty = b.party_history[b.party_history.length - 1] || '';
          return aParty.localeCompare(bParty);
        case 'constituency':
          return a.constituency.localeCompare(b.constituency);
        case 'achievements':
          return b.key_achievements.length - a.key_achievements.length;
        default:
          return 0;
      }
    });

    setFilteredPoliticians(filtered);
  };

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPoliticians.slice(0, endIndex);
  };

  const loadMoreData = () => {
    if (isLoadingMore) return;
    
    const totalPages = Math.ceil(filteredPoliticians.length / itemsPerPage);
    if (currentPage < totalPages) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setCurrentPage((prev: number) => prev + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  };

  const hasMoreData = () => {
    const totalPages = Math.ceil(filteredPoliticians.length / itemsPerPage);
    return currentPage < totalPages;
  };

  const initializeDataSync = async () => {
    try {
      await DataSyncService.initialize();
      const status = DataSyncService.getSyncStatus();
      setIsOnline(status.isOnline);
      setSyncStatus({
        lastSync: status.lastSync,
        pendingChanges: status.pendingChanges});
    } catch (error) {
      console.error('Error initializing data sync:', error);
      setError('Failed to initialize data synchronization');
    }
  };

  const loadPoliticiansData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For now, always use sample data since API is not available
      loadSampleData();
      
      // Update sync status
      const status = DataSyncService.getSyncStatus();
      setSyncStatus({
        lastSync: status.lastSync,
        pendingChanges: status.pendingChanges});
      
    } catch (error) {
      console.error('Error loading politicians data:', error);
      setError('Failed to load politicians data');
      
      // Fallback to sample data if API fails
      loadSampleData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setCurrentPage(1);
      await DataSyncService.forceRefresh();
      await loadPoliticiansData();
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      setCurrentPage((prev: number) => prev + 1);
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadSampleData = () => {
    // Enhanced Sample Politicians Data
    const samplePoliticians: Politician[] = [
      {
        id: 1,
        name: 'William Ruto',
        current_position: '5th President of Kenya',
        party_history: ['KANU (2002-2007)', 'ODM (2007-2012)', 'URP/Jubilee (2013-2021)', 'UDA (2022-present)'],
        constituency: 'Sugoi (historical)',
        wikipedia_summary: 'William Samoei Ruto is the 5th President of Kenya, serving since 2022. He previously served as Deputy President from 2013 to 2022.',
        key_achievements: ['Deputy President 2013-2022', 'President 2022-present', 'Bottom-up Economic Transformation'],
        education: 'University of Nairobi (BSc), University of Queensland (PhD)',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/William_Ruto_2022.jpg/400px-William_Ruto_2022.jpg',
        party_color: '#1e40af',
        slug: 'william-ruto'
      },
      {
        id: 2,
        name: 'Raila Odinga',
        current_position: 'Former Prime Minister',
        party_history: ['KANU (1990s)', 'NARC (2002-2005)', 'ODM (2005-present)'],
        constituency: 'Langata (historical)',
        wikipedia_summary: 'Raila Amollo Odinga is a Kenyan politician who served as Prime Minister from 2008 to 2013.',
        key_achievements: ['Prime Minister 2008-2013', 'Opposition Leader', 'AU High Representative'],
        education: 'University of Leipzig (MSc)',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Raila_Odinga_2017.jpg/400px-Raila_Odinga_2017.jpg',
        party_color: '#f97316',
        slug: 'raila-odinga'
      },
      {
        id: 3,
        name: 'Martha Karua',
        current_position: 'Former MP, Gichugu',
        party_history: ['KANU (1990s)', 'NARC (2002-2005)', 'NARC-Kenya (2005-2013)', 'Independent'],
        constituency: 'Gichugu',
        wikipedia_summary: 'Martha Wangari Karua is a Kenyan lawyer and politician who served as MP for Gichugu from 1993 to 2013.',
        key_achievements: ['Minister for Justice', 'Presidential Candidate 2013', 'Constitutional Lawyer'],
        education: 'University of Nairobi (LLB)',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Martha_Karua_2013.jpg/400px-Martha_Karua_2013.jpg',
        party_color: '#dc2626',
        slug: 'martha-karua'
      },
      {
        id: 4,
        name: 'Uhuru Kenyatta',
        current_position: 'Former President of Kenya',
        party_history: ['KANU (2002-2012)', 'TNA (2012-2016)', 'Jubilee (2016-2022)'],
        constituency: 'Gatundu South (historical)',
        wikipedia_summary: 'Uhuru Muigai Kenyatta served as the 4th President of Kenya from 2013 to 2022.',
        key_achievements: ['President 2013-2022', 'Deputy Prime Minister 2008-2013', 'Minister for Finance'],
        education: 'Amherst College (BA)',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Uhuru_Kenyatta_2019.jpg/400px-Uhuru_Kenyatta_2019.jpg',
        party_color: '#059669',
        slug: 'uhuru-kenyatta'
      },
      {
        id: 5,
        name: 'Kalonzo Musyoka',
        current_position: 'Former Vice President',
        party_history: ['KANU (1980s-2002)', 'NARC (2002-2005)', 'ODM-K (2005-2012)', 'Wiper (2012-present)'],
        constituency: 'Mwingi North',
        wikipedia_summary: 'Stephen Kalonzo Musyoka served as Vice President of Kenya from 2008 to 2013.',
        key_achievements: ['Vice President 2008-2013', 'Foreign Affairs Minister', 'Wiper Party Leader'],
        education: 'University of Nairobi (LLB)',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Kalonzo_Musyoka_2017.jpg/400px-Kalonzo_Musyoka_2017.jpg',
        party_color: '#7c3aed',
        slug: 'kalonzo-musyoka'
      },
      {
        id: 6,
        name: 'Musalia Mudavadi',
        current_position: 'Prime Cabinet Secretary',
        party_history: ['KANU (1980s-2002)', 'NARC (2002-2005)', 'ODM (2005-2012)', 'ANC (2012-present)', 'UDA (2022-present)'],
        constituency: 'Sabatia (historical)',
        wikipedia_summary: 'Wycliffe Musalia Mudavadi is the current Prime Cabinet Secretary of Kenya.',
        key_achievements: ['Prime Cabinet Secretary 2022-present', 'Deputy Prime Minister 2008-2012', 'Vice President 2002-2003'],
        education: 'University of Nairobi (BSc)',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Musalia_Mudavadi_2022.jpg/400px-Musalia_Mudavadi_2022.jpg',
        party_color: '#1e40af',
        slug: 'musalia-mudavadi'
      },
      {
        id: 7,
        name: 'Charity Ngilu',
        current_position: 'Former Governor, Kitui',
        party_history: ['KANU (1990s-2002)', 'NARC (2002-2005)', 'NARC-Kenya (2005-2013)', 'Wiper (2013-2017)', 'NARC-Kenya (2017-present)'],
        constituency: 'Kitui Central (historical)',
        wikipedia_summary: 'Charity Kaluki Ngilu is a Kenyan politician who served as Governor of Kitui County from 2013 to 2017.',
        key_achievements: ['Governor Kitui 2013-2017', 'Minister for Water', 'Presidential Candidate 1997'],
        education: 'University of Nairobi (BSc)',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Charity_Ngilu_2017.jpg/400px-Charity_Ngilu_2017.jpg',
        party_color: '#7c3aed',
        slug: 'charity-ngilu'
      },
      {
        id: 8,
        name: 'Peter Kenneth',
        current_position: 'Former MP, Gatanga',
        party_history: ['KANU (1990s-2002)', 'NARC (2002-2005)', 'PNU (2007-2013)', 'Independent'],
        constituency: 'Gatanga (historical)',
        wikipedia_summary: 'Peter Gakuo Kenneth is a Kenyan politician who served as MP for Gatanga from 2002 to 2013.',
        key_achievements: ['MP Gatanga 2002-2013', 'Assistant Minister for Planning', 'Presidential Candidate 2013'],
        education: 'University of Nairobi (BSc)',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Peter_Kenneth_2013.jpg/400px-Peter_Kenneth_2013.jpg',
        party_color: '#059669',
        slug: 'peter-kenneth'
      },
      {
        id: 9,
        name: 'Eugene Wamalwa',
        current_position: 'Former Cabinet Secretary',
        party_history: ['ODM (2007-2012)', 'UDF (2012-2016)', 'Jubilee (2016-2022)', 'UDA (2022-present)'],
        constituency: 'Saboti (historical)',
        wikipedia_summary: 'Eugene Ludovic Wamalwa is a Kenyan politician and lawyer.',
        key_achievements: ['Cabinet Secretary for Devolution', 'MP Saboti 2013-2017', 'Minister for Water'],
        education: 'University of Nairobi (LLB)',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Eugene_Wamalwa_2022.jpg/400px-Eugene_Wamalwa_2022.jpg',
        party_color: '#1e40af',
        slug: 'eugene-wamalwa'
      },
      {
        id: 10,
        name: 'Amason Kingi',
        current_position: 'Speaker of the Senate',
        party_history: ['ODM (2007-2012)', 'UDF (2012-2016)', 'Jubilee (2016-2022)', 'UDA (2022-present)'],
        constituency: 'Kilifi North (historical)',
        wikipedia_summary: 'Amason Jeffah Kingi is the current Speaker of the Senate of Kenya.',
        key_achievements: ['Speaker of Senate 2022-present', 'Governor Kilifi 2013-2022', 'MP Kilifi North 2007-2013'],
        education: 'University of Nairobi (LLB)',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Amason_Kingi_2022.jpg/400px-Amason_Kingi_2022.jpg',
        party_color: '#1e40af',
        slug: 'amason-kingi'
      },
      {
        id: 11,
        name: 'Kivutha Kibwana',
        current_position: 'Former Governor, Makueni',
        party_history: ['KANU (1990s-2002)', 'NARC (2002-2005)', 'ODM (2005-2012)', 'Wiper (2012-2017)', 'Independent'],
        constituency: 'Makueni (historical)',
        wikipedia_summary: 'Kivutha Kibwana served as Governor of Makueni County from 2013 to 2022.',
        key_achievements: ['Governor Makueni 2013-2022', 'Minister for Environment', 'Constitutional Expert'],
        education: 'University of Nairobi (LLB), Harvard University (LLM)',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Kivutha_Kibwana_2017.jpg/400px-Kivutha_Kibwana_2017.jpg',
        party_color: '#7c3aed',
        slug: 'kivutha-kibwana'
      },
      {
        id: 12,
        name: 'Anne Waiguru',
        current_position: 'Governor, Kirinyaga',
        party_history: ['Jubilee (2013-2022)', 'UDA (2022-present)'],
        constituency: 'Kirinyaga County',
        wikipedia_summary: 'Anne Mumbi Waiguru is the current Governor of Kirinyaga County.',
        key_achievements: ['Governor Kirinyaga 2017-present', 'Cabinet Secretary for Devolution', 'Anti-Corruption Champion'],
        education: 'University of Nairobi (BSc), University of London (MSc)',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Anne_Waiguru_2022.jpg/400px-Anne_Waiguru_2022.jpg',
        party_color: '#1e40af',
        slug: 'anne-waiguru'
      },
      {
        id: 13,
        name: 'Mike Sonko',
        current_position: 'Former Governor, Nairobi',
        party_history: ['KANU (2000s)', 'TNA (2012-2016)', 'Jubilee (2016-2020)', 'Independent'],
        constituency: 'Makadara (historical)',
        wikipedia_summary: 'Mike Mbuvi Sonko served as Governor of Nairobi County from 2017 to 2020.',
        key_achievements: ['Governor Nairobi 2017-2020', 'MP Makadara 2010-2017', 'Senator Nairobi 2013-2017'],
        education: 'Self-educated',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mike_Sonko_2017.jpg/400px-Mike_Sonko_2017.jpg',
        party_color: '#059669',
        slug: 'mike-sonko'
      },
      {
        id: 14,
        name: 'Hassan Joho',
        current_position: 'Former Governor, Mombasa',
        party_history: ['KANU (1990s-2002)', 'NARC (2002-2005)', 'ODM (2005-present)'],
        constituency: 'Kisauni (historical)',
        wikipedia_summary: 'Hassan Ali Joho served as Governor of Mombasa County from 2013 to 2022.',
        key_achievements: ['Governor Mombasa 2013-2022', 'MP Kisauni 2007-2013', 'ODM Deputy Party Leader'],
        education: 'University of Nairobi (BSc)',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Hassan_Joho_2017.jpg/400px-Hassan_Joho_2017.jpg',
        party_color: '#f97316',
        slug: 'hassan-joho'
      },
      {
        id: 15,
        name: 'Wycliffe Oparanya',
        current_position: 'Former Governor, Kakamega',
        party_history: ['KANU (1990s-2002)', 'NARC (2002-2005)', 'ODM (2005-present)'],
        constituency: 'Butere (historical)',
        wikipedia_summary: 'Wycliffe Ambetsa Oparanya served as Governor of Kakamega County from 2013 to 2022.',
        key_achievements: ['Governor Kakamega 2013-2022', 'Minister for Planning', 'ODM Deputy Party Leader'],
        education: 'University of Nairobi (BSc)',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Wycliffe_Oparanya_2017.jpg/400px-Wycliffe_Oparanya_2017.jpg',
        party_color: '#f97316',
        slug: 'wycliffe-oparanya'
      }
    ];

    setPoliticians(samplePoliticians);
    setFilteredPoliticians(samplePoliticians);
  };

  const onRefresh = async () => {
    Vibration.vibrate(50); // Light haptic feedback
    await handleRefresh();
  };

  const selectPolitician = (politician: Politician) => {
    // Navigate to politician detail screen instead of modal
    (navigation as any).navigate('PoliticianDetail', { politician });
  };

  const renderSkeletonCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonInfo}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '70%' }]} />
          <View style={[styles.skeletonLine, { width: '50%' }]} />
        </View>
      </View>
      <View style={styles.skeletonBody}>
        <View style={styles.skeletonBadge} />
        <View style={styles.skeletonTags}>
          <View style={styles.skeletonTag} />
          <View style={styles.skeletonTag} />
        </View>
      </View>
    </View>
  );

  const renderPoliticianCard = (politician: Politician) => (
    <TouchableOpacity
      key={politician.id}
      style={styles.politicianCard}
      onPress={() => selectPolitician(politician)}
      activeOpacity={0.8}
    >
      {/* Card Header with Image and Basic Info */}
      <View style={styles.cardHeader}>
        <View style={styles.politicianImageContainer}>
          {politician.image_url ? (
            <Image 
              source={{ uri: politician.image_url }} 
              style={styles.politicianImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[
              styles.politicianImagePlaceholder,
              { backgroundColor: politician.party_color || '#6b7280' }
            ]}>
              <Text style={styles.politicianInitial}>{politician.name.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.onlineIndicator} />
        </View>
        
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.politicianName}>{politician.name}</Text>
          <Text style={styles.politicianPosition}>{politician.current_position}</Text>
          <Text style={styles.politicianConstituency}>{politician.constituency}</Text>
        </View>
        
        <View style={styles.cardHeaderActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Vibration.vibrate(30); // Light haptic feedback
              toggleFavorite(politician);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <LinearGradient 
              colors={isFavorite(politician.id) ? ['#ff4757', '#ff6b7a'] : ['#f1f5f9', '#e2e8f0']} 
              style={styles.actionButtonGradient}
            >
              <Ionicons 
                name={isFavorite(politician.id) ? "heart" : "heart-outline"} 
                size={18} 
                color={isFavorite(politician.id) ? "#fff" : "#999"} 
              />
            </LinearGradient>
          </TouchableOpacity>
          
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
            iconSize={16}
            showText={false}
            style={styles.shareButton}
          />
        </View>
      </View>
      
      {/* Party Badge and Key Info */}
      <View style={styles.cardBody}>
        <View style={styles.partyInfo}>
          <View style={[
            styles.partyBadge,
            { backgroundColor: politician.party_color || '#6b7280' }
          ]}>
            <Text style={styles.partyText}>
              {politician.party_history[politician.party_history.length - 1]?.split(' ')[0] || 'Independent'}
            </Text>
          </View>
          <Text style={styles.partyHistory}>
            {politician.party_history.length} party{politician.party_history.length !== 1 ? 'ies' : ''}
          </Text>
        </View>
        
        {/* Key Achievements */}
          <View style={styles.achievementsContainer}>
            {politician.key_achievements.slice(0, 2).map((achievement, index) => (
              <View key={index} style={styles.achievementTag}>
                <Text style={styles.achievementText}>{achievement}</Text>
              </View>
            ))}
          {politician.key_achievements.length > 2 && (
            <TouchableOpacity style={styles.moreAchievements}>
              <Text style={styles.moreAchievementsText}>
                +{politician.key_achievements.length - 2} more
              </Text>
            </TouchableOpacity>
          )}
          </View>
        </View>
        
      {/* Card Footer with Education and Navigation */}
      <View style={styles.cardFooter}>
        <View style={styles.cardFooterLeft}>
          <Ionicons name="school-outline" size={14} color="#666" />
          <Text style={styles.cardFooterText}>
            {politician.education ? 'Educated' : 'Self-taught'}
          </Text>
        </View>
        <View style={styles.cardFooterRight}>
          <Text style={styles.viewProfileText}>View Profile</Text>
          <Ionicons name="chevron-forward" size={14} color="#667eea" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={getPaginatedData()}
        renderItem={({ item }: { item: Politician }) => renderPoliticianCard(item)}
        keyExtractor={(item: Politician) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View>
            {/* Vibrant Animated Header */}
            <Animated.View 
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
      <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
              >
                <View style={styles.headerTop}>
                  <View style={styles.headerLeft}>
                    <Animated.View 
                      style={[
                        styles.emojiContainer,
                        { transform: [{ scale: scaleAnim }] }
                      ]}
                    >
                      <Text style={styles.headerEmoji}>🏛️</Text>
                    </Animated.View>
                    <View>
                      <Text style={styles.headerTitle}>Political Archive</Text>
                      <Text style={styles.headerSubtitle}>Kenya's Political Database</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.headerActionButton}>
                    <Ionicons name="notifications-outline" size={20} color="#fff" />
                    <View style={styles.notificationBadge} />
                  </TouchableOpacity>
                </View>
                
                {/* Animated Stats */}
                <Animated.View 
                  style={[
                    styles.statsRow,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }]
                    }
                  ]}
                >
        <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.statIconGradient}>
                        <Ionicons name="people" size={16} color="#fff" />
                      </LinearGradient>
                    </View>
                    <Text style={styles.statNumber}>{politicians.length}</Text>
          <Text style={styles.statLabel}>Politicians</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <LinearGradient colors={['#ffecd2', '#fcb69f']} style={styles.statIconGradient}>
                        <Ionicons name="time" size={16} color="#fff" />
                      </LinearGradient>
                    </View>
          <Text style={styles.statNumber}>25</Text>
          <Text style={styles.statLabel}>Years</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <LinearGradient colors={['#a8edea', '#fed6e3']} style={styles.statIconGradient}>
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      </LinearGradient>
                    </View>
          <Text style={styles.statNumber}>100+</Text>
          <Text style={styles.statLabel}>Sources</Text>
        </View>
                </Animated.View>
              </LinearGradient>
            </Animated.View>

            {/* Enhanced Search Section */}
            <Animated.View 
              style={[
                styles.searchSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Search Bar with Voice Search */}
              <View style={styles.searchContainer}>
                <LinearGradient
                  colors={['#f8fafc', '#e2e8f0']}
                  style={styles.searchBar}
                >
                  <Ionicons name="search" size={20} color="#667eea" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search politicians, parties, positions..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity 
                      style={styles.clearButton}
                      onPress={() => setSearchQuery('')}
                    >
                      <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </LinearGradient>
                
                <TouchableOpacity 
                  style={[styles.filterButton, showFilters && styles.filterButtonActive]}
                  onPress={() => {
                    Vibration.vibrate(30);
                    setShowFilters(!showFilters);
                  }}
                >
                  <Ionicons name="options-outline" size={20} color={showFilters ? "#fff" : "#667eea"} />
                </TouchableOpacity>
              </View>
              
              {/* Animated Filter Chips */}
              {showFilters && (
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                  }}
                >
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterChipsContainer}
                    contentContainerStyle={styles.filterChipsContent}
                  >
                    {[
                      { id: 'all', label: 'All', icon: '👥', color: '#667eea' },
                      { id: 'president', label: 'Presidents', icon: '👑', color: '#f59e0b' },
                      { id: 'mp', label: 'MPs', icon: '🏛️', color: '#10b981' },
                      { id: 'governor', label: 'Governors', icon: '🏢', color: '#8b5cf6' },
                      { id: 'uda', label: 'UDA', icon: '🔵', color: '#3b82f6' },
                      { id: 'odm', label: 'ODM', icon: '🟠', color: '#f97316' },
                      { id: 'female', label: 'Women', icon: '👩', color: '#ec4899' }].map((filter) => (
                      <TouchableOpacity
                        key={filter.id}
                        style={[
                          styles.filterChip,
                          selectedFilter === filter.id && {
                            ...styles.activeFilterChip,
                            backgroundColor: filter.color,
                            borderColor: filter.color}
                        ]}
                        onPress={() => {
                          Vibration.vibrate(20);
                          setSelectedFilter(filter.id);
                        }}
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
                </Animated.View>
              )}
              
              {/* Animated Quick Actions Grid */}
              <Animated.View 
                style={[
                  styles.quickActionsGrid,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <TouchableOpacity 
                  style={[styles.quickAction, styles.analyticsAction]}
                  onPress={() => {
                    Vibration.vibrate(30);
                    (navigation as any).navigate('PoliticalAnalytics');
                  }}
                >
                  <LinearGradient
                    colors={['#4ECDC4', '#44A08D']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="analytics" size={18} color="#fff" />
                    <Text style={styles.quickActionTextWhite}>Analytics</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.quickAction, styles.comparisonAction]}
                  onPress={() => {
                    Vibration.vibrate(30);
                    (navigation as any).navigate('PoliticianComparison');
                  }}
                >
                  <LinearGradient
                    colors={['#f59e0b', '#f97316']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="git-compare" size={18} color="#fff" />
                    <Text style={styles.quickActionTextWhite}>Compare</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.quickAction, styles.favoritesAction]}
                  onPress={() => {
                    Vibration.vibrate(30);
                    (navigation as any).navigate('Favorites');
                  }}
                >
                  <LinearGradient
                    colors={['#ff4757', '#ff3742']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="heart" size={18} color="#fff" />
                    <Text style={styles.quickActionTextWhite}>Favorites</Text>
                    {favoritePoliticians.length > 0 && (
                      <View style={styles.quickActionBadge}>
                        <Text style={styles.quickActionBadgeText}>{favoritePoliticians.length}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.quickAction, styles.newsAction]}
                  onPress={() => {
                    Vibration.vibrate(30);
                    (navigation as any).navigate('NewsAggregation');
                  }}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#1d4ed8']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="newspaper" size={18} color="#fff" />
                    <Text style={styles.quickActionTextWhite}>News</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>

            {/* Enhanced List Header */}
          <View style={styles.listHeader}>
              <View style={styles.listHeaderTop}>
                <Text style={styles.listTitle}>
                  {filteredPoliticians.length} Political Figure{filteredPoliticians.length !== 1 ? 's' : ''}
                </Text>
                <TouchableOpacity style={styles.sortButton}>
                  <Ionicons name="swap-vertical" size={16} color="#667eea" />
                  <Text style={styles.sortButtonText}>Sort</Text>
                </TouchableOpacity>
              </View>
            <Text style={styles.listSubtitle}>
                {searchQuery ? `Results for "${searchQuery}"` : 'Comprehensive profiles with multi-source verification'}
            </Text>
              
              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.quickStatItem}>
                  <Ionicons name="people" size={14} color="#4ECDC4" />
                  <Text style={styles.quickStatText}>{politicians.length} Total</Text>
                </View>
                <View style={styles.quickStatItem}>
                  <Ionicons name="heart" size={14} color="#ff4757" />
                  <Text style={styles.quickStatText}>{favoritePoliticians.length} Favorites</Text>
                </View>
                <View style={styles.quickStatItem}>
                  <Ionicons name="time" size={14} color="#f59e0b" />
                  <Text style={styles.quickStatText}>Updated today</Text>
                </View>
              </View>
            </View>
          </View>
        }
        ListFooterComponent={() => (
          hasMoreData() ? (
            <View style={styles.loadingContainer}>
              {isLoadingMore ? (
                <View style={styles.loadingSpinner}>
                  <Text style={styles.loadingText}>Loading more politicians...</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.loadMoreButton}
                  onPress={loadMoreData}
                >
                  <Text style={styles.loadMoreText}>Load More Politicians</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No politicians found' : 'No politicians available'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? `Try adjusting your search or filters`
                : 'Check back later for updates to the political archive'
              }
            </Text>
            {searchQuery ? (
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                }}
              >
                <Ionicons name="close-circle" size={16} color="#667eea" />
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={onRefresh}
              >
                <Ionicons name="refresh" size={16} color="#667eea" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'},
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20},
  headerGradient: {
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'},
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16},
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1},
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'},
  headerEmoji: {
    fontSize: 24},
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
    letterSpacing: -0.3},
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500'},
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'},
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff4757',
    borderWidth: 2,
    borderColor: '#fff'},
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)'},
  statItem: {
    alignItems: 'center',
    flex: 1},
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 12},
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
    overflow: 'hidden'},
  statIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14},
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.5},
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8},
  searchSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'},
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12},
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
    minHeight: 48},
  searchIcon: {
    marginRight: 12},
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#1a202c',
    paddingVertical: 16,
    fontWeight: '500'},
  clearButton: {
    padding: 8,
    borderRadius: 16},
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center'},
  filterButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea'},
  filterChipsContainer: {
    marginBottom: 20},
  filterChipsContent: {
    gap: 12,
    paddingHorizontal: 4},
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    minHeight: 48},
  activeFilterChip: {
    borderWidth: 2,
    elevation: 4},
  filterChipIcon: {
    fontSize: 16,
    marginRight: 8},
  filterChipText: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '600'},
  activeFilterChipText: {
    color: '#fff',
    fontWeight: '700'},
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap'},
  quickAction: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 0,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
    flex: 1,
    maxWidth: '22%',
    overflow: 'hidden'},
  quickActionText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
    marginTop: 4},
  quickActionGradient: {
    flex: 1,
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 76},
  quickActionTextWhite: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center'},
  analyticsAction: {
    borderColor: '#4ECDC4'},
  comparisonAction: {
    borderColor: '#f59e0b'},
  favoritesAction: {
    borderColor: '#ff4757'},
  newsAction: {
    borderColor: '#3b82f6'},
  commitmentsAction: {
    borderColor: '#059669'},
  quickActionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'},
  quickActionBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'},
  listContainer: {
    paddingBottom: 16},
  listHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'},
  listHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12},
  listTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a202c',
    letterSpacing: -0.3},
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#667eea'},
  sortButtonText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '600',
    marginLeft: 6},
  listSubtitle: {
    fontSize: 15,
    color: '#718096',
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '500'},
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'},
  quickStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8},
  quickStatText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '600'},
  politicianCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2},
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
    minHeight: 120},
  politicianImageContainer: {
    position: 'relative',
    marginRight: 16,
    width: 100,
    height: '100%',
    minHeight: 120},
  politicianImage: {
    width: 100,
    height: '100%',
    borderRadius: 16,
    borderWidth: 0,
    borderColor: '#fff',
    elevation: 4},
  politicianImagePlaceholder: {
    width: 100,
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: '#fff',
    elevation: 4},
  politicianInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff'},
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#fff'},
  cardHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8},
  politicianName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a202c',
    marginBottom: 2,
    letterSpacing: -0.2},
  politicianPosition: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '700',
    marginBottom: 2},
  politicianConstituency: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500'},
  cardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8},
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden'},
  actionButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18},
  cardBody: {
    marginBottom: 12,
    marginLeft: 116, // Move content to the right of the image
  },
  partyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8},
  partyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'},
  partyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center'},
  partyHistory: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500'},
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6},
  achievementTag: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe'},
  achievementText: {
    fontSize: 11,
    color: '#0284c7',
    fontWeight: '600'},
  moreAchievements: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'},
  moreAchievementsText: {
    fontSize: 10,
    color: '#718096',
    fontWeight: '500'},
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginLeft: 116, // Move content to the right of the image
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6},
  cardFooterText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500'},
  cardFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6},
  viewProfileText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '600'},
  shareButton: {
    padding: 6,
    borderRadius: 12},
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40},
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15},
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 8,
    textAlign: 'center'},
  emptySubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20},
  clearSearchButton: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 15},
  clearSearchText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'},
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10},
  sortLabel: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600',
    marginRight: 10},
  sortChip: {
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'},
  activeSortChip: {
    backgroundColor: '#667eea',
    borderColor: '#667eea'},
  sortChipText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500'},
  activeSortChipText: {
    color: '#fff'},
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center'},
  loadingSpinner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15},
  loadingText: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 10},
  loadMoreButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#667eea'},
  loadMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'},
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0'},
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8},
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'},
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'},
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12},
  skeletonImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e2e8f0',
    marginRight: 12},
  skeletonInfo: {
    flex: 1,
    gap: 8},
  skeletonLine: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    width: '100%'},
  skeletonBody: {
    gap: 8},
  skeletonBadge: {
    width: 80,
    height: 24,
    backgroundColor: '#e2e8f0',
    borderRadius: 12},
  skeletonTags: {
    flexDirection: 'row',
    gap: 8},
  skeletonTag: {
    width: 60,
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 10}});

export default PoliticalArchiveScreen;
