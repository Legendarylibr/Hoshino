import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface GalleryProps {
    onBack: () => void;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    // Today's Actions props
    cycleProgress?: {
        todayCompleted: {
            feed: boolean;
            sleep: boolean;
            chat: boolean;
            moodBonus: boolean;
        };
    };
    onActionClick?: (action: 'feed' | 'sleep' | 'chat') => void;
    currentCycle?: any;
}

const Gallery: React.FC<GalleryProps> = ({
    onBack,
    onNotification,
    cycleProgress,
    onActionClick,
    currentCycle
}) => {
    const [activeTab, setActiveTab] = useState('actions');

    const handleActionClick = (action: 'feed' | 'sleep' | 'chat') => {
        if (onActionClick) {
            onActionClick(action);
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const dailyStat = currentCycle?.dailyStats.find((s: any) => s.date === today);
    const isSleeping = !!dailyStat?.sleepStartTime;

    return (
        <View style={[styles.tamagotchiScreenContainer, styles.galleryScreen]}>
            {/* Top Status Bar */}
            <View style={styles.tamagotchiTopStatus}>
                <Text style={styles.gearIcon}>🖼️</Text>
                <Text style={styles.walletStatusText}>Gallery</Text>
            </View>

            {/* Main LCD Screen */}
            <View style={styles.tamagotchiMainScreen}>
                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Today</Text>
                        <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Progress</Text>
                        <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Gallery</Text>
                        <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                    </View>
                </View>

                {/* Main Display Area */}
                <View style={styles.galleryMainDisplay}>
                    {/* Tab Navigation */}
                    <View style={styles.galleryTabNavigation}>
                        <TouchableOpacity
                            style={[styles.galleryTabButton, activeTab === 'actions' ? styles.active : null]}
                            onPress={() => setActiveTab('actions')}
                        >
                            <Text>Actions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.galleryTabButton, activeTab === 'achievements' ? styles.active : null]}
                            onPress={() => setActiveTab('achievements')}
                        >
                            <Text>Achieve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.galleryTabButton, activeTab === 'moments' ? styles.active : null]}
                            onPress={() => setActiveTab('moments')}
                        >
                            <Text>Moments</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.galleryTabButton, activeTab === 'stats' ? styles.active : null]}
                            onPress={() => setActiveTab('stats')}
                        >
                            <Text>Stats</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content Area */}
                    <View style={styles.galleryContentArea}>
                        {activeTab === 'actions' && (
                            <View style={styles.galleryActionsSection}>
                                <Text style={styles.gallerySectionTitle}>Today's Actions</Text>
                                <View style={styles.galleryActionGrid}>
                                    <TouchableOpacity
                                        style={[styles.galleryActionItem, cycleProgress?.todayCompleted.feed ? styles.completed : null]}
                                        onPress={() => !cycleProgress?.todayCompleted.feed && handleActionClick('feed')}
                                    >
                                        <Text style={styles.actionIcon}>🍜</Text>
                                        <Text style={styles.actionName}>Feed</Text>
                                        {cycleProgress?.todayCompleted.feed && <Text style={styles.check}>✅</Text>}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.galleryActionItem, cycleProgress?.todayCompleted.sleep ? styles.completed : null, isSleeping ? styles.sleeping : null]}
                                        onPress={() => handleActionClick('sleep')}
                                    >
                                        <Text style={styles.actionIcon}>{isSleeping ? '😴💤' : '😴'}</Text>
                                        <Text style={styles.actionName}>{isSleeping ? 'Wake Up' : 'Sleep'}</Text>
                                        {cycleProgress?.todayCompleted.sleep && <Text style={styles.check}>✅</Text>}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.galleryActionItem, cycleProgress?.todayCompleted.chat ? styles.completed : null]}
                                        onPress={() => !cycleProgress?.todayCompleted.chat && handleActionClick('chat')}
                                    >
                                        <Text style={styles.actionIcon}>💬</Text>
                                        <Text style={styles.actionName}>Chat</Text>
                                        {cycleProgress?.todayCompleted.chat && <Text style={styles.check}>✅</Text>}
                                    </TouchableOpacity>
                                </View>

                                {cycleProgress?.todayCompleted.moodBonus && (
                                    <View style={styles.moodBonusEarned}>
                                        <Text>✨ Today's mood bonus earned!</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {activeTab === 'achievements' && (
                            <View style={styles.gallerySection}>
                                <Text style={styles.gallerySectionTitle}>Achievements</Text>
                                <Text style={styles.galleryComingSoon}>🏆 Coming soon! Your achievements and milestones will appear here.</Text>
                            </View>
                        )}

                        {activeTab === 'moments' && (
                            <View style={styles.gallerySection}>
                                <Text style={styles.gallerySectionTitle}>Captured Moments</Text>
                                <Text style={styles.galleryComingSoon}>📸 Coming soon! Your memorable moments with your moonling will be saved here.</Text>
                            </View>
                        )}

                        {activeTab === 'stats' && (
                            <View style={styles.gallerySection}>
                                <Text style={styles.gallerySectionTitle}>Statistics</Text>
                                <Text style={styles.galleryComingSoon}>📊 Coming soon! Detailed statistics and progress tracking.</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Bottom Navigation Buttons */}
            <TouchableOpacity style={[styles.bottomButton, styles.left]} onPress={onBack} accessibilityLabel="Go Back">
                <Text>←</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.bottomButton, styles.center]}
                onPress={() => onNotification?.('📷 Screenshot feature coming soon!', 'info')}
                accessibilityLabel="Take Screenshot"
            >
                <Text>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.bottomButton, styles.right]}
                onPress={() => onNotification?.('📊 Gallery Help: View your daily actions, achievements, and captured moments!', 'info')}
                accessibilityLabel="Help"
            >
                <Text>?</Text>
            </TouchableOpacity>

            {/* Physical Device Buttons - overlaid on background image */}
            <TouchableOpacity
                style={[styles.deviceButton, styles.leftPhysical]}
                onPress={onBack}
                accessibilityLabel="Left physical button - Go Back"
            />
            <TouchableOpacity
                style={[styles.deviceButton, styles.centerPhysical]}
                onPress={() => onNotification?.('📷 Screenshot feature coming soon!', 'info')}
                accessibilityLabel="Center physical button - Take Screenshot"
            />
            <TouchableOpacity
                style={[styles.deviceButton, styles.rightPhysical]}
                onPress={() => onNotification?.('📊 Gallery Help: View your daily actions, achievements, and captured moments!', 'info')}
                accessibilityLabel="Right physical button - Help"
            />

        </View>
    );
};

