// ============================================
// FILE: components/PoliticianDetailModal.jsx
// Enhanced with Tabs for Documents, News, Timeline, Promises, Voting
// ============================================

import React, { useState } from 'react';
import { ThumbsUp, Share2, Bookmark, MapPin, Twitter, Instagram, ExternalLink, Clock, Download, Link, Briefcase, Trophy, AlertTriangle, FileText } from 'lucide-react';
import { getDocumentsByPolitician } from '../data/documents';
import { getNewsByPolitician } from '../data/news';
import { getTimelineByPolitician } from '../data/timeline';
import { getPromisesByPolitician } from '../data/promises';
import { getVotesByPolitician } from '../data/votes';

export default function PoliticianDetailModal({ politician, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!politician) return null;

  // Get data for this politician
  const documents = getDocumentsByPolitician(politician.id) || [];
  const news = getNewsByPolitician(politician.id) || [];
  const timeline = getTimelineByPolitician(politician.id) || [];
  const promises = getPromisesByPolitician(politician.id) || [];
  const votes = getVotesByPolitician(politician.id) || [];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents', count: documents.length },
    { id: 'news', label: 'News', count: news.length },
    { id: 'timeline', label: 'Timeline', count: timeline.length },
    { id: 'promises', label: 'Promises', count: promises.length },
    { id: 'voting', label: 'Voting', count: votes.length },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header with gradient */}
        <div className="relative h-64" style={{ background: politician.gradient }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition text-white z-10"
          >
            ✕
          </button>

          <div className="absolute inset-0 flex items-end p-8">
            <div className="flex items-end gap-6 w-full">
              <img
                src={politician.image_url || politician.imageUrl || politician.image}
                alt={politician.name}
                className="w-40 h-40 rounded-2xl object-cover border-4 border-white shadow-xl"
              />
              <div className="flex-1 text-white pb-2">
                <h2 className="text-4xl font-black mb-2">{politician.full_name || politician.name}</h2>
                <p className="text-xl opacity-90 mb-2">{politician.title || politician.position}</p>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    politician.party === 'Democrat' ? 'bg-blue-500' :
                    politician.party === 'Republican' ? 'bg-red-500' :
                    'bg-purple-500'
                  }`}>
                    {politician.party}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm">
                    {politician.chamber}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white px-8 overflow-x-auto flex-shrink-0">
          <div className="flex gap-1 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-bold text-sm transition relative ${
                  activeTab === tab.id
                    ? 'text-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-purple-600">{politician.stats?.views || politician.total_votes || '0'}</div>
                  <div className="text-xs text-gray-600 font-semibold">Profile Views</div>
                </div>
                <div className="bg-pink-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-pink-600">{politician.stats?.comments || politician.rating || 'New'}</div>
                  <div className="text-xs text-gray-600 font-semibold">Comments</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-blue-600">{politician.yearsInOffice || politician.years_in_office || 'N/A'}</div>
                  <div className="text-xs text-gray-600 font-semibold">Years in Office</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-green-600">{politician.keyIssues?.length || 0}</div>
                  <div className="text-xs text-gray-600 font-semibold">Key Issues</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-8">
                <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition hover:scale-105 transform flex items-center justify-center gap-2">
                  <ThumbsUp size={18} />
                  Follow
                </button>
                <button className="px-6 bg-purple-100 text-purple-700 py-3 rounded-xl font-bold hover:bg-purple-200 transition flex items-center justify-center gap-2">
                  <Share2 size={18} />
                  Share
                </button>
                <button className="px-6 bg-purple-100 text-purple-700 py-3 rounded-xl font-bold hover:bg-purple-200 transition flex items-center justify-center gap-2">
                  <Bookmark size={18} />
                  Save
                </button>
              </div>

              {/* Bio Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-black mb-3 flex items-center gap-2">
                  📋 Biography
                </h3>
                <p className="text-gray-700 leading-relaxed">{politician.bio || politician.biography || politician.description || 'No biography available.'}</p>
              </div>

              {/* Key Issues */}
              {politician.keyIssues && politician.keyIssues.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-black mb-3 flex items-center gap-2">
                    🎯 Key Issues
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(politician.keyIssues || []).map((issue, idx) => (
                      <span key={idx} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full font-semibold text-sm">
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Committees */}
              {politician.committees && politician.committees.length > 0 && politician.committees[0] !== 'N/A' && (
                <div className="mb-8">
                  <h3 className="text-2xl font-black mb-3 flex items-center gap-2">
                    🏛️ Committee Assignments
                  </h3>
                  <div className="space-y-2">
                    {(politician.committees || []).map((committee, idx) => (
                      <div key={idx} className="p-3 bg-purple-50 rounded-xl text-gray-700 font-semibold text-sm">
                        • {committee}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact & Social */}
              {(politician.contact || politician.twitter_handle || politician.instagram_handle || politician.website_url) && (
                <div className="mb-8">
                  <h3 className="text-2xl font-black mb-3 flex items-center gap-2">
                    📱 Contact & Social Media
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(politician.contact?.twitter || politician.twitter_handle) && (
                      <a href="#" className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition flex items-center gap-3">
                        <Twitter className="text-blue-500" size={24} />
                        <div>
                          <div className="font-bold text-sm text-gray-800">Twitter</div>
                          <div className="text-xs text-gray-600">{politician.contact?.twitter || politician.twitter_handle}</div>
                        </div>
                      </a>
                    )}
                    {(politician.contact?.instagram || politician.instagram_handle) && (
                      <a href="#" className="p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition flex items-center gap-3">
                        <Instagram className="text-pink-500" size={24} />
                        <div>
                          <div className="font-bold text-sm text-gray-800">Instagram</div>
                          <div className="text-xs text-gray-600">{politician.contact?.instagram || politician.instagram_handle}</div>
                        </div>
                      </a>
                    )}
                    {(politician.contact?.website || politician.website_url) && (
                      <a href="#" className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition flex items-center gap-3">
                        <ExternalLink className="text-purple-500" size={24} />
                        <div>
                          <div className="font-bold text-sm text-gray-800">Website</div>
                          <div className="text-xs text-gray-600 truncate">{politician.contact?.website || politician.website_url}</div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Location Info */}
              {(politician.state || politician.district) && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                  <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                    <MapPin size={20} className="text-purple-600" />
                    Represents
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {politician.state && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">State</div>
                        <div className="text-lg font-black text-gray-800">{politician.state}</div>
                      </div>
                    )}
                    {politician.district && politician.district !== 'N/A' && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">District</div>
                        <div className="text-lg font-black text-gray-800">{politician.district}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <h3 className="text-3xl font-black mb-6">📄 Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map(doc => (
                  <div key={doc.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer border-2 border-gray-100">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                      doc.type === 'bill' ? 'bg-yellow-100 text-yellow-700' :
                      doc.type === 'speech' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {doc.type.toUpperCase()}
                    </span>
                    <h4 className="text-lg font-black text-gray-800 mb-2">{doc.title}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{new Date(doc.date).toLocaleDateString()}</span>
                      </div>
                      <button className="p-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition">
                        <Download size={16} className="text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {documents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No documents available</p>
                </div>
              )}
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div>
              <h3 className="text-3xl font-black mb-6">📰 Recent News</h3>
              <div className="space-y-4">
                {news.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition cursor-pointer border-2 border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          {item.source}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                          item.credibility === 'maximum' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          {item.credibility === 'maximum' ? 'VERIFIED' : 'HIGH'}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">{item.headline}</h4>
                    <p className="text-sm text-gray-600 mb-4">{item.summary}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={14} />
                      <span>{new Date(item.publishedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              {news.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No recent news</p>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div>
              <h3 className="text-3xl font-black mb-6">📅 Career Timeline</h3>
              <div className="relative">
                {timeline.map((event, idx) => (
                  <div key={event.id} className="flex gap-4 pb-8">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        event.type === 'position' ? 'bg-blue-100' :
                        event.type === 'achievement' ? 'bg-green-100' :
                        'bg-red-100'
                      }`}>
                        {event.type === 'position' && <Briefcase className="text-blue-600" size={20} />}
                        {event.type === 'achievement' && <Trophy className="text-green-600" size={20} />}
                        {event.type === 'controversy' && <AlertTriangle className="text-red-600" size={20} />}
                      </div>
                      {idx !== timeline.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 mt-2 min-h-[60px]"></div>
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="text-lg font-bold text-gray-800 mb-1">{event.title}</h4>
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {timeline.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No timeline events</p>
                </div>
              )}
            </div>
          )}

          {/* Promises Tab */}
          {activeTab === 'promises' && (
            <div>
              <h3 className="text-3xl font-black mb-6">✅ Campaign Promises</h3>
              <div className="grid grid-cols-1 gap-4">
                {promises.map(promise => (
                  <div key={promise.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer border-2 border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-3 h-3 rounded-full ${
                        promise.status === 'completed' ? 'bg-green-500' :
                        promise.status === 'significant_progress' ? 'bg-green-400' :
                        promise.status === 'early_progress' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className={`text-xs font-bold uppercase ${
                        promise.status === 'completed' ? 'text-green-600' :
                        promise.status === 'significant_progress' ? 'text-green-500' :
                        promise.status === 'early_progress' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {promise.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-gray-800 mb-2">{promise.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{promise.description}</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-bold text-purple-600">{promise.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: `${promise.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {promises.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No promises tracked</p>
                </div>
              )}
            </div>
          )}

          {/* Voting Tab */}
          {activeTab === 'voting' && (
            <div>
              <h3 className="text-3xl font-black mb-6">🗳️ Voting Record</h3>
              <div className="space-y-4">
                {votes.map(vote => (
                  <div key={vote.id} className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition border-2 border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-bold text-gray-800 flex-1">{vote.billName}</h4>
                      <span className={`px-4 py-2 rounded-full font-bold text-sm ml-4 ${
                        vote.vote === 'For' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {vote.vote}
                      </span>
                    </div>
                    <div className="flex gap-4 mb-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        {vote.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        {new Date(vote.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{vote.description}</p>
                  </div>
                ))}
              </div>
              {votes.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No voting records</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
