import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

interface MoodEvent {
    id: string;
    type: 'happy' | 'sad' | 'excited' | 'calm' | 'playful';
    intensity: number; // 1-5
    duration: number; // minutes
    triggeredBy: string;
    timestamp: number;
}

interface Props {
    moodEvents: MoodEvent[];
    onEventTap?: (event: MoodEvent) => void;
}

const { width } = Dimensions.get('window');

const MoodEvents: React.FC<Props> = ({ moodEvents, onEventTap }) => {
    const [visibleEvents, setVisibleEvents] = useState<MoodEvent[]>([]);
    const [animations, setAnimations] = useState<{ [key: string]: Animated.Value }>({});

    useEffect(() => {
        // Filter events that are still active
        const now = Date.now();
        const activeEvents = moodEvents.filter(e => 
            now - e.timestamp < e.duration * 60 * 1000
        );
        
        setVisibleEvents(activeEvents);
        
        // Create animations for new events
        activeEvents.forEach(event => {
            if (!animations[event.id]) {
                const newAnimation = new Animated.Value(0);
                setAnimations(prev => ({ ...prev, [event.id]: newAnimation }));
                
                // Animate in
                Animated.sequence([
                    Animated.timing(newAnimation, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(newAnimation, {
                        toValue: 0.8,
                        duration: 200,
                        useNativeDriver: true,
                    })
                ]).start();
            }
        });
        
        // Clean up old animations
        const eventIds = new Set(activeEvents.map(e => e.id));
        setAnimations(prev => {
            const newAnimations: { [key: string]: Animated.Value } = {};
            Object.keys(prev).forEach(id => {
                if (eventIds.has(id)) {
                    newAnimations[id] = prev[id];
                }
            });
            return newAnimations;
        });
    }, [moodEvents]);

    const getMoodIcon = (type: string) => {
        switch (type) {
            case 'happy': return '😊';
            case 'sad': return '😢';
            case 'excited': return '🤩';
            case 'calm': return '😌';
            case 'playful': return '😄';
            default: return '😐';
        }
    };

    const getMoodColor = (type: string) => {
        switch (type) {
            case 'happy': return '#4CAF50';
            case 'sad': return '#2196F3';
            case 'excited': return '#FF9800';
            case 'calm': return '#9C27B0';
            case 'playful': return '#FF5722';
            default: return '#757575';
        }
    };

    const getMoodDescription = (type: string, intensity: number) => {
        const descriptions = {
            happy: ['Content', 'Happy', 'Joyful', 'Ecstatic', 'Overjoyed'],
            sad: ['Down', 'Sad', 'Melancholy', 'Heartbroken', 'Devastated'],
            excited: ['Interested', 'Excited', 'Thrilled', 'Elated', 'Euphoric'],
            calm: ['Relaxed', 'Calm', 'Peaceful', 'Serene', 'Tranquil'],
            playful: ['Playful', 'Fun-loving', 'Mischievous', 'Adventurous', 'Wild']
        };
        
        return descriptions[type as keyof typeof descriptions]?.[intensity - 1] || 'Neutral';
    };

    const getIntensityBars = (intensity: number) => {
        return '●'.repeat(intensity) + '○'.repeat(5 - intensity);
    };

    const getTimeRemaining = (event: MoodEvent) => {
        const now = Date.now();
        const elapsed = now - event.timestamp;
        const remaining = (event.duration * 60 * 1000) - elapsed;
        const minutes = Math.max(0, Math.ceil(remaining / (60 * 1000)));
        return minutes;
    };

    if (visibleEvents.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>😌 Your moonling is feeling neutral</Text>
                <Text style={styles.emptySubtext}>Interact to see mood changes!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Current Mood</Text>
            
            {visibleEvents.map((event) => {
                const animation = animations[event.id];
                if (!animation) return null;
                
                const timeRemaining = getTimeRemaining(event);
                const isExpiring = timeRemaining <= 5;
                
                return (
                    <TouchableOpacity
                        key={event.id}
                        onPress={() => onEventTap?.(event)}
                        activeOpacity={0.8}
                    >
                        <Animated.View
                            style={[
                                styles.eventContainer,
                                {
                                    opacity: animation,
                                    transform: [{
                                        scale: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.8, 1],
                                        })
                                    }],
                                    borderColor: getMoodColor(event.type),
                                    backgroundColor: isExpiring 
                                        ? 'rgba(255, 152, 0, 0.1)' 
                                        : 'rgba(255, 255, 255, 0.05)'
                                }
                            ]}
                        >
                            <LinearGradient
                                colors={[getMoodColor(event.type), getMoodColor(event.type) + '80']}
                                style={styles.eventHeader}
                            >
                                <Text style={styles.moodIcon}>{getMoodIcon(event.type)}</Text>
                                <View style={styles.moodInfo}>
                                    <Text style={styles.moodType}>
                                        {getMoodDescription(event.type, event.intensity)}
                                    </Text>
                                    <Text style={styles.moodIntensity}>
                                        {getIntensityBars(event.intensity)}
                                    </Text>
                                </View>
                                <View style={styles.timeContainer}>
                                    <Text style={[styles.timeRemaining, { 
                                        color: isExpiring ? '#FF9800' : '#ffffff' 
                                    }]}>
                                        {timeRemaining}m
                                    </Text>
                                    {isExpiring && (
                                        <Text style={styles.expiringIcon}>⚠️</Text>
                                    )}
                                </View>
                            </LinearGradient>
                            
                            <View style={styles.eventDetails}>
                                <Text style={styles.triggeredBy}>
                                    Triggered by: {event.triggeredBy}
                                </Text>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${((Date.now() - event.timestamp) / (event.duration * 60 * 1000)) * 100}%`,
                                                backgroundColor: getMoodColor(event.type)
                                            }
                                        ]}
                                    />
                                </View>
                            </View>
                        </Animated.View>
                    </TouchableOpacity>
                );
            })}
            
            {/* Mood Summary */}
            <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Mood Summary</Text>
                <View style={styles.summaryStats}>
                    <View style={styles.summaryStat}>
                        <Text style={styles.summaryLabel}>Active Events</Text>
                        <Text style={styles.summaryValue}>{visibleEvents.length}</Text>
                    </View>
                    <View style={styles.summaryStat}>
                        <Text style={styles.summaryLabel}>Avg Intensity</Text>
                        <Text style={styles.summaryValue}>
                            {(visibleEvents.reduce((sum, e) => sum + e.intensity, 0) / visibleEvents.length).toFixed(1)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
        textAlign: 'center',
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#b0b0b0',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#757575',
        fontStyle: 'italic',
    },
    eventContainer: {
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 2,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    moodIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    moodInfo: {
        flex: 1,
    },
    moodType: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    moodIntensity: {
        fontSize: 14,
        color: '#ffffff',
        letterSpacing: 2,
    },
    timeContainer: {
        alignItems: 'center',
    },
    timeRemaining: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    expiringIcon: {
        fontSize: 16,
    },
    eventDetails: {
        padding: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    triggeredBy: {
        fontSize: 14,
        color: '#e0e0e0',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    summaryContainer: {
        marginTop: 24,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
        textAlign: 'center',
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryStat: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#b0b0b0',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
});

export default MoodEvents;
