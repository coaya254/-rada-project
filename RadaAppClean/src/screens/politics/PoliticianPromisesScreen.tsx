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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, LoadingSpinner, ErrorDisplay } from '../../components/ui';
import { Commitment } from '../../types';
import { colors, shadows } from '../../theme';

interface PoliticianPromisesScreenProps {
  politicianId: number;
  politicianName: string;
  onBack: () => void;
}

export const PoliticianPromisesScreen: React.FC<PoliticianPromisesScreenProps> = ({
  politicianId,
  politicianName,
  onBack,
}) => {
  const [promises, setPromises] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'kept' | 'broken' | 'in_progress'>('all');
  const [selectedPromise, setSelectedPromise] = useState<Commitment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchPromises = async (refresh = false) => {
    if (!refresh) setLoading(true);
    setError(null);

    try {
      // Mock promises data - replace with actual API call when backend is ready
      const mockPromises: Commitment[] = [
        {
          id: 1,
          politician_id: politicianId,
          promise: `${politicianName} pledged to improve healthcare access`,
          description: 'Committed to building 5 new health centers in rural areas and increasing medical staff by 30% within 2 years.',
          category: 'Healthcare',
          date_made: '2023-01-15',
          status: 'in_progress',
          evidence: 'Construction has begun on 2 health centers, and 15 new medical staff have been hired.',
        },
        {
          id: 2,
          politician_id: politicianId,
          promise: `Education reform initiative by ${politicianName}`,
          description: 'Promised to digitize all primary schools and provide tablets to students in the constituency.',
          category: 'Education',
          date_made: '2022-10-20',
          status: 'kept',
          evidence: 'All 12 primary schools now have digital infrastructure and 2,500 tablets distributed.',
        },
        {
          id: 3,
          politician_id: politicianId,
          promise: `Infrastructure development commitment`,
          description: 'Vowed to construct 50km of tarmac roads and improve water supply to 80% of households.',
          category: 'Infrastructure',
          date_made: '2023-03-10',
          status: 'in_progress',
          evidence: '25km of roads completed, water supply expanded to 45% of households.',
        },
        {
          id: 4,
          politician_id: politicianId,
          promise: `Youth empowerment program by ${politicianName}`,
          description: 'Committed to creating 1,000 jobs for youth through skill development and entrepreneurship programs.',
          category: 'Employment',
          date_made: '2022-08-05',
          status: 'broken',
          evidence: 'Only 200 jobs created so far, program faced budget constraints.',
        },
        {
          id: 5,
          politician_id: politicianId,
          promise: `Environmental conservation initiative`,
          description: 'Promised to plant 100,000 trees and establish 3 community forests within the constituency.',
          category: 'Environment',
          date_made: '2023-06-01',
          status: 'kept',
          evidence: '105,000 trees planted and all 3 community forests established ahead of schedule.',
        },
      ];

      setPromises(mockPromises);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promises');
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPromises();
  }, [politicianId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPromises(true);
  };

  const handlePromisePress = (promise: Commitment) => {
    setSelectedPromise(promise);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: Commitment['status']) => {
    switch (status) {
      case 'kept': return colors.success[500];
      case 'broken': return colors.error[500];
      case 'in_progress': return colors.warning[500];
      default: return colors.neutral[400];
    }
  };

  const getStatusIcon = (status: Commitment['status']) => {
    switch (status) {
      case 'kept': return 'check-circle';
      case 'broken': return 'cancel';
      case 'in_progress': return 'schedule';
      default: return 'help';
    }
  };

  const getStatusLabel = (status: Commitment['status']) => {
    switch (status) {
      case 'kept': return 'KEPT';
      case 'broken': return 'BROKEN';
      case 'in_progress': return 'IN PROGRESS';
      default: return 'UNKNOWN';
    }
  };

  const filteredPromises = promises.filter(promise =>
    filterStatus === 'all' || promise.status === filterStatus
  );

  const stats = {
    total: promises.length,
    kept: promises.filter(p => p.status === 'kept').length,
    broken: promises.filter(p => p.status === 'broken').length,
    inProgress: promises.filter(p => p.status === 'in_progress').length,
  };

  const renderPromiseCard = (promise: Commitment) => (
    <TouchableOpacity
      key={promise.id}
      onPress={() => handlePromisePress(promise)}
      activeOpacity={0.7}
    >
      <Card variant="elevated" style={styles.promiseCard}>
      <View style={styles.promiseHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{promise.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(promise.status) }]}>
          <MaterialIcons
            name={getStatusIcon(promise.status) as any}
            size={14}
            color="#FFFFFF"
          />
          <Text style={styles.statusText}>{getStatusLabel(promise.status)}</Text>
        </View>
      </View>

      <Text style={styles.promiseTitle} numberOfLines={2}>
        {promise.promise}
      </Text>

      <Text style={styles.promiseDescription} numberOfLines={3}>
        {promise.description}
      </Text>

      <View style={styles.promiseFooter}>
        <View style={styles.dateRow}>
          <MaterialIcons name="event" size={16} color={colors.neutral[500]} />
          <Text style={styles.dateText}>
            Made: {new Date(promise.date_made).toLocaleDateString()}
          </Text>
        </View>
        {promise.evidence && (
          <TouchableOpacity style={styles.evidenceButton}>
            <MaterialIcons name="description" size={16} color={colors.primary[500]} />
            <Text style={styles.evidenceText}>Evidence</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#f093fb', '#f5576c']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politicianName}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Campaign Promises & Commitments</Text>
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
          colors={['#f093fb', '#f5576c']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politicianName}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Campaign Promises & Commitments</Text>
        </LinearGradient>
        <View style={styles.content}>
          <ErrorDisplay
            message={error}
            onRetry={() => fetchPromises()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#f093fb', '#f5576c']}
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
        <Text style={styles.headerSubtitle}>Campaign Promises & Commitments</Text>
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statItem, filterStatus === 'all' && styles.activeStatItem]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.statNumber, filterStatus === 'all' && styles.activeStatNumber]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, filterStatus === 'all' && styles.activeStatLabel]}>
              Total
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, filterStatus === 'kept' && styles.activeStatItem]}
            onPress={() => setFilterStatus('kept')}
          >
            <Text style={[styles.statNumber, filterStatus === 'kept' && styles.activeStatNumber]}>
              {stats.kept}
            </Text>
            <Text style={[styles.statLabel, filterStatus === 'kept' && styles.activeStatLabel]}>
              Kept
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, filterStatus === 'in_progress' && styles.activeStatItem]}
            onPress={() => setFilterStatus('in_progress')}
          >
            <Text style={[styles.statNumber, filterStatus === 'in_progress' && styles.activeStatNumber]}>
              {stats.inProgress}
            </Text>
            <Text style={[styles.statLabel, filterStatus === 'in_progress' && styles.activeStatLabel]}>
              Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, filterStatus === 'broken' && styles.activeStatItem]}
            onPress={() => setFilterStatus('broken')}
          >
            <Text style={[styles.statNumber, filterStatus === 'broken' && styles.activeStatNumber]}>
              {stats.broken}
            </Text>
            <Text style={[styles.statLabel, filterStatus === 'broken' && styles.activeStatLabel]}>
              Broken
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredPromises.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="assignment" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No Promises Found</Text>
            <Text style={styles.emptySubtitle}>
              {filterStatus === 'all'
                ? `No recorded promises for ${politicianName}.`
                : `No ${filterStatus.replace('_', ' ')} promises found.`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.promisesGrid}>
            {filteredPromises.map(renderPromiseCard)}
          </View>
        )}
      </ScrollView>

      {/* Promise Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDetailModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Promise Details</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedPromise && (
              <>
                <View style={styles.modalHeaderSection}>
                  <View style={styles.modalCategoryBadge}>
                    <Text style={styles.modalCategoryText}>{selectedPromise.category}</Text>
                  </View>
                  <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedPromise.status) }]}>
                    <MaterialIcons
                      name={getStatusIcon(selectedPromise.status) as any}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.modalStatusText}>{getStatusLabel(selectedPromise.status)}</Text>
                  </View>
                </View>

                <Text style={styles.modalPromiseTitle}>{selectedPromise.promise}</Text>

                <Text style={styles.modalPromiseDescription}>{selectedPromise.description}</Text>

                <View style={styles.modalDateSection}>
                  <Text style={styles.modalSectionTitle}>Date Made</Text>
                  <View style={styles.modalDateRow}>
                    <MaterialIcons name="event" size={16} color={colors.neutral[500]} />
                    <Text style={styles.modalDateText}>
                      {new Date(selectedPromise.date_made).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {selectedPromise.evidence && (
                  <View style={styles.modalEvidenceSection}>
                    <Text style={styles.modalSectionTitle}>Evidence</Text>
                    <Text style={styles.modalEvidenceText}>{selectedPromise.evidence}</Text>
                  </View>
                )}

                <View style={styles.modalProgressSection}>
                  <Text style={styles.modalSectionTitle}>Status Information</Text>
                  <View style={styles.modalProgressInfo}>
                    <Text style={styles.modalProgressText}>
                      This promise is currently marked as <Text style={{ fontWeight: 'bold', color: getStatusColor(selectedPromise.status) }}>
                        {getStatusLabel(selectedPromise.status).toLowerCase()}
                      </Text>.
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeStatItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeStatNumber: {
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  activeStatLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  promisesGrid: {
    paddingBottom: 40,
  },
  promiseCard: {
    marginBottom: 16,
    padding: 16,
  },
  promiseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promiseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    lineHeight: 22,
    marginBottom: 8,
  },
  promiseDescription: {
    fontSize: 14,
    color: colors.neutral[600],
    lineHeight: 20,
    marginBottom: 16,
  },
  promiseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  evidenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
  },
  evidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[500],
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

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalCategoryBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalCategoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  modalPromiseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 16,
  },
  modalPromiseDescription: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalDateSection: {
    marginBottom: 24,
  },
  modalDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalDateText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  modalEvidenceSection: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    marginBottom: 24,
  },
  modalEvidenceText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  modalProgressSection: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalProgressInfo: {
    marginTop: 8,
  },
  modalProgressText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});