import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PoliticsStackParamList } from '../../navigation/PoliticsStackNavigator';
import { VotingRecord, Politician } from '../../types/politician';
import adminAPI from '../../services/AdminAPIService';

const { width } = Dimensions.get('window');

type VotingRecordsScreenRouteProp = RouteProp<PoliticsStackParamList, 'VotingRecords'>;
type VotingRecordsScreenNavigationProp = StackNavigationProp<PoliticsStackParamList, 'VotingRecords'>;

interface Props {
  route: VotingRecordsScreenRouteProp;
  navigation: VotingRecordsScreenNavigationProp;
}

type VoteValue = 'for' | 'against' | 'abstain' | 'absent';
type BillCategory = 'Constitutional' | 'Economic' | 'Social' | 'Security' | 'Infrastructure' | 'Healthcare' | 'Education' | 'Environment' | 'Justice' | 'Other';

interface VotingRecordForm {
  id?: number;
  bill_title: string;
  bill_number: string;
  bill_description: string;
  vote_date: string;
  category: BillCategory;
  vote_value: VoteValue;
  reasoning?: string;
  bill_status: 'Proposed' | 'Under Review' | 'Passed' | 'Rejected' | 'Withdrawn';
  bill_passed?: boolean;
  vote_count_for: number;
  vote_count_against: number;
  vote_count_abstain: number;
  total_votes: number;
  session_name: string;
  source_links: string[];
  verification_links: string[];
  hansard_reference?: string;
  politician_ids: number[];
}

