import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LearningHomeTest: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Learning Hub</Text>
            <Text style={styles.headerSubtitle}>Master civic engagement & democracy</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <MaterialIcons name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Progress Card */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.progressCard}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.progressGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.progressContent}>
                <View style={styles.progressHeader}>
                  <MaterialIcons name="trending-up" size={32} color="#FFFFFF" />
                  <View style={styles.progressStats}>
                    <Text style={styles.progressPercentage}>78%</Text>
                    <Text style={styles.progressLabel}>COMPLETE</Text>
                  </View>
                </View>
                <Text style={styles.progressTitle}>Your Learning Journey</Text>
                <Text style={styles.progressSubtitle}>12 of 15 modules completed</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Learning Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Paths</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>📜 Constitution</Text>
            <Text style={styles.cardText}>Learn about fundamental rights & structure</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🗳️ Elections</Text>
            <Text style={styles.cardText}>How voting & campaigns work</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🏛️ Government</Text>
            <Text style={styles.cardText}>Branches & separation of powers</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>✊ Civil Rights</Text>
            <Text style={styles.cardText}>History & current movements</Text>
          </View>
        </View>

        <Text style={styles.testNote}>
          ✅ Learning Hub working! Browse through the learning paths.
        </Text>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  progressCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressGradient: {
    padding: 24,
    minHeight: 140,
  },
  progressContent: {
    gap: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStats: {
    alignItems: 'flex-end',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  testNote: {
    textAlign: 'center',
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
    padding: 20,
    backgroundColor: '#F0FDF4',
    marginHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
});