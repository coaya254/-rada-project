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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PoliticsStackParamList } from '../../navigation/PoliticsStackNavigator';

interface PoliticsHomeProps {
  navigation: NativeStackNavigationProp<PoliticsStackParamList, 'PoliticsHome'>;
}

export const PoliticsHomeTest: React.FC<PoliticsHomeProps> = ({ navigation }) => {
  const featuredPolitician = {
    id: 1,
    name: 'Amason Jeffah Kingi',
    title: 'Speaker of the Senate',
    party: 'PAA',
    constituency: 'Kilifi County',
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Politics</Text>
            <Text style={styles.headerSubtitle}>Track politicians & their commitments</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <MaterialIcons name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Featured Politician Card */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => navigation.navigate('PoliticianDetail', { politician: featuredPolitician })}
          >
            <LinearGradient
              colors={['#3B82F6', '#1E40AF']}
              style={styles.featuredGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featuredContent}>
                <Text style={styles.featuredTitle}>Featured Politician</Text>
                <Text style={styles.featuredName}>{featuredPolitician.name}</Text>
                <Text style={styles.featuredTitle}>{featuredPolitician.title}</Text>
                <Text style={styles.featuredLocation}>
                  📍 {featuredPolitician.constituency} • {featuredPolitician.party}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Simple Cards */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Research Tools</Text>
            <Text style={styles.cardText}>Access politician data and voting records</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Voting Records</Text>
            <Text style={styles.cardText}>Track how politicians vote on key issues</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Political Archive</Text>
            <Text style={styles.cardText}>Historical data and politician profiles</Text>
          </View>
        </View>

        <Text style={styles.testNote}>
          ✅ Politics screen working! Click the politician card to navigate.
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
    alignItems: 'center',
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  featuredName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  featuredLocation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
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