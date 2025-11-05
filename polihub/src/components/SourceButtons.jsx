import React from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * SourceButtons - Display component for showing sources as colored buttons
 *
 * Used on the user-facing side to display credible sources for any content item
 * (documents, news, timeline events, voting records, promises, achievements, etc.)
 *
 * @param {Array} sources - Array of source objects: [{ name, url, color }]
 * @param {String} className - Additional classes (optional)
 * @param {String} hintText - Optional hint text to show above sources
 */
export default function SourceButtons({ sources = [], className = '', hintText = null }) {

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {hintText && (
        <p className="text-xs text-gray-500 mb-2 font-semibold">
          {hintText}
        </p>
      )}
      <div className="flex gap-2 flex-wrap">
        {sources.map((source, idx) => (
          <a
            key={idx}
            href={source.url || source.default_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition hover:opacity-80 shadow-sm hover:shadow-md"
            style={{
              backgroundColor: (source.color || source.button_color || '#3B82F6') + '20',
              color: source.color || source.button_color || '#3B82F6',
              border: `1.5px solid ${source.color || source.button_color || '#3B82F6'}`
            }}
            onClick={(e) => {
              if (!source.url && !source.default_url) {
                e.preventDefault();
              }
            }}
          >
            <ExternalLink size={12} />
            <span>{source.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
