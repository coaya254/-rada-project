
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Vibration,
  Dimensions,
  StyleSheet,
  TextInput,
  Share,
  Alert,
  Image,
} from 'react-native';
import apiService from '../services/api';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  Volume2, 
  Clock 
} from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface SocialMediaCardProps {
  postData: any;
  onLike?: (postId: string, isLiked?: boolean) => void;
  onBookmark?: (postId: string, isBookmarked?: boolean) => void;
  onShare?: (postId: string) => void;
  onComment?: (postId: string, commentText?: string) => void;
}

export default function SocialMediaCard({ postData, onLike, onBookmark, onShare, onComment }: SocialMediaCardProps) {
  const [liked, setLiked] = useState(postData?.isLiked || false);
  const [bookmarked, setBookmarked] = useState(postData?.isBookmarked || false);
  const [likes, setLikes] = useState(postData?.likes || 0);
  const [comments, setComments] = useState(postData?.comments || 0);
  const [shares, setShares] = useState(postData?.shares || 0);
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{id: number, author: string} | null>(null);
  const [replyText, setReplyText] = useState('');
  const [commentsList, setCommentsList] = useState([
    {
      id: 1,
      author: 'Anonymous User',
      avatar: '👤',
      text: 'Great post! Thanks for sharing this insight.',
      time: '2h ago',
      isOwn: false,
      likes: 3,
      isLiked: false,
      replies: [
        {
          id: 11,
          author: 'You',
          avatar: '🌸',
          text: 'Thank you!',
          time: '1h ago',
          isOwn: true,
          likes: 1,
          isLiked: false
        }
      ]
    },
    {
      id: 2,
      author: 'Community Member',
      avatar: '🌟',
      text: 'This is really helpful information!',
      time: '1h ago',
      isOwn: false,
      likes: 5,
      isLiked: true,
      replies: []
    }
  ]);


  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const likeAnim = useRef(new Animated.Value(1)).current;
  const bookmarkAnim = useRef(new Animated.Value(1)).current;

  // Touch handling
  const lastTap = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Interactive functions
  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev: number) => newLiked ? prev + 1 : prev - 1);
    
    // Animate heart
    Animated.sequence([
      Animated.timing(likeAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Haptic feedback
    Vibration.vibrate(50);
    
    // Call parent callback
    if (onLike) {
      onLike(post.id.toString(), newLiked);
    }
  };

  const handleBookmark = () => {
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    
    // Animate bookmark
    Animated.sequence([
      Animated.timing(bookmarkAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bookmarkAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Haptic feedback
    Vibration.vibrate(30);
    
    // Call parent callback
    if (onBookmark) {
      onBookmark(post.id.toString(), newBookmarked);
    }
  };

  const handleShare = async () => {
    try {
      const shareContent = {
        title: post.title || 'Check out this post',
        message: `${post.title}\n\n${post.content}\n\nShared from Rada.ke Community`,
        url: `https://rada.ke/post/${post.id}` // You can replace with actual URL
      };

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        setShares((prev: number) => prev + 1);
        
        // Haptic feedback
        Vibration.vibrate(50);
        
        // Call parent callback
        if (onShare) {
          onShare(post.id.toString());
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share post');
    }
  };

  const handleComment = () => {
    setShowComments(!showComments);
    
    // Haptic feedback
    Vibration.vibrate(30);
    
    // Call parent callback
    if (onComment) {
      onComment(post.id.toString());
    }
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now(),
        author: 'You',
        avatar: '🌸',
        text: commentText.trim(),
        time: 'now',
        isOwn: true,
        likes: 0,
        isLiked: false,
        replies: []
      };
      
      setCommentsList((prev: any[]) => [newComment, ...prev]);
      setComments((prev: number) => prev + 1);
      setCommentText('');
      
      // Haptic feedback
      Vibration.vibrate(50);
      
      // Call parent callback
      if (onComment) {
        onComment(post.id.toString(), commentText.trim());
      }
    }
  };

  const handleDeleteComment = (commentId: number) => {
    setCommentsList((prev: any[]) => prev.filter(comment => comment.id !== commentId));
    setComments((prev: number) => prev - 1);
    
    // Haptic feedback
    Vibration.vibrate(30);
  };

  const handleLikeComment = async (commentId: number, isLiked: boolean) => {
    try {
      const action = isLiked ? 'unlike' : 'like';
      await apiService.likeComment(commentId, action);
      
      setCommentsList((prev: any[]) => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !isLiked,
            likes: isLiked ? comment.likes - 1 : comment.likes + 1
          };
        }
        return comment;
      }));
      
      Vibration.vibrate(50);
    } catch (error) {
      console.error('Error liking comment:', error);
      Alert.alert('Error', 'Failed to like comment');
    }
  };

  const handleReplyToComment = (commentId: number, author: string) => {
    setReplyingTo({ id: commentId, author });
    setReplyText('');
  };

  const handleAddReply = async () => {
    if (!replyText.trim() || !replyingTo) return;
    
    try {
      await apiService.replyToComment(post.id, replyText.trim(), replyingTo.id);
      
      const newReply = {
        id: Date.now(),
        author: 'You',
        avatar: '🌸',
        text: replyText.trim(),
        time: 'now',
        isOwn: true,
        likes: 0,
        isLiked: false
      };
      
      setCommentsList((prev: any[]) => prev.map((comment: any) => {
        if (comment.id === replyingTo.id) {
          return {
            ...comment,
            replies: [newReply, ...comment.replies]
          };
        }
        return comment;
      }));
      
      setReplyText('');
      setReplyingTo(null);
      Vibration.vibrate(50);
    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert('Error', 'Failed to add reply');
    }
  };

  // Use the actual post data passed from the parent component with safety checks
  const post = postData ? {
    id: postData.id || 1,
    user: {
      name: postData.user?.name || 'Anonymous User',
      avatar: postData.user?.avatar || '👤',
      handle: postData.user?.handle || '@anonymous'
    },
    content: postData.content || 'No content available',
    title: postData.title || 'No title',
    fullContent: postData.fullContent || postData.content || 'No content available',
    category: postData.category || 'story',
    timestamp: postData.timestamp || 'Recently',
    comments: postData.comments || 0,
    shares: postData.shares || 0,
    readTime: postData.readTime || '1 min read',
    hasVoiceNote: postData.hasVoiceNote || false,
    voiceDuration: postData.voiceDuration || null,
    topReplies: postData.topReplies || []
  } : {
    id: 1,
    user: { 
      name: 'Anonymous User', 
      avatar: '👤', 
      handle: '@anonymous' 
    },
    content: 'No content available',
    title: 'No title',
    fullContent: 'No content available',
    category: 'story',
    timestamp: 'Recently',
    comments: 0,
    shares: 0,
    readTime: '1 min read',
    hasVoiceNote: false,
    voiceDuration: null,
    topReplies: []
  };

  // Find content break point for "Read more" - exactly like original
  const shouldShowReadMore = post.fullContent && post.content && post.fullContent.length > post.content.length;
  const displayContent = expanded ? (post.fullContent || post.content) : (post.content || '');

  // Haptic feedback
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    const patterns: { [key: string]: number[] } = {
      light: [10],
      medium: [50],
      heavy: [100, 50, 100]
    };
    Vibration.vibrate(patterns[type]);
  };

  // Double tap to like
  const handleDoubleTap = () => {
    const now = Date.now();
    const timeDiff = now - lastTap.current;
    
    if (timeDiff < 300) {
      if (!liked) {
        toggleLike();
      }
    }
    lastTap.current = now;
  };

  // Long press for options
  const handlePressIn = () => {
    longPressTimer.current = setTimeout(() => {
      setShowOptions(true);
      triggerHaptic('medium');
    }, 800);
  };

  const handlePressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    triggerHaptic('light');
    
    // Like animation - exactly like original
    Animated.sequence([
      Animated.timing(likeAnim, {
        toValue: 1.02,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    
    onLike && onLike(post.id.toString(), !liked);
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    triggerHaptic('light');
    
    // Bookmark animation - exactly like original
    Animated.sequence([
      Animated.timing(bookmarkAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(bookmarkAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    
    onBookmark && onBookmark(post.id.toString(), !bookmarked);
  };



  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={0.95}
        onPress={handleDoubleTap}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View 
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Post Header - exactly matching original layout */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                {post.user.avatar && post.user.avatar.startsWith('http') ? (
                  <Image 
                    source={{ uri: post.user.avatar }} 
                    style={styles.avatarImage}
                    onError={() => console.log('Failed to load avatar:', post.user.avatar)}
                  />
                ) : (
                  <Text style={styles.avatarText}>{post.user.avatar || '👤'}</Text>
                )}
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{post.user.name}</Text>
                <View style={styles.metaInfo}>
                  <Text style={styles.userHandle}>{post.user.handle} • {post.timestamp}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.headerRight}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>🏛️ {post.category}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowOptions(true)}
                style={styles.moreButton}
              >
                <MoreHorizontal size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Voice note - exactly like original */}
            {post.hasVoiceNote && (
          <View style={styles.postMeta}>
              <TouchableOpacity style={styles.voiceNote}>
                <Volume2 size={12} color="#3b82f6" />
                <Text style={styles.voiceText}>{post.voiceDuration}</Text>
              </TouchableOpacity>
          </View>
            )}

          {/* Post Content - exactly matching original */}
          <View style={styles.content}>
            {/* Post Title - exactly like original with left border and yellow bg */}
            <View style={[styles.titleContainer, (post as any).highlightColor && { backgroundColor: (post as any).highlightColor + '20' }]}>
              <Text style={styles.title}>"{post.title}"</Text>
            </View>
            
            <Text style={styles.postText}>
              {displayContent}
              {shouldShowReadMore && !expanded && (
                <Text 
                  style={styles.readMore}
                  onPress={() => setExpanded(true)}
                >
                  ...Read more
                </Text>
              )}
            </Text>
            
            {expanded && (
              <TouchableOpacity onPress={() => setExpanded(false)}>
                <Text style={styles.showLess}>Show less</Text>
              </TouchableOpacity>
            )}
            
            {/* Action Buttons - exactly matching original layout */}
            <View style={styles.actions}>
              <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
                <TouchableOpacity 
                  onPress={handleLike}
                  style={[styles.actionButton, liked && styles.likedButton]}
                >
                  <Heart 
                    size={20} 
                    color={liked ? '#ec4899' : '#6b7280'}
                    fill={liked ? '#ec4899' : 'none'}
                  />
                  <Text style={[styles.actionText, liked && styles.likedText]}>{likes}</Text>
                </TouchableOpacity>
              </Animated.View>
              
              <TouchableOpacity 
                onPress={handleComment}
                style={styles.actionButton}
              >
                <MessageCircle size={20} color="#6b7280" />
                <Text style={styles.actionText}>{comments}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleShare}
                style={styles.actionButton}
              >
                <Share2 size={20} color="#6b7280" />
                <Text style={styles.actionText}>{shares}</Text>
              </TouchableOpacity>
              
              <Animated.View style={{ transform: [{ scale: bookmarkAnim }] }}>
                <TouchableOpacity 
                  onPress={handleBookmark}
                  style={[styles.bookmarkButton, bookmarked && styles.bookmarkedButton]}
                >
                  <Bookmark 
                    size={20} 
                    color={bookmarked ? '#3b82f6' : '#6b7280'}
                    fill={bookmarked ? '#3b82f6' : 'none'}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>

            {/* Comments Modal - Bottom Sheet Style */}
      <Modal
        visible={showComments}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowComments(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.commentsModal}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Comments ({comments})</Text>
              <TouchableOpacity 
                onPress={() => setShowComments(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Comments List */}
            <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
              {commentsList.map((comment: any) => (
                <View key={comment.id}>
                  {/* Main Comment */}
                  <View style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    {comment.avatar && comment.avatar.startsWith('http') ? (
                      <Image 
                        source={{ uri: comment.avatar }} 
                        style={styles.commentAvatarImage}
                        onError={() => console.log('Failed to load comment avatar:', comment.avatar)}
                      />
                    ) : (
                      <Text style={styles.commentAvatarText}>{comment.avatar || '👤'}</Text>
                    )}
                  </View>
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{comment.author}</Text>
                      {comment.isOwn && (
                        <TouchableOpacity 
                          onPress={() => handleDeleteComment(comment.id)}
                          style={styles.deleteCommentButton}
                        >
                          <Text style={styles.deleteCommentText}>🗑️</Text>
                        </TouchableOpacity>
                      )}
                  </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                      <View style={styles.commentActions}>
                        <Text style={styles.commentTime}>{comment.time}</Text>
                        <View style={styles.commentActionButtons}>
                          <TouchableOpacity 
                            onPress={() => handleLikeComment(comment.id, comment.isLiked)}
                            style={styles.commentActionButton}
                          >
                            <View style={styles.commentLikeContainer}>
                              <Heart 
                                size={14} 
                                color={comment.isLiked ? '#ec4899' : '#6b7280'}
                                fill={comment.isLiked ? '#ec4899' : 'none'}
                              />
                              <Text style={[styles.commentActionText, comment.isLiked && styles.likedText]}>
                                {comment.likes}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => handleReplyToComment(comment.id, comment.author)}
                            style={styles.commentActionButton}
                          >
                            <Text style={styles.commentActionText}>💬 Reply</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <View style={styles.repliesContainer}>
                      {comment.replies.map((reply: any) => (
                        <View key={reply.id} style={styles.replyItem}>
                          <View style={styles.replyAvatar}>
                            {reply.avatar && reply.avatar.startsWith('http') ? (
                              <Image 
                                source={{ uri: reply.avatar }} 
                                style={styles.replyAvatarImage}
                                onError={() => console.log('Failed to load reply avatar:', reply.avatar)}
                              />
                            ) : (
                              <Text style={styles.replyAvatarText}>{reply.avatar || '👤'}</Text>
                            )}
                          </View>
                          <View style={styles.replyContent}>
                            <View style={styles.replyHeader}>
                              <Text style={styles.replyAuthor}>{reply.author}</Text>
                              {reply.isOwn && (
                                <TouchableOpacity 
                                  onPress={() => handleDeleteComment(reply.id)}
                                  style={styles.deleteCommentButton}
                                >
                                  <Text style={styles.deleteCommentText}>🗑️</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                            <Text style={styles.replyText}>{reply.text}</Text>
                            <View style={styles.replyActions}>
                              <Text style={styles.replyTime}>{reply.time}</Text>
                              <TouchableOpacity 
                                onPress={() => handleLikeComment(reply.id, reply.isLiked)}
                                style={styles.commentActionButton}
                              >
                                <View style={styles.commentLikeContainer}>
                                  <Heart 
                                    size={12} 
                                    color={reply.isLiked ? '#ec4899' : '#6b7280'}
                                    fill={reply.isLiked ? '#ec4899' : 'none'}
                                  />
                                  <Text style={[styles.commentActionText, reply.isLiked && styles.likedText]}>
                                    {reply.likes}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
            
            {/* Add Comment Section */}
            <View style={styles.addCommentSection}>
              {replyingTo && (
                <View style={styles.replyingToContainer}>
                  <Text style={styles.replyingToText}>
                    Replying to {replyingTo.author}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setReplyingTo(null)}
                    style={styles.cancelReplyButton}
                  >
                    <Text style={styles.cancelReplyText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder={replyingTo ? `Reply to ${replyingTo.author}...` : "Add a comment..."}
                  value={replyingTo ? replyText : commentText}
                  onChangeText={replyingTo ? setReplyText : setCommentText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity 
                  onPress={replyingTo ? handleAddReply : handleAddComment}
                  style={[
                    styles.addCommentButton, 
                    (!(replyingTo ? replyText : commentText).trim()) && styles.addCommentButtonDisabled
                  ]}
                  disabled={!(replyingTo ? replyText : commentText).trim()}
                >
                  <Text style={styles.addCommentButtonText}>
                    {replyingTo ? 'Reply' : 'Post'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>



      {/* Options Modal - exactly like original */}
      <Modal
        visible={showOptions}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionsModal}>
            <TouchableOpacity style={styles.option}>
              <Text style={styles.optionText}>📌 Pin this post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <Text style={styles.optionText}>🔗 Copy link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <Text style={styles.optionText}>📢 Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <Text style={styles.optionText}>🚫 Hide</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelOption}
              onPress={() => setShowOptions(false)}
            >
              <Text style={styles.cancelOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles exactly matching the original web version
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
  },
  
  // Card styling - exactly like original with backdrop blur effect
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    borderWidth: 0, // Removed black outline
    overflow: 'hidden',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
  
  // Header exactly matching original
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.3)',
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
  },
  
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  // Avatar exactly like original with gradient effect
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce7f3', // Gradient approximation
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 12,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  
  avatarText: {
    fontSize: 18,
  },
  
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  
  userDetails: {
    flex: 1,
  },
  
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  userHandle: {
    fontSize: 12,
    color: '#6b7280',
  },
  

  
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  // Category badge exactly like original
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  
  moreButton: {
    padding: 4,
    borderRadius: 20,
  },
  
  // Post meta exactly like original
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  readTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  
  voiceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  voiceText: {
    fontSize: 12,
    color: '#3b82f6',
  },
  
  content: {
    padding: 16,
  },
  
  // Title container exactly like original with left border and yellow background
  titleContainer: {
    borderLeftWidth: 2,
    borderLeftColor: '#64748b',
    paddingLeft: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(254, 240, 138, 0.3)',
    paddingVertical: 8,
  },
  
  title: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#475569',
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  
  postText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 12,
  },
  
  readMore: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  
  showLess: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 16,
  },
  
  // Actions exactly like original layout
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  
  // Liked button exactly like original with pink styling
  likedButton: {
    backgroundColor: '#fce7f3',
    borderWidth: 2,
    borderColor: '#f9a8d4',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  
  likedText: {
    color: '#ec4899',
  },
  
  bookmarkButton: {
    padding: 12,
    borderRadius: 16,
  },
  
  // Bookmarked button exactly like original with blue styling
  bookmarkedButton: {
    backgroundColor: '#dbeafe',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  
  // Modal styling exactly like original
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Comments modal exactly like original bottom sheet
  commentsModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    maxHeight: '80%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
  },
  
  commentsContainer: {
    maxHeight: 400,
  },
  
  // Comments exactly like original
  comment: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    gap: 12,
  },
  
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  
  commentAvatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  commentAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  
  commentContent: {
    flex: 1,
  },
  
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  
  commentText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  
  // Options modal exactly like original
  optionsModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -125 }, { translateY: -150 }],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    minWidth: 250,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    boxShadow: '0px 20px 25px rgba(0, 0, 0, 0.25)',
    elevation: 25,
  },
  
  option: {
    padding: 12,
    borderRadius: 8,
  },
  
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  
  cancelOption: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },

  cancelOptionText: {
    fontSize: 16,
    color: '#374151',
  },

  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
  },

  commentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },

  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },

  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },

  deleteCommentButton: {
    padding: 4,
    borderRadius: 4,
  },

  deleteCommentText: {
    fontSize: 12,
  },

  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  commentTime: {
    fontSize: 12,
    color: '#9ca3af',
  },

  commentActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  commentActionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  commentLikeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  commentActionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },

  repliesContainer: {
    marginLeft: 20,
    marginTop: 8,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e7eb',
  },

  replyItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  replyAvatarText: {
    fontSize: 12,
  },
  
  replyAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },

  replyContent: {
    flex: 1,
  },

  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },

  replyAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  replyText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 4,
  },

  replyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  replyTime: {
    fontSize: 11,
    color: '#9ca3af',
  },

  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },

  replyingToText: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },

  cancelReplyButton: {
    padding: 4,
  },

  cancelReplyText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 'bold',
  },

  addCommentSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f9fafb',
  },

  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
 

  commentInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f2937',
    maxHeight: 80,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  addCommentButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    boxShadow: '0px 2px 4px rgba(59, 130, 246, 0.3)',
    elevation: 3,
  },

  addCommentButtonDisabled: {
    backgroundColor: '#d1d5db',
  },

  addCommentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});



