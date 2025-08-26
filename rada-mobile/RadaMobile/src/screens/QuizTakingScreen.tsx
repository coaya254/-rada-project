import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const QuizTakingScreen = ({ route, navigation }) => {
  const { quiz } = route.params;
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit || 900);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadQuizQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isComplete) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isComplete]);

  const loadQuizQuestions = async () => {
    try {
      // Check if quiz has questions stored in JSON format
      if (quiz.questions && typeof quiz.questions === 'string') {
        try {
          const parsedQuestions = JSON.parse(quiz.questions);
          if (Array.isArray(parsedQuestions)) {
            // Transform the questions to match the expected format
            const transformedQuestions = parsedQuestions.map((q, index) => ({
              id: index + 1,
              question: q.question_text || q.question || '',
              options: q.options || [],
              correct: q.correct_answer || q.correct || 0,
              explanation: q.explanation || ''
            }));
            
            setQuestions(transformedQuestions);
            setIsLoading(false);
            return;
          }
        } catch (parseError) {
          console.error('Error parsing quiz questions:', parseError);
        }
      }
      
      // Fallback to sample questions if no questions found
      const fallbackQuestions = [
        {
          id: 1,
          question: 'Sample Question 1',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct: 0,
          explanation: 'This is a sample question.'
        }
      ];
      
      setQuestions(fallbackQuestions);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading quiz questions:', error);
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      Alert.alert(
        'Incomplete Quiz',
        'Please answer all questions before submitting',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate score
      let correctAnswers = 0;
      questions.forEach(question => {
        if (selectedAnswers[question.id] === question.correct) {
          correctAnswers++;
        }
      });

      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      setScore(finalScore);
      setIsComplete(true);

      // Award XP based on score (like in your old system)
      let xpEarned = 0;
      let xpMessage = '';
      
      if (finalScore >= 90) {
        xpEarned = 100;
        xpMessage = 'Excellent! Perfect score! 🎉';
      } else if (finalScore >= 80) {
        xpEarned = 75;
        xpMessage = 'Great job! 🎯';
      } else if (finalScore >= 70) {
        xpEarned = 50;
        xpMessage = 'Good work! 👍';
      } else if (finalScore >= 60) {
        xpEarned = 25;
        xpMessage = 'Not bad! 📚';
      } else {
        xpMessage = 'Keep studying! You\'ll do better next time 💪';
      }

      // No more ugly Alert popup - just show the clean completion screen
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz results');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showDetailedResults = () => {
    let resultText = `🎯 Final Score: ${score}%\n\n📝 Question Review:\n\n`;
    
    questions.forEach((question, index) => {
      const userAnswer = selectedAnswers[question.id];
      const isCorrect = userAnswer === question.correct;
      const status = isCorrect ? '✅' : '❌';
      const userAnswerText = question.options[userAnswer] || 'Not answered';
      const correctAnswerText = question.options[question.correct];
      
      resultText += `${index + 1}. ${status} ${question.question}\n`;
      resultText += `   Your Answer: ${userAnswerText}\n`;
      resultText += `   Correct: ${correctAnswerText}\n`;
      if (!isCorrect) {
        resultText += `   💡 ${question.explanation}\n`;
      }
      resultText += '\n';
    });

    Alert.alert('📋 Detailed Review', resultText, [
      { text: 'Back to Quizzes', onPress: () => navigation.goBack() }
    ]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Loading Quiz...</Text>
      </View>
    );
  }

  if (isComplete) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.completionContainer}>
          <View style={styles.completionCard}>
            <Text style={styles.completionEmoji}>
              {score >= 80 ? '🎉' : score >= 60 ? '👍' : '📚'}
            </Text>
            <Text style={styles.completionTitle}>Quiz Complete!</Text>
            <Text style={styles.completionScore}>{score}%</Text>
                         <Text style={styles.completionSubtitle}>
               You answered {Math.round((score / 100) * questions.length)} out of {questions.length} questions correctly
             </Text>
             
             {/* XP Display */}
             {score >= 60 && (
               <View style={styles.xpContainer}>
                 <Text style={styles.xpText}>
                   🎁 XP Earned: +{score >= 90 ? 100 : score >= 80 ? 75 : score >= 70 ? 50 : 25}
                 </Text>
               </View>
             )}
            
            <View style={styles.completionButtons}>
              <TouchableOpacity
                style={[styles.completionButton, styles.primaryButton]}
                onPress={() => {
                  setCurrentQuestionIndex(0);
                  setSelectedAnswers({});
                  setIsComplete(false);
                  setTimeLeft(quiz.time_limit || 900);
                }}
              >
                <Text style={styles.completionButtonText}>Take Quiz Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.completionButton, styles.secondaryButton]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.secondaryButtonText}>Back to Quizzes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      {/* Quiz Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{quiz.title || 'Quiz'}</Text>
        <Text style={styles.headerDescription}>
          Test your knowledge and earn XP
        </Text>
        
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} style={{ width: `${progress}%` }} />
          </View>
          <View style={styles.timer}>
            <Text style={styles.timerText}>⏰ {formatTime(timeLeft)}</Text>
          </View>
        </View>
      </View>

      {/* Question Card */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          {/* Answer Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswers[currentQuestion.id] === index && styles.selectedOption
                ]}
                onPress={() => handleAnswerSelect(currentQuestion.id, index)}
              >
                <View style={[
                  styles.optionLetter,
                  selectedAnswers[currentQuestion.id] === index && styles.selectedOptionLetter
                ]}>
                  <Text style={[
                    styles.optionLetterText,
                    selectedAnswers[currentQuestion.id] === index && styles.selectedOptionLetterText
                  ]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  selectedAnswers[currentQuestion.id] === index && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.secondaryButton,
                currentQuestionIndex === 0 && styles.disabledButton
              ]}
              onPress={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <Text style={styles.secondaryButtonText}>← Previous</Text>
            </TouchableOpacity>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <TouchableOpacity
                style={[
                  styles.navButton,
                  styles.primaryButton,
                  isSubmitting && styles.disabledButton
                ]}
                onPress={handleSubmitQuiz}
                disabled={isSubmitting || Object.keys(selectedAnswers).length < questions.length}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Submit Quiz</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navButton, styles.primaryButton]}
                onPress={handleNextQuestion}
              >
                <Text style={styles.primaryButtonText}>Next →</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  timer: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ecf0f1',
    backgroundColor: 'white',
    borderRadius: 12,
  },
  selectedOption: {
    borderColor: '#4caf50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  optionLetter: {
    width: 24,
    height: 24,
    backgroundColor: '#ecf0f1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedOptionLetter: {
    backgroundColor: '#4caf50',
  },
  optionLetterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  selectedOptionLetterText: {
    color: 'white',
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  selectedOptionText: {
    color: '#4caf50',
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4caf50',
  },
  secondaryButton: {
    backgroundColor: '#ecf0f1',
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
  completionContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  completionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completionEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 16,
  },
  completionScore: {
    fontSize: 48,
    fontWeight: '800',
    color: '#4caf50',
    marginBottom: 20,
  },
     completionSubtitle: {
     fontSize: 16,
     color: '#7f8c8d',
     marginBottom: 16,
     textAlign: 'center',
   },
   xpContainer: {
     marginBottom: 32,
     paddingHorizontal: 20,
     paddingVertical: 12,
     backgroundColor: '#e8f5e8',
     borderRadius: 12,
     borderWidth: 1,
     borderColor: '#4caf50',
   },
   xpText: {
     fontSize: 18,
     fontWeight: '700',
     color: '#2e7d32',
     textAlign: 'center',
   },
  completionButtons: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  completionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
});

export default QuizTakingScreen;
