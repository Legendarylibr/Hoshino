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

interface InventoryProps {
    connection: Connection;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onClose: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ connection, onNotification, onClose }) => {
    const wallet = useWallet();
    const [selectedCategory, setSelectedCategory] = useState<ItemCategory>(ItemCategory.FOOD);
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

    const ownedItems = useMemo(() => {
        if (!marketplaceService || !userInventory || !userInventory.items) return [];
        const allItems = marketplaceService.getAllItems();
        return allItems
            .filter(item => (userInventory.items[item.id] || 0) > 0)
            .map(item => ({
                ...item,
                quantity: userInventory.items[item.id]
            }));
    }, [marketplaceService, userInventory]);

    const filteredItems = useMemo(() => {
        return ownedItems.filter(item => item.category === selectedCategory);
    }, [ownedItems, selectedCategory]);

    const handleUseItem = async (itemId: string) => {
        if (!marketplaceService || !wallet.publicKey) {
            onNotification?.('❌ Marketplace not initialized', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const result = await marketplaceService.useItem(itemId);

            if (result.success) {
                onNotification?.(`✨ Used ${result.itemName}! ${result.effect}`, 'success');

                const publicKeyObj = new PublicKey(wallet.publicKey);
                const inventory = await marketplaceService.getUserInventory(publicKeyObj);
                setUserInventory(inventory);
            } else {
                onNotification?.(`❌ Failed to use item: ${result.error}`, 'error');
            }
        } catch (error) {
            onNotification?.(`❌ Use item error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
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
                    <Text style={styles.walletStatusText}>Cosmic Inventory - [wallet disconnected]</Text>
                }
                showStatsBar={false}
                onLeftButtonPress={onClose}
                onCenterButtonPress={() => onNotification?.('🎒 Inventory Help: View and manage your cosmic items!', 'info')}
                onRightButtonPress={() => onNotification?.('🎒 Inventory: Connect wallet to access your items!', 'info')}
                leftButtonText="←"
                centerButtonText="🎒"
                rightButtonText="?"
            >
                <View style={[styles.mainDisplayArea, styles.shopWelcome]}>
                    <View style={styles.shopWelcomeContent}>
                        <Text style={styles.shopWelcomeTitle}>💫 Cosmic Inventory</Text>
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
                        <Text style={styles.statStars}>{filteredItems.length}</Text>
                    </View>
                </>
            }
            onLeftButtonPress={onClose}
            onCenterButtonPress={() => onNotification?.('🎒 Inventory Help: View and manage your cosmic items!', 'info')}
            onRightButtonPress={() => onNotification?.('🎒 Inventory: Browse your collected cosmic items!', 'info')}
            leftButtonText="←"
            centerButtonText="🎒"
            rightButtonText="?"
        >
            <View style={[styles.mainDisplayArea, styles.shopDisplay]}>
                <View style={styles.shopQuickCategories}>
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
                        <Text style={styles.categoryButtonText}>⚡ Powerups</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.categoryButton, selectedCategory === ItemCategory.COSMETICS ? styles.categoryButtonActive : null]}
                        onPress={() => setSelectedCategory(ItemCategory.COSMETICS)}
                    >
                        <Text style={styles.categoryButtonText}>✨ Cosmetics</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.categoryButton, selectedCategory === ItemCategory.RARE_COLLECTIBLES ? styles.categoryButtonActive : null]}
                        onPress={() => setSelectedCategory(ItemCategory.RARE_COLLECTIBLES)}
                    >
                        <Text style={styles.categoryButtonText}>💎 Collectibles</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.shopItemsGrid}>
                    {filteredItems.length === 0 ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <View key={`empty-${index}`} style={styles.shopItemCard}>
                                <Text style={styles.shopItemIcon}>❓</Text>
                                <Text style={styles.shopItemName}>Empty Slot</Text>
                            </View>
                        ))
                    ) : (
                        filteredItems.map((item) => (
                            <View key={item.id} style={styles.shopItemCard}>
                                <Text style={styles.shopItemIcon}>{getCategoryEmoji(item.category)}</Text>
                                <Text style={styles.shopItemName}>{item.name} x{item.quantity}</Text>
                                <Text style={[styles.shopItemRarity, { color: getRarityColor(item.rarity) }]}>
                                    {item.rarity}
                                </Text>
                                {item.category !== ItemCategory.RARE_COLLECTIBLES && (
                                    <TouchableOpacity
                                        onPress={() => handleUseItem(item.id)}
                                        disabled={isLoading}
                                        style={[styles.shopBuyBtn, isLoading && { opacity: 0.6 }]}
                                    >
                                        <Text>{isLoading ? '⏳' : '✨ Use'}</Text>
                                    </TouchableOpacity>
                                )}
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
    shopQuickCategories: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
        flexWrap: 'wrap',
    },
    categoryButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 15,
        marginHorizontal: 2,
        minWidth: 60,
        alignItems: 'center',
    },
    categoryButtonActive: {
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
    },
    categoryButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
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
});

export default Inventory;