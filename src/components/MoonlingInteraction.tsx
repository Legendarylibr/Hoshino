import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import Shop from './Shop';
import Gallery from './Gallery';
import MoonCycleDisplay from './MoonCycleDisplay';
import FeedingAnimation from './FeedingAnimation';
import SleepMode from './SleepMode';
import IngredientSelection from './IngredientSelection';
import InnerScreen from './InnerScreen';
import WalletButton from './WalletButton';
import Settings from './Settings';
import { useWallet } from '../contexts/WalletContext';
import { StatDecayService, MoodState } from '../services/StatDecayService';
import { LocalGameEngine, GameStats } from '../services/local/LocalGameEngine';
import SettingsService, { MenuButton } from '../services/SettingsService';
import SleepOverlay from './SleepOverlay';


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
    selectedCharacter: Character | null;
    onSelectCharacter: () => void;
    onFeed?: () => void;
    connected: boolean;
    walletAddress?: string;
    playerName?: string;
    onRefreshNFTs?: () => void;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onGame?: () => void;
    onMemoryGame?: () => void;
    onStarGame?: () => void;
    onShop?: () => void;
    onInventory?: () => void;
    onChat?: () => void;
    onBack?: () => void;
    // ✅ New props for local game engine
    localGameEngine?: LocalGameEngine | null;
}

