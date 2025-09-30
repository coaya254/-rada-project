export interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  totalModules: number;
  totalLessons: number;
  totalQuizzes: number;
  totalCompletions: number;
  averageCompletionRate: number;
  totalXP: number;
  averageSessionDuration: number;
  retentionRate: {
    day1: number;
    day7: number;
    day30: number;
  };
  engagementScore: number;
  period: {
    start: string;
    end: string;
  };
}

export interface UserAnalytics {
  userId: string;
  username: string;
  joinDate: string;
  lastActive: string;
  totalSessions: number;
  totalTimeSpent: number;
  modulesCompleted: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  totalXP: number;
  currentLevel: number;
  streak: number;
  badges: string[];
  learningPath: LearningPathStep[];
  performance: {
    averageQuizScore: number;
    averageTimePerLesson: number;
    completionRate: number;
    engagementScore: number;
  };
  preferences: {
    favoriteCategories: string[];
    preferredLearningTime: string;
    deviceType: string;
    notificationSettings: any;
  };
  socialActivity: {
    groupsJoined: number;
    postsCreated: number;
    commentsMade: number;
    likesReceived: number;
  };
}

export interface LearningPathStep {
  id: string;
  type: 'module' | 'lesson' | 'quiz' | 'achievement';
  title: string;
  completedAt: string;
  score?: number;
  timeSpent: number;
  xpEarned: number;
  order: number;
}

export interface ContentAnalytics {
  contentId: number;
  contentType: 'module' | 'lesson' | 'quiz';
  title: string;
  views: number;
  completions: number;
  averageTimeSpent: number;
  completionRate: number;
  averageRating: number;
  dropOffPoints: DropOffPoint[];
  userFeedback: UserFeedback[];
  performance: {
    engagement: number;
    difficulty: number;
    effectiveness: number;
  };
  trends: {
    daily: AnalyticsDataPoint[];
    weekly: AnalyticsDataPoint[];
    monthly: AnalyticsDataPoint[];
  };
  demographics: {
    ageGroups: { [key: string]: number };
    locations: { [key: string]: number };
    devices: { [key: string]: number };
  };
}

export interface DropOffPoint {
  position: number;
  percentage: number;
  reason?: string;
  suggestions: string[];
}

export interface UserFeedback {
  userId: string;
  rating: number;
  comment: string;
  timestamp: string;
  helpful: number;
}

export interface AnalyticsDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface EngagementMetrics {
  dailyActiveUsers: AnalyticsDataPoint[];
  weeklyActiveUsers: AnalyticsDataPoint[];
  monthlyActiveUsers: AnalyticsDataPoint[];
  sessionDuration: AnalyticsDataPoint[];
  pageViews: AnalyticsDataPoint[];
  bounceRate: AnalyticsDataPoint[];
  retention: {
    cohort: string;
    day1: number;
    day7: number;
    day30: number;
  }[];
}

export interface LearningMetrics {
  moduleCompletions: AnalyticsDataPoint[];
  lessonCompletions: AnalyticsDataPoint[];
  quizCompletions: AnalyticsDataPoint[];
  averageScores: AnalyticsDataPoint[];
  xpEarned: AnalyticsDataPoint[];
  badgesEarned: AnalyticsDataPoint[];
  learningStreaks: AnalyticsDataPoint[];
  timeSpent: AnalyticsDataPoint[];
}

export interface SocialMetrics {
  groupMemberships: AnalyticsDataPoint[];
  postsCreated: AnalyticsDataPoint[];
  commentsMade: AnalyticsDataPoint[];
  likesGiven: AnalyticsDataPoint[];
  sharesMade: AnalyticsDataPoint[];
  discussionsStarted: AnalyticsDataPoint[];
  peerInteractions: AnalyticsDataPoint[];
}

export interface PerformanceMetrics {
  appLoadTime: AnalyticsDataPoint[];
  apiResponseTime: AnalyticsDataPoint[];
  errorRate: AnalyticsDataPoint[];
  crashRate: AnalyticsDataPoint[];
  memoryUsage: AnalyticsDataPoint[];
  batteryUsage: AnalyticsDataPoint[];
  networkUsage: AnalyticsDataPoint[];
}

export interface CohortAnalysis {
  cohort: string;
  size: number;
  retention: {
    day1: number;
    day7: number;
    day14: number;
    day30: number;
    day60: number;
    day90: number;
  };
  engagement: {
    averageSessions: number;
    averageTimeSpent: number;
    completionRate: number;
  };
  revenue?: {
    total: number;
    average: number;
    ltv: number;
  };
}

export interface FunnelAnalysis {
  name: string;
  steps: FunnelStep[];
  conversionRates: number[];
  dropOffPoints: {
    step: number;
    percentage: number;
    reasons: string[];
  }[];
  recommendations: string[];
}

