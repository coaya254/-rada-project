import React, { useState } from 'react';
import { Save, X, Image as ImageIcon, Plus, Trash2, GripVertical } from 'lucide-react';

export default function BlogForm({ selectedItem, onClose, onSave }) {
  // Initialize with proper structure
  const initialData = selectedItem || {
    title: '',
    excerpt: '',
    category: 'Policy Analysis',
    author: '',
    authorRole: '',
    readTime: '',
    image_url: '',
    tags: [],
    content: {
      intro: '',
      sections: [],
      conclusion: ''
    }
  };

  const [formData, setFormData] = useState(initialData);
  const [tagInput, setTagInput] = useState('');

  // Add a new section
  const addSection = () => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        sections: [
          ...formData.content.sections,
          { heading: '', paragraphs: [''] }
        ]
      }
    });
  };

  // Remove a section
  const removeSection = (index) => {
    const newSections = formData.content.sections.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      content: { ...formData.content, sections: newSections }
    });
  };

  // Update section heading
  const updateSectionHeading = (sectionIndex, heading) => {
    const newSections = [...formData.content.sections];
    newSections[sectionIndex] = { ...newSections[sectionIndex], heading };
    setFormData({
      ...formData,
      content: { ...formData.content, sections: newSections }
    });
  };

  // Add paragraph to section
  const addParagraph = (sectionIndex) => {
    const newSections = [...formData.content.sections];
    newSections[sectionIndex].paragraphs.push('');
    setFormData({
      ...formData,
      content: { ...formData.content, sections: newSections }
    });
  };

  // Update paragraph
  const updateParagraph = (sectionIndex, paragraphIndex, text) => {
    const newSections = [...formData.content.sections];
    newSections[sectionIndex].paragraphs[paragraphIndex] = text;
    setFormData({
      ...formData,
      content: { ...formData.content, sections: newSections }
    });
  };

  // Remove paragraph
  const removeParagraph = (sectionIndex, paragraphIndex) => {
    const newSections = [...formData.content.sections];
    newSections[sectionIndex].paragraphs = newSections[sectionIndex].paragraphs.filter((_, i) => i !== paragraphIndex);
    setFormData({
      ...formData,
      content: { ...formData.content, sections: newSections }
    });
  };

  // Handle tags
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = () => {
    // Prepare data for API
    const submitData = {
      ...formData,
      content: JSON.stringify(formData.content),
      tags: JSON.stringify(formData.tags),
      is_published: true
    };
    onSave(submitData);
  };

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-2">
      <div className="flex items-center justify-between sticky top-0 bg-white pb-4 z-10">
        <h2 className="text-3xl font-black">{selectedItem ? 'Edit' : 'Create New'} Blog Post</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Basic Info */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border-2 border-pink-200">
        <h3 className="text-xl font-black mb-4 text-pink-700">📝 Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Post Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none text-lg font-semibold"
              placeholder="Understanding the 2024 Infrastructure Bill"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Excerpt (Short Summary) *</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
              placeholder="A compelling summary that appears in post listings and social media previews..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
              >
                <option>Policy Analysis</option>
                <option>Elections</option>
                <option>Judicial</option>
                <option>Civic Education</option>
                <option>Opinion</option>
                <option>Breaking News</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Author *</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
                placeholder="Sarah Chen"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Author Role</label>
              <input
                type="text"
                value={formData.authorRole}
                onChange={(e) => setFormData({...formData, authorRole: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
                placeholder="Policy Analyst"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Featured Image URL</label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
              placeholder="https://images.unsplash.com/..."
            />
            {formData.image_url && (
              <img src={formData.image_url} alt="Preview" className="mt-3 w-full max-h-48 object-cover rounded-lg" />
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
                placeholder="Type tag and press Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg font-bold hover:bg-pink-600 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold flex items-center gap-2">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-purple-900">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="text-xl font-black mb-4 text-blue-700">✍️ Article Content</h3>

        {/* Introduction */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Introduction Paragraph</label>
          <textarea
            value={formData.content.intro}
            onChange={(e) => setFormData({
              ...formData,
              content: { ...formData.content, intro: e.target.value }
            })}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="Write an engaging introduction that hooks the reader and sets up the article..."
          />
        </div>

        {/* Sections */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-bold text-gray-700">Article Sections</label>
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition text-sm"
            >
              <Plus size={16} />
              Add Section
            </button>
          </div>

          <div className="space-y-6">
            {formData.content.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-xl p-5 border-2 border-blue-200 relative">
                <div className="flex items-center gap-2 mb-3">
                  <GripVertical size={20} className="text-gray-400" />
                  <span className="font-bold text-blue-600">Section {sectionIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={section.heading}
                      onChange={(e) => updateSectionHeading(sectionIndex, e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-bold"
                      placeholder="Section Heading (e.g., 'The Economic Impact')"
                    />
                  </div>

                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <div key={paragraphIndex} className="flex gap-2">
                      <textarea
                        value={paragraph}
                        onChange={(e) => updateParagraph(sectionIndex, paragraphIndex, e.target.value)}
                        rows={3}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder={`Paragraph ${paragraphIndex + 1}...`}
                      />
                      {section.paragraphs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParagraph(sectionIndex, paragraphIndex)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition h-fit"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addParagraph(sectionIndex)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Paragraph to Section
                  </button>
                </div>
              </div>
            ))}
          </div>

          {formData.content.sections.length === 0 && (
            <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-blue-300">
              <p className="text-gray-500 mb-3">No sections added yet</p>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition"
              >
                <Plus size={18} />
                Add Your First Section
              </button>
            </div>
          )}
        </div>

        {/* Conclusion */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Conclusion</label>
          <textarea
            value={formData.content.conclusion}
            onChange={(e) => setFormData({
              ...formData,
              content: { ...formData.content, conclusion: e.target.value }
            })}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="Wrap up the article with key takeaways and closing thoughts..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-0 bg-white pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-4 rounded-xl font-bold hover:shadow-xl transition flex items-center justify-center gap-2 text-lg"
        >
          <Save size={22} />
          Publish Blog Post
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-8 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
