import React, { forwardRef, useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  required?: boolean;
  disabled?: boolean;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'outlined',
  size = 'medium',
  required = false,
  disabled = false,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 40,
          fontSize: typography.sizes.sm,
          paddingHorizontal: spacing.md,
        };
      case 'large':
        return {
          height: 56,
          fontSize: typography.sizes.md,
          paddingHorizontal: spacing.lg,
        };
      default:
        return {
          height: 48,
          fontSize: typography.sizes.base,
          paddingHorizontal: spacing.md,
        };
    }
  };

  const getVariantStyles = () => {
    const sizeStyles = getSizeStyles();

    if (variant === 'filled') {
      return {
        backgroundColor: colors.background.secondary,
        borderWidth: 0,
        borderBottomWidth: 2,
        borderBottomColor: isFocused ? colors.primary.main : colors.border.medium,
        borderRadius: 0,
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
      };
    }

    return {
      backgroundColor: colors.background.card,
      borderWidth: 1.5,
      borderColor: error
        ? colors.semantic.error
        : isFocused
          ? colors.primary.main
          : colors.border.medium,
      borderRadius: borderRadius.md,
    };
  };

  const borderColorStyle = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border.medium, colors.primary.main],
  });

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    labelContainer: {
      flexDirection: 'row',
      marginBottom: spacing.xs,
    },
    label: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.text.secondary,
    },
    required: {
      color: colors.semantic.error,
      marginLeft: 2,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      ...getVariantStyles(),
      ...getSizeStyles(),
      opacity: disabled ? 0.6 : 1,
    },
    input: {
      flex: 1,
      color: colors.text.primary,
      fontSize: getSizeStyles().fontSize,
    },
    leftIcon: {
      marginRight: spacing.sm,
    },
    rightIcon: {
      marginLeft: spacing.sm,
    },
    helperText: {
      fontSize: typography.sizes.xs,
      color: error ? colors.semantic.error : colors.text.tertiary,
      marginTop: spacing.xs,
      marginLeft: spacing.xs,
    },
    focusedInput: {
      borderColor: colors.primary.main,
    },
    errorInput: {
      borderColor: colors.semantic.error,
    },
  });

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}

      <Animated.View
        style={[
          styles.inputContainer,
          variant === 'outlined' && {
            borderColor: error ? colors.semantic.error : borderColorStyle,
          }
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? colors.primary.main : colors.text.tertiary}
            style={styles.leftIcon}
          />
        )}

        <RNTextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons
              name={rightIcon}
              size={20}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {(error || helperText) && (
        <Text style={styles.helperText}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

TextInput.displayName = 'TextInput';

export default TextInput;