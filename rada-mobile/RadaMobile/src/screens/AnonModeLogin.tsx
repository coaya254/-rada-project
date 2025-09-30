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
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAnonMode } from '../contexts/AnonModeContext';
import AnonModeService from '../services/AnonModeService';
import ForgotPasswordScreen from './ForgotPasswordScreen';
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

const AnonModeLogin: React.FC = () => {
  const { loginWithUUID } = useAnonMode();
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [createdAccountDetails, setCreatedAccountDetails] = useState<{username: string, uuid: string} | null>(null);
  const [usernameStatus, setUsernameStatus] = useState({ available: null, message: '' });
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!loginUsername.trim()) {
      Alert.alert('Oops! 😅', 'Please enter your username!');
      return;
    }
    if (!loginPassword.trim()) {
      Alert.alert('Oops! 😅', 'Please enter your password!');
      return;
    }

    console.log('🔒 AnonMode™ Login: Attempting login with:', { 
      username: loginUsername.trim(), 
      hasPassword: !!loginPassword.trim(),
      rememberMe: rememberMe
    });

    // Debug: Show current user data
    const anonModeService = AnonModeService.getInstance();
    await anonModeService.debugCurrentUser();

    setIsLoading(true);
    try {
      // Login with username and password
      await loginWithUUID(loginUsername.trim(), loginPassword.trim(), rememberMe);
      console.log('🔒 AnonMode™: User logged in successfully');
    } catch (error) {
      console.error('❌ Login failed:', error);
      Alert.alert(
        'Login Failed', 
        'Invalid username or password. Please check your credentials!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewAccount = () => {
    setIsCreatingAccount(true);
  };

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username.trim() || username.trim().length < 3) {
      setUsernameStatus({ available: null, message: '' });
      return;
    }

    setIsCheckingUsername(true);
    try {
      const response = await apiService.checkUsername(username);
      setUsernameStatus({
        available: response.available,
        message: response.message
      });
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameStatus({ available: false, message: 'Error checking username' });
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleCreateAccountSubmit = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Oops! 😅', 'Please enter a username!');
      return;
    }
    if (newUsername.trim().length < 3) {
      Alert.alert('Username too short! 😅', 'Username must be at least 3 characters long!');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Oops! 😅', 'Please enter a password!');
      return;
    }
    if (passwordStrength.strength === 'Weak') {
      Alert.alert('Password too weak! 🔒', 'Please choose a stronger password for better security!');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords don\'t match! 😅', 'Please make sure both passwords are the same!');
      return;
    }
    if (!securityQuestion.trim()) {
      Alert.alert('Security Question Required! 🔒', 'Please select a security question for password recovery!');
      return;
    }
    if (!securityAnswer.trim()) {
      Alert.alert('Security Answer Required! 🔒', 'Please provide an answer to your security question!');
      return;
    }

    setIsLoading(true);
    try {
      // Create account with user's chosen username, password, and security questions
      const anonModeService = AnonModeService.getInstance();
      const newUser = await anonModeService.createNewUser(
        newUsername.trim(), 
        newPassword.trim(),
        securityQuestion.trim(),
        securityAnswer.trim()
      );
      
      // Set the user in context using the username (not UUID)
      await loginWithUUID(newUser.nickname, newPassword.trim());
      console.log('🔒 AnonMode™: New account created successfully');
      
      // Get login details and show success modal
      const loginDetails = await anonModeService.getUserLoginDetails();
      
      if (loginDetails) {
        setCreatedAccountDetails(loginDetails);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('❌ Account creation failed:', error);
      Alert.alert(
        'Account Creation Failed', 
        'Couldn\'t create your account. Please try again!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCreateAccount = () => {
    setIsCreatingAccount(false);
    setNewUsername('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let score = 0;
    let feedback = [];
    
    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Lowercase letter');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Uppercase letter');
    
    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Number');
    
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Special character');
    
    if (score <= 2) return { strength: 'Weak', color: '#FF5252', feedback };
    if (score <= 3) return { strength: 'Fair', color: '#FF9800', feedback };
    if (score <= 4) return { strength: 'Good', color: '#4CAF50', feedback };
    return { strength: 'Strong', color: '#2E7D32', feedback: [] };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleQRCodeLogin = () => {
    Alert.alert(
      'QR Code Login',
      'Scan a QR code from another device to migrate your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Scan QR Code', 
          onPress: () => {
            // This would open QR scanner
            console.log('🔒 AnonMode™: Opening QR scanner');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#E3F2FD', '#BBDEFB', '#90CAF9']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>👋</Text>
              <Text style={styles.title}>Welcome to Rada</Text>
              <Text style={styles.subtitle}>Your anonymous civic space</Text>
            </View>

            {/* Primary Action - Create Account */}
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleCreateNewAccount}
            >
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4']}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Create Account</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Account Creation Form */}
            {isCreatingAccount && (
              <Animated.View style={[styles.createAccountForm, { opacity: fadeAnim }]}>
                <Text style={styles.createAccountTitle}>Create Your Account</Text>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.createInput,
                      usernameStatus.available === true && styles.inputSuccess,
                      usernameStatus.available === false && styles.inputError
                    ]}
                    value={newUsername}
                    onChangeText={(text) => {
                      setNewUsername(text);
                      // Debounce username checking
                      const timeoutId = setTimeout(() => {
                        checkUsernameAvailability(text);
                      }, 500);
                      return () => clearTimeout(timeoutId);
                    }}
                    placeholder="Choose a username"
                    placeholderTextColor="#90CAF9"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {/* Username Status */}
                  {usernameStatus.message && (
                    <View style={styles.usernameStatusContainer}>
                      {isCheckingUsername && (
                        <Text style={styles.checkingText}>Checking...</Text>
                      )}
                      <Text style={[
                        styles.usernameStatusText,
                        usernameStatus.available === true && styles.usernameStatusSuccess,
                        usernameStatus.available === false && styles.usernameStatusError
                      ]}>
                        {usernameStatus.message}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.createInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Create a password"
                    placeholderTextColor="#90CAF9"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {newPassword.length > 0 && (
                    <View style={styles.passwordStrengthContainer}>
                      <View style={styles.passwordStrengthBar}>
                        <View 
                          style={[
                            styles.passwordStrengthFill, 
                            { 
                              width: `${(passwordStrength.strength === 'Weak' ? 25 : passwordStrength.strength === 'Fair' ? 50 : passwordStrength.strength === 'Good' ? 75 : 100)}%`,
                              backgroundColor: passwordStrength.color 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                        {passwordStrength.strength}
                      </Text>
                    </View>
                  )}
                  {passwordStrength.feedback.length > 0 && (
                    <View style={styles.passwordFeedback}>
                      {passwordStrength.feedback.map((item, index) => (
                        <Text key={index} style={styles.passwordFeedbackText}>
                          • {item}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.createInput,
                      confirmPassword.length > 0 && newPassword !== confirmPassword && styles.createInputError
                    ]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm password"
                    placeholderTextColor="#90CAF9"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <Text style={styles.errorText}>Passwords don't match</Text>
                  )}
                  {confirmPassword.length > 0 && newPassword === confirmPassword && (
                    <Text style={styles.successText}>✓ Passwords match</Text>
                  )}
                </View>

                {/* Security Question */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Security Question *</Text>
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
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Security Answer *</Text>
                  <TextInput
                    style={styles.createInput}
                    value={securityAnswer}
                    onChangeText={setSecurityAnswer}
                    placeholder="Your answer to the security question"
                    placeholderTextColor="#90CAF9"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={styles.inputHint}>
                    This will be used to reset your password if forgotten
                  </Text>
                </View>
                
                <View style={styles.createAccountButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelCreateAccount}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.createButton, isLoading && styles.createButtonDisabled]}
                    onPress={handleCreateAccountSubmit}
                    disabled={isLoading}
                  >
                    <Text style={styles.createButtonText}>
                      {isLoading ? 'Creating...' : 'Create Account'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

                        {/* Secondary Action - Sign In */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInTitle}>Already have an account?</Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.loginInput}
                  value={loginUsername}
                  onChangeText={setLoginUsername}
                  placeholder="Username"
                  placeholderTextColor="#90CAF9"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.loginInput}
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  placeholder="Password"
                  placeholderTextColor="#90CAF9"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Remember Me Toggle */}
              <View style={styles.rememberMeContainer}>
                <TouchableOpacity 
                  style={styles.rememberMeToggle}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.toggleCircle, rememberMe && styles.toggleCircleActive]}>
                    {rememberMe && <View style={styles.toggleDot} />}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.signInButtonText}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => {
                  // Navigate to forgot password screen
                  console.log('🔒 Forgot Password clicked!');
                  setShowForgotPassword(true);
                  console.log('🔒 showForgotPassword set to true');
                }}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* QR Code Option */}
            <TouchableOpacity 
              style={styles.qrButton}
              onPress={handleQRCodeLogin}
            >
              <Text style={styles.qrButtonIcon}>📱</Text>
              <Text style={styles.qrButtonText}>Scan QR Code</Text>
            </TouchableOpacity>

            {/* Privacy Notice */}
            <View style={styles.privacyNotice}>
              <Text style={styles.privacyIcon}>🛡️</Text>
              <Text style={styles.privacyText}>
                We keep it real - no personal stuff, just your anonymous vibes ✨
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Success Modal */}
        {showSuccessModal && createdAccountDetails && (
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.successModal, { opacity: fadeAnim }]}>
              <View style={styles.successHeader}>
                <Text style={styles.successIcon}>🎉</Text>
                <Text style={styles.successTitle}>Account Created!</Text>
                <Text style={styles.successSubtitle}>Welcome to Rada</Text>
              </View>
              
              <View style={styles.accountDetailsContainer}>
                <Text style={styles.accountDetailsTitle}>Your Login Details:</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Username:</Text>
                  <Text style={styles.detailValue}>{createdAccountDetails.username}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>UUID:</Text>
                  <Text style={styles.detailValue}>{createdAccountDetails.uuid.substring(0, 8)}...</Text>
                </View>
                
                <View style={styles.securityNote}>
                  <Text style={styles.securityIcon}>🔒</Text>
                  <Text style={styles.securityText}>
                    Save these details! You'll need them to log back in.
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.successButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  setIsCreatingAccount(false);
                  setNewUsername('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setCreatedAccountDetails(null);
                }}
              >
                <LinearGradient
                  colors={['#4CAF50', '#2E7D32']}
                  style={styles.successButtonGradient}
                >
                  <Text style={styles.successButtonText}>Let's Go! 🚀</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {/* Forgot Password Screen */}
        {showForgotPassword && (
          <View style={styles.modalOverlay}>
            <ForgotPasswordScreen 
              onClose={() => {
                console.log('🔒 Closing Forgot Password screen');
                setShowForgotPassword(false);
              }}
            />
          </View>
        )}
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
  content: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#1976D2',
    fontWeight: '500',
  },
  primaryButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  signInContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
    textAlign: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  loginInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  signInButton: {
    backgroundColor: '#1565C0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createAccountForm: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createAccountTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1565C0',
    textAlign: 'center',
    marginBottom: 20,
  },
  createInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  createAccountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordStrengthContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
  },
  passwordFeedback: {
    marginTop: 4,
  },
  passwordFeedbackText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  createInputError: {
    borderColor: '#FF5252',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1565C0',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  accountDetailsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  accountDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#1565C0',
    flex: 1,
    lineHeight: 16,
  },
  successButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  successButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1565C0',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  privacyIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  rememberMeContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  rememberMeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#90CAF9',
    backgroundColor: 'transparent',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleCircleActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  questionScroll: {
    marginTop: 8,
  },
  questionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedQuestionItem: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  questionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedQuestionText: {
    color: 'white',
    fontWeight: '600',
  },
  debugText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
  },
  // Username status styles
  usernameStatusContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkingText: {
    color: '#90CAF9',
    fontSize: 12,
    marginRight: 8,
  },
  usernameStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  usernameStatusSuccess: {
    color: '#4CAF50',
  },
  usernameStatusError: {
    color: '#F44336',
  },
  inputSuccess: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
});

export default AnonModeLogin;
