import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import performanceService from '../services/performanceService';

interface PerformanceMonitorProps {
  visible: boolean;
  onClose: () => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ visible, onClose }) => {
  const [metrics, setMetrics] = useState(performanceService.getRealTimeMetrics());
  const [report, setReport] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(performanceService.isMonitoring);

  // Update metrics every second
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setMetrics(performanceService.getRealTimeMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  const handleStartMonitoring = useCallback(() => {
    performanceService.startMonitoring();
    setIsMonitoring(true);
    setMetrics(performanceService.getRealTimeMetrics());
  }, []);

  const handleStopMonitoring = useCallback(() => {
    const performanceReport = performanceService.stopMonitoring();
    setReport(performanceReport);
    setIsMonitoring(false);
  }, []);

  const handleClearMetrics = useCallback(() => {
    performanceService.clearMetrics();
    setMetrics(performanceService.getRealTimeMetrics());
    setReport(null);
  }, []);

  const handleExportReport = useCallback(() => {
    if (!report) {
      Alert.alert('No Report', 'Please stop monitoring first to generate a report.');
      return;
    }

    const reportText = JSON.stringify(report, null, 2);
    // In a real app, you would implement actual export functionality
    Alert.alert('Report Generated', 'Performance report has been generated and saved.');
    console.log('Performance Report:', reportText);
  }, [report]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return '#4CAF50';
    if (value <= thresholds.warning) return '#FF9800';
    return '#F44336';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Performance Monitor</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Control Buttons */}
          <View style={styles.controlSection}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, isMonitoring ? styles.stopButton : styles.startButton]}
                onPress={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
              >
                <Text style={styles.buttonText}>
                  {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={handleClearMetrics}
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {report && (
              <TouchableOpacity
                style={[styles.button, styles.exportButton]}
                onPress={handleExportReport}
              >
                <Text style={styles.buttonText}>Export Report</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Real-time Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Real-time Metrics</Text>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Status</Text>
              <Text style={[styles.metricValue, { color: isMonitoring ? '#4CAF50' : '#F44336' }]}>
                {isMonitoring ? 'Monitoring' : 'Stopped'}
              </Text>
            </View>

            {metrics.currentMemory && (
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Memory Usage</Text>
                <Text style={styles.metricValue}>
                  {metrics.currentMemory.used}MB / {metrics.currentMemory.limit}MB
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${(metrics.currentMemory.used / metrics.currentMemory.limit) * 100}%`,
                        backgroundColor: getStatusColor(
                          (metrics.currentMemory.used / metrics.currentMemory.limit) * 100,
                          { good: 50, warning: 80 }
                        )
                      }
                    ]} 
                  />
                </View>
              </View>
            )}

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Render Operations</Text>
              <Text style={styles.metricValue}>{metrics.totalMetrics.renderTimes}</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Network Requests</Text>
              <Text style={styles.metricValue}>{metrics.totalMetrics.networkRequests}</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>User Interactions</Text>
              <Text style={styles.metricValue}>{metrics.totalMetrics.userInteractions}</Text>
            </View>
          </View>

          {/* Performance Report */}
          {report && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance Report</Text>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Average Render Time</Text>
                <Text style={[styles.metricValue, { 
                  color: getStatusColor(report.summary.avgRenderTime, { good: 16, warning: 32 })
                }]}>
                  {report.summary.avgRenderTime}ms
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Average Memory Usage</Text>
                <Text style={styles.metricValue}>{report.summary.avgMemoryUsage}MB</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Total Network Requests</Text>
                <Text style={styles.metricValue}>{report.summary.totalNetworkRequests}</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Monitoring Duration</Text>
                <Text style={styles.metricValue}>
                  {Math.round(report.summary.monitoringDuration / 1000)}s
                </Text>
              </View>

              {/* Recommendations */}
              {report.recommendations && report.recommendations.length > 0 && (
                <View style={styles.recommendationsSection}>
                  <Text style={styles.sectionTitle}>Recommendations</Text>
                  {report.recommendations.map((rec, index) => (
                    <View key={index} style={[styles.recommendationCard, { 
                      borderLeftColor: rec.type === 'critical' ? '#F44336' : 
                                     rec.type === 'warning' ? '#FF9800' : '#2196F3'
                    }]}>
                      <Text style={styles.recommendationText}>{rec.message}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  controlSection: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  clearButton: {
    backgroundColor: '#FF9800',
  },
  exportButton: {
    backgroundColor: '#2196F3',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  metricCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  recommendationsSection: {
    marginTop: 20,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default PerformanceMonitor;
