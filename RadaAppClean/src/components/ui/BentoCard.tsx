import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

const { width } = Dimensions.get('window');

export type BentoSize = 'normal' | 'large' | 'tall';

interface BentoCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  gradientColors: string[];
  onPress: () => void;
  size?: BentoSize;
  stats?: {
    main: string;
    sub: string;
  };
  style?: ViewStyle;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  title,
  subtitle,
  icon,
  gradientColors,
  onPress,
  size = 'normal',
  stats,
  style,
}) => {
  const getCardSize = () => {
    switch (size) {
      case 'large':
        return {
          width: width - 48,
          height: 160,
        };
      case 'tall':
        return {
          width: (width - 64) / 2,
          height: 320,
        };
      default:
        return {
          width: (width - 64) / 2,
          height: 144,
        };
    }
  };

  const cardSize = getCardSize();

  return (
    <TouchableOpacity
      style={[styles.container, cardSize, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Header with icon and stats */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name={icon} size={28} color="#FFFFFF" />
            </View>
            {stats && (
              <View style={styles.statsContainer}>
                <Text style={styles.statsMain}>{stats.main}</Text>
                <Text style={styles.statsSub}>{stats.sub}</Text>
              </View>
            )}
          </View>

          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.lg,
  },
  gradient: {
    flex: 1,
    padding: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsMain: {
    fontSize: 28,
    fontWeight: typography.fontWeights.black as any,
    color: '#FFFFFF',
    lineHeight: 32,
  },
  statsSub: {
    fontSize: 12,
    fontWeight: typography.fontWeights.semibold as any,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  textContainer: {
    marginTop: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: typography.fontWeights.black as any,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: typography.fontWeights.semibold as any,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
});