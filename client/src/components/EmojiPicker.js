import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const EmojiPickerContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
`;

const EmojiPickerContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 24px;
  max-width: 320px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`;

const EmojiButton = styled(motion.button)`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border: 2px solid ${props => props.selected ? '#007AFF' : '#E5E5E7'};
  background: ${props => props.selected ? '#F0F8FF' : 'white'};
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    border-color: #007AFF;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled(motion.button)`
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  border: none;
  cursor: pointer;
  
  &.cancel {
    background: #F2F2F7;
    color: #666;
  }
  
  &.confirm {
    background: #007AFF;
    color: white;
  }
`;

const PrivacyNotice = styled.div`
  background: #F0F8FF;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  border-left: 4px solid #007AFF;
`;

const PrivacyIcon = styled.div`
  font-size: 16px;
  margin-bottom: 8px;
`;

const PrivacyText = styled.p`
  font-size: 12px;
  color: #333;
  margin: 0;
  line-height: 1.4;
`;

// Curated emoji list for avatars
const EMOJI_OPTIONS = [
  '🧑', '👤', '👥', '👨', '👩', '👶',
  '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰', '👨‍🦳', '👩‍🦳',
  '🦁', '🐯', '🐨', '🐼', '🐸', '🐙',
  '🦄', '🦋', '🦅', '🦉', '🦒', '🦘',
  '🌟', '⭐', '🌙', '☀️', '🌈', '🌺',
  '🌻', '🌹', '🌸', '🌼', '🌷', '🌱',
  '⚡', '🔥', '💧', '🌊', '🌍', '🌎',
  '🎭', '🎨', '🎪', '🎯', '🎲', '🎮',
  '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️',
  '💎', '💍', '💐', '💒', '💓', '💔'
];

const EmojiPicker = ({ isOpen, onClose, onSelect, currentEmoji = '🧑' }) => {
  const [selectedEmoji, setSelectedEmoji] = useState(currentEmoji);

  const handleConfirm = () => {
    onSelect(selectedEmoji);
    onClose();
  };

  const handleCancel = () => {
    setSelectedEmoji(currentEmoji);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <EmojiPickerContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCancel}
      >
        <EmojiPickerContent
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Header>
            <Title>Choose Your Avatar</Title>
            <Subtitle>Pick an emoji to represent you anonymously</Subtitle>
          </Header>

          <PrivacyNotice>
            <PrivacyIcon>🛡️</PrivacyIcon>
            <PrivacyText>
              <strong>100% Anonymous:</strong> Your emoji choice is stored locally and never linked to your identity.
            </PrivacyText>
          </PrivacyNotice>

          <EmojiGrid>
            {EMOJI_OPTIONS.map((emoji, index) => (
              <EmojiButton
                key={index}
                selected={selectedEmoji === emoji}
                onClick={() => setSelectedEmoji(emoji)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {emoji}
              </EmojiButton>
            ))}
          </EmojiGrid>

          <Actions>
            <Button 
              className="cancel" 
              onClick={handleCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </Button>
            <Button 
              className="confirm" 
              onClick={handleConfirm}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Confirm
            </Button>
          </Actions>
        </EmojiPickerContent>
      </EmojiPickerContainer>
    </AnimatePresence>
  );
};

export default EmojiPicker;
