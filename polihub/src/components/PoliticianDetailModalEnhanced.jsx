// ============================================
// FILE: components/PoliticianDetailModalEnhanced.jsx
// Connected to Real Backend APIs with Detail Modals
// ============================================

import React, { useState, useEffect } from 'react';
import {
  ThumbsUp, Share2, Bookmark, MapPin, Twitter, Instagram, ExternalLink,
  Clock, Download, Link as LinkIcon, Briefcase, Trophy, AlertTriangle,
  FileText, X, CheckCircle, XCircle, AlertCircle, Calendar, Eye, ChevronDown, ChevronUp, ChevronRight, BookOpen, Tag
} from 'lucide-react';
import SourceButtons from './SourceButtons';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function PoliticianDetailModalEnhanced({ politician, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Data states
  const [documents, setDocuments] = useState([]);
  const [news, setNews] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [promises, setPromises] = useState([]);
  const [votes, setVotes] = useState([]);
  const [partyHistory, setPartyHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [fullPolitician, setFullPolitician] = useState(politician);

  // Modal states
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedPromise, setSelectedPromise] = useState(null);
  const [selectedVote, setSelectedVote] = useState(null);
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPartyHistoryModal, setShowPartyHistoryModal] = useState(false);
  const [showConstituencyModal, setShowConstituencyModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);

  useEffect(() => {
    if (politician) {
      fetchTabData();
    }
  }, [politician]);

  const fetchTabData = async () => {
    if (!politician?.id) return;

    setLoading(true);
    try {
      // Fetch full politician details from polihub endpoint
      const response = await fetch(`${API_BASE_URL}/api/polihub/politicians/${politician.id}`);
      const data = await response.json();

      if (data.success) {
        const fullData = data.data;
        // Set all data at once from the response
        setFullPolitician(fullData);
        setDocuments(fullData.documents || []);
        setNews(fullData.news || []);
        setTimeline(fullData.timeline || []);
        setPromises(fullData.commitments || []);
        setVotes(fullData.voting_records || []);
        setPartyHistory(fullData.party_history || []);
        setAchievements(fullData.achievements || []);

        console.log('Loaded politician data:', {
          partyHistory: fullData.party_history?.length || 0,
          achievements: fullData.achievements?.length || 0,
          votes: fullData.voting_records?.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!politician) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents', count: documents.length },
    { id: 'news', label: 'News', count: news.length },
    { id: 'timeline', label: 'Timeline', count: timeline.length },
    { id: 'promises', label: 'Promises', count: promises.length },
    { id: 'voting', label: 'Voting', count: votes.length },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'kept':
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
      case 'in progress':
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'broken':
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'kept':
      case 'completed':
      case 'approved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'in_progress':
      case 'in progress':
      case 'pending':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'broken':
      case 'rejected':
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
        <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-full sm:max-w-6xl w-full h-full sm:h-auto sm:max-h-[90vh] animate-slide-up sm:animate-none overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="relative h-auto min-h-[240px] sm:min-h-[280px] md:min-h-[320px] pb-4 sm:pb-6 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600">
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2 z-10">
              <button
                onClick={() => setShowShareModal(true)}
                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
                title="Share Profile"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="absolute inset-0 flex items-end p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 w-full">
                <img
                  src={politician.image_url || politician.imageUrl || politician.image || 'https://via.placeholder.com/150'}
                  alt={politician.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-xl sm:rounded-2xl object-cover border-4 border-white shadow-xl"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                />
                <div className="flex-1 text-white pb-2 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2">{politician.full_name || politician.name}</h2>
                  <p className="text-base sm:text-lg md:text-xl opacity-90 mb-2">{politician.title || politician.position}</p>
                  <div className="flex gap-2 justify-center sm:justify-start flex-wrap">
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm">
                      {politician.party}
                    </span>
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm">
                      {politician.chamber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white px-3 sm:px-6 md:px-8 overflow-x-auto flex-shrink-0 scrollbar-thin">
            <div className="flex gap-0.5 sm:gap-1 min-w-max">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 md:px-6 py-3 md:py-4 font-bold text-xs sm:text-sm transition relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-purple-600'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-4xl mb-4 animate-bounce">⏳</div>
                  <div className="text-gray-600">Loading...</div>
                </div>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-black mb-4">Biography</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {politician.biography || politician.bio || 'No biography available.'}
                      </p>
                    </div>

                    {politician.key_achievements && (
                      <div>
                        <h3 className="text-2xl font-black mb-4">Key Achievements</h3>
                        <p className="text-gray-700">{politician.key_achievements}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {politician.years_in_office && (
                        <div className="bg-purple-50 rounded-xl p-4">
                          <div className="text-sm text-gray-600 mb-1">Years in Office</div>
                          <div className="text-2xl font-black text-purple-600">{politician.years_in_office}</div>
                        </div>
                      )}
                      )}
                    </div>

                    {/* Social Media */}
                    <div className="flex gap-3 mb-6">
                      {politician.twitter_handle && (
                        <a
                          href={`https://twitter.com/${politician.twitter_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition flex items-center gap-2"
                        >
                          <Twitter size={16} />
                          Twitter
                        </a>
                      )}
                      {politician.instagram_handle && (
                        <a
                          href={`https://instagram.com/${politician.instagram_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg font-bold hover:bg-pink-200 transition flex items-center gap-2"
                        >
                          <Instagram size={16} />
                          Instagram
                        </a>
                      )}
                    </div>

                    {/* Quick Action Cards */}
                    <div>
                      <h3 className="text-2xl font-black mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <button
                          onClick={() => setShowPartyHistoryModal(true)}
                          className="bg-gradient-to-br from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 rounded-xl p-6 transition group text-left"
                        >
                          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition">
                            <Briefcase size={24} className="text-white" />
                          </div>
                          <h4 className="font-bold text-lg mb-1">Party History</h4>
                          <p className="text-sm text-gray-600">View political affiliation</p>
                        </button>

                        <button
                          onClick={() => setShowConstituencyModal(true)}
                          className="bg-gradient-to-br from-green-100 to-teal-100 hover:from-green-200 hover:to-teal-200 rounded-xl p-6 transition group text-left"
                        >
                          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition">
                            <MapPin size={24} className="text-white" />
                          </div>
                          <h4 className="font-bold text-lg mb-1">Constituency</h4>
                          <p className="text-sm text-gray-600">View representation area</p>
                        </button>

                        <button
                          onClick={() => setShowAchievementModal(true)}
                          className="bg-gradient-to-br from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 rounded-xl p-6 transition group text-left"
                        >
                          <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition">
                            <Trophy size={24} className="text-white" />
                          </div>
                          <h4 className="font-bold text-lg mb-1">Achievements</h4>
                          <p className="text-sm text-gray-600">View major accomplishments</p>
                        </button>

                        <button
                          onClick={() => setShowShareModal(true)}
                          className="bg-gradient-to-br from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 rounded-xl p-6 transition group text-left"
                        >
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition">
                            <Share2 size={24} className="text-white" />
                          </div>
                          <h4 className="font-bold text-lg mb-1">Share Profile</h4>
                          <p className="text-sm text-gray-600">Export or share information</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                    {documents.length === 0 ? (
                      <div className="col-span-3 text-center py-12 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No documents available</p>
                      </div>
                    ) : (
                      documents.map((doc, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedDocument(doc)}
                          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition cursor-pointer overflow-hidden group"
                        >
                          {/* Card Header */}
                          <div className={`bg-gradient-to-br ${doc.category_color || 'from-purple-400 to-pink-500'} p-6 relative`}>
                            <div className="flex items-start justify-between mb-4">
                              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-bold border border-white/30">
                                {doc.category || doc.type || 'Document'}
                              </span>
                              <span className="text-4xl">{doc.icon || '📄'}</span>
                            </div>
                            <h3 className="text-white font-black text-xl mb-2">{doc.title}</h3>
                          </div>

                          {/* Card Body */}
                          <div className="p-5">
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                              {doc.subtitle || doc.briefing || doc.summary || doc.description?.substring(0, 100) + '...'}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 flex-wrap">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{new Date(doc.published_date || doc.date || doc.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}</span>
                              </div>
                              {doc.pages && (
                                <div className="flex items-center gap-1 font-bold text-purple-600">
                                  <FileText size={14} />
                                  <span>{doc.pages} pages</span>
                                </div>
                              )}
                            </div>

                            {/* Source Tabs */}
                            <SourceButtons
                              sources={doc.sources}
                              hintText="📎 Click to verify from credible sources"
                              className="mb-4"
                            />

                            <button className="w-full bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 py-2.5 rounded-xl font-bold hover:shadow-md transition text-sm group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white">
                              View Document
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* News Tab */}
                {activeTab === 'news' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                    {news.length === 0 ? (
                      <div className="col-span-3 text-center py-12 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No news available</p>
                      </div>
                    ) : (
                      news.map((item, index) => {
                        const credibilityLevel = item.credibility || 'medium';
                        const credibilityBadge =
                          credibilityLevel === 'high' ? 'bg-green-500/20 text-green-700 border border-green-500' :
                          credibilityLevel === 'low' ? 'bg-red-500/20 text-red-700 border border-red-500' :
                          'bg-yellow-500/20 text-yellow-700 border border-yellow-500';

                        return (
                          <div
                            key={index}
                            onClick={() => setSelectedNews(item)}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition cursor-pointer overflow-hidden group"
                          >
                            {/* Card Header with gradient */}
                            <div className="bg-gradient-to-br from-blue-400 to-cyan-500 p-6 relative">
                              <div className="flex items-start justify-between mb-4">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${credibilityBadge}`}>
                                  {credibilityLevel.toUpperCase()} CREDIBILITY
                                </span>
                                <span className="text-4xl">{item.icon || '📰'}</span>
                              </div>
                              <h3 className="text-white font-black text-xl mb-2">{item.title}</h3>
                            </div>

                            {/* Card Body */}
                            <div className="p-5">
                              <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                                {(() => {
                                  const text = item.content || item.summary || item.description || '';
                                  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
                                  const preview = sentences.slice(0, 3).join(' ');
                                  return preview || text.substring(0, 200) + '...';
                                })()}
                              </p>

                              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  <span>{new Date(item.published_date || item.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}</span>
                                </div>
                                {item.source && (
                                  <div className="flex items-center gap-1 font-bold text-blue-600">
                                    <ExternalLink size={14} />
                                    <span>{item.source}</span>
                                  </div>
                                )}
                              </div>

                              {/* Source Tabs */}
                              <SourceButtons
                                sources={item.sources}
                                hintText="📰 Click to read from original news sources"
                                className="mb-4"
                              />

                              <button className="w-full bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 py-2.5 rounded-xl font-bold hover:shadow-md transition text-sm group-hover:from-blue-500 group-hover:to-cyan-500 group-hover:text-white">
                                Read Full Article
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    {timeline.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Clock size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No timeline events available</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-purple-200"></div>
                        {timeline.map((event, index) => (
                          <div
                            key={index}
                            onClick={() => setSelectedTimelineEvent(event)}
                            className="relative pl-16 pb-8 cursor-pointer group"
                          >
                            <div className="absolute left-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition border-4 border-white shadow-lg">
                              <Calendar size={20} className="text-purple-600" />
                            </div>
                            <div className="bg-white border-2 border-gray-100 rounded-xl p-6 group-hover:border-purple-300 group-hover:shadow-lg transition">
                              <div className="text-sm font-bold text-purple-600 mb-2">
                                {new Date(event.date || event.event_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              <h4 className="font-bold text-lg mb-2 group-hover:text-purple-600 transition">
                                {event.title || event.event_title}
                              </h4>
                              <p className="text-gray-600 text-sm mb-4">{event.description}</p>

                              {/* Source Tabs */}
                              <SourceButtons
                                sources={event.sources}
                                hintText="⏱️ Verify timeline events from credible sources"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Promises Tab */}
                {activeTab === 'promises' && (
                  <div className="grid grid-cols-3 gap-6">
                    {promises.length === 0 ? (
                      <div className="col-span-3 text-center py-12 text-gray-500">
                        <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No promises tracked</p>
                      </div>
                    ) : (
                      promises.map((promise, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedPromise(promise)}
                          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition cursor-pointer overflow-hidden group"
                        >
                          {/* Card Header with gradient */}
                          <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-6 relative">
                            <div className="flex items-start justify-between mb-4">
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30`}>
                                {promise.status}
                              </span>
                              <span className="text-4xl">{promise.icon || '🤝'}</span>
                            </div>
                            <h3 className="text-white font-black text-xl mb-2">{promise.title || promise.commitment_text}</h3>
                          </div>

                          {/* Card Body */}
                          <div className="p-5">
                            <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                              {promise.description}
                            </p>

                            {/* Progress Bar */}
                            {promise.progress_percentage !== undefined && (
                              <div className="mb-4">
                                <div className="bg-gray-200 rounded-full h-2 mb-1">
                                  <div
                                    className="bg-green-500 h-2 rounded-full transition-all"
                                    style={{ width: `${promise.progress_percentage}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500 font-bold">{promise.progress_percentage}% complete</div>
                              </div>
                            )}

                            {/* Source Tabs */}
                            <SourceButtons
                              sources={promise.sources}
                              hintText="🤝 Verify promises and commitments"
                              className="mb-4"
                            />

                            <button className="w-full bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 py-2.5 rounded-xl font-bold hover:shadow-md transition text-sm group-hover:from-green-500 group-hover:to-emerald-500 group-hover:text-white">
                              View Details
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Voting Tab */}
                {activeTab === 'voting' && (
                  <div className="grid grid-cols-3 gap-6">
                    {votes.length === 0 ? (
                      <div className="col-span-3 text-center py-12 text-gray-500">
                        <ThumbsUp size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No voting records available</p>
                      </div>
                    ) : (
                      votes.map((vote, index) => {
                        const isYes = vote.vote === 'yes' || vote.vote === 'approved';
                        const isNo = vote.vote === 'no' || vote.vote === 'rejected';
                        const gradientClass = isYes ? 'from-green-400 to-emerald-500' : isNo ? 'from-red-400 to-rose-500' : 'from-gray-400 to-slate-500';
                        const badgeClass = isYes ? 'bg-green-500/20 text-green-700 border border-green-500' : isNo ? 'bg-red-500/20 text-red-700 border border-red-500' : 'bg-gray-500/20 text-gray-700 border border-gray-500';

                        return (
                          <div
                            key={index}
                            onClick={() => setSelectedVote(vote)}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition cursor-pointer overflow-hidden group"
                          >
                            {/* Card Header with gradient */}
                            <div className={`bg-gradient-to-br ${gradientClass} p-6 relative`}>
                              <div className="flex items-start justify-between mb-4">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${badgeClass}`}>
                                  {vote.vote?.toUpperCase() || 'ABSTAIN'}
                                </span>
                                <span className="text-4xl">{vote.icon || '🗳️'}</span>
                              </div>
                              <h3 className="text-white font-black text-xl mb-2">{vote.bill_title || vote.title}</h3>
                            </div>

                            {/* Card Body */}
                            <div className="p-5">
                              <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                                {vote.description || vote.summary}
                              </p>

                              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  <span>{new Date(vote.vote_date || vote.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}</span>
                                </div>
                              </div>

                              {/* Source Tabs */}
                              <SourceButtons
                                sources={vote.sources}
                                hintText="🗳️ Verify voting records from official sources"
                                className="mb-4"
                              />

                              <button className={`w-full bg-gradient-to-r py-2.5 rounded-xl font-bold hover:shadow-md transition text-sm ${
                                isYes ? 'from-green-50 to-emerald-50 text-green-700 group-hover:from-green-500 group-hover:to-emerald-500' :
                                isNo ? 'from-red-50 to-rose-50 text-red-700 group-hover:from-red-500 group-hover:to-rose-500' :
                                'from-gray-50 to-slate-50 text-gray-700 group-hover:from-gray-500 group-hover:to-slate-500'
                              } group-hover:text-white`}>
                                View Vote Details
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Document Detail Modal - Exact Style Match */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200" onClick={() => { setSelectedDocument(null); setShowDocumentDetails(false); }}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Popup Header */}
            <div className={`bg-gradient-to-br ${selectedDocument.category_color || 'from-purple-400 to-pink-500'} text-white p-8 rounded-t-3xl relative`}>
              <button
                onClick={() => {
                  setSelectedDocument(null);
                  setShowDocumentDetails(false);
                }}
                className="absolute top-6 right-6 hover:bg-white/20 rounded-full p-2 transition backdrop-blur-sm"
              >
                <X size={24} />
              </button>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl border border-white/30">
                  {selectedDocument.icon || '📄'}
                </div>
                <div className="flex-1">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold inline-block mb-3 border border-white/30">
                    {selectedDocument.category || selectedDocument.type || 'Document'}
                  </span>
                  <h2 className="text-3xl font-black mb-2">{selectedDocument.title}</h2>
                  <p className="text-white/90">{selectedDocument.subtitle || selectedDocument.briefing || selectedDocument.summary}</p>
                </div>
              </div>
            </div>

            {/* Popup Content */}
            <div className="p-8">
              {/* Document Image (if available) */}
              {(selectedDocument.image_url && selectedDocument.image_url.trim()) && (
                <div className="mb-6">
                  <img
                    src={selectedDocument.image_url}
                    alt={selectedDocument.title}
                    className="w-full rounded-2xl shadow-lg max-h-96 object-cover"
                    onError={(e) => { e.target.parentElement.style.display = 'none' }}
                  />
                </div>
              )}

              {/* Quick Overview */}
              <div className="mb-6">
                <h3 className="text-xl font-black text-gray-800 mb-3 flex items-center gap-2">
                  📊 PoliHub Research Summary
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedDocument.summary || selectedDocument.briefing || selectedDocument.description}
                </p>
              </div>

              {/* Detailed Analysis Toggle */}
              {selectedDocument.details && Array.isArray(selectedDocument.details) && selectedDocument.details.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowDocumentDetails(!showDocumentDetails)}
                    className="flex items-center justify-between w-full bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 p-4 rounded-2xl transition font-bold text-gray-800"
                  >
                    <span>Detailed Analysis</span>
                    {showDocumentDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {showDocumentDetails && (
                    <div className={`mt-4 p-5 bg-gradient-to-br ${selectedDocument.category_color || 'from-purple-400 to-pink-500'} bg-opacity-10 rounded-2xl border-2 border-purple-200`}>
                      <h4 className="font-black text-gray-800 mb-3">Key Findings:</h4>
                      <ul className="space-y-3">
                        {(Array.isArray(selectedDocument.details) ? selectedDocument.details :
                          typeof selectedDocument.details === 'string' ? JSON.parse(selectedDocument.details) : []
                        ).map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-700">
                            <span className="text-purple-600 font-black text-lg">•</span>
                            <span className="text-sm leading-relaxed">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Access Full Document Button */}
              <div className="mb-6">
                {(() => {
                  let sources = [];

                  // Check for source_links (multiple sources)
                  if (selectedDocument.source_links) {
                    try {
                      const links = typeof selectedDocument.source_links === 'string'
                        ? JSON.parse(selectedDocument.source_links)
                        : selectedDocument.source_links;
                      sources = Object.entries(links)
                        .filter(([name, url]) => url && url.trim())
                        .map(([name, url]) => ({ name, url }));
                    } catch (e) {
                      console.error('Error parsing source_links:', e);
                    }
                  }
                  // Single source fallback - check for non-empty URLs
                  if (sources.length === 0) {
                    const docUrl = (selectedDocument.document_url && selectedDocument.document_url.trim()) ||
                                   (selectedDocument.url && selectedDocument.url.trim()) ||
                                   (selectedDocument.file_url && selectedDocument.file_url.trim());
                    if (docUrl) {
                      sources = [{
                        name: 'Official Document',
                        url: docUrl
                      }];
                    }
                  }

                  if (sources.length > 0 && sources[0].url) {
                    return (
                      <a
                        href={sources[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition shadow-lg hover:shadow-xl"
                      >
                        <BookOpen size={20} />
                        Access Full Document
                      </a>
                    );
                  } else {
                    return (
                      <>
                        <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition shadow-lg hover:shadow-xl opacity-50 cursor-not-allowed">
                          <BookOpen size={20} />
                          Access Full Document
                        </button>
                        <p className="text-center text-sm text-gray-500 mt-2 font-semibold">
                          Document link not available
                        </p>
                      </>
                    );
                  }
                })()}
              </div>

              {/* Document Information */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-100">
                <h4 className="font-black text-gray-800 mb-3 text-sm">Document Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Tag className="text-purple-600" size={16} />
                    <div>
                      <span className="text-xs text-gray-500 block">Type</span>
                      <p className="text-gray-800 font-bold text-sm">{selectedDocument.type || 'Research'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-purple-600" size={16} />
                    <div>
                      <span className="text-xs text-gray-500 block">Published</span>
                      <p className="text-gray-800 font-bold text-sm">
                        {new Date(selectedDocument.published_date || selectedDocument.date || selectedDocument.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {selectedDocument.source && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="text-purple-600" size={16} />
                      <div>
                        <span className="text-xs text-gray-500 block">Source</span>
                        <p className="text-gray-800 font-bold text-sm">{selectedDocument.source}</p>
                      </div>
                    </div>
                  )}
                  {selectedDocument.pages && (
                    <div className="flex items-center gap-2">
                      <FileText className="text-purple-600" size={16} />
                      <div>
                        <span className="text-xs text-gray-500 block">Pages</span>
                        <p className="text-gray-800 font-bold text-sm">{selectedDocument.pages} pages</p>
                      </div>
                    </div>
                  )}
                  {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                    <div className="flex items-start gap-2 col-span-2">
                      <Tag className="text-purple-600 mt-1" size={16} />
                      <div className="flex-1">
                        <span className="text-xs text-gray-500 block mb-1">Tags</span>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(selectedDocument.tags) ? selectedDocument.tags :
                            typeof selectedDocument.tags === 'string' ? JSON.parse(selectedDocument.tags) : []
                          ).map((tag, idx) => (
                            <span key={idx} className="bg-white text-purple-700 text-xs px-2 py-1 rounded-lg font-bold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setSelectedNews(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">News Article</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (navigator.share && selectedNews) {
                      navigator.share({
                        title: selectedNews.title,
                        text: selectedNews.summary || selectedNews.description,
                        url: selectedNews.url || window.location.href
                      });
                    }
                  }}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
                  title="Share Article"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedNews.image_url && (
                <img
                  src={selectedNews.image_url}
                  alt={selectedNews.title}
                  className="w-full h-48 object-cover rounded-xl mb-6"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}

              {/* Credibility Badge & Categories */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const credibilityLevel = selectedNews.credibility || 'medium';
                    const credibilityColor =
                      credibilityLevel === 'high' ? 'bg-green-100 text-green-700 border-green-300' :
                      credibilityLevel === 'low' ? 'bg-red-100 text-red-700 border-red-300' :
                      'bg-yellow-100 text-yellow-700 border-yellow-300';
                    return (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-block ${credibilityColor}`}>
                        {credibilityLevel.toUpperCase()} CREDIBILITY
                      </span>
                    );
                  })()}
                  {selectedNews.category && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                      {selectedNews.category.toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(selectedNews.published_date || selectedNews.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <h4 className="text-2xl font-black mb-4">{selectedNews.title}</h4>

              {/* Our Summary/Briefing */}
              {selectedNews.summary && (
                <div className="bg-blue-50 rounded-xl p-6 mb-6">
                  <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Eye size={18} />
                    PoliHub Briefing
                  </h5>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedNews.summary}
                  </p>
                </div>
              )}

              {/* Full Content */}
              {selectedNews.content && selectedNews.content !== selectedNews.summary && (
                <div className="mb-6">
                  <h5 className="font-bold text-gray-900 mb-3">Summary</h5>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedNews.content}
                  </p>
                </div>
              )}

              {/* Multiple Source Links */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ExternalLink size={18} />
                  Read Full Article From:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Parse sources - could be array or single source */}
                  {(() => {
                    let sources = [];

                    // If sources is an array
                    if (Array.isArray(selectedNews.sources)) {
                      sources = selectedNews.sources;
                    }
                    // If we have source_links as an object
                    else if (selectedNews.source_links && typeof selectedNews.source_links === 'object') {
                      sources = Object.entries(selectedNews.source_links).map(([name, url]) => ({
                        name,
                        url
                      }));
                    }
                    // Fallback to single source
                    else if (selectedNews.source && selectedNews.url) {
                      sources = [{ name: selectedNews.source, url: selectedNews.url }];
                    }

                    if (sources.length === 0) {
                      return (
                        <p className="text-gray-500 text-sm col-span-full">No source links available</p>
                      );
                    }

                    // Helper function to get brand-specific styling
                    const getBrandStyle = (name) => {
                      const sourceName = name.toUpperCase();

                      // KBC - Red
                      if (sourceName.includes('KBC')) {
                        return 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-200';
                      }
                      // NTV - Blue
                      if (sourceName.includes('NTV')) {
                        return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-200';
                      }
                      // CNN - Red
                      if (sourceName.includes('CNN')) {
                        return 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-200';
                      }
                      // BBC - Black
                      if (sourceName.includes('BBC')) {
                        return 'bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white shadow-gray-400';
                      }
                      // Citizen TV - Orange
                      if (sourceName.includes('CITIZEN')) {
                        return 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-orange-200';
                      }
                      // Nation - Blue
                      if (sourceName.includes('NATION')) {
                        return 'bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white shadow-blue-200';
                      }
                      // Standard - Red/Maroon
                      if (sourceName.includes('STANDARD')) {
                        return 'bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white shadow-red-300';
                      }
                      // Parliament/Hansard - Green
                      if (sourceName.includes('PARLIAMENT') || sourceName.includes('HANSARD')) {
                        return 'bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white shadow-green-200';
                      }
                      // Default - Blue
                      return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-200';
                    };

                    return sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 group ${getBrandStyle(source.name || '')}`}
                      >
                        <span className="text-sm uppercase tracking-wide">{source.name || `Source ${index + 1}`}</span>
                        <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promise Detail Modal */}
      {selectedPromise && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setSelectedPromise(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">Promise Details</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (navigator.share && selectedPromise) {
                      navigator.share({
                        title: selectedPromise.title || selectedPromise.commitment_text,
                        text: selectedPromise.description || selectedPromise.details,
                        url: window.location.href
                      });
                    }
                  }}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
                  title="Share Promise"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={() => setSelectedPromise(null)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Status & Category Badges */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {getStatusIcon(selectedPromise.status)}
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedPromise.status)}`}>
                  {selectedPromise.status?.toUpperCase().replace('_', ' ')}
                </span>
                {selectedPromise.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-300">
                    {selectedPromise.category.toUpperCase()}
                  </span>
                )}
              </div>

              <h4 className="text-2xl font-black mb-4">{selectedPromise.title || selectedPromise.commitment_text}</h4>

              {/* Promise Image */}
              {selectedPromise.image_url && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img
                    src={selectedPromise.image_url}
                    alt={selectedPromise.title || 'Promise image'}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Promise Summary/Briefing */}
              {selectedPromise.summary && (
                <div className="bg-green-50 rounded-xl p-6 mb-6">
                  <h5 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                    <Eye size={18} />
                    Commitment Overview
                  </h5>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedPromise.summary}
                  </p>
                </div>
              )}

              {/* Full Description */}
              <div className="mb-6">
                <h5 className="font-bold text-gray-900 mb-3">Details</h5>
                <p className="text-gray-700 leading-relaxed">
                  {selectedPromise.description || selectedPromise.details}
                </p>
              </div>

              {/* Progress Bar */}
              {(selectedPromise.progress_percentage !== undefined || selectedPromise.progress !== undefined) && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">Progress</span>
                    <span className="text-sm font-bold text-green-600">
                      {selectedPromise.progress_percentage || selectedPromise.progress}%
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${selectedPromise.progress_percentage || selectedPromise.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Date Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {selectedPromise.date_made && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 mb-1">Date Made</div>
                    <div className="font-bold">{new Date(selectedPromise.date_made).toLocaleDateString()}</div>
                  </div>
                )}
                {selectedPromise.deadline && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 mb-1">Deadline</div>
                    <div className="font-bold">{new Date(selectedPromise.deadline).toLocaleDateString()}</div>
                  </div>
                )}
              </div>

              {/* Evidence & Sources Section */}
              {(selectedPromise.evidence || selectedPromise.evidence_url || selectedPromise.evidence_text ||
                selectedPromise.source_links) && (
                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6">
                  <h5 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Eye size={18} />
                    Evidence & Verification
                  </h5>

                  {(selectedPromise.evidence_text || selectedPromise.evidence) && (
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {selectedPromise.evidence_text || selectedPromise.evidence}
                    </p>
                  )}

                  {/* Multiple Sources/Evidence Links */}
                  {(() => {
                    let sources = [];

                    // Check for multiple source_links
                    if (selectedPromise.source_links) {
                      const links = typeof selectedPromise.source_links === 'string'
                        ? JSON.parse(selectedPromise.source_links)
                        : selectedPromise.source_links;
                      sources = Object.entries(links).map(([name, url]) => ({ name, url }));
                    }
                    // Single evidence URL
                    else if (selectedPromise.evidence_url) {
                      sources = [{
                        name: 'Evidence Documentation',
                        url: selectedPromise.evidence_url
                      }];
                    }

                    if (sources.length === 0) return null;

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sources.map((source, index) => (
                          <a
                            key={index}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-700 rounded-lg font-bold hover:bg-blue-50 transition group"
                          >
                            <span>{source.name}</span>
                            <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                          </a>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vote Detail Modal */}
      {selectedVote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setSelectedVote(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">Voting Record</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (navigator.share && selectedVote) {
                      navigator.share({
                        title: selectedVote.bill_title || selectedVote.title,
                        text: `Voted ${selectedVote.vote?.toUpperCase()} - ${selectedVote.description || selectedVote.summary || ''}`,
                        url: window.location.href
                      });
                    }
                  }}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
                  title="Share Voting Record"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={() => setSelectedVote(null)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedVote.vote === 'yes' || selectedVote.vote === 'approved' ? 'bg-green-100 text-green-700' :
                  selectedVote.vote === 'no' || selectedVote.vote === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  VOTED: {selectedVote.vote?.toUpperCase() || 'ABSTAIN'}
                </span>
              </div>
              <h4 className="text-2xl font-black mb-4">{selectedVote.bill_title || selectedVote.title}</h4>
              <p className="text-gray-700 leading-relaxed mb-6">
                {selectedVote.description || selectedVote.summary || selectedVote.details}
              </p>

              {/* Voting Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {selectedVote.vote_date && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 mb-1">Vote Date</div>
                    <div className="font-bold">{new Date(selectedVote.vote_date).toLocaleDateString()}</div>
                  </div>
                )}
                {selectedVote.bill_number && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 mb-1">Bill Number</div>
                    <div className="font-bold">{selectedVote.bill_number}</div>
                  </div>
                )}
                {selectedVote.legislative_session && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 mb-1">Legislative Session</div>
                    <div className="font-bold">{selectedVote.legislative_session}</div>
                  </div>
                )}
                {selectedVote.category && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 mb-1">Category</div>
                    <div className="font-bold">{selectedVote.category}</div>
                  </div>
                )}
                {selectedVote.bill_status && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 mb-1">Bill Status</div>
                    <div className={`font-bold ${
                      selectedVote.bill_status === 'passed' ? 'text-green-600' :
                      selectedVote.bill_status === 'failed' ? 'text-red-600' :
                      'text-gray-700'
                    }`}>
                      {selectedVote.bill_status?.toUpperCase() || 'PENDING'}
                    </div>
                  </div>
                )}
                {selectedVote.vote_result && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 mb-1">Final Result</div>
                    <div className="font-bold">{selectedVote.vote_result}</div>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              {selectedVote.notes && (
                <div className="bg-indigo-50 rounded-xl p-6 mb-6">
                  <h5 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <FileText size={18} />
                    Additional Notes
                  </h5>
                  <p className="text-gray-700 text-sm">{selectedVote.notes}</p>
                </div>
              )}

              {/* Bill Text & Sources */}
              {(selectedVote.bill_url || selectedVote.source_url || selectedVote.source_links) && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                  <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ExternalLink size={18} />
                    Bill Text & References
                  </h5>

                  {(() => {
                    let sources = [];

                    // Check for multiple source_links
                    if (selectedVote.source_links) {
                      const links = typeof selectedVote.source_links === 'string'
                        ? JSON.parse(selectedVote.source_links)
                        : selectedVote.source_links;
                      sources = Object.entries(links).map(([name, url]) => ({ name, url }));
                    }
                    // Single bill URL or source URL
                    else if (selectedVote.bill_url || selectedVote.source_url) {
                      sources = [{
                        name: 'Full Bill Text',
                        url: selectedVote.bill_url || selectedVote.source_url
                      }];
                    }

                    if (sources.length === 0) return null;

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sources.map((source, index) => (
                          <a
                            key={index}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-indigo-200 hover:border-indigo-400 text-indigo-700 rounded-lg font-bold hover:bg-indigo-50 transition group"
                          >
                            <FileText size={16} />
                            <span>{source.name}</span>
                            <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                          </a>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline Event Detail Modal */}
      {selectedTimelineEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setSelectedTimelineEvent(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">Timeline Event</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (navigator.share && selectedTimelineEvent) {
                      navigator.share({
                        title: selectedTimelineEvent.title || selectedTimelineEvent.event_title,
                        text: selectedTimelineEvent.description || selectedTimelineEvent.details,
                        url: window.location.href
                      });
                    }
                  }}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
                  title="Share Event"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={() => setSelectedTimelineEvent(null)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Event Type & Category */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {selectedTimelineEvent.type && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-300">
                    {selectedTimelineEvent.type.toUpperCase()}
                  </span>
                )}
                {selectedTimelineEvent.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-300">
                    {selectedTimelineEvent.category.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="text-sm font-bold text-purple-600 mb-4">
                {new Date(selectedTimelineEvent.date || selectedTimelineEvent.event_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </div>

              <h4 className="text-2xl font-black mb-4">
                {selectedTimelineEvent.title || selectedTimelineEvent.event_title}
              </h4>

              {/* Timeline Event Image */}
              {selectedTimelineEvent.image_url && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img
                    src={selectedTimelineEvent.image_url}
                    alt={selectedTimelineEvent.title || 'Timeline event image'}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Event Briefing/Summary */}
              {selectedTimelineEvent.summary && (
                <div className="bg-purple-50 rounded-xl p-6 mb-6">
                  <h5 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <Eye size={18} />
                    Event Summary
                  </h5>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedTimelineEvent.summary}
                  </p>
                </div>
              )}

              {/* Full Description */}
              <div className="mb-6">
                <h5 className="font-bold text-gray-900 mb-3">Details</h5>
                <p className="text-gray-700 leading-relaxed">
                  {selectedTimelineEvent.description || selectedTimelineEvent.details}
                </p>
              </div>

              {/* Sources & Verification */}
              {(selectedTimelineEvent.source || selectedTimelineEvent.source_url || selectedTimelineEvent.source_links) && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                  <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ExternalLink size={18} />
                    Sources & Verification
                  </h5>

                  {(() => {
                    let sources = [];

                    // Check for multiple source_links
                    if (selectedTimelineEvent.source_links) {
                      const links = typeof selectedTimelineEvent.source_links === 'string'
                        ? JSON.parse(selectedTimelineEvent.source_links)
                        : selectedTimelineEvent.source_links;
                      sources = Object.entries(links).map(([name, url]) => ({ name, url }));
                    }
                    // Single source fallback
                    else if (selectedTimelineEvent.source_url) {
                      sources = [{
                        name: selectedTimelineEvent.source || 'Official Source',
                        url: selectedTimelineEvent.source_url
                      }];
                    }

                    if (sources.length === 0) {
                      return (
                        <p className="text-gray-600 text-sm">
                          Source: {selectedTimelineEvent.source || 'Official Records'}
                        </p>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sources.map((source, index) => (
                          <a
                            key={index}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-purple-200 hover:border-purple-400 text-purple-700 rounded-lg font-bold hover:bg-purple-50 transition group"
                          >
                            <span>{source.name}</span>
                            <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                          </a>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share/Export Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">Share Profile</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">Share {politician.full_name || politician.name}'s profile</p>
              <div className="space-y-3">
                {/* Copy Link Button */}
                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url).then(() => {
                      alert('✅ Profile link copied to clipboard!');
                    }).catch(() => {
                      alert('❌ Failed to copy link');
                    });
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <LinkIcon size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold">Copy Profile Link</div>
                    <div className="text-sm text-gray-600">Share via any platform</div>
                  </div>
                </button>

                {/* Native Share (if available) */}
                {navigator.share && (
                  <button
                    onClick={() => {
                      navigator.share({
                        title: politician.full_name || politician.name,
                        text: `Check out ${politician.full_name || politician.name}'s profile on PoliHub!`,
                        url: window.location.href
                      }).catch(err => console.log('Error sharing:', err));
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition group"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                      <Share2 size={24} className="text-purple-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold">Share Profile</div>
                      <div className="text-sm text-gray-600">Use native share options</div>
                    </div>
                  </button>
                )}

                {/* Social Media Share Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Twitter */}
                  <button
                    onClick={() => {
                      const text = `Check out ${politician.full_name || politician.name}'s profile on PoliHub!`;
                      const url = window.location.href;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition group"
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                      <Twitter size={24} className="text-white" />
                    </div>
                    <div className="text-xs font-bold text-blue-700">Twitter</div>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="flex flex-col items-center gap-2 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition group"
                  >
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-bold text-indigo-700">Facebook</div>
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={() => {
                      const text = `Check out ${politician.full_name || politician.name}'s profile: ${window.location.href}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition group"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-bold text-green-700">WhatsApp</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Party History Modal */}
      {showPartyHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowPartyHistoryModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">Political Party History</h3>
              <button
                onClick={() => setShowPartyHistoryModal(false)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {partyHistory && partyHistory.length > 0 ? (
                <div className="space-y-4">
                  {partyHistory.map((party, index) => (
                    <div key={party.id || index} className={`rounded-xl p-6 ${party.is_current ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300' : 'bg-gray-50'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-lg">
                          {party.party_name}
                        </div>
                        {party.is_current && (
                          <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <span className="font-bold">
                          {party.start_date ? new Date(party.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Unknown'}
                        </span>
                        <span>→</span>
                        <span className="font-bold">
                          {party.end_date ? new Date(party.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present'}
                        </span>
                      </div>

                      {party.analysis && (
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <h5 className="font-bold mb-2 text-purple-900">Analysis</h5>
                          <p className="text-gray-700 leading-relaxed">{party.analysis}</p>
                        </div>
                      )}

                      {/* Source Tabs */}
                      <SourceButtons
                        sources={party.sources}
                        hintText="🏛️ Verify party affiliation history"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                    <div className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-lg mb-3">
                      {politician.party}
                    </div>
                    <p className="text-gray-700">Current political party</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h5 className="font-bold mb-2">Analysis</h5>
                    <p className="text-gray-700">
                      {politician.full_name || politician.name} is currently affiliated with {politician.party}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Constituency Information Modal */}
      {showConstituencyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowConstituencyModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">Constituency Information</h3>
              <button
                onClick={() => setShowConstituencyModal(false)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <h4 className="text-2xl font-black mb-6">{fullPolitician.constituency || fullPolitician.district || fullPolitician.state || `${fullPolitician.party} Party`}</h4>

              <div className="space-y-4">
                <div className="bg-green-50 rounded-xl p-6">
                  <h5 className="font-bold text-green-900 mb-2">Representation</h5>
                  <p className="text-gray-700 leading-relaxed">
                    {fullPolitician.constituency_representation ||
                      `${fullPolitician.full_name || fullPolitician.name} represents ${fullPolitician.constituency || fullPolitician.district || fullPolitician.state || 'their constituents'} in the ${fullPolitician.chamber}.`
                    }
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <h5 className="font-bold text-blue-900 mb-2">Focus Areas</h5>
                  <p className="text-gray-700 leading-relaxed">
                    {fullPolitician.constituency_focus_areas ||
                      'Working to advance policies and serve constituents across various sectors including healthcare, education, infrastructure, and economic development.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Modal */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowAchievementModal(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <Trophy size={28} />
                Major Achievements
              </h3>
              <button
                onClick={() => setShowAchievementModal(false)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <h4 className="text-2xl font-black mb-6">{politician.full_name || politician.name}</h4>

              {achievements && achievements.length > 0 ? (
                <div className="space-y-4">
                  {achievements.map((achievement, index) => {
                    const categoryColors = {
                      legislation: 'from-blue-50 to-indigo-50 border-blue-300',
                      infrastructure: 'from-gray-50 to-slate-50 border-gray-300',
                      education: 'from-green-50 to-emerald-50 border-green-300',
                      healthcare: 'from-red-50 to-pink-50 border-red-300',
                      economy: 'from-yellow-50 to-amber-50 border-yellow-300',
                      environment: 'from-teal-50 to-cyan-50 border-teal-300',
                      social: 'from-purple-50 to-violet-50 border-purple-300',
                      security: 'from-orange-50 to-red-50 border-orange-300',
                      other: 'from-gray-50 to-slate-50 border-gray-300'
                    };

                    return (
                      <div key={achievement.id || index} className={`bg-gradient-to-r ${categoryColors[achievement.category] || categoryColors.other} border-2 rounded-xl p-6`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-black text-lg text-gray-900 mb-1">{achievement.title}</h5>
                            {achievement.achievement_date && (
                              <div className="text-sm text-gray-600 font-bold">
                                {new Date(achievement.achievement_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                            )}
                          </div>
                          {achievement.category && (
                            <span className="px-3 py-1 bg-white/80 text-xs font-bold rounded-full capitalize ml-3">
                              {achievement.category}
                            </span>
                          )}
                        </div>
                        {achievement.description && (
                          <p className="text-gray-700 leading-relaxed mt-3 mb-4">{achievement.description}</p>
                        )}

                        {/* Source Tabs */}
                        <SourceButtons
                          sources={achievement.sources}
                          hintText="🏆 Verify achievements from reliable sources"
                          className="mt-4"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  {/* Fallback content when no achievements in database */}
                  {politician.key_achievements ? (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 mb-6">
                      <h5 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                        <Trophy size={20} />
                        Highlighted Achievements
                      </h5>
                      <p className="text-gray-700 leading-relaxed">{politician.key_achievements}</p>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 mb-6">
                      <h5 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                        <Trophy size={20} />
                        Career Highlights
                      </h5>
                      <p className="text-gray-700 leading-relaxed">
                        {politician.full_name || politician.name} has served {politician.years_in_office || 'multiple'} years in the {politician.chamber},
                        representing {politician.constituency || politician.district || politician.state || 'their constituents'} with dedication and commitment.
                      </p>
                    </div>
                  )}

                  {/* Experience Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {politician.years_in_office && (
                      <div className="bg-white border-2 border-yellow-200 rounded-xl p-6 text-center">
                        <div className="text-4xl font-black text-yellow-600 mb-2">{politician.years_in_office}</div>
                        <div className="text-sm font-bold text-gray-600">Years in Office</div>
                      </div>
                    )}
                    )}
                  </div>

                  {/* Leadership & Impact */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <Briefcase size={18} />
                        Leadership Role
                      </h5>
                      <p className="text-gray-700">
                        Serving as {politician.title || politician.position} for {politician.party} in the {politician.chamber}.
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-6">
                      <h5 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                        <MapPin size={18} />
                        Constituency Impact
                      </h5>
                      <p className="text-gray-700">
                        Actively working to improve policies and services for constituents in {politician.constituency || politician.district || politician.state || 'the region'}.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
