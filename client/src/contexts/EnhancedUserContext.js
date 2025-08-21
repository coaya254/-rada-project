import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import api from '../utils/api';

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

const EnhancedUserContext = createContext();

export const useEnhancedUser = () => {
  const context = useContext(EnhancedUserContext);
  if (!context) {
    throw new Error('useEnhancedUser must be used within an EnhancedUserProvider');
  }
  return context;
};

// Enhanced permission matrix - ADMIN CONTROLLED ONLY
const PERMISSION_MATRIX = {
  // Anonymous users - BASIC PERMISSIONS ONLY
  anonymous: {
    submit_posts: true,
    vote_polls: true,
    light_candles: true,
    complete_learning: true,
    submit_evidence: true,
    comment_posts: true,
    flag_content: true,
    access_directory: true,
    earn_xp: true,
    // NO automatic elevated permissions - admin must assign
    peer_review: false,
    create_challenges: false,
    auto_approve_content: false,
    fast_track_review: false
  },
  
  // Trusted users - ADMIN ASSIGNED ONLY
  trusted: {
    submit_posts: true,
    auto_approve_content: true,
    peer_review: true,
    fast_track_review: true,
    create_challenges: true,
    vote_polls: true,
    light_candles: true,
    complete_learning: true,
    submit_evidence: true,
    comment_posts: true,
    flag_content: true,
    access_directory: true,
    earn_xp: true
  },
  
  // Educators - ADMIN ASSIGNED ONLY
  educator: {
    create_lessons: true,
    create_quizzes: true,
    moderate_learning: true,
    view_learning_analytics: true,
    mentor_users: true,
    create_certifications: true,
    // Basic permissions
    submit_posts: true,
    vote_polls: true,
    light_candles: true,
    complete_learning: true,
    submit_evidence: true,
    comment_posts: true,
    flag_content: true,
    access_directory: true,
    earn_xp: true
  },
  
  // Moderators - ADMIN ASSIGNED ONLY
  moderator: {
    approve_content: true,
    manage_flags: true,
    verify_evidence: true,
    manage_civic_memory: true,
    escalate_to_admin: true,
    fast_track_trusted: true,
    issue_warnings: true,
    // Basic permissions
    submit_posts: true,
    vote_polls: true,
    light_candles: true,
    complete_learning: true,
    submit_evidence: true,
    comment_posts: true,
    flag_content: true,
    access_directory: true,
    earn_xp: true
  },
  
  // Admins - FULL ACCESS
  admin: {
    '*': true, // all permissions
    // Role management permissions
    assign_roles: true,
    revoke_roles: true,
    view_all_users: true,
    manage_user_permissions: true
  }
};

// Enhanced anonymous user generation
const generateAnonymousUser = () => {
  const emojis = ['😊', '🌟', '💫', '✨', '🎯', '🚀', '💡', '🔥', '🌈', '🎨', '🎭', '🎪', '🎯', '🎲', '🎮'];
  
  return {
    uuid: uuidv4(),
    nickname: '',
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    xp: 0,
    badges: [],
    streak_days: 0,
    trust_score: 1.0,
    county: null,
    preferences: {
      notifications: true,
      content_types: ['all'],
      language: 'en'
    },
    role: 'anonymous',
    created_at: new Date(),
    last_active: new Date()
  };
};

// Enhanced user storage with backup
const saveUser = (user) => {
  try {
    localStorage.setItem('rada_user', JSON.stringify(user));
    localStorage.setItem('rada_user_backup', JSON.stringify({
      uuid: user.uuid,
      created_at: user.created_at,
      trust_score: user.trust_score
    }));
    return true;
  } catch (error) {
    console.error('Failed to save user:', error);
    return false;
  }
};

// Helper function to check if user has permission - ADMIN CONTROLLED ONLY
const hasPermission = (user, permission) => {
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Check specific permissions assigned by admin
  if (user.permissions?.includes(permission)) return true;
  
  // Check role-based permissions ONLY (no automatic trust-based elevation)
  const rolePermissions = PERMISSION_MATRIX[user.role];
  return rolePermissions?.[permission] || false;
};

