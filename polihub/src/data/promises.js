// Sample campaign promises data
export const promises = [
  {
    id: 1,
    politicianId: 1,
    politicianName: 'Alexandria Ocasio-Cortez',
    title: 'Green Jobs Program in NYC',
    description: 'Create 10,000 green jobs in New York through renewable energy projects and infrastructure improvements.',
    status: 'significant_progress',
    category: 'Climate & Jobs',
    dateMade: '2018-11-01',
    deadline: '2026-12-31',
    progress: 65
  },
  {
    id: 2,
    politicianId: 1,
    politicianName: 'Alexandria Ocasio-Cortez',
    title: 'Expand Medicare Coverage',
    description: 'Work to lower Medicare eligibility age and expand coverage for dental, vision, and hearing.',
    status: 'early_progress',
    category: 'Healthcare',
    dateMade: '2019-01-03',
    deadline: null,
    progress: 30
  },
  {
    id: 3,
    politicianId: 2,
    politicianName: 'Ron DeSantis',
    title: 'Expand School Choice',
    description: 'Increase funding for school voucher programs and charter schools across Florida.',
    status: 'completed',
    category: 'Education',
    dateMade: '2018-09-01',
    deadline: '2023-12-31',
    progress: 100
  },
  {
    id: 4,
    politicianId: 3,
    politicianName: 'Pete Buttigieg',
    title: 'Modernize Public Transit',
    description: 'Invest $50 billion in public transit infrastructure and electric bus fleets nationwide.',
    status: 'significant_progress',
    category: 'Infrastructure',
    dateMade: '2021-02-02',
    deadline: '2026-01-31',
    progress: 70
  },
  {
    id: 5,
    politicianId: 4,
    politicianName: 'Bernie Sanders',
    title: 'Cancel Student Debt',
    description: 'Work to cancel all student loan debt for working families.',
    status: 'stalled',
    category: 'Education',
    dateMade: '2020-01-01',
    deadline: null,
    progress: 15
  }
];

export const getPromisesByPolitician = (politicianId) => {
  return promises.filter(promise => promise.politicianId === politicianId);
};

export const promiseStatuses = {
  completed: { label: 'Completed', color: 'green' },
  significant_progress: { label: 'Significant Progress', color: 'light-green' },
  early_progress: { label: 'Early Progress', color: 'yellow' },
  stalled: { label: 'Stalled', color: 'red' },
  no_evidence: { label: 'No Evidence', color: 'gray' }
};
