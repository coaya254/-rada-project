// Sample voting records data
export const votes = [
  {
    id: 1,
    politicianId: 1,
    politicianName: 'Alexandria Ocasio-Cortez',
    billName: 'Infrastructure Investment and Jobs Act',
    vote: 'For',
    date: '2021-11-05',
    category: 'Infrastructure',
    description: '$1.2 trillion bill to rebuild roads, bridges, and expand broadband access.'
  },
  {
    id: 2,
    politicianId: 1,
    politicianName: 'Alexandria Ocasio-Cortez',
    billName: 'American Rescue Plan Act',
    vote: 'For',
    date: '2021-03-10',
    category: 'Economic Relief',
    description: '$1.9 trillion COVID-19 relief package with stimulus payments and unemployment benefits.'
  },
  {
    id: 3,
    politicianId: 4,
    politicianName: 'Bernie Sanders',
    billName: 'Medicare Expansion Act',
    vote: 'For',
    date: '2024-01-15',
    category: 'Healthcare',
    description: 'Legislation to lower Medicare eligibility age to 60.'
  },
  {
    id: 4,
    politicianId: 4,
    politicianName: 'Bernie Sanders',
    billName: 'Corporate Tax Reform Bill',
    vote: 'For',
    date: '2024-02-20',
    category: 'Tax Policy',
    description: 'Increase corporate tax rate and close tax loopholes.'
  }
];

export const getVotesByPolitician = (politicianId) => {
  return votes.filter(vote => vote.politicianId === politicianId);
};

export const voteTypes = ['For', 'Against', 'Abstain', 'Not Voting'];
