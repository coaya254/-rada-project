import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Politician } from '../../types';
import adminAPI from '../../services/AdminAPIService';

interface EditPoliticianScreenProps {
  navigation: NativeStackNavigationProp<any, 'EditPolitician'>;
  route: {
    params: {
      politicianId: number;
    };
  };
}

interface FormData extends Politician {
  // All politician fields already included in the Politician interface
}

export const EditPoliticianScreen: React.FC<EditPoliticianScreenProps> = ({ navigation, route }) => {
  const { politicianId } = route.params;
  const [currentStep, setCurrentStep] = useState(1);
  const [originalData, setOriginalData] = useState<Politician | null>(null);
  const [formData, setFormData] = useState<FormData>({
    id: 0,
    name: '',
    title: '',
    current_position: '',
    party: '',
    party_history: [],
    constituency: '',
    wikipedia_summary: '',
    key_achievements: [],
    education: '',
    image_url: '',
    party_color: '',
    slug: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [contentCounts, setContentCounts] = useState({
    timeline: 0,
    voting: 0,
    documents: 0,
    promises: 0,
    news: 0,
    career: 1, // Career info is part of the politician profile
  });
  const [isDraft, setIsDraft] = useState(true);
  const [partyHistoryModalVisible, setPartyHistoryModalVisible] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [educationModalVisible, setEducationModalVisible] = useState(false);
  const [newEducation, setNewEducation] = useState('');
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [newAchievement, setNewAchievement] = useState('');

  // Smart suggestions data
  const kenyanParties = [
    { name: 'UDA', fullName: 'United Democratic Alliance', color: '#FFD700' },
    { name: 'ODM', fullName: 'Orange Democratic Movement', color: '#FFA500' },
    { name: 'NARC-Kenya', fullName: 'National Rainbow Coalition', color: '#0000FF' },
    { name: 'Wiper', fullName: 'Wiper Democratic Movement', color: '#800080' },
    { name: 'Jubilee', fullName: 'Jubilee Party', color: '#FF0000' },
    { name: 'ANC', fullName: 'Amani National Congress', color: '#008000' },
  ];

  const kenyanConstituencies = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Meru', 'Thika', 'Malindi',
    'Uasin Gishu', 'Kirinyaga', 'Mwingi North', 'Langata', 'Gichugu', 'Machakos',
  ];

  // Load politician data
  useEffect(() => {
    const loadPolitician = async () => {
      try {
        const response = await adminAPI.getPolitician(politicianId);

        if (response.success && response.data) {
          const politician = response.data;

          // Map database fields to Politician interface
          const mappedData: Politician = {
            id: politician.id,
            name: politician.name,
            title: politician.position || politician.title,
            current_position: politician.position || politician.current_position,
            party: politician.party,
            party_history: politician.party_history || [],
            constituency: politician.constituency || '',
            slug: politician.slug || '',
            wikipedia_summary: politician.bio || politician.wikipedia_summary || '',
            key_achievements: politician.key_achievements || [],
            education: politician.education || '',
            image_url: politician.image_url,
            party_color: politician.party_color || '',
          };

          setOriginalData(mappedData);
          setFormData(mappedData);
          setIsDraft(politician.is_draft === 1);
        } else {
          Alert.alert('Error', 'Politician not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error loading politician:', error);
        Alert.alert('Error', 'Failed to load politician data');
        navigation.goBack();
      }
    };

    loadPolitician();
  }, [politicianId]);

  // Load content counts
  useEffect(() => {
    const loadContentCounts = async () => {
      try {
        // Fetch timeline events count
        const timelineResponse = await adminAPI.getTimelineEvents(politicianId);
        const timelineCount = timelineResponse.success && timelineResponse.data?.data
          ? timelineResponse.data.data.length
          : 0;

        // Fetch voting records count
        const votingResponse = await adminAPI.getVotingRecords({ politicianId });
        const votingCount = votingResponse.success && votingResponse.data?.data
          ? votingResponse.data.data.length
          : 0;

        // Fetch documents count
        const documentsResponse = await adminAPI.getDocuments({ politicianId });
        const documentsCount = documentsResponse.success && documentsResponse.data?.data
          ? documentsResponse.data.data.length
          : 0;

        // Fetch commitments count
        const commitmentsResponse = await adminAPI.getCommitments({ politicianId });
        const commitmentsCount = commitmentsResponse.success && commitmentsResponse.data?.data
          ? commitmentsResponse.data.data.length
          : 0;

        // Update content counts
        setContentCounts(prev => ({
          ...prev,
          timeline: timelineCount,
          voting: votingCount,
          documents: documentsCount,
          promises: commitmentsCount,
        }));
      } catch (error) {
        console.error('Error loading content counts:', error);
      }
    };

    loadContentCounts();
  }, [politicianId]);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && formData.name !== originalData?.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, originalData?.name]);

  // Smart party color assignment
  useEffect(() => {
    if (formData.party && formData.party !== originalData?.party) {
      const party = kenyanParties.find(p =>
        p.name.toLowerCase() === formData.party.toLowerCase() ||
        p.fullName.toLowerCase().includes(formData.party.toLowerCase())
      );
      if (party) {
        setFormData(prev => ({ ...prev, party_color: party.color }));
      }
    }
  }, [formData.party, originalData?.party]);

  // Check for changes
  useEffect(() => {
    if (!originalData) return;

    const hasChanges = Object.keys(formData).some(key => {
      const formValue = (formData as any)[key];
      const originalValue = (originalData as any)[key];

      if (Array.isArray(formValue) && Array.isArray(originalValue)) {
        return JSON.stringify(formValue.sort()) !== JSON.stringify(originalValue.sort());
      }
      return formValue !== originalValue;
    });

    setHasChanges(hasChanges);
  }, [formData, originalData]);

  // Validation functions - relaxed for edit mode
  const validateCurrentStep = () => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Basic Info
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.party.trim()) errors.party = 'Party is required';
        break;

      case 2: // Position & Role
        // No validation - allow proceeding even if empty
        break;

      case 3: // Achievements & Summary
        // No validation - allow proceeding even if empty
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addAchievement = (achievement: string) => {
    if (achievement.trim()) {
      setFormData(prev => ({
        ...prev,
        key_achievements: [...prev.key_achievements, achievement.trim()]
      }));
    }
  };

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      key_achievements: prev.key_achievements.filter((_, i) => i !== index)
    }));
  };

  const addPartyHistory = (party: string) => {
    if (party.trim() && !formData.party_history.includes(party.trim())) {
      setFormData(prev => ({
        ...prev,
        party_history: [...prev.party_history, party.trim()]
      }));
    }
  };

  const nextStep = () => {
    console.log('nextStep called, currentStep:', currentStep);
    const isValid = validateCurrentStep();
    console.log('Validation result:', isValid, 'Errors:', validationErrors);

    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        console.log('Calling handleSave...');
        handleSave();
      }
    } else {
      console.log('Validation failed, not proceeding');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    console.log('handleSave called');
    if (!validateCurrentStep()) {
      console.log('Validation failed in handleSave');
      return;
    }

    console.log('About to call API with formData:', formData);
    console.log('Constituency value being sent:', formData.constituency);

    try {
      const response = await adminAPI.updatePolitician(politicianId, formData);
      console.log('API response:', response);

      if (response.success) {
        if (Platform.OS === 'web') {
          alert('Success! Politician profile updated successfully!');
          navigation.goBack();
        } else {
          Alert.alert('Success', 'Politician profile updated successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        }
      } else {
        if (Platform.OS === 'web') {
          alert('Error: ' + (response.error || 'Failed to update politician'));
        } else {
          Alert.alert('Error', response.error || 'Failed to update politician');
        }
      }
    } catch (error: any) {
      console.error('Error updating politician:', error);
      Alert.alert('Error', 'Failed to update politician');
    }
  };

  const handlePublish = async () => {
    console.log('handlePublish called for politician:', politicianId);

    // Check content completeness
    const missingContent = [];
    if (contentCounts.timeline === 0) missingContent.push('Timeline events');
    if (contentCounts.voting === 0) missingContent.push('Voting records');
    if (contentCounts.documents === 0) missingContent.push('Documents');
    if (contentCounts.promises === 0) missingContent.push('Promises/Commitments');

    if (missingContent.length > 0) {
      console.warn('Publishing with missing content:', missingContent);
    }

    console.log('Calling publishPolitician API...');

    try {
      const response = await adminAPI.publishPolitician(politicianId);
      console.log('Publish API response:', response);

      if (response.success) {
        setIsDraft(false);
        console.log('✅ Politician published successfully!');
        alert(`Success: ${formData.name}'s profile has been published and is now visible to all users!`);
      } else {
        console.error('❌ Publish failed:', response.error);
        alert(`Error: ${response.error || 'Failed to publish politician'}`);
      }
    } catch (error: any) {
      console.error('❌ Error publishing politician:', error);
      alert('Error: Failed to publish politician');
    }
  };

  const handleDiscard = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map(step => (
        <View key={step} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            step <= currentStep && styles.stepCircleActive
          ]}>
            {step < currentStep ? (
              <MaterialIcons name="check" size={16} color="#FFFFFF" />
            ) : (
              <Text style={[
                styles.stepNumber,
                step <= currentStep && styles.stepNumberActive
              ]}>
                {step}
              </Text>
            )}
          </View>
          <Text style={[
            styles.stepLabel,
            step <= currentStep && styles.stepLabelActive
          ]}>
            {step === 1 ? 'Basic Info' : step === 2 ? 'Position' : 'Details'}
          </Text>
          {step < 3 && <View style={[
            styles.stepLine,
            step < currentStep && styles.stepLineActive
          ]} />}
        </View>
      ))}
    </View>
  );

  const renderBasicInfoStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Basic Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={[styles.textInput, validationErrors.name && styles.inputError]}
          value={formData.name}
          onChangeText={(value) => updateField('name', value)}
          placeholder="e.g., William Samoei Ruto"
        />
        {validationErrors.name && <Text style={styles.errorText}>{validationErrors.name}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Title *</Text>
        <TextInput
          style={[styles.textInput, validationErrors.title && styles.inputError]}
          value={formData.title}
          onChangeText={(value) => updateField('title', value)}
          placeholder="e.g., President of Kenya"
        />
        {validationErrors.title && <Text style={styles.errorText}>{validationErrors.title}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Political Party *</Text>
        <TextInput
          style={[styles.textInput, validationErrors.party && styles.inputError]}
          value={formData.party}
          onChangeText={(value) => updateField('party', value)}
          placeholder="e.g., UDA"
        />
        {formData.party && (
          <View style={styles.suggestionsList}>
            {kenyanParties
              .filter(p => p.name.toLowerCase().includes(formData.party.toLowerCase()))
              .map(party => (
                <TouchableOpacity
                  key={party.name}
                  style={styles.suggestionItem}
                  onPress={() => updateField('party', party.name)}
                >
                  <View style={[styles.partyColor, { backgroundColor: party.color }]} />
                  <Text style={styles.suggestionText}>{party.name} - {party.fullName}</Text>
                </TouchableOpacity>
              ))
            }
          </View>
        )}
        {validationErrors.party && <Text style={styles.errorText}>{validationErrors.party}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Constituency *</Text>
        <TextInput
          style={[styles.textInput, validationErrors.constituency && styles.inputError]}
          value={formData.constituency}
          onChangeText={(value) => updateField('constituency', value)}
          placeholder="e.g., Uasin Gishu"
        />
        {validationErrors.constituency && <Text style={styles.errorText}>{validationErrors.constituency}</Text>}
      </View>

      {formData.slug && originalData?.slug !== formData.slug && (
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={16} color="#F59E0B" />
          <Text style={styles.infoText}>URL will change to: /politician/{formData.slug}</Text>
        </View>
      )}
    </View>
  );

  const renderPositionStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Position & Background</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Position *</Text>
        <TextInput
          style={[styles.textInput, validationErrors.current_position && styles.inputError]}
          value={formData.current_position}
          onChangeText={(value) => updateField('current_position', value)}
          placeholder="e.g., President of the Republic of Kenya"
        />
        {validationErrors.current_position && <Text style={styles.errorText}>{validationErrors.current_position}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Education Background *</Text>
        {formData.education ? (
          <View style={styles.educationContainer}>
            <Text style={styles.educationText}>{formData.education}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setNewEducation(formData.education);
                setEducationModalVisible(true);
              }}
            >
              <MaterialIcons name="edit" size={16} color="#3B82F6" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addEducationButton}
            onPress={() => {
              setNewEducation('');
              setEducationModalVisible(true);
            }}
          >
            <MaterialIcons name="add" size={16} color="#3B82F6" />
            <Text style={styles.addEducationText}>Add Education Background</Text>
          </TouchableOpacity>
        )}
        {validationErrors.education && <Text style={styles.errorText}>{validationErrors.education}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Party History</Text>
        <View style={styles.partyHistoryContainer}>
          {formData.party_history.map((party, index) => (
            <View key={index} style={styles.partyHistoryItem}>
              <Text style={styles.partyHistoryText}>{party}</Text>
              <TouchableOpacity onPress={() => {
                setFormData(prev => ({
                  ...prev,
                  party_history: prev.party_history.filter((_, i) => i !== index)
                }));
              }}>
                <MaterialIcons name="close" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addPartyButton}
            onPress={() => {
              setNewPartyName('');
              setPartyHistoryModalVisible(true);
            }}
          >
            <MaterialIcons name="add" size={16} color="#3B82F6" />
            <Text style={styles.addPartyText}>Add Previous Party</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Achievements & Summary</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Wikipedia Summary *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea, validationErrors.wikipedia_summary && styles.inputError]}
          value={formData.wikipedia_summary}
          onChangeText={(value) => updateField('wikipedia_summary', value)}
          placeholder="Brief summary of the politician's background and career..."
          multiline
          numberOfLines={4}
        />
        {validationErrors.wikipedia_summary && <Text style={styles.errorText}>{validationErrors.wikipedia_summary}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Key Achievements *</Text>
        <View style={styles.achievementsContainer}>
          {formData.key_achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementItem}>
              <Text style={styles.achievementText}>{achievement}</Text>
              <TouchableOpacity onPress={() => removeAchievement(index)}>
                <MaterialIcons name="close" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addAchievementButton}
            onPress={() => {
              setNewAchievement('');
              setAchievementModalVisible(true);
            }}
          >
            <MaterialIcons name="add" size={16} color="#3B82F6" />
            <Text style={styles.addAchievementText}>Add Achievement</Text>
          </TouchableOpacity>
        </View>
        {validationErrors.key_achievements && <Text style={styles.errorText}>{validationErrors.key_achievements}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Profile Image URL</Text>
        <TextInput
          style={styles.textInput}
          value={formData.image_url}
          onChangeText={(value) => updateField('image_url', value)}
          placeholder="https://example.com/politician-image.jpg"
        />
      </View>
    </View>
  );

  const renderContentManagement = () => (
    <View style={styles.contentManagementSection}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="library-add" size={24} color="#333" />
        <Text style={styles.sectionTitle}>Content Management</Text>
      </View>
      <Text style={styles.sectionDescription}>
        Add additional content to this politician's profile before publishing.
      </Text>

      <View style={styles.contentCardsGrid}>
        {/* Timeline Events Card */}
        <TouchableOpacity
          style={styles.contentCard}
          onPress={() => navigation.navigate('TimelineEvents', { politicianId })}
        >
          <View style={[styles.contentCardIcon, { backgroundColor: '#EFF6FF' }]}>
            <MaterialIcons name="timeline" size={24} color="#3B82F6" />
          </View>
          <View style={styles.contentCardInfo}>
            <Text style={styles.contentCardTitle}>Timeline Events</Text>
            <Text style={styles.contentCardCount}>
              {contentCounts.timeline} {contentCounts.timeline === 1 ? 'event' : 'events'}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        {/* Voting Records Card */}
        <TouchableOpacity
          style={styles.contentCard}
          onPress={() => navigation.navigate('VotingRecordsAdmin', { politicianId })}
        >
          <View style={[styles.contentCardIcon, { backgroundColor: '#FEF3C7' }]}>
            <MaterialIcons name="how-to-vote" size={24} color="#F59E0B" />
          </View>
          <View style={styles.contentCardInfo}>
            <Text style={styles.contentCardTitle}>Voting Records</Text>
            <Text style={styles.contentCardCount}>
              {contentCounts.voting} {contentCounts.voting === 1 ? 'record' : 'records'}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        {/* Documents Card */}
        <TouchableOpacity
          style={styles.contentCard}
          onPress={() => navigation.navigate('DocumentManagement', { politicianId })}
        >
          <View style={[styles.contentCardIcon, { backgroundColor: '#F3E8FF' }]}>
            <MaterialIcons name="description" size={24} color="#A855F7" />
          </View>
          <View style={styles.contentCardInfo}>
            <Text style={styles.contentCardTitle}>Documents</Text>
            <Text style={styles.contentCardCount}>
              {contentCounts.documents} {contentCounts.documents === 1 ? 'document' : 'documents'}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        {/* Promises/Commitments Card */}
        <TouchableOpacity
          style={styles.contentCard}
          onPress={() => navigation.navigate('CommitmentTracking', { politicianId })}
        >
          <View style={[styles.contentCardIcon, { backgroundColor: '#DCFCE7' }]}>
            <MaterialIcons name="task-alt" size={24} color="#10B981" />
          </View>
          <View style={styles.contentCardInfo}>
            <Text style={styles.contentCardTitle}>Promises & Commitments</Text>
            <Text style={styles.contentCardCount}>
              {contentCounts.promises} {contentCounts.promises === 1 ? 'promise' : 'promises'}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        {/* News Card */}
        <TouchableOpacity
          style={styles.contentCard}
          onPress={() => navigation.navigate('NewsManagement', { politicianId })}
        >
          <View style={[styles.contentCardIcon, { backgroundColor: '#FEE2E2' }]}>
            <MaterialIcons name="article" size={24} color="#EF4444" />
          </View>
          <View style={styles.contentCardInfo}>
            <Text style={styles.contentCardTitle}>News & Articles</Text>
            <Text style={styles.contentCardCount}>
              {contentCounts.news} {contentCounts.news === 1 ? 'article' : 'articles'}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        {/* Career Card */}
        <TouchableOpacity
          style={styles.contentCard}
          onPress={() => navigation.navigate('CareerManagement', { politicianId })}
        >
          <View style={[styles.contentCardIcon, { backgroundColor: '#E0E7FF' }]}>
            <MaterialIcons name="work" size={24} color="#6366F1" />
          </View>
          <View style={styles.contentCardInfo}>
            <Text style={styles.contentCardTitle}>Career Information</Text>
            <Text style={styles.contentCardCount}>
              {formData.education || formData.wikipedia_summary || formData.bio ? 'Configured' : 'Not set'}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!originalData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading politician data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleDiscard}
        >
          <MaterialIcons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Edit Politician</Text>
            {isDraft && (
              <View style={styles.draftBadge}>
                <Text style={styles.draftBadgeText}>DRAFT</Text>
              </View>
            )}
          </View>
          {hasChanges && <Text style={styles.headerSubtitle}>Unsaved changes</Text>}
        </View>
        {isDraft ? (
          <TouchableOpacity
            style={styles.publishButton}
            onPress={handlePublish}
          >
            <MaterialIcons name="publish" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRight} />
        )}
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderBasicInfoStep()}
        {currentStep === 2 && renderPositionStep()}
        {currentStep === 3 && renderDetailsStep()}

        {/* Content Management Section - Always visible */}
        {renderContentManagement()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.discardButton}
          onPress={handleDiscard}
        >
          <MaterialIcons name="cancel" size={20} color="#EF4444" />
          <Text style={styles.discardButtonText}>Discard</Text>
        </TouchableOpacity>

        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
              <Text style={styles.prevButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextButton,
              (currentStep === 3 && !hasChanges) && styles.nextButtonDisabled
            ]}
            onPress={nextStep}
            disabled={currentStep === 3 && !hasChanges}
          >
            <Text style={[
              styles.nextButtonText,
              (currentStep === 3 && !hasChanges) && styles.nextButtonTextDisabled
            ]}>
              {currentStep === 3 ? 'Save Changes' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Party History Modal */}
      <Modal
        visible={partyHistoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPartyHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Party to History</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter party name..."
              value={newPartyName}
              onChangeText={setNewPartyName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setPartyHistoryModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={() => {
                  if (newPartyName.trim()) {
                    addPartyHistory(newPartyName.trim());
                    setPartyHistoryModalVisible(false);
                  }
                }}
              >
                <Text style={styles.modalSaveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Education Modal */}
      <Modal
        visible={educationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEducationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Education Background</Text>

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="e.g., PhD in Plant Ecology, University of Nairobi"
              value={newEducation}
              onChangeText={setNewEducation}
              multiline
              numberOfLines={4}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setEducationModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={() => {
                  if (newEducation.trim()) {
                    updateField('education', newEducation.trim());
                    setEducationModalVisible(false);
                  }
                }}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Achievement Modal */}
      <Modal
        visible={achievementModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAchievementModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Achievement</Text>

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Enter achievement..."
              value={newAchievement}
              onChangeText={setNewAchievement}
              multiline
              numberOfLines={3}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setAchievementModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={() => {
                  if (newAchievement.trim()) {
                    addAchievement(newAchievement.trim());
                    setAchievementModalVisible(false);
                  }
                }}
              >
                <Text style={styles.modalSaveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  draftBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  draftBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  publishButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#3B82F6',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#3B82F6',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e9ecef',
    marginHorizontal: 16,
  },
  stepLineActive: {
    backgroundColor: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
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
  suggestionsList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 150,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  partyColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#F59E0B',
  },
  partyHistoryContainer: {
    gap: 8,
  },
  partyHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  partyHistoryText: {
    fontSize: 14,
    color: '#333',
  },
  addPartyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addPartyText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  achievementsContainer: {
    gap: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  achievementText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  addAchievementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addAchievementText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  discardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  discardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  prevButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  prevButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: '#666',
  },
  contentManagementSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    borderTopWidth: 8,
    borderTopColor: '#f8f9fa',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  contentCardsGrid: {
    gap: 12,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  contentCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentCardInfo: {
    flex: 1,
  },
  contentCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contentCardCount: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  modalTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCancelButton: {
    backgroundColor: '#F3F4F6',
  },
  modalSaveButton: {
    backgroundColor: '#3B82F6',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '500',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  educationContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  educationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  addEducationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addEducationText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
});