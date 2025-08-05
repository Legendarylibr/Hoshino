import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import InnerScreen from './InnerScreen';

interface ShopProps {
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onClose: () => void;
    walletConnected?: boolean;
    userBalance?: number;
}

interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: ItemCategory;
    rarity: ItemRarity;
    icon: string;
    starFragmentPrice: number;
}

interface StarFragmentPack {
    id: string;
    name: string;
    description: string;
    solPrice: number;
    fragments: number;
    rarity: ItemRarity;
}

enum ItemCategory {
    CURRENCY = 'CURRENCY',
    FOOD = 'FOOD',
    POWERUPS = 'POWERUPS',
    COSMETICS = 'COSMETICS',
    ACCESSORIES = 'ACCESSORIES'
}

enum ItemRarity {
    COMMON = 'COMMON',
    UNCOMMON = 'UNCOMMON',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY',
    MYTHIC = 'MYTHIC'
}

const Shop: React.FC<ShopProps> = ({
    onNotification,
    onClose,
    walletConnected = true,
    userBalance = 1.5
}) => {
    const [selectedCategory, setSelectedCategory] = useState<ItemCategory>(ItemCategory.CURRENCY);
    const [selectedItem, setSelectedItem] = useState<ShopItem | StarFragmentPack | null>(null);
    const [starFragmentBalance, setStarFragmentBalance] = useState(125);
    const [solBalance, setSolBalance] = useState(userBalance);
    const [isLoading, setIsLoading] = useState(false);

    // Star Fragment Packs (Currency Category)
    const starFragmentPacks: StarFragmentPack[] = [
        {
            id: 'sf-small',
            name: 'Small Pack',
            description: 'Perfect starter pack',
            solPrice: 0.1,
            fragments: 50,
            rarity: ItemRarity.COMMON
        },
        {
            id: 'sf-medium',
            name: 'Medium Pack',
            description: 'Great value pack',
            solPrice: 0.25,
            fragments: 125,
            rarity: ItemRarity.UNCOMMON
        },
        {
            id: 'sf-large',
            name: 'Large Pack',
            description: 'Best value pack',
            solPrice: 0.5,
            fragments: 275,
            rarity: ItemRarity.RARE
        },
        {
            id: 'sf-mega',
            name: 'Mega Pack',
            description: 'For power users',
            solPrice: 1.0,
            fragments: 600,
            rarity: ItemRarity.EPIC
        },
        {
            id: 'sf-ultra',
            name: 'Ultra Pack',
            description: 'Maximum value',
            solPrice: 2.0,
            fragments: 1300,
            rarity: ItemRarity.LEGENDARY
        },
        {
            id: 'sf-cosmic',
            name: 'Cosmic Pack',
            description: 'Ultimate package',
            solPrice: 5.0,
            fragments: 3500,
            rarity: ItemRarity.MYTHIC
        }
    ];

    // Shop Items by Category
    const shopItems: ShopItem[] = [
        // Food Items
        {
            id: 'cosmic-apple',
            name: 'Cosmic Apple',
            description: 'A juicy apple infused with stellar energy',
            price: 0.001,
            starFragmentPrice: 15,
            category: ItemCategory.FOOD,
            rarity: ItemRarity.COMMON,
            icon: '🍎'
        },
        {
            id: 'star-cake',
            name: 'Star Cake',
            description: 'A magnificent cake that glows',
            price: 0.008,
            starFragmentPrice: 45,
            category: ItemCategory.FOOD,
            rarity: ItemRarity.RARE,
            icon: '🎂'
        },
        {
            id: 'nebula-berry',
            name: 'Nebula Berry',
            description: 'Sweet berries that sparkle',
            price: 0.003,
            starFragmentPrice: 25,
            category: ItemCategory.FOOD,
            rarity: ItemRarity.UNCOMMON,
            icon: '🫐'
        },
        {
            id: 'galaxy-feast',
            name: 'Galaxy Feast',
            description: 'Extravagant cosmic meal',
            price: 0.02,
            starFragmentPrice: 85,
            category: ItemCategory.FOOD,
            rarity: ItemRarity.EPIC,
            icon: '🍽️'
        },

        // Powerups
        {
            id: 'energy-crystal',
            name: 'Energy Crystal',
            description: 'Restores pet energy instantly',
            price: 0.005,
            starFragmentPrice: 30,
            category: ItemCategory.POWERUPS,
            rarity: ItemRarity.COMMON,
            icon: '⚡'
        },
        {
            id: 'happiness-orb',
            name: 'Happy Orb',
            description: 'Boosts pet happiness',
            price: 0.01,
            starFragmentPrice: 55,
            category: ItemCategory.POWERUPS,
            rarity: ItemRarity.UNCOMMON,
            icon: '😊'
        },
        {
            id: 'strength-serum',
            name: 'Power Serum',
            description: 'Increases pet strength',
            price: 0.015,
            starFragmentPrice: 75,
            category: ItemCategory.POWERUPS,
            rarity: ItemRarity.RARE,
            icon: '💪'
        },
        {
            id: 'cosmic-elixir',
            name: 'Cosmic Elixir',
            description: 'Ultimate powerup potion',
            price: 0.03,
            starFragmentPrice: 120,
            category: ItemCategory.POWERUPS,
            rarity: ItemRarity.LEGENDARY,
            icon: '🧪'
        },

        // Cosmetics
        {
            id: 'star-hat',
            name: 'Star Hat',
            description: 'Fashionable hat with stars',
            price: 0.012,
            starFragmentPrice: 60,
            category: ItemCategory.COSMETICS,
            rarity: ItemRarity.UNCOMMON,
            icon: '👒'
        },
        {
            id: 'galaxy-wings',
            name: 'Galaxy Wings',
            description: 'Magnificent cosmic wings',
            price: 0.05,
            starFragmentPrice: 200,
            category: ItemCategory.COSMETICS,
            rarity: ItemRarity.EPIC,
            icon: '🪶'
        },

        // Accessories  
        {
            id: 'nebula-collar',
            name: 'Nebula Collar',
            description: 'Elegant glowing collar',
            price: 0.025,
            starFragmentPrice: 95,
            category: ItemCategory.ACCESSORIES,
            rarity: ItemRarity.RARE,
            icon: '📿'
        },
        {
            id: 'cosmic-charm',
            name: 'Cosmic Charm',
            description: 'Lucky charm from space',
            price: 0.008,
            starFragmentPrice: 40,
            category: ItemCategory.ACCESSORIES,
            rarity: ItemRarity.UNCOMMON,
            icon: '🔮'
        }
    ];

    // Get items for selected category
    const categoryItems = useMemo(() => {
        if (selectedCategory === ItemCategory.CURRENCY) {
            return starFragmentPacks;
        }
        return shopItems.filter(item => item.category === selectedCategory);
    }, [selectedCategory]);

    const handlePurchase = async (item: ShopItem | StarFragmentPack) => {
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (selectedCategory === ItemCategory.CURRENCY) {
                const pack = item as StarFragmentPack;
                if (solBalance < pack.solPrice) {
                    onNotification?.('❌ Insufficient SOL balance', 'error');
                    return;
                }

                setSolBalance(prev => prev - pack.solPrice);
                setStarFragmentBalance(prev => prev + pack.fragments);
                onNotification?.(
                    `✨ Purchased ${pack.fragments} Star Fragments for ${pack.solPrice.toFixed(4)} SOL!`,
                    'success'
                );
            } else {
                const shopItem = item as ShopItem;
                if (starFragmentBalance < shopItem.starFragmentPrice) {
                    onNotification?.('❌ Insufficient Star Fragments', 'error');
                    return;
                }

                setStarFragmentBalance(prev => prev - shopItem.starFragmentPrice);
                onNotification?.(
                    `✅ Purchased ${shopItem.name} for ${shopItem.starFragmentPrice} ✨!`,
                    'success'
                );
            }
        } catch (error) {
            onNotification?.('❌ Purchase failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const getRarityColor = (rarity: ItemRarity): string => {
        switch (rarity) {
            case ItemRarity.COMMON: return '#6b7280';
            case ItemRarity.UNCOMMON: return '#10b981';
            case ItemRarity.RARE: return '#3b82f6';
            case ItemRarity.EPIC: return '#8b5cf6';
            case ItemRarity.LEGENDARY: return '#f59e0b';
            case ItemRarity.MYTHIC: return '#ef4444';
            default: return '#6b7280';
        }
    };

    if (!walletConnected) {
        return (
            <InnerScreen
                onLeftButtonPress={onClose}
                onCenterButtonPress={() => onNotification?.('🏪 Connect wallet to access shop!', 'info')}
                onRightButtonPress={() => onNotification?.('💰 Shop: Purchase items and currency!', 'info')}
                leftButtonText="←"
                centerButtonText="🏪"
                rightButtonText="?"
            >
                <View style={styles.container}>
                    {/* Header - matching inventory style */}
                    <View style={styles.header}>
                        <Text style={styles.headerIcon}>🏪</Text>
                        <Text style={styles.headerTitle}>COSMIC MARKETPLACE</Text>
                    </View>

                    <View style={styles.welcomeMessage}>
                        <Text style={styles.welcomeTitle}>Connect Wallet</Text>
                        <Text style={styles.welcomeSubtitle}>to access marketplace</Text>
                    </View>
                </View>
            </InnerScreen>
        );
    }

    return (
        <InnerScreen
            onLeftButtonPress={onClose}
            onCenterButtonPress={() => {
                setSelectedItem(null);
                setSelectedCategory(ItemCategory.CURRENCY);
            }}
            onRightButtonPress={() => onNotification?.('🏪 Shop Help: Buy Star Fragments with SOL, then use ✨ to purchase items!', 'info')}
            leftButtonText="←"
            centerButtonText="✨"
            rightButtonText="?"
        >
            <View style={styles.container}>
                {/* Header - exactly like inventory */}
                <View style={styles.header}>
                    <Text style={styles.headerIcon}>🏪</Text>
                    <Text style={styles.headerTitle}>COSMIC MARKETPLACE</Text>
                </View>

                {selectedItem ? (
                    // Item Detail View
                    <ScrollView style={styles.itemDetail}>
                        <View style={styles.itemDetailHeader}>
                            <Text style={styles.itemDetailIcon}>
                                {selectedCategory === ItemCategory.CURRENCY ? '✨' : (selectedItem as ShopItem).icon}
                            </Text>
                            <Text style={styles.itemDetailName}>{selectedItem.name}</Text>
                            <Text style={styles.itemDetailDescription}>{selectedItem.description}</Text>
                        </View>

                        <View style={styles.itemDetailInfo}>
                            <Text style={styles.itemPrice}>
                                {selectedCategory === ItemCategory.CURRENCY
                                    ? `${(selectedItem as StarFragmentPack).solPrice.toFixed(4)} SOL → ${(selectedItem as StarFragmentPack).fragments} ✨`
                                    : `${(selectedItem as ShopItem).starFragmentPrice} ✨`
                                }
                            </Text>
                            <Text style={[styles.itemRarity, { color: getRarityColor(selectedItem.rarity) }]}>
                                {selectedItem.rarity}
                            </Text>
                        </View>

                        <View style={styles.itemActions}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => setSelectedItem(null)}
                            >
                                <Text style={styles.backButtonText}>← BACK</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.purchaseButton, isLoading && styles.disabledButton]}
                                onPress={() => handlePurchase(selectedItem)}
                                disabled={isLoading}
                            >
                                <Text style={styles.purchaseButtonText}>
                                    {isLoading ? 'BUYING...' : 'PURCHASE'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.balanceInfo}>
                            <Text style={styles.balanceText}>Balance: {solBalance.toFixed(4)} SOL • {starFragmentBalance} ✨</Text>
                        </View>
                    </ScrollView>
                ) : (
                    // Main Shop View - matching inventory layout exactly
                    <View style={styles.shopContent}>
                        {/* Category Tabs - matching inventory style exactly */}
                        <View style={styles.categoryGrid}>
                            <TouchableOpacity
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === ItemCategory.CURRENCY && styles.activeCategoryButton
                                ]}
                                onPress={() => setSelectedCategory(ItemCategory.CURRENCY)}
                            >
                                <Text style={[
                                    styles.categoryButtonText,
                                    selectedCategory === ItemCategory.CURRENCY && styles.activeCategoryButtonText
                                ]}>CURRENCY</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === ItemCategory.FOOD && styles.activeCategoryButton
                                ]}
                                onPress={() => setSelectedCategory(ItemCategory.FOOD)}
                            >
                                <Text style={[
                                    styles.categoryButtonText,
                                    selectedCategory === ItemCategory.FOOD && styles.activeCategoryButtonText
                                ]}>FOOD</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === ItemCategory.POWERUPS && styles.activeCategoryButton
                                ]}
                                onPress={() => setSelectedCategory(ItemCategory.POWERUPS)}
                            >
                                <Text style={[
                                    styles.categoryButtonText,
                                    selectedCategory === ItemCategory.POWERUPS && styles.activeCategoryButtonText
                                ]}>POWERUPS</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === ItemCategory.COSMETICS && styles.activeCategoryButton
                                ]}
                                onPress={() => setSelectedCategory(ItemCategory.COSMETICS)}
                            >
                                <Text style={[
                                    styles.categoryButtonText,
                                    selectedCategory === ItemCategory.COSMETICS && styles.activeCategoryButtonText
                                ]}>COSMETICS</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === ItemCategory.ACCESSORIES && styles.activeCategoryButton
                                ]}
                                onPress={() => setSelectedCategory(ItemCategory.ACCESSORIES)}
                            >
                                <Text style={[
                                    styles.categoryButtonText,
                                    selectedCategory === ItemCategory.ACCESSORIES && styles.activeCategoryButtonText
                                ]}>ACCESSORIES</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Items Grid - exactly like inventory 3x2 layout */}
                        <View style={styles.itemsContainer}>
                            <View style={styles.itemsGrid}>
                                {Array.from({ length: 6 }, (_, index) => {
                                    const item = categoryItems[index];

                                    if (item) {
                                        return (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={styles.itemSlot}
                                                onPress={() => setSelectedItem(item)}
                                            >
                                                <Text style={styles.itemIcon}>
                                                    {selectedCategory === ItemCategory.CURRENCY ? '✨' : (item as ShopItem).icon}
                                                </Text>
                                                <Text style={styles.itemName}>{item.name}</Text>
                                                <Text style={styles.itemPrice}>
                                                    {selectedCategory === ItemCategory.CURRENCY
                                                        ? `${(item as StarFragmentPack).solPrice.toFixed(3)} SOL`
                                                        : `${(item as ShopItem).starFragmentPrice} ✨`
                                                    }
                                                </Text>
                                                <Text style={[styles.itemRarity, { color: getRarityColor(item.rarity) }]}>
                                                    {item.rarity}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    }

                                    // Empty slot with dashed border and + icon - exactly like inventory
                                    return (
                                        <View key={`empty-${index}`} style={styles.emptySlot}>
                                            <Text style={styles.emptySlotIcon}>+</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </InnerScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#c8d5b9',
        padding: 15,
    },
    header: {
        backgroundColor: '#8fbc8f',
        borderWidth: 3,
        borderColor: '#2d5a2d',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    headerIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d5a2d',
        letterSpacing: 1,
    },
    welcomeMessage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d5a2d',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#5a7a5a',
    },
    shopContent: {
        flex: 1,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 15,
        gap: 8,
    },
    categoryButton: {
        backgroundColor: '#c8d5b9',
        borderWidth: 3,
        borderColor: '#2d5a2d',
        borderRadius: 8,
        padding: 12,
        width: '48%',
        alignItems: 'center',
        minHeight: 50,
        justifyContent: 'center',
    },
    activeCategoryButton: {
        backgroundColor: '#2d5a2d',
    },
    categoryButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2d5a2d',
        textAlign: 'center',
    },
    activeCategoryButtonText: {
        color: '#c8d5b9',
    },
    itemsContainer: {
        flex: 1,
        backgroundColor: '#a8c8a8',
        borderWidth: 3,
        borderColor: '#2d5a2d',
        borderRadius: 8,
        padding: 15,
    },
    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    itemSlot: {
        width: '31%',
        aspectRatio: 1,
        backgroundColor: '#e8f5e8',
        borderWidth: 3,
        borderColor: '#2d5a2d',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    emptySlot: {
        width: '31%',
        aspectRatio: 1,
        backgroundColor: 'transparent',
        borderWidth: 3,
        borderColor: '#5a7a5a',
        borderStyle: 'dashed',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptySlotIcon: {
        fontSize: 24,
        color: '#5a7a5a',
        fontWeight: 'bold',
    },
    itemIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    itemName: {
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2d5a2d',
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: 7,
        color: '#4a6a4a',
        textAlign: 'center',
        marginBottom: 2,
    },
    itemRarity: {
        fontSize: 6,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    itemDetail: {
        flex: 1,
        backgroundColor: '#a8c8a8',
        borderWidth: 3,
        borderColor: '#2d5a2d',
        borderRadius: 8,
        padding: 20,
    },
    itemDetailHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    itemDetailIcon: {
        fontSize: 48,
        marginBottom: 10,
    },
    itemDetailName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d5a2d',
        textAlign: 'center',
        marginBottom: 8,
    },
    itemDetailDescription: {
        fontSize: 14,
        color: '#4a6a4a',
        textAlign: 'center',
        lineHeight: 20,
    },
    itemDetailInfo: {
        backgroundColor: '#e8f5e8',
        borderWidth: 2,
        borderColor: '#2d5a2d',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d5a2d',
        marginBottom: 5,
    },
    itemRarity: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    itemActions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    backButton: {
        flex: 1,
        backgroundColor: '#8fbc8f',
        borderWidth: 2,
        borderColor: '#2d5a2d',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2d5a2d',
    },
    purchaseButton: {
        flex: 2,
        backgroundColor: '#6a9a6a',
        borderWidth: 2,
        borderColor: '#2d5a2d',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    purchaseButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    disabledButton: {
        opacity: 0.5,
    },
    balanceInfo: {
        backgroundColor: '#e8f5e8',
        borderWidth: 2,
        borderColor: '#2d5a2d',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
    },
    balanceText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2d5a2d',
    },
});

export default Shop;