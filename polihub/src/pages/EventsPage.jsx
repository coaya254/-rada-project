import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ExternalLink, Filter, Search } from 'lucide-react';

export default function EventsPage() {
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data - replace with API call
  const events = [
    {
      id: 1,
      title: 'Town Hall Meeting - Healthcare Discussion',
      type: 'Town Hall',
      date: '2024-11-15',
      time: '6:00 PM - 8:00 PM',
      location: 'Jackson Heights Library',
      address: '35-51 81st Street, Jackson Heights, NY 11372',
      politician: 'Alexandria Ocasio-Cortez',
      description: 'Join us for a discussion on healthcare reform and Medicare expansion. Bring your questions and concerns.',
      attendees: 150,
      capacity: 200,
      registration_required: true,
      registration_link: 'https://example.com/register/townhall-healthcare',
      virtual_option: true,
      virtual_link: 'https://zoom.us/meeting123'
    },
    {
      id: 2,
      title: 'Climate Action Rally',
      type: 'Rally',
      date: '2024-11-20',
      time: '2:00 PM - 5:00 PM',
      location: 'City Hall Plaza',
      address: 'New York, NY 10007',
      politician: 'Multiple Speakers',
      description: 'Major climate action rally featuring speakers from Congress, environmental organizations, and community leaders.',
      attendees: 5000,
      capacity: 10000,
      registration_required: false,
      virtual_option: false
    },
    {
      id: 3,
      title: 'Presidential Debate Watch Party',
      type: 'Debate',
      date: '2024-11-25',
      time: '9:00 PM - 11:00 PM',
      location: 'Community Center',
      address: '1385 Castle Hill Avenue, Bronx, NY 10462',
      politician: 'Local Democrats',
      description: 'Watch the presidential debate together and discuss key issues affecting our community.',
      attendees: 75,
      capacity: 100,
      registration_required: true,
      registration_link: 'https://example.com/register/debate-watch',
      virtual_option: true,
      virtual_link: 'https://zoom.us/meeting456'
    },
    {
      id: 4,
      title: 'Constituent Services Fair',
      type: 'Community Event',
      date: '2024-12-01',
      time: '10:00 AM - 4:00 PM',
      location: 'Bronx Community Center',
      address: 'Bronx, NY',
      politician: 'District Office Staff',
      description: 'Get help with federal services, immigration questions, veterans benefits, and more. Free legal consultation available.',
      attendees: 0,
      capacity: 500,
      registration_required: false,
      virtual_option: false
    },
    {
      id: 5,
      title: 'Virtual Town Hall - Student Debt Relief',
      type: 'Town Hall',
      date: '2024-12-05',
      time: '7:00 PM - 8:30 PM',
      location: 'Online Only',
      address: 'Virtual Event',
      politician: 'Alexandria Ocasio-Cortez',
      description: 'Online discussion about student debt relief programs and higher education affordability.',
      attendees: 2500,
      capacity: 5000,
      registration_required: true,
      registration_link: 'https://example.com/register/virtual-townhall',
      virtual_option: true,
      virtual_link: 'https://zoom.us/meeting789'
    }
  ];

  const getTypeColor = (type) => {
    switch(type) {
      case 'Town Hall': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Rally': return 'bg-red-100 text-red-700 border-red-200';
      case 'Debate': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Community Event': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'All' || event.type === filterType;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Sort by date ascending (soonest first)
  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Upcoming Events
        </h1>
        <p className="text-xl text-gray-600">
          Town halls, rallies, debates, and community events
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {['All', 'Town Hall', 'Rally', 'Debate', 'Community Event'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition ${
                  filterType === type
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedEvents.map(event => (
          <div 
            key={event.id}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition border-2 border-transparent hover:border-purple-200"
          >
            {/* Event Type Badge */}
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 border-2 ${getTypeColor(event.type)}`}>
              {event.type}
            </span>

            {/* Title */}
            <h3 className="text-xl font-black text-gray-800 mb-2">{event.title}</h3>

            {/* Date & Time */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Calendar size={16} />
              <span className="font-semibold">
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Clock size={16} />
              <span>{event.time}</span>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
              <MapPin size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-gray-800">{event.location}</div>
                <div className="text-xs">{event.address}</div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

            {/* Capacity */}
            {event.capacity && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-semibold">
                    {event.attendees} / {event.capacity} attendees
                  </span>
                  <span className="font-bold text-purple-600">
                    {Math.round((event.attendees / event.capacity) * 100)}% full
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((event.attendees / event.capacity) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {event.registration_required && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                  Registration Required
                </span>
              )}
              {event.virtual_option && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  Virtual Option Available
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {event.registration_required && event.registration_link && (
                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  Register
                  <ExternalLink size={16} />
                </a>
              )}
              {event.virtual_option && event.virtual_link && (
                <a
                  href={event.virtual_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition"
                >
                  Join Virtual
                </a>
              )}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(event.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold hover:bg-purple-200 transition"
              >
                Directions
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedEvents.length === 0 && (
        <div className="text-center py-16">
          <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-2xl font-bold text-gray-600 mb-2">No Events Found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}