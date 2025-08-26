import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import CommunityScreen from './CommunityScreen';
import PoliticalArchiveScreen from './PoliticalArchiveScreen';
import PoliticianDetailScreen from './PoliticianDetailScreen';
import ProfileScreen from './ProfileScreen';
import { NavigationContainer } from '@react-navigation/native';
import LearningHub from './LearningHub';
import ModulesScreen from './ModulesScreen';
import QuizzesScreen from './QuizzesScreen';
import QuizTakingScreen from './QuizTakingScreen';
import ChallengesScreen from './ChallengesScreen';
import BadgesScreen from './BadgesScreen';
import ModuleDetailScreen from './ModuleDetailScreen';
import ContentCreatorModal from './ContentCreatorModal';
import AdminLoginScreen from './AdminLoginScreen';
import AdminDashboard from './AdminDashboard';
import YouthHubScreen from './YouthHubScreen';

const Stack = createStackNavigator();

const LearningStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LearningHubMain" component={LearningHub} />
    <Stack.Screen name="ModulesScreen" component={ModulesScreen} />
    <Stack.Screen name="QuizzesScreen" component={QuizzesScreen} />
    <Stack.Screen name="QuizTakingScreen" component={QuizTakingScreen} />
    <Stack.Screen name="ChallengesScreen" component={ChallengesScreen} />
    <Stack.Screen name="BadgesScreen" component={BadgesScreen} />
    <Stack.Screen name="ModuleDetailScreen" component={ModuleDetailScreen} />
  </Stack.Navigator>
);

const PoliticalArchiveStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PoliticalArchiveMain" component={PoliticalArchiveScreen} />
    <Stack.Screen name="PoliticianDetail" component={PoliticianDetailScreen} />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
    <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
  </Stack.Navigator>
);

