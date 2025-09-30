import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface PoliticianFormData {
  // Basic Information
  fullName: string;
  currentPosition: string;
  politicalParty: string;
  constituency: string;
  dateOfBirth: string;
  placeOfBirth: string;
  
  // Contact & Social
  email: string;
  phone: string;
  website: string;
  twitter: string;
  facebook: string;
  
  // Education & Career
  education: string;
  previousPositions: string;
  keyAchievements: string;
  partyHistory: string;
  
  // Performance Metrics
  attendanceRate: string;
  partyLoyalty: string;
  totalVotes: string;
  controversialVotes: string;
  
  // Media & Status
  profileImage: string | null;
  verificationStatus: 'draft' | 'pending_review' | 'verified' | 'flagged';
  dataSources: string;
  adminNotes: string;
  
  // Campaign Promises
  campaignPromises: Array<{
    promise: string;
    status: 'pending' | 'in_progress' | 'completed' | 'broken';
    datePromised: string;
    context: string;
    sources: string;
  }>;
}

interface EnhancedPoliticianFormProps {
  politician?: any;
  onClose: () => void;
  onSave: (data: PoliticianFormData) => void;
}

const EnhancedPoliticianForm: React.FC<EnhancedPoliticianFormProps> = ({
  politician,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<PoliticianFormData>({
    // Basic Information
    fullName: politician?.name || '',
    currentPosition: politician?.current_position || '',
    politicalParty: politician?.party_history?.[0] || '',
    constituency: politician?.constituency || '',
    dateOfBirth: politician?.dateOfBirth || '',
    placeOfBirth: politician?.placeOfBirth || '',
    
    // Contact & Social
    email: politician?.email || '',
    phone: politician?.phone || '',
    website: politician?.website || '',
    twitter: politician?.twitter || '',
    facebook: politician?.facebook || '',
    
    // Education & Career
    education: politician?.education || '',
    previousPositions: politician?.previousPositions || '',
    keyAchievements: politician?.key_achievements?.join('\n') || '',
    partyHistory: politician?.party_history?.join(', ') || '',
    
    // Performance Metrics
    attendanceRate: politician?.attendanceRate || '',
    partyLoyalty: politician?.partyLoyalty || '',
    totalVotes: politician?.totalVotes || '',
    controversialVotes: politician?.controversialVotes || '',
    
    // Media & Status
    profileImage: politician?.image_url || null,
    verificationStatus: politician?.verificationStatus || 'draft',
    dataSources: politician?.dataSources || '',
    adminNotes: politician?.adminNotes || '',
    
    // Campaign Promises
    campaignPromises: politician?.campaignPromises || [
      { promise: '', status: 'pending', datePromised: '', context: '', sources: '' }
    ]
  });

  const [activeSection, setActiveSection] = useState('basic');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: keyof PoliticianFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addPromise = () => {
    setFormData(prev => ({
      ...prev,
      campaignPromises: [
        ...prev.campaignPromises,
        { promise: '', status: 'pending', datePromised: '', context: '', sources: '' }
      ]
    }));
  };

  const updatePromise = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      campaignPromises: prev.campaignPromises.map((promise, i) => 
        i === index ? { ...promise, [field]: value } : promise
      )
    }));
  };

  const removePromise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      campaignPromises: prev.campaignPromises.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.currentPosition.trim()) newErrors.currentPosition = 'Current position is required';
    if (!formData.politicalParty.trim()) newErrors.politicalParty = 'Political party is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: 'person' },
    { id: 'contact', label: 'Contact', icon: 'mail' },
    { id: 'career', label: 'Career', icon: 'briefcase' },
    { id: 'performance', label: 'Performance', icon: 'checkmark-circle' },
    { id: 'promises', label: 'Promises', icon: 'flag' },
    { id: 'media', label: 'Media & Status', icon: 'camera' }
  ];

  const renderBasicInfo = () => (
    <View style={styles.sectionContent}>
      <View style={styles.formGrid}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            placeholder="Enter full name"
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Current Position *</Text>
          <TextInput
            style={[styles.input, errors.currentPosition && styles.inputError]}
            value={formData.currentPosition}
            onChangeText={(value) => handleInputChange('currentPosition', value)}
            placeholder="e.g., Speaker of the Senate"
          />
          {errors.currentPosition && <Text style={styles.errorText}>{errors.currentPosition}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Political Party *</Text>
          <View style={[styles.selectContainer, errors.politicalParty && styles.inputError]}>
            <TextInput
              style={styles.selectInput}
              value={formData.politicalParty}
              onChangeText={(value) => handleInputChange('politicalParty', value)}
              placeholder="e.g., UDA, ODM, Jubilee"
            />
          </View>
          {errors.politicalParty && <Text style={styles.errorText}>{errors.politicalParty}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Constituency</Text>
          <TextInput
            style={styles.input}
            value={formData.constituency}
            onChangeText={(value) => handleInputChange('constituency', value)}
            placeholder="e.g., Kilifi North"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={formData.dateOfBirth}
            onChangeText={(value) => handleInputChange('dateOfBirth', value)}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Place of Birth</Text>
          <TextInput
            style={styles.input}
            value={formData.placeOfBirth}
            onChangeText={(value) => handleInputChange('placeOfBirth', value)}
            placeholder="Enter place of birth"
          />
        </View>
      </View>
    </View>
  );

  const renderContactInfo = () => (
    <View style={styles.sectionContent}>
      <View style={styles.formGrid}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="email@example.com"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            placeholder="+254 700 000 000"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            value={formData.website}
            onChangeText={(value) => handleInputChange('website', value)}
            placeholder="https://website.com"
            keyboardType="url"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Twitter Handle</Text>
          <TextInput
            style={styles.input}
            value={formData.twitter}
            onChangeText={(value) => handleInputChange('twitter', value)}
            placeholder="@username"
          />
        </View>

        <View style={[styles.formGroup, styles.fullWidth]}>
          <Text style={styles.label}>Facebook Profile</Text>
          <TextInput
            style={styles.input}
            value={formData.facebook}
            onChangeText={(value) => handleInputChange('facebook', value)}
            placeholder="https://facebook.com/username"
            keyboardType="url"
          />
        </View>
      </View>
    </View>
  );

  const renderCareerInfo = () => (
    <View style={styles.sectionContent}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Education Background</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.education}
          onChangeText={(value) => handleInputChange('education', value)}
          placeholder="List educational qualifications, universities, degrees, etc."
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Previous Positions</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.previousPositions}
          onChangeText={(value) => handleInputChange('previousPositions', value)}
          placeholder="List previous political positions with dates"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Key Achievements</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.keyAchievements}
          onChangeText={(value) => handleInputChange('keyAchievements', value)}
          placeholder="List major achievements, one per line"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Party History</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.partyHistory}
          onChangeText={(value) => handleInputChange('partyHistory', value)}
          placeholder="List party affiliations with years (e.g., UDA 2022-present)"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderPerformanceMetrics = () => (
    <View style={styles.sectionContent}>
      <View style={styles.formGrid}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Attendance Rate (%)</Text>
          <TextInput
            style={styles.input}
            value={formData.attendanceRate}
            onChangeText={(value) => handleInputChange('attendanceRate', value)}
            placeholder="95"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Party Loyalty (%)</Text>
          <TextInput
            style={styles.input}
            value={formData.partyLoyalty}
            onChangeText={(value) => handleInputChange('partyLoyalty', value)}
            placeholder="80"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Total Votes Cast</Text>
          <TextInput
            style={styles.input}
            value={formData.totalVotes}
            onChangeText={(value) => handleInputChange('totalVotes', value)}
            placeholder="150"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Controversial Votes</Text>
          <TextInput
            style={styles.input}
            value={formData.controversialVotes}
            onChangeText={(value) => handleInputChange('controversialVotes', value)}
            placeholder="5"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Performance Notes</Text>
        <Text style={styles.infoSubtitle}>
          Add context for these metrics - sources, calculation methods, or notable voting patterns
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Additional context about performance metrics..."
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderPromises = () => (
    <View style={styles.sectionContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Campaign Promises</Text>
        <TouchableOpacity style={styles.addButton} onPress={addPromise}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add Promise</Text>
        </TouchableOpacity>
      </View>

      {formData.campaignPromises.map((promise, index) => (
        <View key={index} style={styles.promiseCard}>
          <View style={styles.promiseHeader}>
            <Text style={styles.promiseNumber}>Promise #{index + 1}</Text>
            {formData.campaignPromises.length > 1 && (
              <TouchableOpacity onPress={() => removePromise(index)}>
                <Ionicons name="close" size={16} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.promiseContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Promise Statement</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={promise.promise}
                onChangeText={(value) => updatePromise(index, 'promise', value)}
                placeholder="Describe the promise made to voters"
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.formGrid}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.selectContainer}>
                  <TextInput
                    style={styles.selectInput}
                    value={promise.status}
                    onChangeText={(value) => updatePromise(index, 'status', value)}
                    placeholder="pending/in_progress/completed/broken"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date Promised</Text>
                <TextInput
                  style={styles.input}
                  value={promise.datePromised}
                  onChangeText={(value) => updatePromise(index, 'datePromised', value)}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Context</Text>
                <TextInput
                  style={styles.input}
                  value={promise.context}
                  onChangeText={(value) => updatePromise(index, 'context', value)}
                  placeholder="e.g., Campaign Rally"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Sources</Text>
              <TextInput
                style={styles.input}
                value={promise.sources}
                onChangeText={(value) => updatePromise(index, 'sources', value)}
                placeholder="List sources separated by commas"
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderMediaStatus = () => (
    <View style={styles.sectionContent}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Profile Image</Text>
        <View style={styles.imageUploadContainer}>
          <View style={styles.imagePreview}>
            {formData.profileImage ? (
              <Image source={{ uri: formData.profileImage }} style={styles.imagePreview} />
            ) : (
              <Ionicons name="camera" size={24} color="#9ca3af" />
            )}
          </View>
          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="cloud-upload" size={16} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.uploadHint}>JPG, PNG up to 5MB</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Verification Status</Text>
        <View style={styles.selectContainer}>
          <TextInput
            style={styles.selectInput}
            value={formData.verificationStatus}
            onChangeText={(value) => handleInputChange('verificationStatus', value)}
            placeholder="draft/pending_review/verified/flagged"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Data Sources</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.dataSources}
          onChangeText={(value) => handleInputChange('dataSources', value)}
          placeholder="List all sources used to verify this information"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.adminNotesBox}>
        <Text style={styles.adminNotesTitle}>
          <Ionicons name="warning" size={16} color="#f59e0b" />
          Admin Notes
        </Text>
        <TextInput
          style={[styles.input, styles.textArea, styles.adminNotesInput]}
          value={formData.adminNotes}
          onChangeText={(value) => handleInputChange('adminNotes', value)}
          placeholder="Internal notes for other admins..."
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'basic': return renderBasicInfo();
      case 'contact': return renderContactInfo();
      case 'career': return renderCareerInfo();
      case 'performance': return renderPerformanceMetrics();
      case 'promises': return renderPromises();
      case 'media': return renderMediaStatus();
      default: return renderBasicInfo();
    }
  };

  const getProgressPercentage = () => {
    const totalFields = 15; // Approximate number of main fields
    const filledFields = Object.values(formData).filter(value => 
      value && value.toString().trim() !== ''
    ).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>
              {politician ? 'Edit Politician' : 'Add New Politician'}
            </Text>
            <Text style={styles.sidebarSubtitle}>Complete all required fields</Text>
          </View>

          <ScrollView style={styles.navigation}>
            {sections.map(section => (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.navItem,
                  activeSection === section.id && styles.navItemActive
                ]}
                onPress={() => setActiveSection(section.id)}
              >
                <Ionicons 
                  name={section.icon as any} 
                  size={18} 
                  color={activeSection === section.id ? '#3b82f6' : '#6b7280'} 
                />
                <Text style={[
                  styles.navText,
                  activeSection === section.id && styles.navTextActive
                ]}>
                  {section.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Form Progress</Text>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>{getProgressPercentage()}% Complete</Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {sections.find(s => s.id === activeSection)?.label}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {renderActiveSection()}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <View style={styles.footerActions}>
              <TouchableOpacity 
                style={styles.draftButton}
                onPress={() => handleInputChange('verificationStatus', 'draft')}
              >
                <Text style={styles.draftButtonText}>Save as Draft</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                <Ionicons name="save" size={16} color="#fff" />
                <Text style={styles.saveButtonText}>Save & Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#f9fafb',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    padding: 20,
  },
  sidebarHeader: {
    marginBottom: 24,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  sidebarSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  navigation: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 12,
  },
  navTextActive: {
    color: '#3b82f6',
  },
  progressSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  progressLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionContent: {
    flex: 1,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  formGroup: {
    width: '48%',
    marginBottom: 16,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  selectInput: {
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  promiseCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  promiseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promiseNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  promiseContent: {
    flex: 1,
  },
  imageUploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePreview: {
    width: 80,
    height: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  uploadHint: {
    fontSize: 12,
    color: '#6b7280',
  },
  adminNotesBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  adminNotesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400e',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminNotesInput: {
    backgroundColor: '#fff',
    borderColor: '#fbbf24',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  draftButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  draftButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default EnhancedPoliticianForm;

