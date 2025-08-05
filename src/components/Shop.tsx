import React, { useState, useEffect } from 'react';
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
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
    category: string;
    icon: string;
    starFragmentCost: number;
}

interface StarFragmentPack {
    id: string;
    name: string;
    description: string;
    solPrice: number;
    fragments: number;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
}

const Shop: React.FC<ShopProps> = ({
    onNotification,
    onClose,
    walletConnected = true,
    userBalance = 1.5
}) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [availableItems, setAvailableItems] = useState<ShopItem[]>([]);
    const [currentTab, setCurrentTab] = useState<'currency' | 'items'>('currency');
    const [starFragmentBalance, setStarFragmentBalance] = useState(125);
    const [solBalance, setSolBalance] = useState(userBalance);

    // Mock Star Fragment Packs (like ingredients)
    const starFragmentPacks: StarFragmentPack[] = [
        { id: 'sf-small', name: 'Small Pack', description: 'Perfect starter pack for cosmic beginners', solPrice: 0.1, fragments: 50, rarity: 'Common' },
        { id: 'sf-medium', name: 'Medium Pack', description: 'Great value for regular cosmic adventurers', solPrice: 0.25, fragments: 125, rarity: 'Uncommon' },
        { id: 'sf-large', name: 'Large Pack', description: 'Best value for serious cosmic collectors', solPrice: 0.5, fragments: 275, rarity: 'Rare' },
        { id: 'sf-mega', name: 'Mega Pack', description: 'For dedicated cosmic entrepreneurs', solPrice: 1.0, fragments: 600, rarity: 'Epic' },
        { id: 'sf-ultra', name: 'Ultra Pack', description: 'Maximum value for cosmic power users', solPrice: 2.0, fragments: 1300, rarity: 'Legendary' },
        { id: 'sf-cosmic', name: 'Cosmic Pack', description: 'The ultimate cosmic currency package', solPrice: 5.0, fragments: 3500, rarity: 'Mythic' },
    ];

    // Mock shop items data (like ingredients)
    const shopItems: ShopItem[] = [
        { id: 'cosmic-apple', name: 'Cosmic Apple', description: 'A juicy apple infused with stellar energy', price: 0.001, starFragmentCost: 15, category: 'Food', rarity: 'Common', icon: '🍎' },
        { id: 'nebula-berry', name: 'Nebula Berry', description: 'Sweet berries that sparkle like distant nebulae', price: 0.003, starFragmentCost: 25, category: 'Food', rarity: 'Uncommon', icon: '🫐' },
        { id: 'star-cake', name: 'Star Cake', description: 'A magnificent cake that glows with inner light', price: 0.008, starFragmentCost: 45, category: 'Food', rarity: 'Rare', icon: '🎂' },
        { id: 'galaxy-feast', name: 'Galaxy Feast', description: 'An extravagant meal fit for cosmic royalty', price: 0.02, starFragmentCost: 85, category: 'Food', rarity: 'Epic', icon: '🍽️' },
        { id: 'energy-crystal', name: 'Energy Crystal', description: 'Instantly restores pet energy', price: 0.005, starFragmentCost: 30, category: 'Powerup', rarity: 'Common', icon: '⚡' },
        { id: 'happiness-orb', name: 'Happy Orb', description: 'Boosts pet happiness significantly', price: 0.01, starFragmentCost: 55, category: 'Powerup', rarity: 'Uncommon', icon: '😊' },
    ];

    useEffect(() => {
        // Calculate available items based on user balance (like available recipes)
        const available = shopItems.filter(item => {
            return starFragmentBalance >= item.starFragmentCost;
        });
        setAvailableItems(available);
    }, [starFragmentBalance]);

    const toggleItem = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const purchaseStarFragmentPack = (pack: StarFragmentPack) => {
        // Check if we have enough SOL
        if (solBalance < pack.solPrice) {
            onNotification?.('❌ Not enough SOL to purchase this pack', 'error');
            return;
        }

        // Purchase the pack
        setSolBalance(prev => prev - pack.solPrice);
        setStarFragmentBalance(prev => prev + pack.fragments);
        onNotification?.(`✨ Successfully purchased ${pack.name}! Received ${pack.fragments} Star Fragments!`, 'success');
    };

    const purchaseItem = (item: ShopItem) => {
        // Check if we have enough Star Fragments
        if (starFragmentBalance < item.starFragmentCost) {
            onNotification?.('❌ Not enough Star Fragments to purchase this item', 'error');
            return;
        }

        // Purchase the item
        setStarFragmentBalance(prev => prev - item.starFragmentCost);
        onNotification?.(`🛒 Successfully purchased ${item.name}!`, 'success');
    };

    const getRarityColor = (rarity: string): string => {
        switch (rarity) {
            case 'Common': return '#6b7280';
            case 'Uncommon': return '#10b981';
            case 'Rare': return '#3b82f6';
            case 'Epic': return '#8b5cf6';
            case 'Legendary': return '#f59e0b';
            case 'Mythic': return '#ef4444';
            default: return '#6b7280';
        }
    };

    if (!walletConnected) {
        return (
            <InnerScreen
                onLeftButtonPress={onClose}
                onCenterButtonPress={() => onNotification?.('🏪 Marketplace Help: Connect wallet to purchase items and currency!', 'info')}
                onRightButtonPress={() => onNotification?.('💰 Shop Tips: Buy Star Fragments with SOL, then use fragments to purchase items!', 'info')}
                leftButtonText="←"
                centerButtonText="🏪"
                rightButtonText="?"
            >
                <ScrollView style={[styles.mainDisplayArea, styles.shopSelection]}>
                    <View style={styles.welcomeSection}>
                        <Text style={styles.sectionTitle}>Cosmic Marketplace</Text>
                        <Text style={styles.welcomeText}>Connect wallet to access the marketplace</Text>
                    </View>
                </ScrollView>
            </InnerScreen>
        );
    }

    return (
        <InnerScreen
            onLeftButtonPress={onClose}
            onCenterButtonPress={() => onNotification?.('🏪 Marketplace Help: Buy Star Fragments with SOL and use them to purchase cosmic items!', 'info')}
            onRightButtonPress={() => onNotification?.('💰 Shop Tips: Star Fragments are the main currency for purchasing items in the marketplace!', 'info')}
            leftButtonText="←"
            centerButtonText="🏪"
            rightButtonText="?"
        >
            <ScrollView style={[styles.mainDisplayArea, styles.shopSelection]}>
                {/* Tab Navigation - exactly like IngredientSelection */}
                <View style={styles.tabNavigation}>
                    <TouchableOpacity
                        style={[styles.tabButton, currentTab === 'currency' ? styles.activeTab : null]}
                        onPress={() => setCurrentTab('currency')}
                    >
                        <Text style={styles.tabButtonText}>Star Fragments</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, currentTab === 'items' ? styles.activeTab : null]}
                        onPress={() => setCurrentTab('items')}
                    >
                        <Text style={styles.tabButtonText}>Shop Items</Text>
                    </TouchableOpacity>
                </View>

                {currentTab === 'currency' && (
                    <View style={styles.currencySection}>
                        <Text style={styles.sectionTitle}>Star Fragment Packs</Text>
                        <Text style={styles.balanceText}>SOL Balance: {solBalance.toFixed(4)} • Star Fragments: {starFragmentBalance}</Text>
                        <View style={styles.packsGrid}>
                            {starFragmentPacks.map((pack) => (
                                <TouchableOpacity
                                    key={pack.id}
                                    style={[
                                        styles.packCard,
                                        solBalance >= pack.solPrice && styles.affordablePack
                                    ]}
                                    onPress={() => purchaseStarFragmentPack(pack)}
                                >
                                    <Text style={styles.packIcon}>✨</Text>
                                    <Text style={styles.packName}>{pack.name}</Text>
                                    <Text style={styles.packDescription}>{pack.description}</Text>
                                    <Text style={[styles.packRarity, { color: getRarityColor(pack.rarity) }]}>
                                        {pack.rarity}
                                    </Text>
                                    <Text style={styles.packPrice}>{pack.solPrice.toFixed(3)} SOL → {pack.fragments} ✨</Text>
                                    <Text style={styles.packAffordable}>
                                        {solBalance >= pack.solPrice ? '✅ Can Buy' : '❌ Need More SOL'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {currentTab === 'items' && (
                    <View style={styles.itemsSection}>
                        <Text style={styles.sectionTitle}>Available Shop Items</Text>
                        <Text style={styles.balanceText}>Star Fragments: {starFragmentBalance} • Affordable Items: {availableItems.length}</Text>
                        <View style={styles.itemsGrid}>
                            {shopItems.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.itemCard,
                                        selectedItems.includes(item.id) && styles.selectedItem,
                                        starFragmentBalance >= item.starFragmentCost && styles.affordableItem
                                    ]}
                                    onPress={() => {
                                        if (starFragmentBalance >= item.starFragmentCost) {
                                            purchaseItem(item);
                                        } else {
                                            toggleItem(item.id);
                                        }
                                    }}
                                >
                                    <Text style={styles.itemIcon}>{item.icon}</Text>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemDescription}>{item.description}</Text>
                                    <Text style={[styles.itemRarity, { color: getRarityColor(item.rarity) }]}>
                                        {item.rarity}
                                    </Text>
                                    <Text style={styles.itemCost}>Cost: {item.starFragmentCost} ✨</Text>
                                    <Text style={styles.itemAffordable}>
                                        {starFragmentBalance >= item.starFragmentCost ? '🛒 Buy Now' : '❌ Need More ✨'}
                                    </Text>
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
    currencySection: {
        flex: 1,
        width: '100%',
    },
    itemsSection: {
        flex: 1,
        width: '100%',
    },
    welcomeSection: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    welcomeText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    balanceText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
        fontWeight: 'bold',
    },
    packsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: 10,
    },
    packCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 120,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    affordablePack: {
        borderColor: 'rgba(0, 123, 255, 0.8)',
        borderWidth: 2,
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
    },
    packIcon: {
        fontSize: 24,
        marginBottom: 5,
    },
    packName: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    packDescription: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
        marginBottom: 5,
    },
    packRarity: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    packPrice: {
        fontSize: 10,
        color: '#2563eb',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    packAffordable: {
        fontSize: 9,
        color: '#666',
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
    affordableItem: {
        borderColor: 'rgba(34, 197, 94, 0.8)',
        borderWidth: 2,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
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
    itemCost: {
        fontSize: 10,
        color: '#8b5cf6',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    itemAffordable: {
        fontSize: 9,
        color: '#666',
    },
});

export default Shop;