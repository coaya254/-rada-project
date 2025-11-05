// ============================================
// FILE: pages/BlogPage.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronRight, TrendingUp, Pen, Tag, Mail, User, MessageCircle } from 'lucide-react';

function BlogPage({
  filteredBlogPosts,
  blogCategory,
  setBlogCategory,
  setSelectedBlogPost,
  setCurrentPage,
  email,
  setEmail,
  subscribed,
  handleSubscribe,
  selectedTrending,
  toggleTrending,
  trendingTopics
}) {
  const [featuredAuthor, setFeaturedAuthor] = useState(null);
  const [popularTags, setPopularTags] = useState([]);

  // Fetch featured author
  useEffect(() => {
    const fetchFeaturedAuthor = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/polihub/blog/featured-author');
        const data = await response.json();
        if (data.success && data.data) {
          setFeaturedAuthor(data.data);
        }
      } catch (error) {
        console.error('Error fetching featured author:', error);
        // Fallback to default
        setFeaturedAuthor({
          name: 'Sarah Chen',
          title: 'Policy Analyst',
          bio: 'Expert in infrastructure policy with 10+ years covering federal legislation and local impact.',
          profile_image: null
        });
      }
    };

    fetchFeaturedAuthor();
  }, []);

  // Extract popular tags from blog posts
  useEffect(() => {
    const tagCounts = {};
    filteredBlogPosts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Sort by count and take top 8
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);

    // Fallback tags if no tags in posts
    if (sortedTags.length === 0) {
      setPopularTags(['Climate Change', 'Healthcare', 'Elections', 'Supreme Court', 'Immigration', 'Economy', 'Education', 'Foreign Policy']);
    } else {
      setPopularTags(sortedTags);
    }
  }, [filteredBlogPosts]);
  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-3">
          <MessageCircle size={48} className="text-purple-600" />
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Political Discourse
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          In-depth analysis, breaking news, and thoughtful perspectives on American politics
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide scroll-smooth pb-2">
        {['all', 'Policy Analysis', 'Elections', 'Judicial', 'Civic Education'].map((cat) => (
          <button
            key={cat}
            onClick={() => setBlogCategory(cat)}
            className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition ${
              blogCategory === cat
                ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-purple-50'
            }`}
          >
            {cat === 'all' ? 'All Posts' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-8 space-y-6">
          {filteredBlogPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedBlogPost(post)}
              className="bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-white hover:scale-[1.01] transform group"
            >
              <div className="grid grid-cols-5">
                <div className="col-span-2 relative h-64">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold min-h-[40px]">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="col-span-3 p-6">
                  <h3 className="text-2xl font-black mb-3 text-gray-800 group-hover:text-purple-600 transition">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPage('blog-author');
                      }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold min-h-[40px]">
                        {post.author.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-800 hover:text-purple-600">{post.author}</div>
                        <div className="text-xs text-gray-500">{post.authorRole}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {post.readTime}
                      </span>
                    </div>
                    <ChevronRight className="text-purple-500 group-hover:translate-x-1 transition-transform" size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-5 order-2">
          {/* Featured Author */}
          {featuredAuthor && (
            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white border-2 border-white/50 ring-1 ring-gray-100">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <Pen size={18} />
                Featured Author
              </h3>
              <div className="flex items-center gap-3 mb-4">
                {featuredAuthor.profile_image ? (
                  <img
                    src={featuredAuthor.profile_image}
                    alt={featuredAuthor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-2xl font-black">
                    {featuredAuthor.name?.charAt(0) || 'A'}
                  </div>
                )}
                <div>
                  <div className="font-black">{featuredAuthor.name}</div>
                  <div className="text-xs opacity-90">{featuredAuthor.title || 'Author'}</div>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-4">
                {featuredAuthor.bio || 'Experienced writer covering political topics and civic engagement.'}
              </p>
              <button
                onClick={() => setCurrentPage('blog-author')}
                className="w-full bg-white text-purple-700 py-2 rounded-full font-bold hover:bg-white/90 transition text-sm flex items-center justify-center gap-2"
              >
                <User size={16} />
                View Profile
              </button>
            </div>
          )}

          {/* Popular Tags */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-lg border-2 border-white/50 ring-1 ring-gray-100">
            <h3 className="text-lg font-black mb-3 flex items-center gap-2">
              <Tag size={18} className="text-purple-600" />
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    // Filter posts by this tag
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    // Note: actual filtering would need tag-based filter state
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm rounded-full text-xs font-semibold hover:from-purple-200 hover:to-pink-200 transition cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-lg border-2 border-white/50 ring-1 ring-gray-100">
            <h3 className="text-lg font-black mb-2 flex items-center gap-2">
              <Mail size={18} className="text-purple-600" />
              Newsletter
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Get weekly political analysis delivered to your inbox
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-purple-200 text-gray-800 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-2 focus:ring-purple-500 text-sm"
              placeholder="your.email@example.com"
            />
            <button
              onClick={handleSubscribe}
              className={`w-full py-2 rounded-lg font-bold transition text-sm ${
                subscribed
                  ? 'bg-green-400 text-white'
                  : 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white hover:shadow-lg'
              }`}
            >
              {subscribed ? '✓ Subscribed!' : 'Subscribe'}
            </button>
          </div>

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
        </div>
      </div>
    </div>
  );
}
export default BlogPage;
