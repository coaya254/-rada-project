export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 999,
} as const;

import { Platform } from 'react-native';

const createShadow = (offset: { width: number; height: number }, opacity: number, radius: number, elevation: number) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    };
  }
  return {
    shadowColor: '#000',
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
};

export const shadows = {
  sm: createShadow({ width: 0, height: 2 }, 0.1, 4, 2),
  md: createShadow({ width: 0, height: 4 }, 0.1, 8, 4),
  lg: createShadow({ width: 0, height: 8 }, 0.15, 12, 8),
  xl: createShadow({ width: 0, height: 20 }, 0.25, 25, 25),
} as const;