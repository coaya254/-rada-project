import { 
  NewsArticle, 
  NewsSource, 
  NewsFilter, 
  NewsSearch, 
  NewsTrend, 
  NewsAnalytics,
  NewsNotification,
  NewsSubscription,
  NewsRSSFeed,
  NewsAPIConfig,
  CredibilityScore,
  EngagementMetrics,
  FactCheckStatus
} from '../types/NewsIntegration';

class NewsService {
  private static articles: NewsArticle[] = [];
  private static sources: NewsSource[] = [];
  private static notifications: NewsNotification[] = [];
  private static subscriptions: NewsSubscription[] = [];
  private static rssFeeds: NewsRSSFeed[] = [];
  private static initialized = false;

  // API Configuration
  private static apiConfig: NewsAPIConfig = {
    provider: 'newsapi',
    apiKey: 'your_news_api_key_here',
    baseUrl: 'https://newsapi.org/v2',
    endpoints: {
      headlines: '/top-headlines',
      everything: '/everything',
      sources: '/sources',
      search: '/everything',
    },
    rateLimit: {
      requestsPerMinute: 1000,
      requestsPerDay: 100000,
    },
    supportedCountries: ['ke', 'us', 'gb', 'ca', 'au'],
    supportedLanguages: ['en', 'sw'],
    categories: ['politics', 'economy', 'society', 'international', 'sports', 'technology', 'health', 'education', 'environment', 'security'],
  };

  /**
   * Initialize sample news data
   */
  static initializeSampleData(): void {
    if (this.initialized) return;
    
    this.sources = this.generateSampleSources();
    this.articles = this.generateSampleArticles();
    this.notifications = this.generateSampleNotifications();
    this.subscriptions = this.generateSampleSubscriptions();
    this.rssFeeds = this.generateSampleRSSFeeds();
    this.initialized = true;
  }

  /**
   * Get news articles with optional filtering
   */
  static getArticles(filters?: NewsFilter, page: number = 1, limit: number = 20): NewsArticle[] {
    let filteredArticles = [...this.articles];

    if (filters) {
      if (filters.category) {
        filteredArticles = filteredArticles.filter(article => article.category === filters.category);
      }
      if (filters.source) {
        filteredArticles = filteredArticles.filter(article => article.source.name === filters.source);
      }
      if (filters.politician) {
        filteredArticles = filteredArticles.filter(article => 
          article.politicians.some(p => p.toLowerCase().includes(filters.politician!.toLowerCase()))
        );
      }
      if (filters.dateFrom) {
        filteredArticles = filteredArticles.filter(article => article.publishedAt >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filteredArticles = filteredArticles.filter(article => article.publishedAt <= filters.dateTo!);
      }
      if (filters.credibilityMin !== undefined) {
        filteredArticles = filteredArticles.filter(article => article.credibility.overall >= filters.credibilityMin!);
      }
      if (filters.sentiment) {
        filteredArticles = filteredArticles.filter(article => article.sentiment === filters.sentiment);
      }
      if (filters.isBreaking !== undefined) {
        filteredArticles = filteredArticles.filter(article => article.isBreaking === filters.isBreaking);
      }
      if (filters.isVerified !== undefined) {
        filteredArticles = filteredArticles.filter(article => article.isVerified === filters.isVerified);
      }
      if (filters.language) {
        filteredArticles = filteredArticles.filter(article => article.language === filters.language);
      }
      if (filters.tags && filters.tags.length > 0) {
        filteredArticles = filteredArticles.filter(article => 
          filters.tags!.some(tag => article.tags.includes(tag))
        );
      }
      if (filters.location) {
        filteredArticles = filteredArticles.filter(article => 
          article.location.country.toLowerCase().includes(filters.location!.toLowerCase()) ||
          article.location.region?.toLowerCase().includes(filters.location!.toLowerCase()) ||
          article.location.city?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
    }

    // Sort by published date (newest first)
    filteredArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredArticles.slice(startIndex, endIndex);
  }

  /**
   * Search news articles
   */
  static searchArticles(searchQuery: NewsSearch): NewsArticle[] {
    const filteredArticles = this.getArticles(searchQuery.filters);
    const query = searchQuery.query.toLowerCase();
    
    let results = filteredArticles.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query) ||
      article.tags.some(tag => tag.toLowerCase().includes(query)) ||
      article.politicians.some(p => p.toLowerCase().includes(query))
    );

    // Sort results
    switch (searchQuery.sortBy) {
      case 'relevance':
        // Simple relevance scoring based on title and summary matches
        results.sort((a, b) => {
          const aScore = this.calculateRelevanceScore(a, query);
          const bScore = this.calculateRelevanceScore(b, query);
          return searchQuery.sortOrder === 'asc' ? aScore - bScore : bScore - aScore;
        });
        break;
      case 'date':
        results.sort((a, b) => {
          const aDate = new Date(a.publishedAt).getTime();
          const bDate = new Date(b.publishedAt).getTime();
          return searchQuery.sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
        });
        break;
      case 'credibility':
        results.sort((a, b) => {
          const aCred = a.credibility.overall;
          const bCred = b.credibility.overall;
          return searchQuery.sortOrder === 'asc' ? aCred - bCred : bCred - aCred;
        });
        break;
      case 'engagement':
        results.sort((a, b) => {
          const aEng = a.engagement.views + a.engagement.shares;
          const bEng = b.engagement.views + b.engagement.shares;
          return searchQuery.sortOrder === 'asc' ? aEng - bEng : bEng - aEng;
        });
        break;
      case 'title':
        results.sort((a, b) => {
          const aTitle = a.title.toLowerCase();
          const bTitle = b.title.toLowerCase();
          return searchQuery.sortOrder === 'asc' ? aTitle.localeCompare(bTitle) : bTitle.localeCompare(aTitle);
        });
        break;
    }

    // Pagination
    const startIndex = (searchQuery.page - 1) * searchQuery.limit;
    const endIndex = startIndex + searchQuery.limit;
    return results.slice(startIndex, endIndex);
  }

  /**
   * Get article by ID
   */
  static getArticle(id: string): NewsArticle | undefined {
    return this.articles.find(article => article.id === id);
  }

  /**
   * Get news sources
   */
  static getSources(): NewsSource[] {
    return this.sources;
  }

  /**
   * Get news analytics
   */
  static getNewsAnalytics(): NewsAnalytics {
    const totalArticles = this.articles.length;
    const totalSources = this.sources.length;
    const averageCredibility = this.articles.reduce((sum, article) => sum + article.credibility.overall, 0) / totalArticles;

    // Category distribution
    const categoryDistribution: { [category: string]: number } = {};
    this.articles.forEach(article => {
      categoryDistribution[article.category] = (categoryDistribution[article.category] || 0) + 1;
    });

    // Sentiment distribution
    const sentimentDistribution: { [sentiment: string]: number } = {};
    this.articles.forEach(article => {
      sentimentDistribution[article.sentiment] = (sentimentDistribution[article.sentiment] || 0) + 1;
    });

    // Top politicians
    const politicianMentions: { [name: string]: number } = {};
    this.articles.forEach(article => {
      article.politicians.forEach(politician => {
        politicianMentions[politician] = (politicianMentions[politician] || 0) + 1;
      });
    });
    const topPoliticians = Object.entries(politicianMentions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, mentions]) => ({ name, mentions }));

