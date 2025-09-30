import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import notificationService from '../services/notificationService';
import { NotificationData } from '../types/NotificationTypes';

const NotificationCenterScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const filters = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'unread', label: 'Unread', icon: 'circle' },
    { key: 'learning', label: 'Learning', icon: 'book' },
    { key: 'social', label: 'Social', icon: 'users' },
    { key: 'achievement', label: 'Achievements', icon: 'trophy' },
    { key: 'system', label: 'System', icon: 'cog' },
  ];

  useEffect(() => {
    loadNotifications();
    animateIn();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with API call
      const mockNotifications: NotificationData[] = [
        {
          id: '1',
          userId: user?.uuid || 'user1',
          type: 'achievement_unlocked',
          title: '🏆 Achievement Unlocked!',
          message: 'You earned the Constitution Scholar badge!',
          data: { badge: 'Constitution Scholar', xp: 50 },
          isRead: false,
          isDelivered: true,
          createdAt: '2024-01-20T10:30:00Z',
          updatedAt: '2024-01-20T10:30:00Z',
          priority: 'high',
          category: 'achievement',
          actionUrl: 'rada://badges',
        },
        {
          id: '2',
          userId: user?.uuid || 'user1',
          type: 'lesson_reminder',
          title: '📚 Time to Learn!',
          message: 'Your daily lesson is waiting for you',
          data: { moduleId: 1, lessonId: 3 },
          isRead: true,
          isDelivered: true,
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: '2024-01-20T09:00:00Z',
          priority: 'normal',
          category: 'learning',
          actionUrl: 'rada://lesson/3',
        },
        {
          id: '3',
          userId: user?.uuid || 'user1',
          type: 'group_invite',
          title: '👥 Group Invitation',
          message: 'LegalEagle invited you to join Constitution Study Circle',
          data: { groupId: '1', groupName: 'Constitution Study Circle', inviter: 'LegalEagle' },
          isRead: false,
          isDelivered: true,
          createdAt: '2024-01-19T15:45:00Z',
          updatedAt: '2024-01-19T15:45:00Z',
          priority: 'normal',
          category: 'social',
          actionUrl: 'rada://group/1',
        },
        {
          id: '4',
          userId: user?.uuid || 'user1',
          type: 'streak_reminder',
          title: '🔥 Keep Your Streak!',
          message: 'Don\'t break your 5 day learning streak',
          data: { streak: 5 },
          isRead: true,
          isDelivered: true,
          createdAt: '2024-01-19T08:00:00Z',
          updatedAt: '2024-01-19T08:00:00Z',
          priority: 'high',
          category: 'learning',
          actionUrl: 'rada://lessons',
        },
        {
          id: '5',
          userId: user?.uuid || 'user1',
          type: 'study_session_reminder',
          title: '⏰ Study Session Starting',
          message: 'Your study session starts in 15 minutes',
          data: { sessionId: '1', sessionTitle: 'Constitution Basics Review' },
          isRead: false,
          isDelivered: true,
          createdAt: '2024-01-18T14:45:00Z',
          updatedAt: '2024-01-18T14:45:00Z',
          priority: 'high',
          category: 'reminder',
          actionUrl: 'rada://session/1',
        },
        {
          id: '6',
          userId: user?.uuid || 'user1',
          type: 'system_update',
          title: '🔄 App Update Available',
          message: 'New features and improvements are ready!',
          data: { version: '2.1.0' },
          isRead: true,
          isDelivered: true,
          createdAt: '2024-01-17T12:00:00Z',
          updatedAt: '2024-01-17T12:00:00Z',
          priority: 'normal',
          category: 'system',
          actionUrl: 'rada://settings',
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: NotificationData) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await notificationService.markNotificationAsRead(notification.id);
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        ));
      }

      // Handle deep linking
      if (notification.actionUrl) {
        // In a real app, this would navigate to the specific screen
        console.log('Navigate to:', notification.actionUrl);
        Alert.alert('Navigation', `Would navigate to: ${notification.actionUrl}`);
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      for (const notification of unreadNotifications) {
        await notificationService.markNotificationAsRead(notification.id);
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notifications as read');
    }
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'This will permanently delete all notifications. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.clearNotificationHistory();
              setNotifications([]);
              Alert.alert('Success', 'All notifications cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear notifications');
            }
          },
        },
      ]
    );
  };

  const getFilteredNotifications = () => {
    switch (selectedFilter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'learning':
        return notifications.filter(n => n.category === 'learning');
      case 'social':
        return notifications.filter(n => n.category === 'social');
      case 'achievement':
        return notifications.filter(n => n.category === 'achievement');
      case 'system':
        return notifications.filter(n => n.category === 'system');
      default:
        return notifications;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      lesson_reminder: 'book',
      quiz_reminder: 'question-circle',
      streak_reminder: 'fire',
      achievement_unlocked: 'trophy',
      badge_earned: 'medal',
      group_invite: 'users',
      group_activity: 'comments',
      buddy_request: 'user-plus',
      study_session_reminder: 'clock-o',
      challenge_available: 'target',
      weekly_goal_reminder: 'flag',
      social_mention: 'at',
      post_reply: 'reply',
      system_update: 'cog',
      maintenance_notice: 'wrench',
    };
    return icons[type as keyof typeof icons] || 'bell';
  };

  const getNotificationColor = (category: string) => {
    const colors = {
      learning: '#3b82f6',
      social: '#10b981',
      achievement: '#f59e0b',
      reminder: '#ef4444',
      system: '#64748b',
      marketing: '#8b5cf6',
    };
    return colors[category as keyof typeof colors] || '#64748b';
  };

  const renderNotificationCard = (notification: NotificationData) => (
    <Animated.View
      key={notification.id}
      style={[styles.notificationCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity
        onPress={() => handleNotificationPress(notification)}
        activeOpacity={0.8}
        style={[
          styles.cardContent,
          !notification.isRead && styles.unreadCard,
        ]}
      >
        <View style={styles.notificationHeader}>
          <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(notification.category) + '20' }]}>
            <Icon
              name={getNotificationIcon(notification.type)}
              size={20}
              color={getNotificationColor(notification.category)}
            />
          </View>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationTitle, !notification.isRead && styles.unreadText]}>
              {notification.title}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTimeAgo(notification.createdAt)}
            </Text>
          </View>
          {!notification.isRead && (
            <View style={styles.unreadIndicator} />
          )}
        </View>
        
        <Text style={[styles.notificationMessage, !notification.isRead && styles.unreadText]}>
          {notification.message}
        </Text>
        
        {notification.data && Object.keys(notification.data).length > 0 && (
          <View style={styles.notificationData}>
            {notification.data.badge && (
              <View style={styles.dataBadge}>
                <Text style={styles.dataBadgeText}>🏆 {notification.data.badge}</Text>
              </View>
            )}
            {notification.data.streak && (
              <View style={styles.dataBadge}>
                <Text style={styles.dataBadgeText}>🔥 {notification.data.streak} day streak</Text>
              </View>
            )}
            {notification.data.xp && (
              <View style={styles.dataBadge}>
                <Text style={styles.dataBadgeText}>+{notification.data.xp} XP</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Icon
              name={filter.icon as any}
              size={16}
              color={selectedFilter === filter.key ? '#667eea' : '#64748b'}
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.activeFilterText,
              ]}
            >
              {filter.label}
            </Text>
            {filter.key === 'unread' && unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notifications List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="bell-slash" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyDescription}>
              {selectedFilter === 'unread' 
                ? 'You\'re all caught up!' 
                : 'No notifications match your current filter'
              }
            </Text>
          </View>
        ) : (
          <>
            {filteredNotifications.map(renderNotificationCard)}
            
            {/* Clear All Button */}
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={clearAllNotifications}
            >
              <Icon name="trash" size={16} color="#ef4444" />
              <Text style={styles.clearAllText}>Clear All Notifications</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  markAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  activeFilterTab: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
  },
  filterText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#667eea',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationCard: {
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: '#64748b',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationData: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dataBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dataBadgeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginTop: 20,
    marginBottom: 20,
  },
  clearAllText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
});

