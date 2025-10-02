import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Politician } from '../../types';
import adminAPI from '../../services/AdminAPIService';

interface ManagePoliticiansScreenProps {
  navigation: NativeStackNavigationProp<any, 'ManagePoliticians'>;
}

interface PoliticianWithStatus extends Politician {
  status: 'published' | 'draft' | 'pending_review';
  last_updated: string;
  total_timeline_events: number;
  total_commitments: number;
  completion_score: number;
}

export const ManagePoliticiansScreen: React.FC<ManagePoliticiansScreenProps> = ({ navigation }) => {
  const [politicians, setPoliticians] = useState<PoliticianWithStatus[]>([]);
  const [filteredPoliticians, setFilteredPoliticians] = useState<PoliticianWithStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedParty, setSelectedParty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPolitician, setSelectedPolitician] = useState<PoliticianWithStatus | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPoliticians, setSelectedPoliticians] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Load politicians from API
  useEffect(() => {
    loadPoliticians();
  }, []);

  const loadPoliticians = async () => {
    try {
      const response = await adminAPI.searchPoliticians('', { include_drafts: true });

      if (response.success && response.data && response.data.data) {
        const politiciansData: PoliticianWithStatus[] = response.data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          title: p.position || p.title,
          current_position: p.position || p.current_position,
          party: p.party,
          party_history: p.party_history || [],
          constituency: p.constituency || '',
          slug: p.slug || '',
          wikipedia_summary: p.bio || p.wikipedia_summary || '',
          key_achievements: p.key_achievements || [],
          education: p.education || '',
          image_url: p.image_url,
          status: p.is_draft === 1 ? 'draft' : 'published',
          last_updated: p.updated_at || p.created_at,
          total_timeline_events: 0, // TODO: Get from API
          total_commitments: 0, // TODO: Get from API
          completion_score: 0, // TODO: Calculate based on content
        }));

        setPoliticians(politiciansData);
        setFilteredPoliticians(politiciansData);
      }
    } catch (error) {
      console.error('Error loading politicians:', error);
      Alert.alert('Error', 'Failed to load politicians');
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = politicians;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(politician =>
        politician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        politician.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
        politician.constituency.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(politician => politician.status === selectedStatus);
    }

    // Party filter
    if (selectedParty !== 'all') {
      filtered = filtered.filter(politician => politician.party === selectedParty);
    }

    // Sort
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'party':
          return a.party.localeCompare(b.party);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'completion':
          return b.completion_score - a.completion_score;
        case 'updated':
          return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
        default:
          return 0;
      }
    });

    setFilteredPoliticians(filtered);
  }, [politicians, searchQuery, selectedStatus, selectedParty, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return '#10B981';
      case 'draft': return '#F59E0B';
      case 'pending_review': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Published';
      case 'draft': return 'Draft';
      case 'pending_review': return 'Pending Review';
      default: return status;
    }
  };

  const getCompletionColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const handlePoliticianAction = (politician: PoliticianWithStatus, action: string) => {
    setSelectedPolitician(politician);
    setShowActionModal(false);

    switch (action) {
      case 'edit':
        navigation.navigate('EditPolitician', { politicianId: politician.id });
        break;
      case 'timeline':
        navigation.navigate('TimelineEvents', { politicianId: politician.id });
        break;
      case 'commitments':
        navigation.navigate('CommitmentTracking', { politicianId: politician.id });
        break;
      case 'publish':
        Alert.alert('Publish', `Publish ${politician.name}'s profile?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Publish', onPress: () => updatePoliticianStatus(politician.id, 'published') }
        ]);
        break;
      case 'unpublish':
        Alert.alert('Unpublish', `Move ${politician.name}'s profile to draft?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Unpublish', onPress: () => updatePoliticianStatus(politician.id, 'draft') }
        ]);
        break;
      case 'delete':
        Alert.alert('Delete', `Delete ${politician.name}'s profile? This cannot be undone.`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deletePolitician(politician.id) }
        ]);
        break;
    }
  };

  const updatePoliticianStatus = (id: number, status: 'published' | 'draft' | 'pending_review') => {
    setPoliticians(prev => prev.map(p =>
      p.id === id ? { ...p, status, last_updated: new Date().toISOString().split('T')[0] } : p
    ));
  };

  const deletePolitician = (id: number) => {
    setPoliticians(prev => prev.filter(p => p.id !== id));
  };

  const togglePoliticianSelection = (id: number) => {
    setSelectedPoliticians(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const selectAllPoliticians = () => {
    setSelectedPoliticians(filteredPoliticians.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedPoliticians([]);
    setSelectionMode(false);
  };

  const handleBulkAction = (action: string) => {
    const selectedCount = selectedPoliticians.length;

    switch (action) {
      case 'publish':
        Alert.alert(
          'Bulk Publish',
          `Publish ${selectedCount} politicians?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Publish',
              onPress: () => {
                setPoliticians(prev => prev.map(p =>
                  selectedPoliticians.includes(p.id)
                    ? { ...p, status: 'published' as const, last_updated: new Date().toISOString().split('T')[0] }
                    : p
                ));
                clearSelection();
              }
            }
          ]
        );
        break;
      case 'unpublish':
        Alert.alert(
          'Bulk Unpublish',
          `Move ${selectedCount} politicians to draft?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Unpublish',
              onPress: () => {
                setPoliticians(prev => prev.map(p =>
                  selectedPoliticians.includes(p.id)
                    ? { ...p, status: 'draft' as const, last_updated: new Date().toISOString().split('T')[0] }
                    : p
                ));
                clearSelection();
              }
            }
          ]
        );
        break;
      case 'delete':
        Alert.alert(
          'Bulk Delete',
          `Delete ${selectedCount} politicians? This cannot be undone.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                setPoliticians(prev => prev.filter(p => !selectedPoliticians.includes(p.id)));
                clearSelection();
              }
            }
          ]
        );
        break;
      case 'archive':
        Alert.alert(
          'Bulk Archive',
          `Archive ${selectedCount} politicians?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Archive',
              onPress: () => {
                setPoliticians(prev => prev.map(p =>
                  selectedPoliticians.includes(p.id)
                    ? { ...p, status: 'archived' as const, last_updated: new Date().toISOString().split('T')[0] }
                    : p
                ));
                clearSelection();
              }
            }
          ]
        );
        break;
    }
    setShowBulkModal(false);
  };

  const renderPoliticianCard = ({ item }: { item: PoliticianWithStatus }) => {
    const isSelected = selectedPoliticians.includes(item.id);

    return (
    <TouchableOpacity
      style={[
        styles.politicianCard,
        isSelected && styles.politicianCardSelected
      ]}
      onPress={() => {
        if (selectionMode) {
          togglePoliticianSelection(item.id);
        } else {
          setSelectedPolitician(item);
          setShowActionModal(true);
        }
      }}
      onLongPress={() => {
        if (!selectionMode) {
          setSelectionMode(true);
          togglePoliticianSelection(item.id);
        }
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.politicianInfo}>
          <View style={styles.politicianAvatar}>
            <Text style={styles.politicianInitials}>
              {item.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </Text>
          </View>
          <View style={styles.politicianDetails}>
            <Text style={styles.politicianName}>{item.name}</Text>
            <Text style={styles.politicianTitle}>{item.title}</Text>
            <Text style={styles.politicianParty}>{item.party} • {item.constituency}</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          {selectionMode ? (
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && (
                <MaterialIcons name="check" size={16} color="#FFFFFF" />
              )}
            </View>
          ) : (
            <>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => {
                  setSelectedPolitician(item);
                  setShowActionModal(true);
                }}
              >
                <MaterialIcons name="more-vert" size={20} color="#666" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <MaterialIcons name="timeline" size={16} color="#666" />
          <Text style={styles.statText}>{item.total_timeline_events} events</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="assignment-turned-in" size={16} color="#666" />
          <Text style={styles.statText}>{item.total_commitments} commitments</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="check-circle" size={16} color={getCompletionColor(item.completion_score)} />
          <Text style={[styles.statText, { color: getCompletionColor(item.completion_score) }]}>
            {item.completion_score}% complete
          </Text>
        </View>
      </View>

      <Text style={styles.lastUpdated}>Last updated: {item.last_updated}</Text>
    </TouchableOpacity>
    );
  };

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filtersModal}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Filters & Sort</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filtersContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterOptions}>
                {['all', 'published', 'draft', 'pending_review'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      selectedStatus === status && styles.filterOptionActive
                    ]}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedStatus === status && styles.filterOptionTextActive
                    ]}>
                      {status === 'all' ? 'All Status' : getStatusText(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Party</Text>
              <View style={styles.filterOptions}>
                {['all', 'UDA', 'ODM', 'NARC-Kenya', 'Wiper'].map(party => (
                  <TouchableOpacity
                    key={party}
                    style={[
                      styles.filterOption,
                      selectedParty === party && styles.filterOptionActive
                    ]}
                    onPress={() => setSelectedParty(party)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedParty === party && styles.filterOptionTextActive
                    ]}>
                      {party === 'all' ? 'All Parties' : party}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.filterOptions}>
                {[
                  { value: 'name', label: 'Name' },
                  { value: 'party', label: 'Party' },
                  { value: 'status', label: 'Status' },
                  { value: 'completion', label: 'Completion' },
                  { value: 'updated', label: 'Last Updated' },
                ].map(sort => (
                  <TouchableOpacity
                    key={sort.value}
                    style={[
                      styles.filterOption,
                      sortBy === sort.value && styles.filterOptionActive
                    ]}
                    onPress={() => setSortBy(sort.value)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      sortBy === sort.value && styles.filterOptionTextActive
                    ]}>
                      {sort.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderActionModal = () => (
    <Modal
      visible={showActionModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.actionModal}>
          <View style={styles.actionHeader}>
            <Text style={styles.actionTitle}>{selectedPolitician?.name}</Text>
            <TouchableOpacity onPress={() => setShowActionModal(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionList}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handlePoliticianAction(selectedPolitician!, 'edit')}
            >
              <MaterialIcons name="edit" size={20} color="#3B82F6" />
              <Text style={styles.actionText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handlePoliticianAction(selectedPolitician!, 'timeline')}
            >
              <MaterialIcons name="timeline" size={20} color="#8B5CF6" />
              <Text style={styles.actionText}>Manage Timeline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handlePoliticianAction(selectedPolitician!, 'commitments')}
            >
              <MaterialIcons name="assignment-turned-in" size={20} color="#F59E0B" />
              <Text style={styles.actionText}>Track Commitments</Text>
            </TouchableOpacity>

            {selectedPolitician?.status !== 'published' ? (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => handlePoliticianAction(selectedPolitician!, 'publish')}
              >
                <MaterialIcons name="publish" size={20} color="#10B981" />
                <Text style={styles.actionText}>Publish</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => handlePoliticianAction(selectedPolitician!, 'unpublish')}
              >
                <MaterialIcons name="unpublished" size={20} color="#F59E0B" />
                <Text style={styles.actionText}>Unpublish</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionItem, styles.dangerAction]}
              onPress={() => handlePoliticianAction(selectedPolitician!, 'delete')}
            >
              <MaterialIcons name="delete" size={20} color="#EF4444" />
              <Text style={[styles.actionText, styles.dangerText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderBulkModal = () => (
    <Modal
      visible={showBulkModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bulkModal}>
          <View style={styles.bulkHeader}>
            <Text style={styles.bulkTitle}>Bulk Actions</Text>
            <TouchableOpacity onPress={() => setShowBulkModal(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.bulkSubtitle}>
            {selectedPoliticians.length} politicians selected
          </Text>

          <View style={styles.bulkActionList}>
            <TouchableOpacity
              style={styles.bulkActionItem}
              onPress={() => handleBulkAction('publish')}
            >
              <MaterialIcons name="publish" size={20} color="#10B981" />
              <Text style={styles.bulkActionText}>Publish Selected</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bulkActionItem}
              onPress={() => handleBulkAction('unpublish')}
            >
              <MaterialIcons name="unpublished" size={20} color="#F59E0B" />
              <Text style={styles.bulkActionText}>Move to Draft</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bulkActionItem}
              onPress={() => handleBulkAction('archive')}
            >
              <MaterialIcons name="archive" size={20} color="#6B7280" />
              <Text style={styles.bulkActionText}>Archive Selected</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bulkActionItem, styles.dangerAction]}
              onPress={() => handleBulkAction('delete')}
            >
              <MaterialIcons name="delete" size={20} color="#EF4444" />
              <Text style={[styles.bulkActionText, styles.dangerText]}>Delete Selected</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        {selectionMode ? (
          <>
            <TouchableOpacity
              style={styles.backButton}
              onPress={clearSelection}
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {selectedPoliticians.length} selected
            </Text>
            <View style={styles.selectionActions}>
              <TouchableOpacity
                style={styles.selectionButton}
                onPress={selectAllPoliticians}
              >
                <MaterialIcons name="select-all" size={20} color="#3B82F6" />
              </TouchableOpacity>
              {selectedPoliticians.length > 0 && (
                <TouchableOpacity
                  style={styles.selectionButton}
                  onPress={() => setShowBulkModal(true)}
                >
                  <MaterialIcons name="more-horiz" size={20} color="#3B82F6" />
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manage Politicians</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('CreatePolitician')}
            >
              <MaterialIcons name="add" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search politicians..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <MaterialIcons name="filter-list" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Results Summary */}
      <View style={styles.resultsSection}>
        <Text style={styles.resultsText}>
          {filteredPoliticians.length} of {politicians.length} politicians
        </Text>
        {(selectedStatus !== 'all' || selectedParty !== 'all' || searchQuery) && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => {
              setSearchQuery('');
              setSelectedStatus('all');
              setSelectedParty('all');
            }}
          >
            <Text style={styles.clearFiltersText}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Politicians List */}
      <FlatList
        data={filteredPoliticians}
        renderItem={renderPoliticianCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.politiciansList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {renderFiltersModal()}
      {renderActionModal()}
      {renderBulkModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f4ff',
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  politiciansList: {
    flex: 1,
  },
  listContent: {
    padding: 24,
    gap: 16,
  },
  politicianCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  politicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  politicianAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  politicianInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  politicianDetails: {
    flex: 1,
  },
  politicianName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  politicianTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  politicianParty: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 4,
  },
  cardActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filtersModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filtersContent: {
    flex: 1,
    padding: 24,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
  },
  actionModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  actionList: {
    padding: 24,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
  },
  dangerAction: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
  },
  dangerText: {
    color: '#EF4444',
  },
  politicianCardSelected: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    backgroundColor: '#EBF4FF',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  selectionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  bulkModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  bulkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bulkTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bulkSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  bulkActionList: {
    padding: 24,
  },
  bulkActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  bulkActionText: {
    fontSize: 16,
    color: '#333',
  },
});