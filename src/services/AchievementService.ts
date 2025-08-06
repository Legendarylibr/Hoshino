import { Connection, PublicKey } from '@solana/web3.js';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { ProgrammableNFTService, GameAchievement } from './ProgrammableNFTService';

export type AchievementRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'

export interface Achievement {
  id: string
  name: string
  description: string
  imageUrl: string
  rarity: AchievementRarity
  pointsReward: number
  isUnlocked: boolean
  unlockedAt?: Date
  requirements: {
    type: 'streak' | 'total' | 'single' | 'milestone'
    target: number
    metric: string
  }
}

export interface AchievementProgress {
  achievementId: string
  currentProgress: number
  isCompleted: boolean
  completedAt?: Date
}

export interface MissionReward {
  type: 'star_fragments' | 'nft' | 'cosmetic'
  amount?: number
  item?: Achievement
}

export interface PointsReward {
  pointsEarned: number
  bonusMultiplier: number
  source: string
  description: string
}

export interface TimedReward {
  id: string
  name: string
  description: string
  rarity: AchievementRarity
  isActive: boolean
  imageUrl: string
}

export class AchievementService {
  private nftService: ProgrammableNFTService
  private connection: Connection
  private wallet: WalletAdapter

  constructor(connection: Connection, wallet: WalletAdapter) {
    this.connection = connection
    this.wallet = wallet
    this.nftService = new ProgrammableNFTService(connection.rpcEndpoint)
    
    if (wallet.publicKey) {
      this.nftService.setWalletSigner(wallet.publicKey)
    }
  }

