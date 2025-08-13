import { Recipe } from '../types/GameTypes';

// Centralized recipe data with star rating system
// Only includes recipes that use ingredients we actually have
export const RECIPES: Recipe[] = [
    // 1-Star Recipes (Simple - 2-3 common ingredients only)
    {
        id: 'basic-soup',
        name: 'Basic Soup',
        description: 'Simple soup made with basic ingredients',
        ingredients: [
            { id: 'pink-sugar', quantity: 1 },
            { id: 'nova-egg', quantity: 1 },
            { id: 'mira-berry', quantity: 1 }
        ],
        result: {
            id: 'basic-soup',
            name: 'Basic Soup',
            description: 'A simple soup that provides basic nutrition',
            image: 'basic-soup.png'
        },
        starRating: 1,
        difficulty: 'easy'
    },
    {
        id: 'sweet-treat',
        name: 'Sweet Treat',
        description: 'A sweet treat made with pink sugar',
        ingredients: [
            { id: 'pink-sugar', quantity: 2 }
        ],
        result: {
            id: 'sweet-treat',
            name: 'Sweet Treat',
            description: 'A sweet treat that provides basic mood boost',
            image: 'sweet-treat.png'
        },
        starRating: 1,
        difficulty: 'easy'
    },
    {
        id: 'berry-egg-bowl',
        name: 'Berry Egg Bowl',
        description: 'A nutritious bowl with berries and eggs',
        ingredients: [
            { id: 'mira-berry', quantity: 2 },
            { id: 'nova-egg', quantity: 1 }
        ],
        result: {
            id: 'berry-egg-bowl',
            name: 'Berry Egg Bowl',
            description: 'A nutritious bowl that provides balanced nutrition',
            image: 'berry-egg-bowl.png'
        },
        starRating: 1,
        difficulty: 'easy'
    },

    // 2-Star Recipes (Mix of common ingredients with higher quantities)
    {
        id: 'deluxe-soup',
        name: 'Deluxe Soup',
        description: 'An enhanced soup with premium ingredients',
        ingredients: [
            { id: 'pink-sugar', quantity: 2 },
            { id: 'nova-egg', quantity: 2 },
            { id: 'mira-berry', quantity: 2 }
        ],
        result: {
            id: 'deluxe-soup',
            name: 'Deluxe Soup',
            description: 'An enhanced soup that provides better nutrition',
            image: 'deluxe-soup.png'
        },
        starRating: 2,
        difficulty: 'medium'
    },
    {
        id: 'sugar-berry-feast',
        name: 'Sugar Berry Feast',
        description: 'A feast combining sugar and berries',
        ingredients: [
            { id: 'pink-sugar', quantity: 3 },
            { id: 'mira-berry', quantity: 3 }
        ],
        result: {
            id: 'sugar-berry-feast',
            name: 'Sugar Berry Feast',
            description: 'A feast that provides excellent mood boost',
            image: 'sugar-berry-feast.png'
        },
        starRating: 2,
        difficulty: 'medium'
    },

    // 3-Star Recipes (High quantities of common ingredients)
    {
        id: 'mega-feast',
        name: 'Mega Feast',
        description: 'A massive feast with all ingredients',
        ingredients: [
            { id: 'pink-sugar', quantity: 4 },
            { id: 'nova-egg', quantity: 4 },
            { id: 'mira-berry', quantity: 4 }
        ],
        result: {
            id: 'mega-feast',
            name: 'Mega Feast',
            description: 'A massive feast that provides maximum satisfaction',
            image: 'mega-feast.png'
        },
        starRating: 3,
        difficulty: 'hard'
    },

    // 4-Star Recipes (Maximum quantities for legendary status)
    {
        id: 'legendary-feast',
        name: 'Legendary Feast',
        description: 'The ultimate feast requiring maximum ingredients',
        ingredients: [
            { id: 'pink-sugar', quantity: 5 },
            { id: 'nova-egg', quantity: 5 },
            { id: 'mira-berry', quantity: 5 }
        ],
        result: {
            id: 'legendary-feast',
            name: 'Legendary Feast',
            description: 'The ultimate feast that provides legendary satisfaction',
            image: 'legendary-feast.png'
        },
        starRating: 4,
        difficulty: 'expert'
    }
];

// Helper functions for recipe management
export const getRecipeById = (id: string): Recipe | undefined => {
    return RECIPES.find(recipe => recipe.id === id);
};

export const getRecipesByStarRating = (starRating: Recipe['starRating']): Recipe[] => {
    return RECIPES.filter(recipe => recipe.starRating === starRating);
};

export const getRecipesByDifficulty = (difficulty: Recipe['difficulty']): Recipe[] => {
    return RECIPES.filter(recipe => recipe.difficulty === difficulty);
};

export const getOneStarRecipes = (): Recipe[] => {
    return getRecipesByStarRating(1);
};

export const getTwoStarRecipes = (): Recipe[] => {
    return getRecipesByStarRating(2);
};

export const getThreeStarRecipes = (): Recipe[] => {
    return getRecipesByStarRating(3);
};

export const getFourStarRecipes = (): Recipe[] => {
    return getRecipesByStarRating(4);
};

export const getEasyRecipes = (): Recipe[] => {
    return getRecipesByDifficulty('easy');
};

export const getMediumRecipes = (): Recipe[] => {
    return getRecipesByDifficulty('medium');
};

export const getHardRecipes = (): Recipe[] => {
    return getRecipesByDifficulty('hard');
};

export const getExpertRecipes = (): Recipe[] => {
    return getRecipesByDifficulty('expert');
};

// Recipe validation helper
export const canCraftRecipe = (recipe: Recipe, availableIngredients: { id: string; quantity: number }[]): boolean => {
    return recipe.ingredients.every(required => {
        const available = availableIngredients.find(avail => avail.id === required.id);
        return available && available.quantity >= required.quantity;
    });
};

// Get recipes that can be crafted with available ingredients
export const getCraftableRecipes = (availableIngredients: { id: string; quantity: number }[]): Recipe[] => {
    return RECIPES.filter(recipe => canCraftRecipe(recipe, availableIngredients));
};
