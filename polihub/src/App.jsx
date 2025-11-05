import React, { useState, useEffect } from 'react';
import { Search, Home, Book, ChevronRight, Plus, Bell, Mail, TrendingUp, Calendar, MessageCircle, Eye, Users, Globe, Filter, Star, MapPin, Briefcase, Twitter, Facebook, Instagram, ExternalLink, ArrowLeft, ThumbsUp, Share2, Bookmark, Clock, User, Heart, BookOpen, GraduationCap, Lightbulb, Award, Target, Sparkles, Vote, Scale, Building2 } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PoliticiansPage from './pages/PoliticiansPage';
import CivicEducationPage from './pages/CivicEducationPage';
import BlogPage from './pages/BlogPage';
import AboutPage from './pages/AboutPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import FindRepsPage from './pages/FindRepsPage';
import ContactPage from './pages/ContactPage';
import CareersPage from './pages/CareersPage';
import BlogAuthorPage from './pages/BlogAuthorPage';
import BillsPage from './pages/BillsPage';
import PoliticianDetailModalEnhanced from './components/PoliticianDetailModalEnhanced';
import TopicDetailModal from './components/TopicDetailModal';
import BlogPostDetailModal from './components/BlogPostDetailModal';
import API from './services/api';
import { normalizePolitician, normalizeTopic, normalizeBlogPost } from './utils/normalize';

