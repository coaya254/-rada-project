import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import ModuleEditor from './content/ModuleEditor';
import LessonEditor from './content/LessonEditor';
import QuizEditor from './content/QuizEditor';
import ChallengeEditor from './content/ChallengeEditor';
import BadgeEditor from './content/BadgeEditor';
import ModerationQueueScreen from './ModerationQueueScreen';
import ContentTemplatesScreen from './content/ContentTemplatesScreen';

const ContentManagementScreen = ({ onClose }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('modules');
  const [content, setContent] = useState({
    modules: [],
    lessons: [],
    quizzes: [],
    challenges: [],
    badges: []
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorType, setEditorType] = useState('');
  const [moderationQueueVisible, setModerationQueueVisible] = useState(false);
  const [templatesVisible, setTemplatesVisible] = useState(false);

  const tabs = [
    { id: 'modules', label: '📚 Modules', icon: '📚' },
    { id: 'lessons', label: '📖 Lessons', icon: '📖' },
    { id: 'quizzes', label: '🧠 Quizzes', icon: '🧠' },
    { id: 'challenges', label: '🎯 Challenges', icon: '🎯' },
    { id: 'badges', label: '🏆 Badges', icon: '🏆' },
  ];

  const statusColors = {
    draft: '#6c757d',
    review: '#ffc107',
    approved: '#28a745',
    published: '#007bff'
  };

  const statusLabels = {
    draft: 'Draft',
    review: 'Under Review',
    approved: 'Approved',
    published: 'Published'
  };

  const loadContent = async () => {
    try {
      setIsLoading(true);
      console.log('ContentManagementScreen - Loading content data...');
      
      const [modulesData, lessonsData, quizzesData, challengesData, badgesData] = await Promise.all([
        apiService.getModules(), // Show what users see
        apiService.getLessons(), // Show what users see
        apiService.getQuizzes(), // Show what users see
        apiService.getChallenges(), // Show what users see
        apiService.getBadges() // Show what users see
      ]);

      console.log('ContentManagementScreen - API responses:', {
        modules: modulesData,
        lessons: lessonsData,
        quizzes: quizzesData,
        challenges: challengesData,
        badges: badgesData
      });

      setContent({
        modules: modulesData?.data || modulesData || [],
        lessons: lessonsData?.data || lessonsData || [],
        quizzes: quizzesData?.data || quizzesData || [],
        challenges: challengesData?.data || challengesData || [],
        badges: badgesData?.data || badgesData || []
      });
    } catch (error) {
      console.error('Failed to load content:', error);
      Alert.alert('Error', 'Failed to load content data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadContent();
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleCreateNew = () => {
    setSelectedItem(null);
    setEditorType(activeTab.slice(0, -1)); // Remove 's' from end
    setEditorVisible(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setEditorType(activeTab.slice(0, -1));
    setEditorVisible(true);
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.title || item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item) }
      ]
    );
  };

  const deleteItem = async (item) => {
    try {
      console.log(`ContentManagementScreen - Deleting ${activeTab} with ID:`, item.id);
      
      switch (activeTab) {
        case 'modules':
          await apiService.deleteModule(item.id);
          break;
        case 'lessons':
          await apiService.deleteLesson(item.id);
          break;
        case 'quizzes':
          await apiService.deleteQuiz(item.id);
          break;
        case 'challenges':
          await apiService.deleteChallenge(item.id);
          break;
        case 'badges':
          await apiService.deleteBadge(item.id);
          break;
        default:
          throw new Error(`Unknown content type: ${activeTab}`);
      }

      // Reload content after deletion
      await loadContent();
      Alert.alert('Success', `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} deleted successfully`);
    } catch (error) {
      console.error(`Failed to delete ${activeTab}:`, error);
      Alert.alert('Error', `Failed to delete ${activeTab}`);
    }
  };

  const handleSubmitForReview = async (item) => {
    try {
      const contentType = activeTab; // Use the full tab name (modules, lessons, etc.)
      const response = await apiService.submitForReview(contentType, item.id);
      
      if (response.success) {
        Alert.alert('Success', 'Content submitted for review successfully');
        await loadContent(); // Reload to update status
      } else {
        Alert.alert('Error', response.error || 'Failed to submit for review');
      }
    } catch (error) {
      console.error('Error submitting for review:', error);
      Alert.alert('Error', 'Failed to submit for review');
    }
  };

  const handleEditorClose = () => {
    setEditorVisible(false);
    setSelectedItem(null);
    setEditorType('');
  };

  const handleUseTemplate = (template) => {
    setTemplatesVisible(false);
    setSelectedItem(template.content);
    setEditorType(template.type);
    setEditorVisible(true);
    Alert.alert('Template Applied', `Using "${template.name}" template`);
  };

  const handleEditorSave = () => {
    handleEditorClose();
    loadContent();
  };

  const renderContentList = () => {
    const items = content[activeTab] || [];
    
    if (items.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📝</Text>
          <Text style={styles.emptyStateText}>No {activeTab} found</Text>
          <Text style={styles.emptyStateSubtext}>Create your first {activeTab.slice(0, -1)} to get started</Text>
        </View>
      );
    }

    return items.map((item, index) => (
      <View key={item?.id || index} style={styles.contentCard}>
        <View style={styles.contentHeader}>
          <View style={styles.contentInfo}>
            <Text style={styles.contentTitle}>
              {item?.title || item?.name || `Untitled ${activeTab.slice(0, -1)}`}
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[item?.status || 'draft'] }]}>
                <Text style={styles.statusText}>{statusLabels[item?.status || 'draft']}</Text>
              </View>
            </View>
          </View>
          <View style={styles.contentActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditItem(item)}
            >
              <Text style={styles.actionButtonText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteItem(item)}
            >
              <Text style={styles.actionButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.contentDescription}>
          {item?.description || item?.content || 'No description available'}
        </Text>
        
        <View style={styles.contentMeta}>
          {item?.difficulty && (
            <Text style={styles.metaTag}>Difficulty: {item.difficulty}</Text>
          )}
          {item?.xp_reward && (
            <Text style={styles.metaTag}>XP: {item.xp_reward}</Text>
          )}
          {item?.category && (
            <Text style={styles.metaTag}>{item.category}</Text>
          )}
        </View>

        {/* Publishing Workflow Actions */}
        <View style={styles.workflowActions}>
          {item?.status === 'draft' && (
            <TouchableOpacity
              style={[styles.workflowButton, styles.submitButton]}
              onPress={() => handleSubmitForReview(item)}
            >
              <Text style={styles.workflowButtonText}>📤 Submit for Review</Text>
            </TouchableOpacity>
          )}
          
          {item?.status === 'review' && (
            <Text style={styles.reviewStatus}>
              ⏳ Awaiting review - Submitted on {item.submitted_for_review_at ? 
                new Date(item.submitted_for_review_at).toLocaleDateString() : 'Unknown date'}
              </Text>
          )}
          
          {item?.status === 'approved' && (
            <Text style={styles.approvedStatus}>
              ✅ Approved - Ready for publishing
            </Text>
          )}
          
          {item?.status === 'published' && (
            <Text style={styles.publishedStatus}>
              🚀 Published - Live for users
            </Text>
          )}
        </View>
      </View>
    ));
  };

  const renderEditor = () => {
    const props = {
      item: selectedItem,
      onClose: handleEditorClose,
      onSave: handleEditorSave,
      user: user
    };

    switch (editorType) {
      case 'module':
        return <ModuleEditor {...props} />;
      case 'lesson':
        return <LessonEditor {...props} />;
      case 'quiz':
        return <QuizEditor {...props} />;
      case 'challenge':
        return <ChallengeEditor {...props} />;
      case 'badge':
        return <BadgeEditor {...props} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Content Management...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Content Management</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.moderationButton}
              onPress={() => setModerationQueueVisible(true)}
            >
              <Text style={styles.moderationButtonText}>🛡️ Moderation</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.templatesButton}
              onPress={() => setTemplatesVisible(true)}
            >
              <Text style={styles.templatesButtonText}>📋 Templates</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
              <Text style={styles.createButtonText}>+ New</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabIcon, activeTab === tab.id && styles.activeTabIcon]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.contentHeader}>
          <Text style={styles.sectionTitle}>
            {tabs.find(t => t.id === activeTab)?.label} ({content[activeTab]?.length || 0})
          </Text>
        </View>
        
        {renderContentList()}
      </ScrollView>

      {/* Editor Modal */}
      <Modal
        visible={editorVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleEditorClose}
      >
        {renderEditor()}
      </Modal>

      {/* Moderation Queue Modal */}
      <Modal
        visible={moderationQueueVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModerationQueueVisible(false)}
      >
        <ModerationQueueScreen onClose={() => setModerationQueueVisible(false)} />
      </Modal>

      {/* Templates Modal */}
      <Modal
        visible={templatesVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setTemplatesVisible(false)}
      >
        <ContentTemplatesScreen 
          onClose={() => setTemplatesVisible(false)}
          onUseTemplate={handleUseTemplate}
          user={user}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'column',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  createButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  tabContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  tabContentContainer: {
    paddingHorizontal: 20,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF6B6B',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeTabIcon: {
    color: 'white',
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentHeader: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  contentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    fontSize: 16,
  },
  contentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  contentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metaTag: {
    fontSize: 12,
    color: '#4ECDC4',
    backgroundColor: '#e8f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  workflowActions: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  workflowButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  workflowButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
  },
  reviewStatus: {
    fontSize: 14,
    color: '#ffc107',
    marginBottom: 10,
  },
  approvedStatus: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 10,
  },
  publishedStatus: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  moderationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  moderationButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  templatesButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  templatesButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ContentManagementScreen;
