import React from 'react';
import { Plus, X, ExternalLink } from 'lucide-react';

/**
 * SourceButtonManager - Admin component for managing custom sources
 *
 * Replaces the old checkbox multiselect system with individual source entry:
 * - Source name input
 * - URL input
 * - Color picker
 * - Plus button to add more sources
 *
 * @param {Array} sources - Array of source objects: [{ name, url, color }]
 * @param {Function} onChange - Callback when sources array changes
 * @param {String} label - Label for the section (optional)
 */
export default function SourceButtonManager({ sources = [], onChange, label = "Sources" }) {

  // Add a new empty source
  const addSource = () => {
    const newSource = {
      name: '',
      url: '',
      color: '#3B82F6' // Default blue
    };
    onChange([...sources, newSource]);
  };

  // Update a specific source field
  const updateSource = (index, field, value) => {
    const updatedSources = sources.map((source, idx) => {
      if (idx === index) {
        return { ...source, [field]: value };
      }
      return source;
    });
    onChange(updatedSources);
  };

  // Remove a source
  const removeSource = (index) => {
    const updatedSources = sources.filter((_, idx) => idx !== index);
    onChange(updatedSources);
  };

  return (
    <div className="col-span-2">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-bold text-gray-700">
          {label}
          <span className="text-xs font-normal text-gray-500 ml-2">
            (Add credible sources with custom colors)
          </span>
        </label>
        <button
          type="button"
          onClick={addSource}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={14} />
          Add Source
        </button>
      </div>

      {sources.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm mb-2">No sources added yet</p>
          <p className="text-gray-400 text-xs">
            Click "Add Source" to add credible sources for this item
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map((source, idx) => (
            <div
              key={idx}
              className="border border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="grid grid-cols-12 gap-3 items-start">
                {/* Source Name Input */}
                <div className="col-span-5">
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Source Name
                  </label>
                  <input
                    type="text"
                    value={source.name}
                    onChange={(e) => updateSource(idx, 'name', e.target.value)}
                    placeholder="e.g., Parliament Records"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* URL Input */}
                <div className="col-span-5">
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Source URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={source.url}
                      onChange={(e) => updateSource(idx, 'url', e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
                        title="Test URL"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Color Picker */}
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={source.color}
                    onChange={(e) => updateSource(idx, 'color', e.target.value)}
                    className="w-full h-[38px] border border-gray-300 rounded-lg cursor-pointer"
                    title="Choose button color"
                  />
                </div>

                {/* Remove Button */}
                <div className="col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={() => removeSource(idx)}
                    className="w-full h-[38px] flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"
                    title="Remove source"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Preview Button */}
              {source.name && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-bold text-gray-600 mb-2">Preview:</p>
                  <div className="flex items-center gap-2">
                    <a
                      href={source.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition hover:opacity-80 shadow-sm"
                      style={{
                        backgroundColor: source.color + '20',
                        color: source.color,
                        border: `2px solid ${source.color}`,
                        cursor: source.url ? 'pointer' : 'default'
                      }}
                      onClick={(e) => {
                        if (!source.url) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>{source.name}</span>
                    </a>
                    <span className="text-xs text-gray-400">
                      (This is how users will see it)
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {sources.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> Add multiple credible sources to increase transparency.
            Users can click these buttons to verify the information.
          </p>
        </div>
      )}
    </div>
  );
}
