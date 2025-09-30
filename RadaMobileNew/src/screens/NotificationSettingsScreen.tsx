import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import notificationService from '../services/notificationService';
import { NotificationSettings } from '../types/NotificationTypes';

const NotificationSettingsScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      await notificationService.initialize();
      const userSettings = await notificationService.loadNotificationSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updatedSettings: Partial<NotificationSettings>) => {
    try {
      setSaving(true);
      const newSettings = { ...settings, ...updatedSettings };
      await notificationService.saveNotificationSettings(newSettings);
      setSettings(newSettings);
      Alert.alert('Success', 'Notification settings saved!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category: keyof NotificationSettings['categories']) => {
    if (!settings) return;
    
    const updatedCategories = {
      ...settings.categories,
      [category]: !settings.categories[category],
    };
    
    saveSettings({ categories: updatedCategories });
  };

  const toggleChannel = (channel: keyof NotificationSettings['channels']) => {
    if (!settings) return;
    
    const updatedChannels = {
      ...settings.channels,
      [channel]: !settings.channels[channel],
    };
    
    saveSettings({ channels: updatedChannels });
  };

  const updateFrequency = (type: keyof NotificationSettings['frequency'], value: string) => {
    if (!settings) return;
    
    const updatedFrequency = {
      ...settings.frequency,
      [type]: value,
    };
    
    saveSettings({ frequency: updatedFrequency });
  };

  const testNotification = async () => {
    try {
      await notificationService.sendTemplateNotification('lessonReminder', {
        streak: '5',
        username: user?.username || 'User',
      });
      Alert.alert('Test Sent', 'Check your notification panel!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const renderCategorySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notification Categories</Text>
      <Text style={styles.sectionDescription}>
        Choose which types of notifications you want to receive
      </Text>
      
      {settings && Object.entries(settings.categories).map(([category, enabled]) => (
        <View key={category} style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            <Text style={styles.settingDescription}>
              {getCategoryDescription(category as keyof NotificationSettings['categories'])}
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={() => toggleCategory(category as keyof NotificationSettings['categories'])}
            trackColor={{ false: '#e2e8f0', true: '#667eea' }}
            thumbColor={enabled ? '#ffffff' : '#f4f4f4'}
          />
        </View>
      ))}
    </View>
  );

  const renderChannelSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notification Channels</Text>
      <Text style={styles.sectionDescription}>
        Choose how you want to receive notifications
      </Text>
      
      {settings && Object.entries(settings.channels).map(([channel, enabled]) => (
        <View key={channel} style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>
              {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </Text>
            <Text style={styles.settingDescription}>
              {getChannelDescription(channel as keyof NotificationSettings['channels'])}
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={() => toggleChannel(channel as keyof NotificationSettings['channels'])}
            trackColor={{ false: '#e2e8f0', true: '#667eea' }}
            thumbColor={enabled ? '#ffffff' : '#f4f4f4'}
          />
        </View>
      ))}
    </View>
  );

  const renderFrequencySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notification Frequency</Text>
      <Text style={styles.sectionDescription}>
        Control how often you receive different types of notifications
      </Text>
      
      {settings && Object.entries(settings.frequency).map(([type, value]) => (
        <View key={type} style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>
              {getFrequencyLabel(type as keyof NotificationSettings['frequency'])}
            </Text>
            <Text style={styles.settingDescription}>
              {getFrequencyDescription(type as keyof NotificationSettings['frequency'])}
            </Text>
          </View>
          <View style={styles.frequencyButtons}>
            {getFrequencyOptions(type as keyof NotificationSettings['frequency']).map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyButton,
                  value === option.value && styles.frequencyButtonActive,
                ]}
                onPress={() => updateFrequency(type as keyof NotificationSettings['frequency'], option.value)}
              >
                <Text
                  style={[
                    styles.frequencyButtonText,
                    value === option.value && styles.frequencyButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderQuietHoursSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quiet Hours</Text>
      <Text style={styles.sectionDescription}>
        Set times when you don't want to receive notifications
      </Text>
      
      <View style={styles.quietHoursContainer}>
        <View style={styles.quietHoursRow}>
          <Text style={styles.quietHoursLabel}>Start Time</Text>
          <Text style={styles.quietHoursValue}>{settings?.timing.quietHoursStart}</Text>
        </View>
        <View style={styles.quietHoursRow}>
          <Text style={styles.quietHoursLabel}>End Time</Text>
          <Text style={styles.quietHoursValue}>{settings?.timing.quietHoursEnd}</Text>
        </View>
        <Text style={styles.quietHoursNote}>
          Quiet hours are automatically respected for all notifications
        </Text>
      </View>
    </View>
  );

  const getCategoryDescription = (category: keyof NotificationSettings['categories']) => {
    const descriptions = {
      learning: 'Lesson reminders, quiz notifications, and learning updates',
      social: 'Group invites, buddy requests, and social interactions',
      achievement: 'Badge unlocks, streak milestones, and accomplishments',
      reminder: 'Study session reminders and goal notifications',
      system: 'App updates, maintenance notices, and system alerts',
      marketing: 'Promotional content and special offers',
    };
    return descriptions[category];
  };

  const getChannelDescription = (channel: keyof NotificationSettings['channels']) => {
    const descriptions = {
      push: 'Push notifications on your device',
      email: 'Email notifications to your registered email',
      sms: 'Text message notifications',
      inApp: 'In-app notification banners and alerts',
    };
    return descriptions[channel];
  };

  const getFrequencyLabel = (type: keyof NotificationSettings['frequency']) => {
    const labels = {
      lessonReminders: 'Lesson Reminders',
      socialUpdates: 'Social Updates',
      achievementAlerts: 'Achievement Alerts',
    };
    return labels[type];
  };

  const getFrequencyDescription = (type: keyof NotificationSettings['frequency']) => {
    const descriptions = {
      lessonReminders: 'How often to remind you about lessons',
      socialUpdates: 'How often to notify about social activities',
      achievementAlerts: 'How often to alert about achievements',
    };
    return descriptions[type];
  };

  const getFrequencyOptions = (type: keyof NotificationSettings['frequency']) => {
    const options = {
      lessonReminders: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Never', value: 'never' },
      ],
      socialUpdates: [
        { label: 'Immediate', value: 'immediate' },
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Never', value: 'never' },
      ],
      achievementAlerts: [
        { label: 'Immediate', value: 'immediate' },
        { label: 'Daily', value: 'daily' },
        { label: 'Never', value: 'never' },
      ],
    };
    return options[type];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading notification settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <TouchableOpacity onPress={testNotification} style={styles.testButton}>
          <Icon name="bell" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Master Switch */}
        <View style={styles.section}>
          <View style={styles.masterSwitchContainer}>
            <View style={styles.masterSwitchInfo}>
              <Text style={styles.masterSwitchTitle}>Enable Notifications</Text>
              <Text style={styles.masterSwitchDescription}>
                Turn all notifications on or off
              </Text>
            </View>
            <Switch
              value={settings?.enabled || false}
              onValueChange={(enabled) => saveSettings({ enabled })}
              trackColor={{ false: '#e2e8f0', true: '#667eea' }}
              thumbColor={settings?.enabled ? '#ffffff' : '#f4f4f4'}
            />
          </View>
        </View>

        {settings?.enabled && (
          <>
            {renderCategorySection()}
            {renderChannelSection()}
            {renderFrequencySection()}
            {renderQuietHoursSection()}
          </>
        )}

        {/* Test Notification */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.testButton, styles.testButtonContainer]}
            onPress={testNotification}
            disabled={saving}
          >
            <Icon name="bell" size={16} color="#667eea" />
            <Text style={styles.testButtonText}>
              {saving ? 'Sending...' : 'Send Test Notification'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Clear History */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.clearButton, styles.clearButtonContainer]}
            onPress={() => {
              Alert.alert(
                'Clear Notification History',
                'This will clear all your notification history. Are you sure?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                      await notificationService.clearNotificationHistory();
                      Alert.alert('Success', 'Notification history cleared');
                    },
                  },
                ]
              );
            }}
          >
            <Icon name="trash" size={16} color="#ef4444" />
            <Text style={styles.clearButtonText}>Clear Notification History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  testButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  masterSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  masterSwitchInfo: {
    flex: 1,
  },
  masterSwitchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  masterSwitchDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  frequencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  frequencyButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  frequencyButtonText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  frequencyButtonTextActive: {
    color: 'white',
  },
  quietHoursContainer: {
    marginTop: 8,
  },
  quietHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  quietHoursLabel: {
    fontSize: 16,
    color: '#1e293b',
  },
  quietHoursValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  quietHoursNote: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    fontStyle: 'italic',
  },
  testButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  testButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  clearButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
});

