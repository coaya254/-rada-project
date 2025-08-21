import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import CreateContentModal from './CreateContentModal';

const FABContainer = styled.div`
  position: fixed;
  bottom: 90px;
  right: 20px;
  z-index: 999;
`;

const MainButton = styled(motion.button)`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }
`;

const SpeedDialContainer = styled(motion.div)`
  position: absolute;
  bottom: 70px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
`;

const SpeedDialItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SpeedDialButton = styled(motion.button)`
  width: 48px;
  height: 48px;
  background: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const SpeedDialLabel = styled(motion.div)`
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  backdrop-filter: blur(10px);
`;

const speedDialItems = [
  {
    icon: '✍️',
    label: 'Write Story',
    type: 'story',
    color: '#FF6B6B'
  },
  {
    icon: '🎙️',
    label: 'Record Audio',
    type: 'audio',
    color: '#4ECDC4'
  },
  {
    icon: '📝',
    label: 'Share Poem',
    type: 'poem',
    color: '#FF9800'
  },
  {
    icon: '📸',
    label: 'Upload Image',
    type: 'image',
    color: '#9C27B0'
  },
  {
    icon: '📊',
    label: 'Report Evidence',
    type: 'evidence',
    color: '#2196F3'
  }
];

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contentType, setContentType] = useState('story');

  const toggleSpeedDial = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (type) => {
    setContentType(type);
    setShowCreateModal(true);
    setIsOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      x: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: {
      opacity: 0,
      scale: 0,
      x: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <>
      <FABContainer>
        <AnimatePresence>
          {isOpen && (
            <SpeedDialContainer
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {speedDialItems.map((item, index) => (
                <SpeedDialItem
                  key={item.type}
                  variants={itemVariants}
                >
                  <SpeedDialLabel
                    variants={itemVariants}
                  >
                    {item.label}
                  </SpeedDialLabel>
                  <SpeedDialButton
                    variants={itemVariants}
                    onClick={() => handleItemClick(item.type)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ backgroundColor: item.color, color: 'white' }}
                  >
                    {item.icon}
                  </SpeedDialButton>
                </SpeedDialItem>
              ))}
            </SpeedDialContainer>
          )}
        </AnimatePresence>

        <MainButton
          onClick={toggleSpeedDial}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          ✏️
        </MainButton>
      </FABContainer>

      <CreateContentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        contentType={contentType}
      />
    </>
  );
};

export default FloatingActionButton;