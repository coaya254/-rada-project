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
  years_in_office?: number;
  age?: number | string;
  bio?: string;
  position?: string;
  imageUrl?: string;
  rating?: number | string;
  email?: string;
  phone?: string;
  website?: string;
  social_media_twitter?: string;

  // Source verification for career information
  education_sources?: {
    type: 'university_record' | 'official_certificate' | 'news_coverage' | 'biography' | 'academic_publication';
    url: string;
    title: string;
    source: string;
    date: string;
  }[];

  achievements_sources?: {
    type: 'government_report' | 'news_coverage' | 'official_award' | 'project_documentation' | 'parliamentary_record';
    url: string;
    title: string;
    source: string;
    date: string;
  }[];

  position_sources?: {
    type: 'appointment_letter' | 'gazette_notice' | 'news_announcement' | 'official_website' | 'parliamentary_record';
    url: string;
    title: string;
    source: string;
    date: string;
  }[];
}

export interface Document {
  id: number;
  title: string;
  date: string;
  type: 'speech' | 'policy' | 'bill' | 'press_release' | 'interview' | 'manifesto' | 'report' | 'letter' | 'parliamentary' | 'other';
  source: string;
  key_quotes?: string[];
  summary: string;

  // Source links for the document
  source_links?: {
    type: 'hansard' | 'video_recording' | 'official_website' | 'news_coverage' | 'government_doc';
    url: string;
    title: string;
    source: string;
    date: string;
  }[];

  // Verification links for document authenticity
  verification_links?: {
    type: 'official_record' | 'media_verification' | 'fact_check' | 'archive_link' | 'independent_source';
    url: string;
    title: string;
    source: string;
    date: string;
    content_summary: string;
  }[];
}

export interface TimelineEvent {
  id: number;
  politician_id: number;
  title: string;
  description: string;
  date: string;
  type: 'position' | 'achievement' | 'controversy' | 'legislation' | 'event';

  // Source links for timeline events
  source_links?: {
    type: 'news' | 'government_doc' | 'parliamentary_record' | 'official_statement' | 'press_release' | 'video' | 'gazette';
    url: string;
    title: string;
    source: string;
    date: string;
  }[];

  // Verification links for timeline event authenticity
  verification_links?: {
    type: 'fact_check' | 'independent_report' | 'official_record' | 'media_verification' | 'archive_link';
    url: string;
    title: string;
    source: string;
    date: string;
    content_summary: string;
  }[];
}

export interface Commitment {
  id: number;
  politician_id: number;
  promise: string;
  description: string;
  category: string;
  context?: string;
  date_made: string;
  status: 'no_evidence' | 'early_progress' | 'significant_progress' | 'completed' | 'stalled';
  progress_percentage: number; // 0-100
  evidence?: string;
  last_activity_date?: string; // For stalled promises

  // Source links for where the promise was originally reported
  source_links?: {
    type: 'news' | 'speech' | 'manifesto' | 'interview' | 'government_doc';
    url: string;
    title: string;
    source: string;
    date: string;
  }[];

  // Verification links for proof of fulfillment or status
  verification_links?: {
    type: 'news' | 'government_report' | 'official_statement' | 'project_completion' | 'budget_allocation';
    url: string;
    title: string;
    source: string;
    date: string;
    content_summary: string;
  }[];

  related_actions?: {
    action: string;
    date: string;
    source: string;
    connection: string;
  }[];
}

export interface VotingRecord {
  id: number;
  politician_id?: number;
  bill_name: string;
  bill_title?: string;
  bill_number?: string;
  bill_description?: string;
  bill_summary?: string;
  significance?: string;
  vote: 'yes' | 'no' | 'for' | 'against' | 'abstain' | 'absent';
  vote_value?: string;
  date: string;
  vote_date?: string;
  category: string;
  notes?: string;
  reasoning?: string;
  bill_status?: 'Proposed' | 'Under Review' | 'Passed' | 'Rejected' | 'Withdrawn';
  bill_passed?: boolean;
  vote_count_for?: number;
  vote_count_against?: number;
  vote_count_abstain?: number;
  total_votes?: number;
  session?: string;
  session_name?: string;
  hansard_reference?: string;
  created_at?: string;

  // Source links for the voting record
  source_links?: {
    type: 'hansard' | 'news' | 'parliament_website' | 'bill_document' | 'committee_report';
    url: string;
    title: string;
    source: string;
    date: string;
  }[];

  // Verification links for vote confirmation
  verification_links?: {
    type: 'official_record' | 'news_verification' | 'fact_check' | 'vote_tally' | 'independent_report';
    url: string;
    title: string;
    source: string;
    date: string;
    content_summary: string;
  }[];
}