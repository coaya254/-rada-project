import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import apiService from './api';

class NotificationService {
  constructor() {
    this.notificationSettings = null;
    this.isInitialized = false;
    this.setupNotificationHandlers();
  }

  // Initialize notification service
  async initialize() {
    try {
      if (this.isInitialized) return;

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notification permissions not granted');
        return false;
      }

      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
          const data = notification.request.content.data;
          
          return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            priority: data?.priority || 'normal',
          };
        },
      });

      // Load user settings
      await this.loadNotificationSettings();

      // Register for push notifications
      if (Device.isDevice) {
        await this.registerForPushNotifications();
      }

      this.isInitialized = true;
      console.log('✅ Notification service initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
      return false;
    }
  }

  // Setup notification event handlers
  setupNotificationHandlers() {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener(this.handleNotificationReceived.bind(this));
    
    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener(this.handleNotificationTapped.bind(this));
  }

  // Register for push notifications
  async registerForPushNotifications() {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      console.log('📱 Push token:', token.data);
      
      // Save token to backend
      await this.savePushToken(token.data);
      
      return token.data;
    } catch (error) {
      console.error('❌ Error registering for push notifications:', error);
      return null;
    }
  }

  // Save push token to backend
  async savePushToken(token) {
    try {
      // await apiService.savePushToken({ token, platform: Platform.OS });
      console.log('💾 Push token saved to backend');
    } catch (error) {
      console.error('❌ Error saving push token:', error);
    }
  }

  // Load notification settings
  async loadNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem('notification_settings');
      this.notificationSettings = settings ? JSON.parse(settings) : this.getDefaultSettings();
    } catch (error) {
      console.error('❌ Error loading notification settings:', error);
      this.notificationSettings = this.getDefaultSettings();
    }
  }

  // Get default notification settings
  getDefaultSettings() {
    return {
      enabled: true,
      categories: {
        learning: true,
        social: true,
        achievement: true,
        reminder: true,
        system: true,
        marketing: false,
      },
      timing: {
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      frequency: {
        lessonReminders: 'daily',
        socialUpdates: 'immediate',
        achievementAlerts: 'immediate',
      },
      channels: {
        push: true,
        email: false,
        sms: false,
        inApp: true,
      },
    };
  }

  // Save notification settings
  async saveNotificationSettings(settings) {
    try {
      this.notificationSettings = { ...this.notificationSettings, ...settings };
      await AsyncStorage.setItem('notification_settings', JSON.stringify(this.notificationSettings));
      console.log('💾 Notification settings saved');
    } catch (error) {
      console.error('❌ Error saving notification settings:', error);
    }
  }

  // Schedule a notification
  async scheduleNotification(notificationData) {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ Notification service not initialized');
        return false;
      }

      // Check if notifications are enabled for this category
      if (!this.isNotificationEnabled(notificationData.category)) {
        console.log('🔕 Notifications disabled for category:', notificationData.category);
        return false;
      }

      // Check quiet hours
      if (this.isInQuietHours()) {
        console.log('🌙 In quiet hours, scheduling for later');
        return await this.scheduleForLater(notificationData);
      }

      // Create notification content
      const content = {
        title: notificationData.title,
        body: notificationData.message,
        data: notificationData.data,
        sound: notificationData.sound || 'default',
        badge: notificationData.badge,
        priority: this.getPriority(notificationData.priority),
        categoryIdentifier: notificationData.category,
      };

      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger: notificationData.scheduledFor ? 
          { date: new Date(notificationData.scheduledFor) } : 
          null, // Immediate
      });

      console.log('📅 Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      return false;
    }
  }

  // Send immediate notification
  async sendImmediateNotification(notificationData) {
    return await this.scheduleNotification({
      ...notificationData,
      scheduledFor: null,
    });
  }

  // Schedule recurring notification
  async scheduleRecurringNotification(notificationData, recurrencePattern) {
    try {
      const { type, interval, daysOfWeek, dayOfMonth } = recurrencePattern;
      
      let trigger;
      switch (type) {
        case 'daily':
          trigger = { seconds: interval * 24 * 60 * 60 };
          break;
        case 'weekly':
          trigger = { 
            weekday: daysOfWeek[0], 
            hour: 9, 
            minute: 0,
            repeats: true 
          };
          break;
        case 'monthly':
          trigger = { 
            day: dayOfMonth, 
            hour: 9, 
            minute: 0,
            repeats: true 
          };
          break;
        default:
          throw new Error('Invalid recurrence pattern');
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.message,
          data: notificationData.data,
        },
        trigger,
      });

      console.log('🔄 Recurring notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling recurring notification:', error);
      return false;
    }
  }

  // Cancel notification
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('❌ Notification cancelled:', notificationId);
      return true;
    } catch (error) {
      console.error('❌ Error cancelling notification:', error);
      return false;
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('❌ All notifications cancelled');
      return true;
    } catch (error) {
      console.error('❌ Error cancelling all notifications:', error);
      return false;
    }
  }

  // Handle notification received
  handleNotificationReceived(notification) {
    console.log('📨 Notification received:', notification);
    
    // Update local notification count
    this.updateBadgeCount();
    
    // Show in-app notification if enabled
    if (this.notificationSettings?.channels?.inApp) {
      this.showInAppNotification(notification);
    }
  }

  // Handle notification tapped
  handleNotificationTapped(response) {
    console.log('👆 Notification tapped:', response);
    
    const data = response.notification.request.content.data;
    
    // Handle deep linking
    if (data?.actionUrl) {
      this.handleDeepLink(data.actionUrl);
    }
    
    // Mark as read
    this.markNotificationAsRead(data?.id);
  }

  // Handle deep linking
  async handleDeepLink(url) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log('❌ Cannot open URL:', url);
      }
    } catch (error) {
      console.error('❌ Error handling deep link:', error);
    }
  }

  // Show in-app notification
  showInAppNotification(notification) {
    const { title, body, data } = notification.request.content;
    
    Alert.alert(
      title,
      body,
      [
        { text: 'Dismiss', style: 'cancel' },
        { 
          text: 'View', 
          onPress: () => this.handleDeepLink(data?.actionUrl) 
        },
      ]
    );
  }

  // Update badge count
  async updateBadgeCount() {
    try {
      const unreadCount = await this.getUnreadNotificationCount();
      await Notifications.setBadgeCountAsync(unreadCount);
    } catch (error) {
      console.error('❌ Error updating badge count:', error);
    }
  }

  // Get unread notification count
  async getUnreadNotificationCount() {
    try {
      const notifications = await AsyncStorage.getItem('notifications');
      const notificationList = notifications ? JSON.parse(notifications) : [];
      return notificationList.filter(n => !n.isRead).length;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const notifications = await AsyncStorage.getItem('notifications');
      const notificationList = notifications ? JSON.parse(notifications) : [];
      
      const updatedList = notificationList.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedList));
      await this.updateBadgeCount();
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  // Check if notification is enabled for category
  isNotificationEnabled(category) {
    return this.notificationSettings?.enabled && 
           this.notificationSettings?.categories?.[category];
  }

  // Check if in quiet hours
  isInQuietHours() {
    if (!this.notificationSettings?.timing) return false;
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const { quietHoursStart, quietHoursEnd } = this.notificationSettings.timing;
    
    return currentTime >= quietHoursStart || currentTime <= quietHoursEnd;
  }

  // Get priority level
  getPriority(priority) {
    const priorityMap = {
      low: Notifications.AndroidNotificationPriority.LOW,
      normal: Notifications.AndroidNotificationPriority.DEFAULT,
      high: Notifications.AndroidNotificationPriority.HIGH,
      urgent: Notifications.AndroidNotificationPriority.MAX,
    };
    
    return priorityMap[priority] || Notifications.AndroidNotificationPriority.DEFAULT;
  }

  // Schedule for later (after quiet hours)
  async scheduleForLater(notificationData) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
    
    return await this.scheduleNotification({
      ...notificationData,
      scheduledFor: tomorrow.toISOString(),
    });
  }

  // Create notification templates
  createNotificationTemplates() {
    return {
      lessonReminder: {
        title: '📚 Time to Learn!',
        message: 'Your daily lesson is waiting for you',
        category: 'learning',
        priority: 'normal',
      },
      streakReminder: {
        title: '🔥 Keep Your Streak!',
        message: 'Don\'t break your {streak} day learning streak',
        category: 'learning',
        priority: 'high',
      },
      achievementUnlocked: {
        title: '🏆 Achievement Unlocked!',
        message: 'You earned the {badge} badge!',
        category: 'achievement',
        priority: 'high',
      },
      groupInvite: {
        title: '👥 Group Invitation',
        message: '{username} invited you to join {groupName}',
        category: 'social',
        priority: 'normal',
      },
      studySessionReminder: {
        title: '⏰ Study Session Starting',
        message: 'Your study session starts in 15 minutes',
        category: 'reminder',
        priority: 'high',
      },
    };
  }

  // Send notification using template
  async sendTemplateNotification(templateName, variables = {}) {
    const templates = this.createNotificationTemplates();
    const template = templates[templateName];
    
    if (!template) {
      console.error('❌ Template not found:', templateName);
      return false;
    }

    // Replace variables in message
    let message = template.message;
    Object.keys(variables).forEach(key => {
      message = message.replace(`{${key}}`, variables[key]);
    });

    return await this.sendImmediateNotification({
      title: template.title,
      message,
      category: template.category,
      priority: template.priority,
      data: variables,
    });
  }

  // Get notification history
  async getNotificationHistory(limit = 50) {
    try {
      const notifications = await AsyncStorage.getItem('notifications');
      const notificationList = notifications ? JSON.parse(notifications) : [];
      return notificationList.slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting notification history:', error);
      return [];
    }
  }

  // Clear notification history
  async clearNotificationHistory() {
    try {
      await AsyncStorage.removeItem('notifications');
      await Notifications.setBadgeCountAsync(0);
      console.log('🗑️ Notification history cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing notification history:', error);
      return false;
    }
  }
}

