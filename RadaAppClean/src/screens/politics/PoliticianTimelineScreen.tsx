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
  Modal,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { TimelineItem, LoadingSpinner, ErrorDisplay } from '../../components/ui';
import { TimelineEvent } from '../../types';
import { colors, shadows } from '../../theme';
import ApiService from '../../services/api';

interface PoliticianTimelineScreenProps {
  politicianId: number;
  politicianName: string;
  onBack: () => void;
}

export const PoliticianTimelineScreen: React.FC<PoliticianTimelineScreenProps> = ({
  politicianId,
  politicianName,
  onBack,
}) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'position' | 'achievement' | 'controversy'>('all');
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<TimelineEvent | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const fetchTimeline = async (refresh = false) => {
    if (!refresh) setLoading(true);
    setError(null);

    try {
      // Fetch timeline from API
      const response = await ApiService.getTimeline(politicianId);
      const data = response.success ? response.data : response;

      setTimeline((data || []).sort((a: TimelineEvent, b: TimelineEvent) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));

      /* Mock timeline data - replaced with actual API call
      const mockTimeline: TimelineEvent[] = [
        {
          id: 1,
          politician_id: politicianId,
          title: `${politicianName} Elected to Parliament`,
          description: 'Won constituency seat with 62% of the vote, defeating incumbent by significant margin. Campaign focused on healthcare, education, and infrastructure development.',
          date: '2022-08-09',
          type: 'position',
          source_links: [
            {
              type: 'gazette',
              url: 'https://kenyagazette.go.ke/notices/election-results-2022',
              title: 'Official Election Results 2022 - Kenya Gazette',
              source: 'Kenya Gazette',
              date: '2022-08-15'
            },
            {
              type: 'news',
              url: 'https://standardmedia.co.ke/politics/election-2022-results',
              title: 'Parliamentary Election Results Announced',
              source: 'The Standard',
              date: '2022-08-10'
            }
          ],
          verification_links: [
            {
              type: 'official_record',
              url: 'https://iebc.or.ke/results/parliamentary-2022',
              title: 'IEBC Official Parliamentary Results Portal',
              source: 'Independent Electoral and Boundaries Commission',
              date: '2022-08-09',
              content_summary: 'Official election results showing constituency victory with 62% of valid votes cast'
            }
          ]
        },
        {
          id: 2,
          politician_id: politicianId,
          title: 'Healthcare Reform Achievement',
          description: 'Successfully passed landmark healthcare legislation that expanded coverage to 50,000 additional residents. Worked across party lines to secure bipartisan support.',
          date: '2024-01-20',
          type: 'achievement',
          source_links: [
            {
              type: 'parliamentary_record',
              url: 'https://parliament.go.ke/bills/healthcare-expansion-act-2024',
              title: 'Healthcare Expansion Act 2024 - Parliamentary Records',
              source: 'Parliament of Kenya',
              date: '2024-01-20'
            },
            {
              type: 'government_doc',
              url: 'https://moh.go.ke/reports/healthcare-coverage-expansion-2024',
              title: 'Healthcare Coverage Expansion Impact Report',
              source: 'Ministry of Health',
              date: '2024-02-15'
            }
          ],
          verification_links: [
            {
              type: 'independent_report',
              url: 'https://healthwatch.or.ke/reports/healthcare-act-impact-analysis',
              title: 'Independent Analysis of Healthcare Act Impact',
              source: 'Kenya Health Watch',
              date: '2024-03-01',
              content_summary: 'Third-party verification of expanded healthcare coverage reaching 52,000 new beneficiaries'
            }
          ]
        },
        {
          id: 3,
          politician_id: politicianId,
          title: 'Appointed to Education Committee',
          description: 'Selected as chairperson of the Parliamentary Education Committee, overseeing education policy reform and budget allocation.',
          date: '2023-03-15',
          type: 'position',
          source_links: [
            {
              type: 'parliamentary_record',
              url: 'https://parliament.go.ke/committees/education-committee-appointments-2023',
              title: 'Parliamentary Education Committee Appointments 2023',
              source: 'Parliament of Kenya',
              date: '2023-03-15'
            },
            {
              type: 'news',
              url: 'https://nationmedia.com/politics/education-committee-chair-appointment',
              title: 'MP Appointed Chairperson of Education Committee',
              source: 'Daily Nation',
              date: '2023-03-16'
            }
          ],
          verification_links: [
            {
              type: 'official_record',
              url: 'https://parliament.go.ke/committees/current-leadership',
              title: 'Current Parliamentary Committee Leadership',
              source: 'Parliament of Kenya',
              date: '2023-03-20',
              content_summary: 'Official parliamentary records showing committee chairperson appointments'
            }
          ]
        },
        {
          id: 4,
          politician_id: politicianId,
          title: 'Infrastructure Project Launch',
          description: 'Inaugurated the construction of 50km highway connecting rural communities to urban centers. Project expected to create 500 jobs and improve trade access.',
          date: '2023-09-10',
          type: 'achievement',
          source_links: [
            {
              type: 'press_release',
              url: 'https://roads.go.ke/press/highway-construction-launch-2023',
              title: 'KeNHA Launches 50km Highway Construction Project',
              source: 'Kenya National Highways Authority',
              date: '2023-09-10'
            },
            {
              type: 'news',
              url: 'https://standardmedia.co.ke/infrastructure/highway-project-launch',
              title: 'MP Launches Major Highway Project Connecting Rural Communities',
              source: 'The Standard',
              date: '2023-09-10'
            }
          ],
          verification_links: [
            {
              type: 'official_record',
              url: 'https://treasury.go.ke/budget/infrastructure-allocations-2023',
              title: 'Infrastructure Budget Allocation 2023 - Highway Projects',
              source: 'National Treasury',
              date: '2023-09-15',
              content_summary: 'Official budget documentation confirming allocation for 50km highway construction project'
            }
          ]
        },
        {
          id: 5,
          politician_id: politicianId,
          title: 'Budget Allocation Controversy',
          description: 'Faced criticism over constituency development fund allocation. Opposition questioned transparency in project selection process.',
          date: '2023-11-05',
          type: 'controversy',
          source_links: [
            {
              type: 'news',
              url: 'https://standardmedia.co.ke/politics/opposition-questions-cdf-allocation',
              title: 'Opposition MPs Question CDF Allocation Transparency',
              source: 'The Standard',
              date: '2023-11-05'
            },
            {
              type: 'parliamentary_record',
              url: 'https://parliament.go.ke/hansard/cdf-allocation-debate-nov-2023',
              title: 'Parliamentary Debate on CDF Allocation - November 2023',
              source: 'Parliament of Kenya',
              date: '2023-11-05'
            }
          ],
          verification_links: [
            {
              type: 'fact_check',
              url: 'https://africacheck.org/fact-checks/kenya-cdf-allocation-transparency',
              title: 'Fact Check: CDF Allocation Process and Transparency Measures',
              source: 'Africa Check',
              date: '2023-11-10',
              content_summary: 'Independent fact-check examining CDF allocation procedures and transparency requirements'
            }
          ]
        },
        {
          id: 6,
          politician_id: politicianId,
          title: 'Environmental Conservation Award',
          description: 'Received national recognition for leading reforestation initiative that planted over 100,000 trees and established 3 community forests.',
          date: '2024-02-14',
          type: 'achievement',
          source_links: [
            {
              type: 'official_statement',
              url: 'https://environment.go.ke/awards/conservation-excellence-2024',
              title: 'National Environmental Conservation Awards 2024',
              source: 'Ministry of Environment',
              date: '2024-02-14'
            },
            {
              type: 'news',
              url: 'https://nationmedia.com/environment/mp-conservation-award',
              title: 'MP Receives National Award for Tree Planting Initiative',
              source: 'Daily Nation',
              date: '2024-02-15'
            }
          ],
          verification_links: [
            {
              type: 'independent_report',
              url: 'https://greenwatch.org/reports/reforestation-impact-2024',
              title: 'Independent Verification of Reforestation Project Impact',
              source: 'Green Watch Kenya',
              date: '2024-03-10',
              content_summary: 'Third-party verification confirms planting of 103,000 trees across 3 community forest sites'
            }
          ]
        },
        {
          id: 7,
          politician_id: politicianId,
          title: 'Deputy Minister of Education',
          description: 'Appointed as Deputy Minister of Education, bringing constituency experience to national education policy development.',
          date: '2024-05-01',
          type: 'position',
          source_links: [
            {
              type: 'gazette',
              url: 'https://kenyagazette.go.ke/notices/appointment-deputy-minister-education-2024',
              title: 'Appointment of Deputy Minister of Education - Kenya Gazette Notice',
              source: 'Kenya Gazette',
              date: '2024-05-01'
            },
            {
              type: 'press_release',
              url: 'https://education.go.ke/press/new-deputy-minister-appointment',
              title: 'Ministry Announces New Deputy Minister Appointment',
              source: 'Ministry of Education',
              date: '2024-05-01'
            }
          ],
          verification_links: [
            {
              type: 'official_record',
              url: 'https://parliament.go.ke/members/deputy-ministers-current',
              title: 'Current Deputy Ministers - Official Parliamentary Record',
              source: 'Parliament of Kenya',
              date: '2024-05-02',
              content_summary: 'Official parliamentary records confirming appointment as Deputy Minister of Education'
            }
          ]
        },
        {
          id: 8,
          politician_id: politicianId,
          title: 'University Graduation',
          description: 'Graduated magna cum laude with Master of Public Administration from National University, specializing in development policy.',
          date: '2018-06-15',
          type: 'achievement',
          source_links: [
            {
              type: 'official_statement',
              url: 'https://nationaluniversity.ac.ke/graduation/2018-ceremony-graduates',
              title: 'National University Graduation Ceremony 2018 - Graduate List',
              source: 'National University of Kenya',
              date: '2018-06-15'
            },
            {
              type: 'news',
              url: 'https://nationmedia.com/education/university-graduation-ceremony-2018',
              title: 'National University Holds Graduation Ceremony for 2018 Class',
              source: 'Daily Nation',
              date: '2018-06-16'
            }
          ],
          verification_links: [
            {
              type: 'official_record',
              url: 'https://nationaluniversity.ac.ke/alumni/academic-records-verification',
              title: 'Academic Records Verification - Master of Public Administration',
              source: 'National University Registrar',
              date: '2018-06-20',
              content_summary: 'Official academic transcript confirming graduation magna cum laude with MPA degree'
            }
          ]
        },
        {
          id: 9,
          politician_id: politicianId,
          title: 'Started Political Career',
          description: 'Began political career as county councilor, focusing on local development projects and community organizing.',
          date: '2019-01-10',
          type: 'position',
          source_links: [
            {
              type: 'gazette',
              url: 'https://kenyagazette.go.ke/notices/county-council-appointments-2019',
              title: 'County Council Appointments 2019 - Kenya Gazette',
              source: 'Kenya Gazette',
              date: '2019-01-10'
            },
            {
              type: 'news',
              url: 'https://standardmedia.co.ke/counties/new-county-councilors-sworn-in',
              title: 'New County Councilors Sworn Into Office',
              source: 'The Standard',
              date: '2019-01-11'
            }
          ],
          verification_links: [
            {
              type: 'official_record',
              url: 'https://centralcounty.go.ke/council/members-2019-2022',
              title: 'County Council Members 2019-2022 Term',
              source: 'Central County Government',
              date: '2019-01-15',
              content_summary: 'Official county records showing appointment as county councilor for development portfolio'
            }
          ]
        },
      ];
      */
    } catch (err) {
      console.error('Error fetching timeline:', err);
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
      setTimeline([]);
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [politicianId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTimeline(true);
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

  const getEventTypeColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'position': return colors.primary[500];
      case 'achievement': return colors.success[500];
      case 'controversy': return colors.error[500];
      default: return colors.neutral[400];
    }
  };

  const getEventTypeIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'position': return 'business-center';
      case 'achievement': return 'emoji-events';
      case 'controversy': return 'warning';
      default: return 'event';
    }
  };

  const getEventTypeLabel = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'position': return 'POSITION';
      case 'achievement': return 'ACHIEVEMENT';
      case 'controversy': return 'CONTROVERSY';
      default: return 'EVENT';
    }
  };

  const filteredTimeline = timeline.filter(event =>
    filterType === 'all' || event.type === filterType
  );

  const stats = {
    total: timeline.length,
    positions: timeline.filter(e => e.type === 'position').length,
    achievements: timeline.filter(e => e.type === 'achievement').length,
    controversies: timeline.filter(e => e.type === 'controversy').length,
  };

  const renderTimelineEvent = (event: TimelineEvent, index: number) => (
    <TimelineItem
      key={event.id}
      title={event.title}
      description={event.description}
      date={event.date}
      type={event.type}
      isLast={index === filteredTimeline.length - 1}
      hasSourceLinks={!!(event.source_links?.length || event.verification_links?.length)}
      onSourcePress={() => {
        setSelectedTimelineEvent(event);
        setShowSources(false);
        setShowVerification(false);
      }}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#a18cd1', '#fbc2eb']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politicianName}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Career Timeline & Milestones</Text>
        </LinearGradient>
        <View style={styles.content}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#a18cd1', '#fbc2eb']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politicianName}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Career Timeline & Milestones</Text>
        </LinearGradient>
        <View style={styles.content}>
          <ErrorDisplay
            message={error}
            onRetry={() => fetchTimeline()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#a18cd1', '#fbc2eb']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{politicianName}</Text>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Career Timeline & Milestones</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
          contentContainerStyle={styles.statsContent}
        >
          <TouchableOpacity
            style={[styles.statItem, filterType === 'all' && styles.activeStatItem]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.statNumber, filterType === 'all' && styles.activeStatNumber]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, filterType === 'all' && styles.activeStatLabel]}>
              All Events
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, filterType === 'position' && styles.activeStatItem]}
            onPress={() => setFilterType('position')}
          >
            <Text style={[styles.statNumber, filterType === 'position' && styles.activeStatNumber]}>
              {stats.positions}
            </Text>
            <Text style={[styles.statLabel, filterType === 'position' && styles.activeStatLabel]}>
              Positions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, filterType === 'achievement' && styles.activeStatItem]}
            onPress={() => setFilterType('achievement')}
          >
            <Text style={[styles.statNumber, filterType === 'achievement' && styles.activeStatNumber]}>
              {stats.achievements}
            </Text>
            <Text style={[styles.statLabel, filterType === 'achievement' && styles.activeStatLabel]}>
              Achievements
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, filterType === 'controversy' && styles.activeStatItem]}
            onPress={() => setFilterType('controversy')}
          >
            <Text style={[styles.statNumber, filterType === 'controversy' && styles.activeStatNumber]}>
              {stats.controversies}
            </Text>
            <Text style={[styles.statLabel, filterType === 'controversy' && styles.activeStatLabel]}>
              Controversies
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredTimeline.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="timeline" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No Timeline Events Found</Text>
            <Text style={styles.emptySubtitle}>
              {filterType === 'all'
                ? `No recorded timeline events for ${politicianName}.`
                : `No ${filterType} events found.`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            <View style={styles.timelineHeader}>
              <MaterialIcons name="timeline" size={24} color={colors.primary[500]} />
              <Text style={styles.timelineTitle}>Career Journey</Text>
            </View>
            <View style={styles.timelineList}>
              {filteredTimeline.map(renderTimelineEvent)}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Timeline Event Detail Modal */}
      <Modal
        visible={selectedTimelineEvent !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedTimelineEvent(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setSelectedTimelineEvent(null)}
              style={styles.modalCloseButton}
            >
              <MaterialIcons name="close" size={24} color={colors.neutral[700]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Timeline Event Details</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedTimelineEvent && (
              <>
                <View style={styles.modalEventCard}>
                  <Text style={styles.modalEventTitle}>{selectedTimelineEvent.title}</Text>
                  <Text style={styles.modalEventDate}>{selectedTimelineEvent.date}</Text>
                  <Text style={styles.modalEventDescription}>{selectedTimelineEvent.description}</Text>
                </View>

                {/* Sources Section */}
                {selectedTimelineEvent.source_links && selectedTimelineEvent.source_links.length > 0 && (
                  <View style={styles.modalSourceCard}>
                    <TouchableOpacity
                      style={styles.modalSourceHeader}
                      onPress={() => setShowSources(!showSources)}
                    >
                      <View style={styles.modalSourceTitleContainer}>
                        <MaterialIcons name="link" size={20} color={colors.primary[500]} />
                        <Text style={styles.modalSourceTitle}>
                          Sources ({selectedTimelineEvent.source_links.length})
                        </Text>
                      </View>
                      <MaterialIcons
                        name={showSources ? 'expand-less' : 'expand-more'}
                        size={24}
                        color={colors.neutral[600]}
                      />
                    </TouchableOpacity>

                    {showSources && (
                      <View style={styles.modalSourceList}>
                        {selectedTimelineEvent.source_links.map((source, index) => (
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
                  </View>
                )}

                {/* Verification Section */}
                {selectedTimelineEvent.verification_links && selectedTimelineEvent.verification_links.length > 0 && (
                  <View style={styles.modalSourceCard}>
                    <TouchableOpacity
                      style={styles.modalVerificationHeader}
                      onPress={() => setShowVerification(!showVerification)}
                    >
                      <View style={styles.modalSourceTitleContainer}>
                        <MaterialIcons name="verified" size={20} color={colors.success[500]} />
                        <Text style={styles.modalVerificationTitle}>
                          Verification ({selectedTimelineEvent.verification_links.length})
                        </Text>
                      </View>
                      <MaterialIcons
                        name={showVerification ? 'expand-less' : 'expand-more'}
                        size={24}
                        color={colors.neutral[600]}
                      />
                    </TouchableOpacity>

                    {showVerification && (
                      <View style={styles.modalSourceList}>
                        {selectedTimelineEvent.verification_links.map((verification, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.modalVerificationItem}
                            onPress={() => openLink(verification.url)}
                          >
                            <View style={styles.modalSourceContent}>
                              <Text style={styles.modalSourceItemTitle}>{verification.title}</Text>
                              <Text style={styles.modalSourceItemSource}>{verification.source}</Text>
                              <Text style={styles.modalSourceItemDate}>{verification.date}</Text>
                              <Text style={styles.modalVerificationSummary}>{verification.content_summary}</Text>
                              <Text style={styles.modalSourceItemType}>
                                Type: {verification.type.replace(/_/g, ' ').toUpperCase()}
                              </Text>
                            </View>
                            <MaterialIcons name="open-in-new" size={20} color={colors.success[500]} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.modalBottomPadding} />
              </>
            )}
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
  filterButton: {
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
  statsContainer: {
    maxHeight: 80,
  },
  statsContent: {
    paddingHorizontal: 10,
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 80,
  },
  activeStatItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeStatNumber: {
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
    textAlign: 'center',
  },
  activeStatLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  timelineContainer: {
    paddingBottom: 40,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  timelineList: {
    paddingLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[700],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
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
  modalEventCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    ...shadows.sm,
  },
  modalEventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 8,
  },
  modalEventDate: {
    fontSize: 14,
    color: colors.neutral[500],
    marginBottom: 12,
  },
  modalEventDescription: {
    fontSize: 16,
    color: colors.neutral[700],
    lineHeight: 24,
  },
  modalSourceCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  modalSourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.primary[50],
  },
  modalVerificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.success[50],
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
  modalVerificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success[700],
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
  modalVerificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.success[200],
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
    marginBottom: 4,
  },
  modalSourceItemType: {
    fontSize: 11,
    color: colors.primary[600],
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  modalVerificationSummary: {
    fontSize: 13,
    color: colors.neutral[700],
    fontStyle: 'italic',
    marginBottom: 4,
    lineHeight: 18,
  },
  modalBottomPadding: {
    height: 40,
  },
});