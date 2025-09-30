import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HonorWall = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: '🌟' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'environment', label: 'Environment', icon: '🌱' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'community', label: 'Community', icon: '🤝' },
  ];

  const honorItems = [
    {
      id: 1,
      name: 'Sarah K.',
      avatar: '👩‍🎓',
      category: 'education',
      achievement: 'Education Rights Advocate',
      description: 'Successfully organized a campaign that helped 500+ students access quality education in rural areas.',
      xp: 250,
      date: '2 hours ago',
      supporters: 127,
      verified: true,
    },
    {
      id: 2,
      name: 'David M.',
      avatar: '👨‍🌾',
      category: 'environment',
      achievement: 'Green Warrior',
      description: 'Led community clean-up initiatives that removed 2 tons of plastic waste from local rivers.',
      xp: 300,
      date: '5 hours ago',
      supporters: 89,
      verified: true,
    },
    {
      id: 3,
      name: 'Fatima A.',
      avatar: '👩‍⚕️',
      category: 'health',
      achievement: 'Health Champion',
      description: 'Organized free health camps serving 1,000+ people in underserved communities.',
      xp: 200,
      date: '1 day ago',
      supporters: 156,
      verified: false,
    },
    {
      id: 4,
      name: 'James O.',
      avatar: '👨‍💼',
      category: 'community',
      achievement: 'Community Builder',
      description: 'Established youth mentorship programs benefiting 200+ young people.',
      xp: 180,
      date: '2 days ago',
      supporters: 73,
      verified: true,
    },
    {
      id: 5,
      name: 'Amina J.',
      avatar: '👩‍🔬',
      category: 'education',
      achievement: 'Science Educator',
      description: 'Created STEM workshops for girls, inspiring 150+ students to pursue science careers.',
      xp: 220,
      date: '3 days ago',
      supporters: 94,
      verified: true,
    },
  ];

  const filteredItems = selectedCategory === 'all' 
    ? honorItems 
    : honorItems.filter(item => item.category === selectedCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🕯️ Honor Wall</Text>
        <Text style={styles.headerSubtitle}>Celebrating community heroes</Text>
        
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{honorItems.length}</Text>
            <Text style={styles.statLabel}>Total Honors</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {honorItems.filter(h => h.verified).length}
            </Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {honorItems.reduce((sum, h) => sum + h.supporters, 0)}
            </Text>
            <Text style={styles.statLabel}>Supporters</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterButton,
              selectedCategory === category.id && styles.filterButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.filterIcon}>{category.icon}</Text>
            <Text style={[
              styles.filterLabel,
              selectedCategory === category.id && styles.filterLabelActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Honor Items */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredItems.map((item) => (
          <View key={item.id} style={styles.honorCard}>
            {/* Header */}
            <View style={styles.honorHeader}>
              <View style={styles.honorInfo}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatar}>{item.avatar}</Text>
                  {item.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedIcon}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.honorDetails}>
                  <Text style={styles.honorName}>{item.name}</Text>
                  <Text style={styles.honorAchievement}>{item.achievement}</Text>
                  <Text style={styles.honorDate}>{item.date}</Text>
                </View>
              </View>
              <View style={styles.xpContainer}>
                <Text style={styles.xpValue}>+{item.xp}</Text>
                <Text style={styles.xpLabel}>XP</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.honorDescription}>{item.description}</Text>

            {/* Footer */}
            <View style={styles.honorFooter}>
              <View style={styles.supportersContainer}>
                <Text style={styles.supportersIcon}>❤️</Text>
                <Text style={styles.supportersCount}>{item.supporters} supporters</Text>
              </View>
              <TouchableOpacity style={styles.supportButton}>
                <Text style={styles.supportButtonText}>Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🕯️</Text>
            <Text style={styles.emptyTitle}>No honors yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to recognize someone in this category!
            </Text>
          </View>
        )}

        {/* Weekly Challenge */}
        <View style={styles.weeklyChallengeSection}>
          <Text style={styles.sectionTitle}>🎯 Weekly Challenge</Text>
          <TouchableOpacity style={styles.weeklyChallengeCard}>
            <LinearGradient
              colors={['#FF6B6B', '#4ECDC4']}
              style={styles.challengeGradient}
            >
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeIcon}>🏆</Text>
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle}>Community Hero</Text>
                  <Text style={styles.challengeDescription}>
                    Share your civic engagement story and inspire others
                  </Text>
                  <View style={styles.challengeStats}>
                    <Text style={styles.challengeStat}>👥 156 participants</Text>
                    <Text style={styles.challengeStat}>⏰ 3 days left</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.challengeButton}>
                <Text style={styles.challengeButtonText}>Join Challenge</Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Community Leaders */}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.floatingAction}>
        <Text style={styles.floatingActionIcon}>🏆</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  filterIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterLabelActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  honorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  honorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  honorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    fontSize: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
    lineHeight: 50,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  verifiedIcon: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  honorDetails: {
    flex: 1,
  },
  honorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  honorAchievement: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  honorDate: {
    fontSize: 12,
    color: '#999',
  },
  xpContainer: {
    alignItems: 'center',
  },
  xpValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 2,
  },
  xpLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  honorDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  honorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  supportersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportersIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  supportersCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  supportButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  supportButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  floatingAction: {
    position: 'absolute',
    bottom: 30,
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
  floatingActionIcon: {
    fontSize: 24,
  },
  weeklyChallengeSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  weeklyChallengeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  challengeGradient: {
    padding: 20,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  challengeIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  challengeStat: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  challengeButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  challengeButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HonorWall;
