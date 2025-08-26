import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Dimensions,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import AdminLoginScreen from './AdminLoginScreen';
import AdminDashboard from './AdminDashboard';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [menuVisible, setMenuVisible] = useState(false);
  const [adminLoginVisible, setAdminLoginVisible] = useState(false);
  const [adminDashboardVisible, setAdminDashboardVisible] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    anonymousMode: false,
  });

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '🏠' },
    { key: 'trust', label: 'Trust Score', icon: '🏆' },
    { key: 'saved', label: 'Saved', icon: '📚' },
    { key: 'badges', label: 'Badges', icon: '🏅' },
    { key: 'stats', label: 'Stats', icon: '📊' },
  ];

  const menuItems = [
    { icon: '📊', label: 'Activity History', action: () => Alert.alert('Activity History', 'View your complete activity timeline') },
    { icon: '📚', label: 'Saved Items', action: () => Alert.alert('Saved Items', 'View your bookmarked content') },
    { icon: '🏆', label: 'Achievements', action: () => Alert.alert('Achievements', 'View all your earned badges and milestones') },
    { icon: '📈', label: 'Progress Report', action: () => Alert.alert('Progress Report', 'Detailed learning and engagement statistics') },
    { icon: '🎯', label: 'Goals & Targets', action: () => Alert.alert('Goals & Targets', 'Set and track your civic engagement goals') },
    { icon: '👥', label: 'Community', action: () => Alert.alert('Community', 'Connect with other civic champions') },
    { icon: '📰', label: 'News & Updates', action: () => Alert.alert('News & Updates', 'Latest civic education news and updates') },
    { icon: '❓', label: 'Help & Support', action: () => Alert.alert('Help & Support', 'Get help and find answers to your questions') },
    { icon: '📧', label: 'Contact Us', action: () => Alert.alert('Contact Us', 'Reach out to our team for assistance') },
    { icon: '📱', label: 'Share App', action: () => Alert.alert('Share App', 'Share Rada.ke with friends and family') },
    { icon: '⭐', label: 'Rate App', action: () => Alert.alert('Rate App', 'Rate us on the app store') },
    { icon: '🔒', label: 'Privacy Policy', action: () => Alert.alert('Privacy Policy', 'View our privacy policy') },
    { icon: '📄', label: 'Terms of Service', action: () => Alert.alert('Terms of Service', 'View our terms of service') },
    { icon: 'ℹ️', label: 'About Rada.ke', action: () => Alert.alert('About Rada.ke', 'Learn more about our mission and team') },
  ];

  // Admin access button (hidden for regular users)
  const adminAccessButton = (
    <TouchableOpacity 
      style={styles.adminButton}
      onPress={() => setAdminLoginVisible(true)}
    >
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        style={styles.adminGradient}
      >
        <Text style={styles.adminEmoji}>👑</Text>
        <Text style={styles.adminText}>Admin Access</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Handle admin login success
  const handleAdminLoginSuccess = () => {
    setAdminLoginVisible(false);
    setAdminDashboardVisible(true);
  };

  // Check if user is admin and show admin dashboard
  const checkAdminStatus = () => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      setAdminDashboardVisible(true);
      setAdminLoginVisible(false);
    }
  };

  // Listen for user role changes
  React.useEffect(() => {
    checkAdminStatus();
  }, [user?.role]);

  const handleSettingToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDangerAction = (action, title) => {
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${title.toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: 'destructive', onPress: action }
      ]
    );
  };

  const getTrustLevel = (trustScore) => {
    if (trustScore >= 4.0) return { level: 'exemplary', color: '#FFD700', label: 'Exemplary Citizen' };
    if (trustScore >= 3.0) return { level: 'trusted', color: '#4CAF50', label: 'Trusted Member' };
    if (trustScore >= 2.0) return { level: 'reliable', color: '#2196F3', label: 'Reliable Contributor' };
    if (trustScore >= 1.5) return { level: 'building', color: '#FF9800', label: 'Building Trust' };
    return { level: 'new', color: '#9E9E9E', label: 'New Member' };
  };

  const trustLevel = getTrustLevel(user?.trustScore || 1.0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />
      
      {/* Header */}
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Text style={styles.menuButton}>☰</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{user?.emoji || '👤'}</Text>
            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeText}>⭐</Text>
            </View>
            <View style={styles.onlineIndicator} />
          </View>
          
          <View style={styles.profileInfoContainer}>
            <Text style={styles.profileName}>{user?.nickname || 'User'}</Text>
            <Text style={styles.profileLocation}>📍 {user?.county || 'Nairobi'} • Level {user?.level || 1} • #{user?.rank || 156} • Trust: {(user?.trustScore || 3.2).toFixed(1)} 🏅 {user?.badges || 8} Badges Earned</Text>
            <Text style={styles.bio}>{user?.bio || 'Passionate about civic engagement and community development. Building a better future through active participation and informed decision-making.'}</Text>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.headerTabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.headerTab, activeTab === tab.key && styles.activeHeaderTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.headerTabText, activeTab === tab.key && styles.activeHeaderTabText]}>
                {tab.icon} {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📊 Stats Overview</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{user?.xp_points || 1250}</Text>
                  <Text style={styles.statLabel}>Total XP</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{(user?.trustScore || 3.2).toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Trust Score</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{user?.badges || 8}</Text>
                  <Text style={styles.statLabel}>Badges</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{user?.level || 8}</Text>
                  <Text style={styles.statLabel}>Level</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎯 Recent Activity</Text>
              <View style={styles.activityList}>
                <View style={styles.activityItem}>
                  <Text style={styles.activityIcon}>📚</Text>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>Completed "Civic Rights" module</Text>
                    <Text style={styles.activityTime}>2 hours ago</Text>
                  </View>
                  <Text style={styles.activityXp}>+25 XP</Text>
                </View>
                <View style={styles.activityItem}>
                  <Text style={styles.activityIcon}>🏆</Text>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>Earned "Trust Builder" badge</Text>
                    <Text style={styles.activityTime}>1 day ago</Text>
                  </View>
                  <Text style={styles.activityXp}>+50 XP</Text>
                </View>
                <View style={styles.activityItem}>
                  <Text style={styles.activityIcon}>📊</Text>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>Submitted promise evidence</Text>
                    <Text style={styles.activityTime}>3 days ago</Text>
                  </View>
                  <Text style={styles.activityXp}>+15 XP</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'trust' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🏆 Trust Score Details</Text>
              <View style={styles.trustScoreCard}>
                <Text style={styles.trustScoreValue}>{(user?.trustScore || 3.2).toFixed(1)}</Text>
                <Text style={styles.trustScoreLabel}>Current Trust Score</Text>
                <View style={styles.trustProgressBar}>
                  <View style={[styles.trustProgressFill, { width: `${((user?.trustScore || 3.2) / 5) * 100}%` }]} />
                </View>
                <Text style={styles.trustLevelInfo}>{trustLevel.label}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>📈 Trust Events History</Text>
              <View style={styles.trustEventsList}>
                <View style={styles.trustEventItem}>
                  <View style={styles.trustEventContent}>
                    <Text style={styles.trustEventTitle}>Module Completion</Text>
                    <Text style={styles.trustEventDescription}>Completed civic education module</Text>
                  </View>
                  <Text style={styles.trustEventScore}>+0.1</Text>
                </View>
                <View style={styles.trustEventItem}>
                  <View style={styles.trustEventContent}>
                    <Text style={styles.trustEventTitle}>Evidence Submission</Text>
                    <Text style={styles.trustEventDescription}>Submitted verified promise evidence</Text>
                  </View>
                  <Text style={styles.trustEventScore}>+0.2</Text>
                </View>
                <View style={styles.trustEventItem}>
                  <View style={styles.trustEventContent}>
                    <Text style={styles.trustEventTitle}>Community Recognition</Text>
                    <Text style={styles.trustEventDescription}>Received community honor</Text>
                  </View>
                  <Text style={styles.trustEventScore}>+0.3</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'saved' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📚 Saved Items</Text>
              <Text style={styles.savedDescription}>
                Items you've bookmarked for later reading and reference.
              </Text>
              <View style={styles.savedList}>
                <View style={styles.savedItem}>
                  <View style={styles.savedItemContent}>
                    <Text style={styles.savedItemType}>📄 Article</Text>
                    <Text style={styles.savedItemTitle}>Understanding Civic Rights</Text>
                    <Text style={styles.savedItemDate}>Saved 2 days ago</Text>
                  </View>
                  <TouchableOpacity style={styles.savedItemAction}>
                    <Text style={styles.savedItemActionText}>View</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.savedItem}>
                  <View style={styles.savedItemContent}>
                    <Text style={styles.savedItemType}>🎯 Promise</Text>
                    <Text style={styles.savedItemTitle}>Infrastructure Development Plan</Text>
                    <Text style={styles.savedItemDate}>Saved 5 days ago</Text>
                  </View>
                  <TouchableOpacity style={styles.savedItemAction}>
                    <Text style={styles.savedItemActionText}>View</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.savedItem}>
                  <View style={styles.savedItemContent}>
                    <Text style={styles.savedItemType}>📚 Module</Text>
                    <Text style={styles.savedItemTitle}>Government Structure Basics</Text>
                    <Text style={styles.savedItemDate}>Saved 1 week ago</Text>
                  </View>
                  <TouchableOpacity style={styles.savedItemAction}>
                    <Text style={styles.savedItemActionText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'badges' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🏅 Your Badges</Text>
              <Text style={styles.badgesDescription}>
                You've earned {user?.badges || 8} badges through your civic engagement activities.
              </Text>
              <View style={styles.badgesGrid}>
                {[
                  { icon: '🏆', name: 'Trust Builder', earned: true },
                  { icon: '⭐', name: 'Civic Champion', earned: true },
                  { icon: '🎯', name: 'Evidence Master', earned: true },
                  { icon: '🔥', name: 'Streak Keeper', earned: true },
                  { icon: '💡', name: 'Knowledge Seeker', earned: true },
                  { icon: '🌟', name: 'Community Hero', earned: true },
                  { icon: '🏛️', name: 'Policy Expert', earned: false },
                  { icon: '📚', name: 'Learning Legend', earned: false },
                ].map((badge, index) => (
                  <View key={index} style={[styles.badgeItem, !badge.earned && styles.badgeItemLocked]}>
                    <Text style={[styles.badgeIcon, !badge.earned && styles.badgeIconLocked]}>{badge.icon}</Text>
                    <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}>{badge.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'stats' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📊 Detailed Statistics</Text>
              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Learning Progress</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Modules Completed</Text>
                  <Text style={styles.statRowValue}>12 / 25</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Quiz Success Rate</Text>
                  <Text style={styles.statRowValue}>87%</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Learning Streak</Text>
                  <Text style={styles.statRowValue}>{user?.streak || 7} days</Text>
                </View>
              </View>

              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Community Engagement</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Promise Tracking</Text>
                  <Text style={styles.statRowValue}>23 tracked</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Evidence Submitted</Text>
                  <Text style={styles.statRowValue}>8 submissions</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Community Rank</Text>
                  <Text style={styles.statRowValue}>#{user?.rank || 156}</Text>
                </View>
              </View>

              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Trust Building</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Current Trust Score</Text>
                  <Text style={styles.statRowValue}>{(user?.trustScore || 3.2).toFixed(1)} / 5.0</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Trust Events</Text>
                  <Text style={styles.statRowValue}>15 events</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Trust Level</Text>
                  <Text style={styles.statRowValue}>{trustLevel.label}</Text>
                </View>
              </View>
            </View>
          </View>
        )}


      </ScrollView>

      {/* Hamburger Menu */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            onPress={() => setMenuVisible(false)}
          />
          <View style={styles.menuDrawer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuContent}>
              {/* Profile Section */}
              <View style={styles.menuSection}>
                <Text style={styles.menuSectionTitle}>Profile</Text>
                {menuItems.slice(0, 6).map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={item.action}
                  >
                    <Text style={styles.menuItemIcon}>{item.icon}</Text>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.menuDivider} />

              {/* Support Section */}
              <View style={styles.menuSection}>
                <Text style={styles.menuSectionTitle}>Support</Text>
                {menuItems.slice(6, 9).map((item, index) => (
                  <TouchableOpacity
                    key={index + 6}
                    style={styles.menuItem}
                    onPress={item.action}
                  >
                    <Text style={styles.menuItemIcon}>{item.icon}</Text>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.menuDivider} />

              {/* App Section */}
              <View style={styles.menuSection}>
                <Text style={styles.menuSectionTitle}>App</Text>
                {menuItems.slice(9, 14).map((item, index) => (
                  <TouchableOpacity
                    key={index + 9}
                    style={styles.menuItem}
                    onPress={item.action}
                  >
                    <Text style={styles.menuItemIcon}>{item.icon}</Text>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.menuDivider} />

              {/* Settings Section */}
              <View style={styles.settingsSection}>
                <Text style={styles.settingsTitle}>Settings</Text>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Notifications</Text>
                  <Switch
                    value={settings.notifications}
                    onValueChange={() => handleSettingToggle('notifications')}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={settings.notifications ? '#f5dd4b' : '#f4f3f4'}
                  />
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                  <Switch
                    value={settings.darkMode}
                    onValueChange={() => handleSettingToggle('darkMode')}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={settings.darkMode ? '#f5dd4b' : '#f4f3f4'}
                  />
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Anonymous Mode</Text>
                  <Switch
                    value={settings.anonymousMode}
                    onValueChange={() => handleSettingToggle('anonymousMode')}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={settings.anonymousMode ? '#f5dd4b' : '#f4f3f4'}
                  />
                </View>
              </View>

              <View style={styles.menuDivider} />

              {/* Admin Access */}
              {adminAccessButton}

              <View style={styles.menuDivider} />

              {/* Account Actions */}
              <View style={styles.menuSection}>
                <Text style={styles.menuSectionTitle}>Account</Text>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => Alert.alert('Export Data', 'Your data will be exported to a file')}
                >
                  <Text style={styles.menuItemIcon}>📤</Text>
                  <Text style={styles.menuItemLabel}>Export My Data</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => Alert.alert('Reset Progress', 'This will reset all your learning progress')}
                >
                  <Text style={styles.menuItemIcon}>🔄</Text>
                  <Text style={styles.menuItemLabel}>Reset Progress</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={() => handleDangerAction(() => Alert.alert('Logged Out'), 'log out')}
                >
                  <Text style={styles.dangerButtonText}>🚪 Log Out</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Admin Login Modal */}
      <Modal
        visible={adminLoginVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAdminLoginVisible(false)}
      >
        <AdminLoginScreen onClose={() => setAdminLoginVisible(false)} onSuccess={handleAdminLoginSuccess} />
      </Modal>

      {/* Admin Dashboard Modal */}
      <Modal
        visible={adminDashboardVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAdminDashboardVisible(false)}
      >
        <AdminDashboard onClose={() => setAdminDashboardVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  menuButton: {
    fontSize: 24,
    color: 'white',
    padding: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    fontSize: 50,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    textAlign: 'center',
    lineHeight: 60,
  },
  trustBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  trustBadgeText: {
    fontSize: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfoContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  profileLocation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 16,
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  headerTabContainer: {
    marginTop: 10,
  },
  headerTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeHeaderTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeHeaderTabText: {
    color: 'white',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tabContent: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activityList: {
    marginTop: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activityXp: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  trustScoreCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  trustScoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  trustScoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  trustProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  trustProgressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  trustLevelInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  trustEventsList: {
    marginTop: 10,
  },
  trustEventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  trustEventContent: {
    flex: 1,
  },
  trustEventTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  trustEventDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  trustEventScore: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  badgesDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
  },
  badgeItemLocked: {
    backgroundColor: '#f0f0f0',
    opacity: 0.6,
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  badgeNameLocked: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackground: {
    flex: 1,
  },
  menuDrawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#FF6B6B',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  closeButton: {
    fontSize: 20,
    color: 'white',
    padding: 5,
  },
  menuContent: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#333',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },
  settingsSection: {
    padding: 15,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
  },
  dangerButton: {
    padding: 15,
    backgroundColor: '#ffebee',
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '600',
  },
  // Saved Items Styles
  savedDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  savedList: {
    marginTop: 10,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  savedItemContent: {
    flex: 1,
  },
  savedItemType: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    marginBottom: 4,
  },
  savedItemTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  savedItemDate: {
    fontSize: 12,
    color: '#666',
  },
  savedItemAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  savedItemActionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  // Stats Tab Styles
  statsSection: {
    marginBottom: 20,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statRowLabel: {
    fontSize: 14,
    color: '#666',
  },
  statRowValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  // Settings Tab Styles
  settingsButton: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  // Menu Section Styles
  menuSection: {
    paddingVertical: 10,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
    paddingHorizontal: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Admin Button Styles
  adminButton: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  adminGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  adminEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  adminText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;
