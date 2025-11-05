import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin, Briefcase, TrendingUp } from 'lucide-react';
const API_BASE_URL = 'http://localhost:5000';

export default function PoliticiansPage({
  filteredPoliticians,
  filterParty,
  setFilterParty,
  filterChamber,
  setFilterChamber,
  searchQuery,
  setSearchQuery,
  setSelectedPolitician,
  email,
  setEmail,
  subscribed,
  handleSubscribe,
  selectedTrending,
  toggleTrending,
  trendingTopics
}) {
  // Pagination state
  const [displayCount, setDisplayCount] = useState(12);
  const ITEMS_PER_PAGE = 12;
  // Quick links state
  const [quickLinks, setQuickLinks] = useState([]);

  // Fetch quick links from API
  useEffect(() => {
    const fetchQuickLinks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/quick-links`);
        const data = await response.json();
        setQuickLinks(data);
      } catch (error) {
        console.error('Error fetching quick links:', error);
      }
    };

    fetchQuickLinks();
  }, []);

  // Use filteredPoliticians directly
  const allPoliticians = filteredPoliticians || [];
  const politicians = allPoliticians.slice(0, displayCount);
  const hasMore = displayCount < allPoliticians.length;

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Explore Politicians 🏛️
        </h1>
        <p className="text-gray-600 text-lg">
          Discover profiles, track voting records, and stay informed about your representatives
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-white mb-6 sm:mb-8">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or state..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition"
              />
            </div>
          </div>
          
          <div className="w-full lg:col-span-3">
            <select
              value={filterParty}
              onChange={(e) => setFilterParty(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition font-semibold"
            >
              <option value="all">All Parties</option>
              <option value="UDA">UDA</option>
              <option value="ODM">ODM</option>
              <option value="NARC Kenya">NARC Kenya</option>
              <option value="Wiper">Wiper</option>
              <option value="RADA">RADA</option>
              <option value="Independent">Independent</option>
            </select>
          </div>
          
          <div className="w-full lg:col-span-3">
            <select
              value={filterChamber}
              onChange={(e) => setFilterChamber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition font-semibold"
            >
              <option value="all">All Chambers</option>
              <option value="Parliament">Parliament</option>
              <option value="Senate">Senate</option>
              <option value="County">County Assembly</option>
            </select>
          </div>
          
          <div className="col-span-1">
            <button className="w-full h-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition hover:scale-105 active:scale-95 transform transition-transform duration-200 flex items-center justify-center">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Politicians Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Main Grid */}
        <div className="lg:col-span-9 order-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {politicians.map((politician, idx) => (
              <div
                key={politician.id || idx}
                onClick={() => setSelectedPolitician(politician)}
                className="bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-white hover:scale-[1.02] transform group"
              >
                <div className="relative h-48 sm:h-64 lg:h-72 overflow-hidden">
                  <img
                    src={politician.imageUrl || politician.image_url}
                    alt={politician.name || politician.full_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.style.background = 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                      politician.party === 'UDA' ? 'bg-yellow-500' :
                      politician.party === 'ODM' ? 'bg-orange-500' :
                      politician.party === 'NARC Kenya' ? 'bg-green-500' :
                      politician.party === 'Wiper' ? 'bg-blue-500' :
                      politician.party === 'RADA' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}>
                      {politician.party}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-black/40 backdrop-blur-sm min-h-[40px]">
                      {politician.chamber}
                    </span>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-black text-lg mb-1">{politician.name || politician.full_name}</h3>
                    <p className="text-sm opacity-90 flex items-center gap-1">
                      <MapPin size={14} />
                      {politician.state || politician.district || 'Kenya'}
                    </p>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                      <Briefcase size={12} />
                      {politician.years_in_office || politician.yearsInOffice || 0} years
                    </span>
                    <button className="text-purple-600 hover:text-purple-700 transition">
                      <Star size={18} />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {/* Display tags instead of keyIssues */}
                    {(politician.tags || []).slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm rounded-full font-semibold">
                        {tag}
                      </span>
                    ))}
                    {/* Fallback if no tags */}
                    {(!politician.tags || politician.tags.length === 0) && (
                      <>
                        <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm rounded-full font-semibold">
                          {politician.chamber}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm rounded-full font-semibold">
                          {politician.party}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white py-2 rounded-lg font-bold hover:shadow-md transition text-sm hover:scale-105 active:scale-95 transform transition-transform duration-200">
                    View Profile →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* No Results Message */}
          {politicians.length === 0 && (
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-12 shadow-lg border-2 border-white text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">No Politicians Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterParty('all');
                  setFilterChamber('all');
                }}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-600 transition"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Explore More Button */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setDisplayCount(prev => prev + ITEMS_PER_PAGE)}
                className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center gap-3 mx-auto"
              >
                <TrendingUp size={24} />
                <span>Explore More Politicians</span>
                <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">
                  +{Math.min(ITEMS_PER_PAGE, allPoliticians.length - displayCount)}
                </span>
              </button>
              <p className="mt-3 text-sm text-gray-600">
                Showing {politicians.length} of {allPoliticians.length} politicians
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-5 order-2">
          {/* Stats */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-lg border-2 border-white/50 ring-1 ring-gray-100">
            <h3 className="text-lg font-black mb-4">Quick Stats 📊</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">UDA</span>
                <span className="text-lg font-black text-yellow-600">
                  {politicians.filter(p => p.party === 'UDA').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">ODM</span>
                <span className="text-lg font-black text-orange-600">
                  {politicians.filter(p => p.party === 'ODM').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">RADA</span>
                <span className="text-lg font-black text-purple-600">
                  {politicians.filter(p => p.party === 'RADA').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">NARC Kenya</span>
                <span className="text-lg font-black text-green-600">
                  {politicians.filter(p => p.party === 'NARC Kenya').length}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          {(filterParty !== 'all' || filterChamber !== 'all' || searchQuery) && (
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-5 shadow-lg border-2 border-purple-200">
              <h3 className="text-lg font-black mb-3">Active Filters</h3>
              <div className="space-y-2">
                {searchQuery && (
                  <div className="bg-white/80 px-3 py-2 rounded-lg text-sm">
                    <strong>Search:</strong> {searchQuery}
                  </div>
                )}
                {filterParty !== 'all' && (
                  <div className="bg-white/80 px-3 py-2 rounded-lg text-sm">
                    <strong>Party:</strong> {filterParty}
                  </div>
                )}
                {filterChamber !== 'all' && (
                  <div className="bg-white/80 px-3 py-2 rounded-lg text-sm">
                    <strong>Chamber:</strong> {filterChamber}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterParty('all');
                  setFilterChamber('all');
                }}
                className="w-full mt-3 bg-white text-purple-700 py-2 rounded-lg font-bold hover:bg-purple-50 transition text-sm"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Trending */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-lg border-2 border-white/50 ring-1 ring-gray-100">
            <h3 className="text-lg font-black mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-pink-500" />
              Trending Now
            </h3>
            <div className="space-y-2">
              {trendingTopics.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleTrending(idx)}
                  className={`p-2 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                    selectedTrending[idx] 
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 transform translate-x-1' 
                      : 'bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  {item.emoji} {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white border-2 border-white/50 ring-1 ring-gray-100">
            <h3 className="text-xl font-black mb-2 text-center">Stay Updated 💌</h3>
            <p className="text-xs text-center mb-4 opacity-90">
              Weekly politics & policy insights
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-full border-2 border-white/50 text-gray-800 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-2 focus:ring-white text-sm bg-white/95"
              placeholder="your.email@example.com"
            />
            <button
              onClick={handleSubscribe}
              className={`w-full py-2 rounded-full font-bold transition text-sm ${
                subscribed
                  ? 'bg-green-400 text-white'
                  : 'bg-white text-purple-700 hover:scale-105 active:scale-95 transform transition-transform duration-200 shadow-lg'
              }`}
            >
              {subscribed ? '✓ Subscribed!' : 'Subscribe'}
            </button>
          </div>

          {/* Quick Links */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-lg border-2 border-white/50 ring-1 ring-gray-100">
            <h3 className="text-lg font-black mb-3">Quick Links 🔗</h3>
            <div className="space-y-2">
              {quickLinks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No quick links available</p>
              ) : (
                quickLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-semibold text-gray-700 transition"
                  >
                    {link.icon} {link.title}
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}