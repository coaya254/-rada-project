import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import { Course, Category, LearningScreenProps } from '../types/LearningTypes';
import apiService from '../services/api';

export const LearnHomeScreen: React.FC<LearningScreenProps> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [continueCourse, setContinueCourse] = useState<Course | null>(null);

  const categories: Category[] = [
    { name: 'All', key: 'all', icon: 'th', color: '#64748b' },
    { name: 'Government', key: 'government', icon: 'landmark', color: '#4f46e5' },
    { name: 'Voting', key: 'voting', icon: 'vote-yea', color: '#ef4444' },
    { name: 'Rights', key: 'rights', icon: 'handshake', color: '#10b981' },
    { name: 'Economics', key: 'economics', icon: 'money', color: '#f59e0b' },
    { name: 'Constitution', key: 'constitution', icon: 'book', color: '#8b5cf6' },
  ];

  // Load courses from backend
  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getModules();
      const modules = response.data || response;
      
      console.log('📚 LearnHome - Raw modules:', modules);
      
      // Transform backend data to frontend format
      const transformedCourses = modules.map((module: any) => ({
        id: module.id,
        title: module.title,
        icon: getIconForCategory(module.category),
        lessons: 5, // Default lessons count
        color: getColorForCategory(module.category),
        category: module.category?.toLowerCase() || 'general',
        xp: module.xp_reward,
        duration: `${module.estimated_duration}m`,
        difficulty: module.difficulty,
        progress: 0 // Will be updated from user progress
      }));
      
      setCourses(transformedCourses);
      
      // Find a course with progress to show in continue section
      const courseWithProgress = transformedCourses.find(course => course.progress > 0) || transformedCourses[0];
      setContinueCourse(courseWithProgress);
      
    } catch (error) {
      console.error('Error loading courses:', error);
      // No fallback data - use real API data only
      console.error('❌ LearnHomeScreen - API failed, no fallback data');
    } finally {
      setIsLoading(false);
    }
  };

  const getIconForCategory = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'government': 'landmark',
      'civics': 'handshake',
      'leadership': 'users',
      'democracy': 'vote-yea',
      'constitution': 'book',
      'governance': 'building'
    };
    return categoryMap[category?.toLowerCase()] || 'book';
  };

  const getColorForCategory = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'government': '#4f46e5',
      'civics': '#10b981',
      'leadership': '#8b5cf6',
      'democracy': '#ef4444',
      'constitution': '#f59e0b',
      'governance': '#06b6d4'
    };
    return colorMap[category?.toLowerCase()] || '#64748b';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6cfa" />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Continue Learning Card */}
        {continueCourse && (
          <TouchableOpacity 
            style={styles.continueCard}
            onPress={() => navigation.navigate('CourseDetail', { 
              courseId: continueCourse.id,
              title: continueCourse.title,
              description: 'Continue your learning journey',
              lessons: continueCourse.lessons,
              duration: continueCourse.duration,
              xp: continueCourse.xp,
              progress: continueCourse.progress
            })}
          >
            <View style={styles.continueCardHeader}>
              <View style={styles.continueCardText}>
                <Text style={styles.continueCardTitle}>{continueCourse.title}</Text>
                <Text style={styles.continueCardDesc}>Continue your learning journey</Text>
              </View>
              <View style={styles.continueCardIcon}>
                <Icon name={continueCourse.icon} size={24} color="white" />
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>Lesson 1 of {continueCourse.lessons}</Text>
                <Text style={styles.progressText}>{continueCourse.progress}% Complete</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${continueCourse.progress}%` }]} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category, index) => (
              <TouchableOpacity key={index} style={styles.categoryItem}>
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                  <Icon name={category.icon} size={16} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Courses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Courses</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.coursesGrid}>
            {courses.map((course) => (
              <TouchableOpacity 
                key={course.id} 
                style={[styles.courseCard, { borderTopColor: course.color }]}
                onPress={() => navigation.navigate('CourseDetail', {
                  courseId: course.id,
                  title: course.title,
                  description: 'Learn about ' + course.title.toLowerCase(),
                  lessons: course.lessons,
                  duration: course.duration,
                  xp: course.xp,
                  progress: course.progress
                })}
              >
                <View style={[styles.courseIcon, { backgroundColor: `${course.color}20` }]}>
                  <Icon name={course.icon} size={20} color={course.color} />
                </View>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <View style={styles.courseStats}>
                  <Icon name="star" size={12} color="#f59e0b" />
                  <Text style={styles.courseStatsText}>{course.xp} XP</Text>
                </View>
                <View style={styles.courseMeta}>
                  <Text style={styles.courseMetaText}>{course.lessons} Lessons • {course.duration}</Text>
                </View>
              </TouchableOpacity>
            ))}
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
  // Continue Learning Card Styles
  continueCard: {
    backgroundColor: '#4a6cfa',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginBottom: 0,
  },
  continueCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  continueCardText: {
    flex: 1,
  },
  continueCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  continueCardDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  continueCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  // Section Styles
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  viewAll: {
    fontSize: 14,
    color: '#4a6cfa',
    fontWeight: '600',
  },
  // Category Styles
  categoryScroll: {
    marginBottom: 16,
  },
  categoryItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  // Course Grid Styles
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  courseCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseStatsText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
  },
  courseMeta: {
    marginTop: 4,
  },
  courseMetaText: {
    fontSize: 11,
    color: '#64748b',
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
});

export default LearnHomeScreen;
