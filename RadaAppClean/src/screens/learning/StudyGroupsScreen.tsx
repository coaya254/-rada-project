import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';

interface StudyGroupsScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'StudyGroups'>;
}

interface StudyGroup {
  id: number;
  name: string;
  description: string;
  topic: string;
  memberCount: number;
  maxMembers: number;
  isJoined: boolean;
  meetingSchedule: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  lastActivity: string;
  groupLeader: {
    name: string;
    avatar: string;
  };
}

interface MyGroup {
  id: number;
  name: string;
  nextMeeting: string;
  progress: number;
  newMessages: number;
}

export const StudyGroupsScreen: React.FC<StudyGroupsScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'discover' | 'my-groups'>('discover');

  const [myGroups] = useState<MyGroup[]>([
    {
      id: 1,
      name: 'Constitutional Law Study Circle',
      nextMeeting: 'Tomorrow, 3:00 PM',
      progress: 75,
      newMessages: 5,
    },
    {
      id: 2,
      name: 'Electoral Process Deep Dive',
      nextMeeting: 'Friday, 7:00 PM',
      progress: 60,
      newMessages: 2,
    },
    {
      id: 3,
      name: 'Political Theory Discussion',
      nextMeeting: 'Next Monday, 6:00 PM',
      progress: 85,
      newMessages: 0,
    },
  ]);

  const [availableGroups] = useState<StudyGroup[]>([
    {
      id: 4,
      name: 'Kenyan Government Structure',
      description: 'Learn about the three branches of government and their functions',
      topic: 'Government',
      memberCount: 15,
      maxMembers: 20,
      isJoined: false,
      meetingSchedule: 'Tuesdays & Thursdays, 6:00 PM',
      difficulty: 'Beginner',
      tags: ['Government', 'Constitution', 'Civics'],
      lastActivity: '2h ago',
      groupLeader: { name: 'Dr. Sarah Kimani', avatar: 'SK' },
    },
    {
      id: 5,
      name: 'Electoral Systems Worldwide',
      description: 'Comparative study of different electoral systems and their effectiveness',
      topic: 'Elections',
      memberCount: 8,
      maxMembers: 12,
      isJoined: false,
      meetingSchedule: 'Saturdays, 2:00 PM',
      difficulty: 'Advanced',
      tags: ['Elections', 'Democracy', 'Comparative Politics'],
      lastActivity: '1d ago',
      groupLeader: { name: 'Prof. John Mutua', avatar: 'JM' },
    },
    {
      id: 6,
      name: 'Human Rights & Civil Liberties',
      description: 'Understanding fundamental rights and their protection mechanisms',
      topic: 'Rights',
      memberCount: 12,
      maxMembers: 15,
      isJoined: false,
      meetingSchedule: 'Wednesdays, 7:00 PM',
      difficulty: 'Intermediate',
      tags: ['Human Rights', 'Constitution', 'Law'],
      lastActivity: '3h ago',
      groupLeader: { name: 'Ms. Grace Wanjiku', avatar: 'GW' },
    },
    {
      id: 7,
      name: 'Local Government & Community',
      description: 'How local government works and how citizens can get involved',
      topic: 'Local Government',
      memberCount: 6,
      maxMembers: 10,
      isJoined: false,
      meetingSchedule: 'Sundays, 4:00 PM',
      difficulty: 'Beginner',
      tags: ['Local Government', 'Community', 'Participation'],
      lastActivity: '5h ago',
      groupLeader: { name: 'Mr. David Ochieng', avatar: 'DO' },
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleJoinGroup = (groupId: number) => {
    Alert.alert(
      'Join Study Group',
      'Are you sure you want to join this study group?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: () => console.log('Joined group:', groupId) },
      ]
    );
  };

  const handleCreateGroup = () => {
    Alert.alert(
      'Create Study Group',
      'Feature coming soon! You will be able to create your own study groups.',
      [{ text: 'OK' }]
    );
  };

  const getFilteredGroups = () => {
    if (!searchQuery.trim()) return availableGroups;
    return availableGroups.filter(group =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const renderMyGroup = ({ item }: { item: MyGroup }) => (
    <TouchableOpacity style={styles.myGroupCard}>
      <View style={styles.myGroupHeader}>
        <Text style={styles.myGroupName}>{item.name}</Text>
        {item.newMessages > 0 && (
          <View style={styles.messageBadge}>
            <Text style={styles.messageBadgeText}>{item.newMessages}</Text>
          </View>
        )}
      </View>

      <View style={styles.myGroupInfo}>
        <View style={styles.myGroupMeeting}>
          <MaterialIcons name="schedule" size={16} color="#666" />
          <Text style={styles.myGroupMeetingText}>{item.nextMeeting}</Text>
        </View>
        <Text style={styles.myGroupProgress}>{item.progress}% complete</Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
        </View>
      </View>

      <View style={styles.myGroupActions}>
        <TouchableOpacity style={styles.groupActionButton}>
          <MaterialIcons name="chat" size={16} color="#3B82F6" />
          <Text style={styles.groupActionText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.groupActionButton}>
          <MaterialIcons name="library-books" size={16} color="#10B981" />
          <Text style={styles.groupActionText}>Materials</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.groupActionButton}>
          <MaterialIcons name="video-call" size={16} color="#8B5CF6" />
          <Text style={styles.groupActionText}>Join Meeting</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderAvailableGroup = ({ item }: { item: StudyGroup }) => (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.groupTitleSection}>
          <Text style={styles.groupName}>{item.name}</Text>
          <View style={styles.groupMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
            <Text style={styles.memberCount}>{item.memberCount}/{item.maxMembers} members</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.joinButton, item.memberCount >= item.maxMembers && styles.joinButtonDisabled]}
          onPress={() => handleJoinGroup(item.id)}
          disabled={item.memberCount >= item.maxMembers}
        >
          <Text style={[styles.joinButtonText, item.memberCount >= item.maxMembers && styles.joinButtonTextDisabled]}>
            {item.memberCount >= item.maxMembers ? 'Full' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.groupDescription}>{item.description}</Text>

      <View style={styles.groupDetails}>
        <View style={styles.detailItem}>
          <MaterialIcons name="schedule" size={16} color="#666" />
          <Text style={styles.detailText}>{item.meetingSchedule}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="person" size={16} color="#666" />
          <Text style={styles.detailText}>Led by {item.groupLeader.name}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="access-time" size={16} color="#666" />
          <Text style={styles.detailText}>Active {item.lastActivity}</Text>
        </View>
      </View>

      <View style={styles.tagsContainer}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Study Groups</Text>
          <Text style={styles.headerSubtitle}>Learn together with peers</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
          <MaterialIcons name="add" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'discover' && styles.activeTab]}
          onPress={() => setSelectedTab('discover')}
        >
          <Text style={[styles.tabText, selectedTab === 'discover' && styles.activeTabText]}>
            Discover Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'my-groups' && styles.activeTab]}
          onPress={() => setSelectedTab('my-groups')}
        >
          <Text style={[styles.tabText, selectedTab === 'my-groups' && styles.activeTabText]}>
            My Groups ({myGroups.length})
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'discover' && (
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search study groups by topic, tags..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      )}

      <FlatList
        data={selectedTab === 'my-groups' ? myGroups : getFilteredGroups()}
        renderItem={selectedTab === 'my-groups' ? renderMyGroup : renderAvailableGroup}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          selectedTab === 'discover' && (
            <View style={styles.discoverHeader}>
              <Text style={styles.discoverTitle}>
                {getFilteredGroups().length} study groups available
              </Text>
              <Text style={styles.discoverSubtitle}>
                Join groups to learn with others and share knowledge
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  discoverHeader: {
    marginBottom: 16,
  },
  discoverTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  discoverSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  myGroupCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  myGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  myGroupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  messageBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  messageBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  myGroupInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  myGroupMeeting: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  myGroupMeetingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  myGroupProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  myGroupActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  groupActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 4,
  },
  groupActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  groupCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  memberCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  joinButtonTextDisabled: {
    color: '#666',
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  groupDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});