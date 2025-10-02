import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const { width } = Dimensions.get('window');

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'content' | 'engagement' | 'performance' | 'compliance';
  requiredPermission: string;
  estimatedTime: string;
  format: ('pdf' | 'csv' | 'excel')[];
}

interface ScheduledReport {
  id: string;
  name: string;
  template: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastRun: string;
  nextRun: string;
  recipients: string[];
  status: 'active' | 'paused' | 'error';
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'politician-overview',
    name: 'Politicians Overview',
    description: 'Comprehensive report on all politicians including profiles, activity, and engagement metrics',
    icon: 'people',
    category: 'content',
    requiredPermission: 'view',
    estimatedTime: '5-10 min',
    format: ['pdf', 'csv', 'excel'],
  },
  {
    id: 'commitment-tracking',
    name: 'Commitment Tracking Report',
    description: 'Detailed analysis of political commitments, progress tracking, and fulfillment rates',
    icon: 'checkmark-circle',
    category: 'content',
    requiredPermission: 'view',
    estimatedTime: '3-7 min',
    format: ['pdf', 'excel'],
  },
  {
    id: 'user-engagement',
    name: 'User Engagement Analytics',
    description: 'User behavior analysis, session data, and platform interaction metrics',
    icon: 'analytics',
    category: 'engagement',
    requiredPermission: 'analytics',
    estimatedTime: '8-12 min',
    format: ['pdf', 'csv'],
  },
  {
    id: 'content-performance',
    name: 'Content Performance',
    description: 'Analysis of most viewed content, trending politicians, and engagement patterns',
    icon: 'trending-up',
    category: 'performance',
    requiredPermission: 'analytics',
    estimatedTime: '6-10 min',
    format: ['pdf', 'excel'],
  },
  {
    id: 'data-quality',
    name: 'Data Quality Assessment',
    description: 'Comprehensive data integrity report including missing fields, duplicates, and quality scores',
    icon: 'shield-checkmark',
    category: 'compliance',
    requiredPermission: 'admin',
    estimatedTime: '10-15 min',
    format: ['pdf', 'csv', 'excel'],
  },
  {
    id: 'system-health',
    name: 'System Health Report',
    description: 'Technical performance metrics, API response times, and system reliability data',
    icon: 'pulse',
    category: 'performance',
    requiredPermission: 'admin',
    estimatedTime: '5-8 min',
    format: ['pdf', 'csv'],
  },
  {
    id: 'compliance-audit',
    name: 'Compliance Audit',
    description: 'Data protection, source verification, and regulatory compliance assessment',
    icon: 'document-lock',
    category: 'compliance',
    requiredPermission: 'admin',
    estimatedTime: '15-20 min',
    format: ['pdf'],
  },
  {
    id: 'voting-analysis',
    name: 'Voting Records Analysis',
    description: 'Parliamentary voting patterns, bill analysis, and legislative tracking',
    icon: 'ballot',
    category: 'content',
    requiredPermission: 'view',
    estimatedTime: '12-18 min',
    format: ['pdf', 'csv', 'excel'],
  },
];

