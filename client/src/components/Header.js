import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import { checkPermission } from '../utils/permissions';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
  color: white;
  padding: 16px 20px;
  position: relative;
  z-index: 100;
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  opacity: 0.9;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: 800;
  color: white;
  text-decoration: none;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const NotificationButton = styled(motion.button)`
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 20px;
  padding: 8px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #FF4757;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const UserGreeting = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const GreetingText = styled.div`
  flex: 1;
`;

const GreetingTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 5px;
  font-weight: 800;
`;

const GreetingSubtitle = styled.p`
  opacity: 0.9;
  font-size: 14px;
  font-weight: 500;
`;

const ProfileAvatar = styled(Link)`
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  text-decoration: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.3);
  }
`;

const UserStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px;
  backdrop-filter: blur(10px);
`;

const StatItem = styled.div`
  text-align: center;
  flex: 1;
`;

const StatValue = styled.span`
  font-size: 18px;
  font-weight: bold;
  display: block;
`;

const StatLabel = styled.span`
  font-size: 11px;
  opacity: 0.9;
  margin-top: 2px;
  display: block;
`;

const PersonaBadge = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  margin-top: 4px;
`;

const AnonIndicator = styled.div`
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
  backdrop-filter: blur(10px);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Tagline = styled.p`
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
`;

const NavSection = styled.nav`
  display: flex;
  gap: 20px;
  font-size: 16px;
  font-weight: 600;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #ff6b6b;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserAvatar = styled.span`
  font-size: 24px;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: white;
`;

const UserStatsText = styled.span`
  font-size: 14px;
  opacity: 0.9;
  color: white;
`;

const LoginButton = styled.button`
  background-color: #ff6b6b;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #ff4757;
  }
`;

const getCurrentTime = () => {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Hujambo';
  if (hour < 17) return 'Habari za mchana';
  return 'Habari za jioni';
};

const getMotivationalMessage = () => {
  const messages = [
    'Ready to drive change today?',
    'Your civic voice matters!',
    'Building Kenya, one action at a time',
    'Democracy starts with you',
    'Making civic engagement cool 🔥'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getPersonaInfo, checkPermission } = useEnhancedUser();

  if (!user) return null;

  const personaInfo = getPersonaInfo(user.persona);

  // Don't show full header on admin pages
  if (location.pathname.startsWith('/admin')) {
    return (
      <HeaderContainer style={{ padding: '12px 20px' }}>
        <HeaderTop>
          <Logo to="/">rada.ke</Logo>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '14px', opacity: 0.9 }}>Admin Panel</span>
            {checkPermission('assign_roles') && (
              <Link 
                to="/admin/role-management" 
                style={{ 
                  color: '#ff6b6b', 
                  fontWeight: '600', 
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                👥 Manage Roles
              </Link>
            )}
          </div>
        </HeaderTop>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer>
      <AnonIndicator>🔐 100% Anonymous</AnonIndicator>
      
      <StatusBar>
        <span>{getCurrentTime()}</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span>📶</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </StatusBar>

      <HeaderTop>
        <Logo to="/">rada.ke</Logo>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {checkPermission('assign_roles') && (
            <Link 
              to="/admin/role-management" 
              style={{ 
                color: '#ff6b6b', 
                fontWeight: '600', 
                textDecoration: 'none',
                fontSize: '14px',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '6px 12px',
                borderRadius: '6px',
                backdropFilter: 'blur(10px)'
              }}
            >
              👥 Admin
            </Link>
          )}
          <NotificationButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔔
            <NotificationBadge>12</NotificationBadge>
          </NotificationButton>
        </div>
      </HeaderTop>

      <UserGreeting>
        <GreetingText>
          <GreetingTitle>
            {getGreeting()}, {user.nickname}!
          </GreetingTitle>
          <GreetingSubtitle>
            {getMotivationalMessage()} • Level {Math.floor((user.xp || 0) / 150) + 1} • #{Math.floor(Math.random() * 200) + 1}
          </GreetingSubtitle>
        </GreetingText>
        <ProfileAvatar to="/profile">
          {user.emoji}
        </ProfileAvatar>
      </UserGreeting>

      <UserStats>
        <StatItem>
          <StatValue>{user.xp?.toLocaleString() || '0'}</StatValue>
          <StatLabel>XP Points</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>🔥 {user.streak || 0}</StatValue>
          <StatLabel>Day Streak</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{personaInfo.emoji}</StatValue>
          <StatLabel>Tracker</StatLabel>
          <PersonaBadge>{personaInfo.name}</PersonaBadge>
        </StatItem>
        <StatItem>
          <StatValue>📍 {user.county || 'Nairobi'}</StatValue>
          <StatLabel>Location</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>🏆 {user.trust_score?.toFixed(1) || '1.0'}</StatValue>
          <StatLabel>Trust Score</StatLabel>
        </StatItem>
      </UserStats>
    </HeaderContainer>
  );
};

export default Header;