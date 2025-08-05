import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Dimensions,
    ScrollView,
    Modal
} from 'react-native';

import InnerScreen from './InnerScreen';
import WalletButton from './WalletButton';

// NEW: Programmable NFT Integration
import { useProgrammableNFT } from '../hooks/useProgrammableNFT';
import { getAsset } from '../config/AssetRegistry';


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
}

interface Props {
    onBack: () => void;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onGoToCongratulations?: (character?: Character) => void;
}

const CHARACTERS: Character[] = [
    {
        id: 'lyra',
        name: 'Lyra',
        description: 'Lyra lives for attention, anime, and being just a little unhinged. She\'ll flirt, cry, and roast you in the same breath. Don\'t leave her on read — ever.',
        image: 'LYRA.gif'
    },
    {
        id: 'orion',
        name: 'Orion',
        description: 'A dramatic starboy with too many feelings and a quiet grudge. Sometimes you\'ll catch him in a corner, blasting Lil Peep like it\'s a coping mechanism. Don\'t ask, he won\'t tell.',
        image: 'ORION.gif'
    },
    {
        id: 'aro',
        name: 'Aro',
        description: 'A chaotic little menace. Loud, unhinged, and always ready to play. Share a secret and he\'ll turn it into his favorite joke for weeks.',
        image: 'ARO.gif'
    },
    {
        id: 'sirius',
        name: 'Sirius',
        description: 'A robot cat who thinks he\'s hilarious. Loves making dad jokes about AI and insists you call him "Hey Sirius". But don\'t worry, he\'s still learning emotions… kind of.',
        image: 'SIRIUS.gif'
    },
    {
        id: 'zaniah',
        name: 'Zaniah',
        description: 'If she\'s moody, don\'t ask — it\'s either Mercury retrograde or you\'re a Scorpio. Or both. Let her vibe it out, she\'s in her healing era.',
        image: 'ZANIAH.gif'
    }
];

const CARD_WIDTH = 220; // 200 card width + 20 total margin (10 on each side)

