import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MarketplaceService, {
    MarketplaceItem,
    ItemCategory,
    ItemRarity,
    UserInventory
} from '../services/MarketplaceService';
import { GlobalPointSystem } from '../services/GlobalPointSystem';
import { useWallet } from '../contexts/WalletContext';
import { Connection, PublicKey } from '@solana/web3.js';

interface ShopProps {
    connection: Connection;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ connection, onNotification, onClose }) => {
    const wallet = useWallet();
    const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all' | 'currency'>('all');
    const [selectedRarity, setSelectedRarity] = useState<ItemRarity | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [userInventory, setUserInventory] = useState<UserInventory | null>(null);
    const [marketplaceService, setMarketplaceService] = useState<MarketplaceService | null>(null);
    const [globalPointSystem, setGlobalPointSystem] = useState<GlobalPointSystem | null>(null);
    const [starFragmentBalance, setStarFragmentBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (wallet.connected && connection) {
            const service = new MarketplaceService(connection, wallet as any);
            setMarketplaceService(service);

            if (wallet.publicKey) {
                const publicKeyObj = new PublicKey(wallet.publicKey);
                service.getUserInventory(publicKeyObj).then(inventory => {
                    setUserInventory(inventory);
                });

                const pointSystem = new GlobalPointSystem(wallet.publicKey);
                setGlobalPointSystem(pointSystem);

                let pointsData = pointSystem.getCurrentPoints();
                if (!pointsData) {
                    pointsData = pointSystem.initializeUser(wallet.publicKey);
                }
                setStarFragmentBalance(pointsData.starFragments);
            }
        }
    }, [wallet, connection]);

    const filteredItems = useMemo(() => {
        if (!marketplaceService) return [];

        let items = marketplaceService.getAllItems();

        if (selectedCategory !== 'all') {
            items = items.filter(item => item.category === selectedCategory);
        }

        if (selectedRarity !== 'all') {
            items = items.filter(item => item.rarity === selectedRarity);
        }

        if (searchQuery) {
            items = marketplaceService.searchItems(searchQuery);
        }

        return items;
    }, [marketplaceService, selectedCategory, selectedRarity, searchQuery]);

    const featuredItems = useMemo(() => {
        if (!marketplaceService) return [];
        return marketplaceService.getFeaturedItems();
    }, [marketplaceService]);

    const handleStarFragmentPurchase = async (solAmount: number) => {
        if (!globalPointSystem) {
            onNotification?.('❌ Point system not initialized', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const result = globalPointSystem.purchaseStarFragments(solAmount);

            if (result.success) {
                onNotification?.(
                    `✨ Successfully purchased ${result.fragments} Star Fragments! Cost: ${solAmount.toFixed(4)} SOL`,
                    'success'
                );
                setStarFragmentBalance(globalPointSystem.getStarFragmentBalance());
            } else {
                onNotification?.(`❌ Purchase failed: ${result.error}`, 'error');
            }
        } catch (error) {
            onNotification?.(`❌ Purchase error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePurchase = async (item: MarketplaceItem, quantity: number = 1) => {
        if (!marketplaceService || !wallet.publicKey) {
            onNotification?.('❌ Please connect your wallet first', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const starFragmentPrice = Math.floor(item.price * 1000);
            const isCharacterItem = item.name.toLowerCase().includes('character') || item.name.toLowerCase().includes('moonling');

            if (!isCharacterItem && globalPointSystem) {
                const totalCost = starFragmentPrice * quantity;
                const spendResult = globalPointSystem.spendStarFragments(totalCost);

                if (spendResult.success) {
                    onNotification?.(
                        `✨ Successfully purchased ${quantity}x ${item.name}! Cost: ${totalCost} Star Fragments`,
                        'success'
                    );
                    setStarFragmentBalance(globalPointSystem.getStarFragmentBalance());

                    const publicKeyObj = new PublicKey(wallet.publicKey);
                    const updatedInventory = await marketplaceService.getUserInventory(publicKeyObj);
                    setUserInventory(updatedInventory);
                } else {
                    onNotification?.(`❌ Purchase failed: ${spendResult.error}`, 'error');
                }
            } else {
                const publicKeyObj = new PublicKey(wallet.publicKey);
                const result = await marketplaceService.purchaseItem(item, quantity, publicKeyObj);

                if (result.success) {
                    onNotification?.(
                        `✅ Successfully purchased ${quantity}x ${item.name}! ${item.isNFT ? 'NFT minted to your wallet! ' : ''}Cost: ${(item.price * quantity).toFixed(4)} SOL`,
                        'success'
                    );

                    const updatedInventory = await marketplaceService.getUserInventory(publicKeyObj);
                    setUserInventory(updatedInventory);
                } else {
                    onNotification?.(`❌ Purchase failed: ${result.error}`, 'error');
                }
            }
        } catch (error) {
            onNotification?.(`❌ Purchase error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseItem = async (itemId: string) => {
        if (!marketplaceService) return;

        setIsLoading(true);

        try {
            const result = await marketplaceService.useItem(itemId, 'character_id');

            if (result.success) {
                onNotification?.(
                    `✅ Item used successfully! Effects: ${result.effects.join(' • ')}`,
                    'success'
                );
            } else {
                onNotification?.(`❌ Failed to use item: ${result.error}`, 'error');
            }
        } catch (error) {
            onNotification?.(`❌ Error using item: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCraftItem = async (itemId: string) => {
        if (!marketplaceService || !wallet.publicKey) {
            onNotification?.('❌ Please connect your wallet first', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const publicKeyObj = new PublicKey(wallet.publicKey);
            const result = await marketplaceService.craftItem(itemId, publicKeyObj);

            if (result.success) {
                onNotification?.(
                    `🎨 Successfully crafted ${result.craftedItem?.name}! +${result.experienceGained} XP gained!`,
                    'success'
                );

                const updatedInventory = await marketplaceService.getUserInventory(publicKeyObj);
                setUserInventory(updatedInventory);
            } else {
                onNotification?.(`❌ Crafting failed: ${result.error}`, 'error');
            }
        } catch (error) {
            onNotification?.(`❌ Crafting error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const getRarityColor = (rarity: ItemRarity): string => {
        switch (rarity) {
            case ItemRarity.COMMON: return '#9ca3af';
            case ItemRarity.UNCOMMON: return '#10b981';
            case ItemRarity.RARE: return '#3b82f6';
            case ItemRarity.EPIC: return '#8b5cf6';
            case ItemRarity.LEGENDARY: return '#f59e0b';
            case ItemRarity.MYTHIC: return '#ef4444';
            default: return '#6b7280';
        }
    };

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

    if (!wallet.connected) {
        return (
            <View style={styles.tamagotchiScreenContainer}>
                <View style={styles.tamagotchiTopStatus}>
                    <Text style={styles.gearIcon}>🏪</Text>
                    <Text style={styles.walletStatusText}>Cosmic Marketplace - [wallet disconnected]</Text>
                </View>
                <View style={styles.tamagotchiMainScreen}>
                    <View style={[styles.mainDisplayArea, styles.shopWelcome]}>
                        <View style={styles.shopWelcomeContent}>
                            <Text style={styles.shopWelcomeTitle}>💫 Cosmic Marketplace</Text>
                            <Text style={styles.shopWelcomeSubtitle}>Wallet connecting in background...</Text>
                            <View style={styles.shopFeaturesGrid}>
                                <View style={styles.shopFeature}>
                                    <Text style={styles.shopFeatureText}>🍎 Food Items</Text>
                                </View>
                                <View style={styles.shopFeature}>
                                    <Text style={styles.shopFeatureText}>⚡ Powerups</Text>
                                </View>
                                <View style={styles.shopFeature}>
                                    <Text style={styles.shopFeatureText}>✨ Cosmetics</Text>
                                </View>
                                <View style={styles.shopFeature}>
                                    <Text style={styles.shopFeatureText}>💎 Collectibles</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.bottomNavigation}>
                    <TouchableOpacity style={styles.bottomButton} onPress={onClose}>
                        <Text>←</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomButton}>
                        <Text>💰</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomButton}>
                        <Text>?</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.tamagotchiScreenContainer}>
            <View style={styles.tamagotchiTopStatus}>
                <Text style={styles.gearIcon}>🏪</Text>
                <Text style={styles.walletStatusText}>
                    {userInventory?.sol_balance.toFixed(4) || '0.0000'} SOL • {starFragmentBalance} ✨
                </Text>
            </View>
            <View style={styles.tamagotchiMainScreen}>
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>SOL</Text>
                        <Text style={styles.statStars}>{userInventory?.sol_balance.toFixed(3) || '0'}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Star ✨</Text>
                        <Text style={styles.statStars}>{starFragmentBalance}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Items</Text>
                        <Text style={styles.statStars}>{selectedCategory === 'currency' ? '3' : filteredItems.length}</Text>
                    </View>
                </View>
                <View style={[styles.mainDisplayArea, styles.shopDisplay]}>
                    <View style={styles.shopQuickCategories}>
                        <TouchableOpacity
                            style={[styles.categoryButton, selectedCategory === 'currency' ? styles.categoryButtonActive : null]}
                            onPress={() => setSelectedCategory('currency')}
                        >
                            <Text style={styles.categoryButtonText}>✨ Currency</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryButton, selectedCategory === 'all' ? styles.categoryButtonActive : null]}
                            onPress={() => setSelectedCategory('all')}
                        >
                            <Text style={styles.categoryButtonText}>📦 All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryButton, selectedCategory === ItemCategory.FOOD ? styles.categoryButtonActive : null]}
                            onPress={() => setSelectedCategory(ItemCategory.FOOD)}
                        >
                            <Text style={styles.categoryButtonText}>🍎 Food</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryButton, selectedCategory === ItemCategory.POWERUPS ? styles.categoryButtonActive : null]}
                            onPress={() => setSelectedCategory(ItemCategory.POWERUPS)}
                        >
                            <Text style={styles.categoryButtonText}>⚡ Power</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.shopItemsGrid}>
                        {selectedCategory === 'currency' ? (
                            [
                                { sol: 0.1, fragments: 10, name: 'Small Pack' },
                                { sol: 0.5, fragments: 50, name: 'Medium Pack' },
                                { sol: 1.0, fragments: 100, name: 'Large Pack' }
                            ].map((pack, index) => (
                                <View key={`currency-${index}`} style={styles.shopItemCard}>
                                    <Text style={styles.shopItemIcon}>✨</Text>
                                    <Text style={styles.shopItemName}>{pack.name}</Text>
                                    <Text style={styles.shopItemPrice}>{pack.sol.toFixed(3)} SOL</Text>
                                    <Text style={[styles.shopItemRarity, { color: '#f59e0b' }]}>{pack.fragments} ✨</Text>
                                    <TouchableOpacity
                                        onPress={() => handleStarFragmentPurchase(pack.sol)}
                                        disabled={isLoading}
                                        style={[styles.shopBuyBtn, isLoading && { opacity: 0.6 }]}
                                    >
                                        <Text>{isLoading ? '⏳' : '💰'}</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            filteredItems.slice(0, 6).map(item => {
                                const isCharacterItem = item.name.toLowerCase().includes('character') || item.name.toLowerCase().includes('moonling');
                                const starFragmentPrice = Math.floor(item.price * 1000);

                                return (
                                    <View key={item.id} style={styles.shopItemCard}>
                                        <Text style={styles.shopItemIcon}>{getCategoryEmoji(item.category)}</Text>
                                        <Text style={styles.shopItemName}>{item.name.slice(0, 8)}</Text>
                                        <Text style={styles.shopItemPrice}>
                                            {isCharacterItem ? `${item.price.toFixed(3)} SOL` : `${starFragmentPrice} ✨`}
                                        </Text>
                                        <Text
                                            style={[styles.shopItemRarity, { color: getRarityColor(item.rarity) }]}
                                        >
                                            {item.rarity.slice(0, 4).toUpperCase()}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => handlePurchase(item)}
                                            disabled={isLoading}
                                            style={[styles.shopBuyBtn, isLoading && { opacity: 0.6 }]}
                                        >
                                            <Text>{isLoading ? '⏳' : '💰'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })
                        )}
                    </View>
                    {selectedCategory === 'currency' ? (
                        <Text style={styles.shopPagination}>Star Fragment Packages - Buy with SOL</Text>
                    ) : filteredItems.length > 6 && (
                        <Text style={styles.shopPagination}>Showing 6 of {filteredItems.length} items</Text>
                    )}
                </View>
            </View>
            <View style={styles.bottomNavigation}>
                <TouchableOpacity style={styles.bottomButton} onPress={onClose}>
                    <Text>←</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomButton} onPress={() => setSelectedCategory('all')}>
                    <Text>📦</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={() => {
                        onNotification?.(`🏪 Marketplace Help: Buy Star Fragments with SOL • Use Star Fragments for in-game items • Characters cost SOL • Items boost your moonling's stats!`, 'info');
                    }}
                >
                    <Text>?</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    tamagotchiScreenContainer: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    tamagotchiTopStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#ddd',
    },
    gearIcon: {
        marginRight: 10,
        fontSize: 16,
    },
    walletStatusText: {
        flex: 1,
        fontSize: 14,
    },
    tamagotchiMainScreen: {
        flex: 1,
    },
    mainDisplayArea: {
        flex: 1,
    },
    shopWelcome: {
        backgroundColor: '#D4B896',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    shopWelcomeContent: {
        alignItems: 'center',
    },
    shopWelcomeTitle: {
        fontSize: 12,
        marginBottom: 10,
        color: '#5D4E37',
    },
    shopWelcomeSubtitle: {
        fontSize: 8,
        marginBottom: 20,
        color: '#5D4E37',
    },
    shopFeaturesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    shopFeature: {
        padding: 8,
        backgroundColor: '#E8D5A3',
        borderWidth: 2,
        borderColor: '#8B7355',
        borderRadius: 8,
        margin: 5,
        flexBasis: '45%',
        alignItems: 'center',
    },
    shopFeatureText: {
        fontSize: 8,
        color: '#5D4E37',
        textAlign: 'center',
    },
    bottomNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#ddd',
    },
    bottomButton: {
        padding: 10,
        backgroundColor: '#ccc',
        borderRadius: 4,
        alignItems: 'center',
        minWidth: 50,
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#eee',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statLabel: {
        marginRight: 5,
        fontSize: 12,
    },
    statStars: {
        fontSize: 12,
    },
    shopDisplay: {
        backgroundColor: '#D4B896',
        flexDirection: 'column',
        padding: 15,
    },
    shopQuickCategories: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 15,
    },
    categoryButton: {
        paddingVertical: 6,
        paddingHorizontal: 8,
        backgroundColor: '#E8D5A3',
        borderWidth: 2,
        borderColor: '#8B7355',
        borderRadius: 6,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    categoryButtonActive: {
        backgroundColor: '#F0E5B8',
        borderColor: '#4da6ff',
        shadowColor: 'rgba(77, 166, 255, 0.3)',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 8,
        shadowOpacity: 1,
        elevation: 3,
    },
    categoryButtonText: {
        fontSize: 6,
        color: '#5D4E37',
    },
    shopItemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 10,
    },
    shopItemCard: {
        backgroundColor: '#E8D5A3',
        borderWidth: 2,
        borderColor: '#8B7355',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
        margin: 6,
        flexBasis: '30%',
    },
    shopItemIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    shopItemName: {
        fontSize: 6,
        color: '#5D4E37',
        marginBottom: 3,
        textAlign: 'center',
    },
    shopItemPrice: {
        fontSize: 5,
        color: '#2563eb',
        marginBottom: 3,
        textAlign: 'center',
    },
    shopItemRarity: {
        fontSize: 4,
        marginBottom: 5,
        textAlign: 'center',
    },
    shopBuyBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#8B7355',
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 4,
        alignItems: 'center',
    },
    shopPagination: {
        fontSize: 6,
        color: '#5D4E37',
        textAlign: 'center',
        marginTop: 5,
    },
});

export default Shop;