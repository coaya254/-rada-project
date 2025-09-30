import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { QuizProps, QuizQuestion } from '../types/LearningTypes';

export const QuizScreen: React.FC<QuizProps> = ({ route, navigation }) => {
  const { quizId, courseTitle, xp } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizCompleted, setQuizCompleted] = useState(false);

  const questions: QuizQuestion[] = [
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
      explanation: "The Judiciary provides the primary mechanism for enforcing rights through constitutional petitions."
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
      explanation: "The Kenya National Commission on Human Rights (KNCHR) investigates human rights violations."
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
    }
  ];

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizCompleted]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = () => {
    const finalScore = selectedAnswer === questions[currentQuestion].correctAnswer ? score + 1 : score;
    const percentage = Math.round((finalScore / questions.length) * 100);
    
    setQuizCompleted(true);
    setScore(finalScore);
    
    // Navigate to completion screen
    navigation.navigate('Completion', {
      courseTitle,
      xpEarned: Math.round((percentage / 100) * xp),
      totalXP: xp,
      lessonsCompleted: 1
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (quizCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContainer}>
          <Icon name="check-circle" size={80} color="#10b981" />
          <Text style={styles.completedTitle}>Quiz Completed!</Text>
          <Text style={styles.completedScore}>Score: {score}/{questions.length}</Text>
          <Text style={styles.completedPercentage}>
            {Math.round((score / questions.length) * 100)}% Correct
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.quizContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={18} color="#1e293b" />
        </TouchableOpacity>

        <View style={styles.quizHeader}>
          <Text style={styles.quizTitle}>Quiz: {courseTitle}</Text>
          <View style={styles.quizMeta}>
            <Text style={styles.questionCounter}>
              Question {currentQuestion + 1} of {questions.length}
            </Text>
            <View style={styles.timer}>
              <Icon name="clock-o" size={16} color="#ef4444" />
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            {questions[currentQuestion].question}
          </Text>
          
          <View style={styles.optionsContainer}>
            {questions[currentQuestion].options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === index && styles.optionButtonSelected
                ]}
                onPress={() => handleAnswerSelect(index)}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.optionIndicator,
                    selectedAnswer === index && styles.optionIndicatorSelected
                  ]}>
                    <Text style={[
                      styles.optionLetter,
                      selectedAnswer === index && styles.optionLetterSelected
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.optionText,
                    selectedAnswer === index && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.nextButton,
            selectedAnswer === null && styles.nextButtonDisabled
          ]}
          onPress={handleNextQuestion}
          disabled={selectedAnswer === null}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
          </Text>
          <Icon name="arrow-right" size={16} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  quizContent: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quizHeader: {
    marginBottom: 20,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  quizMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionCounter: {
    fontSize: 14,
    color: '#64748b',
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a6cfa',
    borderRadius: 2,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionButtonSelected: {
    backgroundColor: '#4a6cfa20',
    borderColor: '#4a6cfa',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionIndicatorSelected: {
    backgroundColor: '#4a6cfa',
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  optionLetterSelected: {
    color: 'white',
  },
  optionText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  optionTextSelected: {
    color: '#4a6cfa',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#4a6cfa',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  completedScore: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 4,
  },
  completedPercentage: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
});

export default QuizScreen;