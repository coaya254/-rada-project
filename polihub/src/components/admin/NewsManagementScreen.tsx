import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Calendar, Clock, User, Tag, AlertCircle, CheckCircle } from 'lucide-react';

export default function NewsManagementScreen() {
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: "Understanding the 2024 Infrastructure Bill: What It Means for Your Community",
      excerpt: "Breaking down the historic infrastructure investment and how federal funding will impact local projects, jobs, and daily life across America.",
      author: "Sarah Chen",
      authorRole: "Policy Analyst",
      date: "Oct 8, 2025",
      readTime: "12 min read",
      category: "Policy Analysis",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
      likes: 234,
      comments: 45,
      tags: ["Infrastructure", "Economy", "Local Impact"],
      status: "published",
      featured: true,
      content: {
        intro: "The Infrastructure Investment and Jobs Act represents one of the most significant federal investments in American infrastructure in decades.",
        sections: [
          {
            heading: "Transportation Upgrades",
            paragraphs: [
              "Over $110 billion is allocated for roads, bridges, and major projects.",
              "Public transit receives $39 billion, the largest federal investment in history."
            ]
          }
        ],
        conclusion: "This infrastructure package touches nearly every aspect of American life."
      }
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [categories, setCategories] = useState(['Policy Analysis', 'Elections', 'Judicial', 'Civic Education']);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    author: '',
    authorRole: '',
    category: 'Policy Analysis',
    image: '',
    imageFile: null,
    tags: [],
    status: 'draft',
    featured: false,
    readTime: '',
    content: {
      intro: '',
      sections: [{ heading: '', paragraphs: [''] }],
      conclusion: ''
    }
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openModal = (article = null) => {
    if (article) {
      setFormData(article);
      setEditingId(article.id);
    } else {
      setFormData({
        title: '',
        excerpt: '',
        author: '',
        authorRole: '',
        category: 'Policy Analysis',
        image: '',
        tags: [],
        status: 'draft',
        featured: false,
        readTime: '',
        content: {
          intro: '',
          sections: [{ heading: '', paragraphs: [''] }],
          conclusion: ''
        }
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.title || !formData.author || !formData.excerpt) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    if (editingId) {
      setArticles(articles.map(a => 
        a.id === editingId 
          ? { ...formData, id: editingId, likes: a.likes, comments: a.comments } 
          : a
      ));
      showNotification('Article updated successfully');
    } else {
      const newArticle = {
        ...formData,
        id: Date.now(),
        likes: 0,
        comments: 0,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      };
      setArticles([newArticle, ...articles]);
      showNotification('Article created successfully');
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      setArticles(articles.filter(a => a.id !== id));
      showNotification('Article deleted');
    }
  };

  const togglePublish = (id) => {
    setArticles(articles.map(a => 
      a.id === id 
        ? { ...a, status: a.status === 'published' ? 'draft' : 'published' }
        : a
    ));
    const article = articles.find(a => a.id === id);
    showNotification(article?.status === 'published' ? 'Article unpublished' : 'Article published');
  };

  const toggleFeatured = (id) => {
    setArticles(articles.map(a => 
      a.id === id 
        ? { ...a, featured: !a.featured }
        : a
    ));
    showNotification('Featured status updated');
  };

  const filteredArticles = articles.filter(article => {
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                News Management
              </h1>
              <p className="text-gray-600">Create and manage political discourse content for your platform</p>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2 hover:scale-105 transform"
            >
              <Plus size={20} />
              New Article
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border-2 border-white">
              <div className="text-3xl font-black text-purple-600">{articles.length}</div>
              <div className="text-sm text-gray-600 font-semibold">Total Articles</div>
            </div>
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border-2 border-white">
              <div className="text-3xl font-black text-green-600">{articles.filter(a => a.status === 'published').length}</div>
              <div className="text-sm text-gray-600 font-semibold">Published</div>
            </div>
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border-2 border-white">
              <div className="text-3xl font-black text-yellow-600">{articles.filter(a => a.status === 'draft').length}</div>
              <div className="text-sm text-gray-600 font-semibold">Drafts</div>
            </div>
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border-2 border-white">
              <div className="text-3xl font-black text-pink-600">{articles.filter(a => a.featured).length}</div>
              <div className="text-sm text-gray-600 font-semibold">Featured</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search articles by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-white bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-3 rounded-lg border-2 border-white bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Notification */}
          {notification && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              notification.type === 'success' 
                ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                : 'bg-red-100 text-red-800 border-2 border-red-300'
            }`}>
              {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {notification.message}
            </div>
          )}

          {/* Articles List */}
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-md rounded-xl p-12 shadow-lg text-center border-2 border-white">
                <div className="text-5xl mb-3">📝</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No articles found</h3>
                <p className="text-gray-600">Create your first article to get started</p>
              </div>
            ) : (
              filteredArticles.map(article => (
                <div key={article.id} className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border-2 border-white overflow-hidden hover:shadow-2xl transition">
                  <div className="flex items-stretch">
                    {/* Thumbnail */}
                    <div className="w-48 h-40 flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200">
                      {article.image ? (
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🖼️</div>
                      )}
                      {article.featured && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          FEATURED
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-xl font-black text-gray-800 mb-2">{article.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{article.excerpt}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-4 ${
                            article.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {article.status === 'published' ? '✓ Published' : '⊘ Draft'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {article.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-6 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {article.author} • {article.authorRole}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {article.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {article.readTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="w-48 p-5 border-l-2 border-gray-200 flex flex-col justify-between">
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Views</span>
                          <span className="font-bold text-gray-800">{article.likes}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Comments</span>
                          <span className="font-bold text-gray-800">{article.comments}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Category</span>
                          <span className="font-bold text-gray-800 text-right text-xs">{article.category}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => togglePublish(article.id)}
                          className={`w-full py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1 ${
                            article.status === 'published'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                        >
                          {article.status === 'published' ? <Eye size={14} /> : <EyeOff size={14} />}
                          {article.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => toggleFeatured(article.id)}
                          className={`w-full py-2 rounded-lg font-bold text-xs transition ${
                            article.featured
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {article.featured ? '⭐ Featured' : 'Featured'}
                        </button>
                        <button
                          onClick={() => openModal(article)}
                          className="w-full bg-purple-100 text-purple-700 py-2 rounded-lg font-bold text-xs hover:bg-purple-200 transition flex items-center justify-center gap-1"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-bold text-xs hover:bg-red-200 transition flex items-center justify-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Article Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 flex items-center justify-between border-b-4 border-white">
              <h2 className="text-3xl font-black">
                {editingId ? 'Edit Article' : 'Create New Article'}
              </h2>
              <button
                onClick={closeModal}
                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-gray-800">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Article Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                    placeholder="Enter article title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Excerpt *</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none h-20"
                    placeholder="Brief summary of the article"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Author Name *</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                      placeholder="e.g., Sarah Chen"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Author Role</label>
                    <input
                      type="text"
                      value={formData.authorRole}
                      onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                      placeholder="e.g., Policy Analyst"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Read Time</label>
                    <input
                      type="text"
                      value={formData.readTime}
                      onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                      placeholder="e.g., 12 min read"
                    />
                  </div>
                </div>
              </div>

              {/* Media & Metadata */}
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-gray-800">Media & Metadata</h3>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Featured Image URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="mt-3 h-40 w-full object-cover rounded-lg" onError={() => {}} />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={typeof formData.tags === 'string' ? formData.tags : formData.tags.join(', ')}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                    placeholder="Infrastructure, Economy, Local Impact"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-gray-800">Article Content</h3>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Introduction</label>
                  <textarea
                    value={formData.content.intro}
                    onChange={(e) => setFormData({
                      ...formData,
                      content: { ...formData.content, intro: e.target.value }
                    })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none h-24"
                    placeholder="Opening paragraph of your article"
                  />
                </div>

                {formData.content.sections.map((section, sIdx) => (
                  <div key={sIdx} className="p-4 bg-purple-50 rounded-lg space-y-3 border-2 border-purple-100">
                    <input
                      type="text"
                      value={section.heading}
                      onChange={(e) => {
                        const newSections = [...formData.content.sections];
                        newSections[sIdx].heading = e.target.value;
                        setFormData({ ...formData, content: { ...formData.content, sections: newSections } });
                      }}
                      className="w-full px-4 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none font-bold"
                      placeholder="Section heading"
                    />
                    {section.paragraphs.map((para, pIdx) => (
                      <textarea
                        key={pIdx}
                        value={para}
                        onChange={(e) => {
                          const newSections = [...formData.content.sections];
                          newSections[sIdx].paragraphs[pIdx] = e.target.value;
                          setFormData({ ...formData, content: { ...formData.content, sections: newSections } });
                        }}
                        className="w-full px-4 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none h-20"
                        placeholder={`Paragraph ${pIdx + 1}`}
                      />
                    ))}
                    <button
                      onClick={() => {
                        const newSections = [...formData.content.sections];
                        newSections[sIdx].paragraphs.push('');
                        setFormData({ ...formData, content: { ...formData.content, sections: newSections } });
                      }}
                      className="text-sm bg-purple-200 text-purple-700 px-3 py-1 rounded-lg font-bold hover:bg-purple-300 transition"
                    >
                      + Add Paragraph
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      content: {
                        ...formData.content,
                        sections: [...formData.content.sections, { heading: '', paragraphs: [''] }]
                      }
                    });
                  }}
                  className="w-full bg-purple-200 text-purple-700 py-2 rounded-lg font-bold hover:bg-purple-300 transition"
                >
                  + Add Section
                </button>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Conclusion</label>
                  <textarea
                    value={formData.content.conclusion}
                    onChange={(e) => setFormData({
                      ...formData,
                      content: { ...formData.content, conclusion: e.target.value }
                    })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none h-24"
                    placeholder="Closing thoughts and key takeaway"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-100">
                <h3 className="text-xl font-black text-gray-800">Publishing</h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold text-gray-700">Draft</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === 'published'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold text-gray-700">Published</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer ml-auto">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold text-gray-700">Mark as Featured</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:shadow-lg transition flex items-center justify-center gap-2 hover:scale-105 transform"
                >
                  <Save size={18} />
                  {editingId ? 'Update Article' : 'Create Article'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}