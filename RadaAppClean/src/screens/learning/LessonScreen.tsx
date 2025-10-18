import React, { useState, useRef, useEffect } from 'react';
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
import LearningAPIService from '../../services/LearningAPIService';

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

export const LessonScreen: React.FC<LessonScreenProps> = ({ navigation, route }) => {
  // Safely extract params with defaults
  const lesson = route.params?.lesson;
  const lessonQuiz = route.params?.lessonQuiz;

  // DEBUG: Log what we received
  console.log('=== LessonScreen Mounted ===');
  console.log('Lesson ID:', lesson?.id);
  console.log('Lesson Title:', lesson?.title);
  console.log('lessonQuiz received:', lessonQuiz);
  console.log('lessonQuiz.id:', lessonQuiz?.id);

  const scrollViewRef = useRef<ScrollView>(null);

  const [lessonData, setLessonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  // Early return if no lesson data
  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No lesson data available</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    // For now, use the lesson content from params
    // In a real scenario, you'd fetch full lesson details from API
    setLessonData({
      title: lesson.title,
      content: lesson.content || 'Lesson content will be displayed here.',
      duration: 15,
      xp: 25,
    });
    setLoading(false);
  }, [lesson.id]);

  // Create a simple section from the lesson content
  const lessonSections: LessonSection[] = lessonData ? [
    {
      id: 1,
      type: 'text',
      title: lessonData.title,
      content: lessonData.content,
      duration: lessonData.duration,
      completed: false,
    },
  ] : [];

  if (loading || !lessonData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentLessonSection = lessonSections[currentSection];

  const handleSectionComplete = async () => {
    console.log('=== handleSectionComplete called ===');
    console.log('Current section:', currentSection);
    console.log('Lesson sections length:', lessonSections.length);
    console.log('Lesson ID:', lesson.id);
    console.log('Is last lesson?', lesson.isLastLesson);
    console.log('Next lesson ID:', lesson.nextLessonId);

    if (!completedSections.includes(currentSection)) {
      setCompletedSections([...completedSections, currentSection]);
    }

    if (currentSection < lessonSections.length - 1) {
      console.log('Not last section, moving to next section');
      setCurrentSection(currentSection + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      console.log('Last section! Completing lesson...');
      // Last section complete - call backend to complete lesson
      try {
        const response = await LearningAPIService.completeLesson(lesson.id);
        console.log('Lesson completed response:', response);

        // Check if this is the last lesson in the module
        const isLastLesson = lesson.isLastLesson || false;
        console.log('isLastLesson:', isLastLesson);

        if (isLastLesson) {
          console.log('Last lesson complete - fetching module quiz...');
          // Last lesson in module - fetch quiz and navigate directly to it
          try {
            const moduleResponse = await LearningAPIService.getModuleById(lesson.moduleId);
            console.log('Module response for quiz:', moduleResponse);

            if (moduleResponse.success && moduleResponse.module && moduleResponse.module.moduleQuiz) {
              const moduleQuiz = moduleResponse.module.moduleQuiz;
              console.log('Found module quiz:', moduleQuiz.id, moduleQuiz.title);
              console.log('Navigating directly to quiz...');

              // Navigate directly to quiz
              navigation.replace('Quiz', {
                quizId: moduleQuiz.id,
                moduleId: lesson.moduleId,
                title: moduleQuiz.title
              });
            } else {
              console.log('No quiz found, going back to module');
              // No quiz found, go back to module screen
              navigation.goBack();
            }
          } catch (error) {
            console.error('Error fetching module quiz:', error);
            navigation.goBack();
          }
        } else {
          console.log('Not last lesson, fetching next lesson data...');
          // Not the last lesson - fetch next lesson data and navigate to it
          if (lesson.nextLessonId) {
            console.log('Has next lesson ID, fetching module data...');
            try {
              // Fetch the full module data to get the next lesson's complete information
              const moduleResponse = await LearningAPIService.getModuleById(lesson.moduleId);
              console.log('Module response:', moduleResponse);

              if (moduleResponse.success && moduleResponse.module) {
                const lessons = moduleResponse.module.lessons || [];
                const nextLessonIndex = lessons.findIndex((l: any) => l.id === lesson.nextLessonId);
                console.log('Next lesson index:', nextLessonIndex);

                if (nextLessonIndex !== -1) {
                  const nextLesson = lessons[nextLessonIndex];
                  const isNextLessonLast = nextLessonIndex === lessons.length - 1;
                  const nextNextLessonId = nextLessonIndex < lessons.length - 1 ? lessons[nextLessonIndex + 1].id : null;
                  console.log('Found next lesson:', nextLesson);
                  console.log('Navigating to next lesson directly...');

                  // Navigate directly to next lesson without alert (Alert doesn't work well on web)
                  navigation.replace('Lesson', {
                    lesson: {
                      id: nextLesson.id,
                      title: nextLesson.title,
                      moduleId: lesson.moduleId,
                      content: nextLesson.content || nextLesson.description,
                      description: nextLesson.description,
                      duration: nextLesson.duration_minutes,
                      xp: nextLesson.xp_reward,
                      videoUrl: nextLesson.video_url,
                      isLastLesson: isNextLessonLast,
                      nextLessonId: nextNextLessonId
                    }
                  });
                  console.log('Navigation.replace completed');
                } else {
                  // Couldn't find next lesson, go back to module
                  navigation.goBack();
                }
              } else {
                // Failed to fetch module data, go back
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error fetching next lesson:', error);
              navigation.goBack();
            }
          } else {
            // No next lesson, go back to module
            navigation.goBack();
          }
        }
      } catch (error) {
        console.error('Error completing lesson:', error);
        Alert.alert(
          'Error',
          'Failed to complete lesson. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const renderProgressBar = () => {
    const progress = (completedSections.length / lessonSections.length) * 100;

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

    const getSectionColor = () => {
      switch (section.type) {
        case 'text': return '#3B82F6';
        case 'video': return '#EF4444';
        case 'interactive': return '#F59E0B';
        case 'quiz': return '#8B5CF6';
        default: return '#3B82F6';
      }
    };

    // Format content with better structure
    const formatContent = (content: string) => {
      const lines = content.split('\n');
      const formattedContent: JSX.Element[] = [];
      let key = 0;
      let bulletGroup: JSX.Element[] = [];
      let inBulletGroup = false;

      const flushBulletGroup = () => {
        if (bulletGroup.length > 0) {
          formattedContent.push(
            <View key={`bullet-group-${key++}`} style={styles.bulletGroup}>
              {bulletGroup}
            </View>
          );
          bulletGroup = [];
          inBulletGroup = false;
        }
      };

      lines.forEach((line, index) => {
        if (line.trim() === '') {
          flushBulletGroup();
          formattedContent.push(<View key={key++} style={{ height: 8 }} />);
        } else if (line.startsWith('•')) {
          inBulletGroup = true;
          bulletGroup.push(
            <View key={key++} style={styles.bulletPoint}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{line.substring(1).trim()}</Text>
            </View>
          );
        } else if (line.match(/^\d+\./)) {
          flushBulletGroup();
          const match = line.match(/^(\d+)\.\s*\*\*(.*?)\*\*:\s*(.*)/);
          if (match) {
            formattedContent.push(
              <View key={key++} style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    style={styles.stepNumber}
                  >
                    <Text style={styles.stepNumberText}>{match[1]}</Text>
                  </LinearGradient>
                  <Text style={styles.stepTitle}>{match[2]}</Text>
                </View>
                <Text style={styles.stepDescription}>{match[3]}</Text>
              </View>
            );
          } else {
            formattedContent.push(
              <Text key={key++} style={styles.contentText}>{line}</Text>
            );
          }
        } else if (line.startsWith('**') && line.endsWith('**')) {
          flushBulletGroup();
          formattedContent.push(
            <View key={key++} style={styles.sectionHeading}>
              <View style={styles.headingAccent} />
              <Text style={styles.headingText}>{line.replace(/\*\*/g, '')}</Text>
            </View>
          );
        } else {
          flushBulletGroup();
          const parts = line.split(/(\*\*.*?\*\*)/g);
          formattedContent.push(
            <Text key={key++} style={styles.paragraphText}>
              {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <Text key={i} style={styles.inlineBold}>{part.replace(/\*\*/g, '')}</Text>;
                }
                return part;
              })}
            </Text>
          );
        }
      });

      flushBulletGroup();
      return formattedContent;
    };

    return (
      <View style={styles.sectionContainer}>
        {/* Enhanced Header with Gradient Background */}
        <LinearGradient
          colors={[getSectionColor() + '15', getSectionColor() + '05']}
          style={styles.sectionHeaderCard}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrapper, { backgroundColor: getSectionColor() }]}>
              <MaterialIcons name={getSectionIcon() as any} size={28} color="#FFFFFF" />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionMeta}>
                {section.duration && (
                  <View style={styles.metaItem}>
                    <MaterialIcons name="schedule" size={14} color="#666" />
                    <Text style={styles.sectionDuration}>{section.duration} min read</Text>
                  </View>
                )}
                <View style={[styles.typeBadge, { backgroundColor: getSectionColor() }]}>
                  <Text style={styles.typeText}>
                    {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
            {completedSections.includes(currentSection) && (
              <View style={styles.completedBadge}>
                <MaterialIcons name="check-circle" size={32} color="#10B981" />
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Main Content with Better Spacing */}
        <View style={styles.contentWrapper}>
          {formatContent(section.content)}
        </View>

        {section.type === 'interactive' && (
          <View style={styles.interactiveSection}>
            <LinearGradient
              colors={['#FEF3C7', '#FDE68A']}
              style={styles.interactiveCard}
            >
              <MaterialIcons name="lightbulb" size={32} color="#F59E0B" />
              <View style={styles.interactiveContent}>
                <Text style={styles.interactiveTitle}>Interactive Learning</Text>
                <Text style={styles.interactiveDescription}>
                  Explore this concept with our interactive tool
                </Text>
              </View>
              <TouchableOpacity style={styles.interactiveButton}>
                <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {section.type === 'video' && (
          <View style={styles.videoSection}>
            <TouchableOpacity style={styles.videoPlaceholder}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.playButton}
              >
                <MaterialIcons name="play-arrow" size={40} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.videoTitle}>Watch Video Lesson</Text>
              <Text style={styles.videoDuration}>{section.duration} minutes</Text>
            </TouchableOpacity>
          </View>
        )}
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
      </View>

      {renderProgressBar()}

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderSection(currentLessonSection)}
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
            {`${currentSection + 1} of ${lessonSections.length}`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleSectionComplete}
        >
          <Text style={styles.navButtonText}>
            {currentSection === lessonSections.length - 1 ? 'Complete' : 'Next'}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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
    paddingBottom: 24,
  },
  sectionHeaderCard: {
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  sectionIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 28,
  },
  sectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionDuration: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  completedBadge: {
    marginLeft: 12,
  },
  contentWrapper: {
    paddingHorizontal: 20,
  },
  paragraphText: {
    fontSize: 17,
    lineHeight: 28,
    color: '#374151',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  headingAccent: {
    width: 4,
    height: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    marginRight: 12,
  },
  headingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  inlineBold: {
    fontWeight: '700',
    color: '#1E40AF',
  },
  bulletGroup: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginTop: 10,
    marginRight: 14,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 24,
  },
  stepDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    paddingLeft: 50,
  },
  interactiveSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  interactiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  interactiveContent: {
    flex: 1,
  },
  interactiveTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  interactiveDescription: {
    fontSize: 13,
    color: '#B45309',
  },
  interactiveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  videoPlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  videoDuration: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  markCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markCompleteText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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