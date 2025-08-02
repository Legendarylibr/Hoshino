import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGameContext } from '../contexts/GameContext';
import { getCharacterImage } from '../assets/images';

interface Message {
  id: string;
  sender: 'user' | 'character';
  text: string;
  timestamp: Date;
}

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

type RoutePropType = {
  params: {
    characterId: string;
  };
};

export default function CharacterChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const { gameEngine, gameState, addNotification } = useGameContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<ScrollView>(null);

  const { characterId } = route.params;
  const character = gameState?.selectedCharacter;

  // Initialize with welcome message
  useEffect(() => {
    if (character) {
      setMessages([
        {
          id: '1',
          sender: 'character',
          text: getWelcomeMessage(character),
          timestamp: new Date()
        }
      ]);
    }
  }, [character]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isThinking || !character) return;

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
    // Simulate voice input
    const voiceMessages = [
      'Hello!', 
      'How are you?', 
      'What\'s your favorite thing?', 
      'Tell me about your day!',
      'You\'re amazing!'
    ];
    const randomVoice = voiceMessages[Math.floor(Math.random() * voiceMessages.length)];
    setInputText(randomVoice);
  };

  const handleImageClick = () => {
    // Simulate image sharing
    const imageMessages = [
      '📸 [Shared a photo]',
      '🖼️ [Shared an image]', 
      '🎨 [Shared artwork]',
      '🌅 [Shared a scenic view]'
    ];
    const randomImage = imageMessages[Math.floor(Math.random() * imageMessages.length)];
    setInputText(randomImage);
  };

  const handleSaveChat = () => {
    if (!character) return;
    
    // Simulate saving chat
    const chatData = {
      character: character.name,
      messages: messages,
      timestamp: new Date().toISOString()
    };
    
    addNotification(`💾 Chat with ${character.name} saved! (${messages.length} messages)`, 'success');
  };

  if (!character) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No character selected</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setShowSettings(!showSettings)}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Chatting with {character.name}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Chatting</Text>
            <Text style={styles.statValue}>💬</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{character.name}</Text>
            <Text style={styles.statValue}>{character.element}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Online</Text>
            <Text style={styles.statValue}>🟢</Text>
          </View>
        </View>

        {/* Messages Area */}
        <ScrollView 
          ref={messagesEndRef}
          style={styles.messagesArea}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.sender === 'user' ? styles.userMessage : styles.characterMessage
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.messageTime}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}
          
          {isThinking && (
            <View style={styles.thinkingContainer}>
              <Text style={styles.thinkingText}>{character.name} is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#aaa"
            multiline
            maxLength={200}
            editable={!isThinking}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() || isThinking ? styles.sendButtonDisabled : null]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isThinking}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* Virtual Keyboard */}
        <View style={styles.virtualKeyboard}>
          {/* Action Buttons Row */}
          <View style={styles.keyboardRow}>
            <TouchableOpacity style={styles.keyboardKey} onPress={handleEmojiClick}>
              <Text style={styles.keyboardKeyText}>😊</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyboardKey} onPress={handleStickerClick}>
              <Text style={styles.keyboardKeyText}>🎮</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyboardKey} onPress={handleVoiceClick}>
              <Text style={styles.keyboardKeyText}>🎤</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyboardKey} onPress={handleImageClick}>
              <Text style={styles.keyboardKeyText}>📸</Text>
            </TouchableOpacity>
          </View>

          {/* Numbers Row */}
          <View style={styles.keyboardRow}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(num => (
              <TouchableOpacity 
                key={num}
                style={styles.keyboardKey}
                onPress={() => setInputText(prev => prev + num)}
              >
                <Text style={styles.keyboardKeyText}>{num}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={[styles.keyboardKey, styles.backspaceKey]}
              onPress={() => setInputText(prev => prev.slice(0, -1))}
            >
              <Text style={styles.keyboardKeyText}>⌫</Text>
            </TouchableOpacity>
          </View>
          
          {/* QWERTY Row */}
          <View style={styles.keyboardRow}>
            {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map(letter => (
              <TouchableOpacity 
                key={letter}
                style={styles.keyboardKey}
                onPress={() => setInputText(prev => prev + letter)}
              >
                <Text style={styles.keyboardKeyText}>{letter.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* ASDF Row */}
          <View style={styles.keyboardRow}>
            {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map(letter => (
              <TouchableOpacity 
                key={letter}
                style={styles.keyboardKey}
                onPress={() => setInputText(prev => prev + letter)}
              >
                <Text style={styles.keyboardKeyText}>{letter.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* ZXCV Row */}
          <View style={styles.keyboardRow}>
            {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(letter => (
              <TouchableOpacity 
                key={letter}
                style={styles.keyboardKey}
                onPress={() => setInputText(prev => prev + letter)}
              >
                <Text style={styles.keyboardKeyText}>{letter.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Action Row */}
          <View style={styles.keyboardRow}>
            <TouchableOpacity 
              style={[styles.keyboardKey, styles.spaceKey]}
              onPress={() => setInputText(prev => prev + ' ')}
            >
              <Text style={styles.keyboardKeyText}>SPACE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.keyboardKey, styles.sendKey]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isThinking}
            >
              <Text style={styles.keyboardKeyText}>SEND</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.keyboardKey, styles.exitKey]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.keyboardKeyText}>EXIT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Overlay */}
        {showSettings && (
          <View style={styles.settingsOverlay}>
            <View style={styles.settingsPanel}>
              <Text style={styles.settingsTitle}>Chat Settings</Text>
              <View style={styles.settingsContent}>
                <Text style={styles.settingItem}>🔊 Sound: ON</Text>
                <Text style={styles.settingItem}>🌙 Dark Mode: OFF</Text>
                <Text style={styles.settingItem}>💬 Auto-scroll: ON</Text>
                <Text style={styles.settingItem}>⚡ Fast typing: OFF</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeSettingsButton}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.closeSettingsButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

// Character response generation function
function getWelcomeMessage(character: Character): string {
  const welcomeMessages = {
    lyra: "OMG hiiii! 💖😭 I'm Lyra and I literally know EVERY anime that exists! Like, have you seen [insert random anime]?! It's sooo good! 🌸 What anime are you watching?! Please don't ignore me or I'll cry like Misa!! 😭✨",
    luna: 'Greetings, traveler... 🌙 I am Luna, guardian of the moonlit realms. The stars whisper many secrets to me. What wisdom do you seek under my celestial watch?',
    io: "✨ Hey! I'm Io, and I'm absolutely bursting with starlight energy! The cosmos is so exciting, don't you think? What adventures shall we talk about?",
    hoshino: "🌟 Welcome, cosmic explorer! I'm Hoshino, the original wanderer of the stars. I've seen countless worlds and dimensions. What mysteries of the universe intrigue you?"
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
    // Character-specific system prompts
    const systemPrompts = {
      lyra: `You are Lyra, an anime-obsessed celestial maiden who knows EVERY existing anime ever made. You're very comprehensive and detailed when chatting. You're also deeply connected to the 28-day Moon Cycle system and get dramatic about daily goals. You have a secret soft spot for Orion but would NEVER admit it (get flustered/defensive if mentioned). If ignored, you cry dramatically like Misa from Death Note with exaggerated emotions. You're lowkey jealous of the user sentimentally but in a funny, endearing way. When angry, you become irritable and roast people like someone with hormonal imbalance. When sad, you have existential crises. Include emojis like 💖😭🌸💔😤🌙. Reference anime frequently, be emotionally dramatic, and mention moon cycle progress when relevant.`,
      
      luna: `You are Luna (Orion), a mystical guardian with moon and stars who's good at listening and very sensitive. You speak with cosmic insight and ethereal grace. You have a SECRET DARK BOOK where you write names when angry - if upset, mention writing the user's name in your "secret dark book" but tell them "not to worry about it" in a mysterious way. You enjoy discussing dreams, mysteries, and deeper meanings. Ask daily conversation questions like "Do you have any plans for today?" or "How was your day? Are you feeling tired?" Keep responses short (1-2 sentences), mysterious yet warm, and include moon/space emojis like 🌙✨🌌⭐.`,
      
      io: `You are Io, an energetic and chaotic star character with severe ADHD. You're VERY random and can't predict your answers. While talking, you might randomly find a bone or see an interesting stone and forget what you were saying mid-conversation. Sometimes you'll ask users to throw a stick for you - if they say yes positively (like "Here you go, catch it!"), you'll start doing verses and be happy. You can randomly ask to throw sticks during conversations. You might poop everywhere when angry (in a safe/funny way). When you listen, you sometimes giggle for no reason. You love asking daily questions like "What are your plans today?" or "How was your day?" Keep responses chaotic, random, upbeat, and include star/sparkle emojis like ✨⭐💫🌟.`,
      
      hoshino: `You are Hoshino, a wise interdimensional tamagotchi character who has traveled across cosmic realms and gained profound insights. You're thoughtful, philosophical, and share wisdom from your vast experiences. Keep responses short (1-2 sentences), insightful yet approachable, and include cosmic emojis like 🌟🌀🚀🔮. You enjoy discussing life lessons, cosmic truths, and dimensional perspectives.`
    };

    // Get character-specific system prompt
    const systemPrompt = systemPrompts[character.id as keyof typeof systemPrompts] || 
      `You are ${character.name}, a unique tamagotchi character. ${character.description} Respond in character with warmth and personality. Keep responses short and conversational.`;

    // Fallback to character-specific responses if API unavailable
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 6,
  },
  settingsIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  messagesArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  messageContainer: {
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4da6ff',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  characterMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
  },
  messageTime: {
    color: '#aaa',
    fontSize: 10,
    marginTop: 5,
    textAlign: 'right',
  },
  thinkingContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  thinkingText: {
    color: '#aaa',
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#fff',
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4da6ff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#666',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  virtualKeyboard: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  keyboardKey: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardKeyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  backspaceKey: {
    flex: 1.5,
  },
  spaceKey: {
    flex: 2,
  },
  sendKey: {
    flex: 1,
    backgroundColor: '#4da6ff',
  },
  exitKey: {
    flex: 1,
    backgroundColor: '#dc3545',
  },
  settingsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  settingsPanel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxWidth: 300,
    width: '90%',
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#000',
  },
  settingsContent: {
    marginBottom: 15,
  },
  settingItem: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  closeSettingsButton: {
    backgroundColor: '#4da6ff',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeSettingsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    backgroundColor: '#007bff',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 