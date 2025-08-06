import React, { useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Props {
    visible: boolean;
    onDismiss: () => void;
}

const SleepOverlay: React.FC<Props> = ({ visible, onDismiss }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const starTwinkleAnim = useRef(new Animated.Value(0)).current;
    const bubbleFloatAnim = useRef(new Animated.Value(0)).current;
    const clockAnim = useRef(new Animated.Value(0)).current;
    const pixelMoonAnim = useRef(new Animated.Value(0)).current;

    // Generate random pixel stars
    const pixelStars = useMemo(
        () =>
            [...Array(15)].map((_, i) => ({
                left: Math.random() * (width - 20),
                top: Math.random() * (height * 0.4),
                size: Math.random() > 0.5 ? 'large' : 'small',
                animationDelay: i * 300,
            })),
        []
    );

    // Generate floating bubbles/orbs
    const floatingBubbles = useMemo(
        () =>
            [...Array(8)].map((_, i) => ({
                left: Math.random() * (width - 40),
                top: height * 0.3 + Math.random() * (height * 0.4),
                size: Math.random() * 15 + 20,
                delay: i * 800,
            })),
        []
    );

    useEffect(() => {
        if (visible) {
            // Main fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start();

            // Star twinkling with staggered timing
            Animated.loop(
                Animated.sequence([
                    Animated.timing(starTwinkleAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(starTwinkleAnim, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Bubble floating animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bubbleFloatAnim, {
                        toValue: 1,
                        duration: 4000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(bubbleFloatAnim, {
                        toValue: 0,
                        duration: 4000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Clock pulse
            Animated.loop(
                Animated.sequence([
                    Animated.timing(clockAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(clockAnim, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Pixel moon gentle sway
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pixelMoonAnim, {
                        toValue: 1,
                        duration: 3500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pixelMoonAnim, {
                        toValue: 0,
                        duration: 3500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleDismiss = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
        }).start(() => {
            onDismiss();
        });
    };

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (!visible) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.overlay,
                {
                    opacity: fadeAnim,
                },
            ]}
        >
            <TouchableWithoutFeedback onPress={handleDismiss}>
                <View style={styles.container}>
                    {/* GameBoy-style gradient background */}
                    <View style={styles.gameboyBackground} />

                    {/* Pixel stars */}
                    {pixelStars.map((star, index) => (
                        <Animated.View
                            key={`star-${index}`}
                            style={[
                                styles.pixelStar,
                                star.size === 'large' ? styles.pixelStarLarge : styles.pixelStarSmall,
                                {
                                    left: star.left,
                                    top: star.top,
                                    opacity: starTwinkleAnim.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [0.4, 1, 0.4],
                                    }),
                                    transform: [
                                        {
                                            scale: starTwinkleAnim.interpolate({
                                                inputRange: [0, 0.5, 1],
                                                outputRange: [0.8, 1.1, 0.8],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        />
                    ))}

                    {/* Floating dreamy bubbles */}
                    {floatingBubbles.map((bubble, index) => (
                        <Animated.View
                            key={`bubble-${index}`}
                            style={[
                                styles.dreamBubble,
                                {
                                    left: bubble.left,
                                    top: bubble.top,
                                    width: bubble.size,
                                    height: bubble.size,
                                    opacity: bubbleFloatAnim.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [0.2, 0.6, 0.2],
                                    }),
                                    transform: [
                                        {
                                            translateY: bubbleFloatAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, -30],
                                            }),
                                        },
                                        {
                                            scale: bubbleFloatAnim.interpolate({
                                                inputRange: [0, 0.5, 1],
                                                outputRange: [0.8, 1.2, 0.8],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        />
                    ))}

                    {/* Pixel moon */}
                    <Animated.View
                        style={[
                            styles.pixelMoon,
                            {
                                transform: [
                                    {
                                        rotate: pixelMoonAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '5deg'],
                                        }),
                                    },
                                    {
                                        scale: pixelMoonAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, 1.05],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    />

                    {/* Main sleep UI container */}
                    <View style={styles.sleepUIContainer}>
                        {/* Time display */}
                        <Animated.View
                            style={[
                                styles.timeDisplay,
                                {
                                    transform: [
                                        {
                                            scale: clockAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 1.02],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <Text style={styles.timeText}>{getCurrentTime()}</Text>
                            <View style={styles.timeUnderline} />
                            <Text style={styles.trackingText}>• • • TRACKING SLEEP • • •</Text>
                        </Animated.View>

                        {/* Sleep character circle */}
                        <View style={styles.characterCircle}>
                            <View style={styles.characterPlatform}>
                                <Text style={styles.sleepingEmoji}>😴</Text>
                                <View style={styles.zzzPixels}>
                                    <Text style={styles.zPixel}>z</Text>
                                    <Text style={styles.zPixel}>z</Text>
                                    <Text style={styles.zPixel}>z</Text>
                                </View>
                            </View>
                        </View>

                        {/* Sleep controls */}
                        <View style={styles.sleepControls}>
                            <View style={styles.controlRow}>
                                <Text style={styles.controlLabel}>Alarm</Text>
                                <View style={styles.controlValue}>
                                    <Text style={styles.controlText}>7:00 AM</Text>
                                </View>
                            </View>

                            <View style={styles.controlRow}>
                                <Text style={styles.controlLabel}>Relaxing Sounds</Text>
                                <View style={styles.soundControls}>
                                    <View style={styles.soundButton}>
                                        <Text style={styles.soundIcon}>🔇</Text>
                                    </View>
                                    <View style={styles.soundButton}>
                                        <Text style={styles.soundIcon}>▶</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* End sleep button */}
                        <Animated.View
                            style={[
                                styles.endSleepButton,
                                {
                                    opacity: fadeAnim.interpolate({
                                        inputRange: [0, 0.7, 1],
                                        outputRange: [0, 0, 1],
                                    }),
                                },
                            ]}
                        >
                            <Text style={styles.endSleepText}>End Sleep Session</Text>
                        </Animated.View>
                    </View>

                    {/* Pixel border decoration */}
                    <View style={styles.pixelBorder} />
                </View>
            </TouchableWithoutFeedback>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    container: {
        flex: 1,
        position: 'relative',
    },
    gameboyBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#2563eb', // GameBoy blue base
        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #1e3a8a 100%)',
    },
    pixelStar: {
        position: 'absolute',
        backgroundColor: '#fbbf24',
        borderRadius: 1,
    },
    pixelStarLarge: {
        width: 6,
        height: 6,
        shadowColor: '#fbbf24',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    pixelStarSmall: {
        width: 3,
        height: 3,
        shadowColor: '#fbbf24',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 2,
    },
    dreamBubble: {
        position: 'absolute',
        backgroundColor: 'rgba(147, 197, 253, 0.3)',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: 'rgba(147, 197, 253, 0.5)',
    },
    pixelMoon: {
        position: 'absolute',
        top: height * 0.08,
        right: width * 0.1,
        width: 40,
        height: 40,
        backgroundColor: '#fef3c7',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fbbf24',
        shadowColor: '#fbbf24',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
    },
    sleepUIContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timeDisplay: {
        alignItems: 'center',
        marginTop: 20,
    },
    timeText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        fontFamily: 'monospace', // Pixel-style font
    },
    timeUnderline: {
        width: 120,
        height: 2,
        backgroundColor: '#93c5fd',
        marginVertical: 8,
    },
    trackingText: {
        fontSize: 12,
        color: '#dbeafe',
        fontWeight: 'bold',
        letterSpacing: 2,
        fontFamily: 'monospace',
    },
    characterCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 4,
        borderColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    characterPlatform: {
        width: 100,
        height: 60,
        backgroundColor: '#374151',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    sleepingEmoji: {
        fontSize: 32,
        marginBottom: 5,
    },
    zzzPixels: {
        position: 'absolute',
        top: -25,
        right: -15,
        flexDirection: 'row',
    },
    zPixel: {
        fontSize: 12,
        color: '#fbbf24',
        fontWeight: 'bold',
        marginHorizontal: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    sleepControls: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    controlRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    controlLabel: {
        fontSize: 14,
        color: '#dbeafe',
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    controlValue: {
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3b82f6',
    },
    controlText: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    soundControls: {
        flexDirection: 'row',
        gap: 8,
    },
    soundButton: {
        width: 36,
        height: 36,
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    soundIcon: {
        fontSize: 12,
        color: '#ffffff',
    },
    endSleepButton: {
        backgroundColor: 'rgba(37, 99, 235, 0.9)',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderWidth: 2,
        borderColor: '#1d4ed8',
        shadowColor: '#1e40af',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    endSleepText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'monospace',
    },
    pixelBorder: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: '#1e3a8a',
    },
});

export default SleepOverlay;