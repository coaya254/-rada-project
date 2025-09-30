import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../../theme';

export interface ProgressBarProps {
  progress: number; // 0-100
  title?: string;
  showPercentage?: boolean;
  height?: number;
  gradientColors?: string[];
  backgroundColor?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  title,
  showPercentage = true,
  height = 8,
  gradientColors = colors.gradients.primary,
  backgroundColor = colors.neutral[200],
  animated = true,
}) => {
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(progress);
    }
  }, [progress, animated]);

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {showPercentage && (
            <Text style={styles.percentage}>{Math.round(progress)}%</Text>
          )}
        </View>
      )}

      <View style={[styles.track, { height, backgroundColor }]}>
        <Animated.View
          style={[
            styles.progressContainer,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            style={[styles.progress, { height }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.neutral[700],
  },
  percentage: {
    fontSize: 14,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary[600],
  },
  track: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressContainer: {
    height: '100%',
  },
  progress: {
    borderRadius: borderRadius.full,
  },
});