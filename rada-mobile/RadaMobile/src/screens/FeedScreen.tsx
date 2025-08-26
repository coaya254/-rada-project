import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface FeedPost {
  id: number;
  user: {
    name: string;
    role: string;
    verified: boolean;
  };
  content: string;
  category: string;
  county: string;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  is_liked: boolean;
}

const FeedScreen: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSamplePosts();
  }, []);

  const loadSamplePosts = () => {
    const samplePosts: FeedPost[] = [
      {
        id: 1,
        user: {
          name: 'Sarah Muthoni',
          role: 'Community Leader',
          verified: true
        },
        content: 'Just completed our community clean-up project in Mathare! 🧹✨ Over 50 youth participated and we collected 200+ bags of waste. This is what community action looks like!',
        category: 'community-service',
        county: 'Nairobi',
        likes: 124,
        comments: 23,
        shares: 8,
        created_at: '2 hours ago',
        is_liked: false
      },
      {
        id: 2,
        user: {
          name: 'David Ochieng',
          role: 'Youth Activist',
          verified: true
        },
        content: 'Important discussion happening tomorrow at the Youth Center about digital literacy programs. We need more young people to get involved in tech! Who\'s coming? 🚀',
        category: 'education',
        county: 'Nairobi',
        likes: 89,
        comments: 15,
        shares: 12,
        created_at: '4 hours ago',
        is_liked: true
      }
    ];
    setPosts(samplePosts);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      loadSamplePosts();
      setRefreshing(false);
    }, 1000);
  };

  const toggleLike = (postId: number) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { ...post, is_liked: !post.is_liked, likes: post.is_liked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const renderPost = (post: FeedPost) => (
    <View key={post.id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#6b7280" />
          </View>
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{post.user.name}</Text>
              {post.user.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#3b82f6" />
              )}
            </View>
            <Text style={styles.userRole}>{post.user.role}</Text>
            <Text style={styles.postTime}>{post.created_at}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleLike(post.id)}
        >
          <Ionicons 
            name={post.is_liked ? "heart" : "heart-outline"} 
            size={20} 
            color={post.is_liked ? "#ef4444" : "#6b7280"} 
          />
          <Text style={[styles.actionText, post.is_liked && styles.likedText]}>
            {post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#6b7280" />
          <Text style={styles.actionText}>{post.shares}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.postFooter}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{post.category}</Text>
        </View>
        <Text style={styles.countyText}>{post.county}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📰 Civic Feed</Text>
        <Text style={styles.headerSubtitle}>
          Discover stories & actions from Kenya's youth
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.map(renderPost)}
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    marginTop: 20,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  postHeader: {
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  userRole: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  postTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  postContent: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  likedText: {
    color: '#ef4444',
  },
  postFooter: {
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  countyText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default FeedScreen;
