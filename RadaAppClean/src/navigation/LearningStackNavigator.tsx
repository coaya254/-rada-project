import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LearningHome } from '../screens/learning/LearningHome';
import { ModuleDetailScreen } from '../screens/learning/ModuleDetailScreen';
import { QuizScreen } from '../screens/learning/QuizScreen';
import { StudyGroupsScreen } from '../screens/learning/StudyGroupsScreen';
import { LessonScreen } from '../screens/learning/LessonScreen';

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
  StudyGroups: undefined;
  Lesson: {
    lesson: {
      id: number;
      title: string;
      moduleId: number;
      content?: string;
    };
  };
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
        name="StudyGroups"
        component={StudyGroupsScreen}
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
    </Stack.Navigator>
  );
};