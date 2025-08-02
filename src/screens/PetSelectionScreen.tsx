import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  FlatList,
  SafeAreaView,
  Image,
  Animated,
  ImageBackground,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigators/AppNavigator';
import { getCharacterImage, getRarityColor } from '../assets/images';
import { useGameContext } from '../contexts/GameContext';
import { Character } from '../services/LocalGameEngine';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PetSelection'>;
type RoutePropType = RouteProp<RootStackParamList, 'PetSelection'>;

const CHARACTERS: Character[] = [
  {
    id: 'lyra',
    name: 'Lyra',
    description: 'Anime-obsessed celestial maiden who knows every existing anime. Has a secret soft spot for Orion but would NEVER admit it. Very comprehensive when chatting, but turns into an exaggerated crying mess if ignored.',
    image: 'lyra',
    element: 'Love',
    baseStats: { mood: 4, hunger: 3, energy: 3 },
    rarity: 'Common',
    specialAbility: 'Healing Aura - Recovers faster when resting',
    nftMint: null
  },
  {
    id: 'orion',
    name: 'Orion',
    description: 'Mystical guardian with moon and stars. A quiet and contemplative celestial being who finds peace in the night sky. Has a deep connection to lunar cycles and stellar movements.',
    image: 'orion',
    element: 'Moon',
    baseStats: { mood: 3, hunger: 4, energy: 3 },
    rarity: 'Rare',
    specialAbility: 'Night Vision - Gains energy during nighttime',
    nftMint: null
  },
  {
    id: 'sirius',
    name: 'Sirius',
    description: 'The brightest star guardian with unmatched luminosity. Known as the Dog Star, Sirius is fiercely loyal and radiates powerful stellar energy. Has an intense, focused personality.',
    image: 'sirius',
    element: 'Stellar',
    baseStats: { mood: 5, hunger: 3, energy: 4 },
    rarity: 'Legendary',
    specialAbility: 'Stellar Radiance - Boosts all stats when mood is at maximum',
    nftMint: null
  },
  {
    id: 'aro',
    name: 'ARO',
    description: 'A vibrant and energetic celestial companion with a playful spirit. ARO loves to explore and discover new cosmic phenomena, always bringing joy and excitement to any adventure.',
    image: 'aro',
    element: 'Cosmic',
    baseStats: { mood: 4, hunger: 2, energy: 5 },
    rarity: 'Epic',
    specialAbility: 'Cosmic Burst - Increases energy regeneration when happy',
    nftMint: null
  },
  {
    id: 'zaniah',
    name: 'Zaniah',
    description: 'An elegant and graceful stellar entity with wisdom beyond the stars. Zaniah possesses ancient knowledge of the cosmos and serves as a guide for those seeking celestial enlightenment.',
    image: 'zaniah',
    element: 'Wisdom',
    baseStats: { mood: 3, hunger: 3, energy: 4 },
    rarity: 'Rare',
    specialAbility: 'Ancient Wisdom - Slowly recovers all stats over time',
    nftMint: null
  },
  {
    id: 'hoshino',
    name: 'Hoshino Official',
    description: 'The official mascot and guardian of the Hoshino universe. A powerful and benevolent entity that watches over all celestial beings and maintains harmony in the cosmic realm.',
    image: 'hoshino',
    element: 'Cosmic',
    baseStats: { mood: 5, hunger: 4, energy: 5 },
    rarity: 'Legendary',
    specialAbility: 'Cosmic Harmony - Balances all stats perfectly',
    nftMint: null
  },
];

interface PetSelectionScreenProps {}

export default function PetSelectionScreen({}: PetSelectionScreenProps) {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { gameEngine, gameState, addNotification } = useGameContext();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const { playerName } = route.params;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    
    // Show character details
    Alert.alert(
      character.name,
      `${character.description}\n\nElement: ${character.element}\nRarity: ${character.rarity}\nSpecial Ability: ${character.specialAbility}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Select', onPress: () => confirmCharacterSelection(character) }
      ]
    );
  };

  const confirmCharacterSelection = (character: Character) => {
    gameEngine.selectCharacter(character);
    addNotification(`${character.name} is now your cosmic companion!`, 'success');
    
    // Navigate to pet interaction
    navigation.navigate('PetInteraction', { characterId: character.id });
  };

  const handleCollection = () => {
    navigation.navigate('PetCollection');
  };

  const handleShop = () => {
    navigation.navigate('Shop');
  };

  const renderCharacterCard = ({ item: character }: { item: Character }) => (
    <TouchableOpacity
      style={[
        styles.characterCard,
        { borderColor: getRarityColor(character.rarity) }
      ]}
      onPress={() => handleCharacterSelect(character)}
    >
      <Image
        source={getCharacterImage(character.image)}
        style={styles.characterImage}
        resizeMode="contain"
      />
      <View style={styles.characterInfo}>
        <Text style={styles.characterName}>{character.name}</Text>
        <Text style={[styles.characterRarity, { color: getRarityColor(character.rarity) }]}>
          {character.rarity}
        </Text>
        <Text style={styles.characterElement}>{character.element}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={IMAGES.background} style={styles.container} resizeMode="cover">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Cosmic Companion</Text>
          <Text style={styles.subtitle}>Welcome, {playerName}!</Text>
        </View>

        {/* Character Grid */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <FlatList
            data={CHARACTERS}
            renderItem={renderCharacterCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.characterGrid}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>

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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(17, 17, 17, 0.8)',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  characterGrid: {
    paddingBottom: 20,
  },
  characterCard: {
    flex: 1,
    margin: 8,
    backgroundColor: 'rgba(17, 17, 17, 0.9)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    minHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  characterImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
    borderRadius: 10,
  },
  characterInfo: {
    alignItems: 'center',
    width: '100%',
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  characterRarity: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  characterElement: {
    fontSize: 13,
    color: '#ccc',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'rgba(17, 17, 17, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 123, 255, 0.8)',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 