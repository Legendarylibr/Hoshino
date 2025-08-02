import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import PetSelectionScreen from '../screens/PetSelectionScreen';
import PetInteractionScreen from '../screens/PetInteractionScreen';
import PetCollectionScreen from '../screens/PetCollectionScreen';
import FeedingScreen from '../screens/FeedingScreen';
import ShopScreen from '../screens/ShopScreen';
import CharacterChatScreen from '../screens/CharacterChatScreen';

export type RootStackParamList = {
  Welcome: undefined;
  PetSelection: { playerName: string };
  PetInteraction: { characterId: string };
  PetCollection: undefined;
  Feeding: { characterId: string };
  Shop: undefined;
  CharacterChat: { characterId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="PetSelection" component={PetSelectionScreen} />
      <Stack.Screen name="PetInteraction" component={PetInteractionScreen} />
      <Stack.Screen name="PetCollection" component={PetCollectionScreen} />
      <Stack.Screen name="Feeding" component={FeedingScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="CharacterChat" component={CharacterChatScreen} />
    </Stack.Navigator>
  );
} 