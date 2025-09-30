import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface User {
  uuid: string;
  nickname: string;
  emoji: string;
  xp: number;
  streak: number;
  trust_score: number;
  role: 'anonymous' | 'trusted' | 'educator' | 'moderator' | 'admin';
  persona: string;
  created_at: string;
  last_active: string;
}

export interface TrustEvent {
  id: string;
  type: string;
  change: number;
  reason: string;
  timestamp: string;
}

export interface PersonaInfo {
  name: string;
  emoji: string;
  description: string;
  color: string;
}

// Permission Matrix
const PERMISSION_MATRIX = {
  anonymous: ['view_content', 'create_posts', 'earn_xp'],
  trusted: ['view_content', 'create_posts', 'earn_xp', 'moderate_content', 'access_advanced_features'],
  educator: ['view_content', 'create_posts', 'earn_xp', 'moderate_content', 'access_advanced_features', 'create_educational_content'],
  moderator: ['view_content', 'create_posts', 'earn_xp', 'moderate_content', 'access_advanced_features', 'create_educational_content', 'manage_users'],
  admin: ['view_content', 'create_posts', 'earn_xp', 'moderate_content', 'access_advanced_features', 'create_educational_content', 'manage_users', 'assign_roles', 'system_management']
};

// Persona Definitions
const PERSONA_DEFINITIONS: Record<string, PersonaInfo> = {
  'civic-champion': {
    name: 'Civic Champion',
    emoji: '🏆',
    description: 'Dedicated to civic engagement and community building',
    color: '#FFD700'
  },
  'knowledge-seeker': {
    name: 'Knowledge Seeker',
    emoji: '📚',
    description: 'Passionate about learning and sharing knowledge',
    color: '#4CAF50'
  },
  'community-builder': {
    name: 'Community Builder',
    emoji: '🤝',
    description: 'Focused on connecting and empowering communities',
    color: '#2196F3'
  },
  'change-maker': {
    name: 'Change Maker',
    emoji: '⚡',
    description: 'Driving positive change and innovation',
    color: '#FF5722'
  }
};

// Badge Definitions
const BADGE_DEFINITIONS = {
  'first-post': { name: 'First Post', emoji: '📝', description: 'Created your first post' },
  'streak-7': { name: 'Week Warrior', emoji: '🔥', description: '7-day activity streak' },
  'streak-30': { name: 'Monthly Master', emoji: '🌟', description: '30-day activity streak' },
  'xp-1000': { name: 'XP Collector', emoji: '💎', description: 'Earned 1000 XP' },
  'trust-50': { name: 'Trust Builder', emoji: '🛡️', description: 'Reached 50 trust score' },
  'civic-helper': { name: 'Civic Helper', emoji: '🤲', description: 'Helped 10 community members' }
};

interface UserContextType {
  user: User | null;
  loading: boolean;
  isFirstTime: boolean;
  completeOnboarding: () => void;
  clearAllData: () => void;
  getPersonaInfo: (persona: string) => PersonaInfo;
  getBadgeInfo: (badgeId: string) => any;
  updateStreak: () => void;
  hasPermission: (permission: string) => boolean;
  checkPermission: (permission: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setFirstTime] = useState(true);


  // Initialize user state
  useEffect(() => {
    console.log('🚀 UserContext: Starting initialization...');
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      console.log('🚀 UserContext: Starting initialization...');
      setLoading(true);
      
      // Load existing data normally
      console.log('📱 Loading existing data...');
      
      // Check if user has completed onboarding
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      console.log('📱 UserContext: onboardingCompleted =', onboardingCompleted);
      
      if (!onboardingCompleted) {
        console.log('🎯 UserContext: Setting isFirstTime to true');
        setFirstTime(true);
        setLoading(false);
        return;
      }

      // Skip AnonMode setup check - go directly to main app
      console.log('🕵️ UserContext: Skipping AnonMode setup');

      // Load existing user data
      const userData = await AsyncStorage.getItem('userData');
      console.log('👤 UserContext: userData =', userData ? 'exists' : 'null');
      
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        // Create new user if none exists
        await createNewUser();
      }
    } catch (error) {
      console.error('❌ UserContext: Error initializing user:', error);
    } finally {
      console.log('✅ UserContext: Setting loading to false');
      setLoading(false);
    }
  };

  const createNewUser = async () => {
    const newUser: User = {
      uuid: generateUUID(),
      nickname: 'Anonymous User',
      emoji: '😊',
      xp: 0,
      streak: 0,
      trust_score: 0,
      role: 'anonymous',
      persona: 'civic-champion',
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    };

    setUser(newUser);
    await AsyncStorage.setItem('userData', JSON.stringify(newUser));
  };

  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    setFirstTime(false);
    // Skip AnonModeSetup and go directly to main app
    console.log('🎯 Onboarding completed, going to main app');
  };



  // Clear all data to reset the app
  const clearAllData = async () => {
    try {
      console.log('🧹 Clearing all stored data...');
      await AsyncStorage.removeItem('onboardingCompleted');
      await AsyncStorage.removeItem('userData');
      
      // Reset all state
      setUser(null);
      setFirstTime(true);
      setLoading(false);
      
      console.log('✅ All data cleared, showing onboarding flow');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
    }
  };

  const getPersonaInfo = (persona: string): PersonaInfo => {
    return PERSONA_DEFINITIONS[persona] || PERSONA_DEFINITIONS['civic-champion'];
  };

  const getBadgeInfo = (badgeId: string) => {
    return BADGE_DEFINITIONS[badgeId as keyof typeof BADGE_DEFINITIONS] || null;
  };

  const updateStreak = async () => {
    if (!user) return;

    const today = new Date().toDateString();
    const lastActive = new Date(user.last_active).toDateString();
    
    let newStreak = user.streak;
    if (today === lastActive) {
      // User already active today
      return;
    } else if (new Date(user.last_active).getTime() > new Date().getTime() - 2 * 24 * 60 * 60 * 1000) {
      // User was active yesterday, increment streak
      newStreak += 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    const updatedUser = { ...user, streak: newStreak, last_active: new Date().toISOString() };
    setUser(updatedUser);
    await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return PERMISSION_MATRIX[user.role]?.includes(permission) || false;
  };

  const checkPermission = (permission: string): boolean => {
    return hasPermission(permission);
  };



  const value: UserContextType = {
    user,
    loading,
    isFirstTime,
    completeOnboarding,
    clearAllData,
    getPersonaInfo,
    getBadgeInfo,
    updateStreak,
    hasPermission,
    checkPermission
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