const MainApp = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showSpeedDial, setShowSpeedDial] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState('story');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const speedDialItems = [
    { icon: '✍️', label: 'Story', type: 'story', color: '#FF6B6B' },
    { icon: '📝', label: 'Poem', type: 'poem', color: '#4ECDC4' },
    { icon: '📊', label: 'Evidence', type: 'evidence', color: '#2196F3' },
    { icon: '🎯', label: 'Report', type: 'report', color: '#FF9800' },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleSpeedDial = () => {
    setShowSpeedDial(!showSpeedDial);
  };

  const handleContentTypeSelect = (type: string) => {
    setSelectedContentType(type);
    setShowContentModal(true);
    setShowSpeedDial(false);
  };

  const closeContentModal = () => {
    setShowContentModal(false);
  };

  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'youth', icon: '🧑‍🎓', label: 'Youth' },
    { id: 'community', icon: '🌟', label: 'Community' },
    { id: 'politics', icon: '🏛️', label: 'Politics' },
    { id: 'learn', icon: '📚', label: 'Learn' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  const renderHomeContent = () => (
    <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
      {/* Header Section - Scrolls with content */}
      <View style={styles.headerSection}>
        <Text style={styles.logo}>rada.ke</Text>
        <TouchableOpacity style={styles.notifications}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* User Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Hujambo, {user?.nickname || 'User'}! 👋</Text>
        <Text style={styles.welcomeSubtitle}>Ready to drive change today?</Text>
        
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{user?.xp_points || 0}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{user?.streak || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔍</Text>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Tracking</Text>
          </View>
        </View>
      </View>

      {/* Featured Today Section */}
      <View style={styles.featuredSection}>
        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleIcon}>⭐</Text>
          <Text style={styles.sectionTitleText}>Featured Today</Text>
        </View>
        
        {/* Main Featured Card */}
        <TouchableOpacity style={styles.featuredMain}>
          <View style={styles.featuredImage}>
            <Text style={styles.featuredImageText}>🌍 Climate Action Rally</Text>
          </View>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeIcon}>👑</Text>
            <Text style={styles.featuredBadgeText}>Top Story</Text>
          </View>
          <Text style={styles.featuredName}>Youth Climate Action</Text>
          <Text style={styles.featuredDesc}>
            Over 5,000 youth participated in nationwide climate protests demanding immediate environmental reforms
          </Text>
          <View style={styles.featuredStats}>
            <View style={styles.featuredStat}>
              <Text style={styles.featuredStatIcon}>👁️</Text>
              <Text style={styles.featuredStatText}>12.4K Views</Text>
            </View>
            <View style={styles.featuredStat}>
              <Text style={styles.featuredStatIcon}>❤️</Text>
              <Text style={styles.featuredStatText}>2.1K Reactions</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Small Cards Grid */}
        <View style={styles.featuredGrid}>
          {[
            { icon: '🏆', title: 'Amina Juma', subtitle: 'Education activist', stats: '⭐ 4.8 Rating' },
            { icon: '👥', title: 'Green Warriors', subtitle: 'Nairobi • 2.3K Members', stats: '🔥 Trending' },
            { icon: '😊', title: 'Hopeful', subtitle: '72% yesterday', stats: '📈 +12% since last week' },
            { icon: '🎯', title: 'Healthcare Reform', subtitle: '45% progress', stats: '👥 4.2K tracking' },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.featuredItem}>
              <Text style={styles.featuredItemIcon}>{item.icon}</Text>
              <Text style={styles.featuredItemTitle}>{item.title}</Text>
              <Text style={styles.featuredItemSubtitle}>{item.subtitle}</Text>
              <Text style={styles.featuredItemStats}>{item.stats}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>📚</Text>
            </View>
            <Text style={styles.quickActionTitle}>Start Learning</Text>
            <Text style={styles.quickActionSubtitle}>Begin a module</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>🎯</Text>
            </View>
            <Text style={styles.quickActionTitle}>Take Quiz</Text>
            <Text style={styles.quickActionSubtitle}>Test knowledge</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>🏆</Text>
            </View>
            <Text style={styles.quickActionTitle}>View Badges</Text>
            <Text style={styles.quickActionSubtitle}>See achievements</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>📊</Text>
            </View>
            <Text style={styles.quickActionTitle}>Track Progress</Text>
            <Text style={styles.quickActionSubtitle}>View stats</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivitySection}>
        <Text style={styles.sectionTitleText}>🎯 Recent Activity</Text>
        <View style={styles.recentActivityGrid}>
          {[
            { icon: '📚', title: 'Read Article', subtitle: 'You read "The Future of Democracy"', date: 'Today' },
            { icon: '🎯', title: 'Completed Quiz', subtitle: 'You scored 85% in "Understanding Politics"', date: 'Yesterday' },
            { icon: '📊', title: 'Tracked Promise', subtitle: 'You submitted evidence for "Education Reform"', date: '2 days ago' },
            { icon: '🏆', title: 'Earned Badge', subtitle: 'You earned "Civic Hero" badge', date: '3 days ago' },
          ].map((activity, index) => (
            <TouchableOpacity key={index} style={styles.recentActivityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>{activity.icon}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
              </View>
              <Text style={styles.activityDate}>{activity.date}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Weekly Challenge */}
      <View style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeTitle}>📊 Accountability Week</Text>
          <Text style={styles.challengeXp}>+50 XP Bonus</Text>
        </View>
        <Text style={styles.challengeDescription}>
          Submit evidence for 3 government promises this week
        </Text>
        <View style={styles.challengeProgress}>
          <View style={styles.challengeProgressFill} />
        </View>
        <View style={styles.challengeStats}>
          <Text style={styles.challengeStatText}>Progress: 2/3 submissions</Text>
          <Text style={styles.challengeStatText}>3 days left</Text>
        </View>
      </View>

      {/* Honor Wall */}
      <View style={styles.honorSection}>
        <Text style={styles.sectionTitleText}>🕯️ Honor Wall</Text>
        <View style={styles.honorGrid}>
          {[
            { name: 'Sarah K.', message: 'For standing up for education rights', xp: '+25' },
            { name: 'David M.', message: 'Community clean-up organizer', xp: '+30' },
            { name: 'Fatima A.', message: 'Youth mentorship program', xp: '+20' },
          ].map((honor, index) => (
            <View key={index} style={styles.honorItem}>
              <Text style={styles.honorName}>{honor.name}</Text>
              <Text style={styles.honorMessage}>{honor.message}</Text>
              <Text style={styles.honorXp}>{honor.xp}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'youth':
        return <YouthHubScreen />;
      case 'community':
        return <CommunityScreen />;
      case 'politics':
        return (
          <NavigationContainer>
            <PoliticalArchiveStack />
          </NavigationContainer>
        );
      case 'learn':
        return (
          <NavigationContainer>
            <LearningStack />
          </NavigationContainer>
        );
      case 'profile':
        return <ProfileScreen />;
      default:
        return renderHomeContent();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Main Content with Scrollable Header */}
      {renderTabContent()}

      {/* Speed Dial - Only show on Community tab */}
      {activeTab === 'community' && showSpeedDial && (
        <Animated.View 
          style={[
            styles.speedDial,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {speedDialItems.map((item, index) => (
            <Animated.View
              key={item.type}
              style={[
                styles.speedDialItem,
                {
                  transform: [{ translateY: slideAnim }],
                  opacity: fadeAnim,
                }
              ]}
            >
              <Text style={styles.speedDialLabel}>{item.label}</Text>
              <TouchableOpacity
                style={[styles.speedDialButton, { backgroundColor: item.color }]}
                onPress={() => handleContentTypeSelect(item.type)}
              >
                <Text style={styles.speedDialButtonText}>{item.icon}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      )}

      {/* Floating Action Button - Only show on Community tab */}
      {activeTab === 'community' && (
        <TouchableOpacity 
          style={[styles.floatingAction, showSpeedDial && styles.floatingActionActive]} 
          onPress={toggleSpeedDial}
        >
          <Text style={styles.floatingActionIcon}>
            {showSpeedDial ? '✕' : '✏️'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.navItem, activeTab === tab.id && styles.navItemActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.navIcon, activeTab === tab.id && styles.navIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.navLabel, activeTab === tab.id && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Creator Modal */}
      <ContentCreatorModal
        isVisible={showContentModal}
        onClose={closeContentModal}
        contentType={selectedContentType}
        user={user}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
  },
  notifications: {
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  notificationIcon: {
    fontSize: 18,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4757',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    marginBottom: 25,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  featuredSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  featuredMain: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featuredImage: {
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredImageText: {
    fontSize: 16,
    color: '#666',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  featuredName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  featuredDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredStats: {
    flexDirection: 'row',
    gap: 20,
  },
  featuredStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredStatIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  featuredStatText: {
    fontSize: 12,
    color: '#666',
  },
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featuredItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredItemIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featuredItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featuredItemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  featuredItemStats: {
    fontSize: 11,
    color: '#999',
  },
  quickActionsSection: {
    marginBottom: 25,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionIconText: {
    fontSize: 20,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  recentActivitySection: {
    marginBottom: 25,
  },
  recentActivityGrid: {
    gap: 10,
  },
  recentActivityItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activityIconText: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 11,
    color: '#666',
  },
  activityDate: {
    fontSize: 10,
    color: '#999',
    marginLeft: 10,
  },
  challengeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  challengeXp: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  challengeProgress: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 12,
  },
  challengeProgressFill: {
    height: '100%',
    width: '66%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  challengeStatText: {
    fontSize: 12,
    color: '#666',
  },
  honorSection: {
    marginBottom: 100,
  },
  honorGrid: {
    gap: 10,
  },
  honorItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  honorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  honorMessage: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  honorXp: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  floatingAction: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: '#FFD700',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingActionActive: {
    backgroundColor: '#FF6B6B',
    transform: [{ rotate: '45deg' }],
  },
  floatingActionIcon: {
    fontSize: 24,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  navItemActive: {
    // Active state styling
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 8,
    color: '#666',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#FFD700',
    fontWeight: '600',
  },
  speedDial: {
    position: 'absolute',
    bottom: 170,
    right: 20,
    alignItems: 'flex-end',
  },
  speedDialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  speedDialLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 12,
    maxWidth: 80,
    textAlign: 'center',
  },
  speedDialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  speedDialButtonText: {
    fontSize: 20,
    color: 'white',
  },
});
export default MainApp;

