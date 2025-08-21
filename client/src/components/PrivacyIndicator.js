import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const PrivacyContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(0, 122, 255, 0.2);
  font-size: 12px;
  font-weight: 600;
  color: #007AFF;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 122, 255, 0.15);
    transform: translateY(-1px);
  }
  
  &.compact {
    padding: 4px 8px;
    font-size: 10px;
  }
  
  &.large {
    padding: 12px 16px;
    font-size: 14px;
  }
`;

const PrivacyIcon = styled.div`
  font-size: 14px;
  
  &.compact {
    font-size: 12px;
  }
  
  &.large {
    font-size: 16px;
  }
`;

const PrivacyText = styled.span`
  white-space: nowrap;
`;

const PrivacyTooltip = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 1000;
  margin-top: 8px;
  
  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #333;
  }
`;

const PrivacyIndicator = ({ 
  variant = 'default', 
  showTooltip = false, 
  onClick,
  className 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getIconSize = () => {
    switch (variant) {
      case 'compact': return 'compact';
      case 'large': return 'large';
      default: return '';
    }
  };

  const getContainerSize = () => {
    switch (variant) {
      case 'compact': return 'compact';
      case 'large': return 'large';
      default: return '';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <PrivacyContainer
      className={`${getContainerSize()} ${className || ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ position: 'relative' }}
    >
      <PrivacyIcon className={getIconSize()}>🛡️</PrivacyIcon>
      <PrivacyText>100% Anonymous</PrivacyText>
      
      {showTooltip && isHovered && (
        <PrivacyTooltip
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
        >
          Your identity is completely protected
        </PrivacyTooltip>
      )}
    </PrivacyContainer>
  );
};

export default PrivacyIndicator;
