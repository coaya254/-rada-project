import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import styled from 'styled-components';

const NavigationContainer = styled.nav`
  background: white;
  border-bottom: 1px solid var(--light-border);
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavLink = styled(Link)`
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: var(--light-bg);
    color: var(--text-primary);
  }
  
  &.active {
    background: var(--primary-color);
    color: white;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--light-bg);
  border-radius: 20px;
  font-size: 14px;
`;

const UserEmoji = styled.span`
  font-size: 18px;
`;

const UserName = styled.span`
  font-weight: 500;
  color: var(--text-primary);
`;

const TrustScore = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
`;

const TrustBadge = styled.span`
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  
  &.high {
    background: #10b981;
    color: white;
  }
  
  &.medium {
    background: #f59e0b;
    color: white;
  }
  
  &.low {
    background: #6b7280;
    color: white;
  }
`;

const StaffBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  
  &.admin {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
  }
  
  &.moderator {
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: white;
  }
  
  &.educator {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    color: white;
  }
`;

const XPDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
`;

const EnhancedNavigation = () => {
  const { user, permissions, getTrustLevelInfo } = useEnhancedUser();
  const location = useLocation();

  if (!user) return null;

  const isHighTrust = user.trust_score > 2.0;
  const isModerator = ['moderator', 'admin'].includes(user.role);
  const isStaff = ['educator', 'moderator', 'admin'].includes(user.role);
  const isAdmin = user.role === 'admin';
  const isEditorial = isModerator;
  const isStaffUser = user.role === 'staff';

  const getTrustLevel = (trustScore) => {
    if (trustScore >= 3.0) return { level: 'high', label: 'Trusted' };
    if (trustScore >= 2.0) return { level: 'medium', label: 'Reliable' };
    return { level: 'low', label: 'New' };
  };

  const trustLevel = getTrustLevel(user.trust_score);

  // Navigation items based on user role and permissions
  const navItems = [
    { path: '/feed', label: 'Civic Feed', icon: '📰', show: true },
    { path: '/profile', label: 'Profile', icon: '👤', show: true },
    { path: '/trust-dashboard', label: 'Trust Score', icon: '⭐', show: true },
    { path: '/admin', label: 'Admin Panel', icon: '⚙️', show: isAdmin },
    { path: '/admin/security', label: 'Security', icon: '🔐', show: isAdmin },
    { path: '/admin/moderate', label: 'Moderation', icon: '🛡️', show: isModerator },
    { path: '/editorial', label: 'Editorial', icon: '✏️', show: isEditorial },
    { path: '/staff-login', label: 'Staff Login', icon: '🔑', show: !isStaffUser }
  ];

  return (
    <NavigationContainer>
      <NavContent>
        <Logo to="/">
          🏛️ Rada.ke
        </Logo>

        <NavLinks>
          {navItems
            .filter(item => item.show)
            .map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
        </NavLinks>

        <UserSection>
          <UserInfo>
            <UserEmoji>{user.emoji}</UserEmoji>
            <div>
              <UserName>{user.nickname || 'Anonymous'}</UserName>
              <TrustScore>
                <span>Trust:</span>
                <TrustBadge className={trustLevel.level}>
                  {trustLevel.label}
                </TrustBadge>
                {isStaff && (
                  <StaffBadge className={user.role}>
                    {user.role}
                  </StaffBadge>
                )}
              </TrustScore>
            </div>
          </UserInfo>
          
          <XPDisplay>
            <span>⭐</span>
            <span>{user.xp} XP</span>
          </XPDisplay>
        </UserSection>
      </NavContent>
    </NavigationContainer>
  );
};

export default EnhancedNavigation;
