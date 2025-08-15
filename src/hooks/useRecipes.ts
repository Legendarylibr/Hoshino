import { useState, useEffect, useCallback } from 'react';
import { Recipe } from '../types/GameTypes';
import { RecipeService, CraftingResult, CraftingProgress } from '../services/RecipeService';
import { useInventory } from './useInventory';

export const useRecipes = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [craftableRecipes, setCraftableRecipes] = useState<Recipe[]>([]);
    const [activeCrafting, setActiveCrafting] = useState<CraftingProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const recipeService = RecipeService.getInstance();
    const { inventory } = useInventory();

    // Load recipes on mount
    useEffect(() => {
        const loadRecipes = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const allRecipes = recipeService.getAllRecipes();
                setRecipes(allRecipes);
                
                const craftable = await recipeService.getCraftableRecipes();
                setCraftableRecipes(craftable);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load recipes');
                console.error('Failed to load recipes:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadRecipes();
    }, [recipeService]);

    // Update craftable recipes when inventory changes
    useEffect(() => {
        const updateCraftableRecipes = async () => {
            try {
                const craftable = await recipeService.getCraftableRecipes();
                setCraftableRecipes(craftable);
            } catch (err) {
                console.error('Failed to update craftable recipes:', err);
            }
        };

        updateCraftableRecipes();
    }, [inventory, recipeService]);

    // Update active crafting progress
    useEffect(() => {
        const interval = setInterval(() => {
            const active = recipeService.getActiveCrafting();
            setActiveCrafting(active);
        }, 100);

        return () => clearInterval(interval);
    }, [recipeService]);

    // Get recipes by star rating
    const getRecipesByStarRating = useCallback((starRating: Recipe['starRating']) => {
        return recipeService.getRecipesByStarRating(starRating);
    }, [recipeService]);

    // Get recipes by difficulty
    const getRecipesByDifficulty = useCallback((difficulty: Recipe['difficulty']) => {
        return recipeService.getRecipesByDifficulty(difficulty);
    }, [recipeService]);

    // Check if a recipe can be crafted
    const canCraftRecipe = useCallback(async (recipeId: string) => {
        try {
            return await recipeService.canCraftRecipe(recipeId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to check recipe crafting');
            console.error('Failed to check recipe crafting:', err);
            return false;
        }
    }, [recipeService]);

    // Get recipe requirements
    const getRecipeRequirements = useCallback(async (recipeId: string) => {
        try {
            return await recipeService.getRecipeRequirements(recipeId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get recipe requirements');
            console.error('Failed to get recipe requirements:', err);
            return null;
        }
    }, [recipeService]);

    // Craft a recipe
    const craftRecipe = useCallback(async (recipeId: string): Promise<CraftingResult | null> => {
        try {
            setError(null);
            const result = await recipeService.craftRecipe(recipeId);
            
            // Refresh craftable recipes after crafting
            const craftable = await recipeService.getCraftableRecipes();
            setCraftableRecipes(craftable);
            
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to craft recipe');
            console.error('Failed to craft recipe:', err);
            return null;
        }
    }, [recipeService]);

    // Start timed crafting
    const startTimedCrafting = useCallback(async (recipeId: string, craftingTime: number = 5000) => {
        try {
            setError(null);
            const progress = await recipeService.startTimedCrafting(recipeId, craftingTime);
            return progress;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start timed crafting');
            console.error('Failed to start timed crafting:', err);
            return null;
        }
    }, [recipeService]);

    // Cancel crafting
    const cancelCrafting = useCallback((recipeId: string) => {
        try {
            const success = recipeService.cancelCrafting(recipeId);
            if (success) {
                setActiveCrafting(prev => prev.filter(crafting => crafting.recipeId !== recipeId));
            }
            return success;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cancel crafting');
            console.error('Failed to cancel crafting:', err);
            return false;
        }
    }, [recipeService]);

    // Get recipe suggestions
    const getRecipeSuggestions = useCallback(async () => {
        try {
            return await recipeService.getRecipeSuggestions();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get recipe suggestions');
            console.error('Failed to get recipe suggestions:', err);
            return null;
        }
    }, [recipeService]);

    // Get recipe by ID
    const getRecipeById = useCallback((recipeId: string) => {
        return recipeService.getRecipeById(recipeId);
    }, [recipeService]);

    // Search recipes
    const searchRecipes = useCallback((query: string) => {
        try {
            return recipeService.searchRecipes(query);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search recipes');
            console.error('Failed to search recipes:', err);
            return [];
        }
    }, [recipeService]);

    // Get recipe statistics
    const getRecipeStats = useCallback(() => {
        try {
            return recipeService.getRecipeStats();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get recipe stats');
            console.error('Failed to get recipe stats:', err);
            return null;
        }
    }, [recipeService]);

    // Validate recipe
    const validateRecipe = useCallback((recipe: Recipe) => {
        try {
            return recipeService.validateRecipe(recipe);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to validate recipe');
            console.error('Failed to validate recipe:', err);
            return { isValid: false, errors: ['Validation failed'] };
        }
    }, [recipeService]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // State
        recipes,
        craftableRecipes,
        activeCrafting,
        isLoading,
        error,
        
        // Actions
        craftRecipe,
        startTimedCrafting,
        cancelCrafting,
        
        // Getters
        getRecipesByStarRating,
        getRecipesByDifficulty,
        canCraftRecipe,
        getRecipeRequirements,
        getRecipeSuggestions,
        getRecipeById,
        searchRecipes,
        getRecipeStats,
        validateRecipe,
        
        // Utilities
        clearError,
    };
};