const MoonlingInteraction: React.FC<Props> = ({
    selectedCharacter,
    onSelectCharacter,
    onFeed,
    connected,
    walletAddress,
    playerName,
    onRefreshNFTs,
    onNotification,
    onGame,
    onMemoryGame,
    onStarGame,
    onShop,
    onInventory,
    onChat,
    onBack,
    // ✅ New props
    localGameEngine
}) => {
    const { connected: walletConnected, publicKey, connect, disconnect } = useWallet();
    // ✅ Use GameStats from LocalGameEngine instead of simple stats
    const [currentStats, setCurrentStats] = useState<GameStats>({
        mood: 3,
        hunger: 2,
        energy: 4,
        totalFeedings: 0,
        totalPlays: 0,
        totalSleeps: 0,
        lastPlayed: Date.now(),
        level: 1,
        experience: 0
    });
    const [moodState, setMoodState] = useState<MoodState | null>(null);
    const [statDecayService] = useState(() => new StatDecayService());

    const [showShop, setShowShop] = useState(false);
    const [showGallery, setShowGallery] = useState(false);

    // ✅ Load stats from LocalGameEngine when available with StatDecayService sync
    useEffect(() => {
        if (localGameEngine && selectedCharacter) {
            (async () => {
                const stats = await localGameEngine.getLocalStats();
                await statDecayService.initializeCharacter(selectedCharacter.id, {
                    mood: stats.mood,
                    hunger: stats.hunger,
                    energy: stats.energy
                });
                setCurrentStats(stats);
                console.log('📊 Loaded stats from LocalGameEngine and synced with StatDecayService:', stats);
            })();
        }
    }, [localGameEngine, selectedCharacter]);

    // ✅ Optimized: Reduced frequency for better mobile performance and conflict prevention
    useEffect(() => {
        if (!localGameEngine || !selectedCharacter) return;

        const interval = setInterval(async () => {
            const engineStats = await localGameEngine.getLocalStats();
            // Check if StatDecayService has more recent updates
            const decayStats = await statDecayService.updateCharacterStats(selectedCharacter.id);

            // Use the more recently updated stats (priority to user actions vs time decay)
            const finalStats = {
                ...engineStats,
                // Apply time-based decay from StatDecayService if significant
                mood: Math.min(engineStats.mood, decayStats.mood),
                energy: decayStats.energy, // StatDecayService handles energy decay better
                hunger: decayStats.hunger
            };

            // Only update if stats actually changed to prevent unnecessary re-renders
            setCurrentStats(prevStats => {
                if (prevStats.mood === finalStats.mood &&
                    prevStats.energy === finalStats.energy &&
                    prevStats.hunger === finalStats.hunger) {
                    return prevStats; // No change, prevent re-render
                }
                return finalStats;
            });

            // Sync the final stats back to LocalGameEngine only if needed
            if (finalStats.mood !== engineStats.mood || finalStats.energy !== engineStats.energy) {
                await localGameEngine.updateStats({
                    ...engineStats,
                    mood: finalStats.mood,
                    energy: finalStats.energy,
                    hunger: finalStats.hunger
                });
            }
        }, 15000); // Increased to 15s for better mobile battery life

        return () => clearInterval(interval);
    }, [localGameEngine, selectedCharacter, statDecayService]);
    const [showIngredients, setShowIngredients] = useState(false);
    const [showIngredientSelection, setShowIngredientSelection] = useState(false);
    const [showFeedingAnimation, setShowFeedingAnimation] = useState(false);
    const [showSleepMode, setShowSleepMode] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [currentFoodItem, setCurrentFoodItem] = useState<string>('');
    const [craftedFoodName, setCraftedFoodName] = useState<string>('');
    const [menuButtons, setMenuButtons] = useState<MenuButton[]>([]);
    const [settingsService] = useState(() => SettingsService.getInstance());

    // Navigation functions for physical device buttons
    const goToPreviousMenu = () => {
        if (onInventory) {
            onInventory();
        } else {
            onNotification?.('📦 Opening inventory...', 'info');
        }
    };

    const goToNextMenu = () => {
        if (onShop) {
            onShop();
        } else {
            onNotification?.('🏪 Opening shop...', 'info');
        }
    };

    // Load menu buttons from settings
    useEffect(() => {
        const loadMenuButtons = async () => {
            await settingsService.initialize();
            const buttons = settingsService.getMenuButtons();
            setMenuButtons(buttons);
        };
        loadMenuButtons();
    }, [settingsService]);

    // Reload menu buttons when returning from settings
    useEffect(() => {
        if (!showSettings) {
            const loadMenuButtons = async () => {
                const buttons = settingsService.getMenuButtons();
                setMenuButtons(buttons);
            };
            loadMenuButtons();
        }
    }, [showSettings, settingsService]);

    // Initialize StatDecayService (only if LocalGameEngine is not available)
    useEffect(() => {
        if (selectedCharacter && !localGameEngine) {
            (async () => {
                // Initialize character in stat decay service with default stats
                await statDecayService.initializeCharacter(selectedCharacter.id, {
                    mood: 3,
                    hunger: 2,
                    energy: 4
                });

                // Update stats with current decay
                const updatedStats = await statDecayService.updateCharacterStats(selectedCharacter.id);
                setCurrentStats(prev => ({
                    ...prev,
                    mood: updatedStats.mood,
                    hunger: updatedStats.hunger,
                    energy: updatedStats.energy
                }));
                setMoodState(updatedStats.moodState);

                // Only show mood state notification if character is in a concerning state
                if (updatedStats.moodState.state === 'sad' || updatedStats.moodState.state === 'angry') {
                    const stateDescription = await statDecayService.getCharacterStateDescription(selectedCharacter.id);
                    onNotification?.(stateDescription, 'warning');
                }
            })();
        }
    }, [selectedCharacter, localGameEngine]);

    // ✅ Optimized: Mobile-friendly stat decay with performance improvements
    useEffect(() => {
        if (!selectedCharacter || localGameEngine) return; // Skip if LocalGameEngine handles sync

        const interval = setInterval(async () => {
            const updatedStats = await statDecayService.updateCharacterStats(selectedCharacter.id);

            // Only update if stats actually changed to prevent unnecessary re-renders
            setCurrentStats(prev => {
                if (prev.mood === updatedStats.mood &&
                    prev.hunger === updatedStats.hunger &&
                    prev.energy === updatedStats.energy) {
                    return prev; // No change, prevent re-render
                }
                return {
                    ...prev,
                    mood: updatedStats.mood,
                    hunger: updatedStats.hunger,
                    energy: updatedStats.energy
                };
            });

            setMoodState(updatedStats.moodState);
        }, 45000); // Increased to 45s for better mobile performance

        return () => clearInterval(interval);
    }, [selectedCharacter, localGameEngine, statDecayService]);

    // Handle crafting completion from ingredient selection
    const handleCraftFood = (foodId: string, foodName: string) => {
        console.log('Food crafted:', foodId, foodName);
        setCurrentFoodItem(foodId);
        setCraftedFoodName(foodName);
        setShowIngredientSelection(false);
        setShowFeedingAnimation(true);

        onNotification?.(`🍳 ${foodName} has been prepared! Watch ${selectedCharacter?.name} enjoy it!`, 'success');
    };

    // Handle feeding animation (showing ingredient selection first)
    const handleFeedingFlow = () => {
        if (!selectedCharacter) {
            onNotification?.('❌ Please select a character first', 'error');
            return;
        }

        console.log('Starting feeding flow - showing ingredient selection');
        setShowIngredientSelection(true);
    };

    // Handle menu button actions
    const handleMenuButtonAction = async (action: string) => {
        if (!selectedCharacter && action !== 'settings' && action !== 'shop') {
            onNotification?.('❌ Please select a character first', 'error');
            return;
        }

        switch (action) {
            case 'feed':
                if (localGameEngine) {
                    const newStats = await localGameEngine.feedMoonling();
                    const result = await statDecayService.recordAction(
                        selectedCharacter!.id,
                        'feed',
                        { hunger: 2, mood: 1 }
                    );

                    const syncedStats = {
                        ...newStats,
                        mood: result.newStats.mood,
                        hunger: result.newStats.hunger,
                        energy: result.newStats.energy
                    };

                    setCurrentStats(syncedStats);
                    await localGameEngine.updateStats(syncedStats);

                    onNotification?.(
                        result.canGainMood
                            ? `🍎 Fed ${selectedCharacter!.name}! Mood +1, Hunger +2`
                            : `🍎 Fed ${selectedCharacter!.name}! Hunger +2 (Already earned today's mood bonus)`,
                        'success'
                    );
                } else {
                    handleFeedingFlow();
                }
                if (onFeed) onFeed();
                break;

            case 'sleep':
                console.log('Sleep mode activated for', selectedCharacter!.name);
                setShowSleepMode(true);
                break;

            case 'shop':
                onShop?.();
                break;

            case 'inventory':
                onInventory?.();
                break;

            case 'chat':
                if (onChat) await onChat();
                break;

            case 'games':
                if (localGameEngine) {
                    const newStats = await localGameEngine.playWithMoonling();
                    const result = await statDecayService.recordAction(
                        selectedCharacter!.id,
                        'play',
                        { mood: 2 }
                    );

                    const syncedStats = {
                        ...newStats,
                        mood: result.newStats.mood,
                        hunger: result.newStats.hunger,
                        energy: Math.max(result.newStats.energy - 1, 0)
                    };

                    setCurrentStats(syncedStats);
                    await localGameEngine.updateStats(syncedStats);

                    onNotification?.(
                        result.canGainMood
                            ? `🎮 Played with ${selectedCharacter!.name}! Mood +2, Energy -1`
                            : `🎮 Played with ${selectedCharacter!.name}! Energy -1 (Already earned today's mood bonus)`,
                        'success'
                    );
                } else {
                    onNotification?.(`🎮 Games coming soon! Stay tuned for amazing mini-games with ${selectedCharacter!.name}!`, 'info');
                }
                break;

            case 'gallery':
                setShowGallery(true);
                break;

            case 'settings':
                setShowSettings(true);
                break;

            default:
                onNotification?.(`Unknown action: ${action}`, 'error');
        }
    };

    // Render menu button
    const renderMenuButton = (button: MenuButton) => {
        const getImageSource = (iconName: string) => {
            switch (iconName) {
                case 'feed': return imageSources.feed;
                case 'chat': return imageSources.chat;
                case 'games': return imageSources.games;
                case 'sleep': return imageSources.sleep;
                case 'shop': return imageSources.shop;
                case 'inventory': return imageSources.inventory;
                case 'gallery': return imageSources.gallery;
                case 'settings': return imageSources.settings;
                default: return imageSources.settings;
            }
        };

        return (
            <TouchableOpacity
                key={button.id}
                style={styles.menuIcon}
                onPress={() => handleMenuButtonAction(button.action)}
            >
                <Image source={getImageSource(button.icon)} style={styles.menuImage} />
            </TouchableOpacity>
        );
    };

    // If showing ingredient selection, render that instead
    if (showIngredientSelection) {
        return (
            <IngredientSelection
                onBack={() => setShowIngredientSelection(false)}
                onCraftFood={handleCraftFood}
                onNotification={onNotification}
                walletAddress={walletAddress}
            />
        );
    }

    const imageSources = {
        background: require('../../assets/images/screen bg.png'),
        feed: require('../../assets/images/feed.png'),
        chat: require('../../assets/images/chat.png'),
        games: require('../../assets/images/games.png'),
        sleep: require('../../assets/images/sleepzzzz.png'),
        shop: require('../../assets/images/shop.png'),
        inventory: require('../../assets/images/backpack.png'),
                gallery: require('../../assets/images/gallery.png'),
        settings: require('../../assets/images/settings.png'),
    };

    return (
        <>
            <WalletButton
                connected={walletConnected}
                publicKey={publicKey}
                onConnect={connect}
                onDisconnect={disconnect}
            />
            <InnerScreen
            showStatsBar={true}
            statsBarContent={
                <>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Mood {moodState ? `(${moodState.state})` : ''}</Text>
                        <Text style={styles.starRating}>
                            {'★'.repeat(currentStats.mood)}
                            {'☆'.repeat(5 - currentStats.mood)}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Hunger</Text>
                        <Text style={styles.starRating}>
                            {'★'.repeat(currentStats.hunger)}
                            {'☆'.repeat(5 - currentStats.hunger)}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Sleep</Text>
                        <Text style={styles.starRating}>
                            {'★'.repeat(currentStats.energy)}
                            {'☆'.repeat(5 - currentStats.energy)}
                        </Text>
                    </View>
                </>
            }
            onLeftButtonPress={onBack}
            onCenterButtonPress={() => onNotification?.('🎮 Moonling Interaction: Care for your character!', 'info')}
            onRightButtonPress={() => onNotification?.('🎮 Moonling Help: Feed, play, sleep, and care for your cosmic companion!', 'info')}
            leftButtonText="←"
            centerButtonText="🎮"
            rightButtonText="?"
        >
            {/* Main Display Area */}
            <View style={styles.mainDisplayArea}>
                <Image source={imageSources.background} style={styles.backgroundImage} resizeMode="cover" />
                {selectedCharacter ? (
                    <Image
                        source={getImageSource(selectedCharacter.image)}
                        style={styles.characterImage}
                    />
                ) : (
                    <View style={styles.noCharacterPlaceholder}>
                        <Text>No Character Selected</Text>
                    </View>
                )}
            </View>

            {/* Navigation Menu - Inside Main Screen */}
            <View style={styles.integratedMenuBar}>
                {/* Dynamic Menu Buttons */}
                {menuButtons.length > 0 && (
                    <>
                        {/* First Row - First 4 buttons */}
                        <View style={styles.menuRow}>
                            {menuButtons.slice(0, 4).map(renderMenuButton)}
                        </View>
                        
                        {/* Second Row - Remaining buttons */}
                        {menuButtons.length > 4 && (
                            <View style={styles.menuRow}>
                                {menuButtons.slice(4, 8).map(renderMenuButton)}
                            </View>
                        )}
                    </>
                )}
            </View>


            </InnerScreen>
            {showSleepMode && (
                <SleepOverlay
                    visible={showSleepMode}
                    onDismiss={() => setShowSleepMode(false)}
                />
            )}
            
            {showSettings && (
                <View style={styles.settingsOverlay}>
                    <Settings
                        onBack={() => setShowSettings(false)}
                        onNotification={onNotification}
                        onSettingsChanged={() => {
                            // Reload menu buttons when settings change
                            const loadMenuButtons = async () => {
                                const buttons = settingsService.getMenuButtons();
                                setMenuButtons(buttons);
                            };
                            loadMenuButtons();
                        }}
                    />
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    starRating: {
        fontSize: 16,
        color: '#ffd700',
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
    characterImage: {
        width: 250,
        height: 250,
        resizeMode: 'contain',
        marginTop: -20,
    },
    noCharacterPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    integratedMenuBar: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 1,
        backgroundColor: '#E8F5E8',
        width: '100%',
        position: 'absolute',
        bottom: 5,
        left: 0,
        right: 0,
    },
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 1,
        paddingHorizontal: 20,
    },
    menuIcon: {
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuImage: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    achievementStatusSection: {
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    achievementNotification: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    feedingAnimationOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    sleepAnimationOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    galleryOverlay: {
        flex: 1,
        backgroundColor: '#fff',
    },
    settingsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#E8F5E8',
        zIndex: 1000,
    },
});

export default MoonlingInteraction;