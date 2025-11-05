import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, Image as ImageIcon, Eye, Edit2 } from 'lucide-react';

export default function AboutPageAdmin({ onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    hero: {
      title: "We're Building Democracy's Future",
      subtitle: "Empowering Gen Z to understand, engage, and shape the political landscape.",
      imageUrl: ""
    },
    mission: {
      text: "Making political education accessible, engaging, and empowering for young people. We're breaking down barriers and building bridges between Gen Z and democracy."
    },
    vision: {
      text: "A future where every young person feels confident participating in democracy, equipped with knowledge and tools to shape their communities."
    },
    story: {
      paragraphs: [
        "PoliHub was born from a simple observation: young people wanted to engage with politics, but traditional civics education wasn't speaking their language.",
        "In 2024, while organizing voter registration drives, our founder kept hearing \"I want to vote, but I don't understand how any of this works.\" That's when everything clicked.",
        "We built the platform we wished existed—one that makes democracy feel accessible, exciting, and actually relevant to our lives."
      ],
      stats: [
        { label: "Founded", value: "2024" },
        { label: "Active Users", value: "50K+" },
        { label: "Potential", value: "∞" }
      ],
      imageUrl: ""
    },
    values: [
      { icon: "🎓", title: "Education First", desc: "Clear, accurate, unbiased information", color: "from-blue-400 to-blue-600" },
      { icon: "🌈", title: "Radically Inclusive", desc: "Every voice and perspective matters", color: "from-purple-400 to-purple-600" },
      { icon: "⚡", title: "Boldly Engaging", desc: "Making politics exciting, not boring", color: "from-pink-400 to-pink-600" },
      { icon: "🔍", title: "Deeply Transparent", desc: "Sources, facts, and critical thinking", color: "from-green-400 to-green-600" },
      { icon: "💪", title: "Truly Empowering", desc: "Tools to create real change", color: "from-orange-400 to-orange-600" },
      { icon: "🤝", title: "Community Driven", desc: "Building connections that matter", color: "from-red-400 to-red-600" }
    ],
    team: [
      { name: "Alex Chen", role: "Founder & CEO", emoji: "💼", bio: "Former political organizer turned civic tech entrepreneur", imageUrl: "" },
      { name: "Jordan Smith", role: "Head of Content", emoji: "✍️", bio: "Making complex policy accessible to everyone", imageUrl: "" },
      { name: "Taylor Kim", role: "Lead Developer", emoji: "💻", bio: "Building beautiful, powerful civic tools", imageUrl: "" },
      { name: "Morgan Davis", role: "Community Manager", emoji: "🤝", bio: "Connecting young voices with political action", imageUrl: "" },
      { name: "Casey Rivera", role: "Education Director", emoji: "🎓", bio: "Designing curriculum that actually works", imageUrl: "" },
      { name: "Sam Patel", role: "Head of Design", emoji: "🎨", bio: "Crafting beautiful, intuitive experiences", imageUrl: "" }
    ],
    contact: {
      email: "hello@polihub.com",
      socials: [
        { name: 'Twitter', icon: '🐦', url: 'https://twitter.com/polihub' },
        { name: 'Instagram', icon: '📸', url: 'https://instagram.com/polihub' },
        { name: 'TikTok', icon: '🎵', url: 'https://tiktok.com/@polihub' },
        { name: 'YouTube', icon: '📺', url: 'https://youtube.com/@polihub' }
      ]
    },
    bannerImageUrl: ""
  });

  useEffect(() => {
    loadAboutData();
  }, []);

  const loadAboutData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/polihub/about-page');
      const data = await response.json();
      
      if (data.success && data.data) {
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error loading about page data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/polihub/about-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ About page saved successfully!');
      } else {
        alert('❌ Error: ' + (data.error || 'Failed to save'));
      }
    } catch (error) {
      console.error('Error saving about page:', error);
      alert('❌ Error saving: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const addStoryParagraph = () => {
    setFormData({
      ...formData,
      story: {
        ...formData.story,
        paragraphs: [...formData.story.paragraphs, '']
      }
    });
  };

  const removeStoryParagraph = (index) => {
    const newParagraphs = formData.story.paragraphs.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      story: { ...formData.story, paragraphs: newParagraphs }
    });
  };

  const updateStoryParagraph = (index, value) => {
    const newParagraphs = [...formData.story.paragraphs];
    newParagraphs[index] = value;
    setFormData({
      ...formData,
      story: { ...formData.story, paragraphs: newParagraphs }
    });
  };

  const addStat = () => {
    setFormData({
      ...formData,
      story: {
        ...formData.story,
        stats: [...formData.story.stats, { label: '', value: '' }]
      }
    });
  };

  const addValue = () => {
    setFormData({
      ...formData,
      values: [...formData.values, { icon: '⭐', title: '', desc: '', color: 'from-gray-400 to-gray-600' }]
    });
  };

  const addTeamMember = () => {
    setFormData({
      ...formData,
      team: [...formData.team, { name: '', role: '', emoji: '👤', bio: '', imageUrl: '' }]
    });
  };

  const addSocial = () => {
    setFormData({
      ...formData,
      contact: {
        ...formData.contact,
        socials: [...formData.contact.socials, { name: '', icon: '🔗', url: '' }]
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg font-bold text-gray-600">Loading About Page Data...</div>
        </div>
      </div>
    );
  }

  if (previewMode) {
    return <AboutPagePreview formData={formData} onClose={() => setPreviewMode(false)} />;
  }

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sticky top-0 bg-white pb-3 md:pb-4 z-10 border-b-2 border-purple-200 gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800">✨ About Page Manager</h2>
          <p className="text-xs sm:text-sm text-gray-600">Manage all content on your About page</p>
        </div>
        <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
          <button
            onClick={() => setPreviewMode(true)}
            className="flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-2 md:py-3 bg-blue-500 text-white rounded-lg md:rounded-xl font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Eye size={16} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg md:rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base"
          >
            <Save size={16} className="md:w-5 md:h-5" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition flex-shrink-0"
          >
            <X size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-[75vh] overflow-y-auto pr-2 sm:pr-4 space-y-4 md:space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <h3 className="text-xl font-black mb-4 text-purple-700 flex items-center gap-2">
            🎯 Hero Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Main Title</label>
              <input
                type="text"
                value={formData.hero.title}
                onChange={(e) => setFormData({...formData, hero: {...formData.hero, title: e.target.value}})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Subtitle</label>
              <textarea
                value={formData.hero.subtitle}
                onChange={(e) => setFormData({...formData, hero: {...formData.hero, subtitle: e.target.value}})}
                rows={2}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Hero Image URL</label>
              <input
                type="text"
                value={formData.hero.imageUrl}
                onChange={(e) => setFormData({...formData, hero: {...formData.hero, imageUrl: e.target.value}})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="https://images.unsplash.com/..."
              />
              {formData.hero.imageUrl && (
                <img src={formData.hero.imageUrl} alt="Hero" className="mt-3 w-full max-h-48 object-cover rounded-lg" />
              )}
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-black mb-4 text-blue-700 flex items-center gap-2">
              🎯 Mission
            </h3>
            <textarea
              value={formData.mission.text}
              onChange={(e) => setFormData({...formData, mission: {text: e.target.value}})}
              rows={4}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border-2 border-pink-200">
            <h3 className="text-xl font-black mb-4 text-pink-700 flex items-center gap-2">
              ✨ Vision
            </h3>
            <textarea
              value={formData.vision.text}
              onChange={(e) => setFormData({...formData, vision: {text: e.target.value}})}
              rows={4}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <h3 className="text-xl font-black mb-4 text-green-700 flex items-center gap-2">
            📖 Our Story
          </h3>
          
          <div className="space-y-4 mb-6">
            <label className="block text-sm font-bold text-gray-700">Story Paragraphs</label>
            {formData.story.paragraphs.map((para, index) => (
              <div key={index} className="flex gap-2">
                <textarea
                  value={para}
                  onChange={(e) => updateStoryParagraph(index, e.target.value)}
                  rows={2}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder={`Paragraph ${index + 1}...`}
                />
                {formData.story.paragraphs.length > 1 && (
                  <button
                    onClick={() => removeStoryParagraph(index)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition h-fit"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addStoryParagraph}
              className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
            >
              <Plus size={14} />
              Add Paragraph
            </button>
          </div>

          <div className="space-y-4 mb-4">
            <label className="block text-sm font-bold text-gray-700">Stats</label>
            {formData.story.stats.map((stat, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => {
                    const newStats = [...formData.story.stats];
                    newStats[index].label = e.target.value;
                    setFormData({...formData, story: {...formData.story, stats: newStats}});
                  }}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="Label (e.g., Founded)"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...formData.story.stats];
                      newStats[index].value = e.target.value;
                      setFormData({...formData, story: {...formData.story, stats: newStats}});
                    }}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="Value (e.g., 2024)"
                  />
                  <button
                    onClick={() => {
                      const newStats = formData.story.stats.filter((_, i) => i !== index);
                      setFormData({...formData, story: {...formData.story, stats: newStats}});
                    }}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addStat}
              className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
            >
              <Plus size={14} />
              Add Stat
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Story Image URL</label>
            <input
              type="text"
              value={formData.story.imageUrl}
              onChange={(e) => setFormData({...formData, story: {...formData.story, imageUrl: e.target.value}})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        </div>

        {/* Values */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-orange-700 flex items-center gap-2">
              💪 Our Values
            </h3>
            <button
              onClick={addValue}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Add Value
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border-2 border-orange-200">
                <div className="flex justify-between items-start mb-3">
                  <input
                    type="text"
                    value={value.icon}
                    onChange={(e) => {
                      const newValues = [...formData.values];
                      newValues[index].icon = e.target.value;
                      setFormData({...formData, values: newValues});
                    }}
                    className="w-16 text-3xl text-center"
                    maxLength="10"
                  />
                  <button
                    onClick={() => {
                      const newValues = formData.values.filter((_, i) => i !== index);
                      setFormData({...formData, values: newValues});
                    }}
                    className="p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={value.title}
                  onChange={(e) => {
                    const newValues = [...formData.values];
                    newValues[index].title = e.target.value;
                    setFormData({...formData, values: newValues});
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none font-bold mb-2"
                  placeholder="Title"
                />
                <textarea
                  value={value.desc}
                  onChange={(e) => {
                    const newValues = [...formData.values];
                    newValues[index].desc = e.target.value;
                    setFormData({...formData, values: newValues});
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                  placeholder="Description"
                />
                <select
                  value={value.color}
                  onChange={(e) => {
                    const newValues = [...formData.values];
                    newValues[index].color = e.target.value;
                    setFormData({...formData, values: newValues});
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm mt-2"
                >
                  <option value="from-blue-400 to-blue-600">Blue</option>
                  <option value="from-purple-400 to-purple-600">Purple</option>
                  <option value="from-pink-400 to-pink-600">Pink</option>
                  <option value="from-green-400 to-green-600">Green</option>
                  <option value="from-orange-400 to-orange-600">Orange</option>
                  <option value="from-red-400 to-red-600">Red</option>
                  <option value="from-cyan-400 to-cyan-600">Cyan</option>
                  <option value="from-yellow-400 to-yellow-600">Yellow</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-6 border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-indigo-700 flex items-center gap-2">
              👥 Team Members
            </h3>
            <button
              onClick={addTeamMember}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-600 transition text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Add Member
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border-2 border-indigo-200">
                <div className="flex justify-between items-start mb-3">
                  <input
                    type="text"
                    value={member.emoji}
                    onChange={(e) => {
                      const newTeam = [...formData.team];
                      newTeam[index].emoji = e.target.value;
                      setFormData({...formData, team: newTeam});
                    }}
                    className="w-16 text-3xl text-center"
                    maxLength="10"
                  />
                  <button
                    onClick={() => {
                      const newTeam = formData.team.filter((_, i) => i !== index);
                      setFormData({...formData, team: newTeam});
                    }}
                    className="p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => {
                    const newTeam = [...formData.team];
                    newTeam[index].name = e.target.value;
                    setFormData({...formData, team: newTeam});
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none font-bold mb-2"
                  placeholder="Full Name"
                />
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => {
                    const newTeam = [...formData.team];
                    newTeam[index].role = e.target.value;
                    setFormData({...formData, team: newTeam});
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm mb-2"
                  placeholder="Role/Title"
                />
                <textarea
                  value={member.bio}
                  onChange={(e) => {
                    const newTeam = [...formData.team];
                    newTeam[index].bio = e.target.value;
                    setFormData({...formData, team: newTeam});
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm mb-2"
                  placeholder="Short bio"
                />
                <input
                  type="text"
                  value={member.imageUrl}
                  onChange={(e) => {
                    const newTeam = [...formData.team];
                    newTeam[index].imageUrl = e.target.value;
                    setFormData({...formData, team: newTeam});
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm mb-2"
                  placeholder="Image URL"
                />
                {member.imageUrl && (
                  <img src={member.imageUrl} alt={member.name} className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border-2 border-rose-200">
          <h3 className="text-xl font-black mb-4 text-rose-700 flex items-center gap-2">
            📧 Contact Information
          </h3>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.contact.email}
              onChange={(e) => setFormData({...formData, contact: {...formData.contact, email: e.target.value}})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-700">Social Media Links</label>
              <button
                onClick={addSocial}
                className="px-3 py-1 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 transition text-sm flex items-center gap-1"
              >
                <Plus size={14} />
                Add Social
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formData.contact.socials.map((social, index) => (
                <div key={index} className="flex gap-2 bg-white p-3 rounded-lg border-2 border-rose-200">
                  <input
                    type="text"
                    value={social.icon}
                    onChange={(e) => {
                      const newSocials = [...formData.contact.socials];
                      newSocials[index].icon = e.target.value;
                      setFormData({...formData, contact: {...formData.contact, socials: newSocials}});
                    }}
                    className="w-12 text-center text-xl"
                    maxLength="10"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={social.name}
                      onChange={(e) => {
                        const newSocials = [...formData.contact.socials];
                        newSocials[index].name = e.target.value;
                        setFormData({...formData, contact: {...formData.contact, socials: newSocials}});
                      }}
                      className="w-full px-2 py-1 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none text-sm font-bold"
                      placeholder="Platform name"
                    />
                    <input
                      type="text"
                      value={social.url}
                      onChange={(e) => {
                        const newSocials = [...formData.contact.socials];
                        newSocials[index].url = e.target.value;
                        setFormData({...formData, contact: {...formData.contact, socials: newSocials}});
                      }}
                      className="w-full px-2 py-1 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none text-sm"
                      placeholder="URL"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const newSocials = formData.contact.socials.filter((_, i) => i !== index);
                      setFormData({...formData, contact: {...formData.contact, socials: newSocials}});
                    }}
                    className="p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Banner Image */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border-2 border-cyan-200">
          <h3 className="text-xl font-black mb-4 text-cyan-700 flex items-center gap-2">
            🎉 Community Banner Image
          </h3>
          <input
            type="text"
            value={formData.bannerImageUrl}
            onChange={(e) => setFormData({...formData, bannerImageUrl: e.target.value})}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none"
            placeholder="https://images.unsplash.com/..."
          />
          {formData.bannerImageUrl && (
            <img src={formData.bannerImageUrl} alt="Banner" className="mt-3 w-full max-h-32 object-cover rounded-lg" />
          )}
        </div>
      </div>

      {/* Save Button at Bottom */}
      <div className="sticky bottom-0 bg-white pt-4 border-t-2 border-purple-200 flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold hover:shadow-xl transition flex items-center justify-center gap-2 text-lg disabled:opacity-50"
        >
          <Save size={22} />
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
        <button
          onClick={() => setPreviewMode(true)}
          className="px-8 bg-blue-500 text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition flex items-center gap-2"
        >
          <Eye size={20} />
          Preview
        </button>
      </div>
    </div>
  );
}

// Preview Component
function AboutPagePreview({ formData, onClose }) {
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b-2 border-purple-200 p-4 flex justify-between items-center z-10">
        <h2 className="text-2xl font-black">Preview: About Page</h2>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
        >
          Close Preview
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto p-8">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 rounded-3xl overflow-hidden mb-8 shadow-2xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 grid grid-cols-2 gap-8 items-center">
            <div className="p-16 text-white">
              <h1 className="text-7xl font-black mb-6 leading-tight">{formData.hero.title}</h1>
              <p className="text-2xl opacity-90 leading-relaxed">{formData.hero.subtitle}</p>
            </div>
            <div className="p-8 pr-16">
              {formData.hero.imageUrl ? (
                <img src={formData.hero.imageUrl} alt="Hero" className="rounded-2xl w-full h-full object-cover" />
              ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl aspect-[4/3] flex items-center justify-center border-4 border-white/30">
                  <div className="text-center p-8">
                    <div className="text-8xl mb-4">🎯</div>
                    <div className="text-white text-xl font-bold">Hero Image</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-10 text-white shadow-xl">
            <h2 className="text-5xl font-black mb-6">Our Mission</h2>
            <p className="text-xl leading-relaxed opacity-95">{formData.mission.text}</p>
          </div>
          <div className="bg-white rounded-3xl p-10 shadow-xl border-4 border-purple-100">
            <h2 className="text-5xl font-black text-gray-800 mb-6">Our Vision</h2>
            <p className="text-xl leading-relaxed text-gray-700">{formData.vision.text}</p>
          </div>
        </div>

        {/* Story */}
        <div className="bg-white rounded-3xl shadow-xl border-4 border-purple-100 overflow-hidden mb-8">
          <div className="grid grid-cols-5">
            <div className="col-span-3 p-12">
              <h2 className="text-5xl font-black mb-6 text-gray-800">📖 Our Story</h2>
              <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                {formData.story.paragraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
              <div className="flex gap-4 mt-8">
                {formData.story.stats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-4xl font-black text-purple-600">{stat.value}</div>
                    <div className="text-sm text-gray-600 font-bold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-8">
              {formData.story.imageUrl ? (
                <img src={formData.story.imageUrl} alt="Story" className="rounded-xl w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="text-9xl mb-4">🚀</div>
                  <div className="text-lg font-bold text-gray-700">Story Image</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-3xl p-12 mb-8 border-4 border-white shadow-xl">
          <h2 className="text-5xl font-black mb-10 text-center text-gray-800">What Drives Us 💪</h2>
          <div className="grid grid-cols-3 gap-6">
            {formData.values.map((value, idx) => (
              <div key={idx} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} rounded-2xl transform group-hover:scale-105 transition-transform duration-300`}></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-2xl p-8 m-1 text-center hover:bg-white transition-colors">
                  <div className="text-6xl mb-4">{value.icon}</div>
                  <h3 className="font-black text-2xl mb-3 text-gray-800">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-3xl shadow-xl border-4 border-purple-100 p-12 mb-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-4 text-gray-800">Meet The Humans Behind PoliHub</h2>
            <p className="text-xl text-gray-600">Passionate people building the future of civic engagement</p>
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            {formData.team.map((member, idx) => (
              <div key={idx} className="group">
                {member.imageUrl ? (
                  <img src={member.imageUrl} alt={member.name} className="rounded-2xl w-full aspect-square object-cover mb-4" />
                ) : (
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 mb-4 aspect-square flex items-center justify-center border-4 border-purple-200">
                    <div className="text-center">
                      <div className="text-9xl mb-2">{member.emoji}</div>
                      <div className="text-sm font-bold text-gray-600">Add Team Photo</div>
                    </div>
                  </div>
                )}
                <h3 className="font-black text-2xl mb-2 text-gray-800">{member.name}</h3>
                <p className="text-purple-600 font-bold mb-3">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 rounded-3xl p-10 text-white shadow-xl">
            <h3 className="text-4xl font-black mb-6">Join Our Mission</h3>
            <p className="text-lg mb-8 opacity-95 leading-relaxed">
              Help us build the future of civic engagement. We're looking for passionate contributors, volunteers, and partners.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-10 shadow-xl border-4 border-purple-100">
            <h3 className="text-4xl font-black mb-6 text-gray-800">Let's Connect</h3>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-purple-200">
              <a href={`mailto:${formData.contact.email}`} className="flex items-center gap-3 text-gray-800 text-lg font-bold">
                📧 {formData.contact.email}
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {formData.contact.socials.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition"
                >
                  <span>{social.icon}</span>
                  <span>{social.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Banner */}
        {formData.bannerImageUrl ? (
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <img src={formData.bannerImageUrl} alt="Community" className="w-full h-64 object-cover" />
          </div>
        ) : (
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-3xl p-4 shadow-xl">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl aspect-[3/1] flex items-center justify-center border-4 border-white/30">
              <div className="text-center p-8">
                <div className="text-9xl mb-4">🎉</div>
                <div className="text-white text-2xl font-black">Community Banner</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}