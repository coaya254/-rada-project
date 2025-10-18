import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';
import LearningAPIService from '../../services/LearningAPIService';

interface BrowseModulesScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'BrowseModules'>;
}

interface Module {
  id: number;
  title: string;
  description: string;
  icon: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  xpReward: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  duration: string;
  enrolled: boolean;
}

type DifficultyFilter = 'all' | 'Beginner' | 'Intermediate' | 'Advanced';

export const BrowseModulesScreen: React.FC<BrowseModulesScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);

  const categories = ['all', 'Government', 'Elections', 'Rights', 'Law', 'Policy', 'History'];

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await LearningAPIService.getModules();

      console.log('=== BrowseModulesScreen API Response ===');
      console.log('Response structure:', JSON.stringify(response, null, 2));

      if (response.data || response.modules) {
        const apiModules = response.data || response.modules;

        console.log('=== API Modules (first 2) ===');
        console.log(JSON.stringify(apiModules.slice(0, 2), null, 2));

        // Transform API data to match frontend interface
        const transformedModules = apiModules
          .filter((m: any) => m.is_published === 1 || m.is_published === true)
          .map((m: any) => {
            const transformed = {
              id: m.id,
              title: m.title,
              description: m.description,
              icon: m.icon || '📚',
              progress: m.progress_percentage || 0,
              totalLessons: m.total_lessons || 0,
              completedLessons: Math.round((m.total_lessons || 0) * ((m.progress_percentage || 0) / 100)),
              xpReward: m.xp_reward || 0,
              difficulty: (m.difficulty?.charAt(0).toUpperCase() + m.difficulty?.slice(1)) as 'Beginner' | 'Intermediate' | 'Advanced' || 'Beginner',
              category: m.category || 'General',
              duration: m.estimated_duration ? `${Math.round(m.estimated_duration / 60)} hours` : '2 hours',
              enrolled: m.progress_percentage > 0,
            };

            // Log module 42 specifically (Kenya ADHD module)
            if (m.id === 42) {
              console.log('=== MODULE 42 (Kenya ADHD) ===');
              console.log('Raw data:', JSON.stringify(m, null, 2));
              console.log('Transformed:', JSON.stringify(transformed, null, 2));
            }

            return transformed;
          });

        console.log('=== Total transformed modules:', transformedModules.length);
        setModules(transformedModules);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const oldHardcodedModules: Module[] = [
    {
      id: 1,
      title: 'Constitutional Basics',
      description: 'Learn fundamental rights and government structure',
      icon: 'gavel',
      progress: 75,
      totalLessons: 8,
      completedLessons: 6,
      xpReward: 200,
      difficulty: 'Beginner',
      category: 'Government',
      duration: '2 hours',
      enrolled: true,
    },
    {
      id: 2,
      title: 'Electoral Process',
      description: 'Understanding elections and voting systems',
      icon: 'how-to-vote',
      progress: 30,
      totalLessons: 12,
      completedLessons: 4,
      xpReward: 300,
      difficulty: 'Intermediate',
      category: 'Elections',
      duration: '3 hours',
      enrolled: true,
    },
    {
      id: 3,
      title: 'Civil Rights History',
      description: 'Key movements and landmark cases',
      icon: 'people',
      progress: 0,
      totalLessons: 10,
      completedLessons: 0,
      xpReward: 250,
      difficulty: 'Advanced',
      category: 'Rights',
      duration: '2.5 hours',
      enrolled: false,
    },
    {
      id: 4,
      title: 'Introduction to Democracy',
      description: 'Understanding democratic principles and values',
      icon: 'account-balance',
      progress: 0,
      totalLessons: 6,
      completedLessons: 0,
      xpReward: 150,
      difficulty: 'Beginner',
      category: 'Government',
      duration: '1.5 hours',
      enrolled: false,
    },
    {
      id: 5,
      title: 'Political Parties & Systems',
      description: 'Learn about political organizations',
      icon: 'groups',
      progress: 0,
      totalLessons: 8,
      completedLessons: 0,
      xpReward: 200,
      difficulty: 'Intermediate',
      category: 'Elections',
      duration: '2 hours',
      enrolled: false,
    },
    {
      id: 6,
      title: 'Judicial System',
      description: 'Understanding the court system',
      icon: 'balance',
      progress: 0,
      totalLessons: 10,
      completedLessons: 0,
      xpReward: 250,
      difficulty: 'Advanced',
      category: 'Law',
      duration: '3 hours',
      enrolled: false,
    },
    {
      id: 7,
      title: 'Human Rights',
      description: 'Learn about fundamental human rights',
      icon: 'volunteer-activism',
      progress: 0,
      totalLessons: 9,
      completedLessons: 0,
      xpReward: 225,
      difficulty: 'Intermediate',
      category: 'Rights',
      duration: '2.5 hours',
      enrolled: false,
    },
    {
      id: 8,
      title: 'Public Policy Making',
      description: 'How policies are created and implemented',
      icon: 'policy',
      progress: 0,
      totalLessons: 11,
      completedLessons: 0,
      xpReward: 275,
      difficulty: 'Advanced',
      category: 'Policy',
      duration: '3.5 hours',
      enrolled: false,
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || module.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchModules();
    setRefreshing(false);
  };

  const renderModule = ({ item }: { item: Module }) => {
    const isImageUrl = item.icon.startsWith('http://') || item.icon.startsWith('https://');

    return (
      <TouchableOpacity
        style={styles.moduleCard}
        onPress={() => navigation.navigate('ModuleDetail', { module: item })}
      >
        <View style={styles.moduleHeader}>
          <View style={[styles.moduleIcon, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
            {isImageUrl ? (
              <Image source={{ uri: item.icon }} style={styles.moduleIconImage} />
            ) : (
              <Text style={styles.moduleIconEmoji}>{item.icon}</Text>
            )}
          </View>
          {item.enrolled && (
            <View style={styles.enrolledBadge}>
              <MaterialIcons name="check-circle" size={16} color="#10B981" />
              <Text style={styles.enrolledText}>Enrolled</Text>
            </View>
          )}
        </View>

      <Text style={styles.moduleTitle}>{item.title}</Text>
      <Text style={styles.moduleDescription} numberOfLines={2}>
        {item.description.length > 60 ? `${item.description.substring(0, 60)}...` : item.description}
      </Text>

      <View style={styles.moduleStats}>
        <View style={styles.statItem}>
          <MaterialIcons name="menu-book" size={16} color="#666" />
          <Text style={styles.statText}>{item.totalLessons} lessons</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="schedule" size={16} color="#666" />
          <Text style={styles.statText}>{item.duration}</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="stars" size={16} color="#F59E0B" />
          <Text style={styles.statText}>{item.xpReward} XP</Text>
        </View>
      </View>

      {item.enrolled && item.progress > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{item.progress}% complete</Text>
        </View>
      )}

      <View style={styles.moduleFooter}>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
          <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
            {item.difficulty}
          </Text>
        </View>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
    </TouchableOpacity>
    );
  };

  if (loading && modules.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading modules...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Browse Modules</Text>
          <Text style={styles.headerSubtitle}>{filteredModules.length} modules available</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search modules..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterChips}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.filterChip, selectedCategory === category && styles.activeFilterChip]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.filterChipText, selectedCategory === category && styles.activeFilterChipText]}>
                  {category === 'all' ? 'All' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Difficulty Filter */}
        <View style={styles.difficultyFilter}>
          {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((difficulty) => (
            <TouchableOpacity
              key={difficulty}
              style={[styles.difficultyButton, selectedDifficulty === difficulty && styles.activeDifficultyButton]}
              onPress={() => setSelectedDifficulty(difficulty)}
            >
              <Text style={[styles.difficultyButtonText, selectedDifficulty === difficulty && styles.activeDifficultyButtonText]}>
                {difficulty === 'all' ? 'All' : difficulty}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Modules Grid */}
      <FlatList
        data={filteredModules}
        renderItem={renderModule}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filtersSection: {
    paddingBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterChip: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  difficultyFilter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeDifficultyButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  difficultyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeDifficultyButtonText: {
    color: '#3B82F6',
  },
  listContent: {
    padding: 24,
  },
  row: {
    justifyContent: 'space-between',
  },
  moduleCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
    maxWidth: '48%',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  moduleIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleIconImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  moduleIconEmoji: {
    fontSize: 32,
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 2,
  },
  enrolledText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10B981',
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  moduleDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    lineHeight: 16,
  },
  moduleStats: {
    gap: 6,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 10,
    color: '#666',
  },
  moduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 10,
    color: '#666',
  },
});
