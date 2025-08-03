import { Connection, PublicKey } from '@solana/web3.js'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface Mission {
    id: string
    name: string
    description: string
    type: 'daily' | 'weekly' | 'season'
    requirements: MissionRequirement[]
    rewards: MissionReward[]
    progress: number
    maxProgress: number
    completed: boolean
    expiresAt?: Date
    difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
}

export interface MissionRequirement {
    type: 'feed_character' | 'play_minigame' | 'chat_sessions' | 'login_streak' | 'mood_maintain' | 'energy_restore' | 'nft_mint' | 'marketplace_purchase'
    target: number
    description: string
}

export interface MissionReward {
    type: 'star_fragments' | 'experience' | 'cosmetic_unlock' | 'special_food'
    amount: number
    description: string
}

export interface PlayerProgress {
    walletAddress: string
    starFragments: number
    totalEarned: number
    currentStreak: number
    longestStreak: number
    level: number
    experience: number
    lastLoginDate: Date
    seasonProgress: SeasonProgress
    completedMissions: string[]
    achievements: string[]
}

export interface SeasonProgress {
    currentSeason: number
    seasonStartDate: Date
    seasonEndDate: Date
    seasonPoints: number
    seasonTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'celestial'
    seasonRewardsClaimed: boolean
}

export interface StarFragmentTransaction {
    id: string
    type: 'earned' | 'spent'
    amount: number
    source: string // mission_id, purchase_id, etc.
    description: string
    timestamp: Date
}

export class StarFragmentService {
    private connection: Connection
    private storageKey = 'hoshino_star_fragments'

    constructor(connection: Connection) {
        this.connection = connection
    }

    // Get player's current star fragment balance and progress
    async getPlayerProgress(walletAddress: string): Promise<PlayerProgress> {
        try {
            const stored = await AsyncStorage.getItem(`${this.storageKey}_${walletAddress}`)
            if (stored) {
                const progress = JSON.parse(stored)
                // Convert date strings back to Date objects
                progress.lastLoginDate = new Date(progress.lastLoginDate)
                progress.seasonProgress.seasonStartDate = new Date(progress.seasonProgress.seasonStartDate)
                progress.seasonProgress.seasonEndDate = new Date(progress.seasonProgress.seasonEndDate)
                return progress
            }
        } catch (error) {
            console.error('Error loading player progress:', error)
        }

        // Return default progress for new players
        return this.createNewPlayerProgress(walletAddress)
    }

    private createNewPlayerProgress(walletAddress: string): PlayerProgress {
        const now = new Date()
        const seasonStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1) // Quarterly seasons
        const seasonEnd = new Date(seasonStart.getFullYear(), seasonStart.getMonth() + 3, 0)

