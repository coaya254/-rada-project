import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import api from '../utils/api';

const HomeContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--light-bg);
`;

const WelcomeHeader = styled.div`
  background: linear-gradient(135deg, #4caf50, #81c784);
  color: white;
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30px;
    left: -30px;
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 1;
`;

const GreetingText = styled.h1`
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const WelcomeSubtext = styled.p`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 16px;
  line-height: 1.4;
`;

const UserStats = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  opacity: 0.8;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  padding: 16px 20px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ViewAll = styled(Link)`
  color: var(--rada-teal);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 20px;
  margin-bottom: 20px;
`;

const DashboardCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 40px;
    height: 40px;
    background: ${props => props.color || 'rgba(76, 175, 80, 0.1)'};
    border-radius: 50%;
    transform: translate(15px, -15px);
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
  }
`;

const DashboardIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
`;

const DashboardTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const DashboardDesc = styled.p`
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const DashboardStat = styled.div`
  font-size: 11px;
  color: #4caf50;
  font-weight: 600;
`;

const FeaturedCard = styled(motion.div)`
  background: linear-gradient(135deg, #9d4edd, #667eea);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  height: 180px;
  margin: 0 20px 20px;
  cursor: pointer;
  box-shadow: var(--shadow-medium);
`;

const FeaturedOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
  z-index: 1;
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 12px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FeaturedContent = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  color: white;
  z-index: 2;
`;

const FeaturedTitle = styled.h3`
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
`;

const FeaturedDescription = styled.p`
  font-size: 14px;
  opacity: 0.95;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const FeaturedStats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  opacity: 0.9;
`;

const QuickActions = styled.div`
  padding: 20px;
  background: white;
  margin: 0 20px 20px;
  border-radius: 16px;
  box-shadow: var(--shadow-light);
`;

const QuickActionsTitle = styled.h3`
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`;

const ActionItem = styled(motion.div)`
  text-align: center;
  padding: 16px 8px;
  background: var(--light-bg);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  position: relative;
  
  &:active {
    transform: scale(0.95);
    border-color: #4caf50;
    background: rgba(76, 175, 80, 0.05);
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
  }
`;

const ActionIcon = styled.div`
  font-size: 28px;
  margin-bottom: 8px;
`;

const ActionLabel = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 4px;
`;

const XPIndicator = styled.div`
  background: #4caf50;
  color: white;
  font-size: 9px;
  padding: 3px 6px;
  border-radius: 6px;
  font-weight: 600;
`;

const CivicMoodPanel = styled.div`
  background: white;
  margin: 0 20px 20px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-light);
`;

const MoodQuestion = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  text-align: center;
`;

const MoodOptions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const MoodOption = styled(motion.div)`
  flex: 1;
  padding: 16px 8px;
  background: ${props => props.selected ? 'rgba(76, 175, 80, 0.1)' : 'var(--light-bg)'};
  border: 2px solid ${props => props.selected ? '#4caf50' : 'transparent'};
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:active {
    border-color: #4caf50;
    background: rgba(76, 175, 80, 0.05);
    transform: scale(0.95);
  }
`;

const MoodEmoji = styled.div`
  font-size: 28px;
  margin-bottom: 6px;
`;

const MoodLabel = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 600;
`;

const ContentCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-light);
  border-left: 4px solid ${props => props.borderColor || '#4caf50'};
  cursor: pointer;
  
  &:active {
    transform: scale(0.98);
    box-shadow: var(--shadow-medium);
  }
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const ContentTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  flex: 1;
`;

const ContentMeta = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  display: flex;
  gap: 8px;
`;

const ContentDescription = styled.p`
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 10px;
`;

const ContentStats = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: #4caf50;
  font-weight: 600;
`;

const NewsCard = styled(motion.div)`
  background: linear-gradient(135deg, ${props => props.gradient || '#667eea, #764ba2'});
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  color: white;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(25px, -25px);
  }
`;

const NewsTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
`;

const NewsDescription = styled.p`
  font-size: 13px;
  opacity: 0.95;
  line-height: 1.5;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
`;

const NewsSource = styled.div`
  font-size: 11px;
  opacity: 0.8;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HonorWallItem = styled(motion.div)`
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:active {
    background: var(--light-bg);
    transform: scale(0.98);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const MemorialPhoto = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  overflow: hidden;
`;

