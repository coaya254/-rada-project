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
import { Card, LoadingSpinner, ErrorDisplay } from '../../components/ui';
import { Document } from '../../types';
import { colors, shadows } from '../../theme';

interface PoliticianDocumentsScreenProps {
  politicianId: number;
  politicianName: string;
  onBack: () => void;
}

export const PoliticianDocumentsScreen: React.FC<PoliticianDocumentsScreenProps> = ({
  politicianId,
  politicianName,
  onBack,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'bill' | 'speech' | 'interview' | 'report'>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchDocuments = async (refresh = false) => {
    if (!refresh) setLoading(true);
    setError(null);

    try {
      // Mock documents data - replace with actual API call when backend is ready
      const mockDocuments: Document[] = [
        {
          id: 1,
          politician_id: politicianId,
          title: `${politicianName}'s Healthcare Reform Bill - Full Text`,
          summary: 'Complete legislative text of the Universal Healthcare Access Act, including amendments and committee revisions.',
          type: 'bill',
          date: '2024-01-15',
          source: 'Parliamentary Records',
          tags: ['healthcare', 'legislation', 'social-policy', 'public-health'],
          url: 'https://example.com/documents/healthcare-bill-2024.pdf',
        },
        {
          id: 2,
          politician_id: politicianId,
          title: 'Parliamentary Address on Education Funding',
          summary: 'Comprehensive speech delivered to Parliament outlining the need for increased education budget allocation and infrastructure development.',
          type: 'speech',
          date: '2024-02-28',
          source: 'Parliamentary Hansard',
          tags: ['education', 'speech', 'budget', 'infrastructure'],
          url: 'https://example.com/documents/education-speech-2024.pdf',
        },
        {
          id: 3,
          politician_id: politicianId,
          title: 'Interview with National Broadcasting Service',
          summary: 'In-depth interview discussing policy priorities, constituency needs, and future legislative agenda.',
          type: 'interview',
          date: '2024-03-10',
          source: 'National Broadcasting Service',
          tags: ['media', 'interview', 'policy', 'constituency'],
          url: 'https://example.com/documents/nbs-interview-2024.mp4',
        },
        {
          id: 4,
          politician_id: politicianId,
          title: 'Annual Constituency Development Report',
          summary: 'Detailed report on development projects completed, ongoing initiatives, and planned improvements for the constituency.',
          type: 'report',
          date: '2023-12-31',
          source: `${politicianName}'s Office`,
          tags: ['development', 'report', 'constituency', 'projects', 'annual'],
          url: 'https://example.com/documents/constituency-report-2023.pdf',
        },
        {
          id: 5,
          politician_id: politicianId,
          title: 'Infrastructure Investment Bill Proposal',
          summary: 'Proposed legislation for major infrastructure investments including roads, bridges, and digital connectivity improvements.',
          type: 'bill',
          date: '2023-09-15',
          source: 'Parliamentary Records',
          tags: ['infrastructure', 'investment', 'legislation', 'development'],
          url: 'https://example.com/documents/infrastructure-bill-2023.pdf',
        },
        {
          id: 6,
          politician_id: politicianId,
          title: 'Environmental Committee Keynote Speech',
          summary: 'Address to the Parliamentary Environmental Committee on climate action priorities and sustainable development goals.',
          type: 'speech',
          date: '2024-04-22',
          source: 'Environmental Committee Records',
          tags: ['environment', 'climate', 'sustainability', 'committee'],
          url: 'https://example.com/documents/environmental-keynote-2024.pdf',
        },
        {
          id: 7,
          politician_id: politicianId,
          title: 'Radio Interview on Economic Policy',
          summary: 'Discussion of economic recovery strategies, small business support measures, and job creation initiatives.',
          type: 'interview',
          date: '2024-01-05',
          source: 'Capital FM',
          tags: ['economy', 'radio', 'interview', 'small-business', 'jobs'],
          url: 'https://example.com/documents/capital-fm-interview-2024.mp3',
        },
        {
          id: 8,
          politician_id: politicianId,
          title: 'Youth Employment Strategy Report',
          summary: 'Comprehensive analysis and recommendations for addressing youth unemployment through skills development and entrepreneurship programs.',
          type: 'report',
          date: '2023-11-20',
          source: 'Youth Affairs Committee',
          tags: ['youth', 'employment', 'skills', 'entrepreneurship', 'strategy'],
          url: 'https://example.com/documents/youth-employment-report-2023.pdf',
        },
      ];

      setDocuments(mockDocuments.sort((a: Document, b: Document) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [politicianId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDocuments(true);
  };

  const handleDocumentPress = (document: Document) => {
    setSelectedDocument(document);
    setShowDetailModal(true);
  };

  const getDocumentTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'bill': return colors.primary[500];
      case 'speech': return colors.success[500];
      case 'interview': return colors.warning[500];
      case 'report': return colors.error[500];
      default: return colors.neutral[400];
    }
  };

  const getDocumentTypeIcon = (type: Document['type']) => {
    switch (type) {
      case 'bill': return 'description';
      case 'speech': return 'record-voice-over';
      case 'interview': return 'mic';
      case 'report': return 'assignment';
      default: return 'insert-drive-file';
    }
  };

  const getDocumentTypeLabel = (type: Document['type']) => {
    switch (type) {
      case 'bill': return 'BILL';
      case 'speech': return 'SPEECH';
      case 'interview': return 'INTERVIEW';
      case 'report': return 'REPORT';
      default: return 'DOCUMENT';
    }
  };

  const filteredDocuments = documents.filter(doc =>
    filterType === 'all' || doc.type === filterType
  );

  const stats = {
    total: documents.length,
    bills: documents.filter(d => d.type === 'bill').length,
    speeches: documents.filter(d => d.type === 'speech').length,
    interviews: documents.filter(d => d.type === 'interview').length,
    reports: documents.filter(d => d.type === 'report').length,
  };

  const renderDocumentCard = (document: Document) => (
    <TouchableOpacity
      key={document.id}
      onPress={() => handleDocumentPress(document)}
      activeOpacity={0.7}
    >
        <Card variant="elevated" style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View style={styles.typeInfo}>
              <View style={[styles.typeBadge, { backgroundColor: getDocumentTypeColor(document.type) }]}>
                <MaterialIcons
                  name={getDocumentTypeIcon(document.type) as any}
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.typeText}>{getDocumentTypeLabel(document.type)}</Text>
              </View>
              <Text style={styles.dateText}>
                {new Date(document.date).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity style={styles.downloadButton}>
              <MaterialIcons name="download" size={20} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>

          <Text style={styles.documentTitle} numberOfLines={2}>
            {document.title}
          </Text>

          <Text style={styles.documentSummary} numberOfLines={3}>
            {document.summary}
          </Text>

          <View style={styles.documentFooter}>
            <View style={styles.sourceInfo}>
              <MaterialIcons name="source" size={16} color={colors.neutral[500]} />
              <Text style={styles.sourceText}>{document.source}</Text>
            </View>
            <TouchableOpacity style={styles.viewButton}>
              <MaterialIcons name="visibility" size={16} color={colors.primary[500]} />
              <Text style={styles.viewText}>View</Text>
            </TouchableOpacity>
          </View>

          {document.tags && document.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {document.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {document.tags.length > 3 && (
                <Text style={styles.moreTags}>+{document.tags.length - 3}</Text>
              )}
            </View>
          )}
        </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#ffecd2', '#fcb69f']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politicianName}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Official Documents & Records</Text>
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
          colors={['#ffecd2', '#fcb69f']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{politicianName}</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Official Documents & Records</Text>
        </LinearGradient>
        <View style={styles.content}>
          <ErrorDisplay
            message={error}
            onRetry={() => fetchDocuments()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#ffecd2', '#fcb69f']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{politicianName}</Text>
          <TouchableOpacity style={styles.searchButton}>
            <MaterialIcons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Official Documents & Records</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[styles.filterItem, filterType === 'all' && styles.activeFilterItem]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterLabel, filterType === 'all' && styles.activeFilterLabel]}>
              All ({stats.total})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, filterType === 'bill' && styles.activeFilterItem]}
            onPress={() => setFilterType('bill')}
          >
            <Text style={[styles.filterLabel, filterType === 'bill' && styles.activeFilterLabel]}>
              Bills ({stats.bills})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, filterType === 'speech' && styles.activeFilterItem]}
            onPress={() => setFilterType('speech')}
          >
            <Text style={[styles.filterLabel, filterType === 'speech' && styles.activeFilterLabel]}>
              Speeches ({stats.speeches})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, filterType === 'interview' && styles.activeFilterItem]}
            onPress={() => setFilterType('interview')}
          >
            <Text style={[styles.filterLabel, filterType === 'interview' && styles.activeFilterLabel]}>
              Interviews ({stats.interviews})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterItem, filterType === 'report' && styles.activeFilterItem]}
            onPress={() => setFilterType('report')}
          >
            <Text style={[styles.filterLabel, filterType === 'report' && styles.activeFilterLabel]}>
              Reports ({stats.reports})
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
        {filteredDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="folder-open" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No Documents Found</Text>
            <Text style={styles.emptySubtitle}>
              {filterType === 'all'
                ? `No recorded documents for ${politicianName}.`
                : `No ${filterType} documents found.`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.documentsGrid}>
            {filteredDocuments.map(renderDocumentCard)}
          </View>
        )}
      </ScrollView>

      {/* Document Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowDetailModal(false)}
              style={styles.modalCloseButton}
            >
              <MaterialIcons name="close" size={24} color={colors.neutral[600]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Document Details</Text>
            <View style={styles.placeholder} />
          </View>

          {selectedDocument && (
            <ScrollView style={styles.modalContent}>
              <View style={[styles.typeBadge, { backgroundColor: getDocumentTypeColor(selectedDocument.type), alignSelf: 'flex-start' }]}>
                <MaterialIcons
                  name={getDocumentTypeIcon(selectedDocument.type) as any}
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.typeText}>{getDocumentTypeLabel(selectedDocument.type)}</Text>
              </View>

              <Text style={styles.modalDocumentTitle}>{selectedDocument.title}</Text>

              <View style={styles.modalMetadata}>
                <View style={styles.metadataItem}>
                  <MaterialIcons name="calendar-today" size={16} color={colors.neutral[500]} />
                  <Text style={styles.metadataText}>
                    {new Date(selectedDocument.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.metadataItem}>
                  <MaterialIcons name="source" size={16} color={colors.neutral[500]} />
                  <Text style={styles.metadataText}>{selectedDocument.source}</Text>
                </View>
              </View>

              <Text style={styles.modalSummary}>{selectedDocument.summary}</Text>

              {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                <View style={styles.modalTagsContainer}>
                  <Text style={styles.tagsTitle}>Tags:</Text>
                  <View style={styles.tagsWrapper}>
                    {selectedDocument.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.openDocumentButton}
                onPress={() => {
                  if (selectedDocument.url) {
                    Linking.openURL(selectedDocument.url);
                  }
                }}
              >
                <MaterialIcons name="open-in-new" size={20} color="#FFFFFF" />
                <Text style={styles.openDocumentText}>Open Document</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
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
  searchButton: {
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
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 10,
    gap: 8,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  activeFilterLabel: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  documentsGrid: {
    paddingBottom: 40,
  },
  documentCard: {
    marginBottom: 16,
    padding: 16,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeInfo: {
    flex: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  downloadButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    lineHeight: 22,
    marginBottom: 8,
  },
  documentSummary: {
    fontSize: 14,
    color: colors.neutral[600],
    lineHeight: 20,
    marginBottom: 16,
  },
  documentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  sourceText: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
  },
  viewText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[500],
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: colors.neutral[600],
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 10,
    color: colors.neutral[400],
    fontWeight: '500',
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
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDocumentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[900],
    lineHeight: 28,
    marginTop: 16,
    marginBottom: 16,
  },
  modalMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  modalSummary: {
    fontSize: 16,
    color: colors.neutral[700],
    lineHeight: 24,
    marginBottom: 24,
  },
  modalTagsContainer: {
    marginBottom: 32,
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: 12,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  openDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    ...shadows.md,
  },
  openDocumentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});