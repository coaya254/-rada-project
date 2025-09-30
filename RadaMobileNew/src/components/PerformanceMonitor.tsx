import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import performanceService from '../services/performanceService';

const { width } = Dimensions.get('window');

interface PerformanceMonitorProps {
  visible: boolean;
  onClose: () => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ visible, onClose }) => {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPerformanceData = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = performanceService.getPerformanceSummary();
      const recs = performanceService.getPerformanceRecommendations();
      
      setPerformanceData(data);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadPerformanceData();
      const interval = setInterval(loadPerformanceData, 2000);
      return () => clearInterval(interval);
    }
  }, [visible, loadPerformanceData]);

  const renderMetricCard = (title: string, value: any, unit: string = '', color: string = '#667eea') => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, { color }]}>
        {typeof value === 'number' ? value.toFixed(2) : value} {unit}
      </Text>
    </View>
  );

  const renderRecommendation = (rec: any, index: number) => (
    <View key={index} style={[styles.recommendationCard, { borderLeftColor: rec.priority === 'high' ? '#ef4444' : '#f59e0b' }]}>
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationType}>{rec.type.replace('_', ' ').toUpperCase()}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: rec.priority === 'high' ? '#ef4444' : '#f59e0b' }]}>
          <Text style={styles.priorityText}>{rec.priority.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.recommendationMessage}>{rec.message}</Text>
    </View>
  );

  const clearPerformanceData = () => {
    Alert.alert(
      'Clear Performance Data',
      'Are you sure you want to clear all performance metrics?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            performanceService.clearMetrics();
            loadPerformanceData();
          },
        },
      ]
    );
  };

  const exportPerformanceData = async () => {
    try {
      const data = await performanceService.exportPerformanceData();
      console.log('Performance data exported:', data);
      Alert.alert('Success', 'Performance data exported to console');
    } catch (error) {
      Alert.alert('Error', 'Failed to export performance data');
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="times" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Performance Monitor</Text>
          <TouchableOpacity onPress={loadPerformanceData} style={styles.refreshButton}>
            <Icon name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {performanceData && (
            <>
              {/* Overall Status */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overall Status</Text>
                <View style={styles.statusGrid}>
                  {renderMetricCard(
                    'Monitoring',
                    performanceData.isMonitoring ? 'Active' : 'Inactive',
                    '',
                    performanceData.isMonitoring ? '#10b981' : '#ef4444'
                  )}
                  {renderMetricCard(
                    'Frame Drops',
                    performanceData.issues,
                    '',
                    performanceData.issues > 10 ? '#ef4444' : '#10b981'
                  )}
                  {renderMetricCard(
                    'Memory Usage',
                    performanceData.memoryUsage[performanceData.memoryUsage.length - 1]?.estimated || 0,
                    'MB',
                    '#3b82f6'
                  )}
                </View>
              </View>

              {/* Performance Metrics */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance Metrics</Text>
                <View style={styles.metricsGrid}>
                  {Object.entries(performanceData.averages).map(([key, value]) => (
                    <View key={key} style={styles.metricItem}>
                      <Text style={styles.metricName}>{key.replace(/-/g, ' ')}</Text>
                      <Text style={styles.metricValue}>
                        {typeof value === 'number' ? `${value.toFixed(2)}ms` : value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Detailed Metrics */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detailed Metrics</Text>
                {Object.entries(performanceData.metrics).map(([key, metrics]) => (
                  <View key={key} style={styles.detailedMetricCard}>
                    <Text style={styles.detailedMetricTitle}>{key.replace(/-/g, ' ')}</Text>
                    <View style={styles.detailedMetricRow}>
                      <Text style={styles.detailedMetricLabel}>Count: {metrics.count}</Text>
                      <Text style={styles.detailedMetricLabel}>Latest: {metrics.latest}ms</Text>
                    </View>
                    <View style={styles.detailedMetricRow}>
                      <Text style={styles.detailedMetricLabel}>Min: {metrics.min}ms</Text>
                      <Text style={styles.detailedMetricLabel}>Max: {metrics.max}ms</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Performance Recommendations</Text>
                  {recommendations.map(renderRecommendation)}
                </View>
              )}

              {/* Actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.actionsGrid}>
                  <TouchableOpacity style={styles.actionButton} onPress={clearPerformanceData}>
                    <Icon name="trash" size={16} color="#ef4444" />
                    <Text style={styles.actionButtonText}>Clear Data</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={exportPerformanceData}>
                    <Icon name="download" size={16} color="#3b82f6" />
                    <Text style={styles.actionButtonText}>Export</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={loadPerformanceData}>
                    <Icon name="refresh" size={16} color="#10b981" />
                    <Text style={styles.actionButtonText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - 60) / 3,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  metricsGrid: {
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricName: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  detailedMetricCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailedMetricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  detailedMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailedMetricLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  recommendationMessage: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
});

export default PerformanceMonitor;

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import performanceService from '../services/performanceService';

const { width } = Dimensions.get('window');

interface PerformanceMonitorProps {
  visible: boolean;
  onClose: () => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ visible, onClose }) => {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPerformanceData = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = performanceService.getPerformanceSummary();
      const recs = performanceService.getPerformanceRecommendations();
      
      setPerformanceData(data);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadPerformanceData();
      const interval = setInterval(loadPerformanceData, 2000);
      return () => clearInterval(interval);
    }
  }, [visible, loadPerformanceData]);

  const renderMetricCard = (title: string, value: any, unit: string = '', color: string = '#667eea') => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, { color }]}>
        {typeof value === 'number' ? value.toFixed(2) : value} {unit}
      </Text>
    </View>
  );

  const renderRecommendation = (rec: any, index: number) => (
    <View key={index} style={[styles.recommendationCard, { borderLeftColor: rec.priority === 'high' ? '#ef4444' : '#f59e0b' }]}>
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationType}>{rec.type.replace('_', ' ').toUpperCase()}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: rec.priority === 'high' ? '#ef4444' : '#f59e0b' }]}>
          <Text style={styles.priorityText}>{rec.priority.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.recommendationMessage}>{rec.message}</Text>
    </View>
  );

  const clearPerformanceData = () => {
    Alert.alert(
      'Clear Performance Data',
      'Are you sure you want to clear all performance metrics?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            performanceService.clearMetrics();
            loadPerformanceData();
          },
        },
      ]
    );
  };

  const exportPerformanceData = async () => {
    try {
      const data = await performanceService.exportPerformanceData();
      console.log('Performance data exported:', data);
      Alert.alert('Success', 'Performance data exported to console');
    } catch (error) {
      Alert.alert('Error', 'Failed to export performance data');
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="times" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Performance Monitor</Text>
          <TouchableOpacity onPress={loadPerformanceData} style={styles.refreshButton}>
            <Icon name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {performanceData && (
            <>
              {/* Overall Status */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overall Status</Text>
                <View style={styles.statusGrid}>
                  {renderMetricCard(
                    'Monitoring',
                    performanceData.isMonitoring ? 'Active' : 'Inactive',
                    '',
                    performanceData.isMonitoring ? '#10b981' : '#ef4444'
                  )}
                  {renderMetricCard(
                    'Frame Drops',
                    performanceData.issues,
                    '',
                    performanceData.issues > 10 ? '#ef4444' : '#10b981'
                  )}
                  {renderMetricCard(
                    'Memory Usage',
                    performanceData.memoryUsage[performanceData.memoryUsage.length - 1]?.estimated || 0,
                    'MB',
                    '#3b82f6'
                  )}
                </View>
              </View>

              {/* Performance Metrics */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance Metrics</Text>
                <View style={styles.metricsGrid}>
                  {Object.entries(performanceData.averages).map(([key, value]) => (
                    <View key={key} style={styles.metricItem}>
                      <Text style={styles.metricName}>{key.replace(/-/g, ' ')}</Text>
                      <Text style={styles.metricValue}>
                        {typeof value === 'number' ? `${value.toFixed(2)}ms` : value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Detailed Metrics */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detailed Metrics</Text>
                {Object.entries(performanceData.metrics).map(([key, metrics]) => (
                  <View key={key} style={styles.detailedMetricCard}>
                    <Text style={styles.detailedMetricTitle}>{key.replace(/-/g, ' ')}</Text>
                    <View style={styles.detailedMetricRow}>
                      <Text style={styles.detailedMetricLabel}>Count: {metrics.count}</Text>
                      <Text style={styles.detailedMetricLabel}>Latest: {metrics.latest}ms</Text>
                    </View>
                    <View style={styles.detailedMetricRow}>
                      <Text style={styles.detailedMetricLabel}>Min: {metrics.min}ms</Text>
                      <Text style={styles.detailedMetricLabel}>Max: {metrics.max}ms</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Performance Recommendations</Text>
                  {recommendations.map(renderRecommendation)}
                </View>
              )}

              {/* Actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.actionsGrid}>
                  <TouchableOpacity style={styles.actionButton} onPress={clearPerformanceData}>
                    <Icon name="trash" size={16} color="#ef4444" />
                    <Text style={styles.actionButtonText}>Clear Data</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={exportPerformanceData}>
                    <Icon name="download" size={16} color="#3b82f6" />
                    <Text style={styles.actionButtonText}>Export</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={loadPerformanceData}>
                    <Icon name="refresh" size={16} color="#10b981" />
                    <Text style={styles.actionButtonText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - 60) / 3,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  metricsGrid: {
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricName: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  detailedMetricCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailedMetricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  detailedMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailedMetricLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  recommendationMessage: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
});

export default PerformanceMonitor;
