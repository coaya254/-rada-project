import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

const ModulesScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleModules, setVisibleModules] = useState(3);

  const categories = [
    { id: 'all', label: 'All', icon: '📚' },
    { id: 'constitution', label: 'Constitution', icon: '🏛️' },
    { id: 'human-rights', label: 'Human Rights', icon: '⚖️' },
    { id: 'civic-participation', label: 'Civic Participation', icon: '🗳️' },
    { id: 'devolution', label: 'Devolution', icon: '🏢' },
    { id: 'anti-corruption', label: 'Anti-Corruption', icon: '🛡️' },
  ];

  const userStats = {
    total_xp: 125,
    completed_modules: 1,
    passed_quizzes: 3,
    completed_challenges: 2,
    learning_streak: 5,
    earned_badges: 2
  };

  const sampleModules = [
    {
      id: 1,
      title: 'Kenyan Constitution Basics',
      description: 'Learn about the fundamental principles of Kenya\'s 2010 Constitution',
      image: '🏛️',
      estimated_duration: 30,
      difficulty: 'Beginner',
      xp_reward: 50,
      lesson_count: 5,
      category: 'constitution',
      is_featured: true,
      progress: 0
    },
    {
      id: 2,
      title: 'Civic Rights & Responsibilities',
      description: 'Understand your rights and responsibilities as a Kenyan citizen',
      image: '⚖️',
      estimated_duration: 25,
      difficulty: 'Beginner',
      xp_reward: 40,
      lesson_count: 4,
      category: 'human-rights',
      is_featured: false,
      progress: 25
    },
    {
      id: 3,
      title: 'Electoral Process',
      description: 'Master the electoral process and voting procedures',
      image: '🗳️',
      estimated_duration: 35,
      difficulty: 'Intermediate',
      xp_reward: 60,
      lesson_count: 6,
      category: 'civic-participation',
      is_featured: false,
      progress: 0
    },
    {
      id: 4,
      title: 'Devolution & County Government',
      description: 'Understand Kenya\'s devolved system of government',
      image: '🏢',
      estimated_duration: 40,
      difficulty: 'Intermediate',
      xp_reward: 70,
      lesson_count: 7,
      category: 'devolution',
      is_featured: false,
      progress: 0
    },
    {
      id: 5,
      title: 'Anti-Corruption & Ethics',
      description: 'Learn about transparency, accountability, and ethical governance',
      image: '🛡️',
      estimated_duration: 45,
      difficulty: 'Advanced',
      xp_reward: 80,
      lesson_count: 8,
      category: 'anti-corruption',
      is_featured: false,
      progress: 0
    }
  ];

  const filteredModules = selectedCategory === 'all' 
    ? sampleModules 
    : sampleModules.filter(module => module.category === selectedCategory);

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
        <Text style={styles.headerTitle}>Learning Modules</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Module */}
        {sampleModules.find(m => m.is_featured) && (
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
        )}

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

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>Filter by Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryChipIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextActive
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.sectionTitle}>📚 Learning Modules</Text>
        {filteredModules.slice(0, visibleModules).map((module) => (
          <TouchableOpacity key={module.id} style={styles.moduleCard}>
            <View style={styles.moduleHeader}>
              <View style={styles.moduleImage}>
                <Text style={styles.moduleImageText}>{module.image}</Text>
              </View>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>{module.description}</Text>
                <View style={styles.moduleMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⏱️</Text>
                    <Text style={styles.metaText}>{module.estimated_duration} min</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📊</Text>
                    <Text style={styles.metaText}>{module.difficulty}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⭐</Text>
                    <Text style={styles.metaText}>+{module.xp_reward} XP</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  {module.progress > 0 ? `${module.progress}% completed` : 'Not started'}
                </Text>
                <Text style={styles.progressPercentage}>{module.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${module.progress}%` }
                  ]} 
                />
              </View>
            </View>

            <TouchableOpacity style={styles.moduleButton}>
              <Text style={styles.moduleButtonText}>
                {module.progress === 100 ? 'Completed ✓' : 'Start Learning'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        
        {/* Load More Button */}
        {visibleModules < filteredModules.length && (
          <TouchableOpacity 
            style={styles.loadMoreButton}
            onPress={() => setVisibleModules(prev => Math.min(prev + 3, filteredModules.length))}
          >
            <Text style={styles.loadMoreButtonText}>Load More Modules</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: '#FF6B6B',
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
  progressSummary: {
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
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressCard: {
    width: screenWidth < 400 ? '48%' : '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: screenWidth < 400 ? 12 : 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  progressIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  progressNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  featuredSection: {
    marginBottom: 20,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
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
    padding: 20,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredModuleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    lineHeight: 20,
  },
  featuredMeta: {
    flexDirection: 'row',
  },
  featuredMetaText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  weeklyChallengeSection: {
    marginBottom: 20,
  },
  weeklyChallengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
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
    padding: 20,
  },
  weeklyChallengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyChallengeIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  weeklyChallengeInfo: {
    flex: 1,
  },
  weeklyChallengeTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  weeklyChallengeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    lineHeight: 20,
  },
  weeklyChallengeMeta: {
    flexDirection: 'row',
  },
  weeklyChallengeMetaText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  weeklyChallengeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  weeklyChallengeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryChipActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  categoryChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  moduleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: screenWidth < 400 ? 12 : 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moduleHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  moduleImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleImageText: {
    fontSize: 24,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  moduleMeta: {
    flexDirection: 'row',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 3,
  },
  moduleButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  moduleButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadMoreButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  loadMoreButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ModulesScreen;
