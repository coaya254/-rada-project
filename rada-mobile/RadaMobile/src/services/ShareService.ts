import { Share, Alert, Platform } from 'react-native';
import { Linking } from 'react-native';

interface ShareOptions {
  title?: string;
  message: string;
  url?: string;
  subject?: string;
}

interface PoliticianShareData {
  name: string;
  position: string;
  party: string;
  achievements: string[];
  imageUrl?: string;
  summary: string;
}

interface NewsShareData {
  title: string;
  content: string;
  source: string;
  date: string;
  url?: string;
}

interface AnalyticsShareData {
  title: string;
  data: any;
  insights: string[];
}

class ShareService {
  /**
   * Share politician information
   */
  static async sharePolitician(politician: PoliticianShareData): Promise<void> {
    try {
      const message = this.formatPoliticianMessage(politician);
      const url = this.generatePoliticianUrl(politician);
      
      const shareOptions: ShareOptions = {
        title: `Check out ${politician.name}`,
        message: message,
        url: url,
      };

      await this.performShare(shareOptions);
    } catch (error) {
      console.error('Error sharing politician:', error);
      this.showErrorAlert('Failed to share politician information');
    }
  }

  /**
   * Share news article
   */
  static async shareNews(news: NewsShareData): Promise<void> {
    try {
      const message = this.formatNewsMessage(news);
      
      const shareOptions: ShareOptions = {
        title: news.title,
        message: message,
        url: news.url,
      };

      await this.performShare(shareOptions);
    } catch (error) {
      console.error('Error sharing news:', error);
      this.showErrorAlert('Failed to share news article');
    }
  }

  /**
   * Share analytics data
   */
  static async shareAnalytics(analytics: AnalyticsShareData): Promise<void> {
    try {
      const message = this.formatAnalyticsMessage(analytics);
      
      const shareOptions: ShareOptions = {
        title: analytics.title,
        message: message,
      };

      await this.performShare(shareOptions);
    } catch (error) {
      console.error('Error sharing analytics:', error);
      this.showErrorAlert('Failed to share analytics data');
    }
  }

  /**
   * Share comparison results
   */
  static async shareComparison(politicians: PoliticianShareData[], metrics: any): Promise<void> {
    try {
      const message = this.formatComparisonMessage(politicians, metrics);
      
      const shareOptions: ShareOptions = {
        title: 'Politician Comparison Results',
        message: message,
      };

      await this.performShare(shareOptions);
    } catch (error) {
      console.error('Error sharing comparison:', error);
      this.showErrorAlert('Failed to share comparison results');
    }
  }

  /**
   * Share app with friends
   */
  static async shareApp(): Promise<void> {
    try {
      const message = `Check out Rada Mobile - Kenya's comprehensive political information app! 📱🇰🇪\n\n` +
        `Features:\n` +
        `• Political Archive with 15+ politicians\n` +
        `• Real-time analytics and insights\n` +
        `• Politician comparison tools\n` +
        `• News aggregation and fact-checking\n` +
        `• Favorites and bookmarking\n\n` +
        `Download now and stay informed about Kenyan politics!`;
      
      const shareOptions: ShareOptions = {
        title: 'Rada Mobile - Political Information App',
        message: message,
        url: 'https://radamobile.com', // Replace with actual app store URL
      };

      await this.performShare(shareOptions);
    } catch (error) {
      console.error('Error sharing app:', error);
      this.showErrorAlert('Failed to share app');
    }
  }

  /**
   * Share to social media platforms
   */
  static async shareToSocial(platform: 'twitter' | 'facebook' | 'whatsapp', data: any): Promise<void> {
    try {
      let url = '';
      let message = '';

      switch (platform) {
        case 'twitter':
          url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.message)}&url=${encodeURIComponent(data.url || '')}`;
          break;
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url || '')}&quote=${encodeURIComponent(data.message)}`;
          break;
        case 'whatsapp':
          url = `whatsapp://send?text=${encodeURIComponent(data.message + (data.url ? `\n${data.url}` : ''))}`;
          break;
      }

      if (url) {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          this.showErrorAlert(`${platform} is not available on this device`);
        }
      }
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      this.showErrorAlert(`Failed to share to ${platform}`);
    }
  }

  /**
   * Export data as text
   */
  static async exportAsText(data: any, filename: string): Promise<void> {
    try {
      const textContent = this.formatDataAsText(data);
      
      const shareOptions: ShareOptions = {
        title: `Export ${filename}`,
        message: textContent,
      };

      await this.performShare(shareOptions);
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showErrorAlert('Failed to export data');
    }
  }

  // Private helper methods

  private static async performShare(options: ShareOptions): Promise<void> {
    const shareConfig: any = {
      message: options.message,
    };

    if (options.title) {
      shareConfig.title = options.title;
    }

    if (options.url) {
      shareConfig.url = options.url;
    }

    if (Platform.OS === 'ios' && options.subject) {
      shareConfig.subject = options.subject;
    }

    await Share.share(shareConfig);
  }

  private static formatPoliticianMessage(politician: PoliticianShareData): string {
    return `🏛️ ${politician.name}\n` +
      `📋 ${politician.position}\n` +
      `🏛️ ${politician.party}\n\n` +
      `📝 Summary:\n${politician.summary}\n\n` +
      `🏆 Key Achievements:\n${politician.achievements.slice(0, 3).map(a => `• ${a}`).join('\n')}\n\n` +
      `📱 Shared via Rada Mobile - Kenya's Political Information App`;
  }

  private static formatNewsMessage(news: NewsShareData): string {
    return `📰 ${news.title}\n\n` +
      `📝 ${news.content}\n\n` +
      `📅 ${news.date}\n` +
      `📰 Source: ${news.source}\n\n` +
      `📱 Shared via Rada Mobile - Kenya's Political Information App`;
  }

  private static formatAnalyticsMessage(analytics: AnalyticsShareData): string {
    return `📊 ${analytics.title}\n\n` +
      `📈 Key Insights:\n${analytics.insights.map(i => `• ${i}`).join('\n')}\n\n` +
      `📱 Shared via Rada Mobile - Kenya's Political Information App`;
  }

  private static formatComparisonMessage(politicians: PoliticianShareData[], metrics: any): string {
    const names = politicians.map(p => p.name).join(' vs ');
    return `⚖️ Politician Comparison: ${names}\n\n` +
      `📊 Comparison Results:\n` +
      `• Experience: ${Object.values(metrics.experience || {}).join(' vs ')} years\n` +
      `• Achievements: ${Object.values(metrics.achievements || {}).join(' vs ')}\n\n` +
      `📱 Shared via Rada Mobile - Kenya's Political Information App`;
  }

  private static formatDataAsText(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  private static generatePoliticianUrl(politician: PoliticianShareData): string {
    // Generate a shareable URL for the politician
    const slug = politician.name.toLowerCase().replace(/\s+/g, '-');
    return `https://radamobile.com/politician/${slug}`;
  }

  private static showErrorAlert(message: string): void {
    Alert.alert('Share Error', message, [{ text: 'OK' }]);
  }
}

export default ShareService;
