import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

interface Props {
  onContinue: (playerName?: string) => void;
  connected: boolean;
  onConnectWallet?: () => void;
  playerName?: string;
}

const WelcomeScreen: React.FC<Props> = ({ onContinue, connected, onConnectWallet, playerName: storedPlayerName }) => {
  const wallet = useWallet();
  const [currentPhase, setCurrentPhase] = useState<'story' | 'name' | 'complete'>('story');
  const [playerName, setPlayerName] = useState(storedPlayerName || '');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isLowercase, setIsLowercase] = useState(false);
  const [selectedKey, setSelectedKey] = useState({ row: 0, col: 0 });
  const [storyTextIndex, setStoryTextIndex] = useState(0);
  const [showStoryImage, setShowStoryImage] = useState(true);
  const [showStarImage, setShowStarImage] = useState(true);
  const [showCompleteImage, setShowCompleteImage] = useState(true);

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

  useEffect(() => {
    if (storedPlayerName && storedPlayerName.trim().length > 0) {
      setPlayerName(storedPlayerName);
      if (connected) {
        setTimeout(() => {
          onContinue(storedPlayerName);
        }, 500);
      }
    }
  }, [storedPlayerName, connected, onContinue]);

  useEffect(() => {
    if (connected && currentPhase === 'complete' && playerName.trim().length > 0) {
      setTimeout(() => {
        onContinue(playerName);
      }, 1000);
    }
  }, [connected, currentPhase, onContinue, playerName]);

  useEffect(() => {
    if (!connected && currentPhase === 'story') {
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
  }, [currentPhase, connected, storyParts.length]);

  useEffect(() => {
    if (!connected) {
      setCurrentPhase('story');
      setStoryTextIndex(0);
    }
  }, [connected]);

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
    } else if (playerName.length < 8) {
      const letter = isLowercase ? key.toLowerCase() : key;
      setPlayerName(prev => prev + letter);
      setCursorPosition(prev => prev + 1);
    }
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

  const getDisplayName = () => {
    const display = playerName.padEnd(8, '*');
    return display.split('').map((char) =>
      char === '*' ? '*' : char
    ).join('');
  };

  return (
    <View style={styles.tamagotchiScreenContainer}>
      <View style={styles.cosmicMoon} />
      <View style={styles.tamagotchiTopStatus}>
        <Text style={styles.walletStatusText}>
          {connected ? '[connected wallet]' : 'Welcome to Hoshino 2025'}
        </Text>
      </View>
      <Image source={require('./logo_final.png')} style={styles.hoshinoTitle} />
      <View style={styles.tamagotchiMainScreen}>
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
        <ImageBackground
          source={require('./screen bg.png')}
          style={styles.mainDisplayArea}
          resizeMode="cover"
        >
          {currentPhase === 'story' && (
            <TouchableOpacity style={styles.storySection} onPress={handleStoryClick}>
              <View style={styles.storyCharacterCentered}>
                {showStoryImage && (
                  <Image
                    source={require('./hoshino star.png')}
                    style={styles.storyCharacterCenterImage}
                    onError={() => setShowStoryImage(false)}
                  />
                )}
              </View>
              <View style={styles.storyDialogBottom}>
                <View style={styles.storyDialogueLargeBox}>
                  <Text style={styles.storySpeakerLarge}>Hoshino:</Text>
                  <Text style={styles.storyTextLarge}>
                    {storyParts[storyTextIndex]}
                  </Text>
                  <Text style={styles.storyPromptLarge}>
                    {storyTextIndex < storyParts.length - 1 ? 'Tap to continue...' : 'Tap to begin...'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          {currentPhase === 'name' && (
            <>
              <View style={styles.starCharacterSection}>
                {showStarImage && (
                  <Image
                    source={require('./hoshino star.png')}
                    style={styles.starCharacterImage}
                    onError={() => setShowStarImage(false)}
                  />
                )}
              </View>
              <View style={styles.nameInputSection}>
                <View style={styles.nameInputContainer}>
                  <View style={styles.customEyes}>
                    <Image
                      source={require('./eyes.png')}
                      style={styles.pixelEyes}
                    />
                  </View>
                  <View style={styles.nameInputTop}>
                    <Text style={styles.namePrompt}>Enter your name!</Text>
                    <Text style={styles.nameDisplay}>{getDisplayName()}</Text>
                  </View>
                  <View style={styles.virtualKeyboard}>
                    {keyboardLayout.map((row, rowIndex) => (
                      <View key={rowIndex} style={styles.keyboardRow}>
                        {row.map((key, colIndex) => (
                          key === '' ? (
                            <View key={colIndex} style={styles.invisibleKey} />
                          ) : (
                            <TouchableOpacity
                              key={colIndex}
                              style={[
                                styles.keyboardKey,
                                selectedKey.row === rowIndex && selectedKey.col === colIndex ? styles.selected : null
                              ]}
                              onPress={() => {
                                setSelectedKey({ row: rowIndex, col: colIndex });
                                handleKeyPress(key);
                              }}
                            >
                              <Text style={styles.keyText}>{key}</Text>
                            </TouchableOpacity>
                          )
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
                {showCompleteImage && (
                  <Image
                    source={require('./hoshino star.png')}
                    style={styles.starCharacterImage}
                    onError={() => setShowCompleteImage(false)}
                  />
                )}
              </View>
              <View style={styles.completionMessage}>
                <Text style={styles.welcomePlayer}>Welcome, {playerName}!</Text>
                <Text style={styles.transitionText}>
                  {connected ? 'Entering the cosmic realm...' : 'Please connect your wallet to continue'}
                </Text>
              </View>
            </View>
          )}
        </ImageBackground>
      </View>
      {currentPhase !== 'story' && (
        <View style={styles.walletConnectionSection}>
          <TouchableOpacity
            style={styles.walletConnectButton}
            onPress={onConnectWallet}
          >
            <Text style={styles.buttonText}>
              {connected && wallet.publicKey
                ? `${wallet.publicKey.toString().slice(0, 4)}...${wallet.publicKey.toString().slice(-4)}`
                : 'Connect Wallet to Continue'
              }
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tamagotchiScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  cosmicMoon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
  },
  tamagotchiTopStatus: {
    width: '100%',
    padding: 10,
    backgroundColor: '#333',
  },
  walletStatusText: {
    color: '#fff',
    textAlign: 'center',
  },
  hoshinoTitle: {
    width: 200,
    height: 50,
    resizeMode: 'contain',
  },
  tamagotchiMainScreen: {
    width: '90%',
    height: '70%',
    backgroundColor: '#111',
    borderRadius: 10,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#fff',
  },
  starRating: {
    color: '#ffd700',
  },
  mainDisplayArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storySection: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCharacterCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCharacterCenterImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  storyDialogBottom: {
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  storyDialogueLargeBox: {
    alignItems: 'center',
  },
  storySpeakerLarge: {
    color: '#fff',
    fontSize: 16,
  },
  storyTextLarge: {
    color: '#fff',
    textAlign: 'center',
  },
  storyPromptLarge: {
    color: '#aaa',
    fontSize: 12,
  },
  starCharacterSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starCharacterImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  nameInputSection: {
    width: '100%',
    padding: 10,
  },
  nameInputContainer: {
    alignItems: 'center',
  },
  customEyes: {
    marginBottom: 10,
  },
  pixelEyes: {
    width: 50,
    height: 20,
    resizeMode: 'contain',
  },
  nameInputTop: {
    alignItems: 'center',
    marginBottom: 10,
  },
  namePrompt: {
    color: '#fff',
    fontSize: 16,
  },
  nameDisplay: {
    color: '#fff',
    fontSize: 20,
    letterSpacing: 2,
  },
  virtualKeyboard: {
    width: '100%',
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  keyboardKey: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    minWidth: 40,
    alignItems: 'center',
  },
  invisibleKey: {
    minWidth: 40,
    opacity: 0,
  },
  selected: {
    backgroundColor: '#555',
  },
  keyText: {
    color: '#fff',
  },
  completeSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionMessage: {
    alignItems: 'center',
    padding: 10,
  },
  welcomePlayer: {
    color: '#fff',
    fontSize: 18,
  },
  transitionText: {
    color: '#aaa',
    fontSize: 14,
  },
  walletConnectionSection: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
  },
  walletConnectButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
});

export default WelcomeScreen;