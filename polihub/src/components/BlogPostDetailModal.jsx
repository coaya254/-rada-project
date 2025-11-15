// ============================================
// FILE: components/BlogPostDetailModal.jsx
// ============================================

import React, { useState } from 'react';
import { Share2, Bookmark, Lightbulb, User, Check } from 'lucide-react';

export default function BlogPostDetailModal({ post, onClose, setCurrentPage }) {
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!post) return null;

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.excerpt || post.title,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewAuthor = () => {
    onClose();
    setCurrentPage('blog-author');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header Image */}
        <div className="relative h-56 sm:h-72 md:h-96">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition text-white z-10"
          >
            ✕
          </button>

          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 right-4 sm:right-6 md:right-8">
            <span className="inline-block bg-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-white text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold">{post.author}</div>
                  <div className="text-xs opacity-90">{post.authorRole}</div>
                </div>
              </div>
              <span className="hidden sm:inline opacity-90">•</span>
              <span className="text-xs sm:text-sm">{post.date}</span>
              <span className="hidden sm:inline opacity-90">•</span>
              <span className="text-xs sm:text-sm">{post.readTime}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200 text-sm sm:text-base">
            <button
              onClick={handleShare}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                shareSuccess
                  ? 'bg-green-100 text-green-600'
                  : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
              }`}
            >
              {shareSuccess ? <Check size={20} /> : <Share2 size={20} />}
              <span className="font-semibold">{shareSuccess ? 'Link Copied!' : 'Share Article'}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition ml-auto">
              <Bookmark size={20} />
              <span className="font-semibold">Save</span>
            </button>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {(post.tags || []).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Article Content */}
          <div className="prose max-w-none">
            {post.content?.intro && (
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-8 font-medium">
                {post.content.intro}
              </p>
            )}

            {(post.content?.sections || []).map((section, idx) => (
              <div key={idx} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-4">
                  {section.heading}
                </h2>
                {(section.paragraphs || []).map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-gray-700 leading-relaxed mb-4 text-base sm:text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}

            {post.content?.conclusion && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 my-8 border-2 border-purple-100">
                <h3 className="text-2xl font-black mb-3 flex items-center gap-2">
                  <Lightbulb className="text-purple-600" size={24} />
                  Key Takeaway
                </h3>
                <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                  {post.content.conclusion}
                </p>
              </div>
            )}

            {/* Author Bio */}
            <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 mt-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
                  {post.author.charAt(0)}
                </div>
                <div className="flex-1">
                <h4 className="text-lg sm:text-xl font-black mb-1">{post.author}</h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">{post.authorRole}</p>
                  <button
                    onClick={handleViewAuthor}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold text-sm hover:shadow-lg transition flex items-center gap-2"
                  >
                    <User size={16} />
                    View Author Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}