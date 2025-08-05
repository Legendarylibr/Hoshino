import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';

interface FoodItem {
    id: string;
    name: string;
    emoji: string;
    hungerBoost: number;
    moodBoost: number;
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
    description: string;
}

interface Props {
    onBack: () => void;
    onFeed: (foodType: string, hungerBoost: number, moodBoost: number) => void;
    currentHunger: number;
}

const FOOD_ITEMS: FoodItem[] = [
    {
        id: 'dream-bean',
        name: 'Dream Bean',
        emoji: '☁️',
        hungerBoost: 1,
        moodBoost: 0,
        rarity: 'Common',
        description: 'Magical bean that restores 1 hunger point'
    },
    {
        id: 'nebula-plum',
        name: 'Nebula Plum',
        emoji: '🌌',
        hungerBoost: 2,
        moodBoost: 0,
        rarity: 'Rare',
        description: 'Cosmic plum that restores 2 hunger points'
    },
    {
        id: 'cloud-cake',
        name: 'Cloud Cake',
        emoji: '☁️',
        hungerBoost: 3,
        moodBoost: 0,
        rarity: 'Epic',
        description: 'Fluffy cake that restores 3 hunger points'
    },
    {
        id: 'starberry',
        name: 'Starberry',
        emoji: '⭐',
        hungerBoost: 5,
        moodBoost: 0,
        rarity: 'Legendary',
        description: 'Legendary berry that completely fills hunger'
    }
];

const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'Common':
            return '#9CA3AF';
        case 'Rare':
            return '#3B82F6';
        case 'Epic':
            return '#8B5CF6';
        case 'Legendary':
            return '#F59E0B';
        default:
            return '#9CA3AF';
    }
};

