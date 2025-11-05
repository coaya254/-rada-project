import React, { useState } from 'react';
import { Save, X, Plus, Trash2, ChevronUp, ChevronDown, BookOpen, Award, GraduationCap, HelpCircle, Map, Eye, EyeOff, Star, Upload, Image as ImageIcon } from 'lucide-react';

export default function LearningAdminTool() {
  const [activeTab, setActiveTab] = useState('modules');
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formType, setFormType] = useState(null);

  const [modules, setModules] = useState([
    {
      id: 1,
      title: 'Understanding the Electoral College',
      description: 'Learn how the Electoral College works in US elections',
      category: 'Electoral Systems',
      difficulty: 'Beginner',
      icon: '🗳️',
      iconType: 'emoji',
      status: 'published',
      is_featured: true,
      xp_reward: 150,
      estimated_duration: 45,
      lessons: [
        { id: 101, title: 'Introduction to Electoral College', duration_minutes: 15, xp_reward: 50, is_published: true, lesson_type: 'text', content: 'Lesson content here...', description: 'Basic intro' },
        { id: 102, title: 'How Electoral Votes Work', duration_minutes: 20, xp_reward: 75, is_published: true, lesson_type: 'video', content: '', description: 'Video explanation' }
      ],
      enrollment_count: 234,
      total_lessons: 2
    },
    {
      id: 2,
      title: 'Congressional Powers',
      description: 'Explore the powers granted to Congress',
      category: 'Government Structure',
      difficulty: 'Intermediate',
      icon: '🏛️',
      iconType: 'emoji',
      status: 'draft',
      is_featured: false,
      xp_reward: 200,
      estimated_duration: 60,
      lessons: [],
      enrollment_count: 0,
      total_lessons: 0
    }
  ]);

  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: 'Electoral College Quiz',
      description: 'Test your knowledge of the Electoral College',
      quiz_type: 'module',
      module_id: 1,
      module_title: 'Understanding the Electoral College',
      difficulty: 'Beginner',
      category: 'Electoral Systems',
      passing_score: 70,
      time_limit: 10,
      xp_reward: 50,
      is_published: true,
      questions: [
        {
          id: 1001,
          question_text: 'How many electoral votes are needed to win the presidency?',
          options: ['200', '270', '300', '350'],
          correct_answer_index: 1,
          explanation: '270 is the majority of the 538 total electoral votes.',
          points: 10
        }
      ]
    }
  ]);

  const [paths, setPaths] = useState([
    {
      id: 1,
      title: 'Civic Fundamentals',
      description: 'Essential knowledge for engaged citizens',
      category: 'General',
      difficulty: 'Beginner',
      estimated_hours: 12,
      icon: 'map',
      color: '#3B82F6',
      is_published: true,
      modules: [1],
      enrollment_count: 156
    }
  ]);

  const openForm = (type, item = null) => {
    setFormType(type);
    setSelectedItem(item);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedItem(null);
    setFormType(null);
  };

  const handleSave = (data) => {
    if (formType === 'module') {
      if (selectedItem) {
        setModules(modules.map(m => m.id === selectedItem.id ? { ...data, id: selectedItem.id } : m));
      } else {
        setModules([...modules, { ...data, id: Date.now(), enrollment_count: 0 }]);
      }
    } else if (formType === 'quiz') {
      if (selectedItem) {
        setQuizzes(quizzes.map(q => q.id === selectedItem.id ? { ...data, id: selectedItem.id } : q));
      } else {
        setQuizzes([...quizzes, { ...data, id: Date.now() }]);
      }
    } else if (formType === 'path') {
      if (selectedItem) {
        setPaths(paths.map(p => p.id === selectedItem.id ? { ...data, id: selectedItem.id } : p));
      } else {
        setPaths([...paths, { ...data, id: Date.now(), enrollment_count: 0 }]);
      }
    } else if (formType === 'lesson') {
      if (selectedItem) {
        setModules(modules.map(m => {
          if (m.id === data.module_id) {
            return {
              ...m,
              lessons: m.lessons.map(l => l.id === selectedItem.id ? { ...data, id: selectedItem.id } : l)
            };
          }
          return m;
        }));
      } else {
        setModules(modules.map(m => {
          if (m.id === data.module_id) {
            return {
              ...m,
              lessons: [...m.lessons, { ...data, id: Date.now(), display_order: m.lessons.length }],
              total_lessons: m.lessons.length + 1
            };
          }
          return m;
        }));
      }
    }
    closeForm();
  };

  const handleDelete = (type, id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    if (type === 'module') {
      setModules(modules.filter(m => m.id !== id));
    } else if (type === 'quiz') {
      setQuizzes(quizzes.filter(q => q.id !== id));
    } else if (type === 'path') {
      setPaths(paths.filter(p => p.id !== id));
    } else if (type === 'lesson') {
      setModules(modules.map(m => ({
        ...m,
        lessons: m.lessons.filter(l => l.id !== id),
        total_lessons: m.lessons.filter(l => l.id !== id).length
      })));
    }
  };

  const difficultyColors = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Learning Content Manager</h1>
          <p className="text-gray-600">Create and manage modules, lessons, quizzes, and learning paths</p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'modules'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BookOpen size={20} />
            Modules ({modules.length})
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'lessons'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <GraduationCap size={20} />
            Lessons ({modules.reduce((sum, m) => sum + m.lessons.length, 0)})
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'quizzes'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <HelpCircle size={20} />
            Quizzes ({quizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('paths')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'paths'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Map size={20} />
            Learning Paths ({paths.length})
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {activeTab === 'modules' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">Learning Modules</h2>
                <button
                  onClick={() => openForm('module')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-bold hover:shadow-lg transition"
                >
                  <Plus size={20} />
                  Create Module
                </button>
              </div>

              <div className="grid gap-4">
                {modules.map(module => (
                  <div key={module.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">
                          {module.iconType === 'emoji' ? module.icon : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ImageIcon size={32} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                            {module.is_featured && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">
                                <Star size={12} />
                                Featured
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              module.status === 'published' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {module.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{module.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${difficultyColors[module.difficulty]}`}>
                              {module.difficulty}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                              {module.category}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                              {module.total_lessons} lessons
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                              {module.estimated_duration} min
                            </span>
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                              {module.xp_reward} XP
                            </span>
                            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                              {module.enrollment_count} enrolled
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openForm('module', module)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete('module', module.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">All Lessons</h2>
                <button
                  onClick={() => openForm('lesson')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-bold hover:shadow-lg transition"
                >
                  <Plus size={20} />
                  Create Lesson
                </button>
              </div>

              {modules.flatMap(module => 
                module.lessons.map(lesson => ({ ...lesson, module }))
              ).length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <GraduationCap size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-xl font-bold mb-2">No lessons yet</p>
                  <p>Create your first lesson or add lessons to modules</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {modules.flatMap(module => 
                    module.lessons.map(lesson => ({ ...lesson, module }))
                  ).map(lesson => (
                    <div key={lesson.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{lesson.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              lesson.is_published 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {lesson.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          {lesson.description && (
                            <p className="text-gray-600 mb-3">{lesson.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                              <BookOpen size={12} />
                              {lesson.module.title}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              lesson.lesson_type === 'video' ? 'bg-red-100 text-red-700' :
                              lesson.lesson_type === 'interactive' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {lesson.lesson_type}
                            </span>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                              {lesson.duration_minutes} min
                            </span>
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                              {lesson.xp_reward} XP
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openForm('lesson', lesson)}
                            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold hover:bg-indigo-200 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete('lesson', lesson.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">Quizzes</h2>
                <button
                  onClick={() => openForm('quiz')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg transition"
                >
                  <Plus size={20} />
                  Create Quiz
                </button>
              </div>

              <div className="grid gap-4">
                {quizzes.map(quiz => (
                  <div key={quiz.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            quiz.quiz_type === 'trivia' ? 'bg-purple-100 text-purple-700' :
                            quiz.quiz_type === 'module' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {quiz.quiz_type === 'trivia' ? '🎯 Trivia' :
                             quiz.quiz_type === 'module' ? '📚 Module Quiz' :
                             '📖 Lesson Quiz'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            quiz.is_published 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {quiz.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{quiz.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${difficultyColors[quiz.difficulty]}`}>
                            {quiz.difficulty}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                            {quiz.category}
                          </span>
                          {quiz.module_title && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                              📚 {quiz.module_title}
                            </span>
                          )}
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                            {quiz.questions.length} questions
                          </span>
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                            {quiz.time_limit} min
                          </span>
                          <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                            {quiz.passing_score}% to pass
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            {quiz.xp_reward} XP
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openForm('quiz', quiz)}
                          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold hover:bg-purple-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete('quiz', quiz.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'paths' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">Learning Paths</h2>
                <button
                  onClick={() => openForm('path')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-bold hover:shadow-lg transition"
                >
                  <Plus size={20} />
                  Create Path
                </button>
              </div>

              <div className="grid gap-4">
                {paths.map(path => (
                  <div key={path.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition" style={{ borderLeftWidth: '6px', borderLeftColor: path.color }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{path.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            path.is_published 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {path.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{path.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${difficultyColors[path.difficulty]}`}>
                            {path.difficulty}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                            {path.category}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            {path.modules.length} modules
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                            {path.estimated_hours} hours
                          </span>
                          <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                            {path.enrollment_count} enrolled
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openForm('path', path)}
                          className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-bold hover:bg-emerald-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete('path', path.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {formType === 'module' && (
              <ModuleForm 
                selectedItem={selectedItem} 
                onClose={closeForm} 
                onSave={handleSave}
                allModules={modules}
              />
            )}
            {formType === 'lesson' && (
              <LessonForm 
                selectedItem={selectedItem} 
                onClose={closeForm} 
                onSave={handleSave}
                allModules={modules}
              />
            )}
            {formType === 'quiz' && (
              <QuizForm 
                selectedItem={selectedItem} 
                onClose={closeForm} 
                onSave={handleSave}
                allModules={modules}
              />
            )}
            {formType === 'path' && (
              <PathForm 
                selectedItem={selectedItem} 
                onClose={closeForm} 
                onSave={handleSave}
                allModules={modules}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LessonForm({ selectedItem, onClose, onSave, allModules }) {
  const [formData, setFormData] = useState(selectedItem || {
    title: '',
    description: '',
    lesson_type: 'text',
    content: '',
    video_url: '',
    duration_minutes: 15,
    xp_reward: 25,
    is_published: true,
    module_id: null,
    display_order: 0
  });

  const handleSubmit = () => {
    if (!formData.title) {
      alert('Please enter a lesson title');
      return;
    }
    
    if (!formData.module_id) {
      alert('Please select a module for this lesson');
      return;
    }
    
    if (!formData.content && formData.lesson_type !== 'video') {
      alert('Please add lesson content');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="p-8 overflow-y-auto max-h-[90vh]">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-4">
        <h2 className="text-3xl font-black">{selectedItem ? 'Edit' : 'Create'} Lesson</h2>
        <button onClick={onClose} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
          <X size={20} />
        </button>
      </div>

      <div className="bg-indigo-50 rounded-xl p-6 border-2 border-indigo-100 space-y-4">
        <h3 className="text-xl font-black mb-4">Lesson Information</h3>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Module *</label>
          <select
            value={formData.module_id || ''}
            onChange={(e) => setFormData({ ...formData, module_id: parseInt(e.target.value) || null })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            disabled={selectedItem}
          >
            <option value="">-- Select Module --</option>
            {allModules.map(mod => (
              <option key={mod.id} value={mod.id}>
                {mod.icon} {mod.title}
              </option>
            ))}
          </select>
          {selectedItem && (
            <p className="text-xs text-gray-500 mt-1">Module cannot be changed when editing a lesson</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Lesson Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            placeholder="Introduction to the Electoral College"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            placeholder="Learn the basics of how the Electoral College works..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Lesson Type</label>
            <select
              value={formData.lesson_type}
              onChange={(e) => setFormData({ ...formData, lesson_type: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            >
              <option value="text">📝 Text</option>
              <option value="video">🎥 Video</option>
              <option value="interactive">🎮 Interactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">XP Reward</label>
            <input
              type="number"
              value={formData.xp_reward}
              onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {formData.lesson_type === 'video' && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Video URL</label>
            <input
              type="text"
              value={formData.video_url || ''}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-gray-500 mt-1">YouTube, Vimeo, or direct video URL</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Content * 
            {formData.lesson_type === 'video' && <span className="text-gray-500 font-normal ml-1">(optional for video lessons)</span>}
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={12}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none font-mono text-sm"
            placeholder="# Main Topic&#10;&#10;Write your lesson content here...&#10;&#10;Use markdown for formatting:&#10;- **bold text**&#10;- *italic text*&#10;- ## Headings&#10;- [links](url)&#10;- Lists and more!"
          />
          <p className="text-xs text-gray-500 mt-1">✨ Supports Markdown formatting</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="lesson_published"
            checked={formData.is_published}
            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="lesson_published" className="text-sm font-bold text-gray-700 flex items-center gap-2">
            {formData.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
            Publish this lesson
          </label>
        </div>
      </div>

      <div className="flex gap-3 mt-6 sticky bottom-0 bg-white pt-4">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Save Lesson
        </button>
        <button
          onClick={onClose}
          className="px-8 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ModuleForm({ selectedItem, onClose, onSave }) {
  const [formData, setFormData] = useState(selectedItem || {
    title: '',
    description: '',
    category: 'Government Structure',
    difficulty: 'Beginner',
    icon: '🎓',
    iconType: 'emoji',
    imageUrl: '',
    status: 'draft',
    is_featured: false,
    estimated_duration: 30,
    xp_reward: 100,
    lessons: []
  });

  const [expandedLesson, setExpandedLesson] = useState(null);

  const categories = [
    'Government Structure', 'Electoral Systems', 'Political Influence',
    'Legislative Process', 'Constitutional Rights', 'Civic Participation',
    'Policy Making', 'Judicial System'
  ];

  const addLesson = () => {
    setFormData({
      ...formData,
      lessons: [
        ...formData.lessons,
        {
          id: Date.now(),
          title: '',
          description: '',
          lesson_type: 'text',
          content: '',
          video_url: '',
          duration_minutes: 15,
          xp_reward: 25,
          is_published: true,
          display_order: formData.lessons.length
        }
      ]
    });
    setExpandedLesson(formData.lessons.length);
  };

  const updateLesson = (index, field, value) => {
    const newLessons = [...formData.lessons];
    newLessons[index] = { ...newLessons[index], [field]: value };
    setFormData({ ...formData, lessons: newLessons });
  };

  const removeLesson = (index) => {
    if (!confirm('Remove this lesson?')) return;
    const newLessons = formData.lessons.filter((_, i) => i !== index);
    setFormData({ ...formData, lessons: newLessons });
  };

  const moveLessonUp = (index) => {
    if (index === 0) return;
    const newLessons = [...formData.lessons];
    [newLessons[index - 1], newLessons[index]] = [newLessons[index], newLessons[index - 1]];
    newLessons.forEach((lesson, i) => lesson.display_order = i);
    setFormData({ ...formData, lessons: newLessons });
  };

  const moveLessonDown = (index) => {
    if (index === formData.lessons.length - 1) return;
    const newLessons = [...formData.lessons];
    [newLessons[index], newLessons[index + 1]] = [newLessons[index + 1], newLessons[index]];
    newLessons.forEach((lesson, i) => lesson.display_order = i);
    setFormData({ ...formData, lessons: newLessons });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, iconType: 'image', imageUrl: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in title and description');
      return;
    }
    
    const totalXP = formData.lessons.reduce((sum, lesson) => sum + (parseInt(lesson.xp_reward) || 0), 0);
    const totalDuration = formData.lessons.reduce((sum, lesson) => sum + (parseInt(lesson.duration_minutes) || 0), 0);
    
    onSave({
      ...formData,
      xp_reward: totalXP,
      estimated_duration: totalDuration,
      total_lessons: formData.lessons.length
    });
  };

  return (
    <div className="p-8 overflow-y-auto max-h-[90vh]">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-4">
        <h2 className="text-3xl font-black">{selectedItem ? 'Edit' : 'Create'} Module</h2>
        <button onClick={onClose} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
          <X size={20} />
        </button>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 mb-6 border-2 border-blue-100">
        <h3 className="text-xl font-black mb-4">Module Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Understanding the Electoral College"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="A comprehensive guide to understanding how the Electoral College works"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Icon</label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setFormData({ ...formData, iconType: 'emoji' })}
                    className={`px-4 py-2 rounded-lg font-bold transition ${
                      formData.iconType === 'emoji' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Emoji
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, iconType: 'image' })}
                    className={`px-4 py-2 rounded-lg font-bold transition ${
                      formData.iconType === 'image' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Image
                  </button>
                </div>
                
                {formData.iconType === 'emoji' ? (
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center text-3xl"
                    maxLength={2}
                    placeholder="🎓"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="icon-upload"
                    />
                    <label
                      htmlFor="icon-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
                    >
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Icon" className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <>
                          <Upload size={24} className="text-gray-400" />
                          <span className="text-gray-600">Upload Image</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
              <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                {formData.iconType === 'emoji' ? (
                  <span className="text-4xl">{formData.icon || '🎓'}</span>
                ) : formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <ImageIcon size={32} className="text-gray-300" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_featured" className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Star size={16} />
              Feature this module
            </label>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Total XP and duration are calculated automatically from lessons: 
            <strong> {formData.lessons.reduce((sum, l) => sum + (parseInt(l.xp_reward) || 0), 0)} XP</strong>, 
            <strong> {formData.lessons.reduce((sum, l) => sum + (parseInt(l.duration_minutes) || 0), 0)} minutes</strong>
          </p>
        </div>
      </div>

      <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black">Lessons ({formData.lessons.length})</h3>
          <button
            onClick={addLesson}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg transition"
          >
            <Plus size={18} />
            Add Lesson
          </button>
        </div>

        {formData.lessons.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold">No lessons yet</p>
            <p className="text-sm">Add lessons to build your module content</p>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.lessons.map((lesson, idx) => (
              <div key={lesson.id} className="bg-white rounded-lg border-2 border-purple-200">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-50 transition"
                  onClick={() => setExpandedLesson(expandedLesson === idx ? null : idx)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-black">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">
                        {lesson.title || `Lesson ${idx + 1}`}
                      </h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {lesson.lesson_type}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {lesson.duration_minutes} min
                        </span>
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                          {lesson.xp_reward} XP
                        </span>
                        {lesson.is_published ? (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            Published
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveLessonUp(idx); }}
                      disabled={idx === 0}
                      className={`p-1 rounded ${idx === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <ChevronUp size={20} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveLessonDown(idx); }}
                      disabled={idx === formData.lessons.length - 1}
                      className={`p-1 rounded ${idx === formData.lessons.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <ChevronDown size={20} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeLesson(idx); }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {expandedLesson === idx && (
                  <div className="p-4 border-t-2 border-purple-100 space-y-4 bg-purple-25">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Lesson Title *</label>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => updateLesson(idx, 'title', e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        placeholder="Introduction to the Electoral College"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={lesson.description}
                        onChange={(e) => updateLesson(idx, 'description', e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        placeholder="Learn the basics..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                        <select
                          value={lesson.lesson_type}
                          onChange={(e) => updateLesson(idx, 'lesson_type', e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        >
                          <option value="text">Text</option>
                          <option value="video">Video</option>
                          <option value="interactive">Interactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Duration (min)</label>
                        <input
                          type="number"
                          value={lesson.duration_minutes}
                          onChange={(e) => updateLesson(idx, 'duration_minutes', e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">XP Reward</label>
                        <input
                          type="number"
                          value={lesson.xp_reward}
                          onChange={(e) => updateLesson(idx, 'xp_reward', e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {lesson.lesson_type === 'video' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Video URL</label>
                        <input
                          type="text"
                          value={lesson.video_url || ''}
                          onChange={(e) => updateLesson(idx, 'video_url', e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Content *</label>
                      <textarea
                        value={lesson.content}
                        onChange={(e) => updateLesson(idx, 'content', e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
                        placeholder="# Main Topic&#10;&#10;Write your lesson content here..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Supports Markdown formatting</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`lesson-published-${idx}`}
                        checked={lesson.is_published}
                        onChange={(e) => updateLesson(idx, 'is_published', e.target.checked)}
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor={`lesson-published-${idx}`} className="text-sm font-bold text-gray-700">
                        Publish this lesson
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6 sticky bottom-0 bg-white pt-4">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Save Module
        </button>
        <button
          onClick={onClose}
          className="px-8 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function QuizForm({ selectedItem, onClose, onSave, allModules }) {
  const [formData, setFormData] = useState(selectedItem || {
    title: '',
    description: '',
    quiz_type: 'trivia',
    module_id: null,
    lesson_id: null,
    difficulty: 'Beginner',
    category: 'Mixed',
    passing_score: 70,
    time_limit: 10,
    xp_reward: 50,
    is_published: false,
    questions: []
  });

  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          id: Date.now(),
          question_text: '',
          options: ['', '', '', ''],
          correct_answer_index: 0,
          explanation: '',
          points: 10
        }
      ]
    });
    setExpandedQuestion(formData.questions.length);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeQuestion = (index) => {
    if (!confirm('Remove this question?')) return;
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in title and description');
      return;
    }

    if (formData.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    for (let q of formData.questions) {
      if (!q.question_text) {
        alert('All questions must have text');
        return;
      }
      if (q.options.filter(o => o.trim()).length < 2) {
        alert('All questions must have at least 2 options');
        return;
      }
    }

    onSave(formData);
  };

  const selectedModule = allModules.find(m => m.id === formData.module_id);

  return (
    <div className="p-8 overflow-y-auto max-h-[90vh]">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-4">
        <h2 className="text-3xl font-black">{selectedItem ? 'Edit' : 'Create'} Quiz</h2>
        <button onClick={onClose} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
          <X size={20} />
        </button>
      </div>

      <div className="bg-purple-50 rounded-xl p-6 mb-6 border-2 border-purple-100">
        <h3 className="text-xl font-black mb-4">Quiz Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Electoral College Quiz"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Test your knowledge..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Quiz Type *</label>
            <select
              value={formData.quiz_type}
              onChange={(e) => setFormData({ ...formData, quiz_type: e.target.value, module_id: null, lesson_id: null })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option value="trivia">🎯 Trivia (Standalone)</option>
              <option value="module">📚 Module Quiz</option>
              <option value="lesson">📖 Lesson Quiz</option>
            </select>
          </div>

          {formData.quiz_type !== 'trivia' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {formData.quiz_type === 'module' ? 'Module *' : 'Module'}
              </label>
              <select
                value={formData.module_id || ''}
                onChange={(e) => setFormData({ ...formData, module_id: parseInt(e.target.value) || null, lesson_id: null })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="">-- Select Module --</option>
                {allModules.map(mod => (
                  <option key={mod.id} value={mod.id}>{mod.title}</option>
                ))}
              </select>
            </div>
          )}

          {formData.quiz_type === 'lesson' && formData.module_id && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Lesson *</label>
              <select
                value={formData.lesson_id || ''}
                onChange={(e) => setFormData({ ...formData, lesson_id: parseInt(e.target.value) || null })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="">-- Select Lesson --</option>
                {selectedModule?.lessons?.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Electoral Systems"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Time Limit (minutes)</label>
            <input
              type="number"
              value={formData.time_limit}
              onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Passing Score (%)</label>
            <input
              type="number"
              value={formData.passing_score}
              onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">XP Reward</label>
            <input
              type="number"
              value={formData.xp_reward}
              onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="quiz_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="quiz_published" className="text-sm font-bold text-gray-700 flex items-center gap-2">
              {formData.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
              Publish this quiz
            </label>
          </div>
        </div>
      </div>

      <div className="bg-pink-50 rounded-xl p-6 border-2 border-pink-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black">Questions ({formData.questions.length})</h3>
          <button
            onClick={addQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-bold hover:shadow-lg transition"
          >
            <Plus size={18} />
            Add Question
          </button>
        </div>

        {formData.questions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <HelpCircle size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold">No questions yet</p>
            <p className="text-sm">Add questions to create your quiz</p>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.questions.map((question, idx) => (
              <div key={question.id} className="bg-white rounded-lg border-2 border-pink-200">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-pink-50 transition"
                  onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white font-black">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">
                        {question.question_text || `Question ${idx + 1}`}
                      </h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                          {question.points} points
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {question.options.filter(o => o.trim()).length} options
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {expandedQuestion === idx && (
                  <div className="p-4 border-t-2 border-pink-100 space-y-4 bg-pink-25">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Question Text *</label>
                      <textarea
                        value={question.question_text}
                        onChange={(e) => updateQuestion(idx, 'question_text', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
                        placeholder="What is the question?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Answer Options *</label>
                      {question.options.map((option, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-3 mb-2">
                          <input
                            type="radio"
                            name={`correct-${idx}`}
                            checked={question.correct_answer_index === optIdx}
                            onChange={() => updateQuestion(idx, 'correct_answer_index', optIdx)}
                            className="w-5 h-5 text-green-600"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
                            placeholder={`Option ${optIdx + 1}`}
                          />
                          {question.correct_answer_index === optIdx && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-bold">
                              Correct
                            </span>
                          )}
                        </div>
                      ))}
                      <p className="text-xs text-gray-500 mt-2">Select the radio button for the correct answer</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Explanation</label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
                        placeholder="Explain why this is the correct answer..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Points</label>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(idx, 'points', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6 sticky bottom-0 bg-white pt-4">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Save Quiz
        </button>
        <button
          onClick={onClose}
          className="px-8 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function PathForm({ selectedItem, onClose, onSave, allModules }) {
  const [formData, setFormData] = useState(selectedItem || {
    title: '',
    description: '',
    category: 'General',
    difficulty: 'Beginner',
    estimated_hours: 10,
    icon: 'map',
    color: '#3B82F6',
    is_published: true,
    modules: []
  });

  const availableModules = allModules.filter(m => !formData.modules.includes(m.id));
  const selectedModules = allModules.filter(m => formData.modules.includes(m.id));

  const addModule = (moduleId) => {
    setFormData({
      ...formData,
      modules: [...formData.modules, moduleId]
    });
  };

  const removeModule = (moduleId) => {
    setFormData({
      ...formData,
      modules: formData.modules.filter(id => id !== moduleId)
    });
  };

  const moveModuleUp = (index) => {
    if (index === 0) return;
    const newModules = [...formData.modules];
    [newModules[index - 1], newModules[index]] = [newModules[index], newModules[index - 1]];
    setFormData({ ...formData, modules: newModules });
  };

  const moveModuleDown = (index) => {
    if (index === formData.modules.length - 1) return;
    const newModules = [...formData.modules];
    [newModules[index], newModules[index + 1]] = [newModules[index + 1], newModules[index]];
    setFormData({ ...formData, modules: newModules });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in title and description');
      return;
    }

    if (formData.modules.length === 0) {
      alert('Please add at least one module to this path');
      return;
    }

    onSave(formData);
  };

  const colors = [
    { value: '#3B82F6', label: 'Blue' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#10B981', label: 'Green' },
    { value: '#F59E0B', label: 'Orange' },
    { value: '#EF4444', label: 'Red' },
    { value: '#14B8A6', label: 'Teal' }
  ];

  return (
    <div className="p-8 overflow-y-auto max-h-[90vh]">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-4">
        <h2 className="text-3xl font-black">{selectedItem ? 'Edit' : 'Create'} Learning Path</h2>
        <button onClick={onClose} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
          <X size={20} />
        </button>
      </div>

      <div className="bg-emerald-50 rounded-xl p-6 mb-6 border-2 border-emerald-100">
        <h3 className="text-xl font-black mb-4">Path Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              placeholder="Civic Fundamentals"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              placeholder="Essential knowledge for engaged citizens"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              placeholder="General"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Hours</label>
            <input
              type="number"
              value={formData.estimated_hours}
              onChange={(e) => setFormData({ ...formData, estimated_hours: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Color</label>
            <div className="flex gap-2">
              {colors.map(color => (
                <button
                  key={color.value}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-10 h-10 rounded-lg transition ${
                    formData.color === color.value ? 'ring-4 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="path_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="path_published" className="text-sm font-bold text-gray-700 flex items-center gap-2">
              {formData.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
              Publish this learning path
            </label>
          </div>
        </div>
      </div>

      <div className="bg-teal-50 rounded-xl p-6 border-2 border-teal-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black">Modules in Path ({formData.modules.length})</h3>
        </div>

        {selectedModules.length > 0 ? (
          <div className="space-y-3 mb-6">
            {selectedModules.map((module, idx) => (
              <div key={module.id} className="bg-white rounded-lg p-4 border-2 border-teal-200 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-black">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{module.icon}</span>
                      <h4 className="font-bold text-gray-900">{module.title}</h4>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {module.total_lessons} lessons
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {module.estimated_duration} min
                      </span>
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                        {module.xp_reward} XP
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveModuleUp(idx)}
                    disabled={idx === 0}
                    className={`p-2 rounded ${idx === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <ChevronUp size={20} />
                  </button>
                  <button
                    onClick={() => moveModuleDown(idx)}
                    disabled={idx === selectedModules.length - 1}
                    className={`p-2 rounded ${idx === selectedModules.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <ChevronDown size={20} />
                  </button>
                  <button
                    onClick={() => removeModule(module.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 mb-6">
            <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold">No modules added</p>
            <p className="text-sm">Add modules to create the learning path</p>
          </div>
        )}

        {availableModules.length > 0 && (
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-3">Available Modules</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableModules.map(module => (
                <div key={module.id} className="bg-white rounded-lg p-3 border border-gray-200 flex items-center justify-between hover:border-emerald-300 transition">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{module.icon}</span>
                    <div>
                      <h5 className="font-bold text-gray-900 text-sm">{module.title}</h5>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {module.total_lessons} lessons
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {module.estimated_duration} min
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => addModule(module.id)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-bold hover:shadow-lg transition text-sm"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {availableModules.length === 0 && selectedModules.length > 0 && (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">All modules have been added to this path</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6 sticky bottom-0 bg-white pt-4">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Save Learning Path
        </button>
        <button
          onClick={onClose}
          className="px-8 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}