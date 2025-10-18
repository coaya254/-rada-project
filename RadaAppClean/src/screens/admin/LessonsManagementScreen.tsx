import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import LearningAPIService from '../../services/LearningAPIService';

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
  const [selectedModuleId, setSelectedModuleId] = useState<number | undefined>(route?.params?.moduleId || undefined);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    module_id: selectedModuleId || 0,
    title: '',
    description: '',
    content: '',
    video_url: '',
    lesson_type: 'text',
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
    setModalVisible(true);
  };

  const handleSaveLesson = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a lesson title');
      return;
    }
    if (!formData.content.trim()) {
      Alert.alert('Error', 'Please enter lesson content');
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
      Alert.alert('Error', 'Failed to save lesson');
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
      `Are you sure you want to delete "${lesson.title}"?`,
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
        <Text style={styles.headerTitle}>Manage Lessons</Text>
        <TouchableOpacity
          onPress={handleCreateLesson}
          style={[styles.addButton, !selectedModuleId && styles.addButtonDisabled]}
          disabled={!selectedModuleId}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Module Selector */}
      <View style={styles.moduleSelector}>
        <Text style={styles.selectorLabel}>Select Module:</Text>
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
      <ScrollView style={styles.lessonsList}>
        {!selectedModuleId ? (
          <View style={styles.emptyState}>
            <Ionicons name="albums-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Select a module</Text>
            <Text style={styles.emptySubtext}>Choose a module to view and manage its lessons</Text>
          </View>
        ) : lessons.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No lessons yet</Text>
            <Text style={styles.emptySubtext}>Create your first lesson for this module</Text>
          </View>
        ) : (
          lessons.map((lesson, index) => (
            <View key={lesson.id} style={styles.lessonCard}>
              <View style={styles.lessonHeader}>
                <View style={styles.orderBadge}>
                  <Text style={styles.orderText}>{index + 1}</Text>
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDescription} numberOfLines={2}>
                    {lesson.description}
                  </Text>
                </View>
              </View>

              <View style={styles.lessonMeta}>
                <View style={[styles.badge, { backgroundColor: lessonTypeColors[lesson.lesson_type] + '20' }]}>
                  <Ionicons
                    name={lessonTypeIcons[lesson.lesson_type] as any}
                    size={14}
                    color={lessonTypeColors[lesson.lesson_type]}
                  />
                  <Text style={[styles.badgeText, { color: lessonTypeColors[lesson.lesson_type] }]}>
                    {lesson.lesson_type}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="time" size={14} color="#6B7280" />
                  <Text style={styles.badgeText}>{lesson.duration_minutes} min</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="star" size={14} color="#6B7280" />
                  <Text style={styles.badgeText}>{lesson.xp_reward} XP</Text>
                </View>
                {lesson.is_published ? (
                  <View style={[styles.badge, { backgroundColor: '#10B98120' }]}>
                    <Text style={[styles.badgeText, { color: '#10B981' }]}>Published</Text>
                  </View>
                ) : (
                  <View style={[styles.badge, { backgroundColor: '#F59E0B20' }]}>
                    <Text style={[styles.badgeText, { color: '#F59E0B' }]}>Draft</Text>
                  </View>
                )}
              </View>

              <View style={styles.lessonActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditLesson(lesson)}
                >
                  <Ionicons name="create" size={18} color="#3B82F6" />
                  <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, lesson.is_published ? styles.unpublishButton : styles.publishButton]}
                  onPress={() => handleTogglePublish(lesson)}
                >
                  <Ionicons name={lesson.is_published ? 'cloud-offline' : 'cloud-upload'} size={18} color={lesson.is_published ? '#F59E0B' : '#8B5CF6'} />
                  <Text style={[styles.actionButtonText, { color: lesson.is_published ? '#F59E0B' : '#8B5CF6' }]}>
                    {lesson.is_published ? 'Unpublish' : 'Publish'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteLesson(lesson)}
                >
                  <Ionicons name="trash" size={18} color="#EF4444" />
                  <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingLesson ? 'Edit Lesson' : 'Create Lesson'}
              </Text>

              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Lesson title"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Brief description"
                multiline
                numberOfLines={2}
              />

              <Text style={styles.label}>Content *</Text>
              <TextInput
                style={[styles.input, styles.contentArea]}
                value={formData.content}
                onChangeText={(text) => setFormData({ ...formData, content: text })}
                placeholder="Full lesson content&#10;&#10;Formatting tips:&#10;• Use ** for bold text&#10;• Add bullet points with •&#10;• Separate paragraphs with blank lines&#10;• Use numbered steps: 1. Step one 2. Step two"
                multiline
                numberOfLines={12}
              />
              <Text style={styles.helperText}>
                Write comprehensive lesson content. Use markdown formatting (**bold**), bullet points (•), and clear paragraphs for better readability.
              </Text>

              <Text style={styles.label}>Video URL (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.video_url}
                onChangeText={(text) => setFormData({ ...formData, video_url: text })}
                placeholder="https://youtube.com/watch?v=..."
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={styles.helperText}>For 'video' type lessons. YouTube, Vimeo, or direct MP4 links.</Text>

              <Text style={styles.label}>Lesson Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.lesson_type}
                  onValueChange={(value) => setFormData({ ...formData, lesson_type: value as any })}
                  style={styles.picker}
                >
                  <Picker.Item label="Text" value="text" />
                  <Picker.Item label="Video" value="video" />
                  <Picker.Item label="Interactive" value="interactive" />
                </Picker>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Duration (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.duration_minutes)}
                    onChangeText={(text) => setFormData({ ...formData, duration_minutes: parseInt(text) || 0 })}
                    keyboardType="numeric"
                    placeholder="15"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>XP Reward</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.xp_reward)}
                    onChangeText={(text) => setFormData({ ...formData, xp_reward: parseInt(text) || 0 })}
                    keyboardType="numeric"
                    placeholder="25"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveLesson}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  moduleSelector: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  lessonsList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  lessonCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
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
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  lessonActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#EFF6FF',
  },
  publishButton: {
    backgroundColor: '#F5F3FF',
  },
  unpublishButton: {
    backgroundColor: '#FEF3C7',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  contentArea: {
    height: 160,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
