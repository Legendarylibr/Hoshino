import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAsset } from '../../config/AssetRegistry';

export interface GameStats {
    mood: number;
    hunger: number;
    energy: number;
    totalFeedings: number;
    totalPlays: number;
    totalSleeps: number;
    lastPlayed: number;
    level: number;
    experience: number;
    // NEW: Enhanced stats for better attention loops
    dailyStreak: number;
    lastDailyCheck: string; // YYYY-MM-DD format
    moodEvents: number;
    specialInteractions: number;
    careQuality: number; // 0-100, affects rewards
    attentionScore: number; // 0-100, daily attention metric
}

export interface AchievementProgress {
    id: string;
    name: string;
    progress: number;
    target: number;
    completed: boolean;
    dateCompleted?: number;
}

export interface DailyChallenge {
    id: string;
    type: 'feed' | 'play' | 'sleep' | 'chat' | 'care';
    target: number;
    current: number;
    reward: number;
    completed: boolean;
    expiresAt: string;
}

export interface MoodEvent {
    id: string;
    type: 'happy' | 'sad' | 'excited' | 'calm' | 'playful';
    intensity: number; // 1-5
    duration: number; // minutes
    triggeredBy: string;
    timestamp: number;
}

export class LocalGameEngine {
    private walletAddress: string;
    private achievementQueue: string[] = [];
    private completedAchievements: Set<string> = new Set();
    private dailyChallenges: DailyChallenge[] = [];
    private moodEvents: MoodEvent[] = [];

    constructor(walletAddress: string) {
        this.walletAddress = walletAddress;
    }

    async init(): Promise<void> {
        await this.loadAchievementQueue();
        await this.loadCompletedAchievements();
        await this.loadDailyChallenges();
        await this.loadMoodEvents();
        await this.initializeDailyChallenges();
    }

    // ENHANCED: Better attention loop with daily challenges
    async initializeDailyChallenges(): Promise<void> {
        const today = new Date().toISOString().split('T')[0];
        const lastCheck = await this.getLastDailyCheck();
        
        if (lastCheck !== today) {
            await this.generateDailyChallenges();
            await this.resetDailyStats();
        }
    }

    private async generateDailyChallenges(): Promise<void> {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        this.dailyChallenges = [
            {
                id: `feed_${today}`,
                type: 'feed',
                target: Math.floor(Math.random() * 3) + 2, // 2-4 feedings
                current: 0,
                reward: 25,
                completed: false,
                expiresAt: tomorrow.toISOString()
            },
            {
                id: `play_${today}`,
                type: 'play',
                target: Math.floor(Math.random() * 2) + 1, // 1-2 play sessions
                current: 0,
                reward: 30,
                completed: false,
                expiresAt: tomorrow.toISOString()
            },
            {
                id: `sleep_${today}`,
                type: 'sleep',
                target: 1, // 1 good sleep
                current: 0,
                reward: 40,
                completed: false,
                expiresAt: tomorrow.toISOString()
            },
            {
                id: `care_${today}`,
                type: 'care',
                target: Math.floor(Math.random() * 3) + 3, // 3-5 total actions
                current: 0,
                completed: false,
                reward: 50,
                expiresAt: tomorrow.toISOString()
            }
        ];
        
        await this.saveDailyChallenges();
    }

    // ENHANCED: Improved feeding with attention loop mechanics
    async feedMoonling(foodQuality: number = 1): Promise<GameStats> {
        const stats = await this.getLocalStats();
        const now = Date.now();

        // Base feeding effects
        const hungerGain = Math.min(2 + foodQuality, 5);
        const moodGain = Math.min(1 + Math.floor(foodQuality / 2), 3);
        
        stats.hunger = Math.min(stats.hunger + hungerGain, 5);
        stats.mood = Math.min(stats.mood + moodGain, 5);
        stats.totalFeedings += 1;
        stats.experience += 10 + (foodQuality * 5);
        stats.lastPlayed = now;

        // ENHANCED: Attention loop mechanics
        await this.updateDailyChallenge('feed', 1);
        await this.updateCareQuality('feed', foodQuality);
        await this.triggerMoodEvent('happy', Math.min(foodQuality, 3), 'feeding');
        
        // Level progression with diminishing returns
        if (stats.experience >= stats.level * 100) {
            stats.level += 1;
            stats.experience = stats.experience - (stats.level - 1) * 100;
            // Bonus for leveling up
            stats.mood = Math.min(stats.mood + 1, 5);
        }

        await this.saveLocalStats(stats);
        await this.checkFeedingAchievements(stats);
        await this.updateAttentionScore();

        console.log(`🍎 Fed moonling! Quality: ${foodQuality}, Mood: ${stats.mood}, Hunger: ${stats.hunger}`);
        return stats;
    }

