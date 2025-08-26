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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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

const PoliticalArchiveScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [politicians, setPoliticians] = useState<Politician[]>([]);

  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    // Sample Politicians Data
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
        slug: 'martha-karua'
      }
    ];

    setPoliticians(samplePoliticians);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      loadSampleData();
      setRefreshing(false);
    }, 1000);
  };

  const selectPolitician = (politician: Politician) => {
    // Navigate to politician detail screen instead of modal
    navigation.navigate('PoliticianDetail', { politician });
  };

  const renderPoliticianCard = (politician: Politician) => (
    <TouchableOpacity
      key={politician.id}
      style={styles.politicianCard}
      onPress={() => selectPolitician(politician)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
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
          
          <View style={styles.achievementsContainer}>
            {politician.key_achievements.slice(0, 2).map((achievement, index) => (
              <View key={index} style={styles.achievementTag}>
                <Text style={styles.achievementText}>{achievement}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.cardArrow}>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🏛️ Political Archive</Text>
        <Text style={styles.headerSubtitle}>Kenya's Complete Political Information System</Text>
        <Text style={styles.headerPeriod}>2000-2025</Text>
      </LinearGradient>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Politicians</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>25</Text>
          <Text style={styles.statLabel}>Years</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>100+</Text>
          <Text style={styles.statLabel}>Sources</Text>
        </View>
      </View>

      {/* Politicians List */}
      <FlatList
        data={politicians}
        renderItem={({ item }) => renderPoliticianCard(item)}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#FF6B6B']}
            tintColor="#FF6B6B"
          />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Key Political Figures</Text>
            <Text style={styles.listSubtitle}>
              Comprehensive profiles with multi-source verification and detailed tracking
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏛️</Text>
            <Text style={styles.emptyTitle}>Building Political Archive</Text>
            <Text style={styles.emptySubtitle}>
              We're compiling comprehensive political profiles with verified sources
            </Text>
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
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
    opacity: 0.9,
  },
  headerPeriod: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  politicianCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  politicianImageContainer: {
    marginRight: 16,
  },
  politicianImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  politicianImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  politicianInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  politicianInfo: {
    flex: 1,
  },
  politicianName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  politicianPosition: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
    marginBottom: 4,
  },
  politicianConstituency: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  achievementTag: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  achievementText: {
    fontSize: 10,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  cardArrow: {
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
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
});

export default PoliticalArchiveScreen;
