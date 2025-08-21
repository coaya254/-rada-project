import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LearnHome from '../components/learn/LearnHome';
import Quiz from '../components/learn/Quiz';
import LearningModule from '../components/learn/LearningModule';

const Learn = () => {
  return (
    <Routes>
      <Route index element={<LearnHome />} />
      <Route path="quiz/:quizId?" element={<Quiz />} />
      <Route path="module/:moduleId" element={<LearningModule />} />
    </Routes>
  );
};

export default Learn;