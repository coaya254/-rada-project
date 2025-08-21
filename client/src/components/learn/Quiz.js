import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useEnhancedUser } from '../../contexts/EnhancedUserContext';
import api from '../../utils/api';

const QuizContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--light-bg);
  padding: 20px;
`;

const QuizHeader = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-light);
  text-align: center;
`;

const QuizTitle = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const QuizDescription = styled.p`
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: 20px;
`;

const QuizProgress = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: var(--light-bg);
  border-radius: 4px;
  margin: 0 16px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #81c784);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const QuestionCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-light);
`;

const QuestionText = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  line-height: 1.5;
`;

const OptionButton = styled.button`
  width: 100%;
  padding: 16px 20px;
  margin-bottom: 12px;
  border: 2px solid ${props => props.selected ? '#4caf50' : 'var(--light-border)'};
  background: ${props => props.selected ? 'rgba(76, 175, 80, 0.1)' : 'white'};
  border-radius: 12px;
  text-align: left;
  font-size: 16px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #4caf50;
    background: rgba(76, 175, 80, 0.05);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const OptionLetter = styled.span`
  display: inline-block;
  width: 24px;
  height: 24px;
  background: ${props => props.selected ? '#4caf50' : 'var(--light-border)'};
  color: ${props => props.selected ? 'white' : 'var(--text-secondary)'};
  border-radius: 50%;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
`;

const NavButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
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

const Timer = styled.div`
  background: #ff9800;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