const scheduledReports: ScheduledReport[] = [
  {
    id: '1',
    name: 'Weekly Engagement Summary',
    template: 'user-engagement',
    frequency: 'weekly',
    lastRun: '2024-01-15',
    nextRun: '2024-01-22',
    recipients: ['admin@rada.com', 'analytics@rada.com'],
    status: 'active',
  },
  {
    id: '2',
    name: 'Monthly Data Quality Check',
    template: 'data-quality',
    frequency: 'monthly',
    lastRun: '2024-01-01',
    nextRun: '2024-02-01',
    recipients: ['admin@rada.com'],
    status: 'active',
  },
  {
    id: '3',
    name: 'Daily System Health',
    template: 'system-health',
    frequency: 'daily',
    lastRun: '2024-01-16',
    nextRun: '2024-01-17',
    recipients: ['tech@rada.com'],
    status: 'paused',
  },
];

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { hasPermission } = useAdminAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const categories = [
    { id: 'all', name: 'All Reports', icon: 'grid' },
    { id: 'content', name: 'Content', icon: 'document-text' },
    { id: 'engagement', name: 'Engagement', icon: 'people' },
    { id: 'performance', name: 'Performance', icon: 'trending-up' },
    { id: 'compliance', name: 'Compliance', icon: 'shield-checkmark' },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? reportTemplates
    : reportTemplates.filter(template => template.category === selectedCategory);

  const generateReport = async (templateId: string, format: string) => {
    const template = reportTemplates.find(t => t.id === templateId);
    if (!template) return;

    if (!hasPermission('analytics', template.requiredPermission as any)) {
      Alert.alert('Permission Denied', 'You do not have permission to generate this report');
      return;
    }

    Alert.alert(
      'Generate Report',
      `This will generate a ${template.name} report in ${format.toUpperCase()} format. Estimated time: ${template.estimatedTime}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            console.log(`Generating ${template.name} report in ${format} format...`);
            Alert.alert('Report Generated', `Your ${template.name} report has been generated and will be available for download shortly.`);
          },
        },
      ]
    );
  };

  const scheduleReport = () => {
    if (!scheduleName.trim()) {
      Alert.alert('Error', 'Please enter a name for the scheduled report');
      return;
    }

    console.log('Scheduling report:', {
      name: scheduleName,
      template: selectedTemplate,
      frequency: scheduleFrequency,
    });

    Alert.alert('Success', 'Report has been scheduled successfully!');
    setShowScheduleModal(false);
    setScheduleName('');
    setSelectedTemplate('');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'content': return '#3B82F6';
      case 'engagement': return '#10B981';
      case 'performance': return '#F59E0B';
      case 'compliance': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22C55E';
      case 'paused': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const ReportCard: React.FC<{ template: ReportTemplate }> = ({ template }) => (
    <View style={[styles.reportCard, { borderLeftColor: getCategoryColor(template.category) }]}>
      <View style={styles.reportHeader}>
        <View style={[styles.reportIcon, { backgroundColor: getCategoryColor(template.category) + '20' }]}>
          <Ionicons name={template.icon as any} size={24} color={getCategoryColor(template.category)} />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportName}>{template.name}</Text>
          <Text style={styles.reportDescription}>{template.description}</Text>
          <View style={styles.reportMeta}>
            <Text style={styles.reportTime}>⏱️ {template.estimatedTime}</Text>
            <Text style={styles.reportCategory}>{template.category.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.reportActions}>
        <View style={styles.formatButtons}>
          {template.format.map((format) => (
            <TouchableOpacity
              key={format}
              onPress={() => generateReport(template.id, format)}
              style={[styles.formatButton, { backgroundColor: getCategoryColor(template.category) }]}
            >
              <Text style={styles.formatButtonText}>{format.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedTemplate(template.id);
            setScheduleName(template.name);
            setShowScheduleModal(true);
          }}
          style={styles.scheduleButton}
        >
          <Ionicons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.scheduleButtonText}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ScheduledReportCard: React.FC<{ report: ScheduledReport }> = ({ report }) => (
    <View style={styles.scheduledCard}>
      <View style={styles.scheduledHeader}>
        <View>
          <Text style={styles.scheduledName}>{report.name}</Text>
          <Text style={styles.scheduledTemplate}>Template: {report.template}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
          <Text style={styles.statusText}>{report.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.scheduledDetails}>
        <View style={styles.scheduledDetailItem}>
          <Ionicons name="repeat" size={16} color="#6B7280" />
          <Text style={styles.scheduledDetailText}>{report.frequency}</Text>
        </View>
        <View style={styles.scheduledDetailItem}>
          <Ionicons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.scheduledDetailText}>Next: {report.nextRun}</Text>
        </View>
        <View style={styles.scheduledDetailItem}>
          <Ionicons name="mail" size={16} color="#6B7280" />
          <Text style={styles.scheduledDetailText}>{report.recipients.length} recipients</Text>
        </View>
      </View>

      <View style={styles.scheduledActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="settings" size={16} color="#6B7280" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name={report.status === 'active' ? 'pause' : 'play'} size={16} color="#6B7280" />
          <Text style={styles.actionButtonText}>
            {report.status === 'active' ? 'Pause' : 'Resume'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="play-skip-forward" size={16} color="#6B7280" />
          <Text style={styles.actionButtonText}>Run Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Reports & Analytics</Text>
            <Text style={styles.headerSubtitle}>Generate and schedule reports</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive,
                ]}
              >
                <Ionicons
                  name={category.icon as any}
                  size={20}
                  color={selectedCategory === category.id ? 'white' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.categoryButtonTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Report Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Reports</Text>
          {filteredTemplates.map((template) => (
            <ReportCard key={template.id} template={template} />
          ))}
        </View>

        {/* Scheduled Reports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scheduled Reports</Text>
            <TouchableOpacity
              onPress={() => setShowScheduleModal(true)}
              style={styles.addButton}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
          {scheduledReports.map((report) => (
            <ScheduledReportCard key={report.id} report={report} />
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Schedule Report Modal */}
      <Modal
        visible={showScheduleModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Schedule Report</Text>
            <TouchableOpacity onPress={scheduleReport}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Report Name</Text>
              <TextInput
                style={styles.formInput}
                value={scheduleName}
                onChangeText={setScheduleName}
                placeholder="Enter report name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Template</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.templateSelector}>
                  {reportTemplates.map((template) => (
                    <TouchableOpacity
                      key={template.id}
                      onPress={() => setSelectedTemplate(template.id)}
                      style={[
                        styles.templateOption,
                        selectedTemplate === template.id && styles.templateOptionActive,
                      ]}
                    >
                      <Ionicons
                        name={template.icon as any}
                        size={20}
                        color={selectedTemplate === template.id ? 'white' : '#6B7280'}
                      />
                      <Text
                        style={[
                          styles.templateOptionText,
                          selectedTemplate === template.id && styles.templateOptionTextActive,
                        ]}
                      >
                        {template.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Frequency</Text>
              <View style={styles.frequencySelector}>
                {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    onPress={() => setScheduleFrequency(freq)}
                    style={[
                      styles.frequencyOption,
                      scheduleFrequency === freq && styles.frequencyOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.frequencyOptionText,
                        scheduleFrequency === freq && styles.frequencyOptionTextActive,
                      ]}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  categoryContainer: {
    marginVertical: 20,
  },
  categoryScroll: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  section: {
    margin: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reportHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reportCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formatButtons: {
    flexDirection: 'row',
  },
  formatButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  formatButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scheduleButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  scheduledCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scheduledHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scheduledName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scheduledTemplate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scheduledDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  scheduledDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  scheduledDetailText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  scheduledActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  bottomPadding: {
    height: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  templateSelector: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  templateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 120,
  },
  templateOptionActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  templateOptionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  templateOptionTextActive: {
    color: 'white',
  },
  frequencySelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  frequencyOptionActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  frequencyOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  frequencyOptionTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
});