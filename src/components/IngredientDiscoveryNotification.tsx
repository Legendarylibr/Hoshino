import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
    Image
} from 'react-native';
import { ingredientDiscoveryService, DiscoveryNotification } from '../services/IngredientDiscoveryService';
import { requireIngredientImage } from '../utils/assetPaths';

const { width } = Dimensions.get('window');

interface IngredientDiscoveryNotificationProps {
    onIngredientCollected?: (ingredientId: string, quantity: number) => void;
}

export const IngredientDiscoveryNotification: React.FC<IngredientDiscoveryNotificationProps> = ({
    onIngredientCollected
}) => {
    const [notifications, setNotifications] = useState<DiscoveryNotification[]>([]);
    const [visibleNotifications, setVisibleNotifications] = useState<DiscoveryNotification[]>([]);
    const [slideAnim] = useState(new Animated.Value(-width));
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Check for new discoveries every minute
        const interval = setInterval(() => {
            checkForNewDiscoveries();
        }, 60000);

        // Initial check
        checkForNewDiscoveries();

        return () => clearInterval(interval);
    }, []);

    const checkForNewDiscoveries = () => {
        // Check if pet should discover ingredients
        if (ingredientDiscoveryService.shouldDiscoverIngredients()) {
            const discoveries = ingredientDiscoveryService.discoverIngredients();
            if (discoveries.length > 0) {
                // Get notifications for new discoveries
                const newNotifications = ingredientDiscoveryService.getDiscoveryNotifications();
                setNotifications(newNotifications);
                
                // Show notification animation
                showNotification();
            }
        }
    };

    const showNotification = () => {
        // Slide in from left
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();

        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideNotification();
        }, 5000);
    };

    const hideNotification = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -width,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handleCollectIngredient = (notification: DiscoveryNotification) => {
        // Call the callback to add ingredient to inventory
        if (onIngredientCollected) {
            onIngredientCollected(notification.ingredient.id, notification.quantity);
        }

        // Remove from notifications
        const updatedNotifications = notifications.filter(n => n.id !== notification.id);
        setNotifications(updatedNotifications);

        // Hide notification if no more notifications
        if (updatedNotifications.length === 0) {
            hideNotification();
        }
    };

    const formatTimeAgo = (timestamp: number): string => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return 'Yesterday';
    };

    if (notifications.length === 0) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateX: slideAnim }],
                    opacity: fadeAnim,
                }
            ]}
        >
            {notifications.map((notification, index) => (
                <View key={notification.id} style={styles.notificationCard}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{notification.title}</Text>
                        <Text style={styles.timestamp}>
                            {formatTimeAgo(notification.timestamp)}
                        </Text>
                    </View>
                    
                    <View style={styles.content}>
                        <Image
                            source={requireIngredientImage(notification.ingredient.image)}
                            style={styles.ingredientImage}
                            resizeMode="contain"
                        />
                        
                        <View style={styles.textContent}>
                            <Text style={styles.message}>{notification.message}</Text>
                            <Text style={styles.ingredientName}>
                                {notification.ingredient.name} x{notification.quantity}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.collectButton}
                            onPress={() => handleCollectIngredient(notification)}
                        >
                            <Text style={styles.collectButtonText}>Collect!</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.dismissButton}
                            onPress={hideNotification}
                        >
                            <Text style={styles.dismissButtonText}>Dismiss</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingHorizontal: 16,
    },
    notificationCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    ingredientImage: {
        width: 48,
        height: 48,
        marginRight: 12,
        borderRadius: 8,
    },
    textContent: {
        flex: 1,
    },
    message: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
        lineHeight: 22,
    },
    ingredientName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    collectButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        flex: 1,
        marginRight: 8,
    },
    collectButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    dismissButton: {
        backgroundColor: 'transparent',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    dismissButtonText: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default IngredientDiscoveryNotification;
