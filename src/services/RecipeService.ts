import { Recipe } from '../types/GameTypes';
import { RECIPES, canCraftRecipe, getCraftableRecipes } from '../data/recipes';
import { InventoryService } from './InventoryService';

export interface CraftingResult {
    success: boolean;
    recipe: Recipe;
    consumedIngredients: Array<{ id: string; quantity: number }>;
    craftedItem: {
        id: string;
        name: string;
        description: string;
        image: string;
    };
    message: string;
}

export interface CraftingProgress {
    recipeId: string;
    progress: number; // 0-100
    timeRemaining: number; // milliseconds
    isComplete: boolean;
}

export class RecipeService {
    private static instance: RecipeService;
    private inventoryService: InventoryService;
    private activeCrafting: Map<string, CraftingProgress> = new Map();

    private constructor() {
        this.inventoryService = InventoryService.getInstance();
    }

    static getInstance(): RecipeService {
        if (!RecipeService.instance) {
            RecipeService.instance = new RecipeService();
        }
        return RecipeService.instance;
    }

    // Get all available recipes
    getAllRecipes(): Recipe[] {
        return [...RECIPES];
    }

    // Get recipes by star rating
    getRecipesByStarRating(starRating: Recipe['starRating']): Recipe[] {
        return RECIPES.filter(recipe => recipe.starRating === starRating);
    }

    // Get recipes by difficulty
    getRecipesByDifficulty(difficulty: Recipe['difficulty']): Recipe[] {
        return RECIPES.filter(recipe => recipe.difficulty === difficulty);
    }

    // Get recipes that can be crafted with current inventory
    async getCraftableRecipes(): Promise<Recipe[]> {
        return await this.inventoryService.getCraftableRecipes();
    }

    // Check if a specific recipe can be crafted
    async canCraftRecipe(recipeId: string): Promise<boolean> {
        const recipe = RECIPES.find(r => r.id === recipeId);
        if (!recipe) return false;
        
        return await this.inventoryService.canCraftRecipe(recipe);
    }

    // Get recipe requirements and current inventory status
    async getRecipeRequirements(recipeId: string): Promise<{
        recipe: Recipe;
        requirements: Array<{
            ingredientId: string;
            required: number;
            available: number;
            canCraft: boolean;
        }>;
        canCraft: boolean;
    }> {
        const recipe = RECIPES.find(r => r.id === recipeId);
        if (!recipe) {
            throw new Error(`Recipe not found: ${recipeId}`);
        }

        const inventory = await this.inventoryService.getInventoryForServices();
        const requirements = recipe.ingredients.map(required => {
            const available = inventory.find(item => item.id === required.id);
            const availableQuantity = available ? available.quantity : 0;
            
            return {
                ingredientId: required.id,
                required: required.quantity,
                available: availableQuantity,
                canCraft: availableQuantity >= required.quantity
            };
        });

        const canCraft = requirements.every(req => req.canCraft);

        return {
            recipe,
            requirements,
            canCraft
        };
    }

    // Craft a recipe (instant crafting)
    async craftRecipe(recipeId: string): Promise<CraftingResult> {
        const recipe = RECIPES.find(r => r.id === recipeId);
        if (!recipe) {
            return {
                success: false,
                recipe: {} as Recipe,
                consumedIngredients: [],
                craftedItem: {} as any,
                message: 'Recipe not found'
            };
        }

        try {
            // Check if we can craft
            const canCraft = await this.inventoryService.canCraftRecipe(recipe);
            if (!canCraft) {
                return {
                    success: false,
                    recipe,
                    consumedIngredients: [],
                    craftedItem: recipe.result,
                    message: 'Not enough ingredients to craft this recipe'
                };
            }

            // Craft the recipe using inventory service
            const success = await this.inventoryService.craftRecipe(recipe);
            
            if (success) {
                return {
                    success: true,
                    recipe,
                    consumedIngredients: recipe.ingredients,
                    craftedItem: recipe.result,
                    message: `Successfully crafted ${recipe.result.name}!`
                };
            } else {
                return {
                    success: false,
                    recipe,
                    consumedIngredients: [],
                    craftedItem: recipe.result,
                    message: 'Failed to craft recipe'
                };
            }
        } catch (error) {
            console.error('Error crafting recipe:', error);
            return {
                success: false,
                recipe,
                consumedIngredients: [],
                craftedItem: recipe.result,
                message: 'An error occurred while crafting'
            };
        }
    }