const MoonlingSelection: React.FC<Props> = ({
    onBack,
    onNotification,
    onGoToCongratulations
}) => {

    const { 
        connected, 
        publicKey, 
        connectWallet, 
        disconnect,
        mintCharacterNFT
    } = useProgrammableNFT();
    const [currentCharacterIndex, setCurrentCharacterIndex] = useState<number>(0); // Start with first character
    const [isMinting, setIsMinting] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [showCharacterModal, setShowCharacterModal] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [showCongratulationsModal, setShowCongratulationsModal] = useState(false);
    const [congratulationsCharacter, setCongratulationsCharacter] = useState<Character | null>(null);
    const scrollerRef = useRef<ScrollView | null>(null);

    const currentCharacter = CHARACTERS[currentCharacterIndex];



    // Scroll to initial position on mount
    useEffect(() => {
        setTimeout(() => {
            if (scrollerRef.current) {
                const initialScrollX = currentCharacterIndex * CARD_WIDTH;
                scrollerRef.current.scrollTo({
                    x: initialScrollX,
                    animated: false
                });
            }
        }, 100);
    }, []);



    // Animation Configuration - Easy to adjust!
    const ANIMATION_CONFIG = {
        // Speed & Duration
        spinDuration: 5000,        // Total spin time in milliseconds
        spinInterval: 35,          // Time between animation frames (lower = smoother)
        
        // Easing Configuration
        easeInPower: 2,            // How aggressive the ease-in is (higher = more dramatic start)
        easeOutPower: 1,           // How aggressive the ease-out is (higher = sharper stop)
        
        // Spin Intensity
        totalLoops: 18,             // How many times to loop through all characters
    };

    const calculateSpinPosition = (elapsed: number, spinDuration: number) => {
        const progress = elapsed / spinDuration;
        
        // Configurable easing function
        const easeInOut = progress < 0.5 ? 
            Math.pow(progress, ANIMATION_CONFIG.easeInPower) * 2 : 
            1 - Math.pow(-2 * progress + 2, ANIMATION_CONFIG.easeOutPower) / 2;
        
        // Calculate scroll position within the CHARACTERS array bounds
        const totalCards = CHARACTERS.length; // 5 cards total
        const totalScrollDistance = CARD_WIDTH * totalCards * ANIMATION_CONFIG.totalLoops;
        const scrollDistance = totalScrollDistance * easeInOut;
        
        // Ensure we stay within the CHARACTERS array bounds
        return scrollDistance % (totalCards * CARD_WIDTH);
    };



    const landOnRandomCharacter = () => {
        const finalIndex = Math.floor(Math.random() * CHARACTERS.length);
        const finalScrollX = finalIndex * CARD_WIDTH;
        
        setCurrentCharacterIndex(finalIndex);
        
        // Smooth scroll to final position
        if (scrollerRef.current) {
            scrollerRef.current.scrollTo({
                x: finalScrollX,
                animated: true
            });
        }
        
        return CHARACTERS[finalIndex];
    };

    const performSpinStep = (elapsed: number, spinDuration: number) => {
        const scrollPosition = calculateSpinPosition(elapsed, spinDuration);
        
        // Update scroll position - this should visibly move the boxes
        if (scrollerRef.current) {
            scrollerRef.current.scrollTo({
                x: scrollPosition,
                animated: false // We're manually controlling the animation
            });
        }
        
        // Update current character index based on scroll position
        const scrollIndex = Math.floor(scrollPosition / CARD_WIDTH);
        const actualIndex = scrollIndex % CHARACTERS.length;
        setCurrentCharacterIndex(actualIndex);
    };

    const spinSlotMachine = async () => {
        if (isSpinning || isMinting) return;

        // Check wallet connection first
        if (!connected) {
            onNotification?.('❌ Please connect your wallet first', 'error');
            try {
                await connectWallet();
                onNotification?.('✅ Wallet connected successfully!', 'success');
            } catch (error) {
                console.error('Connection error:', error);
                onNotification?.('❌ Failed to connect wallet', 'error');
            }
            return;
        }

        setIsSpinning(true);
        setIsMinting(true);
        const spinDuration = ANIMATION_CONFIG.spinDuration;
        const spinInterval = ANIMATION_CONFIG.spinInterval;
        let elapsed = 0;

        const spin = () => {
            elapsed += spinInterval;
            performSpinStep(elapsed, spinDuration);
            
            if (elapsed < spinDuration) {
                setTimeout(spin, spinInterval);
            } else {
                // Stop the spin animation first
                setIsSpinning(false);
                
                // Small delay to ensure spin animation is completely stopped
                setTimeout(() => {
                    const selectedCharacter = landOnRandomCharacter();
                    if (selectedCharacter) {
                        // Start minting process
                        handleMintAfterSpin(selectedCharacter);
                    }
                }, 100);
            }
        };

        spin();
    };

    const handleMintAfterSpin = async (character: Character) => {
        try {
            onNotification?.(`🎨 Minting ${character.name} pNFT...`, 'info');
            
            // Get character asset from registry
            const asset = getAsset(character.id);
            if (!asset) {
                throw new Error(`Character ${character.id} not found in asset registry`);
            }

            if (asset.category !== 'character') {
                throw new Error(`Asset ${character.id} is not a character`);
            }
            
            // Map local Character to GameCharacter format for pNFT minting
            const gameCharacter = {
                ...character
            };
            
            const result = await mintCharacterNFT(gameCharacter, asset.ipfsHash);
            
            if (result.success) {
                onNotification?.(
                    `🎉 ${character.name} pNFT minted successfully!`, 
                    'success'
                );
                
                // Show congratulations modal with minted character
                setCongratulationsCharacter(character);
                setShowCongratulationsModal(true);
            } else {
                throw new Error(result.error || 'Minting failed');
            }
        } catch (error) {
            console.error('NFT minting error:', error);
            onNotification?.(`❌ NFT minting failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setIsMinting(false);
        }
    };



    // Using the consolidated hook from above





    const handleCharacterPress = (character: Character) => {
        setSelectedCharacter(character);
        setShowCharacterModal(true);
    };

    const closeCharacterModal = () => {
        setShowCharacterModal(false);
        setSelectedCharacter(null);
    };

    const closeCongratulationsModal = () => {
        setShowCongratulationsModal(false);
        setCongratulationsCharacter(null);
    };

    const handleMintCharacter = () => {
        if (congratulationsCharacter) {
            console.log('🎉 Character minted successfully:', congratulationsCharacter.name);
            
            closeCongratulationsModal();
            
            // Navigate to congratulations screen or back to welcome
            if (onGoToCongratulations) {
                onGoToCongratulations(congratulationsCharacter);
            } else {
                onBack(); // Fallback to back
            }
        }
    };

    return (
        <>
            <WalletButton
                connected={connected}
                publicKey={publicKey?.toString() || null}
                onConnect={connectWallet}
                onDisconnect={disconnect}
            />
            <InnerScreen
                onLeftButtonPress={undefined}
                onCenterButtonPress={undefined}
                onRightButtonPress={undefined}
                leftButtonText=""
                centerButtonText=""
                rightButtonText=""
                centerButtonDisabled={true}
                rightButtonDisabled={true}
                leftButtonDisabled={true}
                isSelectionPage={true}
                overlayMode={true}
                showCloseButton={true}
                onCloseButtonPress={onBack}
            >
            {/* Main Display Area */}
            <View style={styles.mainDisplayArea}>
                <Image source={require('../../assets/images/screen bg.png')} style={styles.backgroundImage as any} resizeMode="cover" />
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
                            const scrollIndex = Math.round(offsetX / CARD_WIDTH);
                            const actualIndex = Math.max(0, Math.min(scrollIndex, CHARACTERS.length - 1));
                            setCurrentCharacterIndex(actualIndex);
                        }}
                    >
                        {CHARACTERS.map((character, index) => {
                            return (
                            <TouchableOpacity
                                key={`${character.id}-${index}`}
                                style={[
                                    styles.slotMachineCard,
                                    { 
                                        marginHorizontal: 10
                                    }
                                ]}
                                onPress={() => {
                                    handleCharacterPress(character);
                                }}
                            >


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
                                    ] as any}
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
                                    style={styles.modalCharacterImage as any}
                                    resizeMode="contain"
                                />
                                
                                <Text style={styles.modalCharacterName}>{selectedCharacter.name}</Text>
                                
                                <Text style={styles.modalDescription}>{selectedCharacter.description}</Text>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Congratulations Modal */}
            <Modal
                visible={showCongratulationsModal}
                transparent={true}
                animationType="fade"
                onRequestClose={closeCongratulationsModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {congratulationsCharacter && (
                            <>
                                <TouchableOpacity
                                    style={styles.modalCloseButton}
                                    onPress={closeCongratulationsModal}
                                >
                                    <Text style={styles.modalCloseText}>✕</Text>
                                </TouchableOpacity>
                                
                                <Text style={styles.congratulationsTitle}>🎉 Congratulations! 🎉</Text>
                                
                                <Image
                                    source={getImageSource(congratulationsCharacter.image)}
                                    style={styles.modalCharacterImage as any}
                                    resizeMode="contain"
                                />
                                
                                <Text style={styles.modalCharacterName}>{congratulationsCharacter.name}</Text>
                                
                                <Text style={styles.modalDescription}>{congratulationsCharacter.description}</Text>
                                
                                <TouchableOpacity
                                    style={styles.mintButton}
                                    onPress={handleMintCharacter}
                                >
                                    <Text style={styles.mintButtonText}>Continue</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </InnerScreen>
        </>
    );
};

const styles = StyleSheet.create({
    mainDisplayArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        position: 'absolute' as const,
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
        backgroundColor: '#E8F5E8',
        borderRadius: 10,
        marginHorizontal: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#2E5A3E',
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
    } as const,

    characterImage: {
        width: 150,
        height: 150,
        marginTop: 20,
    } as any,
    characterInfo: {
        marginBottom: -20,
        alignItems: 'center',
    },
    characterName: {
        fontSize: 16,
        color: '#2E5A3E',
        textAlign: 'center',
        fontFamily: 'PressStart2P',
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
        fontFamily: 'PressStart2P',
        transform: [{ translateX: 1 }, { translateY: 4 }],
    },

    // Modal styles
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#E8F5E8',
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
        borderRadius: 4,
        backgroundColor: '#2E5A3E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#2E5A3E',
    },
    modalCloseText: {
        fontSize: 18,
        color: '#E8F5E8',
        fontFamily: 'PressStart2P',
        transform: [{ translateY: -1 }],
    },
    modalCharacterImage: {
        width: 120,
        height: 120,
        marginBottom: 15,
    } as const,
    modalCharacterName: {
        fontSize: 22,

        color: '#2E5A3E',
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: 'PressStart2P',
    },
    modalDescription: {
        fontSize: 12,
        color: '#2E5A3E',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 15,
        fontFamily: 'PressStart2P',
    },
    congratulationsTitle: {
        fontSize: 18,
        color: '#2E5A3E',
        textAlign: 'center',
        marginBottom: 15,
        fontFamily: 'PressStart2P',
        fontWeight: 'bold',
    },
    mintButton: {
        backgroundColor: '#2E5A3E',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E8F5E8',
        marginTop: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mintButtonText: {
        color: '#E8F5E8',
        fontSize: 14,
        fontFamily: 'PressStart2P',
        fontWeight: 'bold',
    },

});

export default MoonlingSelection;