import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { CommunityStackParamList } from '../../navigation/CommunityStackNavigator';

interface UserProfileScreenProps {
  navigation: NativeStackNavigationProp<CommunityStackParamList, 'UserProfile'>;
  route: RouteProp<CommunityStackParamList, 'UserProfile'>;
}

interface UserPost {
  id: number;
  title: string;
  content: string;
  category: string;
  timestamp: string;
  replies: number;
  likes: number;
}

interface UserBadge {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ navigation, route }) => {
  const { userId, username } = route.params;

  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'badges'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  const userStats = {
    posts: 24,
    followers: 156,
    following: 89,
    reputation: 342,
    joinDate: 'March 2023',
  };

  const userPosts: UserPost[] = [
    {
      id: 1,
      title: 'Thoughts on the new education reform bill',
      content: 'I wanted to share some insights about the recent education reform proposal...',
      category: 'Education',
      timestamp: '2 days ago',
      replies: 12,
      likes: 28,
    },
    {
      id: 2,
      title: 'Local infrastructure improvements needed',
      content: 'Our community needs better infrastructure. Here are some ideas...',
      category: 'Politics',
      timestamp: '1 week ago',
      replies: 8,
      likes: 15,
    },
    {
      id: 3,
      title: 'Climate change action at the local level',
      content: 'What can we do as a community to address climate change?',
      category: 'Environment',
      timestamp: '2 weeks ago',
      replies: 22,
      likes: 45,
    },
  ];

  const userBadges: UserBadge[] = [
    {
      id: 1,
      name: 'First Post',
      description: 'Created your first community post',
      icon: 'create',
      color: '#3B82F6',
      earned: true,
    },
    {
      id: 2,
      name: 'Helpful Member',
      description: 'Received 50+ likes on your posts',
      icon: 'thumb-up',
      color: '#10B981',
      earned: true,
    },
    {
      id: 3,
      name: 'Discussion Starter',
      description: 'Created 10+ discussion posts',
      icon: 'forum',
      color: '#F59E0B',
      earned: true,
    },
    {
      id: 4,
      name: 'Community Leader',
      description: 'Reached 500+ reputation points',
      icon: 'military-tech',
      color: '#8B5CF6',
      earned: false,
    },
  ];

  const renderPost = ({ item }: { item: UserPost }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => navigation.navigate('DiscussionDetail', {
        discussionId: item.id,
        title: item.title,
        author: username,
        timestamp: item.timestamp,
        replies: item.replies,
        category: item.category,
      })}
    >
      <View style={styles.postHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.postTimestamp}>{item.timestamp}</Text>
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>

      <View style={styles.postStats}>
        <View style={styles.postStat}>
          <MaterialIcons name="forum" size={16} color="#666" />
          <Text style={styles.postStatText}>{item.replies}</Text>
        </View>
        <View style={styles.postStat}>
          <MaterialIcons name="favorite" size={16} color="#666" />
          <Text style={styles.postStatText}>{item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBadge = ({ item }: { item: UserBadge }) => (
    <View style={[styles.badgeCard, !item.earned && styles.badgeCardUnearneed]}>
      <View style={[styles.badgeIcon, { backgroundColor: item.earned ? item.color : '#e9ecef' }]}>
        <MaterialIcons
          name={item.icon as any}
          size={24}
          color={item.earned ? '#FFFFFF' : '#9CA3AF'}
        />
      </View>
      <Text style={[styles.badgeName, !item.earned && styles.badgeNameUnearned]}>
        {item.name}
      </Text>
      <Text style={[styles.badgeDescription, !item.earned && styles.badgeDescriptionUnearned]}>
        {item.description}
      </Text>
    </View>
  );

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Politics': '#3B82F6',
      'Education': '#10B981',
      'Environment': '#059669',
      'Healthcare': '#EF4444',
      'Economy': '#F59E0B',
    };
    return colors[category] || '#8B5CF6';
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

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
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialIcons name="more-vert" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            style={styles.profileGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileContent}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {username.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </Text>
                </View>
              </View>

              <Text style={styles.username}>{username}</Text>
              <Text style={styles.userTitle}>Active Community Member</Text>
              <Text style={styles.joinDate}>Joined {userStats.joinDate}</Text>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.posts}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.followers}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.following}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.reputation}</Text>
                  <Text style={styles.statLabel}>Reputation</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={handleFollowToggle}
              >
                <MaterialIcons
                  name={isFollowing ? 'person-remove' : 'person-add'}
                  size={20}
                  color={isFollowing ? '#333' : '#FFFFFF'}
                />
                <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Posts ({userStats.posts})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'badges' && styles.activeTab]}
            onPress={() => setActiveTab('badges')}
          >
            <Text style={[styles.tabText, activeTab === 'badges' && styles.activeTabText]}>
              Badges
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
              About
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'posts' && (
            <FlatList
              data={userPosts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}

          {activeTab === 'badges' && (
            <View style={styles.badgesGrid}>
              {userBadges.map((badge) => (
                <View key={badge.id} style={styles.badgeWrapper}>
                  {renderBadge({ item: badge })}
                </View>
              ))}
            </View>
          )}

          {activeTab === 'about' && (
            <View style={styles.aboutContent}>
              <Text style={styles.aboutText}>
                {username} is an active member of the community who regularly contributes to discussions
                about politics, education, and environmental issues. They have been recognized for their
                helpful contributions and positive engagement with other community members.
              </Text>

              <View style={styles.aboutStats}>
                <View style={styles.aboutStat}>
                  <MaterialIcons name="star" size={20} color="#F59E0B" />
                  <Text style={styles.aboutStatText}>Top contributor this month</Text>
                </View>
                <View style={styles.aboutStat}>
                  <MaterialIcons name="verified" size={20} color="#10B981" />
                  <Text style={styles.aboutStatText}>Verified community member</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileGradient: {
    padding: 24,
  },
  profileContent: {
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userTitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  joinDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  followingButton: {
    backgroundColor: '#FFFFFF',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  followingButtonText: {
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  tabContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  postCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeWrapper: {
    width: '48%',
  },
  badgeCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  badgeCardUnearneed: {
    opacity: 0.6,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeNameUnearned: {
    color: '#9CA3AF',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  badgeDescriptionUnearned: {
    color: '#9CA3AF',
  },
  aboutContent: {
    gap: 20,
  },
  aboutText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  aboutStats: {
    gap: 12,
  },
  aboutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  aboutStatText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});