    // Start a timed crafting process (for future enhancement)
    async startTimedCrafting(recipeId: string, craftingTime: number = 5000): Promise<CraftingProgress> {
        const recipe = RECIPES.find(r => r.id === recipeId);
        if (!recipe) {
            throw new Error(`Recipe not found: ${recipeId}`);
        }

        // Check if we can craft
        const canCraft = await this.inventoryService.canCraftRecipe(recipe);
        if (!canCraft) {
            throw new Error('Not enough ingredients to craft this recipe');
        }

        // Create crafting progress
        const progress: CraftingProgress = {
            recipeId,
            progress: 0,
            timeRemaining: craftingTime,
            isComplete: false
        };

        this.activeCrafting.set(recipeId, progress);

        // Simulate crafting time
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, craftingTime - elapsed);
            const progressPercent = Math.min(100, (elapsed / craftingTime) * 100);

            if (progress) {
                progress.progress = progressPercent;
                progress.timeRemaining = remaining;

                if (progressPercent >= 100) {
                    progress.isComplete = true;
                    clearInterval(interval);
                    this.activeCrafting.delete(recipeId);
                    
                    // Complete the crafting
                    this.completeTimedCrafting(recipeId);
                }
            }
        }, 100);

        return progress;
    }

    // Complete a timed crafting process
    private async completeTimedCrafting(recipeId: string): Promise<void> {
        try {
            const recipe = RECIPES.find(r => r.id === recipeId);
            if (!recipe) return;

            // Craft the recipe
            await this.inventoryService.craftRecipe(recipe);
        } catch (error) {
            console.error('Error completing timed crafting:', error);
        }
    }

    // Get active crafting progress
    getActiveCrafting(): CraftingProgress[] {
        return Array.from(this.activeCrafting.values());
    }

    // Cancel active crafting
    cancelCrafting(recipeId: string): boolean {
        return this.activeCrafting.delete(recipeId);
    }

    // Get recipe suggestions based on available ingredients
    async getRecipeSuggestions(): Promise<{
        easy: Recipe[];
        medium: Recipe[];
        hard: Recipe[];
        expert: Recipe[];
    }> {
        const craftable = await this.getCraftableRecipes();
        
        return {
            easy: craftable.filter(r => r.difficulty === 'easy'),
            medium: craftable.filter(r => r.difficulty === 'medium'),
            hard: craftable.filter(r => r.difficulty === 'hard'),
            expert: craftable.filter(r => r.difficulty === 'expert')
        };
    }

    // Get recipe by ID
    getRecipeById(recipeId: string): Recipe | undefined {
        return RECIPES.find(r => r.id === recipeId);
    }

    // Search recipes by name or description
    searchRecipes(query: string): Recipe[] {
        const lowerQuery = query.toLowerCase();
        return RECIPES.filter(recipe => 
            recipe.name.toLowerCase().includes(lowerQuery) ||
            recipe.description.toLowerCase().includes(lowerQuery)
        );
    }

    // Get recipe statistics
    getRecipeStats(): {
        totalRecipes: number;
        byDifficulty: Record<string, number>;
        byStarRating: Record<number, number>;
    } {
        const byDifficulty: Record<string, number> = {};
        const byStarRating: Record<number, number> = {};

        RECIPES.forEach(recipe => {
            byDifficulty[recipe.difficulty] = (byDifficulty[recipe.difficulty] || 0) + 1;
            byStarRating[recipe.starRating] = (byStarRating[recipe.starRating] || 0) + 1;
        });

        return {
            totalRecipes: RECIPES.length,
            byDifficulty,
            byStarRating
        };
    }

    // Validate recipe data
    validateRecipe(recipe: Recipe): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (!recipe.id || !recipe.name || !recipe.description) {
            errors.push('Recipe must have id, name, and description');
        }

        if (!recipe.ingredients || recipe.ingredients.length === 0) {
            errors.push('Recipe must have at least one ingredient');
        }

        if (!recipe.result || !recipe.result.id || !recipe.result.name) {
            errors.push('Recipe must have a valid result');
        }

        if (!recipe.starRating || recipe.starRating < 1 || recipe.starRating > 4) {
            errors.push('Recipe must have a valid star rating (1-4)');
        }

        if (!recipe.difficulty || !['easy', 'medium', 'hard', 'expert'].includes(recipe.difficulty)) {
            errors.push('Recipe must have a valid difficulty level');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
