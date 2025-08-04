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
import { useWallet } from '../contexts/WalletContext';
import { StatDecayService, MoodState } from '../services/StatDecayService';
import { LocalGameEngine, GameStats } from '../services/local/LocalGameEngine';

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
    const [currentFoodItem, setCurrentFoodItem] = useState<string>('');
    const [craftedFoodName, setCraftedFoodName] = useState<string>('');

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
                <TouchableOpacity
                    style={styles.menuIcon}
                    onPress={async () => {
                        if (!selectedCharacter) {
                            onNotification?.('❌ Please select a character first', 'error');
                            return;
                        }

                        // ✅ Use LocalGameEngine for instant feed action with StatDecayService sync
                        if (localGameEngine) {
                            const newStats = await localGameEngine.feedMoonling();
                            // Sync the feeding action with StatDecayService to maintain consistency
                            const result = await statDecayService.recordAction(
                                selectedCharacter.id,
                                'feed',
                                { hunger: 2, mood: 1 } // Match LocalGameEngine values
                            );

                            // Use the synced stats
                            const syncedStats = {
                                ...newStats,
                                mood: result.newStats.mood,
                                hunger: result.newStats.hunger,
                                energy: result.newStats.energy
                            };

                            setCurrentStats(syncedStats);
                            // Save synced stats back to LocalGameEngine
                            await localGameEngine.updateStats(syncedStats);

                            onNotification?.(
                                result.canGainMood
                                    ? `🍎 Fed ${selectedCharacter.name}! Mood +1, Hunger +2`
                                    : `🍎 Fed ${selectedCharacter.name}! Hunger +2 (Already earned today's mood bonus)`,
                                'success'
                            );
                        } else {
                            // Fallback to ingredient selection flow
                            console.log('Feed menu clicked - opening ingredient selection');
                            handleFeedingFlow();
                        }

                        // Also call the original onFeed if it exists
                        if (onFeed) onFeed();
                    }}
                >
                    <Image source={imageSources.feed} style={styles.menuImage} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuIcon}
                    onPress={async () => {
                        if (!selectedCharacter) {
                            onNotification?.('❌ Please select a character first', 'error');
                            return;
                        }
                        if (onChat) await onChat();
                    }}
                >
                    <Image source={imageSources.chat} style={styles.menuImage} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuIcon}
                    onPress={async () => {
                        if (!selectedCharacter) {
                            onNotification?.('❌ Please select a character first', 'error');
                            return;
                        }

                        // ✅ Use LocalGameEngine for instant play action with StatDecayService sync
                        if (localGameEngine) {
                            const newStats = await localGameEngine.playWithMoonling();
                            // Sync the play action with StatDecayService
                            const result = await statDecayService.recordAction(
                                selectedCharacter.id,
                                'play',
                                { mood: 2 } // Match LocalGameEngine values
                            );

                            // Use the synced stats
                            const syncedStats = {
                                ...newStats,
                                mood: result.newStats.mood,
                                hunger: result.newStats.hunger,
                                energy: Math.max(result.newStats.energy - 1, 0) // Apply LocalGameEngine energy cost
                            };

                            setCurrentStats(syncedStats);
                            // Save synced stats back to LocalGameEngine
                            await localGameEngine.updateStats(syncedStats);

                            onNotification?.(
                                result.canGainMood
                                    ? `🎮 Played with ${selectedCharacter.name}! Mood +2, Energy -1`
                                    : `🎮 Played with ${selectedCharacter.name}! Energy -1 (Already earned today's mood bonus)`,
                                'success'
                            );
                        } else {
                            onNotification?.(`🎮 Games coming soon! Stay tuned for amazing mini-games with ${selectedCharacter.name}!`, 'info');
                        }
                    }}
                >
                    <Image source={imageSources.games} style={styles.menuImage} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuIcon}
                    onPress={() => {
                        if (!selectedCharacter) {
                            onNotification?.('❌ Please select a character first', 'error');
                            return;
                        }

                        console.log('Sleep mode activated for', selectedCharacter.name);
                        setShowSleepMode(true);
                    }}
                >
                    <Image source={imageSources.sleep} style={styles.menuImage} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuIcon}
                    onPress={onShop}
                >
                    <Image source={imageSources.shop} style={styles.menuImage} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuIcon}
                    onPress={() => {
                        if (!selectedCharacter) {
                            onNotification?.('❌ Please select a character first', 'error');
                            return;
                        }
                        onInventory?.();
                    }}
                >
                    <Image source={imageSources.inventory} style={styles.menuImage} />
                </TouchableOpacity>
                                <TouchableOpacity
                    style={styles.menuIcon}
                    onPress={() => setShowGallery(true)}
                >
                    <Image source={imageSources.gallery} style={styles.menuImage} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuIcon}
                    onPress={() => {
                        onNotification?.('⚙️ Settings coming soon!', 'info');
                    }}
                >
                    <Image source={imageSources.settings} style={styles.menuImage} />
                </TouchableOpacity>
            </View>


        </InnerScreen>
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
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#ddd',
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
});

export default MoonlingInteraction;