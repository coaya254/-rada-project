import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';

export interface TimelineItemProps {
  title: string;
  date: string;
  description?: string;
  type?: 'vote' | 'speech' | 'bill' | 'meeting' | 'default';
  isLast?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  date,
  description,
  type = 'default',
  isLast = false,
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
          <Text style={styles.title}>{title}</Text>
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
  title: {
    fontSize: 16,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral[900],
    marginBottom: 4,
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