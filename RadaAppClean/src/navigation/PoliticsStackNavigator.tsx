import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PoliticsHome } from '../screens/politics/PoliticsHome';
import { PoliticianDetailScreen } from '../screens/politics/PoliticianDetailScreen';
import { PoliticalArchive } from '../screens/politics/PoliticalArchive';
import { VotingRecordsScreen } from '../screens/politics/VotingRecordsScreen';
import { PromiseTrackerScreen } from '../screens/politics/PromiseTrackerScreen';
import { PoliticianComparisonScreen } from '../screens/politics/PoliticianComparisonScreen';

export type PoliticsStackParamList = {
  PoliticsHome: undefined;
  PoliticianDetail: {
    politician?: {
      id: number;
      name: string;
      title: string;
      party: string;
      constituency: string;
      image_url?: string;
    };
  };
  PoliticalArchive: undefined;
  VotingRecords: {
    politicianName: string;
    politicianId: number;
  };
  PromiseTracker: {
    politicianName: string;
    politicianId: number;
  };
  PoliticianComparison: undefined;
};

const Stack = createNativeStackNavigator<PoliticsStackParamList>();

export const PoliticsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="PoliticsHome" component={PoliticsHome} />
      <Stack.Screen
        name="PoliticianDetail"
        component={PoliticianDetailScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="PoliticalArchive"
        component={PoliticalArchive}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="VotingRecords"
        component={VotingRecordsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="PromiseTracker"
        component={PromiseTrackerScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="PoliticianComparison"
        component={PoliticianComparisonScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};