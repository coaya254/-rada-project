import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';

interface AchievementsScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'Achievements'>;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  category: 'Learning' | 'Progress' | 'Engagement' | 'Streak' | 'Quiz' | 'Special';
  xpReward: number;
  progress?: number;
  progressMax?: number;
}

type FilterType = 'all' | 'earned' | 'locked';
type CategoryType = 'all' | Achievement['category'];

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ navigation }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [category, setCategory] = useState<CategoryType>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const achievements: Achievement[] = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: 'school',
      earned: true,
      earnedDate: '2025-09-15',
      rarity: 'Common',
      category: 'Learning',
      xpReward: 50,
    },
    {
      id: 2,
      title: 'Knowledge Seeker',
      description: 'Complete 10 lessons',
      icon: 'menu-book',
      earned: true,
      earnedDate: '2025-09-28',
      rarity: 'Common',
      category: 'Learning',
      xpReward: 100,
      progress: 10,
      progressMax: 10,
    },
    {
      id: 3,
      title: 'Quiz Champion',
      description: 'Score perfect on 5 quizzes',
      icon: 'stars',
      earned: false,
      rarity: 'Rare',
      category: 'Quiz',
      xpReward: 200,
      progress: 3,
      progressMax: 5,
    },
    {
      id: 4,
      title: 'Week Warrior',
      description: 'Maintain a 7-day learning streak',
      icon: 'local-fire-department',
      earned: true,
      earnedDate: '2025-09-22',
      rarity: 'Rare',
      category: 'Streak',
      xpReward: 150,
    },
    {
      id: 5,
      title: 'Constitution Expert',
      description: 'Complete all Constitutional Law modules',
      icon: 'gavel',
      earned: false,
      rarity: 'Epic',
      category: 'Learning',
      xpReward: 500,
      progress: 2,
      progressMax: 5,
    },
    {
      id: 6,
      title: 'Unstoppable',
      description: 'Maintain a 30-day learning streak',
      icon: 'whatshot',
      earned: false,
      rarity: 'Epic',
      category: 'Streak',
      xpReward: 750,
      progress: 12,
      progressMax: 30,
    },
    {
      id: 7,
      title: 'Community Leader',
      description: 'Reach the top 10 on the leaderboard',
      icon: 'emoji-events',
      earned: false,
      rarity: 'Epic',
      category: 'Special',
      xpReward: 1000,
    },
    {
      id: 8,
      title: 'Civic Master',
      description: 'Complete all available modules',
      icon: 'workspace-premium',
      earned: false,
      rarity: 'Legendary',
      category: 'Learning',
      xpReward: 2000,
      progress: 15,
      progressMax: 24,
    },
    {
      id: 9,
      title: 'Early Adopter',
      description: 'Join Rada during the first month',
      icon: 'verified',
      earned: true,
      earnedDate: '2025-09-01',
      rarity: 'Legendary',
      category: 'Special',
      xpReward: 500,
    },
    {
      id: 10,
      title: 'Speed Learner',
      description: 'Complete 5 lessons in one day',
      icon: 'bolt',
      earned: false,
      rarity: 'Rare',
      category: 'Progress',
      xpReward: 200,
      progress: 2,
      progressMax: 5,
    },
    {
      id: 11,
      title: 'Perfect Score',
      description: 'Score 100% on 3 consecutive quizzes',
      icon: 'grade',
      earned: false,
      rarity: 'Epic',
      category: 'Quiz',
      xpReward: 300,
      progress: 1,
      progressMax: 3,
    },
    {
      id: 12,
      title: 'Engaged Citizen',
      description: 'Complete 50 total lessons',
      icon: 'how-to-vote',
      earned: false,
      rarity: 'Epic',
      category: 'Learning',
      xpReward: 600,
      progress: 15,
      progressMax: 50,
    },
  ];

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'Common': return '#9CA3AF';
      case 'Rare': return '#3B82F6';
      case 'Epic': return '#8B5CF6';
      case 'Legendary': return '#F59E0B';
    }
  };

  const getCategoryIcon = (cat: Achievement['category']) => {
    switch (cat) {
      case 'Learning': return 'school';
      case 'Progress': return 'trending-up';
      case 'Engagement': return 'people';
      case 'Streak': return 'local-fire-department';
      case 'Quiz': return 'quiz';
      case 'Special': return 'star';
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'earned' && !achievement.earned) return false;
    if (filter === 'locked' && achievement.earned) return false;
    if (category !== 'all' && achievement.category !== category) return false;
    return true;
  });

  const stats = {
    total: achievements.length,
    earned: achievements.filter(a => a.earned).length,
    totalXP: achievements.filter(a => a.earned).reduce((sum, a) => sum + a.xpReward, 0),
  };

  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };

  const renderAchievement = ({ item }: { item: Achievement }) => (
    <TouchableOpacity
      style={[styles.achievementCard, !item.earned && styles.lockedCard]}
      onPress={() => handleAchievementPress(item)}
    >
      <View style={[styles.achievementIconContainer, { borderColor: getRarityColor(item.rarity) }]}>
        <LinearGradient
          colors={item.earned ? [getRarityColor(item.rarity), getRarityColor(item.rarity) + 'AA'] : ['#E5E7EB', '#9CA3AF']}
          style={styles.achievementIconGradient}
        >
          <MaterialIcons
            name={item.icon as any}
            size={32}
            color={item.earned ? '#FFFFFF' : '#6B7280'}
          />
        </LinearGradient>
      </View>

      <View style={styles.achievementInfo}>
        <Text style={[styles.achievementTitle, !item.earned && styles.lockedText]}>
          {item.title}
        </Text>
        <Text style={[styles.achievementDescription, !item.earned && styles.lockedText]}>
          {item.description}
        </Text>

        {item.progress !== undefined && item.progressMax !== undefined && !item.earned && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${(item.progress / item.progressMax) * 100}%`,
                backgroundColor: getRarityColor(item.rarity),
              }]} />
            </View>
            <Text style={styles.progressText}>
              {item.progress}/{item.progressMax}
            </Text>
          </View>
        )}

        <View style={styles.achievementFooter}>
          <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(item.rarity) + '20' }]}>
            <Text style={[styles.rarityText, { color: getRarityColor(item.rarity) }]}>
              {item.rarity}
            </Text>
          </View>
          <Text style={styles.xpReward}>+{item.xpReward} XP</Text>
        </View>

        {item.earned && item.earnedDate && (
          <Text style={styles.earnedDate}>
            Earned {new Date(item.earnedDate).toLocaleDateString()}
          </Text>
        )}
      </View>

      {item.earned && (
        <View style={styles.earnedBadge}>
          <MaterialIcons name="check-circle" size={24} color="#10B981" />
        </View>
      )}
    </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Achievements</Text>
          <Text style={styles.headerSubtitle}>Your learning milestones</Text>
        </View>
      </View>

      {/* Stats Card */}
      <View style={styles.statsSection}>
        <LinearGradient
          colors={['#8B5CF6', '#6D28D9']}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.earned}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalXP}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterTabText, filter === 'all' && styles.activeFilterTabText]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'earned' && styles.activeFilterTab]}
              onPress={() => setFilter('earned')}
            >
              <Text style={[styles.filterTabText, filter === 'earned' && styles.activeFilterTabText]}>
                Earned
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'locked' && styles.activeFilterTab]}
              onPress={() => setFilter('locked')}
            >
              <Text style={[styles.filterTabText, filter === 'locked' && styles.activeFilterTabText]}>
                Locked
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryTabs}>
            {(['all', 'Learning', 'Quiz', 'Streak', 'Progress', 'Engagement', 'Special'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, category === cat && styles.activeCategoryTab]}
                onPress={() => setCategory(cat)}
              >
                {cat !== 'all' && (
                  <MaterialIcons
                    name={getCategoryIcon(cat as Achievement['category']) as any}
                    size={16}
                    color={category === cat ? '#FFFFFF' : '#666'}
                  />
                )}
                <Text style={[styles.categoryTabText, category === cat && styles.activeCategoryTabText]}>
                  {cat === 'all' ? 'All' : cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Achievements List */}
      <FlatList
        data={filteredAchievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Achievement Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {selectedAchievement && (
              <>
                <View style={[styles.modalIconContainer, { borderColor: getRarityColor(selectedAchievement.rarity) }]}>
                  <LinearGradient
                    colors={selectedAchievement.earned
                      ? [getRarityColor(selectedAchievement.rarity), getRarityColor(selectedAchievement.rarity) + 'AA']
                      : ['#E5E7EB', '#9CA3AF']
                    }
                    style={styles.modalIconGradient}
                  >
                    <MaterialIcons
                      name={selectedAchievement.icon as any}
                      size={48}
                      color={selectedAchievement.earned ? '#FFFFFF' : '#6B7280'}
                    />
                  </LinearGradient>
                </View>

                <Text style={styles.modalTitle}>{selectedAchievement.title}</Text>
                <Text style={styles.modalDescription}>{selectedAchievement.description}</Text>

                <View style={[styles.modalRarityBadge, { backgroundColor: getRarityColor(selectedAchievement.rarity) }]}>
                  <Text style={styles.modalRarityText}>{selectedAchievement.rarity}</Text>
                </View>

                <View style={styles.modalDetails}>
                  <View style={styles.modalDetailItem}>
                    <MaterialIcons name="stars" size={20} color="#F59E0B" />
                    <Text style={styles.modalDetailText}>+{selectedAchievement.xpReward} XP Reward</Text>
                  </View>
                  <View style={styles.modalDetailItem}>
                    <MaterialIcons name={getCategoryIcon(selectedAchievement.category) as any} size={20} color="#3B82F6" />
                    <Text style={styles.modalDetailText}>{selectedAchievement.category}</Text>
                  </View>
                </View>

                {selectedAchievement.progress !== undefined && selectedAchievement.progressMax !== undefined && (
                  <View style={styles.modalProgressContainer}>
                    <Text style={styles.modalProgressLabel}>Progress</Text>
                    <View style={styles.modalProgressBar}>
                      <View style={[styles.modalProgressFill, {
                        width: `${(selectedAchievement.progress / selectedAchievement.progressMax) * 100}%`,
                        backgroundColor: getRarityColor(selectedAchievement.rarity),
                      }]} />
                    </View>
                    <Text style={styles.modalProgressText}>
                      {selectedAchievement.progress} / {selectedAchievement.progressMax}
                    </Text>
                  </View>
                )}

                {selectedAchievement.earned && selectedAchievement.earnedDate && (
                  <View style={styles.modalEarnedContainer}>
                    <MaterialIcons name="check-circle" size={24} color="#10B981" />
                    <Text style={styles.modalEarnedText}>
                      Earned on {new Date(selectedAchievement.earnedDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  statsSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterTab: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  categoryContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    gap: 4,
  },
  activeCategoryTab: {
    backgroundColor: '#3B82F6',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeCategoryTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    position: 'relative',
  },
  lockedCard: {
    opacity: 0.7,
  },
  achievementIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  achievementIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  lockedText: {
    color: '#9CA3AF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  xpReward: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  earnedDate: {
    fontSize: 11,
    color: '#10B981',
    fontStyle: 'italic',
  },
  earnedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  modalIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  modalIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalRarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalRarityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalDetails: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  modalDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalDetailText: {
    fontSize: 14,
    color: '#666',
  },
  modalProgressContainer: {
    width: '100%',
    marginBottom: 16,
  },
  modalProgressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalProgressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalEarnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalEarnedText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
