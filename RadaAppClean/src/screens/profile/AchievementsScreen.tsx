import React from 'react';
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
import type { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';

interface AchievementsScreenProps {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Achievements'>;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  total?: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ navigation }) => {
  const achievements: Achievement[] = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Created your first post in the community',
      icon: 'create',
      color: '#10B981',
      earned: true,
      earnedDate: '2 weeks ago',
      rarity: 'Common',
    },
    {
      id: 2,
      title: 'Knowledge Seeker',
      description: 'Completed 10 learning modules',
      icon: 'school',
      color: '#3B82F6',
      earned: true,
      earnedDate: '1 week ago',
      rarity: 'Common',
    },
    {
      id: 3,
      title: 'Discussion Leader',
      description: 'Started 5 meaningful discussions',
      icon: 'forum',
      color: '#8B5CF6',
      earned: true,
      earnedDate: '3 days ago',
      rarity: 'Rare',
    },
    {
      id: 4,
      title: 'Quiz Master',
      description: 'Score 90%+ on 5 different quizzes',
      icon: 'quiz',
      color: '#F59E0B',
      earned: false,
      progress: 3,
      total: 5,
      rarity: 'Rare',
    },
    {
      id: 5,
      title: 'Community Helper',
      description: 'Received 50+ helpful votes on your posts',
      icon: 'thumb-up',
      color: '#EF4444',
      earned: false,
      progress: 28,
      total: 50,
      rarity: 'Epic',
    },
    {
      id: 6,
      title: 'Civic Champion',
      description: 'Complete all modules and participate in 10 discussions',
      icon: 'military-tech',
      color: '#7C3AED',
      earned: false,
      progress: 0,
      total: 100,
      rarity: 'Legendary',
    },
  ];

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '#10B981';
      case 'Rare': return '#3B82F6';
      case 'Epic': return '#8B5CF6';
      case 'Legendary': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const renderAchievement = ({ item }: { item: Achievement }) => (
    <View style={[styles.achievementCard, !item.earned && styles.achievementCardLocked]}>
      <View style={styles.achievementHeader}>
        <View style={[styles.achievementIcon, { backgroundColor: item.earned ? item.color : '#e9ecef' }]}>
          <MaterialIcons
            name={item.icon as any}
            size={32}
            color={item.earned ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
        <View style={styles.rarityBadge}>
          <Text style={[styles.rarityText, { color: getRarityColor(item.rarity) }]}>
            {item.rarity}
          </Text>
        </View>
      </View>

      <Text style={[styles.achievementTitle, !item.earned && styles.achievementTitleLocked]}>
        {item.title}
      </Text>
      <Text style={[styles.achievementDescription, !item.earned && styles.achievementDescriptionLocked]}>
        {item.description}
      </Text>

      {item.earned ? (
        <View style={styles.earnedInfo}>
          <MaterialIcons name="check-circle" size={16} color="#10B981" />
          <Text style={styles.earnedText}>Earned {item.earnedDate}</Text>
        </View>
      ) : item.progress !== undefined ? (
        <View style={styles.progressInfo}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {
              width: `${(item.progress! / item.total!) * 100}%`,
              backgroundColor: item.color
            }]} />
          </View>
          <Text style={styles.progressText}>
            {item.progress}/{item.total}
          </Text>
        </View>
      ) : (
        <View style={styles.lockedInfo}>
          <MaterialIcons name="lock" size={16} color="#9CA3AF" />
          <Text style={styles.lockedText}>Not yet earned</Text>
        </View>
      )}
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
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress Overview */}
        <View style={styles.overviewSection}>
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            style={styles.overviewGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.overviewContent}>
              <Text style={styles.overviewTitle}>Your Progress</Text>
              <Text style={styles.overviewSubtitle}>
                You've earned {earnedCount} out of {totalCount} achievements
              </Text>

              <View style={styles.overviewStats}>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewStatValue}>{earnedCount}</Text>
                  <Text style={styles.overviewStatLabel}>Earned</Text>
                </View>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewStatValue}>{totalCount - earnedCount}</Text>
                  <Text style={styles.overviewStatLabel}>Remaining</Text>
                </View>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewStatValue}>
                    {Math.round((earnedCount / totalCount) * 100)}%
                  </Text>
                  <Text style={styles.overviewStatLabel}>Complete</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Achievements List */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>All Achievements</Text>
          <FlatList
            data={achievements}
            renderItem={renderAchievement}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            numColumns={2}
            columnWrapperStyle={styles.achievementRow}
          />
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
  headerRight: {
    width: 40,
  },
  overviewSection: {
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
  overviewGradient: {
    padding: 24,
  },
  overviewContent: {
    alignItems: 'center',
    gap: 12,
  },
  overviewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  overviewSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  overviewStatLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  achievementsSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  achievementRow: {
    justifyContent: 'space-between',
  },
  achievementCard: {
    flex: 0.48,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  achievementCardLocked: {
    opacity: 0.7,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rarityBadge: {
    alignSelf: 'flex-start',
  },
  rarityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  achievementTitleLocked: {
    color: '#9CA3AF',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  achievementDescriptionLocked: {
    color: '#9CA3AF',
  },
  earnedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  earnedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  progressInfo: {
    gap: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  lockedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockedText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});