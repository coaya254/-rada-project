import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  Vibration,
  Dimensions,
} from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { QuizProps, QuizQuestion } from '../types/LearningTypes';
import { useAnonMode } from '../contexts/AnonModeContext';
import apiService from '../services/api';
import offlineStorage from '../services/offlineStorage';

const { width } = Dimensions.get('window');

export const QuizScreen: React.FC<QuizProps> = ({ route, navigation }) => {
  const { user } = useAnonMode();
  const { quizId, courseTitle, xp, lessonId } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: number}>({});
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const correctAnim = useRef(new Animated.Value(0)).current;
  const wrongAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Enhanced quiz questions with more variety
  const defaultQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "What is the primary mechanism for enforcing constitutional rights in Kenya?",
      options: [
        "The Executive",
        "The Judiciary", 
        "The Legislature",
        "The Police"
      ],
      correctAnswer: 1,
      explanation: "The Judiciary provides the primary mechanism for enforcing rights through constitutional petitions and judicial review."
    },
    {
      id: 2,
      question: "Which commission investigates human rights violations in Kenya?",
      options: [
        "KNCHR",
        "EACC", 
        "IEBC",
        "CRA"
      ],
      correctAnswer: 0,
      explanation: "The Kenya National Commission on Human Rights (KNCHR) is the primary body for investigating human rights violations."
    },
    {
      id: 3,
      question: "What is an alternative to court proceedings for rights enforcement?",
      options: [
        "Police action",
        "Media coverage",
        "Alternative Dispute Resolution",
        "Public protests"
      ],
      correctAnswer: 2,
      explanation: "Alternative Dispute Resolution (ADR) provides faster, less expensive alternatives to court proceedings."
    },
    {
      id: 4,
      question: "Which article of the Kenyan Constitution guarantees the right to life?",
      options: [
        "Article 25",
        "Article 26",
        "Article 27", 
        "Article 28"
      ],
      correctAnswer: 1,
      explanation: "Article 26 of the Kenyan Constitution guarantees every person the right to life."
    },
    {
      id: 5,
      question: "What is the minimum age for voting in Kenya?",
      options: [
        "16 years",
        "17 years",
        "18 years",
        "21 years"
      ],
      correctAnswer: 2,
      explanation: "The minimum voting age in Kenya is 18 years as guaranteed by Article 38 of the Constitution."
    }
  ];

  // Load quiz questions
  useEffect(() => {
    loadQuizQuestions();
  }, []);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizCompleted]);

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentQuestion + 1) / questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestion, questions.length]);

  const loadQuizQuestions = async () => {
    try {
      setIsLoading(true);
      // Try to load quiz questions from API first
      if (lessonId) {
        try {
          const response = await apiService.getLesson(lessonId);
          if (response && response.quiz_questions) {
            setQuestions(response.quiz_questions);
          } else {
            setQuestions(defaultQuestions);
          }
        } catch (error) {
          console.log('Using default quiz questions');
          setQuestions(defaultQuestions);
        }
      } else {
        setQuestions(defaultQuestions);
      }
    } catch (error) {
      console.error('Error loading quiz questions:', error);
      setQuestions(defaultQuestions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent changing answer once selected
    
    setSelectedAnswer(answerIndex);
    setUserAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: answerIndex }));
    
    // Animate feedback
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      Vibration.vibrate(100);
      Animated.sequence([
        Animated.timing(correctAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(correctAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(prevMax => Math.max(prevMax, newStreak));
        return newStreak;
      });
    } else {
      Vibration.vibrate([100, 50, 100]);
      Animated.sequence([
        Animated.timing(wrongAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(wrongAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      setStreak(0);
    }
    
    // Show explanation after a delay
    setTimeout(() => {
      setShowExplanation(true);
    }, 1000);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    setShowExplanation(false);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    const finalScore = selectedAnswer === questions[currentQuestion].correctAnswer ? score + 1 : score;
    const percentage = Math.round((finalScore / questions.length) * 100);
    
    setQuizCompleted(true);
    setScore(finalScore);
    
    // Save quiz results to backend
    try {
      if (user && lessonId) {
        const quizData = {
          userId: user.uuid,
          lessonId: lessonId,
          quizId: quizId,
          completed: true,
          score: percentage,
          timeSpent: 300 - timeLeft,
          quizResults: {
            totalQuestions: questions.length,
            correctAnswers: finalScore,
            percentage: percentage,
            streak: maxStreak,
            userAnswers: userAnswers
          }
        };

        try {
          // Try to sync to backend first
          await apiService.updateLessonProgress(quizData);
          console.log('✅ Quiz results synced to backend');
        } catch (error) {
          console.log('⚠️ Backend sync failed, saving offline:', error);
          // Save offline if backend fails
          await offlineStorage.saveQuizResultsOffline(quizData);
        }
      }
    } catch (error) {
      console.error('Error saving quiz progress:', error);
    }
    
    // Navigate to completion screen
    navigation.navigate('Completion', {
      courseTitle,
      xpEarned: Math.round((percentage / 100) * xp),
      totalXP: xp,
      lessonsCompleted: 1,
      quizScore: percentage,
      streak: maxStreak
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingIcon, { opacity: fadeAnim }]}>
            <Icon name="book" size={60} color="#4a6cfa" />
          </Animated.View>
          <Text style={styles.loadingText}>Preparing your quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (quizCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#4a6cfa', '#667eea']} style={styles.completedContainer}>
          <Animated.View style={[styles.completedContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.completedIcon}>
              <Icon name="trophy" size={80} color="#FFD700" />
            </View>
            <Text style={styles.completedTitle}>Quiz Completed!</Text>
            <Text style={styles.completedScore}>Score: {score}/{questions.length}</Text>
            <Text style={styles.completedPercentage}>
              {Math.round((score / questions.length) * 100)}% Correct
            </Text>
            {maxStreak > 0 && (
              <View style={styles.streakContainer}>
                <Icon name="fire" size={20} color="#FF6B35" />
                <Text style={styles.streakText}>Best Streak: {maxStreak}</Text>
              </View>
            )}
          </Animated.View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4a6cfa', '#667eea']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.quizTitle}>Quiz: {courseTitle}</Text>
            <View style={styles.quizMeta}>
              <Text style={styles.questionCounter}>
                Question {currentQuestion + 1} of {questions.length}
              </Text>
              <View style={styles.timer}>
                <Icon name="clock-o" size={16} color="white" />
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]} 
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.quizContent}>

        <Animated.View style={[styles.questionCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.questionText}>
            {questions[currentQuestion].question}
          </Text>
          
          <View style={styles.optionsContainer}>
            {questions[currentQuestion].options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = selectedAnswer !== null && index === questions[currentQuestion].correctAnswer;
              const isWrong = selectedAnswer !== null && isSelected && index !== questions[currentQuestion].correctAnswer;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                    isCorrect && styles.optionButtonCorrect,
                    isWrong && styles.optionButtonWrong
                  ]}
                  onPress={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.optionIndicator,
                      isSelected && styles.optionIndicatorSelected,
                      isCorrect && styles.optionIndicatorCorrect,
                      isWrong && styles.optionIndicatorWrong
                    ]}>
                      <Text style={[
                        styles.optionLetter,
                        isSelected && styles.optionLetterSelected,
                        isCorrect && styles.optionLetterCorrect,
                        isWrong && styles.optionLetterWrong
                      ]}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                      isCorrect && styles.optionTextCorrect,
                      isWrong && styles.optionTextWrong
                    ]}>
                      {option}
                    </Text>
                    {isCorrect && (
                      <Animated.View style={[styles.correctIcon, { opacity: correctAnim }]}>
                        <Icon name="check" size={16} color="#10b981" />
                      </Animated.View>
                    )}
                    {isWrong && (
                      <Animated.View style={[styles.wrongIcon, { opacity: wrongAnim }]}>
                        <Icon name="times" size={16} color="#ef4444" />
                      </Animated.View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {showExplanation && (
            <Animated.View style={[styles.explanationCard, { opacity: fadeAnim }]}>
              <View style={styles.explanationHeader}>
                <Icon name="lightbulb-o" size={20} color="#f59e0b" />
                <Text style={styles.explanationTitle}>Explanation</Text>
              </View>
              <Text style={styles.explanationText}>
                {questions[currentQuestion].explanation}
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={[
              styles.nextButton,
              selectedAnswer === null && styles.nextButtonDisabled
            ]}
            onPress={handleNextQuestion}
            disabled={selectedAnswer === null}
          >
            <LinearGradient
              colors={selectedAnswer === null ? ['#e2e8f0', '#cbd5e1'] : ['#4a6cfa', '#667eea']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
              </Text>
              <Icon name="arrow-right" size={16} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  quizContent: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingIcon: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',