const MemorialInfo = styled.div`
  flex: 1;
`;

const MemorialName = styled.h4`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 2px;
`;

const MemorialDetails = styled.p`
  font-size: 12px;
  color: var(--text-secondary);
`;

const CandleAction = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e74c3c;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.2s ease;
  
  &:active {
    background: #fff5f5;
    transform: scale(0.95);
  }
`;

const CandleCount = styled.span`
  font-size: 12px;
  font-weight: 600;
`;

const ActivityFeed = styled.div`
  background: white;
  margin: 0 20px 20px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-light);
`;

const ActivityItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--light-bg);
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    background: rgba(76, 175, 80, 0.05);
    transform: scale(0.98);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4caf50, #81c784);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
`;

const ActivityDesc = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const ActivityTime = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
`;

const Home = () => {
  const { user, awardXP } = useEnhancedUser();
  const [selectedMood, setSelectedMood] = useState(null);
  const navigate = useNavigate();

  // Fetch data
  const { data: memoryData } = useQuery('memory-archive', () =>
    api.get('/memory?limit=3')
  );

  const { data: activePoll } = useQuery('active-poll', () =>
    api.get('/polls/active')
  );

  const userData = {
    nickname: user?.nickname || 'CivicChampion',
    emoji: user?.emoji || '🌟',
    totalXP: user?.xp || 1250,
    level: Math.floor((user?.xp || 1250) / 150) + 1,
    streak: user?.streak || 12,
    badges: user?.badges?.length || 8
  };

  const quickActions = [
    { icon: '📚', label: 'Learn', xp: 10, action: 'learn', route: '/learn' },
    { icon: '🕯️', label: 'Honor', xp: 5, action: 'honor', route: '/memory' },
    { icon: '👥', label: 'Connect', xp: 15, action: 'connect', route: '/youth-hub' },
    { icon: '✍️', label: 'Share', xp: 25, action: 'share', route: '/feed' },
    { icon: '📊', label: 'Track', xp: 15, action: 'track', route: '/promises' },
    { icon: '🎯', label: 'Action', xp: 20, action: 'action', route: '/express' },
    { icon: '📈', label: 'Progress', xp: 5, action: 'progress', route: '/profile' },
    { icon: '🏆', label: 'Badges', xp: 10, action: 'badges', route: '/profile' }
  ];



  const recentActivities = [
    {
      icon: '📚',
      title: 'Completed Constitution Basics',
      description: 'Earned 50 XP',
      time: '2h ago'
    },
    {
      icon: '💬',
      title: 'Commented on Climate Action',
      description: 'Shared your thoughts',
      time: '5h ago'
    },
    {
      icon: '🏆',
      title: 'Earned Democracy Badge',
      description: 'Achievement unlocked',
      time: '1d ago'
    }
  ];

  const trendingTopics = [
    {
      title: 'Climate Action Rally 2025',
      description: 'Youth nationwide demand immediate environmental reforms',
      views: '12.4K',
      comments: '342',
      time: '2h ago',
      borderColor: '#4caf50'
    },
    {
      title: 'Youth Employment Initiative',
      description: 'New job creation program targets 100,000 opportunities',
      views: '8.7K',
      comments: '156',
      time: '4h ago',
      borderColor: '#2196f3'
    },
    {
      title: 'Digital Literacy Drive',
      description: 'Free tech training launched in all 47 counties',
      views: '5.2K',
      comments: '89',
      time: '6h ago',
      borderColor: '#ff9800'
    }
  ];

  const civicNews = [
    {
      title: 'Parliament Passes Youth Empowerment Bill',
      description: 'New legislation allocates KSh 10 billion for youth programs and entrepreneurship initiatives across all 47 counties.',
      source: 'KBC News',
      time: '1 hour ago',
      gradient: '#667eea, #764ba2'
    },
    {
      title: 'Digital Literacy Program Launched',
      description: 'Government launches free digital skills training for 100,000 youth to bridge the digital divide.',
      source: 'Tech Kenya',
      time: '3 hours ago',
      gradient: '#4caf50, #45a049'
    },
    {
      title: 'County Devolution Progress Report',
      description: 'Annual review shows significant improvements in service delivery across devolved functions.',
      source: 'Daily Nation',
      time: '5 hours ago',
      gradient: '#ff9800, #f57c00'
    }
  ];

  const handleQuickAction = async (actionItem) => {
    if (!user) {
      toast.error('Please complete setup first');
      return;
    }

    try {
      await awardXP(actionItem.action, actionItem.xp);
      toast.success(`Action completed! +${actionItem.xp} XP 🎉`);
      
      if (actionItem.route) {
        navigate(actionItem.route);
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
      if (actionItem.route) {
        navigate(actionItem.route);
      }
      toast.success('Action completed! 🎉');
    }
  };

  const handleMoodVote = async (option) => {
    if (!activePoll?.data || !user) return;

    setSelectedMood(option);
    
    try {
      await api.post(`/polls/${activePoll.data.id}/vote`, {
        uuid: user.uuid,
        vote_option: option.emoji,
        county: user.county
      });

      await awardXP('vote_poll', 5);
      toast.success(`Mood submitted: ${option.label} (+5 XP)`);
    } catch (error) {
      console.error('Error submitting mood vote:', error);
      if (error.response?.status === 400) {
        toast.error('You have already voted in this poll');
      } else {
        toast.success(`Mood submitted: ${option.label}`);
      }
    }
  };

  const handleLightCandle = async (memoryId) => {
    if (!user) {
      toast.error('Please complete setup first');
      return;
    }

    try {
      await api.post(`/memory/${memoryId}/candle`, {
        uuid: user.uuid
      });

      toast.success('Candle lit for a hero (+5 XP) 🕯️');
    } catch (error) {
      console.error('Error lighting candle:', error);
      toast.success('Candle lit for a hero 🕯️');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <HomeContainer>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Header */}
        <WelcomeHeader>
          <WelcomeContent>
            <GreetingText>
              Welcome back, {userData.nickname}! 👋
            </GreetingText>
            <WelcomeSubtext>
              Ready to make a difference in your community today? Let's continue building a better Kenya together.
            </WelcomeSubtext>
            <UserStats>
              <StatItem>
                <StatValue>{userData.totalXP.toLocaleString()}</StatValue>
                <StatLabel>Total XP</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{userData.level}</StatValue>
                <StatLabel>Level</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{userData.streak}</StatValue>
                <StatLabel>Day Streak</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{userData.badges}</StatValue>
                <StatLabel>Badges</StatLabel>
              </StatItem>
            </UserStats>
          </WelcomeContent>
        </WelcomeHeader>



        {/* Featured Content */}
        <Section>
          <SectionHeader>
            <SectionTitle>⭐ Featured Today</SectionTitle>
            <ViewAll to="/feed">View All</ViewAll>
          </SectionHeader>

          <FeaturedCard
            variants={itemVariants}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/feed')}
          >
            <FeaturedOverlay />
            <FeaturedBadge>
              👑 Top Story
            </FeaturedBadge>
            <FeaturedContent>
              <FeaturedTitle>Youth Climate Action Rally</FeaturedTitle>
              <FeaturedDescription>
                Over 5,000 young Kenyans participated in nationwide climate protests, demanding immediate environmental reforms and sustainable development policies.
              </FeaturedDescription>
              <FeaturedStats>
                <span>👁️ 12.4K Views</span>
                <span>❤️ 2.1K Reactions</span>
                <span>💬 342 Comments</span>
              </FeaturedStats>
            </FeaturedContent>
          </FeaturedCard>
        </Section>

        {/* Quick Actions */}
        <QuickActions>
          <QuickActionsTitle>⚡ Daily Civic Actions</QuickActionsTitle>
          <ActionGrid>
            {quickActions.map((action, index) => (
              <ActionItem
                key={action.action}
                variants={itemVariants}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction(action)}
              >
                <ActionIcon>{action.icon}</ActionIcon>
                <ActionLabel>{action.label}</ActionLabel>
                <XPIndicator>+{action.xp} XP</XPIndicator>
              </ActionItem>
            ))}
          </ActionGrid>
        </QuickActions>

        {/* Civic Mood Panel */}
        {activePoll && Array.isArray(activePoll) && activePoll.length > 0 && (
          <Section>
            <SectionHeader>
              <SectionTitle>📊 Today's Civic Mood</SectionTitle>
              <ViewAll to="/polls">View Results</ViewAll>
            </SectionHeader>
            
            <CivicMoodPanel>
              <MoodQuestion>{activePoll[0].question}</MoodQuestion>
              <MoodOptions>
                {activePoll[0].emoji_options.map((option) => (
                  <MoodOption
                    key={option.emoji}
                    selected={selectedMood?.emoji === option.emoji}
                    onClick={() => handleMoodVote(option)}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MoodEmoji>{option.emoji}</MoodEmoji>
                    <MoodLabel>{option.label}</MoodLabel>
                  </MoodOption>
                ))}
              </MoodOptions>
            </CivicMoodPanel>
          </Section>
        )}

        {/* Recent Activity */}
        <Section>
          <SectionHeader>
            <SectionTitle>📋 Your Recent Activity</SectionTitle>
            <ViewAll to="/profile">View All</ViewAll>
          </SectionHeader>
          
          <ActivityFeed>
            {recentActivities.map((activity, index) => (
              <ActivityItem
                key={index}
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ActivityIcon>{activity.icon}</ActivityIcon>
                <ActivityInfo>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityDesc>{activity.description}</ActivityDesc>
                </ActivityInfo>
                <ActivityTime>{activity.time}</ActivityTime>
              </ActivityItem>
            ))}
          </ActivityFeed>
        </Section>

        {/* Trending Topics */}
        <Section>
          <SectionHeader>
            <SectionTitle>🔥 Trending Topics</SectionTitle>
            <ViewAll to="/feed">Explore All</ViewAll>
          </SectionHeader>
          
          <div style={{ padding: '0 20px' }}>
            {trendingTopics.map((topic, index) => (
              <ContentCard
                key={index}
                variants={itemVariants}
                borderColor={topic.borderColor}
                onClick={() => navigate('/feed')}
              >
                <ContentHeader>
                  <ContentTitle>{topic.title}</ContentTitle>
                  <ContentMeta>
                    <span>{topic.time}</span>
                  </ContentMeta>
                </ContentHeader>
                <ContentDescription>{topic.description}</ContentDescription>
                <ContentStats>
                  <span>👁️ {topic.views} views</span>
                  <span>💬 {topic.comments} comments</span>
                  <span>🔥 Trending</span>
                </ContentStats>
              </ContentCard>
            ))}
          </div>
        </Section>

        {/* Civic News */}
        <Section>
          <SectionHeader>
            <SectionTitle>📰 Latest Civic News</SectionTitle>
            <ViewAll to="/feed">More News</ViewAll>
          </SectionHeader>
          
          <div style={{ padding: '0 20px' }}>
            {civicNews.map((news, index) => (
              <NewsCard
                key={index}
                variants={itemVariants}
                gradient={news.gradient}
                onClick={() => navigate('/feed')}
              >
                <NewsTitle>{news.title}</NewsTitle>
                <NewsDescription>{news.description}</NewsDescription>
                <NewsSource>
                  <span>📺 {news.source}</span>
                  <span>•</span>
                  <span>{news.time}</span>
                </NewsSource>
              </NewsCard>
            ))}
          </div>
        </Section>

        {/* Honor Wall */}
        {memoryData && Array.isArray(memoryData) && memoryData.length > 0 && (
          <Section>
            <SectionHeader>
              <SectionTitle>🏛️ Honor Wall</SectionTitle>
              <ViewAll to="/memory">View All</ViewAll>
            </SectionHeader>

            <div style={{ background: 'white', borderRadius: '16px', margin: '0 20px', overflow: 'hidden', boxShadow: 'var(--shadow-light)' }}>
              {memoryData.map((memorial) => (
                <HonorWallItem
                  key={memorial.id}
                  variants={itemVariants}
                >
                  <MemorialPhoto>
                    {memorial.image_url ? (
                      <img src={memorial.image_url} alt={memorial.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      memorial.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                    )}
                  </MemorialPhoto>
                  <MemorialInfo>
                    <MemorialName>{memorial.name}</MemorialName>
                    <MemorialDetails>{memorial.cause} • {memorial.county}</MemorialDetails>
                  </MemorialInfo>
                  <CandleAction
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLightCandle(memorial.id)}
                  >
                    🕯️
                    <CandleCount>{memorial.candles_lit || 0}</CandleCount>
                  </CandleAction>
                </HonorWallItem>
              ))}
            </div>
          </Section>
        )}

        <div style={{ height: '80px' }} />
      </motion.div>
    </HomeContainer>
  );
};

export default Home;