export interface FunnelStep {
  name: string;
  users: number;
  conversionRate: number;
  averageTime: number;
}

export interface A/BTestResult {
  testId: string;
  name: string;
  status: 'running' | 'completed' | 'paused';
  variants: {
    name: string;
    users: number;
    conversionRate: number;
    confidence: number;
    metrics: { [key: string]: number };
  }[];
  winner?: string;
  confidence: number;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface HeatmapData {
  contentId: number;
  contentType: string;
  interactions: {
    x: number;
    y: number;
    intensity: number;
    type: 'click' | 'scroll' | 'hover' | 'focus';
  }[];
  screenSize: {
    width: number;
    height: number;
  };
  deviceType: string;
}

export interface PredictiveAnalytics {
  userChurn: {
    userId: string;
    churnProbability: number;
    riskFactors: string[];
    recommendations: string[];
  }[];
  contentRecommendations: {
    userId: string;
    recommendedContent: {
      contentId: number;
      contentType: string;
      title: string;
      confidence: number;
      reason: string;
    }[];
  }[];
  learningOutcomes: {
    userId: string;
    predictedCompletionTime: number;
    successProbability: number;
    suggestedInterventions: string[];
  }[];
}

export interface AnalyticsReport {
  id: string;
  name: string;
  type: 'overview' | 'user' | 'content' | 'engagement' | 'custom';
  description: string;
  metrics: string[];
  filters: any;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    recipients: string[];
  };
  lastGenerated: string;
  nextGeneration: string;
  status: 'active' | 'paused' | 'error';
  data: any;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: {
    columns: number;
    rows: number;
    widgetPositions: { [widgetId: string]: { x: number; y: number; width: number; height: number } };
  };
  filters: any;
  refreshInterval: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'heatmap' | 'funnel' | 'cohort' | 'custom';
  title: string;
  description: string;
  data: any;
  config: {
    chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'scatter' | 'area';
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    animation?: boolean;
  };
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  refreshInterval?: number;
}

export interface AnalyticsAlert {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'changed_by';
  threshold: number;
  isActive: boolean;
  lastTriggered?: string;
  recipients: string[];
  actions: {
    type: 'email' | 'push' | 'webhook' | 'slack';
    config: any;
  }[];
}

export interface AnalyticsExport {
  id: string;
  name: string;
  type: 'csv' | 'json' | 'xlsx' | 'pdf';
  data: any;
  filters: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
}

  totalUsers: number;
  activeUsers: number;
  totalModules: number;
  totalLessons: number;
  totalQuizzes: number;
  totalCompletions: number;
  averageCompletionRate: number;
  totalXP: number;
  averageSessionDuration: number;
  retentionRate: {
    day1: number;
    day7: number;
    day30: number;
  };
  engagementScore: number;
  period: {
    start: string;
    end: string;
  };
}

export interface UserAnalytics {
  userId: string;
  username: string;
  joinDate: string;
  lastActive: string;
  totalSessions: number;
  totalTimeSpent: number;
  modulesCompleted: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  totalXP: number;
  currentLevel: number;
  streak: number;
  badges: string[];
  learningPath: LearningPathStep[];
  performance: {
    averageQuizScore: number;
    averageTimePerLesson: number;
    completionRate: number;
    engagementScore: number;
  };
  preferences: {
    favoriteCategories: string[];
    preferredLearningTime: string;
    deviceType: string;
    notificationSettings: any;
  };
  socialActivity: {
    groupsJoined: number;
    postsCreated: number;
    commentsMade: number;
    likesReceived: number;
  };
}

export interface LearningPathStep {
  id: string;
  type: 'module' | 'lesson' | 'quiz' | 'achievement';
  title: string;
  completedAt: string;
  score?: number;
  timeSpent: number;
  xpEarned: number;
  order: number;
}

export interface ContentAnalytics {
  contentId: number;
  contentType: 'module' | 'lesson' | 'quiz';
  title: string;
  views: number;
  completions: number;
  averageTimeSpent: number;
  completionRate: number;
  averageRating: number;
  dropOffPoints: DropOffPoint[];
  userFeedback: UserFeedback[];
  performance: {
    engagement: number;
    difficulty: number;
    effectiveness: number;
  };
  trends: {
    daily: AnalyticsDataPoint[];
    weekly: AnalyticsDataPoint[];
    monthly: AnalyticsDataPoint[];
  };
  demographics: {
    ageGroups: { [key: string]: number };
    locations: { [key: string]: number };
    devices: { [key: string]: number };
  };
}

export interface DropOffPoint {
  position: number;
  percentage: number;
  reason?: string;
  suggestions: string[];
}

export interface UserFeedback {
  userId: string;
  rating: number;
  comment: string;
  timestamp: string;
  helpful: number;
}

