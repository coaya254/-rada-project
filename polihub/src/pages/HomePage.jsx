import React from 'react';
import { Eye, MessageCircle, Calendar, ChevronRight, TrendingUp, Search, BookOpen, User, ArrowRight, Clock } from 'lucide-react';
import { politicians as defaultPoliticians } from '../data/politicians';
import { civicTopics as defaultCivicTopics } from '../data/civicTopics';


export default function HomePage({
  politicians = [],
  civicTopics = [],
  current,
  nextPolitician,
  prevPolitician,
  setSelectedPolitician,
  setSelectedTopic,
  setCurrentPage,
  blogPosts = [],
  setSelectedBlogPost,
  email,
  setEmail,
  subscribed,
  handleSubscribe,
  selectedTrending,
  toggleTrending,
  trendingTopics,
  recentSearches
}) {
  // Use prop if provided, otherwise use default data
  const displayPoliticians = politicians.length > 0 ? politicians : defaultPoliticians;
  const displayCivicTopics = civicTopics.length > 0 ? civicTopics : defaultCivicTopics;

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Featured Politician Hero Card */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-8 shadow-2xl border-4 border-white hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${current.imageUrl})`,
          }}
        >
          {/* Gradient Overlays */}
          <div className="absolute inset-0" style={{ background: current.gradient, opacity: 0.85 }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"></div>
        </div>

        {/* Badges */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex gap-2 z-20">
          <div className="bg-black/60 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white text-xs font-bold min-h-[40px]">
            FEATURED
          </div>
          <div className="bg-white/30 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white text-xs font-bold flex items-center gap-1 min-h-[40px]">
            <TrendingUp size={12} />
            Trending
          </div>
        </div>

        {/* Content */}
        <div className="relative flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 min-h-[500px] sm:min-h-[600px] lg:min-h-[650px]">
          {/* Previous Button */}
          <button
            onClick={prevPolitician}
            className="absolute left-3 sm:left-4 lg:left-6 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition z-20 text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-xl hover:scale-110 transform"
          >
            ‹
          </button>

          {/* Text Content - Centered */}
          <div className="text-white z-10 max-w-4xl text-center px-4">
            {/* Title Badge */}
            <div className="inline-block bg-white/30 backdrop-blur-sm px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 border border-white/50 shadow-lg min-h-[40px]">
              {current.title}
            </div>

            {/* Name */}
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-4 sm:mb-6 drop-shadow-2xl leading-none">
              {current.nickname}
            </h2>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
              <span className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg min-h-[40px]">
                <Eye size={14} />
                {current.stats.views}
              </span>
              <span className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg min-h-[40px]">
                <MessageCircle size={14} />
                {current.stats.comments}
              </span>
              <span className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg min-h-[40px]">
                <Calendar size={14} />
                {current.stats.time}
              </span>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed mb-6 font-medium max-w-3xl mx-auto drop-shadow-lg">
              {current.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 justify-center mb-6 sm:mb-8">
              {current.tags.map((tag, idx) => (
                <span key={idx} className="bg-white/30 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold border border-white/40 shadow-lg min-h-[40px]">
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setSelectedPolitician(current)}
              className="bg-white text-purple-700 px-8 sm:px-12 py-3 sm:py-4 rounded-full font-black hover:bg-white/95 transition text-base sm:text-lg hover:scale-105 active:scale-95 transform transition-transform duration-200 shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            >
              Explore Full Profile →
            </button>
          </div>

          {/* Next Button */}
          <button
            onClick={nextPolitician}
            className="absolute right-3 sm:right-4 lg:right-6 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition z-20 text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-xl hover:scale-110 transform"
          >
            ›
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-4 sm:gap-6">
        {/* Left - Politicians Gallery */}
        <div className="lg:col-start-5 lg:col-span-8 order-1">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border-2 border-white/50 ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3 tracking-tight">
                <span className="text-4xl">👥</span> All Politicians
              </h3>
              <button 
                onClick={() => setCurrentPage('politicians')}
                className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white px-5 py-2 rounded-full font-bold hover:scale-105 active:scale-95 transform transition-transform duration-200 transition shadow-md text-sm"
              >
                View All →
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
              {displayPoliticians.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6).map((politician, idx) => (
                <div 
                  key={idx} 
                  className="group cursor-pointer"
                  onClick={() => setSelectedPolitician(politician)}
                >
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all group-hover:scale-105 active:scale-95 transform transition-transform duration-200 border-3 border-purple-200">
                    <img 
                      src={politician.imageUrl} 
                      alt={politician.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="font-bold text-sm mb-1">{politician.name}</p>
                      <p className="text-xs opacity-90">{politician.title.split('•')[0]}</p>
                    </div>
                    <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                      {politician.chamber}
                    </div>
                    <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${politician.party === 'Democrat' ? 'bg-blue-500' : politician.party === 'Republican' ? 'bg-red-500' : 'bg-purple-500'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topics Grid */}
          <div className="mt-6">
            <h3 className="text-2xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3 tracking-tight mb-4 pl-2">
              <span className="text-4xl">📚</span> Learn Politics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayCivicTopics.slice(0, 4).map((topic, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setCurrentPage('education');
                  }}
                  className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex items-start gap-4 border-2 border-white hover:scale-[1.02] transform group"
                >
                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-br ${topic.color} rounded-xl flex items-center justify-center text-3xl shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      {topic.icon}
                    </div>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {topic.badge}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-lg text-gray-800 mb-1">{topic.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{topic.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest from Blog - Very Stylish Section */}
          {blogPosts.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4 pl-2">
                <h3 className="text-2xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3 tracking-tight">
                  <span className="text-4xl">📰</span> Political Insights
                </h3>
                <button
                  onClick={() => setCurrentPage('blog')}
                  className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white px-5 py-2 rounded-full font-bold hover:scale-105 active:scale-95 transform transition-transform duration-200 shadow-md text-sm"
                >
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {blogPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedBlogPost(post)}
                    className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden border-2 border-white hover:scale-[1.02] transform group"
                  >
                    {/* Featured Image */}
                    {post.featured_image && (
                      <div className="h-40 sm:h-48 overflow-hidden relative">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        {post.category && (
                          <span className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold shadow-lg">
                            {post.category}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-5">
                      {/* Title */}
                      <h4 className="font-black text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h4>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-2">
                          {post.author_name && (
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {post.author_name}
                            </span>
                          )}
                        </div>
                        {post.created_at && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Read More Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlogPost(post);
                        }}
                        className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 text-sm"
                      >
                        Read Article
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Blog CTA */}
              <div className="mt-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl text-white text-center">
                <BookOpen className="mx-auto mb-2" size={32} />
                <h4 className="font-black text-lg mb-2">Stay Informed</h4>
                <p className="text-sm opacity-90 mb-3">
                  Get the latest analysis on Kenya's political landscape, policy debates, and civic issues.
                </p>
                <button
                  onClick={() => setCurrentPage('blog')}
                  className="bg-white text-blue-700 px-6 py-2 rounded-full font-bold hover:scale-105 active:scale-95 transform transition-transform duration-200 shadow-lg text-sm"
                >
                  Explore All Articles →
                </button>
              </div>
            </div>
          )}

          {/* Stay Updated - Mobile Only (after Learn Politics) */}
          <div className="block lg:hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white border-2 border-white/50 ring-1 ring-gray-100 mt-6">
            <h3 className="text-xl font-black mb-2 text-center">Stay Updated 💌</h3>
            <p className="text-xs text-center mb-4 opacity-90">
              Weekly politics & policy insights
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-full border-2 border-white/50 text-gray-800 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm bg-white/95"
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
            <div className="flex justify-center gap-2 mt-4">
              {['TT', 'IG', 'YT', 'DC'].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xs font-bold hover:bg-white/30 transition hover:scale-110 transform border border-white/30"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-start-1 lg:col-span-4 flex flex-col space-y-5">
          {/* Quick Search */}
          <div className="order-1 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-lg border-2 border-white/50 ring-1 ring-gray-100">
            <h3 className="text-lg font-black mb-3 flex items-center gap-2">
              <Search size={18} className="text-purple-600" />
              Quick Search
            </h3>
            <div className="space-y-2">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  className={`w-full text-left px-3 py-2 bg-gradient-to-r ${search.color} text-white rounded-lg font-semibold hover:shadow-md transition text-xs hover:scale-105 active:scale-95 transform transition-transform duration-200 flex items-center gap-2`}
                >
                  <span>{search.icon}</span>
                  {search.text}
                </button>
              ))}
            </div>
          </div>

          {/* Newsletter - Desktop Only (in sidebar) */}
          <div className="hidden lg:block bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white border-2 border-white/50 ring-1 ring-gray-100 order-2 lg:order-2">
            <h3 className="text-xl font-black mb-2 text-center">Stay Updated 💌</h3>
            <p className="text-xs text-center mb-4 opacity-90">
              Weekly politics & policy insights
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-full border-2 border-white/50 text-gray-800 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm bg-white/95"
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
            <div className="flex justify-center gap-2 mt-4">
              {['TT', 'IG', 'YT', 'DC'].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xs font-bold hover:bg-white/30 transition hover:scale-110 transform border border-white/30"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Trending Compact */}
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


          {/* Quote */}
          <div className="order-4 bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-lg border-2 border-white/50 ring-1 ring-gray-100">
            <h3 className="text-base font-black mb-2 text-center text-purple-700 flex items-center justify-center gap-2">
              🌈 Quote of the Day
            </h3>
            <p className="text-center text-gray-700 text-xs leading-relaxed italic">
              "Democracy is not a spectator sport - every voice matters and every vote counts."
            </p>
            <p className="text-center text-xs text-gray-500 mt-2 font-semibold">
              - Engaged Citizens
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}