import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ModuleBuilder from './ModuleBuilder';
import LessonEditor from './LessonEditor';
import QuizBuilder from './QuizBuilder';
import PublishingWorkflow from './PublishingWorkflow';


// Enhanced Styled Components with better UX/UI
const AdminContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 0;
`;

const AdminHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`;

const AdminTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
  z-index: 1;
`;

const AdminSubtitle = styled.p`
  font-size: 0.95rem;
  opacity: 0.95;
  margin-bottom: 20px;
  font-weight: 400;
  position: relative;
  z-index: 1;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 12px 25px rgba(0,0,0,0.1);
  }
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 6px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const AdminTabs = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
`;

const ContentArea = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
  min-height: 400px;
`;

const WorkflowProgress = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e1e8ed;
`;

const ProgressSteps = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
`;

const ProgressStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const StepIndicator = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  background: ${props => {
    if (props.completed) return '#10b981';
    if (props.current) return '#667eea';
    return '#e5e7eb';
  }};
  color: ${props => props.completed || props.current ? 'white' : '#6b7280'};
  border: 2px solid ${props => {
    if (props.completed) return '#10b981';
    if (props.current) return '#667eea';
    return '#d1d5db';
  }};
`;

const StepLabel = styled.span`
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #667eea);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ProgressModal = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid #e1e8ed;
  z-index: 9999;
  max-width: 500px;
  width: 90%;
  text-align: center;
  
  /* Ensure it's always visible */
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(4px);
  
  /* Ensure full coverage */
  width: 100vw;
  height: 100vh;
  
  /* Better positioning for mobile */
  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
  }
`;

const ProgressHeader = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px 0;
`;

const ModalProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 24px;
`;

const ModalProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #667eea);
  width: ${props => props.progress}%;
  transition: width 0.8s ease;
`;

const ModalProgressSteps = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 24px;
`;

const ModalStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  opacity: ${props => props.completed ? 1 : props.current ? 1 : 0.4};
`;

const ModalStepIcon = styled.div`
  font-size: 20px;
  opacity: ${props => props.completed ? 1 : props.current ? 1 : 0.6};
`;

const ModalStepText = styled.span`
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  font-weight: 500;
`;

const NextStepGuide = styled.div`
  background: rgba(102, 126, 234, 0.1);
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  margin-bottom: 24px;
`;

const NextStepText = styled.p`
  font-size: 14px;
  color: #374151;
  margin: 0 0 12px 0;
  font-weight: 500;
`;

const ContinueButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
`;

const SkipButton = styled.button`
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const WelcomeMessage = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #e1e8ed;
  margin-bottom: 24px;
`;

const WelcomeIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const WelcomeTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
`;

const WelcomeText = styled.p`
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.5;
  max-width: 500px;
  margin: 0 auto;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const ActionCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  border: 1px solid #e1e8ed;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.12);
  }
`;

const ActionIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ActionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const ActionDescription = styled.p`
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [workflowStage, setWorkflowStage] = useState('planning'); // planning, building, lessons, quiz, review, published
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressModalData, setProgressModalData] = useState(null);
  const [isBuildingMode, setIsBuildingMode] = useState(false); // New: Toggle between building and editing modes
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loadingPendingPosts, setLoadingPendingPosts] = useState(false);
  const navigate = useNavigate();

  // Function to display progress modal
  const displayProgressModal = (stage, progress, message, nextStep) => {
    const normalizedNextTab = nextStep === 'quiz' || nextStep === 'quiz_builder' ? 'quizzes' : nextStep;
    const modalData = {
      stage,
      progress,
      message,
      nextStep,
      nextTab: normalizedNextTab,
      steps: [
        { key: 'planning', label: 'Planning', icon: '📝', completed: progress >= 25, current: stage === 'planning' },
        { key: 'building', label: 'Module', icon: '🏗️', completed: progress >= 50, current: stage === 'building' },
        { key: 'lessons', label: 'Lessons', icon: '📚', completed: progress >= 75, current: stage === 'lessons' },
        { key: 'quiz', label: 'Quiz', icon: '🧠', completed: progress >= 90, current: stage === 'quiz' },
        { key: 'published', label: 'Published', icon: '🚀', completed: progress >= 100, current: stage === 'published' }
      ]
    };
    setProgressModalData(modalData);
    setShowProgressModal(true);
    setWorkflowStage(stage);
  };

  // Function to close progress modal
  const closeProgressModal = () => {
    setShowProgressModal(false);
    setProgressModalData(null);
  };

  // Moderation functions
  const handleVerifyPost = async (postId) => {
    try {
      await api.put(`/admin/posts/${postId}/verify`, {
        uuid: 'admin-user', // Use admin UUID for moderation
        action: 'verify'
      });
      toast.success('Post verified successfully! ✅');
      refetchPendingPosts();
    } catch (error) {
      console.error('Error verifying post:', error);
      toast.error('Failed to verify post');
    }
  };

  const handleRejectPost = async (postId) => {
    try {
      await api.put(`/admin/posts/${postId}/verify`, {
        uuid: 'admin-user', // Use admin UUID for moderation
        action: 'reject'
      });
      toast.success('Post rejected successfully! ❌');
      refetchPendingPosts();
    } catch (error) {
      console.error('Error rejecting post:', error);
      toast.error('Failed to reject post');
    }
  };

  const queryClient = useQueryClient();

      // Enhanced tab configuration with workflow stages
    const tabs = [
      { key: 'overview', label: 'Dashboard', icon: '📊' },
      { key: 'moderation', label: 'Moderation', icon: '🛡️' },
      { key: 'builder', label: 'Module', icon: '🏗️' },
      { key: 'lessons', label: 'Lessons', icon: '📚' },
      { key: 'quizzes', label: 'Quiz', icon: '🧠' },
      { key: 'publishing', label: 'Publish', icon: '🚀' },
      { key: 'analytics', label: 'Analytics', icon: '📈' },
      { key: 'templates', label: 'Templates', icon: '📋' }
    ];

  // Enhanced queries with better error handling
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    ['admin-dashboard-overview'],
    () => api.get('/admin/dashboard/overview').then(res => res.data),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      staleTime: 10000,
    }
  );



  // Fetch existing learning modules for editing
  const { data: existingModules, isLoading: existingModulesLoading } = useQuery(
    ['admin-learning-modules'],
    () => api.get('/admin/learning-modules').then(res => res.data),
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  const { data: categories, isLoading: categoriesLoading } = useQuery(
    ['admin-categories'],
    () => api.get('/admin/categories').then(res => res.data),
    {
      staleTime: 300000, // 5 minutes
    }
  );

  const { data: difficulties, isLoading: difficultiesLoading } = useQuery(
    ['admin-difficulties'],
    () => api.get('/admin/difficulties').then(res => res.data),
    {
      staleTime: 300000, // 5 minutes
    }
  );

  // Fetch pending posts for moderation
  const { data: pendingPostsData, isLoading: pendingPostsLoading, refetch: refetchPendingPosts } = useQuery(
    ['admin-pending-posts'],
    () => api.get('/admin/pending-posts').then(res => res.data),
    {
      refetchInterval: 60000, // Refresh every minute
      onSuccess: (data) => setPendingPosts(data || []),
      onError: (error) => {
        console.error('Failed to fetch pending posts:', error);
        toast.error('Failed to load pending posts');
      }
    }
  );

  // Enhanced mutations
  const createModuleMutation = useMutation(
    (moduleData) => {
      console.log('=== createModuleMutation executing ===');
      console.log('Sending moduleData to API:', moduleData);
      console.log('API endpoint: /admin/learning-modules');
      
      return api.post('/admin/learning-modules', moduleData);
    },
    {
      onSuccess: (data) => {
        console.log('=== Module Creation Success ===');
        console.log('API response data:', data);
        console.log('Response type:', typeof data);
        console.log('Response keys:', Object.keys(data || {}));
        
        toast.success('🎉 Module created successfully!');
        queryClient.invalidateQueries(['admin-learning-modules']);
        queryClient.invalidateQueries(['admin-dashboard-overview']);
        
        // Extract module ID from response - handle different response structures
        const moduleId = data?.id || data?.moduleId || data?.data?.id || data?.data?.moduleId;
        console.log('Extracted moduleId:', moduleId);
        
        if (moduleId) {
          console.log('Setting selectedModule to:', moduleId);
          setSelectedModule(moduleId);
          setActiveTab('builder');
          
          // Show progress modal after module creation
          setTimeout(() => {
            displayProgressModal('building', 50, 'Add your first lesson', 'lessons');
          }, 500);
        } else {
          console.warn('Module created but no ID returned:', data);
          // Refresh the modules list to get the new module
          queryClient.invalidateQueries(['admin-learning-modules']);
        }
      },
      onError: (error) => {
        console.error('=== Module Creation Error ===');
        console.error('Error details:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.message);
        
        toast.error('❌ Failed to create module. Please try again.');
      }
    }
  );

  const updateModuleMutation = useMutation(
    ({ moduleId, data }) => {
      console.log('updateModuleMutation called with:', { moduleId, data });
      return api.put(`/admin/learning-modules/${moduleId}`, data);
    },
    {
      onSuccess: (result) => {
        console.log('Module update successful:', result);
        toast.success('✅ Module updated successfully!');
        queryClient.invalidateQueries(['admin-learning-modules']);
        queryClient.invalidateQueries(['admin-dashboard-overview']);
      },
      onError: (error) => {
        console.error('Error updating module:', error);
        toast.error('❌ Failed to update module. Please try again.');
      }
    }
  );

  const deleteModuleMutation = useMutation(
    (moduleId) => api.delete(`/admin/learning-modules/${moduleId}`),
    {
      onSuccess: () => {
        toast.success('🗑️ Module deleted successfully!');
        queryClient.invalidateQueries(['admin-learning-modules']);
        queryClient.invalidateQueries(['admin-dashboard-overview']);
        setSelectedModule(null);
        setActiveTab('overview');
      },
      onError: (error) => {
        console.error('Error deleting module:', error);
        toast.error('❌ Failed to delete module. Please try again.');
      }
    }
  );

  // Enhanced handlers
  const handleCreateModule = (formData) => {
    console.log('=== handleCreateModule called ===');
    console.log('formData received:', formData);
    
    // Use the form data from ModuleBuilder, or fallback to defaults
    const moduleData = formData || {
      title: 'New Learning Module',
      description: 'Enter module description here...',
      icon: '📚',
      difficulty: 'beginner',
      xp_reward: 50,
      estimated_duration: 120,
      category: 'General',
      tags: ['civic-education', 'kenya']
    };
    
    console.log('moduleData to be sent:', moduleData);
    console.log('About to call createModuleMutation.mutate...');

    // Enter building mode when creating a new module
    setIsBuildingMode(true);
    
    // Call the mutation
    createModuleMutation.mutate(moduleData);
    
    console.log('createModuleMutation.mutate called');
  };

  // Add event listener for tab switching from child components
  useEffect(() => {
    const handleSwitchToModuleTab = () => {
      setActiveTab('builder');
      toast.success('📝 Switched to Module Builder');
    };

    const handleSwitchToQuizTab = () => {
      setActiveTab('quizzes');
      toast.success('🧠 Switched to Quiz Builder');
    };

    const handleShowProgressModal = (event) => {
      const { stage, message, nextStep, progress } = event.detail;
      const normalizedNext = nextStep === 'quiz' || nextStep === 'quiz_builder' ? 'quizzes' : nextStep;
      displayProgressModal(stage, progress ?? 75, message, normalizedNext);
    };

    window.addEventListener('switchToModuleTab', handleSwitchToModuleTab);
    window.addEventListener('switchToQuizTab', handleSwitchToQuizTab);
    window.addEventListener('showProgressModal', handleShowProgressModal);
    
    return () => {
      window.removeEventListener('switchToModuleTab', handleSwitchToModuleTab);
      window.removeEventListener('switchToQuizTab', handleSwitchToQuizTab);
      window.removeEventListener('showProgressModal', handleShowProgressModal);
    };
  }, []);

  const handleModuleSelect = (module) => {
    setSelectedModule(module.id);
    setActiveTab('builder');
  };

  // Workflow management functions
  const getWorkflowProgress = (moduleId) => {
    if (!moduleId) return { stage: 'planning', progress: 0, steps: [] };
    
    // This would be calculated based on actual module data
    // For now, return a mock progress
    return {
      stage: 'building',
      progress: 60,
      steps: [
        { key: 'planning', label: 'Planning', completed: true, current: false },
        { key: 'building', label: 'Module', completed: false, current: true },
        { key: 'lessons', label: 'Lessons', completed: false, current: false },
        { key: 'quiz', label: 'Quiz', completed: false, current: false },
        { key: 'review', label: 'Review', completed: false, current: false },
        { key: 'published', label: 'Published', completed: false, current: false }
      ]
    };
  };



  const handleContinueToNextStep = () => {
    if (progressModalData?.nextTab) {
      setActiveTab(progressModalData.nextTab);
      setShowProgressModal(false);
      setProgressModalData(null);
    }
  };

  const handleSkipProgressModal = () => {
    setShowProgressModal(false);
    setProgressModalData(null);
  };

  const canNavigateToTab = (tabKey, moduleId) => {
    if (isBuildingMode) {
      // Building mode: all tabs accessible for creating new content
      return true;
    } else {
      // Editing mode: need module selection for existing content
      if (!moduleId) {
        // For new modules, only allow planning and building
        return ['overview', 'builder'].includes(tabKey);
      }
      
      // For existing modules, allow all tabs
      return true;
    }
  };

  const handleTabClick = (tabKey) => {
    if (canNavigateToTab(tabKey, selectedModule)) {
      setActiveTab(tabKey);
    } else {
      toast.success('💡 Please complete the current stage before moving to the next one.');
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'create-module':
        setSelectedModule(null); // Clear selected module to enter "create mode"
        setActiveTab('builder'); // Open ModuleBuilder with empty form
        setWorkflowStage('planning');
        break;
      case 'view-modules':
        setActiveTab('builder');
        break;
      case 'manage-lessons':
        if (selectedModule) {
          setActiveTab('lessons');
        } else {
          toast.success('💡 Please select a module first to manage its lessons.');
        }
        break;
      case 'build-quiz':
        if (selectedModule) {
          setActiveTab('quizzes');
        } else {
          toast.success('💡 Please select a module first to build its quiz.');
        }
        break;
      default:
        break;
    }
  };

  // Loading state
  if (dashboardLoading || existingModulesLoading) {
    return (
      <AdminContainer>
        <AdminHeader>
          <AdminTitle>🛠️ Admin Dashboard</AdminTitle>
          <AdminSubtitle>Loading your workspace...</AdminSubtitle>
        </AdminHeader>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <AdminHeader>
        <AdminTitle>🛠️ Admin Dashboard</AdminTitle>
        <AdminSubtitle>Create, manage, and publish amazing learning content</AdminSubtitle>
        
                 <StatsGrid>
           <StatCard
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
           >
             <StatValue>{dashboardData?.total_modules || 0}</StatValue>
             <StatLabel>Total Modules</StatLabel>
           </StatCard>
           
           <StatCard
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
           >
             <StatValue>{dashboardData?.published_modules || 0}</StatValue>
             <StatLabel>Published</StatLabel>
           </StatCard>
           
           <StatCard
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
           >
             <StatValue>{dashboardData?.total_lessons || 0}</StatValue>
             <StatLabel>Total Lessons</StatLabel>
           </StatCard>
           
           <StatCard
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
           >
             <StatValue>{dashboardData?.total_quizzes || 0}</StatValue>
             <StatLabel>Total Quizzes</StatLabel>
           </StatCard>
         </StatsGrid>
      </AdminHeader>

      {/* Navigation Tabs - Only show when editing existing modules */}
      {selectedModule && !isBuildingMode && (
        <AdminTabs>
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '12px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            🎯 <span>Editing: {existingModules?.find(m => m.id === selectedModule)?.title || 'Loading...'}</span>
            <button
              onClick={() => {
                setSelectedModule(null);
                setActiveTab('overview');
                setIsBuildingMode(false); // Exit editing mode
                toast.success('✅ Returned to overview');
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer',
                marginLeft: '8px'
              }}
            >
              ✕ Exit
            </button>
          </div>
          
          {/* Tab Dropdown */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              position: 'relative',
              minWidth: '200px'
            }}>
              <select
                value={activeTab}
                onChange={(e) => handleTabClick(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e293b',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px'
                }}
              >
                {tabs.map((tab) => (
                  <option key={tab.key} value={tab.key}>
                    {tab.icon} {tab.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </AdminTabs>
      )}

      {/* Building Mode Tabs - Show when in building mode (regardless of module selection) */}
      {isBuildingMode && (
        <AdminTabs>
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '12px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            🚀 <span>Building New Content</span>
            <button
              onClick={() => {
                setIsBuildingMode(false);
                setSelectedModule(null);
                setActiveTab('overview');
                toast.success('✅ Switched to editing mode');
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer',
                marginLeft: '8px'
              }}
            >
              ✕ Exit Building
            </button>
          </div>
          
          {/* Workflow Stage Indicator */}
          <div style={{
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            color: '#667eea',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            marginBottom: '12px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            📋 <span>Current Stage: {workflowStage.charAt(0).toUpperCase() + workflowStage.slice(1)}</span>
          </div>
          
          {/* Tab Dropdown */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              position: 'relative',
              minWidth: '200px'
            }}>
              <select
                value={activeTab}
                onChange={(e) => handleTabClick(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e293b',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px'
                }}
              >
                {tabs.map((tab) => (
                  <option key={tab.key} value={tab.key}>
                    {tab.icon} {tab.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </AdminTabs>
      )}

      <ContentArea>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WelcomeMessage>
                <WelcomeIcon>🎯</WelcomeIcon>
                <WelcomeTitle>Welcome to Your Learning Content Studio!</WelcomeTitle>
                <WelcomeText>
                  You're all set to create amazing educational content. Choose your workflow below to get started.
                </WelcomeText>
              </WelcomeMessage>

              {/* Workflow Selection */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>
                {/* Building Mode Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                }}
                onClick={() => {
                  setIsBuildingMode(true);
                  setActiveTab('builder');
                  toast.success('🚀 Entered building mode - create content from scratch!');
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.3)';
                }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚀</div>
                  <h3 style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: '700', 
                    marginBottom: '12px'
                  }}>
                    Build New Content
                  </h3>
                  <p style={{ 
                    fontSize: '0.95rem', 
                    opacity: 0.9,
                    lineHeight: '1.5',
                    marginBottom: '16px'
                  }}>
                    Create modules, lessons, and quizzes from scratch. 
                    Jump directly to any step in the content creation process.
                  </p>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    Start Building →
                  </div>
                </div>

                {/* Editing Mode Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
                }}
                onClick={() => {
                  setIsBuildingMode(false);
                  setActiveTab('overview');
                  toast.success('✏️ Entered editing mode - select a module to edit!');
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
                }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✏️</div>
                  <h3 style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: '700', 
                    marginBottom: '12px'
                  }}>
                    Edit Existing Content
                  </h3>
                  <p style={{ 
                    fontSize: '0.95rem', 
                    opacity: 0.9,
                    lineHeight: '1.5',
                    marginBottom: '16px'
                  }}>
                    Select and modify existing modules, lessons, and quizzes. 
                    Perfect for improving and updating your content.
                  </p>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    Start Editing →
                  </div>
                </div>
              </div>

              {/* Workflow Progress Indicator */}
              {selectedModule && (
                <WorkflowProgress>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                    📋 Module Progress: {existingModules?.find(m => m.id === selectedModule)?.title || 'Loading...'}
                  </h4>
                  <ProgressSteps>
                    {getWorkflowProgress(selectedModule).steps.map((step, index) => (
                      <ProgressStep key={step.key}>
                        <StepIndicator 
                          completed={step.completed} 
                          current={step.current}
                        >
                          {step.completed ? '✓' : step.current ? '●' : (index + 1)}
                        </StepIndicator>
                        <StepLabel>{step.label}</StepLabel>
                      </ProgressStep>
                    ))}
                  </ProgressSteps>
                  <ProgressBar>
                    <ProgressFill progress={getWorkflowProgress(selectedModule).progress} />
                  </ProgressBar>
                  <p style={{ 
                    margin: '12px 0 0 0', 
                    fontSize: '13px', 
                    color: '#6b7280',
                    textAlign: 'center'
                  }}>
                    {getWorkflowProgress(selectedModule).progress}% Complete
                  </p>
                </WorkflowProgress>
              )}

              <QuickActions>
                <ActionCard
                  onClick={() => handleQuickAction('create-module')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ActionIcon>🏗️</ActionIcon>
                  <ActionTitle>Create New Module</ActionTitle>
                  <ActionDescription>
                    Start building a new learning module from scratch with our intuitive builder
                  </ActionDescription>
                </ActionCard>

                <ActionCard
                  onClick={() => handleQuickAction('view-modules')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ActionIcon>📚</ActionIcon>
                  <ActionTitle>Manage Modules</ActionTitle>
                  <ActionDescription>
                    View, edit, and organize your existing learning modules
                  </ActionDescription>
                </ActionCard>

                <ActionCard
                  onClick={() => handleQuickAction('manage-lessons')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ActionIcon>✏️</ActionIcon>
                  <ActionTitle>Edit Lessons</ActionTitle>
                  <ActionDescription>
                    Fine-tune individual lessons and add rich media content
                  </ActionDescription>
                </ActionCard>

                <ActionCard
                  onClick={() => handleQuickAction('build-quiz')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ActionIcon>🧠</ActionIcon>
                  <ActionTitle>Build Quizzes</ActionTitle>
                  <ActionDescription>
                    Create engaging assessments to test learner knowledge
                  </ActionDescription>
                </ActionCard>
              </QuickActions>

                             

               {/* Existing Learning Modules Section */}
               {existingModules && existingModules.length > 0 && (
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.6 }}
                 >
                   <h3 style={{ 
                     fontSize: '1.2rem', 
                     fontWeight: '700', 
                     color: '#1e293b',
                     marginBottom: '16px',
                     textAlign: 'center'
                   }}>
                     📚 Your Learning Modules
                   </h3>
                   <p style={{
                     fontSize: '0.9rem',
                     color: '#64748b',
                     textAlign: 'center',
                     marginBottom: '20px',
                     maxWidth: '600px',
                     margin: '0 auto 20px'
                   }}>
                                           Click any module to edit its content, lessons, and settings. All changes will be reflected in your learning platform.
                   </p>
                   <div style={{
                     display: 'grid',
                     gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                     gap: '16px'
                   }}>
                     {existingModules.slice(0, 6).map((module) => (
                       <motion.div
                         key={module.id}
                         style={{
                           background: 'white',
                           borderRadius: '12px',
                           padding: '20px',
                           boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                           border: '1px solid #e1e8ed',
                           cursor: 'pointer',
                           position: 'relative'
                         }}
                         whileHover={{ y: -3, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
                         onClick={() => handleModuleSelect(module)}
                       >
                         {module.is_featured && (
                           <div style={{
                             position: 'absolute',
                             top: '12px',
                             right: '12px',
                             background: '#fbbf24',
                             color: 'white',
                             padding: '4px 8px',
                             borderRadius: '12px',
                             fontSize: '0.7rem',
                             fontWeight: '600'
                           }}>
                             ⭐ Featured
                           </div>
                         )}
                         <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{module.icon}</div>
                         <h4 style={{ 
                           fontSize: '1rem', 
                           fontWeight: '600', 
                           color: '#1e293b',
                           marginBottom: '6px'
                         }}>
                           {module.title}
                         </h4>
                         <p style={{ 
                           fontSize: '0.85rem', 
                           color: '#64748b',
                           marginBottom: '10px',
                           lineHeight: '1.4'
                         }}>
                           {module.description?.substring(0, 80)}...
                         </p>
                         <div style={{
                           display: 'flex',
                           gap: '6px',
                           flexWrap: 'wrap',
                           marginBottom: '12px'
                         }}>
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               displayProgressModal('building', 70, 'Module Progress', 'lessons');
                             }}
                             style={{
                               background: 'linear-gradient(135deg, #667eea, #764ba2)',
                               color: 'white',
                               border: 'none',
                               padding: '4px 8px',
                               borderRadius: '6px',
                               fontSize: '0.7rem',
                               fontWeight: '500',
                               cursor: 'pointer'
                             }}
                           >
                             📊 Progress
                           </button>
                           <span style={{
                             padding: '3px 8px',
                             borderRadius: '8px',
                             fontSize: '0.75rem',
                             fontWeight: '600',
                             background: '#f1f5f9',
                             color: '#475569'
                           }}>
                             {module.difficulty}
                           </span>
                           <span style={{
                             padding: '3px 8px',
                             borderRadius: '8px',
                             fontSize: '0.75rem',
                             fontWeight: '600',
                             background: '#dbeafe',
                             color: '#1d4ed8'
                           }}>
                             {module.xp_reward} XP
                           </span>
                           <span style={{
                             padding: '3px 8px',
                             borderRadius: '8px',
                             fontSize: '0.75rem',
                             fontWeight: '600',
                             background: '#dcfce7',
                             color: '#059669'
                           }}>
                             {module.category}
                           </span>
                         </div>
                         
                         {/* Module Actions */}
                         <div style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                           marginTop: '12px'
                         }}>
                           <button
                             style={{
                               background: 'linear-gradient(135deg, #667eea, #764ba2)',
                               color: 'white',
                               border: 'none',
                               padding: '6px 12px',
                               borderRadius: '6px',
                               fontSize: '0.7rem',
                               fontWeight: '600',
                               cursor: 'pointer'
                             }}
                             onClick={(e) => {
                               e.stopPropagation();
                               handleModuleSelect(module);
                             }}
                           >
                             ✏️ Edit
                           </button>
                           
                           <button
                             style={{
                               background: '#dc2626',
                               color: 'white',
                               border: 'none',
                               padding: '6px 12px',
                               borderRadius: '6px',
                               fontSize: '0.7rem',
                               fontWeight: '600',
                               cursor: 'pointer'
                             }}
                             onClick={(e) => {
                               e.stopPropagation();
                               if (window.confirm(`Are you sure you want to delete "${module.title}"? This action cannot be undone.`)) {
                                 deleteModuleMutation.mutate(module.id);
                               }
                             }}
                           >
                             🗑️ Delete
                           </button>
                         </div>
                         
                         <div style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                           fontSize: '0.75rem',
                           color: '#64748b',
                           marginTop: '8px'
                         }}>
                           <span>📅 {new Date(module.created_at).toLocaleDateString()}</span>
                           <span>⏱️ {module.estimated_duration} min</span>
                         </div>
                       </motion.div>
                     ))}
                   </div>
                   {existingModules.length > 6 && (
                     <div style={{ textAlign: 'center', marginTop: '20px' }}>
                       <button
                         style={{
                           background: 'linear-gradient(135deg, #667eea, #764ba2)',
                           color: 'white',
                           border: 'none',
                           padding: '12px 24px',
                           borderRadius: '8px',
                           fontSize: '0.9rem',
                           fontWeight: '600',
                           cursor: 'pointer'
                         }}
                         onClick={() => setActiveTab('builder')}
                       >
                                                   View All ({existingModules.length})
                       </button>
                     </div>
                   )}
                 </motion.div>
               )}
            </motion.div>
          )}

          {activeTab === 'moderation' && (
            <motion.div
              key="moderation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                border: '1px solid #e1e8ed'
              }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
                  🛡️ Content Moderation
                </h2>
                
                {/* Pending Posts Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
                    Pending Posts ({pendingPosts.length || 0})
                  </h3>
                  
                  {pendingPostsLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="loading-spinner" style={{ margin: '0 auto' }} />
                      <p>Loading pending posts...</p>
                    </div>
                  ) : pendingPosts.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px', 
                      background: '#f9fafb', 
                      borderRadius: '16px',
                      border: '2px dashed #d1d5db'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                      <h4 style={{ color: '#374151', marginBottom: '8px' }}>No pending posts</h4>
                      <p style={{ color: '#6b7280' }}>All posts have been reviewed and moderated.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {pendingPosts.map((post) => (
                        <div key={post.id} style={{
                          background: '#f9fafb',
                          border: '1px solid #e1e8ed',
                          borderRadius: '12px',
                          padding: '20px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                                {post.title}
                              </h4>
                              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>
                                By: {post.nickname || 'Anonymous'} • {post.type} • {post.county}
                              </p>
                              <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: '1.5' }}>
                                {post.content?.substring(0, 150)}...
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleVerifyPost(post.id)}
                                style={{
                                  padding: '8px 16px',
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                              >
                                ✅ Verify
                              </button>
                              <button
                                onClick={() => handleRejectPost(post.id)}
                                style={{
                                  padding: '8px 16px',
                                  padding: '8px 16px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                              >
                                ❌ Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'builder' && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ModuleBuilder
                moduleId={selectedModule}
                onCreateModule={handleCreateModule}
                onUpdateModule={updateModuleMutation.mutate}
                onDeleteModule={deleteModuleMutation.mutate}
                categories={categories || []}
                difficulties={difficulties || []}
                isBuildingMode={isBuildingMode}
              />
            </motion.div>
          )}

          {activeTab === 'lessons' && (
            <motion.div
              key="lessons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LessonEditor
                moduleId={selectedModule}
                selectedLesson={selectedLesson}
                onLessonSelect={setSelectedLesson}
                isBuildingMode={isBuildingMode}
              />
            </motion.div>
          )}

          {activeTab === 'quizzes' && (
            <motion.div
              key="quizzes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QuizBuilder 
                moduleId={selectedModule} 
                isBuildingMode={isBuildingMode}
              />
            </motion.div>
          )}

          {activeTab === 'publishing' && (
            <motion.div
              key="publishing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PublishingWorkflow 
                moduleId={selectedModule} 
                isBuildingMode={isBuildingMode}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '40px',
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                border: '1px solid #e1e8ed'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '24px' }}>📊</div>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
                  Content Analytics
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: '1.6' }}>
                  Detailed analytics and performance metrics coming soon! 
                  Track engagement, completion rates, and learner progress.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '40px',
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                border: '1px solid #e1e8ed'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '24px' }}>📋</div>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
                  Content Templates
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: '1.6' }}>
                  Pre-built templates and content structures coming soon! 
                  Save time with reusable lesson formats and quiz patterns.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ContentArea>

      {/* Progress Modal */}
      {showProgressModal && progressModalData && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeProgressModal}
        >
          <ProgressModal
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ProgressHeader>📋 Module Creation Progress</ProgressHeader>
            
            <ModalProgressBar>
              <ModalProgressFill progress={progressModalData.progress} />
            </ModalProgressBar>
            
            <ModalProgressSteps>
              {progressModalData.steps.map((step, index) => (
                <ModalStep key={step.key} completed={step.completed} current={step.current}>
                  <ModalStepIcon>{step.icon}</ModalStepIcon>
                  <ModalStepText>{step.label}</ModalStepText>
                </ModalStep>
              ))}
            </ModalProgressSteps>
            
            <NextStepGuide>
              <NextStepText>
                <strong>Next Step:</strong> {progressModalData.nextStep}
              </NextStepText>
            </NextStepGuide>
            
            <ContinueButton onClick={handleContinueToNextStep}>
              Continue to {progressModalData.nextTab === 'lessons' ? 'Lessons' : 
                          progressModalData.nextTab === 'quizzes' ? 'Quiz' : 
                          progressModalData.nextTab === 'publishing' ? 'Publishing' : 'Next Step'} →
            </ContinueButton>
            
            <SkipButton onClick={closeProgressModal}>
              Skip for now
            </SkipButton>
          </ProgressModal>
        </ModalOverlay>
      )}
    </AdminContainer>
  );
};

export default AdminDashboard;