    // Top sources
    const sourceStats: { [name: string]: { articles: number; credibility: number } } = {};
    this.articles.forEach(article => {
      const sourceName = article.source.name;
      if (!sourceStats[sourceName]) {
        sourceStats[sourceName] = { articles: 0, credibility: 0 };
      }
      sourceStats[sourceName].articles += 1;
      sourceStats[sourceName].credibility += article.credibility.overall;
    });
    const topSources = Object.entries(sourceStats)
      .map(([name, stats]) => ({
        name,
        articles: stats.articles,
        credibility: stats.credibility / stats.articles
      }))
      .sort((a, b) => b.articles - a.articles)
      .slice(0, 10);

    // Fact check stats
    const factCheckStats = {
      total: this.articles.filter(a => a.factCheckStatus).length,
      verified: this.articles.filter(a => a.factCheckStatus?.status === 'verified').length,
      false: this.articles.filter(a => a.factCheckStatus?.status === 'false').length,
      misleading: this.articles.filter(a => a.factCheckStatus?.status === 'misleading').length,
      unverified: this.articles.filter(a => a.factCheckStatus?.status === 'unverified').length,
    };

    // Engagement stats
    const totalViews = this.articles.reduce((sum, article) => sum + article.engagement.views, 0);
    const totalShares = this.articles.reduce((sum, article) => sum + article.engagement.shares, 0);
    const averageEngagement = totalViews > 0 ? totalShares / totalViews : 0;
    const topPerformingArticles = [...this.articles]
      .sort((a, b) => (b.engagement.views + b.engagement.shares) - (a.engagement.views + a.engagement.shares))
      .slice(0, 5);

