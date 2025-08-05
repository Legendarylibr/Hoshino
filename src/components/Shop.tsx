import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import MarketplaceService, { MarketplaceItem } from '../services/MarketplaceService';
import { GlobalPointSystem } from '../services/GlobalPointSystem';
import { useWallet } from '../contexts/WalletContext';
import { Connection } from '@solana/web3.js';

interface ShopProps {
    connection: Connection;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ connection, onNotification, onClose }) => {
    const wallet = useWallet();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [marketplaceService, setMarketplaceService] = useState<MarketplaceService | null>(null);
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [dust, setDust] = useState<number>(100);

    useEffect(() => {
        if (wallet.connected && connection) {
            const service = new MarketplaceService(connection, wallet as any);
            setMarketplaceService(service);
            setItems([
                {
                    id: 'sugar',
                    name: 'Pink Sugar',
                    category: 'food',
                    price: 15,
                    image: require('../../../assets/images/pink-sugar.png'),
                },
                {
                    id: 'nova',
                    name: 'Nova Egg',
                    category: 'food',
                    price: 25,
                    image: require('../../../assets/images/nova-egg.png'),
                },
                {
                    id: 'mira',
                    name: 'Mira Berry',
                    category: 'food',
                    price: 20,
                    image: require('../../../assets/images/mira-berry.png'),
                },
                {
                    id: 'cloud',
                    name: 'Cloud Cake',
                    category: 'food',
                    price: 30,
                    image: require('../../../assets/images/cloud-cake.png'),
                },
            ]);
        }
    }, [wallet, connection]);

    const filteredItems = useMemo(() => {
        if (!items.length) return [];
        if (selectedCategory === 'all') return items;
        if (selectedCategory === 'currency') return [];
        return items.filter(item => item.category === selectedCategory);
    }, [items, selectedCategory]);

    return (
        <View style={styles.outerContainer}>
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>COSMIC SHOP</Text>
            </View>

            <View style={styles.balanceRow}>
                <Image
                    source={{ uri: 'https://drive.google.com/uc?export=view&id=1bxf-gZ9VjrwtKr5K8A5A7pbHFyQGXACU' }}
                    style={styles.dustIcon}
                    resizeMode="contain"
                />
                <Text style={styles.dustAmount}>{dust} Cosmic Dust</Text>
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
                                        source={item.image}
                                        style={{ width: 48, height: 48, marginBottom: 4 }}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemPrice}>{item.price} Cosmic Dust</Text>
                                    <TouchableOpacity style={styles.buyButton}>
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
        borderWidth: 3,
        margin: 4,
    },
    headerBox: {
        borderWidth: 3,
        borderColor: '#003300',
        padding: 4,
        marginBottom: 8,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 16,
        fontFamily: 'PixelOperatorBold',
        color: '#003300',
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    dustIcon: {
        width: 72,
        height: 72,
        marginRight: 8,
    },
    dustAmount: {
        fontSize: 18,
        fontFamily: 'PixelOperatorBold',
        color: '#003300',
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
        paddingVertical: 4,
        marginVertical: 2,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#b8e6b8',
    },
    tabButtonText: {
        fontFamily: 'PixelOperator',
        fontSize: 10,
    },
    itemsContainer: {
        borderWidth: 3,
        borderColor: '#003300',
        backgroundColor: '#f6fff6',
        padding: 4,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        paddingBottom: 12,
    },
    itemCard: {
        width: '30%',
        height: 110,
        borderWidth: 2,
        borderColor: '#003300',
        backgroundColor: '#f0fff0',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        marginBottom: 8,
    },
    itemName: {
        fontFamily: 'PixelOperator',
        fontSize: 10,
        marginBottom: 1,
    },
    itemPrice: {
        fontFamily: 'PixelOperator',
        fontSize: 10,
        color: '#333',
        marginBottom: 2,
    },
    placeholderBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#aaa',
        backgroundColor: '#f6fff6',
    },
    placeholderText: {
        fontFamily: 'PixelOperatorBold',
        fontSize: 18,
        color: '#aaa',
    },
    buyButton: {
        borderWidth: 1,
        borderColor: '#003300',
        paddingVertical: 2,
        paddingHorizontal: 6,
        backgroundColor: '#dbf3db',
    },
    buyButtonText: {
        fontFamily: 'PixelOperatorBold',
        fontSize: 10,
    },
    bottomButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    footerButton: {
        borderWidth: 2,
        borderColor: '#003300',
        backgroundColor: '#ffffffaa',
        padding: 6,
        flex: 1,
        marginHorizontal: 2,
        alignItems: 'center',
    },
    footerButtonText: {
        fontFamily: 'PixelOperatorBold',
        fontSize: 10,
    },
});

export default Shop;
