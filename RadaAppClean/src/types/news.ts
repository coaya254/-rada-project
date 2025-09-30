export interface NewsItem {
  id: number;
  headline: string;
  source_publication_date: string; // When the source published it
  system_addition_date: string;    // When we added it to our system
  source: string;
  credibility: 'maximum' | 'high' | 'medium' | 'single';
  link: string;
  summary: string;
}

export interface NewsFilters {
  source?: string;
  credibility?: NewsItem['credibility'];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface NewsState {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}