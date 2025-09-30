export interface Politician {
  id: number;
  name: string;
  title: string;
  current_position: string;
  party: string;
  party_history: string[];
  constituency: string;
  wikipedia_summary?: string;
  key_achievements: string[];
  education: string;
  image_url?: string;
  party_color?: string;
  slug: string;
}

export interface Document {
  id: number;
  title: string;
  date: string;
  type: 'speech' | 'policy' | 'parliamentary';
  source: string;
  key_quotes?: string[];
  summary: string;
}

export interface TimelineEvent {
  id: number;
  year: number;
  event: string;
  significance: string;
  sources: string[];
  context: string;
}

export interface Commitment {
  id: number;
  promise: string;
  context: string;
  date_made: string;
  sources: string[];
  status: 'completed' | 'in_progress' | 'pending' | 'broken';
  related_actions?: {
    action: string;
    date: string;
    source: string;
    connection: string;
  }[];
}

export interface VotingRecord {
  id: number;
  bill_name: string;
  vote: 'yes' | 'no' | 'abstain' | 'absent';
  date: string;
  category: string;
  significance: string;
}