import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ShareButton from '../components/ShareButton';

const { width } = Dimensions.get('window');

interface Politician {
  id: number;
  name: string;
  current_position: string;
  party_history: string[];
  constituency: string;
  wikipedia_summary: string;
  key_achievements: string[];
  education: string;
  image_url?: string;
  party_color?: string;
  slug: string;
}

interface ComparisonData {
  politicians: Politician[];
  comparisonMetrics: {
    experience: { [key: number]: number };
    achievements: { [key: number]: number };
    education: { [key: number]: number };
    partyStability: { [key: number]: number };
    publicEngagement: { [key: number]: number };
  };
}

const PoliticianComparisonScreen = () => {
  const navigation = useNavigation();
  const [selectedPoliticians, setSelectedPoliticians] = useState<Politician[]>([]);
  const [allPoliticians, setAllPoliticians] = useState<Politician[]>([]);
  const [showPoliticianSelector, setShowPoliticianSelector] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [activeMetric, setActiveMetric] = useState('overview');

  useEffect(() => {
    loadPoliticiansData();
  }, []);

  useEffect(() => {
    if (selectedPoliticians.length > 0) {
      generateComparisonData();
    }
  }, [selectedPoliticians]);

  const loadPoliticiansData = () => {
    const samplePoliticians = [
      {
        id: 1,
        name: 'William Ruto',
        current_position: '5th President of Kenya',
        party_history: ['KANU (2002-2007)', 'ODM (2007-2012)', 'URP/Jubilee (2013-2021)', 'UDA (2022-present)'],
        constituency: 'Sugoi (historical)',
        wikipedia_summary: 'William Samoei Ruto is the 5th President of Kenya, serving since 2022.',
        key_achievements: ['Deputy President 2013-2022', 'President 2022-present', 'Bottom-up Economic Transformation'],
        education: 'University of Nairobi (BSc), University of Queensland (PhD)',
        party_color: '#3B82F6',
        slug: 'william-ruto'
      },
      {
        id: 2,
        name: 'Raila Odinga',
        current_position: 'Former Prime Minister',
        party_history: ['KANU (1990s)', 'NARC (2002-2005)', 'ODM (2005-present)'],
        constituency: 'Langata (historical)',
        wikipedia_summary: 'Raila Amollo Odinga is a Kenyan politician who served as Prime Minister from 2008 to 2013.',
        key_achievements: ['Prime Minister 2008-2013', 'Opposition Leader', 'AU High Representative'],
        education: 'University of Leipzig (MSc)',
        party_color: '#F59E0B',
        slug: 'raila-odinga'
      },
      {
        id: 3,
        name: 'Martha Karua',
        current_position: 'Former MP, Gichugu',
        party_history: ['KANU (1990s)', 'NARC (2002-2005)', 'NARC-Kenya (2005-2013)', 'Independent'],
        constituency: 'Gichugu',
        wikipedia_summary: 'Martha Wangari Karua is a Kenyan lawyer and politician who served as MP for Gichugu from 1993 to 2013.',
        key_achievements: ['Minister for Justice', 'Presidential Candidate 2013', 'Constitutional Lawyer'],
        education: 'University of Nairobi (LLB)',
        party_color: '#EF4444',
        slug: 'martha-karua'
      },
      {
        id: 4,
        name: 'Uhuru Kenyatta',
        current_position: 'Former President of Kenya',
        party_history: ['KANU (2002-2012)', 'TNA (2012-2016)', 'Jubilee (2016-2022)'],
        constituency: 'Gatundu South (historical)',
        wikipedia_summary: 'Uhuru Muigai Kenyatta served as the 4th President of Kenya from 2013 to 2022.',
        key_achievements: ['President 2013-2022', 'Deputy Prime Minister 2008-2013', 'Minister for Finance'],
        education: 'Amherst College (BA)',
        party_color: '#10B981',
        slug: 'uhuru-kenyatta'
      },
      {
        id: 5,
        name: 'Anne Waiguru',
        current_position: 'Governor, Kirinyaga',
        party_history: ['Jubilee (2013-2022)', 'UDA (2022-present)'],
        constituency: 'Kirinyaga County',
        wikipedia_summary: 'Anne Mumbi Waiguru is the current Governor of Kirinyaga County.',
        key_achievements: ['Governor Kirinyaga 2017-present', 'Cabinet Secretary for Devolution', 'Anti-Corruption Champion'],
        education: 'University of Nairobi (BSc), University of London (MSc)',
        party_color: '#8B5CF6',
        slug: 'anne-waiguru'
      }
    ];

    setAllPoliticians(samplePoliticians);
  };

  const generateComparisonData = () => {
    const metrics = {
      experience: {} as { [key: number]: number },
      achievements: {} as { [key: number]: number },
      education: {} as { [key: number]: string },
      partyStability: {} as { [key: number]: number },
      publicEngagement: {} as { [key: number]: number },
    };

    selectedPoliticians.forEach(politician => {
      const currentYear = new Date().getFullYear();
      const startYear = 2000;
      metrics.experience[politician.id] = currentYear - startYear;
      metrics.achievements[politician.id] = politician.key_achievements.length;

      let educationScore = 0;
      if (politician.education.includes('PhD') || politician.education.includes('Doctorate')) educationScore = 4;
      else if (politician.education.includes('MSc') || politician.education.includes('MA') || politician.education.includes('LLM')) educationScore = 3;
      else if (politician.education.includes('BSc') || politician.education.includes('BA') || politician.education.includes('LLB')) educationScore = 2;
      else educationScore = 1;
      metrics.education[politician.id] = educationScore;

      metrics.partyStability[politician.id] = Math.max(0, 5 - politician.party_history.length);

      let engagementScore = 0;
      if (politician.current_position.toLowerCase().includes('president')) engagementScore = 5;
      else if (politician.current_position.toLowerCase().includes('prime minister')) engagementScore = 4;
      else if (politician.current_position.toLowerCase().includes('governor')) engagementScore = 3;
      else if (politician.current_position.toLowerCase().includes('mp') || politician.current_position.toLowerCase().includes('senator')) engagementScore = 2;
      else engagementScore = 1;
      metrics.publicEngagement[politician.id] = engagementScore;
    });

    setComparisonData({
      politicians: selectedPoliticians,
      comparisonMetrics: metrics
    });
  };

  const addPolitician = (politician: Politician) => {
    if (selectedPoliticians.length >= 4) {
      Alert.alert('Maximum Reached', 'You can compare up to 4 politicians at once.');
      return;
    }
    
    if (selectedPoliticians.find(p => p.id === politician.id)) {
      Alert.alert('Already Selected', 'This politician is already in the comparison.');
      return;
    }

    setSelectedPoliticians([...selectedPoliticians, politician]);
  };

  const removePolitician = (politicianId: number) => {
    setSelectedPoliticians(selectedPoliticians.filter(p => p.id !== politicianId));
  };

  const renderPoliticianCard = (politician: Politician, isSelected = false) => (
    <TouchableOpacity
      key={politician.id}
      style={[
        styles.politicianCard,
        isSelected && styles.selectedPoliticianCard
      ]}
      onPress={() => isSelected ? removePolitician(politician.id) : addPolitician(politician)}
      disabled={!isSelected && selectedPoliticians.length >= 4}
      activeOpacity={0.8}
    >
      <View style={styles.politicianImageContainer}>
        <View style={[
          styles.politicianImagePlaceholder,
          { backgroundColor: politician.party_color || '#6B7280' }
        ]}>
          <Text style={styles.politicianInitial}>{politician.name.charAt(0)}</Text>
        </View>
        {isSelected && (
          <TouchableOpacity style={styles.removeButton} onPress={() => removePolitician(politician.id)}>
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.politicianName} numberOfLines={2}>{politician.name}</Text>
      <Text style={styles.politicianPosition} numberOfLines={2}>{politician.current_position}</Text>
      <View style={[styles.partyIndicator, { backgroundColor: politician.party_color + '20' }]}>
        <Text style={[styles.partyText, { color: politician.party_color }]}>
          {politician.party_history[politician.party_history.length - 1]?.split(' ')[0] || 'IND'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMetricBar = (value: number, maxValue: number, color: string) => (
    <View style={styles.metricBarContainer}>
      <View style={[styles.metricBar, { backgroundColor: color + '20' }]}>
        <View 
          style={[
            styles.metricBarFill, 
            { 
              width: `${(value / maxValue) * 100}%`,
              backgroundColor: color 
            }
          ]} 
        />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );

  const renderComparisonTable = () => {
    if (!comparisonData || selectedPoliticians.length < 2) return null;

    const metrics = comparisonData.comparisonMetrics;

    return (
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>Performance Comparison</Text>
        
        <View style={styles.comparisonTable}>
          {/* Header Row */}
          <View style={styles.tableHeaderRow}>
            <View style={styles.metricLabelCell}>
              <Text style={styles.tableHeaderText}>Metrics</Text>
            </View>
            {selectedPoliticians.map(politician => (
              <View key={politician.id} style={styles.tableHeaderCell}>
                <View style={[styles.miniAvatar, { backgroundColor: politician.party_color }]}>
                  <Text style={styles.miniAvatarText}>{politician.name.charAt(0)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Experience Row */}
          <View style={styles.tableRow}>
            <View style={styles.metricLabelCell}>
              <Ionicons name="briefcase" size={20} color="#6B7280" />
              <Text style={styles.metricLabel}>Experience</Text>
            </View>
            {selectedPoliticians.map(politician => (
              <View key={politician.id} style={styles.metricCell}>
                {renderMetricBar(metrics.experience[politician.id], 30, politician.party_color || '#6B7280')}
              </View>
            ))}
          </View>

          {/* Achievements Row */}
          <View style={styles.tableRow}>
            <View style={styles.metricLabelCell}>
              <Ionicons name="trophy" size={20} color="#6B7280" />
              <Text style={styles.metricLabel}>Achievements</Text>
            </View>
            {selectedPoliticians.map(politician => (
              <View key={politician.id} style={styles.metricCell}>
                {renderMetricBar(metrics.achievements[politician.id], 10, politician.party_color || '#6B7280')}
              </View>
            ))}
          </View>

          {/* Education Row */}
          <View style={styles.tableRow}>
            <View style={styles.metricLabelCell}>
              <Ionicons name="school" size={20} color="#6B7280" />
              <Text style={styles.metricLabel}>Education</Text>
            </View>
            {selectedPoliticians.map(politician => (
              <View key={politician.id} style={styles.metricCell}>
                {renderMetricBar(metrics.education[politician.id], 4, politician.party_color || '#6B7280')}
              </View>
            ))}
          </View>

          {/* Party Stability Row */}
          <View style={styles.tableRow}>
            <View style={styles.metricLabelCell}>
              <Ionicons name="trending-up" size={20} color="#6B7280" />
              <Text style={styles.metricLabel}>Stability</Text>
            </View>
            {selectedPoliticians.map(politician => (
              <View key={politician.id} style={styles.metricCell}>
                {renderMetricBar(metrics.partyStability[politician.id], 5, politician.party_color || '#6B7280')}
              </View>
            ))}
          </View>

          {/* Public Engagement Row */}
          <View style={styles.tableRow}>
            <View style={styles.metricLabelCell}>
              <Ionicons name="people" size={20} color="#6B7280" />
              <Text style={styles.metricLabel}>Engagement</Text>
            </View>
            {selectedPoliticians.map(politician => (
              <View key={politician.id} style={styles.metricCell}>
                {renderMetricBar(metrics.publicEngagement[politician.id], 5, politician.party_color || '#6B7280')}
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderPoliticianSelector = () => (
    <Modal
      visible={showPoliticianSelector}
      animationType="slide"
      onRequestClose={() => setShowPoliticianSelector(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modernModalHeader}>
          <View>
            <Text style={styles.modernModalTitle}>Select Politicians</Text>
            <Text style={styles.modernModalSubtitle}>Choose 2-4 politicians to compare</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowPoliticianSelector(false)}
            style={styles.modernCloseButton}
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.politicianGrid}>
            {allPoliticians.map(politician => (
              <View key={politician.id} style={styles.gridItem}>
                {renderPoliticianCard(politician, selectedPoliticians.find(p => p.id === politician.id))}
              </View>
            ))}
          </View>
        </ScrollView>
        
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => setShowPoliticianSelector(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>
              Done ({selectedPoliticians.length} selected)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      
      {/* Modern Header */}
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8', '#1E40AF']}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Compare Politicians</Text>
            <Text style={styles.headerSubtitle}>Side-by-side performance analysis</Text>
          </View>
          {selectedPoliticians.length >= 2 && (
            <ShareButton
              data={{
                politicians: selectedPoliticians.map(p => ({
                  name: p.name,
                  position: p.current_position,
                  party: p.party_history[p.party_history.length - 1] || 'Independent',
                  achievements: p.key_achievements,
                  summary: p.wikipedia_summary,
                })),
                metrics: comparisonData?.comparisonMetrics,
              }}
              type="comparison"
              variant="minimal"
              iconSize={20}
              showText={false}
              style={styles.shareButton}
            />
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Selected Politicians Section */}
        <View style={styles.selectedSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Selected for Comparison</Text>
              <Text style={styles.sectionSubtitle}>{selectedPoliticians.length} of 4 politicians selected</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowPoliticianSelector(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {selectedPoliticians.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="swap-horizontal" size={48} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No Politicians Selected</Text>
              <Text style={styles.emptySubtitle}>
                Select 2-4 politicians to start comparing their performance, achievements, and background
              </Text>
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={() => setShowPoliticianSelector(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.emptyActionButtonText}>Select Politicians</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.selectedGrid}>
              {selectedPoliticians.map(politician => (
                <View key={politician.id} style={styles.selectedItem}>
                  {renderPoliticianCard(politician, true)}
                </View>
              ))}
              
              {/* Add more slots if less than 4 */}
              {Array.from({ length: 4 - selectedPoliticians.length }).map((_, index) => (
                <TouchableOpacity
                  key={`empty-${index}`}
                  style={styles.emptySlot}
                  onPress={() => setShowPoliticianSelector(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={32} color="#9CA3AF" />
                  <Text style={styles.emptySlotText}>Add Politician</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Comparison Table */}
        {selectedPoliticians.length >= 2 && renderComparisonTable()}

        {/* Detailed Analysis */}
        {selectedPoliticians.length >= 2 && (
          <View style={styles.detailedSection}>
            <Text style={styles.sectionTitle}>Detailed Analysis</Text>
            <Text style={styles.sectionSubtitle}>Individual profiles and achievements</Text>
            
            {selectedPoliticians.map((politician, index) => (
              <View key={politician.id} style={styles.detailedCard}>
                <View style={styles.detailedHeader}>
                  <View style={styles.detailedImageContainer}>
                    <View style={[
                      styles.detailedImagePlaceholder,
                      { backgroundColor: politician.party_color }
                    ]}>
                      <Text style={styles.detailedInitial}>{politician.name.charAt(0)}</Text>
                    </View>
                  </View>
                  <View style={styles.detailedInfo}>
                    <Text style={styles.detailedName}>{politician.name}</Text>
                    <Text style={styles.detailedPosition}>{politician.current_position}</Text>
                    <View style={styles.detailedMetaRow}>
                      <Ionicons name="location" size={14} color="#6B7280" />
                      <Text style={styles.detailedMeta}>{politician.constituency}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.achievementsList}>
                  <Text style={styles.achievementsTitle}>Key Achievements</Text>
                  <View style={styles.achievementsGrid}>
                    {politician.key_achievements.map((achievement, achievementIndex) => (
                      <View key={achievementIndex} style={[styles.achievementChip, { backgroundColor: politician.party_color + '10' }]}>
                        <Ionicons name="checkmark-circle" size={14} color={politician.party_color} />
                        <Text style={[styles.achievementText, { color: politician.party_color }]}>
                          {achievement}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.educationSection}>
                  <Text style={styles.educationTitle}>Education</Text>
                  <View style={styles.educationBadge}>
                    <Ionicons name="school" size={16} color="#8B5CF6" />
                    <Text style={styles.educationText}>{politician.education}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {renderPoliticianSelector()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  selectedSection: {
    marginVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  emptyActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  selectedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  selectedItem: {
    width: (width - 64) / 2,
  },
  emptySlot: {
    width: (width - 64) / 2,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptySlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 8,
  },
  politicianCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedPoliticianCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#F8FAFF',
  },
  politicianImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  politicianImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  politicianInitial: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  politicianName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  politicianPosition: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  partyIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  partyText: {
    fontSize: 10,
    fontWeight: '900',
  },
  comparisonSection: {
    marginBottom: 24,
  },
  comparisonTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  tableHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metricLabelCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  metricCell: {
    flex: 1,
    alignItems: 'center',
  },
  metricBarContainer: {
    alignItems: 'center',
    gap: 8,
  },
  metricBar: {
    width: 60,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  detailedSection: {
    marginBottom: 24,
  },
  detailedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailedImageContainer: {
    marginRight: 16,
  },
  detailedImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  detailedInitial: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  detailedInfo: {
    flex: 1,
  },
  detailedName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  detailedPosition: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  detailedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailedMeta: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  achievementsList: {
    marginBottom: 20,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  achievementChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '700',
  },
  educationSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  educationTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  educationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
    alignSelf: 'flex-start',
  },
  educationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modernModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modernModalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  modernModalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modernCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  politicianGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 20,
  },
  gridItem: {
    width: (width - 64) / 2,
  },
  modalFooter: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  doneButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});

export default PoliticianComparisonScreen;