export default NotificationCenterScreen;

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import notificationService from '../services/notificationService';
import { NotificationData } from '../types/NotificationTypes';

const NotificationCenterScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const filters = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'unread', label: 'Unread', icon: 'circle' },
    { key: 'learning', label: 'Learning', icon: 'book' },
    { key: 'social', label: 'Social', icon: 'users' },
    { key: 'achievement', label: 'Achievements', icon: 'trophy' },
    { key: 'system', label: 'System', icon: 'cog' },
  ];

  useEffect(() => {
    loadNotifications();
    animateIn();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with API call
      const mockNotifications: NotificationData[] = [
        {
          id: '1',
          userId: user?.uuid || 'user1',
          type: 'achievement_unlocked',
          title: '🏆 Achievement Unlocked!',
          message: 'You earned the Constitution Scholar badge!',
          data: { badge: 'Constitution Scholar', xp: 50 },
          isRead: false,
          isDelivered: true,
          createdAt: '2024-01-20T10:30:00Z',
          updatedAt: '2024-01-20T10:30:00Z',
          priority: 'high',
          category: 'achievement',
          actionUrl: 'rada://badges',
        },
        {
          id: '2',
          userId: user?.uuid || 'user1',
          type: 'lesson_reminder',
          title: '📚 Time to Learn!',
          message: 'Your daily lesson is waiting for you',
          data: { moduleId: 1, lessonId: 3 },
          isRead: true,
          isDelivered: true,
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: '2024-01-20T09:00:00Z',
          priority: 'normal',
          category: 'learning',
          actionUrl: 'rada://lesson/3',
        },
        {
          id: '3',
          userId: user?.uuid || 'user1',
          type: 'group_invite',
          title: '👥 Group Invitation',
          message: 'LegalEagle invited you to join Constitution Study Circle',
          data: { groupId: '1', groupName: 'Constitution Study Circle', inviter: 'LegalEagle' },
          isRead: false,
          isDelivered: true,
          createdAt: '2024-01-19T15:45:00Z',
          updatedAt: '2024-01-19T15:45:00Z',
          priority: 'normal',
          category: 'social',
          actionUrl: 'rada://group/1',
        },
        {
          id: '4',
          userId: user?.uuid || 'user1',
          type: 'streak_reminder',
          title: '🔥 Keep Your Streak!',
          message: 'Don\'t break your 5 day learning streak',
          data: { streak: 5 },
          isRead: true,
          isDelivered: true,
          createdAt: '2024-01-19T08:00:00Z',
          updatedAt: '2024-01-19T08:00:00Z',
          priority: 'high',
          category: 'learning',
          actionUrl: 'rada://lessons',
        },
        {
          id: '5',
          userId: user?.uuid || 'user1',
          type: 'study_session_reminder',
          title: '⏰ Study Session Starting',
          message: 'Your study session starts in 15 minutes',
          data: { sessionId: '1', sessionTitle: 'Constitution Basics Review' },
          isRead: false,
          isDelivered: true,
          createdAt: '2024-01-18T14:45:00Z',
          updatedAt: '2024-01-18T14:45:00Z',
          priority: 'high',
          category: 'reminder',
          actionUrl: 'rada://session/1',
        },
        {
          id: '6',
          userId: user?.uuid || 'user1',
          type: 'system_update',
          title: '🔄 App Update Available',
          message: 'New features and improvements are ready!',
          data: { version: '2.1.0' },
          isRead: true,
          isDelivered: true,
          createdAt: '2024-01-17T12:00:00Z',
          updatedAt: '2024-01-17T12:00:00Z',
          priority: 'normal',
          category: 'system',
          actionUrl: 'rada://settings',
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: NotificationData) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await notificationService.markNotificationAsRead(notification.id);
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        ));
      }

      // Handle deep linking
      if (notification.actionUrl) {
        // In a real app, this would navigate to the specific screen
        console.log('Navigate to:', notification.actionUrl);
        Alert.alert('Navigation', `Would navigate to: ${notification.actionUrl}`);
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      for (const notification of unreadNotifications) {
        await notificationService.markNotificationAsRead(notification.id);
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notifications as read');
    }
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'This will permanently delete all notifications. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.clearNotificationHistory();
              setNotifications([]);
              Alert.alert('Success', 'All notifications cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear notifications');
            }
          },
        },
      ]
    );
  };

  const getFilteredNotifications = () => {
    switch (selectedFilter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'learning':
        return notifications.filter(n => n.category === 'learning');
      case 'social':
        return notifications.filter(n => n.category === 'social');
      case 'achievement':
        return notifications.filter(n => n.category === 'achievement');
      case 'system':
        return notifications.filter(n => n.category === 'system');
      default:
        return notifications;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      lesson_reminder: 'book',
      quiz_reminder: 'question-circle',
      streak_reminder: 'fire',
      achievement_unlocked: 'trophy',
      badge_earned: 'medal',
      group_invite: 'users',
      group_activity: 'comments',
      buddy_request: 'user-plus',
      study_session_reminder: 'clock-o',
      challenge_available: 'target',
      weekly_goal_reminder: 'flag',
      social_mention: 'at',
      post_reply: 'reply',
      system_update: 'cog',
      maintenance_notice: 'wrench',
    };
    return icons[type as keyof typeof icons] || 'bell';
  };

  const getNotificationColor = (category: string) => {
    const colors = {
      learning: '#3b82f6',
      social: '#10b981',
      achievement: '#f59e0b',
      reminder: '#ef4444',
      system: '#64748b',
      marketing: '#8b5cf6',
    };
    return colors[category as keyof typeof colors] || '#64748b';
  };

  const renderNotificationCard = (notification: NotificationData) => (
    <Animated.View
      key={notification.id}
      style={[styles.notificationCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity
        onPress={() => handleNotificationPress(notification)}
        activeOpacity={0.8}
        style={[
          styles.cardContent,
          !notification.isRead && styles.unreadCard,
        ]}
      >
        <View style={styles.notificationHeader}>
          <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(notification.category) + '20' }]}>
            <Icon
              name={getNotificationIcon(notification.type)}
              size={20}
              color={getNotificationColor(notification.category)}
            />
          </View>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationTitle, !notification.isRead && styles.unreadText]}>
              {notification.title}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTimeAgo(notification.createdAt)}
            </Text>
          </View>
          {!notification.isRead && (
            <View style={styles.unreadIndicator} />
          )}
        </View>
        
        <Text style={[styles.notificationMessage, !notification.isRead && styles.unreadText]}>
          {notification.message}
        </Text>
        
        {notification.data && Object.keys(notification.data).length > 0 && (
          <View style={styles.notificationData}>
            {notification.data.badge && (
              <View style={styles.dataBadge}>
                <Text style={styles.dataBadgeText}>🏆 {notification.data.badge}</Text>
              </View>
            )}
            {notification.data.streak && (
              <View style={styles.dataBadge}>
                <Text style={styles.dataBadgeText}>🔥 {notification.data.streak} day streak</Text>
              </View>
            )}
            {notification.data.xp && (
              <View style={styles.dataBadge}>
                <Text style={styles.dataBadgeText}>+{notification.data.xp} XP</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Icon
              name={filter.icon as any}
              size={16}
              color={selectedFilter === filter.key ? '#667eea' : '#64748b'}
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.activeFilterText,
              ]}
            >
              {filter.label}
            </Text>
            {filter.key === 'unread' && unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notifications List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="bell-slash" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyDescription}>
              {selectedFilter === 'unread' 
                ? 'You\'re all caught up!' 
                : 'No notifications match your current filter'
              }
            </Text>
          </View>
        ) : (
          <>
            {filteredNotifications.map(renderNotificationCard)}
            
            {/* Clear All Button */}
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={clearAllNotifications}
            >
              <Icon name="trash" size={16} color="#ef4444" />
              <Text style={styles.clearAllText}>Clear All Notifications</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  markAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  activeFilterTab: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
  },
  filterText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#667eea',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationCard: {
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: '#64748b',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationData: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dataBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dataBadgeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginTop: 20,
    marginBottom: 20,
  },
  clearAllText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
});

export default NotificationCenterScreen;
