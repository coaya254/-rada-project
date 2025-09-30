import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';

interface QuizScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'Quiz'>;
  route: RouteProp<LearningStackParamList, 'Quiz'>;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ navigation, route }) => {
  const { quizId, moduleId, title } = route.params;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const questions: QuizQuestion[] = [
    {
      id: 1,
      question: 'What are the three branches of government in the United States?',
      options: [
        'Executive, Legislative, Judicial',
        'Federal, State, Local',
        'House, Senate, Supreme Court',
        'President, Congress, Military'
      ],
      correctAnswer: 0,
      explanation: 'The three branches are Executive (President), Legislative (Congress), and Judicial (Courts).'
    },
    {
      id: 2,
      question: 'How many amendments are in the Bill of Rights?',
      options: ['8', '10', '12', '15'],
      correctAnswer: 1,
      explanation: 'The Bill of Rights consists of the first 10 amendments to the Constitution.'
    },
    {
      id: 3,
      question: 'Which branch of government has the power to declare war?',
      options: ['Executive', 'Legislative', 'Judicial', 'Military'],
      correctAnswer: 1,
      explanation: 'Only Congress (Legislative branch) has the constitutional power to declare war.'
    },
    {
      id: 4,
      question: 'What is the primary purpose of checks and balances?',
      options: [
        'To count votes accurately',
        'To prevent any one branch from becoming too powerful',
        'To balance the federal budget',
        'To check government spending'
      ],
      correctAnswer: 1,
      explanation: 'Checks and balances ensure no single branch of government becomes too powerful.'
    },
    {
      id: 5,
      question: 'How many senators does each state have?',
      options: ['1', '2', '3', 'It varies by population'],
      correctAnswer: 1,
      explanation: 'Each state has exactly 2 senators, regardless of population size.'
    }
  ];

  useEffect(() => {
    setAnswers(new Array(questions.length).fill(null));
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizCompleted) {
      handleQuizComplete();
    }
  }, [timeLeft, quizCompleted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1]);
    } else {
      handleQuizComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
    }
  };

  const handleQuizComplete = () => {
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setQuizCompleted(true);
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

  if (quizCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <View style={styles.completedContainer}>
          <View style={styles.scoreCard}>
            <LinearGradient
              colors={[getScoreColor(), getScoreColor() + 'CC']}
              style={styles.scoreGradient}
            >
              <MaterialIcons name="quiz" size={48} color="#FFFFFF" />
              <Text style={styles.completedTitle}>Quiz Completed!</Text>
              <Text style={styles.scoreText}>{score} / {questions.length}</Text>
              <Text style={styles.percentageText}>
                {Math.round((score / questions.length) * 100)}%
              </Text>
              <Text style={styles.xpEarned}>🏆 +{score * 10} XP Earned</Text>
            </LinearGradient>
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleRestart}>
              <MaterialIcons name="refresh" size={24} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color="#10B981" />
              <Text style={styles.actionButtonText}>Back to Module</Text>
            </TouchableOpacity>
          </View>
        </View>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>Question {currentQuestion + 1}</Text>
          <Text style={styles.questionText}>{questions[currentQuestion].question}</Text>
        </View>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {questions[currentQuestion].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === index && styles.selectedOption
              ]}
              onPress={() => handleAnswerSelect(index)}
            >
              <View style={[
                styles.optionIndicator,
                selectedAnswer === index && styles.selectedIndicator
              ]}>
                <Text style={[
                  styles.optionLetter,
                  selectedAnswer === index && styles.selectedOptionLetter
                ]}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={[
                styles.optionText,
                selectedAnswer === index && styles.selectedOptionText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
          style={[styles.nextButton, !selectedAnswer && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selectedAnswer === null}
        >
          <Text style={[styles.nextButtonText, !selectedAnswer && styles.nextButtonTextDisabled]}>
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
          </Text>
          <MaterialIcons
            name={currentQuestion === questions.length - 1 ? 'check' : 'chevron-right'}
            size={24}
            color={selectedAnswer !== null ? '#FFFFFF' : '#9CA3AF'}
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
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    lineHeight: 26,
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
    backgroundColor: '#e9ecef',
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
  },
  scoreCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreGradient: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 12,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  percentageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  xpEarned: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});