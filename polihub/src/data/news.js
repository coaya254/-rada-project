// Sample political news data
export const news = [
  {
    id: 1,
    politicianId: 1,
    politicianName: 'Alexandria Ocasio-Cortez',
    headline: 'AOC Introduces Landmark Climate Legislation in House',
    summary: 'Representative Ocasio-Cortez unveiled comprehensive climate change legislation aimed at achieving net-zero emissions by 2030 through massive green infrastructure investment and job creation programs.',
    source: 'The New York Times',
    credibility: 'maximum',
    publishedDate: '2024-03-18',
    url: 'https://example.com/aoc-climate-bill',
    category: 'Policy'
  },
  {
    id: 2,
    politicianId: 2,
    politicianName: 'Ron DeSantis',
    headline: 'Florida Governor Signs Education Reform Into Law',
    summary: 'Governor DeSantis signed sweeping education legislation expanding school choice and increasing parental involvement in curriculum decisions.',
    source: 'Tampa Bay Times',
    credibility: 'maximum',
    publishedDate: '2024-03-20',
    url: 'https://example.com/desantis-education',
    category: 'Policy'
  },
  {
    id: 3,
    politicianId: 3,
    politicianName: 'Pete Buttigieg',
    headline: 'Transportation Secretary Announces $5B in Infrastructure Grants',
    summary: 'Secretary Buttigieg revealed major funding allocation for bridge repairs, public transit improvements, and rural connectivity projects nationwide.',
    source: 'The Washington Post',
    credibility: 'maximum',
    publishedDate: '2024-03-19',
    url: 'https://example.com/buttigieg-infrastructure',
    category: 'Infrastructure'
  }
];

export const getNewsByPolitician = (politicianId) => {
  return news.filter(item => item.politicianId === politicianId);
};

export const credibilityLevels = {
  maximum: { label: 'VERIFIED', color: 'green' },
  high: { label: 'HIGH', color: 'green' },
  medium: { label: 'MEDIUM', color: 'yellow' },
  low: { label: 'SINGLE SOURCE', color: 'red' }
};
