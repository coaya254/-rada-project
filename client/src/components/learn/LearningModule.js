import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useEnhancedUser } from '../../contexts/EnhancedUserContext';
import api from '../../utils/api';

const ModuleContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--light-bg);
`;

const ModuleHeader = styled.div`
  background: linear-gradient(135deg, #4caf50, #81c784);
  color: white;
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
`;

const ModuleTitle = styled.h1`
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
`;

const ModuleDescription = styled.p`
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
`;

const ModuleMeta = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 14px;
  position: relative;
  z-index: 1;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ProgressSection = styled.div`
  background: white;
  margin: 16px 20px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-light);
`;

const ProgressTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
`;

const ProgressBar = styled.div`
  background: var(--light-bg);
  height: 8px;
  border-radius: 4px;
  margin-bottom: 12px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #81c784);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-secondary);
`;

const LessonsSection = styled.div`
  padding: 0 20px;
`;

const LessonCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-light);
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #4caf50;
    transform: translateY(-2px);
  }
  
  &.completed {
    border-color: #4caf50;
    background: rgba(76, 175, 80, 0.05);
  }
  
  &.locked {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LessonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const LessonTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
`;

const LessonStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
`;

const LessonIcon = styled.div`
  width: 40px;
  height: 40px;
  background: var(--grad-primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
`;

const LessonDescription = styled.p`
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const LessonMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-secondary);
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #4caf50;
    color: white;
    
    &:hover {
      background: #45a049;
    }
  }
  
  &.secondary {
    background: var(--light-bg);
    color: var(--text-secondary);
    
    &:hover {
      background: #e0e0e0;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CompletionBadge = styled.div`
  background: #4caf50;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

const LockIcon = styled.div`
  color: var(--text-secondary);
  font-size: 16px;
`;

const LearningModule = () => {
  const { moduleId } = useParams();
  const { user, awardXP  } = useEnhancedUser();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showLesson, setShowLesson] = useState(false);

  // Sample module data - in production this would come from the API
  const moduleData = {
    id: moduleId || 1,
    title: "Kenyan Constitution Basics",
    description: "Learn about the fundamental principles, structure, and key provisions of Kenya's 2010 Constitution.",
    icon: "🏛️",
    difficulty: "beginner",
    xp_reward: 50,
    lessons: [
      {
        id: 1,
        title: "Introduction to the Constitution",
        description: "Understanding what a constitution is and why Kenya needed a new one in 2010.",
        duration: "15 minutes",
        content: "The Constitution of Kenya 2010 is the supreme law of the Republic of Kenya. It was promulgated on August 27, 2010, replacing the 1963 independence Constitution. This new Constitution introduced significant changes including devolution, an expanded Bill of Rights, and strengthened institutions.",
        xp_reward: 10,
        type: "reading"
      },
      {
        id: 2,
        title: "The Preamble and National Values",
        description: "Exploring the preamble and the national values that guide Kenya's governance.",
        duration: "20 minutes",
        content: "The preamble sets out the aspirations of the Kenyan people and the national values include patriotism, national unity, sharing and devolution of power, democracy and participation of the people, human dignity, equity, social justice, inclusiveness, equality, human rights, non-discrimination, protection of the marginalized, good governance, integrity, transparency and accountability.",
        xp_reward: 15,
        type: "reading"
      },
      {
        id: 3,
        title: "The Bill of Rights",
        description: "Understanding the fundamental rights and freedoms guaranteed to every Kenyan.",
        duration: "25 minutes",
        content: "Chapter 4 of the Constitution contains the Bill of Rights, which guarantees fundamental freedoms including the right to life, freedom of expression, freedom of assembly, freedom of movement, and the right to education. These rights are enforceable in court and can only be limited in specific circumstances.",
        xp_reward: 20,
        type: "reading"
      },
      {
        id: 4,
        title: "Structure of Government",
        description: "Learning about the three arms of government and their functions.",
        duration: "30 minutes",
        content: "Kenya's government is structured in three arms: the Executive (President and Cabinet), the Legislature (Parliament - National Assembly and Senate), and the Judiciary (Courts). This separation of powers ensures checks and balances in governance.",
        xp_reward: 25,
        type: "reading"
      },
      {
        id: 5,
        title: "Devolution and County Governments",
        description: "Understanding how devolution works and the role of county governments.",
        duration: "25 minutes",
        content: "Devolution is the transfer of power from the national government to 47 county governments. Each county has a governor, deputy governor, county assembly, and executive committee. Counties handle local services like health, agriculture, and roads.",
        xp_reward: 20,
        type: "reading"
      },
      {
        id: 6,
        title: "Electoral System and Democracy",
        description: "How elections work and the importance of democratic participation.",
        duration: "20 minutes",
        content: "Kenya holds general elections every 5 years. The electoral system includes presidential, parliamentary, and county elections. The Independent Electoral and Boundaries Commission (IEBC) manages elections to ensure free and fair processes.",
        xp_reward: 15,
        type: "reading"
      },
      {
        id: 7,
        title: "Constitutional Commissions",
        description: "Understanding the role of independent commissions in governance.",
        duration: "20 minutes",
        content: "The Constitution establishes several independent commissions including the IEBC, EACC (Ethics and Anti-Corruption Commission), and the Kenya National Human Rights Commission. These bodies operate independently to ensure good governance.",
        xp_reward: 15,
        type: "reading"
      },
      {
        id: 8,
        title: "Amendment Process",
        description: "How the Constitution can be changed and the safeguards in place.",
        duration: "15 minutes",
        content: "Amending the Constitution requires a referendum and approval by at least 20% of registered voters in at least 24 counties. This high threshold protects the Constitution from frequent changes and ensures stability.",
        xp_reward: 10,
        type: "reading"
      }
    ]
  };

  const totalLessons = moduleData.lessons.length;
  const progress = (completedLessons.length / totalLessons) * 100;

  const handleLessonClick = (lesson) => {
    if (completedLessons.includes(lesson.id)) {
      toast('Lesson already completed! 🎉');
      return;
    }
    
    if (lesson.id > 1 && !completedLessons.includes(lesson.id - 1)) {
      toast.error('Complete previous lessons first! 📚');
      return;
    }
    
    setCurrentLesson(lesson);
    setShowLesson(true);
  };

  const handleCompleteLesson = async (lesson) => {
    if (completedLessons.includes(lesson.id)) {
      return;
    }

    try {
      await awardXP('lesson_completion', lesson.xp_reward, lesson.id, 'lesson');
      setCompletedLessons(prev => [...prev, lesson.id]);
      toast.success(`Lesson completed! (+${lesson.xp_reward} XP) 🎯`);
    } catch (error) {
      console.error('Error awarding XP:', error);
      toast.success(`Lesson completed! 🎯`);
    }
  };

  const handleBackToModule = () => {
    setShowLesson(false);
  };

  if (showLesson) {
    return (
      <ModuleContainer>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div style={{ padding: '20px' }}>
            <ActionButton className="secondary" onClick={handleBackToModule}>
              ← Back to Module
            </ActionButton>
          </div>
          
          <div style={{ padding: '0 20px' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '32px', marginRight: '16px' }}>{currentLesson.type === 'reading' ? '📖' : '🎥'}</div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    {currentLesson.title}
                  </h2>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    ⏱️ {currentLesson.duration} • +{currentLesson.xp_reward} XP
                  </div>
                </div>
              </div>
              
              <div style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '24px' }}>
                {currentLesson.content}
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <ActionButton 
                  className="primary"
                  onClick={() => handleCompleteLesson(currentLesson)}
                  disabled={completedLessons.includes(currentLesson.id)}
                >
                  {completedLessons.includes(currentLesson.id) ? 'Completed ✓' : 'Mark Complete'}
                </ActionButton>
              </div>
            </div>
          </div>
        </motion.div>
      </ModuleContainer>
    );
  }

  return (
    <ModuleContainer>
      <ModuleHeader>
        <ModuleTitle>{moduleData.icon} {moduleData.title}</ModuleTitle>
        <ModuleDescription>{moduleData.description}</ModuleDescription>
        <ModuleMeta>
          <MetaItem>
            <span>📖 {totalLessons} lessons</span>
          </MetaItem>
          <MetaItem>
            <span>⏱️ {moduleData.duration || '4 hours'}</span>
          </MetaItem>
          <MetaItem>
            <span>🏆 +{moduleData.xp_reward} XP</span>
          </MetaItem>
        </ModuleMeta>
      </ModuleHeader>

      <ProgressSection>
        <ProgressTitle>Your Progress</ProgressTitle>
        <ProgressBar>
          <ProgressFill style={{ width: `${progress}%` }} />
        </ProgressBar>
        <ProgressText>
          <span>{completedLessons.length} of {totalLessons} lessons completed</span>
          <span>{Math.round(progress)}%</span>
        </ProgressText>
      </ProgressSection>

      <LessonsSection>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
          Lessons
        </h3>
        
        {moduleData.lessons.map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            className={`${completedLessons.includes(lesson.id) ? 'completed' : ''} ${lesson.id > 1 && !completedLessons.includes(lesson.id - 1) ? 'locked' : ''}`}
            onClick={() => handleLessonClick(lesson)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <LessonHeader>
              <LessonIcon>{lesson.type === 'reading' ? '📖' : '🎥'}</LessonIcon>
              <div style={{ flex: 1 }}>
                <LessonTitle>{lesson.title}</LessonTitle>
                <LessonDescription>{lesson.description}</LessonDescription>
              </div>
              <LessonStatus>
                {completedLessons.includes(lesson.id) ? (
                  <CompletionBadge>Completed</CompletionBadge>
                ) : lesson.id > 1 && !completedLessons.includes(lesson.id - 1) ? (
                  <LockIcon>🔒</LockIcon>
                ) : (
                  <span style={{ color: '#4caf50' }}>Ready</span>
                )}
              </LessonStatus>
            </LessonHeader>
            
            <LessonMeta>
              <span>⏱️ {lesson.duration}</span>
              <span>+{lesson.xp_reward} XP</span>
            </LessonMeta>
          </LessonCard>
        ))}
      </LessonsSection>
    </ModuleContainer>
  );
};

export default LearningModule;
