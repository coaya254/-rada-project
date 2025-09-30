import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  hapticFeedback?: boolean;
  animationType?: 'scale' | 'bounce' | 'ripple' | 'gradient';
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  hapticFeedback = true,
  animationType = 'scale',
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const gradientValue = useRef(new Animated.Value(0)).current;
  const rippleValue = useRef(new Animated.Value(0)).current;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          fontSize: typography.sizes.sm,
          minHeight: 36,
        };
      case 'large':
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          fontSize: typography.sizes.md,
          minHeight: 56,
        };
      default:
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          fontSize: typography.sizes.base,
          minHeight: 48,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.secondary.blue,
          textColor: colors.primary.text,
          borderColor: colors.secondary.blue,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          textColor: colors.primary.main,
          borderColor: colors.primary.main,
          borderWidth: 1.5,
        };
      case 'ghost':
        return {
          backgroundColor: colors.primary.background,
          textColor: colors.primary.main,
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.primary.main,
          textColor: colors.primary.text,
          borderColor: colors.primary.main,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,

    onPanResponderGrant: () => {
      if (disabled || loading) return;

      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      switch (animationType) {
        case 'scale':
          Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
          }).start();
          break;
        case 'bounce':
          Animated.sequence([
            Animated.timing(scaleValue, {
              toValue: 0.9,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.spring(scaleValue, {
              toValue: 1.1,
              tension: 300,
              friction: 5,
              useNativeDriver: true,
            }),
          ]).start();
          break;
        case 'gradient':
          Animated.timing(gradientValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }).start();
          break;
        case 'ripple':
          rippleValue.setValue(0);
          Animated.timing(rippleValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
          break;
      }
    },

    onPanResponderRelease: () => {
      if (disabled || loading) return;

      switch (animationType) {
        case 'scale':
        case 'bounce':
          Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
          break;
        case 'gradient':
          Animated.timing(gradientValue, {
            toValue: 0,
            duration: 150,
            useNativeDriver: false,
          }).start();
          break;
      }

      onPress();
    },
  });

  const buttonScale = scaleValue;
  const buttonOpacity = disabled ? 0.6 : opacityValue;

  const gradientOpacity = gradientValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.2],
  });

  const rippleScale = rippleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const rippleOpacity = rippleValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0],
  });

  const styles = StyleSheet.create({
    button: {
      ...sizeStyles,
      backgroundColor: variantStyles.backgroundColor,
      borderColor: variantStyles.borderColor,
      borderWidth: variantStyles.borderWidth || 0,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      overflow: 'hidden',
      position: 'relative',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: sizeStyles.fontSize,
      fontWeight: typography.weights.semibold,
      color: variantStyles.textColor,
      textAlign: 'center',
    },
    icon: {
      marginHorizontal: spacing.xs,
    },
    gradientOverlay: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: borderRadius.lg,
    },
    ripple: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary.text,
    },
  });

  return (
    <Animated.View
      style={[
        styles.button,
        {
          transform: [{ scale: buttonScale }],
          opacity: buttonOpacity,
        },
        style,
      ]}
      {...panResponder.panHandlers}
    >
      {/* Gradient overlay for gradient animation */}
      {animationType === 'gradient' && (
        <Animated.View style={[styles.gradientOverlay, { opacity: gradientOpacity }]}>
          <LinearGradient
            colors={['transparent', colors.primary.text, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      )}

      {/* Ripple effect */}
      {animationType === 'ripple' && (
        <Animated.View
          style={[
            styles.ripple,
            {
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
            },
          ]}
        />
      )}

      <Animated.View style={styles.content}>
        {leftIcon && <Animated.View style={styles.icon}>{leftIcon}</Animated.View>}

        <Text style={[styles.text, textStyle]}>
          {loading ? 'Loading...' : title}
        </Text>

        {rightIcon && <Animated.View style={styles.icon}>{rightIcon}</Animated.View>}
      </Animated.View>
    </Animated.View>
  );
};

export default AnimatedButton;