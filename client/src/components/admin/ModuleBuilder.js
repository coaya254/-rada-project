import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';


// Styled Components
const BuilderContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const BuilderHeader = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 24px;
  border-radius: 20px;
  margin-bottom: 24px;
  text-align: center;
`;

const BuilderTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
`;

const BuilderSubtitle = styled.p`
  opacity: 0.9;
  font-size: 16px;
`;

const FormSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
`;

const FormInput = styled.input`
  padding: 12px 16px;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FormTextarea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FormSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;







const IconSelector = styled.div`
  position: relative;
`;

const IconDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  padding: 16px;
`;

const IconOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    transform: scale(1.1);
  }
  
  &.selected {
    background: #667eea;
    color: white;
  }
`;

const IconPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #d1d5db;
  }
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const IconDisplay = styled.span`
  font-size: 1.5rem;
`;

const IconText = styled.span`
  font-size: 0.9rem;
  color: #6b7280;
`;

const ChevronDown = styled.span`
  margin-left: auto;
  font-size: 0.8rem;
  color: #9ca3af;
  transition: transform 0.2s ease;
  
  ${props => props.isOpen && `
    transform: rotate(180deg);
  `}
`;

const ModuleBuilder = ({ 
  moduleId, 
  onCreateModule, 
  onUpdateModule, 
  onDeleteModule,
  categories = [],
  difficulties = []
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '📚',
    difficulty: 'beginner',
    xp_reward: 50,
    category: '',
    tags: [],
    featured: false
  });





  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);



  // Comprehensive list of learning and education icons
  const iconOptions = [
    '📚', '🎓', '✏️', '📝', '🔍', '💡', '🧠', '🎯',
    '🌟', '🚀', '💪', '🎉', '🏆', '⭐', '🔥', '💎',
    '🌱', '🌍', '🏛️', '⚖️', '🗳️', '🇰🇪', '🌍', '🌐',
    '📊', '📈', '📋', '✅', '❌', '⚠️', 'ℹ️', '💭',
    '🎨', '🎭', '🎵', '🎬', '📷', '🎥', '🎤', '🎧',
    '🏃', '🚶', '🚴', '🏊', '⚽', '🏀', '🎾', '🏈',
    '🍎', '🍕', '☕', '🍰', '🍫', '🍦', '🥤', '🍺',
    '🐱', '🐶', '🦁', '🐯', '🐸', '🐙', '🦋', '🐝'
  ];

  // Fetch module data if editing
  const { data: moduleData, isLoading: moduleLoading } = useQuery(
    ['admin-module', moduleId],
    () => api.get(`/admin/learning-modules/${moduleId}`).then(res => res.data),
    {
      enabled: !!moduleId,
      onSuccess: (data) => {
        console.log('Module data loaded:', data);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          icon: data.icon || '📚',
          difficulty: data.difficulty || 'beginner',
          xp_reward: data.xp_reward || 50,
          category: data.category || '',
          tags: data.tags || [],
          featured: data.is_featured || false
        });
        
        
        console.log('Form data set:', formData);
      },
      onError: (error) => {
        console.error('Error fetching module:', error);
        toast.error('Failed to load module data');
      }
    }
  );



  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form submitted!', { moduleId, formData });
    
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    if (moduleId) {
      console.log('Updating module:', moduleId, formData);
      onUpdateModule(moduleId, formData);
    } else {
      console.log('Creating new module:', formData);
      onCreateModule(formData);
    }
  };



  // Available icons for picker


  const handleIconSelect = (icon) => {
    setFormData(prev => ({ ...prev, icon }));
    setIsIconDropdownOpen(false);
  };

  const toggleIconDropdown = () => {
    setIsIconDropdownOpen(!isIconDropdownOpen);
  };

  // Workflow progress calculation
  const getWorkflowProgress = () => {
    if (!moduleId) return { stage: 'planning', progress: 25, nextStep: 'lessons' };
    
    // Calculate based on what's completed
    let progress = 25; // Module basics
    let stage = 'planning';
    let nextStep = 'lessons';
    
    if (formData.title && formData.description) {
      progress = 50;
      stage = 'building';
      nextStep = 'lessons';
    }
    
    // This would check actual lessons and quiz data
    // For now, show mock progress
    return { stage, progress, nextStep };
  };

  const workflowProgress = getWorkflowProgress();

  if (moduleLoading) {
    return (
      <BuilderContainer>
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          fontSize: '18px',
          color: '#64748b'
        }}>
          🔄 Loading module data...
        </div>
      </BuilderContainer>
    );
  }

  return (
    <BuilderContainer>
      <BuilderHeader>
        <BuilderTitle>📚 MODULE BUILDER</BuilderTitle>
        <BuilderSubtitle>
          {moduleId ? 'Edit your learning module' : 'Create a new learning module'}
        </BuilderSubtitle>
        {moduleData && (
          <div style={{ 
            marginTop: '16px', 
            fontSize: '14px', 
            opacity: 0.8,
            background: 'rgba(255,255,255,0.1)',
            padding: '8px 16px',
            borderRadius: '8px'
          }}>
            🎯 Editing: {moduleData.title} (ID: {moduleData.id})
          </div>
        )}
      </BuilderHeader>

      {/* Simple Progress Indicator */}
      <div style={{ 
        background: 'rgba(102, 126, 234, 0.05)', 
        padding: '16px 20px', 
        borderRadius: '12px',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '14px', color: '#667eea', fontWeight: '600', marginBottom: '8px' }}>
          📋 Module Progress: {workflowProgress.progress}% Complete
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {workflowProgress.nextStep === 'lessons' ? 'Next: Add lessons to continue building' : 
           workflowProgress.nextStep === 'quiz' ? 'Next: Create quiz to test learners' :
           'Next: Review and publish your module'}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* MODULE INFORMATION */}
        <FormSection>
          <SectionTitle>📋 MODULE INFORMATION</SectionTitle>
          
          <FormGrid>
            <FormGroup>
              <FormLabel>Title</FormLabel>
              <FormInput
                type="text"
                placeholder="Kenyan Constitution Basics"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Description</FormLabel>
              <FormTextarea
                placeholder="Short description for card"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Icon</FormLabel>
              <IconSelector>
                <IconPreview onClick={toggleIconDropdown}>
                  <IconDisplay>{formData.icon}</IconDisplay>
                  <IconText>Click to choose icon</IconText>
                  <ChevronDown isOpen={isIconDropdownOpen}>▼</ChevronDown>
                </IconPreview>
                
                <IconDropdown isOpen={isIconDropdownOpen}>
                  <IconGrid>
                    {iconOptions.map((icon, index) => (
                      <IconOption
                        key={index}
                        className={formData.icon === icon ? 'selected' : ''}
                        onClick={() => handleIconSelect(icon)}
                        title={`Select ${icon}`}
                      >
                        {icon}
                      </IconOption>
                    ))}
                  </IconGrid>
                </IconDropdown>
              </IconSelector>
            </FormGroup>

            <FormGroup>
              <FormLabel>Difficulty</FormLabel>
              <FormSelect
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>XP Reward</FormLabel>
              <FormInput
                type="number"
                placeholder="50"
                value={formData.xp_reward}
                onChange={(e) => handleInputChange('xp_reward', parseInt(e.target.value))}
                min="0"
                max="1000"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Category</FormLabel>
              <FormSelect
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category} ({cat.count})
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
          </FormGrid>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '16px',
            background: 'var(--light-bg)',
            borderRadius: '12px',
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            <span>⏱️ Duration: <strong>Auto-calculated from lessons</strong></span>
            <span>📖 Lessons: <strong>Manage in Lesson Editor tab</strong></span>
          </div>
        </FormSection>

        {/* SAVE SECTION */}
        <div style={{ 
          marginTop: '24px', 
          padding: '20px', 
          background: 'rgba(102, 126, 234, 0.05)', 
          borderRadius: '12px',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h4 style={{ 
                margin: '0 0 4px 0', 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#667eea'
              }}>
                {moduleId ? '💾 Save Changes' : '🚀 Create Module'}
              </h4>
              <p style={{ 
                fontSize: '13px', 
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {moduleId 
                  ? 'Save your changes here, then continue building in the other tabs.'
                  : 'Create your module first, then add lessons and quizzes in the respective tabs.'
                }
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '140px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {moduleId ? '💾 Save Changes' : '🚀 Create Module'}
              </button>
              
              {moduleId && (
                <button
                  type="button"
                  onClick={() => {
                    toast.success('💡 Use the other tabs to continue building your module!');
                  }}
                  style={{
                    background: 'white',
                    color: '#667eea',
                    border: '1px solid #667eea',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '140px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#667eea';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#667eea';
                  }}
                >
                  💡 Continue Building
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MODULE DELETE SECTION */}
        {moduleId && (
          <div style={{ 
            marginTop: '32px', 
            padding: '24px', 
            background: 'var(--light-bg)', 
            borderRadius: '16px',
            border: '2px dashed var(--light-border)'
          }}>
            <SectionTitle style={{ color: '#dc2626', marginBottom: '16px' }}>
              ⚠️ DANGER ZONE
            </SectionTitle>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--text-secondary)', 
              marginBottom: '16px',
              lineHeight: '1.5'
            }}>
              Deleting this module will permanently remove it and all associated lessons, quizzes, and user progress. 
              This action cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you absolutely sure you want to delete this module? This action cannot be undone.')) {
                  onDeleteModule(moduleId);
                }
              }}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#dc2626';
              }}
            >
              🗑️ Delete Module Permanently
            </button>
          </div>
        )}
      </form>
    </BuilderContainer>
  );
};

const WorkflowProgress = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e1e8ed;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ProgressPercentage = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 12px;
  border-radius: 16px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #667eea);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ProgressSteps = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  opacity: ${props => props.completed ? 1 : props.current ? 1 : 0.5};
`;

const StepIcon = styled.div`
  font-size: 20px;
  opacity: ${props => props.completed ? 1 : props.current ? 1 : 0.6};
`;

const StepText = styled.span`
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  font-weight: 500;
`;

const NextStepGuide = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(102, 126, 234, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const NextStepIcon = styled.div`
  font-size: 16px;
`;

const NextStepText = styled.span`
  font-size: 13px;
  color: #374151;
  line-height: 1.4;
`;

export default ModuleBuilder;
