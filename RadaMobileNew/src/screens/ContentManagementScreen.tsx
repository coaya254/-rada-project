import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import { ContentModule, ContentLesson, ContentQuiz } from '../types/ContentManagementTypes';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const ContentManagementScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [activeTab, setActiveTab] = useState('modules');
  const [modules, setModules] = useState<ContentModule[]>([]);
  const [lessons, setLessons] = useState<ContentLesson[]>([]);
  const [quizzes, setQuizzes] = useState<ContentQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const tabs = [
    { key: 'modules', label: 'Modules', icon: 'book', count: 0 },
    { key: 'lessons', label: 'Lessons', icon: 'file-text', count: 0 },
    { key: 'quizzes', label: 'Quizzes', icon: 'question-circle', count: 0 },
    { key: 'analytics', label: 'Analytics', icon: 'bar-chart', count: 0 },
  ];

  const bulkActions = [
    { key: 'publish', label: 'Publish', icon: 'eye', color: '#10b981' },
    { key: 'unpublish', label: 'Unpublish', icon: 'eye-slash', color: '#f59e0b' },
    { key: 'delete', label: 'Delete', icon: 'trash', color: '#ef4444' },
    { key: 'duplicate', label: 'Duplicate', icon: 'copy', color: '#3b82f6' },
    { key: 'export', label: 'Export', icon: 'download', color: '#8b5cf6' },
  ];

  useEffect(() => {
    loadContent();
    animateIn();
  }, [activeTab]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with API calls
      const mockModules: ContentModule[] = [
        {
          id: 1,
          title: 'Constitution Basics',
          description: 'Learn the fundamental principles of constitutional law',
          shortDescription: 'Fundamental constitutional principles',
          category: 'Law',
          difficulty: 'beginner',
          estimatedDuration: 120,
          isPublished: true,
          isFeatured: true,
          order: 1,
          coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
          tags: ['constitution', 'law', 'basics'],
          prerequisites: [],
          learningObjectives: ['Understand constitutional principles', 'Apply legal concepts'],
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
          createdBy: 'admin1',
          updatedBy: 'admin1',
          stats: {
            totalLessons: 8,
            totalQuizzes: 3,
            totalXP: 200,
            completionRate: 85,
            averageRating: 4.5,
            totalEnrollments: 150,
          },
        },
        {
          id: 2,
          title: 'Civic Participation',
          description: 'Understanding how to participate in democratic processes',
          shortDescription: 'Democratic participation guide',
          category: 'Civics',
          difficulty: 'intermediate',
          estimatedDuration: 90,
          isPublished: true,
          isFeatured: false,
          order: 2,
          coverImage: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&q=80',
          tags: ['civics', 'democracy', 'participation'],
          prerequisites: [1],
          learningObjectives: ['Understand civic duties', 'Engage in democracy'],
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-18T10:00:00Z',
          createdBy: 'admin2',
          updatedBy: 'admin1',
          stats: {
            totalLessons: 6,
            totalQuizzes: 2,
            totalXP: 150,
            completionRate: 78,
            averageRating: 4.2,
            totalEnrollments: 120,
          },
        },
      ];

      const mockLessons: ContentLesson[] = [
        {
          id: 1,
          moduleId: 1,
          title: 'Introduction to Constitution',
          description: 'Basic concepts and historical context',
          content: 'The constitution is the fundamental law...',
          type: 'text',
          duration: 15,
          order: 1,
          isPublished: true,
          isRequired: true,
          xp: 25,
          resources: [],
          keyPoints: ['Historical context', 'Basic principles'],
          prerequisites: [],
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
          createdBy: 'admin1',
          updatedBy: 'admin1',
          stats: {
            completionRate: 90,
            averageTimeSpent: 18,
            totalViews: 200,
            rating: 4.6,
          },
        },
      ];

      const mockQuizzes: ContentQuiz[] = [
        {
          id: 1,
          lessonId: 1,
          title: 'Constitution Basics Quiz',
          description: 'Test your understanding of constitutional principles',
          questions: [],
          timeLimit: 10,
          passingScore: 70,
          maxAttempts: 3,
          isPublished: true,
          order: 1,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
          createdBy: 'admin1',
          updatedBy: 'admin1',
          stats: {
            totalAttempts: 150,
            averageScore: 82,
            passRate: 85,
            averageTimeSpent: 8,
          },
        },
      ];

      setModules(mockModules);
      setLessons(mockLessons);
      setQuizzes(mockQuizzes);
    } catch (error) {
      console.error('Error loading content:', error);
      Alert.alert('Error', 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContent();
    setRefreshing(false);
  };

  const handleItemSelect = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const currentItems = getCurrentItems();
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(item => item.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      Alert.alert('No Selection', 'Please select items to perform this action');
      return;
    }

    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${action} ${selectedItems.length} item(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              // API call for bulk action
              console.log(`Performing ${action} on:`, selectedItems);
              setSelectedItems([]);
              setShowBulkActions(false);
              Alert.alert('Success', `Bulk ${action} completed successfully`);
            } catch (error) {
              Alert.alert('Error', `Failed to ${action} items`);
            }
          },
        },
      ]
    );
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'modules': return modules;
      case 'lessons': return lessons;
      case 'quizzes': return quizzes;
      default: return [];
    }
  };

  const getFilteredItems = () => {
    const items = getCurrentItems();
    if (!searchQuery) return items;
    
    return items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item as any).description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderModuleCard = (module: ContentModule) => (
    <Animated.View
      key={module.id}
      style={[styles.contentCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('ModuleEditor', { moduleId: module.id })}
        activeOpacity={0.8}
        style={styles.cardContent}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{module.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {module.description}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleItemSelect(module.id)}
            style={[
              styles.checkbox,
              selectedItems.includes(module.id) && styles.checkboxSelected,
            ]}
          >
            {selectedItems.includes(module.id) && (
              <Icon name="check" size={16} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Icon name="clock-o" size={12} color="#64748b" />
            <Text style={styles.metaText}>{module.estimatedDuration} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="book" size={12} color="#64748b" />
            <Text style={styles.metaText}>{module.stats.totalLessons} lessons</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="users" size={12} color="#64748b" />
            <Text style={styles.metaText}>{module.stats.totalEnrollments} enrolled</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: module.isPublished ? '#10b981' : '#f59e0b' }
            ]}>
              <Text style={styles.statusText}>
                {module.isPublished ? 'Published' : 'Draft'}
              </Text>
            </View>
            {module.isFeatured && (
              <View style={[styles.statusBadge, { backgroundColor: '#3b82f6' }]}>
                <Text style={styles.statusText}>Featured</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardDate}>
            Updated {new Date(module.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderLessonCard = (lesson: ContentLesson) => (
    <Animated.View
      key={lesson.id}
      style={[styles.contentCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('LessonEditor', { lessonId: lesson.id })}
        activeOpacity={0.8}
        style={styles.cardContent}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{lesson.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {lesson.description}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleItemSelect(lesson.id)}
            style={[
              styles.checkbox,
              selectedItems.includes(lesson.id) && styles.checkboxSelected,
            ]}
          >
            {selectedItems.includes(lesson.id) && (
              <Icon name="check" size={16} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Icon name="clock-o" size={12} color="#64748b" />
            <Text style={styles.metaText}>{lesson.duration} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="star" size={12} color="#64748b" />
            <Text style={styles.metaText}>{lesson.xp} XP</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="eye" size={12} color="#64748b" />
            <Text style={styles.metaText}>{lesson.stats.totalViews} views</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: lesson.isPublished ? '#10b981' : '#f59e0b' }
            ]}>
              <Text style={styles.statusText}>
                {lesson.isPublished ? 'Published' : 'Draft'}
              </Text>
            </View>
            {lesson.isRequired && (
              <View style={[styles.statusBadge, { backgroundColor: '#ef4444' }]}>
                <Text style={styles.statusText}>Required</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardDate}>
            Updated {new Date(lesson.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderQuizCard = (quiz: ContentQuiz) => (
    <Animated.View
      key={quiz.id}
      style={[styles.contentCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('QuizEditor', { quizId: quiz.id })}
        activeOpacity={0.8}
        style={styles.cardContent}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{quiz.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {quiz.description}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleItemSelect(quiz.id)}
            style={[
              styles.checkbox,
              selectedItems.includes(quiz.id) && styles.checkboxSelected,
            ]}
          >
            {selectedItems.includes(quiz.id) && (
              <Icon name="check" size={16} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Icon name="clock-o" size={12} color="#64748b" />
            <Text style={styles.metaText}>{quiz.timeLimit} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="target" size={12} color="#64748b" />
            <Text style={styles.metaText}>{quiz.passingScore}% pass</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="users" size={12} color="#64748b" />
            <Text style={styles.metaText}>{quiz.stats.totalAttempts} attempts</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: quiz.isPublished ? '#10b981' : '#f59e0b' }
            ]}>
              <Text style={styles.statusText}>
                {quiz.isPublished ? 'Published' : 'Draft'}
              </Text>
            </View>
          </View>
          <Text style={styles.cardDate}>
            Updated {new Date(quiz.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderContent = () => {
    const items = getFilteredItems();
    
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="file-text" size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No content found</Text>
          <Text style={styles.emptyDescription}>
            {searchQuery ? 'Try adjusting your search terms' : 'Create your first content item'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={items}
        renderItem={({ item }) => {
          switch (activeTab) {
            case 'modules': return renderModuleCard(item as ContentModule);
            case 'lessons': return renderLessonCard(item as ContentLesson);
            case 'quizzes': return renderQuizCard(item as ContentQuiz);
            default: return null;
          }
        }}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Content Management</Text>
        <TouchableOpacity style={styles.addButton}>
          <Icon name="plus" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={16} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search content..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748b"
          />
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? '#667eea' : '#64748b'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selection Bar */}
      {selectedItems.length > 0 && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {selectedItems.length} item(s) selected
          </Text>
          <TouchableOpacity
            style={styles.bulkActionButton}
            onPress={() => setShowBulkActions(true)}
          >
            <Icon name="cog" size={16} color="#667eea" />
            <Text style={styles.bulkActionText}>Actions</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content List */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {/* Bulk Actions Modal */}
      <Modal
        visible={showBulkActions}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBulkActions(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Bulk Actions</Text>
            <View style={styles.modalSpacer} />
          </View>
          
          <View style={styles.modalContent}>
            {bulkActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.bulkActionItem}
                onPress={() => handleBulkAction(action.key)}
              >
                <Icon name={action.icon} size={20} color={action.color} />
                <Text style={styles.bulkActionItemText}>{action.label}</Text>
                <Icon name="chevron-right" size={16} color="#64748b" />
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#667eea',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectionText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bulkActionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748b',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  cardDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalSpacer: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  bulkActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bulkActionItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
});

export default ContentManagementScreen;
  },
  activeTabText: {
    color: '#667eea',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectionText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bulkActionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748b',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  cardDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalSpacer: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  bulkActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bulkActionItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
});

export default ContentManagementScreen;