export interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  isDelivered: boolean;
  scheduledFor?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  actionUrl?: string;
  imageUrl?: string;
  sound?: string;
  badge?: number;
}

export type NotificationType = 
  | 'lesson_reminder'
  | 'quiz_reminder'
  | 'streak_reminder'
  | 'achievement_unlocked'
  | 'badge_earned'
  | 'group_invite'
  | 'group_activity'
  | 'buddy_request'
  | 'study_session_reminder'
  | 'challenge_available'
  | 'weekly_goal_reminder'
  | 'social_mention'
  | 'post_reply'
  | 'system_update'
  | 'maintenance_notice';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationCategory = 
  | 'learning'
  | 'social'
  | 'achievement'
  | 'reminder'
  | 'system'
  | 'marketing';

export interface NotificationSettings {
  userId: string;
  enabled: boolean;
  categories: {
    learning: boolean;
    social: boolean;
    achievement: boolean;
    reminder: boolean;
    system: boolean;
    marketing: boolean;
  };
  timing: {
    quietHoursStart: string; // "22:00"
    quietHoursEnd: string;   // "08:00"
    timezone: string;
  };
  frequency: {
    lessonReminders: 'daily' | 'weekly' | 'never';
    socialUpdates: 'immediate' | 'daily' | 'weekly' | 'never';
    achievementAlerts: 'immediate' | 'daily' | 'never';
  };
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  defaultData: any;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  type: 'broadcast' | 'targeted' | 'scheduled';
  targetAudience: {
    userSegments: string[];
    userIds?: string[];
    criteria: any;
  };
  template: NotificationTemplate;
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  unsubscribed: number;
  byCategory: {
    [key in NotificationCategory]: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    };
  };
  byType: {
    [key in NotificationType]: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    };
  };
  timeRange: {
    start: string;
    end: string;
  };
}

export interface NotificationSchedule {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any;
  scheduledFor: string;
  isRecurring: boolean;
  recurrencePattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  isDelivered: boolean;
  scheduledFor?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  actionUrl?: string;
  imageUrl?: string;
  sound?: string;
  badge?: number;
}

export type NotificationType = 
  | 'lesson_reminder'
  | 'quiz_reminder'
  | 'streak_reminder'
  | 'achievement_unlocked'
  | 'badge_earned'
  | 'group_invite'
  | 'group_activity'
  | 'buddy_request'
  | 'study_session_reminder'
  | 'challenge_available'
  | 'weekly_goal_reminder'
  | 'social_mention'
  | 'post_reply'
  | 'system_update'
  | 'maintenance_notice';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationCategory = 
  | 'learning'
  | 'social'
  | 'achievement'
  | 'reminder'
  | 'system'
  | 'marketing';

export interface NotificationSettings {
  userId: string;
  enabled: boolean;
  categories: {
    learning: boolean;
    social: boolean;
    achievement: boolean;
    reminder: boolean;
    system: boolean;
    marketing: boolean;
  };
  timing: {
    quietHoursStart: string; // "22:00"
    quietHoursEnd: string;   // "08:00"
    timezone: string;
  };
  frequency: {
    lessonReminders: 'daily' | 'weekly' | 'never';
    socialUpdates: 'immediate' | 'daily' | 'weekly' | 'never';
    achievementAlerts: 'immediate' | 'daily' | 'never';
  };
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  defaultData: any;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  type: 'broadcast' | 'targeted' | 'scheduled';
  targetAudience: {
    userSegments: string[];
    userIds?: string[];
    criteria: any;
  };
  template: NotificationTemplate;
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  unsubscribed: number;
  byCategory: {
    [key in NotificationCategory]: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    };
  };
  byType: {
    [key in NotificationType]: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    };
  };
  timeRange: {
    start: string;
    end: string;
  };
}

export interface NotificationSchedule {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any;
  scheduledFor: string;
  isRecurring: boolean;
  recurrencePattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