    // ENHANCED: Improved playing with engagement mechanics
    async playWithMoonling(playType: 'active' | 'gentle' | 'creative' = 'active'): Promise<GameStats> {
        const stats = await this.getLocalStats();
        const now = Date.now();

        // Play type affects outcomes
        const playEffects = {
            active: { mood: 2, energy: -1, exp: 15 },
            gentle: { mood: 1, energy: 0, exp: 10 },
            creative: { mood: 3, energy: -1, exp: 20 }
        };

        const effects = playEffects[playType];
        
        stats.mood = Math.min(stats.mood + effects.mood, 5);
        stats.energy = Math.max(stats.energy + effects.energy, 0);
        stats.totalPlays += 1;
        stats.experience += effects.exp;
        stats.lastPlayed = now;

        // ENHANCED: Attention loop mechanics
        await this.updateDailyChallenge('play', 1);
        await this.updateCareQuality('play', effects.mood);
        await this.triggerMoodEvent('playful', effects.mood, `${playType} play`);
        
        if (stats.experience >= stats.level * 100) {
            stats.level += 1;
            stats.experience = stats.experience - (stats.level - 1) * 100;
        }

        await this.saveLocalStats(stats);
        await this.checkPlayingAchievements(stats);
        await this.updateAttentionScore();

        console.log(`🎮 Played with moonling! Type: ${playType}, Mood: ${stats.mood}, Energy: ${stats.energy}`);
        return stats;
    }

    // ENHANCED: Improved sleep with quality mechanics
    async putMoonlingToSleep(sleepQuality: number = 1): Promise<GameStats> {
        const stats = await this.getLocalStats();
        const now = Date.now();

        // Sleep quality affects energy restoration
        const energyGain = Math.min(3 + sleepQuality, 5);
        const moodGain = Math.min(1 + Math.floor(sleepQuality / 2), 2);
        
        stats.energy = Math.min(stats.energy + energyGain, 5);
        stats.mood = Math.min(stats.mood + moodGain, 5);
        stats.totalSleeps += 1;
        stats.experience += 5 + (sleepQuality * 3);
        stats.lastPlayed = now;

        // ENHANCED: Attention loop mechanics
        await this.updateDailyChallenge('sleep', 1);
        await this.updateCareQuality('sleep', sleepQuality);
        await this.triggerMoodEvent('calm', Math.min(sleepQuality, 3), 'sleeping');
        
        if (stats.experience >= stats.level * 100) {
            stats.level += 1;
            stats.experience = stats.experience - (stats.level - 1) * 100;
        }

        await this.saveLocalStats(stats);
        await this.checkSleepingAchievements(stats);
        await this.updateAttentionScore();

        console.log(`😴 Moonling slept! Quality: ${sleepQuality}, Energy: ${stats.energy}, Total sleeps: ${stats.totalSleeps}`);
        return stats;
    }

    // NEW: Chat interaction for attention loop
    async chatWithMoonling(chatType: 'casual' | 'deep' | 'playful' = 'casual'): Promise<GameStats> {
        const stats = await this.getLocalStats();
        const now = Date.now();

        const chatEffects = {
            casual: { mood: 1, exp: 5 },
            deep: { mood: 2, exp: 15 },
            playful: { mood: 2, exp: 10 }
        };

        const effects = chatEffects[chatType];
        
        stats.mood = Math.min(stats.mood + effects.mood, 5);
        stats.experience += effects.exp;
        stats.lastPlayed = now;

        // ENHANCED: Attention loop mechanics
        await this.updateDailyChallenge('care', 1);
        await this.updateCareQuality('chat', effects.mood);
        await this.triggerMoodEvent('excited', effects.mood, `${chatType} chat`);
        
        if (stats.experience >= stats.level * 100) {
            stats.level += 1;
            stats.experience = stats.experience - (stats.level - 1) * 100;
        }

        await this.saveLocalStats(stats);
        await this.updateAttentionScore();

        console.log(`💬 Chatted with moonling! Type: ${chatType}, Mood: ${stats.mood}`);
        return stats;
    }

