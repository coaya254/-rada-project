import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ProgressBarAndroid,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PromiseTracker = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'active', label: 'Active', icon: '🔄' },
    { id: 'completed', label: 'Completed', icon: '✅' },
    { id: 'overdue', label: 'Overdue', icon: '⚠️' },
  ];

  const promises = [
    {
      id: 1,
      title: 'Free Laptops for Grade 1 Students',
      category: 'Education',
      status: 'active',
      progress: 65,
      deadline: '2024-12-31',
      daysLeft: 45,
      description: 'Government promise to provide free laptops to all Grade 1 students across Kenya.',
      evidence: 127,
      supporters: 2340,
      priority: 'high',
    },
    {
      id: 2,
      title: 'Nairobi Commuter Rail Upgrade',
      category: 'Infrastructure',
      status: 'active',
      progress: 30,
      deadline: '2024-08-15',
      daysLeft: 12,
      description: 'Modernization of Nairobi\'s commuter rail system with new trains and stations.',
      evidence: 89,
      supporters: 1567,
      priority: 'high',
    },
    {
      id: 3,
      title: 'Universal Healthcare Coverage',
      category: 'Health',
      status: 'overdue',
      progress: 15,
      deadline: '2024-06-30',
      daysLeft: -15,
      description: 'Implementation of universal healthcare coverage for all Kenyan citizens.',
      evidence: 45,
      supporters: 892,
      priority: 'critical',
    },
    {
      id: 4,
      title: 'Youth Employment Program',
      category: 'Employment',
      status: 'completed',
      progress: 100,
      deadline: '2024-03-31',
      daysLeft: 0,
      description: 'Creation of 100,000 jobs for young people through various government initiatives.',
      evidence: 234,
      supporters: 3456,
      priority: 'medium',
    },
    {
      id: 5,
      title: 'Clean Energy Transition',
      category: 'Environment',
      status: 'active',
      progress: 45,
      deadline: '2025-06-30',
      daysLeft: 200,
      description: 'Transition to 100% renewable energy sources by 2030.',
      evidence: 67,
      supporters: 1234,
      priority: 'medium',
    },
  ];

  const filteredPromises = selectedFilter === 'all' 
    ? promises 
    : promises.filter(promise => promise.status === selectedFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'overdue': return '#FF5722';
      default: return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#FF5722';
      case 'high': return '#FF9800';
      case 'medium': return '#FFC107';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 50) return '#FF9800';
    return '#FF5722';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📊 Promise Tracker</Text>
        <Text style={styles.headerSubtitle}>Hold government accountable</Text>
        
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{promises.length}</Text>
            <Text style={styles.statLabel}>Total Promises</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {promises.filter(p => p.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {promises.filter(p => p.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text style={[
              styles.filterLabel,
              selectedFilter === filter.id && styles.filterLabelActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Promises List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Summary */}
        <View style={styles.progressSummarySection}>
          <Text style={styles.sectionTitle}>📊 Progress Summary</Text>
          <View style={styles.progressSummaryGrid}>
            <View style={styles.progressSummaryCard}>
              <Text style={styles.progressSummaryIcon}>✅</Text>
              <Text style={styles.progressSummaryNumber}>12</Text>
              <Text style={styles.progressSummaryLabel}>Completed</Text>
            </View>
            <View style={styles.progressSummaryCard}>
              <Text style={styles.progressSummaryIcon}>🔄</Text>
              <Text style={styles.progressSummaryNumber}>8</Text>
              <Text style={styles.progressSummaryLabel}>In Progress</Text>
            </View>
            <View style={styles.progressSummaryCard}>
              <Text style={styles.progressSummaryIcon}>⏸️</Text>
              <Text style={styles.progressSummaryNumber}>5</Text>
              <Text style={styles.progressSummaryLabel}>Stalled</Text>
            </View>
            <View style={styles.progressSummaryCard}>
              <Text style={styles.progressSummaryIcon}>❌</Text>
              <Text style={styles.progressSummaryNumber}>3</Text>
              <Text style={styles.progressSummaryLabel}>Failed</Text>
            </View>
          </View>
        </View>

        {/* Filter Options */}
        {filteredPromises.map((promise) => (
          <TouchableOpacity key={promise.id} style={styles.promiseCard}>
            {/* Header */}
            <View style={styles.promiseHeader}>
              <View style={styles.promiseInfo}>
                <Text style={styles.promiseTitle}>{promise.title}</Text>
                <View style={styles.promiseMeta}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(promise.status) }]}>
                    <Text style={styles.statusText}>
                      {promise.status.charAt(0).toUpperCase() + promise.status.slice(1)}
                    </Text>
                  </View>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(promise.priority) }]}>
                    <Text style={styles.priorityText}>
                      {promise.priority.charAt(0).toUpperCase() + promise.priority.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{promise.category}</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.promiseDescription}>{promise.description}</Text>

            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercentage}>{promise.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${promise.progress}%`,
                      backgroundColor: getProgressColor(promise.progress)
                    }
                  ]} 
                />
              </View>
            </View>

            {/* Stats */}
            <View style={styles.promiseStats}>
              <View style={styles.stat}>
                <Text style={styles.statIcon}>📅</Text>
                <Text style={styles.statText}>
                  {promise.daysLeft > 0 ? `${promise.daysLeft} days left` : `${Math.abs(promise.daysLeft)} days overdue`}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statIcon}>📸</Text>
                <Text style={styles.statText}>{promise.evidence} evidence</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statText}>{promise.supporters} tracking</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                <Text style={styles.primaryButtonText}>Submit Evidence</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Empty State */}
        {filteredPromises.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No promises found</Text>
            <Text style={styles.emptySubtitle}>
              Try selecting a different filter or check back later for new promises.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.floatingAction}>
        <Text style={styles.floatingActionIcon}>📸</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  filterIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterLabelActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  promiseCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  promiseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  promiseInfo: {
    flex: 1,
  },
  promiseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  promiseMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  categoryBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  promiseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
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
    fontWeight: '700',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  promiseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  floatingAction: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: '#FFD700',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingActionIcon: {
    fontSize: 24,
  },
  progressSummarySection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  progressSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  progressSummaryCard: {
    alignItems: 'center',
    width: '45%', // Adjust as needed for 2 columns
    marginVertical: 10,
  },
  progressSummaryIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  progressSummaryNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  progressSummaryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default PromiseTracker;
