import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { Card, Button, StatusBadge } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useAnonMode } from '../contexts/AnonModeContext';
import apiService from '../services/api';

interface Module {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  progress: number;
  lessons_count: number;
}

interface SimpleLearningHubProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

const SimpleLearningHub: React.FC<SimpleLearningHubProps> = ({ navigation }) => {
  const { user } = useAnonMode();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load real modules from API
      const modulesResponse = await apiService.getModules();

      let modules = [];
      if (Array.isArray(modulesResponse)) {
        modules = modulesResponse;
      } else if (modulesResponse?.data && Array.isArray(modulesResponse.data)) {
        modules = modulesResponse.data;
      } else if ((modulesResponse as any)?.modules && Array.isArray((modulesResponse as any).modules)) {
        modules = (modulesResponse as any).modules;
      }

      // Transform API data to match our interface
      const transformedModules = modules.map((module: any) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        status: module.progress > 80 ? 'completed' : module.progress > 0 ? 'in_progress' : 'pending',
        progress: module.progress || 0,
        lessons_count: module.lessons_count || 0,
      }));

      setModules(transformedModules);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load content. Please check your connection.');
      
      // No fallback data - show error state instead
      setModules([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      paddingTop: spacing['4xl'],
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.xl,
    },
    headerGradient: {
      borderBottomLeftRadius: borderRadius['2xl'],
      borderBottomRightRadius: borderRadius['2xl'],
    },
    headerContent: {
      alignItems: 'center',
    },
    welcomeTitle: {
      fontSize: typography.sizes['3xl'],
      fontWeight: typography.weights.bold,
      color: colors.primary.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    welcomeSubtitle: {
      fontSize: typography.sizes.lg,
      color: colors.primary.text,
      opacity: 0.9,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.semibold,
      color: colors.text.primary,
      marginBottom: spacing.lg,
    },
    moduleCard: {
      marginBottom: spacing.lg,
    },
    moduleContent: {
      padding: spacing.xl,
    },
    moduleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    moduleInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    moduleTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.semibold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    moduleDescription: {
      fontSize: typography.sizes.base,
      color: colors.text.secondary,
      lineHeight: typography.lineHeights.relaxed,
    },
    moduleFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    moduleStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statText: {
      fontSize: typography.sizes.sm,
      color: colors.text.tertiary,
      marginLeft: spacing.xs,
    },
    progressBar: {
      height: 4,
      backgroundColor: colors.border.light,
      borderRadius: borderRadius.full,
      marginTop: spacing.md,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary.main,
      borderRadius: borderRadius.full,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: typography.sizes.base,
      color: colors.text.secondary,
      marginTop: spacing.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.semibold,
      color: colors.text.primary,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    emptyDescription: {
      fontSize: typography.sizes.base,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: typography.lineHeights.relaxed,
    },
    retryButton: {
      backgroundColor: colors.primary.main,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.md,
      marginTop: spacing.lg,
    },
    retryButtonText: {
      color: colors.primary.text,
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.semibold,
      textAlign: 'center',
    },
  });

  if (isLoading && modules.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary.main, colors.primary.dark]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.welcomeTitle}>Learning Hub</Text>
              <Text style={styles.welcomeSubtitle}>Expand your civic knowledge</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading learning modules...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary.main, colors.primary.dark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeTitle}>Learning Hub</Text>
            <Text style={styles.welcomeSubtitle}>Expand your civic knowledge</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Your Learning Journey</Text>

        {modules.length === 0 && !isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No Learning Modules Available</Text>
            <Text style={styles.emptyDescription}>
              {error ? 'Failed to load learning content. Please check your connection and try again.' : 'No learning modules are currently available. Check back later for new content!'}
            </Text>
            {error && (
              <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          modules.map((module) => (
          <Card key={module.id} style={styles.moduleCard}>
            <View style={styles.moduleContent}>
              <View style={styles.moduleHeader}>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleDescription}>{module.description}</Text>
                </View>
                <StatusBadge status={module.status} />
              </View>

              {module.progress > 0 && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${module.progress}%` }
                    ]}
                  />
                </View>
              )}

              <View style={styles.moduleFooter}>
                <View style={styles.moduleStats}>
                  <Ionicons name="book-outline" size={16} color={colors.text.tertiary} />
                  <Text style={styles.statText}>{module.lessons_count} lessons</Text>
                </View>

                <Button
                  title={module.status === 'completed' ? 'Review' : module.status === 'in_progress' ? 'Continue' : 'Start'}
                  onPress={() => navigation.navigate('ModuleDetailScreen', {
                    moduleId: module.id,
                    module: module
                  })}
                  variant={module.status === 'pending' ? 'primary' : 'outline'}
                />
              </View>
            </View>
          </Card>
        )))}

        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>
    </View>
  );
};

export default SimpleLearningHub;