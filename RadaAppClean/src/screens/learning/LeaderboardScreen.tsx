import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';
import LearningAPIService from '../../services/LearningAPIService';

// Test user UUID (Jay)
const USER_UUID = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';

interface LeaderboardScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'Leaderboard'>;
}

interface LeaderboardEntry {
  user_id: number;
  uuid?: string;
  rank: number;
  username?: string;
  level: number;
  total_xp: number;
  avatar?: string;
  current_streak?: number;
  completedModules?: number;
  isCurrentUser?: boolean;
}

type TimeFrame = 'weekly' | 'monthly' | 'all-time';

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ navigation }) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('weekly');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);

  const fetchLeaderboard = async () => {
    try {
      const response = await LearningAPIService.getLeaderboard(selectedTimeFrame, 100);

      if (response.success) {
        // Mark entries with Jay's UUID as current user
        const leaderboard = (response.leaderboard || []).map((entry: LeaderboardEntry) => ({
          ...entry,
          isCurrentUser: entry.uuid === USER_UUID,
        }));

        setLeaderboardData(leaderboard);

        // Find current user in the leaderboard
        const currentUserEntry = leaderboard.find((entry: LeaderboardEntry) => entry.uuid === USER_UUID);
        setCurrentUser(currentUserEntry || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard();
  }, [selectedTimeFrame]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#666';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank.toString();
    }
  };

  const handleUserPress = (entry: LeaderboardEntry) => {
    if (!entry.uuid) return;

    // Navigate to Profile tab and then to UserProfile screen
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Profile', {
        screen: 'UserProfile',
        params: {
          uuid: entry.uuid,
          userName: entry.username || `User ${entry.user_id}`,
        },
      });
    }
  };

  const renderLeaderboardEntry = ({ item }: { item: LeaderboardEntry }) => (
    <View style={[styles.entryCard, item.isCurrentUser && styles.currentUserCard]}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rankText, { color: getRankColor(item.rank) }]}>
          {getRankIcon(item.rank)}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.avatarContainer, { borderColor: getRankColor(item.rank) }]}
        onPress={() => handleUserPress(item)}
      >
        <MaterialIcons name="person" size={24} color="#666" />
      </TouchableOpacity>

      <View style={styles.entryInfo}>
        <View style={styles.entryHeader}>
          <TouchableOpacity onPress={() => handleUserPress(item)}>
            <Text style={[styles.username, item.isCurrentUser && styles.currentUserText]}>
              {item.username || `User ${item.user_id}`}
            </Text>
          </TouchableOpacity>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lvl {item.level}</Text>
          </View>
        </View>
        <View style={styles.entryStats}>
          <View style={styles.statItem}>
            <MaterialIcons name="stars" size={14} color="#F59E0B" />
            <Text style={styles.statText}>{item.total_xp} XP</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="local-fire-department" size={14} color="#EF4444" />
            <Text style={styles.statText}>{item.current_streak || 0} days</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="check-circle" size={14} color="#10B981" />
            <Text style={styles.statText}>{item.completedModules || 0} modules</Text>
          </View>
        </View>
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
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Compete with learners</Text>
        </View>
      </View>

      {/* Time Frame Selector */}
      <View style={styles.timeFrameContainer}>
        <TouchableOpacity
          style={[styles.timeFrameButton, selectedTimeFrame === 'weekly' && styles.activeTimeFrame]}
          onPress={() => setSelectedTimeFrame('weekly')}
        >
          <Text style={[styles.timeFrameText, selectedTimeFrame === 'weekly' && styles.activeTimeFrameText]}>
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeFrameButton, selectedTimeFrame === 'monthly' && styles.activeTimeFrame]}
          onPress={() => setSelectedTimeFrame('monthly')}
        >
          <Text style={[styles.timeFrameText, selectedTimeFrame === 'monthly' && styles.activeTimeFrameText]}>
            Monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeFrameButton, selectedTimeFrame === 'all-time' && styles.activeTimeFrame]}
          onPress={() => setSelectedTimeFrame('all-time')}
        >
          <Text style={[styles.timeFrameText, selectedTimeFrame === 'all-time' && styles.activeTimeFrameText]}>
            All Time
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current User Position */}
      {currentUser && (
        <View style={styles.currentUserSection}>
          <Text style={styles.sectionTitle}>Your Position</Text>
          <View style={styles.currentUserCard}>
            <LinearGradient
              colors={['#3B82F6', '#1E40AF']}
              style={styles.currentUserGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.currentUserContent}>
                <View style={styles.currentUserLeft}>
                  <Text style={styles.currentUserRank}>#{currentUser.rank}</Text>
                  <View>
                    <Text style={styles.currentUserName}>{currentUser.username || 'You'}</Text>
                    <Text style={styles.currentUserLevel}>Level {currentUser.level}</Text>
                  </View>
                </View>
                <View style={styles.currentUserRight}>
                  <Text style={styles.currentUserXP}>{currentUser.total_xp}</Text>
                  <Text style={styles.currentUserXPLabel}>Total XP</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      )}

      {/* Top 3 Podium */}
      <View style={styles.podiumSection}>
        <Text style={styles.sectionTitle}>Top Learners</Text>
        <View style={styles.podium}>
          {/* 2nd Place */}
          {leaderboardData[1] && (
            <TouchableOpacity
              style={[styles.podiumPlace, styles.secondPlace]}
              onPress={() => handleUserPress(leaderboardData[1])}
            >
              <View style={[styles.podiumAvatar, styles.secondPlaceAvatar]}>
                <MaterialIcons name="person" size={28} color="#666" />
              </View>
              <Text style={styles.podiumRank}>🥈</Text>
              <Text style={styles.podiumName}>{leaderboardData[1].username || `User ${leaderboardData[1].user_id}`}</Text>
              <Text style={styles.podiumXP}>{leaderboardData[1].total_xp} XP</Text>
              <View style={[styles.podiumBase, styles.secondPlaceBase]} />
            </TouchableOpacity>
          )}

          {/* 1st Place */}
          {leaderboardData[0] && (
            <TouchableOpacity
              style={[styles.podiumPlace, styles.firstPlace]}
              onPress={() => handleUserPress(leaderboardData[0])}
            >
              <MaterialIcons name="emoji-events" size={24} color="#FFD700" style={styles.crownIcon} />
              <View style={[styles.podiumAvatar, styles.firstPlaceAvatar]}>
                <MaterialIcons name="person" size={32} color="#666" />
              </View>
              <Text style={styles.podiumRank}>🥇</Text>
              <Text style={styles.podiumName}>{leaderboardData[0].username || `User ${leaderboardData[0].user_id}`}</Text>
              <Text style={styles.podiumXP}>{leaderboardData[0].total_xp} XP</Text>
              <View style={[styles.podiumBase, styles.firstPlaceBase]} />
            </TouchableOpacity>
          )}

          {/* 3rd Place */}
          {leaderboardData[2] && (
            <TouchableOpacity
              style={[styles.podiumPlace, styles.thirdPlace]}
              onPress={() => handleUserPress(leaderboardData[2])}
            >
              <View style={[styles.podiumAvatar, styles.thirdPlaceAvatar]}>
                <MaterialIcons name="person" size={24} color="#666" />
              </View>
              <Text style={styles.podiumRank}>🥉</Text>
              <Text style={styles.podiumName}>{leaderboardData[2].username || `User ${leaderboardData[2].user_id}`}</Text>
              <Text style={styles.podiumXP}>{leaderboardData[2].total_xp} XP</Text>
              <View style={[styles.podiumBase, styles.thirdPlaceBase]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Full Leaderboard */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Rankings</Text>
        {loading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <FlatList
            data={leaderboardData}
            renderItem={renderLeaderboardEntry}
            keyExtractor={(item) => item.user_id.toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#666', fontSize: 14 }}>No leaderboard data available</Text>
              </View>
            }
          />
        )}
      </View>
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeTimeFrame: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  timeFrameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTimeFrameText: {
    color: '#FFFFFF',
  },
  currentUserSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  currentUserCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserGradient: {
    padding: 20,
  },
  currentUserContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentUserLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  currentUserRank: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currentUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currentUserLevel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  currentUserRight: {
    alignItems: 'flex-end',
  },
  currentUserXP: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currentUserXPLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  podiumSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
    paddingVertical: 20,
  },
  podiumPlace: {
    alignItems: 'center',
    flex: 1,
  },
  firstPlace: {
    order: 2,
  },
  secondPlace: {
    order: 1,
  },
  thirdPlace: {
    order: 3,
  },
  podiumAvatar: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  firstPlaceAvatar: {
    width: 64,
    height: 64,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  secondPlaceAvatar: {
    width: 56,
    height: 56,
    borderWidth: 3,
    borderColor: '#C0C0C0',
  },
  thirdPlaceAvatar: {
    width: 56,
    height: 56,
    borderWidth: 3,
    borderColor: '#CD7F32',
  },
  crownIcon: {
    position: 'absolute',
    top: -12,
  },
  podiumRank: {
    fontSize: 24,
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  podiumXP: {
    fontSize: 10,
    color: '#666',
    marginBottom: 8,
  },
  podiumBase: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  firstPlaceBase: {
    height: 80,
    backgroundColor: '#FFD700',
  },
  secondPlaceBase: {
    height: 60,
    backgroundColor: '#C0C0C0',
  },
  thirdPlaceBase: {
    height: 50,
    backgroundColor: '#CD7F32',
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 24,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  currentUserCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
  },
  entryInfo: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  currentUserText: {
    color: '#3B82F6',
  },
  levelBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  entryStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
});
