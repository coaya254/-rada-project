import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    description: string;
    questionCount: number;
    timeLimit?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    isCompleted?: boolean;
    score?: number;
  };
  onPress: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onPress }) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return '#6B7280';
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={quiz.isCompleted ? ['#3B82F6', '#1D4ED8'] : ['#FFFFFF', '#F8FAFC']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons 
              name="help-circle-outline" 
              size={20} 
              color={quiz.isCompleted ? '#FFFFFF' : '#3B82F6'} 
            />
            <Text style={[styles.title, quiz.isCompleted && styles.completedTitle]}>
              {quiz.title}
            </Text>
          </View>
          
          {quiz.difficulty && (
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quiz.difficulty) }]}>
              <Text style={styles.difficultyText}>{quiz.difficulty}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.description, quiz.isCompleted && styles.completedDescription]}>
          {quiz.description}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="list-outline" size={14} color={quiz.isCompleted ? '#E5E7EB' : '#6B7280'} />
            <Text style={[styles.statText, quiz.isCompleted && styles.completedStatText]}>
              {quiz.questionCount} questions
            </Text>
          </View>

          {quiz.timeLimit && (
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color={quiz.isCompleted ? '#E5E7EB' : '#6B7280'} />
              <Text style={[styles.statText, quiz.isCompleted && styles.completedStatText]}>
                {quiz.timeLimit} min
              </Text>
            </View>
          )}

          {quiz.isCompleted && quiz.score !== undefined && (
            <View style={styles.scoreContainer}>
              <Ionicons name="trophy-outline" size={14} color="#FBBF24" />
              <Text style={[styles.scoreText, { color: getScoreColor(quiz.score) }]}>
                {quiz.score}%
              </Text>
            </View>
          )}
        </View>

        {quiz.isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  completedTitle: {
    color: '#FFFFFF',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  completedDescription: {
    color: '#E5E7EB',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  completedStatText: {
    color: '#E5E7EB',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default QuizCard;


