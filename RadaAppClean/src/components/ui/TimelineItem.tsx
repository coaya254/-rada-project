import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';

export interface TimelineItemProps {
  title: string;
  date: string;
  description?: string;
  type?: 'vote' | 'speech' | 'bill' | 'meeting' | 'default' | 'position' | 'achievement' | 'controversy' | 'legislation' | 'event';
  isLast?: boolean;
  hasSourceLinks?: boolean;
  onSourcePress?: () => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  date,
  description,
  type = 'default',
  isLast = false,
  hasSourceLinks = false,
  onSourcePress,
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'vote':
        return {
          icon: 'how-to-vote' as keyof typeof MaterialIcons.glyphMap,
          color: colors.primary[600],
          backgroundColor: colors.primary[100],
        };
      case 'speech':
        return {
          icon: 'record-voice-over' as keyof typeof MaterialIcons.glyphMap,
          color: colors.success[600],
          backgroundColor: colors.success[100],
        };
      case 'bill':
      case 'legislation':
        return {
          icon: 'description' as keyof typeof MaterialIcons.glyphMap,
          color: colors.warning[600],
          backgroundColor: colors.warning[100],
        };
      case 'meeting':
        return {
          icon: 'groups' as keyof typeof MaterialIcons.glyphMap,
          color: colors.purple[600],
          backgroundColor: colors.purple[100],
        };
      case 'position':
        return {
          icon: 'work' as keyof typeof MaterialIcons.glyphMap,
          color: colors.primary[600],
          backgroundColor: colors.primary[100],
        };
      case 'achievement':
        return {
          icon: 'emoji-events' as keyof typeof MaterialIcons.glyphMap,
          color: colors.success[600],
          backgroundColor: colors.success[100],
        };
      case 'controversy':
        return {
          icon: 'warning' as keyof typeof MaterialIcons.glyphMap,
          color: colors.error[600],
          backgroundColor: colors.error[100],
        };
      default:
        return {
          icon: 'event' as keyof typeof MaterialIcons.glyphMap,
          color: colors.neutral[600],
          backgroundColor: colors.neutral[100],
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <View style={styles.container}>
      <View style={styles.timelineIndicator}>
        <View style={[styles.iconContainer, { backgroundColor: typeConfig.backgroundColor }]}>
          <MaterialIcons name={typeConfig.icon} size={16} color={typeConfig.color} />
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {hasSourceLinks && onSourcePress && (
              <TouchableOpacity
                style={styles.sourceIcon}
                onPress={onSourcePress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons name="link" size={12} color={colors.primary[500]} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.date}>{date}</Text>
        </View>

        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingBottom: 16,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.neutral[200],
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingTop: 4,
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral[900],
    flex: 1,
  },
  sourceIcon: {
    padding: 2,
    marginLeft: 8,
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.primary[200],
  },
  date: {
    fontSize: 14,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.neutral[500],
  },
  description: {
    fontSize: 14,
    fontWeight: typography.fontWeights.regular as any,
    color: colors.neutral[700],
    lineHeight: 20,
  },
});