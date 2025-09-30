import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from './theme';

interface StatusBadgeProps {
  status: 'completed' | 'in_progress' | 'locked' | 'available';
  text?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  showIcon = true,
  size = 'md',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          backgroundColor: colors.success[100],
          borderColor: colors.success[200],
          textColor: colors.success[700],
          icon: 'checkmark-circle',
          defaultText: 'Completed',
        };
      case 'in_progress':
        return {
          backgroundColor: colors.warning[100],
          borderColor: colors.warning[200],
          textColor: colors.warning[700],
          icon: 'time',
          defaultText: 'In Progress',
        };
      case 'locked':
        return {
          backgroundColor: colors.gray[100],
          borderColor: colors.gray[200],
          textColor: colors.gray[600],
          icon: 'lock-closed',
          defaultText: 'Locked',
        };
      case 'available':
        return {
          backgroundColor: colors.primary[100],
          borderColor: colors.primary[200],
          textColor: colors.primary[700],
          icon: 'play-circle',
          defaultText: 'Available',
        };
      default:
        return {
          backgroundColor: colors.gray[100],
          borderColor: colors.gray[200],
          textColor: colors.gray[600],
          icon: 'help-circle',
          defaultText: 'Unknown',
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          padding: spacing.xs,
          fontSize: 10,
          iconSize: 12,
        };
      case 'lg':
        return {
          padding: spacing.md,
          fontSize: 14,
          iconSize: 18,
        };
      default:
        return {
          padding: spacing.sm,
          fontSize: 12,
          iconSize: 14,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const sizeConfig = getSizeConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: statusConfig.backgroundColor,
          borderColor: statusConfig.borderColor,
          padding: sizeConfig.padding,
        },
      ]}
    >
      <View style={styles.content}>
        {showIcon && (
          <Ionicons
            name={statusConfig.icon as any}
            size={sizeConfig.iconSize}
            color={statusConfig.textColor}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.text,
            {
              color: statusConfig.textColor,
              fontSize: sizeConfig.fontSize,
            },
          ]}
        >
          {text || statusConfig.defaultText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.xs / 2,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
});

export default StatusBadge;