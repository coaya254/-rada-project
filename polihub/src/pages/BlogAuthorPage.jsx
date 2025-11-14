import React, { useState, useEffect } from 'react';
import { User, Mail, Twitter, Instagram, Facebook, Calendar, Eye, ArrowRight } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Fixed: Using prop instead of react-router-dom
export default function BlogAuthorPage({ authorId = 1 }) {
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authorId) {
      fetchAuthorData();
    }
  }, [authorId]);

  const fetchAuthorData = async () => {
    try {
      // Fetch author info
      const authorRes = await fetch(`${API_BASE_URL}/api/polihub/blog/authors/${authorId}`);
      const authorData = await authorRes.json();

      // Fetch author's articles
      const articlesRes = await fetch(`${API_BASE_URL}/api/polihub/blog/posts?author_id=${authorId}`);
      const articlesData = await articlesRes.json();

      if (authorData.success) setAuthor(authorData.data);
      if (articlesData.success) setArticles(articlesData.data);
    } catch (error) {
      console.error('Error fetching author:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading author...</p>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Author Not Found</h2>
          <p className="text-gray-600">The author you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Author Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Author Photo */}
            <div className="flex-shrink-0">
              {author.profile_image ? (
                <img
                  src={author.profile_image}
                  alt={author.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
                  <User size={48} className="text-blue-600" />
                </div>
              )}
            </div>

            {/* Author Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-black text-gray-900 mb-2">{author.name}</h1>
              <p className="text-lg text-blue-600 font-bold mb-4">{author.title || 'Contributing Writer'}</p>

              {author.bio && (
                <p className="text-gray-700 leading-relaxed mb-4">{author.bio}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-gray-900">{articles.length}</div>
                  <div className="text-sm text-gray-600">Articles</div>
                </div>
                {author.total_views && (
                  <div className="text-center">
                    <div className="text-2xl font-black text-gray-900">{author.total_views.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Views</div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex gap-4">
                {author.email && (
                  <a
                    href={`mailto:${author.email}`}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700"
                  >
                    <Mail size={20} />
                  </a>
                )}
                {author.twitter && (
                  <a
                    href={author.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600"
                  >
                    <Twitter size={20} />
                  </a>
                )}
                {author.instagram && (
                  <a
                    href={author.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-pink-100 hover:bg-pink-200 flex items-center justify-center text-pink-600"
                  >
                    <Instagram size={20} />
                  </a>
                )}
                {author.facebook && (
                  <a
                    href={author.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-700"
                  >
                    <Facebook size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            Articles by {author.name} ({articles.length})
          </h2>

          {articles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden group"
                >
                  {article.featured_image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                      {article.views && (
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {article.views}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>

                    {article.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}

                    {article.category && (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mb-4">
                        {article.category}
                      </span>
                    )}

                    <button
                      onClick={() => window.location.href = `/blog/${article.slug}`}
                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg font-bold transition flex items-center justify-center gap-2"
                    >
                      Read Article
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center">
              <p className="text-gray-600">No articles yet from this author.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
