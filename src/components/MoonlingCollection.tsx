import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface Character {
    id: string;
    name: string;
    description: string;
    image: string;
    element: string;
    baseStats: {
        mood: number;
        hunger: number;
        energy: number;
    };
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
    specialAbility: string;
    nftMint?: string | null;
}

interface InventoryItem {
    id: string;
    name: string;
    description: string;
    type: 'ingredient' | 'accessory' | 'special' | 'casing';
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
    quantity: number;
    icon: string;
}

interface Props {
    characters: Character[];
    selectedCharacter: Character | null;
    onSelectCharacter: (character: Character) => void;
    onExit: () => void;
    walletAddress?: string;
    connected?: boolean;
    onNotification?: (message: string, type: 'info' | 'error' | 'success' | 'warning') => void;
}

const MoonlingCollection: React.FC<Props> = ({
    characters,
    selectedCharacter,
    onSelectCharacter,
    onExit,
    onNotification
}) => {
    const [startIndex, setStartIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState<string>('Moonlings');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | Character | null>(null);

    // Sample inventory data with actual images
    const inventoryData: Record<string, InventoryItem[]> = {
        'Ingredients': [
            { id: 'star_dust', name: 'Star Dust', description: 'Magical dust from distant stars. Boosts mood when used in food.', type: 'ingredient', rarity: 'Common', quantity: 5, icon: '/glitter.png' },
            { id: 'moon_berries', name: 'Moon Berries', description: 'Sweet berries that glow in the dark. Increases energy significantly.', type: 'ingredient', rarity: 'Rare', quantity: 3, icon: '/apple_collour_.webp' },
            { id: 'cosmic_honey', name: 'Cosmic Honey', description: 'Golden honey infused with cosmic energy. Restores all stats.', type: 'ingredient', rarity: 'Epic', quantity: 1, icon: '/chunky_bubbly_2.webp' },
            { id: 'nebula_spice', name: 'Nebula Spice', description: 'Exotic spice that adds flavor and magic to any dish.', type: 'ingredient', rarity: 'Legendary', quantity: 1, icon: '/miau.webp' }
        ],
        'Accessories': [
            { id: 'star_crown', name: 'Star Crown', description: 'A beautiful crown that makes your moonling sparkle in the moonlight.', type: 'accessory', rarity: 'Rare', quantity: 1, icon: '/hoshino star.png' },
            { id: 'cosmic_scarf', name: 'Cosmic Scarf', description: 'A warm scarf woven from stardust threads.', type: 'accessory', rarity: 'Common', quantity: 2, icon: '/backpack_.webp' },
            { id: 'galaxy_collar', name: 'Galaxy Collar', description: 'A collar that shows swirling galaxies within.', type: 'accessory', rarity: 'Epic', quantity: 1, icon: '/io.webp' }
        ],
        'Special Items': [
            { id: 'moon_crystal', name: 'Moon Crystal', description: 'A rare crystal that can reset your moonling\'s evolution path.', type: 'special', rarity: 'Legendary', quantity: 1, icon: '/null-11.webp' },
            { id: 'star_fragment', name: 'Star Fragment', description: 'A piece of a fallen star. Can be used for special rituals.', type: 'special', rarity: 'Epic', quantity: 2, icon: '/games.webp' },
            { id: 'cosmic_potion', name: 'Cosmic Potion', description: 'A mysterious potion with unknown effects.', type: 'special', rarity: 'Rare', quantity: 1, icon: '/sleepzzzz.webp' }
        ],
        'Casing': [
            { id: 'galaxy_shell', name: 'Galaxy Shell', description: 'A beautiful shell that changes your device\'s appearance to show galaxies.', type: 'casing', rarity: 'Epic', quantity: 1, icon: '/shop.webp' },
            { id: 'star_frame', name: 'Star Frame', description: 'A golden frame decorated with tiny stars.', type: 'casing', rarity: 'Rare', quantity: 1, icon: '/gallery_.png' },
            { id: 'cosmic_border', name: 'Cosmic Border', description: 'A shimmering border that pulses with cosmic energy.', type: 'casing', rarity: 'Common', quantity: 3, icon: '/chat.webp' }
        ]
    };

    const displayedCharacters = characters.slice(startIndex, startIndex + 5);

    const handlePrevious = () => {
        if (startIndex > 0) {
            setStartIndex(Math.max(0, startIndex - 5));
        }
    };

    const handleNext = () => {
        if (startIndex + 5 < characters.length) {
            setStartIndex(startIndex + 5);
        }
    };

    return (
        <View style={styles.container}>
            {/* Top Status Bar */}
            <View style={styles.topStatus}>
                <Text style={styles.gearIcon}>📦</Text>
                <Text style={styles.walletStatusText}>Inventory</Text>
            </View>

            {/* Main LCD Screen */}
            <View style={styles.mainScreen}>
                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Items</Text>
                        <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Rarity</Text>
                        <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total</Text>
                        <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                    </View>
                </View>

                {/* Main Display Area */}
                <View style={styles.mainDisplayArea}>
                    <View style={styles.inventoryLcdScreen}>
                        {/* Category Tabs */}
                        <View style={styles.inventoryCategoryTabs}>
                            <View style={styles.categoryRow}>
                                <TouchableOpacity
                                                        style={[styles.inventoryTab, activeCategory === 'Moonlings' ? styles.active : null]}
                    onPress={() => setActiveCategory('Moonlings')}
                                >
                                    <Text style={styles.tabText}>Moonlings</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.inventoryTab, activeCategory === 'Ingredients' ? styles.active : null]}
                                    onPress={() => setActiveCategory('Ingredients')}
                                >
                                    <Text style={styles.tabText}>Ingredients</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.inventoryTab, activeCategory === 'Accessories' ? styles.active : null]}
                                    onPress={() => setActiveCategory('Accessories')}
                                >
                                    <Text style={styles.tabText}>Accessories</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.categoryRow}>
                                <TouchableOpacity
                                    style={[styles.inventoryTab, activeCategory === 'Special Items' ? styles.active : null]}
                                    onPress={() => setActiveCategory('Special Items')}
                                >
                                    <Text style={styles.tabText}>Special Items</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.inventoryTab, activeCategory === 'Casing' ? styles.active : null]}
                                    onPress={() => setActiveCategory('Casing')}
                                >
                                    <Text style={styles.tabText}>Casing</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Dynamic Content Area */}
                        <View style={styles.simpleInventoryContainer}>
                                                {activeCategory === 'Moonlings' ? (
                        // Moonlings Tab Content
                                <View style={styles.simpleInventoryGrid}>
                                    {displayedCharacters.map((character) => (
                                        <TouchableOpacity
                                            key={character.id}
                                            style={[styles.inventorySlot, selectedItem?.id === character.id ? styles.selected : null]}
                                            onPress={() => {
                                                setSelectedItem(character);
                                                onSelectCharacter(character);
                                            }}
                                        >
                                            <Image
                                                source={{ uri: character.image }}
                                                style={styles.slotImage}
                                            />
                                            {character.nftMint && <View style={styles.nftBadgeOverlay}><Text style={styles.badgeText}>NFT</Text></View>}
                                        </TouchableOpacity>
                                    ))}

                                    {/* Fill empty slots if needed */}
                                    {Array.from({ length: Math.max(0, 6 - displayedCharacters.length) }).map((_, index) => (
                                        <View key={`empty-${index}`} style={[styles.inventorySlot, styles.empty]}>
                                            <Text style={styles.emptySlotIcon}>+</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                // Other tabs content (Ingredients, Accessories, etc.)
                                <View style={styles.simpleInventoryGrid}>
                                    {(inventoryData[activeCategory] || []).slice(0, 6).map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[styles.inventorySlot, selectedItem?.id === item.id ? styles.selected : null]}
                                            onPress={() => {
                                                setSelectedItem(item);
                                                onNotification?.(`Selected: ${item.name}`, 'info');
                                            }}
                                        >
                                            <Image
                                                source={{ uri: item.icon }}
                                                style={styles.slotImage}
                                            />
                                            <View style={styles.itemQuantityBadge}><Text style={styles.badgeText}>x{item.quantity}</Text></View>
                                        </TouchableOpacity>
                                    ))}

                                    {/* Fill empty slots */}
                                    {Array.from({
                                        length: Math.max(0, 6 - (inventoryData[activeCategory]?.length || 0))
                                    }).map((_, index) => (
                                        <View key={`empty-${index}`} style={[styles.inventorySlot, styles.empty]}>
                                            <Text style={styles.emptySlotIcon}>+</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Item/Character Description */}
                            {selectedItem && (
                                <View style={styles.selectedItemDescription}>
                                    <View style={styles.descriptionHeader}>
                                        <Text style={styles.itemTitle}>
                                            {'element' in selectedItem ? selectedItem.name : selectedItem.name}
                                        </Text>
                                        {'rarity' in selectedItem && (
                                            <Text style={[styles.rarityBadge, styles[`rarity${selectedItem.rarity.toLowerCase()}`]]}>
                                                {selectedItem.rarity}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.descriptionContent}>
                                        {'element' in selectedItem ? (
                                            // Character description
                                            <>
                                                <Text style={styles.descriptionText}>Element: {selectedItem.element}</Text>
                                                <View style={styles.characterStats}>
                                                    <Text style={styles.descriptionText}>Mood: {"★".repeat(selectedItem.baseStats.mood)}{"☆".repeat(5 - selectedItem.baseStats.mood)}</Text>
                                                    <Text style={styles.descriptionText}>Hunger: {"★".repeat(selectedItem.baseStats.hunger)}{"☆".repeat(5 - selectedItem.baseStats.hunger)}</Text>
                                                    <Text style={styles.descriptionText}>Energy: {"★".repeat(selectedItem.baseStats.energy)}{"☆".repeat(5 - selectedItem.baseStats.energy)}</Text>
                                                </View>
                                            </>
                                        ) : (
                                            // Item description
                                            <>
                                                <Text style={styles.itemDescText}>{selectedItem.description}</Text>
                                                <Text style={styles.itemQuantityLarge}>Quantity: {selectedItem.quantity}</Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Navigation Buttons */}
            <TouchableOpacity style={[styles.bottomButton, styles.left]} onPress={onExit}>
                <Text style={styles.buttonText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.bottomButton, styles.center]}
                onPress={() => onNotification?.('📦 Inventory: Browse your collection!', 'info')}
            >
                <Text style={styles.buttonText}>📦</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.bottomButton, styles.right]}
                onPress={() => onNotification?.('📦 Inventory Help: Browse your collection and view character details!', 'info')}
            >
                <Text style={styles.buttonText}>?</Text>
            </TouchableOpacity>

            {/* Physical Device Buttons - overlaid on background image */}
            <TouchableOpacity
                style={[styles.deviceButton, styles.leftPhysical]}
                onPress={onExit}
            />
            <TouchableOpacity
                style={[styles.deviceButton, styles.centerPhysical]}
                onPress={() => onNotification?.('📦 Inventory: View your character collection!', 'info')}
            />
            <TouchableOpacity
                style={[styles.deviceButton, styles.rightPhysical]}
                onPress={() => onNotification?.('📦 Inventory Help: Browse your collection and view character details!', 'info')}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
    },
    topStatus: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    gearIcon: {
        fontSize: 24,
        color: '#fff',
    },
    walletStatusText: {
        fontSize: 18,
        color: '#fff',
        marginLeft: 10,
    },
    mainScreen: {
        flex: 1,
        backgroundColor: '#111',
        borderRadius: 10,
        padding: 10,
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        color: '#fff',
        fontSize: 14,
    },
    starRating: {
        color: 'gold',
        fontSize: 14,
    },
    mainDisplayArea: {
        flex: 1,
        height: '100%',
    },
    inventoryLcdScreen: {
        flex: 1,
    },
    inventoryCategoryTabs: {
        marginBottom: 10,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 5,
    },
    inventoryTab: {
        padding: 10,
        backgroundColor: '#222',
        borderRadius: 5,
    },
    active: {
        backgroundColor: '#444',
    },
    tabText: {
        color: '#fff',
        fontSize: 14,
    },
    simpleInventoryContainer: {
        flex: 1,
    },
    simpleInventoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    inventorySlot: {
        width: 80,
        height: 80,
        backgroundColor: '#333',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
        position: 'relative',
    },
    selected: {
        borderColor: 'gold',
        borderWidth: 2,
    },
    empty: {
        backgroundColor: '#222',
    },
    slotImage: {
        width: 60,
        height: 60,
    },
    nftBadgeOverlay: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'blue',
        padding: 2,
        borderRadius: 3,
    },
    itemQuantityBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'green',
        padding: 2,
        borderRadius: 3,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
    },
    emptySlotIcon: {
        fontSize: 30,
        color: '#555',
    },
    selectedItemDescription: {
        marginTop: 10,
        backgroundColor: '#222',
        padding: 10,
        borderRadius: 5,
    },
    descriptionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    itemTitle: {
        color: '#fff',
        fontSize: 16,
    },
    rarityBadge: {
        padding: 5,
        borderRadius: 3,
        color: '#fff',
        fontSize: 12,
    },
    raritycommon: {
        backgroundColor: 'gray',
    },
    rarityrare: {
        backgroundColor: 'blue',
    },
    rarityepic: {
        backgroundColor: 'purple',
    },
    raritylegendary: {
        backgroundColor: 'orange',
    },
    descriptionContent: {},
    descriptionText: {
        color: '#ddd',
        fontSize: 14,
    },
    characterStats: {
        marginTop: 5,
    },
    itemDescText: {
        color: '#ddd',
        fontSize: 14,
    },
    itemQuantityLarge: {
        color: '#fff',
        fontSize: 14,
        marginTop: 5,
    },
    bottomButton: {
        padding: 10,
        backgroundColor: '#333',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 20,
        width: 50,
        height: 50,
    },
    left: {
        left: 20,
    },
    center: {
        left: '50%',
        transform: [{ translateX: -25 }],
    },
    right: {
        right: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
    },
    deviceButton: {
        position: 'absolute',
        bottom: 0,
        width: 60,
        height: 60,
        backgroundColor: 'transparent',
    },
    leftPhysical: {
        left: 0,
    },
    centerPhysical: {
        left: '50%',
        transform: [{ translateX: -30 }],
    },
    rightPhysical: {
        right: 0,
    },
});

export default MoonlingCollection;