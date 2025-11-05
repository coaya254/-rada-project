import React, { useState } from 'react';
import { Clock, ChevronRight, Filter, Shield, X, ExternalLink } from 'lucide-react';

export default function NewsTab({ politicianId }) {
  const [selectedNews, setSelectedNews] = useState(null);
  const [filterSource, setFilterSource] = useState('All');
  const [filterCredibility, setFilterCredibility] = useState('All');

  // Sample data - replace with API call
  const news = [
    {
      id: 1,
      headline: 'Senator Proposes New Climate Legislation',
      summary: 'Comprehensive climate bill aims to reduce carbon emissions by 50% over the next decade through renewable energy incentives and stricter regulations.',
      source: 'CNN',
      credibility: 'maximum',
      source_publication_date: '2024-10-15',
      article_url: 'https://cnn.com/article/climate-bill-2024'
    },
    {
      id: 2,
      headline: 'Town Hall Addresses Healthcare Concerns',
      summary: 'Local constituents voice concerns about healthcare accessibility during packed town hall meeting.',
      source: 'Local News',
      credibility: 'high',
      source_publication_date: '2024-10-12',
      article_url: 'https://localnews.com/townhall-2024'
    },
    {
      id: 3,
      headline: 'Education Reform Bill Gains Support',
      summary: 'Bipartisan support grows for education reform focused on teacher pay and school infrastructure.',
      source: 'Washington Post',
      credibility: 'maximum',
      source_publication_date: '2024-10-08',
      article_url: 'https://washingtonpost.com/education-reform'
    },
    {
      id: 4,
      headline: 'Infrastructure Project Announcement',
      summary: 'Major infrastructure improvements planned for district including road repairs and broadband expansion.',
      source: 'Blog',
      credibility: 'single',
      source_publication_date: '2024-10-05',
      article_url: 'https://blog.com/infrastructure'
    }
  ];

  const getSourceColor = (source) => {
    const colors = {
      'CNN': '#cc0000',
      'BBC': '#bb1919',
      'Reuters': '#ff8000',
      'Washington Post': '#003366',
      'New York Times': '#000000',
      'Local News': '#6366f1',
      'Blog': '#8b5cf6'
    };
    return colors[source] || '#6b7280';
  };

  const getCredibilityBadge = (credibility) => {
    switch(credibility) {
      case 'maximum':
        return { text: 'VERIFIED', color: 'bg-green-500' };
      case 'high':
        return { text: 'HIGH', color: 'bg-green-500' };
      case 'medium':
        return { text: 'MEDIUM', color: 'bg-yellow-500' };
      case 'single':
        return { text: 'SINGLE SOURCE', color: 'bg-red-500' };
      default:
        return { text: 'UNVERIFIED', color: 'bg-gray-500' };
    }
  };

  const filteredNews = news.filter(item => {
    const matchesSource = filterSource === 'All' || item.source === filterSource;
    const matchesCredibility = filterCredibility === 'All' || item.credibility === filterCredibility;
    return matchesSource && matchesCredibility;
  });

  return (
    <div className="news-tab">
      {/* Filter Bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select 
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="px-4 py-2 bg-white rounded-xl shadow-sm border-2 border-gray-200 focus:border-purple-500 focus:outline-none font-semibold text-sm"
        >
          <option value="All">All Sources</option>
          <option value="CNN">CNN</option>
          <option value="Washington Post">Washington Post</option>
          <option value="Local News">Local News</option>
          <option value="Blog">Blog</option>
        </select>

        <select 
          value={filterCredibility}
          onChange={(e) => setFilterCredibility(e.target.value)}
          className="px-4 py-2 bg-white rounded-xl shadow-sm border-2 border-gray-200 focus:border-purple-500 focus:outline-none font-semibold text-sm"
        >
          <option value="All">All Credibility</option>
          <option value="maximum">Verified</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="single">Single Source</option>
        </select>
      </div>

      {/* News Cards */}
      <div className="space-y-4">
        {filteredNews.map(item => {
          const credibilityBadge = getCredibilityBadge(item.credibility);
          
          return (
            <div 
              key={item.id}
              onClick={() => setSelectedNews(item)}
              className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-purple-200"
            >
              {/* Header Row */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 flex-wrap">
                  {/* Source Badge */}
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: getSourceColor(item.source) }}
                  >
                    {item.source}
                  </span>

                  {/* Credibility Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${credibilityBadge.color}`}>
                    {credibilityBadge.text}
                  </span>
                </div>
                <ChevronRight size={20} className="text-gray-400 flex-shrink-0 ml-2" />
              </div>

              {/* Headline */}
              <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                {item.headline}
              </h4>

              {/* Summary */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {item.summary}
              </p>

              {/* Footer */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock size={14} />
                <span>{new Date(item.source_publication_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedNews(null)}>
          <div 
            className="bg-white rounded-3xl max-w-full sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2 flex-wrap flex-1">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: getSourceColor(selectedNews.source) }}
                  >
                    {selectedNews.source}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getCredibilityBadge(selectedNews.credibility).color}`}>
                    {getCredibilityBadge(selectedNews.credibility).text}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition ml-4"
                >
                  <X size={20} />
                </button>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-800">{selectedNews.headline}</h2>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>Published: {new Date(selectedNews.source_publication_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Summary</h3>
                <p className="text-gray-700 leading-relaxed">{selectedNews.summary}</p>
              </div>

              {/* Original Article Link */}
              {selectedNews.article_url && (
                <a 
                  href={selectedNews.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <ExternalLink size={20} />
                  Read Full Article
                </a>
              )}

              {/* Credibility Explanation */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-800 mb-2">About Credibility Rating</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedNews.credibility === 'maximum' && 'This news has been verified by multiple trusted sources and fact-checked.'}
                  {selectedNews.credibility === 'high' && 'This news comes from a reputable source with established credibility.'}
                  {selectedNews.credibility === 'medium' && 'This news has moderate verification. Cross-reference recommended.'}
                  {selectedNews.credibility === 'single' && 'This news comes from a single source. Additional verification recommended.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredNews.length === 0 && (
        <div className="text-center py-16 sm:py-20">
          <Shield size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No News Found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}