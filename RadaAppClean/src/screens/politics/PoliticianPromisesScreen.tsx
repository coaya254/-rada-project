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
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, LoadingSpinner, ErrorDisplay } from '../../components/ui';
import { Commitment } from '../../types';
import { colors, shadows } from '../../theme';
import ApiService from '../../services/api';

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
  const [filterStatus, setFilterStatus] = useState<'all' | 'no_evidence' | 'early_progress' | 'significant_progress' | 'completed' | 'stalled'>('all');
  const [selectedPromise, setSelectedPromise] = useState<Commitment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const fetchPromises = async (refresh = false) => {
    if (!refresh) setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getCommitments(politicianId);
      const promisesData = response.success ? response.data : response;
      setPromises(promisesData);
    } catch (err) {
      console.error('Error loading promises:', err);
      setError(err instanceof Error ? err.message : 'Failed to load promises');
      setPromises([]);
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
    // Reset collapsible states for new promise
    setShowSources(false);
    setShowVerification(false);
  };

  const getStatusColor = (status: Commitment['status']) => {
    switch (status) {
      case 'completed': return colors.success[500];
      case 'significant_progress': return colors.success[400];
      case 'early_progress': return colors.warning[500];
      case 'stalled': return colors.error[500];
      case 'no_evidence': return colors.neutral[400];
      default: return colors.neutral[400];
    }
  };

  const getStatusIcon = (status: Commitment['status']) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'significant_progress': return 'trending-up';
      case 'early_progress': return 'schedule';
      case 'stalled': return 'pause-circle-filled';
      case 'no_evidence': return 'help-outline';
      default: return 'help';
    }
  };

  const getStatusLabel = (status: Commitment['status']) => {
    switch (status) {
      case 'completed': return 'COMPLETED';
      case 'significant_progress': return 'MAJOR PROGRESS';
      case 'early_progress': return 'EARLY PROGRESS';
      case 'stalled': return 'STALLED';
      case 'no_evidence': return 'NO EVIDENCE';
      default: return 'UNKNOWN';
    }
  };

  const filteredPromises = promises.filter(promise => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'early_progress') {
      return promise.status === 'early_progress' || promise.status === 'significant_progress';
    }
    return promise.status === filterStatus;
  });

  const stats = {
    total: promises.length,
    completed: promises.filter(p => p.status === 'completed').length,
    inProgress: promises.filter(p => p.status === 'early_progress' || p.status === 'significant_progress').length,
    stalled: promises.filter(p => p.status === 'stalled').length,
    noEvidence: promises.filter(p => p.status === 'no_evidence').length,
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

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercentage}>{promise.progress_percentage}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${promise.progress_percentage}%`,
                backgroundColor: getStatusColor(promise.status),
              },
            ]}
          />
        </View>
        {promise.status === 'stalled' && promise.last_activity_date && (
          <Text style={styles.lastActivityText}>
            Last activity: {new Date(promise.last_activity_date).toLocaleDateString()}
          </Text>
        )}
      </View>

      <View style={styles.promiseFooter}>
        <View style={styles.dateRow}>
          <MaterialIcons name="event" size={16} color={colors.neutral[500]} />
          <Text style={styles.dateText}>
            Made: {new Date(promise.date_made).toLocaleDateString()}
          </Text>
        </View>
        {((promise.source_links && promise.source_links.length > 0) || promise.evidence) && (
          <View style={styles.actionButtons}>
            {promise.source_links && promise.source_links.length > 0 && (
              <TouchableOpacity
                style={styles.sourceButton}
                onPress={() => handlePromisePress(promise)}
              >
                <MaterialIcons name="link" size={16} color={colors.primary[500]} />
                <Text style={styles.sourceText}>Sources ({promise.source_links.length})</Text>
              </TouchableOpacity>
            )}
            {promise.evidence && (
              <TouchableOpacity
                style={styles.evidenceButton}
                onPress={() => handlePromisePress(promise)}
              >
                <MaterialIcons name="description" size={16} color={colors.success[500]} />
                <Text style={styles.evidenceText}>Evidence</Text>
              </TouchableOpacity>
            )}
          </View>
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
            style={[styles.statItem, filterStatus === 'completed' && styles.activeStatItem]}
            onPress={() => setFilterStatus('completed')}
          >
            <Text style={[styles.statNumber, filterStatus === 'completed' && styles.activeStatNumber]}>
              {stats.completed}
            </Text>
            <Text style={[styles.statLabel, filterStatus === 'completed' && styles.activeStatLabel]}>
              Done
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, (filterStatus === 'early_progress' || filterStatus === 'significant_progress') && styles.activeStatItem]}
            onPress={() => setFilterStatus('early_progress')}
          >
            <Text style={[styles.statNumber, (filterStatus === 'early_progress' || filterStatus === 'significant_progress') && styles.activeStatNumber]}>
              {stats.inProgress}
            </Text>
            <Text style={[styles.statLabel, (filterStatus === 'early_progress' || filterStatus === 'significant_progress') && styles.activeStatLabel]}>
              Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, filterStatus === 'no_evidence' && styles.activeStatItem]}
            onPress={() => setFilterStatus('no_evidence')}
          >
            <Text style={[styles.statNumber, filterStatus === 'no_evidence' && styles.activeStatNumber]}>
              {stats.noEvidence}
            </Text>
            <Text style={[styles.statLabel, filterStatus === 'no_evidence' && styles.activeStatLabel]}>
              No Evidence
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
                {/* 1. Promise Header */}
                <View style={styles.modalHeaderSection}>
                  <View style={styles.modalCategoryBadge}>
                    <Text style={styles.modalCategoryText}>{selectedPromise.category}</Text>
                  </View>
                  <View style={styles.modalDateContainer}>
                    <MaterialIcons name="event" size={14} color={colors.neutral[500]} />
                    <Text style={styles.modalHeaderDate}>
                      {new Date(selectedPromise.date_made).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {/* 2. Promise Content */}
                <Text style={styles.modalPromiseTitle}>{selectedPromise.promise}</Text>
                <Text style={styles.modalPromiseDescription}>{selectedPromise.description}</Text>

                {/* 3. Progress Summary (Most Important - Moved Up) */}
                <View style={styles.modalProgressSection}>
                  <Text style={styles.modalSectionTitle}>📊 Current Progress</Text>

                  {/* Progress Bar */}
                  <View style={styles.modalProgressBar}>
                    <View style={styles.modalProgressBarHeader}>
                      <Text style={styles.modalProgressLabel}>Evidence-Based Assessment</Text>
                      <Text style={styles.modalProgressPercentage}>{selectedPromise.progress_percentage}%</Text>
                    </View>
                    <View style={styles.modalProgressBarBackground}>
                      <View
                        style={[
                          styles.modalProgressBarFill,
                          {
                            width: `${selectedPromise.progress_percentage}%`,
                            backgroundColor: getStatusColor(selectedPromise.status),
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View style={styles.modalStatusContainer}>
                    <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedPromise.status) }]}>
                      <MaterialIcons
                        name={getStatusIcon(selectedPromise.status) as any}
                        size={16}
                        color="#FFFFFF"
                      />
                      <Text style={styles.modalStatusText}>{getStatusLabel(selectedPromise.status)}</Text>
                    </View>
                  </View>

                  {/* Status Explanation */}
                  <View style={styles.modalProgressInfo}>
                    <Text style={styles.modalProgressText}>
                      {selectedPromise.status === 'completed'
                        ? '✅ This promise has been fully completed with verified evidence.'
                        : selectedPromise.status === 'significant_progress'
                        ? '🔥 Major progress has been made toward fulfilling this promise.'
                        : selectedPromise.status === 'early_progress'
                        ? '🌱 Initial steps have been taken to fulfill this promise.'
                        : selectedPromise.status === 'stalled'
                        ? `⏸️ Progress appears to have stopped. Last verified activity: ${selectedPromise.last_activity_date ? new Date(selectedPromise.last_activity_date).toLocaleDateString() : 'Unknown'}.`
                        : '❓ No verifiable evidence of progress has been found for this promise.'
                      }
                    </Text>
                  </View>
                </View>

                {/* 4. Evidence Summary */}
                {selectedPromise.evidence && (
                  <View style={styles.modalEvidenceSection}>
                    <Text style={styles.modalSectionTitle}>📋 Evidence Summary</Text>
                    <Text style={styles.modalEvidenceText}>{selectedPromise.evidence}</Text>
                  </View>
                )}

                {/* 5. Source Links Section - Collapsible */}
                {selectedPromise.source_links && selectedPromise.source_links.length > 0 && (
                  <View style={styles.modalSourceSection}>
                    <TouchableOpacity
                      style={styles.collapsibleHeader}
                      onPress={() => setShowSources(!showSources)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalSectionTitle}>
                        🔗 Original Sources ({selectedPromise.source_links.length})
                      </Text>
                      <MaterialIcons
                        name={showSources ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                        size={24}
                        color={colors.primary[500]}
                      />
                    </TouchableOpacity>

                    {!showSources && (
                      <Text style={styles.collapsiblePreview}>
                        Tap to view where this promise was originally reported
                      </Text>
                    )}

                    {showSources && (
                      <>
                        <Text style={styles.modalSectionSubtitle}>
                          Where this promise was originally reported or documented:
                        </Text>
                        {selectedPromise.source_links.map((source, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.sourceLink}
                            onPress={() => Linking.openURL(source.url)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.sourceLinkHeader}>
                              <View style={styles.sourceTypeContainer}>
                                <MaterialIcons
                                  name={source.type === 'news' ? 'article' :
                                        source.type === 'speech' ? 'record-voice-over' :
                                        source.type === 'manifesto' ? 'description' :
                                        source.type === 'interview' ? 'mic' : 'folder'}
                                  size={16}
                                  color={colors.primary[500]}
                                />
                                <Text style={styles.sourceType}>{source.type.replace('_', ' ').toUpperCase()}</Text>
                              </View>
                              <MaterialIcons name="open-in-new" size={16} color={colors.neutral[400]} />
                            </View>
                            <Text style={styles.sourceLinkTitle}>{source.title}</Text>
                            <View style={styles.sourceLinkMeta}>
                              <Text style={styles.sourceLinkSource}>{source.source}</Text>
                              <Text style={styles.sourceLinkDate}>
                                {new Date(source.date).toLocaleDateString()}
                              </Text>
                            </View>

                            {/* Prominent "View Source" Button */}
                            <View style={styles.sourceButtonContainer}>
                              <View style={styles.modalSourceButton}>
                                <MaterialIcons name="open-in-new" size={14} color="#FFFFFF" />
                                <Text style={styles.modalSourceButtonText}>View Source</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </>
                    )}
                  </View>
                )}

                {/* 6. Verification Links Section - Collapsible */}
                {selectedPromise.verification_links && selectedPromise.verification_links.length > 0 && (
                  <View style={styles.modalVerificationSection}>
                    <TouchableOpacity
                      style={styles.collapsibleHeader}
                      onPress={() => setShowVerification(!showVerification)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalSectionTitle}>
                        ✅ Verification & Evidence ({selectedPromise.verification_links.length})
                      </Text>
                      <MaterialIcons
                        name={showVerification ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                        size={24}
                        color={colors.success[500]}
                      />
                    </TouchableOpacity>

                    {!showVerification && (
                      <Text style={styles.collapsiblePreview}>
                        Tap to view independent verification and evidence
                      </Text>
                    )}

                    {showVerification && (
                      <>
                        <Text style={styles.modalSectionSubtitle}>
                          Independent verification of progress, completion, or challenges:
                        </Text>
                        {selectedPromise.verification_links.map((verification, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.verificationLink}
                            onPress={() => Linking.openURL(verification.url)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.verificationLinkHeader}>
                              <View style={styles.verificationTypeContainer}>
                                <MaterialIcons
                                  name={verification.type === 'news' ? 'article' :
                                        verification.type === 'government_report' ? 'assessment' :
                                        verification.type === 'official_statement' ? 'announcement' :
                                        verification.type === 'project_completion' ? 'check-circle' : 'monetization-on'}
                                  size={16}
                                  color={getStatusColor(selectedPromise.status)}
                                />
                                <Text style={styles.verificationType}>
                                  {verification.type.replace('_', ' ').toUpperCase()}
                                </Text>
                              </View>
                              <MaterialIcons name="open-in-new" size={16} color={colors.neutral[400]} />
                            </View>
                            <Text style={styles.verificationLinkTitle}>{verification.title}</Text>
                            <Text style={styles.verificationSummary}>{verification.content_summary}</Text>
                            <View style={styles.verificationLinkMeta}>
                              <Text style={styles.verificationLinkSource}>{verification.source}</Text>
                              <Text style={styles.verificationLinkDate}>
                                {new Date(verification.date).toLocaleDateString()}
                              </Text>
                            </View>

                            {/* Prominent "View Evidence" Button */}
                            <View style={styles.verificationButtonContainer}>
                              <View style={styles.verificationButton}>
                                <MaterialIcons name="verified" size={14} color="#FFFFFF" />
                                <Text style={styles.verificationButtonText}>View Evidence</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </>
                    )}
                  </View>
                )}
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
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 2,
  },
  lastActivityText: {
    fontSize: 11,
    color: colors.error[600],
    fontStyle: 'italic',
    marginTop: 4,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[500],
  },
  evidenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.success[50],
  },
  evidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success[500],
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
  modalDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalHeaderDate: {
    fontSize: 11,
    color: colors.neutral[600],
    fontWeight: '500',
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
  modalProgressBar: {
    marginBottom: 16,
  },
  modalProgressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalProgressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  modalProgressPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalProgressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalProgressBarFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 3,
  },
  modalStatusContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Source Links Styles
  modalSourceSection: {
    marginBottom: 24,
  },
  modalSectionSubtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: 16,
    lineHeight: 20,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  collapsiblePreview: {
    fontSize: 13,
    color: colors.neutral[500],
    fontStyle: 'italic',
    marginBottom: 8,
  },
  sourceLink: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sourceLinkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceType: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary[500],
    letterSpacing: 0.5,
  },
  sourceLinkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    lineHeight: 20,
    marginBottom: 8,
  },
  sourceLinkMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceLinkSource: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[600],
  },
  sourceLinkDate: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  sourceButtonContainer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  modalSourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  modalSourceButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Verification Links Styles
  modalVerificationSection: {
    marginBottom: 24,
  },
  verificationLink: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderLeftWidth: 4,
    borderLeftColor: colors.success[500],
  },
  verificationLinkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verificationTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verificationType: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success[700],
    letterSpacing: 0.5,
  },
  verificationLinkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    lineHeight: 20,
    marginBottom: 8,
  },
  verificationSummary: {
    fontSize: 13,
    color: colors.success[800],
    lineHeight: 18,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  verificationLinkMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verificationLinkSource: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success[700],
  },
  verificationLinkDate: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  verificationButtonContainer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  verificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success[500],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  verificationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});