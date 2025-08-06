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
  const moonGlowAnim = useRef(new Animated.Value(0)).current;
  const zzzAnim = useRef(new Animated.Value(0)).current;

  // Generate random star positions
  const starPositions = useMemo(
    () =>
      [...Array(25)].map(() => ({
        left: Math.random() * width,
        top: Math.random() * (height * 0.6), // Keep stars in upper portion
        size: Math.random() * 8 + 6, // Random size between 6-14
        delay: Math.random() * 2000, // Random delay for twinkle
      })),
    []
  );

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // Start star twinkling
      Animated.loop(
        Animated.sequence([
          Animated.timing(starTwinkleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(starTwinkleAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Moon glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(moonGlowAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(moonGlowAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // ZZZ floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(zzzAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(zzzAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleDismiss = () => {
    // Fade out then dismiss
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
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
          {/* Background gradient effect */}
          <View style={styles.backgroundGradient} />
          
          {/* Animated stars */}
          {starPositions.map((star, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.star,
                {
                  left: star.left,
                  top: star.top,
                  fontSize: star.size,
                  opacity: starTwinkleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                  transform: [
                    {
                      scale: starTwinkleAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.8, 1.2, 0.8],
                      }),
                    },
                  ],
                },
              ]}
            >
              ✦
            </Animated.Text>
          ))}

          {/* Animated moon */}
          <Animated.Text
            style={[
              styles.moon,
              {
                opacity: moonGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                }),
                transform: [
                  {
                    scale: moonGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.05],
                    }),
                  },
                ],
              },
            ]}
          >
            🌙
          </Animated.Text>

          {/* Sleep message container */}
          <View style={styles.messageContainer}>
            <Animated.View
              style={[
                styles.messageBox,
                {
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.sleepingText}>💤 Sleeping...</Text>
              <Text style={styles.subtitleText}>Your pet is resting peacefully</Text>
              
              {/* Floating ZZZ */}
              <View style={styles.zzzContainer}>
                <Animated.Text
                  style={[
                    styles.zzz,
                    styles.zzz1,
                    {
                      opacity: zzzAnim.interpolate({
                        inputRange: [0, 0.3, 0.6, 1],
                        outputRange: [0.5, 1, 0.7, 0.5],
                      }),
                      transform: [
                        {
                          translateY: zzzAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -20],
                          }),
                        },
                        {
                          rotate: zzzAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '5deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  Z
                </Animated.Text>
                <Animated.Text
                  style={[
                    styles.zzz,
                    styles.zzz2,
                    {
                      opacity: zzzAnim.interpolate({
                        inputRange: [0, 0.2, 0.5, 0.8, 1],
                        outputRange: [0.3, 0.8, 1, 0.6, 0.3],
                      }),
                      transform: [
                        {
                          translateY: zzzAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -25],
                          }),
                        },
                        {
                          rotate: zzzAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '-3deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  z
                </Animated.Text>
                <Animated.Text
                  style={[
                    styles.zzz,
                    styles.zzz3,
                    {
                      opacity: zzzAnim.interpolate({
                        inputRange: [0, 0.1, 0.4, 0.7, 1],
                        outputRange: [0.2, 0.6, 0.9, 0.5, 0.2],
                      }),
                      transform: [
                        {
                          translateY: zzzAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -30],
                          }),
                        },
                        {
                          rotate: zzzAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '8deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  z
                </Animated.Text>
              </View>
            </Animated.View>
            
            <Animated.Text
              style={[
                styles.tapHint,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0, 0.6],
                  }),
                },
              ]}
            >
              Tap anywhere to wake up
            </Animated.Text>
          </View>
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
    backgroundColor: 'rgba(15, 15, 35, 0.92)', // Dark purple overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    // Subtle radial gradient effect using border radius and shadows
    borderRadius: width * 2,
    shadowColor: '#4c1d95',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: width * 0.8,
  },
  star: {
    position: 'absolute',
    color: '#fbbf24',
    fontWeight: 'bold',
    textShadowColor: '#fbbf24',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  moon: {
    position: 'absolute',
    top: height * 0.15,
    right: width * 0.15,
    fontSize: 48,
    textShadowColor: '#fbbf24',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  messageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(123, 58, 237, 0.3)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  sleepingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitleText: {
    fontSize: 14,
    color: '#cbd5e0',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  zzzContainer: {
    position: 'relative',
    width: 80,
    height: 50,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  zzz: {
    position: 'absolute',
    fontWeight: 'bold',
    color: '#fbbf24',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  zzz1: {
    fontSize: 20,
    right: 25,
    bottom: 0,
  },
  zzz2: {
    fontSize: 16,
    right: 10,
    bottom: 15,
  },
  zzz3: {
    fontSize: 12,
    right: -5,
    bottom: 25,
  },
  tapHint: {
    position: 'absolute',
    bottom: height * 0.1,
    fontSize: 12,
    color: '#a0aec0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SleepOverlay;