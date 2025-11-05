import React, { useState } from 'react';
import { Clock, Download, Link as LinkIcon, FileText, X } from 'lucide-react';

export default function DocumentsTab({ politicianId }) {
  const [filterType, setFilterType] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Sample data - replace with API call
  const documents = [
    {
      id: 1,
      type: 'bill',
      title: 'Infrastructure Investment and Jobs Act',
      summary: 'Comprehensive legislation to rebuild American infrastructure, including roads, bridges, broadband, and water systems.',
      date: '2024-09-15',
      source: 'Congress.gov',
      tags: ['Infrastructure', 'Jobs', 'Investment'],
      source_links: ['https://congress.gov/bill/117th-congress/house-bill/3684'],
      verification_links: ['https://www.factcheck.org/2021/08/factchecking-bidens-infrastructure-bill-remarks/']
    },
    {
      id: 2,
      type: 'speech',
      title: 'Climate Action Summit Address',
      summary: 'Keynote address on climate policy and renewable energy initiatives.',
      date: '2024-08-22',
      source: 'C-SPAN',
      tags: ['Climate', 'Environment', 'Energy'],
      source_links: ['https://www.c-span.org/video/?523456-1/climate-summit']
    },
    {
      id: 3,
      type: 'interview',
      title: 'Healthcare Reform Discussion',
      summary: 'Interview discussing proposed healthcare reforms and Medicare expansion.',
      date: '2024-07-10',
      source: 'NPR',
      tags: ['Healthcare', 'Medicare', 'Policy'],
      source_links: ['https://npr.org/interview/healthcare-2024']
    },
    {
      id: 4,
      type: 'report',
      title: 'Annual Constituent Report 2024',
      summary: 'Comprehensive report detailing legislative accomplishments and constituent services.',
      date: '2024-06-01',
      source: 'Official Website',
      tags: ['Annual Report', 'Achievements'],
      source_links: ['https://example.com/report-2024.pdf']
    }
  ];

  const filteredDocs = filterType === 'All' 
    ? documents 
    : documents.filter(doc => doc.type === filterType.toLowerCase());

  const getTypeColor = (type) => {
    switch(type) {
      case 'bill': return 'bg-yellow-100 text-yellow-700';
      case 'speech': return 'bg-green-100 text-green-700';
      case 'interview': return 'bg-blue-100 text-blue-700';
      case 'report': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="documents-tab">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
        {['All', 'Bill', 'Speech', 'Interview', 'Report'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition ${
              filterType === type
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map(doc => (
          <div 
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-purple-200"
          >
            {/* Type Badge */}
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${getTypeColor(doc.type)}`}>
              {doc.type.toUpperCase()}
            </span>

            {/* Title */}
            <h4 className="text-base sm:text-lg font-black text-gray-800 mb-2 line-clamp-2">
              {doc.title}
            </h4>

            {/* Summary */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {doc.summary}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock size={12} />
                <span>{new Date(doc.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex gap-2">
                {doc.source_links && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.open(doc.source_links[0], '_blank'); }}
                    className="p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                  >
                    <LinkIcon size={16} className="text-purple-600" />
                  </button>
                )}
                <button className="p-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition">
                  <Download size={16} className="text-white" />
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {doc.tags?.map((tag, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDoc(null)}>
          <div 
            className="bg-white rounded-3xl max-w-full sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-start justify-between">
              <div className="flex-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${getTypeColor(selectedDoc.type)}`}>
                  {selectedDoc.type.toUpperCase()}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-800">{selectedDoc.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition ml-4"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span>{new Date(selectedDoc.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText size={16} />
                  <span>Source: {selectedDoc.source}</span>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Summary</h3>
                <p className="text-gray-700 leading-relaxed">{selectedDoc.summary}</p>
              </div>

              {/* Tags */}
              {selectedDoc.tags && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoc.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Links */}
              {selectedDoc.source_links && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Source Links</h3>
                  <div className="space-y-2">
                    {selectedDoc.source_links.map((link, idx) => (
                      <a 
                        key={idx}
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-blue-700 text-sm"
                      >
                        <LinkIcon size={16} />
                        <span className="truncate">{link}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Links */}
              {selectedDoc.verification_links && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Verification Links</h3>
                  <div className="space-y-2">
                    {selectedDoc.verification_links.map((link, idx) => (
                      <a 
                        key={idx}
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition text-green-700 text-sm"
                      >
                        <LinkIcon size={16} />
                        <span className="truncate">{link}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Download Button */}
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2">
                <Download size={20} />
                Download Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="text-center py-16 sm:py-20">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No Documents Found</h3>
          <p className="text-gray-500">Try selecting a different filter</p>
        </div>
      )}
    </div>
  );
}