import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, getTheme, ColorMode, createCardStyle, createButtonStyle, createTextStyle } from '../styles/theme';

interface ThemeContextType {
  colorMode: ColorMode;
  colors: ReturnType<typeof getTheme>['colors'];
  typography: typeof theme.typography;
  spacing: typeof theme.spacing;
  shadows: typeof theme.shadows;
  borderRadius: typeof theme.borderRadius;
  animation: typeof theme.animation;
  layout: typeof theme.layout;

  // Theme utilities
  isDark: boolean;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;

  // Style creators with current theme
  createCard: (variant?: 'default' | 'compact') => ReturnType<typeof createCardStyle>;
  createButton: (variant?: 'primary' | 'secondary' | 'outline' | 'ghost') => ReturnType<typeof createButtonStyle>;
  createText: (variant?: 'h1' | 'h2' | 'h3' | 'body1' | 'body2' | 'caption' | 'button') => ReturnType<typeof createTextStyle>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_mode';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ColorMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode
}) => {
  const systemColorScheme = useColorScheme();
  const [colorMode, setColorModeState] = useState<ColorMode>(
    defaultMode || systemColorScheme || 'light'
  );

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
          setColorModeState(savedMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference
  const setColorMode = async (mode: ColorMode) => {
    try {
      setColorModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
  };

  const currentTheme = getTheme(colorMode);

  const value: ThemeContextType = {
    colorMode,
    colors: currentTheme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    shadows: theme.shadows,
    borderRadius: theme.borderRadius,
    animation: theme.animation,
    layout: theme.layout,

    isDark: colorMode === 'dark',
    toggleColorMode,
    setColorMode,

    // Style creators bound to current theme
    createCard: (variant = 'default') => createCardStyle(colorMode, variant),
    createButton: (variant = 'primary') => createButtonStyle(colorMode, variant),
    createText: (variant = 'body1') => createTextStyle(colorMode, variant),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;