        return {
            walletAddress,
            starFragments: 75, // Good starting bonus
            totalEarned: 75,
            currentStreak: 0,
            longestStreak: 0,
            level: 1,
            experience: 0,
            lastLoginDate: now,
            seasonProgress: {
                currentSeason: this.getCurrentSeasonNumber(),
                seasonStartDate: seasonStart,
                seasonEndDate: seasonEnd,
                seasonPoints: 0,
                seasonTier: 'bronze',
                seasonRewardsClaimed: false
            },
            completedMissions: [],
            achievements: []
        }
    }

    // Save player progress
    async savePlayerProgress(progress: PlayerProgress): Promise<void> {
        try {
            await AsyncStorage.setItem(`${this.storageKey}_${progress.walletAddress}`, JSON.stringify(progress))
        } catch (error) {
            console.error('Error saving player progress:', error)
        }
    }

    // Daily Missions
    async getDailyMissions(walletAddress: string): Promise<Mission[]> {
        const progress = await this.getPlayerProgress(walletAddress)
        const today = new Date()
        today.setHours(23, 59, 59, 999) // End of day

        return [
            {
                id: 'daily_feed',
                name: '🍎 Daily Feeding',
                description: 'Feed your character 3 times today',
                type: 'daily',
                requirements: [{ type: 'feed_character', target: 3, description: 'Feed character 3 times' }],
                rewards: [{ type: 'star_fragments', amount: 35, description: '+35 Star Fragments' }],
                progress: this.getMissionProgress(progress, 'daily_feed'),
                maxProgress: 3,
                completed: progress.completedMissions.includes(`daily_feed_${this.getDateString(new Date())}`),
                expiresAt: today,
                difficulty: 'easy'
            },
            {
                id: 'daily_chat',
                name: '💬 Heart to Heart',
                description: 'Have 2 chat sessions with your character',
                type: 'daily',
                requirements: [{ type: 'chat_sessions', target: 2, description: 'Chat 2 times' }],
                rewards: [{ type: 'star_fragments', amount: 30, description: '+30 Star Fragments' }],
                progress: this.getMissionProgress(progress, 'daily_chat'),
                maxProgress: 2,
                completed: progress.completedMissions.includes(`daily_chat_${this.getDateString(new Date())}`),
                expiresAt: today,
                difficulty: 'easy'
            },
            {
                id: 'daily_mood',
                name: '😊 Happy Character',
                description: 'Maintain character mood above 3 for 4 hours',
                type: 'daily',
                requirements: [{ type: 'mood_maintain', target: 4, description: 'Keep mood >3 for 4 hours' }],
                rewards: [
                    { type: 'star_fragments', amount: 50, description: '+50 Star Fragments' },
                    { type: 'experience', amount: 100, description: '+100 XP' }
                ],
                progress: this.getMissionProgress(progress, 'daily_mood'),
                maxProgress: 4,
                completed: progress.completedMissions.includes(`daily_mood_${this.getDateString(new Date())}`),
                expiresAt: today,
                difficulty: 'medium'
            }
        ]
    }

    // Weekly Missions  
    async getWeeklyMissions(walletAddress: string): Promise<Mission[]> {
        const progress = await this.getPlayerProgress(walletAddress)
        const weekEnd = this.getWeekEnd()

        return [
            {
                id: 'weekly_streak',
                name: '🔥 Login Streak',
                description: 'Login 5 days this week',
                type: 'weekly',
                requirements: [{ type: 'login_streak', target: 5, description: 'Login 5 different days' }],
                rewards: [
                    { type: 'star_fragments', amount: 200, description: '+200 Star Fragments' },
                    { type: 'special_food', amount: 1, description: 'Premium Starberry' }
                ],
                progress: Math.min(progress.currentStreak, 5),
                maxProgress: 5,
                completed: progress.completedMissions.includes(`weekly_streak_${this.getWeekString()}`),
                expiresAt: weekEnd,
                difficulty: 'medium'
            },
            {
                id: 'weekly_marketplace',
                name: '🛒 Cosmic Shopper',
                description: 'Make 3 marketplace purchases this week',
                type: 'weekly',
                requirements: [{ type: 'marketplace_purchase', target: 3, description: 'Buy 3 items from shop' }],
                rewards: [
                    { type: 'star_fragments', amount: 250, description: '+250 Star Fragments' },
                    { type: 'cosmetic_unlock', amount: 1, description: 'Unlock special hat' }
                ],
                progress: this.getMissionProgress(progress, 'weekly_marketplace'),
                maxProgress: 3,
                completed: progress.completedMissions.includes(`weekly_marketplace_${this.getWeekString()}`),
                expiresAt: weekEnd,
                difficulty: 'hard'
            },
            {
                id: 'weekly_nft',
                name: '🎭 NFT Collector',
                description: 'Mint 1 character or item as NFT',
                type: 'weekly',
                requirements: [{ type: 'nft_mint', target: 1, description: 'Mint any NFT' }],
                rewards: [
                    { type: 'star_fragments', amount: 400, description: '+400 Star Fragments!' },
                    { type: 'experience', amount: 300, description: '+300 XP' }
                ],
                progress: this.getMissionProgress(progress, 'weekly_nft'),
                maxProgress: 1,
                completed: progress.completedMissions.includes(`weekly_nft_${this.getWeekString()}`),
                expiresAt: weekEnd,
                difficulty: 'legendary'
            }
        ]
    }

    // Season Missions & Rewards
    async getSeasonMissions(walletAddress: string): Promise<Mission[]> {
        const progress = await this.getPlayerProgress(walletAddress)

        return [
            {
                id: 'season_dedication',
                name: '🌟 Celestial Dedication',
                description: 'Earn 10,000 season points',
                type: 'season',
                requirements: [{ type: 'login_streak', target: 10000, description: 'Earn 10,000 season points' }],
                rewards: [
                    { type: 'star_fragments', amount: 1500, description: '+1500 Star Fragments!' },
                    { type: 'cosmetic_unlock', amount: 1, description: 'Celestial Wings' }
                ],
                progress: progress.seasonProgress.seasonPoints,
                maxProgress: 10000,
                completed: progress.seasonProgress.seasonPoints >= 10000,
                expiresAt: progress.seasonProgress.seasonEndDate,
                difficulty: 'legendary'
            }
        ]
    }

    // Complete a mission and award rewards
    async completeMission(walletAddress: string, missionId: string): Promise<{ success: boolean; rewards: MissionReward[]; error?: string }> {
        try {
            const progress = await this.getPlayerProgress(walletAddress)
            const allMissions = [...await this.getDailyMissions(walletAddress), ...await this.getWeeklyMissions(walletAddress), ...await this.getSeasonMissions(walletAddress)]
            const mission = allMissions.find(m => m.id === missionId)

            if (!mission) {
                return { success: false, rewards: [], error: 'Mission not found' }
            }

            if (mission.completed) {
                return { success: false, rewards: [], error: 'Mission already completed' }
            }

            // Check if mission requirements are met
            if (mission.progress < mission.maxProgress) {
                return { success: false, rewards: [], error: 'Mission requirements not met' }
            }

            // Award rewards
            const totalFragments = mission.rewards
                .filter(r => r.type === 'star_fragments')
                .reduce((sum, r) => sum + r.amount, 0)

            progress.starFragments += totalFragments
            progress.totalEarned += totalFragments

            // Award experience
            const totalExp = mission.rewards
                .filter(r => r.type === 'experience')
                .reduce((sum, r) => sum + r.amount, 0)

            progress.experience += totalExp

            // Check for level up
            const newLevel = Math.floor(progress.experience / 1000) + 1
            if (newLevel > progress.level) {
                progress.level = newLevel
                // Level up bonus
                progress.starFragments += newLevel * 50
            }

            // Mark mission as completed
            const completionKey = mission.type === 'daily'
                ? `${missionId}_${this.getDateString(new Date())}`
                : mission.type === 'weekly'
                    ? `${missionId}_${this.getWeekString()}`
                    : missionId

            progress.completedMissions.push(completionKey)

            // Season points
            progress.seasonProgress.seasonPoints += totalFragments

            await this.savePlayerProgress(progress)

            return { success: true, rewards: mission.rewards }
        } catch (error) {
            return { success: false, rewards: [], error: 'Failed to complete mission' }
        }
    }

    // Spend star fragments
    async spendStarFragments(walletAddress: string, amount: number, description: string): Promise<{ success: boolean; newBalance?: number; error?: string }> {
        try {
            const progress = await this.getPlayerProgress(walletAddress)

            if (progress.starFragments < amount) {
                return { success: false, error: 'Insufficient star fragments' }
            }

            progress.starFragments -= amount
            await this.savePlayerProgress(progress)

            // Record transaction
            await this.recordTransaction(walletAddress, {
                id: `spend_${Date.now()}`,
                type: 'spent',
                amount,
                source: 'purchase',
                description,
                timestamp: new Date()
            })

            return { success: true, newBalance: progress.starFragments }
        } catch (error) {
            return { success: false, error: 'Failed to spend star fragments' }
        }
    }

    // Check daily login and update streak
    async checkDailyLogin(walletAddress: string): Promise<{ loginReward: number; streakBonus: number; isNewDay: boolean }> {
        const progress = await this.getPlayerProgress(walletAddress)
        const now = new Date()
        const today = this.getDateString(now)
        const lastLogin = this.getDateString(progress.lastLoginDate)

        if (today === lastLogin) {
            return { loginReward: 0, streakBonus: 0, isNewDay: false }
        }

        // New day login
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        const wasYesterday = lastLogin === this.getDateString(yesterday)

        if (wasYesterday) {
            progress.currentStreak += 1
        } else {
            progress.currentStreak = 1
        }

        progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak)
        progress.lastLoginDate = now

        // Login rewards
        const baseReward = 15
        const streakBonus = Math.min(progress.currentStreak * 5, 75) // Max 75 bonus for 15+ day streaks
        const totalReward = baseReward + streakBonus

        progress.starFragments += totalReward
        progress.totalEarned += totalReward

        await this.savePlayerProgress(progress)

        return { loginReward: baseReward, streakBonus, isNewDay: true }
    }

    // Helper methods
    private getMissionProgress(progress: PlayerProgress, missionId: string): number {
        // This would normally come from actual game data
        // For now, return simulated progress
        return Math.floor(Math.random() * 3) // Random progress for demo
    }

    private getCurrentSeasonNumber(): number {
        const startDate = new Date('2024-01-01')
        const now = new Date()
        const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
        return Math.floor(monthsDiff / 3) + 1
    }

    private getDateString(date: Date): string {
        return date.toISOString().split('T')[0]
    }

    private getWeekString(): string {
        const now = new Date()
        const week = Math.ceil((now.getDate() - now.getDay()) / 7)
        return `${now.getFullYear()}-${now.getMonth() + 1}-W${week}`
    }

    private getWeekEnd(): Date {
        const now = new Date()
        const dayOfWeek = now.getDay()
        const daysUntilSunday = (7 - dayOfWeek) % 7
        const weekEnd = new Date(now)
        weekEnd.setDate(now.getDate() + daysUntilSunday)
        weekEnd.setHours(23, 59, 59, 999)
        return weekEnd
    }

    private async recordTransaction(walletAddress: string, transaction: StarFragmentTransaction): Promise<void> {
        try {
            const key = `${this.storageKey}_transactions_${walletAddress}`
            const stored = await AsyncStorage.getItem(key)
            const transactions = stored ? JSON.parse(stored) : []
            transactions.push(transaction)

            // Keep only last 100 transactions
            if (transactions.length > 100) {
                transactions.splice(0, transactions.length - 100)
            }

            await AsyncStorage.setItem(key, JSON.stringify(transactions))
        } catch (error) {
            console.error('Error recording transaction:', error)
        }
    }

    // Get transaction history
    async getTransactionHistory(walletAddress: string): Promise<StarFragmentTransaction[]> {
        try {
            const key = `${this.storageKey}_transactions_${walletAddress}`
            const stored = await AsyncStorage.getItem(key)
            const transactions = stored ? JSON.parse(stored) : []
            // Convert timestamp back to Date
            return transactions.map((tx: any) => ({ ...tx, timestamp: new Date(tx.timestamp) }))
        } catch (error) {
            console.error('Error loading transaction history:', error)
            return []
        }
    }
}

export default StarFragmentService