export default new NotificationService();

import { Platform, Alert, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import apiService from './api';

class NotificationService {
  constructor() {
    this.notificationSettings = null;
    this.isInitialized = false;
    this.setupNotificationHandlers();
  }

  // Initialize notification service
  async initialize() {
    try {
      if (this.isInitialized) return;

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notification permissions not granted');
        return false;
      }

      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
          const data = notification.request.content.data;
          
          return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            priority: data?.priority || 'normal',
          };
        },
      });

      // Load user settings
      await this.loadNotificationSettings();

      // Register for push notifications
      if (Device.isDevice) {
        await this.registerForPushNotifications();
      }

      this.isInitialized = true;
      console.log('✅ Notification service initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
      return false;
    }
  }

  // Setup notification event handlers
  setupNotificationHandlers() {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener(this.handleNotificationReceived.bind(this));
    
    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener(this.handleNotificationTapped.bind(this));
  }

  // Register for push notifications
  async registerForPushNotifications() {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      console.log('📱 Push token:', token.data);
      
      // Save token to backend
      await this.savePushToken(token.data);
      
      return token.data;
    } catch (error) {
      console.error('❌ Error registering for push notifications:', error);
      return null;
    }
  }

  // Save push token to backend
  async savePushToken(token) {
    try {
      // await apiService.savePushToken({ token, platform: Platform.OS });
      console.log('💾 Push token saved to backend');
    } catch (error) {
      console.error('❌ Error saving push token:', error);
    }
  }

  // Load notification settings
  async loadNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem('notification_settings');
      this.notificationSettings = settings ? JSON.parse(settings) : this.getDefaultSettings();
    } catch (error) {
      console.error('❌ Error loading notification settings:', error);
      this.notificationSettings = this.getDefaultSettings();
    }
  }

  // Get default notification settings
  getDefaultSettings() {
    return {
      enabled: true,
      categories: {
        learning: true,
        social: true,
        achievement: true,
        reminder: true,
        system: true,
        marketing: false,
      },
      timing: {
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      frequency: {
        lessonReminders: 'daily',
        socialUpdates: 'immediate',
        achievementAlerts: 'immediate',
      },
      channels: {
        push: true,
        email: false,
        sms: false,
        inApp: true,
      },
    };
  }

  // Save notification settings
  async saveNotificationSettings(settings) {
    try {
      this.notificationSettings = { ...this.notificationSettings, ...settings };
      await AsyncStorage.setItem('notification_settings', JSON.stringify(this.notificationSettings));
      console.log('💾 Notification settings saved');
    } catch (error) {
      console.error('❌ Error saving notification settings:', error);
    }
  }

  // Schedule a notification
  async scheduleNotification(notificationData) {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ Notification service not initialized');
        return false;
      }

      // Check if notifications are enabled for this category
      if (!this.isNotificationEnabled(notificationData.category)) {
        console.log('🔕 Notifications disabled for category:', notificationData.category);
        return false;
      }

      // Check quiet hours
      if (this.isInQuietHours()) {
        console.log('🌙 In quiet hours, scheduling for later');
        return await this.scheduleForLater(notificationData);
      }

      // Create notification content
      const content = {
        title: notificationData.title,
        body: notificationData.message,
        data: notificationData.data,
        sound: notificationData.sound || 'default',
        badge: notificationData.badge,
        priority: this.getPriority(notificationData.priority),
        categoryIdentifier: notificationData.category,
      };

      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger: notificationData.scheduledFor ? 
          { date: new Date(notificationData.scheduledFor) } : 
          null, // Immediate
      });

      console.log('📅 Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      return false;
    }
  }

  // Send immediate notification
  async sendImmediateNotification(notificationData) {
    return await this.scheduleNotification({
      ...notificationData,
      scheduledFor: null,
    });
  }

  // Schedule recurring notification
  async scheduleRecurringNotification(notificationData, recurrencePattern) {
    try {
      const { type, interval, daysOfWeek, dayOfMonth } = recurrencePattern;
      
      let trigger;
      switch (type) {
        case 'daily':
          trigger = { seconds: interval * 24 * 60 * 60 };
          break;
        case 'weekly':
          trigger = { 
            weekday: daysOfWeek[0], 
            hour: 9, 
            minute: 0,
            repeats: true 
          };
          break;
        case 'monthly':
          trigger = { 
            day: dayOfMonth, 
            hour: 9, 
            minute: 0,
            repeats: true 
          };
          break;
        default:
          throw new Error('Invalid recurrence pattern');
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.message,
          data: notificationData.data,
        },
        trigger,
      });

      console.log('🔄 Recurring notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling recurring notification:', error);
      return false;
    }
  }

  // Cancel notification
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('❌ Notification cancelled:', notificationId);
      return true;
    } catch (error) {
      console.error('❌ Error cancelling notification:', error);
      return false;
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('❌ All notifications cancelled');
      return true;
    } catch (error) {
      console.error('❌ Error cancelling all notifications:', error);
      return false;
    }
  }

  // Handle notification received
  handleNotificationReceived(notification) {
    console.log('📨 Notification received:', notification);
    
    // Update local notification count
    this.updateBadgeCount();
    
    // Show in-app notification if enabled
    if (this.notificationSettings?.channels?.inApp) {
      this.showInAppNotification(notification);
    }
  }

  // Handle notification tapped
  handleNotificationTapped(response) {
    console.log('👆 Notification tapped:', response);
    
    const data = response.notification.request.content.data;
    
    // Handle deep linking
    if (data?.actionUrl) {
      this.handleDeepLink(data.actionUrl);
    }
    
    // Mark as read
    this.markNotificationAsRead(data?.id);
  }

  // Handle deep linking
  async handleDeepLink(url) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log('❌ Cannot open URL:', url);
      }
    } catch (error) {
      console.error('❌ Error handling deep link:', error);
    }
  }

  // Show in-app notification
  showInAppNotification(notification) {
    const { title, body, data } = notification.request.content;
    
    Alert.alert(
      title,
      body,
      [
        { text: 'Dismiss', style: 'cancel' },
        { 
          text: 'View', 
          onPress: () => this.handleDeepLink(data?.actionUrl) 
        },
      ]
    );
  }

  // Update badge count
  async updateBadgeCount() {
    try {
      const unreadCount = await this.getUnreadNotificationCount();
      await Notifications.setBadgeCountAsync(unreadCount);
    } catch (error) {
      console.error('❌ Error updating badge count:', error);
    }
  }

  // Get unread notification count
  async getUnreadNotificationCount() {
    try {
      const notifications = await AsyncStorage.getItem('notifications');
      const notificationList = notifications ? JSON.parse(notifications) : [];
      return notificationList.filter(n => !n.isRead).length;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const notifications = await AsyncStorage.getItem('notifications');
      const notificationList = notifications ? JSON.parse(notifications) : [];
      
      const updatedList = notificationList.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedList));
      await this.updateBadgeCount();
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  // Check if notification is enabled for category
  isNotificationEnabled(category) {
    return this.notificationSettings?.enabled && 
           this.notificationSettings?.categories?.[category];
  }

  // Check if in quiet hours
  isInQuietHours() {
    if (!this.notificationSettings?.timing) return false;
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const { quietHoursStart, quietHoursEnd } = this.notificationSettings.timing;
    
    return currentTime >= quietHoursStart || currentTime <= quietHoursEnd;
  }

  // Get priority level
  getPriority(priority) {
    const priorityMap = {
      low: Notifications.AndroidNotificationPriority.LOW,
      normal: Notifications.AndroidNotificationPriority.DEFAULT,
      high: Notifications.AndroidNotificationPriority.HIGH,
      urgent: Notifications.AndroidNotificationPriority.MAX,
    };
    
    return priorityMap[priority] || Notifications.AndroidNotificationPriority.DEFAULT;
  }

  // Schedule for later (after quiet hours)
  async scheduleForLater(notificationData) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
    
    return await this.scheduleNotification({
      ...notificationData,
      scheduledFor: tomorrow.toISOString(),
    });
  }

  // Create notification templates
  createNotificationTemplates() {
    return {
      lessonReminder: {
        title: '📚 Time to Learn!',
        message: 'Your daily lesson is waiting for you',
        category: 'learning',
        priority: 'normal',
      },
      streakReminder: {
        title: '🔥 Keep Your Streak!',
        message: 'Don\'t break your {streak} day learning streak',
        category: 'learning',
        priority: 'high',
      },
      achievementUnlocked: {
        title: '🏆 Achievement Unlocked!',
        message: 'You earned the {badge} badge!',
        category: 'achievement',
        priority: 'high',
      },
      groupInvite: {
        title: '👥 Group Invitation',
        message: '{username} invited you to join {groupName}',
        category: 'social',
        priority: 'normal',
      },
      studySessionReminder: {
        title: '⏰ Study Session Starting',
        message: 'Your study session starts in 15 minutes',
        category: 'reminder',
        priority: 'high',
      },
    };
  }

  // Send notification using template
  async sendTemplateNotification(templateName, variables = {}) {
    const templates = this.createNotificationTemplates();
    const template = templates[templateName];
    
    if (!template) {
      console.error('❌ Template not found:', templateName);
      return false;
    }

    // Replace variables in message
    let message = template.message;
    Object.keys(variables).forEach(key => {
      message = message.replace(`{${key}}`, variables[key]);
    });

    return await this.sendImmediateNotification({
      title: template.title,
      message,
      category: template.category,
      priority: template.priority,
      data: variables,
    });
  }

  // Get notification history
  async getNotificationHistory(limit = 50) {
    try {
      const notifications = await AsyncStorage.getItem('notifications');
      const notificationList = notifications ? JSON.parse(notifications) : [];
      return notificationList.slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting notification history:', error);
      return [];
    }
  }

  // Clear notification history
  async clearNotificationHistory() {
    try {
      await AsyncStorage.removeItem('notifications');
      await Notifications.setBadgeCountAsync(0);
      console.log('🗑️ Notification history cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing notification history:', error);
      return false;
    }
  }
}

export default new NotificationService();
