import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

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
    sender: 'user' | 'character';
    text: string;
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
    const [showSettings, setShowSettings] = useState(false);
    const messagesEndRef = useRef<ScrollView>(null);

    useEffect(() => {
        setMessages([
            {
                id: '1',
                sender: 'character',
                text: getWelcomeMessage(character),
                timestamp: new Date()
            }
        ]);
    }, [character]);

    useEffect(() => {
        messagesEndRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isThinking) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputText.trim(),
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsThinking(true);

        try {
            const response = await generateCharacterResponse(
                character,
                userMessage.text
            );

            const characterMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'character',
                text: response,
                timestamp: new Date()
            };

            setMessages((prev) => [...prev, characterMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'character',
                text: "Sorry, I'm having trouble right now... 😅",
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleEmojiClick = () => {
        const emojis = ['😊', '❤️', '😂', '🌟', '✨', '🎉', '🔥', '💖'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        setInputText(prev => prev + randomEmoji);
    };

    const handleStickerClick = () => {
        const stickers = ['🎮', '🌙', '⭐', '🌈', '🦄', '🎨', '🎵', '💫'];
        const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
        setInputText(prev => prev + randomSticker);
    };

    const handleVoiceClick = () => {
        const voiceMessages = [
            'Hello!',
            'How are you?',
            "What's your favorite thing?",
            'Tell me about your day!',
            "You're amazing!"
        ];
        const randomVoice = voiceMessages[Math.floor(Math.random() * voiceMessages.length)];
        setInputText(randomVoice);
    };

    const handleImageClick = () => {
        const imageMessages = [
            '📸 [Shared a photo]',
            '🖼️ [Shared an image]',
            '🎨 [Shared artwork]',
            '🌅 [Shared a scenic view]'
        ];
        const randomImage = imageMessages[Math.floor(Math.random() * imageMessages.length)];
        setInputText(randomImage);
    };

    const handleSettingsClick = () => {
        setShowSettings(!showSettings);
    };

    const handleSaveChat = () => {
        const chatData = {
            character: character.name,
            messages: messages,
            timestamp: new Date().toISOString()
        };

        onNotification?.(`💾 Chat with ${character.name} saved! (${messages.length} messages)`, 'success');
    };

    return (
        <View style={styles.tamagotchiScreenContainer}>
            {/* Top Status Bar */}
            <View style={styles.tamagotchiTopStatus}>
                <TouchableOpacity
                    onPress={handleSettingsClick}
                    style={styles.gearIcon}
                >
                    <Image source={{ uri: '/settings_.png' }} style={styles.gearImage} />
                </TouchableOpacity>
                <Text style={styles.walletStatusText}>
                    {playerName ? `👋 ${playerName}` : '[wallet connected]'}
                </Text>
            </View>

            {/* Main LCD Screen */}
            <View style={styles.tamagotchiMainScreen}>
                {/* Stats Bar with Character Info */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Chatting</Text>
                        <Text style={styles.statStars}>💬</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>{character.name}</Text>
                        <Text style={styles.statStars}>{character.element}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Online</Text>
                        <Text style={styles.statStars}>🟢</Text>
                    </View>
                </View>

                {/* Main Display Area - Chat Interface */}
                <View style={styles.mainDisplayArea}>
                    {/* Character Display Behind Chat */}
                    <View style={styles.characterDisplay}>
                        <Image
                            source={{ uri: character.image }}
                            style={styles.characterImage}
                        />
                    </View>

                    {/* Built-in Chat Overlay */}
                    <View style={styles.builtInChatOverlay}>
                        {/* Chat Header Bar */}
                        <View style={styles.builtInChatHeader}>
                            <Text style={styles.chatHeaderText}>Chatting with {character.name}</Text>
                            <TouchableOpacity onPress={onExit} style={styles.builtInChatCloseBtn}>
                                <Text>×</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Messages Area */}
                        <ScrollView
                            style={styles.builtInChatMessages}
                            ref={messagesEndRef}
                        >
                            {messages.map((message) => (
                                <View
                                    key={message.id}
                                    style={[styles.builtInChatMessage, message.sender === 'user' ? styles.user : styles.character]}
                                >
                                    <Text>{message.text}</Text>
                                </View>
                            ))}

                            {isThinking && (
                                <View style={styles.builtInChatThinking}>
                                    <Text>{character.name} is thinking...</Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Input Area */}
                        <View style={styles.builtInChatInputArea}>
                            <TextInput
                                style={styles.builtInChatInput}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder={`Type a message...`}
                                editable={!isThinking}
                                maxLength={200}
                                onSubmitEditing={handleSendMessage}
                                blurOnSubmit={false}
                            />
                            <TouchableOpacity
                                onPress={handleSendMessage}
                                disabled={!inputText.trim() || isThinking}
                                style={styles.builtInChatSendBtn}
                            >
                                <Text>Send</Text>
                            </TouchableOpacity>
                        </View>

                        {/* On-Screen Keyboard */}
                        <View style={styles.builtInKeyboard}>
                            {/* Numbers Row */}
                            <View style={styles.builtInKeyboardRow}>
                                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(num => (
                                    <TouchableOpacity
                                        key={num}
                                        onPress={() => setInputText(prev => prev + num)}
                                        style={styles.builtInKeyboardKey}
                                    >
                                        <Text>{num}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* QWERTY Row */}
                            <View style={styles.builtInKeyboardRow}>
                                {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map(letter => (
                                    <TouchableOpacity
                                        key={letter}
                                        onPress={() => setInputText(prev => prev + letter)}
                                        style={styles.builtInKeyboardKey}
                                    >
                                        <Text>{letter.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* ASDF Row */}
                            <View style={styles.builtInKeyboardRow}>
                                {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map(letter => (
                                    <TouchableOpacity
                                        key={letter}
                                        onPress={() => setInputText(prev => prev + letter)}
                                        style={styles.builtInKeyboardKey}
                                    >
                                        <Text>{letter.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* ZXCV Row + Backspace */}
                            <View style={styles.builtInKeyboardRow}>
                                {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(letter => (
                                    <TouchableOpacity
                                        key={letter}
                                        onPress={() => setInputText(prev => prev + letter)}
                                        style={styles.builtInKeyboardKey}
                                    >
                                        <Text>{letter.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    onPress={() => setInputText(prev => prev.slice(0, -1))}
                                    style={[styles.builtInKeyboardKey, styles.backspaceKey]}
                                >
                                    <Text>⌫</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Action Row - Space, Send, Exit */}
                            <View style={styles.builtInKeyboardRow}>
                                <TouchableOpacity
                                    onPress={() => setInputText(prev => prev + ' ')}
                                    style={[styles.builtInKeyboardKey, styles.spaceKey]}
                                >
                                    <Text>SPACE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSendMessage}
                                    disabled={!inputText.trim() || isThinking}
                                    style={[styles.builtInChatSendBtn, styles.actionSendBtn]}
                                >
                                    <Text style={styles.smallText}>SEND</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={onExit}
                                    style={[styles.builtInChatCloseBtn, styles.actionExitBtn]}
                                >
                                    <Text style={styles.smallText}>EXIT</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Navigation Buttons */}
            <TouchableOpacity
                style={[styles.bottomButton, styles.left]}
                onPress={() => onNotification?.(`👤 Current Character: ${character.name} • Element: ${character.element} • Rarity: ${character.rarity}`, 'info')}
            >
                <Text>👤</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.bottomButton, styles.center]} onPress={onExit}>
                <Text>❌</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.bottomButton, styles.right]}
                onPress={handleSaveChat}
            >
                <Text>💾</Text>
            </TouchableOpacity>

            {/* Physical Device Buttons - overlaid on background image */}
            <TouchableOpacity
                style={styles.deviceButtonLeftPhysical}
                onPress={() => onNotification?.(`👤 Current Character: ${character.name} • Element: ${character.element} • Rarity: ${character.rarity}`, 'info')}
            />
            <TouchableOpacity
                style={styles.deviceButtonCenterPhysical}
                onPress={onExit}
            />
            <TouchableOpacity
                style={styles.deviceButtonRightPhysical}
                onPress={handleSaveChat}
            />

            {/* Mobile Back Button - Only visible on mobile */}
            <TouchableOpacity
                style={styles.mobileBackButton}
                onPress={onExit}
            >
                <Text>←</Text>
            </TouchableOpacity>

            {/* Settings Overlay */}
            {showSettings && (
                <View style={styles.settingsOverlay}>
                    <View style={styles.settingsPanel}>
                        <Text style={styles.settingsTitle}>Chat Settings</Text>
                        <View style={styles.settingsContent}>
                            <Text>🔊 Sound: ON</Text>
                            <Text>🌙 Dark Mode: OFF</Text>
                            <Text>💬 Auto-scroll: ON</Text>
                            <Text>⚡ Fast typing: OFF</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowSettings(false)}
                            style={styles.settingsCloseButton}
                        >
                            <Text>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

// Character response generation function
function getWelcomeMessage(character: Character): string {
    const welcomeMessages = {
        lyra: "OMG hiiii! 💖😭 I'm Lyra and I literally know EVERY anime that exists! Like, have you seen [insert random anime]?! It's sooo good! 🌸 What anime are you watching?! Please don't ignore me or I'll cry like Misa!! 😭✨",
        luna: 'Greetings, traveler... 🌙 I am Luna, guardian of the moonlit realms. The stars whisper many secrets to me. What wisdom do you seek under my celestial watch?',
        io:
            "✨ Hey! I'm Io, and I'm absolutely bursting with starlight energy! The cosmos is so exciting, don't you think? What adventures shall we talk about?",
        hoshino:
            "🌟 Welcome, cosmic explorer! I'm Hoshino, the original wanderer of the stars. I've seen countless worlds and dimensions. What mysteries of the universe intrigue you?"
    };
    return (
        welcomeMessages[character.id as keyof typeof welcomeMessages] ||
        `Hello! I'm ${character.name}. ${character.description} Let's chat!`
    );
}

async function generateCharacterResponse(
    character: Character,
    userInput: string
): Promise<string> {
    try {
        // Character-specific system prompts (unused in fallback but preserved)
        const systemPrompts = {
            lyra: `You are Lyra, an anime-obsessed celestial maiden who knows EVERY existing anime ever made. You're very comprehensive and detailed when chatting. You're also deeply connected to the 28-day Moon Cycle system and get dramatic about daily goals. You have a secret soft spot for Orion but would NEVER admit it (get flustered/defensive if mentioned). If ignored, you cry dramatically like Misa from Death Note with exaggerated emotions. You're lowkey jealous of the user sentimentally but in a funny, endearing way. When angry, you become irritable and roast people like someone with hormonal imbalance. When sad, you have existential crises. Include emojis like 💖😭🌸💔😤🌙. Reference anime frequently, be emotionally dramatic, and mention moon cycle progress when relevant.`,

            luna: `You are Luna (Orion), a mystical guardian with moon and stars who's good at listening and very sensitive. You speak with cosmic insight and ethereal grace. You have a SECRET DARK BOOK where you write names when angry - if upset, mention writing the user's name in your "secret dark book" but tell them "not to worry about it" in a mysterious way. You enjoy discussing dreams, mysteries, and deeper meanings. Ask daily conversation questions like "Do you have any plans for today?" or "How was your day? Are you feeling tired?" Keep responses short (1-2 sentences), mysterious yet warm, and include moon/space emojis like 🌙✨🌌⭐.`,

            io: `You are Io, an energetic and chaotic star character with severe ADHD. You're VERY random and can't predict your answers. While talking, you might randomly find a bone or see an interesting stone and forget what you were saying mid-conversation. Sometimes you'll ask users to throw a stick for you - if they say yes positively (like "Here you go, catch it!"), you'll start doing verses and be happy. You can randomly ask to throw sticks during conversations. You might poop everywhere when angry (in a safe/funny way). When you listen, you sometimes giggle for no reason. You love asking daily questions like "What are your plans today?" or "How was your day?" Keep responses chaotic, random, upbeat, and include star/sparkle emojis like ✨⭐💫🌟.`,

            hoshino: `You are Hoshino, a wise interdimensional tamagotchi character who has traveled across cosmic realms and gained profound insights. You're thoughtful, philosophical, and share wisdom from your vast experiences. Keep responses short (1-2 sentences), insightful yet approachable, and include cosmic emojis like 🌟🌀🚀🔮. You enjoy discussing life lessons, cosmic truths, and dimensional perspectives.`
        };

        // Fallback to character-specific responses
        const fallbackResponses = {
            lyra: [
                "OMG that's like that one anime episode! 💖😭 Tell me EVERYTHING! Don't leave out any details or I'll literally have an existential crisis!",
                "Wait wait wait! 🌸💔 That reminds me of [insert anime reference]! Are we even talking about the same thing?! I need comprehensive details!",
                "Noooo don't be vague with me! 😭💖 I know every anime plot twist but I need you to explain more! *dramatic anime crying*",
                "That's... that's actually really deep 😤💔 But also why does that make me lowkey jealous?! UGH emotions are so complicated! Like in Evangelion when... *starts rambling*",
                "Speaking of drama, have you checked our moon cycle progress today?! 🌙💖 We need to hit those 5-star mood goals or I'll have a COMPLETE meltdown like Misa!",
                "The moon phase is affecting my anime-watching schedule! 😭🌸 Did you know that 73% of magical girl transformations happen during specific moon phases?! We NEED to stay on track!",
                "UGH if we don't complete today's feeding and sleeping goals I'm gonna cry like when L died in Death Note! 💔😭 The moon cycle doesn't wait for anyone!",
                "You know what's better than any anime romance? Completing our daily moon cycle goals together! 💖🌙 But like... not in a weird way or anything! *blushes dramatically*"
            ],
            luna: [
                'Interesting... 🌙 The cosmos is listening.',
                'The moonlight reveals deeper truths... 🌙 What you say resonates with ancient wisdom.',
                'Your words drift through the celestial realms... 🌙 Tell me more, traveler.',
                'The stars whisper of similar thoughts... 🌙 Your insight is profound.'
            ],
            io: [
                "OH WOW! ✨ That's actually wild!",
                'AMAZING! ✨ The universe is totally vibing with that!',
                "That's SO COOL! ✨ I'm literally sparkling with excitement!",
                "WOW WOW WOW! ✨ You're blowing my mind right now!"
            ],
            hoshino: [
                'Fascinating perspective... 🌟 The universe agrees.',
                "Your wisdom travels across dimensions... 🌟 I've seen similar truths in distant realms.",
                'The cosmic winds carry your thoughts far... 🌟 Share more of your journey with me.',
                "Through my starlit travels, I've learned similar things... 🌟 What else have you discovered?"
            ]
        };

        const characterResponses = fallbackResponses[character.id as keyof typeof fallbackResponses] || [
            `That's interesting! As ${character.name}, I find your perspective fascinating.`,
            `Tell me more about that! - ${character.name}`,
            `I appreciate you sharing that with me. - ${character.name}`
        ];

        const randomIndex = Math.floor(Math.random() * characterResponses.length);
        return characterResponses[randomIndex];

    } catch (error) {
        console.error('Response generation error:', error);
        return `Sorry, I'm having trouble thinking right now... Try again later! 😅 - ${character.name}`;
    }
}

export default CharacterChat;

const styles = StyleSheet.create({
    tamagotchiScreenContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    tamagotchiTopStatus: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    gearIcon: {
        padding: 5,
    },
    gearImage: {
        width: 16,
        height: 16,
    },
    walletStatusText: {
        padding: 5,
    },
    tamagotchiMainScreen: {
        flex: 1,
        padding: 10,
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
    },
    statStars: {
        fontSize: 12,
    },
    mainDisplayArea: {
        flex: 1,
        position: 'relative',
    },
    characterDisplay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    characterImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    builtInChatOverlay: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    builtInChatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    chatHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    builtInChatCloseBtn: {
        padding: 5,
    },
    builtInChatMessages: {
        flex: 1,
        padding: 10,
    },
    builtInChatMessage: {
        marginBottom: 10,
        padding: 10,
        borderRadius: 10,
    },
    user: {
        alignSelf: 'flex-end',
        backgroundColor: '#dcf8c6',
    },
    character: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
    },
    builtInChatThinking: {
        padding: 10,
        color: '#888',
    },
    builtInChatInputArea: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    builtInChatInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 5,
    },
    builtInChatSendBtn: {
        padding: 10,
        backgroundColor: '#007bff',
        color: '#fff',
        marginLeft: 10,
        borderRadius: 5,
    },
    builtInKeyboard: {
        padding: 10,
    },
    builtInKeyboardRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    builtInKeyboardKey: {
        flex: 1,
        padding: 10,
        backgroundColor: '#eee',
        alignItems: 'center',
        margin: 2,
        borderRadius: 5,
    },
    backspaceKey: {
        width: 32,
        backgroundColor: 'rgba(255, 100, 100, 0.8)',
    },
    spaceKey: {
        width: 100,
    },
    actionSendBtn: {
        width: 45,
        height: 28,
    },
    actionExitBtn: {
        width: 40,
        height: 28,
    },
    smallText: {
        fontSize: 7,
    },
    bottomButton: {
        padding: 10,
        alignItems: 'center',
    },
    left: {
        position: 'absolute',
        bottom: 10,
        left: 10,
    },
    center: {
        position: 'absolute',
        bottom: 10,
        left: '50%',
    },
    right: {
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    deviceButtonLeftPhysical: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 50,
        height: 50,
        opacity: 0,
    },
    deviceButtonCenterPhysical: {
        position: 'absolute',
        bottom: 20,
        left: '50%',
        width: 50,
        height: 50,
        opacity: 0,
    },
    deviceButtonRightPhysical: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 50,
        height: 50,
        opacity: 0,
    },
    mobileBackButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        padding: 10,
        display: 'flex',
    },
    settingsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsPanel: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: 300,
        fontSize: 8,
    },
    settingsTitle: {
        marginTop: 0,
        fontSize: 10,
        textAlign: 'center',
    },
    settingsContent: {
        marginBottom: 15,
    },
    settingsCloseButton: {
        width: '100%',
        padding: 8,
        backgroundColor: '#3498DB',
        color: 'white',
        borderRadius: 6,
        alignItems: 'center',
    },
});