import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';

interface SettingsScreenProps {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'action' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    pushNotifications: true,
    emailUpdates: false,
    darkMode: false,
    dataSync: true,
    analytics: false,
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          id: 'editProfile',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          icon: 'edit',
          type: 'navigation',
          onPress: () => navigation.navigate('EditProfile', {
            currentProfile: {
              name: 'John Doe',
              email: 'john.doe@email.com',
              bio: 'Engaged citizen interested in local politics',
              location: 'New York, NY'
            }
          }),
        },
        {
          id: 'achievements',
          title: 'Achievements',
          subtitle: 'View your badges and progress',
          icon: 'emoji-events',
          type: 'navigation',
          onPress: () => navigation.navigate('Achievements'),
        },
        {
          id: 'privacy',
          title: 'Privacy & Security',
          subtitle: 'Manage your privacy settings',
          icon: 'security',
          type: 'action',
          onPress: () => Alert.alert('Privacy Settings', 'Privacy settings would be implemented here'),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive notifications on your device',
          icon: 'notifications',
          type: 'toggle',
          value: settings.pushNotifications,
          onToggle: (value) => updateSetting('pushNotifications', value),
        },
        {
          id: 'emailUpdates',
          title: 'Email Updates',
          subtitle: 'Get important updates via email',
          icon: 'email',
          type: 'toggle',
          value: settings.emailUpdates,
          onToggle: (value) => updateSetting('emailUpdates', value),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Use dark theme throughout the app',
          icon: 'dark-mode',
          type: 'toggle',
          value: settings.darkMode,
          onToggle: (value) => updateSetting('darkMode', value),
        },
        {
          id: 'dataSync',
          title: 'Data Sync',
          subtitle: 'Sync your data across devices',
          icon: 'sync',
          type: 'toggle',
          value: settings.dataSync,
          onToggle: (value) => updateSetting('dataSync', value),
        },
        {
          id: 'analytics',
          title: 'Usage Analytics',
          subtitle: 'Help improve the app with usage data',
          icon: 'analytics',
          type: 'toggle',
          value: settings.analytics,
          onToggle: (value) => updateSetting('analytics', value),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          icon: 'help',
          type: 'action',
          onPress: () => Alert.alert('Help & Support', 'Support resources would be available here'),
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Share your thoughts with us',
          icon: 'feedback',
          type: 'action',
          onPress: () => Alert.alert('Feedback', 'Feedback form would be implemented here'),
        },
        {
          id: 'about',
          title: 'About',
          subtitle: 'App version and information',
          icon: 'info',
          type: 'action',
          onPress: () => Alert.alert('About', 'RadaApp v1.0.0\nBuilt with React Native'),
        },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        {
          id: 'logout',
          title: 'Sign Out',
          subtitle: 'Sign out of your account',
          icon: 'logout',
          type: 'action',
          onPress: () => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive' },
          ]),
        },
        {
          id: 'delete',
          title: 'Delete Account',
          subtitle: 'Permanently delete your account',
          icon: 'delete-forever',
          type: 'action',
          onPress: () => Alert.alert('Delete Account', 'This action cannot be undone. Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive' },
          ]),
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          <MaterialIcons name={item.icon as any} size={24} color="#3B82F6" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        <View style={styles.settingAction}>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#e9ecef', true: '#3B82F6' }}
              thumbColor={item.value ? '#FFFFFF' : '#f4f3f4'}
            />
          ) : (
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginHorizontal: 24,
  },
  sectionContent: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingAction: {
    marginLeft: 12,
  },
});