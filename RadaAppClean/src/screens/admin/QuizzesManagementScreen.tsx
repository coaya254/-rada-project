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

interface Quiz {
  id: number;
  title: string;
  description: string;
  module_id?: number;
  lesson_id?: number;
  quiz_type?: 'module' | 'lesson' | 'trivia';
  module_title?: string;
  lesson_title?: string;
  passing_score: number;
  time_limit: number;
  xp_reward: number;
  difficulty: string;
  category: string;
  active: boolean;
  is_published?: boolean;
  question_count?: number;
}

interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  points: number;
  display_order: number;
}

export default function QuizzesManagementScreen({ navigation }: any) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    module_id: 0,
    lesson_id: 0,
    quiz_type: 'trivia' as 'module' | 'lesson' | 'trivia',
    passing_score: 70,
    time_limit: 10,
    xp_reward: 50,
    difficulty: 'beginner',
    category: 'Government',
    active: true,
    is_published: false,
  });

  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct_answer_index: 0,
    explanation: '',
    points: 10,
  });

  useEffect(() => {
    fetchQuizzes();
    fetchModules();
  }, []);

  useEffect(() => {
    if (quizForm.module_id) {
      fetchLessons(quizForm.module_id);
    } else {
      setLessons([]);
    }
  }, [quizForm.module_id]);

  const fetchModules = async () => {
    try {
      const response = await LearningAPIService.adminGetModules();
      setModules(response.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchLessons = async (moduleId: number) => {
    try {
      const response = await LearningAPIService.adminGetLessons(moduleId);
      setLessons(response.lessons || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await LearningAPIService.adminGetQuizzes();
      setQuizzes(response.quizzes || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      Alert.alert('Error', 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizQuestions = async (quizId: number) => {
    try {
      const response = await LearningAPIService.adminGetQuizById(quizId);
      setQuestions(response.quiz?.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      Alert.alert('Error', 'Failed to load questions');
    }
  };

  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({
      title: '',
      description: '',
      module_id: 0,
      lesson_id: 0,
      quiz_type: 'trivia',
      passing_score: 70,
      time_limit: 10,
      xp_reward: 50,
      difficulty: 'beginner',
      category: 'Government',
      active: true,
      is_published: false,
    });
    setModalVisible(true);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description,
      module_id: quiz.module_id || 0,
      lesson_id: quiz.lesson_id || 0,
      quiz_type: quiz.quiz_type || 'trivia',
      passing_score: quiz.passing_score,
      time_limit: quiz.time_limit,
      xp_reward: quiz.xp_reward,
      difficulty: quiz.difficulty,
      category: quiz.category,
      active: quiz.active,
      is_published: quiz.is_published !== undefined ? quiz.is_published : false,
    });
    setModalVisible(true);
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title.trim()) {
      Alert.alert('Error', 'Please enter a quiz title');
      return;
    }

    try {
      if (editingQuiz) {
        await LearningAPIService.adminUpdateQuiz(editingQuiz.id, quizForm);
      } else {
        await LearningAPIService.adminCreateQuiz(quizForm);
      }
      setModalVisible(false);
      fetchQuizzes();
      Alert.alert('Success', `Quiz ${editingQuiz ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving quiz:', error);
      Alert.alert('Error', 'Failed to save quiz');
    }
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    Alert.alert(
      'Delete Quiz',
      `Are you sure you want to delete "${quiz.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await LearningAPIService.adminDeleteQuiz(quiz.id);
              fetchQuizzes();
              Alert.alert('Success', 'Quiz deleted successfully');
            } catch (error) {
              console.error('Error deleting quiz:', error);
              Alert.alert('Error', 'Failed to delete quiz');
            }
          },
        },
      ]
    );
  };

  const handleManageQuestions = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    fetchQuizQuestions(quiz.id);
    navigation.navigate('QuizQuestionsManagement', { quizId: quiz.id, quizTitle: quiz.title });
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
        <Text style={styles.headerTitle}>Manage Quizzes</Text>
        <TouchableOpacity onPress={handleCreateQuiz} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Quizzes List */}
      <ScrollView style={styles.quizzesList}>
        {quizzes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="help-circle-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No quizzes yet</Text>
            <Text style={styles.emptySubtext}>Create your first quiz</Text>
          </View>
        ) : (
          quizzes.map((quiz) => (
            <View key={quiz.id} style={styles.quizCard}>
              <View style={styles.quizHeader}>
                <Ionicons name="help-circle" size={40} color="#F59E0B" />
                <View style={styles.quizInfo}>
                  <Text style={styles.quizTitle}>{quiz.title}</Text>
                  <Text style={styles.quizDescription} numberOfLines={2}>
                    {quiz.description}
                  </Text>
                </View>
              </View>

              <View style={styles.quizMeta}>
                {/* Quiz Type Badge */}
                {quiz.quiz_type && (
                  <View style={[styles.badge, {
                    backgroundColor: quiz.quiz_type === 'trivia' ? '#8B5CF620' :
                                   quiz.quiz_type === 'module' ? '#3B82F620' : '#10B98120'
                  }]}>
                    <Text style={[styles.badgeText, {
                      color: quiz.quiz_type === 'trivia' ? '#8B5CF6' :
                             quiz.quiz_type === 'module' ? '#3B82F6' : '#10B981'
                    }]}>
                      {quiz.quiz_type === 'trivia' ? '🎯 Trivia' :
                       quiz.quiz_type === 'module' ? '📚 Module' : '📖 Lesson'}
                    </Text>
                  </View>
                )}

                {/* Module/Lesson Link */}
                {quiz.module_title && (
                  <View style={[styles.badge, { backgroundColor: '#F3F4F620' }]}>
                    <Ionicons name="folder" size={14} color="#6B7280" />
                    <Text style={styles.badgeText}>{quiz.module_title}</Text>
                  </View>
                )}
                {quiz.lesson_title && (
                  <View style={[styles.badge, { backgroundColor: '#FEF3C720' }]}>
                    <Ionicons name="book" size={14} color="#F59E0B" />
                    <Text style={[styles.badgeText, { color: '#F59E0B' }]}>{quiz.lesson_title}</Text>
                  </View>
                )}

                <View style={[styles.badge, { backgroundColor: difficultyColors[quiz.difficulty as keyof typeof difficultyColors] + '20' }]}>
                  <Text style={[styles.badgeText, { color: difficultyColors[quiz.difficulty as keyof typeof difficultyColors] }]}>
                    {quiz.difficulty}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{quiz.category}</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="help" size={14} color="#6B7280" />
                  <Text style={styles.badgeText}>{quiz.question_count || 0} questions</Text>
                </View>
                {quiz.active ? (
                  <View style={[styles.badge, { backgroundColor: '#10B98120' }]}>
                    <Text style={[styles.badgeText, { color: '#10B981' }]}>Active</Text>
                  </View>
                ) : (
                  <View style={[styles.badge, { backgroundColor: '#9CA3AF20' }]}>
                    <Text style={[styles.badgeText, { color: '#6B7280' }]}>Inactive</Text>
                  </View>
                )}
                {quiz.is_published ? (
                  <View style={[styles.badge, { backgroundColor: '#3B82F620' }]}>
                    <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />
                    <Text style={[styles.badgeText, { color: '#3B82F6' }]}>Published</Text>
                  </View>
                ) : (
                  <View style={[styles.badge, { backgroundColor: '#F59E0B20' }]}>
                    <Ionicons name="create" size={14} color="#F59E0B" />
                    <Text style={[styles.badgeText, { color: '#F59E0B' }]}>Draft</Text>
                  </View>
                )}
              </View>

              <View style={styles.quizStats}>
                <View style={styles.stat}>
                  <Ionicons name="time" size={16} color="#6B7280" />
                  <Text style={styles.statText}>{quiz.time_limit} min</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="checkmark-circle" size={16} color="#6B7280" />
                  <Text style={styles.statText}>{quiz.passing_score}% to pass</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="star" size={16} color="#6B7280" />
                  <Text style={styles.statText}>{quiz.xp_reward} XP</Text>
                </View>
              </View>

              <View style={styles.quizActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditQuiz(quiz)}
                >
                  <Ionicons name="create" size={18} color="#3B82F6" />
                  <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.questionsButton]}
                  onPress={() => handleManageQuestions(quiz)}
                >
                  <Ionicons name="list" size={18} color="#10B981" />
                  <Text style={[styles.actionButtonText, { color: '#10B981' }]}>Questions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteQuiz(quiz)}
                >
                  <Ionicons name="trash" size={18} color="#EF4444" />
                  <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Quiz Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingQuiz ? 'Edit Quiz' : 'Create Quiz'}
              </Text>

              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={quizForm.title}
                onChangeText={(text) => setQuizForm({ ...quizForm, title: text })}
                placeholder="Quiz title"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={quizForm.description}
                onChangeText={(text) => setQuizForm({ ...quizForm, description: text })}
                placeholder="Quiz description"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={quizForm.category}
                onChangeText={(text) => setQuizForm({ ...quizForm, category: text })}
                placeholder="Government"
              />

              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={quizForm.difficulty}
                  onValueChange={(value) => setQuizForm({ ...quizForm, difficulty: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Beginner" value="beginner" />
                  <Picker.Item label="Intermediate" value="intermediate" />
                  <Picker.Item label="Advanced" value="advanced" />
                </Picker>
              </View>

              <Text style={styles.label}>Quiz Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={quizForm.quiz_type}
                  onValueChange={(value) => {
                    setQuizForm({ ...quizForm, quiz_type: value as any, module_id: 0, lesson_id: 0 });
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Trivia (Standalone)" value="trivia" />
                  <Picker.Item label="Module Quiz" value="module" />
                  <Picker.Item label="Lesson Quiz" value="lesson" />
                </Picker>
              </View>
              <Text style={styles.helperText}>
                {quizForm.quiz_type === 'trivia' && 'Standalone quiz not attached to any module or lesson'}
                {quizForm.quiz_type === 'module' && 'Quiz tests knowledge of entire module'}
                {quizForm.quiz_type === 'lesson' && 'Quiz tests knowledge of specific lesson'}
              </Text>

              {quizForm.quiz_type !== 'trivia' && (
                <>
                  <Text style={styles.label}>Module {quizForm.quiz_type === 'module' ? '*' : ''}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={quizForm.module_id}
                      onValueChange={(value) => setQuizForm({ ...quizForm, module_id: value, lesson_id: 0 })}
                      style={styles.picker}
                    >
                      <Picker.Item label="-- Select Module --" value={0} />
                      {modules.map((module) => (
                        <Picker.Item key={module.id} label={module.title} value={module.id} />
                      ))}
                    </Picker>
                  </View>
                </>
              )}

              {quizForm.quiz_type === 'lesson' && quizForm.module_id > 0 && (
                <>
                  <Text style={styles.label}>Lesson *</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={quizForm.lesson_id}
                      onValueChange={(value) => setQuizForm({ ...quizForm, lesson_id: value })}
                      style={styles.picker}
                    >
                      <Picker.Item label="-- Select Lesson --" value={0} />
                      {lessons.map((lesson) => (
                        <Picker.Item key={lesson.id} label={lesson.title} value={lesson.id} />
                      ))}
                    </Picker>
                  </View>
                  {lessons.length === 0 && (
                    <Text style={styles.helperText}>No lessons found for this module</Text>
                  )}
                </>
              )}

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Time Limit (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={String(quizForm.time_limit)}
                    onChangeText={(text) => setQuizForm({ ...quizForm, time_limit: parseInt(text) || 0 })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Passing Score (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={String(quizForm.passing_score)}
                    onChangeText={(text) => setQuizForm({ ...quizForm, passing_score: parseInt(text) || 0 })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.label}>XP Reward</Text>
              <TextInput
                style={styles.input}
                value={String(quizForm.xp_reward)}
                onChangeText={(text) => setQuizForm({ ...quizForm, xp_reward: parseInt(text) || 0 })}
                keyboardType="numeric"
              />

              <View style={styles.publishToggleContainer}>
                <View style={styles.publishToggleInfo}>
                  <Text style={styles.publishToggleLabel}>Publish Status</Text>
                  <Text style={styles.publishToggleHelp}>
                    {quizForm.is_published
                      ? 'Published quizzes are visible to users and can be used in daily challenges'
                      : 'Draft quizzes are hidden from users until published'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.publishToggle,
                    quizForm.is_published && styles.publishToggleActive
                  ]}
                  onPress={() => setQuizForm({ ...quizForm, is_published: !quizForm.is_published })}
                >
                  <View style={[
                    styles.publishToggleThumb,
                    quizForm.is_published && styles.publishToggleThumbActive
                  ]}>
                    <Ionicons
                      name={quizForm.is_published ? 'checkmark' : 'close'}
                      size={16}
                      color={quizForm.is_published ? '#10B981' : '#6B7280'}
                    />
                  </View>
                  <Text style={[
                    styles.publishToggleText,
                    quizForm.is_published && styles.publishToggleTextActive
                  ]}>
                    {quizForm.is_published ? 'Published' : 'Draft'}
                  </Text>
                </TouchableOpacity>
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
                  onPress={handleSaveQuiz}
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
  quizzesList: {
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
  quizCard: {
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
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quizInfo: {
    flex: 1,
    marginLeft: 12,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  quizDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  quizMeta: {
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
  quizStats: {
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
  quizActions: {
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
  questionsButton: {
    backgroundColor: '#F0FDF4',
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
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  publishToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  publishToggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  publishToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  publishToggleHelp: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  publishToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    padding: 4,
    paddingRight: 12,
  },
  publishToggleActive: {
    backgroundColor: '#D1FAE5',
  },
  publishToggleThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  publishToggleThumbActive: {
    backgroundColor: '#FFF',
  },
  publishToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  publishToggleTextActive: {
    color: '#10B981',
  },
});
