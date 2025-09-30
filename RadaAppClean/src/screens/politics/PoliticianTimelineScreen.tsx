import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { TimelineItem, LoadingSpinner, ErrorDisplay } from '../../components/ui';
import { TimelineEvent } from '../../types';
import { colors, shadows } from '../../theme';

interface PoliticianTimelineScreenProps {
  politicianId: number;
  politicianName: string;
  onBack: () => void;
}

export const PoliticianTimelineScreen: React.FC<PoliticianTimelineScreenProps> = ({
  politicianId,
  politicianName,
  onBack,
}) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'position' | 'achievement' | 'controversy'>('all');

  const fetchTimeline = async (refresh = false) => {
    if (!refresh) setLoading(true);
    setError(null);

    try {
      // Mock timeline data - replace with actual API call when backend is ready
      const mockTimeline: TimelineEvent[] = [
        {
          id: 1,
          politician_id: politicianId,
          title: `${politicianName} Elected to Parliament`,
          description: 'Won constituency seat with 62% of the vote, defeating incumbent by significant margin. Campaign focused on healthcare, education, and infrastructure development.',
          date: '2022-08-09',
          type: 'position',
        },
        {
          id: 2,
          politician_id: politicianId,
          title: 'Healthcare Reform Achievement',
          description: 'Successfully passed landmark healthcare legislation that expanded coverage to 50,000 additional residents. Worked across party lines to secure bipartisan support.',
          date: '2024-01-20',
          type: 'achievement',
        },
        {
          id: 3,
          politician_id: politicianId,
          title: 'Appointed to Education Committee',
          description: 'Selected as chairperson of the Parliamentary Education Committee, overseeing education policy reform and budget allocation.',
          date: '2023-03-15',
          type: 'position',
        },
        {
          id: 4,
          politician_id: politicianId,
          title: 'Infrastructure Project Launch',
          description: 'Inaugurated the construction of 50km highway connecting rural communities to urban centers. Project expected to create 500 jobs and improve trade access.',
          date: '2023-09-10',
          type: 'achievement',
        },
        {
          id: 5,
          politician_id: politicianId,
          title: 'Budget Allocation Controversy',
          description: 'Faced criticism over constituency development fund allocation. Opposition questioned transparency in project selection process.',
          date: '2023-11-05',
          type: 'controversy',
        },
        {
          id: 6,
          politician_id: politicianId,
          title: 'Environmental Conservation Award',
          description: 'Received national recognition for leading reforestation initiative that planted over 100,000 trees and established 3 community forests.',
          date: '2024-02-14',
          type: 'achievement',
        },
        {
          id: 7,
          politician_id: politicianId,
          title: 'Deputy Minister of Education',
          description: 'Appointed as Deputy Minister of Education, bringing constituency experience to national education policy development.',
          date: '2024-05-01',
          type: 'position',
        },
        {
          id: 8,
          politician_id: politicianId,
          title: 'University Graduation',
          description: 'Graduated magna cum laude with Master of Public Administration from National University, specializing in development policy.',
          date: '2018-06-15',
          type: 'achievement',
        },
        {
          id: 9,
          politician_id: politicianId,
          title: 'Started Political Career',
          description: 'Began political career as county councilor, focusing on local development projects and community organizing.',
          date: '2019-01-10',
          type: 'position',
        },
      ];

      setTimeline(mockTimeline.sort((a: TimelineEvent, b: TimelineEvent) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [politicianId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTimeline(true);
  };

  const getEventTypeColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'position': return colors.primary[500];
      case 'achievement': return colors.success[500];
      case 'controversy': return colors.error[500];
      default: return colors.neutral[400];
    }
  };

  const getEventTypeIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'position': return 'business-center';
      case 'achievement': return 'emoji-events';
      case 'controversy': return 'warning';
      default: return 'event';
    }
  };

  const getEventTypeLabel = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'position': return 'POSITION';
      case 'achievement': return 'ACHIEVEMENT';
      case 'controversy': return 'CONTROVERSY';
      default: return 'EVENT';
    }
  };

  const filteredTimeline = timeline.filter(event =>
    filterType === 'all' || event.type === filterType
  );

  const stats = {
    total: timeline.length,
    positions: timeline.filter(e => e.type === 'position').length,
    achievements: timeline.filter(e => e.type === 'achievement').length,
    controversies: timeline.filter(e => e.type === 'controversy').length,
  };

  const renderTimelineEvent = (event: TimelineEvent, index: number) => (
    <TimelineItem
      key={event.id}
      title={event.title}
      description={event.description}
      date={event.date}
      type={event.type}
      isLast={index === filteredTimeline.length - 1}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#a18cd1', '#fbc2eb']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politicianName}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Career Timeline & Milestones</Text>
        </LinearGradient>
        <View style={styles.content}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#a18cd1', '#fbc2eb']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politicianName}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Career Timeline & Milestones</Text>
        </LinearGradient>
        <View style={styles.content}>
          <ErrorDisplay
            message={error}
            onRetry={() => fetchTimeline()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#a18cd1', '#fbc2eb']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{politicianName}</Text>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Career Timeline & Milestones</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
          contentContainerStyle={styles.statsContent}
        >
          <TouchableOpacity
            style={[styles.statItem, filterType === 'all' && styles.activeStatItem]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.statNumber, filterType === 'all' && styles.activeStatNumber]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, filterType === 'all' && styles.activeStatLabel]}>
              All Events
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, filterType === 'position' && styles.activeStatItem]}
            onPress={() => setFilterType('position')}
          >
            <Text style={[styles.statNumber, filterType === 'position' && styles.activeStatNumber]}>
              {stats.positions}
            </Text>
            <Text style={[styles.statLabel, filterType === 'position' && styles.activeStatLabel]}>
              Positions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, filterType === 'achievement' && styles.activeStatItem]}
            onPress={() => setFilterType('achievement')}
          >
            <Text style={[styles.statNumber, filterType === 'achievement' && styles.activeStatNumber]}>
              {stats.achievements}
            </Text>
            <Text style={[styles.statLabel, filterType === 'achievement' && styles.activeStatLabel]}>
              Achievements
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, filterType === 'controversy' && styles.activeStatItem]}
            onPress={() => setFilterType('controversy')}
          >
            <Text style={[styles.statNumber, filterType === 'controversy' && styles.activeStatNumber]}>
              {stats.controversies}
            </Text>
            <Text style={[styles.statLabel, filterType === 'controversy' && styles.activeStatLabel]}>
              Controversies
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredTimeline.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="timeline" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No Timeline Events Found</Text>
            <Text style={styles.emptySubtitle}>
              {filterType === 'all'
                ? `No recorded timeline events for ${politicianName}.`
                : `No ${filterType} events found.`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            <View style={styles.timelineHeader}>
              <MaterialIcons name="timeline" size={24} color={colors.primary[500]} />
              <Text style={styles.timelineTitle}>Career Journey</Text>
            </View>
            <View style={styles.timelineList}>
              {filteredTimeline.map(renderTimelineEvent)}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    maxHeight: 80,
  },
  statsContent: {
    paddingHorizontal: 10,
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 80,
  },
  activeStatItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeStatNumber: {
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
    textAlign: 'center',
  },
  activeStatLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  timelineContainer: {
    paddingBottom: 40,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  timelineList: {
    paddingLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[700],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },
});