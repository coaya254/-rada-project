import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';

const AnonContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: var(--light-card);
  display: flex;
  flex-direction: column;
`;

const Screen = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--light-card);
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
`;

const OrganicShape = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.2;
  z-index: 1;
  animation: float 6s ease-in-out infinite;
  
  &.shape-1 {
    width: 200px;
    height: 200px;
    background: var(--rada-orange);
    top: -50px;
    right: -50px;
  }
  
  &.shape-3 {
    width: 180px;
    height: 180px;
    background: var(--purple-accent);
    bottom: -60px;
    right: -30px;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  height: 40px;
  z-index: 10;
`;

const StatusTime = styled.span`
  font-weight: 700;
`;

const StatusIcons = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 14px;
  color: var(--text-primary);
`;

const BackButton = styled(motion.button)`
  position: absolute;
  top: 50px;
  left: 15px;
  width: 36px;
  height: 36px;
  background: var(--grad-glass-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  color: var(--text-primary);
  font-size: 16px;
  z-index: 20;
  backdrop-filter: blur(10px);
  border: 1px solid var(--light-border);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  
  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: scale(1.05);
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 5;
  overflow-y: auto;
`;

const AnonIcon = styled(motion.div)`
  width: 100px;
  height: 100px;
  background: var(--grad-glass-subtle);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(0, 0, 0, 0.1);
  font-size: 50px;
  color: var(--rada-teal);
  animation: float 6s ease-in-out infinite;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 15px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 25px;
  text-align: center;
  max-width: 280px;
`;

const Features = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 280px;
  margin-bottom: 25px;
`;

const Feature = styled(motion.div)`
  background: var(--grad-glass-light);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(5px);
  border: 1px solid var(--light-border);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const FeatureIcon = styled.div`
  font-size: 20px;
  color: var(--rada-teal);
  min-width: 32px;
`;

const FeatureText = styled.div`
  text-align: left;
  color: var(--text-primary);
  font-size: 13px;
`;

const FeatureTitle = styled.div`
  font-weight: 600;
  margin-bottom: 3px;
  color: var(--rada-teal);
`;

const Button = styled(motion.button)`
  padding: 14px 20px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &.primary {
    background: var(--grad-primary);
    color: var(--text-primary);
    font-weight: 700;
  
  &:hover {
      background: linear-gradient(135deg, #ffca28, #ffa000);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const HomeIndicator = styled.div`
  width: 100px;
  height: 4px;
  background: rgba(0,0,0,0.2);
  border-radius: 2px;
  margin: 0 auto 8px;
`;

// Step 2: Emoji Selection
const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 280px;
  margin-bottom: 25px;
`;

const EmojiCard = styled(motion.div)`
  background: var(--grad-glass-light);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 2px solid transparent;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  font-size: 28px;
  
  &:hover {
    background: var(--grad-glass-subtle);
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  }
  
  &.selected {
    background: var(--grad-glass-subtle);
    border-color: var(--rada-gold);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
`;

// Step 3: Nickname Input
const InputContainer = styled.div`
  width: 100%;
  max-width: 280px;
  margin-bottom: 25px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  font-size: 14px;
  background: var(--grad-glass-light);
  backdrop-filter: blur(10px);
  color: var(--text-primary);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--rada-teal);
    box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
`;

const InputLabel = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
  text-align: center;
`;

const AnonModeSetup = () => {
  const { completeAnonModeSetup } = useEnhancedUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [nickname, setNickname] = useState('');

  const emojis = ['😊', '🤖', '🦁', '🌟', '🎯', '🚀', '💡', '🎨', '🌍', '⚡', '🎪', '🎭'];

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      completeAnonModeSetup(selectedEmoji, nickname);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setSelectedEmoji(emoji);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Screen
            key="step-1"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <OrganicShape className="shape-1" />
            <OrganicShape className="shape-3" />
            
            <StatusBar>
              <StatusTime>9:41</StatusTime>
              <StatusIcons>
                <span>📶</span>
                <span>📶</span>
                <span>🔋</span>
              </StatusIcons>
            </StatusBar>
            
            <Content>
              <AnonIcon
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                🕵️
              </AnonIcon>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Title>AnonMode™ Activated</Title>
                <Subtitle>Your privacy is protected. No personal data collected.</Subtitle>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Features>
                  <Feature>
                    <FeatureIcon>🛡️</FeatureIcon>
                    <FeatureText>
                      <FeatureTitle>100% Anonymous</FeatureTitle>
                      <div>No sign-up required. Your identity remains private.</div>
                    </FeatureText>
                  </Feature>
                  
                  <Feature>
                    <FeatureIcon>🔐</FeatureIcon>
                    <FeatureText>
                      <FeatureTitle>Encrypted Backup</FeatureTitle>
                      <div>Secure cross-device access via encrypted QR codes</div>
                    </FeatureText>
                  </Feature>
                  
                  <Feature>
                    <FeatureIcon>🚫</FeatureIcon>
                    <FeatureText>
                      <FeatureTitle>No Tracking</FeatureTitle>
                      <div>We don't collect or sell your data. Ever.</div>
                    </FeatureText>
                  </Feature>
                </Features>
              </motion.div>
              
              <Button
                className="primary"
                onClick={handleNext}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue Anonymously
              </Button>
            </Content>
            
            <HomeIndicator />
          </Screen>
        );

      case 1:
  return (
          <Screen
            key="step-2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <OrganicShape className="shape-1" />
            <OrganicShape className="shape-3" />
            
            <BackButton
              onClick={handleBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ←
            </BackButton>
            
            <StatusBar>
              <StatusTime>9:41</StatusTime>
              <StatusIcons>
                <span>📶</span>
                <span>📶</span>
                <span>🔋</span>
              </StatusIcons>
            </StatusBar>
            
            <Content>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Title>Choose Your Avatar</Title>
                <Subtitle>Pick an emoji to represent you anonymously</Subtitle>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <EmojiGrid>
                  {emojis.map((emoji, index) => (
                    <EmojiCard
                      key={index}
                      className={selectedEmoji === emoji ? 'selected' : ''}
                      onClick={() => handleEmojiSelect(emoji)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                    >
                      {emoji}
                    </EmojiCard>
                  ))}
                </EmojiGrid>
              </motion.div>
              
              <Button
                className="primary"
                onClick={handleNext}
                disabled={!selectedEmoji}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ opacity: selectedEmoji ? 1 : 0.5 }}
              >
                Continue
              </Button>
            </Content>
            
            <HomeIndicator />
          </Screen>
        );

      case 2:
        return (
          <Screen
            key="step-3"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <OrganicShape className="shape-1" />
            <OrganicShape className="shape-3" />
            
            <BackButton
              onClick={handleBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ←
            </BackButton>
            
            <StatusBar>
              <StatusTime>9:41</StatusTime>
              <StatusIcons>
                <span>📶</span>
                <span>📶</span>
                <span>🔋</span>
              </StatusIcons>
            </StatusBar>
            
            <Content>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Title>Choose Your Nickname</Title>
                <Subtitle>Pick a name to identify yourself in the community</Subtitle>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <InputContainer>
                  <InputLabel>Nickname</InputLabel>
            <Input
              type="text"
                    placeholder="Enter your nickname..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
            />
                </InputContainer>
              </motion.div>
              
            <Button 
              className="primary" 
                onClick={handleNext}
                disabled={!nickname.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ opacity: nickname.trim() ? 1 : 0.5 }}
              >
                Complete Setup
            </Button>
            </Content>
            
            <HomeIndicator />
          </Screen>
        );

      default:
        return null;
    }
  };

  return (
    <AnonContainer>
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </AnonContainer>
  );
};

export default AnonModeSetup;
