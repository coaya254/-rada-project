import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  TextInput,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PoliticsStackParamList } from '../../navigation/PoliticsStackNavigator';

interface PoliticalArchiveProps {
  navigation: NativeStackNavigationProp<PoliticsStackParamList, 'PoliticalArchive'>;
}

interface Politician {
  id: number;
  name: string;
  title: string;
  party: string;
  constituency: string;
  years: number;
  image_url?: string;
}

export const PoliticalArchive: React.FC<PoliticalArchiveProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [politicians, setPoliticians] = useState<Politician[]>([
    {
      id: 1,
      name: 'Amason Jeffah Kingi',
      title: 'Speaker of the Senate',
      party: 'PAA',
      constituency: 'Kilifi County',
      years: 17,
    },
    {
      id: 2,
      name: 'William Ruto',
      title: 'President of Kenya',
      party: 'UDA',
      constituency: 'Kenya',
      years: 25,
    },
    {
      id: 3,
      name: 'Raila Odinga',
      title: 'Opposition Leader',
      party: 'ODM',
      constituency: 'Nairobi',
      years: 30,
    },
    {
      id: 4,
      name: 'Martha Karua',
      title: 'Azimio Deputy President Candidate',
      party: 'NARC-Kenya',
      constituency: 'Kirinyaga',
      years: 22,
    },
    {
      id: 5,
      name: 'Kalonzo Musyoka',
      title: 'Former Vice President',
      party: 'Wiper',
      constituency: 'Ukambani',
      years: 28,
    },
  ]);

  const filters = [
    { id: 'all', label: 'All Politicians' },
    { id: 'senate', label: 'Senate' },
    { id: 'parliament', label: 'Parliament' },
    { id: 'governors', label: 'Governors' },
    { id: 'cabinet', label: 'Cabinet' },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getFilteredPoliticians = () => {
    let filtered = politicians;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(politician =>
        politician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        politician.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
        politician.constituency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        politician.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(politician => {
        switch (selectedFilter) {
          case 'senate':
            return politician.title.toLowerCase().includes('senate');
          case 'parliament':
            return politician.title.toLowerCase().includes('member') || politician.title.toLowerCase().includes('mp');
          case 'governors':
            return politician.title.toLowerCase().includes('governor');
          case 'cabinet':
            return politician.title.toLowerCase().includes('minister') || politician.title.toLowerCase().includes('president');
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredPoliticians = getFilteredPoliticians();

  const renderPolitician = ({ item }: { item: Politician }) => (
    <TouchableOpacity
      style={styles.politicianCard}
      onPress={() => navigation.navigate('PoliticianDetail', { politician: item })}
    >
      <View style={styles.politicianHeader}>
        <View style={styles.politicianAvatar}>
          <Text style={styles.politicianInitials}>
            {item.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </Text>
        </View>
        <View style={styles.politicianInfo}>
          <Text style={styles.politicianName}>{item.name}</Text>
          <Text style={styles.politicianTitle}>{item.title}</Text>
          <View style={styles.politicianMeta}>
            <Text style={styles.politicianParty}>{item.party}</Text>
            <Text style={styles.politicianConstituency}> • {item.constituency}</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#666" />
      </View>

      <View style={styles.politicianStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.years}</Text>
          <Text style={styles.statLabel}>Years in Office</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>95%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>156</Text>
          <Text style={styles.statLabel}>Votes Cast</Text>
        </View>
      </View>
    </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Political Archive</Text>
          <Text style={styles.headerSubtitle}>Complete database of politicians</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search politicians, parties, or constituencies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
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

      {/* Politicians List */}
      <FlatList
        data={filteredPoliticians}
        renderItem={renderPolitician}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.resultCount}>
              {filteredPoliticians.length} politicians found
            </Text>
          </View>
        }
      />
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
  searchSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  listHeader: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  politicianCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  politicianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  politicianTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  politicianMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  politicianParty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  politicianConstituency: {
    fontSize: 12,
    color: '#888',
  },
  politicianStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
});