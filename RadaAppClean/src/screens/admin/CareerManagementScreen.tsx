import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import adminAPI from '../../services/AdminAPIService';

interface CareerManagementScreenProps {
  navigation: NativeStackNavigationProp<any, 'CareerManagement'>;
  route: {
    params?: {
      politicianId?: number;
    };
  };
}

interface Politician {
  id: number;
  name: string;
  education?: string;
  current_position?: string;
  key_achievements?: string[];
  education_sources?: SourceLink[];
  achievements_sources?: SourceLink[];
  position_sources?: SourceLink[];
}

interface SourceLink {
  type: string;
  url: string;
  title: string;
  source: string;
  date: string;
}

export const CareerManagementScreen: React.FC<CareerManagementScreenProps> = ({ navigation, route }) => {
  const [selectedPolitician, setSelectedPolitician] = useState<Politician | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSection, setEditSection] = useState<'education' | 'position' | 'achievements' | null>(null);

  // Form states
  const [education, setEducation] = useState('');
  const [position, setPosition] = useState('');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState('');

  useEffect(() => {
    if (route.params?.politicianId) {
      loadPoliticianCareer(route.params.politicianId);
    }
  }, [route.params?.politicianId]);

  const loadPoliticianCareer = async (politicianId: number) => {
    try {
      setLoading(true);
      const response = await adminAPI.getPolitician(politicianId);
      if (response.success && response.data) {
        setSelectedPolitician(response.data);
        setEducation(response.data.education || '');
        setPosition(response.data.current_position || '');
        setAchievements(response.data.key_achievements || []);
      }
    } catch (error) {
      console.error('Error loading career:', error);
      Alert.alert('Error', 'Failed to load career information');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (section: 'education' | 'position' | 'achievements') => {
    setEditSection(section);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!selectedPolitician) return;

    try {
      setLoading(true);
      const updateData: any = {};

      if (editSection === 'education') {
        updateData.education = education;
      } else if (editSection === 'position') {
        updateData.current_position = position;
      } else if (editSection === 'achievements') {
        updateData.key_achievements = achievements;
      }

      const response = await adminAPI.updatePolitician(selectedPolitician.id, updateData);

      if (response.success) {
        Alert.alert('Success', 'Career information updated successfully');
        setShowEditModal(false);
        loadPoliticianCareer(selectedPolitician.id);
      } else {
        Alert.alert('Error', response.error || 'Failed to update career information');
      }
    } catch (error) {
      console.error('Error updating career:', error);
      Alert.alert('Error', 'Failed to update career information');
    } finally {
      setLoading(false);
    }
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements([...achievements, newAchievement.trim()]);
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const renderEditModal = () => {
    if (!editSection) return null;

    return (
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEditModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editSection === 'education' ? 'Edit Education' :
               editSection === 'position' ? 'Edit Position' :
               'Edit Achievements'}
            </Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {editSection === 'education' && (
              <View>
                <Text style={styles.formLabel}>Education Background</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={education}
                  onChangeText={setEducation}
                  placeholder="e.g., Master of Public Administration, National University (2018)"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}

            {editSection === 'position' && (
              <View>
                <Text style={styles.formLabel}>Current Position</Text>
                <TextInput
                  style={styles.input}
                  value={position}
                  onChangeText={setPosition}
                  placeholder="e.g., Member of Parliament"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}

            {editSection === 'achievements' && (
              <View>
                <Text style={styles.formLabel}>Key Achievements</Text>
                <View style={styles.achievementsContainer}>
                  {achievements.map((achievement, index) => (
                    <View key={index} style={styles.achievementItem}>
                      <Text style={styles.achievementText}>{achievement}</Text>
                      <TouchableOpacity onPress={() => removeAchievement(index)}>
                        <MaterialIcons name="close" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <View style={styles.addAchievementContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={newAchievement}
                    onChangeText={setNewAchievement}
                    placeholder="Add new achievement"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addAchievement}
                  >
                    <MaterialIcons name="add" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Career Management</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {selectedPolitician ? (
          <ScrollView style={styles.careerDetails}>
            <View style={styles.selectedPoliticianHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedPoliticianName}>{selectedPolitician.name}</Text>
                <Text style={styles.selectedPoliticianPosition}>{selectedPolitician.current_position || 'No position'}</Text>
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => navigation.navigate('PoliticianSelector', {
                  targetScreen: 'CareerManagement',
                  title: 'Career Management',
                  allowViewAll: false,
                })}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Education Section */}
            <View style={styles.careerSection}>
              <View style={styles.careerSectionHeader}>
                <View style={styles.careerSectionTitle}>
                  <MaterialIcons name="school" size={24} color="#8B5CF6" />
                  <Text style={styles.careerSectionText}>Education</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal('education')}
                >
                  <MaterialIcons name="edit" size={20} color="#8B5CF6" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.careerContent}>
                {selectedPolitician.education || 'No education information added'}
              </Text>
            </View>

            {/* Position Section */}
            <View style={styles.careerSection}>
              <View style={styles.careerSectionHeader}>
                <View style={styles.careerSectionTitle}>
                  <MaterialIcons name="work" size={24} color="#8B5CF6" />
                  <Text style={styles.careerSectionText}>Current Position</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal('position')}
                >
                  <MaterialIcons name="edit" size={20} color="#8B5CF6" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.careerContent}>
                {selectedPolitician.current_position || 'No position information added'}
              </Text>
            </View>

            {/* Achievements Section */}
            <View style={styles.careerSection}>
              <View style={styles.careerSectionHeader}>
                <View style={styles.careerSectionTitle}>
                  <MaterialIcons name="emoji-events" size={24} color="#8B5CF6" />
                  <Text style={styles.careerSectionText}>Key Achievements</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal('achievements')}
                >
                  <MaterialIcons name="edit" size={20} color="#8B5CF6" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
              {selectedPolitician.key_achievements && selectedPolitician.key_achievements.length > 0 ? (
                <View style={styles.achievementsList}>
                  {selectedPolitician.key_achievements.map((achievement, index) => (
                    <View key={index} style={styles.achievementItemDisplay}>
                      <View style={styles.bullet} />
                      <Text style={styles.achievementTextDisplay}>{achievement}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.careerContent}>No achievements added</Text>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="person-off" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Politician Selected</Text>
            <Text style={styles.emptySubtitle}>
              Please select a politician from the previous screen to manage their career information.
            </Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.selectButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {renderEditModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  politiciansList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  politicianCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  politicianInfo: {
    flex: 1,
  },
  politicianName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  politicianPosition: {
    fontSize: 14,
    color: '#6B7280',
  },
  careerDetails: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  selectedPoliticianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  selectedPoliticianName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedPoliticianPosition: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  changeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  careerSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  careerSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  careerSectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  careerSectionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  careerContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItemDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginTop: 7,
  },
  achievementTextDisplay: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalSaveButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  achievementsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  achievementText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  addAchievementContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  selectButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
