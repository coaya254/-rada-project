import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Animated,
  PanGestureHandler,
  State,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { modernColors, modernShadows, modernBorderRadius, modernAnimations } from './modernTheme';

interface ModernCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'glass' | 'gradient' | 'elevated' | 'neumorphic' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  disabled?: boolean;
  interactive?: boolean;
  glowColor?: string;
  gradientColors?: string[];
}

const ModernCard: React.FC<ModernCardProps> = ({
  children,
  onPress,
  variant = 'glass',
  size = 'md',
  style,
  disabled = false,
  interactive = true,
  glowColor = modernColors.primary[500],
  gradientColors = modernColors.primary.gradient,
}) => {
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: 12, borderRadius: modernBorderRadius.lg };
      case 'lg':
        return { padding: 24, borderRadius: modernBorderRadius['2xl'] };
      default:
        return { padding: 16, borderRadius: modernBorderRadius.xl };
    }
  };

  const getVariantStyles = () => {
    const sizeStyles = getSizeStyles();

    switch (variant) {
      case 'glass':
        return {
          ...sizeStyles,
          backgroundColor: modernColors.glass.light,
          borderWidth: 1,
          borderColor: modernColors.glass.border,
          ...modernShadows.glass,
        };

      case 'gradient':
        return {
          ...sizeStyles,
          overflow: 'hidden' as const,
          ...modernShadows.lg,
        };

      case 'elevated':
        return {
          ...sizeStyles,
          backgroundColor: modernColors.surface.elevated,
          ...modernShadows.xl,
        };

      case 'neumorphic':
        return {
          ...sizeStyles,
          backgroundColor: '#f0f0f3',
          ...modernShadows.md,
        };

      case 'neon':
        return {
          ...sizeStyles,
          backgroundColor: modernColors.neutral[900],
          borderWidth: 2,
          borderColor: glowColor,
          ...modernShadows.coloredPrimary,
        };

      default:
        return sizeStyles;
    }
  };

  const handlePressIn = () => {
    if (!interactive || disabled) return;

    setIsPressed(true);

    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.timing(glowAnimation, {
        toValue: 1,
        duration: modernAnimations.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (!interactive || disabled) return;

    setIsPressed(false);

    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.timing(glowAnimation, {
        toValue: 0,
        duration: modernAnimations.duration.normal,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled) return;

    // Haptic feedback
    if (onPress) {
      // Add micro-interaction bounce
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 0.95,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnimation, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
          bounciness: 12,
        }),
      ]).start();

      onPress();
    }
  };

  const renderCardContent = () => {
    if (variant === 'glass') {
      return (
        <BlurView intensity={20} style={[styles.blurContainer, getVariantStyles()]}>
          {children}
        </BlurView>
      );
    }

    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={gradientColors}
          style={[styles.gradientContainer, getVariantStyles()]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      );
    }

    return (
      <View style={[styles.container, getVariantStyles()]}>
        {children}
      </View>
    );
  };

  const cardStyle = [
    {
      transform: [
        { scale: scaleAnimation },
        {
          rotateY: rotateAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '2deg'],
          }),
        },
      ],
    },
    variant === 'neon' && {
      shadowColor: glowAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', glowColor],
      }),
      shadowOpacity: glowAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
      shadowRadius: glowAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 20],
      }),
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.pressable, { opacity: disabled ? 0.6 : 1 }]}
      >
        <Animated.View style={cardStyle}>
          {renderCardContent()}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Animated.View style={cardStyle}>
      {renderCardContent()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'stretch',
  },
  container: {
    backgroundColor: modernColors.surface.primary,
  },
  blurContainer: {
    backgroundColor: 'transparent',
  },
  gradientContainer: {
    backgroundColor: 'transparent',
  },
});

export default ModernCard;