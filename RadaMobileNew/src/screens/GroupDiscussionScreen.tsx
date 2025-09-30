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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import { DiscussionPost, DiscussionReply } from '../types/SocialTypes';
import apiService from '../services/api';

const { width, height } = Dimensions.get('window');

const GroupDiscussionScreen: React.FC<any> = ({ route, navigation }) => {
  const { user } = useAnonMode();
  const { groupId, groupName } = route.params;
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'question' | 'discussion' | 'resource'>('discussion');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const filters = [
    { key: 'all', label: 'All Posts', icon: 'list' },
    { key: 'questions', label: 'Questions', icon: 'question-circle' },
    { key: 'discussions', label: 'Discussions', icon: 'comments' },
    { key: 'resources', label: 'Resources', icon: 'bookmark' },
    { key: 'pinned', label: 'Pinned', icon: 'thumbtack' },
  ];

  const postTypes = [
    { key: 'question', label: 'Question', icon: 'question-circle', color: '#3b82f6' },
    { key: 'discussion', label: 'Discussion', icon: 'comments', color: '#10b981' },
    { key: 'resource', label: 'Resource', icon: 'bookmark', color: '#f59e0b' },
  ];

  useEffect(() => {
    loadPosts();
    animateIn();
  }, []);

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

  const loadPosts = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with API call
      const mockPosts: DiscussionPost[] = [
        {
          id: '1',
          groupId: groupId,
          authorId: 'user1',
          authorUsername: 'LegalEagle',
          authorAvatar: '👨‍⚖️',
          title: 'What are the key principles of constitutional interpretation?',
          content: 'I\'m studying for my constitutional law exam and would love to understand the different approaches to interpreting the constitution. Can anyone share their insights on originalism vs living constitutionalism?',
          type: 'question',
          tags: ['constitution', 'interpretation', 'law'],
          createdAt: '2024-01-20T10:30:00Z',
          updatedAt: '2024-01-20T10:30:00Z',
          likes: 12,
          replies: 8,
          views: 45,
          isLiked: false,
          isPinned: true,
          isResolved: false,
        },
        {
          id: '2',
          groupId: groupId,
          authorId: 'user2',
          authorUsername: 'CivicLeader',
          authorAvatar: '👩‍💼',
          title: 'Interesting article on civic engagement trends',
          content: 'Found this great article about how young people are engaging with civic processes differently. The data shows some fascinating patterns in participation rates across different demographics.',
          type: 'resource',
          tags: ['civic', 'engagement', 'research'],
          createdAt: '2024-01-19T15:45:00Z',
          updatedAt: '2024-01-19T15:45:00Z',
          likes: 7,
          replies: 3,
          views: 28,
          isLiked: true,
          isPinned: false,
          isResolved: false,
        },
        {
          id: '3',
          groupId: groupId,
          authorId: 'user3',
          authorUsername: 'RightsAdvocate',
          authorAvatar: '👨‍🎓',
          title: 'Discussion: Balancing individual rights with collective responsibilities',
          content: 'This is a complex topic that comes up often in our studies. How do we balance the rights of individuals with the needs of the community? I\'d love to hear different perspectives on this.',
          type: 'discussion',
          tags: ['rights', 'responsibilities', 'philosophy'],
          createdAt: '2024-01-18T09:15:00Z',
          updatedAt: '2024-01-18T09:15:00Z',
          likes: 15,
          replies: 12,
          views: 67,
          isLiked: false,
          isPinned: false,
          isResolved: false,
        },
      ];
      
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load discussion posts');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleLikePost = async (postId: string) => {
    try {
      // API call to like/unlike post
      // await apiService.likePost(postId);
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked, 
              likes: post.isLiked ? post.likes - 1 : post.likes + 1 
            }
          : post
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    try {
      const newPost: DiscussionPost = {
        id: Date.now().toString(),
        groupId: groupId,
        authorId: user?.uuid || 'current_user',
        authorUsername: user?.username || 'You',
        authorAvatar: '👤',
        title: newPostTitle,
        content: newPostContent,
        type: newPostType,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        replies: 0,
        views: 0,
        isLiked: false,
        isPinned: false,
        isResolved: false,
      };

      // API call to create post
      // await apiService.createPost(newPost);
      
      setPosts(prev => [newPost, ...prev]);
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreateModal(false);
      
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const getFilteredPosts = () => {
    switch (selectedFilter) {
      case 'questions':
        return posts.filter(post => post.type === 'question');
      case 'discussions':
        return posts.filter(post => post.type === 'discussion');
      case 'resources':
        return posts.filter(post => post.type === 'resource');
      case 'pinned':
        return posts.filter(post => post.isPinned);
      default:
        return posts;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderPostCard = (post: DiscussionPost) => (
    <Animated.View
      key={post.id}
      style={[styles.postCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.cardGradient}
        >
          {/* Post Header */}
          <View style={styles.postHeader}>
            <View style={styles.authorInfo}>
              <Text style={styles.authorAvatar}>{post.authorAvatar}</Text>
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{post.authorUsername}</Text>
                <Text style={styles.postTime}>{formatTimeAgo(post.createdAt)}</Text>
              </View>
            </View>
            <View style={styles.postActions}>
              {post.isPinned && (
                <Icon name="thumbtack" size={14} color="#f59e0b" />
              )}
              {post.type === 'question' && (
                <Icon name="question-circle" size={14} color="#3b82f6" />
              )}
            </View>
          </View>

          {/* Post Content */}
          <Text style={styles.postTitle} numberOfLines={2}>
            {post.title}
          </Text>
          <Text style={styles.postContent} numberOfLines={3}>
            {post.content}
          </Text>

          {/* Post Tags */}
          {post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Post Stats */}
          <View style={styles.postStats}>
            <TouchableOpacity
              style={styles.statButton}
              onPress={() => handleLikePost(post.id)}
            >
              <Icon
                name={post.isLiked ? 'heart' : 'heart-o'}
                size={16}
                color={post.isLiked ? '#ef4444' : '#64748b'}
              />
              <Text style={[styles.statText, post.isLiked && styles.likedText]}>
                {post.likes}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.statButton}>
              <Icon name="comment-o" size={16} color="#64748b" />
              <Text style={styles.statText}>{post.replies}</Text>
            </View>
            
            <View style={styles.statButton}>
              <Icon name="eye" size={16} color="#64748b" />
              <Text style={styles.statText}>{post.views}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity onPress={handleCreatePost}>
              <Text style={styles.modalCreateText}>Post</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {/* Post Type Selection */}
            <Text style={styles.inputLabel}>Post Type</Text>
            <View style={styles.typeSelector}>
              {postTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeOption,
                    newPostType === type.key && styles.selectedTypeOption,
                    { borderColor: type.color }
                  ]}
                  onPress={() => setNewPostType(type.key as any)}
                >
                  <Icon
                    name={type.icon as any}
                    size={16}
                    color={newPostType === type.key ? type.color : '#64748b'}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      newPostType === type.key && { color: type.color }
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title Input */}
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter post title..."
              value={newPostTitle}
              onChangeText={setNewPostTitle}
              placeholderTextColor="#94a3b8"
            />

            {/* Content Input */}
            <Text style={styles.inputLabel}>Content</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Share your thoughts, questions, or resources..."
              value={newPostContent}
              onChangeText={setNewPostContent}
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading discussions...</Text>
      </View>
    );
  }

  const filteredPosts = getFilteredPosts();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{groupName}</Text>
          <Text style={styles.headerSubtitle}>Discussion</Text>
        </View>
        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addButton}>
          <Icon name="plus" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Icon
              name={filter.icon as any}
              size={16}
              color={selectedFilter === filter.key ? '#667eea' : '#64748b'}
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.activeFilterText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="comments" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No posts found</Text>
            <Text style={styles.emptyDescription}>
              Be the first to start a discussion in this group!
            </Text>
          </View>
        ) : (
          filteredPosts.map(renderPostCard)
        )}
      </ScrollView>

      {renderCreateModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  addButton: {
    padding: 8,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeFilterTab: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
  },
  filterText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#667eea',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  postCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  postTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  likedText: {
    color: '#ef4444',
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
  modalContent: {
    flex: 1,
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
  modalCreateText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'white',
  },
  selectedTypeOption: {
    backgroundColor: '#f1f5f9',
  },
  typeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  titleInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  contentInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 120,
    textAlignVertical: 'top',
  },
});

