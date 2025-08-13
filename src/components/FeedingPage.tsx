import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import InnerScreen from './InnerScreen';

interface FoodItem {
    id: string;
    name: string;
    image: string;
    hungerBoost: number;
    moodBoost: number;
    description: string;
}

interface Props {
    onBack: () => void;
    onFeed: (foodType: string, hungerBoost: number, moodBoost: number) => void;
    currentHunger: number;
}

const FOOD_ITEMS: FoodItem[] = [
    {
        id: 'sugar',
        name: 'Pink Sugar',
        image: 'pink-sugar.png',
        hungerBoost: 1,
        moodBoost: 1,
        description: 'Sweet crystalline sugar with a pink hue'
    },
    {
        id: 'nova',
        name: 'Nova Egg',
        image: 'nova-egg.png',
        hungerBoost: 2,
        moodBoost: 2,
        description: 'A mysterious egg that glows with stellar energy'
    },
    {
        id: 'mira',
        name: 'Mira Berry',
        image: 'mira-berry.png',
        hungerBoost: 3,
        moodBoost: 3,
        description: 'A rare berry with stellar properties'
    }
];

// Helper function to get image source based on food image name
const getFoodImageSource = (imageName: string) => {
    switch (imageName) {
        case 'pink-sugar.png':
            return require('../../assets/ingredients/pink-sugar.png');
        case 'nova-egg.png':
            return require('../../assets/ingredients/nova-egg.png');
        case 'mira-berry.png':
            return require('../../assets/ingredients/mira-berry.png');
        default:
            return require('../../assets/ingredients/pink-sugar.png'); // fallback
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
        <InnerScreen
            showStatsBar={false}
            onLeftButtonPress={onBack}
            onCenterButtonPress={() => {
                if (currentHunger < 5) {
                    onFeed('generic', 1, 1);
                }
            }}
            onRightButtonPress={() => {
                // Help button - could show feeding tips
            }}
            leftButtonText=""
            centerButtonText=""
            rightButtonText=""
        >
            {/* Main Display Area */}
            <View style={styles.mainDisplayArea}>

                <View style={styles.characterSelectionGrid}>
                    {FOOD_ITEMS.map((food) => {
                        const isDisabled = currentHunger >= 5;

                        return (
                            <TouchableOpacity
                                key={food.id}
                                style={[
                                    styles.characterCard,
                                    {
                                        opacity: isDisabled ? 0.5 : 1,
                                        backgroundColor: isDisabled ? 'rgba(100,100,100,0.3)' : 'rgba(255,255,255,0.95)',
                                    },
                                ]}
                                onPress={() => !isDisabled && handleFeed(food)}
                                activeOpacity={isDisabled ? 1 : 0.7}
                            >
                                <Image source={getFoodImageSource(food.image)} style={styles.foodImage} />
                                <Text style={styles.characterName}>{food.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {feedingAnimation && selectedFood && (
                    <View style={styles.feedingOverlay}>
                        <Animated.Image
                            source={getFoodImageSource(selectedFood.image)}
                            style={[
                                styles.feedingImage,
                                { transform: [{ translateY: bounceAnim }] },
                            ]}
                        />
                        <Text style={styles.feedingText}>
                            Feeding {selectedFood.name}...
                        </Text>
                    </View>
                )}
            </View>
        </InnerScreen>
    );
};

const styles = StyleSheet.create({
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        fontFamily: 'PressStart2P',
    },
    statStars: {
        fontSize: 12,
        fontFamily: 'PressStart2P',
    },
    mainDisplayArea: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    characterSelectionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
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
    foodImage: {
        width: 40,
        height: 40,
        marginBottom: 4,
        resizeMode: 'contain',
    },
    characterName: {
        fontSize: 10,
        fontFamily: 'PressStart2P',
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
    feedingImage: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    feedingText: {
        color: '#FFD700',
        fontSize: 12,
        fontFamily: 'PressStart2P',
        marginTop: 10,
        textAlign: 'center',
    },

});

export default FeedingPage;