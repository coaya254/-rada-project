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
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../contexts/UserContext';

const { width, height } = Dimensions.get('window');

interface SetupStep {
  id: number;
  title: string;
  subtitle: string;
  type: 'intro' | 'emoji' | 'nickname' | 'complete';
  gradient: string[];
}

const setupSteps: SetupStep[] = [
  {
    id: 1,
    title: 'Anonymous Mode',
    subtitle: 'Set up your anonymous profile to participate safely in the community.',
    type: 'intro',
    gradient: ['#E1F5FE', '#B3E5FC']
  },
  {
    id: 2,
    title: 'Choose Your Emoji',
    subtitle: 'Pick an emoji that represents your anonymous identity.',
    type: 'emoji',
    gradient: ['#FFF3E0', '#FFE0B2']
  },
  {
    id: 3,
    title: 'Your Nickname',
    subtitle: 'Create a nickname for your anonymous profile.',
    type: 'nickname',
    gradient: ['#F3E5F5', '#E1BEE7']
  },
  {
    id: 4,
    title: 'Setup Complete!',
    subtitle: 'Your anonymous profile is ready. Welcome to the community!',
    type: 'complete',
    gradient: ['#E8F5E8', '#C8E6C9']
  }
];

const popularEmojis = [
  '😊', '🤔', '🎭', '🦊', '🐱', '🦁', '🐯', '🐨', '🐼', '🐸',
  '🦋', '🌸', '🌺', '🌻', '🌹', '🌷', '🍀', '⭐', '🌟', '💫',
  '🔥', '💧', '⚡', '🌈', '🎨', '🎭', '🎪', '🎯', '🎲', '🎮'
];

const AnonModeSetup: React.FC = () => {
  const { completeAnonModeSetup } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [nickname, setNickname] = useState('');
  const [slideAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));

  const nextStep = () => {
    if (currentStep < setupSteps.length - 1) {
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
      completeAnonModeSetup(selectedEmoji, nickname);
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

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Intro step
      case 1: return selectedEmoji !== ''; // Emoji step
      case 2: return nickname.trim() !== ''; // Nickname step
      case 3: return true; // Complete step
      default: return false;
    }
  };

  const currentStepData = setupSteps[currentStep];

  const renderStepContent = () => {
    switch (currentStepData.type) {
      case 'intro':
        return (
          <View style={styles.introContent}>
            <View style={styles.anonIconContainer}>
              <Text style={styles.anonIcon}>🕵️</Text>
            </View>
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔒</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Privacy First</Text>
                  <Text style={styles.featureText}>Your identity stays protected</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎭</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Express Freely</Text>
                  <Text style={styles.featureText}>Share thoughts without fear</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🤝</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Community Safe</Text>
                  <Text style={styles.featureText}>Respectful anonymous interactions</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'emoji':
        return (
          <View style={styles.emojiContent}>
            <View style={styles.selectedEmojiContainer}>
              <Animated.View style={[styles.selectedEmoji, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.selectedEmojiText}>
                  {selectedEmoji || '😊'}
                </Text>
              </Animated.View>
            </View>
            <Text style={styles.emojiGridTitle}>Choose your emoji:</Text>
            <ScrollView 
              style={styles.emojiGridContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.emojiGrid}>
                {popularEmojis.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.emojiCard,
                      selectedEmoji === emoji && styles.emojiCardSelected
                    ]}
                    onPress={() => handleEmojiSelect(emoji)}
                  >
                    <Text style={styles.emojiCardText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        );

      case 'nickname':
        return (
          <View style={styles.nicknameContent}>
            <View style={styles.nicknamePreview}>
              <Text style={styles.nicknamePreviewEmoji}>{selectedEmoji}</Text>
              <Text style={styles.nicknamePreviewText}>
                {nickname || 'Your Nickname'}
              </Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter your nickname:</Text>
              <TextInput
                style={styles.textInput}
                value={nickname}
                onChangeText={setNickname}
                placeholder="e.g., CivicHero, ChangeMaker"
                placeholderTextColor="#999"
                maxLength={20}
                autoFocus
              />
            </View>
          </View>
        );

      case 'complete':
        return (
          <View style={styles.completeContent}>
            <View style={styles.completeIconContainer}>
              <Text style={styles.completeIcon}>🎉</Text>
            </View>
            <View style={styles.profilePreview}>
              <Text style={styles.profileEmoji}>{selectedEmoji}</Text>
              <Text style={styles.profileName}>{nickname}</Text>
            </View>
            <Text style={styles.completeMessage}>
              You're all set! Your anonymous profile is ready to explore the community.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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

        {/* Back Button */}
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}

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
            {/* Title */}
            <Text style={styles.title}>{currentStepData.title}</Text>
            
            {/* Subtitle */}
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>

            {/* Step Content */}
            {renderStepContent()}
          </Animated.View>
        </ScrollView>

        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDots}>
            {setupSteps.map((_, index) => (
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

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[
              styles.primaryButton,
              !canProceed() && styles.primaryButtonDisabled
            ]} 
            onPress={nextStep}
            disabled={!canProceed()}
          >
            <Text style={[
              styles.primaryButtonText,
              !canProceed() && styles.primaryButtonTextDisabled
            ]}>
              {currentStep === setupSteps.length - 1 ? 'Complete Setup' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Home Indicator */}
        <View style={styles.homeIndicator} />
      </LinearGradient>
    </KeyboardAvoidingView>
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  // Intro Step Styles
  introContent: {
    alignItems: 'center',
    width: '100%',
  },
  anonIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  anonIcon: {
    fontSize: 50,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  // Emoji Step Styles
  emojiContent: {
    alignItems: 'center',
    width: '100%',
  },
  selectedEmojiContainer: {
    marginBottom: 20,
  },
  selectedEmoji: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  selectedEmojiText: {
    fontSize: 40,
  },
  emojiGridTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  emojiGridContainer: {
    maxHeight: 300,
    width: '100%',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  emojiCard: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiCardSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  emojiCardText: {
    fontSize: 24,
  },
  // Nickname Step Styles
  nicknameContent: {
    alignItems: 'center',
    width: '100%',
  },
  nicknamePreview: {
    alignItems: 'center',
    marginBottom: 30,
  },
  nicknamePreviewEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  nicknamePreviewText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  // Complete Step Styles
  completeContent: {
    alignItems: 'center',
    width: '100%',
  },
  completeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  completeIcon: {
    fontSize: 50,
  },
  profilePreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  completeMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  // Common Styles
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
  primaryButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: 'rgba(255, 215, 0, 0.5)',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButtonTextDisabled: {
    color: '#999',
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

export default AnonModeSetup;
