import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEnhancedUser } from './contexts/EnhancedUserContext';

// Components
import LoadingScreen from './components/LoadingScreen';
import OnboardingFlow from './components/OnboardingFlow';
import AnonModeSetup from './components/AnonModeSetup';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Feed from './pages/Feed';
import Learn from './pages/Learn';
import Memory from './pages/Memory';
import Promises from './pages/Promises';
import Express from './pages/Express';
import YouthHub from './pages/YouthHub';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Editorial from './pages/Editorial';
import TrustScoreDashboard from './components/TrustScoreDashboard';
import EnhancedModerationQueue from './components/admin/EnhancedModerationQueue';
import StaffAuth from './components/StaffAuth';
import AdminSecurityPanel from './components/AdminSecurityPanel';
import RoleManagement from './components/admin/RoleManagement';

function App() {
  const { loading, isFirstTime, showAnonModeSetup } = useEnhancedUser();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isFirstTime) {
    return <OnboardingFlow />;
  }

  if (showAnonModeSetup) {
    return <AnonModeSetup />;
  }

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="feed" element={<Feed />} />
            <Route path="learn/*" element={<Learn />} />
            <Route path="memory" element={<Memory />} />
            <Route path="promises" element={<Promises />} />
            <Route path="express" element={<Express />} />
            <Route path="youth-hub" element={<YouthHub />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin/*" element={<Admin />} />
            <Route path="editorial" element={<Editorial />} />
            <Route path="trust-dashboard" element={<TrustScoreDashboard />} />
            <Route path="admin/moderate" element={<EnhancedModerationQueue />} />
            <Route path="admin/role-management" element={<RoleManagement />} />
            <Route path="staff-login" element={<StaffAuth />} />
            <Route path="admin/security" element={<AdminSecurityPanel />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;