import { 
  EnhancedCommitment, 
  CommitmentAnalytics, 
  CommitmentTrend, 
  CommitmentFilter,
  Milestone,
  Evidence,
  Stakeholder,
  Challenge,
  Achievement,
  PublicReaction,
  MediaCoverage
} from '../types/CommitmentTracking';

class EnhancedCommitmentService {
  private static commitments: EnhancedCommitment[] = [];
  private static initialized = false;

  /**
   * Initialize sample commitment data
   */
  static initializeSampleData(): void {
    if (this.initialized) return;
    
    this.commitments = this.generateSampleCommitments();
    this.initialized = true;
  }

  /**
   * Get all commitments with optional filtering
   */
  static getCommitments(filters?: CommitmentFilter): EnhancedCommitment[] {
    let filteredCommitments = [...this.commitments];

    if (filters) {
      if (filters.politicianId) {
        filteredCommitments = filteredCommitments.filter(c => c.politicianId === filters.politicianId);
      }
      if (filters.category) {
        filteredCommitments = filteredCommitments.filter(c => c.category === filters.category);
      }
      if (filters.status) {
        filteredCommitments = filteredCommitments.filter(c => c.status === filters.status);
      }
      if (filters.priority) {
        filteredCommitments = filteredCommitments.filter(c => c.priority === filters.priority);
      }
      if (filters.dateFrom) {
        filteredCommitments = filteredCommitments.filter(c => c.startDate >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filteredCommitments = filteredCommitments.filter(c => c.startDate <= filters.dateTo!);
      }
      if (filters.progressMin !== undefined) {
        filteredCommitments = filteredCommitments.filter(c => c.progress >= filters.progressMin!);
      }
      if (filters.progressMax !== undefined) {
        filteredCommitments = filteredCommitments.filter(c => c.progress <= filters.progressMax!);
      }
      if (filters.verified !== undefined) {
        filteredCommitments = filteredCommitments.filter(c => c.verification.verified === filters.verified);
      }
      if (filters.tags && filters.tags.length > 0) {
        filteredCommitments = filteredCommitments.filter(c => 
          filters.tags!.some(tag => c.tags.includes(tag))
        );
      }
    }

    return filteredCommitments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get commitment by ID
   */
  static getCommitment(id: string): EnhancedCommitment | undefined {
    return this.commitments.find(c => c.id === id);
  }

  /**
   * Get commitment analytics for a politician
   */
  static getCommitmentAnalytics(politicianId: number): CommitmentAnalytics {
    const politicianCommitments = this.commitments.filter(c => c.politicianId === politicianId);
    
    const totalCommitments = politicianCommitments.length;
    const completedCommitments = politicianCommitments.filter(c => c.status === 'completed').length;
    const inProgressCommitments = politicianCommitments.filter(c => c.status === 'in_progress').length;
    const delayedCommitments = politicianCommitments.filter(c => c.status === 'delayed').length;
    const cancelledCommitments = politicianCommitments.filter(c => c.status === 'cancelled').length;
    
    const completionRate = totalCommitments > 0 ? (completedCommitments / totalCommitments) * 100 : 0;
    const averageProgress = totalCommitments > 0 
      ? politicianCommitments.reduce((sum, c) => sum + c.progress, 0) / totalCommitments 
      : 0;
    
    const onTimeCommitments = politicianCommitments.filter(c => {
      if (c.status === 'completed' && c.completionDate) {
        return new Date(c.completionDate) <= new Date(c.targetDate);
      }
      return false;
    }).length;
    const onTimeRate = completedCommitments > 0 ? (onTimeCommitments / completedCommitments) * 100 : 0;

    // Category breakdown
    const categoryBreakdown: { [category: string]: number } = {};
    politicianCommitments.forEach(c => {
      categoryBreakdown[c.category] = (categoryBreakdown[c.category] || 0) + 1;
    });

    // Priority breakdown
    const priorityBreakdown: { [priority: string]: number } = {};
    politicianCommitments.forEach(c => {
      priorityBreakdown[c.priority] = (priorityBreakdown[c.priority] || 0) + 1;
    });

    // Status breakdown
    const statusBreakdown: { [status: string]: number } = {};
    politicianCommitments.forEach(c => {
      statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1;
    });

    // Budget utilization
    const budgetCommitments = politicianCommitments.filter(c => c.budget);
    const budgetUtilization = budgetCommitments.length > 0 
      ? budgetCommitments.reduce((sum, c) => {
          if (c.budget?.actual && c.budget?.estimated) {
            return sum + (c.budget.actual / c.budget.estimated);
          }
          return sum;
        }, 0) / budgetCommitments.length * 100
      : 0;

    // Public satisfaction (average of all commitments)
    const publicSatisfaction = politicianCommitments.length > 0
      ? politicianCommitments.reduce((sum, c) => {
          const reaction = c.publicReaction.overall;
          const score = reaction === 'very_positive' ? 100 : 
                       reaction === 'positive' ? 75 :
                       reaction === 'neutral' ? 50 :
                       reaction === 'negative' ? 25 : 0;
          return sum + score;
        }, 0) / politicianCommitments.length
      : 0;

    // Media sentiment
    const mediaSentiment = politicianCommitments.length > 0
      ? politicianCommitments.reduce((sum, c) => {
          const sentiment = c.mediaCoverage.reduce((s, m) => {
            return s + (m.sentiment === 'positive' ? 1 : m.sentiment === 'negative' ? -1 : 0);
          }, 0);
          return sum + (sentiment > 0 ? 1 : sentiment < 0 ? -1 : 0);
        }, 0) / politicianCommitments.length
      : 0;

    const topPerformingCategories = Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    const challengesFaced = politicianCommitments.reduce((sum, c) => sum + c.challenges.length, 0);
    const achievements = politicianCommitments.reduce((sum, c) => sum + c.achievements.length, 0);
    const evidenceCount = politicianCommitments.reduce((sum, c) => sum + c.evidence.length, 0);
    const stakeholderEngagement = politicianCommitments.reduce((sum, c) => sum + c.stakeholders.length, 0);

    return {
      politicianId,
      totalCommitments,
      completedCommitments,
      inProgressCommitments,
      delayedCommitments,
      cancelledCommitments,
      completionRate,
      averageProgress,
      onTimeRate,
      categoryBreakdown,
      priorityBreakdown,
      statusBreakdown,
      budgetUtilization,
      publicSatisfaction,
      mediaSentiment: mediaSentiment > 0 ? 'positive' : mediaSentiment < 0 ? 'negative' : 'neutral',
      topPerformingCategories,
      challengesFaced,
      achievements,
      evidenceCount,
      stakeholderEngagement,
    };
  }

  /**
   * Get commitment trends over time
   */
  static getCommitmentTrends(politicianId: number, period: 'month' | 'quarter' | 'year' = 'quarter'): CommitmentTrend[] {
    const commitments = this.commitments.filter(c => c.politicianId === politicianId);
    
    // Group by period
    const grouped: { [key: string]: EnhancedCommitment[] } = {};
    
    commitments.forEach(commitment => {
      const date = new Date(commitment.startDate);
      let periodKey = '';
      
      switch (period) {
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          periodKey = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'year':
          periodKey = String(date.getFullYear());
          break;
      }
      
      if (!grouped[periodKey]) {
        grouped[periodKey] = [];
      }
      grouped[periodKey].push(commitment);
    });

    return Object.entries(grouped).map(([period, periodCommitments]) => {
      const completions = periodCommitments.filter(c => c.status === 'completed').length;
      const progress = periodCommitments.length > 0 
        ? periodCommitments.reduce((sum, c) => sum + c.progress, 0) / periodCommitments.length 
        : 0;
      
      const publicSatisfaction = periodCommitments.length > 0
        ? periodCommitments.reduce((sum, c) => {
            const reaction = c.publicReaction.overall;
            const score = reaction === 'very_positive' ? 100 : 
                         reaction === 'positive' ? 75 :
                         reaction === 'neutral' ? 50 :
                         reaction === 'negative' ? 25 : 0;
            return sum + score;
          }, 0) / periodCommitments.length
        : 0;

      const mediaSentiment = periodCommitments.length > 0
        ? periodCommitments.reduce((sum, c) => {
            const sentiment = c.mediaCoverage.reduce((s, m) => {
              return s + (m.sentiment === 'positive' ? 1 : m.sentiment === 'negative' ? -1 : 0);
            }, 0);
            return sum + (sentiment > 0 ? 1 : sentiment < 0 ? -1 : 0);
          }, 0) / periodCommitments.length
        : 0;

      const budgetUtilization = periodCommitments.filter(c => c.budget).length > 0
        ? periodCommitments.filter(c => c.budget).reduce((sum, c) => {
            if (c.budget?.actual && c.budget?.estimated) {
              return sum + (c.budget.actual / c.budget.estimated);
            }
            return sum;
          }, 0) / periodCommitments.filter(c => c.budget).length * 100
        : 0;

      const challenges = periodCommitments.reduce((sum, c) => sum + c.challenges.length, 0);
      const achievements = periodCommitments.reduce((sum, c) => sum + c.achievements.length, 0);

      return {
        period,
        commitments: periodCommitments.length,
        completions,
        progress,
        publicSatisfaction,
        mediaSentiment,
        budgetUtilization,
        challenges,
        achievements,
      };
    }).sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Search commitments
   */
  static searchCommitments(query: string, filters?: CommitmentFilter): EnhancedCommitment[] {
    const filteredCommitments = this.getCommitments(filters);
    const searchTerm = query.toLowerCase();
    
    return filteredCommitments.filter(commitment =>
      commitment.title.toLowerCase().includes(searchTerm) ||
      commitment.description.toLowerCase().includes(searchTerm) ||
      commitment.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      commitment.politicianName.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Add new commitment
   */
  static addCommitment(commitment: Omit<EnhancedCommitment, 'id' | 'createdAt' | 'updatedAt'>): EnhancedCommitment {
    const newCommitment: EnhancedCommitment = {
      ...commitment,
      id: `commitment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.commitments.push(newCommitment);
    return newCommitment;
  }

  /**
   * Update commitment
   */
  static updateCommitment(id: string, updates: Partial<EnhancedCommitment>): EnhancedCommitment | null {
    const index = this.commitments.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.commitments[index] = {
      ...this.commitments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    return this.commitments[index];
  }

  /**
   * Delete commitment
   */
  static deleteCommitment(id: string): boolean {
    const index = this.commitments.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.commitments.splice(index, 1);
    return true;
  }

  // Private helper methods

  private static generateSampleCommitments(): EnhancedCommitment[] {
    return [
      {
        id: 'commitment_1',
        politicianId: 1,
        politicianName: 'William Ruto',
        title: 'Bottom-up Economic Transformation',
        description: 'Implement a bottom-up economic model that prioritizes grassroots development and empowers local communities through increased county funding and devolution.',
        category: 'economic',
        priority: 'critical',
        status: 'in_progress',
        progress: 65,
        startDate: '2022-09-13',
        targetDate: '2027-09-13',
        source: {
          type: 'manifesto',
          title: 'UDA Manifesto 2022',
          date: '2022-08-01',
          url: 'https://uda.ke/manifesto',
          location: 'Nairobi',
        },
        verification: {
          verified: true,
          verifiedBy: 'Rada Fact-Check Team',
          verifiedDate: '2022-09-15',
          methodology: 'Document analysis and cross-referencing',
          confidence: 'high',
        },
        milestones: [
          {
            id: 'milestone_1',
            title: 'Increase County Revenue Allocation',
            description: 'Raise county revenue allocation from 15% to 20%',
            targetDate: '2023-12-31',
            status: 'completed',
            progress: 100,
            dependencies: [],
            responsible: 'National Treasury',
            evidence: [],
          },
          {
            id: 'milestone_2',
            title: 'Establish County Development Fund',
            description: 'Create dedicated fund for grassroots projects',
            targetDate: '2024-06-30',
            status: 'in_progress',
            progress: 40,
            dependencies: ['milestone_1'],
            responsible: 'Ministry of Devolution',
            evidence: [],
          },
        ],
        evidence: [
          {
            id: 'evidence_1',
            type: 'document',
            title: 'Constitutional Amendment Bill 2023',
            description: 'Legislation to increase county revenue allocation',
            url: 'https://parliament.go.ke/bills/2023/001',
            date: '2023-11-15',
            source: 'National Assembly',
            verified: true,
            confidence: 'high',
            submittedBy: 'Rada Research Team',
            submittedDate: '2023-11-16',
          },
        ],
        budget: {
          estimated: 5000000000, // 5 billion KES
          actual: 3200000000, // 3.2 billion KES
          currency: 'KES',
          source: 'National Treasury Budget 2023-2024',
        },
        stakeholders: [
          {
            id: 'stakeholder_1',
            name: 'County Governments',
            type: 'government',
            role: 'implementer',
            influence: 'high',
            stance: 'supportive',
          },
          {
            id: 'stakeholder_2',
            name: 'National Treasury',
            type: 'government',
            role: 'implementer',
            influence: 'high',
            stance: 'supportive',
          },
        ],
        challenges: [
          {
            id: 'challenge_1',
            title: 'Budget Constraints',
            description: 'Limited fiscal space due to high debt levels',
            type: 'budgetary',
            severity: 'high',
            status: 'active',
            impact: 'Delayed implementation of some projects',
            mitigation: 'Phased implementation approach',
            reportedDate: '2023-03-15',
          },
        ],
        achievements: [
          {
            id: 'achievement_1',
            title: 'Constitutional Amendment Passed',
            description: 'Successfully passed constitutional amendment for county revenue increase',
            type: 'milestone',
            date: '2023-11-15',
            evidence: [],
            impact: 'Increased county funding by 5%',
            beneficiaries: 47000000, // 47 million Kenyans
            verified: true,
          },
        ],
        publicReaction: {
          overall: 'positive',
          socialMedia: {
            sentiment: 'positive',
            mentions: 15420,
            engagement: 8920,
          },
          surveys: {
            support: 68,
            opposition: 22,
            sampleSize: 2000,
            date: '2023-12-01',
          },
          petitions: {
            supportive: 1250,
            opposed: 340,
          },
          media: {
            positive: 45,
            neutral: 35,
            negative: 20,
          },
        },
        mediaCoverage: [
          {
            id: 'media_1',
            title: 'Ruto\'s Bottom-up Model Gains Traction',
            outlet: 'Daily Nation',
            type: 'news',
            sentiment: 'positive',
            date: '2023-11-20',
            url: 'https://nation.africa/kenya/news/bottom-up-model',
            reach: 500000,
            engagement: 25000,
          },
        ],
        relatedCommitments: ['commitment_2'],
        tags: ['devolution', 'economic-transformation', 'county-development'],
        createdAt: '2022-09-13T00:00:00Z',
        updatedAt: '2023-12-01T10:30:00Z',
      },
      {
        id: 'commitment_2',
        politicianId: 1,
        politicianName: 'William Ruto',
        title: 'Digital Services Tax Implementation',
        description: 'Introduce and implement a 1.5% tax on digital services to generate revenue from the digital economy.',
        category: 'economic',
        priority: 'high',
        status: 'completed',
        progress: 100,
        startDate: '2023-01-01',
        targetDate: '2023-12-31',
        completionDate: '2023-10-15',
        source: {
          type: 'speech',
          title: 'State of the Nation Address 2023',
          date: '2023-01-15',
          location: 'Parliament Buildings',
        },
        verification: {
          verified: true,
          verifiedBy: 'KRA Digital Services Unit',
          verifiedDate: '2023-10-20',
          methodology: 'Implementation verification and revenue tracking',
          confidence: 'high',
        },
        milestones: [
          {
            id: 'milestone_3',
            title: 'Legislation Enactment',
            description: 'Pass Digital Services Tax Bill',
            targetDate: '2023-06-30',
            status: 'completed',
            progress: 100,
            dependencies: [],
            responsible: 'National Assembly',
            evidence: [],
          },
          {
            id: 'milestone_4',
            title: 'System Implementation',
            description: 'Deploy digital tax collection system',
            targetDate: '2023-09-30',
            status: 'completed',
            progress: 100,
            dependencies: ['milestone_3'],
            responsible: 'KRA',
            evidence: [],
          },
        ],
        evidence: [
          {
            id: 'evidence_2',
            type: 'report',
            title: 'Digital Services Tax Revenue Report',
            description: 'Q3 2023 revenue collection report',
            url: 'https://kra.go.ke/reports/dst-q3-2023',
            date: '2023-10-31',
            source: 'Kenya Revenue Authority',
            verified: true,
            confidence: 'high',
            submittedBy: 'KRA Digital Services Unit',
            submittedDate: '2023-11-01',
          },
        ],
        budget: {
          estimated: 500000000, // 500 million KES
          actual: 480000000, // 480 million KES
          currency: 'KES',
          source: 'KRA Revenue Collection Report',
        },
        stakeholders: [
          {
            id: 'stakeholder_3',
            name: 'Tech Companies',
            type: 'private_sector',
            role: 'implementer',
            influence: 'medium',
            stance: 'neutral',
          },
          {
            id: 'stakeholder_4',
            name: 'KRA',
            type: 'government',
            role: 'implementer',
            influence: 'high',
            stance: 'supportive',
          },
        ],
        challenges: [],
        achievements: [
          {
            id: 'achievement_2',
            title: 'Revenue Target Exceeded',
            description: 'Collected 96% of projected revenue in first year',
            type: 'deliverable',
            date: '2023-10-31',
            evidence: [],
            impact: 'Generated 480M KES in additional revenue',
            beneficiaries: 50000000, // 50 million Kenyans
            verified: true,
          },
        ],
        publicReaction: {
          overall: 'neutral',
          socialMedia: {
            sentiment: 'neutral',
            mentions: 8920,
            engagement: 4200,
          },
          surveys: {
            support: 45,
            opposition: 35,
            sampleSize: 1500,
            date: '2023-11-01',
          },
          petitions: {
            supportive: 450,
            opposed: 380,
          },
          media: {
            positive: 30,
            neutral: 50,
            negative: 20,
          },
        },
        mediaCoverage: [
          {
            id: 'media_2',
            title: 'Digital Tax Collection Surpasses Expectations',
            outlet: 'Business Daily',
            type: 'analysis',
            sentiment: 'positive',
            date: '2023-11-05',
            url: 'https://businessdailyafrica.com/digital-tax',
            reach: 150000,
            engagement: 8500,
          },
        ],
        relatedCommitments: ['commitment_1'],
        tags: ['digital-economy', 'taxation', 'revenue-generation'],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-10-15T14:20:00Z',
      },
    ];
  }
}

export default EnhancedCommitmentService;
