import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import InnerScreen from './InnerScreen';

interface ShopProps {
    onBack: () => void;
    onPurchaseItem: (itemId: string, itemName: string) => void;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    walletAddress?: string;
}

interface ShopItem {
    id: string;
    name: string;
    description: string;
    image: string;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic';
    cost: number;
    owned: number;
}

interface Bundle {
    id: string;
    name: string;
    description: string;
    items: { id: string; quantity: number }[];
    result: { id: string; name: string; description: string };
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

const Shop: React.FC<ShopProps> = ({
    onBack,
    onPurchaseItem,
    onNotification,
    walletAddress
}) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [availableBundles, setAvailableBundles] = useState<Bundle[]>([]);
    const [currentTab, setCurrentTab] = useState<'items' | 'bundles'>('items');

    // Mock shop items data
    const shopItems: ShopItem[] = [
        { id: 'star-fragment', name: 'Star Fragment', description: 'Cosmic currency for purchases', image: 'star-fragment.png', rarity: 'Common', cost: 5, owned: 3 },
        { id: 'cosmic-apple', name: 'Cosmic Apple', description: 'A fruit that glows with stellar energy', image: 'cosmic-apple.png', rarity: 'Uncommon', cost: 10, owned: 2 },
        { id: 'nebula-cake', name: 'Nebula Cake', description: 'A cake made from cosmic essence', image: 'nebula-cake.png', rarity: 'Rare', cost: 15, owned: 1 },
        { id: 'stellar-elixir', name: 'Stellar Elixir', description: 'A potion that grants cosmic powers', image: 'stellar-elixir.png', rarity: 'Epic', cost: 25, owned: 1 },
        { id: 'moon-crystal', name: 'Moon Crystal', description: 'Crystallized moonlight energy', image: 'moon-crystal.png', rarity: 'Common', cost: 8, owned: 5 },
        { id: 'cosmic-honey', name: 'Cosmic Honey', description: 'Honey collected from space bees', image: 'cosmic-honey.png', rarity: 'Uncommon', cost: 12, owned: 2 },
    ];

    // Mock bundles data
    const bundles: Bundle[] = [
        {
            id: 'starter-bundle',
            name: 'Starter Bundle',
            description: 'A bundle perfect for new cosmic explorers',
            items: [
                { id: 'star-fragment', quantity: 2 },
                { id: 'moon-crystal', quantity: 1 }
            ],
            result: {
                id: 'starter-bundle',
                name: 'Starter Bundle',
                description: 'A bundle that gets you started on your cosmic journey'
            },
            difficulty: 'Easy'
        },
        {
            id: 'power-bundle',
            name: 'Power Bundle',
            description: 'A bundle that enhances your cosmic abilities',
            items: [
                { id: 'stellar-elixir', quantity: 1 },
                { id: 'cosmic-honey', quantity: 1 }
            ],
            result: {
                id: 'power-bundle',
                name: 'Power Bundle',
                description: 'A bundle that boosts your cosmic powers'
            },
            difficulty: 'Medium'
        },
        {
            id: 'cosmic-feast',
            name: 'Cosmic Feast',
            description: 'A luxurious bundle for cosmic connoisseurs',
            items: [
                { id: 'nebula-cake', quantity: 1 },
                { id: 'stellar-elixir', quantity: 1 },
                { id: 'cosmic-honey', quantity: 2 }
            ],
            result: {
                id: 'cosmic-feast',
                name: 'Cosmic Feast',
                description: 'An extravagant bundle that satisfies all cosmic needs'
            },
            difficulty: 'Hard'
        }
    ];

    useEffect(() => {
        // Calculate available bundles based on owned items
        const available = bundles.filter(bundle => {
            return bundle.items.every(item => {
                const ownedItem = shopItems.find(i => i.id === item.id);
                return ownedItem && ownedItem.owned >= item.quantity;
            });
        });
        setAvailableBundles(available);
    }, [shopItems]);

    const toggleItem = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const purchaseBundle = (bundle: Bundle) => {
        // Check if we have enough items
        const canPurchase = bundle.items.every(item => {
            const ownedItem = shopItems.find(i => i.id === item.id);
            return ownedItem && ownedItem.owned >= item.quantity;
        });

        if (!canPurchase) {
            onNotification?.('❌ Not enough items to purchase this bundle', 'error');
            return;
        }

        // Purchase the bundle
        onPurchaseItem(bundle.result.id, bundle.result.name);
        onNotification?.(`🛒 Successfully purchased ${bundle.result.name}!`, 'success');
    };

