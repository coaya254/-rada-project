import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import api from '../utils/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Badge definitions matching the project document
const BADGE_DEFINITIONS = {
  'admin': { emoji: '👑', name: 'Admin', description: 'Platform administrator with full access' },
  'civic_newbie': { emoji: '🌱', name: 'Civic Newbie', description: 'Welcome to civic engagement!' },
  'memory_keeper': { emoji: '🕯️', name: 'Memory Keeper', description: 'Honoring those who fought for justice' },
  'civic_student': { emoji: '📚', name: 'Civic Student', description: 'Learning the fundamentals of governance' },
  'community_helper': { emoji: '🤝', name: 'Community Helper', description: 'Building platform credibility' },
  'civic_storyteller': { emoji: '✍️', name: 'Civic Storyteller', description: 'Sharing civic experiences' },
  'truth_seeker': { emoji: '🔍', name: 'Truth Seeker', description: 'Tracking government accountability' },
  'quiz_master': { emoji: '🎯', name: 'Quiz Master', description: 'Mastering civic knowledge' },
  'community_leader': { emoji: '🌟', name: 'Community Leader', description: 'Guiding the next generation' },
  'data_explorer': { emoji: '📊', name: 'Data Explorer', description: 'Understanding policy through data' },
  'public_voice': { emoji: '🗣️', name: 'Public Voice', description: 'Amplifying youth sentiment' },
  'civic_scholar': { emoji: '👑', name: 'Civic Scholar', description: 'Mastering comprehensive civic education' },
  'democracy_guardian': { emoji: '🛡️', name: 'Democracy Guardian', description: 'Protecting information integrity' },
  'civic_journalist': { emoji: '📰', name: 'Civic Journalist', description: 'Professional-quality civic reporting' },
  'policy_analyst': { emoji: '🏛️', name: 'Policy Analyst', description: 'Deep policy understanding and communication' },
  'civic_professor': { emoji: '🎓', name: 'Civic Professor', description: 'Teaching the next generation of civic leaders' },
  'justice_advocate': { emoji: '⚖️', name: 'Justice Advocate', description: 'Championing accountability and transparency' },
  'democracy_champion': { emoji: '🌍', name: 'Democracy Champion', description: 'Exemplary civic leadership and impact' },
  'movement_builder': { emoji: '👥', name: 'Movement Builder', description: 'Creating real-world civic change' },
  'streak_warrior': { emoji: '🔥', name: 'Streak Warrior', description: 'Consistent civic engagement' },
  'early_adopter': { emoji: '🚀', name: 'Early Adopter', description: 'Pioneer of Kenyan civic tech' },
  'innovation_pioneer': { emoji: '💡', name: 'Innovation Pioneer', description: 'Shaping the future of civic engagement' },
  'crisis_responder': { emoji: '🏅', name: 'Crisis Responder', description: 'Reliable civic information during critical times' },
  'unity_builder': { emoji: '🌍', name: 'Unity Builder', description: 'Building bridges across communities' }
};

