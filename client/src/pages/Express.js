import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import api from '../utils/api';

const ExpressContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--light-bg);
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #e91e63, #ff5722);
  color: white;
  padding: 24px 20px;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  opacity: 0.9;
  font-size: 16px;
  margin-bottom: 20px;
`;

const CreateButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const FilterTabs = styled.div`
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;

const FilterTab = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid ${props => props.active ? 'var(--rada-pink)' : 'var(--light-border)'};
  background: ${props => props.active ? 'var(--rada-pink)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
`;

const ContentCard = styled(motion.div)`
  background: white;
  margin: 16px 20px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
`;

const ContentHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ContentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--rada-pink);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

const AuthorInfo = styled.div``;

const AuthorName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
`;

const PostDate = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const ContentType = styled.span`
  background: ${props => {
    switch (props.type) {
      case 'poem': return 'rgba(233, 30, 99, 0.1)';
      case 'story': return 'rgba(76, 175, 80, 0.1)';
      case 'audio': return 'rgba(255, 152, 0, 0.1)';
      case 'art': return 'rgba(156, 39, 176, 0.1)';
      default: return 'var(--light-bg)';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'poem': return '#e91e63';
      case 'story': return '#4caf50';
      case 'audio': return '#ff9800';
      case 'art': return '#9c27b0';
      default: return 'var(--text-secondary)';
    }
  }};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

const ContentBody = styled.div`
  padding: 20px;
`;

const ContentTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.4;
`;

const ContentText = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  white-space: pre-wrap;
  
  &.poem {
    font-style: italic;
    text-align: center;
  }
`;

const AudioPlayer = styled.div`
  background: var(--light-bg);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: center;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
`;

const Tag = styled.span`
  background: rgba(233, 30, 99, 0.1);
  color: #e91e63;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
`;

const ContentActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--light-bg);
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(233, 30, 99, 0.1);
    color: #e91e63;
  }
  
  &.active {
    background: rgba(233, 30, 99, 0.1);
    color: #e91e63;
  }
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const filterTabs = [
  { key: 'all', label: 'All', icon: '🎨' },
  { key: 'stories', label: 'Stories', icon: '📝' },
  { key: 'poems', label: 'Poems', icon: '✨' },
  { key: 'audio', label: 'Audio', icon: '🎧' },
  { key: 'art', label: 'Art', icon: '🇺' }
];

const Express = () => {
  const { user, awardXP  } = useEnhancedUser();
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: expressionData, isLoading, refetch } = useQuery(
    ['expressions', activeFilter],
    () => api.get('/expressions', {
      params: activeFilter !== 'all' ? { type: activeFilter } : {}
    }),
    {
      select: (response) => response.data
    }
  );

  const handleLike = async (expressionId) => {
    if (!user) {
      toast.error('Please complete setup to like content');
      return;
    }

    try {
      await api.post(`/expressions/${expressionId}/like`, {
        uuid: user.uuid
      });

      await awardXP('like_content', 2, expressionId, 'expression');
      toast.success('Liked! (+2 XP) ❤️');
      
      refetch();
    } catch (error) {
      console.error('Error liking content:', error);
      toast.error('Failed to like content');
    }
  };

  const handleShare = (expression) => {
    if (navigator.share) {
      navigator.share({
        title: expression.title,
        text: expression.content.substring(0, 100) + '...',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTypeEmoji = (type) => {
    switch (type) {
      case 'poem': return '✨';
      case 'story': return '📝';
      case 'audio': return '🎧';
      case 'art': return '🇺';
      default: return '🎨';
    }
  };

  if (isLoading) {
    return (
      <ExpressContainer>
        <PageHeader>
          <PageTitle>🎨 Expression Space</PageTitle>
          <PageSubtitle>Share your civic stories, poems, and creative content</PageSubtitle>
        </PageHeader>
        
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </ExpressContainer>
    );
  }

  return (
    <ExpressContainer>
      <PageHeader>
        <PageTitle>🎨 Expression Space</PageTitle>
        <PageSubtitle>Share your civic stories, poems, and creative content</PageSubtitle>
        
        <CreateButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toast('Create feature coming soon! 🚀')}
        >
          ➕ Create Expression
        </CreateButton>
      </PageHeader>

      <FilterTabs>
        {filterTabs.map((tab) => (
          <FilterTab
            key={tab.key}
            active={activeFilter === tab.key}
            onClick={() => setActiveFilter(tab.key)}
          >
            {tab.icon} {tab.label}
          </FilterTab>
        ))}
      </FilterTabs>

      {expressionData && expressionData.length > 0 ? (
        <AnimatePresence>
          {expressionData.map((expression) => (
            <ContentCard
              key={expression.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ y: -2 }}
            >
              <ContentHeader>
                <ContentMeta>
                  <Avatar>
                    {expression.author_name ? 
                      expression.author_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 
                      '🌱'
                    }
                  </Avatar>
                  <AuthorInfo>
                    <AuthorName>
                      {expression.author_name || `Anon${expression.author_uuid?.slice(-4)}`}
                    </AuthorName>
                    <PostDate>{formatDate(expression.created_at)}</PostDate>
                  </AuthorInfo>
                </ContentMeta>
                
                <ContentType type={expression.type}>
                  {getTypeEmoji(expression.type)} {expression.type || 'Expression'}
                </ContentType>
              </ContentHeader>

              <ContentBody>
                <ContentTitle>{expression.title}</ContentTitle>
                
                <ContentText className={expression.type}>
                  {expression.content}
                </ContentText>

                {expression.type === 'audio' && expression.audio_url && (
                  <AudioPlayer>
                    🎧 Audio Content
                    <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.7 }}>
                      Tap to play when available
                    </div>
                  </AudioPlayer>
                )}

                {expression.tags && expression.tags.length > 0 && (
                  <TagsContainer>
                    {expression.tags.map((tag, index) => (
                      <Tag key={index}>#{tag}</Tag>
                    ))}
                  </TagsContainer>
                )}
              </ContentBody>

              <ContentActions>
                <ActionButton
                  onClick={() => handleLike(expression.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ❤️ {expression.likes_count || 0}
                </ActionButton>
                
                <ActionButton
                  onClick={() => toast('Comments coming soon!')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  💬 {expression.comments_count || 0}
                </ActionButton>
                
                <ActionButton
                  onClick={() => handleShare(expression)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  🔗 Share
                </ActionButton>
              </ContentActions>
            </ContentCard>
          ))}
        </AnimatePresence>
      ) : (
        <EmptyState>
          <EmptyIcon>🎨</EmptyIcon>
          <h3>No expressions yet</h3>
          <p>Be the first to share your civic story, poem, or creative content!</p>
        </EmptyState>
      )}
    </ExpressContainer>
  );
};

export default Express;