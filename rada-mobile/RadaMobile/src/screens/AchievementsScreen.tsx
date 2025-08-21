import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';

const AchievementsScreen = ({ navigation }) => {
  const userStats = {
    total_xp: 125,
    completed_modules: 1,
    passed_quizzes: 3,
    completed_challenges: 2,
    learning_streak: 5,
    earned_badges: 2
  };

  const achievements = [
    { 
      id: 1, 
      title: "First Steps", 
      desc: "Complete your first module", 
      icon: "🎯", 
      earned: userStats.completed_modules > 0,
      progress: userStats.completed_modules > 0 ? 100 : 0,
      target: 1
    },
    { 
      id: 2, 
      title: "Knowledge Seeker", 
      desc: "Earn 100 XP", 
      icon: "🧠", 
      earned: userStats.total_xp >= 100,
      progress: Math.min(userStats.total_xp, 100),
      target: 100
    },
    { 
      id: 3, 
      title: "Badge Hunter", 
      desc: "Earn your first badge", 
      icon: "🏆", 
      earned: userStats.earned_badges > 0,
      progress: userStats.earned_badges > 0 ? 100 : 0,
      target: 1
    },
    { 
      id: 4, 
      title: "Constitution Scholar", 
      desc: "Complete Constitution module", 
      icon: "🏛️", 
      earned: false,
      progress: 0,
      target: 100
    },
    { 
      id: 5, 
      title: "Challenge Master", 
      desc: "Complete 3 challenges", 
      icon: "⚡", 
      earned: userStats.completed_challenges >= 3,
      progress: Math.min(userStats.completed_challenges * 33.33, 100),
      target: 3
    },
    { 
      id: 6, 
      title: "Streak Warrior", 
      desc: "Maintain 7-day learning streak", 
      icon: "🔥", 
      earned: userStats.learning_streak >= 7,
      progress: Math.min(userStats.learning_streak * 14.28, 100),
      target: 7
    },
    { 
      id: 7, 
      title: "Quiz Champion", 
      desc: "Pass 5 quizzes", 
      icon: "🧠", 
      earned: userStats.passed_quizzes >= 5,
      progress: Math.min(userStats.passed_quizzes * 20, 100),
      target: 5
    },
    { 
      id: 8, 
      title: "XP Master", 
      desc: "Earn 500 XP", 
      icon: "⭐", 
      earned: userStats.total_xp >= 500,
      progress: Math.min(userStats.total_xp, 500),
      target: 500
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
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>⭐ Achievements</Text>
        <Text style={styles.sectionSubtitle}>Track your progress and unlock achievements</Text>
        
        {/* Achievement Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Achievement Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{achievements.filter(a => a.earned).length}</Text>
              <Text style={styles.statLabel}>Unlocked</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{achievements.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Math.round((achievements.filter(a => a.earned).length / achievements.length) * 100)}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>
        </View>

        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <TouchableOpacity key={achievement.id} style={styles.achievementCard}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementIconText}>{achievement.icon}</Text>
              </View>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.desc}</Text>
              
              {/* Progress Bar */}
              <View style={styles.achievementProgressContainer}>
                <View style={styles.achievementProgressBar}>
                  <View 
                    style={[
                      styles.achievementProgressFill, 
                      { width: `${achievement.progress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.achievementProgressText}>
                  {achievement.progress}/{achievement.target}
                </Text>
              </View>
              
              <Text style={[
                styles.achievementStatus, 
                { color: achievement.earned ? '#4CAF50' : '#FF9800' }
              ]}>
                {achievement.earned ? 'Unlocked ✓' : 'In Progress...'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIconText: {
    fontSize: 24,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementProgressContainer: {
    width: '100%',
    marginBottom: 8,
  },
  achievementProgressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  achievementStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AchievementsScreen;
