// ============================================
// FILE: data/documents.js
// Sample political documents data
// ============================================

export const documents = [
  {
    id: 1,
    politicianId: 1,
    politicianName: 'Alexandria Ocasio-Cortez',
    title: 'Green New Deal Resolution - Full Legislative Text',
    type: 'bill',
    date: '2024-02-14',
    summary: 'Comprehensive legislation addressing climate change and economic inequality through job creation, renewable energy investment, and social programs.',
    source: 'Congressional Record',
    tags: ['climate', 'jobs', 'renewable-energy', 'social-policy'],
    fileUrl: 'https://example.com/green-new-deal.pdf',
    category: 'Climate & Environment'
  },
  {
    id: 2,
    politicianId: 1,
    politicianName: 'Alexandria Ocasio-Cortez',
    title: 'Medicare for All Co-Sponsorship Statement',
    type: 'statement',
    date: '2024-01-20',
    summary: 'Official statement outlining support for universal healthcare and detailed policy positions on healthcare reform.',
    source: 'House of Representatives',
    tags: ['healthcare', 'medicare', 'social-programs'],
    fileUrl: 'https://example.com/medicare-statement.pdf',
    category: 'Healthcare'
  },
  {
    id: 3,
    politicianId: 2,
    politicianName: 'Ron DeSantis',
    title: 'Florida Education Reform Bill - SB 1234',
    type: 'bill',
    date: '2024-03-01',
    summary: 'Education legislation focused on parental rights, curriculum transparency, and school choice expansion across Florida.',
    source: 'Florida Legislature',
    tags: ['education', 'parental-rights', 'school-choice'],
    fileUrl: 'https://example.com/fl-education.pdf',
    category: 'Education'
  },
  {
    id: 4,
    politicianId: 2,
    politicianName: 'Ron DeSantis',
    title: 'State of the State Address 2024',
    type: 'speech',
    date: '2024-01-09',
    summary: 'Annual address covering Florida\'s economic growth, education initiatives, and policy priorities for the upcoming year.',
    source: 'Office of the Governor',
    tags: ['economy', 'education', 'governance'],
    fileUrl: 'https://example.com/state-of-state.pdf',
    category: 'Government Operations'
  },
  {
    id: 5,
    politicianId: 3,
    politicianName: 'Pete Buttigieg',
    title: 'Infrastructure Investment Report - Q1 2024',
    type: 'report',
    date: '2024-01-15',
    summary: 'Quarterly progress report on infrastructure spending, project completions, and job creation across transportation sectors.',
    source: 'Department of Transportation',
    tags: ['infrastructure', 'transportation', 'jobs'],
    fileUrl: 'https://example.com/infrastructure-report.pdf',
    category: 'Infrastructure'
  },
  {
    id: 6,
    politicianId: 3,
    politicianName: 'Pete Buttigieg',
    title: 'Electric Vehicle Charging Network Expansion Plan',
    type: 'policy',
    date: '2024-02-28',
    summary: 'Comprehensive plan for nationwide EV charging infrastructure deployment and clean transportation initiatives.',
    source: 'Department of Transportation',
    tags: ['climate', 'transportation', 'electric-vehicles'],
    fileUrl: 'https://example.com/ev-plan.pdf',
    category: 'Transportation & Climate'
  },
  {
    id: 7,
    politicianId: 4,
    politicianName: 'Bernie Sanders',
    title: 'College for All Act - Legislative Proposal',
    type: 'bill',
    date: '2024-01-25',
    summary: 'Legislation to eliminate tuition and fees at public colleges and universities, funded through Wall Street transaction tax.',
    source: 'U.S. Senate',
    tags: ['education', 'student-debt', 'higher-education'],
    fileUrl: 'https://example.com/college-for-all.pdf',
    category: 'Education & Student Debt'
  },
  {
    id: 8,
    politicianId: 4,
    politicianName: 'Bernie Sanders',
    title: 'Prescription Drug Pricing Reform Hearing Testimony',
    type: 'testimony',
    date: '2024-02-10',
    summary: 'Senate testimony on pharmaceutical pricing, Medicare negotiation, and affordable medication access.',
    source: 'Senate HELP Committee',
    tags: ['healthcare', 'prescription-drugs', 'medicare'],
    fileUrl: 'https://example.com/drug-pricing-testimony.pdf',
    category: 'Healthcare'
  },
  {
    id: 9,
    politicianId: 5,
    politicianName: 'Kamala Harris',
    title: 'Voting Rights Protection Act - Official Statement',
    type: 'statement',
    date: '2024-01-30',
    summary: 'Comprehensive statement on voting rights legislation, ballot access, and democratic participation.',
    source: 'Office of the Vice President',
    tags: ['voting-rights', 'democracy', 'civil-rights'],
    fileUrl: 'https://example.com/voting-rights.pdf',
    category: 'Civil Rights'
  },
  {
    id: 10,
    politicianId: 5,
    politicianName: 'Kamala Harris',
    title: 'Criminal Justice Reform Address',
    type: 'speech',
    date: '2024-03-05',
    summary: 'Policy address on sentencing reform, police accountability, and rehabilitation programs.',
    source: 'Office of the Vice President',
    tags: ['criminal-justice', 'police-reform', 'civil-rights'],
    fileUrl: 'https://example.com/justice-reform.pdf',
    category: 'Criminal Justice'
  }
];

export const getDocumentsByPolitician = (politicianId) => {
  return documents.filter(doc => doc.politicianId === politicianId);
};

export const getDocumentsByType = (type) => {
  return documents.filter(doc => doc.type === type);
};

export const documentTypes = [
  'all',
  'bill',
  'speech',
  'statement',
  'report',
  'policy',
  'testimony'
];

export const documentCategories = [
  'Climate & Environment',
  'Healthcare',
  'Education',
  'Government Operations',
  'Infrastructure',
  'Transportation & Climate',
  'Education & Student Debt',
  'Civil Rights',
  'Criminal Justice'
];
