import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import LearningAPIService from '../../services/LearningAPIService';

const { width, height } = Dimensions.get('window');

interface Lesson {
  id: number;
  module_id: number;
  title: string;
  description: string;
  content: string;
  video_url?: string;
  lesson_type: 'text' | 'video' | 'interactive';
  duration_minutes: number;
  xp_reward: number;
  display_order: number;
  is_published: boolean;
}

interface Module {
  id: number;
  title: string;
}

export default function LessonsManagementScreen({ navigation, route }: any) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<number | undefined>(
    route?.params?.moduleId || undefined
  );
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'media' | 'settings'>('basic');
  
  const contentInputRef = useRef<TextInput>(null);

  const [formData, setFormData] = useState({
    module_id: selectedModuleId || 0,
    title: '',
    description: '',
    content: '',
    video_url: '',
    lesson_type: 'text' as 'text' | 'video' | 'interactive',
    duration_minutes: 15,
    xp_reward: 25,
    is_published: true,
  });

  useEffect(() => {
    fetchModules();
    if (selectedModuleId) {
      fetchLessons(selectedModuleId);
    }
  }, [selectedModuleId]);

  const fetchModules = async () => {
    try {
      const response = await LearningAPIService.adminGetModules();
      setModules(response.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchLessons = async (moduleId?: number) => {
    try {
      setLoading(true);
      const response = await LearningAPIService.adminGetLessons(moduleId);
      setLessons(response.lessons || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      Alert.alert('Error', 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = () => {
    if (!selectedModuleId) {
      Alert.alert('Error', 'Please select a module first');
      return;
    }

    setEditingLesson(null);
    setFormData({
      module_id: selectedModuleId,
      title: '',
      description: '',
      content: '',
      video_url: '',
      lesson_type: 'text',
      duration_minutes: 15,
      xp_reward: 25,
      is_published: true,
    });
    setActiveTab('basic');
    setPreviewMode(false);
    setModalVisible(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      module_id: lesson.module_id,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      video_url: lesson.video_url || '',
      lesson_type: lesson.lesson_type,
      duration_minutes: lesson.duration_minutes,
      xp_reward: lesson.xp_reward,
      is_published: lesson.is_published,
    });
    setActiveTab('basic');
    setPreviewMode(false);
    setModalVisible(true);
  };

  const handleDuplicateLesson = (lesson: Lesson) => {
    Alert.alert(
      'Duplicate Lesson',
      `Create a copy of "${lesson.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Duplicate',
          onPress: async () => {
            try {
              await LearningAPIService.adminCreateLesson({
                module_id: lesson.module_id,
                title: `${lesson.title} (Copy)`,
                description: lesson.description,
                content: lesson.content,
                video_url: lesson.video_url,
                lesson_type: lesson.lesson_type,
                duration_minutes: lesson.duration_minutes,
                xp_reward: lesson.xp_reward,
                is_published: false,
              });
              fetchLessons(selectedModuleId || undefined);
              Alert.alert('Success', 'Lesson duplicated successfully');
            } catch (error) {
              console.error('Error duplicating lesson:', error);
              Alert.alert('Error', 'Failed to duplicate lesson');
            }
          },
        },
      ]
    );
  };

  const handleSaveLesson = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Please enter a lesson title');
      setActiveTab('basic');
      return;
    }
    if (!formData.content.trim()) {
      Alert.alert('Validation Error', 'Please enter lesson content');
      setActiveTab('content');
      return;
    }
    if (formData.lesson_type === 'video' && !formData.video_url.trim()) {
      Alert.alert('Validation Error', 'Please enter a video URL for video lessons');
      setActiveTab('media');
      return;
    }

    try {
      if (editingLesson) {
        await LearningAPIService.adminUpdateLesson(editingLesson.id, formData);
      } else {
        await LearningAPIService.adminCreateLesson(formData);
      }
      setModalVisible(false);
      fetchLessons(selectedModuleId || undefined);
      Alert.alert('Success', `Lesson ${editingLesson ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving lesson:', error);
      Alert.alert('Error', 'Failed to save lesson. Please try again.');
    }
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    const willPublish = !lesson.is_published;
    try {
      await LearningAPIService.adminUpdateLesson(lesson.id, {
        is_published: willPublish,
      });
      fetchLessons(selectedModuleId || undefined);
      Alert.alert('Success', `Lesson ${willPublish ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Error toggling publish status:', error);
      Alert.alert('Error', 'Failed to update lesson status');
    }
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    Alert.alert(
      'Delete Lesson',
      `Are you sure you want to delete "${lesson.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await LearningAPIService.adminDeleteLesson(lesson.id);
              fetchLessons(selectedModuleId || undefined);
              Alert.alert('Success', 'Lesson deleted successfully');
            } catch (error) {
              console.error('Error deleting lesson:', error);
              Alert.alert('Error', 'Failed to delete lesson');
            }
          },
        },
      ]
    );
  };

  // Formatting helpers
  const insertMarkdown = (before: string, after: string = '') => {
    const input = contentInputRef.current;
    if (!input) return;

    const currentContent = formData.content;
    const selection = { start: currentContent.length, end: currentContent.length };

    const newText = 
      currentContent.substring(0, selection.start) +
      before +
      after +
      currentContent.substring(selection.end);

    setFormData({ ...formData, content: newText });
  };

  const insertHeading = (level: number) => {
    insertMarkdown(`${'#'.repeat(level)} `, '\n');
  };

  const insertBold = () => {
    insertMarkdown('**', '**');
  };

  const insertItalic = () => {
    insertMarkdown('*', '*');
  };

  const insertBulletPoint = () => {
    insertMarkdown('• ', '\n');
  };

  const insertNumberedList = () => {
    insertMarkdown('1. ', '\n');
  };

  const insertCodeBlock = () => {
    insertMarkdown('```\n', '\n```\n');
  };

  const insertLink = () => {
    insertMarkdown('[Link Text](', ')');
  };

  const getVideoThumbnail = (url: string): string | null => {
    if (!url) return null;
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      // Note: Vimeo thumbnails require API call, using placeholder
      return 'https://via.placeholder.com/320x180/3B82F6/FFF?text=Vimeo+Video';
    }
    
    return null;
  };

  const lessonTypeColors = {
    text: '#3B82F6',
    video: '#EF4444',
    interactive: '#10B981',
  };

  const lessonTypeIcons = {
    text: 'document-text',
    video: 'videocam',
    interactive: 'hand-left',
  };

  if (loading && !modules.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading lessons...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Manage Lessons</Text>
          <Text style={styles.headerSubtitle}>
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCreateLesson}
          style={[styles.addButton, !selectedModuleId && styles.addButtonDisabled]}
          disabled={!selectedModuleId}
        >
          <LinearGradient
            colors={selectedModuleId ? ['#3B82F6', '#2563EB'] : ['#D1D5DB', '#9CA3AF']}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Module Selector */}
      <View style={styles.moduleSelector}>
        <View style={styles.moduleSelectorHeader}>
          <MaterialIcons name="folder" size={20} color="#6B7280" />
          <Text style={styles.selectorLabel}>Module</Text>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedModuleId}
            onValueChange={(value) => {
              setSelectedModuleId(value);
              if (value) fetchLessons(value);
            }}
            style={styles.picker}
          >
            <Picker.Item label="-- Select a Module --" value={0} />
            {modules.map((module) => (
              <Picker.Item key={module.id} label={module.title} value={module.id} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Lessons List */}
      <ScrollView style={styles.lessonsList} showsVerticalScrollIndicator={false}>
        {!selectedModuleId ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.emptyIconGradient}>
                <MaterialIcons name="folder-open" size={48} color="#FFF" />
              </LinearGradient>
            </View>
            <Text style={styles.emptyText}>Select a Module</Text>
            <Text style={styles.emptySubtext}>
              Choose a module from above to view and manage its lessons
            </Text>
          </View>
        ) : lessons.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.emptyIconGradient}>
                <MaterialIcons name="add-circle-outline" size={48} color="#FFF" />
              </LinearGradient>
            </View>
            <Text style={styles.emptyText}>No Lessons Yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first lesson for this module by tapping the + button above
            </Text>
            <TouchableOpacity style={styles.emptyActionButton} onPress={handleCreateLesson}>
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.emptyActionGradient}>
                <Ionicons name="add" size={20} color="#FFF" />
                <Text style={styles.emptyActionText}>Create First Lesson</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          lessons.map((lesson, index) => (
            <View key={lesson.id} style={styles.lessonCard}>
              {/* Card Header */}
              <View style={styles.lessonHeader}>
                <LinearGradient
                  colors={[lessonTypeColors[lesson.lesson_type], lessonTypeColors[lesson.lesson_type] + 'CC']}
                  style={styles.orderBadge}
                >
                  <Text style={styles.orderText}>{index + 1}</Text>
                </LinearGradient>
                <View style={styles.lessonInfo}>
                  <View style={styles.lessonTitleRow}>
                    <Text style={styles.lessonTitle} numberOfLines={2}>
                      {lesson.title}
                    </Text>
                    {lesson.is_published ? (
                      <View style={styles.publishedBadge}>
                        <MaterialIcons name="check-circle" size={14} color="#10B981" />
                      </View>
                    ) : (
                      <View style={styles.draftBadge}>
                        <MaterialIcons name="edit" size={14} color="#F59E0B" />
                      </View>
                    )}
                  </View>
                  {lesson.description && (
                    <Text style={styles.lessonDescription} numberOfLines={2}>
                      {lesson.description}
                    </Text>
                  )}
                </View>
              </View>

              {/* Metadata */}
              <View style={styles.lessonMeta}>
                <View
                  style={[
                    styles.metaBadge,
                    { backgroundColor: lessonTypeColors[lesson.lesson_type] + '15' },
                  ]}
                >
                  <Ionicons
                    name={lessonTypeIcons[lesson.lesson_type] as any}
                    size={14}
                    color={lessonTypeColors[lesson.lesson_type]}
                  />
                  <Text style={[styles.metaBadgeText, { color: lessonTypeColors[lesson.lesson_type] }]}>
                    {lesson.lesson_type.charAt(0).toUpperCase() + lesson.lesson_type.slice(1)}
                  </Text>
                </View>
                <View style={styles.metaBadge}>
                  <MaterialIcons name="schedule" size={14} color="#6B7280" />
                  <Text style={styles.metaBadgeText}>{lesson.duration_minutes} min</Text>
                </View>
                <View style={styles.metaBadge}>
                  <MaterialIcons name="stars" size={14} color="#F59E0B" />
                  <Text style={styles.metaBadgeText}>{lesson.xp_reward} XP</Text>
                </View>
                {lesson.video_url && (
                  <View style={[styles.metaBadge, { backgroundColor: '#EF444415' }]}>
                    <MaterialIcons name="play-circle-filled" size={14} color="#EF4444" />
                    <Text style={[styles.metaBadgeText, { color: '#EF4444' }]}>Video</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.lessonActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditLesson(lesson)}
                >
                  <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.actionButtonGradient}>
                    <MaterialIcons name="edit" size={18} color="#3B82F6" />
                    <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Edit</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDuplicateLesson(lesson)}
                >
                  <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={styles.actionButtonGradient}>
                    <MaterialIcons name="content-copy" size={18} color="#10B981" />
                    <Text style={[styles.actionButtonText, { color: '#10B981' }]}>Duplicate</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleTogglePublish(lesson)}
                >
                  <LinearGradient
                    colors={lesson.is_published ? ['#FEF3C7', '#FDE68A'] : ['#F5F3FF', '#EDE9FE']}
                    style={styles.actionButtonGradient}
                  >
                    <MaterialIcons
                      name={lesson.is_published ? 'cloud-off' : 'cloud-upload'}
                      size={18}
                      color={lesson.is_published ? '#F59E0B' : '#8B5CF6'}
                    />
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: lesson.is_published ? '#F59E0B' : '#8B5CF6' },
                      ]}
                    >
                      {lesson.is_published ? 'Unpublish' : 'Publish'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteLesson(lesson)}
                >
                  <LinearGradient colors={['#FEF2F2', '#FEE2E2']} style={styles.actionButtonGradient}>
                    <MaterialIcons name="delete" size={18} color="#EF4444" />
                    <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* PREMIUM EDIT MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>
                {editingLesson ? 'Edit Lesson' : 'Create Lesson'}
              </Text>
              {editingLesson && (
                <Text style={styles.modalSubtitle}>Lesson #{editingLesson.display_order}</Text>
              )}
            </View>
            <TouchableOpacity onPress={handleSaveLesson} style={styles.modalSaveButton}>
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.modalSaveGradient}>
                <Ionicons name="checkmark" size={24} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'basic' && styles.activeTab]}
                onPress={() => setActiveTab('basic')}
              >
                <MaterialIcons
                  name="info"
                  size={18}
                  color={activeTab === 'basic' ? '#3B82F6' : '#9CA3AF'}
                />
                <Text style={[styles.tabText, activeTab === 'basic' && styles.activeTabText]}>
                  Basic Info
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'content' && styles.activeTab]}
                onPress={() => setActiveTab('content')}
              >
                <MaterialIcons
                  name="article"
                  size={18}
                  color={activeTab === 'content' ? '#3B82F6' : '#9CA3AF'}
                />
                <Text style={[styles.tabText, activeTab === 'content' && styles.activeTabText]}>
                  Content
                </Text>
                {!formData.content.trim() && (
                  <View style={styles.requiredDot} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'media' && styles.activeTab]}
                onPress={() => setActiveTab('media')}
              >
                <MaterialIcons
                  name="video-library"
                  size={18}
                  color={activeTab === 'media' ? '#3B82F6' : '#9CA3AF'}
                />
                <Text style={[styles.tabText, activeTab === 'media' && styles.activeTabText]}>
                  Media
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
                onPress={() => setActiveTab('settings')}
              >
                <MaterialIcons
                  name="settings"
                  size={18}
                  color={activeTab === 'settings' ? '#3B82F6' : '#9CA3AF'}
                />
                <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
                  Settings
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Tab Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* BASIC INFO TAB */}
            {activeTab === 'basic' && (
              <View style={styles.tabContent}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Lesson Title <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    placeholder="e.g., Introduction to Constitutional Rights"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.helperText}>
                    Choose a clear, descriptive title (50-80 characters recommended)
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="Brief overview of what students will learn..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                  />
                  <Text style={styles.helperText}>
                    Short summary shown in lesson lists (max 200 characters)
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Lesson Type</Text>
                  <View style={styles.typeSelector}>
                    {(['text', 'video', 'interactive'] as const).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeOption,
                          formData.lesson_type === type && styles.typeOptionActive,
                        ]}
                        onPress={() => setFormData({ ...formData, lesson_type: type })}
                      >
                        <View
                          style={[
                            styles.typeIconContainer,
                            formData.lesson_type === type && {
                              backgroundColor: lessonTypeColors[type],
                            },
                          ]}
                        >
                          <Ionicons
                            name={lessonTypeIcons[type] as any}
                            size={24}
                            color={formData.lesson_type === type ? '#FFF' : '#9CA3AF'}
                          />
                        </View>
                        <Text
                          style={[
                            styles.typeText,
                            formData.lesson_type === type && styles.typeTextActive,
                          ]}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* CONTENT TAB */}
            {activeTab === 'content' && (
              <View style={styles.tabContent}>
                {/* Preview Toggle */}
                <View style={styles.previewToggle}>
                  <TouchableOpacity
                    style={[styles.previewButton, !previewMode && styles.previewButtonActive]}
                    onPress={() => setPreviewMode(false)}
                  >
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color={!previewMode ? '#3B82F6' : '#6B7280'}
                    />
                    <Text
                      style={[
                        styles.previewButtonText,
                        !previewMode && styles.previewButtonTextActive,
                      ]}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.previewButton, previewMode && styles.previewButtonActive]}
                    onPress={() => setPreviewMode(true)}
                  >
                    <MaterialIcons
                      name="visibility"
                      size={18}
                      color={previewMode ? '#3B82F6' : '#6B7280'}
                    />
                    <Text
                      style={[
                        styles.previewButtonText,
                        previewMode && styles.previewButtonTextActive,
                      ]}
                    >
                      Preview
                    </Text>
                  </TouchableOpacity>
                </View>

                {!previewMode ? (
                  <>
                    {/* Formatting Toolbar */}
                    <View style={styles.toolbar}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity style={styles.toolbarButton} onPress={() => insertHeading(1)}>
                          <Text style={styles.toolbarButtonText}>H1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolbarButton} onPress={() => insertHeading(2)}>
                          <Text style={styles.toolbarButtonText}>H2</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolbarButton} onPress={insertBold}>
                          <MaterialIcons name="format-bold" size={20} color="#374151" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolbarButton} onPress={insertItalic}>
                          <MaterialIcons name="format-italic" size={20} color="#374151" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolbarButton} onPress={insertBulletPoint}>
                          <MaterialIcons name="format-list-bulleted" size={20} color="#374151" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolbarButton} onPress={insertNumberedList}>
                          <MaterialIcons name="format-list-numbered" size={20} color="#374151" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolbarButton} onPress={insertLink}>
                          <MaterialIcons name="link" size={20} color="#374151" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolbarButton} onPress={insertCodeBlock}>
                          <MaterialIcons name="code" size={20} color="#374151" />
                        </TouchableOpacity>
                      </ScrollView>
                    </View>

                    {/* Content Input */}
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>
                        Lesson Content <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        ref={contentInputRef}
                        style={[styles.input, styles.contentArea]}
                        value={formData.content}
                        onChangeText={(text) => setFormData({ ...formData, content: text })}
                        placeholder="Write your lesson content here...&#10;&#10;Use the toolbar above for formatting:&#10;• **bold text** for emphasis&#10;• # Heading for sections&#10;• • Bullet points for lists&#10;• 1. Numbered steps&#10;&#10;Write naturally - the preview will show how it looks!"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={20}
                        textAlignVertical="top"
                      />
                      <Text style={styles.helperText}>
                        💡 Tip: Use markdown for formatting. Click Preview to see the final result.
                      </Text>
                    </View>

                    {/* Quick Tips Card */}
                    <View style={styles.tipsCard}>
                      <View style={styles.tipsHeader}>
                        <MaterialIcons name="lightbulb" size={20} color="#F59E0B" />
                        <Text style={styles.tipsTitle}>Formatting Quick Guide</Text>
                      </View>
                      <View style={styles.tipsList}>
                        <Text style={styles.tipText}>
                          <Text style={styles.tipBold}>**Bold**</Text> - Wrap text with **
                        </Text>
                        <Text style={styles.tipText}>
                          <Text style={styles.tipBold}>*Italic*</Text> - Wrap text with *
                        </Text>
                        <Text style={styles.tipText}>
                          <Text style={styles.tipBold}># Heading</Text> - Start line with #
                        </Text>
                        <Text style={styles.tipText}>
                          <Text style={styles.tipBold}>• Bullet</Text> - Start line with •
                        </Text>
                        <Text style={styles.tipText}>
                          <Text style={styles.tipBold}>1. Number</Text> - Start line with 1.
                        </Text>
                        <Text style={styles.tipText}>
                          <Text style={styles.tipBold}>[Link](url)</Text> - Create links
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Preview Mode - MATCHES STUDENT VIEW EXACTLY */}
                    <View style={styles.previewContainer}>
                      <View style={styles.previewHeader}>
                        <MaterialIcons name="visibility" size={20} color="#3B82F6" />
                        <Text style={styles.previewHeaderText}>Live Preview (Student View)</Text>
                      </View>
                      <ScrollView style={styles.previewContent}>
                        {formData.content.trim() ? (
                          <View style={styles.previewFormatted}>
                            {formatContentForPreview(formData.content)}
                          </View>
                        ) : (
                          <View style={styles.previewEmpty}>
                            <MaterialIcons name="article" size={48} color="#D1D5DB" />
                            <Text style={styles.previewEmptyText}>No content yet</Text>
                            <Text style={styles.previewEmptySubtext}>
                              Switch to Edit mode to start writing
                            </Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* MEDIA TAB */}
            {activeTab === 'media' && (
              <View style={styles.tabContent}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Video URL {formData.lesson_type === 'video' && <Text style={styles.required}>*</Text>}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={formData.video_url}
                    onChangeText={(text) => setFormData({ ...formData, video_url: text })}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    keyboardType="url"
                    autoCorrect={false}
                  />
                  <Text style={styles.helperText}>
                    Supported: YouTube, Vimeo, or direct MP4/MOV links
                  </Text>
                </View>

                {/* Video Preview */}
                {formData.video_url && (
                  <View style={styles.videoPreviewCard}>
                    <Text style={styles.videoPreviewLabel}>Video Preview</Text>
                    {getVideoThumbnail(formData.video_url) ? (
                      <View style={styles.videoThumbnailContainer}>
                        <Image
                          source={{ uri: getVideoThumbnail(formData.video_url)! }}
                          style={styles.videoThumbnail}
                          resizeMode="cover"
                        />
                        <View style={styles.videoOverlay}>
                          <View style={styles.playButton}>
                            <MaterialIcons name="play-arrow" size={40} color="#FFF" />
                          </View>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.videoPlaceholder}>
                        <MaterialIcons name="videocam" size={48} color="#9CA3AF" />
                        <Text style={styles.videoPlaceholderText}>Video will appear here</Text>
                      </View>
                    )}
                    <View style={styles.videoInfo}>
                      <MaterialIcons name="info-outline" size={16} color="#3B82F6" />
                      <Text style={styles.videoInfoText}>
                        Students will see this video embedded in the lesson
                      </Text>
                    </View>
                  </View>
                )}

                {/* Media Guidelines */}
                <View style={styles.guidelinesCard}>
                  <View style={styles.guidelinesHeader}>
                    <MaterialIcons name="help-outline" size={20} color="#8B5CF6" />
                    <Text style={styles.guidelinesTitle}>Video Guidelines</Text>
                  </View>
                  <View style={styles.guidelinesList}>
                    <View style={styles.guidelineItem}>
                      <MaterialIcons name="check-circle" size={16} color="#10B981" />
                      <Text style={styles.guidelineText}>Keep videos under 15 minutes for best engagement</Text>
                    </View>
                    <View style={styles.guidelineItem}>
                      <MaterialIcons name="check-circle" size={16} color="#10B981" />
                      <Text style={styles.guidelineText}>Use 720p or higher resolution</Text>
                    </View>
                    <View style={styles.guidelineItem}>
                      <MaterialIcons name="check-circle" size={16} color="#10B981" />
                      <Text style={styles.guidelineText}>Add captions for accessibility</Text>
                    </View>
                    <View style={styles.guidelineItem}>
                      <MaterialIcons name="check-circle" size={16} color="#10B981" />
                      <Text style={styles.guidelineText}>Test video on mobile devices</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <View style={styles.tabContent}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Duration (minutes)</Text>
                  <View style={styles.sliderContainer}>
                    <TextInput
                      style={styles.sliderInput}
                      value={String(formData.duration_minutes)}
                      onChangeText={(text) =>
                        setFormData({ ...formData, duration_minutes: parseInt(text) || 0 })
                      }
                      keyboardType="numeric"
                    />
                    <View style={styles.sliderTrack}>
                      <View style={styles.sliderLabels}>
                        <Text style={styles.sliderLabel}>5</Text>
                        <Text style={styles.sliderLabel}>30</Text>
                        <Text style={styles.sliderLabel}>60</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.helperText}>
                    Estimated time for students to complete this lesson
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>XP Reward</Text>
                  <View style={styles.sliderContainer}>
                    <TextInput
                      style={styles.sliderInput}
                      value={String(formData.xp_reward)}
                      onChangeText={(text) =>
                        setFormData({ ...formData, xp_reward: parseInt(text) || 0 })
                      }
                      keyboardType="numeric"
                    />
                    <View style={styles.sliderTrack}>
                      <View style={styles.sliderLabels}>
                        <Text style={styles.sliderLabel}>10</Text>
                        <Text style={styles.sliderLabel}>50</Text>
                        <Text style={styles.sliderLabel}>100</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.helperText}>
                    XP awarded to students upon lesson completion
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Publishing Status</Text>
                  <View style={styles.publishToggle}>
                    <TouchableOpacity
                      style={[
                        styles.publishOption,
                        !formData.is_published && styles.publishOptionActive,
                      ]}
                      onPress={() => setFormData({ ...formData, is_published: false })}
                    >
                      <MaterialIcons
                        name="edit"
                        size={24}
                        color={!formData.is_published ? '#F59E0B' : '#9CA3AF'}
                      />
                      <Text
                        style={[
                          styles.publishOptionText,
                          !formData.is_published && styles.publishOptionTextActive,
                        ]}
                      >
                        Draft
                      </Text>
                      <Text style={styles.publishOptionSubtext}>Only visible to admins</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.publishOption,
                        formData.is_published && styles.publishOptionActive,
                      ]}
                      onPress={() => setFormData({ ...formData, is_published: true })}
                    >
                      <MaterialIcons
                        name="check-circle"
                        size={24}
                        color={formData.is_published ? '#10B981' : '#9CA3AF'}
                      />
                      <Text
                        style={[
                          styles.publishOptionText,
                          formData.is_published && styles.publishOptionTextActive,
                        ]}
                      >
                        Published
                      </Text>
                      <Text style={styles.publishOptionSubtext}>Visible to all students</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Best Practices Card */}
                <View style={styles.bestPracticesCard}>
                  <View style={styles.bestPracticesHeader}>
                    <MaterialIcons name="stars" size={20} color="#F59E0B" />
                    <Text style={styles.bestPracticesTitle}>Best Practices</Text>
                  </View>
                  <View style={styles.bestPracticesList}>
                    <Text style={styles.bestPracticeText}>
                      • Lessons between 10-20 minutes work best
                    </Text>
                    <Text style={styles.bestPracticeText}>
                      • Award 10-25 XP for short lessons, 50-100 XP for comprehensive ones
                    </Text>
                    <Text style={styles.bestPracticeText}>
                      • Keep draft status while reviewing content
                    </Text>
                    <Text style={styles.bestPracticeText}>
                      • Test the lesson as a student before publishing
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Bottom Action Bar */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => {
                Alert.alert(
                  'Discard Changes?',
                  'Are you sure you want to close without saving?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => setModalVisible(false) },
                  ]
                );
              }}
            >
              <Text style={styles.footerButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerSaveButton} onPress={handleSaveLesson}>
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.footerSaveGradient}>
                <MaterialIcons name="save" size={20} color="#FFF" />
                <Text style={styles.footerSaveText}>
                  {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 48,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  addButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleSelector: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  moduleSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  picker: {
    height: 50,
  },
  lessonsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 24,
  },
  emptyIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  emptyActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  lessonCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lessonHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  orderBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  orderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  lessonTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 24,
  },
  publishedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  lessonMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  lessonActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 48,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderContent: {
    flex: 1,
    marginLeft: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  modalSaveButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalSaveGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  requiredDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  modalContent: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  contentArea: {
    height: 200,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  typeOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  typeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeTextActive: {
    color: '#3B82F6',
  },
  previewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  previewButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  previewButtonTextActive: {
    color: '#3B82F6',
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toolbarButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  tipsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginTop: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
  },
  tipsList: {
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  tipBold: {
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  previewContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  previewHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  previewContent: {
    padding: 20,
    minHeight: 300,
  },
  previewFormatted: {
    // Container for formatted preview
  },
  previewParagraph: {
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
    marginBottom: 16,
  },
  previewBold: {
    fontWeight: '700',
    color: '#1E40AF',
  },
  previewBulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 4,
  },
  previewBulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginTop: 9,
    marginRight: 12,
  },
  previewBulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  previewHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  previewHeadingAccent: {
    width: 4,
    height: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    marginRight: 12,
  },
  previewHeadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  previewSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
  },
  previewStepCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  previewStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewStepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewStepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  previewStepTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 22,
  },
  previewStepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    paddingLeft: 48,
  },
  previewEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  previewEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 12,
  },
  previewEmptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 4,
  },
  videoPreviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  videoPreviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  videoThumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  videoPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  videoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  videoInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },
  guidelinesCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    marginTop: 16,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B21A8',
  },
  guidelinesList: {
    gap: 8,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  guidelineText: {
    flex: 1,
    fontSize: 13,
    color: '#7C3AED',
    lineHeight: 18,
  },
  sliderContainer: {
    gap: 12,
  },
  sliderInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'center',
    backgroundColor: '#FFF',
  },
  sliderTrack: {
    paddingHorizontal: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  publishToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  publishOption: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  publishOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  publishOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 8,
  },
  publishOptionTextActive: {
    color: '#1F2937',
  },
  publishOptionSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  bestPracticesCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginTop: 16,
  },
  bestPracticesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  bestPracticesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
  },
  bestPracticesList: {
    gap: 6,
  },
  bestPracticeText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  footerSaveButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  footerSaveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  footerSaveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});