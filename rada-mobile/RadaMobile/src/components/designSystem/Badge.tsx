import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from './theme';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'md',
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: colors.success[100],
          borderColor: colors.success[200],
          color: colors.success[700],
        };
      case 'warning':
        return {
          backgroundColor: colors.warning[100],
          borderColor: colors.warning[200],
          color: colors.warning[700],
        };
      case 'error':
        return {
          backgroundColor: colors.error[100],
          borderColor: colors.error[200],
          color: colors.error[700],
        };
      case 'info':
        return {
          backgroundColor: colors.primary[100],
          borderColor: colors.primary[200],
          color: colors.primary[700],
        };
      default:
        return {
          backgroundColor: colors.gray[100],
          borderColor: colors.gray[200],
          color: colors.gray[700],
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: spacing.xs,
          paddingVertical: spacing.xs / 2,
          fontSize: 10,
        };
      case 'lg':
        return {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          fontSize: 14,
        };
      default:
        return {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          fontSize: 12,
        };
    }
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: variantStyle.color,
            fontSize: sizeStyle.fontSize,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Badge;