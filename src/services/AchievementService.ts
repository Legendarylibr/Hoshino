import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryService } from './InventoryService';
import { RecipeService } from './RecipeService';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    category: 'inventory' | 'crafting' | 'discovery' | 'general';
    requirement: {
        type: 'item_count' | 'recipe_crafted' | 'discovery_count' | 'rarity_collected' | 'custom';
        target: number;
        metadata?: any;
    };
    reward?: {
        type: 'star_fragments' | 'ingredient' | 'special_item';
        amount: number;
        itemId?: string;
    };
    progress: number;
    completed: boolean;
    dateCompleted?: number;
    icon?: string;
}

export interface AchievementProgress {
    achievementId: string;
    current: number;
    target: number;
    percentage: number;
    completed: boolean;
}

export class AchievementService {
    private static instance: AchievementService;
    private storageKey = 'achievements';
    private inventoryService: InventoryService;
    private recipeService: RecipeService;
    private achievements: Achievement[] = [];
    private listeners: Array<(achievements: Achievement[]) => void> = [];

    private constructor() {
        this.inventoryService = InventoryService.getInstance();
        this.recipeService = RecipeService.getInstance();
        this.initializeAchievements();
    }

    static getInstance(): AchievementService {
        if (!AchievementService.instance) {
            AchievementService.instance = new AchievementService();
        }
        return AchievementService.instance;
    }