    return {
      totalArticles,
      totalSources,
      averageCredibility,
      categoryDistribution,
      sentimentDistribution,
      topPoliticians,
      topSources,
      trendingTopics: [], // Would be calculated from trending analysis
      factCheckStats,
      engagementStats: {
        totalViews,
        totalShares,
        averageEngagement,
        topPerformingArticles,
      },
    };
  }

  /**
   * Get news trends over time
   */
  static getNewsTrends(period: 'day' | 'week' | 'month' | 'quarter' = 'week'): NewsTrend[] {
    const articles = this.articles;
    
    // Group by period
    const grouped: { [key: string]: NewsArticle[] } = {};
    
    articles.forEach(article => {
      const date = new Date(article.publishedAt);
      let periodKey = '';
      
      switch (period) {
        case 'day':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          periodKey = `${date.getFullYear()}-Q${quarter}`;
          break;
      }
      
      if (!grouped[periodKey]) {
        grouped[periodKey] = [];
      }
      grouped[periodKey].push(article);
    });

    return Object.entries(grouped).map(([period, periodArticles]) => {
      // Category breakdown
      const categoryBreakdown: { [category: string]: number } = {};
      periodArticles.forEach(article => {
        categoryBreakdown[article.category] = (categoryBreakdown[article.category] || 0) + 1;
      });

      // Sentiment breakdown
      const sentimentBreakdown: { [sentiment: string]: number } = {};
      periodArticles.forEach(article => {
        sentimentBreakdown[article.sentiment] = (sentimentBreakdown[article.sentiment] || 0) + 1;
      });

      // Top politicians
      const politicianMentions: { [name: string]: number } = {};
      periodArticles.forEach(article => {
        article.politicians.forEach(politician => {
          politicianMentions[politician] = (politicianMentions[politician] || 0) + 1;
        });
      });
      const topPoliticians = Object.entries(politicianMentions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, mentions]) => ({ name, mentions }));

      // Top sources
      const sourceStats: { [name: string]: number } = {};
      periodArticles.forEach(article => {
        sourceStats[article.source.name] = (sourceStats[article.source.name] || 0) + 1;
      });
      const topSources = Object.entries(sourceStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, articles]) => ({ name, articles }));

      const averageCredibility = periodArticles.length > 0 
        ? periodArticles.reduce((sum, article) => sum + article.credibility.overall, 0) / periodArticles.length 
        : 0;

      const breakingNewsCount = periodArticles.filter(article => article.isBreaking).length;
      const factCheckedCount = periodArticles.filter(article => article.factCheckStatus).length;

      return {
        period,
        totalArticles: periodArticles.length,
        categoryBreakdown,
        sentimentBreakdown,
        topPoliticians,
        topSources,
        averageCredibility,
        breakingNewsCount,
        factCheckedCount,
      };
    }).sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Get breaking news
   */
  static getBreakingNews(limit: number = 10): NewsArticle[] {
    return this.articles
      .filter(article => article.isBreaking)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get trending articles
   */
  static getTrendingArticles(limit: number = 10): NewsArticle[] {
    return [...this.articles]
      .sort((a, b) => {
        const aScore = a.engagement.views + a.engagement.shares + a.engagement.likes;
        const bScore = b.engagement.views + b.engagement.shares + b.engagement.likes;
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  /**
   * Get notifications
   */
  static getNotifications(): NewsNotification[] {
    return this.notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Mark notification as read
   */
  static markNotificationAsRead(id: string): boolean {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      return true;
    }
    return false;
  }

  // Private helper methods

  private static calculateRelevanceScore(article: NewsArticle, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Title matches are most important
    if (article.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }
    
    // Summary matches are important
    if (article.summary.toLowerCase().includes(queryLower)) {
      score += 5;
    }
    
    // Content matches are less important
    if (article.content.toLowerCase().includes(queryLower)) {
      score += 2;
    }
    
    // Tag matches
    article.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        score += 3;
      }
    });
    
    // Politician matches
    article.politicians.forEach(politician => {
      if (politician.toLowerCase().includes(queryLower)) {
        score += 4;
      }
    });
    
    return score;
  }

  private static generateSampleSources(): NewsSource[] {
    return [
      {
        id: 'source_1',
        name: 'Daily Nation',
        domain: 'nation.africa',
        logo: 'https://nation.africa/logo.png',
        description: 'Kenya\'s leading daily newspaper',
        country: 'Kenya',
        language: 'en',
        credibility: {
          overall: 85,
          accuracy: 88,
          transparency: 82,
          independence: 80,
          factChecking: 85,
          sourceReliability: 90,
          methodology: 'Editorial standards and fact-checking',
          lastUpdated: '2023-12-01',
          factors: [],
        },
        category: 'mainstream',
        politicalLeaning: 'center',
        factCheckPartner: true,
        verified: true,
        establishedYear: 1960,
        socialMedia: {
          twitter: '@dailynation',
          facebook: 'DailyNation',
        },
        contact: {
          email: 'news@nation.co.ke',
          phone: '+254 20 3288000',
        },
      },
      {
        id: 'source_2',
        name: 'The Standard',
        domain: 'standardmedia.co.ke',
        logo: 'https://standardmedia.co.ke/logo.png',
        description: 'Kenya\'s independent newspaper',
        country: 'Kenya',
        language: 'en',
        credibility: {
          overall: 82,
          accuracy: 85,
          transparency: 80,
          independence: 85,
          factChecking: 80,
          sourceReliability: 85,
          methodology: 'Independent journalism standards',
          lastUpdated: '2023-12-01',
          factors: [],
        },
        category: 'mainstream',
        politicalLeaning: 'center',
        factCheckPartner: true,
        verified: true,
        establishedYear: 1960,
        socialMedia: {
          twitter: '@StandardKenya',
          facebook: 'TheStandardKenya',
        },
        contact: {
          email: 'news@standardmedia.co.ke',
          phone: '+254 20 3208000',
        },
      },
    ];
  }

  private static generateSampleArticles(): NewsArticle[] {
    return [
      {
        id: 'article_1',
        title: 'Ruto Announces New Economic Recovery Plan',
        summary: 'President William Ruto has unveiled a comprehensive economic recovery plan aimed at boosting Kenya\'s economy through increased investment in infrastructure and agriculture.',
        content: 'President William Ruto today announced a new economic recovery plan that focuses on...',
        url: 'https://nation.africa/kenya/news/ruto-economic-recovery-plan',
        source: this.sources[0],
        author: 'John Mwangi',
        publishedAt: '2023-12-01T10:00:00Z',
        updatedAt: '2023-12-01T10:00:00Z',
        category: 'politics',
        tags: ['economy', 'recovery', 'infrastructure', 'agriculture'],
        politicians: ['William Ruto'],
        location: {
          country: 'Kenya',
          region: 'Nairobi',
          city: 'Nairobi',
        },
        language: 'en',
        credibility: {
          overall: 88,
          accuracy: 90,
          transparency: 85,
          independence: 80,
          factChecking: 88,
          sourceReliability: 90,
          methodology: 'Official press release and fact-checking',
          lastUpdated: '2023-12-01',
          factors: [],
        },
        engagement: {
          views: 15420,
          likes: 892,
          shares: 234,
          comments: 156,
          bookmarks: 89,
          reactions: {
            positive: 65,
            negative: 20,
            neutral: 15,
          },
          socialMedia: {
            twitter: 1200,
            facebook: 800,
            linkedin: 200,
            whatsapp: 500,
          },
          timeOnPage: 180,
          bounceRate: 25,
          clickThroughRate: 12,
        },
        mediaType: 'text',
        featuredImage: 'https://nation.africa/images/ruto-economic-plan.jpg',
        relatedArticles: ['article_2'],
        factCheckStatus: {
          status: 'verified',
          factChecker: 'Africa Check',
          factCheckDate: '2023-12-01',
          factCheckUrl: 'https://africacheck.org/fact-checks/ruto-economic-plan',
          explanation: 'Verified through official government sources',
          evidence: ['Official press release', 'Government website'],
          confidence: 'high',
          methodology: 'Cross-referencing with official sources',
        },
        sentiment: 'positive',
        priority: 'high',
        isBreaking: true,
        isVerified: true,
        isOpinion: false,
        wordCount: 450,
        readingTime: 2,
      },
    ];
  }

  private static generateSampleNotifications(): NewsNotification[] {
    return [
      {
        id: 'notif_1',
        type: 'breaking',
        title: 'Breaking News',
        message: 'Ruto Announces New Economic Recovery Plan',
        articleId: 'article_1',
        priority: 'high',
        isRead: false,
        createdAt: '2023-12-01T10:05:00Z',
        actionUrl: '/article/article_1',
      },
    ];
  }

  private static generateSampleSubscriptions(): NewsSubscription[] {
    return [
      {
        id: 'sub_1',
        userId: 'user_1',
        type: 'politician',
        target: 'William Ruto',
        filters: { politician: 'William Ruto' },
        isActive: true,
        createdAt: '2023-11-01T00:00:00Z',
        notificationSettings: {
          email: true,
          push: true,
          frequency: 'immediate',
        },
      },
    ];
  }

  private static generateSampleRSSFeeds(): NewsRSSFeed[] {
    return [
      {
        id: 'rss_1',
        sourceId: 'source_1',
        url: 'https://nation.africa/rss',
        name: 'Daily Nation RSS',
        description: 'Daily Nation news feed',
        category: 'politics',
        language: 'en',
        isActive: true,
        fetchInterval: 30,
        errorCount: 0,
        settings: {
          maxArticles: 100,
          filterKeywords: ['politics', 'government', 'economy'],
          excludeKeywords: ['sports', 'entertainment'],
          minCredibility: 70,
        },
      },
    ];
  }
}

export default NewsService;
