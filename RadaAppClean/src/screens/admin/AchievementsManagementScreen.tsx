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

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  criteria_type: string;
  criteria_value: number;
  xp_reward: number;
  users_earned?: number;
}

export default function AchievementsManagementScreen({ navigation }: any) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'trophy',
    rarity: 'Common',
    criteria_type: 'lessons_completed',
    criteria_value: 10,
    xp_reward: 100,
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await LearningAPIService.adminGetAchievements();
      setAchievements(response.achievements || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      Alert.alert('Error', 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAchievement = () => {
    setEditingAchievement(null);
    setFormData({
      title: '',
      description: '',
      icon: 'trophy',
      rarity: 'Common',
      criteria_type: 'lessons_completed',
      criteria_value: 10,
      xp_reward: 100,
    });
    setModalVisible(true);
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      rarity: achievement.rarity,
      criteria_type: achievement.criteria_type,
      criteria_value: achievement.criteria_value,
      xp_reward: achievement.xp_reward,
    });
    setModalVisible(true);
  };

  const handleSaveAchievement = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter an achievement title');
      return;
    }

    try {
      if (editingAchievement) {
        await LearningAPIService.adminUpdateAchievement(editingAchievement.id, formData);
      } else {
        await LearningAPIService.adminCreateAchievement(formData);
      }
      setModalVisible(false);
      fetchAchievements();
      Alert.alert('Success', `Achievement ${editingAchievement ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving achievement:', error);
      Alert.alert('Error', 'Failed to save achievement');
    }
  };

  const handleDeleteAchievement = (achievement: Achievement) => {
    Alert.alert(
      'Delete Achievement',
      `Are you sure you want to delete "${achievement.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await LearningAPIService.adminDeleteAchievement(achievement.id);
              fetchAchievements();
              Alert.alert('Success', 'Achievement deleted successfully');
            } catch (error) {
              console.error('Error deleting achievement:', error);
              Alert.alert('Error', 'Failed to delete achievement');
            }
          },
        },
      ]
    );
  };

  const rarityColors = {
    Common: '#10B981',
    Rare: '#3B82F6',
    Epic: '#8B5CF6',
    Legendary: '#F59E0B',
  };

  const criteriaTypes = [
    { value: 'lessons_completed', label: 'Lessons Completed' },
    { value: 'quizzes_passed', label: 'Quizzes Passed' },
    { value: 'quizzes_perfect', label: 'Perfect Quiz Scores' },
    { value: 'total_xp', label: 'Total XP Earned' },
    { value: 'streak_days', label: 'Daily Streak' },
    { value: 'modules_completed', label: 'Modules Completed' },
  ];

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
        <Text style={styles.headerTitle}>Achievements</Text>
        <TouchableOpacity onPress={handleCreateAchievement} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Achievements List */}
      <ScrollView style={styles.achievementsList}>
        {achievements.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No achievements yet</Text>
            <Text style={styles.emptySubtext}>Create your first achievement</Text>
          </View>
        ) : (
          achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                { borderLeftColor: rarityColors[achievement.rarity] },
              ]}
            >
              <View style={styles.achievementHeader}>
                <View
                  style={[
                    styles.achievementIcon,
                    { backgroundColor: rarityColors[achievement.rarity] + '20' },
                  ]}
                >
                  <Ionicons
                    name={achievement.icon as any}
                    size={32}
                    color={rarityColors[achievement.rarity]}
                  />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription} numberOfLines={2}>
                    {achievement.description}
                  </Text>
                </View>
              </View>

              <View style={styles.achievementMeta}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: rarityColors[achievement.rarity] + '20' },
                  ]}
                >
                  <Text
                    style={[styles.badgeText, { color: rarityColors[achievement.rarity] }]}
                  >
                    {achievement.rarity}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="flag" size={12} color="#6B7280" />
                  <Text style={styles.badgeText}>
                    {criteriaTypes.find((c) => c.value === achievement.criteria_type)?.label}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="star" size={12} color="#6B7280" />
                  <Text style={styles.badgeText}>{achievement.xp_reward} XP</Text>
                </View>
              </View>

              <View style={styles.criteriaContainer}>
                <Text style={styles.criteriaText}>
                  Unlock: {achievement.criteria_value}{' '}
                  {criteriaTypes.find((c) => c.value === achievement.criteria_type)?.label}
                </Text>
                <Text style={styles.earnedText}>
                  {achievement.users_earned || 0} users earned
                </Text>
              </View>

              <View style={styles.achievementActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditAchievement(achievement)}
                >
                  <Ionicons name="create" size={18} color="#3B82F6" />
                  <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteAchievement(achievement)}
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
                {editingAchievement ? 'Edit Achievement' : 'Create Achievement'}
              </Text>

              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Achievement title"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="How to earn this achievement"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Icon Name</Text>
              <TextInput
                style={styles.input}
                value={formData.icon}
                onChangeText={(text) => setFormData({ ...formData, icon: text })}
                placeholder="trophy, star, medal, etc."
              />
              <View style={styles.iconHelper}>
                <Text style={styles.iconHelperTitle}>Quick select:</Text>
                <View style={styles.iconGrid}>
                  {[
                    { name: 'trophy', icon: 'trophy' },
                    { name: 'medal', icon: 'medal' },
                    { name: 'star', icon: 'star' },
                    { name: 'ribbon', icon: 'ribbon' },
                    { name: 'checkmark-circle', icon: 'checkmark-circle' },
                    { name: 'flash', icon: 'flash' },
                    { name: 'flame', icon: 'flame' },
                    { name: 'shield', icon: 'shield' },
                    { name: 'diamond', icon: 'diamond' },
                    { name: 'rocket', icon: 'rocket' },
                    { name: 'flag', icon: 'flag' },
                    { name: 'heart', icon: 'heart' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.name}
                      style={styles.iconButton}
                      onPress={() => setFormData({ ...formData, icon: item.name })}
                    >
                      <Ionicons name={item.icon as any} size={20} color="#3B82F6" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={styles.label}>Rarity</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.rarity}
                  onValueChange={(value) => setFormData({ ...formData, rarity: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Common" value="Common" />
                  <Picker.Item label="Rare" value="Rare" />
                  <Picker.Item label="Epic" value="Epic" />
                  <Picker.Item label="Legendary" value="Legendary" />
                </Picker>
              </View>

              <Text style={styles.label}>Criteria Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.criteria_type}
                  onValueChange={(value) => setFormData({ ...formData, criteria_type: value })}
                  style={styles.picker}
                >
                  {criteriaTypes.map((type) => (
                    <Picker.Item key={type.value} label={type.label} value={type.value} />
                  ))}
                </Picker>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Criteria Value</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.criteria_value)}
                    onChangeText={(text) =>
                      setFormData({ ...formData, criteria_value: parseInt(text) || 0 })
                    }
                    keyboardType="numeric"
                    placeholder="10"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>XP Reward</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.xp_reward)}
                    onChangeText={(text) =>
                      setFormData({ ...formData, xp_reward: parseInt(text) || 0 })
                    }
                    keyboardType="numeric"
                    placeholder="100"
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
                  onPress={handleSaveAchievement}
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
  achievementsList: {
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
  achievementCard: {
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
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  achievementMeta: {
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
  criteriaContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  criteriaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  earnedText: {
    fontSize: 12,
    color: '#6B7280',
  },
  achievementActions: {
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
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
  iconHelper: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconHelperTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
});
