import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { PoliticsStackParamList } from '../../navigation/PoliticsStackNavigator';

interface PromiseTrackerScreenProps {
  navigation: NativeStackNavigationProp<PoliticsStackParamList, 'PromiseTracker'>;
  route: RouteProp<PoliticsStackParamList, 'PromiseTracker'>;
}

interface Promise {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'Fulfilled' | 'In Progress' | 'Broken' | 'Pending';
  progress: number;
  datePromised: string;
  deadline?: string;
  updates: Array<{
    date: string;
    description: string;
    type: 'positive' | 'negative' | 'neutral';
  }>;
}

export const PromiseTrackerScreen: React.FC<PromiseTrackerScreenProps> = ({ navigation, route }) => {
  const { politicianName } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [promises] = useState<Promise[]>([
    {
      id: 1,
      title: 'Improve Healthcare Access',
      description: 'Build 10 new community health centers across the constituency',
      category: 'Healthcare',
      status: 'In Progress',
      progress: 75,
      datePromised: '2022-08-15',
      deadline: '2024-12-31',
      updates: [
        {
          date: '2024-03-01',
          description: '7 out of 10 health centers completed and operational',
          type: 'positive',
        },
        {
          date: '2024-01-15',
          description: 'Construction delays on 2 centers due to funding issues',
          type: 'negative',
        },
      ],
    },
    {
      id: 2,
      title: 'Education Infrastructure',
      description: 'Renovate 50 primary schools and provide digital learning resources',
      category: 'Education',
      status: 'Fulfilled',
      progress: 100,
      datePromised: '2022-08-15',
      deadline: '2023-12-31',
      updates: [
        {
          date: '2023-12-20',
          description: 'All 50 schools renovated with digital learning labs installed',
          type: 'positive',
        },
      ],
    },
    {
      id: 3,
      title: 'Road Infrastructure',
      description: 'Construct 200km of tarmac roads connecting rural areas',
      category: 'Infrastructure',
      status: 'Broken',
      progress: 30,
      datePromised: '2022-08-15',
      deadline: '2024-06-30',
      updates: [
        {
          date: '2024-02-01',
          description: 'Project halted due to budget reallocation to other priorities',
          type: 'negative',
        },
        {
          date: '2023-06-01',
          description: 'Completed 60km of roads, facing funding challenges',
          type: 'neutral',
        },
      ],
    },
    {
      id: 4,
      title: 'Youth Employment Program',
      description: 'Create 5,000 job opportunities for young people through skills training',
      category: 'Employment',
      status: 'In Progress',
      progress: 60,
      datePromised: '2022-08-15',
      deadline: '2024-08-15',
      updates: [
        {
          date: '2024-03-10',
          description: '3,000 youths enrolled in various training programs',
          type: 'positive',
        },
      ],
    },
    {
      id: 5,
      title: 'Agricultural Support',
      description: 'Provide subsidized fertilizers and seeds to 10,000 farmers',
      category: 'Agriculture',
      status: 'Pending',
      progress: 0,
      datePromised: '2023-01-10',
      deadline: '2024-04-30',
      updates: [
        {
          date: '2024-01-05',
          description: 'Awaiting budget approval from national treasury',
          type: 'neutral',
        },
      ],
    },
  ]);

  const filters = [
    { id: 'all', label: 'All Promises' },
    { id: 'fulfilled', label: 'Fulfilled' },
    { id: 'in progress', label: 'In Progress' },
    { id: 'broken', label: 'Broken' },
    { id: 'pending', label: 'Pending' },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getFilteredPromises = () => {
    if (selectedFilter === 'all') return promises;
    return promises.filter(promise =>
      promise.status.toLowerCase() === selectedFilter
    );
  };

  const filteredPromises = getFilteredPromises();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fulfilled': return '#10B981';
      case 'In Progress': return '#3B82F6';
      case 'Broken': return '#EF4444';
      case 'Pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Fulfilled': return 'check-circle';
      case 'In Progress': return 'schedule';
      case 'Broken': return 'cancel';
      case 'Pending': return 'pending';
      default: return 'help';
    }
  };

  const promiseStats = {
    total: promises.length,
    fulfilled: promises.filter(p => p.status === 'Fulfilled').length,
    inProgress: promises.filter(p => p.status === 'In Progress').length,
    broken: promises.filter(p => p.status === 'Broken').length,
    pending: promises.filter(p => p.status === 'Pending').length,
  };

  const fulfillmentRate = Math.round((promiseStats.fulfilled / promiseStats.total) * 100);

  const renderPromise = ({ item }: { item: Promise }) => (
    <View style={styles.promiseCard}>
      <View style={styles.promiseHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <MaterialIcons
            name={getStatusIcon(item.status) as any}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.promiseDate}>
          {new Date(item.datePromised).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.promiseTitle}>{item.title}</Text>
      <Text style={styles.promiseDescription}>{item.description}</Text>

      {item.status !== 'Pending' && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercentage}>{item.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${item.progress}%`,
                  backgroundColor: getStatusColor(item.status),
                }
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.promiseFooter}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        {item.deadline && (
          <Text style={styles.deadline}>
            Deadline: {new Date(item.deadline).toLocaleDateString()}
          </Text>
        )}
      </View>

      {item.updates.length > 0 && (
        <View style={styles.latestUpdate}>
          <Text style={styles.updateLabel}>Latest Update:</Text>
          <Text style={styles.updateText}>{item.updates[0].description}</Text>
          <Text style={styles.updateDate}>{item.updates[0].date}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Promise Tracker</Text>
          <Text style={styles.headerSubtitle}>{politicianName}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.statsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.fulfillmentRate}>
              <Text style={styles.fulfillmentTitle}>Promise Fulfillment Rate</Text>
              <Text style={styles.fulfillmentPercentage}>{fulfillmentRate}%</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{promiseStats.total}</Text>
                <Text style={styles.statLabel}>TOTAL</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{promiseStats.fulfilled}</Text>
                <Text style={styles.statLabel}>FULFILLED</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{promiseStats.inProgress}</Text>
                <Text style={styles.statLabel}>IN PROGRESS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{promiseStats.broken}</Text>
                <Text style={styles.statLabel}>BROKEN</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                selectedFilter === filter.id && styles.activeFilterTab
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter.id && styles.activeFilterTabText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promises List */}
        <View style={styles.promisesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Campaign Promises</Text>
            <Text style={styles.promiseCount}>
              {filteredPromises.length} promises
            </Text>
          </View>
          <FlatList
            data={filteredPromises}
            renderItem={renderPromise}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
    margin: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGradient: {
    padding: 24,
  },
  fulfillmentRate: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fulfillmentTitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  fulfillmentPercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterContainer: {
    paddingBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  activeFilterTab: {
    backgroundColor: '#10B981',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  promisesSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  promiseCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  promiseCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  promiseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  promiseDate: {
    fontSize: 12,
    color: '#666',
  },
  promiseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  promiseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  promiseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  deadline: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  latestUpdate: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  updateLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  updateText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  updateDate: {
    fontSize: 12,
    color: '#666',
  },
});