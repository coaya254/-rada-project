import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AnonModeProvider } from './src/contexts/AnonModeContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
// import EnhancedDemo from './src/components/EnhancedDemo';
import SimpleMainApp from './src/screens/SimpleMainApp';

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <AnonModeProvider>
          <FavoritesProvider>
            {/* Simple main app with working navigation */}
            <SimpleMainApp />

            {/* Enhanced Design System Demo - commented out */}
            {/* <EnhancedDemo /> */}

            <StatusBar style="auto" />
          </FavoritesProvider>
        </AnonModeProvider>
      </NavigationContainer>
    </ThemeProvider>
  );
}