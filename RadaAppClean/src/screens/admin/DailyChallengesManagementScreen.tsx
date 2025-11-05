import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';

interface DailyChallengesManagementScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

interface Challenge {
  id: number;
  challenge_date: string;
  quiz_id: number;
  quiz_title?: string;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
}

interface Quiz {
  id: number;
  title: string;
  quiz_type: string;
  question_count: number;
}

interface Stats {
  total_challenges: number;
  total_attempts: number;
  average_score: number;
  participation_rate: number;
  active_streaks: number;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const DailyChallengesManagementScreen: React.FC<DailyChallengesManagementScreenProps> = ({ navigation }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [xpReward, setXpReward] = useState('100');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchChallenges(),
        fetchAvailableQuizzes(),
        fetchStats(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChallenges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/learning/daily-challenges`);
      if (response.data.success) {
        setChallenges(response.data.challenges);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchAvailableQuizzes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/learning/quizzes/available-for-challenges`);
      if (response.data.success) {
        setAvailableQuizzes(response.data.quizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/learning/daily-challenges/analytics`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateChallenge = async () => {
    console.log('CREATE CHALLENGE CLICKED');
    console.log('Selected Quiz ID:', selectedQuizId);
    console.log('Selected Date:', selectedDate);
    console.log('XP Reward:', xpReward);

    if (!selectedQuizId) {
      Alert.alert('Error', 'Please select a quiz');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    try {
      console.log('Sending request to create challenge...');
      const response = await axios.post(`${API_BASE_URL}/admin/learning/daily-challenges`, {
        challenge_date: selectedDate,
        quiz_id: selectedQuizId,
        xp_reward: parseInt(xpReward),
      });

      console.log('Response:', response.data);

      if (response.data.success) {
        Alert.alert('Success', 'Daily challenge created successfully');
        setShowCreateModal(false);
        fetchChallenges();
        // Reset form
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setSelectedQuizId(null);
        setXpReward('100');
      } else {
        console.log('Response not successful:', response.data);
        Alert.alert('Error', response.data.message || 'Failed to create challenge');
      }
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create challenge');
    }
  };

  const handleToggleActive = async (challengeId: number, currentStatus: boolean) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/learning/daily-challenges/${challengeId}`, {
        is_active: !currentStatus,
      });

      if (response.data.success) {
        Alert.alert('Success', `Challenge ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchChallenges();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update challenge');
    }
  };

  const handleDeleteChallenge = async (challengeId: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this challenge? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_BASE_URL}/admin/learning/daily-challenges/${challengeId}`);

              if (response.data.success) {
                Alert.alert('Success', 'Challenge deleted successfully');
                fetchChallenges();
              }
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete challenge');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Daily Challenges</Text>
          <Text style={styles.headerSubtitle}>Manage & Schedule</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialIcons name="emoji-events" size={32} color="#F59E0B" />
              <Text style={styles.statValue}>{stats.total_challenges}</Text>
              <Text style={styles.statLabel}>Total Challenges</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="people" size={32} color="#8B5CF6" />
              <Text style={styles.statValue}>{stats.total_attempts}</Text>
              <Text style={styles.statLabel}>Total Attempts</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="trending-up" size={32} color="#10B981" />
              <Text style={styles.statValue}>{stats.average_score}%</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="local-fire-department" size={32} color="#EF4444" />
              <Text style={styles.statValue}>{stats.active_streaks}</Text>
              <Text style={styles.statLabel}>Active Streaks</Text>
            </View>
          </View>
        )}

        {/* Challenges List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Challenges</Text>

          {challenges.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-busy" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No challenges scheduled</Text>
              <Text style={styles.emptySubtext}>Create your first daily challenge</Text>
            </View>
          ) : (
            challenges.map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                  <View style={styles.challengeInfo}>
                    <Text style={styles.challengeDate}>
                      {formatDate(challenge.challenge_date)}
                    </Text>
                    <Text style={styles.challengeQuiz}>{challenge.quiz_title || `Quiz #${challenge.quiz_id}`}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: challenge.is_active ? '#DCFCE7' : '#FEE2E2' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: challenge.is_active ? '#065F46' : '#991B1B' }
                    ]}>
                      {challenge.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                <View style={styles.challengeDetails}>
                  <View style={styles.detailItem}>
                    <MaterialIcons name="stars" size={16} color="#8B5CF6" />
                    <Text style={styles.detailText}>{challenge.xp_reward} XP</Text>
                  </View>
                </View>

                <View style={styles.challengeActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => {
                      // Pre-fill form with challenge data
                      setSelectedDate(challenge.challenge_date.split('T')[0]);
                      setSelectedQuizId(challenge.quiz_id);
                      setXpReward(challenge.xp_reward.toString());
                      setShowCreateModal(true);
                    }}
                  >
                    <MaterialIcons name="edit" size={18} color="#3B82F6" />
                    <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.toggleButton]}
                    onPress={() => handleToggleActive(challenge.id, challenge.is_active)}
                  >
                    <MaterialIcons
                      name={challenge.is_active ? 'visibility-off' : 'visibility'}
                      size={18}
                      color="#8B5CF6"
                    />
                    <Text style={styles.actionButtonText}>
                      {challenge.is_active ? 'Unpublish' : 'Publish'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteChallenge(challenge.id)}
                  >
                    <MaterialIcons name="delete" size={18} color="#EF4444" />
                    <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

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
              <Text style={styles.modalTitle}>Create Daily Challenge</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Date Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Challenge Date</Text>
                <TextInput
                  style={styles.input}
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Quiz Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Quiz</Text>
                <ScrollView style={styles.quizList}>
                  {availableQuizzes.map((quiz) => (
                    <TouchableOpacity
                      key={quiz.id}
                      style={[
                        styles.quizOption,
                        selectedQuizId === quiz.id && styles.quizOptionSelected
                      ]}
                      onPress={() => setSelectedQuizId(quiz.id)}
                    >
                      <View style={styles.quizOptionContent}>
                        <Text style={[
                          styles.quizOptionTitle,
                          selectedQuizId === quiz.id && styles.quizOptionTitleSelected
                        ]}>
                          {quiz.title}
                        </Text>
                        <Text style={styles.quizOptionDetails}>
                          {quiz.question_count} questions • {quiz.quiz_type}
                        </Text>
                      </View>
                      {selectedQuizId === quiz.id && (
                        <MaterialIcons name="check-circle" size={24} color="#8B5CF6" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* XP Reward */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>XP Reward</Text>
                <TextInput
                  style={styles.input}
                  value={xpReward}
                  onChangeText={setXpReward}
                  placeholder="100"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleCreateChallenge}
              >
                <Text style={styles.submitButtonText}>Create Challenge</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 48,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  challengeQuiz: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  challengeDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  challengeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#DBEAFE',
  },
  toggleButton: {
    backgroundColor: '#F3F4F6',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quizList: {
    maxHeight: 200,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quizOptionSelected: {
    backgroundColor: '#F3E8FF',
    borderColor: '#8B5CF6',
  },
  quizOptionContent: {
    flex: 1,
  },
  quizOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  quizOptionTitleSelected: {
    color: '#8B5CF6',
  },
  quizOptionDetails: {
    fontSize: 12,
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
