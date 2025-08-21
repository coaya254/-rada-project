import React, { useState, useEffect } from 'react';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.8;
`;

const TrustLevelBadge = styled.div`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
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
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const EventList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const EventItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  border-left: 4px solid ${props => props.change > 0 ? '#4CAF50' : props.change < 0 ? '#f44336' : '#FF9800'};
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const EventType = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
`;

const EventChange = styled.div`
  font-weight: 600;
  color: ${props => props.change > 0 ? '#4CAF50' : props.change < 0 ? '#f44336' : '#FF9800'};
`;

const EventReason = styled.div`
  font-size: 0.85rem;
  opacity: 0.8;
`;

const EventDate = styled.div`
  font-size: 0.75rem;
  opacity: 0.6;
  margin-top: 5px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin: 15px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  width: ${props => (props.value / 5) * 100}%;
  transition: width 0.3s ease;
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  margin-top: 10px;
`;

const TrendArrow = styled.span`
  font-size: 1.2rem;
  color: ${props => props.trend === 'up' ? '#4CAF50' : props.trend === 'down' ? '#f44336' : '#FF9800'};
`;

const TrustScoreDashboard = () => {
  const { user, getTrustEvents, getTrustLevelInfo } = useEnhancedUser();
  const [trustEvents, setTrustEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrustData();
  }, []);

  const loadTrustData = async () => {
    try {
      setLoading(true);
      const events = await getTrustEvents();
      setTrustEvents(events);
    } catch (error) {
      console.error('Failed to load trust data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrustTrend = () => {
    if (trustEvents.length < 2) return 'stable';
    
    const recent = trustEvents.slice(-3);
    const older = trustEvents.slice(-6, -3);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, event) => sum + event.trustChange, 0) / recent.length;
    const olderAvg = older.reduce((sum, event) => sum + event.trustChange, 0) / older.length;
    
    if (recentAvg > olderAvg * 1.1) return 'up';
    if (recentAvg < olderAvg * 0.9) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getTrendText = (trend) => {
    switch(trend) {
      case 'up': return 'Improving';
      case 'down': return 'Declining';
      default: return 'Stable';
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div>Loading trust data...</div>
        </div>
      </DashboardContainer>
    );
  }

  if (!user) {
    return (
      <DashboardContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div>Please log in to view your trust dashboard.</div>
        </div>
      </DashboardContainer>
    );
  }

  const trustLevel = getTrustLevelInfo();
  const trend = getTrustTrend();

  return (
    <DashboardContainer>
      <Header>
        <Title>🏆 Trust Score Dashboard</Title>
        <Subtitle>Track your civic engagement and trustworthiness</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatValue>{user.trust_score.toFixed(1)}</StatValue>
          <StatLabel>Current Trust Score</StatLabel>
          <TrustLevelBadge level={trustLevel?.level}>
            {trustLevel?.label}
          </TrustLevelBadge>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatValue>{trustEvents.length}</StatValue>
          <StatLabel>Trust Events</StatLabel>
          <TrendIndicator>
            <TrendArrow trend={trend}>{getTrendIcon(trend)}</TrendArrow>
            {getTrendText(trend)}
          </TrendIndicator>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatValue>{user.xp}</StatValue>
          <StatLabel>Total XP</StatLabel>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Level {Math.floor(user.xp / 100) + 1}
          </div>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatValue>{user.streak_days}</StatValue>
          <StatLabel>Day Streak</StatLabel>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            {user.streak_days >= 7 ? '🔥 Consistent!' : 'Keep going!'}
          </div>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <Section>
          <SectionTitle>
            📊 Trust Progress
          </SectionTitle>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Current Level</span>
              <span>{user.trust_score.toFixed(1)} / 5.0</span>
            </div>
        <ProgressBar>
              <ProgressFill value={user.trust_score} />
        </ProgressBar>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Next level: {trustLevel?.level === 'exemplary' ? 'Max level reached!' : 
                trustLevel?.level === 'trusted' ? '4.0 (Exemplary)' :
                trustLevel?.level === 'reliable' ? '3.0 (Trusted)' :
                trustLevel?.level === 'building' ? '2.0 (Reliable)' : '1.5 (Building Trust)'}
            </div>
          </div>
        </Section>

        <Section>
          <SectionTitle>
            📈 Recent Activity
          </SectionTitle>
          <EventList>
            {trustEvents.slice(-5).reverse().map((event, index) => (
              <EventItem key={index} change={event.trustChange}>
                <EventHeader>
                  <EventType>{event.eventType}</EventType>
                  <EventChange change={event.trustChange}>
                    {event.trustChange > 0 ? '+' : ''}{event.trustChange.toFixed(1)}
                  </EventChange>
                </EventHeader>
                <EventReason>{event.reason}</EventReason>
                <EventDate>
                  {new Date(event.timestamp).toLocaleDateString()}
                </EventDate>
              </EventItem>
            ))}
            {trustEvents.length === 0 && (
              <div style={{ textAlign: 'center', opacity: 0.6, padding: '20px' }}>
                No trust events yet. Start engaging to build your trust score!
              </div>
            )}
          </EventList>
        </Section>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default TrustScoreDashboard;
