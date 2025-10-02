import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Commitment } from '../../types';

interface CommitmentTrackingScreenProps {
  navigation: NativeStackNavigationProp<any, 'CommitmentTracking'>;
  route: {
    params?: {
      politicianId?: number;
    };
  };
}

interface FormData extends Omit<Commitment, 'id' | 'politician_id'> {
  id?: number;
  politician_id?: number;
}

export const CommitmentTrackingScreen: React.FC<CommitmentTrackingScreenProps> = ({ navigation, route }) => {
  const { politicianId } = route.params || {};
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [filteredCommitments, setFilteredCommitments] = useState<Commitment[]>([]);
  const [selectedPolitician, setSelectedPolitician] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);

  const [formData, setFormData] = useState<FormData>({
    promise: '',
    description: '',
    category: 'Economy',
    context: '',
    date_made: '',
    status: 'no_evidence',
    progress_percentage: 0,
    evidence: '',
    last_activity_date: '',
    source_links: [],
    verification_links: [],
    related_actions: [],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Mock politicians data
  const politicians = [
    { id: 1, name: 'William Ruto' },
    { id: 2, name: 'Raila Odinga' },
    { id: 3, name: 'Martha Karua' },
    { id: 4, name: 'Kalonzo Musyoka' },
  ];

  // Commitment categories
  const categories = [
    'Economy', 'Education', 'Healthcare', 'Infrastructure', 'Security',
    'Agriculture', 'Technology', 'Environment', 'Social Welfare', 'Governance'
  ];

  // Status configurations
  const statusConfigs = [
    {
      value: 'no_evidence',
      label: 'No Evidence',
      color: '#6B7280',
      icon: 'help-outline',
      description: 'No progress or evidence found'
    },
    {
      value: 'early_progress',
      label: 'Early Progress',
      color: '#F59E0B',
      icon: 'hourglass-empty',
      description: 'Initial steps taken'
    },
    {
      value: 'significant_progress',
      label: 'Significant Progress',
      color: '#3B82F6',
      icon: 'trending-up',
      description: 'Substantial progress made'
    },
    {
      value: 'completed',
      label: 'Completed',
      color: '#10B981',
      icon: 'check-circle',
      description: 'Promise fully fulfilled'
    },
    {
      value: 'stalled',
      label: 'Stalled',
      color: '#EF4444',
      icon: 'pause-circle-outline',
      description: 'No recent activity'
    },
  ];

  // Source types for commitments
  const sourceTypes = [
    'news', 'speech', 'manifesto', 'interview', 'government_doc'
  ];

  // Mock commitments data
  useEffect(() => {
    const mockCommitments: Commitment[] = [
      {
        id: 1,
        politician_id: 1,
        promise: 'Create 1 million jobs annually',
        description: 'Government will create one million jobs every year through various economic initiatives and public-private partnerships.',
        category: 'Economy',
        context: 'Campaign promise during 2022 presidential election',
        date_made: '2022-03-15',
        status: 'early_progress',
        progress_percentage: 25,
        evidence: 'Launched youth employment programs and announced infrastructure projects',
        last_activity_date: '2024-01-15',
        source_links: [
          {
            type: 'speech',
            url: 'https://example.com/ruto-jobs-speech',
            title: 'Ruto Promises One Million Jobs',
            source: 'Campaign Rally',
            date: '2022-03-15'
          }
        ],
        verification_links: [
          {
            type: 'government_report',
            url: 'https://example.com/jobs-report',
            title: 'Q4 2023 Employment Report',
            source: 'Ministry of Labour',
            date: '2024-01-15',
            content_summary: 'Shows 250,000 new jobs created in 2023'
          }
        ]
      },
      {
        id: 2,
        politician_id: 1,
        promise: 'Reduce cost of living by 50%',
        description: 'Lower the cost of essential commodities including food, fuel, and housing by 50% within the first year.',
        category: 'Economy',
        context: 'Key campaign promise',
        date_made: '2022-02-20',
        status: 'stalled',
        progress_percentage: 10,
        evidence: 'Some subsidies introduced but overall costs remain high',
        last_activity_date: '2023-08-20',
        source_links: [
          {
            type: 'manifesto',
            url: 'https://example.com/uda-manifesto',
            title: 'UDA Party Manifesto 2022',
            source: 'UDA Party',
            date: '2022-02-20'
          }
        ]
      },
      {
        id: 3,
        politician_id: 2,
        promise: 'Universal Healthcare for all Kenyans',
        description: 'Implement a comprehensive universal healthcare system that provides free quality healthcare to all Kenyan citizens.',
        category: 'Healthcare',
        context: 'Long-standing policy position',
        date_made: '2017-08-10',
        status: 'significant_progress',
        progress_percentage: 70,
        evidence: 'NHIF expansion and county health programs implemented',
        source_links: [
          {
            type: 'interview',
            url: 'https://example.com/raila-healthcare',
            title: 'Raila on Universal Healthcare',
            source: 'Citizen TV',
            date: '2017-08-10'
          }
        ]
      }
    ];

    // Filter by politician if specified
    const filtered = politicianId
      ? mockCommitments.filter(commitment => commitment.politician_id === politicianId)
      : mockCommitments;

    setCommitments(filtered);
    setFilteredCommitments(filtered);
  }, [politicianId]);

  // Filter commitments based on search and filters
  useEffect(() => {
    let filtered = commitments;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(commitment =>
        commitment.promise.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commitment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commitment.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Politician filter
    if (selectedPolitician !== 'all') {
      const politicianId = parseInt(selectedPolitician);
      filtered = filtered.filter(commitment => commitment.politician_id === politicianId);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(commitment => commitment.status === selectedStatus);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(commitment => commitment.category === selectedCategory);
    }

    // Sort by date made (newest first)
    filtered = filtered.sort((a, b) => new Date(b.date_made).getTime() - new Date(a.date_made).getTime());

    setFilteredCommitments(filtered);
  }, [commitments, searchQuery, selectedPolitician, selectedStatus, selectedCategory]);

  const resetForm = () => {
    setFormData({
      promise: '',
      description: '',
      category: 'Economy',
      context: '',
      date_made: '',
      status: 'no_evidence',
      progress_percentage: 0,
      evidence: '',
      last_activity_date: '',
      source_links: [],
      verification_links: [],
      related_actions: [],
    });
    setValidationErrors({});
    setEditingCommitment(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.promise.trim()) errors.promise = 'Promise is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.date_made.trim()) errors.date_made = 'Date is required';
    if (!politicianId && !formData.politician_id) errors.politician = 'Politician must be selected';

    // Validate date format (YYYY-MM-DD)
    if (formData.date_made && !/^\d{4}-\d{2}-\d{2}$/.test(formData.date_made)) {
      errors.date_made = 'Date must be in YYYY-MM-DD format';
    }

    // Validate progress percentage
    if (formData.progress_percentage < 0 || formData.progress_percentage > 100) {
      errors.progress_percentage = 'Progress must be between 0-100%';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCommitment = () => {
    if (!validateForm()) return;

    if (editingCommitment) {
      // Update existing commitment
      setCommitments(prev => prev.map(commitment =>
        commitment.id === editingCommitment.id
          ? { ...commitment, ...formData, politician_id: politicianId || formData.politician_id! }
          : commitment
      ));
      Alert.alert('Success', 'Commitment updated successfully');
    } else {
      // Add new commitment
      const newCommitment: Commitment = {
        ...formData,
        id: Date.now(),
        politician_id: politicianId || formData.politician_id!,
      };
      setCommitments(prev => [...prev, newCommitment]);
      Alert.alert('Success', 'Commitment added successfully');
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleEditCommitment = (commitment: Commitment) => {
    setEditingCommitment(commitment);
    setFormData({
      promise: commitment.promise,
      description: commitment.description,
      category: commitment.category,
      context: commitment.context || '',
      date_made: commitment.date_made,
      status: commitment.status,
      progress_percentage: commitment.progress_percentage,
      evidence: commitment.evidence || '',
      last_activity_date: commitment.last_activity_date || '',
      source_links: commitment.source_links || [],
      verification_links: commitment.verification_links || [],
      related_actions: commitment.related_actions || [],
    });
    setShowAddModal(true);
  };

  const handleDeleteCommitment = (commitmentId: number) => {
    Alert.alert(
      'Delete Commitment',
      'Are you sure you want to delete this commitment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCommitments(prev => prev.filter(commitment => commitment.id !== commitmentId));
            Alert.alert('Success', 'Commitment deleted successfully');
          }
        }
      ]
    );
  };

  const addSourceLink = () => {
    const newLink = {
      type: 'news' as const,
      url: '',
      title: '',
      source: '',
      date: new Date().toISOString().split('T')[0],
    };
    setFormData(prev => ({
      ...prev,
      source_links: [...(prev.source_links || []), newLink]
    }));
  };

  const updateSourceLink = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      source_links: (prev.source_links || []).map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeSourceLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      source_links: (prev.source_links || []).filter((_, i) => i !== index)
    }));
  };

  const getStatusConfig = (status: string) => {
    return statusConfigs.find(s => s.value === status) || statusConfigs[0];
  };

  const getPoliticianName = (politicianId: number) => {
    return politicians.find(p => p.id === politicianId)?.name || 'Unknown';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#3B82F6';
    if (percentage >= 40) return '#F59E0B';
    if (percentage >= 20) return '#F97316';
    return '#EF4444';
  };

  const renderCommitmentCard = ({ item }: { item: Commitment }) => {
    const statusConfig = getStatusConfig(item.status);
    const politicianName = getPoliticianName(item.politician_id);
    const progressColor = getProgressColor(item.progress_percentage);

    return (
      <View style={styles.commitmentCard}>
        <View style={styles.commitmentHeader}>
          <View style={styles.commitmentInfo}>
            <View style={styles.commitmentTitleRow}>
              <Text style={styles.commitmentTitle} numberOfLines={2}>{item.promise}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
                <MaterialIcons
                  name={statusConfig.icon as keyof typeof MaterialIcons.glyphMap}
                  size={14}
                  color={statusConfig.color}
                />
                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </View>
            </View>
            <Text style={styles.commitmentMeta}>
              {politicianName} • {item.category} • {item.date_made}
            </Text>
          </View>
          <View style={styles.commitmentActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditCommitment(item)}
            >
              <MaterialIcons name="edit" size={16} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteCommitment(item.id)}
            >
              <MaterialIcons name="delete" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.commitmentDescription} numberOfLines={3}>
          {item.description}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={[styles.progressPercentage, { color: progressColor }]}>
              {item.progress_percentage}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${item.progress_percentage}%`,
                    backgroundColor: progressColor
                  }
                ]}
              />
            </View>
          </View>
        </View>

        {item.evidence && (
          <View style={styles.evidenceSection}>
            <Text style={styles.evidenceLabel}>Evidence:</Text>
            <Text style={styles.evidenceText} numberOfLines={2}>
              {item.evidence}
            </Text>
          </View>
        )}

        {item.source_links && item.source_links.length > 0 && (
          <View style={styles.sourcesSection}>
            <Text style={styles.sourcesTitle}>Sources:</Text>
            {item.source_links.slice(0, 2).map((link, index) => (
              <View key={index} style={styles.sourceItem}>
                <MaterialIcons name="link" size={14} color="#3B82F6" />
                <Text style={styles.sourceText} numberOfLines={1}>
                  {link.title} - {link.source}
                </Text>
              </View>
            ))}
            {item.source_links.length > 2 && (
              <Text style={styles.moreSourcesText}>
                +{item.source_links.length - 2} more sources
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderAddCommitmentModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => {
              setShowAddModal(false);
              resetForm();
            }}
          >
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editingCommitment ? 'Edit Commitment' : 'Add Commitment'}
          </Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveCommitment}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Promise Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Promise/Commitment *</Text>
            <TextInput
              style={[styles.textInput, validationErrors.promise && styles.inputError]}
              value={formData.promise}
              onChangeText={(value) => setFormData(prev => ({ ...prev, promise: value }))}
              placeholder="e.g., Create 1 million jobs annually"
            />
            {validationErrors.promise && <Text style={styles.errorText}>{validationErrors.promise}</Text>}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea, validationErrors.description && styles.inputError]}
              value={formData.description}
              onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Detailed description of the commitment..."
              multiline
              numberOfLines={4}
            />
            {validationErrors.description && <Text style={styles.errorText}>{validationErrors.description}</Text>}
          </View>

          {/* Category and Date */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categorySelector}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        formData.category === category && styles.categoryChipSelected
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, category }))}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        formData.category === category && styles.categoryChipTextSelected
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.inputLabel}>Date Made *</Text>
              <TextInput
                style={[styles.textInput, validationErrors.date_made && styles.inputError]}
                value={formData.date_made}
                onChangeText={(value) => setFormData(prev => ({ ...prev, date_made: value }))}
                placeholder="2023-12-01"
              />
              {validationErrors.date_made && <Text style={styles.errorText}>{validationErrors.date_made}</Text>}
            </View>
          </View>

          {/* Status and Progress */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusSelector}>
              {statusConfigs.map(status => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.statusOption,
                    formData.status === status.value && styles.statusOptionSelected,
                    { borderColor: status.color }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, status: status.value as any }))}
                >
                  <MaterialIcons
                    name={status.icon as keyof typeof MaterialIcons.glyphMap}
                    size={20}
                    color={formData.status === status.value ? '#FFFFFF' : status.color}
                  />
                  <Text style={[
                    styles.statusOptionText,
                    formData.status === status.value && styles.statusOptionTextSelected
                  ]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Progress Percentage */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Progress Percentage (0-100)</Text>
            <View style={styles.progressInputContainer}>
              <TextInput
                style={[styles.textInput, styles.progressInput, validationErrors.progress_percentage && styles.inputError]}
                value={formData.progress_percentage.toString()}
                onChangeText={(value) => {
                  const num = parseInt(value) || 0;
                  setFormData(prev => ({ ...prev, progress_percentage: Math.min(100, Math.max(0, num)) }));
                }}
                placeholder="0"
                keyboardType="numeric"
              />
              <View style={styles.progressPreview}>
                <View style={styles.progressPreviewBar}>
                  <View
                    style={[
                      styles.progressPreviewFill,
                      {
                        width: `${formData.progress_percentage}%`,
                        backgroundColor: getProgressColor(formData.progress_percentage)
                      }
                    ]}
                  />
                </View>
                <Text style={styles.progressPreviewText}>{formData.progress_percentage}%</Text>
              </View>
            </View>
            {validationErrors.progress_percentage && <Text style={styles.errorText}>{validationErrors.progress_percentage}</Text>}
          </View>

          {/* Evidence */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Evidence/Updates</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.evidence}
              onChangeText={(value) => setFormData(prev => ({ ...prev, evidence: value }))}
              placeholder="Evidence of progress or lack thereof..."
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Politician Selection (only if not specific politician) */}
          {!politicianId && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Politician *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.politicianSelector}>
                {politicians.map(politician => (
                  <TouchableOpacity
                    key={politician.id}
                    style={[
                      styles.politicianOption,
                      formData.politician_id === politician.id && styles.politicianOptionSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, politician_id: politician.id }))}
                  >
                    <Text style={[
                      styles.politicianOptionText,
                      formData.politician_id === politician.id && styles.politicianOptionTextSelected
                    ]}>
                      {politician.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {validationErrors.politician && <Text style={styles.errorText}>{validationErrors.politician}</Text>}
            </View>
          )}

          {/* Source Links */}
          <View style={styles.inputGroup}>
            <View style={styles.sourceLinkHeader}>
              <Text style={styles.inputLabel}>Source Links</Text>
              <TouchableOpacity style={styles.addSourceButton} onPress={addSourceLink}>
                <MaterialIcons name="add" size={16} color="#3B82F6" />
                <Text style={styles.addSourceText}>Add Source</Text>
              </TouchableOpacity>
            </View>

            {formData.source_links?.map((link, index) => (
              <View key={index} style={styles.sourceLinkItem}>
                <View style={styles.sourceLinkInputs}>
                  <TextInput
                    style={[styles.textInput, styles.sourceLinkInput]}
                    value={link.title}
                    onChangeText={(value) => updateSourceLink(index, 'title', value)}
                    placeholder="Link title"
                  />
                  <TextInput
                    style={[styles.textInput, styles.sourceLinkInput]}
                    value={link.url}
                    onChangeText={(value) => updateSourceLink(index, 'url', value)}
                    placeholder="URL"
                  />
                  <TextInput
                    style={[styles.textInput, styles.sourceLinkInput]}
                    value={link.source}
                    onChangeText={(value) => updateSourceLink(index, 'source', value)}
                    placeholder="Source name"
                  />
                </View>
                <TouchableOpacity
                  style={styles.removeSourceButton}
                  onPress={() => removeSourceLink(index)}
                >
                  <MaterialIcons name="close" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
        <Text style={styles.headerTitle}>
          {politicianId ? `Commitments - ${getPoliticianName(politicianId)}` : 'Commitment Tracking'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialIcons name="add" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersSection}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search commitments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {!politicianId && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, selectedPolitician === 'all' && styles.filterChipActive]}
              onPress={() => setSelectedPolitician('all')}
            >
              <Text style={[styles.filterChipText, selectedPolitician === 'all' && styles.filterChipTextActive]}>
                All Politicians
              </Text>
            </TouchableOpacity>
            {politicians.map(politician => (
              <TouchableOpacity
                key={politician.id}
                style={[styles.filterChip, selectedPolitician === politician.id.toString() && styles.filterChipActive]}
                onPress={() => setSelectedPolitician(politician.id.toString())}
              >
                <Text style={[styles.filterChipText, selectedPolitician === politician.id.toString() && styles.filterChipTextActive]}>
                  {politician.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedStatus('all')}
          >
            <Text style={[styles.filterChipText, selectedStatus === 'all' && styles.filterChipTextActive]}>
              All Status
            </Text>
          </TouchableOpacity>
          {statusConfigs.map(status => (
            <TouchableOpacity
              key={status.value}
              style={[styles.filterChip, selectedStatus === status.value && styles.filterChipActive]}
              onPress={() => setSelectedStatus(status.value)}
            >
              <MaterialIcons
                name={status.icon as keyof typeof MaterialIcons.glyphMap}
                size={16}
                color={selectedStatus === status.value ? '#FFFFFF' : status.color}
              />
              <Text style={[styles.filterChipText, selectedStatus === status.value && styles.filterChipTextActive]}>
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedCategory === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.filterChipText, selectedCategory === 'all' && styles.filterChipTextActive]}>
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
      </View>

      {/* Commitments List */}
      <FlatList
        data={filteredCommitments}
        renderItem={renderCommitmentCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.commitmentsList}
        contentContainerStyle={styles.commitmentsListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="assignment-turned-in" size={64} color="#e9ecef" />
            <Text style={styles.emptyStateTitle}>No commitments found</Text>
            <Text style={styles.emptyStateDescription}>
              {searchQuery || selectedStatus !== 'all' || selectedPolitician !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Add the first commitment to get started'
              }
            </Text>
          </View>
        }
      />

      {renderAddCommitmentModal()}
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
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  searchBar: {
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
  filterScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  commitmentsList: {
    flex: 1,
  },
  commitmentsListContent: {
    padding: 24,
    gap: 16,
  },
  commitmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  commitmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  commitmentInfo: {
    flex: 1,
  },
  commitmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commitmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  commitmentMeta: {
    fontSize: 12,
    color: '#666',
  },
  commitmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commitmentDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  evidenceSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  evidenceLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  evidenceText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  sourcesSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  sourcesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 12,
    color: '#3B82F6',
    flex: 1,
  },
  moreSourcesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryChipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  statusSelector: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 2,
    gap: 4,
  },
  statusOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  statusOptionTextSelected: {
    color: '#FFFFFF',
  },
  progressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressInput: {
    flex: 1,
  },
  progressPreview: {
    flex: 2,
    alignItems: 'center',
    gap: 4,
  },
  progressPreviewBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressPreviewFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPreviewText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  politicianSelector: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  politicianOption: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  politicianOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  politicianOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  politicianOptionTextSelected: {
    color: '#FFFFFF',
  },
  sourceLinkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addSourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addSourceText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  sourceLinkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sourceLinkInputs: {
    flex: 1,
    gap: 8,
  },
  sourceLinkInput: {
    fontSize: 14,
    padding: 12,
  },
  removeSourceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
});