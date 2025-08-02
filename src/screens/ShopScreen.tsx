import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGameContext } from '../contexts/GameContext';

// Item categories and types
export enum ItemCategory {
  FOOD = 'food',
  INGREDIENTS = 'ingredients',
  TOYS = 'toys',
  POWERUPS = 'powerups',
  COSMETICS = 'cosmetics',
  UTILITIES = 'utilities',
  RARE_COLLECTIBLES = 'rare_collectibles'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon', 
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  price: number; // in SOL
  starFragmentPrice?: number; // Alternative payment in star fragments
  isNFT: boolean; // Whether this item is minted as an NFT
  imageUrl: string;
  effects: ItemEffect[];
  duration?: number; // For temporary effects (in hours)
  stackable: boolean;
  maxStack?: number;
  requirements?: ItemRequirement[];
  recipe?: CraftingRecipe; // For craftable items
  isIngredient?: boolean; // Whether this item can be used in crafting
}

export interface CraftingRecipe {
  ingredients: RecipeIngredient[];
  craftingTime: number; // in seconds
  experienceReward: number;
  skillRequired?: string;
}

export interface RecipeIngredient {
  itemId: string;
  quantity: number;
}

export interface ItemEffect {
  type: 'stat_boost' | 'experience_multiplier' | 'mood_boost' | 'energy_restore' | 'hunger_fill' | 'special_ability';
  value: number;
  duration?: number; // in hours, undefined for permanent
  description: string;
}

export interface ItemRequirement {
  type: 'level' | 'achievement' | 'days_active' | 'character_bond';
  value: number | string;
  description: string;
}

