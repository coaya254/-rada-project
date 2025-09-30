export interface VotingRecord {
  id: string;
  politicianId: number;
  politicianName: string;
  billTitle: string;
  billNumber: string;
  billDescription: string;
  category: 'constitutional' | 'economic' | 'social' | 'environmental' | 'security' | 'governance' | 'health' | 'education';
  vote: 'yes' | 'no' | 'abstain' | 'absent';
  date: string;
  session: string;
  house: 'national_assembly' | 'senate' | 'county_assembly';
  partyPosition: 'majority' | 'minority' | 'mixed' | 'unanimous';
  billStatus: 'passed' | 'failed' | 'pending' | 'withdrawn';
  billOutcome: string;
  keyIssues: string[];
  publicImpact: 'high' | 'medium' | 'low';
  controversyLevel: 'high' | 'medium' | 'low';
  mediaCoverage: number; // 1-10 scale
  constituencyReaction: 'supportive' | 'opposed' | 'mixed' | 'neutral';
  explanation?: string;
  relatedBills: string[];
  amendments: Amendment[];
  committeeVotes: CommitteeVote[];
}

export interface Amendment {
  id: string;
  title: string;
  description: string;
  proposer: string;
  vote: 'yes' | 'no' | 'abstain' | 'absent';
  outcome: 'passed' | 'failed';
}

export interface CommitteeVote {
  committee: string;
  stage: 'first_reading' | 'second_reading' | 'third_reading' | 'committee_stage';
  vote: 'yes' | 'no' | 'abstain' | 'absent';
  date: string;
}

export interface VotingStats {
  politicianId: number;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  abstentions: number;
  absences: number;
  attendanceRate: number;
  partyLoyalty: number; // percentage of votes with party majority
  independenceScore: number; // percentage of votes against party
  keyIssueFocus: { [category: string]: number };
  controversialVotes: number;
  highImpactVotes: number;
  recentTrend: 'increasing' | 'decreasing' | 'stable';
  votingPattern: 'party_loyalist' | 'independent' | 'moderate' | 'rebel';
}

export interface BillAnalysis {
  billId: string;
  title: string;
  category: string;
  complexity: 'simple' | 'moderate' | 'complex';
  controversyLevel: 'low' | 'medium' | 'high';
  publicInterest: 'low' | 'medium' | 'high';
  economicImpact: 'positive' | 'negative' | 'neutral' | 'mixed';
  socialImpact: 'positive' | 'negative' | 'neutral' | 'mixed';
  constitutionalImplications: boolean;
  internationalImplications: boolean;
  timeline: {
    introduction: string;
    firstReading: string;
    secondReading: string;
    thirdReading: string;
    presidentialAssent: string;
  };
  sponsors: string[];
  coSponsors: string[];
  opposition: string[];
  publicHearings: number;
  amendmentsCount: number;
  finalVote: {
    yes: number;
    no: number;
    abstain: number;
    absent: number;
  };
}

export interface VotingTrend {
  period: string;
  totalVotes: number;
  attendanceRate: number;
  partyLoyalty: number;
  independenceScore: number;
  keyVotes: VotingRecord[];
  controversialVotes: VotingRecord[];
  categoryBreakdown: { [category: string]: number };
}

export interface ConstituencyFeedback {
  politicianId: number;
  constituency: string;
  billId: string;
  billTitle: string;
  vote: 'yes' | 'no' | 'abstain' | 'absent';
  constituencySupport: number; // percentage
  publicMeetings: number;
  petitions: number;
  socialMediaSentiment: 'positive' | 'negative' | 'mixed' | 'neutral';
  traditionalLeaders: 'supportive' | 'opposed' | 'neutral';
  youthReaction: 'supportive' | 'opposed' | 'mixed' | 'neutral';
  womenReaction: 'supportive' | 'opposed' | 'mixed' | 'neutral';
  businessReaction: 'supportive' | 'opposed' | 'mixed' | 'neutral';
  civilSocietyReaction: 'supportive' | 'opposed' | 'mixed' | 'neutral';
}