// Trust score level helper
const getTrustLevel = (trustScore) => {
  if (trustScore >= 4.0) return { level: 'exemplary', color: 'gold', label: 'Exemplary Citizen' };
  if (trustScore >= 3.0) return { level: 'trusted', color: 'green', label: 'Trusted Member' };
  if (trustScore >= 2.0) return { level: 'reliable', color: 'blue', label: 'Reliable Contributor' };
  if (trustScore >= 1.5) return { level: 'building', color: 'orange', label: 'Building Trust' };
  return { level: 'new', color: 'gray', label: 'New Member' };
};

export const EnhancedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showAnonModeSetup, setShowAnonModeSetup] = useState(false);
  const [trustEvents, setTrustEvents] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [permissions, setPermissions] = useState({});

  // Initialize user from localStorage or create new anonymous user
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const savedUserUuid = localStorage.getItem('rada_user_uuid');
        const savedProfile = localStorage.getItem('rada_user_profile');
        const anonModeCompleted = localStorage.getItem('rada_anonmode_setup_completed');
        
        // If AnonMode setup is not completed, don't create a user yet
        if (!anonModeCompleted) {
          setShowAnonModeSetup(true);
          setLoading(false);
          return; // Exit early - no user should exist yet
        }
        
        // Only proceed with user creation/loading if AnonMode setup is completed
        if (savedUserUuid) {
          // Try to fetch existing user from server
          try {
            const response = await api.get(`/users/stats/${savedUserUuid}`);
            const userData = response.data.user;
            
            // Merge with local profile data if available
            if (savedProfile) {
              const localProfile = JSON.parse(savedProfile);
              userData.nickname = localProfile.nickname || userData.nickname;
              userData.emoji = localProfile.emoji || userData.emoji;
              userData.county = localProfile.county || userData.county;
              userData.persona = localProfile.persona || userData.persona;
            }
            
            setUser(userData);
            setUserStats(response.data.stats);
            
            // Calculate permissions
            const userPermissions = {};
            Object.keys(PERMISSION_MATRIX.anonymous).forEach(permission => {
              userPermissions[permission] = hasPermission(userData, permission);
            });
            setPermissions(userPermissions);
            
          } catch (error) {
            console.error('Failed to fetch user from server:', error);
            // If server fetch fails, show AnonMode setup again
            setShowAnonModeSetup(true);
          }
        } else {
          // No saved user UUID, show AnonMode setup
          setShowAnonModeSetup(true);
        }
      } catch (error) {
        console.error('User initialization error:', error);
        // Fallback to AnonMode setup
        setShowAnonModeSetup(true);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Update user permissions when user changes
  useEffect(() => {
    if (user) {
      const userPermissions = {};
      Object.keys(PERMISSION_MATRIX.anonymous).forEach(permission => {
        userPermissions[permission] = hasPermission(user, permission);
      });
      setPermissions(userPermissions);
    }
  }, [user]);

  // Sync user with server
  const syncUser = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await api.post('/users/sync', { user });
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      saveUser(updatedUser);
      
      // Update permissions
      const userPermissions = {};
      Object.keys(PERMISSION_MATRIX.anonymous).forEach(permission => {
        userPermissions[permission] = hasPermission(updatedUser, permission);
      });
      setPermissions(userPermissions);
      
    } catch (error) {
      console.error('User sync failed:', error);
    }
  }, [user]);

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      saveUser(updatedUser);
      
      // Sync with server
      await syncUser();
      
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  }, [user, syncUser]);

  // Award XP
  const awardXP = useCallback(async (amount, reason, multiplier = 1.0) => {
    if (!user) return;
    
    try {
      const xpGained = Math.floor(amount * multiplier);
      const updatedUser = {
        ...user,
        xp: user.xp + xpGained
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
      
      // Record XP transaction
      await api.post('/xp/transaction', {
        userUuid: user.uuid,
        action: reason,
        xpEarned: xpGained,
        multiplier,
        trustBonus: user.trust_score > 2.0
      });
      
      // Sync with server
      await syncUser();
      
      return xpGained;
    } catch (error) {
      console.error('XP award failed:', error);
      return 0;
    }
  }, [user, syncUser]);

  // Update trust score
  const updateTrustScore = useCallback(async (change, reason) => {
    if (!user) return;
    
    try {
      const newTrustScore = Math.max(0.1, Math.min(5.0, user.trust_score + change));
      const updatedUser = {
        ...user,
        trust_score: newTrustScore
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
      
      // Record trust event
      await api.post('/trust/event', {
        userUuid: user.uuid,
        eventType: reason,
        trustChange: change,
        reason
      });
      
      // Update permissions if trust score crosses threshold
      if ((user.trust_score < 2.0 && newTrustScore >= 2.0) || 
          (user.trust_score < 2.5 && newTrustScore >= 2.5)) {
        const userPermissions = {};
        Object.keys(PERMISSION_MATRIX.anonymous).forEach(permission => {
          userPermissions[permission] = hasPermission(updatedUser, permission);
        });
        setPermissions(userPermissions);
      }
      
      return newTrustScore;
    } catch (error) {
      console.error('Trust score update failed:', error);
      return user.trust_score;
    }
  }, [user]);

  // Check permission
  const checkPermission = useCallback((permission) => {
    if (!user) return false;
    return hasPermission(user, permission);
  }, [user]);

  // Get trust level info
  const getTrustLevelInfo = useCallback(() => {
    if (!user) return null;
    return getTrustLevel(user.trust_score);
  }, [user]);

  // Reset AnonMode setup (for testing)
  const resetAnonModeSetup = useCallback(() => {
    localStorage.removeItem('rada_anonmode_setup_completed');
    localStorage.removeItem('rada_user_uuid');
    localStorage.removeItem('rada_user');
    localStorage.removeItem('rada_user_backup');
    setUser(null);
    setShowAnonModeSetup(true);
  }, []);

  // Complete AnonMode setup
  const completeAnonModeSetup = useCallback(async (setupData) => {
    try {
      // Create a new anonymous user with the setup data
      const newUser = {
        ...generateAnonymousUser(),
        nickname: setupData.nickname || '',
        emoji: setupData.emoji || '🧑',
        county: setupData.county || null,
        preferences: {
          ...generateAnonymousUser().preferences,
          ...setupData.preferences
        }
      };
      
      // Set the new user
      setUser(newUser);
      saveUser(newUser);
      
      // Mark setup as completed
      localStorage.setItem('rada_anonmode_setup_completed', 'true');
      localStorage.setItem('rada_user_uuid', newUser.uuid);
      
      // Hide AnonMode setup
      setShowAnonModeSetup(false);
      
      // Sync with server
      await syncUser();
      
    } catch (error) {
      console.error('AnonMode setup failed:', error);
    }
  }, [syncUser]);

  // Staff login
  const staffLogin = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/staff/login', { email, password });
      const { token, user: staffUser } = response.data;
      
      // Set staff user
      setUser({
        ...staffUser,
        isStaffUser: true
      });
      
      // Set auth token
      localStorage.setItem('rada_staff_token', token);
      
      // Set permissions
      const staffPermissions = {};
      if (staffUser.permissions?.includes('*')) {
        // Admin has all permissions
        Object.keys(PERMISSION_MATRIX).forEach(role => {
          Object.keys(PERMISSION_MATRIX[role]).forEach(permission => {
            staffPermissions[permission] = true;
          });
        });
      } else {
        staffUser.permissions?.forEach(permission => {
          staffPermissions[permission] = true;
        });
      }
      setPermissions(staffPermissions);
      
      return { success: true, user: staffUser };
    } catch (error) {
      console.error('Staff login failed:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Staff logout
  const staffLogout = useCallback(async () => {
    try {
      await api.post('/auth/staff/logout');
    } catch (error) {
      console.error('Staff logout error:', error);
    } finally {
      // Clear staff data
      localStorage.removeItem('rada_staff_token');
      setUser(null);
      setPermissions({});
    }
  }, []);

  // Global logout function
  const globalLogout = useCallback(async () => {
    try {
      // Call global logout endpoint
      await api.post('/auth/global-logout');
      
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Reset state
      setUser(null);
      setPermissions({});
      setTrustEvents([]);
      setUserStats(null);
      setShowAnonModeSetup(true);
      setIsFirstTime(true);
      
      // Force page reload to ensure clean state
      window.location.reload();
      
      return { success: true };
    } catch (error) {
      console.error('Global logout failed:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Enhanced user logout
  const logout = useCallback(async () => {
    try {
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Reset state
      setUser(null);
      setPermissions({});
      setTrustEvents([]);
      setUserStats(null);
      setShowAnonModeSetup(true);
      setIsFirstTime(true);
      
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Get user analytics
  const getUserAnalytics = useCallback(async () => {
    if (!user) return null;
    
    try {
      const response = await api.get(`/analytics/user/${user.uuid}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      return null;
    }
  }, [user]);

  // Get trust events
  const getTrustEvents = useCallback(async () => {
    if (!user) return [];
    
    try {
      const response = await api.get(`/trust/events/${user.uuid}`);
      setTrustEvents(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get trust events:', error);
      return [];
    }
  }, [user]);

  // Complete onboarding
  const completeOnboarding = useCallback(() => {
    setIsFirstTime(false);
  }, []);

  // Get persona info
  const getPersonaInfo = useCallback((persona) => {
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
  }, []);

  // Get badge info
  const getBadgeInfo = useCallback((badgeKey) => {
    return BADGE_DEFINITIONS[badgeKey] || {
      emoji: '❓',
      name: 'Unknown Badge',
      description: 'Badge information not available'
    };
  }, []);

  // Update streak
  const updateStreak = useCallback(() => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.last_active;
    
    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const newStreak = lastActive === yesterdayStr ? user.streak_days + 1 : 1;
      
      setUser(prevUser => ({
        ...prevUser,
        streak_days: newStreak,
        last_active: today
      }));
    }
  }, [user]);

  // ADMIN FUNCTIONS - Role Management
  
  // Assign role to user (admin only)
  const assignUserRole = useCallback(async (targetUserUuid, newRole, reason = '') => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only admins can assign roles');
    }
    
    try {
      const response = await api.post('/admin/assign-role', {
        targetUserUuid,
        newRole,
        assignedBy: user.uuid,
        reason,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to assign role:', error);
      throw error;
    }
  }, [user]);

  // Revoke role from user (admin only)
  const revokeUserRole = useCallback(async (targetUserUuid, reason = '') => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only admins can revoke roles');
    }
    
    try {
      const response = await api.post('/admin/revoke-role', {
        targetUserUuid,
        revokedBy: user.uuid,
        reason,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to revoke role:', error);
      throw error;
    }
  }, [user]);

  // Get all users for admin management
  const getAllUsers = useCallback(async () => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only admins can view all users');
    }
    
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Failed to get users:', error);
      throw error;
    }
  }, [user]);

  // Get user role history
  const getUserRoleHistory = useCallback(async (targetUserUuid) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only admins can view role history');
    }
    
    try {
      const response = await api.get(`/admin/users/${targetUserUuid}/role-history`);
      return response.data;
    } catch (error) {
      console.error('Failed to get role history:', error);
      throw error;
    }
  }, [user]);

  const value = {
    user,
    loading,
    isFirstTime,
    showAnonModeSetup,
    permissions,
    trustEvents,
    userStats,
    syncUser,
    updateProfile,
    awardXP,
    updateStreak,
    updateTrustScore,
    checkPermission,
    getTrustLevelInfo,
    completeAnonModeSetup,
    completeOnboarding,
    getPersonaInfo,
    getBadgeInfo,
    staffLogin,
    staffLogout,
    globalLogout,
    logout,
    getUserAnalytics,
    getTrustEvents,
    PERMISSION_MATRIX,
    resetAnonModeSetup,
    assignUserRole,
    revokeUserRole,
    getAllUsers,
    getUserRoleHistory
  };

  return (
    <EnhancedUserContext.Provider value={value}>
      {children}
    </EnhancedUserContext.Provider>
  );
};




