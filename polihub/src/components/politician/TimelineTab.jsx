import React, { useState } from 'react';
import { Briefcase, Trophy, AlertTriangle, FileText, Megaphone, Vote, Link as LinkIcon } from 'lucide-react';

export default function TimelineTab({ politicianId }) {
  const [filterType, setFilterType] = useState('All');

  // Sample data - replace with API call
  const timeline = [
    {
      id: 1,
      type: 'position',
      title: 'Elected to U.S. House of Representatives',
      date: '2019-01-03',
      description: 'Won congressional election representing New York\'s 14th district with 78% of the vote.',
      source_links: ['https://ballotpedia.org/election-results']
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Green New Deal Resolution',
      date: '2019-02-07',
      description: 'Co-sponsored the Green New Deal resolution, a comprehensive plan to address climate change and economic inequality.',
      source_links: ['https://congress.gov/bill/116th-congress/house-resolution/109']
    },
    {
      id: 3,
      type: 'speech',
      title: 'Climate Crisis Committee Speech',
      date: '2019-03-15',
      description: 'Delivered powerful testimony on the urgency of climate action during committee hearing.',
      source_links: ['https://c-span.org/video']
    },
    {
      id: 4,
      type: 'controversy',
      title: 'Amazon HQ2 Stance',
      date: '2019-02-14',
      description: 'Opposed Amazon\'s planned headquarters in Queens, citing concerns about tax breaks and gentrification.',
      source_links: ['https://nytimes.com/amazon-hq2']
    },
    {
      id: 5,
      type: 'achievement',
      title: 'Re-elected to Second Term',
      date: '2021-01-03',
      description: 'Re-elected with increased margin, securing 71.6% of votes in the general election.',
      source_links: ['https://ballotpedia.org/election-results-2020']
    },
    {
      id: 6,
      type: 'bill',
      title: 'Just Society Legislative Package',
      date: '2021-04-20',
      description: 'Introduced comprehensive legislative package addressing housing, education, and criminal justice reform.',
      source_links: ['https://congress.gov/just-society-package']
    }
  ];

  const getTypeIcon = (type) => {
    switch(type) {
      case 'position': return <Briefcase size={20} />;
      case 'achievement': return <Trophy size={20} />;
      case 'controversy': return <AlertTriangle size={20} />;
      case 'bill': return <FileText size={20} />;
      case 'speech': return <Megaphone size={20} />;
      case 'vote': return <Vote size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'position': return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'achievement': return { bg: 'bg-green-100', text: 'text-green-600' };
      case 'controversy': return { bg: 'bg-red-100', text: 'text-red-600' };
      case 'bill': return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'speech': return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'vote': return { bg: 'bg-indigo-100', text: 'text-indigo-600' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const filteredTimeline = filterType === 'All'
    ? timeline
    : timeline.filter(event => event.type === filterType.toLowerCase());

  // Sort by date descending (most recent first)
  const sortedTimeline = [...filteredTimeline].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="timeline-tab">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
        {['All', 'Position', 'Achievement', 'Controversy', 'Bill', 'Speech'].map(filter => (
          <button
            key={filter}
            onClick={() => setFilterType(filter)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition ${
              filterType === filter
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {sortedTimeline.map((event, idx) => {
          const colors = getTypeColor(event.type);
          
          return (
            <div className="flex gap-4 pb-8" key={event.id}>
              {/* Icon Column */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} shadow-md`}>
                  <span className={colors.text}>
                    {getTypeIcon(event.type)}
                  </span>
                </div>
                {idx !== sortedTimeline.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200 mt-2"></div>
                )}
              </div>

              {/* Content Column */}
              <div className="flex-1 pt-1 bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    {/* Type Badge */}
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${colors.bg} ${colors.text}`}>
                      {event.type.toUpperCase()}
                    </span>
                    
                    {/* Title */}
                    <h4 className="text-base sm:text-lg font-black text-gray-800 mb-1">{event.title}</h4>
                  </div>
                  
                  {/* Source Link */}
                  {event.source_links && (
                    <button 
                      onClick={() => window.open(event.source_links[0], '_blank')}
                      className="p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition ml-4"
                    >
                      <LinkIcon size={16} className="text-purple-600" />
                    </button>
                  )}
                </div>
                
                {/* Date */}
                <p className="text-sm font-semibold text-gray-500 mb-3">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                
                {/* Description */}
                <p className="text-sm text-gray-700 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedTimeline.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">No Timeline Events</h3>
          <p className="text-gray-500">Try selecting a different filter</p>
        </div>
      )}
    </div>
  );
}