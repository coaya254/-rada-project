import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, FileText, Calendar, CheckCircle, Vote, Newspaper, Users, Trophy } from 'lucide-react';
import SourceButtonManager from './SourceButtonManager';

export default function PoliticianFormEnhanced({ selectedItem, onClose, onSave }) {
  // Helper function to convert database date to input date format
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    } catch (e) {
      return '';
    }
  };

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    // Basic Info
    full_name: '',
    nickname: '',
    title: '',
    party: '',
    chamber: 'National Assembly',
    state: '',
    district: '',
    county: '',
    image_url: '',
    image_source: '',
    biography: '',
    date_of_birth: '',
    years_in_office: '',
    status: 'active',

    // Contact
    office_address: '',
    phone: '',
    email: '',
    website: '',
    twitter_handle: '',
    instagram_handle: '',
    facebook_url: '',
    wikipedia_url: '',

    // Constituency Information
    constituency_representation: '',
    constituency_focus_areas: '',

    // Party History
    party_history: [],

    // Achievements
    achievements: [],

    // Documents
    documents: [],

    // News
    news: [],

    // Timeline
    timeline: [],

    // Commitments/Promises
    commitments: [],

    // Voting Records
    voting_records: [],

    // Merge with selectedItem if provided, ensuring arrays default to empty
    ...(selectedItem || {}),
    // Fix date format for date inputs
    date_of_birth: selectedItem?.date_of_birth ? formatDateForInput(selectedItem.date_of_birth) : '',
    documents: (selectedItem?.documents || []).map(doc => ({
      ...doc,
      date: doc.date ? formatDateForInput(doc.date) : '',
      published_date: doc.published_date ? formatDateForInput(doc.published_date) : '',
      source_ids: doc.sources ? doc.sources.map(s => s.id) : []
    })),
    news: (selectedItem?.news || []).map(item => ({
      ...item,
      date: item.date ? formatDateForInput(item.date) : '',
      source_ids: item.sources ? item.sources.map(s => s.id) : []
    })),
    timeline: (selectedItem?.timeline || []).map(event => ({
      ...event,
      date: event.date ? formatDateForInput(event.date) : '',
      source_ids: event.sources ? event.sources.map(s => s.id) : []
    })),
    commitments: (selectedItem?.commitments || []).map(comm => ({
      ...comm,
      date_made: comm.date_made ? formatDateForInput(comm.date_made) : '',
      deadline: comm.deadline ? formatDateForInput(comm.deadline) : '',
      source_ids: comm.sources ? comm.sources.map(s => s.id) : []
    })),
    voting_records: (selectedItem?.voting_records || []).map(vote => ({
      ...vote,
      vote_date: vote.vote_date ? formatDateForInput(vote.vote_date) : '',
      source_ids: vote.sources ? vote.sources.map(s => s.id) : []
    })),
    party_history: (selectedItem?.party_history || []).map(party => ({
      ...party,
      start_date: party.start_date ? formatDateForInput(party.start_date) : '',
      end_date: party.end_date ? formatDateForInput(party.end_date) : '',
      source_ids: party.sources ? party.sources.map(s => s.id) : []
    })),
    achievements: (selectedItem?.achievements || []).map(achievement => ({
      ...achievement,
      achievement_date: achievement.achievement_date ? formatDateForInput(achievement.achievement_date) : '',
      sources: achievement.sources || []
    }))
  });

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'party_history', label: 'Party History', icon: Users },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'promises', label: 'Promises', icon: CheckCircle },
    { id: 'voting', label: 'Voting', icon: Vote }
  ];

  // ========== DOCUMENTS ==========
  const addDocument = () => {
    setFormData({
      ...formData,
      documents: [...formData.documents, {
        id: Date.now(),
        title: '',
        subtitle: '',
        icon: '📄',
        type: 'report',
        category: '',
        category_color: 'from-purple-400 to-pink-500',
        source: '',
        sources: [], // Array of source objects: [{name, url, color}]
        date: new Date().toISOString().split('T')[0],
        published_date: new Date().toISOString().split('T')[0],
        briefing: '',
        summary: '',
        description: '',
        details: [],
        image_url: '',
        file_url: '',
        document_url: '',
        pages: '',
        tags: [],
        source_links: {}
      }]
    });
  };

  const updateDocument = (index, field, value) => {
    const newDocs = [...formData.documents];
    newDocs[index][field] = value;
    setFormData({ ...formData, documents: newDocs });
  };

  const removeDocument = (index) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((_, i) => i !== index)
    });
  };

  // ========== NEWS ==========
  const addNews = () => {
    setFormData({
      ...formData,
      news: [...formData.news, {
        id: Date.now(),
        title: '',
        content: '',
        icon: '📰',
        image_url: '',
        source: '',
        source_url: '',
        credibility: 'medium',
        date: new Date().toISOString().split('T')[0],
        url: '',
        status: 'published',
        sources: [], // Array of {name, url} for multiple sources
        sources: [] // Array of source IDs
      }]
    });
  };

  const updateNews = (index, field, value) => {
    const newNews = [...formData.news];
    newNews[index][field] = value;
    setFormData({ ...formData, news: newNews });
  };

  const removeNews = (index) => {
    setFormData({
      ...formData,
      news: formData.news.filter((_, i) => i !== index)
    });
  };

  const addNewsSource = (newsIndex) => {
    const newNews = [...formData.news];
    if (!newNews[newsIndex].sources) {
      newNews[newsIndex].sources = [];
    }
    newNews[newsIndex].sources.push({ name: '', url: '' });
    setFormData({ ...formData, news: newNews });
  };

  const updateNewsSource = (newsIndex, sourceIndex, field, value) => {
    const newNews = [...formData.news];
    newNews[newsIndex].sources[sourceIndex][field] = value;
    setFormData({ ...formData, news: newNews });
  };

  const removeNewsSource = (newsIndex, sourceIndex) => {
    const newNews = [...formData.news];
    newNews[newsIndex].sources = newNews[newsIndex].sources.filter((_, i) => i !== sourceIndex);
    setFormData({ ...formData, news: newNews });
  };

  // ========== TIMELINE ==========
  const addTimelineEvent = () => {
    setFormData({
      ...formData,
      timeline: [...formData.timeline, {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        title: '',
        description: '',
        type: 'achievement',
        icon: '📅',
        image_url: '',
        source: '',
        source_url: '',
        category: '',
        sources: []
      }]
    });
  };

  const updateTimeline = (index, field, value) => {
    const newTimeline = [...formData.timeline];
    newTimeline[index][field] = value;
    setFormData({ ...formData, timeline: newTimeline });
  };

  const removeTimeline = (index) => {
    setFormData({
      ...formData,
      timeline: formData.timeline.filter((_, i) => i !== index)
    });
  };

  // ========== COMMITMENTS ==========
  const addCommitment = () => {
    setFormData({
      ...formData,
      commitments: [...formData.commitments, {
        id: Date.now(),
        title: '',
        description: '',
        status: 'in_progress',
        category: '',
        custom_category: '',
        type: '',
        custom_type: '',
        date_made: new Date().toISOString().split('T')[0],
        deadline: '',
        progress: 0,
        progress_percentage: 0,
        icon: '🤝',
        image_url: '',
        source: '',
        source_url: '',
        sources: []
      }]
    });
  };

  const updateCommitment = (index, field, value) => {
    const newCommitments = [...formData.commitments];
    newCommitments[index][field] = value;
    setFormData({ ...formData, commitments: newCommitments });
  };

  const removeCommitment = (index) => {
    setFormData({
      ...formData,
      commitments: formData.commitments.filter((_, i) => i !== index)
    });
  };

  // ========== PARTY HISTORY ==========
  const addPartyHistory = () => {
    setFormData({
      ...formData,
      party_history: [...formData.party_history, {
        id: Date.now(),
        party_name: '',
        start_date: '',
        end_date: '',
        analysis: '',
        is_current: false,
        sources: []
      }]
    });
  };

  const updatePartyHistory = (index, field, value) => {
    const newPartyHistory = [...formData.party_history];
    newPartyHistory[index][field] = value;
    setFormData({ ...formData, party_history: newPartyHistory });
  };

  const removePartyHistory = (index) => {
    setFormData({
      ...formData,
      party_history: formData.party_history.filter((_, i) => i !== index)
    });
  };

  // ========== ACHIEVEMENTS ==========
  const addAchievement = () => {
    setFormData({
      ...formData,
      achievements: [...formData.achievements, {
        id: Date.now(),
        title: '',
        description: '',
        achievement_date: new Date().toISOString().split('T')[0],
        category: '',
        custom_category: '',
        sources: []
      }]
    });
  };

  const updateAchievement = (index, field, value) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index][field] = value;
    setFormData({ ...formData, achievements: newAchievements });
  };

  const removeAchievement = (index) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index)
    });
  };

  // ========== VOTING RECORDS ==========
  const addVotingRecord = () => {
    setFormData({
      ...formData,
      voting_records: [...formData.voting_records, {
        id: Date.now(),
        bill_title: '',        // ✅ Changed from bill_name
        bill_number: '',       // ✅ Added
        bill_description: '',  // ✅ Changed from description
        vote_value: 'for',     // ✅ Changed from vote: 'yes'
        vote_date: new Date().toISOString().split('T')[0],
        category: '',
        custom_category: '',
        reasoning: '',         // ✅ Added
        session_name: '',      // ✅ Added
        icon: '🗳️',
        image_url: '',
        sources: []
      }]
    });
  };

  const updateVotingRecord = (index, field, value) => {
    const newRecords = [...formData.voting_records];
    newRecords[index][field] = value;
    setFormData({ ...formData, voting_records: newRecords });
  };

  const removeVotingRecord = (index) => {
    setFormData({
      ...formData,
      voting_records: formData.voting_records.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.party) {
      alert('Please fill in name and party');
      return;
    }

    // Don't close modal - let parent decide based on save success/failure
    await onSave(formData);
  };

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-4">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-white z-10 pb-4">
        <h2 className="text-3xl font-black">{selectedItem ? 'Edit' : 'Create'} Politician</h2>
        <button onClick={onClose} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* BASIC INFO TAB */}
      {activeTab === 'basic' && (
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-100 space-y-4">
          <h3 className="text-xl font-black mb-4">Basic Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Alexandria Ocasio-Cortez"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Nickname</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="AOC"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Representative"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Party *</label>
              <input
                type="text"
                value={formData.party}
                onChange={(e) => setFormData({...formData, party: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Democrat"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">House (Chamber)</label>
              <select
                value={formData.chamber}
                onChange={(e) => setFormData({...formData, chamber: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="National Assembly">National Assembly</option>
                <option value="Senate">Senate</option>
                <option value="Governor">Governor</option>
                <option value="County Assembly">County Assembly</option>
                <option value="Cabinet">Cabinet</option>
                <option value="Executive">Executive</option>
                <option value="County">County</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">County</label>
              <input
                type="text"
                value={formData.county || formData.state}
                onChange={(e) => setFormData({...formData, county: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Nairobi, Mombasa, Kisumu, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Constituency</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Westlands, Dagoretti, etc."
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold mb-2">Profile Image</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Or Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // You would typically upload this to your server/storage
                        // For now, create a temporary URL
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({...formData, image_url: reader.result});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs text-gray-600 mb-1">Image Source (Copyright Attribution)</label>
                <input
                  type="text"
                  value={formData.image_source || ''}
                  onChange={(e) => setFormData({...formData, image_source: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                  placeholder="e.g., Official Parliament Photo, Wikimedia Commons, etc."
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold mb-2">Biography</label>
              <textarea
                value={formData.biography}
                onChange={(e) => setFormData({...formData, biography: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Background and key information..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Years in Office</label>
              <input
                type="number"
                value={formData.years_in_office}
                onChange={(e) => setFormData({...formData, years_in_office: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="6"
              />
            </div>

            {/* Contact Info */}
            <div className="col-span-2 pt-4">
              <h4 className="text-lg font-black mb-3">Contact Information</h4>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold mb-2">Office Address</label>
              <input
                type="text"
                value={formData.office_address}
                onChange={(e) => setFormData({...formData, office_address: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Twitter</label>
              <input
                type="text"
                value={formData.twitter_handle}
                onChange={(e) => setFormData({...formData, twitter_handle: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="@username"
              />
            </div>
          </div>

          {/* Constituency Information Section */}
          <div className="mt-6 pt-6 border-t-2 border-blue-200">
            <h3 className="text-xl font-black mb-4 text-blue-900">Constituency Information</h3>
            <p className="text-sm text-gray-600 mb-4">Describe the politician's representation and focus areas</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Representation Description</label>
                <textarea
                  value={formData.constituency_representation || ''}
                  onChange={(e) => setFormData({...formData, constituency_representation: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  rows={4}
                  placeholder="Describe how this politician represents their constituency (e.g., 'Represents Nairobi County in the National Assembly, advocating for urban development and infrastructure improvements...')"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Focus Areas</label>
                <textarea
                  value={formData.constituency_focus_areas || ''}
                  onChange={(e) => setFormData({...formData, constituency_focus_areas: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  rows={4}
                  placeholder="List the main focus areas (e.g., 'Working to advance policies in healthcare, education, infrastructure, economic development, youth employment, and environmental conservation...')"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PARTY HISTORY TAB */}
      {activeTab === 'party_history' && (
        <div className="bg-indigo-50 rounded-xl p-6 border-2 border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-black text-indigo-900">Political Party History</h3>
              <p className="text-xs text-gray-600">Track party affiliations over time with analysis</p>
            </div>
            <button onClick={addPartyHistory} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-600 transition">
              <Plus size={18} /> Add Party
            </button>
          </div>

          <div className="space-y-4">
            {formData.party_history.map((party, idx) => (
              <div key={party.id} className="bg-white rounded-lg p-6 border-2 border-indigo-200 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-indigo-600 flex items-center gap-2">
                    <Users size={16} />
                    Party Affiliation {idx + 1}
                  </span>
                  <button onClick={() => removePartyHistory(idx)} className="text-red-600 hover:text-red-700 transition">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold mb-2">Party Name *</label>
                    <input
                      type="text"
                      value={party.party_name}
                      onChange={(e) => updatePartyHistory(idx, 'party_name', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                      placeholder="e.g., Democratic Party, Republican Party"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Start Date</label>
                    <input
                      type="date"
                      value={party.start_date}
                      onChange={(e) => updatePartyHistory(idx, 'start_date', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">End Date (leave empty if current)</label>
                    <input
                      type="date"
                      value={party.end_date}
                      onChange={(e) => updatePartyHistory(idx, 'end_date', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold mb-2">Analysis</label>
                    <textarea
                      value={party.analysis}
                      onChange={(e) => updatePartyHistory(idx, 'analysis', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                      rows={3}
                      placeholder="Describe the political alignment during this period..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={party.is_current}
                        onChange={(e) => updatePartyHistory(idx, 'is_current', e.target.checked)}
                        className="w-5 h-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-bold">Current Party Affiliation</span>
                    </label>
                  </div>

                  {/* Sources Manager */}
                  <SourceButtonManager
                    sources={party.sources || []}
                    onChange={(newSources) => updatePartyHistory(idx, 'sources', newSources)}
                    label="Party History Sources"
                  />
                </div>
              </div>
            ))}

            {formData.party_history.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-2 opacity-30" />
                <p>No party history added yet. Click "Add Party" to start.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACHIEVEMENTS TAB */}
      {activeTab === 'achievements' && (
        <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-black text-amber-900">Major Achievements</h3>
              <p className="text-xs text-gray-600">Document significant accomplishments and milestones</p>
            </div>
            <button onClick={addAchievement} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition">
              <Plus size={18} /> Add Achievement
            </button>
          </div>

          <div className="space-y-4">
            {formData.achievements.map((achievement, idx) => (
              <div key={achievement.id} className="bg-white rounded-lg p-6 border-2 border-amber-200 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-amber-600 flex items-center gap-2">
                    <Trophy size={16} />
                    Achievement {idx + 1}
                  </span>
                  <button onClick={() => removeAchievement(idx)} className="text-red-600 hover:text-red-700 transition">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold mb-2">Title *</label>
                    <input
                      type="text"
                      value={achievement.title}
                      onChange={(e) => updateAchievement(idx, 'title', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                      placeholder="e.g., Passed Healthcare Reform Bill"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Date</label>
                    <input
                      type="date"
                      value={achievement.achievement_date}
                      onChange={(e) => updateAchievement(idx, 'achievement_date', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Category</label>
                    <select
                      value={achievement.category}
                      onChange={(e) => updateAchievement(idx, 'category', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">Select Category</option>
                      <option value="legislation">Legislation</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="education">Education</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="economy">Economy</option>
                      <option value="environment">Environment</option>
                      <option value="social">Social Issues</option>
                      <option value="security">Security</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Custom Category</label>
                    <input
                      type="text"
                      value={achievement.custom_category || ''}
                      onChange={(e) => updateAchievement(idx, 'custom_category', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                      placeholder="Enter custom category (optional)"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold mb-2">Description</label>
                    <textarea
                      value={achievement.description}
                      onChange={(e) => updateAchievement(idx, 'description', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                      rows={4}
                      placeholder="Describe the achievement and its impact..."
                    />
                  </div>

                  {/* Sources Manager */}
                  <SourceButtonManager
                    sources={achievement.sources || []}
                    onChange={(newSources) => updateAchievement(idx, 'sources', newSources)}
                    label="Achievement Sources"
                  />
                </div>
              </div>
            ))}

            {formData.achievements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Trophy size={48} className="mx-auto mb-2 opacity-30" />
                <p>No achievements added yet. Click "Add Achievement" to start.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENTS TAB - Research Focused */}
      {activeTab === 'documents' && (
        <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-black">Research Documents</h3>
              <p className="text-xs text-gray-600">Add research documents with briefings and multiple sources</p>
            </div>
            <button onClick={addDocument} className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition">
              <Plus size={18} /> Add Document
            </button>
          </div>

          <div className="space-y-4">
            {formData.documents.map((doc, idx) => (
              <div key={doc.id} className="bg-white rounded-lg p-6 border-2 border-purple-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-purple-600 flex items-center gap-2">
                    <FileText size={16} />
                    Document {idx + 1}
                  </span>
                  <button onClick={() => removeDocument(idx)} className="text-red-600 hover:text-red-700 transition">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Title & Subtitle */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700">Title *</label>
                      <input
                        type="text"
                        value={doc.title}
                        onChange={(e) => updateDocument(idx, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                        placeholder="Constitutional Amendment Review"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700">Subtitle</label>
                      <input
                        type="text"
                        value={doc.subtitle || ''}
                        onChange={(e) => updateDocument(idx, 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                        placeholder="Analysis of Article V amendment processes and federal-state power balance"
                      />
                    </div>
                  </div>

                  {/* Icon, Type, Category */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700">Icon (Emoji)</label>
                      <select
                        value={doc.icon || '📄'}
                        onChange={(e) => updateDocument(idx, 'icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-center text-2xl"
                      >
                        <option value="📄">📄 Document</option>
                        <option value="⚖️">⚖️ Law/Justice</option>
                        <option value="🏛️">🏛️ Government</option>
                        <option value="📊">📊 Report/Data</option>
                        <option value="📋">📋 Policy</option>
                        <option value="📝">📝 Legislation</option>
                        <option value="🌍">🌍 Environment</option>
                        <option value="💼">💼 Business</option>
                        <option value="🏥">🏥 Healthcare</option>
                        <option value="🎓">🎓 Education</option>
                        <option value="🏗️">🏗️ Infrastructure</option>
                        <option value="🌾">🌾 Agriculture</option>
                        <option value="💰">💰 Finance</option>
                        <option value="🔒">🔒 Security</option>
                        <option value="👥">👥 Social</option>
                        <option value="🗳️">🗳️ Elections</option>
                        <option value="📈">📈 Economy</option>
                        <option value="🌐">🌐 International</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700">Type</label>
                      <select
                        value={doc.type}
                        onChange={(e) => updateDocument(idx, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                      >
                        <option value="report">Report</option>
                        <option value="legislation">Legislation</option>
                        <option value="policy">Policy</option>
                        <option value="analysis">Analysis</option>
                        <option value="research">Research</option>
                        <option value="briefing">Briefing</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700">Category</label>
                      <input
                        type="text"
                        value={doc.category || ''}
                        onChange={(e) => updateDocument(idx, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                        placeholder="Policy, Report, etc."
                      />
                    </div>
                  </div>

                  {/* Sources Manager */}
                  <SourceButtonManager
                    sources={doc.sources || []}
                    onChange={(newSources) => updateDocument(idx, 'sources', newSources)}
                    label="Document Sources"
                  />

                  {/* Category Color & Dates */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700">Category Color (Gradient)</label>
                      <select
                        value={doc.category_color || 'from-purple-400 to-pink-500'}
                        onChange={(e) => updateDocument(idx, 'category_color', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                      >
                        <option value="from-purple-400 to-pink-500">Purple to Pink</option>
                        <option value="from-emerald-400 to-teal-500">Emerald to Teal</option>
                        <option value="from-amber-400 to-orange-500">Amber to Orange</option>
                        <option value="from-blue-400 to-cyan-500">Blue to Cyan</option>
                        <option value="from-red-400 to-rose-500">Red to Rose</option>
                        <option value="from-green-400 to-lime-500">Green to Lime</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700">Published Date</label>
                      <input
                        type="date"
                        value={doc.published_date || doc.date}
                        onChange={(e) => updateDocument(idx, 'published_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700">Pages</label>
                      <input
                        type="number"
                        value={doc.pages || ''}
                        onChange={(e) => updateDocument(idx, 'pages', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                        placeholder="47"
                      />
                    </div>
                  </div>

                  {/* Document Image */}
                  <div className="border-t pt-3">
                    <label className="block text-xs font-bold mb-2 text-gray-700">Document Image (Optional)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Image URL</label>
                        <input
                          type="text"
                          value={doc.image_url || ''}
                          onChange={(e) => updateDocument(idx, 'image_url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Or Upload Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                updateDocument(idx, 'image_url', reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PoliHub Research Summary */}
                  <div>
                    <label className="block text-xs font-bold mb-1 text-gray-700">
                      📊 PoliHub Research Summary
                      <span className="text-purple-600 ml-1">- Displayed prominently in modal</span>
                    </label>
                    <textarea
                      value={doc.summary || doc.briefing || ''}
                      onChange={(e) => updateDocument(idx, 'summary', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                      placeholder="This comprehensive analysis examines the proposed amendments to Article V of the Constitution..."
                    />
                  </div>

                  {/* Key Findings (Details JSON) */}
                  <div>
                    <label className="block text-xs font-bold mb-1 text-gray-700">
                      Key Findings (Detailed Analysis)
                      <span className="text-blue-600 ml-1">- Collapsible bullet points</span>
                    </label>
                    <textarea
                      value={Array.isArray(doc.details) ? doc.details.join('\n') : (doc.details || '')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n');
                        // Only filter out completely empty lines at the start/end, preserve content
                        const trimmedLines = lines.map(line => line).filter((line, idx, arr) => {
                          // Keep all non-empty lines
                          if (line.trim()) return true;
                          // Keep empty lines in the middle (allow paragraph breaks)
                          if (idx > 0 && idx < arr.length - 1) return true;
                          // Remove leading/trailing empty lines
                          return false;
                        });
                        updateDocument(idx, 'details', trimmedLines.length > 0 ? trimmedLines : []);
                      }}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                      placeholder={"Analysis of 27 ratified amendments and their timelines\nExamination of state convention method versus legislative approval\nImpact assessment on federalism\n\nEach line becomes a bullet point. Press Enter for new lines."}
                    />
                    <p className="text-xs text-gray-500 mt-1">Each line will be a separate bullet point. Empty lines create paragraph breaks.</p>
                  </div>

                  {/* Research Topics (Tags) */}
                  <div>
                    <label className="block text-xs font-bold mb-1 text-gray-700">Research Topics (Tags)</label>
                    <input
                      type="text"
                      defaultValue={Array.isArray(doc.tags) ? doc.tags.join(', ') : ''}
                      onBlur={(e) => updateDocument(idx, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                      placeholder="Constitution, Amendment Process, Federalism"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate tags with commas (press Tab or click away to save)</p>
                  </div>

                  {/* Document URL */}
                  <div className="border-t pt-4">
                    <label className="block text-xs font-bold mb-2 text-gray-700">Primary Document URL</label>
                    <input
                      type="text"
                      value={doc.document_url || doc.file_url || ''}
                      onChange={(e) => updateDocument(idx, 'document_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                      placeholder="https://parliament.go.ke/documents/2024-report.pdf"
                    />
                  </div>

                  {/* Multiple Sources (Optional) */}
                  <div>
                    <label className="block text-xs font-bold mb-2 text-gray-700">Additional Sources (Optional - JSON)</label>
                    <textarea
                      value={typeof doc.source_links === 'object' && doc.source_links !== null
                        ? JSON.stringify(doc.source_links, null, 2)
                        : ''}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          updateDocument(idx, 'source_links', parsed);
                        } catch {
                          // Invalid JSON, don't update
                        }
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                      placeholder={'{\n  "Parliament": "https://...",\n  "Ministry": "https://..."\n}'}
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.documents.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <FileText size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold">No research documents added yet</p>
                <p className="text-sm">Click "Add Document" to create one</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEWS TAB */}
      {activeTab === 'news' && (
        <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black">News & Updates</h3>
            <button onClick={addNews} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-bold">
              <Plus size={18} /> Add News
            </button>
          </div>

          <div className="space-y-4">
            {formData.news.map((item, idx) => (
              <div key={item.id} className="bg-white rounded-lg p-4 border-2 border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-orange-600">News {idx + 1}</span>
                  <button onClick={() => removeNews(idx)} className="text-red-600 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateNews(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Content</label>
                    <textarea
                      value={item.content}
                      onChange={(e) => updateNews(idx, 'content', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Icon (Emoji)</label>
                      <select
                        value={item.icon || '📰'}
                        onChange={(e) => updateNews(idx, 'icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center text-2xl"
                      >
                        <option value="📰">📰 News</option>
                        <option value="📢">📢 Announcement</option>
                        <option value="🎙️">🎙️ Interview</option>
                        <option value="🏆">🏆 Achievement</option>
                        <option value="⚠️">⚠️ Alert</option>
                        <option value="ℹ️">ℹ️ Info</option>
                        <option value="🔔">🔔 Update</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Image URL</label>
                      <input
                        type="text"
                        value={item.image_url || ''}
                        onChange={(e) => updateNews(idx, 'image_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Date</label>
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) => updateNews(idx, 'date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Source Name</label>
                      <input
                        type="text"
                        value={item.source}
                        onChange={(e) => updateNews(idx, 'source', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="CNN, BBC, Nation, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Credibility</label>
                      <select
                        value={item.credibility || 'medium'}
                        onChange={(e) => updateNews(idx, 'credibility', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Status</label>
                      <select
                        value={item.status}
                        onChange={(e) => updateNews(idx, 'status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Source URL</label>
                    <input
                      type="text"
                      value={item.source_url || item.url || ''}
                      onChange={(e) => updateNews(idx, 'source_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Sources Manager */}
                  <SourceButtonManager
                    sources={item.sources || []}
                    onChange={(newSources) => updateNews(idx, 'sources', newSources)}
                    label="News Sources"
                  />
                </div>
              </div>
            ))}

            {formData.news.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No news items added yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black">Career Timeline</h3>
            <button onClick={addTimelineEvent} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-bold">
              <Plus size={18} /> Add Event
            </button>
          </div>

          <div className="space-y-4">
            {formData.timeline.map((event, idx) => (
              <div key={event.id} className="bg-white rounded-lg p-4 border-2 border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-green-600">Event {idx + 1}</span>
                  <button onClick={() => removeTimeline(idx)} className="text-red-600 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Date</label>
                      <input
                        type="date"
                        value={event.date}
                        onChange={(e) => updateTimeline(idx, 'date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Type</label>
                      <select
                        value={event.type}
                        onChange={(e) => updateTimeline(idx, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        <option value="achievement">Achievement</option>
                        <option value="appointment">Appointment</option>
                        <option value="election">Election</option>
                        <option value="legislation">Legislation</option>
                        <option value="scandal">Scandal</option>
                        <option value="education">Education</option>
                        <option value="career">Career</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Category</label>
                      <input
                        type="text"
                        value={event.category || ''}
                        onChange={(e) => updateTimeline(idx, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="Custom category..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Icon (Emoji)</label>
                      <select
                        value={event.icon || '📅'}
                        onChange={(e) => updateTimeline(idx, 'icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center text-2xl"
                      >
                        <option value="📅">📅 Event</option>
                        <option value="🏆">🏆 Achievement</option>
                        <option value="📝">📝 Appointment</option>
                        <option value="🗳️">🗳️ Election</option>
                        <option value="📜">📜 Legislation</option>
                        <option value="⚠️">⚠️ Scandal</option>
                        <option value="🎓">🎓 Education</option>
                        <option value="💼">💼 Career</option>
                        <option value="📰">📰 Media</option>
                        <option value="🏛️">🏛️ Government</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Image URL</label>
                      <input
                        type="text"
                        value={event.image_url || ''}
                        onChange={(e) => updateTimeline(idx, 'image_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Title</label>
                    <input
                      type="text"
                      value={event.title}
                      onChange={(e) => updateTimeline(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Elected to Senate"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Description</label>
                    <textarea
                      value={event.description}
                      onChange={(e) => updateTimeline(idx, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>

                  <div className="border-t pt-3">
                    <h5 className="text-xs font-bold mb-2 text-gray-700">📎 Source Information</h5>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Source Name</label>
                        <input
                          type="text"
                          value={event.source || ''}
                          onChange={(e) => updateTimeline(idx, 'source', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="Parliament, Media, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Source URL</label>
                        <input
                          type="text"
                          value={event.source_url || ''}
                          onChange={(e) => updateTimeline(idx, 'source_url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    {/* Sources Manager */}
                    <SourceButtonManager
                      sources={event.sources || []}
                      onChange={(newSources) => updateTimeline(idx, 'sources', newSources)}
                      label="Timeline Event Sources"
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.timeline.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No timeline events added yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROMISES TAB */}
      {activeTab === 'promises' && (
        <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black">Commitments & Promises</h3>
            <button onClick={addCommitment} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-bold">
              <Plus size={18} /> Add Commitment
            </button>
          </div>

          <div className="space-y-4">
            {formData.commitments.map((commitment, idx) => (
              <div key={commitment.id} className="bg-white rounded-lg p-4 border-2 border-yellow-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-yellow-600">Commitment {idx + 1}</span>
                  <button onClick={() => removeCommitment(idx)} className="text-red-600 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Title</label>
                    <input
                      type="text"
                      value={commitment.title}
                      onChange={(e) => updateCommitment(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Lower healthcare costs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Description</label>
                    <textarea
                      value={commitment.description}
                      onChange={(e) => updateCommitment(idx, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Icon (Emoji)</label>
                      <select
                        value={commitment.icon || '🤝'}
                        onChange={(e) => updateCommitment(idx, 'icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center text-2xl"
                      >
                        <option value="🤝">🤝 Promise</option>
                        <option value="✅">✅ Kept</option>
                        <option value="⏳">⏳ Pending</option>
                        <option value="🚧">🚧 In Progress</option>
                        <option value="❌">❌ Broken</option>
                        <option value="🎯">🎯 Goal</option>
                        <option value="📋">📋 Commitment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Image URL</label>
                      <input
                        type="text"
                        value={commitment.image_url || ''}
                        onChange={(e) => updateCommitment(idx, 'image_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Status</label>
                      <select
                        value={commitment.status}
                        onChange={(e) => updateCommitment(idx, 'status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="broken">Broken</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Category</label>
                      <select
                        value={commitment.category || commitment.custom_category || ''}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            updateCommitment(idx, 'category', '');
                          } else {
                            updateCommitment(idx, 'category', e.target.value);
                            updateCommitment(idx, 'custom_category', '');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="policy">Policy</option>
                        <option value="economic">Economic</option>
                        <option value="social">Social</option>
                        <option value="environmental">Environmental</option>
                        <option value="infrastructure">Infrastructure</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="education">Education</option>
                        <option value="custom">✏️ Custom</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Type</label>
                      <select
                        value={commitment.type || commitment.custom_type || ''}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            updateCommitment(idx, 'type', '');
                          } else {
                            updateCommitment(idx, 'type', e.target.value);
                            updateCommitment(idx, 'custom_type', '');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="campaign_promise">Campaign Promise</option>
                        <option value="legislative">Legislative</option>
                        <option value="policy_goal">Policy Goal</option>
                        <option value="project">Project</option>
                        <option value="reform">Reform</option>
                        <option value="custom">✏️ Custom</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Progress (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={commitment.progress_percentage || commitment.progress || 0}
                        onChange={(e) => updateCommitment(idx, 'progress_percentage', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {(commitment.category === '' && !commitment.custom_category) && (
                    <div>
                      <label className="block text-xs font-bold mb-1">Custom Category</label>
                      <input
                        type="text"
                        value={commitment.custom_category || ''}
                        onChange={(e) => updateCommitment(idx, 'custom_category', e.target.value)}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm"
                        placeholder="Enter your own category..."
                      />
                    </div>
                  )}

                  {(commitment.type === '' && !commitment.custom_type) && (
                    <div>
                      <label className="block text-xs font-bold mb-1">Custom Type</label>
                      <input
                        type="text"
                        value={commitment.custom_type || ''}
                        onChange={(e) => updateCommitment(idx, 'custom_type', e.target.value)}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm"
                        placeholder="Enter your own type..."
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Date Made</label>
                      <input
                        type="date"
                        value={commitment.date_made}
                        onChange={(e) => updateCommitment(idx, 'date_made', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Deadline</label>
                      <input
                        type="date"
                        value={commitment.deadline}
                        onChange={(e) => updateCommitment(idx, 'deadline', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h5 className="text-xs font-bold mb-2 text-gray-700">📎 Source Information</h5>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Source Name</label>
                        <input
                          type="text"
                          value={commitment.source || ''}
                          onChange={(e) => updateCommitment(idx, 'source', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="Speech, Manifesto, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Source URL</label>
                        <input
                          type="text"
                          value={commitment.source_url || ''}
                          onChange={(e) => updateCommitment(idx, 'source_url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    {/* Sources Manager */}
                    <SourceButtonManager
                      sources={commitment.sources || []}
                      onChange={(newSources) => updateCommitment(idx, 'sources', newSources)}
                      label="Commitment Sources"
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.commitments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No commitments added yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VOTING TAB */}
      {activeTab === 'voting' && (
        <div className="bg-red-50 rounded-xl p-6 border-2 border-red-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black">Voting Records</h3>
            <button onClick={addVotingRecord} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-bold">
              <Plus size={18} /> Add Vote
            </button>
          </div>

          <div className="space-y-4">
            {formData.voting_records.map((vote, idx) => (
              <div key={vote.id} className="bg-white rounded-lg p-4 border-2 border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-red-600">Vote {idx + 1}</span>
                  <button onClick={() => removeVotingRecord(idx)} className="text-red-600 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Bill Name</label>
                    <input
  type="text"
  value={vote.bill_title}  // ✅ Changed from vote.bill_name
  onChange={(e) => updateVotingRecord(idx, 'bill_title', e.target.value)}
  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
  placeholder="Finance Bill 2024"
/>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Icon (Emoji)</label>
                      <select
                        value={vote.icon || '🗳️'}
                        onChange={(e) => updateVotingRecord(idx, 'icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center text-2xl"
                      >
                        <option value="🗳️">🗳️ Vote</option>
                        <option value="✅">✅ Yes</option>
                        <option value="❌">❌ No</option>
                        <option value="🤷">🤷 Abstain</option>
                        <option value="⚖️">⚖️ Law</option>
                        <option value="💰">💰 Budget</option>
                        <option value="🏛️">🏛️ Constitutional</option>
                        <option value="📋">📋 Resolution</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Image URL</label>
                      <input
                        type="text"
                        value={vote.image_url || ''}
                        onChange={(e) => updateVotingRecord(idx, 'image_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Vote</label>
                      <select
  value={vote.vote_value}  // ✅ Changed from vote.vote
  onChange={(e) => updateVotingRecord(idx, 'vote_value', e.target.value)}
  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
>
  <option value="for">For</option>        // ✅ Changed
  <option value="against">Against</option> // ✅ Changed
  <option value="abstain">Abstain</option>
  <option value="absent">Absent</option>
</select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Date</label>
                      <input
                        type="date"
                        value={vote.vote_date || vote.date || ''}
                        onChange={(e) => updateVotingRecord(idx, 'vote_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Category</label>
                      <select
                        value={vote.category || vote.custom_category || ''}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            updateVotingRecord(idx, 'category', '');
                          } else {
                            updateVotingRecord(idx, 'category', e.target.value);
                            updateVotingRecord(idx, 'custom_category', '');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="legislation">Legislation</option>
                        <option value="budget">Budget</option>
                        <option value="appointment">Appointment</option>
                        <option value="resolution">Resolution</option>
                        <option value="amendment">Amendment</option>
                        <option value="constitutional">Constitutional</option>
                        <option value="emergency">Emergency</option>
                        <option value="procedural">Procedural</option>
                        <option value="custom">✏️ Custom</option>
                      </select>
                    </div>
                  </div>

                  {(vote.category === '' && !vote.custom_category) && (
                    <div>
                      <label className="block text-xs font-bold mb-1">Custom Category</label>
                      <input
                        type="text"
                        value={vote.custom_category || ''}
                        onChange={(e) => updateVotingRecord(idx, 'custom_category', e.target.value)}
                        className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm"
                        placeholder="Enter your own category..."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold mb-1">Description</label>
                    <textarea
  value={vote.bill_description}  // ✅ Changed from vote.description
  onChange={(e) => updateVotingRecord(idx, 'bill_description', e.target.value)}
  rows={2}
  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
/>
                  </div>

                  <div className="border-t pt-3">
                    <h5 className="text-xs font-bold mb-2 text-gray-700">📎 Source Information</h5>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Source Name</label>
                        <input
                          type="text"
                          value={vote.source || ''}
                          onChange={(e) => updateVotingRecord(idx, 'source', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="Parliament, Hansard, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Source URL</label>
                        <input
                          type="text"
                          value={vote.source_url || ''}
                          onChange={(e) => updateVotingRecord(idx, 'source_url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    {/* Sources Manager */}
                    <SourceButtonManager
                      sources={vote.sources || []}
                      onChange={(newSources) => updateVotingRecord(idx, 'sources', newSources)}
                      label="Voting Record Sources"
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.voting_records.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No voting records added yet.
              </div>
            )}
          </div>
        </div>
      )}


      {/* SUBMIT BUTTONS */}
      <div className="flex gap-3 sticky bottom-0 bg-white pt-4">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Save Politician
        </button>
        <button
          onClick={onClose}
          className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
