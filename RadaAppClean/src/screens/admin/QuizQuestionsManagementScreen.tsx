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
import { Ionicons } from '@expo/vector-icons';
import LearningAPIService from '../../services/LearningAPIService';

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

export default function QuizQuestionsManagementScreen({ navigation, route }: any) {
  const { quizId, quizTitle } = route.params;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
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
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await LearningAPIService.adminGetQuizById(quizId);
      setQuestions(response.quiz?.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      Alert.alert('Error', 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = () => {
    setEditingQuestion(null);
    setFormData({
      question_text: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correct_answer_index: 0,
      explanation: '',
      points: 10,
    });
    setModalVisible(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      option1: question.options[0] || '',
      option2: question.options[1] || '',
      option3: question.options[2] || '',
      option4: question.options[3] || '',
      correct_answer_index: question.correct_answer_index,
      explanation: question.explanation,
      points: question.points,
    });
    setModalVisible(true);
  };

  const handleSaveQuestion = async () => {
    if (!formData.question_text.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }
    if (!formData.option1.trim() || !formData.option2.trim()) {
      Alert.alert('Error', 'Please provide at least 2 options');
      return;
    }

    const questionData = {
      question_text: formData.question_text,
      options: [formData.option1, formData.option2, formData.option3, formData.option4].filter(o => o.trim()),
      correct_answer_index: formData.correct_answer_index,
      explanation: formData.explanation,
      points: formData.points,
    };

    try {
      if (editingQuestion) {
        await LearningAPIService.adminUpdateQuestion(editingQuestion.id, questionData);
      } else {
        await LearningAPIService.adminAddQuestion(quizId, questionData);
      }
      setModalVisible(false);
      fetchQuestions();
      Alert.alert('Success', `Question ${editingQuestion ? 'updated' : 'added'} successfully`);
    } catch (error) {
      console.error('Error saving question:', error);
      Alert.alert('Error', 'Failed to save question');
    }
  };

  const handleDeleteQuestion = (question: Question) => {
    Alert.alert(
      'Delete Question',
      'Are you sure you want to delete this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await LearningAPIService.adminDeleteQuestion(question.id);
              fetchQuestions();
              Alert.alert('Success', 'Question deleted successfully');
            } catch (error) {
              console.error('Error deleting question:', error);
              Alert.alert('Error', 'Failed to delete question');
            }
          },
        },
      ]
    );
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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{quizTitle}</Text>
          <Text style={styles.headerSubtitle}>{questions.length} Questions</Text>
        </View>
        <TouchableOpacity onPress={handleCreateQuestion} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Questions List */}
      <ScrollView style={styles.questionsList}>
        {questions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="help-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No questions yet</Text>
            <Text style={styles.emptySubtext}>Add your first question to this quiz</Text>
          </View>
        ) : (
          questions.map((question, index) => (
            <View key={question.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={styles.questionNumber}>
                  <Text style={styles.questionNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.questionInfo}>
                  <Text style={styles.questionText}>{question.question_text}</Text>
                  <View style={styles.questionMeta}>
                    <View style={styles.badge}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.badgeText}>{question.points} pts</Text>
                    </View>
                    <View style={styles.badge}>
                      <Ionicons name="list" size={12} color="#6B7280" />
                      <Text style={styles.badgeText}>{question.options.length} options</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {question.options.map((option, optIndex) => (
                  <View
                    key={optIndex}
                    style={[
                      styles.optionRow,
                      optIndex === question.correct_answer_index && styles.correctOption,
                    ]}
                  >
                    <View style={styles.optionIndicator}>
                      {optIndex === question.correct_answer_index ? (
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      ) : (
                        <View style={styles.optionCircle} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        optIndex === question.correct_answer_index && styles.correctOptionText,
                      ]}
                    >
                      {option}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Explanation */}
              {question.explanation && (
                <View style={styles.explanationContainer}>
                  <Ionicons name="information-circle" size={16} color="#3B82F6" />
                  <Text style={styles.explanationText}>{question.explanation}</Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.questionActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditQuestion(question)}
                >
                  <Ionicons name="create" size={18} color="#3B82F6" />
                  <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteQuestion(question)}
                >
                  <Ionicons name="trash" size={18} color="#EF4444" />
                  <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </Text>

              <Text style={styles.label}>Question *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.question_text}
                onChangeText={(text) => setFormData({ ...formData, question_text: text })}
                placeholder="Enter your question"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Options *</Text>
              {[1, 2, 3, 4].map((num) => (
                <View key={num} style={styles.optionInputContainer}>
                  <TouchableOpacity
                    style={styles.radioButton}
                    onPress={() => setFormData({ ...formData, correct_answer_index: num - 1 })}
                  >
                    {formData.correct_answer_index === num - 1 ? (
                      <Ionicons name="radio-button-on" size={24} color="#10B981" />
                    ) : (
                      <Ionicons name="radio-button-off" size={24} color="#D1D5DB" />
                    )}
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, styles.optionInput]}
                    value={formData[`option${num}` as keyof typeof formData] as string}
                    onChangeText={(text) =>
                      setFormData({ ...formData, [`option${num}`]: text })
                    }
                    placeholder={`Option ${num}${num <= 2 ? ' (required)' : ''}`}
                  />
                </View>
              ))}

              <Text style={styles.helperText}>
                Tap the circle to mark the correct answer
              </Text>

              <Text style={styles.label}>Explanation</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.explanation}
                onChangeText={(text) => setFormData({ ...formData, explanation: text })}
                placeholder="Explain why this is the correct answer"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Points</Text>
              <TextInput
                style={styles.input}
                value={String(formData.points)}
                onChangeText={(text) =>
                  setFormData({ ...formData, points: parseInt(text) || 0 })
                }
                keyboardType="numeric"
                placeholder="10"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveQuestion}
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
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionsList: {
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
  questionCard: {
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
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumberText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  questionInfo: {
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 8,
  },
  questionMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionsContainer: {
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  correctOption: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  optionIndicator: {
    marginRight: 12,
  },
  optionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  correctOptionText: {
    color: '#059669',
    fontWeight: '600',
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  explanationText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  questionActions: {
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  radioButton: {
    padding: 4,
  },
  optionInput: {
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: -8,
    marginBottom: 8,
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