  /**
   * Mint achievement as programmable NFT using backend metadata handling
   */
  async mintAchievementNFT(achievement: Achievement): Promise<{ success: boolean; mintAddress?: string; error?: string }> {
    try {
      if (!this.wallet.publicKey) {
        return { success: false, error: 'Wallet not connected' }
      }

      console.log(`🏆 Minting achievement pNFT: ${achievement.name}`)

      // Convert Achievement to GameAchievement format
      const gameAchievement: GameAchievement = {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        rarity: achievement.rarity
      }

      // Mint as programmable NFT using backend metadata handling
      const result = await this.nftService.mintAchievementPNFT(
        gameAchievement,
        this.wallet.publicKey
      )

      if (result.success) {
        console.log('✅ Achievement pNFT minted:', result.mintAddress)
        return {
          success: true,
          mintAddress: result.mintAddress
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to mint achievement NFT'
        }
      }
    } catch (error) {
      console.error('❌ Achievement NFT minting failed:', error)
      return {
        success: false,
        error: `Failed to mint achievement: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Create a standard achievement NFT with backend metadata handling
   */
  async createAchievementNFT(
    achievementData: {
      name: string
      description: string
      imageUrl: string
      rarity: AchievementRarity
      attributes?: Array<{ trait_type: string; value: string | number }>
    }
  ): Promise<{ success: boolean; nft?: any; error?: string }> {
    try {
      if (!this.wallet.publicKey) {
        return { success: false, error: 'Wallet not connected' }
      }

      console.log(`🎨 Creating achievement pNFT: ${achievementData.name}`)

      // Convert to GameAchievement format
      const gameAchievement: GameAchievement = {
        id: `achievement_${Date.now()}`,
        name: achievementData.name,
        description: achievementData.description,
        rarity: achievementData.rarity
      }

      // Mint as programmable NFT using backend metadata handling
      const result = await this.nftService.mintAchievementPNFT(
        gameAchievement,
        this.wallet.publicKey
      )

      if (result.success) {
        console.log('✅ Achievement pNFT created successfully:', result.mintAddress)
        return { success: true, nft: result }
      } else {
        console.error('❌ Achievement pNFT creation failed:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('❌ Achievement NFT creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Achievement NFT creation failed'
      }
    }
  }

  /**
   * Mint timed reward NFT using backend metadata handling
   */
  async mintTimedRewardNFT(reward: TimedReward, ownerPublicKey: PublicKey): Promise<{ success: boolean; nft?: any; error?: string; actualCost?: string }> {
    try {
      if (!this.wallet.publicKey) {
        return { success: false, error: 'Wallet not connected' }
      }

      console.log(`⏰ Minting timed reward pNFT: ${reward.name}`)

      // Convert to GameAchievement format for backend metadata handling
      const gameAchievement: GameAchievement = {
        id: reward.id,
        name: reward.name,
        description: reward.description,
        rarity: reward.rarity
      }

      // Mint as programmable NFT using backend metadata handling
      const result = await this.nftService.mintAchievementPNFT(
        gameAchievement,
        ownerPublicKey
      )

      if (result.success) {
        console.log('✅ Timed reward pNFT minted successfully:', result.mintAddress)
        // Record timed reward for enhanced game features
        this.recordTimedReward(reward, ownerPublicKey, new PublicKey(result.mintAddress!))
        
        return {
          success: true,
          nft: result,
          actualCost: result.actualCost || '~0.01 SOL'
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to mint timed reward NFT'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Timed reward NFT minting failed'
      }
    }
  }

  /**
   * Record timed reward for tracking
   */
  private recordTimedReward(reward: TimedReward, owner: PublicKey, nftAddress: PublicKey) {
    const rewardsKey = `hoshino_timed_rewards_${owner.toString()}`
    const existing = JSON.parse(localStorage.getItem(rewardsKey) || '[]')
    
    existing.push({
      ...reward,
      nftAddress: nftAddress.toString(),
      mintedAt: Date.now()
    })
    
    localStorage.setItem(rewardsKey, JSON.stringify(existing))
  }

  /**
   * Record achievement progress
   */
  private recordAchievementProgress(achievement: Achievement, owner: PublicKey, nftAddress: PublicKey) {
    const progressKey = `hoshino_achievement_progress_${owner.toString()}`
    const existing = JSON.parse(localStorage.getItem(progressKey) || '[]')
    
    existing.push({
      achievementId: achievement.id,
      nftAddress: nftAddress.toString(),
      unlockedAt: Date.now(),
      rarity: achievement.rarity
    })
    
    localStorage.setItem(progressKey, JSON.stringify(existing))
  }

  /**
   * Get available achievements
   */
  getAvailableAchievements(): Achievement[] {
    return [
      {
        id: 'first_feed',
        name: 'First Meal',
        description: 'Fed your moonling for the first time. The beginning of a beautiful friendship!',
        imageUrl: 'QmFirstFeedAchievement',
        rarity: 'Common',
        pointsReward: 10,
        isUnlocked: false,
        requirements: {
          type: 'single',
          target: 1,
          metric: 'feed_count'
        }
      },
      {
        id: 'caretaker_10',
        name: 'Caring Soul',
        description: 'Fed your moonling 10 times. You\'re becoming a great caretaker!',
        imageUrl: 'QmCaretaker10Achievement',
        rarity: 'Common',
        pointsReward: 25,
        isUnlocked: false,
        requirements: {
          type: 'total',
          target: 10,
          metric: 'feed_count'
        }
      },
      {
        id: 'caretaker_50',
        name: 'Dedicated Caretaker',
        description: 'Fed your moonling 50 times. Your dedication knows no bounds!',
        imageUrl: 'QmCaretaker50Achievement',
        rarity: 'Rare',
        pointsReward: 100,
        isUnlocked: false,
        requirements: {
          type: 'total',
          target: 50,
          metric: 'feed_count'
        }
      },
      {
        id: 'playful_friend',
        name: 'Playful Friend',
        description: 'Played with your moonling 25 times. Fun is the key to happiness!',
        imageUrl: 'QmPlayfulFriendAchievement',
        rarity: 'Common',
        pointsReward: 50,
        isUnlocked: false,
        requirements: {
          type: 'total',
          target: 25,
          metric: 'play_count'
        }
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Put your moonling to sleep 20 times. Sweet dreams make for happy moonlings!',
        imageUrl: 'QmNightOwlAchievement',
        rarity: 'Common',
        pointsReward: 40,
        isUnlocked: false,
        requirements: {
          type: 'total',
          target: 20,
          metric: 'sleep_count'
        }
      }
    ]
  }

  /**
   * Get rarity name
   */
  getRarityName(rarity: AchievementRarity): string {
    switch (rarity) {
      case 'Common': return 'Common'
      case 'Rare': return 'Rare'
      case 'Epic': return 'Epic'
      case 'Legendary': return 'Legendary'
      default: return 'Common'
    }
  }

  /**
   * Check for new achievements based on user stats
   */
  checkForNewAchievements(userStats: {
    feedCount: number,
    chatCount: number,
    daysActive: number,
    hasNFT: boolean,
    relationshipLevel: number,
    characterLevel?: number,
    totalExperience?: number,
    owner: PublicKey
  }): Achievement[] {
    const availableAchievements = this.getAvailableAchievements()
    const unlockedAchievements: Achievement[] = []

    for (const achievement of availableAchievements) {
      if (this.checkAchievementCriteria(achievement, userStats)) {
        unlockedAchievements.push({
          ...achievement,
          isUnlocked: true,
          unlockedAt: new Date()
        })
      }
    }

    return unlockedAchievements
  }

  /**
   * Check if achievement criteria are met
   */
  private checkAchievementCriteria(achievement: Achievement, userStats: any): boolean {
    switch (achievement.requirements.metric) {
      case 'feed_count':
        return userStats.feedCount >= achievement.requirements.target
      case 'play_count':
        return userStats.playCount >= achievement.requirements.target
      case 'sleep_count':
        return userStats.sleepCount >= achievement.requirements.target
      case 'chat_count':
        return userStats.chatCount >= achievement.requirements.target
      case 'days_active':
        return userStats.daysActive >= achievement.requirements.target
      default:
        return false
    }
  }
} 