import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import adminAPI from '../../services/AdminAPIService';

interface PoliticianSelectorScreenProps {
  navigation: NativeStackNavigationProp<any, 'PoliticianSelector'>;
  route: {
    params: {
      targetScreen: string;
      title: string;
      allowViewAll?: boolean;
    };
  };
}

interface Politician {
  id: number;
  name: string;
  current_position?: string;
  party?: string;
  image_url?: string;
}

export const PoliticianSelectorScreen: React.FC<PoliticianSelectorScreenProps> = ({ navigation, route }) => {
  const { targetScreen, title, allowViewAll = true } = route.params;
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [filteredPoliticians, setFilteredPoliticians] = useState<Politician[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPoliticians();
  }, []);

  useEffect(() => {
    filterPoliticians();
  }, [politicians, searchQuery]);

  const loadPoliticians = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.searchPoliticians('', { include_drafts: true });
      if (response.success && response.data) {
        setPoliticians(response.data);
      }
    } catch (error) {
      console.error('Error loading politicians:', error);
      Alert.alert('Error', 'Failed to load politicians');
    } finally {
      setLoading(false);
    }
  };

  const filterPoliticians = () => {
    if (!searchQuery.trim()) {
      setFilteredPoliticians(politicians);
      return;
    }

    const filtered = politicians.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.party?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.current_position?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPoliticians(filtered);
  };

  const handleSelectPolitician = (politician: Politician) => {
    navigation.navigate(targetScreen, { politicianId: politician.id });
  };

  const handleViewAll = () => {
    navigation.navigate(targetScreen);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>Choose a politician to manage</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, party, or position..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {allowViewAll && (
          <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
            <MaterialIcons name="list" size={20} color="#FFFFFF" />
            <Text style={styles.viewAllText}>View All Records</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading politicians...</Text>
          </View>
        ) : filteredPoliticians.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="person-off" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Politicians Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search term' : 'No politicians available'}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.politiciansList} showsVerticalScrollIndicator={false}>
            <Text style={styles.resultsCount}>
              {filteredPoliticians.length} {filteredPoliticians.length === 1 ? 'politician' : 'politicians'} found
            </Text>
            {filteredPoliticians.map((politician) => (
              <TouchableOpacity
                key={politician.id}
                style={styles.politicianCard}
                onPress={() => handleSelectPolitician(politician)}
                activeOpacity={0.7}
              >
                <View style={styles.politicianAvatar}>
                  <MaterialIcons name="person" size={32} color="#667eea" />
                </View>
                <View style={styles.politicianInfo}>
                  <Text style={styles.politicianName}>{politician.name}</Text>
                  <View style={styles.politicianMeta}>
                    {politician.party && (
                      <View style={styles.metaItem}>
                        <MaterialIcons name="group" size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{politician.party}</Text>
                      </View>
                    )}
                    {politician.current_position && (
                      <View style={styles.metaItem}>
                        <MaterialIcons name="work" size={14} color="#6B7280" />
                        <Text style={styles.metaText} numberOfLines={1}>
                          {politician.current_position}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
            <View style={styles.bottomPadding} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  politiciansList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 16,
    fontWeight: '500',
  },
  politicianCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  politicianAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  politicianInfo: {
    flex: 1,
  },
  politicianName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  politicianMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
});
