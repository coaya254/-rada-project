import { useState, useCallback } from 'react';
import { useAnonMode } from '../contexts/AnonModeContext';
import { hapticFeedback, showSuccessToast, calculateLevel, calculateCurrentLevelProgress } from '../components/designSystem/utils';

interface GamificationEvent {
  type: 'lesson_completed' | 'quiz_passed' | 'module_completed' | 'challenge_joined' | 'streak_achieved';
  xpGained: number;
  title: string;
  message: string;
}

interface CelebrationData {
  show: boolean;
  title: string;
  message: string;
  xpGained: number;
  type: 'lesson' | 'module' | 'quiz' | 'badge' | 'level';
  newLevel?: boolean;
  newBadges?: string[];
}

export const useGamification = () => {
  const { user, addXP, updateStreak, addBadge } = useAnonMode();
  const [celebration, setCelebration] = useState<CelebrationData>({
    show: false,
    title: '',
    message: '',
    xpGained: 0,
    type: 'lesson',
  });

  const triggerCelebration = useCallback((data: Omit<CelebrationData, 'show'>) => {
    hapticFeedback.success();
    setCelebration({
      ...data,
      show: true,
    });
  }, []);

  const closeCelebration = useCallback(() => {
    setCelebration(prev => ({ ...prev, show: false }));
  }, []);

  const processGamificationEvent = useCallback(async (event: GamificationEvent) => {
    if (!user) return;

    try {
      const currentLevel = calculateLevel(user.total_xp || 0);

      // Add XP and check for level up
      const xpResult = await addXP(event.xpGained, event.type);
      const newLevel = xpResult.newLevel;

      // Update streak for certain events
      if (event.type === 'lesson_completed' || event.type === 'quiz_passed') {
        await updateStreak();
      }

      // Check for new badges
      const newBadges = await checkForNewBadges(event, user.total_xp + event.xpGained);

      // Show appropriate celebration
      if (newLevel) {
        triggerCelebration({
          title: `Level ${xpResult.level} Achieved! 🎉`,
          message: `You've leveled up! Your civic knowledge is growing stronger.`,
          xpGained: event.xpGained,
          type: 'level',
          newLevel: true,
        });
      } else if (newBadges.length > 0) {
        triggerCelebration({
          title: 'New Badge Earned! 🏆',
          message: `You've earned the "${newBadges[0]}" badge!`,
          xpGained: event.xpGained,
          type: 'badge',
          newBadges,
        });
      } else {
        triggerCelebration({
          title: event.title,
          message: event.message,
          xpGained: event.xpGained,
          type: getEventType(event.type),
        });
      }

      // Show success toast for smaller achievements
      if (!newLevel && newBadges.length === 0) {
        showSuccessToast(`+${event.xpGained} XP earned!`, '🌟 Great job!');
      }

    } catch (error) {
      console.error('Error processing gamification event:', error);
    }
  }, [user, addXP, updateStreak, triggerCelebration]);

  const checkForNewBadges = async (event: GamificationEvent, totalXP: number): Promise<string[]> => {
    const newBadges: string[] = [];

    // Define badge criteria
    const badgeCriteria = [
      { id: 'first_lesson', name: 'First Steps', condition: event.type === 'lesson_completed', xpThreshold: 0 },
      { id: 'lesson_master', name: 'Lesson Master', condition: true, xpThreshold: 500 },
      { id: 'quiz_champion', name: 'Quiz Champion', condition: event.type === 'quiz_passed', xpThreshold: 200 },
      { id: 'civic_scholar', name: 'Civic Scholar', condition: true, xpThreshold: 1000 },
      { id: 'knowledge_seeker', name: 'Knowledge Seeker', condition: true, xpThreshold: 2000 },
    ];

    for (const criteria of badgeCriteria) {
      if (criteria.condition && totalXP >= criteria.xpThreshold) {
        // Check if user already has this badge
        const hasbadge = user?.badges?.includes(criteria.id);
        if (!hasbadge) {
          newBadges.push(criteria.name);
          await addBadge(criteria.id);
        }
      }
    }

    return newBadges;
  };

  const getEventType = (eventType: string): CelebrationData['type'] => {
    switch (eventType) {
      case 'lesson_completed':
        return 'lesson';
      case 'module_completed':
        return 'module';
      case 'quiz_passed':
        return 'quiz';
      default:
        return 'lesson';
    }
  };

  // Predefined common events
  const celebrateLessonCompletion = useCallback((lessonTitle: string, xpGained: number = 25) => {
    processGamificationEvent({
      type: 'lesson_completed',
      title: 'Lesson Completed! 📚',
      message: `Great job completing "${lessonTitle}"! Your civic knowledge is growing.`,
      xpGained,
    });
  }, [processGamificationEvent]);

  const celebrateQuizPassed = useCallback((quizTitle: string, score: number, xpGained: number = 50) => {
    processGamificationEvent({
      type: 'quiz_passed',
      title: 'Quiz Passed! 🎯',
      message: `Excellent! You scored ${score}% on "${quizTitle}".`,
      xpGained,
    });
  }, [processGamificationEvent]);

  const celebrateModuleCompletion = useCallback((moduleTitle: string, xpGained: number = 100) => {
    processGamificationEvent({
      type: 'module_completed',
      title: 'Module Completed! 🏆',
      message: `Outstanding! You've mastered "${moduleTitle}".`,
      xpGained,
    });
  }, [processGamificationEvent]);

  const celebrateStreakAchieved = useCallback((days: number, xpGained: number = 20) => {
    processGamificationEvent({
      type: 'streak_achieved',
      title: `${days} Day Streak! 🔥`,
      message: `Amazing consistency! You've learned for ${days} days in a row.`,
      xpGained,
    });
  }, [processGamificationEvent]);

  return {
    celebration,
    closeCelebration,
    processGamificationEvent,
    celebrateLessonCompletion,
    celebrateQuizPassed,
    celebrateModuleCompletion,
    celebrateStreakAchieved,
    userLevel: user ? calculateLevel(user.total_xp || 0) : 1,
    userLevelProgress: user ? calculateCurrentLevelProgress(user.total_xp || 0) : null,
  };
};