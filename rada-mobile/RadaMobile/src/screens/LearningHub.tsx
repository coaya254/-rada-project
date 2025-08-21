
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LearningHub = ({ navigation }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const features = [
    { 
      key: 'modules', 
      label: 'Learning Modules', 
      icon: '📚', 
      screen: 'ModulesScreen', 
      description: 'Explore learning modules and track your progress', 
      color: '#FF6B6B',
      size: 'medium'
    },
    { 
      key: 'quiz', 
      label: 'Quizzes', 
      icon: '🧠', 
      screen: 'QuizzesScreen', 
      description: 'Test your knowledge', 
      color: '#4ECDC4',
      size: 'medium'
    },
    { 
      key: 'challenges', 
      label: 'Challenges', 
      icon: '🎯', 
      screen: 'ChallengesScreen', 
      description: 'Take on themed challenges', 
      color: '#FFD93D',
      size: 'medium'
    },
    { 
      key: 'badges', 
      label: 'Badges & Achievements', 
      icon: '🏆', 
      screen: 'BadgesScreen', 
      description: 'Earn badges and unlock achievements', 
      color: '#4ECDC4',
      size: 'medium'
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleFeaturePress = (feature) => {
    navigation.navigate(feature.screen);
  };

  const renderBentoCard = (feature) => {
    return (
      <TouchableOpacity
        key={feature.key}
        style={styles.bentoCard}
        onPress={() => handleFeaturePress(feature)}
      >
        <LinearGradient
          colors={[feature.color, feature.color + '80']}
          style={styles.bentoContent}
        >
          <Text style={styles.bentoIcon}>{feature.icon}</Text>
          <Text style={styles.bentoTitle}>{feature.label}</Text>
          <Text style={styles.bentoDescription}>{feature.description}</Text>
          <View style={styles.bentoArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Hub</Text>
        <Text style={styles.headerSubtitle}>Empower yourself with knowledge</Text>
      </View>

      {/* Welcome Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Learning Hub! 📚</Text>
          <Text style={styles.welcomeSubtitle}>
            Discover featured content and challenges
          </Text>
          
          {/* Bento Navigation Grid */}
          <View style={styles.bentoGrid}>
            {features.map(renderBentoCard)}
          </View>

          {/* Featured Content */}
          <View style={styles.featuredSection}>
            <Text style={styles.featuredTitle}>🌟 Featured This Week</Text>
            <TouchableOpacity style={styles.featuredCard}>
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4']}
                style={styles.featuredGradient}
              >
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredIcon}>🏛️</Text>
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredModuleTitle}>Kenyan Constitution Basics</Text>
                    <Text style={styles.featuredDescription}>
                      Master the fundamentals of Kenya's government structure
                    </Text>
                    <View style={styles.featuredMeta}>
                      <Text style={styles.featuredMetaText}>⭐ 50 XP • 30 min • Beginner</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Weekly Challenge */}
          <View style={styles.weeklyChallengeSection}>
            <Text style={styles.weeklyChallengeTitle}>🔥 Weekly Challenge</Text>
            <TouchableOpacity style={styles.weeklyChallengeCard}>
              <LinearGradient
                colors={['#ff6b6b', '#ee5a24']}
                style={styles.weeklyChallengeGradient}
              >
                <View style={styles.weeklyChallengeContent}>
                  <Text style={styles.weeklyChallengeIcon}>🎓</Text>
                  <View style={styles.weeklyChallengeInfo}>
                    <Text style={styles.weeklyChallengeTitleText}>Learning Week Challenge</Text>
                    <Text style={styles.weeklyChallengeDescription}>
                      Complete 5 civic education modules this week
                    </Text>
                    <View style={styles.weeklyChallengeMeta}>
                      <Text style={styles.weeklyChallengeMetaText}>⭐ 180 XP • 7 days • 45 participants</Text>
                    </View>
                  </View>
                  <View style={styles.weeklyChallengeBadge}>
                    <Text style={styles.weeklyChallengeBadgeText}>WEEKLY</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* This Week's Themed Challenges */}
          <View style={styles.themedChallengesSection}>
            <Text style={styles.themedChallengesTitle}>🎯 This Week's Themed Challenges</Text>
            
            <TouchableOpacity style={[styles.themedChallengeCard, styles.themedChallengeCard1]}>
              <View style={styles.themedChallengeHeader}>
                <View style={styles.themedChallengeIcon}>
                  <Text style={styles.themedChallengeIconText}>🕯️</Text>
                </View>
                <View style={styles.themedChallengeInfo}>
                  <Text style={styles.themedChallengeTitle}>Memorial Monday</Text>
                  <Text style={styles.themedChallengeDescription}>Light candles for 10 civic memory entries</Text>
                  <View style={styles.themedChallengeMeta}>
                    <Text style={styles.themedChallengeMetaText}>⭐ 50 XP • 1 week • 120 participants</Text>
                  </View>
                </View>
              </View>
              <View style={styles.themedChallengeFooter}>
                <Text style={styles.themedChallengeDeadline}>Deadline: 2024-01-22</Text>
                <TouchableOpacity style={styles.themedChallengeButton}>
                  <Text style={styles.themedChallengeButtonText}>Join Challenge</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.themedChallengeCard, styles.themedChallengeCard2]}>
              <View style={styles.themedChallengeHeader}>
                <View style={styles.themedChallengeIcon}>
                  <Text style={styles.themedChallengeIconText}>🔍</Text>
                </View>
                <View style={styles.themedChallengeInfo}>
                  <Text style={styles.themedChallengeTitle}>Accountability Week</Text>
                  <Text style={styles.themedChallengeDescription}>Submit evidence for 3 budget promises</Text>
                  <View style={styles.themedChallengeMeta}>
                    <Text style={styles.themedChallengeMetaText}>⭐ 150 XP • 7 days • 85 participants</Text>
                  </View>
                </View>
              </View>
              <View style={styles.themedChallengeFooter}>
                <Text style={styles.themedChallengeDeadline}>Deadline: 2024-01-29</Text>
                <TouchableOpacity style={styles.themedChallengeButton}>
                  <Text style={styles.themedChallengeButtonText}>Join Challenge</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#FF6B6B',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  featuredSection: {
    width: '100%',
    marginBottom: 20,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'left',
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  featuredGradient: {
    borderRadius: 16,
    padding: 20,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredIcon: {
    fontSize: 48,
    marginRight: 15,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredModuleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
    lineHeight: 20,
  },
  featuredMeta: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  featuredMetaText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  weeklyChallengeSection: {
    width: '100%',
    marginBottom: 20,
  },
  weeklyChallengeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'left',
  },
  weeklyChallengeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  weeklyChallengeGradient: {
    borderRadius: 16,
    padding: 20,
  },
  weeklyChallengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyChallengeIcon: {
    fontSize: 48,
    marginRight: 15,
  },
  weeklyChallengeInfo: {
    flex: 1,
  },
  weeklyChallengeTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
  },
  weeklyChallengeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
    lineHeight: 20,
  },
  weeklyChallengeMeta: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  weeklyChallengeMetaText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  weeklyChallengeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  weeklyChallengeBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  themedChallengesSection: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  themedChallengesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  themedChallengeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  themedChallengeCard1: {
    backgroundColor: '#f8f9fa',
  },
  themedChallengeCard2: {
    backgroundColor: '#f8f9fa',
  },
  themedChallengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  themedChallengeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  themedChallengeIconText: {
    fontSize: 24,
  },
  themedChallengeInfo: {
    flex: 1,
  },
  themedChallengeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  themedChallengeDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  themedChallengeMeta: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  themedChallengeMetaText: {
    fontSize: 11,
    color: '#555',
    fontWeight: '600',
  },
  themedChallengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  themedChallengeDeadline: {
    fontSize: 12,
    color: '#666',
  },
  themedChallengeButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  themedChallengeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bentoCard: {
    width: '48%', // Two cards per row
    aspectRatio: 1.2, // Adjust as needed for height
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  bentoContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  bentoIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  bentoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  bentoDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 10,
  },
  bentoArrow: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  arrowText: {
    fontSize: 24,
    color: 'white',
  },
});

export default LearningHub;


