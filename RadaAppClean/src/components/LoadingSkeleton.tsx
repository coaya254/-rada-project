// components/LoadingSkeleton.tsx

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

// Basic skeleton component
export const Skeleton: React.FC<SkeletonProps> = ({ 
  width: w = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });
  
  return (
    <Animated.View 
      style={[
        {
          width: w,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
          opacity,
        },
        style
      ]} 
    />
  );
};

// Module card skeleton
export const ModuleCardSkeleton: React.FC = () => {
  return (
    <View style={styles.moduleCard}>
      <View style={styles.moduleHeader}>
        <Skeleton width={48} height={48} borderRadius={12} style={styles.moduleIcon} />
        <View style={styles.moduleInfo}>
          <Skeleton width="70%" height={16} style={styles.moduleTitle} />
          <Skeleton width="50%" height={12} style={styles.moduleSubtitle} />
        </View>
      </View>
      <Skeleton width="100%" height={6} borderRadius={3} style={styles.moduleProgress} />
      <View style={styles.moduleFooter}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={60} height={24} borderRadius={12} />
      </View>
    </View>
  );
};

// Lesson list item skeleton
export const LessonItemSkeleton: React.FC = () => {
  return (
    <View style={styles.lessonItem}>
      <Skeleton width={40} height={40} borderRadius={20} style={styles.lessonIcon} />
      <View style={styles.lessonContent}>
        <Skeleton width="80%" height={16} style={styles.lessonTitle} />
        <Skeleton width="60%" height={12} style={styles.lessonMeta} />
      </View>
      <Skeleton width={24} height={24} borderRadius={12} />
    </View>
  );
};

// Dashboard stat card skeleton
export const StatCardSkeleton: React.FC = () => {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Skeleton width={48} height={48} borderRadius={12} />
        <Skeleton width={40} height={20} borderRadius={10} />
      </View>
      <Skeleton width={80} height={28} style={styles.statValue} />
      <Skeleton width="60%" height={14} style={styles.statLabel} />
      <Skeleton width="40%" height={12} />
    </View>
  );
};

// Profile header skeleton
export const ProfileHeaderSkeleton: React.FC = () => {
  return (
    <View style={styles.profileHeader}>
      <Skeleton width={100} height={100} borderRadius={50} style={styles.profileAvatar} />
      <Skeleton width={150} height={24} style={styles.profileName} />
      <Skeleton width={200} height={16} style={styles.profileEmail} />
      <View style={styles.profileStats}>
        <View style={styles.profileStat}>
          <Skeleton width={60} height={32} style={styles.profileStatValue} />
          <Skeleton width={80} height={14} />
        </View>
        <View style={styles.profileStat}>
          <Skeleton width={60} height={32} style={styles.profileStatValue} />
          <Skeleton width={80} height={14} />
        </View>
        <View style={styles.profileStat}>
          <Skeleton width={60} height={32} style={styles.profileStatValue} />
          <Skeleton width={80} height={14} />
        </View>
      </View>
    </View>
  );
};

// Quiz question skeleton
export const QuizQuestionSkeleton: React.FC = () => {
  return (
    <View style={styles.quizQuestion}>
      <Skeleton width={60} height={24} borderRadius={12} style={styles.quizBadge} />
      <Skeleton width="90%" height={20} style={styles.quizTitle} />
      <Skeleton width="80%" height={16} style={styles.quizSubtitle} />
      <View style={styles.quizOptions}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={styles.quizOption}>
            <Skeleton width={24} height={24} borderRadius={12} />
            <Skeleton width="80%" height={16} />
          </View>
        ))}
      </View>
    </View>
  );
};

// Table row skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
  return (
    <View style={styles.tableRow}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} width={`${90 / columns}%`} height={16} />
      ))}
    </View>
  );
};

// List of module cards skeleton
export const ModuleListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ModuleCardSkeleton key={i} />
      ))}
    </>
  );
};

// List of lessons skeleton
export const LessonListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <LessonItemSkeleton key={i} />
      ))}
    </>
  );
};

// Dashboard skeleton
export const DashboardSkeleton: React.FC = () => {
  return (
    <View style={styles.dashboard}>
      <View style={styles.dashboardGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </View>
      <View style={styles.dashboardSection}>
        <Skeleton width={200} height={20} style={styles.sectionTitle} />
        <ModuleListSkeleton count={2} />
      </View>
    </View>
  );
};

// Full page skeleton
export const FullPageSkeleton: React.FC = () => {
  return (
    <View style={styles.fullPage}>
      <View style={styles.fullPageHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.fullPageHeaderContent}>
          <Skeleton width={200} height={24} />
          <Skeleton width={150} height={14} style={{ marginTop: 8 }} />
        </View>
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>
      <View style={styles.fullPageBody}>
        <ModuleListSkeleton count={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Module Card
  moduleCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moduleHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  moduleIcon: {
    marginRight: 12,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    marginBottom: 8,
  },
  moduleSubtitle: {},
  moduleProgress: {
    marginBottom: 12,
  },
  moduleFooter: {
    flexDirection: 'row',
    gap: 8,
  },

  // Lesson Item
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lessonIcon: {
    marginRight: 12,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    marginBottom: 8,
  },
  lessonMeta: {},

  // Stat Card
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statValue: {
    marginBottom: 4,
  },
  statLabel: {
    marginBottom: 2,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF',
  },
  profileAvatar: {
    marginBottom: 16,
  },
  profileName: {
    marginBottom: 8,
  },
  profileEmail: {
    marginBottom: 24,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 32,
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    marginBottom: 8,
  },

  // Quiz Question
  quizQuestion: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
  },
  quizBadge: {
    marginBottom: 16,
  },
  quizTitle: {
    marginBottom: 8,
  },
  quizSubtitle: {
    marginBottom: 24,
  },
  quizOptions: {
    gap: 12,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },

  // Table Row
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  // Dashboard
  dashboard: {
    padding: 20,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  dashboardSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },

  // Full Page
  fullPage: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  fullPageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  fullPageHeaderContent: {
    flex: 1,
    marginLeft: 12,
  },
  fullPageBody: {
    padding: 20,
  },
});

export default {
  Skeleton,
  ModuleCardSkeleton,
  LessonItemSkeleton,
  StatCardSkeleton,
  ProfileHeaderSkeleton,
  QuizQuestionSkeleton,
  TableRowSkeleton,
  ModuleListSkeleton,
  LessonListSkeleton,
  DashboardSkeleton,
  FullPageSkeleton,
};