import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface StatusBadgeProps {
  status: 'completed' | 'in_progress' | 'pending' | 'broken';
  text?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const { colors, spacing, borderRadius, typography } = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return colors.semantic.success;
      case 'in_progress':
        return colors.secondary.blue;
      case 'pending':
        return colors.secondary.purple;
      case 'broken':
        return colors.semantic.error;
      default:
        return colors.primary.main;
    }
  };

  const getStatusText = () => {
    if (text) return text;
    switch (status) {
      case 'completed':
        return 'COMPLETED';
      case 'in_progress':
        return 'IN PROGRESS';
      case 'pending':
        return 'PENDING';
      case 'broken':
        return 'BROKEN';
      default:
        return status.toUpperCase();
    }
  };

  const styles = StyleSheet.create({
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.lg,
      backgroundColor: getStatusColor(),
    },
    text: {
      fontSize: typography.sizes.xs,
      color: colors.text.inverse,
      fontWeight: typography.weights.semibold,
      textTransform: 'uppercase',
    },
  });

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>
        {getStatusText()}
      </Text>
    </View>
  );
};

export default StatusBadge;