const FeedingPage = ({ onBack, onFeed, currentHunger }: Props) => {
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [feedingAnimation, setFeedingAnimation] = useState(false);
    const bounceAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (feedingAnimation) {
            const animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(bounceAnim, {
                        toValue: -20,
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(bounceAnim, {
                        toValue: 0,
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );
            animation.start();
            return () => animation.stop();
        }
    }, [feedingAnimation]);

    const handleFeed = (food: FoodItem) => {
        if (currentHunger >= 5) {
            return;
        }

        setSelectedFood(food);
        setFeedingAnimation(true);

        setTimeout(() => {
            onFeed(food.name, food.hungerBoost, food.moodBoost);
            setFeedingAnimation(false);
            setSelectedFood(null);
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <View style={styles.topStatus}>
                <View style={styles.gearIcon}>
                    <Image source={require('../../assets/images/settings.png')} style={styles.gearImage} />
                </View>
                <Text style={styles.walletStatusText}>[connected wallet]</Text>
            </View>

            <View style={styles.mainScreen}>
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Feeding Time</Text>
                        <Text style={styles.statStars}>🍎</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Hunger</Text>
                        <Text style={styles.statStars}>
                            {'☆'.repeat(currentHunger)}
                            {currentHunger >= 5 ? ' (Full!)' : ''}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Status</Text>
                        <Text style={styles.statStars}>{currentHunger >= 5 ? '😋' : '🍽️'}</Text>
                    </View>
                </View>

                <View style={styles.mainDisplayArea}>
                    <View style={styles.starryBackground}>
                        <Text style={styles.star}>✦</Text>
                        <Text style={styles.star}>✦</Text>
                        <Text style={styles.star}>✦</Text>
                        <Text style={styles.star}>✦</Text>
                        <Text style={styles.star}>✦</Text>
                        <Text style={styles.star}>✦</Text>
                    </View>

                    <View style={[styles.cloud, styles.cloud1]} />
                    <View style={[styles.cloud, styles.cloud2]} />

                    <View style={styles.groundArea}>
                        <View style={styles.groundPattern} />
                    </View>

                    <View style={styles.characterSelectionGrid}>
                        {FOOD_ITEMS.map((food) => {
                            const isDisabled = currentHunger >= 5;

                            return (
                                <TouchableOpacity
                                    key={food.id}
                                    style={[
                                        styles.characterCard,
                                        {
                                            borderColor: getRarityColor(food.rarity),
                                            opacity: isDisabled ? 0.5 : 1,
                                            backgroundColor: isDisabled ? 'rgba(100,100,100,0.3)' : 'rgba(255,255,255,0.95)',
                                        },
                                    ]}
                                    onPress={() => !isDisabled && handleFeed(food)}
                                    activeOpacity={isDisabled ? 1 : 0.7}
                                >
                                    <Text style={styles.foodEmoji}>{food.emoji}</Text>
                                    <Text style={styles.characterName}>{food.name}</Text>
                                    <Text
                                        style={[
                                            styles.characterRarity,
                                            { color: getRarityColor(food.rarity) },
                                        ]}
                                    >
                                        {food.rarity}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {feedingAnimation && selectedFood && (
                        <View style={styles.feedingOverlay}>
                            <Animated.Text
                                style={[
                                    styles.feedingEmoji,
                                    { transform: [{ translateY: bounceAnim }] },
                                ]}
                            >
                                {selectedFood.emoji}
                            </Animated.Text>
                            <Text style={styles.feedingText}>
                                Feeding {selectedFood.name}...
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.bottomMenuBar}>
                    <Text style={styles.menuIcon}>🍎</Text>
                    <Text style={styles.menuIcon}>🌙</Text>
                    <Text style={styles.menuIcon}>🫐</Text>
                    <Text style={styles.menuIcon}>🍯</Text>
                    <Text style={styles.menuIcon}>💧</Text>
                    <Text style={styles.menuIcon}>⭐</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.bottomButtonLeft}
                onPress={onBack}
                accessibilityLabel="Go Back"
            >
                <Text>←</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.bottomButtonCenter,
                    {
                        backgroundColor: currentHunger >= 5 ? '#6B7280' : '#10B981',
                        opacity: currentHunger >= 5 ? 0.5 : 1,
                    },
                ]}
                accessibilityLabel="Feed Selected"
            >
                <Text>🍽️</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.bottomButtonRight}
                accessibilityLabel="Help"
            >
                <Text>?</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.deviceButtonLeft}
                onPress={onBack}
                accessibilityLabel="Left physical button - Go Back"
            />

            <TouchableOpacity
                style={styles.deviceButtonCenter}
                onPress={() => {
                    if (currentHunger < 5) {
                        onFeed('generic', 1, 1);
                    }
                }}
                accessibilityLabel="Center physical button - Feed Selected"
            />

            <TouchableOpacity
                style={styles.deviceButtonRight}
                accessibilityLabel="Right physical button - Help"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topStatus: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    gearIcon: {},
    gearImage: {
        width: 16,
        height: 16,
    },
    walletStatusText: {
        fontSize: 12,
    },
    mainScreen: {
        flex: 1,
        margin: 10,
        borderWidth: 1,
        borderColor: '#000',
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 5,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
    },
    statStars: {
        fontSize: 12,
    },
    mainDisplayArea: {
        flex: 1,
        position: 'relative',
    },
    starryBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignContent: 'space-around',
    },
    star: {
        fontSize: 10,
    },
    cloud: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 20,
        opacity: 0.8,
    },
    cloud1: {
        width: 100,
        height: 50,
        top: 50,
        left: 20,
    },
    cloud2: {
        width: 80,
        height: 40,
        top: 80,
        right: 20,
    },
    groundArea: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 50,
    },
    groundPattern: {
        flex: 1,
        backgroundColor: '#8B4513',
    },
    characterSelectionGrid: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        padding: 10,
    },
    characterCard: {
        alignItems: 'center',
        padding: 10,
        borderWidth: 2,
        borderRadius: 5,
        margin: 5,
        width: 100,
    },
    foodEmoji: {
        fontSize: 30,
        marginBottom: 4,
    },
    characterName: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    characterRarity: {
        fontSize: 10,
    },
    feedingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    feedingEmoji: {
        fontSize: 60,
    },
    feedingText: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
    },
    bottomMenuBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
    menuIcon: {
        fontSize: 20,
    },
    bottomButtonLeft: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 5,
    },
    bottomButtonCenter: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        padding: 10,
        borderRadius: 5,
    },
    bottomButtonRight: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 5,
    },
    deviceButtonLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 100,
        height: 50,
    },
    deviceButtonCenter: {
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        width: 100,
        height: 50,
    },
    deviceButtonRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 100,
        height: 50,
    },
});

export default FeedingPage;