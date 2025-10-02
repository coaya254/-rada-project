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
  vote_count_for: number;
  vote_count_against: number;
  vote_count_abstain: number;
  total_votes: number;
  session_name: string;
  source_links: string[];
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
  const [bulkImportVisible, setBulkImportVisible] = useState(false);
  const [bulkData, setBulkData] = useState('');

  const [formData, setFormData] = useState<VotingRecordForm>({
    bill_title: '',
    bill_number: '',
    bill_description: '',
    vote_date: new Date().toISOString().split('T')[0],
    category: 'Other',
    vote_value: 'for',
    bill_status: 'Proposed',
    vote_count_for: 0,
    vote_count_against: 0,
    vote_count_abstain: 0,
    total_votes: 0,
    session_name: '',
    source_links: [''],
    politician_ids: [],
  });

  const categories: BillCategory[] = [
    'Constitutional', 'Economic', 'Social', 'Security', 'Infrastructure',
    'Healthcare', 'Education', 'Environment', 'Justice', 'Other'
  ];

  const voteOptions: VoteValue[] = ['for', 'against', 'abstain', 'absent'];

  useEffect(() => {
    loadVotingRecords();
    loadPoliticians();
  }, []);

  const loadVotingRecords = async () => {
    const mockRecords: VotingRecord[] = [
      {
        id: 1,
        politician_id: 1,
        bill_title: 'Climate Change Action Bill 2024',
        bill_number: 'H.R. 2024-15',
        bill_description: 'Comprehensive legislation to address climate change through renewable energy incentives and carbon reduction targets.',
        vote_date: '2024-03-15',
        vote_value: 'for',
        reasoning: 'Supporting environmental protection and sustainable development for future generations.',
        bill_status: 'Passed',
        vote_count_for: 156,
        vote_count_against: 89,
        vote_count_abstain: 12,
        total_votes: 257,
        session_name: 'Spring 2024 Parliamentary Session',
        source_links: [
          'https://parliament.go.ke/hansard/2024/march/climate-bill',
          'https://bills.parliament.go.ke/2024/climate-action'
        ],
        hansard_reference: 'Vol. 891, No. 45, Col. 234-267',
        category: 'Environment'
      },
      {
        id: 2,
        politician_id: 1,
        bill_title: 'Digital Economy Enhancement Act',
        bill_number: 'S. 2024-08',
        bill_description: 'Legislation to promote digital transformation and enhance cybersecurity infrastructure.',
        vote_date: '2024-02-28',
        vote_value: 'for',
        reasoning: 'Essential for Kenya\'s digital transformation and economic competitiveness.',
        bill_status: 'Under Review',
        vote_count_for: 134,
        vote_count_against: 98,
        vote_count_abstain: 25,
        total_votes: 257,
        session_name: 'Spring 2024 Parliamentary Session',
        source_links: [
          'https://parliament.go.ke/hansard/2024/february/digital-economy'
        ],
        hansard_reference: 'Vol. 891, No. 38, Col. 112-145',
        category: 'Economic'
      }
    ];
    setVotingRecords(mockRecords);
  };

  const loadPoliticians = async () => {
    const mockPoliticians: Politician[] = [
      {
        id: 1,
        name: 'Hon. Sarah Mwangi',
        title: 'Member of Parliament',
        party: 'Progressive Alliance',
        constituency: 'Nairobi Central',
        image_url: 'https://example.com/sarah-mwangi.jpg'
      },
      {
        id: 2,
        name: 'Hon. David Kimani',
        title: 'Senator',
        party: 'Unity Party',
        constituency: 'Kiambu County',
        image_url: 'https://example.com/david-kimani.jpg'
      }
    ];
    setPoliticians(mockPoliticians);
  };

  const resetForm = () => {
    setFormData({
      bill_title: '',
      bill_number: '',
      bill_description: '',
      vote_date: new Date().toISOString().split('T')[0],
      category: 'Other',
      vote_value: 'for',
      bill_status: 'Proposed',
      vote_count_for: 0,
      vote_count_against: 0,
      vote_count_abstain: 0,
      total_votes: 0,
      session_name: '',
      source_links: [''],
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
      if (editingRecord) {
        const updatedRecords = votingRecords.map(record =>
          record.id === editingRecord.id
            ? { ...formData, id: editingRecord.id } as VotingRecord
            : record
        );
        setVotingRecords(updatedRecords);
        Alert.alert('Success', 'Voting record updated successfully');
      } else {
        const newRecord: VotingRecord = {
          ...formData,
          id: Date.now(),
          politician_id: formData.politician_ids[0] || 1,
        } as VotingRecord;
        setVotingRecords([...votingRecords, newRecord]);
        Alert.alert('Success', 'Voting record created successfully');
      }

      setModalVisible(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save voting record');
    }
  };

  const handleEdit = (record: VotingRecord) => {
    setFormData({
      ...record,
      source_links: record.source_links || [''],
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
          onPress: () => {
            setVotingRecords(votingRecords.filter(r => r.id !== recordId));
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

  const processBulkImport = () => {
    try {
      const lines = bulkData.trim().split('\n');
      const newRecords: VotingRecord[] = [];

      lines.forEach((line, index) => {
        if (line.trim()) {
          const parts = line.split('\t');
          if (parts.length >= 6) {
            const record: VotingRecord = {
              id: Date.now() + index,
              politician_id: 1,
              bill_title: parts[0]?.trim() || '',
              bill_number: parts[1]?.trim() || '',
              bill_description: parts[2]?.trim() || '',
              vote_date: parts[3]?.trim() || new Date().toISOString().split('T')[0],
              vote_value: (parts[4]?.trim() as VoteValue) || 'for',
              category: (parts[5]?.trim() as BillCategory) || 'Other',
              bill_status: 'Proposed',
              vote_count_for: 0,
              vote_count_against: 0,
              vote_count_abstain: 0,
              total_votes: 0,
              session_name: parts[6]?.trim() || 'Imported Session',
              source_links: parts[7] ? parts[7].split(',').map(s => s.trim()) : [],
              hansard_reference: parts[8]?.trim(),
            };
            newRecords.push(record);
          }
        }
      });

      setVotingRecords([...votingRecords, ...newRecords]);
      setBulkImportVisible(false);
      setBulkData('');
      Alert.alert('Success', `Imported ${newRecords.length} voting records`);
    } catch (error) {
      Alert.alert('Error', 'Failed to process bulk import data');
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
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.filterChip, selectedCategory === category && styles.filterChipActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.filterChipText, selectedCategory === category && styles.filterChipTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.bulkImportButton}
            onPress={() => setBulkImportVisible(true)}
          >
            <Ionicons name="cloud-upload" size={16} color="#FFFFFF" />
            <Text style={styles.bulkImportText}>Bulk Import</Text>
          </TouchableOpacity>
        </View>
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
                <View style={[styles.categoryBadge, { backgroundColor: '#E5E7EB' }]}>
                  <Text style={styles.categoryText}>{record.category}</Text>
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
                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        formData.category === category && styles.categoryOptionActive
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, category }))}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        formData.category === category && styles.categoryOptionTextActive
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
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={bulkImportVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setBulkImportVisible(false)}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Bulk Import Voting Records</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={processBulkImport}
            >
              <Text style={styles.modalSaveText}>Import</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.importInstructions}>
              <Text style={styles.instructionsTitle}>Import Format</Text>
              <Text style={styles.instructionsText}>
                Paste tab-separated data with columns: Bill Title, Bill Number, Description, Vote Date, Vote, Category, Session, Source Links, Hansard Reference
              </Text>
            </View>

            <TextInput
              style={styles.bulkTextArea}
              value={bulkData}
              onChangeText={setBulkData}
              placeholder="Paste your voting records data here..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bulkImportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bulkImportText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
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
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
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
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryOptionActive: {
    backgroundColor: '#3B82F6',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
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
  importInstructions: {
    backgroundColor: '#EBF4FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#3730A3',
    lineHeight: 20,
  },
  bulkTextArea: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
});