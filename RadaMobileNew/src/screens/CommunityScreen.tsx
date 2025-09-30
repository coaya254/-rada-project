import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import apiService from '../services/api';
import SocialMediaCard from '../components/SocialMediaCard';

const { width } = Dimensions.get('window');

// Post interface
interface Post {
  id: number;
  user: {
    name: string;
    avatar: string;
    handle: string;
  };
  content: string;
  title: string;
  category: string;
  timestamp: string;
  comments: number;
  likes: number;
  readTime: string;
  fullContent: string;
  hasVoiceNote: boolean;
  voiceDuration: string | null;
  highlightColor: string;
  shares: number;
  topReplies: any[];
}

// Function to get relative time (e.g., "2h ago", "1d ago")
const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const CommunityScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  const categories = [
    { id: 'all', label: 'All', icon: '🌟', color: '#FFD700' },
    { id: 'story', label: 'Stories', icon: '✍️', color: '#4ECDC4' },
    { id: 'civic', label: 'Civic', icon: '🏛️', color: '#FF6B6B' },
    { id: 'report', label: 'Reports', icon: '📊', color: '#45B7D1' },
    { id: 'poem', label: 'Poems', icon: '📝', color: '#96CEB4' },
    { id: 'audio', label: 'Audio', icon: '🎵', color: '#FFEAA7' },
    { id: 'image', label: 'Images', icon: '📷', color: '#DDA0DD' },
  ];

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPosts();
      if (Array.isArray(response)) {
        const mappedPosts = response.map(post => {
          // Define category colors
          const getCategoryColor = (category: string) => {
            switch (category?.toLowerCase()) {
              case 'civic': return '#FF6B6B';
              case 'story': return '#4ECDC4';
              case 'report': return '#45B7D1';
              case 'poem': return '#96CEB4';
              case 'audio': return '#FFEAA7';
              case 'image': return '#DDA0DD';
              default: return '#FFD700';
            }
          };

          return {
            id: post.id,
            user: {
              name: post.author || 'Anonymous User',
              avatar: post.author_avatar || '👤',
              handle: post.author ? `@${post.author.toLowerCase().replace(/\s+/g, '')}` : '@anonymous'
            },
            content: post.content || '',
            title: post.title || '',
            category: post.type || 'story',
            timestamp: post.timestamp ? getRelativeTime(new Date(post.timestamp)) : 'Recently',
            comments: post.comments || 0,
            likes: post.likes || 0,
            readTime: `${Math.ceil((post.content || '').length / 200)} min read`,
            fullContent: post.content || '',
            hasVoiceNote: false,
            voiceDuration: null,
            highlightColor: getCategoryColor(post.type || 'story'),
            shares: post.shares || 0,
            topReplies: []
          };
        });
        
        setPosts(mappedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = (postsToFilter: Post[]) => {
    if (selectedCategory === 'all') {
      setFilteredPosts(postsToFilter);
    } else {
      setFilteredPosts(postsToFilter.filter(post => post.category === selectedCategory));
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts(posts);
  }, [selectedCategory, posts]);

  // Auto-refresh when screen comes into focus (e.g., after creating a post)
  useFocusEffect(
    React.useCallback(() => {
      // Small delay to ensure backend has processed any new posts
      const timer = setTimeout(() => {
        fetchPosts();
      }, 500);
      
      return () => clearTimeout(timer);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  // Callback functions for social interactions
  const handleLike = (postId: string, isLiked?: boolean) => {
    console.log(`Post ${postId} ${isLiked ? 'liked' : 'unliked'}`);
    // TODO: Implement API call
  };

  const handleBookmark = (postId: string, isBookmarked?: boolean) => {
    console.log(`Post ${postId} ${isBookmarked ? 'bookmarked' : 'unbookmarked'}`);
    // TODO: Implement API call
  };

  const handleShare = (postId: string) => {
    console.log(`Post ${postId} shared`);
    // TODO: Implement share functionality
  };

  const handleComment = (postId: string, commentText?: string) => {
    console.log(`Comment added to post ${postId}: ${commentText}`);
    // TODO: Implement API call
  };

  const renderItem = ({ item }: { item: Post }) => (
    <View style={styles.cardContainer}>
      <SocialMediaCard 
        postData={item}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onComment={handleComment}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>🌟 Community</Text>
            <Text style={styles.headerSubtitle}>Share, connect, and engage</Text>
          </View>
          <TouchableOpacity 
            style={styles.createPostButton}
            onPress={() => (navigation as any).navigate('CreatePost')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        ListHeaderComponent={
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filterButton,
                  selectedCategory === category.id && styles.filterButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.filterIcon}>{category.icon}</Text>
                <Text 
                  style={[
                    styles.filterText,
                    selectedCategory === category.id && styles.filterTextActive
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        }
        data={filteredPosts}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.contentList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B6B', '#4ECDC4']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading posts...' : 'No posts found'}
            </Text>
            {!loading && (
              <Text style={styles.emptySubtext}>Be the first to share something!</Text>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  createPostButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#374151',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  contentList: {
    paddingBottom: 20,
  },
  cardContainer: {
    marginBottom: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default CommunityScreen;
