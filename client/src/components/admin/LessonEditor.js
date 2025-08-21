import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import VideoEmbedder from './VideoEmbedder';

// Styled Components
const EditorContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const EditorHeader = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 24px;
  border-radius: 20px;
  margin-bottom: 24px;
  text-align: center;
`;

const EditorTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
`;

const EditorSubtitle = styled.p`
  opacity: 0.9;
  font-size: 16px;
`;

const LessonList = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
`;

const LessonItem = styled.div`
  border: 2px solid var(--light-border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    box-shadow: var(--shadow-light);
  }
  
  &.selected {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const LessonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const LessonTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const LessonActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
  }
  
  &.secondary {
    background: var(--light-bg);
    color: var(--text-secondary);
  }
  
  &.danger {
    background: #e74c3c;
    color: white;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-light);
  }
`;

const LessonContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const ContentSection = styled.div`
  background: var(--light-bg);
  border-radius: 8px;
  padding: 16px;
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ContentText = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 12px;
  
  &.has-content {
    color: var(--text-primary);
  }
`;

const AddLessonButton = styled.button`
  width: 100%;
  padding: 20px;
  border: 2px dashed var(--light-border);
  border-radius: 16px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
    color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const LessonForm = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--light-border);
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--light-border);
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TakeawayItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const TakeawayInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 2px solid var(--light-border);
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const RemoveButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #c0392b;
  }
`;

const AddButton = styled.button`
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #229954;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--light-border);
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled.button`
  background: var(--light-bg);
  color: var(--text-secondary);
  border: 2px solid var(--light-border);
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--light-border);
  }
`;

