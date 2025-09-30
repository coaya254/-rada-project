import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface PrivacyFeature {
  id: number;
  title: string;
  description: string;
  icon: string;
  gradient: string[];
  benefits: string[];
}

const privacyFeatures: PrivacyFeature[] = [
  {
    id: 1,
    title: 'Local-First Storage',
    description: 'Your data stays on your device first, giving you complete control.',
    icon: '💾',
    gradient: ['#E3F2FD', '#BBDEFB'],
    benefits: [
      'Data never leaves your device without permission',
      'Works offline - no internet required',
      'You control what gets shared',
      'Instant access to your information'
    ]
  },
  {
    id: 2,
    title: 'Cryptographic Identity',
    description: 'Your UUID is generated using secure cryptographic methods.',
    icon: '🔐',
    gradient: ['#F3E5F5', '#E1BEE7'],
    benefits: [
      'Cannot be traced back to your real identity',
      'Generated using secure random algorithms',
      'Unique across all devices and users',
      'No personal information required'
    ]
  },
  {
    id: 3,
    title: 'Anonymous Participation',
    description: 'Engage with the community without revealing who you are.',
    icon: '👤',
    gradient: ['#E8F5E8', '#C8E6C9'],
    benefits: [
      'Post content without identity exposure',
      'Participate in discussions safely',
      'Share civic updates anonymously',
      'Protect yourself from retaliation'
    ]
  },
  {
    id: 4,
    title: 'Granular Privacy Controls',
    description: 'Choose exactly what information you want to share.',
    icon: '⚙️',
    gradient: ['#FFF3E0', '#FFE0B2'],
    benefits: [
      'Toggle privacy settings anytime',
      'Control location sharing',
      'Manage age group visibility',
      'Opt-in data collection only'
    ]
  },
  {
    id: 5,
    title: 'Device Fingerprinting',
    description: 'Secure device identification without compromising privacy.',
    icon: '📱',
    gradient: ['#FCE4EC', '#F8BBD9'],
    benefits: [
      'Secure device authentication',
      'No personal data collected',
      'Prevents unauthorized access',
      'Maintains device security'
    ]
  },
  {
    id: 6,
    title: 'Complete Data Control',
    description: 'You can clear all your data at any time.',
    icon: '🗑️',
    gradient: ['#F1F8E9', '#DCEDC8'],
    benefits: [
      'Delete all data instantly',
      'Reset privacy settings',
      'Start fresh anytime',
      'No data retention policies'
    ]
  }
];

const PrivacyEducationScreen: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleFeatureSelect = (index: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    
    setSelectedFeature(index);
  };

  const currentFeature = privacyFeatures[selectedFeature];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      <LinearGradient
        colors={currentFeature.gradient as [string, string]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔒 Privacy Education</Text>
          <Text style={styles.headerSubtitle}>Understanding AnonMode™</Text>
        </View>

        {/* Feature Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.featureSelector}
          contentContainerStyle={styles.featureSelectorContent}
        >
          {privacyFeatures.map((feature, index) => (
            <TouchableOpacity
              key={feature.id}
              style={[
                styles.featureButton,
                selectedFeature === index && styles.selectedFeatureButton
              ]}
              onPress={() => handleFeatureSelect(index)}
            >
              <Text style={styles.featureButtonIcon}>{feature.icon}</Text>
              <Text style={[
                styles.featureButtonText,
                selectedFeature === index && styles.selectedFeatureButtonText
              ]}>
                {feature.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Feature Content */}
        <Animated.View 
          style={[
            styles.content,
            { opacity: fadeAnim }
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Feature Icon */}
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>{currentFeature.icon}</Text>
            </View>

            {/* Feature Title */}
            <Text style={styles.featureTitle}>{currentFeature.title}</Text>
            
            {/* Feature Description */}
            <Text style={styles.featureDescription}>
              {currentFeature.description}
            </Text>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Key Benefits:</Text>
              {currentFeature.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>✅</Text>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Technical Details */}
            <View style={styles.technicalContainer}>
              <Text style={styles.technicalTitle}>How It Works:</Text>
              {selectedFeature === 0 && (
                <Text style={styles.technicalText}>
                  Data is stored locally using AsyncStorage, which is encrypted by the operating system. 
                  Only data you explicitly choose to share is transmitted to servers.
                </Text>
              )}
              {selectedFeature === 1 && (
                <Text style={styles.technicalText}>
                  UUIDs are generated using crypto.getRandomValues() when available, or secure 
                  Math.random() fallbacks. Version 4 UUIDs ensure uniqueness and randomness.
                </Text>
              )}
              {selectedFeature === 2 && (
                <Text style={styles.technicalText}>
                  All posts and interactions use your anonymous UUID instead of personal information. 
                  Your real identity is never associated with your activities.
                </Text>
              )}
              {selectedFeature === 3 && (
                <Text style={styles.technicalText}>
                  Privacy settings are stored locally and applied in real-time. You can change 
                  them anytime, and the changes take effect immediately.
                </Text>
              )}
              {selectedFeature === 4 && (
                <Text style={styles.technicalText}>
                  Device fingerprinting uses installation ID and device characteristics to create 
                  a unique but non-personal identifier for security purposes.
                </Text>
              )}
              {selectedFeature === 5 && (
                <Text style={styles.technicalText}>
                  All local data can be cleared instantly using AsyncStorage.multiRemove(). 
                  This includes user data, settings, and device fingerprints.
                </Text>
              )}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerTitle}>🔒 AnonMode™</Text>
            <Text style={styles.footerSubtitle}>
              Your privacy, your control, your civic engagement
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  featureSelector: {
    marginBottom: 20,
  },
  featureSelectorContent: {
    paddingHorizontal: 20,
  },
  featureButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    minWidth: 80,
  },
  selectedFeatureButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  featureButtonIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  featureButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedFeatureButtonText: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  featureIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  featureIcon: {
    fontSize: 50,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  featureDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  benefitIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  technicalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  technicalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  technicalText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footerContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 5,
  },
  footerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PrivacyEducationScreen;
