import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import api from '../utils/api';

const ProfileContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--light-bg);
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #4caf50, #81c784);
  color: white;
  padding: 24px 20px;
  text-align: center;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin: 0 auto 16px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  position: relative;
`;

const OnlineIndicator = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background: #4caf50;
  border-radius: 50%;
  border: 2px solid white;
`;

const ProfileName = styled.h1`
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
`;

const ProfileInfo = styled.div`
  opacity: 0.9;
  font-size: 14px;
  margin-bottom: 20px;
`;



const TrustScoreBadge = styled.div`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 12px;
  background: ${props => {
    switch(props.level) {
      case 'exemplary': return 'linear-gradient(45deg, #FFD700, #FFA500)';
      case 'trusted': return 'linear-gradient(45deg, #4CAF50, #45a049)';
      case 'reliable': return 'linear-gradient(45deg, #2196F3, #1976D2)';
      case 'building': return 'linear-gradient(45deg, #FF9800, #F57C00)';
      default: return 'linear-gradient(45deg, #9E9E9E, #757575)';
    }
  }};
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  margin-top: 8px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px 20px;
  background: white;
  margin: 0 0 16px 0;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 16px 8px;
  background: var(--light-bg);
  border-radius: 12px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #4caf50;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const TabsContainer = styled.div`
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  gap: 8px;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--light-bg);
  }
  
  &::-webkit-scrollbar-thumb {
    background: #4caf50;
    border-radius: 2px;
  }
`;

const Tab = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid ${props => props.active ? '#4caf50' : 'var(--light-border)'};
  background: ${props => props.active ? '#4caf50' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
`;

const ContentSection = styled.div`
  padding: 20px;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TrustScoreCard = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

const TrustScoreValue = styled.div`
  font-size: 48px;
  font-weight: 800;
  color: #667eea;
  margin-bottom: 8px;
`;

const TrustScoreLabel = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
`;

const TrustProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const TrustProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  width: ${props => (props.value / 5) * 100}%;
  transition: width 0.3s ease;
`;

const TrustLevelInfo = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 16px;
`;

const TrustEventsList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const TrustEventItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--light-border);
  
  &:last-child {
    border-bottom: none;
  }
`;

const TrustEventDetails = styled.div`
  flex: 1;
`;

const TrustEventType = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const TrustEventReason = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const TrustEventChange = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.change > 0 ? '#4caf50' : props.change < 0 ? '#f44336' : '#9e9e9e'};
`;

const PersonaCard = styled.div`
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.1));
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
`;

const PersonaEmoji = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
`;

const PersonaName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const PersonaDescription = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const ActionButton = styled(motion.button)`
  background: var(--light-bg);
  border: 2px solid var(--light-border);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  transition: all 0.2s ease;

  &:hover {
    border-color: #4caf50;
    background: rgba(76, 175, 80, 0.05);
    transform: translateY(-1px);
  }
`;

const ActionIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const AchievementCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-right: 12px;
  min-width: 140px;
  box-shadow: var(--shadow-light);
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  
  &:hover {
    border-color: #4caf50;
    transform: translateY(-2px);
  }
  
  &.earned {
    border-color: #4caf50;
    background: rgba(76, 175, 80, 0.05);
  }
`;

const AchievementIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
  filter: ${props => props.earned ? 'none' : 'grayscale(1) opacity(0.3)'};
`;

const AchievementTitle = styled.h4`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const AchievementDesc = styled.p`
  font-size: 10px;
  color: var(--text-secondary);
`;