    // NEW: Mood event system for dynamic attention loops
    private async triggerMoodEvent(type: MoodEvent['type'], intensity: number, triggeredBy: string): Promise<void> {
        const event: MoodEvent = {
            id: `mood_${Date.now()}`,
            type,
            intensity,
            duration: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
            triggeredBy,
            timestamp: Date.now()
        };

        this.moodEvents.push(event);
        await this.saveMoodEvents();
        
        // Clean up old events
        this.moodEvents = this.moodEvents.filter(e => 
            Date.now() - e.timestamp < e.duration * 60 * 1000
        );
    }

    // NEW: Care quality system for better rewards
    private async updateCareQuality(actionType: string, quality: number): Promise<void> {
        const stats = await this.getLocalStats();
        const qualityGain = Math.min(quality * 2, 10);
        stats.careQuality = Math.min(stats.careQuality + qualityGain, 100);
        await this.saveLocalStats(stats);
    }

    // NEW: Attention score system for daily engagement
    private async updateAttentionScore(): Promise<void> {
        const stats = await this.getLocalStats();
        const now = Date.now();
        const hoursSinceLastAction = (now - stats.lastPlayed) / (1000 * 60 * 60);
        
        // Decay attention score over time
        if (hoursSinceLastAction > 1) {
            const decayRate = Math.min(hoursSinceLastAction * 2, 20);
            stats.attentionScore = Math.max(0, stats.attentionScore - decayRate);
        } else {
            // Boost attention score for frequent interactions
            stats.attentionScore = Math.min(100, stats.attentionScore + 5);
        }
        
        await this.saveLocalStats(stats);
    }

    // NEW: Daily challenge system
    private async updateDailyChallenge(type: string, amount: number): Promise<void> {
        const challenge = this.dailyChallenges.find(c => c.type === type && !c.completed);
        if (challenge) {
            challenge.current += amount;
            if (challenge.current >= challenge.target) {
                challenge.completed = true;
                // Award experience for completing challenges
                const stats = await this.getLocalStats();
                stats.experience += challenge.reward;
                await this.saveLocalStats(stats);
            }
            await this.saveDailyChallenges();
        }
    }

    // NEW: Get daily challenges
    async getDailyChallenges(): Promise<DailyChallenge[]> {
        return this.dailyChallenges;
    }

    // NEW: Get current mood events
    async getCurrentMoodEvents(): Promise<MoodEvent[]> {
        const now = Date.now();
        return this.moodEvents.filter(e => 
            now - e.timestamp < e.duration * 60 * 1000
        );
    }

    // NEW: Get attention insights
    async getAttentionInsights(): Promise<{
        score: number;
        trend: 'improving' | 'stable' | 'declining';
        recommendations: string[];
    }> {
        const stats = await this.getLocalStats();
        const challenges = await this.getDailyChallenges();
        const completedChallenges = challenges.filter(c => c.completed).length;
        
        let trend: 'improving' | 'stable' | 'declining' = 'stable';
        if (stats.attentionScore > 70 && completedChallenges >= 3) trend = 'improving';
        else if (stats.attentionScore < 30 || completedChallenges <= 1) trend = 'declining';
        
        const recommendations = [];
        if (stats.attentionScore < 50) recommendations.push('Try to interact more frequently throughout the day');
        if (completedChallenges < 2) recommendations.push('Complete more daily challenges for better rewards');
        if (stats.careQuality < 50) recommendations.push('Focus on quality interactions over quantity');
        
        return {
            score: stats.attentionScore,
            trend,
            recommendations
        };
    }

    // ENHANCED: Better achievement system with attention loops
    private async checkFeedingAchievements(stats: GameStats): Promise<void> {
        const achievements = [
            { id: 'first_feed', condition: stats.totalFeedings === 1 },
            { id: 'caretaker_10', condition: stats.totalFeedings === 10 },
            { id: 'caretaker_50', condition: stats.totalFeedings === 50 },
            { id: 'caretaker_100', condition: stats.totalFeedings === 100 },
            { id: 'quality_caretaker', condition: stats.careQuality >= 80 },
            { id: 'attention_master', condition: stats.attentionScore >= 90 }
        ];

        for (const achievement of achievements) {
            if (achievement.condition && !this.isAchievementCompleted(achievement.id)) {
                await this.queueAchievement(achievement.id);
            }
        }
    }