export default NotificationSettingsScreen;

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAnonMode } from '../contexts/AnonModeContext';
import notificationService from '../services/notificationService';
import { NotificationSettings } from '../types/NotificationTypes';

const NotificationSettingsScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAnonMode();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      await notificationService.initialize();
      const userSettings = await notificationService.loadNotificationSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updatedSettings: Partial<NotificationSettings>) => {
    try {
      setSaving(true);
      const newSettings = { ...settings, ...updatedSettings };
      await notificationService.saveNotificationSettings(newSettings);
      setSettings(newSettings);
      Alert.alert('Success', 'Notification settings saved!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category: keyof NotificationSettings['categories']) => {
    if (!settings) return;
    
    const updatedCategories = {
      ...settings.categories,
      [category]: !settings.categories[category],
    };
    
    saveSettings({ categories: updatedCategories });
  };

  const toggleChannel = (channel: keyof NotificationSettings['channels']) => {
    if (!settings) return;
    
    const updatedChannels = {
      ...settings.channels,
      [channel]: !settings.channels[channel],
    };
    
    saveSettings({ channels: updatedChannels });
  };

  const updateFrequency = (type: keyof NotificationSettings['frequency'], value: string) => {
    if (!settings) return;
    
    const updatedFrequency = {
      ...settings.frequency,
      [type]: value,
    };
    
    saveSettings({ frequency: updatedFrequency });
  };

  const testNotification = async () => {
    try {
      await notificationService.sendTemplateNotification('lessonReminder', {
        streak: '5',
        username: user?.username || 'User',
      });
      Alert.alert('Test Sent', 'Check your notification panel!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const renderCategorySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notification Categories</Text>
      <Text style={styles.sectionDescription}>
        Choose which types of notifications you want to receive
      </Text>
      
      {settings && Object.entries(settings.categories).map(([category, enabled]) => (
        <View key={category} style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            <Text style={styles.settingDescription}>
              {getCategoryDescription(category as keyof NotificationSettings['categories'])}
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={() => toggleCategory(category as keyof NotificationSettings['categories'])}
            trackColor={{ false: '#e2e8f0', true: '#667eea' }}
            thumbColor={enabled ? '#ffffff' : '#f4f4f4'}
          />
        </View>
      ))}
    </View>
  );

  const renderChannelSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notification Channels</Text>
      <Text style={styles.sectionDescription}>
        Choose how you want to receive notifications
      </Text>
      
      {settings && Object.entries(settings.channels).map(([channel, enabled]) => (
        <View key={channel} style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>
              {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </Text>
            <Text style={styles.settingDescription}>
              {getChannelDescription(channel as keyof NotificationSettings['channels'])}
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={() => toggleChannel(channel as keyof NotificationSettings['channels'])}
            trackColor={{ false: '#e2e8f0', true: '#667eea' }}
            thumbColor={enabled ? '#ffffff' : '#f4f4f4'}
          />
        </View>
      ))}
    </View>
  );

  const renderFrequencySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notification Frequency</Text>
      <Text style={styles.sectionDescription}>
        Control how often you receive different types of notifications
      </Text>
      
      {settings && Object.entries(settings.frequency).map(([type, value]) => (
        <View key={type} style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>
              {getFrequencyLabel(type as keyof NotificationSettings['frequency'])}
            </Text>
            <Text style={styles.settingDescription}>
              {getFrequencyDescription(type as keyof NotificationSettings['frequency'])}
            </Text>
          </View>
          <View style={styles.frequencyButtons}>
            {getFrequencyOptions(type as keyof NotificationSettings['frequency']).map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyButton,
                  value === option.value && styles.frequencyButtonActive,
                ]}
                onPress={() => updateFrequency(type as keyof NotificationSettings['frequency'], option.value)}
              >
                <Text
                  style={[
                    styles.frequencyButtonText,
                    value === option.value && styles.frequencyButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderQuietHoursSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quiet Hours</Text>
      <Text style={styles.sectionDescription}>
        Set times when you don't want to receive notifications
      </Text>
      
      <View style={styles.quietHoursContainer}>
        <View style={styles.quietHoursRow}>
          <Text style={styles.quietHoursLabel}>Start Time</Text>
          <Text style={styles.quietHoursValue}>{settings?.timing.quietHoursStart}</Text>
        </View>
        <View style={styles.quietHoursRow}>
          <Text style={styles.quietHoursLabel}>End Time</Text>
          <Text style={styles.quietHoursValue}>{settings?.timing.quietHoursEnd}</Text>
        </View>
        <Text style={styles.quietHoursNote}>
          Quiet hours are automatically respected for all notifications
        </Text>
      </View>
    </View>
  );

  const getCategoryDescription = (category: keyof NotificationSettings['categories']) => {
    const descriptions = {
      learning: 'Lesson reminders, quiz notifications, and learning updates',
      social: 'Group invites, buddy requests, and social interactions',
      achievement: 'Badge unlocks, streak milestones, and accomplishments',
      reminder: 'Study session reminders and goal notifications',
      system: 'App updates, maintenance notices, and system alerts',
      marketing: 'Promotional content and special offers',
    };
    return descriptions[category];
  };

  const getChannelDescription = (channel: keyof NotificationSettings['channels']) => {
    const descriptions = {
      push: 'Push notifications on your device',
      email: 'Email notifications to your registered email',
      sms: 'Text message notifications',
      inApp: 'In-app notification banners and alerts',
    };
    return descriptions[channel];
  };

  const getFrequencyLabel = (type: keyof NotificationSettings['frequency']) => {
    const labels = {
      lessonReminders: 'Lesson Reminders',
      socialUpdates: 'Social Updates',
      achievementAlerts: 'Achievement Alerts',
    };
    return labels[type];
  };

  const getFrequencyDescription = (type: keyof NotificationSettings['frequency']) => {
    const descriptions = {
      lessonReminders: 'How often to remind you about lessons',
      socialUpdates: 'How often to notify about social activities',
      achievementAlerts: 'How often to alert about achievements',
    };
    return descriptions[type];
  };

  const getFrequencyOptions = (type: keyof NotificationSettings['frequency']) => {
    const options = {
      lessonReminders: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Never', value: 'never' },
      ],
      socialUpdates: [
        { label: 'Immediate', value: 'immediate' },
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Never', value: 'never' },
      ],
      achievementAlerts: [
        { label: 'Immediate', value: 'immediate' },
        { label: 'Daily', value: 'daily' },
        { label: 'Never', value: 'never' },
      ],
    };
    return options[type];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading notification settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <TouchableOpacity onPress={testNotification} style={styles.testButton}>
          <Icon name="bell" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Master Switch */}
        <View style={styles.section}>
          <View style={styles.masterSwitchContainer}>
            <View style={styles.masterSwitchInfo}>
              <Text style={styles.masterSwitchTitle}>Enable Notifications</Text>
              <Text style={styles.masterSwitchDescription}>
                Turn all notifications on or off
              </Text>
            </View>
            <Switch
              value={settings?.enabled || false}
              onValueChange={(enabled) => saveSettings({ enabled })}
              trackColor={{ false: '#e2e8f0', true: '#667eea' }}
              thumbColor={settings?.enabled ? '#ffffff' : '#f4f4f4'}
            />
          </View>
        </View>

        {settings?.enabled && (
          <>
            {renderCategorySection()}
            {renderChannelSection()}
            {renderFrequencySection()}
            {renderQuietHoursSection()}
          </>
        )}

        {/* Test Notification */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.testButton, styles.testButtonContainer]}
            onPress={testNotification}
            disabled={saving}
          >
            <Icon name="bell" size={16} color="#667eea" />
            <Text style={styles.testButtonText}>
              {saving ? 'Sending...' : 'Send Test Notification'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Clear History */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.clearButton, styles.clearButtonContainer]}
            onPress={() => {
              Alert.alert(
                'Clear Notification History',
                'This will clear all your notification history. Are you sure?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                      await notificationService.clearNotificationHistory();
                      Alert.alert('Success', 'Notification history cleared');
                    },
                  },
                ]
              );
            }}
          >
            <Icon name="trash" size={16} color="#ef4444" />
            <Text style={styles.clearButtonText}>Clear Notification History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  testButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  masterSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  masterSwitchInfo: {
    flex: 1,
  },
  masterSwitchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  masterSwitchDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  frequencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  frequencyButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  frequencyButtonText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  frequencyButtonTextActive: {
    color: 'white',
  },
  quietHoursContainer: {
    marginTop: 8,
  },
  quietHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  quietHoursLabel: {
    fontSize: 16,
    color: '#1e293b',
  },
  quietHoursValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  quietHoursNote: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    fontStyle: 'italic',
  },
  testButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  testButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  clearButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
});

export default NotificationSettingsScreen;
