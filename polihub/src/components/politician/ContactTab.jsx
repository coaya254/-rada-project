import React from 'react';
import { Mail, Phone, MapPin, Globe, Twitter, Facebook, Instagram, Building, Calendar, Clock, ExternalLink } from 'lucide-react';

export default function ContactTab({ politicianId }) {
  // Sample data - replace with API call
  const contactInfo = {
    offices: [
      {
        id: 1,
        type: 'Washington Office',
        address: '229 Cannon House Office Building',
        city: 'Washington',
        state: 'DC',
        zip: '20515',
        phone: '(202) 225-3965',
        hours: 'Monday-Friday: 9:00 AM - 5:00 PM'
      },
      {
        id: 2,
        type: 'District Office',
        address: '74-09 37th Avenue',
        suite: 'Suite 305',
        city: 'Jackson Heights',
        state: 'NY',
        zip: '11372',
        phone: '(718) 662-5970',
        hours: 'Monday-Friday: 9:00 AM - 5:00 PM'
      },
      {
        id: 3,
        type: 'Satellite Office',
        address: '1385 Castle Hill Avenue',
        city: 'Bronx',
        state: 'NY',
        zip: '10462',
        phone: '(718) 860-5970',
        hours: 'By Appointment Only'
      }
    ],
    
    contact: {
      email: 'contact@house.gov',
      website: 'https://ocasio-cortez.house.gov',
      contactForm: 'https://ocasio-cortez.house.gov/contact',
      twitter: '@AOC',
      facebook: 'RepAOC',
      instagram: '@aoc',
      youtube: 'RepAOC'
    },

    staff: [
      {
        name: 'Chief of Staff',
        title: 'Chakrabarti Saikat',
        email: 'chief.staff@mail.house.gov'
      },
      {
        name: 'Legislative Director',
        title: 'Dan Riffle',
        email: 'legislative.director@mail.house.gov'
      },
      {
        name: 'Communications Director',
        title: 'Corbin Trent',
        email: 'press@mail.house.gov'
      }
    ],

    townHalls: [
      {
        date: '2024-11-15',
        time: '6:00 PM - 8:00 PM',
        location: 'Jackson Heights Library',
        address: '35-51 81st Street, Jackson Heights, NY 11372',
        registration_required: true,
        registration_link: 'https://example.com/register'
      },
      {
        date: '2024-12-10',
        time: '7:00 PM - 9:00 PM',
        location: 'Bronx Community Center',
        address: '1385 Castle Hill Avenue, Bronx, NY 10462',
        registration_required: false
      }
    ]
  };

  return (
    <div className="contact-tab space-y-6">
      {/* Contact Methods */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border-2 border-purple-100">
        <h3 className="text-xl font-black text-gray-800 mb-4">Get in Touch</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a 
            href={`mailto:${contactInfo.contact.email}`}
            className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition border-2 border-transparent hover:border-purple-200"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="text-purple-600" size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500">Email</div>
              <div className="text-sm font-semibold text-gray-800">{contactInfo.contact.email}</div>
            </div>
          </a>

          <a 
            href={contactInfo.contact.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition border-2 border-transparent hover:border-purple-200"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-500">Official Website</div>
              <div className="text-sm font-semibold text-gray-800 truncate">Visit Website</div>
            </div>
            <ExternalLink size={16} className="text-gray-400" />
          </a>

          <a 
            href={contactInfo.contact.contactForm}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition border-2 border-transparent hover:border-purple-200 md:col-span-2"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Mail className="text-green-600" size={20} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-500">Contact Form</div>
              <div className="text-sm font-semibold text-gray-800">Submit a message online</div>
            </div>
            <ExternalLink size={16} className="text-gray-400" />
          </a>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border-2 border-gray-100">
        <h3 className="text-xl font-black text-gray-800 mb-4">Social Media</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a 
            href={`https://twitter.com/${contactInfo.contact.twitter.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
          >
            <Twitter className="text-blue-500" size={24} />
            <span className="text-sm font-bold text-gray-800">{contactInfo.contact.twitter}</span>
          </a>

          <a 
            href={`https://facebook.com/${contactInfo.contact.facebook}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
          >
            <Facebook className="text-blue-600" size={24} />
            <span className="text-sm font-bold text-gray-800">{contactInfo.contact.facebook}</span>
          </a>

          <a 
            href={`https://instagram.com/${contactInfo.contact.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition"
          >
            <Instagram className="text-pink-600" size={24} />
            <span className="text-sm font-bold text-gray-800">{contactInfo.contact.instagram}</span>
          </a>

          <a 
            href={`https://youtube.com/${contactInfo.contact.youtube}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition"
          >
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="text-sm font-bold text-gray-800">{contactInfo.contact.youtube}</span>
          </a>
        </div>
      </div>

      {/* Office Locations */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-800">Office Locations</h3>
        {contactInfo.offices.map(office => (
          <div key={office.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border-2 border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building className="text-purple-600" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-base sm:text-lg font-black text-gray-800 mb-3">{office.type}</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="text-gray-700">
                      <div>{office.address}</div>
                      {office.suite && <div>{office.suite}</div>}
                      <div>{office.city}, {office.state} {office.zip}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <a href={`tel:${office.phone}`} className="text-purple-600 font-semibold hover:text-purple-700">
                      {office.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-gray-700">{office.hours}</span>
                  </div>
                </div>

                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${office.address}, ${office.city}, ${office.state} ${office.zip}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold hover:bg-purple-200 transition text-sm"
                >
                  <MapPin size={16} />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Town Halls */}
      {contactInfo.townHalls && contactInfo.townHalls.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg border-2 border-blue-100">
          <h3 className="text-xl font-black text-gray-800 mb-4">Upcoming Town Halls</h3>
          <div className="space-y-4">
            {contactInfo.townHalls.map((event, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border-2 border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-800 mb-1">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{event.time}</div>
                    <div className="text-sm font-semibold text-gray-800 mb-1">{event.location}</div>
                    <div className="text-xs text-gray-500 mb-3">{event.address}</div>
                    
                    {event.registration_required && event.registration_link && (
                      <a 
                        href={event.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition text-xs"
                      >
                        Register Now
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {event.registration_required && !event.registration_link && (
                      <span className="inline-block px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg font-bold text-xs">
                        Registration Required
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Staff */}
      {contactInfo.staff && contactInfo.staff.length > 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border-2 border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-4">Key Staff</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactInfo.staff.map((staff, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-sm font-bold text-purple-600 mb-1">{staff.name}</div>
                <div className="text-sm text-gray-800 font-semibold mb-2">{staff.title}</div>
                <a 
                  href={`mailto:${staff.email}`}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Mail size={12} />
                  Contact
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}