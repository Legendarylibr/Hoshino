import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGameContext } from '../contexts/GameContext';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  hungerRestore: number;
  moodBoost: number;
  energyRestore: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  quantity: number;
}

type RoutePropType = {
  params: {
    characterId: string;
  };
};

export default function FeedingScreen() {
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const { gameEngine, gameState, addNotification } = useGameContext();
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isFeeding, setIsFeeding] = useState(false);
  const [feedingAnimation] = useState(new Animated.Value(0));

  const { characterId } = route.params;
  const character = gameState?.selectedCharacter;

  // Sample food items
  const foodItems: FoodItem[] = [
    {
      id: 'dream_bean',
      name: '☁️ Dream Bean',
      description: 'Magical bean that restores 1 hunger point. Basic sustenance from the cloud realm.',
      icon: '☁️',
      hungerRestore: 20,
      moodBoost: 5,
      energyRestore: 0,
      rarity: 'Common',
      quantity: 10
    },
    {
      id: 'nebula_plum',
      name: '🌌 Nebula Plum',
      description: 'Cosmic plum that restores 2 hunger points. Sweet fruit from distant nebulae.',
      icon: '🌌',
      hungerRestore: 40,
      moodBoost: 10,
      energyRestore: 10,
      rarity: 'Rare',
      quantity: 5
    },
    {
      id: 'cloud_cake',
      name: '☁️ Cloud Cake',
      description: 'Fluffy cake that restores 3 hunger points. Light as clouds, sweet as dreams.',
      icon: '☁️',
      hungerRestore: 60,
      moodBoost: 15,
      energyRestore: 20,
      rarity: 'Epic',
      quantity: 3
    },
    {
      id: 'starberry',
      name: '⭐ Starberry',
      description: 'Legendary berry that completely fills hunger. The ultimate celestial fruit.',
      icon: '⭐',
      hungerRestore: 100,
      moodBoost: 25,
      energyRestore: 30,
      rarity: 'Legendary',
      quantity: 1
    },
    {
      id: 'cosmic_apple',
      name: '🍎 Cosmic Apple',
      description: 'A regular apple infused with cosmic energy. Simple but effective.',
      icon: '🍎',
      hungerRestore: 30,
      moodBoost: 8,
      energyRestore: 5,
      rarity: 'Common',
      quantity: 8
    },
    {
      id: 'moon_cookie',
      name: '🌙 Moon Cookie',
      description: 'A cookie baked under the light of the full moon. Magical and delicious.',
      icon: '🌙',
      hungerRestore: 35,
      moodBoost: 12,
      energyRestore: 8,
      rarity: 'Rare',
      quantity: 4
    }
  ];

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    addNotification(`Selected: ${food.name}`, 'info');
  };

  const handleFeed = () => {
    if (!selectedFood || !character || isFeeding) return;

    if (selectedFood.quantity <= 0) {
      addNotification('❌ No more of this food available!', 'error');
      return;
    }

    setIsFeeding(true);

    // Start feeding animation
    Animated.sequence([
      Animated.timing(feedingAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(feedingAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate feeding process
    setTimeout(() => {
      // Apply food effects
      const newHunger = Math.min(5, character.baseStats.hunger + (selectedFood.hungerRestore / 20));
      const newMood = Math.min(5, character.baseStats.mood + (selectedFood.moodBoost / 20));
      const newEnergy = Math.min(5, character.baseStats.energy + (selectedFood.energyRestore / 20));

      // Update character stats
      const updatedCharacter = {
        ...character,
        baseStats: {
          hunger: newHunger,
          mood: newMood,
          energy: newEnergy,
        }
      };

      // Update game state
      gameEngine.selectCharacter(updatedCharacter);

      // Reduce food quantity
      const updatedFood = {
        ...selectedFood,
        quantity: selectedFood.quantity - 1
      };

      // Update food items (in a real app, this would update inventory)
      const updatedFoodItems = foodItems.map(item => 
        item.id === selectedFood.id ? updatedFood : item
      );

      addNotification(
        `🍽️ Fed ${character.name} with ${selectedFood.name}! +${selectedFood.hungerRestore}% hunger, +${selectedFood.moodBoost}% mood, +${selectedFood.energyRestore}% energy`,
        'success'
      );

      setSelectedFood(updatedFood);
      setIsFeeding(false);
    }, 1000);
  };

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

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'Common': return '#9ca3af';
      case 'Rare': return '#10b981';
      case 'Epic': return '#8b5cf6';
      case 'Legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (!character) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No character selected</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🍽️ Feeding {character.name}</Text>
          <Text style={styles.subtitle}>Choose food to feed your cosmic companion</Text>
        </View>

        {/* Character Stats */}
        <View style={styles.characterStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Mood</Text>
            <Text style={[styles.statValue, { color: getStatColor(character.baseStats.mood) }]}>
              {getStatEmoji('mood', character.baseStats.mood)} {"★".repeat(character.baseStats.mood)}{"☆".repeat(5-character.baseStats.mood)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Hunger</Text>
            <Text style={[styles.statValue, { color: getStatColor(character.baseStats.hunger) }]}>
              {getStatEmoji('hunger', character.baseStats.hunger)} {"★".repeat(character.baseStats.hunger)}{"☆".repeat(5-character.baseStats.hunger)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Energy</Text>
            <Text style={[styles.statValue, { color: getStatColor(character.baseStats.energy) }]}>
              {getStatEmoji('energy', character.baseStats.energy)} {"★".repeat(character.baseStats.energy)}{"☆".repeat(5-character.baseStats.energy)}
            </Text>
          </View>
        </View>

        {/* Food Selection */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Available Food</Text>
          <View style={styles.foodGrid}>
            {foodItems.map((food) => (
              <TouchableOpacity 
                key={food.id}
                style={[
                  styles.foodCard,
                  selectedFood?.id === food.id && styles.foodCardSelected,
                  food.quantity <= 0 && styles.foodCardEmpty
                ]}
                onPress={() => handleFoodSelect(food)}
                disabled={food.quantity <= 0}
              >
                <Text style={styles.foodIcon}>{food.icon}</Text>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodQuantity}>x{food.quantity}</Text>
                <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(food.rarity) }]}>
                  <Text style={styles.rarityText}>{food.rarity}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Food Details */}
          {selectedFood && (
            <View style={styles.selectedFoodDetails}>
              <Text style={styles.detailTitle}>{selectedFood.name}</Text>
              <Text style={styles.detailDescription}>{selectedFood.description}</Text>
              <View style={styles.foodEffects}>
                <Text style={styles.effectText}>🍽️ Hunger: +{selectedFood.hungerRestore}%</Text>
                <Text style={styles.effectText}>😊 Mood: +{selectedFood.moodBoost}%</Text>
                <Text style={styles.effectText}>⚡ Energy: +{selectedFood.energyRestore}%</Text>
              </View>
              <TouchableOpacity 
                style={[styles.feedButton, selectedFood.quantity <= 0 && styles.feedButtonDisabled]}
                onPress={handleFeed}
                disabled={selectedFood.quantity <= 0 || isFeeding}
              >
                <Text style={styles.feedButtonText}>
                  {isFeeding ? 'Feeding...' : `Feed ${character.name}`}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Feeding Animation */}
          {isFeeding && (
            <Animated.View 
              style={[
                styles.feedingAnimation,
                {
                  opacity: feedingAnimation,
                  transform: [{
                    scale: feedingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.2]
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.animationText}>🍽️</Text>
            </Animated.View>
          )}
        </ScrollView>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
  },
  characterStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  foodCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  foodCardSelected: {
    borderColor: '#4da6ff',
    backgroundColor: 'rgba(77, 166, 255, 0.2)',
  },
  foodCardEmpty: {
    opacity: 0.5,
    borderColor: '#666',
  },
  foodIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  foodName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  foodQuantity: {
    fontSize: 12,
    color: '#4da6ff',
    marginBottom: 8,
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedFoodDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
    marginBottom: 12,
  },
  foodEffects: {
    marginBottom: 15,
  },
  effectText: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 4,
  },
  feedButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  feedButtonDisabled: {
    backgroundColor: '#666',
  },
  feedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  feedingAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationText: {
    fontSize: 48,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    backgroundColor: '#007bff',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 