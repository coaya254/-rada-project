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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import ContentManagementScreen from './ContentManagementScreen';

const AdminDashboard = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState(null);
  const [contentManagementVisible, setContentManagementVisible] = useState(false);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('AdminDashboard - Loading dashboard data...');
      
      const [dashboardData, usersData, contentData] = await Promise.all([
        apiService.getAdminDashboard(),
        apiService.getAdminUsers(),
        apiService.getAdminContent()
      ]);

      console.log('AdminDashboard - API responses:', {
        dashboard: dashboardData,
        users: usersData,
        content: contentData
      });

      setDashboardData(dashboardData?.dashboard || null);
      setUsers(usersData?.users || []);
      setContent(contentData?.content || null);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
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
        { text: 'Logout', onPress: () => {
          logout();
          onClose();
        }}
      ]
    );
  };

  const handleContentManagement = () => {
    setContentManagementVisible(true);
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
              <Text style={styles.adminEmoji}>{user.emoji}</Text>
              <View style={styles.adminText}>
                <Text style={styles.adminName}>{user.nickname}</Text>
                <Text style={styles.adminRole}>{user.role}</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Platform Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{dashboardData?.userStats?.total_users || 0}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{dashboardData?.userStats?.active_today || 0}</Text>
              <Text style={styles.statLabel}>Active Today</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{dashboardData?.contentStats?.total_posts || 0}</Text>
              <Text style={styles.statLabel}>Total Posts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{dashboardData?.learningStats?.total_modules || 0}</Text>
              <Text style={styles.statLabel}>Learning Modules</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionEmoji}>👥</Text>
              <Text style={styles.actionText}>Manage Users</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleContentManagement}
            >
              <Text style={styles.actionEmoji}>📝</Text>
              <Text style={styles.actionText}>Manage Content</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionEmoji}>📚</Text>
              <Text style={styles.actionText}>Learning Modules</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionEmoji}>🏆</Text>
              <Text style={styles.actionText}>Badges & Rewards</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>🕒 Recent Activity</Text>
          {dashboardData?.recentPosts?.slice(0, 5).map((post, index) => (
            <View key={index} style={styles.activityCard}>
              <Text style={styles.activityTitle}>{post.title}</Text>
              <Text style={styles.activityMeta}>
                {post.type} • {new Date(post.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>

        {/* User Management Preview */}
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>👥 Recent Users</Text>
          {users.slice(0, 5).map((user, index) => (
            <View key={index} style={styles.userCard}>
              <Text style={styles.userEmoji}>{user.emoji}</Text>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.nickname}</Text>
                <Text style={styles.userMeta}>
                  {user.county} • {user.xp} XP • {user.role}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Content Management Modal */}
      <Modal
        visible={contentManagementVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setContentManagementVisible(false)}
      >
        <ContentManagementScreen 
          onClose={() => setContentManagementVisible(false)}
        />
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
    marginTop: 10,
    color: '#666',
    fontSize: 16,
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
    marginBottom: 15,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    fontWeight: '700',
    color: 'white',
  },
  adminRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'capitalize',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B6B',
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
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
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
  usersSection: {
    marginBottom: 24,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userMeta: {
    fontSize: 12,
    color: '#666',
  },
});

export default AdminDashboard;
