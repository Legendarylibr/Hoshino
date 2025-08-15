import { InventoryService } from './InventoryService';
import { RecipeService } from './RecipeService';
import { IngredientDiscoveryService } from './IngredientDiscoveryService';
import { AchievementService } from './AchievementService';
import { StarFragmentService } from './StarFragmentService';
import { Connection } from '@solana/web3.js';

export interface GameState {
    inventory: {
        totalItems: number;
        uniqueItems: number;
        byType: Record<string, number>;
        byRarity: Record<string, number>;
    };
    recipes: {
        total: number;
        craftable: number;
        byDifficulty: Record<string, number>;
        byStarRating: Record<number, number>;
    };
    achievements: {
        total: number;
        completed: number;
        completion: number;
        byCategory: Record<string, number>;
    };
    starFragments: {
        balance: number;
        totalEarned: number;
        totalSpent: number;
        netChange: number;
    };
    discoveries: {
        total: number;
        today: number;
        byRarity: Record<string, number>;
    };
}

export interface IntegrationEvent {
    type: 'inventory_change' | 'recipe_crafted' | 'achievement_unlocked' | 'discovery_made' | 'star_fragments_earned';
    data: any;
    timestamp: number;
}

export class GameIntegrationService {
    private static instance: GameIntegrationService;
    private inventoryService: InventoryService;
    private recipeService: RecipeService;
    private discoveryService: IngredientDiscoveryService;
    private achievementService: AchievementService;
    private starFragmentService: StarFragmentService;
    private eventListeners: Array<(event: IntegrationEvent) => void> = [];
    private gameState: GameState | null = null;

    private constructor(connection: Connection) {
        this.inventoryService = InventoryService.getInstance();
        this.recipeService = RecipeService.getInstance();
        this.discoveryService = IngredientDiscoveryService.getInstance();
        this.achievementService = AchievementService.getInstance();
        this.starFragmentService = new StarFragmentService(connection);
        
        this.initializeIntegration();
    }

    static getInstance(connection: Connection): GameIntegrationService {
        if (!GameIntegrationService.instance) {
            GameIntegrationService.instance = new GameIntegrationService(connection);
        }
        return GameIntegrationService.instance;
    }

    // Subscribe to integration events
    subscribe(listener: (event: IntegrationEvent) => void): () => void {
        this.eventListeners.push(listener);
        return () => {
            const index = this.eventListeners.indexOf(listener);
            if (index > -1) {
                this.eventListeners.splice(index, 1);
            }
        };
    }

    // Notify all listeners of integration events
    private notifyListeners(event: IntegrationEvent): void {
        this.eventListeners.forEach(listener => listener(event));
    }

    // Initialize integration between all services
    private async initializeIntegration(): Promise<void> {
        try {
            // Subscribe to inventory changes
            this.inventoryService.subscribe(async (inventory) => {
                // Check achievements when inventory changes
                await this.achievementService.checkInventoryAchievements();
                
                // Update game state
                await this.updateGameState();
                
                // Notify listeners
                this.notifyListeners({
                    type: 'inventory_change',
                    data: { inventory },
                    timestamp: Date.now()
                });
            });

            // Subscribe to achievement changes
            this.achievementService.subscribe(async (achievements) => {
                // Award star fragments for completed achievements
                const newlyCompleted = achievements.filter(a => a.completed && a.reward);
                
                for (const achievement of newlyCompleted) {
                    if (achievement.reward?.type === 'star_fragments') {
                        await this.starFragmentService.rewardForInventoryAchievement(
                            achievement.id,
                            achievement.reward.amount
                        );
                    }
                }
                
                // Update game state
                await this.updateGameState();
                
                // Notify listeners
                this.notifyListeners({
                    type: 'achievement_unlocked',
                    data: { achievements: newlyCompleted },
                    timestamp: Date.now()
                });
            });

            console.log('✅ Game integration initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize game integration:', error);
        }
    }

    // Update the overall game state
    private async updateGameState(): Promise<void> {
        try {
            const [inventoryStats, recipeStats, achievementStats, starFragmentStats, discoveryStats] = await Promise.all([
                this.inventoryService.getInventoryStats(),
                this.recipeService.getRecipeStats(),
                this.achievementService.getOverallCompletion(),
                this.starFragmentService.getSpendingStats(),
                this.discoveryService.getDiscoveryStats()
            ]);

            this.gameState = {
                inventory: inventoryStats || {
                    totalItems: 0,
                    uniqueItems: 0,
                    byType: {},
                    byRarity: {}
                },
                recipes: {
                    total: recipeStats?.totalRecipes || 0,
                    craftable: 0, // This would need to be calculated
                    byDifficulty: recipeStats?.byDifficulty || {},
                    byStarRating: recipeStats?.byStarRating || {}
                },
                achievements: {
                    total: 0, // This would need to be calculated
                    completed: 0, // This would need to be calculated
                    completion: achievementStats || 0,
                    byCategory: {}
                },
                starFragments: {
                    balance: this.starFragmentService.getBalance(),
                    totalEarned: starFragmentStats?.totalEarned || 0,
                    totalSpent: starFragmentStats?.totalSpent || 0,
                    netChange: starFragmentStats?.netChange || 0
                },
                discoveries: {
                    total: discoveryStats?.totalDiscoveries || 0,
                    today: discoveryStats?.todayDiscoveries || 0,
                    byRarity: discoveryStats?.byRarity || {}
                }
            };
        } catch (error) {
            console.error('Failed to update game state:', error);
        }
    }

