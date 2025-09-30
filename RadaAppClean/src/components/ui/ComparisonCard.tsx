import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

export interface ComparisonItem {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
}

export interface ComparisonCardProps {
  leftItem: ComparisonItem;
  rightItem: ComparisonItem;
  title?: string;
  gradientColors?: string[];
  onPress?: () => void;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  leftItem,
  rightItem,
  title,
  gradientColors = colors.gradients.primary,
  onPress,
}) => {
  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'trending-flat';
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return colors.success[600];
      case 'down': return colors.error[600];
      default: return colors.neutral[500];
    }
  };

  const renderItem = (item: ComparisonItem, isLeft: boolean) => (
    <View style={[styles.itemContainer, isLeft && styles.leftItem]}>
      {item.icon && (
        <View style={styles.iconContainer}>
          <MaterialIcons name={item.icon} size={20} color="#FFFFFF" />
        </View>
      )}

      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemValue}>{item.value}</Text>

      {item.subtitle && (
        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
      )}

      {item.trend && (
        <View style={styles.trendContainer}>
          <MaterialIcons
            name={getTrendIcon(item.trend.direction)}
            size={16}
            color={getTrendColor(item.trend.direction)}
          />
          <Text style={[styles.trendText, { color: getTrendColor(item.trend.direction) }]}>
            {item.trend.value}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <MaterialIcons name="compare-arrows" size={20} color="#FFFFFF" />
          </View>
        )}

        <View style={styles.comparisonContainer}>
          {renderItem(leftItem, true)}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.dividerLine} />
          </View>

          {renderItem(rightItem, false)}
        </View>
      </LinearGradient>
    </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: typography.fontWeights.bold as any,
    color: '#FFFFFF',
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContainer: {
    flex: 1,
    alignItems: 'center',
  },
  leftItem: {
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeights.semibold as any,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    textAlign: 'center',
  },
  itemValue: {
    fontSize: 24,
    fontWeight: typography.fontWeights.black as any,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 12,
    fontWeight: typography.fontWeights.medium as any,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: typography.fontWeights.bold as any,
  },
  divider: {
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  dividerLine: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  vsContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.full,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    fontSize: 12,
    fontWeight: typography.fontWeights.black as any,
    color: '#FFFFFF',
  },
});