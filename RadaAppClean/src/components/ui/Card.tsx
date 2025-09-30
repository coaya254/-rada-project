import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

export type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
}) => {
  const getCardStyles = () => {
    switch (variant) {
      case 'elevated':
        return [styles.base, styles.elevated, style];
      case 'outlined':
        return [styles.base, styles.outlined, style];
      default:
        return [styles.base, styles.default, style];
    }
  };

  return <View style={getCardStyles()}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
  },
  default: {
    ...shadows.md,
  },
  elevated: {
    ...shadows.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
});