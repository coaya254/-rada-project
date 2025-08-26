import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Dimensions,
  Switch,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const ContentCreatorModal = ({ isVisible, onClose, contentType = 'story', user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
    location: '',
    is_anonymous: false,
    allow_comments: true,
    allow_sharing: true,
    template: '',
  });
  const [errors, setErrors] = useState({});
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const categories = [
    { value: 'general', label: 'General', icon: '🌍' },
    { value: 'government', label: 'Government', icon: '🏛️' },
    { value: 'rights', label: 'Rights & Responsibilities', icon: '⚖️' },
    { value: 'community', label: 'Community', icon: '👥' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'environment', label: 'Environment', icon: '🌱' },
    { value: 'justice', label: 'Justice', icon: '⚖️' },
    { value: 'economy', label: 'Economy', icon: '💰' },
    { value: 'transport', label: 'Transport', icon: '🚌' },
  ];

  const kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta',
    'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi',
    'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga',
    'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans-Nzoia',
    'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru',
    'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma',
    'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'
  ];

  const contentTypeConfig = {
    story: {
      icon: '✍️',
      title: 'Share Your Civic Story',
      placeholder: 'Share your civic experience, observation, or insight...',
      description: 'Tell us about something you witnessed, experienced, or learned about civic engagement.',
      templates: [
        { name: 'Personal Experience', text: 'Today I experienced...' },
        { name: 'Community Observation', text: 'I noticed in my community...' },
        { name: 'Learning Moment', text: 'I learned something important about...' },
      ],
      xpReward: 25,
      mediaRequired: false,
    },
    poem: {
      icon: '📝',
      title: 'Share Civic Poetry',
      placeholder: 'Express your civic thoughts through poetry...',
      description: 'Use creative expression to share your thoughts on civic matters.',
      templates: [
        { name: 'Free Verse', text: 'Write your thoughts freely...' },
        { name: 'Haiku', text: 'Three lines: 5-7-5 syllables...' },
        { name: 'Rhyming', text: 'Create a rhyming poem about...' },
      ],
      xpReward: 25,
      mediaRequired: false,
    },
    evidence: {
      icon: '📊',
      title: 'Submit Evidence',
      placeholder: 'Provide details about this evidence...',
      description: 'Document important information with supporting media.',
      templates: [
        { name: 'Issue Report', text: 'I am reporting an issue with...' },
        { name: 'Documentation', text: 'This document shows...' },
        { name: 'Photo Evidence', text: 'This photo demonstrates...' },
      ],
      xpReward: 35,
      mediaRequired: true,
    },
    report: {
      icon: '🎯',
      title: 'Submit Report',
      placeholder: 'Describe what you want to report...',
      description: 'Report issues, suggestions, or important information.',
      templates: [
        { name: 'Problem Report', text: 'I am reporting a problem with...' },
        { name: 'Suggestion', text: 'I suggest that we...' },
        { name: 'Complaint', text: 'I would like to complain about...' },
      ],
      xpReward: 30,
      mediaRequired: false,
    },
  };

  const config = contentTypeConfig[contentType];

  useEffect(() => {
    if (isVisible) {
      resetForm();
      detectLocation();
      startAnimations();
    }
  }, [isVisible, contentType]);

  useEffect(() => {
    if (formData.content.length > 10) {
      generateSuggestedTags();
    }
  }, [formData.content]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      tags: '',
      location: '',
      is_anonymous: false,
      allow_comments: true,
      allow_sharing: true,
      template: '',
    });
    setErrors({});
    setMediaFiles([]);
    setSuggestedTags([]);
    setShowAdvanced(false);
  };

  const detectLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (address[0]?.region) {
          const county = address[0].region;
          if (kenyanCounties.includes(county)) {
            setFormData(prev => ({ ...prev, location: county }));
          }
        }
      }
    } catch (error) {
      console.log('Location detection failed:', error);
    }
  };

  const generateSuggestedTags = () => {
    const content = formData.content.toLowerCase();
    const suggestions = [];
    
    // Government-related tags
    if (content.includes('government') || content.includes('official')) suggestions.push('government');
    if (content.includes('vote') || content.includes('election')) suggestions.push('voting');
    if (content.includes('right') || content.includes('freedom')) suggestions.push('rights');
    if (content.includes('community') || content.includes('neighbor')) suggestions.push('community');
    if (content.includes('education') || content.includes('school')) suggestions.push('education');
    if (content.includes('health') || content.includes('hospital')) suggestions.push('healthcare');
    if (content.includes('environment') || content.includes('pollution')) suggestions.push('environment');
    if (content.includes('justice') || content.includes('court')) suggestions.push('justice');
    if (content.includes('money') || content.includes('economy')) suggestions.push('economy');
    if (content.includes('transport') || content.includes('road')) suggestions.push('transport');
    
    setSuggestedTags(suggestions.slice(0, 5));
  };

  const addTag = (tag) => {
    const currentTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ');
      setFormData(prev => ({ ...prev, tags: newTags }));
    }
  };

  const removeTag = (tagToRemove) => {
    const currentTags = formData.tags.split(',').map(t => t.trim()).filter(t => t !== tagToRemove);
    setFormData(prev => ({ ...prev, tags: currentTags.join(', ') }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setMediaFiles(prev => [...prev, { ...result.assets[0], type: 'image' }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setMediaFiles(prev => [...prev, { ...result.assets[0], type: 'document' }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permission to record audio');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      clearInterval(recordingTimer);
      setRecordingTimer(null);
      
      if (uri) {
        setMediaFiles(prev => [...prev, { uri, type: 'audio', duration: recordingTime }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const applyTemplate = (template) => {
    setFormData(prev => ({ ...prev, content: template.text, template: template.name }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.location) newErrors.location = 'Location is required';
    
    if (config.mediaRequired && mediaFiles.length === 0) {
      newErrors.media = 'Media is required for this content type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateXPReward = () => {
    let baseXP = config.xpReward;
    
    // Bonus XP for media
    if (mediaFiles.length > 0) baseXP += 10;
    if (mediaFiles.length > 2) baseXP += 5; // Extra bonus for multiple media
    
    // Bonus XP for location
    if (formData.location) baseXP += 5;
    
    // Bonus XP for tags
    const tagCount = formData.tags.split(',').filter(t => t.trim()).length;
    if (tagCount > 0) baseXP += tagCount * 2;
    
    return baseXP;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      const contentData = {
        ...formData,
        content_type: contentType,
        user_id: user?.uuid || user?.id,
        media_files: mediaFiles,
        xp_reward: calculateXPReward(),
        created_at: new Date().toISOString(),
      };

      const response = await apiService.post('/api/content/create', contentData);
      
      if (response.success) {
        Alert.alert(
          'Success!',
          `Your ${contentType} has been submitted successfully! You earned ${calculateXPReward()} XP.`,
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to submit content');
      }
    } catch (error) {
      console.error('Error submitting content:', error);
      Alert.alert('Error', 'Failed to submit content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <LinearGradient colors={['#FF6B6B', '#4ECDC4']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <Text style={styles.headerIcon}>{config.icon}</Text>
              <Text style={styles.headerTitleText}>{config.title}</Text>
            </View>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={isLoading}>
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Content Type Description */}
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{config.description}</Text>
            </View>

            {/* Content Templates */}
            <View style={styles.templatesSection}>
              <Text style={styles.sectionTitle}>📋 Quick Templates</Text>
              <View style={styles.templatesGrid}>
                {config.templates.map((template, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.templateCard}
                    onPress={() => applyTemplate(template)}
                  >
                    <Text style={styles.templateName}>{template.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="Enter a compelling title..."
                placeholderTextColor="#999"
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            {/* Content Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Content *</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.content && styles.inputError]}
                value={formData.content}
                onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
                placeholder={config.placeholder}
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              {errors.content && <Text style={styles.errorText}>{errors.content}</Text>}
            </View>

            {/* Smart Tags */}
            {suggestedTags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.label}>Suggested Tags</Text>
                <View style={styles.suggestedTags}>
                  {suggestedTags.map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestedTag}
                      onPress={() => addTag(tag)}
                    >
                      <Text style={styles.suggestedTagText}>+ {tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Tags Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags (optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.tags}
                onChangeText={(text) => setFormData(prev => ({ ...prev, tags: text }))}
                placeholder="Enter tags separated by commas..."
                placeholderTextColor="#999"
              />
              {formData.tags && (
                <View style={styles.currentTags}>
                  {formData.tags.split(',').map((tag, index) => {
                    const trimmedTag = tag.trim();
                    return trimmedTag ? (
                      <TouchableOpacity
                        key={index}
                        style={styles.currentTag}
                        onPress={() => removeTag(trimmedTag)}
                      >
                        <Text style={styles.currentTagText}>{trimmedTag} ✕</Text>
                      </TouchableOpacity>
                    ) : null;
                  })}
                </View>
              )}
            </View>

            {/* Category and Location Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    style={styles.picker}
                  >
                    {categories.map((category) => (
                      <Picker.Item 
                        key={category.value} 
                        label={`${category.icon} ${category.label}`} 
                        value={category.value} 
                      />
                    ))}
                  </Picker>
                </View>
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Location *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.location}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                    style={styles.picker}
                  >
                    <Picker.Item label="📍 Select county" value="" />
                    {kenyanCounties.map((county) => (
                      <Picker.Item key={county} label={county} value={county} />
                    ))}
                  </Picker>
                </View>
                {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
              </View>
            </View>

            {/* Media Section */}
            <View style={styles.mediaSection}>
              <Text style={styles.mediaLabel}>
                📎 Media Attachments {config.mediaRequired ? '*' : '(optional)'}
              </Text>
              
              {/* Media Actions */}
              <View style={styles.mediaActions}>
                <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                  <Text style={styles.mediaButtonText}>📷 Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.mediaButton} onPress={pickDocument}>
                  <Text style={styles.mediaButtonText}>📄 Document</Text>
                </TouchableOpacity>
                
                {!isRecording ? (
                  <TouchableOpacity style={styles.mediaButton} onPress={startRecording}>
                    <Text style={styles.mediaButtonText}>🎙️ Record</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                    <Text style={styles.stopButtonText}>⏹️ Stop ({formatTime(recordingTime)})</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Media Files Display */}
              {mediaFiles.length > 0 && (
                <View style={styles.mediaFiles}>
                  {mediaFiles.map((file, index) => (
                    <View key={index} style={styles.mediaFile}>
                      <Text style={styles.mediaFileText}>
                        {file.type === 'image' ? '📷' : file.type === 'audio' ? '🎵' : '📄'} 
                        {file.type === 'audio' ? `Audio (${formatTime(file.duration || 0)})` : 
                         file.type === 'image' ? 'Image' : 'Document'}
                      </Text>
                      <TouchableOpacity 
                        style={styles.removeMediaButton} 
                        onPress={() => removeMedia(index)}
                      >
                        <Text style={styles.removeMediaButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              
              {errors.media && <Text style={styles.errorText}>{errors.media}</Text>}
            </View>

            {/* Advanced Options Toggle */}
            <TouchableOpacity 
              style={styles.advancedToggle}
              onPress={() => setShowAdvanced(!showAdvanced)}
            >
              <Text style={styles.advancedToggleText}>
                {showAdvanced ? '▼' : '▶'} Advanced Options
              </Text>
            </TouchableOpacity>

            {/* Advanced Options */}
            {showAdvanced && (
              <Animated.View 
                style={[
                  styles.advancedSection,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <Text style={styles.sectionTitle}>Privacy & Sharing</Text>
                
                <View style={styles.privacyOption}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setFormData(prev => ({ ...prev, is_anonymous: !prev.is_anonymous }))}
                  >
                    <Text style={styles.checkboxText}>
                      {formData.is_anonymous ? '☑️' : '☐'} Post anonymously
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.privacyOption}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setFormData(prev => ({ ...prev, allow_comments: !prev.allow_comments }))}
                  >
                    <Text style={styles.checkboxText}>
                      {formData.allow_comments ? '☑️' : '☐'} Allow comments
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.privacyOption}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setFormData(prev => ({ ...prev, allow_sharing: !prev.allow_sharing }))}
                  >
                    <Text style={styles.checkboxText}>
                      {formData.allow_sharing ? '☑️' : '☐'} Allow sharing
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {/* XP Reward Info */}
            <View style={styles.xpInfo}>
              <Text style={styles.xpInfoText}>
                💎 Base XP: {config.xpReward} | Total XP: {calculateXPReward()}
              </Text>
              <Text style={styles.xpBreakdown}>
                +10 for media • +5 for location • +2 per tag
              </Text>
            </View>
          </View>
        </ScrollView>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Submitting your content...</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTitleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  descriptionCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    lineHeight: 20,
  },
  templatesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  templatesGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  templateCard: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
  },
  templateName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  tagsSection: {
    marginBottom: 20,
  },
  suggestedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestedTag: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  suggestedTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  currentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  currentTag: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  currentTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  picker: {
    height: 50,
  },
  mediaSection: {
    marginBottom: 20,
  },
  mediaLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  mediaActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  mediaButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  mediaButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  mediaFiles: {
    gap: 8,
  },
  mediaFile: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaFileText: {
    fontSize: 14,
    color: '#666',
  },
  removeMediaButton: {
    backgroundColor: '#FF6B6B',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  advancedToggle: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  advancedToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  advancedSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  privacyOption: {
    marginBottom: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 14,
    color: '#666',
  },
  xpInfo: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  xpInfoText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  xpBreakdown: {
    fontSize: 12,
    color: '#388E3C',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },
});

export default ContentCreatorModal;
