import { LocalGameEngine, GameStats, DailyChallenge, MoodEvent } from './local/LocalGameEngine';
import { StatDecayService } from './StatDecayService';
import { MoonCycleService } from './MoonCycleService';

export interface GameMechanicsState {
    currentStats: GameStats;
    dailyChallenges: DailyChallenge[];
    moodEvents: MoodEvent[];
    attentionInsights: {
        score: number;
        trend: 'improving' | 'stable' | 'declining';
        recommendations: string[];
    };
    moonCycleProgress: {
        currentDay: number;
        daysRemaining: number;
        moodDaysAchieved: number;
        moodDaysNeeded: number;
        onTrack: boolean;
    };
    recentAchievements: string[];
    careStreak: number;
    lastInteractionTime: number;
}

export interface InteractionResult {
    success: boolean;
    newStats: GameStats;
    moodEvent?: MoodEvent;
    challengeProgress?: DailyChallenge[];
    achievementUnlocked?: string;
    message: string;
    rewards: {
        experience: number;
        moodBoost: number;
        careQuality: number;
    };
}

export class GameMechanicsService {
    private localGameEngine: LocalGameEngine;
    private statDecayService: StatDecayService;
    private moonCycleService: MoonCycleService;
    private walletAddress: string;
    private characterId: string;

    constructor(walletAddress: string, characterId: string) {
        this.walletAddress = walletAddress;
        this.characterId = characterId;
        this.localGameEngine = new LocalGameEngine(walletAddress);
        this.statDecayService = new StatDecayService();
        this.moonCycleService = new MoonCycleService(characterId, walletAddress);
    }

    async initialize(): Promise<void> {
        await this.localGameEngine.init();
        await this.statDecayService.initializeCharacter(this.characterId, {
            mood: 3,
            hunger: 3,
            energy: 3
        });
    }

    // ENHANCED: Comprehensive interaction system with attention loops
    async performInteraction(
        actionType: 'feed' | 'play' | 'sleep' | 'chat',
        quality: number = 1,
        additionalParams?: any
    ): Promise<InteractionResult> {
        try {
            // Get current state
            const currentStats = await this.localGameEngine.getLocalStats();
            const challenges = await this.localGameEngine.getDailyChallenges();
            const moodEvents = await this.localGameEngine.getCurrentMoodEvents();

            // Perform the action with enhanced mechanics
            let newStats: GameStats;
            let moodEvent: MoodEvent | undefined;
            let achievementUnlocked: string | undefined;

            switch (actionType) {
                case 'feed':
                    newStats = await this.localGameEngine.feedMoonling(quality);
                    break;
                case 'play':
                    const playTypes: ('active' | 'gentle' | 'creative')[] = ['active', 'gentle', 'creative'];
                    const playType = playTypes[Math.min(quality - 1, 2)];
                    newStats = await this.localGameEngine.playWithMoonling(playType);
                    break;
                case 'sleep':
                    newStats = await this.localGameEngine.putMoonlingToSleep(quality);
                    break;
                case 'chat':
                    const chatTypes: ('casual' | 'deep' | 'playful')[] = ['casual', 'deep', 'playful'];
                    const chatType = chatTypes[Math.min(quality - 1, 2)];
                    newStats = await this.localGameEngine.chatWithMoonling(chatType);
                    break;
                default:
                    throw new Error(`Unknown action type: ${actionType}`);
            }

            // Update StatDecayService
            await this.statDecayService.recordAction(
                this.characterId,
                actionType,
                {
                    mood: newStats.mood - currentStats.mood,
                    hunger: actionType === 'feed' ? newStats.hunger - currentStats.hunger : 0,
                    energy: actionType === 'sleep' ? newStats.energy - currentStats.energy : 0
                }
            );

            // Update MoonCycleService (play actions are recorded as chat for moon cycle tracking)
            const moonCycleActionType = actionType === 'play' ? 'chat' : actionType;
            await this.moonCycleService.recordDailyStats(
                newStats.mood,
                newStats.hunger,
                newStats.energy,
                moonCycleActionType,
                additionalParams?.sleepDuration
            );

            // Check for new mood events
            const newMoodEvents = await this.localGameEngine.getCurrentMoodEvents();
            moodEvent = newMoodEvents.find(e => 
                !moodEvents.some(old => old.id === e.id)
            );

            // Check for achievements
            const newAchievements = await this.localGameEngine.getQueuedAchievements();
            if (newAchievements.length > 0) {
                achievementUnlocked = newAchievements[0];
            }

            // Get updated challenges
            const updatedChallenges = await this.localGameEngine.getDailyChallenges();

            // Calculate rewards based on quality and attention
            const rewards = this.calculateRewards(actionType, quality, newStats, currentStats);

            // Generate personalized message
            const message = this.generateInteractionMessage(actionType, quality, newStats, currentStats);

            return {
                success: true,
                newStats,
                moodEvent,
                challengeProgress: updatedChallenges,
                achievementUnlocked,
                message,
                rewards
            };

        } catch (error) {
            console.error('Interaction failed:', error);
            return {
                success: false,
                newStats: await this.localGameEngine.getLocalStats(),
                message: 'Something went wrong. Please try again.',
                rewards: { experience: 0, moodBoost: 0, careQuality: 0 }
            };
        }
    }

