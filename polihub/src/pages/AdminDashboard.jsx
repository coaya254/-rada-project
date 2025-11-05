import React, { useState, useCallback, useEffect } from 'react';
import {
  LayoutDashboard, Users, BookOpen, FileText, Settings,
  Plus, Edit2, Trash2, Search, Eye,
  TrendingUp, Clock, BarChart3, LogOut, X, Sparkles,
  Briefcase, Mail, CheckCircle, XCircle, Scale
} from 'lucide-react';
import PoliticianFormEnhanced from '../components/admin/PoliticianFormEnhanced';
import ModuleForm from '../components/admin/ModuleForm';
import BlogForm from '../components/admin/BlogForm';
import AboutPageAdmin from './AboutPageAdmin';

// Modal Component - moved outside to prevent re-creation on every render
function AdminModal({ showModal, modalType, selectedItem, closeModal, handleSavePolitician, handleSaveModule, handleSaveBlogPost }) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {modalType === 'politician' && (
          <PoliticianFormEnhanced
            selectedItem={selectedItem}
            onClose={closeModal}
            onSave={handleSavePolitician}
          />
        )}
        {modalType === 'module' && (
          <ModuleForm
            selectedItem={selectedItem}
            onClose={closeModal}
            onSave={handleSaveModule}
          />
        )}
        {modalType === 'blog' && (
          <BlogForm
            selectedItem={selectedItem}
            onClose={closeModal}
            onSave={handleSaveBlogPost}
          />
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard({ onClose }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State declarations
  const [blogPosts, setBlogPosts] = useState([]);
  const [learningModules, setLearningModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [politicians, setPoliticians] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [bills, setBills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingTopicData, setEditingTopicData] = useState(null);

  // Real stats calculated from actual data
  const stats = {
    politicians: politicians.length,
    modules: learningModules.length,
    posts: blogPosts.length,
    lessons: lessons.length,
    pendingReview: blogPosts.filter(p => p.status === 'draft').length +
                   politicians.filter(p => p.status === 'draft').length +
                   learningModules.filter(m => m.status === 'draft').length
  };

  // Fetch all data from API
  useEffect(() => {
    const fetchData = async () => {
      console.log('🚀 AdminDashboard: Starting data fetch...');

      // Fetch blog posts
      try {
        const blogResponse = await fetch('http://localhost:5000/api/polihub/blog?status=all&limit=100');
        const blogData = await blogResponse.json();
        if (blogData.success) {
          setBlogPosts(blogData.data || []);
        }
      } catch (error) {
        console.error('❌ Error fetching blog posts:', error);
      }

      // Fetch learning modules (includes lessons)
      try {
        const modulesResponse = await fetch('http://localhost:5000/api/polihub/civic-modules?status=all');
        const modulesData = await modulesResponse.json();
        console.log('📚 Modules API Response:', modulesData);
        if (modulesData.success) {
          console.log('✅ Setting modules:', modulesData.data);
          setLearningModules(modulesData.data || []);

          // Extract all lessons from all modules
          const allLessons = [];
          (modulesData.data || []).forEach(module => {
            if (module.lessons && module.lessons.length > 0) {
              module.lessons.forEach(lesson => {
                allLessons.push({
                  ...lesson,
                  module_id: module.id,
                  module_title: module.title
                });
              });
            }
          });
          console.log('✅ Extracted lessons from modules:', allLessons.length);
          setLessons(allLessons);
        }
      } catch (error) {
        console.error('❌ Error fetching modules:', error);
      }

      // Fetch politicians
      try {
        const politiciansResponse = await fetch('http://localhost:5000/api/polihub/politicians?status=all');
        const politiciansData = await politiciansResponse.json();
        console.log('👥 Politicians API Response:', politiciansData);
        if (politiciansData.success) {
          console.log('✅ Setting politicians:', politiciansData.data);
          setPoliticians(politiciansData.data || []);
        }
      } catch (error) {
        console.error('❌ Error fetching politicians:', error);
      }

      // Fetch trending topics
      try {
        const trendingResponse = await fetch('http://localhost:5000/api/polihub/trending/all');
        const trendingData = await trendingResponse.json();
        if (trendingData.success) {
          setTrendingTopics(trendingData.data || []);
        }
      } catch (error) {
        console.error('❌ Error fetching trending topics:', error);
      }

      // Fetch bills
      try {
        const billsResponse = await fetch('http://localhost:5000/api/polihub/bills');
        const billsData = await billsResponse.json();
        if (billsData.success) {
          setBills(billsData.data || []);
        }
      } catch (error) {
        console.error('❌ Error fetching bills:', error);
      }

      // Fetch jobs
      try {
        const jobsResponse = await fetch('http://localhost:5000/api/polihub/jobs');
        const jobsData = await jobsResponse.json();
        if (jobsData.success) {
          setJobs(jobsData.data || []);
        }
      } catch (error) {
        console.error('❌ Error fetching jobs:', error);
      }

      // Fetch contact submissions
      try {
        const contactsResponse = await fetch('http://localhost:5000/api/polihub/contacts');
        const contactsData = await contactsResponse.json();
        if (contactsData.success) {
          setContacts(contactsData.data || []);
        }
      } catch (error) {
        console.error('❌ Error fetching contacts:', error);
      }

      // Fetch blog authors
      try {
        const authorsResponse = await fetch('http://localhost:5000/api/polihub/blog/authors');
        const authorsData = await authorsResponse.json();
        if (authorsData.success) {
          setAuthors(authorsData.data || []);
        }
      } catch (error) {
        console.error('❌ Error fetching authors:', error);
      }

      console.log('✅ AdminDashboard: All data fetches completed');
    };

    fetchData();
  }, []);

  const openModal = async (type, item = null) => {
    setModalType(type);

    // If editing a politician, fetch full details first
    if (type === 'politician' && item && item.id) {
      try {
        const response = await fetch(`http://localhost:5000/api/polihub/politicians/${item.id}`);
        const data = await response.json();

        if (data.success) {
          setSelectedItem(data.data);
        } else {
          console.error('Failed to fetch politician details:', data.error);
          setSelectedItem(item); // Fallback to basic data
        }
      } catch (error) {
        console.error('Error fetching politician details:', error);
        setSelectedItem(item); // Fallback to basic data
      }
    } else {
      setSelectedItem(item);
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalType('');
  };

  const handleSavePolitician = async (formData) => {
    try {
      console.log('Saving politician with extended data:', formData);

      // Save basic politician info
      const response = await fetch('http://localhost:5000/api/polihub/politicians/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Politician and all related data saved successfully!');

        // Refresh politicians list without reloading page
        const politiciansResponse = await fetch('http://localhost:5000/api/polihub/politicians?status=all');
        const politiciansData = await politiciansResponse.json();
        if (politiciansData.success) {
          setPoliticians(politiciansData.data);
        }

        closeModal();
      } else {
        alert('❌ Error: ' + (data.error || 'Failed to save politician') + '\n\nModal will stay open so you can fix the issue without losing your data.');
        // DO NOT close modal on error to prevent data loss
      }
    } catch (error) {
      console.error('Error saving politician:', error);
      alert('❌ Error saving politician: ' + error.message + '\n\nModal will stay open so you can fix the issue without losing your data.');
      // DO NOT close modal on error to prevent data loss
    }
  };

  const handleSaveModule = async (formData) => {
    try {
      console.log('Saving module:', formData);

      const response = await fetch('http://localhost:5000/api/polihub/civic-modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Module ${formData.status === 'published' ? 'published' : 'saved as draft'} successfully!`);
        window.location.reload();
      } else {
        alert('❌ Error: ' + (data.error || 'Failed to save module'));
      }
    } catch (error) {
      console.error('Error saving module:', error);
      alert('❌ Error saving module: ' + error.message);
    }
    closeModal();
  };

  const handleSaveBlogPost = async (formData) => {
    try {
      console.log('Saving blog post:', formData);

      const response = await fetch('http://localhost:5000/api/polihub/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Blog post published successfully!');
        // Reload the blog posts list
        window.location.reload();
      } else {
        alert('❌ Error: ' + (data.error || 'Failed to save post'));
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('❌ Error saving blog post: ' + error.message);
    }

    closeModal();
  };

  const handleDeletePolitician = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also delete all related documents, news, timeline events, commitments, and voting records. This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/polihub/politicians/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Politician deleted successfully!');
        // Remove from state
        setPoliticians(politicians.filter(p => p.id !== id));
      } else {
        alert('❌ Error: ' + (data.error || 'Failed to delete politician'));
      }
    } catch (error) {
      console.error('Error deleting politician:', error);
      alert('❌ Error deleting politician: ' + error.message);
    }
  };

  const handleTogglePublish = async (id, currentStatus, name) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'publish' : 'unpublish';

    if (!window.confirm(`Are you sure you want to ${action} "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/polihub/politicians/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Politician ${action}ed successfully!`);
        // Update state
        setPoliticians(politicians.map(p =>
          p.id === id ? { ...p, status: newStatus, updated_at: new Date().toISOString() } : p
        ));
      } else {
        alert('❌ Error: ' + (data.error || 'Failed to update status'));
      }
    } catch (error) {
      console.error('Error updating politician status:', error);
      alert('❌ Error updating status: ' + error.message);
    }
  };

  // Dashboard Overview
  const DashboardView = () => (
    <div>
      <h1 className="text-4xl font-black mb-6">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-purple-600" size={24} />
            <span className="text-xs font-bold text-green-600">+12%</span>
          </div>
          <div className="text-3xl font-black text-gray-800">{stats.politicians}</div>
          <div className="text-sm text-gray-600">Politicians</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="text-blue-600" size={24} />
            <span className="text-xs font-bold text-green-600">+5%</span>
          </div>
          <div className="text-3xl font-black text-gray-800">{stats.modules}</div>
          <div className="text-sm text-gray-600">Learning Modules</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-pink-100">
          <div className="flex items-center justify-between mb-2">
            <FileText className="text-pink-600" size={24} />
            <span className="text-xs font-bold text-green-600">+23%</span>
          </div>
          <div className="text-3xl font-black text-gray-800">{stats.posts}</div>
          <div className="text-sm text-gray-600">Blog Posts</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-100">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="text-green-600" size={24} />
            <span className="text-xs font-bold text-green-600">Live</span>
          </div>
          <div className="text-3xl font-black text-gray-800">{stats.lessons}</div>
          <div className="text-sm text-gray-600">Total Lessons</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-orange-600" size={24} />
            <span className="text-xs font-bold text-orange-600">ACTION</span>
          </div>
          <div className="text-3xl font-black text-gray-800">{stats.pendingReview}</div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => openModal('politician')}
          className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition hover:scale-105 transform"
        >
          <Plus size={32} className="mb-2" />
          <div className="text-xl font-black">Add Politician</div>
          <div className="text-sm opacity-90">Create new profile</div>
        </button>
        
        <button
          onClick={() => openModal('module')}
          className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition hover:scale-105 transform"
        >
          <Plus size={32} className="mb-2" />
          <div className="text-xl font-black">Add Learning Module</div>
          <div className="text-sm opacity-90">Create educational content</div>
        </button>
        
        <button
          onClick={() => openModal('blog')}
          className="bg-gradient-to-br from-pink-500 to-red-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition hover:scale-105 transform"
        >
          <Plus size={32} className="mb-2" />
          <div className="text-xl font-black">Add Blog Post</div>
          <div className="text-sm opacity-90">Write new article</div>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
        <h2 className="text-2xl font-black mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {(() => {
            // Combine all recent items
            const recentItems = [];

            // Add politicians
            politicians.slice(0, 2).forEach(p => {
              recentItems.push({
                action: p.status === 'published' ? 'Published' : 'Created',
                item: p.full_name || p.name,
                type: 'Politician',
                color: p.status === 'published' ? 'green' : 'purple'
              });
            });

            // Add modules
            learningModules.slice(0, 2).forEach(m => {
              recentItems.push({
                action: m.status === 'published' ? 'Published' : 'Created',
                item: m.title,
                type: 'Module',
                color: m.status === 'published' ? 'green' : 'blue'
              });
            });

            // Add blog posts
            blogPosts.slice(0, 2).forEach(b => {
              recentItems.push({
                action: b.status === 'published' ? 'Published' : 'Draft',
                item: b.title,
                type: 'Blog Post',
                color: b.status === 'published' ? 'green' : 'orange'
              });
            });

            return recentItems.slice(0, 5).map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.color === 'green' ? 'bg-green-500' :
                  activity.color === 'blue' ? 'bg-blue-500' :
                  activity.color === 'orange' ? 'bg-orange-500' :
                  'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <span className="font-bold">{activity.action}</span>
                  <span className="text-gray-600"> {activity.item}</span>
                  <span className="text-xs text-gray-400 ml-2">({activity.type})</span>
                </div>
              </div>
            ));
          })()}
          {politicians.length === 0 && blogPosts.length === 0 && learningModules.length === 0 && (
            <div className="text-center text-gray-500 py-4">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  );

  // Politicians Management
  const PoliticiansView = () => {
    console.log('🔍 PoliticiansView rendering, politicians:', politicians);
    return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-black">Manage Politicians</h1>
        <button
          onClick={() => openModal('politician')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Politician
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-100 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search politicians..."
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
          <select className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none font-semibold">
            <option>All Parties</option>
            <option>Democrat</option>
            <option>Republican</option>
            <option>Independent</option>
          </select>
          <select className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none font-semibold">
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Review</option>
          </select>
        </div>
      </div>

      {/* Politicians Table */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="text-left p-4 font-black text-gray-700">Politician</th>
              <th className="text-left p-4 font-black text-gray-700">Party</th>
              <th className="text-left p-4 font-black text-gray-700">Chamber</th>
              <th className="text-left p-4 font-black text-gray-700">Location</th>
              <th className="text-left p-4 font-black text-gray-700">Status</th>
              <th className="text-left p-4 font-black text-gray-700">Last Updated</th>
              <th className="text-left p-4 font-black text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {politicians.map((pol) => (
              <tr key={pol.id} className="border-b border-gray-100 hover:bg-purple-50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg"></div>
                    <div>
                      <div className="font-bold text-gray-800">{pol.full_name}</div>
                      <div className="text-xs text-gray-500">{pol.nickname}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    pol.party === 'Democrat' ? 'bg-blue-100 text-blue-700' :
                    pol.party === 'Republican' ? 'bg-red-100 text-red-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {pol.party}
                  </span>
                </td>
                <td className="p-4 text-sm font-semibold text-gray-700">{pol.chamber}</td>
                <td className="p-4 text-sm text-gray-600">
                  {pol.state} {pol.district !== 'N/A' && `- ${pol.district}`}
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    {pol.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {pol.updated_at ? new Date(pol.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'N/A'}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('politician', pol)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                      title="Edit politician"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleTogglePublish(pol.id, pol.status, pol.full_name)}
                      className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition"
                      title={pol.status === 'active' ? 'Unpublish' : 'Publish'}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletePolitician(pol.id, pol.full_name)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      title="Delete politician"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    );
  };

  // Learning Modules Management
  const ModulesView = () => {
    const [viewMode, setViewMode] = useState('lessons'); // 'modules' or 'lessons'

    const handleTogglePublish = async (lessonId, currentStatus) => {
      try {
        const newStatus = currentStatus === 'published' ? 'draft' : 'published';
        const response = await fetch(`http://localhost:5000/api/polihub/lessons/${lessonId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        const data = await response.json();
        if (data.success) {
          setLessons(lessons.map(l => l.id === lessonId ? {...l, status: newStatus} : l));
          alert(`✅ Lesson ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
        }
      } catch (error) {
        console.error('Error toggling lesson status:', error);
        alert('❌ Error updating lesson status');
      }
    };

    const handleDeleteLesson = async (lessonId) => {
      if (!confirm('Are you sure you want to delete this lesson?')) return;

      try {
        const response = await fetch(`http://localhost:5000/api/polihub/lessons/${lessonId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          setLessons(lessons.filter(l => l.id !== lessonId));
          alert('✅ Lesson deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting lesson:', error);
        alert('❌ Error deleting lesson');
      }
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-black">Manage Learning Content</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('lessons')}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                viewMode === 'lessons'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Lessons
            </button>
            <button
              onClick={() => setViewMode('modules')}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                viewMode === 'modules'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Modules
            </button>
            <button
              onClick={() => openModal('module')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2"
            >
              <Plus size={20} />
              Add New
            </button>
          </div>
        </div>

        {viewMode === 'lessons' ? (
          /* Lessons Table */
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                <tr>
                  <th className="p-4 text-left font-black text-gray-700">Lesson Title</th>
                  <th className="p-4 text-left font-black text-gray-700">Module</th>
                  <th className="p-4 text-left font-black text-gray-700">Type</th>
                  <th className="p-4 text-left font-black text-gray-700">Status</th>
                  <th className="p-4 text-left font-black text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="border-t border-gray-100 hover:bg-purple-50/30 transition">
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{lesson.title}</div>
                      <div className="text-xs text-gray-500">Lesson {lesson.lesson_number || lesson.id}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {learningModules.find(m => m.id === lesson.module_id)?.title || 'No Module'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        lesson.type === 'video' ? 'bg-blue-100 text-blue-700' :
                        lesson.type === 'reading' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {lesson.type || 'lesson'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        lesson.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {lesson.status || 'draft'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('lesson', lesson)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(lesson.id, lesson.status)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            lesson.status === 'published'
                              ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                          title={lesson.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {lesson.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lessons.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No lessons found. Click "Add New" to create one.
              </div>
            )}
          </div>
        ) : (
          /* Modules Grid */
          <div>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-green-100">
                <div className="text-2xl font-black text-gray-800">
                  {learningModules.filter(m => m.status === 'published').length}
                </div>
                <div className="text-sm text-gray-600">Published</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-orange-100">
                <div className="text-2xl font-black text-gray-800">
                  {learningModules.filter(m => m.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-600">Draft</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-blue-100">
                <div className="text-2xl font-black text-gray-800">
                  {lessons.length}
                </div>
                <div className="text-sm text-gray-600">Total Lessons</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-purple-100">
                <div className="text-2xl font-black text-gray-800">{learningModules.length}</div>
                <div className="text-sm text-gray-600">Total Modules</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {learningModules.map((module) => (
                <div key={module.id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-purple-200 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-xs font-bold text-purple-600 mb-1">{module.category}</div>
                      <h3 className="text-xl font-black text-gray-800 mb-2">{module.title}</h3>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          module.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                          module.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {module.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          module.status === 'published' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {module.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal('module', module)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500">Lessons</div>
                      <div className="text-lg font-black text-blue-600">
                        {lessons.filter(l => l.module_id === module.id).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">XP Reward</div>
                      <div className="text-lg font-black text-purple-600">{module.xpReward || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className="text-sm font-bold text-gray-700">{module.status}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Blog Posts Management
  const BlogView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-black">Manage Blog Posts</h1>
        <button
          onClick={() => openModal('blog')}
          className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Post
        </button>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="text-left p-4 font-black text-gray-700">Title</th>
              <th className="text-left p-4 font-black text-gray-700">Category</th>
              <th className="text-left p-4 font-black text-gray-700">Author</th>
              <th className="text-left p-4 font-black text-gray-700">Status</th>
              <th className="text-left p-4 font-black text-gray-700">Engagement</th>
              <th className="text-left p-4 font-black text-gray-700">Date</th>
              <th className="text-left p-4 font-black text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogPosts.map((post) => (
              <tr key={post.id} className="border-b border-gray-100 hover:bg-pink-50 transition">
                <td className="p-4">
                  <div className="font-bold text-gray-800">{post.title}</div>
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                    {post.category}
                  </span>
                </td>
                <td className="p-4 text-sm font-semibold text-gray-700">{post.author}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    post.status === 'published' ? 'bg-green-100 text-green-700' :
                    post.status === 'review' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-3 text-xs text-gray-600">
                    <span>👁️ {(post.views_count || 0).toLocaleString()}</span>
                    <span>❤️ {post.likes || 0}</span>
                    <span>💬 {post.comments_count || 0}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">{post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('blog', post)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Trending Topics View
  const TrendingView = () => {
    const [newTopic, setNewTopic] = useState({ emoji: '', text: '', display_order: 0, is_active: 1 });

    const handleSaveTrending = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/polihub/trending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTopic)
        });
        const data = await response.json();
        if (data.success) {
          alert('✅ Trending topic added successfully!');
          setNewTopic({ emoji: '', text: '', display_order: 0, is_active: 1 });
          window.location.reload();
        }
      } catch (error) {
        console.error('Error adding trending topic:', error);
        alert('❌ Error: ' + error.message);
      }
    };

    const handleUpdateTrending = async () => {
      if (!editingTopicData) return;

      try {
        const response = await fetch(`http://localhost:5000/api/polihub/trending/${editingTopicData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingTopicData)
        });
        const data = await response.json();
        if (data.success) {
          alert('✅ Trending topic updated!');
          // Update local state
          setTrendingTopics(trendingTopics.map(t =>
            t.id === editingTopicData.id ? editingTopicData : t
          ));
          setEditingTopic(null);
          setEditingTopicData(null);
        }
      } catch (error) {
        console.error('Error updating trending topic:', error);
        alert('❌ Error: ' + error.message);
      }
    };

    const handleDeleteTrending = async (id) => {
      if (!confirm('Are you sure you want to delete this trending topic?')) return;

      try {
        const response = await fetch(`http://localhost:5000/api/polihub/trending/${id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          alert('✅ Trending topic deleted!');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error deleting trending topic:', error);
        alert('❌ Error: ' + error.message);
      }
    };

    return (
      <div>
        <h1 className="text-4xl font-black mb-6">Manage Trending Topics</h1>

        {/* Add New Trending Topic */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 mb-6">
          <h2 className="text-xl font-bold mb-4">Add New Trending Topic</h2>
          <div className="grid grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Emoji (e.g., 🔥)"
              value={newTopic.emoji}
              onChange={(e) => setNewTopic({...newTopic, emoji: e.target.value})}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg font-bold"
              maxLength="10"
            />
            <input
              type="text"
              placeholder="Text (e.g., Infrastructure Updates)"
              value={newTopic.text}
              onChange={(e) => setNewTopic({...newTopic, text: e.target.value})}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg flex-1 col-span-2"
            />
            <button
              onClick={handleSaveTrending}
              disabled={!newTopic.emoji || !newTopic.text}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} className="inline mr-2" />
              Add Topic
            </button>
          </div>
        </div>

        {/* Trending Topics Table */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left p-4 font-black text-gray-700">Emoji</th>
                <th className="text-left p-4 font-black text-gray-700">Text</th>
                <th className="text-left p-4 font-black text-gray-700">Order</th>
                <th className="text-left p-4 font-black text-gray-700">Status</th>
                <th className="text-left p-4 font-black text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trendingTopics.map((topic) => (
                <tr key={topic.id} className="border-b border-gray-100 hover:bg-purple-50 transition">
                  <td className="p-4">
                    {editingTopic === topic.id ? (
                      <input
                        type="text"
                        value={editingTopicData?.emoji || ''}
                        onChange={(e) => setEditingTopicData({...editingTopicData, emoji: e.target.value})}
                        className="px-3 py-1 border-2 border-purple-300 rounded-lg w-20 text-2xl text-center"
                        maxLength="10"
                      />
                    ) : (
                      <div className="text-2xl">{topic.emoji}</div>
                    )}
                  </td>
                  <td className="p-4">
                    {editingTopic === topic.id ? (
                      <input
                        type="text"
                        value={editingTopicData?.text || ''}
                        onChange={(e) => setEditingTopicData({...editingTopicData, text: e.target.value})}
                        className="px-3 py-1 border-2 border-purple-300 rounded-lg w-full"
                        autoFocus
                      />
                    ) : (
                      <div className="font-bold text-gray-800">{topic.text}</div>
                    )}
                  </td>
                  <td className="p-4 text-sm font-semibold text-gray-700">{topic.display_order}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      topic.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {topic.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {editingTopic === topic.id ? (
                        <>
                          <button
                            onClick={handleUpdateTrending}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-bold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingTopic(null);
                              setEditingTopicData(null);
                            }}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm font-bold"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingTopic(topic.id);
                              setEditingTopicData({...topic});
                            }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTrending(topic.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Bills Management View
  const BillsView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-black">Manage Bills & Legislation</h1>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition flex items-center gap-2">
          <Plus size={20} />
          Add New Bill
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
            <tr>
              <th className="p-4 text-left font-black text-gray-700">Bill Number</th>
              <th className="p-4 text-left font-black text-gray-700">Title</th>
              <th className="p-4 text-left font-black text-gray-700">Status</th>
              <th className="p-4 text-left font-black text-gray-700">Category</th>
              <th className="p-4 text-left font-black text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id} className="border-t border-gray-100 hover:bg-purple-50/30 transition">
                <td className="p-4 font-mono text-sm font-bold text-blue-600">{bill.bill_number || `BILL-${bill.id}`}</td>
                <td className="p-4 font-semibold text-gray-800">{bill.title || bill.short_title}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    bill.status?.toLowerCase() === 'passed' ? 'bg-green-100 text-green-700' :
                    bill.status?.toLowerCase() === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {bill.status || 'Pending'}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">{bill.category || 'General'}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bills.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No bills found. Click "Add New Bill" to create one.
          </div>
        )}
      </div>
    </div>
  );

  // Jobs/Careers Management View
  const JobsView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-black">Manage Jobs & Careers</h1>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition flex items-center gap-2">
          <Plus size={20} />
          Post New Job
        </button>
      </div>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-purple-200 transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-black text-gray-900 mb-2">{job.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} />
                    {job.department}
                  </span>
                  <span>{job.location}</span>
                  <span>{job.type}</span>
                  <span className="font-bold text-purple-600">{job.salary}</span>
                </div>
                <p className="text-gray-600 text-sm">{job.description}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                  <Edit2 size={16} />
                </button>
                <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500">
            No job postings yet. Click "Post New Job" to create one.
          </div>
        )}
      </div>
    </div>
  );

  // Contact Form Submissions View
  const ContactsView = () => (
    <div>
      <h1 className="text-4xl font-black mb-6">Contact Form Submissions</h1>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
            <tr>
              <th className="p-4 text-left font-black text-gray-700">Date</th>
              <th className="p-4 text-left font-black text-gray-700">Name</th>
              <th className="p-4 text-left font-black text-gray-700">Email</th>
              <th className="p-4 text-left font-black text-gray-700">Subject</th>
              <th className="p-4 text-left font-black text-gray-700">Status</th>
              <th className="p-4 text-left font-black text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-t border-gray-100 hover:bg-purple-50/30 transition">
                <td className="p-4 text-sm text-gray-600">
                  {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="p-4 font-semibold text-gray-800">{contact.name}</td>
                <td className="p-4 text-sm text-gray-600">{contact.email}</td>
                <td className="p-4 text-sm text-gray-700">{contact.subject || 'General Inquiry'}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    contact.status === 'responded' ? 'bg-green-100 text-green-700' :
                    contact.status === 'read' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {contact.status || 'New'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition" title="View">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {contacts.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No contact submissions yet.
          </div>
        )}
      </div>
    </div>
  );

  // Blog Authors Management View
  const AuthorsView = () => {
    const [featuredAuthorId, setFeaturedAuthorId] = useState(null);

    // Fetch current featured author
    useEffect(() => {
      const fetchFeaturedAuthor = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/polihub/blog/featured-author');
          const data = await response.json();
          if (data.success && data.data) {
            setFeaturedAuthorId(data.data.id);
          }
        } catch (error) {
          console.error('Error fetching featured author:', error);
        }
      };

      fetchFeaturedAuthor();
    }, []);

    const handleSetFeatured = async (author) => {
      try {
        const response = await fetch('http://localhost:5000/api/polihub/blog/featured-author', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            author_id: author.id,
            name: author.name,
            title: author.title || 'Author',
            bio: author.bio || 'Experienced writer covering political topics and civic engagement.'
          })
        });
        const data = await response.json();
        if (data.success) {
          setFeaturedAuthorId(author.id);
          alert('✅ Featured author updated successfully!');
        }
      } catch (error) {
        console.error('Error setting featured author:', error);
        alert('❌ Error updating featured author');
      }
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-black">Manage Blog Authors</h1>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition flex items-center gap-2">
            <Plus size={20} />
            Add New Author
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((author) => (
            <div key={author.id} className={`bg-white rounded-xl p-6 shadow-lg border-2 transition ${
              author.id === featuredAuthorId
                ? 'border-purple-500 ring-2 ring-purple-200'
                : 'border-gray-100 hover:border-purple-200'
            }`}>
              {author.id === featuredAuthorId && (
                <div className="mb-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold inline-flex items-center gap-1">
                  <Sparkles size={12} />
                  Featured Author
                </div>
              )}
              <div className="flex items-start gap-4 mb-4">
                {author.profile_image ? (
                  <img src={author.profile_image} alt={author.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold">
                    {author.name?.charAt(0) || 'A'}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-black text-gray-900">{author.name}</h3>
                  <p className="text-sm text-gray-600">{author.title || 'Author'}</p>
                  <p className="text-xs text-gray-500 mt-1">{author.email}</p>
                </div>
              </div>
              {author.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{author.bio}</p>
              )}
              <div className="flex gap-2">
                {author.id !== featuredAuthorId ? (
                  <button
                    onClick={() => handleSetFeatured(author)}
                    className="flex-1 p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition font-bold text-sm"
                  >
                    Set Featured
                  </button>
                ) : (
                  <div className="flex-1 p-2 bg-purple-50 text-purple-400 rounded-lg font-bold text-sm text-center cursor-not-allowed">
                    Currently Featured
                  </div>
                )}
                <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                  <Edit2 size={16} />
                </button>
                <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {authors.length === 0 && (
            <div className="col-span-full bg-white rounded-xl p-12 text-center text-gray-500">
              No authors found. Click "Add New Author" to create one.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/90 backdrop-blur-md min-h-screen p-6 shadow-xl border-r-2 border-purple-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏛️</span>
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500">PoliHub CMS</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'politicians', icon: Users, label: 'Politicians' },
              { id: 'modules', icon: BookOpen, label: 'Learning Modules' },
              { id: 'blog', icon: FileText, label: 'Blog Posts' },
              { id: 'bills', icon: Scale, label: 'Bills & Legislation' },
              { id: 'jobs', icon: Briefcase, label: 'Careers/Jobs' },
              { id: 'contacts', icon: Mail, label: 'Contact Forms' },
              { id: 'authors', icon: Users, label: 'Blog Authors' },
              { id: 'trending', icon: Sparkles, label: 'Trending Topics' },
              { id: 'about', icon: FileText, label: 'About Page' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-purple-50'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
            <div className="text-sm font-bold mb-1">👤 Admin User</div>
            <div className="text-xs opacity-90">admin@polihub.com</div>
            <button 
              onClick={onClose}
              className="w-full mt-3 bg-white/20 backdrop-blur-sm py-2 rounded-lg text-xs font-bold hover:bg-white/30 transition flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeSection === 'dashboard' && <DashboardView />}
          {activeSection === 'politicians' && <PoliticiansView />}
          {activeSection === 'modules' && <ModulesView />}
          {activeSection === 'blog' && <BlogView />}
          {activeSection === 'bills' && <BillsView />}
          {activeSection === 'jobs' && <JobsView />}
          {activeSection === 'contacts' && <ContactsView />}
          {activeSection === 'authors' && <AuthorsView />}
          {activeSection === 'trending' && <TrendingView />}
          {activeSection === 'about' && <AboutPageAdmin onClose={() => setActiveSection('dashboard')} />}
          {activeSection === 'settings' && (
            <div>
              <h1 className="text-4xl font-black mb-6">Settings</h1>
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
                <p className="text-gray-600">Settings panel coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AdminModal
        showModal={showModal}
        modalType={modalType}
        selectedItem={selectedItem}
        closeModal={closeModal}
        handleSavePolitician={handleSavePolitician}
        handleSaveModule={handleSaveModule}
        handleSaveBlogPost={handleSaveBlogPost}
      />
    </div>
  );
}