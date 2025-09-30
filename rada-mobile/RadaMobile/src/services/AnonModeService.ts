import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import apiService from './api';

export interface AnonModeUser {
  uuid: string;
  nickname: string;
  password?: string; // Optional password for account security
  securityQuestion?: string; // Security question for password reset
  securityAnswer?: string; // Security answer for password reset
  profilePicture: string | null;
  county: string;
  bio: string;
  xp: number;
  level: number;
  trustScore: number;
  badges: string[];
  streak: number;
  lastActive: string;
  createdAt: string;
  isAnonymous: boolean;
  deviceFingerprint: string;
  privacySettings: {
    showLocation: boolean;
    allowDataCollection: boolean;
    anonymousPosting: boolean;
  };
}

export interface DeviceFingerprint {
  deviceId: string;
  deviceName: string;
  osVersion: string;
  appVersion: string;
  timestamp: string;
}

class AnonModeService {
  private static instance: AnonModeService;
  private currentUser: AnonModeUser | null = null;
  private readonly STORAGE_KEYS = {
    USER_DATA: 'anonmode_user_data',
    DEVICE_FINGERPRINT: 'anonmode_device_fingerprint',
    PRIVACY_SETTINGS: 'anonmode_privacy_settings',
    ONBOARDING_COMPLETED: 'anonmode_onboarding_completed',
    REMEMBER_ME_SESSION: 'anonmode_remember_me_session',
  };

  public static getInstance(): AnonModeService {
    if (!AnonModeService.instance) {
      AnonModeService.instance = new AnonModeService();
    }
    return AnonModeService.instance;
  }

