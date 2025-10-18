import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';
import { LearningAPIService } from '../../services/LearningAPIService';

interface DailyChallengeScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'DailyChallenge'>;
}

interface ChallengeQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  score: number;
  timeCompleted: string;
  streak: number;
}

export const DailyChallengeScreen: React.FC<DailyChallengeScreenProps> = ({ navigation }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  // API-related state
  const [todayChallenge, setTodayChallenge] = useState<ChallengeQuestion[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [challengeId, setChallengeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [maxXP, setMaxXP] = useState(300);
  const [answersArray, setAnswersArray] = useState<Array<{ questionId: number; selectedIndex: number }>>([]);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  // Fetch today's challenge on mount
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await LearningAPIService.getTodayChallenge();
        if (response.success) {
          // Map API data to component state
          const questions = response.challenge.questions.map((q: any) => ({
            id: q.id,
            question: q.question_text,
            options: JSON.parse(q.options),
            correctAnswer: q.correct_answer_index,
            explanation: q.explanation || 'No explanation available',
          }));

          setTodayChallenge(questions);
          setChallengeId(response.challenge.id);
          setMaxXP(response.challenge.xp_reward || 300);

          // Check if already completed
          if (response.challenge.userStatus?.completed) {
            setAlreadyCompleted(true);
            setCompleted(true);
            setScore(response.challenge.userStatus.score || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching challenge:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, []);

  // Fetch user streak on mount
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const response = await LearningAPIService.getStreak();
        if (response.success) {
          setCurrentStreak(response.streak.current_streak || 0);
          setLongestStreak(response.streak.longest_streak || 0);
        }
      } catch (error) {
        console.error('Error fetching streak:', error);
      }
    };

    fetchStreak();
  }, []);

  useEffect(() => {
    if (!loading) {
      animateIn();
    }
  }, [loading]);

  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !completed) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && hasStarted && !completed) {
      handleChallengeComplete();
    }
  }, [timeLeft, hasStarted, completed]);

  useEffect(() => {
    if (hasStarted) {
      animateIn();
      setShowExplanation(false);
      setIsCorrect(null);
    }
  }, [currentQuestion]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartChallenge = () => {
    setHasStarted(true);
    animateIn();
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showExplanation) {
      setSelectedAnswer(answerIndex);
      // Track the answer for submission
      const questionId = todayChallenge[currentQuestion]?.id;
      if (questionId) {
        setAnswersArray(prev => {
          const existing = prev.findIndex(a => a.questionId === questionId);
          if (existing >= 0) {
            const newArr = [...prev];
            newArr[existing] = { questionId, selectedIndex: answerIndex };
            return newArr;
          }
          return [...prev, { questionId, selectedIndex: answerIndex }];
        });
      }
    }
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === todayChallenge[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);

    if (correct) {
      setScore(score + 100);
    }
  };

  const handleNext = () => {
    if (currentQuestion < todayChallenge.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      handleChallengeComplete();
    }
  };

  const handleChallengeComplete = async () => {
    if (!challengeId) {
      setCompleted(true);
      return;
    }

    try {
      // Submit challenge attempt to backend
      const timeUsed = 120 - timeLeft;

      const response = await LearningAPIService.submitChallengeAttempt(
        challengeId,
        answersArray,
        timeUsed
      );

      if (response.success) {
        // Update streak info from response
        if (response.currentStreak !== undefined) {
          setCurrentStreak(response.currentStreak);
        }

        // Fetch leaderboard
        await fetchLeaderboard();
      }
    } catch (error) {
      console.error('Error submitting challenge:', error);
    } finally {
      setCompleted(true);
    }
  };

  const fetchLeaderboard = async () => {
    if (!challengeId) return;

    try {
      const response = await LearningAPIService.getChallengeLeaderboard(challengeId, 10);
      if (response.success) {
        const formattedLeaderboard = response.leaderboard.map((entry: any, index: number) => ({
          rank: entry.rank || index + 1,
          userId: entry.user_id?.toString() || `${index + 1}`,
          username: entry.username || `User ${entry.user_id}`,
          avatar: ['👑', '🎯', '⚖️', '🗳️', '📚', '🏆', '⭐', '💎', '🎓', '🔥'][index] || '👤',
          score: entry.score || 0,
          timeCompleted: formatSeconds(entry.time_taken || 0),
          streak: entry.current_streak || 0,
        }));

        setLeaderboard(formattedLeaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const formatSeconds = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleRetry = () => {
    setHasStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsCorrect(null);
    setScore(0);
    setCompleted(false);
    setTimeLeft(120);
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{item.rank}</Text>
      </View>

      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>{item.avatar}</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <View style={styles.userStats}>
          <MaterialIcons name="local-fire-department" size={14} color="#F59E0B" />
          <Text style={styles.streakText}>{item.streak} day streak</Text>
        </View>
      </View>

      <View style={styles.scoreInfo}>
        <Text style={styles.scoreValue}>{item.score}</Text>
        <Text style={styles.timeValue}>{item.timeCompleted}</Text>
      </View>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={[styles.container, styles.centerContent]}>
          <MaterialIcons name="emoji-events" size={64} color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading Today's Challenge...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No challenge available
  if (todayChallenge.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Daily Challenge</Text>
          </View>
        </View>
        <View style={[styles.container, styles.centerContent]}>
          <MaterialIcons name="info" size={64} color="#666" />
          <Text style={styles.noDataText}>No challenge available today</Text>
          <Text style={styles.noDataSubtext}>Check back tomorrow!</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (completed) {
    const percentage = Math.round((score / (todayChallenge.length * 100)) * 100);
    const earnedStreak = percentage >= 67;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.completedContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Completion Card */}
            <View style={styles.completionCard}>
              <View style={styles.completionIcon}>
                <MaterialIcons
                  name={percentage >= 67 ? 'emoji-events' : 'star'}
                  size={64}
                  color="#FFD700"
                />
              </View>

              <Text style={styles.completionTitle}>Challenge Complete!</Text>

              <View style={styles.scoreDisplay}>
                <Text style={styles.finalScore}>{score}</Text>
                <Text style={styles.scoreLabel}>points</Text>
              </View>

              <Text style={styles.accuracyText}>{percentage}% Accuracy</Text>

              {earnedStreak && (
                <View style={styles.streakCard}>
                  <MaterialIcons name="local-fire-department" size={32} color="#F59E0B" />
                  <View style={styles.streakInfo}>
                    <Text style={styles.streakTitle}>Streak Maintained!</Text>
                    <Text style={styles.streakCount}>{currentStreak + 1} days in a row</Text>
                  </View>
                </View>
              )}

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <MaterialIcons name="timer" size={24} color="#8B5CF6" />
                  <Text style={styles.statValue}>{formatTime(120 - timeLeft)}</Text>
                  <Text style={styles.statLabel}>Time Used</Text>
                </View>

                <View style={styles.statItem}>
                  <MaterialIcons name="check-circle" size={24} color="#10B981" />
                  <Text style={styles.statValue}>{score / 100}/{todayChallenge.length}</Text>
                  <Text style={styles.statLabel}>Correct</Text>
                </View>

                <View style={styles.statItem}>
                  <MaterialIcons name="local-fire-department" size={24} color="#F59E0B" />
                  <Text style={styles.statValue}>{longestStreak}</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.completedActions}>
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.primaryActionText}>Continue Learning</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#8B5CF6" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={handleRetry}
              >
                <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.secondaryActionText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!hasStarted) {
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
            <Text style={styles.headerTitle}>Daily Challenge</Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Challenge Banner */}
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.challengeBanner}
          >
            <MaterialIcons name="emoji-events" size={64} color="#FFD700" />
            <Text style={styles.bannerTitle}>Today's Challenge</Text>
            <Text style={styles.bannerSubtitle}>
              Test your civic knowledge daily!
            </Text>
          </LinearGradient>

          {/* Streak Info */}
          <View style={styles.streakSection}>
            <View style={styles.streakMainCard}>
              <MaterialIcons name="local-fire-department" size={48} color="#F59E0B" />
              <View style={styles.streakTextContainer}>
                <Text style={styles.streakMainNumber}>{currentStreak}</Text>
                <Text style={styles.streakMainLabel}>Day Streak</Text>
              </View>
            </View>

            <View style={styles.streakStats}>
              <View style={styles.streakStatItem}>
                <Text style={styles.streakStatValue}>{longestStreak}</Text>
                <Text style={styles.streakStatLabel}>Longest Streak</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakStatItem}>
                <Text style={styles.streakStatValue}>{maxXP}</Text>
                <Text style={styles.streakStatLabel}>Max XP</Text>
              </View>
            </View>
          </View>

          {/* Challenge Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Challenge Details</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialIcons name="quiz" size={24} color="#8B5CF6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Questions</Text>
                  <Text style={styles.infoValue}>{todayChallenge.length} civic knowledge questions</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <MaterialIcons name="timer" size={24} color="#8B5CF6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Time Limit</Text>
                  <Text style={styles.infoValue}>2 minutes</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <MaterialIcons name="stars" size={24} color="#8B5CF6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Rewards</Text>
                  <Text style={styles.infoValue}>100 XP per correct answer</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <MaterialIcons name="local-fire-department" size={24} color="#8B5CF6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Streak Bonus</Text>
                  <Text style={styles.infoValue}>Maintain your streak with 67%+ accuracy</Text>
                </View>
              </View>
            </View>
          </View>

        </ScrollView>

        {/* Start Button */}
        <View style={styles.startButtonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartChallenge}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.startButtonGradient}
            >
              <MaterialIcons name="play-arrow" size={28} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Challenge</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Challenge in progress
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
          <Text style={styles.headerTitle}>Daily Challenge</Text>
          <Text style={styles.headerSubtitle}>
            Question {currentQuestion + 1} of {todayChallenge.length}
          </Text>
        </View>
        <View style={styles.timerContainer}>
          <MaterialIcons name="timer" size={20} color="#F59E0B" />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { width: `${((currentQuestion + 1) / todayChallenge.length) * 100}%` }
          ]} />
        </View>
        <Text style={styles.scoreText}>{score} pts</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}>
          {/* Question */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.questionBadge}
              >
                <Text style={styles.questionNumber}>{currentQuestion + 1}</Text>
              </LinearGradient>
            </View>
            <Text style={styles.questionText}>
              {todayChallenge[currentQuestion].question}
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {todayChallenge[currentQuestion].options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === todayChallenge[currentQuestion].correctAnswer;
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
                  onPress={() => handleAnswerSelect(index)}
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
            <View style={[
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
                  {isCorrect ? 'Correct! +100 XP' : 'Not Quite'}
                </Text>
              </View>
              <Text style={[
                styles.explanationText,
                { color: isCorrect ? '#047857' : '#DC2626' }
              ]}>
                {todayChallenge[currentQuestion].explanation}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            selectedAnswer === null && !showExplanation && styles.actionButtonDisabled,
          ]}
          onPress={showExplanation ? handleNext : handleCheckAnswer}
          disabled={selectedAnswer === null && !showExplanation}
        >
          <LinearGradient
            colors={selectedAnswer !== null || showExplanation ? ['#8B5CF6', '#7C3AED'] : ['#E5E7EB', '#E5E7EB']}
            style={styles.actionButtonGradient}
          >
            <Text style={[
              styles.actionButtonText,
              selectedAnswer === null && !showExplanation && styles.actionButtonTextDisabled
            ]}>
              {showExplanation
                ? (currentQuestion === todayChallenge.length - 1 ? 'Finish Challenge' : 'Next Question')
                : 'Check Answer'}
            </Text>
            <MaterialIcons
              name={showExplanation ? 'arrow-forward' : 'check'}
              size={24}
              color={selectedAnswer !== null || showExplanation ? '#FFFFFF' : '#9CA3AF'}
            />
          </LinearGradient>
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
    backgroundColor: '#8B5CF6',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6',
    minWidth: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  challengeBanner: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  streakSection: {
    marginBottom: 24,
  },
  streakMainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
  },
  streakTextContainer: {
    marginLeft: 16,
  },
  streakMainNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#92400E',
  },
  streakMainLabel: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  streakStats: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  streakStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  streakStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  streakDivider: {
    width: 1,
    backgroundColor: '#e9ecef',
    marginHorizontal: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 16,
  },
  startButtonContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    marginTop: 16,
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
    marginBottom: 20,
  },
  questionBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  correctOption: {
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
  },
  wrongOption: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
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
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  correctIndicator: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  wrongIndicator: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
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
  actionContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionButtonTextDisabled: {
    color: '#9CA3AF',
  },
  completedContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  completionCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  completionIcon: {
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 12,
  },
  finalScore: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
  },
  accuracyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    width: '100%',
  },
  streakInfo: {
    marginLeft: 12,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },
  streakCount: {
    fontSize: 14,
    color: '#92400E',
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  leaderboardSection: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  leaderboardContainer: {
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    color: '#666',
  },
  scoreInfo: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 12,
    color: '#666',
  },
  completedActions: {
    gap: 12,
    marginBottom: 24,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  secondaryActionButton: {
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
  secondaryActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  noDataText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  noDataSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});
