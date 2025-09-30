import { useState, useEffect, useCallback } from 'react';
import LearningAPI from '../services/LearningAPI';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  progress?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number;
  isCompleted?: boolean;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  timeLimit?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  isCompleted?: boolean;
  score?: number;
}

interface UserProgress {
  userId: string;
  modulesCompleted: number;
  totalModules: number;
  quizzesCompleted: number;
  totalQuizzes: number;
  totalScore: number;
  badges: any[];
}

export const useLearningData = (userId: string) => {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all learning data
  const fetchLearningData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [modulesData, quizzesData, progressData] = await Promise.all([
        LearningAPI.getModules(),
        LearningAPI.getQuizzes(),
        LearningAPI.getUserProgress(userId)
      ]);

      setModules(modulesData || []);
      setQuizzes(quizzesData || []);
      setUserProgress(progressData || null);

    } catch (err) {
      console.error('Error fetching learning data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load learning data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Update module progress
  const updateModuleProgress = useCallback(async (moduleId: string, progress: any) => {
    try {
      await LearningAPI.updateProgress(userId, moduleId, progress);
      
      // Update local state
      setModules(prev => prev.map(module => 
        module.id === moduleId 
          ? { ...module, progress: progress.progress, isCompleted: progress.progress === 100 }
          : module
      ));
    } catch (err) {
      console.error('Error updating module progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    }
  }, [userId]);

  // Submit quiz attempt
  const submitQuiz = useCallback(async (quizId: string, answers: any) => {
    try {
      const result = await LearningAPI.submitQuizAttempt(quizId, answers);
      
      // Update local state
      setQuizzes(prev => prev.map(quiz => 
        quiz.id === quizId 
          ? { ...quiz, isCompleted: true, score: result.score }
          : quiz
      ));

      return result;
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      throw err;
    }
  }, []);

  // Join challenge
  const joinChallenge = useCallback(async (challengeId: string) => {
    try {
      await LearningAPI.joinChallenge(challengeId);
      // Refresh data after joining challenge
      await fetchLearningData();
    } catch (err) {
      console.error('Error joining challenge:', err);
      setError(err instanceof Error ? err.message : 'Failed to join challenge');
    }
  }, [fetchLearningData]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchLearningData();
  }, [fetchLearningData]);

  // Load data on mount
  useEffect(() => {
    if (userId) {
      fetchLearningData();
    }
  }, [fetchLearningData, userId]);

  return {
    modules,
    quizzes,
    userProgress,
    loading,
    error,
    updateModuleProgress,
    submitQuiz,
    joinChallenge,
    refresh
  };
};

export default useLearningData;


