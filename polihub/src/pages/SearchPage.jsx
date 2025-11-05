import React, { useState, useMemo } from 'react';
import { Search, Filter, X, User, BookOpen, FileText, Newspaper, TrendingUp } from 'lucide-react';
import PoliticianDetailModal from '../components/PoliticianDetailModal';

function SearchPage({ politicians = [], bills = [], blogPosts = [], civicTopics = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPolitician, setSelectedPolitician] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'all', label: 'All', icon: TrendingUp },
    { id: 'politicians', label: 'Politicians', icon: User },
    { id: 'bills', label: 'Bills & Legislation', icon: FileText },
    { id: 'civic', label: 'Civic Topics', icon: BookOpen },
    { id: 'blog', label: 'Blog Posts', icon: Newspaper },
  ];

  // Search function
  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return {
        politicians: selectedCategory === 'all' || selectedCategory === 'politicians' ? politicians.slice(0, 6) : [],
        bills: selectedCategory === 'all' || selectedCategory === 'bills' ? bills : [],
        civic: selectedCategory === 'all' || selectedCategory === 'civic' ? civicTopics.slice(0, 4) : [],
        blog: selectedCategory === 'all' || selectedCategory === 'blog' ? blogPosts.slice(0, 4) : [],
      };
    }

    const filteredPoliticians = (selectedCategory === 'all' || selectedCategory === 'politicians')
      ? politicians.filter(p =>
          (p.name || p.full_name || '').toLowerCase().includes(query) ||
          (p.party || '').toLowerCase().includes(query) ||
          (p.position || p.title || '').toLowerCase().includes(query) ||
          (p.state || '').toLowerCase().includes(query)
        )
      : [];

    const filteredBills = (selectedCategory === 'all' || selectedCategory === 'bills')
      ? bills.filter(b =>
          b.title.toLowerCase().includes(query) ||
          b.shortTitle?.toLowerCase().includes(query) ||
          b.billNumber.toLowerCase().includes(query) ||
          b.sponsor.toLowerCase().includes(query) ||
          b.category.toLowerCase().includes(query)
        )
      : [];

    const filteredCivic = (selectedCategory === 'all' || selectedCategory === 'civic')
      ? civicTopics.filter(c =>
          c.title.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
        )
      : [];

    const filteredBlog = (selectedCategory === 'all' || selectedCategory === 'blog')
      ? blogPosts.filter(b =>
          b.title.toLowerCase().includes(query) ||
          b.category.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query)
        )
      : [];

    return {
      politicians: filteredPoliticians,
      bills: filteredBills,
      civic: filteredCivic,
      blog: filteredBlog,
    };
  }, [searchQuery, selectedCategory]);

  const totalResults =
    searchResults.politicians.length +
    searchResults.bills.length +
    searchResults.civic.length +
    searchResults.blog.length;

  const getPartyColor = (party) => {
    switch (party) {
      case 'Democrat': return 'bg-blue-600';
      case 'Republican': return 'bg-red-600';
      case 'Independent': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getBillStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'committee': return 'bg-yellow-100 text-yellow-800';
      case 'floor': return 'bg-orange-100 text-orange-800';
      case 'introduced': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">= Search PoliHub</h1>
          <p className="text-xl text-purple-100 mb-8">
            Find politicians, bills, civic topics, and articles
          </p>

          {/* Search Bar */}
          <div className="relative max-w-3xl">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Search for politicians, bills, topics, or articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-16 py-5 rounded-2xl text-gray-800 text-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="mt-4 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-colors"
            >
              <Filter size={20} />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Category Filters */}
        {showFilters && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Count */}
        {searchQuery && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <p className="text-lg text-gray-700">
              Found <span className="font-bold text-purple-600">{totalResults}</span> results for "{searchQuery}"
            </p>
          </div>
        )}

        {/* No Results */}
        {searchQuery && totalResults === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
            <Search size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        )}

        {/* Politicians Results */}
        {searchResults.politicians.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <User className="text-purple-600" size={32} />
              Politicians ({searchResults.politicians.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.politicians.map(politician => (
                <div
                  key={politician.id}
                  onClick={() => setSelectedPolitician(politician)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-400">
                    {(politician.image || politician.imageUrl || politician.image_url) ? (
                      <img
                        src={politician.image || politician.imageUrl || politician.image_url}
                        alt={politician.name || politician.full_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={80} className="text-white/50" />
                      </div>
                    )}
                    <div className={`absolute top-4 right-4 ${getPartyColor(politician.party)} text-white px-4 py-2 rounded-xl font-semibold shadow-lg`}>
                      {politician.party}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{politician.name || politician.full_name}</h3>
                    <p className="text-purple-600 font-semibold mb-1">{politician.position || politician.title}</p>
                    {politician.state && (
                      <p className="text-gray-600">{politician.state}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bills Results */}
        {searchResults.bills.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <FileText className="text-purple-600" size={32} />
              Bills & Legislation ({searchResults.bills.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.bills.map(bill => (
                <div
                  key={bill.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-lg">
                        {bill.billNumber}
                      </span>
                      <span className={`ml-2 text-sm font-semibold px-3 py-1 rounded-lg ${getBillStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{bill.shortTitle || bill.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{bill.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Sponsored by: <span className="font-semibold text-gray-700">{bill.sponsor}</span></span>
                    <span className="text-purple-600 font-semibold">{bill.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Civic Topics Results */}
        {searchResults.civic.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <BookOpen className="text-purple-600" size={32} />
              Civic Topics ({searchResults.civic.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.civic.map(topic => (
                <div
                  key={topic.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{topic.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{topic.title}</h3>
                        <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-semibold">
                          {topic.category}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">{topic.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{topic.readTime}</span>
                        <span>"</span>
                        <span className={`px-2 py-1 rounded ${
                          topic.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                          topic.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {topic.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts Results */}
        {searchResults.blog.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Newspaper className="text-purple-600" size={32} />
              Blog Posts ({searchResults.blog.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.blog.map(post => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer group"
                >
                  {post.image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-semibold">
                        {post.category}
                      </span>
                      <span className="text-sm text-gray-500">{post.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3">
                      {post.authorImage && (
                        <img
                          src={post.authorImage}
                          alt={post.author}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{post.author}</p>
                        <p className="text-xs text-gray-500">{post.readTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Politician Detail Modal */}
      {selectedPolitician && (
        <PoliticianDetailModal
          politician={selectedPolitician}
          onClose={() => setSelectedPolitician(null)}
        />
      )}
    </div>
  );
}

export default SearchPage;
