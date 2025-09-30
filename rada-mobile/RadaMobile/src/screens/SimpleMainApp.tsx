import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import LearningHub from './LearningHub';
import LearningHubScreen from './Learning/LearningHubScreen';
import ModulesScreen from './ModulesScreen';
import UnifiedLearningDashboard from './UnifiedLearningDashboard';
import QuizzesScreen from './QuizzesScreen';
import ModuleDetailScreen from './ModuleDetailScreen';
import QuizTakingScreen from './QuizTakingScreen';
import LessonScreen from './LessonScreen';
import QuizScreen from './QuizScreen';
import CompletionScreen from './CompletionScreen';
import ChallengesScreen from './ChallengesScreen';
import BadgesScreen from './BadgesScreen';
import PoliticalArchiveScreen from './PoliticalArchiveScreen';
import PoliticianDetailScreen from './PoliticianDetailScreen';
import PoliticalAnalyticsScreen from './PoliticalAnalyticsScreen';
import PoliticianComparisonScreen from './PoliticianComparisonScreen';

const Stack = createStackNavigator();

const LearningStack = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary.main,
        },
        headerTintColor: colors.primary.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="LearningHub"
        component={LearningHub}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LearningHubOld"
        component={LearningHub}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ModulesScreen"
        component={ModulesScreen}
        options={{ title: 'Learning Modules' }}
      />
      <Stack.Screen
        name="QuizzesScreen"
        component={QuizzesScreen}
        options={{ title: 'Quizzes' }}
      />
      <Stack.Screen
        name="ModuleDetailScreen"
        component={ModuleDetailScreen}
        options={{ title: 'Module Details' }}
      />
      <Stack.Screen
        name="LessonScreen"
        component={LessonScreen}
        options={{ title: 'Lesson' }}
      />
      <Stack.Screen
        name="QuizTakingScreen"
        component={QuizTakingScreen}
        options={{ title: 'Quiz' }}
      />
      <Stack.Screen
        name="QuizScreen"
        component={QuizScreen}
        options={{ title: 'Quiz' }}
      />
      <Stack.Screen
        name="CompletionScreen"
        component={CompletionScreen}
        options={{ title: 'Completion' }}
      />
      <Stack.Screen
        name="ChallengesScreen"
        component={ChallengesScreen}
        options={{ title: 'Challenges' }}
      />
      <Stack.Screen
        name="BadgesScreen"
        component={BadgesScreen}
        options={{ title: 'Badges & Achievements' }}
      />
    </Stack.Navigator>
  );
};

const PoliticsStack = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary.main,
        },
        headerTintColor: colors.primary.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="PoliticalArchive"
        component={PoliticalArchiveScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PoliticianDetail"
        component={PoliticianDetailScreen}
        options={{ title: 'Politician Details' }}
      />
      <Stack.Screen
        name="PoliticalAnalytics"
        component={PoliticalAnalyticsScreen}
        options={{ title: 'Political Analytics' }}
      />
      <Stack.Screen
        name="PoliticianComparison"
        component={PoliticianComparisonScreen}
        options={{ title: 'Compare Politicians' }}
      />
    </Stack.Navigator>
  );
};

const SimpleMainApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { colors, spacing, typography } = useTheme();

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'learn', label: 'Learn', icon: '📚' },
    { id: 'politics', label: 'Politics', icon: '🏛️' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    title: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
      color: colors.text.primary,
      marginBottom: spacing.lg,
    },
    subtitle: {
      fontSize: typography.sizes.lg,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    bottomNav: {
      flexDirection: 'row',
      backgroundColor: colors.background.card,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    navItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    navItemActive: {
      backgroundColor: colors.primary.background,
      borderRadius: spacing.md,
    },
    navIcon: {
      fontSize: 20,
      marginBottom: 4,
    },
    navLabel: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.medium,
      color: colors.text.secondary,
    },
    navLabelActive: {
      color: colors.primary.main,
      fontWeight: typography.weights.semibold,
    },
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <View style={styles.content}>
            <Text style={styles.title}>Welcome to Rada</Text>
            <Text style={styles.subtitle}>
              Your civic engagement platform with a cohesive, clean design.
            </Text>
          </View>
        );
      case 'learn':
        return <LearningStack />;
      case 'politics':
        return <PoliticsStack />;
      case 'profile':
        return (
          <View style={styles.content}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>
              Your profile and settings.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

      {renderContent()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.navItem, activeTab === tab.id && styles.navItemActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.navIcon}>{tab.icon}</Text>
            <Text style={[
              styles.navLabel,
              activeTab === tab.id && styles.navLabelActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default SimpleMainApp;