import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProvider, useUser } from './src/contexts/UserContext';
import { AuthProvider } from './src/contexts/AuthContext';
import OnboardingFlow from './src/screens/OnboardingFlow';
import MainApp from './src/screens/MainApp';

const AppContent = () => {
  const { loading, isFirstTime } = useUser();

  // Debug logging
  console.log('🔍 App States:', { loading, isFirstTime });

  if (loading) {
    console.log('🔄 Showing Loading Screen');
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#E1F5FE', '#B3E5FC']}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingContent}>
            <Text style={styles.loadingTitle}>Rada Mobile</Text>
            <ActivityIndicator size="large" color="#FFD700" style={styles.spinner} />
            <Text style={styles.loadingText}>Loading your experience...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (isFirstTime) {
    console.log('🎯 Showing Onboarding Flow');
    return <OnboardingFlow />;
  }

  // Main app content
  console.log('🏠 Showing Main App');
  return <MainApp />;
};

const App = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    marginBottom: 30,
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
});

export default App;
