import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  // Update API service when user changes
  useEffect(() => {
    console.log('🔍 AuthContext - User changed:', user);
    if (user) {
      console.log('🔍 AuthContext - Setting current user in API service:', user);
      apiService.setCurrentUser(user);
    } else {
      console.log('🔍 AuthContext - No user data, clearing API service');
      apiService.setCurrentUser(null);
    }
  }, [user]);

  const initializeAuth = async () => {
    try {
      // Check for stored token
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');
      
      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        apiService.setToken(storedToken);
        
        // Verify token is still valid
        try {
          await apiService.getCurrentUser();
        } catch (error) {
          // Token expired, clear storage
          await logout();
        }
      } else {
        // Create anonymous user
        await createAnonymousUser();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      await createAnonymousUser();
    } finally {
      setLoading(false);
    }
  };

  const createAnonymousUser = async () => {
    try {
      // Skip API call for now - just create local anonymous user
      const anonymousUser = {
        uuid: `anon_${Date.now()}`,
        username: `Anonymous_${Math.random().toString(36).substr(2, 9)}`,
        email: null,
        is_anonymous: true,
        trust_score: 0,
        xp_points: 0,
        level: 1,
        badges: [],
        achievements: [],
        created_at: new Date().toISOString(),
      };

      console.log('👤 Creating local anonymous user:', anonymousUser);
      setUser(anonymousUser);
      setIsAnonymous(true);
      await AsyncStorage.setItem('userData', JSON.stringify(anonymousUser));
      
    } catch (error) {
      console.error('Failed to create anonymous user:', error);
      // Create fallback anonymous user
      const fallbackUser = {
        uuid: `anon_${Date.now()}`,
        username: 'Anonymous User',
        is_anonymous: true,
        trust_score: 0,
        xp_points: 0,
        level: 1,
      };
      setUser(fallbackUser);
      setIsAnonymous(true);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await apiService.userLogin({ username, password });
      
      if (response && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        setIsAnonymous(false);
        
        // Store auth data
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        
        // Set token in API service
        apiService.setToken(response.token);
        
        return { success: true };
      } else {
        return { success: false, error: 'Invalid username or password' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await apiService.userRegister(userData);
      
      if (response && response.uuid) {
        // For registration, we don't get a token immediately
        // User needs to login after registration
        return { success: true, message: 'Account created successfully. Please login.' };
      } else {
        return { success: false, error: 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      setIsAnonymous(false);
      
      // Clear stored data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      // Clear API token
      apiService.setToken(null);
      
      // Create new anonymous user
      await createAnonymousUser();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUser = async (userData) => {
    try {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user failed:', error);
    }
  };

  const setUserData = async (userData) => {
    try {
      setUser(userData);
      setIsAnonymous(false);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Set user failed:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAnonymous,
    login,
    register,
    logout,
    updateUser,
    setUserData,
    createAnonymousUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
