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
                            <Text style={styles.characterStatus}>Ready to chat!</Text>
                        </View>
                    )}
                </View>

                {/* Chat Interface - Only show when toggled on */}
                {showChat && (
                    <View style={styles.chatContainer}>
                        {/* Chat Header */}
                        <View style={styles.chatHeader}>
                            <Text style={styles.chatHeaderText}>Chatting with {character.name}</Text>
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
                                    <Text style={styles.messageText}>{message.text}</Text>
                                </View>
                            ))}

                            {isThinking && (
                                <View style={styles.thinkingMessage}>
                                    <Text style={styles.thinkingText}>{character.name} is thinking...</Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Input Area */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder={`Message ${character.name}...`}
                                placeholderTextColor="#999"
                                multiline
                                maxLength={200}
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                                onPress={sendMessage}
                                disabled={!inputText.trim() || isThinking}
                            >
                                <Text style={styles.sendButtonText}>Send</Text>
                            </TouchableOpacity>
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
    },
    characterName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    characterStatus: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
    },
    chatContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderRadius: 10,
        padding: 8,
        zIndex: 10,
    },
    chatHeader: {
        backgroundColor: 'rgba(128, 0, 32, 0.9)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    chatHeaderText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 4,
    },
    message: {
        marginVertical: 4,
        padding: 10,
        borderRadius: 8,
        maxWidth: '85%',
    },
    userMessage: {
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
        alignSelf: 'flex-end',
    },
    characterMessage: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 14,
        color: 'white',
        lineHeight: 18,
    },
    thinkingMessage: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginVertical: 4,
    },
    thinkingText: {
        fontSize: 14,
        color: 'white',
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        alignItems: 'flex-end',
        marginTop: 8,
    },
    textInput: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        color: 'black',
        fontSize: 14,
        maxHeight: 80,
    },
    sendButton: {
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});

export default CharacterChat;