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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PoliticsStackParamList } from '../../navigation/PoliticsStackNavigator';
import { Document, Politician } from '../../types/politician';

const { width } = Dimensions.get('window');

type DocumentManagementScreenRouteProp = RouteProp<PoliticsStackParamList, 'DocumentManagement'>;
type DocumentManagementScreenNavigationProp = StackNavigationProp<PoliticsStackParamList, 'DocumentManagement'>;

interface Props {
  route: DocumentManagementScreenRouteProp;
  navigation: DocumentManagementScreenNavigationProp;
}

type DocumentType = 'speech' | 'policy' | 'bill' | 'press_release' | 'interview' | 'manifesto' | 'report' | 'letter' | 'other';
type DocumentStatus = 'draft' | 'published' | 'archived' | 'under_review';

interface DocumentForm {
  id?: number;
  title: string;
  type: DocumentType;
  description: string;
  content: string;
  date_published: string;
  source_url?: string;
  file_url?: string;
  status: DocumentStatus;
  tags: string[];
  politician_ids: number[];
  language: 'en' | 'sw' | 'other';
  is_featured: boolean;
  transcript_available: boolean;
  summary: string;
  key_points: string[];
}

export const DocumentManagementScreen: React.FC<Props> = ({ route, navigation }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<DocumentType | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'All'>('All');
  const [bulkUploadVisible, setBulkUploadVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  const [formData, setFormData] = useState<DocumentForm>({
    title: '',
    type: 'speech',
    description: '',
    content: '',
    date_published: new Date().toISOString().split('T')[0],
    status: 'draft',
    tags: [],
    politician_ids: [],
    language: 'en',
    is_featured: false,
    transcript_available: false,
    summary: '',
    key_points: [''],
  });

  const documentTypes: DocumentType[] = [
    'speech', 'policy', 'bill', 'press_release', 'interview',
    'manifesto', 'report', 'letter', 'other'
  ];

  const statusOptions: DocumentStatus[] = ['draft', 'published', 'archived', 'under_review'];

  const commonTags = [
    'Economy', 'Healthcare', 'Education', 'Infrastructure', 'Security',
    'Environment', 'Agriculture', 'Technology', 'Youth', 'Women',
    'Governance', 'Anti-Corruption', 'Development', 'International'
  ];

  useEffect(() => {
    loadDocuments();
    loadPoliticians();
  }, []);

  const loadDocuments = async () => {
    const mockDocuments: Document[] = [
      {
        id: 1,
        politician_id: 1,
        title: 'State of the Nation Address on Economic Recovery',
        type: 'speech',
        description: 'Comprehensive address outlining Kenya\'s economic recovery plan post-COVID.',
        content: 'Fellow Kenyans, today I stand before you to address the state of our nation and our path forward...',
        date_published: '2024-03-15',
        source_url: 'https://presidency.go.ke/speeches/state-of-nation-2024',
        file_url: 'https://docs.presidency.go.ke/speeches/2024/state-of-nation.pdf',
        status: 'published',
        tags: ['Economy', 'Development', 'Healthcare'],
        language: 'en',
        is_featured: true,
        transcript_available: true,
        summary: 'President outlines ambitious economic recovery plan focusing on job creation, healthcare improvements, and infrastructure development.',
        key_points: [
          'Create 2 million jobs within 5 years',
          'Increase healthcare budget by 30%',
          'Complete major infrastructure projects',
          'Support SMEs with low-interest loans'
        ]
      },
      {
        id: 2,
        politician_id: 1,
        title: 'Climate Action Policy Framework 2024',
        type: 'policy',
        description: 'Comprehensive policy document outlining Kenya\'s climate action strategy.',
        content: 'Kenya commits to achieving carbon neutrality by 2050 through renewable energy transition...',
        date_published: '2024-02-28',
        source_url: 'https://environment.go.ke/climate-policy-2024',
        status: 'published',
        tags: ['Environment', 'Climate', 'Policy'],
        language: 'en',
        is_featured: false,
        transcript_available: false,
        summary: 'National climate policy emphasizing renewable energy, forest conservation, and green economy transition.',
        key_points: [
          'Carbon neutrality by 2050',
          '60% renewable energy by 2030',
          'Plant 15 billion trees',
          'Green jobs creation program'
        ]
      }
    ];
    setDocuments(mockDocuments);
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
      title: '',
      type: 'speech',
      description: '',
      content: '',
      date_published: new Date().toISOString().split('T')[0],
      status: 'draft',
      tags: [],
      politician_ids: [],
      language: 'en',
      is_featured: false,
      transcript_available: false,
      summary: '',
      key_points: [''],
    });
    setEditingDocument(null);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingDocument) {
        const updatedDocs = documents.map(doc =>
          doc.id === editingDocument.id
            ? { ...formData, id: editingDocument.id } as Document
            : doc
        );
        setDocuments(updatedDocs);
        Alert.alert('Success', 'Document updated successfully');
      } else {
        const newDocument: Document = {
          ...formData,
          id: Date.now(),
          politician_id: formData.politician_ids[0] || 1,
        } as Document;
        setDocuments([...documents, newDocument]);
        Alert.alert('Success', 'Document created successfully');
      }

      setModalVisible(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save document');
    }
  };

  const handleEdit = (document: Document) => {
    setFormData({
      ...document,
      politician_ids: [document.politician_id],
      key_points: document.key_points || [''],
    });
    setEditingDocument(document);
    setModalVisible(true);
  };

  const handleDelete = (documentId: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDocuments(documents.filter(d => d.id !== documentId));
          },
        },
      ]
    );
  };

  const toggleTag = (tag: string) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const addKeyPoint = () => {
    setFormData(prev => ({
      ...prev,
      key_points: [...prev.key_points, '']
    }));
  };

  const updateKeyPoint = (index: number, value: string) => {
    const newPoints = [...formData.key_points];
    newPoints[index] = value;
    setFormData(prev => ({ ...prev, key_points: newPoints }));
  };

  const removeKeyPoint = (index: number) => {
    if (formData.key_points.length > 1) {
      const newPoints = formData.key_points.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, key_points: newPoints }));
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'All' || doc.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || doc.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: DocumentType) => {
    switch (type) {
      case 'speech': return 'mic';
      case 'policy': return 'document-text';
      case 'bill': return 'library';
      case 'press_release': return 'newspaper';
      case 'interview': return 'chatbubbles';
      case 'manifesto': return 'flag';
      case 'report': return 'stats-chart';
      case 'letter': return 'mail';
      default: return 'document';
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'published': return '#22C55E';
      case 'draft': return '#F59E0B';
      case 'under_review': return '#3B82F6';
      case 'archived': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getTypeColor = (type: DocumentType) => {
    const colors = {
      speech: '#EF4444',
      policy: '#3B82F6',
      bill: '#8B5CF6',
      press_release: '#10B981',
      interview: '#F59E0B',
      manifesto: '#EC4899',
      report: '#6366F1',
      letter: '#84CC16',
      other: '#6B7280'
    };
    return colors[type] || '#6B7280';
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
        <Text style={styles.headerTitle}>Document Management</Text>
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
            placeholder="Search documents..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, selectedType === 'All' && styles.filterChipActive]}
            onPress={() => setSelectedType('All')}
          >
            <Text style={[styles.filterChipText, selectedType === 'All' && styles.filterChipTextActive]}>
              All Types
            </Text>
          </TouchableOpacity>
          {documentTypes.map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.filterChipText, selectedType === type && styles.filterChipTextActive]}>
                {type.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.bulkButton}
            onPress={() => setBulkUploadVisible(true)}
          >
            <Ionicons name="cloud-upload" size={16} color="#FFFFFF" />
            <Text style={styles.bulkButtonText}>Bulk Upload</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {filteredDocuments.map(document => (
          <View key={document.id} style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <View style={styles.documentInfo}>
                <View style={styles.typeIconContainer}>
                  <Ionicons
                    name={getTypeIcon(document.type)}
                    size={20}
                    color={getTypeColor(document.type)}
                  />
                </View>
                <View style={styles.documentTitle}>
                  <Text style={styles.documentTitleText} numberOfLines={2}>
                    {document.title}
                  </Text>
                  <View style={styles.documentMeta}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(document.status) }]}>
                      <Text style={styles.statusText}>
                        {document.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                    {document.is_featured && (
                      <View style={styles.featuredBadge}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.featuredText}>Featured</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.documentActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setPreviewDocument(document)}
                >
                  <Ionicons name="eye" size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEdit(document)}
                >
                  <Ionicons name="create" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(document.id)}
                >
                  <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.documentDescription} numberOfLines={3}>
              {document.description}
            </Text>

            <View style={styles.documentDetails}>
              <Text style={styles.detailText}>
                <Ionicons name="calendar" size={14} color="#6B7280" /> {document.date_published}
              </Text>
              <Text style={styles.detailText}>
                <Ionicons name="language" size={14} color="#6B7280" /> {document.language?.toUpperCase()}
              </Text>
              {document.transcript_available && (
                <Text style={styles.detailText}>
                  <Ionicons name="document-text" size={14} color="#6B7280" /> Transcript
                </Text>
              )}
            </View>

            {document.tags && document.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {document.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
                {document.tags.length > 3 && (
                  <Text style={styles.moreTagsText}>+{document.tags.length - 3}</Text>
                )}
              </View>
            )}

            {document.summary && (
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryLabel}>Summary:</Text>
                <Text style={styles.summaryText} numberOfLines={2}>
                  {document.summary}
                </Text>
              </View>
            )}
          </View>
        ))}

        {filteredDocuments.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="documents" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No documents found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || selectedType !== 'All' || selectedStatus !== 'All'
                ? 'Try adjusting your filters'
                : 'Add your first document'}
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
              {editingDocument ? 'Edit Document' : 'Add Document'}
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
              <Text style={styles.sectionTitle}>Basic Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.title}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                  placeholder="Document title"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {documentTypes.map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        formData.type === type && styles.typeOptionActive
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, type }))}
                    >
                      <Ionicons
                        name={getTypeIcon(type)}
                        size={16}
                        color={formData.type === type ? '#FFFFFF' : getTypeColor(type)}
                      />
                      <Text style={[
                        styles.typeOptionText,
                        formData.type === type && styles.typeOptionTextActive
                      ]}>
                        {type.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Brief description of the document"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Summary</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.summary}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, summary: text }))}
                  placeholder="Executive summary or key takeaways"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Content & Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Content</Text>
                <TextInput
                  style={[styles.textInput, styles.largeTextArea]}
                  value={formData.content}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
                  placeholder="Full document content or transcript"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={8}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Key Points</Text>
                {formData.key_points.map((point, index) => (
                  <View key={index} style={styles.keyPointContainer}>
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      value={point}
                      onChangeText={(text) => updateKeyPoint(index, text)}
                      placeholder={`Key point ${index + 1}`}
                      placeholderTextColor="#9CA3AF"
                    />
                    {formData.key_points.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeKeyPoint(index)}
                        style={styles.removeButton}
                      >
                        <Ionicons name="trash" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity onPress={addKeyPoint} style={styles.addButton}>
                  <Ionicons name="add" size={16} color="#3B82F6" />
                  <Text style={styles.addButtonText}>Add Key Point</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Metadata</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Publication Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.date_published}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, date_published: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusOptions}>
                  {statusOptions.map(status => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        formData.status === status && styles.statusOptionActive,
                        { borderColor: getStatusColor(status) }
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, status }))}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        formData.status === status && styles.statusOptionTextActive
                      ]}>
                        {status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tags</Text>
                <View style={styles.tagsGrid}>
                  {commonTags.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tagOption,
                        formData.tags.includes(tag) && styles.tagOptionActive
                      ]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text style={[
                        styles.tagOptionText,
                        formData.tags.includes(tag) && styles.tagOptionTextActive
                      ]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Source URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.source_url}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, source_url: text }))}
                  placeholder="https://..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }))}
                >
                  {formData.is_featured && (
                    <Ionicons name="checkmark" size={16} color="#3B82F6" />
                  )}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Featured Document</Text>
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setFormData(prev => ({ ...prev, transcript_available: !prev.transcript_available }))}
                >
                  {formData.transcript_available && (
                    <Ionicons name="checkmark" size={16} color="#3B82F6" />
                  )}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Transcript Available</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={!!previewDocument}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {previewDocument && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setPreviewDocument(null)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Document Preview</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.previewContent}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>{previewDocument.title}</Text>
                <View style={styles.previewMeta}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(previewDocument.status) }]}>
                    <Text style={styles.statusText}>
                      {previewDocument.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.previewDate}>{previewDocument.date_published}</Text>
                </View>
              </View>

              {previewDocument.summary && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Summary</Text>
                  <Text style={styles.previewText}>{previewDocument.summary}</Text>
                </View>
              )}

              {previewDocument.key_points && previewDocument.key_points.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Key Points</Text>
                  {previewDocument.key_points.map((point, index) => (
                    <View key={index} style={styles.keyPointItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.keyPointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Description</Text>
                <Text style={styles.previewText}>{previewDocument.description}</Text>
              </View>

              {previewDocument.content && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Content</Text>
                  <Text style={styles.previewText}>{previewDocument.content}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
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
    backgroundColor: '#6366F1',
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
    backgroundColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 12,
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
  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bulkButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  documentInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentTitle: {
    flex: 1,
  },
  documentTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featuredText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '500',
    marginLeft: 2,
  },
  documentActions: {
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
  documentDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  documentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagBadge: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  summaryText: {
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
    backgroundColor: '#6366F1',
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
  largeTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginRight: 8,
  },
  typeOptionActive: {
    backgroundColor: '#6366F1',
  },
  typeOptionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  typeOptionTextActive: {
    color: '#FFFFFF',
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  statusOptionActive: {
    backgroundColor: '#6366F1',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  statusOptionTextActive: {
    color: '#FFFFFF',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  tagOptionActive: {
    backgroundColor: '#EBF4FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  tagOptionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  tagOptionTextActive: {
    color: '#3B82F6',
  },
  keyPointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EBF4FF',
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  previewContent: {
    flex: 1,
    padding: 16,
  },
  previewHeader: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  previewSection: {
    marginBottom: 20,
  },
  previewSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  keyPointItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#6366F1',
    marginRight: 8,
    fontWeight: 'bold',
  },
  keyPointText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
});