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
import type { PoliticsStackParamList } from '../../navigation/PoliticsStackNavigator';
import { Politician } from '../../types';

interface PoliticianComparisonScreenProps {
  navigation: NativeStackNavigationProp<PoliticsStackParamList, 'PoliticianComparison'>;
}

interface ComparisonPolitician extends Politician {
  years: number;
  attendance: number;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  billsSponsored: number;
  promises: {
    total: number;
    fulfilled: number;
    inProgress: number;
    broken: number;
  };
  ratings: {
    overall: number;
    transparency: number;
    effectiveness: number;
    accessibility: number;
  };
  keyAchievements?: string[];
}

const mockPoliticians: ComparisonPolitician[] = [
  {
    id: 1,
    name: 'William Ruto',
    position: 'President of Kenya',
    current_position: 'President of Kenya',
    party: 'UDA',
    slug: 'william-ruto',
    wikipedia_summary: 'William Samoei Ruto is the fifth and current President of Kenya.',
    bio: 'PhD in Plant Ecology, University of Nairobi; BSc Botany and Zoology, University of Nairobi',
    years: 25,
    attendance: 95,
    votesFor: 156,
    votesAgainst: 23,
    abstentions: 8,
    billsSponsored: 12,
    promises: { total: 20, fulfilled: 8, inProgress: 10, broken: 2 },
    ratings: { overall: 4.2, transparency: 4.0, effectiveness: 4.5, accessibility: 4.0 },
    keyAchievements: [
      'President of Kenya 2022-present',
      'Deputy President 2013-2022',
      'Minister for Agriculture 2008-2010',
      'ICC case acquittal 2016'
    ]
  },
  {
    id: 2,
    name: 'Raila Odinga',
    position: 'Opposition Leader',
    current_position: 'Opposition Leader',
    party: 'ODM',
    slug: 'raila-odinga',
    wikipedia_summary: 'Raila Amolo Odinga is a Kenyan politician who served as Prime Minister of Kenya from 2008 to 2013.',
    bio: 'MSc Mechanical Engineering, University of Magdeburg, Germany; BSc Mechanical Engineering, University of Nairobi',
    years: 30,
    attendance: 92,
    votesFor: 142,
    votesAgainst: 35,
    abstentions: 15,
    billsSponsored: 18,
    promises: { total: 25, fulfilled: 12, inProgress: 8, broken: 5 },
    ratings: { overall: 4.0, transparency: 4.2, effectiveness: 3.8, accessibility: 4.5 },
  },
  {
    id: 3,
    name: 'Martha Karua',
    position: 'NARC-Kenya Party Leader',
    current_position: 'NARC-Kenya Party Leader',
    party: 'NARC-Kenya',
    slug: 'martha-karua',
    wikipedia_summary: 'Martha Wangari Karua is a Kenyan politician and advocate, known as the Iron Lady of Kenyan politics.',
    bio: 'LLB University of Nairobi; Advocate of the High Court of Kenya',
    years: 22,
    attendance: 98,
    votesFor: 134,
    votesAgainst: 28,
    abstentions: 5,
    billsSponsored: 15,
    promises: { total: 18, fulfilled: 10, inProgress: 6, broken: 2 },
    ratings: { overall: 4.3, transparency: 4.6, effectiveness: 4.2, accessibility: 3.9 },
  },
  {
    id: 4,
    name: 'Kalonzo Musyoka',
    position: 'Wiper Party Leader',
    current_position: 'Wiper Party Leader',
    party: 'Wiper',
    slug: 'kalonzo-musyoka',
    wikipedia_summary: 'Stephen Kalonzo Musyoka is a Kenyan politician who served as the tenth Vice President of Kenya.',
    bio: 'LLB University of Nairobi; Advocate of the High Court of Kenya; Cyprus Law School',
    years: 28,
    attendance: 88,
    votesFor: 148,
    votesAgainst: 32,
    abstentions: 12,
    billsSponsored: 14,
    promises: { total: 22, fulfilled: 9, inProgress: 9, broken: 4 },
    ratings: { overall: 3.8, transparency: 3.9, effectiveness: 3.7, accessibility: 4.1 },
  },
];