    // Subscribe to achievement changes
    subscribe(listener: (achievements: Achievement[]) => void): () => void {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    // Notify all listeners of achievement changes
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.achievements));
    }

    // Initialize default achievements
    private initializeAchievements(): void {
        this.achievements = [
            // Inventory achievements
            {
                id: 'first_ingredient',
                name: 'First Ingredient',
                description: 'Collect your first ingredient',
                category: 'inventory',
                requirement: {
                    type: 'item_count',
                    target: 1
                },
                reward: {
                    type: 'star_fragments',
                    amount: 10
                },
                progress: 0,
                completed: false
            },
            {
                id: 'ingredient_collector',
                name: 'Ingredient Collector',
                description: 'Collect 10 ingredients',
                category: 'inventory',
                requirement: {
                    type: 'item_count',
                    target: 10
                },
                reward: {
                    type: 'star_fragments',
                    amount: 25
                },
                progress: 0,
                completed: false
            },
            {
                id: 'master_collector',
                name: 'Master Collector',
                description: 'Collect 50 ingredients',
                category: 'inventory',
                requirement: {
                    type: 'item_count',
                    target: 50
                },
                reward: {
                    type: 'star_fragments',
                    amount: 100
                },
                progress: 0,
                completed: false
            },
            {
                id: 'rarity_hunter',
                name: 'Rarity Hunter',
                description: 'Collect ingredients of all rarities',
                category: 'inventory',
                requirement: {
                    type: 'rarity_collected',
                    target: 4, // common, uncommon, rare, epic
                    metadata: { rarities: ['common', 'uncommon', 'rare', 'epic'] }
                },
                reward: {
                    type: 'star_fragments',
                    amount: 50
                },
                progress: 0,
                completed: false
            },

            // Crafting achievements
            {
                id: 'first_craft',
                name: 'First Craft',
                description: 'Craft your first recipe',
                category: 'crafting',
                requirement: {
                    type: 'recipe_crafted',
                    target: 1
                },
                reward: {
                    type: 'star_fragments',
                    amount: 15
                },
                progress: 0,
                completed: false
            },
            {
                id: 'apprentice_crafter',
                name: 'Apprentice Crafter',
                description: 'Craft 5 recipes',
                category: 'crafting',
                requirement: {
                    type: 'recipe_crafted',
                    target: 5
                },
                reward: {
                    type: 'star_fragments',
                    amount: 30
                },
                progress: 0,
                completed: false
            },
            {
                id: 'master_crafter',
                name: 'Master Crafter',
                description: 'Craft 20 recipes',
                category: 'crafting',
                requirement: {
                    type: 'recipe_crafted',
                    target: 20
                },
                reward: {
                    type: 'star_fragments',
                    amount: 75
                },
                progress: 0,
                completed: false
            },
            {
                id: 'star_chef',
                name: 'Star Chef',
                description: 'Craft a 4-star recipe',
                category: 'crafting',
                requirement: {
                    type: 'custom',
                    target: 1,
                    metadata: { action: 'craft_4_star_recipe' }
                },
                reward: {
                    type: 'star_fragments',
                    amount: 100
                },
                progress: 0,
                completed: false
            },

            // Discovery achievements
            {
                id: 'first_discovery',
                name: 'First Discovery',
                description: 'Discover your first ingredient',
                category: 'discovery',
                requirement: {
                    type: 'discovery_count',
                    target: 1
                },
                reward: {
                    type: 'star_fragments',
                    amount: 20
                },
                progress: 0,
                completed: false
            },
            {
                id: 'explorer',
                name: 'Explorer',
                description: 'Discover 10 ingredients',
                category: 'discovery',
                requirement: {
                    type: 'discovery_count',
                    target: 10
                },
                reward: {
                    type: 'star_fragments',
                    amount: 40
                },
                progress: 0,
                completed: false
            },
            {
                id: 'treasure_hunter',
                name: 'Treasure Hunter',
                description: 'Discover 25 ingredients',
                category: 'discovery',
                requirement: {
                    type: 'discovery_count',
                    target: 25
                },
                reward: {
                    type: 'star_fragments',
                    amount: 75
                },
                progress: 0,
                completed: false
            }
        ];

        this.loadAchievements();
    }

    // Load achievements from storage
    private async loadAchievements(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(this.storageKey);
            if (stored) {
                const storedAchievements = JSON.parse(stored);
                // Merge stored progress with default achievements
                this.achievements = this.achievements.map(achievement => {
                    const stored = storedAchievements.find((a: Achievement) => a.id === achievement.id);
                    return stored ? { ...achievement, ...stored } : achievement;
                });
            }
        } catch (error) {
            console.error('Failed to load achievements:', error);
        }
    }

    // Save achievements to storage
    private async saveAchievements(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.achievements));
        } catch (error) {
            console.error('Failed to save achievements:', error);
        }
    }

    // Update achievement progress
    async updateProgress(achievementId: string, progress: number): Promise<boolean> {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.completed) {
            return false;
        }

        achievement.progress = Math.min(progress, achievement.requirement.target);
        
        if (achievement.progress >= achievement.requirement.target && !achievement.completed) {
            achievement.completed = true;
            achievement.dateCompleted = Date.now();
            this.notifyListeners();
            await this.saveAchievements();
            return true; // Achievement completed
        }

        await this.saveAchievements();
        this.notifyListeners();
        return false; // Progress updated but not completed
    }

    // Check inventory-related achievements
    async checkInventoryAchievements(): Promise<void> {
        try {
            const inventory = await this.inventoryService.getInventory();
            const totalItems = inventory.reduce((total, item) => total + item.quantity, 0);
            
            // Check item count achievements
            await this.updateProgress('first_ingredient', totalItems);
            await this.updateProgress('ingredient_collector', totalItems);
            await this.updateProgress('master_collector', totalItems);

            // Check rarity achievements
            const rarities = new Set(inventory.map(item => item.rarity));
            await this.updateProgress('rarity_hunter', rarities.size);
        } catch (error) {
            console.error('Failed to check inventory achievements:', error);
        }
    }

    // Check crafting achievements
    async checkCraftingAchievements(recipeCrafted: any): Promise<void> {
        try {
            // This would be called when a recipe is crafted
            // For now, we'll need to track this separately
            console.log('Recipe crafted:', recipeCrafted);
        } catch (error) {
            console.error('Failed to check crafting achievements:', error);
        }
    }

    // Check discovery achievements
    async checkDiscoveryAchievements(discoveryCount: number): Promise<void> {
        try {
            await this.updateProgress('first_discovery', discoveryCount);
            await this.updateProgress('explorer', discoveryCount);
            await this.updateProgress('treasure_hunter', discoveryCount);
        } catch (error) {
            console.error('Failed to check discovery achievements:', error);
        }
    }

    // Get all achievements
    getAllAchievements(): Achievement[] {
        return [...this.achievements];
    }

    // Get achievements by category
    getAchievementsByCategory(category: Achievement['category']): Achievement[] {
        return this.achievements.filter(a => a.category === category);
    }

    // Get completed achievements
    getCompletedAchievements(): Achievement[] {
        return this.achievements.filter(a => a.completed);
    }

    // Get incomplete achievements
    getIncompleteAchievements(): Achievement[] {
        return this.achievements.filter(a => !a.completed);
    }

    // Get achievement progress
    getAchievementProgress(achievementId: string): AchievementProgress | null {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement) return null;

        return {
            achievementId,
            current: achievement.progress,
            target: achievement.requirement.target,
            percentage: (achievement.progress / achievement.requirement.target) * 100,
            completed: achievement.completed
        };
    }

    // Get overall completion percentage
    getOverallCompletion(): number {
        const completed = this.achievements.filter(a => a.completed).length;
        return (completed / this.achievements.length) * 100;
    }

    // Reset all achievements (for testing)
    async resetAchievements(): Promise<void> {
        this.achievements.forEach(achievement => {
            achievement.progress = 0;
            achievement.completed = false;
            achievement.dateCompleted = undefined;
        });
        
        await this.saveAchievements();
        this.notifyListeners();
    }

    // Add custom achievement
    async addCustomAchievement(achievement: Omit<Achievement, 'id'>): Promise<string> {
        const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newAchievement: Achievement = {
            ...achievement,
            id
        };
        
        this.achievements.push(newAchievement);
        await this.saveAchievements();
        this.notifyListeners();
        
        return id;
    }

    // Remove custom achievement
    async removeCustomAchievement(achievementId: string): Promise<boolean> {
        const index = this.achievements.findIndex(a => a.id === achievementId);
        if (index === -1) return false;
        
        this.achievements.splice(index, 1);
        await this.saveAchievements();
        this.notifyListeners();
        
        return true;
    }
} 