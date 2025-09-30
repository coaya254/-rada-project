import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAnonMode } from '../contexts/AnonModeContext';
import apiService from '../services/api';

// Design System Components
import {
  Card,
  ProgressBar,
  XPIndicator,
  Breadcrumbs,
  colors,
  spacing,
  typography,
  calculateCurrentLevelProgress,
  formatXP,
} from '../components/designSystem';

const { width: screenWidth } = Dimensions.get('window');

interface Module {
  id: number;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  estimated_duration: number;
  difficulty: string;
  is_featured: boolean;
  progress?: number;
  category: string;
}

interface DashboardSection {
  title: string;
  type: 'continue' | 'recommended' | 'featured' | 'categories' | 'progress';
  data: any[];
}

interface UnifiedLearningDashboardProps {
  navigation: any;
}

const UnifiedLearningDashboard: React.FC<UnifiedLearningDashboardProps> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [sections, setSections] = useState<DashboardSection[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: '📚', color: colors.primary[500] },
    { id: 'constitution', label: 'Constitution', icon: '🏛️', color: colors.success[500] },
    { id: 'human-rights', label: 'Rights', icon: '⚖️', color: colors.warning[500] },
    { id: 'civic-participation', label: 'Civic', icon: '🗳️', color: colors.error[500] },
    { id: 'government', label: 'Government', icon: '🏢', color: colors.primary[600] },
  ];

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      const [modulesResponse, userStatsResponse, challengesResponse] = await Promise.all([
        apiService.getModules(),
        user ? apiService.getUserStats(user.uuid) : Promise.resolve(null),
        apiService.getChallenges(),
      ]);

      // Process modules
      let modules = [];
      if (Array.isArray(modulesResponse)) {
        modules = modulesResponse;
      } else if (modulesResponse?.data) {
        modules = modulesResponse.data;
      }

      // Process user stats
      let stats = userStatsResponse?.data || {
        total_xp: 125,
        completed_modules: 1,
        passed_quizzes: 3,
        completed_challenges: 2,
        learning_streak: 3,
      };

      setUserStats(stats);

      // Create dashboard sections
      const dashboardSections: DashboardSection[] = [
        {
          title: 'Your Progress',
          type: 'progress',
          data: [stats],
        },
        {
          title: 'Continue Learning',
          type: 'continue',
          data: modules.filter((m: Module) => m.progress && m.progress > 0 && m.progress < 100).slice(0, 3),
        },
        {
          title: 'Featured Modules',
          type: 'featured',
          data: modules.filter((m: Module) => m.is_featured).slice(0, 5),
        },
        {
          title: 'Recommended for You',
          type: 'recommended',
          data: modules.filter((m: Module) =>
            selectedCategory === 'all' || m.category === selectedCategory
          ).slice(0, 6),
        },
      ];

      setSections(dashboardSections);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderProgressSection = (stats: any) => {
    const levelData = calculateCurrentLevelProgress(stats.total_xp || 125);

    return (
      <Card variant="elevated" style={styles.progressCard}>
        <XPIndicator
          currentXP={levelData.currentLevelXP}
          xpToNextLevel={levelData.xpForNextLevel}
          level={levelData.currentLevel}
          size="lg"
        />

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.completed_modules || 0}</Text>
            <Text style={styles.statLabel}>Modules</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.learning_streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.passed_quizzes || 0}</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.completed_challenges || 0}</Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderModuleCard = (module: Module, showProgress = false) => (
    <Card
      key={module.id}
      onPress={() => navigation.navigate('ModuleDetailScreen', { module })}
      style={[styles.moduleCard, showProgress && styles.continueCard]}
      variant="outlined"
    >
      <View style={styles.moduleHeader}>
        <Text style={styles.moduleIcon}>{module.icon}</Text>
        <View style={styles.moduleInfo}>
          <Text style={styles.moduleTitle} numberOfLines={2}>{module.title}</Text>
          <Text style={styles.moduleDescription} numberOfLines={2}>
            {module.description}
          </Text>
          <View style={styles.moduleStats}>
            <View style={styles.moduleStat}>
              <Ionicons name="star" size={12} color={colors.warning[500]} />
              <Text style={styles.moduleStatText}>{formatXP(module.xp_reward)} XP</Text>
            </View>
            <View style={styles.moduleStat}>
              <Ionicons name="time" size={12} color={colors.gray[500]} />
              <Text style={styles.moduleStatText}>{module.estimated_duration}m</Text>
            </View>
            <View style={[styles.difficultyBadge, styles[`difficulty${module.difficulty}`]]}>
              <Text style={styles.difficultyText}>{module.difficulty}</Text>
            </View>
          </View>
        </View>
      </View>

      {showProgress && module.progress && (
        <ProgressBar
          progress={module.progress}
          variant="success"
          size="sm"
          style={styles.moduleProgress}
        />
      )}
    </Card>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item.id && styles.activeCategoryButton,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text style={styles.categoryIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === item.id && styles.activeCategoryLabel,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoryList}
      />
    </View>
  );

  const renderSection = (section: DashboardSection) => {
    if (!section.data.length) return null;

    return (
      <View key={section.title} style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>

        {section.type === 'progress' && renderProgressSection(section.data[0])}

        {section.type === 'continue' && (
          <View style={styles.moduleGrid}>
            {section.data.map(module => renderModuleCard(module, true))}
          </View>
        )}

        {section.type === 'featured' && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={section.data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderModuleCard(item)}
            contentContainerStyle={styles.horizontalList}
          />
        )}

        {section.type === 'recommended' && (
          <View style={styles.moduleGrid}>
            {section.data.map(module => renderModuleCard(module))}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading your learning journey...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Breadcrumbs
        items={[
          { label: 'Learn', isActive: true }
        ]}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          style={styles.header}
        >
          <Text style={styles.welcomeText}>
            Welcome back, {user?.nickname || 'Citizen'}! 🎯
          </Text>
          <Text style={styles.motivationText}>
            Ready to expand your civic knowledge?
          </Text>
        </LinearGradient>

        {/* Category Filter */}
        {renderCategoryFilter()}

        {/* Dashboard Sections */}
        {sections.map(renderSection)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  welcomeText: {
    ...typography.h2,
    color: 'white',
    marginBottom: spacing.xs,
  },
  motivationText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
  },
  categoryContainer: {
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  categoryList: {
    paddingHorizontal: spacing.md,
  },
  categoryButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  activeCategoryButton: {
    backgroundColor: colors.primary[500],
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: spacing.xs / 2,
  },
  categoryLabel: {
    ...typography.caption,
    color: colors.gray[600],
    fontWeight: '500',
  },
  activeCategoryLabel: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.gray[800],
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  progressCard: {
    marginHorizontal: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h3,
    color: colors.primary[600],
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray[600],
    marginTop: spacing.xs / 2,
  },
  moduleGrid: {
    paddingHorizontal: spacing.md,
  },
  moduleCard: {
    marginBottom: spacing.md,
    width: screenWidth * 0.85,
  },
  continueCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success[500],
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  moduleIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    ...typography.h4,
    color: colors.gray[800],
    marginBottom: spacing.xs,
  },
  moduleDescription: {
    ...typography.bodySmall,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  moduleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  moduleStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  moduleStatText: {
    ...typography.caption,
    color: colors.gray[600],
    marginLeft: spacing.xs / 2,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
  },
  difficultybeginner: {
    backgroundColor: colors.success[100],
  },
  difficultyintermediate: {
    backgroundColor: colors.warning[100],
  },
  difficultyadvanced: {
    backgroundColor: colors.error[100],
  },
  difficultyText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.gray[700],
  },
  moduleProgress: {
    marginTop: spacing.md,
  },
  horizontalList: {
    paddingHorizontal: spacing.md,
  },
});

export default UnifiedLearningDashboard;