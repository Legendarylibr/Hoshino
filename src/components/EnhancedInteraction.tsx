import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Alert
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

interface GameStats {
    mood: number;
    hunger: number;
    energy: number;
    totalFeedings: number;
    totalPlays: number;
    totalSleeps: number;
    lastPlayed: number;
    level: number;
    experience: number;
    dailyStreak: number;
    lastDailyCheck: string;
    moodEvents: number;
    specialInteractions: number;
    careQuality: number;
    attentionScore: number;
}

interface Props {
    character: any;
    currentStats: GameStats;
    onFeed: (foodQuality: number) => Promise<void>;
    onPlay: (playType: 'active' | 'gentle' | 'creative') => Promise<void>;
    onSleep: (sleepQuality: number) => Promise<void>;
    onChat: (chatType: 'casual' | 'deep' | 'playful') => Promise<void>;
}

const { width } = Dimensions.get('window');

const EnhancedInteraction: React.FC<Props> = ({
    character,
    currentStats,
    onFeed,
    onPlay,
    onSleep,
    onChat
}) => {
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [actionQuality, setActionQuality] = useState<number>(1);
    const [isPerformingAction, setIsPerformingAction] = useState(false);
    const [showQualitySelector, setShowQualitySelector] = useState(false);
    
    // Animation values
    const [scaleAnim] = useState(new Animated.Value(1));
    const [pulseAnim] = useState(new Animated.Value(1));
    const [qualityAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Start pulsing animation
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, []);

    const handleActionSelect = (action: string) => {
        setSelectedAction(action);
        setShowQualitySelector(true);
        
        // Animate quality selector in
        Animated.timing(qualityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handleQualitySelect = (quality: number) => {
        setActionQuality(quality);
        setShowQualitySelector(false);
        
        // Animate quality selector out
        Animated.timing(qualityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
        
        performAction(selectedAction!, quality);
    };

    const performAction = async (action: string, quality: number) => {
        setIsPerformingAction(true);
        
        try {
            // Scale animation for action feedback
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 0.95,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1.05,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();

            // Perform the selected action
            switch (action) {
                case 'feed':
                    await onFeed(quality);
                    break;
                case 'play':
                    const playTypes: ('active' | 'gentle' | 'creative')[] = ['active', 'gentle', 'creative'];
                    await onPlay(playTypes[quality - 1]);
                    break;
                case 'sleep':
                    await onSleep(quality);
                    break;
                case 'chat':
                    const chatTypes: ('casual' | 'deep' | 'playful')[] = ['casual', 'deep', 'playful'];
                    await onChat(chatTypes[quality - 1]);
                    break;
            }

            // Show success feedback
            showActionFeedback(action, quality);
            
        } catch (error) {
            console.error('Action failed:', error);
            Alert.alert('Action Failed', 'Something went wrong. Please try again.');
        } finally {
            setIsPerformingAction(false);
            setSelectedAction(null);
        }
    };

    const showActionFeedback = (action: string, quality: number) => {
        const qualityText = ['Poor', 'Fair', 'Good', 'Great', 'Perfect'][quality - 1];
        const actionText = {
            feed: 'Feeding',
            play: 'Playing',
            sleep: 'Sleeping',
            chat: 'Chatting'
        }[action];
        
        Alert.alert(
            `${qualityText} ${actionText}!`,
            `Your moonling loved the ${qualityText.toLowerCase()} ${actionText.toLowerCase()}!`,
            [{ text: 'Great!' }]
        );
    };

    const getQualityDescription = (quality: number) => {
        const descriptions = [
            'Poor - Basic interaction',
            'Fair - Decent effort',
            'Good - Nice attention',
            'Great - Excellent care',
            'Perfect - Outstanding!'
        ];
        return descriptions[quality - 1];
    };

    const getQualityColor = (quality: number) => {
        const colors = ['#F44336', '#FF9800', '#FFC107', '#4CAF50', '#2196F3'];
        return colors[quality - 1];
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'feed': return '🍎';
            case 'play': return '🎮';
            case 'sleep': return '😴';
            case 'chat': return '💬';
            default: return '⭐';
        }
    };

    const getActionDescription = (action: string) => {
        switch (action) {
            case 'feed': return 'Feed your moonling with care';
            case 'play': return 'Play and have fun together';
            case 'sleep': return 'Help them rest peacefully';
            case 'chat': return 'Have a meaningful conversation';
            default: return 'Interact with your moonling';
        }
    };

    return (
        <View style={styles.container}>
            {/* Character Stats Display */}
            <View style={styles.statsContainer}>
                <LinearGradient
                    colors={['rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.8)']}
                    style={styles.statsGradient}
                >
                    <Text style={styles.characterName}>{character?.name || 'Moonling'}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statIcon}>😊</Text>
                            <Text style={styles.statValue}>{currentStats.mood}/5</Text>
                            <Text style={styles.statLabel}>Mood</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statIcon}>🍽️</Text>
                            <Text style={styles.statValue}>{currentStats.hunger}/5</Text>
                            <Text style={styles.statLabel}>Hunger</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statIcon}>⚡</Text>
                            <Text style={styles.statValue}>{currentStats.energy}/5</Text>
                            <Text style={styles.statLabel}>Energy</Text>
                        </View>
                    </View>
                    <View style={styles.levelContainer}>
                        <Text style={styles.levelText}>Level {currentStats.level}</Text>
                        <View style={styles.expBar}>
                            <View
                                style={[
                                    styles.expFill,
                                    { width: `${(currentStats.experience / (currentStats.level * 100)) * 100}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.expText}>{currentStats.experience}/{currentStats.level * 100} XP</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <Text style={styles.actionsTitle}>Choose Your Action</Text>
                
                <View style={styles.actionGrid}>
                    {['feed', 'play', 'sleep', 'chat'].map((action) => (
                        <TouchableOpacity
                            key={action}
                            style={[
                                styles.actionButton,
                                selectedAction === action && styles.selectedActionButton
                            ]}
                            onPress={() => handleActionSelect(action)}
                            disabled={isPerformingAction}
                            activeOpacity={0.8}
                        >
                            <Animated.Text
                                style={[
                                    styles.actionIcon,
                                    { transform: [{ scale: pulseAnim }] }
                                ]}
                            >
                                {getActionIcon(action)}
                            </Animated.Text>
                            <Text style={styles.actionText}>
                                {action.charAt(0).toUpperCase() + action.slice(1)}
                            </Text>
                            <Text style={styles.actionDescription}>
                                {getActionDescription(action)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Quality Selector */}
            {showQualitySelector && (
                <Animated.View
                    style={[
                        styles.qualitySelector,
                        {
                            opacity: qualityAnim,
                            transform: [{
                                translateY: qualityAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [50, 0],
                                })
                            }]
                        }
                    ]}
                >
                    <Text style={styles.qualityTitle}>Choose Quality Level</Text>
                    <Text style={styles.qualitySubtitle}>
                        Higher quality = Better rewards & mood boost
                    </Text>
                    
                    <View style={styles.qualityOptions}>
                        {[1, 2, 3, 4, 5].map((quality) => (
                            <TouchableOpacity
                                key={quality}
                                style={[
                                    styles.qualityOption,
                                    { borderColor: getQualityColor(quality) }
                                ]}
                                onPress={() => handleQualitySelect(quality)}
                            >
                                <Text style={[styles.qualityNumber, { color: getQualityColor(quality) }]}>
                                    {quality}
                                </Text>
                                <Text style={styles.qualityDescription}>
                                    {getQualityDescription(quality)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                            setShowQualitySelector(false);
                            setSelectedAction(null);
                            Animated.timing(qualityAnim, {
                                toValue: 0,
                                duration: 200,
                                useNativeDriver: true,
                            }).start();
                        }}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Care Quality Indicator */}
            <View style={styles.careQualityContainer}>
                <Text style={styles.careQualityTitle}>Care Quality</Text>
                <View style={styles.careQualityBar}>
                    <View
                        style={[
                            styles.careQualityFill,
                            { width: `${currentStats.careQuality}%` }
                        ]}
                    />
                </View>
                <Text style={styles.careQualityText}>{currentStats.careQuality}/100</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#0f0f23',
    },
    statsContainer: {
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
    },
    statsGradient: {
        padding: 20,
        alignItems: 'center',
    },
    characterName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#e0e0e0',
    },
    levelContainer: {
        alignItems: 'center',
        width: '100%',
    },
    levelText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    expBar: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    expFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },
    expText: {
        fontSize: 12,
        color: '#e0e0e0',
    },
    actionsContainer: {
        marginBottom: 24,
    },
    actionsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
        textAlign: 'center',
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionButton: {
        width: (width - 48) / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedActionButton: {
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    actionDescription: {
        fontSize: 12,
        color: '#b0b0b0',
        textAlign: 'center',
        lineHeight: 16,
    },
    qualitySelector: {
        position: 'absolute',
        top: '50%',
        left: 16,
        right: 16,
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        padding: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    qualityTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 8,
    },
    qualitySubtitle: {
        fontSize: 14,
        color: '#b0b0b0',
        textAlign: 'center',
        marginBottom: 20,
    },
    qualityOptions: {
        marginBottom: 20,
    },
    qualityOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        borderWidth: 2,
    },
    qualityNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 12,
        minWidth: 20,
    },
    qualityDescription: {
        fontSize: 14,
        color: '#e0e0e0',
        flex: 1,
    },
    cancelButton: {
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F44336',
    },
    cancelText: {
        color: '#F44336',
        fontSize: 16,
        fontWeight: 'bold',
    },
    careQualityContainer: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
    },
    careQualityTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 12,
    },
    careQualityBar: {
        width: '100%',
        height: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    careQualityFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 6,
    },
    careQualityText: {
        fontSize: 14,
        color: '#e0e0e0',
    },
});

export default EnhancedInteraction;
