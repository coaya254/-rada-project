import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface YouthOrganization {
  id: number;
  name: string;
  description: string;
  category: string;
  county: string;
  member_count: number;
  founded_date: string;
  logo_url?: string;
  verified: boolean;
  focus_areas: string[];
  contact_info: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

interface YouthChallenge {
  id: number;
  title: string;
  description: string;
  category: string;
  xp_reward: number;
  deadline?: string;
  participants: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'active' | 'completed' | 'upcoming';
}

const YouthHubScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'organizations' | 'challenges' | 'opportunities'>('organizations');
  const [refreshing, setRefreshing] = useState(false);
  const [organizations, setOrganizations] = useState<YouthOrganization[]>([]);
  const [challenges, setChallenges] = useState<YouthChallenge[]>([]);
  const [selectedItem, setSelectedItem] = useState<YouthOrganization | YouthChallenge | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);
      console.log('🔄 Loading youth hub data...');
      
      // For now, use sample data but structure it for future API integration
      // TODO: Replace with real API calls when backend endpoints are available
      const sampleOrganizations: YouthOrganization[] = [
        {
          id: 1,
          name: 'Youth for Change Kenya',
          description: 'Empowering young Kenyans through civic education, leadership training, and community development projects.',
          category: 'civic-education',
          county: 'Nairobi',
          member_count: 1250,
          founded_date: '2018-03-15',
          verified: true,
          focus_areas: ['civic-education', 'leadership', 'community-development', 'youth-empowerment'],
          contact_info: {
            email: 'info@youthforchange.ke',
            phone: '+254 700 123 456',
            website: 'www.youthforchange.ke'
          }
        },
        {
          id: 2,
          name: 'Green Future Youth Initiative',
          description: 'Environmental conservation and sustainability projects led by young Kenyans across the country.',
          category: 'environmental',
          county: 'Mombasa',
          member_count: 890,
          founded_date: '2020-06-20',
          verified: true,
          focus_areas: ['environmental-conservation', 'sustainability', 'climate-action', 'tree-planting'],
          contact_info: {
            email: 'hello@greenfuture.ke',
            phone: '+254 700 789 012',
            website: 'www.greenfuture.ke'
          }
        },
        {
          id: 3,
          name: 'Tech Innovators Hub',
          description: 'Youth-led technology innovation center focusing on digital skills, entrepreneurship, and tech solutions for local problems.',
          category: 'technology',
          county: 'Kisumu',
          member_count: 650,
          founded_date: '2019-11-10',
          verified: true,
          focus_areas: ['technology', 'innovation', 'entrepreneurship', 'digital-skills'],
          contact_info: {
            email: 'contact@techinnovators.ke',
            phone: '+254 700 345 678',
            website: 'www.techinnovators.ke'
          }
        }
      ];

      const sampleChallenges: YouthChallenge[] = [
        {
          id: 1,
          title: 'Community Clean-up Challenge',
          description: 'Organize a community clean-up event in your neighborhood and document the impact.',
          category: 'environmental',
          xp_reward: 150,
          deadline: '2024-12-31',
          participants: 45,
          difficulty: 'beginner',
          status: 'active'
        },
        {
          id: 2,
          title: 'Youth Leadership Workshop',
          description: 'Conduct a leadership workshop for 20+ young people in your community.',
          category: 'leadership',
          xp_reward: 300,
          deadline: '2024-11-30',
          participants: 23,
          difficulty: 'intermediate',
          status: 'active'
        },
        {
          id: 3,
          title: 'Digital Skills Training',
          description: 'Train 15+ youth in basic digital skills and help them create online profiles.',
          category: 'technology',
          xp_reward: 250,
          deadline: '2024-10-31',
          participants: 18,
          difficulty: 'intermediate',
          status: 'active'
        }
      ];

      // TODO: Replace with real API calls
      // const organizationsResponse = await apiService.getYouthOrganizations();
      // const challengesResponse = await apiService.getYouthChallenges();
      
      setOrganizations(sampleOrganizations);
      setChallenges(sampleChallenges);
      console.log('✅ Youth hub data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading youth hub data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    await loadData();
  };

  const joinOrganization = (id: number) => {
    Alert.alert('🎯', 'Request sent to join organization! You\'ll be notified when approved.');
  };

  const joinChallenge = (id: number) => {
    Alert.alert('🏆', 'Challenge joined! Start working on it to earn XP.');
  };

  const showItemDetails = (item: YouthOrganization | YouthChallenge) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'civic-education': '#3b82f6',
      'environmental': '#10b981',
      'technology': '#8b5cf6',
      'leadership': '#f59e0b',
      'community-development': '#ef4444',
      'youth-empowerment': '#ec4899'
    };
    return colors[category] || '#6b7280';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'civic-education': 'school',
      'environmental': 'leaf',
      'technology': 'laptop',
      'leadership': 'people',
      'community-development': 'home',
      'youth-empowerment': 'heart'
    };
    return icons[category] || 'star';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      'beginner': '#10b981',
      'intermediate': '#f59e0b',
      'advanced': '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
  };

  const renderOrganizationCard = (org: YouthOrganization) => (
    <TouchableOpacity
      key={org.id}
      style={styles.organizationCard}
      onPress={() => showItemDetails(org)}
    >
      <View style={styles.orgHeader}>
        <View style={styles.orgLogoContainer}>
          {org.logo_url ? (
            <Image source={{ uri: org.logo_url }} style={styles.orgLogo} />
          ) : (
            <View style={[styles.orgLogoPlaceholder, { backgroundColor: getCategoryColor(org.category) }]}>
              <Ionicons name={getCategoryIcon(org.category) as any} size={24} color="white" />
            </View>
          )}
        </View>
        <View style={styles.orgInfo}>
          <Text style={styles.orgName}>{org.name}</Text>
          <Text style={styles.orgDescription} numberOfLines={2}>
            {org.description}
          </Text>
          <View style={styles.orgMeta}>
            <Text style={styles.orgCounty}>{org.county}</Text>
            <Text style={styles.orgMembers}>{org.member_count} members</Text>
          </View>
        </View>
        <View style={styles.verificationBadge}>
          <Ionicons 
            name={org.verified ? "checkmark-circle" : "time"} 
            size={20} 
            color={org.verified ? "#10b981" : "#f59e0b"} 
          />
        </View>
      </View>
      
      <View style={styles.orgFooter}>
        <View style={styles.focusAreas}>
          {org.focus_areas.slice(0, 3).map((area, index) => (
            <View key={index} style={styles.focusArea}>
              <Text style={styles.focusAreaText}>{area}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => joinOrganization(org.id)}
        >
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderChallengeCard = (challenge: YouthChallenge) => (
    <TouchableOpacity
      key={challenge.id}
      style={styles.challengeCard}
      onPress={() => showItemDetails(challenge)}
    >
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        <View style={styles.challengeStatus}>
          <View style={[styles.statusDot, { backgroundColor: getDifficultyColor(challenge.difficulty) }]} />
          <Text style={styles.challengeDifficulty}>{challenge.difficulty}</Text>
        </View>
      </View>
      
      <Text style={styles.challengeDescription} numberOfLines={2}>
        {challenge.description}
      </Text>
      
      <View style={styles.challengeMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="trophy" size={16} color="#f59e0b" />
          <Text style={styles.metaText}>{challenge.xp_reward} XP</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="people" size={16} color="#6b7280" />
          <Text style={styles.metaText}>{challenge.participants} joined</Text>
        </View>
        {challenge.deadline && (
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={16} color="#6b7280" />
            <Text style={styles.metaText}>{challenge.deadline}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.challengeFooter}>
        <View style={styles.challengeCategory}>
          <Text style={styles.categoryText}>{challenge.category}</Text>
        </View>
        <TouchableOpacity
          style={styles.joinChallengeButton}
          onPress={() => joinChallenge(challenge.id)}
        >
          <Text style={styles.joinChallengeButtonText}>Join Challenge</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedItem && 'name' in selectedItem ? selectedItem.name : selectedItem?.title}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {selectedItem && 'description' in selectedItem ? (
              // Organization Details
              <View>
                <Text style={styles.detailSectionTitle}>About</Text>
                <Text style={styles.detailText}>{selectedItem.description}</Text>
                
                <Text style={styles.detailSectionTitle}>Category</Text>
                <Text style={styles.detailText}>{selectedItem.category}</Text>
                
                <Text style={styles.detailSectionTitle}>County</Text>
                <Text style={styles.detailText}>{selectedItem.county}</Text>
                
                <Text style={styles.detailSectionTitle}>Founded</Text>
                <Text style={styles.detailText}>{selectedItem.founded_date}</Text>
                
                <Text style={styles.detailSectionTitle}>Members</Text>
                <Text style={styles.detailText}>{selectedItem.member_count} young people</Text>
                
                <Text style={styles.detailSectionTitle}>Focus Areas</Text>
                <View style={styles.detailTags}>
                  {selectedItem.focus_areas.map((area, index) => (
                    <View key={index} style={styles.detailTag}>
                      <Text style={styles.detailTagText}>{area}</Text>
                    </View>
                  ))}
                </View>
                
                {selectedItem.contact_info.email && (
                  <>
                    <Text style={styles.detailSectionTitle}>Contact</Text>
                    <Text style={styles.detailText}>Email: {selectedItem.contact_info.email}</Text>
                    {selectedItem.contact_info.phone && (
                      <Text style={styles.detailText}>Phone: {selectedItem.contact_info.phone}</Text>
                    )}
                    {selectedItem.contact_info.website && (
                      <Text style={styles.detailText}>Website: {selectedItem.contact_info.website}</Text>
                    )}
                  </>
                )}
              </View>
            ) : (
              // Challenge Details
              <View>
                <Text style={styles.detailSectionTitle}>Description</Text>
                <Text style={styles.detailText}>{selectedItem?.description}</Text>
                
                <Text style={styles.detailSectionTitle}>Reward</Text>
                <Text style={styles.detailText}>{selectedItem?.xp_reward} XP points</Text>
                
                <Text style={styles.detailSectionTitle}>Difficulty</Text>
                <Text style={styles.detailText}>{selectedItem?.difficulty}</Text>
                
                <Text style={styles.detailSectionTitle}>Participants</Text>
                <Text style={styles.detailText}>{selectedItem?.participants} youth joined</Text>
                
                {selectedItem?.deadline && (
                  <>
                    <Text style={styles.detailSectionTitle}>Deadline</Text>
                    <Text style={styles.detailText}>{selectedItem.deadline}</Text>
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#ff9800', '#f57c00']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🧑‍🎓 Youth Hub</Text>
        <Text style={styles.headerSubtitle}>
          Connect, Learn & Lead with Kenya's Youth
        </Text>
        
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{organizations.length}</Text>
            <Text style={styles.statLabel}>Organizations</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{challenges.length}</Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2.5K+</Text>
            <Text style={styles.statLabel}>Youth Active</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search organizations and challenges..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'organizations' && styles.activeTab]}
          onPress={() => setActiveTab('organizations')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={activeTab === 'organizations' ? '#ff9800' : '#6b7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'organizations' && styles.activeTabText]}>
            Organizations
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
          onPress={() => setActiveTab('challenges')}
        >
          <Ionicons 
            name="trophy" 
            size={20} 
            color={activeTab === 'challenges' ? '#ff9800' : '#6b7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>
            Challenges
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'opportunities' && styles.activeTab]}
          onPress={() => setActiveTab('opportunities')}
        >
          <Ionicons 
            name="bulb" 
            size={20} 
            color={activeTab === 'opportunities' ? '#ff9800' : '#6b7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'opportunities' && styles.activeTabText]}>
            Opportunities
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'organizations' ? (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏢 Youth Organizations</Text>
              <Text style={styles.sectionSubtitle}>
                Join organizations making a difference
              </Text>
            </View>
            {organizations.map(renderOrganizationCard)}
          </View>
        ) : activeTab === 'challenges' ? (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏆 Youth Challenges</Text>
              <Text style={styles.sectionSubtitle}>
                Take on challenges and earn XP
              </Text>
            </View>
            {challenges.map(renderChallengeCard)}
          </View>
        ) : (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💡 Opportunities</Text>
              <Text style={styles.sectionSubtitle}>
                Coming soon! Stay tuned for internships, scholarships, and more.
              </Text>
            </View>
            <View style={styles.comingSoonCard}>
              <Ionicons name="bulb" size={48} color="#ff9800" />
              <Text style={styles.comingSoonTitle}>Opportunities Coming Soon!</Text>
              <Text style={styles.comingSoonText}>
                We're working on bringing you amazing opportunities including internships, 
                scholarships, mentorship programs, and more ways to grow your skills and career.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      {renderDetailModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    backdropFilter: 'blur(10px)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ff9800',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  organizationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  orgHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  orgLogoContainer: {
    marginRight: 16,
  },
  orgLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  orgLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  orgDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  orgMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  orgCounty: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  orgMembers: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  verificationBadge: {
    marginLeft: 8,
  },
  orgFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  focusAreas: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  focusArea: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  focusAreaText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  challengeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  challengeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  challengeDifficulty: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  challengeMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeCategory: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  joinChallengeButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinChallengeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  comingSoonCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  modalBody: {
    padding: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  detailTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailTagText: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '500',
  },
});

export default YouthHubScreen;