export interface AnalyticsDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface EngagementMetrics {
  dailyActiveUsers: AnalyticsDataPoint[];
  weeklyActiveUsers: AnalyticsDataPoint[];
  monthlyActiveUsers: AnalyticsDataPoint[];
  sessionDuration: AnalyticsDataPoint[];
  pageViews: AnalyticsDataPoint[];
  bounceRate: AnalyticsDataPoint[];
  retention: {
    cohort: string;
    day1: number;
    day7: number;
    day30: number;
  }[];
}

export interface LearningMetrics {
  moduleCompletions: AnalyticsDataPoint[];
  lessonCompletions: AnalyticsDataPoint[];
  quizCompletions: AnalyticsDataPoint[];
  averageScores: AnalyticsDataPoint[];
  xpEarned: AnalyticsDataPoint[];
  badgesEarned: AnalyticsDataPoint[];
  learningStreaks: AnalyticsDataPoint[];
  timeSpent: AnalyticsDataPoint[];
}

export interface SocialMetrics {
  groupMemberships: AnalyticsDataPoint[];
  postsCreated: AnalyticsDataPoint[];
  commentsMade: AnalyticsDataPoint[];
  likesGiven: AnalyticsDataPoint[];
  sharesMade: AnalyticsDataPoint[];
  discussionsStarted: AnalyticsDataPoint[];
  peerInteractions: AnalyticsDataPoint[];
}

export interface PerformanceMetrics {
  appLoadTime: AnalyticsDataPoint[];
  apiResponseTime: AnalyticsDataPoint[];
  errorRate: AnalyticsDataPoint[];
  crashRate: AnalyticsDataPoint[];
  memoryUsage: AnalyticsDataPoint[];
  batteryUsage: AnalyticsDataPoint[];
  networkUsage: AnalyticsDataPoint[];
}

export interface CohortAnalysis {
  cohort: string;
  size: number;
  retention: {
    day1: number;
    day7: number;
    day14: number;
    day30: number;
    day60: number;
    day90: number;
  };
  engagement: {
    averageSessions: number;
    averageTimeSpent: number;
    completionRate: number;
  };
  revenue?: {
    total: number;
    average: number;
    ltv: number;
  };
}

export interface FunnelAnalysis {
  name: string;
  steps: FunnelStep[];
  conversionRates: number[];
  dropOffPoints: {
    step: number;
    percentage: number;
    reasons: string[];
  }[];
  recommendations: string[];
}

export interface FunnelStep {
  name: string;
  users: number;
  conversionRate: number;
  averageTime: number;
}

export interface A/BTestResult {
  testId: string;
  name: string;
  status: 'running' | 'completed' | 'paused';
  variants: {
    name: string;
    users: number;
    conversionRate: number;
    confidence: number;
    metrics: { [key: string]: number };
  }[];
  winner?: string;
  confidence: number;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface HeatmapData {
  contentId: number;
  contentType: string;
  interactions: {
    x: number;
    y: number;
    intensity: number;
    type: 'click' | 'scroll' | 'hover' | 'focus';
  }[];
  screenSize: {
    width: number;
    height: number;
  };
  deviceType: string;
}

export interface PredictiveAnalytics {
  userChurn: {
    userId: string;
    churnProbability: number;
    riskFactors: string[];
    recommendations: string[];
  }[];
  contentRecommendations: {
    userId: string;
    recommendedContent: {
      contentId: number;
      contentType: string;
      title: string;
      confidence: number;
      reason: string;
    }[];
  }[];
  learningOutcomes: {
    userId: string;
    predictedCompletionTime: number;
    successProbability: number;
    suggestedInterventions: string[];
  }[];
}

export interface AnalyticsReport {
  id: string;
  name: string;
  type: 'overview' | 'user' | 'content' | 'engagement' | 'custom';
  description: string;
  metrics: string[];
  filters: any;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    recipients: string[];
  };
  lastGenerated: string;
  nextGeneration: string;
  status: 'active' | 'paused' | 'error';
  data: any;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: {
    columns: number;
    rows: number;
    widgetPositions: { [widgetId: string]: { x: number; y: number; width: number; height: number } };
  };
  filters: any;
  refreshInterval: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'heatmap' | 'funnel' | 'cohort' | 'custom';
  title: string;
  description: string;
  data: any;
  config: {
    chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'scatter' | 'area';
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    animation?: boolean;
  };
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  refreshInterval?: number;
}

export interface AnalyticsAlert {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'changed_by';
  threshold: number;
  isActive: boolean;
  lastTriggered?: string;
  recipients: string[];
  actions: {
    type: 'email' | 'push' | 'webhook' | 'slack';
    config: any;
  }[];
}

export interface AnalyticsExport {
  id: string;
  name: string;
  type: 'csv' | 'json' | 'xlsx' | 'pdf';
  data: any;
  filters: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
}
