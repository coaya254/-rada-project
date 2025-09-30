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
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/api';
import SocialMediaCard from '../components/SocialMediaCard';

const { width } = Dimensions.get('window');

const CommunityScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState([]);

  const categories = [
    { id: 'all', label: 'All', icon: '🌟' },
    { id: 'story', label: 'Stories', icon: '✍️' },
    { id: 'poem', label: 'Poems', icon: '📝' },
    { id: 'evidence', label: 'Evidence', icon: '📊' },
    { id: 'report', label: 'Reports', icon: '🎯' },
  ];

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPosts();
      if (Array.isArray(response)) {
        setPosts(response.map(post => ({
          id: post.id,
          user: {
            name: post.is_anonymous ? 'Anonymous User' : (post.nickname || 'User'),
            avatar: post.is_anonymous ? '👤' : (post.emoji || '👤'),
            handle: post.is_anonymous ? '@anonymous' : `@${post.nickname?.toLowerCase().replace(/\s+/g, '') || 'user'}`
          },
          content: post.content || '',
          title: post.title || '',
          category: post.type || 'story',
          timestamp: post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently',
          comments: post.comments_count || 0,
          likes: post.likes_count || 0,
          readTime: `${Math.ceil((post.content || '').length / 200)} min read`
        })));
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <SocialMediaCard 
        postData={item}
        onLike={(isLiked) => console.log('Liked:', isLiked)}
        onBookmark={(isBookmarked) => console.log('Bookmarked:', isBookmarked)}
        onShare={() => console.log('Shared')}
        onComment={() => console.log('Commented')}
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
            onPress={() => navigation.navigate('CreatePost')}
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
                <Text style={[
                  styles.filterText,
                  selectedCategory === category.id && styles.filterTextActive
                ]}>{category.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        }
        data={posts}
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
    marginBottom: 12,
    paddingHorizontal: 16,
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
