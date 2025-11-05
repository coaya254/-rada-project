// ============================================
// FILE: components/TopicDetailModal.jsx
// ============================================

import React from 'react';
import { Clock, ThumbsUp, Share2, Lightbulb } from 'lucide-react';

export default function TopicDetailModal({ topic, onClose }) {
  if (!topic) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`relative p-4 sm:p-6 md:p-8 bg-gradient-to-br ${topic.color}`}>
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
          >
            ✕
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center text-4xl sm:text-5xl">
              {topic.icon}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold mb-2 sm:mb-3">
                {topic.category}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">{topic.title}</h2>
              <p className="text-white/90 text-base sm:text-lg">{topic.subtitle}</p>
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4 justify-center sm:justify-start">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
                  <Clock size={12} />
                  {topic.readTime}
                </span>
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold">
                  {topic.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="prose max-w-none">
            {topic.fullContent?.intro && (
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                {topic.fullContent.intro}
              </p>
            )}

            {(topic.fullContent?.keyPoints || []).map((point, idx) => (
              <div key={idx} className="mb-8">
                <h3 className="text-2xl font-black text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm">
                    {idx + 1}
                  </span>
                  {point.title}
                </h3>
                <p className="text-gray-700 leading-relaxed pl-10">
                  {point.content}
                </p>
              </div>
            ))}

            {topic.fullContent?.examples && topic.fullContent.examples.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                  <Lightbulb className="text-purple-600" size={24} />
                  Real-World Examples
                </h3>
                <ul className="space-y-3">
                  {(topic.fullContent.examples || []).map((example, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="text-gray-700">{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition hover:scale-105 transform flex items-center justify-center gap-2">
                <ThumbsUp size={18} />
                Mark as Complete
              </button>
              <button className="px-6 bg-purple-100 text-purple-700 py-4 rounded-xl font-bold hover:bg-purple-200 transition flex items-center justify-center gap-2">
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}