export default GroupDiscussionScreen;

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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import { DiscussionPost, DiscussionReply } from '../types/SocialTypes';
import apiService from '../services/api';

const { width, height } = Dimensions.get('window');

const GroupDiscussionScreen: React.FC<any> = ({ route, navigation }) => {
  const { user } = useAnonMode();
  const { groupId, groupName } = route.params;
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'question' | 'discussion' | 'resource'>('discussion');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const filters = [
    { key: 'all', label: 'All Posts', icon: 'list' },
    { key: 'questions', label: 'Questions', icon: 'question-circle' },
    { key: 'discussions', label: 'Discussions', icon: 'comments' },
    { key: 'resources', label: 'Resources', icon: 'bookmark' },
    { key: 'pinned', label: 'Pinned', icon: 'thumbtack' },
  ];

  const postTypes = [
    { key: 'question', label: 'Question', icon: 'question-circle', color: '#3b82f6' },
    { key: 'discussion', label: 'Discussion', icon: 'comments', color: '#10b981' },
    { key: 'resource', label: 'Resource', icon: 'bookmark', color: '#f59e0b' },
  ];

  useEffect(() => {
    loadPosts();
    animateIn();
  }, []);

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

  const loadPosts = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with API call
      const mockPosts: DiscussionPost[] = [
        {
          id: '1',
          groupId: groupId,
          authorId: 'user1',
          authorUsername: 'LegalEagle',
          authorAvatar: '👨‍⚖️',
          title: 'What are the key principles of constitutional interpretation?',
          content: 'I\'m studying for my constitutional law exam and would love to understand the different approaches to interpreting the constitution. Can anyone share their insights on originalism vs living constitutionalism?',
          type: 'question',
          tags: ['constitution', 'interpretation', 'law'],
          createdAt: '2024-01-20T10:30:00Z',
          updatedAt: '2024-01-20T10:30:00Z',
          likes: 12,
          replies: 8,
          views: 45,
          isLiked: false,
          isPinned: true,
          isResolved: false,
        },
        {
          id: '2',
          groupId: groupId,
          authorId: 'user2',
          authorUsername: 'CivicLeader',
          authorAvatar: '👩‍💼',
          title: 'Interesting article on civic engagement trends',
          content: 'Found this great article about how young people are engaging with civic processes differently. The data shows some fascinating patterns in participation rates across different demographics.',
          type: 'resource',
          tags: ['civic', 'engagement', 'research'],
          createdAt: '2024-01-19T15:45:00Z',
          updatedAt: '2024-01-19T15:45:00Z',
          likes: 7,
          replies: 3,
          views: 28,
          isLiked: true,
          isPinned: false,
          isResolved: false,
        },
        {
          id: '3',
          groupId: groupId,
          authorId: 'user3',
          authorUsername: 'RightsAdvocate',
          authorAvatar: '👨‍🎓',
          title: 'Discussion: Balancing individual rights with collective responsibilities',
          content: 'This is a complex topic that comes up often in our studies. How do we balance the rights of individuals with the needs of the community? I\'d love to hear different perspectives on this.',
          type: 'discussion',
          tags: ['rights', 'responsibilities', 'philosophy'],
          createdAt: '2024-01-18T09:15:00Z',
          updatedAt: '2024-01-18T09:15:00Z',
          likes: 15,
          replies: 12,
          views: 67,
          isLiked: false,
          isPinned: false,
          isResolved: false,
        },
      ];
      
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load discussion posts');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleLikePost = async (postId: string) => {
    try {
      // API call to like/unlike post
      // await apiService.likePost(postId);
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked, 
              likes: post.isLiked ? post.likes - 1 : post.likes + 1 
            }
          : post
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    try {
      const newPost: DiscussionPost = {
        id: Date.now().toString(),
        groupId: groupId,
        authorId: user?.uuid || 'current_user',
        authorUsername: user?.username || 'You',
        authorAvatar: '👤',
        title: newPostTitle,
        content: newPostContent,
        type: newPostType,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        replies: 0,
        views: 0,
        isLiked: false,
        isPinned: false,
        isResolved: false,
      };

      // API call to create post
      // await apiService.createPost(newPost);
      
      setPosts(prev => [newPost, ...prev]);
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreateModal(false);
      
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const getFilteredPosts = () => {
    switch (selectedFilter) {
      case 'questions':
        return posts.filter(post => post.type === 'question');
      case 'discussions':
        return posts.filter(post => post.type === 'discussion');
      case 'resources':
        return posts.filter(post => post.type === 'resource');
      case 'pinned':
        return posts.filter(post => post.isPinned);
      default:
        return posts;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderPostCard = (post: DiscussionPost) => (
    <Animated.View
      key={post.id}
      style={[styles.postCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.cardGradient}
        >
          {/* Post Header */}
          <View style={styles.postHeader}>
            <View style={styles.authorInfo}>
              <Text style={styles.authorAvatar}>{post.authorAvatar}</Text>
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{post.authorUsername}</Text>
                <Text style={styles.postTime}>{formatTimeAgo(post.createdAt)}</Text>
              </View>
            </View>
            <View style={styles.postActions}>
              {post.isPinned && (
                <Icon name="thumbtack" size={14} color="#f59e0b" />
              )}
              {post.type === 'question' && (
                <Icon name="question-circle" size={14} color="#3b82f6" />
              )}
            </View>
          </View>

          {/* Post Content */}
          <Text style={styles.postTitle} numberOfLines={2}>
            {post.title}
          </Text>
          <Text style={styles.postContent} numberOfLines={3}>
            {post.content}
          </Text>

          {/* Post Tags */}
          {post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Post Stats */}
          <View style={styles.postStats}>
            <TouchableOpacity
              style={styles.statButton}
              onPress={() => handleLikePost(post.id)}
            >
              <Icon
                name={post.isLiked ? 'heart' : 'heart-o'}
                size={16}
                color={post.isLiked ? '#ef4444' : '#64748b'}
              />
              <Text style={[styles.statText, post.isLiked && styles.likedText]}>
                {post.likes}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.statButton}>
              <Icon name="comment-o" size={16} color="#64748b" />
              <Text style={styles.statText}>{post.replies}</Text>
            </View>
            
            <View style={styles.statButton}>
              <Icon name="eye" size={16} color="#64748b" />
              <Text style={styles.statText}>{post.views}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity onPress={handleCreatePost}>
              <Text style={styles.modalCreateText}>Post</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {/* Post Type Selection */}
            <Text style={styles.inputLabel}>Post Type</Text>
            <View style={styles.typeSelector}>
              {postTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeOption,
                    newPostType === type.key && styles.selectedTypeOption,
                    { borderColor: type.color }
                  ]}
                  onPress={() => setNewPostType(type.key as any)}
                >
                  <Icon
                    name={type.icon as any}
                    size={16}
                    color={newPostType === type.key ? type.color : '#64748b'}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      newPostType === type.key && { color: type.color }
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title Input */}
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter post title..."
              value={newPostTitle}
              onChangeText={setNewPostTitle}
              placeholderTextColor="#94a3b8"
            />

            {/* Content Input */}
            <Text style={styles.inputLabel}>Content</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Share your thoughts, questions, or resources..."
              value={newPostContent}
              onChangeText={setNewPostContent}
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading discussions...</Text>
      </View>
    );
  }

  const filteredPosts = getFilteredPosts();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{groupName}</Text>
          <Text style={styles.headerSubtitle}>Discussion</Text>
        </View>
        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addButton}>
          <Icon name="plus" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Icon
              name={filter.icon as any}
              size={16}
              color={selectedFilter === filter.key ? '#667eea' : '#64748b'}
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.activeFilterText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="comments" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No posts found</Text>
            <Text style={styles.emptyDescription}>
              Be the first to start a discussion in this group!
            </Text>
          </View>
        ) : (
          filteredPosts.map(renderPostCard)
        )}
      </ScrollView>

      {renderCreateModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  addButton: {
    padding: 8,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeFilterTab: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
  },
  filterText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#667eea',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  postCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  postTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  likedText: {
    color: '#ef4444',
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
  modalContent: {
    flex: 1,
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
  modalCreateText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'white',
  },
  selectedTypeOption: {
    backgroundColor: '#f1f5f9',
  },
  typeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  titleInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  contentInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 120,
    textAlignVertical: 'top',
  },
});

export default GroupDiscussionScreen;
