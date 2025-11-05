import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

export default function PoliticianForm({ selectedItem, onClose, onSave }) {
  const [formData, setFormData] = useState(selectedItem || {
    name: '',
    nickname: '',
    party: 'Democrat',
    chamber: 'House',
    state: '',
    district: '',
    yearsInOffice: 0,
    bio: '',
    keyIssues: '',
    committees: '',
    twitter: '',
    instagram: '',
    website: '',
    email: '',
    phone: ''
  });

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black">{selectedItem ? 'Edit' : 'Add New'} Politician</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-100">
        <h3 className="text-xl font-black mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Alexandria Ocasio-Cortez"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nickname</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="AOC"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Party *</label>
            <select
              value={formData.party}
              onChange={(e) => setFormData({...formData, party: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option>Democrat</option>
              <option>Republican</option>
              <option>Independent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Chamber *</label>
            <select
              value={formData.chamber}
              onChange={(e) => setFormData({...formData, chamber: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option>House</option>
              <option>Senate</option>
              <option>Governor</option>
              <option>Cabinet</option>
              <option>Executive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="New York"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => setFormData({...formData, district: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="14"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Years in Office</label>
            <input
              type="number"
              value={formData.yearsInOffice}
              onChange={(e) => setFormData({...formData, yearsInOffice: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="https://..."
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Biography *</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Representative biography..."
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Key Issues (comma-separated)</label>
            <input
              type="text"
              value={formData.keyIssues}
              onChange={(e) => setFormData({...formData, keyIssues: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Climate Change, Healthcare, Education"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Committees (comma-separated)</label>
            <input
              type="text"
              value={formData.committees}
              onChange={(e) => setFormData({...formData, committees: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Financial Services, Oversight and Reform"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-100">
        <h3 className="text-xl font-black mb-4">Social Media & Contact</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Twitter Handle</label>
            <input
              type="text"
              value={formData.twitter}
              onChange={(e) => setFormData({...formData, twitter: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="@username"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Instagram Handle</label>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) => setFormData({...formData, instagram: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="@username"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="contact@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Save Politician
        </button>
        <button
          onClick={onClose}
          className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}