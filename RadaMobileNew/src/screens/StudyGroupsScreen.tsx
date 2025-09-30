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
import { StudyGroup, StudyChallenge } from '../types/SocialTypes';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const StudyGroupsScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const filters = [
    { key: 'all', label: 'All Groups', icon: 'globe' },
    { key: 'joined', label: 'My Groups', icon: 'users' },
    { key: 'public', label: 'Public', icon: 'unlock' },
    { key: 'popular', label: 'Popular', icon: 'fire' },
  ];

  useEffect(() => {
    loadStudyGroups();
    animateIn();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [groups, searchQuery, selectedFilter]);

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

  const loadStudyGroups = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with API call
      const mockGroups: StudyGroup[] = [
        {
          id: '1',
          name: 'Constitution Study Circle',
          description: 'Deep dive into constitutional law and governance principles',
          moduleId: 1,
          moduleTitle: 'Constitution Basics',
          createdBy: 'user1',
          createdByUsername: 'LegalEagle',
          createdAt: '2024-01-15T10:00:00Z',
          memberCount: 24,
          maxMembers: 30,
          isPrivate: false,
          tags: ['constitution', 'law', 'governance'],
          avatar: '📚',
          recentActivity: '2 hours ago',
          isJoined: true,
          isOwner: false,
        },
        {
          id: '2',
          name: 'Civic Engagement Hub',
          description: 'Discussing ways to participate in democratic processes',
          moduleId: 2,
          moduleTitle: 'Civic Participation',
          createdBy: 'user2',
          createdByUsername: 'CivicLeader',
          createdAt: '2024-01-10T14:30:00Z',
          memberCount: 18,
          maxMembers: 25,
          isPrivate: false,
          tags: ['civic', 'democracy', 'participation'],
          avatar: '🗳️',
          recentActivity: '1 day ago',
          isJoined: false,
          isOwner: false,
        },
        {
          id: '3',
          name: 'Rights & Responsibilities',
          description: 'Exploring fundamental rights and civic duties',
          moduleId: 3,
          moduleTitle: 'Rights and Responsibilities',
          createdBy: user?.uuid || 'user3',
          createdByUsername: user?.username || 'You',
          createdAt: '2024-01-20T09:15:00Z',
          memberCount: 12,
          maxMembers: 20,
          isPrivate: true,
          tags: ['rights', 'duties', 'citizenship'],
          avatar: '⚖️',
          recentActivity: '3 hours ago',
          isJoined: true,
          isOwner: true,
        },
      ];
      
      setGroups(mockGroups);
    } catch (error) {
      console.error('Error loading study groups:', error);
      Alert.alert('Error', 'Failed to load study groups');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudyGroups();
    setRefreshing(false);
  };

  const filterGroups = () => {
    let filtered = [...groups];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'joined':
        filtered = filtered.filter(group => group.isJoined);
        break;
      case 'public':
        filtered = filtered.filter(group => !group.isPrivate);
        break;
      case 'popular':
        filtered = filtered.sort((a, b) => b.memberCount - a.memberCount);
        break;
      default:
        break;
    }

    setFilteredGroups(filtered);
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      // API call to join group
      // await apiService.joinStudyGroup(groupId);
      
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, isJoined: true, memberCount: group.memberCount + 1 }
          : group
      ));
      
      Alert.alert('Success', 'You have joined the study group!');
    } catch (error) {
      Alert.alert('Error', 'Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this study group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              // API call to leave group
              // await apiService.leaveStudyGroup(groupId);
              
              setGroups(prev => prev.map(group => 
                group.id === groupId 
                  ? { ...group, isJoined: false, memberCount: group.memberCount - 1 }
                  : group
              ));
            } catch (error) {
              Alert.alert('Error', 'Failed to leave group');
            }
          },
        },
      ]
    );
  };

  const renderGroupCard = (group: StudyGroup) => (
    <Animated.View
      key={group.id}
      style={[styles.groupCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.cardGradient}
        >
          {/* Group Header */}
          <View style={styles.groupHeader}>
            <View style={styles.groupAvatar}>
              <Text style={styles.avatarText}>{group.avatar}</Text>
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupModule}>{group.moduleTitle}</Text>
            </View>
            <View style={styles.groupActions}>
              {group.isPrivate && (
                <Icon name="lock" size={14} color="#64748b" />
              )}
              {group.isOwner && (
                <Icon name="crown" size={14} color="#f59e0b" />
              )}
            </View>
          </View>

          {/* Group Description */}
          <Text style={styles.groupDescription} numberOfLines={2}>
            {group.description}
          </Text>

          {/* Group Tags */}
          <View style={styles.tagsContainer}>
            {group.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {group.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{group.tags.length - 3} more</Text>
            )}
          </View>

          {/* Group Stats */}
          <View style={styles.groupStats}>
            <View style={styles.statItem}>
              <Icon name="users" size={14} color="#64748b" />
              <Text style={styles.statText}>{group.memberCount}/{group.maxMembers}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="clock-o" size={14} color="#64748b" />
              <Text style={styles.statText}>{group.recentActivity}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="user" size={14} color="#64748b" />
              <Text style={styles.statText}>{group.createdByUsername}</Text>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.cardActions}>
            {group.isJoined ? (
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={() => handleLeaveGroup(group.id)}
              >
                <Icon name="sign-out" size={16} color="#ef4444" />
                <Text style={styles.leaveButtonText}>Leave</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => handleJoinGroup(group.id)}
              >
                <Icon name="plus" size={16} color="#ffffff" />
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCreateGroupModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Study Group</Text>
          <TouchableOpacity>
            <Text style={styles.modalCreateText}>Create</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalSubtitle}>Coming Soon!</Text>
          <Text style={styles.modalDescription}>
            Group creation features will be available in the next update.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading study groups...</Text>
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
        <Text style={styles.headerTitle}>Study Groups</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addButton}>
          <Icon name="plus" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={16} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups, topics, or modules..."
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

      {/* Groups List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        {filteredGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="users" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No groups found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a study group!'}
            </Text>
          </View>
        ) : (
          filteredGroups.map(renderGroupCard)
        )}
      </ScrollView>

      {renderCreateGroupModal()}
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
  addButton: {
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
  groupCard: {
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
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  groupModule: {
    fontSize: 14,
    color: '#64748b',
  },
  groupActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#64748b',
    alignSelf: 'center',
  },
  groupStats: {
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
  cardActions: {
    alignItems: 'flex-end',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  leaveButtonText: {
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 6,
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
  modalCreateText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default StudyGroupsScreen;

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
import { StudyGroup, StudyChallenge } from '../types/SocialTypes';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const StudyGroupsScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const filters = [
    { key: 'all', label: 'All Groups', icon: 'globe' },
    { key: 'joined', label: 'My Groups', icon: 'users' },
    { key: 'public', label: 'Public', icon: 'unlock' },
    { key: 'popular', label: 'Popular', icon: 'fire' },
  ];

  useEffect(() => {
    loadStudyGroups();
    animateIn();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [groups, searchQuery, selectedFilter]);

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

  const loadStudyGroups = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with API call
      const mockGroups: StudyGroup[] = [
        {
          id: '1',
          name: 'Constitution Study Circle',
          description: 'Deep dive into constitutional law and governance principles',
          moduleId: 1,
          moduleTitle: 'Constitution Basics',
          createdBy: 'user1',
          createdByUsername: 'LegalEagle',
          createdAt: '2024-01-15T10:00:00Z',
          memberCount: 24,
          maxMembers: 30,
          isPrivate: false,
          tags: ['constitution', 'law', 'governance'],
          avatar: '📚',
          recentActivity: '2 hours ago',
          isJoined: true,
          isOwner: false,
        },
        {
          id: '2',
          name: 'Civic Engagement Hub',
          description: 'Discussing ways to participate in democratic processes',
          moduleId: 2,
          moduleTitle: 'Civic Participation',
          createdBy: 'user2',
          createdByUsername: 'CivicLeader',
          createdAt: '2024-01-10T14:30:00Z',
          memberCount: 18,
          maxMembers: 25,
          isPrivate: false,
          tags: ['civic', 'democracy', 'participation'],
          avatar: '🗳️',
          recentActivity: '1 day ago',
          isJoined: false,
          isOwner: false,
        },
        {
          id: '3',
          name: 'Rights & Responsibilities',
          description: 'Exploring fundamental rights and civic duties',
          moduleId: 3,
          moduleTitle: 'Rights and Responsibilities',
          createdBy: user?.uuid || 'user3',
          createdByUsername: user?.username || 'You',
          createdAt: '2024-01-20T09:15:00Z',
          memberCount: 12,
          maxMembers: 20,
          isPrivate: true,
          tags: ['rights', 'duties', 'citizenship'],
          avatar: '⚖️',
          recentActivity: '3 hours ago',
          isJoined: true,
          isOwner: true,
        },
      ];
      
      setGroups(mockGroups);
    } catch (error) {
      console.error('Error loading study groups:', error);
      Alert.alert('Error', 'Failed to load study groups');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudyGroups();
    setRefreshing(false);
  };

  const filterGroups = () => {
    let filtered = [...groups];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'joined':
        filtered = filtered.filter(group => group.isJoined);
        break;
      case 'public':
        filtered = filtered.filter(group => !group.isPrivate);
        break;
      case 'popular':
        filtered = filtered.sort((a, b) => b.memberCount - a.memberCount);
        break;
      default:
        break;
    }

    setFilteredGroups(filtered);
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      // API call to join group
      // await apiService.joinStudyGroup(groupId);
      
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, isJoined: true, memberCount: group.memberCount + 1 }
          : group
      ));
      
      Alert.alert('Success', 'You have joined the study group!');
    } catch (error) {
      Alert.alert('Error', 'Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this study group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              // API call to leave group
              // await apiService.leaveStudyGroup(groupId);
              
              setGroups(prev => prev.map(group => 
                group.id === groupId 
                  ? { ...group, isJoined: false, memberCount: group.memberCount - 1 }
                  : group
              ));
            } catch (error) {
              Alert.alert('Error', 'Failed to leave group');
            }
          },
        },
      ]
    );
  };

  const renderGroupCard = (group: StudyGroup) => (
    <Animated.View
      key={group.id}
      style={[styles.groupCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.cardGradient}
        >
          {/* Group Header */}
          <View style={styles.groupHeader}>
            <View style={styles.groupAvatar}>
              <Text style={styles.avatarText}>{group.avatar}</Text>
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupModule}>{group.moduleTitle}</Text>
            </View>
            <View style={styles.groupActions}>
              {group.isPrivate && (
                <Icon name="lock" size={14} color="#64748b" />
              )}
              {group.isOwner && (
                <Icon name="crown" size={14} color="#f59e0b" />
              )}
            </View>
          </View>

          {/* Group Description */}
          <Text style={styles.groupDescription} numberOfLines={2}>
            {group.description}
          </Text>

          {/* Group Tags */}
          <View style={styles.tagsContainer}>
            {group.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {group.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{group.tags.length - 3} more</Text>
            )}
          </View>

          {/* Group Stats */}
          <View style={styles.groupStats}>
            <View style={styles.statItem}>
              <Icon name="users" size={14} color="#64748b" />
              <Text style={styles.statText}>{group.memberCount}/{group.maxMembers}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="clock-o" size={14} color="#64748b" />
              <Text style={styles.statText}>{group.recentActivity}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="user" size={14} color="#64748b" />
              <Text style={styles.statText}>{group.createdByUsername}</Text>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.cardActions}>
            {group.isJoined ? (
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={() => handleLeaveGroup(group.id)}
              >
                <Icon name="sign-out" size={16} color="#ef4444" />
                <Text style={styles.leaveButtonText}>Leave</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => handleJoinGroup(group.id)}
              >
                <Icon name="plus" size={16} color="#ffffff" />
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCreateGroupModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Study Group</Text>
          <TouchableOpacity>
            <Text style={styles.modalCreateText}>Create</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalSubtitle}>Coming Soon!</Text>
          <Text style={styles.modalDescription}>
            Group creation features will be available in the next update.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading study groups...</Text>
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
        <Text style={styles.headerTitle}>Study Groups</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addButton}>
          <Icon name="plus" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={16} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups, topics, or modules..."
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

      {/* Groups List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        {filteredGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="users" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No groups found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a study group!'}
            </Text>
          </View>
        ) : (
          filteredGroups.map(renderGroupCard)
        )}
      </ScrollView>

      {renderCreateGroupModal()}
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
  addButton: {
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
  groupCard: {
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
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  groupModule: {
    fontSize: 14,
    color: '#64748b',
  },
  groupActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#64748b',
    alignSelf: 'center',
  },
  groupStats: {
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
  cardActions: {
    alignItems: 'flex-end',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  leaveButtonText: {
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 6,
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
  modalCreateText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default StudyGroupsScreen;
