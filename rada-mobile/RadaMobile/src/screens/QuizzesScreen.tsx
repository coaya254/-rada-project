import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';

const QuizzesScreen = ({ navigation }) => {
  const sampleQuizzes = [
    {
      id: 1,
      title: 'Constitution Quiz',
      description: 'Test your knowledge of the Kenyan Constitution',
      question_count: 10,
      time_limit: 300,
      xp_reward: 25,
      difficulty: 'Beginner',
      completed: false,
      best_score: 0,
      attempts: 0
    },
    {
      id: 2,
      title: 'Civic Rights Quiz',
      description: 'Challenge yourself on civic rights and responsibilities',
      question_count: 15,
      time_limit: 450,
      xp_reward: 35,
      difficulty: 'Intermediate',
      completed: true,
      best_score: 85,
      attempts: 2
    },
    {
      id: 3,
      title: 'Electoral Process Quiz',
      description: 'Master the electoral process and voting procedures',
      question_count: 12,
      time_limit: 360,
      xp_reward: 30,
      difficulty: 'Intermediate',
      completed: false,
      best_score: 0,
      attempts: 0
    },
    {
      id: 4,
      title: 'Devolution Quiz',
      description: 'Test your understanding of Kenya\'s devolved system',
      question_count: 8,
      time_limit: 240,
      xp_reward: 20,
      difficulty: 'Beginner',
      completed: false,
      best_score: 0,
      attempts: 0
    },
    {
      id: 5,
      title: 'Anti-Corruption Quiz',
      description: 'Learn about transparency and ethical governance',
      question_count: 18,
      time_limit: 540,
      xp_reward: 40,
      difficulty: 'Advanced',
      completed: false,
      best_score: 0,
      attempts: 0
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quizzes</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>🧠 Quick Quizzes</Text>
        <Text style={styles.sectionSubtitle}>Test your civic knowledge and earn XP</Text>
        
        {sampleQuizzes.map((quiz) => (
          <TouchableOpacity key={quiz.id} style={styles.quizCard}>
            <View style={styles.quizHeader}>
              <View style={styles.quizInfo}>
                <Text style={styles.quizTitle}>{quiz.title}</Text>
                <Text style={styles.quizDescription}>{quiz.description}</Text>
                <View style={styles.quizMeta}>
                  <View style={styles.quizMetaItem}>
                    <Text style={styles.quizMetaIcon}>❓</Text>
                    <Text style={styles.quizMetaText}>{quiz.question_count} questions</Text>
                  </View>
                  <View style={styles.quizMetaItem}>
                    <Text style={styles.quizMetaIcon}>⏱️</Text>
                    <Text style={styles.quizMetaText}>{quiz.time_limit}s</Text>
                  </View>
                  <View style={styles.quizMetaItem}>
                    <Text style={styles.quizMetaIcon}>⭐</Text>
                    <Text style={styles.quizMetaText}>+{quiz.xp_reward} XP</Text>
                  </View>
                  <View style={styles.quizMetaItem}>
                    <Text style={styles.quizMetaIcon}>📊</Text>
                    <Text style={styles.quizMetaText}>{quiz.difficulty}</Text>
                  </View>
                </View>
              </View>
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: quiz.difficulty === 'Beginner' ? '#4CAF50' : quiz.difficulty === 'Intermediate' ? '#FF9800' : '#F44336' }
              ]}>
                <Text style={styles.difficultyText}>{quiz.difficulty}</Text>
              </View>
            </View>
            
            {/* Quiz Progress */}
            {quiz.attempts > 0 && (
              <View style={styles.quizProgressContainer}>
                <View style={styles.quizProgressHeader}>
                  <Text style={styles.quizProgressLabel}>
                    Best Score: {quiz.best_score}%
                  </Text>
                  <Text style={styles.quizProgressAttempts}>
                    {quiz.attempts} attempt{quiz.attempts > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={[
              styles.quizButton,
              quiz.completed && styles.completedQuizButton
            ]}>
              <Text style={[
                styles.quizButtonText,
                quiz.completed && styles.completedQuizButtonText
              ]}>
                {quiz.completed ? 'Completed ✓' : 'Start Quiz'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4ECDC4',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  quizCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quizHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  quizDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quizMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quizMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  quizMetaIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  quizMetaText: {
    fontSize: 12,
    color: '#666',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  quizProgressContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  quizProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizProgressLabel: {
    fontSize: 12,
    color: '#666',
  },
  quizProgressAttempts: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  quizButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  quizButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  completedQuizButton: {
    backgroundColor: '#4CAF50',
  },
  completedQuizButtonText: {
    color: 'white',
  },
});

export default QuizzesScreen;
