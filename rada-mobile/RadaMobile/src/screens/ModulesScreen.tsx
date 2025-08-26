import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const ModulesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // API Data States
  const [modules, setModules] = useState([]);
  const [featuredModule, setFeaturedModule] = useState(null);
  const [weeklyChallenge, setWeeklyChallenge] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load data from API
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all data in parallel
      const [modulesResponse, challengesResponse, statsResponse] = await Promise.all([
        apiService.getModules(),
        apiService.getChallenges(),
        user ? apiService.getUserLearningStats(user.id) : Promise.resolve(null)
      ]);

      // Extract data from responses
      const modulesData = modulesResponse.data || modulesResponse;
      const challengesData = challengesResponse.data || challengesResponse;
      const statsData = statsResponse?.data || statsResponse;

      setModules(modulesData);

      // Set featured module
      const featured = modulesData.find(m => m.is_featured) || modulesData[0];
      setFeaturedModule(featured);

      // Set weekly challenge
      const weekly = challengesData.find(c => c.category === 'weekly' && c.active) || challengesData[0];
      setWeeklyChallenge(weekly);

      // Set user stats
      if (statsData) {
        setUserStats(statsData);
      }

    } catch (err) {
      console.error('Error loading Modules data:', err);
      setError('Failed to load modules. Please check your connection.');
      
      // Fallback to offline data
      const offlineData = await apiService.handleOfflineMode();
      setModules(offlineData.modules);
      setFeaturedModule(offlineData.modules[0]);
      setWeeklyChallenge(offlineData.challenges[0]);
      setUserStats(offlineData.userStats);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter modules by category
  const filteredModules = selectedCategory === 'all' 
    ? modules 
    : modules.filter(module => module.category === selectedCategory);

  // Get unique categories
  const categories = ['all', ...new Set(modules.map(m => m.category).filter(Boolean))];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Modules...</Text>
      </View>
    );
  }

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
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Featured Module */}
        {featuredModule && (
          <View style={styles.featuredSection}>
            <Text style={styles.featuredTitle}>🌟 Featured This Week</Text>
            <TouchableOpacity style={styles.featuredCard}>
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4']}
                style={styles.featuredGradient}
              >
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredIcon}>{featuredModule.icon || '🏛️'}</Text>
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredModuleTitle}>{featuredModule.title}</Text>
                    <Text style={styles.featuredDescription}>
                      {featuredModule.description}
                    </Text>
                    <View style={styles.featuredMeta}>
                      <Text style={styles.featuredMetaText}>
                        ⭐ {featuredModule.xp_reward} XP • {featuredModule.estimated_duration} min • {featuredModule.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Weekly Challenge */}
        {weeklyChallenge && (
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
                    <Text style={styles.weeklyChallengeTitleText}>{weeklyChallenge.title}</Text>
                    <Text style={styles.weeklyChallengeDescription}>
                      {weeklyChallenge.description}
                    </Text>
                    <View style={styles.weeklyChallengeMeta}>
                      <Text style={styles.weeklyChallengeMetaText}>
                        ⭐ {weeklyChallenge.xp_reward} XP • {weeklyChallenge.duration || '7 days'} • {weeklyChallenge.participants || 0} participants
                      </Text>
                    </View>
                  </View>
                  <View style={styles.weeklyChallengeBadge}>
                    <Text style={styles.weeklyChallengeBadgeText}>WEEKLY</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>Browse by Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}>
                  {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Learning Modules */}
        <View style={styles.modulesSection}>
          <Text style={styles.modulesTitle}>All Learning Modules</Text>
          
          {filteredModules.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No modules found for this category</Text>
            </View>
          ) : (
            filteredModules.map((module) => (
              <TouchableOpacity 
                key={module.id} 
                style={styles.moduleCard}
                onPress={() => navigation.navigate('ModuleDetailScreen', { moduleId: module.id, module: module })}
              >
                <View style={styles.moduleHeader}>
                  <Text style={styles.moduleIcon}>{module.icon || '📚'}</Text>
                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleDescription}>{module.description}</Text>
                    <View style={styles.moduleMeta}>
                      <Text style={styles.moduleMetaText}>
                        ⭐ {module.xp_reward} XP • {module.estimated_duration} min • {module.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.moduleFooter}>
                  <Text style={styles.moduleCategory}>{module.category}</Text>
                  <TouchableOpacity 
                    style={styles.moduleButton}
                    onPress={() => navigation.navigate('ModuleDetailScreen', { moduleId: module.id, module: module })}
                  >
                    <Text style={styles.moduleButtonText}>Start Learning</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
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
    backgroundColor: '#FF6B6B',
    paddingTop: 50, // Adjusted for iOS status bar
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
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
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
  modulesSection: {
    marginTop: 20,
  },
  modulesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 14,
  },
  moduleCard: {
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
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleIcon: {
    fontSize: 36,
    marginRight: 12,
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
  moduleMetaText: {
    fontSize: 12,
    color: '#666',
  },
  moduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  moduleCategory: {
    fontSize: 12,
    color: '#666',
  },
  moduleButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  moduleButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ModulesScreen;
