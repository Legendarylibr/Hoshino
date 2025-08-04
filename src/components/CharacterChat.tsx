import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import InnerScreen from './InnerScreen';

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

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'character';
    timestamp: Date;
}

interface Props {
    character: Character;
    onExit: () => void;
    playerName?: string;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const CharacterChat = ({ character, onExit, playerName, onNotification }: Props) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const messagesEndRef = useRef<ScrollView>(null);

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

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        messagesEndRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    // Generate character response based on input
    const generateCharacterResponse = async (userInput: string): Promise<string> => {
        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const responses = [
            `Oh, that's interesting! Tell me more about that, ${playerName || 'friend'}!`,
            `Hmm, I see what you mean. That's quite fascinating!`,
            `I love talking with you! You always have such interesting things to say.`,
            `That reminds me of something... *thinks deeply*`,
            `You know, you're really special to me. I'm so glad we can chat like this!`,
            `*nods thoughtfully* That's a great point!`,
            `I feel like I understand you better now. Thank you for sharing that with me.`,
            `You're absolutely right! I never thought about it that way before.`,
            `This conversation is making me so happy! 🌟`,
            `I wish we could talk like this forever! You're the best companion ever!`
        ];

        // Add character-specific responses
        if (character.name === 'Lyra') {
            responses.push(
                `*adjusts anime hair* Oh my gosh, that's just like in that one anime!`,
                `You know what this reminds me of? There's this amazing anime where...`,
                `*dramatic anime pose* This is giving me major protagonist energy!`,
                `Wait, wait, wait! This is totally like that scene from... *starts rambling about anime*`
            );
        } else if (character.name === 'Orion') {
            responses.push(
                `*gazes at the stars* The cosmos speak to me, and they agree with you.`,
                `In the grand scheme of the universe, what you're saying makes perfect sense.`,
                `*mystical aura intensifies* I sense great wisdom in your words.`,
                `The moon and stars align with your thoughts tonight.`
            );
        } else if (character.name === 'Aro') {
            responses.push(
                `*radiates with celestial energy* Your words are like starlight to my soul!`,
                `*sparkles with excitement* That's absolutely brilliant!`,
                `You're making me glow with happiness! ✨`,
                `*bounces with energy* I love your perspective on this!`
            );
        } else if (character.name === 'Sirius') {
            responses.push(
                `*stands tall with determination* Your words carry the strength of a thousand suns!`,
                `*fierce loyalty in eyes* I will remember this conversation forever.`,
                `You speak with the wisdom of the ancients. I am honored.`,
                `*radiates powerful energy* Your thoughts are as bright as my namesake star!`
            );
        } else if (character.name === 'Zaniah') {
            responses.push(
                `*contemplates with ancient wisdom* Your words echo through the cosmic void...`,
                `*ethereal presence intensifies* There is great depth in what you say.`,
                `*whispers mysteriously* The stars have whispered of this moment...`,
                `*quietly powerful* Your perspective transcends the ordinary.`
            );
        }

        return responses[Math.floor(Math.random() * responses.length)];
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsThinking(true);

        try {
            const characterResponse = await generateCharacterResponse(inputText);

            const characterMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: characterResponse,
                sender: 'character',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, characterMessage]);
        } catch (error) {
            console.error('Error generating response:', error);
            onNotification?.('❌ Failed to generate response', 'error');
        } finally {
            setIsThinking(false);
        }
    };

    const toggleChat = () => {
        setShowChat(!showChat);
    };

    return (
        <InnerScreen
            onLeftButtonPress={onExit}
            onCenterButtonPress={toggleChat}
            onRightButtonPress={() => onNotification?.('💬 Chat Tips: Ask questions, share thoughts, or just chat naturally!', 'info')}
            leftButtonText="←"
            centerButtonText={showChat ? "Hide" : "Chat"}
            rightButtonText="?"
        >
            {/* Main Display Area - Always show character, optionally overlay chat */}
            <View style={styles.container}>
                {/* Character Display - Always visible */}
                <View style={styles.characterDisplay}>
                    <Image
                        source={getImageSource(character.image)}
                        style={styles.characterImage}
                    />
                    {!showChat && (
                        <View style={styles.characterInfo}>
                            <Text style={styles.characterName}>{character.name}</Text>
                            <Text style={styles.characterStatus}>READY TO CHAT!</Text>
                        </View>
                    )}
                </View>

                {/* Chat Interface - Only show when toggled on */}
                {showChat && (
                    <View style={styles.chatContainer}>
                        {/* Scan Lines Effect */}
                        <View style={styles.scanLines} />

                        {/* Chat Header */}
                        <View style={styles.chatHeader}>
                            <View style={styles.headerBorder}>
                                <Text style={styles.chatHeaderText}>CHATTING WITH {character.name.toUpperCase()}</Text>
                            </View>
                        </View>

                        {/* Messages Area */}
                        <ScrollView
                            style={styles.messagesContainer}
                            ref={messagesEndRef}
                            contentContainerStyle={{ paddingBottom: 10 }}
                        >
                            {messages.map((message) => (
                                <View
                                    key={message.id}
                                    style={[
                                        styles.message,
                                        message.sender === 'user' ? styles.userMessage : styles.characterMessage
                                    ]}
                                >
                                    <View style={styles.messageBorder}>
                                        <Text style={[
                                            styles.messageText,
                                            message.sender === 'user' ? styles.userMessageText : styles.characterMessageText
                                        ]}>
                                            {message.text}
                                        </Text>
                                    </View>
                                </View>
                            ))}

                            {isThinking && (
                                <View style={styles.thinkingMessage}>
                                    <View style={styles.thinkingBorder}>
                                        <Text style={styles.thinkingText}>
                                            {character.name.toUpperCase()} IS THINKING...
                                        </Text>
                                        <Text style={styles.thinkingDots}>• • •</Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Input Area */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputBorder}>
                                <TextInput
                                    style={styles.textInput}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    placeholder={`MESSAGE ${character.name.toUpperCase()}...`}
                                    placeholderTextColor="#00FF00"
                                    multiline
                                    maxLength={200}
                                />
                                <TouchableOpacity
                                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                                    onPress={sendMessage}
                                    disabled={!inputText.trim() || isThinking}
                                >
                                    <View style={styles.sendButtonBorder}>
                                        <Text style={styles.sendButtonText}>SEND</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </InnerScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    characterDisplay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    characterImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    characterInfo: {
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#000000',
        borderWidth: 2,
        borderColor: '#00FF00',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    characterName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00FF00',
        marginBottom: 2,
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    characterStatus: {
        fontSize: 12,
        color: '#FFFF00',
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    chatContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000',
        borderWidth: 3,
        borderColor: '#333333',
        padding: 4,
        zIndex: 10,
    },
    scanLines: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        opacity: 0.1,
        // Create scan line effect with linear gradient would go here in web
        // For React Native, we'll use a subtle overlay
        borderWidth: 0,
    },
    chatHeader: {
        marginBottom: 6,
    },
    headerBorder: {
        backgroundColor: '#001100',
        borderWidth: 2,
        borderColor: '#00FF00',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    chatHeaderText: {
        color: '#00FF00',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 4,
    },
    message: {
        marginVertical: 3,
        maxWidth: '85%',
    },
    userMessage: {
        alignSelf: 'flex-end',
    },
    characterMessage: {
        alignSelf: 'flex-start',
    },
    messageBorder: {
        borderWidth: 2,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    messageText: {
        fontSize: 13,
        lineHeight: 16,
        fontFamily: 'monospace',
    },
    userMessageText: {
        color: '#FFFF00',
    },
    characterMessageText: {
        color: '#00FF00',
    },
    thinkingMessage: {
        alignSelf: 'flex-start',
        marginVertical: 3,
    },
    thinkingBorder: {
        borderWidth: 2,
        borderColor: '#FF00FF',
        backgroundColor: '#110011',
        paddingHorizontal: 10,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    thinkingText: {
        fontSize: 12,
        color: '#FF00FF',
        fontFamily: 'monospace',
        letterSpacing: 1,
        flex: 1,
    },
    thinkingDots: {
        fontSize: 16,
        color: '#FF00FF',
        fontFamily: 'monospace',
        marginLeft: 8,
    },
    inputContainer: {
        marginTop: 6,
    },
    inputBorder: {
        borderWidth: 2,
        borderColor: '#00FF00',
        backgroundColor: '#001100',
        padding: 6,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#000000',
        borderWidth: 1,
        borderColor: '#333333',
        paddingHorizontal: 8,
        paddingVertical: 6,
        marginRight: 6,
        color: '#00FF00',
        fontSize: 12,
        fontFamily: 'monospace',
        maxHeight: 60,
        minHeight: 32,
    },
    sendButton: {
        minWidth: 50,
    },
    sendButtonBorder: {
        backgroundColor: '#003300',
        borderWidth: 2,
        borderColor: '#00FF00',
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonText: {
        color: '#00FF00',
        fontWeight: 'bold',
        fontSize: 12,
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});

// Add conditional styling based on message sender
const getMessageStyle = (sender: 'user' | 'character') => {
    if (sender === 'user') {
        return {
            backgroundColor: '#110011',
            borderColor: '#FFFF00',
        };
    } else {
        return {
            backgroundColor: '#001100',
            borderColor: '#00FF00',
        };
    }
};

export default CharacterChat;