import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import WelcomeScreen from './src/screens/WelcomeScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [connected, setConnected] = useState(false);
  const [playerName, setPlayerName] = useState('');

  const handleWelcomeContinue = (name) => {
    if (name) {
      setPlayerName(name);
    }
    setCurrentScreen('main');
  };

  const handleConnectWallet = () => {
    // Placeholder for wallet connection
    setConnected(!connected);
  };

  if (currentScreen === 'welcome') {
    return (
      <>
        <WelcomeScreen
          onContinue={handleWelcomeContinue}
          connected={connected}
          onConnectWallet={handleConnectWallet}
          playerName={playerName}
        />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Hoshino, {playerName}!</Text>
      <Text style={styles.subtext}>Your cosmic journey continues here...</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtext: {
    color: '#fff',
    fontSize: 16,
  },
});