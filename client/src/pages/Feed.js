import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import api from '../utils/api';

const FeedContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--light-bg);
`;

const FilterBar = styled.div`
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 2px solid var(--light-border);
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: var(--rada-teal);
  }
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  background: var(--rada-teal);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #00acc1;
  }
`;

const FilterChips = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;

const FilterChip = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid ${props => props.active ? 'var(--rada-teal)' : 'var(--light-border)'};
  background: ${props => props.active ? 'rgba(0, 188, 212, 0.1)' : 'white'};
  color: ${props => props.active ? 'var(--rada-teal)' : 'var(--text-secondary)'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
`;

const PostCard = styled(motion.div)`
  background: white;
  margin: 16px 20px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
`;

const PostHeader = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AuthorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const PostInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
`;

const PostMeta = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
`;

const PostContent = styled.div`
  padding: 0 16px 16px;
`;

const PostTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.3;
`;

const PostText = styled.p`
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const PostMedia = styled.div`
  width: 100%;
  height: 200px;
  background: var(--light-bg);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
`;

const PostTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`;

const Tag = styled.span`
  background: var(--light-bg);
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  margin-right: 8px;
  margin-bottom: 8px;
  display: inline-block;
`;

// Comment Modal Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const CommentModalContent = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 18px;
    color: var(--text-primary);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: var(--light-bg);
    color: var(--text-primary);
  }
`;

const CommentInputSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  gap: 12px;
`;

const CommentInput = styled.textarea`
  flex: 1;
  border: 2px solid var(--light-border);
  border-radius: 20px;
  padding: 12px 16px;
  font-size: 14px;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--rada-teal);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

const CommentButton = styled.button`
  background: var(--rada-teal);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: var(--rada-teal-dark);
    transform: translateY(-1px);
  }

  &:disabled {
    background: var(--light-border);
    cursor: not-allowed;
    transform: none;
  }
`;

const CommentsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 0 20px 20px;
`;

const CommentItem = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid var(--light-border);

  &:last-child {
    border-bottom: none;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const CommentAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const CommentAuthorName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
`;