    private async checkPlayingAchievements(stats: GameStats): Promise<void> {
        const achievements = [
            { id: 'playful_friend', condition: stats.totalPlays === 25 },
            { id: 'playful_master', condition: stats.totalPlays === 100 },
            { id: 'mood_lifter', condition: stats.mood >= 4 && stats.totalPlays >= 10 }
        ];

        for (const achievement of achievements) {
            if (achievement.condition && !this.isAchievementCompleted(achievement.id)) {
                await this.queueAchievement(achievement.id);
            }
        }
    }

    private async checkSleepingAchievements(stats: GameStats): Promise<void> {
        const achievements = [
            { id: 'night_owl', condition: stats.totalSleeps === 20 },
            { id: 'sleep_master', condition: stats.totalSleeps === 100 },
            { id: 'restful_caretaker', condition: stats.energy >= 4 && stats.totalSleeps >= 10 }
        ];

        for (const achievement of achievements) {
            if (achievement.condition && !this.isAchievementCompleted(achievement.id)) {
                await this.queueAchievement(achievement.id);
            }
        }
    }

    // NEW: Reset daily stats for attention loop
    private async resetDailyStats(): Promise<void> {
        const stats = await this.getLocalStats();
        const today = new Date().toISOString().split('T')[0];
        
        stats.dailyStreak = stats.lastDailyCheck === this.getYesterday() ? stats.dailyStreak + 1 : 1;
        stats.lastDailyCheck = today;
        stats.attentionScore = Math.max(20, stats.attentionScore - 30); // Decay but maintain some base
        
        await this.saveLocalStats(stats);
    }

    private getYesterday(): string {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }

    private async getLastDailyCheck(): Promise<string> {
        const stats = await this.getLocalStats();
        return stats.lastDailyCheck || this.getYesterday();
    }

    private async queueAchievement(assetId: string): Promise<void> {
        const asset = getAsset(assetId);
        if (!asset || asset.category !== 'achievement') {
            console.warn(`⚠️ Achievement ${assetId} not found in registry`);
            return;
        }

        if (!this.achievementQueue.includes(assetId)) {
            this.achievementQueue.push(assetId);
            await this.saveAchievementQueue();
            console.log(`🏆 Achievement unlocked: ${asset.name} (queued for minting)`);
        }
    }

    private isAchievementCompleted(achievementId: string): boolean {
        return this.completedAchievements.has(achievementId);
    }

    async markAchievementMinted(achievementId: string): Promise<void> {
        this.completedAchievements.add(achievementId);
        this.achievementQueue = this.achievementQueue.filter(id => id !== achievementId);
        await this.saveAchievementQueue();
        await this.saveCompletedAchievements();
        console.log(`✅ Achievement ${achievementId} marked as minted`);
    }

