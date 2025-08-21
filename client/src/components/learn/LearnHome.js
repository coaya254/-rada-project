import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useEnhancedUser } from '../../contexts/EnhancedUserContext';
import api from '../../utils/api';

const LearnContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--light-bg);
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #4caf50, #81c784);
  color: white;
  padding: 24px 20px;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
`;

const HeroSubtitle = styled.p`
  opacity: 0.9;
  font-size: 16px;
  margin-bottom: 20px;
`;

const TabsContainer = styled.div`
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;

const Tab = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid ${props => props.active ? '#4caf50' : 'var(--light-border)'};
  background: ${props => props.active ? '#4caf50' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
`;

const LearnHome = () => {
  const { user, awardXP  } = useEnhancedUser();
  const [activeTab, setActiveTab] = useState('modules');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // API calls to get real data
  const { data: modules, isLoading: modulesLoading } = useQuery(
    'learning-modules', 
    () => api.get('/learning/modules').then(res => res.data),
    {
      onError: (error) => {
        console.error('Error fetching modules:', error);
        toast.error('Failed to load modules');
      }
    }
  );

  const { data: challenges, isLoading: challengesLoading } = useQuery(
    'learning-challenges', 
    () => api.get('/learning/challenges').then(res => res.data),
    {
      onError: (error) => {
        console.error('Error fetching challenges:', error);
        toast.error('Failed to load challenges');
      }
    }
  );

  const { data: badges, isLoading: badgesLoading } = useQuery(
    'learning-badges', 
    () => api.get('/learning/badges').then(res => res.data),
    {
      onError: (error) => {
        console.error('Error fetching badges:', error);
        toast.error('Failed to load badges');
      }
    }
  );

  const { data: userStats, isLoading: statsLoading } = useQuery(
    ['user-learning-stats', user?.uuid],
    () => api.get(`/learning/stats/${user?.uuid}`).then(res => res.data),
    {
      enabled: !!user?.uuid,
      onError: (error) => {
        console.error('Error fetching user stats:', error);
      }
    }
  );

  // NEW: Get user progress
  const { data: userProgress, isLoading: progressLoading } = useQuery(
    ['user-progress', user?.uuid],
    () => api.get(`/learning/user-progress/${user?.uuid}`).then(res => res.data),
    {
      enabled: !!user?.uuid,
      onError: (error) => {
        console.error('Error fetching user progress:', error);
      }
    }
  );

  // NEW: Get all quizzes
  const { data: quizzes, isLoading: quizzesLoading } = useQuery(
    'learning-quizzes',
    () => api.get('/learning/quizzes').then(res => res.data),
    {
      onError: (error) => {
        console.error('Error fetching quizzes:', error);
        toast.error('Failed to load quizzes');
      }
    }
  );

  // NEW: Function to update module progress
  const updateModuleProgress = async (moduleId, completed, progressPercentage = 100) => {
    if (!user?.uuid) return;
    
    try {
      const response = await api.put(`/learning/progress/${user.uuid}/${moduleId}`, {
        completed,
        progress_percentage: progressPercentage,
        completed_at: completed ? new Date().toISOString() : null
      });
      
      // Refetch user progress and stats
      queryClient.invalidateQueries(['user-progress', user.uuid]);
      queryClient.invalidateQueries(['user-learning-stats', user.uuid]);
      
      if (completed) {
        toast.success('Module completed! XP earned! 🎉');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating module progress:', error);
      toast.error('Failed to update progress');
    }
  };

  // NEW: Function to submit quiz attempt
  const submitQuizAttempt = async (quizId, answers, score, timeTaken) => {
    if (!user?.uuid) return;
    
    try {
      const response = await api.post('/learning/quiz-attempt', {
        userId: user.uuid,
        quizId,
        answers,
        score,
        time_taken: timeTaken
      });
      
      // Refetch user progress and stats
      queryClient.invalidateQueries(['user-progress', user.uuid]);
      queryClient.invalidateQueries(['user-learning-stats', user.uuid]);
      
      if (response.data.passed) {
        toast.success(`Quiz passed! +${response.data.xpEarned} XP earned! 🎉`);
      } else {
        toast.info('Quiz completed. Keep practicing to earn XP! 💪');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      toast.error('Failed to submit quiz attempt');
    }
  };

  const tabs = [
    { key: 'modules', label: '📚 Modules', icon: '📚' },
    { key: 'quiz', label: '🧠 Quizzes', icon: '🧠' },
    { key: 'challenges', label: '🎯 Challenges', icon: '🎯' },
    { key: 'badges', label: '🏆 Badges', icon: '🏆' },
    { key: 'achievements', label: '⭐ Achievements', icon: '⭐' }
  ];

  // Helper functions
  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'beginner': return { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' };
      case 'intermediate': return { bg: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' };
      case 'advanced': return { bg: 'rgba(244, 67, 54, 0.1)', color: '#f44336' };
      default: return { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' };
    }
  };

  const getModuleIcon = (category) => {
    const iconMap = {
      'constitution': '🏛️',
      'civic-participation': '🗳️',
      'devolution': '🏢',
      'human-rights': '⚖️',
      'anti-corruption': '🛡️',
      'youth-leadership': '👥',
      'default': '📚'
    };
    return iconMap[category?.toLowerCase()] || iconMap.default;
  };

  const getChallengeIcon = (type) => {
    const iconMap = {
      'fact-check': '🔍',
      'survey': '📋',
      'debate': '💬',
      'community': '🏘️',
      'default': '🎯'
    };
    return iconMap[type?.toLowerCase()] || iconMap.default;
  };

  const isLoading = modulesLoading || challengesLoading || badgesLoading || statsLoading || progressLoading || quizzesLoading;

  if (isLoading) {
    return (
      <LearnContainer>
        <HeroSection>
          <HeroTitle>📚 Learn Hub</HeroTitle>
          <HeroSubtitle>Master civic knowledge through interactive modules</HeroSubtitle>
        </HeroSection>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
            Loading your learning content...
          </div>
        </div>
      </LearnContainer>
    );
  }

  // Get featured module (first module or one marked as featured)
  const featuredModule = modules?.find(m => m.is_featured) || modules?.[0];
  
  // Get current weekly challenge
  const weeklyChallenge = challenges?.find(c => c.is_weekly) || challenges?.[0];

  return (
    <LearnContainer>
      <HeroSection>
        <HeroTitle>📚 Learn Hub</HeroTitle>
        <HeroSubtitle>Master civic knowledge through interactive modules</HeroSubtitle>
      </HeroSection>

      {/* User Progress Summary */}
      {userStats && (
        <div style={{ padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: 'var(--text-primary)', 
            marginBottom: '16px',
            padding: '0 4px'
          }}>
            📊 Your Learning Progress
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--shadow-light)',
              border: '1px solid var(--light-border)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📚</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {userStats.completed_modules || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Modules Completed
              </div>
            </div>
            
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--shadow-light)',
              border: '1px solid var(--light-border)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧠</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {userStats.passed_quizzes || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Quizzes Passed
              </div>
            </div>
            
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--shadow-light)',
              border: '1px solid var(--light-border)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {userStats.completed_challenges || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Challenges Completed
              </div>
            </div>
            
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--shadow-light)',
              border: '1px solid var(--light-border)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⭐</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {userStats.total_xp || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Total XP Earned
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Module Section */}
      {featuredModule && (
        <div style={{ padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: 'var(--text-primary)', 
            marginBottom: '16px',
            padding: '0 4px'
          }}>
            ⭐ Featured Module
          </h3>
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            borderRadius: '20px',
            padding: '24px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onClick={() => navigate(`/learn/module/${featuredModule.id}`)}
          >
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '0.5px',
              backdropFilter: 'blur(10px)'
            }}>
              FEATURED
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '48px', flexShrink: 0 }}>
                {getModuleIcon(featuredModule.category)}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ 
                  fontSize: '20px', 
                  fontWeight: '800', 
                  marginBottom: '8px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {featuredModule.title}
                </h4>
                <p style={{ 
                  fontSize: '14px',
                  opacity: '0.9',
                  marginBottom: '12px',
                  lineHeight: '1.4'
                }}>
                  {featuredModule.description}
                </p>
                <div style={{ 
                  display: 'flex',
                  gap: '16px',
                  fontSize: '12px',
                  opacity: '0.8'
                }}>
                  <span>📖 {featuredModule.lesson_count || 'Multiple'} lessons</span>
                  <span>⏱️ {featuredModule.estimated_duration || '2 hours'}</span>
                  <span>🏆 +{featuredModule.xp_reward} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Challenge Section */}
      {weeklyChallenge && (
        <div style={{ padding: '0 20px 20px', marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: 'var(--text-primary)', 
            marginBottom: '16px',
            padding: '0 4px'
          }}>
            🔥 Weekly Challenge
          </h3>
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            color: 'white',
            borderRadius: '20px',
            padding: '24px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onClick={() => navigate(`/learn/challenge/${weeklyChallenge.id}`)}
          >
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'fire\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'><circle cx=\'25\' cy=\'25\' r=\'2\' fill=\'white\' opacity=\'0.1\'/><circle cx=\'75\' cy=\'75\' r=\'1.5\' fill=\'white\' opacity=\'0.1\'/><circle cx=\'50\' cy=\'10\' r=\'1\' fill=\'white\' opacity=\'0.1\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23fire)\'/></svg>")',
              opacity: '0.3'
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '40px', flexShrink: 0 }}>
                {getChallengeIcon(weeklyChallenge.type)}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ 
                  fontSize: '18px', 
                  fontWeight: '800', 
                  marginBottom: '4px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {weeklyChallenge.title}
                </h4>
                <p style={{ 
                  fontSize: '13px',
                  opacity: '0.9',
                  lineHeight: '1.4'
                }}>
                  {weeklyChallenge.description}
                </p>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                backdropFilter: 'blur(10px)',
                whiteSpace: 'nowrap'
              }}>
                {weeklyChallenge.duration || '7 days'}
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              marginBottom: '20px', 
              fontSize: '13px', 
              opacity: '0.9',
              position: 'relative',
              zIndex: 1
            }}>
              <span>🏆 +{weeklyChallenge.xp_reward} XP</span>
              {weeklyChallenge.badge_reward && (
                <span>🎖️ "{weeklyChallenge.badge_reward}" badge</span>
              )}
            </div>
            
            <button style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '20px',
              padding: '12px 24px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              position: 'relative',
              zIndex: 1
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            >
              Start Challenge
            </button>
          </div>
        </div>
      )}

      {/* Learning Stats Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '16px', 
        padding: '16px 20px', 
        background: 'white', 
        margin: '0 0 16px 0',
        borderRadius: '12px'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '16px 8px', 
          background: 'var(--light-bg)', 
          borderRadius: '12px' 
        }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '800', 
            color: '#4caf50', 
            marginBottom: '4px' 
          }}>
            {userStats?.completed_modules || 0}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)', 
            fontWeight: '500' 
          }}>
            Completed
          </div>
        </div>
        <div style={{ 
          textAlign: 'center', 
          padding: '16px 8px', 
          background: 'var(--light-bg)', 
          borderRadius: '12px' 
        }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '800', 
            color: '#4caf50', 
            marginBottom: '4px' 
          }}>
            {userStats?.total_xp || 0}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)', 
            fontWeight: '500' 
          }}>
            XP Earned
          </div>
        </div>
        <div style={{ 
          textAlign: 'center', 
          padding: '16px 8px', 
          background: 'var(--light-bg)', 
          borderRadius: '12px' 
        }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '800', 
            color: '#4caf50', 
            marginBottom: '4px' 
          }}>
            {userStats?.average_score ? `${Math.round(userStats.average_score)}%` : '0%'}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)', 
            fontWeight: '500' 
          }}>
            Avg Score
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div style={{ 
        background: 'white', 
        margin: '0 0 16px 0',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: 'var(--text-primary)', 
          marginBottom: '16px'
        }}>
          ⚡ Quick Actions
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '12px'
        }}>
          <button style={{
            background: 'linear-gradient(135deg, #4caf50, #81c784)',
            color: 'white',
            border: 'none',
            padding: '16px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = 'var(--shadow-medium)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
          onClick={() => setActiveTab('modules')}
          >
            <div style={{ fontSize: '20px' }}>📚</div>
            <span>Start Learning</span>
          </button>
          
          <button style={{
            background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
            color: 'white',
            border: 'none',
            padding: '16px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = 'var(--shadow-medium)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
          onClick={() => setActiveTab('quiz')}
          >
            <div style={{ fontSize: '20px' }}>🧠</div>
            <span>Take Quiz</span>
          </button>
          
          <button style={{
            background: 'linear-gradient(135deg, #9c27b0, #ba68c8)',
            color: 'white',
            border: 'none',
            padding: '16px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = 'var(--shadow-medium)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
          onClick={() => setActiveTab('challenges')}
          >
            <div style={{ fontSize: '20px' }}>🎯</div>
            <span>Challenges</span>
          </button>
          
          <button style={{
            background: 'linear-gradient(135deg, #2196f3, #64b5f6)',
            color: 'white',
            border: 'none',
            padding: '16px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = 'var(--shadow-medium)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
          onClick={() => setActiveTab('badges')}
          >
            <div style={{ fontSize: '20px' }}>🏆</div>
            <span>Badges</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ 
        background: 'white', 
        padding: '16px 20px', 
        borderBottom: '1px solid var(--light-border)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        <div style={{
          flex: 1,
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search modules, quizzes, or challenges..."
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              border: '1px solid var(--light-border)',
              borderRadius: '12px',
              fontSize: '14px',
              background: 'var(--light-bg)',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4caf50';
              e.target.style.background = 'white';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--light-border)';
              e.target.style.background = 'var(--light-bg)';
            }}
          />
          <div style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '18px',
            color: 'var(--text-secondary)'
          }}>
            🔍
          </div>
        </div>
        <button style={{
          background: 'var(--rada-green)',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'var(--rada-green-dark)';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'var(--rada-green)';
          e.target.style.transform = 'translateY(0)';
        }}
        >
          Search
        </button>
      </div>

      {/* Tabs Section */}
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid var(--light-border)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '12px 20px', 
          borderBottom: '1px solid var(--light-border)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: 'var(--text-primary)' 
          }}>
            📋 Content Categories
          </span>
        </div>
        <TabsContainer style={{ borderBottom: 'none' }}>
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} {tab.label}
            </Tab>
          ))}
        </TabsContainer>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'modules' && (
          <motion.div
            key="modules"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div style={{ padding: '20px' }}>
              {/* Back Arrow for Modules */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '20px' 
              }}>
                <button 
                  onClick={() => setActiveTab('modules')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--light-bg)';
                    e.target.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none';
                    e.target.style.color = 'var(--text-secondary)';
                  }}
                >
                  ←
                </button>
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)' 
                }}>
                  📚 Learning Modules
                </span>
              </div>
              
              {/* Quick Stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '12px', 
                marginBottom: '20px',
                padding: '16px',
                background: 'var(--light-bg)',
                borderRadius: '12px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#4caf50' }}>
                    {modules?.length || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Modules</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#ff9800' }}>
                    {userStats?.in_progress_modules || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>In Progress</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#4caf50' }}>
                    {userStats?.completed_modules || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Completed</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#f44336' }}>
                    {(modules?.length || 0) - (userStats?.completed_modules || 0) - (userStats?.in_progress_modules || 0)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Not Started</div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px' 
              }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                  📚 Learning Modules
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select style={{
                    padding: '8px 12px',
                    border: '1px solid var(--light-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    background: 'white',
                    cursor: 'pointer'
                  }}>
                    <option value="all">All Difficulty</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <select style={{
                    padding: '8px 12px',
                    border: '1px solid var(--light-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    background: 'white',
                    cursor: 'pointer'
                  }}>
                    <option value="progress">Sort by Progress</option>
                    <option value="xp">Sort by XP</option>
                    <option value="duration">Sort by Duration</option>
                    <option value="lessons">Sort by Lessons</option>
                  </select>
                </div>
              </div>
              <div style={{ 
                display: 'grid', 
                gap: '16px', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' 
              }}>
               {modules?.map((module) => {
                 const difficultyStyle = getDifficultyColor(module.difficulty);
                 const moduleIcon = getModuleIcon(module.category);
                 const userProgress = userStats?.module_progress?.find(p => p.module_id === module.id);
                 const progress = userProgress?.progress_percentage || 0;

                 return (
                   <div
                     key={module.id}
                     style={{
                       background: 'white',
                       borderRadius: '16px',
                       padding: '20px',
                       boxShadow: 'var(--shadow-light)',
                       border: '1px solid var(--light-border)',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease',
                       transform: 'translateY(0)'
                     }}
                     onClick={() => navigate(`/learn/module/${module.id}`)}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'translateY(-4px)';
                       e.target.style.boxShadow = 'var(--shadow-medium)';
                       e.target.style.borderColor = '#4caf50';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'translateY(0)';
                       e.target.style.boxShadow = 'var(--shadow-light)';
                       e.target.style.borderColor = 'var(--light-border)';
                     }}
                   >
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      background: 'var(--grad-primary)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      marginBottom: '16px'
                    }}>
                      {moduleIcon}
                    </div>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '700', 
                      color: 'var(--text-primary)',
                      marginBottom: '8px'
                    }}>
                      {module.title}
                    </h3>
                    <p style={{ 
                      color: 'var(--text-secondary)',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      marginBottom: '12px'
                    }}>
                      {module.description}
                    </p>
                    
                    {/* Progress Bar */}
                    {progress > 0 && (
                      <div style={{ 
                        background: 'var(--light-bg)',
                        height: '6px',
                        borderRadius: '3px',
                        marginBottom: '12px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: 'linear-gradient(90deg, #4caf50, #81c784)',
                          height: '100%',
                          borderRadius: '3px',
                          transition: 'width 0.3s ease',
                          width: `${progress}%`
                        }} />
                      </div>
                    )}
                    
                    {/* Completion Button */}
                    {progress < 100 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateModuleProgress(module.id, true, 100);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #4caf50, #81c784)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          marginBottom: '12px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        ✅ Mark Complete
                      </button>
                    )}
                    
                    {progress === 100 && (
                      <div style={{
                        background: 'linear-gradient(135deg, #4caf50, #81c784)',
                        color: 'white',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textAlign: 'center',
                        marginBottom: '12px'
                      }}>
                        🎉 Completed!
                      </div>
                    )}
                    
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      marginBottom: '12px'
                    }}>
                     <span style={{
                       background: difficultyStyle.bg,
                       color: difficultyStyle.color,
                       padding: '4px 8px',
                       borderRadius: '12px',
                       fontWeight: '600',
                       textTransform: 'capitalize'
                     }}>
                       {module.difficulty}
                     </span>
                     <span style={{ color: 'var(--rada-gold)', fontWeight: '600' }}>
                       +{module.xp_reward} XP
                     </span>
                   </div>

                   {/* Additional module info */}
                   <div style={{ 
                     display: 'flex',
                     gap: '12px',
                     fontSize: '11px',
                     color: 'var(--text-secondary)'
                   }}>
                     {module.lesson_count && <span>📖 {module.lesson_count} lessons</span>}
                     {module.estimated_duration && <span>⏱️ {module.estimated_duration}</span>}
                   </div>
                 </div>
                );
               }) || []}
             </div>
           </div>
         </motion.div>
       )}

       {activeTab === 'quiz' && (
         <motion.div
           key="quiz"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
         >
           <div style={{ padding: '20px' }}>
             {/* Back Arrow for Quiz */}
             <div style={{ 
               display: 'flex', 
               alignItems: 'center', 
               gap: '12px', 
               marginBottom: '20px' 
             }}>
               <button 
                 onClick={() => setActiveTab('modules')}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '18px',
                   color: 'var(--text-secondary)',
                   cursor: 'pointer',
                   padding: '4px',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   transition: 'all 0.2s ease'
                 }}
                 onMouseEnter={(e) => {
                   e.target.style.background = 'var(--light-bg)';
                   e.target.style.color = 'var(--text-primary)';
                 }}
                 onMouseLeave={(e) => {
                   e.target.style.background = 'none';
                   e.target.style.color = 'var(--text-secondary)';
                 }}
               >
                 ←
               </button>
               <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                 🧠 Quizzes & Challenges
               </h3>
             </div>
             <div style={{ 
               display: 'grid', 
               gap: '20px', 
               gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' 
             }}>
               {/* Real quizzes from API */}
               {quizzes?.map((quiz) => (
                 <div
                   key={quiz.id}
                   style={{
                     background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
                     color: 'white',
                     borderRadius: '16px',
                     padding: '20px',
                     cursor: 'pointer',
                     position: 'relative',
                     overflow: 'hidden'
                   }}
                   onClick={() => navigate(`/learn/quiz/${quiz.id}`)}
                 >
                   <h3 style={{ 
                     fontSize: '18px', 
                     fontWeight: '700', 
                     marginBottom: '8px',
                     position: 'relative',
                     zIndex: 1
                   }}>
                     {quiz.title}
                   </h3>
                   <p style={{ 
                     fontSize: '14px',
                     opacity: '0.9',
                     marginBottom: '16px',
                     position: 'relative',
                     zIndex: 1
                   }}>
                     {quiz.description}
                   </p>
                   <div style={{ 
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                     fontSize: '12px',
                     position: 'relative',
                     zIndex: 1
                   }}>
                     <span>🎯 {quiz.questions?.length || 0} Questions</span>
                     <span>📊 {quiz.passing_score || 70}% to pass</span>
                     <span>🏆 +{quiz.xp_reward || 50} XP</span>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </motion.div>
       )}

       {activeTab === 'challenges' && (
         <motion.div
           key="challenges"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
         >
           <div style={{ padding: '20px' }}>
             {/* Back Arrow for Challenges */}
             <div style={{ 
               display: 'flex', 
               alignItems: 'center', 
               gap: '12px', 
               marginBottom: '20px' 
             }}>
               <button 
                 onClick={() => setActiveTab('modules')}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '18px',
                   color: 'var(--text-secondary)',
                   cursor: 'pointer',
                   padding: '4px',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   transition: 'all 0.2s ease'
                 }}
                 onMouseEnter={(e) => {
                   e.target.style.background = 'var(--light-bg)';
                   e.target.style.color = 'var(--text-primary)';
                 }}
                 onMouseLeave={(e) => {
                   e.target.style.background = 'none';
                   e.target.style.color = 'var(--text-secondary)';
                 }}
               >
                 ←
               </button>
               <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                 🎯 Civic Challenges
               </h3>
             </div>
             <div style={{ 
               display: 'grid', 
               gap: '20px', 
               gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' 
             }}>
               {challenges?.map((challenge) => (
                 <div
                   key={challenge.id}
                   style={{
                     background: 'white',
                     borderRadius: '16px',
                     padding: '20px',
                     boxShadow: 'var(--shadow-light)',
                     border: '1px solid var(--light-border)',
                     cursor: 'pointer',
                     transition: 'all 0.3s ease'
                   }}
                   onClick={() => navigate(`/learn/challenge/${challenge.id}`)}
                   onMouseEnter={(e) => {
                     e.target.style.transform = 'translateY(-2px)';
                     e.target.style.boxShadow = 'var(--shadow-medium)';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.transform = 'translateY(0)';
                     e.target.style.boxShadow = 'var(--shadow-light)';
                   }}
                 >
                   <div style={{ 
                     fontSize: '32px',
                     marginBottom: '16px'
                   }}>
                     {getChallengeIcon(challenge.type)}
                   </div>
                   <h4 style={{ 
                     fontSize: '16px', 
                     fontWeight: '700', 
                     color: 'var(--text-primary)',
                     marginBottom: '6px'
                   }}>
                     {challenge.title}
                   </h4>
                   <p style={{ 
                     fontSize: '13px',
                     color: 'var(--text-secondary)',
                     marginBottom: '12px',
                     lineHeight: '1.4'
                   }}>
                     {challenge.description}
                   </p>
                   
                   <div style={{ 
                     display: 'flex',
                     gap: '8px',
                     marginBottom: '12px',
                     flexWrap: 'wrap'
                   }}>
                     <div style={{ 
                       background: 'linear-gradient(135deg, #4caf50, #81c784)',
                       color: 'white',
                       padding: '6px 12px',
                       borderRadius: '16px',
                       fontSize: '11px',
                       fontWeight: '600'
                     }}>
                       +{challenge.xp_reward} XP
                     </div>
                     {challenge.badge_reward && (
                       <div style={{ 
                         background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
                         color: 'white',
                         padding: '6px 12px',
                         borderRadius: '16px',
                         fontSize: '11px',
                         fontWeight: '600'
                       }}>
                         🏆 Badge
                       </div>
                     )}
                   </div>

                   {challenge.duration && (
                     <div style={{ 
                       fontSize: '11px',
                       color: 'var(--text-secondary)',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '4px'
                     }}>
                       ⏰ {challenge.duration}
                     </div>
                   )}
                 </div>
               )) || []}
             </div>
           </div>
         </motion.div>
       )}

       {activeTab === 'badges' && (
         <motion.div
           key="badges"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
         >
           <div style={{ padding: '20px' }}>
             {/* Back Arrow for Badges */}
             <div style={{ 
               display: 'flex', 
               alignItems: 'center', 
               gap: '12px', 
               marginBottom: '20px' 
             }}>
               <button 
                 onClick={() => setActiveTab('modules')}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '18px',
                   color: 'var(--text-secondary)',
                   cursor: 'pointer',
                   padding: '4px',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   transition: 'all 0.2s ease'
                 }}
                 onMouseEnter={(e) => {
                   e.target.style.background = 'var(--light-bg)';
                   e.target.style.color = 'var(--text-primary)';
                 }}
                 onMouseLeave={(e) => {
                   e.target.style.background = 'none';
                   e.target.style.color = 'var(--text-secondary)';
                 }}
               >
                 ←
               </button>
               <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                 🏆 Available Badges
               </h3>
             </div>

             {/* Badge Stats */}
             <div style={{ 
               display: 'grid', 
               gridTemplateColumns: 'repeat(3, 1fr)', 
               gap: '12px', 
               marginBottom: '20px',
               padding: '16px',
               background: 'var(--light-bg)',
               borderRadius: '12px'
             }}>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '20px', fontWeight: '700', color: '#4caf50' }}>
                   {userStats?.earned_badges || 0}
                 </div>
                 <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Earned</div>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '20px', fontWeight: '700', color: '#ff9800' }}>
                   {badges?.length || 0}
                 </div>
                 <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Available</div>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '20px', fontWeight: '700', color: '#2196f3' }}>
                   {Math.round(((userStats?.earned_badges || 0) / (badges?.length || 1)) * 100)}%
                 </div>
                 <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Complete</div>
               </div>
             </div>

             <div style={{ 
               display: 'grid', 
               gap: '20px', 
               gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' 
             }}>
               {badges?.map((badge) => {
                 const isEarned = userStats?.user_badges?.some(ub => ub.badge_id === badge.id);
                 
                 return (
                   <div
                     key={badge.id}
                     style={{
                       background: 'white',
                       borderRadius: '16px',
                       padding: '20px',
                       boxShadow: 'var(--shadow-light)',
                       border: isEarned ? '2px solid #4caf50' : '1px solid var(--light-border)',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease',
                       position: 'relative',
                       background: isEarned ? 'rgba(76, 175, 80, 0.05)' : 'white'
                     }}
                     onMouseEnter={(e) => {
                       if (!isEarned) {
                         e.target.style.transform = 'translateY(-2px)';
                         e.target.style.boxShadow = 'var(--shadow-medium)';
                       }
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'translateY(0)';
                       e.target.style.boxShadow = 'var(--shadow-light)';
                     }}
                   >
                     {isEarned && (
                       <div style={{
                         position: 'absolute',
                         top: '12px',
                         right: '12px',
                         background: '#4caf50',
                         color: 'white',
                         borderRadius: '50%',
                         width: '24px',
                         height: '24px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         fontSize: '12px'
                       }}>
                         ✓
                       </div>
                     )}
                     
                     <div style={{ 
                       fontSize: '40px',
                       marginBottom: '16px',
                       opacity: isEarned ? '1' : '0.3',
                       filter: isEarned ? 'none' : 'grayscale(100%)',
                       transition: 'all 0.3s ease'
                     }}>
                       {badge.icon || '🏆'}
                     </div>
                     <h4 style={{ 
                       fontSize: '16px', 
                       fontWeight: '700', 
                       color: 'var(--text-primary)',
                       marginBottom: '6px'
                     }}>
                       {badge.title}
                     </h4>
                     <p style={{ 
                       fontSize: '13px',
                       color: 'var(--text-secondary)',
                       marginBottom: '12px',
                       lineHeight: '1.4'
                     }}>
                       {badge.description}
                     </p>
                     
                     {badge.category && (
                       <span style={{
                         display: 'inline-block',
                         background: 'rgba(33, 150, 243, 0.1)',
                         color: '#2196f3',
                         padding: '4px 8px',
                         borderRadius: '8px',
                         fontSize: '10px',
                         fontWeight: '600',
                         marginBottom: '8px'
                       }}>
                         {badge.category}
                       </span>
                     )}
                     
                     <div style={{ 
                       fontSize: '11px',
                       color: isEarned ? '#4caf50' : 'var(--text-secondary)',
                       fontWeight: '500'
                     }}>
                       {isEarned ? 'Earned!' : `${badge.xp_required || 0} XP required to unlock`}
                     </div>
                   </div>
                 );
               }) || []}
             </div>
           </div>
         </motion.div>
       )}

       {activeTab === 'achievements' && (
         <motion.div
           key="achievements"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
         >
           <div style={{ padding: '20px' }}>
             {/* Back Arrow for Achievements */}
             <div style={{ 
               display: 'flex', 
               alignItems: 'center', 
               gap: '12px', 
               marginBottom: '20px' 
             }}>
               <button 
                 onClick={() => setActiveTab('modules')}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '18px',
                   color: 'var(--text-secondary)',
                   cursor: 'pointer',
                   padding: '4px',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   transition: 'all 0.2s ease'
                 }}
                 onMouseEnter={(e) => {
                   e.target.style.background = 'var(--light-bg)';
                   e.target.style.color = 'var(--text-primary)';
                 }}
                 onMouseLeave={(e) => {
                   e.target.style.background = 'none';
                   e.target.style.color = 'var(--text-secondary)';
                 }}
               >
                 ←
               </button>
               <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                 ⭐ Learning Achievements
               </h3>
             </div>
             <div style={{ 
               display: 'flex',
               overflowX: 'auto',
               gap: '12px',
               padding: '0 4px 20px'
             }}>
               {/* Sample achievements based on user progress */}
               {[
                 { 
                   id: 1, 
                   title: "First Steps", 
                   desc: "Complete your first module", 
                   icon: "🎯", 
                   earned: (userStats?.completed_modules || 0) > 0 
                 },
                 { 
                   id: 2, 
                   title: "Knowledge Seeker", 
                   desc: "Earn 100 XP", 
                   icon: "🧠", 
                   earned: (userStats?.total_xp || 0) >= 100 
                 },
                 { 
                   id: 3, 
                   title: "Badge Hunter", 
                   desc: "Earn your first badge", 
                   icon: "🏆", 
                   earned: (userStats?.earned_badges || 0) > 0 
                 },
                 { 
                   id: 4, 
                   title: "Constitution Scholar", 
                   desc: "Complete Constitution module", 
                   icon: "🏛️", 
                   earned: userStats?.completed_modules_titles?.includes('Constitution') || false
                 },
                 { 
                   id: 5, 
                   title: "Challenge Master", 
                   desc: "Complete 3 challenges", 
                   icon: "⚡", 
                   earned: (userStats?.completed_challenges || 0) >= 3 
                 }
               ].map((achievement) => (
                 <div
                   key={achievement.id}
                   style={{
                     background: 'white',
                     borderRadius: '12px',
                     padding: '16px',
                     minWidth: '140px',
                     boxShadow: 'var(--shadow-light)',
                     textAlign: 'center',
                     cursor: 'pointer',
                     border: achievement.earned ? '2px solid #4caf50' : '2px solid transparent',
                     background: achievement.earned ? 'rgba(76, 175, 80, 0.05)' : 'white',
                     position: 'relative'
                   }}
                   onMouseEnter={(e) => {
                     if (achievement.earned) {
                       e.target.style.transform = 'translateY(-2px)';
                       e.target.style.boxShadow = 'var(--shadow-medium)';
                     }
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.transform = 'translateY(0)';
                     e.target.style.boxShadow = 'var(--shadow-light)';
                   }}
                 >
                   {achievement.earned && (
                     <div style={{
                       position: 'absolute',
                       top: '8px',
                       right: '8px',
                       background: '#4caf50',
                       color: 'white',
                       borderRadius: '50%',
                       width: '20px',
                       height: '20px',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: '10px'
                     }}>
                       ✓
                     </div>
                   )}
                   <div style={{ 
                     fontSize: '32px',
                     marginBottom: '8px',
                     filter: achievement.earned ? 'none' : 'grayscale(1) opacity(0.3)',
                     transition: 'all 0.3s ease'
                   }}>
                     {achievement.icon}
                   </div>
                   <h4 style={{ 
                     fontSize: '12px',
                     fontWeight: '600',
                     color: 'var(--text-primary)',
                     marginBottom: '4px'
                   }}>
                     {achievement.title}
                   </h4>
                   <p style={{ 
                     fontSize: '10px',
                     color: 'var(--text-secondary)'
                   }}>
                     {achievement.desc}
                   </p>
                 </div>
               ))}
             </div>
           </div>
         </motion.div>
       )}
     </AnimatePresence>
   </LearnContainer>
  );
};

export default LearnHome;