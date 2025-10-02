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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Politician } from '../../types';
import adminAPI from '../../services/AdminAPIService';

interface CreatePoliticianScreenProps {
  navigation: NativeStackNavigationProp<any, 'CreatePolitician'>;
}

interface FormData extends Omit<Politician, 'id'> {
  id?: number;
}

export const CreatePoliticianScreen: React.FC<CreatePoliticianScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [partyInput, setPartyInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [formData, setFormData] = useState<FormData>({
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
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});

  // Smart suggestions based on input
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

  const positionTemplates = {
    'President': 'President of the Republic of Kenya',
    'Deputy President': 'Deputy President of the Republic of Kenya',
    'Governor': 'Governor of [County] County',
    'Senator': 'Senator for [County]',
    'MP': 'Member of Parliament for [Constituency]',
    'Minister': 'Cabinet Secretary for [Ministry]',
    'Opposition Leader': 'Leader of the Opposition',
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  // Smart party color assignment
  useEffect(() => {
    if (formData.party) {
      const party = kenyanParties.find(p =>
        p.name.toLowerCase() === formData.party.toLowerCase() ||
        p.fullName.toLowerCase().includes(formData.party.toLowerCase())
      );
      if (party) {
        setFormData(prev => ({ ...prev, party_color: party.color }));
      }
    }
  }, [formData.party]);

  // Validation functions
  const validateCurrentStep = () => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Basic Info
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.party.trim()) errors.party = 'Party is required';
        if (!formData.constituency.trim()) errors.constituency = 'Constituency is required';
        break;

      case 2: // Position & Role
        if (!formData.current_position.trim()) errors.current_position = 'Current position is required';
        if (!formData.education.trim()) errors.education = 'Education is required';
        break;

      case 3: // Achievements & Summary
        if (!formData.wikipedia_summary?.trim()) errors.wikipedia_summary = 'Summary is required';
        if (formData.key_achievements.length === 0) errors.key_achievements = 'At least one achievement is required';
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
    if (validateCurrentStep()) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step - show preview
        setShowPreview(true);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveDraft = async () => {
    try {
      // Basic validation for draft
      if (!formData.name.trim()) {
        Alert.alert('Error', 'Please enter a name before saving draft.');
        return;
      }

      setIsSavingDraft(true);

      // Prepare politician data for API
      const politicianData = {
        name: formData.name,
        party: formData.party || 'TBD',
        position: formData.title || formData.current_position || 'TBD',
        bio: formData.wikipedia_summary,
        image_url: formData.image_url,
        is_draft: true // Saving as draft
      };

      const response = await adminAPI.createPolitician(politicianData);

      if (response.success && response.data && response.data.success) {
        // Use setTimeout to ensure alert shows
        setTimeout(() => {
          Alert.alert(
            '✓ Draft Saved',
            `${formData.name}'s profile has been saved as draft.`,
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack()
              }
            ]
          );
        }, 100);
      } else {
        throw new Error(response.error || 'Failed to save draft');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save draft. Please try again.';

      // Check if it's a duplicate error
      if (errorMessage.includes('already exists')) {
        Alert.alert(
          '⚠️ Duplicate Politician',
          errorMessage,
          [
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
      console.error('Save draft error:', error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const publishPolitician = async () => {
    try {
      // Validate all fields before creating draft
      if (!formData.name.trim() || !formData.title.trim() || !formData.party.trim()) {
        Alert.alert('Error', 'Please fill in all required fields before saving.');
        return;
      }

      setIsPublishing(true);

      // Prepare politician data for API (always save as draft initially)
      const politicianData = {
        name: formData.name,
        party: formData.party,
        position: formData.title || formData.current_position,
        bio: formData.wikipedia_summary,
        image_url: formData.image_url,
        is_draft: true // Always save as draft from create screen
      };

      const response = await adminAPI.createPolitician(politicianData);
      console.log('Create draft response:', response);

      if (response.success && response.data && response.data.success) {
        console.log('Success - navigating to edit screen');
        const politicianId = response.data.data.id;

        // Close preview first
        setShowPreview(false);

        // Show success toast and navigate immediately
        Alert.alert(
          '✓ Draft Created',
          `${formData.name}'s profile has been created. Now add content before publishing.`,
          [{ text: 'OK' }]
        );

        // Navigate to edit screen immediately
        setTimeout(() => {
          navigation.navigate('EditPolitician', { politicianId });
        }, 500);
      } else {
        console.log('Failed - response:', response);
        throw new Error(response.error || 'Failed to create politician draft');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create politician. Please try again.';

      // Check if it's a duplicate error
      if (errorMessage.includes('already exists')) {
        Alert.alert(
          '⚠️ Duplicate Politician',
          errorMessage,
          [
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
      console.error('Create draft error:', error);
    } finally {
      setIsPublishing(false);
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

      {formData.slug && (
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={16} color="#3B82F6" />
          <Text style={styles.infoText}>Auto-generated URL: /politician/{formData.slug}</Text>
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
        <TextInput
          style={[styles.textInput, validationErrors.education && styles.inputError]}
          value={formData.education}
          onChangeText={(value) => updateField('education', value)}
          placeholder="e.g., PhD in Plant Ecology, University of Nairobi"
          multiline
          numberOfLines={3}
        />
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
            onPress={() => setShowPartyModal(true)}
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
            onPress={() => setShowAchievementModal(true)}
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
        <Text style={styles.headerTitle}>Create Politician</Text>
        <TouchableOpacity
          style={styles.previewButton}
          onPress={() => setShowPreview(true)}
        >
          <MaterialIcons name="preview" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderBasicInfoStep()}
        {currentStep === 2 && renderPositionStep()}
        {currentStep === 3 && renderDetailsStep()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.draftButton, isSavingDraft && styles.disabledButton]}
          onPress={saveDraft}
          disabled={isSavingDraft}
        >
          <MaterialIcons name="save" size={20} color="#666" />
          <Text style={styles.draftButtonText}>
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </Text>
        </TouchableOpacity>

        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
              <Text style={styles.prevButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>
              {currentStep === 3 ? 'Preview' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <TouchableOpacity
              style={styles.previewCloseButton}
              onPress={() => setShowPreview(false)}
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.previewTitle}>Preview</Text>
            <TouchableOpacity
              style={[styles.publishButton, isPublishing && styles.disabledButton]}
              onPress={publishPolitician}
              disabled={isPublishing}
            >
              <Text style={styles.publishButtonText}>
                {isPublishing ? 'Creating...' : 'Create Draft'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.previewContent}>
            <View style={styles.previewCard}>
              {/* Enhanced Card Header with Image */}
              <View style={styles.cardHeader}>
                <View style={styles.politicianImageContainer}>
                  {formData.image_url ? (
                    <Image
                      source={{ uri: formData.image_url }}
                      style={styles.politicianImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[
                      styles.politicianImagePlaceholder,
                      { backgroundColor: formData.party_color || '#6b7280' }
                    ]}>
                      <Text style={styles.politicianInitial}>
                        {formData.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.onlineIndicator} />
                </View>

                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.enhancedPoliticianName}>{formData.name}</Text>
                  <Text style={styles.enhancedPoliticianTitle}>
                    {formData.title || formData.current_position}
                  </Text>
                  <Text style={styles.enhancedPoliticianConstituency}>
                    {formData.party}
                  </Text>
                </View>
              </View>

              {/* Party Badge and Rating */}
              <View style={styles.cardBody}>
                <View style={styles.partyInfo}>
                  <View style={[
                    styles.partyBadge,
                    { backgroundColor: formData.party_color || '#6b7280' }
                  ]}>
                    <Text style={styles.partyText}>{formData.party}</Text>
                  </View>
                  <Text style={styles.ratingText}>
                    Rating: N/A
                  </Text>
                </View>

                {/* Bio Preview */}
                {formData.wikipedia_summary && (
                  <View style={styles.bioContainer}>
                    <Text style={styles.bioText} numberOfLines={2}>
                      {formData.wikipedia_summary}
                    </Text>
                  </View>
                )}
              </View>

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.cardFooterLeft}>
                  <MaterialIcons name="star" size={14} color="#666" />
                  <Text style={styles.cardFooterText}>Rating: N/A</Text>
                </View>
                <View style={styles.cardFooterRight}>
                  <Text style={styles.viewProfileText}>View Profile</Text>
                  <MaterialIcons name="chevron-right" size={14} color="#667eea" />
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Add Party Modal */}
      <Modal
        visible={showPartyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPartyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inputModal}>
            <Text style={styles.inputModalTitle}>Add Previous Party</Text>
            <TextInput
              style={styles.inputModalInput}
              value={partyInput}
              onChangeText={setPartyInput}
              placeholder="Enter party name (e.g., Jubilee)"
              autoFocus
            />
            <View style={styles.inputModalButtons}>
              <TouchableOpacity
                style={[styles.inputModalButton, styles.inputModalCancelButton]}
                onPress={() => {
                  setShowPartyModal(false);
                  setPartyInput('');
                }}
              >
                <Text style={styles.inputModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.inputModalButton, styles.inputModalAddButton]}
                onPress={() => {
                  if (partyInput.trim()) {
                    addPartyHistory(partyInput.trim());
                    setShowPartyModal(false);
                    setPartyInput('');
                  }
                }}
              >
                <Text style={styles.inputModalAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Achievement Modal */}
      <Modal
        visible={showAchievementModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAchievementModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inputModal}>
            <Text style={styles.inputModalTitle}>Add Key Achievement</Text>
            <TextInput
              style={[styles.inputModalInput, styles.inputModalTextArea]}
              value={achievementInput}
              onChangeText={setAchievementInput}
              placeholder="Enter achievement description..."
              multiline
              numberOfLines={3}
              autoFocus
            />
            <View style={styles.inputModalButtons}>
              <TouchableOpacity
                style={[styles.inputModalButton, styles.inputModalCancelButton]}
                onPress={() => {
                  setShowAchievementModal(false);
                  setAchievementInput('');
                }}
              >
                <Text style={styles.inputModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.inputModalButton, styles.inputModalAddButton]}
                onPress={() => {
                  if (achievementInput.trim()) {
                    addAchievement(achievementInput.trim());
                    setShowAchievementModal(false);
                    setAchievementInput('');
                  }
                }}
              >
                <Text style={styles.inputModalAddText}>Add</Text>
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
  previewButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
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
    backgroundColor: '#f0f4ff',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#3B82F6',
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
  draftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  draftButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
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
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  previewCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  publishButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  publishButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  previewContent: {
    flex: 1,
    padding: 24,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  // Enhanced Card Header Styles
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
    minHeight: 100,
  },
  politicianImageContainer: {
    position: 'relative',
    marginRight: 16,
    width: 80,
    height: '100%',
    minHeight: 100,
  },
  politicianImage: {
    width: 80,
    height: '100%',
    borderRadius: 12,
    elevation: 2,
  },
  politicianImagePlaceholder: {
    width: 80,
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  politicianInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  enhancedPoliticianName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a202c',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  enhancedPoliticianTitle: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '700',
    marginBottom: 2,
  },
  enhancedPoliticianConstituency: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  cardBody: {
    marginBottom: 12,
    marginLeft: 96,
  },
  partyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  partyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  partyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  bioContainer: {
    marginTop: 12,
  },
  bioText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardFooterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  cardFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewProfileText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  // Input Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inputModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  inputModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputModalInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  inputModalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  inputModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  inputModalCancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  inputModalAddButton: {
    backgroundColor: '#3B82F6',
  },
  inputModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  inputModalAddText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});