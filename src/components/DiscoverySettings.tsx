import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native';
import { ingredientDiscoveryService, DiscoverySettings } from '../services/IngredientDiscoveryService';

export const DiscoverySettings: React.FC = () => {
    const [settings, setSettings] = useState<DiscoverySettings>(ingredientDiscoveryService.getSettings());
    const [dailyProgress, setDailyProgress] = useState(ingredientDiscoveryService.getDailyProgress());
    const [timeUntilNext, setTimeUntilNext] = useState(ingredientDiscoveryService.getTimeUntilNextDiscovery());

    useEffect(() => {
        // Update progress every minute
        const interval = setInterval(() => {
            setDailyProgress(ingredientDiscoveryService.getDailyProgress());
            setTimeUntilNext(ingredientDiscoveryService.getTimeUntilNextDiscovery());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const updateSetting = (key: keyof DiscoverySettings, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        ingredientDiscoveryService.updateSettings(newSettings);
    };

    const formatTime = (milliseconds: number): string => {
        if (milliseconds === 0) return 'Ready!';
        
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const resetDailyProgress = () => {
        Alert.alert(
            'Reset Daily Progress',
            'Are you sure you want to reset today\'s discovery progress? This will allow you to discover more ingredients today.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        ingredientDiscoveryService.updateSettings({
                            dailyDiscoveries: 0,
                            lastDailyReset: new Date().toISOString().split('T')[0]
                        });
                        setDailyProgress(ingredientDiscoveryService.getDailyProgress());
                    }
                }
            ]
        );
    };

    const testDiscovery = () => {
        Alert.alert(
            'Test Discovery',
            'This will trigger a test ingredient discovery. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Test',
                    onPress: () => {
                        // Temporarily set last discovery time to allow immediate discovery
                        const testSettings = {
                            ...settings,
                            lastDiscoveryTime: Date.now() - (settings.intervalHours * 60 * 60 * 1000)
                        };
                        ingredientDiscoveryService.updateSettings(testSettings);
                        
                        // Trigger discovery
                        const discoveries = ingredientDiscoveryService.discoverIngredients();
                        if (discoveries.length > 0) {
                            Alert.alert('Discovery Test', `Found ${discoveries.length} ingredient(s)!`);
                        } else {
                            Alert.alert('Discovery Test', 'No ingredients found this time.');
                        }
                        
                        // Restore original settings
                        ingredientDiscoveryService.updateSettings(settings);
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🕐 Discovery Timing</Text>
                
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Auto-discovery enabled</Text>
                    <Switch
                        value={settings.enabled}
                        onValueChange={(value) => updateSetting('enabled', value)}
                        trackColor={{ false: '#ccc', true: '#4CAF50' }}
                        thumbColor={settings.enabled ? '#fff' : '#f4f3f4'}
                    />
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Discovery interval</Text>
                    <View style={styles.intervalSelector}>
                        {[2, 4, 6, 8, 12].map((hours) => (
                            <TouchableOpacity
                                key={hours}
                                style={[
                                    styles.intervalButton,
                                    settings.intervalHours === hours && styles.intervalButtonActive
                                ]}
                                onPress={() => updateSetting('intervalHours', hours)}
                            >
                                <Text style={[
                                    styles.intervalButtonText,
                                    settings.intervalHours === hours && styles.intervalButtonTextActive
                                ]}>
                                    {hours}h
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        Next discovery in: <Text style={styles.highlight}>{formatTime(timeUntilNext)}</Text>
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Discovery Chances</Text>
                
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Discovery success rate</Text>
                    <View style={styles.percentageSelector}>
                        {[0.5, 0.6, 0.7, 0.8, 0.9].map((chance) => (
                            <TouchableOpacity
                                key={chance}
                                style={[
                                    styles.percentageButton,
                                    settings.discoveryChance === chance && styles.percentageButtonActive
                                ]}
                                onPress={() => updateSetting('discoveryChance', chance)}
                            >
                                <Text style={[
                                    styles.percentageButtonText,
                                    settings.discoveryChance === chance && styles.percentageButtonTextActive
                                ]}>
                                    {Math.round(chance * 100)}%
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Max discoveries per day</Text>
                    <View style={styles.maxSelector}>
                        {[3, 4, 5, 6, 8].map((max) => (
                            <TouchableOpacity
                                key={max}
                                style={[
                                    styles.maxButton,
                                    settings.maxDiscoveriesPerDay === max && styles.maxButtonActive
                                ]}
                                onPress={() => updateSetting('maxDiscoveriesPerDay', max)}
                            >
                                <Text style={[
                                    styles.maxButtonText,
                                    settings.maxDiscoveriesPerDay === max && styles.maxButtonTextActive
                                ]}>
                                    {max}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Today's Progress</Text>
                
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View 
                            style={[
                                styles.progressFill, 
                                { width: `${dailyProgress.percentage}%` }
                            ]} 
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {dailyProgress.current} / {dailyProgress.max} discoveries
                    </Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.resetButton} onPress={resetDailyProgress}>
                        <Text style={styles.resetButtonText}>Reset Progress</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.testButton} onPress={testDiscovery}>
                        <Text style={styles.testButtonText}>Test Discovery</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ℹ️ How It Works</Text>
                
                <Text style={styles.explanationText}>
                    Your pet automatically explores and finds ingredients every {settings.intervalHours} hours. 
                    The discovery chance determines how likely your pet is to find something each time.
                </Text>
                
                <Text style={styles.explanationText}>
                    Rarer ingredients have lower drop rates but provide better bonuses. 
                    You can collect up to {settings.maxDiscoveriesPerDay} ingredients per day.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    section: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    intervalSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    intervalButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        minWidth: 50,
        alignItems: 'center',
    },
    intervalButtonActive: {
        backgroundColor: '#4CAF50',
    },
    intervalButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    intervalButtonTextActive: {
        color: '#ffffff',
    },
    percentageSelector: {
        flexDirection: 'row',
        gap: 6,
    },
    percentageButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        minWidth: 45,
        alignItems: 'center',
    },
    percentageButtonActive: {
        backgroundColor: '#2196F3',
    },
    percentageButtonText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    percentageButtonTextActive: {
        color: '#ffffff',
    },
    maxSelector: {
        flexDirection: 'row',
        gap: 6,
    },
    maxButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        minWidth: 40,
        alignItems: 'center',
    },
    maxButtonActive: {
        backgroundColor: '#FF9800',
    },
    maxButtonText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    maxButtonTextActive: {
        color: '#ffffff',
    },
    infoBox: {
        backgroundColor: '#e3f2fd',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    infoText: {
        fontSize: 14,
        color: '#1976d2',
    },
    highlight: {
        fontWeight: 'bold',
    },
    progressContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    progressBar: {
        width: '100%',
        height: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 10,
    },
    progressText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    resetButton: {
        flex: 1,
        backgroundColor: '#f44336',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    testButton: {
        flex: 1,
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    testButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    explanationText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
});

export default DiscoverySettings;
