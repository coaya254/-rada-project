import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: white;
  border-top: 1px solid #e9ecef;
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  text-decoration: none;
  transition: all 0.2s ease;
  flex: 1;
  position: relative;
  border-radius: 12px;
  
  &:hover {
    background: rgba(78, 205, 196, 0.1);
  }
`;

const NavIcon = styled.span`
  font-size: 20px;
  margin-bottom: 4px;
  display: block;
  transition: transform 0.2s ease;
`;

const NavLabel = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: ${props => props.active ? '#4ECDC4' : '#6c757d'};
  transition: color 0.2s ease;
`;

const ActiveIndicator = styled(motion.div)`
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #4ECDC4;
  border-radius: 50%;
`;

const navItems = [
  {
    path: '/',
    icon: '🏠',
    label: 'Home',
    exact: true
  },
  {
    path: '/feed',
    icon: '📰',
    label: 'Feed',
    exact: false
  },
  {
    path: '/youth-hub',
    icon: '👥',
    label: 'YouthHub',
    exact: false
  },
  {
    path: '/learn',
    icon: '📚',
    label: 'Learn',
    exact: false
  },
  {
    path: '/profile',
    icon: '👤',
    label: 'Profile',
    exact: false
  }
];

const BottomNavigation = () => {
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <NavContainer>
      {navItems.map((item) => {
        const active = isActive(item);
        
        return (
          <NavItem
            key={item.path}
            to={item.path}
          >
            {active && (
              <ActiveIndicator
                layoutId="activeIndicator"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            <NavIcon 
              style={{ 
                color: active ? '#4ECDC4' : '#6c757d',
                transform: active ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {item.icon}
            </NavIcon>
            
            <NavLabel active={active}>
              {item.label}
            </NavLabel>
          </NavItem>
        );
      })}
    </NavContainer>
  );
};

export default BottomNavigation;