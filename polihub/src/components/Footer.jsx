import React from 'react';
import { Globe } from 'lucide-react';

export default function Footer({ setCurrentPage }) {
  return (
    <footer className="max-w-[1600px] mx-auto mt-8 md:mt-16 bg-white/90 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-xl border-2 border-white overflow-hidden">
      {/* Main Footer */}
      <div className="p-6 sm:p-8 md:p-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl md:text-2xl">🏛️</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                PoliHub
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 md:mb-4">
              Empowering young citizens through accessible political education.
            </p>
            <div className="flex gap-2">
              {['TW', 'IG', 'TT', 'YT'].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-purple-600 font-bold hover:shadow-md transition hover:scale-110 transform text-xs"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <h4 className="font-black text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Explore</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              {['home', 'politicians', 'education', 'blog'].map((page) => (
                <li key={page}>
                  <button
                    onClick={() => setCurrentPage(page)}
                    className="text-gray-600 hover:text-purple-600 transition capitalize text-left"
                  >
                    {page === 'blog' ? 'Discourse' : page === 'education' ? 'Civic Ed' : page}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Resources</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-600">
              <li><button onClick={() => setCurrentPage('find-reps')} className="hover:text-purple-600 transition text-left">Find Reps</button></li>
              <li><button onClick={() => setCurrentPage('bills')} className="hover:text-purple-600 transition text-left">Bill Tracker</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Company</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-600">
              <li><button onClick={() => setCurrentPage('about')} className="hover:text-purple-600 transition text-left">About Us</button></li>
              <li><button onClick={() => setCurrentPage('careers')} className="hover:text-purple-600 transition text-left">Careers</button></li>
              <li><button onClick={() => setCurrentPage('contact')} className="hover:text-purple-600 transition text-left">Contact</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Legal</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-600">
              <li><a href="#" className="hover:text-purple-600 transition">Privacy</a></li>
              <li><a href="#" className="hover:text-purple-600 transition">Terms</a></li>
              <li><a href="#" className="hover:text-purple-600 transition">Cookies</a></li>
              <li><a href="#" className="hover:text-purple-600 transition">Access</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 mb-6 md:mb-8 border-2 border-purple-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-black mb-1">Stay Informed 📬</h3>
              <p className="text-xs md:text-sm text-gray-600">Get weekly updates</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 md:py-2.5 rounded-full border-2 border-purple-200 focus:border-purple-500 focus:outline-none w-full sm:w-48 md:w-64 text-sm"
              />
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 md:px-6 py-2 md:py-2.5 rounded-full font-bold hover:shadow-lg transition text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 md:pt-6 border-t-2 border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs md:text-sm text-gray-600">
            <p className="text-center sm:text-left">© 2025 PoliHub. Made with 💜</p>
            <div className="flex gap-4 md:gap-6 justify-center sm:justify-end">
              <span className="flex items-center gap-1">
                <Globe size={14} />
                English
              </span>
              <span>🇺🇸 US</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="h-1.5 md:h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600"></div>
    </footer>
  );
}
