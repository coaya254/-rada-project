import { Vibration, Platform, Alert } from 'react-native';

// Haptic Feedback Utility
export const hapticFeedback = {
  success: () => {
    if (Platform.OS === 'ios') {
      // iOS specific haptic feedback would go here
      // For now, using vibration as fallback
      Vibration.vibrate(100);
    } else {
      Vibration.vibrate(100);
    }
  },

  error: () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate([100, 50, 100]);
    } else {
      Vibration.vibrate([100, 50, 100]);
    }
  },

  light: () => {
    Vibration.vibrate(50);
  },

  medium: () => {
    Vibration.vibrate(100);
  },

  heavy: () => {
    Vibration.vibrate(200);
  },
};

// Toast/Alert Utilities
export const showSuccessToast = (message: string, title = 'Success!') => {
  Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
};

export const showErrorToast = (message: string, title = 'Error') => {
  Alert.alert(title, message, [{ text: 'OK', style: 'destructive' }]);
};

// Animation Utilities
export const animationDurations = {
  fast: 200,
  medium: 300,
  slow: 500,
  xp: 800,
  celebration: 1200,
};

// Format utilities
export const formatXP = (xp: number): string => {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
};

export const formatProgress = (current: number, total: number): string => {
  const percentage = Math.round((current / total) * 100);
  return `${percentage}%`;
};

// Level calculation utilities
export const calculateLevel = (totalXP: number): number => {
  // Level formula: Level = floor(sqrt(totalXP / 100))
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
};

export const calculateXPForNextLevel = (currentLevel: number): number => {
  // XP needed for next level = (level^2) * 100
  return Math.pow(currentLevel, 2) * 100;
};

export const calculateCurrentLevelProgress = (totalXP: number): {
  currentLevel: number;
  currentLevelXP: number;
  xpForNextLevel: number;
} => {
  const currentLevel = calculateLevel(totalXP);
  const xpForCurrentLevel = calculateXPForNextLevel(currentLevel - 1);
  const xpForNextLevel = calculateXPForNextLevel(currentLevel);
  const currentLevelXP = totalXP - xpForCurrentLevel;

  return {
    currentLevel,
    currentLevelXP,
    xpForNextLevel: xpForNextLevel - xpForCurrentLevel,
  };
};