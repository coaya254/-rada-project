import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useUser } from '../contexts/UserContext';

const OnboardingContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: ${props => props.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  flex-direction: column;
`;

const Shape = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.2;
  z-index: 1;
  animation: float 6s ease-in-out infinite;
  
  &.shape-1 {
    width: 200px;
    height: 200px;
    background: #ff9e80;
    top: -50px;
    right: -50px;
  }
  
  &.shape-2 {
    width: 150px;
    height: 150px;
    background: #80deea;
    bottom: -30px;
    left: -30px;
  }
  
  &.shape-3 {
    width: 180px;
    height: 180px;
    background: #ffab91;
    bottom: -60px;
    right: -30px;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`;

const OnboardingContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  position: relative;
  z-index: 5;
`;

const Illustration = styled.div`
  font-size: 80px;
  margin-bottom: 30px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const Description = styled.p`
  font-size: 18px;
  color: rgba(255,255,255,0.9);
  margin-bottom: 40px;
  max-width: 500px;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
  max-width: 400px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.1);
  padding: 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  font-size: 16px;
  text-align: left;
`;

const FeatureIcon = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`;

const ProgressDots = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 40px;
`;

const ProgressDot = styled(motion.button)`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: ${props => props.active ? 'white' : 'rgba(255,255,255,0.3)'};
  cursor: pointer;
  transition: all 0.3s ease;
`;

const Actions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const Button = styled(motion.button)`
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: white;
    color: #333;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }
  
  &.outline {
    background: transparent;
    color: white;
    border: 2px solid rgba(255,255,255,0.3);
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
`;

const HomeIndicator = styled.div`
  width: 100px;
  height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  margin: 0 auto 20px;
`;

const screens = [
  {
    id: 1,
    background: 'linear-gradient(135deg, #80deea, #4dd0e1)',
    illustration: '🌟',
    title: 'Welcome to rada.ke',
    description: 'Your voice matters! Join thousands of Kenyan youth making a difference in our communities.',
    features: [
      { icon: '📱', text: '100% Anonymous - Your privacy is protected' },
      { icon: '🎯', text: 'Earn XP & badges for civic engagement' },
      { icon: '🤝', text: 'Connect with youth across Kenya' }
    ]
  },
  {
    id: 2,
    background: 'linear-gradient(135deg, #ff9e80, #ff7043)',
    illustration: '🕯️',
    title: 'Honor Our Heroes',
    description: 'Light candles for those who fought for justice. Document protests that shaped our nation.',
    features: [
      { icon: '🕯️', text: 'Light candles for civic heroes' },
      { icon: '📜', text: 'Document protests & movements' },
      { icon: '📊', text: 'Track government promises' }
    ]
  },
  {
    id: 3,
    background: 'linear-gradient(135deg, #a5d6a7, #66bb6a)',
    illustration: '🏛️',
    title: 'Civic Education',
    description: 'Learn about governance, democracy, and your rights through interactive lessons and quizzes.',
    features: [
      { icon: '📚', text: 'Interactive civic lessons' },
      { icon: '🎮', text: 'Gamified learning experience' },
      { icon: '🏆', text: 'Earn badges and certificates' }
    ]
  },
  {
    id: 4,
    background: 'linear-gradient(135deg, #ba68c8, #ab47bc)',
    illustration: '🤝',
    title: 'Community Hub',
    description: 'Connect with youth groups, share stories, and access verified support services.',
    features: [
      { icon: '👥', text: 'Youth group directory' },
      { icon: '📝', text: 'Share your civic journey' },
      { icon: '🆘', text: 'Access support services' }
    ]
  }
];

const OnboardingFlow = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const { completeOnboarding } = useUser();

  const nextScreen = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const goToScreen = (index) => {
    setCurrentScreen(index);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const current = screens[currentScreen];

  return (
    <OnboardingContainer background={current.background}>
      <Shape className="shape-1" />
      <Shape className="shape-2" />
      <Shape className="shape-3" />
      
      <AnimatePresence mode="wait">
        <OnboardingContent
          key={currentScreen}
          as={motion.div}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Illustration>{current.illustration}</Illustration>
          
          <Title>{current.title}</Title>
          <Description>{current.description}</Description>
          
          <FeatureList>
            {current.features.map((feature, index) => (
              <FeatureItem key={index}>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <div>{feature.text}</div>
              </FeatureItem>
            ))}
          </FeatureList>
          
          <ProgressDots>
            {screens.map((_, index) => (
              <ProgressDot 
                key={index} 
                active={index === currentScreen}
                onClick={() => goToScreen(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </ProgressDots>
          
          <Actions>
            {currentScreen === 0 ? (
              <Button 
                className="outline"
                onClick={skipOnboarding}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Skip
              </Button>
            ) : (
              <Button 
                className="outline"
                onClick={prevScreen}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </Button>
            )}
            
            <Button 
              className="primary"
              onClick={nextScreen}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentScreen === screens.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </Actions>
        </OnboardingContent>
      </AnimatePresence>
      
      <HomeIndicator />
    </OnboardingContainer>
  );
};

export default OnboardingFlow;