// Sample marketplace items
const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  // Food Items
  {
    id: 'dream_bean',
    name: '☁️ Dream Bean',
    description: 'Magical bean that restores 1 hunger point. Basic sustenance from the cloud realm.',
    category: ItemCategory.FOOD,
    rarity: ItemRarity.COMMON,
    price: 0.015,
    starFragmentPrice: 80,
    isNFT: false,
    imageUrl: 'https://hoshino.game/assets/items/dream-bean.png',
    effects: [
      { type: 'hunger_fill', value: 20, description: 'Restores 1 hunger point' }
    ],
    stackable: true,
    maxStack: 99,
  },
  {
    id: 'nebula_plum',
    name: '🌌 Nebula Plum',
    description: 'Cosmic plum that restores 2 hunger points. Sweet fruit from distant nebulae.',
    category: ItemCategory.FOOD,
    rarity: ItemRarity.RARE,
    price: 0.025,
    starFragmentPrice: 150,
    isNFT: false,
    imageUrl: 'https://hoshino.game/assets/items/nebula-plum.png',
    effects: [
      { type: 'hunger_fill', value: 40, description: 'Restores 2 hunger points' }
    ],
    stackable: true,
    maxStack: 50,
  },
  {
    id: 'cloud_cake',
    name: '☁️ Cloud Cake',
    description: 'Fluffy cake that restores 3 hunger points. Light as clouds, sweet as dreams.',
    category: ItemCategory.FOOD,
    rarity: ItemRarity.EPIC,
    price: 0.05,
    starFragmentPrice: 350,
    isNFT: false,
    imageUrl: 'https://hoshino.game/assets/items/cloud-cake.png',
    effects: [
      { type: 'hunger_fill', value: 60, description: 'Restores 3 hunger points' }
    ],
    stackable: true,
    maxStack: 25,
  },
  // Powerups
  {
    id: 'xp_booster',
    name: '⭐ XP Booster',
    description: 'Double experience gain for all activities! Perfect for leveling up.',
    category: ItemCategory.POWERUPS,
    rarity: ItemRarity.UNCOMMON,
    price: 0.04,
    starFragmentPrice: 200,
    isNFT: false,
    imageUrl: 'https://hoshino.game/assets/items/xp-booster.png',
    effects: [
      { type: 'experience_multiplier', value: 2.0, duration: 4, description: 'Double XP for 4 hours' }
    ],
    stackable: true,
    maxStack: 20
  },
  {
    id: 'mega_xp_crystal',
    name: '💎 Mega XP Crystal',
    description: 'Legendary crystal that provides 5x experience! Ultra rare and powerful.',
    category: ItemCategory.POWERUPS,
    rarity: ItemRarity.LEGENDARY,
    price: 0.15,
    starFragmentPrice: 800,
    isNFT: true,
    imageUrl: 'https://hoshino.game/assets/items/mega-xp-crystal.png',
    effects: [
      { type: 'experience_multiplier', value: 5.0, duration: 1, description: '5x XP for 1 hour' },
      { type: 'special_ability', value: 1, description: 'Unlocks special rainbow aura' }
    ],
    stackable: true,
    maxStack: 5,
    requirements: [
      { type: 'level', value: 10, description: 'Requires character level 10+' }
    ]
  },
  // Toys
  {
    id: 'entertainment_ball',
    name: '⚽ Ball',
    description: 'A magical ball to keep pet entertained. Reduces the need for constant playing!',
    category: ItemCategory.TOYS,
    rarity: ItemRarity.UNCOMMON,
    price: 0.0005,
    isNFT: false,
    imageUrl: 'https://hoshino.game/assets/items/entertainment-ball.png',
    effects: [
      { type: 'special_ability', value: 1, duration: 24, description: 'Reduces play need for 24 hours' },
      { type: 'mood_boost', value: 10, description: 'Initial joy from new toy' }
    ],
    stackable: true,
    maxStack: 5
  },
  // Cosmetics
  {
    id: 'starlight_hat',
    name: '👑 Starlight Crown',
    description: 'A beautiful crown that shimmers with starlight. Pure cosmetic luxury!',
    category: ItemCategory.COSMETICS,
    rarity: ItemRarity.RARE,
    price: 0.06,
    starFragmentPrice: 400,
    isNFT: true,
    imageUrl: 'https://hoshino.game/assets/items/starlight-crown.png',
    effects: [
      { type: 'special_ability', value: 1, description: 'Cosmetic starlight aura effect' }
    ],
    stackable: false
  },
  // Utilities
  {
    id: 'auto_feeder',
    name: '🤖 Auto Feeder',
    description: 'Automatically feeds your character when hungry. Convenience at its finest!',
    category: ItemCategory.UTILITIES,
    rarity: ItemRarity.UNCOMMON,
    price: 0.03,
    starFragmentPrice: 180,
    isNFT: false,
    imageUrl: 'https://hoshino.game/assets/items/auto-feeder.png',
    effects: [
      { type: 'special_ability', value: 1, duration: 168, description: 'Auto-feed for 7 days' }
    ],
    stackable: true,
    maxStack: 10
  }
];

