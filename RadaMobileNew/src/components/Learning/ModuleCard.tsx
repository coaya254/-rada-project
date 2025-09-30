import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ModuleCardProps {
  module: {
    id: string;
    title: string;
    description: string;
    progress?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime?: number;
    isCompleted?: boolean;
  };
  onPress: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onPress }) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'leaf-outline';
      case 'intermediate': return 'flame-outline';
      case 'advanced': return 'diamond-outline';
      default: return 'book-outline';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={module.isCompleted ? ['#10B981', '#059669'] : ['#FFFFFF', '#F8FAFC']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, module.isCompleted && styles.completedTitle]}>
              {module.title}
            </Text>
            {module.isCompleted && (
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            )}
          </View>
          
          {module.difficulty && (
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(module.difficulty) }]}>
              <Ionicons 
                name={getDifficultyIcon(module.difficulty)} 
                size={12} 
                color="#FFFFFF" 
              />
              <Text style={styles.difficultyText}>{module.difficulty}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.description, module.isCompleted && styles.completedDescription]}>
          {module.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.timeText}>
              {module.estimatedTime ? `${module.estimatedTime} min` : 'Quick read'}
            </Text>
          </View>

          {module.progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${module.progress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{module.progress}%</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  completedTitle: {
    color: '#FFFFFF',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  completedDescription: {
    color: '#E5E7EB',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
});

export default ModuleCard;


