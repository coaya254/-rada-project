import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../services/api';

const TestScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAPI = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('Starting API tests...');
      
      // Test 1: Health check
      try {
        const healthResponse = await apiService.get('/api/health');
        addResult(`✅ Health check: ${JSON.stringify(healthResponse)}`);
      } catch (error) {
        addResult(`❌ Health check failed: ${error.message}`);
      }

      // Test 2: Learning modules
      try {
        const modulesResponse = await apiService.getLearningModules();
        addResult(`✅ Learning modules: ${modulesResponse?.length || 0} modules found`);
      } catch (error) {
        addResult(`❌ Learning modules failed: ${error.message}`);
      }

      // Test 3: Active polls
      try {
        const pollsResponse = await apiService.getActivePolls();
        addResult(`✅ Active polls: ${pollsResponse?.length || 0} polls found`);
      } catch (error) {
        addResult(`❌ Active polls failed: ${error.message}`);
      }

      // Test 4: Memory archive
      try {
        const memoryResponse = await apiService.getMemoryArchive(5);
        addResult(`✅ Memory archive: ${memoryResponse?.length || 0} items found`);
      } catch (error) {
        addResult(`❌ Memory archive failed: ${error.message}`);
      }

      addResult('🎉 API tests completed!');
      
    } catch (error) {
      addResult(`❌ Test suite failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAdminAPI = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('Starting Admin API tests...');
      
      // Test 1: Admin dashboard
      try {
        const dashboardResponse = await apiService.getAdminDashboard();
        addResult(`✅ Admin dashboard: ${JSON.stringify(dashboardResponse)}`);
      } catch (error) {
        addResult(`❌ Admin dashboard failed: ${error.message}`);
      }

      // Test 2: Moderation queue
      try {
        const moderationResponse = await apiService.getModerationQueue();
        addResult(`✅ Moderation queue: ${moderationResponse?.queue?.length || 0} items found`);
      } catch (error) {
        addResult(`❌ Moderation queue failed: ${error.message}`);
      }

      // Test 3: Trust leaderboard
      try {
        const trustResponse = await apiService.getTrustLeaderboard();
        addResult(`✅ Trust leaderboard: ${trustResponse?.length || 0} users found`);
      } catch (error) {
        addResult(`❌ Trust leaderboard failed: ${error.message}`);
      }

      addResult('🎉 Admin API tests completed!');
      
    } catch (error) {
      addResult(`❌ Admin test suite failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🧪 API Test Suite</Text>
        <Text style={styles.headerSubtitle}>Test mobile app backend integration</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.testButton, styles.primaryButton]}
            onPress={testAPI}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Testing...' : 'Test Public APIs'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.secondaryButton]}
            onPress={testAdminAPI}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Testing...' : 'Test Admin APIs'}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Running tests...</Text>
          </View>
        )}

        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))}
          {testResults.length === 0 && (
            <Text style={styles.noResultsText}>
              No tests run yet. Tap a button above to start testing.
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  testButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default TestScreen;
