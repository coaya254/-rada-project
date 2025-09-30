import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';

const ChallengesScreen = ({ navigation }) => {
  const sampleChallenges = [
    {
      id: 1,
      title: 'Constitution Master',
      description: 'Complete all constitution-related modules',
      icon: '🏛️',
      duration: '2 weeks',
      difficulty: 'Advanced',
      xp_reward: 100,
      is_weekly: false
    },
    {
      id: 2,
      title: 'Civic Champion',
      description: 'Earn 5 badges in civic education',
      icon: '👑',
      duration: '1 month',
      difficulty: 'Expert',
      xp_reward: 200,
      is_weekly: false
    },
    {
      id: 3,
      title: 'Learning Week Challenge',
      description: 'Complete 5 civic education modules this week',
      icon: '🎓',
      duration: '7 days',
      difficulty: 'Intermediate',
      xp_reward: 180,
      is_weekly: true,
      participants: 45,
      deadline: '2024-01-15'
    }
  ];

  const themedChallenges = [
    {
      id: 4,
      title: '🕯️ Memorial Monday',
      description: 'Light candles for 10 civic memory entries',
      icon: '🕯️',
      duration: '1 week',
      difficulty: 'Beginner',
      xp_reward: 50,
      is_weekly: true,
      is_themed: true,
      theme: 'memorial',
      participants: 120,
      deadline: '2024-01-22',
      badge_reward: 'Memorial Champion'
    },
    {
      id: 5,
      title: '🔍 Accountability Week',
      description: 'Submit evidence for 3 budget promises',
      icon: '🔍',
      duration: '7 days',
      difficulty: 'Intermediate',
      xp_reward: 150,
      is_weekly: true,
      is_themed: true,
      theme: 'accountability',
      participants: 85,
      deadline: '2024-01-29',
      badge_reward: 'Budget Watchdog'
    }
  ];

  const monthlyQuests = [
    {
      id: 9,
      title: '🏛️ Civic Investigation',
      description: 'Research and document one local government issue',
      icon: '🏛️',
      duration: '30 days',
      difficulty: 'Expert',
      xp_reward: 500,
      is_weekly: false,
      is_monthly: true,
      participants: 25,
      deadline: '2024-02-28',
      badge_reward: 'Investigative Reporter',
      support: 'Research guidance and mentorship available'
    },
    {
      id: 10,
      title: '🎓 Civic Education Marathon',
      description: 'Complete 10 learning modules with 90%+ scores',
      icon: '🎓',
      duration: '30 days',
      difficulty: 'Advanced',
      xp_reward: 300,
      is_weekly: false,
      is_monthly: true,
      participants: 35,
      deadline: '2024-02-28',
      badge_reward: 'Education Champion',
      support: 'Group learning cohorts available'
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
        <Text style={styles.headerTitle}>Challenges</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>🎯 Challenges</Text>
        
        {/* Themed Weekly Challenges */}
        <Text style={styles.challengeSubtitle}>🔥 This Week's Themed Challenges</Text>
        {themedChallenges.map((challenge) => (
          <TouchableOpacity key={challenge.id} style={[styles.challengeCard, styles.themedChallengeCard]}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeIcon}>
                <Text style={styles.challengeIconText}>{challenge.icon}</Text>
              </View>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={styles.challengeDescription}>{challenge.description}</Text>
                <View style={styles.challengeMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⏱️</Text>
                    <Text style={styles.metaText}>{challenge.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>👥</Text>
                    <Text style={styles.metaText}>{challenge.participants} participants</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>🏆</Text>
                    <Text style={styles.metaText}>{challenge.badge_reward}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.challengeFooter}>
              <Text style={styles.challengeDeadline}>Deadline: {challenge.deadline}</Text>
              <TouchableOpacity style={[styles.challengeButton, styles.themedChallengeButton]}>
                <Text style={styles.challengeButtonText}>Join Challenge</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Monthly Quests */}
        <Text style={styles.challengeSubtitle}>🌟 Monthly Quests</Text>
        {monthlyQuests.map((quest) => (
          <TouchableOpacity key={quest.id} style={[styles.challengeCard, styles.monthlyQuestCard]}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeIcon}>
                <Text style={styles.challengeIconText}>{quest.icon}</Text>
              </View>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>{quest.title}</Text>
                <Text style={styles.challengeDescription}>{quest.description}</Text>
                <View style={styles.challengeMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⏱️</Text>
                    <Text style={styles.metaText}>{quest.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>👥</Text>
                    <Text style={styles.metaText}>{quest.participants} participants</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⭐</Text>
                    <Text style={styles.metaText}>+{quest.xp_reward} XP</Text>
                  </View>
                </View>
                {quest.support && (
                  <Text style={styles.questSupport}>{quest.support}</Text>
                )}
              </View>
            </View>
            <View style={styles.challengeFooter}>
              <Text style={styles.challengeDeadline}>Deadline: {quest.deadline}</Text>
              <TouchableOpacity style={[styles.challengeButton, styles.monthlyQuestButton]}>
                <Text style={styles.challengeButtonText}>Join Quest</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Regular Challenges */}
        <Text style={styles.challengeSubtitle}>📚 Regular Challenges</Text>
        {sampleChallenges.map((challenge) => (
          <TouchableOpacity key={challenge.id} style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeIcon}>
                <Text style={styles.challengeIconText}>{challenge.icon}</Text>
              </View>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={styles.challengeDescription}>{challenge.description}</Text>
                <View style={styles.challengeMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⏱️</Text>
                    <Text style={styles.metaText}>{challenge.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📊</Text>
                    <Text style={styles.metaText}>{challenge.difficulty}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⭐</Text>
                    <Text style={styles.metaText}>+{challenge.xp_reward} XP</Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.challengeButton}>
              <Text style={styles.challengeButtonText}>Join Challenge</Text>
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
    backgroundColor: '#FFD93D',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#333',
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
    marginBottom: 20,
  },
  challengeSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 20,
  },
  challengeCard: {
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
  themedChallengeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
  },
  monthlyQuestCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
    backgroundColor: '#f0fffd',
  },
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  challengeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  challengeIconText: {
    fontSize: 24,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  challengeMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  metaIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  challengeDeadline: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  challengeButton: {
    backgroundColor: '#FFD93D',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  challengeButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  themedChallengeButton: {
    backgroundColor: '#FF6B6B',
  },
  monthlyQuestButton: {
    backgroundColor: '#4ECDC4',
  },
  questSupport: {
    fontSize: 12,
    color: '#4ECDC4',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default ChallengesScreen;
