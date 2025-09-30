import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  RefreshControl,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CommunityStackParamList } from '../../navigation/CommunityStackNavigator';
import { LoadingSpinner, LoadingCard, ErrorDisplay } from '../../components/ui';

interface CommunityHomeProps {
  navigation: NativeStackNavigationProp<CommunityStackParamList, 'CommunityHome'>;
}

interface Discussion {
  id: number;
  title: string;
  author: string;
  timestamp: string;
  replies: number;
  likes: number;
  category: string;
  preview: string;
}

export const CommunityHome: React.FC<CommunityHomeProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: 1,
      title: 'What do you think about the new education reform proposal?',
      author: 'Sarah Chen',
      timestamp: '2h ago',
      replies: 24,
      likes: 18,
      category: 'Education',
      preview: 'I wanted to get everyone\'s thoughts on the recent education reform proposal that was announced...',
    },
    {
      id: 2,
      title: 'Local infrastructure improvements - your priorities?',
      author: 'Mike Johnson',
      timestamp: '4h ago',
      replies: 15,
      likes: 22,
      category: 'Infrastructure',
      preview: 'Our city council is asking for community input on infrastructure priorities. What should we focus on?',
    },
    {
      id: 3,
      title: 'Climate action at the community level',
      author: 'Lisa Rodriguez',
      timestamp: '6h ago',
      replies: 31,
      likes: 45,
      category: 'Environment',
      preview: 'What are some practical steps our community can take to address climate change locally?',
    },
    {
      id: 4,
      title: 'Healthcare accessibility in our district',
      author: 'David Park',
      timestamp: '1d ago',
      replies: 12,
      likes: 16,
      category: 'Healthcare',
      preview: 'Has anyone else noticed issues with healthcare accessibility in our area? Let\'s discuss solutions.',
    },
  ]);

  useEffect(() => {
    loadDiscussions();
  }, []);

  const loadDiscussions = async () => {
    try {
      setError(null);
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate random error (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Failed to load discussions. Please try again.');
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setError(null);
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRefreshing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
      setRefreshing(false);
    }
  };

  const getFilteredDiscussions = () => {
    let filtered = discussions;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(discussion =>
        discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discussion.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discussion.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discussion.preview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(discussion =>
        discussion.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return filtered;
  };

  const filteredDiscussions = getFilteredDiscussions();

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Education': '#10B981',
      'Infrastructure': '#3B82F6',
      'Environment': '#059669',
      'Healthcare': '#EF4444',
      'Politics': '#8B5CF6',
    };
    return colors[category] || '#6B7280';
  };

  const renderDiscussionCard = ({ item }: { item: Discussion }) => (
    <TouchableOpacity
      style={styles.discussionCard}
      onPress={() => navigation.navigate('DiscussionDetail', {
        discussionId: item.id,
        title: item.title,
        author: item.author,
        timestamp: item.timestamp,
        replies: item.replies,
        category: item.category,
      })}
    >
      <View style={styles.discussionHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.discussionTimestamp}>{item.timestamp}</Text>
      </View>

      <Text style={styles.discussionTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.discussionPreview} numberOfLines={2}>{item.preview}</Text>

      <View style={styles.discussionFooter}>
        <View style={styles.discussionAuthor}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>
              {item.author.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('UserProfile', {
              userId: item.id,
              username: item.author,
            })}
          >
            <Text style={styles.authorName}>{item.author}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.discussionStats}>
          <View style={styles.statItem}>
            <MaterialIcons name="forum" size={16} color="#666" />
            <Text style={styles.statText}>{item.replies}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="favorite" size={16} color="#666" />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <LoadingSpinner message="Loading community discussions..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ErrorDisplay
          title="Community Unavailable"
          message={error}
          onRetry={loadDiscussions}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Community</Text>
            <Text style={styles.headerSubtitle}>Connect, discuss, and engage with others</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            accessibilityHint="View your notifications, you have 3 unread notifications"
          >
            <MaterialIcons name="notifications" size={24} color="#333" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Card */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.statsCard}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.statsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statsContent}>
                <Text style={styles.statsTitle}>Your Community Impact</Text>
                <Text style={styles.statsSubtitle}>Active member since joining</Text>

                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>POSTS</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>34</Text>
                    <Text style={styles.statLabel}>REPLIES</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>89</Text>
                    <Text style={styles.statLabel}>LIKES</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search and Filters */}
        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <MaterialIcons name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search discussions..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
                accessibilityLabel="Search discussions"
                accessibilityHint="Type to search for discussions by title, author, or category"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  accessibilityHint="Clears the search text"
                >
                  <MaterialIcons name="clear" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {['all', 'Education', 'Infrastructure', 'Environment', 'Healthcare', 'Politics'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${category === 'all' ? 'all categories' : category}`}
                accessibilityState={{ selected: selectedCategory === category }}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive
                ]}>
                  {category === 'all' ? 'All' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('CreatePost')}
            >
              <MaterialIcons name="create" size={32} color="#3B82F6" />
              <Text style={styles.actionTitle}>Create Post</Text>
              <Text style={styles.actionSubtitle}>Start discussion</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <MaterialIcons name="event" size={32} color="#10B981" />
              <Text style={styles.actionTitle}>Events</Text>
              <Text style={styles.actionSubtitle}>Town halls</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <MaterialIcons name="groups" size={32} color="#8B5CF6" />
              <Text style={styles.actionTitle}>Groups</Text>
              <Text style={styles.actionSubtitle}>Join interests</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <MaterialIcons name="trending-up" size={32} color="#F59E0B" />
              <Text style={styles.actionTitle}>Trending</Text>
              <Text style={styles.actionSubtitle}>Hot topics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Discussions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Discussions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredDiscussions}
            renderItem={renderDiscussionCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ListHeaderComponent={
              filteredDiscussions.length !== discussions.length ? (
                <Text style={styles.filterResult}>
                  Showing {filteredDiscussions.length} of {discussions.length} discussions
                </Text>
              ) : null
            }
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  statsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGradient: {
    padding: 24,
  },
  statsContent: {
    gap: 16,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  discussionCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  discussionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  discussionTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    lineHeight: 22,
  },
  discussionPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  discussionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discussionAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorAvatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  discussionStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    marginTop: 8,
  },
  categoryButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
});