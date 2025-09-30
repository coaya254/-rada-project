import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFavorites } from '../contexts/FavoritesContext';

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

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { favoritePoliticians, removeFromFavorites, clearFavorites, loading } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'position' | 'party' | 'date'>('name');

  const onRefresh = async () => {
    setRefreshing(true);
    // The favorites context will automatically reload
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleRemoveFavorite = (politician: Politician) => {
    Alert.alert(
      'Remove from Favorites',
      `Are you sure you want to remove ${politician.name} from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFromFavorites(politician.id)
        }
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all politicians from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => clearFavorites()
        }
      ]
    );
  };

  const sortedFavorites = [...favoritePoliticians].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'position':
        return a.current_position.localeCompare(b.current_position);
      case 'party':
        const aParty = a.party_history[a.party_history.length - 1] || '';
        const bParty = b.party_history[b.party_history.length - 1] || '';
        return aParty.localeCompare(bParty);
      default:
        return 0;
    }
  });

  const renderPoliticianCard = ({ item }: { item: Politician }) => (
    <TouchableOpacity
      style={styles.politicianCard}
      onPress={() => (navigation as any).navigate('PoliticianDetail', { politician: item })}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
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
          <View style={[
            styles.partyBadge,
            { backgroundColor: item.party_color || '#6b7280' }
          ]}>
            <Text style={styles.partyText}>
              {item.party_history[item.party_history.length - 1]?.split(' ')[0] || 'Independent'}
            </Text>
          </View>
        </View>
        
        <View style={styles.politicianInfo}>
          <Text style={styles.politicianName}>{item.name}</Text>
          <Text style={styles.politicianPosition}>{item.current_position}</Text>
          <Text style={styles.politicianConstituency}>{item.constituency}</Text>
          <Text style={styles.politicianSummary} numberOfLines={2}>
            {item.wikipedia_summary}
          </Text>
          
          <View style={styles.achievementsContainer}>
            {item.key_achievements.slice(0, 2).map((achievement, index) => (
              <Text key={index} style={styles.achievementTag}>
                {achievement}
              </Text>
            ))}
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item)}
        >
          <Ionicons name="heart" size={20} color="#ff4757" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💔</Text>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start adding politicians to your favorites by tapping the heart icon on their profiles
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => (navigation as any).navigate('PoliticalArchiveMain')}
      >
        <Text style={styles.browseButtonText}>Browse Politicians</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSortOptions = () => (
    <View style={styles.sortContainer}>
      <Text style={styles.sortLabel}>Sort by:</Text>
      <View style={styles.sortButtons}>
        {[
          { id: 'name', label: 'Name' },
          { id: 'position', label: 'Position' },
          { id: 'party', label: 'Party' },
        ].map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.sortButton,
              sortBy === option.id && styles.activeSortButton
            ]}
            onPress={() => setSortBy(option.id as any)}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === option.id && styles.activeSortButtonText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>❤️ My Favorites</Text>
          <TouchableOpacity
            onPress={handleClearAll}
            style={styles.clearButton}
            disabled={favoritePoliticians.length === 0}
          >
            <Ionicons name="trash" size={20} color={favoritePoliticians.length === 0 ? '#999' : 'white'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          {favoritePoliticians.length} favorite politician{favoritePoliticians.length !== 1 ? 's' : ''}
        </Text>
      </LinearGradient>

      {favoritePoliticians.length > 0 && renderSortOptions()}

      <FlatList
        data={sortedFavorites}
        renderItem={renderPoliticianCard}
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
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
    flex: 1,
  },
  clearButton: {
    padding: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  sortContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sortButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeSortButton: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: 'white',
  },
  listContainer: {
    padding: 20,
  },
  politicianCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'flex-start',
  },
  politicianImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  politicianImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  politicianImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  politicianInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  partyBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  partyText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  politicianInfo: {
    flex: 1,
  },
  politicianName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  politicianPosition: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  politicianConstituency: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  politicianSummary: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  achievementTag: {
    fontSize: 10,
    color: '#667eea',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  removeButton: {
    padding: 8,
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FavoritesScreen;
