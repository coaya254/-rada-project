import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import { ContentModule, ContentLesson, ContentQuiz } from '../types/ContentManagementTypes';
import apiService from '../services/api';

const ContentEditorScreen: React.FC<any> = ({ route, navigation }) => {
  const { user } = useAnonMode();
  const { contentType, contentId } = route.params;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<any>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);

  const tabs = [
    { key: 'basic', label: 'Basic Info', icon: 'info-circle' },
    { key: 'content', label: 'Content', icon: 'file-text' },
    { key: 'settings', label: 'Settings', icon: 'cog' },
    { key: 'preview', label: 'Preview', icon: 'eye' },
  ];

  useEffect(() => {
    loadContent();
  }, [contentId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      if (contentId) {
        // Load existing content
        // const response = await apiService.getContent(contentType, contentId);
        // setContent(response.data);
        
        // Mock data for now
        const mockContent = getMockContent();
        setContent(mockContent);
      } else {
        // Create new content
        const newContent = getDefaultContent();
        setContent(newContent);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      Alert.alert('Error', 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const getMockContent = () => {
    switch (contentType) {
      case 'module':
        return {
          id: contentId,
          title: 'Constitution Basics',
          description: 'Learn the fundamental principles of constitutional law',
          shortDescription: 'Fundamental constitutional principles',
          category: 'Law',
          difficulty: 'beginner',
          estimatedDuration: 120,
          isPublished: true,
          isFeatured: false,
          order: 1,
          coverImage: '',
          tags: ['constitution', 'law', 'basics'],
          prerequisites: [],
          learningObjectives: ['Understand constitutional principles', 'Apply legal concepts'],
        };
      case 'lesson':
        return {
          id: contentId,
          moduleId: 1,
          title: 'Introduction to Constitution',
          description: 'Basic concepts and historical context',
          content: 'The constitution is the fundamental law of the land...',
          type: 'text',
          duration: 15,
          order: 1,
          isPublished: true,
          isRequired: true,
          xp: 25,
          resources: [],
          keyPoints: ['Historical context', 'Basic principles'],
          prerequisites: [],
        };
      case 'quiz':
        return {
          id: contentId,
          lessonId: 1,
          title: 'Constitution Basics Quiz',
          description: 'Test your understanding of constitutional principles',
          questions: [],
          timeLimit: 10,
          passingScore: 70,
          maxAttempts: 3,
          isPublished: true,
          order: 1,
        };
      default:
        return {};
    }
  };

  const getDefaultContent = () => {
    switch (contentType) {
      case 'module':
        return {
          title: '',
          description: '',
          shortDescription: '',
          category: '',
          difficulty: 'beginner',
          estimatedDuration: 0,
          isPublished: false,
          isFeatured: false,
          order: 0,
          coverImage: '',
          tags: [],
          prerequisites: [],
          learningObjectives: [],
        };
      case 'lesson':
        return {
          moduleId: 0,
          title: '',
          description: '',
          content: '',
          type: 'text',
          duration: 0,
          order: 0,
          isPublished: false,
          isRequired: false,
          xp: 0,
          resources: [],
          keyPoints: [],
          prerequisites: [],
        };
      case 'quiz':
        return {
          lessonId: 0,
          title: '',
          description: '',
          questions: [],
          timeLimit: 0,
          passingScore: 70,
          maxAttempts: 3,
          isPublished: false,
          order: 0,
        };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // API call to save content
      // await apiService.saveContent(contentType, content);
      console.log('Saving content:', content);
      Alert.alert('Success', 'Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      Alert.alert('Error', 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    Alert.alert(
      'Publish Content',
      'Are you sure you want to publish this content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            try {
              setSaving(true);
              const updatedContent = { ...content, isPublished: true };
              setContent(updatedContent);
              // await apiService.publishContent(contentType, contentId);
              Alert.alert('Success', 'Content published successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to publish content');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const updateContent = (field: string, value: any) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const renderBasicInfo = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput
            style={styles.textInput}
            value={content.title || ''}
            onChangeText={(value) => updateContent('title', value)}
            placeholder="Enter title..."
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={content.description || ''}
            onChangeText={(value) => updateContent('description', value)}
            placeholder="Enter description..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
          />
        </View>

        {contentType === 'module' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Short Description</Text>
              <TextInput
                style={styles.textInput}
                value={content.shortDescription || ''}
                onChangeText={(value) => updateContent('shortDescription', value)}
                placeholder="Brief description for cards..."
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.textInput}
                value={content.category || ''}
                onChangeText={(value) => updateContent('category', value)}
                placeholder="e.g., Law, Civics, History..."
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Difficulty</Text>
              <View style={styles.difficultyContainer}>
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      content.difficulty === level && styles.difficultyButtonActive,
                    ]}
                    onPress={() => updateContent('difficulty', level)}
                  >
                    <Text
                      style={[
                        styles.difficultyButtonText,
                        content.difficulty === level && styles.difficultyButtonTextActive,
                      ]}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Estimated Duration (minutes)</Text>
              <TextInput
                style={styles.textInput}
                value={content.estimatedDuration?.toString() || ''}
                onChangeText={(value) => updateContent('estimatedDuration', parseInt(value) || 0)}
                placeholder="120"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
          </>
        )}

        {contentType === 'lesson' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.textInput}
                value={content.duration?.toString() || ''}
                onChangeText={(value) => updateContent('duration', parseInt(value) || 0)}
                placeholder="15"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>XP Reward</Text>
              <TextInput
                style={styles.textInput}
                value={content.xp?.toString() || ''}
                onChangeText={(value) => updateContent('xp', parseInt(value) || 0)}
                placeholder="25"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Content Type</Text>
              <View style={styles.typeContainer}>
                {['text', 'video', 'interactive', 'quiz', 'assignment'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      content.type === type && styles.typeButtonActive,
                    ]}
                    onPress={() => updateContent('type', type)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        content.type === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {contentType === 'quiz' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time Limit (minutes)</Text>
              <TextInput
                style={styles.textInput}
                value={content.timeLimit?.toString() || ''}
                onChangeText={(value) => updateContent('timeLimit', parseInt(value) || 0)}
                placeholder="10"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Passing Score (%)</Text>
              <TextInput
                style={styles.textInput}
                value={content.passingScore?.toString() || ''}
                onChangeText={(value) => updateContent('passingScore', parseInt(value) || 70)}
                placeholder="70"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Max Attempts</Text>
              <TextInput
                style={styles.textInput}
                value={content.maxAttempts?.toString() || ''}
                onChangeText={(value) => updateContent('maxAttempts', parseInt(value) || 3)}
                placeholder="3"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );

  const renderContent = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Main Content</Text>
          <TextInput
            style={[styles.textInput, styles.textArea, styles.contentEditor]}
            value={content.content || ''}
            onChangeText={(value) => updateContent('content', value)}
            placeholder="Enter your content here..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
          />
        </View>

        {contentType === 'module' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Learning Objectives</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={content.learningObjectives?.join('\n') || ''}
              onChangeText={(value) => updateContent('learningObjectives', value.split('\n').filter(obj => obj.trim()))}
              placeholder="Enter learning objectives (one per line)..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
            />
          </View>
        )}

        {contentType === 'lesson' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Key Points</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={content.keyPoints?.join('\n') || ''}
              onChangeText={(value) => updateContent('keyPoints', value.split('\n').filter(obj => obj.trim()))}
              placeholder="Enter key points (one per line)..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Publishing Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Published</Text>
            <Text style={styles.settingDescription}>
              Make this content visible to users
            </Text>
          </View>
          <Switch
            value={content.isPublished || false}
            onValueChange={(value) => updateContent('isPublished', value)}
            trackColor={{ false: '#e2e8f0', true: '#667eea' }}
            thumbColor={content.isPublished ? '#ffffff' : '#f4f4f4'}
          />
        </View>

        {contentType === 'module' && (
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Featured</Text>
              <Text style={styles.settingDescription}>
                Show this module prominently
              </Text>
            </View>
            <Switch
              value={content.isFeatured || false}
              onValueChange={(value) => updateContent('isFeatured', value)}
              trackColor={{ false: '#e2e8f0', true: '#667eea' }}
              thumbColor={content.isFeatured ? '#ffffff' : '#f4f4f4'}
            />
          </View>
        )}

        {contentType === 'lesson' && (
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Required</Text>
              <Text style={styles.settingDescription}>
                This lesson must be completed
              </Text>
            </View>
            <Switch
              value={content.isRequired || false}
              onValueChange={(value) => updateContent('isRequired', value)}
              trackColor={{ false: '#e2e8f0', true: '#667eea' }}
              thumbColor={content.isRequired ? '#ffffff' : '#f4f4f4'}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Order</Text>
          <TextInput
            style={styles.textInput}
            value={content.order?.toString() || ''}
            onChangeText={(value) => updateContent('order', parseInt(value) || 0)}
            placeholder="1"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tags (comma-separated)</Text>
          <TextInput
            style={styles.textInput}
            value={content.tags?.join(', ') || ''}
            onChangeText={(value) => updateContent('tags', value.split(',').map(tag => tag.trim()).filter(tag => tag))}
            placeholder="constitution, law, basics"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderPreview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preview</Text>
        
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{content.title || 'Untitled'}</Text>
          <Text style={styles.previewDescription}>{content.description || 'No description'}</Text>
          
          {contentType === 'module' && (
            <View style={styles.previewMeta}>
              <Text style={styles.previewMetaText}>
                {content.estimatedDuration || 0} min • {content.difficulty || 'beginner'}
              </Text>
            </View>
          )}
          
          {contentType === 'lesson' && (
            <View style={styles.previewMeta}>
              <Text style={styles.previewMetaText}>
                {content.duration || 0} min • {content.xp || 0} XP
              </Text>
            </View>
          )}
          
          {contentType === 'quiz' && (
            <View style={styles.previewMeta}>
              <Text style={styles.previewMetaText}>
                {content.timeLimit || 0} min • {content.passingScore || 70}% pass
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic': return renderBasicInfo();
      case 'content': return renderContent();
      case 'settings': return renderSettings();
      case 'preview': return renderPreview();
      default: return renderBasicInfo();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {contentId ? 'Edit' : 'Create'} {contentType}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? '#667eea' : '#64748b'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        {renderTabContent()}
      </KeyboardAvoidingView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.previewButton}
          onPress={() => setShowPreview(true)}
        >
          <Icon name="eye" size={16} color="#667eea" />
          <Text style={styles.previewButtonText}>Preview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.publishButton}
          onPress={handlePublish}
          disabled={saving}
        >
          <Icon name="eye" size={16} color="white" />
          <Text style={styles.publishButtonText}>
            {saving ? 'Publishing...' : 'Publish'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeTab: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#667eea',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  contentEditor: {
    minHeight: 200,
    fontFamily: 'monospace',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  difficultyButtonTextActive: {
    color: 'white',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  typeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  previewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewMetaText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#667eea',
    backgroundColor: 'white',
  },
  previewButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  publishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#667eea',
  },
  publishButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default ContentEditorScreen;

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import { ContentModule, ContentLesson, ContentQuiz } from '../types/ContentManagementTypes';
import apiService from '../services/api';

const ContentEditorScreen: React.FC<any> = ({ route, navigation }) => {
  const { user } = useAnonMode();
  const { contentType, contentId } = route.params;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<any>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);

  const tabs = [
    { key: 'basic', label: 'Basic Info', icon: 'info-circle' },
    { key: 'content', label: 'Content', icon: 'file-text' },
    { key: 'settings', label: 'Settings', icon: 'cog' },
    { key: 'preview', label: 'Preview', icon: 'eye' },
  ];

  useEffect(() => {
    loadContent();
  }, [contentId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      if (contentId) {
        // Load existing content
        // const response = await apiService.getContent(contentType, contentId);
        // setContent(response.data);
        
        // Mock data for now
        const mockContent = getMockContent();
        setContent(mockContent);
      } else {
        // Create new content
        const newContent = getDefaultContent();
        setContent(newContent);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      Alert.alert('Error', 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const getMockContent = () => {
    switch (contentType) {
      case 'module':
        return {
          id: contentId,
          title: 'Constitution Basics',
          description: 'Learn the fundamental principles of constitutional law',
          shortDescription: 'Fundamental constitutional principles',
          category: 'Law',
          difficulty: 'beginner',
          estimatedDuration: 120,
          isPublished: true,
          isFeatured: false,
          order: 1,
          coverImage: '',
          tags: ['constitution', 'law', 'basics'],
          prerequisites: [],
          learningObjectives: ['Understand constitutional principles', 'Apply legal concepts'],
        };
      case 'lesson':
        return {
          id: contentId,
          moduleId: 1,
          title: 'Introduction to Constitution',
          description: 'Basic concepts and historical context',
          content: 'The constitution is the fundamental law of the land...',
          type: 'text',
          duration: 15,
          order: 1,
          isPublished: true,
          isRequired: true,
          xp: 25,
          resources: [],
          keyPoints: ['Historical context', 'Basic principles'],
          prerequisites: [],
        };
      case 'quiz':
        return {
          id: contentId,
          lessonId: 1,
          title: 'Constitution Basics Quiz',
          description: 'Test your understanding of constitutional principles',
          questions: [],
          timeLimit: 10,
          passingScore: 70,
          maxAttempts: 3,
          isPublished: true,
          order: 1,
        };
      default:
        return {};
    }
  };

  const getDefaultContent = () => {
    switch (contentType) {
      case 'module':
        return {
          title: '',
          description: '',
          shortDescription: '',
          category: '',
          difficulty: 'beginner',
          estimatedDuration: 0,
          isPublished: false,
          isFeatured: false,
          order: 0,
          coverImage: '',
          tags: [],
          prerequisites: [],
          learningObjectives: [],
        };
      case 'lesson':
        return {
          moduleId: 0,
          title: '',
          description: '',
          content: '',
          type: 'text',
          duration: 0,
          order: 0,
          isPublished: false,
          isRequired: false,
          xp: 0,
          resources: [],
          keyPoints: [],
          prerequisites: [],
        };
      case 'quiz':
        return {
          lessonId: 0,
          title: '',
          description: '',
          questions: [],
          timeLimit: 0,
          passingScore: 70,
          maxAttempts: 3,
          isPublished: false,
          order: 0,
        };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // API call to save content
      // await apiService.saveContent(contentType, content);
      console.log('Saving content:', content);
      Alert.alert('Success', 'Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      Alert.alert('Error', 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    Alert.alert(
      'Publish Content',
      'Are you sure you want to publish this content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            try {
              setSaving(true);
              const updatedContent = { ...content, isPublished: true };
              setContent(updatedContent);
              // await apiService.publishContent(contentType, contentId);
              Alert.alert('Success', 'Content published successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to publish content');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const updateContent = (field: string, value: any) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const renderBasicInfo = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput
            style={styles.textInput}
            value={content.title || ''}
            onChangeText={(value) => updateContent('title', value)}
            placeholder="Enter title..."
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={content.description || ''}
            onChangeText={(value) => updateContent('description', value)}
            placeholder="Enter description..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
          />
        </View>

        {contentType === 'module' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Short Description</Text>
              <TextInput
                style={styles.textInput}
                value={content.shortDescription || ''}
                onChangeText={(value) => updateContent('shortDescription', value)}
                placeholder="Brief description for cards..."
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.textInput}
                value={content.category || ''}
                onChangeText={(value) => updateContent('category', value)}
                placeholder="e.g., Law, Civics, History..."
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Difficulty</Text>
              <View style={styles.difficultyContainer}>
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      content.difficulty === level && styles.difficultyButtonActive,
                    ]}
                    onPress={() => updateContent('difficulty', level)}
                  >
                    <Text
                      style={[
                        styles.difficultyButtonText,
                        content.difficulty === level && styles.difficultyButtonTextActive,
                      ]}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Estimated Duration (minutes)</Text>
              <TextInput
                style={styles.textInput}
                value={content.estimatedDuration?.toString() || ''}
                onChangeText={(value) => updateContent('estimatedDuration', parseInt(value) || 0)}
                placeholder="120"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
          </>
        )}

        {contentType === 'lesson' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.textInput}
                value={content.duration?.toString() || ''}
                onChangeText={(value) => updateContent('duration', parseInt(value) || 0)}
                placeholder="15"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>XP Reward</Text>
              <TextInput
                style={styles.textInput}
                value={content.xp?.toString() || ''}
                onChangeText={(value) => updateContent('xp', parseInt(value) || 0)}
                placeholder="25"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Content Type</Text>
              <View style={styles.typeContainer}>
                {['text', 'video', 'interactive', 'quiz', 'assignment'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      content.type === type && styles.typeButtonActive,
                    ]}
                    onPress={() => updateContent('type', type)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        content.type === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {contentType === 'quiz' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time Limit (minutes)</Text>
              <TextInput
                style={styles.textInput}
                value={content.timeLimit?.toString() || ''}
                onChangeText={(value) => updateContent('timeLimit', parseInt(value) || 0)}
                placeholder="10"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Passing Score (%)</Text>
              <TextInput
                style={styles.textInput}
                value={content.passingScore?.toString() || ''}
                onChangeText={(value) => updateContent('passingScore', parseInt(value) || 70)}
                placeholder="70"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Max Attempts</Text>
              <TextInput
                style={styles.textInput}
                value={content.maxAttempts?.toString() || ''}
                onChangeText={(value) => updateContent('maxAttempts', parseInt(value) || 3)}
                placeholder="3"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );

  const renderContent = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Main Content</Text>
          <TextInput
            style={[styles.textInput, styles.textArea, styles.contentEditor]}
            value={content.content || ''}
            onChangeText={(value) => updateContent('content', value)}
            placeholder="Enter your content here..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
          />
        </View>

        {contentType === 'module' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Learning Objectives</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={content.learningObjectives?.join('\n') || ''}
              onChangeText={(value) => updateContent('learningObjectives', value.split('\n').filter(obj => obj.trim()))}
              placeholder="Enter learning objectives (one per line)..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
            />
          </View>
        )}

        {contentType === 'lesson' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Key Points</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={content.keyPoints?.join('\n') || ''}
              onChangeText={(value) => updateContent('keyPoints', value.split('\n').filter(obj => obj.trim()))}
              placeholder="Enter key points (one per line)..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Publishing Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Published</Text>
            <Text style={styles.settingDescription}>
              Make this content visible to users
            </Text>
          </View>
          <Switch
            value={content.isPublished || false}
            onValueChange={(value) => updateContent('isPublished', value)}
            trackColor={{ false: '#e2e8f0', true: '#667eea' }}
            thumbColor={content.isPublished ? '#ffffff' : '#f4f4f4'}
          />
        </View>

        {contentType === 'module' && (
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Featured</Text>
              <Text style={styles.settingDescription}>
                Show this module prominently
              </Text>
            </View>
            <Switch
              value={content.isFeatured || false}
              onValueChange={(value) => updateContent('isFeatured', value)}
              trackColor={{ false: '#e2e8f0', true: '#667eea' }}
              thumbColor={content.isFeatured ? '#ffffff' : '#f4f4f4'}
            />
          </View>
        )}

        {contentType === 'lesson' && (
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Required</Text>
              <Text style={styles.settingDescription}>
                This lesson must be completed
              </Text>
            </View>
            <Switch
              value={content.isRequired || false}
              onValueChange={(value) => updateContent('isRequired', value)}
              trackColor={{ false: '#e2e8f0', true: '#667eea' }}
              thumbColor={content.isRequired ? '#ffffff' : '#f4f4f4'}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Order</Text>
          <TextInput
            style={styles.textInput}
            value={content.order?.toString() || ''}
            onChangeText={(value) => updateContent('order', parseInt(value) || 0)}
            placeholder="1"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tags (comma-separated)</Text>
          <TextInput
            style={styles.textInput}
            value={content.tags?.join(', ') || ''}
            onChangeText={(value) => updateContent('tags', value.split(',').map(tag => tag.trim()).filter(tag => tag))}
            placeholder="constitution, law, basics"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderPreview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preview</Text>
        
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{content.title || 'Untitled'}</Text>
          <Text style={styles.previewDescription}>{content.description || 'No description'}</Text>
          
          {contentType === 'module' && (
            <View style={styles.previewMeta}>
              <Text style={styles.previewMetaText}>
                {content.estimatedDuration || 0} min • {content.difficulty || 'beginner'}
              </Text>
            </View>
          )}
          
          {contentType === 'lesson' && (
            <View style={styles.previewMeta}>
              <Text style={styles.previewMetaText}>
                {content.duration || 0} min • {content.xp || 0} XP
              </Text>
            </View>
          )}
          
          {contentType === 'quiz' && (
            <View style={styles.previewMeta}>
              <Text style={styles.previewMetaText}>
                {content.timeLimit || 0} min • {content.passingScore || 70}% pass
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic': return renderBasicInfo();
      case 'content': return renderContent();
      case 'settings': return renderSettings();
      case 'preview': return renderPreview();
      default: return renderBasicInfo();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {contentId ? 'Edit' : 'Create'} {contentType}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? '#667eea' : '#64748b'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        {renderTabContent()}
      </KeyboardAvoidingView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.previewButton}
          onPress={() => setShowPreview(true)}
        >
          <Icon name="eye" size={16} color="#667eea" />
          <Text style={styles.previewButtonText}>Preview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.publishButton}
          onPress={handlePublish}
          disabled={saving}
        >
          <Icon name="eye" size={16} color="white" />
          <Text style={styles.publishButtonText}>
            {saving ? 'Publishing...' : 'Publish'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeTab: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#667eea',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  contentEditor: {
    minHeight: 200,
    fontFamily: 'monospace',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  difficultyButtonTextActive: {
    color: 'white',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  typeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  previewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewMetaText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#667eea',
    backgroundColor: 'white',
  },
  previewButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  publishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#667eea',
  },
  publishButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default ContentEditorScreen;
