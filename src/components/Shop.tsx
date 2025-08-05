import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import MarketplaceService, {
    MarketplaceItem,
    ItemCategory
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
    const [marketplaceService, setMarketplaceService] = useState<MarketplaceService | null>(null);
    const [items, setItems] = useState<MarketplaceItem[]>([]);

    useEffect(() => {
        if (wallet.connected && connection) {
            const service = new MarketplaceService(connection, wallet as any);
            setMarketplaceService(service);
            setItems(service.getAllItems());
        }
    }, [wallet, connection]);

    const filteredItems = useMemo(() => {
        if (!items.length) return [];
        if (selectedCategory === 'all') return items;
        if (selectedCategory === 'currency') return [];
        return items.filter(item => item.category === selectedCategory);
    }, [items, selectedCategory]);

    return (
        <InnerScreen
            topStatusContent={
                <View style={styles.headerBox}>
                    <Text style={styles.headerText}>COSMIC SHOP</Text>
                </View>
            }
            onLeftButtonPress={onClose}
            onCenterButtonPress={() => onNotification?.('💰 Shop Help', 'info')}
            onRightButtonPress={() => onNotification?.('ℹ️ Info', 'info')}
            leftButtonText="←"
            centerButtonText="💰"
            rightButtonText="?"
        >
            <View style={styles.mainDisplayArea}>
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
                            style={[styles.tabButton, selectedCategory === tab.id && styles.activeTab]}
                            onPress={() => setSelectedCategory(tab.id as any)}
                        >
                            <Text style={styles.tabButtonText}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <ScrollView contentContainerStyle={styles.itemsGrid}>
                    {filteredItems.map(item => (
                        <View key={item.id} style={styles.itemCard}>
                            <Text style={styles.itemIcon}>🎁</Text>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>{item.price.toFixed(2)} SOL</Text>
                            <TouchableOpacity style={styles.buyButton}>
                                <Text style={styles.buyButtonText}>BUY</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </InnerScreen>
    );
};

const styles = StyleSheet.create({
    headerBox: {
        backgroundColor: '#EAF6EE',
        borderWidth: 2,
        borderColor: '#203c2f',
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    headerText: {
        fontFamily: 'PressStart2P-Regular',
        fontSize: 12,
        textAlign: 'center',
        color: '#000',
    },
    mainDisplayArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EAF6EE',
        borderWidth: 2,
        borderColor: '#203c2f',
        margin: 10,
        padding: 10,
    },
    shopDisplay: {
        padding: 10,
    },
    tabNavigation: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 12,
        gap: 4,
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#CFEAD1',
        borderRadius: 0,
        borderWidth: 2,
        borderColor: '#203c2f',
        margin: 4,
        alignItems: 'center',
        minWidth: 90,
    },
    activeTab: {
        backgroundColor: '#A6D9AC',
    },
    tabButtonText: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'PressStart2P-Regular',
        textTransform: 'uppercase',
    },
    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingBottom: 100,
    },
    itemCard: {
        backgroundColor: '#EAF6EE',
        borderWidth: 2,
        borderColor: '#000',
        width: 100,
        height: 130,
        margin: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingVertical: 6,
    },
    itemIcon: {
        fontSize: 20,
    },
    itemName: {
        fontSize: 10,
        textAlign: 'center',
        fontFamily: 'PressStart2P-Regular',
    },
    itemPrice: {
        fontSize: 10,
        color: '#333',
    },
    buyButton: {
        marginTop: 4,
        paddingVertical: 2,
        paddingHorizontal: 6,
        backgroundColor: '#FCE38A',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#000',
    },
    buyButtonText: {
        fontSize: 8,
        fontFamily: 'PressStart2P-Regular',
        color: '#000',
    },
});

export default Shop;
