import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FirebaseService, { 
    LeaderboardUser, 
    Achievement, 
    Milestone, 
    Memory, 
    UserStats,
    UserProgressData 
} from '../services/FirebaseService';

interface Props {
    onBack: () => void;
    walletAddress?: string;
}

const Gallery: React.FC<Props> = ({ onBack, walletAddress }) => {
    const [currentTab, setCurrentTab] = useState<'leaderboard' | 'achievements' | 'milestones' | 'memories'>('leaderboard');
    const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [memories, setMemories] = useState<Memory[]>([]);
    const [stats, setStats] = useState<UserStats>({
        totalAchievements: 0,
        totalMilestones: 0,
        totalMemories: 0,
        completionRate: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadGalleryData();
        loadLeaderboardData();
    }, [walletAddress]);

    const loadLeaderboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Use backend service instead of mock data
            const leaderboardData = await FirebaseService.getGlobalLeaderboard();
            setLeaderboardUsers(leaderboardData);
        } catch (error) {
            console.error('Failed to load leaderboard data:', error);
            setError('Failed to load leaderboard data');
            // No mock data fallback - let the hook handle it
        } finally {
            setLoading(false);
        }
    };

    const loadGalleryData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (walletAddress) {
                // Use backend service for authenticated users
                const userProgress = await FirebaseService.getUserProgress(walletAddress);
                setAchievements(userProgress.achievements);
                setMilestones(userProgress.milestones);
                setMemories(userProgress.memories);
                setStats(userProgress.stats);
            } else {
                // Use local storage for demo users
                const storageKey = 'gallery_demo';
                
                // Load achievements
                const storedAchievements = await AsyncStorage.getItem(`${storageKey}_achievements`);
                if (storedAchievements) {
                    const parsed = JSON.parse(storedAchievements);
                    const achievementsWithDates = parsed.map((a: any) => ({
                        ...a,
                        unlockedAt: new Date(a.unlockedAt)
                    }));
                    setAchievements(achievementsWithDates);
                } else {
                    // Initialize with empty arrays - data will come from backend
                    setAchievements([]);
                    setMilestones([]);
                    setMemories([]);
                }

                // Load milestones
                const storedMilestones = await AsyncStorage.getItem(`${storageKey}_milestones`);
                if (storedMilestones) {
                    const parsed = JSON.parse(storedMilestones);
                    const milestonesWithDates = parsed.map((m: any) => ({
                        ...m,
                        achievedAt: new Date(m.achievedAt)
                    }));
                    setMilestones(milestonesWithDates);
                } else {
                    // Initialize with empty arrays - data will come from backend
                    setMilestones([]);
                }

                // Load memories
                const storedMemories = await AsyncStorage.getItem(`${storageKey}_milestones`);
                if (storedMemories) {
                    const parsed = JSON.parse(storedMemories);
                    const memoriesWithDates = parsed.map((m: any) => ({
                        ...m,
                        date: new Date(m.date)
                    }));
                    setMemories(memoriesWithDates);
                } else {
                    // Initialize with empty arrays - data will come from backend
                    setMemories([]);
                }

                updateStats();
            }
        } catch (error) {
            console.error('Failed to load gallery data:', error);
            setError('Failed to load gallery data');
        } finally {
            setLoading(false);
        }
    };

    // Default data generation functions removed - now handled by backend

    // Default milestone generation function removed - now handled by backend

    const generateDefaultMemories = (): Memory[] => [
        {
            id: 'first-day',
            title: 'First Day Together',
            description: 'The beginning of our cosmic journey',
            type: 'special',
            date: new Date(),
            mood: 5,
            energy: 5,
            hunger: 5
        },
        {
            id: 'perfect-mood',
            title: 'Perfect Mood Day',
            description: 'Achieved maximum mood with your moonling',
            type: 'achievement',
            date: new Date(),
            mood: 5,
            energy: 4,
            hunger: 3
        },
        {
            id: 'sleep-success',
            title: 'Restful Night',
            description: 'Your moonling had a peaceful sleep',
            type: 'daily',
            date: new Date(),
            mood: 4,
            energy: 5,
            hunger: 2
        }
    ];

    const updateStats = () => {
        const totalAchievements = achievements.length;
        const totalMilestones = milestones.length;
        const totalMemories = memories.length;
        const completionRate = Math.round((totalAchievements / 6) * 100); // 6 total achievements

        setStats({
            totalAchievements,
            totalMilestones,
            totalMemories,
            completionRate
        });
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common': return '#8B8B8B';
            case 'rare': return '#4CAF50';
            case 'epic': return '#9C27B0';
            case 'legendary': return '#FF9800';
            default: return '#666';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'feeding': return '🍽️';
            case 'sleep': return '😴';
            case 'play': return '🎮';
            case 'chat': return '💬';
            case 'crafting': return '🍳';
            case 'collection': return '📦';
            default: return '⭐';
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    const renderLeaderboard = () => (
        <View style={styles.itemsContainer}>
            {loading && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading leaderboard...</Text>
                </View>
            )}
            
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
            
            <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>🏆 GLOBAL LEADERBOARD</Text>
                <View style={styles.statsRow}>
                    <Text style={styles.statsText}>Total Players: {leaderboardUsers.length}</Text>
                    <Text style={styles.statsText}>Last Updated: {new Date().toLocaleDateString()}</Text>
                </View>
            </View>
            
            <View style={styles.leaderboardGrid}>
                {leaderboardUsers.map((user) => (
                    <View key={user.id} style={[
                        styles.leaderboardCard,
                        user.rank <= 3 && styles.topRankCard
                    ]}>
                        <View style={styles.rankSection}>
                            <Text style={styles.rankIcon}>{getRankIcon(user.rank)}</Text>
                            <Text style={styles.rankNumber}>#{user.rank}</Text>
                        </View>
                        
                        <View style={styles.userInfo}>
                            <Text style={styles.userAvatar}>{user.avatar}</Text>
                            <View style={styles.userDetails}>
                                <Text style={styles.username}>{user.username}</Text>
                                <Text style={styles.walletAddress}>{user.walletAddress}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.userStats}>
                            <View style={styles.userStatItem}>
                                <Text style={styles.userStatLabel}>SCORE</Text>
                                <Text style={styles.userStatValue}>{user.totalScore.toLocaleString()}</Text>
                            </View>
                            <View style={styles.userStatItem}>
                                <Text style={styles.userStatLabel}>ACHIEVEMENTS</Text>
                                <Text style={styles.userStatValue}>{user.achievements}</Text>
                            </View>
                            <View style={styles.userStatItem}>
                                <Text style={styles.userStatLabel}>MOONLINGS</Text>
                                <Text style={styles.userStatValue}>{user.moonlings}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.userStats}>
                            <View style={styles.userStatItem}>
                                <Text style={styles.userStatLabel}>STAR FRAGMENTS</Text>
                                <Text style={styles.userStatValue}>{user.starFragments?.toLocaleString() || 0}</Text>
                            </View>
                            <View style={styles.userStatItem}>
                                <Text style={styles.userStatLabel}>STREAK</Text>
                                <Text style={styles.userStatValue}>{user.currentStreak || 0} days</Text>
                            </View>
                        </View>
                        
                        <Text style={styles.lastActiveText}>
                            Last active: {user.lastActive.toLocaleDateString()}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderAchievements = () => (
        <View style={styles.itemsContainer}>
            <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>🎖️ PERSONAL ACHIEVEMENTS</Text>
                <View style={styles.statsRow}>
                    <Text style={styles.statsText}>Completion: {stats.completionRate}%</Text>
                    <Text style={styles.statsText}>Unlocked: {stats.totalAchievements}/6</Text>
                </View>
            </View>
            
            <View style={styles.achievementsGrid}>
                {achievements.map((achievement) => (
                    <View key={achievement.id} style={styles.achievementCard}>
                        <View style={styles.achievementHeader}>
                            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                            <View style={styles.achievementInfo}>
                                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                            </View>
                        </View>
                        <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(achievement.rarity) }]}>
                            <Text style={styles.rarityText}>{achievement.rarity.toUpperCase()}</Text>
                        </View>
                        <View style={styles.achievementFooter}>
                            <Text style={styles.categoryText}>
                                {getCategoryIcon(achievement.category)} {achievement.category}
                            </Text>
                            <Text style={styles.dateText}>
                                {achievement.unlockedAt.toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderMilestones = () => (
        <View style={styles.itemsContainer}>
            <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>🎯 PERSONAL MILESTONES</Text>
                <View style={styles.statsRow}>
                    <Text style={styles.statsText}>Total Milestones: {stats.totalMilestones}</Text>
                </View>
            </View>
            
            <View style={styles.milestonesGrid}>
                {milestones.map((milestone) => (
                    <View key={milestone.id} style={styles.milestoneCard}>
                        <View style={styles.milestoneHeader}>
                            <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
                            <View style={styles.milestoneInfo}>
                                <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                                <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                            </View>
                        </View>
                        <View style={styles.valueBadge}>
                            <Text style={styles.valueText}>{milestone.value}</Text>
                        </View>
                        <View style={styles.milestoneFooter}>
                            <Text style={styles.typeText}>
                                {milestone.type.toUpperCase()}
                            </Text>
                            <Text style={styles.dateText}>
                                {milestone.achievedAt.toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderMemories = () => (
        <View style={styles.itemsContainer}>
            <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>📸 PERSONAL MEMORIES</Text>
                <View style={styles.statsRow}>
                    <Text style={styles.statsText}>Total Memories: {stats.totalMemories}</Text>
                </View>
            </View>
            
            <View style={styles.memoriesGrid}>
                {memories.map((memory) => (
                    <View key={memory.id} style={styles.memoryCard}>
                        <View style={styles.memoryHeader}>
                            <Text style={styles.memoryIcon}>📸</Text>
                            <View style={styles.memoryInfo}>
                                <Text style={styles.memoryTitle}>{memory.title}</Text>
                                <Text style={styles.memoryDescription}>{memory.description}</Text>
                            </View>
                            <View style={styles.memoryTypeBadge}>
                                <Text style={styles.typeText}>{memory.type.toUpperCase()}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.memoryStatsRow}>
                            <View style={styles.memoryStatItem}>
                                <Text style={styles.memoryStatLabel}>MOOD</Text>
                                <Text style={styles.memoryStatValue}>⭐ {memory.mood}</Text>
                            </View>
                            <View style={styles.memoryStatItem}>
                                <Text style={styles.memoryStatLabel}>ENERGY</Text>
                                <Text style={styles.memoryStatValue}>⚡ {memory.energy}</Text>
                            </View>
                            <View style={styles.memoryStatItem}>
                                <Text style={styles.memoryStatLabel}>HUNGER</Text>
                                <Text style={styles.memoryStatValue}>🍽️ {memory.hunger}</Text>
                            </View>
                        </View>
                        
                        <Text style={styles.dateText}>
                            {memory.date.toLocaleDateString()}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <>
            {/* Wallet Display Section - Absolute top of screen */}
            {walletAddress && (
                <View style={styles.walletDisplayContainer}>
                    <View style={styles.walletDisplay}>
                        <View style={styles.walletIconContainer}>
                            <Text style={styles.walletIcon}>💎</Text>
                        </View>
                        <View style={styles.walletInfo}>
                            <Text style={styles.walletLabel}>WALLET CONNECTED</Text>
                            <Text style={styles.walletAddressText}>{walletAddress}</Text>
                        </View>
                    </View>
                </View>
            )}

            <View style={styles.outerContainer}>
                <View style={styles.headerBox}>
                    <Text style={styles.headerText}>GALLERY</Text>
                </View>

                <View style={styles.tabNavigation}>
                    <TouchableOpacity
                        style={[styles.tabButton, currentTab === 'leaderboard' && styles.activeTab]}
                        onPress={() => setCurrentTab('leaderboard')}
                    >
                        <Text style={styles.tabButtonText} numberOfLines={1}>🏆 Leaderboard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, currentTab === 'achievements' && styles.activeTab]}
                        onPress={() => setCurrentTab('achievements')}
                    >
                        <Text style={styles.tabButtonText} numberOfLines={1}>🎖️ Achievements</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, currentTab === 'milestones' && styles.activeTab]}
                        onPress={() => setCurrentTab('milestones')}
                    >
                        <Text style={styles.tabButtonText} numberOfLines={1}>🎯 Milestones</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, currentTab === 'memories' && styles.activeTab]}
                        onPress={() => setCurrentTab('memories')}
                    >
                        <Text style={styles.tabButtonText} numberOfLines={1}>📸 Memories</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    style={styles.scrollContainer} 
                    contentContainerStyle={styles.scrollContentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {currentTab === 'leaderboard' && renderLeaderboard()}
                    {currentTab === 'achievements' && renderAchievements()}
                    {currentTab === 'milestones' && renderMilestones()}
                    {currentTab === 'memories' && renderMemories()}
                </ScrollView>

                <View style={styles.bottomButtonRow}>
                    <TouchableOpacity style={styles.footerButton} onPress={onBack}>
                        <Text style={styles.footerButtonText}>BACK</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.footerButton}>
                        <Text style={styles.footerButtonText}>VIEW</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.footerButton}>
                        <Text style={styles.footerButtonText}>HELP</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#e9f5e9',
        padding: 6,
        borderColor: '#003300',
        borderWidth: 3,
        margin: 2,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
        position: 'relative',
    },
    headerBox: {
        borderWidth: 3,
        borderColor: '#003300',
        padding: 4,
        marginBottom: 6,
        alignItems: 'center',
        backgroundColor: '#f0fff0',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 0,
        elevation: 0,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#003300',
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 0,
    },
    tabNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        gap: 4,
    },
    tabButton: {
        flex: 1,
        backgroundColor: '#dbf3db',
        borderColor: '#003300',
        borderWidth: 2,
        paddingVertical: 14,
        paddingHorizontal: 6,
        marginHorizontal: 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 0,
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 0,
        minHeight: 50,
    },
    activeTab: {
        backgroundColor: '#b8e6b8',
        borderTopColor: '#001100',
        borderLeftColor: '#001100',
        borderRightColor: '#006600',
        borderBottomColor: '#006600',
        shadowColor: '#003300',
        shadowOffset: { width: -1, height: -1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
    },
    tabButtonText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#003300',
        textAlign: 'center',
        lineHeight: 16,
        flexShrink: 1,
    },
    scrollContainer: {
        flex: 1, // Take up remaining space
        marginBottom: 115, // Increased margin to account for buttons positioned at bottom: 35
    },
    scrollContentContainer: {
        paddingBottom: 20, // Add padding at the bottom so content isn't hidden behind buttons
    },
    itemsContainer: {
        borderWidth: 3,
        borderColor: '#003300',
        backgroundColor: '#f6fff6',
        padding: 6,
        borderRadius: 0,
        borderTopColor: '#001100',
        borderLeftColor: '#001100',
        borderRightColor: '#006600',
        borderBottomColor: '#006600',
        shadowColor: '#001100',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 0,
        marginBottom: 4,
    },
    statsContainer: {
        width: '100%',
        backgroundColor: '#f0fff0',
        padding: 6,
        borderRadius: 0,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#003300',
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 0,
    },
    statsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#003300',
        textAlign: 'center',
        marginBottom: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statsText: {
        color: '#003300',
        fontSize: 11,
        fontWeight: 'bold',
    },
    // Grid layouts
    leaderboardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 6,
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 6,
    },
    milestonesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 6,
    },
    memoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 6,
    },
    // Leaderboard styles
    leaderboardCard: {
        width: '48%',
        backgroundColor: '#f0fff0',
        borderRadius: 0,
        padding: 8,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#003300',
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    topRankCard: {
        borderColor: '#FFD700',
        borderTopColor: '#FFD700',
        borderLeftColor: '#FFD700',
        borderRightColor: '#FFD700',
        borderBottomColor: '#FFD700',
        shadowColor: '#FFD700',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 0,
        elevation: 0,
        backgroundColor: '#fffef0',
    },
    rankSection: {
        alignItems: 'center',
        marginBottom: 6,
    },
    rankIcon: {
        fontSize: 24,
        marginBottom: 2,
    },
    rankNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#003300',
    },
    userInfo: {
        alignItems: 'center',
        marginBottom: 6,
    },
    userAvatar: {
        fontSize: 28,
        marginBottom: 4,
    },
    userDetails: {
        alignItems: 'center',
    },
    username: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#003300',
        marginBottom: 1,
        textAlign: 'center',
    },
    walletAddress: {
        fontSize: 8,
        color: '#666',
        textAlign: 'center',
    },
    userStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 6,
        paddingVertical: 6,
        backgroundColor: '#f8fff8',
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#003300',
        width: '100%',
    },
    userStatItem: {
        alignItems: 'center',
    },
    userStatLabel: {
        color: '#003300',
        fontSize: 8,
        marginBottom: 1,
        fontWeight: 'bold',
    },
    userStatValue: {
        color: '#003300',
        fontSize: 10,
        fontWeight: 'bold',
    },
    lastActiveText: {
        fontSize: 8,
        color: '#666',
        textAlign: 'center',
    },
    // Achievement styles
    achievementCard: {
        width: '48%',
        backgroundColor: '#f0fff0',
        borderRadius: 0,
        padding: 8,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#003300',
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    achievementHeader: {
        alignItems: 'center',
        marginBottom: 6,
    },
    achievementIcon: {
        fontSize: 28,
        marginBottom: 4,
    },
    achievementInfo: {
        alignItems: 'center',
        marginBottom: 4,
    },
    achievementTitle: {
        color: '#003300',
        fontSize: 11,
        marginBottom: 2,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    achievementDescription: {
        color: '#003300',
        fontSize: 9,
        textAlign: 'center',
        lineHeight: 11,
    },
    rarityBadge: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 0,
        minWidth: 50,
        alignItems: 'center',
        marginBottom: 4,
    },
    rarityText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
    },
    achievementFooter: {
        alignItems: 'center',
        width: '100%',
    },
    categoryText: {
        color: '#003300',
        fontSize: 10,
        marginBottom: 2,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    dateText: {
        color: '#666',
        fontSize: 8,
        textAlign: 'center',
    },
    // Milestone styles
    milestoneCard: {
        width: '48%',
        backgroundColor: '#f0fff0',
        borderRadius: 0,
        padding: 8,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#003300',
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    milestoneHeader: {
        alignItems: 'center',
        marginBottom: 6,
    },
    milestoneIcon: {
        fontSize: 28,
        marginBottom: 4,
    },
    milestoneInfo: {
        alignItems: 'center',
        marginBottom: 4,
    },
    milestoneTitle: {
        color: '#003300',
        fontSize: 11,
        marginBottom: 2,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    milestoneDescription: {
        color: '#003300',
        fontSize: 9,
        textAlign: 'center',
        lineHeight: 11,
    },
    valueBadge: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 0,
        minWidth: 30,
        alignItems: 'center',
        marginBottom: 4,
    },
    valueText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    milestoneFooter: {
        alignItems: 'center',
        width: '100%',
    },
    typeText: {
        color: '#003300',
        fontSize: 10,
        marginBottom: 2,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    // Memory styles
    memoryCard: {
        width: '48%',
        backgroundColor: '#f0fff0',
        borderRadius: 0,
        padding: 8,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#003300',
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    memoryHeader: {
        alignItems: 'center',
        marginBottom: 6,
    },
    memoryIcon: {
        fontSize: 28,
        marginBottom: 4,
    },
    memoryInfo: {
        alignItems: 'center',
        marginBottom: 4,
    },
    memoryTitle: {
        color: '#003300',
        fontSize: 11,
        marginBottom: 2,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    memoryDescription: {
        color: '#003300',
        fontSize: 9,
        textAlign: 'center',
        lineHeight: 11,
    },
    memoryTypeBadge: {
        backgroundColor: '#9C27B0',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 0,
        minWidth: 50,
        alignItems: 'center',
        marginBottom: 4,
    },
    memoryStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 6,
        paddingVertical: 6,
        backgroundColor: '#f8fff8',
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#003300',
        width: '100%',
    },
    memoryStatItem: {
        alignItems: 'center',
    },
    memoryStatLabel: {
        color: '#003300',
        fontSize: 8,
        marginBottom: 1,
        fontWeight: 'bold',
    },
    memoryStatValue: {
        color: '#003300',
        fontSize: 10,
        fontWeight: 'bold',
    },
    walletDisplayContainer: {
        backgroundColor: '#e0f2e0',
        padding: 8,
        margin: 0,
        marginBottom: 4,
        borderWidth: 3,
        borderColor: '#003300',
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 0,
        elevation: 0,
        width: '100%',
    },
    walletDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        padding: 8,
        borderWidth: 2,
        borderColor: '#003300',
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
    },
    walletIconContainer: {
        backgroundColor: '#f0fff0',
        borderRadius: 12,
        padding: 8,
        marginRight: 10,
        borderWidth: 2,
        borderColor: '#003300',
        borderTopColor: '#006600',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
    },
    walletIcon: {
        fontSize: 28,
    },
    walletInfo: {
        flex: 1,
    },
    walletLabel: {
        fontSize: 12,
        color: '#003300',
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    walletAddressText: {
        fontSize: 11,
        color: '#003300',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    bottomButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        paddingVertical: 8,
        position: 'absolute',
        bottom: 35, // Move up slightly higher above Android navigation area
        left: 0,
        right: 0,
        backgroundColor: '#e9f5e9',
        borderTopWidth: 3,
        borderTopColor: '#003300',
        borderLeftColor: '#006600',
        borderRightColor: '#001100',
        borderBottomColor: '#001100',
        shadowColor: '#001100',
        shadowOffset: { width: 2, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
        zIndex: 1000,
    },
    footerButton: {
        borderWidth: 3,
        borderColor: '#003300',
        backgroundColor: '#ffffffaa',
        padding: 12,
        flex: 1,
        marginHorizontal: 3,
        alignItems: 'center',
        borderRadius: 0,
        shadowColor: '#001100',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
        minHeight: 50,
    },
    footerButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#003300',
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 0,
    },
    contentContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#003300',
        fontWeight: 'bold',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#FF0000',
        fontWeight: 'bold',
    },
});

export default Gallery;