import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProfileHome } from '../screens/profile/ProfileHome';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { AchievementsScreen } from '../screens/profile/AchievementsScreen';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  EditProfile: {
    currentProfile: {
      name: string;
      email: string;
      bio: string;
      location: string;
    };
  };
  Achievements: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="ProfileHome" component={ProfileHome} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};