import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, shadows, borderRadius } from './theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof spacing;
  style?: ViewStyle;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'default',
  padding = 'md',
  style,
  disabled = false,
}) => {
  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.lg,
      padding: spacing[padding],
    };

    switch (variant) {
      case 'elevated':
        return [baseStyle, shadows.md];
      case 'outlined':
        return [
          baseStyle,
          {
            borderWidth: 1,
            borderColor: colors.gray[200],
          },
        ];
      default:
        return [baseStyle, shadows.sm];
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[getCardStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Component>
  );
};

export default Card;