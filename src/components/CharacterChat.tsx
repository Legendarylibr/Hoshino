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

    return (
        <InnerScreen
            onLeftButtonPress={onExit}
            onCenterButtonPress={() => onNotification?.('💬 Chat Help: Have a conversation with your cosmic companion!', 'info')}
            onRightButtonPress={() => onNotification?.('💬 Chat Tips: Ask questions, share thoughts, or just chat naturally!', 'info')}
            leftButtonText="←"
            centerButtonText="💬"
            rightButtonText="?"
        >
            {/* Main Display Area - Chat Interface */}
            <View style={styles.mainDisplayArea}>
                {/* Character Display Behind Chat */}
                <View style={styles.characterDisplay}>
                    <Image
                        source={getImageSource(character.image)}
                        style={styles.characterImage}
                    />
                </View>

                {/* Built-in Chat Overlay */}
                <View style={styles.builtInChatOverlay}>
                    {/* Chat Header Bar */}
                    <View style={styles.builtInChatHeader}>
                        <Text style={styles.chatHeaderText}>Chatting with {character.name}</Text>
                        <TouchableOpacity onPress={onExit} style={styles.builtInChatCloseBtn}>
                            <Text style={styles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Messages Area */}
                    <ScrollView
                        style={styles.builtInChatMessages}
                        ref={messagesEndRef}
                        contentContainerStyle={{ paddingBottom: 10 }}
                        inverted
                    >
                        {messages.map((message) => (
                            <View
                                key={message.id}
                                style={[styles.builtInChatMessage, message.sender === 'user' ? styles.user : styles.character]}
                            >
                                <Text style={styles.messageText}>{message.text}</Text>
                            </View>
                        ))}

                        {isThinking && (
                            <View style={styles.builtInChatThinking}>
                                <Text style={styles.thinkingText}>{character.name} is thinking...</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Input Area */}
                    <View style={styles.builtInChatInputArea}>
                        <TextInput
                            style={styles.builtInChatInput}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder={`Message ${character.name}...`}
                            placeholderTextColor="#999"
                            multiline
                            maxLength={1000}
                        />
                        <TouchableOpacity
                            style={[styles.builtInChatSendBtn, !inputText.trim() && styles.disabled]}
                            onPress={sendMessage}
                            disabled={!inputText.trim() || isThinking}
                        >
                            <Text style={styles.builtInChatSendText}>Send</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </InnerScreen>
    );
};

const styles = StyleSheet.create({
    mainDisplayArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    characterDisplay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.3,
        zIndex: 1, // Behind chat overlay
    },
    characterImage: {
        width: 280, // Slightly smaller to avoid overlap
        height: 280,
        resizeMode: 'contain',
    },
    builtInChatOverlay: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        bottom: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.85)', // More opaque for better readability
        borderRadius: 20,
        paddingBottom: 10,
        zIndex: 2, // Above character
    },
    builtInChatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16, // Increased padding
        backgroundColor: 'rgba(128, 0, 32, 0.9)', // More opaque burgundy top bar
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: 60, // Ensure enough height
    },
    chatHeaderText: {
        color: 'white',
        fontSize: 18, // Increased from 16
        fontWeight: 'bold',
        flex: 1, // Take available space
    },
    builtInChatCloseBtn: {
        padding: 8, // Increased padding for better touch target
        backgroundColor: '#ef4444', // Solid red background
        borderRadius: 20,
        width: 36, // Increased size
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 24, // Much larger close button text
        fontWeight: 'bold',
        lineHeight: 24,
    },
    builtInChatMessages: {
        flex: 1,
        padding: 12, // Increased padding
    },
    builtInChatMessage: {
        marginVertical: 6, // Increased spacing
        padding: 12, // Increased padding
        borderRadius: 12,
        maxWidth: '85%',
    },
    messageText: {
        fontSize: 16, // Added explicit font size
        color: 'white',
        lineHeight: 22,
    },
    user: {
        backgroundColor: 'rgba(0, 123, 255, 0.9)',
        alignSelf: 'flex-end',
    },
    character: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        alignSelf: 'flex-start',
    },
    builtInChatThinking: {
        padding: 12, // Increased padding
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginVertical: 6,
    },
    thinkingText: {
        fontSize: 16, // Added explicit font size
        color: 'white',
        fontStyle: 'italic',
    },
    builtInChatInputArea: {
        flexDirection: 'row',
        padding: 12, // Increased padding
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'flex-end', // Better alignment
    },
    builtInChatInput: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        paddingHorizontal: 16, // Increased padding
        paddingVertical: 12,
        marginRight: 12,
        color: 'black',
        fontSize: 16, // Added explicit font size
        maxHeight: 100,
        minHeight: 44, // Ensure minimum touch target
    },
    builtInChatSendBtn: {
        backgroundColor: 'rgba(0, 123, 255, 0.9)',
        paddingHorizontal: 24, // Increased padding
        paddingVertical: 12,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 44, // Ensure minimum touch target
        minWidth: 80,
    },
    builtInChatSendText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16, // Added explicit font size
    },
    disabled: {
        opacity: 0.5,
    },
});

export default CharacterChat;