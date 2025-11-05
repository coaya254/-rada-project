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
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import LearningAPIService from '../../services/LearningAPIService';

const { width, height } = Dimensions.get('window');

interface LessonSection {
  id: number;
  type: 'text' | 'video' | 'interactive' | 'quiz';
  title?: string;
  content: string;
  duration?: number;
  completed: boolean;
  videoUrl?: string;
}

export const LessonScreen = ({ navigation, route }: any) => {
  const lesson = route.params?.lesson;
  const scrollViewRef = useRef<ScrollView>(null);
  const videoRef = useRef<Video>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [lessonData, setLessonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [videoStatus, setVideoStatus] = useState<any>({});

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Lesson Not Found</Text>
          <Text style={styles.errorText}>Unable to load lesson data</Text>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    loadLessonData();
  }, [lesson.id]);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: (completedSections.length / lessonSections.length) * 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [completedSections]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      setLessonData({
        title: lesson.title,
        content: lesson.content || 'Lesson content will be displayed here.',
        duration: lesson.duration || 15,
        xp: lesson.xp || 25,
        videoUrl: lesson.videoUrl,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading lesson:', error);
      setLoading(false);
    }
  };

  const lessonSections: LessonSection[] = lessonData ? [
    {
      id: 1,
      type: lessonData.videoUrl ? 'video' : 'text',
      title: lessonData.title,
      content: lessonData.content,
      duration: lessonData.duration,
      completed: false,
      videoUrl: lessonData.videoUrl,
    },
  ] : [];

  // 🚨 CRITICAL FIX: Improved navigation logic with proper error handling
  const handleSectionComplete = async () => {
    if (!completedSections.includes(currentSection)) {
      setCompletedSections([...completedSections, currentSection]);
    }

    if (currentSection < lessonSections.length - 1) {
      setCurrentSection(currentSection + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    // Last section - mark lesson as complete
    try {
      setLoading(true);
      await LearningAPIService.completeLesson(lesson.id);
      
      // Fetch fresh module data to determine next step
      const moduleResponse = await LearningAPIService.getModuleById(lesson.moduleId);
      
      if (!moduleResponse.success || !moduleResponse.module) {
        throw new Error('Failed to load module data');
      }

      const { lessons: allLessons, moduleQuiz } = moduleResponse.module;
      const currentLessonIndex = allLessons.findIndex((l: any) => l.id === lesson.id);
      
      if (currentLessonIndex === -1) {
        throw new Error('Current lesson not found in module');
      }

      const isLastLesson = currentLessonIndex === allLessons.length - 1;

      if (isLastLesson && moduleQuiz) {
        // Navigate to module quiz
        navigation.replace('Quiz', {
          quizId: moduleQuiz.id,
          moduleId: lesson.moduleId,
          title: moduleQuiz.title,
          returnToModule: true
        });
      } else if (!isLastLesson) {
        // Navigate to next lesson
        const nextLesson = allLessons[currentLessonIndex + 1];
        const isNextLessonLast = currentLessonIndex + 1 === allLessons.length - 1;
        
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
            nextLessonId: isNextLessonLast ? null : allLessons[currentLessonIndex + 2]?.id
          }
        });
      } else {
        // Last lesson, no quiz - go back to module with refresh flag
        navigation.navigate('ModuleDetail', { 
          module: { id: lesson.moduleId },
          refresh: true 
        });
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      setLoading(false);
      Alert.alert(
        'Error',
        'Failed to proceed to next step. Please try again.',
        [
          { text: 'Go Back to Module', onPress: () => navigation.goBack() },
          { text: 'Retry', onPress: handleSectionComplete }
        ]
      );
    }
  };

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Lesson Progress</Text>
          <Text style={styles.progressPercentage}>
            {Math.round((completedSections.length / lessonSections.length) * 100)}%
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]} 
          />
        </View>
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <MaterialIcons name="check-circle" size={16} color="#10B981" />
            <Text style={styles.progressStatText}>
              {completedSections.length} of {lessonSections.length} completed
            </Text>
          </View>
          <View style={styles.progressStat}>
            <MaterialIcons name="stars" size={16} color="#F59E0B" />
            <Text style={styles.progressStatText}>{lessonData?.xp || 0} XP</Text>
          </View>
        </View>
      </View>
    );
  };

  const formatContent = (content: string) => {
    const lines = content.split('\n');
    const formattedContent: JSX.Element[] = [];
    let key = 0;

    lines.forEach((line) => {
      if (line.trim() === '') {
        formattedContent.push(<View key={key++} style={{ height: 16 }} />);
      } else if (line.startsWith('•')) {
        formattedContent.push(
          <View key={key++} style={styles.bulletPoint}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>{line.substring(1).trim()}</Text>
          </View>
        );
      } else if (line.match(/^\d+\./)) {
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
        }
      } else if (line.startsWith('**') && line.endsWith('**')) {
        formattedContent.push(
          <View key={key++} style={styles.sectionHeading}>
            <View style={styles.headingAccent} />
            <Text style={styles.headingText}>{line.replace(/\*\*/g, '')}</Text>
          </View>
        );
      } else {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        formattedContent.push(
          <Text key={key++} style={styles.paragraphText}>
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <Text key={i} style={styles.boldText}>{part.replace(/\*\*/g, '')}</Text>;
              }
              return part;
            })}
          </Text>
        );
      }
    });

    return formattedContent;
  };

  const renderVideoSection = (section: LessonSection) => {
    if (!section.videoUrl) return null;

    return (
      <View style={styles.videoContainer}>
        <View style={styles.videoWrapper}>
          <Video
            ref={videoRef}
            source={{ uri: section.videoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
            onPlaybackStatusUpdate={(status: AVPlaybackStatus) => setVideoStatus(status)}
            onLoad={() => console.log('Video loaded')}
            onError={(error) => console.error('Video error:', error)}
          />
          
          {!videoStatus.isPlaying && !videoStatus.isLoaded && (
            <View style={styles.videoOverlay}>
              <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)']}
                style={styles.videoGradient}
              >
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => videoRef.current?.playAsync()}
                >
                  <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    style={styles.playButtonGradient}
                  >
                    <MaterialIcons name="play-arrow" size={48} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.videoTitle}>{section.title}</Text>
                {section.duration && (
                  <View style={styles.videoDuration}>
                    <MaterialIcons name="schedule" size={16} color="#FFF" />
                    <Text style={styles.videoDurationText}>{section.duration} minutes</Text>
                  </View>
                )}
              </LinearGradient>
            </View>
          )}
        </View>
        
        <View style={styles.videoInfo}>
          <MaterialIcons name="info-outline" size={20} color="#3B82F6" />
          <Text style={styles.videoInfoText}>
            Watch the full video to continue to the next section
          </Text>
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
        default: return 'description';
      }
    };

    const getSectionColor = () => {
      switch (section.type) {
        case 'text': return '#3B82F6';
        case 'video': return '#EF4444';
        case 'interactive': return '#F59E0B';
        default: return '#3B82F6';
      }
    };

    return (
      <View style={styles.sectionContainer}>
        {/* Premium Header */}
        <LinearGradient
          colors={[getSectionColor() + '15', getSectionColor() + '05']}
          style={styles.sectionHeaderCard}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrapper, { backgroundColor: getSectionColor() }]}>
              <MaterialIcons name={getSectionIcon() as any} size={32} color="#FFFFFF" />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionMeta}>
                {section.duration && (
                  <View style={styles.metaItem}>
                    <MaterialIcons name="schedule" size={14} color="#666" />
                    <Text style={styles.sectionMetaText}>{section.duration} min</Text>
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
              <MaterialIcons name="check-circle" size={32} color="#10B981" />
            )}
          </View>
        </LinearGradient>

        {/* Video Section */}
        {section.type === 'video' && renderVideoSection(section)}

        {/* Text Content */}
        {section.type === 'text' && (
          <View style={styles.contentWrapper}>
            {formatContent(section.content)}
          </View>
        )}

        {/* Interactive Section */}
        {section.type === 'interactive' && (
          <View style={styles.interactiveSection}>
            <LinearGradient
              colors={['#FEF3C7', '#FDE68A']}
              style={styles.interactiveCard}
            >
              <View style={styles.interactiveIcon}>
                <MaterialIcons name="lightbulb" size={32} color="#F59E0B" />
              </View>
              <View style={styles.interactiveContent}>
                <Text style={styles.interactiveTitle}>Interactive Learning</Text>
                <Text style={styles.interactiveDescription}>
                  Engage with this concept through hands-on activities
                </Text>
              </View>
              <TouchableOpacity style={styles.interactiveButton}>
                <MaterialIcons name="play-arrow" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentLessonSection = lessonSections[currentSection];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
          <View style={styles.headerMeta}>
            <View style={styles.headerMetaItem}>
              <MaterialIcons name="menu-book" size={14} color="#666" />
              <Text style={styles.headerSubtitle}>Module {lesson.moduleId}</Text>
            </View>
            <View style={styles.headerDivider} />
            <View style={styles.headerMetaItem}>
              <MaterialIcons name="schedule" size={14} color="#666" />
              <Text style={styles.headerSubtitle}>{lessonData?.duration || 0} min</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.bookmarkButton}>
          <MaterialIcons name="bookmark-border" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {renderProgressBar()}

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderSection(currentLessonSection)}
      </ScrollView>

      {/* Premium Navigation Footer */}
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']}
        style={styles.footer}
      >
        <View style={styles.footerContent}>
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
            <MaterialIcons 
              name="chevron-left" 
              size={24} 
              color={currentSection === 0 ? "#ccc" : "#3B82F6"} 
            />
            <Text style={[styles.navButtonText, currentSection === 0 && styles.navButtonTextDisabled]}>
              Previous
            </Text>
          </TouchableOpacity>

          <View style={styles.sectionIndicator}>
            <View style={styles.dotsContainer}>
              {lessonSections.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentSection && styles.activeDot,
                    completedSections.includes(index) && styles.completedDot,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.sectionIndicatorText}>
              {currentSection + 1} / {lessonSections.length}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleSectionComplete}
          >
            <Text style={styles.nextButtonText}>
              {currentSection === lessonSections.length - 1 ? 'Complete' : 'Next'}
            </Text>
            <MaterialIcons name="chevron-right" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#D1D5DB',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  progressContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  progressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressStatText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  sectionContainer: {
    paddingBottom: 24,
  },
  sectionHeaderCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 26,
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionMetaText: {
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
    color: '#FFF',
  },
  videoContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  videoWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    marginBottom: 16,
  },
  playButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  videoDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  videoDurationText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
  },
  videoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
  },
  videoInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  contentWrapper: {
    paddingHorizontal: 20,
  },
  paragraphText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
    marginBottom: 16,
  },
  boldText: {
    fontWeight: '700',
    color: '#1E40AF',
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
    marginTop: 9,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  stepCard: {
    backgroundColor: '#FFF',
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
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  stepTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 22,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    paddingLeft: 48,
  },
  interactiveSection: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  interactiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  interactiveIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
    lineHeight: 18,
  },
  interactiveButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  sectionIndicator: {
    alignItems: 'center',
    gap: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  completedDot: {
    backgroundColor: '#10B981',
  },
  sectionIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});