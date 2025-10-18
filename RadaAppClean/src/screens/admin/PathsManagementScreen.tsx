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

interface LearningPath {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_hours: number;
  icon: string;
  color: string;
  is_published: boolean;
  total_modules?: number;
  enrollment_count?: number;
}

interface Module {
  id: number;
  title: string;
  icon: string;
}

export default function PathsManagementScreen({ navigation }: any) {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modulesModalVisible, setModulesModalVisible] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [pathModules, setPathModules] = useState<Module[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Government',
    difficulty: 'Beginner',
    estimated_hours: 10,
    icon: 'map',
    color: '#3B82F6',
    is_published: true,
  });

  useEffect(() => {
    fetchPaths();
    fetchAllModules();
  }, []);

  const fetchPaths = async () => {
    try {
      setLoading(true);
      const response = await LearningAPIService.adminGetPaths();
      setPaths(response.paths || []);
    } catch (error) {
      console.error('Error fetching paths:', error);
      Alert.alert('Error', 'Failed to load learning paths');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllModules = async () => {
    try {
      const response = await LearningAPIService.adminGetModules();
      setAllModules(response.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchPathModules = async (pathId: number) => {
    try {
      const response = await LearningAPIService.adminGetPathById(pathId);
      setPathModules(response.path?.modules || []);
    } catch (error) {
      console.error('Error fetching path modules:', error);
    }
  };

  const handleCreatePath = () => {
    setEditingPath(null);
    setFormData({
      title: '',
      description: '',
      category: 'Government',
      difficulty: 'Beginner',
      estimated_hours: 10,
      icon: 'map',
      color: '#3B82F6',
      is_published: true,
    });
    setModalVisible(true);
  };

  const handleEditPath = (path: LearningPath) => {
    setEditingPath(path);
    setFormData({
      title: path.title,
      description: path.description,
      category: path.category,
      difficulty: path.difficulty,
      estimated_hours: path.estimated_hours,
      icon: path.icon,
      color: path.color,
      is_published: path.is_published,
    });
    setModalVisible(true);
  };

  const handleSavePath = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a path title');
      return;
    }

    try {
      if (editingPath) {
        await LearningAPIService.adminUpdatePath(editingPath.id, formData);
      } else {
        await LearningAPIService.adminCreatePath(formData);
      }
      setModalVisible(false);
      fetchPaths();
      Alert.alert('Success', `Path ${editingPath ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving path:', error);
      Alert.alert('Error', 'Failed to save path');
    }
  };

  const handleDeletePath = (path: LearningPath) => {
    Alert.alert(
      'Delete Learning Path',
      `Are you sure you want to delete "${path.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await LearningAPIService.adminDeletePath(path.id);
              fetchPaths();
              Alert.alert('Success', 'Path deleted successfully');
            } catch (error) {
              console.error('Error deleting path:', error);
              Alert.alert('Error', 'Failed to delete path');
            }
          },
        },
      ]
    );
  };

  const handleManageModules = async (path: LearningPath) => {
    setSelectedPath(path);
    await fetchPathModules(path.id);
    setModulesModalVisible(true);
  };

  const handleAddModule = async (moduleId: number) => {
    if (!selectedPath) return;

    try {
      await LearningAPIService.adminAddModuleToPath(selectedPath.id, moduleId);
      await fetchPathModules(selectedPath.id);
      Alert.alert('Success', 'Module added to path');
    } catch (error) {
      console.error('Error adding module:', error);
      Alert.alert('Error', 'Failed to add module');
    }
  };

  const handleRemoveModule = async (moduleId: number) => {
    if (!selectedPath) return;

    try {
      await LearningAPIService.adminRemoveModuleFromPath(selectedPath.id, moduleId);
      await fetchPathModules(selectedPath.id);
      Alert.alert('Success', 'Module removed from path');
    } catch (error) {
      console.error('Error removing module:', error);
      Alert.alert('Error', 'Failed to remove module');
    }
  };

  const difficultyColors = {
    Beginner: '#10B981',
    Intermediate: '#F59E0B',
    Advanced: '#EF4444',
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
        <Text style={styles.headerTitle}>Learning Paths</Text>
        <TouchableOpacity onPress={handleCreatePath} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Paths List */}
      <ScrollView style={styles.pathsList}>
        {paths.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="git-branch-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No learning paths yet</Text>
            <Text style={styles.emptySubtext}>Create your first curated learning journey</Text>
          </View>
        ) : (
          paths.map((path) => (
            <View key={path.id} style={[styles.pathCard, { borderLeftColor: path.color }]}>
              <View style={styles.pathHeader}>
                <View style={[styles.pathIcon, { backgroundColor: path.color + '20' }]}>
                  <Ionicons name={path.icon as any} size={28} color={path.color} />
                </View>
                <View style={styles.pathInfo}>
                  <Text style={styles.pathTitle}>{path.title}</Text>
                  <Text style={styles.pathDescription} numberOfLines={2}>
                    {path.description}
                  </Text>
                </View>
              </View>

              <View style={styles.pathMeta}>
                <View style={[styles.badge, { backgroundColor: difficultyColors[path.difficulty as keyof typeof difficultyColors] + '20' }]}>
                  <Text style={[styles.badgeText, { color: difficultyColors[path.difficulty as keyof typeof difficultyColors] }]}>
                    {path.difficulty}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{path.category}</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="book" size={12} color="#6B7280" />
                  <Text style={styles.badgeText}>{path.total_modules || 0} modules</Text>
                </View>
                {path.is_published ? (
                  <View style={[styles.badge, { backgroundColor: '#10B98120' }]}>
                    <Text style={[styles.badgeText, { color: '#10B981' }]}>Published</Text>
                  </View>
                ) : (
                  <View style={[styles.badge, { backgroundColor: '#F59E0B20' }]}>
                    <Text style={[styles.badgeText, { color: '#F59E0B' }]}>Draft</Text>
                  </View>
                )}
              </View>

              <View style={styles.pathStats}>
                <View style={styles.stat}>
                  <Ionicons name="time" size={16} color="#6B7280" />
                  <Text style={styles.statText}>{path.estimated_hours} hours</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="people" size={16} color="#6B7280" />
                  <Text style={styles.statText}>{path.enrollment_count || 0} enrolled</Text>
                </View>
              </View>

              <View style={styles.pathActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditPath(path)}
                >
                  <Ionicons name="create" size={18} color="#3B82F6" />
                  <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.modulesButton]}
                  onPress={() => handleManageModules(path)}
                >
                  <Ionicons name="list" size={18} color="#8B5CF6" />
                  <Text style={[styles.actionButtonText, { color: '#8B5CF6' }]}>Modules</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeletePath(path)}
                >
                  <Ionicons name="trash" size={18} color="#EF4444" />
                  <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Edit Path Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingPath ? 'Edit Path' : 'Create Path'}
              </Text>

              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Path title"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Path description"
                multiline
                numberOfLines={3}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Category</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.category}
                    onChangeText={(text) => setFormData({ ...formData, category: text })}
                    placeholder="Government"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Est. Hours</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.estimated_hours)}
                    onChangeText={(text) => setFormData({ ...formData, estimated_hours: parseInt(text) || 0 })}
                    keyboardType="numeric"
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
                  onPress={handleSavePath}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Manage Modules Modal */}
      <Modal visible={modulesModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Modules</Text>
            <Text style={styles.modalSubtitle}>{selectedPath?.title}</Text>

            <ScrollView style={styles.modulesListContainer}>
              <Text style={styles.sectionTitle}>Modules in Path ({pathModules.length})</Text>
              {pathModules.map((module) => (
                <View key={module.id} style={styles.moduleItem}>
                  <Text style={styles.moduleIcon}>{module.icon}</Text>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveModule(module.id)}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Available Modules</Text>
              {allModules
                .filter((m) => !pathModules.find((pm) => pm.id === m.id))
                .map((module) => (
                  <View key={module.id} style={styles.moduleItem}>
                    <Text style={styles.moduleIcon}>{module.icon}</Text>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <TouchableOpacity
                      style={styles.addModuleButton}
                      onPress={() => handleAddModule(module.id)}
                    >
                      <Ionicons name="add-circle" size={24} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { marginTop: 16 }]}
              onPress={() => {
                setModulesModalVisible(false);
                fetchPaths();
              }}
            >
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
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
  pathsList: {
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
  pathCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pathIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pathInfo: {
    flex: 1,
  },
  pathTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  pathDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  pathMeta: {
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
  pathStats: {
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
  pathActions: {
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
  modulesButton: {
    backgroundColor: '#F3E8FF',
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
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
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
  modulesListContainer: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  moduleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  moduleTitle: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  removeButton: {
    padding: 4,
  },
  addModuleButton: {
    padding: 4,
  },
});
