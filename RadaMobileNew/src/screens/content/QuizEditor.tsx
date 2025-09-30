import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import apiService from '../../services/api';

const QuizEditor = ({ item, onClose, onSave, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    module_id: '',
    difficulty: 'beginner',
    time_limit: 0,
    passing_score: 70,
    xp_reward: 50,
    status: 'draft'
  });
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    difficulty: 'medium',
    points: 1
  });

  useEffect(() => {
    loadModules();
    if (item) {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        module_id: item.module_id?.toString() || '',
        difficulty: item.difficulty || 'beginner',
        time_limit: item.time_limit || 0,
        passing_score: item.passing_score || 70,
        xp_reward: item.xp_reward || 50,
        status: item.status || 'draft'
      });
    }
  }, [item]);

  const loadModules = async () => {
    try {
      const response = await apiService.getAdminContentModules();
      setModules(response.modules || []);
    } catch (error) {
      console.error('Error loading modules:', error);
      setModules([]);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (questions.length === 0) {
      Alert.alert('Error', 'Please add at least one question to the quiz');
      return;
    }

    setIsLoading(true);
    try {
      const quizData = {
        ...formData,
        time_limit: parseInt(formData.time_limit.toString()) || 0,
        passing_score: parseInt(formData.passing_score.toString()) || 70,
        xp_reward: parseInt(formData.xp_reward.toString()) || 50,
        module_id: formData.module_id ? parseInt(formData.module_id) : null,
        questions: questions // Include the questions array
      };

      if (item) {
        await apiService.updateQuiz(item.id, quizData);
        Alert.alert('Success', 'Quiz updated successfully');
      } else {
        await apiService.createQuiz(quizData);
        Alert.alert('Success', 'Quiz created successfully');
      }

      onSave();
    } catch (error) {
      console.error('Error saving quiz:', error);
      Alert.alert('Error', 'Failed to save quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {item ? 'Edit Quiz' : 'Create New Quiz'}
          </Text>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧠 Quiz Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
              placeholder="Enter lesson title"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              placeholder="Enter quiz description..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Module *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.module_id}
                onValueChange={(value) => updateFormData('module_id', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select a module" value="" />
                {modules.map((module) => (
                  <Picker.Item 
                    key={module.id} 
                    label={module.title} 
                    value={module.id.toString()} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Time Limit (min)</Text>
              <TextInput
                style={styles.input}
                value={formData.time_limit.toString()}
                onChangeText={(text) => updateFormData('time_limit', text)}
                placeholder="0 (no limit)"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Passing Score (%)</Text>
              <TextInput
                style={styles.input}
                value={formData.passing_score.toString()}
                onChangeText={(text) => updateFormData('passing_score', text)}
                placeholder="70"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>XP Reward</Text>
            <TextInput
              style={styles.input}
              value={formData.xp_reward.toString()}
              onChangeText={(text) => updateFormData('xp_reward', text)}
              placeholder="50"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Questions Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>❓ Questions ({questions.length})</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowQuestionForm(true)}
            >
              <Text style={styles.addButtonText}>+ Add Question</Text>
            </TouchableOpacity>
          </View>
          
          {questions.length === 0 ? (
            <Text style={styles.noQuestionsText}>No questions added yet. Add your first question!</Text>
          ) : (
            <View style={styles.questionsList}>
              {questions.map((question, index) => (
                <View key={index} style={styles.questionItem}>
                  <Text style={styles.questionText}>
                    {index + 1}. {question.question_text}
                  </Text>
                  <View style={styles.questionMeta}>
                    <Text style={styles.questionMetaText}>
                      Points: {question.points} | Difficulty: {question.difficulty}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👁️ Preview</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>{formData.title || 'Quiz Title'}</Text>
            <Text style={styles.previewContent}>
              {formData.description || 'Quiz description will appear here...'}
            </Text>
            <View style={styles.previewMeta}>
              <Text style={styles.previewMetaText}>
                Module: {modules.find(m => m.id.toString() === formData.module_id)?.title || 'Not selected'}
              </Text>
              <Text style={styles.previewMetaText}>
                Time: {formData.time_limit || 0} min
              </Text>
              <Text style={styles.previewMetaText}>
                Passing: {formData.passing_score || 70}%
              </Text>
              <Text style={styles.previewMetaText}>
                XP: {formData.xp_reward || 50}
              </Text>
              <Text style={styles.previewMetaText}>
                Questions: {questions.length}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Question</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowQuestionForm(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Question Text</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={currentQuestion.question_text}
                  onChangeText={(text) => setCurrentQuestion(prev => ({ ...prev, question_text: text }))}
                  placeholder="Enter your question here..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Options</Text>
                {currentQuestion.options.map((option, index) => (
                  <View key={index} style={styles.optionRow}>
                    <TouchableOpacity
                      style={[
                        styles.optionRadio,
                        currentQuestion.correct_answer === index && styles.optionRadioSelected
                      ]}
                      onPress={() => setCurrentQuestion(prev => ({ ...prev, correct_answer: index }))}
                    >
                      {currentQuestion.correct_answer === index && <Text style={styles.radioDot}>●</Text>}
                    </TouchableOpacity>
                    <TextInput
                      style={styles.optionInput}
                      value={option}
                      onChangeText={(text) => {
                        const newOptions = [...currentQuestion.options];
                        newOptions[index] = text;
                        setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                  </View>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Explanation</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={currentQuestion.explanation}
                  onChangeText={(text) => setCurrentQuestion(prev => ({ ...prev, explanation: text }))}
                  placeholder="Explain why this answer is correct..."
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Difficulty</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={currentQuestion.difficulty}
                      onValueChange={(value) => setCurrentQuestion(prev => ({ ...prev, difficulty: value }))}
                      style={styles.picker}
                    >
                      <Picker.Item label="Easy" value="easy" />
                      <Picker.Item label="Medium" value="medium" />
                      <Picker.Item label="Hard" value="hard" />
                    </Picker>
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Points</Text>
                  <TextInput
                    style={styles.input}
                    value={currentQuestion.points.toString()}
                    onChangeText={(text) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(text) || 1 }))}
                    placeholder="1"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => setShowQuestionForm(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton]}
                onPress={() => {
                  if (currentQuestion.question_text.trim() && currentQuestion.options.some(opt => opt.trim())) {
                    setQuestions(prev => [...prev, { ...currentQuestion }]);
                    setCurrentQuestion({
                      question_text: '',
                      options: ['', '', '', ''],
                      correct_answer: 0,
                      explanation: '',
                      difficulty: 'medium',
                      points: 1
                    });
                    setShowQuestionForm(false);
                  } else {
                    Alert.alert('Error', 'Please fill in the question text and at least one option');
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>Add Question</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  previewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  previewContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  previewMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  previewMetaText: {
    fontSize: 12,
    color: '#4ECDC4',
    backgroundColor: '#e8f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  noQuestionsText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  questionsList: {
    gap: 12,
  },
  questionItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  questionMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  questionMetaText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: '#4ECDC4',
    backgroundColor: '#4ECDC4',
  },
  radioDot: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
});

export default QuizEditor;
