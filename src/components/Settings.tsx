import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView, Alert, Image, PanResponder, Animated } from 'react-native';
import SettingsService, { MenuButton } from '../services/SettingsService';

interface Props {
    onBack: () => void;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onSettingsChanged?: () => void;
}

const Settings: React.FC<Props> = ({ onBack, onNotification, onSettingsChanged }) => {
    const [settingsService] = useState(() => SettingsService.getInstance());
    const [menuButtons, setMenuButtons] = useState<MenuButton[]>([]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [theme, setTheme] = useState('default');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const panRefs = useRef<{ [key: string]: Animated.Value }>({});

    // Initialize pan values for each button
    useEffect(() => {
        menuButtons.forEach(button => {
            if (!panRefs.current[button.id]) {
                panRefs.current[button.id] = new Animated.Value(0);
            }
        });
    }, [menuButtons]);

    // Helper function to get image source based on icon name
    const getImageSource = (iconName: string) => {
        switch (iconName) {
            case 'feed': return require('../../assets/images/feed.png');
            case 'chat': return require('../../assets/images/chat.png');
            case 'games': return require('../../assets/images/games.png');
            case 'sleep': return require('../../assets/images/sleepzzzz.png');
            case 'shop': return require('../../assets/images/shop.png');
            case 'inventory': return require('../../assets/images/backpack.png');
            case 'gallery': return require('../../assets/images/gallery.png');
            case 'settings': return require('../../assets/images/settings.png');
            default: return require('../../assets/images/settings.png');
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        await settingsService.initialize();
        const buttons = settingsService.getMenuButtons();
        setMenuButtons(buttons);
        setSoundEnabled(settingsService.isSoundEnabled());
        setNotificationsEnabled(settingsService.isNotificationsEnabled());
        setTheme(settingsService.getTheme());
    };



    const moveButton = async (buttonId: string, direction: 'up' | 'down') => {
        const button = menuButtons.find(b => b.id === buttonId);
        if (!button) return;

        const currentIndex = menuButtons.findIndex(b => b.id === buttonId);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex >= 0 && newIndex < menuButtons.length) {
            // Create a new array with the reordered buttons
            const newMenuButtons = [...menuButtons];
            const targetButton = newMenuButtons[newIndex];
            
            // Swap the buttons in the array
            newMenuButtons[currentIndex] = targetButton;
            newMenuButtons[newIndex] = button;
            
            // Update the order values to match the new positions
            newMenuButtons.forEach((btn, index) => {
                btn.order = index;
            });
            
            // Update the settings service with the new order
            settingsService.settings.menuButtons = newMenuButtons;
            await settingsService.saveSettings();
            
            // Reload settings to reflect the change
            await loadSettings();
            onNotification?.(`Moved ${button.name} ${direction}`, 'success');
            onSettingsChanged?.();
        }
    };

    const resetToDefault = async () => {
        Alert.alert(
            'Reset Settings',
            'Are you sure you want to reset all settings to default?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        await settingsService.resetMenuButtons();
                        await loadSettings();
                        onNotification?.('Settings reset to default', 'success');
                    }
                }
            ]
        );
    };

    const updateSoundSetting = async (enabled: boolean) => {
        await settingsService.setSoundEnabled(enabled);
        setSoundEnabled(enabled);
        onNotification?.(`Sound ${enabled ? 'enabled' : 'disabled'}`, 'success');
    };

    const updateNotificationSetting = async (enabled: boolean) => {
        await settingsService.setNotificationsEnabled(enabled);
        setNotificationsEnabled(enabled);
        onNotification?.(`Notifications ${enabled ? 'enabled' : 'disabled'}`, 'success');
    };

    const updateTheme = async (newTheme: string) => {
        await settingsService.setTheme(newTheme);
        setTheme(newTheme);
        onNotification?.(`Theme changed to ${newTheme}`, 'success');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                {/* Menu Button Configuration */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Menu Buttons</Text>
                    <Text style={styles.sectionDescription}>
                        Configure which buttons appear in the interaction menu and their order. Use ↑ to move a button earlier in the list, ↓ to move it later.
                    </Text>
                    
                    {/* Mini Menu Preview */}
                    <View style={styles.miniMenuPreview}>
                        <View style={styles.miniMenuBar}>
                            <View style={styles.miniMenuRow}>
                                {menuButtons.slice(0, 4).map((button, index) => (
                                    <View key={`preview-${button.id}`} style={styles.miniButton}>
                                        <Image 
                                            source={getImageSource(button.icon)} 
                                            style={styles.miniButtonImage} 
                                        />
                                    </View>
                                ))}
                            </View>
                            {menuButtons.length > 4 && (
                                <View style={styles.miniMenuRow}>
                                    {menuButtons.slice(4, 8).map((button, index) => (
                                        <View key={`preview-${button.id}`} style={styles.miniButton}>
                                            <Image 
                                                source={getImageSource(button.icon)} 
                                                style={styles.miniButtonImage} 
                                            />
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                    
                    {menuButtons.map((button, index) => {
                        const pan = panRefs.current[button.id];
                        
                        const panResponder = PanResponder.create({
                            onStartShouldSetPanResponder: () => true,
                            onPanResponderGrant: () => {
                                setDraggedIndex(index);
                                pan?.setValue(0);
                            },
                            onPanResponderMove: (evt, gestureState) => {
                                if (pan) {
                                    pan.setValue(gestureState.dy);
                                    
                                    // Only update the list if dragged a significant distance
                                    const itemHeight = 60;
                                    const dragDistance = gestureState.dy;
                                    const threshold = itemHeight; // Must drag the full height of an item
                                    
                                    if (Math.abs(dragDistance) > threshold) {
                                        const targetIndex = Math.max(0, Math.min(menuButtons.length - 1, 
                                            index + Math.round(dragDistance / itemHeight)));
                                        
                                        // Update the list to show the shift
                                        if (targetIndex !== index) {
                                            const newMenuButtons = [...menuButtons];
                                            const [movedItem] = newMenuButtons.splice(index, 1);
                                            newMenuButtons.splice(targetIndex, 0, movedItem);
                                            setMenuButtons(newMenuButtons);
                                            // Update the dragged index to track the moved item
                                            setDraggedIndex(targetIndex);
                                        }
                                    }
                                }
                            },
                            onPanResponderRelease: (evt, gestureState) => {
                                if (pan) {
                                    // Update order values for the current state
                                    menuButtons.forEach((btn, idx) => {
                                        btn.order = idx;
                                    });
                                    
                                    // Save changes
                                    settingsService.settings.menuButtons = menuButtons;
                                    settingsService.saveSettings();
                                    onSettingsChanged?.();
                                    onNotification?.(`Moved ${button.name}`, 'success');
                                    
                                    Animated.spring(pan, {
                                        toValue: 0,
                                        useNativeDriver: false,
                                    }).start();
                                }
                                setDraggedIndex(null);
                            },
                        });

                        return (
                            <Animated.View 
                                key={button.id} 
                                style={[
                                    styles.buttonRow,
                                    draggedIndex === index && styles.draggedItem,
                                    {
                                        transform: pan ? [{ translateY: pan }] : [],
                                        elevation: draggedIndex === index ? 10 : 0, // Android
                                        zIndex: draggedIndex === index ? 1000 : 1, // iOS
                                    }
                                ]}
                                {...panResponder.panHandlers}
                            >
                                <View style={styles.dragHandle}>
                                    <Text style={styles.dragHandleText}>⋮⋮</Text>
                                </View>
                                
                                <Image 
                                    source={getImageSource(button.icon)} 
                                    style={styles.buttonIcon} 
                                />
                                
                                <View style={styles.buttonInfo}>
                                    <Text style={styles.buttonName}>{button.name}</Text>
                                </View>
                            </Animated.View>
                        );
                    })}
                    
                    <TouchableOpacity style={styles.resetButton} onPress={resetToDefault}>
                        <Text style={styles.resetButtonText}>Reset to Default</Text>
                    </TouchableOpacity>
                </View>

                {/* General Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General Settings</Text>
                    
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Sound Effects</Text>
                        <Switch
                            value={soundEnabled}
                            onValueChange={updateSoundSetting}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={soundEnabled ? '#f5dd4b' : '#f4f3f4'}
                        />
                    </View>
                    
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Notifications</Text>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={updateNotificationSetting}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={notificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Theme Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Theme</Text>
                    
                    <View style={styles.themeButtons}>
                        <TouchableOpacity
                            style={[styles.themeButton, theme === 'default' && styles.activeThemeButton]}
                            onPress={() => updateTheme('default')}
                        >
                            <Text style={[styles.themeButtonText, theme === 'default' && styles.activeThemeButtonText]}>
                                Default
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.themeButton, theme === 'mint' && styles.activeThemeButton]}
                            onPress={() => updateTheme('mint')}
                        >
                            <Text style={[styles.themeButtonText, theme === 'mint' && styles.activeThemeButtonText]}>
                                Mint
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.themeButton, theme === 'dark' && styles.activeThemeButton]}
                            onPress={() => updateTheme('dark')}
                        >
                            <Text style={[styles.themeButtonText, theme === 'dark' && styles.activeThemeButtonText]}>
                                Dark
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F5E8',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2E5A3E',
        backgroundColor: '#d4f5c4',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#2E5A3E',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E5A3E',
        marginLeft: 16,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#f0fff0',
        borderRadius: 8,
        padding: 16,
        borderWidth: 2,
        borderColor: '#2E5A3E',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E5A3E',
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#2E5A3E',
        marginBottom: 16,
        opacity: 0.8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2E5A3E',
        backgroundColor: '#f0fff0',
    },
    buttonInfo: {
        flex: 1,
        marginLeft: 12,
    },
    buttonName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E5A3E',
    },
    dragHandle: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#d4f5c4',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#2E5A3E',
    },
    dragHandleText: {
        fontSize: 12,
        color: '#2E5A3E',
        fontWeight: 'bold',
    },
    buttonIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginLeft: 8,
    },
    draggedItem: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        backgroundColor: '#f0fff0',
    },

    resetButton: {
        backgroundColor: '#2E5A3E',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 16,
    },
    resetButtonText: {
        color: '#E8F5E8',
        fontSize: 16,
        fontWeight: 'bold',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2E5A3E',
    },
    settingLabel: {
        fontSize: 16,
        color: '#2E5A3E',
        fontWeight: '500',
    },
    themeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    themeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#2E5A3E',
        backgroundColor: '#E8F5E8',
    },
    activeThemeButton: {
        backgroundColor: '#2E5A3E',
    },
    themeButtonText: {
        fontSize: 14,
        color: '#2E5A3E',
        fontWeight: 'bold',
    },
    activeThemeButtonText: {
        color: '#E8F5E8',
    },
    miniMenuPreview: {
        marginBottom: 16,
        padding: 8,
        backgroundColor: '#f0fff0',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#2E5A3E',
    },
    miniMenuBar: {
        backgroundColor: '#E8F5E8',
        borderRadius: 3,
        padding: 4,
        borderWidth: 1,
        borderColor: '#2E5A3E',
    },
    miniMenuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 1,
    },
    miniButton: {
        flex: 1,
        backgroundColor: '#d4f5c4',
        padding: 2,
        marginHorizontal: 1,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#2E5A3E',
        width: 20,
        height: 20,
    },
    miniButtonImage: {
        width: 12,
        height: 12,
        resizeMode: 'contain',
    },
});

export default Settings; 