    async getLocalStats(): Promise<GameStats> {
        let stored;
        try {
            stored = await AsyncStorage.getItem(`game_stats_${this.walletAddress}`);
        } catch (error) {
            console.warn('⚠️ Failed to get game stats, resetting...');
        }

        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.warn('⚠️ Corrupted game stats, resetting...');
            }
        }

        return {
            mood: 3,
            hunger: 3,
            energy: 3,
            totalFeedings: 0,
            totalPlays: 0,
            totalSleeps: 0,
            lastPlayed: Date.now(),
            level: 1,
            experience: 0,
            dailyStreak: 0,
            lastDailyCheck: this.getYesterday(),
            moodEvents: 0,
            specialInteractions: 0,
            careQuality: 0,
            attentionScore: 50
        };
    }

    private async saveLocalStats(stats: GameStats): Promise<void> {
        try {
            await AsyncStorage.setItem(`game_stats_${this.walletAddress}`, JSON.stringify(stats));
        } catch (error) {
            console.error('❌ Failed to save game stats:', error);
        }
    }

    async updateStats(stats: GameStats): Promise<void> {
        await this.saveLocalStats(stats);
    }

    getQueuedAchievements(): string[] {
        return [...this.achievementQueue];
    }

    async clearAchievementQueue(): Promise<void> {
        this.achievementQueue = [];
        await this.saveAchievementQueue();
    }

    private async saveAchievementQueue(): Promise<void> {
        try {
            await AsyncStorage.setItem(`achievement_queue_${this.walletAddress}`, JSON.stringify(this.achievementQueue));
        } catch (error) {
            console.error('❌ Failed to save achievement queue:', error);
        }
    }

    private async loadAchievementQueue(): Promise<void> {
        let stored;
        try {
            stored = await AsyncStorage.getItem(`achievement_queue_${this.walletAddress}`);
        } catch (error) {
            console.warn('⚠️ Failed to load achievement queue, starting fresh');
            this.achievementQueue = [];
            return;
        }

        if (stored) {
            try {
                this.achievementQueue = JSON.parse(stored);
            } catch (error) {
                console.warn('⚠️ Corrupted achievement queue, starting fresh');
                this.achievementQueue = [];
            }
        }
    }

    private async saveCompletedAchievements(): Promise<void> {
        try {
            await AsyncStorage.setItem(`completed_achievements_${this.walletAddress}`, JSON.stringify([...this.completedAchievements]));
        } catch (error) {
            console.error('❌ Failed to save completed achievements:', error);
        }
    }

    private async loadCompletedAchievements(): Promise<void> {
        let stored;
        try {
            stored = await AsyncStorage.getItem(`completed_achievements_${this.walletAddress}`);
        } catch (error) {
            console.warn('⚠️ Failed to load completed achievements, starting fresh');
            this.completedAchievements = new Set();
            return;
        }

        if (stored) {
            try {
                this.completedAchievements = new Set(JSON.parse(stored));
            } catch (error) {
                console.warn('⚠️ Corrupted completed achievements, starting fresh');
                this.completedAchievements = new Set();
            }
        }
    }

    private async saveDailyChallenges(): Promise<void> {
        try {
            await AsyncStorage.setItem(`daily_challenges_${this.walletAddress}`, JSON.stringify(this.dailyChallenges));
        } catch (error) {
            console.error('❌ Failed to save daily challenges:', error);
        }
    }

    private async loadDailyChallenges(): Promise<void> {
        let stored;
        try {
            stored = await AsyncStorage.getItem(`daily_challenges_${this.walletAddress}`);
        } catch (error) {
            console.warn('⚠️ Failed to load daily challenges, starting fresh');
            this.dailyChallenges = [];
            return;
        }

        if (stored) {
            try {
                this.dailyChallenges = JSON.parse(stored);
            } catch (error) {
                console.warn('⚠️ Corrupted daily challenges, starting fresh');
                this.dailyChallenges = [];
            }
        }
    }

    private async saveMoodEvents(): Promise<void> {
        try {
            await AsyncStorage.setItem(`mood_events_${this.walletAddress}`, JSON.stringify(this.moodEvents));
        } catch (error) {
            console.error('❌ Failed to save mood events:', error);
        }
    }

    private async loadMoodEvents(): Promise<void> {
        let stored;
        try {
            stored = await AsyncStorage.getItem(`mood_events_${this.walletAddress}`);
        } catch (error) {
            console.warn('⚠️ Failed to load mood events, starting fresh');
            this.moodEvents = [];
            return;
        }

        if (stored) {
            try {
                this.moodEvents = JSON.parse(stored);
            } catch (error) {
                console.warn('⚠️ Corrupted mood events, starting fresh');
                this.moodEvents = [];
            }
        }
    }

    async getAchievementProgress(): Promise<AchievementProgress[]> {
        const stats = await this.getLocalStats();

        return [
            {
                id: 'first_feed',
                name: 'First Meal',
                progress: Math.min(stats.totalFeedings, 1),
                target: 1,
                completed: this.isAchievementCompleted('first_feed')
            },
            {
                id: 'caretaker_10',
                name: 'Caring Soul',
                progress: Math.min(stats.totalFeedings, 10),
                target: 10,
                completed: this.isAchievementCompleted('caretaker_10')
            },
            {
                id: 'caretaker_50',
                name: 'Dedicated Caretaker',
                progress: Math.min(stats.totalFeedings, 50),
                target: 50,
                completed: this.isAchievementCompleted('caretaker_50')
            },
            {
                id: 'playful_friend',
                name: 'Playful Friend',
                progress: Math.min(stats.totalPlays, 25),
                target: 25,
                completed: this.isAchievementCompleted('playful_friend')
            },
            {
                id: 'night_owl',
                name: 'Night Owl',
                progress: Math.min(stats.totalSleeps, 20),
                target: 20,
                completed: this.isAchievementCompleted('night_owl')
            }
        ];
    }
}