﻿import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import MarketplaceService, { MarketplaceItem, ItemCategory, ItemRarity } from '../services/MarketplaceService';

import { GlobalPointSystem } from '../services/GlobalPointSystem';
import { useWallet } from '../contexts/WalletContext';
import { Connection } from '@solana/web3.js';
import { RECIPES } from '../data/recipes';
import { INGREDIENTS } from '../data/ingredients';
// Images are now loaded directly with require() where needed
import AsyncStorage from '@react-native-async-storage/async-storage';
// Food items for feeding moonlings (not ingredients for crafting)

interface ShopProps {
    connection: Connection;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onClose: () => void;
    onItemsPurchased?: (items: MarketplaceItem[]) => void;
}

const Shop: React.FC<ShopProps> = ({ connection, onNotification, onClose, onItemsPurchased }) => {
    const { wallet } = useWallet();
    const [selectedCategory, setSelectedCategory] = useState<string>('food');
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [dust, setDust] = useState<number>(100);
    const [cart, setCart] = useState<{ item: MarketplaceItem, quantity: number }[]>([]);
    const [flashingItem, setFlashingItem] = useState<string | null>(null);
    const [craftingInventory, setCraftingInventory] = useState<{ [key: string]: number }>({
        'pink-sugar': 5,
        'nova-egg': 3,
        'mira-berry': 4
    });
    const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

    // Load crafting inventory from AsyncStorage on component mount
    useEffect(() => {
        const loadCraftingInventory = async () => {
            try {
                const stored = await AsyncStorage.getItem('crafting_inventory');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setCraftingInventory(parsed);
                }
            } catch (error) {
                console.error('Failed to load crafting inventory:', error);
            }
        };

        loadCraftingInventory();
    }, []);

    // Load star dust balance from AsyncStorage on component mount
    useEffect(() => {
        const loadStarDustBalance = async () => {
            try {
                const stored = await AsyncStorage.getItem('star_dust_balance');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setDust(parsed);
                }
            } catch (error) {
                console.error('Failed to load star dust balance:', error);
            }
        };

        loadStarDustBalance();
    }, []);

    // Load cart items from AsyncStorage on component mount
    useEffect(() => {
        const loadCartItems = async () => {
            try {
                const stored = await AsyncStorage.getItem('cart_items');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setCart(parsed);
                }
            } catch (error) {
                console.error('Failed to load cart items:', error);
            }
        };

        loadCartItems();
    }, []);

    const getTotalPrice = () => {
        return cart.reduce((total, cartItem) => total + (cartItem.item.priceStarFragments * cartItem.quantity), 0);
    };

    const getRarityBorderColor = (rarity: ItemRarity): string => {
        switch (rarity) {
            case ItemRarity.COMMON: return '#8B8B8B';
            case ItemRarity.UNCOMMON: return '#4CAF50';
            case ItemRarity.RARE: return '#2196F3';
            case ItemRarity.EPIC: return '#9C27B0';
            case ItemRarity.LEGENDARY: return '#FF9800';
            default: return '#003300';
        }
    };

    const addToCart = async (item: MarketplaceItem) => {
        const totalCostAfterAdd = getTotalPrice() + item.priceStarFragments;
        if (totalCostAfterAdd > dust) {
            onNotification?.(`Not enough Star Dust! You need ${totalCostAfterAdd} but only have ${dust}.`, 'error');
            return;
        }

        const newCart = (() => {
            const existingItem = cart.find(cartItem => cartItem.item.id === item.id);
            if (existingItem) {
                return cart.map(cartItem =>
                    cartItem.item.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            } else {
                return [...cart, { item, quantity: 1 }];
            }
        })();

        setCart(newCart);
        
        // Save cart to AsyncStorage
        try {
            await AsyncStorage.setItem('cart_items', JSON.stringify(newCart));
        } catch (error) {
            console.error('Failed to save cart items:', error);
        }

        const newDust = dust - item.priceStarFragments;
        setDust(newDust);
        
        // Save to AsyncStorage
        try {
            await AsyncStorage.setItem('star_dust_balance', JSON.stringify(newDust));
        } catch (error) {
            console.error('Failed to save star dust balance:', error);
        }

        setFlashingItem(item.id);
        setTimeout(() => setFlashingItem(null), 300);

        onNotification?.(`Added ${item.name} to cart! ${item.priceStarFragments} Star Dust deducted.`, 'success');
    };

    const removeFromCart = async (itemId: string) => {
        const itemToRemove = cart.find(cartItem => cartItem.item.id === itemId);
        if (itemToRemove) {
            const refundAmount = itemToRemove.item.priceStarFragments * itemToRemove.quantity;
            const newDust = dust + refundAmount;
            setDust(newDust);
            
            // Save to AsyncStorage
            try {
                await AsyncStorage.setItem('star_dust_balance', JSON.stringify(newDust));
            } catch (error) {
                console.error('Failed to save star dust balance:', error);
            }
            
            onNotification?.(`Removed ${itemToRemove.item.name} from cart. ${refundAmount} Star Dust refunded.`, 'info');
        }
        const newCart = cart.filter(cartItem => cartItem.item.id !== itemId);
        setCart(newCart);
        
        // Save cart to AsyncStorage
        try {
            await AsyncStorage.setItem('cart_items', JSON.stringify(newCart));
        } catch (error) {
            console.error('Failed to save cart items:', error);
        }
    };

    const clearCart = async () => {
        if (cart.length === 0) return;

        const totalRefund = getTotalPrice();
        const newDust = dust + totalRefund;
        setDust(newDust);
        setCart([]);
        
        // Save to AsyncStorage
        try {
            await AsyncStorage.setItem('star_dust_balance', JSON.stringify(newDust));
        } catch (error) {
            console.error('Failed to save star dust balance:', error);
        }
        
        onNotification?.(`Cart cleared! ${totalRefund} Star Dust refunded.`, 'info');
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            onNotification?.('Your cart is empty!', 'warning');
            return;
        }

        const purchasedItems = cart.map(cartItem => cartItem.item);

        if (onItemsPurchased) {
            onItemsPurchased(purchasedItems);
        }

        setCart([]);
        
        // Save empty cart to AsyncStorage
        try {
            await AsyncStorage.setItem('cart_items', JSON.stringify([]));
        } catch (error) {
            console.error('Failed to save cart items:', error);
        }

        onNotification?.(`Purchase complete! ${purchasedItems.length} items added to your ingredient inventory.`, 'success');
    };

    const handleStarDustPurchase = async (packageId: string, priceSOL: number) => {
        try {
            if (!wallet) {
                onNotification?.('Please connect your wallet first', 'error');
                return;
            }

            // Store purchase intent server-side (off-chain)
            const response = await fetch('https://your-backend-url/processStarDustPurchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId,
                    priceSOL,
                    walletAddress: wallet.publicKey.toString(),
                    timestamp: Date.now(),
                    status: 'pending'
                })
            });

            if (response.ok) {
                onNotification?.(`Star Dust package purchased successfully!`, 'success');
                setFlashingItem(packageId);
                setTimeout(() => setFlashingItem(null), 300);
            } else {
                onNotification?.('Purchase completed but backend processing failed', 'warning');
            }
        } catch (error) {
            console.error('Star dust purchase error:', error);
            onNotification?.('Purchase failed. Please try again.', 'error');
        }
    };

    const canCraftRecipe = (recipe: any): boolean => {
        return recipe.ingredients.every((ingredient: any) => 
            craftingInventory[ingredient.id] >= ingredient.quantity
        );
    };

    const craftRecipe = async (recipe: any) => {
        if (!canCraftRecipe(recipe)) {
            onNotification?.('Not enough ingredients to craft this recipe!', 'error');
            return;
        }

        // Deduct ingredients
        const newInventory = { ...craftingInventory };
        recipe.ingredients.forEach((ingredient: any) => {
            newInventory[ingredient.id] -= ingredient.quantity;
        });

        setCraftingInventory(newInventory);
        
        // Save to AsyncStorage
        try {
            await AsyncStorage.setItem('crafting_inventory', JSON.stringify(newInventory));
        } catch (error) {
            console.error('Failed to save crafting inventory:', error);
        }
        
        onNotification?.(`🍳 Successfully crafted ${recipe.name}!`, 'success');
        setSelectedRecipe(null);
    };

    const addIngredientToInventory = async (ingredientId: string) => {
        const newInventory = {
            ...craftingInventory,
            [ingredientId]: (craftingInventory[ingredientId] || 0) + 1
        };
        
        setCraftingInventory(newInventory);
        
        // Save to AsyncStorage
        try {
            await AsyncStorage.setItem('crafting_inventory', JSON.stringify(newInventory));
        } catch (error) {
            console.error('Failed to save crafting inventory:', error);
        }
        
        onNotification?.(`Added ${ingredientId} to crafting inventory!`, 'success');
    };

    useEffect(() => {
        const itemsData = [
            {
                id: 'pink-sugar',
                name: 'Pink Sugar',
                description: 'Sweet crystalline sugar with a pink hue',
                imageUrl: require('../../assets/ingredients/pink-sugar.png'),
                category: ItemCategory.FOOD,
                rarity: ItemRarity.COMMON,
                priceSOL: 0,
                priceStarFragments: 15,
                inStock: true,
            },
            {
                id: 'nova-egg',
                name: 'Nova Egg',
                description: 'A mysterious egg that glows with stellar energy',
                imageUrl: require('../../assets/ingredients/nova-egg.png'),
                category: ItemCategory.FOOD,
                rarity: ItemRarity.UNCOMMON,
                priceSOL: 0,
                priceStarFragments: 25,
                inStock: true,
            },
            {
                id: 'mira-berry',
                name: 'Mira Berry',
                description: 'A rare berry with stellar properties',
                imageUrl: require('../../assets/ingredients/mira-berry.png'),
                category: ItemCategory.FOOD,
                rarity: ItemRarity.RARE,
                priceSOL: 0,
                priceStarFragments: 20,
                inStock: true,
            },
            {
                id: 'speed-boost',
                name: 'Speed Boost',
                description: 'Increases movement speed temporarily',
                imageUrl: 'https://via.placeholder.com/48/00FF00/000000?text=⚡',
                category: ItemCategory.POWERUP,
                rarity: ItemRarity.COMMON,
                priceSOL: 0,
                priceStarFragments: 12,
                inStock: true,
            },
            {
                id: 'star-shield',
                name: 'Star Shield',
                description: 'Provides stellar protection',
                imageUrl: 'https://via.placeholder.com/48/4169E1/000000?text=🛡️',
                category: ItemCategory.POWERUP,
                rarity: ItemRarity.RARE,
                priceSOL: 0,
                priceStarFragments: 45,
                inStock: true,
            },
        ];

        console.log('Loading shop catalog (no wallet needed)');
        console.log('Shop items data:', itemsData);
        setItems(itemsData);
    }, []);

    const filteredItems = useMemo(() => {
        if (!items.length) return [];
        if (selectedCategory === 'all') return items;
        if (selectedCategory === 'currency') return [];
        return items.filter(item => {
            if (selectedCategory === 'food') return item.category === ItemCategory.FOOD;
            if (selectedCategory === 'powerups') return item.category === ItemCategory.POWERUP;
            if (selectedCategory === 'cosmetics') return item.category === ItemCategory.COSMETIC;
            if (selectedCategory === 'collectibles') return item.category === ItemCategory.UTILITY;
            return false;
        });
    }, [items, selectedCategory]);

    const renderCurrencyTab = () => (
        <View style={styles.currencyContainer}>
            <View style={styles.starDustLogoBackground}>
                <Image
                    source={{ uri: 'https://drive.google.com/uc?export=view&id=1bxf-gZ9VjrwtKr5K8A5A7pbHFyQGXACU' }}
                    style={styles.starDustBackgroundImage}
                    resizeMode="contain"
                />
            </View>
            {[
                { id: 'star-dust-1', name: '100 Star Dust', price: 0.01, description: 'Small package' },
                { id: 'star-dust-2', name: '250 Star Dust', price: 0.025, description: 'Medium package' },
                { id: 'star-dust-3', name: '500 Star Dust', price: 0.05, description: 'Large package' },
                { id: 'star-dust-4', name: '1000 Star Dust', price: 0.1, description: 'Extra large package' },
                { id: 'star-dust-5', name: '2500 Star Dust', price: 0.25, description: 'Mega package' },
                { id: 'star-dust-6', name: '5000 Star Dust', price: 0.5, description: 'Ultra package' },
            ].map((pkg) => (
                <TouchableOpacity
                    key={pkg.id}
                    style={styles.starDustPackage}
                    onPress={() => handleStarDustPurchase(pkg.id, pkg.price)}
                >
                    <Image
                        source={{ uri: 'https://drive.google.com/uc?export=view&id=1bxf-gZ9VjrwtKr5K8A5A7pbHFyQGXACU' }}
                        style={styles.packageBackgroundImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    <Text style={styles.packageDescription}>{pkg.description}</Text>
                    <Text style={styles.packagePrice}>{pkg.price} SOL</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderCraftingTab = () => (
        <View style={styles.craftingContainer}>
            {/* Ingredient Inventory */}
            <View style={styles.ingredientInventory}>
                <Text style={styles.sectionTitle}>🧪 Ingredient Inventory</Text>
                <View style={styles.ingredientGrid}>
                    {INGREDIENTS.map(ingredient => {
                        const getIngredientImage = (id: string) => {
                            switch (id) {
                                case 'pink-sugar': return { uri: 'https://via.placeholder.com/48/FF69B4/000000?text=🍬' };
                                case 'nova-egg': return { uri: 'https://via.placeholder.com/48/FFD700/000000?text=🥚' };
                                case 'mira-berry': return { uri: 'https://via.placeholder.com/48/FF1493/000000?text=🫐' };
                                default: return { uri: 'https://via.placeholder.com/48/FF69B4/000000?text=🍬' }; // fallback
                            }
                        };
                        
                        return (
                            <View key={ingredient.id} style={styles.ingredientSlot}>
                                <Image
                                    source={getIngredientImage(ingredient.id)}
                                    style={styles.ingredientImage}
                                    resizeMode="contain"
                                    onError={(error) => console.log('Crafting image failed to load:', ingredient.name, error, 'id:', ingredient.id)}
                                    onLoad={() => console.log('Crafting image loaded successfully:', ingredient.name, 'id:', ingredient.id)}
                                />
                                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                                <Text style={styles.ingredientCount}>
                                    {craftingInventory[ingredient.id] || 0}
                                </Text>
                                <TouchableOpacity
                                    style={styles.addIngredientButton}
                                    onPress={async () => await addIngredientToInventory(ingredient.id)}
                                >
                                    <Text style={styles.addIngredientText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Recipe List */}
            <View style={styles.recipeSection}>
                <Text style={styles.sectionTitle}>📖 Available Recipes</Text>
                <ScrollView style={styles.recipeList}>
                    {RECIPES.map(recipe => (
                        <View key={recipe.id} style={styles.recipeCard}>
                            <View style={styles.recipeHeader}>
                                <Text style={styles.recipeName}>{recipe.name}</Text>
                                <Text style={styles.recipeStars}>{'⭐'.repeat(recipe.starRating)}</Text>
                            </View>
                            <Text style={styles.recipeDescription}>{recipe.description}</Text>
                            
                            {/* Recipe Ingredients */}
                            <View style={styles.recipeIngredients}>
                                <Text style={styles.ingredientsLabel}>Ingredients:</Text>
                                {recipe.ingredients.map((ingredient, index) => (
                                    <View key={index} style={styles.ingredientRequirement}>
                                        <Text style={styles.ingredientText}>
                                            {ingredient.quantity}x {ingredient.id}
                                        </Text>
                                        <Text style={[
                                            styles.ingredientStatus,
                                            craftingInventory[ingredient.id] >= ingredient.quantity 
                                                ? styles.ingredientAvailable 
                                                : styles.ingredientMissing
                                        ]}>
                                            {craftingInventory[ingredient.id] || 0}/{ingredient.quantity}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Craft Button */}
                            <TouchableOpacity
                                style={[
                                    styles.craftButton,
                                    canCraftRecipe(recipe) ? styles.craftButtonEnabled : styles.craftButtonDisabled
                                ]}
                                onPress={async () => await craftRecipe(recipe)}
                                disabled={!canCraftRecipe(recipe)}
                            >
                                <Text style={styles.craftButtonText}>
                                    {canCraftRecipe(recipe) ? '🍳 Craft Recipe' : '❌ Cannot Craft'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );

    return (
        <View style={styles.outerContainer}>
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>SHOP</Text>
            </View>

            <View style={styles.balanceRow}>
                <View style={styles.dustIconContainer}>
                    <Image
                        source={{ uri: 'https://drive.google.com/uc?export=view&id=1bxf-gZ9VjrwtKr5K8A5A7pbHFyQGXACU' }}
                        style={styles.dustIcon}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.dustTextContainer}>
                    <Text style={styles.walletLabel}>WALLET</Text>
                    <Text style={styles.dustAmount}>{dust} Star Dust</Text>
                </View>
            </View>

            <View style={styles.tabNavigation}>
                {[
                    { id: 'currency', label: 'Currency' },
                    { id: 'all', label: 'All' },
                    { id: 'food', label: 'Food' },
                    { id: 'powerups', label: 'Powerups' },
                    { id: 'cosmetics', label: 'Cosmetics' },
                    { id: 'collectibles', label: 'Collectibles' },
                ].map(tab => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tabButton, selectedCategory === tab.id && styles.activeTab]}
                        onPress={() => setSelectedCategory(tab.id)}
                    >
                        <Text style={styles.tabButtonText}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.itemsContainer}>
                {selectedCategory === 'currency' ? (
                    renderCurrencyTab()
                ) : selectedCategory === 'food' ? (
                    <View style={styles.foodTabContainer}>
                        {/* Shop Food Items */}
                        <View style={styles.shopItemsSection}>
                            <Text style={styles.sectionTitle}>🛒 Buy Food Items</Text>
                            <View style={styles.shopItemsGrid}>
                                {Array.from({ length: 6 }).map((_, index) => {
                                    const item = filteredItems[index];
                                    return (
                                        <View key={index} style={[
                                            styles.itemCard,
                                            item && { borderColor: getRarityBorderColor(item.rarity) },
                                            item && flashingItem === item.id && styles.flashingCard
                                        ]}>
                                            {item ? (
                                                <>
                                                                                            <TouchableOpacity
                                            style={[
                                                styles.itemClickArea,
                                                (getTotalPrice() + item.priceStarFragments > dust) && styles.disabledItem
                                            ]}
                                            onPress={async () => await addToCart(item)}
                                            disabled={getTotalPrice() + item.priceStarFragments > dust}
                                        >
                                                        <Image
                                                            source={typeof item.imageUrl === 'string' ? { uri: item.imageUrl } : item.imageUrl}
                                                            style={styles.itemImage}
                                                            resizeMode="contain"
                                                            onError={(error) => console.log('Image failed to load:', item.name, error, 'imageUrl:', item.imageUrl)}
                                                            onLoad={() => console.log('Image loaded successfully:', item.name, 'imageUrl:', item.imageUrl)}
                                                        />
                                                        <Text style={[
                                                            styles.itemName,
                                                            (getTotalPrice() + item.priceStarFragments > dust) && styles.disabledText
                                                        ]}>
                                                            {item.name}
                                                        </Text>
                                                        <View style={styles.priceContainer}>
                                                            <Image
                                                                source={{ uri: 'https://drive.google.com/uc?export=view&id=1bxf-gZ9VjrwtKr5K8A5A7pbHFyQGXACU' }}
                                                                style={styles.priceIcon}
                                                                resizeMode="contain"
                                                            />
                                                            <Text style={[
                                                                styles.itemPrice,
                                                                (getTotalPrice() + item.priceStarFragments > dust) && styles.disabledText
                                                            ]}>
                                                                {item.priceStarFragments}
                                                            </Text>
                                                        </View>
                                                        {getTotalPrice() + item.priceStarFragments > dust && (
                                                            <Text style={styles.insufficientText}>INSUFFICIENT</Text>
                                                        )}
                                                    </TouchableOpacity>
                                                </>
                                            ) : (
                                                <View style={styles.placeholderBox}>
                                                    <Text style={styles.placeholderText}>+</Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Crafting Interface */}
                        {renderCraftingTab()}
                    </View>
                ) : (
                    Array.from({ length: 6 }).map((_, index) => {
                        const item = filteredItems[index];
                        return (
                            <View key={index} style={[
                                styles.itemCard,
                                item && { borderColor: getRarityBorderColor(item.rarity) },
                                item && flashingItem === item.id && styles.flashingCard
                            ]}>
                                {item ? (
                                    <>
                                        <TouchableOpacity
                                            style={[
                                                styles.itemClickArea,
                                                (getTotalPrice() + item.priceStarFragments > dust) && styles.disabledItem
                                            ]}
                                            onPress={async () => await addToCart(item)}
                                            disabled={getTotalPrice() + item.priceStarFragments > dust}
                                        >
                                            <Image
                                                source={typeof item.imageUrl === 'string' ? { uri: item.imageUrl } : item.imageUrl}
                                                style={styles.itemImage}
                                                resizeMode="contain"
                                                onError={(error) => console.log('Image failed to load:', item.name, error)}
                                                onLoad={() => console.log('Image loaded successfully:', item.name)}
                                            />
                                            <Text style={[
                                                styles.itemName,
                                                (getTotalPrice() + item.priceStarFragments > dust) && styles.disabledText
                                            ]}>
                                                {item.name}
                                            </Text>
                                            <View style={styles.priceContainer}>
                                                <Image
                                                    source={{ uri: 'https://drive.google.com/uc?export=view&id=1bxf-gZ9VjrwtKr5K8A5A7pbHFyQGXACU' }}
                                                    style={styles.priceIcon}
                                                    resizeMode="contain"
                                                />
                                                <Text style={[
                                                    styles.itemPrice,
                                                    (getTotalPrice() + item.priceStarFragments > dust) && styles.disabledText
                                                ]}>
                                                    {item.priceStarFragments}
                                                </Text>
                                            </View>
                                            {getTotalPrice() + item.priceStarFragments > dust && (
                                                <Text style={styles.insufficientText}>INSUFFICIENT</Text>
                                            )}
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <View style={styles.placeholderBox}>
                                        <Text style={styles.placeholderText}>+</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
            </View>

            <View style={styles.cartContainer}>
                <View style={styles.cartHeader}>
                    <Text style={styles.cartTitle}>CART ({cart.length})</Text>
                    <View style={styles.cartHeaderRight}>
                        <View style={styles.cartTotal}>
                            <Image
                                source={{ uri: 'https://drive.google.com/uc?export=view&id=1bxf-gZ9VjrwtKr5K8A5A7pbHFyQGXACU' }}
                                style={styles.cartTotalIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.cartTotalText}>{getTotalPrice()}</Text>
                        </View>
                        {cart.length > 0 && (
                            <TouchableOpacity
                                style={styles.clearCartButton}
                                onPress={async () => await clearCart()}
                            >
                                <Text style={styles.clearCartText}>CLEAR</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {cart.length > 0 ? (
                    <View style={styles.cartItems}>
                        <View style={styles.cartItemsRow}>
                            {cart.map(cartItem => (
                                <View key={cartItem.item.id} style={styles.cartItem}>
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={async () => await removeFromCart(cartItem.item.id)}
                                    >
                                        <Text style={styles.removeButtonText}>×</Text>
                                    </TouchableOpacity>
                                    <Image
                                        source={typeof cartItem.item.imageUrl === 'string' ? { uri: cartItem.item.imageUrl } : cartItem.item.imageUrl}
                                        style={styles.cartItemImage}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.cartItemQuantity}>x{cartItem.quantity}</Text>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.checkoutButton}
                            onPress={async () => await handleCheckout()}
                        >
                            <Text style={styles.checkoutButtonText}>CHECKOUT</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.emptyCart}>
                        <Text style={styles.emptyCartText}>Cart is empty</Text>
                    </View>
                )}
            </View>

            <View style={styles.bottomButtonRow}>
                <TouchableOpacity style={styles.footerButton} onPress={onClose}>
                    <Text style={styles.footerButtonText}>BACK</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton}>
                    <Text style={styles.footerButtonText}>VIEW</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton}>
                    <Text style={styles.footerButtonText}>HELP</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#e9f5e9',
        padding: 8,
        borderColor: '#003300',
        borderWidth: 3,
        margin: 4,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
    },
    headerBox: {
        borderWidth: 3,
        borderColor: '#003300',
        padding: 6,
        marginBottom: 8,
        alignItems: 'center',
        backgroundColor: '#f0fff0',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 0,
        elevation: 0,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#003300',
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 2,
        borderColor: '#003300',
        borderRadius: 0,
        padding: 10,
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
    },
    dustIconContainer: {
        justifyContent: 'flex-start',
    },
    dustTextContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    dustIcon: {
        width: 48,
        height: 48,
    },
    dustAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003300',
        textAlign: 'right',
    },
    walletLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
        marginBottom: 2,
    },
    tabNavigation: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    tabButton: {
        width: '30%',
        backgroundColor: '#dbf3db',
        borderColor: '#003300',
        borderWidth: 2,
        paddingVertical: 8,
        marginVertical: 2,
        alignItems: 'center',
        borderRadius: 0,
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 0,
    },
    activeTab: {
        backgroundColor: '#b8e6b8',
        borderTopColor: '#001100',
        borderLeftColor: '#001100',
        borderRightColor: '#006600',
        borderBottomColor: '#006600',
        shadowColor: '#003300',
        shadowOffset: { width: -1, height: -1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
    },
    tabButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#003300',
    },
    itemsContainer: {
        borderWidth: 3,
        borderColor: '#003300',
        backgroundColor: '#f6fff6',
        padding: 4,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        paddingBottom: 8,
        borderRadius: 0,
        borderTopColor: '#001100',
        borderLeftColor: '#001100',
        borderRightColor: '#006600',
        borderBottomColor: '#006600',
        shadowColor: '#001100',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 0,
    },
    itemCard: {
        width: '30%',
        height: 110,
        borderWidth: 3,
        borderColor: '#003300',
        backgroundColor: '#f0fff0',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        marginBottom: 6,
        borderRadius: 0,
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
    },
    itemClickArea: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemImage: {
        width: 45,
        height: 45,
        marginBottom: 4,
    },
    itemName: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 3,
        textAlign: 'center',
        color: '#003300',
    },
    disabledItem: {
        opacity: 0.5,
    },
    disabledText: {
        color: '#999999',
    },
    insufficientText: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#ff6b6b',
        marginTop: 2,
        textAlign: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 51, 0, 0.1)',
        borderWidth: 1,
        borderColor: '#003300',
        borderRadius: 0,
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    priceIcon: {
        width: 12,
        height: 12,
        marginRight: 4,
    },
    itemPrice: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#003300',
    },
    placeholderBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#999',
        backgroundColor: 'transparent',
        borderStyle: 'dashed',
        borderRadius: 0,
        margin: 2,
        opacity: 0.7,
    },
    placeholderText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#bbb',
        opacity: 0.6,
    },
    buyButton: {
        borderWidth: 2,
        borderColor: '#003300',
        paddingVertical: 3,
        paddingHorizontal: 6,
        backgroundColor: '#dbf3db',
        borderRadius: 0,
        borderTopColor: '#f0fff0',
        borderLeftColor: '#f0fff0',
        borderRightColor: '#006600',
        borderBottomColor: '#006600',
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 0,
        elevation: 2,
    },
    buyButtonText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#003300',
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 0,
    },
    disabledButton: {
        backgroundColor: '#cccccc',
        borderTopColor: '#e0e0e0',
        borderLeftColor: '#e0e0e0',
        borderRightColor: '#999999',
        borderBottomColor: '#999999',
        shadowOpacity: 0.2,
    },
    disabledButtonText: {
        color: '#666666',
        fontSize: 7,
        textShadowColor: 'transparent',
    },
    flashingCard: {
        backgroundColor: '#e6ffe6',
        shadowColor: '#00ff00',
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 8,
    },
    cartContainer: {
        borderWidth: 3,
        borderColor: '#003300',
        backgroundColor: '#f6fff6',
        marginBottom: 6,
        borderRadius: 0,
        borderTopColor: '#001100',
        borderLeftColor: '#001100',
        borderRightColor: '#006600',
        borderBottomColor: '#006600',
        shadowColor: '#001100',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 0,
    },
    cartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 6,
        borderBottomWidth: 2,
        borderBottomColor: '#003300',
        backgroundColor: '#e9f5e9',
    },
    cartHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cartTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#003300',
    },
    cartTotal: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cartTotalIcon: {
        width: 14,
        height: 14,
        marginRight: 4,
    },
    cartTotalText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#003300',
    },
    clearCartButton: {
        backgroundColor: '#ff6b6b',
        borderWidth: 2,
        borderColor: '#cc0000',
        borderRadius: 0,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderTopColor: '#ff9999',
        borderLeftColor: '#ff9999',
        borderRightColor: '#cc0000',
        borderBottomColor: '#990000',
        shadowColor: '#660000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 0,
        elevation: 2,
    },
    clearCartText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 0,
    },
    cartItems: {
        padding: 6,
    },
    cartItemsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 6,
    },
    cartItem: {
        alignItems: 'center',
        marginRight: 8,
        marginBottom: 6,
        position: 'relative',
    },
    cartItemImage: {
        width: 40,
        height: 40,
        borderWidth: 2,
        borderColor: '#003300',
        borderRadius: 0,
        backgroundColor: '#f0fff0',
    },
    cartItemQuantity: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#003300',
        marginTop: 2,
        textAlign: 'center',
    },
    removeButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#ff6b6b',
        borderRadius: 10,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#cc0000',
        zIndex: 1,
    },
    removeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 10,
        lineHeight: 10,
    },
    emptyCart: {
        padding: 20,
        alignItems: 'center',
    },
    emptyCartText: {
        fontSize: 12,
        color: '#666',
    },
    checkoutButton: {
        marginTop: 8,
        backgroundColor: '#006600',
        padding: 10,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#003300',
        borderRadius: 0,
        borderTopColor: '#00aa00',
        borderLeftColor: '#00aa00',
        borderRightColor: '#004400',
        borderBottomColor: '#002200',
        shadowColor: '#001100',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 0,
        elevation: 3,
    },
    checkoutButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        textShadowColor: 'rgba(0, 0, 0, 0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 0,
    },
    bottomButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    footerButton: {
        borderWidth: 3,
        borderColor: '#003300',
        backgroundColor: '#ffffffaa',
        padding: 10,
        flex: 1,
        marginHorizontal: 2,
        alignItems: 'center',
        borderRadius: 0,
        shadowColor: '#001100',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
    },
    footerButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#003300',
    },
    // Currency tab styles
    currencyContainer: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        position: 'relative',
    },
    starDustLogoBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.3,
        zIndex: -1,
        transform: [{ translateY: -47.5 }],
    },
    starDustBackgroundImage: {
        width: 200,
        height: 200,
        opacity: 0.3,
    },
    starDustPackage: {
        width: '30%',
        height: 120,
        borderWidth: 3,
        borderColor: '#003300',
        backgroundColor: '#f0fff0',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        marginBottom: 8,
        borderRadius: 0,
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        position: 'relative',
        overflow: 'hidden',
    },
    packageBackgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        opacity: 0.15,
        zIndex: -1,
    },
    packageName: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
        color: '#003300',
        zIndex: 1,
    },
    packageDescription: {
        fontSize: 9,
        color: '#666',
        marginBottom: 4,
        textAlign: 'center',
        zIndex: 1,
    },
    packagePrice: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#006600',
        textAlign: 'center',
        zIndex: 1,
    },

    // Food tab styles
    foodTabContainer: {
        width: '100%',
        padding: 4,
    },
    shopItemsSection: {
        marginBottom: 12,
    },
    shopItemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        marginBottom: 8,
    },
    // Crafting tab styles
    craftingContainer: {
        width: '100%',
        padding: 4,
    },
    ingredientInventory: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#003300',
        marginBottom: 6,
        textAlign: 'center',
    },
    ingredientGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    ingredientSlot: {
        width: 70,
        height: 85,
        borderWidth: 2,
        borderColor: '#003300',
        backgroundColor: '#f0fff0',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        margin: 2,
        borderRadius: 0,
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
    },
    ingredientImage: {
        width: 28,
        height: 28,
        marginBottom: 3,
    },
    ingredientName: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#003300',
        textAlign: 'center',
        marginBottom: 1,
    },
    ingredientCount: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#006600',
        marginBottom: 3,
    },
    addIngredientButton: {
        backgroundColor: '#4CAF50',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#003300',
    },
    addIngredientText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    recipeSection: {
        flex: 1,
    },
    recipeList: {
        maxHeight: 300,
    },
    recipeCard: {
        borderWidth: 2,
        borderColor: '#003300',
        backgroundColor: '#f6fff6',
        padding: 8,
        marginBottom: 6,
        borderRadius: 0,
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
    },
    recipeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    recipeName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#003300',
        flex: 1,
    },
    recipeStars: {
        fontSize: 10,
        color: '#FFD700',
    },
    recipeDescription: {
        fontSize: 9,
        color: '#666',
        marginBottom: 6,
        fontStyle: 'italic',
    },
    recipeIngredients: {
        marginBottom: 8,
    },
    ingredientsLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#003300',
        marginBottom: 3,
    },
    ingredientRequirement: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 1,
    },
    ingredientText: {
        fontSize: 8,
        color: '#003300',
    },
    ingredientStatus: {
        fontSize: 8,
        fontWeight: 'bold',
    },
    ingredientAvailable: {
        color: '#4CAF50',
    },
    ingredientMissing: {
        color: '#F44336',
    },
    craftButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderRadius: 0,
        borderWidth: 2,
        borderColor: '#003300',
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
    },
    craftButtonEnabled: {
        backgroundColor: '#4CAF50',
        borderTopColor: '#001100',
        borderLeftColor: '#001100',
        borderRightColor: '#006600',
        borderBottomColor: '#006600',
    },
    craftButtonDisabled: {
        backgroundColor: '#ccc',
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
    },
    craftButtonText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default Shop;