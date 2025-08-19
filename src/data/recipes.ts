import { Recipe } from '../types/GameTypes';

// New recipe system using only actual ingredients with image assets
export const RECIPES: Recipe[] = [
    // 2-Star Recipes (Common - 2-3 common ingredients only)
    {
        id: 'sweet-berry-delight',
        name: 'Sweet Berry Delight',
        description: 'A delightful treat combining pink sugar and mira berries',
        ingredients: [
            { id: 'pink-sugar', quantity: 2 },
            { id: 'mira-berry', quantity: 1 }
        ],
        result: {
            id: 'sweet-berry-delight',
            name: 'Sweet Berry Delight',
            description: 'A sweet and nutritious treat that boosts mood and energy',
            image: 'sweet-berry-delight.png'
        },
        starRating: 2,
        difficulty: 'easy'
    },
    {
        id: 'stellar-egg-bowl',
        name: 'Stellar Egg Bowl',
        description: 'A nutritious bowl with nova eggs and berries',
        ingredients: [
            { id: 'nova-egg', quantity: 2 },
            { id: 'mira-berry', quantity: 1 },
            { id: 'pink-sugar', quantity: 1 }
        ],
        result: {
            id: 'stellar-egg-bowl',
            name: 'Stellar Egg Bowl',
            description: 'A cosmic breakfast bowl that provides balanced nutrition',
            image: 'stellar-egg-bowl.png'
        },
        starRating: 2,
        difficulty: 'easy'
    },

    // 3-Star Recipes (Uncommon - 3 ingredients, mix of common ingredients with higher quantities)
    {
        id: 'cosmic-sugar-feast',
        name: 'Cosmic Sugar Feast',
        description: 'A luxurious treat made with premium quantities of pink sugar',
        ingredients: [
            { id: 'pink-sugar', quantity: 3 },
            { id: 'mira-berry', quantity: 1 },
            { id: 'nova-egg', quantity: 1 }
        ],
        result: {
            id: 'cosmic-sugar-feast',
            name: 'Cosmic Sugar Feast',
            description: 'An exquisite treat that provides exceptional mood and energy boosts',
            image: 'cosmic-sugar-feast.png'
        },
        starRating: 3,
        difficulty: 'medium'
    },
    {
        id: 'nova-berry-soup',
        name: 'Nova Berry Soup',
        description: 'A magical soup enhanced with nova eggs and berries',
        ingredients: [
            { id: 'nova-egg', quantity: 2 },
            { id: 'mira-berry', quantity: 2 },
            { id: 'pink-sugar', quantity: 1 }
        ],
        result: {
            id: 'nova-berry-soup',
            name: 'Nova Berry Soup',
            description: 'A mystical soup that provides incredible energy and satisfaction',
            image: 'nova-berry-soup.png'
        },
        starRating: 3,
        difficulty: 'medium'
    },

    // 4-Star Recipes (Rare - 4-5 ingredients, high quantities of common ingredients)
    {
        id: 'stellar-mega-feast',
        name: 'Stellar Mega Feast',
        description: 'A legendary feast requiring maximum quantities of all ingredients',
        ingredients: [
            { id: 'pink-sugar', quantity: 3 },
            { id: 'nova-egg', quantity: 3 },
            { id: 'mira-berry', quantity: 3 }
        ],
        result: {
            id: 'stellar-mega-feast',
            name: 'Stellar Mega Feast',
            description: 'A legendary feast that provides maximum satisfaction and rare bonuses',
            image: 'stellar-mega-feast.png'
        },
        starRating: 4,
        difficulty: 'expert'
    },
    {
        id: 'cosmic-ultimate-elixir',
        name: 'Cosmic Ultimate Elixir',
        description: 'A mystical elixir powered by all ingredients in perfect balance',
        ingredients: [
            { id: 'pink-sugar', quantity: 3 },
            { id: 'nova-egg', quantity: 2 },
            { id: 'mira-berry', quantity: 2 }
        ],
        result: {
            id: 'cosmic-ultimate-elixir',
            name: 'Cosmic Ultimate Elixir',
            description: 'A powerful elixir that provides legendary energy and hunger satisfaction',
            image: 'cosmic-ultimate-elixir.png'
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

// Get recipes by rarity tier
export const getCommonRecipes = (): Recipe[] => {
    return getTwoStarRecipes();
};

export const getUncommonRecipes = (): Recipe[] => {
    return getThreeStarRecipes();
};

export const getRareRecipes = (): Recipe[] => {
    return getFourStarRecipes();
};
