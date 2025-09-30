import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { CommunityStackParamList } from '../../navigation/CommunityStackNavigator';

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
}

export const DiscussionDetailScreen: React.FC<DiscussionDetailScreenProps> = ({ navigation, route }) => {
  const { discussionId, title, author, timestamp, replies, category } = route.params;

  const [newReply, setNewReply] = useState('');
  const [replyList, setReplyList] = useState<Reply[]>([
    {
      id: 1,
      author: 'Sarah Chen',
      content: 'This is a really important topic. I think we need more transparency in how these decisions are made.',
      timestamp: '2h ago',
      likes: 12,
      isLiked: false,
    },
    {
      id: 2,
      author: 'Mike Johnson',
      content: 'I agree with the points made here. Has anyone looked into the historical context of similar policies?',
      timestamp: '1h ago',
      likes: 8,
      isLiked: true,
    },
    {
      id: 3,
      author: 'Lisa Rodriguez',
      content: 'Great discussion everyone! I found some additional resources that might be helpful. Let me know if you want me to share them.',
      timestamp: '45m ago',
      likes: 15,
      isLiked: false,
    },
  ]);

  const handleSubmitReply = () => {
    if (newReply.trim()) {
      const reply: Reply = {
        id: replyList.length + 1,
        author: 'You',
        content: newReply.trim(),
        timestamp: 'Just now',
        likes: 0,
        isLiked: false,
      };
      setReplyList([...replyList, reply]);
      setNewReply('');
    }
  };

  const handleLikeReply = (replyId: number) => {
    setReplyList(replyList.map(reply =>
      reply.id === replyId
        ? {
            ...reply,
            isLiked: !reply.isLiked,
            likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
          }
        : reply
    ));
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
                userId: item.id,
                username: item.author
              })}
            >
              <Text style={styles.replyAuthorName}>{item.author}</Text>
            </TouchableOpacity>
            <Text style={styles.replyTimestamp}>{item.timestamp}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.replyOptions}>
          <MaterialIcons name="more-vert" size={20} color="#666" />
        </TouchableOpacity>
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

        <TouchableOpacity style={styles.replyAction}>
          <MaterialIcons name="reply" size={18} color="#666" />
          <Text style={styles.replyActionText}>Reply</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.replyAction}>
          <MaterialIcons name="share" size={18} color="#666" />
          <Text style={styles.replyActionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
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
          <Text style={styles.headerTitle}>Discussion</Text>
          <Text style={styles.headerSubtitle}>{category}</Text>
        </View>
        <TouchableOpacity style={styles.shareButton}>
          <MaterialIcons name="share" size={24} color="#333" />
        </TouchableOpacity>
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
                    {author.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </Text>
                </View>
                <View style={styles.authorInfo}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('UserProfile', {
                      userId: 1,
                      username: author
                    })}
                  >
                    <Text style={styles.authorName}>{author}</Text>
                  </TouchableOpacity>
                  <Text style={styles.postTimestamp}>{timestamp}</Text>
                </View>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            </View>

            <Text style={styles.postTitle}>{title}</Text>
            <Text style={styles.postContent}>
              This is the main content of the discussion post. It would contain the full text of what the user originally posted, including their thoughts, questions, or topics they want to discuss with the community.
            </Text>

            <View style={styles.postStats}>
              <View style={styles.statItem}>
                <MaterialIcons name="forum" size={20} color="#3B82F6" />
                <Text style={styles.statText}>{replyList.length} replies</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="visibility" size={20} color="#10B981" />
                <Text style={styles.statText}>234 views</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="favorite" size={20} color="#EF4444" />
                <Text style={styles.statText}>18 likes</Text>
              </View>
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
          <View style={styles.replyInputContent}>
            <TextInput
              style={styles.replyInput}
              placeholder="Add your reply..."
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
    paddingVertical: 16,
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
});