const CommentMeta = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
`;

const CommentContent = styled.div`
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  margin-left: 44px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #fee;
    color: #e74c3c;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 14px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);

  h4 {
    margin: 0 0 8px 0;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const PostActions = styled.div`
  padding: 12px 16px;
  border-top: 1px solid var(--light-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--light-bg);
    color: var(--text-primary);
  }
`;

const filters = [
  { key: 'all', label: 'All Posts', icon: '📋' },
  { key: 'trending', label: 'Trending', icon: '🔥' },
  { key: 'story', label: 'Stories', icon: '✍️' },
  { key: 'poem', label: 'Poems', icon: '📝' },
  { key: 'audio', label: 'Audio', icon: '🎙️' },
  { key: 'image', label: 'Images', icon: '📸' },
  { key: 'report', label: 'Reports', icon: '📊' }
];

const Feed = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user, awardXP } = useEnhancedUser();

  const { data: posts, isLoading, refetch, error } = useQuery(
    ['posts', activeFilter],
    () => {
      let url = '/posts';
      if (activeFilter !== 'all' && activeFilter !== 'trending') {
        url += `?type=${activeFilter}`;
      }
      return api.get(url);
    },
    {
      select: (response) => response.data,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      onError: (error) => {
        console.error('Failed to fetch posts:', error);
      }
    }
  );

  // No more mock data - we're using real MySQL data!

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getContentTypeIcon = (type) => {
    const icons = {
      story: '✍️',
      poem: '📝',
      audio: '🎙️',
      image: '📸',
      report: '📊'
    };
    return icons[type] || '📄';
  };

  const handleLike = async (postId) => {
    if (!user) {
      toast.error('Please complete setup to like posts');
      return;
    }

    try {
      // Check if user already liked the post
      const likeCheckResponse = await api.get(`/posts/${postId}/liked/${user.uuid}`);
      const hasLiked = likeCheckResponse.data.has_liked;

      if (hasLiked) {
        // Unlike the post
        await api.delete(`/posts/${postId}/like`, {
          data: { uuid: user.uuid }
        });
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return new Set(newSet);
        });
        toast.success('Post unliked 💔');
      } else {
        // Like the post
        await api.post(`/posts/${postId}/like`, {
          uuid: user.uuid
        });
        setLikedPosts(prev => new Set([...prev, postId]));
        toast.success('Post liked! (+2 XP) ❤️');
      }

      // Refresh posts to update like count
      refetch();
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error('Failed to update like');
    }
  };

  // Check like status for posts when they load
  const checkLikeStatus = async (postId) => {
    if (!user) return false;
    try {
      const response = await api.get(`/posts/${postId}/liked/${user.uuid}`);
      return response.data.has_liked;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  };

  // Update liked posts when posts data changes
  useEffect(() => {
    if (posts && user) {
      const checkAllLikes = async () => {
        const likedSet = new Set();
        for (const post of posts) {
          const isLiked = await checkLikeStatus(post.id);
          if (isLiked) {
            likedSet.add(post.id);
          }
        }
        setLikedPosts(likedSet);
      };
      checkAllLikes();
    }
  }, [posts, user]);

  // Comment functions
  const openCommentModal = async (post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
    setCommentText('');
    await fetchComments(post.id);
  };

  const fetchComments = async (postId) => {
    setLoadingComments(true);
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await api.post(`/posts/${selectedPost.id}/comments`, {
        uuid: user.uuid,
        content: commentText.trim()
      });

      toast.success('Comment added! (+5 XP) 💬');
      setCommentText('');
      await fetchComments(selectedPost.id);
      refetch(); // Refresh posts to update comment count
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`, {
        data: { uuid: user.uuid }
      });

      toast.success('Comment deleted');
      await fetchComments(selectedPost.id);
      refetch(); // Refresh posts to update comment count
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get('/search', {
        params: {
          q: searchQuery.trim(),
          type: 'all',
          limit: 20
        }
      });
      setSearchResults(response.data.results);
      toast.success(`Found ${response.data.total} results`);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 100) + '...',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Filter posts based on active filter
  const filteredPosts = posts?.filter(post => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'trending') return post.likes > 10; // Lower threshold for real data
    return post.type === activeFilter;
  }) || [];

  if (isLoading) {
    return (
      <FeedContainer>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }} />
          <p>Loading posts from MySQL...</p>
        </div>
      </FeedContainer>
    );
  }

  if (error) {
    return (
      <FeedContainer>
        <FilterBar>
          {filters.map((filter) => (
            <FilterChip
              key={filter.key}
              active={activeFilter === filter.key}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.icon} {filter.label}
            </FilterChip>
          ))}
        </FilterBar>
        <EmptyState>
          <h4>Failed to load posts</h4>
          <p>Error: {error.message || 'Unable to connect to server'}</p>
          <button onClick={() => refetch()} style={{ 
            padding: '8px 16px', 
            background: 'var(--rada-teal)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Try Again
          </button>
        </EmptyState>
      </FeedContainer>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <FeedContainer>
        <FilterBar>
          {filters.map((filter) => (
            <FilterChip
              key={filter.key}
              active={activeFilter === filter.key}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.icon} {filter.label}
            </FilterChip>
          ))}
        </FilterBar>
        <EmptyState>
          <h4>No posts found</h4>
          <p>There are no posts available. Try creating the first post!</p>
        </EmptyState>
      </FeedContainer>
    );
  }

  return (
    <FeedContainer>
      <FilterBar>
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Search posts, memories, protests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <SearchButton onClick={handleSearch} disabled={isSearching}>
            {isSearching ? '🔍' : 'Search'}
          </SearchButton>
        </SearchBar>
        <FilterChips>
          {filters.map((filter) => (
            <FilterChip
              key={filter.key}
              active={activeFilter === filter.key}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.icon} {filter.label}
            </FilterChip>
          ))}
        </FilterChips>
      </FilterBar>

      {/* Show search results if searching, otherwise show filtered posts */}
      {(searchResults.length > 0 ? searchResults : filteredPosts).map((post) => (
        <PostCard
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
        >
          <PostHeader>
            <AuthorAvatar>
              {post.emoji || '👤'}
            </AuthorAvatar>
            <PostInfo>
              <AuthorName>{post.nickname}</AuthorName>
              <PostMeta>
                {getContentTypeIcon(post.type)} {post.type} • {formatTimeAgo(post.created_at)}
                {post.county && ` • ${post.county}`}
              </PostMeta>
            </PostInfo>
          </PostHeader>

          <PostContent>
            <PostTitle>{post.title}</PostTitle>
            <PostText>{post.content}</PostText>
            
            {post.media_url && (
              <PostMedia>
                {post.type === 'image' ? (
                  <img 
                    src={post.media_url} 
                    alt={post.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : post.type === 'audio' ? (
                  <audio controls style={{ width: '100%' }}>
                    <source src={post.media_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <div style={{ color: '#999', textAlign: 'center' }}>
                    📎 Media content
                  </div>
                )}
              </PostMedia>
            )}

            {post.tags && post.tags.length > 0 && (
              <PostTags>
                {post.tags.map((tag) => (
                  <Tag key={tag}>#{tag}</Tag>
                ))}
              </PostTags>
            )}
          </PostContent>

          <PostActions>
            <ActionGroup>
              <ActionButton onClick={() => handleLike(post.id)}>
                {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes}
              </ActionButton>
              <ActionButton onClick={() => openCommentModal(post)}>
                💬 {post.comments}
              </ActionButton>
              <ActionButton onClick={() => handleShare(post)}>
                🔄 {post.shares}
              </ActionButton>
            </ActionGroup>
            {post.verified && (
              <div style={{ color: 'var(--success-main)', fontSize: '12px', fontWeight: '600' }}>
                ✅ Verified
              </div>
            )}
          </PostActions>
        </PostCard>
      ))}

      {/* This section is now handled by the earlier error and empty state handlers */}

      {/* Comment Modal */}
      {showCommentModal && selectedPost && (
        <CommentModal
          post={selectedPost}
          comments={comments}
          loadingComments={loadingComments}
          commentText={commentText}
          setCommentText={setCommentText}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onClose={() => setShowCommentModal(false)}
          user={user}
        />
      )}
    </FeedContainer>
  );
};

// Comment Modal Component
const CommentModal = ({ 
  post, 
  comments, 
  loadingComments, 
  commentText, 
  setCommentText, 
  onAddComment, 
  onDeleteComment, 
  onClose, 
  user 
}) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - commentTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <ModalOverlay>
      <CommentModalContent ref={modalRef}>
        <ModalHeader>
          <h3>💬 Comments on "{post.title}"</h3>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <CommentInputSection>
          <CommentInput
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onAddComment()}
          />
          <CommentButton onClick={onAddComment} disabled={!commentText.trim()}>
            Post
          </CommentButton>
        </CommentInputSection>

        <CommentsList>
          {loadingComments ? (
            <LoadingText>Loading comments...</LoadingText>
          ) : comments.length === 0 ? (
            <EmptyState>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <h4>No comments yet</h4>
              <p>Be the first to comment on this post!</p>
            </EmptyState>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id}>
                <CommentHeader>
                  <CommentAuthor>
                    <span style={{ fontSize: '20px' }}>{comment.emoji || '👤'}</span>
                    <div>
                      <CommentAuthorName>{comment.nickname}</CommentAuthorName>
                      <CommentMeta>
                        {comment.user_verified && '✅ '}
                        Level {comment.user_level} • {formatTimeAgo(comment.created_at)}
                      </CommentMeta>
                    </div>
                  </CommentAuthor>
                  {comment.uuid === user?.uuid && (
                    <DeleteButton onClick={() => onDeleteComment(comment.id)}>
                      🗑️
                    </DeleteButton>
                  )}
                </CommentHeader>
                <CommentContent>{comment.content}</CommentContent>
              </CommentItem>
            ))
          )}
        </CommentsList>
      </CommentModalContent>
    </ModalOverlay>
  );
};

export default Feed;