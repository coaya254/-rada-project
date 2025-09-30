// Modern 2025 Design System Theme
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Modern Color Palette with Dynamic Gradients
export const modernColors = {
  // Primary Brand - Dynamic Gradient Colors
  primary: {
    50: '#f0f4ff',
    100: '#e0ecff',
    200: '#c7d9ff',
    300: '#a5c0ff',
    400: '#7f9cff',
    500: '#6366f1', // Main brand color
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    gradient: ['#6366f1', '#8b5cf6', '#ec4899'], // Purple-pink gradient
    darkGradient: ['#4338ca', '#7c3aed', '#db2777'],
  },

  // Modern Neutral Scale with Warm Undertones
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Semantic Colors with Gradients
  success: {
    50: '#ecfdf5',
    500: '#10b981',
    600: '#059669',
    gradient: ['#10b981', '#34d399'],
  },

  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    gradient: ['#f59e0b', '#fbbf24'],
  },

  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    gradient: ['#ef4444', '#f87171'],
  },

  // 2025 Trend Colors
  neon: {
    cyan: '#00ffff',
    purple: '#bf00ff',
    green: '#39ff14',
    pink: '#ff1493',
    blue: '#0080ff',
  },

  // Glassmorphism Colors
  glass: {
    light: 'rgba(255, 255, 255, 0.25)',
    dark: 'rgba(0, 0, 0, 0.25)',
    border: 'rgba(255, 255, 255, 0.18)',
    backdrop: 'rgba(255, 255, 255, 0.1)',
  },

  // Surface Colors
  surface: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    elevated: '#ffffff',
    glass: 'rgba(255, 255, 255, 0.8)',
    dark: '#1a1a1a',
    darkGlass: 'rgba(26, 26, 26, 0.8)',
  },
};

// Modern Typography Scale (2025 Trends)
export const modernTypography = {
  // Display Text (Hero sections)
  display: {
    large: {
      fontSize: 57,
      fontWeight: '700',
      lineHeight: 64,
      letterSpacing: -1.5,
    },
    medium: {
      fontSize: 45,
      fontWeight: '700',
      lineHeight: 52,
      letterSpacing: -1,
    },
    small: {
      fontSize: 36,
      fontWeight: '600',
      lineHeight: 44,
      letterSpacing: -0.5,
    },
  },

  // Headlines
  headline: {
    large: {
      fontSize: 32,
      fontWeight: '600',
      lineHeight: 40,
      letterSpacing: -0.25,
    },
    medium: {
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 36,
      letterSpacing: 0,
    },
    small: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
      letterSpacing: 0,
    },
  },

  // Title Text
  title: {
    large: {
      fontSize: 22,
      fontWeight: '500',
      lineHeight: 28,
      letterSpacing: 0,
    },
    medium: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    small: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
  },

  // Body Text
  body: {
    large: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: 0.5,
    },
    medium: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0.25,
    },
    small: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      letterSpacing: 0.4,
    },
  },

  // Label Text
  label: {
    large: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    medium: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    small: {
      fontSize: 11,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.5,
    },
  },
};

// Modern Spacing System (8pt grid)
export const modernSpacing = {
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
};

// Modern Shadow System (Depth Layers)
export const modernShadows = {
  // Subtle shadows
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },

  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Standard shadows
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },

  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.13,
    shadowRadius: 25,
    elevation: 12,
  },

  // Dramatic shadows
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.15,
    shadowRadius: 50,
    elevation: 16,
  },

  // Colored shadows (2025 trend)
  coloredPrimary: {
    shadowColor: modernColors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  coloredSuccess: {
    shadowColor: modernColors.success[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },

  // Glassmorphism shadow
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
};

// Modern Border Radius System
export const modernBorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
  full: 9999,
};

// Modern Gradients (2025 Trends)
export const modernGradients = {
  // Primary gradients
  primary: {
    light: ['#6366f1', '#8b5cf6'],
    medium: ['#4f46e5', '#7c3aed'],
    dark: ['#4338ca', '#6d28d9'],
    rainbow: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
  },

  // Trendy gradients
  sunset: ['#ff6b6b', '#ffa726', '#ffcc02'],
  ocean: ['#667eea', '#764ba2'],
  forest: ['#134e5e', '#71b280'],
  cosmic: ['#243b55', '#141e30'],
  neon: ['#00c9ff', '#92fe9d'],
  aurora: ['#8360c3', '#2ebf91'],
  flame: ['#ff416c', '#ff4b2b'],

  // Glassmorphism gradients
  glassLight: ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)'],
  glassDark: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.0)'],
};

// Animation Timing (2025 Smooth Curves)
export const modernAnimations = {
  // Duration
  duration: {
    fastest: 150,
    fast: 200,
    normal: 300,
    slow: 500,
    slowest: 800,
  },

  // Easing curves (modern bezier curves)
  easing: {
    linear: [0, 0, 1, 1],
    ease: [0.25, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],

    // Modern curves (2025)
    spring: [0.68, -0.55, 0.265, 1.55], // Bouncy
    anticipate: [0.68, -0.6, 0.32, 1.6], // Anticipation
    smooth: [0.4, 0, 0.2, 1], // Material Design
    sharp: [0.4, 0, 0.6, 1], // Sharp acceleration
  },
};

// Modern Component Variants
export const modernVariants = {
  // Glass morphism styles
  glassmorphism: {
    light: {
      backgroundColor: modernColors.glass.light,
      borderWidth: 1,
      borderColor: modernColors.glass.border,
      backdropFilter: 'blur(20px)',
    },
    dark: {
      backgroundColor: modernColors.glass.dark,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
    },
  },

  // Neumorphism styles (subtle trend)
  neumorphism: {
    light: {
      backgroundColor: '#f0f0f3',
      shadowColor: '#d1d9e6',
      shadowOffset: { width: -5, height: -5 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 5,
    },
    pressed: {
      backgroundColor: '#e6e6e9',
      shadowColor: '#d1d9e6',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 5,
      elevation: 2,
    },
  },
};

export default {
  colors: modernColors,
  typography: modernTypography,
  spacing: modernSpacing,
  shadows: modernShadows,
  borderRadius: modernBorderRadius,
  gradients: modernGradients,
  animations: modernAnimations,
  variants: modernVariants,
};