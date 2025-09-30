import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AnonModeService, { AnonModeUser } from '../services/AnonModeService';
import apiService from '../services/api';

interface AnonModeContextType {
  user: AnonModeUser | null;
  loading: boolean;
  isFirstTime: boolean;
  isAnonymous: boolean;
  needsLogin: boolean;
  
  // User management
  initializeUser: () => Promise<void>;
  loginWithUUID: (uuid: string, password?: string, rememberMe?: boolean) => Promise<void>;
  updateProfile: (profileData: Partial<AnonModeUser>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  completeSetup: () => Promise<void>;
  clearAllData: () => Promise<void>;
  
  // XP and progression
  addXP: (amount: number, reason: string) => Promise<{ newLevel: boolean; level: number; xp: number }>;
  updateStreak: () => Promise<number>;
  addBadge: (badgeId: string) => Promise<void>;
  
  // Privacy controls
  updatePrivacySettings: (settings: Partial<AnonModeUser['privacySettings']>) => Promise<void>;
  getPrivacySettings: () => Promise<AnonModeUser['privacySettings'] | null>;
  
  // Display helpers
  getDisplayName: () => string;
  getDisplayPicture: () => string;
  isAnonymousMode: () => boolean;
}

const AnonModeContext = createContext<AnonModeContextType | undefined>(undefined);

export const useAnonMode = () => {
  const context = useContext(AnonModeContext);
  if (context === undefined) {
    throw new Error('useAnonMode must be used within an AnonModeProvider');
  }
  return context;
};

interface AnonModeProviderProps {
  children: ReactNode;
}

export const AnonModeProvider: React.FC<AnonModeProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AnonModeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);

  const anonModeService = AnonModeService.getInstance();

  const initializeUser = useCallback(async () => {
    try {
      console.log('🔒 AnonMode™ Context: Initializing...');
      setLoading(true);

      // Check if user has existing account
      const existingUser = await anonModeService.getExistingUser();
      
      if (existingUser) {
        console.log('🔒 AnonMode™ Context: Existing user found, but FORCING login screen for testing');
        // Clear existing user data for testing
        await anonModeService.clearAllData();
        setIsFirstTime(false);
        setNeedsLogin(true);
        setLoading(false);
        return;
      }

      // For testing - DISABLED to show main app content
      // console.log('🔒 AnonMode™ Context: FORCING login screen for testing');
      // setIsFirstTime(false);
      // setNeedsLogin(true);
      // setLoading(false);
      // return;

      // Check if onboarding is completed
      const onboardingCompleted = await anonModeService.isOnboardingCompleted();
      console.log('🔒 AnonMode™ Context: Onboarding completed:', onboardingCompleted);

      if (!onboardingCompleted) {
        console.log('🔒 AnonMode™ Context: First time user, showing onboarding');
        setIsFirstTime(true);
        setNeedsLogin(false);
        setLoading(false);
        return;
      }

      // User completed onboarding but no account found - needs login
      console.log('🔒 AnonMode™ Context: Onboarding completed but no account, showing login');
      setIsFirstTime(false);
      setNeedsLogin(true);
      setLoading(false);
    } catch (error) {
      console.error('❌ AnonMode™ Context: Initialization failed:', error);
      setNeedsLogin(true);
    } finally {
      setLoading(false);
    }
  }, [anonModeService]);

  // Initialize AnonMode™ system
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const loginWithUUID = async (uuid: string, password?: string, rememberMe?: boolean) => {
    try {
      console.log('🔒 AnonMode™ Context: Logging in with UUID:', uuid.substring(0, 8) + '...', 'Remember Me:', rememberMe);
      setLoading(true);

      // Verify UUID and get user data
      const userData = await anonModeService.verifyUser(uuid, password);
      
      console.log('🔒 AnonMode™ Context: User data received from service:', {
        uuid: userData.uuid?.substring(0, 8) + '...',
        nickname: userData.nickname,
        isAnonymous: userData.isAnonymous,
        hasPassword: !!userData.password
      });
      
      setUser(userData);
      setIsAnonymous(userData.isAnonymous);
      setIsFirstTime(false);
      setNeedsLogin(false);
      
      // Set user data in API service for requests
      apiService.setCurrentUser(userData);

      // Handle remember me functionality
      if (rememberMe) {
        await anonModeService.saveRememberMeSession(userData);
      } else {
        await anonModeService.clearRememberMeSession();
      }

      console.log('🔒 AnonMode™ Context: Login successful, user state updated:', {
        uuid: userData.uuid?.substring(0, 8) + '...',
        nickname: userData.nickname,
        isAnonymous: userData.isAnonymous,
        contextUserSet: !!userData
      });
    } catch (error) {
      console.error('❌ AnonMode™ Context: Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<AnonModeUser>) => {
    try {
      const updatedUser = await anonModeService.updateProfile(profileData);
      setUser(updatedUser);
      
      // Update user data in API service
      apiService.setCurrentUser(updatedUser);
      
      console.log('🔒 AnonMode™ Context: Profile updated');
    } catch (error) {
      console.error('❌ AnonMode™ Context: Failed to update profile:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      await anonModeService.completeOnboarding();
      setIsFirstTime(false);
      // Don't initialize user yet - let setup screen handle that
      console.log('🔒 AnonMode™ Context: Onboarding completed, going to setup');
    } catch (error) {
      console.error('❌ AnonMode™ Context: Failed to complete onboarding:', error);
      throw error;
    }
  };

  const completeSetup = async () => {
    try {
      // Initialize user after setup is complete
      const userData = await anonModeService.initialize();
      setUser(userData);
      setIsAnonymous(userData.isAnonymous);
      
      console.log('🔒 AnonMode™ Context: Setup completed, user initialized');
    } catch (error) {
      console.error('❌ AnonMode™ Context: Failed to complete setup:', error);
      throw error;
    }
  };

  const clearAllData = async () => {
    try {
      await anonModeService.clearAllData();
      setUser(null);
      setIsAnonymous(true);
      setIsFirstTime(false);
      setNeedsLogin(true);
      console.log('🔒 AnonMode™ Context: All data cleared, showing login screen');
    } catch (error) {
      console.error('❌ AnonMode™ Context: Failed to clear data:', error);
      throw error;
    }
  };

  const addXP = async (amount: number, reason: string) => {
    try {
      const result = await anonModeService.addXP(amount, reason);
      
      // Update local user state
      if (user) {
        setUser({
          ...user,
          xp: result.xp,
          level: result.level,
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ AnonMode™ Context: Failed to add XP:', error);
      throw error;
    }
  };

  const updateStreak = async () => {
    try {
      const newStreak = await anonModeService.updateStreak();
      
      // Update local user state
      if (user) {
        setUser({
          ...user,
          streak: newStreak,
          lastActive: new Date().toISOString(),
        });
      }
      
      return newStreak;
    } catch (error) {
      console.error('❌ AnonMode™ Context: Failed to update streak:', error);
      throw error;
    }
  };

  const addBadge = async (badgeId: string) => {
    try {
      await anonModeService.addBadge(badgeId);
      
      // Update local user state
      if (user && !user.badges.includes(badgeId)) {
        setUser({
          ...user,
          badges: [...user.badges, badgeId],
        });
      }
    } catch (error) {
      console.error('❌ AnonMode™ Context: Failed to add badge:', error);
      throw error;
    }
  };

  const updatePrivacySettings = async (settings: Partial<AnonModeUser['privacySettings']>) => {
    try {
      await anonModeService.updatePrivacySettings(settings);
      
      // Update local user state
      if (user) {
        setUser({
          ...user,
          privacySettings: {
            ...user.privacySettings,
            ...settings,
          },
        });
      }
    } catch (error) {
      console.error('❌ AnonMode™ Context: Failed to update privacy settings:', error);
      throw error;
    }
  };

  const getPrivacySettings = async () => {
    try {
      return await anonModeService.getPrivacySettings();
    } catch (error) {
      console.error('❌ AnonMode™ Context: Failed to get privacy settings:', error);
      return null;
    }
  };

  const getDisplayName = () => {
    return anonModeService.getDisplayName();
  };

  const getDisplayPicture = () => {
    return anonModeService.getDisplayPicture();
  };

  const isAnonymousMode = () => {
    return anonModeService.isAnonymousMode();
  };

  const value: AnonModeContextType = {
    user,
    loading,
    isFirstTime,
    isAnonymous,
    needsLogin,
    initializeUser,
    loginWithUUID,
    updateProfile,
    completeOnboarding,
    completeSetup,
    clearAllData,
    addXP,
    updateStreak,
    addBadge,
    updatePrivacySettings,
    getPrivacySettings,
    getDisplayName,
    getDisplayPicture,
    isAnonymousMode,
  };

  return (
    <AnonModeContext.Provider value={value}>
      {children}
    </AnonModeContext.Provider>
  );
};

export default AnonModeContext;
