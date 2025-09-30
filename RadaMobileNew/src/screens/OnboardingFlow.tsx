import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../contexts/UserContext';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  gradient: readonly [string, string];
  features: Array<{
    icon: string;
    text: string;
  }>;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Your Civic Hub',
    subtitle: 'Join Kenya\'s youth movement for civic education and democratic participation.',
    icon: '👥',
    gradient: ['#80DEEA', '#4DD0E1'],
    features: [
      { icon: '✅', text: 'Document community updates & development' },
      { icon: '✅', text: 'Access verified support services' },
      { icon: '✅', text: 'Participate in civic assignments' }
    ]
  },
  {
    id: 2,
    title: 'Civic Memory Archive',
    subtitle: 'Honor Kenya\'s civic journey and document our democratic progress.',
    icon: '📚',
    gradient: ['#FF9E80', '#FF7043'],
    features: [
      { icon: '🏛️', text: 'Honour Wall: Remember those who fought for justice' },
      { icon: '📄', text: 'Protest Archive: Documented movements that shaped Kenya' },
      { icon: '📊', text: 'Development Tracker: Monitor public projects' }
    ]
  },
  {
    id: 3,
    title: 'Youth Hub',
    subtitle: 'Connect, create, and access support within Kenya\'s youth community.',
    icon: '🤝',
    gradient: ['#A5D6A7', '#81C784'],
    features: [
      { icon: '👥', text: 'Youth Group Directory & Assignment Center' },
      { icon: '🆘', text: 'Help & Referral Hub with verified services' },
      { icon: '🎙️', text: 'Media & Storytelling: Share your civic journey' }
    ]
  },
  {
    id: 4,
    title: 'Civic Education',
    subtitle: 'Learn about governance and earn XP through interactive civic challenges.',
    icon: '🎓',
    gradient: ['#FFD54F', '#FFB300'],
    features: [
      { icon: '🎮', text: 'Gamified quizzes on rights and government' },
      { icon: '🛡️', text: 'Civic Content Safety: Flag misinformation' },
      { icon: '📈', text: 'Track your progress with Civic XP' }
    ]
  }
];

const OnboardingFlow: React.FC = () => {
  const { completeOnboarding } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={currentStepData.gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Status Bar */}
        <View style={styles.statusBar}>
          <Text style={styles.statusTime}>9:41</Text>
          <View style={styles.statusIcons}>
            <Text style={styles.statusIcon}>📶</Text>
            <Text style={styles.statusIcon}>📶</Text>
            <Text style={styles.statusIcon}>🔋</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                transform: [{ translateX: slideAnim }],
                opacity: fadeAnim
              }
            ]}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{currentStepData.icon}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{currentStepData.title}</Text>
            
            {/* Subtitle */}
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>

            {/* Features */}
            <View style={styles.featuresContainer}>
              {currentStepData.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDots}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <View style={styles.buttonRow}>
            {currentStep > 0 ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={prevStep}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.secondaryButton} onPress={skipOnboarding}>
                <Text style={styles.secondaryButtonText}>Skip</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.primaryButton} onPress={nextStep}>
              <Text style={styles.primaryButtonText}>
                {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Home Indicator */}
        <View style={styles.homeIndicator} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  statusTime: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  statusIcon: {
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  featureIcon: {
    fontSize: 18,
    marginRight: 12,
    marginTop: 2,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 10,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  progressDotActive: {
    backgroundColor: '#333',
    transform: [{ scale: 1.2 }],
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 8,
  },
  primaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  homeIndicator: {
    width: 100,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
});

export default OnboardingFlow;