    // ENHANCED: Smart reward calculation system
    private calculateRewards(
        actionType: 'feed' | 'play' | 'sleep' | 'chat',
        quality: number,
        newStats: GameStats,
        oldStats: GameStats
    ): { experience: number; moodBoost: number; careQuality: number } {
        // Base rewards
        let experience = 10 + (quality * 5);
        let moodBoost = newStats.mood - oldStats.mood;
        let careQuality = Math.min(quality * 2, 10);

        // Bonus for attention loops
        const timeSinceLastAction = Date.now() - oldStats.lastPlayed;
        const hoursSinceLastAction = timeSinceLastAction / (1000 * 60 * 60);
        
        if (hoursSinceLastAction > 4) {
            // Bonus for returning after a break
            experience += 15;
            careQuality += 5;
        } else if (hoursSinceLastAction < 1) {
            // Small bonus for frequent interactions
            experience += 5;
        }

        // Bonus for completing daily challenges
        if (newStats.dailyStreak > 0) {
            experience += newStats.dailyStreak * 2;
        }

        // Bonus for high care quality
        if (newStats.careQuality > 80) {
            experience += 20;
            careQuality += 5;
        }

        return {
            experience: Math.min(experience, 100), // Cap at 100
            moodBoost: Math.max(moodBoost, 0),
            careQuality: Math.min(careQuality, 20) // Cap at 20 per action
        };
    }

    // ENHANCED: Personalized interaction messages
    private generateInteractionMessage(
        actionType: 'feed' | 'play' | 'sleep' | 'chat',
        quality: number,
        newStats: GameStats,
        oldStats: GameStats
    ): string {
        const qualityText = ['Poor', 'Fair', 'Good', 'Great', 'Perfect'][quality - 1];
        const moodChange = newStats.mood - oldStats.mood;
        
        let message = `${qualityText} ${actionType}! `;
        
        if (moodChange > 0) {
            if (moodChange >= 2) {
                message += "Your moonling is absolutely delighted! 🌟";
            } else if (moodChange === 1) {
                message += "Your moonling is feeling happier! 😊";
            }
        } else if (moodChange === 0) {
            message += "Your moonling appreciates the attention! 💫";
        }

        // Add streak information
        if (newStats.dailyStreak > 1) {
            message += `\n🔥 ${newStats.dailyStreak} day care streak!`;
        }

        // Add level up notification
        if (newStats.level > oldStats.level) {
            message += `\n🎉 Level up! Your moonling is now level ${newStats.level}!`;
        }

        return message;
    }

    // ENHANCED: Get comprehensive game state
    async getGameState(): Promise<GameMechanicsState> {
        const [
            currentStats,
            dailyChallenges,
            moodEvents,
            attentionInsights,
            moonCycleProgress
        ] = await Promise.all([
            this.localGameEngine.getLocalStats(),
            this.localGameEngine.getDailyChallenges(),
            this.localGameEngine.getCurrentMoodEvents(),
            this.localGameEngine.getAttentionInsights(),
            this.moonCycleService.getCycleProgress()
        ]);

        // Get recent achievements
        const queuedAchievements = await this.localGameEngine.getQueuedAchievements();
        const recentAchievements = queuedAchievements.slice(0, 3); // Last 3

        // Calculate care streak
        const careStreak = this.calculateCareStreak(currentStats);

        return {
            currentStats,
            dailyChallenges,
            moodEvents,
            attentionInsights,
            moonCycleProgress,
            recentAchievements,
            careStreak,
            lastInteractionTime: currentStats.lastPlayed
        };
    }

    // ENHANCED: Care streak calculation
    private calculateCareStreak(stats: GameStats): number {
        const now = Date.now();
        const lastAction = stats.lastPlayed;
        const hoursSinceLastAction = (now - lastAction) / (1000 * 60 * 60);
        
        // If more than 24 hours, streak is broken
        if (hoursSinceLastAction > 24) {
            return 0;
        }
        
        // Calculate based on daily streak and attention score
        return Math.min(stats.dailyStreak * 10 + Math.floor(stats.attentionScore / 10), 100);
    }

