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
import InnerScreen from './InnerScreen';

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

    const currentCharacter = CHARACTERS[currentCharacterIndex];

    const isCharacterOwned = (characterId: string) => {
        return ownedCharacters.includes(characterId);
    };

    const hasAnyCharacters = () => {
        return ownedCharacters.length > 0;
    };

    const handleConnect = async () => {
        if (connected) return;
        
        setIsConnecting(true);
        try {
            await connect();
            onNotification?.('✅ Wallet connected successfully!', 'success');
        } catch (error) {
            console.error('Connection error:', error);
            onNotification?.('❌ Failed to connect wallet', 'error');
        } finally {
            setIsConnecting(false);
        }
    };

    const spinSlotMachine = () => {
        if (isSpinning || isMinting) return;

        setIsSpinning(true);
        const spinDuration = 3000; // 3 seconds
        const spinInterval = 100; // 100ms intervals
        let elapsed = 0;

        const spin = () => {
            elapsed += spinInterval;
            const progress = elapsed / spinDuration;
            
            // Easing function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const targetIndex = Math.floor(easeOut * CHARACTERS.length);
            
            setCurrentCharacterIndex(targetIndex % CHARACTERS.length);
            
            if (elapsed < spinDuration) {
                setTimeout(spin, spinInterval);
            } else {
                // Final position
                const finalIndex = Math.floor(Math.random() * CHARACTERS.length);
                setCurrentCharacterIndex(finalIndex);
                setIsSpinning(false);
                
                // Scroll to the final character
                setTimeout(() => {
                    scrollToCharacter(finalIndex);
                }, 100);
            }
        };

        spin();
    };

    const goToPreviousCharacter = () => {
        if (isSpinning || isMinting) return;
        const newIndex = (currentCharacterIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
        setCurrentCharacterIndex(newIndex);
        scrollToCharacter(newIndex);
    };

    const goToNextCharacter = () => {
        if (isSpinning || isMinting) return;
        const newIndex = (currentCharacterIndex + 1) % CHARACTERS.length;
        setCurrentCharacterIndex(newIndex);
        scrollToCharacter(newIndex);
    };

    const scrollToCharacter = (index: number) => {
        if (scrollerRef.current) {
            const cardWidth = 220; // 200 width + 20 margin
            const scrollToX = index * cardWidth;
            
            scrollerRef.current.scrollTo({
                x: scrollToX,
                animated: true
            });
        }
    };

    const handleCharacterPayment = async (character: Character): Promise<boolean> => {
        if (!connected || !publicKey) {
            onNotification?.('❌ Please connect your wallet first', 'error');
            return false;
        }

        try {
            // TODO: Implement actual payment logic
            // For now, simulate successful payment
            onNotification?.(`🎉 Successfully acquired ${character.name}!`, 'success');
            return true;
        } catch (error) {
            console.error('Payment error:', error);
            onNotification?.('❌ Payment failed. Please try again.', 'error');
            return false;
        }
    };

    const handleCharacterSelect = async () => {
        if (!currentCharacter) return;

        if (isCharacterOwned(currentCharacter.id)) {
            // Character is already owned, select it
            onSelectCharacter(currentCharacter);
        } else if (connected) {
            // Character needs to be purchased
            setIsMinting(true);
            try {
                const paymentSuccess = await handleCharacterPayment(currentCharacter);
                if (paymentSuccess) {
                    onSelectCharacter(currentCharacter);
                }
            } finally {
                setIsMinting(false);
            }
        } else {
            // Need to connect wallet first
            handleConnect();
        }
    };

    return (
        <InnerScreen
            topStatusContent={
                <Text style={styles.walletStatusText}>
                    {connected && playerName ? `👋 ${playerName}` : 'Character Selection'} {!hasAnyCharacters() && connected && `(${MINT_PRICE_SOL} SOL)`}
                </Text>
            }
            onLeftButtonPress={onBack}
            onCenterButtonPress={!isMinting && !isSpinning ? handleCharacterSelect : undefined}
            onRightButtonPress={isSpinning || isMinting ? undefined : spinSlotMachine}
            leftButtonText="←"
            centerButtonText={
                isMinting ? '⏳' : 
                !connected ? '🔗' : 
                (currentCharacter && !isCharacterOwned(currentCharacter.id) ? '🪙' : '✓')
            }
            rightButtonText={isSpinning ? '🎰' : '🎲'}
            centerButtonDisabled={isMinting || isSpinning}
            rightButtonDisabled={isSpinning || isMinting}
        >
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
        </InnerScreen>
    );
};

const styles = StyleSheet.create({
    walletStatusText: {
        color: 'white',
        fontSize: 16,
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
});

export default MoonlingSelection;