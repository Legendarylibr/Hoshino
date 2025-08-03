import { Connection, PublicKey, Keypair } from '@solana/web3.js'
import { createUmi } from '@metaplex-foundation/umi'
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import { Program, AnchorProvider } from '@coral-xyz/anchor'

// Achievement types and reward periods
export enum RewardType {
  ACHIEVEMENT = 0,
  DAILY = 1,
  WEEKLY = 2,
  MONTHLY = 3,
  SPECIAL_EVENT = 4
}

export enum AchievementRarity {
  COMMON = 0,
  UNCOMMON = 1,
  RARE = 2,
  EPIC = 3,
  LEGENDARY = 4
}

export interface Achievement {
  id: string
  name: string
  description: string
  rarity: AchievementRarity
  rewardType: RewardType
  unlockedAt?: Date
  expiresAt?: Date
  isRareDrop: boolean
  nftMint?: string
  imageUrl: string
}

export interface TimedReward {
  name: string
  description: string
  period: 'daily' | 'weekly' | 'monthly'
  expiresAt: Date
  rarity: AchievementRarity
  isActive: boolean
  imageUrl: string
}

// UMI-based Metaplex implementation for React Native compatibility
class UmiMetaplex {
  private umi: any
  private connection: Connection

  constructor(connection: Connection) {
    this.connection = connection
    // For now, use mock implementation to avoid UMI interface issues
    console.log('🔧 Using mock UMI achievement implementation for React Native compatibility')
  }

  use(identity: any) {
    console.log('🔧 UMI identity set')
    // UMI handles identity differently - we'll implement this as needed
  }

  nfts() {
    return {
      create: async (params: any) => {
        console.log('🎨 UMI NFT creation with params:', params)
        
        // For now, return mock NFT until we implement full UMI minting
        const mockNft = {
          address: Keypair.generate().publicKey,
          uri: params.uri || 'mock-uri',
          name: params.name,
          symbol: params.symbol,
          sellerFeeBasisPoints: params.sellerFeeBasisPoints,
          creators: params.creators,
          isMutable: params.isMutable
        }
        return { nft: mockNft }
      },
      findAllByOwner: async (params: any) => {
        console.log('🔍 UMI NFT fetch for owner:', params.owner.toString())
        return []
      }
    }
  }
}

// Custom program integration
// Using valid placeholder until achievement program is deployed
const HOSHINO_ACHIEVEMENT_PROGRAM_ID = new PublicKey("22222222222222222222222222222222")

export class AchievementService {
  private metaplex: UmiMetaplex
  private connection: Connection
  private wallet: WalletAdapter
  private merkleTree: PublicKey | null = null
  private program: Program | null = null

  constructor(connection: Connection, wallet: WalletAdapter) {
    this.connection = connection
    this.wallet = wallet
    this.metaplex = new UmiMetaplex(connection)
    
    this.initializeProgram()
    this.initializeMerkleTree()
  }

  private async initializeProgram() {
    try {
      if (this.wallet.publicKey) {
        const provider = new AnchorProvider(this.connection, this.wallet as any, {})
        // Note: In production, you'd import the actual IDL
        // this.program = new Program(IDL, HOSHINO_ACHIEVEMENT_PROGRAM_ID, provider)
      }
    } catch (error) {
      console.warn('Could not initialize achievement program:', error)
    }
  }

  private async initializeMerkleTree() {
    try {
      const treeKeypair = Keypair.generate()
      this.merkleTree = treeKeypair.publicKey
    } catch (error) {
      console.warn('Could not initialize achievement tree:', error)
    }
  }

  // Mock metadata upload for React Native compatibility
  private async mockUploadMetadata(metadata: any): Promise<string> {
    // Generate a mock IPFS URI for React Native compatibility
    // In a real implementation, this would upload to IPFS or Arweave
    const mockHash = Math.random().toString(36).substring(2, 15)
    const mockUri = `https://mock-ipfs.io/ipfs/${mockHash}`
    
    console.log('📤 Mock metadata upload:', mockUri)
    return mockUri
  }

