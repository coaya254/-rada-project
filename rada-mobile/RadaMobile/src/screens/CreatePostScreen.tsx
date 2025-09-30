import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { 
  ArrowLeft, 
  Image, 
  Mic, 
  Hash, 
  Send,
  Eye,
  Clock,
  Volume2,
  Palette,
  Camera,
  FileText,
  X,
  Play,
  Pause,
  Square
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { useAnonMode } from '../contexts/AnonModeContext';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const { user } = useAnonMode();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('civic');
  const [hasVoiceNote, setHasVoiceNote] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState('0:00');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // New state for enhanced features
  const [highlightColor, setHighlightColor] = useState('#FFD700');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackObject, setPlaybackObject] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Advanced options state
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [allowSharing, setAllowSharing] = useState(true);
  const [closeComments, setCloseComments] = useState(false);
  const [allowReactions, setAllowReactions] = useState(true);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('📝');
  const [newCategoryColor, setNewCategoryColor] = useState('#6B7280');
  
  const recordingAnimation = useRef(new Animated.Value(0)).current;

  const [categories, setCategories] = useState([
    { id: 'civic', label: 'Civic', emoji: '🏛️', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    { id: 'education', label: 'Education', emoji: '📚', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    { id: 'health', label: 'Health', emoji: '🏥', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
    { id: 'environment', label: 'Environment', emoji: '🌱', color: '#059669', bgColor: 'rgba(5, 150, 105, 0.1)' },
    { id: 'economy', label: 'Economy', emoji: '💰', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
    { id: 'technology', label: 'Technology', emoji: '💻', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)' },
    { id: 'culture', label: 'Culture', emoji: '🎭', color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
    { id: 'sports', label: 'Sports', emoji: '⚽', color: '#06B6D4', bgColor: 'rgba(6, 182, 212, 0.1)' },
  ]);

  const highlightColors = [
    { name: 'Gold', color: '#FFD700', bg: 'rgba(255, 215, 0, 0.2)' },
    { name: 'Blue', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.2)' },
    { name: 'Green', color: '#10B981', bg: 'rgba(16, 185, 129, 0.2)' },
    { name: 'Purple', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.2)' },
    { name: 'Pink', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.2)' },
    { name: 'Orange', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' },
    { name: 'Red', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.2)' },
    { name: 'Teal', color: '#14B8A6', bg: 'rgba(20, 184, 166, 0.2)' },
    { name: 'Indigo', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.2)' },
    { name: 'Lime', color: '#84CC16', bg: 'rgba(132, 204, 22, 0.2)' },
    { name: 'Cyan', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.2)' },
    { name: 'Rose', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.2)' },
    { name: 'Violet', color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.2)' },
    { name: 'Emerald', color: '#059669', bg: 'rgba(5, 150, 105, 0.2)' },
    { name: 'Amber', color: '#D97706', bg: 'rgba(217, 119, 6, 0.2)' },
    { name: 'Slate', color: '#64748B', bg: 'rgba(100, 116, 139, 0.2)' },
  ];

  const commonEmojis = [
    '📝', '💡', '🎯', '⭐', '🔥', '💎', '🌟', '🚀',
    '🎨', '🎵', '🎬', '📚', '🔬', '💻', '🏠', '🌍',
    '❤️', '🎉', '🎊', '🏆', '🎪', '🎭', '🎨', '🎪'
  ];

  const createNewCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Missing Name', 'Please enter a category name.');
      return;
    }

    const newCategory = {
      id: newCategoryName.toLowerCase().replace(/\s+/g, '_'),
      label: newCategoryName.trim(),
      emoji: newCategoryEmoji,
      color: newCategoryColor,
      bgColor: newCategoryColor + '20'
    };

    // Add to categories array (in a real app, this would be saved to backend)
    setCategories(prev => [...prev, newCategory]);
    
    // Set as selected category
    setCategory(newCategory.id);
    setHighlightColor(newCategory.color);
    
    // Reset form
    setNewCategoryName('');
    setNewCategoryEmoji('📝');
    setNewCategoryColor('#6B7280');
    setShowCreateCategory(false);
    setShowCategoryPicker(false);
    
    Alert.alert('Success!', `Category "${newCategory.label}" created successfully.`);
  };

  const calculateReadTime = (text: string) => {
    if (!text || typeof text !== 'string' || text.length === 0) return '1 min read';
    const wordsPerMinute = 200;
    const wordCount = text.split(' ').filter(word => word.length > 0).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow microphone access to record audio.');
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
      setHasVoiceNote(true);
      
      // Start recording animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Update duration every second
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Store interval for cleanup
      recording._interval = interval;
      
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      recordingAnimation.stopAnimation();
      
      // Clear interval
      if (recording._interval) {
        clearInterval(recording._interval);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      // Format duration
      const minutes = Math.floor(recordingDuration / 60);
      const seconds = recordingDuration % 60;
      setVoiceDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      
      setRecording(null);
      setRecordingDuration(0);
      
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playRecording = async () => {
    if (!recording) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: recording.getURI() },
        { shouldPlay: true }
      );
      
      setPlaybackObject(sound);
      setIsPlaying(true);
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setPlaybackObject(null);
        }
      });
      
    } catch (err) {
      console.error('Failed to play recording', err);
    }
  };

  const stopPlayback = async () => {
    if (playbackObject) {
      await playbackObject.stopAsync();
      setIsPlaying(false);
      setPlaybackObject(null);
    }
  };

  // Image picker functions
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImages(prev => [...prev, ...result.assets]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImages(prev => [...prev, result.assets[0]]);
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Content', 'Please add both a title and content to your post.');
      return;
    }

    if (!user?.uuid) {
      Alert.alert('Authentication Error', 'Please log in to create posts.');
      return;
    }

    setIsPublishing(true);

    try {
      // Create post data for the backend API
      const postData = {
        uuid: user.uuid,
        type: category, // Use the selected category instead of hardcoded 'story'
        title: title.trim(),
        content: content.trim(),
        fullContent: content.trim(), // Same as content for now
        county: user.county || 'Nairobi', // Use user's county or default
        tags: JSON.stringify([category, isAnonymous ? 'anonymous' : 'public']),
        hasVoiceNote: hasVoiceNote.toString(),
        voiceDuration: voiceDuration,
        isAnonymous: isAnonymous.toString(),
        highlightColor: highlightColor,
        images: selectedImages.map(img => img.uri),
        audioUri: recording ? recording.getURI() : null,
        allowSharing: allowSharing.toString(),
        closeComments: closeComments.toString(),
        allowReactions: allowReactions.toString()
      };

      console.log('Publishing post to backend:', postData);
      
      // Send to backend
      const response = await apiService.createPost(postData);
      
      console.log('Post published successfully:', response);
      
      Alert.alert(
        'Post Published! 🎉',
        'Your post has been shared with the community.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to community screen
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error publishing post:', error);
      Alert.alert(
        'Publishing Failed',
        'There was an error publishing your post. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          onPress={handlePublish}
          style={[styles.publishButton, (!title.trim() || !content.trim() || isPublishing) && styles.publishButtonDisabled]}
          disabled={!title.trim() || !content.trim() || isPublishing}
        >
          {isPublishing ? (
            <Text style={styles.publishButtonText}>Publishing...</Text>
          ) : (
            <Send size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Preview Section */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewUserInfo}>
                <View style={styles.previewAvatar}>
                  <Text style={styles.previewAvatarText}>
                    {isAnonymous ? '👤' : '🌸'}
                  </Text>
                </View>
                                 <View style={styles.previewUserDetails}>
                   <Text style={styles.previewUserName}>
                     {isAnonymous ? 'Anonymous User' : (user?.nickname || 'User')}
                   </Text>
                   <Text style={styles.previewUserHandle}>
                     {isAnonymous ? '@anonymous' : (user?.handle || '@user')} • now
                   </Text>
                 </View>
              </View>
              <View style={styles.previewHeaderRight}>
                <View style={[
                  styles.previewCategoryBadge,
                  { backgroundColor: categories.find(c => c.id === category)?.bgColor }
                ]}>
                  <Text style={[
                    styles.previewCategoryText,
                    { color: categories.find(c => c.id === category)?.color }
                  ]}>
                    {categories.find(c => c.id === category)?.emoji} {categories.find(c => c.id === category)?.label}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.previewContent}>
              {title && (
                <View style={[styles.previewTitleContainer, { backgroundColor: highlightColor + '20' }]}>
                  <Text style={styles.previewTitle}>"{title}"</Text>
                </View>
              )}
              <Text style={styles.previewText}>
                {content || 'Your content will appear here...'}
              </Text>
            </View>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Content</Text>
          
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <View style={styles.titleHeader}>
            <Text style={styles.inputLabel}>Post Title</Text>
              <TouchableOpacity
                style={styles.titleColorPicker}
                onPress={() => setShowColorPicker(true)}
              >
                <View style={[styles.titleColorPreview, { backgroundColor: highlightColor }]} />
                <Palette size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.titleInput}
              placeholder="What's your post about?"
              value={title}
              onChangeText={setTitle}
              multiline
              maxLength={100}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          {/* Content Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Post Content</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Share your thoughts, experiences, or ideas with the community..."
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={2000}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{content.length}/2000</Text>
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity
              style={styles.categoryDropdown}
              onPress={() => setShowCategoryPicker(true)}
            >
              <View style={styles.categoryDropdownContent}>
                <View style={styles.categoryDropdownLeft}>
                  <Text style={styles.categoryDropdownEmoji}>
                    {categories.find(c => c.id === category)?.emoji}
                  </Text>
                  <Text style={styles.categoryDropdownText}>
                    {categories.find(c => c.id === category)?.label}
                  </Text>
                </View>
                <Text style={styles.categoryDropdownChevron}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Media Tools */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Add Media</Text>
            <View style={styles.mediaToolsRow}>
              <TouchableOpacity
                style={styles.mediaToolButton}
                onPress={() => setShowMediaOptions(true)}
              >
                <Image size={20} color="#3b82f6" />
                <Text style={styles.mediaToolText}>Photos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.mediaToolButton}
                onPress={takePhoto}
              >
                <Camera size={20} color="#10b981" />
                <Text style={styles.mediaToolText}>Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.mediaToolButton, isRecording && styles.recordingButton]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Animated.View style={{ transform: [{ scale: recordingAnimation }] }}>
                  <Mic size={20} color={isRecording ? "#ef4444" : "#8b5cf6"} />
                </Animated.View>
                <Text style={[styles.mediaToolText, isRecording && styles.recordingText]}>
                  {isRecording ? 'Stop' : 'Record'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Audio Recording Controls */}
          {hasVoiceNote && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Voice Note</Text>
              <View style={styles.audioControls}>
                <View style={styles.audioInfo}>
                  <Volume2 size={16} color="#3b82f6" />
                  <Text style={styles.audioDuration}>{voiceDuration}</Text>
                </View>
                <View style={styles.audioButtons}>
                  {recording && (
                    <>
                      <TouchableOpacity
                        style={styles.audioButton}
                        onPress={isPlaying ? stopPlayback : playRecording}
                      >
                        {isPlaying ? <Pause size={16} color="#fff" /> : <Play size={16} color="#fff" />}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.audioButton, styles.deleteButton]}
                        onPress={() => {
                          setHasVoiceNote(false);
                          setRecording(null);
                          setVoiceDuration('0:00');
                          setRecordingDuration(0);
                        }}
                      >
                        <X size={16} color="#fff" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Selected Images */}
          {selectedImages.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Selected Images ({selectedImages.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreview}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.imageItem}>
                    <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Advanced Options Toggle */}
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={[styles.advancedToggleRow, showAdvancedOptions && styles.advancedToggleRowActive]}
              onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              <View style={styles.advancedToggleInfo}>
                <View style={[styles.advancedToggleIcon, showAdvancedOptions && styles.advancedToggleIconActive]}>
                  <Hash size={18} color={showAdvancedOptions ? "#3b82f6" : "#6b7280"} />
                </View>
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.toggleTitle, showAdvancedOptions && { color: "#3b82f6" }]}>
                    Advanced Options
                  </Text>
                  <Text style={styles.toggleSubtitle}>
                    {showAdvancedOptions ? 'Tap to collapse' : 'Privacy, sharing, and interaction settings'}
                  </Text>
                </View>
              </View>
              <View style={[styles.chevron, showAdvancedOptions && styles.chevronRotated]}>
                <Text style={[styles.chevronText, showAdvancedOptions && { color: "#3b82f6" }]}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <View style={styles.advancedOptionsContainer}>
              <View style={styles.advancedOptionsHeader}>
                <Text style={styles.advancedOptionsTitle}>Privacy & Interaction Settings</Text>
                <Text style={styles.advancedOptionsSubtitle}>Control how others can interact with your post</Text>
              </View>
              
              {/* Anonymous Toggle */}
              <View style={styles.advancedOption}>
                <TouchableOpacity
                  style={[styles.toggleRow, isAnonymous && styles.toggleRowActive]}
                  onPress={() => setIsAnonymous(!isAnonymous)}
                >
                  <View style={styles.toggleInfo}>
                    <View style={[styles.toggleIcon, isAnonymous && styles.toggleIconActive]}>
                      <Eye size={18} color={isAnonymous ? "#ef4444" : "#6b7280"} />
                    </View>
                    <View style={styles.toggleTextContainer}>
                      <Text style={[styles.toggleTitle, isAnonymous && { color: "#ef4444" }]}>
                        Post Anonymously
                      </Text>
                      <Text style={styles.toggleSubtitle}>Hide your identity from this post</Text>
                    </View>
                  </View>
                  <View style={[styles.toggle, isAnonymous && styles.toggleActive]}>
                    <View style={[styles.toggleThumb, isAnonymous && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Allow Sharing Toggle */}
              <View style={styles.advancedOption}>
                <TouchableOpacity
                  style={[styles.toggleRow, allowSharing && styles.toggleRowActive]}
                  onPress={() => setAllowSharing(!allowSharing)}
                >
                  <View style={styles.toggleInfo}>
                    <View style={[styles.toggleIcon, allowSharing && styles.toggleIconActive]}>
                      <Share2 size={18} color={allowSharing ? "#10b981" : "#6b7280"} />
                    </View>
                    <View style={styles.toggleTextContainer}>
                      <Text style={[styles.toggleTitle, allowSharing && { color: "#10b981" }]}>
                        Allow Sharing
                      </Text>
                      <Text style={styles.toggleSubtitle}>Let others share your post</Text>
                    </View>
                  </View>
                  <View style={[styles.toggle, allowSharing && styles.toggleActive]}>
                    <View style={[styles.toggleThumb, allowSharing && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Close Comments Toggle */}
              <View style={styles.advancedOption}>
                <TouchableOpacity
                  style={[styles.toggleRow, closeComments && styles.toggleRowActive]}
                  onPress={() => setCloseComments(!closeComments)}
                >
                  <View style={styles.toggleInfo}>
                    <View style={[styles.toggleIcon, closeComments && styles.toggleIconActive]}>
                      <MessageCircle size={18} color={closeComments ? "#f59e0b" : "#6b7280"} />
                    </View>
                    <View style={styles.toggleTextContainer}>
                      <Text style={[styles.toggleTitle, closeComments && { color: "#f59e0b" }]}>
                        Close Comments
                      </Text>
                      <Text style={styles.toggleSubtitle}>Disable comments on this post</Text>
                    </View>
                  </View>
                  <View style={[styles.toggle, closeComments && styles.toggleActive]}>
                    <View style={[styles.toggleThumb, closeComments && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Allow Reactions Toggle */}
              <View style={styles.advancedOption}>
                <TouchableOpacity
                  style={[styles.toggleRow, allowReactions && styles.toggleRowActive]}
                  onPress={() => setAllowReactions(!allowReactions)}
                >
                  <View style={styles.toggleInfo}>
                    <View style={[styles.toggleIcon, allowReactions && styles.toggleIconActive]}>
                      <Heart size={18} color={allowReactions ? "#ec4899" : "#6b7280"} />
                    </View>
                    <View style={styles.toggleTextContainer}>
                      <Text style={[styles.toggleTitle, allowReactions && { color: "#ec4899" }]}>
                        Allow Reactions
                      </Text>
                      <Text style={styles.toggleSubtitle}>Let others like and react to your post</Text>
                    </View>
                  </View>
                  <View style={[styles.toggle, allowReactions && styles.toggleActive]}>
                    <View style={[styles.toggleThumb, allowReactions && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Highlight Color</Text>
              <TouchableOpacity
                onPress={() => setShowColorPicker(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.colorGrid}>
              {highlightColors.map((colorOption) => (
                <TouchableOpacity
                  key={colorOption.name}
                  style={[
                    styles.colorOption,
                    { backgroundColor: colorOption.bg },
                    highlightColor === colorOption.color && styles.colorOptionSelected
                  ]}
                  onPress={() => {
                    setHighlightColor(colorOption.color);
                    setShowColorPicker(false);
                  }}
                >
                  <View style={[styles.colorCircle, { backgroundColor: colorOption.color }]} />
                  <Text style={styles.colorName}>{colorOption.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Media Options Modal */}
      <Modal
        visible={showMediaOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMediaOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Photos</Text>
              <TouchableOpacity
                onPress={() => setShowMediaOptions(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mediaOptions}>
              <TouchableOpacity
                style={styles.mediaOption}
                onPress={() => {
                  pickImage();
                  setShowMediaOptions(false);
                }}
              >
                <Image size={32} color="#3b82f6" />
                <Text style={styles.mediaOptionText}>Choose from Library</Text>
                <Text style={styles.mediaOptionSubtext}>Select multiple photos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.mediaOption}
                onPress={() => {
                  takePhoto();
                  setShowMediaOptions(false);
                }}
              >
                <Camera size={32} color="#10b981" />
                <Text style={styles.mediaOptionText}>Take Photo</Text>
                <Text style={styles.mediaOptionSubtext}>Use camera to capture</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Category</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryModalScroll}
              contentContainerStyle={styles.categoryModalContent}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryModalCard,
                    { backgroundColor: cat.bgColor },
                    category === cat.id && { 
                      backgroundColor: cat.color + '20',
                      borderColor: cat.color,
                      borderWidth: 2
                    }
                  ]}
                  onPress={() => {
                    setCategory(cat.id);
                    setHighlightColor(cat.color);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.categoryModalEmoji}>{cat.emoji}</Text>
                  <Text style={[
                    styles.categoryModalLabel,
                    category === cat.id && { color: cat.color, fontWeight: '600' }
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {/* Create New Category Button */}
              <TouchableOpacity
                style={styles.createCategoryCard}
                onPress={() => {
                  setShowCategoryPicker(false);
                  setShowCreateCategory(true);
                }}
              >
                <Text style={styles.createCategoryEmoji}>➕</Text>
                <Text style={styles.createCategoryLabel}>New</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create Category Modal */}
      <Modal
        visible={showCreateCategory}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateCategory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Category</Text>
            <TouchableOpacity
                onPress={() => setShowCreateCategory(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
                </View>
            
            <ScrollView style={styles.createCategoryContent} showsVerticalScrollIndicator={false}>
              {/* Category Name */}
              <View style={styles.createCategorySection}>
                <Text style={styles.createCategoryLabel}>Category Name</Text>
                <TextInput
                  style={styles.createCategoryInput}
                  placeholder="Enter category name"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  maxLength={20}
                />
              </View>

              {/* Emoji Selection */}
              <View style={styles.createCategorySection}>
                <Text style={styles.createCategoryLabel}>Choose Emoji</Text>
                <View style={styles.emojiInputContainer}>
                  <TextInput
                    style={styles.emojiInput}
                    placeholder="Choose emoji"
                    value={newCategoryEmoji}
                    onChangeText={setNewCategoryEmoji}
                    maxLength={2}
                    keyboardType="default"
                  />
              </View>
                
                {/* Quick emoji suggestions */}
                <View style={styles.emojiSuggestions}>
                  <Text style={styles.emojiSuggestionsLabel}>Quick picks:</Text>
                  <View style={styles.emojiSuggestionsRow}>
                    {commonEmojis.slice(0, 8).map((emoji, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.emojiSuggestion,
                          newCategoryEmoji === emoji && styles.emojiSuggestionSelected
                        ]}
                        onPress={() => setNewCategoryEmoji(emoji)}
                      >
                        <Text style={styles.emojiSuggestionText}>{emoji}</Text>
            </TouchableOpacity>
                    ))}
                  </View>
                </View>
          </View>

              {/* Color Selection */}
              <View style={styles.createCategorySection}>
                <Text style={styles.createCategoryLabel}>Choose Color</Text>
                <View style={styles.createCategoryColorGrid}>
                  {highlightColors.map((colorOption) => (
            <TouchableOpacity
                      key={colorOption.name}
                      style={[
                        styles.createCategoryColorOption,
                        { backgroundColor: colorOption.bg },
                        newCategoryColor === colorOption.color && styles.createCategoryColorSelected
                      ]}
                      onPress={() => setNewCategoryColor(colorOption.color)}
                    >
                      <View style={[styles.createCategoryColorCircle, { backgroundColor: colorOption.color }]} />
                      <Text style={styles.createCategoryColorName}>{colorOption.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Preview */}
              <View style={styles.createCategorySection}>
                <Text style={styles.createCategoryLabel}>Preview</Text>
                <View style={[
                  styles.createCategoryPreview,
                  { backgroundColor: newCategoryColor + '20', borderColor: newCategoryColor }
                ]}>
                  <Text style={styles.createCategoryPreviewEmoji}>{newCategoryEmoji}</Text>
                  <Text style={[
                    styles.createCategoryPreviewText,
                    { color: newCategoryColor }
                  ]}>
                    {newCategoryName || 'Category Name'}
                  </Text>
              </View>
              </View>

              {/* Create Button */}
              <TouchableOpacity
                style={[
                  styles.createCategoryButton,
                  !newCategoryName.trim() && styles.createCategoryButtonDisabled
                ]}
                onPress={createNewCategory}
                disabled={!newCategoryName.trim()}
              >
                <Text style={styles.createCategoryButtonText}>Create Category</Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  
  publishButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  publishButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  
  publishButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  content: {
    flex: 1,
  },
  
  previewSection: {
    padding: 16,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.3)',
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
  },
  
  previewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 12,
  },
  
  previewAvatarText: {
    fontSize: 18,
  },
  
  previewUserDetails: {
    flex: 1,
  },
  
  previewUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  
  previewUserHandle: {
    fontSize: 12,
    color: '#6b7280',
  },
  
  previewHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  previewCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  
  previewCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  
  previewReadTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  previewReadTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  
  previewVoiceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  previewVoiceText: {
    fontSize: 12,
    color: '#3b82f6',
  },
  
  previewContent: {
    padding: 16,
  },
  
  previewTitleContainer: {
    borderLeftWidth: 2,
    borderLeftColor: '#64748b',
    paddingLeft: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(254, 240, 138, 0.3)',
    paddingVertical: 8,
  },
  
  previewTitle: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#475569',
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  
  previewText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  
  formSection: {
    padding: 16,
    paddingTop: 0,
  },
  
  inputGroup: {
    marginBottom: 24,
  },
  
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  
  titleInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    minHeight: 60,
  },
  
  contentInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    minHeight: 120,
  },
  
  charCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  
  titleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  titleColorPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    gap: 6,
  },

  titleColorPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  
  categoryDropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },

  categoryDropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryDropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  categoryDropdownEmoji: {
    fontSize: 20,
  },

  categoryDropdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },

  categoryDropdownChevron: {
    fontSize: 20,
    color: '#6b7280',
    transform: [{ rotate: '90deg' }],
  },

  categoryModalScroll: {
    paddingHorizontal: 20,
  },

  categoryModalContent: {
    paddingVertical: 20,
    gap: 12,
  },
  
  categoryModalCard: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 8,
  },
  
  categoryModalEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  
  categoryModalLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  toggleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  
  toggleSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  
  toggleActive: {
    backgroundColor: '#3b82f6',
  },
  
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },

  // New styles for enhanced features
  colorPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },

  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },

  colorPickerText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },

  mediaToolsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  mediaToolButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },

  mediaToolText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },

  recordingButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },

  recordingText: {
    color: '#ef4444',
  },

  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },

  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  audioDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0369a1',
  },

  audioButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  audioButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteButton: {
    backgroundColor: '#ef4444',
  },

  imagePreview: {
    flexDirection: 'row',
  },

  imageItem: {
    position: 'relative',
    marginRight: 8,
  },

  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },

  removeImageButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },

  modalCloseButton: {
    padding: 4,
  },

  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },

  colorOption: {
    width: (width - 80) / 4,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  colorOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#dbeafe',
  },

  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
  },

  colorName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },

  mediaOptions: {
    padding: 20,
    gap: 16,
  },

  mediaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 16,
  },

  mediaOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },

  mediaOptionSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Advanced options styles
  advancedToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },

  advancedToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  chevron: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '0deg' }],
  },

  chevronRotated: {
    transform: [{ rotate: '90deg' }],
  },

  chevronText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '300',
  },

  advancedOptionsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  advancedOption: {
    marginBottom: 16,
  },

  // Enhanced advanced options styles
  advancedToggleRowActive: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },

  advancedToggleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  advancedToggleIconActive: {
    backgroundColor: '#dbeafe',
  },

  advancedOptionsHeader: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
  },

  advancedOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },

  advancedOptionsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },

  toggleRowActive: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  toggleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  toggleIconActive: {
    backgroundColor: '#f0f9ff',
  },

  // Create category styles
  createCategoryCard: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    backgroundColor: '#f9fafb',
  },

  createCategoryEmoji: {
    fontSize: 20,
    marginBottom: 4,
    color: '#6b7280',
  },

  createCategoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
  },

  createCategoryContent: {
    padding: 20,
  },

  createCategorySection: {
    marginBottom: 24,
  },

  createCategoryInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    fontSize: 16,
    color: '#374151',
    marginTop: 8,
  },

  emojiInputContainer: {
    marginTop: 8,
  },

  emojiInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    color: '#374151',
  },



  emojiSuggestions: {
    marginTop: 12,
  },

  emojiSuggestionsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },

  emojiSuggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  emojiSuggestion: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  emojiSuggestionSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },

  emojiSuggestionText: {
    fontSize: 16,
  },

  createCategoryColorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },

  createCategoryColorOption: {
    width: (width - 80) / 4,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  createCategoryColorSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#dbeafe',
  },

  createCategoryColorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 4,
  },

  createCategoryColorName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#374151',
  },

  createCategoryPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 8,
    gap: 12,
  },

  createCategoryPreviewEmoji: {
    fontSize: 20,
  },

  createCategoryPreviewText: {
    fontSize: 16,
    fontWeight: '500',
  },

  createCategoryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },

  createCategoryButtonDisabled: {
    backgroundColor: '#9ca3af',
  },

  createCategoryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },


});
