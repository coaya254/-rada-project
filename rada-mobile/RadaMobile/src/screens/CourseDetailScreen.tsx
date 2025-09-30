import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { CourseDetailProps, Lesson } from '../types/LearningTypes';

export const CourseDetailScreen: React.FC<CourseDetailProps> = ({ route, navigation }) => {
  const { courseId, title, description, lessons, duration, xp, progress } = route.params;

  const lessonsList: Lesson[] = [
    { id: 1, title: 'Introduction to Rights', description: 'Basic rights and freedoms', duration: '8m', completed: true },
    { id: 2, title: 'Constitutional Rights', description: 'Chapter 4 of the Constitution', duration: '12m', completed: true },
    { id: 3, title: 'Human Rights', description: 'Universal declaration', duration: '10m', completed: true },
    { id: 4, title: 'Enforcing Your Rights', description: 'Legal remedies and procedures', duration: '15m', completed: false, current: true },
    { id: 5, title: 'Rights in Practice', description: 'Real-world applications', duration: '10m', completed: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.courseDetailHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={18} color="white" />
        </TouchableOpacity>
        <View style={styles.courseDetailIcon}>
          <Icon name="balance-scale" size={36} color="white" />
        </View>
        <Text style={styles.courseDetailTitle}>{title}</Text>
        <Text style={styles.courseDetailDesc}>
          {description || 'Understanding your constitutional rights as a Kenyan citizen'}
        </Text>
        
        <View style={styles.courseStatsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{lessons}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{duration}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {xp || 150}</Text>
            <Text style={styles.statLabel}>XP Points</Text>
          </View>
        </View>
      </View>

      {/* Start/Continue Learning Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => navigation.navigate('Lesson', {
            lessonId: progress > 0 ? 4 : 1,
            lessonTitle: progress > 0 ? 'Enforcing Your Rights' : 'Introduction to Rights',
            courseTitle: title
          })}
        >
          <Text style={styles.continueButtonText}>
            {progress > 0 ? 'Continue Learning' : 'Start Learning'}
          </Text>
          <Icon name="arrow-right" size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Lessons List */}
      <ScrollView style={styles.lessonList}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Course Content</Text>
        </View>

        {lessonsList.map((lesson) => (
          <TouchableOpacity 
            key={lesson.id}
            style={styles.lessonItem}
            onPress={() => navigation.navigate('Lesson', {
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              courseTitle: title
            })}
          >
            <View style={[
              styles.lessonStatus,
              {
                backgroundColor: lesson.completed ? '#10b98120' : lesson.current ? '#4a6cfa20' : '#64748b20',
              }
            ]}>
              {lesson.completed ? (
                <Icon name="check" size={14} color="#10b981" />
              ) : (
                <Text style={[
                  styles.lessonNumber,
                  { color: lesson.current ? '#4a6cfa' : '#64748b' }
                ]}>
                  {lesson.id}
                </Text>
              )}
            </View>
            <View style={styles.lessonContent}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonDesc}>{lesson.description}</Text>
            </View>
            <View style={styles.lessonDuration}>
              <Icon name="clock-o" size={12} color="#64748b" />
              <Text style={styles.lessonDurationText}>{lesson.duration}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // Course Detail Styles
  courseDetailHeader: {
    backgroundColor: '#4a6cfa',
    padding: 40,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseDetailIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  courseDetailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  courseDetailDesc: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  courseStatsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Lesson List Styles
  lessonList: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  lessonDesc: {
    fontSize: 14,
    color: '#64748b',
  },
  lessonDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonDurationText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  continueButton: {
    backgroundColor: '#4a6cfa',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default CourseDetailScreen;