export default function RadaMtaani() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentPolitician, setCurrentPolitician] = useState(0);
  const [selectedPolitician, setSelectedPolitician] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [selectedTrending, setSelectedTrending] = useState({});
  const [filterParty, setFilterParty] = useState('all');
  const [filterChamber, setFilterChamber] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [blogCategory, setBlogCategory] = useState('all');

  // Scroll to top whenever page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Admin authentication states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Data from API
  const [politicians, setPoliticians] = useState([]);
  const [civicTopics, setCivicTopics] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [floatingIcons, setFloatingIcons] = useState([
    { icon: 'Sparkles', x: 10, y: 10 },
    { icon: 'Vote', x: 85, y: 20 },
    { icon: 'Scale', x: 15, y: 80 },
    { icon: 'Building2', x: 90, y: 85 }
  ]);

  const [trendingTopics, setTrendingTopics] = useState([]);

  const recentSearches = [
    { icon: '🗳️', text: 'Voter Registration', color: 'from-orange-400 to-pink-500' },
    { icon: '📊', text: 'Poll Analysis', color: 'from-purple-400 to-pink-500' },
    { icon: '⚖️', text: 'Supreme Court', color: 'from-slate-600 to-slate-800' }
  ];

  // Check authentication on load
  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [politiciansData, topicsData, postsData, trendingData] = await Promise.all([
          API.getPoliticians(),
          API.getCivicTopics(),
          API.getBlogPosts({ limit: 20 }),
          API.getTrending()
        ]);
        setPoliticians(politiciansData.map(normalizePolitician));
        setCivicTopics(topicsData.map(normalizeTopic));
        setBlogPosts(postsData.map(normalizeBlogPost));
        setTrendingTopics(trendingData);
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to static data if API fails
        import('./data/politicians').then(m => setPoliticians(m.politicians));
        import('./data/civicTopics').then(m => setCivicTopics(m.civicTopics));
        import('./data/blogPosts').then(m => setBlogPosts(m.blogPosts));
        // Fallback trending topics
        setTrendingTopics([
          { emoji: '🔥', text: 'Infrastructure Updates' },
          { emoji: '⚡', text: 'Live Hearings' },
          { emoji: '🌱', text: 'Climate Policy' },
          { emoji: '🔒', text: 'Digital Privacy' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingIcons(prev => prev.map(icon => ({
        ...icon,
        x: Math.max(5, Math.min(95, icon.x + (Math.random() * 2 - 1))),
        y: Math.max(5, Math.min(95, icon.y + (Math.random() * 2 - 1)))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const nextPolitician = () => {
    setCurrentPolitician((prev) => (prev + 1) % politicians.length);
  };

  const prevPolitician = () => {
    setCurrentPolitician((prev) => (prev - 1 + politicians.length) % politicians.length);
  };

  const handleSubscribe = async () => {
    if (email && email.includes('@')) {
      try {
        await API.subscribeNewsletter(email);
        setSubscribed(true);
        setTimeout(() => {
          setEmail('');
          setSubscribed(false);
        }, 2000);
      } catch (error) {
        console.error('Newsletter subscription failed:', error);
      }
    }
  };

  const toggleTrending = (index) => {
    setSelectedTrending(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const filteredPoliticians = politicians.filter(pol => {
    const matchesParty = filterParty === 'all' || pol.party === filterParty;
    const matchesChamber = filterChamber === 'all' || pol.chamber === filterChamber;
    const matchesSearch = (pol.full_name || pol.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (pol.state || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesParty && matchesChamber && matchesSearch;
  });

  const filteredBlogPosts = blogCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === blogCategory);

  const current = politicians[currentPolitician];

  const sharedProps = {
    email,
    setEmail,
    subscribed,
    handleSubscribe,
    selectedTrending,
    toggleTrending,
    trendingTopics,
    recentSearches
  };

  if (loading) {
    return (
      <div className="min-h-screen animate-fade-in bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-bounce flex justify-center">
            <Building2 size={64} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-red-600 bg-clip-text text-transparent">
            Loading RadaMtaani...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      currentPage.startsWith('admin')
        ? 'bg-gradient-to-br from-gray-50 to-gray-100'
        : 'bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 p-2 sm:p-4'
    } relative overflow-x-hidden`}>
      {/* Floating Background Icons (hide on admin pages) */}
      {!currentPage.startsWith('admin') && floatingIcons.map((item, idx) => {
        const IconComponent = {
          Sparkles,
          Vote,
          Scale,
          Building2
        }[item.icon];

        return (
          <div
            key={idx}
            className="absolute opacity-15 pointer-events-none transition-all duration-3000 ease-in-out"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animation: `float 6s ease-in-out infinite ${idx * 1.5}s`
            }}
          >
            <IconComponent size={48} className="text-purple-600" />
          </div>
        );
      })}

      {/* Hide Header on Admin Pages */}
      {!currentPage.startsWith('admin') && (
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Page Content */}
      {currentPage === 'home' && (
        <HomePage
            politicians={politicians}
            civicTopics={civicTopics}
            current={current}
          nextPolitician={nextPolitician}
          prevPolitician={prevPolitician}
          setSelectedPolitician={setSelectedPolitician}
          setSelectedTopic={setSelectedTopic}
          setCurrentPage={setCurrentPage}
          blogPosts={blogPosts}
          setSelectedBlogPost={setSelectedBlogPost}
          {...sharedProps}
        />
      )}
      {currentPage === 'politicians' && (
        <PoliticiansPage
          filteredPoliticians={filteredPoliticians}
          filterParty={filterParty}
          setFilterParty={setFilterParty}
          filterChamber={filterChamber}
          setFilterChamber={setFilterChamber}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSelectedPolitician={setSelectedPolitician}
          {...sharedProps}
        />
      )}
      {currentPage === 'education' && (
        <CivicEducationPage
          civicTopics={civicTopics}
          selectedTopic={selectedTopic} 
          setSelectedTopic={setSelectedTopic}
          {...sharedProps}
        />
      )}
      {currentPage === 'blog' && (
        <BlogPage
          filteredBlogPosts={filteredBlogPosts}
          blogCategory={blogCategory}
          setBlogCategory={setBlogCategory}
          setSelectedBlogPost={setSelectedBlogPost}
          setCurrentPage={setCurrentPage}
          {...sharedProps}
        />
      )}
      {currentPage === 'about' && <AboutPage />}
      {currentPage === 'find-reps' && <FindRepsPage />}
      {currentPage === 'contact' && <ContactPage />}
      {currentPage === 'careers' && <CareersPage />}
      {currentPage === 'bills' && <BillsPage />}
      {currentPage === 'blog-author' && <BlogAuthorPage />}

      {/* Admin Pages */}
      {currentPage === 'admin-login' && (
        <AdminLogin
          onLoginSuccess={() => {
            setIsAdminAuthenticated(true);
            setCurrentPage('admin-dashboard');
          }}
          onClose={() => setCurrentPage('home')}
        />
      )}

      {currentPage === 'admin-dashboard' && (
        <>
          {isAdminAuthenticated ? (
            <AdminDashboard
              onClose={() => {
                setCurrentPage('home');
                setIsAdminAuthenticated(false);
                sessionStorage.removeItem('adminToken');
              }}
            />
          ) : (
            <AdminLogin
              onLoginSuccess={() => {
                setIsAdminAuthenticated(true);
              }}
              onClose={() => setCurrentPage('home')}
            />
          )}
        </>
      )}

      {/* Modals */}
      {selectedPolitician && (
        <PoliticianDetailModalEnhanced
          politician={selectedPolitician}
          onClose={() => setSelectedPolitician(null)}
        />
      )}

{selectedTopic && currentPage !== 'education' && (
  <TopicDetailModal 
    topic={selectedTopic} 
    onClose={() => setSelectedTopic(null)} 
  />
)}

      {selectedBlogPost && (
        <BlogPostDetailModal
          post={selectedBlogPost}
          onClose={() => setSelectedBlogPost(null)}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Hide Footer on Admin Pages */}
      {!currentPage.startsWith('admin') && (
        <Footer setCurrentPage={setCurrentPage} />
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}