export default function ShopScreen() {
  const navigation = useNavigation();
  const { gameEngine, gameState, addNotification } = useGameContext();
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all' | 'currency'>('all');
  const [selectedRarity, setSelectedRarity] = useState<ItemRarity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [starFragmentBalance, setStarFragmentBalance] = useState(0);

  // Initialize star fragment balance
  useEffect(() => {
    if (gameState) {
      setStarFragmentBalance(gameState.starFragments || 0);
    }
  }, [gameState]);

  // Get filtered items
  const filteredItems = useMemo(() => {
    let items = MARKETPLACE_ITEMS;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    // Filter by rarity
    if (selectedRarity !== 'all') {
      items = items.filter(item => item.rarity === selectedRarity);
    }
    
    // Filter by search query
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.category.includes(searchTerm) ||
        item.rarity.includes(searchTerm)
      );
    }
    
    return items;
  }, [selectedCategory, selectedRarity, searchQuery]);

  // Get featured items
  const featuredItems = useMemo(() => {
    return MARKETPLACE_ITEMS
      .filter(item => item.rarity === ItemRarity.RARE || item.rarity === ItemRarity.EPIC)
      .slice(0, 4);
  }, []);

  // Handle Star Fragment purchase
  const handleStarFragmentPurchase = async (solAmount: number) => {
    setIsLoading(true);
    
    try {
      const fragmentsToAdd = Math.floor(solAmount * 100); // 1 SOL = 100 Star Fragments
      
      if (fragmentsToAdd <= 0) {
        addNotification('❌ Invalid SOL amount', 'error');
        return;
      }

      // Update game state with new star fragments
      gameEngine.addStarFragments(fragmentsToAdd);
      setStarFragmentBalance(prev => prev + fragmentsToAdd);
      
      addNotification(
        `✨ Successfully purchased ${fragmentsToAdd} Star Fragments! Cost: ${solAmount.toFixed(4)} SOL`,
        'success'
      );
    } catch (error) {
      addNotification(`❌ Purchase error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle item purchase
  const handlePurchase = async (item: MarketplaceItem, quantity: number = 1) => {
    setIsLoading(true);
    
    try {
      // Check if item should be purchased with Star Fragments (non-character items)
      const starFragmentPrice = Math.floor(item.price * 1000); // Convert SOL price to Star Fragment price
      const isCharacterItem = item.name.toLowerCase().includes('character') || item.name.toLowerCase().includes('pet');
      
      if (!isCharacterItem && item.starFragmentPrice) {
        // Purchase with Star Fragments
        const totalCost = item.starFragmentPrice * quantity;
        
        if (starFragmentBalance < totalCost) {
          addNotification(`❌ Insufficient Star Fragments. You have ${starFragmentBalance}, need ${totalCost}`, 'error');
          return;
        }
        
        // Deduct star fragments
        gameEngine.addStarFragments(-totalCost);
        setStarFragmentBalance(prev => prev - totalCost);
        
        addNotification(
          `✨ Successfully purchased ${quantity}x ${item.name}! Cost: ${totalCost} Star Fragments`,
          'success'
        );
      } else {
        // Purchase with SOL (simulated)
        const totalCost = item.price * quantity;
        
        addNotification(
          `✅ Successfully purchased ${quantity}x ${item.name}! ${item.isNFT ? 'NFT minted to your wallet! ' : ''}Cost: ${totalCost.toFixed(4)} SOL`,
          'success'
        );
      }
    } catch (error) {
      addNotification(`❌ Purchase error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Get rarity color
  const getRarityColor = (rarity: ItemRarity): string => {
    switch (rarity) {
      case ItemRarity.COMMON: return '#9ca3af'; // Gray
      case ItemRarity.UNCOMMON: return '#10b981'; // Green
      case ItemRarity.RARE: return '#3b82f6'; // Blue
      case ItemRarity.EPIC: return '#8b5cf6'; // Purple
      case ItemRarity.LEGENDARY: return '#f59e0b'; // Orange/Gold
      case ItemRarity.MYTHIC: return '#ef4444'; // Red
      default: return '#6b7280';
    }
  };

  // Get category emoji
  const getCategoryEmoji = (category: ItemCategory): string => {
    switch (category) {
      case ItemCategory.INGREDIENTS: return '🌿';
      case ItemCategory.FOOD: return '🍎';
      case ItemCategory.TOYS: return '🎮';
      case ItemCategory.POWERUPS: return '⚡';
      case ItemCategory.COSMETICS: return '✨';
      case ItemCategory.UTILITIES: return '🔧';
      case ItemCategory.RARE_COLLECTIBLES: return '💎';
      default: return '📦';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🏪 Cosmic Shop</Text>
          <Text style={styles.subtitle}>
            SOL: {gameState?.solBalance?.toFixed(4) || '0.0000'} • ✨ {starFragmentBalance}
          </Text>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>SOL</Text>
            <Text style={styles.statValue}>{gameState?.solBalance?.toFixed(3) || '0'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Star ✨</Text>
            <Text style={styles.statValue}>{starFragmentBalance}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Items</Text>
            <Text style={styles.statValue}>
              {selectedCategory === 'currency' ? '3' : filteredItems.length}
            </Text>
          </View>
        </View>

        {/* Quick Category Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <TouchableOpacity 
            style={[styles.categoryButton, selectedCategory === 'currency' && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory('currency')}
          >
            <Text style={styles.categoryButtonText}>✨ Currency</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryButton, selectedCategory === 'all' && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={styles.categoryButtonText}>📦 All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryButton, selectedCategory === ItemCategory.FOOD && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(ItemCategory.FOOD)}
          >
            <Text style={styles.categoryButtonText}>🍎 Food</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryButton, selectedCategory === ItemCategory.POWERUPS && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(ItemCategory.POWERUPS)}
          >
            <Text style={styles.categoryButtonText}>⚡ Power</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryButton, selectedCategory === ItemCategory.TOYS && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(ItemCategory.TOYS)}
          >
            <Text style={styles.categoryButtonText}>🎮 Toys</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryButton, selectedCategory === ItemCategory.COSMETICS && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(ItemCategory.COSMETICS)}
          >
            <Text style={styles.categoryButtonText}>✨ Cosmetics</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Items Grid */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.itemsGrid}>
            {selectedCategory === 'currency' ? (
              // Star Fragment purchase options
              [
                { sol: 0.1, fragments: 10, name: 'Small Pack' },
                { sol: 0.5, fragments: 50, name: 'Medium Pack' },
                { sol: 1.0, fragments: 100, name: 'Large Pack' }
              ].map((pack, index) => (
                <TouchableOpacity 
                  key={`currency-${index}`} 
                  style={styles.itemCard}
                  onPress={() => handleStarFragmentPurchase(pack.sol)}
                  disabled={isLoading}
                >
                  <Text style={styles.itemIcon}>✨</Text>
                  <Text style={styles.itemName}>{pack.name}</Text>
                  <Text style={styles.itemPrice}>{pack.sol.toFixed(3)} SOL</Text>
                  <Text style={[styles.itemRarity, { color: '#f59e0b' }]}>
                    {pack.fragments} ✨
                  </Text>
                  <View style={styles.buyButton}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.buyButtonText}>💰</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              // Regular items
              filteredItems.slice(0, 6).map(item => {
                const isCharacterItem = item.name.toLowerCase().includes('character') || item.name.toLowerCase().includes('pet');
                const starFragmentPrice = Math.floor(item.price * 1000);
                
                return (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.itemCard}
                    onPress={() => handlePurchase(item)}
                    disabled={isLoading}
                  >
                    <Text style={styles.itemIcon}>
                      {getCategoryEmoji(item.category)}
                    </Text>
                    <Text style={styles.itemName}>{item.name.slice(0, 8)}</Text>
                    <Text style={styles.itemPrice}>
                      {isCharacterItem ? `${item.price.toFixed(3)} SOL` : `${starFragmentPrice} ✨`}
                    </Text>
                    <Text 
                      style={[styles.itemRarity, { color: getRarityColor(item.rarity) }]}
                    >
                      {item.rarity.slice(0, 4).toUpperCase()}
                    </Text>
                    <View style={styles.buyButton}>
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.buyButtonText}>💰</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Pagination Info */}
          {selectedCategory === 'currency' ? (
            <Text style={styles.paginationText}>
              Star Fragment Packages - Buy with SOL
            </Text>
          ) : filteredItems.length > 6 && (
            <Text style={styles.paginationText}>
              Showing 6 of {filteredItems.length} items
            </Text>
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
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(77, 166, 255, 0.3)',
    borderColor: '#4da6ff',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  itemCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  itemIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: '#4da6ff',
    marginBottom: 4,
  },
  itemRarity: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paginationText: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
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