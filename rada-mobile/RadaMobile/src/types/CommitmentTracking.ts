export interface EnhancedCommitment {
  id: string;
  politicianId: number;
  politicianName: string;
  title: string;
  description: string;
  category: 'economic' | 'social' | 'infrastructure' | 'governance' | 'environment' | 'health' | 'education' | 'security' | 'agriculture' | 'technology';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'cancelled' | 'on_hold';
  progress: number; // 0-100
  startDate: string;
  targetDate: string;
  completionDate?: string;
  source: {
    type: 'speech' | 'manifesto' | 'interview' | 'press_release' | 'social_media' | 'official_document';
    title: string;
    date: string;
    url?: string;
    location?: string;
  };
  verification: {
    verified: boolean;
    verifiedBy: string;
    verifiedDate: string;
    methodology: string;
    confidence: 'high' | 'medium' | 'low';
  };
  milestones: Milestone[];
  evidence: Evidence[];
  budget?: {
    estimated: number;
    actual?: number;
    currency: string;
    source: string;
  };
  stakeholders: Stakeholder[];
  challenges: Challenge[];
  achievements: Achievement[];
  publicReaction: PublicReaction;
  mediaCoverage: MediaCoverage[];
  relatedCommitments: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  progress: number;
  dependencies: string[];
  responsible: string;
  evidence?: Evidence[];
}

export interface Evidence {
  id: string;
  type: 'document' | 'photo' | 'video' | 'audio' | 'link' | 'report' | 'testimonial';
  title: string;
  description: string;
  url?: string;
  filePath?: string;
  date: string;
  source: string;
  verified: boolean;
  confidence: 'high' | 'medium' | 'low';
  submittedBy: string;
  submittedDate: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  type: 'government' | 'private_sector' | 'ngo' | 'community' | 'international' | 'media';
  role: 'implementer' | 'supporter' | 'critic' | 'observer' | 'beneficiary';
  contact?: string;
  influence: 'high' | 'medium' | 'low';
  stance: 'supportive' | 'neutral' | 'opposed';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'budgetary' | 'political' | 'technical' | 'logistical' | 'legal' | 'social';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'resolved' | 'mitigated' | 'escalated';
  impact: string;
  mitigation: string;
  reportedDate: string;
  resolvedDate?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'deliverable' | 'recognition' | 'impact';
  date: string;
  evidence: Evidence[];
  impact: string;
  beneficiaries: number;
  verified: boolean;
}

export interface PublicReaction {
  overall: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  socialMedia: {
    sentiment: 'positive' | 'neutral' | 'negative';
    mentions: number;
    engagement: number;
  };
  surveys: {
    support: number; // percentage
    opposition: number; // percentage
    sampleSize: number;
    date: string;
  };
  petitions: {
    supportive: number;
    opposed: number;
  };
  media: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface MediaCoverage {
  id: string;
  title: string;
  outlet: string;
  type: 'news' | 'opinion' | 'analysis' | 'investigation';
  sentiment: 'positive' | 'neutral' | 'negative';
  date: string;
  url: string;
  reach: number;
  engagement: number;
}

export interface CommitmentAnalytics {
  politicianId: number;
  totalCommitments: number;
  completedCommitments: number;
  inProgressCommitments: number;
  delayedCommitments: number;
  cancelledCommitments: number;
  completionRate: number;
  averageProgress: number;
  onTimeRate: number;
  categoryBreakdown: { [category: string]: number };
  priorityBreakdown: { [priority: string]: number };
  statusBreakdown: { [status: string]: number };
  budgetUtilization: number;
  publicSatisfaction: number;
  mediaSentiment: 'positive' | 'neutral' | 'negative';
  topPerformingCategories: string[];
  challengesFaced: number;
  achievements: number;
  evidenceCount: number;
  stakeholderEngagement: number;
}

export interface CommitmentTrend {
  period: string;
  commitments: number;
  completions: number;
  progress: number;
  publicSatisfaction: number;
  mediaSentiment: number;
  budgetUtilization: number;
  challenges: number;
  achievements: number;
}

export interface CommitmentFilter {
  politicianId?: number;
  category?: string;
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  progressMin?: number;
  progressMax?: number;
  verified?: boolean;
  tags?: string[];
}

export interface CommitmentSearch {
  query: string;
  filters: CommitmentFilter;
  sortBy: 'date' | 'progress' | 'priority' | 'status' | 'title';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}