const styles = StyleSheet.create({
    tamagotchiScreenContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    galleryScreen: {},
    tamagotchiTopStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#f0f0f0',
    },
    gearIcon: {
        fontSize: 24,
        marginRight: 10,
    },
    walletStatusText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    tamagotchiMainScreen: {
        flex: 1,
        padding: 10,
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 14,
    },
    starRating: {
        fontSize: 14,
    },
    galleryMainDisplay: {
        flex: 1,
    },
    galleryTabNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    galleryTabButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#eee',
    },
    active: {
        backgroundColor: '#ccc',
    },
    galleryContentArea: {
        flex: 1,
    },
    galleryActionsSection: {
        flex: 1,
    },
    gallerySectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    galleryActionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    galleryActionItem: {
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
    },
    completed: {
        backgroundColor: '#dff0d8',
    },
    sleeping: {
        backgroundColor: '#f0f8ff',
    },
    actionIcon: {
        fontSize: 24,
    },
    actionName: {
        fontSize: 14,
    },
    check: {
        fontSize: 16,
    },
    moodBonusEarned: {
        marginTop: 10,
        alignItems: 'center',
    },
    gallerySection: {
        flex: 1,
    },
    galleryComingSoon: {
        textAlign: 'center',
        fontSize: 14,
        color: '#888',
    },
    bottomButton: {
        position: 'absolute',
        bottom: 20,
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 5,
    },
    left: {
        left: 20,
    },
    center: {
        left: '50%',
        transform: [{ translateX: -25 }],
    },
    right: {
        right: 20,
    },
    deviceButton: {
        position: 'absolute',
        bottom: 10,
        width: 50,
        height: 50,
        backgroundColor: 'transparent',
    },
    leftPhysical: {
        left: 10,
    },
    centerPhysical: {
        left: '50%',
        transform: [{ translateX: -25 }],
    },
    rightPhysical: {
        right: 10,
    },
});

export default Gallery;