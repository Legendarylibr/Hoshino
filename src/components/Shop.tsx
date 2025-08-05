import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import MarketplaceService, { MarketplaceItem, ItemCategory, ItemRarity } from '../services/MarketplaceService';
import { GlobalPointSystem } from '../services/GlobalPointSystem';
import { useWallet } from '../contexts/WalletContext';
import { Connection } from '@solana/web3.js';
import PinkSugar from '../../assets/images/pink-sugar.png';
import NovaEgg from '../../assets/images/nova-egg.png';
import MiraBerry from '../../assets/images/mira-berry.png';
import CloudCake from '../../assets/images/cloud-cake.png';

interface ShopProps {
    connection: Connection;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ connection, onNotification, onClose }) => {
    // Remove wallet dependency entirely for catalog view
    const [selectedCategory, setSelectedCategory] = useState<string>('food');
    // Remove marketplaceService state since we don't need it for catalog
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [dust, setDust] = useState<number>(100);

    // RuneScape-style helper functions
    const getRarityColor = (rarity: ItemRarity): string => {
        switch (rarity) {
            case ItemRarity.COMMON: return '#666666'; // Gray
            case ItemRarity.UNCOMMON: return '#228B22'; // Green
            case ItemRarity.RARE: return '#4169E1'; // Blue
            case ItemRarity.EPIC: return '#8A2BE2'; // Purple
            case ItemRarity.LEGENDARY: return '#FFD700'; // Gold
            default: return '#666666';
        }
    };

    const getItemPower = (rarity: ItemRarity): number => {
        switch (rarity) {
            case ItemRarity.COMMON: return Math.floor(Math.random() * 10) + 1; // 1-10
            case ItemRarity.UNCOMMON: return Math.floor(Math.random() * 15) + 8; // 8-22
            case ItemRarity.RARE: return Math.floor(Math.random() * 20) + 15; // 15-34
            case ItemRarity.EPIC: return Math.floor(Math.random() * 25) + 25; // 25-49
            case ItemRarity.LEGENDARY: return Math.floor(Math.random() * 30) + 40; // 40-69
            default: return 1;
        }
    };

    const getItemDurability = (rarity: ItemRarity): number => {
        switch (rarity) {
            case ItemRarity.COMMON: return Math.floor(Math.random() * 20) + 10; // 10-29
            case ItemRarity.UNCOMMON: return Math.floor(Math.random() * 25) + 20; // 20-44
            case ItemRarity.RARE: return Math.floor(Math.random() * 30) + 30; // 30-59
            case ItemRarity.EPIC: return Math.floor(Math.random() * 35) + 40; // 40-74
            case ItemRarity.LEGENDARY: return Math.floor(Math.random() * 40) + 60; // 60-99
            default: return 10;
        }
    };

    useEffect(() => {
        // No wallet or connection needed - just show the shop catalog
        const itemsData = [
            // Food items
            {
                id: 'sugar',
                name: 'Pink Sugar',
                description: 'Sweet crystalline sugar with a pink hue',
                imageUrl: 'https://via.placeholder.com/48/FFB6C1/000000?text=🍯',
                category: ItemCategory.FOOD,
                rarity: ItemRarity.COMMON,
                priceSOL: 0,
                priceStarFragments: 15,
                inStock: true,
            },
            {
                id: 'nova',
                name: 'Nova Egg',
                description: 'A mysterious egg that glows with stellar energy',
                imageUrl: 'https://via.placeholder.com/48/FFD700/000000?text=🥚',
                category: ItemCategory.FOOD,
                rarity: ItemRarity.UNCOMMON,
                priceSOL: 0,
                priceStarFragments: 25,
                inStock: true,
            },
            {
                id: 'mira',
                name: 'Mira Berry',
                description: 'A rare berry with cosmic properties',
                imageUrl: 'https://via.placeholder.com/48/9370DB/000000?text=🫐',
                category: ItemCategory.FOOD,
                rarity: ItemRarity.RARE,
                priceSOL: 0,
                priceStarFragments: 20,
                inStock: true,
            },
            {
                id: 'cloud',
                name: 'Cloud Cake',
                description: 'A fluffy cake that floats like a cloud',
                imageUrl: 'https://via.placeholder.com/48/87CEEB/000000?text=🍰',
                category: ItemCategory.FOOD,
                rarity: ItemRarity.EPIC,
                priceSOL: 0,
                priceStarFragments: 30,
                inStock: true,
            },
            // Powerup items
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
                description: 'Provides cosmic protection',
                imageUrl: 'https://via.placeholder.com/48/4169E1/000000?text=🛡️',
                category: ItemCategory.POWERUP,
                rarity: ItemRarity.RARE,
                priceSOL: 0,
                priceStarFragments: 45,
                inStock: true,
            },
        ];

        console.log('Loading shop catalog (no wallet needed)');
        setItems(itemsData);
        // Don't initialize MarketplaceService at all for catalog view
    }, []); // Empty dependency array - just load once

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

    return (
        <View style={styles.outerContainer}>
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>COSMIC SHOP</Text>
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
                    <Text style={styles.dustAmount}>{dust} Cosmic Dust</Text>
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
                {Array.from({ length: 6 }).map((_, index) => {
                    const item = filteredItems[index];
                    return (
                        <View key={index} style={styles.itemCard}>
                            {item ? (
                                <>
                                    <Image
                                        source={{ uri: item.imageUrl }}
                                        style={{ width: 40, height: 40, marginBottom: 2 }}
                                        resizeMode="contain"
                                        onError={(error) => console.log('Image failed to load:', item.name, error)}
                                        onLoad={() => console.log('Image loaded successfully:', item.name)}
                                    />
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <View style={styles.itemStatsContainer}>
                                        <View style={styles.rarityContainer}>
                                            <Text style={[styles.rarityText, { color: getRarityColor(item.rarity) }]}>
                                                {item.rarity.toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={styles.statRow}>
                                            <Text style={styles.statLabel}>PWR:</Text>
                                            <Text style={styles.statValue}>{getItemPower(item.rarity)}</Text>
                                        </View>
                                        <View style={styles.statRow}>
                                            <Text style={styles.statLabel}>DUR:</Text>
                                            <Text style={styles.statValue}>{getItemDurability(item.rarity)}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.itemPrice}>{item.priceStarFragments} 💫</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.buyButton}
                                        onPress={() => onNotification?.(`Added ${item.name} to cart! (Demo mode - no actual purchase)`, 'info')}
                                    >
                                        <Text style={styles.buyButtonText}>BUY</Text>
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
        borderWidth: 3, // Reduced from 4px
        margin: 4,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        // Add inner border effect for Game Boy flourish
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
        borderWidth: 3, // Reduced thickness
        borderColor: '#003300',
        padding: 6,
        marginBottom: 8,
        alignItems: 'center',
        backgroundColor: '#f0fff0',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        // Game Boy beveled effect
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
        borderWidth: 2, // Reduced thickness
        borderColor: '#003300',
        borderRadius: 0,
        padding: 10,
        // Game Boy beveled wallet effect
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
        borderWidth: 2, // Reduced thickness
        paddingVertical: 8,
        marginVertical: 2,
        alignItems: 'center',
        borderRadius: 0,
        // Game Boy button beveled effect
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
        // Pressed button effect with inverted colors
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
        borderWidth: 3, // Keep thicker for main container
        borderColor: '#003300',
        backgroundColor: '#f6fff6',
        padding: 6,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        paddingBottom: 12,
        borderRadius: 0,
        // Game Boy container beveled effect
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
        height: 140, // Increased height for stats
        borderWidth: 2,
        borderColor: '#003300',
        backgroundColor: '#f0fff0',
        alignItems: 'center',
        justifyContent: 'flex-start', // Changed to flex-start for better layout
        padding: 4,
        marginBottom: 8,
        borderRadius: 0,
        // Game Boy card beveled effect
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
    itemName: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
        textAlign: 'center',
        color: '#003300',
    },
    itemStatsContainer: {
        width: '100%',
        marginBottom: 2,
    },
    rarityContainer: {
        backgroundColor: 'rgba(0, 51, 0, 0.1)',
        borderWidth: 1,
        borderColor: '#003300',
        borderRadius: 0,
        paddingHorizontal: 2,
        paddingVertical: 1,
        marginBottom: 2,
        alignItems: 'center',
    },
    rarityText: {
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 2,
        marginBottom: 1,
    },
    statLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#003300',
    },
    statValue: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#006600',
    },
    priceContainer: {
        backgroundColor: 'rgba(0, 51, 0, 0.1)',
        borderWidth: 1,
        borderColor: '#003300',
        borderRadius: 0,
        paddingHorizontal: 3,
        paddingVertical: 1,
        marginBottom: 3,
    },
    itemPrice: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#003300',
        textAlign: 'center',
    },
    placeholderBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2, // Reduced thickness
        borderColor: '#999',
        backgroundColor: 'transparent',
        borderStyle: 'dashed',
        borderRadius: 0,
        margin: 2,
        // Add subtle beveled effect to dashed borders
        opacity: 0.7,
    },
    placeholderText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#bbb',
        opacity: 0.6,
    },
    buyButton: {
        borderWidth: 1,
        borderColor: '#003300',
        paddingVertical: 2,
        paddingHorizontal: 6,
        backgroundColor: '#dbf3db',
        borderRadius: 0,
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
    },
    buyButtonText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#003300',
    },
    bottomButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    footerButton: {
        borderWidth: 3, // Thick Game Boy button borders
        borderColor: '#003300',
        backgroundColor: '#ffffffaa',
        padding: 10,
        flex: 1,
        marginHorizontal: 2,
        alignItems: 'center',
        // Game Boy style - no rounded corners
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
});

export default Shop;