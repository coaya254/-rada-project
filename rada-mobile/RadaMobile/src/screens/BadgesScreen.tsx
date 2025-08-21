import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';

const BadgesScreen = ({ navigation }) => {
  const userStats = {
    total_xp: 125,
    completed_modules: 1,
    passed_quizzes: 3,
    completed_challenges: 2,
    learning_streak: 5,
    earned_badges: 2
  };

  const sampleBadges = [
    {
      id: 1,
      title: 'Constitution Scholar',
      description: 'Complete constitution basics module',
      icon: '📚',
      xp_reward: 50,
      earned: true
    },
    {
      id: 2,
      title: 'Rights Advocate',
      description: 'Master civic rights and responsibilities',
      icon: '⚖️',
      xp_reward: 75,
      earned: false
    },
    {
      id: 3,
      title: 'Electoral Expert',
      description: 'Complete electoral process module',
      icon: '🗳️',
      xp_reward: 60,
      earned: false
    },
    {
      id: 4,
      title: 'Devolution Master',
      description: 'Understand county government system',
      icon: '🏢',
      xp_reward: 80,
      earned: false
    }
  ];

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
      title: "Challenge Master", 
      desc: "Complete 3 challenges", 
      icon: "⚡", 
      earned: userStats.completed_challenges >= 3,
      progress: Math.min(userStats.completed_challenges * 33.33, 100),
      target: 3
    },
    { 
      id: 5, 
      title: "Streak Warrior", 
      desc: "Maintain 7-day learning streak", 
      icon: "🔥", 
      earned: userStats.learning_streak >= 7,
      progress: Math.min(userStats.learning_streak * 14.28, 100),
      target: 7
    },
    { 
      id: 6, 
      title: "Quiz Champion", 
      desc: "Pass 5 quizzes", 
      icon: "🧠", 
      earned: userStats.passed_quizzes >= 5,
      progress: Math.min(userStats.passed_quizzes * 20, 100),
      target: 5
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
        <Text style={styles.headerTitle}>Badges & Achievements</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Progress Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Accomplishments</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{sampleBadges.filter(b => b.earned).length}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{achievements.filter(a => a.earned).length}</Text>
              <Text style={styles.statLabel}>Achievements Unlocked</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Math.round(((sampleBadges.filter(b => b.earned).length + achievements.filter(a => a.earned).length) / (sampleBadges.length + achievements.length)) * 100)}%</Text>
              <Text style={styles.statLabel}>Overall Progress</Text>
            </View>
          </View>
        </View>

        {/* Badges Section */}
        <Text style={styles.sectionTitle}>🏆 Badges</Text>
        <Text style={styles.sectionSubtitle}>Earn badges by completing milestones</Text>
        
        {/* Badge Showcase */}
        <View style={styles.badgeShowcase}>
          <Text style={styles.badgeShowcaseTitle}>🌟 Your Top Badges</Text>
          <View style={styles.topBadgesRow}>
            {sampleBadges.filter(b => b.earned).slice(0, 3).map((badge) => (
              <View key={badge.id} style={styles.topBadgeItem}>
                <Text style={styles.topBadgeIcon}>{badge.icon}</Text>
                <Text style={styles.topBadgeName}>{badge.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badge Categories */}
        <Text style={styles.badgeCategoryTitle}>📚 Foundation Badges</Text>
        <View style={styles.badgesGrid}>
          {sampleBadges.map((badge) => (
            <TouchableOpacity key={badge.id} style={styles.badgeCard}>
              <View style={styles.badgeIcon}>
                <Text style={styles.badgeIconText}>{badge.icon}</Text>
              </View>
              <Text style={styles.badgeTitle}>{badge.title}</Text>
              <Text style={styles.badgeDescription}>{badge.description}</Text>
              <Text style={styles.badgeXp}>+{badge.xp_reward} XP</Text>
              <Text style={[styles.badgeStatus, { color: badge.earned ? '#4CAF50' : '#FF9800' }]}>
                {badge.earned ? 'Earned ✓' : 'Locked 🔒'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Achievements Section */}
        <Text style={styles.sectionTitle}>⭐ Achievements</Text>
        <Text style={styles.sectionSubtitle}>Track your progress and unlock achievements</Text>
        
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

        {/* Community Badges */}
        <Text style={styles.badgeCategoryTitle}>🤝 Community Badges</Text>
        <View style={styles.communityBadgesGrid}>
          <TouchableOpacity style={styles.communityBadgeCard}>
            <Text style={styles.communityBadgeIcon}>🔥</Text>
            <Text style={styles.communityBadgeTitle}>Streak Warrior</Text>
            <Text style={styles.communityBadgeDesc}>Maintain 30-day engagement</Text>
            <Text style={styles.communityBadgeProgress}>15/30 days</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.communityBadgeCard}>
            <Text style={styles.communityBadgeIcon}>🌍</Text>
            <Text style={styles.communityBadgeTitle}>Unity Builder</Text>
            <Text style={styles.communityBadgeDesc}>Cross-county collaboration</Text>
            <Text style={styles.communityBadgeProgress}>2/3 counties</Text>
          </TouchableOpacity>
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
    color: '#4ECDC4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    marginTop: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  badgeShowcase: {
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
  badgeShowcaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  topBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  topBadgeItem: {
    alignItems: 'center',
  },
  topBadgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  topBadgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  badgeCategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
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
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIconText: {
    fontSize: 30,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeXp: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeStatus: {
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: '#4ECDC4',
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
  communityBadgesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  communityBadgeCard: {
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
  communityBadgeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  communityBadgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  communityBadgeDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  communityBadgeProgress: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
});

export default BadgesScreen;
