import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { CommunityStackParamList } from '../../navigation/CommunityStackNavigator';
import { communityApi } from '../../services/communityApi';
import { Alert } from 'react-native';

interface DiscussionDetailScreenProps {
  navigation: NativeStackNavigationProp<CommunityStackParamList, 'DiscussionDetail'>;
  route: RouteProp<CommunityStackParamList, 'DiscussionDetail'>;
}

interface Reply {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  avatar?: string;
  uuid?: string;
  isOwner?: boolean;
}

interface Discussion {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  timestamp: string;
  likes_count: number;
  replies_count: number;
  views_count: number;
  uuid?: string;
  isOwner?: boolean;
}

export const DiscussionDetailScreen: React.FC<DiscussionDetailScreenProps> = ({ navigation, route }) => {
  const { discussionId } = route.params;
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);

  const [newReply, setNewReply] = useState('');
  const [replyList, setReplyList] = useState<Reply[]>([]);
  const [replyingTo, setReplyingTo] = useState<{ id: number; author: string } | null>(null);

  useEffect(() => {
    loadDiscussion();
  }, [discussionId]);

  const loadDiscussion = async () => {
    try {
      setLoading(true);

      // Fetch discussion details
      const discussionData = await communityApi.getDiscussion(discussionId);

      const userUuid = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';

      setDiscussion({
        id: discussionData.id,
        title: discussionData.title,
        content: discussionData.content,
        category: discussionData.category,
        author: discussionData.nickname || 'Anonymous',
        timestamp: formatTimestamp(discussionData.created_at),
        likes_count: discussionData.likes_count || 0,
        replies_count: discussionData.replies_count || 0,
        views_count: discussionData.views_count || 0,
        uuid: discussionData.uuid,
        isOwner: discussionData.uuid === userUuid,
      });

      // Fetch replies
      const repliesData = await communityApi.getReplies(discussionId);

      const transformedReplies = repliesData.map(reply => ({
        id: reply.id,
        author: reply.nickname || 'Anonymous',
        content: reply.content,
        timestamp: formatTimestamp(reply.created_at),
        likes: reply.likes_count,
        isLiked: false,
        uuid: reply.uuid,
        isOwner: reply.uuid === userUuid,
      }));

      setReplyList(transformedReplies);
      setLoading(false);
    } catch (error) {
      console.error('Error loading discussion:', error);
      Alert.alert('Error', 'Failed to load discussion');
      setLoading(false);
    }
  };

  const handleSubmitReply = async () => {
    if (newReply.trim()) {
      try {
        const userUuid = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';

        // If replying to a specific reply, add mention
        let content = newReply.trim();
        if (replyingTo) {
          content = `@${replyingTo.author} ${content}`;
        }

        await communityApi.addReply(discussionId, {
          uuid: userUuid,
          content: content,
        });

        setNewReply('');
        setReplyingTo(null);

        // Reload the entire discussion to update reply count and get new reply
        await loadDiscussion();
      } catch (error) {
        console.error('Error adding reply:', error);
        Alert.alert('Error', 'Failed to add reply. Please try again.');
      }
    }
  };
  
  // Helper function
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
  
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1d ago';
    return 'Just now';
  };

  const handleLikeReply = async (replyId: number) => {
    try {
      const userUuid = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';
      await communityApi.likeReply(replyId, userUuid);

      setReplyList(replyList.map(reply =>
        reply.id === replyId
          ? {
              ...reply,
              isLiked: !reply.isLiked,
              likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
            }
          : reply
      ));
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    Alert.alert(
      'Delete Reply',
      'Are you sure you want to delete this reply?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const userUuid = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';
              await communityApi.deleteReply(replyId, userUuid);

              // Reload discussion to update counts
              await loadDiscussion();

              Alert.alert('Success', 'Reply deleted successfully');
            } catch (error) {
              console.error('Error deleting reply:', error);
              Alert.alert('Error', 'Failed to delete reply');
            }
          },
        },
      ]
    );
  };

  const handleDeleteDiscussion = async () => {
    Alert.alert(
      'Delete Discussion',
      'Are you sure you want to delete this discussion? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const userUuid = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';
              await communityApi.deleteDiscussion(discussionId, userUuid);

              Alert.alert('Success', 'Discussion deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Error deleting discussion:', error);
              Alert.alert('Error', 'Failed to delete discussion');
            }
          },
        },
      ]
    );
  };

  const handleLikeDiscussion = async () => {
    try {
      const userUuid = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';
      await communityApi.likeDiscussion(discussionId, userUuid);

      // Reload to get updated like count
      await loadDiscussion();
    } catch (error) {
      console.error('Error liking discussion:', error);
    }
  };

  const handleShareDiscussion = async () => {
    try {
      await Share.share({
        message: `${discussion?.title}\n\n${discussion?.content}\n\nShared from Rada Community`,
        title: discussion?.title,
      });
    } catch (error) {
      console.error('Error sharing discussion:', error);
    }
  };

  const handleShareReply = async (reply: Reply) => {
    try {
      await Share.share({
        message: `${reply.author} replied: ${reply.content}\n\nShared from Rada Community`,
        title: `Reply by ${reply.author}`,
      });
    } catch (error) {
      console.error('Error sharing reply:', error);
    }
  };

  const renderReply = ({ item }: { item: Reply }) => (
    <View style={styles.replyCard}>
      <View style={styles.replyHeader}>
        <View style={styles.replyAuthor}>
          <View style={styles.replyAvatar}>
            <Text style={styles.replyAvatarText}>
              {item.author.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </Text>
          </View>
          <View style={styles.replyInfo}>
            <TouchableOpacity
              onPress={() => navigation.navigate('UserProfile', {
                userId: item.uuid || '',
                userName: item.author
              })}
            >
              <Text style={styles.replyAuthorName}>{item.author}</Text>
            </TouchableOpacity>
            <Text style={styles.replyTimestamp}>{item.timestamp}</Text>
          </View>
        </View>
        {item.isOwner && (
          <TouchableOpacity
            style={styles.replyOptions}
            onPress={() => handleDeleteReply(item.id)}
          >
            <MaterialIcons name="delete" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.replyContent}>{item.content}</Text>

      <View style={styles.replyActions}>
        <TouchableOpacity
          style={[styles.replyAction, item.isLiked && styles.replyActionLiked]}
          onPress={() => handleLikeReply(item.id)}
        >
          <MaterialIcons
            name={item.isLiked ? 'favorite' : 'favorite-border'}
            size={18}
            color={item.isLiked ? '#EF4444' : '#666'}
          />
          <Text style={[styles.replyActionText, item.isLiked && styles.replyActionTextLiked]}>
            {item.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.replyAction}
          onPress={() => {
            setReplyingTo({ id: item.id, author: item.author });
            // Focus input (we'll scroll to it)
          }}
        >
          <MaterialIcons name="reply" size={18} color="#666" />
          <Text style={styles.replyActionText}>Reply</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.replyAction}
          onPress={() => handleShareReply(item)}
        >
          <MaterialIcons name="share" size={18} color="#666" />
          <Text style={styles.replyActionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading || !discussion) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading discussion...</Text>
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
          <Text style={styles.headerTitle}>Discussion</Text>
          <Text style={styles.headerSubtitle}>{discussion.category}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {discussion.isOwner && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteDiscussion}
            >
              <MaterialIcons name="delete" size={24} color="#EF4444" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareDiscussion}
          >
            <MaterialIcons name="share" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Original Post */}
          <View style={styles.originalPost}>
            <View style={styles.postHeader}>
              <View style={styles.postAuthor}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorAvatarText}>
                    {discussion.author.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </Text>
                </View>
                <View style={styles.authorInfo}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('UserProfile', {
                      userId: discussion.uuid || '',
                      userName: discussion.author
                    })}
                  >
                    <Text style={styles.authorName}>{discussion.author}</Text>
                  </TouchableOpacity>
                  <Text style={styles.postTimestamp}>{discussion.timestamp}</Text>
                </View>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{discussion.category}</Text>
              </View>
            </View>

            <Text style={styles.postTitle}>{discussion.title}</Text>
            <Text style={styles.postContent}>
              {discussion.content}
            </Text>

            <View style={styles.postStats}>
              <View style={styles.statItem}>
                <MaterialIcons name="forum" size={20} color="#3B82F6" />
                <Text style={styles.statText}>{discussion.replies_count} replies</Text>
              </View>
              <TouchableOpacity
                style={styles.statItem}
                onPress={handleLikeDiscussion}
              >
                <MaterialIcons name="favorite" size={20} color="#EF4444" />
                <Text style={styles.statText}>{discussion.likes_count} likes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Replies Section */}
          <View style={styles.repliesSection}>
            <Text style={styles.repliesTitle}>Replies ({replyList.length})</Text>
            <FlatList
              data={replyList}
              renderItem={renderReply}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>

        {/* Reply Input */}
        <View style={styles.replyInputContainer}>
          {replyingTo && (
            <View style={styles.replyingToBar}>
              <MaterialIcons name="reply" size={16} color="#3B82F6" />
              <Text style={styles.replyingToText}>Replying to {replyingTo.author}</Text>
              <TouchableOpacity
                onPress={() => setReplyingTo(null)}
                style={styles.cancelReplyButton}
              >
                <MaterialIcons name="close" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.replyInputContent}>
            <TextInput
              style={styles.replyInput}
              placeholder={replyingTo ? `Reply to ${replyingTo.author}...` : "Add your reply..."}
              value={newReply}
              onChangeText={setNewReply}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.submitButton, !newReply.trim() && styles.submitButtonDisabled]}
              onPress={handleSubmitReply}
              disabled={!newReply.trim()}
            >
              <MaterialIcons
                name="send"
                size={20}
                color={newReply.trim() ? '#FFFFFF' : '#9CA3AF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  originalPost: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  postTimestamp: {
    fontSize: 14,
    color: '#666',
  },
  categoryBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  postStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  repliesSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  replyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  replyAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  replyAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  replyInfo: {
    flex: 1,
  },
  replyAuthorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  replyTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  replyOptions: {
    padding: 4,
  },
  replyContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  replyActions: {
    flexDirection: 'row',
    gap: 20,
  },
  replyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyActionLiked: {
    opacity: 1,
  },
  replyActionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  replyActionTextLiked: {
    color: '#EF4444',
    fontWeight: '600',
  },
  replyInputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  replyingToBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
  },
  replyingToText: {
    flex: 1,
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  cancelReplyButton: {
    padding: 4,
  },
  replyInputContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f8f9fa',
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#e9ecef',
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
});