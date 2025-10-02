import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabNavigator } from './src/navigation/TabNavigator';
import { AdminAuthProvider } from './src/contexts/AdminAuthContext';
import { AdminDataProvider } from './src/contexts/AdminDataContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AdminAuthProvider>
        <AdminDataProvider>
          <NavigationContainer>
            <TabNavigator />
          </NavigationContainer>
        </AdminDataProvider>
      </AdminAuthProvider>
    </SafeAreaProvider>
  );
}
