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
import { communityApi, Discussion } from '../../services/communityApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CommunityHomeProps {
  navigation: NativeStackNavigationProp<CommunityStackParamList, 'CommunityHome'>;
}

interface LocalDiscussion {
  id: number;
  uuid: string; // Author's UUID
  title: string;
  author: string;
  timestamp: string;
  replies: number;
  likes: number;
  category: string;
  preview: string;
  isLiked?: boolean;
}

export const CommunityHome: React.FC<CommunityHomeProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [discussions, setDiscussions] = useState<LocalDiscussion[]>([]);
  const [userStats, setUserStats] = useState({
    posts: 0,
    replies: 0,
    likes: 0,
  });

  useEffect(() => {
    loadDiscussions();
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const userUuid = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';

      // Get all discussions by this user
      const allDiscussions = await communityApi.getDiscussions({ limit: 1000 });
      const userPosts = allDiscussions.filter(d => d.uuid === userUuid);

      // Count total replies by this user across all discussions
      let totalReplies = 0;
      let totalLikes = 0;

      for (const discussion of allDiscussions) {
        const replies = await communityApi.getReplies(discussion.id);
        totalReplies += replies.filter(r => r.uuid === userUuid).length;
      }

      // Count likes on user's posts
      userPosts.forEach(post => {
        totalLikes += post.likes_count || 0;
      });

      setUserStats({
        posts: userPosts.length,
        replies: totalReplies,
        likes: totalLikes,
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadDiscussions = async () => {
    try {
      setError(null);
      setLoading(true);
  
      // Get real data from API
      const data = await communityApi.getDiscussions({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        limit: 20,
        offset: 0
      });
  
      // Transform API data to match your interface
      const transformedData = data.map(discussion => ({
        id: discussion.id,
        uuid: discussion.uuid, // Author's UUID
        title: discussion.title,
        author: discussion.is_anonymous ? 'Anonymous' : discussion.nickname,
        timestamp: formatTimestamp(discussion.created_at),
        replies: discussion.replies_count,
        likes: discussion.likes_count,
        category: discussion.category,
        preview: discussion.content.substring(0, 150) + '...',
        isLiked: false, // TODO: Check if user has liked this discussion from backend
      }));
  
      setDiscussions(transformedData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading discussions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load discussions');
      setLoading(false);
    }
  };
  
  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
  
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDiscussions();
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

  const handleLike = async (discussionId: number, e: any) => {
    e.stopPropagation(); // Prevent navigation when clicking like

    try {
      const userUuid = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';
      await communityApi.likeDiscussion(discussionId, userUuid);

      // Update local state
      setDiscussions(discussions.map(disc =>
        disc.id === discussionId
          ? {
              ...disc,
              isLiked: !disc.isLiked,
              likes: disc.isLiked ? disc.likes - 1 : disc.likes + 1
            }
          : disc
      ));
    } catch (error) {
      console.error('Error liking discussion:', error);
    }
  };

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

  const renderDiscussionCard = ({ item }: { item: LocalDiscussion }) => (
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
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('UserProfile', {
                userId: item.uuid,
                userName: item.author,
              });
            }}
          >
            <Text style={styles.authorName}>{item.author}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.discussionActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('DiscussionDetail', { discussionId: item.id });
            }}
          >
            <MaterialIcons name="chat-bubble-outline" size={18} color="#666" />
            <Text style={styles.actionText}>{item.replies}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, item.isLiked && styles.actionButtonLiked]}
            onPress={(e) => handleLike(item.id, e)}
          >
            <MaterialIcons
              name={item.isLiked ? "favorite" : "favorite-border"}
              size={18}
              color={item.isLiked ? "#EF4444" : "#666"}
            />
            <Text style={[styles.actionText, item.isLiked && styles.actionTextLiked]}>
              {item.likes}
            </Text>
          </TouchableOpacity>
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
                    <Text style={styles.statValue}>{userStats.posts}</Text>
                    <Text style={styles.statLabel}>POSTS</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{userStats.replies}</Text>
                    <Text style={styles.statLabel}>REPLIES</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{userStats.likes}</Text>
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
  discussionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
  },
  actionButtonLiked: {
    backgroundColor: '#FEE2E2',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  actionTextLiked: {
    color: '#EF4444',
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