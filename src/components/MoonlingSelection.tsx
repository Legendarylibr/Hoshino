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
    StatusBar,
    Modal
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '../contexts/WalletContext';
import InnerScreen from './InnerScreen';

// Helper function to get image source based on character image name
const getImageSource = (imageName: string) => {
    switch (imageName) {
        case 'LYRA.gif':
            return require('../../assets/images/LYRA.gif');
        case 'ORION.gif':
            return require('../../assets/images/ORION.gif');
        case 'ARO.gif':
            return require('../../assets/images/ARO.gif');
        case 'SIRIUS.gif':
            return require('../../assets/images/SIRIUS.gif');
        case 'ZANIAH.gif':
            return require('../../assets/images/ZANIAH.gif');
        default:
            return require('../../assets/images/LYRA.gif'); // fallback
    }
};



interface Character {
    id: string;
    name: string;
    description: string;
    image: string;
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
        image: 'LYRA.gif',
        nftMint: null
    },
    {
        id: 'orion',
        name: 'Orion',
        description: 'Mystical guardian with moon and stars',
        image: 'ORION.gif',
        nftMint: null
    },
    {
        id: 'aro',
        name: 'Aro',
        description: 'A chaotic little menace. Loud, unhinged, and always ready to play. Share a secret and he’ll turn it into his favorite joke for weeks.',
        image: 'ARO.gif',
        nftMint: null
    },
    {
        id: 'sirius',
        name: 'Sirius',
        description: 'The brightest star guardian with unmatched luminosity. Known as the Dog Star, Sirius is fiercely loyal and radiates powerful stellar energy. Has an intense, focused personality and never backs down from a challenge.',
        image: 'SIRIUS.gif',
        nftMint: null
    },
    {
        id: 'zaniah',
        name: 'Zaniah',
        description: 'Mysterious cosmic entity with ethereal presence. Zaniah embodies the essence of distant stars and ancient wisdom. Quiet and contemplative, but harbors immense power within.',
        image: 'ZANIAH.gif',
        nftMint: null
    }
];

const MINT_PRICE_SOL = 0.01; // 0.01 SOL per character

const APP_IDENTITY = {
    name: 'Moonling Selection App',
    uri: 'https://example.com',
    icon: '/icon.png',
};

