// services/notification.service.ts

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface ScheduleOptions {
  title: string;
  body: string;
  data?: any;
  trigger?: Notifications.NotificationTriggerInput | null;
}

class NotificationService {
  private STORAGE_KEY = 'notification_settings';

  // Request permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // For Android, set up notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3B82F6',
        });
      }
      
      console.log('Notification permissions granted');
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Get push token
  async getPushToken(): Promise<string | null> {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Schedule a notification
  async scheduleNotification(options: ScheduleOptions): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: options.title,
          body: options.body,
          data: options.data || {},
          sound: true,
        },
        trigger: options.trigger || null,
      });

      console.log('Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Daily learning reminder
  async scheduleDailyReminder(hour: number = 9, minute: number = 0): Promise<string | null> {
    return this.scheduleNotification({
      title: "📚 Daily Learning Reminder",
      body: "Time to continue your learning journey! You have lessons waiting.",
      data: { type: 'daily_reminder' },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  }

  // Module completion notification
  async notifyModuleComplete(moduleName: string, xpEarned: number): Promise<void> {
    await this.scheduleNotification({
      title: "🎉 Module Completed!",
      body: `Congratulations! You completed "${moduleName}" and earned ${xpEarned} XP!`,
      data: { type: 'module_complete', moduleName, xpEarned },
      trigger: null, // Show immediately
    });
  }

  // Lesson completion notification
  async notifyLessonComplete(lessonName: string, xpEarned: number): Promise<void> {
    await this.scheduleNotification({
      title: "✅ Lesson Completed!",
      body: `Great job! You completed "${lessonName}" (+${xpEarned} XP)`,
      data: { type: 'lesson_complete', lessonName, xpEarned },
      trigger: null,
    });
  }

  // Quiz passed notification
  async notifyQuizPassed(quizName: string, score: number, xpEarned: number): Promise<void> {
    await this.scheduleNotification({
      title: "🏆 Quiz Passed!",
      body: `Excellent! You scored ${score}% on "${quizName}" and earned ${xpEarned} XP!`,
      data: { type: 'quiz_passed', quizName, score, xpEarned },
      trigger: null,
    });
  }

  // Streak milestone notification
  async notifyStreakMilestone(streak: number): Promise<void> {
    await this.scheduleNotification({
      title: "🔥 Streak Milestone!",
      body: `Amazing! You've maintained a ${streak}-day learning streak! Keep it up!`,
      data: { type: 'streak_milestone', streak },
      trigger: null,
    });
  }

  // Level up notification
  async notifyLevelUp(newLevel: number): Promise<void> {
    await this.scheduleNotification({
      title: "⬆️ Level Up!",
      body: `Congratulations! You've reached Level ${newLevel}! 🎊`,
      data: { type: 'level_up', level: newLevel },
      trigger: null,
    });
  }

  // Achievement unlocked notification
  async notifyAchievementUnlocked(achievementName: string, achievementIcon: string): Promise<void> {
    await this.scheduleNotification({
      title: "🏅 Achievement Unlocked!",
      body: `You earned "${achievementName}"! ${achievementIcon}`,
      data: { type: 'achievement', achievementName },
      trigger: null,
    });
  }

  // New module available notification
  async notifyNewModule(moduleName: string): Promise<void> {
    await this.scheduleNotification({
      title: "📖 New Module Available!",
      body: `Check out the new module: "${moduleName}"`,
      data: { type: 'new_module', moduleName },
      trigger: null,
    });
  }

  // Inactivity reminder (3 days)
  async scheduleInactivityReminder(): Promise<void> {
    await this.scheduleNotification({
      title: "👋 We Miss You!",
      body: "It's been a while since your last lesson. Come back and continue learning!",
      data: { type: 'inactivity_reminder' },
      trigger: {
        seconds: 3 * 24 * 60 * 60, // 3 days
      },
    });
  }

  // Cancel a specific notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Get all scheduled notifications
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Save notification settings
  async saveNotificationSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // Get notification settings
  async getNotificationSettings(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {
        enabled: true,
        dailyReminder: true,
        achievements: true,
        streaks: true,
        moduleUpdates: true,
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  // Setup notification listener
  setupNotificationListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Setup notification response listener (when user taps notification)
  setupNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export default new NotificationService();

// Install package:
// expo install expo-notifications