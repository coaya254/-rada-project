import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

// Styled Components
const BuilderContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const BuilderHeader = styled.div`
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
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

const QuizSection = styled.div`
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
    border-color: #ff6b6b;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
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
    border-color: #ff6b6b;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
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
    border-color: #ff6b6b;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
  }
`;

const QuestionCard = styled.div`
  background: var(--light-bg);
  border: 2px solid var(--light-border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #ff6b6b;
    box-shadow: var(--shadow-light);
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const QuestionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const QuestionActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
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

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--light-border);
`;

const OptionRadio = styled.input`
  accent-color: #ff6b6b;
`;

const OptionText = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--light-border);
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #ff6b6b;
  }
`;

const AddQuestionButton = styled.button`
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
    border-color: #ff6b6b;
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.05);
  }
`;

const QuizStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: var(--light-bg);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const QuizBuilder = ({ moduleId, isBuildingMode }) => {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    time_limit: 30,
    passing_score: 70,
    xp_reward: 100,
    difficulty: 'intermediate'
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch module quiz data
  const { data: moduleData, isLoading: moduleLoading } = useQuery(
    ['admin-module', moduleId],
    () => api.get(`/admin/learning-modules/${moduleId}`).then(res => res.data),
    {
      enabled: !!moduleId,
      onSuccess: (data) => {
        if (data.quiz) {
          setQuizData({
            title: data.quiz.title || '',
            description: data.quiz.description || '',
            passing_score: data.quiz.passing_score || 70,
            time_limit: data.quiz.time_limit || 25,
            xp_reward: data.quiz.xp_reward || 100,
            difficulty: data.quiz.difficulty || 'intermediate'
          });
          setQuestions(data.quiz.questions || []);
        }
      },
      onError: (error) => {
        console.error('Error fetching module:', error);
        toast.error('Failed to load module data');
      }
    }
  );

  // Create/Update quiz mutation
  const saveQuizMutation = useMutation(
    (quizData) => {
      if (moduleData?.quiz) {
        console.log('Updating existing quiz:', moduleData.quiz.id);
        return api.put(`/admin/quizzes/${moduleData.quiz.id}`, quizData);
      } else {
        // For new quiz creation, structure the request properly
        const { questions, ...quizInfo } = quizData;
        const requestBody = {
          module_id: moduleId,
          ...quizInfo,
          questions: questions
        };
        console.log('Creating new quiz with data:', requestBody);
        return api.post(`/admin/quizzes`, requestBody);
      }
    },
    {
      onSuccess: (data) => {
        console.log('Quiz saved successfully:', data);
        toast.success('Quiz saved successfully!');
        queryClient.invalidateQueries(['admin-module', moduleId]);
      },
      onError: (error) => {
        console.error('Error saving quiz:', error);
        console.error('Error response:', error.response);
        toast.error('Failed to save quiz');
      }
    }
  );

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle quiz save
  const handleSaveQuiz = () => {
    if (!quizData.title) {
      toast.error('Quiz title is required');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    const quizToSave = {
      ...quizData,
      questions: questions
    };

    console.log('=== Saving Quiz ===');
    console.log('Module ID:', moduleId);
    console.log('Quiz Data:', quizData);
    console.log('Questions:', questions);
    console.log('Quiz to Save:', quizToSave);

    saveQuizMutation.mutate(quizToSave);
  };

  // Handle question creation
  const handleCreateQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question_text: 'New question text',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correct_answer: 0,
      explanation: 'Explanation for the correct answer',
      difficulty: 'easy',
      points: 1
    };

    setQuestions(prev => [...prev, newQuestion]);
    setCurrentQuestion(newQuestion);
    setShowQuestionForm(true);
  };

  // Handle edit question
  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  // Handle save edited question
  const handleSaveEditedQuestion = () => {
    if (editingQuestion) {
      setQuestions(prev => prev.map(q => 
        q.id === editingQuestion.id ? editingQuestion : q
      ));
      setEditingQuestion(null);
      setShowQuestionForm(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setShowQuestionForm(false);
  };

  // Handle question update
  const handleQuestionUpdate = (questionId, updatedData) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, ...updatedData } : q
    ));
  };

  // Handle question deletion
  const handleQuestionDelete = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      if (currentQuestion?.id === questionId) {
        setCurrentQuestion(null);
      }
    }
  };

  // Handle option update
  const handleOptionUpdate = (questionId, optionIndex, value) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  // Handle correct answer change
  const handleCorrectAnswerChange = (questionId, correctIndex) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, correct_answer: correctIndex } : q
    ));
  };

  // Show building mode interface when no module is selected
  if (!moduleId && isBuildingMode) {
    return (
      <BuilderContainer>
        <BuilderHeader>
          <BuilderTitle>🚀 Quiz Builder</BuilderTitle>
          <BuilderSubtitle>Create quizzes for your new module</BuilderSubtitle>
        </BuilderHeader>
        
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-light)',
          border: '1px solid var(--light-border)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>❓</div>
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
            To create quizzes, you need to first create and save your module. 
            Go to the Module tab to set up your module structure.
          </p>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('switchToModuleTab'));
            }}
            style={{
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
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
              e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Go to Module Builder →
          </button>
        </div>
      </BuilderContainer>
    );
  }

  if (!moduleId) {
    return (
      <BuilderContainer>
        <BuilderHeader>
          <BuilderTitle>🧠 Quiz Builder</BuilderTitle>
          <BuilderSubtitle>Select a module to create or edit its quiz</BuilderSubtitle>
        </BuilderHeader>
        
        <QuizSection>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
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
              Please select a module from the Module Builder to create its quiz
            </p>
          </div>
        </QuizSection>
      </BuilderContainer>
    );
  }

  if (moduleLoading) {
    return (
      <BuilderContainer>
        <BuilderHeader>
          <BuilderTitle>🧠 Quiz Builder</BuilderTitle>
          <BuilderSubtitle>Loading module data...</BuilderSubtitle>
        </BuilderHeader>
      </BuilderContainer>
    );
  }

  // Calculate quiz statistics
  const totalQuestions = questions.length;
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
  const averageDifficulty = questions.length > 0 ? 
    questions.reduce((sum, q) => sum + (q.difficulty === 'easy' ? 1 : q.difficulty === 'intermediate' ? 2 : 3), 0) / questions.length : 0;

  return (
    <BuilderContainer>
      <BuilderHeader>
        <BuilderTitle>🧠 Quiz Builder</BuilderTitle>
        <BuilderSubtitle>
          {moduleData?.quiz ? 'Edit quiz for' : 'Create quiz for'}: {moduleData?.title || 'Module'}
        </BuilderSubtitle>
      </BuilderHeader>

      {/* Quiz Information */}
      <QuizSection>
        <SectionTitle>📋 QUIZ INFORMATION</SectionTitle>
        
        <FormGrid>
          <FormGroup>
            <FormLabel>Title</FormLabel>
            <FormInput
              type="text"
              placeholder="📊 Module Quiz"
              value={quizData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Description</FormLabel>
            <FormTextarea
              placeholder="Test your understanding of this module"
              value={quizData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Passing Score (%)</FormLabel>
            <FormInput
              type="number"
              placeholder="70"
              value={quizData.passing_score}
              onChange={(e) => handleInputChange('passing_score', parseInt(e.target.value))}
              min="0"
              max="100"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Time Limit (minutes)</FormLabel>
            <FormInput
              type="number"
              placeholder="25"
              value={quizData.time_limit}
              onChange={(e) => handleInputChange('time_limit', parseInt(e.target.value))}
              min="1"
              max="120"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>XP Reward</FormLabel>
            <FormInput
              type="number"
              placeholder="100"
              value={quizData.xp_reward}
              onChange={(e) => handleInputChange('xp_reward', parseInt(e.target.value))}
              min="0"
              max="1000"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Difficulty</FormLabel>
            <FormSelect
              value={quizData.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="intermediate">Intermediate</option>
              <option value="hard">Hard</option>
            </FormSelect>
          </FormGroup>
        </FormGrid>

        {/* Quiz Statistics */}
        <QuizStats>
          <StatCard>
            <StatNumber>{totalQuestions}</StatNumber>
            <StatLabel>Total Questions</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{totalPoints}</StatNumber>
            <StatLabel>Total Points</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{Math.round(averageDifficulty * 10) / 10}</StatNumber>
            <StatLabel>Avg Difficulty</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{quizData.time_limit}</StatNumber>
            <StatLabel>Time Limit (min)</StatLabel>
          </StatCard>
        </QuizStats>
      </QuizSection>

      {/* Questions Section */}
      <QuizSection>
        <SectionTitle>❓ QUIZ QUESTIONS ({totalQuestions})</SectionTitle>
        
        {questions.map((question, index) => (
          <QuestionCard key={question.id}>
            <QuestionHeader>
              <QuestionTitle>Question {index + 1}</QuestionTitle>
              <QuestionActions>
                                 <ActionButton
                   type="button"
                   className="primary"
                   onClick={() => handleEditQuestion(question)}
                 >
                   ✏️ Edit
                 </ActionButton>
                <ActionButton
                  type="button"
                  className="danger"
                  onClick={() => handleQuestionDelete(question.id)}
                >
                  🗑️ Delete
                </ActionButton>
              </QuestionActions>
            </QuestionHeader>

            <div style={{ marginBottom: '16px' }}>
              <FormTextarea
                placeholder="Enter your question here..."
                value={question.question_text}
                onChange={(e) => handleQuestionUpdate(question.id, { question_text: e.target.value })}
                style={{ marginBottom: '12px' }}
              />
            </div>

            <OptionsList>
              {question.options.map((option, optionIndex) => (
                <OptionItem key={optionIndex}>
                  <OptionRadio
                    type="radio"
                    name={`correct_${question.id}`}
                    checked={question.correct_answer === optionIndex}
                    onChange={() => handleCorrectAnswerChange(question.id, optionIndex)}
                  />
                  <OptionText
                    type="text"
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => handleOptionUpdate(question.id, optionIndex, e.target.value)}
                  />
                </OptionItem>
              ))}
            </OptionsList>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormGroup>
                <FormLabel>Explanation</FormLabel>
                <FormTextarea
                  placeholder="Explain why this answer is correct..."
                  value={question.explanation}
                  onChange={(e) => handleQuestionUpdate(question.id, { explanation: e.target.value })}
                  style={{ minHeight: '80px' }}
                />
              </FormGroup>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <FormGroup>
                  <FormLabel>Difficulty</FormLabel>
                  <FormSelect
                    value={question.difficulty}
                    onChange={(e) => handleQuestionUpdate(question.id, { difficulty: e.target.value })}
                  >
                    <option value="easy">Easy</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="hard">Hard</option>
                  </FormSelect>
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>Points</FormLabel>
                  <FormInput
                    type="number"
                    placeholder="1"
                    value={question.points}
                    onChange={(e) => handleQuestionUpdate(question.id, { points: parseInt(e.target.value) })}
                    min="1"
                    max="10"
                  />
                </FormGroup>
              </div>
            </div>
          </QuestionCard>
        ))}

                 <AddQuestionButton onClick={handleCreateQuestion}>
           ➕ Add Question
         </AddQuestionButton>
       </QuizSection>

       {/* Question Edit Modal */}
       {showQuestionForm && (
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
             padding: '24px',
             maxWidth: '600px',
             width: '100%',
             maxHeight: '80vh',
             overflow: 'auto'
           }}>
             <h3 style={{ 
               fontSize: '20px', 
               fontWeight: '700', 
               marginBottom: '20px',
               color: 'var(--text-primary)'
             }}>
               {editingQuestion ? 'Edit Question' : 'Add New Question'}
             </h3>
             
             <FormGroup>
               <FormLabel>Question Text</FormLabel>
               <FormTextarea
                 placeholder="Enter your question here..."
                 value={editingQuestion?.question_text || currentQuestion?.question_text || ''}
                 onChange={(e) => {
                   if (editingQuestion) {
                     setEditingQuestion({...editingQuestion, question_text: e.target.value});
                   } else if (currentQuestion) {
                     setCurrentQuestion({...currentQuestion, question_text: e.target.value});
                   }
                 }}
               />
             </FormGroup>

             <FormGroup>
               <FormLabel>Options</FormLabel>
               {[0, 1, 2, 3].map((index) => (
                 <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                   <input
                     type="radio"
                     name="correct_answer"
                     checked={(editingQuestion?.correct_answer || currentQuestion?.correct_answer || 0) === index}
                     onChange={() => {
                       if (editingQuestion) {
                         setEditingQuestion({...editingQuestion, correct_answer: index});
                       } else if (currentQuestion) {
                         setCurrentQuestion({...currentQuestion, correct_answer: index});
                       }
                     }}
                   />
                   <FormInput
                     placeholder={`Option ${index + 1}`}
                     value={(editingQuestion?.options || currentQuestion?.options || ['', '', '', ''])[index] || ''}
                     onChange={(e) => {
                       const newOptions = [...(editingQuestion?.options || currentQuestion?.options || ['', '', '', ''])];
                       newOptions[index] = e.target.value;
                       if (editingQuestion) {
                         setEditingQuestion({...editingQuestion, options: newOptions});
                       } else if (currentQuestion) {
                         setCurrentQuestion({...currentQuestion, options: newOptions});
                       }
                     }}
                   />
                 </div>
               ))}
             </FormGroup>

             <FormGroup>
               <FormLabel>Explanation</FormLabel>
               <FormTextarea
                 placeholder="Explain why this answer is correct..."
                 value={editingQuestion?.explanation || currentQuestion?.explanation || ''}
                 onChange={(e) => {
                   if (editingQuestion) {
                     setEditingQuestion({...editingQuestion, explanation: e.target.value});
                   } else if (currentQuestion) {
                     setCurrentQuestion({...currentQuestion, explanation: e.target.value});
                   }
                 }}
               />
             </FormGroup>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
               <FormGroup>
                 <FormLabel>Difficulty</FormLabel>
                 <FormSelect
                   value={editingQuestion?.difficulty || currentQuestion?.difficulty || 'easy'}
                   onChange={(e) => {
                     if (editingQuestion) {
                       setEditingQuestion({...editingQuestion, difficulty: e.target.value});
                     } else if (currentQuestion) {
                       setCurrentQuestion({...currentQuestion, difficulty: e.target.value});
                     }
                   }}
                 >
                   <option value="easy">Easy</option>
                   <option value="intermediate">Intermediate</option>
                   <option value="hard">Hard</option>
                 </FormSelect>
               </FormGroup>
               
               <FormGroup>
                 <FormLabel>Points</FormLabel>
                 <FormInput
                   type="number"
                   placeholder="1"
                   value={editingQuestion?.points || currentQuestion?.points || 1}
                   onChange={(e) => {
                     if (editingQuestion) {
                       setEditingQuestion({...editingQuestion, points: parseInt(e.target.value)});
                     } else if (currentQuestion) {
                       setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value)});
                     }
                   }}
                   min="1"
                   max="10"
                 />
               </FormGroup>
             </div>

             <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
               <ActionButton
                 type="button"
                 className="secondary"
                 onClick={handleCancelEdit}
               >
                 Cancel
               </ActionButton>
               <ActionButton
                 type="button"
                 className="primary"
                 onClick={editingQuestion ? handleSaveEditedQuestion : () => {
                   if (currentQuestion) {
                     setQuestions(prev => [...prev, currentQuestion]);
                     setCurrentQuestion(null);
                     setShowQuestionForm(false);
                   }
                 }}
               >
                 {editingQuestion ? 'Save Changes' : 'Add Question'}
               </ActionButton>
             </div>
           </div>
         </div>
       )}

       {/* Save Quiz Button */}
      <QuizSection>
        <div style={{ textAlign: 'center' }}>
          <ActionButton
            type="button"
            className="primary"
            onClick={handleSaveQuiz}
            style={{ 
              padding: '16px 32px', 
              fontSize: '16px',
              background: 'linear-gradient(135deg, #4caf50, #45a049)'
            }}
          >
            💾 Save Quiz
          </ActionButton>
        </div>
      </QuizSection>
    </BuilderContainer>
  );
};

export default QuizBuilder;

