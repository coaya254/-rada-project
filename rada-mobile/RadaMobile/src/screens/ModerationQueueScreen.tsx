import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Switch,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../services/api';

const { width: screenWidth } = Dimensions.get('window');

interface ModerationQueueScreenProps {
  onClose: () => void;
}

interface ContentItem {
  id: string;
  title: string;
  content: string;
  status: string;
  priority: string;
  author: {
    nickname: string;
    trust_score: number;
  };
  created_at: string;
}

interface ModerationStats {
  pending: number;
  approved: number;
  rejected: number;
  escalated: number;
}

const ModerationQueueScreen: React.FC<ModerationQueueScreenProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [moderationQueue, setModerationQueue] = useState<ContentItem[]>([]);
  const [moderationStats, setModerationStats] = useState<ModerationStats | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);

  const filters = [
    { key: 'all', label: 'All', icon: '📋' },
    { key: 'pending', label: 'Pending', icon: '⏳' },
    { key: 'approved', label: 'Approved', icon: '✅' },
    { key: 'rejected', label: 'Rejected', icon: '❌' },
  ];

  const priorities = [
    { key: 'all', label: 'All', color: '#95A5A6' },
    { key: 'urgent', label: 'Urgent', color: '#FF4757' },
    { key: 'high', label: 'High', color: '#FF6B6B' },
    { key: 'normal', label: 'Normal', color: '#4ECDC4' },
    { key: 'low', label: 'Low', color: '#95A5A6' },
  ];

  const loadModerationData = async () => {
    try {
      setIsLoading(true);
      console.log('ModerationQueueScreen - Loading moderation data...');
      
      const [queueData, statsData] = await Promise.all([
        apiService.getModerationQueue(selectedFilter === 'all' ? 'pending' : selectedFilter, selectedPriority === 'all' ? null : selectedPriority),
        apiService.getModerationStats()
      ]);

      console.log('ModerationQueueScreen - API responses:', {
        queue: queueData,
        stats: statsData
      });

      setModerationQueue(queueData?.queue || []);
      setModerationStats(statsData || null);
    } catch (error) {
      console.error('Failed to load moderation data:', error);
      Alert.alert('Error', 'Failed to load moderation data. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadModerationData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadModerationData();
  }, [selectedFilter, selectedPriority]);

  const handleModerateContent = (content: ContentItem) => {
    setSelectedContent(content);
    setShowModerationModal(true);
  };

  const handleApproveContent = async () => {
    if (!selectedContent) return;
    
    try {
      await apiService.approveContent(selectedContent.id, reviewNotes);
      Alert.alert('Success', 'Content approved successfully!');
      setShowModerationModal(false);
      setSelectedContent(null);
    setReviewNotes('');
      loadModerationData(); // Refresh data
    } catch (error) {
      console.error('Error approving content:', error);
      Alert.alert('Error', 'Failed to approve content');
    }
  };

  const handleRejectContent = async () => {
    if (!selectedContent) return;
    
    Alert.alert(
      'Reject Content',
      'Are you sure you want to reject this content?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', onPress: async () => {
          try {
            await apiService.rejectContent(selectedContent.id, reviewNotes, 'Inappropriate content');
            Alert.alert('Success', 'Content rejected successfully!');
            setShowModerationModal(false);
            setSelectedContent(null);
            setReviewNotes('');
            loadModerationData(); // Refresh data
          } catch (error) {
            console.error('Error rejecting content:', error);
            Alert.alert('Error', 'Failed to reject content');
          }
        }}
      ]
    );
  };

  const handleEscalateContent = async () => {
    if (!selectedContent) return;
    
    try {
      await apiService.escalateContent(selectedContent.id, 'Escalated for admin review');
      Alert.alert('Success', 'Content escalated successfully!');
      setShowModerationModal(false);
      setSelectedContent(null);
      setReviewNotes('');
      loadModerationData(); // Refresh data
    } catch (error) {
      console.error('Error escalating content:', error);
      Alert.alert('Error', 'Failed to escalate content');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (bulkSelected.length === 0) {
      Alert.alert('No Selection', 'Please select content items first');
      return;
    }

    const actionText = action === 'approve' ? 'approve' : action === 'reject' ? 'reject' : 'escalate';
    
    Alert.alert(
      `Bulk ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      `Are you sure you want to ${actionText} ${bulkSelected.length} items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: actionText.charAt(0).toUpperCase() + actionText.slice(1), onPress: async () => {
          try {
            const promises = bulkSelected.map(id => {
              switch (action) {
        case 'approve':
                  return apiService.approveContent(id, 'Bulk approved');
        case 'reject':
                  return apiService.rejectContent(id, 'Bulk rejected', 'Bulk rejection');
                case 'escalate':
                  return apiService.escalateContent(id, 'Bulk escalated');
        default:
                  return Promise.resolve();
              }
            });
            
            await Promise.all(promises);
            Alert.alert('Success', `Bulk ${actionText} completed successfully!`);
            setBulkSelected([]);
            loadModerationData(); // Refresh data
    } catch (error) {
            console.error(`Error bulk ${actionText}:`, error);
            Alert.alert('Error', `Failed to ${actionText} content`);
          }
        }}
      ]
    );
  };

  const toggleBulkSelection = (contentId: string) => {
    setBulkSelected(prev => 
      prev.includes(contentId) 
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorities.find(p => p.key === priority);
    return priorityObj ? priorityObj.color : '#4ECDC4';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'escalated': return '🚨';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'escalated': return '#9C27B0';
      default: return '#95A5A6';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Moderation Queue...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>🛡️ Moderation Queue</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Stats */}
      {moderationStats && (
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{moderationStats.pending || 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
          </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{moderationStats.approved || 0}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{moderationStats.rejected || 0}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{moderationStats.escalated || 0}</Text>
              <Text style={styles.statLabel}>Escalated</Text>
            </View>
          </View>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.activeFilterButton
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={styles.filterIcon}>{filter.icon}</Text>
              <Text style={[
                styles.filterLabel,
                selectedFilter === filter.key && styles.activeFilterLabel
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Priority Filters */}
      <View style={styles.prioritySection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priorityScroll}>
          {priorities.map((priority) => (
            <TouchableOpacity
              key={priority.key}
              style={[
                styles.priorityButton,
                { borderColor: priority.color },
                selectedPriority === priority.key && { backgroundColor: priority.color }
              ]}
              onPress={() => setSelectedPriority(priority.key)}
            >
              <Text style={[
                styles.priorityLabel,
                selectedPriority === priority.key && styles.activePriorityLabel
              ]}>
                {priority.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bulk Actions */}
      {bulkSelected.length > 0 && (
        <View style={styles.bulkActionsSection}>
          <Text style={styles.bulkActionsTitle}>
            {bulkSelected.length} item{bulkSelected.length > 1 ? 's' : ''} selected
          </Text>
          <View style={styles.bulkActions}>
            <TouchableOpacity 
              style={[styles.bulkActionButton, styles.approveButton]}
              onPress={() => handleBulkAction('approve')}
            >
              <Text style={styles.bulkActionText}>Approve All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.bulkActionButton, styles.rejectButton]}
              onPress={() => handleBulkAction('reject')}
            >
              <Text style={styles.bulkActionText}>Reject All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.bulkActionButton, styles.escalateButton]}
              onPress={() => handleBulkAction('escalate')}
            >
              <Text style={styles.bulkActionText}>Escalate All</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content List */}
      <ScrollView
        style={styles.contentList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {moderationQueue.length > 0 ? (
          moderationQueue.map((content, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.contentItem,
                bulkSelected.includes(content.id) && styles.selectedContentItem
              ]}
              onPress={() => handleModerateContent(content)}
              onLongPress={() => toggleBulkSelection(content.id)}
            >
              <View style={styles.contentItemHeader}>
                <View style={styles.contentItemInfo}>
                  <Text style={styles.contentItemTitle} numberOfLines={1}>
                    {content.title || 'Untitled'}
                  </Text>
                  <View style={styles.contentItemMeta}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(content.status) }]}>
                      <Text style={styles.statusText}>
                        {getStatusIcon(content.status)} {content.status}
                      </Text>
          </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(content.priority) }]}>
                      <Text style={styles.priorityText}>{content.priority || 'Normal'}</Text>
                    </View>
                  </View>
                </View>
                {bulkSelected.includes(content.id) && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.contentItemText} numberOfLines={2}>
                {content.content || 'No content'}
              </Text>
              
              <View style={styles.contentItemFooter}>
                <View style={styles.contentItemAuthor}>
                  <Text style={styles.authorName}>
                    {content.author?.nickname || 'Anonymous'}
                  </Text>
                  <Text style={styles.authorTrust}>
                    Trust: {content.author?.trust_score || 1.0}⭐
                  </Text>
                </View>
                <Text style={styles.contentItemDate}>
                  {new Date(content.created_at).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateTitle}>No content found</Text>
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'all' ? 'No content in moderation queue' : `No ${selectedFilter} content found`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Moderation Modal */}
      <Modal
        visible={showModerationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModerationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Moderate Content</Text>
            {selectedContent && (
              <>
                <View style={styles.modalContentHeader}>
                  <Text style={styles.modalContentTitle}>{selectedContent.title}</Text>
                  <View style={styles.modalContentMeta}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedContent.status) }]}>
                      <Text style={styles.statusText}>
                        {getStatusIcon(selectedContent.status)} {selectedContent.status}
            </Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedContent.priority) }]}>
                      <Text style={styles.priorityText}>{selectedContent.priority || 'Normal'}</Text>
                    </View>
                  </View>
          </View>

                <Text style={styles.modalContentText}>{selectedContent.content}</Text>
                
                <View style={styles.modalContentAuthor}>
                  <Text style={styles.modalAuthorName}>
                    {selectedContent.author?.nickname || 'Anonymous'}
            </Text>
                  <Text style={styles.modalAuthorTrust}>
                    Trust Score: {selectedContent.author?.trust_score || 1.0}⭐
                  </Text>
                </View>

                <TextInput
                  style={styles.reviewNotesInput}
                  placeholder="Review notes (optional)"
                  value={reviewNotes}
                  onChangeText={setReviewNotes}
                  multiline
                />

            <View style={styles.modalActions}>
              <TouchableOpacity
                    style={[styles.modalButton, styles.escalateButton]}
                    onPress={handleEscalateContent}
              >
                    <Text style={styles.modalButtonText}>Escalate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                    style={[styles.modalButton, styles.rejectButton]}
                    onPress={handleRejectContent}
                  >
                    <Text style={styles.modalButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.approveButton]}
                    onPress={handleApproveContent}
                  >
                    <Text style={styles.modalButtonText}>Approve</Text>
              </TouchableOpacity>
            </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsSection: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  filtersSection: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filtersScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterButton: {
    backgroundColor: '#FF6B6B',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterLabel: {
    color: 'white',
    fontWeight: '600',
  },
  prioritySection: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  priorityScroll: {
    paddingHorizontal: 16,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  priorityLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activePriorityLabel: {
    color: 'white',
    fontWeight: '600',
  },
  bulkActionsSection: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  bulkActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  bulkActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bulkActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  bulkActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  contentList: {
    flex: 1,
    padding: 16,
  },
  contentItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedContentItem: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  contentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  contentItemInfo: {
    flex: 1,
  },
  contentItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contentItemMeta: {
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
    color: 'white',
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contentItemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  contentItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentItemAuthor: {
    flex: 1,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  authorTrust: {
    fontSize: 10,
    color: '#666',
  },
  contentItemDate: {
    fontSize: 10,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: screenWidth * 0.9,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalContentHeader: {
    marginBottom: 12,
  },
  modalContentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalContentMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  modalContentText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalContentAuthor: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modalAuthorTrust: {
    fontSize: 12,
    color: '#666',
  },
  reviewNotesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  escalateButton: {
    backgroundColor: '#9C27B0',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ModerationQueueScreen;