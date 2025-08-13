import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native';
import { ingredientDiscoveryService } from '../services/IngredientDiscoveryService';
import { IngredientDiscoveryNotification } from './IngredientDiscoveryNotification';
import { DiscoverySettings } from './DiscoverySettings';

export const IngredientDiscoveryDemo: React.FC = () => {
    const [showSettings, setShowSettings] = useState(false);
    const [dailyProgress, setDailyProgress] = useState(ingredientDiscoveryService.getDailyProgress());
    const [timeUntilNext, setTimeUntilNext] = useState(ingredientDiscoveryService.getTimeUntilNextDiscovery());
    const [recentDiscoveries, setRecentDiscoveries] = useState(ingredientDiscoveryService.getDiscoveries());

    useEffect(() => {
        // Update progress every minute
        const interval = setInterval(() => {
            setDailyProgress(ingredientDiscoveryService.getDailyProgress());
            setTimeUntilNext(ingredientDiscoveryService.getTimeUntilNextDiscovery());
            setRecentDiscoveries(ingredientDiscoveryService.getDiscoveries());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (milliseconds: number): string => {
        if (milliseconds === 0) return 'Ready!';
        
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const forceDiscovery = () => {
        // Temporarily allow discovery
        const currentSettings = ingredientDiscoveryService.getSettings();
        ingredientDiscoveryService.updateSettings({
            lastDiscoveryTime: Date.now() - (currentSettings.intervalHours * 60 * 60 * 1000)
        });

        const discoveries = ingredientDiscoveryService.discoverIngredients();
        if (discoveries.length > 0) {
            Alert.alert(
                'Ingredients Found!',
                `Your pet found ${discoveries.length} ingredient(s)! Check the notifications above.`
            );
        } else {
            Alert.alert('No Luck', 'Your pet didn\'t find any ingredients this time.');
        }

        // Restore original timing
        ingredientDiscoveryService.updateSettings(currentSettings);
        
        // Update UI
        setDailyProgress(ingredientDiscoveryService.getDailyProgress());
        setTimeUntilNext(ingredientDiscoveryService.getTimeUntilNextDiscovery());
        setRecentDiscoveries(ingredientDiscoveryService.getDiscoveries());
    };

    const handleIngredientCollected = (ingredientId: string, quantity: number) => {
        // This is where you'd integrate with your inventory system
        Alert.alert(
            'Ingredient Collected!',
            `Added ${quantity}x ${ingredientId} to your inventory!`
        );
        
        // Update discoveries list
        setRecentDiscoveries(ingredientDiscoveryService.getDiscoveries());
    };

    const clearAllDiscoveries = () => {
        Alert.alert(
            'Clear All Discoveries',
            'Are you sure you want to clear all recent discoveries?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => {
                        // This would clear the discoveries in the service
                        // For demo purposes, we'll just update the UI
                        setRecentDiscoveries([]);
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Ingredient Discovery Notifications */}
            <IngredientDiscoveryNotification 
                onIngredientCollected={handleIngredientCollected}
            />

            <ScrollView style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>🍃 Ingredient Discovery System</Text>
                    <Text style={styles.subtitle}>
                        Your pet automatically finds ingredients while you're away!
                    </Text>
                </View>

                <View style={styles.statusCard}>
                    <Text style={styles.statusTitle}>📊 Discovery Status</Text>
                    
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Next discovery:</Text>
                        <Text style={styles.statusValue}>{formatTime(timeUntilNext)}</Text>
                    </View>
                    
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Today's progress:</Text>
                        <Text style={styles.statusValue}>
                            {dailyProgress.current} / {dailyProgress.max}
                        </Text>
                    </View>
                    
                    <View style={styles.progressBar}>
                        <View 
                            style={[
                                styles.progressFill, 
                                { width: `${dailyProgress.percentage}%` }
                            ]} 
                        />
                    </View>
                </View>

                <View style={styles.actionsCard}>
                    <Text style={styles.cardTitle}>🎯 Quick Actions</Text>
                    
                    <TouchableOpacity style={styles.actionButton} onPress={forceDiscovery}>
                        <Text style={styles.actionButtonText}>🔍 Force Discovery</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.settingsButton]} 
                        onPress={() => setShowSettings(!showSettings)}
                    >
                        <Text style={styles.actionButtonText}>⚙️ Discovery Settings</Text>
                    </TouchableOpacity>
                </View>

                {showSettings && (
                    <View style={styles.settingsCard}>
                        <Text style={styles.cardTitle}>⚙️ Discovery Settings</Text>
                        <DiscoverySettings />
                    </View>
                )}

                <View style={styles.discoveriesCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>📝 Recent Discoveries</Text>
                        <TouchableOpacity onPress={clearAllDiscoveries}>
                            <Text style={styles.clearButton}>Clear All</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {recentDiscoveries.length === 0 ? (
                        <Text style={styles.noDiscoveries}>
                            No discoveries yet. Your pet will find ingredients automatically!
                        </Text>
                    ) : (
                        recentDiscoveries.slice(-5).map((discovery) => (
                            <View key={discovery.id} style={styles.discoveryItem}>
                                <Text style={styles.discoveryMessage}>{discovery.message}</Text>
                                <Text style={styles.discoveryDetails}>
                                    {discovery.quantity}x {discovery.ingredientId} • {discovery.rarity}
                                </Text>
                                <Text style={styles.discoveryTime}>
                                    {new Date(discovery.discoveredAt).toLocaleTimeString()}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>ℹ️ How It Works</Text>
                    
                    <Text style={styles.infoText}>
                        • Your pet automatically explores every few hours
                    </Text>
                    <Text style={styles.infoText}>
                        • Discovery chance and timing are configurable
                    </Text>
                    <Text style={styles.infoText}>
                        • Rarer ingredients have lower drop rates
                    </Text>
                    <Text style={styles.infoText}>
                        • Daily limits prevent excessive discoveries
                    </Text>
                    <Text style={styles.infoText}>
                        • Notifications appear when ingredients are found
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        paddingTop: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    statusCard: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statusLabel: {
        fontSize: 16,
        color: '#666',
    },
    statusValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    progressBar: {
        height: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        overflow: 'hidden',
        marginTop: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 6,
    },
    actionsCard: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    actionButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    settingsButton: {
        backgroundColor: '#2196F3',
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    settingsCard: {
        backgroundColor: '#ffffff',
        margin: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    discoveriesCard: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    clearButton: {
        color: '#f44336',
        fontSize: 14,
        fontWeight: '600',
    },
    noDiscoveries: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
        paddingVertical: 20,
    },
    discoveryItem: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    discoveryMessage: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
        fontWeight: '500',
    },
    discoveryDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    discoveryTime: {
        fontSize: 12,
        color: '#999',
    },
    infoCard: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 32,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
});

export default IngredientDiscoveryDemo;
