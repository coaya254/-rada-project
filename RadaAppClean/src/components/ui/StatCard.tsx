import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: keyof typeof MaterialIcons.glyphMap;
  gradientColors: string[];
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  gradientColors,
  subtitle,
}) => {
  const getChangeColor = () => {
    if (!change) return colors.neutral[500];
    switch (change.type) {
      case 'increase': return colors.success[600];
      case 'decrease': return colors.error[600];
      default: return colors.neutral[500];
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    switch (change.type) {
      case 'increase': return 'trending-up';
      case 'decrease': return 'trending-down';
      default: return 'trending-flat';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialIcons name={icon} size={24} color="#FFFFFF" />
          </View>
          {change && (
            <View style={styles.changeContainer}>
              <MaterialIcons
                name={getChangeIcon()!}
                size={16}
                color="rgba(255,255,255,0.9)"
              />
              <Text style={styles.changeText}>{change.value}</Text>
            </View>
          )}
        </View>

        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  gradient: {
    padding: spacing.xl,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: typography.fontWeights.bold as any,
    color: 'rgba(255,255,255,0.9)',
  },
  value: {
    fontSize: 32,
    fontWeight: typography.fontWeights.black as any,
    color: '#FFFFFF',
    lineHeight: 36,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: typography.fontWeights.bold as any,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: typography.fontWeights.medium as any,
    color: 'rgba(255,255,255,0.8)',
  },
});