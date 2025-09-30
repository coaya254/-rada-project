import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAnonMode } from '../contexts/AnonModeContext';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string[];
  features: Array<{
    icon: string;
    text: string;
  }>;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to AnonMode™',
    subtitle: 'Your privacy-first civic engagement platform',
    description: 'Participate in Kenya\'s civic community while maintaining complete privacy and anonymity.',
    icon: '🔒',
    gradient: ['#E3F2FD', '#BBDEFB'],
    features: [
      { icon: '🛡️', text: 'Local-first data storage' },
      { icon: '🔐', text: 'Cryptographically secure identity' },
      { icon: '👤', text: 'Anonymous participation' }
    ]
  },
  {
    id: 2,
    title: 'Your Anonymous Identity',
    subtitle: 'Create a secure, untraceable profile',
    description: 'Generate a unique UUID that cannot be linked to your real identity. Your privacy is guaranteed.',
    icon: '🆔',
    gradient: ['#F3E5F5', '#E1BEE7'],
    features: [
      { icon: '🎲', text: 'Randomly generated UUID' },
      { icon: '🔒', text: 'No personal data required' },
      { icon: '📱', text: 'Device fingerprinting for security' }
    ]
  },
  {
    id: 3,
    title: 'Privacy Controls',
    subtitle: 'You control what you share',
    description: 'Choose exactly what information to share with the community. Everything is optional and reversible.',
    icon: '⚙️',
    gradient: ['#E8F5E8', '#C8E6C9'],
    features: [
      { icon: '👤', text: 'Anonymous posting by default' },
      { icon: '📍', text: 'Optional location sharing' },
      { icon: '🔄', text: 'Change settings anytime' }
    ]
  },
  {
    id: 4,
    title: 'Civic Engagement',
    subtitle: 'Participate safely in democracy',
    description: 'Join discussions, share updates, and engage with your community without revealing your identity.',
    icon: '🗳️',
    gradient: ['#FFF3E0', '#FFE0B2'],
    features: [
      { icon: '💬', text: 'Anonymous community discussions' },
      { icon: '📝', text: 'Share civic updates safely' },
      { icon: '🏆', text: 'Earn XP and badges privately' }
    ]
  }
];

const AnonModeOnboarding: React.FC = () => {
  const { completeOnboarding } = useAnonMode();
  const [currentStep, setCurrentStep] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        slideAnim.setValue(width);
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      });
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start(() => {
        setCurrentStep(currentStep - 1);
        slideAnim.setValue(-width);
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      });
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      <LinearGradient
        colors={currentStepData.gradient as [string, string]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} of {onboardingSteps.length}
            </Text>
          </View>
          
          <TouchableOpacity onPress={skipOnboarding} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View 
            style={[
              styles.stepContainer,
              {
                transform: [{ translateX: slideAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            {/* Icon */}
            <Animated.View 
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <Text style={styles.icon}>{currentStepData.icon}</Text>
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>

            {/* Features */}
            <View style={styles.featuresContainer}>
              {currentStepData.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>

            {/* Privacy Notice */}
            {currentStep === 0 && (
              <View style={styles.privacyNotice}>
                <Text style={styles.privacyTitle}>🔒 Privacy First</Text>
                <Text style={styles.privacyText}>
                  Your data stays on your device. Nothing is shared without your explicit consent.
                </Text>
              </View>
            )}

            {/* Security Info */}
            {currentStep === 1 && (
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>🛡️ Security Features</Text>
                <Text style={styles.securityText}>
                  • Cryptographically secure UUID generation{'\n'}
                  • Device fingerprinting for authentication{'\n'}
                  • Local-first data storage{'\n'}
                  • No server-side identity tracking
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          <View style={styles.navigationButtons}>
            {currentStep > 0 && (
              <TouchableOpacity onPress={prevStep} style={styles.prevButton}>
                <Text style={styles.prevButtonText}>← Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity onPress={nextStep} style={styles.nextButton}>
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4'] as const}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next →'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.activeDot
                ]}
              />
            ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  skipButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  privacyNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  securityInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  navigation: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  prevButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  prevButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default AnonModeOnboarding;
