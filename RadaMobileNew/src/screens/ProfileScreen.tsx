import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAnonMode } from '../contexts/AnonModeContext';
import AdminLoginScreen from './AdminLoginScreen';
import AdminDashboard from './AdminDashboard';
import ProfileCustomizationModal from '../components/ProfileCustomizationModal';
import PrivacyControlsModal from '../components/PrivacyControlsModal';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const { 
    user, 
    updateProfile, 
    getDisplayName, 
    getDisplayPicture, 
    isAnonymousMode,
    clearAllData 
  } = useAnonMode();
  
  // Debug logging for user data
  console.log('🔍 ProfileScreen: Current user from context:', {
    hasUser: !!user,
    uuid: user?.uuid?.substring(0, 8) + '...',
    nickname: user?.nickname,
    isAnonymous: user?.isAnonymous,
    hasPassword: !!user?.password
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [menuVisible, setMenuVisible] = useState(false);
  const [adminLoginVisible, setAdminLoginVisible] = useState(false);
  const [adminDashboardVisible, setAdminDashboardVisible] = useState(false);
  const [profileCustomizationVisible, setProfileCustomizationVisible] = useState(false);
  const [privacyControlsVisible, setPrivacyControlsVisible] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    anonymousMode: false,
  });
  const [profileData, setProfileData] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '🏠' },
    { key: 'trust', label: 'Trust Score', icon: '🏆' },
    { key: 'saved', label: 'Saved', icon: '📚' },
    { key: 'badges', label: 'Badges', icon: '🏅' },
    { key: 'stats', label: 'Stats', icon: '📊' },
  ];

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.uuid) return;
      
      try {
        setLoading(true);
        console.log('🔍 ProfileScreen: Fetching profile data for user:', {
          uuid: user.uuid,
          nickname: user.nickname,
          hasPassword: !!user.password
        });
        
        const [profileResponse, activityResponse, savedResponse] = await Promise.all([
          apiService.getUserProfile(user.uuid),
          apiService.getUserActivity(user.uuid, 10),
          apiService.getUserSavedItems(user.uuid)
        ]);
        
        console.log('🔍 ProfileScreen: API responses:', {
          profile: profileResponse,
          activity: activityResponse?.length || 0,
          saved: savedResponse?.length || 0
        });
        
        setProfileData(profileResponse);
        setActivityData(activityResponse);
        setSavedItems(savedResponse);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        // Fallback to user data from context
        console.log('🔍 ProfileScreen: Using fallback user data:', user);
        setProfileData(user);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.uuid]);

  const menuItems = [
    { icon: '🔒', label: 'Privacy Controls', action: () => { setMenuVisible(false); setPrivacyControlsVisible(true); } },
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

  const handleProfileSave = async (profileData) => {
    try {
      console.log('🔍 ProfileScreen: handleProfileSave called with:', profileData);
      console.log('🔍 ProfileScreen: Current user before update:', {
        uuid: user?.uuid,
        nickname: user?.nickname,
        hasPassword: !!user?.password
      });
      
      await updateProfile(profileData);
      console.log('🔍 ProfileScreen: Profile update completed successfully');
      Alert.alert('Profile Updated', 'Your profile has been updated successfully!');
    } catch (error) {
      console.error('❌ ProfileScreen: Failed to update profile:', error);
      console.error('❌ ProfileScreen: Error details:', {
        message: error.message,
        stack: error.stack
      });
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const getCurrentProfileData = () => {
    if (!user) return {
      nickname: '',
      profilePicture: null,
      county: '',
      bio: ''
    };

    return {
      nickname: user.nickname || '',
      profilePicture: user.profilePicture || null,
      county: user.county || '',
      bio: user.bio || ''
    };
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
            {getDisplayPicture() ? (
              getDisplayPicture().startsWith('data:') || 
              getDisplayPicture().startsWith('file:') || 
              getDisplayPicture().startsWith('http') ? (
                <Image source={{ uri: getDisplayPicture() }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatar}>{getDisplayPicture()}</Text>
              )
            ) : (
              <Text style={styles.avatar}>👤</Text>
            )}
            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeText}>⭐</Text>
            </View>
            <View style={styles.onlineIndicator} />
            {/* AnonMode™ Indicator */}
            <View style={styles.anonModeIndicator}>
              <Text style={styles.anonModeText}>🔒</Text>
            </View>
          </View>
          
          <View style={styles.profileInfoContainer}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName}>
                {profileData?.nickname || user?.nickname || getDisplayName()}
              </Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setProfileCustomizationVisible(true)}
              >
                <Text style={styles.editButtonText}>✏️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.profileLocation}>
              📍 {profileData?.county || user?.county || 'Location not set'} • Level {profileData?.level || user?.level || 1} • XP: {profileData?.xp || user?.xp || 0} • Trust: {Number(profileData?.trust_score || user?.trustScore || 0).toFixed(1)} 🏅 {Array.isArray(profileData?.badges || user?.badges) ? (profileData?.badges || user?.badges).length : 0} Badges
            </Text>
            <Text style={styles.bio}>
              {profileData?.bio || user?.bio || 'Welcome to Rada.ke! Customize your profile to connect with your community.'}
            </Text>
            {/* AnonMode™ Status */}
            <View style={styles.anonModeStatus}>
              <Text style={styles.anonModeStatusText}>
                🔒 AnonMode™ Active - Your privacy is protected
              </Text>
            </View>
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
                  <Text style={styles.statValue}>{profileData?.xp || user?.xp || 0}</Text>
                  <Text style={styles.statLabel}>Total XP</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{Number(profileData?.trust_score || user?.trustScore || 0).toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Trust Score</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{Array.isArray(profileData?.badges || user?.badges) ? (profileData?.badges || user?.badges).length : 0}</Text>
                  <Text style={styles.statLabel}>Badges</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{profileData?.level || user?.level || 1}</Text>
                  <Text style={styles.statLabel}>Level</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎯 Recent Activity</Text>
              {loading ? (
                <Text style={styles.loadingText}>Loading activity...</Text>
              ) : activityData?.length > 0 ? (
              <View style={styles.activityList}>
                  {activityData.map((activity) => (
                    <View key={activity.id} style={styles.activityItem}>
                      <Text style={styles.activityIcon}>{activity.icon}</Text>
                  <View style={styles.activityContent}>
                        <Text style={styles.activityText}>{activity.title}</Text>
                        <Text style={styles.activityTime}>
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </Text>
                  </View>
                      <Text style={styles.activityXp}>+{activity.xp} XP</Text>
                </View>
                  ))}
                  </View>
              ) : (
                <Text style={styles.emptyText}>No recent activity</Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'trust' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🏆 Trust Score Details</Text>
              <View style={styles.trustScoreCard}>
                <Text style={styles.trustScoreValue}>{Number(profileData?.trust_score || user?.trustScore || 0).toFixed(1)}</Text>
                <Text style={styles.trustScoreLabel}>Current Trust Score</Text>
                <View style={styles.trustProgressBar}>
                  <View style={[styles.trustProgressFill, { width: `${(Number(profileData?.trust_score || user?.trustScore || 0) / 5) * 100}%` }]} />
                </View>
                <Text style={styles.trustLevelInfo}>
                  {(() => {
                    const score = profileData?.trust_score || user?.trustScore || 0;
                    if (score >= 4.5) return 'Excellent Trust';
                    if (score >= 3.5) return 'Good Trust';
                    if (score >= 2.5) return 'Fair Trust';
                    if (score >= 1.5) return 'Low Trust';
                    return 'Building Trust';
                  })()}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>📈 Trust Events History</Text>
              {loading ? (
                <Text style={styles.loadingText}>Loading trust events...</Text>
              ) : activityData?.length > 0 ? (
              <View style={styles.trustEventsList}>
                  {activityData.slice(0, 5).map((activity) => (
                    <View key={activity.id} style={styles.trustEventItem}>
                  <View style={styles.trustEventContent}>
                        <Text style={styles.trustEventTitle}>{activity.title}</Text>
                        <Text style={styles.trustEventDescription}>{activity.description}</Text>
                  </View>
                      <Text style={styles.trustEventScore}>+{Math.floor(activity.xp / 10)}</Text>
                </View>
                  ))}
                  </View>
              ) : (
                <Text style={styles.emptyText}>No trust events yet. Start engaging to build your trust score!</Text>
              )}
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
              {loading ? (
                <Text style={styles.loadingText}>Loading saved items...</Text>
              ) : savedItems?.length > 0 ? (
              <View style={styles.savedList}>
                  {savedItems.map((item) => (
                    <View key={item.id} style={styles.savedItem}>
                    <View style={styles.savedItemContent}>
                        <Text style={styles.savedItemType}>{item.icon} {item.type}</Text>
                        <Text style={styles.savedItemTitle}>{item.title}</Text>
                        <Text style={styles.savedItemDate}>
                          Saved {new Date(item.savedAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.savedItemAction}>
                      <Text style={styles.savedItemActionText}>View</Text>
                    </TouchableOpacity>
                  </View>
                  ))}
                    </View>
              ) : (
                <Text style={styles.emptyText}>No saved items yet</Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'badges' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🏅 Your Badges</Text>
              <Text style={styles.badgesDescription}>
                You've earned {Array.isArray(profileData?.badges || user?.badges) ? (profileData?.badges || user?.badges).length : 0} badges through your civic engagement activities.
              </Text>
              {loading ? (
                <Text style={styles.loadingText}>Loading badges...</Text>
              ) : Array.isArray(profileData?.badges || user?.badges) && (profileData?.badges || user?.badges).length > 0 ? (
              <View style={styles.badgesGrid}>
                  {(profileData?.badges || user?.badges).map((badge, index) => (
                    <View key={index} style={styles.badgeItem}>
                      <Text style={styles.badgeIcon}>{badge.icon || '🏆'}</Text>
                      <Text style={styles.badgeName}>{badge.name || 'Badge'}</Text>
                  </View>
                ))}
              </View>
              ) : (
                <Text style={styles.emptyText}>No badges earned yet. Keep engaging to earn your first badge!</Text>
              )}
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
                  <Text style={styles.statRowLabel}>Total XP</Text>
                  <Text style={styles.statRowValue}>{profileData?.xp || user?.xp || 0}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Current Level</Text>
                  <Text style={styles.statRowValue}>{profileData?.level || user?.level || 1}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Learning Streak</Text>
                  <Text style={styles.statRowValue}>{profileData?.streak || user?.streak || 0} days</Text>
                </View>
              </View>

              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Community Engagement</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Trust Score</Text>
                  <Text style={styles.statRowValue}>{Number(profileData?.trust_score || user?.trustScore || 0).toFixed(1)}/5.0</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Badges Earned</Text>
                  <Text style={styles.statRowValue}>{Array.isArray(profileData?.badges || user?.badges) ? (profileData?.badges || user?.badges).length : 0}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Activity Items</Text>
                  <Text style={styles.statRowValue}>{activityData?.length || 0}</Text>
                </View>
              </View>

              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Trust Building</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Current Trust Score</Text>
                  <Text style={styles.statRowValue}>{Number(user?.trustScore || 3.2).toFixed(1)} / 5.0</Text>
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
                  onPress={() => handleDangerAction(async () => {
                    try {
                      await clearAllData();
                      console.log('🔒 AnonMode™: User logged out successfully');
                    } catch (error) {
                      console.error('❌ Logout failed:', error);
                      Alert.alert('Logout Failed', 'Could not log out. Please try again.');
                    }
                  }, 'log out')}
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

      {/* Profile Customization Modal */}
      <ProfileCustomizationModal
        visible={profileCustomizationVisible}
        onClose={() => setProfileCustomizationVisible(false)}
        onSave={handleProfileSave}
        currentProfile={getCurrentProfileData()}
      />

      {/* Privacy Controls Modal */}
      <PrivacyControlsModal
        visible={privacyControlsVisible}
        onClose={() => setPrivacyControlsVisible(false)}
      />
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
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  anonModeIndicator: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  anonModeText: {
    fontSize: 10,
  },
  profileInfoContainer: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
  },
  editButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  editButtonText: {
    fontSize: 14,
    color: 'white',
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
    marginBottom: 8,
  },
  anonModeStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  anonModeStatusText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
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
  savedSection: {
    marginBottom: 20,
  },
  savedSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B',
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
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 20,
  },
});

export default ProfileScreen;
