import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

interface DailyChallenge {
    id: string;
    type: 'feed' | 'play' | 'sleep' | 'chat' | 'care';
    target: number;
    current: number;
    reward: number;
    completed: boolean;
    expiresAt: string;
}

interface AttentionInsights {
    score: number;
    trend: 'improving' | 'stable' | 'declining';
    recommendations: string[];
}

interface Props {
    challenges: DailyChallenge[];
    attentionInsights: AttentionInsights;
    onChallengeComplete?: (challengeId: string) => void;
}

const { width } = Dimensions.get('window');

const DailyChallenges: React.FC<Props> = ({
    challenges,
    attentionInsights,
    onChallengeComplete
}) => {
    const [expanded, setExpanded] = useState(false);
    const [animationValue] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(animationValue, {
            toValue: expanded ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [expanded]);

    const getChallengeIcon = (type: string) => {
        switch (type) {
            case 'feed': return '🍎';
            case 'play': return '🎮';
            case 'sleep': return '😴';
            case 'chat': return '💬';
            case 'care': return '💝';
            default: return '⭐';
        }
    };

    const getChallengeColor = (type: string) => {
        switch (type) {
            case 'feed': return '#FF6B6B';
            case 'play': return '#4ECDC4';
            case 'sleep': return '#45B7D1';
            case 'chat': return '#96CEB4';
            case 'care': return '#FFEAA7';
            default: return '#DDA0DD';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving': return '📈';
            case 'stable': return '➡️';
            case 'declining': return '📉';
            default: return '➡️';
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'improving': return '#4CAF50';
            case 'stable': return '#FF9800';
            case 'declining': return '#F44336';
            default: return '#FF9800';
        }
    };

    const progressHeight = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 200],
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <TouchableOpacity
                style={styles.header}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.headerGradient}
                >
                    <Text style={styles.headerTitle}>🌙 Daily Challenges</Text>
                    <Text style={styles.headerSubtitle}>
                        {challenges.filter(c => c.completed).length}/{challenges.length} completed
                    </Text>
                    <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
                </LinearGradient>
            </TouchableOpacity>

            {/* Expanded Content */}
            <Animated.View style={[styles.expandedContent, { height: progressHeight }]}>
                <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Attention Score */}
                    <View style={styles.attentionSection}>
                        <Text style={styles.sectionTitle}>Attention Score</Text>
                        <View style={styles.scoreContainer}>
                            <View style={styles.scoreCircle}>
                                <Text style={styles.scoreText}>{attentionInsights.score}</Text>
                                <Text style={styles.scoreLabel}>/100</Text>
                            </View>
                            <View style={styles.trendContainer}>
                                <Text style={styles.trendIcon}>{getTrendIcon(attentionInsights.trend)}</Text>
                                <Text style={[styles.trendText, { color: getTrendColor(attentionInsights.trend) }]}>
                                    {attentionInsights.trend.charAt(0).toUpperCase() + attentionInsights.trend.slice(1)}
                                </Text>
                            </View>
                        </View>
                        
                        {/* Recommendations */}
                        {attentionInsights.recommendations.length > 0 && (
                            <View style={styles.recommendationsContainer}>
                                <Text style={styles.recommendationsTitle}>💡 Tips:</Text>
                                {attentionInsights.recommendations.map((rec, index) => (
                                    <Text key={index} style={styles.recommendationText}>
                                        • {rec}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Daily Challenges */}
                    <View style={styles.challengesSection}>
                        <Text style={styles.sectionTitle}>Today's Goals</Text>
                        {challenges.map((challenge) => (
                            <View key={challenge.id} style={styles.challengeItem}>
                                <View style={styles.challengeHeader}>
                                    <Text style={styles.challengeIcon}>{getChallengeIcon(challenge.type)}</Text>
                                    <View style={styles.challengeInfo}>
                                        <Text style={styles.challengeType}>
                                            {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
                                        </Text>
                                        <Text style={styles.challengeProgress}>
                                            {challenge.current}/{challenge.target}
                                        </Text>
                                    </View>
                                    <View style={styles.rewardContainer}>
                                        <Text style={styles.rewardText}>+{challenge.reward} XP</Text>
                                        {challenge.completed && (
                                            <Text style={styles.completedText}>✓</Text>
                                        )}
                                    </View>
                                </View>
                                
                                {/* Progress Bar */}
                                <View style={styles.progressBarContainer}>
                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                {
                                                    width: `${(challenge.current / challenge.target) * 100}%`,
                                                    backgroundColor: getChallengeColor(challenge.type)
                                                }
                                            ]}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Motivational Message */}
                    <View style={styles.motivationSection}>
                        <Text style={styles.motivationText}>
                            {challenges.filter(c => c.completed).length >= 3 
                                ? "🌟 Amazing! You're taking great care of your moonling today!"
                                : "💫 Keep going! Every interaction makes your moonling happier!"
                            }
                        </Text>
                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#1a1a2e',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    header: {
        width: '100%',
    },
    headerGradient: {
        padding: 16,
        alignItems: 'center',
        position: 'relative',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#e0e0e0',
        marginBottom: 8,
    },
    expandIcon: {
        fontSize: 16,
        color: '#ffffff',
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -8,
    },
    expandedContent: {
        overflow: 'hidden',
    },
    scrollContent: {
        padding: 16,
    },
    attentionSection: {
        marginBottom: 24,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
        textAlign: 'center',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
    },
    scoreCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#667eea',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#ffffff',
    },
    scoreText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    scoreLabel: {
        fontSize: 12,
        color: '#e0e0e0',
    },
    trendContainer: {
        alignItems: 'center',
    },
    trendIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    trendText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    recommendationsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 12,
        borderRadius: 8,
        width: '100%',
    },
    recommendationsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    recommendationText: {
        fontSize: 12,
        color: '#e0e0e0',
        marginBottom: 4,
        lineHeight: 16,
    },
    challengesSection: {
        marginBottom: 24,
    },
    challengeItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    challengeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    challengeIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    challengeInfo: {
        flex: 1,
    },
    challengeType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 2,
    },
    challengeProgress: {
        fontSize: 14,
        color: '#b0b0b0',
    },
    rewardContainer: {
        alignItems: 'flex-end',
    },
    rewardText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    completedText: {
        fontSize: 18,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    progressBarContainer: {
        width: '100%',
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    motivationSection: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    motivationText: {
        fontSize: 14,
        color: '#e0e0e0',
        textAlign: 'center',
        lineHeight: 20,
        fontStyle: 'italic',
    },
});

export default DailyChallenges;
