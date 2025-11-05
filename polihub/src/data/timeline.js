// Sample political timeline data
export const timeline = [
  {
    id: 1,
    politicianId: 1,
    politicianName: 'Alexandria Ocasio-Cortez',
    title: 'Elected to U.S. House of Representatives',
    description: 'Won NY-14 district, becoming youngest woman ever elected to Congress at age 29.',
    date: '2018-11-06',
    type: 'position',
  },
  {
    id: 2,
    politicianId: 1,
    politicianName: 'Alexandria Ocasio-Cortez',
    title: 'Introduced Green New Deal Resolution',
    description: 'Co-sponsored landmark climate change legislation with Senator Ed Markey.',
    date: '2019-02-07',
    type: 'achievement',
  },
  {
    id: 3,
    politicianId: 2,
    politicianName: 'Ron DeSantis',
    title: 'Elected Florida Governor',
    description: 'Won gubernatorial race with 49.6% of vote.',
    date: '2018-11-06',
    type: 'position',
  },
  {
    id: 4,
    politicianId: 3,
    politicianName: 'Pete Buttigieg',
    title: 'Confirmed as Transportation Secretary',
    description: 'Became youngest Cabinet member and first openly gay Senate-confirmed Cabinet secretary.',
    date: '2021-02-02',
    type: 'position',
  }
];

export const getTimelineByPolitician = (politicianId) => {
  return timeline.filter(event => event.politicianId === politicianId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const timelineTypes = {
  position: { label: 'Position', color: 'blue' },
  achievement: { label: 'Achievement', color: 'green' },
  controversy: { label: 'Controversy', color: 'red' },
  legislation: { label: 'Legislation', color: 'purple' }
};
