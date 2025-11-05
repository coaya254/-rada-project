import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LearningHome } from '../screens/learning/LearningHome';
import { ModuleDetailScreen } from '../screens/learning/ModuleDetailScreen';
import { QuizScreen } from '../screens/learning/QuizScreen';
import { LessonScreen } from '../screens/learning/LessonScreen';
import { LeaderboardScreen } from '../screens/learning/LeaderboardScreen';
import { AchievementsScreen } from '../screens/learning/AchievementsScreen';
import { ChallengeDetailScreen } from '../screens/learning/ChallengeDetailScreen';
import { BrowseModulesScreen } from '../screens/learning/BrowseModulesScreen';
import { ProgressDashboardScreen } from '../screens/learning/ProgressDashboardScreen';
import { DailyChallengeScreen } from '../screens/learning/DailyChallengeScreen';
import { LearningPathScreen } from '../screens/learning/LearningPathScreen';
import LearningAdminDashboard from '../screens/admin/LearningAdminDashboard';
import ModulesManagementScreen from '../screens/admin/ModulesManagementScreen';
import LessonsManagementScreen from '../screens/admin/LessonsManagementScreen';
import QuizzesManagementScreen from '../screens/admin/QuizzesManagementScreen';
import QuizQuestionsManagementScreen from '../screens/admin/QuizQuestionsManagementScreen';
import PathsManagementScreen from '../screens/admin/PathsManagementScreen';
import AchievementsManagementScreen from '../screens/admin/AchievementsManagementScreen';
import { DailyChallengesManagementScreen } from '../screens/admin/DailyChallengesManagementScreen';
import { ChallengesManagementScreen } from '../screens/admin/ChallengesManagementScreen';
import EnhancedAdminDashboard from '../screens/admin/EnhancedAdminDashboard';

export type LearningStackParamList = {
  LearningHome: undefined;
  ModuleDetail: {
    module: {
      id: number;
      title: string;
      description: string;
      icon: string;
      progress: number;
      totalLessons: number;
      completedLessons: number;
      xpReward: number;
      difficulty: string;
      category: string;
    };
  };
  Quiz: {
    quizId?: number;
    moduleId?: number;
    title?: string;
  };
  Lesson: {
    lesson: {
      id: number;
      title: string;
      moduleId: number;
      content?: string;
      description?: string;
      duration?: number;
      xp?: number;
      videoUrl?: string;
    };
    lessonQuiz?: {
      id: number;
      title: string;
      description: string;
      quiz_type: 'module' | 'lesson' | 'trivia';
      time_limit: number;
      passing_score: number;
      xp_reward: number;
      question_count: number;
    };
  };
  Leaderboard: undefined;
  Achievements: undefined;
  ChallengeDetail: {
    challenge: {
      id: number;
      title: string;
      description: string;
      xpReward: number;
      participants: number;
      timeLeft: string;
      category: string;
    };
  };
  BrowseModules: undefined;
  ProgressDashboard: undefined;
  DailyChallenge: undefined;
  LearningPath: undefined;
  LearningAdminDashboard: undefined;
  ModulesManagement: undefined;
  LessonsManagement: { moduleId?: number; moduleTitle?: string };
  QuizzesManagement: undefined;
  QuizQuestionsManagement: { quizId: number; quizTitle: string };
  PathsManagement: undefined;
  AchievementsManagement: undefined;
  DailyChallengesManagement: undefined;
  ChallengesManagement: undefined;
  EnhancedAdminDashboard: undefined;
};

const Stack = createNativeStackNavigator<LearningStackParamList>();

export const LearningStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="LearningHome" component={LearningHome} />
      <Stack.Screen
        name="ModuleDetail"
        component={ModuleDetailScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Lesson"
        component={LessonScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ChallengeDetail"
        component={ChallengeDetailScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="BrowseModules"
        component={BrowseModulesScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ProgressDashboard"
        component={ProgressDashboardScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="DailyChallenge"
        component={DailyChallengeScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="LearningPath"
        component={LearningPathScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="LearningAdminDashboard"
        component={LearningAdminDashboard}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="ModulesManagement"
        component={ModulesManagementScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="LessonsManagement"
        component={LessonsManagementScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="QuizzesManagement"
        component={QuizzesManagementScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="QuizQuestionsManagement"
        component={QuizQuestionsManagementScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="PathsManagement"
        component={PathsManagementScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="AchievementsManagement"
        component={AchievementsManagementScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="DailyChallengesManagement"
        component={DailyChallengesManagementScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ChallengesManagement"
        component={ChallengesManagementScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="EnhancedAdminDashboard"
        component={EnhancedAdminDashboard}
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};