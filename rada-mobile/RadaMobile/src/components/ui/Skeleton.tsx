import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius,
  style,
  animated = true,
}) => {
  const { colors, borderRadius: themeBorderRadius } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );

      animation.start();

      return () => animation.stop();
    }
  }, [animated, animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const styles = StyleSheet.create({
    skeleton: {
      width,
      height,
      borderRadius: borderRadius ?? themeBorderRadius.md,
      backgroundColor: colors.background.secondary,
      overflow: 'hidden',
    },
  });

  if (animated) {
    return (
      <Animated.View style={[styles.skeleton, { opacity }, style]}>
        <LinearGradient
          colors={[
            colors.background.secondary,
            colors.background.tertiary,
            colors.background.secondary,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    );
  }

  return <View style={[styles.skeleton, style]} />;
};

// Pre-built skeleton components
interface SkeletonCardProps {
  showAvatar?: boolean;
  lines?: number;
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = true,
  lines = 3,
  style,
}) => {
  const { spacing } = useTheme();

  const styles = StyleSheet.create({
    card: {
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    avatar: {
      marginRight: spacing.md,
    },
    title: {
      flex: 1,
    },
    content: {
      gap: spacing.sm,
    },
  });

  return (
    <View style={[styles.card, style]}>
      {showAvatar && (
        <View style={styles.header}>
          <Skeleton
            width={40}
            height={40}
            borderRadius={20}
            style={styles.avatar}
          />
          <Skeleton
            width="60%"
            height={16}
            style={styles.title}
          />
        </View>
      )}

      <View style={styles.content}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            width={index === lines - 1 ? '70%' : '100%'}
            height={14}
          />
        ))}
      </View>
    </View>
  );
};

interface SkeletonListProps {
  items?: number;
  showAvatar?: boolean;
  style?: ViewStyle;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  showAvatar = true,
  style,
}) => {
  const { spacing } = useTheme();

  const styles = StyleSheet.create({
    container: {
      gap: spacing.md,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonCard
          key={index}
          showAvatar={showAvatar}
          lines={2}
        />
      ))}
    </View>
  );
};

export default Skeleton;