import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';

const QuizTakingScreen = ({ route, navigation }) => {
  const { quizId, quizTitle } = route.params;
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Mock data - replace with API call
    const mockQuestions = [
      {
        id: 1,
        question: "What is the capital of Kenya?",
        options: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
        correctAnswer: 0
      },
      {
        id: 2,
        question: "Which ocean borders Kenya to the east?",
        options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"],
        correctAnswer: 1
      }
    ];
    setQuestions(mockQuestions);
    setIsLoading(false);
  }, []);

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) correct++;
    });
    setScore(Math.round((correct / questions.length) * 100));
    setShowResults(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </View>
    );
  }

  if (showResults) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#4caf50', '#45a049']} style={styles.header}>
          <Text style={styles.headerTitle}>Quiz Complete!</Text>
        </LinearGradient>
        <ScrollView style={styles.content}>
          <View style={styles.resultsContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{score}%</Text>
            </View>
            <Text style={styles.resultsTitle}>
              {score >= 70 ? 'Congratulations!' : 'Keep Learning!'}
            </Text>
            <Text style={styles.resultsDescription}>
              You scored {score}% on this quiz.
            </Text>
            <TouchableOpacity style={styles.retakeButton} onPress={() => {
              setCurrentQuestion(0);
              setSelectedAnswers({});
              setShowResults(false);
            }}>
              <Text style={styles.retakeButtonText}>Retake Quiz</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.finishButton} onPress={() => navigation.goBack()}>
              <Text style={styles.finishButtonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4caf50', '#45a049']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{quizTitle}</Text>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>Question {currentQuestion + 1} of {questions.length}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQ.question}</Text>
          <View style={styles.optionsContainer}>
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQ.id] === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionButton, isSelected && styles.selectedOption]}
                  onPress={() => handleAnswerSelect(currentQ.id, index)}
                >
                  <View style={styles.optionContent}>
                    <View style={[styles.optionLetter, isSelected && styles.selectedOptionLetter]}>
                      <Text style={[styles.optionLetterText, isSelected && styles.selectedOptionLetterText]}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentQuestion < questions.length - 1 ? 'Next' : 'Submit Quiz'}
          </Text>
          <Icon name="arrow-right" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', flex: 1, textAlign: 'center', marginHorizontal: 16 },
  timerContainer: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  timerText: { color: 'white', fontSize: 14, fontWeight: '600' },
  content: { flex: 1, padding: 20 },
  questionContainer: { backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  questionText: { fontSize: 18, fontWeight: '600', color: '#333', lineHeight: 24, marginBottom: 20 },
  optionsContainer: { gap: 12 },
  optionButton: { borderWidth: 2, borderColor: '#e0e0e0', borderRadius: 12, padding: 16, backgroundColor: 'white' },
  selectedOption: { borderColor: '#4caf50', backgroundColor: 'rgba(76, 175, 80, 0.1)' },
  optionContent: { flexDirection: 'row', alignItems: 'center' },
  optionLetter: { width: 24, height: 24, backgroundColor: '#ecf0f1', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  selectedOptionLetter: { backgroundColor: '#4caf50' },
  optionLetterText: { fontSize: 12, fontWeight: '600', color: '#7f8c8d' },
  selectedOptionLetterText: { color: 'white' },
  optionText: { flex: 1, fontSize: 16, color: '#333', lineHeight: 22 },
  selectedOptionText: { color: '#4caf50', fontWeight: '500' },
  navigationContainer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, backgroundColor: '#4caf50' },
  nextButtonText: { fontSize: 16, fontWeight: '600', color: 'white', marginRight: 8 },
  resultsContainer: { alignItems: 'center', padding: 20 },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#4caf50', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  scoreText: { fontSize: 36, fontWeight: 'bold', color: 'white' },
  resultsTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 12, textAlign: 'center' },
  resultsDescription: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  retakeButton: { backgroundColor: 'white', borderWidth: 2, borderColor: '#4caf50', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginBottom: 12, width: '100%' },
  retakeButtonText: { color: '#4caf50', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  finishButton: { backgroundColor: '#4caf50', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, width: '100%' },
  finishButtonText: { color: 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' }
});

export default QuizTakingScreen;







