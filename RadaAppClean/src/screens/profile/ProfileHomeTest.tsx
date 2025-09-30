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

export const ProfileHomeTest: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Your civic engagement journey</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <MaterialIcons name="settings" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.profileCard}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.profileGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.profileContent}>
                <View style={styles.profileHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>JD</Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>John Doe</Text>
                    <Text style={styles.profileTitle}>Active Citizen</Text>
                    <Text style={styles.profileLocation}>📍 Nairobi County</Text>
                  </View>
                </View>

                <View style={styles.profileStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>15</Text>
                    <Text style={styles.statLabel}>LESSONS</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>8</Text>
                    <Text style={styles.statLabel}>QUIZZES</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>3</Text>
                    <Text style={styles.statLabel}>BADGES</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Profile Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Progress & Stats</Text>
            <Text style={styles.cardText}>View your learning progress and achievements</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>⭐ Favorites</Text>
            <Text style={styles.cardText}>Politicians and topics you're following</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔔 Notifications</Text>
            <Text style={styles.cardText}>Manage alerts and updates</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚙️ Settings</Text>
            <Text style={styles.cardText}>Privacy, preferences, and account settings</Text>
          </View>
        </View>

        <Text style={styles.testNote}>
          ✅ Profile screen working! Manage your account and track progress.
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
  profileCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileGradient: {
    padding: 24,
  },
  profileContent: {
    gap: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 20,
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
    color: '#F59E0B',
    fontWeight: '600',
    padding: 20,
    backgroundColor: '#FFFBEB',
    marginHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
});