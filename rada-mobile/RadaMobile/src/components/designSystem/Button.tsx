import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography, borderRadius } from './theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: borderRadius.md,
      borderWidth: 1,
    };

    const sizeStyles = {
      sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
      md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
      lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
    };

    const variantStyles = {
      primary: {
        backgroundColor: disabled ? colors.gray[300] : colors.primary[500],
        borderColor: disabled ? colors.gray[300] : colors.primary[500],
      },
      secondary: {
        backgroundColor: disabled ? colors.gray[100] : colors.gray[500],
        borderColor: disabled ? colors.gray[100] : colors.gray[500],
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: disabled ? colors.gray[300] : colors.primary[500],
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
    };

    return [baseStyle, sizeStyles[size], variantStyles[variant]];
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      ...typography.button,
      fontWeight: '600' as const,
    };

    const variantTextStyles = {
      primary: { color: disabled ? colors.gray[500] : 'white' },
      secondary: { color: disabled ? colors.gray[400] : 'white' },
      outline: { color: disabled ? colors.gray[400] : colors.primary[500] },
      ghost: { color: disabled ? colors.gray[400] : colors.primary[500] },
    };

    return [baseTextStyle, variantTextStyles[variant]];
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;