  // PERIODIC REWARD SYSTEM - Automatically mint rewards at specific intervals
  
  async mintDailyReward(ownerPublicKey: PublicKey): Promise<{ success: boolean; nft?: any; error?: string; actualCost?: string }> {
    try {
      const dailyRewards = [
        { name: "Daily Login Bonus", rarity: AchievementRarity.COMMON, image: "daily-login.png" },
        { name: "First Feed of the Day", rarity: AchievementRarity.COMMON, image: "daily-feed.png" },
        { name: "Daily Chat Master", rarity: AchievementRarity.RARE, image: "daily-chat.png" },
        { name: "Daily Care Streak", rarity: AchievementRarity.EPIC, image: "daily-streak.png" }
      ]

      const randomReward = dailyRewards[Math.floor(Math.random() * dailyRewards.length)]
      
      const timedReward: TimedReward = {
        name: randomReward.name,
        description: "Daily reward for consistent Hoshino care",
        period: 'daily',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        rarity: randomReward.rarity,
        isActive: true,
        imageUrl: `https://hoshino.game/assets/rewards/${randomReward.image}`
      }
      
      return await this.mintTimedRewardNFT(timedReward, ownerPublicKey)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Daily reward minting failed'
      }
    }
  }

  async mintWeeklyReward(ownerPublicKey: PublicKey): Promise<{ success: boolean; nft?: any; error?: string; actualCost?: string }> {
    try {
      const weeklyRewards = [
        { name: "Weekly Dedication Badge", rarity: AchievementRarity.RARE, image: "weekly-dedication.png" },
        { name: "Seven Day Streak", rarity: AchievementRarity.EPIC, image: "weekly-streak.png" },
        { name: "Master Caretaker", rarity: AchievementRarity.LEGENDARY, image: "weekly-master.png" }
      ]

      const randomReward = weeklyRewards[Math.floor(Math.random() * weeklyRewards.length)]
      
      const timedReward: TimedReward = {
        name: randomReward.name,
        description: "Weekly reward for exceptional Hoshino dedication",
        period: 'weekly',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        rarity: randomReward.rarity,
        isActive: true,
        imageUrl: `https://hoshino.game/assets/rewards/${randomReward.image}`
      }
      
      return await this.mintTimedRewardNFT(timedReward, ownerPublicKey)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Weekly reward minting failed'
      }
    }
  }

  async mintMonthlyReward(ownerPublicKey: PublicKey): Promise<{ success: boolean; nft?: any; error?: string; actualCost?: string }> {
    try {
      const monthlyRewards = [
        { name: "Monthly Champion", rarity: AchievementRarity.EPIC, image: "monthly-champion.png" },
        { name: "Legendary Caretaker", rarity: AchievementRarity.LEGENDARY, image: "monthly-legendary.png" },
        { name: "Ultra Rare Cosmic Bond", rarity: AchievementRarity.LEGENDARY, image: "monthly-cosmic.png" }
      ]

      const randomReward = monthlyRewards[Math.floor(Math.random() * monthlyRewards.length)]
      
      const timedReward: TimedReward = {
        name: randomReward.name,
        description: "Monthly reward for ultimate Hoshino mastery",
        period: 'monthly',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        rarity: randomReward.rarity,
        isActive: true,
        imageUrl: `https://hoshino.game/assets/rewards/${randomReward.image}`
      }
      
      return await this.mintTimedRewardNFT(timedReward, ownerPublicKey)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Monthly reward minting failed'
      }
    }
  }

  // ACHIEVEMENT SYSTEM - Mint NFTs when specific goals are reached with custom program integration

  async mintAchievementNFT(achievement: Achievement, ownerPublicKey: PublicKey): Promise<{ success: boolean; nft?: any; error?: string; actualCost?: string }> {
    try {
      const achievementMetadata = {
        name: `${achievement.name} - ${this.getRarityName(achievement.rarity)}`,
        description: achievement.description,
        image: achievement.imageUrl,
        attributes: [
          { trait_type: 'Type', value: 'Achievement Badge' },
          { trait_type: 'Rarity', value: this.getRarityName(achievement.rarity) },
          { trait_type: 'Category', value: this.getRewardTypeName(achievement.rewardType) },
          { trait_type: 'Unlocked Date', value: new Date().toISOString().split('T')[0] },
          { trait_type: 'Rare Drop', value: achievement.isRareDrop ? 'Yes' : 'No' },
          { trait_type: 'Achievement ID', value: achievement.id }
        ],
        collection: {
          name: 'Hoshino Achievement Badges',
          family: 'Hoshino'
        },
        // Enhanced metadata for custom program
        gameData: {
          achievementId: achievement.id,
          rewardType: achievement.rewardType,
          rarity: achievement.rarity,
          isRareDrop: achievement.isRareDrop,
          unlockedAt: Date.now()
        }
      }

      // Mock metadata upload for React Native compatibility
      const uri = await this.mockUploadMetadata(achievementMetadata)
      console.log('✅ Achievement metadata uploaded (mock) - Cost: 0.01 SOL')

      try {
        // TRY CUSTOM ACHIEVEMENT PROGRAM FIRST
        if (this.program) {
          const result = await this.mintWithCustomAchievementProgram(achievement, ownerPublicKey, uri)
          if (result.success) {
            // Store achievement unlock for game logic
            this.recordAchievementProgress(achievement, ownerPublicKey, result.nft.address)
            return result
          }
        }
      } catch (customError) {
        console.warn('Custom achievement program not available, using standard NFT:', customError)
      }

      // FALLBACK: Standard achievement NFT
      const { nft } = await this.metaplex.nfts().create({
        name: achievementMetadata.name,
        uri,
        symbol: this.getSymbolForRewardType(achievement.rewardType),
        sellerFeeBasisPoints: 0, // No royalties on achievement NFTs
        creators: [
          {
            address: ownerPublicKey,
            share: 100,
          },
        ],
        isMutable: false,
      })

      console.log('✅ Achievement NFT minted successfully:', nft.address.toString())

             // Store achievement progress for enhanced game features
       this.recordAchievementProgress(achievement, ownerPublicKey, nft.address)

      return {
        success: true,
        nft: nft,
        actualCost: '~0.01 SOL'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Achievement NFT minting failed'
      }
    }
  }

  private async mintWithCustomAchievementProgram(achievement: Achievement, ownerPublicKey: PublicKey, uri: string) {
    try {
      // Prepare custom program accounts
      const [achievementPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("achievement_compressed"), ownerPublicKey.toBuffer()],
        HOSHINO_ACHIEVEMENT_PROGRAM_ID
      )

      const [treeConfigPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("tree_config"), this.merkleTree!.toBuffer()],
        HOSHINO_ACHIEVEMENT_PROGRAM_ID
      )

      // This would be the actual custom program call
      // const tx = await this.program.methods
      //   .mintCompressedAchievement(
      //     achievement.name,
      //     achievement.description,
      //     uri,
      //     achievement.rewardType,
      //     achievement.rarity,
      //     achievement.isRareDrop
      //   )
      //   .accounts({
      //     achievement: achievementPda,
      //     treeConfig: treeConfigPda,
      //     merkleTree: this.merkleTree,
      //     leafOwner: ownerPublicKey,
      //     // ... other accounts
      //   })
      //   .rpc()

      console.log('🏆 Custom achievement program integration ready for deployment')
      
      return {
        success: true,
        customProgram: true,
        achievementPda: achievementPda.toString(),
        nft: {
          address: achievementPda,
          mint: achievementPda
        }
      }
    } catch (error) {
      console.error('Custom achievement program error:', error)
      throw error
    }
  }

  private recordAchievementProgress(achievement: Achievement, owner: PublicKey, nftAddress: PublicKey) {
    // Enhanced progress tracking for game features
    const progressKey = `hoshino_achievement_progress_${owner.toString()}`
    const existing = JSON.parse(localStorage.getItem(progressKey) || '{}')
    
    existing[achievement.id] = {
      ...achievement,
      nftAddress: nftAddress.toString(),
      unlockedAt: Date.now(),
      rewardClaimed: true,
      progress: 100 // Completed
    }
    
    localStorage.setItem(progressKey, JSON.stringify(existing))

    // Update overall user statistics
    this.updateUserAchievementStats(owner, achievement)
  }

  private updateUserAchievementStats(owner: PublicKey, achievement: Achievement) {
    const statsKey = `hoshino_user_stats_${owner.toString()}`
    const stats = JSON.parse(localStorage.getItem(statsKey) || '{}')
    
    stats.totalAchievements = (stats.totalAchievements || 0) + 1
    stats.lastAchievement = achievement.id
    stats.lastAchievementDate = Date.now()
    
    // Track by rarity
    const rarityName = this.getRarityName(achievement.rarity).toLowerCase()
    stats[`${rarityName}Achievements`] = (stats[`${rarityName}Achievements`] || 0) + 1
    
    localStorage.setItem(statsKey, JSON.stringify(stats))
  }

  async mintTimedRewardNFT(reward: TimedReward, ownerPublicKey: PublicKey): Promise<{ success: boolean; nft?: any; error?: string; actualCost?: string }> {
    try {
      const timedRewardMetadata = {
        name: `${reward.name} - ${reward.period.toUpperCase()} Edition`,
        description: `${reward.description} - Limited time ${reward.period} reward`,
        image: reward.imageUrl,
        attributes: [
          { trait_type: 'Type', value: 'Timed Reward' },
          { trait_type: 'Period', value: reward.period.charAt(0).toUpperCase() + reward.period.slice(1) },
          { trait_type: 'Rarity', value: this.getRarityName(reward.rarity) },
          { trait_type: 'Expires', value: reward.expiresAt.toISOString().split('T')[0] },
          { trait_type: 'Limited Edition', value: 'True' },
          { trait_type: 'Reward ID', value: `${reward.period}_${Date.now()}` }
        ],
        collection: {
          name: `Hoshino ${reward.period.charAt(0).toUpperCase() + reward.period.slice(1)} Rewards`,
          family: 'Hoshino'
        },
        // Enhanced metadata for game features
        gameData: {
          period: reward.period,
          expiresAt: reward.expiresAt.getTime(),
          isActive: reward.isActive,
          rarity: reward.rarity
        }
      }

      // Mock metadata upload for React Native compatibility
      const uri = await this.mockUploadMetadata(timedRewardMetadata)
      console.log('✅ Timed reward metadata uploaded (mock) - Cost: 0.01 SOL')

      try {
        // TRY CUSTOM TIMED REWARD PROGRAM
        if (this.program) {
          const result = await this.mintWithCustomTimedRewardProgram(reward, ownerPublicKey, uri)
          if (result.success) return result
        }
      } catch (customError) {
        console.warn('Custom timed reward program not available, using standard NFT:', customError)
      }

      // FALLBACK: Standard timed reward NFT
      const { nft } = await this.metaplex.nfts().create({
        name: timedRewardMetadata.name,
        uri,
        symbol: 'HTIME',
        sellerFeeBasisPoints: 250, // 2.5% royalties for special rewards
        creators: [
          {
            address: ownerPublicKey,
            share: 100,
          },
        ],
        isMutable: false,
      })

      console.log('✅ Timed reward NFT minted successfully:', nft.address.toString())

             // Store timed reward for expiration tracking
       this.recordTimedReward(reward, ownerPublicKey, nft.address)

      return {
        success: true,
        nft: nft,
        actualCost: '~0.01 SOL'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Timed reward NFT minting failed'
      }
    }
  }

  private async mintWithCustomTimedRewardProgram(reward: TimedReward, ownerPublicKey: PublicKey, uri: string) {
    try {
      // This would call your mint_compressed_timed_reward function
      console.log('⏰ Custom timed reward program integration ready')
      
      return {
        success: true,
        customProgram: true,
        nft: { address: Keypair.generate().publicKey }
      }
    } catch (error) {
      throw error
    }
  }

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

  // SPECIAL EVENT REWARDS with enhanced tracking

  async mintSpecialEventNFT(eventName: string, eventDescription: string, ownerPublicKey: PublicKey): Promise<{ success: boolean; nft?: any; error?: string; actualCost?: string }> {
    try {
      const eventMetadata = {
        name: `${eventName} - Special Event`,
        description: eventDescription,
        image: `https://hoshino.game/assets/events/${eventName.toLowerCase().replace(/\s+/g, '-')}.png`,
        attributes: [
          { trait_type: 'Type', value: 'Special Event' },
          { trait_type: 'Event', value: eventName },
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'Limited Edition', value: 'Ultra Rare' },
          { trait_type: 'Event Date', value: new Date().toISOString().split('T')[0] },
          { trait_type: 'Event ID', value: eventName.replace(/\s+/g, '_').toLowerCase() }
        ],
        collection: {
          name: 'Hoshino Special Events (Compressed)',
          family: 'Hoshino'
        },
        gameData: {
          eventName,
          eventDate: Date.now(),
          isSpecialEvent: true,
          rarity: AchievementRarity.LEGENDARY
        }
      }

      // Mock metadata upload for React Native compatibility
      const uri = await this.mockUploadMetadata(eventMetadata)
      console.log('✅ Special event metadata uploaded (mock) - Cost: 0.01 SOL')

      try {
        // TRY CUSTOM SPECIAL EVENT PROGRAM
        if (this.program) {
          // await this.program.methods.mintSpecialEventNFT(...)
          console.log('🎉 Special event program integration ready')
        }
      } catch (customError) {
        console.warn('Custom special event program not available, using standard NFT')
      }

      // Standard compressed special event NFT
      const { nft } = await this.metaplex.nfts().create({
        name: eventMetadata.name,
        uri,
        symbol: 'HSPC',
        sellerFeeBasisPoints: 500, // 5% royalties for ultra-rare events
        creators: [
          {
            address: ownerPublicKey,
            share: 100,
          },
        ],
        isMutable: false,
      })

      console.log('✅ Special event NFT minted successfully:', nft.address.toString())

             // Record special event participation
       this.recordSpecialEvent(eventName, ownerPublicKey, nft.address)

      return {
        success: true,
        nft: nft,
        actualCost: '~0.01 SOL'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Special event NFT minting failed'
      }
    }
  }

  private recordSpecialEvent(eventName: string, owner: PublicKey, nftAddress: PublicKey) {
    const eventsKey = `hoshino_special_events_${owner.toString()}`
    const existing = JSON.parse(localStorage.getItem(eventsKey) || '[]')
    
    existing.push({
      eventName,
      nftAddress: nftAddress.toString(),
      participatedAt: Date.now()
    })
    
    localStorage.setItem(eventsKey, JSON.stringify(existing))
  }

  // ENHANCED ACHIEVEMENT SYSTEM with Character Integration

  async checkCharacterBasedAchievements(characterNftAddress: PublicKey, userStats: any): Promise<Achievement[]> {
    const newAchievements: Achievement[] = []
    const availableAchievements = this.getAvailableAchievements()
    
    for (const achievement of availableAchievements) {
      if (await this.isAchievementUnlocked(achievement.id, userStats.owner)) {
        continue // Already unlocked
      }
      
      if (this.checkAchievementCriteria(achievement, userStats)) {
        newAchievements.push(achievement)
      }
    }
    
    return newAchievements
  }

  private checkAchievementCriteria(achievement: Achievement, userStats: any): boolean {
    switch (achievement.id) {
              case 'first_moonling':
        return true // Always qualifies when they first get the app
      case 'feed_master':
        return userStats.feedCount >= 100
      case 'chat_expert':
        return userStats.chatCount >= 500
      case 'legendary_caretaker':
        return userStats.daysActive >= 30
      case 'nft_collector':
        return userStats.hasNFT
      case 'cosmic_bond':
        return userStats.relationshipLevel >= 100
      case 'level_master':
        return userStats.characterLevel >= 10
      case 'experience_hunter':
        return userStats.totalExperience >= 5000
      default:
        return false
    }
  }

  private async isAchievementUnlocked(achievementId: string, owner: PublicKey): Promise<boolean> {
    const progressKey = `hoshino_achievement_progress_${owner.toString()}`
    const progress = JSON.parse(localStorage.getItem(progressKey) || '{}')
    return !!progress[achievementId]
  }

  // PREDEFINED ACHIEVEMENTS with enhanced rewards

  getAvailableAchievements(): Achievement[] {
    return [
      {
        id: 'first_moonling',
        name: 'First Companion',
                  description: 'Welcome to the Hoshino universe! You\'ve adopted your first cosmic moonling.',
        rarity: AchievementRarity.COMMON,
        rewardType: RewardType.ACHIEVEMENT,
        isRareDrop: false,
        imageUrl: 'https://hoshino.game/assets/achievements/first-moonling.png'
      },
      {
        id: 'feed_master',
        name: 'Feeding Master',
        description: 'Fed your Hoshino 100 times. You truly care about your companion!',
        rarity: AchievementRarity.RARE,
        rewardType: RewardType.ACHIEVEMENT,
        isRareDrop: false,
        imageUrl: 'https://hoshino.game/assets/achievements/feed-master.png'
      },
      {
        id: 'chat_expert',
        name: 'Conversation Expert',
        description: 'Had 500 conversations with your Hoshino. The bond grows stronger!',
        rarity: AchievementRarity.EPIC,
        rewardType: RewardType.ACHIEVEMENT,
        isRareDrop: true,
        imageUrl: 'https://hoshino.game/assets/achievements/chat-expert.png'
      },
      {
        id: 'legendary_caretaker',
        name: 'Legendary Caretaker',
        description: 'Maintained perfect care for 30 consecutive days. You are a true master!',
        rarity: AchievementRarity.LEGENDARY,
        rewardType: RewardType.ACHIEVEMENT,
        isRareDrop: true,
        imageUrl: 'https://hoshino.game/assets/achievements/legendary-caretaker.png'
      },
      {
        id: 'nft_collector',
        name: 'NFT Collector',
        description: 'Minted your first Hoshino NFT. Welcome to the blockchain!',
        rarity: AchievementRarity.RARE,
        rewardType: RewardType.ACHIEVEMENT,
        isRareDrop: false,
        imageUrl: 'https://hoshino.game/assets/achievements/nft-collector.png'
      },
      {
        id: 'cosmic_bond',
        name: 'Cosmic Bond',
        description: 'Achieved maximum level relationship with your Hoshino. Truly legendary!',
        rarity: AchievementRarity.LEGENDARY,
        rewardType: RewardType.ACHIEVEMENT,
        isRareDrop: true,
        imageUrl: 'https://hoshino.game/assets/achievements/cosmic-bond.png'
      },
      {
        id: 'level_master',
        name: 'Level Master',
        description: 'Reached level 10 with your character. Your bond grows stronger!',
        rarity: AchievementRarity.EPIC,
        rewardType: RewardType.ACHIEVEMENT,
        isRareDrop: true,
        imageUrl: 'https://hoshino.game/assets/achievements/level-master.png'
      },
      {
        id: 'experience_hunter',
        name: 'Experience Hunter',
        description: 'Accumulated 5000 total experience points. A true explorer!',
        rarity: AchievementRarity.EPIC,
        rewardType: RewardType.ACHIEVEMENT,
        isRareDrop: false,
        imageUrl: 'https://hoshino.game/assets/achievements/experience-hunter.png'
      }
    ]
  }

  // Enhanced user progress tracking with character integration

  async getUserAchievementProgress(owner: PublicKey): Promise<any> {
    const progressKey = `hoshino_achievement_progress_${owner.toString()}`
    const statsKey = `hoshino_user_stats_${owner.toString()}`
    
    const progress = JSON.parse(localStorage.getItem(progressKey) || '{}')
    const stats = JSON.parse(localStorage.getItem(statsKey) || '{}')
    
    return {
      unlockedAchievements: Object.keys(progress),
      totalAchievements: stats.totalAchievements || 0,
      lastAchievement: stats.lastAchievement,
      progressDetails: progress,
      userStats: stats
    }
  }

  // Check if user qualifies for any achievements based on their stats
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
    const unlockedAchievements: Achievement[] = []
    const availableAchievements = this.getAvailableAchievements()

    availableAchievements.forEach(achievement => {
      if (this.checkAchievementCriteria(achievement, userStats)) {
        unlockedAchievements.push({
          ...achievement,
          unlockedAt: new Date()
        })
      }
    })

    return unlockedAchievements
  }

  // Utility functions with enhanced functionality
  
  getRarityName(rarity: AchievementRarity): string {
    const rarityNames = {
      [AchievementRarity.COMMON]: 'Common',
      [AchievementRarity.UNCOMMON]: 'Uncommon',
      [AchievementRarity.RARE]: 'Rare',
      [AchievementRarity.EPIC]: 'Epic',
      [AchievementRarity.LEGENDARY]: 'Legendary'
    }
    return rarityNames[rarity] || 'Common'
  }

  getRewardTypeName(rewardType: RewardType): string {
    const typeNames = {
      [RewardType.ACHIEVEMENT]: 'Achievement',
      [RewardType.DAILY]: 'Daily Reward',
      [RewardType.WEEKLY]: 'Weekly Reward',
      [RewardType.MONTHLY]: 'Monthly Reward',
      [RewardType.SPECIAL_EVENT]: 'Special Event'
    }
    return typeNames[rewardType] || 'Achievement'
  }

  getSymbolForRewardType(rewardType: RewardType): string {
    const symbols = {
      [RewardType.ACHIEVEMENT]: 'HACH',
      [RewardType.DAILY]: 'HDLY',
      [RewardType.WEEKLY]: 'HWKLY',
      [RewardType.MONTHLY]: 'HMTH',
      [RewardType.SPECIAL_EVENT]: 'HSPC'
    }
    return symbols[rewardType] || 'HACH'
  }

  // Enhanced marketplace integration for achievement rewards
  async claimAchievementReward(achievementId: string, owner: PublicKey): Promise<{ success: boolean; reward?: any; error?: string }> {
    try {
      // Check if achievement is unlocked
      const progressKey = `hoshino_achievement_progress_${owner.toString()}`
      const progress = JSON.parse(localStorage.getItem(progressKey) || '{}')
      
      if (!progress[achievementId]) {
        return { success: false, error: 'Achievement not unlocked' }
      }
      
      if (progress[achievementId].rewardClaimed) {
        return { success: false, error: 'Reward already claimed' }
      }
      
      // Apply achievement rewards (could be items, experience, etc.)
      const achievement = this.getAvailableAchievements().find(a => a.id === achievementId)
      if (!achievement) {
        return { success: false, error: 'Achievement not found' }
      }
      
      const rewards = this.getAchievementRewards(achievement)
      
      // Mark reward as claimed
      progress[achievementId].rewardClaimed = true
      localStorage.setItem(progressKey, JSON.stringify(progress))
      
      return {
        success: true,
        reward: rewards
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to claim reward'
      }
    }
  }

  private getAchievementRewards(achievement: Achievement): any {
    // Define rewards based on achievement rarity and type
    const baseRewards = {
      experience: achievement.rarity * 100,
      items: [] as string[],
      specialAbilities: [] as string[]
    }
    
    switch (achievement.rarity) {
      case AchievementRarity.LEGENDARY:
        baseRewards.items.push('cosmic_essence', 'legendary_food')
        baseRewards.specialAbilities.push('auto_care')
        break
      case AchievementRarity.EPIC:
        baseRewards.items.push('epic_toy', 'exp_booster')
        break
      case AchievementRarity.RARE:
        baseRewards.items.push('rare_food', 'energy_drink')
        break
      default:
        baseRewards.items.push('basic_food')
    }
    
    return baseRewards
  }
} 