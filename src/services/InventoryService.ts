import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ingredient, InventoryItem, MarketplaceItem, Recipe } from '../types/GameTypes';
import { INGREDIENTS, getIngredientById } from '../data/ingredients';
import { RECIPES, canCraftRecipe, getCraftableRecipes } from '../data/recipes';

export interface UnifiedInventoryItem {
    id: string;
    name: string;
    description: string;
    image: string;
    rarity: string;
    cost: number;
    quantity: number;
    dateAdded: Date;
    type: 'ingredient' | 'marketplace' | 'crafted';
    source: 'purchase' | 'discovery' | 'crafting' | 'reward';
    metadata?: {
        moodBonus?: number;
        hungerBonus?: number;
        energyBonus?: number;
        category?: string;
        inStock?: boolean;
    };
}

export class InventoryService {
    private static instance: InventoryService;
    private storageKey = 'unified_inventory';
    private listeners: Array<(inventory: UnifiedInventoryItem[]) => void> = [];

    private constructor() {}

    static getInstance(): InventoryService {
        if (!InventoryService.instance) {
            InventoryService.instance = new InventoryService();
        }
        return InventoryService.instance;
    }

    // Subscribe to inventory changes
    public subscribe(listener: (inventory: UnifiedInventoryItem[]) => void): () => void {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    // Notify all listeners of inventory changes
    private notifyListeners(inventory: UnifiedInventoryItem[]): void {
        this.listeners.forEach(listener => listener(inventory));
    }

    // Add items to inventory (unified method)
    public async addToInventory(
        items: Array<{
            id: string;
            quantity: number;
            source: 'purchase' | 'discovery' | 'crafting' | 'reward';
        }>
    ): Promise<void> {
        const currentInventory = await this.getInventory();
        const newInventory = [...currentInventory];

        items.forEach(({ id, quantity, source }) => {
            // Try to find existing item
            const existingIndex = newInventory.findIndex(item => item.id === id);

            if (existingIndex >= 0) {
                // Increase quantity if item already exists
                newInventory[existingIndex].quantity += quantity;
            } else {
                // Add new item to inventory
                const newItem = this.createInventoryItem(id, quantity, source);
                if (newItem) {
                    newInventory.push(newItem);
                }
            }
        });

        await this.saveInventory(newInventory);
        this.notifyListeners(newInventory);
    }

    // Remove items from inventory
    public async removeFromInventory(itemId: string, quantity: number = 1): Promise<boolean> {
        const currentInventory = await this.getInventory();
        const itemIndex = currentInventory.findIndex(item => item.id === itemId);

        if (itemIndex === -1 || currentInventory[itemIndex].quantity < quantity) {
            return false;
        }

        const newInventory = [...currentInventory];
        const newQuantity = Math.max(0, newInventory[itemIndex].quantity - quantity);

        if (newQuantity === 0) {
            // Remove item completely if quantity reaches 0
            newInventory.splice(itemIndex, 1);
        } else {
            // Update quantity
            newInventory[itemIndex].quantity = newQuantity;
        }

        await this.saveInventory(newInventory);
        this.notifyListeners(newInventory);
        return true;
    }

    // Get inventory as ingredients (for IngredientSelection component)
    public async getInventoryAsIngredients(): Promise<Array<{
        id: string;
        name: string;
        description: string;
        image: string;
        rarity: string;
        cost: number;
        owned: number;
    }>> {
        const inventory = await this.getInventory();
        return inventory
            .filter(item => item.type === 'ingredient')
            .map(item => ({
                id: item.id,
                name: item.name,
                description: item.description,
                image: item.image,
                rarity: item.rarity,
                cost: item.cost,
                owned: item.quantity
            }));
    }

    // Get inventory as marketplace items (for Shop component)
    public async getInventoryAsMarketplaceItems(): Promise<MarketplaceItem[]> {
        const inventory = await this.getInventory();
        return inventory
            .filter(item => item.type === 'ingredient')
            .map(item => ({
                id: item.id,
                name: item.name,
                description: item.description,
                image: item.image,
                category: 'ingredient' as any,
                rarity: item.rarity as any,
                priceSOL: 0,
                priceStarFragments: item.cost,
                inStock: item.metadata?.inStock ?? true
            }));
    }

    // Get inventory as GameTypes InventoryItem (for compatibility)
    public async getInventoryAsGameTypes(): Promise<InventoryItem[]> {
        const inventory = await this.getInventory();
        return inventory
            .filter(item => item.type === 'ingredient')
            .map(item => {
                const ingredient: Ingredient = {
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    rarity: item.rarity as any,
                    cost: item.cost,
                    image: item.image,
                    moodBonus: item.metadata?.moodBonus ?? 0,
                    hungerBonus: item.metadata?.hungerBonus ?? 0,
                    energyBonus: item.metadata?.energyBonus ?? 0
                };

                return {
                    ingredient,
                    quantity: item.quantity,
                    dateAdded: item.dateAdded
                };
            });
    }

    // Get total item count
    public async getTotalItemCount(): Promise<number> {
        const inventory = await this.getInventory();
        return inventory.reduce((total, item) => total + item.quantity, 0);
    }

    // Get items by type
    public async getItemsByType(type: 'ingredient' | 'marketplace' | 'crafted'): Promise<UnifiedInventoryItem[]> {
        const inventory = await this.getInventory();
        return inventory.filter(item => item.type === type);
    }

    // Get items by rarity
    public async getItemsByRarity(rarity: string): Promise<UnifiedInventoryItem[]> {
        const inventory = await this.getInventory();
        return inventory.filter(item => item.rarity === rarity);
    }

    // Check if recipe can be crafted
    public async canCraftRecipe(recipe: Recipe): Promise<boolean> {
        const inventory = await this.getInventory();
        const availableIngredients = inventory
            .filter(item => item.type === 'ingredient')
            .map(item => ({ id: item.id, quantity: item.quantity }));
        
        return canCraftRecipe(recipe, availableIngredients);
    }

    // Get craftable recipes
    public async getCraftableRecipes(): Promise<Recipe[]> {
        const inventory = await this.getInventory();
        const availableIngredients = inventory
            .filter(item => item.type === 'ingredient')
            .map(item => ({ id: item.id, quantity: item.quantity }));
        
        return getCraftableRecipes(availableIngredients);
    }

    // Craft a recipe (consumes ingredients)
    public async craftRecipe(recipe: Recipe): Promise<boolean> {
        if (!(await this.canCraftRecipe(recipe))) {
            return false;
        }

        // Remove ingredients
        for (const ingredient of recipe.ingredients) {
            const success = await this.removeFromInventory(ingredient.id, ingredient.quantity);
            if (!success) {
                return false;
            }
        }

        // Add crafted item to inventory
        await this.addToInventory([{
            id: recipe.result.id,
            quantity: 1,
            source: 'crafting'
        }]);

        return true;
    }

    // Search inventory
    public async searchInventory(query: string): Promise<UnifiedInventoryItem[]> {
        const inventory = await this.getInventory();
        const lowerQuery = query.toLowerCase();
        
        return inventory.filter(item => 
            item.name.toLowerCase().includes(lowerQuery) ||
            item.description.toLowerCase().includes(lowerQuery) ||
            item.rarity.toLowerCase().includes(lowerQuery)
        );
    }

    // Get inventory statistics
    public async getInventoryStats(): Promise<{
        totalItems: number;
        uniqueItems: number;
        byType: Record<string, number>;
        byRarity: Record<string, number>;
    }> {
        const inventory = await this.getInventory();
        
        const byType: Record<string, number> = {};
        const byRarity: Record<string, number> = {};
        
        inventory.forEach(item => {
            byType[item.type] = (byType[item.type] || 0) + item.quantity;
            byRarity[item.rarity] = (byRarity[item.rarity] || 0) + item.quantity;
        });

        return {
            totalItems: inventory.reduce((total, item) => total + item.quantity, 0),
            uniqueItems: inventory.length,
            byType,
            byRarity
        };
    }

    // Private helper methods
    private createInventoryItem(
        id: string, 
        quantity: number, 
        source: 'purchase' | 'discovery' | 'crafting' | 'reward'
    ): UnifiedInventoryItem | null {
        // Try to find in ingredients first
        const ingredient = getIngredientById(id);
        if (ingredient) {
            return {
                id: ingredient.id,
                name: ingredient.name,
                description: ingredient.description,
                image: ingredient.image,
                rarity: ingredient.rarity,
                cost: ingredient.cost,
                quantity,
                dateAdded: new Date(),
                type: 'ingredient',
                source,
                metadata: {
                    moodBonus: ingredient.moodBonus,
                    hungerBonus: ingredient.hungerBonus,
                    energyBonus: ingredient.energyBonus
                }
            };
        }

        // Try to find in marketplace items (fallback)
        // This would typically come from MarketplaceService
        return {
            id,
            name: id, // Fallback name
            description: 'Item from marketplace',
            image: `${id}.png`,
            rarity: 'common',
            cost: 0,
            quantity,
            dateAdded: new Date(),
            type: 'marketplace',
            source,
            metadata: {}
        };
    }

    public async getInventory(): Promise<UnifiedInventoryItem[]> {
        try {
            const stored = await AsyncStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load inventory:', error);
            return [];
        }
    }

    private async saveInventory(inventory: UnifiedInventoryItem[]): Promise<void> {
        try {
            await AsyncStorage.setItem(this.storageKey, JSON.stringify(inventory));
        } catch (error) {
            console.error('Failed to save inventory:', error);
        }
    }

    // Initialize with default ingredients (for testing/demo)
    public async initializeWithDefaultIngredients(): Promise<void> {
        const currentInventory = await this.getInventory();
        if (currentInventory.length === 0) {
            const defaultItems = INGREDIENTS.map(ingredient => ({
                id: ingredient.id,
                quantity: 3, // Start with 3 of each
                source: 'reward' as const
            }));
            
            await this.addToInventory(defaultItems);
        }
    }

    // Clear inventory (for testing/reset)
    public async clearInventory(): Promise<void> {
        await this.saveInventory([]);
        this.notifyListeners([]);
    }

    // Public method to get current inventory state (for hooks)
    public async getCurrentInventory(): Promise<UnifiedInventoryItem[]> {
        return await this.getInventory();
    }

    // Public method to get inventory for external services
    public async getInventoryForServices(): Promise<UnifiedInventoryItem[]> {
        return await this.getInventory();
    }
}