const CARD_WIDTH = 220; // 200 card width + 20 total margin (10 on each side)

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

    const [currentCharacterIndex, setCurrentCharacterIndex] = useState<number>(2); // Start with Aro (index 2)
    const [isMinting, setIsMinting] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [showCharacterModal, setShowCharacterModal] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const scrollerRef = useRef<any>(null);

    const currentCharacter = CHARACTERS[currentCharacterIndex];

    // Create extended array with duplicates for infinite scroll
    const extendedCharacters = [
        ...CHARACTERS.slice(-2), // Last 2 characters at the beginning
        ...CHARACTERS,
        ...CHARACTERS.slice(0, 2) // First 2 characters at the end
    ];

    // Create a much longer array for mint animation (no looping needed)
    const mintCharacters = [
        ...CHARACTERS, // Original 5
        ...CHARACTERS, // Copy 1
        ...CHARACTERS, // Copy 2
        ...CHARACTERS, // Copy 3
        ...CHARACTERS, // Copy 4
        ...CHARACTERS, // Copy 5
        ...CHARACTERS, // Copy 6
        ...CHARACTERS, // Copy 7
        ...CHARACTERS, // Copy 8
        ...CHARACTERS, // Copy 9
        ...CHARACTERS, // Copy 10
    ]; // Total: 55 cards (11 copies of 5 characters)

    // Scroll to initial position on mount (offset by 2 for the duplicates)
    useEffect(() => {
        setTimeout(() => {
            if (scrollerRef.current) {
                const initialScrollX = (currentCharacterIndex + 2) * CARD_WIDTH;
                scrollerRef.current.scrollTo({
                    x: initialScrollX,
                    animated: false
                });
            }
        }, 100);
    }, []);

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
        const spinDuration = 4000; // 4 seconds for smoother animation
        const spinInterval = 80; // 80ms intervals for less stuttering
        let elapsed = 0;

        const spin = () => {
            elapsed += spinInterval;
            const progress = elapsed / spinDuration;
            
            // Easing function for smoother deceleration with gradual start
            const easeInOut = progress < 0.5 ? 
                2 * progress * progress : 
                1 - Math.pow(-2 * progress + 2, 4) / 2;
            
            // Calculate scroll position within the extended array bounds
            const totalExtendedCards = extendedCharacters.length; // 9 cards total
            const totalScrollDistance = CARD_WIDTH * totalExtendedCards * 8; // 8 full loops through extended array
            const scrollDistance = totalScrollDistance * easeInOut;
            
            // Ensure we stay within the extended array bounds
            let extendedPosition = scrollDistance % (totalExtendedCards * CARD_WIDTH);
            
            // Update scroll position - this should visibly move the boxes
            if (scrollerRef.current) {
                scrollerRef.current.scrollTo({
                    x: extendedPosition,
                    animated: false // We're manually controlling the animation
                });
            }
            
            // Update current character index based on scroll position
            const extendedIndex = Math.floor(extendedPosition / CARD_WIDTH);
            const actualIndex = extendedIndex < 2 ? 
                CHARACTERS.length - 2 + extendedIndex : 
                extendedIndex >= 2 + CHARACTERS.length ? 
                    extendedIndex - 2 - CHARACTERS.length : 
                    extendedIndex - 2;
            

            
            setCurrentCharacterIndex(actualIndex);
            
            if (elapsed < spinDuration) {
                setTimeout(spin, spinInterval);
            } else {
                // Final position - land on a random character
                const finalIndex = Math.floor(Math.random() * CHARACTERS.length);
                const finalScrollX = (finalIndex + 2) * CARD_WIDTH; // +2 for the extended array offset
                
                setCurrentCharacterIndex(finalIndex);
                
                // Smooth scroll to final position
                if (scrollerRef.current) {
                    scrollerRef.current.scrollTo({
                        x: finalScrollX,
                        animated: true,
                        duration: 800 // Longer duration for smoother landing
                    });
                }
                
                setIsSpinning(false);
                
                // After spin completes, automatically select the character and navigate to interaction
                const selectedCharacter = CHARACTERS[finalIndex];
                if (selectedCharacter) {
                    // Small delay to let the user see the final result
                    setTimeout(() => {
                        onSelectCharacter(selectedCharacter);
                    }, 1000); // 1 second delay
                }
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
            const scrollToX = (index + 2) * CARD_WIDTH; // +2 for the extended array offset
            
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

    const handleCharacterPress = (character: Character) => {
        setSelectedCharacter(character);
        setShowCharacterModal(true);
    };

    const closeCharacterModal = () => {
        setShowCharacterModal(false);
        setSelectedCharacter(null);
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <InnerScreen
                onLeftButtonPress={onBack}
                onCenterButtonPress={!isMinting && !isSpinning ? handleCharacterSelect : undefined}
                onRightButtonPress={isSpinning || isMinting ? undefined : spinSlotMachine}
                leftButtonText=""
                centerButtonText=""
                rightButtonText=""
                centerButtonDisabled={isMinting || isSpinning}
                rightButtonDisabled={isSpinning || isMinting}
                isSelectionPage={true}
                overlayMode={true}
            >
            {/* Main Display Area */}
            <View style={styles.mainDisplayArea}>
                <Image source={require('../../assets/images/screen bg.png')} style={styles.backgroundImage} resizeMode="cover" />
                {/* Character Selection Scroller */}
                <View style={styles.slotMachineContainer}>
                    <ScrollView
                        ref={scrollerRef}
                        horizontal
                        style={{ flex: 1 }}
                        contentContainerStyle={{ 
                            flexDirection: 'row',
                            paddingHorizontal: (Dimensions.get('window').width - CARD_WIDTH) / 2
                        }}
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const offsetX = e.nativeEvent.contentOffset.x;
                            const extendedIndex = Math.round(offsetX / CARD_WIDTH);
                            
                            // Convert extended index to actual character index
                            let actualIndex = extendedIndex - 2;
                            
                            // Handle wrapping immediately during scroll
                            if (actualIndex < 0) {
                                actualIndex = CHARACTERS.length + actualIndex;
                                // Scroll to the equivalent position in the middle
                                const newScrollX = (actualIndex + 2) * CARD_WIDTH;
                                scrollerRef.current?.scrollTo({ x: newScrollX, animated: false });
                            } else if (actualIndex >= CHARACTERS.length) {
                                actualIndex = actualIndex - CHARACTERS.length;
                                // Scroll to the equivalent position in the middle
                                const newScrollX = (actualIndex + 2) * CARD_WIDTH;
                                scrollerRef.current?.scrollTo({ x: newScrollX, animated: false });
                            }
                            
                            setCurrentCharacterIndex(actualIndex);
                        }}
                    >
                        {extendedCharacters.map((character, extIndex) => {
                            // Get the actual character index
                            const actualIndex = extIndex < 2 ? 
                                CHARACTERS.length - 2 + extIndex : 
                                extIndex >= 2 + CHARACTERS.length ? 
                                    extIndex - 2 - CHARACTERS.length : 
                                    extIndex - 2;
                            
                            return (
                            <TouchableOpacity
                                key={`${character.id}-${extIndex}`}
                                style={[
                                    styles.slotMachineCard,
                                    { 
                                        borderColor: actualIndex === currentCharacterIndex ? '#ff8c42' : '#9CA3AF',
                                        marginHorizontal: 10
                                    }
                                ]}
                                onPress={() => {
                                    handleCharacterPress(character);
                                }}
                            >
                                {/* Loading indicator for minting */}
                                {isMinting && actualIndex === currentCharacterIndex && (
                                    <View style={styles.mintingOverlay}>
                                        <Text style={styles.mintingSpinner}>⏳</Text>
                                        <Text style={styles.mintingText}>Minting...</Text>
                                    </View>
                                )}

                                {/* Ownership/Price badges */}
                                {actualIndex === currentCharacterIndex && (
                                    <>
                                        {isCharacterOwned(character.id) && (
                                            <Text style={styles.ownershipBadge}>👑</Text>
                                        )}
                                    </>
                                )}

                                {/* Character Info */}
                                <View style={styles.characterInfo}>
                                    <Text style={styles.characterName}>{character.name}</Text>
                                </View>

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
                            </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Spin Controls */}
                <View style={styles.spinControls}>
                    <TouchableOpacity
                        style={styles.spinButton}
                        onPress={isSpinning || isMinting ? undefined : spinSlotMachine}
                    >
                        <Text style={styles.spinText}>
                            {isSpinning ? 'MINTING...' : 'MINT'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            {/* Character Detail Modal */}
            <Modal
                visible={showCharacterModal}
                transparent={true}
                animationType="fade"
                onRequestClose={closeCharacterModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedCharacter && (
                            <>
                                <TouchableOpacity
                                    style={styles.modalCloseButton}
                                    onPress={closeCharacterModal}
                                >
                                    <Text style={styles.modalCloseText}>✕</Text>
                                </TouchableOpacity>
                                
                                <Image
                                    source={getImageSource(selectedCharacter.image)}
                                    style={styles.modalCharacterImage}
                                    resizeMode="contain"
                                />
                                
                                <Text style={styles.modalCharacterName}>{selectedCharacter.name}</Text>
                                
                                <Text style={styles.modalDescription}>{selectedCharacter.description}</Text>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </InnerScreen>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
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
        marginTop: 150, // Push cards down more for better centering
    },
    slotMachineScroller: {
        flex: 1,
        width: '100%',
    },
    slotMachineTrack: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 50,
    },
    slotMachineCard: {
        width: 200,
        height: 200,
        backgroundColor: 'white',
        borderRadius: 10,
        marginHorizontal: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
        width: 150,
        height: 150,
        flex: 1,
        marginTop: 20,
    },
    characterInfo: {
        marginBottom: -20,
        alignItems: 'center',
    },
    characterName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
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
        marginBottom: 20,
        alignItems: 'center',
    },
    spinButton: {
        backgroundColor: '#E8F5E8',
        padding: 10,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: '#2E5A3E',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    spinText: {
        color: '#2E5A3E',
        fontSize: 14,
        fontWeight: 'bold',
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
    carouselContainer: {
        width: '100%',
        height: 200, // Adjust height as needed
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    carouselCard: {
        position: 'absolute',
        width: 200,
        height: 200,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        margin: 20,
        maxWidth: '90%',
        maxHeight: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalCloseButton: {
        position: 'absolute',
        top: 10,
        right: 15,
        zIndex: 1,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 18,
        color: '#666',
        fontWeight: 'bold',
    },
    modalCharacterImage: {
        width: 120,
        height: 120,
        marginBottom: 15,
    },
    modalCharacterName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 15,
    },

});

export default MoonlingSelection;