    // Get current game state
    async getGameState(): Promise<GameState | null> {
        if (!this.gameState) {
            await this.updateGameState();
        }
        return this.gameState;
    }

    // Force refresh game state
    async refreshGameState(): Promise<GameState | null> {
        await this.updateGameState();
        return this.gameState;
    }

    // Process ingredient discovery with full integration
    async processIngredientDiscovery(ingredientId: string, quantity: number = 1): Promise<{
        success: boolean;
        discovery: any;
        rewards: any[];
        achievements: any[];
    }> {
        try {
            // Make the discovery
            const discovery = await this.discoveryService.forceDiscovery(ingredientId, quantity);
            
            // Add to inventory
            await this.inventoryService.addToInventory([{
                id: ingredientId,
                quantity,
                source: 'discovery'
            }]);
            
            // Award star fragments for discovery
            const starFragmentReward = await this.starFragmentService.rewardForDiscovery(
                discovery.id,
                10 // Base reward for discovery
            );
            
            // Check achievements
            await this.achievementService.checkDiscoveryAchievements(
                (await this.discoveryService.getDiscoveryStats()).totalDiscoveries
            );
            
            // Update game state
            await this.updateGameState();
            
            // Notify listeners
            this.notifyListeners({
                type: 'discovery_made',
                data: { discovery, rewards: [starFragmentReward] },
                timestamp: Date.now()
            });
            
            return {
                success: true,
                discovery,
                rewards: [starFragmentReward],
                achievements: []
            };
        } catch (error) {
            console.error('Failed to process ingredient discovery:', error);
            return {
                success: false,
                discovery: null,
                rewards: [],
                achievements: []
            };
        }
    }

    // Process recipe crafting with full integration
    async processRecipeCrafting(recipeId: string): Promise<{
        success: boolean;
        recipe: any;
        consumedIngredients: any[];
        craftedItem: any;
        rewards: any[];
        achievements: any[];
    }> {
        try {
            // Craft the recipe
            const craftingResult = await this.recipeService.craftRecipe(recipeId);
            
            if (!craftingResult.success) {
                return {
                    success: false,
                    recipe: craftingResult.recipe,
                    consumedIngredients: [],
                    craftedItem: null,
                    rewards: [],
                    achievements: []
                };
            }
            
            // Award star fragments for crafting
            const starFragmentReward = await this.starFragmentService.rewardForCrafting(
                recipeId,
                25 // Base reward for crafting
            );
            
            // Check achievements
            await this.achievementService.checkCraftingAchievements(craftingResult);
            
            // Update game state
            await this.updateGameState();
            
            // Notify listeners
            this.notifyListeners({
                type: 'recipe_crafted',
                data: { 
                    recipe: craftingResult.recipe,
                    craftedItem: craftingResult.craftedItem,
                    rewards: [starFragmentReward]
                },
                timestamp: Date.now()
            });
            
            return {
                success: true,
                recipe: craftingResult.recipe,
                consumedIngredients: craftingResult.consumedIngredients,
                craftedItem: craftingResult.craftedItem,
                rewards: [starFragmentReward],
                achievements: []
            };
        } catch (error) {
            console.error('Failed to process recipe crafting:', error);
            return {
                success: false,
                recipe: null,
                consumedIngredients: [],
                craftedItem: null,
                rewards: [],
                achievements: []
            };
        }
    }

    // Get integration statistics
    async getIntegrationStats(): Promise<{
        totalEvents: number;
        lastEvent: IntegrationEvent | null;
        eventCounts: Record<string, number>;
    }> {
        // This would track actual events over time
        // For now, return placeholder data
        return {
            totalEvents: 0,
            lastEvent: null,
            eventCounts: {}
        };
    }

    // Reset all game data (for testing)
    async resetAllGameData(): Promise<void> {
        try {
            await Promise.all([
                this.inventoryService.clearInventory(),
                this.achievementService.resetAchievements(),
                this.discoveryService.clearDiscoveryHistory(),
                this.starFragmentService.resetData()
            ]);
            
            await this.updateGameState();
            
            console.log('✅ All game data reset successfully');
        } catch (error) {
            console.error('❌ Failed to reset game data:', error);
        }
    }

    // Export game data
    async exportGameData(): Promise<any> {
        try {
            const [inventory, achievements, discoveries, starFragments] = await Promise.all([
                this.inventoryService.getInventory(),
                this.achievementService.getAllAchievements(),
                this.discoveryService.getDiscoveryHistory(),
                this.starFragmentService.getTransactionHistory()
            ]);
            
            return {
                exportDate: new Date().toISOString(),
                inventory,
                achievements,
                discoveries,
                starFragments,
                gameState: await this.getGameState()
            };
        } catch (error) {
            console.error('Failed to export game data:', error);
            return null;
        }
    }

    // Import game data
    async importGameData(data: any): Promise<boolean> {
        try {
            // This would implement data import logic
            // For now, just log the attempt
            console.log('Import game data:', data);
            return true;
        } catch (error) {
            console.error('Failed to import game data:', error);
            return false;
        }
    }
}
