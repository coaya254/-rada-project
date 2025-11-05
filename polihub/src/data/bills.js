// Sample bills data
export const bills = [
  {
    id: 1,
    billNumber: 'H.R. 1234',
    title: 'Green New Deal Resolution',
    shortTitle: 'Green New Deal',
    sponsor: 'Alexandria Ocasio-Cortez',
    sponsorId: 1,
    status: 'introduced',
    chamber: 'house',
    introducedDate: '2024-02-01',
    category: 'Climate & Environment',
    description: 'Comprehensive legislation to address climate change through massive infrastructure investment and job creation.',
    summary: 'This resolution calls for a 10-year national mobilization to achieve net-zero greenhouse gas emissions.',
    tags: ['climate', 'jobs', 'infrastructure', 'renewable-energy']
  },
  {
    id: 2,
    billNumber: 'S. 5678',
    title: 'Medicare for All Act',
    shortTitle: 'Medicare for All',
    sponsor: 'Bernie Sanders',
    sponsorId: 4,
    status: 'committee',
    chamber: 'senate',
    introducedDate: '2024-01-15',
    category: 'Healthcare',
    description: 'Establishes a universal healthcare program providing comprehensive coverage to all Americans.',
    summary: 'Creates a national health insurance program to provide all individuals with free health care services.',
    tags: ['healthcare', 'medicare', 'universal-coverage']
  },
  {
    id: 3,
    billNumber: 'H.R. 9012',
    title: 'Infrastructure Investment and Jobs Act',
    shortTitle: 'Infrastructure Bill',
    sponsor: 'Pete Buttigieg',
    sponsorId: 3,
    status: 'passed',
    chamber: 'house',
    introducedDate: '2021-06-01',
    category: 'Infrastructure',
    description: '$1.2 trillion investment in roads, bridges, broadband, and clean energy infrastructure.',
    summary: 'Provides funding for transportation, utilities, and broadband infrastructure improvements.',
    tags: ['infrastructure', 'transportation', 'broadband', 'jobs']
  }
];

export const getBillsBySponsor = (sponsorId) => {
  return bills.filter(bill => bill.sponsorId === sponsorId);
};

export const billStatuses = {
  introduced: { label: 'Introduced', color: 'blue' },
  committee: { label: 'In Committee', color: 'yellow' },
  floor: { label: 'On Floor', color: 'orange' },
  passed: { label: 'Passed', color: 'green' },
  failed: { label: 'Failed', color: 'red' }
};
