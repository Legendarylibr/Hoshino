import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, TextInput } from 'react-native';
import { useWallet } from '../contexts/WalletContext';
import InnerScreen from './InnerScreen';

// Get screen dimensions for responsive sizing
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth > 768; // Common tablet breakpoint

interface Props {
    onContinue: (playerName?: string) => void;
    connected: boolean;
    onConnectWallet?: () => void;
    playerName?: string;
}

const WelcomeScreen: React.FC<Props> = ({ onContinue, connected, onConnectWallet, playerName: storedPlayerName }) => {
    const { publicKey } = useWallet();
    
    const [currentPhase, setCurrentPhase] = useState<'intro' | 'introNo' | 'name' | 'explanation' | 'explanationNo' | 'chooseMoonling' | 'petName' | 'final' | 'complete'>('intro');
    const [playerName, setPlayerName] = useState(storedPlayerName || '');
    const [petName, setPetName] = useState('');
    const [dialogIndex, setDialogIndex] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState<'yes' | 'no'>('yes');

    // Dialog content for each phase
    const dialogs = {
        intro: [
            "Uggggghhhh... Oh?",
            "Hi! My name is Hoshino, I'm a little in trouble right now... Do you want to help me?"
        ],
        introNo: [
            "O-ok...",
            "...",
            "Are you sure? :frowning:"
        ],
        name: [
            "Ohhhh thank you! But first, what's your name?"
        ],
        explanation: [
            "Amazing, " + playerName + "! Let me explain.",
            "I was on a long travel and I couldn't find a safe area for me to rest,",
            "I was sooo tired and at some point I...",
            "I...",
            "zzzzz...",
            "zzzzzzzzzzzzz...",
            "Until...",
            "**CRASHHHH KABOOOOMMMMM**",
            "**FGSHSHDGJQNDBZBSBOCZZZZ**",
            "**I HIT THE MOON!!!**",
            "I did a mess, it wasn't my intention I swear!",
            "But the problem doesn't finish here...",
            "Since the crash, some tiny creatures started emerging from the crater I made.",
            "I don't know what to do with them, is it ok if I send you one every new **Moon Cycle**?"
        ],
        explanationNo: [
            "O-ok...",
            "I saw one that was so cute I thought you would have loved it but...",
            "You sure?"
        ],

        chooseMoonling: [
            "Choose your and mint your moonling!"
        ],
        petName: [
            "**Woo-hoooo!** Fantastic choice! Now let's chose a name for it, what's it gonna be?"
        ],
        final: [
            "Yay! That's a nice name cheeky! From today, you will be its **guardian**.",
            "Now hear me out. Your goal is to keep its mood maxxed out every day. To do so, you need to perform some actions daily: you can feed, chat, play, put to sleep and let it meet its friends.",
            "At the end of the Moon Cycle, you and your pet will part ways. It will ascend back to the moon, where it belongs, changed by the way you treated it. Take good care of it and it will reward you nicely.",
            "See you in 28 days!"
        ]
    };

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
                }, 500);
            }
        }
    }, [storedPlayerName, connected, onContinue]);

    // Auto-continue after wallet connects and name is provided
    useEffect(() => {
        if (connected && currentPhase === 'complete' && playerName.trim().length > 0) {
            console.log('📱 WelcomeScreen: Auto-continuing after name entry');
            setTimeout(() => {
                onContinue(playerName);
            }, 1000);
        }
    }, [connected, currentPhase, onContinue, playerName]);

    const handleDialogClick = () => {
        if (dialogIndex < dialogs[currentPhase].length - 1) {
            setDialogIndex(prev => prev + 1);
        } else {
            // Move to next phase
            switch (currentPhase) {
                case 'intro':
                    // Will be handled by button choice
                    break;
                case 'introNo':
                    // Will be handled by button choice
                    break;
                case 'name':
                    setCurrentPhase('explanation');
                    break;
                case 'explanation':
                    // Will be handled by button choice
                    break;
                case 'explanationNo':
                    // Will be handled by button choice
                    break;
                case 'chooseMoonling':
                    // Go to moonling selection screen
                    onContinue(playerName);
                    break;
                case 'petName':
                    setCurrentPhase('final');
                    break;
                case 'final':
                    setCurrentPhase('complete');
                    break;
            }
            setDialogIndex(0);
        }
    };

    const handleYesClick = () => {
        if (currentPhase === 'intro') {
            setCurrentPhase('name');
            setDialogIndex(0);
        } else if (currentPhase === 'introNo') {
            setCurrentPhase('introNo');
            setDialogIndex(0);
        } else if (currentPhase === 'explanation') {
            setCurrentPhase('chooseMoonling');
            setDialogIndex(0);
        } else if (currentPhase === 'explanationNo') {
            setCurrentPhase('explanationNo');
            setDialogIndex(0);
        }
    };

    const handleNoClick = () => {
        if (currentPhase === 'intro') {
            setCurrentPhase('introNo');
            setDialogIndex(0);
        } else if (currentPhase === 'introNo') {
            setCurrentPhase('name');
            setDialogIndex(0);
        } else if (currentPhase === 'explanation') {
            setCurrentPhase('explanationNo');
            setDialogIndex(0);
        } else if (currentPhase === 'explanationNo') {
            setCurrentPhase('chooseMoonling');
            setDialogIndex(0);
        }
    };

    const handleNameSubmit = () => {
        if (playerName.trim().length > 0) {
            setCurrentPhase('explanation');
            setDialogIndex(0);
        }
    };

    const handlePetNameSubmit = () => {
        if (petName.trim().length > 0) {
            setCurrentPhase('final');
            setDialogIndex(0);
        }
    };

    const getCurrentDialog = () => {
        if (currentPhase === 'name') {
            return "Ohhhh thank you! But first, what's your name?";
        } else if (currentPhase === 'petName') {
            return "**Woo-hoooo!** Fantastic choice! Now let's chose a name for it, what's it gonna be?";
        } else if (currentPhase === 'explanation') {
            return dialogs.explanation[dialogIndex];
        } else if (currentPhase === 'final') {
            return dialogs.final[dialogIndex];
        } else {
            return dialogs[currentPhase]?.[dialogIndex] || "";
        }
    };

    const showYesNoButtons = (currentPhase === 'intro' && dialogIndex === dialogs.intro.length - 1) || 
                            (currentPhase === 'introNo' && dialogIndex === dialogs.introNo.length - 1) ||
                            (currentPhase === 'explanation' && dialogIndex === dialogs.explanation.length - 1) ||
                            (currentPhase === 'explanationNo' && dialogIndex === dialogs.explanationNo.length - 1);
    const showNameInput = currentPhase === 'name';
    const showPetNameInput = currentPhase === 'petName';
    const showChoiceDialog = showYesNoButtons;

    const handleLeftButton = () => {
        if (showChoiceDialog) {
            setSelectedChoice('yes');
        } else if (showNameInput || showPetNameInput) {
            if (showNameInput) {
                handleNameSubmit();
            } else if (showPetNameInput) {
                handlePetNameSubmit();
            }
        } else {
            handleDialogClick();
        }
    };

    const handleRightButton = () => {
        if (showChoiceDialog) {
            setSelectedChoice('no');
        } else if (showNameInput || showPetNameInput) {
            if (showNameInput) {
                handleNameSubmit();
            } else if (showPetNameInput) {
                handlePetNameSubmit();
            }
        } else {
            handleDialogClick();
        }
    };

    const handleCenterButton = () => {
        if (showChoiceDialog) {
            if (selectedChoice === 'yes') {
                handleYesClick();
            } else {
                handleNoClick();
            }
        } else if (showNameInput || showPetNameInput) {
            if (showNameInput) {
                handleNameSubmit();
            } else if (showPetNameInput) {
                handlePetNameSubmit();
            }
        } else {
            handleDialogClick();
        }
    };

    return (
        <InnerScreen
            showStatsBar={true}
            statsBarContent={
                <>
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
                </>
            }
            onLeftButtonPress={handleLeftButton}
            onCenterButtonPress={handleCenterButton}
            onRightButtonPress={handleRightButton}
            leftButtonText={showChoiceDialog ? '←' : '←'}
            centerButtonText={showChoiceDialog ? '✓' : '✓'}
            rightButtonText={showChoiceDialog ? '→' : '→'}
            centerButtonDisabled={(showNameInput && playerName.trim().length === 0) || (showPetNameInput && petName.trim().length === 0)}
        >
            {currentPhase !== 'name' && currentPhase !== 'petName' && (
                <TouchableOpacity style={styles.storySection} onPress={handleDialogClick}>
                    <View style={styles.storyCharacterCentered}>
                        <Image
                            source={require('../../assets/images/hoshino star.png')}
                            style={styles.starCharacterImage}
                        />
                    </View>

                    <View style={styles.storyDialogBottom}>
                        <View style={styles.storyDialogueLargeBox}>
                            <View style={styles.storyDialogueInnerBox}>
                                <Text style={styles.storyTextLarge}>
                                    {getCurrentDialog()}
                                </Text>
                                {showChoiceDialog && (
                                    <View style={styles.choiceContainer}>
                                        <Text style={[styles.choiceText, selectedChoice === 'yes' && styles.selectedChoice]}>
                                            YES
                                        </Text>
                                        <Text style={styles.choiceText}>  </Text>
                                        <Text style={[styles.choiceText, selectedChoice === 'no' && styles.selectedChoice]}>
                                            NO
                                        </Text>
                                    </View>
                                )}
                                {!showYesNoButtons && (
                                    <Text style={styles.storyPromptLarge}>
                                        Tap to continue...
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            )}

            {showNameInput && (
                <>
                    <View style={styles.eyesSection}>
                        <Image
                            source={require('../../assets/images/eyes.png')}
                            style={styles.eyesImage}
                        />
                    </View>

                    <View style={styles.nameInputSection}>
                        <View style={styles.nameInputContainer}>
                            <View style={styles.nameInputTop}>
                                <Text style={styles.namePrompt}>Enter your name!</Text>
                                <View style={styles.nameDisplayContainer}>
                                    <View style={styles.nameInputOuterBox}>
                                        <View style={styles.nameInputInnerBox}>
                                            <Text style={styles.nameDisplay}>
                                                {playerName.padEnd(8, '*')}
                                            </Text>
                                            <TextInput
                                                style={styles.hiddenInput}
                                                value={playerName}
                                                onChangeText={setPlayerName}
                                                placeholder=""
                                                maxLength={8}
                                                autoFocus={true}
                                                onSubmitEditing={handleNameSubmit}
                                                returnKeyType="done"
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </>
            )}

            {showPetNameInput && (
                <>
                    <View style={styles.eyesSection}>
                        <Image
                            source={require('../../assets/images/eyes.png')}
                            style={styles.eyesImage}
                        />
                    </View>

                    <View style={styles.nameInputSection}>
                        <View style={styles.nameInputContainer}>
                            <View style={styles.nameInputTop}>
                                <Text style={styles.namePrompt}>Enter pet name!</Text>
                                <View style={styles.nameDisplayContainer}>
                                    <View style={styles.nameInputOuterBox}>
                                        <View style={styles.nameInputInnerBox}>
                                            <Text style={styles.nameDisplay}>
                                                {petName.padEnd(8, '*')}
                                            </Text>
                                            <TextInput
                                                style={styles.hiddenInput}
                                                value={petName}
                                                onChangeText={setPetName}
                                                placeholder=""
                                                maxLength={8}
                                                autoFocus={true}
                                                onSubmitEditing={handlePetNameSubmit}
                                                returnKeyType="done"
                                            />
                                        </View>
                                    </View>
                                </View>
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
        </InnerScreen>
    );
};

const styles = StyleSheet.create({
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
    storyDialogBottom: {
        width: '100%',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    storyDialogueLargeBox: {
        backgroundColor: '#E8F5E8', // Light pastel green background
        padding: 20, // Increased padding for less cramped look
        borderRadius: 8, // Less rounded for more pixelated look
        borderWidth: 3,
        borderColor: '#2E5A3E', // Dark green outer border
        // Softer inner border effect
        shadowColor: '#4A7A5A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 1,
        elevation: 1,
        // Fixed size dialog box
        width: isTablet ? 400 : 300,
        height: isTablet ? 140 : 120, // Increased height to prevent clipping
        alignSelf: 'center',
        // Create inner border with minimal padding
        paddingLeft: 3,
        paddingRight: 3,
        paddingTop: 3,
        paddingBottom: 3,
    },
    storyDialogueInnerBox: {
        backgroundColor: '#E8F5E8',
        padding: 15, // Increased padding
        borderRadius: 6, // Less rounded for more pixelated look
        borderWidth: 2,
        borderColor: '#4A7A5A', // Inner border color
        width: '100%',
        height: '100%',
        justifyContent: 'flex-start', // Changed to flex-start to bring content up
        paddingTop: 20, // Add top padding for spacing
    },
    storySpeakerLarge: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#2E5A3E', // Dark green text
        marginBottom: 5,
    },
    storyTextLarge: {
        fontSize: 14,
        color: '#2E5A3E', // Dark green text
        lineHeight: 20,
    },
    storyPromptLarge: {
        fontSize: 12,
        color: '#4A7A5A', // Medium green for subtle text
        marginTop: 5,
        fontStyle: 'italic',
    },
    starCharacterSection: {
        height: isTablet ? 450 : 350,
        justifyContent: 'center',
        alignItems: 'center',
    },
    starCharacterImage: {
        width: isTablet ? 250 : 200,
        height: isTablet ? 250 : 200,
        resizeMode: 'contain',
        marginLeft: -3,
    },
    eyesSection: {
        height: isTablet ? 120 : 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eyesImage: {
        width: isTablet ? 150 : 100,
        height: isTablet ? 75 : 50,
        resizeMode: 'contain',
    },
    nameInputSection: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },
    nameInputContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameInputTop: {
        alignItems: 'center',
        width: '100%',
    },
    namePrompt: {
        fontSize: isTablet ? 22 : 18,
        marginBottom: 20,
        textAlign: 'center',
    },
    nameDisplayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 300,
        position: 'relative',
    },
    nameDisplay: {
        fontSize: isTablet ? 28 : 24,
        textAlign: 'center',
        color: '#2E5A3E', // Dark teal text to match border
        letterSpacing: 5,
        width: '100%',
    },
    hiddenInput: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        zIndex: 1,
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
        fontSize: isTablet ? 28 : 24,
        marginBottom: 10,
    },
    transitionText: {
        fontSize: isTablet ? 18 : 16,
    },
    nameInputOuterBox: {
        width: '80%',
        maxWidth: 250,
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#2E5A3E', // Dark teal outer border
        borderRadius: 6, // Less rounded for more pixelated look
        padding: 3, // Small padding for inner border
        backgroundColor: '#E8F5E8', // Off-white background between borders
    },
    nameInputInnerBox: {
        backgroundColor: '#E8F5E8',
        padding: 12,
        borderRadius: 4, // Less rounded for more pixelated look
        borderWidth: 2,
        borderColor: '#4A7A5A', // Medium teal inner border
        width: '100%',
        height: 50, // Fixed height to make it smaller
        justifyContent: 'center',
        alignItems: 'center',
    },
    choiceContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 0, // Reduced spacing from dialog text
    },
    choiceText: {
        fontSize: 16,
        color: '#4A7A5A', // Medium green for choice text
        marginHorizontal: 30, // Increased horizontal spacing instead of gap
    },
    selectedChoice: {
        color: '#2E5A3E', // Dark green for selected choice
        textDecorationLine: 'underline',
        textDecorationColor: '#2E5A3E', // Dark green underline
    },
});

export default WelcomeScreen;