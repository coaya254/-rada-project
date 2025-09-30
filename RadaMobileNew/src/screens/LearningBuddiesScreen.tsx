import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import { LearningBuddy, StudyGoal } from '../types/SocialTypes';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const LearningBuddiesScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [buddies, setBuddies] = useState<LearningBuddy[]>([]);
  const [filteredBuddies, setFilteredBuddies] = useState<LearningBuddy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<LearningBuddy | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const filters = [
    { key: 'all', label: 'All Buddies', icon: 'users' },
    { key: 'online', label: 'Online Now', icon: 'circle' },
    { key: 'friends', label: 'My Friends', icon: 'heart' },
    { key: 'similar', label: 'Similar Level', icon: 'balance-scale' },
    { key: 'nearby', label: 'Nearby', icon: 'map-marker' },
  ];

  useEffect(() => {
    loadBuddies();
    animateIn();
  }, []);

  useEffect(() => {
    filterBuddies();
  }, [buddies, searchQuery, selectedFilter]);

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

  const loadBuddies = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with API call
      const mockBuddies: LearningBuddy[] = [
        {
          id: '1',
          userId: 'user1',
          username: 'LegalEagle',
          avatar: '👨‍⚖️',
          level: 8,
          xp: 1250,
          completedModules: 12,
          badges: ['Constitution Scholar', 'Quiz Master', 'Study Streak'],
          lastActive: '2024-01-20T10:30:00Z',
          isOnline: true,
          mutualGroups: 3,
          studyStreak: 15,
          isFriend: true,
          isBlocked: false,
        },
        {
          id: '2',
          userId: 'user2',
          username: 'CivicLeader',
          avatar: '👩‍💼',
          level: 6,
          xp: 890,
          completedModules: 8,
          badges: ['Civic Champion', 'Discussion Leader'],
          lastActive: '2024-01-19T15:45:00Z',
          isOnline: false,
          mutualGroups: 2,
          studyStreak: 8,
          isFriend: false,
          isBlocked: false,
        },
        {
          id: '3',
          userId: 'user3',
          username: 'RightsAdvocate',
          avatar: '👨‍🎓',
          level: 9,
          xp: 1680,
          completedModules: 15,
          badges: ['Rights Expert', 'Mentor', 'Top Contributor'],
          lastActive: '2024-01-20T08:15:00Z',
          isOnline: true,
          mutualGroups: 4,
          studyStreak: 22,
          isFriend: true,
          isBlocked: false,
        },
        {
          id: '4',
          userId: 'user4',
          username: 'StudyBuddy',
          avatar: '👩‍🎓',
          level: 5,
          xp: 650,
          completedModules: 6,
          badges: ['Quick Learner', 'Team Player'],
          lastActive: '2024-01-18T14:20:00Z',
          isOnline: false,
          mutualGroups: 1,
          studyStreak: 5,
          isFriend: false,
          isBlocked: false,
        },
        {
          id: '5',
          userId: 'user5',
          username: 'ConstitutionGuru',
          avatar: '👨‍🏫',
          level: 10,
          xp: 2100,
          completedModules: 18,
          badges: ['Constitution Master', 'Expert Mentor', 'Legendary Scholar'],
          lastActive: '2024-01-20T12:00:00Z',
          isOnline: true,
          mutualGroups: 2,
          studyStreak: 30,
          isFriend: false,
          isBlocked: false,
        },
      ];
      
      setBuddies(mockBuddies);
    } catch (error) {
      console.error('Error loading buddies:', error);
      Alert.alert('Error', 'Failed to load learning buddies');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBuddies();
    setRefreshing(false);
  };

  const filterBuddies = () => {
    let filtered = [...buddies];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(buddy =>
        buddy.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'online':
        filtered = filtered.filter(buddy => buddy.isOnline);
        break;
      case 'friends':
        filtered = filtered.filter(buddy => buddy.isFriend);
        break;
      case 'similar':
        // Filter by similar level (±2 levels)
        const userLevel = 7; // Mock user level
        filtered = filtered.filter(buddy => 
          Math.abs(buddy.level - userLevel) <= 2
        );
        break;
      case 'nearby':
        // Mock nearby filter - in real app, would use location
        filtered = filtered.slice(0, 3);
        break;
      default:
        break;
    }

    setFilteredBuddies(filtered);
  };

  const handleAddFriend = async (buddyId: string) => {
    try {
      // API call to add friend
      // await apiService.addFriend(buddyId);
      
      setBuddies(prev => prev.map(buddy => 
        buddy.id === buddyId 
          ? { ...buddy, isFriend: true }
          : buddy
      ));
      
      Alert.alert('Success', 'Friend request sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const handleRemoveFriend = async (buddyId: string) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // API call to remove friend
              // await apiService.removeFriend(buddyId);
              
              setBuddies(prev => prev.map(buddy => 
                buddy.id === buddyId 
                  ? { ...buddy, isFriend: false }
                  : buddy
              ));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove friend');
            }
          },
        },
      ]
    );
  };

  const handleViewProfile = (buddy: LearningBuddy) => {
    setSelectedBuddy(buddy);
    setShowProfileModal(true);
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getLevelColor = (level: number) => {
    if (level >= 8) return '#10b981';
    if (level >= 5) return '#3b82f6';
    if (level >= 3) return '#f59e0b';
    return '#64748b';
  };

  const renderBuddyCard = (buddy: LearningBuddy) => (
    <Animated.View
      key={buddy.id}
      style={[styles.buddyCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity
        onPress={() => handleViewProfile(buddy)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.cardGradient}
        >
          {/* Buddy Header */}
          <View style={styles.buddyHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{buddy.avatar}</Text>
              {buddy.isOnline && (
                <View style={styles.onlineIndicator} />
              )}
            </View>
            <View style={styles.buddyInfo}>
              <Text style={styles.buddyName}>{buddy.username}</Text>
              <View style={styles.levelContainer}>
                <View style={[styles.levelBadge, { backgroundColor: getLevelColor(buddy.level) }]}>
                  <Text style={styles.levelText}>Level {buddy.level}</Text>
                </View>
                <Text style={styles.xpText}>{buddy.xp} XP</Text>
              </View>
            </View>
            <View style={styles.buddyActions}>
              {buddy.isFriend ? (
                <TouchableOpacity
                  style={styles.friendButton}
                  onPress={() => handleRemoveFriend(buddy.id)}
                >
                  <Icon name="heart" size={16} color="#ef4444" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddFriend(buddy.id)}
                >
                  <Icon name="plus" size={16} color="#10b981" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Buddy Stats */}
          <View style={styles.buddyStats}>
            <View style={styles.statItem}>
              <Icon name="book" size={14} color="#64748b" />
              <Text style={styles.statText}>{buddy.completedModules} modules</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="fire" size={14} color="#f59e0b" />
              <Text style={styles.statText}>{buddy.studyStreak} day streak</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="users" size={14} color="#3b82f6" />
              <Text style={styles.statText}>{buddy.mutualGroups} groups</Text>
            </View>
          </View>

          {/* Recent Badges */}
          <View style={styles.badgesContainer}>
            <Text style={styles.badgesLabel}>Recent Badges:</Text>
            <View style={styles.badgesList}>
              {buddy.badges.slice(0, 3).map((badge, index) => (
                <View key={index} style={styles.badge}>
                  <Text style={styles.badgeText}>🏆 {badge}</Text>
                </View>
              ))}
              {buddy.badges.length > 3 && (
                <Text style={styles.moreBadgesText}>+{buddy.badges.length - 3} more</Text>
              )}
            </View>
          </View>

          {/* Last Active */}
          <View style={styles.lastActiveContainer}>
            <Icon name="clock-o" size={12} color="#94a3b8" />
            <Text style={styles.lastActiveText}>
              {buddy.isOnline ? 'Online now' : `Last active ${formatLastActive(buddy.lastActive)}`}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderProfileModal = () => (
    <Modal
      visible={showProfileModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowProfileModal(false)}>
            <Text style={styles.modalCancelText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Profile</Text>
          <View style={styles.modalSpacer} />
        </View>
        
        {selectedBuddy && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileAvatar}>{selectedBuddy.avatar}</Text>
              <Text style={styles.profileName}>{selectedBuddy.username}</Text>
              <View style={[styles.profileLevel, { backgroundColor: getLevelColor(selectedBuddy.level) }]}>
                <Text style={styles.profileLevelText}>Level {selectedBuddy.level}</Text>
              </View>
            </View>

            <View style={styles.profileStats}>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{selectedBuddy.xp}</Text>
                <Text style={styles.profileStatLabel}>Total XP</Text>
              </View>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{selectedBuddy.completedModules}</Text>
                <Text style={styles.profileStatLabel}>Modules</Text>
              </View>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{selectedBuddy.studyStreak}</Text>
                <Text style={styles.profileStatLabel}>Day Streak</Text>
              </View>
            </View>

            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>All Badges</Text>
              <View style={styles.allBadgesList}>
                {selectedBuddy.badges.map((badge, index) => (
                  <View key={index} style={styles.profileBadge}>
                    <Text style={styles.profileBadgeText}>🏆 {badge}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.profileActions}>
              {selectedBuddy.isFriend ? (
                <TouchableOpacity
                  style={styles.removeFriendButton}
                  onPress={() => {
                    handleRemoveFriend(selectedBuddy.id);
                    setShowProfileModal(false);
                  }}
                >
                  <Icon name="heart-broken" size={16} color="white" />
                  <Text style={styles.removeFriendButtonText}>Remove Friend</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.addFriendButton}
                  onPress={() => {
                    handleAddFriend(selectedBuddy.id);
                    setShowProfileModal(false);
                  }}
                >
                  <Icon name="user-plus" size={16} color="white" />
                  <Text style={styles.addFriendButtonText}>Add Friend</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading learning buddies...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning Buddies</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={16} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by username..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748b"
          />
        </View>
      </View>

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
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Buddies List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        {filteredBuddies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="users" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No buddies found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? 'Try adjusting your search terms' : 'No learning buddies match your current filters'}
            </Text>
          </View>
        ) : (
          filteredBuddies.map(renderBuddyCard)
        )}
      </ScrollView>

      {renderProfileModal()}
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
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  buddyCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 16,
  },
  buddyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 32,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: 'white',
  },
  buddyInfo: {
    flex: 1,
  },
  buddyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  levelText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  xpText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  buddyActions: {
    alignItems: 'center',
  },
  friendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
  },
  buddyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748b',
  },
  badgesContainer: {
    marginBottom: 12,
  },
  badgesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  badgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  moreBadgesText: {
    fontSize: 12,
    color: '#64748b',
    alignSelf: 'center',
  },
  lastActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastActiveText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#94a3b8',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalSpacer: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    fontSize: 64,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  profileLevel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileLevelText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  profileStatLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  profileSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  allBadgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  profileBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  profileBadgeText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  profileActions: {
    marginTop: 20,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
  },
  addFriendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  removeFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
  },
  removeFriendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default LearningBuddiesScreen;

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import { LearningBuddy, StudyGoal } from '../types/SocialTypes';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const LearningBuddiesScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [buddies, setBuddies] = useState<LearningBuddy[]>([]);
  const [filteredBuddies, setFilteredBuddies] = useState<LearningBuddy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<LearningBuddy | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const filters = [
    { key: 'all', label: 'All Buddies', icon: 'users' },
    { key: 'online', label: 'Online Now', icon: 'circle' },
    { key: 'friends', label: 'My Friends', icon: 'heart' },
    { key: 'similar', label: 'Similar Level', icon: 'balance-scale' },
    { key: 'nearby', label: 'Nearby', icon: 'map-marker' },
  ];

  useEffect(() => {
    loadBuddies();
    animateIn();
  }, []);

  useEffect(() => {
    filterBuddies();
  }, [buddies, searchQuery, selectedFilter]);

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

  const loadBuddies = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with API call
      const mockBuddies: LearningBuddy[] = [
        {
          id: '1',
          userId: 'user1',
          username: 'LegalEagle',
          avatar: '👨‍⚖️',
          level: 8,
          xp: 1250,
          completedModules: 12,
          badges: ['Constitution Scholar', 'Quiz Master', 'Study Streak'],
          lastActive: '2024-01-20T10:30:00Z',
          isOnline: true,
          mutualGroups: 3,
          studyStreak: 15,
          isFriend: true,
          isBlocked: false,
        },
        {
          id: '2',
          userId: 'user2',
          username: 'CivicLeader',
          avatar: '👩‍💼',
          level: 6,
          xp: 890,
          completedModules: 8,
          badges: ['Civic Champion', 'Discussion Leader'],
          lastActive: '2024-01-19T15:45:00Z',
          isOnline: false,
          mutualGroups: 2,
          studyStreak: 8,
          isFriend: false,
          isBlocked: false,
        },
        {
          id: '3',
          userId: 'user3',
          username: 'RightsAdvocate',
          avatar: '👨‍🎓',
          level: 9,
          xp: 1680,
          completedModules: 15,
          badges: ['Rights Expert', 'Mentor', 'Top Contributor'],
          lastActive: '2024-01-20T08:15:00Z',
          isOnline: true,
          mutualGroups: 4,
          studyStreak: 22,
          isFriend: true,
          isBlocked: false,
        },
        {
          id: '4',
          userId: 'user4',
          username: 'StudyBuddy',
          avatar: '👩‍🎓',
          level: 5,
          xp: 650,
          completedModules: 6,
          badges: ['Quick Learner', 'Team Player'],
          lastActive: '2024-01-18T14:20:00Z',
          isOnline: false,
          mutualGroups: 1,
          studyStreak: 5,
          isFriend: false,
          isBlocked: false,
        },
        {
          id: '5',
          userId: 'user5',
          username: 'ConstitutionGuru',
          avatar: '👨‍🏫',
          level: 10,
          xp: 2100,
          completedModules: 18,
          badges: ['Constitution Master', 'Expert Mentor', 'Legendary Scholar'],
          lastActive: '2024-01-20T12:00:00Z',
          isOnline: true,
          mutualGroups: 2,
          studyStreak: 30,
          isFriend: false,
          isBlocked: false,
        },
      ];
      
      setBuddies(mockBuddies);
    } catch (error) {
      console.error('Error loading buddies:', error);
      Alert.alert('Error', 'Failed to load learning buddies');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBuddies();
    setRefreshing(false);
  };

  const filterBuddies = () => {
    let filtered = [...buddies];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(buddy =>
        buddy.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'online':
        filtered = filtered.filter(buddy => buddy.isOnline);
        break;
      case 'friends':
        filtered = filtered.filter(buddy => buddy.isFriend);
        break;
      case 'similar':
        // Filter by similar level (±2 levels)
        const userLevel = 7; // Mock user level
        filtered = filtered.filter(buddy => 
          Math.abs(buddy.level - userLevel) <= 2
        );
        break;
      case 'nearby':
        // Mock nearby filter - in real app, would use location
        filtered = filtered.slice(0, 3);
        break;
      default:
        break;
    }

    setFilteredBuddies(filtered);
  };

  const handleAddFriend = async (buddyId: string) => {
    try {
      // API call to add friend
      // await apiService.addFriend(buddyId);
      
      setBuddies(prev => prev.map(buddy => 
        buddy.id === buddyId 
          ? { ...buddy, isFriend: true }
          : buddy
      ));
      
      Alert.alert('Success', 'Friend request sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const handleRemoveFriend = async (buddyId: string) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // API call to remove friend
              // await apiService.removeFriend(buddyId);
              
              setBuddies(prev => prev.map(buddy => 
                buddy.id === buddyId 
                  ? { ...buddy, isFriend: false }
                  : buddy
              ));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove friend');
            }
          },
        },
      ]
    );
  };

  const handleViewProfile = (buddy: LearningBuddy) => {
    setSelectedBuddy(buddy);
    setShowProfileModal(true);
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getLevelColor = (level: number) => {
    if (level >= 8) return '#10b981';
    if (level >= 5) return '#3b82f6';
    if (level >= 3) return '#f59e0b';
    return '#64748b';
  };

  const renderBuddyCard = (buddy: LearningBuddy) => (
    <Animated.View
      key={buddy.id}
      style={[styles.buddyCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity
        onPress={() => handleViewProfile(buddy)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.cardGradient}
        >
          {/* Buddy Header */}
          <View style={styles.buddyHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{buddy.avatar}</Text>
              {buddy.isOnline && (
                <View style={styles.onlineIndicator} />
              )}
            </View>
            <View style={styles.buddyInfo}>
              <Text style={styles.buddyName}>{buddy.username}</Text>
              <View style={styles.levelContainer}>
                <View style={[styles.levelBadge, { backgroundColor: getLevelColor(buddy.level) }]}>
                  <Text style={styles.levelText}>Level {buddy.level}</Text>
                </View>
                <Text style={styles.xpText}>{buddy.xp} XP</Text>
              </View>
            </View>
            <View style={styles.buddyActions}>
              {buddy.isFriend ? (
                <TouchableOpacity
                  style={styles.friendButton}
                  onPress={() => handleRemoveFriend(buddy.id)}
                >
                  <Icon name="heart" size={16} color="#ef4444" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddFriend(buddy.id)}
                >
                  <Icon name="plus" size={16} color="#10b981" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Buddy Stats */}
          <View style={styles.buddyStats}>
            <View style={styles.statItem}>
              <Icon name="book" size={14} color="#64748b" />
              <Text style={styles.statText}>{buddy.completedModules} modules</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="fire" size={14} color="#f59e0b" />
              <Text style={styles.statText}>{buddy.studyStreak} day streak</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="users" size={14} color="#3b82f6" />
              <Text style={styles.statText}>{buddy.mutualGroups} groups</Text>
            </View>
          </View>

          {/* Recent Badges */}
          <View style={styles.badgesContainer}>
            <Text style={styles.badgesLabel}>Recent Badges:</Text>
            <View style={styles.badgesList}>
              {buddy.badges.slice(0, 3).map((badge, index) => (
                <View key={index} style={styles.badge}>
                  <Text style={styles.badgeText}>🏆 {badge}</Text>
                </View>
              ))}
              {buddy.badges.length > 3 && (
                <Text style={styles.moreBadgesText}>+{buddy.badges.length - 3} more</Text>
              )}
            </View>
          </View>

          {/* Last Active */}
          <View style={styles.lastActiveContainer}>
            <Icon name="clock-o" size={12} color="#94a3b8" />
            <Text style={styles.lastActiveText}>
              {buddy.isOnline ? 'Online now' : `Last active ${formatLastActive(buddy.lastActive)}`}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderProfileModal = () => (
    <Modal
      visible={showProfileModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowProfileModal(false)}>
            <Text style={styles.modalCancelText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Profile</Text>
          <View style={styles.modalSpacer} />
        </View>
        
        {selectedBuddy && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileAvatar}>{selectedBuddy.avatar}</Text>
              <Text style={styles.profileName}>{selectedBuddy.username}</Text>
              <View style={[styles.profileLevel, { backgroundColor: getLevelColor(selectedBuddy.level) }]}>
                <Text style={styles.profileLevelText}>Level {selectedBuddy.level}</Text>
              </View>
            </View>

            <View style={styles.profileStats}>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{selectedBuddy.xp}</Text>
                <Text style={styles.profileStatLabel}>Total XP</Text>
              </View>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{selectedBuddy.completedModules}</Text>
                <Text style={styles.profileStatLabel}>Modules</Text>
              </View>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{selectedBuddy.studyStreak}</Text>
                <Text style={styles.profileStatLabel}>Day Streak</Text>
              </View>
            </View>

            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>All Badges</Text>
              <View style={styles.allBadgesList}>
                {selectedBuddy.badges.map((badge, index) => (
                  <View key={index} style={styles.profileBadge}>
                    <Text style={styles.profileBadgeText}>🏆 {badge}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.profileActions}>
              {selectedBuddy.isFriend ? (
                <TouchableOpacity
                  style={styles.removeFriendButton}
                  onPress={() => {
                    handleRemoveFriend(selectedBuddy.id);
                    setShowProfileModal(false);
                  }}
                >
                  <Icon name="heart-broken" size={16} color="white" />
                  <Text style={styles.removeFriendButtonText}>Remove Friend</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.addFriendButton}
                  onPress={() => {
                    handleAddFriend(selectedBuddy.id);
                    setShowProfileModal(false);
                  }}
                >
                  <Icon name="user-plus" size={16} color="white" />
                  <Text style={styles.addFriendButtonText}>Add Friend</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading learning buddies...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning Buddies</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={16} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by username..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748b"
          />
        </View>
      </View>

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
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Buddies List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        {filteredBuddies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="users" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No buddies found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? 'Try adjusting your search terms' : 'No learning buddies match your current filters'}
            </Text>
          </View>
        ) : (
          filteredBuddies.map(renderBuddyCard)
        )}
      </ScrollView>

      {renderProfileModal()}
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
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  buddyCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 16,
  },
  buddyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 32,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: 'white',
  },
  buddyInfo: {
    flex: 1,
  },
  buddyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  levelText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  xpText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  buddyActions: {
    alignItems: 'center',
  },
  friendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
  },
  buddyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748b',
  },
  badgesContainer: {
    marginBottom: 12,
  },
  badgesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  badgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  moreBadgesText: {
    fontSize: 12,
    color: '#64748b',
    alignSelf: 'center',
  },
  lastActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastActiveText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#94a3b8',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalSpacer: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    fontSize: 64,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  profileLevel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileLevelText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  profileStatLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  profileSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  allBadgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  profileBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  profileBadgeText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  profileActions: {
    marginTop: 20,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
  },
  addFriendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  removeFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
  },
  removeFriendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default LearningBuddiesScreen;