    const getRarityColor = (rarity: string): string => {
        switch (rarity) {
            case 'Common': return '#6b7280';
            case 'Uncommon': return '#10b981';
            case 'Rare': return '#3b82f6';
            case 'Epic': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    const getDifficultyColor = (difficulty: string): string => {
        switch (difficulty) {
            case 'Easy': return '#10b981';
            case 'Medium': return '#f59e0b';
            case 'Hard': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <InnerScreen
            onLeftButtonPress={onBack}
            onCenterButtonPress={() => onNotification?.('🛒 Shop Help: Select items and purchase bundles for your moonlings!', 'info')}
            onRightButtonPress={() => onNotification?.('💰 Shop Tips: Combine items to create special bundles that enhance your moonling\'s abilities!', 'info')}
            leftButtonText="←"
            centerButtonText="🛒"
            rightButtonText="?"
        >
            <ScrollView style={[styles.mainDisplayArea, styles.shopSelection]}>
                {/* Tab Navigation */}
                <View style={styles.tabNavigation}>
                    <TouchableOpacity
                        style={[styles.tabButton, currentTab === 'items' ? styles.activeTab : null]}
                        onPress={() => setCurrentTab('items')}
                    >
                        <Text style={styles.tabButtonText}>Items</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, currentTab === 'bundles' ? styles.activeTab : null]}
                        onPress={() => setCurrentTab('bundles')}
                    >
                        <Text style={styles.tabButtonText}>Bundles</Text>
                    </TouchableOpacity>
                </View>

                {currentTab === 'items' && (
                    <View style={styles.itemsSection}>
                        <Text style={styles.sectionTitle}>Available Items</Text>
                        <View style={styles.itemsGrid}>
                            {shopItems.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.itemCard,
                                        selectedItems.includes(item.id) && styles.selectedItem
                                    ]}
                                    onPress={() => toggleItem(item.id)}
                                >
                                    <Text style={styles.itemIcon}>💎</Text>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemDescription}>{item.description}</Text>
                                    <Text style={[styles.itemRarity, { color: getRarityColor(item.rarity) }]}>
                                        {item.rarity}
                                    </Text>
                                    <Text style={styles.itemOwned}>Owned: {item.owned}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {currentTab === 'bundles' && (
                    <View style={styles.bundlesSection}>
                        <Text style={styles.sectionTitle}>Available Bundles</Text>
                        <View style={styles.bundlesList}>
                            {availableBundles.map((bundle) => (
                                <TouchableOpacity
                                    key={bundle.id}
                                    style={styles.bundleCard}
                                    onPress={() => purchaseBundle(bundle)}
                                >
                                    <View style={styles.bundleHeader}>
                                        <Text style={styles.bundleName}>{bundle.name}</Text>
                                        <Text style={[styles.bundleDifficulty, { color: getDifficultyColor(bundle.difficulty) }]}>
                                            {bundle.difficulty}
                                        </Text>
                                    </View>
                                    <Text style={styles.bundleDescription}>{bundle.description}</Text>
                                    <View style={styles.bundleItems}>
                                        <Text style={styles.bundleItemsTitle}>Items:</Text>
                                        {bundle.items.map((item) => {
                                            const ownedItem = shopItems.find(i => i.id === item.id);
                                            return (
                                                <Text key={item.id} style={styles.bundleItem}>
                                                    • {item.quantity}x {ownedItem?.name || item.id}
                                                </Text>
                                            );
                                        })}
                                    </View>
                                    <Text style={styles.bundleResult}>Result: {bundle.result.name}</Text>
                                </TouchableOpacity>
                            ))}
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    shopSelection: {
        padding: 10,
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
        fontSize: 14,
        fontWeight: 'bold',
    },
    itemsSection: {
        flex: 1,
        width: '100%',
    },
    bundlesSection: {
        flex: 1,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: 10,
    },
    itemCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 120,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    selectedItem: {
        borderColor: 'rgba(0, 123, 255, 0.8)',
        borderWidth: 2,
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
    },
    itemIcon: {
        fontSize: 24,
        marginBottom: 5,
    },
    itemName: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    itemDescription: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
        marginBottom: 5,
    },
    itemRarity: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    itemOwned: {
        fontSize: 10,
        color: '#999',
    },
    bundlesList: {
        gap: 10,
    },
    bundleCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    bundleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    bundleName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    bundleDifficulty: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    bundleDescription: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
    },
    bundleItems: {
        marginBottom: 10,
    },
    bundleItemsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    bundleItem: {
        fontSize: 10,
        color: '#666',
        marginLeft: 10,
    },
    bundleResult: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#10b981',
    },
});

export default Shop;