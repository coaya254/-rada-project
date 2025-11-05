import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ExternalLink, GripVertical } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

interface QuickLink {
  id?: number;
  title: string;
  url: string;
  icon: string;
  order_index: number;
  is_active: boolean;
}

export default function QuickLinksManagementScreen() {
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<QuickLink>({
    title: '',
    url: '',
    icon: '🔗',
    order_index: 0,
    is_active: true
  });

  useEffect(() => {
    fetchQuickLinks();
  }, []);

  const fetchQuickLinks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/quick-links`);
      const data = await response.json();
      setQuickLinks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quick links:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update existing
        await fetch(`${API_BASE_URL}/api/admin/quick-links/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Create new
        await fetch(`${API_BASE_URL}/api/admin/quick-links`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, order_index: quickLinks.length + 1 })
        });
      }

      fetchQuickLinks();
      resetForm();
    } catch (error) {
      console.error('Error saving quick link:', error);
    }
  };

  const handleEdit = (link: QuickLink) => {
    setFormData(link);
    setEditingId(link.id || null);
    setIsAdding(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this quick link?')) return;

    try {
      await fetch(`${API_BASE_URL}/api/admin/quick-links/${id}`, {
        method: 'DELETE'
      });
      fetchQuickLinks();
    } catch (error) {
      console.error('Error deleting quick link:', error);
    }
  };

  const toggleActive = async (link: QuickLink) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/quick-links/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...link, is_active: !link.is_active })
      });
      fetchQuickLinks();
    } catch (error) {
      console.error('Error toggling active status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      icon: '🔗',
      order_index: 0,
      is_active: true
    });
    setEditingId(null);
    setIsAdding(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Quick Links Management</h1>
            <p className="text-gray-600 mt-2">Manage sidebar quick links for Politicians page</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Quick Link
          </button>
        </div>

        {/* Form */}
        {(isAdding || editingId) && (
          <form onSubmit={handleSubmit} className="bg-purple-50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Quick Link' : 'Add New Quick Link'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  required
                  placeholder="e.g., Parliament Website"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL *</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  required
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="🔗"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-purple-600"
                />
                <span className="text-sm font-bold text-gray-700">Active (Show on website)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Save size={18} />
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition flex items-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* List */}
        <div className="space-y-4">
          {quickLinks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No quick links yet. Add your first one above!</p>
            </div>
          ) : (
            quickLinks.map((link) => (
              <div
                key={link.id}
                className={`bg-white border-2 rounded-xl p-4 flex items-center gap-4 ${
                  link.is_active ? 'border-gray-200' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="cursor-move text-gray-400">
                    <GripVertical size={20} />
                  </div>
                  <span className="text-3xl">{link.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{link.title}</h4>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {link.url}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="text-sm text-gray-500">Order: {link.order_index}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(link)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                      link.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {link.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleEdit(link)}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => link.id && handleDelete(link.id)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
