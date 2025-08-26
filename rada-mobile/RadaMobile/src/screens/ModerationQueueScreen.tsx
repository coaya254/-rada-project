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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const ModerationQueueScreen = ({ onClose }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [moderationStats, setModerationStats] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const statusColors = {
    draft: '#6c757d',
    review: '#ffc107',
    approved: '#28a745',
    published: '#007bff'
  };

  const statusLabels = {
    draft: 'Draft',
    review: 'Under Review',
    approved: 'Approved',
    published: 'Published'
  };

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    try {
      setIsLoading(true);
      const [queueResponse, statsResponse] = await Promise.all([
        apiService.getModerationQueue('review'),
        apiService.getModerationStats()
      ]);

      setModerationQueue(queueResponse.queue || []);
      setModerationStats(statsResponse.stats);
    } catch (error) {
      console.error('Failed to load moderation data:', error);
      Alert.alert('Error', 'Failed to load moderation data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadModerationData();
    setRefreshing(false);
  };

  const handleAction = (item, type) => {
    setSelectedItem(item);
    setActionType(type);
    setReviewNotes('');
    setActionModalVisible(true);
  };

  const processAction = async () => {
    if (!selectedItem || !actionType) return;

    setIsProcessing(true);
    try {
      let response;
      const contentType = selectedItem.content_type;

      switch (actionType) {
        case 'approve':
          response = await apiService.approveContent(contentType, selectedItem.id, reviewNotes);
          break;
        case 'reject':
          response = await apiService.rejectContent(contentType, selectedItem.id, reviewNotes);
          break;
        case 'publish':
          response = await apiService.publishContent(contentType, selectedItem.id);
          break;
        default:
          throw new Error('Invalid action type');
      }

      if (response.success) {
        Alert.alert('Success', response.message);
        setActionModalVisible(false);
        await loadModerationData();
      } else {
        Alert.alert('Error', response.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error processing action:', error);
      Alert.alert('Error', 'Failed to process action');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContentItem = (item, index) => (
    <View key={`${item.content_type}-${item.id}`} style={styles.contentCard}>
      <View style={styles.contentHeader}>
        <View style={styles.contentInfo}>
          <Text style={styles.contentType}>{item.content_type.toUpperCase()}</Text>
          <Text style={styles.contentTitle}>{item.title || 'Untitled'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
        </View>
      </View>
      
      <Text style={styles.contentDescription}>
        {item.description || 'No description available'}
      </Text>
      
      <View style={styles.contentMeta}>
        {item.submitted_for_review_at && (
          <Text style={styles.metaText}>
            Submitted: {new Date(item.submitted_for_review_at).toLocaleDateString()}
          </Text>
        )}
        {item.review_notes && (
          <Text style={styles.metaText}>
            Notes: {item.review_notes}
          </Text>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleAction(item, 'approve')}
        >
          <Text style={styles.actionButtonText}>✅ Approve</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleAction(item, 'reject')}
        >
          <Text style={styles.actionButtonText}>❌ Reject</Text>
        </TouchableOpacity>
        
        {item.status === 'approved' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.publishButton]}
            onPress={() => handleAction(item, 'publish')}
          >
            <Text style={styles.actionButtonText}>🚀 Publish</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Moderation Queue</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Statistics */}
      {moderationStats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{moderationStats.modules?.draft || 0}</Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{moderationStats.modules?.review || 0}</Text>
            <Text style={styles.statLabel}>Under Review</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{moderationStats.modules?.approved || 0}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{moderationStats.modules?.published || 0}</Text>
            <Text style={styles.statLabel}>Published</Text>
          </View>
        </View>
      )}

      {/* Content List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {moderationQueue.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>✅</Text>
            <Text style={styles.emptyStateText}>No content pending review</Text>
            <Text style={styles.emptyStateSubtext}>All content has been reviewed and processed</Text>
          </View>
        ) : (
          moderationQueue.map((item, index) => renderContentItem(item, index))
        )}
      </ScrollView>

      {/* Action Modal */}
      <Modal
        visible={actionModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {actionType === 'approve' ? 'Approve Content' :
               actionType === 'reject' ? 'Reject Content' :
               actionType === 'publish' ? 'Publish Content' : 'Action'}
            </Text>
            <TouchableOpacity
              onPress={() => setActionModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              {selectedItem?.title || 'Untitled'} ({selectedItem?.content_type})
            </Text>

            {(actionType === 'approve' || actionType === 'reject') && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Review Notes (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={reviewNotes}
                  onChangeText={setReviewNotes}
                  placeholder="Add notes about your decision..."
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setActionModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  actionType === 'approve' ? styles.approveButton :
                  actionType === 'reject' ? styles.rejectButton :
                  styles.publishButton
                ]}
                onPress={processAction}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>
                    {actionType === 'approve' ? 'Approve' :
                     actionType === 'reject' ? 'Reject' :
                     actionType === 'publish' ? 'Publish' : 'Confirm'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'column',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 4,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  contentDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
    lineHeight: 20,
  },
  contentMeta: {
    marginBottom: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  publishButton: {
    backgroundColor: '#007bff',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6c757d',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ModerationQueueScreen;
