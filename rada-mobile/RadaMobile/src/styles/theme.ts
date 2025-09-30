// Unified Design System for Rada Mobile
// Based on the clean politician detail screen aesthetic with dark mode support

// Light Theme Colors
const lightColors = {
  // Primary - Teal from politician screens (enhanced)
  primary: {
    50: '#F0FDFC',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#4ECDC4', // Main teal - clean and trustworthy
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
    main: '#4ECDC4',
    light: '#7EDDD8',
    dark: '#3AB3AD',
    background: '#F0FDFC',
    text: '#FFFFFF',
  },

  // Kenya Flag Colors (for special occasions)
  kenya: {
    red: '#BB0000',
    green: '#006600',
    black: '#000000',
    white: '#FFFFFF',
  },

  // Enhanced Secondary Colors
  secondary: {
    blue: '#3B82F6',
    blueLight: '#93C5FD',
    purple: '#8B5CF6',
    purpleLight: '#C4B5FD',
    gray: '#6B7280',
    grayLight: '#D1D5DB',
  },

  // Semantic Colors (WCAG AA compliant)
  semantic: {
    success: '#059669', // Green - accessible
    successLight: '#D1FAE5',
    warning: '#D97706', // Orange - accessible
    warningLight: '#FEF3C7',
    error: '#DC2626', // Red - accessible
    errorLight: '#FEE2E2',
    info: '#2563EB', // Blue - accessible
    infoLight: '#DBEAFE',
  },

  // Text hierarchy - Enhanced contrast
  text: {
    primary: '#111827', // Very dark for better contrast
    secondary: '#4B5563', // Medium gray
    tertiary: '#6B7280', // Light gray
    disabled: '#9CA3AF', // Very light
    inverse: '#FFFFFF', // White text
    link: '#2563EB', // Accessible blue
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    card: '#FFFFFF',
    modal: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.1)',
  },

  // Border colors
  border: {
    light: '#F3F4F6',
    medium: '#E5E7EB',
    dark: '#D1D5DB',
    focus: '#4ECDC4',
  },
};

// Dark Theme Colors
const darkColors = {
  // Primary - Adjusted for dark backgrounds
  primary: {
    50: '#0F1419',
    100: '#1A2332',
    200: '#253649',
    300: '#374B63',
    400: '#4F637A',
    500: '#4ECDC4', // Keep main color for brand consistency
    600: '#7EDDD8',
    700: '#A8E6E3',
    800: '#C7F0ED',
    900: '#E6F9F7',
    main: '#4ECDC4',
    light: '#7EDDD8',
    dark: '#3AB3AD',
    background: '#0F1419',
    text: '#FFFFFF',
  },

  // Kenya Flag Colors (adjusted for dark)
  kenya: {
    red: '#EF4444',
    green: '#22C55E',
    black: '#FFFFFF', // Inverted for dark mode
    white: '#000000', // Inverted for dark mode
  },

  // Dark Secondary Colors
  secondary: {
    blue: '#60A5FA',
    blueLight: '#3B82F6',
    purple: '#A78BFA',
    purpleLight: '#8B5CF6',
    gray: '#9CA3AF',
    grayLight: '#6B7280',
  },

  // Semantic Colors (dark mode adjusted)
  semantic: {
    success: '#10B981',
    successLight: '#064E3B',
    warning: '#F59E0B',
    warningLight: '#78350F',
    error: '#EF4444',
    errorLight: '#7F1D1D',
    info: '#3B82F6',
    infoLight: '#1E3A8A',
  },

  // Text hierarchy - Dark mode
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    tertiary: '#9CA3AF',
    disabled: '#6B7280',
    inverse: '#111827',
    link: '#60A5FA',
  },

  // Background colors - Dark mode
  background: {
    primary: '#111827',
    secondary: '#1F2937',
    tertiary: '#374151',
    card: '#1F2937',
    modal: 'rgba(0, 0, 0, 0.8)',
    overlay: 'rgba(0, 0, 0, 0.3)',
  },

  // Border colors - Dark mode
  border: {
    light: '#374151',
    medium: '#4B5563',
    dark: '#6B7280',
    focus: '#4ECDC4',
  },
};

export const theme = {
  light: {
    colors: lightColors,
  },
  dark: {
    colors: darkColors,
  },

  // Shared design tokens (theme-agnostic)
  typography: {
    fonts: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
    sizes: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extraBold: '800',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 48,
    '5xl': 64,
  },

  borderRadius: {
    none: 0,
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },

  // Enhanced shadows with dark mode support
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Animation timing
  animation: {
    timing: {
      fast: 150,
      normal: 250,
      slow: 350,
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Layout constants
  layout: {
    screenPadding: 20,
    cardSpacing: 16,
    sectionSpacing: 24,
    headerHeight: 60,
    tabBarHeight: 80,
    bottomSafeArea: 34,
  },
};

export type Theme = typeof theme;
export type ColorMode = 'light' | 'dark';

// Helper functions for theme access
export const getTheme = (mode: ColorMode = 'light') => ({
  ...theme,
  colors: theme[mode].colors,
});

// Create consistent component styles
export const createCardStyle = (mode: ColorMode = 'light', variant: 'default' | 'compact' = 'default') => {
  const colors = theme[mode].colors;
  const baseStyle = {
    backgroundColor: colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: variant === 'compact' ? theme.spacing.md : theme.spacing.xl,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  };

  // Adjust shadow for dark mode
  if (mode === 'dark') {
    baseStyle.shadowColor = colors.background.primary;
    baseStyle.shadowOpacity = 0.3;
  }

  return baseStyle;
};

export const createButtonStyle = (
  mode: ColorMode = 'light',
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary'
) => {
  const colors = theme[mode].colors;

  const baseStyle = {
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 48, // Accessibility requirement
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: colors.primary.main,
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: colors.secondary.blue,
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary.main,
      };
    case 'ghost':
      return {
        ...baseStyle,
        backgroundColor: mode === 'light' ? colors.primary.background : colors.primary[100],
      };
    default:
      return baseStyle;
  }
};

export const createTextStyle = (
  mode: ColorMode = 'light',
  variant: 'h1' | 'h2' | 'h3' | 'body1' | 'body2' | 'caption' | 'button' = 'body1'
) => {
  const colors = theme[mode].colors;

  const styles = {
    h1: {
      fontSize: theme.typography.sizes['3xl'],
      fontWeight: theme.typography.weights.bold,
      color: colors.text.primary,
      lineHeight: theme.typography.lineHeights.tight,
    },
    h2: {
      fontSize: theme.typography.sizes['2xl'],
      fontWeight: theme.typography.weights.semibold,
      color: colors.text.primary,
      lineHeight: theme.typography.lineHeights.tight,
    },
    h3: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.semibold,
      color: colors.text.primary,
      lineHeight: theme.typography.lineHeights.normal,
    },
    body1: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.normal,
      color: colors.text.primary,
      lineHeight: theme.typography.lineHeights.relaxed,
    },
    body2: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.normal,
      color: colors.text.secondary,
      lineHeight: theme.typography.lineHeights.normal,
    },
    caption: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.normal,
      color: colors.text.tertiary,
      lineHeight: theme.typography.lineHeights.normal,
    },
    button: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.semibold,
      lineHeight: theme.typography.lineHeights.tight,
    },
  };

  return styles[variant];
};