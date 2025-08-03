import AsyncStorage from '@react-native-async-storage/async-storage';

// Adapted interfaces and class for React Native (using AsyncStorage instead of localStorage)

export interface MoonlingInteractionPoints {
    characterMint: string;
    characterName: string;
    dailyPoints: number;
    totalPoints: number;
    lastInteraction: string; // ISO date
    interactionCount: number;
    moodBonusPoints: number;
    streakDays: number;
}

export interface GlobalPointsData {
    walletAddress: string;
    totalPoints: number;
    dailyPoints: number;
    starFragments: number; // Star Fragment currency
    moonlings: MoonlingInteractionPoints[];
    lastUpdated: string;
    currentStreak: number; // Days with interactions across any moonling
    longestStreak: number;
    rank?: number;
}

export interface PointsReward {
    pointsEarned: number;
    bonusMultiplier: number;
    source: 'feed' | 'sleep' | 'chat' | 'mood_bonus' | 'streak_bonus' | 'multi_moonling_bonus';
    description: string;
}

class GlobalPointSystem {
    private storageKey: string;

    constructor(walletAddress: string) {
        this.storageKey = `global_points_${walletAddress}`;
    }

    // Initialize user's global points data
    async initializeUser(walletAddress: string): Promise<GlobalPointsData> {
        const data: GlobalPointsData = {
            walletAddress,
            totalPoints: 0,
            dailyPoints: 0,
            starFragments: 0,
            moonlings: [],
            lastUpdated: new Date().toISOString(),
            currentStreak: 0,
            longestStreak: 0,
        };

        await this.saveData(data);
        return data;
    }

    // Award points for moonling interactions with linear scaling
    async awardInteractionPoints(
        characterMint: string,
        characterName: string,
        actionType: 'feed' | 'sleep' | 'chat',
        achievedGoal: boolean
    ): Promise<PointsReward> {
        const data = await this.loadData();
        if (!data) {
            return { pointsEarned: 0, bonusMultiplier: 1, source: actionType, description: 'No data found' };
        }

        const today = new Date().toISOString().split('T')[0];
        let moonlingData = data.moonlings.find(p => p.characterMint === characterMint);

        if (!moonlingData) {
            moonlingData = {
                characterMint,
                characterName,
                dailyPoints: 0,
                totalPoints: 0,
                lastInteraction: today,
                interactionCount: 0,
                moodBonusPoints: 0,
                streakDays: 0,
            };
            data.moonlings.push(moonlingData);
        }

        // Base points per action
        const basePoints = {
            feed: 10,
            sleep: 15,
            chat: 5,
        };

        let pointsEarned = basePoints[actionType];
        let bonusMultiplier = 1;

        // Multi-moonling bonus: Linear scaling
        // For each additional moonling, increase points by 10%
        const moonlingCount = data.moonlings.length;
        if (moonlingCount > 1) {
            bonusMultiplier += (moonlingCount - 1) * 0.1;
            pointsEarned = Math.floor(pointsEarned * bonusMultiplier);
        }

        // Goal achievement bonus
        if (achievedGoal) {
            const goalBonus = Math.floor(pointsEarned * 0.5); // 50% bonus for achieving daily goals
            pointsEarned += goalBonus;
            moonlingData.moodBonusPoints += goalBonus;
        }

        // Streak bonus (if interacting with any moonling daily)
        const streakBonus = this.calculateStreakBonus(data, today);
        if (streakBonus > 0) {
            pointsEarned += streakBonus;
        }

        // Update moonling data
        moonlingData.dailyPoints += pointsEarned;
        moonlingData.totalPoints += pointsEarned;
        moonlingData.lastInteraction = today;
        moonlingData.interactionCount++;

        // Update global data
        data.totalPoints += pointsEarned;
        data.dailyPoints += pointsEarned;
        data.lastUpdated = new Date().toISOString();

        await this.saveData(data);

        const description = this.getPointsDescription(actionType, achievedGoal, moonlingCount, bonusMultiplier);

        return {
            pointsEarned,
            bonusMultiplier,
            source: actionType,
            description,
        };
    }

    // Calculate streak bonus across all moonlings
    private calculateStreakBonus(data: GlobalPointsData, today: string): number {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Check if any moonling was interacted with yesterday
        const hadYesterdayInteraction = data.moonlings.some(moonling =>
            moonling.lastInteraction === yesterdayStr || moonling.lastInteraction === today
        );

        if (hadYesterdayInteraction) {
            data.currentStreak++;
            data.longestStreak = Math.max(data.longestStreak, data.currentStreak);

            // Streak bonus: 1 point per day in streak, capped at 50
            return Math.min(data.currentStreak, 50);
        } else {
            data.currentStreak = 1; // Reset streak
            return 1;
        }
    }

    // Get points description for notifications
    private getPointsDescription(
        actionType: string,
        achievedGoal: boolean,
        moonlingCount: number,
        multiplier: number
    ): string {
        let desc = `+${actionType} points`;

        if (moonlingCount > 1) {
            desc += ` (${Math.round((multiplier - 1) * 100)}% multi-moonling bonus!)`;
        }

        if (achievedGoal) {
            desc += ` +50% goal bonus!`;
        }

        return desc;
    }

