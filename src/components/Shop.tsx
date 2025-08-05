import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import InnerScreen from './InnerScreen';

const { width } = Dimensions.get('window');

interface ShopItem {
    id: string;
    name: string;
    image?: string;
    price: number;
    owned?: number;
    category: 'food' | 'powerups' | 'cosmetics' | 'collectibles';
}

interface ShopProps {
    onBack: () => void;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    walletAddress?: string;
}

const categories = [
    { id: 'food', label: '🍎 Food' },
    { id: 'powerups', label: '⚡ Powerups' },
    { id: 'cosmetics', label: '✨ Cosmetics' },
    { id: 'collectibles', label: '💎 Collectibles' },
];

const mockShopItems: ShopItem[] = [
    { id: 'apple', name: 'Apple', price: 5, category: 'food' },
    { id: 'banana', name: 'Banana', price: 7, category: 'food' },
    { id: 'speed-boost', name: 'Speed Boost', price: 20, category: 'powerups' },
    { id: 'sparkle-hat', name: 'Sparkle Hat', price: 50, category: 'cosmetics' },
    { id: 'moon-rock', name: 'Moon Rock', price: 100, category: 'collectibles' },
];

const Shop: React.FC<ShopProps> = ({ onBack, onNotification, walletAddress }) => {
    const [selectedCategory, setSelectedCategory] = useState<'food' | 'powerups' | 'cosmetics' | 'collectibles'>('food');
    const [shopItems, setShopItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        // In real app, fetch items from API or state
        setShopItems(mockShopItems);
    }, []);

    const filteredItems = shopItems.filter(item => item.category === selectedCategory);

    const handlePurchase = (item: ShopItem) => {
        // Stub for purchase logic
        onNotification?.(`🛒 Purchased ${item.name} for ${item.price} coins!`, 'success');
    };

    return (
        <InnerScreen
            onLeftButtonPress={onBack}
            onCenterButtonPress={() => onNotification?.('🛍️ Shop Help: Browse and purchase items to upgrade your moonling!', 'info')}
            onRightButtonPress={() => onNotification?.('🛍️ Tip: Tap an item to view or buy. Categories help you navigate.', 'info')}
            leftButtonText="←"
            centerButtonText="💰"
            rightButtonText="?"
        >
            <ScrollView style={[styles.mainDisplayArea, styles.shopScreen]}>
                {/* Tabs */}
                <View style={styles.tabNavigation}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.tabButton, selectedCategory === cat.id ? styles.activeTab : null]}
                            onPress={() => setSelectedCategory(cat.id as any)}
                        >
                            <Text style={styles.tabButtonText}>{cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Grid */}
                <View style={styles.itemsGrid}>
                    {filteredItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.itemCard}
                            onPress={() => handlePurchase(item)}
                        >
                            <Text style={styles.itemIcon}>🎁</Text>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>💸 {item.price}</Text>
                        </TouchableOpacity>
                    ))}

                    {/* Empty slots to pad grid */}
                    {Array.from({ length: Math.max(0, 12 - filteredItems.length) }).map((_, i) => (
                        <View key={`empty-${i}`} style={styles.itemCard} />
                    ))}
                </View>
            </ScrollView>
        </InnerScreen>
    );
};

const styles = StyleSheet.create({
    mainDisplayArea: {
        flex: 1,
        justifyContent: 'center',
    },
    shopScreen: {
        padding: 10,
    },
    tabNavigation: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 10,
        padding: 5,
        marginBottom: 15,
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: '#fff',
        borderRadius: 8,
        margin: 4,
        borderWidth: 1,
        borderColor: '#aaa',
    },
    activeTab: {
        backgroundColor: '#FCE38A',
        borderColor: '#000',
    },
    tabButtonText: {
        fontSize: 12,
        fontFamily: 'PressStart2P-Regular',
        textAlign: 'center',
    },
    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: 10,
    },
    itemCard: {
        backgroundColor: '#EAF6EE',
        padding: 12,
        borderRadius: 10,
        width: width / 3 - 20,
        height: width / 3 - 20,
        marginVertical: 8,
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemIcon: {
        fontSize: 24,
        marginBottom: 6,
    },
    itemName: {
        fontSize: 10,
        fontFamily: 'PressStart2P-Regular',
        textAlign: 'center',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 10,
        color: '#444',
        fontFamily: 'PressStart2P-Regular',
    },
});

export default Shop;