// XP thresholds for badge unlocks
const XP_THRESHOLDS = {
  'admin': 0, // Admin badge available immediately
  'civic_newbie': 0,
  'memory_keeper': 25,
  'civic_student': 50,
  'community_helper': 75,
  'civic_storyteller': 100,
  'truth_seeker': 150,
  'quiz_master': 200,
  'community_leader': 300,
  'data_explorer': 400,
  'public_voice': 500,
  'civic_scholar': 750,
  'democracy_guardian': 1000,
  'civic_journalist': 1200,
  'policy_analyst': 1500,
  'civic_professor': 2000,
  'justice_advocate': 2500,
  'democracy_champion': 3000,
  'movement_builder': 5000
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showAnonModeSetup, setShowAnonModeSetup] = useState(false);

  // Initialize user from localStorage or create new anonymous user
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const savedUserUuid = localStorage.getItem('rada_user_uuid');
        const savedProfile = localStorage.getItem('rada_user_profile');
        const anonModeCompleted = localStorage.getItem('rada_anonmode_setup_completed');
        
        // Check if AnonMode setup is needed
        if (!anonModeCompleted) {
          setShowAnonModeSetup(true);
        }
        
        if (savedUserUuid) {
          // Try to fetch existing user from server
          try {
            const response = await api.get(`/users/${savedUserUuid}`);
            const userData = response.data;
            
            // Merge with local profile data if available
            if (savedProfile) {
              const localProfile = JSON.parse(savedProfile);
              userData.nickname = localProfile.nickname || userData.nickname;
              userData.emoji = localProfile.emoji || userData.emoji;
              userData.county = localProfile.county || userData.county;
              userData.persona = localProfile.persona || userData.persona;
            }
            
            setUser(userData);
            
            // Check if AnonMode setup is needed
            if (!savedProfile || !userData.nickname || userData.nickname === 'Anonymous' || !anonModeCompleted) {
              setShowAnonModeSetup(true);
            }
          } catch (error) {
            // If user not found on server, create new one with same UUID
            await createNewUser(savedUserUuid);
          }
        } else {
          // First time user - show AnonMode setup
          setIsFirstTime(true);
          setShowAnonModeSetup(true);
          await createNewUser();
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        // Fallback: create basic user without server
        const fallbackUuid = uuidv4();
        setUser({
          uuid: fallbackUuid,
          nickname: 'Anonymous',
          emoji: '🧑',
          xp: 0,
          badges: ['civic_newbie'],
          streak: 0,
          county: '',
          persona: 'keeper'
        });
        localStorage.setItem('rada_user_uuid', fallbackUuid);
        setShowAnonModeSetup(true);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const createNewUser = async (existingUuid = null) => {
    try {
      const uuid = existingUuid || uuidv4();
      const defaultUser = {
        uuid,
        nickname: '', // Empty nickname to trigger AnonMode setup
        emoji: '🧑',
        county: ''
      };

      const response = await api.post('/users/create', defaultUser);
      const userData = { ...response.data, badges: ['civic_newbie'] };
      
      setUser(userData);
      localStorage.setItem('rada_user_uuid', userData.uuid);
      
      // Always show AnonMode setup for new users
      setShowAnonModeSetup(true);
      
      if (!existingUuid) {
        setIsFirstTime(true);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Save to localStorage immediately for AnonMode™
      localStorage.setItem('rada_user_profile', JSON.stringify({
        nickname: updatedUser.nickname,
        emoji: updatedUser.emoji,
        county: updatedUser.county,
        persona: updatedUser.persona
      }));

      // TODO: Send update to server when endpoint is ready
      // For now, we prioritize local storage for privacy
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const awardXP = async (action, xpAmount, referenceId = null, referenceType = null) => {
    if (!user) return;

    try {
      const response = await api.post(`/users/${user.uuid}/xp`, {
        action,
        xp: xpAmount,
        referenceId,
        referenceType
      });

      const newXP = response.data.xp;
      const currentBadges = user.badges || [];
      const newBadges = [...currentBadges];

      // Check for new badge unlocks
      Object.entries(XP_THRESHOLDS).forEach(([badgeKey, threshold]) => {
        if (newXP >= threshold && !currentBadges.includes(badgeKey)) {
          newBadges.push(badgeKey);
        }
      });

      // Update user state
      setUser(prevUser => ({
        ...prevUser,
        xp: newXP,
        badges: newBadges,
        last_active: new Date().toISOString().split('T')[0]
      }));

      return {
        newXP,
        badgesEarned: newBadges.filter(badge => !currentBadges.includes(badge))
      };
    } catch (error) {
      console.error('Error awarding XP:', error);
      return null;
    }
  };

  const updateStreak = () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.last_active;
    
    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const newStreak = lastActive === yesterdayStr ? user.streak + 1 : 1;
      
      setUser(prevUser => ({
        ...prevUser,
        streak: newStreak,
        last_active: today
      }));
    }
  };

  const getBadgeInfo = (badgeKey) => {
    return BADGE_DEFINITIONS[badgeKey] || {
      emoji: '❓',
      name: 'Unknown Badge',
      description: 'Badge information not available'
    };
  };

  const getPersonaInfo = (persona) => {
    const personas = {
      keeper: {
        emoji: '🕯️',
        name: 'KEEPER',
        title: 'Guardian of Memory',
        description: 'Focus on memorial entries and historical documentation',
        color: '#9c27b0'
      },
      tracker: {
        emoji: '🔍',
        name: 'TRACKER',
        title: 'Accountability Champion',
        description: 'Focus on promise tracking and evidence documentation',
        color: '#2196f3'
      },
      amplifier: {
        emoji: '📡',
        name: 'AMPLIFIER',
        title: 'Community Voice',
        description: 'Focus on storytelling and community organizing',
        color: '#ff9800'
      },
      educator: {
        emoji: '🎓',
        name: 'EDUCATOR',
        title: 'Civic Teacher',
        description: 'Focus on learning, teaching, and knowledge sharing',
        color: '#4caf50'
      }
    };
    
    return personas[persona] || personas.keeper;
  };

  const completeOnboarding = () => {
    setIsFirstTime(false);
    localStorage.setItem('rada_onboarding_completed', 'true');
  };

  const resetOnboarding = () => {
    setIsFirstTime(true);
    localStorage.removeItem('rada_onboarding_completed');
  };

  const completeAnonModeSetup = () => {
    setShowAnonModeSetup(false);
    localStorage.setItem('rada_anonmode_setup_completed', 'true');
  };

  const resetAnonModeSetup = () => {
    setShowAnonModeSetup(true);
    localStorage.removeItem('rada_anonmode_setup_completed');
  };

  const deleteUserData = () => {
    // AnonMode™: Allow complete data deletion
    localStorage.removeItem('rada_user_uuid');
    localStorage.removeItem('rada_user_profile');
    localStorage.removeItem('rada_onboarding_completed');
    localStorage.removeItem('rada_anonmode_setup_completed');
    setUser(null);
    setShowAnonModeSetup(true);
    setIsFirstTime(true);
  };

  const value = {
    user,
    loading,
    isFirstTime,
    showAnonModeSetup,
    updateProfile,
    awardXP,
    updateStreak,
    getBadgeInfo,
    getPersonaInfo,
    completeOnboarding,
    resetOnboarding,
    completeAnonModeSetup,
    resetAnonModeSetup,
    deleteUserData,
    createNewUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
