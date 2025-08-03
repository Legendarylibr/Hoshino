import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useWallet } from '../contexts/WalletContext';

interface Props {
    onContinue: (playerName?: string) => void;
    connected: boolean;
    onConnectWallet?: () => void;
    playerName?: string; // Add playerName prop for stored names
}

const WelcomeScreen: React.FC<Props> = ({ onContinue, connected, onConnectWallet, playerName: storedPlayerName }) => {
    const { publicKey } = useWallet();
    
    const [currentPhase, setCurrentPhase] = useState<'story' | 'name' | 'complete'>('story');
    const [playerName, setPlayerName] = useState(storedPlayerName || '');
    const [cursorPosition, setCursorPosition] = useState(0);
    const [isLowercase, setIsLowercase] = useState(false);
    const [selectedKey, setSelectedKey] = useState({ row: 0, col: 0 });
    const [storyTextIndex, setStoryTextIndex] = useState(0);

    // Story content
    const storyParts = [
        "Long ago, Hoshino was a little star dancing through the cosmos...",
        "One day, she slipped out of orbit and accidentally hit the Moon.",
        "The impact left a glowing crater on the lunar surface...",
        "From this magical crater, tiny creatures began emerging.",
        "To make up for the damage done, every new moon cycle...",
        "...Hoshino sends one creature down for you to take care of.",
        "When the moon cycle ends at the full moon, your creature will ascend back...",
        "...changed forever by how you cared for it. Will you be their guardian?",
        "Your cosmic journey begins now! First, tell me your name..."
    ];

    // Update local state when stored player name changes
    useEffect(() => {
        if (storedPlayerName && storedPlayerName.trim().length > 0) {
            console.log('📱 WelcomeScreen: Received stored player name:', storedPlayerName);
            setPlayerName(storedPlayerName);
            // If we have a stored name and wallet is connected, auto-continue
            if (connected) {
                console.log('📱 WelcomeScreen: Auto-continuing with stored name');
                setTimeout(() => {
                    onContinue(storedPlayerName);
                }, 500); // Shorter delay for stored names
            }
        }
    }, [storedPlayerName, connected, onContinue]);

    // Auto-continue after wallet connects and name is provided
    useEffect(() => {
        if (connected && currentPhase === 'complete' && playerName.trim().length > 0) {
            console.log('📱 WelcomeScreen: Auto-continuing after name entry');
            setTimeout(() => {
                onContinue(playerName);
            }, 1000); // 1 second delay for smooth transition
        }
    }, [connected, currentPhase, onContinue, playerName]);

    // Story progression - only when wallet is not connected
    useEffect(() => {
        if (!connected && currentPhase === 'story') {
            const timer = setInterval(() => {
                setStoryTextIndex(prev => {
                    if (prev < storyParts.length - 1) {
                        return prev + 1;
                    } else {
                        setCurrentPhase('name');
                        return prev;
                    }
                });
            }, 3000); // 3 seconds between story parts

            return () => clearInterval(timer);
        }
    }, [currentPhase, connected, storyParts.length]);

    // Reset to story when wallet disconnects
    useEffect(() => {
        if (!connected) {
            setCurrentPhase('story');
            setStoryTextIndex(0);
        }
    }, [connected]);

    const keyboardLayout = [
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
        ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        ['Back.', '', 'Lowr.', '', 'Done!']
    ];

    const handleKeyPress = (key: string) => {
        if (currentPhase !== 'name' || key === '') return;

        if (key === 'Back.') {
            if (playerName.length > 0) {
                setPlayerName(prev => prev.slice(0, -1));
                setCursorPosition(prev => Math.max(0, prev - 1));
            }
        } else if (key === 'Lowr.') {
            setIsLowercase(!isLowercase);
        } else if (key === 'Done!') {
            if (playerName.trim().length > 0) {
                setCurrentPhase('complete');
            }
        } else if (playerName.length < 8) { // Max 8 characters
            const letter = isLowercase ? key.toLowerCase() : key;
            setPlayerName(prev => prev + letter);
            setCursorPosition(prev => prev + 1);
        }
    };

    const handleStoryClick = () => {
        if (currentPhase === 'story') {
            if (storyTextIndex < storyParts.length - 1) {
                setStoryTextIndex(prev => prev + 1);
            } else {
                setCurrentPhase('name');
            }
        }
    };

    const getDisplayName = () => {
        const display = playerName.padEnd(8, '*');
        return display.split('').map((char, index) =>
            char === '*' ? '*' : char
        ).join('');
    };

    return (
        <View style={styles.tamagotchiScreenContainer}>
            <View style={styles.cosmicMoon} />

            <View style={styles.tamagotchiTopStatus}>
                <Text style={styles.walletStatusText}>
                    {connected ? '[connected wallet]' : 'Welcome to Hoshino 2025'}
                </Text>
            </View>

            <Image source={require('../../assets/images/logo_final.png')} style={styles.hoshinoTitle} />

            <View style={styles.tamagotchiMainScreen}>
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Welcome</Text>
                        <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Stars</Text>
                        <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>2025</Text>
                        <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                    </View>
                </View>

                <View style={styles.mainDisplayArea}>
                    <Image source={require('../../assets/images/screen bg.png')} style={styles.backgroundImage} resizeMode="cover" />
                    {currentPhase === 'story' && (
                        <TouchableOpacity style={styles.storySection} onPress={handleStoryClick}>
                            <View style={styles.storyCharacterCentered}>
                                <Image
                                    source={require('../../assets/images/hoshino star.png')}
                                    style={styles.storyCharacterCenterImage}
                                />
                            </View>

                            <View style={styles.storyDialogBottom}>
                                <View style={styles.storyDialogueLargeBox}>
                                    <Text style={styles.storySpeakerLarge}>Hoshino:</Text>
                                    <Text style={styles.storyTextLarge}>
                                        {storyParts[storyTextIndex]}
                                    </Text>
                                    <Text style={styles.storyPromptLarge}>
                                        {storyTextIndex < storyParts.length - 1 ? 'Tap to continue...' : 'Tap to begin...'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}

                    {currentPhase === 'name' && (
                        <>
                            <View style={styles.starCharacterSection}>
                                <Image
                                    source={require('../../assets/images/hoshino star.png')}
                                    style={styles.starCharacterImage}
                                />
                            </View>

                            <View style={styles.nameInputSection}>
                                <View style={styles.nameInputContainer}>
                                    <View style={styles.customEyes}>
                                        <Image
                                            source={require('../../assets/images/eyes.png')}
                                            style={styles.pixelEyes}
                                        />
                                    </View>
                                    <View style={styles.nameInputTop}>
                                        <Text style={styles.namePrompt}>Enter your name!</Text>
                                        <Text style={styles.nameDisplay}>{getDisplayName()}</Text>
                                    </View>

                                    <View style={styles.virtualKeyboard}>
                                        {keyboardLayout.map((row, rowIndex) => (
                                            <View key={rowIndex} style={styles.keyboardRow}>
                                                {row.map((key, colIndex) => (
                                                    <TouchableOpacity
                                                        key={colIndex}
                                                        style={[
                                                            styles.keyboardKey,
                                                            selectedKey.row === rowIndex && selectedKey.col === colIndex ? styles.selected : {},
                                                            key === '' ? styles.invisible : {},
                                                        ]}
                                                        onPress={() => {
                                                            if (key !== '') {
                                                                setSelectedKey({ row: rowIndex, col: colIndex });
                                                                handleKeyPress(key);
                                                            }
                                                        }}
                                                    >
                                                        <Text>{key}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </>
                    )}

                    {currentPhase === 'complete' && (
                        <View style={styles.completeSection}>
                            <View style={styles.starCharacterSection}>
                                <Image
                                    source={require('../../assets/images/hoshino star.png')}
                                    style={styles.starCharacterImage}
                                />
                            </View>
                            <View style={styles.completionMessage}>
                                <Text style={styles.welcomePlayer}>Welcome, {playerName}!</Text>
                                <Text style={styles.transitionText}>
                                    {connected ? 'Entering the cosmic realm...' : 'Please connect your Solflare wallet to continue'}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            {currentPhase !== 'story' && (
                <View style={styles.walletConnectionSection}>
                    <TouchableOpacity
                        style={styles.walletConnectButton}
                        onPress={onConnectWallet}
                    >
                        <Text>
                            {connected && publicKey
                                ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
                                : 'Connect Solflare Wallet'
                            }
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    tamagotchiScreenContainer: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        padding: 20,
    },
    cosmicMoon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'white',
        opacity: 0.5,
        position: 'absolute',
        top: 50,
        right: 50,
    },
    tamagotchiTopStatus: {
        width: '100%',
        height: 40,
        backgroundColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
    },
    walletStatusText: {
        color: 'white',
        fontSize: 18,
    },
    hoshinoTitle: {
        width: 250,
        height: 100,
        resizeMode: 'contain',
        marginVertical: 20,
    },
    tamagotchiMainScreen: {
        width: '100%',
        flex: 1,
        backgroundColor: 'darkgray',
        borderRadius: 20,
        overflow: 'hidden',
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: 'black',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        color: 'white',
        fontSize: 12,
    },
    starRating: {
        color: 'yellow',
        fontSize: 12,
    },
    mainDisplayArea: {
        flex: 1,
    },
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    storySection: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    storyCharacterCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyCharacterCenterImage: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    storyDialogBottom: {
        width: '100%',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    storyDialogueLargeBox: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
    },
    storySpeakerLarge: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    storyTextLarge: {
        fontSize: 14,
    },
    storyPromptLarge: {
        fontSize: 12,
        color: 'gray',
    },
    starCharacterSection: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    starCharacterImage: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    nameInputSection: {
        flex: 1,
        padding: 10,
    },
    nameInputContainer: {
        flex: 1,
    },
    customEyes: {
        alignItems: 'center',
        marginBottom: 10,
    },
    pixelEyes: {
        width: 100,
        height: 50,
        resizeMode: 'contain',
    },
    nameInputTop: {
        alignItems: 'center',
        marginBottom: 10,
    },
    namePrompt: {
        fontSize: 18,
        marginBottom: 5,
    },
    nameDisplay: {
        fontSize: 24,
        letterSpacing: 5,
    },
    virtualKeyboard: {
        flexDirection: 'column',
    },
    keyboardRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 5,
    },
    keyboardKey: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lightgray',
        margin: 2,
        borderRadius: 5,
    },
    selected: {
        backgroundColor: 'gray',
    },
    invisible: {
        opacity: 0,
    },
    completeSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    completionMessage: {
        alignItems: 'center',
        padding: 20,
    },
    welcomePlayer: {
        fontSize: 24,
        marginBottom: 10,
    },
    transitionText: {
        fontSize: 16,
    },
    walletConnectionSection: {
        marginTop: 20,
        width: '100%',
    },
    walletConnectButton: {
        backgroundColor: 'blue',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
});

export default WelcomeScreen;