import { Politician } from './politician';

export interface ComparisonMetrics {
  experience: { [key: number]: number };
  achievements: { [key: number]: number };
  education: { [key: number]: number };
  partyStability: { [key: number]: number };
  publicEngagement: { [key: number]: number };
}

export interface ComparisonData {
  politicians: Politician[];
  comparisonMetrics: ComparisonMetrics;
}

export interface ComparisonCategory {
  id: string;
  title: string;
  description: string;
  weight: number;
}

export interface ComparisonScore {
  politicianId: number;
  category: string;
  score: number;
  details: string[];
}