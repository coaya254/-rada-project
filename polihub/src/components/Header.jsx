import React, { useState, useEffect } from 'react';
import { Home, Users, BookOpen, MessageCircle, Menu, X, MapPin, FileText, Briefcase, Mail } from 'lucide-react';

export default function Header({ currentPage, setCurrentPage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Secret admin access: Ctrl+Shift+A or Cmd+Shift+A
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setCurrentPage('admin-login');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setCurrentPage]);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'politicians', label: 'Politicians', icon: Users },
    { id: 'education', label: 'Civic Ed', icon: BookOpen },
    { id: 'blog', label: 'Discourse', icon: MessageCircle },
  ];

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="max-w-[1600px] mx-auto mb-4 md:mb-6 sticky top-0 z-50 bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-lg border border-white">
      <div className="flex items-center justify-between p-3 md:p-4">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-400 via-red-500 to-red-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl md:text-2xl">🇰🇪</span>
          </div>
          <h1 className="text-lg md:text-2xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-red-600 bg-clip-text text-transparent">
            RadaMtaani
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-bold">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                currentPage === id
                  ? 'text-purple-600 bg-purple-100'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-purple-100 rounded-lg transition"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-gray-700" />
            ) : (
              <Menu size={24} className="text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <nav className="flex flex-col p-3">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                  currentPage === id
                    ? 'text-purple-600 bg-purple-50 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="text-base">{label}</span>
              </button>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Additional Pages */}
            <button
              onClick={() => handleNavClick('find-reps')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                currentPage === 'find-reps'
                  ? 'text-purple-600 bg-purple-50 font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MapPin size={20} />
              <span className="text-base">Find Reps</span>
            </button>

            <button
              onClick={() => handleNavClick('bills')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                currentPage === 'bills'
                  ? 'text-purple-600 bg-purple-50 font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText size={20} />
              <span className="text-base">Bills & Legislation</span>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            <button
              onClick={() => handleNavClick('about')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                currentPage === 'about'
                  ? 'text-purple-600 bg-purple-50 font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BookOpen size={20} />
              <span className="text-base">About</span>
            </button>

            <button
              onClick={() => handleNavClick('careers')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                currentPage === 'careers'
                  ? 'text-purple-600 bg-purple-50 font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Briefcase size={20} />
              <span className="text-base">Careers</span>
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                currentPage === 'contact'
                  ? 'text-purple-600 bg-purple-50 font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Mail size={20} />
              <span className="text-base">Contact</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
