import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';

interface ChallengesManagementScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'LearningAdminDashboard'>;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  task_count: number;
  enrollment_count: number;
}

interface Task {
  id: number;
  task_type: 'module';
  task_id: number;
  task_title: string;
  description: string;
  display_order: number;
}

interface AvailableModule {
  id: number;
  title: string;
  description: string;
  lesson_count: number;
  xp_reward: number;
  difficulty: string;
  category: string;
}

export const ChallengesManagementScreen: React.FC<ChallengesManagementScreenProps> = ({ navigation }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [availableModules, setAvailableModules] = useState<AvailableModule[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [xpReward, setXpReward] = useState('500');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [category, setCategory] = useState('Civic Education');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadChallenges();
    loadAvailableContent();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/learning/challenges');
      const data = await response.json();

      if (data.success) {
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
      Alert.alert('Error', 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableContent = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/learning/modules');
      const data = await response.json();

      if (data.success) {
        // Filter to only show published modules
        const publishedModules = (data.modules || [])
          .filter((mod: any) => mod.is_published === 1)
          .map((mod: any) => ({
            id: mod.id,
            title: mod.title,
            description: mod.description || '',
            lesson_count: mod.total_lessons || 0,
            xp_reward: mod.xp_reward || 0,
            difficulty: mod.difficulty || 'beginner',
            category: mod.category || 'General'
          }));
        setAvailableModules(publishedModules);
      }
    } catch (error) {
      console.error('Error loading available modules:', error);
    }
  };

  const loadChallengeTasks = async (challengeId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/learning/challenges/${challengeId}`);
      const data = await response.json();

      if (data.success) {
        setTasks(data.challenge.tasks || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load challenge tasks');
    }
  };

  const handleCreateChallenge = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/learning/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          xp_reward: parseInt(xpReward) || 500,
          difficulty,
          category,
          active: true,
          start_date: startDate || null,
          end_date: endDate || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Challenge created successfully!');
        setShowCreateModal(false);
        resetForm();
        loadChallenges();
      } else {
        Alert.alert('Error', data.message || 'Failed to create challenge');
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      Alert.alert('Error', 'Failed to create challenge');
    }
  };

  const handleToggleActive = async (challenge: Challenge) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/learning/challenges/${challenge.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !challenge.active }),
      });

      const data = await response.json();

      if (data.success) {
        loadChallenges();
      } else {
        Alert.alert('Error', data.message || 'Failed to update challenge');
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
      Alert.alert('Error', 'Failed to update challenge');
    }
  };

  const handleEditChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setTitle(challenge.title);
    setDescription(challenge.description);
    setXpReward(challenge.xp_reward.toString());
    setDifficulty(challenge.difficulty);
    setCategory(challenge.category);
    setStartDate(challenge.start_date ? challenge.start_date.split('T')[0] : '');
    setEndDate(challenge.end_date ? challenge.end_date.split('T')[0] : '');
    setShowEditModal(true);
  };

  const handleUpdateChallenge = async () => {
    if (!selectedChallenge) return;

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/learning/challenges/${selectedChallenge.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          xp_reward: parseInt(xpReward) || 500,
          difficulty,
          category,
          start_date: startDate || null,
          end_date: endDate || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Challenge updated successfully!');
        setShowEditModal(false);
        resetForm();
        setSelectedChallenge(null);
        loadChallenges();
      } else {
        Alert.alert('Error', data.message || 'Failed to update challenge');
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
      Alert.alert('Error', 'Failed to update challenge');
    }
  };

  const handleDeleteChallenge = (challenge: Challenge) => {
    Alert.alert(
      'Delete Challenge',
      `Are you sure you want to delete "${challenge.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://localhost:5000/api/admin/learning/challenges/${challenge.id}`, {
                method: 'DELETE',
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert('Success', 'Challenge deleted successfully');
                loadChallenges();
              } else {
                Alert.alert('Error', data.message || 'Failed to delete challenge');
              }
            } catch (error) {
              console.error('Error deleting challenge:', error);
              Alert.alert('Error', 'Failed to delete challenge');
            }
          },
        },
      ]
    );
  };

  const handleManageTasks = async (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    await loadChallengeTasks(challenge.id);
    setShowTasksModal(true);
  };

  const handleAddTask = async (moduleId: number) => {
    if (!selectedChallenge) {
      console.error('No challenge selected');
      return;
    }

    console.log('Adding module:', moduleId, 'to challenge:', selectedChallenge.id);

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/learning/challenges/${selectedChallenge.id}/tasks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task_type: 'module', task_id: moduleId }),
        }
      );

      const data = await response.json();
      console.log('Add module response:', data);

      if (data.success) {
        console.log('Module added successfully, reloading tasks...');
        await loadChallengeTasks(selectedChallenge.id);
        await loadChallenges(); // Reload challenges to update task count
        Alert.alert('Success', 'Module added successfully');
      } else {
        console.error('Failed to add module:', data.message);
        Alert.alert('Error', data.message || 'Failed to add module');
      }
    } catch (error) {
      console.error('Error adding module:', error);
      Alert.alert('Error', 'Failed to add module');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!selectedChallenge) {
      console.error('No challenge selected');
      return;
    }

    console.log('Removing task:', taskId, 'from challenge:', selectedChallenge.id);

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/learning/challenges/${selectedChallenge.id}/tasks/${taskId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();
      console.log('Remove task response:', data);

      if (data.success) {
        console.log('Task removed successfully, reloading tasks...');
        await loadChallengeTasks(selectedChallenge.id);
        await loadChallenges(); // Reload challenges to update task count
        Alert.alert('Success', 'Module removed successfully');
      } else {
        console.error('Failed to remove task:', data.message);
        Alert.alert('Error', data.message || 'Failed to remove task');
      }
    } catch (error) {
      console.error('Error removing task:', error);
      Alert.alert('Error', 'Failed to remove task');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setXpReward('500');
    setDifficulty('medium');
    setCategory('Civic Education');
    setStartDate('');
    setEndDate('');
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderChallenge = ({ item }: { item: Challenge }) => (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View style={styles.challengeTitleRow}>
          <Text style={styles.challengeTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.active ? '#DCFCE7' : '#FEE2E2' }]}>
            <Text style={[styles.statusText, { color: item.active ? '#10B981' : '#EF4444' }]}>
              {item.active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <Text style={styles.challengeDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <View style={styles.challengeStats}>
        <View style={styles.statItem}>
          <MaterialIcons name="stars" size={16} color="#8B5CF6" />
          <Text style={styles.statText}>{item.xp_reward} XP</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="assignment" size={16} color="#3B82F6" />
          <Text style={styles.statText}>{item.task_count} tasks</Text>
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
          <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
            {item.difficulty}
          </Text>
        </View>
      </View>

      <View style={styles.challengeActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.tasksButton]}
          onPress={() => handleManageTasks(item)}
        >
          <MaterialIcons name="playlist-add" size={18} color="#8B5CF6" />
          <Text style={[styles.actionButtonText, { color: '#8B5CF6' }]}>Manage Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditChallenge(item)}
        >
          <MaterialIcons name="edit" size={18} color="#3B82F6" />
          <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, item.active ? styles.deactivateButton : styles.activateButton]}
          onPress={() => handleToggleActive(item)}
        >
          <MaterialIcons name={item.active ? 'visibility-off' : 'visibility'} size={18} color={item.active ? '#F59E0B' : '#10B981'} />
          <Text style={[styles.actionButtonText, { color: item.active ? '#F59E0B' : '#10B981' }]}>
            {item.active ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteChallenge(item)}
        >
          <MaterialIcons name="delete" size={18} color="#EF4444" />
          <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskIconContainer}>
        <MaterialIcons
          name="folder"
          size={20}
          color="#3B82F6"
        />
      </View>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{item.task_title}</Text>
        <Text style={styles.taskType}>Module</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
        <MaterialIcons name="close" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenges Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : (
        <FlatList
          data={challenges}
          renderItem={renderChallenge}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="emoji-events" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No challenges yet</Text>
              <Text style={styles.emptySubtext}>Create your first challenge to get started</Text>
            </View>
          }
        />
      )}

      {/* Create Challenge Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Challenge</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter challenge title"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter challenge description"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>XP Reward</Text>
              <TextInput
                style={styles.input}
                value={xpReward}
                onChangeText={setXpReward}
                placeholder="500"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.difficultySelector}>
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <TouchableOpacity
                    key={diff}
                    style={[
                      styles.difficultyOption,
                      difficulty === diff && styles.difficultyOptionSelected,
                      { borderColor: getDifficultyColor(diff) }
                    ]}
                    onPress={() => setDifficulty(diff)}
                  >
                    <Text
                      style={[
                        styles.difficultyOptionText,
                        difficulty === diff && { color: getDifficultyColor(diff) }
                      ]}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="Civic Education"
              />

              <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="2025-01-01"
              />

              <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="2025-01-07"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateChallenge}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Challenge Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowEditModal(false);
          resetForm();
          setSelectedChallenge(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Challenge</Text>
              <TouchableOpacity onPress={() => {
                setShowEditModal(false);
                resetForm();
                setSelectedChallenge(null);
              }}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter challenge title"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter challenge description"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>XP Reward</Text>
              <TextInput
                style={styles.input}
                value={xpReward}
                onChangeText={setXpReward}
                placeholder="500"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.difficultySelector}>
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <TouchableOpacity
                    key={diff}
                    style={[
                      styles.difficultyOption,
                      difficulty === diff && styles.difficultyOptionSelected,
                      { borderColor: getDifficultyColor(diff) }
                    ]}
                    onPress={() => setDifficulty(diff)}
                  >
                    <Text
                      style={[
                        styles.difficultyOptionText,
                        difficulty === diff && { color: getDifficultyColor(diff) }
                      ]}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="Civic Education"
              />

              <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="2025-01-01"
              />

              <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="2025-01-07"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  resetForm();
                  setSelectedChallenge(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleUpdateChallenge}
              >
                <Text style={styles.createButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manage Tasks Modal */}
      <Modal
        visible={showTasksModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTasksModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Tasks</Text>
              <TouchableOpacity onPress={() => setShowTasksModal(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Instructions */}
              <View style={styles.instructionBanner}>
                <MaterialIcons name="info" size={20} color="#3B82F6" />
                <Text style={styles.instructionText}>
                  Click the + icon next to any module below to add it to this challenge
                </Text>
              </View>

              {/* Current Tasks */}
              <Text style={styles.sectionTitle}>Current Modules ({tasks.length})</Text>
              {tasks.length === 0 ? (
                <Text style={styles.emptyTasksText}>No modules added yet. Add modules below.</Text>
              ) : (
                tasks.map((task) => (
                  <View key={task.id}>
                    {renderTask({ item: task })}
                  </View>
                ))
              )}

              {/* Available Modules */}
              <Text style={styles.sectionTitle}>Available Modules</Text>
              {availableModules.length === 0 ? (
                <Text style={styles.emptyTasksText}>No modules available</Text>
              ) : (
                availableModules.map((module) => (
                  <TouchableOpacity
                    key={`module-${module.id}`}
                    style={styles.availableItem}
                    onPress={() => handleAddTask(module.id)}
                  >
                    <MaterialIcons name="folder" size={20} color="#3B82F6" />
                    <View style={styles.availableInfo}>
                      <Text style={styles.availableTitle}>{module.title}</Text>
                      <Text style={styles.availableModule}>
                        {module.lesson_count} lessons • {module.difficulty} • {module.xp_reward} XP
                      </Text>
                    </View>
                    <MaterialIcons name="add-circle" size={20} color="#10B981" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
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
    marginTop: 8,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeHeader: {
    marginBottom: 12,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  challengeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  challengeActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    minWidth: 100,
    justifyContent: 'center',
  },
  tasksButton: {
    backgroundColor: '#F3E8FF',
  },
  editButton: {
    backgroundColor: '#DBEAFE',
  },
  activateButton: {
    backgroundColor: '#DCFCE7',
  },
  deactivateButton: {
    backgroundColor: '#FEF3C7',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  difficultySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  difficultyOptionSelected: {
    backgroundColor: '#F9FAFB',
  },
  difficultyOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  createButton: {
    backgroundColor: '#8B5CF6',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructionBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  instructionText: {
    fontSize: 13,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyTasksText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  taskType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  availableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  availableInfo: {
    flex: 1,
    marginLeft: 12,
  },
  availableTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  availableModule: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
