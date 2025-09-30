import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAnonMode } from '../contexts/AnonModeContext';

const { width } = Dimensions.get('window');

interface PrivacyControlsModalProps {
  visible: boolean;
  onClose: () => void;
}

const PrivacyControlsModal: React.FC<PrivacyControlsModalProps> = ({
  visible,
  onClose,
}) => {
  const { user, updatePrivacySettings, getPrivacySettings } = useAnonMode();
  const [privacySettings, setPrivacySettings] = useState({
    showLocation: false,
    showAgeGroup: false,
    allowDataCollection: false,
    anonymousPosting: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user) {
      setPrivacySettings(user.privacySettings);
    }
  }, [visible, user]);

  const handleSettingToggle = async (setting: keyof typeof privacySettings) => {
    try {
      setLoading(true);
      const newSettings = {
        ...privacySettings,
        [setting]: !privacySettings[setting],
      };
      
      setPrivacySettings(newSettings);
      await updatePrivacySettings({ [setting]: newSettings[setting] });
      
      console.log(`🔒 Privacy setting updated: ${setting} = ${newSettings[setting]}`);
    } catch (error) {
      console.error('❌ Failed to update privacy setting:', error);
      Alert.alert('Error', 'Failed to update privacy setting. Please try again.');
      // Revert the change
      setPrivacySettings(prev => ({ ...prev, [setting]: !prev[setting] }));
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      'Reset Privacy Settings',
      'Are you sure you want to reset all privacy settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const defaultSettings = {
                showLocation: false,
                showAgeGroup: false,
                allowDataCollection: false,
                anonymousPosting: true,
              };
              
              setPrivacySettings(defaultSettings);
              await updatePrivacySettings(defaultSettings);
              
              Alert.alert('Success', 'Privacy settings have been reset to defaults.');
            } catch (error) {
              console.error('❌ Failed to reset privacy settings:', error);
              Alert.alert('Error', 'Failed to reset privacy settings. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const PrivacySettingItem = ({ 
    title, 
    description, 
    setting, 
    icon 
  }: { 
    title: string; 
    description: string; 
    setting: keyof typeof privacySettings; 
    icon: string; 
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <View style={styles.settingHeader}>
          <Text style={styles.settingIcon}>{icon}</Text>
          <Text style={styles.settingTitle}>{title}</Text>
        </View>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={privacySettings[setting]}
        onValueChange={() => handleSettingToggle(setting)}
        disabled={loading}
        trackColor={{ false: '#e0e0e0', true: '#FF6B6B' }}
        thumbColor={privacySettings[setting] ? '#ffffff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#FF6B6B', '#4ECDC4']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>🔒 Privacy Controls</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* AnonMode™ Status */}
            <View style={styles.statusSection}>
              <View style={styles.statusCard}>
                <Text style={styles.statusIcon}>🛡️</Text>
                <View style={styles.statusInfo}>
                  <Text style={styles.statusTitle}>AnonMode™ Active</Text>
                  <Text style={styles.statusDescription}>
                    Your privacy is protected with local-first data storage and anonymous identity.
                  </Text>
                </View>
              </View>
            </View>

            {/* Privacy Settings */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Privacy Settings</Text>
              
              <PrivacySettingItem
                title="Anonymous Posting"
                description="Post content without revealing your identity. Recommended for maximum privacy."
                setting="anonymousPosting"
                icon="👤"
              />
              
              <PrivacySettingItem
                title="Show Location"
                description="Allow your county to be visible to other users in your profile."
                setting="showLocation"
                icon="📍"
              />
              
              <PrivacySettingItem
                title="Show Age Group"
                description="Allow your age group to be visible to other users in your profile."
                setting="showAgeGroup"
                icon="🎂"
              />
              
              <PrivacySettingItem
                title="Data Collection"
                description="Allow anonymous usage data to help improve the app experience."
                setting="allowDataCollection"
                icon="📊"
              />
            </View>

            {/* Data Information */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Your Data</Text>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoIcon}>💾</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Local-First Storage</Text>
                  <Text style={styles.infoDescription}>
                    All your data is stored locally on your device first. Nothing is shared without your explicit consent.
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoIcon}>🔐</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Encrypted Identity</Text>
                  <Text style={styles.infoDescription}>
                    Your UUID is cryptographically generated and cannot be traced back to your real identity.
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoIcon}>🔄</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Full Control</Text>
                  <Text style={styles.infoDescription}>
                    You can change these settings anytime or clear all your data completely.
                  </Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetToDefaults}
                disabled={loading}
              >
                <Text style={styles.resetButtonText}>🔄 Reset to Defaults</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🔒 AnonMode™ - Your privacy, your control
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  header: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusSection: {
    marginBottom: 25,
  },
  statusCard: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 12,
    color: '#2e7d32',
    lineHeight: 16,
  },
  settingsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  infoSection: {
    marginBottom: 25,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 12,
    color: '#1976d2',
    lineHeight: 16,
  },
  actionsSection: {
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default PrivacyControlsModal;
