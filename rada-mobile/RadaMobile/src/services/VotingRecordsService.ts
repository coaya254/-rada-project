import { VotingRecord, VotingStats, BillAnalysis, VotingTrend, ConstituencyFeedback } from '../types/VotingRecords';

class VotingRecordsService {
  private static votingRecords: VotingRecord[] = [];
  private static billAnalyses: BillAnalysis[] = [];
  private static constituencyFeedbacks: ConstituencyFeedback[] = [];

  /**
   * Initialize sample voting data
   */
  static initializeSampleData(): void {
    this.votingRecords = this.generateSampleVotingRecords();
    this.billAnalyses = this.generateSampleBillAnalyses();
    this.constituencyFeedbacks = this.generateSampleConstituencyFeedback();
  }

  /**
   * Get voting records for a specific politician
   */
  static getVotingRecords(politicianId: number, filters?: {
    category?: string;
    vote?: string;
    dateFrom?: string;
    dateTo?: string;
    house?: string;
  }): VotingRecord[] {
    let records = this.votingRecords.filter(record => record.politicianId === politicianId);

    if (filters) {
      if (filters.category) {
        records = records.filter(record => record.category === filters.category);
      }
      if (filters.vote) {
        records = records.filter(record => record.vote === filters.vote);
      }
      if (filters.dateFrom) {
        records = records.filter(record => record.date >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        records = records.filter(record => record.date <= filters.dateTo!);
      }
      if (filters.house) {
        records = records.filter(record => record.house === filters.house);
      }
    }

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Get voting statistics for a politician
   */
  static getVotingStats(politicianId: number): VotingStats {
    const records = this.votingRecords.filter(record => record.politicianId === politicianId);
    
    const totalVotes = records.length;
    const yesVotes = records.filter(r => r.vote === 'yes').length;
    const noVotes = records.filter(r => r.vote === 'no').length;
    const abstentions = records.filter(r => r.vote === 'abstain').length;
    const absences = records.filter(r => r.vote === 'absent').length;
    
    const attendanceRate = totalVotes > 0 ? ((totalVotes - absences) / totalVotes) * 100 : 0;
    
    // Calculate party loyalty (simplified)
    const partyLoyalty = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
    const independenceScore = 100 - partyLoyalty;
    
    // Calculate key issue focus
    const keyIssueFocus: { [category: string]: number } = {};
    records.forEach(record => {
      keyIssueFocus[record.category] = (keyIssueFocus[record.category] || 0) + 1;
    });
    
    const controversialVotes = records.filter(r => r.controversyLevel === 'high').length;
    const highImpactVotes = records.filter(r => r.publicImpact === 'high').length;
    
    // Determine voting pattern
    let votingPattern: 'party_loyalist' | 'independent' | 'moderate' | 'rebel' = 'moderate';
    if (partyLoyalty > 80) votingPattern = 'party_loyalist';
    else if (partyLoyalty < 40) votingPattern = 'rebel';
    else if (independenceScore > 60) votingPattern = 'independent';
    
    return {
      politicianId,
      totalVotes,
      yesVotes,
      noVotes,
      abstentions,
      absences,
      attendanceRate,
      partyLoyalty,
      independenceScore,
      keyIssueFocus,
      controversialVotes,
      highImpactVotes,
      recentTrend: 'stable',
      votingPattern,
    };
  }

  /**
   * Get voting trends over time
   */
  static getVotingTrends(politicianId: number, period: 'month' | 'quarter' | 'year' = 'quarter'): VotingTrend[] {
    const records = this.votingRecords.filter(record => record.politicianId === politicianId);
    
    // Group records by period
    const groupedRecords: { [key: string]: VotingRecord[] } = {};
    
    records.forEach(record => {
      const date = new Date(record.date);
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
      
      if (!groupedRecords[periodKey]) {
        groupedRecords[periodKey] = [];
      }
      groupedRecords[periodKey].push(record);
    });
    
    return Object.entries(groupedRecords).map(([period, periodRecords]) => {
      const stats = this.calculatePeriodStats(periodRecords);
      return {
        period,
        totalVotes: periodRecords.length,
        attendanceRate: stats.attendanceRate,
        partyLoyalty: stats.partyLoyalty,
        independenceScore: stats.independenceScore,
        keyVotes: periodRecords.filter(r => r.publicImpact === 'high'),
        controversialVotes: periodRecords.filter(r => r.controversyLevel === 'high'),
        categoryBreakdown: stats.categoryBreakdown,
      };
    }).sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Get bill analysis
   */
  static getBillAnalysis(billId: string): BillAnalysis | undefined {
    return this.billAnalyses.find(bill => bill.billId === billId);
  }

  /**
   * Get constituency feedback for a politician
   */
  static getConstituencyFeedback(politicianId: number): ConstituencyFeedback[] {
    return this.constituencyFeedbacks.filter(feedback => feedback.politicianId === politicianId);
  }

  /**
   * Search voting records
   */
  static searchVotingRecords(query: string, politicianId?: number): VotingRecord[] {
    let records = politicianId 
      ? this.votingRecords.filter(record => record.politicianId === politicianId)
      : this.votingRecords;
    
    const searchTerm = query.toLowerCase();
    return records.filter(record => 
      record.billTitle.toLowerCase().includes(searchTerm) ||
      record.billDescription.toLowerCase().includes(searchTerm) ||
      record.keyIssues.some(issue => issue.toLowerCase().includes(searchTerm))
    );
  }

  // Private helper methods

  private static calculatePeriodStats(records: VotingRecord[]): {
    attendanceRate: number;
    partyLoyalty: number;
    independenceScore: number;
    categoryBreakdown: { [category: string]: number };
  } {
    const totalVotes = records.length;
    const absences = records.filter(r => r.vote === 'absent').length;
    const attendanceRate = totalVotes > 0 ? ((totalVotes - absences) / totalVotes) * 100 : 0;
    
    const yesVotes = records.filter(r => r.vote === 'yes').length;
    const partyLoyalty = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
    const independenceScore = 100 - partyLoyalty;
    
    const categoryBreakdown: { [category: string]: number } = {};
    records.forEach(record => {
      categoryBreakdown[record.category] = (categoryBreakdown[record.category] || 0) + 1;
    });
    
    return {
      attendanceRate,
      partyLoyalty,
      independenceScore,
      categoryBreakdown,
    };
  }

  private static generateSampleVotingRecords(): VotingRecord[] {
    return [
      {
        id: '1',
        politicianId: 1,
        politicianName: 'William Ruto',
        billTitle: 'Constitutional Amendment Bill 2023',
        billNumber: 'Bills/2023/001',
        billDescription: 'Amendment to increase county revenue allocation from 15% to 20%',
        category: 'constitutional',
        vote: 'yes',
        date: '2023-11-15',
        session: '2023-2024',
        house: 'national_assembly',
        partyPosition: 'majority',
        billStatus: 'passed',
        billOutcome: 'Passed with 180 votes in favor',
        keyIssues: ['devolution', 'county funding', 'constitutional amendment'],
        publicImpact: 'high',
        controversyLevel: 'high',
        mediaCoverage: 9,
        constituencyReaction: 'supportive',
        explanation: 'Supports increased devolution and county autonomy',
        relatedBills: ['Bills/2023/002', 'Bills/2023/003'],
        amendments: [],
        committeeVotes: [],
      },
      {
        id: '2',
        politicianId: 1,
        politicianName: 'William Ruto',
        billTitle: 'Digital Services Tax Bill 2023',
        billNumber: 'Bills/2023/015',
        billDescription: 'Introduction of 1.5% tax on digital services',
        category: 'economic',
        vote: 'yes',
        date: '2023-10-20',
        session: '2023-2024',
        house: 'national_assembly',
        partyPosition: 'majority',
        billStatus: 'passed',
        billOutcome: 'Passed with 165 votes in favor',
        keyIssues: ['digital economy', 'taxation', 'revenue generation'],
        publicImpact: 'medium',
        controversyLevel: 'medium',
        mediaCoverage: 6,
        constituencyReaction: 'mixed',
        explanation: 'Supports digital economy taxation for revenue generation',
        relatedBills: ['Bills/2023/016'],
        amendments: [],
        committeeVotes: [],
      },
      {
        id: '3',
        politicianId: 2,
        politicianName: 'Raila Odinga',
        billTitle: 'Constitutional Amendment Bill 2023',
        billNumber: 'Bills/2023/001',
        billDescription: 'Amendment to increase county revenue allocation from 15% to 20%',
        category: 'constitutional',
        vote: 'no',
        date: '2023-11-15',
        session: '2023-2024',
        house: 'national_assembly',
        partyPosition: 'minority',
        billStatus: 'passed',
        billOutcome: 'Passed with 180 votes in favor',
        keyIssues: ['devolution', 'county funding', 'constitutional amendment'],
        publicImpact: 'high',
        controversyLevel: 'high',
        mediaCoverage: 9,
        constituencyReaction: 'opposed',
        explanation: 'Opposes the amendment citing inadequate safeguards',
        relatedBills: ['Bills/2023/002', 'Bills/2023/003'],
        amendments: [],
        committeeVotes: [],
      },
      {
        id: '4',
        politicianId: 3,
        politicianName: 'Martha Karua',
        billTitle: 'Gender Equality Bill 2023',
        billNumber: 'Bills/2023/008',
        billDescription: 'Legislation to ensure 50-50 gender representation in public offices',
        category: 'social',
        vote: 'yes',
        date: '2023-09-10',
        session: '2023-2024',
        house: 'national_assembly',
        partyPosition: 'unanimous',
        billStatus: 'passed',
        billOutcome: 'Passed unanimously with 200 votes',
        keyIssues: ['gender equality', 'representation', 'women rights'],
        publicImpact: 'high',
        controversyLevel: 'low',
        mediaCoverage: 8,
        constituencyReaction: 'supportive',
        explanation: 'Strong advocate for gender equality and women representation',
        relatedBills: ['Bills/2023/009'],
        amendments: [],
        committeeVotes: [],
      },
      {
        id: '5',
        politicianId: 4,
        politicianName: 'Uhuru Kenyatta',
        billTitle: 'Climate Change Action Bill 2023',
        billNumber: 'Bills/2023/012',
        billDescription: 'Comprehensive climate change mitigation and adaptation measures',
        category: 'environmental',
        vote: 'yes',
        date: '2023-08-25',
        session: '2023-2024',
        house: 'national_assembly',
        partyPosition: 'majority',
        billStatus: 'passed',
        billOutcome: 'Passed with 190 votes in favor',
        keyIssues: ['climate change', 'environment', 'sustainability'],
        publicImpact: 'high',
        controversyLevel: 'medium',
        mediaCoverage: 7,
        constituencyReaction: 'supportive',
        explanation: 'Supports environmental protection and climate action',
        relatedBills: ['Bills/2023/013', 'Bills/2023/014'],
        amendments: [],
        committeeVotes: [],
      },
    ];
  }

  private static generateSampleBillAnalyses(): BillAnalysis[] {
    return [
      {
        billId: 'Bills/2023/001',
        title: 'Constitutional Amendment Bill 2023',
        category: 'constitutional',
        complexity: 'complex',
        controversyLevel: 'high',
        publicInterest: 'high',
        economicImpact: 'positive',
        socialImpact: 'positive',
        constitutionalImplications: true,
        internationalImplications: false,
        timeline: {
          introduction: '2023-08-01',
          firstReading: '2023-08-15',
          secondReading: '2023-10-01',
          thirdReading: '2023-11-15',
          presidentialAssent: '2023-12-01',
        },
        sponsors: ['William Ruto', 'Musalia Mudavadi'],
        coSponsors: ['Anne Waiguru', 'Eugene Wamalwa'],
        opposition: ['Raila Odinga', 'Kalonzo Musyoka'],
        publicHearings: 5,
        amendmentsCount: 12,
        finalVote: {
          yes: 180,
          no: 120,
          abstain: 0,
          absent: 0,
        },
      },
    ];
  }

  private static generateSampleConstituencyFeedback(): ConstituencyFeedback[] {
    return [
      {
        politicianId: 1,
        constituency: 'Sugoi',
        billId: 'Bills/2023/001',
        billTitle: 'Constitutional Amendment Bill 2023',
        vote: 'yes',
        constituencySupport: 75,
        publicMeetings: 3,
        petitions: 2,
        socialMediaSentiment: 'positive',
        traditionalLeaders: 'supportive',
        youthReaction: 'supportive',
        womenReaction: 'supportive',
        businessReaction: 'supportive',
        civilSocietyReaction: 'mixed',
      },
    ];
  }
}

export default VotingRecordsService;
