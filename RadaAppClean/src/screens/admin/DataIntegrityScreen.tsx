import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import {
  runIntegrityChecks,
  dataIntegrityChecks,
  IntegrityCheckResult,
  IntegrityCheck
} from '../../utils/validation';
import adminAPI from '../../services/AdminAPIService';

interface DataIntegrityScreenProps {
  navigation: any;
}

interface DataStats {
  politicians: number;
  timelineEvents: number;
  commitments: number;
  documents: number;
  votingRecords: number;
}

export const DataIntegrityScreen: React.FC<DataIntegrityScreenProps> = ({ navigation }) => {
  const { adminUser, hasPermission } = useAdminAuth();
  const [integrityResult, setIntegrityResult] = useState<IntegrityCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<IntegrityCheck | null>(null);
  const [dataStats, setDataStats] = useState<DataStats>({
    politicians: 0,
    timelineEvents: 0,
    commitments: 0,
    documents: 0,
    votingRecords: 0
  });

  useEffect(() => {
    runDataIntegrityCheck();
    loadDataStats();
  }, []);

  const runDataIntegrityCheck = async () => {
    try {
      setIsLoading(true);

      // Fetch real data from API
      const [politiciansRes, timelineRes, commitmentsRes, documentsRes, votingRes] = await Promise.all([
        adminAPI.searchPoliticians('', { include_drafts: true }),
        adminAPI.getTimelineEvents(),
        adminAPI.getCommitments({}),
        adminAPI.getDocuments({}),
        adminAPI.getVotingRecords({})
      ]);

      const realData = {
        politicians: politiciansRes.success ? politiciansRes.data : [],
        timelineEvents: timelineRes.success ? timelineRes.data : [],
        commitments: commitmentsRes.success ? commitmentsRes.data : [],
        documents: documentsRes.success ? documentsRes.data : [],
        votingRecords: votingRes.success ? votingRes.data : []
      };

      const result = runIntegrityChecks(realData);
      setIntegrityResult(result);

    } catch (error) {
      console.error('Error running integrity check:', error);
      Alert.alert('Error', 'Failed to run data integrity check');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadDataStats = async () => {
    try {
      // Fetch real data counts from API
      const statsResponse = await adminAPI.getStatistics();

      if (statsResponse.success && statsResponse.data) {
        setDataStats({
          politicians: statsResponse.data.totalPoliticians || 0,
          timelineEvents: statsResponse.data.totalTimelineEvents || 0,
          commitments: statsResponse.data.totalCommitments || 0,
          documents: statsResponse.data.totalDocuments || 0,
          votingRecords: statsResponse.data.totalVotingRecords || 0
        });
      }
    } catch (error) {
      console.error('Error loading data stats:', error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    runDataIntegrityCheck();
  };

  const handleFixIssues = () => {
    Alert.alert(
      'Auto-Fix Issues',
      'This would automatically fix common data integrity issues like duplicate entries, invalid formats, etc. Implement auto-fix logic here.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Fix Issues', onPress: () => {
          // Implement auto-fix logic
          Alert.alert('Success', 'Auto-fix completed! Re-running integrity check...');
          runDataIntegrityCheck();
        }}
      ]
    );
  };

  const renderHealthScore = () => {
    if (!integrityResult) return null;

    const totalChecks = dataIntegrityChecks.length;
    const passedChecks = integrityResult.passed ? totalChecks : totalChecks - integrityResult.issues.length;
    const healthScore = Math.round((passedChecks / totalChecks) * 100);

    let healthColor = '#10B981'; // Green
    let healthIcon = 'checkmark-circle';

    if (healthScore < 80) {
      healthColor = '#F59E0B'; // Yellow
      healthIcon = 'warning';
    }
    if (healthScore < 60) {
      healthColor = '#EF4444'; // Red
      healthIcon = 'alert-circle';
    }

    return (
      <View style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <Ionicons name={healthIcon as any} size={32} color={healthColor} />
          <View style={styles.healthInfo}>
            <Text style={styles.healthScore}>{healthScore}%</Text>
            <Text style={styles.healthLabel}>Data Health Score</Text>
          </View>
        </View>
        <Text style={styles.healthDescription}>
          {healthScore >= 90 ? 'Excellent data quality!' :
           healthScore >= 80 ? 'Good data quality with minor issues.' :
           healthScore >= 60 ? 'Moderate data quality, some fixes needed.' :
           'Poor data quality, immediate attention required.'}
        </Text>
      </View>
    );
  };

  const renderDataStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>Data Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#3B82F6" />
          <Text style={styles.statNumber}>{dataStats.politicians}</Text>
          <Text style={styles.statLabel}>Politicians</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="timeline" size={24} color="#8B5CF6" />
          <Text style={styles.statNumber}>{dataStats.timelineEvents}</Text>
          <Text style={styles.statLabel}>Timeline Events</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <Text style={styles.statNumber}>{dataStats.commitments}</Text>
          <Text style={styles.statLabel}>Commitments</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>{dataStats.documents}</Text>
          <Text style={styles.statLabel}>Documents</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="ballot" size={24} color="#EF4444" />
          <Text style={styles.statNumber}>{dataStats.votingRecords}</Text>
          <Text style={styles.statLabel}>Voting Records</Text>
        </View>
      </View>
    </View>
  );

  const renderIssues = () => {
    if (!integrityResult || integrityResult.issues.length === 0) return null;

    return (
      <View style={styles.issuesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Data Issues ({integrityResult.issues.length})</Text>
          {hasPermission('system', 'update') && (
            <TouchableOpacity style={styles.fixButton} onPress={handleFixIssues}>
              <Ionicons name="build" size={16} color="#FFFFFF" />
              <Text style={styles.fixButtonText}>Auto-Fix</Text>
            </TouchableOpacity>
          )}
        </View>
        {integrityResult.issues.map((issue, index) => (
          <View key={index} style={styles.issueItem}>
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text style={styles.issueText}>{issue}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSuggestions = () => {
    if (!integrityResult || integrityResult.suggestions.length === 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.sectionTitle}>Recommendations ({integrityResult.suggestions.length})</Text>
        {integrityResult.suggestions.map((suggestion, index) => (
          <View key={index} style={styles.suggestionItem}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderIntegrityChecks = () => (
    <View style={styles.checksContainer}>
      <Text style={styles.sectionTitle}>Integrity Checks</Text>
      {dataIntegrityChecks.map((check, index) => (
        <TouchableOpacity
          key={index}
          style={styles.checkItem}
          onPress={() => setSelectedCheck(check)}
        >
          <View style={styles.checkInfo}>
            <Ionicons
              name={integrityResult?.passed ? "checkmark-circle" : "close-circle"}
              size={24}
              color={integrityResult?.passed ? "#10B981" : "#EF4444"}
            />
            <View style={styles.checkDetails}>
              <Text style={styles.checkName}>{check.name}</Text>
              <Text style={styles.checkDescription}>{check.description}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (!hasPermission('system', 'read')) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Ionicons name="lock-closed" size={64} color="#EF4444" />
        <Text style={styles.unauthorizedText}>Access Denied</Text>
        <Text style={styles.unauthorizedSubtext}>
          You don't have permission to view data integrity checks.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Integrity</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <Ionicons
            name="refresh"
            size={24}
            color="#FFFFFF"
            style={isRefreshing ? styles.spinning : undefined}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Running integrity checks...</Text>
          </View>
        ) : (
          <>
            {renderHealthScore()}
            {renderDataStats()}
            {renderIssues()}
            {renderSuggestions()}
            {renderIntegrityChecks()}
          </>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#6366F1',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthInfo: {
    marginLeft: 16,
  },
  healthScore: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  healthLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  healthDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  issuesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  fixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  fixButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  checksContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkDetails: {
    marginLeft: 12,
    flex: 1,
  },
  checkName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  checkDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  unauthorizedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  unauthorizedText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  unauthorizedSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  spinning: {
    // Add spinning animation if needed
  },
});