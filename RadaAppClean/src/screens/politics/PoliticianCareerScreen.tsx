import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, LoadingSpinner, ErrorDisplay } from '../../components/ui';
import { Politician } from '../../types';
import { colors, shadows } from '../../theme';
import ApiService from '../../services/api';

interface PoliticianCareerScreenProps {
  politicianId: number;
  politicianName: string;
  onBack: () => void;
}

export const PoliticianCareerScreen: React.FC<PoliticianCareerScreenProps> = ({
  politicianId,
  politicianName,
  onBack,
}) => {
  const [careerDetails, setCareerDetails] = useState<Politician | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCareerModal, setSelectedCareerModal] = useState<{
    type: 'education' | 'achievement' | 'position';
    item: string;
    index: number;
  } | null>(null);
  const [showEducationSources, setShowEducationSources] = useState(false);
  const [showAchievementSources, setShowAchievementSources] = useState(false);
  const [showPositionSources, setShowPositionSources] = useState(false);

  const fetchCareerDetails = async (refresh = false) => {
    if (!refresh) setLoading(true);
    setError(null);

    try {
      // Fetch career details from API
      const response = await ApiService.getCareer(politicianId);
      const data = response.success ? response.data : response;

      setCareerDetails(data || { positions: [], education: [], achievements: [] });

      /* Mock career details data - replaced with actual API call
      const mockCareerDetails: Politician = {
        id: politicianId,
        name: politicianName,
        position: 'Honorable',
        current_position: 'Member of Parliament & Deputy Minister of Education',
        party: 'Progressive Alliance Party',
        slug: politicianName.toLowerCase().replace(' ', '-'),
        wikipedia_summary: 'A dedicated public servant with over 15 years of experience in community development and education policy.',
        bio: 'Master of Public Administration, National University (2018); Bachelor of Arts in Political Science, State University (2001); Certificate in Development Studies, International Institute (2015)',
        imageUrl: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=MP',

        // Source verification for education
        education_sources: [
          {
            type: 'university_record',
            url: 'https://nationaluniversity.ac.ke/alumni/graduates/2018',
            title: 'National University Alumni Directory 2018',
            source: 'National University of Kenya',
            date: '2018-12-15'
          },
          {
            type: 'official_certificate',
            url: 'https://stateuniversity.edu/transcripts/verified/2001',
            title: 'Official Academic Transcript - Political Science Degree',
            source: 'State University Registrar',
            date: '2001-06-20'
          },
          {
            type: 'academic_publication',
            url: 'https://globalgovernance.org/alumni/leadership-program-2020',
            title: 'Global Governance Academy Leadership Program Graduates',
            source: 'Global Governance Academy',
            date: '2020-11-30'
          }
        ],

        // Source verification for achievements
        achievements_sources: [
          {
            type: 'government_report',
            url: 'https://moh.go.ke/infrastructure-funding-2023',
            title: 'Healthcare Infrastructure Development Report 2023',
            source: 'Ministry of Health Kenya',
            date: '2023-08-15'
          },
          {
            type: 'project_documentation',
            url: 'https://education.go.ke/community-learning-centers-program',
            title: 'Community Learning Centers Initiative - Progress Report',
            source: 'Ministry of Education',
            date: '2023-12-01'
          },
          {
            type: 'news_coverage',
            url: 'https://standardmedia.co.ke/politics/environmental-conservation-success',
            title: 'MP Champions Successful Tree Planting Campaign',
            source: 'The Standard',
            date: '2023-06-12'
          },
          {
            type: 'parliamentary_record',
            url: 'https://parliament.go.ke/bills/education-technology-act-2023',
            title: 'Education Technology Act 2023 - Parliamentary Records',
            source: 'Parliament of Kenya',
            date: '2023-09-28'
          },
          {
            type: 'official_award',
            url: 'https://president.go.ke/awards/public-service-excellence-2024',
            title: 'National Excellence Awards for Public Service 2024',
            source: 'Office of the President',
            date: '2024-01-15'
          }
        ],

        // Source verification for current position
        position_sources: [
          {
            type: 'gazette_notice',
            url: 'https://kenyagazette.go.ke/notices/appointment-deputy-minister-education',
            title: 'Appointment of Deputy Minister of Education - Kenya Gazette',
            source: 'Kenya Gazette',
            date: '2022-10-15'
          },
          {
            type: 'parliamentary_record',
            url: 'https://parliament.go.ke/members/current-members',
            title: 'Current Members of Parliament - Official Registry',
            source: 'Parliament of Kenya',
            date: '2022-08-09'
          },
          {
            type: 'official_website',
            url: 'https://education.go.ke/leadership-team',
            title: 'Ministry of Education Leadership Team',
            source: 'Ministry of Education',
            date: '2022-10-20'
          }
        ]
      };
      */
    } catch (err) {
      console.error('Error fetching career details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load career details');
      setCareerDetails(null);
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCareerDetails();
  }, [politicianId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCareerDetails(true);
  };

  const openLink = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.log('Error opening link:', error);
    }
  };

  const renderInfoSection = (title: string, content: string | string[] | undefined, icon: string, sectionType?: 'education' | 'achievements' | 'position') => {
    if (!content || (Array.isArray(content) && content.length === 0)) return null;

    const hasSourceButton = sectionType && careerDetails && (
      (sectionType === 'education' && careerDetails.education_sources?.length) ||
      (sectionType === 'achievements' && careerDetails.achievements_sources?.length) ||
      (sectionType === 'position' && careerDetails.position_sources?.length)
    );

    return (
      <Card variant="elevated" style={styles.infoCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialIcons name={icon as any} size={24} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          {hasSourceButton && (
            <TouchableOpacity
              style={styles.sourceButton}
              onPress={(e) => {
                e.stopPropagation();
                if (sectionType === 'education') {
                  setSelectedCareerModal({
                    type: 'education',
                    item: content as string,
                    index: 0
                  });
                } else if (sectionType === 'position') {
                  setSelectedCareerModal({
                    type: 'position',
                    item: careerDetails.current_position,
                    index: 0
                  });
                }
              }}
            >
              <MaterialIcons name="link" size={16} color={colors.primary[500]} />
              <Text style={styles.sourceButtonText}>Sources</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.sectionContent}>
          {Array.isArray(content) ? (
            content.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>{item}</Text>
                {sectionType === 'achievements' && careerDetails?.achievements_sources?.length && (
                  <TouchableOpacity
                    style={styles.itemSourceButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedCareerModal({
                        type: 'achievement',
                        item: item,
                        index: index
                      });
                    }}
                  >
                    <MaterialIcons name="link" size={14} color={colors.primary[500]} />
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.contentText}>{content}</Text>
          )}
        </View>
      </Card>
    );
  };

  const renderStatsCard = (title: string, value: string | number, subtitle?: string, icon?: string) => (
    <Card variant="elevated" style={styles.statCard}>
      <View style={styles.statHeader}>
        {icon && <MaterialIcons name={icon as any} size={20} color={colors.primary[500]} />}
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#ff9a9e', '#fecfef']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politicianName}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Professional Career & Background</Text>
        </LinearGradient>
        <View style={styles.content}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !careerDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#ff9a9e', '#fecfef']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politicianName}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Professional Career & Background</Text>
        </LinearGradient>
        <View style={styles.content}>
          <ErrorDisplay
            message={error || 'Failed to load career details'}
            onRetry={() => fetchCareerDetails()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#ff9a9e', '#fecfef']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{careerDetails.name}</Text>
          <TouchableOpacity style={styles.shareButton}>
            <MaterialIcons name="share" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Professional Career & Background</Text>

        <View style={styles.profileSection}>
          {careerDetails.imageUrl && (
            <Image source={{ uri: careerDetails.imageUrl }} style={styles.profileImage} />
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.positionText}>{careerDetails.current_position}</Text>
            <Text style={styles.partyText}>{careerDetails.party}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            {renderStatsCard(
              'Years in Office',
              careerDetails.years_in_office || 0,
              'Years of service',
              'schedule'
            )}
            {renderStatsCard(
              'Age',
              careerDetails.age || 'N/A',
              'Years old',
              'person'
            )}
          </View>
        </View>

        {/* Personal Background */}
        {renderInfoSection(
          'Personal Background',
          careerDetails.wikipedia_summary,
          'person-outline'
        )}

        {/* Current Position */}
        {renderInfoSection(
          'Current Position',
          careerDetails.current_position,
          'work',
          'position'
        )}

        {/* Biography/Education */}
        {renderInfoSection(
          'Biography',
          careerDetails.bio,
          'school',
          'education'
        )}

        {/* Contact Information */}
        <Card variant="elevated" style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="contact-mail" size={24} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>
          <View style={styles.contactGrid}>
            {careerDetails.email && (
              <TouchableOpacity style={styles.contactItem}>
                <MaterialIcons name="email" size={20} color={colors.primary[500]} />
                <Text style={styles.contactText}>{careerDetails.email}</Text>
              </TouchableOpacity>
            )}
            {careerDetails.phone && (
              <TouchableOpacity style={styles.contactItem}>
                <MaterialIcons name="phone" size={20} color={colors.primary[500]} />
                <Text style={styles.contactText}>{careerDetails.phone}</Text>
              </TouchableOpacity>
            )}
            {careerDetails.website && (
              <TouchableOpacity style={styles.contactItem}>
                <MaterialIcons name="language" size={20} color={colors.primary[500]} />
                <Text style={styles.contactText}>{careerDetails.website}</Text>
              </TouchableOpacity>
            )}
            {careerDetails.social_media_twitter && (
              <TouchableOpacity style={styles.contactItem}>
                <MaterialIcons name="alternate-email" size={20} color={colors.primary[500]} />
                <Text style={styles.contactText}>{careerDetails.social_media_twitter}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Career Detail Modal */}
      <Modal
        visible={selectedCareerModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedCareerModal(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setSelectedCareerModal(null)}
              style={styles.modalCloseButton}
            >
              <MaterialIcons name="close" size={24} color={colors.neutral[700]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedCareerModal?.type === 'education' && 'Education Details'}
              {selectedCareerModal?.type === 'achievement' && 'Achievement Details'}
              {selectedCareerModal?.type === 'position' && 'Position Details'}
            </Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Card variant="elevated" style={styles.modalInfoCard}>
              <Text style={styles.modalItemTitle}>
                {selectedCareerModal?.item}
              </Text>
            </Card>

            {/* Sources Section */}
            {(() => {
              let sources: any[] = [];
              if (selectedCareerModal?.type === 'education' && careerDetails?.education_sources) {
                sources = careerDetails.education_sources;
              } else if (selectedCareerModal?.type === 'achievement' && careerDetails?.achievements_sources) {
                sources = careerDetails.achievements_sources;
              } else if (selectedCareerModal?.type === 'position' && careerDetails?.position_sources) {
                sources = careerDetails.position_sources;
              }

              if (sources.length === 0) return null;

              return (
                <Card variant="elevated" style={styles.modalSourceCard}>
                  <TouchableOpacity
                    style={styles.modalSourceHeader}
                    onPress={() => {
                      if (selectedCareerModal?.type === 'education') {
                        setShowEducationSources(!showEducationSources);
                      } else if (selectedCareerModal?.type === 'achievement') {
                        setShowAchievementSources(!showAchievementSources);
                      } else if (selectedCareerModal?.type === 'position') {
                        setShowPositionSources(!showPositionSources);
                      }
                    }}
                  >
                    <View style={styles.modalSourceTitleContainer}>
                      <MaterialIcons name="link" size={20} color={colors.primary[500]} />
                      <Text style={styles.modalSourceTitle}>Sources ({sources.length})</Text>
                    </View>
                    <MaterialIcons
                      name={
                        (selectedCareerModal?.type === 'education' && showEducationSources) ||
                        (selectedCareerModal?.type === 'achievement' && showAchievementSources) ||
                        (selectedCareerModal?.type === 'position' && showPositionSources)
                          ? 'expand-less'
                          : 'expand-more'
                      }
                      size={24}
                      color={colors.neutral[600]}
                    />
                  </TouchableOpacity>

                  {((selectedCareerModal?.type === 'education' && showEducationSources) ||
                    (selectedCareerModal?.type === 'achievement' && showAchievementSources) ||
                    (selectedCareerModal?.type === 'position' && showPositionSources)) && (
                    <View style={styles.modalSourceList}>
                      {sources.map((source, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.modalSourceItem}
                          onPress={() => openLink(source.url)}
                        >
                          <View style={styles.modalSourceContent}>
                            <Text style={styles.modalSourceItemTitle}>{source.title}</Text>
                            <Text style={styles.modalSourceItemSource}>{source.source}</Text>
                            <Text style={styles.modalSourceItemDate}>{source.date}</Text>
                            <Text style={styles.modalSourceItemType}>
                              Type: {source.type.replace(/_/g, ' ').toUpperCase()}
                            </Text>
                          </View>
                          <MaterialIcons name="open-in-new" size={20} color={colors.primary[500]} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </Card>
              );
            })()}

            <View style={styles.modalBottomPadding} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileInfo: {
    flex: 1,
  },
  positionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  partyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsGrid: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: colors.neutral[600],
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 4,
  },
  infoCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  sectionContent: {
    gap: 8,
  },
  contentText: {
    fontSize: 16,
    color: colors.neutral[700],
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[500],
    marginTop: 9,
  },
  listText: {
    fontSize: 16,
    color: colors.neutral[700],
    lineHeight: 24,
    flex: 1,
  },
  contactGrid: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 16,
    color: colors.neutral[700],
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  sourceButtonText: {
    fontSize: 12,
    color: colors.primary[500],
    fontWeight: '600',
  },
  itemSourceButton: {
    padding: 4,
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[200],
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
    flex: 1,
    textAlign: 'center',
  },
  modalPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalInfoCard: {
    padding: 16,
    marginBottom: 16,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    lineHeight: 24,
  },
  modalSourceCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  modalSourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.primary[50],
  },
  modalSourceTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalSourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[700],
  },
  modalSourceList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  modalSourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  modalSourceContent: {
    flex: 1,
  },
  modalSourceItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  modalSourceItemSource: {
    fontSize: 13,
    color: colors.neutral[600],
    marginBottom: 2,
  },
  modalSourceItemDate: {
    fontSize: 12,
    color: colors.neutral[500],
    marginBottom: 2,
  },
  modalSourceItemType: {
    fontSize: 11,
    color: colors.primary[600],
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  modalBottomPadding: {
    height: 40,
  },
});