    // ENHANCED: Get personalized recommendations
    async getPersonalizedRecommendations(): Promise<string[]> {
        const state = await this.getGameState();
        const recommendations: string[] = [];

        // Based on attention score
        if (state.attentionInsights.score < 30) {
            recommendations.push("Try to interact more frequently throughout the day");
        }

        // Based on daily challenges
        const completedChallenges = state.dailyChallenges.filter(c => c.completed).length;
        if (completedChallenges < 2) {
            recommendations.push("Complete more daily challenges for better rewards");
        }

        // Based on care quality
        if (state.currentStats.careQuality < 50) {
            recommendations.push("Focus on quality interactions over quantity");
        }

        // Based on mood
        if (state.currentStats.mood < 3) {
            recommendations.push("Your moonling needs some extra love and attention");
        }

        // Based on energy
        if (state.currentStats.energy < 2) {
            recommendations.push("Consider putting your moonling to sleep");
        }

        // Based on hunger
        if (state.currentStats.hunger < 2) {
            recommendations.push("Your moonling is getting hungry");
        }

        // Based on moon cycle
        if (!state.moonCycleProgress.onTrack) {
            recommendations.push("Focus on maintaining high mood to stay on track with the moon cycle");
        }

        return recommendations.slice(0, 5); // Return top 5 recommendations
    }

    // ENHANCED: Get motivation and encouragement
    async getMotivationalMessage(): Promise<string> {
        const state = await this.getGameState();
        const completedChallenges = state.dailyChallenges.filter(c => c.completed).length;
        const attentionScore = state.attentionInsights.score;

        if (completedChallenges >= 4) {
            return "🌟 Amazing! You're taking exceptional care of your moonling today!";
        } else if (completedChallenges >= 2) {
            return "💫 Great job! You're building a strong bond with your moonling!";
        } else if (attentionScore > 70) {
            return "😊 Your consistent attention is making your moonling very happy!";
        } else if (state.currentStats.dailyStreak > 3) {
            return "🔥 Your dedication is impressive! Keep up the great work!";
        } else {
            return "💫 Every interaction matters! Your moonling appreciates your care!";
        }
    }

    // ENHANCED: Get progress insights
    async getProgressInsights(): Promise<{
        overallProgress: number;
        nextMilestone: string;
        estimatedTimeToNext: string;
        suggestions: string[];
    }> {
        const state = await this.getGameState();
        const stats = state.currentStats;
        
        // Calculate overall progress (0-100)
        const levelProgress = (stats.experience / (stats.level * 100)) * 100;
        const challengeProgress = (state.dailyChallenges.filter(c => c.completed).length / state.dailyChallenges.length) * 100;
        const attentionProgress = stats.attentionScore;
        const careProgress = stats.careQuality;
        
        const overallProgress = Math.round((levelProgress + challengeProgress + attentionProgress + careProgress) / 4);

        // Determine next milestone
        let nextMilestone = '';
        let estimatedTimeToNext = '';
        
        if (stats.experience >= stats.level * 100 * 0.8) {
            nextMilestone = `Level ${stats.level + 1}`;
            estimatedTimeToNext = '1-2 more interactions';
        } else if (challengeProgress < 100) {
            nextMilestone = 'Complete daily challenges';
            estimatedTimeToNext = 'Today';
        } else if (attentionProgress < 90) {
            nextMilestone = 'Reach 90+ attention score';
            estimatedTimeToNext = '2-3 more interactions';
        } else if (careProgress < 90) {
            nextMilestone = 'Reach 90+ care quality';
            estimatedTimeToNext = '3-4 quality interactions';
        } else {
            nextMilestone = 'Maintain excellence';
            estimatedTimeToNext = 'Ongoing';
        }

        // Generate suggestions
        const suggestions = await this.getPersonalizedRecommendations();

        return {
            overallProgress,
            nextMilestone,
            estimatedTimeToNext,
            suggestions
        };
    }

    // ENHANCED: Get daily summary
    async getDailySummary(): Promise<{
        date: string;
        totalInteractions: number;
        challengesCompleted: number;
        moodImprovement: number;
        careQuality: number;
        attentionScore: number;
        achievements: string[];
        highlights: string[];
    }> {
        const state = await this.getGameState();
        const stats = state.currentStats;
        
        const totalInteractions = stats.totalFeedings + stats.totalPlays + stats.totalSleeps;
        const challengesCompleted = state.dailyChallenges.filter(c => c.completed).length;
        const moodImprovement = Math.max(0, stats.mood - 3); // Assuming 3 is baseline
        const achievements = state.recentAchievements;
        
        const highlights = [];
        if (challengesCompleted >= 3) highlights.push('Completed most daily challenges');
        if (stats.careQuality > 80) highlights.push('Maintained high care quality');
        if (stats.attentionScore > 70) highlights.push('Excellent attention score');
        if (stats.dailyStreak > 1) highlights.push(`Maintained ${stats.dailyStreak} day streak`);

        return {
            date: new Date().toISOString().split('T')[0],
            totalInteractions,
            challengesCompleted,
            moodImprovement,
            careQuality: stats.careQuality,
            attentionScore: stats.attentionScore,
            achievements,
            highlights
        };
    }
}

export default GameMechanicsService;
