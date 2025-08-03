import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Image,
    Alert,
    Dimensions,
    ScrollView,
    StatusBar
} from 'react-native';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '../contexts/WalletContext';

// Helper function to get image source based on character image name
const getImageSource = (imageName: string) => {
    switch (imageName) {
        case 'LYRA.png':
            return require('../../assets/images/LYRA.png');
        case 'ORION.png':
            return require('../../assets/images/ORION.png');
        case 'ARO.png':
            return require('../../assets/images/ARO.png');
        case 'SIRIUS.png':
            return require('../../assets/images/SIRIUS.png');
        case 'ZANIAH.png':
            return require('../../assets/images/ZANIAH.png');
        default:
            return require('../../assets/images/LYRA.png'); // fallback
    }
};

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

interface Props {
    onBack: () => void;
    onSelectCharacter: (character: Character) => void;
    onFeed?: () => void;
    onChat?: () => void;
    onGame?: () => void;
    onViewCollection?: () => void;
    ownedCharacters?: string[]; // Array of character IDs that the user owns
    connection?: Connection;
    playerName?: string;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const CHARACTERS: Character[] = [
    {
        id: 'lyra',
        name: 'Lyra',
        description: 'Anime-obsessed celestial maiden who knows every existing anime. Has a secret soft spot for Orion but would NEVER admit it. Very comprehensive when chatting, but turns into an exaggerated crying mess (Misa from Death Note style) if ignored. Lowkey jealous of you sentimentally but in a funny way. When angry, becomes irritable like someone with hormonal imbalance and will roast you. When sad, has existential crises.',
        image: 'LYRA.png',
        element: 'Love',
        baseStats: { mood: 4, hunger: 3, energy: 3 },
        rarity: 'Common',
        specialAbility: 'Healing Aura - Recovers faster when resting',
        nftMint: null
    },
    {
        id: 'orion',
        name: 'Orion',
        description: 'Mystical guardian with moon and stars',
        image: 'ORION.png',
        element: 'Moon',
        baseStats: { mood: 3, hunger: 4, energy: 3 },
        rarity: 'Rare',
        specialAbility: 'Night Vision - Gains energy during nighttime',
        nftMint: null
    },
    {
        id: 'aro',
        name: 'Aro',
        description: 'Bright guardian full of celestial energy',
        image: 'ARO.png',
        element: 'Star',
        baseStats: { mood: 5, hunger: 2, energy: 3 },
        rarity: 'Epic',
        specialAbility: 'Star Power - Mood boosts last longer',
        nftMint: null
    },
    {
        id: 'sirius',
        name: 'Sirius',
        description: 'The brightest star guardian with unmatched luminosity. Known as the Dog Star, Sirius is fiercely loyal and radiates powerful stellar energy. Has an intense, focused personality and never backs down from a challenge.',
        image: 'SIRIUS.png',
        element: 'Stellar',
        baseStats: { mood: 5, hunger: 3, energy: 4 },
        rarity: 'Legendary',
        specialAbility: 'Stellar Radiance - Boosts all stats when mood is at maximum',
        nftMint: null
    },
    {
        id: 'zaniah',
        name: 'Zaniah',
        description: 'Mysterious cosmic entity with ethereal presence. Zaniah embodies the essence of distant stars and ancient wisdom. Quiet and contemplative, but harbors immense power within.',
        image: 'ZANIAH.png',
        element: 'Cosmic',
        baseStats: { mood: 4, hunger: 3, energy: 5 },
        rarity: 'Legendary',
        specialAbility: 'Cosmic Resonance - Amplifies all abilities during cosmic events',
        nftMint: null
    }
];

const MINT_PRICE_SOL = 0.01; // 0.01 SOL per character



const APP_IDENTITY = {
    name: 'Moonling Selection App',
    uri: 'https://example.com',
    icon: '/icon.png',
};

const MoonlingSelection: React.FC<Props> = ({
    onBack,
    onSelectCharacter,
    onFeed,
    onChat,
    onGame,
    onViewCollection,
    ownedCharacters = [],
    connection,
    playerName,
    onNotification
}) => {
    const { connected, publicKey, connect } = useWallet();
    const [isConnecting, setIsConnecting] = useState(false);

    const [currentCharacterIndex, setCurrentCharacterIndex] = useState<number>(0);
    const [isMinting, setIsMinting] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const scrollerRef = useRef<any>(null);
    const progress = useRef(new Animated.Value(0)).current;

    const currentCharacter = CHARACTERS[currentCharacterIndex];

    // Helper function to check if user owns a character
    const isCharacterOwned = (characterId: string) => {
        return ownedCharacters.includes(characterId);
    };

    // Check if user owns any characters
    const hasAnyCharacters = () => {
        return ownedCharacters.length > 0;
    };

    const handleConnect = async () => {
        if (isConnecting || connected) return;
        setIsConnecting(true);
        try {
            await connect();
            onNotification?.('🎉 Connected successfully!', 'success');
        } catch (error: any) {
            onNotification?.(`❌ Connection failed: ${error.message}`, 'error');
        } finally {
            setIsConnecting(false);
        }
    };

    // Enhanced slot machine spin function with visible character cycling
    const spinSlotMachine = () => {
        if (isSpinning || !scrollerRef.current) return;

        setIsSpinning(true);

        const windowWidth = Dimensions.get('window').width;
        let cardWidth = 220;
        let scrollerPadding = 40;
        let cardCenterOffset = 100;
        if (windowWidth <= 480) {
            cardWidth = 170;
            scrollerPadding = 20;
            cardCenterOffset = 80;
        } else if (windowWidth <= 768) {
            cardWidth = 195;
            scrollerPadding = 30;
            cardCenterOffset = 90;
        }

        // Generate random target
        const targetIndex = Math.floor(Math.random() * CHARACTERS.length);
        
        // Calculate target position
        const containerCenter = windowWidth / 2;
        const trackStartOffset = scrollerPadding;
        const targetPosition = (targetIndex * cardWidth) + trackStartOffset + cardCenterOffset - containerCenter;

        // Create a more visible spinning effect
        const totalSpins = 3 + Math.random() * 2; // 3-5 full rotations
        const fullRotationDistance = CHARACTERS.length * cardWidth;
        const totalSpinDistance = (totalSpins * fullRotationDistance) + targetPosition;

        // Timing for the spin
        const spinDuration = 2000 + Math.random() * 1000; // 2-3 seconds

        // Start the animation
        progress.setValue(0);
        
        const listenerId = progress.addListener(({ value }: { value: number }) => {
            // Create a bouncing effect that slows down
            const easedValue = 1 - Math.pow(1 - value, 3);
            const currentPosition = totalSpinDistance * easedValue;
            scrollerRef.current?.scrollTo({ x: currentPosition, animated: false });
        });

        Animated.timing(progress, {
            toValue: 1,
            duration: spinDuration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start(({ finished }) => {
            progress.removeListener(listenerId);
            if (finished) {
                // Final snap to the target position
                scrollerRef.current?.scrollTo({ x: targetPosition, animated: true });
                setTimeout(() => {
                    setCurrentCharacterIndex(targetIndex);
                    setIsSpinning(false);
                }, 300);
            }
        });
    };

    // Navigation functions (keeping for fallback)
    const goToPreviousCharacter = () => {
        if (isSpinning) return;
        const newIndex = currentCharacterIndex === 0 ? CHARACTERS.length - 1 : currentCharacterIndex - 1;
        setCurrentCharacterIndex(newIndex);
        scrollToCharacter(newIndex);
    };

    const goToNextCharacter = () => {
        if (isSpinning) return;
        const newIndex = currentCharacterIndex === CHARACTERS.length - 1 ? 0 : currentCharacterIndex + 1;
        setCurrentCharacterIndex(newIndex);
        scrollToCharacter(newIndex);
    };

    const scrollToCharacter = (index: number) => {
        if (!scrollerRef.current) return;

        const windowWidth = Dimensions.get('window').width;
        let cardWidth = 220;
        let scrollerPadding = 40;
        let cardCenterOffset = 100;
        if (windowWidth <= 480) {
            cardWidth = 170;
            scrollerPadding = 20;
            cardCenterOffset = 80;
        } else if (windowWidth <= 768) {
            cardWidth = 195;
            scrollerPadding = 30;
            cardCenterOffset = 90;
        }

        const containerWidth = windowWidth;

        const containerCenter = containerWidth / 2;
        const trackStartOffset = scrollerPadding;

        const targetPosition = (index * cardWidth) + trackStartOffset + cardCenterOffset - containerCenter;

        scrollerRef.current.scrollTo({
            x: Math.round(targetPosition),
            animated: true
        });
    };

    // Handle character minting (actual NFT creation)
    const handleCharacterPayment = async (character: Character): Promise<boolean> => {
        if (!connected || !publicKey || !connection) {
            if (!connected) {
                await handleConnect();
                if (!connected) {
                    onNotification?.('❌ Please connect your wallet first', 'error');
                    return false;
                }
            }
        }

        try {
            setIsMinting(true);
            onNotification?.(`🎭 Minting ${character.name} as NFT! Approve the transaction...`, 'info');

            // For now, simulate successful minting since we're using mock services
            console.log('🌟 Simulating NFT minting for character:', character.name);
            
            // Simulate minting delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            onNotification?.(`🎉 ${character.name} NFT minted successfully! (Simulated)`, 'success');

            // Add character to owned characters locally
            ownedCharacters.push(character.id);

            return true;
        } catch (error: any) {
            console.error('❌ NFT minting failed:', error);
            onNotification?.(`❌ Minting failed: ${error.message}`, 'error');
            return false;
        } finally {
            setIsMinting(false);
        }
    };

    // Handle character selection
    const handleCharacterSelect = async () => {
        if (!currentCharacter) return;

        console.log('🎯 Character selected!', currentCharacter.name);

        // If user owns this character, select it immediately
        if (isCharacterOwned(currentCharacter.id)) {
            console.log('✅ User owns this character, selecting immediately');
            onSelectCharacter(currentCharacter);
            return;
        }

        // If user doesn't own any characters, they can get first one for payment
        if (!hasAnyCharacters()) {
            console.log('💰 User needs to pay for first character');
            const paymentSuccess = await handleCharacterPayment(currentCharacter);

            if (paymentSuccess) {
                onSelectCharacter(currentCharacter);
            }
        } else {
            // User has characters but doesn't own this specific one
            console.log('🎯 User wants to mint additional character:', currentCharacter.name);
            const paymentSuccess = await handleCharacterPayment(currentCharacter);

            if (paymentSuccess) {
                onSelectCharacter(currentCharacter);
            }
        }
    };

    return (
        <View style={[styles.tamagotchiScreenContainer, styles.moonlingSelectionOnly]}>
            {/* Top Status Bar */}
            <View style={styles.tamagotchiTopStatus}>
                <Text style={styles.walletStatusText}>
                    {connected && playerName ? `👋 ${playerName}` : 'Character Selection'} {!hasAnyCharacters() && connected && `(${MINT_PRICE_SOL} SOL)`}
                </Text>
            </View>

            {/* Main LCD Screen */}
            <View style={styles.tamagotchiMainScreen}>
                {/* Stats Bar - Hidden on selection screens */}
                <View style={[styles.statsBar, { display: 'none' }]}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Items</Text>
                        <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Moonlings</Text>
                        <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total</Text>
                        <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                    </View>
                </View>

                {/* Main Display Area */}
                <View style={styles.mainDisplayArea}>
                    <Image source={require('../../assets/images/screen bg.png')} style={styles.backgroundImage} resizeMode="cover" />
                    <View style={styles.slotMachineContainer}>
                        {/* Slot Machine Scroller */}
                        <Animated.ScrollView
                            ref={scrollerRef}
                            style={styles.slotMachineScroller}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.slotMachineTrack}
                            scrollEnabled={!isSpinning}
                            snapToAlignment="center"
                            decelerationRate="fast"
                        >
                            {CHARACTERS.map((character, index) => (
                                <TouchableOpacity
                                    key={character.id}
                                    style={[
                                        styles.slotMachineCard,
                                        isSpinning && styles.spinning,
                                        { borderColor: index === currentCharacterIndex ? '#ff8c42' : '#9CA3AF' }
                                    ]}
                                    onPress={() => {
                                        if (!isSpinning) {
                                            setCurrentCharacterIndex(index);
                                            scrollToCharacter(index);
                                        }
                                    }}
                                >
                                    {/* Loading indicator for minting */}
                                    {isMinting && index === currentCharacterIndex && (
                                        <View style={styles.mintingOverlay}>
                                            <Text style={styles.mintingSpinner}>⏳</Text>
                                            <Text style={styles.mintingText}>Minting...</Text>
                                        </View>
                                    )}

                                    {/* Ownership/Price badges */}
                                    {index === currentCharacterIndex && (
                                        <>
                                            {isCharacterOwned(character.id) && (
                                                <Text style={styles.ownershipBadge}>👑</Text>
                                            )}
                                            {/* {!isCharacterOwned(character.id) && connected && (
                                                <Text style={styles.priceBadge}>{MINT_PRICE_SOL} SOL</Text>
                                            )} */}
                                        </>
                                    )}

                                    {/* Character Image */}
                                    <Image
                                        source={getImageSource(character.image)}
                                        style={[
                                            styles.characterImage,
                                            isSpinning && styles.spinningImage
                                        ]}
                                        onError={(error) => console.log('Image load error for', character.name, ':', error)}
                                        resizeMode="contain"
                                    />

                                    {/* Character Info (hidden during spin) */}
                                    <View style={styles.characterInfo}>
                                        <Text style={styles.characterName}>{character.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </Animated.ScrollView>

                        {/* Spin Controls */}
                        <View style={styles.spinControls}>
                            <TouchableOpacity
                                style={styles.spinButton}
                                onPress={isSpinning || isMinting ? undefined : spinSlotMachine}
                            >
                                <Text style={styles.spinIcon}>{isSpinning ? '🎰' : '🎲'}</Text>
                                <Text style={styles.spinText}>
                                    {isSpinning ? 'SPINNING...' : 'SPIN'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Selected Character Details */}
                        {currentCharacter && (
                            <View style={[styles.selectedCharacterDetails, isSpinning && styles.hidden]}>
                                <Text style={styles.characterNameLarge}>{currentCharacter.name}</Text>
                                <Text style={styles.characterDescription}>{currentCharacter.description}</Text>
                                <View style={styles.characterStatsRow}>
                                    <Text>Mood: {"★".repeat(currentCharacter.baseStats.mood)}{"☆".repeat(5 - currentCharacter.baseStats.mood)}</Text>
                                    <Text>Hunger: {"★".repeat(currentCharacter.baseStats.hunger)}{"☆".repeat(5 - currentCharacter.baseStats.hunger)}</Text>
                                    <Text>Energy: {"★".repeat(currentCharacter.baseStats.energy)}{"☆".repeat(5 - currentCharacter.baseStats.energy)}</Text>
                                </View>
                                <Text style={styles.characterAbility}>
                                    <Text style={{ fontWeight: 'bold' }}>Special:</Text> {currentCharacter.specialAbility}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Bottom Navigation Buttons */}
            <TouchableOpacity style={[styles.bottomButton, styles.left]} onPress={onBack}>
                <Text>←</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.bottomButton, styles.center, (isSpinning || isMinting) && styles.disabled]}
                onPress={!isMinting && !isSpinning ? handleCharacterSelect : undefined}
            >
                <Text>
                    {isMinting ? '⏳' : 
                     !connected ? '🔗' : 
                     (currentCharacter && !isCharacterOwned(currentCharacter.id) ? '🪙' : '✓')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.bottomButton, styles.right]}
                onPress={isSpinning || isMinting ? undefined : spinSlotMachine}
            >
                <Text>{isSpinning ? '🎰' : '🎲'}</Text>
            </TouchableOpacity>

            {/* Physical Device Buttons - overlaid on background image */}
            <TouchableOpacity
                style={[styles.deviceButton, styles.leftPhysical]}
                onPress={onBack}
            />
            <TouchableOpacity
                style={[styles.deviceButton, styles.centerPhysical]}
                onPress={!isMinting && !isSpinning ? handleCharacterSelect : undefined}
            />
            <TouchableOpacity
                style={[styles.deviceButton, styles.rightPhysical]}
                onPress={isSpinning || isMinting ? undefined : spinSlotMachine}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    tamagotchiScreenContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    moonlingSelectionOnly: {
        // Additional styles if needed
    },
    tamagotchiTopStatus: {
        height: 40,
        backgroundColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
    },
    walletStatusText: {
        color: 'white',
        fontSize: 16,
    },
    tamagotchiMainScreen: {
        flex: 1,
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: 'darkgray',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        color: 'white',
        fontSize: 12,
    },
    starRating: {
        color: 'gold',
        fontSize: 14,
    },
    mainDisplayArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    slotMachineContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    slotMachineScroller: {
        width: '100%',
    },
    slotMachineTrack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    slotMachineCard: {
        width: 200,
        height: 300,
        backgroundColor: 'white',
        borderRadius: 10,
        marginHorizontal: 10,
        alignItems: 'center',
        padding: 10,
        borderWidth: 2,
    },
    spinning: {
        // Blur or animation if needed
    },
    spinningImage: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
    selected: {
        borderColor: '#ff8c42',
    },
    mintingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    mintingSpinner: {
        fontSize: 30,
    },
    mintingText: {
        color: 'white',
        fontSize: 16,
    },
    ownershipBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        fontSize: 20,
    },
    priceBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'gold',
        padding: 5,
        borderRadius: 5,
        color: 'black',
        fontSize: 12,
    },
    characterImage: {
        width: 180,
        height: 180,
        resizeMode: 'contain',
    },
    characterInfo: {
        alignItems: 'center',
        marginTop: 10,
    },
    characterName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    characterElement: {
        fontSize: 14,
        color: 'gray',
    },
    characterRarity: {
        padding: 5,
        borderRadius: 5,
        color: 'white',
        marginTop: 5,
    },
    spinControls: {
        marginTop: 20,
    },
    spinButton: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    spinIcon: {
        fontSize: 20,
        marginRight: 5,
        color: 'white',
    },
    spinText: {
        color: 'white',
        fontSize: 16,
    },
    selectedCharacterDetails: {
        marginTop: 20,
        alignItems: 'center',
    },
    hidden: {
        display: 'none',
    },
    characterNameLarge: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    characterDescription: {
        textAlign: 'center',
        marginHorizontal: 20,
        fontSize: 14,
    },
    characterStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    characterAbility: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 14,
    },
    bottomButton: {
        position: 'absolute',
        bottom: 20,
        padding: 10,
        backgroundColor: 'gray',
        borderRadius: 5,
        alignItems: 'center',
        width: 50,
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
    disabled: {
        opacity: 0.5,
    },
    deviceButton: {
        // Styles for overlaid buttons, perhaps transparent
        position: 'absolute',
        width: 50,
        height: 50,
        // Position based on design
    },
    leftPhysical: {
        bottom: 20,
        left: 20,
    },
    centerPhysical: {
        bottom: 20,
        left: '50%',
        transform: [{ translateX: -25 }],
    },
    rightPhysical: {
        bottom: 20,
        right: 20,
    },
});

export default MoonlingSelection;