import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { NewsItem } from '../../types';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface NewsCardProps {
  item: NewsItem;
  onPress: (item: NewsItem) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, onPress }) => {
  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      'Standard Digital': '#E74C3C',
      'Daily Nation': '#2E86AB',
      'The Star': '#F39C12',
      'Capital FM': '#8E44AD',
      'Citizen Digital': '#27AE60',
      'K24': '#3498DB',
      'NTV': '#E67E22',
      'KTN': '#9B59B6',
    };
    return colors[source] || '#6B7280';
  };

  const getCredibilityColor = (credibility: NewsItem['credibility']) => {
    switch (credibility) {
      case 'maximum': return colors.success[500];
      case 'high': return colors.success[500];
      case 'medium': return colors.warning[500];
      case 'single': return colors.error[500];
      default: return colors.neutral[400];
    }
  };

  const getCredibilityLabel = (credibility: NewsItem['credibility']) => {
    switch (credibility) {
      case 'maximum': return 'VERIFIED';
      case 'high': return 'HIGH';
      case 'medium': return 'MEDIUM';
      case 'single': return 'SINGLE SOURCE';
      default: return '';
    }
  };

  return (
    <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.8}>
      <Card variant="elevated" style={styles.newsCard}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.metaRow}>
            <View
              style={[
                styles.sourceBadge,
                { backgroundColor: getSourceColor(item.source) + '20' }
              ]}
            >
              <Text
                style={[
                  styles.sourceBadgeText,
                  { color: getSourceColor(item.source) }
                ]}
              >
                {item.source}
              </Text>
            </View>
            <View
              style={[
                styles.credibilityBadge,
                { backgroundColor: getCredibilityColor(item.credibility) }
              ]}
            >
              <Text style={styles.credibilityText}>
                {getCredibilityLabel(item.credibility)}
              </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.neutral[400]} />
        </View>

        {/* Headline */}
        <Text style={styles.headline} numberOfLines={2}>
          {item.headline}
        </Text>

        {/* Summary */}
        <Text style={styles.summary} numberOfLines={3}>
          {item.summary}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.dateRow}>
            <MaterialIcons name="access-time" size={16} color={colors.neutral[500]} />
            <Text style={styles.dateText}>
              {new Date(item.source_publication_date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  newsCard: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  sourceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  credibilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  credibilityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 18,
    marginBottom: 8,
  },
  summary: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 10,
    color: '#6B7280',
  },
});