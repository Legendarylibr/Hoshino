// Unified game types to eliminate inconsistencies across components

export interface MoonlingStats {
    mood: number;
    hunger: number;
    energy: number;
    totalFeedings: number;
    totalPlays: number;
    totalSleeps: number;
    lastPlayed: number;
    level: number;
    experience: number;
    dailyStreak: number;
    lastDailyCheck: string;
    moodEvents: number;
    specialInteractions: number;
    careQuality: number;
    attentionScore: number;
}

export interface Ingredient {
    id: string;
    name: string;
    description: string;
    rarity: ItemRarity;
    cost: number;
    image: string;
    moodBonus: number;
    hungerBonus: number;
    energyBonus: number;
}

export interface Recipe {
    id: string;
    name: string;
    description: string;
    ingredients: { id: string; quantity: number }[];
    result: {
        id: string;
        name: string;
        description: string;
        image: string;
    };
    starRating: 1 | 2 | 3 | 4;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface InventoryItem {
    ingredient: Ingredient;
    quantity: number;
    dateAdded: Date;
}

export interface MarketplaceItem {
    id: string;
    name: string;
    description: string;
    image: string;
    category: ItemCategory;
    rarity: ItemRarity;
    priceSOL: number;
    priceStarFragments: number;
    inStock: boolean;
}

export interface MoodEvent {
    id: string;
    type: 'happy' | 'sad' | 'excited' | 'calm' | 'playful';
    intensity: number; // 1-5
    duration: number; // minutes
    triggeredBy: string;
    timestamp: number;
}

export interface DailyChallenge {
    id: string;
    type: ActionType | 'care';
    target: number;
    current: number;
    reward: number;
    completed: boolean;
    expiresAt: string;
}

export interface AchievementProgress {
    id: string;
    name: string;
    progress: number;
    target: number;
    completed: boolean;
    dateCompleted?: number;
}

export interface Character {
    id: string;
    name: string;
    description: string;
    image: string;
    rarity?: ItemRarity;
    nftMint?: string | null;
    baseStats?: {
        mood: number;
        hunger: number;
        energy: number;
    };
    specialAbility?: string;
}

export interface FoodItem {
    id: string;
    name: string;
    image: string;
    hungerBoost: number;
    moodBoost: number;
    description: string;
    starRating: 1 | 2 | 3 | 4;
}

export interface AttentionInsights {
    score: number;
    trend: 'improving' | 'stable' | 'declining';
    recommendations: string[];
}

export interface MoonCycleProgress {
    currentDay: number;
    daysRemaining: number;
    moodDaysAchieved: number;
    moodDaysNeeded: number;
    onTrack: boolean;
}

export interface GameMechanicsState {
    currentStats: MoonlingStats;
    dailyChallenges: DailyChallenge[];
    moodEvents: MoodEvent[];
    attentionInsights: AttentionInsights;
    moonCycleProgress: MoonCycleProgress;
    recentAchievements: string[];
    careStreak: number;
    lastInteractionTime: number;
}

export interface InteractionResult {
    success: boolean;
    newStats: MoonlingStats;
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

// Utility types for consistent naming - defined first to avoid circular references
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemCategory = 'food' | 'ingredient' | 'accessory' | 'special';
export type ActionType = 'feed' | 'play' | 'sleep' | 'chat';
export type PlayType = 'active' | 'gentle' | 'creative';
export type ChatType = 'casual' | 'deep' | 'playful';
export type SleepQuality = 1 | 2 | 3 | 4 | 5;
export type FoodQuality = 1 | 2 | 3 | 4 | 5;
