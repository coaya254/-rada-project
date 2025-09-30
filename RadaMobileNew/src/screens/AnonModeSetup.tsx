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
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAnonMode } from '../contexts/AnonModeContext';

const { width, height } = Dimensions.get('window');

interface SetupStep {
  id: number;
  title: string;
  subtitle: string;
  type: 'intro' | 'profile' | 'privacy' | 'complete';
  gradient: string[];
}

const setupSteps: SetupStep[] = [
  {
    id: 1,
    title: 'Create Your Profile',
    subtitle: 'Set up your anonymous identity',
    type: 'intro',
    gradient: ['#E3F2FD', '#BBDEFB']
  },
  {
    id: 2,
    title: 'Profile Details',
    subtitle: 'Customize your anonymous profile',
    type: 'profile',
    gradient: ['#F3E5F5', '#E1BEE7']
  },
  {
    id: 3,
    title: 'Privacy Settings',
    subtitle: 'Choose what you want to share',
    type: 'privacy',
    gradient: ['#E8F5E8', '#C8E6C9']
  },
  {
    id: 4,
    title: 'Setup Complete!',
    subtitle: 'Your anonymous profile is ready',
    type: 'complete',
    gradient: ['#FFF3E0', '#FFE0B2']
  }
];

const popularEmojis = [
  '😊', '🤔', '🎭', '🦊', '🐱', '🦁', '🐯', '🐨', '🐼', '🐸',
  '🦋', '🌸', '🌺', '🌻', '🌹', '🌷', '🍀', '⭐', '🌟', '💫',
  '🎪', '🎯', '🎲', '🎮', '🎨', '🎵', '🎸', '🎺', '🎻', '🎹'
];

const counties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
  'Kitale', 'Garissa', 'Kakamega', 'Nyeri', 'Meru', 'Machakos', 'Kitui',
  'Embu', 'Isiolo', 'Marsabit', 'Lamu', 'Tana River', 'Kilifi', 'Kwale',
  'Taita Taveta', 'Makueni', 'Kajiado', 'Narok', 'Bomet', 'Kericho',
  'Nandi', 'Uasin Gishu', 'Trans Nzoia', 'West Pokot', 'Samburu',
  'Turkana', 'Wajir', 'Mandera', 'Baringo', 'Laikipia', 'Nakuru',
  'Nyandarua', 'Murang\'a', 'Kiambu', 'Kirinyaga', 'Nyamira',
  'Kisii', 'Migori', 'Homa Bay', 'Siaya', 'Busia', 'Vihiga',
  'Bungoma', 'Elgeyo Marakwet'
];


const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was your mother's maiden name?",
  "What was the name of your first school?",
  "What was your childhood nickname?",
  "What is your favorite movie?",
  "What was the make of your first car?",
  "What is your favorite food?",
];

