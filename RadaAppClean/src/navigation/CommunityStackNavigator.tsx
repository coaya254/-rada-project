import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CommunityHome } from '../screens/community/CommunityHome';
import { DiscussionDetailScreen } from '../screens/community/DiscussionDetailScreen';
import { CreatePostScreen } from '../screens/community/CreatePostScreen';
import { UserProfileScreen } from '../screens/community/UserProfileScreen';

export type CommunityStackParamList = {
  CommunityHome: undefined;
  DiscussionDetail: {
    discussionId: number;
    title: string;
    author: string;
    timestamp: string;
    replies: number;
    category: string;
  };
  CreatePost: {
    category?: string;
  };
  UserProfile: {
    userId: number;
    username: string;
    avatar?: string;
  };
};

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export const CommunityStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="CommunityHome" component={CommunityHome} />
      <Stack.Screen
        name="DiscussionDetail"
        component={DiscussionDetailScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};