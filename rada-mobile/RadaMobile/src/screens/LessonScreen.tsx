import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
  Share,
  Image,
  Animated,
  Vibration,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useAnonMode } from '../contexts/AnonModeContext';
import apiService from '../services/api';
import offlineStorage from '../services/offlineStorage';

const { width: screenWidth } = Dimensions.get('window');

interface LessonScreenProps {
  route: {
    params: {
      lesson: {
        id: number;
        title: string;
        content?: string;
        duration?: number;
        xp?: number;
      };
      module?: {
  id: number;
  title: string;
      };
    };
  };
  navigation: any;
}

const LessonScreen: React.FC<LessonScreenProps> = ({ route, navigation }) => {
  const { user } = useAnonMode();
  const { lesson, module } = route.params;
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<{
    title: string;
    content: string;
    duration: number;
    difficulty: string;
    video_url?: string;
    resources?: Array<{
      title: string;
      url: string;
      type: 'article' | 'video' | 'document' | 'website';
    }>;
    key_points?: string[];
    quiz_questions?: Array<{
      question: string;
      options: string[];
      correct: number;
    }>;
  } | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  
  // Interactive features
  const [userProgress, setUserProgress] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Array<{id: string, text: string, user: string, timestamp: string}>>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // Animation refs
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const achievementAnimation = useRef(new Animated.Value(0)).current;
  const likeAnimation = useRef(new Animated.Value(1)).current;

  // Load lesson content from API or offline storage
  const loadLessonContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('LessonScreen - Loading lesson content:', lesson.id);
      
      // First, try to load from offline storage
      const offlineLesson = await offlineStorage.getOfflineLesson(lesson.id.toString());
      
      if (offlineLesson) {
        console.log('Loading lesson from offline storage');
        setLessonContent(offlineLesson);
        setIsLoading(false);
        return;
      }

      // If not offline, try to load from API
      try {
      const lessonResponse = await apiService.getLesson(lesson.id);
      
      console.log('LessonScreen - Lesson response:', lessonResponse);
      
      // Process lesson data
      let lessonData = null;
      if (lessonResponse?.data) {
        lessonData = lessonResponse.data;
      } else if (lessonResponse && typeof lessonResponse === 'object') {
        lessonData = lessonResponse;
      }

      if (lessonData) {
          const processedData = {
          title: lessonData.title || lesson.title,
          content: lessonData.content || 'Lesson content will be available soon.',
          duration: lessonData.estimated_time || lesson.duration || 15,
            difficulty: lessonData.difficulty || 'Beginner',
            video_url: lessonData.video_url,
            resources: lessonData.resources,
            key_points: lessonData.key_points,
            quiz_questions: lessonData.quiz_questions
          };
          
          // Save to offline storage for future use
          await offlineStorage.saveLessonOffline(lesson.id.toString(), processedData);
          setLessonContent(processedData);
      } else {
          throw new Error('No lesson data received');
        }
      } catch (apiError) {
        console.log('API not available, using fallback data');
        
        // Fallback to lesson data from navigation
        const fallbackData = {
          title: lesson.title,
          content: lesson.content || 'Lesson content will be available soon.',
          duration: lesson.duration || 15,
          difficulty: 'Beginner',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          resources: [
            {
              title: 'Constitution of Kenya 2010',
              url: 'https://www.kenyalaw.org/kl/fileadmin/pdfdownloads/Constitution_of_Kenya_2010.pdf',
              type: 'document'
            }
          ],
          key_points: [
            'Understanding the Constitution is crucial for civic participation',
            'The Constitution protects fundamental rights and freedoms'
          ]
        };
        
        // Save fallback data to offline storage
        await offlineStorage.saveLessonOffline(lesson.id.toString(), fallbackData);
        setLessonContent(fallbackData);
      }

    } catch (err) {
      console.error('Error loading lesson content:', err);
      setError('Failed to load lesson content. Please check your connection.');
      
      // Final fallback
      setLessonContent({
        title: lesson.title,
        content: lesson.content || 'Lesson content will be available soon.',
        duration: lesson.duration || 15,
        difficulty: 'Beginner'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLessonContent();
    loadNotesOffline();
  }, [lesson.id]);

  // Save notes when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveNotesOffline();
    }, 1000); // Debounce saving

    return () => clearTimeout(timeoutId);
  }, [notes]);

  const handleCompleteLesson = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please log in to save your progress');
      return;
    }

      // Save lesson progress to backend
      const progressData = {
        lesson_id: lesson.id,
        module_id: module?.id,
        user_id: user.uuid,
        completed: true,
        completion_time: new Date().toISOString(),
        xp_earned: lesson.xp || 10
      };

      console.log('LessonScreen - Saving progress:', progressData);
      
      await apiService.updateLessonProgress(progressData);
      
      setIsCompleted(true);
      Alert.alert('Success', 'Lesson completed! Your progress has been saved.');
      
    } catch (err) {
      console.error('Error saving lesson progress:', err);
      Alert.alert('Error', 'Failed to save progress. Please try again.');
    }
  };

  const handleNextLesson = () => {
    // Navigate to next lesson or back to module
    navigation.goBack();
  };

  // Interactive helper functions
  const handleResourcePress = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this resource');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open resource');
    }
  };

  const handleShareLesson = async () => {
    try {
      await Share.share({
        message: `Check out this lesson: ${lessonContent?.title}\n\n${lessonContent?.content?.substring(0, 100)}...`,
        title: lessonContent?.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'article': return '📄';
      case 'document': return '📋';
      case 'website': return '🌐';
      default: return '📎';
    }
  };

  // Interactive functions
  const checkAchievements = () => {
    const newAchievements = [];
    
    if (userProgress >= 100 && !achievements.includes('first_complete')) {
      newAchievements.push('first_complete');
      setCurrentAchievement('🎯 First Lesson Complete!');
    }
    
    if (likeCount >= 10 && !achievements.includes('popular')) {
      newAchievements.push('popular');
      setCurrentAchievement('🔥 Popular Lesson!');
    }
    
    if (comments.length >= 5 && !achievements.includes('discussion_leader')) {
      newAchievements.push('discussion_leader');
      setCurrentAchievement('💬 Discussion Leader!');
    }
    
    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements]);
      setShowAchievement(true);
      
      Animated.sequence([
        Animated.timing(achievementAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(achievementAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => setShowAchievement(false));
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    
    // Animate like button
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    Vibration.vibrate(50);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    Vibration.vibrate(50);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        text: newComment,
        user: user?.name || 'Anonymous',
        timestamp: new Date().toLocaleTimeString(),
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  // Save notes to offline storage
  const saveNotesOffline = async () => {
    if (notes.trim()) {
      await offlineStorage.saveNotesOffline(lesson.id.toString(), notes);
    }
  };

  // Load notes from offline storage
  const loadNotesOffline = async () => {
    const offlineNotes = await offlineStorage.getOfflineNotes();
    const lessonNotes = offlineNotes[lesson.id.toString()];
    if (lessonNotes) {
      setNotes(lessonNotes.notes);
    }
  };

  const updateProgress = (progress: number) => {
    setUserProgress(progress);
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Lesson...</Text>
            </View>
    );
  }

  if (error && !lessonContent) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadLessonContent}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!lessonContent) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lesson content not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
                </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
            <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Learning</Text>
            <Text style={styles.headerSubtitle}>{module?.title || 'Module'}</Text>
      </View>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShareLesson}
          >
            <Ionicons name="share-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Modern Lesson Card with Icon */}
        <View style={styles.lessonCard}>
          <View style={styles.lessonIconContainer}>
            <Text style={styles.lessonIcon}>📚</Text>
          </View>
          <View style={styles.lessonInfo}>
          <Text style={styles.lessonTitle}>{lessonContent.title}</Text>
            <Text style={styles.lessonDescription}>
              {lessonContent.difficulty} • {lessonContent.duration} minutes
            </Text>
      </View>
            </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Lesson Progress</Text>
            <Text style={styles.progressPercentage}>
              {isCompleted ? '100%' : '0%'}
            </Text>
            </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: isCompleted ? '100%' : '0%' }
              ]} 
            />
          </View>
        </View>

        {/* Video Section */}
        {lessonContent.video_url && (
          <View style={styles.videoSection}>
            <Text style={styles.sectionTitle}>📺 Video Lesson</Text>
            <View style={styles.videoCard}>
              <TouchableOpacity 
                style={styles.videoThumbnail}
                onPress={() => setShowVideo(!showVideo)}
              >
                <View style={styles.videoOverlay}>
                  <Ionicons name="play-circle" size={60} color="white" />
                  <Text style={styles.videoText}>Tap to watch video</Text>
      </View>
                <Image 
                  source={{ uri: `https://img.youtube.com/vi/${lessonContent.video_url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg` }}
                  style={styles.videoImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              
              {showVideo && (
                <View style={styles.videoContainer}>
                  <WebView
                    source={{ uri: lessonContent.video_url }}
                    style={styles.webView}
                    allowsFullscreenVideo={true}
                    mediaPlaybackRequiresUserAction={false}
                  />
            </View>
              )}
            </View>
          </View>
        )}

        {/* Content Section with Better Typography */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>📚 Lesson Content</Text>
          <View style={styles.contentCard}>
          <Text style={styles.contentText}>{lessonContent.content}</Text>
          </View>
          </View>

        {/* Key Points Section */}
        {lessonContent.key_points && lessonContent.key_points.length > 0 && (
          <View style={styles.keyPointsSection}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('keyPoints')}
            >
              <Text style={styles.sectionTitle}>🎯 Key Points</Text>
              <Ionicons 
                name={expandedSections.keyPoints ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#667eea" 
              />
            </TouchableOpacity>
            
            {expandedSections.keyPoints && (
              <View style={styles.keyPointsCard}>
                {lessonContent.key_points.map((point, index) => (
                  <View key={index} style={styles.keyPointItem}>
                    <Text style={styles.keyPointNumber}>{index + 1}</Text>
                    <Text style={styles.keyPointText}>{point}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Resources Section */}
        {lessonContent.resources && lessonContent.resources.length > 0 && (
          <View style={styles.resourcesSection}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('resources')}
            >
              <Text style={styles.sectionTitle}>🔗 Resources & Links</Text>
              <Ionicons 
                name={expandedSections.resources ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#667eea" 
              />
            </TouchableOpacity>
            
            {expandedSections.resources && (
              <View style={styles.resourcesCard}>
                {lessonContent.resources.map((resource, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resourceItem}
                    onPress={() => handleResourcePress(resource.url, resource.title)}
                  >
                    <View style={styles.resourceIcon}>
                      <Text style={styles.resourceIconText}>
                        {getResourceIcon(resource.type)}
                      </Text>
                    </View>
                    <View style={styles.resourceInfo}>
                      <Text style={styles.resourceTitle}>{resource.title}</Text>
                      <Text style={styles.resourceType}>{resource.type.toUpperCase()}</Text>
                    </View>
                    <Ionicons name="open-outline" size={20} color="#667eea" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Quick Quiz Section */}
        {lessonContent.quiz_questions && lessonContent.quiz_questions.length > 0 && (
          <View style={styles.quizSection}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('quiz')}
            >
              <Text style={styles.sectionTitle}>🧠 Quick Quiz</Text>
              <Ionicons 
                name={expandedSections.quiz ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#667eea" 
              />
            </TouchableOpacity>
            
            {expandedSections.quiz && (
              <View style={styles.quizCard}>
                <Text style={styles.quizDescription}>
                  Test your understanding with these quick questions:
                </Text>
                {lessonContent.quiz_questions.slice(0, 2).map((question, index) => (
                  <View key={index} style={styles.quizQuestion}>
                    <Text style={styles.quizQuestionText}>
                      {index + 1}. {question.question}
                    </Text>
                    <View style={styles.quizOptions}>
                      {question.options.map((option, optIndex) => (
                        <View key={optIndex} style={styles.quizOption}>
                          <Text style={styles.quizOptionText}>
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
                <TouchableOpacity style={styles.quizButton}>
                  <Text style={styles.quizButtonText}>Take Full Quiz</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Social Features Section */}
        <View style={styles.socialSection}>
          <View style={styles.socialActions}>
            <TouchableOpacity onPress={handleLike} style={styles.socialButton}>
              <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
                <Ionicons 
                  name={liked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={liked ? "#ff4757" : "#64748b"} 
                />
              </Animated.View>
              <Text style={[styles.socialText, liked && styles.likedText]}>
                {likeCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleBookmark} style={styles.socialButton}>
              <Ionicons 
                name={bookmarked ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={bookmarked ? "#f59e0b" : "#64748b"} 
              />
              <Text style={styles.socialText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowComments(!showComments)} style={styles.socialButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#64748b" />
              <Text style={styles.socialText}>{comments.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowNotes(!showNotes)} style={styles.socialButton}>
              <Ionicons name="create-outline" size={24} color="#64748b" />
              <Text style={styles.socialText}>Notes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        {showComments && (
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>💬 Discussion</Text>
            <View style={styles.commentsCard}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUser}>{comment.user}</Text>
                    <Text style={styles.commentTime}>{comment.timestamp}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))}
              
              <View style={styles.addCommentContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity onPress={handleAddComment} style={styles.addCommentButton}>
                  <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Notes Section */}
        {showNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>📝 My Notes</Text>
            <View style={styles.notesCard}>
              <TextInput
                style={styles.notesInput}
                placeholder="Take notes about this lesson..."
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {/* Modern Action Buttons */}
        <View style={styles.actionSection}>
          {!isCompleted ? (
        <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleCompleteLesson}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>✓ Complete Lesson</Text>
              </LinearGradient>
        </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleNextLesson}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.buttonGradient}
              >
                <Text style={styles.secondaryButtonText}>→ Continue Learning</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.outlineButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.outlineButtonText}>← Back to Module</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Achievement Notification */}
      {showAchievement && (
        <Animated.View 
          style={[
            styles.achievementNotification,
            {
              opacity: achievementAnimation,
              transform: [{
                translateY: achievementAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0]
                })
              }]
            }
          ]}
        >
          <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.achievementGradient}>
            <Ionicons name="trophy" size={24} color="white" />
            <Text style={styles.achievementText}>{currentAchievement}</Text>
          </LinearGradient>
        </Animated.View>
      )}
          </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // Modern Header with Gradient
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  headerSpacer: {
    width: 44,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  // Modern Lesson Card
  lessonCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  lessonIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonIcon: {
    fontSize: 28,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  lessonDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    lineHeight: 22,
  },
  // Progress Section
  progressContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  // Content Section
  contentSection: {
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contentText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#374151',
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  // Section Styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  // Video Section
  videoSection: {
    marginBottom: 20,
  },
  videoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  videoThumbnail: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  videoImage: {
    width: '100%',
    height: 200,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  videoContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
  // Key Points Section
  keyPointsSection: {
    marginBottom: 20,
  },
  keyPointsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  keyPointNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667eea',
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  keyPointText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    fontWeight: '500',
  },
  // Resources Section
  resourcesSection: {
    marginBottom: 20,
  },
  resourcesCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceIconText: {
    fontSize: 18,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  resourceType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  // Quiz Section
  quizSection: {
    marginBottom: 20,
  },
  quizCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quizDescription: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  quizQuestion: {
    marginBottom: 16,
  },
  quizQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  quizOptions: {
    marginLeft: 16,
  },
  quizOption: {
    paddingVertical: 4,
  },
  quizOptionText: {
    fontSize: 14,
    color: '#64748b',
  },
  quizButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  quizButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Action Section
  actionSection: {
    marginBottom: 24,
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    marginBottom: 12,
  },
  outlineButton: {
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  outlineButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Social Features Styles
  socialSection: {
    marginBottom: 20,
  },
  socialActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  socialButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    minWidth: 60,
  },
  socialText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
  },
  likedText: {
    color: '#ff4757',
  },
  
  // Comments Styles
  commentsSection: {
    marginBottom: 20,
  },
  commentsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  commentItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  commentTime: {
    fontSize: 12,
    color: '#64748b',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8fafc',
    marginRight: 8,
    maxHeight: 80,
  },
  addCommentButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Notes Styles
  notesSection: {
    marginBottom: 20,
  },
  notesCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8fafc',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  // Achievement Styles
  achievementNotification: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  achievementGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  achievementText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
    flex: 1,
  },
});

export default LessonScreen;