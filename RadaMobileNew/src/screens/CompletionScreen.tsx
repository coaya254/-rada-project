import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { CompletionProps } from '../types/LearningTypes';

export const CompletionScreen: React.FC<CompletionProps> = ({ route, navigation }) => {
  const { courseTitle, xpEarned, totalXP, lessonsCompleted } = route.params;

  const achievements = [
    { id: 1, title: 'First Lesson Complete', icon: 'star', earned: true },
    { id: 2, title: 'Quiz Master', icon: 'trophy', earned: xpEarned > 0 },
    { id: 3, title: 'Knowledge Seeker', icon: 'book', earned: lessonsCompleted > 0 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.successGradient}
          >
            <View style={styles.successIcon}>
              <Icon name="check-circle" size={80} color="white" />
            </View>
            <Text style={styles.successTitle}>Congratulations!</Text>
            <Text style={styles.successSubtitle}>
              You've completed {courseTitle}
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{xpEarned}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{lessonsCompleted}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalXP}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements Unlocked</Text>
          <View style={styles.achievementsList}>
            {achievements.map((achievement) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementItem,
                  !achievement.earned && styles.achievementItemLocked
                ]}
              >
                <View style={[
                  styles.achievementIcon,
                  !achievement.earned && styles.achievementIconLocked
                ]}>
                  <Icon 
                    name={achievement.earned ? achievement.icon : 'lock'} 
                    size={24} 
                    color={achievement.earned ? '#10b981' : '#64748b'} 
                  />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={[
                    styles.achievementTitle,
                    !achievement.earned && styles.achievementTitleLocked
                  ]}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementStatus}>
                    {achievement.earned ? 'Unlocked' : 'Locked'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => navigation.navigate('LearnHome')}
          >
            <Icon name="home" size={20} color="white" />
            <Text style={styles.continueButtonText}>Back to Learning</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => {
              // Handle share functionality
            }}
          >
            <Icon name="share" size={20} color="#4a6cfa" />
            <Text style={styles.shareButtonText}>Share Achievement</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.nextStepsSection}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          <View style={styles.nextStepsList}>
            <TouchableOpacity 
              style={styles.nextStepItem}
              onPress={() => navigation.navigate('LearnHome')}
            >
              <View style={styles.nextStepIcon}>
                <Icon name="book" size={20} color="#4a6cfa" />
              </View>
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepTitle}>Explore More Courses</Text>
                <Text style={styles.nextStepDesc}>Continue your learning journey</Text>
              </View>
              <Icon name="arrow-right" size={16} color="#64748b" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.nextStepItem}
              onPress={() => navigation.navigate('ChallengesScreen')}
            >
              <View style={styles.nextStepIcon}>
                <Icon name="trophy" size={20} color="#f59e0b" />
              </View>
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepTitle}>Take on Challenges</Text>
                <Text style={styles.nextStepDesc}>Test your knowledge further</Text>
              </View>
              <Icon name="arrow-right" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  successGradient: {
    padding: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementItemLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementIconLocked: {
    backgroundColor: '#64748b20',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: '#64748b',
  },
  achievementStatus: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#4a6cfa',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  shareButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4a6cfa',
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a6cfa',
  },
  nextStepsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextStepsList: {
    gap: 12,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nextStepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  nextStepDesc: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default CompletionScreen;
