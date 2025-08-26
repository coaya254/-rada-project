import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';

interface ContentItem {
  id: number;
  title: string;
  content: string;
  author: string;
  contentType: string;
  upvotes: number;
  downvotes: number;
  score: number;
  comments: number;
  created_at: string;
  media: any;
}

interface CivicHero {
  id: number;
  name: string;
  achievement: string;
  date_of_death?: string;
  age?: number;
  county?: string;
  category?: string;
  image_url?: string;
  verified: boolean;
  candles_lit: number;
  tags?: string[];
}

const CommunityScreen = ({ navigation = null }) => {
  const [contentFeed, setContentFeed] = useState<ContentItem[]>([]);
  const [civicHeroes, setCivicHeroes] = useState<CivicHero[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: '🌟' },
    { id: 'story', label: 'Stories', icon: '✍️' },
    { id: 'poem', label: 'Poems', icon: '📝' },
    { id: 'evidence', label: 'Evidence', icon: '📊' },
    { id: 'report', label: 'Reports', icon: '🎯' },
  ];

  useEffect(() => {
    loadContentFeed();
    loadCivicHeroes();
  }, []);

  const loadContentFeed = async () => {
    try {
      setLoading(true);
      const response = await apiService.getContentFeed(1, 20);
      if (response && response.data) {
        setContentFeed(response.data);
      }
    } catch (error) {
      console.error('Error loading content feed:', error);
      // Fallback to sample data
      setContentFeed([
        {
          id: 1,
          title: 'Community Clean-up Success!',
          content: 'Today we cleaned up the local park and collected 15 bags of trash. Amazing community effort!',
          author: 'EcoWarrior',
          contentType: 'story',
          upvotes: 45,
          downvotes: 2,
          score: 43,
          comments: 12,
          created_at: '2 hours ago',
          media: null,
        },
        {
          id: 2,
          title: 'New Youth Center Proposal',
          content: 'I\'ve been working on a proposal for a new youth center in our neighborhood. Here\'s what I\'ve learned...',
          author: 'CommunityBuilder',
          contentType: 'report',
          upvotes: 23,
          downvotes: 1,
          score: 22,
          comments: 8,
          created_at: '4 hours ago',
          media: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCivicHeroes = () => {
    // Sample Civic Heroes data
    const sampleHeroes: CivicHero[] = [
      {
        id: 1,
        name: 'Wangari Maathai',
        achievement: 'Nobel Peace Prize winner, environmental activist, founder of Green Belt Movement',
        date_of_death: '2011-09-25',
        age: 71,
        county: 'Nyeri',
        category: 'environmental-activist',
        verified: true,
        candles_lit: 1247,
        tags: ['environment', 'women-rights', 'peace', 'education']
      },
      {
        id: 2,
        name: 'Dedan Kimathi',
        achievement: 'Mau Mau freedom fighter, symbol of Kenyan independence struggle',
        date_of_death: '1957-02-18',
        age: 35,
        county: 'Nyeri',
        category: 'freedom-fighter',
        verified: true,
        candles_lit: 2156,
        tags: ['independence', 'freedom', 'struggle', 'hero']
      },
      {
        id: 3,
        name: 'Me Katilili wa Menza',
        achievement: 'Giriama resistance leader against British colonial rule',
        date_of_death: '1924-01-01',
        age: 70,
        county: 'Kilifi',
        category: 'resistance-leader',
        verified: true,
        candles_lit: 892,
        tags: ['resistance', 'colonial', 'women-leaders', 'coast']
      }
    ];
    setCivicHeroes(sampleHeroes);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContentFeed();
    await loadCivicHeroes();
    setRefreshing(false);
  };

  const lightCandle = (id: number) => {
    setCivicHeroes(prev =>
      prev.map(hero =>
        hero.id === id
          ? { ...hero, candles_lit: hero.candles_lit + 1 }
          : hero
      )
    );
    // In real app, this would make an API call
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'environmental-activist': '#10b981',
      'freedom-fighter': '#ef4444',
      'resistance-leader': '#f59e0b',
      'women-rights': '#ec4899',
      'education': '#3b82f6'
    };
    return colors[category] || '#6b7280';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'environmental-activist': 'leaf',
      'freedom-fighter': 'shield',
      'resistance-leader': 'fist',
      'women-rights': 'female',
      'education': 'school'
    };
    return icons[category] || 'person';
  };

  const handleVote = async (contentId: number, voteType: string) => {
    try {
      // Note: userId should come from auth context in real app
      const userId = 'temp-user-id'; // Placeholder
      if (voteType === 'upvote') {
        await apiService.upvoteContent(contentId, userId);
      } else if (voteType === 'downvote') {
        await apiService.downvoteContent(contentId, userId);
      }
      loadContentFeed();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const renderContentItem = ({ item }: { item: ContentItem }) => (
    <View style={styles.contentCard}>
      {/* Content Header */}
      <View style={styles.contentHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>{item.author.charAt(0)}</Text>
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{item.author}</Text>
            <Text style={styles.timestamp}>{item.created_at}</Text>
          </View>
        </View>
        <View style={styles.contentTypeBadge}>
          <Text style={styles.contentTypeText}>
            {item.contentType === 'story' ? '✍️ Story' : 
             item.contentType === 'poem' ? '📝 Poem' : 
             item.contentType === 'evidence' ? '📊 Evidence' : '🎯 Report'}
          </Text>
        </View>
      </View>
      
      {/* Content */}
      <View style={styles.contentBody}>
        <Text style={styles.contentTitle}>{item.title}</Text>
        <Text style={styles.contentText} numberOfLines={3}>
          {item.content}
        </Text>
      </View>
      
      {/* Content Footer */}
      <View style={styles.contentFooter}>
        <View style={styles.voteContainer}>
          <TouchableOpacity 
            style={styles.voteButton}
            onPress={() => handleVote(item.id, 'upvote')}
          >
            <Ionicons name="arrow-up" size={18} color="#4CAF50" />
            <Text style={styles.voteCount}>{item.upvotes}</Text>
          </TouchableOpacity>
          
          <Text style={styles.score}>{item.score}</Text>
          
          <TouchableOpacity 
            style={styles.voteButton}
            onPress={() => handleVote(item.id, 'downvote')}
          >
            <Ionicons name="arrow-down" size={18} color="#F44336" />
            <Text style={styles.voteCount}>{item.downvotes}</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.commentButton}>
          <Ionicons name="chatbubble-outline" size={18} color="#666" />
          <Text style={styles.commentCount}>{item.comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🌟 Community</Text>
        <Text style={styles.headerSubtitle}>Share, connect, and engage</Text>
      </LinearGradient>

      {/* Content Type Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
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
      </ScrollView>

      {/* Content Feed */}
      <FlatList
        data={selectedCategory === 'all' 
          ? contentFeed 
          : contentFeed.filter(item => item.contentType === selectedCategory)
        }
        renderItem={renderContentItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.civicHeroesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🕯️ Civic Heroes</Text>
              <Text style={styles.sectionSubtitle}>Honor Kenya's heroes</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.heroesScroll}
            >
              {civicHeroes.map((hero) => (
                <TouchableOpacity key={hero.id} style={styles.heroCard}>
                  <View style={styles.heroHeader}>
                    <View style={styles.heroImageContainer}>
                      {hero.image_url ? (
                        <Image source={{ uri: hero.image_url }} style={styles.heroImage} />
                      ) : (
                        <View style={[styles.heroImagePlaceholder, { backgroundColor: getCategoryColor(hero.category || '') }]}>
                          <Ionicons name={getCategoryIcon(hero.category || '') as any} size={20} color="white" />
                        </View>
                      )}
                    </View>
                    <View style={styles.heroInfo}>
                      <Text style={styles.heroName}>{hero.name}</Text>
                      <Text style={styles.heroAchievement} numberOfLines={2}>
                        {hero.achievement}
                      </Text>
                      <View style={styles.heroMeta}>
                        <Text style={styles.heroCounty}>{hero.county}</Text>
                        {hero.date_of_death && (
                          <Text style={styles.heroDate}>{hero.date_of_death}</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.verificationBadge}>
                      <Ionicons
                        name={hero.verified ? "checkmark-circle" : "time"}
                        size={16}
                        color={hero.verified ? "#10b981" : "#f59e0b"}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.heroFooter}>
                    <View style={styles.tagsContainer}>
                      {hero.tags?.slice(0, 2).map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                    <TouchableOpacity
                      style={styles.candleButton}
                      onPress={() => lightCandle(hero.id)}
                    >
                      <Ionicons name="flame" size={14} color="#f59e0b" />
                      <Text style={styles.candleCount}>{hero.candles_lit}</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No content yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to share something with the community!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },

  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterLabelActive: {
    color: '#fff',
  },
  contentItem: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8e8e8',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 26,
  },
  contentText: {
    fontSize: 16,
    color: '#4a4a4a',
    lineHeight: 24,
    marginBottom: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
  },
  contentType: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Civic Heroes Styles
  civicHeroesSection: {
    backgroundColor: '#f8fafc',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  heroesScroll: {
    marginHorizontal: -15,
  },
  heroCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginRight: 12,
    width: 280,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  heroImageContainer: {
    marginRight: 12,
  },
  heroImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  heroImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  heroAchievement: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 6,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  heroCounty: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
  },
  heroDate: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
  },
  verificationBadge: {
    marginLeft: 4,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  candleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  candleCount: {
    marginLeft: 3,
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8e8e8',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorInitial: {
    fontSize: 16,
    color: '#fff',
  },
  authorDetails: {
    flexDirection: 'column',
  },
  contentTypeBadge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  contentTypeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  contentBody: {
    padding: 15,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    color: '#4a4a4a',
    lineHeight: 22,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 0.5,
    borderTopColor: '#e8e8e8',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  voteCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});

export default CommunityScreen; 