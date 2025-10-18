export interface NewsItem {
  id: number;
  headline: string;
  title?: string;                   // DB field (aliased to headline in API)
  source_publication_date: string; // When the source published it
  system_addition_date: string;    // When we added it to our system
  source: string;
  credibility: 'maximum' | 'high' | 'medium' | 'single';
  link: string;
  url?: string;                     // DB field (aliased to link in API)
  summary: string;
  description?: string;             // DB field (aliased to summary in API)
  imageUrl?: string;                // News article image
  category?: string;                // News category
  isExternal?: boolean;             // Whether news is from external source
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