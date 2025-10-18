import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';

interface BookmarksScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'Bookmarks'>;
}

interface Bookmark {
  id: number;
  type: 'lesson' | 'module' | 'quiz';
  title: string;
  description: string;
  moduleTitle: string;
  icon: string;
  addedDate: string;
  progress?: number;
  category: string;
}

type FilterType = 'all' | 'lesson' | 'module' | 'quiz';

export const BookmarksScreen: React.FC<BookmarksScreenProps> = ({ navigation }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const bookmarks: Bookmark[] = [
    {
      id: 1,
      type: 'lesson',
      title: 'Introduction to the Constitution',
      description: 'Overview of the Constitution and its importance',
      moduleTitle: 'Constitutional Basics',
      icon: 'gavel',
      addedDate: '2025-10-05',
      progress: 75,
      category: 'Government',
    },
    {
      id: 2,
      type: 'module',
      title: 'Electoral Process',
      description: 'Understanding elections and voting systems',
      moduleTitle: 'Electoral Process',
      icon: 'how-to-vote',
      addedDate: '2025-10-03',
      progress: 30,
      category: 'Elections',
    },
    {
      id: 3,
      type: 'lesson',
      title: 'Civil Rights History',
      description: 'Key movements and landmark cases',
      moduleTitle: 'Civil Rights',
      icon: 'people',
      addedDate: '2025-10-01',
      category: 'Rights',
    },
    {
      id: 4,
      type: 'quiz',
      title: 'Democracy Quiz',
      description: 'Test your knowledge about democratic processes',
      moduleTitle: 'Introduction to Democracy',
      icon: 'quiz',
      addedDate: '2025-09-28',
      category: 'Government',
    },
    {
      id: 5,
      type: 'lesson',
      title: 'Separation of Powers',
      description: 'How government branches work together',
      moduleTitle: 'Constitutional Basics',
      icon: 'account-balance',
      addedDate: '2025-09-25',
      category: 'Government',
    },
    {
      id: 6,
      type: 'module',
      title: 'Political Parties & Systems',
      description: 'Learn about political organizations',
      moduleTitle: 'Political Parties & Systems',
      icon: 'groups',
      addedDate: '2025-09-20',
      progress: 0,
      category: 'Elections',
    },
  ];

  const getTypeColor = (type: Bookmark['type']) => {
    switch (type) {
      case 'lesson': return '#3B82F6';
      case 'module': return '#10B981';
      case 'quiz': return '#8B5CF6';
    }
  };

  const getTypeLabel = (type: Bookmark['type']) => {
    switch (type) {
      case 'lesson': return 'Lesson';
      case 'module': return 'Module';
      case 'quiz': return 'Quiz';
    }
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    if (filter === 'all') return true;
    return bookmark.type === filter;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleBookmarkPress = (bookmark: Bookmark) => {
    if (bookmark.type === 'module') {
      // Navigate to module detail
      navigation.navigate('ModuleDetail', {
        module: {
          id: bookmark.id,
          title: bookmark.title,
          description: bookmark.description,
          icon: bookmark.icon,
          progress: bookmark.progress || 0,
          totalLessons: 10,
          completedLessons: Math.floor((bookmark.progress || 0) / 10),
          xpReward: 200,
          difficulty: 'Intermediate',
          category: bookmark.category,
        }
      });
    } else if (bookmark.type === 'quiz') {
      // Navigate to quiz
      navigation.navigate('Quiz', {
        quizId: bookmark.id,
        title: bookmark.title,
      });
    } else {
      // Navigate to lesson
      navigation.navigate('Lesson', {
        lesson: {
          id: bookmark.id,
          title: bookmark.title,
          moduleId: 1,
          content: bookmark.description,
        }
      });
    }
  };

  const handleRemoveBookmark = (id: number) => {
    // In a real app, this would call an API
    console.log('Remove bookmark:', id);
  };

  const renderBookmark = ({ item }: { item: Bookmark }) => (
    <TouchableOpacity
      style={styles.bookmarkCard}
      onPress={() => handleBookmarkPress(item)}
    >
      <View style={styles.bookmarkContent}>
        <View style={[styles.bookmarkIcon, { backgroundColor: getTypeColor(item.type) + '20' }]}>
          <MaterialIcons name={item.icon as any} size={24} color={getTypeColor(item.type)} />
        </View>

        <View style={styles.bookmarkInfo}>
          <View style={styles.bookmarkHeader}>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
              <Text style={styles.typeBadgeText}>{getTypeLabel(item.type)}</Text>
            </View>
            <Text style={styles.addedDate}>
              {new Date(item.addedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>

          <Text style={styles.bookmarkTitle}>{item.title}</Text>
          <Text style={styles.bookmarkDescription}>{item.description}</Text>

          <View style={styles.bookmarkFooter}>
            <View style={styles.moduleInfo}>
              <MaterialIcons name="folder" size={14} color="#666" />
              <Text style={styles.moduleText}>{item.moduleTitle}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>

          {item.progress !== undefined && item.progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, {
                  width: `${item.progress}%`,
                  backgroundColor: getTypeColor(item.type),
                }]} />
              </View>
              <Text style={styles.progressText}>{item.progress}%</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveBookmark(item.id)}
        >
          <MaterialIcons name="bookmark" size={24} color="#F59E0B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Bookmarks</Text>
          <Text style={styles.headerSubtitle}>
            {filteredBookmarks.length} saved {filteredBookmarks.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
              onPress={() => setFilter('all')}
            >
              <MaterialIcons name="bookmark" size={18} color={filter === 'all' ? '#FFFFFF' : '#666'} />
              <Text style={[styles.filterTabText, filter === 'all' && styles.activeFilterTabText]}>
                All ({bookmarks.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, filter === 'lesson' && styles.activeFilterTab]}
              onPress={() => setFilter('lesson')}
            >
              <MaterialIcons name="menu-book" size={18} color={filter === 'lesson' ? '#FFFFFF' : '#666'} />
              <Text style={[styles.filterTabText, filter === 'lesson' && styles.activeFilterTabText]}>
                Lessons ({bookmarks.filter(b => b.type === 'lesson').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, filter === 'module' && styles.activeFilterTab]}
              onPress={() => setFilter('module')}
            >
              <MaterialIcons name="folder" size={18} color={filter === 'module' ? '#FFFFFF' : '#666'} />
              <Text style={[styles.filterTabText, filter === 'module' && styles.activeFilterTabText]}>
                Modules ({bookmarks.filter(b => b.type === 'module').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, filter === 'quiz' && styles.activeFilterTab]}
              onPress={() => setFilter('quiz')}
            >
              <MaterialIcons name="quiz" size={18} color={filter === 'quiz' ? '#FFFFFF' : '#666'} />
              <Text style={[styles.filterTabText, filter === 'quiz' && styles.activeFilterTabText]}>
                Quizzes ({bookmarks.filter(b => b.type === 'quiz').length})
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Bookmarks List */}
      {filteredBookmarks.length > 0 ? (
        <FlatList
          data={filteredBookmarks}
          renderItem={renderBookmark}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="bookmark-border" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
          <Text style={styles.emptyDescription}>
            {filter === 'all'
              ? 'Start bookmarking lessons, modules, and quizzes to save them for later.'
              : `No ${filter}s have been bookmarked yet.`}
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('BrowseModules')}
          >
            <MaterialIcons name="explore" size={20} color="#FFFFFF" />
            <Text style={styles.browseButtonText}>Browse Modules</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  filterContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 6,
  },
  activeFilterTab: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 24,
  },
  bookmarkCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  bookmarkContent: {
    flexDirection: 'row',
    padding: 16,
  },
  bookmarkIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addedDate: {
    fontSize: 11,
    color: '#999',
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookmarkDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  bookmarkFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleText: {
    fontSize: 12,
    color: '#666',
  },
  categoryBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 35,
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