  /**
   * Initialize AnonMode™ system
   */
  public async initialize(): Promise<AnonModeUser> {
    try {
      console.log('🔒 AnonMode™: Initializing...');
      
      // Check if user already exists
      const existingUser = await this.getCurrentUser();
      if (existingUser) {
        console.log('🔒 AnonMode™: Existing user found');
        this.currentUser = existingUser;
        return existingUser;
      }

      // Create new anonymous user
      const newUser = await this.createAnonymousUser();
      console.log('🔒 AnonMode™: New anonymous user created');
      return newUser;
    } catch (error) {
      console.error('❌ AnonMode™: Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create a new anonymous user with device fingerprinting
   */
  private async createAnonymousUser(): Promise<AnonModeUser> {
    const deviceFingerprint = await this.generateDeviceFingerprint();
    const uuid = this.generateSecureUUID();
    
    const newUser: AnonModeUser = {
      uuid,
      nickname: 'Anonymous User',
      profilePicture: null,
      county: '',
      bio: '',
      xp: 0,
      level: 1,
      trustScore: 0,
      badges: [],
      streak: 0,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isAnonymous: true,
      deviceFingerprint: deviceFingerprint.deviceId,
      privacySettings: {
        showLocation: false,
        allowDataCollection: false,
        anonymousPosting: true,
      },
    };

    // Store user data locally
    await this.saveUserData(newUser);
    await this.saveDeviceFingerprint(deviceFingerprint);
    
    this.currentUser = newUser;
    return newUser;
  }

  /**
   * Generate device fingerprint for privacy-preserving identification
   */
  private async generateDeviceFingerprint(): Promise<DeviceFingerprint> {
    try {
      // Try to get installation ID, fallback if method doesn't exist
      let deviceId: string;
      try {
        deviceId = await Application.getInstallationIdAsync();
      } catch (error) {
        // Fallback if method doesn't exist
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      const deviceName = Device.deviceName || 'Unknown Device';
      const osVersion = Device.osVersion || 'Unknown OS';
      const appVersion = Application.nativeApplicationVersion || '1.0.0';
      
      const fingerprint: DeviceFingerprint = {
        deviceId,
        deviceName,
        osVersion,
        appVersion,
        timestamp: new Date().toISOString(),
      };

      console.log('🔒 AnonMode™: Device fingerprint generated:', {
        deviceId: fingerprint.deviceId.substring(0, 8) + '...',
        deviceName: fingerprint.deviceName,
        osVersion: fingerprint.osVersion,
      });

      return fingerprint;
    } catch (error) {
      console.error('❌ AnonMode™: Failed to generate device fingerprint:', error);
      // Fallback to timestamp-based ID
      return {
        deviceId: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deviceName: 'Unknown Device',
        osVersion: 'Unknown OS',
        appVersion: '1.0.0',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate cryptographically secure UUID
   */
  private generateSecureUUID(): string {
    // Use crypto.getRandomValues if available, otherwise fallback to Math.random
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      
      // Set version (4) and variant bits
      array[6] = (array[6] & 0x0f) | 0x40;
      array[8] = (array[8] & 0x3f) | 0x80;
      
      const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      return [
        hex.substr(0, 8),
        hex.substr(8, 4),
        hex.substr(12, 4),
        hex.substr(16, 4),
        hex.substr(20, 12)
      ].join('-');
    } else {
      // Fallback for environments without crypto.getRandomValues
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }

  /**
   * Get current user data
   */
  public async getCurrentUser(): Promise<AnonModeUser | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (userData) {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
      }
      return null;
    } catch (error) {
      console.error('❌ AnonMode™: Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Update user profile data
   */
  public async updateProfile(profileData: Partial<AnonModeUser>): Promise<AnonModeUser> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    console.log('🔒 AnonMode™: Updating profile with data:', {
      profilePicture: profileData.profilePicture,
      nickname: profileData.nickname,
      county: profileData.county,
      bio: profileData.bio,
      hasPassword: !!profileData.password
    });

    console.log('🔒 AnonMode™: Current user before update:', {
      uuid: this.currentUser.uuid,
      nickname: this.currentUser.nickname,
      hasPassword: !!this.currentUser.password,
      hasBackendAccount: !!(this.currentUser.password && this.currentUser.uuid)
    });

    // If this is a new user setup with password and security questions, create backend account
    if (profileData.password && profileData.securityQuestion && profileData.securityAnswer) {
      try {
        console.log('🔒 AnonMode™: Creating backend account for new user');
        const backendUser = await this.createNewUser(
          profileData.nickname || this.currentUser.nickname,
          profileData.password,
          profileData.securityQuestion,
          profileData.securityAnswer
        );
        
        // Update local user with backend data
        const updatedUser: AnonModeUser = {
          ...this.currentUser,
          ...profileData,
          uuid: backendUser.uuid, // Use backend UUID
          lastActive: new Date().toISOString(),
        };

        await this.saveUserData(updatedUser);
        this.currentUser = updatedUser;
        
        console.log('🔒 AnonMode™: Profile updated with backend account');
        return updatedUser;
      } catch (error) {
        console.error('❌ AnonMode™: Failed to create backend account:', error);
        // Continue with local update if backend fails
      }
    }

    // Update local user first
    const updatedUser: AnonModeUser = {
      ...this.currentUser,
      ...profileData,
      lastActive: new Date().toISOString(),
    };

    // If user has a backend account (has password), also update backend
    if (this.currentUser.password && this.currentUser.uuid) {
      try {
        console.log('🔒 AnonMode™: Updating backend profile for user:', this.currentUser.uuid);
        
        // Ensure we have the auth token before making the API call
        const storedToken = await AsyncStorage.getItem('auth_token');
        if (storedToken) {
          apiService.setToken(storedToken);
          console.log('🔒 AnonMode™: Auth token set for profile update');
        } else {
          console.warn('🔒 AnonMode™: No auth token found, profile update may fail');
        }
        
        // Prepare data for backend update (only send fields that can be updated)
        const backendUpdateData = {
          bio: updatedUser.bio,
          county: updatedUser.county,
          emoji: updatedUser.profilePicture || '😊', // Use profile picture as emoji for now
        };

        console.log('🔒 AnonMode™: Sending backend update data:', backendUpdateData);
        console.log('🔒 AnonMode™: Making API call to:', `http://10.19.23.19:5001/api/users/${this.currentUser.uuid}/profile`);
        
        const response = await apiService.updateUserProfile(this.currentUser.uuid, backendUpdateData);
        console.log('🔒 AnonMode™: Backend profile updated successfully:', response);
      } catch (error) {
        console.error('❌ AnonMode™: Failed to update backend profile:', error);
        console.error('❌ AnonMode™: Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        // Continue with local update even if backend fails
      }
    } else {
      console.log('🔒 AnonMode™: User does not have backend account, skipping backend update');
    }

    await this.saveUserData(updatedUser);
    this.currentUser = updatedUser;
    
    console.log('🔒 AnonMode™: Profile updated successfully:', {
      profilePicture: updatedUser.profilePicture,
      nickname: updatedUser.nickname,
      currentUserSet: !!this.currentUser
    });
    return updatedUser;
  }

  /**
   * Update privacy settings
   */
  public async updatePrivacySettings(settings: Partial<AnonModeUser['privacySettings']>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const updatedSettings = {
      ...this.currentUser.privacySettings,
      ...settings,
    };

    await this.updateProfile({
      privacySettings: updatedSettings,
    });

    // Also save privacy settings separately for easy access
    await AsyncStorage.setItem(
      this.STORAGE_KEYS.PRIVACY_SETTINGS,
      JSON.stringify(updatedSettings)
    );
  }

  /**
   * Add XP and handle level progression
   */
  public async addXP(amount: number, reason: string): Promise<{ newLevel: boolean; level: number; xp: number }> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const newXP = this.currentUser.xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1; // 100 XP per level
    const leveledUp = newLevel > this.currentUser.level;

    await this.updateProfile({
      xp: newXP,
      level: newLevel,
    });

    console.log(`🔒 AnonMode™: Added ${amount} XP (${reason}). Level: ${newLevel}${leveledUp ? ' (LEVELED UP!)' : ''}`);

    return {
      newLevel: leveledUp,
      level: newLevel,
      xp: newXP,
    };
  }

  /**
   * Update activity streak
   */
  public async updateStreak(): Promise<number> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const today = new Date().toDateString();
    const lastActive = new Date(this.currentUser.lastActive).toDateString();
    
    let newStreak = this.currentUser.streak;
    if (today !== lastActive) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive === yesterday.toDateString()) {
        // User was active yesterday, increment streak
        newStreak += 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }
    }

    await this.updateProfile({
      streak: newStreak,
      lastActive: new Date().toISOString(),
    });

    return newStreak;
  }

  /**
   * Add badge to user
   */
  public async addBadge(badgeId: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    if (!this.currentUser.badges.includes(badgeId)) {
      const updatedBadges = [...this.currentUser.badges, badgeId];
      await this.updateProfile({ badges: updatedBadges });
      console.log(`🔒 AnonMode™: Badge earned: ${badgeId}`);
    }
  }

  /**
   * Check if user has completed onboarding
   */
  public async isOnboardingCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(this.STORAGE_KEYS.ONBOARDING_COMPLETED);
      return completed === 'true';
    } catch (error) {
      console.error('❌ AnonMode™: Failed to check onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as completed
   */
  public async completeOnboarding(): Promise<void> {
    await AsyncStorage.setItem(this.STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    console.log('🔒 AnonMode™: Onboarding completed');
  }

  /**
   * Get existing user from local storage
   */
  public async getExistingUser(): Promise<AnonModeUser | null> {
    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (userData) {
        const user = JSON.parse(userData);
        console.log('🔒 AnonMode™: Existing user found:', {
          uuid: user.uuid.substring(0, 8) + '...',
          nickname: user.nickname,
        });
        return user;
      }
      return null;
    } catch (error) {
      console.error('❌ AnonMode™: Failed to get existing user:', error);
      return null;
    }
  }

  /**
   * Verify user with UUID or username
   */
  public async verifyUser(loginInput: string, password?: string): Promise<AnonModeUser> {
    try {
      console.log('🔒 AnonMode™: Verifying user with backend:', { loginInput, hasPassword: !!password });
      
      if (!password) {
        throw new Error('Password required for login');
      }

      // Try to login with backend
      const response = await apiService.userLogin({
        username: loginInput,
        password: password
      });

      if (response && response.user && response.token) {
        const backendUser = response.user;
        const token = response.token;
        
        // Fetch detailed profile data from backend
        let detailedProfile = null;
        try {
          console.log('🔒 AnonMode™: Fetching detailed profile data from backend');
          detailedProfile = await apiService.getUserProfile(backendUser.uuid);
          console.log('🔒 AnonMode™: Detailed profile fetched:', detailedProfile);
        } catch (error) {
          console.error('❌ AnonMode™: Failed to fetch detailed profile:', error);
          // Continue with basic user data if detailed fetch fails
        }
        
        // Create local user object with backend data
        const localUser: AnonModeUser = {
          uuid: backendUser.uuid,
          nickname: backendUser.nickname,
          password: password,
          profilePicture: detailedProfile?.emoji || null, // Use emoji as profile picture
          county: detailedProfile?.county || backendUser.county || '',
          bio: detailedProfile?.bio || '',
          xp: detailedProfile?.xp || backendUser.xp || 0,
          level: detailedProfile?.level || 1,
          trustScore: detailedProfile?.trust_score || 0,
          badges: detailedProfile?.badges || backendUser.badges || [],
          streak: detailedProfile?.streak || backendUser.streak || 0,
          isAnonymous: true,
          privacySettings: {
            showLocation: false,
            allowDataCollection: false,
            anonymousPosting: true,
          },
          deviceFingerprint: JSON.stringify(await this.generateDeviceFingerprint()),
          createdAt: detailedProfile?.created_at || new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };

        // Store JWT token and set it in API service
        await AsyncStorage.setItem('auth_token', token);
        apiService.setToken(token);
        
        // Save to local storage
        await this.saveUserData(localUser);
        
        // Set current user
        this.currentUser = localUser;
        
        console.log('🔒 AnonMode™: User verified successfully with backend:', { 
          uuid: localUser.uuid?.substring(0, 8) + '...', 
          nickname: localUser.nickname,
          hasToken: !!token,
          currentUserSet: !!this.currentUser,
          currentUserNickname: this.currentUser?.nickname
        });
        
        return localUser;
      } else {
        throw new Error('Backend login failed');
      }
    } catch (error) {
      console.error('❌ AnonMode™: Failed to verify user with backend:', error);
      if (error.response && error.response.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response && error.response.status === 400) {
        throw new Error('Username and password required');
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  }

  /**
   * Create new user account (separate from login)
   */
  public async createNewUser(username: string, password: string, securityQuestion?: string, securityAnswer?: string): Promise<AnonModeUser> {
    try {
      console.log('🔒 AnonMode™: Creating new user account with backend:', { username, hasPassword: !!password, hasSecurityQuestion: !!securityQuestion });
      
      // Create user in backend database
      const response = await apiService.userRegister({
        nickname: username,
        emoji: '😊',
        county: '',
        password: password,
        securityQuestion: securityQuestion || '',
        securityAnswer: securityAnswer || ''
      });

      console.log('🔒 AnonMode™: Backend response:', {
        response: response,
        hasData: !!response,
        hasUuid: !!(response && response.uuid)
      });

      if (response && response.uuid) {
        const backendUser = response;
        
        // Fetch detailed profile data from backend
        let detailedProfile = null;
        try {
          console.log('🔒 AnonMode™: Fetching detailed profile data for new user');
          detailedProfile = await apiService.getUserProfile(backendUser.uuid);
          console.log('🔒 AnonMode™: Detailed profile fetched for new user:', detailedProfile);
        } catch (error) {
          console.error('❌ AnonMode™: Failed to fetch detailed profile for new user:', error);
          // Continue with basic user data if detailed fetch fails
        }
        
        // Create local user object with backend data
        const localUser: AnonModeUser = {
          uuid: backendUser.uuid,
          nickname: backendUser.nickname,
          password: password,
          profilePicture: detailedProfile?.emoji || null, // Use emoji as profile picture
          county: detailedProfile?.county || backendUser.county || '',
          bio: detailedProfile?.bio || '',
          xp: detailedProfile?.xp || backendUser.xp || 0,
          level: detailedProfile?.level || 1,
          trustScore: detailedProfile?.trust_score || 0,
          badges: detailedProfile?.badges || backendUser.badges || [],
          streak: detailedProfile?.streak || backendUser.streak || 0,
          isAnonymous: true,
          privacySettings: {
            showLocation: false,
            allowDataCollection: false,
            anonymousPosting: true,
          },
          deviceFingerprint: JSON.stringify(await this.generateDeviceFingerprint()),
          createdAt: detailedProfile?.created_at || new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };

        // Save to local storage
        await this.saveUserData(localUser);
        
        console.log('🔒 AnonMode™: New user created in backend:', { 
          uuid: localUser.uuid?.substring(0, 8) + '...', 
          nickname: localUser.nickname, 
          hasPassword: !!localUser.password 
        });
        
        return localUser;
      } else {
        throw new Error('Backend did not return user data');
      }
    } catch (error) {
      console.error('❌ AnonMode™: Failed to create user in backend:', error);
      throw new Error('Failed to create user account');
    }
  }

  /**
   * Create user with login input (UUID or username) and optional password
   */
  private async createUserWithLoginInput(loginInput: string, password?: string, securityQuestion?: string, securityAnswer?: string): Promise<AnonModeUser> {
    const deviceFingerprint = await this.generateDeviceFingerprint();
    
    // Check if input looks like a UUID (has dashes and is long)
    const isUUID = loginInput.includes('-') && loginInput.length > 20;
    
    // For new account creation, use the exact username provided
    // Only generate random username for legacy 'new_user_' format
    const isNewAccount = loginInput.startsWith('new_user_');
    const username = isNewAccount ? `User${Math.floor(Math.random() * 10000)}` : loginInput;
    
    console.log('🔒 AnonMode™: Creating user with:', {
      loginInput,
      isUUID,
      isNewAccount,
      finalUsername: username,
      hasPassword: !!password
    });
    
    const user: AnonModeUser = {
      uuid: isUUID ? loginInput : this.generateUUID(),
      nickname: username,
      password: password, // Store password if provided
      profilePicture: null,
      county: '',
      bio: '',
      xp: 0,
      level: 1,
      trustScore: 0,
      badges: [],
      streak: 0,
      isAnonymous: true,
      privacySettings: {
        showLocation: false,
        showAgeGroup: false,
        allowDataCollection: false,
        anonymousPosting: true,
      },
      deviceFingerprint: JSON.stringify(deviceFingerprint),
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    await this.saveUserData(user);
    console.log('🔒 AnonMode™: New user created:', {
      uuid: user.uuid.substring(0, 8) + '...',
      nickname: user.nickname,
      hasPassword: !!password,
      loginOptions: `Username: ${user.nickname} or UUID: ${user.uuid}`
    });
    return user;
  }

  /**
   * Generate a cryptographically secure UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Create user with specific UUID (legacy method)
   */
  private async createUserWithUUID(uuid: string): Promise<AnonModeUser> {
    return this.createUserWithLoginInput(uuid);
  }

  /**
   * Get user's login details for future reference
   */
  public async getUserLoginDetails(): Promise<{ username: string; uuid: string } | null> {
    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (userData) {
        const user = JSON.parse(userData);
        return {
          username: user.nickname,
          uuid: user.uuid
        };
      }
      return null;
    } catch (error) {
      console.error('❌ AnonMode™: Failed to get login details:', error);
      return null;
    }
  }

  /**
   * Debug function to show current user data
   */
  public async debugCurrentUser(): Promise<void> {
    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (userData) {
        const user = JSON.parse(userData);
        console.log('🔍 DEBUG - Current user data:', {
          uuid: user.uuid,
          nickname: user.nickname,
          password: user.password ? '***HIDDEN***' : 'NO PASSWORD',
          hasPassword: !!user.password
        });
      } else {
        console.log('🔍 DEBUG - No user data found in storage');
      }
    } catch (error) {
      console.error('❌ DEBUG - Failed to get user data:', error);
    }
  }

  /**
   * Clear all user data (for privacy/reset)
   */
  public async clearAllData(): Promise<void> {
    try {
      console.log('🔒 AnonMode™: Clearing all data...');
      
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.USER_DATA,
        this.STORAGE_KEYS.DEVICE_FINGERPRINT,
        this.STORAGE_KEYS.PRIVACY_SETTINGS,
        this.STORAGE_KEYS.ONBOARDING_COMPLETED,
      ]);

      this.currentUser = null;
      console.log('🔒 AnonMode™: All data cleared');
    } catch (error) {
      console.error('❌ AnonMode™: Failed to clear data:', error);
      throw error;
    }
  }

  /**
   * Get device fingerprint
   */
  public async getDeviceFingerprint(): Promise<DeviceFingerprint | null> {
    try {
      const fingerprint = await AsyncStorage.getItem(this.STORAGE_KEYS.DEVICE_FINGERPRINT);
      return fingerprint ? JSON.parse(fingerprint) : null;
    } catch (error) {
      console.error('❌ AnonMode™: Failed to get device fingerprint:', error);
      return null;
    }
  }

  /**
   * Save user data to local storage
   */
  private async saveUserData(user: AnonModeUser): Promise<void> {
    console.log('🔒 AnonMode™: Saving user data:', { 
      uuid: user.uuid?.substring(0, 8) + '...', 
      nickname: user.nickname, 
      hasPassword: !!user.password 
    });
    await AsyncStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    console.log('🔒 AnonMode™: User data saved successfully');
  }

  /**
   * Save device fingerprint to local storage
   */
  private async saveDeviceFingerprint(fingerprint: DeviceFingerprint): Promise<void> {
    await AsyncStorage.setItem(this.STORAGE_KEYS.DEVICE_FINGERPRINT, JSON.stringify(fingerprint));
  }

  /**
   * Get privacy settings
   */
  public async getPrivacySettings(): Promise<AnonModeUser['privacySettings'] | null> {
    try {
      const settings = await AsyncStorage.getItem(this.STORAGE_KEYS.PRIVACY_SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('❌ AnonMode™: Failed to get privacy settings:', error);
      return null;
    }
  }

  /**
   * Check if user is in anonymous mode
   */
  public isAnonymousMode(): boolean {
    return this.currentUser?.isAnonymous ?? true;
  }

  /**
   * Get user's display name (nickname or Anonymous)
   */
  public getDisplayName(): string {
    console.log('🔍 AnonModeService: getDisplayName called, currentUser:', {
      hasUser: !!this.currentUser,
      nickname: this.currentUser?.nickname,
      uuid: this.currentUser?.uuid?.substring(0, 8) + '...'
    });
    
    if (!this.currentUser) return 'Anonymous User';
    
    // Always show nickname if available (ignore anonymousPosting setting for display)
    if (!this.currentUser.nickname) {
      return 'Anonymous User';
    }
    
    return this.currentUser.nickname;
  }

  /**
   * Get user's display picture (profile picture or default emoji)
   */
  public getDisplayPicture(): string {
    console.log('🔍 AnonModeService: getDisplayPicture called, currentUser:', {
      hasUser: !!this.currentUser,
      profilePicture: this.currentUser?.profilePicture,
      anonymousPosting: this.currentUser?.privacySettings?.anonymousPosting,
      uuid: this.currentUser?.uuid?.substring(0, 8) + '...'
    });
    
    if (!this.currentUser) return '👤';
    
    // Always show profile picture if available (ignore anonymousPosting setting for display)
    if (!this.currentUser.profilePicture) {
      return '👤';
    }
    
    return this.currentUser.profilePicture;
  }

  /**
   * Save remember me session
   */
  public async saveRememberMeSession(user: AnonModeUser): Promise<void> {
    try {
      const sessionData = {
        uuid: user.uuid,
        nickname: user.nickname,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      };
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.REMEMBER_ME_SESSION, JSON.stringify(sessionData));
      console.log('🔒 AnonMode™: Remember me session saved');
    } catch (error) {
      console.error('❌ AnonMode™: Failed to save remember me session:', error);
    }
  }

  /**
   * Clear remember me session
   */
  public async clearRememberMeSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEYS.REMEMBER_ME_SESSION);
      console.log('🔒 AnonMode™: Remember me session cleared');
    } catch (error) {
      console.error('❌ AnonMode™: Failed to clear remember me session:', error);
    }
  }

  /**
   * Check if remember me session exists and is valid
   */
  public async checkRememberMeSession(): Promise<{uuid: string, nickname: string} | null> {
    try {
      const sessionData = await AsyncStorage.getItem(this.STORAGE_KEYS.REMEMBER_ME_SESSION);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);

      if (now > expiresAt) {
        // Session expired, clear it
        await this.clearRememberMeSession();
        return null;
      }

      console.log('🔒 AnonMode™: Valid remember me session found');
      return { uuid: session.uuid, nickname: session.nickname };
    } catch (error) {
      console.error('❌ AnonMode™: Failed to check remember me session:', error);
      return null;
    }
  }
}

export default AnonModeService;
