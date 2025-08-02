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
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigators/AppNavigator';
import { getCharacterImage } from '../assets/images';
import { useGameContext } from '../contexts/GameContext';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PetInteraction'>;
type RoutePropType = RouteProp<RootStackParamList, 'PetInteraction'>;

interface PetInteractionScreenProps {}

export default function PetInteractionScreen({}: PetInteractionScreenProps) {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { gameEngine, gameState, addNotification } = useGameContext();
  const [scaleAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));

  const { characterId } = route.params;
  const character = gameState.selectedCharacter;
  const stats = gameState.characterStats;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const animateAction = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFeed = () => {
    const result = gameEngine.feedCharacter();
    if (result.success) {
      addNotification(result.message, 'success');
      animateAction();
    } else {
      addNotification(result.message, 'warning');
    }
  };

  const handlePlay = () => {
    const result = gameEngine.playWithCharacter();
    if (result.success) {
      addNotification(result.message, 'success');
      animateAction();
    } else {
      addNotification(result.message, 'warning');
    }
  };

  const handleSleep = () => {
    const result = gameEngine.putCharacterToSleep();
    if (result.success) {
      addNotification(result.message, 'success');
      animateAction();
    } else {
      addNotification(result.message, 'warning');
    }
  };

  const handleChat = () => {
    navigation.navigate('CharacterChat', { characterId });
  };

  const handleCollection = () => {
    navigation.navigate('PetCollection');
  };

  const handleShop = () => {
    navigation.navigate('Shop');
  };

  if (!character) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No character selected</Text>
      </View>
    );
  }

  const getStatColor = (value: number) => {
    if (value >= 4) return '#4CAF50';
    if (value >= 2) return '#FF9800';
    return '#F44336';
  };

  const getStatEmoji = (type: string, value: number) => {
    switch (type) {
      case 'mood':
        if (value >= 4) return '😊';
        if (value >= 2) return '😐';
        return '😢';
      case 'hunger':
        if (value >= 4) return '🍽️';
        if (value >= 2) return '🍽️';
        return '🍽️';
      case 'energy':
        if (value >= 4) return '⚡';
        if (value >= 2) return '⚡';
        return '😴';
      default:
        return '⭐';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{character.name}</Text>
          <Text style={styles.subtitle}>{character.element} • {character.rarity}</Text>
        </View>

        {/* Character Display */}
        <Animated.View style={[styles.characterContainer, { opacity: fadeAnim }]}>
          <Animated.Image
            source={getCharacterImage(character.image, true)}
            style={[styles.characterImage, { transform: [{ scale: scaleAnim }] }]}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Stats Display */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Mood</Text>
            <Text style={[styles.statValue, { color: getStatColor(stats.mood) }]}>
              {getStatEmoji('mood', stats.mood)} {stats.mood}/5
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Hunger</Text>
            <Text style={[styles.statValue, { color: getStatColor(stats.hunger) }]}>
              {getStatEmoji('hunger', stats.hunger)} {stats.hunger}/5
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Energy</Text>
            <Text style={[styles.statValue, { color: getStatColor(stats.energy) }]}>
              {getStatEmoji('energy', stats.energy)} {stats.energy}/5
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleFeed}>
            <Text style={styles.actionButtonText}>🍽️ Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handlePlay}>
            <Text style={styles.actionButtonText}>🎮 Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleSleep}>
            <Text style={styles.actionButtonText}>😴 Sleep</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleChat}>
            <Text style={styles.actionButtonText}>💬 Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton} onPress={handleCollection}>
            <Text style={styles.navButtonText}>Collection</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={handleShop}>
            <Text style={styles.navButtonText}>Shop</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 5,
  },
  characterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImage: {
    width: 200,
    height: 200,
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#111',
    margin: 10,
    borderRadius: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    margin: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#111',
  },
  navButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
}); 