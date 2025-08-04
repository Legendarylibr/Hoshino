import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import InnerScreen from './InnerScreen';

interface ShopProps {
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onClose: () => void;
    walletConnected?: boolean;
    userBalance?: number;
}

interface MarketplaceItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: ItemCategory;
    rarity: ItemRarity;
    isNFT?: boolean;
    icon: string;
}

enum ItemCategory {
    FOOD = 'FOOD',
    POWERUPS = 'POWERUPS',
    COSMETICS = 'COSMETICS',
    TOYS = 'TOYS',
    UTILITIES = 'UTILITIES',
    RARE_COLLECTIBLES = 'RARE_COLLECTIBLES'
}

enum ItemRarity {
    COMMON = 'COMMON',
    UNCOMMON = 'UNCOMMON',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY',
    MYTHIC = 'MYTHIC'
}

interface StarFragmentPack {
    id: string;
    name: string;
    description: string;
    solPrice: number;
    fragments: number;
    rarity: ItemRarity;
}

const Shop: React.FC<ShopProps> = ({
    onNotification,
    onClose,
    walletConnected = true,
    userBalance = 1.5
}) => {
    const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'currency'>('currency');
    const [selectedRarity, setSelectedRarity] = useState<ItemRarity | 'all'>('all');
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | StarFragmentPack | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [starFragmentBalance, setStarFragmentBalance] = useState(125);
    const [solBalance, setSolBalance] = useState(userBalance);
    const [isLoading, setIsLoading] = useState(false);

    const itemsPerPage = 12; // 3x4 grid like IngredientSelection

    // Mock Star Fragment Packs (like ingredients in IngredientSelection)
    const starFragmentPacks: StarFragmentPack[] = [
        {
            id: 'sf-starter',
            name: 'Starter Pack',
            description: 'Perfect for cosmic beginners',
            solPrice: 0.05,
            fragments: 25,
            rarity: ItemRarity.COMMON
        },
        {
            id: 'sf-small',
            name: 'Small Pack',
            description: 'Great value for regular users',
            solPrice: 0.1,
            fragments: 50,
            rarity: ItemRarity.COMMON
        },
        {
            id: 'sf-medium',
            name: 'Medium Pack',
            description: 'Popular choice for active players',
            solPrice: 0.25,
            fragments: 125,
            rarity: ItemRarity.UNCOMMON
        },
        {
            id: 'sf-large',
            name: 'Large Pack',
            description: 'Excellent value for power users',
            solPrice: 0.5,
            fragments: 275,
            rarity: ItemRarity.RARE
        },
        {
            id: 'sf-mega',
            name: 'Mega Pack',
            description: 'For serious cosmic collectors',
            solPrice: 1.0,
            fragments: 600,
            rarity: ItemRarity.EPIC
        },
        {
            id: 'sf-ultra',
            name: 'Ultra Pack',
            description: 'Maximum value for entrepreneurs',
            solPrice: 2.0,
            fragments: 1300,
            rarity: ItemRarity.LEGENDARY
        },
        {
            id: 'sf-cosmic',
            name: 'Cosmic Pack',
            description: 'The ultimate currency package',
            solPrice: 5.0,
            fragments: 3500,
            rarity: ItemRarity.MYTHIC
        },
        {
            id: 'sf-galactic',
            name: 'Galactic Pack',
            description: 'For cosmic emperors only',
            solPrice: 10.0,
            fragments: 7500,
            rarity: ItemRarity.MYTHIC
        }
    ];

    // Mock Marketplace Items
    const marketplaceItems: MarketplaceItem[] = [
        // Food Items
        {
            id: 'cosmic-apple',
            name: 'Cosmic Apple',
            description: 'A juicy apple infused with stellar energy',
            price: 0.001,
            category: ItemCategory.FOOD,
            rarity: ItemRarity.COMMON,
            icon: '🍎'
        },
        {
            id: 'nebula-berry',
            name: 'Nebula Berry',
            description: 'Sweet berries that sparkle like distant nebulae',
            price: 0.003,
            category: ItemCategory.FOOD,
            rarity: ItemRarity.UNCOMMON,
            icon: '🫐'
        },
        {
            id: 'star-cake',
            name: 'Star Cake',
            description: 'A magnificent cake that glows with inner light',
            price: 0.008,
            category: ItemCategory.FOOD,
            rarity: ItemRarity.RARE,
            icon: '🎂'
        },
        {
            id: 'galaxy-feast',
            name: 'Galaxy Feast',
            description: 'An extravagant meal fit for cosmic royalty',
            price: 0.02,
            category: ItemCategory.FOOD,
            rarity: ItemRarity.EPIC,
            icon: '🍽️'
        },

        // Powerups
        {
            id: 'energy-crystal',
            name: 'Energy Crystal',
            description: 'Instantly restores pet energy',
            price: 0.005,
            category: ItemCategory.POWERUPS,
            rarity: ItemRarity.COMMON,
            icon: '⚡'
        },
        {
            id: 'happiness-orb',
            name: 'Happiness Orb',
            description: 'Boosts pet happiness significantly',
            price: 0.01,
            category: ItemCategory.POWERUPS,
            rarity: ItemRarity.UNCOMMON,
            icon: '😊'
        },
        {
            id: 'strength-serum',
            name: 'Strength Serum',
            description: 'Temporarily increases pet strength',
            price: 0.015,
            category: ItemCategory.POWERUPS,
            rarity: ItemRarity.RARE,
            icon: '💪'
        },
        {
            id: 'cosmic-elixir',
            name: 'Cosmic Elixir',
            description: 'Ultimate powerup with multiple benefits',
            price: 0.03,
            category: ItemCategory.POWERUPS,
            rarity: ItemRarity.LEGENDARY,
            icon: '🧪'
        },

        // Cosmetics
        {
            id: 'star-hat',
            name: 'Star Hat',
            description: 'A fashionable hat with twinkling stars',
            price: 0.012,
            category: ItemCategory.COSMETICS,
            rarity: ItemRarity.UNCOMMON,
            icon: '👒'
        },
        {
            id: 'nebula-collar',
            name: 'Nebula Collar',
            description: 'An elegant collar that pulses with cosmic energy',
            price: 0.025,
            category: ItemCategory.COSMETICS,
            rarity: ItemRarity.RARE,
            icon: '📿'
        },
        {
            id: 'galaxy-wings',
            name: 'Galaxy Wings',
            description: 'Magnificent wings that shimmer like galaxies',
            price: 0.05,
            category: ItemCategory.COSMETICS,
            rarity: ItemRarity.EPIC,
            icon: '🪶'
        },

        // Toys
        {
            id: 'plasma-ball',
            name: 'Plasma Ball',
            description: 'A glowing ball that entertains for hours',
            price: 0.006,
            category: ItemCategory.TOYS,
            rarity: ItemRarity.COMMON,
            icon: '⚽'
        },
        {
            id: 'cosmic-puzzle',
            name: 'Cosmic Puzzle',
            description: 'A challenging puzzle from distant worlds',
            price: 0.018,
            category: ItemCategory.TOYS,
            rarity: ItemRarity.RARE,
            icon: '🧩'
        },

        // Collectibles
        {
            id: 'ancient-artifact',
            name: 'Ancient Artifact',
            description: 'A mysterious relic with unknown powers',
            price: 0.1,
            category: ItemCategory.RARE_COLLECTIBLES,
            rarity: ItemRarity.MYTHIC,
            isNFT: true,
            icon: '🏺'
        }
    ];

    // Get filtered items based on selected category and rarity
    const filteredItems = useMemo(() => {
        if (selectedCategory === 'currency') {
            return starFragmentPacks;
        }

        let items = marketplaceItems.filter(item => item.category === selectedCategory);

        if (selectedRarity !== 'all') {
            items = items.filter(item => item.rarity === selectedRarity);
        }

        return items;
    }, [selectedCategory, selectedRarity]);

    // Get paginated items for current page
    const paginatedItems = useMemo(() => {
        const startIndex = currentPage * itemsPerPage;
        return filteredItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredItems, currentPage]);

    // Calculate total pages
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    // Reset page when category changes
    useEffect(() => {
        setCurrentPage(0);
    }, [selectedCategory, selectedRarity]);

    const handlePurchase = async (item: MarketplaceItem | StarFragmentPack) => {
        setIsLoading(true);

        try {
            // Simulate purchase delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (selectedCategory === 'currency') {
                // Star Fragment purchase
                const pack = item as StarFragmentPack;
                if (solBalance < pack.solPrice) {
                    onNotification?.('❌ Insufficient SOL balance', 'error');
                    return;
                }

                setSolBalance(prev => prev - pack.solPrice);
                setStarFragmentBalance(prev => prev + pack.fragments);

                onNotification?.(
                    `✨ Successfully purchased ${pack.fragments} Star Fragments for ${pack.solPrice.toFixed(4)} SOL!`,
                    'success'
                );
            } else {
                // Regular item purchase
                const marketItem = item as MarketplaceItem;
                const starFragmentPrice = Math.floor(marketItem.price * 1000);

                if (starFragmentBalance < starFragmentPrice) {
                    onNotification?.('❌ Insufficient Star Fragments', 'error');
                    return;
                }

                setStarFragmentBalance(prev => prev - starFragmentPrice);

                onNotification?.(
                    `✅ Successfully purchased ${marketItem.name} for ${starFragmentPrice} Star Fragments!`,
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

    const getCategoryIcon = (category: ItemCategory | 'currency'): string => {
        switch (category) {
            case 'currency': return '✨';
            case ItemCategory.FOOD: return '🍎';
            case ItemCategory.POWERUPS: return '⚡';
            case ItemCategory.COSMETICS: return '💄';
            case ItemCategory.TOYS: return '🎮';
            case ItemCategory.UTILITIES: return '🔧';
            case ItemCategory.RARE_COLLECTIBLES: return '💎';
            default: return '📦';
        }
    };

    if (!walletConnected) {
        return (
            <InnerScreen
                onLeftButtonPress={onClose}
                onCenterButtonPress={() => onNotification?.('🏪 Shop: Connect your wallet to access the cosmic marketplace!', 'info')}
                onRightButtonPress={() => onNotification?.('💰 Shop Help: Purchase Star Fragments and items for your moonlings!', 'info')}
                leftButtonText="←"
                centerButtonText="🏪"
                rightButtonText="?"
            >
                <View style={[styles.mainDisplayArea, styles.shopWelcome]}>
                    <View style={styles.shopWelcomeContent}>
                        <Text style={styles.shopWelcomeTitle}>💫 Cosmic Marketplace</Text>
                        <Text style={styles.shopWelcomeSubtitle}>Connect wallet to browse items</Text>
                        <View style={styles.shopFeaturesGrid}>
                            <View style={styles.shopFeature}>
                                <Text style={styles.shopFeatureText}>✨ Star Fragments</Text>
                            </View>
                            <View style={styles.shopFeature}>
                                <Text style={styles.shopFeatureText}>🍎 Food Items</Text>
                            </View>
                            <View style={styles.shopFeature}>
                                <Text style={styles.shopFeatureText}>⚡ Powerups</Text>
                            </View>
                            <View style={styles.shopFeature}>
                                <Text style={styles.shopFeatureText}>💄 Cosmetics</Text>
                            </View>
                        </View>
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
                setSelectedCategory('currency');
            }}
            onRightButtonPress={() => onNotification?.('🏪 Shop Help: Use Star Fragments (✨) to buy items • Browse categories with tabs • Tap items for details!', 'info')}
            leftButtonText="←"
            centerButtonText="✨"
            rightButtonText="?"
        >
            <ScrollView style={[styles.mainDisplayArea, styles.shopSelection]}>
                {selectedItem ? (
                    // Item Detail View (similar to recipe detail in IngredientSelection)
                    <View style={styles.itemDetail}>
                        <View style={styles.itemDetailHeader}>
                            <Text style={styles.itemDetailIcon}>
                                {selectedCategory === 'currency' ? '✨' : (selectedItem as MarketplaceItem).icon}
                            </Text>
                            <Text style={styles.itemDetailName}>{selectedItem.name}</Text>
                            <Text style={styles.itemDetailDescription}>{selectedItem.description}</Text>
                        </View>

                        <View style={styles.itemDetailInfo}>
                            <Text style={styles.itemPrice}>
                                {selectedCategory === 'currency'
                                    ? `${(selectedItem as StarFragmentPack).solPrice.toFixed(4)} SOL → ${(selectedItem as StarFragmentPack).fragments} ✨`
                                    : `${Math.floor((selectedItem as MarketplaceItem).price * 1000)} ✨`
                                }
                            </Text>
                            <Text style={[styles.itemRarity, { color: getRarityColor(selectedItem.rarity) }]}>
                                {selectedItem.rarity}
                            </Text>
                            {(selectedItem as MarketplaceItem).isNFT && (
                                <Text style={styles.nftBadge}>🎨 NFT</Text>
                            )}
                        </View>

                        <View style={styles.itemActions}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => setSelectedItem(null)}
                            >
                                <Text style={styles.backButtonText}>← Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.purchaseButton, isLoading && styles.disabledButton]}
                                onPress={() => handlePurchase(selectedItem)}
                                disabled={isLoading}
                            >
                                <Text style={styles.purchaseButtonText}>
                                    {isLoading ? '⏳ Buying...' : selectedCategory === 'currency' ? '💰 Buy Pack' : '🛒 Purchase'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // Grid View (similar to IngredientSelection structure)
                    <View style={styles.shopGridView}>
                        {/* Category Tabs (like tab navigation in IngredientSelection) */}
                        <View style={styles.tabNavigation}>
                            <TouchableOpacity
                                style={[styles.tabButton, selectedCategory === 'currency' ? styles.activeTab : null]}
                                onPress={() => setSelectedCategory('currency')}
                            >
                                <Text style={styles.tabButtonText}>✨ Currency</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabButton, selectedCategory === ItemCategory.FOOD ? styles.activeTab : null]}
                                onPress={() => setSelectedCategory(ItemCategory.FOOD)}
                            >
                                <Text style={styles.tabButtonText}>🍎 Food</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabButton, selectedCategory === ItemCategory.POWERUPS ? styles.activeTab : null]}
                                onPress={() => setSelectedCategory(ItemCategory.POWERUPS)}
                            >
                                <Text style={styles.tabButtonText}>⚡ Power</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabButton, selectedCategory === ItemCategory.COSMETICS ? styles.activeTab : null]}
                                onPress={() => setSelectedCategory(ItemCategory.COSMETICS)}
                            >
                                <Text style={styles.tabButtonText}>💄 Beauty</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Rarity Filter (only for non-currency items) */}
                        {selectedCategory !== 'currency' && (
                            <View style={styles.rarityFilter}>
                                <Text style={styles.filterLabel}>Filter by Rarity:</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rarityScroll}>
                                    {['all', ...Object.values(ItemRarity)].map(rarity => (
                                        <TouchableOpacity
                                            key={rarity}
                                            style={[
                                                styles.rarityButton,
                                                selectedRarity === rarity ? styles.activeRarity : null
                                            ]}
                                            onPress={() => setSelectedRarity(rarity as ItemRarity | 'all')}
                                        >
                                            <Text style={styles.rarityButtonText}>
                                                {rarity === 'all' ? 'All' : rarity}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* Items Grid (like ingredients grid in IngredientSelection) */}
                        <View style={styles.itemsGrid}>
                            {Array.from({ length: itemsPerPage }, (_, index) => {
                                const item = paginatedItems[index];

                                if (item) {
                                    return (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={styles.itemCard}
                                            onPress={() => setSelectedItem(item)}
                                        >
                                            <Text style={styles.itemIcon}>
                                                {selectedCategory === 'currency' ? '✨' : (item as MarketplaceItem).icon}
                                            </Text>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            <Text style={styles.itemPrice}>
                                                {selectedCategory === 'currency'
                                                    ? `${(item as StarFragmentPack).solPrice.toFixed(3)} SOL`
                                                    : `${Math.floor((item as MarketplaceItem).price * 1000)} ✨`
                                                }
                                            </Text>
                                            <Text style={[styles.itemRarity, { color: getRarityColor(item.rarity) }]}>
                                                {item.rarity}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }

                                return (
                                    <View key={`empty-${index}`} style={[styles.itemCard, styles.emptySlot]}>
                                        <Text style={styles.emptySlotIcon}>{getCategoryIcon(selectedCategory)}</Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Pagination (if more than one page) */}
                        {totalPages > 1 && (
                            <View style={styles.pagination}>
                                <TouchableOpacity
                                    style={[styles.pageButton, currentPage === 0 && styles.disabledButton]}
                                    onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0}
                                >
                                    <Text style={styles.pageButtonText}>←</Text>
                                </TouchableOpacity>
                                <Text style={styles.pageInfo}>{currentPage + 1} / {totalPages}</Text>
                                <TouchableOpacity
                                    style={[styles.pageButton, currentPage === totalPages - 1 && styles.disabledButton]}
                                    onPress={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                    disabled={currentPage === totalPages - 1}
                                >
                                    <Text style={styles.pageButtonText}>→</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Balance Display */}
                        <View style={styles.balanceDisplay}>
                            <Text style={styles.balanceText}>
                                {solBalance.toFixed(4)} SOL • {starFragmentBalance} ✨
                            </Text>
                            <Text style={styles.balanceHint}>
                                {selectedCategory === 'currency'
                                    ? 'Buy Star Fragments with SOL to purchase items'
                                    : 'Use Star Fragments to buy cosmic items'
                                }
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </InnerScreen>
    );
};

const styles = StyleSheet.create({
    mainDisplayArea: {
        flex: 1,
    },
    shopWelcome: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    shopWelcomeContent: {
        alignItems: 'center',
    },
    shopWelcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    shopWelcomeSubtitle: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: '#666',
    },
    shopFeaturesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    shopFeature: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 100,
    },
    shopFeatureText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    shopSelection: {
        padding: 10,
    },
    shopGridView: {
        flex: 1,
    },
    tabNavigation: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 10,
        padding: 5,
        marginBottom: 15,
    },
    tabButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 2,
    },
    activeTab: {
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
    },
    tabButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    rarityFilter: {
        marginBottom: 15,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    rarityScroll: {
        maxHeight: 50,
    },
    rarityButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 8,
        borderRadius: 15,
        marginHorizontal: 4,
        minWidth: 60,
        alignItems: 'center',
    },
    activeRarity: {
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
    },
    rarityButtonText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: 10,
        marginBottom: 15,
    },
    itemCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        width: '28%',
        minHeight: 100,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'space-between',
    },
    emptySlot: {
        borderStyle: 'dashed',
        opacity: 0.3,
        justifyContent: 'center',
    },
    itemIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    emptySlotIcon: {
        fontSize: 24,
        opacity: 0.5,
    },
    itemName: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 9,
        color: '#2563eb',
        textAlign: 'center',
        marginBottom: 2,
    },
    itemRarity: {
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
        marginBottom: 15,
    },
    pageButton: {
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
        padding: 8,
        borderRadius: 15,
        minWidth: 30,
        alignItems: 'center',
    },
    pageButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    pageInfo: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.3,
    },
    balanceDisplay: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    balanceText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    balanceHint: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
    },
    itemDetail: {
        flex: 1,
        padding: 15,
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
        textAlign: 'center',
        marginBottom: 8,
    },
    itemDetailDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    itemDetailInfo: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    itemPrice: {
        fontSize: 16,
        color: '#2563eb',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    itemRarity: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    nftBadge: {
        fontSize: 12,
        color: '#8b5cf6',
        backgroundColor: '#f3e8ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#8b5cf6',
    },
    itemActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
    },
    backButton: {
        flex: 1,
        backgroundColor: 'rgba(108, 117, 125, 0.8)',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    backButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    purchaseButton: {
        flex: 2,
        backgroundColor: 'rgba(40, 167, 69, 0.8)',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    purchaseButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default Shop;