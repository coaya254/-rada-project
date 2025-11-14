import React, { useState } from 'react';
import { Search, MapPin, User, Phone, Mail, ExternalLink, Building2, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function FindRepsPage() {
  const [searchType, setSearchType] = useState('county'); // 'county' or 'constituency'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [representatives, setRepresentatives] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError('Please enter a location to search');
      return;
    }

    setLoading(true);
    setError('');
    setRepresentatives([]);

    try {
      // Search by county or constituency
      const endpoint = searchType === 'county'
        ? `/api/polihub/politicians?county=${encodeURIComponent(searchTerm)}`
        : `/api/polihub/politicians?district=${encodeURIComponent(searchTerm)}`;

      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        setRepresentatives(data.data);
      } else {
        setError(`No representatives found for "${searchTerm}". Try a different ${searchType}.`);
      }
    } catch (err) {
      setError('Failed to fetch representatives. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Find Your Representatives
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your county or constituency to discover who represents you in government
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSearch}>
            {/* Search Type Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setSearchType('county')}
                className={`flex-1 py-3 px-6 rounded-xl font-bold transition ${
                  searchType === 'county'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Building2 className="inline-block mr-2" size={20} />
                Search by County
              </button>
              <button
                type="button"
                onClick={() => setSearchType('constituency')}
                className={`flex-1 py-3 px-6 rounded-xl font-bold transition ${
                  searchType === 'constituency'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MapPin className="inline-block mr-2" size={20} />
                Search by Constituency
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Enter your ${searchType === 'county' ? 'county' : 'constituency'} name (e.g., ${searchType === 'county' ? 'Nairobi, Kiambu' : 'Westlands, Starehe'})`}
                className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Searching...' : 'Find My Representatives'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {representatives.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              Your Representatives ({representatives.length})
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {representatives.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 border-2 border-transparent hover:border-blue-500"
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {rep.image_url ? (
                      <img
                        src={rep.image_url}
                        alt={rep.full_name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                        <User size={32} className="text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-gray-900">{rep.full_name}</h3>
                      <p className="text-sm font-bold text-blue-600">{rep.title || rep.position}</p>
                      <p className="text-sm text-gray-600">{rep.party}</p>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                    {rep.county && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Building2 size={16} className="text-gray-400" />
                        <span className="text-sm"><strong>County:</strong> {rep.county}</span>
                      </div>
                    )}
                    {rep.district && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-sm"><strong>Constituency:</strong> {rep.district}</span>
                      </div>
                    )}
                    {rep.chamber && (
                      <div className="text-sm text-gray-600">
                        <strong>Chamber:</strong> {rep.chamber}
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    {rep.phone && (
                      <a href={`tel:${rep.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
                        <Phone size={16} />
                        {rep.phone}
                      </a>
                    )}
                    {rep.email && (
                      <a href={`mailto:${rep.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
                        <Mail size={16} />
                        {rep.email}
                      </a>
                    )}
                    {rep.website && (
                      <a href={rep.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                        <ExternalLink size={16} />
                        Visit Website
                      </a>
                    )}
                  </div>

                  {/* View Profile Button */}
                  <button
                    onClick={() => window.alert('View full profile - to be implemented')}
                    className="w-full mt-4 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg font-bold transition"
                  >
                    View Full Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        {representatives.length === 0 && !loading && (
          <div className="bg-blue-50 rounded-xl p-8 text-center">
            <MapPin size={48} className="mx-auto text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">How to Use This Tool</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select whether you want to search by county or constituency, then enter your location.
              We'll show you all the representatives who serve your area, including Senators, MPs, and other officials.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