const ScrollContainer = styled.div`
  display: flex;
  overflow-x: auto;
  padding: 0 0 16px 0;
  gap: 0;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--light-bg);
  }
  
  &::-webkit-scrollbar-thumb {
    background: #4caf50;
    border-radius: 2px;
  }
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

  &:hover {
    background: rgba(76, 175, 80, 0.05);
    transform: translateY(-1px);
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

const ProgressBar = styled.div`
  background: var(--light-bg);
  height: 8px;
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  background: linear-gradient(90deg, #4caf50, #81c784);
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
`;



const SavedItemCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--light-bg);
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid var(--light-border);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(76, 175, 80, 0.05);
    transform: translateY(-1px);
  }
`;

const SavedItemIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4caf50, #81c784);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  flex-shrink: 0;
`;

const SavedItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SavedItemTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.3;
`;

const SavedItemDesc = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SavedItemMeta = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const RemoveButton = styled.button`
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(244, 67, 54, 0.2);
    transform: scale(1.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const SettingsButton = styled.button`
  background: ${props => props.danger ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)'};
  color: ${props => props.danger ? '#f44336' : '#4caf50'};
  border: 2px solid ${props => props.danger ? 'rgba(244, 67, 54, 0.3)' : 'rgba(76, 175, 80, 0.3)'};
  border-radius: 12px;
  padding: 16px;
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 12px;
  
  &:hover {
    background: ${props => props.danger ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)'};
    transform: translateY(-2px);
  }
`;

const Profile = () => {
  const { user, awardXP, resetOnboarding, getTrustLevelInfo } = useEnhancedUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [savedItems, setSavedItems] = useState([]);

  // Helper functions for trust score
  const getTrustLevel = (trustScore) => {
    if (trustScore >= 4.0) return { level: 'exemplary', color: 'gold', label: 'Exemplary Citizen' };
    if (trustScore >= 3.0) return { level: 'trusted', color: 'green', label: 'Trusted Member' };
    if (trustScore >= 2.0) return { level: 'reliable', color: 'blue', label: 'Reliable Contributor' };
    if (trustScore >= 1.5) return { level: 'building', color: 'orange', label: 'Building Trust' };
    return { level: 'new', color: 'gray', label: 'New Member' };
  };

  const getNextTrustLevel = (trustScore) => {
    if (trustScore >= 4.0) return 'Max level reached!';
    if (trustScore >= 3.0) return '4.0 (Exemplary)';
    if (trustScore >= 2.0) return '3.0 (Trusted)';
    if (trustScore >= 1.5) return '2.0 (Reliable)';
    return '1.5 (Building Trust)';
  };

  const { data: userStats, isLoading } = useQuery('user-stats', () =>
    api.get('/users/stats')
  );

  // Fetch saved items
  const { data: savedItemsData, refetch: refetchSavedItems } = useQuery(
    ['saved-items', user?.uuid],
    () => api.get(`/saved-items/${user?.uuid}`),
    {
      select: (response) => response.data,
      enabled: !!user?.uuid && activeTab === 'saved',
      onSuccess: (data) => {
        setSavedItems(data);
      }
    }
  );

  const userData = {
    nickname: user?.nickname || 'CivicChampion',
    emoji: user?.emoji || '🌟',
    county: user?.county || 'Nairobi',
    totalXP: user?.xp || 1250,
    badges: user?.badges?.length || 8,
    streak: user?.streak || 12,
    level: Math.floor((user?.xp || 1250) / 150) + 1,
    rank: 156,
    completionRate: 87,
    weeklyXP: 245,
    postsCount: 15,
    likesReceived: 89
  };

  const personaData = {
    name: 'Civic Innovator',
    emoji: '🚀',
    description: 'A forward-thinking civic engagement advocate leveraging technology to drive positive change in Kenya.'
  };

  const achievements = [
    { id: 1, title: 'Constitution Scholar', desc: 'Complete Constitution module', icon: '🏛️', earned: true },
    { id: 2, title: 'Democracy Defender', desc: 'Master civic participation', icon: '🗳️', earned: false },
    { id: 3, title: 'Devolution Expert', desc: 'Understand county governance', icon: '🏢', earned: true },
    { id: 4, title: 'Rights Champion', desc: 'Advocate for human rights', icon: '⚖️', earned: false },
    { id: 5, title: 'Integrity Warrior', desc: 'Fight against corruption', icon: '🛡️', earned: false },
    { id: 6, title: 'Youth Leader', desc: 'Lead community change', icon: '👥', earned: true }
  ];

  const recentActivities = [
    {
      icon: '📚',
      title: 'Completed Constitution Basics',
      description: 'Earned 50 XP',
      time: '2 hours ago'
    },
    {
      icon: '💬',
      title: 'Commented on Youth Climate Action',
      description: 'Shared your thoughts',
      time: '5 hours ago'
    },
    {
      icon: '❤️',
      title: 'Liked 3 civic stories',
      description: 'Earned 6 XP',
      time: '1 day ago'
    },
    {
      icon: '🏆',
      title: 'Earned Constitution Scholar badge',
      description: 'Milestone achieved!',
      time: '2 days ago'
    }
  ];

  const tabs = [
    { key: 'overview', label: '🏠 Overview', icon: '🏠' },
    { key: 'trust', label: '🏆 Trust Score', icon: '🏆' },
    { key: 'saved', label: '📚 Saved', icon: '📚' },
    { key: 'achievements', label: '🏆 Badges', icon: '🏆' },
    { key: 'activity', label: '📋 Activity', icon: '📋' },
    { key: 'stats', label: '📊 Stats', icon: '📊' },
    { key: 'settings', label: '⚙️ Settings', icon: '⚙️' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleStartActivity = async (activity) => {
    if (!user) {
      toast.error('Please complete setup first');
      return;
    }

    try {
      await awardXP('profile_action', 5, activity, 'profile');
      toast.success(`${activity} started! (+5 XP) 🎉`);
    } catch (error) {
      console.error('Error:', error);
      toast.success(`${activity} started! 🎉`);
    }
  };

  const handleRemoveSaved = async (itemId, itemType) => {
    try {
      await api.delete(`/saved-items/${itemId}`, {
        data: { uuid: user.uuid, item_type: itemType }
      });
      toast.success('Item removed from saved');
      refetchSavedItems();
    } catch (error) {
      console.error('Error removing saved item:', error);
      toast.error('Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <ProfileContainer>
        <Card style={{ margin: '20px', textAlign: 'center', background: 'linear-gradient(135deg, #4caf50, #81c784)', color: 'white' }}>
          <h1>Loading Profile...</h1>
        </Card>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </ProfileContainer>
    );
  }

  if (!user) {
    return (
      <ProfileContainer>
        <Card style={{ margin: '20px', textAlign: 'center', background: 'linear-gradient(135deg, #4caf50, #81c784)', color: 'white' }}>
          <h1>Profile</h1>
        </Card>
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <h2>Please complete setup to view profile</h2>
        </div>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Avatar>
          {userData.emoji}
          <OnlineIndicator />
        </Avatar>
        <ProfileName>{userData.nickname}</ProfileName>
        <ProfileInfo>📍 {userData.county} • Level {userData.level} • #{userData.rank} • Trust: {user?.trust_score?.toFixed(1) || '1.0'}</ProfileInfo>
      </ProfileHeader>

      {/* Learning Stats */}
      <StatsGrid>
        <StatCard>
          <StatValue>{userData.totalXP.toLocaleString()}</StatValue>
          <StatLabel>Total XP</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{user?.trust_score?.toFixed(1) || '1.0'}</StatValue>
          <StatLabel>Trust Score</StatLabel>
          <TrustScoreBadge level={getTrustLevel(user?.trust_score || 1.0)?.level}>
            {getTrustLevel(user?.trust_score || 1.0)?.label}
          </TrustScoreBadge>
        </StatCard>
        <StatCard>
          <StatValue>{userData.badges}</StatValue>
          <StatLabel>Badges</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{userData.level}</StatValue>
          <StatLabel>Level</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Tabs */}
      <TabsContainer>
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </Tab>
        ))}
      </TabsContainer>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ContentSection>
               {/* User Status Summary */}
               <Card style={{ background: 'linear-gradient(135deg, #ff9800, #ffb74d)', color: 'white', textAlign: 'center' }}>
                 <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔥 {userData.streak}</div>
                 <div style={{ fontSize: '16px', opacity: 0.9 }}>Day Streak - Keep it going!</div>
               </Card>

              {/* Persona Card */}
              <Card>
                <CardTitle>🚀 Your Civic Persona</CardTitle>
                <PersonaCard>
                  <PersonaEmoji>{personaData.emoji}</PersonaEmoji>
                  <PersonaName>{personaData.name}</PersonaName>
                  <PersonaDescription>{personaData.description}</PersonaDescription>
                </PersonaCard>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardTitle>⚡ Quick Actions</CardTitle>
                <ActionGrid>
                  <ActionButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation('/learn')}
                  >
                    <ActionIcon>📚</ActionIcon>
                    Continue Learning
                  </ActionButton>
                  <ActionButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation('/feed')}
                  >
                    <ActionIcon>📰</ActionIcon>
                    Browse Feed
                  </ActionButton>
                  <ActionButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation('/youth-hub')}
                  >
                    <ActionIcon>👥</ActionIcon>
                    Youth Hub
                  </ActionButton>
                  <ActionButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation('/memory')}
                  >
                    <ActionIcon>🏛️</ActionIcon>
                    Honor Wall
                  </ActionButton>
                </ActionGrid>
              </Card>

              

              {/* Level Progress */}
              <Card>
                <CardTitle>📈 Level Progress</CardTitle>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Level {userData.level}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {userData.totalXP % 150}/{150} XP
                    </span>
                  </div>
                  <ProgressBar>
                    <ProgressFill style={{ width: `${(userData.totalXP % 150) / 150 * 100}%` }} />
                  </ProgressBar>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {150 - (userData.totalXP % 150)} XP to next level
                </p>
              </Card>
            </ContentSection>
          </motion.div>
        )}

        {activeTab === 'trust' && (
          <motion.div
            key="trust"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ContentSection>
              {/* Trust Score Overview */}
              <Card>
                <CardTitle>🏆 Trust Score Overview</CardTitle>
                <TrustScoreCard>
                  <TrustScoreValue>{user?.trust_score?.toFixed(1) || '1.0'}</TrustScoreValue>
                  <TrustScoreLabel>Current Trust Score</TrustScoreLabel>
                  <TrustScoreBadge level={getTrustLevel(user?.trust_score || 1.0)?.level}>
                    {getTrustLevel(user?.trust_score || 1.0)?.label}
                  </TrustScoreBadge>
                  <TrustProgressBar>
                    <TrustProgressFill value={user?.trust_score || 1.0} />
                  </TrustProgressBar>
                  <TrustLevelInfo>
                    Next level: {getNextTrustLevel(user?.trust_score || 1.0)}
                  </TrustLevelInfo>
                </TrustScoreCard>
              </Card>

              {/* Trust Score Details */}
              <Card>
                <CardTitle>📊 Trust Score Details</CardTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'center', padding: '16px', background: 'var(--light-bg)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#667eea', marginBottom: '8px' }}>
                      {user?.trust_score?.toFixed(1) || '1.0'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Current Score</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', background: 'var(--light-bg)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#4caf50', marginBottom: '8px' }}>
                      {user?.xp || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total XP</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', background: 'var(--light-bg)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#ff9800', marginBottom: '8px' }}>
                      {user?.streak_days || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Day Streak</div>
                  </div>
                </div>
              </Card>

              {/* Recent Trust Events */}
              <Card>
                <CardTitle>📈 Recent Trust Events</CardTitle>
                <TrustEventsList>
                  {user?.trustEvents?.slice(-5).reverse().map((event, index) => (
                    <TrustEventItem key={index}>
                      <TrustEventDetails>
                        <TrustEventType>{event.eventType}</TrustEventType>
                        <TrustEventReason>{event.reason}</TrustEventReason>
                      </TrustEventDetails>
                      <TrustEventChange change={event.trustChange}>
                        {event.trustChange > 0 ? '+' : ''}{event.trustChange.toFixed(1)}
                      </TrustEventChange>
                    </TrustEventItem>
                  ))}
                  {(!user?.trustEvents || user.trustEvents.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                      No trust events yet. Start engaging to build your trust score!
                    </div>
                  )}
                </TrustEventsList>
              </Card>
            </ContentSection>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ContentSection>
              <Card>
                <CardTitle>🏆 Your Achievements</CardTitle>
                <ScrollContainer>
                  {achievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      className={achievement.earned ? 'earned' : ''}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => toast(achievement.earned ? 'Achievement unlocked! 🎉' : 'Keep learning to unlock this badge!')}
                    >
                      <AchievementIcon earned={achievement.earned}>
                        {achievement.icon}
                      </AchievementIcon>
                      <AchievementTitle>{achievement.title}</AchievementTitle>
                      <AchievementDesc>{achievement.desc}</AchievementDesc>
                    </AchievementCard>
                  ))}
                </ScrollContainer>
              </Card>

              <Card>
                <CardTitle>🎯 Achievement Progress</CardTitle>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎖️</div>
                  <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
                    {achievements.filter(a => a.earned).length} / {achievements.length} Earned
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    {Math.round((achievements.filter(a => a.earned).length / achievements.length) * 100)}% Complete
                  </p>
                  <ProgressBar>
                    <ProgressFill style={{ width: `${(achievements.filter(a => a.earned).length / achievements.length) * 100}%` }} />
                  </ProgressBar>
                </div>
              </Card>
            </ContentSection>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ContentSection>
              <Card>
                <CardTitle>📋 Recent Activity</CardTitle>
                {recentActivities.map((activity, index) => (
                  <ActivityItem
                    key={index}
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
              </Card>
            </ContentSection>
          </motion.div>
        )}

                 {activeTab === 'saved' && (
           <motion.div
             key="saved"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
           >
             <ContentSection>
               <Card>
                 <CardTitle>📚 Your Saved Items</CardTitle>
                 {savedItems && savedItems.length > 0 ? (
                   <div>
                     {savedItems.map((item, index) => (
                       <SavedItemCard key={index}>
                         <SavedItemIcon>
                           {item.item_type === 'hero' ? '🏛️' : '📸'}
                         </SavedItemIcon>
                         <SavedItemInfo>
                           <SavedItemTitle>{item.title}</SavedItemTitle>
                           <SavedItemDesc>{item.description}</SavedItemDesc>
                           <SavedItemMeta>
                             {item.item_type === 'hero' ? 'Hero' : 'Protest'} • Saved {new Date(item.created_at).toLocaleDateString()}
                           </SavedItemMeta>
                         </SavedItemInfo>
                         <RemoveButton
                           onClick={() => handleRemoveSaved(item.item_id, item.item_type)}
                           title="Remove from saved"
                         >
                           ×
                         </RemoveButton>
                       </SavedItemCard>
                     ))}
                   </div>
                 ) : (
                   <EmptyState>
                     <EmptyIcon>📚</EmptyIcon>
                     <h3>No saved items yet</h3>
                     <p>Bookmark heroes and protests from the Memory Archive to see them here</p>
                     <ActionButton
                       onClick={() => handleNavigation('/memory')}
                       style={{ marginTop: '16px' }}
                     >
                       🏛️ Browse Memory Archive
                     </ActionButton>
                   </EmptyState>
                 )}
               </Card>
             </ContentSection>
           </motion.div>
         )}

         {activeTab === 'stats' && (
           <motion.div
             key="stats"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
           >
             <ContentSection>
               <Card>
                 <CardTitle>📊 Detailed Statistics</CardTitle>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                   <StatCard>
                     <StatValue>{userData.completionRate}%</StatValue>
                     <StatLabel>Completion Rate</StatLabel>
                   </StatCard>
                   <StatCard>
                     <StatValue>{userData.weeklyXP}</StatValue>
                     <StatLabel>Weekly XP</StatLabel>
                   </StatCard>
                   <StatCard>
                     <StatValue>{userData.postsCount}</StatValue>
                     <StatLabel>Posts Created</StatLabel>
                   </StatCard>
                   <StatCard>
                     <StatValue>{userData.likesReceived}</StatValue>
                     <StatLabel>Likes Received</StatLabel>
                   </StatCard>
                 </div>
               </Card>

               <Card>
                 <CardTitle>🎯 This Week's Goals</CardTitle>
                 <div style={{ marginBottom: '16px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <span style={{ fontSize: '14px', fontWeight: '600' }}>Weekly XP Target</span>
                     <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                       {userData.weeklyXP}/300 XP
                     </span>
                   </div>
                   <ProgressBar>
                     <ProgressFill style={{ width: `${(userData.weeklyXP / 300) * 100}%` }} />
                   </ProgressBar>
                 </div>
                 <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                   {300 - userData.weeklyXP} XP remaining this week
                 </p>
               </Card>
             </ContentSection>
           </motion.div>
         )}

         {activeTab === 'settings' && (
           <motion.div
             key="settings"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
           >
             <ContentSection>
               <Card>
                 <CardTitle>⚙️ Settings</CardTitle>
                 <SettingsButton
                   onClick={() => {
                     if (window.confirm('Are you sure you want to reset your onboarding? This will remove all your progress and return you to the beginning of the app.')) {
                       resetOnboarding();
                       toast.success('Onboarding reset! You will see the welcome screens again.');
                     }
                   }}
                   danger
                 >
                   🔄 Reset Onboarding
                 </SettingsButton>
                  
                  <SettingsButton
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                      toast.success('All data cleared! App will restart.');
                    }}
                    danger
                  >
                    🗑️ Clear All Data (Test)
                  </SettingsButton>
               </Card>
             </ContentSection>
           </motion.div>
         )}
      </AnimatePresence>
    </ProfileContainer>
  );
};

export default Profile;