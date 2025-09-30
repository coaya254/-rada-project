import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from './theme';

interface BreadcrumbItem {
  label: string;
  onPress?: () => void;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  maxItems?: number;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, maxItems = 3 }) => {
  const visibleItems = items.length > maxItems
    ? [items[0], { label: '...', onPress: undefined }, ...items.slice(-maxItems + 1)]
    : items;

  return (
    <View style={styles.container}>
      {visibleItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <Ionicons
              name="chevron-forward"
              size={14}
              color={colors.gray[400]}
              style={styles.separator}
            />
          )}

          {item.onPress ? (
            <TouchableOpacity onPress={item.onPress} style={styles.breadcrumbItem}>
              <Text
                style={[
                  styles.breadcrumbText,
                  item.isActive && styles.activeBreadcrumb,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.breadcrumbItem}>
              <Text
                style={[
                  styles.breadcrumbText,
                  item.isActive && styles.activeBreadcrumb,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </View>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  breadcrumbItem: {
    maxWidth: 120,
  },
  breadcrumbText: {
    ...typography.bodySmall,
    color: colors.gray[600],
    fontWeight: '500',
  },
  activeBreadcrumb: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  separator: {
    marginHorizontal: spacing.xs,
  },
});

export default Breadcrumbs;