export const VotingRecordsScreen: React.FC<Props> = ({ route, navigation }) => {
  const [votingRecords, setVotingRecords] = useState<VotingRecord[]>([]);
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VotingRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BillCategory | 'All'>('All');
  const [selectedVote, setSelectedVote] = useState<VoteValue | 'All'>('All');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6B7280');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customCategoryColors, setCustomCategoryColors] = useState<Record<string, string>>({});
  const [politician, setPolitician] = useState<any>(null);

  const [formData, setFormData] = useState<VotingRecordForm>({
    bill_title: '',
    bill_number: '',
    bill_description: '',
    vote_date: new Date().toISOString().split('T')[0],
    category: 'Other',
    vote_value: 'for',
    reasoning: '',
    bill_status: 'Proposed',
    bill_passed: false,
    vote_count_for: 0,
    vote_count_against: 0,
    vote_count_abstain: 0,
    total_votes: 0,
    session_name: '',
    source_links: [''],
    verification_links: [''],
    hansard_reference: '',
    politician_ids: [],
  });

  const [showVerificationLinks, setShowVerificationLinks] = useState(false);

  const baseCategories: BillCategory[] = [
    'Constitutional', 'Economic', 'Social', 'Security', 'Infrastructure',
    'Healthcare', 'Education', 'Environment', 'Justice', 'Other'
  ];

  const allCategories = [...baseCategories, ...customCategories];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Constitutional': '#8B5CF6',
      'Economic': '#10B981',
      'Social': '#3B82F6',
      'Security': '#EF4444',
      'Infrastructure': '#F59E0B',
      'Healthcare': '#EC4899',
      'Education': '#6366F1',
      'Environment': '#059669',
      'Justice': '#DC2626',
      'Other': '#6B7280',
    };
    return customCategoryColors[category] || colors[category] || '#6B7280';
  };

  const loadCustomCategories = async () => {
    try {
      const response = await adminAPI.getCustomCategories();
      if (response.success && response.data) {
        const categories = response.data;
        const names = categories.map((c: any) => c.name);
        const colors: Record<string, string> = {};
        categories.forEach((c: any) => {
          colors[c.name] = c.color;
        });
        setCustomCategories(names);
        setCustomCategoryColors(colors);
      }
    } catch (error) {
      console.error('Error loading custom categories:', error);
    }
  };

  const addCustomCategory = async () => {
    if (newCategoryName.trim() && !allCategories.includes(newCategoryName.trim())) {
      try {
        const response = await adminAPI.createCustomCategory({
          name: newCategoryName.trim(),
          color: selectedColor
        });

        if (response.success) {
          setCustomCategories([...customCategories, newCategoryName.trim()]);
          setCustomCategoryColors({ ...customCategoryColors, [newCategoryName.trim()]: selectedColor });
          setFormData(prev => ({ ...prev, category: newCategoryName.trim() as BillCategory }));
          setNewCategoryName('');
          setSelectedColor('#6B7280');
          setShowAddCategoryModal(false);
        } else {
          Alert.alert('Error', response.error || 'Failed to create custom category');
        }
      } catch (error) {
        console.error('Error creating custom category:', error);
        Alert.alert('Error', 'Failed to create custom category');
      }
    }
  };

  const voteOptions: VoteValue[] = ['for', 'against', 'abstain', 'absent'];

  useEffect(() => {
    loadVotingRecords();
    loadPoliticians();
    loadCustomCategories();
  }, []);

  useEffect(() => {
    const politicianId = route.params?.politicianId;
    if (politicianId) {
      loadPoliticianDetails(politicianId);
    }
  }, [route.params?.politicianId]);

  const loadPoliticianDetails = async (politicianId: number) => {
    try {
      const response = await adminAPI.getPolitician(politicianId);
      if (response.success && response.data) {
        setPolitician(response.data);
      }
    } catch (error) {
      console.error('Error loading politician:', error);
    }
  };

  const loadVotingRecords = async () => {
    try {
      const politicianId = route.params?.politicianId;
      const response = await adminAPI.getVotingRecords(
        politicianId ? { politicianId } : undefined
      );

      if (response.success && response.data) {
        setVotingRecords(response.data);

        // Extract custom categories from existing records
        const allCategoriesFromRecords = response.data.map((r: VotingRecord) => r.category);
        const uniqueCategories = [...new Set(allCategoriesFromRecords)];
        const customCats = uniqueCategories.filter(cat => !baseCategories.includes(cat as BillCategory));

        if (customCats.length > 0) {
          setCustomCategories(customCats);
        }
      } else {
        console.error('Failed to load voting records:', response.error);
        Alert.alert('Error', 'Failed to load voting records');
      }
    } catch (error) {
      console.error('Error loading voting records:', error);
      Alert.alert('Error', 'Failed to load voting records');
    }
  };

  const loadPoliticians = async () => {
    try {
      const response = await adminAPI.searchPoliticians('', { include_drafts: true });
      if (response.success && response.data) {
        setPoliticians(response.data);
      }
    } catch (error) {
      console.error('Error loading politicians:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      bill_title: '',
      bill_number: '',
      bill_description: '',
      vote_date: new Date().toISOString().split('T')[0],
      category: 'Other',
      vote_value: 'for',
      reasoning: '',
      bill_status: 'Proposed',
      bill_passed: false,
      vote_count_for: 0,
      vote_count_against: 0,
      vote_count_abstain: 0,
      total_votes: 0,
      session_name: '',
      source_links: [''],
      verification_links: [''],
      hansard_reference: '',
      politician_ids: [],
    });
    setEditingRecord(null);
  };

  const handleSave = async () => {
    if (!formData.bill_title.trim() || !formData.bill_number.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const politicianId = route.params?.politicianId || formData.politician_ids[0];
      if (!politicianId) {
        Alert.alert('Error', 'Politician ID is required');
        return;
      }

      // Ensure date is in YYYY-MM-DD format
      const voteDate = formData.vote_date.includes('T')
        ? formData.vote_date.split('T')[0]
        : formData.vote_date;

      const recordData = {
        politician_id: politicianId,
        bill_title: formData.bill_title,
        bill_number: formData.bill_number,
        bill_description: formData.bill_description,
        vote_date: voteDate,
        category: formData.category,
        vote_value: formData.vote_value,
        reasoning: formData.reasoning,
        bill_status: formData.bill_status,
        bill_passed: formData.bill_passed,
        vote_count_for: formData.vote_count_for,
        vote_count_against: formData.vote_count_against,
        vote_count_abstain: formData.vote_count_abstain,
        total_votes: formData.total_votes,
        session_name: formData.session_name,
        source_links: formData.source_links.filter(link => link.trim() !== ''),
        verification_links: formData.verification_links.filter(link => link.trim() !== ''),
        hansard_reference: formData.hansard_reference,
      };

      if (editingRecord) {
        const response = await adminAPI.updateVotingRecord(editingRecord.id, recordData);
        if (response.success) {
          Alert.alert('Success', 'Voting record updated successfully');
          await loadVotingRecords();
        } else {
          Alert.alert('Error', response.error || 'Failed to update voting record');
        }
      } else {
        const response = await adminAPI.createVotingRecord(recordData);
        if (response.success) {
          Alert.alert('Success', 'Voting record created successfully');
          await loadVotingRecords();
        } else {
          Alert.alert('Error', response.error || 'Failed to create voting record');
        }
      }

      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error saving voting record:', error);
      Alert.alert('Error', 'Failed to save voting record');
    }
  };

  const handleEdit = (record: VotingRecord) => {
    setFormData({
      ...record,
      reasoning: record.reasoning || '',
      hansard_reference: record.hansard_reference || '',
      source_links: record.source_links || [''],
      verification_links: record.verification_links || [''],
      politician_ids: [record.politician_id],
    });
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleDelete = (recordId: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this voting record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await adminAPI.deleteVotingRecord(recordId);
              if (response.success) {
                Alert.alert('Success', 'Voting record deleted successfully');
                await loadVotingRecords();
              } else {
                Alert.alert('Error', response.error || 'Failed to delete voting record');
              }
            } catch (error) {
              console.error('Error deleting voting record:', error);
              Alert.alert('Error', 'Failed to delete voting record');
            }
          },
        },
      ]
    );
  };

  const addSourceLink = () => {
    setFormData(prev => ({
      ...prev,
      source_links: [...prev.source_links, '']
    }));
  };

  const updateSourceLink = (index: number, value: string) => {
    const newLinks = [...formData.source_links];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, source_links: newLinks }));
  };

  const removeSourceLink = (index: number) => {
    if (formData.source_links.length > 1) {
      const newLinks = formData.source_links.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, source_links: newLinks }));
    }
  };

  const addVerificationLink = () => {
    setFormData(prev => ({
      ...prev,
      verification_links: [...prev.verification_links, '']
    }));
  };

  const updateVerificationLink = (index: number, value: string) => {
    const newLinks = [...formData.verification_links];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, verification_links: newLinks }));
  };

  const removeVerificationLink = (index: number) => {
    if (formData.verification_links.length > 1) {
      const newLinks = formData.verification_links.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, verification_links: newLinks }));
    }
  };

  const filteredRecords = votingRecords.filter(record => {
    const matchesSearch = record.bill_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.bill_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || record.category === selectedCategory;
    const matchesVote = selectedVote === 'All' || record.vote_value === selectedVote;

    return matchesSearch && matchesCategory && matchesVote;
  });

  const getVoteColor = (vote: VoteValue) => {
    switch (vote) {
      case 'for': return '#22C55E';
      case 'against': return '#EF4444';
      case 'abstain': return '#F59E0B';
      case 'absent': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getVoteIcon = (vote: VoteValue) => {
    switch (vote) {
      case 'for': return 'thumbs-up';
      case 'against': return 'thumbs-down';
      case 'abstain': return 'hand-left';
      case 'absent': return 'remove-circle';
      default: return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voting Records Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Politician Banner */}
      {politician && (
        <View style={styles.politicianBanner}>
          <View style={styles.politicianInfo}>
            <Ionicons name="person" size={20} color="#EF4444" />
            <View style={{ flex: 1 }}>
              <Text style={styles.politicianName}>{politician.name}</Text>
              <Text style={styles.politicianPosition}>{politician.current_position || 'Politician'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.changePoliticianButton}
            onPress={() => navigation.navigate('PoliticianSelector', {
              targetScreen: 'VotingRecordsAdmin',
              title: 'Voting Records',
              allowViewAll: true,
            })}
          >
            <Text style={styles.changePoliticianText}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.controls}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bills..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, selectedCategory === 'All' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('All')}
          >
            <Text style={[styles.filterChipText, selectedCategory === 'All' && styles.filterChipTextActive]}>
              All Categories
            </Text>
          </TouchableOpacity>
          {allCategories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
                selectedCategory === category && {
                  backgroundColor: getCategoryColor(category),
                  borderColor: getCategoryColor(category)
                }
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === category && styles.filterChipTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {filteredRecords.map(record => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <View style={styles.recordTitleContainer}>
                <Text style={styles.recordTitle}>{record.bill_title}</Text>
                <Text style={styles.recordBillNumber}>{record.bill_number}</Text>
              </View>
              <View style={styles.recordActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEdit(record)}
                >
                  <Ionicons name="create" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(record.id)}
                >
                  <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.recordDetails}>
              <View style={styles.voteContainer}>
                <Ionicons
                  name={getVoteIcon(record.vote_value)}
                  size={20}
                  color={getVoteColor(record.vote_value)}
                />
                <Text style={[styles.voteText, { color: getVoteColor(record.vote_value) }]}>
                  {record.vote_value.toUpperCase()}
                </Text>
              </View>

              <View style={styles.categoryContainer}>
                <View style={[
                  styles.categoryBadge,
                  {
                    backgroundColor: getCategoryColor(record.category) + '15',
                    borderColor: getCategoryColor(record.category)
                  }
                ]}>
                  <Text style={[
                    styles.categoryText,
                    { color: getCategoryColor(record.category) }
                  ]}>
                    {record.category}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.recordDescription} numberOfLines={2}>
              {record.bill_description}
            </Text>

            <View style={styles.recordMeta}>
              <Text style={styles.metaText}>
                <Ionicons name="calendar" size={14} color="#6B7280" /> {record.vote_date}
              </Text>
              <Text style={styles.metaText}>
                <Ionicons name="people" size={14} color="#6B7280" /> {record.total_votes} votes
              </Text>
            </View>

            {record.reasoning && (
              <View style={styles.reasoningContainer}>
                <Text style={styles.reasoningLabel}>Reasoning:</Text>
                <Text style={styles.reasoningText}>{record.reasoning}</Text>
              </View>
            )}
          </View>
        ))}

        {filteredRecords.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No voting records found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || selectedCategory !== 'All' || selectedVote !== 'All'
                ? 'Try adjusting your filters'
                : 'Add your first voting record'}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingRecord ? 'Edit Voting Record' : 'Add Voting Record'}
            </Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSave}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Bill Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bill Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.bill_title}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, bill_title: text }))}
                  placeholder="Enter bill title"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bill Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.bill_number}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, bill_number: text }))}
                  placeholder="e.g., H.R. 2024-15"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.bill_description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, bill_description: text }))}
                  placeholder="Brief description of the bill"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <TouchableOpacity
                    style={styles.addCategoryButton}
                    onPress={() => setShowAddCategoryModal(true)}
                  >
                    <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.addCategoryText}>Custom</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {allCategories.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        {
                          borderColor: getCategoryColor(category),
                          backgroundColor: formData.category === category
                            ? getCategoryColor(category)
                            : getCategoryColor(category) + '10'
                        }
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, category }))}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        {
                          color: formData.category === category
                            ? '#FFFFFF'
                            : getCategoryColor(category)
                        }
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Vote Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vote Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.vote_date}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, vote_date: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vote</Text>
                <View style={styles.voteOptions}>
                  {voteOptions.map(vote => (
                    <TouchableOpacity
                      key={vote}
                      style={[
                        styles.voteOption,
                        formData.vote_value === vote && styles.voteOptionActive,
                        { borderColor: getVoteColor(vote) }
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, vote_value: vote }))}
                    >
                      <Ionicons
                        name={getVoteIcon(vote)}
                        size={20}
                        color={formData.vote_value === vote ? '#FFFFFF' : getVoteColor(vote)}
                      />
                      <Text style={[
                        styles.voteOptionText,
                        formData.vote_value === vote && styles.voteOptionTextActive
                      ]}>
                        {vote.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reasoning</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.reasoning}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, reasoning: text }))}
                  placeholder="Explain the reasoning behind this vote"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bill Result</Text>
                <View style={styles.billResultContainer}>
                  <TouchableOpacity
                    style={[
                      styles.billResultOption,
                      formData.bill_passed === true && styles.billResultOptionActive,
                      { borderColor: '#22C55E' }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, bill_passed: true }))}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={formData.bill_passed === true ? '#FFFFFF' : '#22C55E'}
                    />
                    <Text style={[
                      styles.billResultText,
                      formData.bill_passed === true && styles.billResultTextActive
                    ]}>
                      PASSED
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.billResultOption,
                      formData.bill_passed === false && styles.billResultOptionActive,
                      { borderColor: '#EF4444' }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, bill_passed: false }))}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={formData.bill_passed === false ? '#FFFFFF' : '#EF4444'}
                    />
                    <Text style={[
                      styles.billResultText,
                      formData.bill_passed === false && styles.billResultTextActive
                    ]}>
                      FAILED
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Parliamentary Data</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Session Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.session_name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, session_name: text }))}
                  placeholder="e.g., Spring 2024 Parliamentary Session"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hansard Reference</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.hansard_reference}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, hansard_reference: text }))}
                  placeholder="e.g., Vol. 891, No. 45, Col. 234-267"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.inputLabel}>Source Links</Text>
                  <TouchableOpacity onPress={addSourceLink} style={styles.addLinkButton}>
                    <Ionicons name="add" size={20} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
                {formData.source_links.map((link, index) => (
                  <View key={index} style={styles.linkInputContainer}>
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      value={link}
                      onChangeText={(text) => updateSourceLink(index, text)}
                      placeholder="https://..."
                      placeholderTextColor="#9CA3AF"
                    />
                    {formData.source_links.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeSourceLink(index)}
                        style={styles.removeLinkButton}
                      >
                        <Ionicons name="trash" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.inputLabel}>Verification Links</Text>
                  <TouchableOpacity onPress={addVerificationLink} style={styles.addLinkButton}>
                    <Ionicons name="add" size={20} color="#10B981" />
                  </TouchableOpacity>
                </View>
                {formData.verification_links.map((link, index) => (
                  <View key={index} style={styles.linkInputContainer}>
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      value={link}
                      onChangeText={(text) => updateVerificationLink(index, text)}
                      placeholder="https://..."
                      placeholderTextColor="#9CA3AF"
                    />
                    {formData.verification_links.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeVerificationLink(index)}
                        style={styles.removeLinkButton}
                      >
                        <Ionicons name="trash" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Custom Category Modal */}
      <Modal
        visible={showAddCategoryModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customCategoryModal}>
            <Text style={styles.customCategoryTitle}>Add Custom Category</Text>
            <TextInput
              style={styles.customCategoryInput}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Enter category name"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />

            <Text style={styles.colorPickerLabel}>Choose Color</Text>
            <View style={styles.colorPickerContainer}>
              {['#8B5CF6', '#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#EC4899', '#6366F1', '#059669', '#DC2626', '#6B7280', '#14B8A6', '#F97316'].map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customCategoryButtons}>
              <TouchableOpacity
                style={styles.customCategoryCancelButton}
                onPress={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName('');
                  setSelectedColor('#6B7280');
                }}
              >
                <Text style={styles.customCategoryCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customCategoryAddButton}
                onPress={addCustomCategory}
              >
                <Text style={styles.customCategoryAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#1E40AF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#374151',
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recordTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  recordBillNumber: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  recordActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  recordDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  recordMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasoningContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  reasoningLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  reasoningText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  modalSaveButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  addCategoryText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customCategoryModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    width: 360,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  customCategoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  customCategoryInput: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  customCategoryButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  customCategoryCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  customCategoryCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  customCategoryAddButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  customCategoryAddText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  colorPickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  colorPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  colorOptionSelected: {
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  voteOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  voteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  voteOptionActive: {
    backgroundColor: '#3B82F6',
  },
  voteOptionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: '#6B7280',
  },
  voteOptionTextActive: {
    color: '#FFFFFF',
  },
  billResultContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  billResultOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  billResultOptionActive: {
    backgroundColor: '#3B82F6',
  },
  billResultText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: '#6B7280',
  },
  billResultTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addLinkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeLinkButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  politicianBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  politicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  politicianName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  politicianPosition: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  changePoliticianButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  changePoliticianText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});