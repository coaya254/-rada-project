import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';
import LearningAPIService from '../../services/LearningAPIService';

interface QuizScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'Quiz'>;
  route: RouteProp<LearningStackParamList, 'Quiz'>;
}

interface QuizQuestion {
  id: number;
  question_text: string;
  options: string[];
  correct_answer_index?: number;
  explanation?: string;
  points?: number;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ navigation, route }) => {
  const { quizId, moduleId, title } = route.params;
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizData, setQuizData] = useState<any>(null);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (questions.length > 0) {
      setAnswers(new Array(questions.length).fill(null));
      setTimeLeft(quizData?.time_limit ? quizData.time_limit * 60 : 300);
      animateIn();
    }
  }, [questions]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await LearningAPIService.getQuizById(quizId);

      if (response.success && response.quiz) {
        setQuizData(response.quiz);
        setQuestions(response.quiz.questions || []);
        setLoading(false);
      } else {
        throw new Error('Failed to load quiz');
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
      setLoading(false);
    }
  };

  useEffect(() => {
    animateIn();
    setShowExplanation(false);
    setIsCorrect(null);
  }, [currentQuestion]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.9);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizCompleted) {
      handleQuizComplete();
    }
  }, [timeLeft, quizCompleted]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleAnswerCheck = () => {
    if (selectedAnswer === null) {
      Alert.alert('Please Select an Answer', 'Choose an answer option before checking.');
      return;
    }

    console.log('=== Checking Answer ===');
    console.log('Selected answer:', selectedAnswer);
    console.log('Selected answer type:', typeof selectedAnswer);
    console.log('Correct answer index:', questions[currentQuestion].correct_answer_index);
    console.log('Correct answer type:', typeof questions[currentQuestion].correct_answer_index);
    console.log('Are they equal?', selectedAnswer === questions[currentQuestion].correct_answer_index);
    console.log('Options:', questions[currentQuestion].options);

    const correct = selectedAnswer === questions[currentQuestion].correct_answer_index;
    setIsCorrect(correct);
    setShowExplanation(true);

    // Scroll to make explanation visible
    setTimeout(() => {
      scrollViewRef?.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleNext = () => {
    if (showExplanation) {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(answers[currentQuestion + 1]);
      } else {
        handleQuizComplete();
      }
    } else {
      handleAnswerCheck();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
    }
  };

  const handleQuizComplete = async () => {
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correct_answer_index) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setQuizCompleted(true);

    // Save quiz attempt to database
    try {
      const timeSpent = (quizData?.time_limit ? quizData.time_limit * 60 : 300) - timeLeft;
      await LearningAPIService.submitQuiz(
        quizId,
        answers.map((answer, index) => ({
          questionId: questions[index].id,
          selectedAnswer: answer !== null ? answer : 0
        })),
        timeSpent
      );
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Don't show error to user, they still see their score
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers(new Array(questions.length).fill(null));
    setTimeLeft(300);
    setQuizCompleted(false);
    setScore(0);
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 16, color: '#666', fontSize: 16 }}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <MaterialIcons name="error-outline" size={64} color="#EF4444" />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: 'bold', color: '#333' }}>Error Loading Quiz</Text>
          <Text style={{ marginTop: 8, color: '#666', textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 24 }]}
            onPress={fetchQuiz}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <MaterialIcons name="quiz" size={64} color="#9CA3AF" />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: 'bold', color: '#333' }}>No Questions Available</Text>
          <Text style={{ marginTop: 8, color: '#666', textAlign: 'center' }}>This quiz doesn't have any questions yet.</Text>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 24 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={getScoreColor()} />

        <LinearGradient
          colors={[getScoreColor(), getScoreColor() + 'DD']}
          style={styles.completedContainer}
        >
          <View style={styles.scoreCard}>
            <View style={styles.trophyContainer}>
              <MaterialIcons name="emoji-events" size={80} color="#FFD700" />
            </View>

            <Text style={styles.completedTitle}>Quiz Completed!</Text>

            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{score}</Text>
              <Text style={styles.scoreTotal}>/ {questions.length}</Text>
            </View>

            <Text style={styles.percentageText}>{percentage}%</Text>

            <Text style={styles.performanceText}>
              {percentage >= 80 ? 'Excellent Work! 🎉' :
               percentage >= 60 ? 'Good Job! 👍' :
               'Keep Learning! 📚'}
            </Text>

            <View style={styles.xpBanner}>
              <MaterialIcons name="stars" size={24} color="#FFD700" />
              <Text style={styles.xpEarned}>+{score * 10} XP Earned</Text>
            </View>
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.primaryButtonText}>Continue Learning</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleRestart}>
              <MaterialIcons name="refresh" size={20} color={getScoreColor()} />
              <Text style={[styles.secondaryButtonText, { color: getScoreColor() }]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title || 'Quiz'}</Text>
          <Text style={styles.headerSubtitle}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
        </View>
        <View style={styles.timerContainer}>
          <MaterialIcons name="timer" size={20} color="#F59E0B" />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
          ]} />
        </View>
        <Text style={styles.progressText}>
          {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
        </Text>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }}>
          {/* Question Card */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <View style={styles.questionNumberBadge}>
                <Text style={styles.questionNumber}>{currentQuestion + 1}</Text>
              </View>
              <Text style={styles.questionLabel}>of {questions.length}</Text>
            </View>
            <Text style={styles.questionText}>{questions[currentQuestion].question_text}</Text>
          </View>

          {/* Answer Options */}
          <View style={styles.optionsContainer}>
            {questions[currentQuestion].options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === questions[currentQuestion].correct_answer_index;
              const showCorrect = showExplanation && isCorrectAnswer;
              const showWrong = showExplanation && isSelected && !isCorrectAnswer;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && !showExplanation && styles.selectedOption,
                    showCorrect && styles.correctOption,
                    showWrong && styles.wrongOption,
                  ]}
                  onPress={() => !showExplanation && handleAnswerSelect(index)}
                  disabled={showExplanation}
                >
                  <View style={[
                    styles.optionIndicator,
                    isSelected && !showExplanation && styles.selectedIndicator,
                    showCorrect && styles.correctIndicator,
                    showWrong && styles.wrongIndicator,
                  ]}>
                    {showCorrect ? (
                      <MaterialIcons name="check" size={20} color="#FFFFFF" />
                    ) : showWrong ? (
                      <MaterialIcons name="close" size={20} color="#FFFFFF" />
                    ) : (
                      <Text style={[
                        styles.optionLetter,
                        isSelected && styles.selectedOptionLetter
                      ]}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    )}
                  </View>
                  <Text style={[
                    styles.optionText,
                    isSelected && !showExplanation && styles.selectedOptionText,
                    showCorrect && styles.correctOptionText,
                    showWrong && styles.wrongOptionText,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation */}
          {showExplanation && (
            <Animated.View style={[
              styles.explanationCard,
              { backgroundColor: isCorrect ? '#DCFCE7' : '#FEE2E2' }
            ]}>
              <View style={styles.explanationHeader}>
                <MaterialIcons
                  name={isCorrect ? 'check-circle' : 'cancel'}
                  size={32}
                  color={isCorrect ? '#10B981' : '#EF4444'}
                />
                <Text style={[
                  styles.explanationTitle,
                  { color: isCorrect ? '#065F46' : '#991B1B' }
                ]}>
                  {isCorrect ? 'Correct!' : 'Not Quite'}
                </Text>
              </View>
              <Text style={[
                styles.explanationText,
                { color: isCorrect ? '#047857' : '#DC2626' }
              ]}>
                {questions[currentQuestion].explanation || 'No explanation available.'}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestion === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <MaterialIcons name="chevron-left" size={24} color={currentQuestion === 0 ? '#9CA3AF' : '#666'} />
          <Text style={[styles.navButtonText, currentQuestion === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedAnswer === null && !showExplanation && styles.nextButtonDisabled,
            showExplanation && styles.nextButtonActive,
          ]}
          onPress={handleNext}
          disabled={selectedAnswer === null && !showExplanation}
        >
          <Text style={[
            styles.nextButtonText,
            selectedAnswer === null && !showExplanation && styles.nextButtonTextDisabled
          ]}>
            {showExplanation
              ? (currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question')
              : 'Check Answer'}
          </Text>
          <MaterialIcons
            name={showExplanation ? 'arrow-forward' : 'check'}
            size={24}
            color={selectedAnswer !== null || showExplanation ? '#FFFFFF' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
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
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    gap: 12,
  },
  selectedOption: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedIndicator: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  selectedOptionLetter: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  selectedOptionText: {
    fontWeight: '600',
    color: '#333',
  },
  correctOption: {
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  wrongOption: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  correctIndicator: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  wrongIndicator: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  correctOptionText: {
    fontWeight: '600',
    color: '#065F46',
  },
  wrongOptionText: {
    fontWeight: '600',
    color: '#991B1B',
  },
  explanationCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  nextButtonActive: {
    backgroundColor: '#10B981',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  scoreCard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  trophyContainer: {
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreTotal: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.8)',
  },
  percentageText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  performanceText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
  },
  xpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  xpEarned: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultActions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});