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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, LoadingSpinner, ErrorDisplay } from '../../components/ui';
import { Politician } from '../../types';
import { colors, shadows } from '../../theme';

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

  const fetchCareerDetails = async (refresh = false) => {
    if (!refresh) setLoading(true);
    setError(null);

    try {
      // Mock career details data - replace with actual API call when backend is ready
      const mockCareerDetails: Politician = {
        id: politicianId,
        name: politicianName,
        current_position: 'Member of Parliament & Deputy Minister of Education',
        party: 'Progressive Alliance Party',
        constituency: 'Central District',
        age: 45,
        years_in_office: 2,
        bio: 'A dedicated public servant with over 15 years of experience in community development and education policy. Known for grassroots approach to governance and commitment to inclusive development. Has championed numerous successful initiatives in healthcare, education, and infrastructure development.',
        education: [
          'Master of Public Administration, National University (2018)',
          'Bachelor of Arts in Political Science, State University (2001)',
          'Certificate in Development Studies, International Institute (2015)',
          'Advanced Leadership Program, Global Governance Academy (2020)',
        ],
        previous_positions: [
          'County Councilor, Central District (2019-2022)',
          'Community Development Officer, Ministry of Interior (2005-2019)',
          'Education Coordinator, Local NGO (2002-2005)',
          'Youth Leader, Community Organization (2000-2002)',
        ],
        key_achievements: [
          'Secured $5M funding for constituency healthcare infrastructure',
          'Established 15 community learning centers across rural areas',
          'Led environmental conservation program that planted 100,000+ trees',
          'Championed landmark education technology legislation',
          'Reduced youth unemployment by 35% through skills programs',
          'Received National Excellence Award for Public Service (2024)',
        ],
        photo_url: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=MP',
        email: `${politicianName.toLowerCase().replace(' ', '.')}@parliament.go.ke`,
        phone: '+254-700-123-456',
        website: `https://www.${politicianName.toLowerCase().replace(' ', '')}.go.ke`,
        social_media_twitter: `@${politicianName.replace(' ', '')}MP`,
      };

      setCareerDetails(mockCareerDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load career details');
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

  const renderInfoSection = (title: string, content: string | string[] | undefined, icon: string) => {
    if (!content || (Array.isArray(content) && content.length === 0)) return null;

    return (
      <Card variant="elevated" style={styles.infoCard}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name={icon as any} size={24} color={colors.primary[500]} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionContent}>
          {Array.isArray(content) ? (
            content.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>{item}</Text>
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
          {careerDetails.photo_url && (
            <Image source={{ uri: careerDetails.photo_url }} style={styles.profileImage} />
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.positionText}>{careerDetails.current_position}</Text>
            <Text style={styles.partyText}>{careerDetails.party} • {careerDetails.constituency}</Text>
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
          careerDetails.bio,
          'person-outline'
        )}

        {/* Education */}
        {renderInfoSection(
          'Education',
          careerDetails.education,
          'school'
        )}

        {/* Previous Positions */}
        {renderInfoSection(
          'Previous Positions',
          careerDetails.previous_positions,
          'work-history'
        )}

        {/* Key Achievements */}
        {renderInfoSection(
          'Key Achievements',
          careerDetails.key_achievements,
          'emoji-events'
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
});