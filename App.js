import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GameProvider } from './src/contexts/GameContext';
import { NotificationProvider } from './src/components/NotificationProvider';
import AppNavigator from './src/navigators/AppNavigator';

export default function App() {
  return (
    <NotificationProvider>
      <GameProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </GameProvider>
    </NotificationProvider>
  );
}
