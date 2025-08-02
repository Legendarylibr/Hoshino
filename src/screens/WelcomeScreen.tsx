import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Image,
  ScrollView,
  Animated,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigators/AppNavigator';
import { IMAGES } from '../assets/images';
import { useAuthorization } from '../utils/useAuthorization';
import { useUnifiedWallet, WalletType } from '../utils/useUnifiedWallet';
import { useGameContext } from '../contexts/GameContext';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

interface WelcomeScreenProps {}

export default function WelcomeScreen({}: WelcomeScreenProps) {
  const navigation = useNavigation<NavigationProp>();
  const { publicKey, connected } = useAuthorization();
  const { connect, walletType } = useUnifiedWallet();
  const { gameEngine, addNotification } = useGameContext();
  
  const [currentPhase, setCurrentPhase] = useState<'story' | 'name' | 'complete'>('story');
  const [playerName, setPlayerName] = useState('');
  const [storyTextIndex, setStoryTextIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLowercase, setIsLowercase] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Check if wallet is connected
  const isConnected = connected;

  // Story content with enhanced narrative
  const storyParts = [
    "Long ago, Hoshino was a little star dancing through the cosmos...",
    "One day, she slipped out of orbit and accidentally hit the Moon.",
    "The impact left a glowing crater on the lunar surface...",
    "From this magical crater, tiny creatures began emerging.",
    "To make up for the damage done, every new moon cycle...",
    "...Hoshino sends one creature down for you to take care of.",
    "When the moon cycle ends at the full moon, your creature will ascend back...",
    "...changed forever by how you cared for it. Will you be their guardian?",
    "Your cosmic journey begins now! First, tell me your name..."
  ];

  // Animate fade in
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleConnectWallet = async () => {
    try {
      setStatusMessage('Connecting to wallet...');
      await connect();
      setStatusMessage('Wallet connected successfully! 🎉');
      addNotification('Wallet connected successfully!', 'success');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      const errorMessage = error.message || 'Failed to connect wallet. Please try again.';
      setStatusMessage(`❌ ${errorMessage}`);
      addNotification(errorMessage, 'error');
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  const handleContinue = () => {
    if (!playerName.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue');
      return;
    }

    if (!isConnected) {
      Alert.alert(
        'Wallet Required',
        'Please connect your wallet to continue your cosmic adventure'
      );
      return;
    }

    // Save player name to game engine
    gameEngine.setPlayerName(playerName);

    // Navigate to PetSelection screen
    navigation.navigate('PetSelection', { playerName });
  };

  const handleStoryClick = () => {
    if (currentPhase === 'story') {
      if (storyTextIndex < storyParts.length - 1) {
        setStoryTextIndex(prev => prev + 1);
      } else {
        setCurrentPhase('name');
      }
    }
  };

  // Auto-continue after wallet connects and name is provided
  useEffect(() => {
    if (isConnected && currentPhase === 'complete' && playerName.trim().length > 0) {
      setTimeout(() => {
        handleContinue();
      }, 1000);
    }
  }, [isConnected, currentPhase, playerName]);

  // Story progression - only when wallet is not connected
  useEffect(() => {
    if (!isConnected && currentPhase === 'story') {
      const timer = setInterval(() => {
        setStoryTextIndex(prev => {
          if (prev < storyParts.length - 1) {
            return prev + 1;
          } else {
            setCurrentPhase('name');
            return prev;
          }
        });
      }, 3000);

      return () => clearInterval(timer);
    }
  }, [currentPhase, isConnected, storyParts.length]);

  // Reset to story when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setCurrentPhase('story');
      setStoryTextIndex(0);
    }
  }, [isConnected]);

  const keyboardLayout = [
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
    ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    ['Back.', '', 'Lowr.', '', 'Done!']
  ];

  const handleKeyPress = (key: string) => {
    if (currentPhase !== 'name' || key === '') return;

    if (key === 'Back.') {
      if (playerName.length > 0) {
        setPlayerName(prev => prev.slice(0, -1));
        setCursorPosition(prev => Math.max(0, prev - 1));
      }
    } else if (key === 'Lowr.') {
      setIsLowercase(!isLowercase);
    } else if (key === 'Done!') {
      if (playerName.trim().length > 0) {
        setCurrentPhase('complete');
      }
    } else if (playerName.length < 8) { // Max 8 characters
      const newChar = isLowercase ? key.toLowerCase() : key;
      setPlayerName(prev => prev + newChar);
      setCursorPosition(prev => prev + 1);
    }
  };

  const getDisplayName = () => {
    const display = playerName.padEnd(8, '*');
    return display.split('').map((char, index) =>
      char === '*' ? '*' : char
    ).join('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Device Frame - Blank Screen Background */}
      <ImageBackground source={IMAGES.blankScreen} style={styles.deviceFrame} resizeMode="contain">
        <SafeAreaView style={styles.safeArea}>
          {/* Top Status Bar */}
          <View style={styles.topStatusBar}>
            <Text style={styles.walletStatusText}>
              {isConnected ? '[connected wallet]' : 'Welcome to Hoshino 2025'}
            </Text>
          </View>

          {/* HOSHINO Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.hoshinoTitle}>HOSHINO</Text>
          </View>

          {/* Main LCD Screen */}
          <View style={styles.mainScreen}>
            {/* Stats Bar */}
            <View style={styles.statsBar}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Welcome</Text>
                <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Stars</Text>
                <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>2025</Text>
                <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
              </View>
            </View>

            {/* Main Display Area with Screen Background */}
            <ImageBackground source={IMAGES.screenBg} style={styles.mainDisplayArea} resizeMode="cover">
              {currentPhase === 'story' && (
                <TouchableOpacity style={styles.storySection} onPress={handleStoryClick}>
                  {/* Centered Hoshino Character */}
                  <View style={styles.storyCharacterCentered}>
                    <Image
                      source={IMAGES.hoshinoStar}
                      style={styles.storyCharacterCenterImage}
                      resizeMode="contain"
                    />
                  </View>
                  
                  {/* Large Bottom Dialog Box */}
                  <View style={styles.storyDialogBottom}>
                    <View style={styles.storyDialogueLargeBox}>
                      <Text style={styles.storySpeakerLarge}>Hoshino:</Text>
                      <Text style={styles.storyTextLarge}>
                        {storyParts[storyTextIndex]}
                      </Text>
                      <Text style={styles.storyPromptLarge}>
                        {storyTextIndex < storyParts.length - 1 ? 'Click to continue...' : 'Click to begin...'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {currentPhase === 'name' && (
                <>
                  {/* Star Character Section - Top Half */}
                  <View style={styles.starCharacterSection}>
                    <Image
                      source={IMAGES.hoshinoStar}
                      style={styles.starCharacterImage}
                      resizeMode="contain"
                    />
                  </View>
                    
                  {/* Name Input Section - Bottom Half */}
                  <View style={styles.nameInputSection}>
                    <View style={styles.nameInputContainer}>
                      <View style={styles.customEyes}>
                        <Image 
                          source={IMAGES.eyes} 
                          style={styles.pixelEyes}
                          resizeMode="contain"
                        />
                      </View>
                      <View style={styles.nameInputTop}>
                        <Text style={styles.namePrompt}>Enter your name!</Text>
                        <View style={styles.nameDisplay}>
                          <Text style={styles.nameText}>{getDisplayName()}</Text>
                          <View style={[styles.cursor, { left: cursorPosition * 20 }]} />
                        </View>
                      </View>
                      
                      <View style={styles.virtualKeyboard}>
                        {keyboardLayout.map((row, rowIndex) => (
                          <View key={rowIndex} style={styles.keyboardRow}>
                            {row.map((key, keyIndex) => (
                              <TouchableOpacity
                                key={keyIndex}
                                style={[
                                  styles.keyboardKey,
                                  key === '' && styles.invisibleKey
                                ]}
                                onPress={() => handleKeyPress(key)}
                                disabled={key === ''}
                              >
                                <Text style={styles.keyboardKeyText}>{key}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </>
              )}

              {currentPhase === 'complete' && (
                <View style={styles.completeSection}>
                  <View style={styles.starCharacterSection}>
                    <Image
                      source={IMAGES.hoshinoStar}
                      style={styles.starCharacterImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.completionMessage}>
                    <Text style={styles.welcomePlayer}>Welcome, {playerName}!</Text>
                    <Text style={styles.transitionText}>
                      {isConnected ? 'Entering the cosmic realm...' : 'Please connect your wallet to continue'}
                    </Text>
                  </View>
                </View>
              )}
            </ImageBackground>
          </View>

          {/* Wallet Connection Controls */}
          {currentPhase !== 'story' && (
            <View style={styles.walletConnectionSection}>
              <TouchableOpacity 
                style={styles.walletConnectButton}
                onPress={handleConnectWallet}
              >
                <Text style={styles.walletConnectButtonText}>
                  {isConnected && publicKey 
                    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
                    : 'Connect Wallet to Continue'
                  }
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Status Message */}
          {statusMessage && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{statusMessage}</Text>
            </View>
          )}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  deviceFrame: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  topStatusBar: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  walletStatusText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  hoshinoTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  mainScreen: {
    flex: 1,
    margin: 20,
    backgroundColor: 'transparent',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'rgba(230, 211, 163, 0.9)',
    borderRadius: 12,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  starRating: {
    color: '#ffd700',
    fontSize: 16,
  },
  mainDisplayArea: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  storySection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  storyCharacterCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCharacterCenterImage: {
    width: 200,
    height: 200,
  },
  storyDialogBottom: {
    padding: 20,
  },
  storyDialogueLargeBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 15,
  },
  storySpeakerLarge: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  storyTextLarge: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  storyPromptLarge: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
  starCharacterSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starCharacterImage: {
    width: 150,
    height: 150,
  },
  nameInputSection: {
    flex: 1,
    padding: 20,
  },
  nameInputContainer: {
    flex: 1,
    alignItems: 'center',
  },
  customEyes: {
    marginBottom: 20,
  },
  pixelEyes: {
    width: 60,
    height: 30,
  },
  nameInputTop: {
    alignItems: 'center',
    marginBottom: 20,
  },
  namePrompt: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nameDisplay: {
    width: 200,
    height: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  nameText: {
    color: '#fff',
    fontSize: 24,
    letterSpacing: 2,
  },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 25,
    backgroundColor: '#fff',
    bottom: 0,
  },
  virtualKeyboard: {
    width: '100%',
    padding: 10,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  keyboardKey: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
    minWidth: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  invisibleKey: {
    opacity: 0,
  },
  keyboardKeyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completeSection: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  completionMessage: {
    alignItems: 'center',
    padding: 20,
  },
  welcomePlayer: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  transitionText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
  },
  walletConnectionSection: {
    padding: 20,
    alignItems: 'center',
  },
  walletConnectButton: {
    padding: 15,
    backgroundColor: 'rgba(0, 123, 255, 0.8)',
    borderRadius: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  walletConnectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
  },
});