    // Get user's current points data
    async getCurrentPoints(): Promise<GlobalPointsData | null> {
        return await this.loadData();
    }

    // Get leaderboard data (using stored cache instead of mock for consistency)
    async getLeaderboard(): Promise<Array<{ rank: number; walletAddress: string; totalPoints: number; moonlingCount: number }>> {
        const globalKey = 'global_leaderboard_cache';
        const existingStr = await AsyncStorage.getItem(globalKey);
        const existing = existingStr ? JSON.parse(existingStr) : [];
        return existing;
    }

    // Calculate potential daily points with current moonlings
    async getDailyPointsPotential(): Promise<{
        maxDailyPoints: number;
        currentMoonlings: number;
        bonusMultiplier: number;
        breakdown: string[];
    }> {
        const data = await this.loadData();
        const moonlingCount = data?.moonlings.length || 0;

        // Base daily points per moonling (feed + sleep + chat + potential bonuses)
        const baseDailyPerMoonling = 10 + 15 + 5 + 15; // 45 points base + 15 bonus points possible

        // Multi-moonling multiplier
        const multiplier = moonlingCount > 1 ? 1 + (moonlingCount - 1) * 0.1 : 1;

        const maxDailyPoints = Math.floor(baseDailyPerMoonling * moonlingCount * multiplier);

        const breakdown = [
            `${moonlingCount} moonlings × ${baseDailyPerMoonling} base points = ${moonlingCount * baseDailyPerMoonling}`,
            `Multi-moonling bonus: ${Math.round((multiplier - 1) * 100)}%`,
            `Potential streak bonus: up to +${Math.min(50, 7)} points`,
            `Total potential: ${maxDailyPoints} points/day`,
        ];

        return {
            maxDailyPoints,
            currentMoonlings: moonlingCount,
            bonusMultiplier: multiplier,
            breakdown,
        };
    }

    // Reset daily points (called at midnight)
    async resetDailyPoints(): Promise<void> {
        const data = await this.loadData();
        if (!data) return;

        data.dailyPoints = 0;
        data.moonlings.forEach(moonling => {
            moonling.dailyPoints = 0;
        });

        await this.saveData(data);
    }

    // Star Fragment methods
    // Purchase Star Fragments with SOL (conversion rate: 1 SOL = 100 Star Fragments)
    async purchaseStarFragments(solAmount: number): Promise<{ success: boolean; fragments: number; error?: string }> {
        const data = await this.loadData();
        if (!data) {
            return { success: false, fragments: 0, error: 'No user data found' };
        }

        const fragmentsToAdd = Math.floor(solAmount * 100); // 1 SOL = 100 Star Fragments

        if (fragmentsToAdd <= 0) {
            return { success: false, fragments: 0, error: 'Invalid SOL amount' };
        }

        data.starFragments += fragmentsToAdd;
        data.lastUpdated = new Date().toISOString();

        await this.saveData(data);

        return { success: true, fragments: fragmentsToAdd };
    }

    // Spend Star Fragments on items
    async spendStarFragments(amount: number): Promise<{ success: boolean; error?: string }> {
        const data = await this.loadData();
        if (!data) {
            return { success: false, error: 'No user data found' };
        }

        if (data.starFragments < amount) {
            return { success: false, error: 'Insufficient Star Fragments' };
        }

        data.starFragments -= amount;
        data.lastUpdated = new Date().toISOString();

        await this.saveData(data);

        return { success: true };
    }

    // Get current Star Fragment balance
    async getStarFragmentBalance(): Promise<number> {
        const data = await this.loadData();
        return data?.starFragments || 0;
    }

    // Storage methods
    private async saveData(data: GlobalPointsData): Promise<void> {
        await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));

        // Also save to global leaderboard cache (simplified)
        const globalKey = 'global_leaderboard_cache';
        let existingStr = await AsyncStorage.getItem(globalKey);
        let existing = existingStr ? JSON.parse(existingStr) : [];
        const index = existing.findIndex((entry: any) => entry.walletAddress === data.walletAddress);

        if (index >= 0) {
            existing[index] = {
                walletAddress: data.walletAddress,
                totalPoints: data.totalPoints,
                moonlingCount: data.moonlings.length,
                lastUpdated: data.lastUpdated,
            };
        } else {
            existing.push({
                walletAddress: data.walletAddress,
                totalPoints: data.totalPoints,
                moonlingCount: data.moonlings.length,
                lastUpdated: data.lastUpdated,
            });
        }

        // Sort by points and assign ranks
        existing.sort((a: any, b: any) => b.totalPoints - a.totalPoints);
        existing.forEach((entry: any, idx: number) => {
            entry.rank = idx + 1;
        });

        await AsyncStorage.setItem(globalKey, JSON.stringify(existing));
    }

    private async loadData(): Promise<GlobalPointsData | null> {
        const stored = await AsyncStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : null;
    }
}

// Export the GlobalPointSystem class for use in other components
export { GlobalPointSystem };