export const PoliticianComparisonScreen: React.FC<PoliticianComparisonScreenProps> = ({ navigation }) => {
  const [selectedPoliticians, setSelectedPoliticians] = useState<ComparisonPolitician[]>([mockPoliticians[0], mockPoliticians[1]]);
  const [showPoliticianModal, setShowPoliticianModal] = useState(false);
  const [selectingIndex, setSelectingIndex] = useState<0 | 1>(0);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleSelectPolitician = (politician: ComparisonPolitician) => {
    const newSelected = [...selectedPoliticians];
    newSelected[selectingIndex] = politician;
    setSelectedPoliticians(newSelected);
    setShowPoliticianModal(false);
  };

  const handleAnalysis = () => {
    setShowAnalysisModal(true);
  };

  const handleShare = () => {
    // Share functionality
    console.log('Sharing comparison...');
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting comparison...');
  };

  const categories = [
    { id: 'all', name: 'All Categories', icon: 'dashboard' as keyof typeof MaterialIcons.glyphMap },
    { id: 'performance', name: 'Performance', icon: 'trending-up' as keyof typeof MaterialIcons.glyphMap },
    { id: 'promises', name: 'Promises', icon: 'assignment-turned-in' as keyof typeof MaterialIcons.glyphMap },
    { id: 'transparency', name: 'Transparency', icon: 'visibility' as keyof typeof MaterialIcons.glyphMap },
    { id: 'engagement', name: 'Public Engagement', icon: 'people' as keyof typeof MaterialIcons.glyphMap },
  ];

  const openPoliticianSelector = (index: 0 | 1) => {
    setSelectingIndex(index);
    setShowPoliticianModal(true);
  };

  const getComparisonColor = (value1: number, value2: number, higherIsBetter = true) => {
    if (value1 === value2) return '#6B7280';
    const isFirst = higherIsBetter ? value1 > value2 : value1 < value2;
    return isFirst ? '#10B981' : '#EF4444';
  };

  const renderComparisonMetric = (
    label: string,
    value1: number | string,
    value2: number | string,
    suffix = '',
    higherIsBetter = true
  ) => {
    const numValue1 = typeof value1 === 'string' ? parseFloat(value1) : value1;
    const numValue2 = typeof value2 === 'string' ? parseFloat(value2) : value2;

    return (
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>{label}</Text>
        <View style={styles.metricValues}>
          <Text style={[
            styles.metricValue,
            { color: getComparisonColor(numValue1, numValue2, higherIsBetter) }
          ]}>
            {value1}{suffix}
          </Text>
          <Text style={[
            styles.metricValue,
            { color: getComparisonColor(numValue2, numValue1, higherIsBetter) }
          ]}>
            {value2}{suffix}
          </Text>
        </View>
      </View>
    );
  };

  const renderPoliticianCard = (politician: ComparisonPolitician, index: 0 | 1) => (
    <TouchableOpacity
      style={[styles.politicianCard, index === 1 && styles.politicianCardRight]}
      onPress={() => openPoliticianSelector(index)}
    >
      <LinearGradient
        colors={index === 0 ? ['#3B82F6', '#1E40AF'] : ['#8B5CF6', '#7C3AED']}
        style={styles.politicianGradient}
      >
        <View style={styles.politicianAvatar}>
          <Text style={styles.politicianInitials}>
            {politician.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </Text>
        </View>
        <Text style={styles.politicianName}>{politician.name}</Text>
        <Text style={styles.politicianTitle}>{politician.position || politician.current_position}</Text>
        <Text style={styles.politicianParty}>{politician.party}</Text>
        <TouchableOpacity style={styles.changeButton}>
          <MaterialIcons name="swap-horiz" size={16} color="#FFFFFF" />
          <Text style={styles.changeButtonText}>Change</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderPoliticianSelector = ({ item }: { item: ComparisonPolitician }) => (
    <TouchableOpacity
      style={styles.selectorItem}
      onPress={() => handleSelectPolitician(item)}
    >
      <View style={styles.selectorAvatar}>
        <Text style={styles.selectorInitials}>
          {item.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </Text>
      </View>
      <View style={styles.selectorInfo}>
        <Text style={styles.selectorName}>{item.name}</Text>
        <Text style={styles.selectorTitle}>{item.position || item.current_position}</Text>
        <Text style={styles.selectorParty}>{item.party}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#666" />
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
        <Text style={styles.headerTitle}>Compare Politicians</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowAnalysisModal(true)}
        >
          <MaterialIcons name="analytics" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Politician Selection Cards */}
        <View style={styles.selectionSection}>
          <View style={styles.politicianCards}>
            {renderPoliticianCard(selectedPoliticians[0], 0)}
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            {renderPoliticianCard(selectedPoliticians[1], 1)}
          </View>
        </View>

        {/* Action Tools */}
        <View style={styles.actionSection}>
          <Text style={styles.actionTitle}>Comparison Tools</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleAnalysis}>
              <LinearGradient
                colors={['#3B82F6', '#1E40AF']}
                style={styles.actionGradient}
              >
                <MaterialIcons name="analytics" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Deep Analysis</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.actionGradient}
              >
                <MaterialIcons name="share" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Share</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.actionGradient}
              >
                <MaterialIcons name="file-download" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Export</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>Filter by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id && styles.categoryCardActive
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <MaterialIcons
                    name={category.icon}
                    size={20}
                    color={selectedCategory === category.id ? '#FFFFFF' : '#3B82F6'}
                  />
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Comparison Metrics */}
        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Performance Comparison</Text>

          {/* Basic Info */}
          <View style={styles.metricGroup}>
            <Text style={styles.groupTitle}>Experience & Tenure</Text>
            {renderComparisonMetric('Years in Office', selectedPoliticians[0].years, selectedPoliticians[1].years, ' years')}
            {renderComparisonMetric('Attendance Rate', selectedPoliticians[0].attendance, selectedPoliticians[1].attendance, '%')}
          </View>

          {/* Voting Record */}
          <View style={styles.metricGroup}>
            <Text style={styles.groupTitle}>Voting Record</Text>
            {renderComparisonMetric('Votes For', selectedPoliticians[0].votesFor, selectedPoliticians[1].votesFor)}
            {renderComparisonMetric('Votes Against', selectedPoliticians[0].votesAgainst, selectedPoliticians[1].votesAgainst)}
            {renderComparisonMetric('Abstentions', selectedPoliticians[0].abstentions, selectedPoliticians[1].abstentions, '', false)}
            {renderComparisonMetric('Bills Sponsored', selectedPoliticians[0].billsSponsored, selectedPoliticians[1].billsSponsored)}
          </View>

          {/* Promise Fulfillment */}
          <View style={styles.metricGroup}>
            <Text style={styles.groupTitle}>Promise Fulfillment</Text>
            {renderComparisonMetric('Total Promises', selectedPoliticians[0].promises.total, selectedPoliticians[1].promises.total)}
            {renderComparisonMetric('Fulfilled', selectedPoliticians[0].promises.fulfilled, selectedPoliticians[1].promises.fulfilled)}
            {renderComparisonMetric('In Progress', selectedPoliticians[0].promises.inProgress, selectedPoliticians[1].promises.inProgress)}
            {renderComparisonMetric('Broken', selectedPoliticians[0].promises.broken, selectedPoliticians[1].promises.broken, '', false)}
          </View>

          {/* Ratings */}
          <View style={styles.metricGroup}>
            <Text style={styles.groupTitle}>Public Ratings</Text>
            {renderComparisonMetric('Overall Rating', selectedPoliticians[0].ratings.overall.toFixed(1), selectedPoliticians[1].ratings.overall.toFixed(1), '/5')}
            {renderComparisonMetric('Transparency', selectedPoliticians[0].ratings.transparency.toFixed(1), selectedPoliticians[1].ratings.transparency.toFixed(1), '/5')}
            {renderComparisonMetric('Effectiveness', selectedPoliticians[0].ratings.effectiveness.toFixed(1), selectedPoliticians[1].ratings.effectiveness.toFixed(1), '/5')}
            {renderComparisonMetric('Accessibility', selectedPoliticians[0].ratings.accessibility.toFixed(1), selectedPoliticians[1].ratings.accessibility.toFixed(1), '/5')}
          </View>
        </View>
      </ScrollView>

      {/* Politician Selection Modal */}
      <Modal
        visible={showPoliticianModal}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPoliticianModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Politician</Text>
            <View style={styles.modalHeaderRight} />
          </View>
          <FlatList
            data={mockPoliticians.filter(p => p.id !== selectedPoliticians[selectingIndex === 0 ? 1 : 0].id)}
            renderItem={renderPoliticianSelector}
            keyExtractor={(item) => item.id.toString()}
            style={styles.selectorList}
          />
        </SafeAreaView>
      </Modal>

      {/* Analysis Modal */}
      <Modal
        visible={showAnalysisModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.analysisModalOverlay}>
          <View style={styles.analysisModalContent}>
            <View style={styles.analysisHeader}>
              <Text style={styles.analysisTitle}>Deep Analysis</Text>
              <TouchableOpacity
                style={styles.analysisCloseButton}
                onPress={() => setShowAnalysisModal(false)}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.analysisScrollView}>
              <View style={styles.analysisSection}>
                <Text style={styles.analysisSectionTitle}>Key Insights</Text>
                <View style={styles.insightCard}>
                  <MaterialIcons name="trending-up" size={20} color="#10B981" />
                  <Text style={styles.insightText}>
                    {selectedPoliticians[0].name} has {selectedPoliticians[0].attendance}% attendance vs {selectedPoliticians[1].name}'s {selectedPoliticians[1].attendance}%
                  </Text>
                </View>
                <View style={styles.insightCard}>
                  <MaterialIcons name="how-to-vote" size={20} color="#3B82F6" />
                  <Text style={styles.insightText}>
                    Promise fulfillment rates: {((selectedPoliticians[0].promises.fulfilled / selectedPoliticians[0].promises.total) * 100).toFixed(1)}% vs {((selectedPoliticians[1].promises.fulfilled / selectedPoliticians[1].promises.total) * 100).toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.insightCard}>
                  <MaterialIcons name="visibility" size={20} color="#8B5CF6" />
                  <Text style={styles.insightText}>
                    Transparency scores: {selectedPoliticians[0].ratings.transparency}/5 vs {selectedPoliticians[1].ratings.transparency}/5
                  </Text>
                </View>
              </View>

              <View style={styles.analysisSection}>
                <Text style={styles.analysisSectionTitle}>Source Verification</Text>
                <View style={styles.verificationCard}>
                  <MaterialIcons name="verified" size={20} color="#10B981" />
                  <Text style={styles.verificationText}>
                    All voting records verified through Parliamentary Hansard
                  </Text>
                </View>
                <View style={styles.verificationCard}>
                  <MaterialIcons name="fact-check" size={20} color="#10B981" />
                  <Text style={styles.verificationText}>
                    Promise tracking verified through multiple news sources
                  </Text>
                </View>
                <View style={styles.verificationCard}>
                  <MaterialIcons name="link" size={20} color="#3B82F6" />
                  <Text style={styles.verificationText}>
                    Career achievements cross-referenced with official records
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
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
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionSection: {
    padding: 24,
  },
  politicianCards: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  politicianCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  politicianCardRight: {
    flex: 1,
  },
  politicianGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  politicianAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  politicianInitials: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  politicianName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  politicianTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  politicianParty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    marginTop: 8,
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  vsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  comparisonSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  metricGroup: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  metricLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  metricValues: {
    flexDirection: 'row',
    gap: 32,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalHeaderRight: {
    width: 40,
  },
  selectorList: {
    flex: 1,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectorInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  selectorInfo: {
    flex: 1,
  },
  selectorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectorTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  selectorParty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  // Action Section Styles
  actionSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionGradient: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Category Section Styles
  categorySection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoryScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 8,
  },
  categoryCardActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  // Analysis Modal Styles
  analysisModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  analysisModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  analysisCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisScrollView: {
    flex: 1,
    padding: 24,
  },
  analysisSection: {
    marginBottom: 24,
  },
  analysisSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  verificationText: {
    flex: 1,
    fontSize: 14,
    color: '#065f46',
    lineHeight: 20,
  },
});