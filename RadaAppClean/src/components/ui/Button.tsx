import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'error' | 'dark';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof MaterialIcons.glyphMap;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const getGradientColors = (variant: ButtonVariant): string[] => {
  switch (variant) {
    case 'primary': return [...colors.gradients.primary];
    case 'success': return [...colors.gradients.success];
    case 'error': return [...colors.gradients.error];
    case 'dark': return [...colors.gradients.dark];
    case 'secondary': return [colors.neutral[100], colors.neutral[200]];
    default: return [...colors.gradients.primary];
  }
};

const getTextColor = (variant: ButtonVariant): string => {
  return variant === 'secondary' ? colors.neutral[700] : '#FFFFFF';
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        fontSize: typography.styles.buttonSmall.fontSize,
      };
    case 'large':
      return {
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing['2xl'],
        fontSize: typography.styles.buttonLarge.fontSize,
      };
    default: // medium
      return {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        fontSize: typography.styles.button.fontSize,
      };
  }
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const sizeStyles = getSizeStyles(size);
  const textColor = getTextColor(variant);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      testID={testID}
    >
      <LinearGradient
        colors={getGradientColors(variant)}
        style={[
          styles.gradient,
          {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
          },
          disabled && styles.disabled,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icon && (
          <MaterialIcons
            name={icon}
            size={size === 'large' ? 24 : size === 'small' ? 16 : 20}
            color={textColor}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeStyles.fontSize,
              color: textColor,
            },
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  gradient: {
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.fontWeights.black as any,
    textAlign: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});