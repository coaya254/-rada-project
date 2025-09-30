export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  source: NewsSource;
  author: string;
  publishedAt: string;
  updatedAt: string;
  category: 'politics' | 'economy' | 'society' | 'international' | 'sports' | 'technology' | 'health' | 'education' | 'environment' | 'security';
  tags: string[];
  politicians: string[]; // Politician names mentioned
  location: {
    country: string;
    region?: string;
    city?: string;
  };
  language: 'en' | 'sw' | 'fr' | 'ar';
  credibility: CredibilityScore;
  engagement: EngagementMetrics;
  mediaType: 'text' | 'video' | 'audio' | 'image' | 'interactive';
  featuredImage?: string;
  relatedArticles: string[];
  factCheckStatus?: FactCheckStatus;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  priority: 'breaking' | 'high' | 'medium' | 'low';
  isBreaking: boolean;
  isVerified: boolean;
  isOpinion: boolean;
  wordCount: number;
  readingTime: number; // in minutes
}

export interface NewsSource {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  description: string;
  country: string;
  language: string;
  credibility: CredibilityScore;
  category: 'mainstream' | 'independent' | 'government' | 'international' | 'blog' | 'social_media';
  politicalLeaning: 'left' | 'center' | 'right' | 'neutral' | 'unknown';
  factCheckPartner: boolean;
  verified: boolean;
  establishedYear: number;
  socialMedia: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

export interface CredibilityScore {
  overall: number; // 0-100
  accuracy: number; // 0-100
  transparency: number; // 0-100
  independence: number; // 0-100
  factChecking: number; // 0-100
  sourceReliability: number; // 0-100
  methodology: string;
  lastUpdated: string;
  factors: CredibilityFactor[];
}

export interface CredibilityFactor {
  factor: string;
  score: number;
  weight: number;
  description: string;
  evidence: string[];
}

export interface EngagementMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  bookmarks: number;
  reactions: {
    positive: number;
    negative: number;
    neutral: number;
  };
  socialMedia: {
    twitter: number;
    facebook: number;
    linkedin: number;
    whatsapp: number;
  };
  timeOnPage: number; // in seconds
  bounceRate: number; // percentage
  clickThroughRate: number; // percentage
}

export interface FactCheckStatus {
  status: 'verified' | 'false' | 'misleading' | 'unverified' | 'disputed';
  factChecker: string;
  factCheckDate: string;
  factCheckUrl: string;
  explanation: string;
  evidence: string[];
  confidence: 'high' | 'medium' | 'low';
  methodology: string;
}

export interface NewsFilter {
  category?: string;
  source?: string;
  politician?: string;
  dateFrom?: string;
  dateTo?: string;
  credibilityMin?: number;
  sentiment?: string;
  isBreaking?: boolean;
  isVerified?: boolean;
  language?: string;
  tags?: string[];
  location?: string;
}

export interface NewsSearch {
  query: string;
  filters: NewsFilter;
  sortBy: 'relevance' | 'date' | 'credibility' | 'engagement' | 'title';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface NewsTrend {
  period: string;
  totalArticles: number;
  categoryBreakdown: { [category: string]: number };
  sentimentBreakdown: { [sentiment: string]: number };
  topPoliticians: { name: string; mentions: number }[];
  topSources: { name: string; articles: number }[];
  averageCredibility: number;
  breakingNewsCount: number;
  factCheckedCount: number;
}

export interface NewsAnalytics {
  totalArticles: number;
  totalSources: number;
  averageCredibility: number;
  categoryDistribution: { [category: string]: number };
  sentimentDistribution: { [sentiment: string]: number };
  topPoliticians: { name: string; mentions: number }[];
  topSources: { name: string; articles: number; credibility: number }[];
  trendingTopics: { topic: string; count: number; trend: 'up' | 'down' | 'stable' }[];
  factCheckStats: {
    total: number;
    verified: number;
    false: number;
    misleading: number;
    unverified: number;
  };
  engagementStats: {
    totalViews: number;
    totalShares: number;
    averageEngagement: number;
    topPerformingArticles: NewsArticle[];
  };
}

export interface NewsNotification {
  id: string;
  type: 'breaking' | 'fact_check' | 'trending' | 'politician_mention' | 'source_update';
  title: string;
  message: string;
  articleId?: string;
  politicianId?: number;
  sourceId?: string;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: any;
}

export interface NewsSubscription {
  id: string;
  userId: string;
  type: 'politician' | 'category' | 'source' | 'keyword' | 'location';
  target: string; // politician name, category, source name, keyword, location
  filters: NewsFilter;
  isActive: boolean;
  createdAt: string;
  lastNotified?: string;
  notificationSettings: {
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  };
}

export interface NewsRSSFeed {
  id: string;
  sourceId: string;
  url: string;
  name: string;
  description: string;
  category: string;
  language: string;
  isActive: boolean;
  lastFetched?: string;
  fetchInterval: number; // in minutes
  errorCount: number;
  lastError?: string;
  settings: {
    maxArticles: number;
    filterKeywords: string[];
    excludeKeywords: string[];
    minCredibility: number;
  };
}

export interface NewsAPIConfig {
  provider: 'newsapi' | 'guardian' | 'nytimes' | 'custom' | 'rss';
  apiKey: string;
  baseUrl: string;
  endpoints: {
    headlines: string;
    everything: string;
    sources: string;
    search: string;
  };
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  supportedCountries: string[];
  supportedLanguages: string[];
  categories: string[];
}