const LessonEditor = ({ moduleId, selectedLesson: propSelectedLesson, onLessonSelect, isBuildingMode }) => {
  const [lessons, setLessons] = useState([]);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(propSelectedLesson);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    estimated_duration: 15,
    content_sections: {
      hook: { content: '', media_id: null },
      why_matters: { content: '', media_id: null },
      main_content: { content: '', media_id: null },
      key_takeaways: ['', '', '']
    },
    mini_quiz: []
  });
  const queryClient = useQueryClient();

  // Fetch lessons for the module
  const { data: moduleData, isLoading: moduleLoading } = useQuery(
    ['admin-module', moduleId],
    () => api.get(`/admin/learning-modules/${moduleId}`).then(res => res.data),
    {
      enabled: !!moduleId,
      onSuccess: (data) => {
        console.log('Module data fetched:', data);
        // Try to get lessons from different possible locations
        const lessonsData = data.lessons || data.lesson || data.lessons_list || [];
        console.log('Lessons data found:', lessonsData);
        setLessons(lessonsData);
      },
      onError: (error) => {
        console.error('Error fetching module:', error);
        toast.error('Failed to load module data');
      }
    }
  );



  // Create lesson mutation
  const createLessonMutation = useMutation(
    (lessonData) => {
      console.log('=== Creating Lesson ===');
      console.log('Lesson data:', lessonData);
      console.log('Module ID:', moduleId);
      
      // Prepare the lesson data for the API
      const lessonPayload = {
        title: lessonData.title,
        content: JSON.stringify(lessonData.content_sections),
        estimated_duration: lessonData.estimated_duration || 15,
        order_index: 0, // Will be auto-incremented
        media_urls: JSON.stringify([]) // For future media support
      };
      
      console.log('Lesson payload:', lessonPayload);
      
      // Use the correct API endpoint
      return api.post(`/admin/learning-modules/${moduleId}/lessons`, lessonPayload);
    },
    {
      onSuccess: (data) => {
        console.log('Lesson created successfully:', data);
        toast.success('✅ Lesson created successfully!');
        
        // Invalidate both queries to ensure fresh data
        queryClient.invalidateQueries(['admin-module', moduleId]);
        queryClient.invalidateQueries(['admin-lessons', moduleId]);
        
        // Refresh the lessons list
        queryClient.refetchQueries(['admin-lessons', moduleId]);
        
        setIsCreatingLesson(false);
        setSelectedLesson(null);
        setLessonForm({
          title: '',
          estimated_duration: 15,
          content_sections: {
            hook: { content: '', media_id: null },
            why_matters: { content: '', media_id: null },
            main_content: { content: '', media_id: null },
            key_takeaways: ['', '', '']
          },
          mini_quiz: []
        });
      },
      onError: (error) => {
        console.error('=== Lesson Creation Error ===');
        console.error('Error details:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.message);
        
        // More specific error messages
        if (error.response?.status === 400) {
          toast.error('❌ Invalid lesson data. Please check all required fields.');
        } else if (error.response?.status === 401) {
          toast.error('❌ Unauthorized. Please check your permissions.');
        } else if (error.response?.status === 404) {
          toast.error('❌ Module not found. Please save the module first.');
        } else if (error.response?.status === 500) {
          toast.error('❌ Server error. Please try again later.');
        } else if (error.code === 'NETWORK_ERROR') {
          toast.error('❌ Network error. Please check your connection.');
        } else {
          toast.error(`❌ Failed to create lesson: ${error.message || 'Unknown error'}`);
        }
        
        setIsCreatingLesson(false);
      }
    }
  );

  // Update lesson mutation
  const updateLessonMutation = useMutation(
    ({ lessonId, data }) => {
      console.log('=== Updating Lesson ===');
      console.log('Lesson ID:', lessonId);
      console.log('Update data:', data);
      
      // Prepare the update payload
      const updatePayload = {
        title: data.title,
        content: JSON.stringify(data.content_sections),
        estimated_duration: data.estimated_duration || 15,
        media_urls: JSON.stringify([]) // For future media support
      };
      
      console.log('Update payload:', updatePayload);
      
      return api.put(`/admin/learning-modules/${moduleId}/lessons/${lessonId}`, updatePayload);
    },
    {
      onSuccess: (data, variables) => {
        console.log('Lesson updated successfully:', data);
        toast.success('✅ Lesson updated successfully!');
        
        // Invalidate both queries to ensure fresh data
        queryClient.invalidateQueries(['admin-module', moduleId]);
        queryClient.invalidateQueries(['admin-lessons', moduleId]);
        
        // Update the local lessons state immediately for better UX
        setLessons(prevLessons => 
          prevLessons.map(lesson => 
            lesson.id === variables.lessonId 
              ? { 
                  ...lesson, 
                  title: variables.data.title,
                  estimated_duration: variables.data.estimated_duration,
                  content_sections: variables.data.content_sections
                }
              : lesson
          )
        );
        
        // Close the edit modal
        setSelectedLesson(null);
        setLessonForm({
          title: '',
          estimated_duration: 15,
          content_sections: {
            hook: { content: '', media_id: null },
            why_matters: { content: '', media_id: null },
            main_content: { content: '', media_id: null },
            key_takeaways: ['', '', '']
          },
          mini_quiz: []
        });
      },
      onError: (error) => {
        console.error('Error updating lesson:', error);
        toast.error('❌ Failed to update lesson');
      }
    }
  );

  // Delete lesson mutation
  const deleteLessonMutation = useMutation(
    (lessonId) => {
      console.log('=== Deleting Lesson ===');
      console.log('Lesson ID:', lessonId);
      
      return api.delete(`/admin/learning-modules/${moduleId}/lessons/${lessonId}`);
    },
    {
      onSuccess: (_, lessonId) => {
        toast.success('🗑️ Lesson deleted successfully!');
        queryClient.invalidateQueries(['admin-module', moduleId]);
        queryClient.invalidateQueries(['admin-lessons', moduleId]);
        queryClient.refetchQueries(['admin-lessons', moduleId]);
        if (selectedLesson?.id === lessonId) {
          setSelectedLesson(null);
          setLessonForm({
            title: '',
            estimated_duration: 15,
            content_sections: {
              hook: { content: '', media_id: null },
              why_matters: { content: '', media_id: null },
              main_content: { content: '', media_id: null },
              key_takeaways: ['', '', '']
            },
            mini_quiz: []
          });
        }
      },
      onError: (error) => {
        console.error('Error deleting lesson:', error);
        toast.error('❌ Failed to delete lesson');
      }
    }
  );

  // Handle lesson creation
  const handleCreateLesson = () => {
    if (!moduleId) {
      toast.error('Please save the module first');
      return;
    }

    setIsCreatingLesson(true);
    setEditingLesson(null);
    setLessonForm({
      title: '',
      estimated_duration: 15,
      content_sections: {
        hook: { content: '', media_id: null },
        why_matters: { content: '', media_id: null },
        main_content: { content: '', media_id: null },
        key_takeaways: ['', '', '']
      },
      mini_quiz: []
    });
  };

  // Handle lesson editing
  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setIsCreatingLesson(false);
    
    // Parse the content field if it's a JSON string
    let parsedContent = {};
    try {
      if (lesson.content && typeof lesson.content === 'string') {
        parsedContent = JSON.parse(lesson.content);
      } else if (lesson.content && typeof lesson.content === 'object') {
        parsedContent = lesson.content;
      }
    } catch (error) {
      console.error('Error parsing lesson content:', error);
      parsedContent = {};
    }
    
    setLessonForm({
      title: lesson.title || '',
      estimated_duration: lesson.estimated_duration || 15,
      content_sections: {
        hook: { 
          content: parsedContent.hook?.content || '', 
          media_id: parsedContent.hook?.media_id || null 
        },
        why_matters: { 
          content: parsedContent.why_matters?.content || '', 
          media_id: parsedContent.why_matters?.media_id || null 
        },
        main_content: { 
          content: parsedContent.main_content?.content || '', 
          media_id: parsedContent.main_content?.media_id || null 
        },
        key_takeaways: parsedContent.key_takeaways || ['', '', '']
      },
      mini_quiz: parsedContent.mini_quiz || []
    });
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const [section, subfield] = field.split('.');
      setLessonForm(prev => ({
        ...prev,
        content_sections: {
          ...prev.content_sections,
          [section]: {
            ...prev.content_sections[section],
            [subfield]: value
          }
        }
      }));
    } else {
      setLessonForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle key takeaways changes
  const handleTakeawayChange = (index, value) => {
    const newTakeaways = [...lessonForm.content_sections.key_takeaways];
    newTakeaways[index] = value;
    setLessonForm(prev => ({
      ...prev,
      content_sections: {
        ...prev.content_sections,
        key_takeaways: newTakeaways
      }
    }));
  };

  // Add new key takeaway
  const addTakeaway = () => {
    setLessonForm(prev => ({
      ...prev,
      content_sections: {
        ...prev.content_sections,
        key_takeaways: [...prev.content_sections.key_takeaways, '']
      }
    }));
  };

  // Remove key takeaway
  const removeTakeaway = (index) => {
    if (lessonForm.content_sections.key_takeaways.length > 1) {
      const newTakeaways = lessonForm.content_sections.key_takeaways.filter((_, i) => i !== index);
      setLessonForm(prev => ({
        ...prev,
        content_sections: {
          ...prev.content_sections,
          key_takeaways: newTakeaways
        }
      }));
    }
  };

  // Handle form submission
  const handleSubmitLesson = () => {
    console.log('=== Submitting Lesson ===');
    console.log('Form data:', lessonForm);
    console.log('Module ID:', moduleId);
    console.log('Selected lesson:', selectedLesson);
    
    // Basic validation
    if (!lessonForm.title.trim()) {
      toast.error('❌ Please enter a lesson title');
      return;
    }
    
    if (!moduleId) {
      toast.error('❌ Module ID is missing. Please save the module first.');
      return;
    }
    
    // Clean up the form data
    const cleanedForm = {
      title: lessonForm.title.trim(),
      estimated_duration: lessonForm.estimated_duration || 15,
      content_sections: {
        hook: {
          content: lessonForm.content_sections.hook.content.trim(),
          media_id: lessonForm.content_sections.hook.media_id
        },
        why_matters: {
          content: lessonForm.content_sections.why_matters.content.trim(),
          media_id: lessonForm.content_sections.why_matters.media_id
        },
        main_content: {
          content: lessonForm.content_sections.main_content.content.trim(),
          media_id: lessonForm.content_sections.main_content.media_id
        },
        key_takeaways: lessonForm.content_sections.key_takeaways
          .filter(takeaway => takeaway.trim() !== '')
          .map(takeaway => takeaway.trim())
      },
      mini_quiz: lessonForm.mini_quiz || []
    };
    
    console.log('Cleaned form data:', cleanedForm);
    
    if (selectedLesson) {
      // Update existing lesson
      console.log('Updating lesson:', selectedLesson.id);
      updateLessonMutation.mutate({
        lessonId: selectedLesson.id,
        data: cleanedForm
      });
    } else {
      // Create new lesson
      console.log('Creating new lesson for module:', moduleId);
      createLessonMutation.mutate(cleanedForm);
    }
    
    // Don't reset form here - let the mutation handle it
  };

  // Cancel form
  const handleCancelForm = () => {
    setIsCreatingLesson(false);
    setSelectedLesson(null);
    setLessonForm({
      title: '',
      estimated_duration: 15,
      content_sections: {
        hook: { content: '', media_id: null },
        why_matters: { content: '', media_id: null },
        main_content: { content: '', media_id: null },
        key_takeaways: ['', '', '']
      },
      mini_quiz: []
    });
  };

  // Handle lesson selection
  const handleLessonSelect = (lesson) => {
    console.log('Lesson selected:', lesson);
    console.log('Raw lesson data:', lesson);
    
    // Parse the content field if it's a JSON string
    let parsedContent = {};
    try {
      if (lesson.content && typeof lesson.content === 'string') {
        parsedContent = JSON.parse(lesson.content);
        console.log('Parsed content:', parsedContent);
      } else if (lesson.content && typeof lesson.content === 'object') {
        parsedContent = lesson.content;
      }
    } catch (error) {
      console.error('Error parsing lesson content:', error);
      parsedContent = {};
    }
    
    setSelectedLesson(lesson);
    
    // Call the onLessonSelect prop to notify parent component
    if (onLessonSelect) {
      onLessonSelect(lesson);
    }
    
    // Populate the form with the selected lesson's data
    setLessonForm({
      title: lesson.title || '',
      estimated_duration: lesson.estimated_duration || 15,
      content_sections: {
        hook: { 
          content: parsedContent.hook?.content || '', 
          media_id: parsedContent.hook?.media_id || null 
        },
        why_matters: { 
          content: parsedContent.why_matters?.content || '', 
          media_id: parsedContent.why_matters?.media_id || null 
        },
        main_content: { 
          content: parsedContent.main_content?.content || '', 
          media_id: parsedContent.main_content?.media_id || null 
        },
        key_takeaways: parsedContent.key_takeaways || ['', '', '']
      },
      mini_quiz: parsedContent.mini_quiz || []
    });
    
    console.log('Form populated with:', {
      title: lesson.title || '',
      estimated_duration: lesson.estimated_duration || 15,
      content_sections: {
        hook: { 
          content: parsedContent.hook?.content || '', 
          media_id: parsedContent.hook?.media_id || null 
        },
        why_matters: { 
          content: parsedContent.why_matters?.content || '', 
          media_id: parsedContent.why_matters?.media_id || null 
        },
        main_content: { 
          content: parsedContent.main_content?.content || '', 
          media_id: parsedContent.main_content?.media_id || null 
        },
        key_takeaways: parsedContent.key_takeaways || ['', '', '']
      },
      mini_quiz: parsedContent.mini_quiz || []
    });
  };

  // Handle lesson deletion
  const handleLessonDelete = (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      deleteLessonMutation.mutate(lessonId);
    }
  };

  // Handle lesson update
  const handleLessonUpdate = (lessonId, updatedData) => {
    updateLessonMutation.mutate({ lessonId, data: updatedData });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingLesson(null);
    setLessonForm({
      title: '',
      estimated_duration: 15,
      content_sections: {
        hook: { content: '', media_id: null },
        why_matters: { content: '', media_id: null },
        main_content: { content: '', media_id: null },
        key_takeaways: ['', '', '']
      },
      mini_quiz: []
    });
  };

  // Handle save edited lesson
  const handleSaveEditedLesson = () => {
    if (!editingLesson) return;
    
    const lessonToUpdate = {
      title: lessonForm.title,
      estimated_duration: lessonForm.estimated_duration,
      content_sections: lessonForm.content_sections
    };
    
    handleLessonUpdate(editingLesson.id, lessonToUpdate);
    setEditingLesson(null);
  };

  // Sync selectedLesson with prop when it changes
  useEffect(() => {
    setSelectedLesson(propSelectedLesson);
  }, [propSelectedLesson]);

  // Show building mode interface when no module is selected
  if (!moduleId && isBuildingMode) {
    return (
      <EditorContainer>
        <EditorHeader>
          <EditorTitle>🚀 Lesson Builder</EditorTitle>
          <EditorSubtitle>Create lessons for your new module</EditorSubtitle>
        </EditorHeader>
        
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-light)',
          border: '1px solid var(--light-border)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>📝</div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: '#1e293b', 
            marginBottom: '16px' 
          }}>
            Module Required First
          </h3>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#64748b', 
            lineHeight: '1.6',
            marginBottom: '24px'
          }}>
            To create lessons, you need to first create and save your module. 
            Go to the Module tab to set up your module structure.
          </p>
          <button
            onClick={() => {
              // This will be handled by the parent component to switch tabs
              window.dispatchEvent(new CustomEvent('switchToModuleTab'));
            }}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Go to Module Builder →
          </button>
        </div>
      </EditorContainer>
    );
  }

  // Show error when no module is selected and not in building mode
  if (!moduleId && !isBuildingMode) {
    return (
      <EditorContainer>
        <EditorHeader>
          <EditorTitle>📖 Lesson Editor</EditorTitle>
          <EditorSubtitle>Select a module to edit its lessons</EditorSubtitle>
        </EditorHeader>
        
        <LessonList>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              No Module Selected
            </h3>
            <p style={{ 
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              Please select a module from the Module Builder to edit its lessons
            </p>
          </div>
        </LessonList>
      </EditorContainer>
    );
  }

  if (moduleLoading) {
    return (
      <EditorContainer>
        <EditorHeader>
          <EditorTitle>📖 Lesson Editor</EditorTitle>
          <EditorSubtitle>Loading module data...</EditorSubtitle>
        </EditorHeader>
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      <EditorHeader>
        <EditorTitle>📖 Lesson Editor</EditorTitle>
        <EditorSubtitle>
          Managing lessons for: {moduleData?.title || 'Module'}
        </EditorSubtitle>
      </EditorHeader>

      <LessonList>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          color: 'var(--text-primary)',
          marginBottom: '20px'
        }}>
          📚 Lessons ({lessons.length})
        </h3>

        {lessons.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#6b7280',
            fontSize: '16px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              No Lessons Found
            </h3>
            <p>This module doesn't have any lessons yet. Click "Add Another Lesson" to create your first lesson.</p>
          </div>
        ) : (
          lessons.map((lesson, index) => (
            <div 
              key={lesson.id || index}
              className={selectedLesson?.id === lesson.id ? 'selected' : ''}
              onClick={() => handleLessonSelect(lesson)}
              style={{ 
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              {/* Clean Frontend-style Lesson Card - Exactly like user sees */}
              <div className="lesson-card" style={{ 
                background: selectedLesson?.id === lesson.id ? '#f8fafc' : 'white',
                borderRadius: '12px',
                padding: '20px',
                border: selectedLesson?.id === lesson.id ? '2px solid #10b981' : '1px solid #e5e7eb',
                boxShadow: selectedLesson?.id === lesson.id ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                transition: 'all 0.2s ease',
                minHeight: '100px',
                position: 'relative',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                {/* Yellow Book Icon - Exactly like frontend */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#fbbf24',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: 'white',
                    borderRadius: '2px',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                      right: '2px',
                      height: '2px',
                      background: '#fbbf24',
                      borderRadius: '1px'
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      left: '2px',
                      right: '2px',
                      height: '2px',
                      background: '#fbbf24',
                      borderRadius: '1px'
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '2px',
                      right: '2px',
                      height: '2px',
                      background: '#fbbf24',
                      borderRadius: '1px'
                    }}></div>
                  </div>
                </div>

                {/* Content Section - Clean and simple */}
                <div style={{ 
                  flex: 1, 
                  minWidth: 0,
                  maxWidth: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  overflow: 'hidden'
                }}>
                  {/* Title - Bold and clean */}
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: selectedLesson?.id === lesson.id ? '#10b981' : '#111827',
                    lineHeight: '1.3',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto'
                  }}>
                    {lesson.title}
                  </h3>

                  {/* Description - Simple gray text */}
                  <p style={{ 
                    margin: '0 0 16px 0',
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxHeight: '42px',
                    minHeight: '42px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto'
                  }}>
                    {lesson.content_sections?.main_content?.content ? 
                      lesson.content_sections.main_content.content.substring(0, 80) + (lesson.content_sections.main_content.content.length > 80 ? '...' : '') : 
                      'Lesson content will appear here...'
                    }
                  </p>

                  {/* Bottom Row - Duration & XP - Clean layout */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '500',
                      flexShrink: 0
                    }}>
                      <span>⏱️</span>
                      <span style={{ whiteSpace: 'nowrap' }}>{lesson.estimated_duration || 15} minutes</span>
                    </div>
                    
                    <div style={{ 
                      fontSize: '14px',
                      color: '#f59e0b',
                      fontWeight: '600',
                      flexShrink: 0,
                      whiteSpace: 'nowrap'
                    }}>
                      +{Math.floor((lesson.estimated_duration || 15) * 1.5)} XP
                    </div>
                  </div>
                </div>

                {/* Admin Controls - Edit and Delete buttons */}
                <div className="admin-controls" style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  display: 'flex',
                  gap: '4px',
                  flexShrink: 0,
                  zIndex: 10
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditLesson(lesson);
                    }}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minWidth: 'fit-content'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLessonDelete(lesson.id);
                    }}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minWidth: 'fit-content'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Hover effect to show admin controls */}
              <style>{`
                .lesson-card:hover .admin-controls {
                  opacity: 1 !important;
                }
              `}</style>
            </div>
          ))
        )}

        <AddLessonButton onClick={handleCreateLesson}>
          ➕ Add Another Lesson
        </AddLessonButton>
      </LessonList>

      {/* Lesson Creation/Edit Form */}
      {((isCreatingLesson && !selectedLesson) || editingLesson) && (
        <LessonForm>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: 'var(--text-primary)',
            marginBottom: '24px'
          }}>
            {editingLesson ? '✏️ Edit Lesson' : '➕ Create New Lesson'}
          </h3>
          
          <FormSection>
            <FormLabel>📝 Lesson Title *</FormLabel>
            <FormInput
              type="text"
              value={lessonForm.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              placeholder="Enter lesson title..."
            />
          </FormSection>

          <FormRow>
            <FormSection>
              <FormLabel>⏱️ Estimated Duration (minutes)</FormLabel>
              <FormInput
                type="number"
                min="5"
                max="120"
                value={lessonForm.estimated_duration}
                onChange={(e) => handleFormChange('estimated_duration', parseInt(e.target.value) || 15)}
              />
            </FormSection>
          </FormRow>

          <FormSection>
            <FormLabel>🔥 Opening Hook</FormLabel>
            <FormTextarea
              value={lessonForm.content_sections.hook.content}
              onChange={(e) => handleFormChange('hook.content', e.target.value)}
              placeholder="Start with an engaging hook to capture attention..."
            />
          </FormSection>

          <FormSection>
            <FormLabel>💪 Why This Matters</FormLabel>
            <FormTextarea
              value={lessonForm.content_sections.why_matters.content}
              onChange={(e) => handleFormChange('why_matters.content', e.target.value)}
              placeholder="Explain why this lesson is important and relevant..."
            />
          </FormSection>

          <FormSection>
            <FormLabel>📚 Main Content</FormLabel>
            <FormTextarea
              value={lessonForm.content_sections.main_content.content}
              onChange={(e) => handleFormChange('main_content.content', e.target.value)}
              placeholder="Main lesson content with examples and explanations..."
            />
          </FormSection>

          <FormSection>
            <FormLabel>🔑 Key Takeaways</FormLabel>
            {lessonForm.content_sections.key_takeaways.map((takeaway, index) => (
              <TakeawayItem key={index}>
                <TakeawayInput
                  type="text"
                  value={takeaway}
                  onChange={(e) => handleTakeawayChange(index, e.target.value)}
                  placeholder={`Key takeaway ${index + 1}...`}
                />
                {lessonForm.content_sections.key_takeaways.length > 1 && (
                  <RemoveButton onClick={() => removeTakeaway(index)}>
                    ✕
                  </RemoveButton>
                )}
              </TakeawayItem>
            ))}
            <AddButton onClick={addTakeaway}>
              ➕ Add Takeaway
            </AddButton>
          </FormSection>

          <FormActions>
            <CancelButton onClick={handleCancelForm}>
              Cancel
            </CancelButton>
            <SaveButton 
              onClick={handleSubmitLesson}
              disabled={!lessonForm.title.trim()}
            >
              Create Lesson
            </SaveButton>
          </FormActions>
        </LessonForm>
      )}

      {/* Progress Completion Section - Always at the bottom */}
      {lessons.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '24px',
          boxShadow: 'var(--shadow-light)',
          border: '1px solid var(--light-border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎯</div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '700', 
            color: '#1e293b', 
            marginBottom: '12px' 
          }}>
            Ready for Next Step
          </h3>
          <p style={{ 
            fontSize: '1rem', 
            color: '#64748b', 
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            Continue to create quizzes for your module
          </p>
          
          <button
            onClick={() => {
              // Trigger the progress popup system to show lesson completion
              // and guide to the next step (Quiz Builder) - same as module creation workflow
              window.dispatchEvent(new CustomEvent('showProgressModal', {
                detail: {
                  stage: 'lessons_complete',
                  message: 'Lessons created successfully! Ready to build quizzes?',
                  nextStep: 'quiz_builder',
                  progress: {
                    module: true,
                    lessons: true,
                    quiz: false,
                    publishing: false
                  }
                }
              }));
            }}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🧠 Continue to Quiz Builder
          </button>
        </div>
      )}

      {/* Lesson Edit Screen - Show when a lesson is selected (clicked) */}
      {selectedLesson && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '20px',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                ✏️ Edit Lesson: {selectedLesson.title}
              </h2>
              <button
                onClick={handleCancelForm}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Form Content */}
            <div style={{ padding: '20px' }}>
              <FormSection>
                <FormLabel>📝 Lesson Title *</FormLabel>
                <FormInput
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="Enter lesson title..."
                />
              </FormSection>

              <FormRow>
                <FormSection>
                  <FormLabel>⏱️ Estimated Duration (minutes)</FormLabel>
                  <FormInput
                    type="number"
                    min="5"
                    max="120"
                    value={lessonForm.estimated_duration}
                    onChange={(e) => handleFormChange('estimated_duration', parseInt(e.target.value) || 15)}
                  />
                </FormSection>
              </FormRow>

              <FormSection>
                <FormLabel>🔥 Opening Hook</FormLabel>
                <FormTextarea
                  value={lessonForm.content_sections.hook.content}
                  onChange={(e) => handleFormChange('hook.content', e.target.value)}
                  placeholder="Start with an engaging hook to capture attention..."
                />
              </FormSection>

              <FormSection>
                <FormLabel>💪 Why This Matters</FormLabel>
                <FormTextarea
                  value={lessonForm.content_sections.why_matters.content}
                  onChange={(e) => handleFormChange('why_matters.content', e.target.value)}
                  placeholder="Explain why this lesson is important and relevant..."
                />
              </FormSection>

              <FormSection>
                <FormLabel>📚 Main Content</FormLabel>
                <FormTextarea
                  value={lessonForm.content_sections.main_content.content}
                  onChange={(e) => handleFormChange('main_content.content', e.target.value)}
                  placeholder="Main lesson content with examples and explanations..."
                />
              </FormSection>

              <FormSection>
                <FormLabel>🔑 Key Takeaways</FormLabel>
                {lessonForm.content_sections.key_takeaways.map((takeaway, index) => (
                  <TakeawayItem key={index}>
                    <TakeawayInput
                      type="text"
                      value={takeaway}
                      onChange={(e) => handleTakeawayChange(index, e.target.value)}
                      placeholder={`Key takeaway ${index + 1}...`}
                    />
                    {lessonForm.content_sections.key_takeaways.length > 1 && (
                      <RemoveButton onClick={() => removeTakeaway(index)}>
                        ✕
                      </RemoveButton>
                    )}
                  </TakeawayItem>
                ))}
                <AddButton onClick={addTakeaway}>
                  ➕ Add Takeaway
                </AddButton>
              </FormSection>

              <FormActions>
                <CancelButton onClick={editingLesson ? handleCancelEdit : handleCancelForm}>
                  Cancel
                </CancelButton>
                <SaveButton 
                  onClick={editingLesson ? handleSaveEditedLesson : handleSubmitLesson}
                  disabled={!lessonForm.title.trim()}
                >
                  {editingLesson ? 'Save Changes' : 'Create Lesson'}
                </SaveButton>
              </FormActions>
            </div>
          </div>
        </div>
      )}
    </EditorContainer>
  );
};

export default LessonEditor;
