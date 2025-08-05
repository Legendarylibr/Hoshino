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
import InnerScreen from './InnerScreen';

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
            onNotification?.('❌ Marketplace not initialized', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const result = await marketplaceService.purchaseItem(item.id, quantity);

            if (result.success) {
                onNotification?.(
                    `✅ Successfully purchased ${quantity}x ${item.name}! Cost: ${result.cost.toFixed(4)} SOL`,
                    'success'
                );

                // Refresh inventory
                const publicKeyObj = new PublicKey(wallet.publicKey);
                const inventory = await marketplaceService.getUserInventory(publicKeyObj);
                setUserInventory(inventory);
            } else {
                onNotification?.(`❌ Purchase failed: ${result.error}`, 'error');
            }
        } catch (error) {
            onNotification?.(`❌ Purchase error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseItem = async (itemId: string) => {
        if (!marketplaceService || !wallet.publicKey) {
            onNotification?.('❌ Marketplace not initialized', 'error');
            return;
        }

        try {
            const result = await marketplaceService.useItem(itemId);

            if (result.success) {
                onNotification?.(`✨ Used ${result.itemName}! ${result.effect}`, 'success');

                // Refresh inventory
                const publicKeyObj = new PublicKey(wallet.publicKey);
                const inventory = await marketplaceService.getUserInventory(publicKeyObj);
                setUserInventory(inventory);
            } else {
                onNotification?.(`❌ Failed to use item: ${result.error}`, 'error');
            }
        } catch (error) {
            onNotification?.(`❌ Use item error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
    };

    const handleCraftItem = async (itemId: string) => {
        if (!marketplaceService || !wallet.publicKey) {
            onNotification?.('❌ Marketplace not initialized', 'error');
            return;
        }

        try {
            const result = await marketplaceService.craftItem(itemId);

            if (result.success) {
                onNotification?.(`🔨 Successfully crafted ${result.itemName}!`, 'success');

                // Refresh inventory
                const publicKeyObj = new PublicKey(wallet.publicKey);
                const inventory = await marketplaceService.getUserInventory(publicKeyObj);
                setUserInventory(inventory);
            } else {
                onNotification?.(`❌ Crafting failed: ${result.error}`, 'error');
            }
        } catch (error) {
            onNotification?.(`❌ Crafting error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
    };

    const getRarityColor = (rarity: ItemRarity): string => {
        switch (rarity) {
            case ItemRarity.COMMON: return '#6b7280';
            case ItemRarity.UNCOMMON: return '#10b981';
            case ItemRarity.RARE: return '#3b82f6';
            case ItemRarity.EPIC: return '#8b5cf6';
            case ItemRarity.LEGENDARY: return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const getCategoryEmoji = (category: ItemCategory): string => {
        switch (category) {
            case ItemCategory.FOOD: return '🍎';
            case ItemCategory.POWERUPS: return '⚡';
            case ItemCategory.COSMETICS: return '✨';
            case ItemCategory.RARE_COLLECTIBLES: return '💎';
            default: return '📦';
        }
    };

    if (!wallet.connected) {
        return (
            <InnerScreen
                topStatusContent={
                    <Text style={styles.walletStatusText}>Cosmic Marketplace - [wallet disconnected]</Text>
                }
                showStatsBar={false}
                onLeftButtonPress={onClose}
                onCenterButtonPress={() => onNotification?.('💰 Shop Help: Purchase items, currency, and powerups for your moonlings!', 'info')}
                onRightButtonPress={() => onNotification?.('🏪 Marketplace: Connect wallet to access the cosmic marketplace!', 'info')}
                leftButtonText="←"
                centerButtonText="💰"
                rightButtonText="?"
            >
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
            </InnerScreen>
        );
    }

    return (
        <InnerScreen
            topStatusContent={
                <Text style={styles.walletStatusText}>
                    {userInventory?.sol_balance.toFixed(4) || '0.0000'} SOL • {starFragmentBalance} ✨
                </Text>
            }
            showStatsBar={true}
            statsBarContent={
                <>
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
                </>
            }
            onLeftButtonPress={onClose}
            onCenterButtonPress={() => onNotification?.('💰 Shop Help: Purchase items, currency, and powerups for your moonlings!', 'info')}
            onRightButtonPress={() => onNotification?.('🏪 Marketplace: Browse and purchase cosmic items!', 'info')}
            leftButtonText="←"
            centerButtonText="💰"
            rightButtonText="?"
        >
            <View style={[styles.mainDisplayArea, styles.shopDisplay]}>
                <View style={styles.tabNavigation}>
                    {[
                        { id: 'currency', label: '✨ Currency' },
                        { id: 'all', label: '📦 All' },
                        { id: ItemCategory.FOOD, label: '🍎 Food' },
                        { id: ItemCategory.POWERUPS, label: '⚡ Powerups' },
                        { id: ItemCategory.COSMETICS, label: '✨ Cosmetics' },
                        { id: ItemCategory.RARE_COLLECTIBLES, label: '💎 Collectibles' },
                    ].map(tab => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[
                                styles.tabButton,
                                selectedCategory === tab.id && styles.activeTab
                            ]}
                            onPress={() => setSelectedCategory(tab.id as any)}
                        >
                            <Text style={styles.tabButtonText}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
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
                        filteredItems.map((item) => (
                            <View key={item.id} style={styles.shopItemCard}>
                                <Text style={styles.shopItemIcon}>{getCategoryEmoji(item.category)}</Text>
                                <Text style={styles.shopItemName}>{item.name}</Text>
                                <Text style={styles.shopItemPrice}>{item.price.toFixed(4)} SOL</Text>
                                <Text style={[styles.shopItemRarity, { color: getRarityColor(item.rarity) }]}>
                                    {item.rarity}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handlePurchase(item)}
                                    disabled={isLoading}
                                    style={[styles.shopBuyBtn, isLoading && { opacity: 0.6 }]}
                                >
                                    <Text>{isLoading ? '⏳' : '💰'}</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>
            </View>
        </InnerScreen>
    );
};

const styles = StyleSheet.create({
    walletStatusText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statStars: {
        fontSize: 14,
        color: '#ffd700',
    },
    mainDisplayArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    shopDisplay: {
        padding: 10,
    },
    shopItemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: 10,
    },
    shopItemCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 120,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    shopItemIcon: {
        fontSize: 24,
        marginBottom: 5,
    },
    shopItemName: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    shopItemPrice: {
        fontSize: 10,
        color: '#666',
        marginBottom: 2,
    },
    shopItemRarity: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    shopBuyBtn: {
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
        padding: 8,
        borderRadius: 15,
        minWidth: 40,
        alignItems: 'center',
    },
    tabNavigation: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 10,
        padding: 6,
        marginBottom: 12,
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 4,
    },

    tabButton: {
        flexGrow: 1,
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 8,
        margin: 2,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },

    activeTab: {
        backgroundColor: '#FCE38A',
        borderColor: '#000',
    },

    tabButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'PressStart2P-Regular',
    },
    tabNavigation: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 10,
        padding: 6,
        marginBottom: 12,
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 4,
    },

    tabButton: {
        flexGrow: 1,
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 8,
        margin: 2,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },

    activeTab: {
        backgroundColor: '#FCE38A',
        borderColor: '#000',
    },
    
    tabButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'PressStart2P-Regular',
    }
 });

export default Shop;