`;

const Quiz = ({ onComplete }) => {
  const { quizId } = useParams();
  const { user, awardXP  } = useEnhancedUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Sample quiz data - in production this would come from the API
  const quizData = {
    id: quizId || 'daily_quiz',
    title: "Daily Civic Knowledge Quiz",
    description: "Test your understanding of Kenyan civic issues",
    questions: [
      {
        id: 1,
        question: "What year was Kenya's current Constitution promulgated?",
        options: ["2007", "2010", "2013", "2015"],
        correct: 1,
        explanation: "Kenya's current Constitution was promulgated on August 27, 2010, replacing the 1963 independence Constitution."
      },
      {
        id: 2,
        question: "How many counties does Kenya have?",
        options: ["45", "46", "47", "48"],
        correct: 2,
        explanation: "Kenya has 47 counties as established by the 2010 Constitution under the devolution system."
      },
      {
        id: 3,
        question: "Which body is responsible for conducting elections in Kenya?",
        options: ["IEBC", "ECK", "KANU", "Parliament"],
        correct: 0,
        explanation: "The Independent Electoral and Boundaries Commission (IEBC) is responsible for conducting elections in Kenya."
      },
      {
        id: 4,
        question: "What is the minimum voting age in Kenya?",
        options: ["16 years", "18 years", "21 years", "25 years"],
        correct: 1,
        explanation: "The minimum voting age in Kenya is 18 years as guaranteed by the Constitution."
      },
      {
        id: 5,
        question: "Which chapter of the Constitution contains the Bill of Rights?",
        options: ["Chapter 1", "Chapter 4", "Chapter 6", "Chapter 10"],
        correct: 1,
        explanation: "Chapter 4 of the Kenyan Constitution contains the Bill of Rights, which guarantees fundamental freedoms."
      },
      {
        id: 6,
        question: "What is the main function of the Senate in Kenya?",
        options: ["Making laws", "Representing counties", "Both A and B", "Neither A nor B"],
        correct: 2,
        explanation: "The Senate's main functions are making laws and representing counties in the national government."
      },
      {
        id: 7,
        question: "Which commission is responsible for fighting corruption in Kenya?",
        options: ["EACC", "KACC", "DCI", "KRA"],
        correct: 0,
        explanation: "The Ethics and Anti-Corruption Commission (EACC) is responsible for fighting corruption in Kenya."
      },
      {
        id: 8,
        question: "What is the term of office for a Kenyan President?",
        options: ["4 years", "5 years", "6 years", "7 years"],
        correct: 1,
        explanation: "The President of Kenya serves a term of 5 years as specified in the Constitution."
      },
      {
        id: 9,
        question: "Which right is NOT guaranteed in the Bill of Rights?",
        options: ["Right to life", "Right to education", "Right to property", "Right to drive"],
        correct: 3,
        explanation: "The right to drive is not a fundamental right guaranteed in the Constitution, unlike the other options."
      },
      {
        id: 10,
        question: "What is the role of the Judiciary in Kenya?",
        options: ["Making laws", "Enforcing laws", "Interpreting laws", "All of the above"],
        correct: 2,
        explanation: "The Judiciary's primary role is interpreting laws and administering justice, not making or enforcing laws."
      }
    ]
  };

  useEffect(() => {
    setTotalQuestions(quizData.questions.length);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(selectedAnswers).length < quizData.questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    // Calculate score
    let correctAnswers = 0;
    quizData.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correct) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / quizData.questions.length) * 100);
    setScore(finalScore);
    setIsComplete(true);

    // Award XP based on score
    let xpEarned = 0;
    try {
      if (finalScore >= 90) {
        xpEarned = 100;
        toast.success(`Excellent! Perfect score! (+${xpEarned} XP) 🎉`);
      } else if (finalScore >= 80) {
        xpEarned = 75;
        toast.success(`Great job! (+${xpEarned} XP) 🎯`);
      } else if (finalScore >= 70) {
        xpEarned = 50;
        toast.success(`Good work! (+${xpEarned} XP) 👍`);
      } else if (finalScore >= 60) {
        xpEarned = 25;
        toast.success(`Not bad! (+${xpEarned} XP) 📚`);
      } else {
        toast('Keep studying! You\'ll do better next time 💪');
      }

      if (xpEarned > 0) {
        await awardXP('quiz_completion', xpEarned, quizId, 'quiz');
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    }

    if (onComplete) {
      onComplete(finalScore, xpEarned);
    }
  };

  const currentQ = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  if (isComplete) {
    return (
      <QuizContainer>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', padding: '40px 20px' }}
        >
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>
            {score >= 80 ? '🎉' : score >= 60 ? '👍' : '📚'}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Quiz Complete!
          </h1>
          <div style={{ fontSize: '48px', fontWeight: '800', color: '#4caf50', marginBottom: '20px' }}>
            {score}%
          </div>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
            You answered {Math.round((score / 100) * totalQuestions)} out of {totalQuestions} questions correctly
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <NavButton className="primary" onClick={() => window.location.reload()}>
              Take Quiz Again
            </NavButton>
            <NavButton className="secondary" onClick={() => window.history.back()}>
              Back to Learn Hub
            </NavButton>
          </div>
        </motion.div>
      </QuizContainer>
    );
  }

  return (
    <QuizContainer>
      <QuizHeader>
        <QuizTitle>{quizData.title}</QuizTitle>
        <QuizDescription>{quizData.description}</QuizDescription>
        
        <QuizProgress>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Question {currentQuestion + 1} of {quizData.questions.length}
          </span>
          <ProgressBar>
            <ProgressFill style={{ width: `${progress}%` }} />
          </ProgressBar>
          <Timer>⏰ {formatTime(timeLeft)}</Timer>
        </QuizProgress>
      </QuizHeader>

      <QuestionCard
        key={currentQ.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <QuestionText>{currentQ.question}</QuestionText>
        
        {currentQ.options.map((option, index) => (
          <OptionButton
            key={index}
            selected={selectedAnswers[currentQ.id] === index}
            onClick={() => handleAnswerSelect(currentQ.id, index)}
            disabled={isComplete}
          >
            <OptionLetter selected={selectedAnswers[currentQ.id] === index}>
              {String.fromCharCode(65 + index)}
            </OptionLetter>
            {option}
          </OptionButton>
        ))}

        <NavigationButtons>
          <NavButton
            className="secondary"
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </NavButton>
          
          {currentQuestion === quizData.questions.length - 1 ? (
            <NavButton
              className="primary"
              onClick={handleSubmitQuiz}
              disabled={Object.keys(selectedAnswers).length < quizData.questions.length}
            >
              Submit Quiz
            </NavButton>
          ) : (
            <NavButton
              className="primary"
              onClick={handleNextQuestion}
            >
              Next →
            </NavButton>
          )}
        </NavigationButtons>
      </QuestionCard>
    </QuizContainer>
  );
};

export default Quiz;
