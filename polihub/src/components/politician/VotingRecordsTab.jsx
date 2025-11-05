import React, { useState, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp, Loader } from 'lucide-react';

export default function VotingRecordsTab({ politicianId }) {
  const [filterVote, setFilterVote] = useState('All Votes');
  const [expandedVote, setExpandedVote] = useState(null);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch voting records from API
  useEffect(() => {
    const fetchVotingRecords = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/polihub/politicians/${politicianId}/voting-records`);
        const data = await response.json();
        
        if (data.success) {
          setVotes(data.data || []);
        } else {
          setError('Failed to load voting records');
        }
      } catch (err) {
        console.error('Error fetching voting records:', err);
        setError('Failed to load voting records');
      } finally {
        setLoading(false);
      }
    };

    if (politicianId) {
      fetchVotingRecords();
    }
  }, [politicianId]);

  const getVoteColor = (vote) => {
    const voteUpper = vote?.toUpperCase();
    if (voteUpper === 'FOR') return 'bg-green-100 text-green-700 border-green-200';
    if (voteUpper === 'AGAINST') return 'bg-red-100 text-red-700 border-red-200';
    if (voteUpper === 'ABSTAIN') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (voteUpper === 'ABSENT') return 'bg-gray-100 text-gray-700 border-gray-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const filteredVotes = votes.filter(vote => {
    if (filterVote === 'All Votes') return true;
    const voteUpper = vote.vote?.toUpperCase();
    if (filterVote === 'Voted For') return voteUpper === 'FOR';
    if (filterVote === 'Voted Against') return voteUpper === 'AGAINST';
    if (filterVote === 'Abstained') return voteUpper === 'ABSTAIN';
    return true;
  });

  // Sort by date descending
  const sortedVotes = [...filteredVotes].sort((a, b) => 
    new Date(b.vote_date || b.date) - new Date(a.vote_date || a.date)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-purple-600" size={48} />
        <span className="ml-3 text-lg font-semibold text-gray-600">Loading voting records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="voting-records-tab">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
        {['All Votes', 'Voted For', 'Voted Against', 'Abstained'].map(filter => (
          <button
            key={filter}
            onClick={() => setFilterVote(filter)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition ${
              filterVote === filter
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Vote Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-100">
        <div className="text-xl sm:text-2xl font-black text-green-700">
  {votes.filter(v => v.vote?.toUpperCase() === 'FOR').length}
</div>
          <div className="text-sm text-green-600 font-semibold">Voted For</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border-2 border-red-100">
        <div className="text-xl sm:text-2xl font-black text-red-700">
  {votes.filter(v => v.vote?.toUpperCase() === 'AGAINST').length}
</div>
          <div className="text-sm text-red-600 font-semibold">Voted Against</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-100">
          <div className="text-xl sm:text-2xl font-black text-yellow-700">
            {votes.filter(v => v.vote?.toUpperCase() === 'ABSTAIN').length}
          </div>
          <div className="text-sm text-yellow-600 font-semibold">Abstained</div>
        </div>
      </div>

      {/* Vote Cards */}
      <div className="space-y-4">
        {sortedVotes.map(vote => (
          <div 
            key={vote.id}
            className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition border-2 border-transparent hover:border-purple-200"
          >
            <div className="flex justify-between items-start mb-3">
              {/* Bill Name */}
              <h4 className="text-lg font-bold text-gray-800 flex-1 pr-4">
  {vote.bill_title || 'Untitled Bill'}
</h4>

              {/* Vote Badge */}
              <span className={`px-4 py-2 rounded-full font-bold text-sm border-2 whitespace-nowrap ${getVoteColor(vote.vote)}`}>
                {vote.vote || 'Unknown'}
              </span>
            </div>

            {/* Category & Date Row */}
            <div className="flex flex-wrap gap-3 mb-3">
              {(vote.category || vote.custom_category) && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  {vote.custom_category || vote.category}
                </span>
              )}
              {(vote.vote_date || vote.date) && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  {new Date(vote.vote_date || vote.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
              {vote.icon && (
                <span className="text-lg">{vote.icon}</span>
              )}
            </div>

            {/* Description (Collapsible) */}
            {vote.description && (
              <>
                <p className={`text-sm text-gray-600 leading-relaxed transition-all ${
                  expandedVote === vote.id ? '' : 'line-clamp-2'
                }`}>
                  {vote.description}
                </p>
                <button
                  onClick={() => setExpandedVote(expandedVote === vote.id ? null : vote.id)}
                  className="mt-2 flex items-center gap-1 text-sm font-bold text-purple-600 hover:text-purple-700 transition"
                >
                  {expandedVote === vote.id ? (
                    <>
                      <ChevronUp size={16} />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      Read more
                    </>
                  )}
                </button>
              </>
            )}

            {/* DYNAMIC SOURCE ENTRIES - ONE PER ROW */}
<div className="border-t pt-3">
  <div className="flex items-center justify-between mb-2">
    <h5 className="text-xs font-bold text-gray-700">📎 Source Information</h5>
    <button
      type="button"
      onClick={() => {
        const newSources = [...(vote.sources || []), { name: '', url: '' }];
        updateVotingRecord(idx, 'sources', newSources);
      }}
      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition"
    >
      <Plus size={14} />
      Add Source
    </button>
  </div>

  {/* Source Entries - One per row */}
  <div className="space-y-2">
    {(vote.sources || []).map((source, sourceIdx) => (
      <div key={sourceIdx} className="flex gap-2 items-start p-2 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div>
            <input
              type="text"
              value={source.name || ''}
              onChange={(e) => {
                const newSources = [...(vote.sources || [])];
                newSources[sourceIdx].name = e.target.value;
                updateVotingRecord(idx, 'sources', newSources);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              placeholder="Source name (e.g., Parliament, Hansard)"
            />
          </div>
          <div>
            <input
              type="text"
              value={source.url || ''}
              onChange={(e) => {
                const newSources = [...(vote.sources || [])];
                newSources[sourceIdx].url = e.target.value;
                updateVotingRecord(idx, 'sources', newSources);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              placeholder="https://..."
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const newSources = (vote.sources || []).filter((_, i) => i !== sourceIdx);
            updateVotingRecord(idx, 'sources', newSources);
          }}
          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition shrink-0"
          title="Remove this source"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ))}
  </div>

  {/* Show message if no sources */}
  {(!vote.sources || vote.sources.length === 0) && (
    <div className="text-center py-3 text-gray-500 text-sm">
      No sources added yet. Click <span className="font-bold">"Add Source"</span> to add one.
    </div>
  )}
</div>

      {/* Empty State */}
      {sortedVotes.length === 0 && !loading && (
        <div className="text-center py-12">
          <Clock size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">No Voting Records Found</h3>
          <p className="text-gray-500">
            {filterVote === 'All Votes' 
              ? 'No voting records available for this politician yet.' 
              : 'Try selecting a different filter'}
          </p>
        </div>
      )}
    </div>
  );
}