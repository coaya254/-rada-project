import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from './theme';

interface XPIndicatorProps {
  currentXP: number;
  xpToNextLevel: number;
  level: number;
  showAnimation?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const XPIndicator: React.FC<XPIndicatorProps> = ({
  currentXP,
  xpToNextLevel,
  level,
  showAnimation = true,
  size = 'md',
}) => {
  const progress = (currentXP / xpToNextLevel) * 100;
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const scaleAnimation = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (showAnimation) {
      // Progress bar animation
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      // Level badge pulse animation
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [currentXP, progress]);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: { padding: spacing.sm },
          levelBadge: { width: 32, height: 32 },
          levelText: { fontSize: 12 },
          xpText: { fontSize: 11 },
          progressHeight: 6,
        };
      case 'lg':
        return {
          container: { padding: spacing.lg },
          levelBadge: { width: 48, height: 48 },
          levelText: { fontSize: 18 },
          xpText: { fontSize: 16 },
          progressHeight: 12,
        };
      default:
        return {
          container: { padding: spacing.md },
          levelBadge: { width: 40, height: 40 },
          levelText: { fontSize: 14 },
          xpText: { fontSize: 13 },
          progressHeight: 8,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container]}>
      {/* Level Badge */}
      <Animated.View
        style={[
          styles.levelBadge,
          sizeStyles.levelBadge,
          { transform: [{ scale: scaleAnimation }] },
        ]}
      >
        <Ionicons name="star" size={16} color={colors.warning[600]} />
        <Text style={[styles.levelText, { fontSize: sizeStyles.levelText.fontSize }]}>
          {level}
        </Text>
      </Animated.View>

      {/* XP Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.xpHeader}>
          <Text style={[styles.xpLabel, { fontSize: sizeStyles.xpText.fontSize }]}>
            Experience Points
          </Text>
          <Text style={[styles.xpValue, { fontSize: sizeStyles.xpText.fontSize }]}>
            {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressTrack, { height: sizeStyles.progressHeight }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: animatedValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
                height: sizeStyles.progressHeight,
              },
            ]}
          />
        </View>

        {/* Next Level Indicator */}
        <Text style={styles.nextLevelText}>
          {xpToNextLevel - currentXP} XP to Level {level + 1}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  levelBadge: {
    backgroundColor: colors.warning[50],
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.warning[200],
  },
  levelText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.warning[700],
    marginLeft: 2,
  },
  progressContainer: {
    flex: 1,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  xpLabel: {
    ...typography.caption,
    color: colors.gray[600],
    fontWeight: '500',
  },
  xpValue: {
    ...typography.caption,
    color: colors.gray[800],
    fontWeight: '600',
  },
  progressTrack: {
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    backgroundColor: colors.xp,
    borderRadius: borderRadius.full,
  },
  nextLevelText: {
    ...typography.caption,
    color: colors.gray[500],
    fontSize: 11,
  },
});

export default XPIndicator;