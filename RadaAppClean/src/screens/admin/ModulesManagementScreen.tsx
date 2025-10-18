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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import LearningAPIService from '../../services/LearningAPIService';

interface Module {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  xp_reward: number;
  estimated_duration: number;
  status: 'draft' | 'published';
  is_featured: boolean;
  total_lessons?: number;
  enrollment_count?: number;
  calculated_xp_from_lessons?: number;
}

export default function ModulesManagementScreen({ navigation }: any) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Government',
    difficulty: 'beginner',
    icon: '📚',
    xp_reward: 100,
    estimated_duration: 60,
    status: 'draft',
    is_featured: false,
  });
  const [iconType, setIconType] = useState<'emoji' | 'image'>('emoji');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await LearningAPIService.adminGetModules();
      setModules(response.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
      Alert.alert('Error', 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = () => {
    setEditingModule(null);
    setFormData({
      title: '',
      description: '',
      category: 'Government',
      difficulty: 'beginner',
      icon: '📚',
      xp_reward: 100,
      estimated_duration: 60,
      status: 'draft',
      is_featured: false,
    });
    setIconType('emoji');
    setSelectedImage(null);
    setModalVisible(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description,
      category: module.category,
      difficulty: module.difficulty,
      icon: module.icon,
      xp_reward: module.xp_reward,
      estimated_duration: module.estimated_duration,
      status: module.status,
      is_featured: module.is_featured,
    });
    // Check if icon is a URL (image) or emoji
    if (module.icon.startsWith('http://') || module.icon.startsWith('https://')) {
      setIconType('image');
      setSelectedImage(module.icon);
    } else {
      setIconType('emoji');
      setSelectedImage(null);
    }
    setModalVisible(true);
  };

  const handleSaveModule = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a module title');
      return;
    }

    try {
      let iconToSave = formData.icon;

      // If an image was selected and it's a local file URI, upload it first
      if (iconType === 'image' && selectedImage && !selectedImage.startsWith('http')) {
        const uploadResponse = await LearningAPIService.uploadModuleIcon(selectedImage);
        if (uploadResponse.success) {
          // Use the full URL from server
          iconToSave = `http://localhost:3000${uploadResponse.url}`;
        } else {
          Alert.alert('Error', 'Failed to upload image');
          return;
        }
      }

      const dataToSave = { ...formData, icon: iconToSave };

      if (editingModule) {
        await LearningAPIService.adminUpdateModule(editingModule.id, dataToSave);
      } else {
        await LearningAPIService.adminCreateModule(dataToSave);
      }
      setModalVisible(false);
      fetchModules();
      Alert.alert('Success', `Module ${editingModule ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving module:', error);
      Alert.alert('Error', 'Failed to save module');
    }
  };

  const handleTogglePublish = async (module: Module) => {
    const willPublish = module.status === 'draft';
    try {
      await LearningAPIService.adminUpdateModule(module.id, {
        status: willPublish ? 'published' : 'draft',
        is_published: willPublish,
      });
      fetchModules();
      Alert.alert('Success', `Module ${willPublish ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Error toggling publish status:', error);
      Alert.alert('Error', 'Failed to update module status');
    }
  };

  const handleToggleFeatured = async (module: Module) => {
    const willFeature = !module.is_featured;
    try {
      await LearningAPIService.adminUpdateModule(module.id, {
        is_featured: willFeature,
      });
      fetchModules();
      Alert.alert('Success', `Module ${willFeature ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      console.error('Error toggling featured status:', error);
      Alert.alert('Error', 'Failed to update featured status');
    }
  };

  const handleDeleteModule = (module: Module) => {
    Alert.alert(
      'Delete Module',
      `Are you sure you want to delete "${module.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await LearningAPIService.adminDeleteModule(module.id);
              fetchModules();
              Alert.alert('Success', 'Module deleted successfully');
            } catch (error) {
              console.error('Error deleting module:', error);
              Alert.alert('Error', 'Failed to delete module');
            }
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setFormData({ ...formData, icon: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const difficultyColors = {
    beginner: '#10B981',
    intermediate: '#F59E0B',
    advanced: '#EF4444',
  };

  if (loading) {
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
        <Text style={styles.headerTitle}>Manage Modules</Text>
        <TouchableOpacity onPress={handleCreateModule} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Modules List */}
      <ScrollView style={styles.modulesList}>
        {modules.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No modules yet</Text>
            <Text style={styles.emptySubtext}>Create your first learning module</Text>
          </View>
        ) : (
          modules.map((module) => (
            <View key={module.id} style={styles.moduleCard}>
              <View style={styles.moduleHeader}>
                {module.icon.startsWith('http://') || module.icon.startsWith('https://') ? (
                  <Image source={{ uri: module.icon }} style={styles.moduleIconImage} />
                ) : (
                  <Text style={styles.moduleIcon}>{module.icon}</Text>
                )}
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleDescription} numberOfLines={2}>
                    {module.description}
                  </Text>
                </View>
              </View>

              <View style={styles.moduleMeta}>
                <View style={[styles.badge, { backgroundColor: difficultyColors[module.difficulty] + '20' }]}>
                  <Text style={[styles.badgeText, { color: difficultyColors[module.difficulty] }]}>
                    {module.difficulty}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{module.category}</Text>
                </View>
                {module.status === 'published' ? (
                  <View style={[styles.badge, { backgroundColor: '#10B98120' }]}>
                    <Text style={[styles.badgeText, { color: '#10B981' }]}>Published</Text>
                  </View>
                ) : (
                  <View style={[styles.badge, { backgroundColor: '#F59E0B20' }]}>
                    <Text style={[styles.badgeText, { color: '#F59E0B' }]}>Draft</Text>
                  </View>
                )}
                {module.is_featured && (
                  <View style={[styles.badge, { backgroundColor: '#8B5CF620' }]}>
                    <Text style={[styles.badgeText, { color: '#8B5CF6' }]}>⭐ Featured</Text>
                  </View>
                )}
              </View>

              <View style={styles.moduleStats}>
                <View style={styles.stat}>
                  <Ionicons name="document-text" size={16} color="#6B7280" />
                  <Text style={styles.statText}>{module.total_lessons || 0} lessons</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="people" size={16} color="#6B7280" />
                  <Text style={styles.statText}>{module.enrollment_count || 0} enrolled</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="star" size={16} color="#6B7280" />
                  <Text style={styles.statText}>{module.calculated_xp_from_lessons || 0} XP</Text>
                </View>
              </View>

              <View style={styles.moduleActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditModule(module)}
                >
                  <Ionicons name="create" size={18} color="#3B82F6" />
                  <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.lessonsButton]}
                  onPress={() => navigation.navigate('LessonsManagement', { moduleId: module.id, moduleTitle: module.title })}
                >
                  <Ionicons name="list" size={18} color="#10B981" />
                  <Text style={[styles.actionButtonText, { color: '#10B981' }]}>Lessons</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, module.status === 'draft' ? styles.publishButton : styles.unpublishButton]}
                  onPress={() => handleTogglePublish(module)}
                >
                  <Ionicons name={module.status === 'draft' ? 'cloud-upload' : 'cloud-offline'} size={18} color={module.status === 'draft' ? '#8B5CF6' : '#F59E0B'} />
                  <Text style={[styles.actionButtonText, { color: module.status === 'draft' ? '#8B5CF6' : '#F59E0B' }]}>
                    {module.status === 'draft' ? 'Publish' : 'Unpublish'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, module.is_featured ? styles.featuredButton : styles.unfeaturedButton]}
                  onPress={() => handleToggleFeatured(module)}
                >
                  <Ionicons name={module.is_featured ? 'star' : 'star-outline'} size={18} color={module.is_featured ? '#8B5CF6' : '#9CA3AF'} />
                  <Text style={[styles.actionButtonText, { color: module.is_featured ? '#8B5CF6' : '#9CA3AF' }]}>
                    {module.is_featured ? 'Featured' : 'Feature'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteModule(module)}
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
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingModule ? 'Edit Module' : 'Create Module'}
              </Text>

              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Module title"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Module description"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Icon</Text>
              <View style={styles.iconTypeSelector}>
                <TouchableOpacity
                  style={[styles.iconTypeButton, iconType === 'emoji' && styles.iconTypeButtonActive]}
                  onPress={() => setIconType('emoji')}
                >
                  <Text style={[styles.iconTypeButtonText, iconType === 'emoji' && styles.iconTypeButtonTextActive]}>
                    Emoji
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconTypeButton, iconType === 'image' && styles.iconTypeButtonActive]}
                  onPress={() => setIconType('image')}
                >
                  <Text style={[styles.iconTypeButtonText, iconType === 'image' && styles.iconTypeButtonTextActive]}>
                    Image
                  </Text>
                </TouchableOpacity>
              </View>

              {iconType === 'emoji' ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={formData.icon}
                    onChangeText={(text) => setFormData({ ...formData, icon: text })}
                    placeholder="📚"
                  />
                  <View style={styles.emojiHelper}>
                    <Text style={styles.emojiHelperTitle}>Select an emoji or type your own above:</Text>
                    <ScrollView style={styles.emojiScrollView} nestedScrollEnabled>
                      <View style={styles.emojiGrid}>
                        {[
                          '📚', '🎓', '📖', '✏️', '🏛️', '⚖️', '🗳️', '👥', '💼', '🌍', '📊', '🔍',
                          '📝', '🏫', '👨‍🎓', '👩‍🎓', '📜', '🎯', '💡', '🏆', '🌟', '⭐', '✨', '🔔',
                          '📢', '📣', '💬', '🗨️', '💭', '🗯️', '📰', '📄', '📃', '📑', '🔖', '🏷️',
                          '💻', '🖥️', '📱', '⌨️', '🖱️', '🖨️', '📡', '🔬', '🔭', '📐', '📏', '📌',
                          '📍', '✂️', '🖊️', '🖍️', '🖌️', '🔏', '📝', '💰', '💵', '💴', '💶', '💷',
                          '🏦', '🏛️', '🏢', '🏬', '🏪', '🏗️', '🏘️', '🏙️', '🌆', '🌇', '🌃', '🌉',
                          '♻️', '⚡', '🔥', '💧', '🌊', '🌳', '🌲', '🌴', '🌱', '🍀', '🌾', '🌿',
                          '🚀', '✈️', '🚁', '🛩️', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉',
                          '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸',
                          '🗿', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌄',
                          '👤', '👥', '👨', '👩', '👨‍💼', '👩‍💼', '👨‍⚖️', '👩‍⚖️', '👨‍🏫', '👩‍🏫', '👨‍🎓', '👩‍🎓',
                          '✅', '❌', '⭕', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤',
                        ].map((emoji) => (
                          <TouchableOpacity
                            key={emoji}
                            style={styles.emojiButton}
                            onPress={() => setFormData({ ...formData, icon: emoji })}
                          >
                            <Text style={styles.emojiButtonText}>{emoji}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                </>
              ) : (
                <View style={styles.imagePickerContainer}>
                  {selectedImage ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                      <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                        <Ionicons name="camera" size={20} color="#FFF" />
                        <Text style={styles.changeImageButtonText}>Change Image</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                      <Ionicons name="cloud-upload" size={32} color="#3B82F6" />
                      <Text style={styles.uploadButtonText}>Upload Module Icon</Text>
                      <Text style={styles.uploadButtonSubtext}>Tap to choose an image</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <Text style={styles.infoText}>
                Note: Total XP is automatically calculated from the sum of lesson XP rewards.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveModule}
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
  modulesList: {
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
  moduleCard: {
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
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  moduleIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  moduleIconImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  moduleMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  moduleStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
  },
  moduleActions: {
    flexDirection: 'row',
    gap: 8,
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
  lessonsButton: {
    backgroundColor: '#F0FDF4',
  },
  publishButton: {
    backgroundColor: '#F5F3FF',
  },
  unpublishButton: {
    backgroundColor: '#FEF3C7',
  },
  featuredButton: {
    backgroundColor: '#F5F3FF',
  },
  unfeaturedButton: {
    backgroundColor: '#F3F4F6',
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
    maxHeight: '80%',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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
  emojiHelper: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emojiHelperTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emojiScrollView: {
    maxHeight: 200,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  emojiButtonText: {
    fontSize: 24,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  iconTypeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  iconTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  iconTypeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  iconTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  iconTypeButtonTextActive: {
    color: '#FFF',
  },
  imagePickerContainer: {
    marginTop: 8,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginTop: 12,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    gap: 12,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  changeImageButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
