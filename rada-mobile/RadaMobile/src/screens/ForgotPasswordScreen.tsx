import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAnonMode } from '../contexts/AnonModeContext';
import apiService from '../services/api';

const { width, height } = Dimensions.get('window');

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

interface ForgotPasswordScreenProps {
  onClose?: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onClose }) => {
  const { clearAllData } = useAnonMode();
  const [step, setStep] = useState(1); // 1: username, 2: security question, 3: new password
  const [username, setUsername] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUsernameSubmit = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }

    setIsLoading(true);
    try {
      // Check if username exists and get their security question
      const response = await apiService.post('/api/users/security-question', {
        username: username.trim()
      });

      if (response && response.securityQuestion) {
        setSelectedQuestion(response.securityQuestion || SECURITY_QUESTIONS[0]);
        setStep(2);
      } else {
        Alert.alert('Error', 'Username not found');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      // Check if it's a specific error about no security question
      if (error.response?.data?.error?.includes('No security question set')) {
        Alert.alert(
          'No Security Question Set',
          'This account does not have a security question set up. Please contact support or try logging in with your current password.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onClose) {
                  onClose();
                } else {
                  clearAllData();
                }
              }
            }
          ]
        );
      } else if (error.response?.data?.error?.includes('not found')) {
        Alert.alert('Error', 'Username not found');
      } else if (error.response?.status === 400) {
        // Handle any 400 error (including no security question)
        Alert.alert(
          'Account Issue',
          'This account cannot use password reset. Please contact support or try logging in with your current password.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onClose) {
                  onClose();
                } else {
                  clearAllData();
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to verify username. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityAnswerSubmit = async () => {
    if (!securityAnswer.trim()) {
      Alert.alert('Error', 'Please answer the security question');
      return;
    }

    setIsLoading(true);
    try {
      // Verify the security answer
      const response = await apiService.post('/api/users/verify-security-answer', {
        username: username.trim(), 
        securityAnswer: securityAnswer.trim()
      });

      if (response && response.message) {
        setStep(3);
      } else {
        Alert.alert('Error', 'Incorrect answer. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying security answer:', error);
      Alert.alert('Error', 'Failed to verify answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Reset the password via backend
      const response = await apiService.post('/api/users/reset-password', {
        username: username.trim(),
        securityAnswer: securityAnswer.trim(),
        newPassword: newPassword.trim()
      });

      if (response && response.message) {
        Alert.alert(
          'Success! 🎉',
          'Your password has been reset successfully. Please log in with your new password.',
          [
            {
              text: 'OK',
              onPress: () => {
                clearAllData();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Reset Password</Text>
      <Text style={styles.stepDescription}>
        Enter your username to begin the password reset process
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor="#90CAF9"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleUsernameSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Checking...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Security Question</Text>
      <Text style={styles.stepDescription}>
        Please answer your security question to verify your identity
      </Text>
      
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{selectedQuestion}</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={securityAnswer}
          onChangeText={setSecurityAnswer}
          placeholder="Your answer"
          placeholderTextColor="#90CAF9"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSecurityAnswerSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Verifying...' : 'Verify Answer'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>New Password</Text>
      <Text style={styles.stepDescription}>
        Create a new password for your account
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New Password"
          placeholderTextColor="#90CAF9"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          placeholderTextColor="#90CAF9"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handlePasswordReset}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  console.log('🔒 ForgotPasswordScreen rendering!');
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1976D2', '#42A5F5', '#90CAF9']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>🔐 Password Recovery</Text>
              {onClose && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.subtitle}>We'll help you get back into your account</Text>
          </View>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              console.log('🔒 Back to Login clicked');
              if (onClose) {
                onClose();
              } else {
                clearAllData();
              }
            }}
          >
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  stepContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1976D2',
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.2)',
  },
  questionContainer: {
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.2)',
  },
  questionText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