const AnonModeSetup: React.FC = () => {
  const { updateProfile, completeSetup } = useAnonMode();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState('😊');
  const [nickname, setNickname] = useState('');
  const [county, setCounty] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [privacySettings, setPrivacySettings] = useState({
    showLocation: false,
    allowDataCollection: false,
    anonymousPosting: true,
  });
  const [slideAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));

  const nextStep = async () => {
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
      // Validate required fields
      if (!password || !confirmPassword || !securityQuestion || !securityAnswer) {
        Alert.alert('Missing Information', 'Please fill in all required fields (password, security question, and answer).');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
        return;
      }

      if (password.length < 8) {
        Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
        return;
      }

      // Save profile data and complete setup
      const profileData = {
        nickname: nickname || 'Anonymous',
        emoji: selectedEmoji,
        county: county || 'Nairobi',
        password: password,
        securityQuestion: securityQuestion,
        securityAnswer: securityAnswer,
        privacySettings: privacySettings,
      };
      
      try {
        await updateProfile(profileData);
        await completeSetup();
      } catch (error) {
        console.error('❌ Setup failed:', error);
        Alert.alert('Setup Failed', 'There was an error completing your setup. Please try again.');
      }
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



  const currentStepData = setupSteps[currentStep];

  const renderIntroStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🔒</Text>
            </View>
      <Text style={styles.title}>Create Your Anonymous Profile</Text>
      <Text style={styles.subtitle}>
        Set up your anonymous identity to participate safely in the community.
      </Text>
      
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🛡️</Text>
          <Text style={styles.featureText}>Your identity is protected</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎭</Text>
          <Text style={styles.featureText}>Choose your anonymous persona</Text>
              </View>
              <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>⚙️</Text>
          <Text style={styles.featureText}>Control your privacy settings</Text>
              </View>
            </View>
          </View>
        );

  const renderProfileStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Profile Details</Text>
      <Text style={styles.subtitle}>Customize your anonymous profile</Text>

      {/* Emoji Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Avatar</Text>
              <View style={styles.emojiGrid}>
                {popularEmojis.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                styles.emojiItem,
                selectedEmoji === emoji && styles.selectedEmojiItem
                    ]}
              onPress={() => setSelectedEmoji(emoji)}
                  >
              <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
          </View>

      {/* Nickname */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nickname (Optional)</Text>
              <TextInput
          style={styles.input}
                value={nickname}
                onChangeText={setNickname}
          placeholder="Enter a nickname"
                placeholderTextColor="#999"
                maxLength={20}
              />
        <Text style={styles.inputHint}>
          Leave empty to stay completely anonymous
        </Text>
            </View>

      {/* County */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>County (Optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countyScroll}>
          {counties.map((countyName, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.countyItem,
                county === countyName && styles.selectedCountyItem
              ]}
              onPress={() => setCounty(countyName)}
            >
              <Text style={[
                styles.countyText,
                county === countyName && styles.selectedCountyText
              ]}>
                {countyName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
          </View>


      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio (Optional)</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself..."
          placeholderTextColor="#999"
          multiline
          maxLength={100}
        />
        <Text style={styles.inputHint}>
          {bio.length}/100 characters
        </Text>
      </View>

      {/* Password */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Password *</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Create a strong password"
          placeholderTextColor="#999"
          secureTextEntry
          maxLength={50}
        />
        <Text style={styles.inputHint}>
          Must be at least 8 characters with uppercase, lowercase, numbers, and special characters
        </Text>
      </View>

      {/* Confirm Password */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Confirm Password *</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          placeholderTextColor="#999"
          secureTextEntry
          maxLength={50}
        />
        {password && confirmPassword && password !== confirmPassword && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}
      </View>

      {/* Security Question */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Question *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.questionScroll}>
          {SECURITY_QUESTIONS.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.questionItem,
                securityQuestion === question && styles.selectedQuestionItem
              ]}
              onPress={() => setSecurityQuestion(question)}
            >
              <Text style={[
                styles.questionText,
                securityQuestion === question && styles.selectedQuestionText
              ]}>
                {question}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Security Answer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Answer *</Text>
        <TextInput
          style={styles.input}
          value={securityAnswer}
          onChangeText={setSecurityAnswer}
          placeholder="Your answer to the security question"
          placeholderTextColor="#999"
          maxLength={100}
        />
        <Text style={styles.inputHint}>
          This will be used to reset your password if forgotten
        </Text>
      </View>
    </ScrollView>
  );

  const renderPrivacyStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Privacy Settings</Text>
      <Text style={styles.subtitle}>Choose what you want to share</Text>

      <View style={styles.privacyContainer}>
        <View style={styles.privacyItem}>
          <View style={styles.privacyInfo}>
            <Text style={styles.privacyTitle}>👤 Anonymous Posting</Text>
            <Text style={styles.privacyDescription}>
              Post content without revealing your identity
            </Text>
            </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              privacySettings.anonymousPosting && styles.toggleActive
            ]}
            onPress={() => setPrivacySettings(prev => ({
              ...prev,
              anonymousPosting: !prev.anonymousPosting
            }))}
          >
            <View style={[
              styles.toggleThumb,
              privacySettings.anonymousPosting && styles.toggleThumbActive
            ]} />
          </TouchableOpacity>
        </View>

        <View style={styles.privacyItem}>
          <View style={styles.privacyInfo}>
            <Text style={styles.privacyTitle}>📍 Show Location</Text>
            <Text style={styles.privacyDescription}>
              Allow your county to be visible to others
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              privacySettings.showLocation && styles.toggleActive
            ]}
            onPress={() => setPrivacySettings(prev => ({
              ...prev,
              showLocation: !prev.showLocation
            }))}
          >
            <View style={[
              styles.toggleThumb,
              privacySettings.showLocation && styles.toggleThumbActive
            ]} />
          </TouchableOpacity>
        </View>


        <View style={styles.privacyItem}>
          <View style={styles.privacyInfo}>
            <Text style={styles.privacyTitle}>📊 Data Collection</Text>
            <Text style={styles.privacyDescription}>
              Allow anonymous usage data to improve the app
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              privacySettings.allowDataCollection && styles.toggleActive
            ]}
            onPress={() => setPrivacySettings(prev => ({
              ...prev,
              allowDataCollection: !prev.allowDataCollection
            }))}
          >
            <View style={[
              styles.toggleThumb,
              privacySettings.allowDataCollection && styles.toggleThumbActive
            ]} />
          </TouchableOpacity>
            </View>
            </View>

      <View style={styles.privacyNotice}>
        <Text style={styles.privacyNoticeTitle}>🔒 Privacy Notice</Text>
        <Text style={styles.privacyNoticeText}>
          All your data is stored locally on your device first. You can change these settings anytime in your profile.
            </Text>
      </View>
    </ScrollView>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🎉</Text>
      </View>
      <Text style={styles.title}>Setup Complete!</Text>
      <Text style={styles.subtitle}>
        Your anonymous profile is ready. Welcome to the community!
      </Text>

            <View style={styles.profilePreview}>
        <View style={styles.previewAvatar}>
          <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
            </View>
        <Text style={styles.previewName}>
          {nickname || 'Anonymous User'}
            </Text>
        {county && (
          <Text style={styles.previewLocation}>📍 {county}</Text>
        )}
        {bio && (
          <Text style={styles.previewBio}>{bio}</Text>
        )}
      </View>

      <View style={styles.completionFeatures}>
        <View style={styles.completionFeature}>
          <Text style={styles.completionIcon}>🛡️</Text>
          <Text style={styles.completionText}>Your privacy is protected</Text>
        </View>
        <View style={styles.completionFeature}>
          <Text style={styles.completionIcon}>🎭</Text>
          <Text style={styles.completionText}>Anonymous identity created</Text>
        </View>
        <View style={styles.completionFeature}>
          <Text style={styles.completionIcon}>⚙️</Text>
          <Text style={styles.completionText}>Privacy settings configured</Text>
        </View>
      </View>
          </View>
        );

  const renderStepContent = () => {
    switch (currentStepData.type) {
      case 'intro':
        return renderIntroStep();
      case 'profile':
        return renderProfileStep();
      case 'privacy':
        return renderPrivacyStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return null;
    }
  };

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
                  { width: `${((currentStep + 1) / setupSteps.length) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} of {setupSteps.length}
            </Text>
          </View>
        </View>

        {/* Content */}
          <Animated.View 
            style={[
              styles.content,
              {
                transform: [{ translateX: slideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
            {renderStepContent()}
          </Animated.View>

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
                  {currentStep === setupSteps.length - 1 ? 'Complete Setup' : 'Next →'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {setupSteps.map((_, index) => (
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    flex: 1,
    paddingVertical: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 30,
  },
  featuresContainer: {
    marginTop: 20,
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiItem: {
    width: (width - 80) / 6,
    height: (width - 80) / 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedEmojiItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ scale: 1.1 }],
  },
  emojiText: {
    fontSize: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
  },
  countyScroll: {
    marginBottom: 10,
  },
  countyItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCountyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  countyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCountyText: {
    fontWeight: '600',
  },
  privacyContainer: {
    marginTop: 20,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  privacyInfo: {
    flex: 1,
    marginRight: 15,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  privacyNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  privacyNoticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  privacyNoticeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
  },
  profilePreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  previewAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  previewEmoji: {
    fontSize: 40,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  previewLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  previewBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  completionFeatures: {
    marginTop: 20,
  },
  completionFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  completionIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  completionText: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
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
  questionScroll: {
    marginTop: 8,
  },
  questionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedQuestionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  questionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  selectedQuestionText: {
    color: 'white',
    fontWeight: '600',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
  },
});

export default AnonModeSetup;
