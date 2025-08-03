import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import InnerScreen from './InnerScreen';

interface GalleryProps {
    onBack: () => void;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    cycleProgress?: number;
    onActionClick?: (action: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({
    onBack,
    onNotification,
    cycleProgress = 0,
    onActionClick
}) => {
    const [activeTab, setActiveTab] = useState<'actions' | 'achievements' | 'moments' | 'stats'>('actions');

    // Mock data for gallery content
    const actions = [
        { id: 1, type: 'feed', description: 'Fed Lyra with starberry', timestamp: '2 hours ago', icon: '🍎' },
        { id: 2, type: 'play', description: 'Played games with Orion', timestamp: '4 hours ago', icon: '🎮' },
        { id: 3, type: 'sleep', description: 'Put Aro to sleep', timestamp: '6 hours ago', icon: '😴' },
        { id: 4, type: 'chat', description: 'Had a deep conversation with Sirius', timestamp: '1 day ago', icon: '💬' },
        { id: 5, type: 'mint', description: 'Minted Zaniah as NFT', timestamp: '2 days ago', icon: '🪙' },
    ];

    const achievements = [
        { id: 1, name: 'First Friend', description: 'Adopted your first moonling', icon: '🌟', unlocked: true },
        { id: 2, type: 'play', description: 'Fed a moonling 10 times', icon: '🍎', unlocked: true },
        { id: 3, type: 'play', description: 'Played with moonlings 5 times', icon: '🎮', unlocked: true },
        { id: 4, name: 'Collector', description: 'Own 3 different moonlings', icon: '👑', unlocked: false },
        { id: 5, name: 'Cosmic Guardian', description: 'Care for moonlings for 7 days', icon: '🌙', unlocked: false },
    ];

    const moments = [
        { id: 1, title: 'First Meeting', description: 'The day you met Lyra', date: '2025-01-15', image: 'LYRA.png' },
        { id: 2, title: 'Starry Night', description: 'Orion gazing at the stars', date: '2025-01-16', image: 'ORION.png' },
        { id: 3, title: 'Energy Burst', description: 'Aro radiating with joy', date: '2025-01-17', image: 'ARO.png' },
        { id: 4, title: 'Loyal Guardian', description: 'Sirius protecting the realm', date: '2025-01-18', image: 'SIRIUS.png' },
        { id: 5, title: 'Ancient Wisdom', description: 'Zaniah sharing cosmic knowledge', date: '2025-01-19', image: 'ZANIAH.png' },
    ];

    return (
        <InnerScreen
            onLeftButtonPress={onBack}
            onCenterButtonPress={() => onNotification?.('📷 Screenshot feature coming soon!', 'info')}
            onRightButtonPress={() => onNotification?.('📊 Gallery Help: View your daily actions, achievements, and captured moments!', 'info')}
            leftButtonText="←"
            centerButtonText="📷"
            rightButtonText="?"
        >
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
                        <View style={styles.gallerySection}>
                            <Text style={styles.gallerySectionTitle}>Recent Actions</Text>
                            <ScrollView style={styles.galleryScrollView}>
                                {actions.map((action) => (
                                    <TouchableOpacity
                                        key={action.id}
                                        style={styles.galleryItem}
                                        onPress={() => onActionClick?.(action.type)}
                                    >
                                        <Text style={styles.galleryItemIcon}>{action.icon}</Text>
                                        <View style={styles.galleryItemContent}>
                                            <Text style={styles.galleryItemTitle}>{action.description}</Text>
                                            <Text style={styles.galleryItemSubtitle}>{action.timestamp}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {activeTab === 'achievements' && (
                        <View style={styles.gallerySection}>
                            <Text style={styles.gallerySectionTitle}>Achievements</Text>
                            <ScrollView style={styles.galleryScrollView}>
                                {achievements.map((achievement) => (
                                    <TouchableOpacity
                                        key={achievement.id}
                                        style={[styles.galleryItem, !achievement.unlocked && styles.locked]}
                                        onPress={() => onActionClick?.(achievement.name)}
                                    >
                                        <Text style={styles.galleryItemIcon}>{achievement.icon}</Text>
                                        <View style={styles.galleryItemContent}>
                                            <Text style={styles.galleryItemTitle}>{achievement.name}</Text>
                                            <Text style={styles.galleryItemSubtitle}>{achievement.description}</Text>
                                        </View>
                                        {achievement.unlocked && <Text style={styles.unlockedBadge}>✓</Text>}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {activeTab === 'moments' && (
                        <View style={styles.gallerySection}>
                            <Text style={styles.gallerySectionTitle}>Captured Moments</Text>
                            <ScrollView style={styles.galleryScrollView}>
                                {moments.map((moment) => (
                                    <TouchableOpacity
                                        key={moment.id}
                                        style={styles.galleryItem}
                                        onPress={() => onActionClick?.(moment.title)}
                                    >
                                        <Image
                                            source={require(`../../assets/images/${moment.image}`)}
                                            style={styles.galleryItemImage}
                                        />
                                        <View style={styles.galleryItemContent}>
                                            <Text style={styles.galleryItemTitle}>{moment.title}</Text>
                                            <Text style={styles.galleryItemSubtitle}>{moment.description}</Text>
                                            <Text style={styles.galleryItemDate}>{moment.date}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
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
        </InnerScreen>
    );
};

const styles = StyleSheet.create({
    galleryMainDisplay: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        margin: 10,
        overflow: 'hidden',
    },
    galleryTabNavigation: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        padding: 5,
    },
    galleryTabButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
        marginHorizontal: 2,
    },
    active: {
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
    },
    galleryContentArea: {
        flex: 1,
        padding: 10,
    },
    gallerySection: {
        flex: 1,
    },
    gallerySectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    galleryScrollView: {
        flex: 1,
    },
    galleryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    locked: {
        opacity: 0.5,
    },
    galleryItemIcon: {
        fontSize: 24,
        marginRight: 10,
    },
    galleryItemImage: {
        width: 40,
        height: 40,
        borderRadius: 5,
        marginRight: 10,
    },
    galleryItemContent: {
        flex: 1,
    },
    galleryItemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    galleryItemSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    galleryItemDate: {
        fontSize: 10,
        color: '#999',
        marginTop: 2,
    },
    unlockedBadge: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    galleryComingSoon: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 50,
    },
});

export default Gallery;