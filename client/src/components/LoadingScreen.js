import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ffd54f, #ffb300);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const Logo = styled(motion.div)`
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
`;

const AppName = styled(motion.h1)`
  font-size: 36px;
  font-weight: 800;
  color: #333;
  margin-bottom: 16px;
  letter-spacing: -1px;
`;

const Tagline = styled(motion.p)`
  font-size: 16px;
  color: #555;
  margin-bottom: 40px;
  max-width: 280px;
  text-align: center;
  font-weight: 500;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 8px;
`;

const Dot = styled(motion.div)`
  width: 10px;
  height: 10px;
  background: #333;
  border-radius: 50%;
`;

const LoadingScreen = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const pulseVariants = {
    initial: { scale: 0.95 },
    animate: {
      scale: [0.95, 1.05, 0.95],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 0, -5],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <LoadingContainer>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Logo
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        >
          🤝
        </Logo>
        
        <AppName variants={itemVariants}>
          rada.ke
        </AppName>
        
        <Tagline variants={itemVariants}>
          Your Civic Engagement Platform
        </Tagline>
        
        <LoadingDots>
          {[0, 1, 2].map((index) => (
            <Dot
              key={index}
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.2 }}
            />
          ))}
        </LoadingDots>
      </motion.div>
    </LoadingContainer>
  );
};

export default LoadingScreen;