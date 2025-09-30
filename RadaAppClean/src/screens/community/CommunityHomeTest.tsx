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

export const CommunityHomeTest: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Community</Text>
            <Text style={styles.headerSubtitle}>Connect & discuss with citizens</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <MaterialIcons name="notifications" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Featured Discussion */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.featuredCard}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.featuredGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featuredContent}>
                <Text style={styles.featuredTitle}>🔥 Hot Topic</Text>
                <Text style={styles.featuredName}>Local Infrastructure Budget</Text>
                <Text style={styles.featuredSubtitle}>Join the discussion about your community's future</Text>
                <View style={styles.featuredStats}>
                  <Text style={styles.featuredStat}>👥 127 participants</Text>
                  <Text style={styles.featuredStat}>💬 89 comments</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Community Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Features</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>💬 Discussions</Text>
            <Text style={styles.cardText}>Join conversations about local and national issues</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🗳️ Local Polls</Text>
            <Text style={styles.cardText}>Voice your opinion on community matters</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>📅 Events</Text>
            <Text style={styles.cardText}>Find town halls, debates, and civic events</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎯 Take Action</Text>
            <Text style={styles.cardText}>Contact representatives and get involved</Text>
          </View>
        </View>

        <Text style={styles.testNote}>
          ✅ Community screen working! Connect with fellow citizens.
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
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredGradient: {
    padding: 24,
    minHeight: 160,
  },
  featuredContent: {
    justifyContent: 'center',
    gap: 8,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  featuredName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  featuredStats: {
    flexDirection: 'row',
    gap: 16,
  },
  featuredStat: {
    fontSize: 12,
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
    color: '#8B5CF6',
    fontWeight: '600',
    padding: 20,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
});