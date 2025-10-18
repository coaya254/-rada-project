import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PoliticsHome } from '../screens/politics/PoliticsHome';
import { PoliticianDetailScreen } from '../screens/politics/PoliticianDetailScreen';
import { PoliticalArchive } from '../screens/politics/PoliticalArchive';
import { VotingRecordsScreen as PoliticsVotingRecordsScreen } from '../screens/politics/VotingRecordsScreen';
import { PromiseTrackerScreen } from '../screens/politics/PromiseTrackerScreen';
import { PoliticianComparisonScreen } from '../screens/politics/PoliticianComparisonScreen';
import { PoliticsAdminScreen } from '../screens/admin/PoliticsAdminScreen';
import { CreatePoliticianScreen } from '../screens/admin/CreatePoliticianScreen';
import { ManagePoliticiansScreen } from '../screens/admin/ManagePoliticiansScreen';
import { TimelineEventsScreen } from '../screens/admin/TimelineEventsScreen';
import { EditPoliticianScreen } from '../screens/admin/EditPoliticianScreen';
import { VotingRecordsScreen as AdminVotingRecordsScreen } from '../screens/admin/VotingRecordsScreen';
import { DocumentManagementScreen } from '../screens/admin/DocumentManagementScreen';
import { AdminLoginScreen } from '../screens/admin/AdminLoginScreen';
import { DataIntegrityScreen } from '../screens/admin/DataIntegrityScreen';
import { AnalyticsScreen } from '../screens/admin/AnalyticsScreen';
import { ReportsScreen } from '../screens/admin/ReportsScreen';
import { CommitmentTrackingScreen } from '../screens/admin/CommitmentTrackingScreen';
import { NewsManagementScreen } from '../screens/admin/NewsManagementScreen';
import { CareerManagementScreen } from '../screens/admin/CareerManagementScreen';
import { PoliticianSelectorScreen } from '../screens/admin/PoliticianSelectorScreen';

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
  PoliticsAdmin: undefined;
  CreatePolitician: undefined;
  ManagePoliticians: undefined;
  TimelineEvents: { politicianId?: number };
  CommitmentTracking: { politicianId?: number };
  VotingRecordsAdmin: { politicianId?: number };
  DocumentManagement: { politicianId?: number };
  AdminLogin: undefined;
  EditPolitician: { politicianId: number };
  DataIntegrity: undefined;
  Analytics: undefined;
  Reports: undefined;
  NewsManagement: undefined;
  CareerManagement: { politicianId?: number };
  PoliticianSelector: {
    targetScreen: string;
    title: string;
    allowViewAll?: boolean;
  };
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
        component={PoliticsVotingRecordsScreen}
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
      <Stack.Screen
        name="PoliticsAdmin"
        component={PoliticsAdminScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="CreatePolitician"
        component={CreatePoliticianScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ManagePoliticians"
        component={ManagePoliticiansScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="TimelineEvents"
        component={TimelineEventsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="CommitmentTracking"
        component={CommitmentTrackingScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="VotingRecordsAdmin"
        component={AdminVotingRecordsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="DocumentManagement"
        component={DocumentManagementScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="AdminLogin"
        component={AdminLoginScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="EditPolitician"
        component={EditPoliticianScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="DataIntegrity"
        component={DataIntegrityScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="NewsManagement"
        component={NewsManagementScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="CareerManagement"
        component={CareerManagementScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="PoliticianSelector"
        component={PoliticianSelectorScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};