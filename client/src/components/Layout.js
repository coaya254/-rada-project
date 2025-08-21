import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';

import BottomNavigation from './BottomNavigation';
import FloatingActionButton from './FloatingActionButton';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--light-bg);
  max-width: 480px;
  margin: 0 auto;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  @media (max-width: 480px) {
    max-width: 100%;
    margin: 0;
    box-shadow: none;
  }
`;

const TopGradientLine = styled.div`
  height: 4px;
  background: linear-gradient(90deg, #4caf50, #81c784, #4caf50);
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 80px; /* Space for bottom navigation */
  overflow: hidden;
`;

const PageTransition = styled(motion.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Layout = () => {
  const location = useLocation();
  const { user } = useEnhancedUser();

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const hideFloatingButton = ['/admin', '/profile'].some(path => 
    location.pathname.startsWith(path)
  );

    return (
    <LayoutContainer>
      <TopGradientLine />
      
      <MainContent>
        <PageTransition
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Outlet />
        </PageTransition>
      </MainContent>

      {!hideFloatingButton && (
        <FloatingActionButton />
      )}

      <BottomNavigation />
    </LayoutContainer>
  );
};

export default Layout;