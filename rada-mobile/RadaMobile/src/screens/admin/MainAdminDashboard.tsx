import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import all admin components
import LearningManagementTools from './LearningManagementTools';
import PoliticalContentTools from './PoliticalContentTools';

const { width } = Dimensions.get('window');

interface AdminSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string[];
  component: React.ComponentType<any>;
  stats: {
    total: number;
    recent: number;
    pending: number;
  };
}

interface MainAdminDashboardProps {
  onClose?: () => void;
}

const MainAdminDashboard: React.FC<MainAdminDashboardProps> = ({ onClose }) => {
  const navigation = useNavigation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // All admin sections
  const adminSections: AdminSection[] = [
    {
      id: 'learning',
      title: 'Learning Management',
      description: 'Manage courses, lessons, quizzes, and educational content',
      icon: 'school',
      color: ['#667eea', '#764ba2'],
      component: LearningManagementTools,
      stats: { total: 45, recent: 8, pending: 3 },
    },
    {
      id: 'political',
      title: 'Political Content',
      description: 'Manage politicians, voting records, commitments, and news',
      icon: 'people',
      color: ['#f093fb', '#f5576c'],
      component: PoliticalContentTools,
      stats: { total: 156, recent: 12, pending: 5 },
    },
    {
      id: 'community',
      title: 'Community Management',
      description: 'Moderate posts, manage users, and handle content',
      icon: 'chatbubbles',
      color: ['#4facfe', '#00f2fe'],
      component: () => <View style={styles.comingSoonContainer}><Text style={styles.comingSoonText}>Community Management Tools Coming Soon!</Text></View>,
      stats: { total: 89, recent: 15, pending: 8 },
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'View performance metrics, user engagement, and insights',
      icon: 'analytics',
      color: ['#43e97b', '#38f9d7'],
      component: () => <View style={styles.comingSoonContainer}><Text style={styles.comingSoonText}>Analytics Dashboard Coming Soon!</Text></View>,
      stats: { total: 234, recent: 6, pending: 2 },
    },
    {
      id: 'system',
      title: 'System Settings',
      description: 'Configure app settings, permissions, and system preferences',
      icon: 'settings',
      color: ['#fa709a', '#fee140'],
      component: () => <View style={styles.comingSoonContainer}><Text style={styles.comingSoonText}>System Settings Coming Soon!</Text></View>,
      stats: { total: 12, recent: 2, pending: 0 },
    },
  ];

  const handleSectionPress = (section: AdminSection) => {
    setActiveSection(section.id);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Dashboard data refreshed');
    }, 1000);
  };

  const renderSectionCard = (section: AdminSection) => {
    const Component = section.component;
    
    return (
      <TouchableOpacity
        key={section.id}
        style={styles.sectionCard}
        onPress={() => handleSectionPress(section)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={section.color}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name={section.icon as any} size={28} color="#fff" />
              </View>
              <View style={styles.statsContainer}>
                <Text style={styles.statsText}>Total: {section.stats.total}</Text>
                <Text style={styles.statsText}>Recent: {section.stats.recent}</Text>
                {section.stats.pending > 0 && (
                  <Text style={styles.pendingText}>Pending: {section.stats.pending}</Text>
                )}
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <Text style={styles.cardDescription}>{section.description}</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.actionText}>Manage</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <Text style={styles.sectionTitle}>System Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>45</Text>
          <Text style={styles.statLabel}>Learning Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>156</Text>
          <Text style={styles.statLabel}>Political Records</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>89</Text>
          <Text style={styles.statLabel}>Community Posts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>234</Text>
          <Text style={styles.statLabel}>Analytics Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>System Settings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>18</Text>
          <Text style={styles.statLabel}>Pending Tasks</Text>
        </View>
      </View>
    </View>
  );

  const renderRecentActivity = () => (
    <View style={styles.recentActivityContainer}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityList}>
        <View style={styles.activityItem}>
          <Ionicons name="add-circle" size={16} color="#10b981" />
          <Text style={styles.activityText}>Added new lesson: "Civic Engagement"</Text>
          <Text style={styles.activityTime}>2 hours ago</Text>
        </View>
        <View style={styles.activityItem}>
          <Ionicons name="create" size={16} color="#3b82f6" />
          <Text style={styles.activityText}>Updated politician profile: John Doe</Text>
          <Text style={styles.activityTime}>4 hours ago</Text>
        </View>
        <View style={styles.activityItem}>
          <Ionicons name="chatbubbles" size={16} color="#f59e0b" />
          <Text style={styles.activityText}>Moderated 3 community posts</Text>
          <Text style={styles.activityTime}>6 hours ago</Text>
        </View>
        <View style={styles.activityItem}>
          <Ionicons name="analytics" size={16} color="#8b5cf6" />
          <Text style={styles.activityText}>Generated monthly report</Text>
          <Text style={styles.activityTime}>1 day ago</Text>
        </View>
      </View>
    </View>
  );

  const renderActiveSection = () => {
    if (!activeSection) return null;
    
    const section = adminSections.find(s => s.id === activeSection);
    if (!section) return null;

    const Component = section.component;
    
    return (
      <Modal
        visible={true}
        animationType="slide"
        onRequestClose={() => setActiveSection(null)}
      >
        <Component onClose={() => setActiveSection(null)} />
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Main Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Manage all aspects of rada.ke</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
            {onClose && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <TouchableOpacity onPress={handleRefresh}>
            <Text style={styles.refreshText}>Pull to refresh</Text>
          </TouchableOpacity>
        }
      >
        {renderQuickStats()}
        
        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionTitle}>Admin Sections</Text>
          <View style={styles.sectionsGrid}>
            {adminSections.map(renderSectionCard)}
          </View>
        </View>

        {renderRecentActivity()}

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="download" size={20} color="#3b82f6" />
              <Text style={styles.actionButtonText}>Export Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings" size={20} color="#6b7280" />
              <Text style={styles.actionButtonText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="help-circle" size={20} color="#f59e0b" />
              <Text style={styles.actionButtonText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="log-out" size={20} color="#ef4444" />
              <Text style={styles.actionButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {renderActiveSection()}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  refreshButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  refreshText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 10,
  },
  quickStatsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  sectionsContainer: {
    marginBottom: 24,
  },
  sectionsGrid: {
    gap: 16,
  },
  sectionCard: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  pendingText: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  recentActivityContainer: {
    marginBottom: 24,
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
});

export default MainAdminDashboard;
