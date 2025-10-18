import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LearningStackParamList } from '../../navigation/LearningStackNavigator';
import LearningAPIService from '../../services/LearningAPIService';

interface LearningPathScreenProps {
  navigation: NativeStackNavigationProp<LearningStackParamList, 'LearningPath'>;
}

interface PathModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  xpReward: number;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  progress?: number;
  icon: string;
}

interface LearningPath {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  totalModules: number;
  completedModules: number;
  estimatedTime: string;
  totalXP: number;
  color: string;
  icon: string;
  modules: PathModule[];
}

export const LearningPathScreen: React.FC<LearningPathScreenProps> = ({ navigation }) => {
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLearningPaths();
  }, []);

  const loadLearningPaths = async () => {
    try {
      setLoading(true);
      const response = await LearningAPIService.getLearningPaths();

      if (response.success && response.paths) {
        // Transform backend data to frontend format
        const transformedPaths: LearningPath[] = response.paths.map((path: any) => ({
          id: path.id,
          title: path.title,
          description: path.description || '',
          category: path.category || 'General',
          difficulty: path.difficulty || 'Beginner',
          totalModules: path.module_count || 0,
          completedModules: 0, // TODO: Get from user progress
          estimatedTime: `${path.estimated_hours || 10} hours`,
          totalXP: path.total_xp || 0,
          color: getCategoryColor(path.category),
          icon: getCategoryIcon(path.category),
          modules: [], // Will be loaded when path is selected
        }));

        setLearningPaths(transformedPaths);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading learning paths:', error);
      setLoading(false);
    }
  };

  const loadPathModules = async (pathId: number) => {
    try {
      const response = await LearningAPIService.getLearningPathById(pathId);

      if (response.success && response.path) {
        const modules: PathModule[] = (response.path.modules || []).map((mod: any, index: number) => ({
          id: mod.module_id || mod.id,
          title: mod.title,
          description: mod.description || '',
          duration: `${mod.duration_hours || 2} hours`,
          xpReward: mod.xp_reward || 100,
          status: index === 0 ? 'available' : 'locked', // First module always available, TODO: Check user progress
          progress: 0, // TODO: Get from user progress
          icon: mod.icon || 'school',
        }));

        // Update the selected path with modules
        if (selectedPath && selectedPath.id === pathId) {
          setSelectedPath({
            ...selectedPath,
            modules,
          });
        }
      }
    } catch (error) {
      console.error('Error loading path modules:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLearningPaths();
    setRefreshing(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Government': '#3B82F6',
      'Elections': '#10B981',
      'Rights': '#8B5CF6',
      'Law': '#F59E0B',
      'Policy': '#EF4444',
      'Civic Education': '#06B6D4',
    };
    return colors[category] || '#6B7280';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Government': 'account-balance',
      'Elections': 'how-to-vote',
      'Rights': 'people',
      'Law': 'gavel',
      'Policy': 'description',
      'Civic Education': 'school',
    };
    return icons[category] || 'menu-book';
  };

  const handlePathPress = async (path: LearningPath) => {
    setSelectedPath(path);
    setModalVisible(true);
    // Load modules for this path
    await loadPathModules(path.id);
  };

  const handleStartModule = (module: PathModule) => {
    if (module.status === 'locked') return;

    // Navigate to the module
    setModalVisible(false);
    navigation.navigate('ModuleDetail', {
      module: {
        id: module.id,
        title: module.title,
        description: module.description,
        icon: module.icon,
        progress: module.progress || 0,
        totalLessons: 10,
        completedLessons: Math.floor((module.progress || 0) / 10),
        xpReward: module.xpReward,
        difficulty: selectedPath?.difficulty || 'Intermediate',
        category: selectedPath?.category || 'General',
      }
    });
  };

  const getStatusColor = (status: PathModule['status']) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#F59E0B';
      case 'available': return '#3B82F6';
      case 'locked': return '#9CA3AF';
    }
  };

  const getStatusIcon = (status: PathModule['status']) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'in-progress': return 'schedule';
      case 'available': return 'play-circle';
      case 'locked': return 'lock';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#666';
    }
  };

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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Learning Paths</Text>
          <Text style={styles.headerSubtitle}>Structured learning journeys</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading learning paths...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && learningPaths.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="school" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No Learning Paths Yet</Text>
            <Text style={styles.emptyText}>Check back later for curated learning journeys</Text>
          </View>
        )}

        {/* Info Banner */}
        {!loading && learningPaths.length > 0 && (
          <View style={styles.infoBanner}>
            <MaterialIcons name="info" size={24} color="#3B82F6" />
            <Text style={styles.infoBannerText}>
              Follow curated learning paths designed to take you from beginner to expert
            </Text>
          </View>
        )}

        {/* Learning Paths */}
        {!loading && learningPaths.map((path) => {
          const progressPercentage = (path.completedModules / path.totalModules) * 100;

          return (
            <TouchableOpacity
              key={path.id}
              style={styles.pathCard}
              onPress={() => handlePathPress(path)}
            >
              <LinearGradient
                colors={[path.color, path.color + 'DD']}
                style={styles.pathGradient}
              >
                {/* Header */}
                <View style={styles.pathHeader}>
                  <View style={styles.pathIconContainer}>
                    <MaterialIcons name={path.icon as any} size={32} color="#FFFFFF" />
                  </View>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(path.difficulty) }]}>
                    <Text style={styles.difficultyText}>{path.difficulty}</Text>
                  </View>
                </View>

                {/* Content */}
                <Text style={styles.pathTitle}>{path.title}</Text>
                <Text style={styles.pathDescription}>{path.description}</Text>

                {/* Stats */}
                <View style={styles.pathStats}>
                  <View style={styles.statItem}>
                    <MaterialIcons name="menu-book" size={18} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.statText}>{path.totalModules} modules</Text>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialIcons name="schedule" size={18} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.statText}>{path.estimatedTime}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialIcons name="stars" size={18} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.statText}>{path.totalXP} XP</Text>
                  </View>
                </View>

                {/* Progress */}
                <View style={styles.progressSection}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {path.completedModules} of {path.totalModules} completed
                    </Text>
                    <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Path Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPath && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal Header */}
                <LinearGradient
                  colors={[selectedPath.color, selectedPath.color + 'DD']}
                  style={styles.modalHeader}
                >
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <MaterialIcons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>

                  <View style={styles.modalIconContainer}>
                    <MaterialIcons name={selectedPath.icon as any} size={64} color="#FFFFFF" />
                  </View>

                  <Text style={styles.modalTitle}>{selectedPath.title}</Text>
                  <Text style={styles.modalDescription}>{selectedPath.description}</Text>

                  <View style={styles.modalStats}>
                    <View style={styles.modalStatItem}>
                      <MaterialIcons name="menu-book" size={20} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.modalStatText}>{selectedPath.totalModules} Modules</Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <MaterialIcons name="schedule" size={20} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.modalStatText}>{selectedPath.estimatedTime}</Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Modules List */}
                <View style={styles.modulesSection}>
                  <Text style={styles.sectionTitle}>Learning Journey</Text>

                  {selectedPath.modules.map((module, index) => (
                    <View key={module.id}>
                      <TouchableOpacity
                        style={[
                          styles.moduleItem,
                          module.status === 'locked' && styles.moduleItemLocked
                        ]}
                        onPress={() => handleStartModule(module)}
                        disabled={module.status === 'locked'}
                      >
                        {/* Module Number & Icon */}
                        <View style={styles.moduleLeft}>
                          <View style={[
                            styles.moduleNumber,
                            { backgroundColor: getStatusColor(module.status) + '20' }
                          ]}>
                            <Text style={[styles.moduleNumberText, { color: getStatusColor(module.status) }]}>
                              {index + 1}
                            </Text>
                          </View>

                          <View style={[
                            styles.moduleIconContainer,
                            { backgroundColor: getStatusColor(module.status) + '20' }
                          ]}>
                            <MaterialIcons
                              name={module.icon as any}
                              size={24}
                              color={getStatusColor(module.status)}
                            />
                          </View>
                        </View>

                        {/* Module Info */}
                        <View style={styles.moduleInfo}>
                          <View style={styles.moduleTitleRow}>
                            <Text style={[
                              styles.moduleTitle,
                              module.status === 'locked' && styles.moduleTitleLocked
                            ]}>
                              {module.title}
                            </Text>
                            <MaterialIcons
                              name={getStatusIcon(module.status)}
                              size={24}
                              color={getStatusColor(module.status)}
                            />
                          </View>

                          <Text style={[
                            styles.moduleDescription,
                            module.status === 'locked' && styles.moduleDescriptionLocked
                          ]}>
                            {module.description}
                          </Text>

                          <View style={styles.moduleMeta}>
                            <View style={styles.moduleMetaItem}>
                              <MaterialIcons name="schedule" size={14} color="#666" />
                              <Text style={styles.moduleMetaText}>{module.duration}</Text>
                            </View>
                            <View style={styles.moduleMetaItem}>
                              <MaterialIcons name="stars" size={14} color="#F59E0B" />
                              <Text style={styles.moduleMetaText}>+{module.xpReward} XP</Text>
                            </View>
                          </View>

                          {/* Progress bar for in-progress modules */}
                          {module.status === 'in-progress' && module.progress !== undefined && (
                            <View style={styles.moduleProgress}>
                              <View style={styles.moduleProgressBar}>
                                <View style={[
                                  styles.moduleProgressFill,
                                  { width: `${module.progress}%`, backgroundColor: getStatusColor(module.status) }
                                ]} />
                              </View>
                              <Text style={styles.moduleProgressText}>{module.progress}%</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* Connector Line */}
                      {index < selectedPath.modules.length - 1 && (
                        <View style={styles.connectorLine} />
                      )}
                    </View>
                  ))}
                </View>

                {/* Action Button */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.startPathButton}
                    onPress={() => {
                      const firstAvailableModule = selectedPath.modules.find(
                        m => m.status === 'available' || m.status === 'in-progress'
                      );
                      if (firstAvailableModule) {
                        handleStartModule(firstAvailableModule);
                      }
                    }}
                  >
                    <LinearGradient
                      colors={[selectedPath.color, selectedPath.color + 'DD']}
                      style={styles.startPathButtonGradient}
                    >
                      <Text style={styles.startPathButtonText}>
                        {selectedPath.completedModules > 0 ? 'Continue Path' : 'Start Path'}
                      </Text>
                      <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
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
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  pathCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  pathGradient: {
    padding: 20,
  },
  pathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pathIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pathTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pathDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  pathStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  progressSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    padding: 32,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalStats: {
    flexDirection: 'row',
    gap: 24,
  },
  modalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalStatText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  modulesSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  moduleItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  moduleItemLocked: {
    opacity: 0.6,
  },
  moduleLeft: {
    alignItems: 'center',
    gap: 8,
  },
  moduleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  moduleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  moduleTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  moduleTitleLocked: {
    color: '#9CA3AF',
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  moduleDescriptionLocked: {
    color: '#9CA3AF',
  },
  moduleMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  moduleMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleMetaText: {
    fontSize: 12,
    color: '#666',
  },
  moduleProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  moduleProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  moduleProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  moduleProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 35,
  },
  connectorLine: {
    width: 2,
    height: 24,
    backgroundColor: '#e9ecef',
    marginLeft: 40,
    marginVertical: 4,
  },
  modalActions: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  startPathButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startPathButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  startPathButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
