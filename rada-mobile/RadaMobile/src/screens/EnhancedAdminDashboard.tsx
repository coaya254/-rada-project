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
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const { width: screenWidth } = Dimensions.get('window');

const EnhancedAdminDashboard = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [moderationStats, setModerationStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [trustLeaderboard, setTrustLeaderboard] = useState([]);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const tabs = [
    { key: 'overview', label: 'Dashboard', icon: '📊' },
    { key: 'moderation', label: 'Moderation', icon: '🛡️' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'content', label: 'Content', icon: '📝' },
    { key: 'analytics', label: 'Analytics', icon: '📈' },
    { key: 'trust', label: 'Trust', icon: '⭐' },
  ];

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('EnhancedAdminDashboard - Loading dashboard data...');
      
      const [dashboardData, moderationData, moderationStatsData, usersData, trustData] = await Promise.all([
        apiService.getAdminDashboard(),
        apiService.getModerationQueue('pending'),
        apiService.getModerationStats(),
        apiService.getUsers(1, 20),
        apiService.getTrustLeaderboard()
      ]);

      console.log('EnhancedAdminDashboard - API responses:', {
        dashboard: dashboardData,
        moderation: moderationData,
        stats: moderationStatsData,
        users: usersData,
        trust: trustData
      });

      setDashboardData(dashboardData || null);
      setModerationQueue(moderationData?.queue || []);
      setModerationStats(moderationStatsData || null);
      setUsers(usersData?.users || []);
      setTrustLeaderboard(trustData || []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      Alert.alert('Error', 'Failed to load admin data. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => {
          try {
            await apiService.adminLogout();
          } catch (error) {
            console.error('Logout error:', error);
          }
          logout();
          onClose();
        }}
      ]
    );
  };

  const handleModerateContent = (content) => {
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
      loadDashboardData(); // Refresh data
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
            loadDashboardData(); // Refresh data
          } catch (error) {
            console.error('Error rejecting content:', error);
            Alert.alert('Error', 'Failed to reject content');
          }
        }}
      ]
    );
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Stats Cards */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>📊 Platform Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboardData?.totalUsers || 0}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboardData?.activeUsers || 0}</Text>
            <Text style={styles.statLabel}>Active Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboardData?.totalPosts || 0}</Text>
            <Text style={styles.statLabel}>Total Posts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboardData?.pendingModeration || 0}</Text>
            <Text style={styles.statLabel}>Pending Review</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setActiveTab('moderation')}
          >
            <Text style={styles.actionEmoji}>🛡️</Text>
            <Text style={styles.actionText}>Moderation Queue</Text>
            <Text style={styles.actionBadge}>{moderationQueue.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setActiveTab('users')}
          >
            <Text style={styles.actionEmoji}>👥</Text>
            <Text style={styles.actionText}>User Management</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setActiveTab('content')}
          >
            <Text style={styles.actionEmoji}>📝</Text>
            <Text style={styles.actionText}>Content Management</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setActiveTab('analytics')}
          >
            <Text style={styles.actionEmoji}>📈</Text>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>🕒 Recent Activity</Text>
        {dashboardData?.recentActivity?.slice(0, 5).map((activity, index) => (
          <View key={index} style={styles.activityCard}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityMeta}>
              {activity.type} • {new Date(activity.created_at).toLocaleDateString()}
            </Text>
          </View>
        )) || (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderModerationTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.moderationHeader}>
        <Text style={styles.sectionTitle}>🛡️ Moderation Queue</Text>
        {moderationStats && (
          <View style={styles.moderationStats}>
            <View style={styles.moderationStat}>
              <Text style={styles.moderationStatNumber}>{moderationStats.pending || 0}</Text>
              <Text style={styles.moderationStatLabel}>Pending</Text>
            </View>
            <View style={styles.moderationStat}>
              <Text style={styles.moderationStatNumber}>{moderationStats.approved || 0}</Text>
              <Text style={styles.moderationStatLabel}>Approved</Text>
            </View>
            <View style={styles.moderationStat}>
              <Text style={styles.moderationStatNumber}>{moderationStats.rejected || 0}</Text>
              <Text style={styles.moderationStatLabel}>Rejected</Text>
            </View>
          </View>
        )}
      </View>

      {moderationQueue.length > 0 ? (
        moderationQueue.map((content, index) => (
          <TouchableOpacity
            key={index}
            style={styles.moderationItem}
            onPress={() => handleModerateContent(content)}
          >
            <View style={styles.moderationItemHeader}>
              <Text style={styles.moderationItemTitle}>{content.title || 'Untitled'}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(content.priority) }]}>
                <Text style={styles.priorityText}>{content.priority || 'Normal'}</Text>
              </View>
            </View>
            <Text style={styles.moderationItemContent} numberOfLines={2}>
              {content.content || 'No content'}
            </Text>
            <View style={styles.moderationItemMeta}>
              <Text style={styles.moderationItemAuthor}>
                {content.author?.nickname || 'Anonymous'} • {content.author?.trust_score || 1.0}⭐
              </Text>
              <Text style={styles.moderationItemDate}>
                {new Date(content.created_at).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No content pending moderation</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderUsersTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>👥 User Management</Text>
      {users.map((user, index) => (
        <View key={index} style={styles.userCard}>
          <Text style={styles.userEmoji}>{user.emoji}</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.nickname}</Text>
            <Text style={styles.userMeta}>
              {user.county} • {user.xp} XP • Trust: {user.trust_score || 1.0}⭐
            </Text>
            <Text style={styles.userRole}>Role: {user.role || 'User'}</Text>
          </View>
          <View style={styles.userActions}>
            <TouchableOpacity style={styles.userActionButton}>
              <Text style={styles.userActionText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderTrustTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>⭐ Trust Leaderboard</Text>
      {trustLeaderboard.map((user, index) => (
        <View key={index} style={styles.trustCard}>
          <View style={styles.trustRank}>
            <Text style={styles.trustRankNumber}>#{index + 1}</Text>
          </View>
          <Text style={styles.trustEmoji}>{user.emoji}</Text>
          <View style={styles.trustInfo}>
            <Text style={styles.trustName}>{user.nickname}</Text>
            <Text style={styles.trustScore}>Trust Score: {user.trust_score}⭐</Text>
            <Text style={styles.trustXp}>{user.xp} XP</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>📈 Analytics</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>User Growth</Text>
          <Text style={styles.analyticsValue}>+{dashboardData?.userGrowth || 0}%</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Content Engagement</Text>
          <Text style={styles.analyticsValue}>{dashboardData?.engagement || 0}%</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Learning Completion</Text>
          <Text style={styles.analyticsValue}>{dashboardData?.learningCompletion || 0}%</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Trust Score Avg</Text>
          <Text style={styles.analyticsValue}>{dashboardData?.avgTrustScore || 1.0}⭐</Text>
        </View>
      </View>
    </ScrollView>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#FF4757';
      case 'high': return '#FF6B6B';
      case 'normal': return '#4ECDC4';
      case 'low': return '#95A5A6';
      default: return '#4ECDC4';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverviewTab();
      case 'moderation': return renderModerationTab();
      case 'users': return renderUsersTab();
      case 'content': return renderOverviewTab(); // Placeholder
      case 'analytics': return renderAnalyticsTab();
      case 'trust': return renderTrustTab();
      default: return renderOverviewTab();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
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
            <View style={styles.adminInfo}>
              <Text style={styles.adminEmoji}>{user?.emoji || '👤'}</Text>
              <View style={styles.adminText}>
                <Text style={styles.adminName}>{user?.nickname || 'Admin'}</Text>
                <Text style={styles.adminRole}>{user?.role || 'Administrator'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabNavigation}
        contentContainerStyle={styles.tabNavigationContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      {renderTabContent()}

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
                <Text style={styles.modalContentTitle}>{selectedContent.title}</Text>
                <Text style={styles.modalContentText}>{selectedContent.content}</Text>
                <TextInput
                  style={styles.reviewNotesInput}
                  placeholder="Review notes (optional)"
                  value={reviewNotes}
                  onChangeText={setReviewNotes}
                  multiline
                />
                <View style={styles.modalActions}>
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
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  adminText: {
    flex: 1,
  },
  adminName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  adminRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
  tabNavigation: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabNavigationContent: {
    paddingHorizontal: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B6B',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  actionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF4757',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activitySection: {
    marginBottom: 24,
  },
  activityCard: {
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
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  moderationHeader: {
    marginBottom: 20,
  },
  moderationStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moderationStat: {
    alignItems: 'center',
  },
  moderationStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  moderationStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  moderationItem: {
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
  moderationItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moderationItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
  moderationItemContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  moderationItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moderationItemAuthor: {
    fontSize: 12,
    color: '#999',
  },
  moderationItemDate: {
    fontSize: 12,
    color: '#999',
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#999',
  },
  userActions: {
    marginLeft: 12,
  },
  userActionButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  userActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  trustCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trustRank: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  trustRankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  trustEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  trustInfo: {
    flex: 1,
  },
  trustName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  trustScore: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  trustXp: {
    fontSize: 12,
    color: '#999',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  analyticsTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
  modalContentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalContentText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
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
    marginHorizontal: 8,
  },
  rejectButton: {
    backgroundColor: '#FF4757',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EnhancedAdminDashboard;
