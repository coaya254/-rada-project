import React, { useState, useEffect } from 'react';
import { Clock, GraduationCap, Award, TrendingUp, X, BookOpen, CheckCircle, Search, Filter, ChevronRight, Play, Pause, RotateCcw, ChevronLeft, Trophy, Target, Calendar, Video, FileText, Zap, Star, ArrowRight, RefreshCw } from 'lucide-react';
import API from '../services/api';

function CivicEducationPage({
    selectedTrending, 
    toggleTrending, 
    trendingTopics, 
    recentSearches, 
    civicTopics, 
    selectedTopic,          // ADD THIS
    setSelectedTopic       // ADD THIS
  }) {

    
  const [currentScreen, setCurrentScreen] = useState('home');
  console.log('🔍 Current Screen:', currentScreen);
console.log('🔍 Selected Topic:', selectedTopic);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentLessonSection, setCurrentLessonSection] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [moduleDetails, setModuleDetails] = useState(null);

  // Quiz flow states (like RadaClean)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
    const [loadingModule, setLoadingModule] = useState(true);
    console.log('🔍 Selected Topic:', selectedTopic);
    

    useEffect(() => {
        if (currentScreen === 'module' && selectedTopic) {
          const fetchModuleDetails = async () => {
            try {
              setLoadingModule(true);
              console.log('🔍 Fetching module details for ID:', selectedTopic.id);
              const data = await API.getCivicModule(selectedTopic.id);
              console.log('✅ Module data received:', data);
              console.log('📚 Number of lessons:', data?.lessons?.length || 0);

              // Fetch quizzes for this module
              const quizzes = await API.getModuleQuizzes(selectedTopic.id);
              console.log('🎯 Number of quizzes:', quizzes?.length || 0);

              setModuleDetails({ ...data, quizzes: quizzes || [] });
            } catch (error) {
              console.error('❌ Error fetching module details:', error);
              setModuleDetails(selectedTopic);
            } finally {
              setLoadingModule(false);
            }
          };
          fetchModuleDetails();
        }
      }, [currentScreen, selectedTopic]);

  const categories = ['All', 'Government', 'Elections', 'Rights', 'Law', 'Policy', 'History'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];


  const challenges = [
    {
      id: 1,
      title: 'Democracy Basics Challenge',
      description: 'Master the fundamentals of American democracy',
      difficulty: 'Beginner',
      xp: 500,
      duration: '7 days',
      icon: '🎯',
      color: 'from-blue-500 to-cyan-500',
      tasks: [
        { id: 1, title: 'Complete "Checks & Balances" module', xp: 100 },
        { id: 2, title: 'Watch all video lessons on the Constitution', xp: 150 },
        { id: 3, title: 'Score 80%+ on Bill of Rights quiz', xp: 150 },
        { id: 4, title: 'Share one interesting fact you learned', xp: 100 }
      ]
    },
    {
      id: 2,
      title: 'Election Expert',
      description: 'Become an authority on how elections work',
      difficulty: 'Intermediate',
      xp: 750,
      duration: '10 days',
      icon: '🗳️',
      color: 'from-red-500 to-pink-500',
      tasks: [
        { id: 1, title: 'Complete Electoral College module', xp: 150 },
        { id: 2, title: 'Complete How Laws Are Made module', xp: 130 },
        { id: 3, title: 'Take the Voting Rights quiz', xp: 120 },
        { id: 4, title: 'Watch 5 election-related videos', xp: 200 },
        { id: 5, title: 'Explore all interactive election maps', xp: 150 }
      ]
    },
    {
      id: 3,
      title: 'Policy Pro',
      description: 'Understand how policy is made and influenced',
      difficulty: 'Advanced',
      xp: 1000,
      duration: '14 days',
      icon: '💼',
      color: 'from-purple-500 to-indigo-500',
      tasks: [
        { id: 1, title: 'Complete Lobbying & Interest Groups module', xp: 180 },
        { id: 2, title: 'Complete How Laws Are Made module', xp: 130 },
        { id: 3, title: 'Analyze 3 real-world policy cases', xp: 300 },
        { id: 4, title: 'Score 90%+ on all policy quizzes', xp: 240 },
        { id: 5, title: 'Complete the Policy Simulation', xp: 150 }
      ]
    }
  ];

  const getLessonContent = (lesson) => {
    // Use actual lesson content from database
    console.log('📖 Getting content for lesson:', lesson);

    // If lesson has content, use it directly
    if (lesson.content) {
      return {
        sections: [
          {
            type: lesson.lesson_type || 'text',
            title: lesson.title,
            content: lesson.content,
            videoUrl: lesson.video_url
          }
        ]
      };
    }

    // Fallback for lessons without content
    return {
      sections: [
        {
          type: 'text',
          title: lesson.title,
          content: lesson.description || 'No content available for this lesson yet.'
        }
      ]
    };
  };

  const getModuleQuiz = (moduleId) => {
    return {
      title: 'Module Quiz',
      questions: [
        {
          id: 1,
          question: 'Which branch of government makes the laws?',
          options: ['Executive', 'Legislative', 'Judicial', 'Administrative'],
          correct: 1
        },
        {
          id: 2,
          question: 'What is the primary purpose of checks and balances?',
          options: [
            'To speed up the lawmaking process',
            'To prevent any branch from becoming too powerful',
            'To reduce government spending',
            'To increase voter participation'
          ],
          correct: 1
        },
        {
          id: 3,
          question: 'Who can veto laws passed by Congress?',
          options: ['Supreme Court', 'Vice President', 'President', 'Senate Majority Leader'],
          correct: 2
        }
      ]
    };
  };

  const filteredTopics = civicTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (topic.subtitle || topic.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || topic.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'All' || topic.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // HOME SCREEN
  if (currentScreen === 'home') {
    

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Civic Education 📚
            </h1>
            <p className="text-gray-600 text-lg">
              Master the fundamentals of American democracy and become an informed citizen
            </p>
          </div>

{/* Quick Navigation */}
<div className="flex gap-4 mb-6">
            <button onClick={() => setCurrentScreen('browse')} className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all font-bold hover:scale-105">
              <Search size={20} className="text-purple-600" />
              Browse All Modules
            </button>
            <button onClick={() => setCurrentScreen('challenges')} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all font-bold hover:scale-105">
              <Trophy size={20} />
              View Challenges
            </button>
            <button onClick={handleRefresh} className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all font-bold hover:scale-105">
              <RefreshCw size={20} className={`text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-4xl mb-2">🎓</div>
              <div className="text-2xl sm:text-3xl font-black">{civicTopics.length}</div>
              <div className="text-sm opacity-90">Topics Available</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-4xl mb-2">⏱️</div>
              <div className="text-2xl sm:text-3xl font-black">60+</div>
              <div className="text-sm opacity-90">Minutes of Content</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-4xl mb-2">✨</div>
              <div className="text-2xl sm:text-3xl font-black">Interactive</div>
              <div className="text-sm opacity-90">Learning Experience</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-2xl sm:text-3xl font-black">Free</div>
              <div className="text-sm opacity-90">Always Accessible</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
                {civicTopics.slice(0, 6).map((topic, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setSelectedTopic(topic); setCurrentScreen('module'); }}
                    className="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-white hover:scale-[1.02] transform group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className={`w-16 h-16 bg-gradient-to-br ${topic.color} rounded-xl flex items-center justify-center text-3xl shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          {topic.icon}
                        </div>
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {topic.badge}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-purple-600 mb-1">{topic.category}</div>
                        <h4 className="font-black text-xl text-gray-800 mb-2">{topic.title}</h4>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {topic.subtitle || topic.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 text-xs">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock size={12} />
                          {topic.readTime || topic.estimated_duration + ' min'}
                        </span>
                        <span className={`px-2 py-1 rounded-full font-bold ${
                          topic.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                          topic.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {topic.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Explore More Button */}
              {civicTopics.length > 6 && (
                <div className="text-center">
                  <button
                    onClick={() => setCurrentScreen('browse')}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all hover:scale-105 inline-flex items-center gap-2"
                  >
                    <Search size={20} />
                    Explore All {civicTopics.length} Modules
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-5 order-2">
              {/* Learning Path */}
              <div className="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-white/50 ring-1 ring-gray-100">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <GraduationCap className="text-purple-600" size={20} />
                  Recommended Path
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-black min-h-[40px]">1</div>
                      <span className="font-bold text-sm">Start Here</span>
                    </div>
                    <p className="text-xs text-gray-600 ml-8">Checks & Balances</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-black min-h-[40px]">2</div>
                      <span className="font-bold text-sm">Next Step</span>
                    </div>
                    <p className="text-xs text-gray-600 ml-8">Electoral College</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl border-2 border-purple-200 opacity-60">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-purple-300 rounded-full flex items-center justify-center text-white text-xs font-black min-h-[40px]">3</div>
                      <span className="font-bold text-sm">Advanced</span>
                    </div>
                    <p className="text-xs text-gray-600 ml-8">Lobbying & Influence</p>
                  </div>
                </div>
              </div>

              {/* Trending */}
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-lg border-2 border-white/50 ring-1 ring-gray-100">
                <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                  <TrendingUp size={18} className="text-pink-500" />
                  Trending Now
                </h3>
                <div className="space-y-2">
                  {trendingTopics.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleTrending(idx)}
                      className={`p-2 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                        selectedTrending[idx] 
                          ? 'bg-gradient-to-r from-pink-100 to-purple-100 transform translate-x-1' 
                          : 'bg-purple-50 hover:bg-purple-100'
                      }`}
                    >
                      {item.emoji} {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // BROWSE SCREEN
  if (currentScreen === 'browse') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-[1600px] mx-auto">
          <button onClick={() => setCurrentScreen('home')} className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all">
            <ChevronLeft size={18} />
            Back to Home
          </button>

          <div className="mb-6">
            <h1 className="text-4xl font-black mb-4">Browse Modules</h1>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none"
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className="px-6 py-3 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all flex items-center gap-2">
                <Filter size={20} />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="bg-white rounded-xl p-4 shadow-lg mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold mb-2 block">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${categoryFilter === cat ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-2 block">Difficulty</label>
                    <div className="flex flex-wrap gap-2">
                      {difficulties.map(diff => (
                        <button key={diff} onClick={() => setDifficultyFilter(diff)} className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${difficultyFilter === diff ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredTopics.map(topic => (
              <div key={topic.id} onClick={() => { setSelectedTopic(topic); setCurrentScreen('module'); }} className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-gray-100 hover:border-purple-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                
                <div className="relative p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className={`w-16 h-16 bg-gradient-to-br ${topic.color} rounded-xl flex items-center justify-center text-3xl shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                        {topic.icon}
                      </div>
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-md">
                        {topic.badge}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-black text-purple-600 mb-1 tracking-wide">{topic.category.toUpperCase()}</div>
                      <h4 className="font-black text-xl text-gray-800 group-hover:text-purple-600 transition-colors">{topic.title}</h4>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed line-clamp-2 leading-relaxed">
                    {topic.subtitle}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs flex-wrap mb-3">
                    <span className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg font-bold">
                      <Clock size={12} />
                      {topic.duration}
                    </span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold">
                      {topic.lessonCount} lessons
                    </span>
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg font-bold">
                      {topic.xp} XP
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                      topic.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                      topic.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {topic.difficulty}
                    </span>
                    <ChevronRight className="text-purple-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={20} />
                  </div>
                </div>
                
                <div className={`h-1 bg-gradient-to-r ${topic.color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

// MODULE DETAIL SCREEN
if (currentScreen === 'module' && selectedTopic) {
    // Fetch full module details when entering this screen

    

    if (loadingModule) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-bounce">📚</div>
            <div className="text-xl font-bold text-purple-600">Loading module...</div>
          </div>
        </div>
      );
    }

    const displayTopic = moduleDetails || selectedTopic;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => setCurrentScreen('browse')} className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all">
            <ChevronLeft size={18} />
            Back to Browse
          </button>
          
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 shadow-2xl mb-6">
            <div className="flex items-start gap-4 sm:gap-6 mb-6">
              <div className={`w-24 h-24 bg-gradient-to-br ${displayTopic.color} rounded-2xl flex items-center justify-center text-5xl shadow-lg`}>
                {displayTopic.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-purple-600 mb-2">{displayTopic.category}</div>
                <h1 className="text-4xl font-black mb-3">{displayTopic.title}</h1>
                <p className="text-gray-600 text-lg mb-4">{displayTopic.description}</p>
                
                <div className="flex gap-3 flex-wrap">
                  <span className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-sm font-bold">
                    <BookOpen size={16} />
                    {(displayTopic.lessons || []).length} Lessons
                  </span>
                  <span className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-sm font-bold">
                    <Clock size={16} />
                    {displayTopic.duration}
                  </span>
                  <span className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-sm font-bold">
                    <Trophy size={16} />
                    {displayTopic.xp_reward || displayTopic.xp} XP
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    displayTopic.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                    displayTopic.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {displayTopic.difficulty}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-black mb-4">Lessons</h2>
              {(displayTopic.lessons || []).length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-gray-600">No lessons available yet for this module.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(displayTopic.lessons || []).map((lesson, idx) => (
                    <div key={lesson.id} onClick={() => { setSelectedLesson(lesson); setCurrentScreen('lesson'); setCurrentLessonSection(0); }} className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all cursor-pointer border-2 border-gray-100 hover:border-purple-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center gap-4 p-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-500 group-hover:to-pink-500 rounded-xl flex items-center justify-center font-black text-purple-600 group-hover:text-white text-xl group-hover:scale-110 transition-all shadow-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1 group-hover:text-purple-600 transition-colors">{lesson.title}</h3>
                          <div className="flex gap-3 text-sm">
                            <span className="flex items-center gap-1 text-gray-600 font-medium">
                              <Clock size={14} />
                              {lesson.duration}
                            </span>
                            <span className="flex items-center gap-1 text-gray-600 font-medium">
                              {lesson.type === 'video' && <><Video size={14} /> Video</>}
                              {lesson.type === 'text' && <><FileText size={14} /> Reading</>}
                              {lesson.type === 'interactive' && <><Zap size={14} /> Interactive</>}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity min-h-[40px]">
                            Start
                          </div>
                          <ChevronRight className="text-purple-600 group-hover:translate-x-1 transition-transform" size={24} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Show quizzes if available */}
            {displayTopic.quizzes && displayTopic.quizzes.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-black mb-4">Quizzes</h2>
                {displayTopic.quizzes.map((quiz) => (
                  <div key={quiz.id} className="relative bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-orange-200 hover:border-orange-400 transition-all group mb-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-10 group-hover:opacity-15 transition-opacity"></div>
                    <div className="relative p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Trophy className="text-white" size={20} />
                            </div>
                            <h3 className="text-2xl font-black">{quiz.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
                          <div className="flex gap-3 text-xs">
                            <span className="bg-purple-100 px-2 py-1 rounded">⏱️ {quiz.time_limit} min</span>
                            <span className="bg-blue-100 px-2 py-1 rounded">📝 {quiz.question_count} questions</span>
                            <span className="bg-green-100 px-2 py-1 rounded">🏆 {quiz.xp_reward} XP</span>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            const quizData = await API.getQuiz(quiz.id);
                            setSelectedQuiz(quizData);
                            setCurrentScreen('quiz');
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all group-hover:scale-105"
                        >
                          Take Quiz →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

 // LESSON SCREEN
if (currentScreen === 'lesson' && selectedLesson) {
    const lessonContent = getLessonContent(selectedLesson);
    const currentSection = lessonContent.sections[currentLessonSection];
    const isLastSection = currentLessonSection === lessonContent.sections.length - 1;
    const isFirstSection = currentLessonSection === 0;
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setCurrentScreen('module')} className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all">
            <ChevronLeft size={18} />
            Back to Module
          </button>
  
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            {/* Gradient Header - Modal Style */}
            <div className="relative p-8 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600">
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-5xl">
                  {selectedLesson.type === 'video' ? '🎥' : selectedLesson.type === 'interactive' ? '⚡' : '📖'}
                </div>
                <div className="flex-1">
                  <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold mb-3 min-h-[40px]">
                    LESSON {selectedLesson.id}
                  </div>
                  <h1 className="text-4xl font-black text-white mb-2">{selectedLesson.title}</h1>
                  <div className="flex gap-3 mt-4">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 min-h-[40px]">
                      <Clock size={12} />
                      {selectedLesson.duration}
                    </span>
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold min-h-[40px]">
                      Section {currentLessonSection + 1} of {lessonContent.sections.length}
                    </span>
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold min-h-[40px]">
                      {selectedLesson.type === 'video' ? '📹 Video' : selectedLesson.type === 'interactive' ? '⚡ Interactive' : '📄 Reading'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Content */}
            <div className="p-8">
              <h2 className="text-2xl sm:text-3xl font-black mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-lg">
                  {currentLessonSection + 1}
                </span>
                {currentSection.title}
              </h2>
              
              {currentSection.type === 'text' && (
                <div className="prose max-w-none">
                  {currentSection.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-gray-700 text-lg leading-relaxed mb-6">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
  
              {currentSection.type === 'video' && (
                <div className="space-y-4">
                  {currentSection.videoUrl ? (
                    <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
                      <iframe
                        className="w-full aspect-video"
                        src={currentSection.videoUrl.replace('youtu.be/', 'youtube.com/embed/').replace('watch?v=', 'embed/')}
                        title={currentSection.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden shadow-xl">
                      <div className="text-center text-white">
                        <div className="text-6xl mb-4">🎥</div>
                        <p className="text-lg px-8">{currentSection.content}</p>
                        <div className="mt-4 text-2xl font-bold">{currentSection.duration}</div>
                      </div>
                    </div>
                  )}

                  {currentSection.content && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                      <p className="text-gray-700">{currentSection.content}</p>
                    </div>
                  )}
                </div>
              )}
  
              {currentSection.type === 'interactive' && (
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 text-center border-2 border-purple-200">
                  <div className="text-6xl mb-4">⚡</div>
                  <h3 className="text-2xl font-bold mb-3 text-purple-900">Interactive Activity</h3>
                  <p className="text-gray-700 mb-6 text-lg">{currentSection.content}</p>
                  <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all hover:scale-105">
                    Start Activity →
                  </button>
                </div>
              )}
  
              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t-2 border-gray-200">
                <button onClick={() => setCurrentLessonSection(Math.max(0, currentLessonSection - 1))} disabled={isFirstSection} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isFirstSection ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm hover:bg-purple-200 hover:scale-105'}`}>
                  <ChevronLeft size={20} />
                  Previous
                </button>
                
                {isLastSection ? (
                  <button onClick={() => {
                    // Find current lesson index
                    const currentLessonIndex = moduleDetails.lessons.findIndex(l => l.id === selectedLesson.id);
                    const nextLesson = moduleDetails.lessons[currentLessonIndex + 1];

                    if (nextLesson) {
                      // Go to next lesson
                      setSelectedLesson(nextLesson);
                      setCurrentLessonSection(0);
                    } else {
                      // Last lesson - check if there's a quiz
                      if (moduleDetails.quizzes && moduleDetails.quizzes.length > 0) {
                        // Go to first quiz
                        const fetchQuiz = async () => {
                          const quizData = await API.getQuiz(moduleDetails.quizzes[0].id);
                          setSelectedQuiz(quizData);
                          setCurrentScreen('quiz');
                        };
                        fetchQuiz();
                      } else {
                        // No quiz, go back to module
                        setCurrentScreen('module');
                      }
                    }
                  }} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all hover:scale-105">
                    {(() => {
                      const currentLessonIndex = moduleDetails.lessons.findIndex(l => l.id === selectedLesson.id);
                      const nextLesson = moduleDetails.lessons[currentLessonIndex + 1];

                      if (nextLesson) {
                        return 'Complete & Next Lesson';
                      } else if (moduleDetails.quizzes && moduleDetails.quizzes.length > 0) {
                        return 'Complete & Take Quiz';
                      } else {
                        return 'Complete Lesson';
                      }
                    })()}
                    <CheckCircle size={20} />
                  </button>
                ) : (
                  <button onClick={() => setCurrentLessonSection(currentLessonSection + 1)} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all hover:scale-105">
                    Next
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // QUIZ SCREEN
  if (currentScreen === 'quiz' && selectedQuiz) {
    // Handler functions for quiz flow
    const handleAnswerSelect = (answerIndex) => {
      if (!showExplanation) {
        setSelectedAnswer(answerIndex);
      }
    };

    const handleAnswerCheck = () => {
      if (selectedAnswer === null) {
        alert('Please select an answer before checking.');
        return;
      }

      const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
      const correct = selectedAnswer === currentQuestion.correct_answer_index;
      setIsCorrect(correct);
      setShowExplanation(true);

      // Update answers for scoring
      const newAnswers = { ...quizAnswers };
      newAnswers[currentQuestion.id] = selectedAnswer;
      setQuizAnswers(newAnswers);
    };

    const handleNext = () => {
      if (!showExplanation) {
        // Check answer first
        handleAnswerCheck();
      } else {
        // Move to next question or complete quiz
        if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setShowExplanation(false);
          setIsCorrect(false);
        } else {
          // Complete quiz
          handleQuizComplete();
        }
      }
    };

    const handleQuizComplete = () => {
      let correctAnswers = 0;
      selectedQuiz.questions.forEach((question, index) => {
        if (quizAnswers[question.id] === question.correct_answer_index) {
          correctAnswers++;
        }
      });
      setQuizScore(correctAnswers);
      setQuizCompleted(true);
    };

    const handleRestart = () => {
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setQuizAnswers({});
      setShowExplanation(false);
      setIsCorrect(false);
      setQuizCompleted(false);
      setQuizScore(0);
    };

    // Quiz completed screen
    if (quizCompleted) {
      const percentage = Math.round((quizScore / selectedQuiz.questions.length) * 100);
      const passed = percentage >= (selectedQuiz.passing_score || 70);

      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-12 shadow-2xl">
              <div className="text-center">
                {/* Trophy Icon */}
                <div className="mb-6 sm:mb-8">
                  <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
                    passed
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                      : 'bg-gradient-to-br from-orange-400 to-red-500'
                  }`}>
                    <Trophy size={64} className="text-white" />
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-black mb-3 text-gray-900">
                  {passed ? 'Congratulations!' : 'Quiz Completed'}
                </h1>
                <p className="text-lg text-gray-600 mb-6 sm:mb-8">
                  {passed
                    ? "You've successfully passed this quiz!"
                    : "Keep learning and try again!"}
                </p>

                {/* Score Display */}
                <div className="mb-6 sm:mb-8">
                  <div className={`inline-block rounded-2xl p-8 ${
                    passed
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'
                      : 'bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200'
                  }`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className={`text-6xl font-black ${
                        passed ? 'text-green-600' : 'text-orange-600'
                      }`}>{quizScore}</span>
                      <span className="text-3xl text-gray-400 font-bold">/ {selectedQuiz.questions.length}</span>
                    </div>
                    <div className={`text-4xl font-bold ${
                      passed ? 'text-green-600' : 'text-orange-600'
                    }`}>{percentage}%</div>
                  </div>
                </div>

                {/* Performance Message */}
                <div className={`text-2xl font-bold mb-8 ${
                  passed ? 'text-green-700' : 'text-orange-700'
                }`}>
                  {percentage >= 90 ? '🎉 Outstanding!' :
                   percentage >= 80 ? '⭐ Excellent Work!' :
                   percentage >= 70 ? '✅ Well Done!' :
                   percentage >= 60 ? '👍 Good Effort!' :
                   '📚 Keep Practicing!'}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setSelectedQuiz(null);
                      setCurrentScreen('module');
                      handleRestart();
                    }}
                    className={`px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl ${
                      passed
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                        : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'
                    }`}
                  >
                    Continue Learning
                  </button>
                  <button
                    onClick={handleRestart}
                    className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Quiz in progress
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => {
            setCurrentScreen('module');
            handleRestart();
          }} className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all">
            <ChevronLeft size={18} />
            Back to Module
          </button>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-black">{selectedQuiz.title}</h1>
                <div className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-right text-sm text-gray-600 mt-1">{Math.round(progress)}%</div>
            </div>

            {/* Question Card */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                  {currentQuestionIndex + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{currentQuestion.question_text}</h2>
                </div>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options && currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === currentQuestion.correct_answer_index;
                const showCorrect = showExplanation && isCorrectAnswer;
                const showWrong = showExplanation && isSelected && !isCorrectAnswer;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-semibold ${
                      showCorrect
                        ? 'border-green-500 bg-green-50'
                        : showWrong
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                        ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 shadow-md'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                    } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        showCorrect
                          ? 'border-green-500 bg-green-500'
                          : showWrong
                          ? 'border-red-500 bg-red-500'
                          : isSelected
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {showCorrect ? (
                          <CheckCircle size={20} className="text-white" />
                        ) : showWrong ? (
                          <X size={20} className="text-white" />
                        ) : isSelected ? (
                          <CheckCircle size={20} className="text-white" />
                        ) : (
                          <span className="text-gray-400 font-bold text-sm">{String.fromCharCode(65 + index)}</span>
                        )}
                      </div>
                      <span className={`flex-1 ${
                        showCorrect ? 'text-green-900' :
                        showWrong ? 'text-red-900' :
                        'text-gray-900'
                      }`}>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className={`rounded-2xl p-6 mb-6 ${
                isCorrect
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {isCorrect ? (
                    <CheckCircle size={32} className="text-green-600" />
                  ) : (
                    <X size={32} className="text-red-600" />
                  )}
                  <h3 className={`text-2xl font-black ${
                    isCorrect ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Not Quite'}
                  </h3>
                </div>
                <p className={`text-lg ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {currentQuestion.explanation || 'No explanation available.'}
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t-2 border-gray-200">
              <button
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(currentQuestionIndex - 1);
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                    setIsCorrect(false);
                  }
                }}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={selectedAnswer === null && !showExplanation}
                className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  selectedAnswer !== null || showExplanation
                    ? showExplanation
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {showExplanation
                  ? currentQuestionIndex === selectedQuiz.questions.length - 1
                    ? 'Finish Quiz'
                    : 'Next Question'
                  : 'Check Answer'}
                {showExplanation ? <ChevronRight size={20} /> : <CheckCircle size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHALLENGES SCREEN
  if (currentScreen === 'challenges') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => setCurrentScreen('home')} className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all">
            <ChevronLeft size={18} />
            Back to Home
          </button>

          <div className="mb-6 sm:mb-8">
            <h1 className="text-4xl font-black mb-3">Challenges</h1>
            <p className="text-gray-600 text-lg">Complete challenges to earn bonus XP and deepen your knowledge</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {challenges.map(challenge => (
              <div key={challenge.id} onClick={() => { setSelectedChallenge(challenge); setCurrentScreen('challenge'); }} className={`bg-gradient-to-br ${challenge.color} rounded-2xl sm:rounded-3xl p-8 text-white shadow-2xl hover:scale-[1.02] transition-transform cursor-pointer`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="text-6xl">{challenge.icon}</div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl sm:text-3xl font-black">{challenge.title}</h2>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">{challenge.difficulty}</span>
                      </div>
                      <p className="text-lg opacity-90 mb-4">{challenge.description}</p>
                      <div className="flex gap-4 sm:gap-6">
                        <span className="flex items-center gap-2 text-lg font-bold">
                          <Trophy size={20} />
                          {challenge.xp} XP
                        </span>
                        <span className="flex items-center gap-2 text-lg font-bold">
                          <Calendar size={20} />
                          {challenge.duration}
                        </span>
                        <span className="flex items-center gap-2 text-lg font-bold">
                          <Target size={20} />
                          {challenge.tasks.length} Tasks
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={32} className="flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // CHALLENGE DETAIL SCREEN
  if (currentScreen === 'challenge' && selectedChallenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => setCurrentScreen('challenges')} className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all">
            <ChevronLeft size={18} />
            Back to Challenges
          </button>

          <div className={`bg-gradient-to-br ${selectedChallenge.color} rounded-2xl sm:rounded-3xl p-8 text-white shadow-2xl mb-6`}>
            <div className="flex items-start gap-4 sm:gap-6 mb-6">
              <div className="text-7xl">{selectedChallenge.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-4xl font-black">{selectedChallenge.title}</h1>
                  <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-bold">{selectedChallenge.difficulty}</span>
                </div>
                <p className="text-xl opacity-90 mb-6">{selectedChallenge.description}</p>
                <div className="flex gap-8 text-lg">
                  <span className="flex items-center gap-2 font-bold">
                    <Trophy size={24} />
                    {selectedChallenge.xp} XP Total
                  </span>
                  <span className="flex items-center gap-2 font-bold">
                    <Calendar size={24} />
                    {selectedChallenge.duration}
                  </span>
                  <span className="flex items-center gap-2 font-bold">
                    <Clock size={24} />
                    Time Remaining: 5d 12h
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Target size={28} className="text-purple-600" />
              Challenge Tasks
            </h2>
            
            <div className="space-y-4">
              {selectedChallenge.tasks.map((task, idx) => (
                <div key={task.id} className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border-2 border-purple-100 hover:border-purple-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-5">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-500 group-hover:to-pink-500 rounded-xl flex items-center justify-center font-black text-purple-600 group-hover:text-white text-lg group-hover:scale-110 transition-all shadow-sm">
                          {idx + 1}
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600 transition-colors">{task.title}</h3>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-bold">
                            <Trophy size={14} />
                            +{task.xp} XP
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="text-purple-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={24} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black mb-1">Ready to start?</h3>
                  <p className="text-gray-600">Complete all tasks to earn the full {selectedChallenge.xp} XP reward</p>
                </div>
                <button onClick={() => setCurrentScreen('browse')} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300-all">
                  Start Challenge →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default CivicEducationPage;