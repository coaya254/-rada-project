import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';

const { width } = Dimensions.get('window');

interface LessonScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'Lesson'>;
  route: RouteProp<LearningStackParamList, 'Lesson'>;
}

interface LessonSection {
  id: number;
  type: 'text' | 'video' | 'interactive' | 'quiz';
  title?: string;
  content: string;
  duration?: number;
  completed: boolean;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const LessonScreen: React.FC<LessonScreenProps> = ({ navigation, route }) => {
  const { lesson } = route.params;
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const lessonSections: LessonSection[] = [
    {
      id: 1,
      type: 'text',
      title: 'Introduction to the Constitution',
      content: `The Constitution of Kenya is the supreme law of our country. It was promulgated on August 27, 2010, replacing the old constitution from 1963.

The Constitution establishes the framework for governance and defines the fundamental rights and freedoms of all Kenyan citizens. It creates three arms of government:

• **Executive**: Led by the President, implements and enforces laws
• **Legislature**: Parliament makes laws for the country
• **Judiciary**: Courts interpret laws and settle disputes

The Constitution also establishes devolved government through 47 counties, bringing government closer to the people and ensuring local participation in governance.`,
      duration: 5,
      completed: false,
    },
    {
      id: 2,
      type: 'interactive',
      title: 'Key Constitutional Principles',
      content: `The Constitution is built on several key principles that guide how our country is governed:

**1. Rule of Law**
All people, including leaders, are subject to the law. No one is above the law.

**2. Separation of Powers**
The three arms of government have distinct roles and check each other's power.

**3. Public Participation**
Citizens have the right to participate in governance and decision-making.

**4. Transparency and Accountability**
Government must be open about its actions and answer to the people.

**5. Protection of Human Rights**
The Constitution guarantees fundamental rights and freedoms for all.`,
      duration: 7,
      completed: false,
    },
    {
      id: 3,
      type: 'video',
      title: 'How Laws Are Made',
      content: `Understanding the legislative process in Kenya:

The process of making laws in Kenya involves several steps:

1. **Bill Introduction**: A bill can be introduced by Members of Parliament or the Executive
2. **First Reading**: The bill is formally presented to Parliament
3. **Second Reading**: Members debate the general principles of the bill
4. **Committee Stage**: The bill is examined in detail by a parliamentary committee
5. **Third Reading**: Final vote on the bill
6. **Presidential Assent**: The President signs the bill into law

This process ensures thorough consideration and public input before laws are enacted.`,
      duration: 8,
      completed: false,
    },
  ];

  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: 'When was the current Constitution of Kenya promulgated?',
      options: ['August 27, 2008', 'August 27, 2010', 'December 12, 2010', 'June 1, 2010'],
      correctAnswer: 1,
      explanation: 'The Constitution of Kenya was promulgated on August 27, 2010, after a successful referendum.',
    },
    {
      id: 2,
      question: 'How many counties does Kenya have under the current Constitution?',
      options: ['45', '46', '47', '48'],
      correctAnswer: 2,
      explanation: 'Kenya has 47 counties as established by the Constitution for devolved governance.',
    },
    {
      id: 3,
      question: 'Which principle ensures that no one, including leaders, is above the law?',
      options: ['Separation of Powers', 'Rule of Law', 'Public Participation', 'Transparency'],
      correctAnswer: 1,
      explanation: 'The Rule of Law principle ensures that all people, including government officials, are subject to the law.',
    },
  ];

  const currentLessonSection = lessonSections[currentSection];

  const handleSectionComplete = () => {
    if (!completedSections.includes(currentSection)) {
      setCompletedSections([...completedSections, currentSection]);
    }

    if (currentSection < lessonSections.length - 1) {
      setCurrentSection(currentSection + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      setShowQuiz(true);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = quizQuestions[0]; // Simplified for demo
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    Alert.alert(
      isCorrect ? 'Correct!' : 'Incorrect',
      currentQuestion.explanation,
      [
        {
          text: 'Continue',
          onPress: () => {
            setQuizCompleted(true);
            if (isCorrect) {
              Alert.alert(
                'Lesson Complete!',
                'Congratulations! You have completed this lesson and earned 50 XP.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            }
          },
        },
      ]
    );
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    Alert.alert(
      bookmarked ? 'Bookmark Removed' : 'Lesson Bookmarked',
      bookmarked
        ? 'This lesson has been removed from your bookmarks.'
        : 'This lesson has been added to your bookmarks for easy access later.'
    );
  };

  const renderProgressBar = () => {
    const progress = ((completedSections.length + (showQuiz && quizCompleted ? 1 : 0)) / (lessonSections.length + 1)) * 100;

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    );
  };

  const renderSection = (section: LessonSection) => {
    const getSectionIcon = () => {
      switch (section.type) {
        case 'text': return 'article';
        case 'video': return 'play-circle-filled';
        case 'interactive': return 'touch-app';
        case 'quiz': return 'quiz';
        default: return 'description';
      }
    };

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <MaterialIcons name={getSectionIcon() as any} size={24} color="#3B82F6" />
          </View>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.duration && (
              <Text style={styles.sectionDuration}>{section.duration} min read</Text>
            )}
          </View>
          {completedSections.includes(currentSection) && (
            <MaterialIcons name="check-circle" size={24} color="#10B981" />
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>{section.content}</Text>
        </View>

        {section.type === 'interactive' && (
          <View style={styles.interactiveSection}>
            <TouchableOpacity style={styles.interactiveButton}>
              <MaterialIcons name="lightbulb" size={20} color="#F59E0B" />
              <Text style={styles.interactiveButtonText}>Try Interactive Example</Text>
            </TouchableOpacity>
          </View>
        )}

        {section.type === 'video' && (
          <View style={styles.videoSection}>
            <TouchableOpacity style={styles.videoPlaceholder}>
              <MaterialIcons name="play-circle-filled" size={48} color="#3B82F6" />
              <Text style={styles.videoText}>Play Video Lesson</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderQuiz = () => {
    const question = quizQuestions[0]; // Simplified for demo

    return (
      <View style={styles.quizContainer}>
        <View style={styles.quizHeader}>
          <MaterialIcons name="quiz" size={32} color="#8B5CF6" />
          <Text style={styles.quizTitle}>Knowledge Check</Text>
        </View>

        <Text style={styles.questionText}>{question.question}</Text>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === index && styles.selectedOption,
              ]}
              onPress={() => handleQuizAnswer(index)}
            >
              <Text style={[
                styles.optionText,
                selectedAnswer === index && styles.selectedOptionText,
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, selectedAnswer === null && styles.submitButtonDisabled]}
          onPress={handleQuizSubmit}
          disabled={selectedAnswer === null}
        >
          <Text style={[styles.submitButtonText, selectedAnswer === null && styles.submitButtonTextDisabled]}>
            Submit Answer
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{lesson.title}</Text>
          <Text style={styles.headerSubtitle}>Module {lesson.moduleId} • Lesson {lesson.id}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={handleBookmark}
        >
          <MaterialIcons
            name={bookmarked ? "bookmark" : "bookmark-border"}
            size={24}
            color={bookmarked ? "#F59E0B" : "#333"}
          />
        </TouchableOpacity>
      </View>

      {renderProgressBar()}

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!showQuiz ? renderSection(currentLessonSection) : renderQuiz()}
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentSection === 0 && styles.navButtonDisabled]}
          onPress={() => {
            if (currentSection > 0) {
              setCurrentSection(currentSection - 1);
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }
          }}
          disabled={currentSection === 0}
        >
          <MaterialIcons name="chevron-left" size={20} color={currentSection === 0 ? "#ccc" : "#3B82F6"} />
          <Text style={[styles.navButtonText, currentSection === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionIndicator}>
          <Text style={styles.sectionIndicatorText}>
            {!showQuiz ? `${currentSection + 1} of ${lessonSections.length}` : 'Quiz'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleSectionComplete}
        >
          <Text style={styles.navButtonText}>
            {currentSection === lessonSections.length - 1 ? 'Take Quiz' : 'Next'}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color="#3B82F6" />
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  sectionContainer: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionDuration: {
    fontSize: 14,
    color: '#666',
  },
  contentContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  interactiveSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  interactiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  interactiveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d97706',
  },
  videoSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  videoPlaceholder: {
    width: width - 48,
    height: 200,
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  videoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginTop: 8,
  },
  quizContainer: {
    padding: 24,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'center',
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  selectedOption: {
    backgroundColor: '#dbeafe',
    borderColor: '#3B82F6',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedOptionText: {
    fontWeight: '600',
    color: '#1d4ed8',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  submitButtonTextDisabled: {
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  sectionIndicator: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sectionIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});