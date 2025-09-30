import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { modernColors, modernGradients } from './modernTheme';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type AccentColor = 'primary' | 'neon' | 'sunset' | 'ocean' | 'forest' | 'cosmic';

interface ThemeContextType {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  isDarkMode: boolean;
  colors: typeof modernColors;
  gradients: typeof modernGradients;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  generateDynamicGradient: (baseColor: string) => string[];
  getAdaptiveColor: (lightColor: string, darkColor: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [accentColor, setAccentColorState] = useState<AccentColor>('primary');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  const isDarkMode = themeMode === 'dark' || (themeMode === 'auto' && systemScheme === 'dark');

  useEffect(() => {
    loadThemePreferences();

    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => listener?.remove();
  }, []);

  const loadThemePreferences = async () => {
    try {
      const savedThemeMode = await AsyncStorage.getItem('themeMode');
      const savedAccentColor = await AsyncStorage.getItem('accentColor');

      if (savedThemeMode) {
        setThemeModeState(savedThemeMode as ThemeMode);
      }
      if (savedAccentColor) {
        setAccentColorState(savedAccentColor as AccentColor);
      }
    } catch (error) {
      console.log('Failed to load theme preferences:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.log('Failed to save theme mode:', error);
    }
  };

  const setAccentColor = async (color: AccentColor) => {
    setAccentColorState(color);
    try {
      await AsyncStorage.setItem('accentColor', color);
    } catch (error) {
      console.log('Failed to save accent color:', error);
    }
  };

  const generateDynamicGradient = (baseColor: string): string[] => {
    const hue = Math.random() * 360;
    const saturation = 70 + Math.random() * 30;
    const lightness1 = 45 + Math.random() * 20;
    const lightness2 = lightness1 + 15 + Math.random() * 15;

    return [
      `hsl(${hue}, ${saturation}%, ${lightness1}%)`,
      `hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness2}%)`,
      `hsl(${(hue + 60) % 360}, ${saturation - 10}%, ${lightness1 + 10}%)`,
    ];
  };

  const getAdaptiveColor = (lightColor: string, darkColor: string): string => {
    return isDarkMode ? darkColor : lightColor;
  };

  const getDynamicColors = () => {
    const baseColors = { ...modernColors };

    if (isDarkMode) {
      return {
        ...baseColors,
        surface: {
          primary: baseColors.neutral[900],
          secondary: baseColors.neutral[800],
          elevated: baseColors.neutral[850],
          glass: 'rgba(26, 26, 26, 0.8)',
          dark: baseColors.neutral[950],
          darkGlass: 'rgba(10, 10, 10, 0.9)',
        },
        text: {
          primary: baseColors.neutral[50],
          secondary: baseColors.neutral[300],
          tertiary: baseColors.neutral[400],
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.4)',
          border: 'rgba(255, 255, 255, 0.1)',
          backdrop: 'rgba(255, 255, 255, 0.05)',
        },
      };
    }

    return {
      ...baseColors,
      text: {
        primary: baseColors.neutral[900],
        secondary: baseColors.neutral[600],
        tertiary: baseColors.neutral[500],
      },
    };
  };

  const getDynamicGradients = () => {
    const baseGradients = { ...modernGradients };

    switch (accentColor) {
      case 'neon':
        return {
          ...baseGradients,
          primary: {
            ...baseGradients.primary,
            light: [modernColors.neon.cyan, modernColors.neon.purple],
            medium: [modernColors.neon.blue, modernColors.neon.pink],
          },
        };
      case 'sunset':
        return {
          ...baseGradients,
          primary: {
            ...baseGradients.primary,
            light: baseGradients.sunset,
            medium: ['#ff8a65', '#ffab40'],
          },
        };
      case 'ocean':
        return {
          ...baseGradients,
          primary: {
            ...baseGradients.primary,
            light: baseGradients.ocean,
            medium: ['#42a5f5', '#26c6da'],
          },
        };
      case 'forest':
        return {
          ...baseGradients,
          primary: {
            ...baseGradients.primary,
            light: baseGradients.forest,
            medium: ['#66bb6a', '#81c784'],
          },
        };
      case 'cosmic':
        return {
          ...baseGradients,
          primary: {
            ...baseGradients.primary,
            light: baseGradients.cosmic,
            medium: ['#5c6bc0', '#7986cb'],
          },
        };
      default:
        return baseGradients;
    }
  };

  const value: ThemeContextType = {
    themeMode,
    accentColor,
    isDarkMode,
    colors: getDynamicColors(),
    gradients: getDynamicGradients(),
    setThemeMode,
    setAccentColor,
    generateDynamicGradient,
    getAdaptiveColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;