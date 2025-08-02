import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGameContext } from '../contexts/GameContext';
import { getCharacterImage, getRarityColor } from '../assets/images';

interface Character {
  id: string;
  name: string;
  description: string;
  image: string;
  element: string;
  baseStats: {
    mood: number;
    hunger: number;
    energy: number;
  };
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  specialAbility: string;
  nftMint?: string | null;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'ingredient' | 'accessory' | 'special' | 'casing';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  quantity: number;
  icon: string;
}

export default function PetCollectionScreen() {
  const navigation = useNavigation();
  const { gameEngine, gameState, addNotification } = useGameContext();
  const [startIndex, setStartIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('Pets');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | Character | null>(null);

  // Sample inventory data with actual images
  const inventoryData: Record<string, InventoryItem[]> = {
    'Ingredients': [
      { id: 'star_dust', name: 'Star Dust', description: 'Magical dust from distant stars. Boosts mood when used in food.', type: 'ingredient', rarity: 'Common', quantity: 5, icon: '✨' },
      { id: 'moon_berries', name: 'Moon Berries', description: 'Sweet berries that glow in the dark. Increases energy significantly.', type: 'ingredient', rarity: 'Rare', quantity: 3, icon: '🌙' },
      { id: 'cosmic_honey', name: 'Cosmic Honey', description: 'Golden honey infused with cosmic energy. Restores all stats.', type: 'ingredient', rarity: 'Epic', quantity: 1, icon: '🍯' },
      { id: 'nebula_spice', name: 'Nebula Spice', description: 'Exotic spice that adds flavor and magic to any dish.', type: 'ingredient', rarity: 'Legendary', quantity: 1, icon: '🌌' }
    ],
    'Accessories': [
      { id: 'star_crown', name: 'Star Crown', description: 'A beautiful crown that makes your pet sparkle in the moonlight.', type: 'accessory', rarity: 'Rare', quantity: 1, icon: '👑' },
      { id: 'cosmic_scarf', name: 'Cosmic Scarf', description: 'A warm scarf woven from stardust threads.', type: 'accessory', rarity: 'Common', quantity: 2, icon: '🧣' },
      { id: 'galaxy_collar', name: 'Galaxy Collar', description: 'A collar that shows swirling galaxies within.', type: 'accessory', rarity: 'Epic', quantity: 1, icon: '🔮' }
    ],
    'Special Items': [
      { id: 'moon_crystal', name: 'Moon Crystal', description: 'A rare crystal that can reset your pet\'s evolution path.', type: 'special', rarity: 'Legendary', quantity: 1, icon: '💎' },
      { id: 'star_fragment', name: 'Star Fragment', description: 'A piece of a fallen star. Can be used for special rituals.', type: 'special', rarity: 'Epic', quantity: 2, icon: '⭐' },
      { id: 'cosmic_potion', name: 'Cosmic Potion', description: 'A mysterious potion with unknown effects.', type: 'special', rarity: 'Rare', quantity: 1, icon: '🧪' }
    ],
    'Casing': [
      { id: 'galaxy_shell', name: 'Galaxy Shell', description: 'A beautiful shell that changes your device\'s appearance to show galaxies.', type: 'casing', rarity: 'Epic', quantity: 1, icon: '🌌' },
      { id: 'star_frame', name: 'Star Frame', description: 'A golden frame decorated with tiny stars.', type: 'casing', rarity: 'Rare', quantity: 1, icon: '⭐' },
      { id: 'cosmic_border', name: 'Cosmic Border', description: 'A shimmering border that pulses with cosmic energy.', type: 'casing', rarity: 'Common', quantity: 3, icon: '✨' }
    ]
  };

  // Get all owned characters
  const ownedCharacters = gameState?.ownedCharacters || [];
  const displayedCharacters = ownedCharacters.slice(startIndex, startIndex + 6);

  const handlePrevious = () => {
    if (startIndex > 0) {
      setStartIndex(Math.max(0, startIndex - 6));
    }
  };

  const handleNext = () => {
    if (startIndex + 6 < ownedCharacters.length) {
      setStartIndex(startIndex + 6);
    }
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedItem(character);
    addNotification(`Selected: ${character.name}`, 'info');
  };

  const handleItemSelect = (item: InventoryItem) => {
    setSelectedItem(item);
    addNotification(`Selected: ${item.name}`, 'info');
  };

  const handleUseItem = (item: InventoryItem) => {
    Alert.alert(
      'Use Item',
      `Use ${item.name}?\n\n${item.description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Use', 
          onPress: () => {
            addNotification(`✨ Used ${item.name}!`, 'success');
            // In a real implementation, this would apply the item's effects
          }
        }
      ]
    );
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📦 Cosmic Collection</Text>
          <Text style={styles.subtitle}>Inventory & Characters</Text>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Items</Text>
            <Text style={styles.statValue}>⭐⭐⭐⭐⭐</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rarity</Text>
            <Text style={styles.statValue}>⭐⭐⭐⭐⭐</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>⭐⭐⭐⭐⭐</Text>
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <TouchableOpacity 
            style={[styles.categoryTab, activeCategory === 'Pets' && styles.categoryTabActive]}
            onPress={() => setActiveCategory('Pets')}
          >
            <Text style={styles.categoryTabText}>Pets</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryTab, activeCategory === 'Ingredients' && styles.categoryTabActive]}
            onPress={() => setActiveCategory('Ingredients')}
          >
            <Text style={styles.categoryTabText}>Ingredients</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryTab, activeCategory === 'Accessories' && styles.categoryTabActive]}
            onPress={() => setActiveCategory('Accessories')}
          >
            <Text style={styles.categoryTabText}>Accessories</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryTab, activeCategory === 'Special Items' && styles.categoryTabActive]}
            onPress={() => setActiveCategory('Special Items')}
          >
            <Text style={styles.categoryTabText}>Special Items</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryTab, activeCategory === 'Casing' && styles.categoryTabActive]}
            onPress={() => setActiveCategory('Casing')}
          >
            <Text style={styles.categoryTabText}>Casing</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Content Area */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inventoryGrid}>
            {activeCategory === 'Pets' ? (
              // Pets Tab Content
              <>
                {displayedCharacters.map((character) => (
                  <TouchableOpacity 
                    key={character.id}
                    style={[styles.inventorySlot, selectedItem?.id === character.id && styles.inventorySlotSelected]}
                    onPress={() => handleCharacterSelect(character)}
                  >
                    <Text style={styles.slotImage}>{character.element}</Text>
                    {character.nftMint && <View style={styles.nftBadge}><Text style={styles.nftBadgeText}>NFT</Text></View>}
                  </TouchableOpacity>
                ))}
                
                {/* Fill empty slots if needed */}
                {Array.from({ length: Math.max(0, 6 - displayedCharacters.length) }).map((_, index) => (
                  <View key={`empty-${index}`} style={styles.inventorySlot}>
                    <Text style={styles.emptySlotIcon}>+</Text>
                  </View>
                ))}
              </>
            ) : (
              // Other tabs content (Ingredients, Accessories, etc.)
              <>
                {inventoryData[activeCategory]?.slice(0, 6).map((item) => (
                  <TouchableOpacity 
                    key={item.id}
                    style={[styles.inventorySlot, selectedItem?.id === item.id && styles.inventorySlotSelected]}
                    onPress={() => handleItemSelect(item)}
                  >
                    <Text style={styles.slotImage}>{item.icon}</Text>
                    <View style={styles.itemQuantityBadge}>
                      <Text style={styles.itemQuantityText}>x{item.quantity}</Text>
                    </View>
                  </TouchableOpacity>
                )) || []}
                
                {/* Fill empty slots */}
                {Array.from({ 
                  length: Math.max(0, 6 - (inventoryData[activeCategory]?.length || 0))
                }).map((_, index) => (
                  <View key={`empty-${index}`} style={styles.inventorySlot}>
                    <Text style={styles.emptySlotIcon}>+</Text>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* Item/Character Description */}
          {selectedItem && (
            <View style={styles.selectedItemDescription}>
              <View style={styles.descriptionHeader}>
                <Text style={styles.itemTitle}>
                  {'element' in selectedItem ? selectedItem.name : selectedItem.name}
                </Text>
                {'rarity' in selectedItem && (
                  <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(selectedItem.rarity) }]}>
                    <Text style={styles.rarityBadgeText}>{selectedItem.rarity}</Text>
                  </View>
                )}
              </View>
              <View style={styles.descriptionContent}>
                {'element' in selectedItem ? (
                  // Character description
                  <>
                    <Text style={styles.descriptionText}>Element: {selectedItem.element}</Text>
                    <View style={styles.characterStats}>
                      <Text style={styles.statText}>
                        Mood: {getStatEmoji('mood', selectedItem.baseStats.mood)} {"★".repeat(selectedItem.baseStats.mood)}{"☆".repeat(5-selectedItem.baseStats.mood)}
                      </Text>
                      <Text style={styles.statText}>
                        Hunger: {getStatEmoji('hunger', selectedItem.baseStats.hunger)} {"★".repeat(selectedItem.baseStats.hunger)}{"☆".repeat(5-selectedItem.baseStats.hunger)}
                      </Text>
                      <Text style={styles.statText}>
                        Energy: {getStatEmoji('energy', selectedItem.baseStats.energy)} {"★".repeat(selectedItem.baseStats.energy)}{"☆".repeat(5-selectedItem.baseStats.energy)}
                      </Text>
                    </View>
                    <Text style={styles.descriptionText}>{selectedItem.description}</Text>
                  </>
                ) : (
                  // Item description
                  <>
                    <Text style={styles.descriptionText}>{selectedItem.description}</Text>
                    <Text style={styles.itemQuantityLarge}>Quantity: {selectedItem.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.useItemButton}
                      onPress={() => handleUseItem(selectedItem)}
                    >
                      <Text style={styles.useItemButtonText}>Use Item</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          )}

          {/* Navigation for Pets */}
          {activeCategory === 'Pets' && ownedCharacters.length > 6 && (
            <View style={styles.navigationButtons}>
              <TouchableOpacity 
                style={[styles.navButton, startIndex === 0 && styles.navButtonDisabled]}
                onPress={handlePrevious}
                disabled={startIndex === 0}
              >
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.navInfo}>
                {startIndex + 1}-{Math.min(startIndex + 6, ownedCharacters.length)} of {ownedCharacters.length}
              </Text>
              <TouchableOpacity 
                style={[styles.navButton, startIndex + 6 >= ownedCharacters.length && styles.navButtonDisabled]}
                onPress={handleNext}
                disabled={startIndex + 6 >= ownedCharacters.length}
              >
                <Text style={styles.navButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
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
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoryScroll: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryTabActive: {
    backgroundColor: 'rgba(77, 166, 255, 0.3)',
    borderColor: '#4da6ff',
  },
  categoryTabText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inventorySlot: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  inventorySlotSelected: {
    borderColor: '#4da6ff',
    backgroundColor: 'rgba(77, 166, 255, 0.2)',
  },
  slotImage: {
    fontSize: 32,
    marginBottom: 5,
  },
  emptySlotIcon: {
    fontSize: 24,
    color: '#aaa',
  },
  nftBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  nftBadgeText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  itemQuantityBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  itemQuantityText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedItemDescription: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rarityBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  descriptionContent: {
    gap: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  characterStats: {
    gap: 5,
  },
  statText: {
    fontSize: 12,
    color: '#fff',
  },
  itemQuantityLarge: {
    fontSize: 14,
    color: '#4da6ff',
    fontWeight: 'bold',
  },
  useItemButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  useItemButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: '#4da6ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  navButtonDisabled: {
    backgroundColor: '#666',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  navInfo: {
    color: '#aaa',
    fontSize: 12,
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